import React from 'react';
import type {ReactNode} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {useIsAtActiveLevel} from '@components/PopoverMenu/v2/sub/SubContext';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type HeaderProps = {
    children: ReactNode;
    style?: StyleProp<TextStyle>;
};

/** Hides on sub entry. To title a sub, render inside `<SubContent>` instead. */
function Header({children, style}: HeaderProps): React.ReactElement | null {
    const styles = useThemeStyles();
    const isAtActiveLevel = useIsAtActiveLevel(Header.displayName);

    if (!isAtActiveLevel) {
        return null;
    }

    return <Text style={[styles.createMenuHeaderText, styles.ph5, styles.pv3, style]}>{children}</Text>;
}

Header.displayName = 'PopoverMenu.Header';

export default Header;
export type {HeaderProps};
