class CreateProductTypes < ActiveRecord::Migration[8.1]
  def change
    create_table :product_types, id: :uuid do |t|
      t.string :nome_tipo,   null: false
      t.text   :descrizione

      t.timestamps
    end
  end
end