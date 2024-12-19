import Navigation from '@libs/Navigation/Navigation';

function switchPolicyAfterInteractions(newPolicyID: string | undefined) {
    Navigation.navigateWithSwitchPolicyID({policyID: newPolicyID});
}

export default switchPolicyAfterInteractions;
