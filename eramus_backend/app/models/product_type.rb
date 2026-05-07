class ProductType < ApplicationRecord
  has_many :products

  validates :nome_tipo, presence: true
end