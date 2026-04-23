import React, {useImperativeHandle, useRef, useState} from 'react';
import type {Ref} from 'react';
import type {SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';
import getPlatform from '@libs/getPlatform';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';
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

    /** Whether this is a per diem expense request */
    isPerDiemRequest?: boolean;

    /** Whether this is a time expense request */
    isTimeRequest?: boolean;

    /** Whether this is a corporate card transaction */
    isCorporateCardTransaction?: boolean;

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
    isCorporateCardTransaction = false,
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
            isPerDiemRequest={isPerDiemRequest}
            isTimeRequest={isTimeRequest}
            isNative={isNative}
            isCorporateCardTransaction={isCorporateCardTransaction}
            selectionListRef={selectionListRef}
            textInputAutoFocus={textInputAutoFocus}
            setTextInputAutoFocus={setTextInputAutoFocus}
            onParticipantsAdded={onParticipantsAdded}
            onFinish={onFinish}
        />
    );
}

export default MoneyRequestParticipantsSelector;
