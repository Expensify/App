import ONYXKEYS from '@src/ONYXKEYS';
import {displayNameSelector} from '@src/selectors/PersonalDetails';
import {lastWorkspaceNumberSelector} from '@src/selectors/Policy';
import {emailSelector} from '@src/selectors/Session';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useMemo} from 'react';

import useOnyx from './useOnyx';
import usePersonalDetailByLogin from './usePersonalDetailByLogin';

function useLastWorkspaceNumber(email?: string) {
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const resolvedEmail = email ?? sessionEmail ?? '';
    const userDisplayName = usePersonalDetailByLogin(resolvedEmail, displayNameSelector);
    // Memoize so the POLICY-collection regex scan only re-runs when the resolved email or display name changes, not on
    // every render of consumers (e.g. the expense header renders this on every expense).
    const selector = useMemo(() => (policies: OnyxCollection<Policy>) => lastWorkspaceNumberSelector(policies, resolvedEmail, userDisplayName), [resolvedEmail, userDisplayName]);
    const [lastWorkspaceNumber] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector});
    return lastWorkspaceNumber;
}

export default useLastWorkspaceNumber;
