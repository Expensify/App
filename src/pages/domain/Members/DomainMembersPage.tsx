import { memberAccountIDsSelector } from '@selectors/Domain';
import React, { useState } from 'react';
import { View } from 'react-native';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type { DomainMemberBulkActionType, DropdownOption } from '@components/ButtonWithDropdownMenu/types';
import useConfirmModal from '@hooks/useConfirmModal';
import { useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations } from '@hooks/useLazyAsset';
import {defaultSecurityGroupIDSelector, memberAccountIDsSelector, memberPendingActionSelector} from '@selectors/Domain';
import React from 'react';
import Button from '@components/Button';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAddMemberError} from '@libs/actions/Domain';
import {getLatestError} from '@libs/ErrorUtils';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
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
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {canBeMissing: true});
    const [domainPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {canBeMissing: true, selector: memberPendingActionSelector});
    const [defaultSecurityGroupID] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true, selector: defaultSecurityGroupIDSelector});
    const [controlledSelectedMembers, controlledSetSelectedMembers] = useState<string[]>([]);
    const {showConfirmModal} = useConfirmModal();


    const [memberIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: memberAccountIDsSelector,
    });

    const getBulkActionsButtonOptions = () => {
        const options: Array<DropdownOption<DomainMemberBulkActionType>> = [
            {
                text: translate('domain.members.closeAccount', {count: controlledSelectedMembers.length}),
                value: CONST.DOMAIN.MEMBERS_BULK_ACTION_TYPES.CLOSE_ACCOUNT,
                icon: icons.RemoveMembers,
                onSelected: () => {
                    showConfirmModal({
                        title: translate('export.exportInProgress'),
                        prompt: translate('export.conciergeWillSend'),
                        confirmText: translate('common.buttonConfirm'),
                        shouldShowCancelButton: true,
                        danger,
                    });
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
    );
}

DomainMembersPage.displayName = 'DomainMembersPage';

export default DomainMembersPage;
