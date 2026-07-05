import type {SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';

import getPlatform from '@libs/getPlatform';

import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';

import type {Ref} from 'react';

import React, {useImperativeHandle, useRef, useState} from 'react';

import ParticipantSearchResults from './ParticipantSearchResults';

type MoneyRequestParticipantsSelectorProps = {
    /** Callback to request parent modal to go to next step, which should be split */
    onFinish?: (value?: string, participants?: Participant[]) => void;

    /** Callback to add participants in MoneyRequestModal */
    onParticipantsAdded: (value: Participant[]) => void;

    /** Selected participants from MoneyRequestModal with login */
    participants?: Participant[] | typeof CONST.EMPTY_ARRAY;

    /** The type of IOU report, i.e. split, request, send, track */
    iouType: IOUType;

    /** The action of the IOU, i.e. create, split, move */
    action: IOUAction;

    /** Whether the IOU is workspaces only */
    isWorkspacesOnly?: boolean;

    /** Whether the destination list is restricted to Submit (submit2026) workspaces only */
    isSubmitWorkspacesOnly?: boolean;

    /** Whether this is a per diem expense request */
    isPerDiemRequest?: boolean;

    /** Whether this is a time expense request */
    isTimeRequest?: boolean;

    /** Whether this is a transaction from a credit card import */
    isTransactionFromCreditCardImport?: boolean;

    /** Whether to exclude P2P recipients (and the invite-by-email option) from the list. Used for negative amounts, which P2P chats don't support. */
    shouldExcludeP2P?: boolean;

    /** Report ID of a pre-selected participant whose selection state can't be derived from the participants array (e.g. self DM with accountID 0) */
    initiallySelectedReportID?: string;

    /** Whether to find the participant matching initiallySelectedReportID and move it to the top of the list */
    shouldMoveSelectedToTop?: boolean;

    /** Callback to handle restricted participant selection */
    onRestrictedParticipantSelected?: () => void;

    /** Callback to dismiss the participant picker overlay before the referral banner navigates, so the referral RHP isn't covered */
    onCloseParticipantPicker?: () => void;

    /** Reference to the outer element */
    ref?: Ref<InputFocusRef>;
};

type InputFocusRef = {
    focus?: () => void;
};

function MoneyRequestParticipantsSelector({
    participants = CONST.EMPTY_ARRAY,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onFinish = (_value?: string, _participants?: Participant[]) => {},
    onParticipantsAdded,
    iouType,
    action,
    isPerDiemRequest = false,
    isTimeRequest = false,
    isWorkspacesOnly = false,
    isSubmitWorkspacesOnly = false,
    isTransactionFromCreditCardImport = false,
    shouldExcludeP2P = false,
    initiallySelectedReportID,
    shouldMoveSelectedToTop = false,
    onRestrictedParticipantSelected,
    onCloseParticipantPicker,
    ref,
}: MoneyRequestParticipantsSelectorProps) {
    const platform = getPlatform();
    const isNative = platform === CONST.PLATFORM.ANDROID || platform === CONST.PLATFORM.IOS;
    const [textInputAutoFocus, setTextInputAutoFocus] = useState<boolean>(!isNative);
    const selectionListRef = useRef<SelectionListWithSectionsHandle | null>(null);

    useImperativeHandle(ref, () => ({
        focus: () => {
            if (!textInputAutoFocus) {
                return;
            }
            selectionListRef.current?.focusTextInput?.();
        },
    }));

    return (
        <ParticipantSearchResults
            iouType={iouType}
            action={action}
            participants={participants}
            isWorkspacesOnly={isWorkspacesOnly}
            isSubmitWorkspacesOnly={isSubmitWorkspacesOnly}
            isPerDiemRequest={isPerDiemRequest}
            isTimeRequest={isTimeRequest}
            isNative={isNative}
            isTransactionFromCreditCardImport={isTransactionFromCreditCardImport}
            shouldExcludeP2P={shouldExcludeP2P}
            selectionListRef={selectionListRef}
            textInputAutoFocus={textInputAutoFocus}
            setTextInputAutoFocus={setTextInputAutoFocus}
            onParticipantsAdded={onParticipantsAdded}
            onFinish={onFinish}
            initiallySelectedReportID={initiallySelectedReportID}
            shouldMoveSelectedToTop={shouldMoveSelectedToTop}
            onRestrictedParticipantSelected={onRestrictedParticipantSelected}
            onCloseParticipantPicker={onCloseParticipantPicker}
        />
    );
}

export default MoneyRequestParticipantsSelector;
