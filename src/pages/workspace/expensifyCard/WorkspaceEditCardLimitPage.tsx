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
import * as ValidationUtils from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditExpensifyCardLimit';

type ConfirmationWarningTranslationPaths = 'workspace.expensifyCard.smartLimitWarning' | 'workspace.expensifyCard.monthlyLimitWarning' | 'workspace.expensifyCard.fixedLimitWarning';

// TODO: remove when Onyx data is available
const mockedCard = {
    accountID: 885646,
    availableSpend: 1000,
    nameValuePairs: {
        cardTitle: 'Test 1',
        isVirtual: true,
        limit: 2000,
        limitType: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
    },
    lastFourPAN: '1234',
};

type WorkspaceEditCardLimitPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT>;

function WorkspaceEditCardLimitPage({route}: WorkspaceEditCardLimitPageProps) {
    const {policyID, cardID} = route.params;
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const styles = useThemeStyles();
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${policyID}_${CONST.EXPENSIFY_CARD.BANK}`);
    const card = cardsList?.[cardID] ?? mockedCard;

    const getPromptTextKey = useMemo((): ConfirmationWarningTranslationPaths => {
        switch (card.nameValuePairs?.limitType) {
            case CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART:
                return 'workspace.expensifyCard.smartLimitWarning';
            case CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED:
                return 'workspace.expensifyCard.fixedLimitWarning';
            case CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY:
                return 'workspace.expensifyCard.monthlyLimitWarning';
            default:
                return 'workspace.expensifyCard.fixedLimitWarning';
        }
    }, [card.nameValuePairs?.limitType]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updateCardLimit = (newLimit: string) => {
        setIsConfirmModalVisible(false);
        // TODO: add API call when it's supported https://github.com/Expensify/Expensify/issues/407831
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT>) => {
        const currentLimit = card.nameValuePairs?.limit ?? 0;
        const currentRemainingLimit = currentLimit - card.availableSpend;
        const newRemainingLimit = Number(values[INPUT_IDS.LIMIT]) - currentRemainingLimit;

        if (newRemainingLimit <= 0) {
            setIsConfirmModalVisible(true);
            return;
        }

        updateCardLimit(values[INPUT_IDS.LIMIT]);
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT>): FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.LIMIT]);

            // We only want integers to be sent as the limit
            if (!Number(values.limit) || !Number.isInteger(Number(values.limit))) {
                errors.limit = translate('iou.error.invalidAmount');
            }

            return errors;
        },
        [translate],
    );

    return (
        <ScreenWrapper
            testID={WorkspaceEditCardLimitPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.expensifyCard.cardLimit')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT}
                submitButtonText={translate('common.save')}
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
                            defaultValue={CurrencyUtils.convertToFrontendAmountAsString(card.nameValuePairs?.limit, CONST.CURRENCY.USD, false)}
                            isCurrencyPressable={false}
                            inputID={INPUT_IDS.LIMIT}
                            ref={inputCallbackRef}
                        />
                        <ConfirmModal
                            title={translate('workspace.expensifyCard.changeCardLimit')}
                            isVisible={isConfirmModalVisible}
                            onConfirm={() => updateCardLimit(inputValues[INPUT_IDS.LIMIT])}
                            onCancel={() => setIsConfirmModalVisible(false)}
                            prompt={translate(getPromptTextKey, CurrencyUtils.convertToDisplayString(Number(inputValues[INPUT_IDS.LIMIT]) * 100, CONST.CURRENCY.USD))}
                            confirmText={translate('workspace.expensifyCard.changeLimit')}
                            cancelText={translate('common.cancel')}
                            danger
                            shouldEnableNewFocusManagement
                        />
                    </>
                )}
            </FormProvider>
        </ScreenWrapper>
    );
}

WorkspaceEditCardLimitPage.displayName = 'WorkspaceEditCardLimitPage';

export default WorkspaceEditCardLimitPage;
