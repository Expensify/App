import {useIsAtActiveLevel} from '@components/PopoverMenu/v2/sub/SubContext';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';
import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

const HEADING_LEVEL = 3;

type HeaderProps = {
    children: ReactNode;
    style?: StyleProp<TextStyle>;
};

/** To title a sub, render inside `<SubContent>` instead. */
function Header({children, style}: HeaderProps): React.ReactElement | null {
    const styles = useThemeStyles();
    const isAtActiveLevel = useIsAtActiveLevel(Header.displayName);

    if (!isAtActiveLevel) {
        return null;
    }

    return (
        <Text
            role={CONST.ROLE.HEADING}
            aria-level={HEADING_LEVEL}
            style={[styles.createMenuHeaderText, styles.ph5, styles.pv3, style]}
        >
            {children}
        </Text>
    );
}

Header.displayName = 'PopoverMenu.Header';

export default Header;
export type {HeaderProps};
