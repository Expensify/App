#pragma once

// High-level C++ interface for the FFI Glaze interop
// Provides a clean, intuitive API for working with Glaze types across a C shared library dynamically

#include <any>
#include <future>
#include <typeindex>
#include <unordered_map>
#include <vector>

#include "glaze/interop/client.hpp"
#include "glaze/interop/interop.hpp"

namespace glz
{
   // Forward declarations
   struct i_type;
   struct i_instance;
   struct i_field;
   struct i_method;

   // Dynamic value type that can hold references to any Glaze-supported type
   struct i_value
   {
      // Store pointers for direct memory access, with type information
      using value_type = std::variant<std::monostate, // null/nothing
                                      bool*, int8_t*, int16_t*, int32_t*, int64_t*, uint8_t*, uint16_t*, uint32_t*,
                                      uint64_t*, float*, double*, std::string*,
                                      std::vector<i_value>*, // Arrays of values
                                      std::unordered_map<std::string, i_value>*, // Objects
                                      std::complex<float>*, std::complex<double>*,
                                      std::shared_ptr<i_instance>, // Reference to an instance
                                      std::shared_future<i_value>*, // Async results
                                      // For owning temporary values (e.g., computed results)
                                      std::shared_ptr<std::any> // Owned value with type erasure
                                      >;

     private:
      value_type value_;
      bool owned_ = false; // Whether this value owns the data

      // Helper to create owned values
      template <class T>
      void make_owned(T&& val)
      {
         auto owned_ptr = std::make_shared<std::any>(std::forward<T>(val));
         value_ = owned_ptr;
         owned_ = true;
      }

     public:
      i_value() : value_(std::monostate{}) {}

      // Constructor for references (non-owning)
      template <class T>
      explicit i_value(T* ptr) : owned_(false)
      {
         if constexpr (bool_t<T> || int_t<T> || std::floating_point<T> || complex_t<T>)
            value_ = static_cast<T*>(ptr);
         else if constexpr (std::same_as<T, std::string>)
            value_ = static_cast<std::string*>(ptr);
         else if constexpr (std::is_same_v<T, std::vector<i_value>>)
            value_ = static_cast<std::vector<i_value>*>(ptr);
         else if constexpr (std::is_same_v<T, std::unordered_map<std::string, i_value>>)
            value_ = static_cast<std::unordered_map<std::string, i_value>*>(ptr);
         else {
            // For other types, store as owned std::any
            make_owned(std::move(*ptr));
         }
      }

      // Constructor for owned values (makes a copy)
      template <class T>
      static i_value make_owned_value(T&& val)
      {
         i_value v;
         v.make_owned(std::forward<T>(val));
         return v;
      }

      // Reference wrapper constructor for safer reference semantics
      template <class T>
      explicit i_value(std::reference_wrapper<T> ref) : i_value(&ref.get())
      {}

      // Instance wrapper constructor
      explicit i_value(std::shared_ptr<i_instance> instance) : value_(instance) {}

      // Type checking
      bool is_null() const { return std::holds_alternative<std::monostate>(value_); }
      bool is_bool() const { return std::holds_alternative<bool*>(value_); }
      bool is_int() const
      {
         return std::holds_alternative<int8_t*>(value_) || std::holds_alternative<int16_t*>(value_) ||
                std::holds_alternative<int32_t*>(value_) || std::holds_alternative<int64_t*>(value_) ||
                std::holds_alternative<uint8_t*>(value_) || std::holds_alternative<uint16_t*>(value_) ||
                std::holds_alternative<uint32_t*>(value_) || std::holds_alternative<uint64_t*>(value_);
      }
      bool is_float() const
      {
         return std::holds_alternative<float*>(value_) || std::holds_alternative<double*>(value_);
      }
      bool is_string() const { return std::holds_alternative<std::string*>(value_); }
      bool is_array() const { return std::holds_alternative<std::vector<i_value>*>(value_); }
      bool is_object() const { return std::holds_alternative<std::unordered_map<std::string, i_value>*>(value_); }
      bool is_instance() const { return std::holds_alternative<std::shared_ptr<i_instance>>(value_); }
      bool is_future() const { return std::holds_alternative<std::shared_future<i_value>*>(value_); }
      bool is_owned() const { return owned_; }

