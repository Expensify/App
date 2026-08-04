project(ExpensifyNitroUtils)
cmake_minimum_required(VERSION 3.9.0)

set(PACKAGE_NAME ExpensifyNitroUtils)
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)

if(EXPENSIFY_PGO_MODE STREQUAL "generate")
    execute_process(
        COMMAND ${CMAKE_CXX_COMPILER} --print-resource-dir
        OUTPUT_VARIABLE CLANG_RESOURCE_DIR
        OUTPUT_STRIP_TRAILING_WHITESPACE
    )
    set(PGO_RUNTIME "${CLANG_RESOURCE_DIR}/lib/linux/libclang_rt.profile-aarch64-android.a")
    if(NOT EXISTS "${PGO_RUNTIME}")
        message(FATAL_ERROR "LLVM profiling runtime was not found at ${PGO_RUNTIME}")
    endif()
    add_compile_options(-fprofile-generate)
    add_link_options(
        -fprofile-generate
        "-Wl,--whole-archive,${PGO_RUNTIME},--no-whole-archive"
        -Wl,--export-dynamic-symbol=__llvm_profile_set_filename
        -Wl,--export-dynamic-symbol=__llvm_profile_write_file
    )
elseif(EXPENSIFY_PGO_MODE STREQUAL "use")
    add_compile_options("-fprofile-use=${EXPENSIFY_PGO_PROFILE}")
    add_link_options("-fprofile-use=${EXPENSIFY_PGO_PROFILE}")
endif()

# Define C++ library and add all sources
add_library(${PACKAGE_NAME} SHARED
    src/main/cpp/cpp-adapter.cpp
    src/main/cpp/PgoProfileWriter.cpp
)

# Add Nitrogen specs
include(${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/ExpensifyNitroUtils+autolinking.cmake)

# Set up local includes
include_directories(
    "src/main/cpp"
    "../cpp"
)

find_library(LOG_LIB log)

# 🔧 Ensure 16KB ELF page alignment
set(CMAKE_SHARED_LINKER_FLAGS "${CMAKE_SHARED_LINKER_FLAGS} -Wl,-z,max-page-size=16384")

# Link all libraries together
target_link_libraries(
    ${PACKAGE_NAME}
    ${LOG_LIB}
    android
)
