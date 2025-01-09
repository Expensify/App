import type {SubStepProps} from '@hooks/useSubStep/types';
import type CorpayFormFields from '@src/types/onyx/CorpayFields';

type BankInfoSubStepProps = SubStepProps & {corpayFields?: CorpayFormFields; preferredMethod?: string};

export type {BankInfoSubStepProps, CorpayFormFields};
