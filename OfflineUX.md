#### Offline UX Patterns


### Contents
* [Motivation & Philosophy](#motivation-&-philosophy)
* [UX Pattern Flowchart](#ux-pattern-flowchart)
* [How to Answer Questions on the Flow Chart](#how-to-answer-questions-on-the-flowchart)
* [Description of the Patterns](#description-of-the-patterns)
    - [None - No Offline Behavior](#none---no-offline-behavior)
    - [A - Optimistic Without Feedback](#a---optimistic-without-feedback)
    - [B - Optimistic With Feedback](#b---optimistic-with-feedback)
    - [C - Blocking Form](#c---blocking-form)
    - [D - Full Page Blocking](#d---full-page-blocking)

### Motivation & Philosophy

Understanding the offline behavior of our app is vital to becoming a productive contributor to the Expensify codebase. Our mission is to support our users in every possible environment, and often our app is used in places where a stable internet connection is not guaranteed. 

The most important concept to keep in mind while reading this document is that we want to allow users to do as much as possible when offline. At first, this might seem impossible because almost everything the user can touch in our app is related to an API request. However, in many cases, we can save that API request and assume it will succeed when the user is back online. We allow the user to proceed as if their request succeeded when really we’ve stored it away for later to be sent when they’re back online. We call this an optimistic response. Here, we use the word optimistic to indicate that we’re confident the request will succeed when the user is online. 

<div style="margin: 15px; padding: 15px; border: 3px solid grey">
Example: Pinning a chat

When a user clicks the pin button <img style="height: 10px; width: 10px; filter: invert(.5) saturate(5);" src="./assets/images/pin.svg"/> on a chat, two things should happen. 

We send a request to the API to keep track of that. After all, if the user signed in on a different device, we would want all of their pinned chats to show up (another way of saying this is we want their pinned chats to ‘persist’ across devices). 
The chat should go to the top of the list with the other pinned chats, and the pin button should look darker than it did before. This is the user’s visual feedback that clicking the pin button worked.

If the user is offline, do we need to wait for the API request to finish before doing all that visual stuff? No! We are optimistic that the API request will succeed once it’s sent. In the meantime, we let the user continue using the app. 
</div>

The example we just looked at is nice and simple, but what about something more complicated, like requesting money from another user? What about paying another user? Or even worse, like removing a user from a workspace? For these types of actions, we can’t simply proceed as if the request already finished. That would have serious consequences for the user. This is why we have developed different ways of handling these cases. These are called the UX Patterns, which are explained below.



### UX Pattern Flow Chart

The following flowchart can be used to determine which UX pattern should be used.

![New Expensify Data Flow Chart](/web/OfflineUX_Patterns_Flowchart.png)

### How to Answer Questions on the Flow Chart

The numbers in this section correlate to the numbers in each decision box above (the diamond shapes).


1. Does the feature interact with the server?

If you’re changing an existing feature, you can open the network tab of dev tools to see if any network requests are being made when you use the feature. If network requests are being made, the answer to this question is YES.
If you’re making a new feature, think about whether any data would need to be retrieved or stored from anywhere other than the local device. If data needs to be stored or retrieved, then the answer is YES.


2. What type of request is being made?

This question can be answered by thinking about what’s happening in the server. If there’s new data being saved on the server, you’re making a WRITE request. If you’re retrieving existing data from the server, you’re making a READ request. 


3. Do we need to show up-to-date data?

You should answer yes to this question if it’s important that the user sees current data/content. An example is viewing a chat. Even though the user won’t be able to see new chat messages, it’s still important for us to show the user the old ones.


4. Is the UI a form?

Any easy way to tell if something is a form is to try and find a submit button. If a submit button is present or if the user is filling out fields that we want to save locally, answer YES to this question.


5. Can the server response be anticipated?

Assuming that the request succeeds when it’s sent to the server, do you know what would happen next? For example, we would answer NO if there is some new data coming back from the server that we have no way of guessing. Answer YES if it’s easy to tell what the response from the server would be. 


6. Is there validation done on the server?

If there is some validation happening on the server that needs to happen before the feature can work, then we answer YES to this question. For example, if we want to set up a bank account then our answer to question 5 is YES (because we could imagine that the server returns a 200 and we would know what the next page would look like), but our answer to this question is NO (because we can’t suggest to the user that their request succeeded when really it hasn’t been sent yet–their card wouldn’t work!)


7. Does the user need to know if the action was successful?

Think back to the pinning example from above. In this case, the user doesn’t need to know that their pinned reports NVP has been updated. To them the impact of clicking the pin button is that their chat is at the top of the LHN. It makes no difference to them if the server has been updated or not, so the answer would be NO. Now let’s consider the case of sending a comment. In this example, the user needs to know if their comment was actually sent, because they may need to know if the person they sent it to can read it. In this case our answer is YES.


### Detailed Descriptions of Each UX Pattern


# None - No Offline Behavior

 There’s no specific UI for this case. The feature either looks totally normal and works as expected (because it doesn’t need the server to function) or the feature looks like it did whenever connection was lost. 

Used when…
… there is no interaction with the server in any way
… or data is READ from the server and does not need to show up- to- date data. The user will see stale data until the new data is put into Onyx and then the view updates to show the new data. 


# A - Optimistic Without Feedback Pattern
This is the pattern where we queue the request to be sent when the user is online and we continue as if the request succeeded. 

Used when…
… the user should be given instant feedback and
there is no error handling in the server and
the user does not need to know that the change is being made on the server in the background

How to implement: Use API.queue() to implement this pattern. 

# B - Optimistic WITH Feedback Pattern
This pattern queues the API request, but also makes sure that the user is aware that the request hasn’t been sent yet.

Used when…
… the user needs feedback that data is being synced to the server
This is a minority use case at the moment, but INCREDIBLY HELPFUL for the user, so proceed with cautious optimism.

How to implement: Use API.queue() to implement this pattern. 


Handling the pending case

We’ve already got a pending state set for optimistic report comments (see 4 in the bulleted list above). Since we are standardizing on isPending to indicate a pending action we will just update the loading here and here to isLoading. 
Update getReportActionItemStyle() to have a second argument called isPending that will receive action.isLoading && network.isOffline
if isPending === true add the color: themeColors.textSupporting style
Update ReportActionItem.js to pass a second argument to getReportActionItemStyle() with the value this.props.action.isLoading && network.isOffline

Handling the error case:

When any action that modifies a report action returns an error we must associate the error with the action so it can be shown inline. It can either be an action that already exists or might not be created yet, but we can add the error translation key for the error to a new field of error on the report action itself.

e.g. when handling a Report_AddComment error we are handling some existing errors here by rolling back the temporary action. These errors should instead be handled by setting Onyx data like this:

Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
    [optimisticReportActionID]: {
        error: <error-translation-key>,
        isLoading: false,    
    },
});


# C - Blocking Form UI Pattern
This pattern blocks the user from interacting with an entire page.

Used when…
… a form is used to make a WRITE request to the server and 
the server has to do some validation of the parameters that can’t be done in the client or
the server response will be unknown so it cannot be done optimistically


What: This pattern greys out the submit button on a form and does not allow the form to be submitted. Importantly, we do let the user fill out the form fields. That data gets saved locally so they don’t have to fill it out again once online.

When: This should be used when we cannot allow the user to submit the form while offline.



# D - Full Page Blocking UI Pattern
This pattern blocks the user from interacting with an entire page.

Used when…
… a blocking READ is being performed.
This occurs when the data that a user sees cannot be stale data and the data can only be displayed after fetching it from the server (eg. Plaid's list of bank accounts)
… the app is offline and the data cannot be fetched
… an error occurs when fetching the data and the user needs instructions on what to do next
This should only be used in the most extreme cases when all other options have been completely and utterly exhausted

Note: This pattern will only be used in the following flows, and since it is used very minimally, a very simple solution will be used which does not provide any method of enforcing the pattern.
Listing payment methods (eg. https://new.expensify.com/settings/payments)
Adding a bank account (eg. https://new.expensify.com/workspace/4EA57948DC3347F9/bank-account)


What: This pattern blocks the user from interacting with an entire page.



