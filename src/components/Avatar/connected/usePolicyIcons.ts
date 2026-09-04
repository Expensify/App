import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import {policyAvatarFieldsSelector} from '@selectors/Policy';

import useAccountIcons from './useAccountIcons';

/** Resolves a policy ID and account ID into avatars. */
function usePolicyIcons(policyID?: string, accountID?: number, fallbackDisplayName = ''): [Icon, ...Icon[]] {
    const [policyAvatar] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(policyID)}`, {selector: policyAvatarFieldsSelector});
    const accountIcons = useAccountIcons(accountID ? [accountID] : []);

    const name = policyAvatar?.name ?? fallbackDisplayName;

    const policyIcon: Icon = {
        id: policyID,
        type: CONST.ICON_TYPE_WORKSPACE,
        name,
        // A workspace with no uploaded avatar has `avatarURL: ''`, which has to fall through to the default avatar.
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        source: policyAvatar?.avatarURL || getDefaultWorkspaceAvatar(name),
    };

    return [policyIcon, ...accountIcons];
}

export default usePolicyIcons;
