#include <jni.h>
#include "ContactsNitroModuleOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::contacts::initialize(vm);
}
