import Onyx from 'react-native-onyx';
import type * as OnyxUpdatesImport from '@userActions/OnyxUpdates';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer, Response} from '@src/types/onyx';

jest.mock('@libs/actions/OnyxUpdateManager/utils/applyUpdates');

const OnyxUpdatesImplementation = jest.requireActual<typeof OnyxUpdatesImport>('@libs/actions/OnyxUpdates');
const {doesClientNeedToBeUpdated, saveUpdateInformation} = OnyxUpdatesImplementation;

type OnyxUpdatesMock = typeof OnyxUpdatesImport & {
    apply: jest.Mock<Promise<Response | void>, [OnyxUpdatesFromServer]>;
};

let lastUpdateIDAppliedToClient: number | undefined = 0;
Onyx.connect({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: (val) => (lastUpdateIDAppliedToClient = val),
});

const apply = jest.fn(({lastUpdateID}: OnyxUpdatesFromServer): Promise<void | Response> | undefined => {
    if (lastUpdateID && (lastUpdateIDAppliedToClient === undefined || Number(lastUpdateID) > lastUpdateIDAppliedToClient)) {
        Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, Number(lastUpdateID));
    }

    return Promise.resolve();
});

export {
    // Mocks
    apply,

    // Actual OnyxUpdates implementation
    doesClientNeedToBeUpdated,
    saveUpdateInformation,
};

type ManualOnyxUpdateCheckIds = OnyxUpdatesImport.ManualOnyxUpdateCheckIds;
export type {ManualOnyxUpdateCheckIds};
export type {OnyxUpdatesMock};
