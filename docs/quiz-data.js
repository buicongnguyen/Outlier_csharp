// Quiz bank for csharp-skills.html.
// Format: quizData.{lang,ood,arch} = [{ q, options: [[text, isCorrect]...], explain }]
const quizData = {
  lang: [
    {
      q: "A struct Point is assigned: var b = a; b.X = 99;. What is a.X afterwards?",
      options: [
        ["Unchanged — structs are value types, so the assignment copied the whole value into an independent b", true],
        ["99 — a and b refer to the same object", false],
        ["99, but only if Point is declared readonly", false],
        ["It depends on whether Point is on the stack or the heap", false]
      ],
      explain: "Value-type assignment copies the data itself; b is a separate Point and mutating it cannot affect a. With a class, the assignment would copy the reference and both variables would alias one heap object. This copy semantics is also why large or mutable structs are discouraged — copies happen silently at every assignment, parameter pass, and property read."
    },
    {
      q: "What happens at runtime when an int is assigned to a variable of type object?",
      options: [
        ["The int is boxed: a heap object is allocated to wrap the value, and the variable references it", true],
        ["Nothing — object variables can hold ints directly", false],
        ["A compile error: int does not derive from object", false],
        ["The int is converted to a 64-bit pointer-sized integer", false]
      ],
      explain: "Every value type derives from object conceptually, but treating one as object requires boxing — allocating a wrapper on the GC heap. Unboxing (casting back to int) checks the type and copies the value out. Boxing is silent and cheap once, but in a loop or a pre-generics collection it creates garbage per element — the main motivation for generics."
    },
    {
      q: "Why is string concatenation with += inside a large loop a performance problem?",
      options: [
        ["Strings are immutable, so each += allocates a brand-new string and copies all previous content — O(n²) work; StringBuilder fixes it", true],
        ["The += operator locks the string for thread safety on every call", false],
        ["Strings live on the stack and repeatedly overflow into the heap", false],
        ["It is not a problem — the compiler converts += to StringBuilder automatically", false]
      ],
      explain: "A .NET string never changes after creation; s += x builds a whole new string each iteration, copying everything so far. Ten thousand iterations copy roughly 50 million characters. StringBuilder appends into a growable buffer and makes one string at the end. (The compiler does optimize a single expression of several +, but not accumulation across loop iterations.)"
    },
    {
      q: "What is the main advantage of List<int> over the old non-generic ArrayList for storing ints?",
      options: [
        ["Type safety and no boxing — elements are stored inline as ints, with no object wrapper or cast on access", true],
        ["List<int> is thread-safe while ArrayList is not", false],
        ["List<int> stores elements on the stack", false],
        ["ArrayList cannot store more than 65,536 elements", false]
      ],
      explain: "ArrayList holds object references, so every int inserted is boxed (heap allocation) and every read needs an unboxing cast that can fail at runtime. List<int> is compiled specialized for int: contiguous, unboxed storage, compile-time type checking. Neither collection is thread-safe — that part doesn't change."
    },
    {
      q: "What does the constraint 'where T : IComparable<T>' on a generic method allow?",
      options: [
        ["The method body can call CompareTo on values of type T, and only comparable types can be used as T", true],
        ["It makes T a reference type", false],
        ["It automatically sorts any collection passed to the method", false],
        ["It is documentation only and has no compile-time effect", false]
      ],
      explain: "Without constraints, a T is only known to be an object — you can call almost nothing on it. The constraint both restricts callers (T must implement IComparable<T>) and empowers the body (CompareTo is now legal). Other common constraints: 'class' / 'struct' to pin the kind, 'new()' to allow construction, or a base-class bound."
    },
    {
      q: "What is the difference between Action<string> and Func<string, int>?",
      options: [
        ["Action<string> is a delegate taking a string and returning void; Func<string, int> takes a string and returns an int — the last Func type parameter is the return type", true],
        ["Action runs synchronously, Func runs on a background thread", false],
        ["Func can be multicast; Action cannot", false],
        ["Action is for lambdas, Func is for method references", false]
      ],
      explain: "Both are just predefined generic delegate types so you rarely declare your own: Action<...> for void-returning signatures, Func<..., TResult> where the final type argument is the return type. Both can be multicast and both accept lambdas or method groups equally."
    },
    {
      q: "Why declare 'public event EventHandler Click;' instead of a public field of delegate type?",
      options: [
        ["The event keyword restricts outsiders to += and −= only; only the declaring class can raise it or overwrite the whole invocation list", true],
        ["Events run their handlers on the UI thread automatically", false],
        ["Events are serializable and delegates are not", false],
        ["There is no difference beyond naming convention", false]
      ],
      explain: "A public delegate field lets any code invoke it (firing your notifications) or assign it (wiping every other subscriber with =). The event keyword encapsulates the delegate: external code can only subscribe or unsubscribe. That guarantee is what makes events safe to expose publicly — the observer pattern with compiler enforcement."
    },
    {
      q: "for (int i = 0; i < 3; i++) actions.Add(() => Console.Write(i)); — what do the three delegates print when invoked later?",
      options: [
        ["\"333\" — all three lambdas captured the same variable i, which is 3 after the loop ends", true],
        ["\"012\" — each lambda captured the value of i at creation", false],
        ["\"000\" — lambdas capture the initial value", false],
        ["It throws, because i is out of scope when the delegates run", false]
      ],
      explain: "Closures capture variables, not values. There is one i for the whole for-loop, hoisted onto a heap object shared by all three lambdas; by invocation time it is 3. Fix: int copy = i; actions.Add(() => Console.Write(copy)); — a fresh variable per iteration. Note foreach was changed in C# 5 to create a new loop variable per iteration, so this trap now mainly bites for-loops."
    },
    {
      q: "var q = list.Where(x => x > 10); list.Add(50); — does the added 50 appear when q is enumerated?",
      options: [
        ["Yes — LINQ queries execute lazily at enumeration time, so q sees the list's current contents including 50", true],
        ["No — the query captured a snapshot of the list when Where was called", false],
        ["No — Where throws if the source changes after the query is built", false],
        ["Only if you call q.Refresh() first", false]
      ],
      explain: "Where builds a description of a query, not a result; nothing is filtered until foreach/ToList/Count enumerates it. Deferred execution cuts both ways: results reflect later changes, and enumerating twice runs the filter twice. Call ToList() when you want a fixed, materialized snapshot."
    },
    {
      q: "In EF Core, what is the practical difference between Where on IQueryable<T> versus after AsEnumerable()?",
      options: [
        ["IQueryable Where is translated into SQL and filters in the database; after AsEnumerable() the filter runs in C# on rows already fetched", true],
        ["There is none — both produce identical SQL", false],
        ["AsEnumerable() makes the query run asynchronously", false],
        ["IQueryable Where is checked at compile time, AsEnumerable Where at runtime", false]
      ],
      explain: "IQueryable operators build an expression tree that the provider translates to SQL — the database does the filtering and sends only matches. Once you switch to IEnumerable (AsEnumerable/ToList), subsequent operators are plain delegates running in memory — the earlier query fetched everything. A misplaced AsEnumerable() can turn a 10-row query into a full-table download."
    },
    {
      q: "What happens to the executing thread when an async method awaits a not-yet-complete HTTP call?",
      options: [
        ["The method returns to its caller and the thread is freed; the rest of the method resumes as a continuation when the response arrives", true],
        ["The thread blocks efficiently inside the network driver until the response arrives", false],
        ["A new dedicated thread is spawned to wait for the response", false],
        ["The thread spin-waits, polling the socket", false]
      ],
      explain: "await on an incomplete Task suspends the method — the compiler-generated state machine registers a continuation and returns. No thread waits on the I/O; the OS completion signals .NET, which schedules the continuation on the thread pool. This is why async servers scale: a thousand pending requests hold buffers, not a thousand blocked threads."
    },
    {
      q: "Why is calling task.Result (or .Wait()) on an async operation dangerous in a UI or classic ASP.NET context?",
      options: [
        ["It blocks the context's only thread while the awaited continuation needs that same thread to complete — a deadlock", true],
        [".Result silently swallows exceptions from the task", false],
        ["It always returns a stale cached value", false],
        ["It is fine — .Result is just a synchronous convenience", false]
      ],
      explain: "In contexts with a synchronization context (UI thread, old ASP.NET), await schedules its continuation back onto that context. If that thread is blocked in .Result waiting for the task, the continuation can never run — classic sync-over-async deadlock. Rules: async all the way up, and use await instead of .Result/.Wait(). (Exceptions also surface wrapped in AggregateException via .Result — a second annoyance.)"
    },
    {
      q: "When is 'async void' acceptable, and why is it otherwise avoided?",
      options: [
        ["Only for event handlers — callers cannot await it, and its exceptions bypass normal handling and can crash the process", true],
        ["Whenever the result isn't needed — it is the fire-and-forget best practice", false],
        ["Never — it does not compile", false],
        ["For any method called from a constructor", false]
      ],
      explain: "async void gives the caller no Task: nothing to await, no way to observe completion or exceptions — an unhandled one is rethrown on the synchronization context and can take down the app. Event handler signatures require void, which is the one sanctioned use. Everything else should return Task; for fire-and-forget, store the task or use a safe wrapper that logs faults."
    },
    {
      q: "Three independent web calls each take ~1 s. How do you get all three results in about 1 s total?",
      options: [
        ["Start all three tasks first, then await Task.WhenAll(t1, t2, t3) — awaiting each sequentially would take ~3 s", true],
        ["Use Parallel.For over the three calls", false],
        ["Mark the method async — awaits inside an async method run concurrently automatically", false],
        ["Wrap each call in Task.Run to move it to its own thread", false]
      ],
      explain: "await t1; await t2; await t3; is sequential — each starts only after the previous finishes. Start them all (var t1 = GetAsync(...); ...) so the I/O overlaps, then Task.WhenAll to await completion of all. Parallel.For is for CPU-bound loops and blocks threads; Task.Run adds pointless threads around operations that are already non-blocking I/O."
    },
    {
      q: "What does 'yield return' inside a method do?",
      options: [
        ["Turns the method into a lazy iterator: the compiler builds a state machine that produces one element per MoveNext, running code only as elements are requested", true],
        ["Returns all elements at once as a List<T>", false],
        ["Yields the thread to the OS scheduler between elements", false],
        ["It is shorthand for return inside a loop", false]
      ],
      explain: "An iterator method doesn't run when called — it returns an IEnumerable whose enumeration executes the body piecewise, pausing at each yield return. This gives streaming pipelines that never materialize full collections (and can even be infinite). Pitfall: side effects and exceptions inside don't happen until enumeration, which can be far from the call site."
    },
    {
      q: "Why must a FileStream be disposed (via 'using') rather than left to the garbage collector?",
      options: [
        ["The GC runs at unpredictable times and doesn't know about OS handles — Dispose releases the file handle deterministically, so the file isn't left locked", true],
        ["The GC cannot collect objects that implement IDisposable", false],
        ["Dispose is required to flush the CPU cache", false],
        ["Disposal prevents the object from being promoted to gen 2", false]
      ],
      explain: "The GC manages memory, not files, sockets, or connections; a collectable FileStream might not be finalized for seconds or minutes, keeping the file locked and the handle consumed. using guarantees Dispose on scope exit even when an exception is thrown. The finalizer on such classes is only a safety net — slow, unordered, and never a substitute for using."
    },
    {
      q: "Why are .NET gen 0 garbage collections cheap?",
      options: [
        ["Most objects die young, so gen 0 (a small nursery) is collected often, only survivors are copied out, and dead objects cost nothing to reclaim", true],
        ["Gen 0 objects are allocated on the stack and freed with the stack frame", false],
        ["The JIT inserts explicit free() calls for gen 0 objects", false],
        ["Gen 0 collections skip finalizers, which is where all the cost is", false]
      ],
      explain: "The generational hypothesis: most allocations are short-lived. Gen 0 is small, so scanning it is fast, and a copying collector's cost is proportional to the survivors, not the garbage — a nursery full of dead temporaries is nearly free to collect. Objects that keep surviving get promoted toward gen 2, whose rare full collections are the expensive ones."
    },
    {
      q: "What is special about allocating an array of 100,000 doubles (≈ 800 KB)?",
      options: [
        ["It goes on the Large Object Heap (≥ 85 KB), which is collected only with gen 2 and not compacted by default — prone to fragmentation if churned", true],
        ["It fails unless you enable gcAllowVeryLargeObjects", false],
        ["It is allocated on the stack for speed", false],
        ["Nothing — all arrays are treated identically by the GC", false]
      ],
      explain: "Objects of 85 KB and up skip the generational nursery and land on the LOH: collected rarely (with gen 2), and historically not compacted because moving megabyte objects is expensive. Repeatedly allocating and dropping big buffers fragments it and inflates memory. Mitigations: reuse buffers via ArrayPool<T>.Shared, or opt into LOH compaction explicitly."
    },
    {
      q: "With nullable reference types enabled, what does 'string? name' mean versus 'string name'?",
      options: [
        ["string? declares that null is an expected value and the compiler requires null checks before dereferencing; string promises the value won't be null — enforced by warnings, not at runtime", true],
        ["string? is a boxed string with different runtime behavior", false],
        ["string? allocates lazily on first use", false],
        ["They are identical — the ? is decorative", false]
      ],
      explain: "NRT is compile-time flow analysis: annotate intent (string never null, string? maybe null) and the compiler warns where a maybe-null value is dereferenced unguarded or where null is assigned to a non-nullable. At runtime both are the same string type — no checks are inserted, unlike Nullable<int> which is a real struct. It moves NullReferenceException hunting from production to the build."
    },
    {
      q: "Two record instances: new Point(1, 2) == new Point(1, 2). Result, and why?",
      options: [
        ["True — records generate value-based equality comparing members, unlike classes whose default == compares references", true],
        ["False — they are two distinct heap objects", false],
        ["Compile error — records do not support ==", false],
        ["True, but only because small records are interned like strings", false]
      ],
      explain: "record generates Equals, GetHashCode, ==/!=, and ToString over the declared members — two records with equal data are equal, which is what you want for DTOs, messages, and dictionary keys. A class with the same fields would compare references and give false. Records also provide 'with' expressions for non-destructive mutation: var moved = p with { X = 5 }."
    },
    {
      q: "What does this switch expression do? var fee = pkg switch { { Weight: > 20 } => 25m, { Express: true } => 15m, _ => 5m };",
      options: [
        ["Evaluates patterns top to bottom: heavy packages 25, otherwise express 15, otherwise 5 — order matters and _ is the required catch-all", true],
        ["Applies all matching arms and sums the fees", false],
        ["Chooses the most specific pattern regardless of order", false],
        ["Fails to compile — switch cannot test property values", false]
      ],
      explain: "Property patterns test shape and values declaratively; arms are tried in order and the first match wins, so a heavy express package pays 25. Without a matching arm the expression throws, hence the _ discard as default. With records + pattern matching, whole rule tables become single readable expressions — and the compiler warns when arms are unreachable or a value isn't covered."
    },
    {
      q: "What problem does Span<T> solve, and what is its key restriction?",
      options: [
        ["Zero-copy, zero-allocation views over slices of arrays/stack/native memory; as a ref struct it can live only on the stack — not in class fields or across await", true],
        ["Automatic parallelization of loops; it requires .NET Framework 4.8", false],
        ["Thread-safe shared memory between processes; it must be pinned", false],
        ["Compression of large arrays; it only works on byte[]", false]
      ],
      explain: "Substring, array slicing, and parsing traditionally allocate copies; Span<T> is a (pointer, length) view — slicing is arithmetic, not allocation, and one parsing routine handles arrays, stackalloc, and native buffers. Being a ref struct keeps it safely on the stack, so it cannot be boxed, stored in a field of a class, or cross an await — use Memory<T> for those cases."
    },
    {
      type: "multi",
      q: "You are fixing a codebase riddled with async bugs. Which changes actually improve it?",
      options: [
        ["Replace task.Result / task.Wait() with await, making callers async all the way up", true],
        ["Start independent tasks first, then await Task.WhenAll to run them concurrently", true],
        ["Change 'async void' methods to 'async Task' everywhere except event handlers", true],
        ["Wrap every awaited I/O call in Task.Run so it runs on a background thread", false],
        ["Add the async modifier to methods so their awaits run in parallel automatically", false]
      ],
      explain: "The three real fixes: .Result blocks a thread and deadlocks under a synchronization context; sequential awaits serialize independent work that WhenAll overlaps; async void hides exceptions and can't be awaited (event handlers are the one sanctioned use). The two fakes: Task.Run around already-asynchronous I/O just burns a thread-pool thread to wait, and the async keyword alone changes nothing about concurrency — awaits inside are still sequential."
    },
    {
      type: "multi",
      q: "A hot parsing loop is causing heavy GC pressure. Which changes genuinely reduce allocations?",
      options: [
        ["Slice the input with Span<T> / ReadOnlySpan<char> instead of Substring", true],
        ["Accumulate output in a reused StringBuilder instead of string +=", true],
        ["Rent large temporary buffers from ArrayPool<T>.Shared instead of new-ing them", true],
        ["Call GC.Collect() at the end of each iteration", false],
        ["Rewrite the loop body as a chain of LINQ operators with lambdas", false]
      ],
      explain: "Span slicing is pointer arithmetic (zero allocations where Substring copies), StringBuilder reuses one growing buffer, and ArrayPool recycles big arrays that would otherwise churn the LOH. GC.Collect() doesn't remove allocations — it adds forced pauses on top of them. LINQ chains typically add allocations (enumerators, closures, intermediate sequences), which is why hot paths often unroll them into plain loops."
    },
    {
      type: "order",
      q: "Arrange the life of a C# method, from source code to optimized native execution.",
      steps: [
        "Roslyn compiles the C# source to IL + metadata in an assembly",
        "The CLR loads the assembly when the app runs",
        "On the method's first call, the JIT compiles its IL to native code (tier 0)",
        "The method proves hot, so tiered compilation recompiles it optimized (tier 1)",
        "Subsequent calls run the optimized native code directly"
      ],
      explain: "Compilation happens twice, at different times: Roslyn to portable IL at build, JIT to machine code at run time — which is how one assembly runs on x64 and ARM alike. Tiering resolves the JIT's dilemma (compile fast vs compile well) by doing both: cheap code immediately, optimized code only for methods that earn it."
    },
    {
      type: "order",
      q: "An async method awaits an HTTP call that takes 200 ms. Put the events in the order they happen.",
      steps: [
        "The caller invokes the method; code runs synchronously until the first await",
        "The awaited task is incomplete, so the method suspends and returns a pending Task to the caller",
        "The calling thread is free and does other work while the request is in flight",
        "The response arrives; the continuation is scheduled on the thread pool",
        "The rest of the method runs and completes the Task the caller is awaiting"
      ],
      explain: "This is the compiler-generated state machine in motion: synchronous prologue, suspension at the incomplete await (return, not block), continuation on completion. The key scalability fact is step 3 — no thread waits out the 200 ms, which is why an async server holds thousands of in-flight requests with a small thread pool."
    },
    {
      level: "senior",
      q: "You maintain a general-purpose NuGet library. Why should its internal awaits use ConfigureAwait(false), and why doesn't ASP.NET Core application code bother?",
      options: [
        ["A library must not resume on whatever SynchronizationContext its caller had — skipping the context avoids deadlocks with blocking callers and needless context hops; ASP.NET Core has no SynchronizationContext, so there is nothing to capture", true],
        ["ConfigureAwait(false) makes the awaited operations run in parallel instead of sequentially", false],
        ["It disables the async state machine, removing the overhead of the await", false],
        ["It forces continuations onto the UI thread, which is safer for consumers", false]
      ],
      explain: "By default, await captures the current SynchronizationContext and resumes on it — correct for app code touching UI or request state, but a liability inside a library: if a consumer blocks on your Task from a context-bound thread (WinForms, WPF, legacy ASP.NET), the continuation queued to that context deadlocks. ConfigureAwait(false) says 'resume anywhere'. ASP.NET Core dropped the SynchronizationContext entirely, so in app code there it is a no-op — the guidance is context-dependent, which is exactly why it's a senior-level judgment."
    },
    {
      level: "senior",
      q: "A hot interface method usually completes synchronously from a cache. Why sign it ValueTask<T> instead of Task<T>, and what new rule does that impose on callers?",
      options: [
        ["ValueTask avoids allocating a Task object on the synchronous path; in exchange, a ValueTask must be awaited exactly once and never consumed concurrently or twice", true],
        ["ValueTask is always faster than Task and imposes no constraints", false],
        ["ValueTask runs the method on a dedicated high-priority thread; callers must dispose it", false],
        ["ValueTask caches its result forever, so callers may await it repeatedly for free", false]
      ],
      explain: "Task<T> is a class — every call allocates, even when the result was already in memory. ValueTask<T> is a struct that wraps either the result (sync path, zero allocation) or a backing object (async path). The price is a narrower contract: consume it once, then it may be recycled (IValueTaskSource pooling) — awaiting twice, WhenAll-ing it, or blocking on it concurrently is undefined behavior, not just slow. Default to Task; reach for ValueTask when profiling shows the allocation matters on a mostly-synchronous hot path."
    },
    {
      level: "senior",
      q: "Under load an API's p99 latency climbs to seconds while CPU sits at 15%; dotnet-counters shows the ThreadPool queue growing and thread count creeping up ~1–2 per second. Classic diagnosis?",
      options: [
        ["Thread-pool starvation from sync-over-async: pool threads are blocked in .Result/.Wait or synchronous I/O, and the pool injects replacement threads too slowly — fix by making the blocking paths genuinely async", true],
        ["Garbage-collection thrashing — switch to server GC and the problem disappears", false],
        ["Kestrel's connection limit is saturated — raise MaxConcurrentConnections", false],
        ["The CPU is the bottleneck — add instances until CPU utilization falls", false]
      ],
      explain: "Low CPU + growing queue + slow thread ramp is the starvation signature: work items sit queued not because the machine is busy but because every pool thread is parked in a blocking wait, and the pool's hill-climbing algorithm only adds threads gradually. GC or CPU saturation would show in their own counters. The cure is removing the blocking (async all the way, async DB drivers), not adding threads — bigger pools just delay the collapse. This failure famously appears only under production load, never in dev."
    },
    {
      level: "senior",
      q: "You need a lazily-created, thread-safe singleton service in plain C#. Which approach is right, and why?",
      options: [
        ["A static readonly field or Lazy<T> — the runtime guarantees once-only, thread-safe initialization; hand-rolled double-checked locking is easy to get subtly wrong and no faster", true],
        ["A null check in the property getter (if (_instance == null) _instance = new ...) — object writes are atomic so this is safe", false],
        ["A lock around every access to the instance, forever", false],
        ["Marking the field volatile is sufficient on its own", false]
      ],
      explain: "The CLR runs a type's static initialization exactly once under runtime locking — static readonly (or Lazy<T> for finer control of timing and exception policy) gets correctness for free. The naive null check races: two threads can both see null and both construct, and without volatile/memory barriers a thread can even observe a partially published object under the memory model. Locking every read is correct but pays contention forever. In DI apps, of course, the container's AddSingleton makes the whole question disappear — the pattern matters where there is no container."
    },
    {
      type: "multi",
      level: "senior",
      q: "Which of these C# constructs cause hidden heap allocations?",
      options: [
        ["A lambda that captures a local variable — closure object plus delegate instance", true],
        ["Calling an interface method on a struct stored in an interface-typed variable — the struct is boxed", true],
        ["Calling a params int[] method with three literal ints — an array is allocated per call", true],
        ["Slicing a ReadOnlySpan<char> with Slice(2, 5)", false],
        ["Allocating a small buffer with stackalloc", false]
      ],
      explain: "The senior skill is seeing allocations the syntax hides: closures lift captured locals onto a compiler-generated heap class; interface dispatch on a struct boxes it (the classic foreach-over-List<T>-via-IEnumerable<T> trap); params conjures an array unless a zero-arg overload exists. Span slicing is arithmetic on a stack struct and stackalloc is, by definition, stack memory. In a per-request path each of these is noise; in a million-iteration loop they are the GC pressure your profiler keeps pointing at."
    },
    {
      type: "order",
      level: "senior",
      q: "A production service's memory grows ~50 MB/hour until OOM restarts. Arrange the diagnosis-to-fix workflow.",
      steps: [
        "Confirm it is a managed-heap leak: metrics rise steadily across requests and dotnet-counters shows GC heap size (not native memory) growing",
        "Capture two heap dumps from the affected instance some minutes apart with dotnet-dump",
        "Diff the dumps' heap statistics to find the type whose instance count and retained bytes keep growing",
        "Walk that type's GC roots (gcroot) to find the holder — e.g. a static event's invocation list or an unbounded cache dictionary",
        "Fix the root cause (unsubscribe, weak handler, bounded cache), redeploy, and watch the metric to confirm the slope is flat"
      ],
      explain: "A .NET 'leak' is a live-reference leak — the GC cannot collect what is still rooted, and the usual roots are statics: event subscriptions from long-lived publishers, caches without eviction, and captured contexts. Two dumps beat one because growth, not size, identifies the culprit; gcroot turns 'what' into 'who holds it'. The final step is the professional discipline: a fix isn't done until the graph proves it."
    },
    {
      mono: true,
      code: "async Task<string[]> DownloadAllAsync(string[] urls, HttpClient http)\n{\n    // ??? — download ALL urls concurrently, then return the results\n}",
      q: "Which body downloads all URLs concurrently?",
      options: [
        ["var tasks = urls.Select(u => http.GetStringAsync(u)).ToArray();\nreturn await Task.WhenAll(tasks);", true],
        ["var results = new List<string>();\nforeach (var u in urls)\n    results.Add(await http.GetStringAsync(u));\nreturn results.ToArray();", false],
        ["return urls.AsParallel()\n    .Select(u => http.GetStringAsync(u).Result)\n    .ToArray();", false],
        ["return (string[])urls.Select(async u => await http.GetStringAsync(u));", false]
      ],
      explain: "ToArray() materializes the Select, which STARTS every request; Task.WhenAll then awaits them together — total time ≈ the slowest single download. The foreach version compiles and works but awaits one download before starting the next: sequential, N× slower. AsParallel + .Result burns a blocked thread per URL (sync-over-async on the thread pool). The last option doesn't even type-check — Select of async lambdas yields IEnumerable<Task<string>>, not string[]."
    },
    {
      mono: true,
      code: "var actions = new List<Action>();\nfor (int i = 0; i < 3; i++)\n{\n    // ??? — each action must print its own iteration number\n}\nactions.ForEach(a => a());   // must print: 012",
      q: "Which line makes the program print 012?",
      options: [
        ["int copy = i;\nactions.Add(() => Console.Write(copy));", true],
        ["actions.Add(() => Console.Write(i));", false],
        ["actions.Add(() => { int copy = i; Console.Write(copy); });", false],
        ["actions.Add(delegate { Console.Write(i); });", false]
      ],
      explain: "Closures capture variables, not values. There is one i for the whole for-loop, so options 2 and 4 print 333 — all lambdas share the final value. Option 3 is the subtle trap: the copy is made when the lambda RUNS (after the loop, i is already 3), not when it is created. Only a fresh variable per iteration, declared outside the lambda but inside the loop body, gives each closure its own cell — which is exactly what foreach does automatically since C# 5."
    },
    {
      mono: true,
      code: "class RequestCounter\n{\n    private long _count;\n\n    public void Record()\n    {\n        // ??? — Record() is called concurrently from many threads\n    }\n\n    public long Value => Interlocked.Read(ref _count);\n}",
      q: "Which implementation makes Record() thread-safe?",
      options: [
        ["Interlocked.Increment(ref _count);", true],
        ["_count++;", false],
        ["lock (_count) { _count++; }", false],
        ["_count = Volatile.Read(ref _count) + 1;", false]
      ],
      explain: "_count++ compiles to load, add, store — two threads can interleave and lose increments. lock (_count) doesn't compile: lock needs a reference type, and boxing a long would lock a throwaway box anyway. Volatile.Read gives a fresh read but the add-and-store afterwards is still a race. Interlocked.Increment performs the whole read-modify-write as one atomic hardware instruction — correct and cheaper than a lock statement for a single counter."
    },
    {
      mono: true,
      code: "public async Task<Config> LoadAsync(string path)\n{\n    // ??? — the file handle must be released even if Parse throws\n    var json = await reader.ReadToEndAsync();\n    return Parse(json);\n}",
      q: "Which declaration guarantees the file handle is released?",
      options: [
        ["using var reader = new StreamReader(path);", true],
        ["var reader = new StreamReader(path);", false],
        ["var reader = new StreamReader(path);\nreader.Dispose();", false],
        ["var reader = new StreamReader(path);\nGC.Collect();  // clean up when done", false]
      ],
      explain: "'using var' compiles to try/finally around the rest of the scope: Dispose runs whether the method returns normally or Parse throws — and it composes correctly with await. A bare declaration leaks the OS handle on any exception until a finalizer eventually runs. Disposing immediately after construction closes the stream BEFORE the read, so ReadToEndAsync throws ObjectDisposedException. GC.Collect() is both the wrong tool (GC manages memory, not handles, deterministically) and a performance anti-pattern."
    }
  ],

  ood: [
    {
      q: "What does encapsulation mean in practice for a BankAccount class?",
      options: [
        ["Balance is private and changes only through methods like Deposit/Withdraw that enforce invariants — no external code can put the object into an invalid state", true],
        ["All fields are public so callers can use the object flexibly", false],
        ["The class is split into partial files to hide code", false],
        ["The class is sealed so nobody can see its internals", false]
      ],
      explain: "Encapsulation is invariant protection: the object owns its state and exposes operations, so 'balance never negative' is enforced in exactly one place. A public Balance setter means every caller everywhere must remember the rule — and one won't. Access modifiers are the mechanism; designing the API around behaviors rather than data is the discipline."
    },
    {
      q: "Shape s = new Circle(); s.Area(); runs Circle's Area. Which mechanism is this?",
      options: [
        ["Runtime (subtype) polymorphism — a virtual call dispatches to the object's actual type, letting callers work with any Shape without knowing which", true],
        ["Method overloading — the compiler picks the best signature", false],
        ["Reflection — the runtime searches for the method by name", false],
        ["Implicit conversion from Shape to Circle", false]
      ],
      explain: "Virtual dispatch looks up the override in the runtime type's method table, so code written against Shape automatically works for every present and future subclass. Overloading, by contrast, is resolved at compile time from parameter types. Polymorphism is what makes 'add a new shape' a new-class change instead of an edit-every-switch change."
    },
    {
      q: "A base member is virtual and the child uses 'new' instead of 'override'. What happens when the child object is called through a base-typed reference?",
      options: [
        ["The base implementation runs — 'new' hides rather than overrides, so base-typed calls never see the child's method", true],
        ["The child implementation runs, same as override", false],
        ["A runtime AmbiguousMatchException is thrown", false],
        ["It fails to compile", false]
      ],
      explain: "'new' creates an unrelated method that shares a name: Animal a = new Cat(); a.Speak() runs Animal's version, while ((Cat)c).Speak() runs Cat's. That split personality is almost never intended — use override (requires the base to be virtual/abstract) for polymorphism. The compiler's CS0108 hiding warning exists precisely to catch the accidental case."
    },
    {
      q: "When is an interface the right abstraction rather than an abstract base class?",
      options: [
        ["When unrelated types share a capability, or when consumers should mock/swap the dependency — interfaces carry no state and a class can implement many", true],
        ["When the derived types need shared fields and common constructor logic", false],
        ["Never since C# 8 — default interface methods made abstract classes obsolete", false],
        ["Interfaces are only for public APIs; internally classes are always better", false]
      ],
      explain: "Interfaces model capabilities (IComparable, ILogger, IDisposable) across unrelated types, and C#'s single inheritance means a class can implement many interfaces but extend one base. Abstract classes earn their place when a family genuinely shares state and partial implementation (Stream). For injected dependencies, prefer interfaces — DI containers and mocking libraries are built around them."
    },
    {
      q: "What does marking a class 'sealed' communicate and enable?",
      options: [
        ["No further inheritance: the class wasn't designed as an extension point — and the JIT can devirtualize calls to it", true],
        ["The class cannot be instantiated — like abstract", false],
        ["The class is immutable", false],
        ["The class is excluded from garbage collection", false]
      ],
      explain: "Inheritance is a contract you must design for (which members are virtual, what invariants children must keep); sealed opts out explicitly, keeping the type safe to change. It also helps performance: calls to sealed types need no virtual dispatch. Note many style guides suggest sealing by default and unsealing deliberately."
    },
    {
      q: "Why does 'composition over inheritance' usually win for combining behaviors like channel × retry policy?",
      options: [
        ["Each axis becomes an injected component that varies independently; inheritance would need a subclass per combination and couples children to base implementation details", true],
        ["Composition is faster because it avoids virtual calls", false],
        ["Inheritance is deprecated in modern C#", false],
        ["Composition lets you use private fields, which inheritance forbids", false]
      ],
      explain: "With Sender(IChannel, IRetryPolicy), adding a channel or a policy is one new class and zero edits elsewhere; the inheritance version needs EmailWithRetrySender, SmsWithRetrySender… multiplying per combination. Inheritance also transmits every base-class change to all children (fragile base class). Keep inheritance for genuine is-a with a stable base; reach for has-a everywhere else."
    },
    {
      q: "A ReportService generates the report, writes it to disk, and emails it. Which principle does this violate and what's the standard fix?",
      options: [
        ["Single Responsibility — three reasons to change in one class; split into generator, storage, and notifier composed together", true],
        ["Liskov Substitution — the class can't be substituted for its base", false],
        ["Interface Segregation — the class has too many interfaces", false],
        ["Nothing — cohesive classes should do everything about reports", false]
      ],
      explain: "Formatting changes, storage changes, and email changes are three independent pressures; bundling them means every change risks the other two behaviors and tests must drag all three along. Split by responsibility and compose (ReportService orchestrating IReportGenerator, IReportStore, INotifier). Symptom to watch for: describing the class honestly requires 'and'."
    },
    {
      q: "A payment switch statement gains a new case with every new provider, each time editing tested code. Which principle addresses this, and how?",
      options: [
        ["Open/Closed — define IPaymentProvider and add a new implementation per provider, so existing code is extended rather than modified", true],
        ["Dependency Inversion — the switch should be moved into the data layer", false],
        ["Interface Segregation — split the switch across smaller switches", false],
        ["Single Responsibility — each case should be its own method", false]
      ],
      explain: "OCP: new behavior should arrive as new code plugging into an abstraction, not edits to a growing conditional. One interface, one class per provider, and resolution by DI or a keyed lookup — adding Klarna touches zero existing lines. Judgment call: a small stable switch is fine; it's the repeated-edit pattern that signals the refactor."
    },
    {
      q: "Square extends Rectangle, overriding SetWidth to also change height. Code that sets a Rectangle's width to 4 and height to 5 now gets area 25. What is violated?",
      options: [
        ["Liskov Substitution — Square changes Rectangle's behavioral contract, so it can't substitute for Rectangle despite the is-a intuition", true],
        ["Encapsulation — the setters should have been private", false],
        ["Open/Closed — Square modified Rectangle instead of extending it", false],
        ["Nothing — mathematically a square is a rectangle, so the model is correct", false]
      ],
      explain: "LSP is about behavior, not taxonomy: callers of Rectangle rely on width and height being independent, and Square breaks that postcondition. Same smell: an override throwing NotSupportedException. Fixes: don't inherit (separate types), or abstract over what's genuinely common (IShape.Area). If a subtype needs callers to 'know' which subtype it is, the hierarchy already failed."
    },
    {
      q: "An IMachine interface has Print, Scan, and Fax; the basic printer must throw on Scan and Fax. Which principle is violated?",
      options: [
        ["Interface Segregation — split into IPrinter, IScanner, IFax so implementers take only what they support", true],
        ["Dependency Inversion — the machine should depend on abstractions", false],
        ["Single Responsibility — printing and scanning belong in one interface, faxing in another", false],
        ["Open/Closed — interfaces should never gain members", false]
      ],
      explain: "Fat interfaces force implementers into stubs and NotSupportedException — which then breaks LSP for callers who trusted the contract. Small role interfaces let the multifunction device implement all three while the basic printer implements one, and let clients depend only on the capability they use (a report module needs IPrinter, not IMachine)."
    },
    {
      q: "OrderService directly instantiates StripeClient with 'new' inside its methods. What does Dependency Inversion say, and what's the concrete benefit?",
      options: [
        ["Depend on an IPaymentGateway abstraction and receive it from outside — business logic becomes testable with fakes and the provider is swappable without editing OrderService", true],
        ["Move the new StripeClient() call into a static helper so it's written once", false],
        ["Make StripeClient a singleton to avoid repeated construction", false],
        ["Inherit OrderService from StripeClient to reuse its methods", false]
      ],
      explain: "High-level policy (ordering rules) shouldn't reference low-level detail (a specific PSP's SDK). Define the interface the service needs, let StripeGateway implement it, and inject it. Tests hand in a FakeGateway with no network; production wiring lives in one composition root. The 'inversion' is the direction of the dependency arrow: detail depends on abstraction, not vice versa."
    },
    {
      q: "Why is constructor injection preferred over calling provider.GetService<T>() inside methods (service locator)?",
      options: [
        ["The constructor states dependencies explicitly and guarantees a fully-initialized object; a locator hides dependencies, couples code to the container, and fails at use-time instead of construction-time", true],
        ["Constructor injection is faster because reflection is avoided", false],
        ["Service locator only works with singletons", false],
        ["There is no practical difference — both get the dependency", false]
      ],
      explain: "With constructor injection you can read a class's requirements from its signature, tests can construct it with plain 'new' and fakes, and a missing registration surfaces immediately when the graph is built. Locator calls scatter hidden container lookups through logic — dependencies invisible from the API, failures deferred to whenever the line runs, tests forced to build a container."
    },
    {
      q: "C# events and the IEnumerable/IEnumerator pair are built-in versions of which design patterns?",
      options: [
        ["Observer (events: subscribers notified by a publisher) and Iterator (sequential access without exposing the collection's structure)", true],
        ["Singleton and Factory Method", false],
        ["Decorator and Adapter", false],
        ["Strategy and Mediator", false]
      ],
      explain: "The GoF patterns predate their .NET shorthands: event/+=/-= is observer with language support; foreach compiles to the iterator protocol (GetEnumerator/MoveNext/Current), with yield return generating the implementation. Recognizing these mappings matters — you rarely hand-roll observer in C#; you declare an event."
    },
    {
      q: "new GZipStream(new BufferedStream(new FileStream(...)), ...) — which pattern is this, and what makes it work?",
      options: [
        ["Decorator — each wrapper implements Stream while adding behavior around an inner Stream, so features stack in any combination without subclass explosion", true],
        ["Composite — the streams form a tree treated as one stream", false],
        ["Chain of responsibility — each stream may handle or forward requests", false],
        ["Facade — a simple interface over a complex subsystem", false]
      ],
      explain: "Decorator = same abstraction outside, wrapped instance inside, added behavior around delegation. Compression, buffering, and encryption each wrap any Stream, so combinations compose at runtime instead of requiring a CompressedBufferedFileStream class per combo. The same shape appears in DelegatingHandler chains around HttpClient and logging decorators around repositories."
    },
    {
      q: "Shipping cost calculation differs per carrier and changes often. Which pattern fits, and what does it look like with .NET DI?",
      options: [
        ["Strategy — an IShippingCalculator interface with one implementation per carrier, injected (or resolved by key) so the algorithm is swappable without touching consumers", true],
        ["Singleton — one calculator instance shared to keep results consistent", false],
        ["Template method — a base class with the algorithm hard-coded in order", false],
        ["Memento — store each carrier's previous results for undo", false]
      ],
      explain: "Strategy encapsulates interchangeable algorithms behind one interface; the consumer just calls Calculate and neither knows nor cares which carrier logic ran. With DI this is barely a 'pattern' — register implementations and inject the right one (or an IEnumerable<IShippingCalculator> to pick by carrier code). Adding a carrier = one new class, OCP satisfied."
    },
    {
      q: "You override Equals on a class used as a Dictionary key but leave GetHashCode alone. What breaks?",
      options: [
        ["Two 'equal' keys can land in different buckets, so lookups miss entries that are present — the contract requires equal objects to have equal hash codes", true],
        ["Nothing — GetHashCode has a sensible default that follows Equals", false],
        ["The dictionary throws NotSupportedException on Add", false],
        ["Performance drops but correctness is unaffected", false]
      ],
      explain: "Hash containers find the bucket by GetHashCode first, then confirm with Equals. Default GetHashCode is identity-based, so two distinct-but-equal instances hash differently and TryGetValue looks in the wrong bucket — items go in and never come out. Override both together and implement IEquatable<T>; or use a record and get the whole cluster generated correctly."
    },
    {
      q: "Why are immutable objects (records with init-only properties) particularly valuable in concurrent code?",
      options: [
        ["State that never changes can be shared across threads without locks — no writes means no data races — and references can be handed out without defensive copies", true],
        ["The runtime stores immutable objects in a special lock-free heap", false],
        ["Immutable objects are exempt from garbage collection", false],
        ["They serialize faster because fields are sorted", false]
      ],
      explain: "Data races need a writer; remove mutation and readers can share freely — no locks, no torn reads, no defensive cloning. Updates create new versions (p with { X = 5 }), which also keeps old values stable as dictionary keys and cache entries. The cost — allocation per change — is usually noise; measure before abandoning immutability on a hot path."
    },
    {
      q: "A class needs eight constructor parameters, all services. What is this a symptom of, and what's the honest fix?",
      options: [
        ["Low cohesion / SRP violation — the class does too much; split it into focused classes, or extract parameter clusters into a cohesive collaborator", true],
        ["A DI limitation — switch those parameters to service-locator calls", false],
        ["Nothing — big constructors are normal in enterprise code", false],
        ["Too much testing — inline the dependencies with 'new' to simplify", false]
      ],
      explain: "Constructor injection makes coupling visible — that's a feature. Eight dependencies means eight reasons to change; hiding them (locator, property injection, a god 'context' object) removes the symptom and keeps the disease. Look for clusters that form a missing concept (three params about pricing → PricingEngine) or responsibilities to split. The constructor is the smoke alarm; don't unplug it."
    },
    {
      type: "multi",
      q: "Which of these code-review findings are genuine SOLID violations?",
      options: [
        ["A ReportService that generates, saves to disk, and emails reports — three reasons to change", true],
        ["A subclass that throws NotSupportedException from an inherited interface member", true],
        ["OrderService constructing StripeClient with 'new' inside its business logic", true],
        ["A class implementing four small role interfaces (IPrinter, IScanner…)", false],
        ["A three-case switch over an enum that has not changed in years", false]
      ],
      explain: "The first three map to SRP (multiple responsibilities), LSP (the subtype breaks the base contract — usually an ISP smell too), and DIP (high-level policy bound to a concrete detail). Implementing several small interfaces is what ISP recommends, not a violation. And a stable, small switch is fine — OCP pressure applies to conditionals that keep growing, not to every branch statement."
    },
    {
      type: "multi",
      q: "A pricing algorithm must be swappable at runtime (per customer tier) and unit-testable without infrastructure. Which design choices support that?",
      options: [
        ["Define an IPricingStrategy interface owned by the business layer", true],
        ["Inject the strategy through the consumer's constructor", true],
        ["Implement one strategy class per tier and choose by key at resolution time", true],
        ["Implement pricing as a static utility class for easy calling", false],
        ["Resolve the strategy with provider.GetService<T>() inside the pricing method", false]
      ],
      explain: "Interface + constructor injection + one implementation per variant is the strategy pattern on DI rails: consumers stay ignorant of which algorithm runs, tests pass a fake, and adding a tier is a new class (OCP). Statics are the opposite — un-swappable, un-mockable, hidden coupling. Service-locator calls do technically swap, but they hide the dependency and couple logic to the container, failing at use-time instead of composition-time."
    },
    {
      type: "order",
      q: "A payment switch statement grows a new case per provider. Arrange the refactor to strategy (Open/Closed) in the right order.",
      steps: [
        "Define an IPaymentProvider interface capturing what every case does",
        "Move each case body into its own class implementing the interface",
        "Register the implementations in the DI container, keyed by provider",
        "Change the consumer to resolve and call the right implementation instead of switching",
        "Delete the switch — new providers are now new classes only"
      ],
      explain: "The contract comes first because it is discovered from the switch: the shared shape of all cases. Then behavior moves case by case (each step compilable and testable), wiring happens at the composition root, and the conditional disappears last. After this, adding Klarna touches zero existing lines — the definition of open for extension, closed for modification."
    },
    {
      type: "order",
      q: "OrderService calls the Stripe SDK directly and cannot be unit-tested. Arrange the dependency-inversion refactor.",
      steps: [
        "Define IPaymentGateway in the application layer, expressing only what OrderService needs",
        "Change OrderService to receive IPaymentGateway through its constructor",
        "Write StripeGateway in the infrastructure layer, adapting the SDK to the interface",
        "Register the adapter in the composition root (services.AddScoped<IPaymentGateway, StripeGateway>())",
        "Unit-test OrderService with a FakeGateway — no network, no Stripe account"
      ],
      explain: "The port is defined by the consumer's needs (ChargeAsync, RefundAsync), not by Stripe's API surface — that's what makes it an inversion: the detail adapts to the policy. Constructor injection swaps the hard-wired dependency, the adapter quarantines the SDK at the edge, one line of wiring connects them, and the payoff lands in step 5: business logic testable in milliseconds."
    },
    {
      level: "senior",
      q: "Two features shared ~70% of their logic, so a helper was extracted. Every feature since has added a flag and a branch to it; the helper now takes six booleans. What is the principal-level read?",
      options: [
        ["This is the 'wrong abstraction': the shared shape was coincidental, and each flag couples unrelated features to each other. Inline it back into the callers and let honest duplication reveal the real abstraction — duplication is cheaper than the wrong abstraction", true],
        ["Convert the six booleans into a strategy pattern with one interface per flag combination", false],
        ["The helper just needs more unit tests before the next flag is added", false],
        ["Extract each branch into its own private method to shrink the helper", false]
      ],
      explain: "Sandi Metz's rule captures the judgment: an abstraction extracted from accidental similarity decays flag by flag until nobody can change it safely, because every feature's requirements flow through everyone else's code. Wrapping the flags in patterns or tests preserves the coupling — it polishes the wrong thing. Unwinding to duplication feels like a regression but restores independent evolution; if a true shared concept exists, it will re-emerge cleanly. Knowing when to *remove* an abstraction is the senior skill."
    },
    {
      level: "senior",
      q: "Your published NuGet package's IStorage interface needs a new capability, but hundreds of external implementers exist. Which evolution path avoids breaking them?",
      options: [
        ["Ship the member as a default interface method with a sensible base implementation, or introduce a separate optional capability interface (e.g. IBatchStorage) that implementers opt into and consumers type-test for", true],
        ["Add the member to IStorage directly — implementers just need to recompile", false],
        ["Bump the major version; semver makes the break acceptable without a migration path", false],
        ["Have consumers discover the new method via reflection when present", false]
      ],
      explain: "Adding an abstract member to a published interface is a source- and binary-breaking change for every implementer — recompiling doesn't help; their classes no longer satisfy the contract. Default interface methods (C# 8+) let the interface grow with a fallback so existing implementations keep working and override when ready; a capability interface achieves the same with older targets. A major-version break is sometimes right, but only as a deliberate choice with a migration path — semver describes breakage, it doesn't excuse it."
    },
    {
      level: "senior",
      q: "A test suite mocks every dependency and Verifies each internal call; behavior-preserving refactors break dozens of tests. What is the design signal?",
      options: [
        ["The tests are coupled to implementation rather than behavior: assert observable outcomes at the boundaries, mock only architecturally significant ports (I/O, external services), and treat 'everything must be mocked' as a coupling smell in the design itself", true],
        ["The mocks aren't deep enough — mock the dependencies' dependencies too", false],
        ["This is normal TDD — tests are supposed to change with every refactor", false],
        ["Delete the unit tests and rely on end-to-end tests only", false]
      ],
      explain: "Tests exist to enable refactoring; a suite that shatters when structure changes while behavior doesn't is doing the opposite. Verify(x => x.CalculateTax(...), Times.Once) pins the private choreography — assert the resulting invoice total instead. The deeper signal: if a class can't be tested without faking six collaborators, it has six couplings; fixing the design (fewer, more meaningful ports) fixes the tests. Mocks earn their keep at process boundaries, not between your own classes."
    },
    {
      level: "senior",
      q: "Invariant: a customer's open orders must never exceed their credit limit. Two concurrent requests each pass the in-memory check, then both SaveChanges — the limit is now exceeded. Robust design?",
      options: [
        ["Make the invariant transactional where the data lives: model it as one consistency boundary (aggregate) guarded by an optimistic concurrency token or database constraint, so one of the two commits fails and is retried against fresh state", true],
        ["Wrap the check and save in a C# lock statement — serialize the requests in memory", false],
        ["Re-run the check immediately before SaveChanges to shrink the race window", false],
        ["Cache credit limits in Redis so the checks are faster than the race", false]
      ],
      explain: "Check-then-act across a network is inherently racy; shrinking or speeding the window changes the odds, not the outcome, and an in-process lock evaporates the moment you run two instances. Correctness needs the datastore to arbitrate: a rowversion token makes the second SaveChanges throw DbUpdateConcurrencyException (retry with fresh data), or a CHECK/unique constraint rejects it outright. Deciding *which* data must be transactionally consistent — the aggregate boundary — is the actual design decision; everything outside it can be eventually consistent."
    },
    {
      type: "order",
      level: "senior",
      q: "You must change the pricing logic buried in a 3,000-line untested legacy class that talks to the database directly. Arrange the professional workflow.",
      steps: [
        "Pin current behavior with characterization tests around the class's observable outputs — whatever it does today counts as 'correct'",
        "Find a seam: extract an interface over the direct database/static calls the pricing logic depends on",
        "Break the dependency by injecting that interface, so tests can substitute an in-memory fake",
        "Refactor and change the pricing internals in small steps, keeping the characterization tests green",
        "Replace the characterization tests with intent-revealing tests that specify the new behavior"
      ],
      explain: "This is the legacy-code loop (Feathers): you cannot safely change what you cannot test, and you cannot test without a seam — but creating the seam is itself a change, so characterization tests come first as a safety net that encodes reality, bugs included. Only at the end do tests switch from 'what it does' to 'what it should do'. The anti-pattern this prevents: a big-bang rewrite validated by nothing, discovered broken in production."
    },
    {
      mono: true,
      code: "public class InvoiceService\n{\n    // ??? — needs IInvoiceRepository; must be unit-testable without a database\n\n    public Invoice GetInvoice(int id) => _repo.Find(id);\n}",
      q: "Which dependency declaration fits the requirement?",
      options: [
        ["private readonly IInvoiceRepository _repo;\npublic InvoiceService(IInvoiceRepository repo) => _repo = repo;", true],
        ["private readonly SqlInvoiceRepository _repo = new SqlInvoiceRepository();", false],
        ["private IInvoiceRepository _repo => ServiceLocator.Get<IInvoiceRepository>();", false],
        ["public IInvoiceRepository Repo { get; set; }\nprivate IInvoiceRepository _repo => Repo;", false]
      ],
      explain: "Constructor injection of the interface is the whole recipe: the dependency is explicit, required (the object cannot exist without it), and a test passes a fake with plain new — no container. Hard-wiring SqlInvoiceRepository binds the class to a real database forever. The service-locator property hides the dependency and drags a static container into every test. Settable property injection makes the dependency optional and mutable — a half-constructed object waiting for a NullReferenceException."
    },
    {
      mono: true,
      code: "builder.Services.AddDbContext<ShopDbContext>(o => o.UseSqlServer(cs));\n// ??? — register OrderService (constructor takes ShopDbContext)\n//        and IClock (stateless time abstraction)",
      q: "Which registrations have correct lifetimes?",
      options: [
        ["builder.Services.AddScoped<OrderService>();\nbuilder.Services.AddSingleton<IClock, SystemClock>();", true],
        ["builder.Services.AddSingleton<OrderService>();\nbuilder.Services.AddSingleton<IClock, SystemClock>();", false],
        ["builder.Services.AddSingleton<OrderService>();\nbuilder.Services.AddScoped<IClock, SystemClock>();", false],
        ["builder.Services.AddSingleton<OrderService>();\nbuilder.Services.AddTransient<IClock, SystemClock>();", false]
      ],
      explain: "AddDbContext registers ShopDbContext as scoped, so anything consuming it must live at most as long as a scope: AddScoped<OrderService> is right (transient would work too). Every other option makes OrderService a singleton — the captive-dependency bug: one DbContext trapped for the process lifetime, shared across concurrent requests. The stateless clock is the mirror case: no state, safe everywhere, so singleton is the natural (cheapest) choice, and its lifetime never constrains anyone."
    },
    {
      mono: true,
      code: "public record Order(int Id, OrderStatus Status, decimal Total);\n\nOrder MarkPaid(Order order)\n{\n    // ??? — Order is immutable; return the paid version\n}",
      q: "Which body is correct?",
      options: [
        ["return order with { Status = OrderStatus.Paid };", true],
        ["order.Status = OrderStatus.Paid;\nreturn order;", false],
        ["return new Order(order.Id, OrderStatus.Paid, 0m);", false],
        ["return (Order)order.MemberwiseClone();", false]
      ],
      explain: "The with-expression is non-destructive mutation: it clones the record, replaces only the named members, and leaves the original untouched — exactly the idiom records exist for. Assigning order.Status doesn't compile: positional record properties are init-only. The manual constructor call compiles and is the trap — it silently zeroes Total, the bug with-expressions prevent. MemberwiseClone is protected (won't compile here) and would change nothing about Status anyway."
    },
    {
      mono: true,
      level: "senior",
      code: "// shipped in v1 — hundreds of external implementers exist:\npublic interface IStorage\n{\n    Task SaveAsync(string key, byte[] data);\n\n    // v2 must add bulk save WITHOUT breaking existing implementers\n    // ???\n}",
      q: "Which addition keeps every existing implementer compiling and working?",
      options: [
        ["async Task SaveManyAsync(IEnumerable<KeyValuePair<string, byte[]>> items)\n{\n    foreach (var item in items)\n        await SaveAsync(item.Key, item.Value);\n}", true],
        ["Task SaveManyAsync(IEnumerable<KeyValuePair<string, byte[]>> items);", false],
        ["[Obsolete(\"implement in v2\")]\nTask SaveManyAsync(IEnumerable<KeyValuePair<string, byte[]>> items);", false],
        ["Task SaveManyAsync(IEnumerable<KeyValuePair<string, byte[]>> items)\n    => throw new NotImplementedException();", false]
      ],
      explain: "A default interface method (C# 8+) with a real fallback — loop over the existing SaveAsync — means old implementers keep compiling AND keep working; providers with a native bulk operation override it for performance. Adding an abstract member breaks every implementer at compile time, and [Obsolete] doesn't change that. The throwing default compiles but plants a landmine: callers see SaveManyAsync on every IStorage and get runtime explosions from implementations that never opted in — a contract that lies."
    }
  ],

  arch: [
    {
      q: "What is the difference between the .NET SDK and the .NET runtime?",
      options: [
        ["The SDK contains the toolchain (compilers, dotnet CLI, MSBuild) for building; the runtime only executes apps — dev machines need the SDK, servers just the runtime", true],
        ["The SDK is for Windows, the runtime for Linux", false],
        ["The runtime includes Visual Studio; the SDK does not", false],
        ["They are the same package with different names", false]
      ],
      explain: "dotnet build/test/publish need the SDK; a published framework-dependent app needs only the matching runtime on the host (a self-contained publish carries the runtime with it, needing nothing preinstalled). CI images and Dockerfiles reflect this: sdk image for the build stage, slim runtime (aspnet) image for the final stage."
    },
    {
      q: "Why must UseExceptionHandler be registered first (outermost) in the ASP.NET Core pipeline?",
      options: [
        ["Middleware wraps everything after it — only as the outermost layer does its try/catch see exceptions from all later middleware and endpoints", true],
        ["The framework requires it first or throws at startup", false],
        ["Exception handling is faster when it runs before routing", false],
        ["Order doesn't matter; middleware runs in dependency order automatically", false]
      ],
      explain: "The pipeline is nested like onion layers: each middleware runs code, awaits next(), then resumes. An exception thrown deep in an endpoint propagates back up through the layers — anything registered before the handler is outside its catch. Same logic drives all ordering: routing before auth (auth needs the matched endpoint), CORS before endpoints, and so on."
    },
    {
      q: "Why does UseAuthentication come before UseAuthorization?",
      options: [
        ["Authentication establishes who the user is (populates the principal); authorization then decides what they may do — the second question needs the first answered", true],
        ["Authorization is slower, so it runs later to be skipped on failures", false],
        ["Alphabetical convention in the templates", false],
        ["It doesn't matter; they are independent", false]
      ],
      explain: "AuthN reads the token/cookie and builds HttpContext.User; AuthZ evaluates [Authorize] policies against that principal. Reversed, authorization sees an anonymous user and rejects everything (or lets [AllowAnonymous] paths through incorrectly). This ordering pair is the most common pipeline bug — 401s on valid tokens with both middlewares present but swapped."
    },
    {
      q: "A request for /logo.png hits UseStaticFiles and the file exists. What happens to the rest of the pipeline?",
      options: [
        ["Static files short-circuits: it writes the response and does not call next(), so routing, auth, and endpoints never run for this request", true],
        ["The pipeline continues; the endpoint can overwrite the file response", false],
        ["An exception is thrown if any middleware follows static files", false],
        ["The file is queued and sent after the endpoint responds", false]
      ],
      explain: "Any middleware can end the request by responding instead of calling next() — that's the mechanism behind static files, and it's why they're placed early: cheap file hits skip the expensive machinery. Consequence to know: by default static files bypass authorization; protecting downloads requires serving them through an endpoint (or mapping static files with auth requirements)."
    },
    {
      q: "In the DI container, what exactly does a 'scoped' lifetime mean in a web app?",
      options: [
        ["One instance per HTTP request: everything resolved during that request shares it, and it is disposed when the request's scope ends", true],
        ["One instance per class that requests it", false],
        ["A short-lived cache entry that expires after a configurable time", false],
        ["One instance per thread", false]
      ],
      explain: "ASP.NET Core creates a service scope per request; scoped registrations yield the same instance anywhere within that request and a fresh one for the next. That's the natural unit-of-work lifetime — DbContext is registered scoped for exactly this reason. Singleton = per process (must be thread-safe); transient = new object every resolution."
    },
    {
      q: "A singleton CacheWarmer takes DbContext in its constructor. Why is this a bug?",
      options: [
        ["Captive dependency: the scoped DbContext gets trapped in the singleton for the process lifetime, shared across concurrent requests — and DbContext is not thread-safe", true],
        ["Singletons cannot have constructor parameters", false],
        ["DbContext is too large to hold in memory long-term", false],
        ["It's fine — the container refreshes the context per request automatically", false]
      ],
      explain: "The container injects once at singleton construction; 'scoped' becomes meaningless for that instance. Two simultaneous requests then use one change tracker and connection — corrupt state, intermittent crashes. Development-mode scope validation throws for exactly this. Fix: inject IServiceScopeFactory, and per operation: using var scope = factory.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();"
    },
    {
      q: "A BackgroundService processes a queue forever and needs a DbContext per item. Correct pattern?",
      options: [
        ["Create a scope per iteration with IServiceScopeFactory, resolve the DbContext from it, and let scope disposal clean up — honoring the stopping CancellationToken", true],
        ["Inject the DbContext into the BackgroundService constructor since it lives as long as the service", false],
        ["Use one static DbContext for the whole app to save allocations", false],
        ["BackgroundService cannot use DbContext; call raw ADO.NET instead", false]
      ],
      explain: "Hosted services are singletons, so constructor-injecting scoped services is the captive-dependency bug again. The sanctioned pattern is a scope per unit of work inside ExecuteAsync's loop — fresh context, tracked entities released each iteration. Respect stoppingToken so shutdown is graceful: the host signals it, waits, then aborts."
    },
    {
      q: "Why is DbContext designed to be short-lived (per request/unit of work) rather than shared?",
      options: [
        ["It is not thread-safe and its change tracker accumulates every entity it loads — a long-lived shared context means races, stale data, and unbounded memory growth", true],
        ["Each DbContext opens a permanent database connection that must be rationed", false],
        ["The license restricts concurrent usage per instance", false],
        ["Short lives force more SQL round trips, which EF prefers", false]
      ],
      explain: "One context = one unit of work: load, modify, SaveChanges, dispose. Tracked entities are never forgotten until disposal, so an immortal context grows without bound and serves increasingly stale snapshots; concurrent use corrupts the tracker outright. Connections aren't the issue — ADO.NET pools them under the hood. Scoped DI lifetime encodes all this by default."
    },
    {
      q: "foreach (var order in db.Orders.ToList()) Console.WriteLine(order.Customer.Name); runs 1 + N queries. Best fixes?",
      options: [
        ["Eager-load with Include(o => o.Customer), or better, project just the needed fields with Select — one query either way", true],
        ["Increase the connection pool size so the N queries run in parallel", false],
        ["Wrap the loop in a transaction to batch the queries", false],
        ["Call ToList() twice so the customers are cached", false]
      ],
      explain: "With lazy loading, each o.Customer access fires its own SELECT — invisible in code, brutal at 1000 rows. Include emits a JOIN up front; a projection (Select(o => new { o.Id, o.Customer.Name })) is usually better still: one query, only the needed columns, no change tracking. Watch EF's SQL logs — N+1 is unmissable once you look."
    },
    {
      q: "When should you add AsNoTracking() to an EF Core query?",
      options: [
        ["Read-only queries — skipping change-tracking setup saves time and memory when you'll never call SaveChanges on those entities", true],
        ["Every query — tracking is legacy behavior", false],
        ["Only queries returning more than 1000 rows", false],
        ["Write-heavy code, so SaveChanges runs faster", false]
      ],
      explain: "Tracking exists to detect your modifications at SaveChanges; a GET endpoint that shapes entities into a response never modifies, so tracking is pure overhead. AsNoTracking (or projections to DTOs, which are untracked automatically) is the standard read-path optimization. Keep tracking on the update path — load, mutate, SaveChanges depends on it."
    },
    {
      q: "What are EF Core migrations for?",
      options: [
        ["Versioned, code-generated schema changes that evolve the database in step with the model — reviewable in git and applied in order per environment", true],
        ["Moving data between two different database servers", false],
        ["Automatic query optimization based on production telemetry", false],
        ["Converting the database between SQL dialects", false]
      ],
      explain: "dotnet ef migrations add diffs your model against the last snapshot and scaffolds Up/Down code; the database records which migrations are applied. Schema history lives in source control next to the code that needs it. In production, prefer generating idempotent SQL scripts (or migration bundles) applied by CI/CD over Database.Migrate() racing at app startup."
    },
    {
      q: "The same setting exists in appsettings.json, appsettings.Production.json, and an environment variable. In Production, which value wins?",
      options: [
        ["The environment variable — providers added later override earlier ones: base json ← environment json ← env vars ← command line", true],
        ["appsettings.json — the base file is authoritative", false],
        ["appsettings.Production.json — environment files always win", false],
        ["Startup fails on the conflict", false]
      ],
      explain: "IConfiguration merges layers with last-writer-wins per key. The default host order is appsettings.json, appsettings.{Environment}.json, user secrets (dev), environment variables, command-line args. This lets one build run everywhere: defaults in the repo, per-environment overrides on the host — env vars being how containers and cloud platforms inject config (use __ as the section separator)."
    },
    {
      q: "Where do secrets like connection strings and API keys belong?",
      options: [
        ["Outside the repo: user-secrets for local dev, environment variables or a vault (Azure Key Vault, AWS Secrets Manager) in production — never committed to git", true],
        ["In appsettings.json — that is what it exists for", false],
        ["Encrypted inside the compiled assembly as constants", false],
        ["In a private git repository, which is safe because access is restricted", false]
      ],
      explain: "Anything committed lives in history forever, gets cloned to every laptop and CI runner, and leaks with the repo. dotnet user-secrets stores dev values outside the project tree while binding into IConfiguration exactly like appsettings — code never knows the difference. Production values come from the platform (env vars, mounted secrets, Key Vault provider), and rotation never requires a commit."
    },
    {
      q: "logger.LogInformation(\"Order {OrderId} failed for {UserId}\", id, userId) — why is this better than string interpolation ($\"...\")?",
      options: [
        ["It is structured logging: OrderId and UserId are captured as named fields, so sinks can index, filter, and query them — interpolation collapses everything into one opaque string", true],
        ["It avoids a compile error — ILogger rejects interpolated strings", false],
        ["Placeholders are encrypted in transit", false],
        ["No difference; both produce identical output", false]
      ],
      explain: "Message templates keep the data separate from the text: Seq/Application Insights/ELK store OrderId=1234 as a field, so 'all logs for this order' is a query, not a regex. Interpolation also pays string formatting even when the log level is off; templates defer it. The template string is the event's identity, letting sinks group occurrences of the same event."
    },
    {
      q: "In xUnit, when do you use [Theory] with [InlineData] instead of [Fact]?",
      options: [
        ["When the same test logic should run over multiple input/expected-output cases — each InlineData row becomes a separately reported test case", true],
        ["When the test needs async/await support", false],
        ["When the test must run first, before all Facts", false],
        ["Theory marks slow integration tests; Fact marks fast unit tests", false]
      ],
      explain: "A Fact is one case; a Theory is parameterized — [InlineData(2, 3, 5)] rows flow into the test's parameters and each row passes or fails independently, which beats copy-pasting near-identical facts. MemberData/ClassData supply richer cases. Also worth knowing: xUnit creates a fresh test-class instance per test, so the constructor is per-test setup and IDisposable is teardown."
    },
    {
      q: "Why does mocking OrderService's payment dependency require IPaymentGateway rather than a concrete StripeGateway with non-virtual methods?",
      options: [
        ["Moq builds its fake by implementing the interface (or overriding virtuals) in a dynamic proxy — non-virtual concrete members can't be intercepted", true],
        ["Moq can mock anything; interfaces are just a style preference", false],
        ["Concrete classes are sealed by default in .NET, blocking mocks", false],
        ["Interfaces run faster in test environments", false]
      ],
      explain: "Moq generates a runtime subclass/implementation — it can fill in interface members or override virtual ones, but a non-virtual method call can't be redirected. This is why 'depend on abstractions' and 'testable' are the same advice in .NET: an interface port makes Setup/Verify trivial (mock.Setup(g => g.ChargeAsync(...)).ReturnsAsync(...)) with no network in sight."
    },
    {
      q: "What does WebApplicationFactory<Program> give an integration test?",
      options: [
        ["The real app booted in memory — actual pipeline, routing, DI, and serialization — with an HttpClient, plus hooks to override services (e.g., swap the DB) for the test", true],
        ["A deployment of the app to a local IIS instance", false],
        ["A static mock of HttpContext for controller unit tests", false],
        ["A UI browser automation driver", false]
      ],
      explain: "It runs Program.cs against an in-memory test server: requests exercise middleware, auth, model binding, filters, and JSON exactly as production would — the classes-in-isolation gaps that unit tests miss. WithWebHostBuilder lets you replace registrations (Testcontainers DB, fake external APIs). A handful of these around your endpoints catch a disproportionate share of real bugs."
    },
    {
      q: "Why is 'new HttpClient()' per request a production bug, and what is the fix?",
      options: [
        ["Each instance's handler opens fresh connections and disposed sockets linger in TIME_WAIT — under load you exhaust sockets; use IHttpClientFactory (AddHttpClient), which pools and recycles handlers", true],
        ["HttpClient is obsolete; use WebClient", false],
        ["Each HttpClient spawns a dedicated thread", false],
        ["It's only a problem on Linux", false]
      ],
      explain: "HttpClient is a thin wrapper over a message handler that owns the connection pool. New-per-request throws the pool away each time (socket exhaustion); one static client forever never re-resolves DNS (stale endpoints after failover). The factory pools handlers and rotates them periodically — both problems solved, plus per-name configuration, Polly resilience policies, and typed clients."
    },
    {
      q: "In clean architecture, which project references nothing else in the solution, and what enforces the rule?",
      options: [
        ["The Domain project — entities and business rules with zero framework dependencies; project references only point inward, so the compiler itself polices the architecture", true],
        ["The Web project — it must stay isolated from business logic", false],
        ["Infrastructure — it is generated code that nothing should reference", false],
        ["All projects reference each other freely; discipline comes from code review", false]
      ],
      explain: "Domain sits at the center: no EF, no ASP.NET, no HTTP — pure rules that compile and test alone. Application defines the ports (interfaces) it needs; Infrastructure references Application to implement them; Web wires everything. Because 'dependencies point inward' is expressed as csproj references, violating it is a build error, not a review comment. Payoff: frameworks and databases become swappable details."
    },
    {
      q: "The application layer defines IOrderRepository and infrastructure implements it with EF Core. Why does the interface live in the inner layer?",
      options: [
        ["The inner layer owns the contract it needs (a 'port'); infrastructure adapts to it — putting the interface in infrastructure would invert the dependency direction and couple use cases to EF", true],
        ["Interfaces compile faster in smaller projects", false],
        ["EF Core requires interfaces in a separate assembly", false],
        ["Convention only — the location has no consequences", false]
      ],
      explain: "This is the dependency-inversion move at architecture scale: the use case declares what persistence it needs, in its own terms (GetPendingOrders, not SQL). Infrastructure references the inner project and supplies the adapter. Tests fake the port with an in-memory list. If the interface lived beside its EF implementation, Application would have to reference Infrastructure — arrows pointing outward, framework leaking in."
    },
    {
      q: "What distinguishes a framework-dependent publish from a self-contained one?",
      options: [
        ["Framework-dependent is small but requires the right .NET runtime on the host; self-contained bundles the runtime — bigger output that runs on a bare machine and pins its own .NET version", true],
        ["Self-contained builds run only in Docker containers", false],
        ["Framework-dependent apps cannot use NuGet packages", false],
        ["Self-contained is Windows-only", false]
      ],
      explain: "dotnet publish defaults to framework-dependent: portable, small, patched centrally by runtime updates on the host. Self-contained (-r linux-x64 --self-contained) ships everything — nothing to install, immune to host runtime drift, at ~70+ MB unless trimmed. Native AOT goes further: compiled to a single native binary, fastest cold start, with reflection restrictions. Containers blur the choice — the runtime ships in the base image either way."
    },
    {
      q: "What is CQRS, in its practical everyday form?",
      options: [
        ["Separating the write model (commands enforcing domain rules) from the read model (queries returning shaped DTOs, often bypassing the domain) — each side optimized for its job", true],
        ["A caching layer that queues writes for batch processing", false],
        ["Encrypting queries separately from commands", false],
        ["A SQL Server replication feature", false]
      ],
      explain: "Reads and writes want different things: writes need invariants and rich domain objects; reads want flat, fast projections of exactly what the screen shows. Everyday CQRS is just two paths — command handlers using the domain model, query handlers using projections or Dapper — often organized with MediatR. Full CQRS with separate stores and event sourcing is a serious escalation; adopt it for the specific aggregate that needs it, not by default."
    },
    {
      type: "multi",
      q: "Which statements about ASP.NET Core middleware ordering are true?",
      options: [
        ["The exception handler goes first so its try/catch wraps everything registered after it", true],
        ["UseAuthentication must run before UseAuthorization — identity before permissions", true],
        ["UseStaticFiles sits early so file hits short-circuit the expensive rest of the pipeline", true],
        ["Registration order is irrelevant — the framework sorts middleware by dependency", false],
        ["UseRouting should come after UseAuthorization so auth runs on every request", false]
      ],
      explain: "The pipeline runs in exact registration order, nested like an onion — nothing is sorted for you. Exception handling must be outermost to catch below; AuthN populates the user AuthZ evaluates; static files short-circuit cheaply. Routing must come BEFORE authorization, not after: authorization reads the matched endpoint's metadata ([Authorize] attributes) to know which policy to apply — with routing later, it has nothing to evaluate against."
    },
    {
      type: "multi",
      q: "Which of these DI usages are safe, given singleton/scoped/transient rules?",
      options: [
        ["Injecting a scoped DbContext into a scoped application service", true],
        ["A singleton that injects IServiceScopeFactory and creates a scope per operation", true],
        ["Injecting a transient validator into a scoped service", true],
        ["Injecting a scoped DbContext into a singleton's constructor", false],
        ["Caching per-request user data in a singleton's instance field", false]
      ],
      explain: "The rule: a service may depend on services with equal or longer lifetimes. Scoped-into-scoped and transient-into-scoped satisfy it; the scope-factory pattern is the sanctioned way for singletons to reach scoped services (fresh scope, then dispose). Scoped-into-singleton is the captive dependency — a 'per-request' DbContext silently shared across all requests and threads. Per-request state in a singleton field is the same disease without the container: cross-request data bleed."
    },
    {
      type: "order",
      q: "Your entity model changed. Arrange the EF Core migration workflow from code change to updated production schema.",
      steps: [
        "Modify the entity classes / DbContext model in C#",
        "Run 'dotnet ef migrations add' — EF diffs the model against the last snapshot and scaffolds Up/Down code",
        "Review (and if needed edit) the generated migration before committing it",
        "Generate an idempotent SQL script or apply the migration to the target database in CI/CD",
        "EF records the migration in the __EFMigrationsHistory table so it is never re-applied"
      ],
      explain: "Code changes first; the tooling derives the schema delta from the model diff, not from the database. The review step matters because scaffolding can't know intent — a rename may scaffold as drop-column + add-column, destroying data. Production application belongs to a script or pipeline rather than auto-migrate-on-boot, and the history table is what makes the whole scheme idempotent per environment."
    },
    {
      type: "order",
      q: "Trace an HTTP request through an ASP.NET Core API, from socket to response.",
      steps: [
        "Kestrel accepts the connection and builds the HttpContext",
        "The request descends the middleware pipeline (exception handler, static files, CORS…)",
        "UseRouting matches the URL to an endpoint and attaches its metadata",
        "Authentication builds the user principal, then authorization checks it against the endpoint's policy",
        "Model binding materializes parameters and the handler executes, producing a result",
        "The response travels back up the middleware chain and is written to the socket"
      ],
      explain: "The ordering encodes the framework's design: routing must precede auth because authorization needs the matched endpoint's [Authorize] metadata; binding and validation run just before your handler so it receives typed, checked inputs; and every middleware gets a second chance at the response on the way back out — where response headers, compression, and logging happen."
    },
    {
      level: "senior",
      q: "After SaveChanges succeeds, the service publishes OrderCreated to the message broker. Crashes and deploys keep producing orders with no event, or events for rolled-back orders. What is the underlying problem?",
      options: [
        ["The dual-write problem: a database and a broker cannot be updated atomically, so any crash between the two writes desynchronizes them — reordering the calls just flips which side lies; the fix is a transactional outbox (or CDC), not luck", true],
        ["The broker needs to be configured for exactly-once delivery", false],
        ["Publish the event first, then SaveChanges — events matter more than rows", false],
        ["Wrap both operations in a TransactionScope; brokers enlist in ambient transactions automatically", false]
      ],
      explain: "Two independent systems, two commits, no shared transaction: crash after commit #1 and before commit #2 and they disagree — in either order. Broker delivery guarantees are irrelevant; the message was never sent. Mainstream brokers do not enlist in TransactionScope, and distributed 2PC across DB + broker is the cure that's worse than the disease. Recognizing 'this is dual-write' from the symptom — rather than adding retries around it — is precisely the principal-level diagnostic."
    },
    {
      level: "senior",
      q: "Clients retry POST /payments on timeout; sometimes the original charge had actually succeeded, so customers get double-charged. What is the standard design fix?",
      options: [
        ["Idempotency keys: the client sends a unique key per logical operation, the server records the key with the outcome, and duplicate requests replay the stored response instead of re-executing the charge", true],
        ["Forbid clients from retrying POST requests", false],
        ["Reduce server latency so timeouts stop happening", false],
        ["Switch the endpoint to PUT, which is idempotent by definition", false]
      ],
      explain: "A timeout is ambiguous — the caller cannot know whether the operation ran. Retries are therefore mandatory for availability, which means the server must make them safe: key + stored result = at-most-once execution with at-least-once requests (this is how Stripe's API works). Banning retries trades correctness for silent failure; faster servers shrink the window without closing it; and PUT's idempotency is a semantic promise you'd still have to implement — the verb alone deduplicates nothing."
    },
    {
      level: "senior",
      q: "During rolling deploys, old and new app versions run against the same database for several minutes. What does renaming a column safely require?",
      options: [
        ["Expand/contract: add the new column, dual-write and backfill, ship code that reads the new column, and only drop the old column in a later release — every intermediate schema must work with both app versions simultaneously", true],
        ["Rename it in a single migration — EF Core scaffolds renames as non-breaking automatically", false],
        ["A maintenance window; zero-downtime schema change is not achievable", false],
        ["Create a database view with the old name so nothing else is needed", false]
      ],
      explain: "The rolling window means schema changes deploy against *two* code versions: a hard rename breaks the old version instantly (column not found). Expand/contract splits one breaking change into several backward-compatible ones, each independently deployable and reversible. This constraint also implies migrations must always run *before* the new code fully rolls out, and is why 'drop' steps live a release behind their 'add' counterparts. Views can help but are a partial workaround, not the discipline."
    },
    {
      type: "multi",
      level: "senior",
      q: "A downstream dependency has become flaky. Which practices genuinely improve your service's resilience?",
      options: [
        ["Timeouts on every outbound call, set below your own callers' deadlines", true],
        ["A circuit breaker that fails fast once error rates spike and periodically probes for recovery", true],
        ["Retries with exponential backoff and jitter, applied only to idempotent operations", true],
        ["Unlimited automatic retries so every request eventually succeeds", false],
        ["A two-phase-commit distributed transaction spanning your service and the dependency", false]
      ],
      explain: "The resilient trio work together: timeouts convert hangs into fast failures (and must nest inside the caller's budget or you time out after they've given up); breakers stop hammering a struggling dependency and give it room to recover; bounded, jittered retries absorb blips without synchronizing into a thundering herd. Unlimited retries are a self-inflicted DDoS that turns a partial outage into a total one. And 2PC couples your availability to theirs — the opposite of resilience; sagas/eventual consistency exist precisely to avoid it."
    },
    {
      type: "order",
      level: "senior",
      q: "Implement the transactional outbox pattern for reliable event publishing. Arrange the flow.",
      steps: [
        "Begin a database transaction in the request handler",
        "Save the business entity AND insert the event as a row in an outbox table within that same transaction",
        "Commit — the state change and the pending event are now atomic: both exist or neither does",
        "A background relay (e.g. a BackgroundService) polls the outbox and publishes undispatched rows to the broker",
        "Mark rows as dispatched; because delivery is now at-least-once, consumers deduplicate or stay idempotent"
      ],
      explain: "The trick is reducing two resources to one: the event is first written to the same database as the data, where a single local transaction guarantees atomicity. The relay then moves events to the broker asynchronously — a crash mid-publish means a retry, never a loss, shifting the guarantee to at-least-once (hence idempotent consumers, e.g. keyed by event id). This is the standard production answer to the dual-write problem, with CDC (e.g. Debezium) as the log-tailing variant."
    },
    {
      mono: true,
      code: "var app = builder.Build();\napp.UseExceptionHandler(\"/error\");\napp.UseStaticFiles();\napp.UseRouting();\n// ??? — controllers use [Authorize] attributes\napp.MapControllers();\napp.Run();",
      q: "What belongs in the gap?",
      options: [
        ["app.UseAuthentication();\napp.UseAuthorization();", true],
        ["app.UseAuthorization();\napp.UseAuthentication();", false],
        ["app.UseAuthorization();   // authentication is implied by authorization", false],
        ["Nothing — [Authorize] attributes work without any auth middleware", false]
      ],
      explain: "Both middlewares, in that order, after routing: authentication reads the token/cookie and builds HttpContext.User; authorization then evaluates the matched endpoint's [Authorize] policy against that principal (which is why it must follow UseRouting — the endpoint metadata comes from the route match). Reversed, authorization always sees an anonymous user: valid tokens get 401s. And without the middleware entirely, the attributes are inert metadata — nothing ever evaluates them."
    },
    {
      mono: true,
      code: "app.MapGet(\"/products\", async (ShopDbContext db) =>\n    // ??? — read-only listing; must not fetch whole entities,\n    //        track them, or pull the table into memory\n);",
      q: "Which query fits all three constraints?",
      options: [
        ["await db.Products\n    .Where(p => p.Active)\n    .Select(p => new ProductDto(p.Id, p.Name, p.Price))\n    .ToListAsync()", true],
        ["db.Products.ToList()\n    .Where(p => p.Active)\n    .Select(p => new ProductDto(p.Id, p.Name, p.Price))", false],
        ["await db.Products.ToListAsync()\n    .ContinueWith(t => t.Result.Where(p => p.Active))", false],
        ["db.Products.AsEnumerable()\n    .Where(p => p.Active)\n    .Select(p => new ProductDto(p.Id, p.Name, p.Price))\n    .ToList()", false]
      ],
      explain: "Keeping Where and Select on the IQueryable means EF translates both to SQL: the database filters, only three columns cross the wire, and projecting to a DTO skips change tracking automatically (no AsNoTracking needed). Every other option pulls the ENTIRE table into memory first — ToList() before the Where, or AsEnumerable() silently switching to client-side LINQ — plus option 2 blocks synchronously and option 3 revives the pre-async ContinueWith style with .Result inside."
    },
    {
      mono: true,
      level: "senior",
      code: "public class QueueWorker(IServiceScopeFactory scopeFactory, IWorkQueue queue)\n    : BackgroundService\n{\n    protected override async Task ExecuteAsync(CancellationToken stoppingToken)\n    {\n        while (!stoppingToken.IsCancellationRequested)\n        {\n            var item = await queue.DequeueAsync(stoppingToken);\n            // ??? — process the item using AppDbContext (registered scoped)\n        }\n    }\n}",
      q: "Which processing block is correct?",
      options: [
        ["using var scope = scopeFactory.CreateScope();\nvar db = scope.ServiceProvider.GetRequiredService<AppDbContext>();\nawait ProcessAsync(item, db, stoppingToken);", true],
        ["// inject AppDbContext via the constructor instead of the factory\nawait ProcessAsync(item, _db, stoppingToken);", false],
        ["var db = new AppDbContext();\nawait ProcessAsync(item, db, stoppingToken);", false],
        ["_dbCache ??= scopeFactory.CreateScope()\n    .ServiceProvider.GetRequiredService<AppDbContext>();\nawait ProcessAsync(item, _dbCache, stoppingToken);", false]
      ],
      explain: "A scope per work item: fresh DbContext, processed, disposed — tracked entities released every iteration and no state bleeding between items. Constructor injection can't work: BackgroundService is a singleton, so a scoped DbContext would be captive (and the container's scope validation throws at startup). new AppDbContext() bypasses DI configuration (connection string, interceptors, logging). Caching the context in a field is the captive dependency rebuilt by hand — plus the scope is never disposed, so it leaks everything it ever touched."
    },
    {
      mono: true,
      code: "// GitHubService is resolved per request and calls the GitHub API under high load\n// Program.cs:\nbuilder.Services.AddHttpClient<GitHubService>(c =>\n    c.BaseAddress = new Uri(\"https://api.github.com/\"));\n\npublic class GitHubService\n{\n    // ???\n\n    public async Task<string> GetRepoAsync(string name) =>\n        await _http.GetStringAsync($\"repos/{name}\");\n}",
      q: "Which client declaration completes the typed-client pattern?",
      options: [
        ["private readonly HttpClient _http;\npublic GitHubService(HttpClient http) => _http = http;", true],
        ["private readonly HttpClient _http = new HttpClient\n{\n    BaseAddress = new Uri(\"https://api.github.com/\")\n};", false],
        ["private HttpClient _http => new HttpClient\n{\n    BaseAddress = new Uri(\"https://api.github.com/\")\n};", false],
        ["private static readonly HttpClient _http = new HttpClient();", false]
      ],
      explain: "AddHttpClient<GitHubService> registers the service so the factory injects a pre-configured HttpClient whose message handlers are pooled and rotated — accept it in the constructor and the socket-exhaustion and stale-DNS problems are both handled. Field-initializing a new client per service instance recreates exhaustion under load (the service is per-request); the expression-bodied property is worse — a new client per HTTP CALL. The static client fixes exhaustion but never re-resolves DNS, ignores the registered BaseAddress, and can't participate in Polly policies attached to the factory registration."
    }
  ]
};

