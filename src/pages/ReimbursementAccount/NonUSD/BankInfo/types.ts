import type {SubPageProps} from '@hooks/useSubPage/types';
import type {CorpayFields} from '@src/types/onyx/CorpayFields';

type BankInfoSubStepProps = SubPageProps & {corpayFields?: CorpayFields; preferredMethod?: string};

export default BankInfoSubStepProps;
