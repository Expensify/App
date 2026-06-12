# Data Flow Philosophy

#### Related Philosophies
- [Onyx Data Management Philosophy](/contributingGuides/philosophies/ONYX-DATA-MANAGEMENT.md)
- [Data Binding Philosophy](/contributingGuides/philosophies/DATA-BINDING.md)

This is how data flows through the app:

1. Server pushes data to the disk of any client (Server -> Pusher event -> Action listening to pusher event -> `Onyx.update()`).
2. Disk pushes data to the UI (Onyx -> `useOnyx()` -> React component).
3. UI pushes data to people's brains (React component -> device screen).
4. Brain pushes data into UI inputs (Device input -> React component).
5. UI inputs push data to the server (React component -> Action -> XHR to server).
6. Go to 1

![New Expensify Data Flow Chart](/contributingGuides/philosophies/data_flow.png)

## Rules

### - API commands SHOULD return created/updated data directly
When adding new API commands, always prefer to return the created/updated data in the command itself, instead of saving and reloading. For example: if we call `CreateTransaction`, we SHOULD prefer making `CreateTransaction` return the data it just created instead of calling `CreateTransaction` then `Get` rvl=transactionList.
