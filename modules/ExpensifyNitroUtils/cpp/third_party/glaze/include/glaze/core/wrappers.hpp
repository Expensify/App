// Glaze Library
// For the license information refer to glaze.hpp

#pragma once

#include <type_traits>

#include "glaze/core/opts.hpp"

namespace glz
{
   // treat a value as quoted to avoid double parsing into a value
   template <class T>
   struct quoted_t
   {
      static constexpr bool glaze_wrapper = true;
      using value_type = T;
      T& val;
   };

   template <class T, auto OptsMemPtr>
   struct opts_wrapper_t
   {
      static constexpr bool glaze_wrapper = true;
      static constexpr auto glaze_reflect = false;
      static constexpr auto opts_member = OptsMemPtr;
      using value_type = T;
      T& val;
   };

   template <class T>
   concept is_opts_wrapper = requires {
      requires T::glaze_wrapper == true;
      requires T::glaze_reflect == false;
      T::opts_member;
      typename T::value_type;
      requires std::is_lvalue_reference_v<decltype(T::val)>;
   };

   template <auto MemPtr, auto OptsMemPtr>
   inline constexpr decltype(auto) opts_wrapper() noexcept
   {
      return [](auto&& val) {
         using V = std::remove_reference_t<decltype(val.*MemPtr)>;
         return opts_wrapper_t<V, OptsMemPtr>{val.*MemPtr};
      };
   }

   // custom_t allows a user to register member functions, std::function members, and member variables
   // to implement custom reading and writing
   template <class T, class From, class To>
   struct custom_t final
   {
      static constexpr auto glaze_reflect = false;
      using from_t = From;
      using to_t = To;
      T& val;
      From from;
      To to;
   };

   template <class T, class From, class To>
   custom_t(T&, From, To) -> custom_t<T, From, To>;

   template <auto From, auto To>
   constexpr auto custom_impl() noexcept
   {
      return [](auto&& v) { return custom_t{v, From, To}; };
   }

   // When reading into an array that is appendable, the new data will be appended rather than overwrite
   template <auto MemPtr>
   constexpr auto append_arrays = opts_wrapper<MemPtr, &opts::append_arrays>();

   // Read and write booleans as numbers
   template <auto MemPtr>
   constexpr auto bools_as_numbers = opts_wrapper<MemPtr, &opts::bools_as_numbers>();

   // Read and write numbers as strings
   template <auto MemPtr>
   constexpr auto quoted_num = opts_wrapper<MemPtr, &opts::quoted_num>();

   // Treat types like std::string as numbers: read and write them quoted
   template <auto MemPtr>
   constexpr auto number = opts_wrapper<MemPtr, &opts::number>();

   // Write out string like types without quotes
   template <auto MemPtr>
   constexpr auto raw = opts_wrapper<MemPtr, &opts::raw>();

   // Reads into only existing fields and elements and then exits without parsing the rest of the input
   template <auto MemPtr>
   constexpr auto partial_read = opts_wrapper<MemPtr, &opts::partial_read>();

   // Customize reading and writing
   template <auto From, auto To>
   constexpr auto custom = custom_impl<From, To>();
}
