---
name: Date-bound mileage rates (Release 1)
overview: |
  Implement date-based mileage rates for the Expensify App. This adds optional startDate and endDate fields
  to distance rates, updates the admin UI (create/edit/list), implements date-aware rate selection during
  expense creation/editing, adds a new violation for out-of-range rates, and updates workspace change logs.
  This plan covers Release 1 only (no auto-updating government rates).
  Split into 8 PRs matching the GitHub issues.
todos:
  - id: pr-1
    content: "PR 1 (#89830): Add date bounds to mileage rate create flow — types, form, validation, optimistic data"
    status: pending
  - id: pr-2
    content: "PR 2 (#89831): Replace workspace mileage rate list with table UI — Table component, status/date columns"
    status: pending
  - id: pr-3
    content: "PR 3 (#89832): Add mileage rate edit form + UpdatePolicyDistanceRate — inline edit, unified API, clearing dates"
    status: pending
  - id: pr-4
    content: "PR 4 (#89833): Render workspace change logs for mileage rate date bounds — original message types, message builders, translations"
    status: pending
  - id: pr-5
    content: "PR 5 (#89834): Make distance request creation date-aware — MileageRate dates, getCustomUnitRateID, pass created through create flow"
    status: pending
  - id: pr-6
    content: "PR 6 (#89835): Update confirmation and rate selection UX — auto-fill, tooltip, date range text in rate picker"
    status: pending
  - id: pr-7
    content: "PR 7 (#89836): Date-aware rate recalculation on edit — recompute rate on date edit, UpdateMoneyRequestDistanceRate with created"
    status: pending
  - id: pr-8
    content: "PR 8 (#89837): Add customUnitRateOutOfDateRange violation UI — violation constant, data type, optimistic logic, translations"
    status: pending
isProject: false
---

# Date-bound Mileage Rates — Release 1 Implementation Plan

## Design Doc Summary

Add optional `startDate` and `endDate` fields to each mileage rate so Expensify can select the correct
rate based on trip date. This reduces incorrect reimbursements when rates change over time.

Key outcomes:
- Admins can set date bounds on distance rates
- Rate list shows status labels (Active/Future/Expired/Inactive)
- Expense creation auto-selects the best rate for the trip date
- Changing the expense date recalculates the rate
- A non-blocking violation appears when a manually selected rate doesn't match the trip date
- Workspace change logs include date information

---

## PR Dependency Graph

```
PR 1 (#89830) — Create flow + types (foundation)
    │
    ├── PR 2 (#89831) — Table UI (depends on PR 1 for status constants + Rate type)
    │
    ├── PR 3 (#89832) — Edit form + API (depends on PR 1 for Rate type with dates)
    │
    ├── PR 4 (#89833) — Change logs (depends on PR 1 for date fields on Rate)
    │
    ├── PR 5 (#89834) — Date-aware rate selection (depends on PR 1 for MileageRate type)
    │       │
    │       ├── PR 6 (#89835) — Confirmation UX + tooltip (depends on PR 5 for getCustomUnitRateID)
    │       │
    │       └── PR 7 (#89836) — Edit date recalc (depends on PR 5 for getCustomUnitRateID)
    │
    └── PR 8 (#89837) — Violation (depends on PR 1 for date fields; independent of PRs 5-7)
```

---

## PR 1 (#89830): Add date bounds to mileage rate create flow

