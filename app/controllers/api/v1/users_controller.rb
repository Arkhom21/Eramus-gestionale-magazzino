class Api::V1::UsersController < ApplicationController
  # Utilizziamo il metodo helper .admin? definito nel Model
  before_action :check_admin, only: [ :create, :update, :destroy ]

  # Visualizzazione con Ricerca e Paginazione (Punto 4.3)
  def index
    # Usiamo lo scope .cerca definito nel Model
    users = User.cerca(params[:q])

    page = params[:page] || 1
    per_page = 10

    render json: users.offset((page.to_i - 1) * per_page).limit(per_page)
  end

  # Inserimento nuovo utente + Email Benvenuto
  def create
    user = User.new(user_params)
    user.stato_account = "Attivo"

    if user.save
      # Punto 4.3: Invio email di benvenuto
      # UserMailer.welcome_email(user).deliver_later
      render json: user, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # Disattivazione utente (Soft Delete - Punto 4.3)
  def destroy
    user = User.find(params[:id])

    # Usiamo il metodo .disattiva! definito nel Model
    if user.disattiva!
      render json: { message: "Utente disattivato con successo" }
    else
      render json: { error: "Impossibile disattivare l'utente" }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:username, :email, :password, :nome, :cognome, :data_nascita, :role_id)
  end

  def check_admin
    # Usiamo il metodo .admin? del Model per maggiore chiarezza
    unless @current_user&.admin?
      render json: { error: "Accesso negato: richiesti privilegi di Amministratore" }, status: :forbidden
    end
  end
end
