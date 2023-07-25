import {useEffect} from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    /** Content */
    children: PropTypes.node.isRequired,
};

function NoDropZone(props) {
    function handleDragOver(event) {
        event.preventDefault();
        // eslint-disable-next-line no-param-reassign
        event.dataTransfer.dropEffect = 'none';
    }

    useEffect(() => {
        document.addEventListener('dragover', handleDragOver);

        return () => {
            document.removeEventListener('dragover', handleDragOver);
        };
    }, []);

    return props.children;
}

NoDropZone.displayName = 'NoDropZone';
NoDropZone.propTypes = propTypes;

export default NoDropZone;
