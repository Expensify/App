# `@react-native-picker/picker` patches

### [@react-native-picker+picker+2.11.2+001+fix-android-crash.patch](@react-native-picker+picker+2.11.2+001+fix-android-crash.patch)

- Reason:

    ```
    Fixes Android crash after sign in. When user signed in (PublicScreens changed to AuthScreens), LoacalePicker was unmounted and caused crash with those logs:

    facebook::react::RNCAndroidDialogPickerProps::~RNCAndroidDialogPickerProps()
    facebook::react::RNCAndroidDialogPickerShadowNode::~RNCAndroidDialogPickerShadowNode()
  
    It turned out that @react-native-picker/picker has custom CMake and according to
    [this](https://github.com/facebook/react-native/blob/e02e7b1a2943b3ec6e1eb15723c86a8255b100a6/CHANGELOG.md?plain=1#L321)
    info from React Native changelog, should update to use `target_compile_reactnative_options` inside their `CMakeLists.txt` file
    ```

- Upstream PR/issue: https://github.com/react-native-picker/picker/pull/648
- E/App issue: <Please create an E/App issue ([template](./../.github/ISSUE_TEMPLATE/NewPatchTemplate.md)) for each introduced patch. Link it here and if patch won't be removed in the future (no upstream PR exists) explain why>
- PR introducing patch: https://github.com/Expensify/App/pull/69535
