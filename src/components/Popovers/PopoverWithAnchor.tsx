import React, {useEffect, useCallback} from 'react';
import {Dimensions} from 'react-native';
import Popover from './Popover';

// Minimal diff component showcasing window resize listener integration for popups
function PopoverWithAnchor(props) {
    const {onClose, isVisible} = props;

    const handleResize = useCallback(() => {
        if (isVisible && typeof onClose === 'function') {
            onClose();
        }
    }, [isVisible, onClose]);

    useEffect(() => {
        if (!isVisible) {
            return;
        }
        const dimensionsSubscription = Dimensions.addEventListener('change', handleResize);
        return () => {
            dimensionsSubscription?.remove?.();
        };
    }, [isVisible, handleResize]);

    return <Popover {...props} />;
}

export default PopoverWithAnchor;
