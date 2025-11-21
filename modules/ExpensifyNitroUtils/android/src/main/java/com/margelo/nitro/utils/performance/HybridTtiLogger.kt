package com.margelo.nitro.utils

import android.os.Build
import android.view.View
import androidx.annotation.RequiresApi
import com.facebook.react.uimanager.ThemedReactContext
import com.margelo.nitro.utils.HybridTtiMeasurementViewSpec
import com.margelo.nitro.utils.TtiMeasurementValue
import com.margelo.nitro.utils.performance.FirstDrawDoneListener

internal typealias OnMeasurementsReadyListener = (measurement: TtiMeasurementValue) -> Unit

class HybridTtiLogger(val context: ThemedReactContext) : HybridTtiLoggerSpec() {
    var measurementListener: OnMeasurementsReadyListener? = null

    companion object {
        var applicationStartupTimestamp: Double? = null
        var bundleExecutionTimestamp: Double? = null
        var firstDrawTimestamp: Double? = null
    }
    override fun mark(name: TtiMeasurementName, timestamp: Double): Unit {
        when (name) {
            TtiMeasurementName.APPLICATIONSTARTUP -> applicationStartupTimestamp = timestamp
            TtiMeasurementName.BUNDLEEXECUTION -> bundleExecutionTimestamp = timestamp
            TtiMeasurementName.FIRSTDRAW -> firstDrawTimestamp = timestamp
        }

        if (applicationStartupTimestamp == null || firstDrawTimestamp == null) {
            return
        }

        measurementListener?.invoke(TtiMeasurementValue(
            applicationStartup = applicationStartupTimestamp!!,
            firstDraw= firstDrawTimestamp!!,
            bundleExecution = bundleExecutionTimestamp ?: 0.0
        ))
    }

    override fun setOnMeasurementsReadyListener(listener: ((measurement: TtiMeasurementValue) -> Unit)?) {
       measurementListener = listener
    }
}
