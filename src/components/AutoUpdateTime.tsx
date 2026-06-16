/**
 * Displays the user's local time and updates it every minute.
 * The time auto-update logic is extracted to this component to avoid re-rendering a more complex component, e.g. DetailsPage.
 */
import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useNow from '@hooks/useNow';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import type {Timezone} from '@src/types/onyx/PersonalDetails';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';

type AutoUpdateTimeProps = {
    /** Timezone of the user from their personal details */
    timezone: Timezone;
};

function AutoUpdateTime({timezone}: AutoUpdateTimeProps) {
    const {translate, getLocalDateFromDatetime, preferredLocale} = useLocalize();
    const styles = useThemeStyles();
    const now = useNow();

    const currentUserLocalTime = getLocalDateFromDatetime(now.toISOString(), timezone.selected);
    const timezoneName = timezone.selected ? DateUtils.getZoneAbbreviation(currentUserLocalTime, timezone.selected) : '';

    return (
        <View style={[styles.w100, styles.detailsPageSectionContainer]}>
            <MenuItemWithTopDescription
                style={[styles.ph0]}
                title={`${DateUtils.formatToLocalTime(currentUserLocalTime, preferredLocale)} ${timezoneName}`}
                description={translate('detailsPage.localTime')}
                interactive={false}
            />
        </View>
    );
}

export default AutoUpdateTime;
