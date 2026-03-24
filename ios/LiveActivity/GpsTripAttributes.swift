import ActivityKit

struct GpsTripAttributes: ActivityAttributes {
    var deepLink: String

    public struct ContentState: Codable, Hashable {
        var distance: Double
        var distanceUnit: String
        var distanceUnitLong: String
        var buttonText: String
        var subtitle: String
    }
}
