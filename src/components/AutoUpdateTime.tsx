/**
 * Displays the user's local time and updates it every minute.
 * The time auto-update logic is extracted to this component to avoid re-rendering a more complex component, e.g. DetailsPage.
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import DateUtils from '@libs/DateUtils';
import useThemeStyles from '@styles/useThemeStyles';
import {Timezone} from '@src/types/onyx/PersonalDetails';
import Text from './Text';
import withLocalize, {WithLocalizeProps} from './withLocalize';

type AutoUpdateTimeProps = WithLocalizeProps & {
    /** Timezone of the user from their personal details */
    timezone: Timezone;
};

function AutoUpdateTime(props: AutoUpdateTimeProps) {
    const styles = useThemeStyles();
    /**
     * @returns {Date} Returns the locale Date object
     */
    const getCurrentUserLocalTime = useCallback(
        () => DateUtils.getLocalDateFromDatetime(props.preferredLocale, undefined, props.timezone.selected),
        [props.preferredLocale, props.timezone.selected],
    );

    const [currentUserLocalTime, setCurrentUserLocalTime] = useState(getCurrentUserLocalTime);
    const minuteRef = useRef(new Date().getMinutes());
    const timezoneName = useMemo(() => {
        if (props.timezone.selected) {
            return DateUtils.getZoneAbbreviation(currentUserLocalTime, props.timezone.selected);
        }
        return '';
    }, [currentUserLocalTime, props.timezone.selected]);

    useEffect(() => {
        // If the any of the props that getCurrentUserLocalTime depends on change, we want to update the displayed time immediately
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
        <View style={[styles.mb6, styles.detailsPageSectionContainer]}>
            <Text
                style={[styles.textLabelSupporting, styles.mb1]}
                numberOfLines={1}
            >
                {props.translate('detailsPage.localTime')}
            </Text>
            <Text numberOfLines={1}>
                {DateUtils.formatToLocalTime(currentUserLocalTime)} {timezoneName}
            </Text>
        </View>
    );
}

AutoUpdateTime.displayName = 'AutoUpdateTime';
export default withLocalize(AutoUpdateTime);
