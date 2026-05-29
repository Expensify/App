#pragma once

#include <cstring>
#include <functional>
#include <memory>
#include <optional>
#include <stdexcept>
#include <string>
#include <string_view>
#include <type_traits>
#include <unordered_map>
#include <vector>

#include "interop.hpp"

// Platform-specific dynamic library loading
#ifdef _WIN32
#include <windows.h>
using LibraryHandle = HMODULE;
#define LOAD_LIBRARY(path) LoadLibraryA(path)
#define GET_SYMBOL(handle, name) GetProcAddress(handle, name)
#define CLOSE_LIBRARY(handle) FreeLibrary(handle)
#else
#include <dlfcn.h>
using LibraryHandle = void*;
#define LOAD_LIBRARY(path) dlopen(path, RTLD_LAZY | RTLD_LOCAL)
#define GET_SYMBOL(handle, name) dlsym(handle, name)
#define CLOSE_LIBRARY(handle) dlclose(handle)
#endif

namespace glz::interop
{
   // Exception class for interop errors
   struct interop_exception : public std::runtime_error
   {
     public:
      explicit interop_exception(const std::string& msg) : std::runtime_error(msg) {}
   };

   // Forward declarations
   struct type_info;
   struct member_info;
   struct instance;
   struct interop_library;

   // Wrapper for member information
   struct member_info
   {
      friend struct type_info;
      friend struct instance;

     private:
      const glz_member_info* info_;
      std::string name_;

     public:
      member_info(const glz_member_info* info, std::string_view name) : info_(info), name_(name) {}
      std::string_view name() const { return name_; }
      bool is_function() const;
      const glz_type_descriptor* type_descriptor() const;
   };

   // Wrapper for type information
   struct type_info
   {
      friend struct interop_library;

     private:
      const glz_type_info* info_;
      std::vector<member_info> members_;
      interop_library* library_;

     public:
      type_info(const glz_type_info* info, interop_library* lib);
      std::string_view name() const;
      size_t size() const;
      size_t member_count() const;

      const member_info* get_member(std::string_view name) const
      {
         for (const auto& member : members_) {
            if (member.name() == name) {
               return &member;
            }
         }
         return nullptr;
      }

      const std::vector<member_info>& members() const { return members_; }
   };

   // Wrapper for an instance of a type
   struct instance
   {
      friend struct interop_library;

     private:
      void* ptr_;
      std::shared_ptr<type_info> type_;
      interop_library* library_;
      bool owned_;

     public:
      instance(void* ptr, std::shared_ptr<type_info> type, interop_library* lib, bool owned = true)
         : ptr_(ptr), type_(type), library_(lib), owned_(owned)
      {}
      ~instance();

      instance(const instance&) = delete;
      instance& operator=(const instance&) = delete;

      instance(instance&& other) noexcept
         : ptr_(other.ptr_), type_(std::move(other.type_)), library_(other.library_), owned_(other.owned_)
      {
         other.ptr_ = nullptr;
         other.owned_ = false;
      }

      instance& operator=(instance&& other) noexcept
      {
         if (this != &other) {
            if (owned_ && ptr_) {
               // Clean up current instance
               // (handled in destructor)
            }
            ptr_ = other.ptr_;
            type_ = std::move(other.type_);
            library_ = other.library_;
            owned_ = other.owned_;
            other.ptr_ = nullptr;
            other.owned_ = false;
         }
         return *this;
      }

      void* ptr() { return ptr_; }
      const void* ptr() const { return ptr_; }
      const type_info& type() const { return *type_; }

      // Get member value
      template <typename T>
         requires has_interop_support<T>
      T get_member(std::string_view member_name) const;

      // Set member value
      template <typename T>
         requires has_interop_support<T>
      void set_member(std::string_view member_name, const T& value);

      // Call member function
      template <typename R = void, typename... Args>
         requires(std::is_void_v<R> || has_interop_support<R>) && (has_interop_support<Args> && ...)
      R call_function(std::string_view function_name, Args&&... args);

      // Get raw member pointer (for advanced use)
      void* get_member_ptr(const member_info& member);
   };

   // Main library wrapper class
   struct interop_library
   {
      friend struct instance;
      friend struct type_info;

     private:
      LibraryHandle handle_ = nullptr;
      std::string path_;

      // Cached function pointers from the library
      struct functions
      {
         // Type info functions
         glz_type_info* (*get_type_info)(const char*) = nullptr;
         glz_type_info* (*get_type_info_by_hash)(size_t) = nullptr;

         // Instance management
         void* (*create_instance)(const char*) = nullptr;
         void (*destroy_instance)(const char*, void*) = nullptr;
         void* (*get_instance)(const char*) = nullptr;
         const char* (*get_instance_type)(const char*) = nullptr;

         // Member access
         void* (*get_member_ptr)(void*, const glz_member_info*) = nullptr;
         void* (*call_member_function_with_type)(void*, const char*, const glz_member_info*, void**, void*) = nullptr;

         // String operations
         glz_string (*string_view)(void*) = nullptr;
         void (*string_set)(void*, const char*, size_t) = nullptr;
         const char* (*string_c_str)(void*) = nullptr;
         size_t (*string_size)(void*) = nullptr;

         // Vector operations
         glz_vector (*vector_view)(void*, const glz_type_descriptor*) = nullptr;
         void (*vector_resize)(void*, const glz_type_descriptor*, size_t) = nullptr;
         void (*vector_push_back)(void*, const glz_type_descriptor*, const void*) = nullptr;

