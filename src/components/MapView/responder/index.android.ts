import {PanResponder} from 'react-native';

const responder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
});

export default responder;
