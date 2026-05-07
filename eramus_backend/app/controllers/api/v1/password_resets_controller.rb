class Api::V1::PasswordResetsController < ApplicationController
  skip_before_action :authorized

  def create
    user = User.find_by(email: params[:email])
    if user
      token = user.generate_password_reset_token!
      UserMailer.password_reset_email(user, token).deliver_later
    end
    # Risposta generica per sicurezza — non rivela se l'email esiste
    render json: { message: 'Se l\'email è registrata, riceverai le istruzioni a breve.' }, status: :ok
  end

  def update
    reset_record = PasswordReset.valido(params[:token]).first

    if reset_record
      user = reset_record.user
      if user.update(password: params[:password])
        reset_record.consuma!
        render json: { message: 'Password aggiornata correttamente' }, status: :ok
      else
        render json: { error: user.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: 'Token non valido o scaduto' }, status: :unauthorized
    end
  end
end