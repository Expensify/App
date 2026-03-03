import type {FileObject} from '@src/types/utils/Attachment';
import calculateStitchLayout from './stitchLayout';

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

    return Promise.all([loadImage(source1), loadImage(source2)]).then(([img1, img2]) => {
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
            offscreenCanvas.toBlob(
                (blob) => {
                    if (!blob) {
                        resolve(null);
                        return;
                    }
                    const uri = URL.createObjectURL(blob);
                    resolve({uri, name: 'stitched_image.jpg', type: 'image/jpeg'});
                },
                'image/jpeg',
                0.9,
            );
        });
    });
}

export default stitchOdometerImages;
