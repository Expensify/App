import React from 'react';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import {getCardFeedIcon, getPlaidInstitutionIconUrl, getPlaidInstitutionId} from '@libs/CardUtils';
import type {CompanyCardFeed, CompanyCardFeedWithDomainID} from '@src/types/onyx';
import type {IconProps} from './Icon';
import Icon from './Icon';
import PlaidCardFeedIcon from './PlaidCardFeedIcon';

type CardFeedIconProps = {
    isExpensifyCardFeed?: boolean;
    selectedFeed?: CompanyCardFeedWithDomainID | undefined;
    iconProps?: Partial<IconProps>;
};

function CardFeedIcon({iconProps, selectedFeed, isExpensifyCardFeed = false}: CardFeedIconProps) {
    const {src, ...restIconProps} = iconProps ?? {};

    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();

    const isPlaidCardFeed = !!getPlaidInstitutionId(selectedFeed);

    if (isExpensifyCardFeed) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <ExpensifyCardFeedIcon {...iconProps} />;
    }

    if (isPlaidCardFeed) {
        return (
            <PlaidCardFeedIcon
                plaidUrl={getPlaidInstitutionIconUrl(selectedFeed)}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...restIconProps}
            />
        );
    }

    if (!selectedFeed) {
        return null;
    }

    return (
        <Icon
            src={src ?? getCardFeedIcon(selectedFeed as CompanyCardFeed, illustrations, companyCardFeedIcons)}
            // eslint-disable-next-line react/jsx-props-no-spreading
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
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restIconProps}
        />
    );
}

export default CardFeedIcon;
