// Glaze Library
// For the license information refer to glaze.hpp

#pragma once

#include "glaze/core/opts.hpp"
#include "glaze/core/reflect.hpp"
#include "glaze/core/to.hpp"
#include "glaze/core/wrappers.hpp"
#include "glaze/core/write.hpp"
#include "glaze/core/write_chars.hpp"
#include "glaze/util/dump.hpp"
#include "glaze/util/for_each.hpp"
#include "glaze/util/itoa.hpp"
#include "glaze/util/parse.hpp"

namespace glz
{
   template <>
   struct serialize<TOML>
   {
      template <auto Opts, class T, is_context Ctx, class B, class IX>
      GLZ_ALWAYS_INLINE static void op(T&& value, Ctx&& ctx, B&& b, IX&& ix)
      {
         to<TOML, std::remove_cvref_t<T>>::template op<Opts>(std::forward<T>(value), std::forward<Ctx>(ctx),
                                                             std::forward<B>(b), std::forward<IX>(ix));
      }
   };

   template <class T>
      requires(glaze_value_t<T> && !custom_write<T>)
   struct to<TOML, T>
   {
      template <auto Opts, class Value, is_context Ctx, class B, class IX>
      GLZ_ALWAYS_INLINE static void op(Value&& value, Ctx&& ctx, B&& b, IX&& ix)
      {
         using V = std::remove_cvref_t<decltype(get_member(std::declval<Value>(), meta_wrapper_v<T>))>;
         to<TOML, V>::template op<Opts>(get_member(std::forward<Value>(value), meta_wrapper_v<T>),
                                        std::forward<Ctx>(ctx), std::forward<B>(b), std::forward<IX>(ix));
      }
   };

   template <nullable_like T>
   struct to<TOML, T>
   {
      template <auto Opts>
      GLZ_ALWAYS_INLINE static void op(auto&& value, is_context auto&& ctx, auto&& b, auto&& ix)
      {
         if (value) {
            serialize<TOML>::op<Opts>(*value, ctx, b, ix);
         }
      }
   };

   template <boolean_like T>
   struct to<TOML, T>
   {
      template <auto Opts, class B>
      GLZ_ALWAYS_INLINE static void op(const bool value, is_context auto&&, B&& b, auto&& ix)
      {
         static constexpr auto checked = not check_write_unchecked(Opts);
         if constexpr (checked && vector_like<B>) {
            if (const auto n = ix + 8; n > b.size()) [[unlikely]] {
               b.resize(2 * n);
            }
         }

         if constexpr (Opts.bools_as_numbers) {
            if (value) {
               std::memcpy(&b[ix], "1", 1);
            }
            else {
               std::memcpy(&b[ix], "0", 1);
            }
            ++ix;
         }
         else {
            if (value) {
               std::memcpy(&b[ix], "true", 4);
               ix += 4;
            }
            else {
               std::memcpy(&b[ix], "false", 5);
               ix += 5;
            }
         }
      }
   };

   template <num_t T>
   struct to<TOML, T>
   {
      template <auto Opts, class B>
      GLZ_ALWAYS_INLINE static void op(auto&& value, is_context auto&& ctx, B&& b, auto&& ix)
      {
         if constexpr (Opts.quoted_num) {
            std::memcpy(&b[ix], "\"", 1);
            ++ix;
            write_chars::op<Opts>(value, ctx, b, ix);
            std::memcpy(&b[ix], "\"", 1);
            ++ix;
         }
         else {
            write_chars::op<Opts>(value, ctx, b, ix);
         }
      }
   };

   constexpr std::array<uint16_t, 256> char_escape_table = [] {
      auto combine = [](const char chars[2]) -> uint16_t { return uint16_t(chars[0]) | (uint16_t(chars[1]) << 8); };

      std::array<uint16_t, 256> t{};
      t['\b'] = combine(R"(\b)");
      t['\t'] = combine(R"(\t)");
      t['\n'] = combine(R"(\n)");
      t['\f'] = combine(R"(\f)");
      t['\r'] = combine(R"(\r)");
      t['\"'] = combine(R"(\")");
      t['\\'] = combine(R"(\\)");
      return t;
   }();

