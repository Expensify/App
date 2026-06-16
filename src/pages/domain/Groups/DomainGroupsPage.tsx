import type {DomainSecurityGroupWithID} from '@selectors/Domain';
import {defaultSecurityGroupIDSelector, domainNameSelector, groupsSelector, isSecurityGroupPendingDeleteSelector} from '@selectors/Domain';
import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {DomainGroupRowData} from '@components/Tables/DomainGroupsTable';
import DomainGroupsTable from '@components/Tables/DomainGroupsTable';
import useDomainDocumentTitle from '@hooks/useDomainDocumentTitle';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
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

type DomainGroupsPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.GROUPS>;

function DomainGroupsPage({route}: DomainGroupsPageProps) {
    const {domainAccountID} = route.params;
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainNameSelector});
    useDomainDocumentTitle(domainName, 'domain.groups.title');
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Members']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const [groups = getEmptyArray<DomainSecurityGroupWithID>()] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: groupsSelector});
    const [defaultGroupID] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: defaultSecurityGroupIDSelector});
    const [pendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`);
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`);

    const groupRows: DomainGroupRowData[] = groups.map((group) => {
        const isDefault = group.id === defaultGroupID;
        const groupPendingActions = pendingActions?.[`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${group.id}`];
        const groupErrorMessage = getLatestError(domainErrors?.[`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${group.id}`]?.errors);
        const isFailedCreate = groupPendingActions?.createGroup === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && !isEmptyValueObject(groupErrorMessage);
        const isPendingDelete = isSecurityGroupPendingDeleteSelector(group.id)(pendingActions);

        return {
            keyForList: group.id,
            groupID: group.id,
            name: group.details.name ?? '',
            memberCount: Object.keys(group.details.shared).length,
            isDefault,
            errors: groupErrorMessage,
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
            text={translate('domain.groups.createNewGroupButton')}
            sentryLabel={CONST.SENTRY_LABEL.DOMAIN.GROUPS.CREATE_GROUP_BUTTON}
            onPress={() => Navigation.navigate(ROUTES.DOMAIN_GROUP_CREATE.getRoute(domainAccountID))}
            icon={icons.Plus}
            innerStyles={[shouldDisplayButtonsInSeparateLine && styles.alignItemsCenter]}
            style={shouldDisplayButtonsInSeparateLine ? [styles.flexGrow1, styles.mb3] : undefined}
            success
        />
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
                    onBackButtonPress={Navigation.popToSidebar}
                    icon={illustrations.Members}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    shouldUseHeadlineHeader
                >
                    {!shouldDisplayButtonsInSeparateLine && <View style={[styles.flexRow, styles.gap2]}>{createGroupHeaderButton}</View>}
                </HeaderWithBackButton>
                {shouldDisplayButtonsInSeparateLine && <View style={[styles.pl5, styles.pr5]}>{createGroupHeaderButton}</View>}

                <DomainGroupsTable groups={groupRows} />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

DomainGroupsPage.displayName = 'DomainGroupsPage';

export default DomainGroupsPage;
