import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDraftSpendRule} from '@libs/actions/User';
import {filterInactiveCards, isCard} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/SpendRuleForm';
import type {Card, WorkspaceCardsList} from '@src/types/onyx';

type SpendRuleMaxAmountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_SPEND_MAX_AMOUNT>;

function getSelectedCardsCurrency(cardIDs: string[] | undefined, cardsList: OnyxEntry<WorkspaceCardsList>): string | undefined {
    if (!cardIDs?.length) {
        return undefined;
    }

    const cardsRecord = (cardsList ?? {}) as Record<string, Card | Record<string, string> | undefined>;
    const currencies = new Set<string>();
    for (const id of cardIDs) {
        const card = cardsRecord[id];
        if (card === undefined || !isCard(card)) {
            continue;
        }
        if (typeof card.nameValuePairs?.currency === 'string' && card.nameValuePairs.currency) {
            currencies.add(String(card.nameValuePairs.currency));
        }
    }

    if (currencies.size !== 1) {
        return undefined;
    }
    return Array.from(currencies).at(0);
}

function SpendRuleMaxAmountPage({route}: SpendRuleMaxAmountPageProps) {
    const {policyID, ruleID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const domainAccountID = useDefaultFundID(policyID);
    const parentRoute = ruleID === ROUTES.NEW ? ROUTES.RULES_SPEND_NEW.getRoute(policyID) : ROUTES.RULES_SPEND_EDIT.getRoute(policyID, ruleID);

    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});

    const selectedCurrency = getSelectedCardsCurrency(spendRuleForm?.cardIDs, cardsList) ?? CONST.CURRENCY.USD;
    const defaultValue = spendRuleForm?.maxAmount ?? '';

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="SpendRuleMaxAmountPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.spendRules.maxAmount')}
                    onBackButtonPress={() => Navigation.goBack(parentRoute)}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.SPEND_RULE_FORM}
                    onSubmit={({maxAmount}) => {
                        updateDraftSpendRule({maxAmount: maxAmount.trim()});
                        Navigation.goBack(parentRoute);
                    }}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            label={translate('iou.amount')}
                            InputComponent={AmountForm}
                            inputID={INPUT_IDS.MAX_AMOUNT}
                            currency={selectedCurrency}
                            defaultValue={defaultValue}
                            isCurrencyPressable={false}
                            ref={inputCallbackRef}
                            displayAsTextInput
                        />
                        <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('workspace.rules.spendRules.maxAmountHelp')}</Text>
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

SpendRuleMaxAmountPage.displayName = 'SpendRuleMaxAmountPage';

export default SpendRuleMaxAmountPage;
