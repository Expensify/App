import React from 'react';
import {Portal} from '@gorhom/portal';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import {propTypes} from './autoCompleteSuggestionsPropTypes';

function AutoCompleteSuggestions({measureParentContainer, ...props}) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return (
        <Portal hostName="suggestions">
            <BaseAutoCompleteSuggestions {...props} />
        </Portal>
    );
}

AutoCompleteSuggestions.propTypes = propTypes;
AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
