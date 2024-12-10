package com.expensify.reactnativebackgroundtask

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Callback

class ReactNativeBackgroundTaskModule internal constructor(context: ReactApplicationContext) :
  ReactNativeBackgroundTaskSpec(context) {

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  override fun defineTask(taskName: String, taskExecutor: Callback, promise: Promise) {
    promise.resolve(taskName);
    emitOnBackgroundTaskExecution(taskName);
  }

  companion object {
    const val NAME = "ReactNativeBackgroundTask"
  }
}
