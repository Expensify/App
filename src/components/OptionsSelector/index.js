import React, {forwardRef} from 'react';
import BaseOptionsSelector from './BaseOptionsSelector';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const OptionsSelector = forwardRef((props, ref) => {
    const {isSmallScreenWidth} = useWindowDimensions();
    return (
        <BaseOptionsSelector
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            shouldDelayFocus={!isSmallScreenWidth}
        />
    );
});

OptionsSelector.displayName = 'OptionsSelector';

export default OptionsSelector;
