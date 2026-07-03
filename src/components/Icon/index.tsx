import useStyleUtils from '@hooks/useStyleUtils';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import type {ImageContentFit} from 'expo-image';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

import type {IconSize} from './primitives/types';

import BaseIcon from './primitives/BaseIcon';
import InlineIcon from './primitives/InlineIcon';
import resolveIconSize from './primitives/resolveIconSize';

type IconProps = {
    /** The asset to render. */
    src: IconAsset | undefined;

    /** Custom width when no preset size is selected. */
    width?: number;

    /** Custom height when no preset size is selected. */
    height?: number;

    /** Fill color for the SVG. */
    fill?: string;

    /** Preset icon size. */
    size?: IconSize;

    /**
     * @deprecated Use `size={CONST.ICON_SIZE.EXTRA_SMALL}` instead.
     * Renders an extra small icon.
     */
    extraSmall?: boolean;

    /**
     * @deprecated Use `size={CONST.ICON_SIZE.SMALL}` instead.
     * Renders a small icon.
     */
    small?: boolean;

    /**
     * @deprecated Use `size={CONST.ICON_SIZE.MEDIUM}` instead.
     * Renders a medium icon.
     */
    medium?: boolean;

    /**
     * @deprecated Use `size={CONST.ICON_SIZE.LARGE}` instead.
     * Renders a large icon.
     */
    large?: boolean;

    /** Renders the icon inline within text. */
    inline?: boolean;

    /** Whether the icon is hovered. */
    hovered?: boolean;

    /** Whether the icon is pressed. */
    pressed?: boolean;

    /** Additional styles for the icon wrapper. */
    additionalStyles?: StyleProp<ViewStyle>;

    /** Test identifier for end-to-end tests. */
    testID?: string;

    /** How the SVG content should fit its container. */
    contentFit?: ImageContentFit;

    /** Keeps icon sizing consistent when used inside buttons. */
    isButtonIcon?: boolean;

    /** When set, exposes the icon to assistive tech. Leave unset for decorative icons. */
    accessibilityLabel?: string;
};

/** Renders an SVG icon with preset sizes and inline layout. */
function Icon({
    src,
    width = variables.iconSizeNormal,
    height = variables.iconSizeNormal,
    fill = undefined,
    size,
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Backward compatibility adapter for legacy size boolean props
    extraSmall = false,
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Backward compatibility adapter for legacy size boolean props
    small = false,
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Backward compatibility adapter for legacy size boolean props
    large = false,
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Backward compatibility adapter for legacy size boolean props
    medium = false,
    inline = false,
    additionalStyles = [],
    hovered = false,
    pressed = false,
    testID = '',
    contentFit = 'cover',
    isButtonIcon = false,
    accessibilityLabel,
}: IconProps) {
    const StyleUtils = useStyleUtils();

    if (!src) {
        return null;
    }

    const resolvedSize = resolveIconSize(size, extraSmall, small, medium, large);
    const {width: iconWidth, height: iconHeight} = StyleUtils.getIconWidthAndHeightStyle(resolvedSize, width, height, isButtonIcon);

    if (inline) {
        const contentSize = {width, height};
        return (
            <InlineIcon
                testID={testID}
                additionalStyles={additionalStyles}
                src={src}
                contentSize={contentSize}
                iconWidth={iconWidth}
                iconHeight={iconHeight}
                fill={fill}
                isHovered={hovered}
                isPressed={pressed}
                contentFit={contentFit}
            />
        );
    }

    return (
        <BaseIcon
            testID={testID}
            accessibilityLabel={accessibilityLabel}
            additionalStyles={additionalStyles}
            src={src}
            iconWidth={iconWidth}
            iconHeight={iconHeight}
            fill={fill}
            isHovered={hovered}
            isPressed={pressed}
            contentFit={contentFit}
        />
    );
}

export default Icon;
export type {IconProps};
