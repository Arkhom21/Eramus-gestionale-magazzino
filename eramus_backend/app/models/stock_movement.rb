class StockMovement < ApplicationRecord
  belongs_to :product
  belongs_to :user

  validates :tipo_movimento, inclusion: { in: %w[Carico Scarico] }
  validates :quantita, numericality: { greater_than: 0 }

  after_create :aggiorna_magazzino

  private

  def aggiorna_magazzino
    if tipo_movimento == 'Carico'
      product.increment!(:quantita_disponibile, quantita)
    else
      product.decrement!(:quantita_disponibile, quantita)
    end
    check_soglia_critica
  end

  def check_soglia_critica
    if product.sotto_soglia?
      puts "ATTENZIONE: #{product.nome_oggetto} sotto soglia!"
      admins = User.joins(:role).where(roles: { nome_ruolo: 'Admin' })
      admins.each do |admin|
        begin
          UserMailer.threshold_notification(product, admin).deliver_later
        rescue => e
          puts "Errore invio email notifica soglia: #{e.message}"
        end
      end
    end
  end
end