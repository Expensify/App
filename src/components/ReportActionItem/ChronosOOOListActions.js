import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import moment from 'moment/moment';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import styles from '../../styles/styles';
import Text from '../Text';
import Button from '../Button';
import * as Chronos from '../../libs/actions/Chronos';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    ...withLocalizePropTypes,
};

const ChronosOOOListActions = (props) => {
    const events = lodashGet(props.action, 'originalMessage.events', []);

    return (
        <View>
            {_.map(events, (event) => {
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
                            onPress={() => Chronos.removeEvent(event.id, props.action, events)}
                            ContentComponent={() => (
                                <Text style={styles.buttonSmallText}>
                                    {props.translate('common.remove')}
                                </Text>
                            )}
                        />
                    </View>
                );
            })}
        </View>
    );
};

ChronosOOOListActions.propTypes = propTypes;
ChronosOOOListActions.displayName = 'ChronosOOOListActions';

export default withLocalize(ChronosOOOListActions);
