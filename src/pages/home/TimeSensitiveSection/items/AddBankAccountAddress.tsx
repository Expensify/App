import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import {getStreetLines} from '@libs/PersonalDetailsUtils';

import colors from '@styles/theme/colors';

import {openReimbursementAccountPage, resetPersonalBankAccountForUpdate} from '@userActions/BankAccounts';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';
import Onyx from 'react-native-onyx';

type AddBankAccountAddressProps = {
    /** The ID of the bank account missing an address */
    bankAccountID: number;

    /** Whether this is a personal deposit account */
    isPersonalAccount: boolean;

    /** Policy ID for workspace VBAs */
    policyID?: string;

    /** The policy name — undefined means personal account (subtitle: 'Wallet') */
    policyName?: string;
};

function navigateToWorkspaceAddressEdit(workspacePolicyID: string) {
    Navigation.navigate(
        ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({
            policyID: workspacePolicyID,
            page: CONST.BANK_ACCOUNT.PAGE_NAMES.COMPANY,
            subPage: CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.SUB_PAGE_NAMES.ADDRESS,
            action: 'edit',
        }),
    );
}

function loadWorkspaceBankAccountAndNavigateToAddressEdit(workspacePolicyID: string, workspaceBankAccountID: number) {
    openReimbursementAccountPage({
        policyID: workspacePolicyID,
        bankAccountID: workspaceBankAccountID,
        stepToOpen: CONST.BANK_ACCOUNT.STEP.COMPANY,
        subStep: CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.SUB_PAGE_NAMES.ADDRESS,
    });

    const connection = Onyx.connect({
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        callback: (reimbursementAccount) => {
            if (reimbursementAccount?.isLoading) {
                return;
            }

            const loadedBankAccountID = Number(reimbursementAccount?.achData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID);
            if (loadedBankAccountID !== workspaceBankAccountID || reimbursementAccount?.achData?.policyID !== workspacePolicyID) {
                return;
            }

            Onyx.disconnect(connection);
            navigateToWorkspaceAddressEdit(workspacePolicyID);
        },
    });
}

function AddBankAccountAddress({bankAccountID, isPersonalAccount, policyID, policyName}: AddBankAccountAddressProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Bank']);
    const [accountData] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {
        selector: (list) => list?.[String(bankAccountID)]?.accountData,
    });

    const title = policyName
        ? translate('homePage.timeSensitiveSection.addBankAccountAddress.workspaceTitle')
        : translate('homePage.timeSensitiveSection.addBankAccountAddress.personalTitle');

    const subtitle = policyName
        ? translate('homePage.timeSensitiveSection.addBankAccountAddress.workspaceSubtitle', {policyName})
        : translate('homePage.timeSensitiveSection.addBankAccountAddress.personalSubtitle');

    const handleCtaPress = () => {
        if (isPersonalAccount) {
            const additionalData = accountData?.additionalData;
            const [street1, street2] = additionalData?.addressStreet ? getStreetLines(additionalData.addressStreet) : [];
            resetPersonalBankAccountForUpdate(
                bankAccountID,
                {
                    legalFirstName: additionalData?.firstName ?? additionalData?.legalFirstName,
                    legalLastName: additionalData?.lastName ?? additionalData?.legalLastName,
                    addressStreet: street1,
                    addressStreet2: street2 ?? '',
                    addressCity: additionalData?.addressCity,
                    addressState: additionalData?.addressState,
                    addressZipCode: additionalData?.addressZipCode,
                    phoneNumber: additionalData?.companyPhone,
                },
                {
                    addressLine1: street1,
                    addressLine2: street2 ?? '',
                    city: additionalData?.addressCity,
                    state: additionalData?.addressState,
                    zipPostCode: additionalData?.addressZipCode,
                    country: CONST.COUNTRY.US,
                },
            );
            Navigation.navigate(ROUTES.SETTINGS_UPDATE_PERSONAL_BANK_ACCOUNT.getRoute(CONST.UPDATE_PERSONAL_BANK_ACCOUNT.PAGE_NAME.ADDRESS));
            return;
        }

        if (policyID) {
            loadWorkspaceBankAccountAndNavigateToAddressEdit(policyID, bankAccountID);
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS_WALLET);
    };

    return (
        <BaseWidgetItem
            icon={icons.Bank}
            iconBackgroundColor={colors.tangerine100}
            iconFill={colors.tangerine500}
            title={title}
            subtitle={subtitle}
            ctaText={translate('homePage.timeSensitiveSection.addBankAccountAddress.cta')}
            onCtaPress={handleCtaPress}
            buttonProps={{danger: true}}
        />
    );
}

export default AddBankAccountAddress;
