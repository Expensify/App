import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useCurrencyForExpensifyCard from '@hooks/useCurrencyForExpensifyCard';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearExpensifyCardSettlementPreview, queueExpensifyCardForBilling} from '@libs/actions/Card';
import {clearDraftValues} from '@libs/actions/FormActions';
import {getCardProgramKey} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';

type WorkspaceSettleBalanceConfirmationPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTLE_BALANCE_CONFIRMATION>;

function WorkspaceSettleBalanceConfirmationPage({route}: WorkspaceSettleBalanceConfirmationPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    const {convertToDisplayString} = useCurrencyListActions();
    const policyID = route.params.policyID;
    const defaultFundID = useDefaultFundID(policyID);
    const currency = useCurrencyForExpensifyCard({policyID, fundID: defaultFundID});

    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const [preview] = useOnyx(ONYXKEYS.RAM_ONLY_EXPENSIFY_CARD_SETTLEMENT_PREVIEW);
    const programKey = getCardProgramKey(cardSettings);

    const isPartial = preview?.settlementType === CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE.PARTIAL;
    const roundedAmount = preview?.roundedAmount ?? 0;
    const requestedAmount = preview?.requestedAmount ?? 0;
    const hasPreview = !!preview?.settlementType && (!isPartial || roundedAmount > 0);

    // A reload or deep link has no preview to confirm, so it goes back to the first page, unlike confirming, which clears it while the page closes
    const amountPageRoute = ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTLE_BALANCE.getRoute(policyID);
    useEffect(() => {
        if (hasPreview || !isFocused) {
            return;
        }
        let ignore = false;
        Navigation.isNavigationReady().then(() => {
            if (ignore) {
                return;
            }
            Navigation.goBack(amountPageRoute);
        });
        return () => {
            ignore = true;
        };
    }, [hasPreview, isFocused, amountPageRoute]);

    const settleBalance = () => {
        queueExpensifyCardForBilling(defaultFundID, programKey, isPartial ? {amount: requestedAmount, roundedAmount} : undefined);
        Navigation.dismissModal();
        clearExpensifyCardSettlementPreview();
        clearDraftValues(ONYXKEYS.FORMS.SETTLE_EXPENSIFY_CARD_BALANCE_FORM);
    };

    let roundingMessage = '';
    if (isPartial && preview?.isEverythingEligible) {
        roundingMessage = translate('workspace.expensifyCard.settlePartialBalanceEverything');
    } else if (isPartial && roundedAmount !== requestedAmount) {
        roundingMessage = translate(
            'workspace.expensifyCard.settlePartialBalanceRounded',
            convertToDisplayString(requestedAmount, currency),
            convertToDisplayString(roundedAmount, currency),
        );
    } else if (isPartial) {
        roundingMessage = translate('workspace.expensifyCard.settlePartialBalanceExact');
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                testID="WorkspaceSettleBalanceConfirmationPage"
                shouldEnableMaxHeight
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButtonAndTitle
                    title={translate('workspace.expensifyCard.settleBalance')}
                    onBackButtonPress={() => Navigation.goBack(amountPageRoute)}
                />
                <ScrollView
                    contentContainerStyle={styles.flexGrow1}
                    addBottomSafeAreaPadding
                >
                    {isPartial && <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{convertToDisplayString(roundedAmount, currency)}</Text>}
                    <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>
                        {isPartial
                            ? translate('workspace.expensifyCard.settlePartialBalanceConfirmation', convertToDisplayString(roundedAmount, currency))
                            : translate('workspace.expensifyCard.settleFullBalanceConfirmation')}
                    </Text>
                    {!!roundingMessage && <Text style={[styles.textSupporting, styles.ph5, styles.mb3]}>{roundingMessage}</Text>}
                    <View style={[styles.mh5, styles.pb5, styles.mt3, styles.flexGrow1, styles.justifyContentEnd]}>
                        <FormAlertWithSubmitButton
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.SETTLE_BALANCE_CONFIRM_SUBMIT}
                            isDisabled={!hasPreview}
                            onSubmit={settleBalance}
                            buttonText={translate('workspace.expensifyCard.settleBalance')}
                            shouldShowLoadingImmediatelyOnPress={false}
                            // A full settlement queues offline like any write, a partial one depends on the preview the backend computed
                            enabledWhenOffline={!isPartial}
                        />
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceSettleBalanceConfirmationPage;
