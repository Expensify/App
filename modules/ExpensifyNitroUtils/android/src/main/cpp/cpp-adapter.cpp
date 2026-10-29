#include <jni.h>
#include "ExpensifyNitroUtilsOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::utils::initialize(vm);
}
