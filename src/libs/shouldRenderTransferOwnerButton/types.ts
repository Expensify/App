import type {FundList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type ShouldRenderTransferOwnerButton = (fundList: OnyxEntry<FundList>) => boolean;

export default ShouldRenderTransferOwnerButton;
