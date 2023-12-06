import React, {useRef} from 'react';
import ComposerWithSuggestions from './ComposerWithSuggestions';
import {defaultProps, propTypes} from './composerWithSuggestionsProps';

const ComposerWithSuggestionsWithFocus = React.forwardRef((props, ref) => {
    const textInputRef = useRef(null);
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ComposerWithSuggestions ref={ref} {...props} textInputRef={textInputRef} />;
});

ComposerWithSuggestionsWithFocus.displayName = 'ComposerWithSuggestionsWithRefAndFocus';
ComposerWithSuggestionsWithFocus.propTypes = propTypes;
ComposerWithSuggestionsWithFocus.defaultProps = defaultProps;

export default ComposerWithSuggestionsWithFocus;
