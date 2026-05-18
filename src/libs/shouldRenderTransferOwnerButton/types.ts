import type {OnyxEntry} from 'react-native-onyx';
import type {FundList} from '@src/types/onyx';

type ShouldRenderTransferOwnerButton = (fundList: OnyxEntry<FundList>) => boolean;

export default ShouldRenderTransferOwnerButton;
