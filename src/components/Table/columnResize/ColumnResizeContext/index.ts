import type {ColumnResizeController} from '@components/Table/columnResize/useColumnResize/types';

import {createContext, useContext} from 'react';

/** Lets handles work in any table that mounts `useColumnResize`. `undefined` outside a provider, where handles render nothing. */
const ColumnResizeContext = createContext<ColumnResizeController | undefined>(undefined);

function useColumnResizeController(): ColumnResizeController | undefined {
    return useContext(ColumnResizeContext);
}

export default ColumnResizeContext;
export {useColumnResizeController};
