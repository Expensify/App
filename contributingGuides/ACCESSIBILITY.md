# Accessibility of pressable components

### Base Components 

- **GenericPressable**: A basic pressable component with generic functionality. It should generally only be used to creating a new, custom pressable components. Avoid using it directly.

- **PressableWithFeedback**: A pressable component that provides standardized visual and haptic feedback upon pressing.

- **PressableWithoutFeedback**: A pressable component without any visual or haptic feedback.

- **PressableWithoutFocus**: A pressable component without visible effect of focus.

- **PressableWithDelayToggle**:  A pressable component that briefly disables then re-enables after a short delay upon pressing.

Accessibility props are unified across all platforms.

### Creating accessible flows
When implementing pressable components, it's essential to create accessible flows to ensure that users with disabilities can efficiently interact with the app.

- ensure that after performing press focus is set on the correct next element - this is especially important for keyboard users who rely on focus to navigate the app. All Pressable components have a `nextFocusRef` prop that can be used to set the next focusable element after the pressable component. This prop accepts a ref to the next focusable element. For example, if you have a button that opens a modal, you can set the next focus to the first focusable element in the modal. This way, when the user presses the button, focus will be set on the first focusable element in the modal, and the user can continue navigating the modal using the keyboard.

- size of any pressable component should be at least 44x44dp. This is the minimum size recommended by Apple and Google for touch targets. If the pressable component is smaller than `44x44dp`, it will be difficult for users with motor disabilities to interact with it. Pressable components have a `autoHitSlop` prop that can be used to automatically increase the size of the pressable component to `44x44dp`. This prop accepts a boolean value. If set to true, the pressable component will automatically increase its touchable size to `44x44dp`. If set to false, the pressable component will not increase its size. By default, this prop is set to false.

- ensure that the pressable component has a label and hint. This is especially important for users with visual disabilities who rely on screen readers to navigate the app. All Pressable components have a `accessibilityLabel` prop that can be used to set the label of the pressable component. This prop accepts a string value. All Pressable components also have a `accessibilityHint` prop that can be used to set the hint of the pressable component. This prop accepts a string value. The `accessibilityHint` prop is optional. If not set, the pressable component will fallback to the `accessibilityLabel` prop. For example, if you have a button that opens a modal, you can set the `accessibilityLabel` to "Open modal" and the `accessibilityHint` to "Opens a modal with more information". This way, when the user focuses on the button, the screen reader will read "Open modal. Opens a modal with more information". This will help the user understand what the button does and what to expect after pressing it.

- the `enableInScreenReaderStates` prop proves invaluable when aiming to enhance the accessibility of clickable elements, particularly when desiring to enlarge the clickable area of a component, such as an entire row. This can be especially useful, for instance, when dealing with tables where only a small portion of a row, like a checkbox, might traditionally trigger an action. By employing this prop, developers can ensure that the entirety of a designated component, in this case a row, is made accessible to users employing screen readers. This creates a more inclusive user experience, allowing individuals relying on screen readers to interact with the component effortlessly. For instance, in a table, using this prop on a row component enables users to click anywhere within the row to trigger an action, significantly improving accessibility and user-friendliness.

- ensure that the pressable component has a role. This is especially important for users with visual disabilities who rely on screen readers to navigate the app. All Pressable components have a `accessibilityRole` prop that can be used to set the role of the pressable component.

### Testing for accessibility
It's important to test for accessibility to ensure that the created component has accessibility properties set correctly. This can be done using the following tools:

- **iOS**  
For iOS, you can use the `accessibility inspector` app to test for accessibility. You can find it in the Xcode menu under `Xcode > Open Developer Tool > Accessibility Inspector`. This app allows you to inspect the accessibility properties of any element on the screen. You can also use it to simulate different accessibility settings, such as VoiceOver, color blindness, and more. It's a great tool for testing whether created component has accessibility properties set/passed correctly.

- **Android**  
For Android, you can use the [accessibility scanner](https://support.google.com/accessibility/android/answer/6376570) app to test for accessibility. You can find it in the Google Play Store. This app allows you to inspect the accessibility properties of any element on the screen. You can also use it to simulate different accessibility settings, such as TalkBack, color blindness, and more. It's a great tool for testing whether created component has accessibility properties set correctly. The [result of the accessibility scanner](https://support.google.com/accessibility/android/answer/6376559) app has information about content labeling, implementation, touch target size and low contrast
This tool requires an installed APK to test on. 

- **Web**  
On Mac, you can use the [VoiceOver](https://www.apple.com/accessibility/mac/vision/) app to test for accessibility. You can find it in the Mac menu under `System Preferences > Accessibility > VoiceOver` or by pressing `Cmd + F5`. This app allows you to inspect the accessibility properties of any element on the screen. You can also use it to simulate different accessibility settings, such as VoiceOver, color blindness, and more. It's a great tool for testing whether created component has accessibility properties set correctly. 


### Valuable resources
- [Apple accessibility guidelines](https://developer.apple.com/design/human-interface-guidelines/accessibility/overview/introduction/)
- [Google accessibility guidelines](https://developer.android.com/guide/topics/ui/accessibility)
- [Web accessibility guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)