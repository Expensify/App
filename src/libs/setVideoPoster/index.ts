import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';

// On Web, mWeb and Desktop we do use expo-av Video usePoster in order to set the video preview (poster)
// when the video is first loaded using the extractVideoPoster function from below.
const usePoster = true;

function prepareSourceURL(url: string) {
    // We're not using the `#t=` (time fragment) on Web, mWeb and Desktop because it's unreliable
    // especially on WebKit browsers where it errors with `WebKitBlobResource error 1` which
    // causes the video to be stuck on loading indefinitely.
    return url.includes('blob:') || url.includes('file:///') ? url : addEncryptedAuthTokenToURL(url);
}

function extractVideoPoster(blobUrl: string, positionSeconds = 0.1): Promise<string> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');

        const captureFrame = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                video.remove();
                return;
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            // Assume everything transparent (black screenshot) if alpha is 0 for the first pixel
            if (imageData.data[3] === 0) {
                setTimeout(() => {
                    // Retry by seeking and re-running the captureFrame function immediately
                    video.currentTime = Math.min(video.duration, positionSeconds);
                }, 0);
            } else {
                const posterURL = canvas.toDataURL('image/jpeg');
                resolve(posterURL);
                // Cleanup
                canvas.remove();
                video.pause();
                video.src = '';
                video.load();
            }
        };

        video.onseeked = captureFrame;

        video.onerror = () => {
            reject(new Error('Error loading video'));
            video.remove();
        };

        video.onloadedmetadata = () => {
            // Set the new current time and try to capture frame again
            video.currentTime = Math.min(video.duration, positionSeconds);
        };

        // Set the video source to the blob URL
        video.src = blobUrl;
        // Load the video which will trigger 'onloadedmetadata'
        video.load();
    });
}

export {usePoster, prepareSourceURL, extractVideoPoster};
