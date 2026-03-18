import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import BankInfo from './BankInfo/BankInfo';
import BeneficialOwnersStep from './BeneficialOwnerInfo/BeneficialOwnersStep';
import BusinessInfo from './BusinessInfo/BusinessInfo';
import CompleteVerification from './CompleteVerification/CompleteVerification';
import ConnectBankAccount from './ConnectBankAccount/ConnectBankAccount';
import Country from './Country';
import RequestorStep from './Requestor/RequestorStep';
import type USDPageProps from './types';

const PAGE_NAMES = CONST.BANK_ACCOUNT.PAGE_NAMES;

type PageEntry = {
    pageName: string;
    component: React.ComponentType<USDPageProps>;
};

const pages: PageEntry[] = [
    {pageName: PAGE_NAMES.COUNTRY, component: Country as React.ComponentType<USDPageProps>},
    {pageName: PAGE_NAMES.BANK_ACCOUNT, component: BankInfo as React.ComponentType<USDPageProps>},
    {pageName: PAGE_NAMES.REQUESTOR, component: RequestorStep as React.ComponentType<USDPageProps>},
    {pageName: PAGE_NAMES.COMPANY, component: BusinessInfo as React.ComponentType<USDPageProps>},
    {pageName: PAGE_NAMES.BENEFICIAL_OWNERS, component: BeneficialOwnersStep as React.ComponentType<USDPageProps>},
    {pageName: PAGE_NAMES.ACH_CONTRACT, component: CompleteVerification as React.ComponentType<USDPageProps>},
    {pageName: PAGE_NAMES.VALIDATION, component: ConnectBankAccount as React.ComponentType<USDPageProps>},
];

type USDVerifiedBankAccountFlowPageProps = PlatformStackScreenProps<ReimbursementAccountNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_USD>;

function USDVerifiedBankAccountFlowPage({route}: USDVerifiedBankAccountFlowPageProps) {
    const styles = useThemeStyles();
    const policyID = route.params?.policyID;
    const currentStep = route.params?.step;
    const currentSubPage = route.params?.subStep;

    const [onfidoToken = ''] = useOnyx(ONYXKEYS.ONFIDO_TOKEN);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);

    const requestorStepRef = useRef<View>(null);

    const currentPageIndex = useMemo(() => {
        const index = pages.findIndex((p) => p.pageName === currentStep);
        return index >= 0 ? index : 0;
    }, [currentStep]);

    const currentEntry = pages.at(currentPageIndex);
    const CurrentPage = currentEntry?.component ?? (Country as React.ComponentType<USDPageProps>);

    const onSubmit = useCallback(() => {
        const nextIndex = currentPageIndex + 1;
        if (nextIndex >= pages.length) {
            Navigation.goBack();
            return;
        }
        const nextPage = pages.at(nextIndex);
        Navigation.navigate(ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID, step: nextPage?.pageName}));
    }, [currentPageIndex, policyID]);

    const onBackButtonPress = useCallback(() => {
        const prevIndex = currentPageIndex - 1;
        if (prevIndex < 0) {
            Navigation.goBack();
            return;
        }
        const prevPage = pages.at(prevIndex);
        Navigation.goBack(ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID, step: prevPage?.pageName}));
    }, [currentPageIndex, policyID]);

    const shouldShowOnfido = !!(onfidoToken && !reimbursementAccount?.achData?.isOnfidoSetupComplete);
    const isRequestorStep = currentEntry?.pageName === PAGE_NAMES.REQUESTOR;

    return (
        <View style={styles.flex1}>
            <CurrentPage
                onSubmit={onSubmit}
                onBackButtonPress={onBackButtonPress}
                policyID={policyID}
                currentSubPage={currentSubPage}
                stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
                shouldShowOnfido={isRequestorStep ? shouldShowOnfido : undefined}
                ref={isRequestorStep ? requestorStepRef : undefined}
            />
        </View>
    );
}

USDVerifiedBankAccountFlowPage.displayName = 'USDVerifiedBankAccountFlowPage';

export default USDVerifiedBankAccountFlowPage;
