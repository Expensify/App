import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import styles from '../../styles/styles';
import Text from '../Text';
import Button from '../Button';
import * as Chronos from '../../libs/actions/Chronos';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import DateUtils from '../../libs/DateUtils';
import OfflineWithFeedback from '../OfflineWithFeedback';

const propTypes = {
    /** The ID of the report */
    reportID: PropTypes.string.isRequired,

    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    ...withLocalizePropTypes,
};

function ChronosOOOListActions(props) {
    const events = lodashGet(props.action, 'originalMessage.events', []);

    if (!events.length) {
        return (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.pt, styles.ml18]}>
                <Text>You haven&apos;t created any events</Text>
            </View>
        );
    }

    return (
        <OfflineWithFeedback pendingAction={lodashGet(props.action, 'pendingAction', null)}>
            <View style={[styles.chatItemMessage]}>
                {_.map(events, (event) => {
                    const start = DateUtils.getLocalDateFromDatetime(props.preferredLocale, lodashGet(event, 'start.date', ''));
                    const end = DateUtils.getLocalDateFromDatetime(props.preferredLocale, lodashGet(event, 'end.date', ''));
                    return (
                        <View
                            key={event.id}
                            style={[styles.flexRow, styles.pt, styles.ml18, styles.pr4, styles.alignItemsCenter]}
                        >
                            <Text style={[styles.flexShrink1]}>
                                {event.lengthInDays > 0
                                    ? props.translate('chronos.oooEventSummaryFullDay', {
                                          summary: event.summary,
                                          dayCount: event.lengthInDays,
                                          date: DateUtils.formatToLongDateWithWeekday(end),
                                      })
                                    : props.translate('chronos.oooEventSummaryPartialDay', {
                                          summary: event.summary,
                                          timePeriod: `${DateUtils.formatToLocalTime(start)} - ${DateUtils.formatToLocalTime(end)}`,
                                          date: DateUtils.formatToLongDateWithWeekday(end),
                                      })}
                            </Text>
                            <Button
                                small
                                style={[styles.pl2]}
                                onPress={() => Chronos.removeEvent(props.reportID, props.action.reportActionID, event.id, events)}
                            >
                                <Text style={styles.buttonSmallText}>{props.translate('common.remove')}</Text>
                            </Button>
                        </View>
                    );
                })}
            </View>
        </OfflineWithFeedback>
    );
}

ChronosOOOListActions.propTypes = propTypes;
ChronosOOOListActions.displayName = 'ChronosOOOListActions';

export default withLocalize(ChronosOOOListActions);
