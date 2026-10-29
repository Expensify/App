import {rand64} from '@libs/NumberUtils';

function getReceiptFilePath(folderPath: string): string {
    return `${folderPath}/receipt_${Date.now()}_${rand64()}.jpg`;
}

export default getReceiptFilePath;
