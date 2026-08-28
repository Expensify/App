import ONYXKEYS from '@src/ONYXKEYS';
import {lastWorkspaceNumberSelector} from '@src/selectors/Policy';
import {emailSelector} from '@src/selectors/Session';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useMemo} from 'react';

import useOnyx from './useOnyx';

function useLastWorkspaceNumber(email?: string) {
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const resolvedEmail = email ?? sessionEmail ?? '';
    // Memoize so the POLICY-collection regex scan only re-runs when the resolved email changes, not on every render
    // of consumers (e.g. the expense header renders this on every expense).
    const selector = useMemo(() => (policies: OnyxCollection<Policy>) => lastWorkspaceNumberSelector(policies, resolvedEmail), [resolvedEmail]);
    const [lastWorkspaceNumber] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector});
    return lastWorkspaceNumber;
}

export default useLastWorkspaceNumber;
