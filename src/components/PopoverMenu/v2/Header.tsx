import React from 'react';
import type {ReactNode} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import {useIsAtActiveLevel} from './SubContext';

type HeaderProps = {
    /** Text to render. Typically a `string`, but `<Text>` accepts any `ReactNode`. */
    children: ReactNode;
    /** Override or extend the default header text style. */
    style?: StyleProp<TextStyle>;
};

/**
 * Title row rendered at the top of `<PopoverMenu.Content>`. Hides automatically when a sub is entered
 * so the back-button row owns that space — same active-level gating used by `<Label>` and `<Separator>`.
 * To title a sub instead, render `<Header>` inside the `<SubContent>` rather than at the root.
 */
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
