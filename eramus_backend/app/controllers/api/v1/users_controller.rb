class Api::V1::UsersController < ApplicationController
  before_action :check_admin, only: [:create, :update, :destroy]

  # GET /api/v1/users
  def index
    users = User.includes(:role).cerca(params[:q])

    page     = [params[:page].to_i, 1].max
    per_page = 10
    total    = users.count

    paginated = users.offset((page - 1) * per_page).limit(per_page)

    render json: {
      users:       paginated.as_json(include: { role: { only: [:id, :nome_ruolo] } }),
      total:       total,
      page:        page,
      per_page:    per_page,
      total_pages: (total.to_f / per_page).ceil
    }
  end

  # POST /api/v1/users
  def create
    user = User.new(user_params)
    user.stato_account = 'Attivo'

    if user.save
      UserMailer.welcome_email(user).deliver_later
      render json: user, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/users/:id
  def update
    user = User.find(params[:id])

    allowed = user_params
    allowed = allowed.except(:role_id) unless @current_user.admin?

    if user.update(allowed)
      render json: user
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/users/:id  ← soft delete
  def destroy
    user = User.find(params[:id])

    if user.disattiva!
      render json: { message: 'Utente disattivato con successo' }
    else
      render json: { error: "Impossibile disattivare l'utente" }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:username, :email, :password, :nome, :cognome,
                                 :data_nascita, :role_id, :stato_account)
  end

  def check_admin
    unless @current_user&.admin?
      render json: { error: 'Accesso negato: richiesti privilegi di Amministratore' }, status: :forbidden
    end
  end
end