import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import type ModalType from '@src/types/utils/ModalType';
import type {AttachmentModalScreenType} from '.';
import type {AttachmentModalBaseContentProps} from './AttachmentModalBaseContent/types';

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

type AttachmentModalModalProps = {
    modalType?: ModalType;
    onShow?: () => void;
    onClose?: () => void;
    shouldHandleNavigationBack?: boolean;
};

type AttachmentModalScreenBaseParams = AttachmentModalBaseContentProps & AttachmentModalModalProps;

type AttachmentModalScreenProps<Screen extends AttachmentModalScreenType> = PlatformStackScreenProps<RootNavigatorParamList, Screen>;

export type {AttachmentModalScreenBaseParams, AttachmentModalModalProps, AttachmentModalScreenProps, FileObject, ImagePickerResponse};
