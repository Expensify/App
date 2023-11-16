import isEmpty from 'lodash/isEmpty';
import React, {ComponentType, ForwardedRef, forwardRef, RefAttributes} from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import compose from '@libs/compose';
import ONYXKEYS from '@src/ONYXKEYS';
import withPolicy, {WithPolicyOnyxProps, WithPolicyProps} from './withPolicy';

type WithPolicyAndFullscreenLoadingOnyxProps = {
    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

type WithPolicyAndFullscreenLoadingProps = WithPolicyProps & WithPolicyAndFullscreenLoadingOnyxProps;

export default function withPolicyAndFullscreenLoading<TProps extends WithPolicyAndFullscreenLoadingProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): React.ComponentType<Omit<Omit<TProps & React.RefAttributes<TRef>, 'isLoadingReportData'>, keyof WithPolicyOnyxProps>> {
    function WithPolicyAndFullscreenLoading(props: TProps, ref: ForwardedRef<TRef>) {
        const isLoadingReportData = props.isLoadingReportData ?? true;

        if (isLoadingReportData && isEmpty(props.policy) && isEmpty(props.policyDraft)) {
            return <FullscreenLoadingIndicator />;
        }

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={ref}
            />
        );
    }

    WithPolicyAndFullscreenLoading.displayName = `WithPolicyAndFullscreenLoading`;

    return compose(
        withOnyx<TProps & RefAttributes<TRef>, WithPolicyAndFullscreenLoadingOnyxProps>({
            isLoadingReportData: {
                key: ONYXKEYS.IS_LOADING_REPORT_DATA,
            },
        }),
        withPolicy,
    )(forwardRef(WithPolicyAndFullscreenLoading));
}
