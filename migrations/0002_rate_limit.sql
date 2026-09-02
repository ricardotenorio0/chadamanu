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
