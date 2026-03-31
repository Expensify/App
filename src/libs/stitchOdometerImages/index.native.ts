import {ImageFormat, Skia} from '@shopify/react-native-skia';
import RNFS from 'react-native-fs';
import Log from '@libs/Log';
import type {FileObject} from '@src/types/utils/Attachment';
import STITCHED_ODOMETER_FILENAME_PREFIX from './constants';
import calculateStitchLayout from './stitchLayout';

async function stitchOdometerImages(image1: FileObject | string | undefined, image2: FileObject | string | undefined): Promise<FileObject | null> {
    const source1 = typeof image1 === 'string' ? image1 : (image1?.uri ?? null);
    const source2 = typeof image2 === 'string' ? image2 : (image2?.uri ?? null);

    if (!source1 || !source2) {
        return null;
    }

    let skImage1 = null;
    let skImage2 = null;
    let surface = null;
    let snapshot = null;

    try {
        const [buffer1, buffer2] = await Promise.all([fetch(source1).then((r) => r.arrayBuffer()), fetch(source2).then((r) => r.arrayBuffer())]);

        skImage1 = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBytes(new Uint8Array(buffer1)));
        skImage2 = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBytes(new Uint8Array(buffer2)));

        if (!skImage1 || !skImage2) {
            throw new Error('Failed to decode odometer images');
        }

        const {width, height, img1Dest, img2Dest} = calculateStitchLayout(skImage1.width(), skImage1.height(), skImage2.width(), skImage2.height());

        surface = Skia.Surface.MakeOffscreen(width, height);
        if (!surface) {
            throw new Error('Failed to create Skia surface');
        }

        const canvas = surface.getCanvas();
        const paint = Skia.Paint();
        canvas.drawImageRect(skImage1, Skia.XYWHRect(0, 0, skImage1.width(), skImage1.height()), Skia.XYWHRect(img1Dest.x, img1Dest.y, img1Dest.w, img1Dest.h), paint);
        canvas.drawImageRect(skImage2, Skia.XYWHRect(0, 0, skImage2.width(), skImage2.height()), Skia.XYWHRect(img2Dest.x, img2Dest.y, img2Dest.w, img2Dest.h), paint);
        surface.flush();

        snapshot = surface.makeImageSnapshot();
        const base64 = snapshot.encodeToBase64(ImageFormat.JPEG, 100);

        // Delete any previously stitched files before creating a new one
        try {
            const tempDirContents = await RNFS.readDir(RNFS.TemporaryDirectoryPath);
            const oldStitchedFiles = tempDirContents.filter((f) => f.name.startsWith(`${STITCHED_ODOMETER_FILENAME_PREFIX}_`) && f.name.endsWith('.jpg'));
            await Promise.all(oldStitchedFiles.map((f) => RNFS.unlink(f.path)));
        } catch (error) {
            Log.warn('stitchOdometerImages (native) failed to clean up old stitched files', {error});
        }

        const filename = `${STITCHED_ODOMETER_FILENAME_PREFIX}_${Date.now()}.jpg`;
        const tempPath = `${RNFS.TemporaryDirectoryPath}/${filename}`;
        await RNFS.writeFile(tempPath, base64, 'base64');

        return {uri: `file://${tempPath}`, name: filename, type: 'image/jpeg'};
    } finally {
        skImage1?.dispose?.();
        skImage2?.dispose?.();
        snapshot?.dispose?.();
        surface?.dispose?.();
    }
}

export default stitchOdometerImages;
