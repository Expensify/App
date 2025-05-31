import {useWindowDimensions} from 'react-native';
import RenderHtml from 'react-native-render-html';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import {dismissProductTraining} from '@libs/actions/Welcome';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

const {
    CONCIERGE_LHN_GBR,
    RENAME_SAVED_SEARCH,
    BOTTOM_NAV_INBOX_TOOLTIP,
    LHN_WORKSPACE_CHAT_TOOLTIP,
    GLOBAL_CREATE_TOOLTIP,
    SCAN_TEST_TOOLTIP,
    SCAN_TEST_TOOLTIP_MANAGER,
    SCAN_TEST_CONFIRMATION,
    OUTSTANDING_FILTER,
    GBR_RBR_CHAT,
    ACCOUNT_SWITCHER,
    EXPENSE_REPORTS_FILTER,
    SCAN_TEST_DRIVE_CONFIRMATION,
} = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES;

type ProductTrainingTooltipName = ValueOf<typeof CONST.PRODUCT_TRAINING_TOOLTIP_NAMES>;

type ShouldShowConditionProps = {
    shouldUseNarrowLayout: boolean;
    isUserPolicyEmployee: boolean;
    isUserPolicyAdmin: boolean;
    hasBeenAddedToNudgeMigration: boolean;
};

type TooltipContent = {text: TranslationPaths; isBold: boolean} | {text: () => JSX.Element; isBold?: boolean};

type TooltipData = {
    content: Array<TooltipContent>;
    onHideTooltip: (isDismissedUsingCloseButton?: boolean) => void;
    name: ProductTrainingTooltipName;
    priority: number;
    shouldShow: (props: ShouldShowConditionProps) => boolean;
    shouldRenderActionButtons?: boolean;
};

const {width} = useWindowDimensions();
const {translate} = useLocalize();

