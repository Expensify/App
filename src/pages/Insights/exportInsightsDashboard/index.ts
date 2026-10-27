/** Captures live dashboard content without depending on WebGL's discarded drawing buffers. */
// cspell:ignore onclone
import createDownloadLink from '@libs/fileDownload/createDownloadLink';

import type {ISkiaViewApiWeb} from '@shopify/react-native-skia/lib/module/specs/NativeSkiaModule.web';

import type ExportInsightsDashboard from './types';

import {INSIGHTS_EXPORT_FILTER_GAP, INSIGHTS_EXPORT_SCALE} from './types';

const exportInsightsDashboard: ExportInsightsDashboard = async ({controlsRef, contentRef, backgroundColor, fileName}) => {
    const controls = controlsRef.current;
    const content = contentRef.current;
    if (!(controls instanceof HTMLElement) || !(content instanceof HTMLElement)) {
        throw new Error('Insights content is not mounted');
    }

    const {default: html2canvas} = await import('html2canvas');
    await document.fonts.ready;
    const elements = [controls, content];
    const bounds = elements.map((element) => element.getBoundingClientRect());

    // Skia clears its WebGL buffers after paint. Copy them in the same task as its redraw, before another paint can clear them.
    const skia = (globalThis as typeof globalThis & {SkiaViewApi?: ISkiaViewApiWeb}).SkiaViewApi;
    for (const view of Object.values(skia?.views ?? {})) {
        view.redraw();
    }
    await Promise.resolve();
    const chartImages = elements.map((element) =>
        Array.from(element.querySelectorAll('canvas'), (canvas) => {
            const {width, height} = canvas.getBoundingClientRect();
            return {src: canvas.toDataURL('image/png'), width, height};
        }),
    );

    const captures = await Promise.all(
        elements.map((element, index) =>
            html2canvas(element, {
                scale: INSIGHTS_EXPORT_SCALE,
                backgroundColor,
                useCORS: true,
                logging: false,
                onclone: (documentClone, elementClone) => {
                    for (const [canvasIndex, canvas] of Array.from(elementClone.querySelectorAll('canvas')).entries()) {
                        const chartImage = chartImages.at(index)?.at(canvasIndex);
                        if (!chartImage) {
                            throw new Error('Insights charts changed during capture');
                        }
                        const image = documentClone.createElement('img');
                        image.style.cssText = canvas.style.cssText;
                        // Images have different intrinsic dimensions from canvases; keep the measured CSS size so the clone cannot reflow.
                        image.style.width = `${chartImage.width}px`;
                        image.style.height = `${chartImage.height}px`;
                        image.src = chartImage.src;
                        canvas.replaceWith(image);
                    }
                },
            }),
        ),
    );

    const [controlsImage, contentImage] = captures;
    const canvas = document.createElement('canvas');
    canvas.width = contentImage.width;
    canvas.height = controlsImage.height + INSIGHTS_EXPORT_FILTER_GAP * INSIGHTS_EXPORT_SCALE + contentImage.height;
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Could not create Insights image');
    }
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    const [controlsBounds, contentBounds] = bounds;
    context.drawImage(controlsImage, (controlsBounds.left - contentBounds.left) * INSIGHTS_EXPORT_SCALE, 0);
    context.drawImage(contentImage, 0, controlsImage.height + INSIGHTS_EXPORT_FILTER_GAP * INSIGHTS_EXPORT_SCALE);
    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((image) => (image ? resolve(image) : reject(new Error('Could not encode Insights image'))), 'image/png');
    });
    createDownloadLink(URL.createObjectURL(blob), fileName);
};

export default exportInsightsDashboard;
