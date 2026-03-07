import ActivityKit

struct GpsTripAttributes: ActivityAttributes {
    var deepLink: String
    var buttonText: String
    var subtitle: String
    var distanceUnit: String
    var distanceUnitLong: String

    public struct ContentState: Codable, Hashable {
        var distance: Double
    }
}
