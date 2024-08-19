import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {
    EnablePolicyAutoApprovalOptionsParams,
    EnablePolicyAutoReimbursementLimitParams,
    SetPolicyAutomaticApprovalLimitParams,
    SetPolicyAutoReimbursementLimitParams,
    SetPolicyDefaultReportTitleParams,
    SetPolicyPreventSelfApprovalParams,
} from '@libs/API/parameters';
import type SetPolicyAutomaticApprovalAuditRateParams from '@libs/API/parameters/SetPolicyAutomaticApprovalAuditRate';
import type SetPolicyPreventMemberCreatedTitleParams from '@libs/API/parameters/SetPolicyPreventMemberCreatedTitleParams';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import {getPolicy} from '@libs/PolicyUtils';
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
function setPolicyAutomaticApprovalLimit(limit: string, policyID: string) {
    const parsedLimit = CurrencyUtils.convertToBackendAmount(parseFloat(limit));

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
        limit: parsedLimit,
        policyID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_AUTOMATIC_APPROVAL_LIMIT, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Call the API to deactivate the card and request a new one
 * @param auditRate - percentage of the reports to be qualified for a random audit
 * @param policyID - id of the policy to apply the limit to
 */
function setPolicyAutomaticApprovalAuditRate(auditRate: number, policyID: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_RANDOM_REPORT_AUDIT_MODAL_FORM,
            value: {
                isLoading: true,
                errors: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_RANDOM_REPORT_AUDIT_MODAL_FORM,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_RANDOM_REPORT_AUDIT_MODAL_FORM,
            value: {
                isLoading: false,
            },
        },
    ];

    const parameters: SetPolicyAutomaticApprovalAuditRateParams = {
        auditRate,
        policyID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_AUTOMATIC_APPROVAL_AUDIT_RATE, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Call the API to enable auto-approval for the reports in the given policy
 * @param enabled - whether auto-approve for the reports is enabled in the given policy
 * @param policyID - id of the policy to apply the limit to
 */
function enableAutoApprovalOptions(enabled: boolean, policyID: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                shouldShowAutoApprovalOptions: enabled,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                shouldShowAutoApprovalOptions: !enabled,
            },
        },
    ];

    const parameters: EnablePolicyAutoApprovalOptionsParams = {
        enabled,
        policyID,
    };

    API.write(WRITE_COMMANDS.ENABLE_POLICY_AUTO_APPROVAL_OPTIONS, parameters, {
        optimisticData,
        failureData,
    });
}

/**
 * Call the API to deactivate the card and request a new one
 * @param limit - max amount for auto-payment for the reports in the given policy
 * @param policyID - id of the policy to apply the limit to
 */
function setPolicyAutoReimbursementLimit(limit: string, policyID: string) {
    const policy = getPolicy(policyID);
    const parsedLimit = CurrencyUtils.convertToBackendAmount(parseFloat(limit));

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_AUTO_PAY_REPORTS_UNDER_MODAL_FORM,
            value: {
                maxExpenseAutoPayAmount: limit,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoReimbursement: {
                    limit: parsedLimit,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.RULES_AUTO_PAY_REPORTS_UNDER_MODAL_FORM,
            value: {
                maxExpenseAutoPayAmount: limit,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoReimbursement: {
                    limit: parsedLimit,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoReimbursement: policy?.autoReimbursement,
                errors,
            },
        },
    ];

    const parameters: SetPolicyAutoReimbursementLimitParams = {
        autoReimbursement: {limit: parsedLimit},
        policyID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_AUTO_REIMBURSEMENT_LIMIT, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Call the API to enable auto-payment for the reports in the given policy
 * @param enabled - whether auto-payment for the reports is enabled in the given policy
 * @param policyID - id of the policy to apply the limit to
 */
function enablePolicyAutoReimbursementLimit(enabled: boolean, policyID: string) {
    const policy = getPolicy(policyID);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                shouldShowAutoReimbursementLimitOption: enabled,
                autoReimbursement: {
                    limit: enabled ? policy?.autoReimbursement?.limit : 10000,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                shouldShowAutoReimbursementLimitOption: !enabled,
                autoReimbursement: {
                    limit: policy?.autoReimbursement?.limit,
                },
            },
        },
    ];

    const parameters: EnablePolicyAutoReimbursementLimitParams = {
        enabled,
        policyID,
    };

    API.write(WRITE_COMMANDS.ENABLE_POLICY_AUTO_REIMBURSEMENT_LIMIT, parameters, {
        optimisticData,
        failureData,
    });
}

export {
    modifyPolicyDefaultReportTitle,
    setPolicyPreventMemberCreatedTitle,
    setPolicyPreventSelfApproval,
    setPolicyAutomaticApprovalLimit,
    setPolicyAutomaticApprovalAuditRate,
    setPolicyAutoReimbursementLimit,
    enablePolicyAutoReimbursementLimit,
    enableAutoApprovalOptions,
};
