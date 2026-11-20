import Foundation
import NitroModules
import UIKit

/// Reports where UIKit lays out the bars of the app's window on a foldable iPhone, and follows them through folds,
/// rotations and status bar changes with a probe view that fills the key window.
///
/// - The vertical bar edge: folded, or open in landscape, UIKit lays the status bar, the tab bar and the navigation bar
///   items out in a column along a side edge, named by the window's trait collection.
/// - The top bar region: open in portrait, the clock and Wi-Fi ring take only the top-right corner of a tall top inset,
///   and UIKit's own navigation bars sit in the rest of it. The safe area describes that inset as one full-width band, so
///   only the bar layout region tells where a header fits.
///
/// Before iOS 27.1 there is neither, so the edge stays unspecified and the region stays empty.
final class HybridWindowBarsModule: HybridWindowBarsModuleSpec {
    /// The height of a standard UINavigationBar. The region is asked for a bar of this height, so a header can center
    /// its row where UIKit centers the content of its own bars. The region without an extent needs the iOS 27.2 SDK,
    /// while CI builds with Xcode 27.1.
    private static let standardBarHeight: CGFloat = 44

    /// What JS reads. It is written on the main thread and read from the JS thread, so it is only touched under the lock.
    private struct State {
        var verticalBarEdge: VerticalBarEdge = .unspecified
        var topBarRegion: TopBarRegion?
        var isObserving = false
    }

    public var memorySize: Int { MemoryLayout<HybridWindowBarsModule>.size }

    private let stateLock = NSLock()
    private var state = State()

    /// Only touched on the main thread.
    private var listeners: [UUID: () -> Void] = [:]
    private weak var probe: WindowBarsProbeView?

    deinit {
        // The window keeps the probe, so a module that goes away, as on a reload, takes its probe out with it.
        let probe = self.probe
        DispatchQueue.main.async {
            MainActor.assumeIsolated { probe?.removeFromSuperview() }
        }
    }

    var verticalBarEdge: VerticalBarEdge {
        readState().verticalBarEdge
    }

    var topBarRegion: TopBarRegion? {
        readState().topBarRegion
    }

    func addChangeListener(onChange: @escaping () -> Void) -> () -> Void {
        let id = UUID()
        DispatchQueue.main.async {
            self.listeners[id] = onChange
            MainActor.assumeIsolated { self.startObservingIfNeeded() }
            // The window may have been read before this listener was added but after JS last read the values, so JS
            // reads them once more.
            onChange()
        }
        return { [weak self] in
            DispatchQueue.main.async { self?.listeners.removeValue(forKey: id) }
        }
    }

    private func withState<Result>(_ body: (inout State) -> Result) -> Result {
        stateLock.lock()
        defer { stateLock.unlock() }
        return body(&state)
    }

    private func readState() -> State {
        let current = withState { $0 }
        if !current.isObserving {
            // Never hops to the main thread synchronously from here: the main thread may be waiting on JS. The listeners
            // get the first real values.
            DispatchQueue.main.async { MainActor.assumeIsolated { self.startObservingIfNeeded() } }
        }
        return current
    }

    @MainActor
    private func startObservingIfNeeded() {
        guard !withState({ $0.isObserving }) else {
            return
        }
        guard #available(iOS 27.1, *) else {
            withState { $0.isObserving = true }
            return
        }
        // The window appears after the app's hybrid objects are created, so a read before then tries again on the next one.
        guard let window = Self.keyWindow else {
            return
        }
        withState { $0.isObserving = true }
        let probe = WindowBarsProbeView { [weak self] view in
            self?.update(from: view)
        }
        probe.frame = window.bounds
        probe.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        probe.isUserInteractionEnabled = false
        probe.accessibilityElementsHidden = true
        // Behind the app's content. The window keeps the probe until this module goes away.
        window.insertSubview(probe, at: 0)
        self.probe = probe
        // The vertical bar edge is a trait, which can change without the window's size or safe area changing.
        probe.registerForTraitChanges(UITraitCollection.systemTraitsAffectingVerticalBarEdge) { [weak self] (view: WindowBarsProbeView, _: UITraitCollection) in
            self?.update(from: view)
        }
        // Both read empty until the window exists, so a JS read from before then is corrected through the listeners.
        update(from: probe)
    }

    @MainActor
    @available(iOS 27.1, *)
    private func update(from view: UIView) {
        let verticalBarEdge = Self.verticalBarEdge(of: view)
        let topBarRegion = Self.topBarRegion(of: view)
        let hasChanged = withState { state in
            guard verticalBarEdge != state.verticalBarEdge || !Self.isSameRegion(topBarRegion, state.topBarRegion) else {
                return false
            }
            state.verticalBarEdge = verticalBarEdge
            state.topBarRegion = topBarRegion
            return true
        }
        guard hasChanged else {
            return
        }
        for listener in listeners.values {
            listener()
        }
    }

    private static func isSameRegion(_ first: TopBarRegion?, _ second: TopBarRegion?) -> Bool {
        guard let first, let second else {
            return first == nil && second == nil
        }
        return first.top == second.top && first.height == second.height && first.left == second.left && first.right == second.right
    }

    @MainActor
    private static var keyWindow: UIWindow? {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap(\.windows)
            .first(where: \.isKeyWindow)
    }

    @MainActor
    @available(iOS 27.1, *)
    private static func verticalBarEdge(of view: UIView) -> VerticalBarEdge {
        switch view.traitCollection.verticalBarEdge {
        case .leading:
            return .leading
        case .trailing:
            return .trailing
        case .unspecified:
            return .unspecified
        @unknown default:
            return .unspecified
        }
    }

    @MainActor
    @available(iOS 27.1, *)
    private static func topBarRegion(of view: UIView) -> TopBarRegion? {
        let bar = view.edgeInsets(for: .bar(onEdge: UIRectEdge.top, extent: standardBarHeight))
        // Everywhere else a top bar starts at the safe area, where the headers already sit.
        guard bar.top < view.safeAreaInsets.top else {
            return nil
        }
        let height = view.bounds.height - bar.top - bar.bottom
        guard height > 0 else {
            return nil
        }
        // The headers keep clear of the screen's rounded corners with their own padding, so only the room past the corners is reported.
        let corners = view.edgeInsets(for: .safeArea(cornerAdaptation: .horizontal))
        let left = max(0, bar.left - corners.left)
        let right = max(0, bar.right - corners.right)
        // A bar that starts above the safe area with nothing beside it to keep clear of is not one a header should move
        // into: phones whose status bar is shorter than their top inset keep their headers below it.
        guard left > 0 || right > 0 else {
            return nil
        }
        return TopBarRegion(top: Double(bar.top), height: Double(height), left: Double(left), right: Double(right))
    }
}

/// A view with no content that reports every change of its size or safe area, which is when the bar layout can change.
private final class WindowBarsProbeView: UIView {
    private let onLayoutChange: (UIView) -> Void

    init(onLayoutChange: @escaping (UIView) -> Void) {
        self.onLayoutChange = onLayoutChange
        super.init(frame: .zero)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        nil
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        onLayoutChange(self)
    }

    override func safeAreaInsetsDidChange() {
        super.safeAreaInsetsDidChange()
        onLayoutChange(self)
    }
}
