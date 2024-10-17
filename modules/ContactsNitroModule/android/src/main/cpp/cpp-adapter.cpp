#include <jni.h>
#include "ContactsModuleOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::contacts::initialize(vm);
}
