import gStyles, {colors} from '../../styles/StyleSheet';
import getTooltipCoordinates from './getTooltipCoordinates';

const backgroundColor = `${colors.heading}cc`;

function getTooltipStyle(elementWidth, elementHeight, xOffset, yOffset) {
    const [x, y] = getTooltipCoordinates(elementWidth, elementHeight, xOffset, yOffset);
    return {
        position: 'absolute',
        left: x,
        top: y,
        width: 40,
        height: 150,
        color: colors.textReversed,
        backgroundColor,
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        padding: 10,
    };
}

function getPointerStyle(elementWidth, elementHeight, xOffset, yOffset, tooltipY) {
    const shouldPointDown = yOffset > tooltipY;
    return {
        pointerWrapperViewStyle: {
            position: 'absolute',
            top: shouldPointDown ? yOffset - 13 : (yOffset + elementHeight) - 2,
            left: ((xOffset + elementWidth) / 2) - 7.5,
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
        borderBottomColor: backgroundColor,
    },
    down: {
        transform: [{rotate: '180deg'}],
    },
};
