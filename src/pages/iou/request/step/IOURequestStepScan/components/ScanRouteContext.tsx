import React, {createContext, useContext} from 'react';
import type {ScanRoute} from '@pages/iou/request/step/IOURequestStepScan/types';

type ScanRouteParams = ScanRoute['params'];

const ScanRouteContext = createContext<ScanRouteParams | undefined>(undefined);

type ScanRouteProviderProps = {
    children: React.ReactNode;
    route: ScanRoute;
};

function ScanRouteProvider({children, route}: ScanRouteProviderProps) {
    return <ScanRouteContext.Provider value={route.params}>{children}</ScanRouteContext.Provider>;
}

function useScanRouteParams(): ScanRouteParams {
    const context = useContext(ScanRouteContext);
    if (context === undefined) {
        throw new Error('useScanRouteParams must be used within a ScanRouteProvider');
    }
    return context;
}

export {ScanRouteProvider, useScanRouteParams};
export type {ScanRouteParams};
