class Api::V1::PasswordResetsController < ApplicationController
  skip_before_action :authorized

  def create
    user = User.find_by(email: params[:email])
    if user
      token = user.generate_password_reset_token!
      # Simulazione invio email come richiesto dal punto 4.1
      render json: { message: "Istruzioni inviate via email", reset_token: token }, status: :ok
    else
      render json: { message: "Istruzioni inviate via email" }, status: :ok # Sicurezza: non riveliamo se l'email esiste
    end
  end

  def update
    # Chiediamo al modello di trovare un record valido
    reset_record = PasswordReset.valido(params[:token]).first

    if reset_record
      user = reset_record.user
      if user.update(password: params[:password])
        reset_record.consuma!
        render json: { message: "Password aggiornata correttamente" }, status: :ok
      else
        render json: { error: user.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: "Token non valido o scaduto" }, status: :unauthorized
    end
  end
end
