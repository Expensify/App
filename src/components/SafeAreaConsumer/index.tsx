import type {SafeAreaUtils} from '@hooks/useSafeAreaUtils';
import useSafeAreaUtils from '@hooks/useSafeAreaUtils';

type SafeAreaConsumerProps = {
    children: React.FC<SafeAreaUtils>;
};

/**
 * This component is a light wrapper around the SafeAreaInsetsContext.Consumer. There are several places where we
 * may need not just the insets, but the computed styles so we save a few lines of code with this.
 */
function SafeAreaConsumer({children}: SafeAreaConsumerProps) {
    const safeAreaUtils = useSafeAreaUtils();

    return children(safeAreaUtils);
}

SafeAreaConsumer.displayName = 'SafeAreaConsumer';

export default SafeAreaConsumer;
