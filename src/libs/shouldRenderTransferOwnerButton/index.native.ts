import {isEmpty} from 'es-toolkit/compat';

import type ShouldRenderTransferOwnerButton from './types';

const shouldRenderTransferOwnerButton: ShouldRenderTransferOwnerButton = (fundList) => {
    return !isEmpty(fundList);
};

export default shouldRenderTransferOwnerButton;
