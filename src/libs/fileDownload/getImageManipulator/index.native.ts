import {manipulateAsync} from 'expo-image-manipulator';
import type {FileObject} from '@components/AttachmentModal';
import type ImageManipulatorConfig from './type';

export default function getImageManipulator({fileUri, width, height, type, fileName}: ImageManipulatorConfig): Promise<FileObject> {
    return manipulateAsync(fileUri ?? '', [{resize: {width, height}}]).then((result) => ({
        uri: result.uri,
        width: result.width,
        height: result.height,
        type,
        name: fileName,
    }));
}
