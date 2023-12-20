import isEmpty from 'lodash/isEmpty';
import React, {ComponentType, ForwardedRef, forwardRef, RefAttributes} from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import compose from '@libs/compose';
import ONYXKEYS from '@src/ONYXKEYS';
import withPolicy, {policyDefaultProps, WithPolicyOnyxProps, WithPolicyProps} from './withPolicy';

type WithPolicyAndFullscreenLoadingOnyxProps = {
    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

type WithPolicyAndFullscreenLoadingProps = WithPolicyProps & WithPolicyAndFullscreenLoadingOnyxProps;

type ComponentWithPolicyAndFullscreenLoading<TProps extends WithPolicyAndFullscreenLoadingProps, TRef> = ComponentType<
    Omit<Omit<TProps & RefAttributes<TRef>, keyof WithPolicyAndFullscreenLoadingOnyxProps>, keyof WithPolicyOnyxProps>
>;

export default function withPolicyAndFullscreenLoading<TProps extends WithPolicyAndFullscreenLoadingProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): ComponentWithPolicyAndFullscreenLoading<TProps, TRef> {
    function WithPolicyAndFullscreenLoading(
        {
            isLoadingReportData = true,
            policy = policyDefaultProps.policy,
            policyDraft = policyDefaultProps.policyDraft,
            policyMembers = policyDefaultProps.policyMembers,
            policyMembersDraft = policyDefaultProps.policyMembersDraft,
            ...rest
        }: TProps,
        ref: ForwardedRef<TRef>,
    ) {
        if (isLoadingReportData && isEmpty(policy) && isEmpty(policyDraft)) {
            return <FullscreenLoadingIndicator />;
        }

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(rest as TProps)}
                isLoadingReportData={isLoadingReportData}
                policy={policy}
                policyDraft={policyDraft}
                policyMembers={policyMembers}
                policyMembersDraft={policyMembersDraft}
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
