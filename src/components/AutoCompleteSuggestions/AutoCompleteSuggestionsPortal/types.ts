import type {AutoCompleteSuggestionsProps} from '@components/AutoCompleteSuggestions/types';

type ExternalProps<TSuggestion> = Omit<AutoCompleteSuggestionsProps<TSuggestion>, 'measureParentContainerAndReportCursor'>;

type AutoCompleteSuggestionsPortalProps<TSuggestion> = ExternalProps<TSuggestion> & {
    left: number;
    width: number;
    bottom: number;
    measuredHeightOfSuggestionRows: number;
};

// eslint-disable-next-line import/prefer-default-export
export type {AutoCompleteSuggestionsPortalProps};
