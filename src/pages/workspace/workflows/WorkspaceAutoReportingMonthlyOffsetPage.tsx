import {setDraftValues} from '@libs/actions/FormActions';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';

import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceSubmissionFrequencyForm';

import React from 'react';

import AutoReportingDayOfMonthPicker from './AutoReportingDayOfMonthPicker';
import useSubmissionFrequencyDraft from './useSubmissionFrequencyDraft';

type WorkspaceAutoReportingMonthlyOffsetProps = WithPolicyOnyxProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_MONTHLY_OFFSET>;

function WorkspaceAutoReportingMonthlyOffsetPage({policy, route}: WorkspaceAutoReportingMonthlyOffsetProps) {
    const {offset} = useSubmissionFrequencyDraft(policy);

    return (
        <AutoReportingDayOfMonthPicker
            policy={policy}
            routePolicyID={route.params.policyID}
            testID="WorkspaceAutoReportingMonthlyOffsetPage"
            selectedOffset={offset}
            shouldShowMonthlyOnlyEntries
            onSave={(newOffset) => {
                setDraftValues(ONYXKEYS.FORMS.WORKSPACE_SUBMISSION_FREQUENCY_FORM, {[INPUT_IDS.OFFSET]: String(newOffset)});
            }}
        />
    );
}

export default withPolicy(WorkspaceAutoReportingMonthlyOffsetPage);
