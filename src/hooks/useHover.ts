import {useState} from 'react';
import {hasHoverSupport} from '@libs/DeviceCapabilities';

const useHover = () => {
    const [hovered, setHovered] = useState(false);
    const deviceHasHoverSupport = hasHoverSupport();
    return {
        hovered,
        bind: {
            onMouseEnter: () => deviceHasHoverSupport && setHovered(true),
            onMouseLeave: () => deviceHasHoverSupport && setHovered(false),
        },
    };
};

export default useHover;
