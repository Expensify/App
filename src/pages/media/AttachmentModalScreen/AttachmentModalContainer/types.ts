import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import type {AttachmentModalScreenCallbacks, AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import type ModalType from '@src/types/utils/ModalType';

type AttachmentModalContainerProps = AttachmentModalScreenCallbacks & {
    navigation: AttachmentModalScreenProps['navigation'];
    contentProps: Partial<AttachmentModalBaseContentProps>;
    modalType?: ModalType;
    setModalType?: (modalType: ModalType) => void;
    setShouldLoadAttachment?: (shouldLoadAttachment: boolean) => void;
    closeConfirmModal?: () => void;
    isOverlayModalVisible?: boolean;
};

export default AttachmentModalContainerProps;
