class CreateStockMovements < ActiveRecord::Migration[8.1]
  def change
    create_table :stock_movements, id: :uuid do |t|
      t.references :product, null: false, foreign_key: true, type: :uuid
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :tipo_movimento
      t.integer :quantita, default: 0
      t.datetime :data_movimento
      t.text :note

      t.timestamps
    end
  end
end
