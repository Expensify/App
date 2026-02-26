import Onyx from 'react-native-onyx';
import {updateManyPolicyConnectionConfigs} from '@libs/actions/connections';
import {updateConnectionConfig} from '@libs/actions/PolicyConnections';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/connections');

describe('actions/PolicyConnections', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('updateConnectionConfig', () => {
        it('calls Connections.updateManyPolicyConnectionConfigs with correct parameters', () => {
            const policyID = 'policyID';
            const connectionName = CONST.POLICY.CONNECTIONS.NAME.QBO;
            const configUpdate = {
                syncPeople: true,
            };
            const configCurrentData = {
                syncPeople: false,
            };

            updateConnectionConfig(policyID, connectionName, configUpdate, configCurrentData);

            expect(updateManyPolicyConnectionConfigs).toHaveBeenCalledWith(policyID, connectionName, configUpdate, configCurrentData);
        });
    });
});
