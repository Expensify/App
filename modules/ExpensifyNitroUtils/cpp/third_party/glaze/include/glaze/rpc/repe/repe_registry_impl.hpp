// Glaze Library
// For the license information refer to glaze.hpp

#pragma once

#include "glaze/glaze.hpp"
#include "glaze/rpc/repe/repe.hpp"

namespace glz
{
   // Forward declaration of the registry template
   template <auto Opts, uint32_t Proto>
   struct registry;

   template <>
   struct protocol_storage<REPE>
   {
      using type = std::unordered_map<sv, std::function<void(repe::state&&)>, detail::string_hash, std::equal_to<>>;
   };

   // Implementation for REPE protocol
   template <auto Opts>
   struct registry_impl<Opts, REPE>
   {
      template <class T, class RegistryType>
      static void register_endpoint(const sv path, T& value, RegistryType& reg)
      {
         reg.endpoints[path] = [&value](repe::state&& state) mutable {
            if (state.has_body()) {
               if (read_params<Opts>(value, state) == 0) {
                  return;
               }
            }

            if (state.notify()) {
               return;
            }

            if (not state.has_body()) {
               write_response<Opts>(value, state);
            }
            else {
               write_response<Opts>(state);
            }
         };
      }

      template <class Func, class Result, class RegistryType>
      static void register_function_endpoint(const sv path, Func& func, RegistryType& reg)
      {
         if constexpr (std::same_as<Result, void>) {
            reg.endpoints[path] = [&func](repe::state&& state) mutable {
               func();
               if (state.notify()) {
                  state.out.header.notify = true;
                  return;
               }
               write_response<Opts>(state);
            };
         }
         else {
            reg.endpoints[path] = [&func](repe::state&& state) mutable {
               if (state.notify()) {
                  std::ignore = func();
                  state.out.header.notify = true;
                  return;
               }
               write_response<Opts>(func(), state);
            };
         }
      }

      template <class Func, class Params, class RegistryType>
      static void register_param_function_endpoint(const sv path, Func& func, RegistryType& reg)
      {
         reg.endpoints[path] = [&func](repe::state&& state) mutable {
            static thread_local std::decay_t<Params> params{};
            if (read_params<Opts>(params, state) == 0) {
               return;
            }

            using Result = std::invoke_result_t<decltype(func), Params>;

            if (state.notify()) {
               if constexpr (std::same_as<Result, void>) {
                  func(params);
               }
               else {
                  std::ignore = func(params);
               }
               state.out.header.notify = true;
               return;
            }
            if constexpr (std::same_as<Result, void>) {
               func(params);
               write_response<Opts>(state);
            }
            else {
               auto ret = func(params);
               write_response<Opts>(ret, state);
            }
         };
      }

      template <class Obj, class RegistryType>
      static void register_object_endpoint(const sv path, Obj& obj, RegistryType& reg)
      {
         reg.endpoints[path] = [&obj](repe::state&& state) mutable {
            if (state.has_body()) {
               if (read_params<Opts>(obj, state) == 0) {
                  return;
               }
            }

            if (state.notify()) {
               return;
            }

            if (not state.has_body()) {
               write_response<Opts>(obj, state);
            }
            else {
               write_response<Opts>(state);
            }
         };
      }

      template <class Value, class RegistryType>
      static void register_value_endpoint(const sv path, Value& value, RegistryType& reg)
      {
         reg.endpoints[path] = [value](repe::state&& state) mutable {
            if (state.has_body()) {
               if (read_params<Opts>(value, state) == 0) {
                  return;
               }
            }

            if (state.notify()) {
               state.out.header.notify = true;
               return;
            }

            if (not state.has_body()) {
               write_response<Opts>(value, state);
            }
            else {
               write_response<Opts>(state);
            }
         };
      }

      template <class Var, class RegistryType>
      static void register_variable_endpoint(const sv path, Var& var, RegistryType& reg)
      {
         reg.endpoints[path] = [&var](repe::state&& state) mutable {
            if (state.has_body()) {
               if (read_params<Opts>(var, state) == 0) {
                  return;
               }
            }

            if (state.notify()) {
               state.out.header.notify = true;
               return;
            }

            if (not state.has_body()) {
               write_response<Opts>(var, state);
            }
            else {
               write_response<Opts>(state);
            }
         };
      }

      template <class T, class F, class Ret, class RegistryType>
      static void register_member_function_endpoint(const sv path, T& value, F func, RegistryType& reg)
      {
         reg.endpoints[path] = [&value, func](repe::state&& state) mutable {
            if constexpr (std::same_as<Ret, void>) {
               (value.*func)();

               if (state.notify()) {
                  state.out.header.notify = true;
                  return;
               }

               write_response<Opts>(state);
            }
            else {
               if (state.notify()) {
                  std::ignore = (value.*func)();
                  state.out.header.notify = true;
                  return;
               }

               write_response<Opts>((value.*func)(), state);
            }
         };
      }

      template <class T, class F, class Input, class Ret, class RegistryType>
      static void register_member_function_with_params_endpoint(const sv path, T& value, F func, RegistryType& reg)
      {
         reg.endpoints[path] = [&value, func](repe::state&& state) mutable {
            static thread_local Input input{};
            if (state.has_body()) {
               if (read_params<Opts>(input, state) == 0) {
                  return;
               }
            }

            if constexpr (std::same_as<Ret, void>) {
               (value.*func)(input);

               if (state.notify()) {
                  state.out.header.notify = true;
                  return;
               }

               write_response<Opts>(state);
            }
            else {
               if (state.notify()) {
                  std::ignore = (value.*func)(input);
                  state.out.header.notify = true;
                  return;
               }

               write_response<Opts>((value.*func)(input), state);
            }
         };
      }
   };
}
