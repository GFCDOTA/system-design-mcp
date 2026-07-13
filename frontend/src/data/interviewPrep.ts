// Conteúdo de PREPARAÇÃO do Modo Entrevista.
//
// As perguntas de System Design vêm do backend (knowledge-base, com sourceRefs).
// Este módulo carrega o conteúdo de GUIA/DICAS (DSA, estratégia de System Design,
// comportamental & como chegar preparado) — orientação de estudo curada, não
// afirmação factual da KB, por isso vive no frontend e não passa pelo gate de
// integridade do BFF. Itens podem usar **negrito** e `code` (renderizados inline).
//
// GERADO por scratchpad/gen_prep.cjs a partir do workflow interview-mode-content.
// Editar o conteúdo aqui é OK (não há fonte de verdade externa).

export type PrepKind = "tips" | "steps" | "checklist" | "roadmap";

export interface PrepBlock {
  title: string;
  kind: PrepKind;
  note?: string;
  items: string[];
}

export interface PrepResource {
  label: string;
  url: string;
  note?: string;
}

export interface PrepPillar {
  intro: string;
  blocks: PrepBlock[];
  resources: PrepResource[];
}

export const dsaPrep: PrepPillar = {
  "intro": "Sem editor no app: aqui você aprende O QUE estudar, EM QUE ORDEM e COMO treinar pra resolver no LeetCode. O segredo de coding interview é reconhecer **padrões**, não decorar problemas — domine ~12 padrões e 80% das questões viram variação do que você já sabe.",
  "blocks": [
    {
      "title": "Roadmap de padrões",
      "kind": "roadmap",
      "items": [
        "**Arrays & Hashing** — quando precisa de lookup/contagem/dedup O(1) trocando memória por tempo. Canônico: `Two Sum`, `Group Anagrams`.",
        "**Two Pointers** — array/string **ordenado** ou par/palíndromo, varrendo das pontas pro meio. Canônico: `Valid Palindrome`, `3Sum`.",
        "**Sliding Window** — subarray/substring contígua que satisfaz uma condição (maior/menor/com K distintos). Canônico: `Longest Substring Without Repeating Characters`.",
        "**Stack / Monotonic Stack** — matching de pares, parsing, ou 'próximo maior/menor elemento'. Canônico: `Valid Parentheses`, `Daily Temperatures`.",
        "**Binary Search** — espaço **ordenado** ou monotônico, ou 'busca na resposta' (mínimo que satisfaz). Canônico: `Binary Search`, `Search in Rotated Sorted Array`.",
        "**Linked List** — ponteiros, reversão, ciclo (fast/slow), merge. Canônico: `Reverse Linked List`, `Linked List Cycle`.",
        "**Trees + BFS/DFS** — qualquer estrutura hierárquica; DFS p/ caminho/profundidade, BFS p/ nível/menor distância. Canônico: `Invert Binary Tree`, `Level Order Traversal`.",
        "**Heap / Priority Queue** — 'top K', K-ésimo maior, ou mesclar streams ordenados. Canônico: `Kth Largest Element`, `Merge K Sorted Lists`.",
        "**Intervals** — agendamento, sobreposição, merge de ranges; **ordene por início** primeiro. Canônico: `Merge Intervals`, `Meeting Rooms`.",
        "**Backtracking** — gerar todas as combinações/permutações/subsets; explorar e desfazer (`undo`). Canônico: `Subsets`, `Combination Sum`, `N-Queens`.",
        "**Graphs (BFS/DFS/Union-Find/Topo)** — grids, dependências, componentes conexos, ordenação topológica. Canônico: `Number of Islands`, `Course Schedule`.",
        "**Dynamic Programming** — subproblemas sobrepostos + escolha ótima; 1D, 2D, knapsack. Comece com memoização top-down. Canônico: `Climbing Stairs`, `House Robber`, `Coin Change`, `Longest Common Subsequence`."
      ],
      "note": "Faça nessa ordem: cada padrão constrói sobre o anterior. DP por último — é o mais difícil e o que mais assusta, mas vira mecânico depois dos fundamentos."
    },
    {
      "title": "As 16 questões mais cobradas",
      "kind": "checklist",
      "note": "Lista agregada de relatos de loops recentes (Apple/Google/Meta/Uber e afins) — cada uma exercita um padrão do roadmap acima. Use como set de treino: reconheça o padrão ANTES de codar, e marque as que já refaz de memória.",
      "items": [
        "**Implement LRU/LFU Cache** — design com `hash map + doubly linked list` (LRU) O(1); LFU adiciona buckets de frequência. A questão de design mais pedida que existe.",
        "**Find Median from Data Stream** — dois heaps balanceados (max-heap na metade menor, min-heap na maior); mediana em O(1), insert O(log n).",
        "**Word Ladder** — menor transformação = menor caminho → **BFS** num grafo implícito de palavras (vizinhos = 1 letra de diferença).",
        "**Merge K Sorted Lists** — heap com K ponteiros, O(n log k); alternativa divide & conquer. Par direto do padrão Heap.",
        "**Detect Cycle in a Directed Graph** — DFS com 3 estados (branco/cinza/preto) ou Kahn (topo sort); ciclo em dirigido ≠ visited simples.",
        "**Maximum Subarray Sum** — Kadane (DP 1D: estende ou recomeça); variações: circular, produto máximo.",
        "**Kth Largest Element in a Stream** — min-heap de tamanho K; o topo É a resposta. Custo O(log k) por elemento.",
        "**Design a Scheduler with Task Priorities** — priority queue + hash map de lookup; variação de design (pense em cancelamento e empate por timestamp).",
        "**Two Sum e variações** — hash map O(n); array ordenado → two pointers; k-sum → ordenar e reduzir recursivamente pra 2-sum.",
        "**Binary Search on Answer** — o espaço de busca é a RESPOSTA (capacidade, dias, peso máximo), não o array; ache o mínimo que satisfaz o predicado monotônico.",
        "**Longest Increasing Subsequence** — DP O(n²) primeiro; otimize com patience sorting + busca binária O(n log n).",
        "**Clone Graph / lista com random pointers** — hash map `original → cópia` + DFS/BFS; o mapa resolve os ponteiros arbitrários.",
        "**Serialize and Deserialize a Binary Tree** — DFS preorder com marcador de null (`#`); a deserialização consome a mesma ordem.",
        "**Trapping Rain Water** — two pointers com máximos das duas pontas (O(1) espaço) ou monotonic stack. Clássico absoluto.",
        "**Top K Frequent Elements** — contar com hash + heap de tamanho K (O(n log k)) ou bucket sort por frequência (O(n)).",
        "**Word Break** — DP 1D sobre prefixos (`dp[i]` = s[0..i) segmentável) com set do dicionário; trie acelera o inner loop."
      ]
    },
    {
      "title": "Como treinar de verdade",
      "kind": "tips",
      "items": [
        "**Timebox de 30-40min por problema.** Travou? Pare, leia a solução — não fique 2h no escuro, é desperdício.",
        "**Leu a solução? ENTENDA e refaça do ZERO em 2 dias** (spaced repetition). Resolver lendo não fixa; refazer de memória fixa.",
        "**Padrões > quantidade.** 100 problemas bem digeridos por padrão batem 500 chutados. Marque cada problema com o padrão que ele exercita.",
        "**Resolva falando em voz alta**, como na entrevista real. Articular o raciocínio é uma skill separada de codar — treine-a explicitamente.",
        "**Mantenha uma lista dos que errou** e revise-a semanalmente. O erro de hoje é a pergunta da entrevista de amanhã.",
        "**Reconheça o padrão antes de codar:** 'subarray contíguo → sliding window', 'top K → heap', 'todas as combinações → backtracking'. Esse reflexo é o que se treina.",
        "**Quando acertar, pergunte 'dá pra melhorar complexidade?'** Quase sempre dá — e é exatamente o follow-up que o entrevistador faz."
      ]
    },
    {
      "title": "O método numa questão",
      "kind": "steps",
      "items": [
        "**Clarifique input/output/constraints.** Tamanho de N? Há negativos/duplicatas? String é ASCII ou Unicode? Pode modificar o input? Constraints decidem a complexidade-alvo.",
        "**Dê exemplos e edge cases em voz alta.** Vazio, um elemento, todos iguais, já ordenado, valores extremos. Confirma que entendeu o problema.",
        "**Brute force primeiro.** Diga a solução óbvia e sua complexidade — mostra que você pensa antes de otimizar e te dá um baseline correto.",
        "**Otimize com o padrão.** 'Esse lookup repetido vira hash O(1)', 'esse subarray vira sliding window'. Explique o insight ANTES de codar.",
        "**Analise complexidade (tempo E espaço)** da solução otimizada antes de digitar. Concorde com o entrevistador no alvo.",
        "**Code limpo:** nomes claros, funções pequenas, sem variáveis crípticas. Código legível sinaliza senioridade tanto quanto a solução.",
        "**Teste com seus casos** — passe os exemplos e edge cases na cabeça, linha a linha. Ache o bug você, antes do entrevistador."
      ],
      "note": "Nunca pule direto pro código. Os passos 1-3 são onde se ganha (ou perde) a entrevista — o entrevistador avalia o PROCESSO, não só o resultado."
    },
    {
      "title": "Complexidade que cai",
      "kind": "tips",
      "items": [
        "**Decore a hierarquia:** `O(1)` < `O(log n)` < `O(n)` < `O(n log n)` < `O(n²)` < `O(2ⁿ)` < `O(n!)`. Saiba em que faixa cada padrão cai.",
        "**Hash map = O(1) lookup/insert médio** ao custo de O(n) de espaço. É o trade clássico tempo↔espaço (`Two Sum` de O(n²) → O(n)).",
        "**Ordenar custa O(n log n)** e habilita two pointers / binary search O(log n). Vale a pena se você fizer várias buscas depois.",
        "**Heap: push/pop O(log n)**, peek O(1). 'Top K' com heap de tamanho K = O(n log k), melhor que ordenar tudo O(n log n).",
        "**Binary search só em espaço ordenado/monotônico** — transforma O(n) em O(log n). Se está ordenado, pense nele primeiro.",
        "**Recursão/backtracking costuma ser exponencial** (O(2ⁿ), O(n!)); DP com memoização derruba pra polinomial cortando recálculo.",
        "**Pelas constraints estime o alvo:** N≤20 → exponencial ok; N≤10³ → O(n²) ok; N≤10⁵-10⁶ → precisa O(n) ou O(n log n); N≥10⁸ → O(log n) ou O(1).",
        "**Espaço também conta:** in-place O(1) vs cópia O(n). 'Dá pra fazer sem array auxiliar?' é follow-up comum."
      ]
    },
    {
      "title": "Como chegar preparado",
      "kind": "checklist",
      "items": [
        "Resolva **15-20 problemas por padrão** (mix easy→medium) até reconhecê-lo no automático.",
        "Use o **NeetCode 150 como alvo principal** — é a lista curada por padrão; completá-la cobre o grosso do que cai.",
        "**Refaça os que errou** até passar de memória; mantenha planilha com data/padrão/status (red→green).",
        "Faça **ao menos 2-3 mocks cronometrados** (Pramp, peer, ou solo com timer) simulando 45min de pressão real.",
        "Treine **falar em voz alta** durante os mocks — silêncio reprova mesmo com código certo.",
        "Foque **medium** — é o nível-padrão de entrevista; easy só pra aquecer, hard só se a vaga pedir.",
        "**Prepare o ambiente no dia:** teste o compartilhamento de tela / CoderPad / IDE, áudio e câmera ANTES da hora.",
        "Tenha **water/notas à mão** e um template mental dos 7 passos do método pra não congelar no começo."
      ],
      "note": "Meta realista: 2-4 semanas de prática consistente (1-2h/dia) cobrindo o NeetCode 150 te deixa pronto pra rounds de medium."
    },
    {
      "title": "Erros que reprovam",
      "kind": "tips",
      "items": [
        "**Pular a clarificação** e atacar a interpretação errada — você resolve perfeitamente o problema que não foi pedido.",
        "**Codar antes de pensar.** Digitar nos primeiros 2min sem expor a abordagem assusta o entrevistador e gera código que você reescreve.",
        "**Silêncio total.** Pensar calado parece travar. Narre: 'tô considerando hash aqui porque...'. O entrevistador avalia o raciocínio, não só o final.",
        "**Não testar o código.** Entregar sem rodar mentalmente os exemplos sinaliza descuido; ache o bug você primeiro.",
        "**Ignorar edge cases** — vazio, null, um elemento, overflow, duplicatas. É o primeiro lugar onde o entrevistador cutuca.",
        "**Não pedir/aceitar dicas.** Quando o entrevistador joga um hint, é de propósito — colaborar conta a favor; ignorar conta contra.",
        "**Brigar com complexidade** sem reconhecer. Saber dizer 'isso é O(n²), dá pra melhorar' já vale ponto mesmo sem chegar no ótimo."
      ]
    }
  ],
  "resources": [
    {
      "label": "LeetCode",
      "url": "https://leetcode.com/",
      "note": "Onde você pratica de verdade. Filtre por tag (padrão) e dificuldade; foque medium. Use a aba 'Solutions' só depois do timebox."
    },
    {
      "label": "NeetCode 150",
      "url": "https://neetcode.io/practice",
      "note": "Lista curada por padrão — seu alvo principal. Cada problema tem vídeo explicando o insight. Completá-la cobre o grosso das entrevistas."
    },
    {
      "label": "Grokking the Coding Interview (conceito de padrões)",
      "url": "https://www.educative.io/courses/grokking-the-coding-interview",
      "note": "Referência que popularizou o estudo POR PADRÃO em vez de por problema. Boa pra internalizar 'que padrão essa questão pede'."
    }
  ]
};

