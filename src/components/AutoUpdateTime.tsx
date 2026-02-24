/**
 * Displays the user's local time and updates it every minute.
 * The time auto-update logic is extracted to this component to avoid re-rendering a more complex component, e.g. DetailsPage.
 */
import React, {useEffect, useRef, useState} from 'react';
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
    const getCurrentUserLocalTime = () => getLocalDateFromDatetime(undefined, timezone.selected);

    const [currentUserLocalTime, setCurrentUserLocalTime] = useState(getCurrentUserLocalTime);
    const [prevTimezone, setPrevTimezone] = useState(timezone.selected);
    if (prevTimezone !== timezone.selected) {
        setPrevTimezone(timezone.selected);
        setCurrentUserLocalTime(getCurrentUserLocalTime());
    }

    const minuteRef = useRef(new Date().getMinutes());
    const timezoneName = timezone.selected ? DateUtils.getZoneAbbreviation(currentUserLocalTime, timezone.selected) : '';

    useEffect(() => {
        const interval = setInterval(() => {
            const currentMinute = new Date().getMinutes();
            if (currentMinute !== minuteRef.current) {
                setCurrentUserLocalTime(getLocalDateFromDatetime(undefined, timezone.selected));
                minuteRef.current = currentMinute;
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [getLocalDateFromDatetime, timezone.selected]);

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
