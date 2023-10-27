import {useState, useRef, useCallback} from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    bodyContent: PropTypes.arrayOf(PropTypes.element).isRequired,
    startFrom: PropTypes.number.isRequired,
    onFinished: PropTypes.func.isRequired,
};

/**
 * Return type for useSubStep hook
 *
 * @typedef {Object} ReturnType
 * @property {React.ReactElement} componentToRender the component to be used in the body of substep scren
 * @property {boolean} isEditing a boolean for the substep to know if we moved back to it and it's being edited
 * @property {Function} nextScreen a function to be called in order to navigate to the next substep screen
 * @property {Function} moveTo a function to be called in order to navigate to a particular substep screen
 */

/**
 * A hook which manages navigation between substeps
 *
 * @param {[React.ReactElement]} bodyContent an array of substep components
 * @param {number} startFrom an index of the component from bodyContent array to start from
 * @param {Function} onFinished a callback to be fired when pressing Confirm on the last substep screen
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
