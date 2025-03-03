import type React from 'react';
import type {AttachmentModalScreenModalCallbacks, AttachmentModalScreenParams} from '@pages/media/AttachmentModalScreen/types';
import type ModalType from '@src/types/utils/ModalType';
import type {AttachmentModalBaseContentProps} from './BaseContent';

type AttachmentModalWrapperWrapperProps = AttachmentModalScreenModalCallbacks & {
    modalType?: ModalType;
    setModalType?: (modalType: ModalType) => void;
    setShouldLoadAttachment?: (shouldLoadAttachment: boolean) => void;
    closeConfirmModal?: () => void;
    isOverlayModalVisible?: boolean;
};

type AttachmentModalContentChildrenProps = {
    contentProps: Partial<AttachmentModalBaseContentProps>;
    wrapperProps: AttachmentModalWrapperWrapperProps;
};

type AttachmentModalContent = React.FC<{
    params: AttachmentModalScreenParams;
    children: (props: AttachmentModalContentChildrenProps) => React.ReactElement;
}>;

export type {AttachmentModalContent, AttachmentModalContentChildrenProps, AttachmentModalWrapperWrapperProps};
