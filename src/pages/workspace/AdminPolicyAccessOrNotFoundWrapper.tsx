/* eslint-disable rulesdir/no-negated-variables */
import React, {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Policy from '@userActions/Policy';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type AdminAccessOrNotFoundOnyxProps = {
    /** The report currently being looked at */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

type AdminPolicyAccessOrNotFoundComponentProps = AdminAccessOrNotFoundOnyxProps & {
    /** The children to render */
    children: ((props: AdminAccessOrNotFoundOnyxProps) => React.ReactNode) | React.ReactNode;

    /** The report currently being looked at */
    policyID: string;

    /** Function to call when pressing the navigation link */
    onLinkPress?: () => void;

    /** The key in the translations file to use for the subtitle */
    subtitleKey?: TranslationPaths;
};

function AdminPolicyAccessOrNotFoundComponent(props: AdminPolicyAccessOrNotFoundComponentProps) {
    const isPolicyIDInRoute = !!props.policyID?.length;

    useEffect(() => {
        if (!isPolicyIDInRoute || !isEmptyObject(props.policy)) {
            // If the workspace is not required or is already loaded, we don't need to call the API
            return;
        }

        Policy.openWorkspace(props.policyID, []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPolicyIDInRoute, props.policyID]);

    const shouldShowFullScreenLoadingIndicator = props.isLoadingReportData !== false && (!Object.entries(props.policy ?? {}).length || !props.policy?.id);

    const shouldShowNotFoundPage = isEmptyObject(props.policy) || !props.policy?.id || !PolicyUtils.isPolicyAdmin(props.policy) || PolicyUtils.isPendingDeletePolicy(props.policy);

    if (shouldShowFullScreenLoadingIndicator) {
        return <FullscreenLoadingIndicator />;
    }

    if (shouldShowNotFoundPage) {
        const isPolicyNotAccessible = isEmptyObject(props.policy) || !props.policy?.id;

        if (isPolicyNotAccessible) {
            return (
                <ScreenWrapper testID={AdminPolicyAccessOrNotFoundComponent.displayName}>
                    <FullPageNotFoundView
                        shouldShow
                        shouldForceFullScreen
                        onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
                        onLinkPress={props.onLinkPress}
                        subtitleKey={props.subtitleKey}
                    />
                </ScreenWrapper>
            );
        }
        return <NotFoundPage onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_PROFILE.getRoute(props.policyID))} />;
    }

    return typeof props.children === 'function' ? props.children(props) : props.children;
}
AdminPolicyAccessOrNotFoundComponent.displayName = 'AdminPolicyAccessOrNotFoundComponent';

export default withOnyx<AdminPolicyAccessOrNotFoundComponentProps, AdminAccessOrNotFoundOnyxProps>({
    policy: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID ?? ''}`,
    },
    isLoadingReportData: {
        key: ONYXKEYS.IS_LOADING_REPORT_DATA,
    },
})(AdminPolicyAccessOrNotFoundComponent);