      // value extraction - get pointer to the stored type
      template <class T>
      T* get_ptr()
      {
         if constexpr (std::is_same_v<T, bool>)
            return std::get_if<bool*>(&value_) ? *std::get_if<bool*>(&value_) : nullptr;
         else if constexpr (std::is_same_v<T, int32_t>)
            return std::get_if<int32_t*>(&value_) ? *std::get_if<int32_t*>(&value_) : nullptr;
         else if constexpr (std::is_same_v<T, int64_t>)
            return std::get_if<int64_t*>(&value_) ? *std::get_if<int64_t*>(&value_) : nullptr;
         else if constexpr (std::is_same_v<T, float>)
            return std::get_if<float*>(&value_) ? *std::get_if<float*>(&value_) : nullptr;
         else if constexpr (std::is_same_v<T, double>)
            return std::get_if<double*>(&value_) ? *std::get_if<double*>(&value_) : nullptr;
         else if constexpr (std::is_same_v<T, std::string>)
            return std::get_if<std::string*>(&value_) ? *std::get_if<std::string*>(&value_) : nullptr;
         else
            return nullptr;
      }

      template <class T>
      const T* get_ptr() const
      {
         return const_cast<i_value*>(this)->get_ptr<T>();
      }

      // Get reference to the value (throws if wrong type or null pointer)
      template <class T>
      T& get_ref()
      {
         T* ptr = get_ptr<T>();
         if (!ptr) throw std::runtime_error("value is not of requested type or is null");
         return *ptr;
      }

      template <class T>
      const T& get_ref() const
      {
         const T* ptr = get_ptr<T>();
         if (!ptr) throw std::runtime_error("value is not of requested type or is null");
         return *ptr;
      }

      // Convenience accessors that dereference the pointers
      bool as_bool() const;
      int64_t as_int() const;
      double as_float() const;
      std::string as_string() const;
      std::vector<i_value>& as_array();
      const std::vector<i_value>& as_array() const;

      // Object field access (like Julia's dot notation)
      i_value& operator[](const std::string& key);
      const i_value& operator[](const std::string& key) const;

      // Array element access
      i_value& operator[](size_t index);
      const i_value& operator[](size_t index) const;

      // JSON serialization
      std::string to_json() const;
      static i_value from_json(const std::string& json);
   };

   // Represents a field in a type
   struct i_field
   {
      friend struct i_type;
      friend struct i_instance;

     private:
      std::string name_;
      const glz_member_info* info_;
      std::shared_ptr<i_type> type_;

     public:
      i_field() : name_(), info_(nullptr), type_(nullptr) {}
      i_field(std::string_view name, const glz_member_info* info, std::shared_ptr<i_type> type = nullptr)
         : name_(name), info_(info), type_(type)
      {}
      const std::string& name() const { return name_; }
      bool is_function() const { return info_ && info_->kind == 1; }
      std::shared_ptr<i_type> get_type() const { return type_; }
   };

   // Represents a method in a type
   struct i_method
   {
      friend struct i_type;
      friend struct i_instance;

     private:
      std::string name_;
      const glz_member_info* info_;
      std::vector<std::shared_ptr<i_type>> param_types_;
      std::shared_ptr<i_type> return_type_;

     public:
      i_method() : name_(), info_(nullptr) {}
      i_method(std::string_view name, const glz_member_info* info = nullptr) : name_(name), info_(info) {}
      const std::string& name() const { return name_; }
      size_t param_count() const { return param_types_.size(); }
      const std::vector<std::shared_ptr<i_type>>& param_types() const { return param_types_; }
      std::shared_ptr<i_type> return_type() const { return return_type_; }
   };

   // Represents a Glaze type
   struct i_type : public std::enable_shared_from_this<i_type>
   {
      friend struct i_instance;
      friend struct i_glaze;

     private:
      std::string name_;
      size_t size_;
      std::unordered_map<std::string, i_field> fields_;
      std::unordered_map<std::string, i_method> methods_;
      const glz_type_info* info_;

