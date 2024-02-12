/* eslint-disable rulesdir/no-negated-variables */
import type {RouteProp} from '@react-navigation/native';
import React, {useEffect} from 'react';
import type {ForwardedRef, RefAttributes} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Policy from '@userActions/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WithWorkspaceAccessOnyxProps = {
    /** The report currently being looked at */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Indicated whether the report data is loading */
    isLoadingWorkspaceData: OnyxEntry<boolean>;
};

type WithWorkspaceAccessProps = WithWorkspaceAccessOnyxProps & {
    /** The report currently being looked at */
    route: RouteProp<{params: {policyID: string}}>;

    /** The report currently being looked at */
    policy: OnyxTypes.Policy;
};

export default function (): <TProps extends WithWorkspaceAccessProps, TRef>(
    WrappedComponent: React.ComponentType<TProps & React.RefAttributes<TRef>>,
) => React.ComponentType<Omit<TProps & React.RefAttributes<TRef>, keyof WithWorkspaceAccessOnyxProps>> {
    return function <TProps extends WithWorkspaceAccessProps, TRef>(WrappedComponent: React.ComponentType<TProps & React.RefAttributes<TRef>>) {
        function WithWorkspaceAccess(props: TProps, ref: ForwardedRef<TRef>) {
            const isPolicyIDInRoute = !!props.route.params.policyID?.length;

            useEffect(() => {
                if (!isPolicyIDInRoute || !isEmptyObject(props.policy)) {
                    // If the workspace is not required or is already loaded, we don't need to call the API
                    return;
                }

                Policy.openWorkspace(props.route.params.policyID, []);
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [isPolicyIDInRoute, props.route.params.policyID]);

            const shouldShowFullScreenLoadingIndicator = props.isLoadingWorkspaceData !== false && (!Object.entries(props.policy ?? {}).length || !props.policy?.id);

            const shouldShowNotFoundPage = isEmptyObject(props.policy) || !props.policy?.id || !PolicyUtils.isPolicyAdmin(props.policy);

            if (shouldShowFullScreenLoadingIndicator) {
                return <FullscreenLoadingIndicator />;
            }

            if (shouldShowNotFoundPage) {
                return <NotFoundPage />;
            }

            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={ref}
                />
            );
        }

        WithWorkspaceAccess.displayName = `withWorkspaceAccess(${getComponentDisplayName(WrappedComponent)})`;

        return withOnyx<TProps & RefAttributes<TRef>, WithWorkspaceAccessOnyxProps>({
            policy: {
                key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID ?? ''}`,
            },
            isLoadingWorkspaceData: {
                key: ONYXKEYS.IS_LOADING_REPORT_DATA,
            },
        })(React.forwardRef(WithWorkspaceAccess));
    };
}

export type {WithWorkspaceAccessProps};
