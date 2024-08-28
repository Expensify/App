import type {ViewStyle} from 'react-native';
import type {ThemeStyles} from '@styles/index';
import type {ThemeColors} from '@styles/theme/types';
import variables from '@styles/variables';
import type StyleUtilGenerator from './types';

const getDefaultWrapperStyle = (theme: ThemeColors): ViewStyle => ({
    backgroundColor: theme.componentBG,
});

const getMiniWrapperStyle = (theme: ThemeColors, styles: ThemeStyles): ViewStyle[] => [
    styles.flexRow,
    getDefaultWrapperStyle(theme),
    {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        height: 36,
        borderRadius: variables.buttonBorderRadius,
        borderWidth: 1,
        borderColor: theme.border,
        // In Safari, when welcome messages use a code block (triple backticks), they would overlap the context menu below when there is no scrollbar without the transform style.
        transform: 'translateZ(0)',
    },
];

type GetReportActionContextMenuStylesStyleUtil = {getReportActionContextMenuStyles: (isMini: boolean, isSmallScreenWidth: boolean) => ViewStyle[]};

/**
 * Generate the wrapper styles for the ReportActionContextMenu.
 *
 * @param isMini
 * @param isSmallScreenWidth
 * @param theme
 */
const createReportActionContextMenuStyleUtils: StyleUtilGenerator<GetReportActionContextMenuStylesStyleUtil> = ({theme, styles}) => ({
    getReportActionContextMenuStyles: (isMini, isSmallScreenWidth) => {
        if (isMini) {
            return getMiniWrapperStyle(theme, styles);
        }

        return [
            styles.flexColumn,
            getDefaultWrapperStyle(theme),

            // Small screens use a bottom-docked modal that already has vertical padding.
            isSmallScreenWidth ? {} : styles.pv4,
        ];
    },
});

export default createReportActionContextMenuStyleUtils;
