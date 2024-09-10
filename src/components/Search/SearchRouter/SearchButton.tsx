import React from 'react';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Permissions from '@libs/Permissions';
import {useSearchRouterContext} from './SearchRouterContext';

function SearchButton() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {openSearchRouter} = useSearchRouterContext();

    if (!Permissions.canUseNewSearchRouter()) {
        return;
    }

    return (
        <PressableWithoutFeedback
            accessibilityLabel=""
            style={[styles.flexRow, styles.mr2, styles.touchableButtonImage]}
            onPress={() => {
                openSearchRouter();
            }}
        >
            <Icon
                src={Expensicons.MagnifyingGlass}
                fill={theme.icon}
            />
        </PressableWithoutFeedback>
    );
}

SearchButton.displayName = 'SearchButton';

export default SearchButton;
