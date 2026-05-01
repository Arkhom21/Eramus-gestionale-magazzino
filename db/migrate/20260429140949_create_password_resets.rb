class CreatePasswordResets < ActiveRecord::Migration[8.1]
  def change
    create_table :password_resets, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :token
      t.datetime :data_generazione
      t.datetime :data_scadenza
      t.string :stato, default: 'non usato'

      t.timestamps
    end
  end
end
