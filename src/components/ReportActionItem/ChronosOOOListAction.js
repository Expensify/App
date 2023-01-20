import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import moment from 'moment';
import Text from '../Text';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Button from '../Button';
import * as Chronos from '../../libs/actions/Chronos';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';

const datePropTypes = {
    /** The full date string */
    date: PropTypes.string.isRequired,

    /** The timezone that the date is in (it should already be in the users timezone) */
    timezone: PropTypes.string.isRequired,
};

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

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
    const event = props.event;
    const start = new moment(event.start.date);
    const end = new moment(event.end.date);
    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.pt, styles.ml18]}>
            {event.lengthInDays > 0 ? (
                <Text>
                    {event.summary}
                    {' '}
                    {start.format('dddd MMM Do, YYYY')}
                    {' for '}
                    {event.lengthInDays}
                    {event.lengthInDays === 1 ? ' day' : 'days'}
                    {' until '}
                    {end.format('dddd MMM Do, YYYY')}
                </Text>
            ) : (
                <Text>
                    {event.summary}
                    {' from '}
                    {start.format('h:mma')}
                    {' - '}
                    {end.format('h:mma')}
                    {' on '}
                    {start.format('dddd MMM Do, YYYY')}
                </Text>
            )}
            <Button
                small
                style={[styles.pl2]}
                onPress={() => Chronos.removeEvent(event.id, props.action, props.events)}
                ContentComponent={() => (
                    <Text style={styles.buttonSmallText}>
                        {props.translate('common.remove')}
                    </Text>
                )}
            />
        </View>
    );
};

ChronosOOOListAction.propTypes = propTypes;
ChronosOOOListAction.displayName = 'ChronosOOOListAction';

export default withLocalize(ChronosOOOListAction);
