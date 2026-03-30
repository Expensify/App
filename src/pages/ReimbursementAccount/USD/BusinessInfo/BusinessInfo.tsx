import {Str} from 'expensify-common';
import lodashPick from 'lodash/pick';
import React, {useCallback, useMemo} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountSubmit from '@hooks/useReimbursementAccountSubmit';
import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';
import Navigation from '@libs/Navigation/Navigation';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import {getBankAccountIDAsNumber} from '@libs/ReimbursementAccountUtils';
import {isValidWebsite} from '@libs/ValidationUtils';
import getInitialSubStepForBusinessInfo from '@pages/ReimbursementAccount/USD/utils/getInitialSubStepForBusinessInfo';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import {updateCompanyInformationForBankAccount} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import AddressBusiness from './subSteps/AddressBusiness';
import ConfirmationBusiness from './subSteps/ConfirmationBusiness';
import IncorporationCode from './subSteps/IncorporationCode';
import IncorporationDateBusiness from './subSteps/IncorporationDateBusiness';
import IncorporationStateBusiness from './subSteps/IncorporationStateBusiness';
import NameBusiness from './subSteps/NameBusiness';
import PhoneNumberBusiness from './subSteps/PhoneNumberBusiness';
import TaxIdBusiness from './subSteps/TaxIdBusiness';
import TypeBusiness from './subSteps/TypeBusiness/TypeBusiness';
import WebsiteBusiness from './subSteps/WebsiteBusiness';

type BusinessInfoProps = {
    /** Goes to the previous step */
    onBackButtonPress: () => void;

    /** Handles submit button press (URL-based navigation) */
    onSubmit?: () => void;

    /** Back to URL for preserving navigation context */
    backTo?: string;
};

const BUSINESS_INFO_STEP_KEYS = INPUT_IDS.BUSINESS_INFO_STEP;
const PAGE_NAMES = CONST.BANK_ACCOUNT.PAGE_NAMES;
const SUB_PAGE_NAMES = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.SUB_PAGE_NAMES;

const pages = [
    {pageName: SUB_PAGE_NAMES.NAME, component: NameBusiness},
    {pageName: SUB_PAGE_NAMES.TAX_ID, component: TaxIdBusiness},
    {pageName: SUB_PAGE_NAMES.WEBSITE, component: WebsiteBusiness},
    {pageName: SUB_PAGE_NAMES.PHONE, component: PhoneNumberBusiness},
    {pageName: SUB_PAGE_NAMES.ADDRESS, component: AddressBusiness},
    {pageName: SUB_PAGE_NAMES.TYPE, component: TypeBusiness},
    {pageName: SUB_PAGE_NAMES.INCORPORATION_DATE, component: IncorporationDateBusiness},
    {pageName: SUB_PAGE_NAMES.INCORPORATION_STATE, component: IncorporationStateBusiness},
    {pageName: SUB_PAGE_NAMES.INCORPORATION_CODE, component: IncorporationCode},
    {pageName: SUB_PAGE_NAMES.CONFIRMATION, component: ConfirmationBusiness},
];

function BusinessInfo({onBackButtonPress, onSubmit, backTo}: BusinessInfoProps) {
    const {translate} = useLocalize();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const getBankAccountFields = useCallback(
        (fieldNames: string[]) => ({
            ...lodashPick(reimbursementAccount?.achData, ...fieldNames),
            ...lodashPick(reimbursementAccountDraft, ...fieldNames),
        }),
        [reimbursementAccount?.achData, reimbursementAccountDraft],
    );

    const policyID = reimbursementAccount?.achData?.policyID;
    const bankAccountID = getBankAccountIDAsNumber(reimbursementAccount?.achData);
    const markSubmitting = useReimbursementAccountSubmit(onSubmit);
    const values = useMemo(() => getSubStepValues(BUSINESS_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const submit = useCallback(
        (isConfirmPage: boolean) => {
            const companyWebsite = Str.sanitizeURL(values.website, CONST.COMPANY_WEBSITE_DEFAULT_SCHEME);
            updateCompanyInformationForBankAccount(
                bankAccountID,
                {
                    ...values,
                    ...getBankAccountFields(['routingNumber', 'accountNumber', 'bankName', 'plaidAccountID', 'plaidAccessToken', 'isSavings']),
                    companyTaxID: values.companyTaxID?.replaceAll(CONST.REGEX.NON_NUMERIC, ''),
                    companyPhone: parsePhoneNumber(values.companyPhone ?? '', {regionCode: CONST.COUNTRY.US}).number?.significant,
                    website: isValidWebsite(companyWebsite) ? companyWebsite : undefined,
                },
                policyID,
                isConfirmPage,
            );
        },
        [bankAccountID, values, getBankAccountFields, policyID],
    );

    const isBankAccountVerifying = reimbursementAccount?.achData?.state === CONST.BANK_ACCOUNT.STATE.VERIFYING;
    const startFrom = useMemo(() => (isBankAccountVerifying ? 0 : getInitialSubStepForBusinessInfo(values)), [values, isBankAccountVerifying]);

    const buildRoute = useCallback(
        (pageName: string, action?: 'edit') => ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID, page: PAGE_NAMES.COMPANY, subPage: pageName, action, backTo}),
        [policyID, backTo],
    );

    const {CurrentPage, isEditing, currentPageName, pageIndex, nextPage, prevPage, moveTo, isRedirecting} = useSubPage<SubPageProps>({
        pages,
        startFrom,
        onFinished: () => {
            submit(true);
            markSubmitting();
        },
        onPageChange: () => submit(false),
        buildRoute,
    });

    const handleBackButtonPress = () => {
        if (isEditing) {
            Navigation.goBack(buildRoute(SUB_PAGE_NAMES.CONFIRMATION));
            return;
        }

        if (pageIndex === 0) {
            onBackButtonPress();
        } else {
            prevPage();
        }
    };

    if (isRedirecting) {
        return <FullScreenLoadingIndicator reasonAttributes={{context: 'BusinessInfo', isRedirecting}} />;
    }

    return (
        <InteractiveStepWrapper
            wrapperID="BusinessInfo"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('businessInfoStep.businessInfo')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={4}
            stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
        >
            <CurrentPage
                isEditing={isEditing}
                onNext={nextPage}
                onMove={moveTo}
                currentPageName={currentPageName}
            />
        </InteractiveStepWrapper>
    );
}

export default BusinessInfo;
