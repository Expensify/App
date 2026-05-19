import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import DomainListPageHeaderButton from '@components/Domain/DomainListPageHeaderButton';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBarWithLoadingBar from '@components/Navigation/TopBarWithLoadingBar';
import ScreenWrapper from '@components/ScreenWrapper';
import DomainListTable, {DomainRowData} from '@components/Tables/DomainListTable';
import WorkspaceListLayout from '@components/WorkspaceListLayout';
import WorkspaceTabs from '@components/WorkspacesTabs';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDocumentTitle from '@hooks/useDocumentTitle';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasDomainErrors} from '@libs/DomainUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isAdminSelector} from '@src/selectors/Domain';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function DomainsListPage() {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    useDocumentTitle(translate('common.domains'));

    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const [allDomainErrors] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN_ERRORS);

    const tabBarContent = <TabBarBottomContent selectedTab={NAVIGATION_TABS.WORKSPACES} />;

    const domainRows: DomainRowData[] = [];
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;

    if (!isEmptyObject(allDomains)) {
        for (const domain of Object.values(allDomains)) {
            if (!domain?.accountID || !domain.email) {
                continue;
            }

            const isDomainAdmin = isAdminSelector(currentUserPersonalDetails?.accountID)(domain);
            const domainErrors = allDomainErrors?.[`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domain.accountID}`];

            domainRows.push({
                rowType: 'domain',
                isAdmin: isDomainAdmin,
                isValidated: domain.validated,
                domainAccountID: domain.accountID,
                title: Str.extractEmailDomain(domain.email),
                errors: domainErrors?.errors,
                pendingAction: domain.pendingAction,
                brickRoadIndicator: hasDomainErrors(domainErrors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                action: () => navigateToDomain({domainAccountID: domain.accountID, isAdmin: isDomainAdmin}),
            });
        }
    }

    const navigateToDomain = ({domainAccountID, isAdmin}: {domainAccountID: number; isAdmin: boolean}) => {
        if (!isAdmin) {
            return Navigation.navigate(ROUTES.WORKSPACES_DOMAIN_ACCESS_RESTRICTED.getRoute(domainAccountID));
        }

        Navigation.navigate(ROUTES.DOMAIN_INITIAL.getRoute(domainAccountID));
    };

    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const activityIndicatorReasonAttributes = {
        context: 'DomainsListPage',
        isOffline,
    } satisfies SkeletonSpanReasonAttributes;

    const headerButton = <DomainListPageHeaderButton shouldShowNewDomainButton={!!domainRows.length} />;

    return (
        <WorkspaceListLayout headerButton={headerButton}>
            <View style={styles.flex1}>
                {shouldShowLoadingIndicator && (
                    <View style={[styles.flex1, styles.fullScreenLoading]}>
                        <ActivityIndicator
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            reasonAttributes={activityIndicatorReasonAttributes}
                        />
                    </View>
                )}

                {!shouldShowLoadingIndicator && <DomainListTable domains={domainRows} />}
            </View>
        </WorkspaceListLayout>
    );
}

export default DomainsListPage;
