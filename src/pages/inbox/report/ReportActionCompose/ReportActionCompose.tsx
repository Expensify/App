import React from 'react';

import type {SuggestionsRef} from './ComposerContext';

import ComposerActionMenu from './ComposerActionMenu';
import ComposerBox from './ComposerBox';
import ComposerContainer from './ComposerContainer';
import ComposerDefaultFooter from './ComposerDefaultFooter';
import ComposerDropZone from './ComposerDropZone';
import ComposerEditingButtons from './ComposerEditingButtons';
import ComposerEmojiPicker from './ComposerEmojiPicker';
import ComposerExceededLength from './ComposerExceededLength';
import ComposerFooter from './ComposerFooter';
import ComposerImportedState from './ComposerImportedState';
import ComposerInput from './ComposerInput';
import ComposerInputArea from './ComposerInputArea';
import ComposerLocalTime from './ComposerLocalTime';
import ComposerPlaceholder from './ComposerPlaceholder';
import ComposerProvider from './ComposerProvider';
import ComposerSendButton from './ComposerSendButton';
import ComposerTypingIndicator from './ComposerTypingIndicator';

type ReportActionComposeProps = {
    /** Report ID */
    reportID: string;
};

function ReportActionCompose({reportID}: ReportActionComposeProps) {
    return (
        <ComposerProvider reportID={reportID}>
            <ComposerInputArea>
                <ComposerDefaultFooter />
            </ComposerInputArea>
        </ComposerProvider>
    );
}

function EditOnlyReportActionCompose({reportID}: ReportActionComposeProps) {
    return (
        <ComposerProvider reportID={reportID}>
            <ComposerInputArea />
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
ReportActionCompose.TypingIndicator = ComposerTypingIndicator;
ReportActionCompose.ExceededLength = ComposerExceededLength;
ReportActionCompose.Layout = ComposerInputArea;
ReportActionCompose.Placeholder = ComposerPlaceholder;
ReportActionCompose.InputArea = ComposerInputArea;
ReportActionCompose.DefaultFooter = ComposerDefaultFooter;
ReportActionCompose.EditOnly = EditOnlyReportActionCompose;

export default ReportActionCompose;
export type {SuggestionsRef, ReportActionComposeProps};
