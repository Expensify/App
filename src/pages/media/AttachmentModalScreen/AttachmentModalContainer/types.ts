import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import type {AttachmentModalModalProps, AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import type {AttachmentModalScreen} from '@src/SCREENS';

type AttachmentModalContainerProps<Screen extends AttachmentModalScreen> = AttachmentModalModalProps & {
    navigation: AttachmentModalScreenProps<Screen>['navigation'];
    contentProps: Partial<AttachmentModalBaseContentProps>;
};

export default AttachmentModalContainerProps;
