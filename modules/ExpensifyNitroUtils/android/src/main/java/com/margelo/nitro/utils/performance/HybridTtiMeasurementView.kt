package com.margelo.nitro.utils

import android.Manifest
import android.content.pm.PackageManager
import android.provider.ContactsContract
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise

class HybridTtiMeasurementView(val context: ThemedReactContext) : HybridTtiMeasurementViewSpec() {
  // Props
  override var onMeasurement: (measurement: TTIMeasurementValue) -> Unit {
    throw UnsupportedOperationException("Not implemented")
  }

  // View
  override val view: View = View(context)
}
