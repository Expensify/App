project(ExpensifyNitroUtils)
cmake_minimum_required(VERSION 3.9.0)

set(PACKAGE_NAME ExpensifyNitroUtils)
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)

# Define C++ library and add all sources
add_library(${PACKAGE_NAME} SHARED
    src/main/cpp/cpp-adapter.cpp
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