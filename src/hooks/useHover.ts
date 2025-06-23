import {useState} from 'react';
import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

const useHover = () => {
    const [hovered, setHovered] = useState(false);
    const canUseTouchScreen = canUseTouchScreenUtil();
    return {
        hovered,
        bind: {
            onMouseEnter: () => !canUseTouchScreen && setHovered(true),
            onMouseLeave: () => !canUseTouchScreen && setHovered(false),
        },
    };
};

export default useHover;
