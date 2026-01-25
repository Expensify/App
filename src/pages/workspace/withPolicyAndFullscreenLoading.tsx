import isEmpty from 'lodash/isEmpty';
import type {ComponentType} from 'react';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
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

type ComponentWithPolicyAndFullscreenLoading<TProps extends WithPolicyAndFullscreenLoadingProps> = ComponentType<
    Omit<Omit<TProps, keyof WithPolicyAndFullscreenLoadingOnyxProps>, keyof WithPolicyOnyxProps>
>;

export default function withPolicyAndFullscreenLoading<TProps extends WithPolicyAndFullscreenLoadingProps>(
    WrappedComponent: ComponentType<TProps>,
): ComponentWithPolicyAndFullscreenLoading<TProps> {
    function WithPolicyAndFullscreenLoading({
        policy = policyDefaultProps.policy,
        policyDraft = policyDefaultProps.policyDraft,
        isLoadingPolicy = policyDefaultProps.isLoadingPolicy,
        ...rest
    }: Omit<TProps, keyof WithPolicyAndFullscreenLoadingOnyxProps>) {
        const [isLoadingReportData = true] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, {canBeMissing: false});
        const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});

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
            />
        );
    }

    return withPolicy(WithPolicyAndFullscreenLoading);
}

export type {WithPolicyAndFullscreenLoadingProps};
