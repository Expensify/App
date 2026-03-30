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
import VerifyIdentity from './Requestor/VerifyIdentity/VerifyIdentity';
import type USDPageProps from './types';

const PAGE_NAMES = CONST.BANK_ACCOUNT.PAGE_NAMES;
const BANK_INFO_SUB_PAGES = CONST.BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES;
const PERSONAL_INFO_SUB_PAGES = CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.SUB_PAGE_NAMES;
const BUSINESS_INFO_SUB_PAGES = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.SUB_PAGE_NAMES;
const BENEFICIAL_OWNERS_SUB_PAGES = CONST.BANK_ACCOUNT.BENEFICIAL_OWNERS_STEP.SUB_PAGE_NAMES;
const COMPLETE_VERIFICATION_SUB_PAGES = CONST.BANK_ACCOUNT.COMPLETE_VERIFICATION_STEP.SUB_PAGE_NAMES;

type PageEntry = {
    pageName: string;
    component: React.ComponentType<USDPageProps>;
    firstSubPage?: string;
    lastSubPage?: string;
};

const pages: PageEntry[] = [
    {pageName: PAGE_NAMES.COUNTRY, component: Country as React.ComponentType<USDPageProps>},
    {pageName: PAGE_NAMES.BANK_ACCOUNT, component: BankInfo as React.ComponentType<USDPageProps>, firstSubPage: BANK_INFO_SUB_PAGES.PLAID, lastSubPage: BANK_INFO_SUB_PAGES.PLAID},
    {
        pageName: PAGE_NAMES.REQUESTOR,
        component: RequestorStep as React.ComponentType<USDPageProps>,
        firstSubPage: PERSONAL_INFO_SUB_PAGES.FULL_NAME,
        lastSubPage: PERSONAL_INFO_SUB_PAGES.CONFIRMATION,
    },
    {pageName: PAGE_NAMES.VERIFY_IDENTITY, component: VerifyIdentity as React.ComponentType<USDPageProps>},
    {
        pageName: PAGE_NAMES.COMPANY,
        component: BusinessInfo as React.ComponentType<USDPageProps>,
        firstSubPage: BUSINESS_INFO_SUB_PAGES.NAME,
        lastSubPage: BUSINESS_INFO_SUB_PAGES.CONFIRMATION,
    },
    {
        pageName: PAGE_NAMES.BENEFICIAL_OWNERS,
        component: BeneficialOwnersStep as React.ComponentType<USDPageProps>,
        firstSubPage: BENEFICIAL_OWNERS_SUB_PAGES.IS_USER_UBO,
        lastSubPage: undefined,
    },
    {
        pageName: PAGE_NAMES.ACH_CONTRACT,
        component: CompleteVerification as React.ComponentType<USDPageProps>,
        firstSubPage: COMPLETE_VERIFICATION_SUB_PAGES.CONFIRM_AGREEMENTS,
        lastSubPage: COMPLETE_VERIFICATION_SUB_PAGES.CONFIRM_AGREEMENTS,
    },
    {pageName: PAGE_NAMES.VALIDATION, component: ConnectBankAccount as React.ComponentType<USDPageProps>},
];

type USDVerifiedBankAccountFlowPageProps = PlatformStackScreenProps<ReimbursementAccountNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_USD>;

function USDVerifiedBankAccountFlowPage({route}: USDVerifiedBankAccountFlowPageProps) {
    const styles = useThemeStyles();
    const policyID = route.params?.policyID;
    const currentPage = route.params?.page;
    const currentSubPage = route.params?.subPage;
    const backTo = route.params?.backTo;

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);

    const requestorStepRef = useRef<View>(null);
    const isOnfidoSetupComplete = reimbursementAccount?.achData?.isOnfidoSetupComplete;

    const currentPageIndex = useMemo(() => {
        const index = pages.findIndex((p) => p.pageName === currentPage);
        return index >= 0 ? index : 0;
    }, [currentPage]);

    const currentEntry = pages.at(currentPageIndex);
    const CurrentPage = currentEntry?.component ?? (Country as React.ComponentType<USDPageProps>);
    const isRequestorStep = currentEntry?.pageName === PAGE_NAMES.REQUESTOR;

    const shouldSkipVerifyIdentity = useCallback((pageName?: string) => pageName === PAGE_NAMES.VERIFY_IDENTITY && isOnfidoSetupComplete, [isOnfidoSetupComplete]);

    const onSubmit = useCallback(() => {
        let nextIndex = currentPageIndex + 1;
        if (shouldSkipVerifyIdentity(pages.at(nextIndex)?.pageName)) {
            nextIndex += 1;
        }
        if (nextIndex >= pages.length) {
            Navigation.goBack();
            return;
        }
        const nextPage = pages.at(nextIndex);
        Navigation.navigate(ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID, page: nextPage?.pageName, subPage: nextPage?.firstSubPage, backTo}));
    }, [backTo, currentPageIndex, policyID, shouldSkipVerifyIdentity]);

    const onBackButtonPress = useCallback(() => {
        let prevIndex = currentPageIndex - 1;
        if (shouldSkipVerifyIdentity(pages.at(prevIndex)?.pageName)) {
            prevIndex -= 1;
        }
        if (prevIndex < 0) {
            Navigation.goBack();
            return;
        }
        const prevPage = pages.at(prevIndex);
        Navigation.goBack(ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID, page: prevPage?.pageName, subPage: prevPage?.lastSubPage, backTo}));
    }, [backTo, currentPageIndex, policyID, shouldSkipVerifyIdentity]);

    return (
        <View style={styles.flex1}>
            <CurrentPage
                onSubmit={onSubmit}
                onBackButtonPress={onBackButtonPress}
                policyID={policyID}
                currentSubPage={currentSubPage}
                stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
                ref={isRequestorStep ? requestorStepRef : undefined}
                backTo={backTo}
            />
        </View>
    );
}

USDVerifiedBankAccountFlowPage.displayName = 'USDVerifiedBankAccountFlowPage';

export default USDVerifiedBankAccountFlowPage;