   template <class T>
      requires str_t<T> || char_t<T>
   struct to<TOML, T>
   {
      template <auto Opts, class B>
      static void op(auto&& value, is_context auto&&, B&& b, auto&& ix)
      {
         if constexpr (Opts.number) {
            dump_maybe_empty(value, b, ix);
         }
         else if constexpr (char_t<T>) {
            if constexpr (Opts.raw) {
               dump(value, b, ix);
            }
            else {
               if constexpr (resizable<B>) {
                  const auto k = ix + 8;
                  if (k > b.size()) [[unlikely]] {
                     b.resize(2 * k);
                  }
               }

               std::memcpy(&b[ix], "\"", 1);
               ++ix;
               if (const auto escaped = char_escape_table[uint8_t(value)]; escaped) {
                  std::memcpy(&b[ix], &escaped, 2);
                  ix += 2;
               }
               else if (value == '\0') {
                  // null character treated as empty string
               }
               else {
                  std::memcpy(&b[ix], &value, 1);
                  ++ix;
               }
               std::memcpy(&b[ix], "\"", 1);
               ++ix;
            }
         }
         else {
            if constexpr (Opts.raw_string) {
               const sv str = [&]() -> const sv {
                  if constexpr (!char_array_t<T> && std::is_pointer_v<std::decay_t<T>>) {
                     return value ? value : "";
                  }
                  else {
                     return value;
                  }
               }();

               if constexpr (resizable<B>) {
                  const auto n = str.size();
                  const auto k = ix + 8 + n;
                  if (k > b.size()) [[unlikely]] {
                     b.resize(2 * k);
                  }
               }

               std::memcpy(&b[ix], "\"", 1);
               ++ix;
               if (str.size()) [[likely]] {
                  const auto n = str.size();
                  std::memcpy(&b[ix], str.data(), n);
                  ix += n;
               }
               std::memcpy(&b[ix], "\"", 1);
               ++ix;
            }
            else {
               const sv str = [&]() -> const sv {
                  if constexpr (!char_array_t<T> && std::is_pointer_v<std::decay_t<T>>) {
                     return value ? value : "";
                  }
                  else if constexpr (array_char_t<T>) {
                     return *value.data() ? sv{value.data()} : "";
                  }
                  else {
                     return value;
                  }
               }();
               const auto n = str.size();
               if constexpr (resizable<B>) {
                  const auto k = ix + 10 + 2 * n;
                  if (k > b.size()) [[unlikely]] {
                     b.resize(2 * k);
                  }
               }

               if constexpr (Opts.raw) {
                  const auto n = str.size();
                  if (n) {
                     std::memcpy(&b[ix], str.data(), n);
                     ix += n;
                  }
               }
               else {
                  std::memcpy(&b[ix], "\"", 1);
                  ++ix;
                  const auto* c = str.data();
                  const auto* const e = c + n;
                  const auto start = &b[ix];
                  auto data = start;

                  if (n > 7) {
                     for (const auto end_m7 = e - 7; c < end_m7;) {
                        std::memcpy(data, c, 8);
                        uint64_t swar;
                        std::memcpy(&swar, c, 8);

                        constexpr uint64_t lo7_mask = repeat_byte8(0b01111111);
                        const uint64_t lo7 = swar & lo7_mask;
                        const uint64_t quote = (lo7 ^ repeat_byte8('"')) + lo7_mask;
                        const uint64_t backslash = (lo7 ^ repeat_byte8('\\')) + lo7_mask;
                        const uint64_t less_32 = (swar & repeat_byte8(0b01100000)) + lo7_mask;
                        uint64_t next = ~((quote & backslash & less_32) | swar);

                        next &= repeat_byte8(0b10000000);
                        if (next == 0) {
                           data += 8;
                           c += 8;
                           continue;
                        }

                        const auto length = (countr_zero(next) >> 3);
                        c += length;
                        data += length;

                        std::memcpy(data, &char_escape_table[uint8_t(*c)], 2);
                        data += 2;
                        ++c;
                     }
                  }

                  for (; c < e; ++c) {
                     if (const auto escaped = char_escape_table[uint8_t(*c)]; escaped) {
                        std::memcpy(data, &escaped, 2);
                        data += 2;
                     }
                     else {
                        std::memcpy(data, c, 1);
                        ++data;
                     }
                  }

                  ix += size_t(data - start);

                  std::memcpy(&b[ix], "\"", 1);
                  ++ix;
               }
            }
         }
      }
   };

