import type {SubStepProps} from '@hooks/useSubStep/types';
import type {ReimbursementAccountForm} from '@src/types/form';

type CorpayFormField = {
    id: keyof ReimbursementAccountForm;
    isRequired: boolean;
    errorMessage: string;
    label: string;
    regEx?: string;
    validationRules: Array<{errorMessage: string; regEx: string}>;
    defaultValue?: string;
    detailedRule?: Array<{isRequired: boolean; value: Array<{errorMessage: string; regEx: string; ruleDescription: string}>}>;
};

type BankInfoSubStepProps = SubStepProps & {corpayFields: CorpayFormField[]};

export type {BankInfoSubStepProps, CorpayFormField};
