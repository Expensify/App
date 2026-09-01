import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import {policyAvatarFieldsSelector} from '@selectors/Policy';
import {reportPolicyFieldsSelector} from '@selectors/Report';

/** The report fields the workspace icon resolves from when the policy row can't provide them. */
type WorkspaceIconReportFields = Pick<Report, 'policyID' | 'policyAvatar' | 'policyName' | 'oldPolicyName' | 'parentReportID'>;

/** Resolves a report's workspace {@link Icon} from its policy row, falling back to the policy fields carried on the report and its parent chat. */
function useReportWorkspaceIcon(report: WorkspaceIconReportFields | undefined): Icon {
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`, {selector: policyAvatarFieldsSelector});
    const [parentChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {selector: reportPolicyFieldsSelector});

    // Names can be ''
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const workspaceName = policy?.name || report?.policyName || report?.oldPolicyName || parentChat?.policyName || parentChat?.oldPolicyName || translate('workspace.common.unavailable');
    // Report-carried avatars only apply while the policy row is missing entirely
    const avatarURL = policy ? policy.avatarURL : (report?.policyAvatar ?? parentChat?.policyAvatar);

    return {
        id: report?.policyID,
        type: CONST.ICON_TYPE_WORKSPACE,
        name: workspaceName,
        // Avatar url can be ''
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        source: avatarURL || getDefaultWorkspaceAvatar(workspaceName),
    };
}

export default useReportWorkspaceIcon;
