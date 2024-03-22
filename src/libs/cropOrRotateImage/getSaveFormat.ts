import {SaveFormat} from 'expo-image-manipulator';
import CONST from '@src/CONST';

function getSaveFormat(type: string): SaveFormat {
    switch (type) {
        case CONST.IMAGE_FILE_FORMAT.PNG:
            return SaveFormat.PNG;
        case CONST.IMAGE_FILE_FORMAT.WEBP:
            return SaveFormat.WEBP;
        case CONST.IMAGE_FILE_FORMAT.JPEG:
            return SaveFormat.JPEG;
        default:
            return SaveFormat.JPEG;
    }
}

export default getSaveFormat;
