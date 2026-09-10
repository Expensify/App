import type {IOUType} from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type BackupHandledArgs = {
    shouldResetLocalState: boolean;
};

type UseRestartOnOdometerImagesFailure = (
    transaction: OnyxEntry<Transaction>,
    reportID: string,
    iouType: IOUType,
    backToReport: string | undefined,
    onBackupHandled?: (args: BackupHandledArgs) => void,
) => {hasVerifiedBlobs: boolean};

export default UseRestartOnOdometerImagesFailure;
