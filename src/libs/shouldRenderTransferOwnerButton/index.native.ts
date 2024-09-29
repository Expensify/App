import isEmpty from 'lodash/isEmpty';
import Onyx, {OnyxEntry, useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {FundList} from '@src/types/onyx';
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
