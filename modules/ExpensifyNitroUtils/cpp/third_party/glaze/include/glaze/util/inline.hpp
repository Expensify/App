// Glaze Library
// For the license information refer to glaze.hpp

#pragma once

#if defined(__clang__) || defined(__GNUC__) || defined(_MSC_VER)
#ifndef GLZ_USE_ALWAYS_INLINE
#define GLZ_USE_ALWAYS_INLINE
#endif
#endif

#if defined(GLZ_USE_ALWAYS_INLINE) && defined(NDEBUG)
#ifndef GLZ_ALWAYS_INLINE
#if defined(_MSC_VER) && !defined(__clang__)
#define GLZ_ALWAYS_INLINE [[msvc::forceinline]] inline
#else
#define GLZ_ALWAYS_INLINE inline __attribute__((always_inline))
#endif
#endif
#endif

#ifndef GLZ_ALWAYS_INLINE
#define GLZ_ALWAYS_INLINE inline
#endif

// IMPORTANT: GLZ_FLATTEN should only be used with extreme care
// It often adds to the binary size and greatly increases compilation times.
// It should only be applied in very specific circumstances.
// It is best to more often rely on the compiler.

#if (defined(__clang__) || defined(__GNUC__)) && defined(NDEBUG)
#ifndef GLZ_FLATTEN
#define GLZ_FLATTEN inline __attribute__((flatten))
#endif
#endif

#ifndef GLZ_FLATTEN
#define GLZ_FLATTEN inline
#endif

#ifndef GLZ_NO_INLINE
#if defined(__clang__) || defined(__GNUC__)
#define GLZ_NO_INLINE __attribute__((noinline))
#elif defined(_MSC_VER)
#define GLZ_NO_INLINE __declspec((noinline))
#endif
#endif
