import {defaultSecurityGroupIDSelector, domainNameSelector, memberAccountIDsSelector, memberPendingActionSelector, selectSecurityGroupsForAccount} from '@selectors/Domain';
import React, { useState } from 'react';
import { View } from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DomainMemberBulkActionType, DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import DecisionModal from '@components/DecisionModal';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAddMemberError, closeUserAccount} from '@libs/actions/Domain';
import { getLatestError } from '@libs/ErrorUtils';
import Navigation from '@navigation/Navigation';
import type { PlatformStackScreenProps } from '@navigation/PlatformStackNavigation/types';
import type { DomainSplitNavigatorParamList } from '@navigation/types';
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
    const icons = useMemoizedLazyExpensifyIcons(['Plus','RemoveMembers']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {canBeMissing: true});
    const [domainPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {canBeMissing: true, selector: memberPendingActionSelector});
    const [defaultSecurityGroupID] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true, selector: defaultSecurityGroupIDSelector});
    const [controlledSelectedMembers, controlledSetSelectedMembers] = useState<string[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [shouldForceCloseAccount, setShouldForceCloseAccount] = useState<boolean>();
    const {showConfirmModal} = useConfirmModal();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true});
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true, selector: domainNameSelector});
    // we need to use isSmallScreenWidth here because the DecisionModal is opening from RHP and ShouldUseNarrowLayout layout will not work in this place
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const [memberIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: memberAccountIDsSelector,
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
            title: translate('domain.members.closeAccount', {count: controlledSelectedMembers.length}),
            prompt: translate('domain.members.closeAccountPrompt'),
            confirmText: translate('domain.members.closeAccount', {count: controlledSelectedMembers.length}),
            cancelText: translate('common.cancel'),
            danger: true,
            shouldShowCancelButton: true,
        });

        if (result.action !== ModalActions.CONFIRM) {
            setIsModalVisible(true);
            setShouldForceCloseAccount(undefined);
            return;
        }

        for (const accountIDString of controlledSelectedMembers) {
            const accountID = Number(accountIDString);
            const memberLogin = personalDetails?.[accountID]?.login ?? '';
            const securityGroupsData = selectSecurityGroupsForAccount(accountID)(domain);
            closeUserAccount(domainAccountID, domainName ?? '', accountID, memberLogin, securityGroupsData, shouldForceCloseAccount);
        }

        setShouldForceCloseAccount(undefined);
        controlledSetSelectedMembers([]);
        setIsModalVisible(false);
    };

    const getBulkActionsButtonOptions = () => {
        const options: Array<DropdownOption<DomainMemberBulkActionType>> = [
            {
                text: translate('domain.members.closeAccount', {count: controlledSelectedMembers.length}),
                value: CONST.DOMAIN.MEMBERS_BULK_ACTION_TYPES.CLOSE_ACCOUNT,
                icon: icons.RemoveMembers,
                onSelected: () => {
                    setIsModalVisible(true);
                },
            },
        ];

        return options;
    };

    const getHeaderButtons = () => {
        return controlledSelectedMembers.length > 0 ? (
            <>
                <Button
                    success
                    onPress={() => Navigation.navigate(ROUTES.DOMAIN_ADD_MEMBER.getRoute(domainAccountID))}
                    text={translate('domain.members.addMember')}
                    icon={icons.Plus}
                    innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                    style={shouldUseNarrowLayout ? [styles.flexGrow1, styles.mb3] : undefined}
                />
                <ButtonWithDropdownMenu<DomainMemberBulkActionType>
                    shouldAlwaysShowDropdownMenu
                    customText={translate('workspace.common.selected', {count: controlledSelectedMembers.length})}
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    onPress={() => null}
                    options={getBulkActionsButtonOptions()}
                    isSplitButton={false}
                    style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
                    isDisabled={!controlledSelectedMembers.length}
                    testID="DomainMembersPage-header-dropdown-menu-button"
                />
            </>
        ) : (
            <>
                <Button
                    success
                    onPress={() => Navigation.navigate(ROUTES.DOMAIN_ADD_MEMBER.getRoute(domainAccountID))}
                    text={translate('domain.members.addMember')}
                    icon={icons.Plus}
                    innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                    style={shouldUseNarrowLayout ? [styles.flexGrow1, styles.mb3] : undefined}
                />
                <View style={[styles.flexRow, styles.gap2]}>
                    <ButtonWithDropdownMenu
                        success={false}
                        onPress={() => {}}
                        shouldAlwaysShowDropdownMenu
                        customText={translate('common.more')}
                        options={[]}
                        isSplitButton={false}
                        wrapperStyle={styles.flexGrow0}
                    />
                </View>
            </>
        );
    };

    const getCustomRowProps = (accountID: number, email?: string) => {
        const errorKey = email ?? accountID;
        const errors = getLatestError(domainErrors?.memberErrors?.[errorKey]?.errors) ?? undefined;
        const pendingAction = email ? domainPendingAction?.[email] : undefined;
        return {errors, pendingAction};
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
                headerContent={getHeaderButtons()}
                getCustomRowProps={getCustomRowProps}
                canSelectMultiple
                controlledSelectedMembers={controlledSelectedMembers}
                controlledSetSelectedMembers={controlledSetSelectedMembers}
                onDismissError={(item) => {
                    if (!defaultSecurityGroupID) {
                        return;
                    }
                    clearAddMemberError(domainAccountID, item.accountID, item.login, defaultSecurityGroupID);
                }}
            />
            <DecisionModal
                title={translate('domain.members.closeAccount', {count: controlledSelectedMembers.length})}
                prompt={translate('domain.members.closeAccountInfo')}
                isSmallScreenWidth={isSmallScreenWidth}
                onFirstOptionSubmit={handleForceCloseAccount}
                onSecondOptionSubmit={handleSafeCloseAccount}
                secondOptionText={translate('domain.members.safeCloseAccount')}
                firstOptionText={translate('domain.members.forceCloseAccount')}
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

DomainMembersPage.displayName = 'DomainMembersPage';

export default DomainMembersPage;
