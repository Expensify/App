import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToConciergeChat} from '@libs/actions/Report';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
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
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const {currentStep} = addNewPersonalCardFeed ?? {};
    const [isModalVisible, setIsModalVisible] = useState(false);
    const {showConfirmModal} = useConfirmModal();
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const isAddCardFeedLoading = isLoadingOnyxValue(addNewPersonalCardFeedMetadata);

    useEffect(() => {
        return () => {
            clearAddNewPersonalCardFlow();
        };
    }, []);

    if (isAddCardFeedLoading) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'AddNewPersonalCardPage',
            isAddCardFeedLoading,
        };
        return (
            <FullScreenLoadingIndicator
                shouldUseGoBackButton
                reasonAttributes={reasonAttributes}
            />
        );
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
            CurrentStep = (
                <PlaidConnectionStep
                    onExit={() => {
                        setIsModalVisible(true);
                        showConfirmModal({
                            title: translate('workspace.companyCards.addNewCard.exitModal.title'),
                            success: true,
                            confirmText: translate('workspace.companyCards.addNewCard.exitModal.confirmText'),
                            cancelText: translate('workspace.companyCards.addNewCard.exitModal.cancelText'),
                            prompt: translate('workspace.companyCards.addNewCard.exitModal.prompt'),
                        })
                            .then((result) => {
                                if (result.action !== ModalActions.CONFIRM) {
                                    return;
                                }
                                navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, false, betas);
                            })
                            .finally(() => {
                                setIsModalVisible(false);
                            });
                    }}
                />
            );
            break;
        default:
            CurrentStep = <SelectCountryStep disableAutoFocus={isModalVisible} />;
            break;
    }

    return <View style={styles.flex1}>{CurrentStep}</View>;
}

export default AddPersonalNewCardPage;
