# Overview

"Sign in with Apple" and "Sign in with Google" are multi-platform sign-in methods. Both Apple and Google provide official tools, but we have to manage the fact that the behavior, APIs, and constraints for each of those tools varies quite a bit. The architecture of Apple and Google sign-in aims to provide as consistent a user experience and implementation as possible, but our options are limited by Apple and Google. This document will describe the user experience, tooling, and options available on each and why this feature is implemented the way it is.

## Terms

The **client app**, or **client**: this refers to the application that is attempting to access a user's resources hosted by a third party. In this case, this is the Expensify app.

The **third party**: this is any other service that the client app (Expensify) wants to interact with on behalf of a user. In this case, Apple or Google. Since this flow is specifically concerned with authentication, it may also be called the **third-party authentication provider**.

**Third-party sign-in**: a general phrase to refer to either "Sign in with Apple" or "Sign in with Google" (or any future similar features). Any authentication method that involves authentication with a service not provided by Expensify.

## How third-party sign-in works

When the user signs in to the app with a third party like Apple or Google, there is a general flow used by all of them:

1. The user presses a button within the client app to start their preferred sign-in process.
2. The user is sent to a UI owned by the third-party to sign in (e.g., the Google sign-in web page hosted by Google, or the Sign in with Apple bottom sheet provided by iOS).
3. When the user successfully signs in with the third party, the third party generates a token and sends it back to the client app.
4. The client app sends the token to the client backend API, where the token is verified and the user's email is extracted from the token, and the user is signed in.

Both services also require registering a "client ID", along with some configuration we'll explain next. For apps that aren't built using XCode, Apple calls this a "service ID", and it can be configured under "[Services IDs](https://developer.apple.com/account/resources/identifiers/list/serviceId)" in "Certificates, Identifiers & Profiles" in the Apple Developer console. (For apps made using XCode, like the iOS app, the bundle identifier is used as the client ID.) For Google, this configuration is done under "[Credentials](https://console.cloud.google.com/apis/credentials)" in the Google Cloud console.

### On web

We'll cover web details first, because web is treated as the "general use" case for services like this, and then platform-specific tools are built on top of that, which we'll cover afterwards.

Both services also provide official Javascript libraries for integrating their services on web platforms. Using these libraries offers improved security and decreased maintenance burden over using the APIs directly, as Google notes while they heavily discourage using their auth APIs directly; but they also add additional constraints, which will be described later in the document.

How the third party sends the token in step 3 depends on the third party's implementation and the app's configuration. In both Apple and Google's case, there are two main modes: "pop-up", and "redirect".

#### Redirect mode

From the user's perspective, redirect mode will usually look like opening the third party's sign-in page in the same browser window, and then redirecting back to the client app in that window. But re-use of the same window isn't required. The key point is the redirection back to the client app, via the third-party sign-in form making an HTTPS request.

In both the Google and Apple JS libraries, the request endpoint, found at the "redirect URI", must handle a POST request with form data in the body, which contains the token we need to send to the client back-end API. This pattern is not easily implemented with the existing single-page web app, and so we use the other mode: "pop-up mode".

The redirect URI must match a URI in the Google or Apple client ID configuration.

#### Pop-up mode

Pop-up mode opens a pop-up window to show the third-party sign-in form. But it also changes how tokens are given to the client app. Instead of an HTTPS request, they are returned by the JS libraries in memory, either via a callback (Google) or a promise (Apple).

