# Onyx Data Management
This is how the application manages all the data stored in Onyx.

#### Related Philosophies
- [Data Flow Philosophy](/contributingGuides/philosophies/DATA-FLOW.md)
- [Data Binding Philosophy](/contributingGuides/philosophies/DATA-BINDING.md)

#### Terminology
- **Actions** - The files stored in `/src/libs/actions`
- **canBeMissing** - Parameter indicating whether a component expects Onyx data to be present

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

### - Collections SHOULD be stored as individual keys when components bind directly to them
Store collections as individual keys+ID (e.g., `report_1234`, `report_4567`) when a component will bind directly to one of those keys. For example: reports are stored as individual keys because `OptionRow.js` binds to the individual report keys for each link. However, report actions are stored as an array of objects because nothing binds directly to a single report action.

### - Onyx keys MUST be defined using constants in `ONYXKEYS`
Each Onyx key represents either a collection of items or a specific entry in storage. For example, since all reports are stored as individual keys like `report_1234`, if code needs to know about all the reports (e.g., display a list of them in the nav menu), then it MUST subscribe to the key `ONYXKEYS.COLLECTION.REPORT`.

### - Storage eviction MUST be configured for non-critical data
Different platforms come with varying storage capacities and Onyx has a way to gracefully fail when those storage limits are encountered.

**To flag a key as safe for removal:**
- Add the key to the `evictableKeys` option in `Onyx.init(options)`
- Implement `canEvict` in the Onyx config for each component subscribing to a key
- The key will only be deleted when all subscribers return `true` for `canEvict`

Example:
```js
Onyx.init({
    evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
});

export default withOnyx({
    reportActions: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        canEvict: props => !props.isActiveReport,
    },
})(ReportActionsView);
```

## canBeMissing Parameter

The `canBeMissing` parameter indicates whether a component connecting to Onyx expects the data to be present or if it can handle missing data gracefully.

### - Components MUST use the `canBeMissing` parameter appropriately
This parameter was added because in some places we are assuming some data will be there, but actually we never load it, which leads to hard to debug bugs.

The linter error exists until we add the param to all callers. Once that happens we can make the param mandatory and remove the linter.

### - `canBeMissing` SHOULD be set to `false` when data is guaranteed to be present
The main criteria for setting `canBeMissing` to `false`:

- **Data is always loaded before component renders**: If the data is always ensured to be loaded before this component renders, then `canBeMissing` SHOULD be set to `false`
- **Always returned by OpenApp**: Any data that is always returned by `OpenApp` used in a component where we have a user (so not in the homepage for example) will have `canBeMissing` set to `false`
- **User always has data**: Maybe we always try to load a piece of data, but the data can be missing/empty, in this case `canBeMissing` would be set to `false`

### - `canBeMissing` SHOULD be set to `true` for potentially missing data
If neither of the above conditions apply, then the param SHOULD probably be `true`, but additionally we MUST make sure that the code using the data manages correctly the fact that the data might be missing.

Context: [Slack discussion](https://expensify.slack.com/archives/C03TQ48KC/p1741208342513379)