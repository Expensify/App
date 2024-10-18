import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTranslationKeyForLimitType} from '@libs/CardUtils';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {IssueNewCardStep} from '@src/types/onyx/Card';

type ConfirmationStepProps = {
    /** ID of the policy that the card will be issued under */
    policyID: string;

    /** Route to navigate to */
    backTo?: Route;
};

function ConfirmationStep({policyID, backTo}: ConfirmationStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const [issueNewCard] = useOnyx(ONYXKEYS.ISSUE_NEW_EXPENSIFY_CARD);

    const data = issueNewCard?.data;
    const isSuccessful = issueNewCard?.isSuccessful;

    const submitButton = useRef<View>(null);

    useEffect(() => {
        submitButton.current?.focus();
    }, []);

    useEffect(() => {
        if (!isSuccessful) {
            return;
        }
        Navigation.navigate(backTo ?? ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID ?? '-1'));
        Card.clearIssueNewCardFlow();
    }, [backTo, policyID, isSuccessful]);

    const submit = () => {
        Card.issueExpensifyCard(policyID, CONST.COUNTRY.US, data);
    };

    const errorMessage = ErrorUtils.getLatestErrorMessage(issueNewCard);

    const editStep = (step: IssueNewCardStep) => {
        Card.setIssueNewCardStepAndData({step, isEditing: true});
    };

    const handleBackButtonPress = () => {
        Card.setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CARD_NAME});
    };

    const translationForLimitType = getTranslationKeyForLimitType(data?.limitType);

    return (
        <ScreenWrapper
            testID={ConfirmationStep.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.card.issueCard')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={5}
                    stepNames={CONST.EXPENSIFY_CARD.STEP_NAMES}
                />
            </View>
            <ScrollView
                style={styles.pt0}
                contentContainerStyle={styles.flexGrow1}
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.card.issueNewCard.letsDoubleCheck')}</Text>
                <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.willBeReady')}</Text>
                <MenuItemWithTopDescription
                    description={translate('workspace.card.issueNewCard.cardholder')}
                    title={PersonalDetailsUtils.getUserNameByEmail(data?.assigneeEmail ?? '', 'displayName')}
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
                    title={CurrencyUtils.convertToShortDisplayString(data?.limit)}
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
                        onSubmit={submit}
                        buttonText={translate('workspace.card.issueCard')}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

ConfirmationStep.displayName = 'ConfirmationStep';

export default ConfirmationStep;
