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
import useSafePaddingBottomStyle from '@hooks/useSafePaddingBottomStyle';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Policy from '@libs/actions/Policy/Policy';
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
    policyID: string;

    /** Route to go back to */
    backTo?: Route;
};

function ConfirmationStep({policyID, backTo}: ConfirmationStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const safePaddingBottomStyle = useSafePaddingBottomStyle();

    const data = assignCard?.data;

    const submit = () => {
        Policy.assignWorkspaceCompanyCard(policyID, data);
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
        >
            <ScrollView
                style={styles.pt0}
                contentContainerStyle={styles.flexGrow1}
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.companyCards.letsDoubleCheck')}</Text>
                <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.confirmationDescription')}</Text>
                <MenuItemWithTopDescription
                    description={translate('workspace.companyCards.cardholder')}
                    title={PersonalDetailsUtils.getPersonalDetailByEmail(data?.email ?? '')?.displayName ?? ''}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.COMPANY_CARD.STEP.ASSIGNEE)}
                />
                <MenuItemWithTopDescription
                    description={translate('workspace.companyCards.card')}
                    title={data?.cardName}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.COMPANY_CARD.STEP.CARD)}
                />
                <MenuItemWithTopDescription
                    description={translate('workspace.companyCards.startTransactionDate')}
                    title={data?.startDate}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE)}
                />
                <View style={[styles.mh5, styles.pb5, styles.mt3, styles.flexGrow1, styles.justifyContentEnd]}>
                    <Button
                        isDisabled={isOffline}
                        success
                        large
                        style={[styles.w100, safePaddingBottomStyle]}
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
