import type {RefObject} from 'react';

type UseEndPeekOnFocusLeave = (surfaceRef: RefObject<HTMLElement | null>, isPeeking: boolean, endPeek: () => void) => void;

export default UseEndPeekOnFocusLeave;
