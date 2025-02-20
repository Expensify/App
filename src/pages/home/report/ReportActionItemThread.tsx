import React from 'react';
import type {GestureResponderEvent} from 'react-native';
import {View} from 'react-native';
import MultipleAvatars from '@components/MultipleAvatars';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToAndOpenChildReport} from '@libs/actions/Report';
import Timing from '@libs/actions/Timing';
import Performance from '@libs/Performance';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

type ReportActionItemThreadProps = {
    /** List of participant icons for the thread */
    icons: Icon[];

    /** Number of comments under the thread */
    numberOfReplies: number;

    /** Time of the most recent reply */
    mostRecentReply: string;

    /** ID of child thread report */
    childReportID: string;

    /** Whether the thread item / message is being hovered */
    isHovered: boolean;

    /** Whether the thread item / message is being actived */
    isActive?: boolean;

    /** The function that should be called when the thread is LongPressed or right-clicked */
    onSecondaryInteraction: (event: GestureResponderEvent | MouseEvent) => void;
};

function ReportActionItemThread({numberOfReplies, icons, mostRecentReply, childReportID, isHovered, onSecondaryInteraction, isActive}: ReportActionItemThreadProps) {
    const styles = useThemeStyles();

    const {translate, datetimeToCalendarTime} = useLocalize();

    const numberOfRepliesText = numberOfReplies > CONST.MAX_THREAD_REPLIES_PREVIEW ? `${CONST.MAX_THREAD_REPLIES_PREVIEW}+` : `${numberOfReplies}`;
    const replyText = numberOfReplies === 1 ? translate('threads.reply') : translate('threads.replies');

    const timeStamp = datetimeToCalendarTime(mostRecentReply, false);

    return (
        <View style={[styles.chatItemMessage]}>
            <PressableWithSecondaryInteraction
                onPress={() => {
                    Performance.markStart(CONST.TIMING.OPEN_REPORT_THREAD);
                    Timing.start(CONST.TIMING.OPEN_REPORT_THREAD);
                    navigateToAndOpenChildReport(childReportID);
                }}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={`${numberOfReplies} ${replyText}`}
                onSecondaryInteraction={onSecondaryInteraction}
            >
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2]}>
                    <MultipleAvatars
                        size={CONST.AVATAR_SIZE.SMALL}
                        icons={icons}
                        shouldStackHorizontally
                        isHovered={isHovered}
                        isActive={isActive}
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

ReportActionItemThread.displayName = 'ReportActionItemThread';

export default ReportActionItemThread;
