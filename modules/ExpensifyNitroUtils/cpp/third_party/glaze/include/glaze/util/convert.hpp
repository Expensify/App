// Glaze Library
// For the license information refer to glaze.hpp

#pragma once

#include <cstdint>

namespace glz
{
   consteval uint16_t to_uint16_t(const char chars[2]) { return uint16_t(chars[0]) | (uint16_t(chars[1]) << 8); }
}
