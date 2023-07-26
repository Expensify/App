import {useEffect} from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    /** Content */
    children: PropTypes.node.isRequired,
};

function NoDropZone(props) {
    function handleDrag(event) {
        event.preventDefault();
        // eslint-disable-next-line no-param-reassign
        event.dataTransfer.dropEffect = 'none';
    }

    useEffect(() => {
        document.addEventListener('dragenter', handleDrag);
        document.addEventListener('dragover', handleDrag);

        return () => {
            document.removeEventListener('dragenter', handleDrag);
            document.removeEventListener('dragover', handleDrag);
        };
    }, []);

    return props.children;
}

NoDropZone.displayName = 'NoDropZone';
NoDropZone.propTypes = propTypes;

export default NoDropZone;
