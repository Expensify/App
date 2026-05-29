## Update — Custom Nitro JSON parser benchmark (Glaze)

Following the previous benchmark where `react-native-fast-json` came back ~4x slower due to its Promise-based API, we built a **synchronous Nitro hybrid wrapper around Glaze** to eliminate the orchestration overhead and measure the parser fairly. Implementation lives in `@expensify/nitro-utils` (`HybridJsonParser`) and exposes a `parse(string)` returning a raw `jsi::Value` (no AnyMap marshalling layer).

### Setup

- Same instrumentation pattern as the earlier benchmark (patched `SQLiteProvider.getAll`, times the JSON.parse loop only — not the SQL query — and exposes a `__benchmarkOnyxNativeParse` hook fired once on the initial hydration, on the same `rawRows` Hermes just parsed).
- Heavy account, Android standalone dev build, 4 cold-start runs.

### Results

| Run | Hermes `JSON.parse` | Nitro / Glaze | Ratio |
| --- | ------------------- | ------------- | ----- |
| 1   | 419.8 ms            | 624.5 ms      | 0.67× |
| 2   | 638.7 ms            | 745.9 ms      | 0.86× |
| 3   | 351.9 ms            | 542.1 ms      | 0.65× |
| 4   | 329.9 ms            | 598.2 ms      | 0.55× |
| **avg** | **~435 ms**     | **~628 ms**   | **~0.69×** |

**The Glaze-backed Nitro parser is 30–45% *slower* than Hermes end-to-end** on a heavy account (~9.8k rows, `personalDetailsList` still the dominant single row at ~6 MB).

### Why — the parser was never the bottleneck

Glaze's published "1200 MB/s" is the speed to turn JSON text into **C++ data structures in C++ memory**. That's not what's being measured here. The measurement is the full path **JSON string → JS objects in Hermes heap**, and the second leg of that path is where almost all the cost lives.

Concretely, for every Onyx row we end up doing:

1. `jsi::String → std::string` — UTF-16 → UTF-8 copy
2. `std::string → glz::json_t` — *fast*, this is the part Glaze is good at
3. Recursive walk constructing `jsi::Object` / `jsi::Array` / `jsi::String` / `jsi::PropNameID` and crossing the JSI boundary for every property assignment

For ~9.8k rows × ~100 properties on average, step 3 alone is roughly **a million `setProperty` calls** through JSI. Each one has hundreds of nanoseconds of fixed overhead. That's the bulk of the 600 ms we measured.

Hermes' built-in `JSON.parse` doesn't pay any of that cost — it's privileged C++ inside the engine that writes JSObjects directly into the Hermes heap with internal APIs we don't get access to from outside, with hidden-class reuse and property-name interning that we can't replicate from the JSI side.

### Takeaway

The "parser layer" is not the right place to attack this. Swapping a faster C++ JSON parser doesn't help because the cost isn't in parsing — it's in **moving the resulting data across the JS↔native boundary** and **rebuilding JS-engine-native objects from outside the engine**. Any external parser, regardless of how fast its raw throughput is, has to pay the same JSI transportation cost we paid here.

The realistic levers that would actually move the needle look more like:

- **Shrink the data on the read path** — the 6 MB `personalDetailsList` blob alone accounts for ~20-30% of total parse time. Splitting it into smaller per-user records likely saves more wall-time than any parser swap could, with zero new C++ to maintain.
- **Defer materialization** — lazy views where C++ holds the parsed tree and only materializes the fields JS actually reads. Architectural lift, but it's the only category of change where the JSI tax goes away.
- **Skip JSON on the read path entirely** — store/restore a binary representation that's cheaper to materialize than JSON text. Requires a write-path migration.

Based on this, I'd recommend **closing the perf thread for parser swap** and pivoting to the data-shape side. Happy to write up the data-shape investigation as a follow-up if that's the direction we want to go.

The full branch lives at `perf-glaze-parse-benchmark` (draft PR for posterity / future reference; not for merge — the patch instrumentation has runtime overhead in production and the Glaze headers are vendored in-tree).
