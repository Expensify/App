import {ViewStyle} from 'react-native';
import styles from './styles';
import themeColors from './themes/default';
import variables from './variables';

const defaultWrapperStyle: ViewStyle = {
    backgroundColor: themeColors.componentBG,
};

const miniWrapperStyle: ViewStyle[] = [
    styles.flexRow,
    defaultWrapperStyle,
    {
        borderRadius: variables.buttonBorderRadius,
        borderWidth: 1,
        borderColor: themeColors.border,
        // In Safari, when welcome messages use a code block (triple backticks), they would overlap the context menu below when there is no scrollbar without the transform style.
        // NOTE: asserting "transform" to a valid type, because it isn't possible to augment "transform".
        transform: 'translateZ(0)' as unknown as ViewStyle['transform'],
    },
];

const bigWrapperStyle: ViewStyle[] = [styles.flexColumn, defaultWrapperStyle];

/**
 * Generate the wrapper styles for the ReportActionContextMenu.
 *
 * @param isMini
 * @param isSmallScreenWidth
 */
function getReportActionContextMenuStyles(isMini: boolean, isSmallScreenWidth: boolean): ViewStyle[] {
    if (isMini) {
        return miniWrapperStyle;
    }

    // TODO: Remove this "eslint-disable-next" once the theme switching migration is done and styles are fully typed (GH Issue: https://github.com/Expensify/App/issues/27337)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return [
        ...bigWrapperStyle,

        // Small screens use a bottom-docked modal that already has vertical padding.
        isSmallScreenWidth ? {} : styles.pv3,
    ];
}

export default getReportActionContextMenuStyles;
