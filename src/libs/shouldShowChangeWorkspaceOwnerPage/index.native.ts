import shouldRenderTransferOwnerButton from '@libs/shouldRenderTransferOwnerButton';
import CONST from '@src/CONST';
import type ShouldShowChangeWorkspaceOwnerPage from './types';

const shouldShowChangeWorkspaceOwnerPage: ShouldShowChangeWorkspaceOwnerPage = (fundList, error) => {
    return shouldRenderTransferOwnerButton(fundList) && error !== CONST.POLICY.OWNERSHIP_ERRORS.NO_BILLING_CARD;
};

export default shouldShowChangeWorkspaceOwnerPage;
