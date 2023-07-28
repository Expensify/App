import React, {forwardRef} from 'react';
import BaseOptionsSelector from './BaseOptionsSelector';
import withWindowDimensions from '../withWindowDimensions';

const OptionsSelector = forwardRef((props, ref) => (
    <BaseOptionsSelector
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        shouldDelayFocus={!props.isSmallScreenWidth}
    />
));

OptionsSelector.displayName = 'OptionsSelector';

export default withWindowDimensions(OptionsSelector);