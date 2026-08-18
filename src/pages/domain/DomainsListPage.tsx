import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/ButtonComposed';
import type {DomainRowData} from '@components/Tables/DomainListTable';
import DomainListTable from '@components/Tables/DomainListTable';
import WorkspaceListLayout from '@components/WorkspaceListLayout';

import useDocumentTitle from '@hooks/useDocumentTitle';
import {useIsAppLoadPending} from '@hooks/useInFlightRequests';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {hasDomainErrors} from '@libs/DomainUtils';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {hasDomainAccess, isAdminSelector} from '@src/selectors/Domain';
import {sessionEmailAndAccountIDSelector} from '@src/selectors/Session';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

function DomainsListPage() {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);

    useDocumentTitle(translate('common.domains'));

    const isAppLoadPending = useIsAppLoadPending();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: sessionEmailAndAccountIDSelector});
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const [allDomainErrors] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN_ERRORS);
    const [myDomainSecurityGroups] = useOnyx(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS);

    const navigateToDomain = ({domainAccountID, isAdmin}: {domainAccountID: number; isAdmin: boolean}) => {
        if (!isAdmin) {
            return Navigation.navigate(ROUTES.WORKSPACES_DOMAIN_ACCESS_RESTRICTED.getRoute(domainAccountID));
        }

        Navigation.navigate(ROUTES.DOMAIN_INITIAL.getRoute(domainAccountID));
    };

    const domainRows: DomainRowData[] = [];
    const shouldShowLoadingIndicator = isAppLoadPending && !isOffline;

    if (!isEmptyObject(allDomains)) {
        const currentUserAccountID = session?.accountID;

        for (const domain of Object.values(allDomains)) {
            if (!domain?.accountID || !domain.email) {
                continue;
            }

            if (!currentUserAccountID || !hasDomainAccess(currentUserAccountID, session?.email, myDomainSecurityGroups)(domain)) {
                continue;
            }

            const isDomainAdmin = isAdminSelector(currentUserAccountID)(domain);
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

    const headerButton = !!domainRows.length && (
        <Button
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            accessibilityLabel={translate('common.new')}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.LIST.NEW_DOMAIN_BUTTON}
            onPress={() => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACES_ADD_DOMAIN))}
        >
            <Button.Icon src={icons.Plus} />
            <Button.Text>{translate('common.new')}</Button.Text>
        </Button>
    );

    return (
        <WorkspaceListLayout
            activeTabKey="domains"
            headerButton={headerButton}
        >
            <View style={styles.flex1}>
                {shouldShowLoadingIndicator && (
                    <View style={[styles.flex1, styles.fullScreenLoading]}>
                        <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                    </View>
                )}

                {!shouldShowLoadingIndicator && <DomainListTable domains={domainRows} />}
            </View>
        </WorkspaceListLayout>
    );
}

export default DomainsListPage;
