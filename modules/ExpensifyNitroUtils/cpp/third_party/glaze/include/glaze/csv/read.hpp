// Glaze Library
// For the license information refer to glaze.hpp

#pragma once

#include <charconv>

#include "glaze/core/opts.hpp"
#include "glaze/core/read.hpp"
#include "glaze/core/reflect.hpp"
#include "glaze/file/file_ops.hpp"
#include "glaze/util/glaze_fast_float.hpp"
#include "glaze/util/parse.hpp"

namespace glz
{
   template <>
   struct parse<CSV>
   {
      template <auto Opts, class T, is_context Ctx, class It0, class It1>
      static void op(T&& value, Ctx&& ctx, It0&& it, It1 end)
      {
         from<CSV, std::decay_t<T>>::template op<Opts>(std::forward<T>(value), std::forward<Ctx>(ctx),
                                                       std::forward<It0>(it), std::forward<It1>(end));
      }
   };

   GLZ_ALWAYS_INLINE bool csv_new_line(is_context auto& ctx, auto&& it, auto&& end) noexcept
   {
      if (it == end) [[unlikely]] {
         ctx.error = error_code::unexpected_end;
         return true;
      }

      if (*it == '\n') {
         ++it;
      }
      else if (*it == '\r') {
         ++it;
         if (it == end) [[unlikely]] {
            ctx.error = error_code::unexpected_end;
            return true;
         }
         if (*it == '\n') [[likely]] {
            ++it;
         }
         else [[unlikely]] {
            ctx.error = error_code::syntax_error;
            return true;
         }
      }
      else [[unlikely]] {
         ctx.error = error_code::syntax_error;
         return true;
      }
      return false;
   }

   template <glaze_value_t T>
   struct from<CSV, T>
   {
      template <auto Opts, is_context Ctx, class It0, class It1>
      static void op(auto&& value, Ctx&& ctx, It0&& it, It1&& end)
      {
         using V = decltype(get_member(std::declval<T>(), meta_wrapper_v<T>));
         from<CSV, V>::template op<Opts>(get_member(value, meta_wrapper_v<T>), std::forward<Ctx>(ctx),
                                         std::forward<It0>(it), std::forward<It1>(end));
      }
   };

   template <num_t T>
   struct from<CSV, T>
   {
      template <auto Opts, class It>
      static void op(auto&& value, is_context auto&& ctx, It&& it, auto&& end) noexcept
      {
         if (bool(ctx.error)) [[unlikely]] {
            return;
         }

         if (it == end) [[unlikely]] {
            ctx.error = error_code::unexpected_end;
            return;
         }

         using V = decay_keep_volatile_t<decltype(value)>;
         if constexpr (int_t<V>) {
            if constexpr (std::is_unsigned_v<V>) {
               uint64_t i{};
               if (*it == '-') [[unlikely]] {
                  ctx.error = error_code::parse_number_failure;
                  return;
               }

               if (not glz::atoi(i, it, end)) [[unlikely]] {
                  ctx.error = error_code::parse_number_failure;
                  return;
               }

               if (i > (std::numeric_limits<V>::max)()) [[unlikely]] {
                  ctx.error = error_code::parse_number_failure;
                  return;
               }
               value = static_cast<V>(i);
            }
            else {
               uint64_t i{};
               int sign = 1;
               if (*it == '-') {
                  sign = -1;
                  ++it;
                  if (it == end) [[unlikely]] {
                     ctx.error = error_code::unexpected_end;
                     return;
                  }
               }
               if (not glz::atoi(i, it, end)) [[unlikely]] {
                  ctx.error = error_code::parse_number_failure;
                  return;
               }

               if (i > (std::numeric_limits<V>::max)()) [[unlikely]] {
                  ctx.error = error_code::parse_number_failure;
                  return;
               }
               value = sign * static_cast<V>(i);
            }
         }
         else {
            auto [ptr, ec] = glz::from_chars<false>(it, end, value); // Always treat as non-null-terminated
            if (ec != std::errc()) [[unlikely]] {
               ctx.error = error_code::parse_number_failure;
               return;
            }
            it = ptr;
         }
      }
   };

