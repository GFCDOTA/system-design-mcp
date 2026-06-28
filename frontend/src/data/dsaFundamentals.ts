// Conteúdo da página "Estruturas & Big-O" (revisão de DSA pra entrevista).
// Guia de análise de complexidade + cartão de revisão por estrutura, com exercícios
// canônicos do LeetCode. GERADO por scratchpad/gen_dsa.cjs (workflow dsa-fundamentals).

export interface BigOClass { notation: string; name: string; example: string; }
export interface ComplexityGuide {
  intro: string;
  hierarchy: BigOClass[];
  howToCount: string[];
  timeVsSpace: string[];
  fromConstraints: string[];
}
export interface DsOperation { op: string; time: string; space: string; }
export interface DsExercise { name: string; difficulty: string; url: string; }
export interface DataStructure {
  id: string;
  name: string;
  what: string;
  operations: DsOperation[];
  whenToUse: string[];
  patterns: string[];
  pitfall: string;
  exercises: DsExercise[];
}

export const complexityGuide: ComplexityGuide = {
  "intro": "**Big-O** descreve como o tempo (ou memória) de um algoritmo cresce conforme a entrada `n` aumenta — é a taxa de crescimento no pior caso, ignorando constantes e detalhes de máquina. Cai em entrevista porque mostra se você sabe escolher a solução que escala (e não só uma que funciona com 10 itens mas trava com 10 milhões).",
  "hierarchy": [
    {
      "notation": "O(1)",
      "name": "constante",
      "example": "Acessar `arr[i]` por índice ou ler/escrever numa **hash map** — independe do tamanho da entrada."
    },
    {
      "notation": "O(log n)",
      "name": "logarítmica",
      "example": "**Busca binária** em array ordenado — descarta metade do espaço a cada passo."
    },
    {
      "notation": "O(n)",
      "name": "linear",
      "example": "Percorrer uma lista uma vez pra somar ou achar o **máximo** — toca cada elemento uma vez."
    },
    {
      "notation": "O(n log n)",
      "name": "linearítmica",
      "example": "**Ordenação eficiente** (`mergesort`, `heapsort`, `Arrays.sort`) — o patamar prático de qualquer sort comparativo."
    },
    {
      "notation": "O(n²)",
      "name": "quadrática",
      "example": "**Loops aninhados** sobre a mesma coleção — comparar todo par de elementos (bubble sort, checar duplicatas ingênuo)."
    },
    {
      "notation": "O(2ⁿ)",
      "name": "exponencial",
      "example": "Gerar todos os **subconjuntos** de um conjunto, ou Fibonacci recursivo ingênuo — cada item dobra o trabalho."
    },
    {
      "notation": "O(n!)",
      "name": "fatorial",
      "example": "Gerar todas as **permutações** (caixeiro-viajante por força bruta) — explode bem antes de `n=15`."
    }
  ],
  "howToCount": [
    "**Loop simples** sobre `n` itens = `O(n)`. Um `for`/`while` que toca cada elemento uma vez é linear — o tamanho do corpo do loop só muda a constante, não a ordem.",
    "**Loops aninhados multiplicam**: um `for` dentro de outro, ambos sobre `n`, dá `O(n × n) = O(n²)`; três níveis = `O(n³)`. Se o loop interno roda sobre `m` (coleção diferente), é `O(n × m)`.",
    "**Dividir o espaço pela metade** a cada passo = `O(log n)`. Busca binária, percorrer uma árvore balanceada, `n = n / 2` no loop — sempre que o trabalho restante cai por um fator constante, é logarítmico.",
    "**Recursão = ramificação ^ profundidade**. Conte quantas chamadas cada nível dispara (`b`) e quão fundo a árvore vai (`d`): custo ≈ `O(b^d)`. Fibonacci ingênuo ramifica em 2 e desce `n` níveis → `O(2ⁿ)`.",
    "**Fases em sequência: pega a dominante.** Código que faz `O(n)` depois `O(n log n)` depois `O(n)` é `O(n log n)` no total — soma de fases vira o maior termo, porque ele domina quando `n` cresce.",
    "**Dropar constantes e termos menores.** `O(2n)` é `O(n)`; `O(n² + n)` é `O(n²)`; `O(500)` é `O(1)`. Big-O mede a *ordem* de crescimento, não a contagem exata de operações."
  ],
  "timeVsSpace": [
    "**Espaço = memória AUXILIAR**, não a entrada. O array que te deram não conta; conta o que você *aloca a mais* pra resolver. Um algoritmo pode ser `O(n)` no tempo e `O(1)` no espaço ao mesmo tempo.",
    "**A pilha de recursão é espaço.** Cada chamada empilhada ocupa memória até retornar. Recursão com profundidade `n` custa `O(n)` de espaço *mesmo sem alocar nada explícito* — e pode estourar com `StackOverflow`.",
    "**In-place `O(1)` vs cópia `O(n)`.** Trocar elementos dentro do próprio array (reverter, ordenar in-place) é `O(1)` extra; criar um array novo do mesmo tamanho pra montar o resultado é `O(n)`.",
    "**Hash map / set ou array auxiliar = `O(n)` de espaço.** O truque clássico de trocar tempo por memória — usar um `HashSet` pra checar duplicatas em `O(n)` no tempo custa `O(n)` de memória. É um trade-off consciente, não de graça.",
    "**Diga as duas ordens na entrevista.** \"`O(n log n)` no tempo, `O(n)` no espaço\" — separar as duas mostra que você sabe que rápido nem sempre é econômico, e que dá pra otimizar uma sacrificando a outra."
  ],
  "fromConstraints": [
    "**`N ≤ 20`** (às vezes ≤ 25) → cabe **exponencial/fatorial**: `O(2ⁿ)`, `O(n!)`, backtracking, bitmask DP. O `n` minúsculo é a dica gritando que a solução é exponencial e tudo bem.",
    "**`N ≤ 100–500`** → `O(n³)` passa folgado (`500³ ≈ 1.2×10⁸`). Cabe DP de intervalo, Floyd-Warshall, triplo loop.",
    "**`N ≤ 10³–10⁴`** → mire em **`O(n²)`** (`10⁴² = 10⁸`, no limite do aceitável em ~1s). Loops aninhados ou DP 2D estão liberados.",
    "**`N ≤ 10⁵–10⁶`** → precisa ser **`O(n)` ou `O(n log n)`**. Quadrático morre aqui (`10⁵² = 10¹⁰` = timeout). Pense em sort + dois ponteiros, hash, ou um único passe.",
    "**`N ≥ 10⁸`** (ou respostas gigantes / múltiplas queries) → só **`O(log n)` ou `O(1)`**: busca binária na resposta, fórmula fechada, exponenciação rápida. Nem ler `n` elementos cabe no orçamento.",
    "**Regra de bolso:** computador faz ~`10⁸–10⁹` operações por segundo. Estime `f(n)` com o `N` máximo e veja se passa de `~10⁸` — isso te diz a complexidade-alvo *antes* de escrever uma linha."
  ]
};

