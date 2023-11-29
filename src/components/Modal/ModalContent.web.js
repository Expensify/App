import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    /** Modal contents */
    children: PropTypes.node.isRequired,

    /** called after modal content is dismissed */
    onDismiss: PropTypes.func,
};

function ModalContent({children, onDismiss = () => {}}) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => () => onDismiss(), []);
    return children;
}

ModalContent.propTypes = propTypes;
ModalContent.displayName = 'ModalContent';

export default ModalContent;
