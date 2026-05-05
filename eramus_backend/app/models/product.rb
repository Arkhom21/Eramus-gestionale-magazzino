class Product < ApplicationRecord
  belongs_to :product_type
  belongs_to :user
  has_many :stock_movements, dependent: :destroy

  # Validazioni richieste dal PDF
  validates :nome_oggetto, presence: true
  validates :quantita_disponibile, numericality: { greater_than_or_equal_to: 0 }

  # Scopes per pulire il controller
  scope :per_tipo, ->(type_id) { where(product_type_id: type_id) if type_id.present? }
  scope :cerca_nome, ->(query) { where("nome_oggetto ILIKE ?", "%#{query}%") if query.present? }
  scope :ordina, ->(campo, direzione) {
    campo_valido = %w[prezzo_unitario quantita_disponibile created_at].include?(campo) ? campo : "created_at"
    direzione_valida = %w[asc desc].include?(direzione.to_s.downcase) ? direzione : "desc"
    order("#{campo_valido} #{direzione_valida}")
  }

  def sotto_soglia?
    quantita_disponibile <= soglia_minima_magazzino
  end
end
