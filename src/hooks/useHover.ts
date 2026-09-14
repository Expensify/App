import {hasHoverSupport} from '@libs/DeviceCapabilities';

import {useState} from 'react';

const useHover = () => {
    const [hovered, setHovered] = useState(false);
    const deviceHasHoverSupport = hasHoverSupport();
    return {
        hovered,
        deviceHasHoverSupport,
        bind: {
            onMouseEnter: () => deviceHasHoverSupport && setHovered(true),
            onMouseLeave: () => deviceHasHoverSupport && setHovered(false),
        },
    };
};

export default useHover;
