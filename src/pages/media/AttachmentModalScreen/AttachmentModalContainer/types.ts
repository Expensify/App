import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import type {AttachmentModalModalProps, AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';

type AttachmentModalContainerProps = AttachmentModalModalProps & {
    navigation: AttachmentModalScreenProps['navigation'];
    contentProps: Partial<AttachmentModalBaseContentProps>;
};

export default AttachmentModalContainerProps;
