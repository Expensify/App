## Follow these steps to build the App on Physical IOS Device:

1. **Plug in your device via USB**

   Connect your iOS device to your Mac using a USB cable. Navigate to the `ios` folder in project, then open the `.xcworkspace` file in Xcode.  
> [!Note]
>If this is your first time running an app on your iOS device, you may need to register your device for development. Open the Product menu from Xcode's menubar, then go to Destination. Look for and select your device from the list. Xcode will then register your device for development.

2. **Configure code signing**
	 
> [!Important]
> You must have a Apple Developer account to run your app on a physical device. If you don't have one, you can register here: [Apple Developer Program](https://developer.apple.com/).

   2.1. Go to `Signing and Capabilities`, then in the section called `Signing (Debug/Development and Release/Development)`
   
   ![Step 2.1 Screenshot](https://github.com/Expensify/App/assets/104348397/4c668612-ab29-4a91-8e2d-a146e2940017)
   
   2.2. Enable `Automatically manage Signing`
   
   2.3. Pick your personal team
   
   2.4. Change the bundle identifier to something unique like `com.yourname.expensify.chat.dev`
   
   ![Step 2.4 Screenshot](https://github.com/Expensify/App/assets/104348397/4ce3f250-4b7c-4e7c-9f1d-09df7bdfc5e0)

> [!Note]
>Please be aware that the app built with your own bundle id doesn't support authenticated services like push notification, Apple signin, deeplinking etc. which should be only available in Expensify developer account.
   
   2.5. Scroll down and Remove Associated Domains, Communication Notifications, Push Notifications, and Sign In With Apple capabilities

   ![Step 2.6 Screenshot](https://github.com/Expensify/App/assets/104348397/850d35ac-ca49-4d44-8e3b-0b4ad10509d3)

   2.6. Go to the `NotificationService` target and repeat Steps 2.2-2.4
   
   2.7. Go to the `Tests` target and repeat Steps 2.2-2.4
   
   ![Step 2.7 Screenshot](https://github.com/Expensify/App/assets/104348397/ad9fcc8e-10ad-40ca-9fb5-c67aec5dbdce)

3. **Build and Run your app**

   If everything is set up correctly, your device will be listed as the build target in the Xcode toolbar, and it will also appear in the Devices pane (Shift ⇧ + Cmd ⌘ + 2). You can now press the Build and run button (Cmd ⌘ + R) or select Run from the Product menu. Your app will launch on your device shortly.
