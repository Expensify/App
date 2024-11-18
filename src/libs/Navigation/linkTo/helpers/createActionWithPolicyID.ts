import type {StackActionType} from '@react-navigation/native';

// Add policyID to the action payload
function createActionWithPolicyID(action: StackActionType, policyID: string): StackActionType | undefined {
    if (action.type !== 'PUSH' && action.type !== 'REPLACE') {
        return;
    }

    return {
        ...action,
        payload: {
            ...action.payload,
            params: {
                ...action.payload.params,
                policyID,
            },
        },
    };
}

export default createActionWithPolicyID;
