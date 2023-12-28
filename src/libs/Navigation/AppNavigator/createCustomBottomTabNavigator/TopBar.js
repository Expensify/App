import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Search from '@components/Search';
import SubscriptAvatar from '@components/SubscriptAvatar';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import SignInOrAvatarWithOptionalStatus from '@pages/home/sidebar/SignInOrAvatarWithOptionalStatus';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

// TODO-IDEAL: isCreateMenuOpen wasn't used before
function TopBar({isCreateMenuOpen = false}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const showSearchPage = useCallback(() => {
        if (isCreateMenuOpen) {
            // Prevent opening Search page when click Search icon quickly after clicking FAB icon
            return;
        }

        Navigation.navigate(ROUTES.SEARCH);
    }, [isCreateMenuOpen]);

    return (
        <View
            style={[styles.gap4, styles.flexRow, styles.ph5, styles.pv5, styles.justifyContentBetween, styles.alignItemsCenter]}
            dataSet={{dragArea: true}}
        >
            <PressableWithFeedback role={CONST.ROLE.BUTTON}>
                <SubscriptAvatar
                    mainAvatar={{source: Expensicons.ExpensifyAppIcon, name: 'Expensify', type: CONST.ICON_TYPE_AVATAR}}
                    subscriptIcon={{source: Expensicons.DownArrow, width: 8, height: 8}}
                    showTooltip={false}
                    noMargin
                />
            </PressableWithFeedback>
            <Search
                placeholder={translate('sidebarScreen.buttonSearch')}
                onPress={Session.checkIfActionIsAllowed(showSearchPage)}
                containerStyle={styles.flexGrow1}
            />
            <SignInOrAvatarWithOptionalStatus isCreateMenuOpen={isCreateMenuOpen} />
        </View>
    );
}

TopBar.displayName = 'TopBar';
TopBar.propTypes = {
    isCreateMenuOpen: PropTypes.bool,
};
TopBar.defaultProps = {
    isCreateMenuOpen: false,
};

export default TopBar;
