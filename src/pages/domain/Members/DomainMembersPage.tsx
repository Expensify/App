import { memberAccountIDsSelector } from '@selectors/Domain';
import React, { useState } from 'react';
import { View } from 'react-native';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type { DomainMemberBulkActionType, DropdownOption } from '@components/ButtonWithDropdownMenu/types';
import useConfirmModal from '@hooks/useConfirmModal';
import { useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations } from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
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
    const [controlledSelectedMembers, controlledSetSelectedMembers] = useState<string[]>([]);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['RemoveMembers']);
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
        ) : (
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
        );
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
            canSelectMultiple
            controlledSelectedMembers={controlledSelectedMembers}
            controlledSetSelectedMembers={controlledSetSelectedMembers}
        />
    );
}

DomainMembersPage.displayName = 'DomainMembersPage';

export default DomainMembersPage;
