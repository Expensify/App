import React from 'react';
import type {ReactElement} from 'react';
import {useLHNTooltipContext} from '@components/LHNOptionsList/LHNTooltipContext';
import useLHNRowProductTrainingTooltip from '@components/LHNOptionsList/OptionRowLHN/useLHNRowProductTrainingTooltip';
import {useSession} from '@components/OnyxListItemProvider';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {isAdminRoom, isChatUsedForOnboarding as isChatUsedForOnboardingReportUtils, isConciergeChatReport} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type ProductTrainingTooltipProps = {
    /** Option data, drives onboarding eligibility checks for the educational tooltip. */
    optionItem: OptionData;

    /** Row content the tooltip anchors to. */
    children: ReactElement;
};

type ProductTrainingTooltipInnerProps = {
    children: ReactElement;
};

function ProductTrainingTooltipInner({children}: ProductTrainingTooltipInnerProps) {
    const styles = useThemeStyles();
    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip, hideProductTrainingTooltip} = useLHNRowProductTrainingTooltip();

    return (
        <EducationalTooltip
            shouldRender={shouldShowProductTrainingTooltip}
            renderTooltipContent={renderProductTrainingTooltip}
            anchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            }}
            shiftHorizontal={variables.gbrTooltipShiftHorizontal}
            shiftVertical={variables.gbrTooltipShiftVertical}
            wrapperStyle={styles.productTrainingTooltipWrapper}
            onTooltipPress={hideProductTrainingTooltip}
            shouldHideOnScroll
        >
            {children}
        </EducationalTooltip>
    );
}

ProductTrainingTooltipInner.displayName = 'OptionRow.ProductTrainingTooltipInner';

function ProductTrainingTooltip({optionItem, children}: ProductTrainingTooltipProps) {
    const {firstReportIDWithGBRorRBR, onboardingPurpose, onboarding} = useLHNTooltipContext();
    const session = useSession();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const shouldShowRBRorGBRTooltip = firstReportIDWithGBRorRBR === optionItem.reportID;
    const isOnboardingGuideAssigned = onboardingPurpose === CONST.ONBOARDING_CHOICES.MANAGE_TEAM && !session?.email?.includes('+');
    const isChatUsedForOnboarding = isChatUsedForOnboardingReportUtils(optionItem, onboarding, conciergeReportID, onboardingPurpose);
    const shouldShowGetStartedTooltip = isOnboardingGuideAssigned ? isAdminRoom(optionItem) && isChatUsedForOnboarding : isConciergeChatReport(optionItem);

    // Skip the inner component (and its heavy hooks) entirely when the row can never show a tooltip.
    const shouldEvaluateTooltip = shouldShowRBRorGBRTooltip || shouldShowGetStartedTooltip;

    if (!shouldEvaluateTooltip) {
        return children;
    }

    return <ProductTrainingTooltipInner>{children}</ProductTrainingTooltipInner>;
}

ProductTrainingTooltip.displayName = 'OptionRow.ProductTrainingTooltip';

export default ProductTrainingTooltip;
