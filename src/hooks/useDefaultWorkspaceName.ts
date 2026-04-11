import type {OnyxCollection} from 'react-native-onyx';
import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import {lastWorkspaceNumberSelector} from '@src/selectors/Policy';
import {emailSelector} from '@src/selectors/Session';
import type {Policy} from '@src/types/onyx';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

function useDefaultWorkspaceName() {
    const {translate} = useLocalize();
    const [sessionEmail = ''] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const lastWorkspaceNumberSelectorWithEmail = (policies: OnyxCollection<Policy>) => lastWorkspaceNumberSelector(policies, sessionEmail);
    const [lastWorkspaceNumber] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: lastWorkspaceNumberSelectorWithEmail});
    return generateDefaultWorkspaceName(sessionEmail, lastWorkspaceNumber, translate);
}

export default useDefaultWorkspaceName;
