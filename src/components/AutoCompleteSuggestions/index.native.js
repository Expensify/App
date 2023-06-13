import React from 'react';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import {propTypes} from './autoCompleteSuggestionsPropTypes';

function AutoCompleteSuggestions(props) {
    return <BaseAutoCompleteSuggestions {...props} />;
}

AutoCompleteSuggestions.propTypes = propTypes;
AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
