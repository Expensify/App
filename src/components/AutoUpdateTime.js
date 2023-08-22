/**
 * Displays the user's local time and updates it every minute.
 * The time auto-update logic is extracted to this component to avoid re-rendering a more complex component, e.g. DetailsPage.
 */
import {View} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import DateUtils from '../libs/DateUtils';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Text from './Text';

const propTypes = {
    /** Timezone of the user from their personal details */
    timezone: PropTypes.shape({
        /** Value of selected timezone */
        selected: PropTypes.string,

        /** Whether timezone is automatically set */
        automatic: PropTypes.bool,
    }).isRequired,
    ...withLocalizePropTypes,
};

function AutoUpdateTime(props) {
    /**
     * @returns {moment} Returns the locale moment object
     */
    const getCurrentUserLocalTime = useCallback(
        () => DateUtils.getLocalDateFromDatetime(props.preferredLocale, null, props.timezone.selected),
        [props.preferredLocale, props.timezone.selected],
    );

    const [currentUserLocalTime, setCurrentUserLocalTime] = useState(getCurrentUserLocalTime);
    const minuteRef = useRef(new Date().getMinutes());
    const timezoneName = useMemo(() => DateUtils.getZoneAbbreviation(currentUserLocalTime, props.timezone.selected), [currentUserLocalTime, props.timezone.selected]);

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

AutoUpdateTime.propTypes = propTypes;
AutoUpdateTime.displayName = 'AutoUpdateTime';
export default withLocalize(AutoUpdateTime);
