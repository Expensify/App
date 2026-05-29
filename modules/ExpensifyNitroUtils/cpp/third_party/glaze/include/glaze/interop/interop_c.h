// Glaze Library
// For the license information refer to glaze.hpp

#ifndef GLAZE_INTEROP_C_H
#define GLAZE_INTEROP_C_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

// Error code type (actual enum defined in interop.hpp for C++ or here for pure C)
#ifndef __cplusplus
// Only define for pure C compilation
typedef enum {
   GLZ_ERROR_NONE = 0,
   GLZ_ERROR_TYPE_NOT_REGISTERED = 1,
   GLZ_ERROR_INSTANCE_ALREADY_EXISTS = 2,
   GLZ_ERROR_INSTANCE_NOT_FOUND = 3,
   GLZ_ERROR_INVALID_PARAMETER = 4,
   GLZ_ERROR_ALLOCATION_FAILED = 5,
   GLZ_ERROR_TYPE_MISMATCH = 6,
   GLZ_ERROR_MEMBER_NOT_FOUND = 7,
   GLZ_ERROR_INTERNAL = 99
} glz_error_code;
#else
// For C++, use the definition from interop.hpp
typedef enum glz_error_code glz_error_code;
#endif

// GLZ_API definition for C
#ifndef GLZ_API
#ifdef _WIN32
#ifdef GLZ_EXPORTS
#define GLZ_API __declspec(dllexport)
#else
#define GLZ_API __declspec(dllimport)
#endif
#else
#define GLZ_API __attribute__((visibility("default")))
#endif
#endif

// Forward declarations for opaque types
typedef struct glz_type_info glz_type_info;
typedef struct glz_member_info glz_member_info;

// Type info structure (must match C++ version)
struct glz_type_info
{
   const char* name;
   size_t size;
   size_t member_count;
   const glz_member_info* members;
};

// Member info structure (must match C++ version)
struct glz_member_info
{
   const char* name;
   void* type; // Type descriptor (opaque)
   void* (*getter)(void*);
   void (*setter)(void*, void*);
   uint8_t kind;
   void* function_ptr;
};

// Core C FFI functions
GLZ_API glz_type_info* glz_get_type_info(const char* type_name);
GLZ_API void* glz_create_instance(const char* type_name);
GLZ_API void glz_destroy_instance(const char* type_name, void* instance);

// Error handling functions
GLZ_API glz_error_code glz_get_last_error(void);
GLZ_API const char* glz_get_last_error_message(void);
GLZ_API void glz_clear_error(void);

// Instance registration
GLZ_API bool glz_register_instance(const char* instance_name, const char* type_name, void* instance);

// Pure C FFI functions for dynamic type registration
GLZ_API bool glz_register_type_dynamic(const char* name, size_t size, size_t alignment, void* (*constructor)(void),
                                       void (*destructor)(void*));

GLZ_API bool glz_register_member_data(const char* type_name, const char* member_name, void* (*getter)(void*),
                                      void (*setter)(void*, void*));

#ifdef __cplusplus
}
#endif

#endif // GLAZE_INTEROP_C_H