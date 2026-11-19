# `react-native-share` patches

### [react-native-share+11.0.2+001+add-dismiss.patch](react-native-share+11.0.2+001+add-dismiss.patch)

- Reason:

    ```
    Adds `Share.dismiss()`, which closes the share sheet opened by `Share.open` and resolves once it is fully gone.
    iOS keeps a weak reference to the presented `UIActivityViewController` and dismisses it, then settles the pending `open` promise as cancelled (UIKit doesn't call the completion handler for a programmatic dismiss).
    If the sheet is still animating in, the dismissal waits for the presentation to finish, because UIKit reports no presenting view controller until then. A second `open` while a sheet is already presented resolves as cancelled, since UIKit can't stack two sheets and `dismiss` tracks only one.
    Android has no equivalent sheet to close, so it resolves immediately.
    This lets the app open the report action context menu while a share sheet is on screen: an RN `Modal` can't be presented while another view controller is already presented
    on the same presenter, so the sheet has to be closed first.
    ```

- Upstream PR/issue: 🛑 No upstream PR or issue yet. `Share.dismiss()` is a new API that `react-native-share` doesn't have, and we haven't decided yet whether to propose it upstream.
- E/App issue: 🛑 TODO (patch tracking issue from `NewPatchTemplate` not created yet). Feature issue this patch supports: https://github.com/Expensify/App/issues/99120
- PR introducing patch: https://github.com/Expensify/App/pull/103481
