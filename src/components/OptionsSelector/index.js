import React, {forwardRef} from 'react';
import BaseOptionsSelector from './BaseOptionsSelector';

const OptionsSelector = forwardRef((props, ref) => (
    <BaseOptionsSelector
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        shouldTextInputInterceptSwipe
    />
));

OptionsSelector.displayName = 'OptionsSelector';

export default OptionsSelector;
