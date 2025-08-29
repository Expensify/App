import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import type {AttachmentModalModalProps, AttachmentModalScreenProps, AttachmentModalScreenType} from '@pages/media/AttachmentModalScreen/types';

type AttachmentModalContainerProps<Screen extends AttachmentModalScreenType> = AttachmentModalModalProps & {
    navigation: AttachmentModalScreenProps<Screen>['navigation'];
    contentProps: Partial<AttachmentModalBaseContentProps>;
};

export default AttachmentModalContainerProps;
