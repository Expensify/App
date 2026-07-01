import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import type {GestureResponderEvent} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToAndOpenChildReport} from '@libs/actions/Report';
import {getParticipantsPersonalDetails} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

type ReportActionItemThreadProps = {
    /** The current report */
    report: OnyxEntry<Report>;

    /** All the data of the action item */
    reportAction: ReportAction;

    /** Whether the thread item / message is being hovered */
    isHovered: boolean;

    /** The function that should be called when the thread is LongPressed or right-clicked */
    onSecondaryInteraction: (event: GestureResponderEvent | MouseEvent) => void;

    /** True when this message is edited inline on a wide layout; right-aligns the reaction row under the composer. */
    isEditingInline: boolean;

    /** Whether the thread item / message is active */
    isActive?: boolean;
};

function ReportActionItemThread({report, reportAction, isHovered, onSecondaryInteraction, isEditingInline, isActive}: ReportActionItemThreadProps) {
    const styles = useThemeStyles();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {translate, datetimeToCalendarTime} = useLocalize();
    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportAction.childReportID}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const personalDetails = usePersonalDetails();

    const numberOfReplies = reportAction.childVisibleActionCount ?? 0;
    const accountIDs =
        reportAction.childOldestFourAccountIDs
            ?.split(',')
            .map((accountID) => Number(accountID))
            .filter((accountID): accountID is number => typeof accountID === 'number') ?? [];
    const mostRecentReply = `${reportAction.childLastVisibleActionCreated}`;

    const numberOfRepliesText = numberOfReplies > CONST.MAX_THREAD_REPLIES_PREVIEW ? `${CONST.MAX_THREAD_REPLIES_PREVIEW}+` : `${numberOfReplies}`;
    const replyText = numberOfReplies === 1 ? translate('threads.reply') : translate('threads.replies');

    const timeStamp = datetimeToCalendarTime(mostRecentReply, false);
    const wrapperStyle = isEditingInline ? styles.chatItemReactionsDraftRight : {};

    return (
        <View style={wrapperStyle}>
            <View style={[styles.chatItemMessage]}>
                <PressableWithSecondaryInteraction
                    onPress={() => {
                        const participantsPersonalDetails = getParticipantsPersonalDetails([currentUserAccountID, Number(reportAction.actorAccountID)], personalDetails);
                        navigateToAndOpenChildReport(childReport, reportAction, report, currentUserAccountID, introSelected, betas, participantsPersonalDetails, isSelfTourViewed);
                    }}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={`${numberOfReplies} ${replyText}`}
                    onSecondaryInteraction={onSecondaryInteraction}
                    sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_ITEM_THREAD}
                >
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2]}>
                        <ReportActionAvatars
                            size={CONST.AVATAR_SIZE.X_SMALL}
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
        </View>
    );
}

export default ReportActionItemThread;
