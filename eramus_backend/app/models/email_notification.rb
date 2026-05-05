# app/models/email_notification.rb
class EmailNotification < ApplicationRecord
  belongs_to :user, optional: true # L'utente a cui è stata mandata

  scope :recenti, -> { order(created_at: :desc) }

  def self.registra_invio(tipo, destinatario)
    create(tipo_notifica: tipo, destinatario: destinatario, data_invio: Time.current)
  end
end
