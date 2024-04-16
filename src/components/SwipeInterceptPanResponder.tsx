import {PanResponder} from 'react-native';

const SwipeInterceptPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
});

export default SwipeInterceptPanResponder;
