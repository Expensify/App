import React, {forwardRef} from 'react';
import BaseOptionsList from './BaseOptionsList';

export default forwardRef((props, ref) => (
    <BaseOptionsList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
    />
));
