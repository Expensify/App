import type {SubStepProps} from '@hooks/useSubStep/types';
import type {CorpayFields} from '@src/types/onyx/CorpayFields';

type BankInfoSubStepProps = SubStepProps & {corpayFields?: CorpayFields; preferredMethod?: string};

export type {BankInfoSubStepProps, CorpayFields};
