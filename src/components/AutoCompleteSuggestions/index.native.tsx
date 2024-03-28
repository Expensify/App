import {Portal} from '@gorhom/portal';
import React from 'react';
import {useSuggestionsContext} from '@pages/home/report/ReportActionCompose/ComposerWithSuggestionsEdit/SuggestionsContext';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import type {AutoCompleteSuggestionsProps} from './types';

function AutoCompleteSuggestions<TSuggestion>({measureParentContainer, ...props}: AutoCompleteSuggestionsProps<TSuggestion>) {
    const {activeID} = useSuggestionsContext();
    return (
        <Portal hostName={`suggestions_${activeID ?? '0'}`}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <BaseAutoCompleteSuggestions<TSuggestion> {...props} />
        </Portal>
    );
}

AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
