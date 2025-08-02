import isEmpty from 'lodash/isEmpty';
import type ShouldRenderTransferOwnerButton from './types';

const shouldRenderTransferOwnerButton: ShouldRenderTransferOwnerButton = (fundList) => {
    return !isEmpty(fundList);
};

export default shouldRenderTransferOwnerButton;
