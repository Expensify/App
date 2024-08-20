import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {
    EnablePolicyAutoApprovalOptionsParams,
    EnablePolicyAutoReimbursementLimitParams,
    EnablePolicyDefaultReportTitleParams,
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
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Call the API to enable custom report title for the reports in the given policy
 * @param enabled - whether custom report title for the reports is enabled in the given policy
 * @param policyID - id of the policy to apply the limit to
 */
function enablePolicyDefaultReportTitle(enabled: boolean, policyID: string) {
    const policy = getPolicy(policyID);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                shouldShowCustomReportTitleOption: enabled,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                shouldShowCustomReportTitleOption: !!policy?.shouldShowCustomReportTitleOption,
            },
        },
    ];

    const parameters: EnablePolicyDefaultReportTitleParams = {
        enable: enabled,
        policyID,
    };

    API.write(WRITE_COMMANDS.ENABLE_POLICY_DEFAULT_REPORT_TITLE, parameters, {
        optimisticData,
        failureData,
    });
}

/**
 * Call the API to deactivate the card and request a new one
 * @param customName - name pattern to be used for the reports
 * @param policyID - id of the policy to apply the naming pattern to
 */
function setPolicyDefaultReportTitle(customName: string, policyID: string) {
    const policy = getPolicy(policyID);
    const previousFieldList = policy?.fieldList ?? {};

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                fieldList: {
                    [CONST.POLICY.FIELD_LIST_TITLE_FIELD_ID]: {...previousFieldList, defaultValue: customName},
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                fieldList: {
                    [CONST.POLICY.FIELD_LIST_TITLE_FIELD_ID]: previousFieldList,
                },
            },
        },
    ];

    const parameters: SetPolicyDefaultReportTitleParams = {
        value: customName,
        policyID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_DEFAULT_REPORT_TITLE, parameters, {
        optimisticData,
        failureData,
    });
}

/**
 * Call the API to deactivate the card and request a new one
 * @param enforced - flag whether to enforce policy name
 * @param policyID - id of the policy to apply the naming pattern to
 */
function setPolicyPreventMemberCreatedTitle(enforced: boolean, policyID: string) {
    const policy = getPolicy(policyID);
    const previousFieldList = policy?.fieldList ?? {};

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                fieldList: {
                    [CONST.POLICY.FIELD_LIST_TITLE_FIELD_ID]: {...previousFieldList, deletable: !enforced},
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                fieldList: {
                    [CONST.POLICY.FIELD_LIST_TITLE_FIELD_ID]: previousFieldList,
                },
            },
        },
    ];

    const parameters: SetPolicyPreventMemberCreatedTitleParams = {
        enforced,
        policyID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_PREVENT_MEMBER_CREATED_TITLE, parameters, {
        optimisticData,
        failureData,
    });
}

/**
 * Call the API to deactivate the card and request a new one
 * @param preventSelfApproval - flag whether to prevent workspace members from approving their own expense reports
 * @param policyID - id of the policy to apply the naming pattern to
 */
function setPolicyPreventSelfApproval(preventSelfApproval: boolean, policyID: string) {
    const policy = getPolicy(policyID);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                preventSelfApproval,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                preventSelfApproval: policy?.preventSelfApproval,
            },
        },
    ];

    const parameters: SetPolicyPreventSelfApprovalParams = {
        preventSelfApproval,
        policyID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_PREVENT_SELF_APPROVAL, parameters, {
        optimisticData,
        failureData,
    });
}

/**
 * Call the API to deactivate the card and request a new one
 * @param limit - max amount for auto-approval of the reports in the given policy
 * @param policyID - id of the policy to apply the limit to
 */
function setPolicyAutomaticApprovalLimit(limit: string, policyID: string) {
    const fallbackLimit = limit === '' ? '0' : limit;
    const parsedLimit = CurrencyUtils.convertToBackendAmount(parseFloat(fallbackLimit));
    const policy = getPolicy(policyID);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoApproval: {
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
                autoApproval: {
                    limit: policy?.autoApproval?.limit,
                },
            },
        },
    ];

    const parameters: SetPolicyAutomaticApprovalLimitParams = {
        limit: parsedLimit,
        policyID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_AUTOMATIC_APPROVAL_LIMIT, parameters, {
        optimisticData,
        failureData,
    });
}

/**
 * Call the API to deactivate the card and request a new one
 * @param auditRate - percentage of the reports to be qualified for a random audit
 * @param policyID - id of the policy to apply the limit to
 */
function setPolicyAutomaticApprovalAuditRate(auditRate: string, policyID: string) {
    const fallbackAuditRate = auditRate === '' ? '0' : auditRate;
    const parsedAuditRate = parseInt(fallbackAuditRate, 10);
    const policy = getPolicy(policyID);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoApproval: {
                    auditRate: parsedAuditRate,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoApproval: {
                    auditRate: policy?.autoApproval?.auditRate,
                },
            },
        },
    ];

    const parameters: SetPolicyAutomaticApprovalAuditRateParams = {
        auditRate: parsedAuditRate,
        policyID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_AUTOMATIC_APPROVAL_AUDIT_RATE, parameters, {
        optimisticData,
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
    const fallbackLimit = limit === '' ? '0' : limit;
    const parsedLimit = CurrencyUtils.convertToBackendAmount(parseFloat(fallbackLimit));

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
    enablePolicyDefaultReportTitle,
    setPolicyDefaultReportTitle,
    setPolicyPreventMemberCreatedTitle,
    setPolicyPreventSelfApproval,
    setPolicyAutomaticApprovalLimit,
    setPolicyAutomaticApprovalAuditRate,
    setPolicyAutoReimbursementLimit,
    enablePolicyAutoReimbursementLimit,
    enableAutoApprovalOptions,
};
