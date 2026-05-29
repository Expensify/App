// Glaze Library
// For the license information refer to glaze.hpp

#pragma once

#include "glaze/glaze.hpp"
#include "glaze/rpc/repe/repe.hpp"

namespace glz
{
   namespace detail
   {
      static constexpr std::string_view empty_path = "";
   }

   // Forward declaration of implementation template
   template <auto Opts, uint32_t Protocol>
   struct registry_impl;
}

// Include implementation files
#include "glaze/net/rest_registry_impl.hpp"
#include "glaze/rpc/repe/repe_registry_impl.hpp"

namespace glz
{
   // This registry does not support adding methods from RPC calls or adding methods once RPC calls can be made.
   template <auto Opts = opts{}, uint32_t Proto = REPE>
   struct registry
   {
      // procedure for REPE protocol
      using procedure = std::function<void(repe::state&&)>; // RPC method

      static constexpr auto protocol = Proto;

      typename protocol_storage<Proto>::type endpoints{};

      void clear() { endpoints.clear(); }

      // Register a C++ type that stores pointers to the value, so be sure to keep the registered value alive
      template <const std::string_view& root = detail::empty_path, class T, const std::string_view& parent = root>
         requires(glaze_object_t<T> || reflectable<T>)
      void on(T& value)
      {
         using namespace glz::detail;
         static constexpr auto N = reflect<T>::size;

         [[maybe_unused]] decltype(auto) t = [&]() -> decltype(auto) {
            if constexpr (reflectable<T> && requires { to_tie(value); }) {
               return to_tie(value);
            }
            else {
               return nullptr;
            }
         }();

         using impl = registry_impl<Opts, Proto>;

         if constexpr (parent == root && (glaze_object_t<T> || reflectable<T>)) {
            impl::register_endpoint(root, value, *this);
         }

         for_each<N>([&]<auto I>() {
            decltype(auto) func = [&]() -> decltype(auto) {
               if constexpr (reflectable<T>) {
                  return get_member(value, get<I>(t));
               }
               else {
                  return get_member(value, get<I>(reflect<T>::values));
               }
            }();

            static constexpr auto key = reflect<T>::keys[I];

            static constexpr std::string_view full_key = [&] {
               if constexpr (parent == detail::empty_path) {
                  return join_v<chars<"/">, key>;
               }
               else {
                  return join_v<parent, chars<"/">, key>;
               }
            }();

            // This logic chain should match glz::cli_menu
            using Func = decltype(func);
            if constexpr (std::is_invocable_v<Func>) {
               using Result = std::decay_t<std::invoke_result_t<Func>>;
               impl::template register_function_endpoint<Func, Result>(full_key, func, *this);
            }
            else if constexpr (is_invocable_concrete<std::remove_cvref_t<Func>>) {
               using Tuple = invocable_args_t<std::remove_cvref_t<Func>>;
               constexpr auto N = glz::tuple_size_v<Tuple>;
               static_assert(N == 1, "Only one input is allowed for your function");

               using Params = glz::tuple_element_t<0, Tuple>;

               impl::template register_param_function_endpoint<Func, Params>(full_key, func, *this);
            }
            else if constexpr (glaze_object_t<std::remove_cvref_t<Func>> || reflectable<std::remove_cvref_t<Func>>) {
               on<root, std::remove_cvref_t<Func>, full_key>(func);

               impl::template register_object_endpoint<std::remove_cvref_t<Func>>(full_key, func, *this);
            }
            else if constexpr (not std::is_lvalue_reference_v<Func>) {
               // For glz::custom, glz::manage, etc.
               impl::template register_value_endpoint<std::remove_cvref_t<Func>>(full_key, func, *this);
            }
            else {
               static_assert(std::is_lvalue_reference_v<Func>);

               if constexpr (std::is_member_function_pointer_v<std::decay_t<Func>>) {
                  using F = std::decay_t<Func>;
                  using Ret = typename return_type<F>::type;
                  using Tuple = typename inputs_as_tuple<F>::type;
                  constexpr auto n_args = glz::tuple_size_v<Tuple>;
                  if constexpr (std::is_void_v<Ret>) {
                     if constexpr (n_args == 0) {
                        impl::template register_member_function_endpoint<T, F, void>(full_key, value, func, *this);
                     }
                     else if constexpr (n_args == 1) {
                        using Input = std::decay_t<glz::tuple_element_t<0, Tuple>>;
                        impl::template register_member_function_with_params_endpoint<T, F, Input, void>(full_key, value,
                                                                                                        func, *this);
                     }
                     else {
                        static_assert(false_v<Func>, "function cannot have more than one input");
                     }
                  }
                  else {
                     // Member function pointers
                     if constexpr (n_args == 0) {
                        impl::template register_member_function_endpoint<T, F, Ret>(full_key, value, func, *this);
                     }
                     else if constexpr (n_args == 1) {
                        using Input = std::decay_t<glz::tuple_element_t<0, Tuple>>;
                        impl::template register_member_function_with_params_endpoint<T, F, Input, Ret>(full_key, value,
                                                                                                       func, *this);
                     }
                     else {
                        static_assert(false_v<Func>, "function cannot have more than one input");
                     }
                  }
               }
               else {
                  // this is a variable and not a function, so we build RPC read/write calls
                  // We can't remove const here, because const fields need to be able to be written
                  impl::template register_variable_endpoint<std::remove_reference_t<Func>>(full_key, func, *this);
               }
            }
         });
      }

      // Function to call methods - only available for REPE protocol
      template <class In = repe::message, class Out = repe::message>
         requires(Proto == REPE) // call method is only available for REPE protocol
      void call(In&& in, Out&& out)
      {
         auto write_error = [&](const std::string& body) {
            out.body = body;
            out.header.body_length = body.size();
            out.header.length = sizeof(repe::header) + out.query.size() + out.body.size();
         };

         // REPE Header Validation

         // Version validation - REPE spec requires version 1
         if (in.header.version != 1) {
            out.header.ec = error_code::version_mismatch;
            out.header.id = in.header.id; // Echo back the original ID
            write_error("REPE version mismatch: expected 1, got " + std::to_string(in.header.version));
            return;
         }

         // Length validation - REPE spec requires length = 48 + query_length + body_length
         const uint64_t expected_length = sizeof(repe::header) + in.header.query_length + in.header.body_length;
         if (in.header.length != expected_length) {
            out.header.ec = error_code::invalid_header;
            out.header.id = in.header.id; // Echo back the original ID
            write_error("REPE length mismatch: expected " + std::to_string(expected_length) + ", got " +
                        std::to_string(in.header.length));
            return;
         }

         // Magic number validation - REPE spec requires 0x1507
         if (in.header.spec != 0x1507) {
            out.header.ec = error_code::invalid_header;
            out.header.id = in.header.id; // Echo back the original ID
            write_error("REPE magic number mismatch: expected 0x1507, got 0x" + std::to_string(in.header.spec));
            return;
         }

         if (auto it = endpoints.find(in.query); it != endpoints.end()) {
            if (bool(in.header.ec)) {
               out = in;
            }
            else {
               try {
                  it->second(repe::state{in, out}); // handle the body
               }
               catch (const std::exception& e) {
                  out = repe::message{}; // reset the output message because it could have been modified
                  out.header.query_length = 0;
                  std::string body = "registry error for `" + in.query + "`: ";
                  body.append(e.what());
                  out.header.ec = error_code::parse_error;
                  write_error(body);
               }
            }
         }
         else {
            std::string body = "invalid_query: " + in.query;
            out.header.ec = error_code::method_not_found;
            write_error(body);
         }
      }
   };
}
