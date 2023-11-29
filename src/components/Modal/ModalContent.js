import PropTypes from 'prop-types';

const propTypes = {
    /** Modal contents */
    children: PropTypes.node.isRequired,

    /** called after modal content is dismissed */
    onDismiss: PropTypes.func,
};

function ModalContent({children}) {
    return children;
}

ModalContent.propTypes = propTypes;
ModalContent.displayName = 'ModalContent';

export default ModalContent;
