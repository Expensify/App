import _ from 'underscore';
import React from 'react';
import {View, ScrollView} from 'react-native';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import styles from '../../../styles/styles';
import * as Expensicons from '../../../components/Icon/Expensicons';
import ScreenWrapper from '../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import MenuItem from '../../../components/MenuItem';
import * as Pusher from '../../../libs/Pusher/pusher';

import Config from '../../../CONFIG';

const propTypes = {
    ...withLocalizePropTypes,
};

const SecuritySettingsPage = (props) => {
    const menuItems = [
        {
            translationKey: 'passwordPage.changePassword',
            icon: Expensicons.Key,
            action: () => {
                Navigation.navigate(ROUTES.SETTINGS_PASSWORD);
            },
        },
        {
            translationKey: 'closeAccountPage.closeAccount',
            icon: Expensicons.ClosedSign,
            action: () => {
                Navigation.navigate(ROUTES.SETTINGS_CLOSE);
            },
        },
    ];

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('initialSettingsPage.security')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView
                contentContainerStyle={[
                    styles.flexGrow1,
                    styles.flexColumn,
                    styles.justifyContentBetween,
                ]}
            >
                <View style={[styles.flex1]}>
                    {_.map(menuItems, item => (
                        <MenuItem
                            key={item.translationKey}
                            title={props.translate(item.translationKey)}
                            icon={item.icon}
                            iconRight={item.iconRight}
                            onPress={() => item.action()}
                            shouldShowRightIcon
                        />
                    ))}
                    <MenuItem
                        title="Pusher test"
                        onPress={() => {
                            // console.log('here we trigger pusher');
                            console.log('[MY SUFFIX]', Config.PUSHER.SUFFIX);
                            // Pusher.sendEvent('private-encrypted-report-reportID-7', 'client-userIsTyping', {payload: 'yes'});
                        }}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

SecuritySettingsPage.propTypes = propTypes;
SecuritySettingsPage.displayName = 'SettingSecurityPage';

export default withLocalize(SecuritySettingsPage);
