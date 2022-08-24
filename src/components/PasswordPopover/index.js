import React, {forwardRef} from 'react';
import BasePasswordPopover from './BasePasswordPopover';
import {propTypes, defaultProps} from './passwordPopoverPropTypes';

const PasswordPopover = forwardRef((props, ref) => (
    <BasePasswordPopover
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
    />
));

PasswordPopover.propTypes = propTypes;
PasswordPopover.defaultProps = defaultProps;
PasswordPopover.displayName = 'PasswordPopover';

export default PasswordPopover;
