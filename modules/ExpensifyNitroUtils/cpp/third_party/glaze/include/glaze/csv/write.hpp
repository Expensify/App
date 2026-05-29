// Glaze Library
// For the license information refer to glaze.hpp

#pragma once

#include "glaze/core/opts.hpp"
#include "glaze/core/write.hpp"
#include "glaze/core/write_chars.hpp"
#include "glaze/util/dump.hpp"
#include "glaze/util/for_each.hpp"

namespace glz
{
   template <>
   struct serialize<CSV>
   {
      template <auto Opts, class T, is_context Ctx, class B, class IX>
      static void op(T&& value, Ctx&& ctx, B&& b, IX&& ix)
      {
         to<CSV, std::decay_t<T>>::template op<Opts>(std::forward<T>(value), std::forward<Ctx>(ctx), std::forward<B>(b),
                                                     std::forward<IX>(ix));
      }
   };

   template <glaze_value_t T>
   struct to<CSV, T>
   {
      template <auto Opts, is_context Ctx, class B, class IX>
      static void op(auto&& value, Ctx&& ctx, B&& b, IX&& ix)
      {
         using V = decltype(get_member(std::declval<T>(), meta_wrapper_v<T>));
         to<CSV, V>::template op<Opts>(get_member(value, meta_wrapper_v<T>), std::forward<Ctx>(ctx), std::forward<B>(b),
                                       std::forward<IX>(ix));
      }
   };

   template <num_t T>
   struct to<CSV, T>
   {
      template <auto Opts, class B>
      static void op(auto&& value, is_context auto&& ctx, B&& b, auto&& ix)
      {
         write_chars::op<Opts>(value, ctx, b, ix);
      }
   };

   template <bool_t T>
   struct to<CSV, T>
   {
      template <auto Opts, class B>
      static void op(auto&& value, is_context auto&&, B&& b, auto&& ix)
      {
         if (value) {
            dump<'1'>(b, ix);
         }
         else {
            dump<'0'>(b, ix);
         }
      }
   };

   template <writable_array_t T>
   struct to<CSV, T>
   {
      template <auto Opts, class B>
      static void op(auto&& value, is_context auto&& ctx, B&& b, auto&& ix)
      {
         if constexpr (resizable<T>) {
            if constexpr (check_layout(Opts) == rowwise) {
               const auto n = value.size();
               for (size_t i = 0; i < n; ++i) {
                  serialize<CSV>::op<Opts>(value[i], ctx, b, ix);

                  if (i != (n - 1)) {
                     dump<','>(b, ix);
                  }
               }
            }
            else {
               static_assert(false_v<T>, "Dynamic arrays within dynamic arrays are unsupported");
            }
         }
         else {
            const auto n = value.size();
            for (size_t i = 0; i < n; ++i) {
               serialize<CSV>::op<Opts>(value[i], ctx, b, ix);

               if (i != (n - 1)) {
                  dump<','>(b, ix);
               }
            }
         }
      }
   };

   template <class T>
      requires str_t<T> || char_t<T>
   struct to<CSV, T>
   {
      template <auto Opts, class B>
      static void op(auto&& value, is_context auto&&, B&& b, auto&& ix)
      {
         dump_maybe_empty(value, b, ix);
      }
   };

