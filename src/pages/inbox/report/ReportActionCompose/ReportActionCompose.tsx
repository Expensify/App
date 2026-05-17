import React from 'react';
import AgentZeroAwareTypingIndicator from './AgentZeroAwareTypingIndicator';
import ComposerActionMenu from './ComposerActionMenu';
import ComposerBox from './ComposerBox';
import type {SuggestionsRef} from './ComposerContext';
import ComposerDropZone from './ComposerDropZone';
import ComposerEditingButtons from './ComposerEditingButtons';
import ComposerEmojiPicker from './ComposerEmojiPicker';
import ComposerExceededLength from './ComposerExceededLength';
import ComposerFooter from './ComposerFooter';
import ComposerImportedState from './ComposerImportedState';
import ComposerInput from './ComposerInput';
import ComposerLocalTime from './ComposerLocalTime';
import ComposerSendButton from './ComposerSendButton';
import EditOnlyReportActionComposer from './EditOnlyReportActionComposer';
import ReportActionComposeDefaultFooter from './ReportActionComposeDefaultFooter';
import ReportActionComposeInputArea from './ReportActionComposeInputArea';
import ReportActionComposeLayout from './ReportActionComposeLayout';
import ReportActionComposerContainer from './ReportActionComposerContainer';
import type {ReportActionComposeProps} from './ReportActionComposeTypes';
import ReportActionComposeWithProvider from './ReportActionComposeWithProvider';

function ReportActionCompose({reportID}: ReportActionComposeProps) {
    return (
        <ReportActionComposeWithProvider reportID={reportID}>
            <ReportActionComposeInputArea reportID={reportID} />
            <ReportActionComposeDefaultFooter reportID={reportID} />
        </ReportActionComposeWithProvider>
    );
}

ReportActionCompose.LocalTime = ComposerLocalTime;
ReportActionCompose.Container = ReportActionComposerContainer;
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
ReportActionCompose.Layout = ReportActionComposeLayout;
ReportActionCompose.InputArea = ReportActionComposeInputArea;
ReportActionCompose.DefaultFooter = ReportActionComposeDefaultFooter;
ReportActionCompose.WithProvider = ReportActionComposeWithProvider;
ReportActionCompose.EditOnly = EditOnlyReportActionComposer;

const ReportActionComposer = ReportActionCompose;

export default ReportActionCompose;
export {EditOnlyReportActionComposer, ReportActionComposer};
export type {SuggestionsRef, ReportActionComposeProps};
