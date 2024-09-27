import isEmpty from 'lodash/isEmpty';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type ShouldRenderTransferOwnerButton from './types';

const shouldRenderTransferOwnerButton: ShouldRenderTransferOwnerButton = () => {
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST, {initialValue: {}});
    return !isEmpty(fundList);
};

export default shouldRenderTransferOwnerButton;
