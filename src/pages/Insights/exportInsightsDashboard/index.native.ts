/** Shares a temporary PNG assembled from the page header, filters, and all mounted chart content. */
import {Skia} from '@shopify/react-native-skia';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import {captureRef, releaseCapture} from 'react-native-view-shot';

import type ExportInsightsDashboard from './types';
import type {InsightsCaptureRef} from './types';

import {INSIGHTS_EXPORT_PADDING, INSIGHTS_EXPORT_SCALE} from './types';

function measure(ref: InsightsCaptureRef): Promise<{x: number; width: number; height: number}> {
    const view = ref.current;
    if (!view || !('measureInWindow' in view)) {
        return Promise.reject(new Error('Insights content is not mounted'));
    }
    return new Promise((resolve, reject) => {
        view.measureInWindow((x, y, width, height) => {
            if (width <= 0 || height <= 0) {
                reject(new Error('Insights content has no size'));
                return;
            }
            resolve({x, width, height});
        });
    });
}

const exportInsightsDashboard: ExportInsightsDashboard = async ({headerRef, controlsRef, contentRef, backgroundColor, fileName}) => {
    const refs = [headerRef, controlsRef, contentRef];
    const bounds = await Promise.all(refs.map(measure));
    const [headerBounds, controlsBounds, contentBounds] = bounds;
    const width = Math.ceil(headerBounds.width * INSIGHTS_EXPORT_SCALE);
    const headerHeight = Math.ceil(headerBounds.height * INSIGHTS_EXPORT_SCALE);
    const controlsHeight = Math.ceil(controlsBounds.height * INSIGHTS_EXPORT_SCALE);
    const contentHeight = Math.ceil(contentBounds.height * INSIGHTS_EXPORT_SCALE);
    const padding = INSIGHTS_EXPORT_PADDING * INSIGHTS_EXPORT_SCALE;
    const path = `${RNFS.CachesDirectoryPath}/${fileName}`;
    const uris: string[] = [];
    const images = [];
    const surface = Skia.Surface.MakeOffscreen(width, headerHeight + controlsHeight + contentHeight + padding * 3);
    if (!surface) {
        throw new Error('Could not create Insights image');
    }
    try {
        for (const [index, ref] of refs.entries()) {
            const sectionBounds = bounds.at(index);
            if (!sectionBounds) {
                throw new Error('Insights content is not mounted');
            }
            // Capture and decode one section at a time to avoid overlapping native bitmap allocations.
            // eslint-disable-next-line no-await-in-loop
            const uri = await captureRef(ref, {
                format: 'png',
                result: 'tmpfile',
                width: Math.ceil(sectionBounds.width * INSIGHTS_EXPORT_SCALE),
                height: Math.ceil(sectionBounds.height * INSIGHTS_EXPORT_SCALE),
                handleGLSurfaceViewOnAndroid: true,
            });
            uris.push(uri);
            // eslint-disable-next-line no-await-in-loop -- Decode this section before allocating the next native capture.
            const data = await Skia.Data.fromURI(uri);
            const image = Skia.Image.MakeImageFromEncoded(data);
            data.dispose();
            if (!image) {
                throw new Error('Could not read Insights capture');
            }
            images.push(image);
        }
        const canvas = surface.getCanvas();
        canvas.clear(Skia.Color(backgroundColor));
        const paint = Skia.Paint();
        const [headerImage, controlsImage, contentImage] = images;
        canvas.drawImage(headerImage, 0, 0, paint);
        canvas.drawImage(controlsImage, (controlsBounds.x - headerBounds.x) * INSIGHTS_EXPORT_SCALE, headerHeight + padding, paint);
        canvas.drawImage(contentImage, (contentBounds.x - headerBounds.x) * INSIGHTS_EXPORT_SCALE, headerHeight + controlsHeight + padding * 2, paint);
        surface.flush();
        const result = surface.makeImageSnapshot();
        const encoded = result.encodeToBase64();
        result.dispose();
        paint.dispose();
        await RNFS.writeFile(path, encoded, 'base64');
        await Share.open({url: `file://${path}`, type: 'image/png', failOnCancel: false});
    } finally {
        for (const image of images) {
            image.dispose();
        }
        surface.dispose();
        for (const uri of uris) {
            releaseCapture(uri);
        }
        await RNFS.unlink(path).catch(() => {
            // The OS can reclaim a cache file if it could not be removed after sharing.
        });
    }
};

export default exportInsightsDashboard;
