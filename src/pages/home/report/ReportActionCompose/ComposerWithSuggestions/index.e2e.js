import React from 'react';
import ComposerWithSuggestions from './ComposerWithSuggestions';

export default React.forwardRef((props, ref) => {
    console.log('⚠️⚡️🤡 JOOOOO LOADING FROM e2E file brother');
    return (
        <ComposerWithSuggestions
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    );
});
