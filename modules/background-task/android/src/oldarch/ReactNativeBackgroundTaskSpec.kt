package com.expensify.reactnativebackgroundtask

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.Callback

abstract class ReactNativeBackgroundTaskSpec internal constructor(context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {

  abstract fun defineTask(taskName: String, taskExecutor: Callback, promise: Promise)
  abstract fun startReceiptUpload(options: ReadableMap, promise: Promise)
}
