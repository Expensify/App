import {isUserValidatedSelector} from '@selectors/Account';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import {View} from 'react-native';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {handleUnvalidatedUserNavigation} from '@libs/SettlementButtonUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {pressLockedBankAccount} from '@userActions/BankAccounts';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

/**
 * Guards payment actions behind authorization checks: delegate access, locked account,
 * unvalidated user, locked bank account, and billing restrictions.
 */
function usePaymentGuard(chatReportID: string, reportID: string | undefined, policy: Policy | undefined) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [conciergeReportID = ''] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {showConfirmModal} = useConfirmModal();

    const isBankAccountLocked = policy?.achAccount?.state === CONST.BANK_ACCOUNT.STATE.LOCKED;

    const checkForNecessaryAction = (paymentMethodType?: PaymentMethodType) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return true;
        }

        if (isAccountLocked) {
            showLockedAccountModal();
            return true;
        }

        if (!isUserValidated && paymentMethodType !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            handleUnvalidatedUserNavigation(chatReportID, reportID);
            return true;
        }

        if (isBankAccountLocked) {
            showConfirmModal({
                title: translate('bankAccount.lockedBankAccount'),
                prompt: (
                    <View style={[styles.renderHTML, styles.flexRow]}>
                        <RenderHTML html={translate('bankAccount.youCantPayThis')} />
                    </View>
                ),
                confirmText: translate('bankAccount.unlockBankAccount'),
                cancelText: translate('common.cancel'),
            }).then(({action}) => {
                if (action !== ModalActions.CONFIRM) {
                    return;
                }
                if (policy?.achAccount?.bankAccountID === undefined) {
                    return;
                }
                pressLockedBankAccount(policy?.achAccount?.bankAccountID, translate, conciergeReportID);
                navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas);
            });
            return true;
        }

        if (policy && shouldRestrictUserBillableActions(policy.id, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, policy)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
            return true;
        }

        return false;
    };

    return {checkForNecessaryAction, userBillingGracePeriodEnds};
}

export default usePaymentGuard;
