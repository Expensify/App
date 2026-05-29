// Glaze Library
// For the license information refer to glaze.hpp

#pragma once

#ifndef GLZ_THROW_OR_ABORT
#if __cpp_exceptions
#define GLZ_THROW_OR_ABORT(EXC) (throw(EXC))
#define GLZ_NOEXCEPT noexcept(false)
#else
#define GLZ_THROW_OR_ABORT(EXC) (std::abort())
#define GLZ_NOEXCEPT noexcept(true)
#endif
#endif

#if __cpp_exceptions
#include <stdexcept>
#endif

namespace glz
{
   inline void glaze_error([[maybe_unused]] const char* msg) GLZ_NOEXCEPT
   {
      GLZ_THROW_OR_ABORT(std::runtime_error(msg));
   }
}

#include <cstddef>
#include <map>
#include <variant>
#include <vector>

#include "glaze/api/std/string.hpp"
#include "glaze/api/std/variant.hpp"
#include "glaze/json/read.hpp"
#include "glaze/json/write.hpp"
#include "glaze/util/expected.hpp"

#ifdef _MSC_VER
// Turn off broken MSVC warning for "declaration of 'v' hides previous local declaration"
#pragma warning(push)
#pragma warning(disable : 4456)
#endif

namespace glz
{
   // Generic json type.
   struct json_t
   {
      virtual ~json_t() {}

      using array_t = std::vector<json_t>;
      using object_t = std::map<std::string, json_t, std::less<>>;
      using null_t = std::nullptr_t;
      using val_t = std::variant<null_t, double, std::string, bool, array_t, object_t>;
      val_t data{};

      /**
       * @brief Converts the JSON data to a string representation.
       * @return An `expected` containing a JSON string if successful, or an error context.
       */
      expected<std::string, error_ctx> dump() const { return write_json(data); }

      /**
       * @brief Gets the value as the specified type.
       * @tparam T The type to get the value as.
       * @return Reference to the value of the specified type.
       */
      template <class T>
      [[nodiscard]] T& get()
      {
         return std::get<T>(data);
      }

      template <class T>
      [[nodiscard]] const T& get() const
      {
         return std::get<T>(data);
      }

      template <class T>
      [[nodiscard]] T* get_if() noexcept
      {
         return std::get_if<T>(&data);
      }

      template <class T>
      [[nodiscard]] const T* get_if() const noexcept
      {
         return std::get_if<T>(&data);
      }

      template <class T>
      [[nodiscard]] T as() const
      {
         // Prefer get becuase it returns a reference
         return get<T>();
      }

      template <class T>
         requires(requires { static_cast<T>(std::declval<double>()); })
      [[nodiscard]] T as() const
      {
         // Can be used for int and the like
         return static_cast<T>(get<double>());
      }

      template <class T>
         requires std::convertible_to<std::string, T>
      [[nodiscard]] T as() const
      {
         // Can be used for string_view and the like
         return get<std::string>();
      }

      template <class T>
      [[nodiscard]] bool holds() const noexcept
      {
         return std::holds_alternative<T>(data);
      }

      json_t& operator[](std::integral auto&& index) { return std::get<array_t>(data)[index]; }

      const json_t& operator[](std::integral auto&& index) const { return std::get<array_t>(data)[index]; }

      json_t& operator[](std::convertible_to<std::string_view> auto&& key)
      {
         //[] operator for maps does not support heterogeneous lookups yet
         if (holds<null_t>()) data = object_t{};
         auto& object = std::get<object_t>(data);
         auto iter = object.find(key);
         if (iter == object.end()) {
            iter = object.insert(std::make_pair(std::string(key), json_t{})).first;
         }
         return iter->second;
      }

      const json_t& operator[](std::convertible_to<std::string_view> auto&& key) const
      {
         //[] operator for maps does not support heterogeneous lookups yet
         auto& object = std::get<object_t>(data);
         auto iter = object.find(key);
         if (iter == object.end()) {
            glaze_error("Key not found.");
         }
         return iter->second;
      }

      json_t& operator=(const std::nullptr_t value)
      {
         data = value;
         return *this;
      }

      json_t& operator=(const double value)
      {
         data = value;
         return *this;
      }

      // for integers
      template <int_t T>
      json_t& operator=(const T value)
      {
         data = static_cast<double>(value);
         return *this;
      }

      json_t& operator=(const std::string& value)
      {
         data = value;
         return *this;
      }

      json_t& operator=(const std::string_view value)
      {
         data = std::string(value);
         return *this;
      }

      json_t& operator=(const char* value)
      {
         data = std::string(value);
         return *this;
      }

