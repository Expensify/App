{
  "targets": [{
    "target_name": "secure_store_addon",
    "conditions": [
      ['OS=="mac"', {
        "sources": [
          "src/secure_store_addon.mm",
          "src/SecureStoreBridge.m"
        ],
        "include_dirs": [
          "<!@(node -p \"require('node-addon-api').include\")",
          "include",
          "<(module_root_dir)/build_swift"
        ],
        "dependencies": [
          "<!(node -p \"require('node-addon-api').gyp\")"
        ],
        "libraries": [
          "<(module_root_dir)/build_swift/libSecureStore.dylib"
        ],
        "cflags!": [ "-fno-exceptions" ],
        "cflags_cc!": [ "-fno-exceptions" ],
        "xcode_settings": {
          "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
          "CLANG_ENABLE_OBJC_ARC": "YES",
          "MACOSX_DEPLOYMENT_TARGET": "11.0",
          "OTHER_LDFLAGS": [
            "-Wl,-rpath,@loader_path",
            "-Wl,-rpath,@loader_path/../Frameworks",
            "-Wl,-rpath,@loader_path/../Frameworks/Electron\\ Framework.framework/Versions/A/Libraries",
            "-Wl,-rpath,/usr/lib/swift",
            "-framework", "Foundation",
            "-framework", "Security",
            "-framework", "LocalAuthentication"
          ],
          "HEADER_SEARCH_PATHS": [
            "$(SRCROOT)/include",
            "$(SRCROOT)/build_swift"
          ]
        },
        "actions": [
          {
            "action_name": "build_swift_dylib",
            "inputs": [
              "src/SecureStore.swift",
              "src/SecureStoreOptions.swift",
              "src/SecureStoreAccessible.swift",
              "src/SecureStoreExceptions.swift"
            ],
            "outputs": [
              "build_swift/libSecureStore.dylib",
              "build_swift/secure_store_addon-Swift.h"
            ],
            "action": [
              "swiftc",
              "src/SecureStore.swift",
              "src/SecureStoreOptions.swift",
              "src/SecureStoreAccessible.swift",
              "src/SecureStoreExceptions.swift",
              "-emit-objc-header-path", "build_swift/secure_store_addon-Swift.h",
              "-emit-library",
              "-Xlinker", "-install_name",
              "-Xlinker", "@rpath/libSecureStore.dylib",
              "-o", "build_swift/libSecureStore.dylib",
              "-import-objc-header", "include/SecureStoreBridge.h"
            ]
          }
        ]
      }]
    ]
  }]
}
