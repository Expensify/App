import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {AssignCardStep} from '@src/types/onyx/AssignCard';

type ConfirmationStepProps = {
    /** Current policy id */
    policyID: string | undefined;

    /** Route to go back to */
    backTo?: Route;
};

function ConfirmationStep({policyID, backTo}: ConfirmationStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);

    const data = assignCard?.data;
    const cardholderName = PersonalDetailsUtils.getPersonalDetailByEmail(data?.email ?? '')?.displayName ?? '';

    const submit = () => {
        if (!policyID) {
            return;
        }
        CompanyCards.assignWorkspaceCompanyCard(policyID, data);
        Navigation.navigate(backTo ?? ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
        CompanyCards.clearAssignCardStepAndData();
    };

    const editStep = (step: AssignCardStep) => {
        CompanyCards.setAssignCardStepAndData({currentStep: step, isEditing: true});
    };

    const handleBackButtonPress = () => {
        CompanyCards.setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE});
    };

    return (
        <InteractiveStepWrapper
            wrapperID={ConfirmationStep.displayName}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={3}
            stepNames={CONST.COMPANY_CARD.STEP_NAMES}
            headerTitle={translate('workspace.companyCards.assignCard')}
            headerSubtitle={cardholderName}
        >
            <ScrollView
                style={styles.pt0}
                contentContainerStyle={styles.flexGrow1}
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.companyCards.letsDoubleCheck')}</Text>
                <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.confirmationDescription')}</Text>
                <MenuItemWithTopDescription
                    description={translate('workspace.companyCards.cardholder')}
                    title={cardholderName}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.COMPANY_CARD.STEP.ASSIGNEE)}
                />
                <MenuItemWithTopDescription
                    description={translate('workspace.companyCards.card')}
                    title={CardUtils.maskCardNumber(data?.cardNumber ?? '', data?.bankName)}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.COMPANY_CARD.STEP.CARD)}
                />
                <MenuItemWithTopDescription
                    description={translate('workspace.moreFeatures.companyCards.transactionStartDate')}
                    title={data?.dateOption === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING ? translate('workspace.companyCards.fromTheBeginning') : data?.startDate}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE)}
                />
                <MenuItemWithTopDescription
                    description={translate('workspace.companyCards.cardName')}
                    title={data?.cardName}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.COMPANY_CARD.STEP.CARD_NAME)}
                />
                <View style={[styles.mh5, styles.pb5, styles.mt3, styles.flexGrow1, styles.justifyContentEnd]}>
                    <Button
                        isDisabled={isOffline}
                        success
                        large
                        style={styles.w100}
                        onPress={submit}
                        text={translate('workspace.companyCards.assignCard')}
                    />
                </View>
            </ScrollView>
        </InteractiveStepWrapper>
    );
}

ConfirmationStep.displayName = 'ConfirmationStep';

export default ConfirmationStep;
