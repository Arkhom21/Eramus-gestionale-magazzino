class Api::V1::ProductsController < ApplicationController
  before_action :authorized
  before_action :set_product, only: [:show, :update, :destroy]

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
    quantita_iniziale = product_params[:quantita_disponibile].to_i

    # Creiamo il prodotto con quantità 0 — ci pensa il movimento
    @product = Product.new(product_params.merge(quantita_disponibile: 0))
    @product.user = @current_user

    if @product.save
      # Registra il movimento iniziale che aggiorna la quantità tramite callback
      if quantita_iniziale > 0
        StockMovement.create!(
          product:        @product,
          user:           @current_user,
          tipo_movimento: 'Carico',
          quantita:       quantita_iniziale,
          data_movimento: Time.current,
          note:           'Carico iniziale alla creazione prodotto'
        )
      end
      render json: @product.reload, status: :created
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
      # Registra movimento di scarico se c'è ancora quantità disponibile
      if @product.quantita_disponibile > 0
        StockMovement.create!(
          product:        @product,
          user:           @current_user,
          tipo_movimento: 'Scarico',
          quantita:       @product.quantita_disponibile,
          data_movimento: Time.current,
          note:           'Scarico per eliminazione prodotto'
        )
      end
      render json: { message: 'Prodotto disattivato con successo' }, status: :ok
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
      :prezzo_unitario, :soglia_minima_magazzino, :product_type_id, :user_id
    )
  end
end