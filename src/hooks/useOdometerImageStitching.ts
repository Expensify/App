import {useCallback} from 'react';
import type {FileObject} from '@src/types/utils/Attachment';

function useOdometerImageStitching(image1: FileObject | string | undefined, image2: FileObject | string | undefined): () => Promise<FileObject | null> {
    return useCallback(async () => {
        const source1 = typeof image1 === 'string' ? image1 : (image1?.uri ?? null);
        const source2 = typeof image2 === 'string' ? image2 : (image2?.uri ?? null);

        if (!source1 || !source2) {
            return null;
        }

        const loadImage = (src: string): Promise<HTMLImageElement> =>
            new Promise((resolve, reject) => {
                const img = new window.Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });

        const [img1, img2] = await Promise.all([loadImage(source1), loadImage(source2)]);

        let width: number;
        let height: number;
        let horizontal = true;

        if (img1.width > img1.height || img2.width > img2.height) {
            width = Math.max(img1.width, img2.width);
            height = img1.height + img2.height;
            horizontal = false;
        } else {
            width = img1.width + img2.width;
            height = Math.max(img1.height, img2.height);
        }

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        const ctx = offscreenCanvas.getContext('2d');
        if (!ctx) {
            return null;
        }

        ctx.drawImage(img1, 0, 0);
        ctx.drawImage(img2, horizontal ? img1.width : 0, horizontal ? 0 : img1.height);

        const blob = await new Promise<Blob | null>((resolve) => {
            offscreenCanvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9);
        });

        if (!blob) {
            return null;
        }

        const uri = URL.createObjectURL(blob);
        return {uri, name: 'stitched_image.jpg', type: 'image/jpeg'};
    }, [image1, image2]);
}

export default useOdometerImageStitching;
