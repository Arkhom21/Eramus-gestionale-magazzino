class Api::V1::DashboardController < ApplicationController
  def index
    # 1. Conteggio Utenti e Prodotti
    total_users = User.count
    total_products = Product.count

    # 2. Calcolo Valore Totale Inventario
    total_inventory_value = Product.sum("quantita_disponibile * prezzo_unitario")

    # 3. Ultimi 5 movimenti di magazzino
    recent_movements = StockMovement.includes(:product, :user)
                                    .order(created_at: :desc)
                                    .limit(5)
                                    .map do |m|
      {
        id: m.id,
        prodotto: m.product.nome_oggetto,
        tipo: m.tipo_movimento,
        quantita: m.quantita,
        utente: "#{m.user.nome} #{m.user.cognome}",
        data: m.created_at.strftime("%d/%m/%Y %H:%M")
      }
    end

    # 4. Grafico prodotti per categoria
    products_by_category = ProductType.joins(:products)
                                      .group(:nome_tipo)
                                      .count

    render json: {
      stats: {
        total_users: total_users,
        total_products: total_products,
        total_inventory_value: total_inventory_value
      },
      recent_movements: recent_movements,
      categories_chart: products_by_category
    }, status: :ok
  end
end
