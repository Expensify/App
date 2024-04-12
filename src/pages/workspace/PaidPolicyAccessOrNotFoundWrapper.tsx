/* eslint-disable rulesdir/no-negated-variables */
import React, {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Policy from '@userActions/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type PaidPolicyAccessOrNotFoundOnyxProps = {
    /** The report currently being looked at */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

type PaidPolicyAccessOrNotFoundComponentProps = PaidPolicyAccessOrNotFoundOnyxProps & {
    /** The children to render */
    children: ((props: PaidPolicyAccessOrNotFoundOnyxProps) => React.ReactNode) | React.ReactNode;

    /** The report currently being looked at */
    policyID: string;
};

function PaidPolicyAccessOrNotFoundComponent(props: PaidPolicyAccessOrNotFoundComponentProps) {
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

    const shouldShowNotFoundPage = isEmptyObject(props.policy) || !props.policy?.id || !PolicyUtils.isPaidGroupPolicy(props.policy) || !props.policy.isPolicyExpenseChatEnabled;

    if (shouldShowFullScreenLoadingIndicator) {
        return <FullscreenLoadingIndicator />;
    }

    if (shouldShowNotFoundPage) {
        return (
            <NotFoundPage
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_PROFILE.getRoute(props.policyID))}
                shouldForceFullScreen
            />
        );
    }

    return typeof props.children === 'function' ? props.children(props) : props.children;
}

export default withOnyx<PaidPolicyAccessOrNotFoundComponentProps, PaidPolicyAccessOrNotFoundOnyxProps>({
    policy: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID ?? ''}`,
    },
    isLoadingReportData: {
        key: ONYXKEYS.IS_LOADING_REPORT_DATA,
    },
})(PaidPolicyAccessOrNotFoundComponent);
