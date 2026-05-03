class User < ApplicationRecord
  has_secure_password

  belongs_to :role
  has_many :access_logs
  has_many :products
  has_many :stock_movements
  has_many :password_resets # Aggiungi questa associazione

  MAX_LOGIN_ATTEMPTS = 5

  # Validazioni di base
  validates :username, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }

  # Punto 4.1: Password conforme AGID (min 8 caratteri, 1 maiuscola, 1 numero, 1 speciale)
  validates :password, format: {
    with: /\A(?=.*[A-Z])(?=.*\d)(?=.*[[:^alnum:]]).{8,}\z/,
    message: "deve contenere almeno 8 caratteri, una maiuscola, un numero e un carattere speciale"
  }, if: -> { password.present? }

  # --- SCOPES (Per pulire i Controller) ---

  # Per la ricerca nel punto 4.3
  scope :cerca, ->(query) {
    where("username ILIKE :q OR email ILIKE :q", q: "%#{query}%") if query.present?
  }

  # Per filtrare gli utenti nella gestione amministrativa[cite: 1]
  scope :attivi, -> { where(stato_account: "Attivo") }
  scope :bloccati, -> { where(stato_account: "Bloccato") }

  # --- LOGICA DI BUSINESS ---[cite: 1]

  def active?
    stato_account == "Attivo"
  end

  def lock!
    update(stato_account: "Bloccato")
  end

  def record_login_attempt(success)
    if success
      update(tentativi_login_falliti: 0, ultimo_login: Time.current)
    else
      increment!(:tentativi_login_falliti)
      lock! if tentativi_login_falliti >= MAX_LOGIN_ATTEMPTS
    end
  end

  # Punto 4.1: Reset password[cite: 1]
  def generate_password_reset_token!
    token = SecureRandom.urlsafe_base64
    password_resets.create!( # Usa l'associazione
      token: token,
      data_richiesta: Time.current,
      data_scadenza: 1.hour.from_now, # Requisito PDF: 1 ora[cite: 1]
      stato: "attivo"
    )
    token
  end

  # Helper per il punto 4.3: Controllo Admin[cite: 1]
  def admin?
    role&.nome_ruolo == "Admin"
  end
end
