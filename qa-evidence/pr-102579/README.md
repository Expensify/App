# PR 102579 local manual QA evidence

Tested PR head `8a0551dbd53881ee81b3ae02121bdd94510ec727` against the refreshed Expensidev backend on 2026-11-07. These screenshots are from synthetic local accounts and workspaces. Browser traces and raw console logs remain local because they can contain session data.

## Desktop Chromium, 1280 × 720

- [Open non-reimbursable-only report before the picker check](desktop-chromium/open-nonreimb.png): report stayed Draft after its workspace switched from manual submission to instant submission with Submit & Close.
- [Same Open report absent from picker search](desktop-chromium/open-excluded.png): workspace admin check. This is the live regression fixture; a newly created non-reimbursable expense would close its report immediately and would not exercise the changed filter.
- [Mixed report remains in search](desktop-chromium/search-mixed.png) and [move persisted](desktop-chromium/mixed-after-move.png).
- [Reopened non-reimbursable report listed](desktop-chromium/reopened-picker.png) and [move into it succeeded](desktop-chromium/reopened-move.png).
- [Manual-submit non-reimbursable report listed](desktop-chromium/manual-policy-picker.png) and [move into it succeeded](desktop-chromium/manual-policy-move.png).
- [Offline cached picker](desktop-chromium/offline-picker.png) and [same picker after reconnect](desktop-chromium/online-picker.png).
- [Open non-reimbursable Draft excluded while offline](desktop-chromium/offline-open-excluded.png), [mixed destination listed while offline](desktop-chromium/offline-mixed-listed.png), and [the Open Draft still excluded after reconnect](desktop-chromium/reconnected-open-excluded.png). These use the live Open regression fixture, after its transaction had fully loaded online.

## Partial local transaction cache

- [Before destination transaction loads](partial-cache/before-load.png): an isolated browser cache held the Open report summary but not its transaction; backend responses were delayed, and the picker kept the report available. No move was attempted.
- [After destination transaction loads](partial-cache/after-load.png): the same browser then fetched the transaction, and the picker excluded the report.

## Other browser profiles

- [Pixel 7 touch Chromium profile: report excluded](android-mweb-chromium/open-excluded.png), [mixed report listed](android-mweb-chromium/mixed-listed.png), [move displayed after reload](android-mweb-chromium/mixed-after-move.png). A separate fresh-cache authenticated `OpenReport` confirmed the backend returned the moved transaction in the mixed report.
- [Desktop WebKit: report excluded](desktop-webkit/open-excluded.png).
- [iPhone 15 touch WebKit profile: report excluded](ios-mweb-webkit/open-excluded.png), [eligible report listed](ios-mweb-webkit/eligible-listed.png). The move into the eligible report returned HTTP 200 / `jsonCode` 200 and was independently confirmed from a fresh cache.
- [Normal workspace member's Open report](normal-member/open-nonreimb.png) and [picker excluding it](normal-member/open-excluded.png).

The Pixel and iPhone profiles emulate viewport, touch input, and the respective browser engines on macOS; they are not tests on Android or iOS hardware. Native builds are tracked separately in the PR QA notes.
