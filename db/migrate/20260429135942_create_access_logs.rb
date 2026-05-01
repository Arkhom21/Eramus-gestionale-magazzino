class CreateAccessLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :access_logs, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.datetime :data_ora
      t.string :ip_address
      t.string :esito

      t.timestamps
    end
  end
end
