import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function TimezoneInitialPage(props) {
    const styles = useThemeStyles();
    const timezone = lodashGet(props.currentUserPersonalDetails, 'timezone', CONST.DEFAULT_TIME_ZONE);

    /**
     * Updates setting for automatic timezone selection.
     * Note: If we are updating automatically, we'll immediately calculate the user's timezone.
     *
     * @param {Boolean} isAutomatic
     */
    const updateAutomaticTimezone = (isAutomatic) => {
        PersonalDetails.updateAutomaticTimezone({
            automatic: isAutomatic,
            selected: isAutomatic ? Intl.DateTimeFormat().resolvedOptions().timeZone : timezone.selected,
        });
    };

    return (
        <ScreenWrapper testID={TimezoneInitialPage.displayName}>
            <HeaderWithBackButton
                title={props.translate('timezonePage.timezone')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PROFILE)}
            />
            <View style={styles.flex1}>
                <View style={[styles.ph5]}>
                    <Text style={[styles.mb5]}>{props.translate('timezonePage.isShownOnProfile')}</Text>
                    <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text>{props.translate('timezonePage.getLocationAutomatically')}</Text>
                        <Switch
                            accessibilityLabel={props.translate('timezonePage.getLocationAutomatically')}
                            isOn={timezone.automatic}
                            onToggle={updateAutomaticTimezone}
                        />
                    </View>
                </View>
                <MenuItemWithTopDescription
                    title={timezone.selected}
                    description={props.translate('timezonePage.timezone')}
                    shouldShowRightIcon
                    disabled={timezone.automatic}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_TIMEZONE_SELECT)}
                />
            </View>
        </ScreenWrapper>
    );
}

TimezoneInitialPage.propTypes = propTypes;
TimezoneInitialPage.defaultProps = defaultProps;
TimezoneInitialPage.displayName = 'TimezoneInitialPage';

export default compose(withLocalize, withCurrentUserPersonalDetails)(TimezoneInitialPage);
