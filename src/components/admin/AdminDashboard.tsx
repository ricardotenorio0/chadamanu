"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Dialog } from "@/components/admin/Dialog";
import {
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  LogoutIcon,
  PencilIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  SortIcon,
  TrashIcon,
} from "@/components/admin/icons";
import {
  COMPANIONS_MAX,
  NOTE_MAX,
  RSVP_STATUSES,
  STATUS_LABEL,
  type Rsvp,
  type RsvpStats,
  type RsvpStatus,
} from "@/lib/rsvp-shared";

type SortKey = "created_at" | "name" | "companions" | "total";
type Direction = "asc" | "desc";

type ListResponse = {
  ok: boolean;
  items: Rsvp[];
  total: number;
  page: number;
  pageCount: number;
  stats: RsvpStats;
  error?: string;
};

const PAGE_SIZE = 25;

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

const shortDateTime = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

const longDateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

const EMPTY_STATS: RsvpStats = {
  entries: 0,
  confirmedEntries: 0,
  pendingEntries: 0,
  cancelledEntries: 0,
  guests: 0,
  companions: 0,
  totalPeople: 0,
};

export function AdminDashboard() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<RsvpStatus | "all">("all");
  const [sort, setSort] = useState<SortKey>("created_at");
  const [direction, setDirection] = useState<Direction>("desc");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [viewing, setViewing] = useState<Rsvp | null>(null);
  const [editing, setEditing] = useState<Rsvp | null>(null);
  const [removing, setRemoving] = useState<Rsvp | null>(null);
  const [creating, setCreating] = useState(false);

  const requestRef = useRef(0);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(id);
  }, [search]);

  const load = useCallback(async () => {
    const token = ++requestRef.current;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      sort,
      direction,
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status !== "all") params.set("status", status);

    try {
      const response = await fetch(`/api/admin/rsvps?${params.toString()}`, {
        cache: "no-store",
      });

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const payload = (await response.json().catch(() => null)) as ListResponse | null;
      if (token !== requestRef.current) return;

      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Não foi possível carregar as confirmações.");
        setData(null);
      } else {
        setData(payload);
      }
    } catch {
      if (token === requestRef.current) {
        setError("Falha de conexão ao buscar as confirmações.");
      }
    } finally {
      if (token === requestRef.current) setLoading(false);
    }
  }, [debouncedSearch, direction, page, router, sort, status]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const stats = data?.stats ?? EMPTY_STATS;
  const items = useMemo(() => data?.items ?? [], [data]);

  function toggleSort(key: SortKey) {
    if (sort === key) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setDirection(key === "name" ? "asc" : "desc");
    }
    setPage(1);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  }

  async function handleExport() {
    try {
      const response = await fetch("/api/admin/export", { cache: "no-store" });
      if (!response.ok) {
        setToast("Não foi possível exportar agora.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `confirmacoes-manuela-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      // Revogar a URL logo após o clique cancela o download em alguns
      // navegadores: a limpeza espera o download começar.
      window.setTimeout(() => {
        anchor.remove();
        URL.revokeObjectURL(url);
      }, 2000);
      setToast("Arquivo CSV gerado.");
    } catch {
      setToast("Não foi possível exportar agora.");
    }
  }

  async function handleCopy() {
    const lines = [
      `Chá de Bebê da Manuela — confirmações`,
      `Confirmações: ${stats.entries} · Convidados: ${stats.guests} · Acompanhantes: ${stats.companions}`,
      `Total de pessoas confirmadas: ${stats.totalPeople}`,
      "",
      ...items.map(
        (item) =>
          `${item.name} — ${item.companions} acompanhante(s) — ${item.totalPeople} pessoa(s) — ${STATUS_LABEL[item.status]}`
      ),
    ];
    const text = lines.join("\n");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      setToast("Informações copiadas.");
    } catch {
      setToast("Não foi possível copiar.");
    }
  }

  async function saveEdit(id: string, patch: Record<string, unknown>) {
    const response = await fetch(`/api/admin/rsvps/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error ?? "Não foi possível salvar as alterações.");
    }
  }

  async function createRsvp(input: Record<string, unknown>) {
    const response = await fetch("/api/admin/rsvps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error ?? "Não foi possível adicionar a confirmação.");
    }
  }

  async function confirmDelete(rsvp: Rsvp) {
    const response = await fetch(`/api/admin/rsvps/${rsvp.id}`, { method: "DELETE" });
    const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error ?? "Não foi possível excluir a confirmação.");
    }
  }

  const showingRange = data
    ? `${(data.page - 1) * PAGE_SIZE + (items.length > 0 ? 1 : 0)}–${(data.page - 1) * PAGE_SIZE + items.length} de ${data.total}`
    : "";

  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="admin-shell admin-bar__inner">
          <div className="admin-bar__brand">
            <span className="admin-bar__name script">Manuela</span>
            <span className="admin-bar__tag">Confirmações</span>
          </div>
          <button type="button" className="ui-btn ui-btn--quiet" onClick={handleLogout}>
            <LogoutIcon />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <div className="admin-shell">
        <div className="admin-head">
          <h1 className="admin-head__title">Lista de confirmações</h1>
          <p className="admin-head__sub">
            Acompanhe quem vai celebrar com a gente em 10 de outubro.
          </p>
        </div>

        <section className="stats" aria-label="Indicadores">
          <div className="stat">
            <span className="stat__label">Confirmações</span>
            <span className="stat__value">{stats.entries}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Convidados</span>
            <span className="stat__value">{stats.guests}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Acompanhantes</span>
            <span className="stat__value">{stats.companions}</span>
          </div>
          <div className="stat stat--accent">
            <span className="stat__label">Total de pessoas</span>
            <span className="stat__value">{stats.totalPeople}</span>
          </div>
        </section>

        <div className="toolbar">
          <div className="toolbar__search">
            <SearchIcon />
            <label className="sr-only" htmlFor="admin-search">
              Pesquisar por nome
            </label>
            <input
              id="admin-search"
              className="input input--search"
              type="search"
              placeholder="Pesquisar por nome"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="toolbar__filters">
            <div>
              <label className="field-label" htmlFor="admin-status">
                Status
              </label>
              <select
                id="admin-status"
                className="select"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as RsvpStatus | "all");
                  setPage(1);
                }}
              >
                <option value="all">Todos</option>
                {RSVP_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {STATUS_LABEL[value]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="admin-sort">
                Ordenar por
              </label>
              <select
                id="admin-sort"
                className="select"
                value={`${sort}:${direction}`}
                onChange={(event) => {
                  const [nextSort, nextDirection] = event.target.value.split(":");
                  setSort(nextSort as SortKey);
                  setDirection(nextDirection as Direction);
                  setPage(1);
                }}
              >
                <option value="created_at:desc">Mais recentes</option>
                <option value="created_at:asc">Mais antigas</option>
                <option value="name:asc">Nome (A–Z)</option>
                <option value="name:desc">Nome (Z–A)</option>
                <option value="total:desc">Mais pessoas</option>
                <option value="total:asc">Menos pessoas</option>
              </select>
            </div>
          </div>

          <div className="toolbar__actions">
            <button type="button" className="ui-btn" onClick={() => void load()} disabled={loading}>
              <RefreshIcon />
              <span>Atualizar</span>
            </button>
            <button type="button" className="ui-btn" onClick={handleExport}>
              <DownloadIcon />
              <span>Exportar CSV</span>
            </button>
            <button type="button" className="ui-btn" onClick={handleCopy}>
              <CopyIcon />
              <span>Copiar</span>
            </button>
            <button type="button" className="ui-btn ui-btn--primary" onClick={() => setCreating(true)}>
              <PlusIcon />
              <span>Adicionar</span>
            </button>
          </div>
        </div>

        {error ? (
          <p className="notice notice--error" role="alert">
            {error}
          </p>
        ) : null}

        {loading && !data ? (
          <div className="rows" aria-hidden="true">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        ) : null}

        {!loading && items.length === 0 && !error ? (
          <div className="empty">
            <p className="empty__title">Nenhuma confirmação por aqui</p>
            <p className="empty__text">
              {debouncedSearch || status !== "all"
                ? "Tente ajustar a pesquisa ou o filtro de status."
                : "Assim que alguém confirmar presença, a lista aparece aqui."}
            </p>
          </div>
        ) : null}

        {items.length > 0 ? (
          <>
            {/* Celular: cartões */}
            <div className="rows">
              {items.map((rsvp) => (
                <article className="row-card" key={rsvp.id}>
                  <div className="row-card__top">
                    <h2 className="row-card__name">{rsvp.name}</h2>
                    <span className={`tag tag--${rsvp.status}`}>{STATUS_LABEL[rsvp.status]}</span>
                  </div>

                  <dl className="row-card__grid">
                    <div className="row-card__cell">
                      <dt>Acomp.</dt>
                      <dd>{rsvp.companions}</dd>
                    </div>
                    <div className="row-card__cell">
                      <dt>Pessoas</dt>
                      <dd>{rsvp.totalPeople}</dd>
                    </div>
                    <div className="row-card__cell">
                      <dt>Confirmado</dt>
                      <dd>{shortDateTime.format(new Date(rsvp.createdAt))}</dd>
                    </div>
                  </dl>

                  {rsvp.note ? <p className="row-card__note">“{rsvp.note}”</p> : null}

                  <div className="row-card__actions">
                    <button type="button" className="ui-btn" onClick={() => setViewing(rsvp)}>
                      <EyeIcon />
                      <span>Detalhes</span>
                    </button>
                    <button type="button" className="ui-btn" onClick={() => setEditing(rsvp)}>
                      <PencilIcon />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      className="ui-btn ui-btn--danger"
                      onClick={() => setRemoving(rsvp)}
                    >
                      <TrashIcon />
                      <span>Excluir</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Tablet e desktop: tabela */}
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">
                      <button type="button" onClick={() => toggleSort("name")} data-active={sort === "name"}>
                        Nome
                        <SortIcon direction={sort === "name" ? direction : null} />
                      </button>
                    </th>
                    <th scope="col">
                      <button
                        type="button"
                        onClick={() => toggleSort("companions")}
                        data-active={sort === "companions"}
                      >
                        Acompanhantes
                        <SortIcon direction={sort === "companions" ? direction : null} />
                      </button>
                    </th>
                    <th scope="col">
                      <button
                        type="button"
                        onClick={() => toggleSort("total")}
                        data-active={sort === "total"}
                      >
                        Total de pessoas
                        <SortIcon direction={sort === "total" ? direction : null} />
                      </button>
                    </th>
                    <th scope="col">
                      <button
                        type="button"
                        onClick={() => toggleSort("created_at")}
                        data-active={sort === "created_at"}
                      >
                        Data da confirmação
                        <SortIcon direction={sort === "created_at" ? direction : null} />
                      </button>
                    </th>
                    <th scope="col">Status</th>
                    <th scope="col" style={{ textAlign: "right" }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((rsvp) => (
                    <tr key={rsvp.id}>
                      <td className="table__name">{rsvp.name}</td>
                      <td className="table__num">{rsvp.companions}</td>
                      <td className="table__num">{rsvp.totalPeople}</td>
                      <td className="table__num">{dateTime.format(new Date(rsvp.createdAt))}</td>
                      <td>
                        <span className={`tag tag--${rsvp.status}`}>{STATUS_LABEL[rsvp.status]}</span>
                      </td>
                      <td>
                        <div className="table__actions">
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => setViewing(rsvp)}
                            aria-label={`Ver detalhes de ${rsvp.name}`}
                          >
                            <EyeIcon />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => setEditing(rsvp)}
                            aria-label={`Editar ${rsvp.name}`}
                          >
                            <PencilIcon />
                          </button>
                          <button
                            type="button"
                            className="icon-btn icon-btn--danger"
                            onClick={() => setRemoving(rsvp)}
                            aria-label={`Excluir ${rsvp.name}`}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.pageCount > 1 ? (
              <nav className="pager" aria-label="Paginação">
                <span>{showingRange}</span>
                <span style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="ui-btn"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={data.page <= 1 || loading}
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    className="ui-btn"
                    onClick={() => setPage((value) => Math.min(data.pageCount, value + 1))}
                    disabled={data.page >= data.pageCount || loading}
                  >
                    Próxima
                  </button>
                </span>
              </nav>
            ) : null}
          </>
        ) : null}

        <p className="admin-foot">Chá de Bebê da Manuela · 10.10</p>
      </div>

      {viewing ? (
        <Dialog title="Detalhes da confirmação" onClose={() => setViewing(null)}>
          <dl className="dialog__list">
            <div>
              <dt>Nome</dt>
              <dd>{viewing.name}</dd>
            </div>
            <div>
              <dt>Acompanhantes</dt>
              <dd>{viewing.companions}</dd>
            </div>
            <div>
              <dt>Total de pessoas</dt>
              <dd>{viewing.totalPeople}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className={`tag tag--${viewing.status}`}>{STATUS_LABEL[viewing.status]}</span>
              </dd>
            </div>
            <div>
              <dt>Data da confirmação</dt>
              <dd>{longDateTime.format(new Date(viewing.createdAt))}</dd>
            </div>
            <div>
              <dt>Última atualização</dt>
              <dd>{longDateTime.format(new Date(viewing.updatedAt))}</dd>
            </div>
            {viewing.note ? (
              <div>
                <dt>Recado</dt>
                <dd>{viewing.note}</dd>
              </div>
            ) : null}
          </dl>
          <div className="dialog__actions">
            <button type="button" className="ui-btn" onClick={() => setViewing(null)}>
              Fechar
            </button>
            <button
              type="button"
              className="ui-btn ui-btn--primary"
              onClick={() => {
                setEditing(viewing);
                setViewing(null);
              }}
            >
              Editar
            </button>
          </div>
        </Dialog>
      ) : null}

      {editing ? (
        <RsvpFormDialog
          title="Editar confirmação"
          initial={editing}
          submitLabel="Salvar alterações"
          onClose={() => setEditing(null)}
          onSubmit={async (values) => {
            await saveEdit(editing.id, values);
            setEditing(null);
            setToast("Confirmação atualizada.");
            await load();
          }}
        />
      ) : null}

      {creating ? (
        <RsvpFormDialog
          title="Adicionar confirmação"
          submitLabel="Adicionar"
          onClose={() => setCreating(false)}
          onSubmit={async (values) => {
            await createRsvp(values);
            setCreating(false);
            setToast("Confirmação adicionada.");
            await load();
          }}
        />
      ) : null}

      {removing ? (
        <ConfirmDeleteDialog
          rsvp={removing}
          onClose={() => setRemoving(null)}
          onConfirm={async () => {
            await confirmDelete(removing);
            setRemoving(null);
            setToast("Confirmação excluída.");
            await load();
          }}
        />
      ) : null}

      {toast ? (
        <p className="toast" role="status" aria-live="polite">
          {toast}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

type FormValues = { name: string; companions: number; status?: RsvpStatus; note: string | null };

function RsvpFormDialog({
  title,
  initial,
  submitLabel,
  onClose,
  onSubmit,
}: {
  title: string;
  initial?: Rsvp;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [companions, setCompanions] = useState(initial?.companions ?? 0);
  const [statusValue, setStatusValue] = useState<RsvpStatus>(initial?.status ?? "confirmed");
  const [note, setNote] = useState(initial?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (saving) return;
    setError(null);

    if (name.trim().length < 2) {
      setError("Informe o nome do convidado.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        companions,
        status: statusValue,
        note: note.trim().length > 0 ? note.trim() : null,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível salvar.");
      setSaving(false);
    }
  }

  return (
    <Dialog title={title} onClose={onClose}>
      <form
        className="dialog__form"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        noValidate
      >
        {error ? (
          <p className="notice notice--error" role="alert" style={{ marginBottom: 0 }}>
            {error}
          </p>
        ) : null}

        <div>
          <label className="field-label" htmlFor="dialog-name">
            Nome
          </label>
          <input
            id="dialog-name"
            className="input"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            disabled={saving}
            required
          />
        </div>

        <div>
          <label className="field-label" htmlFor="dialog-companions">
            Acompanhantes
          </label>
          <input
            id="dialog-companions"
            className="input"
            type="number"
            inputMode="numeric"
            min={0}
            max={COMPANIONS_MAX}
            value={companions}
            onChange={(event) => {
              const parsed = Number(event.target.value);
              setCompanions(
                Number.isNaN(parsed) ? 0 : Math.min(COMPANIONS_MAX, Math.max(0, Math.floor(parsed)))
              );
            }}
            disabled={saving}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="dialog-status">
            Status
          </label>
          <select
            id="dialog-status"
            className="select"
            value={statusValue}
            onChange={(event) => setStatusValue(event.target.value as RsvpStatus)}
            disabled={saving}
          >
            {RSVP_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABEL[value]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="dialog-note">
            Recado
          </label>
          <textarea
            id="dialog-note"
            className="input input--textarea"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={NOTE_MAX}
            disabled={saving}
          />
        </div>

        <div className="dialog__actions" style={{ marginTop: "0.25rem" }}>
          <button type="button" className="ui-btn" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="ui-btn ui-btn--primary" disabled={saving}>
            {saving ? "Salvando..." : submitLabel}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */

function ConfirmDeleteDialog({
  rsvp,
  onClose,
  onConfirm,
}: {
  rsvp: Rsvp;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog title="Excluir confirmação" onClose={onClose}>
      <p className="dialog__text">
        Tem certeza de que deseja excluir a confirmação de <strong>{rsvp.name}</strong> (
        {rsvp.totalPeople} {rsvp.totalPeople === 1 ? "pessoa" : "pessoas"})? Esta ação não pode ser
        desfeita.
      </p>

      {error ? (
        <p className="notice notice--error" role="alert" style={{ marginTop: "1rem", marginBottom: 0 }}>
          {error}
        </p>
      ) : null}

      <div className="dialog__actions">
        <button type="button" className="ui-btn" onClick={onClose} disabled={working}>
          Cancelar
        </button>
        <button
          type="button"
          className="ui-btn ui-btn--primary"
          disabled={working}
          onClick={async () => {
            if (working) return;
            setWorking(true);
            setError(null);
            try {
              await onConfirm();
            } catch (deleteError) {
              setError(
                deleteError instanceof Error ? deleteError.message : "Não foi possível excluir."
              );
              setWorking(false);
            }
          }}
        >
          {working ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </Dialog>
  );
}
