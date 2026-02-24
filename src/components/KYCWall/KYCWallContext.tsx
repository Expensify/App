import type {ReactNode, RefObject} from 'react';
import React, {createContext, useRef} from 'react';
import type {KYCWallRef} from './types';

type KYCWallContextType = RefObject<KYCWallRef | null>;

const KYCWallContext = createContext<KYCWallContextType>({current: null});

function KYCWallContextProvider({children}: {children: ReactNode}) {
    const kycWallRef = useRef<KYCWallRef>(null);

    return <KYCWallContext.Provider value={kycWallRef}>{children}</KYCWallContext.Provider>;
}

export default KYCWallContextProvider;
export {KYCWallContext};