         // String/vector creation for temp arguments
         void* (*create_string)(const char*, size_t) = nullptr;
         void (*destroy_string)(void*) = nullptr;
         void* (*create_vector)(const glz_type_descriptor*) = nullptr;
         void (*destroy_vector)(void*, const glz_type_descriptor*) = nullptr;

         // Optional operations
         bool (*optional_has_value)(void*, const glz_type_descriptor*) = nullptr;
         void* (*optional_get_value)(void*, const glz_type_descriptor*) = nullptr;
         void (*optional_set_value)(void*, const void*, const glz_type_descriptor*) = nullptr;
         void (*optional_reset)(void*, const glz_type_descriptor*) = nullptr;
      } funcs_;

      // Cache of loaded types
      mutable std::unordered_map<std::string, std::shared_ptr<type_info>> type_cache_;

      template <typename T>
      T load_function(const char* name)
      {
         auto* func = reinterpret_cast<T>(GET_SYMBOL(handle_, name));
         if (!func) {
            throw interop_exception(std::string("Failed to load function: ") + name);
         }
         return func;
      }

     public:
      interop_library() = default;

      explicit interop_library(const std::string& library_path) { load(library_path); }

      ~interop_library()
      {
         if (handle_) {
            close();
         }
      }

      // Disable copy, enable move
      interop_library(const interop_library&) = delete;
      interop_library& operator=(const interop_library&) = delete;

      interop_library(interop_library&& other) noexcept
         : handle_(other.handle_),
           path_(std::move(other.path_)),
           funcs_(other.funcs_),
           type_cache_(std::move(other.type_cache_))
      {
         other.handle_ = nullptr;
         other.funcs_ = {};
      }

      interop_library& operator=(interop_library&& other) noexcept
      {
         if (this != &other) {
            if (handle_) {
               close();
            }
            handle_ = other.handle_;
            path_ = std::move(other.path_);
            funcs_ = other.funcs_;
            type_cache_ = std::move(other.type_cache_);
            other.handle_ = nullptr;
            other.funcs_ = {};
         }
         return *this;
      }

      // Load a shared library
      void load(const std::string& library_path);

      // Close the library
      void close();

      // Check if library is loaded
      bool is_loaded() const { return handle_ != nullptr; }

      // Get type information
      std::shared_ptr<type_info> get_type(std::string_view type_name);

      // Create an instance of a type
      std::unique_ptr<instance> create_instance(std::string_view type_name);

      // Get a registered global instance
      std::unique_ptr<instance> get_instance(std::string_view instance_name);

      // List all available types (if the library provides this)
      std::vector<std::string> list_types() const;

      // List all registered instances
      std::vector<std::string> list_instances() const;

      // Get the library path
      const std::string& path() const { return path_; }
   };

   // Template implementations

   template <class T>
      requires has_interop_support<T>
   T instance::get_member(std::string_view member_name) const
   {
      auto* member = type_->get_member(member_name);
      if (!member) {
         throw interop_exception("Member not found: " + std::string(member_name));
      }

      if (member->is_function()) {
         throw interop_exception("Member is a function, not a data member: " + std::string(member_name));
      }

      // Get the member pointer and cast to the appropriate type
      void* member_ptr = const_cast<instance*>(this)->get_member_ptr(*member);

      if constexpr (std::same_as<T, std::string>) {
         // Special handling for strings
         if (library_->funcs_.string_c_str && library_->funcs_.string_size) {
            auto* str_ptr = static_cast<std::string*>(member_ptr);
            const char* c_str = library_->funcs_.string_c_str(str_ptr);
            size_t size = library_->funcs_.string_size(str_ptr);
            return std::string(c_str, size);
         }
      }

      return *static_cast<T*>(member_ptr);
   }

   template <class T>
      requires has_interop_support<T>
   void instance::set_member(std::string_view member_name, const T& value)
   {
      auto* member = type_->get_member(member_name);
      if (!member) {
         throw interop_exception("Member not found: " + std::string(member_name));
      }

      if (member->is_function()) {
         throw interop_exception("Cannot set a function member: " + std::string(member_name));
      }

      // Get the member info and use the setter
      const auto* member_info = member->info_;
      if (member_info && member_info->setter) {
         // Create a copy of the value for the setter
         T value_copy = value;
         member_info->setter(ptr_, &value_copy);
      }
      else {
         throw interop_exception("Member has no setter: " + std::string(member_name));
      }
   }

   template <class R, class... Args>
      requires(std::is_void_v<R> || has_interop_support<R>) && (has_interop_support<Args> && ...)
   R instance::call_function(std::string_view function_name, Args&&... args)
   {
      auto* member = type_->get_member(function_name);
      if (!member) {
         throw interop_exception("Function not found: " + std::string(function_name));
      }

      if (!member->is_function()) {
         throw interop_exception("Member is not a function: " + std::string(function_name));
      }

      // Prepare arguments array
      void* arg_array[sizeof...(Args)] = {const_cast<void*>(static_cast<const void*>(&args))...};
      void** arg_ptr = sizeof...(Args) > 0 ? arg_array : nullptr;

      // Prepare result buffer if needed
      R result{};
      void* result_ptr = nullptr;
      if constexpr (!std::is_void_v<R>) {
         result_ptr = &result;
      }

      // Call the function
      library_->funcs_.call_member_function_with_type(ptr_, type_->name().data(), member->info_, arg_ptr, result_ptr);

      if constexpr (!std::is_void_v<R>) {
         return result;
      }
   }
} // namespace glz::interop