import type {ViewStyle} from 'react-native';

// Styling lottie animations for the ManageTrips component requires different margin values depending on the platform.
export default function getTripIllustrationStyle(): ViewStyle {
    return {
        marginVertical: 20,
    };
}
