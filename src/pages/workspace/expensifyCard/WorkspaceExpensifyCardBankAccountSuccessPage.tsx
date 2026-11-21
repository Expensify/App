/** Shows the settlement account confirmation and the provisioned card limit. */
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import useDefaultFundID from '@hooks/useDefaultFundID';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
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

import React from 'react';
import {View} from 'react-native';

import ExpensifyCardLimitDescription from './ExpensifyCardLimitDescription';
import getBankAccountSuccessState from './getBankAccountSuccessState';

type WorkspaceExpensifyCardBankAccountSuccessPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_BANK_ACCOUNT_SUCCESS>;

function WorkspaceExpensifyCardBankAccountSuccessPage({route}: WorkspaceExpensifyCardBankAccountSuccessPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['BrokenMagnifyingGlass']);
    const policyID = route.params.policyID;
    const fundID = useDefaultFundID(policyID);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`);
    const [cardsPageLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_EXPENSIFY_CARD_LOADING_STATE}${policyID}`);
    // There is no explicit review flag yet; a missing limit on a provisioned US feed is only a proxy for underwriting review.
    const limit = cardSettings?.US?.limit;
    const hasLoadedPage = cardsPageLoadingState?.hasOnceLoadedPage ?? cardSettings?.hasOnceLoaded;
    const successState = getBankAccountSuccessState(fundID, cardSettings, hasLoadedPage, cardsPageLoadingState?.hasLoadingError, isOffline);

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
                {successState === 'loading' && (
                    <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                        <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                    </View>
                )}
                {successState === 'unavailable' && (
                    <ConfirmationPage>
                        <ConfirmationPage.Content>
                            <ConfirmationPage.Illustration illustration={illustrations.BrokenMagnifyingGlass} />
                            <ConfirmationPage.Heading>{translate('errorPage.title', {isBreakLine: false})}</ConfirmationPage.Heading>
                            <ConfirmationPage.Description>{translate('errorPage.subtitle')}</ConfirmationPage.Description>
                        </ConfirmationPage.Content>
                        <FixedFooter>
                            <ConfirmationPage.PrimaryButton
                                text={translate('workspace.expensifyCard.gotIt')}
                                onPress={closePage}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.BANK_ACCOUNT_SUCCESS_CLOSE}
                            />
                        </FixedFooter>
                    </ConfirmationPage>
                )}
                {successState === 'ready' && (
                    <ConfirmationPage>
                        <ConfirmationPage.Content>
                            <ConfirmationPage.Illustration />
                            <ConfirmationPage.Heading>{translate('workspace.expensifyCard.bankAccountSuccessTitle')}</ConfirmationPage.Heading>
                            <ExpensifyCardLimitDescription limit={limit} />
                        </ConfirmationPage.Content>
                        <FixedFooter>
                            <Button
                                size={CONST.BUTTON_SIZE.LARGE}
                                onPress={closePage}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.BANK_ACCOUNT_SUCCESS_CLOSE}
                                style={styles.mb3}
                            >
                                <Button.Text>{translate('workspace.expensifyCard.gotIt')}</Button.Text>
                            </Button>
                            {/* #99702 needs a domainAccountID, which cannot safely be inferred from the selected fundID. */}
                            <Button
                                size={CONST.BUTTON_SIZE.LARGE}
                                variant={CONST.BUTTON_VARIANT.SUCCESS}
                                isDisabled
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.REQUEST_LIMIT_INCREASE}
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
