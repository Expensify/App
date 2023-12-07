import {ViewStyle} from 'react-native';
import {type ThemeStyles} from '@styles/styles';
import {type ThemeColors} from '@styles/themes/types';
import variables from '@styles/variables';

const getDefaultWrapperStyle = (theme: ThemeColors): ViewStyle => ({
    backgroundColor: theme.componentBG,
});

const getMiniWrapperStyle = (theme: ThemeColors, styles: ThemeStyles): ViewStyle[] => [
    styles.flexRow,
    getDefaultWrapperStyle(theme),
    {
        borderRadius: variables.buttonBorderRadius,
        borderWidth: 1,
        borderColor: theme.border,
        // In Safari, when welcome messages use a code block (triple backticks), they would overlap the context menu below when there is no scrollbar without the transform style.
        // NOTE: asserting "transform" to a valid type, because it isn't possible to augment "transform".
        transform: 'translateZ(0)' as unknown as ViewStyle['transform'],
    },
];

/**
 * Generate the wrapper styles for the ReportActionContextMenu.
 *
 * @param isMini
 * @param isSmallScreenWidth
 * @param theme
 */
const createReportActionContextMenuStyleUtils = (theme: ThemeColors, styles: ThemeStyles) => ({
    getReportActionContextMenuStyles: (isMini: boolean, isSmallScreenWidth: boolean): ViewStyle[] => {
        if (isMini) {
            return getMiniWrapperStyle(theme, styles);
        }

        return [
            styles.flexColumn,
            getDefaultWrapperStyle(theme),

            // Small screens use a bottom-docked modal that already has vertical padding.
            isSmallScreenWidth ? {} : styles.pv3,
        ];
    },
});

export default createReportActionContextMenuStyleUtils;