   // CSV spec: https://www.ietf.org/rfc/rfc4180.txt
   // Quotes are escaped via double quotes

   template <string_t T>
   struct from<CSV, T>
   {
      template <auto Opts, class It>
      static void op(auto&& value, is_context auto&& ctx, It&& it, auto&& end)
      {
         if (bool(ctx.error)) [[unlikely]] {
            return;
         }

         value.clear();

         if (it == end) {
            return;
         }

         if (*it == '"') {
            // Quoted field
            ++it; // Skip the opening quote

            if constexpr (check_raw_string(Opts)) {
               // Raw string mode: don't process escape sequences
               while (it != end) {
                  if (*it == '"') {
                     ++it; // Skip the quote
                     if (it == end || *it != '"') {
                        // Single quote - end of field
                        break;
                     }
                     // Double quote - add one quote and continue
                     value.push_back('"');
                     ++it;
                  }
                  else {
                     value.push_back(*it);
                     ++it;
                  }
               }
            }
            else {
               // Normal mode: process escape sequences properly
               while (it != end) {
                  if (*it == '"') {
                     ++it; // Skip the quote
                     if (it == end) {
                        // End of input after closing quote
                        break;
                     }
                     if (*it == '"') {
                        // Escaped quote
                        value.push_back('"');
                        ++it;
                     }
                     else {
                        // Closing quote
                        break;
                     }
                  }
                  else {
                     value.push_back(*it);
                     ++it;
                  }
               }
            }

            // After closing quote, expect comma, newline, or end of input
            if (it != end && *it != ',' && *it != '\n' && *it != '\r') {
               // Invalid character after closing quote
               ctx.error = error_code::syntax_error;
               return;
            }
         }
         else {
            // Unquoted field
            while (it != end && *it != ',' && *it != '\n' && *it != '\r') {
               value.push_back(*it);
               ++it;
            }
         }
      }
   };

   template <bool_t T>
   struct from<CSV, T>
   {
      template <auto Opts, class It>
      static void op(auto&& value, is_context auto&& ctx, It&& it, auto&& end) noexcept
      {
         if (bool(ctx.error)) [[unlikely]] {
            return;
         }

         if (it == end) [[unlikely]] {
            ctx.error = error_code::unexpected_end;
            return;
         }

         uint64_t temp;
         if (not glz::atoi(temp, it, end)) [[unlikely]] {
            ctx.error = error_code::expected_true_or_false;
            return;
         }
         value = static_cast<bool>(temp);
      }
   };

   template <readable_array_t T>
   struct from<CSV, T>
   {
      template <auto Opts, class It>
      static void op(auto&& value, is_context auto&& ctx, It&& it, auto&& end)
      {
         parse<CSV>::op<Opts>(value.emplace_back(), ctx, it, end);
      }
   };

   template <char delim>
   inline void goto_delim(auto&& it, auto&& end) noexcept
   {
      while (it != end && *it != delim) {
         ++it;
      }
   }

