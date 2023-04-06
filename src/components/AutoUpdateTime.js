/**
 * Displays the user's local time and updates it every minute.
 * The time auto-update logic is extracted to this component to avoid re-rendering a more complex component, e.g. DetailsPage.
 */
import {View} from 'react-native';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
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
    const getCurrentUserLocalTime = useCallback(() => (
        DateUtils.getLocalMomentFromDatetime(
            props.preferredLocale,
            null,
            props.timezone.selected,
        )
    ), [props.preferredLocale, props.timezone.selected]);

    const [currentUserLocalTime, setCurrentUserLocalTime] = useState(getCurrentUserLocalTime);
    const timerRef = useRef(null);
    const timezoneName = useMemo(() => {
        // With non-GMT timezone, moment.zoneAbbr() will return the name of that timezone, so we can use it directly.
        if (Number.isNaN(Number(currentUserLocalTime.zoneAbbr()))) {
            return currentUserLocalTime.zoneAbbr();
        }

        // With GMT timezone, moment.zoneAbbr() will return a number, so we need to display it as GMT {abbreviations} format, e.g.: GMT +07
        return `GMT ${currentUserLocalTime.zoneAbbr()}`;
    }, [currentUserLocalTime]);

    useEffect(() => {
        // If the user leaves this page open, we want to make sure the displayed time is updated every minute when the clock changes
        // To do this we set a timer on initial load and then create a new timer every time we update the time
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        const millisecondsUntilNextMinute = (60 - currentUserLocalTime.seconds()) * 1000;
        timerRef.current = setTimeout(() => {
            setCurrentUserLocalTime(getCurrentUserLocalTime());
        }, millisecondsUntilNextMinute);

        return () => {
            clearTimeout(timerRef.current);
        };
    }, [currentUserLocalTime, getCurrentUserLocalTime]);

    useEffect(() => {
        // If the preferredLocale or timezone changes, we want to update the displayed time immediately
        setCurrentUserLocalTime(getCurrentUserLocalTime());
    }, [getCurrentUserLocalTime, props.preferredLocale, props.timezone.selected]);

    return (
        <View style={[styles.mb6, styles.detailsPageSectionContainer]}>
            <Text style={[styles.textLabelSupporting, styles.mb1]} numberOfLines={1}>
                {props.translate('detailsPage.localTime')}
            </Text>
            <Text numberOfLines={1}>
                {currentUserLocalTime.format('LT')}
                {' '}
                {timezoneName}
            </Text>
        </View>
    );
}

AutoUpdateTime.propTypes = propTypes;
AutoUpdateTime.displayName = 'AutoUpdateTime';
export default withLocalize(AutoUpdateTime);
