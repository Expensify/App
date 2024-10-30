# Overview

The navigation in the App consists of a top-level Stack Navigator (called `RootStack`) with each of its `Screen` components handling different high-level flow. All those flows can be seen in `AuthScreens.tsx` file.

## Terminology

`RHP` - Right hand panel that shows content inside a dismissible modal that takes up a partial portion of the screen on large format devices e.g. desktop/web/tablets. On smaller screens, the content shown in the RHP fills the entire screen.

Navigation Actions - User actions correspond to resulting navigation actions that we will define now. The navigation actions are: `Back`, `Up`, `Dismiss`, `Forward` and `Push`.

- `Back` - Moves the user “back” in the history stack by popping the screen or stack of screens. Note: This can potentially make the user exit the app itself (native) or display a previous app (not Expensify), or just the empty state of the browser.

- `Up` - Pops the current screen off the current stack. This action is very easy to confuse with `Back`. Unless you’ve navigated from one screen to a nested screen in a stack of screens, these actions will almost always be the same. Unlike a “back” action, “up” should never result in the user exiting the app and should only be an option if there is somewhere to go “up” to.

- `Dismiss` - Closes any modals (outside the navigation hierarchy) or pops a nested stack of screens off returning the user to the previous screen in the main stack.

- `Forward` - This will take you forward in the history stack. Can only be invoked after you have gone `Back` at least once. Note: Only possible on web.

- `Push` - Either adds a new individual screen to the main stack or a nested stack of screens to the main stack with the user pointed at the last index of the pushed stack.

## Adding RHP flows

Most of the time, if you want to add some of the flows concerning one of your reports, e.g. `Money Request` from a user, you will most probably use `RightModalNavigator.tsx` and `ModalStackNavigators.tsx` file:

- Since each of those flows is kind of a modal stack, if you want to add a page to the existing flow, you should just add a page to the correct stack in `ModalStackNavigators.tsx`.

- If you want to create new flow, add a `Screen` in `RightModalNavigator.tsx` and make new modal in `ModalStackNavigators.tsx` with chosen pages.

When creating RHP flows, you have to remember a couple of things:

- Since you can deeplink to different pages inside the RHP navigator, it is important to provide the possibility for the user to properly navigate back from any page with UP press (`HeaderWithBackButton` component).

- An example can be deeplinking to `/settings/profile/timezone/select`. From there, when pressing the UP button, you should navigate to `/settings/profile/timezone`, so in order for it to work, you should provide the correct route in `onBackButtonPress` prop of `HeaderWithBackButton` (`Navigation.goBack(ROUTES.SETTINGS_PROFILE)` in this example). 

- We use a custom `goBack` function to handle the browser and the `react-navigation` history stack. Under the hood, it resolves to either replacing the current screen with the one we navigate to (deeplinking scenario) or just going back if we reached the current page by navigating in App (pops the screen). It ensures the requested behaviors on web, which is navigating back to the place from where you deeplinked when going into the RHP flow by it.

- If you want to navigate to a certain report after completing a flow related to it, e.g. `RequestMoney` flow with a certain group/user, you should use `Navigation.dismissModal` with this `reportID` as an argument. If, in the future, we would like to navigate to something different than the report after such flows, the API should be rather easy to change. We do it like that in order to replace the RHP flow with the new report instead of pushing it, so pressing the back button does not navigate back to the ending page of the flow. If we were to navigate to the same report, we just pop the RHP modal.

### Example of usage

An example of adding `Settings_Workspaces` page:

1. Add the page name to `SCREENS.ts` which will be reused throughout the app (linkingConfig, navigators, etc.):
    
```ts
const SCREENS = {
    SETTINGS: {
        WORKSPACES: 'Settings_Workspaces',
    },
} as const;
```

2. Add path to `ROUTES.ts`: https://github.com/Expensify/App/blob/main/src/ROUTES.ts

```ts
export const ROUTES = {
    // static route
    SETTINGS_WORKSPACES: 'settings/workspaces',
    // dynamic route
    SETTINGS_WORKSPACES: {
        route: 'settings/:accountID',
        getRoute: (accountID: number) => `settings/${accountID}` as const,
    },
};

```

3. Add `Settings_Workspaces` page to proper RHP flow in `linkingConfig.ts`: https://github.com/Expensify/App/blob/fbc11ca729ffa4676fb3bc8cd110ac3890debff6/src/libs/Navigation/linkingConfig.ts#L47-L50

