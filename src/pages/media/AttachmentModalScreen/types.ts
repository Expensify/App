import type {TupleToUnion} from 'type-fest';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import type ModalType from '@src/types/utils/ModalType';
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

type AttachmentModalContainerModalProps = {
    /** The type of the modal */
    modalType?: ModalType;

    /** Callback to fire when the modal is shown */
    onShow?: () => void;

    /** Callback to fire when the modal is closed */
    onClose?: () => void;

    /** Whether to handle navigation back */
    shouldHandleNavigationBack?: boolean;

    /** Extra modals to be displayed in the modal */
    ExtraContent?: React.ReactNode;
};

const ATTACHMENT_MODAL_SCREENS = [
    SCREENS.ATTACHMENTS,
    SCREENS.REPORT_ADD_ATTACHMENT,
    SCREENS.REPORT_AVATAR,
    SCREENS.PROFILE_AVATAR,
    SCREENS.WORKSPACE_AVATAR,
    SCREENS.TRANSACTION_RECEIPT,
    SCREENS.MONEY_REQUEST.RECEIPT_PREVIEW,
];
type AttachmentModalScreenType = TupleToUnion<typeof ATTACHMENT_MODAL_SCREENS>;

type AttachmentModalScreenBaseParams = AttachmentModalBaseContentProps & AttachmentModalContainerModalProps;

type AttachmentModalScreenProps<Screen extends AttachmentModalScreenType> = PlatformStackScreenProps<RootNavigatorParamList, Screen>;

export type {AttachmentModalScreenType, AttachmentModalScreenBaseParams, AttachmentModalContainerModalProps, AttachmentModalScreenProps, FileObject, ImagePickerResponse};
