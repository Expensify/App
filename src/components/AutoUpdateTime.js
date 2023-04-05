/**
 * Displays the user's local time and updates it every minute.
 * The time auto-update logic is extracted to this component to avoid re-rendering a more complex component, e.g. DetailsPage.
 */
import {View} from 'react-native';
import {useState, useCallback} from 'react';
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
    const [currentUserLocalTime, setCurrentUserLocalTime] = useState(getCurrentUserLocalTime());

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

    /**
     * @returns {string} Returns the timezone name in string, e.g.: GMT +07
     */
    const getTimezoneName = useCallback(() => {
        // With non-GMT timezone, moment.zoneAbbr() will return the name of that timezone, so we can use it directly.
        if (Number.isNaN(Number(currentUserLocalTime.zoneAbbr()))) {
            return currentUserLocalTime.zoneAbbr();
        }

        // With GMT timezone, moment.zoneAbbr() will return a number, so we need to display it as GMT {abbreviations} format, e.g.: GMT +07
        return `GMT ${currentUserLocalTime.zoneAbbr()}`;
    }, [currentUserLocalTime]);

    /**
     * Update the user's local time at the top of every minute
     */
    const updateCurrentTime = useCallback(() => {
        let timer = null;
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        const millisecondsUntilNextMinute = (60 - currentUserLocalTime.seconds()) * 1000;
        timer = setTimeout(() => {
            setCurrentUserLocalTime(getCurrentUserLocalTime());
        }, millisecondsUntilNextMinute);
    }, [currentUserLocalTime, getCurrentUserLocalTime]);

    return (
        <View style={[styles.mb6, styles.detailsPageSectionContainer]}>
            <Text style={[styles.textLabelSupporting, styles.mb1]} numberOfLines={1}>
                {props.translate('detailsPage.localTime')}
            </Text>
            <Text numberOfLines={1}>
                {currentUserLocalTime.format('LT')}
                {' '}
                {getTimezoneName()}
            </Text>
        </View>
    );
}

// class AutoUpdateTime extends PureComponent {
//     constructor(props) {
//         this.updateCurrentTime = this.updateCurrentTime.bind(this);
//     }

//     componentDidMount() {
//         this.updateCurrentTime();
//     }

//     componentDidUpdate() {
//         // Make sure the interval is up to date every time the component updates
//         this.updateCurrentTime();
//     }

//     componentWillUnmount() {
//         clearTimeout(this.timer);
//     }

//     /**
//      * Update the user's local time at the top of every minute
//      */
//     updateCurrentTime() {
//         if (this.timer) {
//             clearTimeout(this.timer);
//             this.timer = null;
//         }
//         const millisecondsUntilNextMinute = (60 - this.state.currentUserLocalTime.seconds()) * 1000;
//         this.timer = setTimeout(() => {
//             this.setState({
//                 currentUserLocalTime: this.getCurrentUserLocalTime(),
//             });
//         }, millisecondsUntilNextMinute);
//     }

// }

AutoUpdateTime.propTypes = propTypes;
export default withLocalize(AutoUpdateTime);
