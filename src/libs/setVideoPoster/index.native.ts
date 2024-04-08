import {addSkipTimeTagToURL} from '@components/VideoPlayer/utils';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';

// For native we don't need to set expo-av Video usePoster to true since we
// handle the preview (poster) below when we prepare the sourceURL.
const usePoster = false;

function prepareSourceURL(url: string) {
    // We add "#t=0.001" (time fragment) at the end of the blob URL to skip the first milisecond of
    // the video in order to display video preview (poster) when the video is first loaded.
    return addSkipTimeTagToURL(url.includes('blob:') || url.includes('file:///') ? url : addEncryptedAuthTokenToURL(url), 0.001);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function extractVideoPoster(blobUrl: string): Promise<string> {
    return new Promise((resolve) => {
        resolve('');
    });
}

export {usePoster, prepareSourceURL, extractVideoPoster};
