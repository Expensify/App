**Solution Overview**

The problem is that the NewDot client renders feed names from a hard‑coded string instead of the *default name* that lives in the `bankList`.  
When a user has several feeds of the same bank (e.g. `vcf1`, `vcf2`, `cdf1`, `cdf2`) they all appear as “Commercial Card Feed” – the generic name that NewDot uses.

The fix is to:

1. **Pull the default name from `bankList`** whenever a feed is rendered.
2. **Keep the old behaviour** (custom name set by the user) as a higher‑priority override.
3. **Append the series number** (`1`, `2`, …) for feeds that belong to a numbered series (`vcf1`, `vcf2`, `cdf1`, `cdf2`).

Below is a minimal, self‑contained patch that can be dropped into the existing `CardUtils.ts` file.

---

## 1. Add a helper that resolves the display name

```ts
// CardUtils.ts
import type { Feed, BankList, Bank } from "./types";

/**
 * Resolve the display name for a feed.
 *
 * Priority order:
 *   1. Custom name set by the user (`feed.customName`)
 *   2. Default name from the bankList (bank.defaultName → bank.alias → bank.name)
 *   3. Fallback to the feed type (e.g. "vcf1")
 *
 * For numbered feeds (vcf1, vcf2, cdf1, cdf2) the series number is appended
 * to the default name so that feeds are distinguishable.
 */
export function getFeedDisplayName(
  feed: Feed,
  bankList: BankList
): string {
  // 1️⃣ Custom name wins
  if (feed.customName) {
    return feed.customName;
  }

  // 2️⃣ Resolve the bank that owns this feed
  const bankId = feed.bankId ?? feed.bank?.id;
  if (!bankId) {
    return feed.type; // nothing we can do
  }

  const bank: Bank | undefined = bankList[bankId];
  if (!bank) {
    return feed.type;
  }

  //