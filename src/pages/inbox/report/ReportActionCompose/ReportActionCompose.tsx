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
    /** Report ID */
    reportID: string;
};

type ReportActionComposerContainerProps = ReportActionComposeProps & {
    children: React.ReactNode;
};

function ReportActionComposerContainer({reportID, children}: ReportActionComposerContainerProps) {
    const styles = useThemeStyles();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const {reportPendingAction: pendingAction} = getReportOfflinePendingActionAndErrors(report);

    return (
        <OfflineWithFeedback
            shouldDisableOpacity
            pendingAction={pendingAction}
            style={isComposerFullSize ? styles.chatItemFullComposeRow : {}}
            contentContainerStyle={isComposerFullSize ? styles.flex1 : {}}
        >
            {children}
        </OfflineWithFeedback>
    );
}

function ReportActionComposeLayout({reportID, children}: ReportActionComposeProps & {children: React.ReactNode}) {
    const styles = useThemeStyles();
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);

    return (
        <View
            testID={CONST.COMPOSER.TEST_ID.REPORT_ACTION_COMPOSE}
            style={[isComposerFullSize && styles.chatItemFullComposeRow]}
        >
            <ReportActionCompose.LocalTime reportID={reportID} />
            <View style={isComposerFullSize ? styles.flex1 : {}}>
                <ReportActionCompose.Container reportID={reportID}>{children}</ReportActionCompose.Container>
                <ReportActionCompose.ImportedState />
            </View>
        </View>
    );
}

function ReportActionComposeInputArea({reportID}: ReportActionComposeProps) {
    const {isEditingInComposer} = useComposerEditState();

    return (
        <ReportActionCompose.DropZone reportID={reportID}>
            <ReportActionCompose.Box reportID={reportID}>
                {isEditingInComposer ? <ReportActionCompose.EditingButtons reportID={reportID} /> : <ReportActionCompose.ActionMenu reportID={reportID} />}
                <ReportActionCompose.Input reportID={reportID} />
                <ReportActionCompose.EmojiPicker reportID={reportID} />
                <ReportActionCompose.SendButton reportID={reportID} />
            </ReportActionCompose.Box>
        </ReportActionCompose.DropZone>
    );
}

function ReportActionComposeDefaultFooter({reportID}: ReportActionComposeProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <ReportActionCompose.Footer>
            {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
            <ReportActionCompose.TypingIndicator reportID={reportID} />
            <ReportActionCompose.ExceededLength />
        </ReportActionCompose.Footer>
    );
}

function ReportActionComposeWithProvider({reportID, children}: ReportActionComposeProps & {children: React.ReactNode}) {
    return (
        <ComposerProvider reportID={reportID}>
            <ReportActionComposeLayout reportID={reportID}>{children}</ReportActionComposeLayout>
        </ComposerProvider>
    );
}

function ReportActionCompose({reportID}: ReportActionComposeProps) {
    return (
        <ReportActionComposeWithProvider reportID={reportID}>
            <ReportActionComposeInputArea reportID={reportID} />
            <ReportActionComposeDefaultFooter reportID={reportID} />
        </ReportActionComposeWithProvider>
    );
}

function EditOnlyReportActionComposer({reportID}: ReportActionComposeProps) {
    return (
        <ReportActionComposeWithProvider reportID={reportID}>
            <ReportActionComposeInputArea reportID={reportID} />
        </ReportActionComposeWithProvider>
    );
}

ReportActionCompose.LocalTime = ComposerLocalTime;
ReportActionCompose.Container = ReportActionComposerContainer;
ReportActionCompose.DropZone = ComposerDropZone;
ReportActionCompose.Box = ComposerBox;
ReportActionCompose.ActionMenu = ComposerActionMenu;
ReportActionCompose.Input = ComposerInput;
ReportActionCompose.EmojiPicker = ComposerEmojiPicker;
ReportActionCompose.SendButton = ComposerSendButton;
ReportActionCompose.EditingButtons = ComposerEditingButtons;
ReportActionCompose.Footer = ComposerFooter;
ReportActionCompose.TypingIndicator = AgentZeroAwareTypingIndicator;
ReportActionCompose.ExceededLength = ComposerExceededLength;
ReportActionCompose.ImportedState = ComposerImportedState;

const ReportActionComposer = ReportActionCompose;

export default ReportActionCompose;
export {EditOnlyReportActionComposer, ReportActionComposer};
export type {SuggestionsRef, ReportActionComposeProps};
