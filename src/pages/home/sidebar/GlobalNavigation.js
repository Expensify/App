import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import PressableAvatarWithIndicator from './PressableAvatarWithIndicator';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import GlobalNavigationMenuItemList from './GlobalNavigationMenuItemList';
import Logo from '../../../../assets/images/new-expensify.svg';
import variables from '../../../styles/variables';

const propTypes = {
    isSmallScreenWidth: PropTypes.bool.isRequired,
    isCreateMenuOpen: PropTypes.bool.isRequired,
    ...withLocalizePropTypes,
};

function GlobalNavigation({isSmallScreenWidth, isCreateMenuOpen, translate}) {
    if (isSmallScreenWidth) { 
        return null;
    }

    return (
        <View style={[ styles.ph5, styles.pv3, styles.justifyContentBetween, styles.alignItemsCenter, styles.h100, {width: variables.globalNavigationWidth, backgroundColor: styles.sidebarLinkActive.backgroundColor}]}>
            <PressableAvatarWithIndicator isCreateMenuOpen={isCreateMenuOpen} />

            <GlobalNavigationMenuItemList
                menuItems={[
                    {
                        icon: Expensicons.ChatBubble,
                        text: 'Chats',
                        onSelected: () => console.log('clicked'),
                    },
                    {
                        icon: Expensicons.Receipt,
                        text: 'Expenses',
                        onSelected: () => console.log('clicked'),
                    },
                ]}
            />
            <Logo
                height={50}
                width={50}
            />
        </View>
    );
};

GlobalNavigation.propTypes = propTypes;
GlobalNavigation.displayName = 'GlobalNavigation';

export default withLocalize(GlobalNavigation);
