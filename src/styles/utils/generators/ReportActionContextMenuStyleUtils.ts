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
        // NOTE: asserting "transform" to a valid type, because it isn't possible to augment "transform".
        transform: 'translateZ(0)' as unknown as ViewStyle['transform'],
    },
];

type GetReportActionContextMenuStylesStyleUtil = {getReportActionContextMenuStyles: (isMini: boolean, shouldUseNarrowLayout: boolean) => ViewStyle[]};

/**
 * Generate the wrapper styles for the ReportActionContextMenu.
 *
 * @param isMini
 * @param shouldUseNarrowLayout
 * @param theme
 */
const createReportActionContextMenuStyleUtils: StyleUtilGenerator<GetReportActionContextMenuStylesStyleUtil> = ({theme, styles}) => ({
    getReportActionContextMenuStyles: (isMini, shouldUseNarrowLayout) => {
        if (isMini) {
            return getMiniWrapperStyle(theme, styles);
        }

        return [
            styles.flexColumn,
            getDefaultWrapperStyle(theme),

            // Small screens use a bottom-docked modal that already has vertical padding.
            shouldUseNarrowLayout ? {} : styles.pv3,
        ];
    },
});

export default createReportActionContextMenuStyleUtils;
