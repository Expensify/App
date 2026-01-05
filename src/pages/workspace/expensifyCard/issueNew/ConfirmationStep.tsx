import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setIssueNewCardStepAndData} from '@libs/actions/Card';
import {resetValidateActionCodeSent} from '@libs/actions/User';
import {getTranslationKeyForLimitType} from '@libs/CardUtils';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {getUserNameByEmail} from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {IssueNewCardStep} from '@src/types/onyx/Card';

type ConfirmationStepProps = {
    /** ID of the policy that the card will be issued under */
    policyID: string | undefined;

    /** Array of step names */
    stepNames: readonly string[];

    /** Start from step index */
    startStepIndex: number;

    /** Back to route to pass to confirm magic code page */
    backTo?: Route;
};

function ConfirmationStep({policyID, stepNames, startStepIndex, backTo}: ConfirmationStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const data = issueNewCard?.data;
    const hasApprovalError = !!policy?.errorFields?.approvalMode;
    const isAddApprovalEnabled = policy?.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL && !hasApprovalError;
    const shouldDisableSubmitButton = !isAddApprovalEnabled && data?.limitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART;

    const submitButton = useRef<View>(null);

    useEffect(() => {
        submitButton.current?.focus();
        resetValidateActionCodeSent();
    }, []);

    const errorMessage = getLatestErrorMessage(issueNewCard) || (shouldDisableSubmitButton ? translate('workspace.card.issueNewCard.disabledApprovalForSmartLimitError') : '');

    const editStep = (step: IssueNewCardStep) => {
        setIssueNewCardStepAndData({step, isEditing: true, policyID});
    };

    const handleBackButtonPress = () => {
        setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CARD_NAME, policyID});
    };

    const translationForLimitType = getTranslationKeyForLimitType(data?.limitType);

    return (
        <InteractiveStepWrapper
            wrapperID="ConfirmationStep"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('workspace.card.issueCard')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={startStepIndex}
            stepNames={stepNames}
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldShowOfflineIndicatorInWideScreen
        >
            <ScrollView
                style={styles.pt0}
                contentContainerStyle={styles.flexGrow1}
                addBottomSafeAreaPadding
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.card.issueNewCard.letsDoubleCheck')}</Text>
                <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.willBeReady')}</Text>
                <MenuItemWithTopDescription
                    description={translate('workspace.card.issueNewCard.cardholder')}
                    title={getUserNameByEmail(data?.assigneeEmail ?? '', 'displayName')}
                    shouldShowRightIcon={!issueNewCard?.isChangeAssigneeDisabled}
                    interactive={!issueNewCard?.isChangeAssigneeDisabled}
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
                    title={convertToShortDisplayString(data?.limit, data?.currency)}
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
                    description={translate('workspace.card.issueNewCard.cardName')}
                    title={data?.cardTitle}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.EXPENSIFY_CARD.STEP.CARD_NAME)}
                />
                <View style={[styles.mh5, styles.pb5, styles.mt3, styles.flexGrow1, styles.justifyContentEnd]}>
                    <FormAlertWithSubmitButton
                        buttonRef={submitButton}
                        message={errorMessage}
                        isAlertVisible={!!errorMessage}
                        isDisabled={isOffline || shouldDisableSubmitButton}
                        isMessageHtml={shouldDisableSubmitButton}
                        isLoading={issueNewCard?.isLoading}
                        onSubmit={() => {
                            if (!policyID) {
                                return;
                            }
                            Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_CONFIRM_MAGIC_CODE.getRoute(policyID, backTo));
                        }}
                        buttonText={translate('workspace.card.issueCard')}
                    />
                </View>
            </ScrollView>
        </InteractiveStepWrapper>
    );
}

export default ConfirmationStep;
