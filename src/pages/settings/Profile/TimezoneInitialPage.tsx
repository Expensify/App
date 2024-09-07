import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SelectedTimezone, Timezone} from '@src/types/onyx/PersonalDetails';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type TimezoneInitialPageProps = WithCurrentUserPersonalDetailsProps;

function TimezoneInitialPage({currentUserPersonalDetails}: TimezoneInitialPageProps) {
    const styles = useThemeStyles();
    const timezone: Timezone = currentUserPersonalDetails?.timezone ?? CONST.DEFAULT_TIME_ZONE;

    const {translate} = useLocalize();

    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone as SelectedTimezone;

    /**
     * Updates setting for automatic timezone selection.
     * Note: If we are updating automatically, we'll immediately calculate the user's timezone.
     */
    const updateAutomaticTimezone = (isAutomatic: boolean) => {
        PersonalDetails.updateAutomaticTimezone({
            automatic: isAutomatic,
            selected: isAutomatic && !isEmptyObject(currentTimezone) ? currentTimezone : timezone.selected,
        });
    };

    return (
        <ScreenWrapper testID={TimezoneInitialPage.displayName}>
            <HeaderWithBackButton
                title={translate('timezonePage.timezone')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <View style={styles.flex1}>
                <View style={[styles.ph5]}>
                    <Text style={[styles.mb5]}>{translate('timezonePage.isShownOnProfile')}</Text>
                    <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text style={[styles.flexShrink1, styles.mr2]}>{translate('timezonePage.getLocationAutomatically')}</Text>
                        <Switch
                            accessibilityLabel={translate('timezonePage.getLocationAutomatically')}
                            isOn={!!timezone.automatic}
                            onToggle={updateAutomaticTimezone}
                        />
                    </View>
                </View>
                <MenuItemWithTopDescription
                    title={timezone.selected}
                    description={translate('timezonePage.timezone')}
                    shouldShowRightIcon
                    disabled={timezone.automatic}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_TIMEZONE_SELECT)}
                />
            </View>
        </ScreenWrapper>
    );
}

TimezoneInitialPage.displayName = 'TimezoneInitialPage';

export default withCurrentUserPersonalDetails(TimezoneInitialPage);
