import {PanResponder} from 'react-native';

const responder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
});

export default responder;
