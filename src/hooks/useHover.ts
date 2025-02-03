import {useState} from 'react';

const useHover = () => {
    const [hovered, setHovered] = useState(false);
    return {
        hovered,
        bind: {
            onMouseEnter: () => setHovered(true),
            onMouseLeave: () => setHovered(false),
        },
        setHovered,
    };
};

export default useHover;
