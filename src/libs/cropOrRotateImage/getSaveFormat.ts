import {SaveFormat} from 'expo-image-manipulator';
import CONST from '@src/CONST';

function getSaveFormat(type: string) {
    switch (type) {
        case CONST.FILE_FORMAT.PNG:
            return SaveFormat.PNG;
        case CONST.FILE_FORMAT.WEBP:
            return SaveFormat.WEBP;
        case CONST.FILE_FORMAT.JPEG:
            return SaveFormat.JPEG;
        default:
            return SaveFormat.JPEG;
    }
}

export default getSaveFormat;
