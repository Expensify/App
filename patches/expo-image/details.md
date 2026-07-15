# `expo-image` patches

### [expo-image+56.0.9+001+fix-missing-activity-hybridapp-reload.patch](expo-image+56.0.9+001+fix-missing-activity-hybridapp-reload.patch)

- Reason: On Android, `ExpoImageViewWrapper`'s constructor reads `appContext.throwingActivity`, which throws
  `Exceptions.MissingActivity()` when expo's `AppContext.currentActivity` is `null`. In HybridApp the NewDot views are
  hosted by OldDot's `org.me.mobiexpensifyg.ExpensifyActivityBase` (not a standard `ReactActivity`), so during a JS
  reload the ReactContext re-initializes and `currentActivity` is transiently `null`. Every `expo-image` view created
  in that window failed to construct ("Couldn't create view of type class expo.modules.image.ExpoImageViewWrapper")
  and rendered blank until a cold app restart. Cold start and iOS were unaffected; RN's own `<Image>` was unaffected
  (it doesn't require the Activity). The patch makes `activity` nullable (`appContext.currentActivity`) and falls back
  to the view's `Context` for both the child `ExpoImageView`s and the Glide `RequestManager`
  (`Glide.with(Context)`), so the view still builds when the Activity is momentarily unavailable. When an Activity is
  present, behavior is unchanged (`Glide.with(activity)`, lifecycle-aware).
- Upstream PR/issue: 🛑 (still present on `expo` `main` / `sdk-57`, verified 2026-07-15 — same `throwingActivity`
  call in the constructor; worth reporting upstream)
- E/App issue: 🛑
- PR Introducing Patch: N/A (patched alongside the react-native-reanimated 4.5.1 / react-native-worklets 0.10.2 bump;
  worklets Bundle Mode's dev-reload behavior surfaces this pre-existing expo-image + HybridApp fragility)
