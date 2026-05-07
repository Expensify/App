import React from 'react';
import ImageSVG from '@components/ImageSVG';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';

// On Android, applying the fill color directly to the SVG doesn't work,
// so the color is passed via the fill prop (expo-image's tintColor) instead.
// On iOS, the fill is baked into the SVG to avoid a 3x resolution rendering issue (see index.tsx).
function EReceiptBody() {
    const icons = useMemoizedLazyExpensifyIcons(['ReceiptBody']);
    const theme = useTheme();

    return (
        <ImageSVG
            src={icons.ReceiptBody}
            contentFit="fill"
            fill={theme.textColorfulBackground}
        />
    );
}

export default EReceiptBody;
