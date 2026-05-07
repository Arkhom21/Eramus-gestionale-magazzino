class Api::V1::AuthenticationController < ApplicationController
  skip_before_action :authorized, only: [:login, :refresh]

  # POST /api/v1/login
  def login
    user = User.find_by(username: params[:username])

    if user&.authenticate(params[:password])
      if user.active?
        user.record_login_attempt(true)

        AccessLog.create!(
          user:       user,
          ip_address: request.remote_ip,
          data_ora:   Time.current,
          esito:      'Successo'
        )

        access_token  = encode_token({ user_id: user.id })
        refresh_token = encode_refresh_token(user.id)

        render json: {
          user:          user.as_json(include: { role: { only: [:nome_ruolo] } }),
          access_token:  access_token,
          refresh_token: refresh_token,
          expires_in:    ACCESS_TOKEN_EXP.to_i
        }, status: :accepted
      else
        render json: { error: 'Account bloccato o disattivato.' }, status: :unauthorized
      end
    else
      user&.record_login_attempt(false)

      AccessLog.create!(
        user:       user,
        ip_address: request.remote_ip,
        data_ora:   Time.current,
        esito:      'Fallito'
      ) if user

      render json: { error: 'Credenziali non valide' }, status: :unauthorized
    end
  end

  # POST /api/v1/refresh
  def refresh
    token = auth_header&.split(' ')&.last
    return render json: { error: 'Refresh token mancante' }, status: :unauthorized unless token

    begin
      decoded = JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256')
      payload = decoded[0]

      unless payload['type'] == 'refresh'
        return render json: { error: 'Token non valido per il refresh' }, status: :unauthorized
      end

      user = User.find_by(id: payload['user_id'])
      return render json: { error: 'Utente non trovato' }, status: :unauthorized unless user
      return render json: { error: 'Account bloccato' }, status: :unauthorized unless user.active?

      new_access  = encode_token({ user_id: user.id })
      new_refresh = encode_refresh_token(user.id)

      render json: {
        access_token:  new_access,
        refresh_token: new_refresh,
        expires_in:    ACCESS_TOKEN_EXP.to_i
      }, status: :ok

    rescue JWT::ExpiredSignature
      render json: { error: 'Sessione scaduta, effettua nuovamente il login' }, status: :unauthorized
    rescue JWT::DecodeError
      render json: { error: 'Token non valido' }, status: :unauthorized
    end
  end
end