import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Returns the provided policyID or falls back to the active policy ID.
 * Used for unreported expenses (SelfDM) to show policy-specific fields like categories and tags.
 */
export default function useEffectivePolicyID(policyID?: string): string | undefined {
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);

    // NOTE: Using || instead of ?? to treat empty string "" as falsy
    // This ensures empty strings fall back to active policy
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return policyID || activePolicyID;
}
