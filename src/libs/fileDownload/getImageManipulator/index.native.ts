import {ImageManipulator} from 'expo-image-manipulator';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import type ImageManipulatorConfig from './type';

export default function getImageManipulator({fileUri, width, height, type, fileName}: ImageManipulatorConfig): Promise<FileObject> {
    return ImageManipulator.manipulate(fileUri ?? '')
        .resize({width, height})
        .renderAsync()
        .then((image) => image.saveAsync())
        .then((result) => ({
            uri: result.uri,
            width: result.width,
            height: result.height,
            type,
            name: fileName,
        }));
}
