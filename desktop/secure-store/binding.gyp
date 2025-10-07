{
  "targets": [{
    "target_name": "secure_store_addon",
    "conditions": [
      ['OS=="mac"', {
        "sources": [
          "src/secure_store_addon.mm",
          "src/SecureStoreBridge.m",
          "src/SecureStore.swift"
        ],
        "include_dirs": [
          "<!@(node -p \"require('node-addon-api').include\")",
          "include",
          "build_swift"
        ],
        "dependencies": [
          "<!(node -p \"require('node-addon-api').gyp\")"
        ],
        "libraries": [
          "<(PRODUCT_DIR)/libSecureStore.a"
        ],
        "cflags!": [ "-fno-exceptions" ],
        "cflags_cc!": [ "-fno-exceptions" ],
        "xcode_settings": {
          "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
          "CLANG_ENABLE_OBJC_ARC": "YES",
          "SWIFT_OBJC_BRIDGING_HEADER": "include/SecureStoreBridge.h",
          "SWIFT_VERSION": "5.0",
          "SWIFT_OBJC_INTERFACE_HEADER_NAME": "secure_store_addon-Swift.h",
          "MACOSX_DEPLOYMENT_TARGET": "11.0",
          "OTHER_CFLAGS": [
            "-ObjC++",
            "-fobjc-arc"
          ],
          "OTHER_LDFLAGS": [
            "-Wl,-rpath,@loader_path",
            "-Wl,-install_name,@rpath/libSecureStore.a"
          ],
          "HEADER_SEARCH_PATHS": [
            "$(SRCROOT)/include",
            "$(CONFIGURATION_BUILD_DIR)",
            "$(SRCROOT)/build/Release",
            "$(SRCROOT)/build_swift"
          ]
        },
        "actions": [
          {
            "action_name": "build_swift",
            "inputs": [
              "src/SecureStore.swift"
            ],
            "outputs": [
              "build_swift/libSecureStore.a",
              "build_swift/secure_store_addon-Swift.h"
            ],
            "action": [
              "swiftc",
              "src/SecureStore.swift",
              "-emit-objc-header-path", "./build_swift/secure_store_addon-Swift.h",
              "-emit-library", "-o", "./build_swift/libSecureStore.a",
              "-emit-module", "-module-name", "secure_store_addon",
              "-module-link-name", "SecureStore"
            ]
          },
          {
            "action_name": "copy_swift_lib",
            "inputs": [
              "<(module_root_dir)/build_swift/libSecureStore.a"
            ],
            "outputs": [
              "<(PRODUCT_DIR)/libSecureStore.a"
            ],
            "action": [
              "sh",
              "-c",
              "cp -f <(module_root_dir)/build_swift/libSecureStore.a <(PRODUCT_DIR)/libSecureStore.a && install_name_tool -id @rpath/libSecureStore.a <(PRODUCT_DIR)/libSecureStore.a"
            ]
          }
        ]
      }]
    ]
  }]
}
