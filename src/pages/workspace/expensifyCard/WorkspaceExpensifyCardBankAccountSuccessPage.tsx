import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';
import Button from '@components/Button';
import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React from 'react';

import ExpensifyCardLimitDescription from './ExpensifyCardLimitDescription';
import getBankAccountSuccessState from './getBankAccountSuccessState';

type WorkspaceExpensifyCardBankAccountSuccessPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_BANK_ACCOUNT_SUCCESS>;

function WorkspaceExpensifyCardBankAccountSuccessPage({route}: WorkspaceExpensifyCardBankAccountSuccessPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const {convertToDisplayString} = useCurrencyListActions();
    const policyID = route.params.policyID;
    const fundID = useDefaultFundID(policyID);
    const [cardSettings, cardSettingsMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`);
    const [cardsPageLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_EXPENSIFY_CARD_LOADING_STATE}${policyID}`);
    // There is no explicit review flag yet; a missing limit on a provisioned US feed is only a proxy for underwriting review.
    const limit = cardSettings?.US?.limit;
    const hasLoadedPage = cardsPageLoadingState?.hasOnceLoadedPage ?? cardSettings?.hasOnceLoaded;
    const successState = getBankAccountSuccessState(fundID, cardSettings, isLoadingOnyxValue(cardSettingsMetadata), hasLoadedPage, cardsPageLoadingState?.hasLoadingError, isOffline);

    const closePage = () => Navigation.closeRHPFlow();

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                testID="WorkspaceExpensifyCardBankAccountSuccessPage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <Header>
                    <Header.BackButton onPress={closePage} />
                    <Header.Title title={translate(successState === 'ready' ? 'common.success' : 'workspace.expensifyCard.chooseBankAccount')} />
                </Header>
                {successState === 'loading' && <FullScreenLoadingIndicator />}
                {successState === 'unavailable' && (
                    <FullPageErrorView
                        shouldShow
                        title={translate('errorPage.title', {isBreakLine: false})}
                        subtitle={translate('errorPage.subtitle')}
                        buttonTranslationKey="workspace.expensifyCard.gotIt"
                        onButtonPress={closePage}
                    />
                )}
                {successState === 'ready' && (
                    <ConfirmationPage>
                        <ConfirmationPage.Content>
                            <ConfirmationPage.Illustration />
                            <ConfirmationPage.Heading>{translate('workspace.expensifyCard.bankAccountSuccessTitle')}</ConfirmationPage.Heading>
                            <ExpensifyCardLimitDescription
                                limit={limit}
                                formattedLimit={limit === undefined || limit === null ? undefined : convertToDisplayString(limit, CONST.CURRENCY.USD)}
                            />
                        </ConfirmationPage.Content>
                        <FixedFooter>
                            <Button
                                size={CONST.BUTTON_SIZE.LARGE}
                                onPress={closePage}
                                style={styles.mb3}
                            >
                                <Button.Text>{translate('workspace.expensifyCard.gotIt')}</Button.Text>
                            </Button>
                            {/* #99702 needs a domainAccountID, which cannot safely be inferred from the selected fundID. */}
                            <Button
                                size={CONST.BUTTON_SIZE.LARGE}
                                variant={CONST.BUTTON_VARIANT.SUCCESS}
                                isDisabled
                            >
                                <Button.Text>{translate('workspace.expensifyCard.requestLimitIncrease')}</Button.Text>
                            </Button>
                        </FixedFooter>
                    </ConfirmationPage>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceExpensifyCardBankAccountSuccessPage;
