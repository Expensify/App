#import <Foundation/Foundation.h>
#import "SecureStoreBridge.h"
#import "secure_store_addon-Swift.h"
#include <napi.h>

class SetAsyncWorker : public Napi::AsyncWorker {
public:
    SetAsyncWorker(Napi::Env env, NSString* key, NSString* value, SecureStoreOptions* options)
        : Napi::AsyncWorker(env),
          key((__bridge_retained CFStringRef)key),
          value((__bridge_retained CFStringRef)value),
          options((__bridge_retained CFTypeRef)options),
          deferred(Napi::Promise::Deferred::New(env)) {
    }

    ~SetAsyncWorker() {
        if (key) CFRelease(key);
        if (value) CFRelease(value);
        if (options) CFRelease(options);
        if (error) CFRelease(error);
    }

    void Execute() override {
        dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
        __block CFErrorRef blockError = nil;

        NSString* nsKey = (__bridge NSString*)key;
        NSString* nsValue = (__bridge NSString*)value;
        SecureStoreOptions* nsOptions = (__bridge SecureStoreOptions*)options;

        [SecureStoreBridge setSecret:nsKey value:nsValue options:nsOptions completion:^(NSError* err) {
            if (err) {
                blockError = (__bridge_retained CFErrorRef)err;
            }
            dispatch_semaphore_signal(semaphore);
        }];

        dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
        error = blockError;
    }

    void OnOK() override {
        if (error) {
            NSError* nsError = (__bridge NSError*)error;
            NSString* errorMsg = [NSString stringWithFormat:@"[SecureStore Error] Domain: %@, Code: %ld, Description: %@",
                                  nsError.domain, (long)nsError.code, nsError.localizedDescription];
            Napi::Error err = Napi::Error::New(Env(), [errorMsg UTF8String]);
            deferred.Reject(err.Value());
        } else {
            deferred.Resolve(Env().Undefined());
        }
    }

    void OnError(const Napi::Error& e) override {
        deferred.Reject(e.Value());
    }

    Napi::Promise GetPromise() {
        return deferred.Promise();
    }

private:
    CFStringRef key = nil;
    CFStringRef value = nil;
    CFTypeRef options = nil;
    CFErrorRef error = nil;
    Napi::Promise::Deferred deferred;
};

class SecureStoreAddon : public Napi::ObjectWrap<SecureStoreAddon> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports) {
        Napi::Function func = DefineClass(env, "SecureStoreAddon", {
            InstanceMethod("set", &SecureStoreAddon::Set),
            InstanceMethod("get", &SecureStoreAddon::Get),
            InstanceMethod("delete", &SecureStoreAddon::Delete),
            InstanceMethod("canUseAuthentication", &SecureStoreAddon::CanUseAuthentication)
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
    SecureStoreOptions* ParseOptions(Napi::Env env, const Napi::Value& optionsValue) {
        if (optionsValue.IsUndefined() || optionsValue.IsNull()) {
            return [SecureStoreOptions defaultOptions];
        }

        if (!optionsValue.IsObject()) {
            return [SecureStoreOptions defaultOptions];
        }

        Napi::Object optionsObj = optionsValue.As<Napi::Object>();
        SecureStoreOptions* options = [SecureStoreOptions defaultOptions];

        if (optionsObj.Has("authenticationPrompt")) {
            Napi::Value promptValue = optionsObj.Get("authenticationPrompt");
            if (promptValue.IsString()) {
                std::string prompt = promptValue.As<Napi::String>();
                options.authenticationPrompt = [NSString stringWithUTF8String:prompt.c_str()];
            }
        }

        if (optionsObj.Has("keychainAccessible")) {
            Napi::Value accessibleValue = optionsObj.Get("keychainAccessible");
            if (accessibleValue.IsNumber()) {
                int accessible = accessibleValue.As<Napi::Number>().Int32Value();
                options.keychainAccessible = (SecureStoreAccessible)accessible;
            }
        }

        if (optionsObj.Has("keychainService")) {
            Napi::Value serviceValue = optionsObj.Get("keychainService");
            if (serviceValue.IsString()) {
                std::string service = serviceValue.As<Napi::String>();
                options.keychainService = [NSString stringWithUTF8String:service.c_str()];
            }
        }

        if (optionsObj.Has("requireAuthentication")) {
            Napi::Value authValue = optionsObj.Get("requireAuthentication");
            if (authValue.IsBoolean()) {
                options.requireAuthentication = authValue.As<Napi::Boolean>().Value();
            }
        }

        if (optionsObj.Has("accessGroup")) {
            Napi::Value groupValue = optionsObj.Get("accessGroup");
            if (groupValue.IsString()) {
                std::string group = groupValue.As<Napi::String>();
                options.accessGroup = [NSString stringWithUTF8String:group.c_str()];
            }
        }

        return options;
    }

    Napi::Value Set(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();

        if (info.Length() < 2 || !info[0].IsString() || !info[1].IsString()) {
            Napi::TypeError::New(env, "Expected (string, string, [options]) arguments").ThrowAsJavaScriptException();
            return env.Undefined();
        }

        std::string key = info[0].As<Napi::String>();
        std::string value = info[1].As<Napi::String>();

        NSString* nsKey = [NSString stringWithUTF8String:key.c_str()];
        NSString* nsValue = [NSString stringWithUTF8String:value.c_str()];

        SecureStoreOptions* options = info.Length() >= 3 ? ParseOptions(env, info[2]) : [SecureStoreOptions defaultOptions];

        SetAsyncWorker* worker = new SetAsyncWorker(env, nsKey, nsValue, options);
        Napi::Promise promise = worker->GetPromise();
        worker->Queue();

        return promise;
    }

    Napi::Value Get(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();

        if (info.Length() < 1 || !info[0].IsString()) {
            Napi::TypeError::New(env, "Expected (string, [options]) arguments").ThrowAsJavaScriptException();
            return env.Null();
        }

        std::string key = info[0].As<Napi::String>();
        NSString* nsKey = [NSString stringWithUTF8String:key.c_str()];

        SecureStoreOptions* options = info.Length() >= 2 ? ParseOptions(env, info[1]) : [SecureStoreOptions defaultOptions];

        NSError* error = nil;
        NSString* result = [SecureStoreBridge getSecret:nsKey options:options error:&error];

        if (error) {
            Napi::Error::New(env, [[error localizedDescription] UTF8String]).ThrowAsJavaScriptException();
            return env.Null();
        }

        if (result == nil) {
            return env.Null();
        }

        return Napi::String::New(env, [result UTF8String]);
    }

    Napi::Value Delete(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();

        if (info.Length() < 1 || !info[0].IsString()) {
            Napi::TypeError::New(env, "Expected (string, [options]) arguments").ThrowAsJavaScriptException();
            return env.Undefined();
        }

        std::string key = info[0].As<Napi::String>();
        NSString* nsKey = [NSString stringWithUTF8String:key.c_str()];

        SecureStoreOptions* options = info.Length() >= 2 ? ParseOptions(env, info[1]) : [SecureStoreOptions defaultOptions];

        NSError* error = nil;
        [SecureStoreBridge deleteSecret:nsKey options:options error:&error];

        if (error) {
            Napi::Error::New(env, [[error localizedDescription] UTF8String]).ThrowAsJavaScriptException();
        }

        return env.Undefined();
    }

    Napi::Value CanUseAuthentication(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();
        BOOL canUse = [SecureStoreBridge canUseAuthentication];
        return Napi::Boolean::New(env, canUse);
    }
};

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    return SecureStoreAddon::Init(env, exports);
}

NODE_API_MODULE(secure_store_addon, Init)
