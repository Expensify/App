import type {RefObject} from 'react';
import type {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {Attachment} from '@components/Attachments/types';
import type {AvatarSource} from '@libs/UserUtils';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import type {IOUAction, IOUType} from '@src/CONST';
import type CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';

type OnValidateFileCallback = (file: FileObject | undefined, setFile: (file: FileObject | undefined) => void) => void;

type AttachmentModalOnCloseOptions = {
    shouldCallDirectly?: boolean;
    onAfterClose?: () => void;
};

type AttachmentModalBaseContentProps = {
    /** Optional source (URL, SVG function) for the image shown. If not passed in via props must be specified when modal is opened. */
    source?: AvatarSource;

    /** The id of the attachment. */
    attachmentID?: string;

    /** Fallback source (URL, SVG function) for the image shown. */
    fallbackSource?: AvatarSource;

    /** Optional file object to be used for the attachment. If not passed in via props must be specified when modal is opened. */
    file?: FileObject;

    /** Optional original filename when uploading */
    originalFileName?: string;

    /** Whether source url requires authentication */
    isAuthTokenRequired?: boolean;

    /** Determines if download Button should be shown or not */
    allowDownload?: boolean;

    /** Determines if the receipt comes from track expense action */
    isTrackExpenseAction?: boolean;

    /** Title shown in the header of the modal */
    headerTitle?: string;

    /** The report that has this attachment */
    report?: OnyxEntry<OnyxTypes.Report>;

    /** The ID of the current report */
    reportID?: string;

    /** The type of the attachment */
    type?: ValueOf<typeof CONST.ATTACHMENT_TYPE>;

    /** The iou action of the expense creation flow of which we are displaying the receipt for. */
    iouAction?: IOUAction;

    /** The iou type of the expense creation flow of which we are displaying the receipt for. */
    iouType?: IOUType;

    /** The id of the draft transaction linked to the receipt. */
    draftTransactionID?: string;

    /** If the attachment originates from a note, the accountID will represent the author of that note. */
    accountID?: number;

    /** The data is loading or not */
    isLoading?: boolean;

    /** Should display not found page or not */
    shouldShowNotFoundPage?: boolean;

    /** Denotes whether it is a workspace avatar or not */
    isWorkspaceAvatar?: boolean;

    /** Denotes whether it can be an icon (ex: SVG) */
    maybeIcon?: boolean;

    /** Whether it is a receipt attachment or not */
    isReceiptAttachment?: boolean;

    /** Determines if the user can edit the receipt or not */
    canEditReceipt?: boolean;

    /** Determines if the user can delete the receipt or not */
    canDeleteReceipt?: boolean;

    /** Determines if the send button should be disabled or not */
    shouldDisableSendButton?: boolean;

    /** Determines if the help button should be displayed or not */
    shouldDisplayHelpButton?: boolean;

    /** The link of the attachment */
    attachmentLink?: string;

    /** Determines if the attachment is invalid or not */
    isAttachmentInvalid?: boolean;

    /** Determines if the attachment is invalid or not */
    attachmentInvalidReason?: TranslationPaths | null;

    /** Determines the title of the invalid reason modal */
    attachmentInvalidReasonTitle?: TranslationPaths | null;

    /** Ref to the submit button */
    submitRef?: RefObject<View | HTMLElement | null>;

    /** Determines if the delete receipt confirm modal is visible or not */
    isDeleteReceiptConfirmModalVisible?: boolean;

    /** Optional callback to fire when we want to preview an image and approve it for use. */
    onConfirm?: (file: FileObject) => void;

    /** Callback triggered when the modal is closed */
    onClose?: (options?: AttachmentModalOnCloseOptions) => void;

    /** Callback triggered when the confirm modal is closed */
    onConfirmModalClose?: () => void;

    /** Callback triggered when the delete receipt modal is shown */
    onRequestDeleteReceipt?: () => void;

    /** Callback triggered when the delete receipt is confirmed */
    onDeleteReceipt?: () => void;

    /** Optional callback to fire when we want to do something after attachment carousel changes. */
    onCarouselAttachmentChange?: (attachment: Attachment) => void;

    /** Optional callback to fire when we want to validate the file. */
    onValidateFile?: OnValidateFileCallback;
};

export type {AttachmentModalBaseContentProps, AttachmentModalOnCloseOptions, OnValidateFileCallback};
