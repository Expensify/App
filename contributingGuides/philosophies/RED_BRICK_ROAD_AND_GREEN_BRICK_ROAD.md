# Red Brick Road and Green Brick Road Philosophy
The Red Brick Road (RBR) and Green Brick Road (GBR) are each a method to direct a user down a clear path of actions to take or errors to fix. It is intended to help the user have a clearly defined set of steps to follow in order to resolve something. It can lead you to take an action anywhere in the Inbox, Reports, Workspaces, or Account.

## Terminology
- **Brick Road**: The Brick Road is named after the Yellow Brick Road from the popular movie The Wizard of Oz. In the Wizard of Oz, Dorothy must follow the Yellow Brick Road in order to reach the Emerald City, similar to how the Brick Roads in Expensify lead the user down a certain path to reach the final destination of a resolution.
- **Red Brick Road**: The Red Brick Road (RBR) is the red dot that shows up under certain conditions that will lead the user down a path of errors or violations to fix.
    - **The UI Pattern**:
        - The Red Brick Road will show up in the UI as a red dot next to an inbox item, expense, report or other specific menu item.
        - The goal is to bring the user to some kind of action.
        - With the RBR, it usually ends at some kind of error with instructions on how to fix it.
        - The dots (or indicators) should be present on the navigation items (eg. links, buttons) that the user needs to click on to take them to where the action item will be.
The dots (or indicators) should be present on the navigation items (eg. links, buttons) that the user needs to click on to take them to where the action item will be
- **Green Brick Road**: The Green Brick Road (GBR) is the red dot that shows up under certain conditions that will lead the user down a path of errors or violations to fix.
    - **The UI Pattern**:
        - The Green Brick Road will show up in the UI as a green dot next to an inbox item, expense, report, or other specific menu item.
        - The goal is to bring the user to some kind of action.
        - With GBR, it's usually a big green button to signal they made it to the end of the road.
        - The dots (or indicators) should be present on the navigation items (eg. links, buttons) that the user needs to click on to take them to where the action item will be.
- **Both Brick Roads**
    - **The UI Pattern**:
        - For both Brick Roads, it MUST take the user to something that is actionable. If there is nothing the user can do to resolve the brick road, then the brick road should not exist.- 

## Green Brick Road (GBR)
This section is broken down into the rules and examples for each section where the Green Brick Road will appear.

### Rules
The GBR MUST show up when there is a pending action to take or item to review. 

### Inbox
Any chats in the left hand navigation (LHN) that require attention will in most cases show up in the highest context chat.
Examples:
- There is a report pending approval by an admin
- There is a report pending submission by an employee
- There is a report waiting to be paid by the admin
- There is a report queued for reimbursement but the employee needs to add a deposit bank account
- An Expensify Card has been issued to an employee but the employee needs to add their shipping details
- A user is mentioned in a report comment

### Workspaces
Examples:
- If the billing owner had to retry billing and the retry was successful

### Account
Examples:
- A user has an unvalidated contact method


## Red Brick Road (RBR)
This section is broken down into rules and examples for each section where the Red Brick Road will appear.

### Rules
The RBR MUST show up when there is an error or violation that needs fixing.

### Inbox
Any chats in the left hand navigation (LHN) that require attention will in most cases show up in the highest context chat.
Examples:
- There are violations on a report that the employee needs to fix
- There is a task that you assigned to an employee waiting to be completed
- There is an expense that the admin put on hold

### Workspaces
Examples:
- The Workspace Admin's accounting integration connection is broken
- The QuickBooks Online export is broken and needs to be re-authenticated
- Your direct connection to your bank or Plaid is broken and needs to be reconnected
- There is an error with your billing subscription
- The Workspace Admin adds a new workspace member but gets an error message

### Account
Examples:
- A third party card assigned to a user has a broken connection

### Other
Examples:
- There is an error that occurred from an action the user took while they were offline

