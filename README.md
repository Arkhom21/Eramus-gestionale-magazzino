# ERAMUS — Sistema Gestionale Inventario

Applicativo web gestionale full-stack sviluppato per il progetto tecnico ERAMUS SRL.
Permette la gestione completa di utenti, ruoli e inventario tramite un'interfaccia amministrativa protetta.

---

## Tecnologie utilizzate

**Backend**
- Ruby on Rails 8.1 (API mode)
- PostgreSQL con estensione `pgcrypto` (UUID come chiavi primarie)
- JWT (Access Token 15min + Refresh Token 7gg)
- BCrypt per hashing password
- ActionMailer + Mailtrap (email testing in sviluppo)

**Frontend**
- Next.js 15 (App Router)
- Bootstrap 5 (stile grafico)
- React con componenti separati per modal e tabelle

---

## Avvio con Docker

```bash
git clone https://github.com/maiello97/Progetto_Eramus.git
cd Progetto_Eramus
docker-compose up --build
```

Il sistema sarà disponibile su:
- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:3000`

---

## Installazione e avvio

### 1. Clona il repository

```bash
git clone https://github.com/maiello97/Progetto_Eramus.git
cd Progetto_Eramus
```

### 2. Backend

```bash
cd eramus_backend
bundle install
```

Configura il database in `config/database.yml` con le tue credenziali PostgreSQL.

Configura Mailtrap in `config/environments/development.rb`:

```ruby
config.action_mailer.delivery_method = :smtp
config.action_mailer.smtp_settings = {
  user_name:      'TUO_USERNAME_MAILTRAP',
  password:       'TUA_PASSWORD_MAILTRAP',
  address:        'sandbox.smtp.mailtrap.io',
  host:           'sandbox.smtp.mailtrap.io',
  port:           '2525',
  authentication: :login
}
config.action_mailer.default_url_options = { host: 'localhost', port: 3001 }
```

Crea il database, carica lo schema e popola i dati iniziali:

```bash
bundle exec rails db:create db:schema:load db:seed
```

Avvia il server:

```bash
rails s
```

Il backend sarà disponibile su `http://localhost:3000`

### 3. Frontend

```bash
cd eramus_frontend
npm install
npm run dev
```

Il frontend sarà disponibile su `http://localhost:3001`

---

## Credenziali di accesso (seed)

| Ruolo     | Username    | Password       |
|-----------|-------------|----------------|
| Admin     | `admin`     | `Password123!` |
| Operatore | `operatore` | `Password123!` |

---

## Email

In sviluppo le email vengono intercettate da **Mailtrap Sandbox** e non inviate realmente. Le email implementate sono:

- **Benvenuto** — inviata all'Admin quando crea un nuovo utente
- **Reset Password** — inviata con link temporaneo valido 1 ora
- **Soglia Minima** — inviata a tutti gli Admin quando la quantità di un prodotto scende sotto soglia

---

## API Endpoints

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| POST | `/api/v1/login` | Login utente |
| POST | `/api/v1/refresh` | Refresh access token |
| POST | `/api/v1/password_reset` | Richiesta reset password |
| PATCH | `/api/v1/password_reset` | Reset password con token |
| GET | `/api/v1/dashboard` | Dati dashboard |
| GET | `/api/v1/users` | Lista utenti |
| POST | `/api/v1/users` | Crea utente |
| PATCH | `/api/v1/users/:id` | Modifica utente |
| DELETE | `/api/v1/users/:id` | Disattiva utente |
| PATCH | `/api/v1/users/:id/reactivate` | Riattiva utente |
| GET | `/api/v1/products` | Lista prodotti |
| POST | `/api/v1/products` | Crea prodotto |
| PATCH | `/api/v1/products/:id` | Modifica prodotto |
| DELETE | `/api/v1/products/:id` | Elimina prodotto |
| GET | `/api/v1/product_types` | Lista tipi prodotto |
| GET | `/api/v1/roles` | Lista ruoli |
