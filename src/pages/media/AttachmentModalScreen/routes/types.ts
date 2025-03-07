import type {AttachmentModalScreenParams, AttachmentModalScreenProps, FileObject} from '@pages/media/AttachmentModalScreen/types';

type AttachmentModalRouteProps = AttachmentModalScreenParams & {
    navigation: AttachmentModalScreenProps['navigation'];
    file?: FileObject;
};

export default AttachmentModalRouteProps;
