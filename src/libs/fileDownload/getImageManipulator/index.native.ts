// eslint-disable-next-line @typescript-eslint/no-deprecated
import {manipulateAsync} from 'expo-image-manipulator';
import type {FileObject} from '@src/types/utils/Attachment';
import type ImageManipulatorConfig from './type';

export default function getImageManipulator({fileUri, width, height, type, fileName}: ImageManipulatorConfig): Promise<FileObject> {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return manipulateAsync(fileUri ?? '', [{resize: {width, height}}]).then((result) => ({
        uri: result.uri,
        width: result.width,
        height: result.height,
        type,
        name: fileName,
    }));
}
