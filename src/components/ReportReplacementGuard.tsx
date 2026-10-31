import redirectReplacedReport from '@libs/Navigation/helpers/redirectReplacedReport';
import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ReactElement} from 'react';

import React, {useEffect} from 'react';
// Replacement references must come from persisted live data, not a possibly stale Search snapshot.
// eslint-disable-next-line no-restricted-imports
import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx';

import FullscreenLoadingIndicator from './FullscreenLoadingIndicator';

type ReportReplacementGuardProps = {
    reportID: string | undefined;
    children: ReactElement;
};

/** Resolve a retired report before mounting content that would fetch it or display its not-found state. */
function ReportReplacementGuard({reportID, children}: ReportReplacementGuardProps) {
    const [report, metadata] = useOnyxWithoutSnapshots(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const replacementReportID = !report?.reportID && report?.preexistingReportID !== reportID ? report?.preexistingReportID : undefined;

    useEffect(() => {
        if (!reportID || !replacementReportID) {
            return;
        }
        let isCancelled = false;
        Navigation.isNavigationReady().then(() => {
            if (isCancelled) {
                return;
            }
            redirectReplacedReport(reportID, replacementReportID);
        });
        return () => {
            isCancelled = true;
        };
    }, [reportID, replacementReportID]);

    if (metadata.status === 'loading' || replacementReportID) {
        return <FullscreenLoadingIndicator shouldUseGoBackButton />;
    }

    return children;
}

export default ReportReplacementGuard;
