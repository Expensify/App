import {useCallback, useEffect, useState} from 'react';

const useIsScrollBarVisible = (ref: React.RefObject<HTMLDivElement | HTMLTextAreaElement>, value: string) => {
    const [isScrollBarVisible, setIsScrollBarVisible] = useState(false);

    const handleResize = useCallback(() => {
        if (!ref.current) {
            return;
        }
        const {scrollHeight, clientHeight} = ref.current;
        setIsScrollBarVisible(scrollHeight > clientHeight);
    }, [ref]);

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