     public:
      // Constructor - types are created through i_glaze class
      i_type(const glz_type_info* info);
      const std::string& name() const { return name_; }
      size_t size() const { return size_; }

      // field access
      bool has_field(const std::string& name) const { return fields_.find(name) != fields_.end(); }

      const i_field& get_field(const std::string& name) const
      {
         auto it = fields_.find(name);
         if (it == fields_.end()) {
            throw std::runtime_error("field not found: " + name);
         }
         return it->second;
      }

      const std::unordered_map<std::string, i_field>& fields() const { return fields_; }

      // method access
      bool has_method(const std::string& name) const { return methods_.find(name) != methods_.end(); }

      const i_method& get_method(const std::string& name) const
      {
         auto it = methods_.find(name);
         if (it == methods_.end()) {
            throw std::runtime_error("method not found: " + name);
         }
         return it->second;
      }

      const std::unordered_map<std::string, i_method>& methods() const { return methods_; }

      // Create an instance of this type
      std::shared_ptr<i_instance> create_instance();
   };

   // Represents an instance of a Glaze type
   struct i_instance : public std::enable_shared_from_this<i_instance>
   {
      friend struct i_type;
      friend struct i_glaze;

     private:
      void* ptr_;
      std::shared_ptr<i_type> type_;
      bool owned_;

     public:
      i_instance(void* ptr, std::shared_ptr<i_type> type, bool owned = true) : ptr_(ptr), type_(type), owned_(owned) {}
      ~i_instance();

      std::shared_ptr<i_type> get_type() const { return type_; }
      void* ptr() { return ptr_; }
      const void* ptr() const { return ptr_; }

      // field access - primary interface using operator[]
      // Usage: instance["field_name"] returns a value pointing to the field
      i_value operator[](const std::string& field_name) { return get_field(field_name); }

      i_value operator[](const std::string& field_name) const { return get_field(field_name); }

      // Helper class to enable arrow operator for shared_ptr<iinstance>
      struct field_accessor
      {
         i_instance* instance_;

        public:
         explicit field_accessor(i_instance* inst) : instance_(inst) {}
         i_value operator[](const std::string& field_name) { return instance_->get_field(field_name); }
      };

      // Enable direct field access on shared_ptr<i_instance>
      field_accessor fields() { return field_accessor(this); }

      // Lower-level field access (used by operator[])
      i_value get_field(const std::string& field_name) const;
      void set_field(const std::string& field_name, const i_value& val);

      // method invocation (like Julia's method calls)
      template <class... Args>
      i_value call(const std::string& method_name, Args&&... args);

      // Convert to JSON
      std::string to_json() const;

      // Create from JSON
      static std::shared_ptr<i_instance> from_json(const std::string& json, std::shared_ptr<i_type> type);
   };

   // Main Glaze interop class
   struct i_glaze
   {
     private:
      // type registry
      static std::unordered_map<std::string, std::shared_ptr<i_type>> type_registry_;

      // instance registry for global instances
      static std::unordered_map<std::string, std::shared_ptr<i_instance>> instance_registry_;

      // Library handles for dynamically loaded libraries
      static std::vector<std::unique_ptr<interop::interop_library>> loaded_libraries_;

     public:
      // Register a C++ type (like Julia's register_type)
      template <class T>
      static std::shared_ptr<i_type> register_type(const std::string& name)
      {
         glz::register_type<T>(name);
         return get_type(name);
      }

      // Get a registered type
      static std::shared_ptr<i_type> get_type(const std::string& name);

      // Check if a type is registered
      static bool has_type(const std::string& name) { return type_registry_.find(name) != type_registry_.end(); }

      // List all registered types
      static std::vector<std::string> list_types();

      // Create an instance of a type
      static std::shared_ptr<i_instance> create_instance(const std::string& type_name);

      // Register a global instance
      template <class T>
      static void register_instance(const std::string& name, const std::string& type_name, T& inst)
      {
         glz::register_instance(name, type_name, inst);
         void* ptr = glz_get_instance(name.c_str());
         auto t = get_type(type_name);
         instance_registry_[name] = std::make_shared<i_instance>(ptr, t, false);
      }

      // Get a global instance
      static std::shared_ptr<i_instance> get_instance(const std::string& name);

