import React, {useCallback, useMemo} from 'react';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrencyForExpensifyCard from '@hooks/useCurrencyForExpensifyCard';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateExpensifyCardLimit} from '@libs/actions/Card';
import {filterInactiveCards} from '@libs/CardUtils';
import {convertToDisplayString, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditExpensifyCardLimitForm';

type ConfirmationWarningTranslationPaths = 'workspace.expensifyCard.smartLimitWarning' | 'workspace.expensifyCard.monthlyLimitWarning' | 'workspace.expensifyCard.fixedLimitWarning';

type WorkspaceEditCardLimitPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT | typeof SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_LIMIT
>;

function WorkspaceEditCardLimitPage({route}: WorkspaceEditCardLimitPageProps) {
    const {policyID, cardID, backTo} = route.params;
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const {inputCallbackRef} = useAutoFocusInput();
    const styles = useThemeStyles();
    const defaultFundID = useDefaultFundID(policyID);

    const currency = useCurrencyForExpensifyCard({policyID});

    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${defaultFundID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards, canBeMissing: true});
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

    const isWorkspaceRhp = route.name === SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT;

    const goBack = useCallback(() => {
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }
        Navigation.goBack(isWorkspaceRhp ? ROUTES.WORKSPACE_EXPENSIFY_CARD_DETAILS.getRoute(policyID, cardID) : ROUTES.EXPENSIFY_CARD_DETAILS.getRoute(policyID, cardID));
    }, [backTo, isWorkspaceRhp, policyID, cardID]);

    const updateCardLimit = useCallback(
        (newLimit: number) => {
            const newAvailableSpend = getNewAvailableSpend(newLimit);

            updateExpensifyCardLimit(
                defaultFundID,
                Number(cardID),
                newLimit,
                newAvailableSpend,
                card?.nameValuePairs?.unapprovedExpenseLimit,
                card?.availableSpend,
                card?.nameValuePairs?.isVirtual,
            );

            goBack();
        },
        [defaultFundID, cardID, card?.nameValuePairs?.unapprovedExpenseLimit, card?.availableSpend, card?.nameValuePairs?.isVirtual, goBack],
    );

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT_FORM>) => {
            const newLimit = Number(values[INPUT_IDS.LIMIT]) * 100;
            const newAvailableSpend = getNewAvailableSpend(newLimit);

            if (newAvailableSpend <= 0) {
                showConfirmModal({
                    title: translate('workspace.expensifyCard.changeCardLimit'),
                    prompt: translate(getPromptTextKey, {limit: convertToDisplayString(newLimit, currency)}),
                    confirmText: translate('workspace.expensifyCard.changeLimit'),
                    cancelText: translate('common.cancel'),
                    danger: true,
                    shouldEnableNewFocusManagement: true,
                }).then((result) => {
                    if (result.action !== ModalActions.CONFIRM) {
                        return;
                    }
                    updateCardLimit(newLimit);
                });
                return;
            }

            updateCardLimit(newLimit);
        },
        [showConfirmModal, translate, getPromptTextKey, currency, updateCardLimit],
    );

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT_FORM> => {
            const errors = getFieldRequiredErrors(values, [INPUT_IDS.LIMIT]);

            // We only want integers to be sent as the limit
            if (!Number(values.limit)) {
                errors.limit = translate('iou.error.invalidAmount');
            } else if (!Number.isInteger(Number(values.limit))) {
                errors.limit = translate('iou.error.invalidIntegerAmount');
            }

            if (Number(values.limit) > CONST.EXPENSIFY_CARD.LIMIT_VALUE) {
                errors.limit = translate('workspace.card.issueNewCard.cardLimitError');
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
                    <InputWrapper
                        InputComponent={AmountForm}
                        defaultValue={convertToFrontendAmountAsString(card?.nameValuePairs?.unapprovedExpenseLimit, currency, false)}
                        isCurrencyPressable={false}
                        currency={currency}
                        inputID={INPUT_IDS.LIMIT}
                        ref={inputCallbackRef}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceEditCardLimitPage.displayName = 'WorkspaceEditCardLimitPage';

export default WorkspaceEditCardLimitPage;
