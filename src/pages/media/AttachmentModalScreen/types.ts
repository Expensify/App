import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import type {AttachmentModalBaseContentProps} from './AttachmentModalContent/BaseContent';

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

type AttachmentModalScreenModalCallbacks = {
    onModalShow?: () => void;
    onModalHide?: () => void;
    onModalClose?: () => void;
};

type AttachmentModalScreenParams = AttachmentModalBaseContentProps &
    AttachmentModalScreenModalCallbacks & {
        reportID?: string;
    };

type AttachmentModalScreenProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.ATTACHMENTS>;

// eslint-disable-next-line import/prefer-default-export
export type {AttachmentModalScreenParams, AttachmentModalScreenModalCallbacks, AttachmentModalScreenProps, AttachmentModalChildrenProps, FileObject, ImagePickerResponse};
