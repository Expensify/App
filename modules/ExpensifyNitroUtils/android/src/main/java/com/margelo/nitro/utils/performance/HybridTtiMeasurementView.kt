package com.margelo.nitro.utils

import android.os.Build
import android.view.View
import androidx.annotation.RequiresApi
import com.facebook.react.uimanager.ThemedReactContext
import com.margelo.nitro.utils.performance.FirstDrawDoneListener

class HybridTtiMeasurementView(val context: ThemedReactContext) : HybridTtiMeasurementViewSpec() {
    // Props
    var firstDrawTimestamp: Long? = null
    override lateinit var ttiLogger: HybridTtiLoggerSpec

    // View
    override val view: View = View(context)

    init {
        registerDrawListener()
    }

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN)
    private fun registerDrawListener() {
        FirstDrawDoneListener.registerForNextDraw(view) {
            if (firstDrawTimestamp != null) {
                return@registerForNextDraw
            }

            val newFirstDrawTimestamp = System.currentTimeMillis()
            firstDrawTimestamp = newFirstDrawTimestamp
            ttiLogger.mark(TtiMeasurementName.FIRSTDRAW, newFirstDrawTimestamp.toDouble())
        }
    }
}
