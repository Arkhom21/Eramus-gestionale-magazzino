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

# 1. Pulizia Database (Ordine inverso per via delle FK)
puts "Svuotamento tabelle..."
EmailNotification.destroy_all
StockMovement.destroy_all
Product.destroy_all
ProductType.destroy_all
AccessLog.destroy_all # Aggiunto per pulizia completa
User.destroy_all
Role.destroy_all

# 2. Creazione Ruoli (Punto 4.1)
puts "Creazione Ruoli..."
admin_role = Role.create!(
  nome_ruolo: "Admin",
  descrizione: "Accesso completo a tutte le funzioni gestionali"
)
operatore_role = Role.create!(
  nome_ruolo: "Operatore",
  descrizione: "Gestione inventario e movimenti magazzino"
)

# 3. Creazione Utenti (Punto 4.1 e 4.3)
puts "Creazione Utenti..."
admin_user = User.create!(
  username: "admin",
  email: "admin@eramus.it",
  password: "Password123!", # Rispetta i criteri AGID del Model
  nome: "Mario",
  cognome: "Rossi",
  data_nascita: "1985-05-20",
  role: admin_role,
  stato_account: "Attivo"
)

operatore_user = User.create!(
  username: "operatore",
  email: "operatore@eramus.it",
  password: "Password123!",
  nome: "Luigi",
  cognome: "Verdi",
  data_nascita: "1990-10-10",
  role: operatore_role,
  stato_account: "Attivo"
)

# 4. Creazione Tipi Prodotto / Template Notifica (Punto 4.4)
# Interpretazione schema PDF: Logica di notifica per categoria
puts "Creazione Tipi Prodotto (Template Notifiche)..."
tipo_toner = ProductType.create!(
  corpo_messaggio: "ATTENZIONE: Scorta minima raggiunta per i Toner. Necessario nuovo ordine.",
  data_invio: Time.current,
  esito_invio: "Successo"
)

tipo_carta = ProductType.create!(
  corpo_messaggio: "AVVISO: Le risme di carta stanno terminando.",
  data_invio: nil,
  esito_invio: "In attesa"
)

tipo_hardware = ProductType.create!(
  corpo_messaggio: "NOTIFICA: Inventario Hardware sotto soglia critica.",
  data_invio: nil,
  esito_invio: "Non inviato"
)

# 5. Creazione Prodotti (Punto 4.4)
puts "Creazione Prodotti di esempio..."
p1 = Product.create!(
  nome_oggetto: "Toner HP Laserjet 500",
  descrizione: "Toner nero alta resa per ufficio tecnico",
  quantita_disponibile: 2, # SOTTO SOGLIA
  prezzo_unitario: 85.50,
  soglia_minima_magazzino: 5,
  data_inserimento: Time.current,
  product_type: tipo_toner,
  user: admin_user
)

p2 = Product.create!(
  nome_oggetto: "Risme Carta A4 80g",
  descrizione: "Confezione da 5 risme per fotocopiatrice",
  quantita_disponibile: 20,
  prezzo_unitario: 24.90,
  soglia_minima_magazzino: 10,
  data_inserimento: Time.current,
  product_type: tipo_carta,
  user: admin_user
)

# 6. Registrazione Movimenti Iniziali (Punto 4.4)
puts "Registrazione Movimenti Magazzino..."
StockMovement.create!(
  product: p1,
  user: admin_user,
  tipo_movimento: "Carico",
  quantita: 2,
  data_movimento: Time.current,
  note: "Caricamento iniziale stock"
)

StockMovement.create!(
  product: p2,
  user: operatore_user, # Dimostriamo che anche l'operatore può caricare
  tipo_movimento: "Carico",
  quantita: 20,
  data_movimento: Time.current,
  note: "Arrivo fornitura mensile"
)

# 7. Registrazione Log di Accesso (Punto 5)
puts "Creazione Access Logs..."
AccessLog.create!(
  user: admin_user,
  indirizzo_ip: "127.0.0.1",
  user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  data_accesso: Time.current
)

puts "--- SEEDS COMPLETATI CON SUCCESSO! ---"
puts "Credenziali Admin: admin / Password123!"
puts "Credenziali Operatore: operatore / Password123!"
