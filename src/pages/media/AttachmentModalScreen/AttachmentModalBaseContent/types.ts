import type {RefObject} from 'react';
import type {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {Attachment} from '@components/Attachments/types';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import type CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

type AttachmentModalOnCloseOptions = {
    shouldCallDirectly?: boolean;
};

type AttachmentModalContentData = {
    source: AvatarSource;
    file: FileObject | undefined;
};

type ThreeDotsMenuItemFactoryProps = AttachmentModalContentData & {
    isLocalSource: boolean;
};

type ThreeDotsMenuItemFactory = (props: ThreeDotsMenuItemFactoryProps) => PopoverMenuItem[];

type DownloadAttachmentCallback = (props: AttachmentModalContentData) => void;

type AttachmentContentProps = {
    fileToDisplay: FileObject | undefined;
    files: FileObject | FileObject[] | undefined;
};
type AttachmentContent = React.FC<AttachmentContentProps>;

type AttachmentModalBaseContentProps = {
    /** Optional source (URL, SVG function) for the image shown. If not passed in via props must be specified when modal is opened. */
    source?: AvatarSource;

    /** The id of the attachment. */
    attachmentID?: string;

    /** Fallback source (URL, SVG function) for the image shown. */
    fallbackSource?: AvatarSource;

    /** Optional file object to be used for the attachment. If not passed in via props must be specified when modal is opened. */
    file?: FileObject | FileObject[];

    /** The index of the file to display in the carousel */
    fileToDisplayIndex?: number;

    /** Optional original filename when uploading */
    originalFileName?: string;

    /** Whether source url requires authentication */
    isAuthTokenRequired?: boolean;

    /** Title shown in the header of the modal */
    headerTitle?: string;

    /** The menu items for the three dots button */
    threeDotsMenuItems?: PopoverMenuItem[] | ThreeDotsMenuItemFactory;

    /** The report that has this attachment */
    report?: OnyxEntry<OnyxTypes.Report>;

    /** The ID of the current report */
    reportID?: string;

    /** The type of the attachment */
    type?: ValueOf<typeof CONST.ATTACHMENT_TYPE>;

    /** If the attachment originates from a note, the accountID will represent the author of that note. */
    accountID?: number;

    /** The data is loading or not */
    isLoading?: boolean;

    /** Denotes whether it is a workspace avatar or not */
    isWorkspaceAvatar?: boolean;

    /** Denotes whether it can be an icon (ex: SVG) */
    maybeIcon?: boolean;

    /** Whether to display not found page */
    shouldShowNotFoundPage?: boolean;

    /** Whether to show an attachment carousel */
    shouldShowCarousel?: boolean;

    /** Whether to show download button */
    shouldShowDownloadButton?: boolean;

    /** Whether to disable send button */
    shouldDisableSendButton?: boolean;

    /** Whether to display help button */
    shouldDisplayHelpButton?: boolean;

    /** The link of the attachment */
    attachmentLink?: string;

    /** Ref to the submit button */
    submitRef?: RefObject<View | HTMLElement | null>;

    AttachmentContent?: AttachmentContent;

    /** Callback triggered when the download button is pressed */
    onDownloadAttachment?: DownloadAttachmentCallback;

    /** Optional callback to fire when we want to preview an image and approve it for use. */
    onConfirm?: (file: FileObject | FileObject[]) => void;

    /** Callback triggered when the modal is closed */
    onClose?: (options?: AttachmentModalOnCloseOptions) => void;

    /** Optional callback to fire when we want to do something after attachment carousel changes. */
    onCarouselAttachmentChange?: (attachment: Attachment) => void;

    /** Transaction object. When provided, will be used instead of fetching from Onyx. */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Allows users to swipe down to close the modal */
    shouldCloseOnSwipeDown?: boolean;
};

export type {
    AttachmentModalBaseContentProps,
    AttachmentModalOnCloseOptions,
    DownloadAttachmentCallback,
    AttachmentContent,
    AttachmentContentProps,
    ThreeDotsMenuItemFactory,
    ThreeDotsMenuItemFactoryProps,
};
