import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { dbRows, dbDr, dbScenarios, COMPARE_DIMS, DR_DIMS, type DbRow, type DbScenario } from "../data/dbStudy";

const BY_ID = Object.fromEntries(dbRows.map((d) => [d.id, d]));
const cvar = (c: string) => ({ "--c": c } as CSSProperties);

// Cada dimensão técnica do comparativo aponta pro tópico que a explica (interliga com a teoria).
const TOPIC_FOR_DIM: Partial<Record<keyof DbRow, string>> = {
  modeloDados: "databases-indexing",
  escala: "performance-scalability",
  failover: "spof-dr",
  indice: "databases-indexing",
  storage: "data-replication",
  concorrencia: "concurrency-parallelism",
  cap: "cap-acid-base",
  pacelc: "pacelc",
};

function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={`${n} de 5`}>
      {"★".repeat(n)}
      <span className="stars-off">{"★".repeat(Math.max(0, 5 - n))}</span>
    </span>
  );
}

// Explicação de teoria de cada característica das tabelas — abre no modal do "?".
const CONCEPT: Record<string, string> = {
  modeloDados:
    "Como os dados são organizados. Relacional (SQL): tabelas com schema fixo e relações por chaves — forte em integridade e JOINs. NoSQL: chave-valor (acesso por chave, escala horizontal) ou documento (JSON aninhado, schema flexível). A escolha define como você modela e consulta.",
  consistencia:
    "ACID forte garante que toda leitura vê a última escrita confirmada (transações atômicas) — essencial pra saldo/ledger. BASE/eventual relaxa isso: as réplicas convergem 'em algum momento', trocando consistência imediata por disponibilidade e menor latência.",
  joins:
    "Capacidade de combinar dados de várias tabelas/coleções numa só consulta. Relacionais fazem JOIN nativo; NoSQL geralmente não (você desnormaliza ou junta na aplicação). A falta de JOIN força modelar por access patterns conhecidos.",
  transacoes:
    "Garante que um conjunto de operações acontece tudo-ou-nada (atomicidade). Relacionais suportam transação multi-tabela com MVCC; DynamoDB limita (até ~25-100 itens); documentos têm transação multi-doc nas versões recentes. Sem transação forte, você precisa de Saga e idempotência.",
  isolation:
    "Quanto uma transação enxerga das outras em andamento. Read Committed (só vê dados confirmados) é o padrão; Repeatable Read evita leituras fantasma; níveis mais altos custam mais lock. É o trade-off entre correção e concorrência.",
  escala:
    "Como o banco cresce com a carga. Vertical (scale-up): instância maior — simples, mas tem teto. Horizontal: mais nós (sharding/réplicas) — escala quase infinita, mais complexo. Auto/Serverless: ajusta sozinho conforme a demanda.",
  multiAzCusto:
    "Custo de manter cópias em múltiplas Zonas de Disponibilidade (AZs) pra alta disponibilidade. No Aurora as réplicas já vêm inclusas no storage; no RDS Multi-AZ você paga ~2× (standby ocioso). É o que dá failover automático sem perder dado.",
  failover:
    "Tempo até o banco se recuperar quando a instância primária cai. Aurora promove uma réplica em <30s; RDS Multi-AZ leva 60-120s; DynamoDB é transparente (sem failover visível). É o seu RTO efetivo no dia a dia.",
  indice:
    "Estrutura que acelera buscas. B-Tree: ótimo pra leitura ordenada e ranges (relacionais). LSM-Tree: otimizado pra escrita intensa, com leitura um pouco mais cara (DynamoDB, Cassandra). O índice errado vira gargalo.",
  storage:
    "Como o armazenamento é replicado pra durabilidade. Aurora mantém 6 cópias em 3 AZs (perde 2 sem perder escrita); RDS replica pra 1 standby; DynamoDB replica automaticamente em 3 AZs. Mais cópias = mais durável e disponível.",
  concorrencia:
    "Como o banco lida com escritas simultâneas no mesmo dado. MVCC (versionamento): leitores não bloqueiam escritores, cada um vê uma versão — alta concorrência. Optimistic lock: assume conflito raro, valida na hora de gravar e re-tenta se colidir.",
  cap:
    "Sob uma partição de rede (nós sem se falar), você só consegue 2 de 3: Consistência, Disponibilidade e Tolerância a Partição. Como partição é inevitável, a escolha real é CP (recusa a escrita pra não divergir — ledger) vs AP (sempre responde, converge depois — carrinho).",
  pacelc:
    "Estende o CAP: se há Partição (P), escolha A ou C; senão (Else, E), escolha Latência (L) ou Consistência (C). Mostra que mesmo SEM falha de rede há trade-off — replicar síncrono (consistente, mais lento) vs assíncrono (rápido, pode ler dado velho).",
  patterns:
    "Padrões de design (DDD/microsserviços) que combinam com este banco. Ex.: relacional + Transactional Outbox pra publicar eventos com segurança; DynamoDB + Single-Table Design; read models via CQRS. O banco certo destrava o pattern certo.",
  rpo:
    "Recovery Point Objective — quanto de dado você aceita perder numa falha, medido em tempo. RPO ~0 (standby síncrono) = não perde nada; RPO ~5min = pode perder os últimos minutos. Define o quão 'fresco' é o ponto de restauração.",
  rto:
    "Recovery Time Objective — quanto tempo até voltar a operar após uma falha. <30s (failover automático) vs 60-120s (Multi-AZ) vs horas (restore manual de backup). É a sua janela de indisponibilidade aceitável.",
  backtrackPitr:
    "PITR (Point-in-Time Recovery): restaurar o banco a qualquer instante dentro de uma janela (ex.: 35 dias) — salva de um DELETE acidental. Backtrack (Aurora): 'rebobina' o cluster pra um instante em segundos, sem restaurar uma cópia nova.",
  snapshots:
    "Backups pontuais. Automáticos: o banco tira sozinho na janela configurada e expiram após N dias. Manuais/On-Demand: você dispara e ficam até apagar. Snapshot é a base pra clonar ambientes e pra DR.",
  crossRegion:
    "Replicação/DR entre regiões AWS (geografias distintas). Aurora Global Database replica com RPO ~1s; DynamoDB Global Tables é ativo-ativo (escreve em qualquer região). Protege contra a queda de uma região inteira e aproxima o dado do usuário.",
  destaque:
    "O diferencial de resiliência deste banco — o que ele faz de melhor em backup/DR comparado aos outros.",
};

