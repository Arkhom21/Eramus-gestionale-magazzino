class User < ApplicationRecord
  has_secure_password

  def as_json(options = {})
    super(options).except('password_digest')
  end


  belongs_to :role
  has_many :access_logs
  has_many :products
  has_many :stock_movements
  has_many :password_resets

  MAX_LOGIN_ATTEMPTS = 5

  # Validazioni
  validates :username, presence: true, uniqueness: true
  validates :email,    presence: true, uniqueness: true,
                       format: { with: URI::MailTo::EMAIL_REGEXP }

  # Password conforme AGID: min 8 caratteri, 1 maiuscola, 1 numero, 1 speciale
  validates :password, format: {
    with:    /\A(?=.*[A-Z])(?=.*\d)(?=.*[[:^alnum:]]).{8,}\z/,
    message: 'deve contenere almeno 8 caratteri, una maiuscola, un numero e un carattere speciale'
  }, if: -> { password.present? }

  # ── Scopes ──────────────────────────────────────────────────────────────────
  scope :cerca, ->(query) {
    where("username ILIKE :q OR email ILIKE :q", q: "%#{query}%") if query.present?
  }
  scope :attivi,   -> { where(stato_account: 'Attivo') }
  scope :bloccati, -> { where(stato_account: 'Bloccato') }

  # ── Stato account ────────────────────────────────────────────────────────────
  def active?
    stato_account&.downcase == 'attivo'
  end

  def lock!
    update(stato_account: 'Bloccato')
  end

  def disattiva!
    update(stato_account: 'Inattivo')
  end

  def record_login_attempt(success)
    if success
      update(tentativi_login_falliti: 0, ultimo_login: Time.current)
    else
      increment!(:tentativi_login_falliti)
      lock! if tentativi_login_falliti >= MAX_LOGIN_ATTEMPTS
    end
  end

  # ── Password reset ───────────────────────────────────────────────────────────
  def generate_password_reset_token!
    token = SecureRandom.urlsafe_base64
    password_resets.create!(
      token:            token,
      data_generazione: Time.current,
      data_scadenza:    1.hour.from_now,
      stato:            'attivo'
    )
    token
  end

  # ── Ruolo ────────────────────────────────────────────────────────────────────
  def admin?
    role&.nome_ruolo == 'Admin'
  end
end