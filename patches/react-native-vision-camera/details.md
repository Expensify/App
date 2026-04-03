# `react-native-vision-camera` patches

### [react-native-vision-camera+4.7.2+001+fix-camera-preview-orientation.patch](react-native-vision-camera+4.7.2+001+fix-camera-preview-orientation.patch)

- Reason: 

    ```
    Camera preview orientation does not update in some edge cases and remains out of sync with the device orientation (contrary to camera ouptut orientation)
    Soure of patch: https://github.com/mrousavy/react-native-vision-camera/issues/3323#issuecomment-2551228506
    ```

  
- Upstream PR/issue: https://github.com/mrousavy/react-native-vision-camera/issues/3323
- E/App issue: https://github.com/Expensify/App/issues/77280
- PR introducing patch: https://github.com/Expensify/App/pull/85229