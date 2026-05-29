// Glaze Library
// For the license information refer to glaze.hpp

#pragma once

#include <algorithm>
#include <any>
#include <charconv>

#include "glaze/core/seek.hpp"
#include "glaze/json/read.hpp"
#include "glaze/json/skip.hpp"
#include "glaze/util/parse.hpp"
#include "glaze/util/string_literal.hpp"

namespace glz
{
   [[nodiscard]] inline constexpr bool maybe_numeric_key(const sv key)
   {
      return key.find_first_not_of("0123456789") == std::string_view::npos;
   }

   template <string_literal JsonPointer, auto Opts = opts{}>
   [[nodiscard]] inline auto get_view_json(contiguous auto&& buffer)
   {
      static constexpr auto S = chars<JsonPointer>;
      static constexpr auto tokens = split_json_ptr<S>();
      static constexpr auto N = tokens.size();

      context ctx{};
      auto p = read_iterators<Opts>(buffer);

      auto it = p.first;
      auto end = p.second;

      // Don't automatically const qualify the buffer so we can write to the view,
      // which allows us to write to a JSON Pointer location
      using span_t =
         std::span<std::conditional_t<std::is_const_v<std::remove_pointer_t<decltype(it)>>, const char, char>>;
      using result_t = expected<span_t, error_ctx>;

      auto start = it;

      if (buffer.empty()) [[unlikely]] {
         ctx.error = error_code::no_read_input;
      }

      if (bool(ctx.error)) [[unlikely]] {
         return result_t{unexpected(error_ctx{ctx.error})};
      }

      if constexpr (N == 0) {
         return result_t{span_t{it, end}};
      }
      else {
         using namespace glz::detail;

         skip_ws<Opts>(ctx, it, end);

         result_t ret;

         for_each<N>([&]<size_t I>() {
            if (bool(ctx.error)) [[unlikely]] {
               return;
            }

            static constexpr auto key = tokens[I];
            if constexpr (maybe_numeric_key(key)) {
               switch (*it) {
               case '{': {
                  ++it;
                  while (true) {
                     if (skip_ws<Opts>(ctx, it, end)) {
                        return;
                     }
                     if (match<'"'>(ctx, it)) {
                        return;
                     }

                     auto* start = it;
                     skip_string_view<Opts>(ctx, it, end);
                     if (bool(ctx.error)) [[unlikely]]
                        return;
                     const sv k = {start, size_t(it - start)};
                     ++it;

                     if (key.size() == k.size() && comparitor<key>(k.data())) {
                        if (skip_ws<Opts>(ctx, it, end)) {
                           return;
                        }
                        if (match_invalid_end<':', Opts>(ctx, it, end)) {
                           return;
                        }
                        if (skip_ws<Opts>(ctx, it, end)) {
                           return;
                        }

                        if constexpr (I == (N - 1)) {
                           ret = parse_value<Opts>(ctx, it, end);
                        }
                        return;
                     }
                     else {
                        skip_value<JSON>::op<Opts>(ctx, it, end);
                        if (bool(ctx.error)) [[unlikely]] {
                           return;
                        }
                        if (*it != ',') {
                           ctx.error = error_code::key_not_found;
                           return;
                        }
                        ++it;
                     }
                  }
               }
               case '[': {
                  ++it;
                  // Could optimize by counting commas
                  static constexpr auto n = stoui(key);
                  if constexpr (n) {
                     for_each<n.value()>([&]<size_t>() {
                        skip_value<JSON>::op<Opts>(ctx, it, end);
                        if (bool(ctx.error)) [[unlikely]] {
                           return;
                        }
                        if (*it != ',') {
                           ctx.error = error_code::array_element_not_found;
                           return;
                        }
                        ++it;
                     });

                     if (skip_ws<Opts>(ctx, it, end)) {
                        return;
                     }

                     if constexpr (I == (N - 1)) {
                        ret = parse_value<Opts>(ctx, it, end);
                     }
                     return;
                  }
                  else {
                     ctx.error = error_code::array_element_not_found;
                     return;
                  }
               }
               }
            }
            else {
               if (match_invalid_end<'{', Opts>(ctx, it, end)) {
                  return;
               }

               while (it < end) {
                  if (skip_ws<Opts>(ctx, it, end)) {
                     return;
                  }
                  if (match<'"'>(ctx, it)) {
                     return;
                  }

                  auto* start = it;
                  skip_string_view<Opts>(ctx, it, end);
                  if (bool(ctx.error)) [[unlikely]]
                     return;
                  const sv k = {start, size_t(it - start)};
                  ++it;

                  if (key.size() == k.size() && comparitor<key>(k.data())) {
                     if (skip_ws<Opts>(ctx, it, end)) {
                        return;
                     }
                     if (match_invalid_end<':', Opts>(ctx, it, end)) {
                        return;
                     }
                     if (skip_ws<Opts>(ctx, it, end)) {
                        return;
                     }

                     if constexpr (I == (N - 1)) {
                        ret = parse_value<Opts>(ctx, it, end);
                     }
                     return;
                  }
                  else {
                     skip_value<JSON>::op<Opts>(ctx, it, end);
                     if (bool(ctx.error)) [[unlikely]] {
                        return;
                     }
                     if (*it != ',') {
                        ctx.error = error_code::key_not_found;
                        return;
                     }
                     ++it;
                  }
               }
            }
         });

         if (bool(ctx.error)) [[unlikely]] {
            return result_t{unexpected(error_ctx{ctx.error, "", size_t(it - start)})};
         }

         return ret;
      }
   }

   template <class T, string_literal Str, auto Opts = opts{}>
   [[nodiscard]] inline expected<T, error_ctx> get_as_json(contiguous auto&& buffer)
   {
      const auto str = glz::get_view_json<Str>(buffer);
      if (str) {
         return glz::read_json<T>(*str);
      }
      return unexpected(str.error());
   }

   template <string_literal Str, auto Opts = opts{}>
   [[nodiscard]] inline expected<sv, error_ctx> get_sv_json(contiguous auto&& buffer)
   {
      const auto s = glz::get_view_json<Str>(buffer);
      if (s) {
         return sv{reinterpret_cast<const char*>(s->data()), s->size()};
      }
      return unexpected(s.error());
   }

   // Write raw text to a JSON value denoted by a JSON Pointer
   template <string_literal Path, auto Opts = opts{}>
   [[nodiscard]] inline error_ctx write_at(const std::string_view value, contiguous auto&& buffer)
   {
      auto view = glz::get_view_json<Path, Opts>(buffer);
      if (view) {
         // erase the current value
         const size_t location = size_t(view->data() - buffer.data());
         buffer.erase(location, view->size());
         // insert the new value
         buffer.insert(location, value);
         return {};
      }
      else {
         return view.error();
      }
   }
}
