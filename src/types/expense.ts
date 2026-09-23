/**
 * Core expense type used throughout the app.
 *
 * Only the fields required for the mileage receipt are defined here.
 * Additional fields exist in the real codebase; they are omitted for brevity.
 */
export type Expense = {
    id: string;
    category: string;
    amount: number; // stored in cents
    currency?: string;
    mileageDistance?: number; // distance in miles (or km depending on user settings)
    receipt?: {
        url?: string; // full‑size image
        thumbnailUrl?: string; // preview image
    };
    // ... other fields
};
