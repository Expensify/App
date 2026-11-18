import CONST from '@src/CONST';

import {useEffect, useRef} from 'react';

import type {UseKeyboardDrivenScroll} from './types';

// No keyboard frames on web, so it scrolls once the keyboard transition is over
const useKeyboardDrivenScroll: UseKeyboardDrivenScroll = (scrollableRef) => {
    const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => clearTimeout(scrollTimer.current ?? undefined), []);

    return (offset) => {
        clearTimeout(scrollTimer.current ?? undefined);
        scrollTimer.current = setTimeout(() => scrollableRef.current?.scrollTo({y: Math.max(offset, 0), animated: true}), CONST.ANIMATED_TRANSITION);
    };
};

export default useKeyboardDrivenScroll;