Apple and Google both check that the client app is running on an allowed domain. The sign-in process will fail otherwise. Google allows localhost, but Apple does not, and so testing Apple in development environments requires hosting the client app on a domain that the Apple client ID (or "service ID", in Apple's case) has been configured with.

In the case of Apple, sometimes it will silently fail at the very end of the sign-in process, where the only sign that something is wrong is that the pop-up fails to close. In this case, it's very likely that configuration mismatch is the issue.

In addition, Apple will require a valid redirect URI be provided in the library's configuration, even though it is not used.

### Considerations for non-web platforms

For apps that aren't web-based, there are other options:

Sign in with Google provides libraries on [Android](https://developers.google.com/identity/sign-in/android/start) and [iOS](https://developers.google.com/identity/sign-in/ios/start) to use that will authenticate the mobile app is who it says it is, via app signing. For React Native, we use the [react-native-google-signin](https://github.com/react-native-google-signin/google-signin) wrapper to use these libraries.

The [iOS implementation for Sign in with Apple](https://developer.apple.com/documentation/authenticationservices/implementing_user_authentication_with_sign_in_with_apple?language=objc) can also verify the app's bundle ID and the team who signed it. We use the [react-native-apple-authentication](https://github.com/invertase/react-native-apple-authentication) wrapper library for this.

There is no official library for Sign in with Apple on Android, so it has to work with the web tooling; but Android can't meet the requirements of the official JS library. It isn't hosted on a domain, which is required for pop-up flow, and can't receive an HTTPS request, which is required for redirect flow with the official JS library. To deal with this, react-native-apple-authentication's implementation uses a webview on Android, which can intercept the redirect POST and pass the data directly to the react-native app.

#### Issues with third-party sign-in and Electron

These tools aren't built with Electron or similar desktop apps in mind, and that presents similar challenges as Sign in with Apple for Android:

1. Like mobile platforms, Electron does not have the option of validating the origin of the client app authentication request using a registered HTTPS domain
2. Unlike many mobile platforms, there are not official tools for Electron or desktop apps in general.
3. Attempts to get Electron to work like web are either blocked by the third-party authentication provider, broken, or inadvisable.

These are the specific issues we've seen:

1. [Google stopped allowing its sign-in page to render inside embedded browser frameworks](https://security.googleblog.com/2019/04/better-protection-against-man-in-middle.html) such as Electron. This means we can't open the sign-in flow inside the an Electron window. However, opening the sign-in form in the user's default web browser did work.
2. On the other hand, opening the Sign in with Apple form in the user's default browser instead of Electron does _not_ work, and renders an Apple page with an empty body instead of the sign-in form.

We decided to instead redirect the user to a dedicated page in the web app to sign in. Apple and Google each have their own routes, `/sign-in-with-apple` and `/sign-in-with-google`, where the user is shown another button to click to start the sign-in process on web (since it shows a pop-up, the user must click the button directly, otherwise the pop-up would be blocked). After signing in, the user will be shown a deep link prompt in the browser to open the desktop app, where they will be signed in using a short-lived token from the Expensify API.

Due to Expensify's expectation that a user will be using the same account on web and desktop, we do not go through this process if the user was already signed in, but instead the web app prompts the user to go back to desktop again, which will also sign them in on the desktop app.

## Additional design constraints

### New Google web library limits button style choices

The current Sign in with Google library for web [does not allow arbitrary customization of the sign-in button](https://developers.google.com/identity/gsi/web/guides/offerings#sign_in_with_google_button). (The recently deprecated version of the Sign in with Google for web did offer this capability.)

This means the button is limited in design: there are no offline or hover states, and there can only be a white background for the button. We were able to get the official Apple button options to match, so we used the Google options as the starting point for the design. 

### Sign in with Apple does not allow `localhost`

Unlike Google, Apple does not allow `localhost` as a domain to host a pop-up or redirect to. In order to test Sign in with Apple on web or desktop, this means we have to:

1. Use SSH tunneling to host the app on an HTTPS domain
2. Create a test Apple Service ID configuration in the Apple developer console, to allow testing the sign-in flow from its start until the point Apple sends its token to the Expensify app.
3. Use token interception on Android to test the web and desktop sign-in flow from the point where the front-end Expensify app has received a token, until the point where the user is signed in to Expensify using that token.

These steps are covered in more detail in the "testing" section below.

# Testing Apple/Google sign-in

Due to some technical constraints, Apple and Google sign-in may require additional configuration to be able to work in the development environment as expected. This document describes any additional steps for each platform. 

## Apple

### iOS/Android

The iOS and Android implementations do not require extra steps to test, aside from signing into an Apple account on the iOS device before being able to use Sign in with Apple.

### Web and desktop

#### Render the web Sign In with Apple button in development

The Google Sign In button renders differently in development mode. To prevent confusion
for developers about a possible regression, we decided to not render third party buttons in
development mode.

To show the Apple Sign In button in development mode, you can comment out the following code in the 
LoginForm.js file:

```js
if (CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.DEV) {
  return;
}
```

#### Port requirements

The Sign in with Apple process will break after the user signs in if the pop-up process is not started from a page at an HTTPS domain registered with Apple. To fix this, you could make a new configuration with your own HTTPS domain, but then the Apple configuration won't match that of Expensify's backend.

So to be able to test this, we have two parts:
1. Create a valid Sign in with Apple token using valid configuration for the Expensify app, by creating and intercepting one on Android
2. Host the development web app at an HTTPS domain using SSH tunneling, and in the web app use a custom Apple config with this HTTPS domain registered

Requirements:
1. Authorization on an Apple Development account or team to create new Service IDs
2. An SSH tunneling tool that provides static HTTPS domains. [ngrok](https://ngrok.com) is a good choice that provides one static HTTPS domain for a free account.

#### Generate the token to use

**Note**: complete this step before changing other configuration to test Apple on web and desktop, as updating those will cause Android to stop working while the configuration is changed.

On an Android build, alter the `AppleSignIn` component to log the token generated, instead of sending it to the Expensify API:

```js
//          .then((token) => Session.beginAppleSignIn(token))
            .then((token) => console.log("TOKEN: ", token))
```

If you need to check that you received the correct data, check it on [jwt.io](https://jwt.io), which will decode it if it is a valid JWT token. It will also show when the token expires.

Hardcode this token into `Session.beginAppleSignIn`, and but also verify a valid token was passed into the function, for example:

```
function beginAppleSignIn(idToken) {
+   // Show that a token was passed in, without logging the token, for privacy
+   window.alert(`ORIGINAL ID TOKEN LENGTH: ${idToken.length}`);
+   const hardcodedToken = '...';
    const {optimisticData, successData, failureData} = signInAttemptState();
+   API.write('SignInWithApple', {idToken: hardcodedToken}, {optimisticData, successData, failureData});
-   API.write('SignInWithApple', {idToken}, {optimisticData, successData, failureData});
}
```

#### Configure the SSH tunneling

You can use any SSH tunneling service that allows you to configure custom subdomains so that we have a consistent address to use. We'll use ngrok in these examples, but ngrok requires a paid account for this. If you need a free option, try serveo.net.

After you've set ngrok up to be able to run on your machine (requires configuring a key with the command line tool, instructions provided by the ngrok website after you create an account), test hosting the web app on a custom subdomain. This example assumes the development web app is running at `localhost:8082`:

```
ngrok http 8082 --host-header="localhost:8082" --subdomain=mysubdomain
```

The `--host-header` flag is there to avoid webpack errors with header validation. In addition, add `allowedHosts: 'all'` to the dev server config in `webpack.dev.js`:

```js
devServer: {
  ...,
  allowedHosts: 'all',
}
```

#### Configure Apple Service ID

Now that you have an HTTPS address to use, you can create an Apple Service ID configuration that will work with it.

1. Create a new app ID on your Apple development team that can be used to test this, following the instructions [here](https://github.com/invertase/react-native-apple-authentication/blob/main/docs/INITIAL_SETUP.md).
2. Create a new service ID following the instructions [here](https://github.com/invertase/react-native-apple-authentication/blob/main/docs/ANDROID_EXTRA.md). For allowed domains, enter your SSH tunnel address (e.g., `https://mysubdomain.ngrok-free.app`), and for redirect URLs, just make up an endpoint, it's never actually invoked (e.g., `mysubdomain.ngrok-free.app/appleauth`).

Notes: 
- Depending on your Apple account configuration, you may need additional permissions to access some of the features described in the instructions above.
- While the Apple Sign In configuration requires a `clientId`, the Apple Developer console calls this a `Service ID`.

Finally, edit `.env` to use your client (service) ID and redirect URL config:

```
ASI_CLIENTID_OVERRIDE=com.example.test
ASI_REDIRECTURI_OVERRIDE=https://mysubdomain.ngrok-free.app/appleauth
```

#### Run the app

Remember that you will need to restart the web server if you make a change to the `.env` file.

### Desktop

Desktop will require the same configuration, with these additional steps:

#### Configure web app URL in .env

Add `NEW_EXPENSIFY_URL` to .env, and set it to the HTTPS URL where the web app can be found, for example:

```
NEW_EXPENSIFY_URL=https://subdomain.ngrok-free.app
```

This is required because the desktop app needs to know the address of the web app, and must open it at the HTTPS domain configured to work with Sign in with Apple.

Note that changing this value to a domain that isn't configured for use with Expensify will cause Android to break, as it is still using the real client ID, but now has an incorrect value for `redirectURI`.

#### Set Environment to something other than "Development"

The DeepLinkWrapper component will not handle deep links in the development environment. To be able to test deep linking, you must set the environment to something other than "Development".

Within the `.env` file, set `envName` to something other than "Development", for example:

```
envName=Staging
```

Alternatively, within the `DeepLinkWrapper/index.website.js` file you can set the `CONFIG.ENVIRONMENT` to something other than "Development".

#### Handle deep links in dev on MacOS

If developing on MacOS, the development desktop app can't handle deeplinks correctly. To be able to test deeplinking back to the app, follow these steps:

1. Create a "real" build of the desktop app, which can handle deep links, open the build folder, and install the dmg there:

```
npm run desktop-build --publish=never
open desktop-build
# Then double-click "NewExpensify.dmg" in Finder window
```

2. Even with this build, the deep link may not be handled by the correct app, as the development Electron config seems to intercept it sometimes. To manage this, install [SwiftDefaultApps](https://github.com/Lord-Kamina/SwiftDefaultApps), which adds a preference pane that can be used to configure which app should handle deep links.

## Google

### Web

#### Render the web Sign In with Google button in Development

The Google Sign In button renders differently in development mode. To prevent confusion
for developers about a possible regression, we decided to not render third party buttons in
development mode.

To show the Google Sign In button in development mode, you can comment out the following code in the 
LoginForm.js file:

```js
if (CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.DEV) {
  return;
}
```

#### Port requirements

Google allows the web app to be hosted at localhost, but according to the
current Google console configuration for the Expensify client ID, it must be
hosted on port 8082.

### Desktop

#### Set Environment to something other than "Development"

The DeepLinkWrapper component will not handle deep links in the development environment. To be able to test deep linking, you must set the environment to something other than "Development".
