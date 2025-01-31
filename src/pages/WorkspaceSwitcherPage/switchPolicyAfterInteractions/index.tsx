import Navigation from '@libs/Navigation/Navigation';

function switchPolicyAfterInteractions(newPolicyID: string | undefined, setActiveWorkspaceID: () => void) {
    setActiveWorkspaceID();
    Navigation.navigateWithSwitchPolicyID({policyID: newPolicyID});
}

export default switchPolicyAfterInteractions;
