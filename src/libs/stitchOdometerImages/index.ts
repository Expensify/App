import Log from '@libs/Log';
import type {FileObject} from '@src/types/utils/Attachment';
import calculateStitchLayout from './stitchLayout';

// Tracks the single active stitched blob URL so that we can revoke it on the next call so at most one blob URL exists at a time
let previousBlobUrl: string | null = null;

function stitchOdometerImages(image1: FileObject | string | undefined, image2: FileObject | string | undefined): Promise<FileObject | null> {
    const source1 = typeof image1 === 'string' ? image1 : (image1?.uri ?? null);
    const source2 = typeof image2 === 'string' ? image2 : (image2?.uri ?? null);

    if (!source1 || !source2) {
        return Promise.resolve(null);
    }

    const loadImage = (src: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });

    return Promise.all([loadImage(source1), loadImage(source2)])
        .then(([img1, img2]) => {
            const {width, height, horizontal} = calculateStitchLayout(img1.width, img1.height, img2.width, img2.height);

            const offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = width;
            offscreenCanvas.height = height;
            const ctx = offscreenCanvas.getContext('2d');
            if (!ctx) {
                return null;
            }

            ctx.drawImage(img1, 0, 0);
            ctx.drawImage(img2, horizontal ? img1.width : 0, horizontal ? 0 : img1.height);

            return new Promise<FileObject | null>((resolve) => {
                offscreenCanvas.toBlob((blob) => {
                    if (!blob) {
                        resolve(null);
                        return;
                    }
                    if (previousBlobUrl) {
                        URL.revokeObjectURL(previousBlobUrl);
                    }
                    const uri = URL.createObjectURL(blob);
                    previousBlobUrl = uri;
                    resolve({uri, name: 'stitched_odometer.jpg', type: 'image/jpeg'});
                }, 'image/jpeg');
            });
        })
        .catch((error) => {
            Log.warn('stitchOdometerImages (web) failed', {error});
            return null;
        });
}

export default stitchOdometerImages;
