import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import BankConnection from '@pages/workspace/companyCards/BankConnection';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import {openPolicyAddCardFeedPage} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import AmexCustomFeed from './AmexCustomFeed';
import CardInstructionsStep from './CardInstructionsStep';
import CardNameStep from './CardNameStep';
import CardTypeStep from './CardTypeStep';
import DetailsStep from './DetailsStep';
import SelectBankStep from './SelectBankStep';
import SelectFeedType from './SelectFeedType';

function AddNewCardPage({policy}: WithPolicyAndFullscreenLoadingProps) {
    const policyID = policy?.id;
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [addNewCardFeed, addNewCardFeedMetadata] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: false});
    const {currentStep} = addNewCardFeed ?? {};

    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => !!account?.delegatedAccess?.delegate, canBeMissing: false});

    const isAddCardFeedLoading = isLoadingOnyxValue(addNewCardFeedMetadata);

    useEffect(() => {
        // If the user only has a domain feed, a workspace account may not have been created yet.
        // However, adding a workspace feed requires a workspace account.
        // Calling openPolicyAddCardFeedPage will trigger the creation of a workspace account.
        if (workspaceAccountID) {
            return;
        }
        openPolicyAddCardFeedPage(policyID);
    }, [workspaceAccountID, policyID]);

    if (isAddCardFeedLoading) {
        return <FullScreenLoadingIndicator />;
    }

    if (isActingAsDelegate) {
        return (
            <ScreenWrapper
                testID={AddNewCardPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnablePickerAvoiding={false}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]} />
            </ScreenWrapper>
        );
    }
    switch (currentStep) {
        case CONST.COMPANY_CARDS.STEP.SELECT_BANK:
            return <SelectBankStep />;
        case CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE:
            return <SelectFeedType />;
        case CONST.COMPANY_CARDS.STEP.CARD_TYPE:
            return <CardTypeStep />;
        case CONST.COMPANY_CARDS.STEP.BANK_CONNECTION:
            return <BankConnection policyID={policyID} />;
        case CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS:
            return <CardInstructionsStep policyID={policyID} />;
        case CONST.COMPANY_CARDS.STEP.CARD_NAME:
            return <CardNameStep />;
        case CONST.COMPANY_CARDS.STEP.CARD_DETAILS:
            return <DetailsStep policyID={policyID} />;
        case CONST.COMPANY_CARDS.STEP.AMEX_CUSTOM_FEED:
            return <AmexCustomFeed />;
        default:
            return <SelectBankStep />;
    }
}

AddNewCardPage.displayName = 'AddNewCardPage';
export default withPolicyAndFullscreenLoading(AddNewCardPage);