   template <auto Opts, bool minified_check = true, class B>
      requires(Opts.format == TOML)
   GLZ_ALWAYS_INLINE void write_array_entry_separator(is_context auto&&, B&& b, auto&& ix)
   {
      if constexpr (vector_like<B>) {
         if constexpr (minified_check) {
            if (ix >= b.size()) [[unlikely]] {
               b.resize(2 * ix);
            }
         }
      }
      std::memcpy(&b[ix], ", ", 2);
      ix += 2;
   }

   template <auto Opts, bool minified_check = true, class B>
      requires(Opts.format == TOML)
   GLZ_ALWAYS_INLINE void write_object_entry_separator(is_context auto&&, B&& b, auto&& ix)
   {
      std::memcpy(&b[ix], "\n", 1);
      ++ix;
   }

   template <class T>
      requires(glaze_object_t<T> || reflectable<T>)
   struct to<TOML, T>
   {
      template <auto Options, class V, class B>
         requires(not std::is_pointer_v<std::remove_cvref_t<V>>)
      static void op(V&& value, is_context auto&& ctx, B&& b, auto&& ix)
      {
         // Do not write opening/closing braces.
         static constexpr auto N = reflect<T>::size;
         decltype(auto) t = [&]() -> decltype(auto) {
            if constexpr (reflectable<T>) {
               return to_tie(value);
            }
            else {
               return nullptr;
            }
         }();

         static constexpr auto padding = round_up_to_nearest_16(maximum_key_size<T> + write_padding_bytes);
         bool first = true;

         for_each<N>([&]<size_t I>() {
            using val_t = field_t<T, I>;

            if constexpr (always_skipped<val_t>)
               return;
            else {
               if constexpr (null_t<val_t>) {
                  if constexpr (always_null_t<val_t>)
                     return;
                  else {
                     const auto is_null = [&]() {
                        decltype(auto) element = [&]() -> decltype(auto) {
                           if constexpr (reflectable<T>) {
                              return get<I>(t);
                           }
                           else {
                              return get<I>(reflect<T>::values);
                           }
                        };

                        if constexpr (nullable_wrapper<val_t>)
                           return !bool(element()(value).val);
                        else if constexpr (nullable_value_t<val_t>)
                           return !get_member(value, element()).has_value();
                        else
                           return !bool(get_member(value, element()));
                     }();
                     if (is_null) return;
                  }
               }

               maybe_pad<padding>(b, ix);

               // --- Check if this field is a nested object ---
               if constexpr (glaze_object_t<val_t> || reflectable<val_t>) {
                  // Print the table header (e.g. "[inner]") for the nested object.
                  if (!first) {
                     std::memcpy(&b[ix], "\n", 1);
                     ++ix;
                  }
                  else {
                     first = false;
                  }
                  static constexpr auto key = glz::get<I>(reflect<T>::keys);
                  std::memcpy(&b[ix], "[", 1);
                  ++ix;
                  std::memcpy(&b[ix], key.data(), key.size());
                  ix += key.size();
                  std::memcpy(&b[ix], "]\n", 2);
                  ix += 2;

                  // Serialize the nested object.
                  if constexpr (reflectable<T>) {
                     to<TOML, val_t>::template op<Options>(get_member(value, get<I>(t)), ctx, b, ix);
                  }
                  else {
                     to<TOML, val_t>::template op<Options>(get_member(value, get<I>(reflect<T>::values)), ctx, b, ix);
                  }
                  // Add an extra newline to separate this table section from following keys.
                  std::memcpy(&b[ix], "\n", 1);
                  ++ix;
               }
               else {
                  // --- Field is not an object, so output a key/value pair ---
                  if (!first) {
                     std::memcpy(&b[ix], "\n", 1);
                     ++ix;
                  }
                  else {
                     first = false;
                  }
                  static constexpr auto key = glz::get<I>(reflect<T>::keys);
                  std::memcpy(&b[ix], key.data(), key.size());
                  ix += key.size();

                  std::memcpy(&b[ix], " = ", 3);
                  ix += 3;

                  if constexpr (reflectable<T>) {
                     to<TOML, val_t>::template op<Options>(get_member(value, get<I>(t)), ctx, b, ix);
                  }
                  else {
                     to<TOML, val_t>::template op<Options>(get_member(value, get<I>(reflect<T>::values)), ctx, b, ix);
                  }
               }
            }
         });
      }
   };

