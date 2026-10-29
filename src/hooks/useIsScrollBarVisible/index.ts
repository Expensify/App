import {useEffect, useState} from 'react';

const useIsScrollBarVisible = (ref: React.RefObject<HTMLDivElement | HTMLTextAreaElement | null>, value: string) => {
    const [isScrollBarVisible, setIsScrollBarVisible] = useState(false);

    const handleResize = () => {
        if (!ref.current) {
            return;
        }
        const {scrollHeight, clientHeight} = ref.current;
        setIsScrollBarVisible(scrollHeight > clientHeight);
    };

    useEffect(() => {
        if (!ref.current || !('ResizeObserver' in (window || {}))) {
            return;
        }

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(ref.current);
        return () => {
            resizeObserver.disconnect();
        };
    }, [handleResize, ref, value]);
    return isScrollBarVisible;
};

export default useIsScrollBarVisible;
