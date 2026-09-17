import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {ValueOf} from 'type-fest';

type Country = keyof typeof CONST.ALL_COUNTRIES;

type OnboardingTaskLinks = Partial<{
    onboardingCompanySize: ValueOf<typeof CONST.ONBOARDING_COMPANY_SIZE>;
    integrationName: string;
    workspaceSettingsLink: string;
    workspaceCategoriesLink: string;
    workspaceTagsLink: string;
    workspaceMoreFeaturesLink: string;
    workspaceMembersLink: string;
    workspaceAccountingLink: string;
    workspaceConfirmationLink: string;
    testDriveURL: string;
    corporateCardLink: string;
}>;

type OnboardingTask = {
    type: ValueOf<typeof CONST.ONBOARDING_TASK_TYPE>;
    autoCompleted: boolean;
    title: string | ((params: OnboardingTaskLinks) => string);
    description: string | ((params: OnboardingTaskLinks) => string);
};

type ReportAction = {
    reportActionID: string;
    actionName: DeepValueOf<typeof CONST.REPORT.ACTIONS.TYPE>;
    created: string;
};

type OnyxInputOrEntry<TOnyxValue> = TOnyxValue | null | undefined;

type OriginalMessageReportPreview = {
    linkedReportID: string;
    whisperedTo?: number[];
};

type OriginalMessageSettlementAccountLocked = {
    maskedBankAccountNumber: string;
    policyID: string;
};

type PolicyRuleTaxRate = {
    externalID: string;
    value: string;
    name: string;
};

type PolicyRulesModifiedFields = {
    merchant?: string;
    category?: string;
    tag?: string;
    comment?: string;
    description?: string;
    billable?: boolean;
    reimbursable?: boolean;
    tax?: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        field_id_TAX: PolicyRuleTaxRate;
    };
};

type PersonalRulesModifiedFields = PolicyRulesModifiedFields & {
    reportName?: string;
};

type ConnectionName = ValueOf<typeof CONST.POLICY.CONNECTIONS.NAME>;
type AllConnectionName = ConnectionName;
type PolicyConnectionSyncStage = ValueOf<typeof CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME>;
type SageIntacctMappingName = ValueOf<typeof CONST.SAGE_INTACCT_CONFIG.MAPPINGS>;
type DelegateRole = ValueOf<typeof CONST.DELEGATE_ROLE>;
type ViolationDataType = ValueOf<typeof CONST.MODIFIED_AMOUNT_VIOLATION_DATA>;

export type {
    AllConnectionName,
    ConnectionName,
    Country,
    DelegateRole,
    OnboardingTask,
    OnyxInputOrEntry,
    OriginalMessageReportPreview,
    OriginalMessageSettlementAccountLocked,
    PersonalRulesModifiedFields,
    PolicyConnectionSyncStage,
    PolicyRulesModifiedFields,
    ReportAction,
    SageIntacctMappingName,
    ViolationDataType,
};
