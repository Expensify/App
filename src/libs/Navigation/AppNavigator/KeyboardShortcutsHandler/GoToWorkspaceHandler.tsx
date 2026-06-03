import {useEffect, useRef} from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function GoToWorkspaceHandler() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldUseNarrowLayoutRef = useRef(shouldUseNarrowLayout);

    useEffect(() => {
        shouldUseNarrowLayoutRef.current = shouldUseNarrowLayout;
    }, [shouldUseNarrowLayout]);

    useEffect(() => {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.GO_TO_WORKSPACE;
        const unsubscribe = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            callFunctionIfActionIsAllowed(() => {
                const reportID = Navigation.getTopmostReportId();
                if (!reportID) {
                    return;
                }

                const report = getReportOrDraftReport(reportID);
                const policyID = report?.policyID ?? (report?.parentReportID ? getReportOrDraftReport(report.parentReportID)?.policyID : undefined);
                if (!policyID || policyID === CONST.POLICY.ID_FAKE) {
                    return;
                }

                const route = shouldUseNarrowLayoutRef.current ? ROUTES.WORKSPACE_INITIAL.getRoute(policyID, Navigation.getActiveRoute()) : ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID);
                Navigation.navigate(route);
            }),
            shortcutConfig.descriptionKey,
            shortcutConfig.modifiers,
            true,
        );

        return () => unsubscribe();
    }, []);

    return null;
}

export default GoToWorkspaceHandler;
