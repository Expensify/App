import NitroModules
import Foundation

final class HybridAppStartTimeModule: HybridAppStartTimeModuleSpec {
    private static let appStartTimePreferencesKey = "AppStartTime"
    private static let appStartupMarkersPreferencesKey = "AppStartupMarkers"

    public var memorySize: Int { MemoryLayout<HybridAppStartTimeModule>.size }

    func recordAppStartTime() {
        UserDefaults.standard.set(Date().timeIntervalSince1970 * 1000, forKey: Self.appStartTimePreferencesKey)
    }

    var appStartTime: Double {
        return UserDefaults.standard.double(forKey: Self.appStartTimePreferencesKey)
    }

    var appStartupMarkers: Dictionary<String, Double> {
        guard let markers = UserDefaults.standard.dictionary(forKey: Self.appStartupMarkersPreferencesKey) else {
            return [:]
        }
        return markers.compactMapValues { ($0 as? NSNumber)?.doubleValue }
    }
}
