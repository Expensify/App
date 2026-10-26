import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import type {Timezone} from '@src/types/onyx/PersonalDetails';

/**
 * Displays the user's local time and updates it every minute.
 * The time auto-update logic is extracted to this component to avoid re-rendering a more complex component, e.g. DetailsPage.
 */
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import MenuItemWithTopDescription from './MenuItemWithTopDescription';

type AutoUpdateTimeProps = {
    /** Timezone of the user from their personal details */
    timezone: Timezone;

    /** Whether to drop the row's horizontal padding, which is needed when it sits in an already padded section */
    shouldRemoveHorizontalPadding?: boolean;
};

function AutoUpdateTime({timezone, shouldRemoveHorizontalPadding = true}: AutoUpdateTimeProps) {
    const {translate, getLocalDateFromDatetime, dateFnsLocale} = useLocalize();
    const styles = useThemeStyles();

    const [, setTick] = useState(0);
    const minuteRef = useRef(new Date().getMinutes());
    const currentUserLocalTime = getLocalDateFromDatetime(undefined, timezone.selected);
    const timezoneName = timezone.selected ? DateUtils.getZoneAbbreviation(currentUserLocalTime, timezone.selected) : '';

    useEffect(() => {
        const interval = setInterval(() => {
            if (new Date().getMinutes() === minuteRef.current) {
                return;
            }
            setTick((t) => t + 1);
            minuteRef.current = new Date().getMinutes();
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={[styles.w100, styles.detailsPageSectionContainer]}>
            <MenuItemWithTopDescription
                style={shouldRemoveHorizontalPadding ? [styles.ph0] : undefined}
                title={`${DateUtils.formatToLocalTime(currentUserLocalTime, dateFnsLocale)} ${timezoneName}`}
                description={translate('detailsPage.localTime')}
                interactive={false}
            />
        </View>
    );
}

export default AutoUpdateTime;