   template <class T>
      requires(writable_array_t<T> || writable_map_t<T>)
   struct to<TOML, T>
   {
      static constexpr bool map_like_array = writable_array_t<T> && pair_t<range_value_t<T>>;

      // --- Array-like container writer ---
      template <auto Opts, class B>
         requires(writable_array_t<T> && (map_like_array ? check_concatenate(Opts) == false : true))
      GLZ_ALWAYS_INLINE static void op(auto&& value, is_context auto&& ctx, B&& b, auto&& ix)
      {
         if (empty_range(value)) {
            dump<"[]">(b, ix);
         }
         else {
            if constexpr (has_size<T>) {
               const auto n = value.size();
               if constexpr (vector_like<B>) {
                  // Use 2 bytes per separator (", ")
                  static constexpr auto comma_padding = 2;
                  if (const auto k = ix + n * comma_padding + write_padding_bytes; k > b.size()) [[unlikely]] {
                     b.resize(2 * k);
                  }
               }
               std::memcpy(&b[ix], "[", 1);
               ++ix;
               auto it = std::begin(value);
               using val_t = std::remove_cvref_t<decltype(*it)>;
               to<TOML, val_t>::template op<Opts>(*it, ctx, b, ix);
               ++it;
               for (const auto fin = std::end(value); it != fin; ++it) {
                  write_array_entry_separator<Opts>(ctx, b, ix);
                  to<TOML, val_t>::template op<Opts>(*it, ctx, b, ix);
               }
               std::memcpy(&b[ix], "]", 1);
               ++ix;
            }
            else {
               if constexpr (vector_like<B>) {
                  if (const auto k = ix + write_padding_bytes; k > b.size()) [[unlikely]] {
                     b.resize(2 * k);
                  }
               }
               std::memcpy(&b[ix], "[", 1);
               ++ix;
               auto it = std::begin(value);
               using val_t = std::remove_cvref_t<decltype(*it)>;
               to<TOML, val_t>::template op<Opts>(*it, ctx, b, ix);
               ++it;
               for (const auto fin = std::end(value); it != fin; ++it) {
                  write_array_entry_separator<Opts>(ctx, b, ix);
                  to<TOML, val_t>::template op<Opts>(*it, ctx, b, ix);
               }
               dump<']'>(b, ix);
            }
         }
      }

