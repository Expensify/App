import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import type {AttachmentModalContainerModalProps, AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import type {AttachmentModalScreenType} from '..';

type AttachmentModalContainerProps<Screen extends AttachmentModalScreenType> = AttachmentModalContainerModalProps & {
    navigation: AttachmentModalScreenProps<Screen>['navigation'];
    contentProps: Partial<AttachmentModalBaseContentProps>;
};

export default AttachmentModalContainerProps;
