class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users, id: :uuid do |t|
      t.string :username
      t.string :email
      t.string :password_digest
      t.string :nome
      t.string :cognome
      t.date :data_nascita
      t.integer :tentativi_login_falliti, default: 0
      t.string :stato_account, default: 'attivo'
      t.datetime :ultimo_login
      t.references :role, null: false, foreign_key: true, type: :uuid

      t.timestamps
    end
  end
end