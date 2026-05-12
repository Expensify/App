import type {StyleProp, TextStyle} from 'react-native';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import type {AvatarSource} from '@libs/UserAvatarUtils';

type DisplayNameWithTooltip = {
    /** The name to display in bold */
    displayName?: string;

    /** The Account ID for the tooltip */
    accountID?: number;

    /** The login for the tooltip fallback */
    login?: string;

    /** The avatar for the tooltip fallback */
    avatar?: AvatarSource;
};

type DisplayNamesProps = ForwardedFSClassProps & {
    /** The full title of the DisplayNames component (not split up) */
    fullTitle: string;

    /**
     * Whether `fullTitle` should be processed through Parser.htmlToText().
     * Set to true when `fullTitle` contains HTML that needs to be converted to plain text
     * Set to false when `fullTitle` is already plain text or when you want to preserve
     * any HTML formatting in the display.
     */
    shouldParseFullTitle?: boolean;

    /** Array of objects that map display names to their corresponding tooltip */
    displayNamesWithTooltips?: DisplayNameWithTooltip[];

    /** Number of lines before wrapping */
    numberOfLines: number;

    /** Is tooltip needed? When true, triggers complex title rendering */
    tooltipEnabled?: boolean;

    /** Arbitrary styles of the displayName text */
    textStyles?: StyleProp<TextStyle>;

    /**
     * Overrides the text that's read by the screen reader when the user interacts with the element. By default, the
     * label is constructed by traversing all the children and accumulating all the Text nodes separated by space.
     */
    accessibilityLabel?: string;

    /** If the full title needs to be displayed */
    shouldUseFullTitle?: boolean;

    /** If we should add an ellipsis after the participants list */
    shouldAddEllipsis?: boolean;

    /** Whether to parse HTML in the title */
    shouldParseHtml?: boolean;

    /** Additional Text component to render after the displayNames */
    renderAdditionalText?: () => React.ReactNode;

    /** TestID indicating order */
    testID?: number;
};

export default DisplayNamesProps;

export type {DisplayNameWithTooltip};
