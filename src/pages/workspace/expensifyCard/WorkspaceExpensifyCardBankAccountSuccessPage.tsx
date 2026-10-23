import Button from '@components/Button';
import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import ExpensifyCardLimitDescription from './ExpensifyCardLimitDescription';

type WorkspaceExpensifyCardBankAccountSuccessPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_BANK_ACCOUNT_SUCCESS>;

function WorkspaceExpensifyCardBankAccountSuccessPage({route}: WorkspaceExpensifyCardBankAccountSuccessPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {convertToDisplayString} = useCurrencyListActions();
    const policyID = route.params.policyID;
    const fundID = useDefaultFundID(policyID);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`);
    const limit = cardSettings?.US?.limit;

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
                    <Header.Title title={translate('common.success')} />
                </Header>
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
                        <Button
                            size={CONST.BUTTON_SIZE.LARGE}
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_REQUEST_LIMIT_INCREASE.getRoute(policyID))}
                        >
                            <Button.Text>{translate('workspace.expensifyCard.requestLimitIncrease')}</Button.Text>
                        </Button>
                    </FixedFooter>
                </ConfirmationPage>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceExpensifyCardBankAccountSuccessPage;