   template <writable_map_t T>
   struct to<CSV, T>
   {
      template <auto Opts, class B>
      static void op(auto&& value, is_context auto&& ctx, B&& b, auto&& ix)
      {
         if constexpr (check_layout(Opts) == rowwise) {
            for (auto& [name, data] : value) {
               if constexpr (check_use_headers(Opts)) {
                  dump_maybe_empty(name, b, ix);
                  dump<','>(b, ix);
               }
               const auto n = data.size();
               for (size_t i = 0; i < n; ++i) {
                  serialize<CSV>::op<Opts>(data[i], ctx, b, ix);
                  if (i < n - 1) {
                     dump<','>(b, ix);
                  }
               }
               dump<'\n'>(b, ix);
            }
         }
         else {
            // dump titles
            const auto n = value.size();
            if constexpr (check_use_headers(Opts)) {
               size_t i = 0;
               for (auto& [name, data] : value) {
                  dump_maybe_empty(name, b, ix);
                  ++i;
                  if (i < n) {
                     dump<','>(b, ix);
                  }
               }
               dump<'\n'>(b, ix);
            }

            size_t row = 0;
            bool end = false;
            while (true) {
               size_t i = 0;
               for (auto& [name, data] : value) {
                  if (row >= data.size()) {
                     end = true;
                     break;
                  }

                  serialize<CSV>::op<Opts>(data[row], ctx, b, ix);
                  ++i;
                  if (i < n) {
                     dump<','>(b, ix);
                  }
               }

               if (end) {
                  break;
               }

               dump<'\n'>(b, ix);

               ++row;
            }
         }
      }
   };

   template <class T>
      requires((glaze_object_t<T> || reflectable<T>) && not custom_write<T>)
   struct to<CSV, T>
   {
      template <auto Opts, class B>
      static void op(auto&& value, is_context auto&& ctx, B&& b, auto&& ix)
      {
         static constexpr auto N = reflect<T>::size;

         [[maybe_unused]] decltype(auto) t = [&] {
            if constexpr (reflectable<T>) {
               return to_tie(value);
            }
            else {
               return nullptr;
            }
         }();

         if constexpr (check_layout(Opts) == rowwise) {
            for_each<N>([&]<auto I>() {
               using value_type = typename std::decay_t<refl_t<T, I>>::value_type;

               static constexpr sv key = reflect<T>::keys[I];

               decltype(auto) mem = [&]() -> decltype(auto) {
                  if constexpr (reflectable<T>) {
                     return get<I>(t);
                  }
                  else {
                     return get<I>(reflect<T>::values);
                  }
               }();

               if constexpr (writable_array_t<value_type>) {
                  decltype(auto) member = get_member(value, mem);
                  const auto count = member.size();
                  const auto size = member[0].size();
                  for (size_t i = 0; i < size; ++i) {
                     if constexpr (check_use_headers(Opts)) {
                        dump<key>(b, ix);
                        dump<'['>(b, ix);
                        write_chars::op<Opts>(i, ctx, b, ix);
                        dump<']'>(b, ix);
                        dump<','>(b, ix);
                     }

                     for (size_t j = 0; j < count; ++j) {
                        serialize<CSV>::op<Opts>(member[j][i], ctx, b, ix);
                        if (j != count - 1) {
                           dump<','>(b, ix);
                        }
                     }

                     if (i != size - 1) {
                        dump<'\n'>(b, ix);
                     }
                  }
               }
               else {
                  if constexpr (check_use_headers(Opts)) {
                     dump<key>(b, ix);
                     dump<','>(b, ix);
                  }
                  serialize<CSV>::op<Opts>(get_member(value, mem), ctx, b, ix);
                  dump<'\n'>(b, ix);
               }
            });
         }
         else {
            // write titles
            if constexpr (check_use_headers(Opts)) {
               for_each<N>([&]<auto I>() {
                  using X = refl_t<T, I>;

                  static constexpr sv key = reflect<T>::keys[I];

                  decltype(auto) member = [&]() -> decltype(auto) {
                     if constexpr (reflectable<T>) {
                        return get<I>(t);
                     }
                     else {
                        return get<I>(reflect<T>::values);
                     }
                  }();

                  if constexpr (fixed_array_value_t<X>) {
                     const auto size = get_member(value, member)[0].size();
                     for (size_t i = 0; i < size; ++i) {
                        dump<key>(b, ix);
                        dump<'['>(b, ix);
                        write_chars::op<Opts>(i, ctx, b, ix);
                        dump<']'>(b, ix);
                        if (i != size - 1) {
                           dump<','>(b, ix);
                        }
                     }
                  }
                  else {
                     serialize<CSV>::op<Opts>(key, ctx, b, ix);
                  }

                  if constexpr (I != N - 1) {
                     dump<','>(b, ix);
                  }
               });

               dump<'\n'>(b, ix);
            }

            size_t row = 0;
            bool end = false;

            while (true) {
               for_each<N>([&]<auto I>() {
                  using X = std::decay_t<refl_t<T, I>>;

                  decltype(auto) mem = [&]() -> decltype(auto) {
                     if constexpr (reflectable<T>) {
                        return get<I>(t);
                     }
                     else {
                        return get<I>(reflect<T>::values);
                     }
                  }();

                  if constexpr (fixed_array_value_t<X>) {
                     decltype(auto) member = get_member(value, mem);
                     if (row >= member.size()) {
                        end = true;
                        return;
                     }

                     const auto n = member[0].size();
                     for (size_t i = 0; i < n; ++i) {
                        serialize<CSV>::op<Opts>(member[row][i], ctx, b, ix);
                        if (i != n - 1) {
                           dump<','>(b, ix);
                        }
                     }
                  }
                  else {
                     decltype(auto) member = get_member(value, mem);
                     if (row >= member.size()) {
                        end = true;
                        return;
                     }

                     serialize<CSV>::op<Opts>(member[row], ctx, b, ix);

                     if (I != N - 1) {
                        dump<','>(b, ix);
                     }
                  }
               });

               if (end) {
                  break;
               }

               ++row;

               dump<'\n'>(b, ix);
            }
         }
      }
   };