export const structures: DataStructure[] = [
  {
    "id": "array",
    "name": "Array (Vetor / Lista dinâmica)",
    "what": "Bloco contíguo de memória onde cada elemento é acessado por um índice inteiro. Como o endereço de qualquer posição é calculado por aritmética (base + índice × tamanho), o acesso é instantâneo; o custo aparece em inserir/remover no meio, que obriga a deslocar todos os elementos seguintes. Arrays dinâmicos (ArrayList, vector, list do Python) dobram a capacidade quando enchem — por isso o append é O(1) amortizado.",
    "operations": [
      {
        "op": "Acesso por índice",
        "time": "O(1)",
        "space": "O(1)"
      },
      {
        "op": "Busca (por valor)",
        "time": "O(n)",
        "space": "O(1)"
      },
      {
        "op": "Inserção/Remoção no fim (append/pop)",
        "time": "O(1) amortizado",
        "space": "O(1)"
      },
      {
        "op": "Inserção/Remoção no meio ou início",
        "time": "O(n)",
        "space": "O(1)"
      },
      {
        "op": "Espaço total",
        "time": "—",
        "space": "O(n)"
      }
    ],
    "whenToUse": [
      "Acesso aleatório frequente por posição e dados de tamanho previsível ou que crescem só no fim.",
      "Sinal no enunciado: 'array de inteiros', índices, subarray, janela contígua, prefix sum.",
      "Base para a maioria das técnicas: two pointers, sliding window, busca binária (se ordenado).",
      "Quando a localidade de cache importa — array contíguo ganha de estruturas com ponteiros."
    ],
    "patterns": [
      "Two pointers (par com soma alvo, remover duplicatas in-place)",
      "Sliding window (substring/subarray de tamanho ou soma alvo)",
      "Prefix sum / difference array (somas de intervalo O(1))",
      "Binary search em array ordenado (e suas variantes rotacionadas)"
    ],
    "pitfall": "Inserir/remover no meio é O(n) pelo shift — usar array como fila (pop no início) vira O(n) por operação; use deque/linked list. E append amortizado O(1) esconde realocações O(n) pontuais.",
    "exercises": [
      {
        "name": "Two Sum",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/two-sum/"
      },
      {
        "name": "Best Time to Buy and Sell Stock",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"
      },
      {
        "name": "Product of Array Except Self",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/product-of-array-except-self/"
      },
      {
        "name": "Trapping Rain Water",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/trapping-rain-water/"
      }
    ]
  },
  {
    "id": "hash-map",
    "name": "Tabela Hash (Hash Map / Dicionário)",
    "what": "Mapeia chaves para valores aplicando uma função de hash que converte a chave num índice de array (bucket). Dá acesso, inserção e busca em O(1) no caso médio porque vai direto ao bucket; colisões (chaves diferentes no mesmo bucket) são resolvidas por encadeamento ou open addressing, e no pior caso degeneram para O(n). Não mantém ordem de inserção nem ordenação das chaves.",
    "operations": [
      {
        "op": "Busca (get por chave)",
        "time": "O(1) médio / O(n) pior",
        "space": "O(1)"
      },
      {
        "op": "Inserção (put)",
        "time": "O(1) médio / O(n) pior",
        "space": "O(1)"
      },
      {
        "op": "Remoção (delete)",
        "time": "O(1) médio / O(n) pior",
        "space": "O(1)"
      },
      {
        "op": "Verificar existência (contains)",
        "time": "O(1) médio / O(n) pior",
        "space": "O(1)"
      },
      {
        "op": "Espaço total",
        "time": "—",
        "space": "O(n)"
      }
    ],
    "whenToUse": [
      "Precisa de lookup/contagem/dedup rápido por chave e a ordem não importa.",
      "Sinal no enunciado: 'já vimos antes?', 'contar ocorrências', 'agrupar por', 'complemento'.",
      "Trocar uma busca O(n) aninhada (O(n²)) por O(1) — memorizar o que já passou.",
      "Quando precisa de ordenação das chaves use TreeMap/SortedDict O(log n), não hash."
    ],
    "patterns": [
      "Two Sum / par-complemento em O(n)",
      "Contagem de frequência e anagramas (group by chave canônica)",
      "Deduplicação e detecção de visitados (set)",
      "Caching/memoization, prefix-sum + hash (subarray com soma K)"
    ],
    "pitfall": "Assumir O(1) sempre: hash ruim ou ataque adversarial colapsa tudo para O(n). E chaves precisam de hashCode/equals consistentes e imutáveis — mutar uma chave depois de inseri-la a 'perde' no mapa.",
    "exercises": [
      {
        "name": "Two Sum",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/two-sum/"
      },
      {
        "name": "Group Anagrams",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/group-anagrams/"
      },
      {
        "name": "Subarray Sum Equals K",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/subarray-sum-equals-k/"
      },
      {
        "name": "Longest Consecutive Sequence",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/longest-consecutive-sequence/"
      }
    ]
  },
  {
    "id": "linked-list",
    "name": "Lista Encadeada (Linked List)",
    "what": "Sequência de nós onde cada nó guarda o dado e um ponteiro para o próximo (e, na duplamente encadeada, para o anterior). Não há memória contígua: inserir ou remover é O(1) se você já tem o ponteiro para o nó, mas acessar o i-ésimo elemento exige percorrer desde a cabeça, O(n). Troca acesso aleatório por inserção/remoção barata nas pontas e no meio.",
    "operations": [
      {
        "op": "Acesso por índice",
        "time": "O(n)",
        "space": "O(1)"
      },
      {
        "op": "Busca (por valor)",
        "time": "O(n)",
        "space": "O(1)"
      },
      {
        "op": "Inserção/Remoção na cabeça",
        "time": "O(1)",
        "space": "O(1)"
      },
      {
        "op": "Inserção/Remoção com nó conhecido",
        "time": "O(1)",
        "space": "O(1)"
      },
      {
        "op": "Espaço total",
        "time": "—",
        "space": "O(n)"
      }
    ],
    "whenToUse": [
      "Muita inserção/remoção nas pontas ou no meio sem precisar de índice aleatório.",
      "Sinal no enunciado: 'reverter a lista', 'detectar ciclo', 'remover N-ésimo do fim', ponteiro 'next'.",
      "Implementar fila/pilha/LRU onde splice O(1) de nós paga.",
      "Quando precisa de acesso por posição rápido, prefira array — linked list não tem isso."
    ],
    "patterns": [
      "Fast & slow pointers (ciclo de Floyd, achar o meio)",
      "Reversão in-place (iterativa com 3 ponteiros)",
      "Dummy/sentinel head para mesclar e remover sem casos especiais",
      "Merge de listas ordenadas; LRU cache (doubly linked + hash)"
    ],
    "pitfall": "Perder a referência ao restante da lista ao reatribuir ponteiros (guardar next antes de mudar), e esquecer o nó sentinela — sem ele a remoção da cabeça vira caso especial cheio de null pointer.",
    "exercises": [
      {
        "name": "Reverse Linked List",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/reverse-linked-list/"
      },
      {
        "name": "Linked List Cycle",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/linked-list-cycle/"
      },
      {
        "name": "Merge Two Sorted Lists",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/merge-two-sorted-lists/"
      },
      {
        "name": "LRU Cache",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/lru-cache/"
      }
    ]
  },
  {
    "id": "stack-queue",
    "name": "Pilha e Fila (Stack & Queue)",
    "what": "Stack é LIFO (último a entrar, primeiro a sair) — push e pop acontecem no mesmo topo; pense numa pilha de pratos. Queue é FIFO (primeiro a entrar, primeiro a sair) — enfileira numa ponta e desenfileira na outra; pense numa fila de banco. Ambas têm todas as operações em O(1) e geralmente são implementadas sobre array dinâmico (stack) ou deque/lista encadeada (queue).",
    "operations": [
      {
        "op": "Push / Enqueue",
        "time": "O(1)",
        "space": "O(1)"
      },
      {
        "op": "Pop / Dequeue",
        "time": "O(1)",
        "space": "O(1)"
      },
      {
        "op": "Peek / Top / Front",
        "time": "O(1)",
        "space": "O(1)"
      },
      {
        "op": "Busca (por valor)",
        "time": "O(n)",
        "space": "O(1)"
      },
      {
        "op": "Espaço total",
        "time": "—",
        "space": "O(n)"
      }
    ],
    "whenToUse": [
      "Stack: precisa lembrar/desfazer na ordem inversa — parênteses, undo, recursão explícita.",
      "Queue: processar na ordem de chegada — BFS, scheduling, buffer/produtor-consumidor.",
      "Sinal no enunciado: 'válido balanceado', 'próximo maior elemento', 'nível por nível', 'mais recente primeiro'.",
      "Monotonic stack/queue quando precisa do próximo maior/menor em janela."
    ],
    "patterns": [
      "Stack: parênteses balanceados, avaliação de expressão, monotonic stack (next greater element)",
      "Queue: BFS em grafo/árvore (travessia por nível)",
      "Deque: sliding window maximum (monotonic deque)",
      "Min/Max stack O(1); implementar fila com duas pilhas (e vice-versa)"
    ],
    "pitfall": "Usar uma list/array como fila e desenfileirar com pop(0)/remove(0): isso é O(n) pelo shift — use deque (collections.deque, ArrayDeque). E esquecer de checar vazio antes de pop/peek gera underflow.",
    "exercises": [
      {
        "name": "Valid Parentheses",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/valid-parentheses/"
      },
      {
        "name": "Implement Queue using Stacks",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/implement-queue-using-stacks/"
      },
      {
        "name": "Daily Temperatures",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/daily-temperatures/"
      },
      {
        "name": "Sliding Window Maximum",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/sliding-window-maximum/"
      }
    ]
  },
  {
    "id": "tree-bst",
    "name": "Árvore Binária / Árvore Binária de Busca (BST)",
    "what": "Árvore binária é uma hierarquia onde cada nó tem até dois filhos (esquerdo e direito). Na BST vale o invariante: tudo na subárvore esquerda é menor que o nó e tudo na direita é maior — isso permite buscar descartando metade a cada passo. O custo é O(altura): O(log n) se a árvore está balanceada, mas O(n) se ela degenera numa 'lista' (inserções ordenadas) — por isso existem árvores auto-balanceadas (AVL, Red-Black).",
    "operations": [
      {
        "op": "Busca",
        "time": "O(log n) balanceada / O(n) degenerada",
        "space": "O(h)"
      },
      {
        "op": "Inserção",
        "time": "O(log n) balanceada / O(n) degenerada",
        "space": "O(h)"
      },
      {
        "op": "Remoção",
        "time": "O(log n) balanceada / O(n) degenerada",
        "space": "O(h)"
      },
      {
        "op": "Travessia in-order (saída ordenada)",
        "time": "O(n)",
        "space": "O(h)"
      },
      {
        "op": "Espaço total",
        "time": "—",
        "space": "O(n)"
      }
    ],
    "whenToUse": [
      "Precisa manter dados ordenados com inserção/busca/remoção dinâmicas (não só consulta estática).",
      "Sinal no enunciado: 'árvore', 'in-order dá ordenado', 'ancestral comum', 'k-ésimo menor', ranges ordenados.",
      "Quando precisa de min/max, sucessor/predecessor e faixas — TreeMap/TreeSet usam BST balanceada.",
      "Se a ordem não importa e só quer O(1) lookup, hash map vence a BST."
    ],
    "patterns": [
      "Travessias DFS (pré/in/pós-ordem) e BFS por nível",
      "Lowest Common Ancestor (LCA)",
      "Validar BST, k-ésimo menor (in-order), altura/diâmetro",
      "Construir árvore a partir de travessias; serializar/desserializar"
    ],
    "pitfall": "Esquecer que uma BST sem balanceamento degenera para O(n) com entradas ordenadas. E ao validar BST, comparar só com o pai imediato em vez de propagar limites (min/max) — um nó pode respeitar o pai e violar um ancestral.",
    "exercises": [
      {
        "name": "Maximum Depth of Binary Tree",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/maximum-depth-of-binary-tree/"
      },
      {
        "name": "Validate Binary Search Tree",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/validate-binary-search-tree/"
      },
      {
        "name": "Lowest Common Ancestor of a Binary Tree",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/"
      },
      {
        "name": "Binary Tree Maximum Path Sum",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/binary-tree-maximum-path-sum/"
      }
    ]
  },
  {
    "id": "heap",
    "name": "Heap / Fila de Prioridade (Priority Queue)",
    "what": "Árvore binária quase completa que mantém a propriedade de heap: num min-heap, todo pai é menor ou igual aos filhos, então a raiz é sempre o mínimo (no max-heap, o máximo). É implementada compactamente sobre um array (filhos do índice i ficam em 2i+1 e 2i+2). Dá o menor/maior elemento em O(1) e insere/remove a raiz em O(log n) — mas não permite busca eficiente por um elemento arbitrário.",
    "operations": [
      {
        "op": "getMin / getMax (peek)",
        "time": "O(1)",
        "space": "O(1)"
      },
      {
        "op": "Inserção (push)",
        "time": "O(log n)",
        "space": "O(1)"
      },
      {
        "op": "Remover topo (pop / extract)",
        "time": "O(log n)",
        "space": "O(1)"
      },
      {
        "op": "Construir heap (heapify de n itens)",
        "time": "O(n)",
        "space": "O(1)"
      },
      {
        "op": "Busca por valor arbitrário",
        "time": "O(n)",
        "space": "O(1)"
      }
    ],
    "whenToUse": [
      "Precisa repetidamente do menor/maior elemento de um conjunto que muda.",
      "Sinal no enunciado: 'top K', 'k-ésimo maior/menor', 'mesclar K listas', 'mediana em stream', 'próximo evento'.",
      "Algoritmos gulosos com escolha do extremo a cada passo (Dijkstra, Prim, scheduling).",
      "Se precisa de TODA a coleção ordenada de uma vez, sort O(n log n) é mais simples que heap."
    ],
    "patterns": [
      "Top K elementos / K-ésimo maior (heap de tamanho K → O(n log k))",
      "Merge K sorted lists",
      "Mediana de um stream (dois heaps: max-heap + min-heap)",
      "Dijkstra / Prim (caminho mínimo, árvore geradora mínima)"
    ],
    "pitfall": "Esperar busca ou remoção arbitrária O(log n) — isso é O(n) no heap (não é BST). E construir heap inserindo um a um é O(n log n); use heapify, que é O(n). Cuidado também com min vs max heap (em Java, PriorityQueue é min por default).",
    "exercises": [
      {
        "name": "Kth Largest Element in a Stream",
        "difficulty": "Easy",
        "url": "https://leetcode.com/problems/kth-largest-element-in-a-stream/"
      },
      {
        "name": "Top K Frequent Elements",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/top-k-frequent-elements/"
      },
      {
        "name": "Kth Largest Element in an Array",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/kth-largest-element-in-an-array/"
      },
      {
        "name": "Find Median from Data Stream",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/find-median-from-data-stream/"
      }
    ]
  },
  {
    "id": "graph",
    "name": "Grafo (Graph)",
    "what": "Conjunto de vértices (nós) ligados por arestas, que podem ser direcionadas ou não e ter pesos. Modela qualquer relação 'X conecta com Y': mapas, redes, dependências. Em geral representado por lista de adjacência (cada vértice aponta seus vizinhos), eficiente para grafos esparsos; matriz de adjacência custa O(V²) de espaço e só compensa em grafos densos. As travessias-base são BFS (explora por camadas) e DFS (vai fundo antes de voltar).",
    "operations": [
      {
        "op": "BFS / DFS (travessia, lista de adj.)",
        "time": "O(V + E)",
        "space": "O(V)"
      },
      {
        "op": "Verificar aresta (lista de adj.)",
        "time": "O(grau do vértice)",
        "space": "O(1)"
      },
      {
        "op": "Caminho mínimo com pesos (Dijkstra + heap)",
        "time": "O(E log V)",
        "space": "O(V)"
      },
      {
        "op": "Ordenação topológica (DAG)",
        "time": "O(V + E)",
        "space": "O(V)"
      },
      {
        "op": "Espaço (lista de adjacência)",
        "time": "—",
        "space": "O(V + E)"
      }
    ],
    "whenToUse": [
      "Entidades com relações arbitrárias: rotas, dependências, redes sociais, estados.",
      "Sinal no enunciado: 'conectado', 'menor caminho', 'pré-requisito', 'ilhas/regiões', 'rede', grid 2D.",
      "BFS para caminho mínimo em grafo não-ponderado; Dijkstra quando há pesos não-negativos.",
      "Topo-sort quando há ordem de dependências (DAG); detecção de ciclo para validar."
    ],
    "patterns": [
      "BFS/DFS, número de componentes conexos, flood fill em grid (ilhas)",
      "Ordenação topológica e detecção de ciclo (course schedule)",
      "Caminho mínimo: BFS (não-ponderado), Dijkstra/Bellman-Ford (ponderado)",
      "Bipartido / coloração; MST (Kruskal com Union-Find, Prim)"
    ],
    "pitfall": "Em grafo com ciclos, esquecer o conjunto de visitados leva a loop infinito ou trabalho exponencial. E usar Dijkstra com arestas de peso negativo dá resultado errado — aí precisa de Bellman-Ford.",
    "exercises": [
      {
        "name": "Number of Islands",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/number-of-islands/"
      },
      {
        "name": "Course Schedule",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/course-schedule/"
      },
      {
        "name": "Clone Graph",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/clone-graph/"
      },
      {
        "name": "Word Ladder",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/word-ladder/"
      }
    ]
  },
  {
    "id": "trie",
    "name": "Trie / Árvore de Prefixos (Prefix Tree)",
    "what": "Árvore onde cada nó representa um caractere e cada caminho da raiz até um nó marcado forma uma palavra; prefixos comuns compartilham os mesmos nós. Busca e inserção custam O(L) no comprimento da palavra — independente de quantas palavras existem — o que a torna ideal para autocomplete e busca por prefixo. O preço é espaço: muitos ponteiros por nó (um por caractere possível do alfabeto).",
    "operations": [
      {
        "op": "Inserção de palavra",
        "time": "O(L)",
        "space": "O(L)"
      },
      {
        "op": "Busca de palavra exata",
        "time": "O(L)",
        "space": "O(1)"
      },
      {
        "op": "Busca por prefixo (startsWith)",
        "time": "O(L)",
        "space": "O(1)"
      },
      {
        "op": "Remoção de palavra",
        "time": "O(L)",
        "space": "O(1)"
      },
      {
        "op": "Espaço total",
        "time": "—",
        "space": "O(N · L · Σ)"
      }
    ],
    "whenToUse": [
      "Muitas buscas por prefixo / autocomplete sobre um dicionário de strings.",
      "Sinal no enunciado: 'prefixo', 'autocomplete', 'busca de palavra', 'dicionário', 'wildcard em string'.",
      "Quando vários strings compartilham prefixos e você quer reaproveitá-los (economia + velocidade).",
      "Se for só lookup exato sem prefixo, um hash set de strings é mais simples e leve."
    ],
    "patterns": [
      "Implementar Trie (insert/search/startsWith)",
      "Autocomplete e sugestão por prefixo",
      "Word Search II (Trie + DFS no grid, poda por prefixo)",
      "Busca com wildcard ('.'), substituição de palavras (replace words)"
    ],
    "pitfall": "Esquecer a flag isEndOfWord: sem ela, 'app' apareceria como palavra só porque 'apple' foi inserida — prefixo não é o mesmo que palavra completa. E o custo de memória explode com alfabetos grandes se usar array fixo por nó em vez de mapa.",
    "exercises": [
      {
        "name": "Implement Trie (Prefix Tree)",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/implement-trie-prefix-tree/"
      },
      {
        "name": "Design Add and Search Words Data Structure",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/design-add-and-search-words-data-structure/"
      },
      {
        "name": "Replace Words",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/replace-words/"
      },
      {
        "name": "Word Search II",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/word-search-ii/"
      }
    ]
  },
  {
    "id": "union-find",
    "name": "Union-Find / DSU (Disjoint Set Union)",
    "what": "Estrutura que gerencia conjuntos disjuntos respondendo rápido a 'esses dois elementos estão no mesmo grupo?' e 'una estes dois grupos'. Cada conjunto tem um representante (raiz); find sobe até a raiz e union liga uma raiz na outra. Com as otimizações de compressão de caminho e união por rank/tamanho, cada operação fica praticamente O(1) — formalmente O(α(n)), o inverso de Ackermann, que é ≤ 4 na prática.",
    "operations": [
      {
        "op": "find (raiz/representante)",
        "time": "O(α(n)) ≈ O(1)",
        "space": "O(1)"
      },
      {
        "op": "union (unir dois conjuntos)",
        "time": "O(α(n)) ≈ O(1)",
        "space": "O(1)"
      },
      {
        "op": "connected (mesmo conjunto?)",
        "time": "O(α(n)) ≈ O(1)",
        "space": "O(1)"
      },
      {
        "op": "Inicialização (n elementos)",
        "time": "O(n)",
        "space": "O(n)"
      },
      {
        "op": "Espaço total",
        "time": "—",
        "space": "O(n)"
      }
    ],
    "whenToUse": [
      "Agrupar/conectar elementos dinamicamente e consultar conectividade sem precisar do caminho.",
      "Sinal no enunciado: 'componentes conexos', 'amigos/grupos', 'detectar ciclo em grafo não-direcionado', 'redundant connection'.",
      "Kruskal (MST): aceitar aresta só se ela une dois componentes diferentes.",
      "Quando há muitas uniões e consultas online; se o grafo é estático, um DFS/BFS único pode bastar."
    ],
    "patterns": [
      "Contar componentes conexos / número de provícias",
      "Detectar ciclo / aresta redundante em grafo não-direcionado",
      "Kruskal para árvore geradora mínima (MST)",
      "Accounts merge, ilhas dinâmicas, equações por equivalência"
    ],
    "pitfall": "Implementar sem compressão de caminho nem união por rank: aí find degenera para O(n) e a estrutura vira uma linked list lenta. E unir sempre a árvore maior na menor (rank invertido) também estraga a complexidade.",
    "exercises": [
      {
        "name": "Number of Provinces",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/number-of-provinces/"
      },
      {
        "name": "Redundant Connection",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/redundant-connection/"
      },
      {
        "name": "Accounts Merge",
        "difficulty": "Medium",
        "url": "https://leetcode.com/problems/accounts-merge/"
      },
      {
        "name": "Number of Islands II",
        "difficulty": "Hard",
        "url": "https://leetcode.com/problems/number-of-islands-ii/"
      }
    ]
  }
];
