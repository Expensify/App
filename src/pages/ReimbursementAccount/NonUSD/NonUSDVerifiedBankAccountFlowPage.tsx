import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import Navigation from '@libs/Navigation/Navigation';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import Agreements from './Agreements';
import BankInfo from './BankInfo/BankInfo';
import BeneficialOwnerInfo from './BeneficialOwnerInfo/BeneficialOwnerInfo';
import BusinessInfo from './BusinessInfo/BusinessInfo';
import Country from './Country';
import Docusign from './Docusign';
import Finish from './Finish';
import SignerInfo from './SignerInfo';
import type NonUSDPageProps from './types';
import requiresDocusignStep from './utils/requiresDocusignStep';

const PAGE_NAME = CONST.NON_USD_BANK_ACCOUNT.PAGE_NAME;

type PageEntry = {
    pageName: string;
    component: React.ComponentType<NonUSDPageProps>;
};

const allPages: PageEntry[] = [
    {pageName: PAGE_NAME.CURRENCY_AND_COUNTRY, component: Country},
    {pageName: PAGE_NAME.BANK_INFO, component: BankInfo},
    {pageName: PAGE_NAME.BUSINESS_INFO, component: BusinessInfo},
    {pageName: PAGE_NAME.BENEFICIAL_OWNER_INFO, component: BeneficialOwnerInfo},
    {pageName: PAGE_NAME.SIGNER_INFO, component: SignerInfo},
    {pageName: PAGE_NAME.AGREEMENTS, component: Agreements},
    {pageName: PAGE_NAME.DOCUSIGN, component: Docusign},
    {pageName: PAGE_NAME.FINISH, component: Finish},
];

type NonUSDVerifiedBankAccountFlowPageProps = PlatformStackScreenProps<ReimbursementAccountNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_NON_USD>;

function NonUSDVerifiedBankAccountFlowPage({route}: NonUSDVerifiedBankAccountFlowPageProps) {
    const styles = useThemeStyles();
    const policyID = route.params?.policyID;
    const currentPage = route.params?.page;
    const currentSubPage = route.params?.subPage;
    const isComingFromExpensifyCard = route.params?.isComingFromExpensifyCard;

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? reimbursementAccountDraft?.currency ?? CONST.BBA_COUNTRY_CURRENCY_MAP[reimbursementAccount?.achData?.country ?? ''] ?? '';
    const isDocusignStepRequired = requiresDocusignStep(currency);
    const stepNames = isDocusignStepRequired ? CONST.NON_USD_BANK_ACCOUNT.DOCUSIGN_REQUIRED_STEP_NAMES : CONST.NON_USD_BANK_ACCOUNT.STEP_NAMES;

    const pages = useMemo(() => (isDocusignStepRequired ? allPages : allPages.filter((p) => p.pageName !== PAGE_NAME.DOCUSIGN)), [isDocusignStepRequired]);

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
        Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID: policyID ?? '', page: pages.at(nextIndex)?.pageName, isComingFromExpensifyCard}));
    }, [currentPageIndex, isComingFromExpensifyCard, pages, policyID]);

    const onBackButtonPress = useCallback(() => {
        Navigation.goBack();
    }, []);

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
            />
        </View>
    );
}

NonUSDVerifiedBankAccountFlowPage.displayName = 'NonUSDVerifiedBankAccountFlowPage';

export default NonUSDVerifiedBankAccountFlowPage;
