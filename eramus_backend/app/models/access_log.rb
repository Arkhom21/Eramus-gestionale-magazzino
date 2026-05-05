# app/models/access_log.rb
class AccessLog < ApplicationRecord
  belongs_to :user

  # Scope per vedere gli ultimi accessi di un utente
  scope :per_utente, ->(user_id) { where(user_id: user_id).order(created_at: :desc) }
end
