# Data Binding Philosophy
The UI binds to the data stored on the local device's database (Onyx).

- Onyx is a Pub/Sub library to connect the application to the data stored on disk.

## Rules
### - The UI MUST NOT call any Onyx methods directly
### - The UI MUST trigger an an action when something needs to happen
For example, a person inputs data, the UI calls an action and passes the user's input.

### - The UI SHOULD anticipate missing or incomplete data
Use fallbacks and default values to handle data that can be missing.

### - The UI MUST call all action methods in parallel and not in sequence
Do not wait for one action to finish before calling another action. If you find yourself running into this problem, you should rethink how the component is built. Ask for help in our open source room and there will be plenty of people willing to help you think through a better approach. They can be tricky sometimes!

### - Action methods SHOULD not return a promise
Returning a promise is the first sign that the rule above this is being broken. Let the UI react to changes to Onyx data that is modified in the action instead.
