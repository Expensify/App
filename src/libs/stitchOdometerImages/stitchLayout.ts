type ImageRect = {x: number; y: number; w: number; h: number};

type StitchLayout = {
    width: number;
    height: number;
    horizontal: boolean;
    img1Dest: ImageRect;
    img2Dest: ImageRect;
};

/**
 * Calculates the layout for stitching two odometer images into a single combined image.
 *
 * Stitching rules:
 * - Images are merged horizontally (side-by-side) by default
 * - If either image is landscape, images are merged vertically (stacked)
 * - The smaller image is resized so the shared edge matches the length of the larger image's shared edge
 */

function calculateStitchLayout(w1: number, h1: number, w2: number, h2: number): StitchLayout {
    const horizontal = !(w1 > h1 || w2 > h2);

    if (horizontal) {
        // Side-by-side: scale both images to the same height so the shared vertical edges match
        const targetH = Math.max(h1, h2);
        const scaledW1 = Math.round((w1 * targetH) / h1);
        const scaledW2 = Math.round((w2 * targetH) / h2);
        return {
            width: scaledW1 + scaledW2,
            height: targetH,
            horizontal: true,
            img1Dest: {x: 0, y: 0, w: scaledW1, h: targetH},
            img2Dest: {x: scaledW1, y: 0, w: scaledW2, h: targetH},
        };
    }

    // Stacked: scale both images to the same width so the shared horizontal edges match
    const targetW = Math.max(w1, w2);
    const scaledH1 = Math.round((h1 * targetW) / w1);
    const scaledH2 = Math.round((h2 * targetW) / w2);
    return {
        width: targetW,
        height: scaledH1 + scaledH2,
        horizontal: false,
        img1Dest: {x: 0, y: 0, w: targetW, h: scaledH1},
        img2Dest: {x: 0, y: scaledH1, w: targetW, h: scaledH2},
    };
}

export default calculateStitchLayout;
