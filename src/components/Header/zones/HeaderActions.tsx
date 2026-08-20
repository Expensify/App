import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import {View} from 'react-native';

type HeaderActionsProps = {
    /** Custom action content, typically a Button and/or `Header.DownloadButton`, packed tight with no gap between them. */
    children: ReactNode;
};

/**
 * Wraps custom header actions (children + download button). Always applies `pr2` on its own
 * trailing edge, regardless of what follows it (three-dots menu, close button, search, help, or
 * nothing at all), so the gap to whatever comes next doesn't need to know what that is.
 */
function HeaderActions({children}: HeaderActionsProps) {
    const styles = useThemeStyles();

    return <View style={[styles.pr2, styles.flexRow, styles.alignItemsCenter]}>{children}</View>;
}

export default HeaderActions;
