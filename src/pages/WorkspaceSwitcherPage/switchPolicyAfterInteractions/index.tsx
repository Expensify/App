import Navigation from '@libs/Navigation/Navigation';

function switchPolicyAfterInteractions(newPolicyID: string | undefined) {
    Navigation.switchPolicyID(newPolicyID);
}

export default switchPolicyAfterInteractions;
