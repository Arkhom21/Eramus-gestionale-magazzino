class CreateProductTypes < ActiveRecord::Migration[8.1]
  def change
    create_table :product_types, id: :uuid do |t|
      t.text :corpo_messaggio
      t.datetime :data_invio
      t.string :esito_invio

      t.timestamps
    end
  end
end
