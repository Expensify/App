import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
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

type AttachmentModalScreenProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.ATTACHMENTS> & {
    onModalShow?: () => void;
    /** Optional callback to fire when we want to do something after modal hide. */
    onModalHide?: () => void;
    /** Trigger when we explicity click close button in ProfileAttachment modal */
    onModalClose?: () => void;
};

// eslint-disable-next-line import/prefer-default-export
export type {AttachmentModalScreenProps, AttachmentModalChildrenProps, FileObject};
