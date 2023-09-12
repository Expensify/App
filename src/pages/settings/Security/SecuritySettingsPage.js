import _ from 'underscore';
import React from 'react';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import styles from '../../../styles/styles';
import * as Expensicons from '../../../components/Icon/Expensicons';
import themeColors from '../../../styles/themes/default';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import MenuItem from '../../../components/MenuItem';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';
import IllustratedHeaderPageLayout from '../../../components/IllustratedHeaderPageLayout';
import * as LottieAnimations from '../../../components/LottieAnimations';

const propTypes = {
    ...withLocalizePropTypes,

    /* Onyx Props */

    /** Holds information about the users account that is logging in */
    account: PropTypes.shape({
        /** Whether this account has 2FA enabled or not */
        requiresTwoFactorAuth: PropTypes.bool,
    }),
};

const defaultProps = {
    account: {},
};

function SecuritySettingsPage(props) {
    const menuItems = [
        {
            translationKey: 'twoFactorAuth.headerTitle',
            icon: Expensicons.Shield,
            action: () => Navigation.navigate(ROUTES.SETTINGS_2FA),
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
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            shouldShowBackButton
            shouldShowCloseButton
            illustration={LottieAnimations.Safe}
            backgroundColor={themeColors.PAGE_BACKGROUND_COLORS[ROUTES.SETTINGS_SECURITY]}
        >
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexColumn, styles.justifyContentBetween]}>
                <View style={[styles.flex1]}>
                    {_.map(menuItems, (item) => (
                        <MenuItem
                            key={item.translationKey}
                            title={props.translate(item.translationKey)}
                            icon={item.icon}
                            iconRight={item.iconRight}
                            onPress={() => item.action()}
                            shouldShowRightIcon
                        />
                    ))}
                </View>
            </ScrollView>
        </IllustratedHeaderPageLayout>
    );
}

SecuritySettingsPage.propTypes = propTypes;
SecuritySettingsPage.defaultProps = defaultProps;
SecuritySettingsPage.displayName = 'SettingSecurityPage';

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(SecuritySettingsPage);
