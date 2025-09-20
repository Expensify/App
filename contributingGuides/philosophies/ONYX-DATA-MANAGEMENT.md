# Onyx Data Management
This is how the application manages all the data stored in Onyx.

#### Related Philosophies
- [Data Flow Philosophy](/contributingGuides/philosophies/DATA-FLOW.md)
- [Data Binding Philosophy](/contributingGuides/philosophies/DATA-BINDING.md)

#### Terminology
- **Actions** - The files stored in `/src/libs/actions`.

## Rules
### - Actions MUST be the only means to write or read data from the server
### - Actions SHOULD use `Onyx.merge()` rather than `Onyx.set()`
This improves performance and lessons the chance that one action will overwrite the changes made by another action.

### - UI Components MUST NOT call Onyx methods directly and should call an action instead
### - Data SHOULD be optimistically stored on disk whenever possible without waiting for a server response
Example of creating a new optimistic comment:
1. User adds a comment
2. Comment is shown immediately in the UI with optimistic data
3. Comment is created in the server
4. Server responds
5. UI updates with data from the server
