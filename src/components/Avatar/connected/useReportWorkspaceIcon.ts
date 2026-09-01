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
type WorkspaceIconReportFields = Pick<Report, 'policyID' | 'policyAvatar' | 'policyName' | 'oldPolicyName' | 'chatReportID' | 'parentReportID'>;

/** Resolves a report's workspace icon from its policy row, falling back to the policy fields carried on the report and its workspace chat. */
function useReportWorkspaceIcon(report: WorkspaceIconReportFields | undefined): Icon {
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`, {selector: policyAvatarFieldsSelector});
    // An expense report links its workspace chat via `chatReportID`; `parentReportID` covers shapes that only carry the parent link (they normally point at the same chat).
    const chatReportID = getNonEmptyStringOnyxID(report?.chatReportID) ?? getNonEmptyStringOnyxID(report?.parentReportID);
    const [parentChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, {selector: reportPolicyFieldsSelector});

    // '' (no name) falls through to the next fallback
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const workspaceName = policy?.name || report?.policyName || report?.oldPolicyName || parentChat?.policyName || parentChat?.oldPolicyName || translate('workspace.common.unavailable');
    // Report-carried avatars only apply while the policy row is missing entirely. An avatar can be '' (no uploaded avatar), which must fall through
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const avatarURL = policy ? policy.avatarURL : report?.policyAvatar || parentChat?.policyAvatar;

    return {
        id: report?.policyID,
        type: CONST.ICON_TYPE_WORKSPACE,
        name: workspaceName,
        // '' (no uploaded avatar) falls through to the default
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        source: avatarURL || getDefaultWorkspaceAvatar(workspaceName),
    };
}

export default useReportWorkspaceIcon;
