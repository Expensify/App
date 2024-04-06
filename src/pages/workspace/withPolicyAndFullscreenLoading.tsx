import isEmpty from 'lodash/isEmpty';
import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React, {forwardRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import compose from '@libs/compose';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import type {WithPolicyOnyxProps, WithPolicyProps} from './withPolicy';
import withPolicy, {policyDefaultProps} from './withPolicy';

type WithPolicyAndFullscreenLoadingOnyxProps = {
    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;

    /** Personal details of all users */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type WithPolicyAndFullscreenLoadingProps = WithPolicyProps & WithPolicyAndFullscreenLoadingOnyxProps;

type ComponentWithPolicyAndFullscreenLoading<TProps extends WithPolicyAndFullscreenLoadingProps, TRef> = ComponentType<
    Omit<Omit<TProps & RefAttributes<TRef>, keyof WithPolicyAndFullscreenLoadingOnyxProps>, keyof WithPolicyOnyxProps>
>;

export default function withPolicyAndFullscreenLoading<TProps extends WithPolicyAndFullscreenLoadingProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): ComponentWithPolicyAndFullscreenLoading<TProps, TRef> {
    function WithPolicyAndFullscreenLoading(
        {isLoadingReportData = true, policy = policyDefaultProps.policy, policyDraft = policyDefaultProps.policyDraft, ...rest}: TProps,
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
            personalDetails: {
                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            },
        }),
        withPolicy,
    )(forwardRef(WithPolicyAndFullscreenLoading));
}

export type {WithPolicyAndFullscreenLoadingProps};
