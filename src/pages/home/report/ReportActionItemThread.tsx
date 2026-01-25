import React from 'react';
import type {GestureResponderEvent} from 'react-native';
import {View} from 'react-native';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToAndOpenChildReport} from '@libs/actions/Report';
import Timing from '@libs/actions/Timing';
import Performance from '@libs/Performance';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

type ReportActionItemThreadProps = {
    /** Number of comments under the thread */
    numberOfReplies: number;

    /** Time of the most recent reply */
    mostRecentReply: string;

    /** ID of current report */
    reportID: string | undefined;

    /** All the data of the action item */
    reportAction: ReportAction;

    /** Whether the thread item / message is being hovered */
    isHovered: boolean;

    /** Whether the thread item / message is active */
    isActive?: boolean;

    /** Account IDs used for avatars */
    accountIDs: number[];

    /** The function that should be called when the thread is LongPressed or right-clicked */
    onSecondaryInteraction: (event: GestureResponderEvent | MouseEvent) => void;
};

function ReportActionItemThread({numberOfReplies, accountIDs, mostRecentReply, reportID, reportAction, isHovered, onSecondaryInteraction, isActive}: ReportActionItemThreadProps) {
    const styles = useThemeStyles();

    const {translate, datetimeToCalendarTime} = useLocalize();

    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportAction.childReportID}`, {canBeMissing: true});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});

    const numberOfRepliesText = numberOfReplies > CONST.MAX_THREAD_REPLIES_PREVIEW ? `${CONST.MAX_THREAD_REPLIES_PREVIEW}+` : `${numberOfReplies}`;
    const replyText = numberOfReplies === 1 ? translate('threads.reply') : translate('threads.replies');

    const timeStamp = datetimeToCalendarTime(mostRecentReply, false);

    return (
        <View style={[styles.chatItemMessage]}>
            <PressableWithSecondaryInteraction
                onPress={() => {
                    Performance.markStart(CONST.TIMING.OPEN_REPORT_THREAD);
                    Timing.start(CONST.TIMING.OPEN_REPORT_THREAD);
                    navigateToAndOpenChildReport(childReport, reportAction, report);
                }}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={`${numberOfReplies} ${replyText}`}
                onSecondaryInteraction={onSecondaryInteraction}
                sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_ITEM_THREAD}
            >
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2]}>
                    <ReportActionAvatars
                        size={CONST.AVATAR_SIZE.SMALL}
                        accountIDs={accountIDs}
                        horizontalStacking={{
                            isHovered,
                            isActive,
                            sort: CONST.REPORT_ACTION_AVATARS.SORT_BY.NAME,
                        }}
                        isInReportAction
                    />
                    <View style={[styles.flex1, styles.flexRow, styles.lh140Percent, styles.alignItemsEnd]}>
                        <Text
                            style={[styles.link, styles.ml2, styles.h4, styles.noWrap, styles.userSelectNone]}
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                        >
                            {`${numberOfRepliesText} ${replyText}`}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={[styles.ml2, styles.textMicroSupporting, styles.flex1, styles.userSelectNone]}
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                        >
                            {timeStamp}
                        </Text>
                    </View>
                </View>
            </PressableWithSecondaryInteraction>
        </View>
    );
}

export default ReportActionItemThread;
