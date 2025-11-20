package com.margelo.nitro.utils

import android.os.Build
import android.view.View
import androidx.annotation.RequiresApi
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

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN)
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
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                registerDrawListener()
            }
        }
}
