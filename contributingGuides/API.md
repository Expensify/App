# API Details
These are best practices related to the current API used for App. This does not relate to any of our `DeprecatedAPI`.
## Philosophy
- We desire to have a 1:1:1 ratio of user action to web server (PHP) commands to database server (Auth) commands.
- Each user action should generate at most 1 API call.
- There should be no client-side handling that is unique to any API call.
- Data is pushed to the client and put straight into Onyx by low-level libraries.
- Clients should be kept up-to-date with many small incremental changes to data.
- Creating data needs to be optimistic on every connection (offline, slow 3G, etc), eg. `RequestMoney` or `SplitBill` should work without waiting for a server response.
- For new objects created from the client (reports, reportActions, policies) we're going to generate a random string ID immediately on the client, rather than needing to wait for the server to give us an ID for the created object.
  - This client-generated ID will become the primary key for that record in the database. This will provide more offline functionality than was previously possible.

## Response Handling
When the web server responds to an API call the response is sent to the server in one of two ways.
1. **HTTPS Response** - Data that is returned with the HTTPS response is only sent to the client that initiated the request.

    The network library will look for any `onyxData` in the response and send it straight to `Onyx.update(response.onyxData)`.

1. **Pusher Event** (web socket) - Data returned with a Pusher event is sent to all currently connected clients for the user that made the request, as well as any other necessary participants (eg. like other people in the chat)

    Pusher listens for an `onyxApiUpdate` event and sends the data straight to `Onyx.update(pushJSON)`.
### READ Responses
This is a response that returns data from the database.

A READ response is very specific to the client making the request, so it's data is returned with the **HTTPS Response**. This prevents a lot of unnecessary data from being sent to other clients that will never use it.

In PHP, the response is added like this:
```php
$response['onyxData'][] = blahblahblah;
```
The data will be returned with the HTTPS response.
### WRITE Responses
This response happens when new data is created in the database.

New data (`jsonCode===200`) should be sent to all connected clients so a **Pusher Event** is used to update another currently connected clients with the new data that was created.

In PHP, the response is added like this:
```php
$onyxUpdate[] = blahblahblah;
```
The data will automatically be sent to the user via Pusher.

#### WRITE Response Errors
When there is an error on a WRITE response (`jsonCode!==200`), the error must come back to the client on the HTTPS response. The error is only relevant to the client that made the request and it wouldn't make sense to send it out to all connected clients.

Error messages should be returned and stored as an object under the `errors` property, keyed by an integer [microtime](https://github.com/Expensify/Web-Expensify/blob/25d056c9c531ea7f12c9bf3283ec554dd5d1d316/lib/Onyx.php#L148-L154). If absolutely needed, additional error properties can be stored under other, more specific fields that sit at the same level as `errors`:
```php
[
    'onyxMethod' => Onyx::METHOD_MERGE,
    'key' => OnyxKeys::WALLET_ADDITIONAL_DETAILS,
    'value' => [
        'errors' => [
            Onyx::getErrorMicroTime() => 'We\'re having trouble verifying your SSN. Please enter the full 9 digits of your SSN.',
        ],
        'errorCode' => 'ssnError',
    ],
]
```

### Hybrid READ/WRITE Responses
There are some commands which might technically be a READ and a WRITE.

For example: Accessing the data for a chat report will return the data if the report exists (READ) OR if the report doesn't exist yet, it will create it (WRITE) and then return the new report. In these cases, the intention is that the command is a READ that will _always_ return something, so the fact that there _could_ be a WRITE is not important. This is still considered to be a READ response, regardless of the lower-level implementation details.
## Command Naming Conventions
- Names must be unique for every user action.
- Names must NOT be shared with our old (now deprecated API)
- Names must always have the format of `<Verb>[<Noun>]` eg. `TransferMoney` `SelectEmoji`.
- Nouns can be optional eg. `SignIn`
- Verbs should be unique and indicate the user's action (as perceived by the user). eg. `Request`, `Open`, `Accept`, `Pay`
  - If a unique verb cannot be used, then use only the standard verbs: `Update`, `Add`, `Delete`
- Names must NOT include names of parameters eg. Bad: `SignInWithPasswordOr2FA` Good: `SignIn`
- Names must NOT include the word Page or View, eg. Bad: `OpenReportPage` Good: `OpenReport`
- Names must NOT reveal backend implementation details that the user does not know about eg. `AddVBBA` (users don't know what a VBBA is - verified business bank account) Good: `AddBankAccount`
- For deep links like `StartAppWhileSignedInAndOpenWorkspace`, create separate commands for each specific scenario like `StartAppWhileSignedIn` and `OpenWorkspace`, where both requests will be triggered in parallel.

## FAQ

### How should error messages be persisted to Onyx?

- The API layer Pusher onyxData should set specific error messages.
- In cases where the API does not set an error, a generic error message can be set in the API.write parameter `onyxData.failureData`.
- Previous errors should be cleared in the `onyxData.optimisticData` when a new request is made.

### How should we remove local data from the store if the data no longer exist in the server? eg. local policy data for policies the user is no longer a member of.

Use `Onyx.set(key, null)` for each data (eg. policy) not found in the server.
