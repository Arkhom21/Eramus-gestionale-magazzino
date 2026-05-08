class UserMailer < ApplicationMailer
  default from: 'noreply@eramus.it'

  def welcome_email(user)
    @user = user
    registra_notifica(user.email, 'Benvenuto in ERAMUS', 'Nuovo Utente')
    mail(to: @user.email, subject: 'Benvenuto in ERAMUS')
  end

  def password_reset_email(user, token)
    @user      = user
    @token     = token
    @reset_url = "http://localhost:3001/reset-password?token=#{token}"
    registra_notifica(user.email, 'Reset Password ERAMUS', 'Reset Password')
    mail(to: @user.email, subject: 'Reset Password ERAMUS')
  end

  def threshold_notification(product, admin)
    @product = product
    @admin   = admin
    registra_notifica(admin.email, "Scorta minima raggiunta: #{product.nome_oggetto}", 'Soglia Minima')
    mail(to: admin.email, subject: "Scorta minima raggiunta: #{product.nome_oggetto}")
  end

  private

  def registra_notifica(destinatario, oggetto, tipo_evento)
    EmailNotification.create!(
      destinatario: destinatario,
      oggetto:      oggetto,
      tipo_evento:  tipo_evento
    )
  end
end