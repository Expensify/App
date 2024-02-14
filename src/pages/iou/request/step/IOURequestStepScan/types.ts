import type {StackScreenProps} from '@react-navigation/stack';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type IOURequestStepRoute = StackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.SCAN_TAB>;

type IOURequestStepReport = {
    report: OnyxTypes.Report;
};

type IOURequestStepTransaction = {
    transaction: OnyxTypes.Transaction;
};

type IOURequestStepProps = IOURequestStepRoute & IOURequestStepReport & IOURequestStepTransaction;

export default IOURequestStepProps;
