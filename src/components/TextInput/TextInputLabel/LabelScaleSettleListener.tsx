import {ACTIVE_LABEL_SCALE, INACTIVE_LABEL_SCALE} from '@components/TextInput/styleConst';

import type {SharedValue} from 'react-native-reanimated';

import {useAnimatedReaction} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

type LabelScaleSettleListenerProps = {
    /** Scale of the input label, animated between the inactive and active sizes */
    labelScale: SharedValue<number>;

    /** Called on the JS thread once the label scale settles on either size */
    onSettle: () => void;
};

/**
 * Calls `onSettle` once the label's scale animation settles. It is a separate component so that only labels that need it
 * register the reaction, instead of every text input.
 */
function LabelScaleSettleListener({labelScale, onSettle}: LabelScaleSettleListenerProps) {
    useAnimatedReaction(
        () => labelScale.get(),
        (scale, previousScale) => {
            if (scale === previousScale || (scale !== ACTIVE_LABEL_SCALE && scale !== INACTIVE_LABEL_SCALE)) {
                return;
            }
            scheduleOnRN(onSettle);
        },
    );

    return null;
}

LabelScaleSettleListener.displayName = 'LabelScaleSettleListener';

export default LabelScaleSettleListener;
