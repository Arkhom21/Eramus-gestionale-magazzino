class UserMailer < ApplicationMailer
  default from: 'noreply@eramus.it'

  def welcome_email(user)
    @user = user
    mail(
      to:      @user.email,
      subject: 'Benvenuto in ERAMUS'
    )
  end

  def password_reset_email(user, token)
    @user  = user
    @token = token
    @reset_url = "http://localhost:3001/reset-password?token=#{token}"
    mail(
      to:      @user.email,
      subject: 'Reset Password ERAMUS'
    )
  end
end