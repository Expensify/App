#ifndef macros_h
#define macros_h

#define HOSTFN(name, basecount) \
jsi::Function::createFromHostFunction( \
rt, \
jsi::PropNameID::forAscii(rt, name), \
basecount, \
[=](jsi::Runtime &rt, const jsi::Value &thisValue, const jsi::Value *args, size_t count) -> jsi::Value

#define JSIFN(capture)                                         \
capture(jsi::Runtime &runtime, const jsi::Value &thisValue, \
const jsi::Value *arguments, size_t count)          \
->jsi::Value

#endif /* macros_h */
