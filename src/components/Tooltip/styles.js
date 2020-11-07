import gStyles, {colors} from '../../styles/StyleSheet';
import getTooltipCoordinates from './getTooltipCoordinates';
import {Dimensions} from 'react-native';

const backgroundColor = `${colors.heading}cc`;

function getTooltipStyle(elementWidth, elementHeight, xOffset, yOffset) {
    const [x, y, gutter, inBottom] = getTooltipCoordinates(elementWidth, elementHeight, xOffset, yOffset);
    const styles = {
        position: 'absolute',
        width: 150,
        height: 60,
        left: x,
        color: colors.textReversed,
        backgroundColor: colors.red,
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        padding: 10,
    };
    if (!gutter) {
        // If we are NOT in a gutter, we will want to center the tooltip on the element
        styles.transform = [{translateX: -75}];
    } 
    if (inBottom) {
        // If we're on the bottom of the page, we'll want to use the bottom attribute rather than the top
        // this allows us to position the tooltip without actually knowing how large it is.
 
        styles.bottom = y;
    } else {
        styles.top = y;
    }
    return styles;
}

function getPointerStyle(elementWidth, elementHeight, xOffset, yOffset, tooltipY) {
    const shouldPointDown = yOffset > Dimensions.get('screen').height / 2;
    console.log(`yOffset ${yOffset}`);
    console.log(`shouldPointDown ${shouldPointDown}`);
    console.log(`Dimensions.get('screen').height ${Dimensions.get('screen').height}`);
    return {
        pointerWrapperViewStyle: {
            position: 'absolute',
            top: shouldPointDown ? -(elementHeight + 15) : 0,
            left: ((elementWidth) / 2) - 7.5,
        },
        shouldPointDown,
    };
}

export default {
    getTooltipStyle,
    getPointerStyle,
    tooltipText: {
        color: colors.text,
        ...gStyles.textMicro,
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 15,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: colors.red,
    },
    down: {
        transform: [{rotate: '180deg'}],
    },
};
