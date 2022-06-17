# API Details
# Philosophy
- We desire to have a 1:1:1 ratio of user action to web server (PHP) commands to database server (Auth) commands.
- Each user action should generate at most 1 API call.
- There should be no client-side handling that is unique to any API call.
- Data is pushed to the client and put straight into Onyx.
- Clients should be kept up-to-date with many small incremental changes to data.
# Response Handling
When the web server responds to an API call the response is sent to the server in one of two ways.
1. **HTTPS Response** - Data that is returned with the HTTPS response is only sent to the client that initiated the request.
2. **Pusher Event** (web socket) - Data returned with a Pusher event is sent to all currently connected clients for the user that made the request, as well as any other necessary participants (eg. like other people in the chat)
## READ Responses
This is a response that returns data from the database that didn't exist before.

A READ response is very specific to the client making the request, so it's data is returned with the **HTTPS Response**. This prevents a lot of unnecessary data from being sent to other clients that will never use it.
## WRITE Responses
This response happens when new data is created in the database.

New data should be sent to all connected clients so a **Pusher Event** is used to update another currently connected clients with the new data that was created.
## Hybrid READ/WRITE Responses
There are 
# Command Naming Conventions
- Names must be unique for every user action.
- Names must NOT be shared with our old (now deprecated API)
- Names must always have the format of `<Verb>[<Noun>]` eg. `TransferMoney` `SelectEmoji`.
- Nouns can be optional eg. `SignIn`
- Verbs should be unique and indicate the user's action (as perceived by the user). eg. `Request`, `Open`, `Accept`, `Pay`
  - If a unique verb cannot be used, then use only the standard verbs: `Update`, `Add`, `Delete`
- Names must NOT include names of parameters eg. Bad: `SignInWithPasswordOr2FA` Good: `SignIn`
