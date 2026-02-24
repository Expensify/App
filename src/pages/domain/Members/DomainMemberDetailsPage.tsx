import {domainNameSelector, selectSecurityGroupForAccount, vacationDelegateSelector} from '@selectors/Domain';
import {personalDetailsSelector} from '@selectors/PersonalDetails';
import React, {useState} from 'react';
import Button from '@components/Button';
import DecisionModal from '@components/DecisionModal';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import VacationDelegateMenuItem from '@components/VacationDelegateMenuItem';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {closeUserAccount} from '@libs/actions/Domain';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import BaseDomainMemberDetailsComponent from '@pages/domain/BaseDomainMemberDetailsComponent';
import {clearVacationDelegateError} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainMemberDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_DETAILS>;

function DomainMemberDetailsPage({route}: DomainMemberDetailsPageProps) {
    const {domainAccountID, accountID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['RemoveMembers']);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [shouldForceCloseAccount, setShouldForceCloseAccount] = useState<boolean>();
    // We need to use isSmallScreenWidth here because the DecisionModal is opening from RHP and ShouldUseNarrowLayout layout will not work in this place
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {showConfirmModal} = useConfirmModal();

    const [userSecurityGroup] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectSecurityGroupForAccount(accountID),
    });

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: personalDetailsSelector(accountID),
    });

    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainNameSelector});

    const [vacationDelegate] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: vacationDelegateSelector(accountID),
    });

    const [domainPendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`);
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`);

    const memberLogin = personalDetails?.login ?? '';

    const handleCloseAccount = async () => {
        if (!userSecurityGroup || shouldForceCloseAccount === undefined) {
            return;
        }

        const result = await showConfirmModal({
            title: translate('domain.members.closeAccount', {count: 1}),
            prompt: translate('domain.members.closeAccountPrompt'),
            confirmText: translate('domain.members.closeAccount', {count: 1}),
            cancelText: translate('common.cancel'),
            danger: true,
            shouldShowCancelButton: true,
        });

        if (result.action !== ModalActions.CONFIRM) {
            setIsModalVisible(true);
            setShouldForceCloseAccount(undefined);
            return;
        }
        closeUserAccount(domainAccountID, domainName ?? '', memberLogin, userSecurityGroup, shouldForceCloseAccount);
        setShouldForceCloseAccount(undefined);
        Navigation.dismissModal();
    };

    const handleForceCloseAccount = () => {
        setShouldForceCloseAccount(true);
        setIsModalVisible(false);
    };

    const handleSafeCloseAccount = () => {
        setShouldForceCloseAccount(false);
        setIsModalVisible(false);
    };

    const avatarButton = (
        <Button
            text={translate('domain.members.closeAccount', {count: 1})}
            onPress={() => setIsModalVisible(true)}
            icon={icons.RemoveMembers}
            style={styles.mb5}
        />
    );

    return (
        <>
            <BaseDomainMemberDetailsComponent
                domainAccountID={domainAccountID}
                accountID={accountID}
                avatarButton={avatarButton}
            >
                <VacationDelegateMenuItem
                    vacationDelegate={vacationDelegate}
                    onPress={() => Navigation.navigate(ROUTES.DOMAIN_VACATION_DELEGATE.getRoute(domainAccountID, accountID))}
                    pendingAction={domainPendingActions?.member?.[memberLogin]?.vacationDelegate}
                    errors={getLatestError(domainErrors?.memberErrors?.[memberLogin]?.vacationDelegateErrors)}
                    onCloseError={() => clearVacationDelegateError(domainAccountID, accountID, memberLogin, vacationDelegate?.previousDelegate)}
                />
            </BaseDomainMemberDetailsComponent>
            <DecisionModal
                title={translate('domain.members.closeAccount', {count: 1})}
                prompt={translate('domain.members.closeAccountInfo', {count: 1})}
                isSmallScreenWidth={isSmallScreenWidth}
                onFirstOptionSubmit={handleForceCloseAccount}
                onSecondOptionSubmit={handleSafeCloseAccount}
                secondOptionText={translate('domain.members.safeCloseAccount', {count: 1})}
                firstOptionText={translate('domain.members.forceCloseAccount', {count: 1})}
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onModalHide={() => {
                    handleCloseAccount();
                }}
                isFirstOptionDanger
                isSecondOptionSuccess
            />
        </>
    );
}

export default DomainMemberDetailsPage;
