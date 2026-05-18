import React from 'react';
import {View} from 'react-native';
import OfflineIndicator from '@components/OfflineIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getReportOfflinePendingActionAndErrors} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AgentZeroAwareTypingIndicator from './AgentZeroAwareTypingIndicator';
import ComposerActionMenu from './ComposerActionMenu';
import ComposerBox from './ComposerBox';
import {useComposerEditState} from './ComposerContext';
import type {SuggestionsRef} from './ComposerContext';
import ComposerDropZone from './ComposerDropZone';
import ComposerEditingButtons from './ComposerEditingButtons';
import ComposerEmojiPicker from './ComposerEmojiPicker';
import ComposerExceededLength from './ComposerExceededLength';
import ComposerFooter from './ComposerFooter';
import ComposerImportedState from './ComposerImportedState';
import ComposerInput from './ComposerInput';
import ComposerLocalTime from './ComposerLocalTime';
import ComposerProvider from './ComposerProvider';
import ComposerSendButton from './ComposerSendButton';

type ReportActionComposeProps = {
    reportID: string;
};

function ComposerInner({reportID}: ReportActionComposeProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isEditingInComposer} = useComposerEditState();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const {reportPendingAction: pendingAction} = getReportOfflinePendingActionAndErrors(report);

    return (
        <View
            testID={CONST.COMPOSER.TEST_ID.REPORT_ACTION_COMPOSE}
            style={[isComposerFullSize && styles.chatItemFullComposeRow]}
        >
            <Composer.LocalTime reportID={reportID} />
            <View style={isComposerFullSize ? styles.flex1 : {}}>
                <OfflineWithFeedback
                    shouldDisableOpacity
                    pendingAction={pendingAction}
                    style={isComposerFullSize ? styles.chatItemFullComposeRow : {}}
                    contentContainerStyle={isComposerFullSize ? styles.flex1 : {}}
                >
                    <Composer.DropZone reportID={reportID}>
                        <Composer.Box reportID={reportID}>
                            {isEditingInComposer ? <Composer.EditingButtons reportID={reportID} /> : <Composer.ActionMenu reportID={reportID} />}
                            <Composer.Input reportID={reportID} />
                            <Composer.EmojiPicker reportID={reportID} />
                            <Composer.SendButton reportID={reportID} />
                        </Composer.Box>
                    </Composer.DropZone>
                    <Composer.Footer>
                        {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
                        <Composer.TypingIndicator reportID={reportID} />
                        <Composer.ExceededLength />
                    </Composer.Footer>
                </OfflineWithFeedback>
                <Composer.ImportedState />
            </View>
        </View>
    );
}

function Composer({reportID}: ReportActionComposeProps) {
    return (
        <ComposerProvider reportID={reportID}>
            <ComposerInner reportID={reportID} />
        </ComposerProvider>
    );
}

Composer.LocalTime = ComposerLocalTime;
Composer.DropZone = ComposerDropZone;
Composer.Box = ComposerBox;
Composer.ActionMenu = ComposerActionMenu;
Composer.Input = ComposerInput;
Composer.EmojiPicker = ComposerEmojiPicker;
Composer.SendButton = ComposerSendButton;
Composer.EditingButtons = ComposerEditingButtons;
Composer.Footer = ComposerFooter;
Composer.TypingIndicator = AgentZeroAwareTypingIndicator;
Composer.ExceededLength = ComposerExceededLength;
Composer.ImportedState = ComposerImportedState;

export default Composer;
export type {SuggestionsRef, ReportActionComposeProps};
