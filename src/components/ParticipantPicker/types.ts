import type {IOUAction, IOUType} from '@src/CONST';
import type CONST from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';

type ParticipantPickerProps = {
    /** Selected participants */
    participants?: Participant[] | typeof CONST.EMPTY_ARRAY;

    /** The type of IOU report */
    iouType: IOUType;

    /** The IOU action */
    action: IOUAction;

    /** Whether this is a per diem expense request */
    isPerDiemRequest?: boolean;

    /** Whether this is a time expense request */
    isTimeRequest?: boolean;

    /** Whether the IOU is workspaces only */
    isWorkspacesOnly?: boolean;

    /** Whether to exclude P2P recipients (and the invite-by-email option) from the list. Used for negative amounts, which P2P chats don't support. */
    shouldExcludeP2P?: boolean;

    /** Callback fired when participants are updated */
    onParticipantsAdded: (value: Participant[]) => void;

    /** Callback fired when participant selection is completed */
    onFinish?: (value?: string, participants?: Participant[]) => void;

    /** Whether the picker modal is visible */
    isVisible?: boolean;

    /** Callback fired when picker should close */
    onClose?: () => void;

    /** Callback fired when the modal backdrop (the area outside the picker) is pressed. Falls back to onClose when omitted. */
    onBackdropPress?: () => void;
};

// eslint-disable-next-line import/prefer-default-export
export type {ParticipantPickerProps};