export const systemDesignPrep: PrepPillar = {
  "intro": "O banco já tem 35 perguntas de System Design — esta seção te dá o **método** pra resolver qualquer uma delas ao vivo. A tese de staff: **decisão sem trade-off é opinião; escala sem número é chute**. O que separa senior de staff não é citar mais padrões, é expor o trade-off de cada escolha e quantificar a carga. Use o framework abaixo pra conduzir, as duas ferramentas (`L = λ × W` + Scale Cube) pra dimensionar, e o cheatsheet pra estimar de cabeça. Depois aprofunde os temas fortes desta KB pelas 35 perguntas e pelos Tópicos do app.",
  "blocks": [
    {
      "title": "Framework de resposta",
      "kind": "steps",
      "note": "Anuncie em voz alta que vai seguir um método — isso já comunica senioridade. NUNCA pule da etapa 1 (requisitos) pra etapa 5 (caixas): resposta fraca desenha arquitetura sem ter dimensionado carga nem decidido consistência.",
      "items": [
        "**Requisitos** — separe **funcionais** (o que faz: debitar, creditar, consultar saldo/extrato) de **não-funcionais** (consistência, latência-alvo, disponibilidade, auditabilidade, RTO/RPO). Pergunta que muda tudo: *\"tolera consistência eventual ou exige imediata?\"*",
        "**Estimativas de capacidade** — vire o sistema em números ANTES de desenhar caixas: TPS médio e de pico, payload médio, concorrência interna, banda. Sem isto você não sabe se precisa de 1 réplica ou de sharding.",
        "**APIs / contratos** — defina comandos e queries. Em event-driven: **comandos** entram (`conta_criada`, `conta_movimentacao`), **confirmações** saem como eventos de domínio.",
        "**Data model** — separe **estado de escrita** do **estado de leitura** se for CQRS. Num ledger: escrita = `append-only` de eventos; leitura = projeções (saldo, extrato).",
        "**Arquitetura** — só agora desenhe gateway, balanceador, serviços, broker, stores. Cada caixa precisa justificar sua existência.",
        "**Escala** — aplique o **Scale Cube**: replique (X), decomponha (Y), particione (Z). Diga **em que ordem** aplica cada eixo e por quê.",
        "**Trade-offs** — pra cada decisão grande, nomeie o que ganhou e o que pagou: latência ↔ consistência, simplicidade ↔ acoplamento, custo ↔ resiliência.",
        "**Riscos** — onde está o **SPOF**? o **dual-write**? qual o **blast radius** de uma falha? como reprocessa? Antecipar o risco antes do entrevistador apontar é o sinal mais forte de staff."
      ]
    },
    {
      "title": "Estimativa: as 2 ferramentas",
      "kind": "tips",
      "note": "Frase que conecta as duas: \"X é grátis, Y custa acoplamento, Z custa engenharia de dados. Eu só pago Z quando a Lei de Little me mostra que o banco é o gargalo.\"",
      "items": [
        "**Lei de Little — `L = λ × W`.** `λ` = taxa de chegada (req/s), `W` = tempo médio no sistema, `L` = itens simultaneamente em processamento/espera. Estima a **concorrência interna** de um sistema estável só com duas médias.",
        "**Exemplo numérico:** `λ = 1500 msg/s`, `W = 50ms = 0,05s` → `L = 1500 × 0,05 = 75` mensagens em voo. Esse `L=75` dimensiona quantos consumidores/threads você precisa.",
        "**W explode L:** subir `W` de 50→85ms já leva `L` de 75→127 (+52 só por +35ms). Por isso um serviço em p95 saudável degrada violento em p99 sob *burst* sem a CPU parecer saturada — o problema é **variabilidade temporal**, não recurso bruto.",
        "**Duas alavancas ao vivo:** pra absorver o dobro de carga, ou aumenta μ (mais réplicas/partições) ou reduz `W` (otimiza processamento). `W_alvo = L_alvo / λ`. Cite também o **TPS sistêmico** = `min(TPS_app, TPS_db, TPS_cache, TPS_broker)`: o throughput é sempre limitado pelo menor gargalo do caminho.",
        "**Scale Cube (Abbott & Fisher) — 3 eixos, aplicar em ordem de complexidade crescente.** **X = replicação:** réplicas idênticas atrás do load balancer; exige *statelessness*; custo baixo. **Y = decomposição funcional:** quebrar em microsserviços que escalam isolados (um CPU-bound, outro I/O-bound); custo médio (acoplamento, contratos). **Z = sharding:** particionar dados por *sharding key* e rotear ao shard certo; custo alto (rebalanceamento, hot partitions), mas reduz blast radius.",
        "**Como usar na pergunta \"escale de 100 → 1.000 → 10.000 TPS\":** primeiro **X** (resolve a maioria, é o mais barato) → depois **Y** quando funções têm perfis de recurso diferentes (saldo é leitura pesada, movimentação é escrita transacional) → por último **Z**, só quando a camada de DADOS vira o gargalo. O Scale Cube é mapa mental, não governança."
      ]
    },
    {
      "title": "Cheatsheet de números",
      "kind": "tips",
      "note": "Decore estes para estimar de cabeça sem travar. Ordens de grandeza valem mais que precisão — declare a premissa e siga.",
      "items": [
        "**Segundos por dia ≈ 86.400 (~86,4k).** 1 milhão req/dia ≈ **~12 req/s** de média; multiplique por 5–10x pro pico. Use sempre pico, não média.",
        "**Latências típicas:** referência a memória ~100 ns; leitura aleatória em SSD ~100 µs (~1000x a memória); ida-e-volta de rede no mesmo datacenter ~0,5 ms; **cross-region (ex. EUA↔Europa) ~100–150 ms**. Regra: rede entre regiões domina tudo — minimize round-trips cross-region no caminho quente.",
        "**Throughput de 1 máquina:** um serviço web stateless aguenta na ordem de **~1k–10k QPS** por instância (depende de `W`: use `L = λ × W` pra checar). Cache em memória (Redis) ~100k+ ops/s. Um broker Kafka particionado escala por nº de partições.",
        "**Tamanhos típicos:** linha de DB transacional ~100 B – 1 KB; documento/objeto JSON ~1 KB; imagem ~100 KB – 1 MB; vídeo varia por minuto. Storage/dia ≈ `escritas/s × tamanho × 86.400`.",
        "**Banda:** `QPS × payload`. Ex.: 1.000 req/s × 1 KB ≈ 1 MB/s ≈ ~8 Mbps. Some headers e overhead de protocolo e arredonde pra cima.",
        "**Saturação não-linear:** CPU/memória degradam por volta de **80–85%** — incrementos marginais já inflam filas. Não planeje pra 100% de utilização."
      ]
    },
    {
      "title": "Como conduzir falando",
      "kind": "tips",
      "note": "Roteiro de 4 minutos pra um ledger event-sourced — adapte a estrutura a qualquer sistema. A maneira de falar é avaliada tanto quanto o desenho.",
      "items": [
        "**Pense em voz alta e dirija o whiteboard.** Você conduz a entrevista, não espera ser conduzido. Cada caixa que desenha, narre por que ela existe.",
        "**Declare premissas explícitas:** *\"vou assumir 10M de usuários, 5% ativos no pico, payload de ~1KB — me corrija se for outra ordem.\"* Premissa errada é barata de ajustar; silêncio é caro.",
        "**Time-box cada fase.** Roteiro de 4 min: (1) separo comando de evento; (2) Event Store append-only/imutável me dá auditoria e reconstituição de graça; (3) comito evento + projeções juntos e publico no Kafka só pós-commit → sem dual-write; (4) saldo e extrato têm acessos diferentes → stores diferentes (Scylla/Mongo) via CQRS; (5) consistência eventual entre stores, forte no Event Store, semissíncrono pro saldo; (6) **trade-off final** explícito.",
        "**Comece simples e evolua.** Desenhe a versão de 1 réplica primeiro, depois aplique X→Y→Z conforme a carga aperta. Não chegue com microsserviços + sharding no slide 1 — isso parece over-engineering, não senioridade.",
        "**Feche com o trade-off, sempre:** *\"pago complexidade operacional e latência leitura-escrita em troca de auditabilidade total, reconstituição e escala de leitura independente.\"* Decisão sem trade-off nomeado é só preferência."
      ]
    },
    {
      "title": "As 16 mais cobradas nas big techs",
      "kind": "checklist",
      "note": "Lista agregada de relatos de loops recentes — são os enunciados que mais se repetem. Ataque TODAS com o framework acima (requisitos → números → APIs → dados → arquitetura → escala → trade-offs → riscos); ao lado de cada uma, o eixo que o entrevistador quer ver. Onde esta KB aprofunda, mergulhe no banco de perguntas.",
      "items": [
        "**Chat escalável (WhatsApp/Slack)** — WebSocket/long-polling, fan-out de mensagem, presença, ordenação por conversa, delivery receipts. Consistência por conversa ≈ ordem por agregado (a KB cobre em eventos).",
        "**URL Shortener** — o clássico de aquecimento: geração de chave (hash vs contador+base62), redirect 301/302, cache de leitura pesada, analytics assíncrono.",
        "**Sistema de Notificações distribuído** — fan-out para push/e-mail/SMS, filas por canal, retry + DLQ, idempotência e rate por usuário. A KB aprofunda retry/DLQ e idempotência de consumidores.",
        "**Video Streaming (YouTube/Netflix)** — upload → transcoding assíncrono (fila), armazenamento de chunks, CDN + adaptive bitrate (HLS/DASH); metadados ≠ bytes de vídeo.",
        "**Sistema de Pagamentos (Stripe/Razorpay)** — o ponto MAIS forte desta KB: ledger auditável, idempotência, outbox/dual-write, saga sem 2PC, escala 100→10.000 TPS. Treine pelo banco de perguntas inteiro.",
        "**API Rate Limiter** — token bucket vs sliding window, estado no Redis (atomicidade via Lua/INCR+TTL), decisão local vs distribuída, resposta 429 e headers.",
        "**Checkout de E-commerce** — reserva de estoque vs oversell, pagamento como saga com compensação, carrinho consistente, idempotência do 'place order'. Cruza direto com as perguntas de saga/outbox da KB.",
        "**Ride-Hailing (Uber)** — matching motorista↔passageiro, indexação geoespacial (geohash/H3), localização em tempo real (stream), surge pricing e dispatch com baixa latência.",
        "**Search Autocomplete** — trie/índice de prefixos com top-K por prefixo, agregação offline de frequência + merge online, cache agressivo, latência p99 de dígito único em ms.",
        "**Distributed Cache (Redis)** — consistent hashing (a KB tem pergunta dedicada), políticas de eviction (LRU), invalidação, cache-aside vs write-through, hot keys.",
        "**CDN** — hierarquia edge→origin, cache HTTP (TTL, invalidação, cache key), roteamento por anycast/DNS, o cheatsheet de latência cross-region acima é o argumento central.",
        "**Google Docs (edição colaborativa)** — o diferencial é concorrência: OT vs CRDT, presença/cursores via WebSocket, snapshots + log de operações (parente do event sourcing da KB).",
        "**Distributed Job Scheduler** — agendamento com fila ordenada por tempo, workers com lease/heartbeat, exactly-once impossível → idempotência + at-least-once, cron distribuído sem SPOF.",
        "**Feed de rede social (Twitter/Instagram)** — fan-out on write vs on read (o trade-off É a resposta), celebrity problem, ranking assíncrono, paginação por cursor.",
        "**File Storage (Dropbox/Drive)** — chunking + deduplicação por hash de bloco, sync delta, metadados fortemente consistentes vs blobs eventual, resumable upload.",
        "**Distributed ID Generator** — Snowflake: timestamp + machine id + sequência; monotonicidade vs coordenação, clock skew, por que UUID aleatório machuca índice de banco."
      ]
    },
    {
      "title": "Onde esta KB é forte",
      "kind": "tips",
      "note": "As 35 perguntas e os Tópicos do app aprofundam exatamente estes eixos, ancorados no System Design Workbook + 3 repos de referência. Use-os pra treinar resposta detalhada + trade-offs + riscos de cada tema.",
      "items": [
        "**Consistência distribuída** — CAP/PACELC, ACID vs BASE, consistência **por operação, não global** (saldo exige atomicidade; extrato tolera eventual — decida por agregado). Aprofunde nas perguntas de consistência eventual e modelagem de read models.",
        "**Event Sourcing / CQRS / Saga / Outbox** — Event Store append-only imutável, separar estado de escrita/leitura, **Saga com compensação no lugar de 2PC**, **Transactional Outbox** e publicação pós-commit pra matar o **dual-write**. Tema mais denso da KB; tem perguntas de quando USAR e quando é over-engineering.",
        "**Sharding / replicação** — escolha de *sharding key*, **consistent hashing** (por que é melhor que `hash % N` quando o nº de shards muda), hot partitions, nº de partições de tópico Kafka e o que limita o paralelismo de consumo.",
        "**Resiliência** — **circuit breaker**, **bulkhead** (isolar falha de um shard), **cell-based** / blast radius contido, retry + **DLQ** + reprocessamento com *backpressure*, e observabilidade (RED / USE / Four Golden Signals).",
        "**Como praticar:** pra cada pergunta, force-se a produzir os 4 itens — resposta curta, resposta detalhada, **trade-off** e **risco**. Cruze com os Tópicos do app pra ver o padrão em mais de um contexto e fixar a frase de impacto."
      ]
    },
    {
      "title": "Armadilhas",
      "kind": "tips",
      "note": "O entrevistador staff está medindo se você evita exatamente estes erros. Reconhecer quando NÃO usar o padrão sofisticado é tão staff quanto saber projetá-lo.",
      "items": [
        "**Pular requisitos** — ir direto pra arquitetura sem separar funcional/não-funcional nem decidir o nível de consistência. É a causa nº1 de resposta fraca.",
        "**Over-engineering** — chegar com microsserviços + sharding + Event Sourcing antes da carga justificar. Saber dizer *\"aqui um monolito com 1 réplica resolve\"* é sinal de senioridade, não de fraqueza.",
        "**Ignorar trade-offs** — listar padrões sem dizer o que cada um custa. Toda decisão grande precisa do par ganho/custo nomeado, senão é só preferência pessoal.",
        "**Não dimensionar** — desenhar caixas sem `L = λ × W` nem TPS sistêmico. Sem número você não sabe onde está o gargalo real.",
        "**Esquecer falha / observabilidade / segurança** — não mapear SPOF, dual-write, hot partition, blast radius; esquecer logs/métricas/traces; não validar input nas APIs financeiras nem definir RTO/RPO. Antecipe o risco antes de perguntarem."
      ]
    }
  ],
  "resources": [
    {
      "label": "System Design Primer",
      "url": "https://github.com/donnemartin/system-design-primer",
      "note": "Repo de referência com estimativas, padrões e estudos de caso — ótimo pra fixar o cheatsheet de números e os trade-offs."
    },
    {
      "label": "ByteByteGo",
      "url": "https://bytebytego.com/",
      "note": "Diagramas e deep-dives visuais de arquiteturas reais — bom pra treinar o desenho high-level e o vocabulário de escala."
    }
  ]
};

