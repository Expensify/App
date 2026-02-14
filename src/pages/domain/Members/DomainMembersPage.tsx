import {defaultSecurityGroupIDSelector, domainNameSelector, memberAccountIDsSelector, memberPendingActionSelector, selectSecurityGroupForAccount} from '@selectors/Domain';
import React, {useState} from 'react';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DomainMemberBulkActionType, DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import DecisionModal from '@components/DecisionModal';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDomainMemberError, closeUserAccount} from '@libs/actions/Domain';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import BaseDomainMembersPage from '@pages/domain/BaseDomainMembersPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainMembersPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.MEMBERS>;

function DomainMembersPage({route}: DomainMembersPageProps) {
    const {domainAccountID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Profile']);
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Gear', 'DotIndicator', 'RemoveMembers']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const clearSelectedMembers = () => setSelectedMembers([]);
    const isMobileSelectionModeEnabled = useMobileSelectionMode(clearSelectedMembers);

    const canSelectMultiple = shouldUseNarrowLayout ? isMobileSelectionModeEnabled : true;
    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;

    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {canBeMissing: true});
    const [domainPendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {canBeMissing: true, selector: memberPendingActionSelector});
    const [defaultSecurityGroupID] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true, selector: defaultSecurityGroupIDSelector});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [shouldForceCloseAccount, setShouldForceCloseAccount] = useState<boolean>();
    const {showConfirmModal} = useConfirmModal();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true});
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true, selector: domainNameSelector});
    // We need to use isSmallScreenWidth here because the DecisionModal is opening from RHP and ShouldUseNarrowLayout layout will not work in this place.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const [memberIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: memberAccountIDsSelector,
    });

    useSearchBackPress({
        onClearSelection: clearSelectedMembers,
        onNavigationCallBack: () => Navigation.goBack(),
    });

    const handleForceCloseAccount = () => {
        setShouldForceCloseAccount(true);
        setIsModalVisible(false);
    };

    const handleSafeCloseAccount = () => {
        setShouldForceCloseAccount(false);
        setIsModalVisible(false);
    };

    const handleCloseAccount = async () => {
        if (shouldForceCloseAccount === undefined) {
            return;
        }

        const result = await showConfirmModal({
            title: translate('domain.members.closeAccount', {count: selectedMembers.length}),
            prompt: translate('domain.members.closeAccountPrompt'),
            confirmText: translate('domain.members.closeAccount', {count: selectedMembers.length}),
            cancelText: translate('common.cancel'),
            danger: true,
            shouldShowCancelButton: true,
        });

        if (result.action !== ModalActions.CONFIRM) {
            setIsModalVisible(true);
            setShouldForceCloseAccount(undefined);
            return;
        }

        for (const accountIDString of selectedMembers) {
            const accountID = Number(accountIDString);
            const memberLogin = personalDetails?.[accountID]?.login;
            if (!memberLogin || !domainName) {
                continue;
            }
            const securityGroupData = selectSecurityGroupForAccount(accountID)(domain);
            closeUserAccount(domainAccountID, domainName, memberLogin, securityGroupData, shouldForceCloseAccount);
        }

        setShouldForceCloseAccount(undefined);
        clearSelectedMembers();
        setIsModalVisible(false);
    };

    const getBulkActionsButtonOptions: () => Array<DropdownOption<DomainMemberBulkActionType>> = () => [
        {
            text: translate('domain.members.closeAccount', {count: selectedMembers.length}),
            value: CONST.DOMAIN.MEMBERS.BULK_ACTION_TYPES.CLOSE_ACCOUNT,
            icon: icons.RemoveMembers,
            onSelected: () => {
                setIsModalVisible(true);
            },
        },
    ];

    const getHeaderButtons = () => {
        return (shouldUseNarrowLayout ? canSelectMultiple : selectedMembers.length > 0) ? (
            <ButtonWithDropdownMenu<DomainMemberBulkActionType>
                shouldAlwaysShowDropdownMenu
                customText={translate('workspace.common.selected', {count: selectedMembers.length})}
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                onPress={() => null}
                options={getBulkActionsButtonOptions()}
                isSplitButton={false}
                style={shouldUseNarrowLayout ? [styles.flexGrow1, styles.mb3] : undefined}
                isDisabled={!selectedMembers.length}
                testID="DomainMembersPage-header-dropdown-menu-button"
                wrapperStyle={shouldUseNarrowLayout && styles.flexGrow1}
            />
        ) : (
            <Button
                success
                onPress={() => Navigation.navigate(ROUTES.DOMAIN_ADD_MEMBER.getRoute(domainAccountID))}
                text={translate('domain.members.addMember')}
                icon={icons.Plus}
                innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                style={shouldUseNarrowLayout ? [styles.flexGrow1, styles.mb3] : undefined}
            />
        );
    };

    const getCustomRowProps = (accountID: number, email?: string) => {
        const emailError = email ? getLatestError(domainErrors?.memberErrors?.[email]?.errors) : undefined;
        const accountIDError = getLatestError(domainErrors?.memberErrors?.[accountID]?.errors);
        const emailPendingAction = email ? domainPendingActions?.[email]?.pendingAction : undefined;
        const accountIDPendingAction = domainPendingActions?.[accountID]?.pendingAction;

        return {errors: emailError ?? accountIDError, pendingAction: emailPendingAction ?? accountIDPendingAction};
    };

    return (
        <>
            <BaseDomainMembersPage
                domainAccountID={domainAccountID}
                accountIDs={memberIDs ?? []}
                headerTitle={translate('domain.members.title')}
                searchPlaceholder={translate('domain.members.findMember')}
                onSelectRow={(item) => Navigation.navigate(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, item.accountID))}
                headerIcon={illustrations.Profile}
                getCustomRowProps={getCustomRowProps}
                headerContent={getHeaderButtons()}
                selectedMembers={selectedMembers}
                setSelectedMembers={setSelectedMembers}
                canSelectMultiple={canSelectMultiple}
                useSelectionModeHeader={selectionModeHeader}
                turnOnSelectionModeOnLongPress
                onBackButtonPress={() => {
                    if (isMobileSelectionModeEnabled) {
                        clearSelectedMembers();
                        turnOffMobileSelectionMode();
                        return;
                    }
                    Navigation.popToSidebar();
                }}
                onDismissError={(item) => {
                    if (!defaultSecurityGroupID) {
                        return;
                    }
                    clearDomainMemberError(domainAccountID, item.accountID, item.login, defaultSecurityGroupID, item.pendingAction);
                }}
            />
            <DecisionModal
                title={translate('domain.members.closeAccount', {count: selectedMembers.length})}
                prompt={translate('domain.members.closeAccountInfo', {count: selectedMembers.length})}
                isSmallScreenWidth={isSmallScreenWidth}
                onFirstOptionSubmit={handleForceCloseAccount}
                onSecondOptionSubmit={handleSafeCloseAccount}
                secondOptionText={translate('domain.members.safeCloseAccount', {count: selectedMembers.length})}
                firstOptionText={translate('domain.members.forceCloseAccount', {count: selectedMembers.length})}
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

export default DomainMembersPage;
