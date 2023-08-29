import React from 'react';
import PropTypes from 'prop-types';
import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';

const propTypes = {
    /**
     * A ref to forward to the Pressable
     */
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};

const defaultProps = {
    innerRef: () => {},
};

function TwoFactorAuthForm(props) {
    return (
        <BaseTwoFactorAuthForm
            ref={props.innerRef}
            autoComplete="one-time-code"
        />
    );
}

TwoFactorAuthForm.propTypes = propTypes;
TwoFactorAuthForm.defaultProps = defaultProps;
TwoFactorAuthForm.displayName = 'TwoFactorAuthForm';

export default TwoFactorAuthForm;
