import _ from 'underscore';
import React from 'react';
import {View, ScrollView} from 'react-native';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import * as Expensicons from '../../../components/Icon/Expensicons';
import ScreenWrapper from '../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import MenuItem from '../../../components/MenuItem';
import IllustratedHeaderPageLayout from '../../../components/IllustratedHeaderPageLayout';
import SafeAnimation from '../../../../assets/animations/Safe.json';

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
        <IllustratedHeaderPageLayout
            title={props.translate('initialSettingsPage.security')}
            shouldShowBackButton
            onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
            onCloseButtonPress={() => Navigation.dismissModal(true)}
            illustration={SafeAnimation}
            backgroundColor={themeColors.securitySettingsPageBackgroundColor}
        >
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
        </IllustratedHeaderPageLayout>
    );
};

SecuritySettingsPage.propTypes = propTypes;
SecuritySettingsPage.displayName = 'SettingSecurityPage';

export default withLocalize(SecuritySettingsPage);
