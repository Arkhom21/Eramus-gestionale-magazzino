class User < ApplicationRecord
  has_secure_password

  belongs_to :role
  has_many :access_logs
  has_many :products
  has_many :stock_movements

  MAX_LOGIN_ATTEMPTS = 5

  validates :username, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }

  def active?
    stato_account == 'Attivo'
  end

  def lock!
    update(stato_account: 'Bloccato')
  end

  def record_login_attempt(success)
    if success
      update(tentativi_login_falliti: 0, ultimo_login: Time.current)
    else
      increment!(:tentativi_login_falliti)
      lock! if tentativi_login_falliti >= MAX_LOGIN_ATTEMPTS
    end
  end

  # reset password
  def generate_password_reset_token!
    token = SecureRandom.urlsafe_base64
    
    PasswordReset.create!(
      user: self,
      token: token,
      data_richiesta: Time.current,
      data_scadenza: 1.hours.from_now,
      stato: 'attivo'
    )
    token
  end

end