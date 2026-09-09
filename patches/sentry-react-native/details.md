# `@sentry/react-native` patches

### [@sentry+react-native+8.25.0.patch](@sentry+react-native+8.25.0.patch)

- Reason: The HybridApp Podfile sets `REACT_NATIVE_NODE_MODULES_DIR` to the node_modules directory. The Sentry podspec expects that variable to point directly to the React Native package. This patch resolves React Native from the CocoaPods installation root first and supports both path conventions as a fallback.
- Upstream PR/issue: N/A (specific to our hybrid app environment)
- E/App issue: https://github.com/Expensify/App/issues/100694
