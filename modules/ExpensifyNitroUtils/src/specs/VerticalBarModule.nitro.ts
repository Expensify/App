import type {HybridObject} from 'react-native-nitro-modules';

// Nitrogen needs the union spelled out as a type, so the constants are derived from it rather than the other way round.
type VerticalBarEdge = 'unspecified' | 'leading' | 'trailing';

const VERTICAL_BAR_EDGE: Record<Uppercase<VerticalBarEdge>, VerticalBarEdge> = {
    UNSPECIFIED: 'unspecified',
    LEADING: 'leading',
    TRAILING: 'trailing',
};

/**
 * Where UIKit lays out the vertical bar, the column along a side edge that holds the status bar, the tab bar and the
 * navigation bar items on a foldable iPhone. The window reports `UITraitCollection.verticalBarEdge` from iOS 27.1, and
 * `unspecified` everywhere else, including Android.
 */
interface VerticalBarModule extends HybridObject<{ios: 'swift'; android: 'kotlin'}> {
    readonly edge: VerticalBarEdge;

    /** Calls back whenever the edge changes, as it does when the phone folds or rotates. Returns the function that stops the calls. */
    addEdgeListener(onChange: (edge: VerticalBarEdge) => void): () => void;
}

export {VERTICAL_BAR_EDGE};
export type {VerticalBarEdge, VerticalBarModule};
