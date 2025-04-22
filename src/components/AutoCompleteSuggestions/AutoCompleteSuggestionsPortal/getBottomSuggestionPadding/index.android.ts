import {Dimensions} from 'react-native';

function getBottomSuggestionPadding(bottom: number): number {
    const {height} = Dimensions.get('window');
    const basePadding = 30;

    // Calculate what percentage of the screen height the bottom position represents
    const bottomPercentageToHeight = (bottom / height) * 100;

    // Reference values for interpolation
    const referenceHeightMin = 900;
    const referencePaddingMin = -10;
    const referenceHeightMax = 1000;
    const referencePaddingMax = -44;

    // If the bottom position is more than 7% of the screen, the value is too big and we need adjust the padding
    if (bottomPercentageToHeight > 7) {
        // Calculate the rate of change between reference points
        const paddingRate = (referencePaddingMax - referencePaddingMin) / (referenceHeightMax - referenceHeightMin);

        // Interpolate the padding value based on the current screen height
        const padding = referencePaddingMin + (height - referenceHeightMin) * paddingRate;

        // Clamp the padding value between -60 and -5 to prevent extreme values
        return Math.round(Math.max(-60, Math.min(-5, padding)));
    }

    return basePadding;
}

export default getBottomSuggestionPadding;