   inline auto read_column_wise_keys(auto&& ctx, auto&& it, auto&& end)
   {
      std::vector<std::pair<sv, size_t>> keys;

      auto read_key = [&](auto&& start, auto&& it) {
         sv key{start, size_t(it - start)};

         size_t csv_index{};

         const auto brace_pos = key.find('[');
         if (brace_pos != sv::npos) {
            const auto close_brace = key.find(']');
            const auto index = key.substr(brace_pos + 1, close_brace - (brace_pos + 1));
            key = key.substr(0, brace_pos);
            const auto [ptr, ec] = std::from_chars(index.data(), index.data() + index.size(), csv_index);
            if (ec != std::errc()) {
               ctx.error = error_code::syntax_error;
               return;
            }
         }

         keys.emplace_back(std::pair{key, csv_index});
      };

      auto start = it;
      while (it != end) {
         if (*it == ',') {
            read_key(start, it);
            ++it;
            start = it;
         }
         else if (*it == '\r' || *it == '\n') {
            auto line_end = it; // Position before incrementing
            if (*it == '\r') {
               ++it;
               if (it != end && *it != '\n') [[unlikely]] {
                  ctx.error = error_code::syntax_error;
                  return keys;
               }
            }

            if (start == line_end) {
               // trailing comma or empty
            }
            else {
               read_key(start, line_end); // Use original line ending position
            }
            break;
         }
         else {
            ++it;
         }
      }

      return keys;
   }

   template <readable_map_t T>
   struct from<CSV, T>
   {
      template <auto Opts, class It>
      static void op(auto&& value, is_context auto&& ctx, It&& it, auto&& end)
      {
         if constexpr (check_layout(Opts) == rowwise) {
            while (it != end) {
               auto start = it;
               goto_delim<','>(it, end);
               sv key{start, static_cast<size_t>(it - start)};

               size_t csv_index{};

               const auto brace_pos = key.find('[');
               if (brace_pos != sv::npos) {
                  const auto close_brace = key.find(']');
                  const auto index = key.substr(brace_pos + 1, close_brace - (brace_pos + 1));
                  key = key.substr(0, brace_pos);
                  const auto [ptr, ec] = std::from_chars(index.data(), index.data() + index.size(), csv_index);
                  if (ec != std::errc()) {
                     ctx.error = error_code::syntax_error;
                     return;
                  }
               }

               if (it == end || *it != ',') [[unlikely]] {
                  ctx.error = error_code::syntax_error;
                  return;
               }
               ++it;

               using key_type = typename std::decay_t<decltype(value)>::key_type;
               auto& member = value[key_type(key)];
               using M = std::decay_t<decltype(member)>;
               if constexpr (fixed_array_value_t<M> && emplace_backable<M>) {
                  size_t col = 0;
                  while (it != end) {
                     if (col < member.size()) [[likely]] {
                        parse<CSV>::op<Opts>(member[col][csv_index], ctx, it, end);
                     }
                     else [[unlikely]] {
                        parse<CSV>::op<Opts>(member.emplace_back()[csv_index], ctx, it, end);
                     }

                     if (it == end) break;

                     if (*it == '\r') {
                        ++it;
                        if (it != end && *it == '\n') {
                           ++it;
                        }
                        break;
                     }
                     else if (*it == '\n') {
                        ++it;
                        break;
                     }

                     if (*it == ',') {
                        ++it;
                     }
                     else {
                        ctx.error = error_code::syntax_error;
                        return;
                     }

                     ++col;
                  }
               }
               else {
                  while (it != end) {
                     parse<CSV>::op<Opts>(member, ctx, it, end);

                     if (it == end) break;

                     if (*it == '\r') {
                        ++it;
                        if (it != end && *it == '\n') {
                           ++it;
                        }
                        break;
                     }
                     else if (*it == '\n') {
                        ++it;
                        break;
                     }

                     if (*it == ',') {
                        ++it;
                     }
                     else {
                        ctx.error = error_code::syntax_error;
                        return;
                     }
                  }
               }
            }
         }
         else // column wise
         {
            const auto keys = read_column_wise_keys(ctx, it, end);

            if (bool(ctx.error)) {
               return;
            }

            if (csv_new_line(ctx, it, end)) {
               return;
            }

            const auto n_keys = keys.size();

            size_t row = 0;

            while (it != end) {
               for (size_t i = 0; i < n_keys; ++i) {
                  using key_type = typename std::decay_t<decltype(value)>::key_type;
                  auto& member = value[key_type(keys[i].first)];
                  using M = std::decay_t<decltype(member)>;
                  if constexpr (fixed_array_value_t<M> && emplace_backable<M>) {
                     const auto index = keys[i].second;
                     if (row < member.size()) [[likely]] {
                        parse<CSV>::op<Opts>(member[row][index], ctx, it, end);
                     }
                     else [[unlikely]] {
                        parse<CSV>::op<Opts>(member.emplace_back()[index], ctx, it, end);
                     }
                  }
                  else {
                     parse<CSV>::op<Opts>(member, ctx, it, end);
                  }

                  if (it != end && *it == ',') {
                     ++it;
                  }
               }

               if (it == end) break;

               if (*it == '\r') {
                  ++it;
                  if (it != end && *it == '\n') {
                     ++it;
                     ++row;
                  }
                  else [[unlikely]] {
                     ctx.error = error_code::syntax_error;
                     return;
                  }
               }
               else if (*it == '\n') {
                  ++it;
                  ++row;
               }
            }
         }
      }
   };

