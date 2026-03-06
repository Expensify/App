import WidgetKit
import SwiftUI

private extension Color {
    static let expensifyGreen = Color(red: 3 / 255, green: 212 / 255, blue: 124 / 255)
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
            VStack {
                HStack(alignment: .bottom) {
                    VStack(alignment: .leading, spacing: 14) {
                        Image("wordmark")
                            .resizable()
                            .scaledToFit()
                            .frame(maxWidth: 64)
                        Text(context.attributes.subtitle)
                            .font(.custom("ExpensifyNeue-Regular", size: 15))
                            .foregroundColor(.white)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: -4) {
                        Text(distanceString(distance: context.state.distance))
                            .font(.custom("ExpensifyNeue-Bold", size: 45))
                            .foregroundColor(.expensifyGreen)
                        Text(context.attributes.distanceUnitLong)
                            .font(.custom("ExpensifyNeue-Regular", size: 15))
                            .foregroundColor(.white)
                    }
                }
            }
            .padding(.top, 22)
            .padding(.bottom, 28)
            .padding(.horizontal, 24)
            .background {
                LinearGradient(
                    stops: [
                        .init(color: Color(.sRGB, red: 0, green: 46 / 255, blue: 34 / 255), location: 0),
                        .init(color: Color(.sRGB, red: 6 / 255, green: 27 / 255, blue: 9 / 255), location: 1),
                    ],
                    startPoint: UnitPoint(x: 0, y: 0.41),
                    endPoint: UnitPoint(x: 1, y: 0.59)
                )
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
                        Text(context.attributes.subtitle)
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
                        Text(context.attributes.distanceUnitLong)
                            .font(.custom("ExpensifyNeue-Regular", size: 15))
                            .foregroundColor(.white)
                    }
                    .frame(minHeight: 70, maxHeight: .infinity, alignment: .bottom)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.attributes.buttonText)
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
                Text(distanceStringShort(distance: context.state.distance, distanceUnit: context.attributes.distanceUnit))
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
