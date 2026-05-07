class ApplicationController < ActionController::API
  before_action :authorized

  # Access Token (15 minuti) 
  ACCESS_TOKEN_EXP  = 15.minutes
  # Refresh Token (7 giorni) 
  REFRESH_TOKEN_EXP = 7.days

  def encode_token(payload, exp: ACCESS_TOKEN_EXP)
    payload[:exp] = exp.from_now.to_i
    JWT.encode(payload, Rails.application.secret_key_base, 'HS256')
  end

  def encode_refresh_token(user_id)
    encode_token({ user_id: user_id, type: 'refresh' }, exp: REFRESH_TOKEN_EXP)
  end

  def auth_header
    request.headers['Authorization']
  end

  def decoded_token
    return nil unless auth_header
    token = auth_header.split(' ')[1]
    begin
      JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256')
    rescue JWT::ExpiredSignature
      render json: { error: 'Token scaduto', code: 'TOKEN_EXPIRED' }, status: :unauthorized
      nil
    rescue JWT::DecodeError
      nil
    end
  end

  def logged_in_user
    return @current_user if defined?(@current_user)
    if decoded_token
      # Blocca i refresh token dall'accesso alle rotte normali
      return nil if decoded_token[0]['type'] == 'refresh'
      user_id = decoded_token[0]['user_id']
      @current_user = User.find_by(id: user_id)
    end
  end

  def logged_in?
    !!logged_in_user
  end

  def authorized
    unless logged_in?
      render json: { message: 'Per favore, effettua il login' }, status: :unauthorized unless performed?
    end
  end
end