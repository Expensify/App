import type {AttachmentModalContentChildrenProps} from '@pages/media/AttachmentModalScreen/AttachmentModalContent/types';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';

type AttachmentModalWrapperProps = AttachmentModalContentChildrenProps & {
    navigation: AttachmentModalScreenProps['navigation'];
    attachmentId?: string;
};

// eslint-disable-next-line import/prefer-default-export
export type {AttachmentModalWrapperProps};
