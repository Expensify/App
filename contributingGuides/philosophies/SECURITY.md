# Security Philosophy
Updated rules for managing members across all types of chats in New Expensify.

## Rules
### - Participants MUST NOT be able to leave or be removed from something they were automatically added to
#### Examples:

- DM members MUST NOT be able to leave or be removed from their DMs
- Members MUST NOT be able to leave or be removed from their own expense chats
- Admins MUST NOT be able to leave or be removed from expense chats
- Members MUST NOT be able to leave or be removed from the #announce room
- Admins MUST NOT be able to leave or be removed from #admins
- Domain members MUST NOT be able to leave or be removed from their domain chat
- Report submitters MUST NOT be able to leave or be removed from their reports
- Report managers MUST NOT be able to leave or be removed from their reports
- Group owners MUST NOT be able to be removed from their groups - they need to transfer ownership first

#### - Excepting the above, Admins MUST be able to remove everyone
- Group MUST be able to remove other group admins, as well as group members
- Workspace admins MUST be able to remove other workspace admins, as well as workspace members, and invited guests
#### -  Excepting the above, Workspace members MUST be able to remove non-workspace guests.
#### -  Excepting the above, Anyone MUST be able to remove themselves from any object

## Examples
### DM
|                    | Member |
| :----------------: | :----: |
|     **Invite**     |   ❌    |
|     **Remove**     |   ❌    |
|     **Leave**      |   ❌    |
| **Can be removed** |   ❌    |
- DM always has two participants. None of the participant can leave or be removed from the DM. Also no additional member can be invited to the chat.

### Workspace Rooms
#### Workspace
|                    | Creator | Member(Employee/User) | Admin | Auditor? |
| :----------------: | :-----: | :-------------------: | :---: | :------: |
|     **Invite**     |    ✅    |           ❌           |   ✅   |    ❌     |
|     **Remove**     |    ✅    |           ❌           |   ✅   |    ❌     |
|     **Leave**      |    ❌    |           ✅           |   ❌   |    ✅     |
| **Can be removed** |    ❌    |           ✅           |   ✅   |    ✅     |

- Creator can't leave or be removed from their own workspace
- Admins can't leave from the workspace
- Admins can remove other workspace admins, as well as workspace members, and invited guests
- Creator can remove other workspace admins, as well as workspace members, and invited guests
- Members and Auditors cannot invite or remove anyone from the workspace

#### Workspace #announce room
|                    | Member(Employee/User) | Admin | Auditor? |
| :----------------: | :-------------------: | :---: | :------: |
|     **Invite**     |           ❌           |   ❌   |    ❌     |
|     **Remove**     |           ❌           |   ❌   |    ❌     |
|     **Leave**      |           ❌           |   ❌   |    ❌     |
| **Can be removed** |           ❌           |   ❌   |    ❌     |

- No one can leave or be removed from the #announce room

#### Workspace #admin room
|                    | Admin |
| :----------------: | :---: |
|     **Invite**     |   ❌   |
|     **Remove**     |   ❌   |
|     **Leave**      |   ❌   |
| **Can be removed** |   ❌   |

- Admins can't leave or be removed from #admins

#### Workspace rooms
|                    | Creator | Member | Guest(outside of the workspace) |
| :----------------: | :-----: | :----: | :-----------------------------: |
|     **Invite**     |    ✅    |   ✅    |                ✅                |
|     **Remove**     |    ✅    |   ✅    |                ❌                |
|     **Leave**      |    ✅    |   ✅    |                ✅                |
| **Can be removed** |    ✅    |   ✅    |                ✅                |

- Everyone can be removed/can leave from the room including creator
- Guests are not able to remove anyone from the room

#### Expense chats
|                    | Admin | Member(default) | Member(invited) |
| :----------------: | :---: | :-------------: | :-------------: |
|     **Invite**     |   ✅   |        ✅        |        ❌        |
|     **Remove**     |   ✅   |        ✅        |        ❌        |
|     **Leave**      |   ❌   |        ❌        |        ✅        |
| **Can be removed** |   ❌   |        ❌        |        ✅        |

- Admins are not able to leave/be removed from the expense chat
- Default members(automatically invited) are not able to leave/be removed from the expense chat
- Invited members(invited by members) are not able to invite or remove from the expense chat
- Invited members(invited by members) are able to leave the expense chat
- Default members and admins are able to remove invited members

### Domain chat
|                    | Member |
| :----------------: | :----: |
|     **Remove**     |   ❌    |
|     **Leave**      |   ❌    |
| **Can be removed** |   ❌    |

- Domain members can't leave or be removed from their domain chat

4. ### Reports
    |                    | Submitter | Manager |
    | :----------------: | :-------: | :-----: |
    |     **Remove**     |     ❌     |    ❌    |
    |     **Leave**      |     ❌     |    ❌    |
    | **Can be removed** |     ❌     |    ❌    |

- Report submitters can't leave or be removed from their reports (eg, if they are the report.accountID)
- Report managers can't leave or be removed from their reports (eg, if they are the report.managerID)
