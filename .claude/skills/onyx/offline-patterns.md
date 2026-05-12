# Optimistic Patterns Code Examples

## Pattern A: Optimistic Without Feedback

No `successData`/`failureData` — fire and forget.

```typescript
function pinReport(reportID: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {isPinned: true},
        },
    ];

    API.write('TogglePinnedChat', {reportID}, {optimisticData});
}
```

## Pattern B: Optimistic With Feedback

Show pending state; revert or clean up on completion.

```typescript
function deleteReport(reportID: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: null,
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                statusNum: null,
                pendingAction: null,
                errors: {[DateUtils.getMicroseconds()]: 'Failed to delete report'},
            },
        },
    ];

    API.write('DeleteReport', {reportID}, {optimisticData, successData, failureData});
}
```

## Example with Loading State

```typescript
function sendMessage(reportID: string, text: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                isLoading: true,
                lastMessageText: text,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                isLoading: false,
                pendingAction: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                isLoading: false,
                lastMessageText: null,
                pendingAction: null,
                errors: {[DateUtils.getMicroseconds()]: 'Failed to send message'},
            },
        },
    ];

    API.write('AddComment', {reportID, text}, {optimisticData, successData, failureData});
}
```

## Using finallyData

When `successData` and `failureData` would be identical, use `finallyData` instead:

```typescript
const finallyData: OnyxUpdate[] = [
    {
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.SOME_KEY,
        value: {
            isLoading: false,
            pendingAction: null,
        },
    },
];

API.write('SomeCommand', params, {optimisticData, finallyData});
```
