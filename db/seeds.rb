# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end


puts "Svuotamento database in corso..."
EmailNotification.destroy_all
StockMovement.destroy_all
Product.destroy_all
ProductType.destroy_all
User.destroy_all
Role.destroy_all

puts "Creazione Ruoli..."
admin_role = Role.create!(
  nome_ruolo: "Admin", 
  descrizione: "Accesso completo a tutte le funzioni gestionali"
)
operatore_role = Role.create!(
  nome_ruolo: "Operatore", 
  descrizione: "Gestione inventario e movimenti magazzino"
)

puts "Creazione Utente Amministratore..."
admin_user = User.create!(
  username: "admin",
  email: "admin@eramus.it",
  password: "Password123!",
  nome: "Mario",
  cognome: "Rossi",
  data_nascita: "1985-05-20",
  role: admin_role,
  stato_account: "Attivo",
  tentativi_login_falliti: 0
)

puts "Creazione Tipo Prodotto (Messaggistica)..."
tipo_test = ProductType.create!(
  corpo_messaggio: "Benvenuti nel sistema gestionale ERAMUS. Prodotto caricato correttamente.",
  data_invio: Time.now,
  esito_invio: "Successo"
)

puts "Creazione Prodotto di esempio..."
prodotto_test = Product.create!(
  nome_oggetto: "Laptop Aziendale",
  descrizione: "Workstation per sviluppo software",
  quantita_disponibile: 10,
  prezzo_unitario: 1200.50,
  soglia_minima_magazzino: 3,
  data_inserimento: Time.now,
  product_type: tipo_test,
  user: admin_user # L'utente che ha inserito il prodotto
)

puts "Registrazione Movimento Magazzino iniziale..."
StockMovement.create!(
  product: prodotto_test,
  user: admin_user,
  tipo_movimento: "Carico",
  quantita: 10,
  data_movimento: Time.now,
  note: "Caricamento stock iniziale da fornitore"
)

puts "--- SEEDS COMPLETATI CON SUCCESSO! ---"
puts "User: admin | Pass: Password123!"
