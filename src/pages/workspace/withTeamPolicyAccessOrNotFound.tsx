/* eslint-disable rulesdir/no-negated-variables */
import React, {useEffect} from 'react';
import type {ForwardedRef, RefAttributes} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WithTeamPolicyAccessOrNotFoundOnyxProps = {
    /** The report currently being looked at */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

type WithTeamPolicyAccessOrNotFoundProps = WithTeamPolicyAccessOrNotFoundOnyxProps & {
    /** The report currently being looked at */
    route: {params: {policyID: string}};

    /** The report currently being looked at */
    policy: OnyxTypes.Policy;
};

export default function (): <TProps extends WithTeamPolicyAccessOrNotFoundProps, TRef>(
    WrappedComponent: React.ComponentType<TProps & React.RefAttributes<TRef>>,
) => React.ComponentType<Omit<TProps & React.RefAttributes<TRef>, keyof WithTeamPolicyAccessOrNotFoundOnyxProps>> {
    return function <TProps extends WithTeamPolicyAccessOrNotFoundProps, TRef>(WrappedComponent: React.ComponentType<TProps & React.RefAttributes<TRef>>) {
        function WithTeamPolicyAccessOrNotFound(props: TProps, ref: ForwardedRef<TRef>) {
            const isPolicyIDInRoute = !!props.route.params.policyID?.length;

            useEffect(() => {
                if (!isPolicyIDInRoute || !isEmptyObject(props.policy)) {
                    // If the workspace is not required or is already loaded, we don't need to call the API
                    return;
                }

                Policy.openWorkspace(props.route.params.policyID, []);
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [isPolicyIDInRoute, props.route.params.policyID]);

            const shouldShowFullScreenLoadingIndicator = props.isLoadingReportData !== false && (!Object.entries(props.policy ?? {}).length || !props.policy?.id);

            const shouldShowNotFoundPage = isEmptyObject(props.policy) || !props.policy?.id || props.policy.type !== CONST.POLICY.TYPE.TEAM || !PolicyUtils.isPolicyAdmin(props.policy);

            if (shouldShowFullScreenLoadingIndicator) {
                return <FullscreenLoadingIndicator />;
            }

            if (shouldShowNotFoundPage) {
                return <NotFoundPage onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)} />;
            }

            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={ref}
                />
            );
        }

        WithTeamPolicyAccessOrNotFound.displayName = `withTeamPolicyAccessOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

        return withOnyx<TProps & RefAttributes<TRef>, WithTeamPolicyAccessOrNotFoundOnyxProps>({
            policy: {
                key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID ?? ''}`,
            },
            isLoadingReportData: {
                key: ONYXKEYS.IS_LOADING_REPORT_DATA,
            },
        })(React.forwardRef(WithTeamPolicyAccessOrNotFound));
    };
}

export type {WithTeamPolicyAccessOrNotFoundProps};
