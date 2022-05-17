import React, {useRef} from 'react';
import BaseSidebarScreen from './BaseSidebarScreen';

export default function (props) {
    const BaseSidebarScreenRef = useRef(null);

    /**
     * Method create event listener
     */
    const createDragoverListener = () => {
        document.addEventListener('dragover', BaseSidebarScreenRef.current.hideCreateMenu);
    };

    /**
     * Method remove event listener.
     */
    const removeDragoverListener = () => {
        document.removeEventListener('dragover', BaseSidebarScreenRef.current.hideCreateMenu);
    };
    return (
        <BaseSidebarScreen
            innerRef={BaseSidebarScreenRef}
            onShowCreateMenu={createDragoverListener}
            onHideCreateMenu={removeDragoverListener}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}
