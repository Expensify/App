import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import moment from 'moment';
import Text from '../Text';
import styles from '../../styles/styles';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';

const datePropTypes = {
    /** The full date string */
    date: PropTypes.string.isRequired,

    /** The timezone that the date is in (it should already be in the users timezone) */
    timezone: PropTypes.string.isRequired,
};

const propTypes = {
    /** The OOO event data */
    event: PropTypes.shape({
        /** The Google event ID */
        id: PropTypes.string.isRequired,

        /** The date that the event starts */
        start: PropTypes.shape(datePropTypes).isRequired,

        /** The date that the event ends */
        end: PropTypes.shape(datePropTypes).isRequired,

        /** The number of days that the event spans */
        lengthInDays: PropTypes.number.isRequired,

        /** The summary of the event */
        summary: PropTypes.string.isRequired,
    }).isRequired,

    ...withLocalizePropTypes,
};

const ChronosOOOListAction = (props) => {
    const start = new moment(props.event.start.date);
    const end = new moment(props.event.end.date);
    return (
        <View>
            {props.event.lengthInDays > 0 ? (
                <Text>
                    {props.event.summary}
                    {' '}
                    {start.format('dddd MMM Do, YYYY')}
                    {' for '}
                    {props.event.lengthInDays}
                    {props.event.lengthInDays === 1 ? ' day' : 'days'}
                    {' until '}
                    {end.format('dddd MMM Do, YYYY')}
                </Text>
            ) : (
                <Text>
                    {props.event.summary}
                    {' from '}
                    {start.format('h:mma')}
                    {' - '}
                    {end.format('h:mma')}
                    {' on '}
                    {start.format('dddd MMM Do, YYYY')}
                </Text>
            )}
        </View>
    );
};

ChronosOOOListAction.propTypes = propTypes;
ChronosOOOListAction.displayName = 'ChronosOOOListAction';

export default withLocalize(ChronosOOOListAction);
