import {Portal} from '@gorhom/portal';
import React from 'react';
import {propTypes} from './autoCompleteSuggestionsPropTypes';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';

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
