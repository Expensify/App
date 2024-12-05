# Offline UX Patterns

## Contents
* [Motivation & Philosophy](#motivation--philosophy)
* [Description of the Patterns](#descriptions-of-the-ux-patterns)
    - [None - No Offline Behavior](#none---no-offline-behavior)
    - [A - Optimistic Without Feedback](#a---optimistic-without-feedback-pattern)
    - [B - Optimistic With Feedback](#b---optimistic-with-feedback-pattern)
    - [C - Blocking Form](#c---blocking-form-ui-pattern)
    - [D - Full Page Blocking](#d---full-page-blocking-ui-pattern)
* [UX Pattern Flowchart](#ux-pattern-flow-chart)
    - [Answering Questions on the Flow Chart](#answering-questions-on-the-flow-chart)

## Motivation & Philosophy

Understanding the offline behavior of our app is vital to becoming a productive contributor to the Expensify codebase. Our mission is to support our users in every possible environment, and often our app is used in places where a stable internet connection is not guaranteed.

The most important concept to keep in mind while reading this document is that we want to allow users to do as much as possible when offline. At first, this might seem impossible because almost everything the user can touch in our app is related to an API request. However, in many cases, we can save that API request and assume it will succeed when the user is back online. We then allow the user to proceed as if their request already succeeded. We call this an optimistic response. Here, we use the word **optimistic** to indicate that we're confident the request will succeed when the user is online, and we know what that successful response will look like.

<hr />
Example: Pinning a chat

When a user clicks the pin button <img style="height: 10px; width: 10px;" src="../assets/images/pin.svg"/> on a chat, two things should happen.

1. **API Request:** We send a request to the API to ensure the change is saved in the database. This way the chat is pinned on all the user's devices, and will remain pinned even if they leave the app and come back.

2. **UI Changes:** The chat should go to the top of the list with the other pinned chats, and the pin button should look darker than it did before. This is visual feedback that clicking the pin button worked.

If the user is offline, we don't need to wait for the API request to finish before doing all that visual stuff because this particular API request has almost no way of failing, and we know what the server will return in advance. That means we can safely assume that when we retry the command, it will succeed and that's why we let the user continue using the app as if the action succeeded.

<hr />

The example we just looked at is nice and simple, but some actions should not use this approach (example: requesting money from another user). For these types of actions, we can't simply proceed as if the request already finished. Here are some reasons why:

1. We don't know _how_ to proceed because of a lack of information (often the server returns data that we wouldn't be able to guess the content of).

2. We may be able to guess what a successful request would look like, but we don't want to misguide the user into believing their action was completed. For example, we don't want the user to believe that a financial transaction has been made when it actually hasn't.

To handle problems like this, we have developed offline UX patterns and guidance on when to use them. Every feature of this application should fit into one of these patterns.

## Descriptions of the UX Patterns

### None - No Offline Behavior

There’s no specific UI for this case. The feature either looks totally normal and works as expected (because it doesn’t need the server to function) or the feature looks like it did whenever connection was lost.

**Used when…**
- there is no interaction with the server in any way
- or data is READ from the server and does not need to show up-to-date data. The user will see stale data until the new data is put into Onyx and then the view updates to show the new data.

**How to implement:** Use [`API.read()`](https://github.com/Expensify/App/blob/3493f3ca3a1dc6cdbf9cb8bd342866fcaf45cf1d/src/libs/API.js#L53-L55).

**Example:** The `About` page.

### A - Optimistic Without Feedback Pattern

This is the pattern where we queue the request to be sent when the user is online and we continue as if the request succeeded.

**Used when…**
- the user should be given instant feedback and
- the user does not need to know when the change is done on the server in the background

**How to implement:** Use [`API.write()`](https://github.com/Expensify/App/blob/3493f3ca3a1dc6cdbf9cb8bd342866fcaf45cf1d/src/libs/API.js#L7-L28) to implement this pattern. For this pattern, we should only put `optimisticData` in the options. We don't need `successData` or `failureData` as we don't care what response comes back at all.

**Example:** Pinning a chat.

### B - Optimistic WITH Feedback Pattern
This pattern queues the API request, but also makes sure that the user is aware that the request hasn’t been sent yet **when the user is offline**.
When the user is online, the feature should just look like it succeeds immediately (we don't want the offline UI to flicker on and off when the user is online).
When the user is offline:
- Things pending to be created or updated will be shown greyed out (0.5 opacity)
- Things pending to be deleted will be shown greyed out and have strikethrough

**Used when…**
- The user needs feedback that data will be sent to the server later. This is a minority use case at the moment, but INCREDIBLY HELPFUL for the user, so proceed with cautious optimism.

**How to implement:** 
- Use API.write() to implement this pattern 
- Optimistic data should include `pendingAction` ([with these possible values](https://github.com/Expensify/App/blob/15f7fa622805ee2971808d6bc67181c4715f0c62/src/CONST.js#L775-L779))
- To ensure the UI is shown as described above, you should enclose the components that contain the data that was added/updated/deleted with the `OfflineWithFeedback` component
- Include this data in the action call:
    - `optimisticData` - always include this object when using the Pattern B
    - `successData` - include this if the action is `update` or `delete`. You do not have to include this if the action is `add` (same data was already passed using the `optimisticData` object)
    - `failureData` - always include this object. In case of `add` action, you will want to add some generic error which covers some unexpected failures which were not handled in the backend
       - In the event that `successData` and `failureData` are the same, you can use a single object `finallyData` in place of both. 

**Handling errors:**
- The [OfflineWithFeedback component](https://github.com/Expensify/App/blob/main/src/components/OfflineWithFeedback.tsx) already handles showing errors too, as long as you pass the error field in the [errors prop](https://github.com/Expensify/App/blob/128ea378f2e1418140325c02f0b894ee60a8e53f/src/components/OfflineWithFeedback.js#L29-L31)
- The behavior for when something fails is:
    - If you were adding new data, the failed to add data is displayed greyed out and with the button to dismiss the error
    - If you were deleting data, the failed data is displayed regularly with the button to dismiss the error
    - If you are updating data, the original data is displayed regulary with the button to dismiss the error
- When dismissing the error, the `onClose` prop will be called, there we need to call an action that either:
  - If the pendingAction was `add`, it removes the data altogether
  - Otherwise, it would clear the errors and `pendingAction` properties from the data
- We also need to show a Red Brick Road (RBR) guiding the user to the error. We need to manually do this for each piece of data using pattern B Optimistic WITH Feedback. Some common components like `MenuItem` already have a prop for it (`brickRoadIndicator`)
  - A Brick Road is the pattern of guiding members towards places that require their attention by following a series of UI elements that have the same color

**Example:** Sending a chat message.

### C - Blocking Form UI Pattern
This pattern greys out the submit button on a form and does not allow the form to be submitted. We also show a "You appear offline" message near the bottom of the screen. Importantly, we _do_ let the user fill out the form fields. That data gets saved locally so they don’t have to fill it out again once online.

**Used when…**
- a form is used to make a WRITE request to the server and
- server has to do some validation of the parameters that can’t be done in the client or
- server response will be unknown so it cannot be done optimistically
- If the request is moving money

**How to implement:** Use the `<FormAlertWithSubmitButton/>` component. This pattern should use the `API.write()` method.

**Example:** Inviting new members to a workspace.

### D - Full Page Blocking UI Pattern
This pattern blocks the user from interacting with an entire page.

**Used when…**
- blocking READ is being performed. This occurs when the data that a user sees cannot be stale data and the data can only be displayed after fetching it from the server
- the app is offline and the data cannot be fetched
- an error occurs when fetching the data and the user needs instructions on what to do next
  This should only be used in the most extreme cases when all other options have been completely and utterly exhausted

**How to implement:** Wrap the component you're working on in a `<FullPageOfflineBlockingView>` component.

**Example:** Getting the list of bank accounts the user owns from Plaid (an external service).

## UX Pattern Flow Chart

The following flowchart can be used to determine which UX pattern should be used.

![New Expensify Data Flow Chart](/contributingGuides/OfflineUX_Patterns_Flowchart.png)

### Answering Questions on the Flow Chart

The numbers in this section correlate to the numbers in each decision box above (the diamond shapes).

1. Does the feature interact with the server?
  - If you're changing an existing feature, you can open the network tab of dev tools to see if any network requests are being made when you use the feature. If network requests are being made, the answer to this question is YES. Note: Sometimes you may see requests that happen to fire at the same time as the feature you're working on, so be sure to double check.
If you're making a new feature, think about whether any data would need to be retrieved or stored from anywhere other than the local device. If data needs to be stored to or retrieved from the server, then the answer is YES.

2. What type of request is being made?
  - If there's new data being saved on the server, you're making a WRITE request. If you're retrieving existing data from the server, you're making a READ request. If both things are happening, that's a WRITE request.

3. Is it OK for the user to see stale data?
  - Example: The payment method list. We don't want the user to see a payment method that we no longer support, not even while the payment methods are being loaded from the server (or while the user is offline). Therefore, we answer NO, which leads us to the blocking UI. This way the user won't see stale data while we load the payment methods.

4. Is the UI a form?
  - An easy way to tell if something is a form is to try and find a submit button. If a submit button is present or if the user is filling out form inputs, answer YES to this question.

5. Can the server response be anticipated?
  - Answer NO if there is data coming back from the server that we can't know (example: a list of bank accounts from Plaid, input validation that the server must perform). Answer YES if we can know what the response from the server would be.

6. Does the user need to know if the action was successful?
  - Think back to the pinning example from above: the user doesn’t need to know that their pinned report's NVP has been updated. To them the impact of clicking the pin button is that their chat is at the top of the LHN. It makes no difference to them if the server has been updated or not, so the answer would be NO. Now let’s consider sending a payment request to another user. In this example, the user needs to know if their request was actually sent, so our answer is YES.