      json_t& operator=(const bool value)
      {
         data = value;
         return *this;
      }

      json_t& operator=(const array_t& value)
      {
         data = value;
         return *this;
      }

      json_t& operator=(const object_t& value)
      {
         data = value;
         return *this;
      }

      template <class T>
         requires(!std::is_same_v<std::decay_t<T>, json_t> && !std::is_same_v<std::decay_t<T>, std::nullptr_t> &&
                  !std::is_same_v<std::decay_t<T>, double> && !std::is_same_v<std::decay_t<T>, bool> &&
                  !std::is_same_v<std::decay_t<T>, std::string> && !std::is_same_v<std::decay_t<T>, std::string_view> &&
                  !std::is_same_v<std::decay_t<T>, const char*> && !std::is_same_v<std::decay_t<T>, array_t> &&
                  !std::is_same_v<std::decay_t<T>, object_t> && !int_t<T> &&
                  requires { write_json(std::declval<T>()); })
      json_t& operator=(T&& value)
      {
         auto json_str = write_json(std::forward<T>(value));
         if (json_str) {
            auto result = read_json<json_t>(*json_str);
            if (result) {
               *this = std::move(*result);
            }
         }
         return *this;
      }

      [[nodiscard]] json_t& at(std::convertible_to<std::string_view> auto&& key) { return operator[](key); }

      [[nodiscard]] const json_t& at(std::convertible_to<std::string_view> auto&& key) const { return operator[](key); }

      [[nodiscard]] bool contains(std::convertible_to<std::string_view> auto&& key) const
      {
         if (!holds<object_t>()) return false;
         auto& object = std::get<object_t>(data);
         auto iter = object.find(key);
         return iter != object.end();
      }

      explicit operator bool() const { return !std::holds_alternative<null_t>(data); }

      val_t* operator->() noexcept { return &data; }

      val_t& operator*() noexcept { return data; }

      const val_t& operator*() const noexcept { return data; }

      void reset() noexcept { data = null_t{}; }

      json_t() = default;
      json_t(const json_t&) = default;
      json_t& operator=(const json_t&) = default;
      json_t(json_t&&) = default;
      json_t& operator=(json_t&&) = default;

      template <class T>
         requires std::convertible_to<T, val_t> && (!std::derived_from<std::decay_t<T>, json_t>)
      json_t(T&& val)
      {
         data = val;
      }

      template <class T>
         requires std::convertible_to<T, double> && (!std::derived_from<std::decay_t<T>, json_t>) &&
                  (!std::convertible_to<T, val_t>)
      json_t(T&& val)
      {
         data = static_cast<double>(val);
      }

      json_t(const std::string_view value) { data = std::string(value); }

      json_t(std::initializer_list<std::pair<const char*, json_t>>&& obj)
      {
         data.emplace<object_t>();
         auto& data_obj = std::get<object_t>(data);
         for (auto&& pair : obj) {
            // std::initializer_list holds const values that cannot be moved
            data_obj.emplace(pair.first, pair.second);
         }
      }

      // Prevent conflict with object initializer list
      template <bool deprioritize = true>
      json_t(std::initializer_list<json_t>&& arr)
      {
         data.emplace<array_t>(std::move(arr));
      }

      [[nodiscard]] bool is_array() const noexcept { return holds<json_t::array_t>(); }

      [[nodiscard]] bool is_object() const noexcept { return holds<json_t::object_t>(); }

      [[nodiscard]] bool is_number() const noexcept { return holds<double>(); }

      [[nodiscard]] bool is_string() const noexcept { return holds<std::string>(); }

      [[nodiscard]] bool is_boolean() const noexcept { return holds<bool>(); }

      [[nodiscard]] bool is_null() const noexcept { return holds<std::nullptr_t>(); }

      [[nodiscard]] array_t& get_array() { return get<array_t>(); }
      [[nodiscard]] const array_t& get_array() const { return get<array_t>(); }

      [[nodiscard]] object_t& get_object() { return get<object_t>(); }
      [[nodiscard]] const object_t& get_object() const { return get<object_t>(); }

      [[nodiscard]] double& get_number() { return get<double>(); }
      [[nodiscard]] const double& get_number() const { return get<double>(); }

      [[nodiscard]] std::string& get_string() { return get<std::string>(); }
      [[nodiscard]] const std::string& get_string() const { return get<std::string>(); }

      [[nodiscard]] bool& get_boolean() { return get<bool>(); }
      [[nodiscard]] const bool& get_boolean() const { return get<bool>(); }

