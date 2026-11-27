import type {HybridObject} from 'react-native-nitro-modules';

// Nitrogen needs the union spelled out as a type, so the constants are derived from it rather than the other way round.
type VerticalBarEdge = 'unspecified' | 'leading' | 'trailing';

const VERTICAL_BAR_EDGE: Record<Uppercase<VerticalBarEdge>, VerticalBarEdge> = {
    UNSPECIFIED: 'unspecified',
    LEADING: 'leading',
    TRAILING: 'trailing',
};

/** Where UIKit lays out a bar along the top edge of the window, in points. */
type TopBarRegion = {
    /** From the top of the window to the top of the bar. */
    top: number;

    /** The height of the region for a standard navigation bar, which UIKit centers the bar's content in. */
    height: number;

    /** The room the bar leaves at its leading side, past what the screen's rounded corner already takes. */
    left: number;

    /** The room the bar leaves at its trailing side, past what the screen's rounded corner already takes. */
    right: number;
};

/**
 * Where UIKit lays out the bars of the app's window on a foldable iPhone. Folded, or open in landscape, the status bar,
 * the tab bar and the navigation bar items go into the vertical bar, a column along a side edge. Open in portrait, the
 * status bar takes only the top-right corner of a tall top inset, and bars along the top edge sit in the rest of it.
 * UIKit reports both from iOS 27.1. Everywhere else, including Android, there is no vertical bar edge and no top bar region.
 */
interface WindowBarsModule extends HybridObject<{ios: 'swift'; android: 'kotlin'}> {
    /** The side edge of the vertical bar, from the window's `UITraitCollection.verticalBarEdge`. */
    readonly verticalBarEdge: VerticalBarEdge;

    /** The region UIKit gives a bar along the top edge (`UIView.LayoutRegion.bar(onEdge: .top)`), only when it starts inside the top safe area inset. */
    readonly topBarRegion?: TopBarRegion;

    /** Calls back whenever either of them changes, as they do when the phone folds or rotates. Returns the function that stops the calls. */
    addChangeListener(onChange: () => void): () => void;
}

export {VERTICAL_BAR_EDGE};
export type {TopBarRegion, VerticalBarEdge, WindowBarsModule};
