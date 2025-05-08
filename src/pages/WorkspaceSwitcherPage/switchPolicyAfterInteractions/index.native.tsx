import {InteractionManager} from 'react-native';
import Navigation from '@libs/Navigation/Navigation';

function switchPolicyAfterInteractions(newPolicyID: string | undefined) {
    InteractionManager.runAfterInteractions(() => {
        Navigation.switchPolicyID(newPolicyID);
    });
}

export default switchPolicyAfterInteractions;