const TOOLTIPS: Record<ProductTrainingTooltipName, TooltipData> = {
    [CONCIERGE_LHN_GBR]: {
        content: [
            {
                text: () => (
                    <RenderHtml
                        contentWidth={width}
                        source={{html: `<div>${translate('productTrainingTooltip.conciergeLHNGBR.full')}</div>`}}
                    />
                ),
            },
        ],
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(CONCIERGE_LHN_GBR, isDismissedUsingCloseButton),
        name: CONCIERGE_LHN_GBR,
        priority: 1300,
        shouldShow: () => false,
    },
    [RENAME_SAVED_SEARCH]: {
        content: [
            {
                text: () => (
                    <RenderHtml
                        contentWidth={width}
                        source={{html: `<div>${translate('productTrainingTooltip.saveSearchTooltip.full')}</div>`}}
                    />
                ),
            },
        ],
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(RENAME_SAVED_SEARCH, isDismissedUsingCloseButton),
        name: RENAME_SAVED_SEARCH,
        priority: 1250,
        shouldShow: ({shouldUseNarrowLayout}) => !shouldUseNarrowLayout,
    },
    [GLOBAL_CREATE_TOOLTIP]: {
        content: [
            {
                text: () => (
                    <RenderHtml
                        contentWidth={width}
                        source={{html: `<div>${translate('productTrainingTooltip.globalCreateTooltip.full')}</div>`}}
                    />
                ),
            },
        ],
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(GLOBAL_CREATE_TOOLTIP, isDismissedUsingCloseButton),
        name: GLOBAL_CREATE_TOOLTIP,
        priority: 1950,
        shouldShow: ({isUserPolicyEmployee}) => isUserPolicyEmployee,
    },
    [BOTTOM_NAV_INBOX_TOOLTIP]: {
        content: [
            {
                text: () => (
                    <RenderHtml
                        contentWidth={width}
                        source={{html: `<div>${translate('productTrainingTooltip.bottomNavInboxTooltip.full')}</div>`}}
                    />
                ),
            },
        ],
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(BOTTOM_NAV_INBOX_TOOLTIP, isDismissedUsingCloseButton),
        name: BOTTOM_NAV_INBOX_TOOLTIP,
        priority: 1700,
        shouldShow: ({hasBeenAddedToNudgeMigration}) => hasBeenAddedToNudgeMigration,
    },
    [LHN_WORKSPACE_CHAT_TOOLTIP]: {
        content: [
            {
                text: () => (
                    <RenderHtml
                        contentWidth={width}
                        source={{html: `<div>${translate('productTrainingTooltip.workspaceChatTooltip.full')}</div>`}}
                    />
                ),
            },
        ],
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(LHN_WORKSPACE_CHAT_TOOLTIP, isDismissedUsingCloseButton),
        name: LHN_WORKSPACE_CHAT_TOOLTIP,
        priority: 1800,
        shouldShow: ({isUserPolicyEmployee}) => isUserPolicyEmployee,
    },
    [GBR_RBR_CHAT]: {
        content: [
            {
                text: () => (
                    <RenderHtml
                        contentWidth={width}
                        source={{html: `<div>${translate('productTrainingTooltip.GBRRBRChat.full')}</div>`}}
                    />
                ),
            },
        ],
        onHideTooltip: () => dismissProductTraining(GBR_RBR_CHAT),
        name: GBR_RBR_CHAT,
        priority: 1900,
        shouldShow: () => true,
    },
    [ACCOUNT_SWITCHER]: {
        content: [
            {
                text: () => (
                    <RenderHtml
                        contentWidth={width}
                        source={{html: `<div>${translate('productTrainingTooltip.accountSwitcher.full')}</div>`}}
                    />
                ),
            },
        ],
        onHideTooltip: () => dismissProductTraining(ACCOUNT_SWITCHER),
        name: ACCOUNT_SWITCHER,
        priority: 1600,
        shouldShow: () => true,
    },
    [EXPENSE_REPORTS_FILTER]: {
        content: [
            {
                text: () => (
                    <RenderHtml
                        contentWidth={width}
                        source={{html: `<div>${translate('productTrainingTooltip.expenseReportsFilter.full')}</div>`}}
                    />
                ),
            },
        ],
        onHideTooltip: () => dismissProductTraining(EXPENSE_REPORTS_FILTER),
        name: EXPENSE_REPORTS_FILTER,
        priority: 2000,
        shouldShow: ({shouldUseNarrowLayout, isUserPolicyAdmin, hasBeenAddedToNudgeMigration}: ShouldShowConditionProps) =>
            !shouldUseNarrowLayout && isUserPolicyAdmin && hasBeenAddedToNudgeMigration,
    },
    [SCAN_TEST_TOOLTIP]: {
        content: [
            {
                text: () => (
                    <RenderHtml
                        contentWidth={width}
                        source={{html: `<div>${translate('productTrainingTooltip.scanTestTooltip.full')}</div>`}}
                    />
                ),
            },
        ],
        onHideTooltip: () => dismissProductTraining(SCAN_TEST_TOOLTIP),
        name: SCAN_TEST_TOOLTIP,
        priority: 900,
        shouldShow: () => true,
        shouldRenderActionButtons: true,
    },
    [SCAN_TEST_TOOLTIP_MANAGER]: {
        content: [
            {
                text: () => (
                    <RenderHtml
                        contentWidth={width}
                        source={{html: `<div>${translate('productTrainingTooltip.scanTestTooltip.full')}</div>`}}
                    />
                ),
            },
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(SCAN_TEST_TOOLTIP_MANAGER, isDismissedUsingCloseButton),
        name: SCAN_TEST_TOOLTIP_MANAGER,
        priority: 1000,
        shouldShow: () => true,
    },
    [SCAN_TEST_CONFIRMATION]: {
        content: [
            {
                text: () => (
                    <RenderHtml
                        contentWidth={width}
                        source={{html: `<div>${translate('productTrainingTooltip.scanTestTooltip.full')}</div>`}}
                    />
                ),
            },
        ],
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(SCAN_TEST_CONFIRMATION, isDismissedUsingCloseButton),
        name: SCAN_TEST_CONFIRMATION,
        priority: 1100,
        shouldShow: () => true,
    },
    [OUTSTANDING_FILTER]: {
        content: [
            {
                text: () => (
                    <RenderHtml
                        contentWidth={width}
                        source={{html: `<div>${translate('productTrainingTooltip.outstandingFilter.full')}</div>`}}
                    />
                ),
            },
        ],
        onHideTooltip: () => dismissProductTraining(OUTSTANDING_FILTER),
        name: OUTSTANDING_FILTER,
        priority: 1925,
        shouldShow: ({isUserPolicyAdmin}) => isUserPolicyAdmin,
    },
    [SCAN_TEST_DRIVE_CONFIRMATION]: {
        content: [
            {
                text: () => (
                    <RenderHtml
                        contentWidth={width}
                        source={{html: `<div>${translate('productTrainingTooltip.scanTestDriveTooltip.full')}</div>`}}
                    />
                ),
            },
        ],
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(SCAN_TEST_DRIVE_CONFIRMATION, isDismissedUsingCloseButton),
        name: SCAN_TEST_DRIVE_CONFIRMATION,
        priority: 1200,
        shouldShow: () => true,
    },
};

export default TOOLTIPS;
export type {ProductTrainingTooltipName};
