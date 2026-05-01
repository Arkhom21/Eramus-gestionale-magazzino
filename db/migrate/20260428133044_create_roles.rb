class CreateRoles < ActiveRecord::Migration[8.1]
  def change
    create_table :roles, id: :uuid do |t|
      t.string :nome_ruolo
      t.text :descrizione

      t.timestamps
    end
  end
end
