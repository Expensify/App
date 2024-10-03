import React from 'react';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Performance from '@libs/Performance';
import Permissions from '@libs/Permissions';
import * as Session from '@userActions/Session';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import {useSearchRouterContext} from './SearchRouterContext';

function SearchButton() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {openSearchRouter} = useSearchRouterContext();

    if (!Permissions.canUseNewSearchRouter()) {
        return;
    }

    return (
        <PressableWithoutFeedback
            accessibilityLabel={translate('common.search')}
            style={[styles.flexRow, styles.touchableButtonImage]}
            onPress={Session.checkIfActionIsAllowed(() => {
                Timing.start(CONST.TIMING.SEARCH_ROUTER_OPEN);
                Performance.markStart(CONST.TIMING.SEARCH_ROUTER_OPEN);

                openSearchRouter();
            })}
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