   // For types like std::vector<T> where T is a struct/object
   template <readable_array_t T>
      requires(glaze_object_t<typename T::value_type> || reflectable<typename T::value_type>)
   struct from<CSV, T>
   {
      using U = typename T::value_type;

      template <auto Opts, class It>
      static void op(auto&& value, is_context auto&& ctx, It&& it, auto&& end)
      {
         static constexpr auto N = reflect<U>::size;
         static constexpr auto HashInfo = hash_info<U>;

         // Clear existing data if not appending
         if constexpr (!Opts.append_arrays) {
            value.clear();
         }

         if constexpr (check_layout(Opts) == colwise) {
            // Read column headers
            std::vector<size_t> member_indices;

            if constexpr (check_use_headers(Opts)) {
               auto headers = read_column_wise_keys(ctx, it, end);

               if (bool(ctx.error)) [[unlikely]] {
                  return;
               }

               if (csv_new_line(ctx, it, end)) {
                  return;
               }

               // Map header names to member indices
               for (const auto& [key, idx] : headers) {
                  const auto member_idx = decode_hash_with_size<CSV, U, HashInfo, HashInfo.type>::op(
                     key.data(), key.data() + key.size(), key.size());

                  if (member_idx >= N) [[unlikely]] {
                     ctx.error = error_code::unknown_key;
                     return;
                  }

                  member_indices.push_back(member_idx);
               }
            }
            else {
               // Use default order of members
               for (size_t i = 0; i < N; ++i) {
                  member_indices.push_back(i);
               }
            }

            const auto n_cols = member_indices.size();

            // Read rows
            while (it != end) {
               U struct_value{};

               for (size_t i = 0; i < n_cols; ++i) {
                  const auto member_idx = member_indices[i];

                  visit<N>(
                     [&]<size_t I>() {
                        if (I == member_idx) {
                           decltype(auto) member = [&]() -> decltype(auto) {
                              if constexpr (reflectable<U>) {
                                 return get_member(struct_value, get<I>(to_tie(struct_value)));
                              }
                              else {
                                 return get_member(struct_value, get<I>(reflect<U>::values));
                              }
                           }();

                           parse<CSV>::op<Opts>(member, ctx, it, end);
                        }
                     },
                     member_idx);

                  if (bool(ctx.error)) [[unlikely]] {
                     return;
                  }

                  if (i < n_cols - 1) {
                     if (it == end || *it != ',') [[unlikely]] {
                        ctx.error = error_code::syntax_error;
                        return;
                     }
                     ++it;
                  }
               }

               value.push_back(std::move(struct_value));

               if (it == end) {
                  break;
               }

               // Handle newlines
               if (*it == '\r') {
                  ++it;
                  if (it != end && *it == '\n') {
                     ++it;
                  }
                  else [[unlikely]] {
                     ctx.error = error_code::syntax_error;
                     return;
                  }
               }
               else if (*it == '\n') {
                  ++it;
               }
               else [[unlikely]] {
                  ctx.error = error_code::syntax_error;
                  return;
               }

               if (it == end) {
                  break;
               }
            }
         }
         else // rowwise layout
         {
            // Row-wise isn't a typical format for vector of structs in CSV
            // But we could implement if needed
            ctx.error = error_code::feature_not_supported;
            return;
         }
      }
   };

