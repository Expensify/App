import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {OnyxEntry} from 'react-native-onyx';

import useAccountIcons from './useAccountIcons';

type PolicyAvatarFields = {
    /** Remote URL of the uploaded workspace avatar. An empty string when the workspace has none. */
    avatarURL?: string;

    /** Workspace name. Seeds the default workspace avatar and the avatar tooltip. */
    name?: string;
};

/** Kept at module level so `useOnyx` keeps the same subscription across renders. */
const policyAvatarSelector = (policy: OnyxEntry<Policy>): PolicyAvatarFields => ({avatarURL: policy?.avatarURL, name: policy?.name});

/** Resolves a policy ID and account ID into avatars. */
function usePolicyIcons(policyID?: string, accountID?: number, fallbackDisplayName = ''): [Icon, ...Icon[]] {
    const [policyAvatar] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(policyID)}`, {selector: policyAvatarSelector});
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
