import React, {useMemo} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import PressableAvatarWithIndicator from '../PressableAvatarWithIndicator';
import styles from '../../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import GlobalNavigationMenuItemList from './GlobalNavigationMenuItemList';
import variables from '../../../../styles/variables';
import CONST from '../../../../CONST';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';

const propTypes = {
    isCreateMenuOpen: PropTypes.bool,
    ...withLocalizePropTypes,
};

const defaultProps = {
    isCreateMenuOpen: false,
};

function GlobalNavigation({isCreateMenuOpen}) {
    const items = useMemo(
        () => [
            {
                icon: Expensicons.ChatBubble,
                text: 'Chats',
                value: CONST.GLOBAL_NAVIGATION_OPTION.CHATS,
                onSelected: () => {
                    Navigation.navigate(ROUTES.REPORT);
                },
            },
        ],
        [],
    );

    return (
        <View style={[styles.ph5, styles.pv3, styles.alignItemsCenter, styles.h100, {width: variables.globalNavigationWidth, backgroundColor: styles.sidebarLinkActive.backgroundColor}]}>
            <PressableAvatarWithIndicator isCreateMenuOpen={isCreateMenuOpen} />
            <GlobalNavigationMenuItemList menuItems={items} />
        </View>
    );
}

GlobalNavigation.propTypes = propTypes;
GlobalNavigation.defaultProps = defaultProps;
GlobalNavigation.displayName = 'GlobalNavigation';

export default withLocalize(GlobalNavigation);
