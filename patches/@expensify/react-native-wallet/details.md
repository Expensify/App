# `@expensify/react-native-wallet` patches

### [@expensify+react-native-wallet+0.1.41+001+list-apple-wallet-passes.patch](@expensify+react-native-wallet+0.1.41+001+list-apple-wallet-passes.patch)

- Reason: the app needs to list the Apple Wallet passes it can see (local and remote, with last digits, primary account identifier and activation state) to find a card's pass when the lookup by `panReferenceID` returns `not found`. `listAppleWalletPasses` only exists in 0.3.2, and moving to 0.2.0 or newer pulls in UAPP, which the app cannot take yet. The patch backports only `listAppleWalletPasses` (Swift, Objective-C++ bridge, Android no-op, `src/` and the built `lib/` output).
- Upstream PR/issue: https://github.com/Expensify/react-native-wallet/commit/229f4c6899fe39cadd4bc05fc6ce7901d068a431 (already released in 0.3.2). Drop this patch when the app moves to 0.3.x with UAPP.
- E/App issue: TBD
- PR introducing patch: https://github.com/Expensify/App/pull/107432
