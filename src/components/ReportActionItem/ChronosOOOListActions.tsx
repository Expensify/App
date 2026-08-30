import Button from '@components/ButtonComposed';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';
import {getOriginalMessage} from '@libs/ReportActionsUtils';

import {removeEvent} from '@userActions/Chronos';

import CONST from '@src/CONST';
import type ReportAction from '@src/types/onyx/ReportAction';

import React from 'react';
import {View} from 'react-native';

type ChronosOOOListActionsProps = {
    /** The ID of the report */
    reportID: string | undefined;

    /** All the data of the action */
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.CHRONOS_OOO_LIST>;
};

function ChronosOOOListActions({reportID, action}: ChronosOOOListActionsProps) {
    const styles = useThemeStyles();

    const {translate, getLocalDateFromDatetime, dateFnsLocale} = useLocalize();

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
                                          count: event.lengthInDays,
                                          date: DateUtils.formatToLongDateWithWeekday(end, dateFnsLocale),
                                      })
                                    : translate(
                                          'chronos.oooEventSummaryPartialDay',
                                          event.summary,
                                          `${DateUtils.formatToLocalTime(translate, start)} - ${DateUtils.formatToLocalTime(translate, end)}`,
                                          DateUtils.formatToLongDateWithWeekday(end, dateFnsLocale),
                                      )}
                            </Text>
                            <Button
                                size={CONST.BUTTON_SIZE.SMALL}
                                style={styles.pl2}
                                // Restores the 12px horizontal padding from the legacy implementation.
                                innerStyles={styles.ph3}
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