   // For types like std::vector<T> where T is a struct/object
   template <writable_array_t T>
      requires(glaze_object_t<typename T::value_type> || reflectable<typename T::value_type>)
   struct to<CSV, T>
   {
      using U = typename T::value_type;

      template <auto Opts, class B>
      static void op(auto&& value, is_context auto&& ctx, B&& b, auto&& ix)
      {
         static constexpr auto N = reflect<U>::size;

         // Write headers (field names) if enabled
         if constexpr (check_use_headers(Opts)) {
            for_each<N>([&]<auto I>() {
               static constexpr sv key = reflect<U>::keys[I];
               serialize<CSV>::op<Opts>(key, ctx, b, ix);

               if (I < N - 1) {
                  dump<','>(b, ix);
               }
            });

            dump<'\n'>(b, ix);
         }

         // Write each struct as a row
         for (const auto& item : value) {
            for_each<N>([&]<auto I>() {
               decltype(auto) mem = [&]() -> decltype(auto) {
                  if constexpr (reflectable<U>) {
                     return get<I>(to_tie(item));
                  }
                  else {
                     return get<I>(reflect<U>::values);
                  }
               }();

               serialize<CSV>::op<Opts>(get_member(item, mem), ctx, b, ix);

               if (I < N - 1) {
                  dump<','>(b, ix);
               }
            });

            dump<'\n'>(b, ix);
         }
      }
   };

   template <uint32_t layout = rowwise, write_supported<CSV> T, class Buffer>
   [[nodiscard]] auto write_csv(T&& value, Buffer&& buffer)
   {
      return write<opts_csv{.layout = layout}>(std::forward<T>(value), std::forward<Buffer>(buffer));
   }

   template <uint32_t layout = rowwise, write_supported<CSV> T>
   [[nodiscard]] expected<std::string, error_ctx> write_csv(T&& value)
   {
      return write<opts_csv{.layout = layout}>(std::forward<T>(value));
   }

   template <uint32_t layout = rowwise, write_supported<CSV> T>
   [[nodiscard]] error_ctx write_file_csv(T&& value, const std::string& file_name, auto&& buffer)
   {
      const auto ec = write<opts_csv{.layout = layout}>(std::forward<T>(value), buffer);
      if (bool(ec)) [[unlikely]] {
         return ec;
      }
      return {buffer_to_file(buffer, file_name)};
   }
}
