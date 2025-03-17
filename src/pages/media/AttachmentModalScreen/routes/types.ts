import type {AttachmentModalScreenParams, AttachmentModalScreenProps, FileObject} from '@pages/media/AttachmentModalScreen/types';

type AttachmentModalRouteProps = AttachmentModalScreenProps &
    AttachmentModalScreenParams & {
        file?: FileObject;
    };

export default AttachmentModalRouteProps;
