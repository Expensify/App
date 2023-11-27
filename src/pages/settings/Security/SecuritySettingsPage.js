import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import * as Expensicons from '@components/Icon/Expensicons';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import LottieAnimations from '@components/LottieAnimations';
import MenuItemList from '@components/MenuItemList';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

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
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = props;
    const waitForNavigate = useWaitForNavigation();

    const menuItems = useMemo(() => {
        const baseMenuItems = [
            {
                translationKey: 'twoFactorAuth.headerTitle',
                icon: Expensicons.Shield,
                action: waitForNavigate(() => Navigation.navigate(ROUTES.SETTINGS_2FA)),
            },
            {
                translationKey: 'closeAccountPage.closeAccount',
                icon: Expensicons.ClosedSign,
                action: waitForNavigate(() => Navigation.navigate(ROUTES.SETTINGS_CLOSE)),
            },
        ];

        return _.map(baseMenuItems, (item) => ({
            key: item.translationKey,
            title: translate(item.translationKey),
            icon: item.icon,
            iconRight: item.iconRight,
            onPress: item.action,
            shouldShowRightIcon: true,
        }));
    }, [translate, waitForNavigate]);

    return (
        <IllustratedHeaderPageLayout
            title={translate('initialSettingsPage.security')}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            shouldShowBackButton
            illustration={LottieAnimations.Safe}
            backgroundColor={theme.PAGE_BACKGROUND_COLORS[SCREENS.SETTINGS.SECURITY]}
        >
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexColumn, styles.justifyContentBetween]}>
                <View style={[styles.flex1]}>
                    <MenuItemList
                        menuItems={menuItems}
                        shouldUseSingleExecution
                    />
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
