class CreateEmailNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :email_notifications, id: :uuid do |t|
      t.string :tipo_evento
      t.string :destinatario
      t.string :oggetto

      t.timestamps
    end
  end
end
