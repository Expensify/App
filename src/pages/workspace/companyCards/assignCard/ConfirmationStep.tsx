import React, {useEffect} from 'react';
import {InteractionManager, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {getPlaidInstitutionId, isSelectedFeedExpired, lastFourNumbersFromCardName, maskCardNumber} from '@libs/CardUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import {assignWorkspaceCompanyCard, clearAssignCardStepAndData, setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {CompanyCardFeed} from '@src/types/onyx';
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

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: false});
    const feed = assignCard?.data?.bankName as CompanyCardFeed | undefined;
    const [cardFeeds] = useCardFeeds(policyID);

    const data = assignCard?.data;
    const cardholderName = getPersonalDetailByEmail(data?.email ?? '')?.displayName ?? '';

    useEffect(() => {
        if (!assignCard?.isAssigned) {
            return;
        }

        if (backTo) {
            Navigation.goBack(backTo);
        } else {
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
        }
        InteractionManager.runAfterInteractions(() => clearAssignCardStepAndData());
    }, [assignCard, backTo, policyID]);

    const submit = () => {
        if (!policyID) {
            return;
        }

        const isFeedExpired = isSelectedFeedExpired(feed ? cardFeeds?.settings?.oAuthAccountDetails?.[feed] : undefined);
        const institutionId = !!getPlaidInstitutionId(feed);

        if (isFeedExpired) {
            setAssignCardStepAndData({currentStep: institutionId ? CONST.COMPANY_CARD.STEP.PLAID_CONNECTION : CONST.COMPANY_CARD.STEP.BANK_CONNECTION});
            return;
        }
        assignWorkspaceCompanyCard(policyID, data);
    };

    const editStep = (step: AssignCardStep) => {
        setAssignCardStepAndData({currentStep: step, isEditing: true});
    };

    const handleBackButtonPress = () => {
        setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE});
    };

    return (
        <InteractiveStepWrapper
            wrapperID={ConfirmationStep.displayName}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={3}
            stepNames={CONST.COMPANY_CARD.STEP_NAMES}
            headerTitle={translate('workspace.companyCards.assignCard')}
            headerSubtitle={cardholderName}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <ScrollView
                style={styles.pt0}
                contentContainerStyle={styles.flexGrow1}
                addBottomSafeAreaPadding
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
                    title={maskCardNumber(data?.cardNumber ?? '', data?.bankName)}
                    hintText={lastFourNumbersFromCardName(data?.cardNumber)}
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
                    <OfflineWithFeedback
                        shouldDisplayErrorAbove
                        errors={assignCard?.errors}
                        errorRowStyles={styles.mv2}
                        canDismissError={false}
                    >
                        <Button
                            isDisabled={isOffline}
                            success
                            large
                            isLoading={assignCard?.isAssigning}
                            style={styles.w100}
                            onPress={submit}
                            testID={CONST.ASSIGN_CARD_BUTTON_TEST_ID}
                            text={translate('workspace.companyCards.assignCard')}
                        />
                    </OfflineWithFeedback>
                </View>
            </ScrollView>
        </InteractiveStepWrapper>
    );
}

ConfirmationStep.displayName = 'ConfirmationStep';

export default ConfirmationStep;
