import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {SetPolicyAutomaticApprovalLimitParams, SetPolicyDefaultReportTitleParams, SetPolicyPreventSelfApprovalParams} from '@libs/API/parameters';
import type SetPolicyPreventMemberCreatedTitleParams from '@libs/API/parameters/SetPolicyPreventMemberCreatedTitleParams';
import {WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Call the API to deactivate the card and request a new one
 * @param customName - name pattern to be used for the reports
 * @param policyID - id of the policy to apply the naming pattern to
 */
function modifyPolicyDefaultReportTitle(customName: string, policyID: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM,
            value: {
                isLoading: true,
                errors: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM,
            value: {
                isLoading: false,
            },
        },
    ];

    const parameters: SetPolicyDefaultReportTitleParams = {
        value: customName,
        policyID,
    };

    // API.write(WRITE_COMMANDS.SET_POLICY_DEFAULT_REPORT_TITLE, parameters, {
    //     optimisticData,
    //     successData,
    //     failureData,
    // });
}

/**
 * Call the API to deactivate the card and request a new one
 * @param enforced - flag whether to enforce policy name
 * @param policyID - id of the policy to apply the naming pattern to
 */
function setPolicyPreventMemberCreatedTitle(enforced: boolean, policyID: string) {
    console.log('setPolicyPreventMemberCreatedTitle ', enforced);
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM,
            value: {
                isLoading: true,
                errors: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM,
            value: {
                isLoading: false,
            },
        },
    ];

    const parameters: SetPolicyPreventMemberCreatedTitleParams = {
        enforced,
        policyID,
    };

    // API.write(WRITE_COMMANDS.SET_POLICY_PREVENT_MEMBER_CREATED_TITLE, parameters, {
    //     optimisticData,
    //     successData,
    //     failureData,
    // });
}

/**
 * Call the API to deactivate the card and request a new one
 * @param preventSelfApproval - flag whether to prevent workspace members from approving their own expense reports
 * @param policyID - id of the policy to apply the naming pattern to
 */
function setPolicyPreventSelfApproval(preventSelfApproval: boolean, policyID: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM,
            value: {
                isLoading: true,
                errors: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM,
            value: {
                isLoading: false,
            },
        },
    ];

    const parameters: SetPolicyPreventSelfApprovalParams = {
        preventSelfApproval,
        policyID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_PREVENT_SELF_APPROVAL, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Call the API to deactivate the card and request a new one
 * @param limit - max amount for auto-approval of the reports in the given policy
 * @param policyID - id of the policy to apply the limit to
 */
function setPolicyAutomaticApprovalLimit(limit: number, policyID: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_AUTO_APPROVE_REPORTS_UNDER_MODAL_FORM,
            value: {
                isLoading: true,
                errors: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_AUTO_APPROVE_REPORTS_UNDER_MODAL_FORM,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM,
            value: {
                isLoading: false,
            },
        },
    ];

    const parameters: SetPolicyAutomaticApprovalLimitParams = {
        limit,
        policyID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_AUTOMATIC_APPROVAL_LIMIT, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

export {modifyPolicyDefaultReportTitle, setPolicyPreventMemberCreatedTitle, setPolicyPreventSelfApproval, setPolicyAutomaticApprovalLimit};
