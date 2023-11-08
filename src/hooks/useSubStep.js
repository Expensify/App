import PropTypes from 'prop-types';
import {useCallback, useRef, useState} from 'react';

const propTypes = {
    /** An array of substep components */
    bodyContent: PropTypes.arrayOf(PropTypes.element).isRequired,

    /** An index of the component from bodyContent array to start from */
    onFinished: PropTypes.func.isRequired,

    /** A callback to be fired when pressing Confirm on the last substep screen */
    startFrom: PropTypes.number,
};

/**
 * Return type for useSubStep hook
 *
 * @typedef {Object} ReturnType
 * @property {React.ReactElement} componentToRender the component to be used in the body of substep scren
 * @property {boolean} isEditing a boolean for the substep to know if we moved back to it and it's being edited
 * @property {number} screenIndex current screen's index
 * @property {Function} nextScreen a function to be called in order to navigate to the next substep screen
 * @property {Function} prevScreen a function to be called in order to navigate to the previous substep screen if possible
 * @property {Function} moveTo a function to be called in order to navigate to a particular substep screen
 */

/**
 * A hook which manages navigation between substeps
 *
 * @param {Object} param
 * @param {[React.ReactElement]} param.bodyContent an array of substep components
 * @param {Function} param.onFinished a callback to be fired when pressing Confirm on the last substep screen
 * @param {number | undefined} param.startFrom
 * @return {ReturnType}
 */
export default function useSubStep({bodyContent, onFinished, startFrom = 0}) {
    const [screenIndex, setScreenIndex] = useState(startFrom);
    const isEditing = useRef(false);

    const prevScreen = useCallback(() => {
        const prevScreenIndex = screenIndex - 1;

        if (prevScreenIndex < 0) {
            return;
        }

        setScreenIndex(prevScreenIndex);
    }, [screenIndex]);

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

    return {componentToRender: bodyContent[screenIndex], isEditing: isEditing.current, screenIndex, prevScreen, nextScreen, moveTo};
}

useSubStep.propTypes = propTypes;
