package com.expensify.reactnativebackgroundtask

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.Promise

abstract class ReactNativeBackgroundTaskSpec internal constructor(context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {

  abstract fun defineTask(taskName: String, taskExecutor: Callback, promise: Promise)
}
