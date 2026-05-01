class Api::V1::AuthenticationController < ApplicationController
  skip_before_action :authorized, only: [:login] 

  def login
    @user = User.find_by(username: params[:username])

    if @user && @user.active? && @user.authenticate(params[:password])
      token = encode_token({ user_id: @user.id })
      @user.record_login_attempt(true)
      
      AccessLog.create(user: @user, data_accesso: Time.current, esito: 'Successo', indirizzo_ip: request.remote_ip)
      
      render json: { user: @user, token: token }, status: :ok
    else

      if @user
        @user.record_login_attempt(false)
        AccessLog.create(user: @user, data_accesso: Time.current, esito: 'Fallito', indirizzo_ip: request.remote_ip)
      end
      
      render json: { error: 'Credenziali non valide o account bloccato' }, status: :unauthorized
    end
  end

  private

  def encode_token(payload)
    payload[:exp] = 24.hours.from_now.to_i
    JWT.encode(payload, Rails.application.secret_key_base)
  end
end