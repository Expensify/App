/**
 * Merges two odometer images into a single image.
 * Images are merged horizontally by default (when all images are portrait or square).
 * Images are merged vertically when any image is landscape.
 * Uses PNG format to support transparent pixels for excess space.
 *
 * @param startImage - The start odometer image (File object on web)
 * @param endImage - The end odometer image (File object on web)
 * @returns Promise that resolves to a File object containing the merged image
 */
function mergeImages(startImage: File, endImage: File): Promise<File> {
    return new Promise((resolve, reject) => {
        // Load both images
        const image1 = new Image();
        const image2 = new Image();

        const objectUrl1 = URL.createObjectURL(startImage);
        const objectUrl2 = URL.createObjectURL(endImage);

        let image1Loaded = false;
        let image2Loaded = false;

        const checkBothLoaded = () => {
            if (!image1Loaded || !image2Loaded) {
                return;
            }

            try {
                // Get dimensions
                const width1 = image1.naturalWidth;
                const height1 = image1.naturalHeight;
                const width2 = image2.naturalWidth;
                const height2 = image2.naturalHeight;

                // Determine merge direction
                // Horizontal (default): When all images are portrait or square (width <= height)
                // Vertical: When any image is landscape (width > height)
                const isHorizontal = width1 <= height1 && width2 <= height2;

                let canvas: HTMLCanvasElement;
                let ctx: CanvasRenderingContext2D;

                if (isHorizontal) {
                    // Scale all images to the maximum height, maintaining aspect ratio
                    const maxHeight = Math.max(height1, height2);
                    const scale1 = maxHeight / height1;
                    const scale2 = maxHeight / height2;
                    const scaledWidth1 = width1 * scale1;
                    const scaledWidth2 = width2 * scale2;
                    const scaledHeight = maxHeight;

                    // Create canvas with combined width
                    canvas = document.createElement('canvas');
                    canvas.width = scaledWidth1 + scaledWidth2;
                    canvas.height = scaledHeight;
                    const context = canvas.getContext('2d');
                    if (!context) {
                        URL.revokeObjectURL(objectUrl1);
                        URL.revokeObjectURL(objectUrl2);
                        reject(new Error('Failed to get canvas context'));
                        return;
                    }
                    ctx = context;

                    // Draw images side by side
                    ctx.drawImage(image1, 0, 0, scaledWidth1, scaledHeight);
                    ctx.drawImage(image2, scaledWidth1, 0, scaledWidth2, scaledHeight);
                } else {
                    // Scale all images to the maximum width, maintaining aspect ratio
                    const maxWidth = Math.max(width1, width2);
                    const scale1 = maxWidth / width1;
                    const scale2 = maxWidth / width2;
                    const scaledHeight1 = height1 * scale1;
                    const scaledHeight2 = height2 * scale2;
                    const scaledWidth = maxWidth;

                    // Create canvas with combined height
                    canvas = document.createElement('canvas');
                    canvas.width = scaledWidth;
                    canvas.height = scaledHeight1 + scaledHeight2;
                    const context = canvas.getContext('2d');
                    if (!context) {
                        URL.revokeObjectURL(objectUrl1);
                        URL.revokeObjectURL(objectUrl2);
                        reject(new Error('Failed to get canvas context'));
                        return;
                    }
                    ctx = context;

                    // Draw images stacked vertically
                    ctx.drawImage(image1, 0, 0, scaledWidth, scaledHeight1);
                    ctx.drawImage(image2, 0, scaledHeight1, scaledWidth, scaledHeight2);
                }

                // Convert canvas to blob, then to File
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to create merged image blob'));
                            return;
                        }

                        const mergedFile = new File([blob], 'odometer-merged.png', {type: 'image/png'});
                        // Add uri property for compatibility using Object.defineProperty
                        // This ensures the property is properly set and not writable
                        const blobUrl = URL.createObjectURL(blob);
                        Object.defineProperty(mergedFile, 'uri', {
                            value: blobUrl,
                            writable: false,
                            enumerable: true,
                            configurable: true,
                        });

                        // Clean up object URLs
                        URL.revokeObjectURL(objectUrl1);
                        URL.revokeObjectURL(objectUrl2);

                        resolve(mergedFile);
                    },
                    'image/png',
                    1.0,
                );
            } catch (error) {
                URL.revokeObjectURL(objectUrl1);
                URL.revokeObjectURL(objectUrl2);
                reject(error);
            }
        };

        image1.onload = () => {
            image1Loaded = true;
            checkBothLoaded();
        };
        image1.onerror = () => {
            URL.revokeObjectURL(objectUrl1);
            URL.revokeObjectURL(objectUrl2);
            reject(new Error('Failed to load start image'));
        };

        image2.onload = () => {
            image2Loaded = true;
            checkBothLoaded();
        };
        image2.onerror = () => {
            URL.revokeObjectURL(objectUrl1);
            URL.revokeObjectURL(objectUrl2);
            reject(new Error('Failed to load end image'));
        };

        image1.src = objectUrl1;
        image2.src = objectUrl2;
    });
}

export default mergeImages;

