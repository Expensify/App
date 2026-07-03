import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import type {DomainRowData} from '@components/Tables/DomainListTable';
import DomainListTable from '@components/Tables/DomainListTable';
import WorkspaceListLayout from '@components/WorkspaceListLayout';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDocumentTitle from '@hooks/useDocumentTitle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {hasDomainErrors} from '@libs/DomainUtils';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isAdminSelector} from '@src/selectors/Domain';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

function DomainsListPage() {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    useDocumentTitle(translate('common.domains'));

    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const [allDomainErrors] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN_ERRORS);

    const navigateToDomain = ({domainAccountID, isAdmin}: {domainAccountID: number; isAdmin: boolean}) => {
        if (!isAdmin) {
            return Navigation.navigate(ROUTES.WORKSPACES_DOMAIN_ACCESS_RESTRICTED.getRoute(domainAccountID));
        }

        Navigation.navigate(ROUTES.DOMAIN_INITIAL.getRoute(domainAccountID));
    };

    const domainRows: DomainRowData[] = [];
    const shouldShowLoadingIndicator = !!isLoadingApp && !isOffline;

    if (!isEmptyObject(allDomains)) {
        for (const domain of Object.values(allDomains)) {
            if (!domain?.accountID || !domain.email) {
                continue;
            }

            const isDomainAdmin = isAdminSelector(currentUserPersonalDetails?.accountID)(domain);
            const domainErrors = allDomainErrors?.[`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domain.accountID}`];

            domainRows.push({
                keyForList: String(domain.accountID),
                isAdmin: isDomainAdmin,
                isValidated: domain.validated,
                domainAccountID: domain.accountID,
                title: Str.extractEmailDomain(domain.email),
                errors: domainErrors?.errors,
                pendingAction: domain.pendingAction,
                disabled: domain.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                brickRoadIndicator: hasDomainErrors(domainErrors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                action: () => navigateToDomain({domainAccountID: domain.accountID, isAdmin: isDomainAdmin}),
            });
        }
    }

    const activityIndicatorReasonAttributes = {
        context: 'DomainsListPage',
        isOffline,
    } satisfies SkeletonSpanReasonAttributes;

    const headerButton = !!domainRows.length && (
        <Button
            success
            accessibilityLabel={translate('common.new')}
            text={translate('common.new')}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.LIST.NEW_DOMAIN_BUTTON}
            onPress={() => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACES_ADD_DOMAIN))}
            icon={icons.Plus}
        />
    );

    return (
        <WorkspaceListLayout
            activeTabKey="domains"
            headerButton={headerButton}
        >
            {(headerComponent) => (
                <View style={styles.flex1}>
                    {shouldShowLoadingIndicator && (
                        <>
                            {headerComponent}
                            <View style={[styles.flex1, styles.fullScreenLoading]}>
                                <ActivityIndicator
                                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                                    reasonAttributes={activityIndicatorReasonAttributes}
                                />
                            </View>
                        </>
                    )}

                    {!shouldShowLoadingIndicator && (
                        <DomainListTable
                            domains={domainRows}
                            headerComponent={headerComponent}
                        />
                    )}
                </View>
            )}
        </WorkspaceListLayout>
    );
}

export default DomainsListPage;
