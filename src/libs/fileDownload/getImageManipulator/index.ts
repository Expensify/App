import {manipulateAsync} from 'expo-image-manipulator';
import type ImageManipulatorConfig from './type';

export default function getImageManipulator({fileUri, width, height, fileName}: ImageManipulatorConfig): Promise<File> {
    return manipulateAsync(fileUri ?? '', [{resize: {width, height}}]).then((result) =>
        fetch(result.uri)
            .then((res) => res.blob())
            .then((blob) => {
                const resizedFile = new File([blob], `${fileName}.jpeg`, {type: 'image/jpeg'});
                resizedFile.uri = URL.createObjectURL(resizedFile);
                return resizedFile;
            }),
    );
}
