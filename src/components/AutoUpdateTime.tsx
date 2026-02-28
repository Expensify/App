/**
 * Displays the user's local time and updates it every minute.
 * The time auto-update logic is extracted to this component to avoid re-rendering a more complex component, e.g. DetailsPage.
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import type {Timezone} from '@src/types/onyx/PersonalDetails';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';

type AutoUpdateTimeProps = {
    /** Timezone of the user from their personal details */
    timezone: Timezone;
};

function AutoUpdateTime({timezone}: AutoUpdateTimeProps) {
    const {translate, getLocalDateFromDatetime} = useLocalize();
    const styles = useThemeStyles();
    /** @returns Returns the locale Date object */
    const getCurrentUserLocalTime = useCallback(() => getLocalDateFromDatetime(undefined, timezone.selected), [getLocalDateFromDatetime, timezone.selected]);

    const [currentUserLocalTime, setCurrentUserLocalTime] = useState(getCurrentUserLocalTime);
    const minuteRef = useRef(new Date().getMinutes());
    const timezoneName = useMemo(() => {
        if (timezone.selected) {
            return DateUtils.getZoneAbbreviation(currentUserLocalTime, timezone.selected);
        }
        return '';
    }, [currentUserLocalTime, timezone.selected]);

    useEffect(() => {
        // If any of the props that getCurrentUserLocalTime depends on change, we want to update the displayed time immediately
        setCurrentUserLocalTime(getCurrentUserLocalTime());

        // Also, if the user leaves this page open, we want to make sure the displayed time is updated every minute when the clock changes
        // To do this we create an interval to check if the minute has changed every second and update the displayed time if it has
        const interval = setInterval(() => {
            const currentMinute = new Date().getMinutes();
            if (currentMinute !== minuteRef.current) {
                setCurrentUserLocalTime(getCurrentUserLocalTime());
                minuteRef.current = currentMinute;
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [getCurrentUserLocalTime]);

    return (
        <View style={[styles.w100, styles.detailsPageSectionContainer]}>
            <MenuItemWithTopDescription
                style={[styles.ph0]}
                title={`${DateUtils.formatToLocalTime(currentUserLocalTime)} ${timezoneName}`}
                description={translate('detailsPage.localTime')}
                interactive={false}
            />
        </View>
    );
}

export default AutoUpdateTime;
