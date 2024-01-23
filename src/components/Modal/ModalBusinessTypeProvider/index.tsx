import React, {useMemo} from 'react';
import CONST from '@src/CONST';
import type {ModalBusinessTypeContextProps, ModalBusinessTypeContextValue} from './types';

const ModalBusinessTypeContext = React.createContext<ModalBusinessTypeContextValue>({
    businessType: CONST.MODAL.BUSINESS_TYPE.DEFAULT,
});

function ModalBusinessTypeProvider({businessType, children}: ModalBusinessTypeContextProps) {
    const contextValue = useMemo(
        () => ({
            businessType,
        }),
        [businessType],
    );
    return <ModalBusinessTypeContext.Provider value={contextValue}>{children}</ModalBusinessTypeContext.Provider>;
}

export default ModalBusinessTypeProvider;
export {ModalBusinessTypeContext};
