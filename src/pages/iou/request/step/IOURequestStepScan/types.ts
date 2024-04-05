import type {OnyxEntry} from 'react-native-onyx';
import type * as OnyxTypes from '@src/types/onyx';

type IOURequestStepOnyxProps = {
    transaction?: OnyxEntry<OnyxTypes.Transaction>;
    user: OnyxEntry<OnyxTypes.User>;
};

export default IOURequestStepOnyxProps;
