import toggleTestToolsModal from '@userActions/TestTool';

import CONST from '@src/CONST';

import {useState} from 'react';
import {PanResponder} from 'react-native';

/** Four-finger tap that opens test tools. Shared by screen wrappers and the required-2FA overlay, which sits above those screens. */
function useTestToolsTapResponder() {
    const [panHandlers] = useState(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponderCapture: (_event, gestureState) => gestureState.numberActiveTouches === CONST.TEST_TOOL.NUMBER_OF_TAPS,
                onPanResponderRelease: toggleTestToolsModal,
            }).panHandlers,
    );

    return panHandlers;
}

export default useTestToolsTapResponder;
