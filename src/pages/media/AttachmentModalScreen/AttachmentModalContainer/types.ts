import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import type {AttachmentModalScreenModalCallbacks, AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import type ModalType from '@src/types/utils/ModalType';

type AttachmentModalContainerProps = AttachmentModalScreenModalCallbacks & {
    modalType?: ModalType;
    setModalType?: (modalType: ModalType) => void;
    setShouldLoadAttachment?: (shouldLoadAttachment: boolean) => void;
    closeConfirmModal?: () => void;
    isOverlayModalVisible?: boolean;
    navigation: AttachmentModalScreenProps['navigation'];
    contentProps: Partial<AttachmentModalBaseContentProps>;
};

export default AttachmentModalContainerProps;
