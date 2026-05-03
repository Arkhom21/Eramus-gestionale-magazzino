class PasswordReset < ApplicationRecord
  belongs_to :user

  # Scope per trovare token validi (non usati e non scaduti)
  scope :valido, ->(token) {
    where(token: token, stato: "attivo")
    .where("data_scadenza > ?", Time.current)
  }

  def consuma!
    update(stato: "usato")
  end
end
