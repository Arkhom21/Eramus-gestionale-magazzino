# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_05_06_144807) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "access_logs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "data_ora"
    t.string "esito"
    t.string "ip_address"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["user_id"], name: "index_access_logs_on_user_id"
  end

  create_table "email_notifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "destinatario"
    t.string "oggetto"
    t.string "tipo_evento"
    t.datetime "updated_at", null: false
  end

  create_table "password_resets", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "data_generazione"
    t.datetime "data_scadenza"
    t.string "stato", default: "non usato"
    t.string "token"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["user_id"], name: "index_password_resets_on_user_id"
  end

  create_table "product_types", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "corpo_messaggio"
    t.datetime "created_at", null: false
    t.datetime "data_invio"
    t.string "esito_invio"
    t.datetime "updated_at", null: false
  end

  create_table "products", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.boolean "attivo", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "data_inserimento"
    t.datetime "data_ultima_modifica"
    t.text "descrizione"
    t.string "nome_oggetto"
    t.decimal "prezzo_unitario", precision: 10, scale: 2
    t.uuid "product_type_id", null: false
    t.integer "quantita_disponibile"
    t.integer "soglia_minima_magazzino"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["product_type_id"], name: "index_products_on_product_type_id"
    t.index ["user_id"], name: "index_products_on_user_id"
  end

  create_table "roles", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "descrizione"
    t.string "nome_ruolo"
    t.datetime "updated_at", null: false
  end

  create_table "stock_movements", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "data_movimento"
    t.text "note"
    t.uuid "product_id", null: false
    t.integer "quantita", default: 0
    t.string "tipo_movimento"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["product_id"], name: "index_stock_movements_on_product_id"
    t.index ["user_id"], name: "index_stock_movements_on_user_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "cognome"
    t.datetime "created_at", null: false
    t.date "data_nascita"
    t.string "email"
    t.string "nome"
    t.string "password_digest"
    t.uuid "role_id", null: false
    t.string "stato_account", default: "attivo"
    t.integer "tentativi_login_falliti", default: 0
    t.datetime "ultimo_login"
    t.datetime "updated_at", null: false
    t.string "username"
    t.index ["role_id"], name: "index_users_on_role_id"
  end

  add_foreign_key "access_logs", "users"
  add_foreign_key "password_resets", "users"
  add_foreign_key "products", "product_types"
  add_foreign_key "products", "users"
  add_foreign_key "stock_movements", "products"
  add_foreign_key "stock_movements", "users"
  add_foreign_key "users", "roles"
end
