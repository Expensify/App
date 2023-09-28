import Str from 'expensify-common/lib/str';
import {ImageSourcePropType} from 'react-native';
import * as FileUtils from './fileDownload/FileUtils';
import CONST from '../CONST';
import ReceiptHTML from '../../assets/images/receipt-html.png';
import ReceiptDoc from '../../assets/images/receipt-doc.png';
import ReceiptGeneric from '../../assets/images/receipt-generic.png';
import ReceiptSVG from '../../assets/images/receipt-svg.png';

type ThumbnailAndImageURI = {
    image: ImageSourcePropType | string;
    thumbnail: string | null;
};

type FileNameAndExtension = {
    fileExtension?: string;
    fileName?: string;
};

/**
 * Grab the appropriate receipt image and thumbnail URIs based on file type
 *
 * @param path URI to image, i.e. blob:new.expensify.com/9ef3a018-4067-47c6-b29f-5f1bd35f213d or expensify.com/receipts/w_e616108497ef940b7210ec6beb5a462d01a878f4.jpg
 * @param filename of uploaded image or last part of remote URI
 */
function getThumbnailAndImageURIs(path: string, filename: string): ThumbnailAndImageURI {
    const isReceiptImage = Str.isImage(filename);

    // For local files, we won't have a thumbnail yet
    if (isReceiptImage && (path.startsWith('blob:') || path.startsWith('file:'))) {
        return {thumbnail: null, image: path};
    }

    if (isReceiptImage) {
        return {thumbnail: `${path}.1024.jpg`, image: path};
    }

    const {fileExtension} = FileUtils.splitExtensionFromFileName(filename) as FileNameAndExtension;
    let image = ReceiptGeneric;
    if (fileExtension === CONST.IOU.FILE_TYPES.HTML) {
        image = ReceiptHTML;
    }

    if (fileExtension === CONST.IOU.FILE_TYPES.DOC || fileExtension === CONST.IOU.FILE_TYPES.DOCX) {
        image = ReceiptDoc;
    }

    if (fileExtension === CONST.IOU.FILE_TYPES.SVG) {
        image = ReceiptSVG;
    }

    return {thumbnail: null, image};
}

// eslint-disable-next-line import/prefer-default-export
export {getThumbnailAndImageURIs};
