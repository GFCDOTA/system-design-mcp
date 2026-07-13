// Banco de perguntas TEÓRICAS de Java Core pra entrevista — conteúdo autoral
// (cânone clássico de entrevista Java, escrito do zero em PT-BR), no mesmo
// espírito do interviewPrep: guia curado no frontend, sem passar pela KB.
// Itens usam **negrito** e `code` inline (renderizados pelo MD/Inline).

export interface JavaQuestion {
  id: string;
  q: string;
  a: string;
  /** Pegadinha/armadilha clássica de entrevista ligada à pergunta. */
  pitfall?: string;
}

export interface JavaCategory {
  id: string;
  title: string;
  intro: string;
  questions: JavaQuestion[];
}

export const javaCategories: JavaCategory[] = [
  {
    id: "fundamentos",
    title: "Fundamentos & OOP",
    intro: "O filtro de eliminação: quem tropeça aqui não chega nas perguntas boas. Responda curto e preciso.",
    questions: [
      {
        id: "jv-fund-01",
        q: "Qual a diferença entre JDK, JRE e JVM?",
        a: "**JVM** é a máquina virtual que executa bytecode (específica por plataforma). **JRE** = JVM + bibliotecas de runtime, o mínimo pra RODAR uma aplicação. **JDK** = JRE + ferramentas de desenvolvimento (`javac`, `jdb`, `jconsole`) — o que você precisa pra COMPILAR. Desde o Java 11 a Oracle não distribui mais JRE separado; você usa o JDK (ou gera um runtime enxuto com `jlink`).",
      },
      {
        id: "jv-fund-02",
        q: "Qual a diferença entre `==` e `equals()`?",
        a: "`==` compara **referências** (mesmo objeto na memória) para tipos de referência, e valores para primitivos. `equals()` compara **conteúdo/igualdade lógica** — se a classe sobrescrever; o default de `Object` é idêntico ao `==`.",
        pitfall: "`Integer a = 127, b = 127; a == b` é `true` (cache de -128 a 127), mas com `128` é `false`. Clássica pra derrubar candidato — compare wrappers sempre com `equals()`.",
      },
      {
        id: "jv-fund-03",
        q: "Qual o contrato entre `equals()` e `hashCode()`? O que quebra se eu violar?",
        a: "Se `a.equals(b)` então `a.hashCode() == b.hashCode()` — **obrigatório**. O inverso não: hashes iguais não implicam equals. Violando isso, coleções hash quebram: o objeto entra num bucket pelo hash antigo e o `contains()`/`get()` procura no bucket errado → elemento 'some' do `HashSet`/`HashMap`.",
        pitfall: "Sobrescrever só `equals()` e esquecer `hashCode()` — o bug silencioso mais cobrado em entrevista.",
      },
      {
        id: "jv-fund-04",
        q: "Interface vs classe abstrata — quando usar cada uma?",
        a: "**Interface** define um contrato (o QUE), permite múltipla implementação e, desde o Java 8, tem métodos `default`/`static` (e `private` no 9). **Classe abstrata** compartilha ESTADO e implementação parcial entre subclasses (o COMO comum), mas limita a uma única herança. Regra prática: capacidade/papel → interface; hierarquia com campo/construtor comum → abstrata.",
      },
      {
        id: "jv-fund-05",
        q: "Herança vs composição — por que 'favor composition over inheritance'?",
        a: "Herança acopla a subclasse à implementação do pai (fragile base class): mudança interna do pai quebra filhos. **Composição** monta comportamento delegando a colaboradores — acoplamento menor, testável, troca em runtime. Herde só quando há relação **é-um** genuína e o pai foi desenhado pra extensão; caso contrário, componha.",
      },
      {
        id: "jv-fund-06",
        q: "O que `final` significa em variável, método e classe?",
        a: "**Variável**: uma única atribuição (atenção: referência final ≠ objeto imutável — a lista `final` ainda aceita `add`). **Método**: não pode ser sobrescrito. **Classe**: não pode ser estendida (ex.: `String`). Campos `final` também têm garantia especial de visibilidade na publicação segura de objetos (JMM).",
      },
      {
        id: "jv-fund-07",
        q: "O que é imutabilidade e como construir uma classe imutável?",
        a: "Objeto cujo estado não muda após construído: classe `final`, campos `private final`, sem setters, e **cópia defensiva** de qualquer campo mutável na entrada e na saída (ex.: `List.copyOf`). Ganhos: thread-safe de graça, seguro como chave de map, raciocínio local. Em Java moderno: **`record`** já entrega isso pra portadores de dados.",
      },
      {
        id: "jv-fund-08",
        q: "Por que `String` é imutável e o que é o String pool?",
        a: "Imutável por segurança (é usada em class loading, paths, credenciais), por cache de hash (chave de map) e pra permitir o **pool**: literais iguais compartilham a mesma instância no pool interno (`\"a\" == \"a\"` é true; `new String(\"a\")` cria fora do pool). `intern()` devolve a versão do pool.",
        pitfall: "Concatenar String em loop cria N objetos intermediários — use `StringBuilder` (a pergunta seguinte clássica é StringBuilder vs StringBuffer: o Buffer é synchronized e praticamente legado).",
      },
      {
        id: "jv-fund-09",
        q: "Sobrecarga (overload) vs sobrescrita (override)?",
        a: "**Overload**: mesmo nome, assinaturas diferentes, resolvida em **compilação** (tipo estático). **Override**: subclasse redefine método do pai com mesma assinatura, resolvida em **runtime** (dispatch dinâmico). Regras de override: visibilidade não pode diminuir, retorno covariante ok, não pode lançar checked exception mais ampla.",
        pitfall: "Métodos `static` não sofrem override — são 'escondidos' (hiding) e resolvidos pelo tipo estático da referência.",
      },
      {
        id: "jv-fund-10",
        q: "O que acontece na passagem de parâmetros — Java é pass-by-value ou by-reference?",
        a: "**Sempre pass-by-value.** Para objetos, o VALOR copiado é a referência: o método pode mutar o objeto apontado, mas reatribuir o parâmetro (`param = new X()`) não afeta o chamador. Essa distinção mutar-vs-reatribuir é exatamente o que o entrevistador quer ouvir.",
      },
    ],
  },
  {
    id: "jvm",
    title: "JVM, memória & GC",
    intro: "Onde separam quem só escreve código de quem entende o runtime. Foque no modelo mental: quem vive onde, e quando morre.",
    questions: [
      {
        id: "jv-jvm-01",
        q: "Como a JVM organiza a memória (heap, stack, metaspace)?",
        a: "**Stack** (por thread): frames de método, variáveis locais e referências — some com o retorno. **Heap** (compartilhado): todos os objetos, gerenciado pelo GC, dividido em **young** (eden + survivors) e **old**. **Metaspace**: metadados de classe (fora do heap, cresce em memória nativa — substituiu o PermGen no Java 8). `StackOverflowError` = stack; `OutOfMemoryError: Java heap space` = heap.",
      },
      {
        id: "jv-jvm-02",
        q: "Como funciona o garbage collector geracional?",
        a: "Hipótese geracional: a maioria dos objetos morre jovem. Alocação é no **eden** (barata, bump-the-pointer); minor GC copia sobreviventes entre **survivor spaces** e promove os longevos pra **old gen**; major/full GC limpa a old (mais caro). GC moderno (G1, default desde o 9) divide o heap em regiões e prioriza as com mais lixo — mirando pausas previsíveis; **ZGC/Shenandoah** entregam pausas sub-milissegundo pra heaps grandes.",
        pitfall: "`System.gc()` é só uma SUGESTÃO — e a resposta 'chamo System.gc()' numa pergunta de memory leak é red flag.",
      },
      {
        id: "jv-jvm-03",
        q: "Java tem memory leak? Como acontece e como você investiga?",
        a: "Tem — não por esquecer `free`, mas por **referências vivas indevidas**: caches/statics que só crescem, listeners não removidos, `ThreadLocal` não limpo em thread pool, coleções acumulando. Investigação: métricas de heap (crescimento pós-full-GC), heap dump (`jmap`/`-XX:+HeapDumpOnOutOfMemoryError`) e análise de dominators no Eclipse MAT/VisualVM.",
      },
      {
        id: "jv-jvm-04",
        q: "O que é o JIT e por que Java 'esquenta'?",
        a: "O bytecode começa interpretado; o **JIT** compila pra código nativo os métodos quentes (detectados por profiling), com inlining e otimizações especulativas — por isso o throughput melhora depois do warm-up. C1/C2 em tiered compilation. Se uma especulação falha, ocorre deoptimização e recompila.",
      },
      {
        id: "jv-jvm-05",
        q: "Como funciona o class loading?",
        a: "Carregamento sob demanda com **delegação pro pai**: Bootstrap → Platform → Application. Um filho só carrega se o pai não achou — evita duplicar classes core. Fases: loading → linking (verify, prepare, resolve) → initialization (bloco `static` roda aí). Containers/frameworks criam class loaders próprios pra isolar aplicações (e é onde nascem `ClassNotFoundException` vs `NoClassDefFoundError`).",
      },
      {
        id: "jv-jvm-06",
        q: "Referências strong, soft, weak e phantom — pra que servem?",
        a: "**Strong**: a normal, impede coleta. **Soft**: coletada só sob pressão de memória (cache tolerante). **Weak**: coletada no próximo GC se só restar ela (`WeakHashMap` de metadados). **Phantom**: enfileirada após a coleta, pra cleanup de recurso nativo (substituindo `finalize()`, que está morto — use `Cleaner`).",
      },
    ],
  },
  {
    id: "collections",
    title: "Collections",
    intro: "O tema MAIS perguntado de Java Core. HashMap internals é quase garantido.",
    questions: [
      {
        id: "jv-col-01",
        q: "Como o HashMap funciona por dentro?",
        a: "Array de **buckets**; o índice vem de `hash(key)` espalhado e mascarado pelo tamanho (potência de 2). Colisão → lista encadeada no bucket; desde o Java 8, bucket com ≥8 entradas (e tabela ≥64) vira **árvore rubro-negra** (pior caso O(log n) em vez de O(n)). Passou do `load factor` (0.75) → **resize** dobra a tabela e redistribui. `get`/`put` são O(1) amortizado com hash decente.",
        pitfall: "Chave mutável: mudar um campo usado no hashCode depois do put faz a entrada 'sumir'. E hashCode constante degrada tudo pra um bucket só.",
      },
      {
        id: "jv-col-02",
        q: "ArrayList vs LinkedList — quando cada uma?",
        a: "**ArrayList**: array dinâmico — acesso por índice O(1), inserção no fim O(1) amortizado, no meio O(n); cache-friendly. **LinkedList**: nós encadeados — O(1) só nas pontas E com o iterador na posição; acesso por índice O(n) e péssima localidade. Na prática: **ArrayList em ~99% dos casos**; pra fila nas duas pontas, `ArrayDeque` bate as duas.",
      },
      {
        id: "jv-col-03",
        q: "HashMap vs Hashtable vs ConcurrentHashMap?",
        a: "**Hashtable**: legado, tudo `synchronized` num lock só — não use. **HashMap**: sem sincronização; em concorrência corrompe/perde updates. **ConcurrentHashMap**: thread-safe com granularidade fina (CAS + lock por bucket desde o 8), sem travar leituras; oferece atômicos `computeIfAbsent`/`merge`. Iteração é weakly consistent (não lança `ConcurrentModificationException`).",
        pitfall: "`Collections.synchronizedMap` protege operações individuais, mas iterar exige sincronização externa — e compõe mal (check-then-act não é atômico).",
      },
      {
        id: "jv-col-04",
        q: "O que é fail-fast vs fail-safe em iteradores?",
        a: "**Fail-fast** (ArrayList, HashMap): detecta modificação estrutural concorrente via `modCount` e lança `ConcurrentModificationException` — inclusive na MESMA thread se você remover sem usar `iterator.remove()`. **Fail-safe/weakly consistent** (ConcurrentHashMap, CopyOnWriteArrayList): itera sobre snapshot ou tolera mudanças, sem exceção, podendo não refletir escritas recentes.",
      },
      {
        id: "jv-col-05",
        q: "Comparable vs Comparator?",
        a: "**Comparable** (`compareTo`): a ordem NATURAL, dentro da própria classe, uma só. **Comparator**: ordem externa, quantas quiser, componível — `Comparator.comparing(X::getA).thenComparing(X::getB).reversed()`. TreeMap/TreeSet usam um dos dois — e neles a igualdade é decidida pela comparação, não pelo `equals`.",
        pitfall: "`compareTo` inconsistente com `equals` faz TreeSet e HashSet discordarem sobre duplicatas.",
      },
      {
        id: "jv-col-06",
        q: "HashSet, LinkedHashSet e TreeSet — diferenças?",
        a: "**HashSet**: sem ordem, O(1) — é um HashMap de chaves por baixo. **LinkedHashSet**: mantém ordem de inserção com lista ligada sobre o hash (LinkedHashMap com `accessOrder` é a base clássica de cache **LRU**). **TreeSet**: ordenado (rubro-negra), O(log n), com navegação (`floor`, `ceiling`, `subSet`).",
      },
      {
        id: "jv-col-07",
        q: "Por que implementar bem o `hashCode()` importa pra performance?",
        a: "A promessa O(1) do hash depende de espalhar chaves uniformemente. Hash ruim concentra tudo em poucos buckets → colisões viram listas/árvores → O(n)/O(log n) + resize não ajuda. Use `Objects.hash(...)` ou o gerado por record/IDE; em chaves compostas quentes, um hash manual multiplicativo (31) evita a alocação do varargs.",
      },
    ],
  },
  {
    id: "concorrencia",
    title: "Concorrência & threads",
    intro: "Nível II/III de entrevista. O entrevistador procura: visibilidade ≠ atomicidade, e quem sabe usar as ferramentas certas em vez de synchronized em tudo.",
    questions: [
      {
        id: "jv-con-01",
        q: "Qual o ciclo de vida de uma Thread e como criar uma?",
        a: "NEW → RUNNABLE → (BLOCKED | WAITING | TIMED_WAITING) → TERMINATED. Criação: `Runnable`/`Callable` submetidos a um **ExecutorService** — criar `new Thread()` na mão em código de produção é red flag (custo de criação, sem controle de pool). Desde o Java 21: **virtual threads** (`Executors.newVirtualThreadPerTaskExecutor()`) pra I/O-bound massivo.",
      },
      {
        id: "jv-con-02",
        q: "O que `volatile` garante — e o que NÃO garante?",
        a: "Garante **visibilidade** (escrita vista por todas as threads, sem cache local/reordenação através dela — cria relação happens-before). NÃO garante **atomicidade**: `volatile int x; x++` continua sendo read-modify-write com corrida. Pra contador, `AtomicInteger`; volatile serve pra flags de estado (`while (!stopped)`) e publicação segura.",
        pitfall: "A resposta 'volatile deixa thread-safe' reprova. Visibilidade e atomicidade são problemas diferentes.",
      },
      {
        id: "jv-con-03",
        q: "synchronized vs ReentrantLock vs atomics — quando cada um?",
        a: "**synchronized**: simples, reentrante, sem esquecimento de unlock; ótimo default para seções curtas. **ReentrantLock**: quando precisa de `tryLock`/timeout, interrupção, fairness ou múltiplas `Condition`s. **Atomics** (CAS): contadores e updates de uma variável sem lock — `AtomicLong`, `LongAdder` sob alta contenção. Ordem de preferência: imutável > sem compartilhar > atomic > lock.",
      },
      {
        id: "jv-con-04",
        q: "O que é deadlock, como evitar e como diagnosticar?",
        a: "Duas+ threads esperando locks em ordem cruzada (A tem L1 e quer L2; B tem L2 e quer L1). **Evitar**: ordem global de aquisição, escopo mínimo, `tryLock` com timeout, ou desenhar sem locks aninhados. **Diagnosticar**: thread dump (`jstack`) — a JVM detecta e imprime o ciclo 'Found one Java-level deadlock'.",
      },
      {
        id: "jv-con-05",
        q: "Como dimensionar um thread pool?",
        a: "**CPU-bound**: ~nº de cores (mais só adiciona troca de contexto). **I/O-bound**: cores × (1 + espera/serviço) — a Lei de Little (`L = λ×W`) dá a concorrência necessária. Sempre com fila **limitada** e política de rejeição explícita; pool ilimitado + fila ilimitada = OOM adiado. Em Java 21+, I/O-bound massivo → virtual threads em vez de calibrar pool.",
      },
      {
        id: "jv-con-06",
        q: "O que é CompletableFuture e o que ele resolve?",
        a: "Composição **assíncrona e não-bloqueante**: encadeia estágios (`thenApply`, `thenCompose`, `thenCombine`), agrega (`allOf`), trata erro no pipeline (`exceptionally`, `handle`) — sem bloquear thread esperando `get()`. `thenApply` = map; `thenCompose` = flatMap (evita `CompletableFuture<CompletableFuture<X>>`). Informe o executor nas variantes `*Async` pra não cair no ForkJoinPool comum.",
      },
      {
        id: "jv-con-07",
        q: "O que é ThreadLocal e qual o perigo clássico?",
        a: "Variável com uma cópia POR thread (contexto de request, `SimpleDateFormat` legado, MDC de log). **Perigo**: em thread pool, a thread sobrevive ao request — esquecer `remove()` vaza o valor pro próximo request (dados de outro usuário!) e segura memória. Em virtual threads, prefira `ScopedValue` (Java 21+).",
      },
      {
        id: "jv-con-08",
        q: "O que são virtual threads (Project Loom) e quando usar?",
        a: "Threads baratas gerenciadas pela JVM (milhões), montadas sobre poucas carrier threads: quando bloqueiam em I/O, **desmontam** e liberam a carrier. Perfeitas pra servidor thread-per-request com muito I/O — código bloqueante simples com escala de reativo. NÃO aceleram CPU-bound, e `synchronized` longo podia 'pinnar' a carrier (resolvido no Java 24).",
      },
    ],
  },
  {
    id: "excecoes",
    title: "Exceções",
    intro: "Curto e conceitual — mas com pegadinhas de fluxo que derrubam muita gente.",
    questions: [
      {
        id: "jv-exc-01",
        q: "Checked vs unchecked exceptions — e o debate de design?",
        a: "**Checked** (`extends Exception`): o compilador força tratar/declarar — condições recuperáveis esperadas (arquivo ausente). **Unchecked** (`extends RuntimeException`): erro de programação ou falha irrecuperável (null, argumento inválido). O ecossistema moderno (Spring, Kotlin) prefere unchecked: checked polui assinaturas e não compõe com lambdas. `Error` (OOM) não se captura.",
      },
      {
        id: "jv-exc-02",
        q: "try-with-resources — o que resolve e como funciona?",
        a: "Fecha automaticamente qualquer `AutoCloseable` na ordem INVERSA de abertura, mesmo com exceção — mata o vazamento do finally mal escrito. Se o corpo E o `close()` lançarem, a do corpo propaga e a do close vira **suppressed** (`getSuppressed()`), em vez de engolir a original como no try/finally manual.",
      },
      {
        id: "jv-exc-03",
        q: "O que acontece com um `return` dentro de `finally`?",
        a: "O `finally` SEMPRE roda; um `return`/`throw` nele **descarta** o retorno ou a exceção do try — bug clássico que engole erro silenciosamente. Regra: finally é só pra cleanup (melhor ainda: try-with-resources); nunca controle de fluxo.",
        pitfall: "`try { return 1; } finally { return 2; }` retorna 2 e esconde qualquer exceção. Pergunta armadilha frequente.",
      },
      {
        id: "jv-exc-04",
        q: "Boas práticas de exceções em aplicação real?",
        a: "Lance cedo com mensagem rica em contexto; capture no nível que consegue AGIR; nunca `catch (Exception e) {}` vazio; preserve a causa ao re-lançar (`new X(msg, e)` — perder o stack trace original é crime); exceções de domínio tipadas na borda da API (vira 4xx/5xx coerente); log OU re-throw, nunca os dois (duplica ruído).",
      },
    ],
  },
  {
    id: "generics",
    title: "Generics & sistema de tipos",
    intro: "Erasure e wildcards separam nível II de nível III. PECS é resposta pronta obrigatória.",
    questions: [
      {
        id: "jv-gen-01",
        q: "O que é type erasure e quais as consequências?",
        a: "Generics existem só em compilação; em runtime `List<String>` e `List<Integer>` são a MESMA classe `List`. Consequências: sem `new T[]`, sem `instanceof List<String>`, sem overload que difira só no parâmetro de tipo, e a ponte com código legado (raw types) compila com warning e explode em runtime. Vantagem histórica: compatibilidade binária com pré-Java-5.",
      },
      {
        id: "jv-gen-02",
        q: "O que significa PECS (`? extends` vs `? super`)?",
        a: "**Producer Extends, Consumer Super.** `List<? extends Number>`: fonte de leitura — você LÊ Number, mas não pode `add` (o tipo real é desconhecido). `List<? super Integer>`: destino de escrita — você ADICIONA Integer, e lê só `Object`. É a assinatura de `Collections.copy(dest: ? super T, src: ? extends T)`.",
        pitfall: "`List<Dog>` NÃO é `List<Animal>` (generics são invariantes) — arrays são covariantes e por isso `ArrayStoreException` existe.",
      },
      {
        id: "jv-gen-03",
        q: "O que são records e quando usar?",
        a: "Portador de dados imutável e conciso (Java 16+): componentes viram campos `private final`, construtor canônico, acessores, `equals`/`hashCode`/`toString` — gerados. Construtor compacto valida invariantes. Use pra DTOs, value objects, chaves compostas, retornos múltiplos. NÃO substitui entidade JPA (proxies/estado mutável) nem classe com comportamento rico e estado evolutivo.",
      },
      {
        id: "jv-gen-04",
        q: "O que são sealed classes e o que habilitam?",
        a: "Hierarquia FECHADA (Java 17+): `sealed interface Shape permits Circle, Square` — só os listados implementam. Com **pattern matching de switch** (21+), o compilador checa exaustividade sem `default`: adicionar um novo subtipo quebra a compilação em todo switch que esqueceu de tratá-lo. É a base de modelagem algébrica (soma de tipos) em Java.",
      },
    ],
  },
  {
    id: "streams",
    title: "Streams & funcional",
    intro: "O 'Common Step' de toda faixa de experiência: teoria aqui, prática no editor. map vs flatMap cai SEMPRE.",
    questions: [
      {
        id: "jv-str-01",
        q: "Operações intermediárias vs terminais — e o que é lazy?",
        a: "**Intermediárias** (`map`, `filter`, `sorted`) devolvem stream e NÃO executam nada — só montam o pipeline. A **terminal** (`collect`, `forEach`, `reduce`, `count`) dispara a avaliação, elemento a elemento pela cadeia inteira (não etapa por etapa). Lazy permite short-circuit: `filter(...).findFirst()` para no primeiro match sem processar o resto.",
      },
      {
        id: "jv-str-02",
        q: "map vs flatMap?",
        a: "`map` transforma 1→1 (`Stream<Pedido>` → `Stream<Cliente>`). `flatMap` transforma 1→N e ACHATA (`Stream<Pedido>` → cada pedido vira stream de itens → `Stream<Item>` único). Sinal de que você precisa dele: acabou com `Stream<List<X>>` ou `Optional<Optional<X>>`.",
      },
      {
        id: "jv-str-03",
        q: "Quando parallel stream ajuda — e quando atrapalha?",
        a: "Ajuda com MUITOS elementos + operação CPU-bound cara + fonte que divide bem (array, ArrayList) + sem estado compartilhado. Atrapalha: coleções pequenas (overhead de fork/join domina), I/O no pipeline (bloqueia o ForkJoinPool comum, que é global!), lambdas com efeito colateral. Meça antes; o default certo é sequencial.",
      },
      {
        id: "jv-str-04",
        q: "Como funciona o collect e os Collectors mais cobrados?",
        a: "`collect` é redução mutável: supplier + accumulator + combiner. Os cobrados: `toList/toSet/toMap` (toMap SEM merge function lança em chave duplicada — pegadinha), `groupingBy` (+ downstream: `counting`, `mapping`, `summingLong`), `partitioningBy` (predicado → dois grupos), `joining`. `groupingBy` aninhado responde 90% das perguntas de 'agrupe por X e conte'.",
      },
      {
        id: "jv-str-05",
        q: "Optional — pra que serve e quais os anti-patterns?",
        a: "Tipo de RETORNO que torna a ausência explícita e componível (`map`, `filter`, `orElseGet`, `orElseThrow`). Anti-patterns: `opt.get()` sem checar (troca NPE por NoSuchElement), `isPresent()+get()` em vez de `map/ifPresent`, Optional em CAMPO ou PARÂMETRO (não é serializável e piora a API), `orElse(caro())` que executa sempre — use `orElseGet`.",
      },
    ],
  },
  {
    id: "moderno",
    title: "Java moderno (8 → 21+)",
    intro: "Perguntas de 'o que mudou' mostram se você acompanhou a plataforma — especialmente indo de 8 pra 17/21 em migração.",
    questions: [
      {
        id: "jv-mod-01",
        q: "Java 8 — o que mudou de tão importante?",
        a: "O maior salto da história da linguagem: **lambdas** + interfaces funcionais, **Streams**, **Optional**, métodos `default` em interface, `java.time` (adeus `Date`/`Calendar` mutáveis), Metaspace no lugar do PermGen, `CompletableFuture`. É a baseline que toda entrevista assume.",
      },
      {
        id: "jv-mod-02",
        q: "O que chegou entre o 9 e o 17 (LTS)?",
        a: "**9**: módulos (JPMS), `List.of/Map.of` imutáveis. **10**: `var` (inferência local — o tipo continua estático). **11 LTS**: `HttpClient` novo, strings utilitárias. **14-16**: switch expressions, records, `instanceof` com pattern, text blocks, helpful NPE. **17 LTS**: sealed classes, G1/ZGC maduros. Migração 8→17 na prática: módulos raramente adotados, mas records + switch + sealed mudam o dia a dia.",
      },
      {
        id: "jv-mod-03",
        q: "Java 21 LTS — quais os destaques?",
        a: "**Virtual threads** (Loom) — o headline: thread-per-request escalável sem reativo. **Pattern matching completo de switch** + record patterns (desestruturação). Sequenced Collections (`getFirst/getLast/reversed`). Generational ZGC. Preview: String templates (depois retirado), structured concurrency, `ScopedValue`.",
      },
      {
        id: "jv-mod-04",
        q: "var — quando usar e quando evitar?",
        a: "Inferência de tipo LOCAL (o tipo é fixo em compilação — não é dynamic). Use quando o tipo é óbvio pelo lado direito (`var user = new User()`, `var map = new HashMap<String, List<Pedido>>()` — elimina duplicação). Evite quando o tipo não é evidente (`var result = service.process()`) — legibilidade de review vale mais que economia de digitação.",
      },
      {
        id: "jv-mod-05",
        q: "Como você conduziria uma migração Java 8 → 17/21?",
        a: "1) Atualize build e dependências (as quebras reais vêm de libs que mexiam em internals — `--add-opens` como ponte). 2) Rode a suíte em CI na versão nova ANTES de mudar código. 3) Ganhos imediatos sem risco: G1/ZGC, records em DTOs novos, switch expressions. 4) Virtual threads onde há thread-per-request bloqueante. A resposta que o entrevistador quer: **incremental, guiada por testes, sem big-bang**.",
      },
    ],
  },
];

/** Total de perguntas do banco (usado na trilha da home). */
export const javaQuestionCount = javaCategories.reduce((n, c) => n + c.questions.length, 0);
