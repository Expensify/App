# `react-native-onyx` patches

### [react-native-onyx+3.0.110+001+readonly-write-inputs.patch](react-native-onyx+3.0.110+001+readonly-write-inputs.patch)

- Reason:

    ```
    Experiment only, not for merge. Types every Onyx write input as `ReadonlyDeep`, so a value read out of the
    cache can be passed straight to `set`/`merge`/`multiSet`/`mergeCollection`/`setCollection`/`update` without a
    copy. This is the library half of https://github.com/Expensify/App/issues/71206 and is here so CI can measure
    the cost across the repo. It is a widening: nothing that passes a value in can break, and Onyx does not mutate
    write inputs at runtime.
    ```

- Upstream PR/issue: https://github.com/Expensify/App/issues/71206
- E/App issue: https://github.com/Expensify/App/issues/71206
- PR introducing patch: experiment branch, no PR
