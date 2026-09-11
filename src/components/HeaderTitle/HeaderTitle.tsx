import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

import {View} from 'react-native';

import useHeaderDialogAnnouncement from './useHeaderDialogAnnouncement';

type HeaderTitleProps = {
    /** Additional header container styles */
    style?: StyleProp<ViewStyle>;

    /** The title to be used for the dialog (used for screen reader announcements). */
    dialogLabel?: string;

    /** Whether to skip focus of the first interactive element inside the header after the RHP transition for screen reader announcement.  */
    shouldSkipFocusAfterTransition?: boolean;

    /** Children to render below the title */
    children?: React.ReactNode;
};

function HeaderTitle({children, style, dialogLabel = '', shouldSkipFocusAfterTransition = false}: HeaderTitleProps) {
    const styles = useThemeStyles();

    useHeaderDialogAnnouncement(dialogLabel, shouldSkipFocusAfterTransition);

    return (
        <View style={[styles.flex1, styles.flexRow, style]}>
            <View style={[styles.mw100]}>{children}</View>
        </View>
    );
}

export default HeaderTitle;

export type {HeaderTitleProps};
