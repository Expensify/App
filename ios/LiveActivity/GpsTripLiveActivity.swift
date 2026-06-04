import WidgetKit
import SwiftUI

private extension Color {
    static let expensifyGreen = Color(red: 3 / 255, green: 212 / 255, blue: 124 / 255)
    static let distanceBadgeBg = Color(red: 8 / 255, green: 82 / 255, blue: 57 / 255)
    static let brandGreen100 = Color(red: 177 / 255, green: 242 / 255, blue: 214 / 255)
}

private func distanceString(distance: Double) -> String {
    String(format: "%.1f", distance)
}

private func distanceStringShort(distance: Double, distanceUnit: String) -> String {
    String(format: "%.0f\(distanceUnit)", distance)
}

@available(iOS 16.1, *)
struct GpsTripLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: GpsTripAttributes.self) { context in
            HStack(alignment: .center) {
                VStack(alignment: .leading) {
                    Text(context.state.lockScreenTrackingText)
                        .font(.custom("ExpensifyNeue-Regular", size: 15))
                        .foregroundColor(.brandGreen100)
                        .kerning(-0.3)
                    HStack(alignment: .bottom, spacing: 6) {
                        Text(distanceString(distance: context.state.distance))
                            .font(.custom("ExpensifyNeue-Bold", size: 45))
                            .foregroundColor(.expensifyGreen)
                        Text(context.state.distanceUnit)
                            .font(.custom("ExpensifyNeue-Regular", size: 25))
                            .foregroundColor(.brandGreen100)
                            .padding(.bottom, 5)
                    }
                }

                Spacer()

                ZStack(alignment: .topTrailing) {
                    HStack(spacing: 4) {
                        Image("location")
                        Text(context.state.lockScreenBadgeText)
                            .font(.custom("ExpensifyNeue-Bold", size: 11))
                            .foregroundColor(.brandGreen100)
                    }
                    .padding(.trailing, 10)
                    .padding(.leading, 8)
                    .frame(height: 24)
                    .background(Color.distanceBadgeBg)
                    .clipShape(Capsule())
                    .padding(.trailing, 44)
                    .offset(y: -8)

                    Image("logo")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 60, height: 60)
                        .clipShape(Circle())
                }
            }
            .frame(height: 116)
            .padding(.trailing, 28)
            .padding(.leading, 24)
            .background {
                ZStack {
                    LinearGradient(
                        stops: [
                            .init(color: Color(.sRGB, red: 0, green: 46 / 255, blue: 34 / 255), location: 0),
                            .init(color: Color(.sRGB, red: 6 / 255, green: 27 / 255, blue: 9 / 255), location: 1)
                        ],
                        startPoint: UnitPoint(x: 0, y: 0.41),
                        endPoint: UnitPoint(x: 1, y: 0.59)
                    )
                    Image("lock-screen-bg")
                        .resizable()
                        .scaledToFit()
                        .frame(maxWidth: .infinity, alignment: .trailing)
                }
            }
            .widgetURL(URL(string: "new-expensify://\(context.attributes.deepLink)"))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading, spacing: 14) {
                        Image("wordmark")
                            .resizable()
                            .scaledToFit()
                            .frame(maxWidth: 64)
                        Text(context.state.subtitle)
                            .font(.custom("ExpensifyNeue-Regular", size: 15))
                            .foregroundColor(.white)
                            .lineLimit(1)
                            .minimumScaleFactor(0.5)
                    }
                    .frame(minHeight: 70, maxHeight: .infinity, alignment: .bottom)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing, spacing: -4) {
                        Text(distanceString(distance: context.state.distance))
                            .font(.custom("ExpensifyNeue-Bold", size: 45))
                            .foregroundColor(.expensifyGreen)
                            .lineLimit(1)
                            .minimumScaleFactor(0.3)
                        Text(context.state.distanceUnitLong)
                            .font(.custom("ExpensifyNeue-Regular", size: 15))
                            .foregroundColor(.white)
                    }
                    .frame(minHeight: 70, maxHeight: .infinity, alignment: .bottom)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.state.buttonText)
                        .font(.custom("ExpensifyNeue-Bold", size: 15))
                        .foregroundColor(.expensifyGreen)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(Color.expensifyGreen.opacity(0.2))
                        .clipShape(Capsule())
                        .padding(.top, 10)
                }
            } compactLeading: {
                Image("logo")
                    .resizable()
                    .scaledToFit()
                    .frame(maxWidth: 23, maxHeight: 23)
                    .clipShape(RoundedRectangle(cornerRadius: 7))
            } compactTrailing: {
                Text(distanceStringShort(distance: context.state.distance, distanceUnit: context.state.distanceUnit))
                    .font(.custom("ExpensifyNeue-Bold", size: 15))
                    .foregroundColor(.white)
                    .minimumScaleFactor(0.5)
            } minimal: {
                Image("logo")
                    .resizable()
                    .scaledToFit()
                    .frame(maxWidth: 23, maxHeight: 23)
                    .clipShape(RoundedRectangle(cornerRadius: 7))
            }
            .widgetURL(URL(string: "new-expensify://\(context.attributes.deepLink)"))
        }
    }
}