      // empty() returns true if the value is an empty JSON object, array, or string, or a null value
      // otherwise returns false
      [[nodiscard]] bool empty() const noexcept
      {
         if (auto* v = get_if<object_t>()) {
            return v->empty();
         }
         else if (auto* v = get_if<array_t>()) {
            return v->empty();
         }
         else if (auto* v = get_if<std::string>()) {
            return v->empty();
         }
         else if (is_null()) {
            return true;
         }
         else {
            return false;
         }
      }

      // returns the count of items in an object or an array, or the size of a string, otherwise returns zero
      [[nodiscard]] size_t size() const noexcept
      {
         if (auto* v = get_if<object_t>()) {
            return v->size();
         }
         else if (auto* v = get_if<array_t>()) {
            return v->size();
         }
         else if (auto* v = get_if<std::string>()) {
            return v->size();
         }
         else {
            return 0;
         }
      }
   };

   [[nodiscard]] inline bool is_array(const json_t& value) noexcept { return value.is_array(); }

   [[nodiscard]] inline bool is_object(const json_t& value) noexcept { return value.is_object(); }

   [[nodiscard]] inline bool is_number(const json_t& value) noexcept { return value.is_number(); }

   [[nodiscard]] inline bool is_string(const json_t& value) noexcept { return value.is_string(); }

   [[nodiscard]] inline bool is_boolean(const json_t& value) noexcept { return value.is_boolean(); }

   [[nodiscard]] inline bool is_null(const json_t& value) noexcept { return value.is_null(); }
}

template <>
struct glz::meta<glz::json_t>
{
   static constexpr std::string_view name = "glz::json_t";
   using T = glz::json_t;
   static constexpr auto value = &T::data;
};

namespace glz
{
   // These functions allow a json_t value to be read/written to a C++ struct

   template <auto Opts, class T>
      requires read_supported<T, Opts.format>
   [[nodiscard]] error_ctx read(T& value, const json_t& source)
   {
      auto buffer = source.dump();
      if (buffer) {
         context ctx{};
         return read<Opts>(value, *buffer, ctx);
      }
      else {
         return buffer.error();
      }
   }

   template <read_supported<JSON> T>
   [[nodiscard]] error_ctx read_json(T& value, const json_t& source)
   {
      auto buffer = source.dump();
      if (buffer) {
         return read_json(value, *buffer);
      }
      else {
         return buffer.error();
      }
   }

   template <read_supported<JSON> T>
   [[nodiscard]] expected<T, error_ctx> read_json(const json_t& source)
   {
      auto buffer = source.dump();
      if (buffer) {
         return read_json<T>(*buffer);
      }
      else {
         return unexpected(buffer.error());
      }
   }
}

#ifdef _MSC_VER
// restore disabled warning
#pragma warning(pop)
#endif

#include "glaze/core/seek.hpp"

namespace glz
{
   // Specialization for glz::json_t
   template <>
   struct seek_op<glz::json_t>
   {
      template <class F>
      static bool op(F&& func, auto&& value, sv json_ptr)
      {
         if (json_ptr.empty()) {
            // At target - call func with the actual variant data, not the json_t wrapper
            std::visit([&func](auto&& variant_value) { func(variant_value); }, value.data);
            return true;
         }

         if (json_ptr[0] != '/' || json_ptr.size() < 2) return false;

         // Handle object access
         if (value.is_object()) {
            auto& obj = value.get_object();

            // Parse the key (with JSON Pointer escaping)
            std::string key;
            size_t i = 1;
            for (; i < json_ptr.size(); ++i) {
               auto c = json_ptr[i];
               if (c == '/')
                  break;
               else if (c == '~') {
                  if (++i == json_ptr.size()) return false;
                  c = json_ptr[i];
                  if (c == '0')
                     c = '~';
                  else if (c == '1')
                     c = '/';
                  else
                     return false;
               }
               key.push_back(c);
            }

            auto it = obj.find(key);
            if (it == obj.end()) return false;

            sv remaining_ptr = json_ptr.substr(i);
            return seek(std::forward<F>(func), it->second, remaining_ptr);
         }
         // Handle array access
         else if (value.is_array()) {
            auto& arr = value.get_array();

            // Parse the index
            size_t index{};
            auto [p, ec] = std::from_chars(&json_ptr[1], json_ptr.data() + json_ptr.size(), index);
            if (ec != std::errc{}) return false;

            if (index >= arr.size()) return false;

            sv remaining_ptr = json_ptr.substr(p - json_ptr.data());
            return seek(std::forward<F>(func), arr[index], remaining_ptr);
         }

         return false;
      }
   };
}
