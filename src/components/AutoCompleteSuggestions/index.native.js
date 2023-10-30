import React from 'react';
import {Portal} from '@gorhom/portal';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import {propTypes} from './autoCompleteSuggestionsPropTypes';

function AutoCompleteSuggestions({measureParentContainer, ...props}) {
    return (
        <Portal hostName="suggestions">
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <BaseAutoCompleteSuggestions {...props} />
        </Portal>
    );
}

AutoCompleteSuggestions.propTypes = propTypes;
AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
