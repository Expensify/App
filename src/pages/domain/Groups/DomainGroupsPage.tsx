import Button from '@components/ButtonComposed';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {DomainGroupRowData} from '@components/Tables/DomainGroupsTable';
import DomainGroupsTable from '@components/Tables/DomainGroupsTable';

import useDomainDocumentTitle from '@hooks/useDomainDocumentTitle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {hasDomainGroupDetailsErrors} from '@libs/DomainUtils';
import {getLatestError} from '@libs/ErrorUtils';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';

import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';

import {clearGroupCreateError, clearGroupDeleteError} from '@userActions/Domain';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyValueObject} from '@src/types/utils/EmptyObject';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {DomainSecurityGroupWithID} from '@selectors/Domain';

import {defaultSecurityGroupIDSelector, domainNameSelector, groupsSelector, isSecurityGroupPendingDeleteSelector} from '@selectors/Domain';
import React from 'react';

type DomainGroupsPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.GROUPS>;

function DomainGroupsPage({route}: DomainGroupsPageProps) {
    const {domainAccountID} = route.params;
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainNameSelector});
    useDomainDocumentTitle(domainName, 'domain.groups.title');
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();

    const [groups = getEmptyArray<DomainSecurityGroupWithID>()] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: groupsSelector});
    const [defaultGroupID] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: defaultSecurityGroupIDSelector});
    const [pendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`);
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`);

    const groupRows: DomainGroupRowData[] = groups
        .filter((group) => isOffline || !isSecurityGroupPendingDeleteSelector(group.id)(pendingActions))
        .map((group) => {
            const isDefault = group.id === defaultGroupID;
            const groupKey: `${typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${string}` = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${group.id}`;
            const groupErrors = domainErrors?.[groupKey];
            const groupPendingActions = pendingActions?.[groupKey];
            const groupErrorMessage = getLatestError(groupErrors?.errors);
            const isFailedCreate = groupPendingActions?.createGroup === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && !isEmptyValueObject(groupErrorMessage);
            const isPendingDelete = isSecurityGroupPendingDeleteSelector(group.id)(pendingActions);
            const hasDetailsErrors = hasDomainGroupDetailsErrors(groupErrors) && !isPendingDelete;

            return {
                keyForList: group.id,
                groupID: group.id,
                name: group.details.name ?? '',
                memberCount: Object.keys(group.details.shared).length,
                isDefault,
                errors: groupErrorMessage,
                brickRoadIndicator: hasDetailsErrors ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                pendingAction: groupPendingActions?.deleteGroup ?? groupPendingActions?.createGroup ?? Object.values(groupPendingActions ?? {}).find(Boolean),
                disabled: isPendingDelete || isFailedCreate,
                action: () => Navigation.navigate(ROUTES.DOMAIN_GROUP_DETAILS.getRoute(domainAccountID, group.id)),
                dismissError: () => {
                    if (groupPendingActions?.createGroup) {
                        clearGroupCreateError(domainAccountID, group.id);
                        return;
                    }
                    clearGroupDeleteError(domainAccountID, group.id);
                },
            };
        });

    const createGroupHeaderButton = (
        <Button
            accessibilityLabel={translate('domain.groups.createNewGroupButton')}
            sentryLabel={CONST.SENTRY_LABEL.DOMAIN.GROUPS.CREATE_GROUP_BUTTON}
            onPress={() => Navigation.navigate(ROUTES.DOMAIN_GROUP_CREATE.getRoute(domainAccountID))}
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            size={CONST.BUTTON_SIZE.SMALL}
        >
            <Button.Icon src={icons.Plus} />
            <Button.Text>{translate('common.group')}</Button.Text>
        </Button>
    );

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                shouldShowOfflineIndicatorInWideScreen
                testID="DomainGroupsPage"
            >
                <HeaderWithBackButton
                    title={translate('domain.groups.title')}
                    shouldDisplayHelpButton
                    onBackButtonPress={Navigation.popToSidebar}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    shouldUseHeadlineHeader
                />

                <DomainGroupsTable
                    domainAccountID={domainAccountID}
                    groups={groupRows}
                    headerButton={createGroupHeaderButton}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

DomainGroupsPage.displayName = 'DomainGroupsPage';

export default DomainGroupsPage;
