import React from 'react';
import {View} from 'react-native';
import OfflineIndicator from '@components/OfflineIndicator';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import AgentZeroAwareTypingIndicator from './AgentZeroAwareTypingIndicator';
import ComposerActionMenu from './ComposerActionMenu';
import ComposerBox from './ComposerBox';
import type {SuggestionsRef} from './ComposerContext';
import ComposerDropZone from './ComposerDropZone';
import ComposerEmojiPicker from './ComposerEmojiPicker';
import ComposerExceededLength from './ComposerExceededLength';
import ComposerFooter from './ComposerFooter';
import ComposerImportedState from './ComposerImportedState';
import ComposerInput from './ComposerInput';
import ComposerLocalTime from './ComposerLocalTime';
import ComposerProvider from './ComposerProvider';
import ComposerSendButton from './ComposerSendButton';
import type {ComposerRef} from './ComposerWithSuggestions/ComposerWithSuggestions';

type ReportActionComposeProps = {
    reportID: string;
};

function ReportActionComposeInner({reportID}: ReportActionComposeProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);

    if (!report) {
        return null;
    }

    return (
        <View style={[isComposerFullSize && styles.chatItemFullComposeRow]}>
            <ComposerLocalTime reportID={reportID} />
            <View style={isComposerFullSize ? styles.flex1 : {}}>
                <ComposerDropZone reportID={reportID}>
                    <ComposerBox reportID={reportID}>
                        <ComposerActionMenu reportID={reportID} />
                        <ComposerInput reportID={reportID} />
                        <ComposerEmojiPicker reportID={reportID} />
                        <ComposerSendButton />
                    </ComposerBox>
                </ComposerDropZone>
                <ComposerFooter>
                    {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
                    <AgentZeroAwareTypingIndicator reportID={reportID} />
                    <ComposerExceededLength />
                </ComposerFooter>
                <ComposerImportedState />
            </View>
        </View>
    );
}

function ReportActionCompose({reportID}: ReportActionComposeProps) {
    return (
        <ComposerProvider reportID={reportID}>
            <ReportActionComposeInner reportID={reportID} />
        </ComposerProvider>
    );
}

export default ReportActionCompose;
export type {SuggestionsRef, ComposerRef, ReportActionComposeProps};
