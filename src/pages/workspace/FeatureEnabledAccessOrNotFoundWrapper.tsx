/* eslint-disable rulesdir/no-negated-variables */
import React, {useEffect, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useNetwork from '@hooks/useNetwork';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as Policy from '@userActions/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type FeatureEnabledAccessOrNotFoundOnyxProps = {
    /** The report currently being looked at */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

type FeatureEnabledAccessOrNotFoundComponentProps = FeatureEnabledAccessOrNotFoundOnyxProps & {
    /** The children to render */
    children: ((props: FeatureEnabledAccessOrNotFoundOnyxProps) => React.ReactNode) | React.ReactNode;

    /** The report currently being looked at */
    policyID: string;

    /** The current feature name that the user tries to get access */
    featureName: PolicyFeatureName;
};

function FeatureEnabledAccessOrNotFoundComponent(props: FeatureEnabledAccessOrNotFoundComponentProps) {
    const isPolicyIDInRoute = !!props.policyID?.length;
    const [isPolicyFeatureEnabled, setIsPolicyFeatureEnabled] = useState(PolicyUtils.isPolicyFeatureEnabled(props.policy, props.featureName));
    const shouldShowFullScreenLoadingIndicator = props.isLoadingReportData !== false && (!Object.entries(props.policy ?? {}).length || !props.policy?.id);
    const shouldShowNotFoundPage = isEmptyObject(props.policy) || !props.policy?.id || !isPolicyFeatureEnabled;
    const {isOffline} = useNetwork();

    useEffect(() => {
        if (!isPolicyIDInRoute || !isEmptyObject(props.policy)) {
            // If the workspace is not required or is already loaded, we don't need to call the API
            return;
        }

        Policy.openWorkspace(props.policyID, []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPolicyIDInRoute, props.policyID]);

    useEffect(() => {
        if (props.policy?.pendingFields?.[props.featureName] === 'update' && !PolicyUtils.isPolicyFeatureEnabled(props.policy, props.featureName) && !isOffline) {
            return;
        }
        setIsPolicyFeatureEnabled(PolicyUtils.isPolicyFeatureEnabled(props.policy, props.featureName));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.policy?.pendingFields?.[props.featureName], PolicyUtils.isPolicyFeatureEnabled(props.policy, props.featureName)]);

    if (shouldShowFullScreenLoadingIndicator) {
        return <FullscreenLoadingIndicator />;
    }

    if (shouldShowNotFoundPage) {
        return (
            <FullPageNotFoundView
                shouldShow={shouldShowNotFoundPage}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
                shouldForceFullScreen
            />
        );
    }

    return typeof props.children === 'function' ? props.children(props) : props.children;
}

export default withOnyx<FeatureEnabledAccessOrNotFoundComponentProps, FeatureEnabledAccessOrNotFoundOnyxProps>({
    policy: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID ?? ''}`,
    },
    isLoadingReportData: {
        key: ONYXKEYS.IS_LOADING_REPORT_DATA,
    },
})(FeatureEnabledAccessOrNotFoundComponent);
