import type {ValueOf} from 'type-fest';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import type {AvatarSource} from '@libs/UserUtils';
import type CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

/**
 * Modal render prop component that exposes modal launching triggers that can be used
 * to display a full size image or PDF modally with optional confirmation button.
 */

type ImagePickerResponse = {
    height?: number;
    name: string;
    size?: number | null;
    type: string;
    uri: string;
    width?: number;
};

type FileObject = Partial<File | ImagePickerResponse>;

type AttachmentModalChildrenProps = {
    displayFileInModal: (data: FileObject) => void;
    show: () => void;
};

type AttachmentModalType = ValueOf<typeof CONST.ATTACHMENT_MODAL_TYPE>;

type AttachmentModalScreenParams = {
    source?: AvatarSource;
    fallbackSource?: AvatarSource;
    headerTitle?: string;
    maybeIcon?: boolean;
    reportID?: string;
    policyID?: string;
    type?: ValueOf<typeof CONST.ATTACHMENT_TYPE>;
    accountID?: number | string;
    isAuthTokenRequired?: boolean;
    isReceiptAttachment?: boolean;
    fileName?: string;
    attachmentLink?: string;
} & {
    onModalShow?: () => void;
    /** Optional callback to fire when we want to do something after modal hide. */
    onModalHide?: () => void;
    /** Trigger when we explicity click close button in ProfileAttachment modal */
    onModalClose?: () => void;
};

type AttachmentModalScreenProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.ATTACHMENTS>;

// eslint-disable-next-line import/prefer-default-export
export type {AttachmentModalScreenParams, AttachmentModalScreenProps, AttachmentModalChildrenProps, FileObject, AttachmentModalType};
