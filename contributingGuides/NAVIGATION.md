# Overview

The navigation in the App consists of top level Stack Navigator (called `RootStack`) with each of its `Screen` components handling different high-level flow. All those flows can be seen in `AuthScreens.js` file.

## Adding RHP flows

Most of the time, if you want to add some of the flows concerning one of your reports, e.g. `Money Request` from an user, you will most probably use `RightModalNavigator.js` and `ModalStackNavigators.js` file:

- Since each of those flows is kind of a modal stack, if you want to add a page to the existing flow, you should just add a page to the correct stack in `ModalStackNavigators.js`.

- If you want to create new flow, add a `Screen` in `RightModalNavigator.js` and make new modal in `ModalStackNavigators.js` with chosen pages.

When creating RHP flows, you have to remember a couple things:

- Since you can deeplink to different pages inside the RHP navigator, it is important to provide the possibility for the user to properly navigate back from any page with UP press (`HeaderWithBackButton` component). An example can be deeplinking to `/settings/profile/personal-details`. From there, when pressing the UP press, you should navigate to `/settings/profile`, so in order for it to work, you should provide the correct route in `onBackButtonPress` prop of `HeaderWithBackButton` (`Navigation.goBack(ROUTES.SETTINGS_PROFILE)` in this example). We use custom `goBack` function to handle both browser and `react-navigation` history stack. Under the hood, it resolves to either replacing the current screen with the one we navigate to (deeplinking scenario) or just going back if we reached the current page by navigating in App. It ensures the requested behaviors on web, which is being navigated back to the place from where you deeplinked when going into RHP flow by it.

- If you want to navigate to a certain report after completing a flow regarding it, e.g. `RequestMoney` flow with certain group/user, you should use `Navigation.dismissModal` with this `reportID` as an argument. If in future we would like to navigate to something different than the report after such flows, the API should be rather easy to change. We do it like that in order to replace the RHP flow with the new report instead of pushing it, so pressing back button does not navigate back to the ending page of the flow. If we were to navigate to the same report, we just pop the RHP modal.

## Performance solutions

- To ensure that the user doesn't ever see frozen report content, we are freezing the screens from 2 levels down the `RootStack` (which contains a `Screen` for each report), so when dismissing with a swipe, the user always sees the content of the previous report.

- We want to freeze as high the view hierarchy as we can, so we do it in the `Screen`s of `RootStack`, being `CentralPaneNavigator` and `SidebarScreen`.

- We want the report content visible as fast as possible, and at the same time we want the navigation animation to trigger instantly, we do a hack with `firstRenderRef` which renders `ReportActionsSkeletonView` instead of the messages at the first render, and the proper content afterwards. It works since there are always more renders of `ReportScreen` before the content shows up (hopefully).
