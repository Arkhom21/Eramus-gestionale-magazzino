class Api::V1::UsersController < ApplicationController
  before_action :check_admin, only: [ :create, :update, :destroy ]

  # Visualizzazione con Ricerca e Paginazione
  def index
    users = User.all
    users = users.where("username LIKE ? OR email LIKE ?", "%#{params[:q]}%", "%#{params[:q]}%") if params[:q].present?

    # Usiamo una paginazione semplice
    page = params[:page] || 1
    per_page = 10
    render json: users.offset((page.to_i - 1) * per_page).limit(per_page)
  end

  # Inserimento nuovo utente + Email Benvenuto
  def create
    user = User.new(user_params)
    user.stato_account = "Attivo"

    if user.save
      # Qui chiameremo il Mailer per l'invio email di benvenuto (Punto 4.3)
      # UserMailer.welcome_email(user).deliver_now
      render json: user, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # Disattivazione utente (Soft Delete)
  def destroy
    user = User.find(params[:id])
    if user.update(stato_account: "Disattivato")
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
    # Verifichiamo il ruolo tramite l'associazione (Punto 5)
    unless @user.role.nome_ruolo == "Admin"
      render json: { error: "Accesso negato: richiesti privilegi di Amministratore" }, status: :forbidden
    end
  end
end
