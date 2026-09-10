import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import {View} from 'react-native';

type HeaderRightProps = {
    /** Trailing content, typically `Header.Actions`, `Header.ThreeDotsMenu`, `Header.CloseButtonTooltip`, search/help buttons. */
    children: ReactNode;
};

/** Right-hand zone. Separates trailing content from the center content. Spacing between the blocks inside it is each block's own concern. */
function HeaderRight({children}: HeaderRightProps) {
    const styles = useThemeStyles();

    return <View style={[styles.reportOptions, styles.flexRow, styles.alignItemsCenter]}>{children}</View>;
}

export default HeaderRight;
