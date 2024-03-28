import React, {forwardRef} from 'react';
import BaseOptionsSelector from './BaseOptionsSelector';

/**
 * @deprecated Please use `SelectionList` instead.
 */
const OptionsSelector = forwardRef((props, ref) => (
    <BaseOptionsSelector
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        shouldDelayFocus
    />
));

OptionsSelector.displayName = 'OptionsSelector';

export default OptionsSelector;
