import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

/** Bar-level configuration for the composed `<Header>` (content lives in the child blocks). */
type HeaderProps = {
    /** The composed content of the header — `Header.Left` / `Header.Center` / `Header.Right` zones. */
    children: ReactNode;

    /** Whether we should show a border on the bottom of the Header. */
    shouldShowBorderBottom?: boolean;

    /** Whether the header should use the headline header style (taller bar + headline title font). */
    shouldUseHeadlineHeader?: boolean;

    /** Whether the popover menu should overlay the current view (absolutely fills its parent). */
    shouldOverlay?: boolean;

    /** The fill color shared by the header icons. Can be hex, rgb, rgba, or a valid react-native named color. */
    iconFill?: string;

    /** Additional styles to add to the outer header bar. */
    style?: StyleProp<ViewStyle>;
};

export default HeaderProps;
