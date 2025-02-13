# Navigation tests

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

#### Opening particular onboarding pages from a link and going back

Linked issue: https://github.com/Expensify/App/issues/50177

1. Sign in as a new user.
2. Select Something else from the onboarding flow.
3. Reopen/refresh the app.
4. Verify the Personal detail step is shown.
5. Go back.
6. Verify you are navigated back to the Purpose step.
7. Select Manage my team.
8. Choose the employee size.
9. Reopen/refresh the app.
10. Verify the connection integration step is shown.
11. Go back.
12. Verify you are navigated back to the employee size step.
13. Go back.
14. Verify you are navigated back to the Purpose step.