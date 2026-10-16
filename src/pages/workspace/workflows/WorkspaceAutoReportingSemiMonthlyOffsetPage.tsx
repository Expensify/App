import {setDraftValues} from '@libs/actions/FormActions';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';

import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceSubmissionFrequencyForm';

import React from 'react';

import AutoReportingDayOfMonthPicker from './AutoReportingDayOfMonthPicker';
import useSubmissionFrequencyDraft from './useSubmissionFrequencyDraft';

type WorkspaceAutoReportingSemiMonthlyOffsetPageProps = WithPolicyOnyxProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_SEMI_MONTHLY_OFFSET>;

function WorkspaceAutoReportingSemiMonthlyOffsetPage({policy, route}: WorkspaceAutoReportingSemiMonthlyOffsetPageProps) {
    const {offset, secondOffset} = useSubmissionFrequencyDraft(policy);
    const isSecondSubmission = route.params.submission === CONST.POLICY.SEMI_MONTHLY_SUBMISSIONS.SECOND;

    return (
        <AutoReportingDayOfMonthPicker
            policy={policy}
            routePolicyID={route.params.policyID}
            testID="WorkspaceAutoReportingSemiMonthlyOffsetPage"
            selectedOffset={isSecondSubmission ? secondOffset : offset}
            unavailableOffset={isSecondSubmission ? offset : secondOffset}
            shouldShowMonthlyOnlyEntries={false}
            onSave={(newOffset) => {
                setDraftValues(ONYXKEYS.FORMS.WORKSPACE_SUBMISSION_FREQUENCY_FORM, {[isSecondSubmission ? INPUT_IDS.SECOND_OFFSET : INPUT_IDS.OFFSET]: String(newOffset)});
            }}
        />
    );
}

export default withPolicy(WorkspaceAutoReportingSemiMonthlyOffsetPage);
