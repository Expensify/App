import type {TextSelection} from '@components/Composer/types';
import type * as OnyxTypes from '@src/types/onyx';

type ActiveEdit = {
    reportActionID: string;
    reportAction: OnyxTypes.ReportAction | null;
    message: string;
    currentSelection?: TextSelection;
};

// eslint-disable-next-line import/prefer-default-export
export type {ActiveEdit};
