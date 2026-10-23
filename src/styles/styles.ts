import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    // ... existing styles
    navigationContainer: {
        flex: 1,
        backgroundColor: 'white', // Ensure opaque background to prevent flickering
        willChange: 'transform', // Optimize rendering for Safari swipe gestures
    },
});

export default styles;