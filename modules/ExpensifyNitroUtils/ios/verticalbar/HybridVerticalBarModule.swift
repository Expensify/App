import Foundation
import NitroModules
import UIKit

/// Reports which edge UIKit lays the vertical bar out on, read from the app window's trait collection, and follows the
/// trait through folds and rotations. Before iOS 27.1 there is no vertical bar, so the edge stays unspecified.
final class HybridVerticalBarModule: HybridVerticalBarModuleSpec {
    public var memorySize: Int { MemoryLayout<HybridVerticalBarModule>.size }

    private var currentEdge: VerticalBarEdge = .unspecified
    private var listeners: [UUID: (VerticalBarEdge) -> Void] = [:]
    private var isObserving = false

    var edge: VerticalBarEdge {
        // Never hop to the main thread synchronously from here: the main thread may be waiting on JS. The listeners get the first real value.
        if !isObserving {
            DispatchQueue.main.async { MainActor.assumeIsolated { self.startObservingIfNeeded() } }
        }
        return currentEdge
    }

    func addEdgeListener(onChange: @escaping (VerticalBarEdge) -> Void) -> () -> Void {
        let id = UUID()
        DispatchQueue.main.async {
            // Registered before observing starts, so it hears the first value read from the window.
            self.listeners[id] = onChange
            MainActor.assumeIsolated { self.startObservingIfNeeded() }
        }
        return { [weak self] in
            DispatchQueue.main.async { self?.listeners.removeValue(forKey: id) }
        }
    }

    @MainActor
    private func startObservingIfNeeded() {
        guard !isObserving else {
            return
        }
        guard #available(iOS 27.1, *) else {
            isObserving = true
            return
        }
        // The window appears after the app's hybrid objects are created, so a read before then tries again on the next one.
        guard let window = Self.keyWindow else {
            return
        }
        isObserving = true
        // The edge reads unspecified until the window exists, so a JS read from before then is corrected through the listeners.
        updateEdge(Self.edge(of: window))
        // The window keeps the registration alive for as long as it exists, which is as long as the app does.
        _ = window.registerForTraitChanges(UITraitCollection.systemTraitsAffectingVerticalBarEdge) { [weak self] (window: UIWindow, _: UITraitCollection) in
            self?.updateEdge(Self.edge(of: window))
        }
    }

    @MainActor
    private func updateEdge(_ edge: VerticalBarEdge) {
        guard edge != currentEdge else {
            return
        }
        currentEdge = edge
        for listener in listeners.values {
            listener(edge)
        }
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
    private static func edge(of window: UIWindow) -> VerticalBarEdge {
        switch window.traitCollection.verticalBarEdge {
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
}
