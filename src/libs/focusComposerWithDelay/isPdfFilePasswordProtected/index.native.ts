import type {FileObject} from '@components/AttachmentModal';

const isPdfFilePasswordProtected = async (file: FileObject) => {
    try {
        if (!file.uri) {
            return false;
        }
        return false;
    } catch (error) {
        return false;
    }
};

export default isPdfFilePasswordProtected;
