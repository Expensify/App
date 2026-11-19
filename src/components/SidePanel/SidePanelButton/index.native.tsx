import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import useSidePanelState from '@hooks/useSidePanelState';

import getFocusedWorkspacePolicyID from '@libs/Navigation/helpers/getFocusedWorkspacePolicyID';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';

import {navigateToConciergeChat} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import React from 'react';

import type SidePanelButtonProps from './types';

import ConciergePageButton from './ConciergePageButton';
import HelpButton from './HelpButton';

function SidePanelButton({style}: SidePanelButtonProps) {
    const {shouldHideHelpButton} = useSidePanelState();
    const {accountID: currentUserAccountID = CONST.DEFAULT_NUMBER_ID} = useCurrentUserPersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const isSelfTourViewed = guidedSetupAndTourStatus?.isSelfTourViewed;
    const hasCompletedGuidedSetupFlow = guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow;
    const [conciergePersonalDetails] = usePersonalDetailsByIDs([CONST.ACCOUNT_ID.CONCIERGE]);
    const delegateAccountID = useDelegateAccountID();
    const {isBetaEnabled} = usePermissions();
    if (shouldHideHelpButton) {
        return null;
    }

    if (isBetaEnabled(CONST.BETAS.FLAT_NAV)) {
        return <ConciergePageButton style={style} />;
    }

    return (
        <HelpButton
            style={style}
            onPress={() => {
                // Capture the report the user is viewing (still topmost at press time) so Concierge can act on it
                // after we navigate away. This is the only entry that threads a source report, so context is scoped
                // to Concierge opened via this sidebar button. Search, LHN, and deep links never carry it.
                // On a workspace page the topmost report is the last one the user left, not what is on screen, so
                // send only the workspace.
                const sourcePolicyID = getFocusedWorkspacePolicyID(navigationRef.getRootState());
                const sourceReportID = sourcePolicyID ? undefined : Navigation.getTopmostReportId();
                navigateToConciergeChat({
                    conciergeReportID,
                    introSelected,
                    currentUserAccountID,
                    isSelfTourViewed,
                    hasCompletedGuidedSetupFlow,
                    conciergePersonalDetails,
                    sourceReportID: sourceReportID && sourceReportID !== conciergeReportID ? sourceReportID : undefined,
                    sourcePolicyID,
                    delegateAccountID,
                });
            }}
        />
    );
}

export default SidePanelButton;
