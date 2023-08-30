import React from 'react';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import {propTypes} from './autoCompleteSuggestionsPropTypes';

function AutoCompleteSuggestions({parentContainerRef, ...props}) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <BaseAutoCompleteSuggestions {...props} />;
}

AutoCompleteSuggestions.propTypes = propTypes;
AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
