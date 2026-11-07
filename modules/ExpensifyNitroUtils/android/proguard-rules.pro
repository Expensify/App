# ONNX Runtime's native code looks up its Java classes, fields and constructors through JNI, so R8 must not strip or rename them.
-keep class ai.onnxruntime.** { *; }
