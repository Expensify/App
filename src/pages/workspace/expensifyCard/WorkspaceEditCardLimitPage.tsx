import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import AmountForm from '@components/AmountForm';
import ConfirmModal from '@components/ConfirmModal';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditExpensifyCardLimitForm';

type ConfirmationWarningTranslationPaths = 'workspace.expensifyCard.smartLimitWarning' | 'workspace.expensifyCard.monthlyLimitWarning' | 'workspace.expensifyCard.fixedLimitWarning';

type WorkspaceEditCardLimitPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT>;

function WorkspaceEditCardLimitPage({route}: WorkspaceEditCardLimitPageProps) {
    const {policyID, cardID} = route.params;
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const styles = useThemeStyles();
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);

    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`);
    const card = cardsList?.[cardID];

    const getPromptTextKey = useMemo((): ConfirmationWarningTranslationPaths => {
        switch (card?.nameValuePairs?.limitType) {
            case CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART:
                return 'workspace.expensifyCard.smartLimitWarning';
            case CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED:
                return 'workspace.expensifyCard.fixedLimitWarning';
            case CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY:
                return 'workspace.expensifyCard.monthlyLimitWarning';
            default:
                return 'workspace.expensifyCard.fixedLimitWarning';
        }
    }, [card?.nameValuePairs?.limitType]);

    const getNewAvailableSpend = (newLimit: number) => {
        const currentLimit = card?.nameValuePairs?.unapprovedExpenseLimit ?? 0;
        const currentSpend = currentLimit - (card?.availableSpend ?? 0);

        return newLimit - currentSpend;
    };

    const goBack = useCallback(() => Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD_DETAILS.getRoute(policyID, cardID)), [policyID, cardID]);

    const updateCardLimit = (newLimit: number) => {
        const newAvailableSpend = getNewAvailableSpend(newLimit);

        setIsConfirmModalVisible(false);

        Card.updateExpensifyCardLimit(workspaceAccountID, Number(cardID), newLimit, newAvailableSpend, card?.nameValuePairs?.unapprovedExpenseLimit, card?.availableSpend);

        goBack();
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT_FORM>) => {
        const newLimit = Number(values[INPUT_IDS.LIMIT]) * 100;
        const newAvailableSpend = getNewAvailableSpend(newLimit);

        if (newAvailableSpend <= 0) {
            setIsConfirmModalVisible(true);
            return;
        }

        updateCardLimit(newLimit);
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.LIMIT]);
            
            // We only want integers to be sent as the limit
            if (!Number.isInteger(Number(values.limit)) || Number(values.limit) > CONST.EXPENSIFY_CARD.LIMIT_VALUE) {
                errors.limit = translate('iou.error.invalidAmount');
            }

            return errors;
        },
        [translate],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID={WorkspaceEditCardLimitPage.displayName}
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.expensifyCard.cardLimit')}
                    onBackButtonPress={goBack}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT_FORM}
                    submitButtonText={translate('common.save')}
                    shouldHideFixErrorsAlert
                    onSubmit={submit}
                    style={styles.flex1}
                    submitButtonStyles={[styles.mh5, styles.mt0]}
                    submitFlexEnabled={false}
                    enabledWhenOffline
                    validate={validate}
                >
                    {({inputValues}) => (
                        <>
                            <InputWrapper
                                InputComponent={AmountForm}
                                defaultValue={CurrencyUtils.convertToFrontendAmountAsString(card?.nameValuePairs?.unapprovedExpenseLimit, CONST.CURRENCY.USD, false)}
                                isCurrencyPressable={false}
                                inputID={INPUT_IDS.LIMIT}
                                ref={inputCallbackRef}
                            />
                            <ConfirmModal
                                title={translate('workspace.expensifyCard.changeCardLimit')}
                                isVisible={isConfirmModalVisible}
                                onConfirm={() => updateCardLimit(Number(inputValues[INPUT_IDS.LIMIT]) * 100)}
                                onCancel={() => setIsConfirmModalVisible(false)}
                                prompt={translate(getPromptTextKey, {limit: CurrencyUtils.convertToDisplayString(Number(inputValues[INPUT_IDS.LIMIT]) * 100, CONST.CURRENCY.USD)})}
                                confirmText={translate('workspace.expensifyCard.changeLimit')}
                                cancelText={translate('common.cancel')}
                                danger
                                shouldEnableNewFocusManagement
                            />
                        </>
                    )}
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceEditCardLimitPage.displayName = 'WorkspaceEditCardLimitPage';

export default WorkspaceEditCardLimitPage;
