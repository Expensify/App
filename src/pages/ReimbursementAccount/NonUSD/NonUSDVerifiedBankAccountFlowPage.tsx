import React, {useCallback, useMemo} from 'react';
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
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import Agreements from './Agreements';
import BankInfo from './BankInfo/BankInfo';
import BeneficialOwnerInfo from './BeneficialOwnerInfo/BeneficialOwnerInfo';
import BusinessInfo from './BusinessInfo/BusinessInfo';
import Country from './Country';
import Docusign from './Docusign';
import Finish from './Finish';
import SignerInfo from './SignerInfo';
import type NonUSDPageProps from './types';
import getInitialSubPageForSignerInfoStep from './utils/getInitialSubPageForSignerInfoStep';
import requiresDocusignStep from './utils/requiresDocusignStep';

const PAGE_NAME = CONST.NON_USD_BANK_ACCOUNT.PAGE_NAME;
const BANK_INFO_SUB_PAGES = CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES;
const BUSINESS_INFO_SUB_PAGES = CONST.NON_USD_BANK_ACCOUNT.BUSINESS_INFO_STEP.SUB_PAGE_NAMES;
const BENEFICIAL_OWNER_INFO_SUB_PAGES = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.SUB_PAGE_NAMES;
const SIGNER_INFO_SUB_PAGES = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SUB_PAGE_NAMES;

type PageEntry = {
    pageName: string;
    component: React.ComponentType<NonUSDPageProps>;
    firstSubPage?: string;
    lastSubPage?: string;
};

const allPages: PageEntry[] = [
    {pageName: PAGE_NAME.CURRENCY_AND_COUNTRY, component: Country},
    {pageName: PAGE_NAME.BANK_INFO, component: BankInfo, firstSubPage: BANK_INFO_SUB_PAGES.BANK_ACCOUNT_DETAILS, lastSubPage: BANK_INFO_SUB_PAGES.CONFIRMATION},
    {pageName: PAGE_NAME.BUSINESS_INFO, component: BusinessInfo, firstSubPage: BUSINESS_INFO_SUB_PAGES.NAME, lastSubPage: BUSINESS_INFO_SUB_PAGES.CONFIRMATION},
    {
        pageName: PAGE_NAME.BENEFICIAL_OWNER_INFO,
        component: BeneficialOwnerInfo,
        firstSubPage: BENEFICIAL_OWNER_INFO_SUB_PAGES.IS_USER_BENEFICIAL_OWNER,
        lastSubPage: BENEFICIAL_OWNER_INFO_SUB_PAGES.BENEFICIAL_OWNERS_LIST,
    },
    {pageName: PAGE_NAME.SIGNER_INFO, component: SignerInfo, firstSubPage: SIGNER_INFO_SUB_PAGES.IS_DIRECTOR, lastSubPage: SIGNER_INFO_SUB_PAGES.CONFIRMATION},
    {pageName: PAGE_NAME.AGREEMENTS, component: Agreements},
    {pageName: PAGE_NAME.DOCUSIGN, component: Docusign},
    {pageName: PAGE_NAME.FINISH, component: Finish},
];

const {SIGNER_EMAIL, SIGNER_FULL_NAME, SECOND_SIGNER_EMAIL} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

type NonUSDVerifiedBankAccountFlowPageProps = PlatformStackScreenProps<ReimbursementAccountNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_NON_USD>;

function NonUSDVerifiedBankAccountFlowPage({route}: NonUSDVerifiedBankAccountFlowPageProps) {
    const styles = useThemeStyles();
    const policyID = route.params?.policyID;
    const currentPage = route.params?.page;
    const currentSubPage = route.params?.subPage;
    const backTo = route.params?.backTo;

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const isComingFromExpensifyCard = reimbursementAccountDraft?.isComingFromExpensifyCard;

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? reimbursementAccountDraft?.currency ?? CONST.BBA_COUNTRY_CURRENCY_MAP[reimbursementAccount?.achData?.country ?? ''] ?? '';
    const isDocusignStepRequired = requiresDocusignStep(currency);
    const stepNames = isDocusignStepRequired ? CONST.NON_USD_BANK_ACCOUNT.DOCUSIGN_REQUIRED_STEP_NAMES : CONST.NON_USD_BANK_ACCOUNT.STEP_NAMES;

    const savedSignerEmail = reimbursementAccount?.achData?.corpay?.[SIGNER_EMAIL];
    const savedSignerFullName = reimbursementAccount?.achData?.corpay?.[SIGNER_FULL_NAME];
    const savedSecondSignerEmail = reimbursementAccount?.achData?.corpay?.[SECOND_SIGNER_EMAIL];

    const initialSignerSubPage = getInitialSubPageForSignerInfoStep(savedSignerEmail, savedSignerFullName, savedSecondSignerEmail, currency);

    const isAUD = currency === CONST.CURRENCY.AUD;
    const pages = useMemo(() => {
        const filteredPages = isDocusignStepRequired ? allPages : allPages.filter((page) => page.pageName !== PAGE_NAME.DOCUSIGN);
        return filteredPages.map((page) => {
            if (page.pageName !== PAGE_NAME.SIGNER_INFO) {
                return page;
            }
            return {
                ...page,
                firstSubPage: initialSignerSubPage,
                ...(isAUD ? {lastSubPage: SIGNER_INFO_SUB_PAGES.HANG_TIGHT} : {}),
            };
        });
    }, [isDocusignStepRequired, isAUD, initialSignerSubPage]);

    const currentPageIndex = useMemo(() => {
        const index = pages.findIndex((p) => p.pageName === currentPage);
        return index >= 0 ? index : 0;
    }, [pages, currentPage]);

    const currentEntry = pages.at(currentPageIndex);
    const CurrentPage = currentEntry?.component ?? Country;

    const onSubmit = useCallback(() => {
        const nextIndex = currentPageIndex + 1;
        if (nextIndex >= pages.length) {
            Navigation.goBack();
            return;
        }
        const nextPage = pages.at(nextIndex);
        Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: nextPage?.pageName, subPage: nextPage?.firstSubPage, backTo}));
    }, [backTo, currentPageIndex, pages, policyID]);

    const onBackButtonPress = useCallback(() => {
        const prevIndex = currentPageIndex - 1;
        if (prevIndex < 0) {
            Navigation.goBack();
            return;
        }
        const prevPage = pages.at(prevIndex);
        Navigation.goBack(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: prevPage?.pageName, subPage: prevPage?.lastSubPage, backTo}));
    }, [backTo, currentPageIndex, pages, policyID]);

    return (
        <View style={styles.flex1}>
            <CurrentPage
                onSubmit={onSubmit}
                onBackButtonPress={onBackButtonPress}
                policyID={policyID}
                currency={currency}
                stepNames={stepNames}
                currentSubPage={currentSubPage}
                isComingFromExpensifyCard={isComingFromExpensifyCard}
                backTo={backTo}
            />
        </View>
    );
}

NonUSDVerifiedBankAccountFlowPage.displayName = 'NonUSDVerifiedBankAccountFlowPage';

export default NonUSDVerifiedBankAccountFlowPage;
