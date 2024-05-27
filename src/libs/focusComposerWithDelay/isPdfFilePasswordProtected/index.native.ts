import * as RNFS from 'react-native-fs';
import type {FileObject} from '@components/AttachmentModal';

const isPdfFilePasswordProtected = async (file: FileObject) => {
    try {
        // Ensure the file URI is properly formatted
        const filePath = file.uri.replace('file://', '');
        // Check if the file exists
        const fileExists = await RNFS.exists(filePath);
        if (!fileExists) {
            throw new Error(`File not found: ${filePath}`);
        }

        return false;
    } catch (error) {
        console.error('Error checking PDF password protection:', error);
        return false;
    }
};

export default isPdfFilePasswordProtected;
