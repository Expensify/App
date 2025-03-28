#include <jni.h>
#include "UtilsModuleOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::utils::initialize(vm);
}
