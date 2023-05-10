import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import moment from 'moment-timezone';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import Navigation from '../../../libs/Navigation/Navigation';
import * as PersonalDetails from '../../../libs/actions/PersonalDetails';
import compose from '../../../libs/compose';
import Switch from '../../../components/Switch';
import MenuItemWithTopDescription from '../../../components/MenuItemWithTopDescription';

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const TimezoneInitialPage = (props) => {
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
            selected: isAutomatic ? moment.tz.guess() : timezone.selected,
        });
    };

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('timezonePage.timezone')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PROFILE)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <View style={styles.flex1}>
                <View style={[styles.ph5]}>
                    <Text style={[styles.mb5]}>
                        {props.translate('timezonePage.isShownOnProfile')}
                    </Text>
                    <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text>
                            {props.translate('timezonePage.getLocationAutomatically')}
                        </Text>
                        <Switch
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
};

TimezoneInitialPage.propTypes = propTypes;
TimezoneInitialPage.defaultProps = defaultProps;
TimezoneInitialPage.displayName = 'TimezoneInitialPage';

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
)(TimezoneInitialPage);
