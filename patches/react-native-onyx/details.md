# `react-native-onyx` patches

### [react-native-onyx+3.0.110+001+readonly-types.patch](react-native-onyx+3.0.110+001+readonly-types.patch)

- Reason:

    ```
    Proof of concept, not for merge. Makes the Onyx cache immutable at the type level, in the two places that
    matter:

    1. `Onyx.get()` returns `Promise<ReadonlyDeep<OnyxValue<TKey>>>`, so the object it hands back (which IS the
       cached object, not a copy) cannot be mutated without the compiler objecting. This turns "the result of
       Onyx.get() MUST NOT be mutated" from a convention reviewers have to remember into a rule tsc enforces.
    2. Every write input (`OnyxInput`, which funnels into set/merge/multiSet/mergeCollection/setCollection/update)
       is typed `ReadonlyDeep`, so a value read out of the cache can be passed straight back to a writer without a
       copy. Without this half, every write path that echoes a read value needs a hand-rolled deep copy.

    Both are widenings on the input side: nothing that passes a value in can break, and Onyx does not mutate write
    inputs at runtime. See https://github.com/Expensify/App/issues/71206 for the measurements.
    ```

- Upstream PR/issue: https://github.com/Expensify/App/issues/71206
- E/App issue: https://github.com/Expensify/App/issues/71206
- PR introducing patch: experiment branch, no PR
