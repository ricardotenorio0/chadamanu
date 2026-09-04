-- ===========================================================================
-- Chá de Bebê da Manuela — criação do banco
--
-- Cole este arquivo inteiro no SQL Editor do Neon e clique em Run.
-- Ele cria as tabelas E registra as migrations como aplicadas, então um
-- "npm run db:migrate" futuro vai reconhecer que o banco já está em dia.
--
-- Rodar duas vezes é seguro: o script não repete nada.
-- ===========================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  name        text        PRIMARY KEY,
  checksum    text        NOT NULL,
  applied_at  timestamptz NOT NULL DEFAULT now()
);


-- ---------------------------------------------------------------------------
-- 0001_init.sql
-- ---------------------------------------------------------------------------

-- =============================================================================
-- 0001_init.sql
-- Estrutura base das confirmações de presença (RSVP) do Chá de Bebê da Manuela.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS rsvps (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  name_key      text        NOT NULL,
  companions    smallint    NOT NULL DEFAULT 0,
  status        text        NOT NULL DEFAULT 'confirmed',
  note          text,
  submission_id uuid,
  source        text        NOT NULL DEFAULT 'site',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT rsvps_name_length      CHECK (char_length(name) BETWEEN 2 AND 80),
  CONSTRAINT rsvps_companions_range CHECK (companions >= 0 AND companions <= 20),
  CONSTRAINT rsvps_status_allowed   CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  CONSTRAINT rsvps_note_length      CHECK (note IS NULL OR char_length(note) <= 280)
);

-- Um convidado por nome normalizado: evita duplicidade de confirmações.
CREATE UNIQUE INDEX IF NOT EXISTS rsvps_name_key_uidx
  ON rsvps (name_key);

-- Chave de idempotência enviada pelo formulario: bloqueia envio duplo acidental.
CREATE UNIQUE INDEX IF NOT EXISTS rsvps_submission_id_uidx
  ON rsvps (submission_id)
  WHERE submission_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS rsvps_created_at_idx ON rsvps (created_at DESC);
CREATE INDEX IF NOT EXISTS rsvps_status_idx     ON rsvps (status);

CREATE OR REPLACE FUNCTION rsvps_touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rsvps_set_updated_at ON rsvps;
CREATE TRIGGER rsvps_set_updated_at
  BEFORE UPDATE ON rsvps
  FOR EACH ROW
  EXECUTE FUNCTION rsvps_touch_updated_at();

INSERT INTO schema_migrations (name, checksum)
VALUES ('0001_init.sql', '1571e113a3c10d11')
ON CONFLICT (name) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 0002_rate_limit.sql
-- ---------------------------------------------------------------------------

-- =============================================================================
-- 0002_rate_limit.sql
-- Controle de tentativas (login do admin e envios do formulario público).
-- Persistido em banco porque o ambiente serverless não mantém estado em memória.
-- =============================================================================

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id         bigserial   PRIMARY KEY,
  bucket     text        NOT NULL,
  key_hash   text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_limit_events_lookup_idx
  ON rate_limit_events (bucket, key_hash, created_at DESC);

CREATE INDEX IF NOT EXISTS rate_limit_events_created_at_idx
  ON rate_limit_events (created_at);

INSERT INTO schema_migrations (name, checksum)
VALUES ('0002_rate_limit.sql', 'b3adea7e0b3d3a55')
ON CONFLICT (name) DO NOTHING;


COMMIT;

-- Confira o resultado:
--   SELECT name, applied_at FROM schema_migrations ORDER BY name;
--   SELECT count(*) FROM rsvps;
