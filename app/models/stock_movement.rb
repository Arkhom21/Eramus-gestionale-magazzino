# app/models/stock_movement.rb
class StockMovement < ApplicationRecord
  belongs_to :product
  belongs_to :user

  # Validazioni richieste
  validates :tipo_movimento, inclusion: { in: %w[Carico Scarico] }
  validates :quantita, numericality: { greater_than: 0 }

  # Callback: appena salviamo un movimento, aggiorniamo il prodotto
  after_create :aggiorna_magazzino

  private

  def aggiorna_magazzino
    if tipo_movimento == "Carico"
      product.increment!(:quantita_disponibile, quantita)
    else
      product.decrement!(:quantita_disponibile, quantita)
    end

    # Controllo soglia minima (Punto 4.3)
    check_soglia_critica
  end

  def check_soglia_critica
    if product.quantita_disponibile <= product.soglia_minima_magazzino
      # Recuperiamo il messaggio personalizzato dal Tipo Prodotto
      messaggio = product.product_type.corpo_messaggio

      puts "ATTENZIONE: #{product.nome_oggetto} sotto soglia!"
      puts "Messaggio da inviare: #{messaggio}"

      # Aggiorniamo il ProductType con l'esito dell'invio (come da schema PDF)
      product.product_type.update(
        data_invio: Time.current,
        esito_invio: "Inviato (Simulazione)"
      )

      # UserMailer.threshold_notification(product, messaggio).deliver_later
    end
  end
end