4. Add your page to proper navigator (it should be aligned with where you've put it in the previous step) https://github.com/Expensify/App/blob/fbc11ca729ffa4676fb3bc8cd110ac3890debff6/src/libs/Navigation/AppNavigator/ModalStackNavigators.js#L141

5. Make sure `HeaderWithBackButton` leads to the previous page in navigation flow of your page: https://github.com/Expensify/App/blob/3531af22dcadaa94ed11eccf370517dca0b8c305/src/pages/workspace/WorkspacesListPage.js#L186

## Performance solutions

Using [react-freeze](https://github.com/software-mansion/react-freeze) allows us to increase performance by avoiding unnecessary re-renders of screens that aren’t visible to the user anyway.

- To ensure that the user doesn't ever see frozen report content, we are freezing the screens from 2 levels down the `RootStack` (which contains a `Screen` for each report), so when dismissing with a swipe, the user always sees the content of the previous report.

- We want to freeze as high in the view hierarchy as we can, so we do it in a `Screen` of `RootStack`, being `CentralPaneNavigator` and `SidebarScreen`.

- We want the report content visible as fast as possible, and at the same time we want the navigation animation to trigger instantly. To do so, we do a hack with `firstRenderRef` which renders `ReportActionsSkeletonView` instead of the messages at the first render, and the proper content afterward. It works since there are always more renders of `ReportScreen` before the content shows up (hopefully).

## Handling wide and narrow layouts

- The wide and narrow layouts are conditionally rendered with different components in `createResponsiveNavigator` depending on screen size (`isSmallScreen` prop from the `withWindowDimension.js`).

- The wide layout is rendered with our custom `ThreePaneView.js` and the narrow layout is rendered with `StackView` from `@react-navigation/stack`

- To make sure that we have the correct navigation state after changing the layout, we need to force react to create new instance of the `NavigationContainer`. Without this, the navigation state could be broken after changing the type of layout.

- We are getting the new instance by changing the `key` prop of `NavigationContainer` that depends on the `isSmallScreenWidth`.

- To keep the navigation state that was present before changing the layout, we save the state on every change and use it for the `initialState` prop.
Changing the layout means that every component inside `NavigationContainer` is mounted anew.

## Why we need to use minimal action in the `linkTo` function

### The problem 
Let's assume that the user wants to navigate like this:

```
1. Settings_root - navigate > Profile
2. Profile - UP > Settings_root
3. Settings_root - navigate > About 
4. About - browser back button > Settings_root
```

Without minimal action, expected behavior won't be achieved and the final screen will be `Profile`.

Broken behavior is the outcome of two things:
1. Back button in the browser resets the navigation state with the state saved in step two.
   
2. `Navigation.navigate` creates action with `getActionFromState` dispatched at the top level of the navigation hierarchy. 

The reason why `getActionFromState` provided by `react-navigation` is dispatched at the top level of the navigation hierarchy is that it doesn't know about current navigation state, only about desired one.

In this example, it doesn't know if the `RightModalNavigator` and `Settings` are already mounted.


The action for the first step looks like that:

```json
{
    "type": "NAVIGATE",
    "payload": {
        "name": "RightModalNavigator",
        "params": {
            "initial": true,
            "screen": "Settings",
            "params": {
                "initial": true,
                "screen": "Profile",
            }
        }
    }
}
```


That means, the params for the `RightModalNavigator` and `Settings` (also a navigator) will be filled with the information that we want to have the `Profile` screen in the state.

```json
{
    "index": 2,
    "routes": [
        { "name": "Home", },
        {
            "name": "RightModalNavigator",
            // here you can see that the params are filled with the information about structure that should be in the state.
            "params": {
                "initial": true,
                "screen": "Settings",
                "params": {
                    "initial": true,
                    "screen": "Settings_Profile",
                    "path": "/settings/profile"
                }
            },
            "state": {
                "index": 0,
                "routes": [
                    {
                        "name": "Settings",
                        // Same here
                        "params": {
                            "initial": true,
                            "screen": "Settings_Profile",
                            "path": "/settings/profile"
                        },
                        "state": {
                            "index": 0,
                            "routes": [
                                {
                                    "name": "Settings_Profile"
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ]
}
```

This information will stay here even if we pop the `Profile` screen and navigate to `About` screen. 

Later on, when the user presses the browser back button expecting that the `Settings_root` screen will appear, the navigation state will be reset with information about the `Profile` screen in the params and this will be used as a source of truth for the navigation. 

### The solution

If we can create simple action that will only push one screen to the existing navigator, we won't fill any params of the navigators. 

The `getMinimalAction` compares action generated by the `getActionFromState` with the current navigation state and tries to find the smallest action possible.

The action for the first step created with `getMinimalAction` looks like this:

```json
{
    "type": "NAVIGATE",
    "payload": {
        "name": "Settings_Profile"
    },
    "target": "Settings-stack-key-xyz"
}
```

### Deeplinking 
There is no minimal action for deeplinking directly to the `Profile` screen. But because the `Settings_root` is not on the stack, pressing UP will reset the params for navigators to the correct ones.

### Tests

#### There should be a proper report under attachment screen after reload

1. Open any report with image attachment on narrow layout.
2. Open attachment.
3. Reload the page.
4. Verify that after pressing back arrow in the header you are on the report where you sent the attachment.


#### There is a proper split navigator under RHP with a sidebar screen only for screens that can be opened from the sidebar

1. Open the browser on narrow layout with url `/settings/profile/status`.
2. Reload the page.
3. Verify that after pressing back arrow in the header you are on the settings root page.


#### There is a proper split navigator under the overlay after refreshing page with RHP/LHP on wide screen

1. Open the browser on wide screen with url `/settings/profile/display-name`.
2. Verify that you can see settings profile page under the overlay of RHP.


#### There is a proper split navigator under the overlay after deeplinking to page with RHP/LHP on wide screen

1. Open the browser on wide screen.
2. Open any report.
3. Send message with url `/settings/profile/display-name`.
4. Press the sent link
5. Verify that the settings profile screen is now visible under the overlay

#### The Workspace list page is displayed (SCREENS.SETTINGS.WORKSPACES) after clicking the Settings tab from the Workspace settings screen

1. Open any workspace settings (Settings → Workspaces → Select any workspace)
2. Click the Settings button on the bottom tab.
3. Verify that the Workspace list is displayed (`/settings/workspaces`)
4. Select any workspace again.
5. Reload the page.
6. Click the Settings button on the bottom tab.
7. Verify that the Workspace list is displayed (`/settings/workspaces`)


#### The last visited screen in the settings tab is saved when switching between tabs 

1. Open the app.
2. Go to the settings tab.
3. Open the workspace list.
4. Select any workspace.
5. Switch between tabs and open the settings tabs again.
6. Verify that the last visited page in this tab is displayed.


#### The Workspace selected in the application is reset when you select a chat that does not belong to the current policy

1. Open the home page.
2. Click on the Expensify icon in the upper left corner.
3. Select any workspace.
4. Click on the magnifying glass above the list of available chats. 
5. Select a chat that does not belong to the workspace selected in the third step.
6. Verify if the chat is opened and the global workspace is selected.


#### The selected workspace is saved between Search and Inbox tabs

1. Open the Inbox tab.
2. Change the workspace using the workspace switcher.
3. Switch to the Search tab and verify if the workspace selected in the second step is also selected in the Search.
4. Change the workspace once again.
5. Go back to the Inbox.
6. Verify if the workspace selected in the fourth step is also selected in the Inbox tab.

#### Going up to the workspace list page after refreshing on the workspace settings and pressing the up button

1. Open the workspace settings from the deep link (use a link in format: `/settings/workspaces/:policyID:/profile`)
2. Click the app’s back button.
3. Verify if the workspace list is displayed.

#### Going up to the RHP screen provided in the backTo parameter in the url

1. Open the settings tab.
2. Go to the Profile page.
3. Click the Address button.
4. Click the Country button.
5. Reload the page.
6. Click the app’s back button.
7. Verify if the Profile address page is displayed (`/settings/profile/address`)

#### There is proper split navigator under the overlay after refreshing page in RHP that includes valid reportID in params

wide layout :

1. Open any report.
2. Open report details (press the chat header).
3. Reload the app.
4. Verify that the report under the overlay is the same as the one opened in report details.

narrow layout :

1. Open any report
2. Open report details (press the chat header).
3. Reload the app.
4. Verify that after pressing back arrow in the header you are on the report previously seen in the details page.

#### Navigating back to the Workspace Switcher from the created workspace

1. Open the app and go to the Inbox tab.
2. Open the workspace switcher (Click on the button in the upper left corner).
3. Create a new workspace by clicking on the + button.
4. Navigate back using the back button in the app.
5. Verify if the workspace switcher is displayed with the report screen below it

#### Going up to the sidebar screen

Linked issue: https://github.com/Expensify/App/pull/44138

1. Go to Subscription page in the settings tab.
2. Click on Request refund button
3. Verify that modal shown
4. Next click Downgrade...
5. Verify that modal got closed, your account is downgraded and the Home page is opened.

#### Navigating back from the Search page with invalid query parameters 

1. Open the search page with invalid query parameters (e.g `/search?q=from%3a`)
2. Press the app's back button on the not found page.
3. Verify that the Search page with default query parameters is displayed.

#### Navigating to the chat from the link in the thread 

1. Open any chat.
2. If there are no messages in the chat, send a message.
3. Press reply in thread. 
4. Press the "From" link in the displayed header.
5. Verify if the link correctly redirects to the chat opened in the first step.

#### Expense - App does not open destination report after submitting expense

Linked issue: https://github.com/Expensify/App/pull/49539#issuecomment-2432400819

1. Launch the app.
2. Open FAB > Submit expense > Manual.
3. Submit a manual expense to any user (as long as the user is not the currrently opened report and the receiver is not workspace chat).
4. Verify if the destination report is opened after submitting expense.

#### QBO - Preferred exporter/Export date tab do not auto-close after value selected

Linked issue: https://github.com/Expensify/App/pull/49539#issuecomment-2433342220

Precondition: Workspace with QBO integration connected.

1. Go to Workspace > Accounting.
2. Click on Export > Preferred exporter (or Export date).
3. Click on value.
4. Verify if the value chosen in the third step is selected and the app redirects to the Export page.

#### Web - Hold - App flickers after entering reason and saving it when holding expense

Linked issue: https://github.com/Expensify/App/pull/49539#issuecomment-2433389682

1. Launch the app.
2. Open DM with any user.
3. Submit two expenses to them.
4. Click on the expense preview to go to expense report.
5. Click on any preview to go to transaction thread.
6. Go back to expense report.
7. Right click on the expense preview in Step 5 > Hold.
8. Enter a reason and save it.
9. Verify if the app does not flicker after entering reason and saving it.

#### Group - App returns to group settings page after saving group name

Linked issue: https://github.com/Expensify/App/pull/49539#issuecomment-2433381800

1. Launch the app.
2. Create a group chat.
3. Go to group chat.
4. Click on the group chat header.
5. Click Group name field.
6. Click Save.
7. Verify if the app returs to group details RHP after saving group name.

#### Going up to a screen with any params

Linked issue: https://github.com/Expensify/App/pull/49539#issuecomment-2432694948

1. Press the FAB.
2. Select "Book travel".
3. Press "Book travel" in the new RHP pane.
4. Press "Country".
5. Select any country.
6. Verify that the country you selected is actually visible in the form.

#### Change params of existing attachments screens instead of pushing new screen on the stack

Linked issue: https://github.com/Expensify/App/pull/49539#issuecomment-2432360626

1. Open any chat.
2. Send at least two images.
3. Open attachment by pressing on image.
4. Press arrow on the side of attachment modal to navigate to the second image.
5. Close the modal with X in the corner.
6. Verify that the modal is now fully closed.

#### Navigate instead of push for reports with same reportID

Linked issue: https://github.com/Expensify/App/pull/49539#issuecomment-2433351709

1. Open app on wide layout web.
2. Go to report A (any report).
3. Go to report B (any report with message).
4. Press reply in thread. 
5. Press on header subtitle.
6. Press on the report B in the sidebar.
7. Verify that the message you replied to is no longer highlighted.
8. Press the browsers back button.
9. Verify that you are on the A report.


#### Don't push the default full screen route if not necessary.

1. Open app on wide layout web.
2. Open search tab.
3. Press track expense.
4. Verify that the split navigator hasn't changed under the overlay.

#### BA - Back button on connect bank account modal opens incorporation state modal

Linked issue: https://github.com/Expensify/App/pull/49539#issuecomment-2433261611

Precondition: Use staging server (it can be set in Settings >> Troubleshoot)

1. Launch the app.
2. Navigate to Settings >> Workspaces >> Workspace >> Workflows.
3. Select Connect with Plaid option.
4. Go through the Plaid flow (Added Wells Fargo details).
5. Complete the Personal info, Company info & agreements section.
6. Note user redirected to page with the header Connect bank account and the option to disconnect your now set up bank account.
7. Tap back button on connect bank account modal.
8. Verify if the connect bank account modal is closed and the Workflows page is opened with the bank account added.

#### App opens room details page when tapping RHP back button after saving Private notes in DM

Linked issue: https://github.com/Expensify/App/pull/49539#issuecomment-2433321607

1. Launch the app.
2. Open DM with any user that does not have content in Private notes.
3. Click on the chat header.
4. Click Private notes.
5. Enter anything and click Save.
6. Click on the RHP back button.
7. Verify if the Profile RHP Page is opened (URL in the format /a/:accountID).  