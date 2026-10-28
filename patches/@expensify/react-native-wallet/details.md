# `@expensify/react-native-wallet` patches

### [@expensify+react-native-wallet+0.1.41+001+apple-wallet-bruno-prs.patch](@expensify+react-native-wallet+0.1.41+001+apple-wallet-bruno-prs.patch)

- Reason: Test only, do not merge. Combines the open Apple Wallet changes from react-native-wallet PRs 91, 96, 132, 133 and 134, backported onto 0.1.41, so they can be tested on an ad-hoc build before they are merged in the library:
  - optional `primaryAccountIdentifier` for Apple Wallet and `canAddCardToAppleWallet`
  - list Apple Wallet passes and activate them in-app
  - close the Apple Wallet sheet when the issuer call fails
  - report how an Apple Wallet add finished
  - open an installed Apple Wallet pass from the app
- Upstream PR/issue: react-native-wallet PRs 91, 96, 132, 133, 134
- E/App issue: none
- PR introducing patch: this draft PR (test only)
