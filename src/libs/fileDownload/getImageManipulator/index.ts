import {ImageManipulator} from 'expo-image-manipulator';
import type ImageManipulatorConfig from './type';

export default function getImageManipulator({fileUri, width, height, fileName}: ImageManipulatorConfig): Promise<File> {
    return ImageManipulator.manipulate(fileUri ?? '')
        .resize({width, height})
        .renderAsync()
        .then((image) => image.saveAsync())
        .then((result) =>
            fetch(result.uri)
                .then((res) => res.blob())
                .then((blob) => {
                    const resizedFile = new File([blob], `${fileName}.jpeg`, {type: 'image/jpeg'});
                    resizedFile.uri = URL.createObjectURL(resizedFile);
                    return resizedFile;
                }),
        );
}