      // List all global instances
      static std::vector<std::string> list_instances();

      // Load a shared library with Glaze types
      static void load_library(const std::string& path);

      // Unload all libraries
      static void unload_all_libraries();

      // JSON serialization helpers
      template <class T>
      static std::string to_json(const T& obj)
      {
         return glz::write_json(obj).value_or("");
      }

      template <class T>
      static T from_json(const std::string& json)
      {
         T obj;
         glz::read_json(obj, json);
         return obj;
      }

      // Reflection utilities
      template <class T>
      static std::vector<std::string> field_names()
      {
         constexpr auto names = glz::reflect<T>::keys;
         std::vector<std::string> result;
         glz::for_each<names.size()>([&]<size_t I>() { result.emplace_back(names[I].data(), names[I].size()); });
         return result;
      }

      // Get field value by name (compile-time known type)
      template <class T, class R>
      static R get_field(T& obj, const std::string& field_name);

      // Set field value by name (compile-time known type)
      template <class T, class V>
      static void set_field(T& obj, const std::string& field_name, V&& val);

      // Call method by name (compile-time known type)
      template <class T, class... Args>
      static auto call_method(T& obj, const std::string& method_name, Args&&... args);
   };

   // Implementation of template methods

   template <class... Args>
   i_value i_instance::call(const std::string& method_name, Args&&... args)
   {
      if (!type_->has_method(method_name)) {
         throw std::runtime_error("method not found: " + method_name);
      }

      const auto& m = type_->get_method(method_name);
      const auto* member_info = m.info_;

      // Convert arguments to void* array
      void* arg_array[sizeof...(Args)] = {const_cast<void*>(static_cast<const void*>(&args))...};
      void** arg_ptr = sizeof...(Args) > 0 ? arg_array : nullptr;

      // Determine return type and allocate result buffer
      // This is simplified - real implementation would handle all types
      void* result_buffer = nullptr;
      i_value result;

      // Call the function through the C API
      void* raw_result =
         glz_call_member_function_with_type(ptr_, type_->name().c_str(), member_info, arg_ptr, result_buffer);

      // Convert raw result to value
      // This would need proper type handling based on method.return_type()
      if (raw_result) {
         // Handle different return types
         // For now, simplified
         result = i_value(); // Placeholder
      }

      return result;
   }

   template <class T, class R>
   R i_glaze::get_field(T& obj, const std::string& field_name)
   {
      // Use compile-time reflection to get field
      R result{};
      bool found = false;

      constexpr auto names = glz::reflect<T>::keys;
      glz::for_each<names.size()>([&]<size_t I>() {
         if (!found && std::string_view(names[I]) == field_name) {
            if constexpr (glz::reflectable<T>) {
               result = glz::get_member(obj, glz::get<I>(glz::to_tie(obj)));
            }
            else {
               result = glz::get_member(obj, glz::get<I>(glz::reflect<T>::values));
            }
            found = true;
         }
      });

      if (!found) {
         throw std::runtime_error("field not found: " + field_name);
      }

      return result;
   }

   template <class T, class V>
   void i_glaze::set_field(T& obj, const std::string& field_name, V&& val)
   {
      bool found = false;

      constexpr auto names = glz::reflect<T>::keys;
      glz::for_each<names.size()>([&]<size_t I>() {
         if (!found && std::string_view(names[I]) == field_name) {
            if constexpr (glz::reflectable<T>) {
               glz::get_member(obj, glz::get<I>(glz::to_tie(obj))) = std::forward<V>(val);
            }
            else {
               glz::get_member(obj, glz::get<I>(glz::reflect<T>::values)) = std::forward<V>(val);
            }
            found = true;
         }
      });

      if (!found) {
         throw std::runtime_error("field not found: " + field_name);
      }
   }

   template <class T, class... Args>
   auto i_glaze::call_method(T& obj, const std::string& method_name, Args&&... args)
   {
      // This would use compile-time reflection to find and call the method
      // Implementation would be similar to get_field/set_field but for methods
      // For now, this is a placeholder
      throw std::runtime_error("method calling not yet implemented for compile-time types");
   }
} // namespace glz