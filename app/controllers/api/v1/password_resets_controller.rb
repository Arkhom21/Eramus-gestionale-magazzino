class Api::V1::PasswordResetsController < ApplicationController
  skip_before_action :authorized

  # Richiesta di reset
  def create
    user = User.find_by(email: params[:email])
    if user
      token = user.generate_password_reset_token!
      # Nel progetto reale qui invieremmo l'email, per ora restituiamo il token
      render json: { message: "Token generato con successo", reset_token: token }, status: :ok
    else
      render json: { error: "Email non trovata" }, status: :not_found
    end
  end

  # 2. Cambio password effettivo (L'utente usa il token ricevuto)
  def update
    reset_record = PasswordReset.find_by(token: params[:token], stato: "attivo")

    if reset_record && reset_record.data_scadenza > Time.current
      user = reset_record.user
      if user.update(password: params[:password])
        reset_record.update(stato: "usato") # Disabilitiamo il token usato
        render json: { message: "Password aggiornata correttamente" }, status: :ok
      else
        render json: { error: user.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: "Token non valido o scaduto" }, status: :unauthorized
    end
  end
end
