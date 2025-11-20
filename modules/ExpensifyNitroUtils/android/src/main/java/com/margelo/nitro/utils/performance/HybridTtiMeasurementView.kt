package com.margelo.nitro.utils

import android.os.Build
import android.view.View
import androidx.annotation.RequiresApi
import com.facebook.react.uimanager.ThemedReactContext
import com.margelo.nitro.utils.HybridTtiMeasurementViewSpec
import com.margelo.nitro.utils.TtiMeasurementValue
import com.margelo.nitro.utils.performance.FirstDrawDoneListener

internal typealias OnMeasurementListener = (measurement: TtiMeasurementValue) -> Unit

class HybridTtiMeasurementView(val context: ThemedReactContext) : HybridTtiMeasurementViewSpec() {
    // Props
    var measurementListener: OnMeasurementListener? = null
    var measurementSent = false

    companion object {
        var applicationStartupTimestamp: Long? = null
        var firstDrawTimestamp: Long? = null
        var bundleExectionTimestamp: Long? = null
    }

    // View
    override val view: View = View(context)

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

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN)
    private fun registerDrawListener() {
        FirstDrawDoneListener.registerForNextDraw(view) {
            if (measurementSent) {
                return@registerForNextDraw
            }
            measurementSent = true

            val measurement = TtiMeasurementValue(
                startup = applicationStartedTimestamp?.toDouble() ?: 0.0,
                firstDraw = System.currentTimeMillis().toDouble()
            )

            measurementListener?.invoke(measurement)
        }
    }
}
