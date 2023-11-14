import {Portal} from '@gorhom/portal';
import React from 'react';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import type AutoCompleteSuggestionsProps from './types';

function AutoCompleteSuggestions<Suggestion>({measureParentContainer, ...props}: AutoCompleteSuggestionsProps<Suggestion>) {
    return (
        <Portal hostName="suggestions">
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <BaseAutoCompleteSuggestions<Suggestion> {...props} />
        </Portal>
    );
}

AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
