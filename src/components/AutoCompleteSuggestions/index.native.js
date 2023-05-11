import React from 'react';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import {propTypes} from './autoCompleteSuggestionsPropTypes';

const AutoCompleteSuggestions = (props) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseAutoCompleteSuggestions {...props} />
);

AutoCompleteSuggestions.propTypes = propTypes;
AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
