import React from 'react';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchUtils from '@libs/SearchUtils';
import {useSearchRouterContext} from './SearchRouterContext';

function SearchButton() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {toggleSearchRouter} = useSearchRouterContext();

    if (!SearchUtils.shouldDisplayNewSearchRouter()) {
        return;
    }

    return (
        <PressableWithoutFeedback
            accessibilityLabel=""
            style={[styles.flexRow, styles.mr2, styles.touchableButtonImage]}
            onPress={() => {
                toggleSearchRouter();
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
