import Button from '@components/ButtonComposed';
import ErrorMessageRow from '@components/ErrorMessageRow';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import BareUserListItem from '@components/SelectionList/ListItem/BareUserListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {formatMemberForList, getHeaderMessage, getSearchValueForPhoneOrEmail} from '@libs/OptionsListUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import {clearUnshareBankAccountErrors, unshareBankAccount} from '@userActions/BankAccounts';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';

type ShareBankAccountProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.UNSHARE_BANK_ACCOUNT>;

function UnshareBankAccount({route}: ShareBankAccountProps) {
    const bankAccountID = route.params?.bankAccountID;
    const styles = useThemeStyles();
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [unsharedBankAccountData] = useOnyx(ONYXKEYS.UNSHARE_BANK_ACCOUNT);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const isFocused = useIsFocused();

    // The error modal is now owned by the global modal stack, so it no longer unmounts with this page and it is shown from two
    // different call sites. This ref keeps a second copy from being pushed on top of the one that is already open.
    const isErrorModalShownRef = useRef(false);
    const admins = bankAccountList?.[bankAccountID]?.accountData?.sharees;
    const totalAdmins = bankAccountList?.[bankAccountID]?.accountData?.sharees?.length;
    const adminEmails = admins?.filter((admin) => admin !== currentUserPersonalDetails?.email) ?? [];
    const adminPersonalDetails = usePersonalDetailsByLogins(adminEmails);
    const adminsWithInfo = adminEmails.map((admin) => {
        const personalDetails = adminPersonalDetails[admin];
        const formattedAdmin = formatMemberForList({
            text: personalDetails?.displayName,
            alternateText: personalDetails?.login,
            keyForList: personalDetails?.login ?? '',
            accountID: personalDetails?.accountID,
            login: personalDetails?.login,
            pendingAction: personalDetails?.pendingAction,
            reportID: '',
        });
        return {...formattedAdmin, isInteractive: false};
    });

    let adminsList = adminsWithInfo;
    if (debouncedSearchTerm) {
        const searchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();
        adminsList = tokenizedSearch(adminsWithInfo, searchValue, (option) => [option.text ?? '', option.alternateText ?? '']);
    }

    const error = getLatestErrorMessage(bankAccountList?.[bankAccountID] ?? {});
    const isExpensifyCardError = error?.includes(CONST.EXPENSIFY_CARD.BANK);
    const isExpensifyCardSettlementAccount = bankAccountList?.[bankAccountID]?.isExpensifyCardSettlementAccount ?? false;
    const shouldShowTextInput = Number(totalAdmins) >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const textInputLabel = shouldShowTextInput ? translate('common.search') : undefined;
    const isLoading = unsharedBankAccountData?.isLoading ?? false;
    const shouldShowSuccess = unsharedBankAccountData?.shouldShowSuccess ?? false;

    useEffect(() => {
        if (!shouldShowSuccess) {
            return;
        }
        if (!totalAdmins) {
            Navigation.goBack();
        }
    }, [totalAdmins, shouldShowSuccess]);

    const showUnshareErrorModal = useCallback(() => {
        if (isErrorModalShownRef.current) {
            return;
        }

        // The global modal outlives this page, so don't push it while the page is in the background. Still clear the error, otherwise
        // isExpensifyCardError stays true and the effect below can never fire again.
        if (!isFocused) {
            clearUnshareBankAccountErrors(Number(bankAccountID));
            return;
        }

        isErrorModalShownRef.current = true;
        showConfirmModal({
            title: translate('walletPage.unshareErrorModalTitle'),
            buttonVariant: CONST.BUTTON_VARIANT.SUCCESS,
            prompt: (
                <View style={[styles.renderHTML, styles.flexRow]}>
                    <RenderHTML html={translate('walletPage.reachOutForHelp')} />
                </View>
            ),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
            // Clear the errors on CONFIRM *and* CLOSE. The global modal always wires a cancel handler, so backdrop/ESC are now real exits —
            // leaving the Onyx error set would freeze isExpensifyCardError at true and the modal could never be shown again.
        }).then(() => {
            isErrorModalShownRef.current = false;
            clearUnshareBankAccountErrors(Number(bankAccountID));
        });
    }, [bankAccountID, isFocused, showConfirmModal, styles.flexRow, styles.renderHTML, translate]);

    useEffect(() => {
        if (!isExpensifyCardError) {
            return;
        }
        showUnshareErrorModal();
    }, [isExpensifyCardError, showUnshareErrorModal]);

    const handleUnshare = (unshareUser: {login?: string | null; text?: string | null}) => {
        if (!bankAccountID || !unshareUser?.login) {
            return;
        }

        // Unsharing a bank account isn’t possible if the selected user’s copy of the bank account is set as an Expensify Card settlement account.
        if (isExpensifyCardSettlementAccount) {
            showUnshareErrorModal();
            return;
        }
        unshareBankAccount(Number(bankAccountID), unshareUser.login);
    };

    const itemRightSideComponent = (item: ListItem) => {
        const promptUnshare = () => {
            showConfirmModal({
                title: translate('common.areYouSure'),
                prompt: translate('walletPage.unshareBankAccountWarning', {admin: item?.text}),
                confirmText: translate('common.unshare'),
                cancelText: translate('common.cancel'),
                buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            }).then((result) => {
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }

                // Chained from the awaited continuation so this modal is off the stack before the error modal can be pushed on top of it.
                handleUnshare({login: item?.login, text: item?.text});
            });
        };
        const isUnshareButtonLoading = isLoading && unsharedBankAccountData?.email === item?.login;

        return (
            <Button
                isLoading={isUnshareButtonLoading}
                size={CONST.BUTTON_SIZE.SMALL}
                isDisabled={isLoading}
                variant={CONST.BUTTON_VARIANT.DANGER}
                onPress={promptUnshare}
            >
                <Button.KeyboardShortcut />
                <Button.Text>{translate('common.unshare')}</Button.Text>
            </Button>
        );
    };

    const onButtonPress = () => Navigation.goBack(ROUTES.SETTINGS_WALLET);

    const getHeaderSearchMessage = () => {
        const searchValue = debouncedSearchTerm.trim().toLowerCase();
        return getHeaderMessage(adminsList.length !== 0, false, searchValue, countryCode, false);
    };

    const headerMessage = getHeaderSearchMessage();

    return (
        <ScreenWrapper testID={UnshareBankAccount.displayName}>
            <HeaderWithBackButton
                title={translate('walletPage.unshareBankAccount')}
                onBackButtonPress={onButtonPress}
            />
            <>
                <Text style={[styles.ph5, styles.pb3]}>{translate('walletPage.unshareBankAccountDescription')}</Text>
                <SelectionList
                    textInputOptions={{
                        headerMessage,
                        value: searchTerm,
                        label: textInputLabel,
                        onChangeText: setSearchTerm,
                    }}
                    data={adminsList}
                    shouldShowListEmptyContent={false}
                    rightHandSideComponent={itemRightSideComponent}
                    footerContent={
                        <ErrorMessageRow
                            errors={isExpensifyCardError ? null : unsharedBankAccountData?.errors}
                            errorRowStyles={[styles.mv3]}
                            onDismiss={() => clearUnshareBankAccountErrors(Number(bankAccountID))}
                        />
                    }
                    onSelectRow={() => {}}
                    ListItem={BareUserListItem}
                />
            </>
        </ScreenWrapper>
    );
}

UnshareBankAccount.displayName = 'UnshareBankAccount';

export default UnshareBankAccount;
