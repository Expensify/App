import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

type Reports = OnyxCollection<Report>;
type ReportsContextValue = Reports;

type ReportsContextProviderProps = {
    children: React.ReactNode;
};

const ReportsContext = createContext<ReportsContextValue>(null);

function ReportsContextProvider(props: ReportsContextProviderProps) {
    const [reports, setReports] = useState<Reports>(null);

    useEffect(() => {
        // eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
        const connID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT,
            waitForCollectionCallback: true,
            callback: (val) => {
                setReports(val);
            },
        });
        return () => {
            Onyx.disconnect(connID);
        };
    }, []);

    const contextValue = useMemo(() => reports ?? {}, [reports]);

    return <ReportsContext.Provider value={contextValue}>{props.children}</ReportsContext.Provider>;
}

function useReports() {
    return useContext(ReportsContext);
}

ReportsContextProvider.displayName = 'ReportsContextProvider';

export {ReportsContextProvider, ReportsContext, useReports};
