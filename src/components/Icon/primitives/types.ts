import type {ImageContentFit} from 'expo-image';
import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type {Dimensions} from '@src/types/utils/Layout';

/** Preset icon size values from `CONST.ICON_SIZE`. */
type IconSize = ValueOf<typeof CONST.ICON_SIZE>;

/** Shared render props for icon primitive components. */
type BaseIconProps = {
    /** Test identifier for end-to-end tests. */
    testID: string;

    /** Additional styles applied to the icon wrapper. */
    additionalStyles: StyleProp<ViewStyle>;

    /** Icon asset to render. */
    src: IconAsset;

    /** Rendered width of the SVG content. */
    iconWidth?: number | `${number}%` | 'auto';

    /** Rendered height of the SVG content. */
    iconHeight?: number | `${number}%` | 'auto';

    /** Fill color passed to the SVG. */
    fill?: string;

    /** Whether the icon is in a hovered state. */
    isHovered: boolean;

    /** Whether the icon is in a pressed state. */
    isPressed: boolean;

    /** How the SVG content should fit its container. */
    contentFit: ImageContentFit;
};

/** Shared props for primitives that also receive a measured or layout content size. */
type ContentSizedIconProps = BaseIconProps & {
    /** Layout size for inline icons, or intrinsic content size for gesture canvases. */
    contentSize: Dimensions;
};

export type {BaseIconProps, ContentSizedIconProps, IconSize};
