package com.margelo.nitro.utils

import android.view.View
import com.facebook.react.uimanager.ThemedReactContext
import com.margelo.nitro.utils.HybridTtiMeasurementViewSpec
import com.margelo.nitro.utils.TtiMeasurementValue
import com.margelo.nitro.utils.performance.FirstDrawDoneListener

internal typealias OnMeasurementListener = (measurement: TtiMeasurementValue) -> Unit

val programStartTimestamp = System.currentTimeMillis().toDouble()

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

            val onDrawTimestamp = System.currentTimeMillis().toDouble()
            val measurement = TtiMeasurementValue(
                startup = programStartTimestamp,
                firstDraw = onDrawTimestamp
            )

            measurementListener?.invoke(measurement)
        }
    }

    override var onMeasurement: OnMeasurementListener?
        get() {
            return measurementListener
        }
        set(listener) {
            measurementListener = listener
            registerDrawListener()
        }
}
