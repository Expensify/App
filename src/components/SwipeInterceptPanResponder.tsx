import {PanResponder} from 'react-native';

const SwipeInterceptPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
});

export default SwipeInterceptPanResponder;
