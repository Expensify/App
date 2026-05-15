import React from 'react';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import OutcomeScreenBase from '@components/MultifactorAuthentication/components/OutcomeScreen/OutcomeScreenBase';
import useLocalize from '@hooks/useLocalize';
// Spacing is needed for icon padding configuration
// eslint-disable-next-line no-restricted-imports
import spacing from '@styles/utils/spacing';
import type {TranslationPaths} from '@src/languages/types';

type SuccessScreenBaseProps = {
    headerTitle: TranslationPaths;
    illustration: IllustrationName;
    iconWidth: number;
    iconHeight: number;
    title: TranslationPaths;
    subtitle?: TranslationPaths;
    customSubtitle?: React.ReactElement;
    onClose?: () => void;
};

function SuccessScreenBase({headerTitle, illustration, iconWidth, iconHeight, title, subtitle, customSubtitle, onClose}: SuccessScreenBaseProps) {
    const {translate} = useLocalize();

    return (
        <OutcomeScreenBase
            headerTitle={translate(headerTitle)}
            illustration={illustration}
            iconWidth={iconWidth}
            iconHeight={iconHeight}
            title={translate(title)}
            subtitle={subtitle ? translate(subtitle) : undefined}
            customSubtitle={customSubtitle}
            padding={spacing.p2}
            onClose={onClose}
        />
    );
}

SuccessScreenBase.displayName = 'SuccessScreenBase';

export default SuccessScreenBase;