      // --- Map-like container writer ---
      template <auto Opts, class B>
         requires(writable_map_t<T> || (map_like_array && check_concatenate(Opts) == true))
      static void op(auto&& value, is_context auto&& ctx, B&& b, auto&& ix)
      {
         bool first = true;
         for (auto&& [key, val] : value) {
            if (!first) {
               write_object_entry_separator<Opts>(ctx, b, ix);
            }
            else {
               first = false;
            }
            // Write the key as a bare key
            std::memcpy(&b[ix], key.data(), key.size());
            ix += key.size();
            std::memcpy(&b[ix], " = ", 3);
            ix += 3;
            to<TOML, decltype(val)>::template op<Opts>(val, ctx, b, ix);
         }
      }
   };

   // (The remainder of the code – for C arrays, tuples, includers, etc. – is unchanged.)
   template <nullable_t T>
      requires(std::is_array_v<T>)
   struct to<TOML, T>
   {
      template <auto Opts, class V, size_t N, class... Args>
      GLZ_ALWAYS_INLINE static void op(const V (&value)[N], is_context auto&& ctx, Args&&... args)
      {
         serialize<TOML>::op<Opts>(std::span{value, N}, ctx, std::forward<Args>(args)...);
      }
   };

   template <class T>
      requires glaze_array_t<T> || tuple_t<std::decay_t<T>> || is_std_tuple<T>
   struct to<TOML, T>
   {
      template <auto Opts, class... Args>
      static void op(auto&& value, is_context auto&& ctx, Args&&... args)
      {
         static constexpr auto N = []() constexpr {
            if constexpr (glaze_array_t<std::decay_t<T>>) {
               return glz::tuple_size_v<meta_t<std::decay_t<T>>>;
            }
            else {
               return glz::tuple_size_v<std::decay_t<T>>;
            }
         }();

         dump<'['>(args...);
         using V = std::decay_t<T>;
         for_each<N>([&]<size_t I>() {
            if constexpr (glaze_array_t<V>) {
               serialize<TOML>::op<Opts>(get_member(value, glz::get<I>(meta_v<T>)), ctx, args...);
            }
            else if constexpr (is_std_tuple<T>) {
               using Value = core_t<decltype(std::get<I>(value))>;
               to<TOML, Value>::template op<Opts>(std::get<I>(value), ctx, args...);
            }
            else {
               using Value = core_t<decltype(glz::get<I>(value))>;
               to<TOML, Value>::template op<Opts>(glz::get<I>(value), ctx, args...);
            }
            constexpr bool needs_comma = I < N - 1;
            if constexpr (needs_comma) {
               write_array_entry_separator<Opts>(ctx, args...);
            }
         });
         dump<']'>(args...);
      }
   };

   template <is_includer T>
   struct to<TOML, T>
   {
      template <auto Opts, class... Args>
      GLZ_ALWAYS_INLINE static void op(auto&&, is_context auto&&, Args&&... args)
      {
         dump<R"("")">(args...); // dump an empty string
      }
   };

   template <write_supported<TOML> T, output_buffer Buffer>
   [[nodiscard]] error_ctx write_toml(T&& value, Buffer&& buffer)
   {
      return write<opts{.format = TOML}>(std::forward<T>(value), std::forward<Buffer>(buffer));
   }

   template <write_supported<TOML> T, raw_buffer Buffer>
   [[nodiscard]] glz::expected<size_t, error_ctx> write_toml(T&& value, Buffer&& buffer)
   {
      return write<opts{.format = TOML}>(std::forward<T>(value), std::forward<Buffer>(buffer));
   }

   template <write_supported<TOML> T>
   [[nodiscard]] glz::expected<std::string, error_ctx> write_toml(T&& value)
   {
      return write<opts{.format = TOML}>(std::forward<T>(value));
   }

   template <auto Opts = opts{.format = TOML}, write_supported<TOML> T>
   [[nodiscard]] error_ctx write_file_toml(T&& value, const sv file_name, auto&& buffer)
   {
      const auto ec = write<set_toml<Opts>()>(std::forward<T>(value), buffer);
      if (bool(ec)) [[unlikely]] {
         return ec;
      }
      return {buffer_to_file(buffer, file_name)};
   }
}
