/**
 * Home widget that opens the address form for an open US bank account missing addressState.
 */
import BaseWidgetItem from '@components/BaseWidgetItem';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {openReimbursementAccountPage, resetPersonalBankAccountForUpdate} from '@libs/actions/BankAccounts';
import Navigation from '@libs/Navigation/Navigation';
import {getStreetLines} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccountAdditionalData} from '@src/types/onyx/BankAccount';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useCallback, useEffect, useRef, useState} from 'react';

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

type PendingWorkspaceNavigation = {
    policyID: string;
    bankAccountID: number;
};

type WidgetCopyProps = {
    title: string;
    subtitle: string;
    ctaText: string;
    onCtaPress: () => void;
    isCtaLoading?: boolean;
};

type WidgetCopyPropsWithoutCta = Omit<WidgetCopyProps, 'onCtaPress' | 'isCtaLoading'>;

function BankAccountAddressWidgetItem({title, subtitle, ctaText, onCtaPress, isCtaLoading}: WidgetCopyProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Bank']);

    return (
        <BaseWidgetItem
            icon={icons.Bank}
            title={title}
            subtitle={subtitle}
            ctaText={ctaText}
            onCtaPress={onCtaPress}
            buttonVariant={CONST.BUTTON_VARIANT.DANGER}
            isCtaLoading={isCtaLoading}
        />
    );
}

function AddPersonalBankAccountAddress({
    bankAccountID,
    additionalData,
    title,
    subtitle,
    ctaText,
}: Pick<AddBankAccountAddressProps, 'bankAccountID' | 'additionalData'> & WidgetCopyPropsWithoutCta) {
    const handleCtaPress = () => {
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
    };

    return (
        <BankAccountAddressWidgetItem
            title={title}
            subtitle={subtitle}
            ctaText={ctaText}
            onCtaPress={handleCtaPress}
        />
    );
}

function AddWorkspaceBankAccountAddress({bankAccountID, policyID, title, subtitle, ctaText}: Pick<AddBankAccountAddressProps, 'bankAccountID' | 'policyID'> & WidgetCopyPropsWithoutCta) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [pendingWorkspaceNavigation, setPendingWorkspaceNavigation] = useState<PendingWorkspaceNavigation | null>(null);
    const hasSeenReimbursementAccountLoadingRef = useRef(false);

    const showWorkspaceLoadError = useCallback(
        (isOfflineError = false) => {
            showConfirmModal({
                title: isOfflineError ? translate('common.youAppearToBeOffline') : translate('genericErrorPage.title'),
                prompt: isOfflineError ? translate('common.thisFeatureRequiresInternet') : translate('common.genericErrorMessage'),
                confirmText: translate('common.ok'),
                shouldShowCancelButton: false,
            });
        },
        [showConfirmModal, translate],
    );

    useEffect(() => {
        if (!pendingWorkspaceNavigation) {
            hasSeenReimbursementAccountLoadingRef.current = false;
            return;
        }

        if (reimbursementAccount?.isLoading) {
            hasSeenReimbursementAccountLoadingRef.current = true;
            return;
        }

        const loadedBankAccountID = Number(reimbursementAccount?.achData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID);
        const loadedPolicyID = reimbursementAccount?.achData?.policyID;
        const isExpectedAccount = loadedBankAccountID === pendingWorkspaceNavigation.bankAccountID && loadedPolicyID === pendingWorkspaceNavigation.policyID;

        // Stale reimbursement-account data can still be on disk while OPEN_REIMBURSEMENT_ACCOUNT_PAGE runs; wait for a load cycle unless the cached account already matches.
        if (!hasSeenReimbursementAccountLoadingRef.current && !isExpectedAccount) {
            return;
        }

        const navigationTarget = pendingWorkspaceNavigation;
        setPendingWorkspaceNavigation(null);

        if (!isExpectedAccount) {
            showWorkspaceLoadError();
            return;
        }

        if (hasSeenReimbursementAccountLoadingRef.current && !isEmptyObject(reimbursementAccount?.errors ?? {})) {
            showWorkspaceLoadError();
            return;
        }

        Navigation.navigate(
            ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({
                policyID: navigationTarget.policyID,
                page: CONST.BANK_ACCOUNT.PAGE_NAMES.COMPANY,
                subPage: CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.SUB_PAGE_NAMES.ADDRESS,
                backTo: ROUTES.HOME,
            }),
        );
    }, [
        pendingWorkspaceNavigation,
        reimbursementAccount?.achData?.bankAccountID,
        reimbursementAccount?.achData?.policyID,
        reimbursementAccount?.errors,
        reimbursementAccount?.isLoading,
        showWorkspaceLoadError,
    ]);

    const handleCtaPress = () => {
        if (pendingWorkspaceNavigation) {
            return;
        }

        if (!policyID) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET);
            return;
        }

        if (isOffline) {
            showWorkspaceLoadError(true);
            return;
        }

        setPendingWorkspaceNavigation({policyID, bankAccountID});
        openReimbursementAccountPage({
            policyID,
            bankAccountID,
            stepToOpen: CONST.BANK_ACCOUNT.STEP.COMPANY,
        });
    };

    return (
        <BankAccountAddressWidgetItem
            title={title}
            subtitle={subtitle}
            ctaText={ctaText}
            onCtaPress={handleCtaPress}
            isCtaLoading={!!pendingWorkspaceNavigation}
        />
    );
}

function AddBankAccountAddress({bankAccountID, isPersonalAccount, policyID, policyName, additionalData}: AddBankAccountAddressProps) {
    const {translate} = useLocalize();

    const title = isPersonalAccount
        ? translate('homePage.timeSensitiveSection.addBankAccountAddress.personalTitle')
        : translate('homePage.timeSensitiveSection.addBankAccountAddress.workspaceTitle');

    const subtitle = isPersonalAccount
        ? translate('homePage.timeSensitiveSection.addBankAccountAddress.personalSubtitle')
        : translate('homePage.timeSensitiveSection.addBankAccountAddress.workspaceSubtitle', {policyName: policyName ?? ''});

    const ctaText = translate('homePage.timeSensitiveSection.addBankAccountAddress.cta');

    if (isPersonalAccount) {
        return (
            <AddPersonalBankAccountAddress
                bankAccountID={bankAccountID}
                additionalData={additionalData}
                title={title}
                subtitle={subtitle}
                ctaText={ctaText}
            />
        );
    }

    return (
        <AddWorkspaceBankAccountAddress
            bankAccountID={bankAccountID}
            policyID={policyID}
            title={title}
            subtitle={subtitle}
            ctaText={ctaText}
        />
    );
}

export default AddBankAccountAddress;
