// Glaze Library
// For the license information refer to glaze.hpp

#pragma once

#include <algorithm>
#include <array>
#include <cstddef>
#include <variant>

#include "glaze/util/type_traits.hpp"

namespace glz
{
   template <class T>
   concept is_variant = is_specialization_v<T, std::variant>;

   template <is_variant T>
   GLZ_ALWAYS_INLINE constexpr auto runtime_variant_map()
   {
      constexpr auto N = std::variant_size_v<T>;
      return [&]<size_t... I>(std::index_sequence<I...>) {
         return std::array<T, N>{std::variant_alternative_t<I, T>{}...};
      }(std::make_index_sequence<N>{});
   }
}