function ConceptTip({ label, explain, topic }: { label: string; explain: string; topic?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <>
      <button type="button" className="tip" onClick={() => setOpen(true)} aria-label={`O que é ${label}?`}>
        ?
      </button>
      {open ? (
        <div className="modal-overlay" onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{label}</h3>
              <button type="button" className="modal-close" onClick={() => setOpen(false)} aria-label="Fechar">
                ×
              </button>
            </div>
            <p className="modal-body">{explain}</p>
            {topic ? (
              <Link to={`/topics/${topic}`} className="modal-link" onClick={() => setOpen(false)}>
                Aprofundar na teoria →
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function DbCard({ d }: { d: DbRow }) {
  return (
    <Link to={`/databases/${d.id}`} className="db-study-card" style={cvar(d.color)}>
      <div className="dsc-head">
        <span className="dsc-cat">{d.category}</span>
        <Stars n={d.rating} />
      </div>
      <h3>{d.name}</h3>
      <div className="dsc-price">
        {d.price}
        <span>/mês</span>
      </div>
      <div className="dsc-engine">{d.engine}</div>
      <div className="dsc-specs">
        <div>
          <span>Instância</span>
          <b>{d.instancia}</b>
        </div>
        <div>
          <span>CAP · PACELC</span>
          <b>
            {d.cap} · {d.pacelc}
          </b>
        </div>
        <div>
          <span>Failover</span>
          <b>{d.failover}</b>
        </div>
        <div>
          <span>Storage</span>
          <b>{d.storage}</b>
        </div>
      </div>
      <span className="dsc-go">Ver detalhes →</span>
    </Link>
  );
}

function ScenarioCard({ s }: { s: DbScenario }) {
  const rec = BY_ID[s.recommendedDb];
  const ru = s.runnerUp ? BY_ID[s.runnerUp.db] : null;
  return (
    <div className="scenario-card" style={cvar(rec?.color ?? "var(--brand)")}>
      <div className="sc-head">
        <h3>{s.title}</h3>
        <Stars n={s.stars} />
      </div>
      <div className="sc-rec">
        <span className="badge">★ Recomendado</span>
        <Link to={`/databases/${s.recommendedDb}`} className="sc-rec-name">
          {rec?.name ?? s.recommendedDb}
        </Link>
        {rec ? <span className="db-price">{rec.price}/mês</span> : null}
      </div>
      <p className="muted">{s.summary}</p>
      <ul className="sc-points">
        {s.points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
      {ru && s.runnerUp ? (
        <div className="sc-runner">
          <span className="muted">Alternativa:</span> <Link to={`/databases/${s.runnerUp.db}`}>{ru.name}</Link> —{" "}
          {s.runnerUp.note}
        </div>
      ) : null}
    </div>
  );
}

function CompareTable<T extends { id: string; name: string; color: string }>({
  rows,
  dims,
  topicFor,
}: {
  rows: T[];
  dims: { key: keyof T; label: string; tip: string }[];
  topicFor?: (key: keyof T) => string | undefined;
}) {
  return (
    <div className="table-wrap">
      <table className="compare-table">
        <thead>
          <tr>
            <th>Característica</th>
            {rows.map((d) => (
              <th key={d.id} style={{ color: d.color }}>
                {d.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dims.map((dim) => (
            <tr key={String(dim.key)}>
              <td className="dim">
                {topicFor && topicFor(dim.key) ? (
                  <Link to={`/topics/${topicFor(dim.key)}`}>{dim.label}</Link>
                ) : (
                  dim.label
                )}{" "}
                <ConceptTip
                  label={dim.label}
                  explain={CONCEPT[String(dim.key)] ?? dim.tip}
                  topic={topicFor ? topicFor(dim.key) : undefined}
                />
              </td>
              {rows.map((d) => (
                <td key={d.id}>{String(d[dim.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Databases() {
  const cp = dbRows.filter((d) => d.cap === "CP");
  const ap = dbRows.filter((d) => d.cap === "AP");
  return (
    <div className="db-study">
      <h1>Bancos de Dados AWS</h1>
      <p className="lede">
        Seleção e comparação de banco para sistemas distribuídos — cards, comparativo técnico, backup/DR, CAP/PACELC e
        um decisor interativo. Cada banco tem detalhe fonteado.
      </p>

      <nav className="db-section-nav">
        <a href="#visao">Visão geral</a>
        <a href="#cenarios">Cenários</a>
        <a href="#comparativo">Comparativo</a>
        <a href="#dr">Backup / DR</a>
        <a href="#cap">CAP / PACELC</a>
        <a href="#teoria">Teoria</a>
        <Link to="/databases/builder">Monte seu banco →</Link>
      </nav>

      <section id="visao">
        <h2>Visão Geral</h2>
        <div className="db-study-grid">
          {dbRows.map((d) => (
            <DbCard key={d.id} d={d} />
          ))}
        </div>
      </section>

      <section id="cenarios">
        <h2>Recomendação por Cenário</h2>
        <div className="scenario-grid">
          {dbScenarios.map((s) => (
            <ScenarioCard key={s.id} s={s} />
          ))}
        </div>
      </section>

      <section id="comparativo">
        <h2>Comparativo Técnico (6 opções)</h2>
        <p className="muted">Clique no “?” pra a explicação de cada conceito; a característica com link abre a teoria completa.</p>
        <CompareTable rows={dbRows} dims={COMPARE_DIMS} topicFor={(k) => TOPIC_FOR_DIM[k]} />
      </section>

      <section id="dr">
        <h2>Backup, DR e Resiliência</h2>
        <p className="muted">Clique no “?” de cada linha pra entender o conceito (RPO, RTO, PITR…).</p>
        <CompareTable rows={dbDr} dims={DR_DIMS} topicFor={() => "spof-dr"} />
      </section>

      <section id="cap">
        <h2>CAP / PACELC</h2>
        <p className="muted">
          Sob partição de rede (CAP) é impossível ter Consistência <em>e</em> Disponibilidade — escolhe 2. O PACELC
          estende: mesmo sem partição (Else), há trade-off Latência×Consistência. Aprofunde em{" "}
          <Link to="/topics/cap-acid-base">CAP, ACID e BASE</Link> e <Link to="/topics/pacelc">PACELC</Link>.
        </p>
        <div className="cap-grid">
          <div className="cap-col cp">
            <h3>CP — Consistência sob partição</h3>
            <p className="muted">Recusa a escrita em vez de divergir. Ledger, saldo, transações.</p>
            <div className="cap-chips">
              {cp.map((d) => (
                <Link key={d.id} to={`/databases/${d.id}`} className="chip" style={{ borderColor: d.color, color: d.color }}>
                  {d.name} · {d.pacelc}
                </Link>
              ))}
            </div>
          </div>
          <div className="cap-col ap">
            <h3>AP — Disponibilidade sob partição</h3>
            <p className="muted">Sempre responde, converge depois. Read models, carrinho, cache.</p>
            <div className="cap-chips">
              {ap.map((d) => (
                <Link key={d.id} to={`/databases/${d.id}`} className="chip" style={{ borderColor: d.color, color: d.color }}>
                  {d.name} · {d.pacelc}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="teoria">
        <h2>Teoria &amp; conceitos</h2>
        <p className="muted">
          O que está por trás de cada decisão — clique pra explicação fonteada. Cada banco também tem suas fontes
          (docs AWS + <em>System Design Workbook</em>) na página de detalhe.
        </p>
        <div className="theory-grid">
          <div className="theory-col">
            <h3>Fundamentos</h3>
            <Link to="/topics/cap-acid-base">Teorema CAP, ACID e BASE</Link>
            <Link to="/topics/pacelc">Teorema PACELC</Link>
            <Link to="/topics/databases-indexing">Modelos de dados &amp; indexação</Link>
            <Link to="/topics/concurrency-parallelism">Concorrência &amp; MVCC</Link>
          </div>
          <div className="theory-col">
            <h3>Escala &amp; resiliência</h3>
            <Link to="/topics/sharding-partitioning">Sharding &amp; particionamento</Link>
            <Link to="/topics/data-replication">Replicação de dados</Link>
            <Link to="/topics/caching">Estratégias de cache</Link>
            <Link to="/topics/spof-dr">SPOF &amp; Disaster Recovery</Link>
          </div>
          <div className="theory-col">
            <h3>Patterns que combinam</h3>
            <Link to="/patterns/event-sourcing">Event Sourcing</Link>
            <Link to="/patterns/cqrs">CQRS</Link>
            <Link to="/patterns/saga">Saga</Link>
            <Link to="/patterns/transactional-outbox">Transactional Outbox</Link>
            <Link to="/patterns/idempotent-consumer">Idempotent Consumer</Link>
            <Link to="/patterns/database-per-service">Database per Service</Link>
          </div>
        </div>
      </section>

      <section id="decisor">
        <Link to="/databases/builder" className="hero-card db-builder-cta">
          <h2>Monte seu banco — decisor interativo</h2>
          <p className="muted">
            Responda 5 perguntas do seu caso (ACID, JOINs, workload, latência, custo) e veja o banco recomendado, com o
            placar recalculando ao vivo.
          </p>
          <span className="btn btn-primary">Abrir o decisor →</span>
        </Link>
      </section>
    </div>
  );
}
