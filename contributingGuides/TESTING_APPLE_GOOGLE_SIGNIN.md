# Testing Apple/Google sign-in

Due to some technical constraints, Apple and Google sign-in may require additional configuration to be able to work in the development environment as expected. This document describes any additional steps for each platform. 

## Apple

### Web

The Sign in with Apple process will break after the user signs in if the pop-up process is not started from a page at an HTTPS domain registered with Apple. To fix this, you could make a new configuration with your own HTTPS domain, but then the Apple configuration won't match that of Expensify's backend.

So to be able to test this, we have two parts:
1. Create a valid Sign in with Apple token using valid configuration for the Expensify app, by creating and intercepting one on Android
2. Host the development web app at an HTTPS domain using SSH tunneling, and in the web app use a custom Apple config wiht this HTTPS domain registered

Requirements:
1. Authorization on an Apple Development account or team to create new Service IDs
2. A paid ngrok.io account, to be able to use custom subdomains, or use serveo.net for a free alternative (must be signed in to use custom subdomains)

#### Generate the token to use

On an Android build, alter the `AppleSignIn` component to log the token generated, instead of sending it to the Expensify API:

```js
//          .then((token) => Session.beginAppleSignIn(token))
            .then((token) => console.log("TOKEN: ", token))
```

If you need to check that you received the correct data, check it on [jwt.io](https://jwt.io), which will decode it if it is a valid JWT token. It will also show when the token expires.

Add this token to a `.env` file at the root of the project:

```
ASI_TOKEN_OVERRIDE="..."
```

#### Configure the SSH tunneling

You can use any SSH tunneling service that allows you to configure custom subdomains so that we have a consistent address to use. We'll use ngrok in these examples, but ngrok requires a paid account for this. If you need a free option, try serveo.net.

After you've set ngrok up to be able to run on your machine (requires configuring a key with the command line tool), test hosting the web app on a custom subdomain. This example assumes the development web app is running at `localhost:8080`:

```
ngrok http 8080 --host-header="localhost:8080" --subdomain=mysubdomain
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
2. Create a new service ID following the instructions [here](https://github.com/invertase/react-native-apple-authentication/blob/main/docs/ANDROID_EXTRA.md). For allowed domains, enter your SSH tunnel address (e.g., `https://mysubdomain.ngrok.io`), and for redirect URLs, just make up an endpoint, it's never actually invoked (e.g., `mysubdomain.ngrok.io/appleauth`).

Notes: 
- Depending on your Apple account configuration, you may need additional permissions to access some of the features described in the instructions above.
- While the Apple Sign In configuration requires a `clientId`, the Apple Developer console calls this a `Service ID`.

Finally, edit `.env` to use your client (service) ID and redirect URL config:

```
ASI_CLIENTID_OVERRIDE=com.example.test
ASI_REDIRECTURI_OVERRIDE=https://mysubdomain.ngrok.io/appleauth
```

#### Run the app

Remember that you will need to restart the web server if you make a change to the `.env` file.

### Desktop

Desktop will require the same configuration, with these additional steps:

#### Configure web app URL in .env

Add `NEW_EXPENSIFY_URL` to .env, and set it to the HTTPS URL where the web app can be found, for example:

```
NEW_EXPENSIFY_URL=https://subdomain.ngrok.io
```

This is required because the desktop app needs to know the address of the web app, and must open it at
the HTTPS domain configured to work with Sign in with Apple.

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

#### Port requirements

Google allows the web app to be hosted at localhost, but according to the current Google console configuration, it must be hosted on port 8080.

#### Visual differences

Google's web button has a visible rectangular iframe around it when the app is running at `localhost`. When the app is hosted at an HTTPS address, this iframe is not shown.
