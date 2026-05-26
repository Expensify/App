import React from 'react';
import AgentZeroAwareTypingIndicator from './AgentZeroAwareTypingIndicator';
import ComposerActionMenu from './ComposerActionMenu';
import ComposerBox from './ComposerBox';
import ComposerContainer from './ComposerContainer';
import type {SuggestionsRef} from './ComposerContext';
import ComposerDefaultFooter from './ComposerDefaultFooter';
import ComposerDropZone from './ComposerDropZone';
import ComposerEditingButtons from './ComposerEditingButtons';
import ComposerEmojiPicker from './ComposerEmojiPicker';
import ComposerExceededLength from './ComposerExceededLength';
import ComposerFooter from './ComposerFooter';
import ComposerImportedState from './ComposerImportedState';
import ComposerInput from './ComposerInput';
import ComposerInputArea from './ComposerInputArea';
import ComposerLayout from './ComposerLayout';
import ComposerLocalTime from './ComposerLocalTime';
import ComposerProvider from './ComposerProvider';
import ComposerSendButton from './ComposerSendButton';
import EditOnlyReportActionCompose from './EditOnlyReportActionCompose';
import type {ReportActionComposeProps} from './types';

function ReportActionCompose({reportID}: ReportActionComposeProps) {
    return (
        <ComposerProvider reportID={reportID}>
            <ComposerLayout reportID={reportID}>
                <ComposerInputArea reportID={reportID} />
            </ComposerLayout>
            <ComposerDefaultFooter reportID={reportID} />
        </ComposerProvider>
    );
}

ReportActionCompose.LocalTime = ComposerLocalTime;
ReportActionCompose.Container = ComposerContainer;
ReportActionCompose.ImportedState = ComposerImportedState;
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
ReportActionCompose.Layout = ComposerLayout;
ReportActionCompose.InputArea = ComposerInputArea;
ReportActionCompose.DefaultFooter = ComposerDefaultFooter;
ReportActionCompose.EditOnly = EditOnlyReportActionCompose;

export default ReportActionCompose;
export type {SuggestionsRef, ReportActionComposeProps};
