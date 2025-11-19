package com.margelo.nitro.utils

import android.view.View
import com.facebook.react.uimanager.ThemedReactContext
import com.margelo.nitro.utils.HybridTtiMeasurementViewSpec
import com.margelo.nitro.utils.TtiMeasurementValue

internal typealias OnMeasurementListener = (measurement: TtiMeasurementValue) -> Unit

class HybridTtiMeasurementView(val context: ThemedReactContext) : HybridTtiMeasurementViewSpec() {
    // Props
    var measurementListener: OnMeasurementListener? = null
    var measurementSent = false

    // View
    override val view: View = View(context)

    private fun registerDrawListener() {
        FirstDrawDoneListener.registerForNextDraw(view) {
            if (measurementSent) {
                return@registerForNextDraw
            }
            measurementSent = true

            val timestamp = System.currentTimeMillis().toDouble()
            val measurement = TtiMeasurementValue(timestamp=timestamp)

            measurementListener?.invoke(measurement)
        }
    }

    override var onMeasurement: OnMeasurementListener
        get() = TODO("Not yet implemented")
        set(listener) {
            measurementListener = listener
            registerDrawListener()
        }
}
