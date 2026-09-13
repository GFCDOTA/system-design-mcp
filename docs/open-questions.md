# Open Questions

Dúvidas e hipóteses assumidas, registradas em vez de escondidas (regra do projeto:
na dúvida, registrar e seguir com a melhor hipótese explícita).

| # | Questão | Hipótese assumida | Impacto se errada |
|---|---------|-------------------|-------------------|
| OQ-1 | O código Go dos repos foi lido via README + árvore de arquivos, não linha a linha. | Citações `repo:<arquivo>` apontam o arquivo provável do conceito (ex.: `pkg/hashring/` p/ hashing consistente). | Baixo — o conceito está correto; o caminho exato do arquivo pode variar. |
| OQ-2 | Páginas exatas de subtópicos finos do PDF. | Citei a página do início da seção (do sumário) e confirmei o trecho no texto extraído. | Baixo — a página pode estar ±1 do parágrafo exato. |
| OQ-3 | `Polling Publisher` e `Transaction Log Tailing` não têm capítulo próprio no workbook. | Tratados como **referência conceitual** (microservices.io) e relacionados ao Outbox / `routines/` do `msc-transactions-api`. | Médio — são padrões reais, só não detalhados pela fonte primária. |
| OQ-4 | Versão do Spring Boot. | 3.4.x (estável, baseline Java 21) — o material não exige versão. | Baixo. |
| OQ-5 | Idioma do conteúdo. | PT-BR (fonte e público são PT-BR; código/identificadores em inglês). | Baixo. |
| OQ-6 | Mapeamento exato dos read models do ledger. | ScyllaDB = saldo (LWT por versão), MongoDB = extrato (dedup por erro 11000), conforme README do repo. | Baixo — confirmado no README. |
| OQ-7 | Números dos cenários de failure modes e drills. | São **didáticos** (`dataKind: "didactic"`) e coerentes entre si; números reais só quando a fonte citada os publica. | Baixo — o risco seria tratá-los como benchmark; a UI e o MCP rotulam. |
| OQ-8 | Amazon Builders' Library ("Timeouts, retries and backoff with jitter", "Using load shedding", "Avoiding insurmountable queue backlogs") migrou para um SPA ilegível via fetch. | Não citadas; o conteúdo equivalente vem do Google SRE Book, Azure Architecture Center e blog de arquitetura da AWS (jitter). | Baixo — os conceitos estão cobertos por fontes lidas. |
| OQ-9 | Terminologia varia entre fontes (ex.: o paper do memcache chama de "thundering herd" o que outros chamam de cache stampede; a Azure aproxima retry storm de thundering herd). | Os failure modes definem pelo **mecanismo** e registram a variação em `aliases`/`confusedWith`. | Baixo. |
| OQ-10 | O `msc-transactions-api` declara idempotência, mas a leitura foi via README (OQ-1): não se sabe se o claim é atômico. | A q36 descreve o desenho robusto (UNIQUE antes do efeito) sem afirmar que o repositório o implementa assim. | Baixo. |

Nenhuma destas bloqueia o uso do Lab; todas têm a fonte rastreável em
`docs/source-inventory.md` para auditoria.
