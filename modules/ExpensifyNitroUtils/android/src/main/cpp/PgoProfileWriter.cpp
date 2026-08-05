#include <dlfcn.h>
#include <jni.h>

#include <array>
#include <string>

namespace {
using SetFilename = void (*)(const char *);
using WriteFile = int (*)();

constexpr std::array<const char *, 4> kInstrumentedLibraries = {
    "libhermesvm.so",
    "libreactnative.so",
    "libjsi.so",
    "libExpensifyNitroUtils.so",
};

bool writeProfile(void *handle, const std::string &profilePath) {
    const auto setFilename = reinterpret_cast<SetFilename>(dlsym(handle, "expensify_llvm_profile_set_filename"));
    const auto writeFile = reinterpret_cast<WriteFile>(dlsym(handle, "expensify_llvm_profile_write_file"));
    if (setFilename == nullptr || writeFile == nullptr) {
        return false;
    }

    setFilename(profilePath.c_str());
    return writeFile() == 0;
}
} // namespace

extern "C" JNIEXPORT jint JNICALL
Java_org_me_mobiexpensifyg_PgoProfileWriter_writeProfiles(JNIEnv *env, jclass, jstring directory) {
    const char *directoryChars = env->GetStringUTFChars(directory, nullptr);
    if (directoryChars == nullptr) {
        return 0;
    }

    const std::string profilePath = std::string(directoryChars) + "/newdot-%m.profraw";
    env->ReleaseStringUTFChars(directory, directoryChars);

    jint writtenProfiles = 0;
    for (const char *library : kInstrumentedLibraries) {
        void *handle = dlopen(library, RTLD_NOW | RTLD_NOLOAD);
        if (handle == nullptr) {
            continue;
        }

        if (writeProfile(handle, profilePath)) {
            ++writtenProfiles;
        }
        dlclose(handle);
    }

    return writtenProfiles;
}
