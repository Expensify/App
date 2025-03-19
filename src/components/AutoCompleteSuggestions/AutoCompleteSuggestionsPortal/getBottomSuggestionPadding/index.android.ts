import {Dimensions} from 'react-native';

function getBottomSuggestionPadding(): number {
    const {height} = Dimensions.get('window');
    const basePadding = 30;
    const referenceHeightMin = 900;
    const referencePaddingMin = -10;
    const referenceHeightMax = 1000;
    const referencePaddingMax = -44;

    if (height >= referenceHeightMin && height < referenceHeightMax) {
        // Calculate the padding adjustment rate per pixel of height
        const paddingRate = (referencePaddingMax - referencePaddingMin) / (referenceHeightMax - referenceHeightMin);

        const padding = referencePaddingMin + (height - referenceHeightMin) * paddingRate;
        return Math.round(Math.max(-60, Math.min(-5, padding)));
    }

    return basePadding;
}

export default getBottomSuggestionPadding;
