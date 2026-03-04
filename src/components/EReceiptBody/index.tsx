import React from 'react';
import ImageSVG from '@components/ImageSVG';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

// The fill color is applied directly to the SVG file because using expo-image's
// tintColor on iOS causes the image to render at 3x resolution.
// On Android, the SVG fill doesn't work, so the color is passed via the fill prop instead (see index.android.tsx).
function EReceiptBody() {
    const icons = useMemoizedLazyExpensifyIcons(['ReceiptBody']);

    return (
        <ImageSVG
            src={icons.ReceiptBody}
            contentFit="fill"
        />
    );
}

export default EReceiptBody;
