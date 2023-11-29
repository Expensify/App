import {StyleProp, TextStyle} from 'react-native';
import type {AvatarSource} from '@libs/UserUtils';

type DisplayNameWithTooltip = {
    /** The name to display in bold */
    displayName?: string;

    /** The Account ID for the tooltip */
    accountID?: number;

    /** The login for the tooltip fallback */
    login?: string;

    /** The avatar for the tooltip fallback */
    avatar: AvatarSource;
};

type DisplayNamesProps = {
    /** The full title of the DisplayNames component (not split up) */
    fullTitle: string;

    /** Array of objects that map display names to their corresponding tooltip */
    displayNamesWithTooltips: DisplayNameWithTooltip[];

    /** Number of lines before wrapping */
    numberOfLines: number;

    /** Is tooltip needed? When true, triggers complex title rendering */
    tooltipEnabled?: boolean;

    /** Arbitrary styles of the displayName text */
    textStyles: StyleProp<TextStyle>;

    /**
     * Overrides the text that's read by the screen reader when the user interacts with the element. By default, the
     * label is constructed by traversing all the children and accumulating all the Text nodes separated by space.
     */
    accessibilityLabel?: string;

    /** If the full title needs to be displayed */
    shouldUseFullTitle?: boolean;
};

export default DisplayNamesProps;
