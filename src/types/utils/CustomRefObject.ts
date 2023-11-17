import {RefObject} from 'react';

type CustomRefObject<T> = RefObject<T> & {onselectstart: () => boolean};

export default CustomRefObject;
