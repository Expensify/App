import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    /** Children to wrap with FormSubmit. */
    children: PropTypes.node.isRequired,
};

function FormSubmit(props) {
    return (
        <>
            {props.children}
        </>
    );
}

FormSubmit.propTypes = propTypes;
FormSubmit.displayName = 'FormSubmit';

export default FormSubmit;
