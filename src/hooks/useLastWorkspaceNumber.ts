import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {lastWorkspaceNumberSelector} from '@src/selectors/Policy';
import {emailSelector} from '@src/selectors/Session';
import type {Policy} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useLastWorkspaceNumber() {
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const lastWorkspaceNumberSelectorWithEmail = (policies: OnyxCollection<Policy>) => lastWorkspaceNumberSelector(policies, sessionEmail ?? '');
    const [lastWorkspaceNumber] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: lastWorkspaceNumberSelectorWithEmail});
    return lastWorkspaceNumber;
}

export default useLastWorkspaceNumber;
