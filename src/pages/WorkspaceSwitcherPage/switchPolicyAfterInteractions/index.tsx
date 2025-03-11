import Navigation from '@navigation/Navigation';

function switchPolicyAfterInteractions(newPolicyID: string | undefined) {
    Navigation.switchPolicyID(newPolicyID);
}

export default switchPolicyAfterInteractions;
