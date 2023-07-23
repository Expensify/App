import {useEffect} from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    /** Content */
    children: PropTypes.node.isRequired,
};

function NoDropZone(props) {
    useEffect(() => {
        document.addEventListener('dragover', handleDragOver);

        return () => {
            document.removeEventListener('dragover', handleDragOver);
        };
    }, []);

    function handleDragOver(event) {
        event.preventDefault();
        console.log('dragover');
        event.dataTransfer.dropEffect = 'none';
    }

    return props.children;
}

NoDropZone.displayName = 'NoDropZone';
NoDropZone.propTypes = propTypes;

export default NoDropZone;
