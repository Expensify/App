import type {AutoCompleteSuggestionsProps} from '@components/AutoCompleteSuggestions/types';

type ExternalProps<TSuggestion> = Omit<AutoCompleteSuggestionsProps<TSuggestion>, 'measureParentContainerAndReportCursor'>;

type AutoCompleteSuggestionsPortalProps<TSuggestion> = ExternalProps<TSuggestion> & {
    left: number;
    width: number;
    bottom: number;

    /** Keyboard height `bottom` was offset by, used on native to re-base `bottom` onto the portal host's frame */
    keyboardHeight?: number;
    measuredHeightOfSuggestionRows: number;

    /** Whether the menu is rendered above the caret, which decides the gap kept between the menu and the caret */
    isMenuAbove?: boolean;
};

// eslint-disable-next-line import/prefer-default-export
export type {AutoCompleteSuggestionsPortalProps};
