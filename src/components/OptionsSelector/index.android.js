import React, {forwardRef} from 'react';
import BaseOptionsSelector from './BaseOptionsSelector';
import {propTypes, defaultProps} from './optionsSelectorPropTypes';

const OptionsSelector = forwardRef((props, ref) => (
    <BaseOptionsSelector
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        shouldDelayFocus
    />
));

OptionsSelector.propTypes = propTypes;
OptionsSelector.defaultProps = defaultProps;
OptionsSelector.displayName = 'OptionsSelector';

export default OptionsSelector;
