import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {fetchPerDiemRates} from '@libs/actions/Policy/PerDiem';
import Navigation from '@libs/Navigation/Navigation';
import {getPerDiemCustomUnit, isPolicyAdmin} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {ReactNode} from 'react';

import React, {useEffect} from 'react';
import {View} from 'react-native';

type PerDiemRatesGateProps = {
    /** Workspace whose per diem rates the content needs */
    policyID: string | undefined;

    /** Where an admin comes back to after adding rates from the empty state. Defaults to the current page. */
    backToRoute?: Route;

    /** Rendered once the workspace has per diem rates */
    children: ReactNode;
};

/**
 * Holds back per diem content until the workspace's rates are loaded, fetching them when they are missing. Shows a
 * loader while they load, the offline view when they can't be fetched, and an empty state when the workspace has none.
 */
function PerDiemRatesGate({policyID, backToRoute, children}: PerDiemRatesGateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const illustrations = useMemoizedLazyIllustrations(['EmptyStateExpenses']);
    const [policy, policyMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const customUnit = getPerDiemCustomUnit(policy);
    const hasRates = !isEmptyObject(customUnit?.rates);

    const isLoading = !isOffline && (!customUnit?.rates || isLoadingOnyxValue(policyMetadata));
    const shouldShowEmptyState = !hasRates && !isOffline && !isLoading;
    const shouldShowOfflineView = !hasRates && isOffline;

    useEffect(() => {
        if (hasRates || isOffline) {
            return;
        }
        fetchPerDiemRates(policyID);
        // Only refetch when coming back online. The fetch fills in the rates, which must not trigger another one.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOffline]);

    if (isLoading) {
        return (
            <ActivityIndicator
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                style={[styles.flex1]}
            />
        );
    }

    if (shouldShowOfflineView) {
        return <FullPageOfflineBlockingView>{null}</FullPageOfflineBlockingView>;
    }

    if (shouldShowEmptyState) {
        return (
            <View style={[styles.flex1]}>
                <WorkspaceEmptyStateSection
                    shouldStyleAsCard={false}
                    icon={illustrations.EmptyStateExpenses}
                    title={translate('workspace.perDiem.requestEmptyList.title')}
                    subtitle={isPolicyAdmin(policy) ? translate('workspace.perDiem.requestEmptyList.adminSubtitle') : translate('workspace.perDiem.requestEmptyList.subtitle', policy?.name)}
                    containerStyle={[styles.flex1, styles.justifyContentCenter, styles.alignSelfCenter]}
                />
                {isPolicyAdmin(policy) && (
                    <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                        <Button
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            size={CONST.BUTTON_SIZE.LARGE}
                            style={[styles.w100]}
                            onPress={() => {
                                if (!policy?.id) {
                                    return;
                                }
                                const workspacePerDiemRoute = ROUTES.WORKSPACE_PER_DIEM.getRoute(policy.id, backToRoute ?? Navigation.getActiveRoute());
                                requestAnimationFrame(() => {
                                    Navigation.navigate(workspacePerDiemRoute);
                                });
                            }}
                            sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.EDIT_PER_DIEM_RATES_BUTTON}
                        >
                            <Button.KeyboardShortcut />
                            <Button.Text>{translate('workspace.perDiem.editPerDiemRates')}</Button.Text>
                        </Button>
                    </FixedFooter>
                )}
            </View>
        );
    }

    return children;
}

export default PerDiemRatesGate;
