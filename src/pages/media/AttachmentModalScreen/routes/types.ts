import type {AttachmentModalScreenParams, AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';

type AttachmentModalRouteProps = {
    params: AttachmentModalScreenParams;
    navigation: AttachmentModalScreenProps['navigation'];
    attachmentId?: string;
};

export default AttachmentModalRouteProps;
