import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearIssueNewCardError, clearIssueNewCardFlow, issueExpensifyCard, setIssueNewCardStepAndData} from '@libs/actions/Card';
import {requestValidateCodeAction, resetValidateActionCodeSent} from '@libs/actions/User';
import {getTranslationKeyForLimitType} from '@libs/CardUtils';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import {getLatestErrorMessage, getLatestErrorMessageField} from '@libs/ErrorUtils';
import {getUserNameByEmail} from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {IssueNewCardStep} from '@src/types/onyx/Card';

type ConfirmationStepProps = {
    /** ID of the policy that the card will be issued under */
    policyID: string | undefined;

    /** Route to navigate to */
    backTo?: Route;
};

function ConfirmationStep({policyID, backTo}: ConfirmationStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const validateError = getLatestErrorMessageField(issueNewCard);
    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(false);
    const data = issueNewCard?.data;
    const isSuccessful = issueNewCard?.isSuccessful;
    const validateCodeSent = validateCodeAction?.validateCodeSent;

    const submitButton = useRef<View>(null);

    useBeforeRemove(() => setIsValidateCodeActionModalVisible(false));

    useEffect(() => {
        submitButton.current?.focus();
        resetValidateActionCodeSent();
    }, []);

    useEffect(() => {
        if (!isSuccessful) {
            return;
        }
        Navigation.navigate(backTo ?? ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID ?? '-1'));
        clearIssueNewCardFlow(policyID);
    }, [backTo, policyID, isSuccessful]);

    const submit = (validateCode: string) => {
        issueExpensifyCard(policyID, CONST.COUNTRY.US, validateCode, data);
    };

    const errorMessage = getLatestErrorMessage(issueNewCard);

    const editStep = (step: IssueNewCardStep) => {
        setIssueNewCardStepAndData({step, isEditing: true, policyID});
    };

    const handleBackButtonPress = () => {
        setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CARD_NAME, policyID});
    };

    const translationForLimitType = getTranslationKeyForLimitType(data?.limitType);

    return (
        <InteractiveStepWrapper
            wrapperID={ConfirmationStep.displayName}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('workspace.card.issueCard')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={5}
            stepNames={CONST.EXPENSIFY_CARD.STEP_NAMES}
        >
            <ScrollView
                style={styles.pt0}
                contentContainerStyle={styles.flexGrow1}
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.card.issueNewCard.letsDoubleCheck')}</Text>
                <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.willBeReady')}</Text>
                <MenuItemWithTopDescription
                    description={translate('workspace.card.issueNewCard.cardholder')}
                    title={getUserNameByEmail(data?.assigneeEmail ?? '', 'displayName')}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.EXPENSIFY_CARD.STEP.ASSIGNEE)}
                />
                <MenuItemWithTopDescription
                    description={translate('workspace.card.issueNewCard.cardType')}
                    title={data?.cardType ? translate(`workspace.card.issueNewCard.${data?.cardType}Card`) : ''}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.EXPENSIFY_CARD.STEP.CARD_TYPE)}
                />
                <MenuItemWithTopDescription
                    description={translate('workspace.card.issueNewCard.limit')}
                    title={convertToShortDisplayString(data?.limit)}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.EXPENSIFY_CARD.STEP.LIMIT)}
                />
                <MenuItemWithTopDescription
                    description={translate('workspace.card.issueNewCard.limitType')}
                    title={translationForLimitType ? translate(translationForLimitType) : ''}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.EXPENSIFY_CARD.STEP.LIMIT_TYPE)}
                />
                <MenuItemWithTopDescription
                    description={translate('workspace.card.issueNewCard.name')}
                    title={data?.cardTitle}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.EXPENSIFY_CARD.STEP.CARD_NAME)}
                />
                <View style={[styles.mh5, styles.pb5, styles.mt3, styles.flexGrow1, styles.justifyContentEnd]}>
                    <FormAlertWithSubmitButton
                        buttonRef={submitButton}
                        message={errorMessage}
                        isAlertVisible={!!errorMessage}
                        isDisabled={isOffline}
                        isLoading={issueNewCard?.isLoading}
                        onSubmit={() => setIsValidateCodeActionModalVisible(true)}
                        buttonText={translate('workspace.card.issueCard')}
                    />
                </View>
            </ScrollView>
            {!!issueNewCard && (
                <ValidateCodeActionModal
                    handleSubmitForm={submit}
                    isLoading={issueNewCard?.isLoading}
                    sendValidateCode={() => requestValidateCodeAction()}
                    validateError={validateError}
                    hasMagicCodeBeenSent={validateCodeSent}
                    clearError={() => clearIssueNewCardError(policyID)}
                    onClose={() => setIsValidateCodeActionModalVisible(false)}
                    isVisible={isValidateCodeActionModalVisible}
                    title={translate('cardPage.validateCardTitle')}
                    descriptionPrimary={translate('cardPage.enterMagicCode', {contactMethod: account?.primaryLogin ?? ''})}
                />
            )}
        </InteractiveStepWrapper>
    );
}

ConfirmationStep.displayName = 'ConfirmationStep';

export default ConfirmationStep;
