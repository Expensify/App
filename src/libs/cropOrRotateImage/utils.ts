import {SaveFormat} from 'expo-image-manipulator';

function getSaveFormat(type: string) {
    switch (type) {
        case 'image/png':
            return SaveFormat.PNG;
        case 'image/webp':
            return SaveFormat.WEBP;
        case 'image/jpeg':
            return SaveFormat.JPEG;
        default:
            return SaveFormat.JPEG;
    }
}

export default getSaveFormat;
