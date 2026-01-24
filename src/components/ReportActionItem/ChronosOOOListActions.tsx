import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import {getOriginalMessage} from '@libs/ReportActionsUtils';
import {removeEvent} from '@userActions/Chronos';
import type CONST from '@src/CONST';
import type ReportAction from '@src/types/onyx/ReportAction';

type ChronosOOOListActionsProps = {
    /** The ID of the report */
    reportID: string | undefined;

    /** All the data of the action */
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.CHRONOS_OOO_LIST>;
};

function ChronosOOOListActions({reportID, action}: ChronosOOOListActionsProps) {
    const styles = useThemeStyles();

    const {translate, getLocalDateFromDatetime} = useLocalize();

    const events = getOriginalMessage(action)?.events ?? [];

    if (!events.length) {
        return (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.ml18]}>
                <Text>You haven&apos;t created any events</Text>
            </View>
        );
    }

    return (
        <OfflineWithFeedback pendingAction={action.pendingAction}>
            <View style={styles.chatItemMessage}>
                {events.map((event) => {
                    const start = getLocalDateFromDatetime(event?.start?.date ?? '');
                    const end = getLocalDateFromDatetime(event?.end?.date ?? '');
                    return (
                        <View
                            key={event.id}
                            style={[styles.flexRow, styles.ml18, styles.pr4, styles.alignItemsCenter]}
                        >
                            <Text style={styles.flexShrink1}>
                                {event.lengthInDays > 0
                                    ? translate('chronos.oooEventSummaryFullDay', {
                                          summary: event.summary,
                                          dayCount: event.lengthInDays,
                                          date: DateUtils.formatToLongDateWithWeekday(end),
                                      })
                                    : translate('chronos.oooEventSummaryPartialDay', {
                                          summary: event.summary,
                                          timePeriod: `${DateUtils.formatToLocalTime(start)} - ${DateUtils.formatToLocalTime(end)}`,
                                          date: DateUtils.formatToLongDateWithWeekday(end),
                                      })}
                            </Text>
                            <Button
                                small
                                style={styles.pl2}
                                onPress={() => removeEvent(reportID, action.reportActionID, event.id, events)}
                            >
                                <Text style={styles.buttonSmallText}>{translate('common.remove')}</Text>
                            </Button>
                        </View>
                    );
                })}
            </View>
        </OfflineWithFeedback>
    );
}

export default ChronosOOOListActions;