**Issue:** [App: Add date bounds to mileage rate create flow](https://github.com/Expensify/App/issues/89830)

**Scope:** Add `startDate`/`endDate` to policy rate types, optimistic create data,
`CreatePolicyDistanceRate` params, create form inputs, validation, and submit payload.

### 1.1 Update `Rate` type

**File:** `src/types/onyx/Policy.ts` (lines 34–68)

Add `startDate` and `endDate` as optional string fields to the `Rate` type:

```typescript
type Rate = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        name?: string;
        rate?: number;
        currency?: string;
        customUnitRateID: string;
        enabled?: boolean;
        errors?: OnyxCommon.Errors;
        errorFields?: OnyxCommon.ErrorFields;
        attributes?: TaxRateAttributes;
        subRates?: Subrate[];
        index?: number;
        /** ISO 8601 date string (e.g. "2026-01-01") for when this rate becomes effective */
        startDate?: string;
        /** ISO 8601 date string (e.g. "2026-12-31") for when this rate expires */
        endDate?: string;
    },
    keyof TaxRateAttributes
>;
```

### 1.2 Update form types

**File:** `src/types/form/PolicyCreateDistanceRateForm.ts`

Add `name`, `startDate`, and `endDate` input IDs:

```typescript
const INPUT_IDS = {
    RATE: 'rate',
    NAME: 'name',
    START_DATE: 'startDate',
    END_DATE: 'endDate',
} as const;

type PolicyCreateDistanceRateForm = Form<
    InputID,
    {
        [INPUT_IDS.RATE]: string;
        [INPUT_IDS.NAME]: string;
        [INPUT_IDS.START_DATE]: string;
        [INPUT_IDS.END_DATE]: string;
    }
>;
```

### 1.3 Add rate status constants

**File:** `src/CONST/index.ts`

Add status constants under `CUSTOM_UNITS`:

```typescript
CUSTOM_UNITS: {
    // ... existing fields ...
    RATE_STATUS: {
        ACTIVE: 'active',
        FUTURE: 'future',
        EXPIRED: 'expired',
        INACTIVE: 'inactive',
    },
},
```

### 1.4 Add validation for expanded create form

**File:** `src/libs/PolicyDistanceRatesUtils.ts`

Add `validateCreateDistanceRateForm` that validates:
- Rate value (reuse existing `validateRateValue`)
- Name — required, unique across existing rates
- Date ordering — end date must not be before start date

**Validation messages per design doc:**
- Non-unique name: `"A distance rate with this name already exists."`
- Missing name and amount: `"Name and amount are required"`
- Missing name: `"Name is required."`
- Missing amount: `"Amount is required."`
- End date before start date: `"Start date must occur before end date"`

### 1.5 Redesign `CreateDistanceRatePage.tsx`

**File:** `src/pages/workspace/distanceRates/CreateDistanceRatePage.tsx`

Currently only has an `AmountForm`. Expand to include:
1. **Name input** (`TextInput` via `InputWrapper`) — required
2. **Amount input** (current `AmountForm`) — required
3. **Start date input** (`DatePicker` via `InputWrapper`) — optional
4. **End date input** (`DatePicker` via `InputWrapper`) — optional

**Key changes:**
- Replace single `AmountForm` with `FormProvider` containing all four fields
- Admin now enters the name directly (remove `getOptimisticRateName()`)
- Include `startDate` and `endDate` in the `Rate` object passed to `createPolicyDistanceRate`

Submit handler:
```typescript
const newRate: Rate = {
    currency,
    name: values.name,
    rate: parseFloat(values.rate) * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET,
    customUnitRateID,
    enabled: true,
    ...(values.startDate ? {startDate: values.startDate} : {}),
    ...(values.endDate ? {endDate: values.endDate} : {}),
};
```

### 1.6 `createPolicyDistanceRate` — no action changes needed

**File:** `src/libs/actions/Policy/DistanceRate.ts` (lines 129–192)

Already serializes the full `Rate` object via `JSON.stringify(customUnitRate)`, so `startDate`
and `endDate` flow through automatically once on the `Rate` type.

### 1.7 Translation strings for this PR

**File:** `src/languages/en.ts`

Under `workspace.distanceRates`:
```typescript
startDate: 'Start date',
endDate: 'End date',
errors: {
    nameRequired: 'Name is required.',
    amountRequired: 'Amount is required.',
    nameAndAmountRequired: 'Name and amount are required.',
    nameAlreadyExists: 'A distance rate with this name already exists.',
    startDateMustBeBeforeEndDate: 'Start date must occur before end date.',
},
```

### Files changed in this PR
| File | Changes |
|------|---------|
| `src/types/onyx/Policy.ts` | Add `startDate`, `endDate` to `Rate` |
| `src/types/form/PolicyCreateDistanceRateForm.ts` | Add `name`, `startDate`, `endDate` inputs |
| `src/CONST/index.ts` | Add `RATE_STATUS` constants |
| `src/libs/PolicyDistanceRatesUtils.ts` | Add `validateCreateDistanceRateForm` |
| `src/pages/workspace/distanceRates/CreateDistanceRatePage.tsx` | Full form with name, amount, dates |
| `src/languages/en.ts` | Validation + label strings |
| `src/languages/es.ts` | Spanish equivalents |

---

## PR 2 (#89831): Replace workspace mileage rate list with table UI

**Issue:** [App: Replace workspace mileage rate list with table UI](https://github.com/Expensify/App/issues/89831)

**Scope:** Refactor `PolicyDistanceRatesPage` to use the generic `Table` component with status, name,
rate, start date, and end date columns, plus checkbox selection.

### 2.1 Add status derivation utility

**File:** `src/libs/PolicyDistanceRatesUtils.ts`

```typescript
function getRateStatus(rate: Rate): ValueOf<typeof CONST.CUSTOM_UNITS.RATE_STATUS> {
    if (!rate.enabled) {
        return CONST.CUSTOM_UNITS.RATE_STATUS.INACTIVE;
    }
    const today = new Date().toISOString().split('T')[0];
    if (rate.startDate && rate.startDate > today) {
        return CONST.CUSTOM_UNITS.RATE_STATUS.FUTURE;
    }
    if (rate.endDate && rate.endDate < today) {
        return CONST.CUSTOM_UNITS.RATE_STATUS.EXPIRED;
    }
    return CONST.CUSTOM_UNITS.RATE_STATUS.ACTIVE;
}
```

**Status logic per design doc:**
- **Inactive**: `enabled` is false (regardless of dates)
- **Future**: `enabled` is true AND `startDate > today`
- **Expired**: `enabled` is true AND `endDate < today`
- **Active**: `enabled` is true AND today falls within range (or no date bounds)

### 2.2 Refactor `PolicyDistanceRatesPage.tsx` to Table component

**File:** `src/pages/workspace/distanceRates/PolicyDistanceRatesPage.tsx`

Follow the pattern in `WorkspaceCompanyCardsTable` (`src/pages/workspace/companyCards/WorkspaceCompanyCardsTable/index.tsx`).

**New columns (in order):**
1. **Status** — derived label: Active / Future / Expired / Inactive
2. **Name** — rate name
3. **Rate** — formatted amount and unit (e.g., `$0.67 / mi`)
4. **Start date** — formatted as `MMMM dd, yyyy` or empty
5. **End date** — formatted as `MMMM dd, yyyy` or empty

**New types:**
```typescript
type DistanceRateColumnKey = 'status' | 'name' | 'rate' | 'startDate' | 'endDate';
```

**Key implementation details:**
- Create `DistanceRateTableItem` layout component for each row
- `Table` doesn't have selection out of the box — add `Checkbox` at header and on each row item
- Selection logic stays in `PolicyDistanceRatesPage`
- Initial sort column: `name` (alphabetical, per design doc)
- `compareItems` callback supports sorting by each column key

### 2.3 Translation strings for this PR

```typescript
statusActive: 'Active',
statusFuture: 'Future',
statusExpired: 'Expired',
statusInactive: 'Inactive',
status: 'Status',
```

### Files changed in this PR
| File | Changes |
|------|---------|
| `src/pages/workspace/distanceRates/PolicyDistanceRatesPage.tsx` | Full refactor to `Table` component |
| `src/libs/PolicyDistanceRatesUtils.ts` | Add `getRateStatus` |
| `src/languages/en.ts` | Status label strings |
| `src/languages/es.ts` | Spanish equivalents |

---

## PR 3 (#89832): Add mileage rate edit form and UpdatePolicyDistanceRate support

**Issue:** [App: Add mileage rate edit form and UpdatePolicyDistanceRate support](https://github.com/Expensify/App/issues/89832)

**Scope:** Convert the mileage rate edit page to inline edit style, add date fields and enabled
toggle, send `UpdatePolicyDistanceRate`, and support clearing dates with null.

### 3.1 Add `UpdatePolicyDistanceRate` write command

**File:** `src/libs/API/types.ts`

```typescript
UPDATE_POLICY_DISTANCE_RATE: 'UpdatePolicyDistanceRate',
```

### 3.2 Create/reuse API parameter type

Reuse the existing `UpdatePolicyDistanceRateValueParams` shape (same fields: `policyID`,
`customUnitID`, `customUnitRateArray`).

### 3.3 Add action function

**File:** `src/libs/actions/Policy/DistanceRate.ts`

```typescript
function updatePolicyDistanceRate(policyID: string, customUnit: CustomUnit, updatedRates: Rate[]) {
    // Build optimistic/success/failure data — need to handle multiple pending fields
    const params = {
        policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateArray: JSON.stringify(prepareCustomUnitRatesArray(updatedRates)),
    };
    API.write(WRITE_COMMANDS.UPDATE_POLICY_DISTANCE_RATE, params, {optimisticData, successData, failureData});
}
```

### 3.4 Update `buildOnyxDataForPolicyDistanceRateUpdates`

**File:** `src/libs/PolicyDistanceRatesUtils.ts`

Extend `PolicyDistanceRateUpdateField` to include `startDate` and `endDate`:
```typescript
type PolicyDistanceRateUpdateField = keyof Pick<Rate, 'name' | 'rate' | 'startDate' | 'endDate'> | keyof TaxRateAttributes;
```

Consider creating a variant that handles multiple pending fields for the unified update path.

### 3.5 Redesign `PolicyDistanceRateDetailsPage.tsx`

**File:** `src/pages/workspace/distanceRates/PolicyDistanceRateDetailsPage.tsx`

Currently shows: Enable toggle, Name menu item, Rate menu item, Tax fields, Delete button.

Update to inline-edit form style:
1. **Enable toggle** — existing
2. **Name** (`TextInput`) — change from menu item to inline input
3. **Amount** (`NumberWithSymbolForm`) — change from menu item to inline input
4. **Start date** (`DatePicker`) — NEW
5. **End date** (`DatePicker`) — NEW
6. **Tax fields** — keep as menu items (unchanged)
7. **Delete button** — existing

All changes saved via single `UpdatePolicyDistanceRate` API call on form submit.

### 3.6 Handle clearing date bounds

- Send `startDate: null` or `endDate: null` in the update payload
- Backend `CustomUnitRate::merge()` treats `null` as clearing the field
- `toArray()` / `toJSON()` omit `startDate`/`endDate` when empty or null

### Files changed in this PR
| File | Changes |
|------|---------|
| `src/libs/API/types.ts` | Add `UPDATE_POLICY_DISTANCE_RATE` command |
| `src/libs/API/parameters/` | Parameter type (or reuse existing) |
| `src/libs/actions/Policy/DistanceRate.ts` | Add `updatePolicyDistanceRate` |
| `src/libs/PolicyDistanceRatesUtils.ts` | Extend `PolicyDistanceRateUpdateField` |
| `src/pages/workspace/distanceRates/PolicyDistanceRateDetailsPage.tsx` | Inline edit form with dates |

---

## PR 4 (#89833): Render workspace change logs for mileage rate date bounds

**Issue:** [App: Render workspace change logs for mileage rate date bounds](https://github.com/Expensify/App/issues/89833)

**Scope:** Type new original message fields, update custom unit rate added/updated message
helpers, and add date-specific workspace action translations.

### 4.1 Update `OriginalMessagePolicyChangeLog` type

**File:** `src/types/onyx/OriginalMessage.ts`

Add optional fields:
```typescript
rate?: number;
currency?: string;
unit?: string;
startDate?: string;
endDate?: string;
```

### 4.2 Update `getWorkspaceCustomUnitRateAddedMessage`

**File:** `src/libs/ReportActionsUtils.ts` (line ~3175)

Handle new formats per design doc:
- No dates: `added a '2025 mileage' rate for $0.57/mile`
- Start only or end only: `added a '2025 mileage' rate for $0.57/mile, valid from March 31, 2026`
- Both dates: `added a '2025 mileage' rate for $0.57/mile, valid from March 31, 2026 to December 31, 2026`

### 4.3 Update `getWorkspaceCustomUnitRateUpdatedMessage`

**File:** `src/libs/ReportActionsUtils.ts` (line ~3186)

Add cases for date-only updates per design doc:
- Start date change: `updated the start date of the '2025 mileage' rate to April 1, 2026 (previously March 15, 2026)`
- End date change: similar format
- Both dates change: `updated the start and end date of the '2025 mileage' rate to April 1, 2026 - May 31, 2026 (previously March 1, 2026 - April 30, 2026)`

### 4.4 Translation strings

**File:** `src/languages/en.ts` (under `workspaceActions`)

```typescript
addCustomUnitRateWithDates: (rateName, formattedRate, startDate, endDate) =>
    `added a '${rateName}' rate for ${formattedRate}, valid from ${startDate} to ${endDate}`,
addCustomUnitRateWithDate: (rateName, formattedRate, date) =>
    `added a '${rateName}' rate for ${formattedRate}, valid from ${date}`,
updatedCustomUnitRateStartDate: (rateName, newValue, oldValue) => ...,
updatedCustomUnitRateEndDate: (rateName, newValue, oldValue) => ...,
updatedCustomUnitRateStartAndEndDate: (rateName, newDates, oldDates) => ...,
```

### Files changed in this PR
| File | Changes |
|------|---------|
| `src/types/onyx/OriginalMessage.ts` | Add date fields to `OriginalMessagePolicyChangeLog` |
| `src/libs/ReportActionsUtils.ts` | Update add/update message builders |
| `src/languages/en.ts` | Change log translation strings |
| `src/languages/es.ts` | Spanish equivalents |

---

## PR 5 (#89834): Make distance request creation choose date-aware mileage rates

**Issue:** [App: Make distance request creation choose date-aware mileage rates](https://github.com/Expensify/App/issues/89834)

**Scope:** Add date bounds to `MileageRate`, update `getMileageRates()`, make `getCustomUnitRateID`
date-aware, pass created date through create flow call sites, and recalculate draft rate
when date changes.

### 5.1 Update `MileageRate` type

**File:** `src/libs/DistanceRequestUtils.ts` (lines 15–23)

Add `startDate` and `endDate`:
```typescript
type MileageRate = {
    customUnitRateID?: string;
    rate?: number;
    currency?: string;
    unit: Unit;
    name?: string;
    enabled?: boolean;
    index?: number;
    startDate?: string;
    endDate?: string;
};
```

### 5.2 Update `getMileageRates()`

**File:** `src/libs/DistanceRequestUtils.ts` (lines 37–70)

Copy `startDate` and `endDate` from the policy rate object.

### 5.3 Add date-aware helper functions

**File:** `src/libs/DistanceRequestUtils.ts`

```typescript
function isRateValidForDate(rate: Rate | MileageRate, dateString?: string): boolean {
    if (!dateString) return true;
    if (rate.startDate && dateString < rate.startDate) return false;
    if (rate.endDate && dateString > rate.endDate) return false;
    return true;
}

function getBestEligibleRateForDate(distanceUnit: CustomUnit | undefined, dateString: string): Rate | undefined {
    // Filter enabled rates valid for the date
    // Tie-break: bounded > unbounded, narrower range, latest startDate, array order
}
```

### 5.4 Update `getCustomUnitRateID`

**File:** `src/libs/DistanceRequestUtils.ts` (lines 346–386)

Add `expenseDate` parameter. New selection order:
1. Last selected rate, if enabled AND valid for the expense date
2. Best eligible rate for the expense date (tie-breaking rules)
3. Default rate fallback (no violation)

### 5.5 Update all callers to pass `expenseDate`

| Caller | File | Lines |
|--------|------|-------|
| `initMoneyRequest` | `src/libs/actions/IOU/index.ts` | ~361 |
| `handleMoneyRequestStepDistanceNavigation` (3 call sites) | `src/libs/actions/IOU/MoneyRequest.ts` | ~672, ~721, ~774 |
| `useParticipantSubmission` (2 call sites) | `src/hooks/useParticipantSubmission.ts` | ~181, ~238 |

### 5.6 Recalculate draft rate on date change during creation

**File:** `src/pages/iou/request/step/IOURequestStepDate.tsx`

After `setMoneyRequestCreated(...)`, for workspace distance requests:
```typescript
if (isDistanceRequest && policy) {
    const newRateID = DistanceRequestUtils.getCustomUnitRateID({
        reportID, isPolicyExpenseChat: true, policy, lastSelectedDistanceRates,
        expenseDate: newCreated,
    });
    if (newRateID !== currentCustomUnitRateID) {
        setCustomUnitRateID(transactionID, newRateID, transaction, policy);
    }
}
```

### Files changed in this PR
| File | Changes |
|------|---------|
| `src/libs/DistanceRequestUtils.ts` | `MileageRate` type, `getMileageRates`, `isRateValidForDate`, `getBestEligibleRateForDate`, `getCustomUnitRateID` |
| `src/libs/actions/IOU/index.ts` | Pass `expenseDate` in `initMoneyRequest` |
| `src/libs/actions/IOU/MoneyRequest.ts` | Pass `expenseDate` in 3 call sites |
| `src/hooks/useParticipantSubmission.ts` | Pass `expenseDate` in 2 call sites |
| `src/pages/iou/request/step/IOURequestStepDate.tsx` | Recalculate rate on date change (create mode) |

---

## PR 6 (#89835): Update confirmation and rate selection UX for date-aware mileage rates

**Issue:** [App: Update confirmation and rate selection UX for date-aware mileage rates](https://github.com/Expensify/App/issues/89835)

**Scope:** Use date-aware rate auto-fill on confirmation, show auto-updated tooltip when date
changes alter the rate, and display rate date range text in the rate picker.

### 6.1 Update `DistanceRequestController.tsx`

**File:** `src/components/MoneyRequestConfirmationList/DistanceRequestController.tsx` (line ~154)

Pass `transaction.created` as `expenseDate` to date-aware rate selection when auto-filling
a missing workspace `customUnitRateID`.

### 6.2 Show tooltip on rate auto-update

**File:** `src/components/MoneyRequestConfirmationList.tsx`

Detect auto-update with `usePrevious`:
```typescript
const prevCreated = usePrevious(transaction?.created);
const prevCustomUnitRateID = usePrevious(customUnitRateID);
const shouldShowRateAutoUpdatedTooltip = /* both changed */;
```

Pass through:
- `MoneyRequestConfirmationListFooter.tsx`
- → `TransactionDetailsFields.tsx`
- → `RateField.tsx`

### 6.3 Update `RateField.tsx` with EducationalTooltip

**File:** `src/components/MoneyRequestConfirmationList/sections/RateField.tsx`

Wrap `MenuItemWithTopDescription` with `EducationalTooltip`:
```typescript
<EducationalTooltip
    shouldRender={shouldShowRateAutoUpdatedTooltip}
    text={translate('workspace.distanceRates.rateUpdatedBasedOnTravelDate')}
>
    <MenuItemWithTopDescription ... />
</EducationalTooltip>
```

### 6.4 Update `IOURequestStepDistanceRate.tsx` — date range text

**File:** `src/pages/iou/request/step/IOURequestStepDistanceRate.tsx`

Display format per design doc:
- Start + end: `$0.67 / mi • Feb 1, 2026 to Feb 28, 2026`
- Start only: `$0.67 / mi • Valid from Feb 1, 2026`
- End only: `$0.67 / mi • Valid until Feb 28, 2026`
- Neither: `$0.67 / mi` (no dot separator)

Add helper `getDateRangeDisplay` in `DistanceRequestUtils.ts`.

### 6.5 Translation strings

```typescript
validFrom: ({date}) => `Valid from ${date}`,
validUntil: ({date}) => `Valid until ${date}`,
rateUpdatedBasedOnTravelDate: 'We updated the rate based on your travel date.',
```

### Files changed in this PR
| File | Changes |
|------|---------|
| `src/components/MoneyRequestConfirmationList/DistanceRequestController.tsx` | Pass `expenseDate` |
| `src/components/MoneyRequestConfirmationList.tsx` | Detect auto-update, pass tooltip flag |
| `src/components/MoneyRequestConfirmationList/sections/RateField.tsx` | Add `EducationalTooltip` |
| `src/components/MoneyRequestConfirmationListFooter.tsx` | Pass through tooltip prop |
| `src/components/MoneyRequestConfirmationListFooter/fieldGroups/TransactionDetailsFields.tsx` | Pass through tooltip prop |
| `src/pages/iou/request/step/IOURequestStepDistanceRate.tsx` | Date range text display |
| `src/libs/DistanceRequestUtils.ts` | Add `getDateRangeDisplay` helper |
| `src/languages/en.ts` | Tooltip + date display strings |
| `src/languages/es.ts` | Spanish equivalents |

---

## PR 7 (#89836): Date-aware rate recalculation when editing distance request date

**Issue:** [App: Support date-aware mileage rate recalculation when editing distance request date](https://github.com/Expensify/App/issues/89836)

**Scope:** When editing an existing workspace distance request date, recompute the date-aware
`customUnitRateID` and call `UpdateMoneyRequestDistanceRate` with `created` when the rate changes.

### 7.1 Update `IOURequestStepDate.tsx` for edit mode

**File:** `src/pages/iou/request/step/IOURequestStepDate.tsx`

In edit mode, for workspace distance requests:
```typescript
if (isEditing && isDistanceRequest && policy && newCreated !== transaction?.created) {
    const newRateID = DistanceRequestUtils.getCustomUnitRateID({
        reportID, isPolicyExpenseChat: true, policy, expenseDate: newCreated,
    });
    if (newRateID !== currentCustomUnitRateID) {
        updateMoneyRequestDistanceRate({
            transactionID, rateID: newRateID, created: newCreated, ...
        });
        return; // Don't also call updateMoneyRequestDate
    }
}
```

### 7.2 Update `updateMoneyRequestDistanceRate` to accept `created`

**File:** `src/libs/actions/IOU/UpdateMoneyRequest.ts` (line ~717)

Add optional `created` parameter:
```typescript
function updateMoneyRequestDistanceRate({
    ...existing params...,
    created,  // NEW
}: {
    ...existing types...,
    created?: string;
}) {
    const transactionChanges: TransactionChanges = {
        customUnitRateID: rateID,
        ...(created ? {created} : {}),
        ...existing tax changes...
    };
}
```

### 7.3 Backend changes (Auth / Web-E — not in this repo)

- Auth `UpdateMoneyRequestDistanceRate`: accept optional `created`, validate permissions, include `modifiedCreated`
- Web-E `api.php`: read optional `created`, pass to Auth
- Web-E `TransactionAPI::updateMoneyRequestDistanceRate`: accept and forward `created`

### Files changed in this PR
| File | Changes |
|------|---------|
| `src/pages/iou/request/step/IOURequestStepDate.tsx` | Recalculate rate on date edit |
| `src/libs/actions/IOU/UpdateMoneyRequest.ts` | Add `created` param to `updateMoneyRequestDistanceRate` |

---

## PR 8 (#89837): Add customUnitRateOutOfDateRange violation UI

**Issue:** [App: Add customUnitRateOutOfDateRange violation UI](https://github.com/Expensify/App/issues/89837)

**Scope:** Add `customUnitRateOutOfDateRange` to `CONST.VIOLATIONS`, support `startDate`/`endDate`
violation data, map it to `customUnitRateID`, add optimistic warning logic, and render
translated date range copy.

### 8.1 Add violation constant

**File:** `src/CONST/index.ts` (under `VIOLATIONS`)

```typescript
CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE: 'customUnitRateOutOfDateRange',
```

### 8.2 Update `TransactionViolationData`

**File:** `src/types/onyx/TransactionViolation.ts`

```typescript
type TransactionViolationData = {
    // ... existing fields ...
    /** Start date of the rate's valid range (for customUnitRateOutOfDateRange) */
    startDate?: string;
    /** End date of the rate's valid range (for customUnitRateOutOfDateRange) */
    endDate?: string;
};
```

### 8.3 Update `useViolations.ts`

**File:** `src/hooks/useViolations.ts`

Map the new violation to the rate field:
```typescript
customUnitRateOutOfDateRange: () => 'customUnitRateID',
```

### 8.4 Update `ViolationsUtils.getViolationsOnyxData`

**File:** `src/libs/Violations/ViolationsUtils.ts` (after line ~446)

After the existing `customUnitOutOfPolicy` check:
```typescript
if (customUnitRateID && customRate && TransactionUtils.isDistanceRequest(updatedTransaction)) {
    const transactionDate = updatedTransaction.created;
    const isOutOfRange = !isRateValidForDate(customRate, transactionDate);

    newTransactionViolations = reject(newTransactionViolations,
        {name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE});

    if (isOutOfRange) {
        newTransactionViolations.push({
            name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
            type: CONST.VIOLATION_TYPES.WARNING,
            showInReview: true,
            data: { startDate: customRate.startDate, endDate: customRate.endDate },
        });
    }
}
```

### 8.5 Add violation message translation

**File:** `src/libs/Violations/ViolationsUtils.ts`

```typescript
case 'customUnitRateOutOfDateRange': {
    const {startDate, endDate} = data ?? {};
    if (startDate && endDate) return translate('violations.customUnitRateOutOfDateRange', {startDate, endDate});
    if (startDate) return translate('violations.customUnitRateOutOfDateRangeStartOnly', {startDate});
    if (endDate) return translate('violations.customUnitRateOutOfDateRangeEndOnly', {endDate});
    return '';
}
```

### 8.6 Translation strings

**File:** `src/languages/en.ts` (under `violations`)

```typescript
customUnitRateOutOfDateRange: ({startDate, endDate}) =>
    `Rate is only valid from ${startDate} to ${endDate}`,
customUnitRateOutOfDateRangeStartOnly: ({startDate}) =>
    `Rate is only valid from ${startDate}`,
customUnitRateOutOfDateRangeEndOnly: ({endDate}) =>
    `Rate is only valid until ${endDate}`,
```

### 8.7 Auth backend violation (not in this repo)

Auth adds `customUnitRateOutOfDateRange` in `Violations::addCustomUnitViolations`:
- Update `TransactionCustomUnitData` to include transaction `created` date
- Check if date falls outside rate's `startDate`/`endDate`
- Violation type: `TYPE_WARNING` (non-blocking)
- Data payload includes the rate's date range

### Files changed in this PR
| File | Changes |
|------|---------|
| `src/CONST/index.ts` | Add `CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE` violation |
| `src/types/onyx/TransactionViolation.ts` | Add `startDate`, `endDate` to `TransactionViolationData` |
| `src/hooks/useViolations.ts` | Map new violation to `customUnitRateID` field |
| `src/libs/Violations/ViolationsUtils.ts` | Add date range violation logic + translation case |
| `src/languages/en.ts` | Violation message strings |
| `src/languages/es.ts` | Spanish equivalents |

---

## Complete File Change Summary (all PRs)

### Modified files
| File | PR(s) |
|------|-------|
| `src/types/onyx/Policy.ts` | PR 1 |
| `src/types/onyx/TransactionViolation.ts` | PR 8 |
| `src/types/onyx/OriginalMessage.ts` | PR 4 |
| `src/types/form/PolicyCreateDistanceRateForm.ts` | PR 1 |
| `src/CONST/index.ts` | PR 1, PR 8 |
| `src/libs/DistanceRequestUtils.ts` | PR 5, PR 6 |
| `src/libs/PolicyDistanceRatesUtils.ts` | PR 1, PR 2, PR 3 |
| `src/libs/Violations/ViolationsUtils.ts` | PR 8 |
| `src/hooks/useViolations.ts` | PR 8 |
| `src/libs/actions/Policy/DistanceRate.ts` | PR 3 |
| `src/libs/actions/IOU/UpdateMoneyRequest.ts` | PR 7 |
| `src/libs/actions/IOU/index.ts` | PR 5 |
| `src/libs/actions/IOU/MoneyRequest.ts` | PR 5 |
| `src/hooks/useParticipantSubmission.ts` | PR 5 |
| `src/libs/ReportActionsUtils.ts` | PR 4 |
| `src/libs/API/types.ts` | PR 3 |
| `src/pages/workspace/distanceRates/CreateDistanceRatePage.tsx` | PR 1 |
| `src/pages/workspace/distanceRates/PolicyDistanceRatesPage.tsx` | PR 2 |
| `src/pages/workspace/distanceRates/PolicyDistanceRateDetailsPage.tsx` | PR 3 |
| `src/pages/iou/request/step/IOURequestStepDate.tsx` | PR 5, PR 7 |
| `src/pages/iou/request/step/IOURequestStepDistanceRate.tsx` | PR 6 |
| `src/components/MoneyRequestConfirmationList.tsx` | PR 6 |
| `src/components/MoneyRequestConfirmationList/sections/RateField.tsx` | PR 6 |
| `src/components/MoneyRequestConfirmationList/DistanceRequestController.tsx` | PR 6 |
| `src/components/MoneyRequestConfirmationListFooter.tsx` | PR 6 |
| `src/components/MoneyRequestConfirmationListFooter/fieldGroups/TransactionDetailsFields.tsx` | PR 6 |
| `src/languages/en.ts` | PR 1, PR 2, PR 4, PR 6, PR 8 |
| `src/languages/es.ts` | PR 1, PR 2, PR 4, PR 6, PR 8 |

### Backend changes (Auth / Web-E — not in this repo)
| System | PR(s) |
|--------|-------|
| Auth `PolicyCustomUnitRate` — add `startDate`/`endDate` | PR 1 |
| Auth `Violations::addCustomUnitViolations` — date range check | PR 8 |
| Auth `TransactionAPI::getDistanceRequestRate` — date-aware fallback | PR 5 |
| Auth `UpdateMoneyRequestDistanceRate` — accept `created` | PR 7 |
| Auth change log builders — date-specific messages | PR 4 |
| Web-E `CustomUnitRate.php` — `startDate`/`endDate` in merge/toArray | PR 1 |
| Web-E `PolicyAPI::updateCustomUnitRate` — validate date ordering | PR 3 |
| Web-E `api.php` — `UpdatePolicyDistanceRate` command | PR 3 |
| Web-E `api.php` — `UpdateMoneyRequestDistanceRate` reads `created` | PR 7 |
