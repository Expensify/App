import type {RouteProp} from '@react-navigation/native';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type IOURequestStepProps = {
    route: RouteProp<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.SCAN_TAB>;
    report: OnyxTypes.Report;
    transaction: OnyxTypes.Transaction;

};

export default IOURequestStepProps;