   template <class T>
      requires((glaze_object_t<T> || reflectable<T>) && not custom_read<T>)
   struct from<CSV, T>
   {
      template <auto Opts, class It>
      static void op(auto&& value, is_context auto&& ctx, It&& it, auto&& end)
      {
         static constexpr auto N = reflect<T>::size;
         static constexpr auto HashInfo = hash_info<T>;

         if constexpr (check_layout(Opts) == rowwise) {
            while (it != end) {
               auto start = it;
               goto_delim<','>(it, end);
               sv key{start, static_cast<size_t>(it - start)};

               size_t csv_index{};

               const auto brace_pos = key.find('[');
               if (brace_pos != sv::npos) {
                  const auto close_brace = key.find(']');
                  const auto index = key.substr(brace_pos + 1, close_brace - (brace_pos + 1));
                  key = key.substr(0, brace_pos);
                  const auto [ptr, ec] = std::from_chars(index.data(), index.data() + index.size(), csv_index);
                  if (ec != std::errc()) [[unlikely]] {
                     ctx.error = error_code::syntax_error;
                     return;
                  }
               }

               if (it == end || *it != ',') [[unlikely]] {
                  ctx.error = error_code::syntax_error;
                  return;
               }
               ++it;

               const auto index = decode_hash_with_size<CSV, T, HashInfo, HashInfo.type>::op(
                  key.data(), key.data() + key.size(), key.size());

               if (index < N) [[likely]] {
                  visit<N>(
                     [&]<size_t I>() {
                        decltype(auto) member = [&]() -> decltype(auto) {
                           if constexpr (reflectable<T>) {
                              return get_member(value, get<I>(to_tie(value)));
                           }
                           else {
                              return get_member(value, get<I>(reflect<T>::values));
                           }
                        }();

                        using M = std::decay_t<decltype(member)>;
                        if constexpr (fixed_array_value_t<M> && emplace_backable<M>) {
                           size_t col = 0;
                           while (it != end) {
                              if (col < member.size()) [[likely]] {
                                 parse<CSV>::op<Opts>(member[col][csv_index], ctx, it, end);
                              }
                              else [[unlikely]] {
                                 parse<CSV>::op<Opts>(member.emplace_back()[csv_index], ctx, it, end);
                              }

                              if (it == end) break;

                              if (*it == '\r') {
                                 ++it;
                                 if (it != end && *it == '\n') {
                                    ++it;
                                    break;
                                 }
                                 else [[unlikely]] {
                                    ctx.error = error_code::syntax_error;
                                    return;
                                 }
                              }
                              else if (*it == '\n') {
                                 ++it;
                                 break;
                              }

                              if (*it == ',') [[likely]] {
                                 ++it;
                              }
                              else [[unlikely]] {
                                 ctx.error = error_code::syntax_error;
                                 return;
                              }

                              ++col;
                           }
                        }
                        else {
                           while (it != end) {
                              parse<CSV>::op<Opts>(member, ctx, it, end);

                              if (it == end) break;

                              if (*it == '\r') {
                                 ++it;
                                 if (it != end && *it == '\n') {
                                    ++it;
                                    break;
                                 }
                                 else [[unlikely]] {
                                    ctx.error = error_code::syntax_error;
                                    return;
                                 }
                              }
                              else if (*it == '\n') {
                                 ++it;
                                 break;
                              }

                              if (*it == ',') [[likely]] {
                                 ++it;
                              }
                              else [[unlikely]] {
                                 ctx.error = error_code::syntax_error;
                                 return;
                              }
                           }
                        }
                     },
                     index);

                  if (bool(ctx.error)) [[unlikely]] {
                     return;
                  }
               }
               else [[unlikely]] {
                  ctx.error = error_code::unknown_key;
                  return;
               }
            }
         }
         else // column wise
         {
            const auto keys = read_column_wise_keys(ctx, it, end);

            if (bool(ctx.error)) [[unlikely]] {
               return;
            }

            if (csv_new_line(ctx, it, end)) {
               return;
            }

            const auto n_keys = keys.size();

            size_t row = 0;

            bool at_end{it == end};
            if (!at_end) {
               while (true) {
                  for (size_t i = 0; i < n_keys; ++i) {
                     const auto key = keys[i].first;
                     const auto index = decode_hash_with_size<CSV, T, HashInfo, HashInfo.type>::op(
                        key.data(), key.data() + key.size(), key.size());

                     if (index < N) [[likely]] {
                        visit<N>(
                           [&]<size_t I>() {
                              decltype(auto) member = [&]() -> decltype(auto) {
                                 if constexpr (reflectable<T>) {
                                    return get_member(value, get<I>(to_tie(value)));
                                 }
                                 else {
                                    return get_member(value, get<I>(reflect<T>::values));
                                 }
                              }();

                              using M = std::decay_t<decltype(member)>;
                              if constexpr (fixed_array_value_t<M> && emplace_backable<M>) {
                                 const auto index = keys[i].second;
                                 if (row < member.size()) [[likely]] {
                                    auto& element = member[row];
                                    if (index < element.size()) {
                                       parse<CSV>::op<Opts>(element[index], ctx, it, end);
                                    }
                                    else {
                                       ctx.error = error_code::syntax_error;
                                       return;
                                    }
                                 }
                                 else [[unlikely]] {
                                    auto& element = member.emplace_back();
                                    if (index < element.size()) {
                                       parse<CSV>::op<Opts>(element[index], ctx, it, end);
                                    }
                                    else {
                                       ctx.error = error_code::syntax_error;
                                       return;
                                    }
                                 }
                              }
                              else {
                                 parse<CSV>::op<Opts>(member, ctx, it, end);
                              }
                           },
                           index);

                        if (bool(ctx.error)) [[unlikely]] {
                           return;
                        }
                     }
                     else [[unlikely]] {
                        ctx.error = error_code::unknown_key;
                        return;
                     }

                     at_end = it == end;
                     if (!at_end && *it == ',') {
                        ++it;
                        at_end = it == end;
                     }
                  }
                  if (!at_end) [[likely]] {
                     if (csv_new_line(ctx, it, end)) {
                        return;
                     }

                     ++row;
                     at_end = it == end;
                     if (at_end) break;
                  }
                  else {
                     break;
                  }
               }
            }
         }
      }
   };

   template <uint32_t layout = rowwise, read_supported<CSV> T, class Buffer>
   [[nodiscard]] inline auto read_csv(T&& value, Buffer&& buffer)
   {
      return read<opts_csv{.layout = layout}>(value, std::forward<Buffer>(buffer));
   }

   template <uint32_t layout = rowwise, read_supported<CSV> T, class Buffer>
   [[nodiscard]] inline auto read_csv(Buffer&& buffer)
   {
      T value{};
      read<opts_csv{.layout = layout}>(value, std::forward<Buffer>(buffer));
      return value;
   }

   template <uint32_t layout = rowwise, read_supported<CSV> T, is_buffer Buffer>
   [[nodiscard]] inline error_ctx read_file_csv(T& value, const sv file_name, Buffer&& buffer)
   {
      context ctx{};
      ctx.current_file = file_name;

      const auto ec = file_to_buffer(buffer, ctx.current_file);

      if (bool(ec)) {
         return {ec};
      }

      return read<opts_csv{.layout = layout}>(value, buffer, ctx);
   }
}
