import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    AUDIT_RATE_PERCENTAGE: 'auditRatePercentage',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type RulesRandomReportAuditModalForm = Form<
    InputID,
    {
        [INPUT_IDS.AUDIT_RATE_PERCENTAGE]: string;
    }
>;

export type {RulesRandomReportAuditModalForm};
export default INPUT_IDS;
