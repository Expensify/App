import {isUserValidatedSelector} from '@selectors/Account';
import React, {useContext, useRef} from 'react';
import {View} from 'react-native';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import KYCWall from '@components/KYCWall';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import type {PaymentMethodType} from '@components/KYCWall/types';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {BankAccountMenuItem} from '@components/Search/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {handleBulkPayItemSelected} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getActiveAdminWorkspaces} from '@libs/PolicyUtils';
import {isExpenseReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type SearchSelectedNarrowProps = {
    options: Array<DropdownOption<SearchHeaderOptionValue>>;
    itemsLength: number;
    currentSelectedPolicyID?: string | undefined;
    currentSelectedReportID?: string | undefined;
    confirmPayment?: (paymentType: PaymentMethodType | undefined) => void;
    latestBankItems?: BankAccountMenuItem[] | undefined;
};

function SearchSelectedNarrow({options, itemsLength, currentSelectedPolicyID, currentSelectedReportID, confirmPayment, latestBankItems}: SearchSelectedNarrowProps) {
    const styles = useThemeStyles();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [selectedIouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${currentSelectedReportID}`, {canBeMissing: true});
    const {translate, localeCompare} = useLocalize();
    const kycWallRef = useContext(KYCWallContext);
    const currentPolicy = usePolicy(currentSelectedPolicyID);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: true});
    const isCurrentSelectedExpenseReport = isExpenseReport(currentSelectedReportID);
    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);
    // Stores an option to execute after modal closes when using deferred execution
    const selectedOptionRef = useRef<DropdownOption<SearchHeaderOptionValue> | null>(null);
    const {accountID} = useCurrentUserPersonalDetails();
    const activeAdminPolicies = getActiveAdminWorkspaces(allPolicies, accountID.toString()).sort((a, b) => localeCompare(a.name || '', b.name || ''));
    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);

    const handleOnMenuItemPress = (option: DropdownOption<SearchHeaderOptionValue>) => {
        if (option?.shouldCloseModalOnSelect) {
            selectedOptionRef.current = option;
            return;
        }
        option?.onSelected?.();
    };

    return (
        <KYCWall
            ref={kycWallRef}
            chatReportID={currentSelectedReportID}
            iouReport={selectedIouReport}
            enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
            addBankAccountRoute={isCurrentSelectedExpenseReport ? ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(currentSelectedPolicyID, undefined, Navigation.getActiveRoute()) : undefined}
            onSuccessfulKYC={(paymentType) => confirmPayment?.(paymentType)}
        >
            {(triggerKYCFlow, buttonRef) => (
                <View style={[styles.pb3]}>
                    <ButtonWithDropdownMenu
                        buttonRef={buttonRef}
                        options={options}
                        customText={translate('workspace.common.selected', {count: itemsLength})}
                        shouldAlwaysShowDropdownMenu
                        isDisabled={options.length === 0}
                        onPress={() => null}
                        shouldPopoverUseScrollView={options.length >= CONST.DROPDOWN_SCROLL_THRESHOLD}
                        onOptionSelected={(item) => handleOnMenuItemPress(item)}
                        onSubItemSelected={(subItem) =>
                            handleBulkPayItemSelected({
                                item: subItem,
                                triggerKYCFlow,
                                isAccountLocked,
                                showLockedAccountModal,
                                policy: currentPolicy,
                                latestBankItems,
                                activeAdminPolicies,
                                isUserValidated,
                                isDelegateAccessRestricted,
                                showDelegateNoAccessModal,
                                confirmPayment,
                            })
                        }
                        success
                        isSplitButton={false}
                        style={[styles.w100, styles.ph5]}
                        anchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                        }}
                        shouldUseModalPaddingStyle
                    />
                </View>
            )}
        </KYCWall>
    );
}

export default SearchSelectedNarrow;
