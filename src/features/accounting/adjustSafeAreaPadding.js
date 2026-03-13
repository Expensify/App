import { Platform, SafeAreaView, StyleSheet, View } from 'react-native';

const AdjustSafeAreaPadding = ({ children }) => {
  const isAndroid = Platform.OS === 'android';

  const safeAreaStyle = isAndroid
    ? { paddingBottom: 30 } // Adjust bottom padding for Android to avoid overlap with navigation buttons
    : {};

  return (
    <SafeAreaView style={[styles.safeArea, safeAreaStyle]}>
      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AdjustSafeAreaPadding;