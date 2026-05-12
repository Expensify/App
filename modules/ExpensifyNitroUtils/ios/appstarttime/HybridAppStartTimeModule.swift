import NitroModules
import Foundation

final class HybridAppStartTimeModule: HybridAppStartTimeModuleSpec {
    private static let appStartTimePreferencesKey = "AppStartTime"

    public var memorySize: Int { MemoryLayout<HybridAppStartTimeModule>.size }

    func recordAppStartTime() {
        UserDefaults.standard.set(Date().timeIntervalSince1970 * 1000, forKey: Self.appStartTimePreferencesKey)
    }

    var appStartTime: Double {
        return UserDefaults.standard.double(forKey: Self.appStartTimePreferencesKey)
    }
}
