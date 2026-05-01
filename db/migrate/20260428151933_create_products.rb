class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products, id: :uuid do |t|
      t.string :nome_oggetto
      t.text :descrizione
      t.integer :quantita_disponibile
      t.decimal :prezzo_unitario, precision: 10, scale: 2
      t.integer :soglia_minima_magazzino
      t.datetime :data_inserimento

      t.references :product_type, null: false, foreign_key: true, type: :uuid
      t.references :user, null: false, foreign_key: true, type: :uuid

      t.datetime :data_ultima_modifica
      t.timestamps
    end
  end
end
