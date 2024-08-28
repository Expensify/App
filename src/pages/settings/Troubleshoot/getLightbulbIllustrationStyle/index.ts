import type {ViewStyle} from 'react-native';

// Styling lottie animations for the Lightbulb component requires different margin values depending on the platform.
export default function getTripIllustrationStyle(): ViewStyle {
    return {
        marginTop: 16,
        marginBottom: -16,
    };
}
