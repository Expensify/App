import isEmpty from 'lodash/isEmpty';
import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React, {forwardRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
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
        {
            policy = policyDefaultProps.policy,
            policyDraft = policyDefaultProps.policyDraft,
            isLoadingPolicy = policyDefaultProps.isLoadingPolicy,
            ...rest
        }: Omit<TProps, keyof WithPolicyAndFullscreenLoadingOnyxProps>,
        ref: ForwardedRef<TRef>,
    ) {
        const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, {initialValue: true});
        const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

        if ((isLoadingPolicy || isLoadingReportData) && isEmpty(policy) && isEmpty(policyDraft)) {
            return <FullscreenLoadingIndicator />;
        }

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(rest as TProps)}
                isLoadingReportData={isLoadingReportData}
                personalDetails={personalDetails}
                policy={policy}
                policyDraft={policyDraft}
                ref={ref}
            />
        );
    }

    WithPolicyAndFullscreenLoading.displayName = 'WithPolicyAndFullscreenLoading';

    return withPolicy(forwardRef(WithPolicyAndFullscreenLoading));
}

export type {WithPolicyAndFullscreenLoadingProps};
