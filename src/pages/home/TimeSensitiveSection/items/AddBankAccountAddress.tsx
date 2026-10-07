/**
 * Home widget that opens the address form for an open US bank account missing addressState.
 */
import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import {openWorkspaceBankAccountAddress, resetPersonalBankAccountForUpdate} from '@libs/actions/BankAccounts';
import Navigation from '@libs/Navigation/Navigation';
import {getStreetLines} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {BankAccountAdditionalData} from '@src/types/onyx/BankAccount';

import React from 'react';

type AddBankAccountAddressProps = {
    /** The ID of the bank account missing an address */
    bankAccountID: number;

    /** Whether this is a personal deposit account */
    isPersonalAccount: boolean;

    /** Policy ID for workspace VBAs */
    policyID?: string;

    /** Undefined for a personal account, where the subtitle is Wallet */
    policyName?: string;

    /** Personal-account details used to prefill the address form */
    additionalData?: BankAccountAdditionalData;
};

function AddBankAccountAddress({bankAccountID, isPersonalAccount, policyID, policyName, additionalData}: AddBankAccountAddressProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Bank']);

    const title = policyName
        ? translate('homePage.timeSensitiveSection.addBankAccountAddress.workspaceTitle')
        : translate('homePage.timeSensitiveSection.addBankAccountAddress.personalTitle');

    const subtitle = policyName
        ? translate('homePage.timeSensitiveSection.addBankAccountAddress.workspaceSubtitle', {policyName})
        : translate('homePage.timeSensitiveSection.addBankAccountAddress.personalSubtitle');

    const handleCtaPress = () => {
        if (isPersonalAccount) {
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
            openWorkspaceBankAccountAddress(policyID, bankAccountID);
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS_WALLET);
    };

    return (
        <BaseWidgetItem
            icon={icons.Bank}
            title={title}
            subtitle={subtitle}
            ctaText={translate('homePage.timeSensitiveSection.addBankAccountAddress.cta')}
            onCtaPress={handleCtaPress}
            buttonVariant={CONST.BUTTON_VARIANT.DANGER}
        />
    );
}

export default AddBankAccountAddress;
