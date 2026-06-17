import type {StackNavigationOptions} from '@react-navigation/stack';
import CONST from '@src/CONST';

const RHP_WEB_TRANSITION_SPEC: StackNavigationOptions['transitionSpec'] = {
    open: {animation: 'timing', config: {duration: CONST.MODAL.ANIMATION_TIMING.RHP_DURATION_IN_WEB}},
    close: {animation: 'timing', config: {duration: CONST.MODAL.ANIMATION_TIMING.RHP_DURATION_OUT_WEB}},
};

export default RHP_WEB_TRANSITION_SPEC;
