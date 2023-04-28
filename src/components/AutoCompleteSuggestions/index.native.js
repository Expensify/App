import React from 'react';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import {propTypes} from './autoCompleteSuggestionsPropTypes';

const AutoCompleteSuggestions = props => {
    return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseAutoCompleteSuggestions {...props} />
)};

AutoCompleteSuggestions.propTypes = propTypes;
// AutoCompleteSuggestions.defaultProps = defaultProps;
AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;