import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

// TODO: Implement this when we have the Travel enable API
function enablePolicyTravel(policyID: string, enabled: boolean) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        areTravelEnabled: enabled,
        pendingFields: {
            areTravelEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
        },
    });

    setTimeout(() => {
        Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
            pendingFields: {
                areTravelEnabled: null,
            },
        });
    }, 1000);
}

// eslint-disable-next-line import/prefer-default-export
export {enablePolicyTravel};
