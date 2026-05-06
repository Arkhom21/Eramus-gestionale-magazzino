class Api::V1::ProductsController < ApplicationController
  before_action :authorized
  before_action :set_product, only: [ :show, :update, :destroy ]

  # GET /api/v1/products
def index
  @products = Product.where(attivo: true) 
                       .per_tipo(params[:type_id])
                       .cerca_nome(params[:q])
                       .ordina(params[:sort], params[:direction])
  render json: @products
end

  # GET /api/v1/products/:id
  def show
    render json: @product
  end

  # POST /api/v1/products
  def create
    @product = Product.new(product_params)
    @product.user = @current_user # L'utente loggato che crea il prodotto

    if @product.save
      # Il movimento di carico iniziale viene gestito dal callback nel modello StockMovement
      render json: @product, status: :created
    else
      render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/products/:id
  def update
    if @product.update(product_params)
      render json: @product
    else
      render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/products/:id
  def destroy
    if @product.update(attivo: false)
      render json: { message: "Prodotto disattivato con successo" }, status: :ok
    else
      render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_product
    @product = Product.find(params[:id])
  end

  def product_params
    params.require(:product).permit(
      :nome_oggetto, :descrizione, :quantita_disponibile,
      :prezzo_unitario, :soglia_minima_magazzino, :product_type_id
    )
  end
end
