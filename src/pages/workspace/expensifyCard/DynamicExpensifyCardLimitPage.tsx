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
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateExpensifyCardLimit} from '@libs/actions/Card';
import {filterInactiveCardsForWorkspace, getProgramKeyForCard} from '@libs/CardUtils';
import {convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditExpensifyCardLimitForm';

import React, {useCallback, useEffect, useMemo, useRef} from 'react';

type ConfirmationWarningTranslationPaths = 'workspace.expensifyCard.smartLimitWarning' | 'workspace.expensifyCard.monthlyLimitWarning' | 'workspace.expensifyCard.fixedLimitWarning';

type DynamicExpensifyCardLimitPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.EXPENSIFY_CARD.DYNAMIC_EXPENSIFY_CARD_LIMIT>;

function DynamicExpensifyCardLimitPage({route}: DynamicExpensifyCardLimitPageProps) {
    const {policyID, cardID} = route.params;
    const {convertToDisplayString} = useCurrencyListActions();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const defaultFundID = useDefaultFundID(policyID);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.EXPENSIFY_CARD_LIMIT.path);

    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${defaultFundID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCardsForWorkspace});
    const card = cardsList?.[cardID];

    // Resolve currency from the card's own program (feedCountry) so a GB card shows GBP/EUR even when the feed also has a US program.
    const currency = useCurrencyForExpensifyCard({policyID, fundID: defaultFundID, programKey: getProgramKeyForCard(card)});

    // Keep a ref to the latest card so the confirmation callback recomputes spend from current data,
    // not the stale card captured when the form was submitted (the card can refresh while the modal is open).
    const cardRef = useRef(card);
    useEffect(() => {
        cardRef.current = card;
    }, [card]);

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
        const latestCard = cardRef.current;
        const currentLimit = latestCard?.nameValuePairs?.unapprovedExpenseLimit ?? 0;
        const currentSpend = currentLimit - (latestCard?.availableSpend ?? 0);

        return newLimit - currentSpend;
    };

    const goBack = useCallback(() => {
        Navigation.goBack(backPath, {compareParams: false});
    }, [backPath]);

    const updateCardLimit = (newLimit: number) => {
        const latestCard = cardRef.current;
        const newAvailableSpend = getNewAvailableSpend(newLimit);

        updateExpensifyCardLimit(
            defaultFundID,
            Number(cardID),
            newLimit,
            newAvailableSpend,
            latestCard?.nameValuePairs?.unapprovedExpenseLimit,
            latestCard?.availableSpend,
            latestCard?.nameValuePairs?.isVirtual,
        );

        goBack();
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT_FORM>) => {
        const newLimit = Number(values[INPUT_IDS.LIMIT]) * 100;
        const newAvailableSpend = getNewAvailableSpend(newLimit);

        if (newAvailableSpend <= 0) {
            showConfirmModal({
                title: translate('workspace.expensifyCard.changeCardLimit'),
                prompt: translate(getPromptTextKey, convertToDisplayString(newLimit, currency)),
                confirmText: translate('workspace.expensifyCard.changeLimit'),
                cancelText: translate('common.cancel'),
                danger: true,
                shouldEnableNewFocusManagement: true,
            }).then(({action}) => {
                if (action !== ModalActions.CONFIRM) {
                    return;
                }
                updateCardLimit(newLimit);
            });
            return;
        }

        updateCardLimit(newLimit);
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT_FORM> => {
            const errors = getFieldRequiredErrors(values, [INPUT_IDS.LIMIT], translate);

            if (Number.isNaN(Number(values.limit))) {
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
            policyFeature={CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                testID="DynamicExpensifyCardLimitPage"
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
                        defaultValue={convertToFrontendAmountAsString(card?.nameValuePairs?.unapprovedExpenseLimit, 0)}
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

export default DynamicExpensifyCardLimitPage;
