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
