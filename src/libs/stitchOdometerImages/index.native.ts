import {Skia} from '@shopify/react-native-skia';
import RNFS from 'react-native-fs';
import type {FileObject} from '@src/types/utils/Attachment';
import calculateStitchLayout from './stitchLayout';

async function stitchOdometerImages(image1: FileObject | string | undefined, image2: FileObject | string | undefined): Promise<FileObject | null> {
    const source1 = typeof image1 === 'string' ? image1 : (image1?.uri ?? null);
    const source2 = typeof image2 === 'string' ? image2 : (image2?.uri ?? null);

    if (!source1 || !source2) {
        return null;
    }

    const [buffer1, buffer2] = await Promise.all([fetch(source1).then((r) => r.arrayBuffer()), fetch(source2).then((r) => r.arrayBuffer())]);

    const skImage1 = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBytes(new Uint8Array(buffer1)));
    const skImage2 = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBytes(new Uint8Array(buffer2)));

    if (!skImage1 || !skImage2) {
        return null;
    }

    const {width, height, horizontal} = calculateStitchLayout(skImage1.width(), skImage1.height(), skImage2.width(), skImage2.height());

    const surface = Skia.Surface.MakeOffscreen(width, height);
    if (!surface) {
        return null;
    }

    const canvas = surface.getCanvas();
    canvas.drawImage(skImage1, 0, 0);
    canvas.drawImage(skImage2, horizontal ? skImage1.width() : 0, horizontal ? 0 : skImage1.height());
    surface.flush();

    const result = surface.makeImageSnapshot();
    const base64 = result.encodeToBase64();

    // Write to a temp file so the receipt is treated as a local file (same as camera receipts),
    // ensuring compatibility with file system validation and display utilities.
    const filename = `stitched_odometer_${Date.now()}.jpg`;
    const tempPath = `${RNFS.TemporaryDirectoryPath}/${filename}`;
    await RNFS.writeFile(tempPath, base64, 'base64');

    return {uri: `file://${tempPath}`, name: filename, type: 'image/jpeg'};
}

export default stitchOdometerImages;
