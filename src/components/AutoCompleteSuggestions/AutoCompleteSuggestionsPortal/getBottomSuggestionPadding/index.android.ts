import {Dimensions} from 'react-native';

function getBottomSuggestionPadding(): number {
    const {width, height} = Dimensions.get('window');
    const aspectRatio = height / width;
    const basePadding = 6;

    // Calculate an adaptive offset based on screen characteristics
    if (aspectRatio > 2.1) {
        // For taller devices, calculate the offset based on the aspect ratio
        // The formula below creates a linear relationship between aspect ratio and padding
        // As the aspect ratio increases, the padding becomes more negative

        // Calculate how much the aspect ratio exceeds the threshold
        const aspectRatioExcess = aspectRatio - 2;

        // Scale factor: for every 0.1 increase in aspect ratio above 2.0,
        // we decrease the padding by approximately 34px
        const scaleFactor = -320;

        // Calculate the dynamic padding
        return Math.round(basePadding + aspectRatioExcess * scaleFactor);
    }

    return basePadding;
}

export default getBottomSuggestionPadding;
