import {PanResponder} from 'react-native';

const SwipeInterceptPanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
});

export default SwipeInterceptPanResponder;
