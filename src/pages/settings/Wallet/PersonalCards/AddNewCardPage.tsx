import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToConciergeChat} from '@libs/actions/Report';
import {clearAddNewPersonalCardFlow} from '@userActions/PersonalCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import BankConnection from './steps/BankConnection';
import PlaidConnectionStep from './steps/PlaidConnectionStep';
import SelectBankStep from './steps/SelectBankStep';
import SelectCountryStep from './steps/SelectCountryStep';
import SuccessStep from './steps/SuccessStep';

function AddPersonalNewCardPage() {
    const styles = useThemeStyles();
    const [addNewPersonalCardFeed, addNewPersonalCardFeedMetadata] = useOnyx(ONYXKEYS.ADD_NEW_PERSONAL_CARD);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const {currentStep} = addNewPersonalCardFeed ?? {};
    const [isModalVisible, setIsModalVisible] = useState(false);
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const isAddCardFeedLoading = isLoadingOnyxValue(addNewPersonalCardFeedMetadata);

    useEffect(() => {
        return () => {
            clearAddNewPersonalCardFlow();
        };
    }, []);

    if (isAddCardFeedLoading) {
        return <FullScreenLoadingIndicator />;
    }

    let CurrentStep: React.JSX.Element;
    switch (currentStep) {
        case CONST.PERSONAL_CARDS.STEP.SUCCESS:
            CurrentStep = <SuccessStep />;
            break;
        case CONST.PERSONAL_CARDS.STEP.SELECT_BANK:
            CurrentStep = <SelectBankStep />;
            break;
        case CONST.PERSONAL_CARDS.STEP.BANK_CONNECTION:
            CurrentStep = <BankConnection />;
            break;
        case CONST.PERSONAL_CARDS.STEP.PLAID_CONNECTION:
            CurrentStep = <PlaidConnectionStep onExit={() => setIsModalVisible(true)} />;
            break;
        default:
            CurrentStep = <SelectCountryStep />;
            break;
    }

    return (
        <>
            <View style={styles.flex1}>{CurrentStep}</View>
            <ConfirmModal
                isVisible={isModalVisible}
                title={translate('workspace.companyCards.addNewCard.exitModal.title')}
                success
                confirmText={translate('workspace.companyCards.addNewCard.exitModal.confirmText')}
                cancelText={translate('workspace.companyCards.addNewCard.exitModal.cancelText')}
                prompt={translate('workspace.companyCards.addNewCard.exitModal.prompt')}
                onCancel={() => setIsModalVisible(false)}
                onConfirm={() => {
                    setIsModalVisible(false);
                    navigateToConciergeChat(conciergeReportID, currentUserAccountID, false);
                }}
            />
        </>
    );
}

export default AddPersonalNewCardPage;
