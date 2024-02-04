import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import * as Chronos from '@userActions/Chronos';
import type {OriginalMessageChronosOOOList} from '@src/types/onyx/OriginalMessage';
import type {ReportActionBase} from '@src/types/onyx/ReportAction';

type ChronosOOOListActionsProps = {
    /** The ID of the report */
    reportID: string;

    /** All the data of the action */
    action: ReportActionBase & OriginalMessageChronosOOOList;
};

function ChronosOOOListActions({reportID, action}: ChronosOOOListActionsProps) {
    const styles = useThemeStyles();

    const {translate, preferredLocale} = useLocalize();

    const events = action.originalMessage?.events ?? [];

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
                    const start = DateUtils.getLocalDateFromDatetime(preferredLocale, event?.start?.date ?? '');
                    const end = DateUtils.getLocalDateFromDatetime(preferredLocale, event?.end?.date ?? '');
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
                                onPress={() => Chronos.removeEvent(reportID, action.reportActionID, event.id, events)}
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

ChronosOOOListActions.displayName = 'ChronosOOOListActions';

export default ChronosOOOListActions;
