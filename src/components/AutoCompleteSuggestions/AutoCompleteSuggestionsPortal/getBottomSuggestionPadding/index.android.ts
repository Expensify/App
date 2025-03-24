import {Dimensions} from 'react-native';

function getBottomSuggestionPadding(bottom: number): number {    
    const {height} = Dimensions.get('window');

    const bottomPercentageToHeight = (bottom / height) * 100;
    const basePadding = 30;
    const referenceHeightMin = 900;
    const referencePaddingMin = -10;
    const referenceHeightMax = 1000;
    const referencePaddingMax = -44;

    if (bottomPercentageToHeight > 7) {
        const paddingRate = (referencePaddingMax - referencePaddingMin) / (referenceHeightMax - referenceHeightMin);

        const padding = referencePaddingMin + (height - referenceHeightMin) * paddingRate;
        return Math.round(Math.max(-60, Math.min(-5, padding)));
    }

    return basePadding;
}

export default getBottomSuggestionPadding;
