/** Captures live dashboard content without depending on WebGL's discarded drawing buffers. */
import createDownloadLink from '@libs/fileDownload/createDownloadLink';

import type {ISkiaViewApiWeb} from '@shopify/react-native-skia/lib/module/specs/NativeSkiaModule.web';

import type ExportInsightsDashboard from './types';

import {INSIGHTS_EXPORT_PADDING, INSIGHTS_EXPORT_SCALE} from './types';

const exportInsightsDashboard: ExportInsightsDashboard = async ({headerRef, controlsRef, contentRef, backgroundColor, fileName}) => {
    const header = headerRef.current;
    const controls = controlsRef.current;
    const content = contentRef.current;
    if (!(header instanceof HTMLElement) || !(controls instanceof HTMLElement) || !(content instanceof HTMLElement)) {
        throw new Error('Insights content is not mounted');
    }

    const {domToCanvas} = await import('modern-screenshot');
    await document.fonts.ready;
    const elements = [header, controls, content];
    const bounds = elements.map((element) => element.getBoundingClientRect());

    // Skia clears its WebGL buffers after paint. Copy them in the same task as its redraw, before another paint can clear them.
    const skia = (globalThis as typeof globalThis & {SkiaViewApi?: ISkiaViewApiWeb}).SkiaViewApi;
    for (const view of Object.values(skia?.views ?? {})) {
        view.redraw();
    }
    await Promise.resolve();
    const chartImages = elements.map((element) =>
        Array.from(element.querySelectorAll('canvas, img'), (canvas) => {
            if (!(canvas instanceof HTMLCanvasElement)) {
                return undefined;
            }
            const {width, height} = canvas.getBoundingClientRect();
            return {src: canvas.toDataURL('image/png'), width, height};
        }),
    );

    const captures = await Promise.all(
        elements.map((element, index) =>
            domToCanvas(element, {
                scale: INSIGHTS_EXPORT_SCALE,
                backgroundColor,
                // Use the browser's layout and embed fonts/images instead of reconstructing text on a canvas.
                onCloneNode: (elementClone) => {
                    if (!(elementClone instanceof HTMLElement)) {
                        throw new Error('Insights content could not be cloned');
                    }
                    // The renderer turns canvases into images. Count avatars too so chart indices stay aligned.
                    const clonedImages = elementClone.querySelectorAll('canvas, img');
                    for (const [imageIndex, chartImage] of (chartImages.at(index) ?? []).entries()) {
                        if (!chartImage) {
                            continue;
                        }
                        const canvas = clonedImages.item(imageIndex);
                        if (!(canvas instanceof HTMLElement)) {
                            throw new Error('Insights charts changed during capture');
                        }
                        const image = elementClone.ownerDocument.createElement('img');
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

    const [headerImage, controlsImage, contentImage] = captures;
    const padding = INSIGHTS_EXPORT_PADDING * INSIGHTS_EXPORT_SCALE;
    const canvas = document.createElement('canvas');
    canvas.width = headerImage.width;
    canvas.height = headerImage.height + controlsImage.height + contentImage.height + padding * 3;
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Could not create Insights image');
    }
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    const [headerBounds, controlsBounds, contentBounds] = bounds;
    context.drawImage(headerImage, 0, 0);
    context.drawImage(controlsImage, (controlsBounds.left - headerBounds.left) * INSIGHTS_EXPORT_SCALE, headerImage.height + padding);
    context.drawImage(contentImage, (contentBounds.left - headerBounds.left) * INSIGHTS_EXPORT_SCALE, headerImage.height + controlsImage.height + padding * 2);
    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((image) => (image ? resolve(image) : reject(new Error('Could not encode Insights image'))), 'image/png');
    });
    createDownloadLink(URL.createObjectURL(blob), fileName);
};

export default exportInsightsDashboard;
