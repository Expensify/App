import tryResolveUrlFromApiRoot from './tryResolveUrlFromApiRoot';
import {addLeadingForwardSlash, getPathFromURL, hasURL} from './Url';

function getAttachmentSource(source?: number | string) {
    if (!source) {
        return;
    }

    const isURL = typeof source === 'string' && hasURL(source);
    const processedSource = isURL ? addLeadingForwardSlash(getPathFromURL(source)) : source;

    return tryResolveUrlFromApiRoot(processedSource);
}

export {getAttachmentSource};
