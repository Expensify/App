import type {ReactNode} from 'react';

type EarlyRenewalBillingBannerProps = {
    /** The usual billing banner to display when no early renewal offer is available. */
    fallback: ReactNode;
};

export default EarlyRenewalBillingBannerProps;
