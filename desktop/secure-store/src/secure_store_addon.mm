#import <Foundation/Foundation.h>
#import "SecureStoreBridge.h"
#include <napi.h>

class SecureStoreAddon : public Napi::ObjectWrap<SecureStoreAddon> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports) {
        Napi::Function func = DefineClass(env, "SecureStoreAddon", {
            InstanceMethod("set", &SecureStoreAddon::Set),
            InstanceMethod("get", &SecureStoreAddon::Get),
            InstanceMethod("delete", &SecureStoreAddon::Delete)
        });

        Napi::FunctionReference* constructor = new Napi::FunctionReference();
        *constructor = Napi::Persistent(func);
        env.SetInstanceData(constructor);

        exports.Set("SecureStoreAddon", func);
        return exports;
    }

    SecureStoreAddon(const Napi::CallbackInfo& info)
        : Napi::ObjectWrap<SecureStoreAddon>(info) {
    }

private:
    Napi::Value Set(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();

        if (info.Length() < 2 || !info[0].IsString() || !info[1].IsString()) {
            Napi::TypeError::New(env, "Expected (string, string) arguments").ThrowAsJavaScriptException();
            return env.Undefined();
        }

        std::string key = info[0].As<Napi::String>();
        std::string value = info[1].As<Napi::String>();

        NSString* nsKey = [NSString stringWithUTF8String:key.c_str()];
        NSString* nsValue = [NSString stringWithUTF8String:value.c_str()];

        [SecureStoreBridge setItem:nsKey value:nsValue];

        return env.Undefined();
    }

    Napi::Value Get(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();

        if (info.Length() < 1 || !info[0].IsString()) {
            Napi::TypeError::New(env, "Expected string argument").ThrowAsJavaScriptException();
            return env.Null();
        }

        std::string key = info[0].As<Napi::String>();
        NSString* nsKey = [NSString stringWithUTF8String:key.c_str()];
        NSString* result = [SecureStoreBridge getItem:nsKey];

        if (result == nil) {
            return env.Null();
        }

        return Napi::String::New(env, [result UTF8String]);
    }

    Napi::Value Delete(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();

        if (info.Length() < 1 || !info[0].IsString()) {
            Napi::TypeError::New(env, "Expected string argument").ThrowAsJavaScriptException();
            return env.Undefined();
        }

        std::string key = info[0].As<Napi::String>();
        NSString* nsKey = [NSString stringWithUTF8String:key.c_str()];

        [SecureStoreBridge deleteItem:nsKey];

        return env.Undefined();
    }
};

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    return SecureStoreAddon::Init(env, exports);
}

NODE_API_MODULE(secure_store_addon, Init)
