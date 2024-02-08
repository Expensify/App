import type {RouteProp} from '@react-navigation/native';
import {useEffect} from 'react';
import type {ForwardedRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Policy from '@userActions/Policy';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WithWorkspaceAccessOnyxProps = {
    report: OnyxEntry<OnyxTypes.Report>;
    isLoadingWorkspaceData: OnyxEntry<boolean>;
};

type WithWorkspaceAccessProps = WithWorkspaceAccessOnyxProps & {
    route: RouteProp<{params: {policyID: string}}>;
};

export default function (): <TProps extends WithWorkspaceAccessProps, TRef>(
    WrappedComponent: React.ComponentType<TProps & React.RefAttributes<TRef>>,
) => React.ComponentType<Omit<TProps & React.RefAttributes<TRef>, keyof WithWorkspaceAccessOnyxProps>> {
    return function <TProps extends WithWorkspaceAccessProps, TRef>(WrappedComponent: React.ComponentType<TProps & React.RefAttributes<TRef>>) {
        function WithWorkspaceAccess(props: TProps, ref: ForwardedRef<TRef>) {
            const isPolicyIDInRoute = !!props.route.params.policyID?.length;

            useEffect(() => {
                if (!isPolicyIDInRoute || !isEmptyObject(props.report)) {
                    return;
                }

                Policy.openWorkspace(props.route.params.policyID, []);
            }, [isPolicyIDInRoute, props.report, props.route.params.policyID]);

            const shouldShowFullScreenLoadingIndicator = props.isLoadingWorkspaceData !== false && (!isEmptyObject(props.report) || !props.report?.policyID);
            // eslint-disable-next-line rulesdir/no-negated-variables
            const shouldShowNotFoundPage = !isEmptyObject(props.report) || !props.report?.policyID || !Policy.canAccessWorkspace(props.report);

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
            report: {
                key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.policyID}`,
            },
            isLoadingWorkspaceData: {
                key: ONYXKEYS.IS_LOADING_REPORT_DATA,
            },
        })(React.forwardRef(WithWorkspaceAccess));
    };
}

export type {WithWorkspaceAccessProps};
