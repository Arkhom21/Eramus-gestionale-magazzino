class AddAttivoToProducts < ActiveRecord::Migration[8.1]
  def change
    add_column :products, :attivo, :boolean, default: true, null: false
  end
end
