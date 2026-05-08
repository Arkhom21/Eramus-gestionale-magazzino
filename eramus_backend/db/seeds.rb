# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end


# db/seeds.rb

puts "--- INIZIO POPOLAMENTO DATABASE ---"

puts "Svuotamento tabelle..."
EmailNotification.destroy_all
StockMovement.destroy_all
Product.destroy_all
ProductType.destroy_all
AccessLog.destroy_all
PasswordReset.destroy_all
User.destroy_all
Role.destroy_all

puts "Creazione Ruoli..."
admin_role = Role.create!(
  nome_ruolo:  'Admin',
  descrizione: 'Accesso completo a tutte le funzioni gestionali'
)
operatore_role = Role.create!(
  nome_ruolo:  'Operatore',
  descrizione: 'Gestione inventario e movimenti magazzino'
)

puts "Creazione Utenti..."
admin_user = User.create!(
  username:      'admin',
  email:         'admin@eramus.it',
  password:      'Password123!',
  nome:          'Mario',
  cognome:       'Rossi',
  data_nascita:  '1985-05-20',
  role:          admin_role,
  stato_account: 'Attivo'
)

operatore_user = User.create!(
  username:      'operatore',
  email:         'operatore@eramus.it',
  password:      'Password123!',
  nome:          'Luigi',
  cognome:       'Verdi',
  data_nascita:  '1990-10-10',
  role:          operatore_role,
  stato_account: 'Attivo'
)

puts "Creazione Tipi Prodotto..."
tipo_toner = ProductType.create!(nome_tipo: 'Toner', descrizione: 'Cartucce e toner per stampanti')
tipo_carta = ProductType.create!(nome_tipo: 'Carta', descrizione: 'Risme e carta da stampa')
tipo_buste = ProductType.create!(nome_tipo: 'Buste', descrizione: 'Buste e materiale postale')

puts "Creazione Prodotti..."
p1 = Product.create!(
  nome_oggetto:            'Toner HP Laserjet 500',
  descrizione:             'Toner nero alta resa per ufficio tecnico',
  quantita_disponibile:    0,  
  prezzo_unitario:         85.50,
  soglia_minima_magazzino: 5,
  data_inserimento:        Time.current,
  attivo:                  true,
  product_type:            tipo_toner,
  user:                    admin_user
)

p2 = Product.create!(
  nome_oggetto:            'Risme Carta A4 80g',
  descrizione:             'Confezione da 5 risme per fotocopiatrice',
  quantita_disponibile:    0,  
  prezzo_unitario:         24.90,
  soglia_minima_magazzino: 10,
  data_inserimento:        Time.current,
  attivo:                  true,
  product_type:            tipo_carta,
  user:                    admin_user
)

puts "Registrazione Movimenti Magazzino..."
StockMovement.create!(
  product:        p1,
  user:           admin_user,
  tipo_movimento: 'Carico',
  quantita:       2,
  data_movimento: Time.current,
  note:           'Caricamento iniziale stock'
)

StockMovement.create!(
  product:        p2,
  user:           operatore_user,
  tipo_movimento: 'Carico',
  quantita:       20,
  data_movimento: Time.current,
  note:           'Arrivo fornitura mensile'
)

puts "Creazione Access Logs..."
AccessLog.create!(
  user:       admin_user,
  ip_address: '127.0.0.1',
  data_ora:   Time.current,
  esito:      'Successo'
)

puts "--- SEEDS COMPLETATI ---"
puts "Credenziali Admin:     admin / Password123!"
puts "Credenziali Operatore: operatore / Password123!"