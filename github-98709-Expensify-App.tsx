// Assuming this is in a React Native component file (e.g., ManualScreen.tsx)
// The issue likely stems from the Back button not having proper accessibility attributes
// or being inside a non-focusable container

// Example fix for a Back button component:
const BackButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Back"
      accessible={true}
      onPress={onPress}
      style={styles.backButton}
      // Ensure the button is focusable in web builds (React Native Web)
      // For web: add tabIndex={0} to make it focusable via keyboard
      {...(Platform.OS === 'web' ? { tabIndex: 0 } : {})}
    >
      <Text style={styles.backButtonText}>← Back</Text>
    </TouchableOpacity>
  );
};

// If the Back button is inside a container that blocks focus, ensure the container
// doesn't have focusable={false} or similar restrictive props
// Example: Parent container should not interfere with child focusability
const ManualTabContent = () => {
  return (
    <View style={styles.container}>
      {/* Ensure this BackButton is not nested in a non-focusable view */}
      <BackButton onPress={() => navigation.goBack()} />
      {/* Other content */}
    </View>
  );
};