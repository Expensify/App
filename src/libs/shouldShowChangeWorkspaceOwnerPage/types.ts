import type CONST from '@src/CONST';
import type {FundList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

type ShouldShowChangeWorkspaceOwnerPage = (fundList: OnyxEntry<FundList>, error: ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>) => boolean;

export default ShouldShowChangeWorkspaceOwnerPage;
