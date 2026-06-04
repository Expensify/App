import WidgetKit
import SwiftUI

@main
struct GpsTripWidgetBundle: WidgetBundle {
    var body: some Widget {
        if #available(iOS 16.1, *) {
            GpsTripLiveActivity()
        }
    }
}
