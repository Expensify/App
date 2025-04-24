import isEmpty from 'lodash/isEmpty';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FundList} from '@src/types/onyx';
import type ShouldRenderTransferOwnerButton from './types';

let fundList: OnyxEntry<FundList>;
Onyx.connect({
    key: ONYXKEYS.FUND_LIST,
    callback: (value) => {
        if (!value) {
            return;
        }

        fundList = value;
    },
});

const shouldRenderTransferOwnerButton: ShouldRenderTransferOwnerButton = () => {
    return !isEmpty(fundList);
};

export default shouldRenderTransferOwnerButton;
