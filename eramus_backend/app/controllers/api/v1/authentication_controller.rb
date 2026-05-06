class Api::V1::AuthenticationController < ApplicationController
  skip_before_action :authorized

  def login
    user = User.find_by(username: params[:username])

    if user&.authenticate(params[:password])
      if user.active?
        user.record_login_attempt(true)

        # registrazione
        AccessLog.create!(
          user: user,
          ip_address: request.remote_ip, 
          data_ora: Time.current,        
          esito: "Successo"             
        )

        token = encode_token({ user_id: user.id })
        render json: { user: user, jwt: token }, status: :accepted
      else
        render json: { error: "Account bloccato o disattivato." }, status: :unauthorized
      end
    else
      user&.record_login_attempt(false)
      render json: { error: "Credenziali non valide" }, status: :unauthorized
    end
  end
end
