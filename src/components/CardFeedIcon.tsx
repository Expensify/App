import React from 'react';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import {getCardFeedIcon, getPlaidInstitutionIconUrl, getPlaidInstitutionId} from '@libs/CardUtils';
import type {CardFeedWithDomainID} from '@src/types/onyx';
import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {IconProps} from './Icon';
import Icon from './Icon';
import PlaidCardFeedIcon from './PlaidCardFeedIcon';

type CardFeedIconProps = {
    isExpensifyCardFeed?: boolean;
    // Accepts either `CardFeedWithDomainID` (employer feeds, e.g. `vcf|123`) or the
    // bare `CardFeedWithNumber` (personal Plaid cards, e.g. `plaid.ins_109508`).
    // The internal `getPlaidInstitutionId` / `getCardFeedIcon` helpers already accept
    // the wider type.
    selectedFeed?: CardFeedWithDomainID | CardFeedWithNumber | undefined;
    iconProps?: Partial<IconProps>;
    useSkeletonLoader?: boolean;
};

function CardFeedIcon({iconProps, selectedFeed, isExpensifyCardFeed = false, useSkeletonLoader = false}: CardFeedIconProps) {
    const {src, ...restIconProps} = iconProps ?? {};

    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();

    const isPlaidCardFeed = !!getPlaidInstitutionId(selectedFeed);

    if (isExpensifyCardFeed) {
        return <ExpensifyCardFeedIcon {...iconProps} />;
    }

    if (isPlaidCardFeed) {
        return (
            <PlaidCardFeedIcon
                plaidUrl={getPlaidInstitutionIconUrl(selectedFeed)}
                useSkeletonLoader={useSkeletonLoader}
                {...restIconProps}
            />
        );
    }

    if (!selectedFeed) {
        return null;
    }

    return (
        <Icon
            src={src ?? getCardFeedIcon(selectedFeed, illustrations, companyCardFeedIcons)}
            {...restIconProps}
        />
    );
}

function ExpensifyCardFeedIcon(iconProps: Partial<IconProps>) {
    const {src, ...restIconProps} = iconProps ?? {};

    const memoizedIllustrations = useMemoizedLazyIllustrations(['ExpensifyCardImage']);

    return (
        <Icon
            src={memoizedIllustrations.ExpensifyCardImage}
            {...restIconProps}
        />
    );
}

export default CardFeedIcon;