export const behavioralPrep: PrepPillar = {
  "intro": "A parte comportamental decide tanto quanto a técnica — em pleno/sênior, o entrevistador já assume que você codifica; ele quer ver **julgamento, ownership e como você age sob pressão e em conflito**. A regra de ouro: nada de respostas genéricas. Chegue com **histórias reais, específicas e quantificadas**, ensaiadas em voz alta mas não decoradas. Prepare uma vez um banco de histórias no formato STAR e reuse em qualquer pergunta. Abaixo, o kit completo: o método, as histórias pra ter na manga, as perguntas que vão cair (e o que elas medem de verdade), o que perguntar de volta, e a logística pra não tropeçar no básico.",
  "blocks": [
    {
      "title": "Método STAR — a estrutura de toda resposta comportamental",
      "kind": "steps",
      "items": [
        "**Situação (10-15s):** monte o cenário com o mínimo de contexto pra entender o problema — projeto, time, o que estava em jogo. Não gaste 1 minuto descrevendo a empresa; vá direto ao que importa. Ex.: 'Numa migração de monólito pra serviços, o checkout começou a estourar latência em produção.'",
        "**Tarefa (10-15s):** qual ERA o seu papel e responsabilidade ali. Deixe claro o que dependia de VOCÊ, não do time genérico. 'Eu era o responsável pelo serviço de pagamentos e precisava derrubar o p99 abaixo de 300ms sem janela de manutenção.'",
        "**Ação (40-60s, o coração):** o que VOCÊ fez, em primeira pessoa do singular. Use 'eu fiz/decidi/propus', não 'a gente fez'. Mostre o raciocínio: as opções que considerou, o trade-off que escolheu e por quê. É aqui que a senioridade aparece — decisão técnica + justificativa, não só execução.",
        "**Resultado (15-20s) — SEMPRE quantifique:** número, antes/depois, impacto de negócio. 'Cortei o p99 de 1,2s pra 240ms, reduzi custo de infra em ~30% e zerei os timeouts de checkout.' Sem número, a história soa inventada.",
        "**Feche com o aprendizado:** uma frase do que você levou daquilo. Mostra reflexão e maturidade — e conecta naturalmente com a próxima pergunta.",
        "**Cronometre: 1 a 2 minutos por história.** Mais que isso, o entrevistador desliga. Ensaie em voz alta e grave-se uma vez pra ouvir onde você enrola. Decorar palavra-por-palavra soa robótico — decore a ESTRUTURA e os números, improvise as palavras."
      ],
      "note": "Em pleno/sênior, o entrevistador procura ownership e trade-offs explícitos. 'A gente' apaga seu papel — fale 'eu' sem medo de parecer arrogante; é o que ele precisa medir."
    },
    {
      "title": "Histórias pra ter prontas (escreve uma vez, reusa sempre)",
      "kind": "checklist",
      "items": [
        "**Conflito com colega:** desacordo técnico ou de prioridade resolvido com dados/protótipo, não no grito. Mostre que separou a pessoa do problema e chegou num caminho melhor que a sua proposta original.",
        "**Uma falha/erro SEU e o que aprendeu:** deploy que derrubou produção, decisão de arquitetura que voltou pra te morder. Assuma a culpa sem se autodepreciar, foque no aprendizado e no que mudou no seu processo (post-mortem, teste, guardrail) pra não repetir.",
        "**Liderança sem autoridade:** você puxou uma iniciativa (migração, padronização, redução de dívida técnica) e convenceu pares/outros times sem ser o chefe deles — por influência, exemplo e clareza de proposta.",
        "**Prazo apertado:** como você negociou escopo, cortou o supérfluo, comunicou risco cedo e entregou o que importava. Cuidado: não venda 'virei a noite e fiz tudo' — venda priorização e comunicação.",
        "**Ambiguidade / escopo indefinido:** pediram algo vago, você fez as perguntas certas, fatiou, validou hipótese cedo e destravou. Sêniores ganham pontos aqui — mostra que você cria clareza, não espera ela chegar.",
        "**Feedback difícil — dado E recebido:** uma vez que você deu um feedback duro a um colega/liderado com tato, e uma vez que recebeu um feedback que doeu e usou pra crescer. Duas histórias separadas.",
        "**Decisão técnica polêmica / trade-off:** escolha de tecnologia, padrão ou abordagem que dividiu o time. Mostre como pesou prós/contras, custo de manutenção, reversibilidade — e como lidou com quem discordou depois.",
        "**Mentoria / fazer o time crescer:** você acelerou um júnior/par — code review didático, pairing, onboarding, documentação. Sinaliza que você multiplica em vez de só produzir.",
        "**Lidar com legado:** entrou num código sem testes/documentação e o domou — caracterização por testes, refatoração incremental, strangler fig. Mostra disciplina e respeito ao que existe, não 'reescrevi tudo do zero'.",
        "**Bônus — projeto do qual mais se orgulha:** o seu maior impacto técnico+negócio, sua narrativa-âncora. É a que você quer plantar mesmo que não perguntem diretamente.",
        "**Bônus — desacordo com a liderança/decisão de produto:** você discordou de cima, argumentou com respeito, e ou convenceu ou 'disagree and commit'. Maturidade pura."
      ],
      "note": "Monte um documento com ~10 histórias em STAR cru. A maioria das perguntas comportamentais é remix dessas — você só escolhe a que melhor encaixa. Evite usar a MESMA história pra tudo; tenha 2-3 versões de projetos diferentes."
    },
    {
      "title": "Perguntas comuns + o que o entrevistador REALMENTE mede",
      "kind": "tips",
      "items": [
        "**'Fale de você' / 'me conta sua trajetória':** NÃO é pra recitar o currículo. Mede: você sabe se comunicar de forma estruturada e vender seu valor em 90s? Use o formato presente→passado→futuro: o que você faz hoje e é bom, 1-2 marcos que provam isso, e por que essa vaga é o próximo passo lógico. Termine mirando na empresa.",
        "**'Maior desafio / problema mais difícil':** mede profundidade técnica REAL e capacidade de destrinchar complexidade. Escolha algo de fato difícil (escala, concorrência, dado inconsistente, sistema distribuído), não 'um bug chato'. Mostre o raciocínio, não só o final feliz.",
        "**'Por que está saindo / por que saiu':** mede maturidade e red flags. NUNCA fale mal do chefe/empresa atual — soa como você vai falar deles depois. Enquadre em busca (crescimento, escala, novo domínio, aprendizado), não em fuga. Positivo e pra frente.",
        "**'Forças e fraquezas':** força — escolha uma RELEVANTE pra vaga e prove com exemplo, não adjetivo vazio. Fraqueza — uma REAL (não 'sou perfeccionista demais', clichê que queima) + o que você ATIVAMENTE faz pra mitigar. Mede autoconsciência e honestidade, não perfeição.",
        "**'Por que essa empresa / por que essa vaga':** mede se você pesquisou ou está aplicando no atacado. Cite algo específico — o produto, o problema de engenharia que eles têm, a stack, a cultura, um post de blog deles. Conecte com o que VOCÊ quer. Genérico aqui = desinteresse.",
        "**'Onde se vê em 3-5 anos':** mede ambição alinhada e se você vai ficar. Mostre direção (aprofundar como IC/tech lead, dominar tal domínio) sem soar que quer o cargo do entrevistador amanhã nem que está de passagem.",
        "**'Conte sobre um conflito/desacordo':** mede inteligência emocional e como você opera em time. O que avaliam: você ataca o problema e não a pessoa, busca dados, e o desfecho foi construtivo. Eles temem o 'gênio tóxico'."
      ],
      "note": "Regra transversal: para TODA pergunta comportamental ('conte uma vez que...'), responda em STAR. Para perguntas de opinião/motivação ('por que...'), seja específico e ancore na empresa/vaga."
    },
    {
      "title": "Perguntas pra VOCÊ fazer no fim (sinalizam senioridade)",
      "kind": "tips",
      "items": [
        "**'Como é o on-call e a resposta a incidentes?'** — rotação, frequência de paginação, se há post-mortem blameless. Sinaliza que você pensa em operação, não só em escrever feature. Resposta evasiva aqui é um sinal sobre a saúde do time.",
        "**'Como é o processo de deploy e CI/CD?'** — frequência de deploy, automação, tempo de lead, como fazem rollback. Mede a maturidade de engenharia deles e mostra que você liga pra entrega contínua.",
        "**'Como vocês medem sucesso nesse cargo nos primeiros 3-6 meses?'** — força clareza de expectativa e mostra que você é orientado a resultado e quer entregar, não só ocupar a cadeira.",
        "**'Qual o maior desafio técnico do time hoje?'** — te dá um retrato honesto da dor real e abre espaço pra você conectar sua experiência. Ótima pergunta pra um sênior.",
        "**'Como é o crescimento de carreira aqui — trilha de IC vs. gestão, como funciona a progressão?'** — mostra ambição e que você planeja ficar e evoluir.",
        "**'Como são tomadas as decisões técnicas — RFC, tech lead, consenso? Como vocês lidam com dívida técnica?'** — sondagem fina de cultura de engenharia; separa time maduro de cowboy coding.",
        "**'Como está estruturado o time e como ele colabora com produto/design?'** — entende onde você encaixa e como o trabalho flui.",
        "**Tática:** anote 5-6 perguntas, mas adapte ao que surgiu na conversa (mostra escuta ativa). Não pergunte salário/férias na PRIMEIRA etapa técnica — isso é fase de proposta. NUNCA diga 'não tenho perguntas': lê como desinteresse."
      ],
      "note": "A entrevista é mão dupla — você também está avaliando se quer trabalhar lá. Boas perguntas, além de marcar pontos, te protegem de aceitar um lugar ruim."
    },
    {
      "title": "Véspera e dia da entrevista",
      "kind": "checklist",
      "items": [
        "**Pesquisar a empresa:** produto (use/explore se der), modelo de negócio, stack (vagas antigas, blog de engenharia, GitHub, StackShare), notícias recentes e cultura. Tenha 1-2 fatos específicos pra citar.",
        "**Revisar o SEU currículo linha por linha:** saiba defender CADA bullet. Se está lá, podem perguntar — 'você botou Kafka, me conta uma decisão difícil que você tomou com ele'. Nada de fachada que você não sustenta.",
        "**Releia a descrição da vaga** e pré-mapeie qual das suas histórias STAR encaixa em cada requisito-chave.",
        "**Prepare o ambiente técnico (na véspera, não na hora):** teste câmera, microfone (use fone), internet (tenha plano B — 4G/roteamento), e a ferramenta de código compartilhado (CoderPad/HackerRank/IDE) abrindo sem susto. Cenário neutro e bem iluminado.",
        "**Tenha à mão, em outra tela/papel:** seu currículo, o doc de histórias STAR resumido, suas perguntas pro entrevistador, e a descrição da vaga. Não pra ler ao vivo — pra ancorar se travar.",
        "**Durma bem** na véspera — cérebro cansado erra lógica e gagueja em comportamental. Vale mais que mais uma hora estudando.",
        "**Água por perto** — boca seca em entrevista longa atrapalha; e dá um respiro legítimo pra pensar antes de responder.",
        "**Entre 5 minutos antes** (testa link/sala), banheiro antes, celular no silencioso, avise em casa pra não interromper.",
        "**Aquecimento mental:** revise rápido suas 3 melhores histórias e os números delas. Respire. Lembre que é uma conversa entre pares, não um interrogatório."
      ],
      "note": "90% dos perrengues de entrevista remota são áudio/vídeo/internet resolvíveis na véspera. Não deixe o básico te custar a vaga."
    },
    {
      "title": "Logística e sinais de alerta (red flags)",
      "kind": "tips",
      "items": [
        "**Alinhe nível e pretensão salarial CEDO** (com o recrutador, antes das técnicas): confirme se a vaga é pleno ou sênior de fato e se a faixa bate com a sua expectativa. Evita gastar 4 etapas pra descobrir que o budget é metade. Dê faixa, não número cravado, e ancore em pesquisa de mercado.",
        "**Confirme o desenho do processo:** quantas etapas, formato de cada (system design? live coding? take-home? quanto tempo cada?), prazo de feedback. Saber o que vem te deixa preparado e mostra organização.",
        "**Red flag — alta rotatividade:** se o time inteiro tem <1 ano de casa, ou pessoas saem rápido, pergunte direto 'há quanto tempo o time está junto?'. Pode indicar problema de gestão/burnout.",
        "**Red flag — processo caótico:** remarcações constantes, entrevistador despreparado que não leu seu currículo, falta de retorno, escopo da vaga muda a cada conversa. Reflete a desorganização interna.",
        "**Red flag — evasivas sobre on-call/horas/work-life:** se desconversam sobre carga de plantão, horas extras 'na cultura', ou 'aqui a gente veste a camisa', desconfie. Pergunte concreto: 'qual a frequência de paginação fora do horário no último trimestre?'.",
        "**Red flag — falar mal do mercado/de quem saiu, ou pressa excessiva pra fechar** ('precisa decidir hoje'): pressão de venda costuma esconder algo. Sênior pode e deve fazer due diligence sobre o empregador.",
        "**Anote tudo após cada etapa** — quem você falou, o que prometeram, faixa, próximos passos. Te protege e te dá material pra negociar a proposta no fim."
      ],
      "note": "Negociar nível/faixa não é falta de educação — é profissionalismo. Quem trata isso como tabu costuma esconder uma proposta fraca."
    }
  ],
  "resources": []
};
