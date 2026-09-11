import {getMimeTypeFromUri} from '@libs/fileDownload/FileUtils';

import type {ResolveReceiptFile} from './types';

const resolveReceiptFile: ResolveReceiptFile = (source, filename) =>
    fetch(source)
        .then((response) => response.blob())
        .then((blob) => {
            if (blob.size === 0) {
                return undefined;
            }
            const file = new File([blob], filename, {type: getMimeTypeFromUri(filename) ?? blob.type});
            file.uri = source;
            file.source = source;
            return file;
        })
        .catch(() => undefined);

export default resolveReceiptFile;
