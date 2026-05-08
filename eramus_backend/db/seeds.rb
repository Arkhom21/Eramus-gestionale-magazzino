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
tipo_toner = ProductType.create!(nome_tipo: 'Toner',  descrizione: 'Cartucce e toner per stampanti')
tipo_carta = ProductType.create!(nome_tipo: 'Carta',  descrizione: 'Risme e carta da stampa')
tipo_buste = ProductType.create!(nome_tipo: 'Buste',  descrizione: 'Buste e materiale postale')

puts "Creazione Prodotti e Movimenti..."

# Helper per creare prodotto + movimento iniziale correttamente
def crea_prodotto(nome, descrizione, quantita, prezzo, soglia, tipo, utente)
  p = Product.create!(
    nome_oggetto:            nome,
    descrizione:             descrizione,
    quantita_disponibile:    0,  # parte da 0, ci pensa il movimento
    prezzo_unitario:         prezzo,
    soglia_minima_magazzino: soglia,
    data_inserimento:        Time.current,
    attivo:                  true,
    product_type:            tipo,
    user:                    utente
  )
  StockMovement.create!(
    product:        p,
    user:           utente,
    tipo_movimento: 'Carico',
    quantita:       quantita,
    data_movimento: Time.current,
    note:           'Carico iniziale da seed'
  )
  p.reload
end

# Toner
crea_prodotto('Toner HP Laserjet 500',   'Toner nero alta resa per ufficio tecnico', 2,  85.50, 5,  tipo_toner, admin_user)
crea_prodotto('Toner Canon C3226i',      'Toner colore per stampante Canon',         8,  120.00, 3, tipo_toner, admin_user)

# Carta
crea_prodotto('Risme Carta A4 80g',      'Confezione da 5 risme per fotocopiatrice', 20, 24.90, 10, tipo_carta, admin_user)
crea_prodotto('Carta Fotografica A4',    'Carta lucida per stampe fotografiche',     15, 18.50, 5,  tipo_carta, operatore_user)

# Buste
crea_prodotto('Buste C4 bianche',        'Buste formato C4 per documenti A4',        50, 12.00, 20, tipo_buste, operatore_user)
crea_prodotto('Buste da lettera C5',     'Buste formato C5 con finestra',            30, 8.50,  15, tipo_buste, operatore_user)

puts "Creazione Access Logs..."
AccessLog.create!(
  user:       admin_user,
  ip_address: '127.0.0.1',
  data_ora:   Time.current,
  esito:      'Successo'
)
AccessLog.create!(
  user:       operatore_user,
  ip_address: '127.0.0.1',
  data_ora:   Time.current,
  esito:      'Successo'
)

puts "--- SEEDS COMPLETATI ---"
puts "Credenziali Admin:     admin / Password123!"
puts "Credenziali Operatore: operatore / Password123!"
puts "Prodotti creati: #{Product.count}"
puts "Movimenti creati: #{StockMovement.count}"