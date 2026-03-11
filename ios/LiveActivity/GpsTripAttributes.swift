import ActivityKit

struct GpsTripAttributes: ActivityAttributes {
    var deepLink: String
    var buttonText: String
    var subtitle: String
    

    public struct ContentState: Codable, Hashable {
        var distance: Double
        var distanceUnit: String
        var distanceUnitLong: String
    }
}