// Coding interview drills: problems repeatedly reported from real C#/.NET
// interviews. Format: { title, prompt, example?, solution, notes, level? }
const drillData = [
  {
    title: "Reverse a string (no Array.Reverse / LINQ Reverse)",
    prompt: "Write a method that reverses a string. Interviewers usually forbid the built-in helpers to see whether you can move indices yourself.",
    example: "Reverse(\"hello\")  →  \"olleh\"",
    solution: "static string Reverse(string s)\n{\n    var chars = s.ToCharArray();\n    for (int i = 0, j = chars.Length - 1; i < j; i++, j--)\n        (chars[i], chars[j]) = (chars[j], chars[i]);   // tuple swap, no temp\n    return new string(chars);\n}\n\n// if built-ins ARE allowed, say the tradeoff out loud:\n// new string(s.Reverse().ToArray());   // shorter, allocates more",
    notes: "Strings are immutable, so you must copy to a char array first — saying that is half the answer. The two-pointer swap is O(n) time, one allocation. Senior follow-up: this reverses UTF-16 code units, so emoji/surrogate pairs and combining accents break; a fully correct reverse walks grapheme clusters with StringInfo.GetTextElementEnumerator."
  },
  {
    title: "Palindrome check, ignoring case and punctuation",
    prompt: "Return true if a string reads the same forwards and backwards, considering only letters and digits and ignoring case.",
    example: "IsPalindrome(\"A man, a plan, a canal: Panama\")  →  true",
    solution: "static bool IsPalindrome(string s)\n{\n    int i = 0, j = s.Length - 1;\n    while (i < j)\n    {\n        while (i < j && !char.IsLetterOrDigit(s[i])) i++;\n        while (i < j && !char.IsLetterOrDigit(s[j])) j--;\n        if (char.ToLowerInvariant(s[i]) != char.ToLowerInvariant(s[j]))\n            return false;\n        i++; j--;\n    }\n    return true;\n}",
    notes: "Two pointers walking inward: O(n) time, zero allocations — better than the tempting 'normalize the string, then compare with its reverse', which allocates three strings. The inner skip-loops handle the punctuation without a regex. Mention ToLowerInvariant vs ToLower: culture-sensitive casing (the Turkish-İ problem) is a real bug class."
  },
  {
    title: "FizzBuzz — the filter question",
    prompt: "Print 1 to 100; multiples of 3 print \"Fizz\", multiples of 5 print \"Buzz\", multiples of both print \"FizzBuzz\". Trivial on purpose — it filters out candidates who cannot write any code, and the follow-ups test style.",
    solution: "for (int i = 1; i <= 100; i++)\n{\n    string output = (i % 3, i % 5) switch\n    {\n        (0, 0) => \"FizzBuzz\",\n        (0, _) => \"Fizz\",\n        (_, 0) => \"Buzz\",\n        _      => i.ToString()\n    };\n    Console.WriteLine(output);\n}",
    notes: "The classic bug is testing i % 3 before i % 15 in an if/else chain, so \"FizzBuzz\" never prints — whatever construct you use, the both-case must win. The tuple-pattern switch expression reads like the spec and quietly shows you write modern C#. Follow-up they like: make the rules data-driven (a list of (divisor, word) pairs) so adding 7 → \"Bazz\" is a one-line change."
  },
  {
    title: "Find the duplicates in a collection",
    prompt: "Given an array of values, return the ones that appear more than once. Asked constantly, usually as 'and now without LINQ' after you give the LINQ answer.",
    example: "FindDupes([3, 7, 3, 1, 7, 3])  →  [3, 7]",
    solution: "// LINQ — the expressive answer:\nvar dupes = numbers.GroupBy(n => n)\n                   .Where(g => g.Count() > 1)\n                   .Select(g => g.Key)\n                   .ToList();\n\n// HashSet — the O(n) single-pass answer:\nvar seen  = new HashSet<int>();\nvar dupes2 = new HashSet<int>();\nforeach (var n in numbers)\n    if (!seen.Add(n))     // Add returns false if already present\n        dupes2.Add(n);",
    notes: "Give both and say when each wins: GroupBy is clearest and fine for normal sizes; the HashSet pass is O(n) with no grouping overhead and streams. The seen.Add(n) == false trick — test-and-insert in one call — is the idiomatic move interviewers watch for. Dictionary<T,int> is the variant when they also want the counts."
  },
  {
    title: "Are two strings anagrams?",
    prompt: "Return true if two strings contain exactly the same characters in a different order.",
    example: "IsAnagram(\"listen\", \"silent\")  →  true",
    solution: "// O(n log n) one-liner — lead with this:\nstatic bool IsAnagram(string a, string b) =>\n    a.Length == b.Length &&\n    a.ToLowerInvariant().OrderBy(c => c)\n     .SequenceEqual(b.ToLowerInvariant().OrderBy(c => c));\n\n// O(n) counting version — the follow-up:\nstatic bool IsAnagramFast(string a, string b)\n{\n    if (a.Length != b.Length) return false;\n    var counts = new Dictionary<char, int>();\n    foreach (var c in a.ToLowerInvariant())\n        counts[c] = counts.GetValueOrDefault(c) + 1;\n    foreach (var c in b.ToLowerInvariant())\n    {\n        if (counts.GetValueOrDefault(c) == 0) return false;\n        counts[c]--;\n    }\n    return true;\n}",
    notes: "The sort-and-compare version is the readable answer; the counting version is the 'can you do better than O(n log n)?' answer — one dictionary, increment on the first string, decrement on the second, fail on any underflow. The early length check short-circuits most negatives for free."
  },
  {
    title: "First non-repeated character",
    prompt: "Find the first character in a string that appears exactly once.",
    example: "FirstNonRepeated(\"swiss\")  →  'w'",
    solution: "static char? FirstNonRepeated(string s)\n{\n    var counts = new Dictionary<char, int>();\n    foreach (var c in s)\n        counts[c] = counts.GetValueOrDefault(c) + 1;\n\n    foreach (var c in s)          // second pass preserves original order\n        if (counts[c] == 1) return c;\n\n    return null;\n}",
    notes: "Two passes, O(n): count everything, then re-walk the ORIGINAL string so order is preserved — the subtle mistake is iterating the dictionary, whose order is an implementation detail you must not rely on. char? handles the no-answer case honestly. The one-pass LINQ (s.GroupBy(c => c).First(g => g.Count() == 1).Key) reads well but throws when nothing qualifies — say so."
  },
  {
    title: "Word frequency — top N words in a sentence",
    prompt: "Count how often each word occurs and return the top 3, most frequent first. The bread-and-butter LINQ interview exercise.",
    example: "\"the quick brown fox jumps over the lazy dog the fox\"\n→  the: 3,  fox: 2,  brown: 1  (ties broken alphabetically)",
    solution: "var top3 = text.Split(' ', StringSplitOptions.RemoveEmptyEntries)\n               .GroupBy(w => w.ToLowerInvariant())\n               .Select(g => new { Word = g.Key, Count = g.Count() })\n               .OrderByDescending(x => x.Count)\n               .ThenBy(x => x.Word)          // deterministic ties\n               .Take(3)\n               .ToList();",
    notes: "GroupBy → project → order → Take is the LINQ pipeline shape they want to see composed fluently. Points scored for: normalizing case inside the GroupBy key, RemoveEmptyEntries against double spaces, and a ThenBy tie-breaker (without it, ordering among equal counts is nondeterministic). Without LINQ: the same Dictionary<string,int> counting loop as the anagram drill."
  },
  {
    title: "Fibonacci — and the O(2ⁿ) trap",
    prompt: "Return the n-th Fibonacci number. The real test: do you know why the naive recursive version is unusable, and how to fix it?",
    example: "Fib(10)  →  55",
    solution: "// iterative: O(n) time, O(1) space — the answer to give\nstatic long Fib(int n)\n{\n    if (n < 2) return n;\n    long prev = 0, curr = 1;\n    for (int i = 2; i <= n; i++)\n        (prev, curr) = (curr, prev + curr);\n    return curr;\n}\n\n// the trap, for contrast:\n// static long FibNaive(int n) =>\n//     n < 2 ? n : FibNaive(n - 1) + FibNaive(n - 2);   // O(2^n)!",
    notes: "The naive recursion recomputes the same subproblems exponentially — Fib(50) is billions of calls; be ready to say that with a straight face. Memoization (a Dictionary cache around the recursion) fixes it at O(n) and demonstrates dynamic programming vocabulary; the iterative two-variable version is simply better here. Bonus point: Fib(93) overflows long — mention checked arithmetic or BigInteger."
  },
  {
    title: "Second largest value — one pass, no sorting",
    prompt: "Find the second largest number in an unsorted array. 'Without sorting' is usually stated up front; duplicates must not count twice.",
    example: "SecondLargest([5, 1, 9, 9, 4])  →  5",
    solution: "static int? SecondLargest(int[] nums)\n{\n    int? max = null, second = null;\n    foreach (var n in nums)\n    {\n        if (max == null || n > max)      { second = max; max = n; }\n        else if (n < max &&\n                 (second == null || n > second)) second = n;\n    }\n    return second;   // null when no distinct second exists\n}",
    notes: "Two rolling variables, one O(n) pass — sorting is O(n log n) and the Distinct().OrderByDescending().Skip(1) LINQ answer hides that cost, which is exactly what the interviewer wants you to notice. Edge cases carry the points: duplicates of the maximum (the n < max guard), arrays of one element, all-equal arrays — returning int? makes 'there is no answer' explicit instead of a magic value."
  },
  {
    title: "Chunk / batch a sequence into groups of N",
    prompt: "Write an extension method that splits any IEnumerable<T> into batches of size N — the lazy, streaming way (think: paging database writes).",
    example: "[1,2,3,4,5,6,7].Chunk(3)  →  [1,2,3], [4,5,6], [7]",
    solution: "static IEnumerable<List<T>> Chunk<T>(this IEnumerable<T> source, int size)\n{\n    var batch = new List<T>(size);\n    foreach (var item in source)\n    {\n        batch.Add(item);\n        if (batch.Count == size)\n        {\n            yield return batch;\n            batch = new List<T>(size);   // NEW list — never reuse the yielded one\n        }\n    }\n    if (batch.Count > 0)\n        yield return batch;              // the final partial batch\n}",
    notes: "Tests three things at once: extension-method syntax, yield return (lazy — works on infinite sequences and never materializes the whole source), and the aliasing bug — reusing and Clear()-ing one list corrupts batches a caller has already received. Don't forget the trailing partial batch. Then earn the closing point: .NET 6+ ships this as Enumerable.Chunk, so in production you'd use the built-in."
  },
  {
    title: "Thread-safe lazy singleton",
    prompt: "Implement a singleton that is created lazily and is safe under concurrent first access. A classic that doubles as a concurrency screen.",
    solution: "public sealed class AppConfig\n{\n    private static readonly Lazy<AppConfig> _instance =\n        new(() => new AppConfig());\n\n    public static AppConfig Instance => _instance.Value;\n\n    private AppConfig() { }   // private ctor: nobody else can construct\n}",
    notes: "Lazy<T> is the modern answer: the runtime guarantees the factory runs exactly once, and you skip the double-checked-locking minefield (volatile, memory barriers, partially-published objects) — be able to EXPLAIN that minefield, then decline to walk into it. sealed + private ctor close the loopholes. And the senior kicker: in a DI application the container owns lifetimes, so services.AddSingleton<AppConfig>() replaces the pattern entirely; hand-rolled singletons also hurt testability (global state)."
  },
  {
    level: "senior",
    title: "This code sometimes hangs — find and fix the deadlock",
    prompt: "Two threads, two locks. In production it freezes once a week. Explain why, then fix it.",
    example: "object lockA = new(), lockB = new();\n\n// thread 1:                       // thread 2:\nlock (lockA)                       lock (lockB)\n{                                  {\n    Thread.Sleep(50);                  Thread.Sleep(50);\n    lock (lockB) { /* work */ }        lock (lockA) { /* work */ }\n}                                  }",
    solution: "// Thread 1 holds A and waits for B; thread 2 holds B and waits for A —\n// a circular wait. Neither can ever proceed.\n\n// FIX: one global lock ORDER. Every thread acquires A before B, always:\n// thread 2 becomes:\nlock (lockA)\n{\n    lock (lockB) { /* work */ }\n}\n\n// alternatives, in preference order:\n// 1. hold ONE lock instead of two (coarsen or redesign the critical section)\n// 2. Monitor.TryEnter(lockB, timeout) — back off, release A, retry\n// 3. in async code the same bug wears a different mask:\n//    task.Result / .Wait() under a SynchronizationContext — fix is\n//    async all the way down, never block on a Task",
    notes: "Name the theory briefly — deadlock needs a circular wait among lock holders, and a consistent acquisition order makes cycles impossible — then show the one-line fix. The intermittent, once-a-week nature is itself a signature: it only bites when the schedules interleave just wrong. Production debugging follow-up: capture a dump and look at the blocked threads' stacks (dotnet-dump analyze, clrstack) — both threads visibly parked on Monitor.Enter tells the whole story."
  },
  {
    level: "senior",
    title: "Download many URLs concurrently — without failing the whole batch",
    prompt: "Fetch 100 URLs concurrently; one flaky URL must not sink the other 99. Return the successes. Tests whether your async is real or ceremonial.",
    solution: "static async Task<Dictionary<string, string>> FetchAllAsync(\n    IEnumerable<string> urls, HttpClient http, int maxParallel = 8)\n{\n    using var gate = new SemaphoreSlim(maxParallel);   // cap concurrency\n\n    var tasks = urls.Select(async url =>\n    {\n        await gate.WaitAsync();\n        try   { return (url, body: await http.GetStringAsync(url)); }\n        catch (HttpRequestException) { return (url, body: (string?)null); }\n        finally { gate.Release(); }\n    }).ToList();          // ToList NOW — this is what starts the work\n\n    var results = await Task.WhenAll(tasks);\n    return results.Where(r => r.body != null)\n                  .ToDictionary(r => r.url, r => r.body!);\n}",
    notes: "Three separately-graded ideas: (1) start-then-await — the ToList materializes the Select so all tasks begin before any await; (2) the try/catch lives INSIDE each task, because Task.WhenAll surfaces only one exception and would discard the 99 good results; (3) the SemaphoreSlim throttle — unbounded fan-out to one host is a self-inflicted denial of service. Senior variants to know: Parallel.ForEachAsync (.NET 6+) does the throttling for you; IAsyncEnumerable streams results as they land."
  },
  {
    title: "LINQ: top 2 earners per department",
    prompt: "Given employees { Name, Department, Salary }, return the two highest-paid people in each department. The standard 'do you actually know LINQ beyond Where' exercise.",
    solution: "var top2PerDept = employees\n    .GroupBy(e => e.Department)\n    .SelectMany(g => g.OrderByDescending(e => e.Salary)\n                      .ThenBy(e => e.Name)      // deterministic ties\n                      .Take(2))\n    .ToList();",
    notes: "GroupBy makes the buckets; the trick being tested is SelectMany — order-and-take INSIDE each group, then flatten the per-group results back into one list. (Select would give you a list of lists.) Say the EF Core caveat out loud for senior credit: this shape only translates to SQL on newer providers; on older ones you'd see client evaluation or an error, and the server-side rewrite uses a windowed subquery. Follow-ups to expect: highest per group (MaxBy in .NET 6+), average salary per department, departments with fewer than 2 people (Take(2) just returns what exists — no crash)."
  }
];
