# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
-keep class com.expensify.chat.BuildConfig { *; }
-keep class com.facebook.** { *; }
-keep class com.margelo.nitro.** { *; }
-keep, allowoptimization, allowobfuscation class expo.modules.** { *; }

# Keep generic signature of Call, Response (R8 full mode strips signatures from non-kept items).
-keep,allowobfuscation,allowshrinking interface retrofit2.Call
-keep,allowobfuscation,allowshrinking class retrofit2.Response

# With R8 full mode generic signatures are stripped for classes that are not
# kept. Suspend functions are wrapped in continuations where the type argument
# is used.
-keep,allowobfuscation,allowshrinking class kotlin.coroutines.Continuation

# Added from auto-generated missing_rules.txt to allow build to succeed
-dontwarn com.google.android.gms.safetynet.HarmfulAppsData
-dontwarn com.google.android.gms.safetynet.SafetyNet
-dontwarn com.google.android.gms.safetynet.SafetyNetApi$HarmfulAppsResponse
-dontwarn com.google.android.gms.safetynet.SafetyNetClient
-dontwarn org.slf4j.impl.StaticLoggerBinder

# https://shopify.github.io/react-native-skia/docs/getting-started/installation/#proguard
-keep class com.shopify.reactnative.skia.** { *; }

# Strip verbose and debug log calls from release builds
-assumenosideeffects class android.util.Log {
    public static int d(...);
    public static int v(...);
}
