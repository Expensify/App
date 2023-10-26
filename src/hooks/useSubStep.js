import {useState, useRef, useCallback} from 'react';
import PropTypes from 'prop-types';

const propTypes = PropTypes.shape({
    bodyContent: PropTypes.arrayOf(PropTypes.element).isRequired,
    startFrom: PropTypes.number.isRequired,
    onFinished: PropTypes.func.isRequired,
});

/**
 * @typedef {Object} ReturnType
 * @property {React.ReactElement} componentToRender
 * @property {boolean} isEditing
 * @property {Function} nextScreen
 * @property {Function} moveTo
 */

/**
 * A hook which manages navigation between substeps
 *
 * @export
 * @param {[React.ReactElement]} bodyContent
 * @param {number} startFrom
 * @param {Function} onFinished
 * @return {ReturnType}
 */

export default function useSubStep({bodyContent, startFrom = 0, onFinished}) {
    const [screenIndex, setScreenIndex] = useState(startFrom);
    const isEditing = useRef(false);

    const nextScreen = useCallback(() => {
        if (isEditing.current) {
            isEditing.current = false;

            setScreenIndex(bodyContent.length - 1);

            return;
        }

        const nextScreenIndex = screenIndex + 1;

        if (nextScreenIndex === bodyContent.length) {
            onFinished();
        } else {
            setScreenIndex(nextScreenIndex);
        }
    }, [screenIndex, bodyContent.length, onFinished]);

    const moveTo = useCallback((step) => {
        isEditing.current = true;
        setScreenIndex(step);
    }, []);

    return {componentToRender: bodyContent[screenIndex], isEditing: isEditing.current, nextScreen, moveTo};
}

useSubStep.propTypes = propTypes;
