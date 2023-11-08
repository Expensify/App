import {Portal} from '@gorhom/portal';
import React from 'react';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import type {AutoCompleteSuggestionsProps} from './types';

function AutoCompleteSuggestions({measureParentContainer, ...props}: AutoCompleteSuggestionsProps) {
    return (
        <Portal hostName="suggestions">
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <BaseAutoCompleteSuggestions {...props} />
        </Portal>
    );
}

AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
