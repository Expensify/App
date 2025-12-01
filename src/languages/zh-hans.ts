/**
 *   _____                      __         __
 *  / ___/__ ___  ___ _______ _/ /____ ___/ /
 * / (_ / -_) _ \/ -_) __/ _ \`/ __/ -_) _  /
 * \___/\__/_//_/\__/_/  \_,_/\__/\__/\_,_/
 *
 * This file was automatically generated. Please consider these alternatives before manually editing it:
 *
 * - Improve the prompts in prompts/translation, or
 * - Improve context annotations in src/languages/en.ts
 */
import {CONST as COMMON_CONST} from 'expensify-common';
import startCase from 'lodash/startCase';
import type {OnboardingTask} from '@libs/actions/Welcome/OnboardingFlow';
import dedent from '@libs/StringUtils/dedent';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type OriginalMessage from '@src/types/onyx/OriginalMessage';
import type en from './en';
import type {
    AccountOwnerParams,
    ActionsAreCurrentlyRestricted,
    AddedOrDeletedPolicyReportFieldParams,
    AddedPolicyApprovalRuleParams,
    AddEmployeeParams,
    AddOrDeletePolicyCustomUnitRateParams,
    AddressLineParams,
    AirlineParams,
    AlreadySignedInParams,
    ApprovalWorkflowErrorParams,
    ApprovedAmountParams,
    AssignedCardParams,
    AssigneeParams,
    AuthenticationErrorParams,
    AutoPayApprovedReportsLimitErrorParams,
    BadgeFreeTrialParams,
    BankAccountLastFourParams,
    BeginningOfArchivedRoomParams,
    BeginningOfChatHistoryAdminRoomParams,
    BeginningOfChatHistoryAnnounceRoomParams,
    BeginningOfChatHistoryDomainRoomParams,
    BeginningOfChatHistoryInvoiceRoomParams,
    BeginningOfChatHistoryPolicyExpenseChatParams,
    BeginningOfChatHistoryUserRoomParams,
    BillableDefaultDescriptionParams,
    BillingBannerCardAuthenticationRequiredParams,
    BillingBannerCardExpiredParams,
    BillingBannerCardOnDisputeParams,
    BillingBannerDisputePendingParams,
    BillingBannerInsufficientFundsParams,
    BillingBannerOwnerAmountOwedOverdueParams,
    BillingBannerSubtitleWithDateParams,
    BusinessBankAccountParams,
    BusinessRegistrationNumberParams,
    BusinessTaxIDParams,
    CanceledRequestParams,
    CardEndingParams,
    CardInfoParams,
    CardNextPaymentParams,
    CategoryNameParams,
    ChangedApproverMessageParams,
    ChangeFieldParams,
    ChangeOwnerDuplicateSubscriptionParams,
    ChangeOwnerHasFailedSettlementsParams,
    ChangeOwnerSubscriptionParams,
    ChangeReportPolicyParams,
    ChangeTypeParams,
    CharacterLengthLimitParams,
    CharacterLimitParams,
    ChatWithAccountManagerParams,
    CompanyCardBankName,
    CompanyCardFeedNameParams,
    CompanyNameParams,
    ConfirmThatParams,
    ConnectionNameParams,
    ConnectionParams,
    ContactMethodParams,
    ContactMethodsRouteParams,
    CreateExpensesParams,
    CurrencyCodeParams,
    CurrencyInputDisabledTextParams,
    CustomersOrJobsLabelParams,
    DateParams,
    DateShouldBeAfterParams,
    DateShouldBeBeforeParams,
    DefaultAmountParams,
    DefaultVendorDescriptionParams,
    DelegateRoleParams,
    DelegatorParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    DeleteTransactionParams,
    DemotedFromWorkspaceParams,
    DependentMultiLevelTagsSubtitleParams,
    DidSplitAmountMessageParams,
    DisconnectYourBankAccountParams,
    DomainPermissionInfoRestrictionParams,
    DuplicateTransactionParams,
    EarlyDiscountSubtitleParams,
    EarlyDiscountTitleParams,
    EditActionParams,
    EditDestinationSubtitleParams,
    ElectronicFundsParams,
    EmployeeInviteMessageParams,
    EmptyCategoriesSubtitleWithAccountingParams,
    EmptyTagsSubtitleWithAccountingParams,
    EnableContinuousReconciliationParams,
    EnterMagicCodeParams,
    ErrorODIntegrationParams,
    ExportAgainModalDescriptionParams,
    ExportedToIntegrationParams,
    ExportIntegrationSelectedParams,
    FeatureNameParams,
    FileLimitParams,
    FileTypeParams,
    FiltersAmountBetweenParams,
    FlightLayoverParams,
    FlightParams,
    FocusModeUpdateParams,
    FormattedMaxLengthParams,
    GoBackMessageParams,
    ImportedTagsMessageParams,
    ImportedTypesParams,
    ImportFieldParams,
    ImportMembersSuccessfulDescriptionParams,
    ImportPerDiemRatesSuccessfulDescriptionParams,
    ImportTagsSuccessfulDescriptionParams,
    IncorrectZipFormatParams,
    IndividualExpenseRulesSubtitleParams,
    InstantSummaryParams,
    IntacctMappingTitleParams,
    IntegrationExportParams,
    IntegrationSyncFailedParams,
    InvalidPropertyParams,
    InvalidValueParams,
    IssueVirtualCardParams,
    LastSyncAccountingParams,
    LastSyncDateParams,
    LearnMoreRouteParams,
    LeftWorkspaceParams,
    LocalTimeParams,
    LoggedInAsParams,
    LogSizeParams,
    ManagerApprovedAmountParams,
    ManagerApprovedParams,
    MarkedReimbursedParams,
    MarkReimbursedFromIntegrationParams,
    MergeAccountIntoParams,
    MergeFailureDescriptionGenericParams,
    MergeFailureUncreatedAccountDescriptionParams,
    MergeSuccessDescriptionParams,
    MissingPropertyParams,
    MovedActionParams,
    MovedFromPersonalSpaceParams,
    MovedFromReportParams,
    MovedTransactionParams,
    NeedCategoryForExportToIntegrationParams,
    NewWorkspaceNameParams,
    NextStepParams,
    NoLongerHaveAccessParams,
    NotAllowedExtensionParams,
    NotYouParams,
    OOOEventSummaryFullDayParams,
    OOOEventSummaryPartialDayParams,
    OptionalParam,
    OurEmailProviderParams,
    OwnerOwesAmountParams,
    PaidElsewhereParams,
    PaidWithExpensifyParams,
    ParentNavigationSummaryParams,
    PayAndDowngradeDescriptionParams,
    PayerOwesAmountParams,
    PayerOwesParams,
    PayerPaidAmountParams,
    PayerPaidParams,
    PayerSettledParams,
    PaySomeoneParams,
    PhoneErrorRouteParams,
    PolicyAddedReportFieldOptionParams,
    PolicyDisabledReportFieldAllOptionsParams,
    PolicyDisabledReportFieldOptionParams,
    PolicyExpenseChatNameParams,
    QBDSetupErrorBodyParams,
    RailTicketParams,
    ReceiptPartnersUberSubtitleParams,
    RemovedFromApprovalWorkflowParams,
    RemovedTheRequestParams,
    RemoveMemberPromptParams,
    RemoveMembersWarningPrompt,
    RenamedRoomActionParams,
    RenamedWorkspaceNameActionParams,
    ReportArchiveReasonsClosedParams,
    ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams,
    ReportArchiveReasonsMergedParams,
    ReportArchiveReasonsRemovedFromPolicyParams,
    ReportFieldParams,
    ReportPolicyNameParams,
    RequestAmountParams,
    RequestCountParams,
    RequestedAmountMessageParams,
    RequiredFieldParams,
    ResolutionConstraintsParams,
    ReviewParams,
    RoleNamesParams,
    RoomNameReservedErrorParams,
    RoomRenamedToParams,
    RulesEnableWorkflowsParams,
    SecondaryLoginParams,
    SetTheDistanceMerchantParams,
    SetTheRequestParams,
    SettledAfterAddedBankAccountParams,
    SettleExpensifyCardParams,
    SettlementAccountInfoParams,
    SettlementAccountReconciliationParams,
    SettlementDateParams,
    ShareParams,
    SignerInfoMessageParams,
    SignUpNewFaceCodeParams,
    SizeExceededParams,
    SplitAmountParams,
    SplitExpenseEditTitleParams,
    SplitExpenseSubtitleParams,
    SpreadCategoriesParams,
    SpreadFieldNameParams,
    SpreadSheetColumnParams,
    StatementTitleParams,
    StepCounterParams,
    StripePaidParams,
    SubmitsToParams,
    SubmittedToVacationDelegateParams,
    SubmittedWithMemoParams,
    SubscriptionCommitmentParams,
    SubscriptionSettingsRenewsOnParams,
    SubscriptionSettingsSaveUpToParams,
    SubscriptionSettingsSummaryParams,
    SubscriptionSizeParams,
    SyncStageNameConnectionsParams,
    TagSelectionParams,
    TaskCreatedActionParams,
    TaxAmountParams,
    TermsParams,
    ThreadRequestReportNameParams,
    ThreadSentMoneyReportNameParams,
    ToggleImportTitleParams,
    TotalAmountGreaterOrLessThanOriginalParams,
    ToValidateLoginParams,
    TransferParams,
    TravelTypeParams,
    TrialStartedTitleParams,
    UnapproveWithIntegrationWarningParams,
    UnshareParams,
    UntilTimeParams,
    UpdatedCustomFieldParams,
    UpdatedPolicyApprovalRuleParams,
    UpdatedPolicyAuditRateParams,
    UpdatedPolicyCategoryDescriptionHintTypeParams,
    UpdatedPolicyCategoryExpenseLimitTypeParams,
    UpdatedPolicyCategoryGLCodeParams,
    UpdatedPolicyCategoryMaxAmountNoReceiptParams,
    UpdatedPolicyCategoryMaxExpenseAmountParams,
    UpdatedPolicyCategoryNameParams,
    UpdatedPolicyCategoryParams,
    UpdatedPolicyCurrencyParams,
    UpdatedPolicyCustomUnitRateParams,
    UpdatedPolicyCustomUnitTaxClaimablePercentageParams,
    UpdatedPolicyCustomUnitTaxRateExternalIDParams,
    UpdatedPolicyDescriptionParams,
    UpdatedPolicyFieldWithNewAndOldValueParams,
    UpdatedPolicyFieldWithValueParam,
    UpdatedPolicyFrequencyParams,
    UpdatedPolicyManualApprovalThresholdParams,
    UpdatedPolicyPreventSelfApprovalParams,
    UpdatedPolicyReimbursementEnabledParams,
    UpdatedPolicyReportFieldDefaultValueParams,
    UpdatedPolicyTagFieldParams,
    UpdatedPolicyTagNameParams,
    UpdatedPolicyTagParams,
    UpdatedPolicyTaxParams,
    UpdatedTheDistanceMerchantParams,
    UpdatedTheRequestParams,
    UpdatePolicyCustomUnitParams,
    UpdatePolicyCustomUnitTaxEnabledParams,
    UpdateRoleParams,
    UpgradeSuccessMessageParams,
    UsePlusButtonParams,
    UserIsAlreadyMemberParams,
    UserSplitParams,
    VacationDelegateParams,
    ViolationsCashExpenseWithNoReceiptParams,
    ViolationsConversionSurchargeParams,
    ViolationsCustomRulesParams,
    ViolationsInvoiceMarkupParams,
    ViolationsMaxAgeParams,
    ViolationsMissingTagParams,
    ViolationsModifiedAmountParams,
    ViolationsOverCategoryLimitParams,
    ViolationsOverLimitParams,
    ViolationsPerDayLimitParams,
    ViolationsReceiptRequiredParams,
    ViolationsRterParams,
    ViolationsTagOutOfPolicyParams,
    ViolationsTaxOutOfPolicyParams,
    WaitingOnBankAccountParams,
    WalletAgreementParams,
    WalletProgramParams,
    WelcomeEnterMagicCodeParams,
    WelcomeToRoomParams,
    WeSentYouMagicSignInLinkParams,
    WorkEmailMergingBlockedParams,
    WorkEmailResendCodeParams,
    WorkflowSettingsParam,
    WorkspaceLockedPlanTypeParams,
    WorkspaceMemberList,
    WorkspaceMembersCountParams,
    WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams,
    WorkspaceRouteParams,
    WorkspaceShareNoteParams,
    WorkspacesListRouteParams,
    WorkspaceUpgradeNoteParams,
    WorkspaceYouMayJoin,
    YourPlanPriceParams,
    YourPlanPriceValueParams,
    ZipCodeExampleFormatParams,
} from './params';
import type {TranslationDeepObject} from './types';

type StateValue = {
    stateISO: string;
    stateName: string;
};
type States = Record<keyof typeof COMMON_CONST.STATES, StateValue>;
type AllCountries = Record<Country, string>;
/* eslint-disable max-len */
const translations: TranslationDeepObject<typeof en> = {
    common: {
        count: '计数',
        cancel: '取消',
        dismiss: '忽略',
        proceed: '继续',
        yes: '是的',
        no: '不',
        ok: '好的',
        notNow: '暂时不需要',
        noThanks: '不，谢谢',
        learnMore: '了解更多',
        buttonConfirm: '我知道了',
        name: '名称',
        attachment: '附件',
        attachments: '附件',
        center: '中心',
        from: '从',
        to: '至',
        in: '在',
        optional: '可选',
        new: '新建',
        search: '搜索',
        reports: '报告',
        find: '查找',
        searchWithThreeDots: '搜索...',
        next: '下一个',
        previous: '上一个',
        goBack: '返回',
        create: '创建',
        add: '添加',
        resend: '重新发送',
        save: '保存',
        select: '选择',
        deselect: '取消选择',
        selectMultiple: '选择多个',
        saveChanges: '保存更改',
        submit: '提交',
        submitted: '已提交',
        rotate: '旋转',
        zoom: 'Zoom',
        password: '密码',
        magicCode: '验证码',
        twoFactorCode: '双因素验证码',
        workspaces: '工作区',
        inbox: '收件箱',
        group: '组',
        success: '成功',
        profile: '个人资料',
        referral: '推荐',
        payments: '付款',
        approvals: '审批',
        wallet: '钱包',
        preferences: '偏好设置',
        view: '查看',
        review: (reviewParams?: ReviewParams) => `审查${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: '不',
        signIn: '登录',
        signInWithGoogle: '使用 Google 登录',
        signInWithApple: '使用 Apple 登录',
        signInWith: '使用登录',
        continue: '继续',
        firstName: '名字',
        lastName: '姓氏',
        scanning: '扫描中',
        addCardTermsOfService: 'Expensify 服务条款',
        perPerson: '每人',
        phone: '电话',
        phoneNumber: '电话号码',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: '电子邮件',
        and: '和',
        or: '或',
        details: '详情',
        privacy: '隐私',
        privacyPolicy: '隐私政策',
        hidden: 'Hidden',
        visible: '可见',
        delete: '删除',
        archived: '已归档',
        contacts: '联系人',
        recents: '最近',
        close: '关闭',
        comment: '评论',
        download: '下载',
        downloading: '下载中',
        uploading: '上传中',
        pin: '固定',
        unPin: '取消固定',
        back: '返回',
        saveAndContinue: '保存并继续',
        settings: '设置',
        termsOfService: '服务条款',
        members: '成员',
        invite: '邀请',
        here: '这里',
        date: '日期',
        dob: '出生日期',
        currentYear: '当前年份',
        currentMonth: '当前月份',
        ssnLast4: 'SSN的最后四位数字',
        ssnFull9: '完整的9位数社会安全号码',
        addressLine: ({lineNumber}: AddressLineParams) => `地址行 ${lineNumber}`,
        personalAddress: '个人地址',
        companyAddress: '公司地址',
        noPO: '请不要使用邮政信箱或邮件投递地址。',
        city: '城市',
        state: '状态',
        streetAddress: '街道地址',
        stateOrProvince: '州/省份',
        country: '国家',
        zip: '邮政编码',
        zipPostCode: '邮政编码',
        whatThis: '这是什么？',
        iAcceptThe: '我接受',
        acceptTermsAndPrivacy: `我接受 <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify 服务条款</a> 和 <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">隐私政策</a>`,
        acceptTermsAndConditions: `我接受 <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">条款和条件</a>`,
        acceptTermsOfService: `我接受 <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify 服务条款</a>`,
        remove: '移除',
        admin: '管理员',
        owner: '所有者',
        dateFormat: 'YYYY-MM-DD',
        send: '发送',
        na: 'N/A',
        noResultsFound: '未找到结果',
        noResultsFoundMatching: (searchString: string) => `未找到与“${searchString}”匹配的结果`,
        recentDestinations: '最近的目的地',
        timePrefix: '它是',
        conjunctionFor: '为',
        todayAt: '今天在',
        tomorrowAt: '明天在',
        yesterdayAt: '昨天在',
        conjunctionAt: '在',
        conjunctionTo: '到',
        genericErrorMessage: '糟糕……出现了一些问题，您的请求无法完成。请稍后再试。',
        percentage: '百分比',
        error: {
            invalidAmount: '无效金额',
            acceptTerms: '您必须接受服务条款才能继续',
            phoneNumber: `请输入完整的电话号码（例如 ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER}）`,
            fieldRequired: '此字段为必填项',
            requestModified: '此请求正在被另一位成员修改中',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `字符数超出限制 (${length}/${limit})`,
            dateInvalid: '请选择一个有效日期',
            invalidDateShouldBeFuture: '请选择今天或将来的日期',
            invalidTimeShouldBeFuture: '请选择一个至少提前一分钟的时间',
            invalidCharacter: '无效字符',
            enterMerchant: '输入商家名称',
            enterAmount: '输入金额',
            missingMerchantName: '缺少商家名称',
            missingAmount: '缺少金额',
            missingDate: '缺少日期',
            enterDate: '输入日期',
            invalidTimeRange: '请输入使用12小时制的时间（例如，下午2:30）',
            pleaseCompleteForm: '请填写上面的表格以继续',
            pleaseSelectOne: '请选择上面的一个选项',
            invalidRateError: '请输入有效的费率',
            lowRateError: '费率必须大于0',
            email: '请输入有效的电子邮件地址',
            login: '登录时发生错误。请重试。',
        },
        comma: '逗号',
        semicolon: '分号',
        please: '请',
        contactUs: '联系我们',
        pleaseEnterEmailOrPhoneNumber: '请输入电子邮件或电话号码',
        fixTheErrors: '修复错误',
        inTheFormBeforeContinuing: '在继续之前填写表格',
        confirm: '确认',
        reset: '重置',
        done: '完成',
        more: '更多',
        debitCard: '借记卡',
        bankAccount: '银行账户',
        personalBankAccount: '个人银行账户',
        businessBankAccount: '企业银行账户',
        join: '加入',
        leave: '离开',
        decline: '拒绝',
        reject: '拒绝',
        transferBalance: '转账余额',
        enterManually: '手动输入',
        message: '消息',
        leaveThread: '离开线程',
        you: '你',
        me: '我',
        youAfterPreposition: '你',
        your: '你的',
        conciergeHelp: '请联系Concierge寻求帮助。',
        youAppearToBeOffline: '您似乎处于离线状态。',
        thisFeatureRequiresInternet: '此功能需要有效的互联网连接。',
        attachmentWillBeAvailableOnceBackOnline: '附件将在重新上线后可用。',
        errorOccurredWhileTryingToPlayVideo: '尝试播放此视频时发生错误。',
        areYouSure: '你确定吗？',
        verify: '验证',
        yesContinue: '是的，继续',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `e.g. ${zipSampleFormat}` : ''),
        description: '描述',
        title: '标题',
        assignee: '受让人',
        createdBy: '创建者',
        with: '与',
        shareCode: '共享代码',
        share: '分享',
        per: '每',
        mi: '英里',
        km: '公里',
        copied: '已复制！',
        someone: '某人',
        total: '总计',
        edit: '编辑',
        letsDoThis: `来吧！`,
        letsStart: `开始吧`,
        showMore: '显示更多',
        merchant: '商家',
        category: '类别',
        report: '报告',
        billable: '可计费的',
        nonBillable: '非计费',
        tag: '标签',
        receipt: '收据',
        verified: '已验证',
        replace: '替换',
        distance: '距离',
        mile: '英里',
        miles: '英里',
        kilometer: '公里',
        kilometers: '公里',
        recent: '最近的',
        all: '所有',
        am: 'AM',
        pm: 'PM',
        tbd: 'TBD',
        selectCurrency: '选择货币',
        selectSymbolOrCurrency: '选择一个符号或货币',
        card: '卡片',
        whyDoWeAskForThis: '我们为什么要求这个？',
        required: '必填',
        showing: '显示中',
        of: '的',
        default: '默认',
        update: '更新',
        member: '成员',
        auditor: '审计员',
        role: '角色',
        currency: '货币',
        groupCurrency: '集团货币',
        rate: '费率',
        emptyLHN: {
            title: '太好了！全部搞定了。',
            subtitleText1: '使用以下内容查找聊天',
            subtitleText2: '上面的按钮，或使用以下内容创建某些内容',
            subtitleText3: '下方按钮。',
        },
        businessName: '公司名称',
        clear: '清除',
        type: '类型',
        action: '操作',
        expenses: '费用',
        totalSpend: '总支出',
        tax: '税务',
        shared: '共享',
        drafts: '草稿',
        draft: '草稿',
        finished: '完成',
        upgrade: '升级',
        downgradeWorkspace: '降级工作区',
        companyID: '公司ID',
        userID: '用户 ID',
        disable: '禁用',
        export: '导出',
        initialValue: '初始值',
        currentDate: '当前日期',
        value: '值',
        downloadFailedTitle: '下载失败',
        downloadFailedDescription: '您的下载未能完成。请稍后再试。',
        filterLogs: '过滤日志',
        network: '网络',
        reportID: '报告 ID',
        longID: '长的 ID',
        withdrawalID: '提现ID',
        bankAccounts: '银行账户',
        chooseFile: '选择文件',
        chooseFiles: '选择文件',
        dropTitle: '放手吧',
        dropMessage: '在此处拖放您的文件',
        ignore: '忽略',
        enabled: '已启用',
        disabled: '禁用',
        import: '导入',
        offlinePrompt: '您现在无法执行此操作。',
        outstanding: '未完成',
        chats: '聊天',
        tasks: '任务',
        unread: '未读',
        sent: '已发送',
        links: '链接',
        day: '天',
        days: '天',
        rename: '重命名',
        address: '地址',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: '跳过',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) => `需要特定帮助？请与您的客户经理${accountManagerDisplayName}聊天。`,
        chatNow: '立即聊天',
        workEmail: '工作邮箱',
        destination: '目的地',
        subrate: '亚速率',
        perDiem: '每日津贴',
        validate: '验证',
        downloadAsPDF: '下载为PDF',
        downloadAsCSV: '下载为CSV',
        help: '帮助',
        expenseReport: '费用报告',
        expenseReports: '费用报告',
        rateOutOfPolicy: '超出政策的费率',
        leaveWorkspace: '离开工作区',
        leaveWorkspaceConfirmation: '如果你离开该工作区，你将无法向其提交费用。',
        leaveWorkspaceConfirmationAuditor: '如果你离开此工作区，将无法查看其报告和设置。',
        leaveWorkspaceConfirmationAdmin: '如果您离开此工作区，您将无法管理其设置。',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) => `如果您离开此工作区，在审批流程中将由工作区所有者 ${workspaceOwner} 替代您。`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) => `如果你离开此工作区，你的首选导出者身份将由工作区所有者 ${workspaceOwner} 接替。`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) => `如果你离开此工作区，工作区所有者 ${workspaceOwner} 将接替你的技术联系人角色。`,
        leaveWorkspaceReimburser: '您作为报销付款人，无法离开此工作区。请在“工作区 > 进行或跟踪付款”中设置新的报销付款人，然后重试。',
        reimbursable: '可报销的',
        editYourProfile: '编辑您的个人资料',
        comments: '评论',
        sharedIn: '共享于',
        unreported: '未报告',
        explore: '探索',
        todo: '待办事项',
        invoice: '发票',
        expense: '费用',
        chat: '聊天',
        task: '任务',
        trip: '旅行',
        apply: '申请',
        status: '状态',
        on: '开启',
        before: '之前',
        after: '后',
        reschedule: '重新安排',
        general: '常规',
        workspacesTabTitle: '工作区',
        headsUp: '注意！',
        submitTo: '提交到',
        forwardTo: '转发到',
        merge: '合并',
        none: '无',
        unstableInternetConnection: '互联网连接不稳定。请检查你的网络，然后重试。',
        enableGlobalReimbursements: '启用全球报销',
        purchaseAmount: '购买金额',
        frequency: '频率',
        link: '链接',
        pinned: '已固定',
        read: '已读',
        copyToClipboard: '复制到剪贴板',
        thisIsTakingLongerThanExpected: '这花的时间比预期更长...',
        domains: '域名',
        reportName: '报告名称',
        showLess: '显示更少',
        actionRequired: '需要操作',
    },
    supportalNoAccess: {
        title: '慢一点',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) => `当支持人员登录时，您无权执行此操作（命令：${command ?? ''}）。如果您认为 Success 应该能够执行此操作，请在 Slack 中开始对话。`,
    },
    lockedAccount: {
        title: '账户已锁定',
        description: '您无法完成此操作，因为此账户已被锁定。请联系 concierge@expensify.com 以获取下一步操作。',
    },
    location: {
        useCurrent: '使用当前位置',
        notFound: '我们无法找到您的位置。请重试或手动输入地址。',
        permissionDenied: '看起来您已拒绝访问您的位置。',
        please: '请',
        allowPermission: '在设置中允许位置访问',
        tryAgain: '并重试。',
    },
    contact: {
        importContacts: '导入联系人',
        importContactsTitle: '导入您的联系人',
        importContactsText: '从手机导入联系人，这样您最喜欢的人总是触手可及。',
        importContactsExplanation: '这样您最喜欢的人总是触手可及。',
        importContactsNativeText: '只差一步！请授权我们导入您的联系人。',
    },
    anonymousReportFooter: {
        logoTagline: '加入讨论。',
    },
    attachmentPicker: {
        cameraPermissionRequired: '相机访问权限',
        expensifyDoesNotHaveAccessToCamera: 'Expensify无法在没有相机访问权限的情况下拍照。点击设置以更新权限。',
        attachmentError: '附件错误',
        errorWhileSelectingAttachment: '选择附件时发生错误。请重试。',
        errorWhileSelectingCorruptedAttachment: '选择损坏的附件时发生错误。请尝试其他文件。',
        takePhoto: '拍照',
        chooseFromGallery: '从图库中选择',
        chooseDocument: '选择文件',
        attachmentTooLarge: '附件太大了',
        sizeExceeded: '附件大小超过24 MB限制',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `附件大小超过 ${maxUploadSizeInMB} MB 的限制`,
        attachmentTooSmall: '附件太小了',
        sizeNotMet: '附件大小必须大于240字节',
        wrongFileType: '无效的文件类型',
        notAllowedExtension: '不允许此文件类型。请尝试其他文件类型。',
        folderNotAllowedMessage: '不允许上传文件夹。请尝试其他文件。',
        protectedPDFNotSupported: '不支持受密码保护的PDF',
        attachmentImageResized: '此图像已调整大小以供预览。下载以获取完整分辨率。',
        attachmentImageTooLarge: '此图像太大，无法在上传前预览。',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `您一次最多只能上传 ${fileLimit} 个文件。`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `文件超过 ${maxUploadSizeInMB} MB。请重试。`,
        someFilesCantBeUploaded: '有些文件无法上传',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `文件必须小于${maxUploadSizeInMB} MB。较大的文件将不会被上传。`,
        maxFileLimitExceeded: '您一次最多可上传30张收据。额外的将不会被上传。',
        unsupportedFileType: ({fileType}: FileTypeParams) => `${fileType} 文件不受支持。只有受支持的文件类型才会被上传。`,
        learnMoreAboutSupportedFiles: '了解更多关于支持的格式。',
        passwordProtected: '不支持密码保护的PDF。只有受支持的文件才会被上传。',
    },
    dropzone: {
        addAttachments: '添加附件',
        addReceipt: '添加收据',
        scanReceipts: '扫描收据',
        replaceReceipt: '替换收据',
    },
    filePicker: {
        fileError: '文件错误',
        errorWhileSelectingFile: '选择文件时发生错误。请再试一次。',
    },
    connectionComplete: {
        title: '连接完成',
        supportingText: '您可以关闭此窗口并返回Expensify应用程序。',
    },
    avatarCropModal: {
        title: '编辑照片',
        description: '随意拖动、缩放和旋转您的图像。',
    },
    composer: {
        noExtensionFoundForMimeType: '未找到与 MIME 类型对应的扩展名',
        problemGettingImageYouPasted: '获取您粘贴的图片时出现问题。',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `最大评论长度为${formattedMaxLength}个字符。`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `任务标题的最大长度为${formattedMaxLength}个字符。`,
    },
    baseUpdateAppModal: {
        updateApp: '更新应用程序',
        updatePrompt: '此应用程序的新版本可用。立即更新或稍后重新启动应用程序以下载最新更改。',
    },
    deeplinkWrapper: {
        launching: '启动 Expensify',
        expired: '您的会话已过期。',
        signIn: '请重新登录。',
        redirectedToDesktopApp: '我们已将您重定向到桌面应用程序。',
        youCanAlso: '您也可以',
        openLinkInBrowser: '在浏览器中打开此链接',
        loggedInAs: ({email}: LoggedInAsParams) => `您已登录为${email}。在提示中点击“打开链接”以使用此账户登录桌面应用程序。`,
        doNotSeePrompt: '看不到提示？',
        tryAgain: '再试一次',
        or: '，或',
        continueInWeb: '继续到网页应用程序',
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            Abracadabra，你已登录！
        `),
        successfulSignInDescription: '返回到原始标签页继续。',
        title: '这是您的魔法代码',
        description: dedent(`
            请在最初请求的设备上
            输入代码
        `),
        doNotShare: dedent(`
            不要与任何人分享你的验证码。
            Expensify 绝不会向你索取它！
        `),
        or: '，或',
        signInHere: '只需在这里登录',
        expiredCodeTitle: '魔法代码已过期',
        expiredCodeDescription: '返回原始设备并请求新代码',
        successfulNewCodeRequest: '请求的代码已发送。请检查您的设备。',
        tfaRequiredTitle: dedent(`
            双重身份验证
            必需
        `),
        tfaRequiredDescription: dedent(`
            请输入双重身份验证代码
            在您尝试登录的地方。
        `),
        requestOneHere: '在这里请求一个。',
    },
    moneyRequestConfirmationList: {
        paidBy: '支付方',
        whatsItFor: '这是做什么用的？',
    },
    selectionList: {
        nameEmailOrPhoneNumber: '姓名、电子邮件或电话号码',
        findMember: '查找成员',
        searchForSomeone: '搜索某人',
    },
    customApprovalWorkflow: {
        title: '自定义审批工作流',
        description: '您的公司在此工作区有自定义审批工作流，请在Expensify Classic中执行此操作',
        goToExpensifyClassic: '切换到Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '提交报销，推荐给您的团队',
            subtitleText: '想让你的团队也使用Expensify吗？只需向他们提交一笔费用，其余的交给我们。',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '预约电话',
    },
    hello: '你好',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '请从下面开始。',
        anotherLoginPageIsOpen: '另一个登录页面已打开。',
        anotherLoginPageIsOpenExplanation: '您已在单独的标签页中打开了登录页面。请从该标签页登录。',
        welcome: '欢迎！',
        welcomeWithoutExclamation: '欢迎',
        phrase2: '金钱会说话。现在聊天和支付合二为一，这也变得简单了。',
        phrase3: '只要你能表达清楚，你的付款就能快速到达。',
        enterPassword: '请输入您的密码',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}，在这里看到新面孔总是很高兴！`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `请输入发送到${login}的魔法代码。它应该会在一两分钟内到达。`,
    },
    login: {
        hero: {
            header: '旅行和报销，以聊天的速度进行',
            body: '欢迎来到新一代的Expensify，在这里，借助上下文实时聊天，您的差旅和费用处理速度更快。',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `您已使用 ${email} 登录。`,
        goBackMessage: ({provider}: GoBackMessageParams) => `不想使用${provider}登录？`,
        continueWithMyCurrentSession: '继续我的当前会话',
        redirectToDesktopMessage: '完成登录后，我们会将您重定向到桌面应用程序。',
    },
    samlSignIn: {
        welcomeSAMLEnabled: '继续使用单点登录登录：',
        orContinueWithMagicCode: '您还可以使用魔法代码登录',
        useSingleSignOn: '使用单点登录',
        useMagicCode: '使用魔法代码',
        launching: '启动中...',
        oneMoment: '请稍等，我们正在将您重定向到您公司的单点登录门户。',
    },
    reportActionCompose: {
        dropToUpload: '拖放上传',
        sendAttachment: '发送附件',
        addAttachment: '添加附件',
        writeSomething: '写点什么...',
        blockedFromConcierge: '通信被禁止',
        fileUploadFailed: '上传失败。文件不受支持。',
        localTime: ({user, time}: LocalTimeParams) => `现在是${time}，适合${user}`,
        edited: '(已编辑)',
        emoji: 'Emoji',
        collapse: '折叠',
        expand: '展开',
    },
    reportActionContextMenu: {
        copyMessage: '复制消息',
        copied: '已复制！',
        copyLink: '复制链接',
        copyURLToClipboard: '复制网址到剪贴板',
        copyEmailToClipboard: '复制电子邮件到剪贴板',
        markAsUnread: '标记为未读',
        markAsRead: '标记为已读',
        editAction: ({action}: EditActionParams) => `Edit ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '费用' : '评论'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = '评论';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = '费用';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = '报告';
            }
            return `删除 ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = '评论';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = '费用';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = '报告';
            }
            return `您确定要删除此${type}吗？`;
        },
        onlyVisible: '仅对...可见',
        replyInThread: '在线程中回复',
        joinThread: '加入线程',
        leaveThread: '离开线程',
        copyOnyxData: '复制 Onyx 数据',
        flagAsOffensive: '标记为攻击性内容',
        menu: '菜单',
    },
    emojiReactions: {
        addReactionTooltip: '添加反应',
        reactedWith: '做出了反应',
    },
    reportActionsView: {
        beginningOfArchivedRoom: ({reportName, reportDetailsLink}: BeginningOfArchivedRoomParams) =>
            `你错过了 <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> 的派对，这里没什么好看的。`,
        beginningOfChatHistoryDomainRoom: ({domainRoom}: BeginningOfChatHistoryDomainRoomParams) =>
            `此聊天是与 <strong>${domainRoom}</strong> 域名上的所有 Expensify 会员进行的。使用它与同事聊天、分享技巧和提问。`,
        beginningOfChatHistoryAdminRoom: ({workspaceName}: BeginningOfChatHistoryAdminRoomParams) =>
            `此聊天是与 <strong>${workspaceName}</strong> 管理员进行的。您可以用它来聊天，讨论工作空间设置等问题。`,
        beginningOfChatHistoryAnnounceRoom: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomParams) =>
            `此聊天室面向 <strong>${workspaceName}</strong> 的所有人。最重要的公告请使用此聊天室。`,
        beginningOfChatHistoryUserRoom: ({reportName, reportDetailsLink}: BeginningOfChatHistoryUserRoomParams) =>
            `本聊天室用于与 <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> 有关的任何内容。`,
        beginningOfChatHistoryInvoiceRoom: ({invoicePayer, invoiceReceiver}: BeginningOfChatHistoryInvoiceRoomParams) =>
            `该聊天用于 <strong>${invoicePayer}</strong> 和 <strong>${invoiceReceiver}</strong> 之间的发票。使用 + 按钮发送发票。`,
        beginningOfChatHistory: '此聊天是与',
        beginningOfChatHistoryPolicyExpenseChat: ({workspaceName, submitterDisplayName}: BeginningOfChatHistoryPolicyExpenseChatParams) =>
            `这是<strong>${submitterDisplayName}</strong> 向<strong>${workspaceName}</strong> 提交费用的地方。使用 + 按钮即可。`,
        beginningOfChatHistorySelfDM: '这是您的个人空间。用于记录笔记、任务、草稿和提醒。',
        beginningOfChatHistorySystemDM: '欢迎！让我们为您进行设置。',
        chatWithAccountManager: '在这里与您的客户经理聊天',
        sayHello: '说你好！',
        yourSpace: '您的空间',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `欢迎来到${roomName}！`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => ` 使用 + 按钮${additionalText}一笔费用。`,
        askConcierge: '随时提问并获得全天候实时支持。',
        conciergeSupport: '24/7 支持',
        create: '创建',
        iouTypes: {
            pay: '支付',
            split: '分割',
            submit: '提交',
            track: '跟踪',
            invoice: '发票',
        },
    },
    adminOnlyCanPost: '只有管理员可以在此房间发送消息。',
    reportAction: {
        asCopilot: '作为副驾驶',
    },
    mentionSuggestions: {
        hereAlternateText: '通知此对话中的所有人',
    },
    newMessages: '新消息',
    latestMessages: '最新消息',
    youHaveBeenBanned: '注意：您已被禁止在此频道聊天。',
    reportTypingIndicator: {
        isTyping: '正在输入...',
        areTyping: '正在输入...',
        multipleMembers: '多个成员',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: '此聊天室已被存档。',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `由于${displayName}关闭了他们的账户，此聊天不再活跃。`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `此聊天不再活跃，因为${oldDisplayName}已将其帐户与${displayName}合并。`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou ? `此聊天不再活跃，因为<strong>您</strong>已不再是${policyName}工作区的成员。` : `此聊天不再活跃，因为${displayName}不再是${policyName}工作区的成员。`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) => `此聊天不再活跃，因为${policyName}不再是一个活跃的工作区。`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `此聊天不再活跃，因为${policyName}不再是一个活跃的工作区。`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: '此预订已归档。',
    },
    writeCapabilityPage: {
        label: '谁可以发布',
        writeCapability: {
            all: '所有成员',
            admins: '仅限管理员',
        },
    },
    sidebarScreen: {
        buttonFind: '寻找某物...',
        buttonMySettings: '我的设置',
        fabNewChat: '开始聊天',
        fabNewChatExplained: '开始聊天（浮动操作）',
        fabScanReceiptExplained: '扫描收据（浮动操作）',
        chatPinned: '聊天已置顶',
        draftedMessage: '草稿消息',
        listOfChatMessages: '聊天消息列表',
        listOfChats: '聊天列表',
        saveTheWorld: '拯救世界',
        tooltip: '从这里开始！',
        redirectToExpensifyClassicModal: {
            title: '即将推出',
            description: '我们正在微调新 Expensify 的一些细节，以适应您的特定设置。同时，请前往 Expensify Classic。',
        },
    },
    allSettingsScreen: {
        subscription: '订阅',
        domains: '域名',
    },
    tabSelector: {
        chat: '聊天',
        room: '房间',
        distance: '距离',
        manual: '手册',
        scan: '扫描',
        map: '地图',
    },
    spreadsheet: {
        upload: '上传电子表格',
        import: '导入电子表格',
        dragAndDrop: '<muted-link>将您的电子表格拖放到此处，或在下方选择一个文件。支持的格式：.csv、.txt、.xls 和 .xlsx。</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>将您的电子表格拖放到此处，或在下方选择一个文件。 <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">了解更多</a> 支持的文件格式。</muted-link>`,
        chooseSpreadsheet: '<muted-link>选择要导入的电子表格文件。支持的格式：.csv、.txt、.xls 和 .xlsx。</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>选择要导入的电子表格文件。 <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">了解更多</a> 支持的文件格式。</muted-link>`,
        fileContainsHeader: '文件包含列标题',
        column: ({name}: SpreadSheetColumnParams) => `列 ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `哎呀！一个必填字段（“${fieldName}”）尚未映射。请检查并重试。`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) => `糟糕！您已将单个字段（"${fieldName}"）映射到多个列。请检查并重试。`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) => `糟糕！字段（“${fieldName}”）包含一个或多个空值。请检查并重试。`,
        importSuccessfulTitle: '导入成功',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) => (categories > 1 ? `已添加${categories}个类别。` : '已添加1个类别。'),
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return '没有成员被添加或更新。';
            }
            if (added && updated) {
                return `${added} 名成员${added > 1 ? 's' : ''}已添加，${updated} 名成员${updated > 1 ? 's' : ''}已更新。`;
            }
            if (updated) {
                return updated > 1 ? `${updated} 名成员已更新。` : '1 名成员已更新。';
            }
            return added > 1 ? `已添加 ${added} 名成员。` : '1 名成员已被添加。';
        },
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) => (tags > 1 ? `已添加${tags}个标签。` : '已添加1个标签。'),
        importMultiLevelTagsSuccessfulDescription: '已添加多级标签。',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) => (rates > 1 ? `已添加${rates}个每日津贴费率。` : '1个每日津贴费率已添加。'),
        importFailedTitle: '导入失败',
        importFailedDescription: '请确保所有字段均已正确填写，然后重试。如果问题仍然存在，请联系Concierge。',
        importDescription: '通过点击每个导入列旁边的下拉菜单，选择要从电子表格中映射的字段。',
        sizeNotMet: '文件大小必须大于0字节',
        invalidFileMessage: '您上传的文件要么是空的，要么包含无效数据。请确保文件格式正确并包含必要的信息，然后再重新上传。',
        importSpreadsheetLibraryError: '加载电子表格模块失败。请检查您的互联网连接并重试。',
        importSpreadsheet: '导入电子表格',
        downloadCSV: '下载 CSV',
        importMemberConfirmation: () => ({
            one: `请确认以下信息，以添加此次上传中的一位新工作区成员。现有成员不会收到角色更新或邀请消息。`,
            other: (count: number) => `请确认以下信息，以添加此次上传中的 ${count} 位新工作区成员。现有成员不会收到角色更新或邀请消息。`,
        }),
    },
    receipt: {
        upload: '上传收据',
        uploadMultiple: '上传收据',
        desktopSubtitleSingle: `或将其拖放到此处`,
        desktopSubtitleMultiple: `或将它们拖放到此处`,
        alternativeMethodsTitle: '添加收据的其他方式：',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">下载应用</a>以通过手机扫描</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>将收据转发到 <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">添加您的号码</a>以将收据短信发送至 ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>将收据短信发送至 ${phoneNumber}（仅限美国号码）</label-text>`,
        takePhoto: '拍照',
        cameraAccess: '需要相机权限来拍摄收据照片。',
        deniedCameraAccess: `相机访问权限仍未授予，请按照以下步骤操作 <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">这些说明</a>.`,
        cameraErrorTitle: '相机错误',
        cameraErrorMessage: '拍照时发生错误。请再试一次。',
        locationAccessTitle: '允许位置访问',
        locationAccessMessage: '位置访问帮助我们在您旅行时保持时区和货币的准确性。',
        locationErrorTitle: '允许位置访问',
        locationErrorMessage: '位置访问帮助我们在您旅行时保持时区和货币的准确性。',
        allowLocationFromSetting: `位置访问帮助我们在您出行时保持时区和货币的准确性。请在设备的权限设置中允许位置访问。`,
        dropTitle: '放手',
        dropMessage: '在此处拖放您的文件',
        flash: '闪光灯',
        multiScan: '多重扫描',
        shutter: '快门',
        gallery: '画廊',
        deleteReceipt: '删除收据',
        deleteConfirmation: '您确定要删除此收据吗？',
        addReceipt: '添加收据',
        scanFailed: '无法扫描收据，因为缺少商家、日期或金额。',
    },
    quickAction: {
        scanReceipt: '扫描收据',
        recordDistance: '跟踪距离',
        requestMoney: '创建报销单',
        perDiem: '创建每日津贴',
        splitBill: '拆分费用',
        splitScan: '拆分收据',
        splitDistance: '分割距离',
        paySomeone: ({name}: PaySomeoneParams = {}) => `支付${name ?? '某人'}`,
        assignTask: '分配任务',
        header: '快速操作',
        noLongerHaveReportAccess: '您不再拥有之前快速操作目的地的访问权限。请在下面选择一个新的。',
        updateDestination: '更新目的地',
        createReport: '创建报告',
    },
    iou: {
        amount: '金额',
        taxAmount: '税额',
        taxRate: '税率',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `批准 ${formattedAmount}` : '批准'),
        approved: '批准',
        cash: '现金',
        card: '卡片',
        original: '原始',
        split: '拆分',
        splitExpense: '拆分费用',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `来自${merchant}的${amount}`,
        addSplit: '添加分账',
        makeSplitsEven: '使拆分均等',
        editSplits: '编辑拆分',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `总金额比原始费用多${amount}。`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `总金额比原始费用少 ${amount}。`,
        splitExpenseZeroAmount: '请在继续之前输入有效金额。',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `为${merchant}编辑${amount}`,
        splitExpenseOneMoreSplit: '没有添加分割。至少添加一个来保存。',
        splitExpenseCannotBeEditedModalTitle: '此费用无法编辑',
        splitExpenseCannotBeEditedModalDescription: '已批准或已支付的费用无法编辑',
        removeSplit: '移除拆分',
        paySomeone: ({name}: PaySomeoneParams = {}) => `支付${name ?? '某人'}`,
        expense: '费用',
        categorize: '分类',
        share: '分享',
        participants: '参与者',
        createExpense: '创建报销单',
        trackDistance: '跟踪距离',
        createExpenses: ({expensesNumber}: CreateExpensesParams) => `创建${expensesNumber}笔费用`,
        removeExpense: '删除费用',
        removeThisExpense: '删除此费用',
        removeExpenseConfirmation: '您确定要删除这张收据吗？此操作不可撤销。',
        addExpense: '添加费用',
        chooseRecipient: '选择收件人',
        createExpenseWithAmount: ({amount}: {amount: string}) => `创建 ${amount} 报销单`,
        confirmDetails: '确认详情',
        pay: '支付',
        cancelPayment: '取消付款',
        cancelPaymentConfirmation: '您确定要取消此付款吗？',
        viewDetails: '查看详情',
        pending: '待处理',
        canceled: '已取消',
        posted: '已发布',
        deleteReceipt: '删除收据',
        findExpense: '查找费用',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `删除了一笔费用 (${merchant} 的 ${amount})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `移动了一笔费用${reportName ? `来自${reportName}` : ''}`,
        movedTransaction: ({reportUrl, reportName}: MovedTransactionParams) => `移动了此费用${reportName ? `至 <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `已将此费用移动到您的<a href="${reportUrl}">个人空间</a>`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `已将此报告移动到 <a href="${newParentReportUrl}">${toPolicyName}</a> 工作区`;
            }
            return `已将此 <a href="${movedReportUrl}">报告</a> 移动到 <a href="${newParentReportUrl}">${toPolicyName}</a> 工作区`;
        },
        pendingMatchWithCreditCard: '收据待与卡交易匹配',
        pendingMatch: '待匹配',
        pendingMatchWithCreditCardDescription: '收据待与卡交易匹配。标记为现金以取消。',
        markAsCash: '标记为现金',
        routePending: '路由处理中...',
        receiptScanning: () => ({
            one: '收据扫描中...',
            other: '正在扫描收据...',
        }),
        scanMultipleReceipts: '扫描多张收据',
        scanMultipleReceiptsDescription: '一次拍摄所有收据的照片，然后自行确认详细信息或让SmartScan处理。',
        receiptScanInProgress: '正在扫描收据',
        receiptScanInProgressDescription: '收据扫描中。稍后查看或立即输入详细信息。',
        removeFromReport: '不在此报告中',
        moveToPersonalSpace: '移动费用到个人空间',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) => (!isSubmitted ? '发现潜在的重复费用。请查看重复项以启用提交。' : '发现潜在的重复费用。请审查重复项以启用批准。'),
        receiptIssuesFound: () => ({
            one: '发现问题',
            other: '发现的问题',
        }),
        fieldPending: '待处理...',
        defaultRate: '默认费率',
        receiptMissingDetails: '收据缺少详细信息',
        missingAmount: '缺少金额',
        missingMerchant: '缺少商户',
        receiptStatusTitle: '扫描中…',
        receiptStatusText: '只有您在扫描时可以看到此收据。稍后查看或立即输入详细信息。',
        receiptScanningFailed: '收据扫描失败。请手动输入详细信息。',
        transactionPendingDescription: '交易待处理。可能需要几天时间才能发布。',
        companyInfo: '公司信息',
        companyInfoDescription: '在您发送第一张发票之前，我们需要更多详细信息。',
        yourCompanyName: '您的公司名称',
        yourCompanyWebsite: '您的公司网站',
        yourCompanyWebsiteNote: '如果您没有网站，可以提供您公司的 LinkedIn 或社交媒体资料。',
        invalidDomainError: '您输入了无效的域名。要继续，请输入有效的域名。',
        publicDomainError: '您已进入公共域。要继续，请输入私人域。',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} 扫描中`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} 个待处理`);
            }
            return {
                one: statusText.length > 0 ? `1 笔费用 (${statusText.join(', ')})` : `1 笔报销`,
                other: (count: number) => (statusText.length > 0 ? `${count} 笔费用 (${statusText.join(', ')})` : `${count} 笔费用`),
            };
        },
        expenseCount: () => {
            return {
                one: '1 笔报销',
                other: (count: number) => `${count} 笔费用`,
            };
        },
        deleteExpense: () => ({
            one: '删除报销',
            other: '删除费用',
        }),
        deleteConfirmation: () => ({
            one: '您确定要删除此费用吗？',
            other: '您确定要删除这些费用吗？',
        }),
        deleteReport: '删除报告',
        deleteReportConfirmation: '您确定要删除此报告吗？',
        settledExpensify: '已支付',
        done: '完成',
        settledElsewhere: '在其他地方支付',
        individual: '个人',
        business: '商务',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `使用 Expensify 支付 ${formattedAmount}` : `使用Expensify支付`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `以个人身份支付${formattedAmount}` : `用个人账户支付`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `用钱包支付${formattedAmount}` : `用钱包支付`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `支付 ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `以企业身份支付${formattedAmount}` : `用企业账户支付`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `标记${formattedAmount}为已支付` : `标记为已支付`),
        settleInvoicePersonal: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `已用个人账户${last4Digits}支付${amount}` : `已用个人账户支付`),
        settleInvoiceBusiness: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `已用企业账户${last4Digits}支付${amount}` : `已用企业账户支付`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `通过${policyName}支付${formattedAmount}` : `通过${policyName}支付`),
        businessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `已用银行账户${last4Digits}支付${amount} ` : `已用银行账户${last4Digits}支付 `),
        automaticallyPaidWithBusinessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) =>
            `已使用尾号为${last4Digits}的银行账户支付${amount} 通过<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">工作区规则</a>`,
        invoicePersonalBank: ({lastFour}: BankAccountLastFourParams) => `个人账户 • ${lastFour}`,
        invoiceBusinessBank: ({lastFour}: BankAccountLastFourParams) => `企业账户 • ${lastFour}`,
        nextStep: '下一步',
        finished: '完成',
        flip: '翻转',
        sendInvoice: ({amount}: RequestAmountParams) => `发送 ${amount} 发票`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `对于${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `已提交${memo ? `, 备注 ${memo}` : ''}`,
        automaticallySubmitted: `通过<a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">延迟提交</a>提交`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `跟踪 ${formattedAmount}${comment ? `对于${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `拆分 ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `split ${formattedAmount}${comment ? `对于${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `您分摊的金额 ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} 欠 ${amount}${comment ? `对于${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} 欠：`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}支付了${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} 支付了:`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} 花费了 ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} 花费：`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} 已批准：`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} 批准了 ${amount}`,
        payerSettled: ({amount}: PayerSettledParams) => `支付了${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `已支付${amount}。添加一个银行账户以接收您的付款。`,
        automaticallyApproved: `通过<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">工作区规则</a>批准`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `批准 ${amount}`,
        approvedMessage: `批准`,
        unapproved: `未批准`,
        automaticallyForwarded: `通过<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">工作区规则</a>批准`,
        forwarded: `批准`,
        rejectedThisReport: '拒绝了此报告',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `已开始付款，但正在等待${submitterDisplayName}添加银行账户。`,
        adminCanceledRequest: '取消了付款',
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) => `取消了${amount}付款，因为${submitterDisplayName}在30天内未启用他们的Expensify Wallet。`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) => `${submitterDisplayName} 添加了一个银行账户。${amount} 付款已完成。`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}已标记为已支付`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''}已用钱包支付`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''}通过<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">工作区规则</a>使用Expensify支付`,
        noReimbursableExpenses: '此报告的金额无效',
        pendingConversionMessage: '您重新联网后，总计将更新',
        changedTheExpense: '更改了费用',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `将${valueName}更改为${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `将${translatedChangedField}设置为${newMerchant}，这将金额设置为${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `${valueName}（之前为${oldValueToDisplay}）`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `${valueName} 改为 ${newValueToDisplay}（之前为 ${oldValueToDisplay}）`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `将${translatedChangedField}更改为${newMerchant}（之前为${oldMerchant}），这更新了金额为${newAmountToDisplay}（之前为${oldAmountToDisplay}）`,
        basedOnAI: '基于过去的活动',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `基于 <a href="${rulesLink}">工作区规则</a>` : '基于工作区规则'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `为${comment}` : '费用'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `发票报告 #${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} 已发送${comment ? `对于${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `将费用从个人空间移动到${workspaceName ?? `与${reportName}聊天`}`,
        movedToPersonalSpace: '将费用移至个人空间',
        tagSelection: ({policyTagListName}: TagSelectionParams = {}) => `选择${policyTagListName ?? '一个标签'}以更好地管理您的支出。`,
        categorySelection: '选择一个类别以更好地组织您的支出。',
        error: {
            invalidCategoryLength: '类别名称超过255个字符。请缩短或选择不同的类别。',
            invalidTagLength: '标签名称超过255个字符。请缩短它或选择一个不同的标签。',
            invalidAmount: '请在继续之前输入有效金额',
            invalidDistance: '请在继续之前输入有效的距离',
            invalidIntegerAmount: '请在继续之前输入一个完整的美元金额',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `最大税额为${amount}`,
            invalidSplit: '拆分的总和必须等于总金额',
            invalidSplitParticipants: '请输入一个大于零的金额，至少适用于两个参与者。',
            invalidSplitYourself: '请输入一个非零金额进行拆分',
            noParticipantSelected: '请选择一位参与者',
            other: '发生意外错误。请稍后再试。',
            genericCreateFailureMessage: '提交此费用时发生意外错误。请稍后再试。',
            genericCreateInvoiceFailureMessage: '发送此发票时出现意外错误。请稍后再试。',
            genericHoldExpenseFailureMessage: '暂时无法暂扣此费用，请稍后再试。',
            genericUnholdExpenseFailureMessage: '将此费用从保留状态中移除时发生意外错误。请稍后再试。',
            receiptDeleteFailureError: '删除此收据时发生意外错误。请稍后再试。',
            receiptFailureMessage: '<rbr>上传收据时出错。请先 <a href="download">保存收据</a>，然后 <a href="retry">再试</a> 稍后。</rbr>',
            receiptFailureMessageShort: '上传您的收据时出错。',
            genericDeleteFailureMessage: '删除此费用时出现意外错误。请稍后再试。',
            genericEditFailureMessage: '编辑此费用时发生意外错误。请稍后再试。',
            genericSmartscanFailureMessage: '交易缺少字段',
            duplicateWaypointsErrorMessage: '请删除重复的航点',
            atLeastTwoDifferentWaypoints: '请输入至少两个不同的地址',
            splitExpenseMultipleParticipantsErrorMessage: '无法在工作区和其他成员之间拆分费用。请更新您的选择。',
            invalidMerchant: '请输入有效的商家名称',
            atLeastOneAttendee: '必须至少选择一位参与者',
            invalidQuantity: '请输入有效的数量',
            quantityGreaterThanZero: '数量必须大于零',
            invalidSubrateLength: '必须至少有一个子费率',
            invalidRate: '此工作区的费率无效。请选择工作区中可用的费率。',
        },
        dismissReceiptError: '忽略错误',
        dismissReceiptErrorConfirmation: '注意！忽略此错误将完全删除您上传的收据。您确定吗？',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) => `开始结算。在${submitterDisplayName}启用他们的钱包之前，付款将被暂停。`,
        enableWallet: '启用钱包',
        hold: '保持',
        unhold: '移除保留',
        holdExpense: () => ({
            one: '暂挂费用',
            other: '挂起费用',
        }),
        unholdExpense: '取消保留费用',
        heldExpense: '保留此费用',
        unheldExpense: '取消搁置此费用',
        moveUnreportedExpense: '移动未报告的费用',
        addUnreportedExpense: '添加未报告的费用',
        selectUnreportedExpense: '请选择至少一个费用添加到报告中。',
        emptyStateUnreportedExpenseTitle: '没有未报告的费用',
        emptyStateUnreportedExpenseSubtitle: '看起来您没有未报告的费用。请尝试在下面创建一个。',
        addUnreportedExpenseConfirm: '添加到报告',
        newReport: '新报告',
        explainHold: () => ({
            one: '请说明你为何搁置这笔费用。',
            other: '请说明你为何将这些费用暂缓处理。',
        }),
        retracted: '撤回',
        retract: '撤回',
        reopened: '重新打开',
        reopenReport: '重新打开报告',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) => `此报告已导出到${connectionName}。更改它可能会导致数据不一致。您确定要重新打开此报告吗？`,
        reason: '原因',
        holdReasonRequired: '暂停时需要提供原因。',
        expenseWasPutOnHold: '费用已被搁置',
        expenseOnHold: '此费用已被搁置。请查看评论以了解下一步。',
        expensesOnHold: '所有费用已被暂停。请查看评论以了解下一步。',
        expenseDuplicate: '此费用与另一项费用的详细信息相似。请查看重复项以继续。',
        someDuplicatesArePaid: '其中一些重复项已经被批准或支付。',
        reviewDuplicates: '审核重复项',
        keepAll: '保留全部',
        confirmApprove: '确认批准金额',
        confirmApprovalAmount: '仅批准合规的费用，或批准整个报告。',
        confirmApprovalAllHoldAmount: () => ({
            one: '此费用已暂停。您仍然想要批准吗？',
            other: '这些费用已被搁置。您仍然想要批准吗？',
        }),
        confirmPay: '确认付款金额',
        confirmPayAmount: '支付未冻结的部分，或支付整个报告。',
        confirmPayAllHoldAmount: () => ({
            one: '此费用已被搁置。您仍然想要支付吗？',
            other: '这些费用已被搁置。您还要继续支付吗？',
        }),
        payOnly: '仅支付',
        approveOnly: '仅批准',
        holdEducationalTitle: '是否应暂存此项费用？',
        whatIsHoldExplain: '暂存功能如同对费用按下“暂停键”，待您准备提交时再处理。',
        holdIsLeftBehind: '即使提交整份报销单，暂存的费用仍会保留。',
        unholdWhenReady: '准备提交时，请取消暂存状态。',
        changePolicyEducational: {
            title: '您已移动此报告！',
            description: '请仔细检查这些项目，因为在将报告移动到新工作区时，它们往往会发生变化。',
            reCategorize: '<strong>重新分类任何费用</strong>以符合工作区规则。',
            workflows: '此报告现在可能需要遵循不同的<strong>审批流程。</strong>',
        },
        changeWorkspace: '更改工作区',
        set: 'set',
        changed: '未更改',
        removed: 'removed',
        transactionPending: '交易待处理。',
        chooseARate: '选择每英里或每公里的工作区报销费率',
        unapprove: '取消批准',
        unapproveReport: '取消批准报告',
        headsUp: '注意！',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `此报告已导出到${accountingIntegration}。更改它可能会导致数据不一致。您确定要取消批准此报告吗？`,
        reimbursable: '可报销的',
        nonReimbursable: '不可报销',
        bookingPending: '此预订正在等待处理中',
        bookingPendingDescription: '此预订待定，因为尚未付款。',
        bookingArchived: '此预订已存档',
        bookingArchivedDescription: '此预订已归档，因为旅行日期已过。如有需要，请添加最终金额的费用。',
        attendees: '与会者',
        whoIsYourAccountant: '谁是你的会计师？',
        paymentComplete: '付款完成',
        time: '时间',
        startDate: '开始日期',
        endDate: '结束日期',
        startTime: '开始时间',
        endTime: '结束时间',
        deleteSubrate: '删除子费率',
        deleteSubrateConfirmation: '您确定要删除此子费率吗？',
        quantity: '数量',
        subrateSelection: '选择一个子费率并输入数量。',
        qty: '数量',
        firstDayText: () => ({
            one: `第一天：1小时`,
            other: (count: number) => `第一天：${count.toFixed(2)} 小时`,
        }),
        lastDayText: () => ({
            one: `最后一天：1小时`,
            other: (count: number) => `最后一天：${count.toFixed(2)} 小时`,
        }),
        tripLengthText: () => ({
            one: `行程：1整天`,
            other: (count: number) => `行程：${count}整天`,
        }),
        dates: '日期',
        rates: '费率',
        submitsTo: ({name}: SubmitsToParams) => `提交给${name}`,
        moveExpenses: () => ({one: '移动费用', other: '移动费用'}),
        reject: {
            educationalTitle: '应该保留还是拒绝？',
            educationalText: '如果你还没准备好批准或支付一笔报销，可以选择保留或拒绝。',
            holdExpenseTitle: '保留报销，以便在批准或支付之前要求更多细节。',
            approveExpenseTitle: '在保留的报销保持分配给你的同时，批准其他报销。',
            heldExpenseLeftBehindTitle: '当你批准整个报销单时，已保留的报销会被忽略。',
            rejectExpenseTitle: '拒绝你不打算批准或支付的报销。',
            reasonPageTitle: '拒绝报销',
            reasonPageDescription: '解释一下你拒绝这笔费用的原因。',
            rejectReason: '拒绝原因',
            markAsResolved: '标记为已解决',
            rejectedStatus: '此费用被拒绝。等待您解决问题并标记为已解决以启用提交。',
            reportActions: {
                rejectedExpense: '已拒绝该报销',
                markedAsResolved: '已将拒绝原因标记为已解决',
            },
        },
        changeApprover: {
            title: '更改审批人',
            subtitle: '选择一个选项来更改此报告的审批人。',
            description: ({workflowSettingLink}: WorkflowSettingsParam) => `<a href="${workflowSettingLink}">您也可以在[工作流设置</a>中永久更改所有报告的审批人。`,
            changedApproverMessage: ({managerID}: ChangedApproverMessageParams) => `将审批人更改为 <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: '添加审批人',
                addApproverSubtitle: '为现有工作流添加一个额外的审批人。',
                bypassApprovers: '跳过审批人',
                bypassApproversSubtitle: '将自己指定为最终审批人并跳过任何剩余的审批人。',
            },
            addApprover: {
                subtitle: '在我们将此报告路由到其余审批工作流之前，为此报告选择一个额外的审批人。',
            },
        },
        chooseWorkspace: '选择一个工作区',
    },
    transactionMerge: {
        listPage: {
            header: '合并费用',
            noEligibleExpenseFound: '未找到可合并的费用',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>您没有可与此合并的费用。<a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">了解更多</a>关于可合并费用的信息。</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) => `选择一个<a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">可合并的费用</a> <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: '选择收据',
            pageTitle: '选择您想保留的收据：',
        },
        detailsPage: {
            header: '选择详情',
            pageTitle: '选择您想保留的详情：',
            noDifferences: '发现交易无差异',
            pleaseSelectError: ({field}: {field: string}) => `请选择一个${field}`,
            pleaseSelectAttendees: '请选择参与者',
            selectAllDetailsError: '继续前请选取所有详情。',
        },
        confirmationPage: {
            header: '确认详情',
            pageTitle: '确认您保留的详情。未保留的详情将被删除。',
            confirmButton: '合并费用',
        },
    },
    share: {
        shareToExpensify: '分享到Expensify',
        messageInputLabel: '消息',
    },
    notificationPreferencesPage: {
        header: '通知偏好设置',
        label: '通知我新消息',
        notificationPreferences: {
            always: '立即',
            daily: '每日',
            mute: '静音',
            hidden: 'Hidden',
        },
    },
    loginField: {
        numberHasNotBeenValidated: '号码尚未验证。点击按钮通过短信重新发送验证链接。',
        emailHasNotBeenValidated: '电子邮件尚未验证。点击按钮通过短信重新发送验证链接。',
    },
    avatarWithImagePicker: {
        uploadPhoto: '上传照片',
        removePhoto: '删除照片',
        editImage: '编辑照片',
        viewPhoto: '查看照片',
        imageUploadFailed: '图片上传失败',
        deleteWorkspaceError: '抱歉，删除您的工作区头像时出现了意外问题。',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `所选图像超过了最大上传大小 ${maxUploadSizeInMB} MB。`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `请上传大于${minHeightInPx}x${minWidthInPx}像素且小于${maxHeightInPx}x${maxWidthInPx}像素的图片。`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `头像必须是以下类型之一：${allowedExtensions.join(', ')}。`,
    },
    modal: {
        backdropLabel: '模态背景',
    },
    profilePage: {
        profile: '个人资料',
        preferredPronouns: '首选代词',
        selectYourPronouns: '选择您的代词',
        selfSelectYourPronoun: '自选您的代词',
        emailAddress: '电子邮件地址',
        setMyTimezoneAutomatically: '自动设置我的时区',
        timezone: '时区',
        invalidFileMessage: '无效文件。请尝试其他图像。',
        avatarUploadFailureMessage: '上传头像时发生错误。请再试一次。',
        online: '在线',
        offline: '离线',
        syncing: '同步中',
        profileAvatar: '个人头像',
        publicSection: {
            title: '公开',
            subtitle: '这些信息会显示在您的公开资料上。任何人都可以看到。',
        },
        privateSection: {
            title: '私人',
            subtitle: '这些信息用于旅行和支付。它们不会显示在您的公开资料上。',
        },
    },
    securityPage: {
        title: '安全选项',
        subtitle: '启用双因素认证以确保您的账户安全。',
        goToSecurity: '返回安全页面',
    },
    shareCodePage: {title: '您的代码', subtitle: '通过分享您的个人二维码或推荐链接邀请成员加入Expensify。'},
    pronounsPage: {
        pronouns: '代词',
        isShownOnProfile: '您的代词显示在您的个人资料上。',
        placeholderText: '搜索以查看选项',
    },
    contacts: {
        contactMethods: '联系方式',
        featureRequiresValidate: '此功能需要您验证您的账户。',
        validateAccount: '验证您的账户',
        helpText: ({email}: {email: string}) =>
            `添加更多登录方式并将收据发送到 Expensify。<br/><br/>添加电子邮件地址以将收据转发至 <a href="mailto:${email}">${email}</a>，或添加电话号码将收据短信发送至 47777（仅限美国号码）。`,
        pleaseVerify: '请验证此联系方式。',
        getInTouch: '我们将使用此方式与您联系。',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `请输入发送到${contactMethod}的验证码。验证码将在一分钟内到达。`,
        setAsDefault: '设为默认',
        yourDefaultContactMethod: '这是您当前的默认联系方式。在删除它之前，您需要选择另一种联系方式并点击“设为默认”。',
        removeContactMethod: '移除联系方式',
        removeAreYouSure: '您确定要删除此联系方式吗？此操作无法撤销。',
        failedNewContact: '无法添加此联系方式。',
        genericFailureMessages: {
            requestContactMethodValidateCode: '发送新的魔法代码失败。请稍等片刻再试。',
            validateSecondaryLogin: '魔法代码不正确或无效。请重试或请求新代码。',
            deleteContactMethod: '删除联系方式失败。请联系Concierge寻求帮助。',
            setDefaultContactMethod: '无法设置新的默认联系方式。请联系Concierge寻求帮助。',
            addContactMethod: '无法添加此联系方式。请联系Concierge寻求帮助。',
            enteredMethodIsAlreadySubmitted: '此联系方式已存在',
            passwordRequired: '需要密码。',
            contactMethodRequired: '联系方式是必需的',
            invalidContactMethod: '无效的联系方式',
        },
        newContactMethod: '新联系方式',
        goBackContactMethods: '返回到联系方式',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: '他/他/他的',
        heHimHisTheyThemTheirs: 'He / Him / His / They / Them / Theirs',
        sheHerHers: '她/她/她的',
        sheHerHersTheyThemTheirs: '她 / 她 / 她的 / 他们 / 他们 / 他们的',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: '每 / 每人',
        theyThemTheirs: '他们/他们/他们的',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: '叫我我的名字',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: '显示名称',
        isShownOnProfile: '您的显示名称会显示在您的个人资料上。',
    },
    timezonePage: {
        timezone: '时区',
        isShownOnProfile: '您的时区显示在您的个人资料上。',
        getLocationAutomatically: '自动确定您的位置',
    },
    updateRequiredView: {
        updateRequired: '需要更新',
        pleaseInstall: '请更新到最新版本的 New Expensify',
        pleaseInstallExpensifyClassic: '请安装最新版本的Expensify',
        toGetLatestChanges: '对于移动设备或桌面设备，下载并安装最新版本。对于网页，刷新您的浏览器。',
        newAppNotAvailable: '新版Expensify应用已不再可用。',
    },
    initialSettingsPage: {
        about: '关于',
        aboutPage: {
            description: '全新的 Expensify 应用由来自世界各地的开源开发者社区构建。帮助我们构建 Expensify 的未来。',
            appDownloadLinks: '应用下载链接',
            viewKeyboardShortcuts: '查看键盘快捷键',
            viewTheCode: '查看代码',
            viewOpenJobs: '查看开放职位',
            reportABug: '报告一个错误',
            troubleshoot: '故障排除',
        },
        appDownloadLinks: {
            android: {
                label: 'Android',
            },
            ios: {
                label: 'iOS',
            },
            desktop: {
                label: 'macOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: '清除缓存并重启',
            viewConsole: '查看调试控制台',
            debugConsole: '调试控制台',
            description: '<muted-text>使用以下工具帮助排除 Expensify 体验中的故障。如果遇到任何问题，<concierge-link>请提交错误</concierge-link>。</muted-text>',
            confirmResetDescription: '所有未发送的草稿消息将会丢失，但您的其他数据是安全的。',
            resetAndRefresh: '重置并刷新',
            clientSideLogging: '客户端日志记录',
            noLogsToShare: '没有日志可分享',
            useProfiling: '使用分析工具',
            profileTrace: '个人资料追踪',
            results: '成果',
            releaseOptions: '发布选项',
            testingPreferences: '测试偏好设置',
            useStagingServer: '使用测试服务器',
            forceOffline: '强制离线',
            simulatePoorConnection: '模拟网络连接不良',
            simulateFailingNetworkRequests: '模拟网络请求失败',
            authenticationStatus: '身份验证状态',
            deviceCredentials: '设备凭证',
            invalidate: '作废',
            destroy: '销毁',
            maskExportOnyxStateData: '导出 Onyx 状态时屏蔽敏感成员数据',
            exportOnyxState: '导出 Onyx 状态',
            importOnyxState: '导入 Onyx 状态',
            testCrash: '测试崩溃',
            resetToOriginalState: '重置为原始状态',
            usingImportedState: '您正在使用导入的状态。点击这里清除它。',
            debugMode: '调试模式',
            invalidFile: '文件无效',
            invalidFileDescription: '您尝试导入的文件无效。请再试一次。',
            invalidateWithDelay: '延迟失效',
            recordTroubleshootData: '记录故障排除数据',
            softKillTheApp: '软删除应用程序',
            kill: '杀戮',
        },
        debugConsole: {
            saveLog: '保存日志',
            shareLog: '共享日志',
            enterCommand: '输入命令',
            execute: '执行',
            noLogsAvailable: '没有可用日志',
            logSizeTooLarge: ({size}: LogSizeParams) => `日志大小超过 ${size} MB。请使用“保存日志”来下载日志文件。`,
            logs: '日志',
            viewConsole: '查看控制台',
        },
        security: '安全性',
        signOut: '登出',
        restoreStashed: '恢复暂存的登录信息',
        signOutConfirmationText: '如果您退出登录，任何离线更改都将丢失。',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>阅读<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">服务条款</a>和<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">隐私条款</a>。</muted-text-micro>`,
        help: '帮助',
        whatIsNew: '新内容',
        accountSettings: '账户设置',
        account: '账户',
        general: '常规',
    },
    closeAccountPage: {
        closeAccount: '关闭账户',
        reasonForLeavingPrompt: '我们不想看到您离开！您能否告诉我们原因，以便我们改进？',
        enterMessageHere: '输入消息内容',
        closeAccountWarning: '关闭您的账户无法撤销。',
        closeAccountPermanentlyDeleteData: '您确定要删除您的账户吗？这将永久删除所有未结费用。',
        enterDefaultContactToConfirm: '请输入您的默认联系方式以确认您希望关闭账户。您的默认联系方式是：',
        enterDefaultContact: '输入您的默认联系方式',
        defaultContact: '默认联系方式：',
        enterYourDefaultContactMethod: '请输入您的默认联系方式以关闭您的账户。',
    },
    mergeAccountsPage: {
        mergeAccount: '合并账户',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `输入要合并到 <strong>${login}</strong> 中的账户。`,
            notReversibleConsent: '我明白这是不可逆的。',
        },
        accountValidate: {
            confirmMerge: '您确定要合并账户吗？',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) => `合并账户是不可逆转的，将导致 <strong>${login}</strong> 失去任何未提交的支出。`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `要继续，请输入发送到 <strong>${login}</strong> 的神奇代码。`,
            errors: {
                incorrectMagicCode: '魔法代码不正确或无效。请重试或请求新代码。',
                fallback: '出现问题。请稍后再试。',
            },
        },
        mergeSuccess: {
            accountsMerged: '账户已合并！',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>您已成功将 <strong>${from}</strong> 中的所有数据合并到 <strong>${to}</strong>。今后，您可以使用该账户的任意一个登录名。</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '我们正在处理此事',
            limitedSupport: '我们尚未支持在 New Expensify 上合并账户。请在 Expensify Classic 上执行此操作。',
            reachOutForHelp: '<muted-text><centered-text>如有任何疑问，请随时<concierge-link>联系Concierge</concierge-link>！</centered-text></muted-text>',
            goToExpensifyClassic: '前往 Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>您无法合并 <strong>${email}</strong>，因为它受 <strong>${email.split('@').at(1) ?? ''}</strong> 控制。请<concierge-link>联系Concierge</concierge-link>寻求帮助。</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>您不能将 <strong>${email}</strong> 并入其他账户，因为您的域名管理员已将其设置为您的主登录名。请将其他账户合并到该账户中。</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>您无法合并账户，因为 <strong>${email}</strong> 启用了双因素身份验证 (2FA)。请禁用 <strong>${email}</strong> 的 2FA，然后重试。</centered-text></muted-text>`,
            learnMore: '了解更多关于合并账户的信息。',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>您无法合并 <strong>${email}</strong>，因为它已被锁定。请<concierge-link>联系Concierge</concierge-link>寻求帮助。</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>您无法合并账户，因为 <strong>${email}</strong> 没有 Expensify 账户。请将<a href="${contactMethodLink}">其添加为联系方式</a>。</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>您不能将 <strong>${email}</strong> 并入其他账户。请将其他账户合并到其中。</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>您不能将账户合并到 <strong>${email}</strong>，因为该账户拥有发票账单关系。</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '请稍后再试',
            description: '尝试合并账户的次数过多。请稍后再试。',
        },
        mergeFailureUnvalidatedAccount: {
            description: '您无法合并到其他账户，因为该账户尚未验证。请验证该账户后重试。',
        },
        mergeFailureSelfMerge: {
            description: '您不能将一个账户合并到其自身。',
        },
        mergeFailureGenericHeading: '无法合并账户',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '报告可疑活动',
        lockAccount: '锁定账户',
        unlockAccount: '解锁账户',
        compromisedDescription: '发现您的账户有异常? 报告后将立即锁定账户, 阻止新的Expensify卡交易, 并防止任何账户更改。',
        domainAdminsDescription: '对于域管理员: 这也会暂停您域中所有Expensify卡活动和管理员操作。',
        areYouSure: '您确定要锁定您的Expensify账户吗?',
        onceLocked: '一旦锁定，您的账户将被限制，等待解锁请求和安全审查。',
    },
    failedToLockAccountPage: {
        failedToLockAccount: '无法锁定账户',
        failedToLockAccountDescription: `我们无法锁定您的账户。请与Concierge聊天以解决此问题。`,
        chatWithConcierge: '与Concierge聊天',
    },
    unlockAccountPage: {
        accountLocked: '账户已锁定',
        yourAccountIsLocked: '您的账户已被锁定',
        chatToConciergeToUnlock: '与Concierge聊天以解决安全问题并解锁您的账户。',
        chatWithConcierge: '与Concierge聊天',
    },
    passwordPage: {
        changePassword: '更改密码',
        changingYourPasswordPrompt: '更改密码将同时更新您在 Expensify.com 和 New Expensify 账户的密码。',
        currentPassword: '当前密码',
        newPassword: '新密码',
        newPasswordPrompt: '您的新密码必须与旧密码不同，并且至少包含8个字符、1个大写字母、1个小写字母和1个数字。',
    },
    twoFactorAuth: {
        headerTitle: '双重身份验证',
        twoFactorAuthEnabled: '已启用双重身份验证',
        whatIsTwoFactorAuth: '两因素认证 (2FA) 有助于保护您的账户安全。登录时，您需要输入由您首选的身份验证应用程序生成的代码。',
        disableTwoFactorAuth: '禁用双重身份验证',
        explainProcessToRemove: '为了禁用双重身份验证 (2FA)，请输入来自您的身份验证应用程序的有效代码。',
        disabled: '双重身份验证现已禁用',
        noAuthenticatorApp: '您将不再需要验证器应用程序来登录Expensify。',
        stepCodes: '恢复代码',
        keepCodesSafe: '请妥善保管这些恢复代码！',
        codesLoseAccess: dedent(`
            如果你无法使用身份验证器应用且没有这些代码，你将失去对账户的访问权限。

            注意：设置双重身份验证将使你退出所有其他活跃会话。
        `),
        errorStepCodes: '请在继续之前复制或下载代码',
        stepVerify: '验证',
        scanCode: '使用您的设备扫描二维码',
        authenticatorApp: '身份验证器应用程序',
        addKey: '或者将此密钥添加到您的身份验证器应用中：',
        enterCode: '然后输入您的身份验证器应用生成的六位数代码。',
        stepSuccess: '完成',
        enabled: '已启用双重身份验证',
        congrats: '恭喜！现在您拥有了额外的安全保障。',
        copy: '复制',
        disable: '禁用',
        enableTwoFactorAuth: '启用双重身份验证',
        pleaseEnableTwoFactorAuth: '请启用双因素认证。',
        twoFactorAuthIsRequiredDescription: '出于安全考虑，Xero 需要双重身份验证才能连接集成。',
        twoFactorAuthIsRequiredForAdminsHeader: '需要双重身份验证',
        twoFactorAuthIsRequiredForAdminsTitle: '请启用双重身份验证',
        twoFactorAuthIsRequiredXero: '您的 Xero 会计连接需要使用双重身份验证。若要继续使用 Expensify，请启用它。',
        twoFactorAuthCannotDisable: '无法禁用双重身份验证',
        twoFactorAuthRequired: '您的Xero连接需要双因素认证（2FA），且无法禁用。',
        explainProcessToRemoveWithRecovery: '为了禁用双因素认证 (2FA)，请输入有效的恢复代码。',
        twoFactorAuthIsRequiredCompany: '贵公司要求使用双因素认证。要继续使用 Expensify，请启用该功能。',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: '请输入您的恢复代码',
            incorrectRecoveryCode: '恢复代码不正确。请重试。',
        },
        useRecoveryCode: '使用恢复代码',
        recoveryCode: '恢复代码',
        use2fa: '使用双重身份验证代码',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: '请输入您的双因素认证代码',
            incorrect2fa: '两步验证代码不正确。请重试。',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: '密码已更新！',
        allSet: '一切就绪。请妥善保管您的新密码。',
    },
    privateNotes: {
        title: '私人备注',
        personalNoteMessage: '在此处记录有关此聊天的笔记。您是唯一可以添加、编辑或查看这些笔记的人。',
        sharedNoteMessage: '在此处记录有关此聊天的笔记。Expensify员工和team.expensify.com域上的其他成员可以查看这些笔记。',
        composerLabel: '备注',
        myNote: '我的备注',
        error: {
            genericFailureMessage: '私人备注无法保存',
        },
    },
    billingCurrency: {
        error: {
            securityCode: '请输入有效的安全代码',
        },
        securityCode: '安全代码',
        changeBillingCurrency: '更改结算货币',
        changePaymentCurrency: '更改支付货币',
        paymentCurrency: '付款货币',
        paymentCurrencyDescription: '选择一个标准化货币，将所有个人费用转换为该货币。',
        note: `注意：更改支付货币会影响您为 Expensify 支付的费用。请参阅我们的<a href="${CONST.PRICING}">定价页面</a>了解详情。`,
    },
    addDebitCardPage: {
        addADebitCard: '添加借记卡',
        nameOnCard: '卡上的姓名',
        debitCardNumber: '借记卡号',
        expiration: '到期日期',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: '账单地址',
        growlMessageOnSave: '您的借记卡已成功添加',
        expensifyPassword: 'Expensify密码',
        error: {
            invalidName: '名称只能包含字母',
            addressZipCode: '请输入有效的邮政编码',
            debitCardNumber: '请输入有效的借记卡号',
            expirationDate: '请选择一个有效的到期日期',
            securityCode: '请输入有效的安全代码',
            addressStreet: '请输入一个有效的账单地址，不能是邮政信箱。',
            addressState: '请选择一个州',
            addressCity: '请输入城市名称',
            genericFailureMessage: '添加您的卡时发生错误。请重试。',
            password: '请输入您的Expensify密码',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '添加支付卡',
        nameOnCard: '卡上的姓名',
        paymentCardNumber: '卡号',
        expiration: '到期日期',
        expirationDate: 'MM/YY',
        cvv: 'CVV',
        billingAddress: '账单地址',
        growlMessageOnSave: '您的支付卡已成功添加',
        expensifyPassword: 'Expensify密码',
        error: {
            invalidName: '名称只能包含字母',
            addressZipCode: '请输入有效的邮政编码',
            paymentCardNumber: '请输入有效的卡号',
            expirationDate: '请选择一个有效的到期日期',
            securityCode: '请输入有效的安全代码',
            addressStreet: '请输入一个有效的账单地址，不能是邮政信箱。',
            addressState: '请选择一个州',
            addressCity: '请输入城市名称',
            genericFailureMessage: '添加您的卡时发生错误。请重试。',
            password: '请输入您的Expensify密码',
        },
    },
    walletPage: {
        balance: '余额',
        paymentMethodsTitle: '支付方式',
        setDefaultConfirmation: '设为默认付款方式',
        setDefaultSuccess: '默认支付方式已设置！',
        deleteAccount: '删除账户',
        deleteConfirmation: '您确定要删除此账户吗？',
        error: {
            notOwnerOfBankAccount: '将此银行账户设置为默认支付方式时发生错误。',
            invalidBankAccount: '此银行账户已被暂时冻结',
            notOwnerOfFund: '将此卡设置为默认付款方式时发生错误',
            setDefaultFailure: '出现问题。请与Concierge聊天以获得进一步帮助。',
        },
        addBankAccountFailure: '尝试添加您的银行账户时发生意外错误。请再试一次。',
        getPaidFaster: '更快收到付款',
        addPaymentMethod: '添加支付方式以便直接在应用中发送和接收付款。',
        getPaidBackFaster: '更快获得偿还',
        secureAccessToYourMoney: '安全访问您的资金',
        receiveMoney: '以本地货币接收款项',
        expensifyWallet: 'Expensify Wallet（测试版）',
        sendAndReceiveMoney: '与朋友发送和接收资金。仅限美国银行账户。',
        enableWallet: '启用钱包',
        addBankAccountToSendAndReceive: '添加银行账户以进行付款或收款。',
        addDebitOrCreditCard: '添加借记卡或信用卡',
        assignedCards: '已分配的卡片',
        assignedCardsDescription: '这些是由工作区管理员分配的卡片，用于管理公司支出。',
        expensifyCard: 'Expensify Card',
        walletActivationPending: '我们正在审核您的信息。请几分钟后再查看！',
        walletActivationFailed: '很遗憾，您的钱包目前无法启用。请与Concierge聊天以获得进一步帮助。',
        addYourBankAccount: '添加您的银行账户',
        addBankAccountBody: '让我们将您的银行账户连接到Expensify，这样在应用程序中直接发送和接收付款将变得比以往任何时候都更容易。',
        chooseYourBankAccount: '选择您的银行账户',
        chooseAccountBody: '确保您选择正确的选项。',
        confirmYourBankAccount: '确认您的银行账户',
        personalBankAccounts: '个人银行账户',
        businessBankAccounts: '企业银行账户',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify Travel Card',
        availableSpend: '剩余额度',
        smartLimit: {
            name: '智能限制',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `您可以在此卡上消费最多 ${formattedLimit}，并且随着您提交的费用被批准，限额将重置。`,
        },
        fixedLimit: {
            name: '固定限额',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `您可以在这张卡上消费最多${formattedLimit}，然后它将停用。`,
        },
        monthlyLimit: {
            name: '每月限额',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `您每月最多可以在此卡上花费${formattedLimit}。限额将在每个日历月的第一天重置。`,
        },
        virtualCardNumber: '虚拟卡号',
        travelCardCvv: '旅行卡 CVV',
        physicalCardNumber: '实体卡号',
        getPhysicalCard: '获取实体卡',
        reportFraud: '报告虚拟卡欺诈',
        physicalCardPin: 'PIN',
        reportTravelFraud: '报告旅行卡欺诈',
        reviewTransaction: '查看交易',
        suspiciousBannerTitle: '可疑交易',
        suspiciousBannerDescription: '我们注意到您的卡上有可疑交易。点击下方查看。',
        cardLocked: '在我们的团队审核您公司的账户期间，您的卡已被暂时锁定。',
        cardDetails: {
            cardNumber: '虚拟卡号',
            expiration: '过期',
            cvv: 'CVV',
            address: '地址',
            revealDetails: '显示详细信息',
            revealCvv: '显示CVV',
            copyCardNumber: '复制卡号',
            updateAddress: '更新地址',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `已添加到${platform}钱包`,
        cardDetailsLoadingFailure: '加载卡片详情时发生错误。请检查您的互联网连接并重试。',
        validateCardTitle: '让我们确认一下身份',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `请输入发送到${contactMethod}的验证码以查看您的卡详细信息。验证码应在一两分钟内到达。`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `请<a href="${missingDetailsLink}">添加您的个人信息</a>，然后重试。`,
        unexpectedError: '尝试获取您的 Expensify 卡片详情时出错。请重试。',
        cardFraudAlert: {
            confirmButtonText: '是的，我愿意。',
            reportFraudButtonText: '不，不是我',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `已清除可疑活动并重新激活卡片 x${cardLastFour}。一切准备就绪，可以继续报销了！`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `已停用以${cardLastFour}结尾的卡片`,
            alertMessage: ({
                cardLastFour,
                amount,
                merchant,
                date,
            }: {
                cardLastFour: string;
                amount: string;
                merchant: string;
                date: string;
            }) => `在卡号以${cardLastFour}结尾的卡上发现可疑活动。您是否认可此笔费用？

${merchant}的${amount} - ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: '花费',
        workflowDescription: '配置从支出发生到审批和支付的工作流程。',
        submissionFrequency: '提交频率',
        submissionFrequencyDescription: '选择提交费用的频率。',
        submissionFrequencyDateOfMonth: '月份日期',
        addApprovalsTitle: '添加审批',
        disableApprovalPromptDescription: '禁用审批将删除所有现有的审批工作流程。',
        addApprovalButton: '添加审批工作流程',
        addApprovalTip: '此默认工作流程适用于所有成员，除非存在更具体的工作流程。',
        approver: '审批人',
        addApprovalsDescription: '在授权付款之前需要额外批准。',
        makeOrTrackPaymentsTitle: '进行或跟踪付款',
        makeOrTrackPaymentsDescription: '添加授权付款人以便在Expensify中进行付款或跟踪在其他地方进行的付款。',
        customApprovalWorkflowEnabled:
            '<muted-text-label>此工作区已启用自定义审批工作流程。要查看或更改此工作流程，请联系您的<account-manager-link>客户经理</account-manager-link>或<concierge-link>礼宾服务</concierge-link>。</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>此工作区已启用自定义审批工作流程。要查看或更改此工作流程，请联系<concierge-link>礼宾服务</concierge-link>。</muted-text-label>',
        editor: {
            submissionFrequency: '选择Expensify在分享无错误支出前应等待的时间。',
        },
        frequencyDescription: '选择您希望自动提交费用的频率，或者选择手动提交',
        frequencies: {
            instant: '即刻',
            weekly: '每周',
            monthly: '每月',
            twiceAMonth: '每月两次',
            byTrip: '按行程',
            manually: '手动',
            daily: '每日',
            lastDayOfMonth: '月末最后一天',
            lastBusinessDayOfMonth: '每月的最后一个工作日',
            ordinals: {
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': '第一',
                '2': '第二',
                '3': '第三',
                '4': '第四',
                '5': '第五',
                '6': '第六',
                '7': 'Seventh',
                '8': '第八',
                '9': '第九',
                '10': '第十',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: '该成员已属于另一个审批流程。此处的任何更新也会反映在那里。',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> 已经批准报告给 <strong>${name2}</strong>。请选择不同的审批人以避免循环工作流。`,
        emptyContent: {
            title: '没有成员可显示',
            expensesFromSubtitle: '所有工作区成员已属于现有的审批工作流程。',
            approverSubtitle: '所有审批者都属于现有的工作流程。',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: '提交频率无法更改。请重试或联系客服。',
        monthlyOffsetErrorMessage: '无法更改每月频率。请重试或联系支持。',
    },
    workflowsCreateApprovalsPage: {
        title: '确认',
        header: '添加更多审批人并确认。',
        additionalApprover: '额外审批人',
        submitButton: '添加工作流程',
    },
    workflowsEditApprovalsPage: {
        title: '编辑审批流程',
        deleteTitle: '删除审批流程',
        deletePrompt: '您确定要删除此审批工作流程吗？所有成员将随后遵循默认工作流程。',
    },
    workflowsExpensesFromPage: {
        title: '来自的费用',
        header: '当以下成员提交费用时：',
    },
    workflowsApproverPage: {
        genericErrorMessage: '无法更改审批人。请重试或联系客服。',
        header: '发送给此成员以供批准：',
    },
    workflowsPayerPage: {
        title: '授权付款人',
        genericErrorMessage: '授权付款人无法更改。请再试一次。',
        admins: '管理员',
        payer: '付款人',
        paymentAccount: '付款账户',
    },
    reportFraudPage: {
        title: '报告虚拟卡欺诈',
        description: '如果您的虚拟卡信息被盗或泄露，我们将永久停用您现有的卡，并为您提供一张新的虚拟卡和号码。',
        deactivateCard: '停用卡片',
        reportVirtualCardFraud: '报告虚拟卡欺诈',
    },
    reportFraudConfirmationPage: {
        title: '已报告卡片欺诈',
        description: '我们已永久停用您的现有卡。当您返回查看卡详细信息时，您将有一张新的虚拟卡可用。',
        buttonText: '知道了，谢谢！',
    },
    activateCardPage: {
        activateCard: '激活卡片',
        pleaseEnterLastFour: '请输入您卡片的最后四位数字。',
        activatePhysicalCard: '激活实体卡',
        error: {
            thatDidNotMatch: '这与您卡上的最后四位数字不匹配。请再试一次。',
            throttled: '您多次错误输入了您的 Expensify Card 的最后四位数字。如果您确认数字正确，请联系 Concierge 解决。否则，请稍后再试。',
        },
    },
    getPhysicalCard: {
        header: '获取实体卡',
        nameMessage: '请输入您的名字和姓氏，因为这将显示在您的卡片上。',
        legalName: '法定名称',
        legalFirstName: '法定名字',
        legalLastName: '法定姓氏',
        phoneMessage: '输入您的电话号码。',
        phoneNumber: '电话号码',
        address: '地址',
        addressMessage: '请输入您的送货地址。',
        streetAddress: '街道地址',
        city: '城市',
        state: '状态',
        zipPostcode: '邮政编码',
        country: '国家',
        confirmMessage: '请确认以下信息。',
        estimatedDeliveryMessage: '您的实体卡将在2-3个工作日内送达。',
        next: '下一个',
        getPhysicalCard: '获取实体卡',
        shipCard: '运送卡片',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer${amount ? ` ${amount}` : ''}`,
        instant: '即时（借记卡）',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% 费用（最低 ${minAmount}）`,
        ach: '1-3 个工作日（银行账户）',
        achSummary: '无费用',
        whichAccount: '哪个账户？',
        fee: '费用',
        transferSuccess: '转账成功！',
        transferDetailBankAccount: '您的资金应在接下来的1-3个工作日内到账。',
        transferDetailDebitCard: '您的资金应立即到账。',
        failedTransfer: '您的余额尚未完全结清。请转账到银行账户。',
        notHereSubTitle: '请从钱包页面转移您的余额',
        goToWallet: '前往钱包',
    },
    chooseTransferAccountPage: {
        chooseAccount: '选择账户',
    },
    paymentMethodList: {
        addPaymentMethod: '添加支付方式',
        addNewDebitCard: '添加新的借记卡',
        addNewBankAccount: '添加新银行账户',
        accountLastFour: '结束于',
        cardLastFour: '卡号末尾为',
        addFirstPaymentMethod: '添加支付方式以便直接在应用中发送和接收付款。',
        defaultPaymentMethod: '默认',
        bankAccountLastFour: ({lastFour}: BankAccountLastFourParams) => `银行账户 • ${lastFour}`,
    },
    preferencesPage: {
        appSection: {
            title: '应用偏好设置',
        },
        testSection: {
            title: '测试偏好设置',
            subtitle: '用于在预发布环境中调试和测试应用程序的设置。',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '接收相关功能更新和Expensify新闻',
        muteAllSounds: '将所有来自Expensify的声音静音',
    },
    priorityModePage: {
        priorityMode: '优先模式',
        explainerText: '选择是否仅#关注未读和置顶聊天，或显示所有内容，最近和置顶聊天置顶。',
        priorityModes: {
            default: {
                label: '最新',
                description: '显示所有聊天，按最近排序',
            },
            gsd: {
                label: '#专注',
                description: '仅显示按字母顺序排序的未读内容',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `在${policyName}中`,
        generatingPDF: '生成PDF...',
        waitForPDF: '请稍候，我们正在生成 PDF。',
        errorPDF: '生成PDF时出现错误。',
    },
    reportDescriptionPage: {
        roomDescription: '房间描述',
        roomDescriptionOptional: '房间描述（可选）',
        explainerText: '为房间设置自定义描述。',
    },
    groupChat: {
        lastMemberTitle: '注意！',
        lastMemberWarning: '由于您是这里的最后一个人，离开将使所有成员无法访问此聊天。您确定要离开吗？',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `${displayName}的群聊`,
    },
    languagePage: {
        language: '语言',
        aiGenerated: '此语言的翻译是自动生成的，可能包含错误。',
    },
    themePage: {
        theme: '主题',
        themes: {
            dark: {
                label: 'Dark',
            },
            light: {
                label: '光',
            },
            system: {
                label: '使用设备设置',
            },
        },
        chooseThemeBelowOrSync: '选择下面的主题，或与您的设备设置同步。',
    },
    termsOfUse: {
        terms: `<muted-text-xs>登录后，即表示您同意<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">服务条款</a>和<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">隐私条款</a>。</muted-text-xs>`,
        license: `<muted-text-xs>${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) 根据其<a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">许可</a>证提供汇款服务。</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: '没有收到魔法代码？',
        enterAuthenticatorCode: '请输入您的身份验证器代码',
        enterRecoveryCode: '请输入您的恢复代码',
        requiredWhen2FAEnabled: '启用双重身份验证时必需',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `在<a>${timeRemaining}</a>内请求新代码`,
        requestNewCodeAfterErrorOccurred: '请求新代码',
        error: {
            pleaseFillMagicCode: '请输入您的魔法代码',
            incorrectMagicCode: '魔法代码不正确或无效。请重试或请求新代码。',
            pleaseFillTwoFactorAuth: '请输入您的双因素认证代码',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: '请填写所有字段',
        pleaseFillPassword: '请输入您的密码',
        pleaseFillTwoFactorAuth: '请输入您的双重验证代码',
        enterYourTwoFactorAuthenticationCodeToContinue: '请输入您的双因素认证代码以继续',
        forgot: '忘记了吗？',
        requiredWhen2FAEnabled: '启用双重身份验证时必需',
        error: {
            incorrectPassword: '密码错误。请重试。',
            incorrectLoginOrPassword: '登录名或密码错误。请再试一次。',
            incorrect2fa: '两步验证代码不正确。请重试。',
            twoFactorAuthenticationEnabled: '您在此账户上启用了双重身份验证。请使用您的电子邮件或电话号码登录。',
            invalidLoginOrPassword: '登录名或密码无效。请重试或重置您的密码。',
            unableToResetPassword:
                '我们无法更改您的密码。这可能是由于旧的密码重置电子邮件中的密码重置链接已过期。我们已向您发送了一条新链接，您可以再次尝试。请检查您的收件箱和垃圾邮件文件夹；它应该会在几分钟内到达。',
            noAccess: '您无权访问此应用程序。请添加您的GitHub用户名以获取访问权限。',
            accountLocked: '由于多次尝试失败，您的账户已被锁定。请在1小时后再试。',
            fallback: '出现问题。请稍后再试。',
        },
    },
    loginForm: {
        phoneOrEmail: '电话或电子邮件',
        error: {
            invalidFormatEmailLogin: '输入的电子邮件无效。请修正格式并重试。',
        },
        cannotGetAccountDetails: '无法检索账户详细信息。请尝试重新登录。',
        loginForm: '登录表单',
        notYou: ({user}: NotYouParams) => `不是${user}？`,
    },
    onboarding: {
        welcome: '欢迎！',
        welcomeSignOffTitleManageTeam: '一旦您完成上述任务，我们可以探索更多功能，如审批工作流和规则！',
        welcomeSignOffTitle: '很高兴见到你！',
        explanationModal: {
            title: '欢迎使用Expensify',
            description: '一个应用程序即可以聊天的速度处理您的商业和个人支出。试试看，让我们知道您的想法。更多精彩即将到来！',
            secondaryDescription: '要切换回 Expensify Classic，只需点击您的个人资料图片 > 转到 Expensify Classic。',
        },
        getStarted: '开始使用',
        whatsYourName: '你叫什么名字？',
        peopleYouMayKnow: '您可能认识的人已经在这里了！验证您的电子邮件以加入他们。',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `来自${domain}的某人已经创建了一个工作区。请输入发送到${email}的魔法代码。`,
        joinAWorkspace: '加入工作区',
        listOfWorkspaces: '这是您可以加入的工作区列表。别担心，如果您愿意，您可以稍后再加入。',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} 名成员${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: '你在哪里工作？',
        errorSelection: '选择一个选项继续',
        purpose: {
            title: '你今天想做什么？',
            errorContinue: '请按继续进行设置',
            errorBackButton: '请完成设置问题以开始使用该应用程序',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '由我的雇主报销',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: '管理我团队的费用',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '跟踪和预算费用',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '与朋友聊天并分摊费用',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: '其他内容',
        },
        employees: {
            title: '你有多少员工？',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 名员工',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50名员工',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100名员工',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1,000名员工',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '超过1,000名员工',
        },
        accounting: {
            title: '您是否使用任何会计软件？',
            none: 'None',
        },
        interestedFeatures: {
            title: '您对哪些功能感兴趣？',
            featuresAlreadyEnabled: '以下是我们最受欢迎的功能：',
            featureYouMayBeInterestedIn: '启用其他功能：',
        },
        error: {
            requiredFirstName: '请输入您的名字以继续',
        },
        workEmail: {
            title: '你的工作邮箱是什么？',
            subtitle: 'Expensify 在连接您的工作邮箱时效果最佳。',
            explanationModal: {
                descriptionOne: '转发到receipts@expensify.com进行扫描',
                descriptionTwo: '加入已经在使用Expensify的同事们',
                descriptionThree: '享受更个性化的体验',
            },
            addWorkEmail: '添加工作邮箱',
        },
        workEmailValidation: {
            title: '验证您的工作邮箱',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `请输入发送到${workEmail}的验证码。它将在一两分钟内到达。`,
        },
        workEmailValidationError: {
            publicEmail: '请输入有效的私人域名工作邮箱，例如 mitch@company.com',
            offline: '由于您似乎处于离线状态，我们无法添加您的工作邮箱。',
        },
        mergeBlockScreen: {
            title: '无法添加工作邮箱',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) => `我们无法添加${workEmail}。请稍后在设置中重试，或与Concierge聊天以获取指导。`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `进行[试驾](${testDriveURL})`,
                description: ({testDriveURL}) => `[快速产品演示](${testDriveURL})以了解 Expensify 为何是最快的报销方式。`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `进行[试驾](${testDriveURL})`,
                description: ({testDriveURL}) => `进行[试驾](${testDriveURL})即可获得团队 *3 个月的 Expensify 免费使用权！*`,
            },
            addExpenseApprovalsTask: {
                title: '添加费用审批',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *添加费用审批*，以审查你团队的支出并保持可控。

                        操作如下：

                        1. 前往*工作区*。
                        2. 选择你的工作区。
                        3. 点击*更多功能*。
                        4. 启用*工作流程*。
                        5. 在工作区编辑器中进入*工作流程*。
                        6. 启用*添加审批*。
                        7. 你将被设为费用审批人。邀请团队后，可将其更改为任一管理员。

                        [带我前往更多功能](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[创建](${workspaceConfirmationLink})一个工作区`,
                description: '创建一个工作区，并在您的设置专家的帮助下配置各项设置！',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `创建一个[工作区](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *创建一个工作区* 来跟踪费用、扫描收据、聊天等。

                        1. 点击 *工作区* > *新建工作区*。

                        *你的新工作区已就绪！* [查看](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `设置[分类](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *设置类别*，以便你的团队可以为费用进行编码，便于报告。

                        1. 点击 *工作区*。
                        3. 选择你的工作区。
                        4. 点击 *类别*。
                        5. 禁用你不需要的任何类别。
                        6. 在右上角添加你自己的类别。

                        [带我前往工作区类别设置](${workspaceCategoriesLink})。

                        ![设置类别](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: '提交一笔支出',
                description: dedent(`
                    通过输入金额或扫描收据来*提交一笔费用*。

                    1. 点击${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}按钮。
                    2. 选择*创建费用*。
                    3. 输入金额或扫描收据。
                    4. 添加你老板的电子邮箱或电话号码。
                    5. 点击*创建*。

                    就完成了！
                `),
            },
            adminSubmitExpenseTask: {
                title: '提交一笔支出',
                description: dedent(`
                    通过输入金额或扫描收据来*提交一笔费用*。

                    1. 点击${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}按钮。
                    2. 选择*创建费用*。
                    3. 输入金额或扫描收据。
                    4. 确认详情。
                    5. 点击*创建*。

                    就完成了！
                `),
            },
            trackExpenseTask: {
                title: '跟踪一笔支出',
                description: dedent(`
                    *记录一笔费用*，支持任何货币，无论是否有收据。

                    1. 点击${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}按钮。
                    2. 选择*创建费用*。
                    3. 输入金额或扫描收据。
                    4. 选择你的*个人*空间。
                    5. 点击*创建*。

                    这样就完成了！没错，就是这么简单。
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `连接${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : '到'}[${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '您的' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        连接 ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '您的' : '至'} ${integrationName}，实现自动费用编码与同步，让月末结账轻松无忧。

                        1. 点击*工作区*。
                        2. 选择您的工作区。
                        3. 点击*会计*。
                        4. 找到 ${integrationName}。
                        5. 点击*连接*。

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? dedent(`[前往会计](${workspaceAccountingLink}).

![连接到 ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`)
        : `[前往会计](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `连接[您的公司卡](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        连接您的公司信用卡，以自动导入并进行费用编码。

                        1. 点击*工作区*。
                        2. 选择您的工作区。
                        3. 点击*公司信用卡*。
                        4. 按照提示连接您的卡片。

                        [带我去连接我的公司信用卡](${corporateCardLink})。`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `邀请[您的团队](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *邀请你的团队* 加入 Expensify，使他们今天就能开始跟踪费用。

                        1. 点击 *工作空间*。
                        3. 选择你的工作空间。
                        4. 点击 *成员* > *邀请成员*。
                        5. 输入电子邮件或电话号码。
                        6. 如果需要，可以添加自定义邀请消息！

                        [带我前往工作空间成员](${workspaceMembersLink}).

                        ![邀请你的团队](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `设置[分类](${workspaceCategoriesLink})和[标签](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *设置类别和标签*，让您的团队可以为费用编码，轻松生成报表。

                        可通过[连接您的会计软件](${workspaceAccountingLink})自动导入，或在[工作区设置](${workspaceCategoriesLink})中手动设置。`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `设置[标签](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        使用标签为报销添加更多详细信息，例如项目、客户、地点和部门。如果需要多级标签，可以升级到 Control 方案。

                        1. 点击 *工作区（Workspaces）*。
                        3. 选择你的工作区。
                        4. 点击 *更多功能（More features）*。
                        5. 启用 *标签（Tags）*。
                        6. 在工作区编辑器中前往 *标签（Tags）*。
                        7. 点击 *+ 添加标签（+ Add tag）* 来创建你自己的标签。

                        [前往更多功能](${workspaceMoreFeaturesLink})。

                        ![设置标签](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `邀请您的[会计](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *邀请您的会计* 在您的工作区中协作并管理您的业务费用。

                        1. 点击 *Workspaces*。
                        2. 选择您的工作区。
                        3. 点击 *Members*。
                        4. 点击 *Invite member*。
                        5. 输入您会计的电子邮件地址。

                        [立即邀请您的会计](${workspaceMembersLink})。`),
            },
            startChatTask: {
                title: '开始聊天',
                description: dedent(`
                    使用对方的电子邮件或电话号码，与任何人*开始聊天*。

                    1. 点击${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}按钮。
                    2. 选择*开始聊天*。
                    3. 输入电子邮件或电话号码。

                    如果他们尚未使用 Expensify，将会自动收到邀请。

                    每次聊天也会同时变成电子邮件或短信，他们可以直接回复。
                `),
            },
            splitExpenseTask: {
                title: '拆分支出',
                description: dedent(`
                    与一个或多个人一起*分摊费用*。

                    1. 点击 ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} 按钮。
                    2. 选择*开始聊天*。
                    3. 输入电子邮件或电话号码。
                    4. 在聊天中点击灰色的*+*按钮 > *分摊费用*。
                    5. 通过选择*手动*、*扫描*或*距离*来创建费用。

                    如果愿意，可以添加更多细节，或者直接发送即可。让我们帮你拿回这笔钱！
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `查看您的[工作区设置](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        以下是查看和更新工作区设置的方法：
                        1. 点击“工作区”。
                        2. 选择你的工作区。
                        3. 查看并更新你的设置。
                        [前往你的工作区。](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: '创建您的第一份报告',
                description: dedent(`
                    以下是创建报告的方法：

                    1. 点击 ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} 按钮。
                    2. 选择 *创建报告*。
                    3. 点击 *添加费用*。
                    4. 添加您的第一笔费用。

                    完成了！
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `进行[试驾](${testDriveURL})` : '进行试驾'),
            embeddedDemoIframeTitle: '试驾',
            employeeFakeReceipt: {
                description: '我的试驾收据！',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: '报销就像发送消息一样简单。让我们来看看基本知识。',
            onboardingPersonalSpendMessage: '以下是如何在几次点击中跟踪您的支出。',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # 你的免费试用已开始！让我们帮你完成设置。
                        👋 你好，我是你的 Expensify 设置专员。我已经创建了一个工作区，帮助你管理团队的收据和费用。为了充分利用你的 30 天免费试用，只需按照下方剩余的设置步骤进行操作即可！
                    `)
                    : dedent(`
                        # 您的免费试用已开始！让我们为您完成设置。
                        👋 您好，我是您的 Expensify 设置专员。现在您已创建了一个工作区，请按照以下步骤操作，充分利用您的 30 天免费试用！
                    `),
            onboardingTrackWorkspaceMessage:
                '# 让我们开始为你进行设置\n👋 你好，我是你的 Expensify 设置专员。我已经创建了一个工作区，帮助你管理收据和费用。为充分利用你的 30 天免费试用，只需按照下面剩余的设置步骤操作！',
            onboardingChatSplitMessage: '与朋友分摊账单就像发送消息一样简单。以下是方法。',
            onboardingAdminMessage: '了解如何作为管理员管理团队的工作区并提交自己的支出。',
            onboardingLookingAroundMessage: 'Expensify 以其支出、差旅和公司卡管理而闻名，但我们所做的远不止于此。让我知道您对什么感兴趣，我会帮助您开始。',
            onboardingTestDriveReceiverMessage: '*您已获得 3 个月免费使用权！在下面开始。*',
        },
        workspace: {
            title: '使用工作区保持井井有条',
            subtitle: '解锁强大的工具来简化您的费用管理，一切尽在一个地方。通过工作区，您可以：',
            explanationModal: {
                descriptionOne: '跟踪和整理收据',
                descriptionTwo: '分类和标记费用',
                descriptionThree: '创建和分享报告',
            },
            price: '免费试用30天，然后只需<strong>$5/用户/月</strong>升级。',
            createWorkspace: '创建工作区',
        },
        confirmWorkspace: {
            title: '确认工作区',
            subtitle: '创建一个工作区来跟踪收据、报销费用、管理旅行、创建报告等——所有这些都能以聊天的速度完成。',
        },
        inviteMembers: {
            title: '邀请成员',
            subtitle: '与会计师管理和分享您的费用，或与朋友组建旅行团体。',
        },
    },
    featureTraining: {
        doNotShowAgain: '不再显示此内容',
    },
    personalDetails: {
        error: {
            containsReservedWord: '名称不能包含“Expensify”或“Concierge”字样。',
            hasInvalidCharacter: '名称不能包含逗号或分号',
            requiredFirstName: '名字不能为空',
        },
    },
    privatePersonalDetails: {
        enterLegalName: '您的法定姓名是什么？',
        enterDateOfBirth: '你的出生日期是什么时候？',
        enterAddress: '你的地址是什么？',
        enterPhoneNumber: '你的电话号码是多少？',
        personalDetails: '个人信息',
        privateDataMessage: '这些详细信息用于旅行和支付。它们永远不会显示在您的公开资料上。',
        legalName: '法定名称',
        legalFirstName: '法定名字',
        legalLastName: '法定姓氏',
        address: '地址',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `日期应早于${dateString}`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `日期应在${dateString}之后`,
            hasInvalidCharacter: '名称只能包含拉丁字符',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `邮政编码格式不正确${zipFormat ? `可接受的格式：${zipFormat}` : ''}`,
            invalidPhoneNumber: `请确保电话号码有效（例如 ${CONST.EXAMPLE_PHONE_NUMBER}）`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: '链接已重新发送',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) => `我已发送一个魔法登录链接到${login}。请检查您的${loginType}以登录。`,
        resendLink: '重新发送链接',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) => `要验证${secondaryLogin}，请从${primaryLogin}的账户设置中重新发送魔法代码。`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `如果您不再能访问${primaryLogin}，请取消链接您的账户。`,
        unlink: '取消链接',
        linkSent: '链接已发送！',
        successfullyUnlinkedLogin: '辅助登录已成功取消关联！',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) => `由于发送问题，我们的电子邮件提供商已暂时暂停向${login}发送电子邮件。要解除对您登录的阻止，请按照以下步骤操作：`,
        confirmThat: ({login}: ConfirmThatParams) =>
            `<strong>确认${login}的拼写正确，并且是一个真实可投递的电子邮件地址。</strong>像“expenses@domain.com”这样的电子邮件别名必须能够访问其自己的电子邮件收件箱，才能成为有效的Expensify登录。`,
        ensureYourEmailClient: `<strong>确保您的电子邮件客户端允许接收来自expensify.com的电子邮件。</strong>您可以在<a href="${CONST.SET_NOTIFICATION_LINK}">此处</a>找到如何完成此步骤的说明，但您可能需要 IT 部门帮助配置电子邮件设置。`,
        onceTheAbove: `完成上述步骤后，请联系 <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> 解除对您登录的限制。`,
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) => `我们无法向${login}发送短信，因此已暂时暂停。请尝试验证您的号码：`,
        validationSuccess: '您的号码已验证！点击下方发送新的魔法登录代码。',
        validationFailed: ({
            timeData,
        }: {
            timeData?: {
                days?: number;
                hours?: number;
                minutes?: number;
            } | null;
        }) => {
            if (!timeData) {
                return '请稍等片刻再试。';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? '天' : '天'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? '小时' : '小时'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? '分钟' : '分钟'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `请稍等！您需要等待${timeText}后才能再次尝试验证您的号码。`;
        },
    },
    welcomeSignUpForm: {
        join: '加入',
    },
    detailsPage: {
        localTime: '当地时间',
    },
    newChatPage: {
        startGroup: '开始群组',
        addToGroup: '添加到群组',
    },
    yearPickerPage: {
        year: '年',
        selectYear: '请选择年份',
    },
    focusModeUpdateModal: {
        title: '欢迎进入#专注模式！',
        prompt: ({priorityModePageUrl}: FocusModeUpdateParams) =>
            `通过仅查看未读聊天或需要您注意的聊天来保持对事物的掌控。别担心，您可以随时在<a href="${priorityModePageUrl}">设置</a>中更改。`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: '您要查找的聊天无法找到。',
        getMeOutOfHere: '带我离开这里',
        iouReportNotFound: '您正在寻找的付款详情无法找到。',
        notHere: '嗯……它不在这里。',
        pageNotFound: '抱歉，无法找到此页面。',
        noAccess: '此聊天或费用可能已被删除，或者您无权访问。\n\n如有任何疑问，请联系 concierge@expensify.com',
        goBackHome: '返回主页',
        commentYouLookingForCannotBeFound: '找不到您要查找的评论。返回聊天',
        contactConcierge: '如有任何疑问，请联系 concierge@expensify.com',
        goToChatInstead: '请前往聊天界面。',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `抱歉... ${isBreakLine ? '\n' : ''}出现了问题`,
        subtitle: '您的请求无法完成。请稍后再试。',
        wrongTypeSubtitle: '该搜索无效。请尝试调整您的搜索条件。',
    },
    setPasswordPage: {
        enterPassword: '输入密码',
        setPassword: '设置密码',
        newPasswordPrompt: '您的密码必须至少包含8个字符，1个大写字母，1个小写字母和1个数字。',
        passwordFormTitle: '欢迎回到 New Expensify！请设置您的密码。',
        passwordNotSet: '我们无法设置您的新密码。我们已发送新的密码链接以便您重试。',
        setPasswordLinkInvalid: '此设置密码的链接无效或已过期。新的链接已发送到您的电子邮箱中！',
        validateAccount: '验证账户',
    },
    statusPage: {
        status: '状态',
        statusExplanation: '添加一个表情符号，让你的同事和朋友轻松了解发生了什么。你也可以选择添加一条消息！',
        today: '今天',
        clearStatus: '清除状态',
        save: '保存',
        message: '消息',
        timePeriods: {
            never: '从不',
            thirtyMinutes: '30分钟',
            oneHour: '1小时',
            afterToday: '今天',
            afterWeek: '一周',
            custom: '自定义',
        },
        untilTomorrow: '直到明天',
        untilTime: ({time}: UntilTimeParams) => `直到${time}`,
        date: '日期',
        time: '时间',
        clearAfter: '清除后',
        whenClearStatus: '我们应该何时清除您的状态？',
        vacationDelegate: '休假代理人',
        setVacationDelegate: '设置一位休假代理人，在您外出时代您批准报告。',
        vacationDelegateError: '更新休假代理人时出错。',
        asVacationDelegate: ({nameOrEmail: managerName}: VacationDelegateParams) => `作为 ${managerName} 的休假代理人`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `发送给 ${submittedToName}，作为 ${vacationDelegateName} 的休假代理人`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `您正在指定 ${nameOrEmail} 作为您的休假代理人。他/她还未加入您的所有工作空间。如果您选择继续，将向所有工作空间管理员发送邮件，通知他们添加该人。`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `步骤 ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: '银行信息',
        confirmBankInfo: '确认银行信息',
        manuallyAdd: '手动添加您的银行账户',
        letsDoubleCheck: '让我们仔细检查一下，确保一切都正确。',
        accountEnding: '账户末尾为',
        thisBankAccount: '此银行账户将用于您工作区的业务付款。',
        accountNumber: '账号号码',
        routingNumber: '路由号码',
        chooseAnAccountBelow: '选择下面的账户',
        addBankAccount: '添加银行账户',
        chooseAnAccount: '选择一个账户',
        connectOnlineWithPlaid: '登录您的银行账户',
        connectManually: '手动连接',
        desktopConnection: '注意：要连接Chase、Wells Fargo、Capital One或Bank of America，请点击此处在浏览器中完成此过程。',
        yourDataIsSecure: '您的数据是安全的',
        toGetStarted: '添加一个银行账户以报销费用、发行Expensify卡、收取发票付款并从一个地方支付账单。',
        plaidBodyCopy: '为您的员工提供一种更简单的方式来支付公司费用并获得报销。',
        checkHelpLine: '您的银行路由号码和账户号码可以在该账户的支票上找到。',
        hasPhoneLoginError: ({contactMethodRoute}: ContactMethodParams) =>
            `要连接银行账户，请 <a href="${contactMethodRoute}">添加一个电子邮件作为您的主要登录方式</a> 并重试。您可以添加电话号码作为辅助登录。`,
        hasBeenThrottledError: '添加您的银行账户时发生错误。请稍等几分钟后重试。',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `哎呀！您的工作区货币似乎设置为不同于 USD 的货币。要继续，请前往 <a href="${workspaceRoute}">您的工作区设置</a> 将其设置为美元，然后重试。`,
        bbaAdded: '企业银行账户已添加！',
        bbaAddedDescription: '已准备好用于付款。',
        error: {
            youNeedToSelectAnOption: '请选择一个选项继续',
            noBankAccountAvailable: '抱歉，没有可用的银行账户。',
            noBankAccountSelected: '请选择一个账户',
            taxID: '请输入有效的税号',
            website: '请输入一个有效的网站',
            zipCode: `请输入有效的邮政编码，格式为：${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: '请输入有效的电话号码',
            email: '请输入有效的电子邮件地址',
            companyName: '请输入有效的企业名称',
            addressCity: '请输入一个有效的城市名称',
            addressStreet: '请输入有效的街道地址',
            addressState: '请选择一个有效的州',
            incorporationDateFuture: '成立日期不能在未来',
            incorporationState: '请选择一个有效的州',
            industryCode: '请输入一个有效的六位数行业分类代码',
            restrictedBusiness: '请确认该企业不在受限企业名单中。',
            routingNumber: '请输入有效的路由号码',
            accountNumber: '请输入有效的账号',
            routingAndAccountNumberCannotBeSame: '路由和账户号码不能匹配',
            companyType: '请选择一个有效的公司类型',
            tooManyAttempts: '由于登录尝试次数过多，此选项已被禁用24小时。请稍后再试，或手动输入详细信息。',
            address: '请输入有效地址',
            dob: '请选择一个有效的出生日期',
            age: '必须年满18岁',
            ssnLast4: '请输入有效的SSN后四位数字',
            firstName: '请输入有效的名字',
            lastName: '请输入有效的姓氏',
            noDefaultDepositAccountOrDebitCardAvailable: '请添加一个默认的存款账户或借记卡',
            validationAmounts: '您输入的验证金额不正确。请仔细检查您的银行对账单，然后重试。',
            fullName: '请输入有效的全名',
            ownershipPercentage: '请输入一个有效的百分比数字',
            deletePaymentBankAccount: '由于该银行账户用于Expensify卡支付，因此无法删除。如果您仍希望删除此账户，请联系Concierge。',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: '您的银行账户在哪里？',
        accountDetailsStepHeader: '你的账户详情是什么？',
        accountTypeStepHeader: '这是什么类型的账户？',
        bankInformationStepHeader: '你的银行详细信息是什么？',
        accountHolderInformationStepHeader: '账户持有人详细信息是什么？',
        howDoWeProtectYourData: '我们如何保护您的数据？',
        currencyHeader: '您的银行账户货币是什么？',
        confirmationStepHeader: '检查您的信息。',
        confirmationStepSubHeader: '请仔细核对以下详细信息，并勾选条款框以确认。',
    },
    addPersonalBankAccountPage: {
        enterPassword: '输入Expensify密码',
        alreadyAdded: '此账户已被添加。',
        chooseAccountLabel: '账户',
        successTitle: '个人银行账户已添加！',
        successMessage: '恭喜，您的银行账户已设置完毕，可以接收报销款项。',
    },
    attachmentView: {
        unknownFilename: '未知文件名',
        passwordRequired: '请输入密码',
        passwordIncorrect: '密码错误。请重试。',
        failedToLoadPDF: '无法加载PDF文件',
        pdfPasswordForm: {
            title: '密码保护的PDF',
            infoText: '此 PDF 受密码保护。',
            beforeLinkText: '请',
            linkText: '输入密码',
            afterLinkText: '查看。',
            formLabel: '查看PDF',
        },
        attachmentNotFound: '未找到附件',
        retry: '重试',
    },
    messages: {
        errorMessageInvalidPhone: `请输入一个有效的电话号码，不要使用括号或破折号。如果您在美国以外，请包括您的国家代码（例如 ${CONST.EXAMPLE_PHONE_NUMBER}）。`,
        errorMessageInvalidEmail: '无效的电子邮件',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} 已经是 ${name} 的成员`,
    },
    onfidoStep: {
        acceptTerms: '通过继续请求激活您的Expensify钱包，您确认您已阅读、理解并接受',
        facialScan: 'Onfido的人脸扫描政策和授权书',
        tryAgain: '再试一次',
        verifyIdentity: '验证身份',
        letsVerifyIdentity: '让我们验证您的身份',
        butFirst: `但首先，是一些无聊的内容。在下一步阅读法律条款，准备好后点击“接受”。`,
        genericError: '处理此步骤时发生错误。请重试。',
        cameraPermissionsNotGranted: '启用相机访问权限',
        cameraRequestMessage: '我们需要访问您的相机以完成银行账户验证。请通过设置 > New Expensify 启用。',
        microphonePermissionsNotGranted: '启用麦克风访问权限',
        microphoneRequestMessage: '我们需要访问您的麦克风以完成银行账户验证。请通过设置 > New Expensify 启用。',
        originalDocumentNeeded: '请上传您的身份证原件照片，而不是截图或扫描图像。',
        documentNeedsBetterQuality: '您的身份证似乎已损坏或缺少安全特征。请上传一张未损坏且完全可见的身份证原始图像。',
        imageNeedsBetterQuality: '您的身份证图像质量有问题。请上传一张新的图像，确保您的整个身份证清晰可见。',
        selfieIssue: '您的自拍/视频有问题。请上传实时自拍/视频。',
        selfieNotMatching: '您的自拍/视频与您的身份证不匹配。请上传一张能清晰看到您面部的新自拍/视频。',
        selfieNotLive: '您的自拍/视频似乎不是实时照片/视频。请上传实时自拍/视频。',
    },
    additionalDetailsStep: {
        headerTitle: '附加详情',
        helpText: '在您可以从钱包发送和接收资金之前，我们需要确认以下信息。',
        helpTextIdologyQuestions: '我们需要再问您几个问题，以完成您的身份验证。',
        helpLink: '了解更多关于我们为何需要这个的信息。',
        legalFirstNameLabel: '法定名字',
        legalMiddleNameLabel: '法定中间名',
        legalLastNameLabel: '法定姓氏',
        selectAnswer: '请选择一个响应以继续',
        ssnFull9Error: '请输入有效的九位数社会安全号码',
        needSSNFull9: '我们无法验证您的SSN。请输入您SSN的完整九位数字。',
        weCouldNotVerify: '我们无法验证',
        pleaseFixIt: '请在继续之前修正此信息',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `我们无法验证您的身份。请稍后再试或联系 <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> 如果您有任何问题。`,
    },
    termsStep: {
        headerTitle: '条款和费用',
        headerTitleRefactor: '费用和条款',
        haveReadAndAgreePlain: '我已阅读并同意接收电子披露信息。',
        haveReadAndAgree: `我已阅读并同意接收<a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">电子披露信息</a>。`,
        agreeToThePlain: '我同意隐私和钱包协议。',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) => `我同意<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">隐私</a>和<a href="${walletAgreementUrl}">钱包协议</a>。`,
        enablePayments: '启用支付',
        monthlyFee: '月费',
        inactivity: '不活跃',
        noOverdraftOrCredit: '无透支/信用功能。',
        electronicFundsWithdrawal: '电子资金提取',
        standard: '标准',
        reviewTheFees: '查看一些费用。',
        checkTheBoxes: '请勾选下面的框。',
        agreeToTerms: '同意条款后，您就可以开始了！',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Expensify Wallet由${walletProgram}发行。`,
            perPurchase: '每次购买',
            atmWithdrawal: 'ATM取款',
            cashReload: '现金充值',
            inNetwork: '网络内',
            outOfNetwork: '网络外',
            atmBalanceInquiry: 'ATM余额查询（网络内或网络外）',
            customerService: '客户服务（自动或人工客服）',
            inactivityAfterTwelveMonths: '不活跃（12个月没有交易后）',
            weChargeOneFee: '我们收取另外一种费用。它是：',
            fdicInsurance: '您的资金符合FDIC保险资格。',
            generalInfo: `有关预付账户的一般信息，请访问 <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>。`,
            conditionsDetails: `有关所有费用和服务的详细信息和条件，请访问 <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> 或致电 +1 833-400-0904。`,
            electronicFundsWithdrawalInstant: '电子资金提取（即时）',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: '所有Expensify Wallet费用的列表',
            typeOfFeeHeader: '所有费用',
            feeAmountHeader: '金额',
            moreDetailsHeader: '详情',
            openingAccountTitle: '开设账户',
            openingAccountDetails: '开设账户没有费用。',
            monthlyFeeDetails: '没有月费。',
            customerServiceTitle: '客户服务',
            customerServiceDetails: '没有客户服务费用。',
            inactivityDetails: '没有不活动费用。',
            sendingFundsTitle: '将资金发送到另一个账户持有人',
            sendingFundsDetails: '使用您的余额、银行账户或借记卡向其他账户持有人发送资金是免费的。',
            electronicFundsStandardDetails: '使用标准选项从您的 Expensify 钱包向您的银行账户转账不收取任何费用。转账通常在 1-3 个工作日内完成。',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                `使用即时转账选项将资金从 Expensify 钱包转入关联的借记卡需要支付一定费用。转账通常在几分钟内完成。费用为转账金额的 ${percentage}%（最低费用为 ${amount}）。`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `您的资金可享受 FDIC 保险。您的资金将存放在或转入由 FDIC 提供保险的机构 ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}。` +
                `一旦 ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} 倒闭，您的资金将由 FDIC 提供最高 ${amount} 的保险，前提是满足特定的存款保险要求并注册了您的银行卡。` +
                `详见 ${CONST.TERMS.FDIC_PREPAID}。`,
            contactExpensifyPayments: `请致电 +1 833-400-0904、发送电子邮件至 ${CONST.EMAIL.CONCIERGE} 或登录 ${CONST.NEW_EXPENSIFY_URL} 与 ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} 联系。`,
            generalInformation: `有关预付费账户的一般信息，请访问 ${CONST.TERMS.CFPB_PREPAID}。如果您对预付费账户有任何投诉，请致电 1-855-411-2372 联系消费者金融保护局，或访问 ${CONST.TERMS.CFPB_COMPLAINT}。`,
            printerFriendlyView: '查看打印友好版本',
            automated: '自动化的',
            liveAgent: '实时客服代理',
            instant: '即时',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `最低 ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '启用支付',
        activatedTitle: '钱包已激活！',
        activatedMessage: '恭喜，您的钱包已设置完毕，可以进行支付。',
        checkBackLaterTitle: '稍等一下...',
        checkBackLaterMessage: '我们仍在审核您的信息。请稍后再查看。',
        continueToPayment: '继续付款',
        continueToTransfer: '继续转账',
    },
    companyStep: {
        headerTitle: '公司信息',
        subtitle: '快完成了！出于安全考虑，我们需要确认一些信息：',
        legalBusinessName: '法定公司名称',
        companyWebsite: '公司网站',
        taxIDNumber: '税号',
        taxIDNumberPlaceholder: '9位数字',
        companyType: '公司类型',
        incorporationDate: '成立日期',
        incorporationState: '注册州',
        industryClassificationCode: '行业分类代码',
        confirmCompanyIsNot: '我确认这家公司不在',
        listOfRestrictedBusinesses: '受限业务列表',
        incorporationDatePlaceholder: '开始日期 (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: '合作伙伴关系',
            COOPERATIVE: '合作社',
            SOLE_PROPRIETORSHIP: '独资企业',
            OTHER: '其他',
        },
        industryClassification: '该企业属于哪个行业？',
        industryClassificationCodePlaceholder: '搜索行业分类代码',
    },
    requestorStep: {
        headerTitle: '个人信息',
        learnMore: '了解更多',
        isMyDataSafe: '我的数据安全吗？',
    },
    personalInfoStep: {
        personalInfo: '个人信息',
        enterYourLegalFirstAndLast: '您的法定姓名是什么？',
        legalFirstName: '法定名字',
        legalLastName: '法定姓氏',
        legalName: '法定名称',
        enterYourDateOfBirth: '你的出生日期是什么时候？',
        enterTheLast4: '您的社会安全号码的最后四位数字是什么？',
        dontWorry: '别担心，我们不会进行任何个人信用检查！',
        last4SSN: 'SSN的后四位',
        enterYourAddress: '你的地址是什么？',
        address: '地址',
        letsDoubleCheck: '让我们仔细检查一下，确保一切都正确。',
        byAddingThisBankAccount: '通过添加此银行账户，您确认您已阅读、理解并接受',
        whatsYourLegalName: '您的法定姓名是什么？',
        whatsYourDOB: '你的出生日期是什么？',
        whatsYourAddress: '你的地址是什么？',
        whatsYourSSN: '您的社会安全号码的最后四位数字是什么？',
        noPersonalChecks: '别担心，这里不会进行个人信用检查！',
        whatsYourPhoneNumber: '你的电话号码是多少？',
        weNeedThisToVerify: '我们需要这个来验证您的钱包。',
    },
    businessInfoStep: {
        businessInfo: '公司信息',
        enterTheNameOfYourBusiness: '你们公司的名字是什么？',
        businessName: '法定公司名称',
        enterYourCompanyTaxIdNumber: '贵公司的税号是多少？',
        taxIDNumber: '税号',
        taxIDNumberPlaceholder: '9位数字',
        enterYourCompanyWebsite: '贵公司的网站是什么？',
        companyWebsite: '公司网站',
        enterYourCompanyPhoneNumber: '你们公司的电话号码是多少？',
        enterYourCompanyAddress: '你们公司的地址是什么？',
        selectYourCompanyType: '这是什么类型的公司？',
        companyType: '公司类型',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: '合作伙伴关系',
            COOPERATIVE: '合作社',
            SOLE_PROPRIETORSHIP: '独资企业',
            OTHER: '其他',
        },
        selectYourCompanyIncorporationDate: '贵公司的注册日期是什么时候？',
        incorporationDate: '成立日期',
        incorporationDatePlaceholder: '开始日期 (yyyy-mm-dd)',
        incorporationState: '注册州',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '您的公司在哪个州注册成立的？',
        letsDoubleCheck: '让我们仔细检查一下，确保一切都正确。',
        companyAddress: '公司地址',
        listOfRestrictedBusinesses: '受限业务列表',
        confirmCompanyIsNot: '我确认这家公司不在',
        businessInfoTitle: '商业信息',
        legalBusinessName: '法定公司名称',
        whatsTheBusinessName: '企业名称是什么？',
        whatsTheBusinessAddress: '公司的地址是什么？',
        whatsTheBusinessContactInformation: '商业联系信息是什么？',
        whatsTheBusinessRegistrationNumber: ({country}: BusinessRegistrationNumberParams) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return '公司注册号（CRN）是多少？';
                default:
                    return '营业登记号码是多少？';
            }
        },
        whatsTheBusinessTaxIDEIN: ({country}: BusinessTaxIDParams) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '什么是雇主识别号（EIN）？';
                case CONST.COUNTRY.CA:
                    return '什么是商业号码（BN）？';
                case CONST.COUNTRY.GB:
                    return '什么是增值税注册号（VRN）？';
                case CONST.COUNTRY.AU:
                    return '什么是澳大利亚商业号码（ABN）？';
                default:
                    return '什么是欧盟增值税号？';
            }
        },
        whatsThisNumber: '这个号码是什么？',
        whereWasTheBusinessIncorporated: '公司在哪里注册成立的？',
        whatTypeOfBusinessIsIt: '这是什么类型的业务？',
        whatsTheBusinessAnnualPayment: '企业的年度支付总额是多少？',
        whatsYourExpectedAverageReimbursements: '您的预期平均报销金额是多少？',
        registrationNumber: '注册号码',
        taxIDEIN: ({country}: BusinessTaxIDParams) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'EIN';
                case CONST.COUNTRY.CA:
                    return 'BN';
                case CONST.COUNTRY.GB:
                    return 'VRN';
                case CONST.COUNTRY.AU:
                    return 'ABN';
                default:
                    return '欧盟VAT';
            }
        },
        businessAddress: '公司地址',
        businessType: '业务类型',
        incorporation: '公司注册',
        incorporationCountry: '注册国家/地区',
        incorporationTypeName: '公司类型',
        businessCategory: '业务类别',
        annualPaymentVolume: '年度支付总额',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `年度支付量（${currencyCode}）`,
        averageReimbursementAmount: '平均报销金额',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `平均报销金额（${currencyCode}）`,
        selectIncorporationType: '选择公司类型',
        selectBusinessCategory: '选择业务类别',
        selectAnnualPaymentVolume: '选择年度支付金额',
        selectIncorporationCountry: '选择注册国家/地区',
        selectIncorporationState: '选择注册州',
        selectAverageReimbursement: '选择平均报销金额',
        selectBusinessType: '选择业务类型',
        findIncorporationType: '查找公司注册类型',
        findBusinessCategory: '查找业务类别',
        findAnnualPaymentVolume: '查找年度支付量',
        findIncorporationState: '查找注册州',
        findAverageReimbursement: '查找平均报销金额',
        findBusinessType: '查找业务类型',
        error: {
            registrationNumber: '请提供有效的注册号码',
            taxIDEIN: ({country}: BusinessTaxIDParams) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '请输入有效的雇主识别号（EIN）';
                    case CONST.COUNTRY.CA:
                        return '请输入有效的商业号码（BN）';
                    case CONST.COUNTRY.GB:
                        return '请输入有效的增值税注册号（VRN）';
                    case CONST.COUNTRY.AU:
                        return '请输入有效的澳大利亚商业号码（ABN）';
                    default:
                        return '请输入有效的欧盟增值税号';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: ({companyName}: CompanyNameParams) => `您是否拥有${companyName}的25%或更多股份？`,
        doAnyIndividualOwn25percent: ({companyName}: CompanyNameParams) => `是否有任何个人拥有${companyName}的25%或以上股份？`,
        areThereMoreIndividualsWhoOwn25percent: ({companyName}: CompanyNameParams) => `还有其他个人持有${companyName} 25%或以上的股份吗？`,
        regulationRequiresUsToVerifyTheIdentity: '法规要求我们核实任何拥有超过25%业务的个人的身份。',
        companyOwner: '企业主',
        enterLegalFirstAndLastName: '所有者的法定姓名是什么？',
        legalFirstName: '法定名字',
        legalLastName: '法定姓氏',
        enterTheDateOfBirthOfTheOwner: '所有者的出生日期是什么时候？',
        enterTheLast4: '业主社会安全号码的最后四位数字是什么？',
        last4SSN: 'SSN的后四位',
        dontWorry: '别担心，我们不会进行任何个人信用检查！',
        enterTheOwnersAddress: '业主的地址是什么？',
        letsDoubleCheck: '让我们仔细检查一下，确保一切正常。',
        legalName: '法定名称',
        address: '地址',
        byAddingThisBankAccount: '通过添加此银行账户，您确认您已阅读、理解并接受',
        owners: '所有者',
    },
    ownershipInfoStep: {
        ownerInfo: '所有者信息',
        businessOwner: '企业主',
        signerInfo: '签署人信息',
        doYouOwn: ({companyName}: CompanyNameParams) => `您是否拥有${companyName}的25%或更多股份？`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `是否有任何个人拥有${companyName}的25%或以上股份？`,
        regulationsRequire: '法规要求我们核实任何拥有超过25%业务的个人的身份。',
        legalFirstName: '法定名字',
        legalLastName: '法定姓氏',
        whatsTheOwnersName: '所有者的法定姓名是什么？',
        whatsYourName: '您的法定姓名是什么？',
        whatPercentage: '企业中有多少百分比属于所有者？',
        whatsYoursPercentage: '您拥有多少百分比的业务？',
        ownership: '所有权',
        whatsTheOwnersDOB: '所有者的出生日期是什么时候？',
        whatsYourDOB: '你的出生日期是什么时候？',
        whatsTheOwnersAddress: '业主的地址是什么？',
        whatsYourAddress: '你的地址是什么？',
        whatAreTheLast: '业主社会安全号码的最后四位数字是什么？',
        whatsYourLast: '您的社会安全号码的最后四位数字是什么？',
        whatsYourNationality: '您的公民身份所属国家是？',
        whatsTheOwnersNationality: '业主的公民身份所属国家是？',
        countryOfCitizenship: '公民身份国家',
        dontWorry: '别担心，我们不会进行任何个人信用检查！',
        last4: 'SSN的后四位',
        whyDoWeAsk: '我们为什么要求这个？',
        letsDoubleCheck: '让我们仔细检查一下，确保一切正常。',
        legalName: '法定名称',
        ownershipPercentage: '所有权百分比',
        areThereOther: ({companyName}: CompanyNameParams) => `是否有其他人拥有${companyName}的25%或更多股份？`,
        owners: '所有者',
        addCertified: '添加一份认证的组织结构图，显示受益所有者。',
        regulationRequiresChart: '根据规定，我们需要收集一份经过认证的所有权图副本，该图显示了拥有公司25%或以上股份的每个个人或实体。',
        uploadEntity: '上传实体所有权图表',
        noteEntity: '注意：实体所有权图必须由您的会计师、法律顾问签署或经过公证。',
        certified: '认证实体所有权图表',
        selectCountry: '选择国家/地区',
        findCountry: '查找国家',
        address: '地址',
        chooseFile: '选择文件',
        uploadDocuments: '上传附加文档',
        pleaseUpload: '请在下方上传其他文件，以帮助我们验证您是否为该企业实体的直接或间接拥有25%或以上股份的所有者。',
        acceptedFiles: '接受的文件格式：PDF、PNG、JPEG。每个部分的文件总大小不能超过5 MB。',
        proofOfBeneficialOwner: '实益所有人证明',
        proofOfBeneficialOwnerDescription: '请提供由注册会计师、公证员或律师签署的证明和组织结构图，以验证对业务25%或以上的所有权。必须注明在过去三个月内的日期，并包含签署者的执照号码。',
        copyOfID: '受益所有人的身份证复印件',
        copyOfIDDescription: '例如：护照、驾驶执照等。',
        proofOfAddress: '受益所有人的地址证明',
        proofOfAddressDescription: '例如：水电费账单、租赁协议等。',
        codiceFiscale: 'Codice fiscale/Tax ID',
        codiceFiscaleDescription: '请上传现场访问的视频或与签署官员的录音通话。官员必须提供：全名、出生日期、公司名称、注册号码、税号、注册地址、业务性质和账户用途。',
    },
    completeVerificationStep: {
        completeVerification: '完成验证',
        confirmAgreements: '请确认以下协议。',
        certifyTrueAndAccurate: '我保证所提供的信息真实准确。',
        certifyTrueAndAccurateError: '请确认信息真实准确。',
        isAuthorizedToUseBankAccount: '我被授权使用此企业银行账户进行业务支出',
        isAuthorizedToUseBankAccountError: '您必须是具有授权操作企业银行账户的控制官员。',
        termsAndConditions: '条款和条件',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '验证您的银行账户',
        validateButtonText: '验证',
        validationInputLabel: '交易',
        maxAttemptsReached: '由于多次尝试错误，此银行账户的验证已被禁用。',
        description: `在1-2个工作日内，我们会从类似“Expensify, Inc. Validation”的名称向您的银行账户发送三（3）笔小额交易。`,
        descriptionCTA: '请在下面的字段中输入每笔交易金额。示例：1.51。',
        letsChatText: '快完成了！我们需要您的帮助，通过聊天验证最后一些信息。准备好了吗？',
        enable2FATitle: '防止欺诈，启用双因素认证 (2FA)',
        enable2FAText: '我们非常重视您的安全。请立即设置双重身份验证（2FA），为您的账户增加一层额外的保护。',
        secureYourAccount: '保护您的账户',
    },
    countryStep: {
        confirmBusinessBank: '确认企业银行账户的货币和国家/地区',
        confirmCurrency: '确认货币和国家/地区',
        yourBusiness: '您的企业银行账户货币必须与您的工作区货币匹配。',
        youCanChange: '您可以在您的工作区中更改货币',
        findCountry: '查找国家',
        selectCountry: '选择国家/地区',
    },
    bankInfoStep: {
        whatAreYour: '您的企业银行账户详细信息是什么？',
        letsDoubleCheck: '让我们仔细检查一下，确保一切正常。',
        thisBankAccount: '此银行账户将用于您工作区的业务付款。',
        accountNumber: '账号号码',
        accountHolderNameDescription: '授权签署人全名',
    },
    signerInfoStep: {
        signerInfo: '签署人信息',
        areYouDirector: ({companyName}: CompanyNameParams) => `您是${companyName}的董事吗？`,
        regulationRequiresUs: '法规要求我们核实签署人是否有权代表企业采取此行动。',
        whatsYourName: '您的法定姓名是什么',
        fullName: '法定全名',
        whatsYourJobTitle: '你的职位是什么？',
        jobTitle: '职位名称',
        whatsYourDOB: '你的出生日期是什么时候？',
        uploadID: '上传身份证明和地址证明',
        personalAddress: '个人地址证明（例如，水电费账单）',
        letsDoubleCheck: '让我们仔细检查一下，确保一切正常。',
        legalName: '法定名称',
        proofOf: '个人地址证明',
        enterOneEmail: ({companyName}: CompanyNameParams) => `请输入${companyName}董事的电子邮件地址`,
        regulationRequiresOneMoreDirector: '法规要求至少再有一位董事作为签署人。',
        hangTight: '请稍等...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `请输入${companyName}的两位董事的电子邮件地址`,
        sendReminder: '发送提醒',
        chooseFile: '选择文件',
        weAreWaiting: '我们正在等待其他人验证其作为公司董事的身份。',
        id: '身份证复印件',
        proofOfDirectors: '董事证明',
        proofOfDirectorsDescription: '示例：Oncorp公司简介或商业注册。',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: '签署人、授权用户和实益所有人的税号。',
        PDSandFSG: 'PDS + FSG 披露文件',
        PDSandFSGDescription: dedent(`
            我们与 Corpay 的合作通过 API 连接，利用其庞大的国际银行合作伙伴网络，为 Expensify 的全球报销功能提供支持。根据澳大利亚法规，我们向您提供 Corpay 的《金融服务指南（FSG）》和《产品披露声明（PDS）》。

            请仔细阅读 FSG 和 PDS 文件，因为其中包含 Corpay 所提供产品与服务的完整细节及重要信息。请保留这些文件以备日后查阅。
        `),
        pleaseUpload: '请在下方上传其他文件，以帮助我们验证您作为企业实体董事的身份。',
        enterSignerInfo: '输入签署人信息',
        thisStep: '此步骤已完成',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `正在将以 ${bankAccountLastFour} 结尾的 ${currency} 公司银行账户连接到 Expensify，以便用 ${currency} 向员工付款。下一步需要董事的签署人信息。`,
        error: {
            emailsMustBeDifferent: '电子邮件地址必须不同',
        },
    },
    agreementsStep: {
        agreements: '协议',
        pleaseConfirm: '请确认以下协议',
        regulationRequiresUs: '法规要求我们核实任何拥有超过25%业务的个人的身份。',
        iAmAuthorized: '我被授权使用公司银行账户进行业务支出。',
        iCertify: '我证明所提供的信息是真实准确的。',
        iAcceptTheTermsAndConditions: `我接受<a href="https://cross-border.corpay.com/tc/">条款和条件</a>。`,
        iAcceptTheTermsAndConditionsAccessibility: '我接受条款和条件。',
        accept: '接受并添加银行账户',
        iConsentToThePrivacyNotice: '我同意<a href="https://payments.corpay.com/compliance">隐私声明</a>。',
        iConsentToThePrivacyNoticeAccessibility: '我同意隐私声明。',
        error: {
            authorized: '您必须是具有授权操作企业银行账户的控制官员。',
            certify: '请确认信息真实准确。',
            consent: '请同意隐私声明',
        },
    },
    docusignStep: {
        subheader: 'Docusign 表格',
        pleaseComplete: '请通过以下 Docusign 链接填写 ACH 授权表格，并将签署后的副本上传到此处，以便我们可以直接从您的银行账户扣款。',
        pleaseCompleteTheBusinessAccount: '请填写企业账户申请表及直接借记协议。',
        pleaseCompleteTheDirect: '请通过以下 Docusign 链接填写直接借记协议，并将签署后的副本上传到此处，以便我们可以直接从您的银行账户扣款。',
        takeMeTo: '前往 Docusign',
        uploadAdditional: '上传其他文件',
        pleaseUpload: '请上传 DEFT 表格和 Docusign 签名页。',
        pleaseUploadTheDirect: '请上传直接借记协议和 Docusign 签名页。',
    },
    finishStep: {
        letsFinish: '让我们在聊天中完成！',
        thanksFor: '感谢您提供这些详细信息。专属客服人员将会审核您的信息。如果我们需要其他信息，会再联系您。同时，如果您有任何问题，请随时联系我们。',
        iHaveA: '我有一个问题',
        enable2FA: '启用双因素认证（2FA）以防止欺诈',
        weTake: '我们非常重视您的安全。请立即设置双重身份验证（2FA），为您的账户增加一层额外的保护。',
        secure: '保护您的账户',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '请稍等',
        explanationLine: '我们正在查看您的信息。您很快就能继续进行下一步。',
    },
    session: {
        offlineMessageRetry: '看起来您已离线。请检查您的连接并重试。',
    },
    travel: {
        header: '预订旅行',
        title: '聪明旅行',
        subtitle: '使用 Expensify Travel 获得最佳旅行优惠，并在一个地方管理您所有的商务开支。',
        features: {
            saveMoney: '在您的预订上省钱',
            alerts: '获取实时更新和提醒',
        },
        bookTravel: '预订旅行',
        bookDemo: '预订演示',
        bookADemo: '预约演示',
        toLearnMore: '了解更多。',
        termsAndConditions: {
            header: '在我们继续之前...',
            title: '条款和条件',
            label: '我同意条款和条件',
            subtitle: `请同意 Expensify Travel <a href="${CONST.TRAVEL_TERMS_URL}">条款和条件</a>。`,
            error: '您必须同意Expensify Travel的条款和条件才能继续',
            defaultWorkspaceError: '您需要设置一个默认工作区以启用Expensify Travel。请前往设置 > 工作区 > 点击工作区旁边的三个竖点 > 设为默认工作区，然后重试！',
        },
        flight: '航班',
        flightDetails: {
            passenger: '乘客',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>在此航班之前，您有<strong>${layover}小时的中转</strong></muted-text-label>`,
            takeOff: '起飞',
            landing: '着陆',
            seat: '座位',
            class: '舱位等级',
            recordLocator: '记录定位器',
            cabinClasses: {
                unknown: '未知',
                economy: '经济',
                premiumEconomy: '高级经济舱',
                business: '商务',
                first: '第一',
            },
        },
        hotel: '酒店',
        hotelDetails: {
            guest: '访客',
            checkIn: '签到',
            checkOut: '退房',
            roomType: '房间类型',
            cancellation: '取消政策',
            cancellationUntil: '在此之前可免费取消',
            confirmation: '确认号码',
            cancellationPolicies: {
                unknown: '未知',
                nonRefundable: '不可退款',
                freeCancellationUntil: '在此之前可免费取消',
                partiallyRefundable: '部分可退',
            },
        },
        car: '汽车',
        carDetails: {
            rentalCar: '汽车租赁',
            pickUp: '接送',
            dropOff: '下车点',
            driver: '司机',
            carType: '车型',
            cancellation: '取消政策',
            cancellationUntil: '在此之前可免费取消',
            freeCancellation: '免费取消',
            confirmation: '确认号码',
        },
        train: '铁路',
        trainDetails: {
            passenger: '乘客',
            departs: '出发',
            arrives: '到达',
            coachNumber: '教练编号',
            seat: '座位',
            fareDetails: '费用详情',
            confirmation: '确认号码',
        },
        viewTrip: '查看行程',
        modifyTrip: '修改行程',
        tripSupport: '行程支持',
        tripDetails: '行程详情',
        viewTripDetails: '查看行程详情',
        trip: '旅行',
        trips: '行程',
        tripSummary: '行程总结',
        departs: '出发',
        errorMessage: '出现问题。请稍后再试。',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) => `<rbr>请将<a href="${phoneErrorMethodsRoute}">工作邮箱添加为</a>预订旅行的主要登录邮箱。</rbr>`,
        domainSelector: {
            title: '域名',
            subtitle: '为 Expensify Travel 设置选择一个域名。',
            recommended: '推荐',
        },
        domainPermissionInfo: {
            title: '域名',
            restriction: ({domain}: DomainPermissionInfoRestrictionParams) => `您没有为域名 <strong>${domain}</strong> 启用 Expensify 旅行的权限。您需要让该域的其他人代替您启用旅行功能。`,
            accountantInvitation: `如果您是会计师，建议您加入<a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved!会计师计划</a>，以便为该领域启用差旅功能。`,
        },
        publicDomainError: {
            title: '开始使用 Expensify Travel',
            message: `您需要在Expensify Travel中使用您的工作邮箱（例如，name@company.com），而不是您的个人邮箱（例如，name@gmail.com）。`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel 已被禁用',
            message: `您的管理员已关闭Expensify Travel。请遵循您公司的预订政策进行差旅安排。`,
        },
        verifyCompany: {
            title: '立即开始旅行吧！',
            message: `请联系您的客户经理或发送电子邮件至 salesteam@expensify.com 以获取旅行演示并为您的公司启用该功能。`,
            confirmText: '明白了',
            conciergeMessage: ({domain}: {domain: string}) => `域名 ${domain} 的旅行启用失败。请检查并为此域名启用旅行功能。`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `您已预订航班 ${airlineCode} (${origin} → ${destination})，出发日期为 ${startDate}。确认码：${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) => `您${startDate}的航班${airlineCode}（${origin} → ${destination}）的机票已被作废。`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) => `您${startDate}从${origin}飞往${destination}的${airlineCode}航班机票已被退款或更换。`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) => `您的航班 ${airlineCode} (${origin} → ${destination}) 于 ${startDate} 已被航空公司取消。`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) => `航空公司已提议更改航班 ${airlineCode} 的时间表；我们正在等待确认。`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `航班变更已确认：航班 ${airlineCode} 现在的起飞时间为 ${startDate}。`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `您在${startDate}的航班${airlineCode}（${origin} → ${destination}）已更新。`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `您的舱位等级已在航班 ${airlineCode} 上更新为 ${cabinClass}。`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `您在航班 ${airlineCode} 上的座位已确认。`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `您在航班 ${airlineCode} 上的座位已被更改。`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `您在航班 ${airlineCode} 上的座位分配已被取消。`,
            paymentDeclined: '您的机票预订付款失败。请重试。',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `您已取消您的${type}预订${id}。`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `供应商取消了您的${type}预订${id}。`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `您的${type}预订已重新预订。新的确认号：${id}。`,
            bookingUpdated: ({type}: TravelTypeParams) => `您的${type}预订已更新。请查看行程中的新详情。`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) => `您从${origin}到${destination}的火车票已于${startDate}退票。退款将被处理。`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `您从 ${origin} 到 ${destination} 的火车票已于 ${startDate} 更换。`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `您从${origin}到${destination}的火车票已在${startDate}更新。`,
            defaultUpdate: ({type}: TravelTypeParams) => `您的${type}预订已更新。`,
        },
        flightTo: '飞往',
        trainTo: '火车前往',
        carRental: '汽车租赁',
        nightIn: '晚住宿',
        nightsIn: '晚住宿',
    },
    workspace: {
        common: {
            card: '卡片',
            expensifyCard: 'Expensify Card',
            companyCards: '公司卡片',
            workflows: '工作流程',
            workspace: '工作区',
            findWorkspace: '查找工作区',
            edit: '编辑工作区',
            enabled: '已启用',
            disabled: '禁用',
            everyone: '每个人',
            delete: '删除工作区',
            settings: '设置',
            reimburse: '报销',
            categories: '类别',
            tags: '标签',
            customField1: '自定义字段 1',
            customField2: '自定义字段2',
            customFieldHint: '添加适用于该成员所有支出的自定义编码。',
            reports: '报告',
            reportFields: '报告字段',
            reportTitle: '报告标题',
            reportField: '报告字段',
            taxes: '税款',
            bills: '账单',
            invoices: '发票',
            perDiem: 'Per diem',
            travel: '旅行',
            members: '成员',
            accounting: '会计',
            receiptPartners: '收据合作伙伴',
            rules: '规则',
            displayedAs: '显示为',
            plan: '计划',
            profile: '概述',
            bankAccount: '银行账户',
            testTransactions: '测试交易',
            issueAndManageCards: '发行和管理卡片',
            reconcileCards: '对账卡片',
            selectAll: '全选',
            selected: () => ({
                one: '1 已选择',
                other: (count: number) => `已选择${count}个`,
            }),
            settlementFrequency: '结算频率',
            setAsDefault: '设为默认工作区',
            defaultNote: `发送到${CONST.EMAIL.RECEIPTS}的收据将显示在此工作区中。`,
            deleteConfirmation: '您确定要删除此工作区吗？',
            deleteWithCardsConfirmation: '您确定要删除此工作区吗？这将删除所有卡片源和已分配的卡片。',
            unavailable: '工作区不可用',
            memberNotFound: '未找到成员。要邀请新成员加入工作区，请使用上面的邀请按钮。',
            notAuthorized: `您无权访问此页面。如果您正在尝试加入此工作区，请请求工作区所有者将您添加为成员。还有其他问题？请联系${CONST.EMAIL.CONCIERGE}。`,
            goToWorkspace: '前往工作区',
            duplicateWorkspace: '重复工作区',
            duplicateWorkspacePrefix: '复制',
            goToWorkspaces: '前往工作区',
            clearFilter: '清除筛选器',
            workspaceName: '工作区名称',
            workspaceOwner: '所有者',
            workspaceType: '工作区类型',
            workspaceAvatar: '工作区头像',
            mustBeOnlineToViewMembers: '您需要在线才能查看此工作区的成员。',
            moreFeatures: '更多功能',
            requested: '请求的',
            distanceRates: '距离费率',
            defaultDescription: '一个地方管理您所有的收据和费用。',
            descriptionHint: '与所有成员共享此工作区的信息。',
            welcomeNote: '请使用Expensify提交您的报销收据，谢谢！',
            subscription: '订阅',
            markAsEntered: '标记为手动输入',
            markAsExported: '标记为已出口',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `导出到${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: '让我们仔细检查一下，确保一切都正确。',
            lineItemLevel: '逐项级别',
            reportLevel: '报告级别',
            topLevel: '顶级',
            appliedOnExport: '未导入Expensify，已在导出时应用',
            shareNote: {
                header: '与其他成员共享您的工作区',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `分享此二维码或复制下面的链接，方便成员申请加入您的工作区。所有加入工作区的请求都将显示在 <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> room 中供您查看。`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `连接到${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: '创建新连接',
            reuseExistingConnection: '重用现有连接',
            existingConnections: '现有连接',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `由于您之前已连接到${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}，您可以选择重用现有连接或创建新连接。`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - 上次同步时间 ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `由于身份验证错误，无法连接到${connectionName}。`,
            learnMore: '了解更多',
            memberAlternateText: '成员可以提交和批准报告。',
            adminAlternateText: '管理员对所有报告和工作区设置拥有完全编辑权限。',
            auditorAlternateText: '审计员可以查看和评论报告。',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return '管理员';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return '审计员';
                    case CONST.POLICY.ROLE.USER:
                        return '成员';
                    default:
                        return '成员';
                }
            },
            frequency: {
                manual: '手动',
                instant: '即时',
                immediate: '每日',
                trip: '按行程',
                weekly: '每周',
                semimonthly: '每月两次',
                monthly: '每月',
            },
            planType: '计划类型',
            submitExpense: '在下方提交您的费用：',
            defaultCategory: '默认类别',
            viewTransactions: '查看交易记录',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `${displayName}的费用`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify 卡交易将自动导出到与<a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">我们集成</a>创建的 “Expensify 卡责任账户”。</muted-text-label>`,
        },
        receiptPartners: {
            connect: '立即连接',
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) => (organizationName ? `已连接到${organizationName}` : '在您的组织内自动化旅行和餐饮费用。'),
                sendInvites: '邀请成员',
                sendInvitesDescription: '这些工作区成员还没有 Uber for Business 账户。取消选择您此时不希望邀请的成员。',
                confirmInvite: '确认邀请',
                manageInvites: '管理邀请',
                confirm: '确认',
                allSet: '全部设置完毕',
                readyToRoll: '您已准备就绪',
                takeBusinessRideMessage: '进行商务出行，您的Uber收据将导入到Expensify。出发吧！',
                all: '全部',
                linked: '已关联',
                outstanding: '待处理',
                status: {
                    resend: '重新发送',
                    invite: '邀请',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: '已关联',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '待处理',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '已暂停',
                },
                centralBillingAccount: '中央结算账户',
                centralBillingDescription: '选择导入所有 Uber 收据的位置',
                invitationFailure: '无法邀请会员加入 Uber for Business。',
                autoInvite: '邀请新工作区成员加入 Uber for Business',
                autoRemove: '停用已从 Uber for Business 移除的工作区成员',
                bannerTitle: 'Expensify + Uber 商务版',
                bannerDescription: '连接 Uber for Business，以自动化整个组织的旅行和送餐费用。',
                emptyContent: {
                    title: '没有待处理的邀请',
                    subtitle: '太好了！我们到处寻找，但没有找到任何待处理的邀请。',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>设置每日津贴标准以控制员工的日常支出。<a href="${CONST.DEEP_DIVE_PER_DIEM}">了解更多</a>。</muted-text>`,
            amount: '金额',
            deleteRates: () => ({
                one: '删除费率',
                other: '删除费率',
            }),
            deletePerDiemRate: '删除每日津贴标准',
            findPerDiemRate: '查找每日津贴费率',
            areYouSureDelete: () => ({
                one: '您确定要删除此费率吗？',
                other: '您确定要删除这些费率吗？',
            }),
            emptyList: {
                title: '每日津贴',
                subtitle: '设置每日津贴标准以控制员工的每日支出。从电子表格导入费率以开始。',
            },
            importPerDiemRates: '导入每日津贴标准',
            editPerDiemRate: '编辑每日津贴费率',
            editPerDiemRates: '编辑每日津贴标准',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) => `更新此目的地将更改所有${destination}的每日津贴子费率。`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `更新此货币将更改所有${destination}的每日津贴子费率。`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '设置自付费用如何导出到QuickBooks Desktop。',
            exportOutOfPocketExpensesCheckToggle: '将支票标记为“稍后打印”',
            exportDescription: '配置如何将Expensify数据导出到QuickBooks Desktop。',
            date: '导出日期',
            exportInvoices: '导出发票到',
            exportExpensifyCard: '将 Expensify 卡交易导出为',
            account: '账户',
            accountDescription: '选择发布分录的位置。',
            accountsPayable: '应付账款',
            accountsPayableDescription: '选择在哪里创建供应商账单。',
            bankAccount: '银行账户',
            notConfigured: '未配置',
            bankAccountDescription: '选择从哪里发送支票。',
            creditCardAccount: '信用卡账户',
            exportDate: {
                label: '导出日期',
                description: '导出报告到QuickBooks Desktop时使用此日期。',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最后报销日期',
                        description: '报告中最近费用的日期。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '导出日期',
                        description: '报告导出到QuickBooks Desktop的日期。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提交日期',
                        description: '报告提交审批的日期。',
                    },
                },
            },
            exportCheckDescription: '我们将为每个Expensify报告创建一张分项支票，并从以下银行账户发送。',
            exportJournalEntryDescription: '我们将为每个Expensify报告创建一项分项日记账分录，并将其发布到以下账户。',
            exportVendorBillDescription: '我们将为每个Expensify报告创建一张分项供应商账单，并将其添加到以下账户中。如果此期间已关闭，我们将发布到下一个开放期间的第一天。',
            outOfPocketTaxEnabledDescription: 'QuickBooks Desktop 不支持日记账分录导出的税款。由于您在工作区启用了税款，此导出选项不可用。',
            outOfPocketTaxEnabledError: '启用税收时，日记分录不可用。请选择其他导出选项。',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '信用卡',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '供应商账单',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '日记条目',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '检查',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]: '我们将为每个Expensify报告创建一张分项支票，并从以下银行账户发送。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    '我们会自动将信用卡交易中的商家名称与QuickBooks中的任何对应供应商匹配。如果没有供应商存在，我们将创建一个“信用卡杂项”供应商进行关联。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '我们将为每个Expensify报告创建一份逐项列出的供应商账单，其中包含最后一笔费用的日期，并将其添加到下面的账户中。如果该期间已关闭，我们将发布到下一个开放期间的第一天。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '选择导出信用卡交易的目的地。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '选择一个供应商以应用于所有信用卡交易。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '选择从哪里发送支票。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: '启用位置时，供应商账单不可用。请选择其他导出选项。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '启用位置时无法使用支票。请选择其他导出选项。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '启用税收时，日记分录不可用。请选择其他导出选项。',
            },
            noAccountsFound: '未找到账户',
            noAccountsFoundDescription: '在 QuickBooks Desktop 中添加账户并再次同步连接',
            qbdSetup: 'QuickBooks Desktop 设置',
            requiredSetupDevice: {
                title: '无法从此设备连接',
                body1: '您需要从托管 QuickBooks Desktop 公司文件的计算机上设置此连接。',
                body2: '一旦连接，您就可以随时随地同步和导出。',
            },
            setupPage: {
                title: '打开此链接进行连接',
                body: '要完成设置，请在运行QuickBooks Desktop的计算机上打开以下链接。',
                setupErrorTitle: '出现错误',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>QuickBooks Desktop 连接暂时无法正常工作。请稍后再试，如果问题仍然存在，<a href="${conciergeLink}">请联系Concierge</a>。</centered-text></muted-text>`,
            },
            importDescription: '选择从 QuickBooks Desktop 导入到 Expensify 的编码配置。',
            classes: '类',
            items: '项目',
            customers: '客户/项目',
            exportCompanyCardsDescription: '设置公司卡购买如何导出到QuickBooks Desktop。',
            defaultVendorDescription: '设置一个默认供应商，该供应商将适用于导出时的所有信用卡交易。',
            accountsDescription: '您的 QuickBooks Desktop 科目表将作为类别导入到 Expensify。',
            accountsSwitchTitle: '选择将新账户导入为启用或禁用的类别。',
            accountsSwitchDescription: '启用的类别将在成员创建费用时可供选择。',
            classesDescription: '选择如何在Expensify中处理QuickBooks Desktop类别。',
            tagsDisplayedAsDescription: '行项目级别',
            reportFieldsDisplayedAsDescription: '报告级别',
            customersDescription: '选择如何在Expensify中处理QuickBooks Desktop客户/项目。',
            advancedConfig: {
                autoSyncDescription: 'Expensify将每天自动与QuickBooks Desktop同步。',
                createEntities: '自动创建实体',
                createEntitiesDescription: '如果供应商尚不存在，Expensify 将在 QuickBooks Desktop 中自动创建供应商。',
            },
            itemsDescription: '选择如何在Expensify中处理QuickBooks Desktop项目。',
            accountingMethods: {
                label: '何时导出',
                description: '选择何时导出费用：',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '应计',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '现金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自付费用将在最终批准时导出',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自付费用将在支付时导出',
                },
            },
        },
        qbo: {
            connectedTo: '已连接到',
            importDescription: '选择要从QuickBooks Online导入到Expensify的编码配置。',
            classes: '类',
            locations: '位置',
            customers: '客户/项目',
            accountsDescription: '您的 QuickBooks Online 科目表将作为类别导入到 Expensify。',
            accountsSwitchTitle: '选择将新账户导入为启用或禁用的类别。',
            accountsSwitchDescription: '启用的类别将在成员创建费用时可供选择。',
            classesDescription: '选择如何在Expensify中处理QuickBooks Online类别。',
            customersDescription: '选择如何在Expensify中处理QuickBooks Online客户/项目。',
            locationsDescription: '选择如何在Expensify中处理QuickBooks Online位置。',
            taxesDescription: '选择如何在Expensify中处理QuickBooks Online税款。',
            locationsLineItemsRestrictionDescription: 'QuickBooks Online 不支持在支票或供应商账单的行级别设置位置。如果您希望在行级别设置位置，请确保您使用的是分录和信用/借记卡费用。',
            taxesJournalEntrySwitchNote: 'QuickBooks Online 不支持日记账分录中的税款。请将您的导出选项更改为供应商账单或支票。',
            exportDescription: '配置如何将Expensify数据导出到QuickBooks Online。',
            date: '导出日期',
            exportInvoices: '导出发票到',
            exportExpensifyCard: '将 Expensify 卡交易导出为',
            exportDate: {
                label: '导出日期',
                description: '在导出报告到QuickBooks Online时使用此日期。',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最后报销日期',
                        description: '报告中最近费用的日期。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '导出日期',
                        description: '报告导出到QuickBooks Online的日期。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提交日期',
                        description: '报告提交审批的日期。',
                    },
                },
            },
            receivable: '应收账款', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: '应收账款存档', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: '将此账户用于导出发票到QuickBooks Online。',
            exportCompanyCardsDescription: '设置公司卡购买如何导出到QuickBooks Online。',
            vendor: '供应商',
            defaultVendorDescription: '设置一个默认供应商，该供应商将适用于导出时的所有信用卡交易。',
            exportOutOfPocketExpensesDescription: '设置自付费用如何导出到QuickBooks Online。',
            exportCheckDescription: '我们将为每个Expensify报告创建一张分项支票，并从以下银行账户发送。',
            exportJournalEntryDescription: '我们将为每个Expensify报告创建一项分项日记账分录，并将其发布到以下账户。',
            exportVendorBillDescription: '我们将为每个Expensify报告创建一张分项供应商账单，并将其添加到以下账户中。如果此期间已关闭，我们将发布到下一个开放期间的第一天。',
            account: '账户',
            accountDescription: '选择发布分录的位置。',
            accountsPayable: '应付账款',
            accountsPayableDescription: '选择在哪里创建供应商账单。',
            bankAccount: '银行账户',
            notConfigured: '未配置',
            bankAccountDescription: '选择从哪里发送支票。',
            creditCardAccount: '信用卡账户',
            companyCardsLocationEnabledDescription: 'QuickBooks Online不支持供应商账单导出的地点功能。由于您在工作区启用了地点功能，此导出选项不可用。',
            outOfPocketTaxEnabledDescription: 'QuickBooks Online不支持日记账分录导出的税项。由于您在工作区启用了税项，此导出选项不可用。',
            outOfPocketTaxEnabledError: '启用税收时，日记分录不可用。请选择其他导出选项。',
            advancedConfig: {
                autoSyncDescription: 'Expensify将每天自动与QuickBooks Online同步。',
                inviteEmployees: '邀请员工',
                inviteEmployeesDescription: '导入 QuickBooks Online 员工记录并邀请员工加入此工作区。',
                createEntities: '自动创建实体',
                createEntitiesDescription: '如果供应商尚不存在，Expensify 将在 QuickBooks Online 中自动创建供应商，并在导出发票时自动创建客户。',
                reimbursedReportsDescription: '每当使用 Expensify ACH 支付报告时，相应的账单付款将在下面的 QuickBooks Online 帐户中创建。',
                qboBillPaymentAccount: 'QuickBooks 账单支付账户',
                qboInvoiceCollectionAccount: 'QuickBooks 发票收款账户',
                accountSelectDescription: '选择从哪里支付账单，我们将在 QuickBooks Online 中创建付款。',
                invoiceAccountSelectorDescription: '选择接收发票付款的地方，我们将在QuickBooks Online中创建付款。',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: '借记卡',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '信用卡',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '供应商账单',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '日记条目',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '检查',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    '我们会自动将借记卡交易中的商户名称与QuickBooks中的任何相应供应商匹配。如果不存在供应商，我们将创建一个“借记卡杂项”供应商进行关联。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    '我们会自动将信用卡交易中的商家名称与QuickBooks中的任何对应供应商匹配。如果没有供应商存在，我们将创建一个“信用卡杂项”供应商进行关联。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '我们将为每个Expensify报告创建一份逐项列出的供应商账单，其中包含最后一笔费用的日期，并将其添加到下面的账户中。如果该期间已关闭，我们将发布到下一个开放期间的第一天。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: '选择导出借记卡交易的位置。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '选择导出信用卡交易的目的地。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '选择一个供应商以应用于所有信用卡交易。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: '启用位置时，供应商账单不可用。请选择其他导出选项。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '启用位置时无法使用支票。请选择其他导出选项。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '启用税收时，日记分录不可用。请选择其他导出选项。',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '选择一个有效的账户进行供应商账单导出',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '选择一个有效的账户进行日记账导出',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '选择一个有效的账户进行支票导出',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '要使用供应商账单导出，请在QuickBooks Online中设置应付账款账户。',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '要使用分录导出，请在QuickBooks Online中设置一个分录账户。',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '要使用支票导出，请在QuickBooks Online中设置一个银行账户。',
            },
            noAccountsFound: '未找到账户',
            noAccountsFoundDescription: '在 QuickBooks Online 中添加账户并再次同步连接。',
            accountingMethods: {
                label: '何时导出',
                description: '选择何时导出费用：',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '应计',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '现金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自付费用将在最终批准时导出',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自付费用将在支付时导出',
                },
            },
        },
        workspaceList: {
            joinNow: '立即加入',
            askToJoin: '请求加入',
        },
        xero: {
            organization: 'Xero 组织',
            organizationDescription: '选择您想要从中导入数据的Xero组织。',
            importDescription: '选择从Xero导入到Expensify的编码配置。',
            accountsDescription: '您的Xero会计科目表将作为类别导入到Expensify中。',
            accountsSwitchTitle: '选择将新账户导入为启用或禁用的类别。',
            accountsSwitchDescription: '启用的类别将在成员创建费用时可供选择。',
            trackingCategories: '跟踪类别',
            trackingCategoriesDescription: '选择如何在Expensify中处理Xero跟踪类别。',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `将 Xero ${categoryName} 映射到`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `选择将 ${categoryName} 映射到 Xero 的位置。`,
            customers: '重新向客户开账单',
            customersDescription: '选择是否在Expensify中重新向客户开账单。您的Xero客户联系人可以被标记到费用中，并将作为销售发票导出到Xero。',
            taxesDescription: '选择如何在Expensify中处理Xero税款。',
            notImported: '未导入',
            notConfigured: '未配置',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero 联系人默认值',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: '标签',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: '报告字段',
            },
            exportDescription: '配置如何将Expensify数据导出到Xero。',
            purchaseBill: '采购账单',
            exportDeepDiveCompanyCard: '导出的费用将作为银行交易发布到下面的Xero银行账户，交易日期将与您的银行对账单上的日期相匹配。',
            bankTransactions: '银行交易',
            xeroBankAccount: 'Xero 银行账户',
            xeroBankAccountDescription: '选择将费用发布为银行交易的位置。',
            exportExpensesDescription: '报告将导出为采购账单，并带有以下选择的日期和状态。',
            purchaseBillDate: '购买账单日期',
            exportInvoices: '将发票导出为',
            salesInvoice: '销售发票',
            exportInvoicesDescription: '销售发票始终显示发票发送的日期。',
            advancedConfig: {
                autoSyncDescription: 'Expensify将每天自动与Xero同步。',
                purchaseBillStatusTitle: '购买账单状态',
                reimbursedReportsDescription: '每当使用 Expensify ACH 支付报告时，相应的账单付款将在下面的 Xero 账户中创建。',
                xeroBillPaymentAccount: 'Xero账单支付账户',
                xeroInvoiceCollectionAccount: 'Xero发票收款账户',
                xeroBillPaymentAccountDescription: '选择支付账单的账户，我们将在Xero中创建付款。',
                invoiceAccountSelectorDescription: '选择接收发票付款的账户，我们将在Xero中创建付款。',
            },
            exportDate: {
                label: '购买账单日期',
                description: '导出报告到Xero时使用此日期。',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最后报销日期',
                        description: '报告中最近费用的日期。',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '导出日期',
                        description: '报告导出到Xero的日期。',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提交日期',
                        description: '报告提交审批的日期。',
                    },
                },
            },
            invoiceStatus: {
                label: '购买账单状态',
                description: '将此状态用于导出采购账单到Xero。',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '草稿',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '等待批准',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '等待付款',
                },
            },
            noAccountsFound: '未找到账户',
            noAccountsFoundDescription: '请在Xero中添加账户并再次同步连接',
            accountingMethods: {
                label: '何时导出',
                description: '选择何时导出费用：',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '应计',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '现金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自付费用将在最终批准时导出',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自付费用将在支付时导出',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '首选导出工具',
            taxSolution: '税务解决方案',
            notConfigured: '未配置',
            exportDate: {
                label: '导出日期',
                description: '导出报告到 Sage Intacct 时使用此日期。',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最后报销日期',
                        description: '报告中最近费用的日期。',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: '导出日期',
                        description: '报告导出到 Sage Intacct 的日期。',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '提交日期',
                        description: '报告提交审批的日期。',
                    },
                },
            },
            reimbursableExpenses: {
                description: '设置自付费用如何导出到 Sage Intacct。',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: '费用报告',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '供应商账单',
                },
            },
            nonReimbursableExpenses: {
                description: '设置公司卡购买如何导出到 Sage Intacct。',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: '信用卡',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '供应商账单',
                },
            },
            creditCardAccount: '信用卡账户',
            defaultVendor: '默认供应商',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `设置一个默认供应商，将适用于在 Sage Intacct 中没有匹配供应商的${isReimbursable ? '' : 'non-'}可报销费用。`,
            exportDescription: '配置如何将Expensify数据导出到Sage Intacct。',
            exportPreferredExporterNote: '首选导出者可以是任何工作区管理员，但如果您在域设置中为单个公司卡设置不同的导出账户，则必须也是域管理员。',
            exportPreferredExporterSubNote: '一旦设置，首选导出者将在其账户中看到可导出的报告。',
            noAccountsFound: '未找到账户',
            noAccountsFoundDescription: `请在 Sage Intacct 中添加账户并再次同步连接。`,
            autoSync: '自动同步',
            autoSyncDescription: 'Expensify将每天自动与Sage Intacct同步。',
            inviteEmployees: '邀请员工',
            inviteEmployeesDescription: '导入 Sage Intacct 员工记录并邀请员工加入此工作区。您的审批流程将默认设置为经理审批，并可以在成员页面上进一步配置。',
            syncReimbursedReports: '同步已报销的报告',
            syncReimbursedReportsDescription: '每当使用 Expensify ACH 支付报告时，相应的账单付款将在以下 Sage Intacct 账户中创建。',
            paymentAccount: 'Sage Intacct付款账户',
            accountingMethods: {
                label: '何时导出',
                description: '选择何时导出费用：',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '应计',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '现金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自付费用将在最终批准时导出',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自付费用将在支付时导出',
                },
            },
        },
        netsuite: {
            subsidiary: '子公司',
            subsidiarySelectDescription: '选择您希望从中导入数据的 NetSuite 子公司。',
            exportDescription: '配置如何将Expensify数据导出到NetSuite。',
            exportInvoices: '导出发票到',
            journalEntriesTaxPostingAccount: '日记账分录税务过账账户',
            journalEntriesProvTaxPostingAccount: '分录省税入账账户',
            foreignCurrencyAmount: '导出外币金额',
            exportToNextOpenPeriod: '导出到下一个开放期',
            nonReimbursableJournalPostingAccount: '不可报销的记账账户',
            reimbursableJournalPostingAccount: '可报销的日记账过账账户',
            journalPostingPreference: {
                label: '过账偏好设置',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '每个报告的单项明细条目',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '每笔费用的单项录入',
                },
            },
            invoiceItem: {
                label: '发票项目',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '为我创建一个',
                        description: '在导出时，我们会为您创建一个“Expensify 发票项目”（如果尚不存在）。',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '选择现有的',
                        description: '我们会将Expensify的发票与下面选择的项目关联。',
                    },
                },
            },
            exportDate: {
                label: '导出日期',
                description: '将此日期用于导出报告到NetSuite。',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最后报销日期',
                        description: '报告中最近费用的日期。',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: '导出日期',
                        description: '报告导出到NetSuite的日期。',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: '提交日期',
                        description: '报告提交审批的日期。',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: '费用报告',
                        reimbursableDescription: dedent(`
                            自付费用将作为会计分录导出到下方指定的 NetSuite 账户。

                            如果您希望为每张卡设置特定的供应商，请前往 *Settings > Domains > Company Cards*。
                        `),
                        nonReimbursableDescription: dedent(`
                            公司卡费用将作为日记账分录导出到下方指定的 NetSuite 账户。

                            如果你想为每张卡设置特定的供应商，请前往 *Settings > Domains > Company Cards*。
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '供应商账单',
                        reimbursableDescription: dedent(`
                            自付费用将作为会计分录导出到下方指定的 NetSuite 账户。

                            如果您希望为每张卡设置特定的供应商，请前往 *Settings > Domains > Company Cards*。
                        `),
                        nonReimbursableDescription: dedent(`
                            公司卡费用将作为日记账分录导出到下方指定的 NetSuite 账户。

                            如果你想为每张卡设置特定的供应商，请前往 *Settings > Domains > Company Cards*。
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '日记条目',
                        reimbursableDescription: dedent(`
                            自付费用将作为会计分录导出到下方指定的 NetSuite 账户。

                            如果您希望为每张卡设置特定的供应商，请前往 *Settings > Domains > Company Cards*。
                        `),
                        nonReimbursableDescription: dedent(`
                            公司卡费用将作为日记账分录导出到下方指定的 NetSuite 账户。

                            如果你想为每张卡设置特定的供应商，请前往 *Settings > Domains > Company Cards*。
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    '如果您将公司卡的导出设置更改为费用报告，NetSuite供应商和各个卡的过账账户将被禁用。\n\n不用担心，我们仍然会保存您之前的选择，以防您将来想要恢复原设置。',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify将每天自动与NetSuite同步。',
                reimbursedReportsDescription: '每当使用Expensify ACH支付报告时，相应的账单付款将在下面的NetSuite账户中创建。',
                reimbursementsAccount: '报销账户',
                reimbursementsAccountDescription: '选择您用于报销的银行账户，我们将在NetSuite中创建相关付款。',
                collectionsAccount: '催收账户',
                collectionsAccountDescription: '一旦发票在Expensify中标记为已支付并导出到NetSuite，它将显示在以下账户中。',
                approvalAccount: 'A/P审批账户',
                approvalAccountDescription: '选择在 NetSuite 中批准交易的账户。如果您正在同步报销报告，这也是创建账单付款的账户。',
                defaultApprovalAccount: 'NetSuite 默认',
                inviteEmployees: '邀请员工并设置审批流程',
                inviteEmployeesDescription: '导入 NetSuite 员工记录并邀请员工加入此工作区。您的审批流程将默认设置为经理审批，并可以在*成员*页面上进一步配置。',
                autoCreateEntities: '自动创建员工/供应商',
                enableCategories: '启用新导入的类别',
                customFormID: '自定义表单ID',
                customFormIDDescription: '默认情况下，Expensify 将使用 NetSuite 中设置的首选交易表单创建条目。或者，您可以指定要使用的特定交易表单。',
                customFormIDReimbursable: '自付费用',
                customFormIDNonReimbursable: '公司卡费用',
                exportReportsTo: {
                    label: '费用报告审批级别',
                    description: '一旦在Expensify中批准了费用报告并导出到NetSuite，您可以在NetSuite中设置额外的审批级别，然后再进行发布。',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite 默认偏好设置',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '仅限主管批准',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '仅会计批准',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '主管和会计已批准',
                    },
                },
                accountingMethods: {
                    label: '何时导出',
                    description: '选择何时导出费用：',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '应计',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '现金',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自付费用将在最终批准时导出',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自付费用将在支付时导出',
                    },
                },
                exportVendorBillsTo: {
                    label: '供应商账单审批级别',
                    description: '一旦供应商账单在Expensify中获得批准并导出到NetSuite，您可以在NetSuite中设置额外的审批级别，然后再进行过账。',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite 默认偏好设置',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '待批准',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '批准发布',
                    },
                },
                exportJournalsTo: {
                    label: '日记分录审批级别',
                    description: '一旦在Expensify中批准了日记账分录并导出到NetSuite，您可以在NetSuite中设置额外的审批级别，然后再进行过账。',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite 默认偏好设置',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '待批准',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '批准发布',
                    },
                },
                error: {
                    customFormID: '请输入有效的数字自定义表单ID',
                },
            },
            noAccountsFound: '未找到账户',
            noAccountsFoundDescription: '请在NetSuite中添加账户并再次同步连接。',
            noVendorsFound: '未找到供应商',
            noVendorsFoundDescription: '请在NetSuite中添加供应商并再次同步连接',
            noItemsFound: '未找到发票项目',
            noItemsFoundDescription: '请在NetSuite中添加发票项目并再次同步连接',
            noSubsidiariesFound: '未找到子公司',
            noSubsidiariesFoundDescription: '请在NetSuite中添加一个子公司并再次同步连接',
            tokenInput: {
                title: 'NetSuite设置',
                formSteps: {
                    installBundle: {
                        title: '安装 Expensify 套件',
                        description: '在 NetSuite 中，依次进入*Customization > SuiteBundler > Search & Install Bundles* > 搜索“Expensify” > 安装该捆绑包。',
                    },
                    enableTokenAuthentication: {
                        title: '启用基于令牌的身份验证',
                        description: '在 NetSuite 中，依次转到 *Setup > Company > Enable Features > SuiteCloud* > 启用 *token-based authentication*。',
                    },
                    enableSoapServices: {
                        title: '启用SOAP Web服务',
                        description: '在 NetSuite 中，依次转到 *Setup > Company > Enable Features > SuiteCloud* > 启用 *SOAP Web Services*。',
                    },
                    createAccessToken: {
                        title: '创建访问令牌',
                        description:
                            '在 NetSuite 中，进入 *Setup > Users/Roles > Access Tokens*，为 "Expensify" 应用和 "Expensify Integration" 或 "Administrator" 角色创建一个访问令牌。\n\n*重要提示：* 确保保存此步骤中的 *Token ID* 和 *Token Secret*。您将在下一步需要用到它。',
                    },
                    enterCredentials: {
                        title: '输入您的 NetSuite 凭据',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Account ID',
                            netSuiteTokenID: '令牌 ID',
                            netSuiteTokenSecret: '令牌密钥',
                        },
                        netSuiteAccountIDDescription: '在 NetSuite 中，转到 *Setup > Integration > SOAP Web Services Preferences*。',
                    },
                },
            },
            import: {
                expenseCategories: '费用类别',
                expenseCategoriesDescription: '您的 NetSuite 费用类别将作为类别导入到 Expensify 中。',
                crossSubsidiaryCustomers: '跨子公司客户/项目',
                importFields: {
                    departments: {
                        title: '部门',
                        subtitle: '选择如何在Expensify中处理NetSuite的*部门*。',
                    },
                    classes: {
                        title: '类',
                        subtitle: '选择如何在Expensify中处理*类别*。',
                    },
                    locations: {
                        title: '位置',
                        subtitle: '选择如何在Expensify中处理*位置*。',
                    },
                },
                customersOrJobs: {
                    title: '客户/项目',
                    subtitle: '选择如何在Expensify中处理NetSuite的*客户*和*项目*。',
                    importCustomers: '导入客户',
                    importJobs: '导入项目',
                    customers: '客户',
                    jobs: '项目',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('和')}, ${importType}`,
                },
                importTaxDescription: '从 NetSuite 导入税务组。',
                importCustomFields: {
                    chooseOptionBelow: '选择以下选项：',
                    label: ({importedTypes}: ImportedTypesParams) => `Imported as ${importedTypes.join('和')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `请输入${fieldName}`,
                    customSegments: {
                        title: '自定义段/记录',
                        addText: '添加自定义段/记录',
                        recordTitle: '自定义段/记录',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '查看详细说明',
                        helpText: '关于配置自定义段/记录。',
                        emptyTitle: '添加自定义段或自定义记录',
                        fields: {
                            segmentName: '名称',
                            internalID: '内部ID',
                            scriptID: '脚本 ID',
                            customRecordScriptID: '交易列ID',
                            mapping: '显示为',
                        },
                        removeTitle: '删除自定义段/记录',
                        removePrompt: '您确定要删除此自定义段/记录吗？',
                        addForm: {
                            customSegmentName: '自定义段名称',
                            customRecordName: '自定义记录名称',
                            segmentTitle: '自定义段',
                            customSegmentAddTitle: '添加自定义段',
                            customRecordAddTitle: '添加自定义记录',
                            recordTitle: '自定义记录',
                            segmentRecordType: '您想添加自定义段还是自定义记录？',
                            customSegmentNameTitle: '自定义分段名称是什么？',
                            customRecordNameTitle: '自定义记录名称是什么？',
                            customSegmentNameFooter: `您可以在 NetSuite 的 *Customizations > Links, Records & Fields > Custom Segments* 页面下找到自定义段名称。\n\n_有关更详细的说明，请[访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_。`,
                            customRecordNameFooter: `您可以通过在全局搜索中输入“Transaction Column Field”来查找NetSuite中的自定义记录名称。\n\n_有关更详细的说明，请[访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_。`,
                            customSegmentInternalIDTitle: '内部ID是什么？',
                            customSegmentInternalIDFooter: `首先，请确保您在 NetSuite 中启用了内部 ID，路径为 *Home > Set Preferences > Show Internal ID*。\n\n您可以在 NetSuite 中找到自定义段的内部 ID，路径为：\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*。\n2. 点击进入一个自定义段。\n3. 点击 *Custom Record Type* 旁边的超链接。\n4. 在底部的表格中找到内部 ID。\n\n_有关更详细的说明，请[访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_。`,
                            customRecordInternalIDFooter: `您可以通过以下步骤在 NetSuite 中找到自定义记录的内部 ID：\n\n1. 在全局搜索中输入“Transaction Line Fields”。\n2. 点击进入一个自定义记录。\n3. 在左侧找到内部 ID。\n\n_有关更详细的说明，请[访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_。`,
                            customSegmentScriptIDTitle: '脚本ID是什么？',
                            customSegmentScriptIDFooter: `您可以在 NetSuite 中找到自定义段脚本 ID，路径为：\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*。\n2. 点击进入一个自定义段。\n3. 点击靠近底部的 *Application and Sourcing* 标签页，然后：\n    a. 如果您想在 Expensify 中将自定义段显示为 *标签*（在单项级别），请点击 *Transaction Columns* 子标签页并使用 *Field ID*。\n    b. 如果您想在 Expensify 中将自定义段显示为 *报告字段*（在报告级别），请点击 *Transactions* 子标签页并使用 *Field ID*。\n\n_有关更详细的说明，请[访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_。`,
                            customRecordScriptIDTitle: '交易列ID是什么？',
                            customRecordScriptIDFooter: `您可以在 NetSuite 中找到自定义记录脚本 ID，步骤如下：\n\n1. 在全局搜索中输入“Transaction Line Fields”。\n2. 点击进入一个自定义记录。\n3. 在左侧找到脚本 ID。\n\n_有关更详细的说明，请[访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_。`,
                            customSegmentMappingTitle: '如何在Expensify中显示此自定义段？',
                            customRecordMappingTitle: '在Expensify中，这个自定义记录应该如何显示？',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `具有此 ${fieldName?.toLowerCase()} 的自定义段/记录已存在`,
                        },
                    },
                    customLists: {
                        title: '自定义列表',
                        addText: '添加自定义列表',
                        recordTitle: '自定义列表',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: '查看详细说明',
                        helpText: '关于配置自定义列表。',
                        emptyTitle: '添加自定义列表',
                        fields: {
                            listName: '名称',
                            internalID: '内部ID',
                            transactionFieldID: '交易字段ID',
                            mapping: '显示为',
                        },
                        removeTitle: '删除自定义列表',
                        removePrompt: '您确定要删除此自定义列表吗？',
                        addForm: {
                            listNameTitle: '选择自定义列表',
                            transactionFieldIDTitle: '交易字段ID是什么？',
                            transactionFieldIDFooter: `您可以通过以下步骤在 NetSuite 中找到交易字段 ID：\n\n1. 在全局搜索中输入“Transaction Line Fields”。\n2. 点击进入自定义列表。\n3. 在左侧找到交易字段 ID。\n\n_有关更详细的说明，请[访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_。`,
                            mappingTitle: '在Expensify中，这个自定义列表应该如何显示？',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `已存在具有此交易字段ID的自定义列表`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuite 员工默认值',
                        description: '未导入Expensify，已在导出时应用',
                        footerContent: ({importField}: ImportFieldParams) => `如果您在NetSuite中使用${importField}，我们将在导出到费用报告或日记账分录时应用员工记录上设置的默认值。`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: '标签',
                        description: '逐项级别',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} 将可用于员工报告中的每一笔费用。`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: '报告字段',
                        description: '报告级别',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} 选择将适用于员工报告中的所有费用。`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct 设置',
            prerequisitesTitle: '在您连接之前...',
            downloadExpensifyPackage: '下载适用于Sage Intacct的Expensify软件包',
            followSteps: '按照我们的操作指南中的步骤：连接到 Sage Intacct 说明书',
            enterCredentials: '输入您的 Sage Intacct 凭证',
            entity: '实体',
            employeeDefault: 'Sage Intacct 员工默认值',
            employeeDefaultDescription: '如果存在，员工的默认部门将应用于他们在 Sage Intacct 中的费用。',
            displayedAsTagDescription: '部门将可在员工报告的每一笔费用中选择。',
            displayedAsReportFieldDescription: '部门选择将适用于员工报告中的所有费用。',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `选择如何处理 Sage Intacct <strong>${mappingTitle}</strong> 在Expensify中。`,
            expenseTypes: '费用类型',
            expenseTypesDescription: '您的 Sage Intacct 费用类型将作为类别导入到 Expensify。',
            accountTypesDescription: '您的 Sage Intacct 科目表将作为类别导入到 Expensify 中。',
            importTaxDescription: '从 Sage Intacct 导入采购税率。',
            userDefinedDimensions: '用户定义的维度',
            addUserDefinedDimension: '添加用户定义的维度',
            integrationName: '集成名称',
            dimensionExists: '已存在具有此名称的维度。',
            removeDimension: '删除用户定义的维度',
            removeDimensionPrompt: '您确定要删除此用户定义的维度吗？',
            userDefinedDimension: '用户定义维度',
            addAUserDefinedDimension: '添加用户定义的维度',
            detailedInstructionsLink: '查看详细说明',
            detailedInstructionsRestOfSentence: '关于添加用户定义的维度。',
            userDimensionsAdded: () => ({
                one: '1 UDD 已添加',
                other: (count: number) => `添加了${count}个UDD`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '部门';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'classes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return '地点';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '客户';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return '项目（工作）';
                    default:
                        return 'mappings';
                }
            },
        },
        type: {
            free: '免费',
            control: '控制',
            collect: '收集',
        },
        companyCards: {
            addCards: '添加卡片',
            selectCards: '选择卡片',
            addNewCard: {
                other: '其他',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard 商业卡',
                    vcf: 'Visa 商业卡',
                    stripe: 'Stripe Cards',
                },
                yourCardProvider: `您的银行卡提供商是谁？`,
                whoIsYourBankAccount: '您的银行是哪家？',
                whereIsYourBankLocated: '您的银行在哪里？',
                howDoYouWantToConnect: '您想如何连接到您的银行？',
                learnMoreAboutOptions: `<muted-text>了解有关这些<a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">选项</a>的更多信息。</muted-text>`,
                commercialFeedDetails: '需要与您的银行进行设置。这通常由较大的公司使用，并且如果您符合条件，这通常是最佳选择。',
                commercialFeedPlaidDetails: `需要与您的银行进行设置，但我们会指导您。通常这仅限于较大的公司。`,
                directFeedDetails: '最简单的方法。使用您的主账户凭证立即连接。这是最常见的方法。',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `启用您的${provider}提要`,
                    heading: '我们与您的发卡机构有直接集成，可以快速准确地将您的交易数据导入Expensify。\n\n要开始，请简单地：',
                    visa: '我们与Visa有全球集成，但资格因银行和卡计划而异。\n\n要开始，请简单地：',
                    mastercard: '我们与万事达卡有全球集成，但资格因银行和卡片计划而异。\n\n要开始，只需：',
                    vcf: `1. 请访问[此帮助文章](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})，获取有关如何设置您的Visa Commercial Cards的详细说明。\n\n2. [联系您的银行](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})以确认他们是否支持您的项目的商业数据流，并要求他们启用它。\n\n3. *一旦数据流启用并且您拥有其详细信息，请继续到下一个屏幕。*`,
                    gl1025: `1. 请访问[此帮助文章](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP})，了解American Express是否可以为您的项目启用商业数据流。\n\n2. 数据流启用后，Amex将向您发送生产信函。\n\n3. *一旦您拥有数据流信息，请继续到下一个屏幕。*`,
                    cdf: `1. 请访问[此帮助文章](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})，获取有关如何设置您的Mastercard Commercial Cards的详细说明。\n\n2. [联系您的银行](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})以确认他们是否支持您计划的商业数据流，并要求他们启用它。\n\n3. *一旦数据流启用并获得其详细信息后，继续到下一个屏幕。*`,
                    stripe: `1. 访问 Stripe 的仪表板，然后转到[设置](${CONST.COMPANY_CARDS_STRIPE_HELP})。\n\n2. 在产品集成下，点击 Expensify 旁边的启用。\n\n3. 一旦启用该提要，点击下面的提交，我们将开始添加它。`,
                },
                whatBankIssuesCard: '这些卡是由哪家银行发行的？',
                enterNameOfBank: '输入银行名称',
                feedDetails: {
                    vcf: {
                        title: 'Visa 数据源详情是什么？',
                        processorLabel: '处理器 ID',
                        bankLabel: '金融机构（银行）ID',
                        companyLabel: '公司ID',
                        helpLabel: '我在哪里可以找到这些ID？',
                    },
                    gl1025: {
                        title: `Amex交付文件的名称是什么？`,
                        fileNameLabel: '交付文件名',
                        helpLabel: '我在哪里可以找到交付文件的名称？',
                    },
                    cdf: {
                        title: `Mastercard 分发 ID 是什么？`,
                        distributionLabel: '分发 ID',
                        helpLabel: '我在哪里可以找到分发 ID？',
                    },
                },
                amexCorporate: '如果您的卡片正面写着“Corporate”，请选择此项。',
                amexBusiness: '如果您的卡片正面写着“Business”，请选择此项。',
                amexPersonal: '如果您的卡是个人卡，请选择此项',
                error: {
                    pleaseSelectProvider: '请在继续之前选择一个卡提供商',
                    pleaseSelectBankAccount: '请在继续之前选择一个银行账户',
                    pleaseSelectBank: '请在继续之前选择一个银行',
                    pleaseSelectCountry: '请在继续之前选择一个国家',
                    pleaseSelectFeedType: '请在继续之前选择一个订阅类型',
                },
                exitModal: {
                    title: '出现问题了吗？',
                    prompt: '我们注意到您尚未完成添加卡片。如果遇到问题，请告诉我们，我们会帮您解决。',
                    confirmText: '报告问题',
                    cancelText: '跳过',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: '本月最后一天',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: '本月最后一个工作日',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: '本月自定义日期',
            },
            assignCard: '分配卡片',
            findCard: '查找卡片',
            cardNumber: '卡号',
            commercialFeed: '商业信息流',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `${feedName} 卡片`,
            directFeed: '直接馈送',
            whoNeedsCardAssigned: '谁需要分配卡片？',
            chooseCard: '选择一张卡片',
            chooseCardFor: ({assignee}: AssigneeParams) => `为<strong>${assignee}</strong>选择一张卡。找不到您要找的卡吗？<concierge-link>告诉我们。</concierge-link>`,
            noActiveCards: '此信息流中没有活跃的卡片',
            somethingMightBeBroken:
                '<muted-text><centered-text>或者有什么东西坏了。无论如何，如果您有任何问题，请<concierge-link>联系 Concierge</concierge-link>。</centered-text></muted-text>',
            chooseTransactionStartDate: '选择交易开始日期',
            startDateDescription: '我们将从此日期开始导入所有交易。如果未指定日期，我们将根据您的银行允许的最早日期进行导入。',
            fromTheBeginning: '从头开始',
            customStartDate: '自定义开始日期',
            customCloseDate: '自定义关闭日期',
            letsDoubleCheck: '让我们仔细检查一下，确保一切正常。',
            confirmationDescription: '我们将立即开始导入交易。',
            cardholder: '持卡人',
            card: '卡片',
            cardName: '卡片名称',
            brokenConnectionError: '<rbr>卡片信息流连接已断开。请 <a href="#">登录您的银行账户</a> 以便我们可以重新建立连接。</rbr>',
            assignedCard: ({assignee, link}: AssignedCardParams) => `已分配${assignee}一个${link}！导入的交易将显示在此聊天中。`,
            companyCard: '公司卡',
            chooseCardFeed: '选择卡片信息流',
            ukRegulation:
                'Expensify Limited 是 Plaid Financial Ltd. 的代理商，Plaid Financial Ltd. 是一家授权支付机构，受金融行为监管局根据2017年支付服务条例的监管（公司参考编号：804718）。Plaid 通过 Expensify Limited 作为其代理商为您提供受监管的账户信息服务。',
        },
        expensifyCard: {
            issueAndManageCards: '发行和管理您的Expensify卡片',
            getStartedIssuing: '通过申请您的第一张虚拟或实体卡来开始。',
            verificationInProgress: '正在验证中...',
            verifyingTheDetails: '我们正在核实一些细节。Concierge 会在 Expensify 卡准备好发行时通知您。',
            disclaimer:
                'The Expensify Visa® Commercial Card 是由 The Bancorp Bank, N.A. 发行的，FDIC 成员，根据 Visa U.S.A. Inc. 的许可，并且可能无法在所有接受 Visa 卡的商户使用。Apple® 和 Apple logo® 是 Apple Inc. 在美国和其他国家注册的商标。App Store 是 Apple Inc. 的服务标志。Google Play 和 Google Play logo 是 Google LLC 的商标。',
            issueCard: '发卡',
            findCard: '查找卡片',
            euUkDisclaimer:
                '提供给欧洲经济区 (EEA) 居民的卡由 Transact Payments Malta Limited 发行，提供给英国居民的卡由 Transact Payments Limited 根据 Visa Europe Limited 的许可发行。Transact Payments Malta Limited 经马耳他金融服务管理局正式授权并受其监管，为根据 1994 年《金融机构法》设立的金融机构。注册编号为 C 91879。Transact Payments Limited 经直布罗陀金融服务委员会授权并受其监管。',
            newCard: '新卡片',
            name: '名称',
            lastFour: '最后4位数',
            limit: '限制',
            currentBalance: '当前余额',
            currentBalanceDescription: '当前余额是自上次结算日期以来发生的所有已发布Expensify卡交易的总和。',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `余额将在${settlementDate}结清`,
            settleBalance: '结算余额',
            cardLimit: '卡片限额',
            remainingLimit: '剩余额度',
            requestLimitIncrease: '请求增加限制额度',
            remainingLimitDescription: '在计算您的剩余额度时，我们会考虑多个因素：您作为客户的任期、您在注册时提供的业务相关信息以及您企业银行账户中的可用现金。您的剩余额度可能会每天波动。',
            earnedCashback: '现金返还',
            earnedCashbackDescription: '返现余额基于您的工作区内已结算的每月Expensify卡消费。',
            issueNewCard: '发行新卡',
            finishSetup: '完成设置',
            chooseBankAccount: '选择银行账户',
            chooseExistingBank: '选择一个现有的企业银行账户来支付您的Expensify卡余额，或添加一个新的银行账户。',
            accountEndingIn: '账户末尾为',
            addNewBankAccount: '添加新的银行账户',
            settlementAccount: '结算账户',
            settlementAccountDescription: '选择一个账户来支付您的Expensify卡余额。',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `确保该账户与<a href="${reconciliationAccountSettingsLink}">对账账户</a> (${accountNumber}) 一致，以便连续对账正常工作。`,
            settlementFrequency: '结算频率',
            settlementFrequencyDescription: '选择您支付 Expensify Card 余额的频率。',
            settlementFrequencyInfo: '如果您想切换到每月结算，您需要通过Plaid连接您的银行账户，并拥有90天的正余额历史记录。',
            frequency: {
                daily: '每日',
                monthly: '每月',
            },
            cardDetails: '卡片详情',
            cardPending: ({name}: {name: string}) => `卡片目前待处理，将在验证${name}的账户后发放。`,
            virtual: 'Virtual',
            physical: '物理的',
            deactivate: '停用卡片',
            changeCardLimit: '更改卡片限额',
            changeLimit: '更改限制',
            smartLimitWarning: ({limit}: CharacterLimitParams) => `如果您将此卡的限额更改为${limit}，新的交易将被拒绝，直到您批准卡上的更多费用。`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) => `如果您将此卡的限额更改为${limit}，新的交易将被拒绝，直到下个月。`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `如果您将此卡的限额更改为${limit}，新的交易将被拒绝。`,
            changeCardLimitType: '更改卡片限额类型',
            changeLimitType: '更改限制类型',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) => `如果您将此卡的限额类型更改为智能限额，新交易将被拒绝，因为未批准的限额${limit}已达到。`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) => `如果您将此卡的限额类型更改为每月，由于已达到${limit}的每月限额，新交易将被拒绝。`,
            addShippingDetails: '添加运输详情',
            issuedCard: ({assignee}: AssigneeParams) => `已为${assignee}发放了一张Expensify卡！该卡将在2-3个工作日内送达。`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) => `已向${assignee}发放一张 Expensify Card！确认运送信息后将寄出该卡。`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `已向${assignee}发放了一张虚拟${link}！该卡可以立即使用。`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} 已添加发货详情。Expensify Card 将在 2-3 个工作日内送达。`,
            verifyingHeader: '验证中',
            bankAccountVerifiedHeader: '银行账户已验证',
            verifyingBankAccount: '正在验证银行账户...',
            verifyingBankAccountDescription: '请稍候，我们正在确认此账户是否可以用于发行Expensify卡。',
            bankAccountVerified: '银行账户已验证！',
            bankAccountVerifiedDescription: '您现在可以向您的工作区成员发放Expensify卡。',
            oneMoreStep: '再进一步...',
            oneMoreStepDescription: '看起来我们需要手动验证您的银行账户。请前往Concierge查看您的指示。',
            gotIt: '明白了',
            goToConcierge: '前往Concierge',
        },
        categories: {
            deleteCategories: '删除类别',
            deleteCategoriesPrompt: '您确定要删除这些类别吗？',
            deleteCategory: '删除类别',
            deleteCategoryPrompt: '您确定要删除此类别吗？',
            disableCategories: '禁用类别',
            disableCategory: '禁用类别',
            enableCategories: '启用类别',
            enableCategory: '启用类别',
            defaultSpendCategories: '默认支出类别',
            spendCategoriesDescription: '自定义信用卡交易和扫描收据的商家支出分类方式。',
            deleteFailureMessage: '删除类别时发生错误，请重试。',
            categoryName: '类别名称',
            requiresCategory: '成员必须对所有费用进行分类',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) => `所有费用必须分类才能导出到${connectionName}。`,
            subtitle: '更好地了解资金的支出情况。使用我们的默认类别或添加您自己的类别。',
            emptyCategories: {
                title: '您尚未创建任何类别',
                subtitle: '添加一个类别来组织您的支出。',
                subtitleWithAccounting: ({accountingPageURL}: EmptyCategoriesSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>您的类别目前是从会计连接导入的。请前往<a href="${accountingPageURL}">会计</a>部门进行更改。</centered-text></muted-text>`,
            },
            updateFailureMessage: '更新类别时发生错误，请重试。',
            createFailureMessage: '创建类别时发生错误，请重试。',
            addCategory: '添加类别',
            editCategory: '编辑类别',
            editCategories: '编辑类别',
            findCategory: '查找类别',
            categoryRequiredError: '类别名称是必需的',
            existingCategoryError: '已存在同名类别',
            invalidCategoryName: '无效的类别名称',
            importedFromAccountingSoftware: '以下类别是从您的系统中导入的',
            payrollCode: '工资代码',
            updatePayrollCodeFailureMessage: '更新工资代码时发生错误，请重试。',
            glCode: 'GL代码',
            updateGLCodeFailureMessage: '更新总账代码时发生错误，请重试。',
            importCategories: '导入类别',
            cannotDeleteOrDisableAllCategories: {
                title: '无法删除或禁用所有类别',
                description: `由于您的工作区需要类别，至少必须启用一个类别。`,
            },
        },
        moreFeatures: {
            subtitle: '使用下面的切换按钮来启用更多功能。每个功能都会出现在导航菜单中以供进一步自定义。',
            spendSection: {
                title: '花费',
                subtitle: '启用帮助您扩展团队的功能。',
            },
            manageSection: {
                title: '管理',
                subtitle: '添加控制措施以帮助将支出保持在预算内。',
            },
            earnSection: {
                title: '赚取',
                subtitle: '简化您的收入流程，加快付款速度。',
            },
            organizeSection: {
                title: '组织',
                subtitle: '分组和分析支出，记录每一笔缴纳的税款。',
            },
            integrateSection: {
                title: '集成',
                subtitle: '将 Expensify 连接到流行的金融产品。',
            },
            distanceRates: {
                title: '距离费率',
                subtitle: '添加、更新和执行费率。',
            },
            perDiem: {
                title: '每日津贴',
                subtitle: '设置每日津贴标准以控制员工的日常开支。',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: '获取支出洞察和控制权。',
                disableCardTitle: '禁用 Expensify Card',
                disableCardPrompt: '您无法禁用 Expensify Card，因为它已在使用中。请联系 Concierge 以获取下一步操作。',
                disableCardButton: '与Concierge聊天',
                feed: {
                    title: '获取Expensify卡',
                    subTitle: '简化您的企业费用管理，并节省多达50%的Expensify账单，此外：',
                    features: {
                        cashBack: '美国每笔消费都有现金返还',
                        unlimited: '无限虚拟卡',
                        spend: '支出控制和自定义限制',
                    },
                    ctaTitle: '发行新卡',
                },
            },
            companyCards: {
                title: '公司卡片',
                subtitle: '从现有公司卡导入支出。',
                feed: {
                    title: '导入公司卡片',
                    features: {
                        support: '支持所有主要的信用卡提供商',
                        assignCards: '将卡片分配给整个团队',
                        automaticImport: '自动交易导入',
                    },
                },
                bankConnectionError: '银行连接问题',
                connectWithPlaid: '通过 Plaid 连接',
                connectWithExpensifyCard: '尝试使用 Expensify 卡',
                bankConnectionDescription: '请尝试重新添加您的卡。否则，您可以',
                disableCardTitle: '禁用公司卡',
                disableCardPrompt: '您无法禁用公司卡，因为此功能正在使用中。请联系Concierge以获取下一步指导。',
                disableCardButton: '与Concierge聊天',
                cardDetails: '卡片详情',
                cardNumber: '卡号',
                cardholder: '持卡人',
                cardName: '卡片名称',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} 导出` : `${integration} 导出`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `选择应导出交易的${integration}账户。`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `选择应导出交易的${integration}账户。选择不同的<a href="${exportPageLink}">导出选项</a>，更改可用账户。`,
                lastUpdated: '最后更新',
                transactionStartDate: '交易开始日期',
                updateCard: '更新卡片',
                unassignCard: '取消分配卡片',
                unassign: '取消分配',
                unassignCardDescription: '取消分配此卡将从持卡人的账户中移除草稿报告中的所有交易。',
                assignCard: '分配卡片',
                cardFeedName: '卡片摘要名称',
                cardFeedNameDescription: '为卡片信息流取一个独特的名称，以便您能将其与其他信息流区分开来。',
                cardFeedTransaction: '删除交易记录',
                cardFeedTransactionDescription: '选择是否允许持卡人删除卡交易。新交易将遵循这些规则。',
                cardFeedRestrictDeletingTransaction: '限制删除交易',
                cardFeedAllowDeletingTransaction: '允许删除交易',
                removeCardFeed: '移除卡片信息流',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `删除 ${feedName} 提要`,
                removeCardFeedDescription: '您确定要移除此卡片源吗？这将取消分配所有卡片。',
                error: {
                    feedNameRequired: '卡片摘要名称是必需的',
                    statementCloseDateRequired: '请选择报表关闭日期。',
                },
                corporate: '限制删除交易',
                personal: '允许删除交易',
                setFeedNameDescription: '为卡片提要起一个独特的名字，以便您能将其与其他提要区分开来。',
                setTransactionLiabilityDescription: '启用后，持卡人可以删除卡交易。新交易将遵循此规则。',
                emptyAddedFeedTitle: '分配公司卡',
                emptyAddedFeedDescription: '开始为成员分配您的第一张卡。',
                pendingFeedTitle: `我们正在审核您的请求...`,
                pendingFeedDescription: `我们正在审核您的提要详情。完成后，我们会通过以下方式与您联系`,
                pendingBankTitle: '检查您的浏览器窗口',
                pendingBankDescription: ({bankName}: CompanyCardBankName) => `请通过刚刚打开的浏览器窗口连接到${bankName}。如果没有打开，`,
                pendingBankLink: '请点击这里',
                giveItNameInstruction: '给这张卡片起一个与众不同的名字。',
                updating: '正在更新...',
                noAccountsFound: '未找到账户',
                defaultCard: '默认卡片',
                downgradeTitle: `无法降级工作区`,
                downgradeSubTitle: `由于连接了多个卡片馈送（不包括Expensify卡），此工作区无法降级。请 <a href="#">仅保留一个卡片信息流</a> 继续。`,
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `请在${connection}中添加账户并再次同步连接。`,
                expensifyCardBannerTitle: '获取Expensify卡',
                expensifyCardBannerSubtitle: '享受每笔美国消费的现金返还，Expensify账单最高可享50%折扣，无限虚拟卡等更多优惠。',
                expensifyCardBannerLearnMoreButton: '了解更多',
                statementCloseDateTitle: '对账单关闭日期',
                statementCloseDateDescription: '让我们知道您的银行卡对账单何时关闭，我们将在 Expensify 中创建匹配的对账单。',
            },
            workflows: {
                title: '工作流程',
                subtitle: '配置支出如何被批准和支付。',
                disableApprovalPrompt: '此工作区的Expensify卡目前依赖审批来定义其智能限额。在禁用审批之前，请修改任何具有智能限额的Expensify卡的限额类型。',
            },
            invoices: {
                title: '发票',
                subtitle: '发送和接收发票。',
            },
            categories: {
                title: '类别',
                subtitle: '跟踪和组织支出。',
            },
            tags: {
                title: '标签',
                subtitle: '分类成本并跟踪可计费费用。',
            },
            taxes: {
                title: '税款',
                subtitle: '记录并申报可抵扣税款。',
            },
            reportFields: {
                title: '报告字段',
                subtitle: '为支出设置自定义字段。',
            },
            connections: {
                title: '会计',
                subtitle: '同步您的会计科目表及更多内容。',
            },
            receiptPartners: {
                title: '收据合作伙伴',
                subtitle: '自动导入收据。',
            },
            connectionsWarningModal: {
                featureEnabledTitle: '慢着...',
                featureEnabledText: '要启用或禁用此功能，您需要更改会计导入设置。',
                disconnectText: '要禁用会计功能，您需要从工作区断开会计连接。',
                manageSettings: '管理设置',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: '断开Uber连接',
                disconnectText: '要禁用此功能，请先断开Uber for Business集成。',
                description: '您确定要断开此集成吗？',
                confirmText: '明白了',
            },
            workflowWarningModal: {
                featureEnabledTitle: '慢着...',
                featureEnabledText: '此工作区的Expensify卡片依赖审批工作流程来定义其智能限额。\n\n请在禁用工作流程之前更改任何具有智能限额的卡片的限额类型。',
                confirmText: '前往Expensify卡片',
            },
            rules: {
                title: '规则',
                subtitle: '需要收据，标记高消费等。',
            },
        },
        reports: {
            reportsCustomTitleExamples: '示例：',
            customReportNamesSubtitle: `<muted-text>使用我们<a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">丰富的公式</a>自定义报告标题。</muted-text>`,
            customNameTitle: '默认报告标题',
            customNameDescription: `使用我们的<a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">丰富公式</a>，为费用报告选择自定义名称。`,
            customNameInputLabel: '名称',
            customNameEmailPhoneExample: '成员的电子邮件或电话：{report:submit:from}',
            customNameStartDateExample: '报告开始日期：{report:startdate}',
            customNameWorkspaceNameExample: '工作区名称：{report:workspacename}',
            customNameReportIDExample: '报告 ID: {report:id}',
            customNameTotalExample: '总计：{report:total}。',
            preventMembersFromChangingCustomNamesTitle: '禁止成员更改自定义报告名称',
        },
        reportFields: {
            addField: '添加字段',
            delete: '删除字段',
            deleteFields: '删除字段',
            findReportField: '查找报告字段',
            deleteConfirmation: '您确定要删除此报告字段吗？',
            deleteFieldsConfirmation: '您确定要删除这些报告字段吗？',
            emptyReportFields: {
                title: '您尚未创建任何报告字段',
                subtitle: '在报告中添加一个自定义字段（文本、日期或下拉菜单）。',
            },
            subtitle: '报告字段适用于所有支出，当您希望提示输入额外信息时，它们会很有帮助。',
            disableReportFields: '禁用报告字段',
            disableReportFieldsConfirmation: '您确定吗？文本和日期字段将被删除，列表将被禁用。',
            importedFromAccountingSoftware: '以下报告字段是从您的系统中导入的',
            textType: '文本',
            dateType: '日期',
            dropdownType: '列表',
            formulaType: '公式',
            textAlternateText: '添加一个字段用于自由文本输入。',
            dateAlternateText: '添加日历以选择日期。',
            dropdownAlternateText: '添加一个选项列表供选择。',
            formulaAlternateText: '添加一个公式字段。',
            nameInputSubtitle: '为报告字段选择一个名称。',
            typeInputSubtitle: '选择要使用的报告字段类型。',
            initialValueInputSubtitle: '输入一个起始值以显示在报告字段中。',
            listValuesInputSubtitle: '这些值将出现在您的报告字段下拉菜单中。成员可以选择启用的值。',
            listInputSubtitle: '这些值将出现在您的报告字段列表中。成员可以选择启用的值。',
            deleteValue: '删除值',
            deleteValues: '删除值',
            disableValue: '禁用值',
            disableValues: '禁用值',
            enableValue: '启用值',
            enableValues: '启用值',
            emptyReportFieldsValues: {
                title: '您尚未创建任何列表值',
                subtitle: '在报告中添加自定义值。',
            },
            deleteValuePrompt: '您确定要删除此列表值吗？',
            deleteValuesPrompt: '您确定要删除这些列表值吗？',
            listValueRequiredError: '请输入列表值名称',
            existingListValueError: '已存在具有此名称的列表值',
            editValue: '编辑值',
            listValues: '列出值',
            addValue: '增加价值',
            existingReportFieldNameError: '具有此名称的报表字段已存在',
            reportFieldNameRequiredError: '请输入报告字段名称',
            reportFieldTypeRequiredError: '请选择报告字段类型',
            circularReferenceError: '该字段不能引用自身。请更新。',
            reportFieldInitialValueRequiredError: '请选择报告字段的初始值',
            genericFailureMessage: '更新报告字段时发 生错误。请再试一次。',
        },
        tags: {
            tagName: '标签名称',
            requiresTag: '成员必须标记所有费用',
            trackBillable: '跟踪可计费费用',
            customTagName: '自定义标签名称',
            enableTag: '启用标签',
            enableTags: '启用标签',
            requireTag: 'Require tag',
            requireTags: '需要标签',
            notRequireTags: '不需要',
            disableTag: '禁用标签',
            disableTags: '禁用标签',
            addTag: '添加标签',
            editTag: '编辑标签',
            editTags: '编辑标签',
            findTag: '查找标签',
            subtitle: '标签提供了更详细的方法来分类费用。',
            dependentMultiLevelTagsSubtitle: ({importSpreadsheetLink}: DependentMultiLevelTagsSubtitleParams) =>
                `<muted-text>您使用的是<a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">从属标记</a>。您可以<a href="${importSpreadsheetLink}">重新导入电子表格</a>来更新标签。</muted-text>`,
            emptyTags: {
                title: '您尚未创建任何标签',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: '添加标签以跟踪项目、地点、部门等。',
                subtitleHTML: `<muted-text><centered-text>导入电子表格，为跟踪项目、地点、部门等添加标签。<a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">了解有关</a>标签文件格式的更多信息。</centered-text></muted-text>`,
                subtitleWithAccounting: ({accountingPageURL}: EmptyTagsSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>您的标签目前是从会计连接导入的。请前往<a href="${accountingPageURL}">会计</a>部门进行更改。</centered-text></muted-text>`,
            },
            deleteTag: '删除标签',
            deleteTags: '删除标签',
            deleteTagConfirmation: '您确定要删除此标签吗？',
            deleteTagsConfirmation: '您确定要删除这些标签吗？',
            deleteFailureMessage: '删除标签时发生错误，请重试',
            tagRequiredError: '标签名称是必需的',
            existingTagError: '具有此名称的标签已存在',
            invalidTagNameError: '标签名称不能为0。请选择其他值。',
            genericFailureMessage: '更新标签时发生错误，请重试。',
            importedFromAccountingSoftware: '以下标签是从您的...导入的',
            glCode: 'GL代码',
            updateGLCodeFailureMessage: '更新总账代码时发生错误，请重试。',
            tagRules: '标签规则',
            approverDescription: '审批人',
            importTags: '导入标签',
            importTagsSupportingText: '使用一种或多种标签对您的费用进行编码。',
            configureMultiLevelTags: '配置您的多级标签列表。',
            importMultiLevelTagsSupportingText: `这是您的标签预览。如果一切看起来不错，请点击下面导入它们。`,
            importMultiLevelTags: {
                firstRowTitle: '每个标签列表的第一行是标题。',
                independentTags: '这些是独立标签',
                glAdjacentColumn: '相邻列中有一个GL代码',
            },
            tagLevel: {
                singleLevel: '单级标签',
                multiLevel: '多级标签',
            },
            switchSingleToMultiLevelTagWarning: {
                title: '切换标签级别',
                prompt1: '切换标签级别将清除所有当前标签。',
                prompt2: '我们建议您首先',
                prompt3: '下载备份',
                prompt4: '通过导出您的标签。',
                prompt5: '了解更多',
                prompt6: '关于标签级别。',
            },
            overrideMultiTagWarning: {
                title: '导入标签',
                prompt1: '你确定吗？',
                prompt2: ' 现有标签将被覆盖，但您可以',
                prompt3: ' 下载备份文件',
                prompt4: ' 第一。',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `我们在您的电子表格中找到了*${columnCounts} 列*。在包含标签名称的列旁边选择*名称*。您还可以在设置标签状态的列旁边选择*启用*。`,
            cannotDeleteOrDisableAllTags: {
                title: '无法删除或禁用所有标签',
                description: `由于您的工作区需要标签，至少必须启用一个标签。`,
            },
            cannotMakeAllTagsOptional: {
                title: '无法将所有标签设为可选',
                description: `至少需要保留一个标签为必填项，因为您的工作区设置要求使用标签。`,
            },
            cannotMakeTagListRequired: {
                title: '无法强制要求标签列表',
                description: '仅当策略配置了多个标签级别时，才可将标签列表设为必填项。',
            },
            tagCount: () => ({
                one: '1 标签',
                other: (count: number) => `${count} 个标签`,
            }),
        },
        taxes: {
            subtitle: '添加税种名称、税率，并设置默认值。',
            addRate: '添加费率',
            workspaceDefault: '工作区默认货币',
            foreignDefault: '外币默认值',
            customTaxName: '自定义税名',
            value: '值',
            taxReclaimableOn: '可退税的',
            taxRate: '税率',
            findTaxRate: '查找税率',
            error: {
                taxRateAlreadyExists: '此税名已被使用',
                taxCodeAlreadyExists: '此税码已被使用',
                valuePercentageRange: '请输入0到100之间的有效百分比',
                customNameRequired: '自定义税名是必需的',
                deleteFailureMessage: '删除税率时发生错误。请重试或向Concierge寻求帮助。',
                updateFailureMessage: '更新税率时发生错误。请重试或向Concierge寻求帮助。',
                createFailureMessage: '创建税率时发生错误。请重试或向Concierge寻求帮助。',
                updateTaxClaimableFailureMessage: '可报销部分必须小于距离费率金额',
            },
            deleteTaxConfirmation: '您确定要删除此税项吗？',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `您确定要删除 ${taxAmount} 税款吗？`,
            actions: {
                delete: '删除费率',
                deleteMultiple: '删除费率',
                enable: '启用费率',
                disable: '禁用费率',
                enableTaxRates: () => ({
                    one: '启用费率',
                    other: '启用费率',
                }),
                disableTaxRates: () => ({
                    one: '禁用费率',
                    other: '禁用费率',
                }),
            },
            importedFromAccountingSoftware: '以下税费是从您的',
            taxCode: '税码',
            updateTaxCodeFailureMessage: '更新税码时发生错误，请重试',
        },
        duplicateWorkspace: {
            title: '命名您的新工作区',
            selectFeatures: '选择要复制的功能',
            whichFeatures: '您想要将哪些功能复制到您的新工作区？',
            confirmDuplicate: '\n\n您想继续吗？',
            categories: '类别和您的自动分类规则',
            reimbursementAccount: '报销账户',
            delayedSubmission: '延迟提交',
            welcomeNote: '请开始使用我的新工作区',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `您即将创建并与原始工作区中的 ${totalMembers ?? 0} 名成员共享 ${newWorkspaceName ?? ''}。`,
            error: '复制新工作区时出错。请重试。',
        },
        emptyWorkspace: {
            title: '您没有任何工作区',
            subtitle: '跟踪收据、报销费用、管理差旅、发送发票等。',
            createAWorkspaceCTA: '开始使用',
            features: {
                trackAndCollect: '跟踪并收集收据',
                reimbursements: '报销员工',
                companyCards: '管理公司卡片',
            },
            notFound: '未找到工作区',
            description: '聊天室是一个与多人讨论和合作的好地方。要开始协作，请创建或加入一个工作区。',
        },
        new: {
            newWorkspace: '新工作区',
            getTheExpensifyCardAndMore: '获取Expensify卡及更多内容',
            confirmWorkspace: '确认工作区',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `我的群组工作区${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `${userName}的工作区${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: '从工作区移除成员时发生错误，请重试。',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `您确定要移除${memberName}吗？`,
                other: '您确定要移除这些成员吗？',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} 是此工作区的审批人。当您取消与他们共享此工作区时，我们将用工作区所有者 ${ownerName} 替换他们在审批流程中的角色。`,
            removeMembersTitle: () => ({
                one: '移除成员',
                other: '移除成员',
            }),
            findMember: '查找成员',
            removeWorkspaceMemberButtonTitle: '从工作区移除',
            removeGroupMemberButtonTitle: '从群组中移除',
            removeRoomMemberButtonTitle: '从聊天中移除',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `您确定要移除${memberName}吗？`,
            removeMemberTitle: '移除成员',
            transferOwner: '转移所有者',
            makeMember: '成为成员',
            makeAdmin: '设为管理员',
            makeAuditor: '创建审计员',
            selectAll: '全选',
            error: {
                genericAdd: '添加此工作区成员时出现问题。',
                cannotRemove: '您无法移除自己或工作区所有者',
                genericRemove: '移除该工作区成员时出现问题。',
            },
            addedWithPrimary: '一些成员已使用他们的主要登录信息添加。',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `由次要登录 ${secondaryLogin} 添加。`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `工作区成员总数：${count}`,
            importMembers: '导入成员',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `如果您从此工作区移除${approver}，我们会在审批流程中将其替换为工作区所有者${workspaceOwner}。`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) => `${memberName} 有待审批的报销单。请让他们先批准，或在将其从工作区移除之前接管他们的报销单。`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) => `您无法从此工作区中移除${memberName}。请在 工作流程 > 进行或跟踪付款 中设置新的报销付款人，然后重试。`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `如果你将${memberName}从此工作区移除，我们会由工作区所有者${workspaceOwner}接任首选导出人。`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `如果你将${memberName}从此工作区移除，我们会用工作区所有者${workspaceOwner}替代其作为技术联系人。`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) => `${memberName} 有一份待处理的报告需要其处理。请在将其从工作区移除之前，要求其完成所需操作。`,
        },
        card: {
            getStartedIssuing: '通过申请您的第一张虚拟或实体卡来开始。',
            issueCard: '发卡',
            issueNewCard: {
                whoNeedsCard: '谁需要一张卡？',
                inviteNewMember: '邀请新成员',
                findMember: '查找成员',
                chooseCardType: '选择卡类型',
                physicalCard: '实体卡',
                physicalCardDescription: '非常适合经常消费的人',
                virtualCard: '虚拟卡',
                virtualCardDescription: '即时且灵活',
                chooseLimitType: '选择限制类型',
                smartLimit: '智能限额',
                smartLimitDescription: '在需要批准之前花费不超过某个金额',
                monthly: '每月',
                monthlyDescription: '每月花费不超过一定金额',
                fixedAmount: '固定金额',
                fixedAmountDescription: '仅限一次性支出至某个金额',
                setLimit: '设置限制',
                cardLimitError: '请输入小于 $21,474,836 的金额',
                giveItName: '给它起个名字',
                giveItNameInstruction: '使其足够独特，以便与其他卡片区分开来。具体的使用案例更佳！',
                cardName: '卡片名称',
                letsDoubleCheck: '让我们仔细检查一下，确保一切正常。',
                willBeReady: '此卡将立即可用。',
                cardholder: '持卡人',
                cardType: '卡类型',
                limit: '限制',
                limitType: '限制类型',
                name: '名称',
                disabledApprovalForSmartLimitError: '请在<strong>工作流程 > 添加审批</strong>中启用审批，然后再设置智能限制',
            },
            deactivateCardModal: {
                deactivate: '停用',
                deactivateCard: '停用卡片',
                deactivateConfirmation: '停用此卡将拒绝所有未来的交易，并且无法撤销。',
            },
        },
        accounting: {
            settings: '设置',
            title: '连接',
            subtitle: '连接到您的会计系统，以使用您的科目表对交易进行编码，自动匹配付款，并保持您的财务同步。',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: '与您的设置专家聊天。',
            talkYourAccountManager: '与您的客户经理聊天。',
            talkToConcierge: '与Concierge聊天。',
            needAnotherAccounting: '需要其他会计软件吗？',
            connectionName: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return 'Sage Intacct';
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: ({oldDotPolicyConnectionsURL}: ErrorODIntegrationParams) =>
                `在 Expensify Classic 中设置的连接出现错误。[请前往 Expensify Classic 解决此问题。](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: '请前往 Expensify Classic 管理您的设置。',
            setup: '连接',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `上次同步时间为${relativeDate}`,
            notSync: '未同步',
            import: '导入',
            export: '导出',
            advanced: '高级',
            other: '其他',
            syncNow: '立即同步',
            disconnect: '断开连接',
            reinstall: '重新安装连接器',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName = connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '集成';
                return `断开 ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '会计集成'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return '无法连接到 QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return '无法连接到Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return '无法连接到 NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return '无法连接到 QuickBooks Desktop';
                    default: {
                        return '无法连接到集成';
                    }
                }
            },
            accounts: '科目表',
            taxes: '税款',
            imported: '已导入',
            notImported: '未导入',
            importAsCategory: '导入为类别',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: '已导入',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: '导入为标签',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: '已导入',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: '未导入',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: '未导入',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: '作为报告字段导入',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'NetSuite 员工默认值',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '此集成';
                return `您确定要断开 ${integrationName} 吗？`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `您确定要连接${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '此会计集成'}吗？这将移除任何现有的会计连接。`,
            enterCredentials: '输入您的凭证',
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return '导入客户';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return '导入员工';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return '导入账户';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return '导入类别';
                        case 'quickbooksOnlineImportLocations':
                            return '导入位置';
                        case 'quickbooksOnlineImportProcessing':
                            return '正在处理导入的数据';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '同步已报销报告和账单支付';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '导入税码';
                        case 'quickbooksOnlineCheckConnection':
                            return '检查 QuickBooks Online 连接';
                        case 'quickbooksOnlineImportMain':
                            return '导入 QuickBooks Online 数据';
                        case 'startingImportXero':
                            return '导入Xero数据';
                        case 'startingImportQBO':
                            return '导入 QuickBooks Online 数据';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return '导入 QuickBooks Desktop 数据';
                        case 'quickbooksDesktopImportTitle':
                            return '导入标题';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '导入批准证书';
                        case 'quickbooksDesktopImportDimensions':
                            return '导入维度';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '导入保存策略';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return '仍在与QuickBooks同步数据... 请确保Web Connector正在运行';
                        case 'quickbooksOnlineSyncTitle':
                            return '同步 QuickBooks Online 数据';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return '正在加载数据';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return '更新类别';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '更新客户/项目';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return '更新人员列表';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return '更新报告字段';
                        case 'jobDone':
                            return '正在等待导入的数据加载';
                        case 'xeroSyncImportChartOfAccounts':
                            return '同步会计科目表';
                        case 'xeroSyncImportCategories':
                            return '同步类别';
                        case 'xeroSyncImportCustomers':
                            return '同步客户';
                        case 'xeroSyncXeroReimbursedReports':
                            return '将Expensify报告标记为已报销';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return '将 Xero 账单和发票标记为已支付';
                        case 'xeroSyncImportTrackingCategories':
                            return '同步跟踪类别';
                        case 'xeroSyncImportBankAccounts':
                            return '同步银行账户';
                        case 'xeroSyncImportTaxRates':
                            return '同步税率';
                        case 'xeroCheckConnection':
                            return '检查 Xero 连接';
                        case 'xeroSyncTitle':
                            return '正在同步 Xero 数据';
                        case 'netSuiteSyncConnection':
                            return '正在初始化与NetSuite的连接';
                        case 'netSuiteSyncCustomers':
                            return '导入客户';
                        case 'netSuiteSyncInitData':
                            return '从NetSuite检索数据';
                        case 'netSuiteSyncImportTaxes':
                            return '导入税款';
                        case 'netSuiteSyncImportItems':
                            return '导入项目';
                        case 'netSuiteSyncData':
                            return '将数据导入Expensify';
                        case 'netSuiteSyncAccounts':
                            return '同步账户';
                        case 'netSuiteSyncCurrencies':
                            return '同步货币种类';
                        case 'netSuiteSyncCategories':
                            return '同步类别';
                        case 'netSuiteSyncReportFields':
                            return '将数据导入为Expensify报告字段';
                        case 'netSuiteSyncTags':
                            return '将数据导入为Expensify标签';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '更新连接信息';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return '将Expensify报告标记为已报销';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return '将 NetSuite 账单和发票标记为已支付';
                        case 'netSuiteImportVendorsTitle':
                            return '导入供应商';
                        case 'netSuiteImportCustomListsTitle':
                            return '导入自定义列表';
                        case 'netSuiteSyncImportCustomLists':
                            return '导入自定义列表';
                        case 'netSuiteSyncImportSubsidiaries':
                            return '导入子公司';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return '导入供应商';
                        case 'intacctCheckConnection':
                            return '检查 Sage Intacct 连接';
                        case 'intacctImportDimensions':
                            return '导入 Sage Intacct 维度';
                        case 'intacctImportTitle':
                            return '导入 Sage Intacct 数据';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `阶段的翻译缺失：${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '首选导出工具',
            exportPreferredExporterNote: '首选导出者可以是任何工作区管理员，但如果您在域设置中为单个公司卡设置不同的导出账户，则必须也是域管理员。',
            exportPreferredExporterSubNote: '一旦设置，首选导出者将在其账户中看到可导出的报告。',
            exportAs: '导出为',
            exportOutOfPocket: '导出自付费用为',
            exportCompanyCard: '将公司卡费用导出为',
            exportDate: '导出日期',
            defaultVendor: '默认供应商',
            autoSync: '自动同步',
            autoSyncDescription: '每天自动同步 NetSuite 和 Expensify。实时导出最终报告。',
            reimbursedReports: '同步已报销的报告',
            cardReconciliation: '卡片对账',
            reconciliationAccount: '对账账户',
            continuousReconciliation: '持续对账',
            saveHoursOnReconciliation: '通过让Expensify持续为您对账Expensify卡的对账单和结算，您可以在每个会计期间节省数小时的对账时间。',
            enableContinuousReconciliation: ({accountingAdvancedSettingsLink, connectionName}: EnableContinuousReconciliationParams) =>
                `<muted-text-label>要启用持续对账，请启用 ${connectionName} 的<a href="${accountingAdvancedSettingsLink}">自动同步</a>功能。</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: '选择用于对账您的 Expensify Card 支付的银行账户。',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `确保此账户与您的<a href="${settlementAccountUrl}">Expensify Card 结算账户</a>（以 ${lastFourPAN} 结尾）匹配，以便持续对账正常工作。`,
            },
        },
        export: {
            notReadyHeading: '尚未准备好导出',
            notReadyDescription: '草稿或待处理的费用报告无法导出到会计系统。请在导出之前批准或支付这些费用。',
        },
        invoices: {
            sendInvoice: '发送发票',
            sendFrom: '发送自',
            invoicingDetails: '发票详情',
            invoicingDetailsDescription: '此信息将显示在您的发票上。',
            companyName: '公司名称',
            companyWebsite: '公司网站',
            paymentMethods: {
                personal: '个人',
                business: '商务',
                chooseInvoiceMethod: '请选择以下付款方式：',
                payingAsIndividual: '以个人身份付款',
                payingAsBusiness: '以企业身份付款',
            },
            invoiceBalance: '发票余额',
            invoiceBalanceSubtitle: '这是您通过收取发票付款获得的当前余额。如果您已添加银行账户，它将自动转入您的银行账户。',
            bankAccountsSubtitle: '添加银行账户以进行和接收发票付款。',
        },
        invite: {
            member: '邀请成员',
            members: '邀请成员',
            invitePeople: '邀请新成员',
            genericFailureMessage: '邀请成员加入工作区时发生错误。请再试一次。',
            pleaseEnterValidLogin: `请确保电子邮件或电话号码有效（例如 ${CONST.EXAMPLE_PHONE_NUMBER}）。`,
            user: '用户',
            users: '用户',
            invited: '邀请',
            removed: 'removed',
            to: '到',
            from: '从',
        },
        inviteMessage: {
            confirmDetails: '确认详情',
            inviteMessagePrompt: '通过在下方添加消息，使您的邀请更加特别！',
            personalMessagePrompt: '消息',
            genericFailureMessage: '邀请成员加入工作区时发生错误。请再试一次。',
            inviteNoMembersError: '请选择至少一位成员进行邀请',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} 请求加入 ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: '哎呀！别这么快...',
            workspaceNeeds: '工作区至少需要一个启用的距离费率。',
            distance: '距离',
            centrallyManage: '集中管理费率，跟踪英里或公里，并设置默认类别。',
            rate: '费率',
            addRate: '添加费率',
            findRate: '查找费率',
            trackTax: '跟踪税款',
            deleteRates: () => ({
                one: '删除费率',
                other: '删除费率',
            }),
            enableRates: () => ({
                one: '启用费率',
                other: '启用费率',
            }),
            disableRates: () => ({
                one: '禁用费率',
                other: '禁用费率',
            }),
            enableRate: '启用费率',
            status: '状态',
            unit: '单位',
            taxFeatureNotEnabledMessage: '<muted-text>要使用此功能，必须在工作区启用税费。前往 <a href="#">更多功能</a> 进行该更改。</muted-text>',
            deleteDistanceRate: '删除距离费率',
            areYouSureDelete: () => ({
                one: '您确定要删除此费率吗？',
                other: '您确定要删除这些费率吗？',
            }),
            errors: {
                rateNameRequired: '费率名称是必需的',
                existingRateName: '具有此名称的距离费率已存在',
            },
        },
        editor: {
            descriptionInputLabel: '描述',
            nameInputLabel: '名称',
            typeInputLabel: '类型',
            initialValueInputLabel: '初始值',
            nameInputHelpText: '这是您将在工作区中看到的名称。',
            nameIsRequiredError: '您需要为您的工作区命名',
            currencyInputLabel: '默认货币',
            currencyInputHelpText: '此工作区的所有费用将转换为此货币。',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) => `无法更改默认货币，因为此工作区已链接到${currency}银行账户。`,
            save: '保存',
            genericFailureMessage: '更新工作区时发生错误。请再试一次。',
            avatarUploadFailureMessage: '上传头像时发生错误。请再试一次。',
            addressContext: '启用 Expensify Travel 需要一个工作区地址。请输入与您的业务相关的地址。',
            policy: '费用政策',
        },
        bankAccount: {
            continueWithSetup: '继续设置',
            youAreAlmostDone: '您几乎完成了银行账户的设置，这将使您能够发行公司卡、报销费用、收集发票和支付账单。',
            streamlinePayments: '简化支付流程',
            connectBankAccountNote: '注意：个人银行账户不能用于工作区的付款。',
            oneMoreThing: '还有一件事！',
            allSet: '一切就绪！',
            accountDescriptionWithCards: '此银行账户将用于发行公司卡、报销费用、收取发票和支付账单。',
            letsFinishInChat: '让我们在聊天中完成！',
            finishInChat: '完成聊天',
            almostDone: '快完成了！',
            disconnectBankAccount: '断开银行账户连接',
            startOver: '重新开始',
            updateDetails: '更新详细信息',
            yesDisconnectMyBankAccount: '是的，断开我的银行账户连接',
            yesStartOver: '是的，重新开始',
            disconnectYourBankAccount: ({bankName}: DisconnectYourBankAccountParams) => `断开您的 <strong>${bankName}</strong> 银行账户。此账户的任何未完成交易仍将完成。`,
            clearProgress: '重新开始将清除您迄今为止取得的进度。',
            areYouSure: '你确定吗？',
            workspaceCurrency: '工作区货币',
            updateCurrencyPrompt: '您的工作区当前设置为不同于USD的货币。请点击下面的按钮立即将您的货币更新为USD。',
            updateToUSD: '更新为美元',
            updateWorkspaceCurrency: '更新工作区货币',
            workspaceCurrencyNotSupported: '工作区货币不支持',
            yourWorkspace: `您的工作区设置为不支持的货币。查看<a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">支持货币列表</a>。`,
            chooseAnExisting: '选择现有银行账户支付费用或添加新账户。',
        },
        changeOwner: {
            changeOwnerPageTitle: '转移所有者',
            addPaymentCardTitle: '输入您的支付卡以转移所有权',
            addPaymentCardButtonText: '接受条款并添加支付卡',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>阅读并接受<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">条款</a>和<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">隐私</a> 政策，添加您的会员卡。</muted-text-micro>`,
            addPaymentCardPciCompliant: '符合PCI-DSS标准',
            addPaymentCardBankLevelEncrypt: '银行级加密',
            addPaymentCardRedundant: '冗余基础设施',
            addPaymentCardLearnMore: `<muted-text>进一步了解我们的<a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">安全性</a>。</muted-text>`,
            amountOwedTitle: '未结余额',
            amountOwedButtonText: '好的',
            amountOwedText: '此账户有上个月未结清的余额。\n\n您是否想清除余额并接管此工作区的账单？',
            ownerOwesAmountTitle: '未结余额',
            ownerOwesAmountButtonText: '转账余额',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `拥有此工作区的账户（${email}）有上个月未结清的余额。\n\n您是否希望转移此金额（${amount}）以接管此工作区的账单？您的支付卡将立即被扣款。`,
            subscriptionTitle: '接管年度订阅',
            subscriptionButtonText: '转移订阅',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `接管此工作区将把其年度订阅与您当前的订阅合并。这将使您的订阅人数增加${usersCount}名成员，使您的新订阅人数达到${finalCount}。您想继续吗？`,
            duplicateSubscriptionTitle: '重复订阅提醒',
            duplicateSubscriptionButtonText: '继续',
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `您似乎正在尝试接管 ${email} 的工作区的账单，但要做到这一点，您需要先成为他们所有工作区的管理员。\n\n如果您只想接管工作区 ${workspaceName} 的账单，请点击“继续”。\n\n如果您想接管他们整个订阅的账单，请先让他们将您添加为所有工作区的管理员，然后再接管账单。`,
            hasFailedSettlementsTitle: '无法转移所有权',
            hasFailedSettlementsButtonText: '明白了',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `您无法接管账单，因为${email}有一笔逾期的Expensify Card结算。请让他们联系concierge@expensify.com解决此问题。然后，您就可以接管此工作区的账单。`,
            failedToClearBalanceTitle: '清除余额失败',
            failedToClearBalanceButtonText: '好的',
            failedToClearBalanceText: '我们无法清除余额。请稍后再试。',
            successTitle: '哇哦！一切就绪。',
            successDescription: '您现在是此工作区的所有者。',
            errorTitle: '哎呀！别这么快...',
            errorDescription: `<muted-text><centered-text>该工作区所有权的转移出现问题。请重试，或<concierge-link>联系 Concierge </concierge-link>寻求帮助。</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '小心！',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `以下报告已经导出到${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}：\n\n${reportName}\n\n您确定要再次导出它们吗？`,
            confirmText: '是的，再次导出',
            cancelText: '取消',
        },
        upgrade: {
            reportFields: {
                title: '报告字段',
                description: `报告字段允许您指定标题级别的详细信息，与适用于单个项目费用的标签不同。这些详细信息可以包括特定的项目名称、商务旅行信息、地点等。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>报告字段仅在Control计划中可用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `通过 Expensify + NetSuite 集成享受自动同步并减少手动输入。通过原生和自定义分段支持（包括项目和客户映射），获得深入的实时财务洞察。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>我们的 NetSuite 集成仅在 Control 计划中可用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `通过Expensify + Sage Intacct集成，享受自动同步并减少手动输入。通过用户定义的维度，以及按部门、类别、地点、客户和项目（工作）进行的费用编码，获得深入的实时财务洞察。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>我们的 Sage Intacct 集成仅在 Control 计划中可用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `通过Expensify与QuickBooks Desktop的集成，享受自动同步并减少手动输入。通过实时双向连接以及按类别、项目、客户和项目的费用编码，实现终极效率。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>我们的 QuickBooks Desktop 集成仅在 Control 计划中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '高级审批',
                description: `如果您想在审批流程中增加更多层级，或者只是想确保最大额的费用能被再次审核，我们可以满足您的需求。高级审批帮助您在每个层级设置适当的检查，以便控制团队的支出。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>高级审批仅在Control计划中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            categories: {
                title: '类别',
                description: '类别允许您跟踪和整理支出。使用我们的默认类别或添加您自己的类别。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>类别在 Collect 计划中可用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            glCodes: {
                title: 'GL代码',
                description: `为您的类别和标签添加总账代码，以便轻松将费用导出到您的会计和工资系统。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL 代码仅在 Control 计划中可用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'GL 和工资代码',
                description: `为您的类别添加 GL 和工资代码，以便轻松将费用导出到您的会计和工资系统。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL 和工资代码仅在 Control 计划中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            taxCodes: {
                title: '税码',
                description: `将税码添加到您的税款中，以便轻松将费用导出到您的会计和工资系统。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>税码仅在起价为的Control计划中提供， <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            companyCards: {
                title: '无限公司卡',
                description: `需要添加更多的卡片信息流吗？解锁无限公司卡，以同步所有主要发卡机构的交易。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>这仅在Control计划中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            rules: {
                title: '规则',
                description: `规则在后台运行，帮助您控制支出，因此您无需为小事操心。\n\n要求提供收据和描述等费用详情，设置限制和默认值，并自动化审批和支付——所有这些都在一个地方完成。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>规则仅在控制计划中可用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            perDiem: {
                title: '每日津贴',
                description: '每日津贴是确保员工出差时日常费用合规且可预测的好方法。享受自定义费率、默认类别以及更详细的信息，如目的地和子费率等功能。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>每日津贴仅在Control计划中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            travel: {
                title: '旅行',
                description: 'Expensify Travel 是一个新的企业差旅预订和管理平台，允许会员预订住宿、航班、交通等。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>旅行功能在 Collect 计划中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            reports: {
                title: '报告',
                description: '报告允许您对费用进行分组，以便更容易地跟踪和整理。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>报告功能在 Collect 计划中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            multiLevelTags: {
                title: '多级标签',
                description: '多级标签帮助您更精确地跟踪费用。为每个项目分配多个标签，例如部门、客户或成本中心，以捕获每笔费用的完整上下文。这使得更详细的报告、审批流程和会计导出成为可能。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>多级标签仅在Control计划中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            distanceRates: {
                title: '距离费率',
                description: '创建和管理您自己的费率，以英里或公里为单位进行跟踪，并为距离费用设置默认类别。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>在 Collect 计划中提供的距离费率，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            auditor: {
                title: '审计员',
                description: '审计员可对所有报告进行只读访问，以实现全面可见性和合规监控。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>审计员仅在 Control 计划中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '多级审批',
                description: '多级审批是一种工作流工具，适用于要求一人以上审批报销单后才能进行报销的公司。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>多级审批仅在 Control 套餐上提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            pricing: {
                perActiveMember: '每位活跃成员每月。',
                perMember: '每位成员每月。',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) => `<muted-text>升级即可使用该功能，或<a href="${subscriptionLink}">进一步了解</a>我们的计划和定价。</muted-text>`,
            upgradeToUnlock: '解锁此功能',
            completed: {
                headline: `您的工作区已升级！`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>您已成功将 ${policyName} 升级到控制计划！<a href="${subscriptionLink}">查看订阅详情</a>。</centered-text>`,
                categorizeMessage: `您已成功升级到 Collect 计划。现在您可以对您的费用进行分类了！`,
                travelMessage: `您已成功升级到 Collect 计划。现在您可以开始预订和管理旅行了！`,
                distanceRateMessage: `您已成功升级到 Collect 计划。现在您可以更改距离费率了！`,
                gotIt: '知道了，谢谢',
                createdWorkspace: '您已创建工作区！',
            },
            commonFeatures: {
                title: '升级到Control计划',
                note: '解锁我们最强大的功能，包括：',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Control 计划起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`} <a href="${learnMoreMethodsRoute}">了解更多</a> 关于我们的计划和定价。</muted-text>`,
                    benefit1: '高级会计连接（NetSuite、Sage Intacct 等）',
                    benefit2: '智能费用规则',
                    benefit3: '多级审批工作流程',
                    benefit4: '增强的安全控制',
                    toUpgrade: '要升级，请点击',
                    selectWorkspace: '选择一个工作区，并将计划类型更改为',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: '降级到Collect计划',
                note: '如果您降级，您将失去对这些功能及更多功能的访问权限：',
                benefits: {
                    note: '要查看我们计划的完整对比，请查看我们的',
                    pricingPage: '定价页面',
                    confirm: '您确定要降级并删除您的配置吗？',
                    warning: '此操作无法撤销。',
                    benefit1: '会计连接（QuickBooks Online 和 Xero 除外）',
                    benefit2: '智能费用规则',
                    benefit3: '多级审批工作流程',
                    benefit4: '增强的安全控制',
                    headsUp: '注意！',
                    multiWorkspaceNote: '在您的第一次月度付款之前，您需要将所有工作区降级，以便以 Collect 费率开始订阅。点击',
                    selectStep: '> 选择每个工作区 > 将计划类型更改为',
                },
            },
            completed: {
                headline: '您的工作区已被降级',
                description: '您在控制计划中有其他工作区。要按收集费率计费，您必须降级所有工作区。',
                gotIt: '知道了，谢谢',
            },
        },
        payAndDowngrade: {
            title: '支付和降级',
            headline: '您的最终付款',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `您本次订阅的最终账单金额为 <strong>${formattedAmount}</strong>`,
            description2: ({date}: DateParams) => `查看您在${date}的明细：`,
            subscription: '注意！此操作将终止您的Expensify订阅，删除此工作区，并移除所有工作区成员。如果您只想移除自己并保留此工作区，请先让其他管理员接管账单。',
            genericFailureMessage: '支付账单时发生错误。请重试。',
        },
        restrictedAction: {
            restricted: 'Restricted',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `对${workspaceName}工作区的操作目前受到限制。`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `工作区所有者 ${workspaceOwnerName} 需要添加或更新档案中的支付卡，以解锁新的工作区活动。`,
            youWillNeedToAddOrUpdatePaymentCard: '您需要添加或更新档案中的支付卡，以解锁新的工作区活动。',
            addPaymentCardToUnlock: '添加付款卡以解锁！',
            addPaymentCardToContinueUsingWorkspace: '添加支付卡以继续使用此工作区',
            pleaseReachOutToYourWorkspaceAdmin: '如有任何问题，请联系您的工作区管理员。',
            chatWithYourAdmin: '与您的管理员聊天',
            chatInAdmins: '在#admins中聊天',
            addPaymentCard: '添加支付卡',
            goToSubscription: '前往订阅',
        },
        rules: {
            individualExpenseRules: {
                title: '费用',
                subtitle: ({categoriesPageLink, tagsPageLink}: IndividualExpenseRulesSubtitleParams) =>
                    `<muted-text>为单项支出设置支出控制和默认值。您还可以为<a href="${categoriesPageLink}">类别</a>和<a href="${tagsPageLink}">标签</a>创建规则。</muted-text>`,
                receiptRequiredAmount: '所需收据金额',
                receiptRequiredAmountDescription: '当支出超过此金额时需要收据，除非被类别规则覆盖。',
                maxExpenseAmount: '最大报销金额',
                maxExpenseAmountDescription: '标记超过此金额的支出，除非被类别规则覆盖。',
                maxAge: '最大年龄',
                maxExpenseAge: '最大费用年龄',
                maxExpenseAgeDescription: '标记超过特定天数的支出。',
                maxExpenseAgeDays: () => ({
                    one: '1天',
                    other: (count: number) => `${count}天`,
                }),
                cashExpenseDefault: '现金支出默认值',
                cashExpenseDefaultDescription: '选择如何创建现金支出。如果不是导入的公司卡交易，则视为现金支出。这包括手动创建的支出、收据、津贴、里程和工时支出。',
                reimbursableDefault: '可报销',
                reimbursableDefaultDescription: '支出通常会报销给员工',
                nonReimbursableDefault: '不可报销',
                nonReimbursableDefaultDescription: '支出偶尔会报销给员工',
                alwaysReimbursable: '始终可报销',
                alwaysReimbursableDescription: '支出始终会报销给员工',
                alwaysNonReimbursable: '始终不可报销',
                alwaysNonReimbursableDescription: '支出永远不会报销给员工',
                billableDefault: '默认计费',
                billableDefaultDescription: ({tagsPageLink}: BillableDefaultDescriptionParams) =>
                    `<muted-text>C选择现金和信用卡支出是否默认可计费。可计费支出可在<a href="${tagsPageLink}">标签</a>中启用或禁用。</muted-text>`,
                billable: '可计费的',
                billableDescription: '费用通常会重新计费给客户。',
                nonBillable: '非计费',
                nonBillableDescription: '费用有时会重新计入客户账单。',
                eReceipts: '电子收据',
                eReceiptsHint: `电子收据是自动创建的[用于大多数美元贷记交易](${CONST.DEEP_DIVE_ERECEIPTS})。`,
                attendeeTracking: '参与者跟踪',
                attendeeTrackingHint: '跟踪每笔费用的每人成本。',
                prohibitedDefaultDescription: '标记任何包含酒精、赌博或其他受限物品的收据。包含这些项目的收据将需要人工审核。',
                prohibitedExpenses: '禁止的费用',
                alcohol: '酒精',
                hotelIncidentals: '酒店杂费',
                gambling: '赌博',
                tobacco: '烟草',
                adultEntertainment: '成人娱乐',
            },
            expenseReportRules: {
                title: '费用报告',
                subtitle: '自动化费用报告合规、审批和支付。',
                preventSelfApprovalsTitle: '防止自我批准',
                preventSelfApprovalsSubtitle: '防止工作区成员批准自己的费用报告。',
                autoApproveCompliantReportsTitle: '自动批准合规报告',
                autoApproveCompliantReportsSubtitle: '配置哪些费用报告符合自动批准的条件。',
                autoApproveReportsUnderTitle: '自动批准报告低于',
                autoApproveReportsUnderDescription: '低于此金额的合规报销报告将自动批准。',
                randomReportAuditTitle: '随机报告审计',
                randomReportAuditDescription: '要求某些报告必须手动批准，即使符合自动批准的条件。',
                autoPayApprovedReportsTitle: '自动支付已批准的报告',
                autoPayApprovedReportsSubtitle: '配置哪些费用报告符合自动支付条件。',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `请输入一个小于${currency ?? ''}20,000的金额。`,
                autoPayApprovedReportsLockedSubtitle: '转到更多功能并启用工作流，然后添加付款以解锁此功能。',
                autoPayReportsUnderTitle: '自动支付报告低于',
                autoPayReportsUnderDescription: '在此金额以下的完全合规费用报告将自动支付。',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `前往[更多功能](${moreFeaturesLink})并启用工作流，然后添加${featureName}以解锁此功能。`,
                enableFeatureSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) => `前往[更多功能](${moreFeaturesLink})并启用${featureName}以解锁此功能。`,
            },
            categoryRules: {
                title: '类别规则',
                approver: '审批人',
                requireDescription: '需要描述',
                descriptionHint: '描述提示',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) => `提醒员工为“${categoryName}”支出提供更多信息。此提示显示在费用的描述字段中。`,
                descriptionHintLabel: '提示',
                descriptionHintSubtitle: '专业提示：越短越好！',
                maxAmount: '最大金额',
                flagAmountsOver: '标记超过的金额',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `适用于类别“${categoryName}”。`,
                flagAmountsOverSubtitle: '这将覆盖所有费用的最大金额。',
                expenseLimitTypes: {
                    expense: '单笔费用',
                    expenseSubtitle: '按类别标记费用金额。此规则会覆盖工作区的一般最大费用金额规则。',
                    daily: '类别总计',
                    dailySubtitle: '标记每个费用报告的类别总支出。',
                },
                requireReceiptsOver: '要求超过',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} 默认`,
                    never: '从不要求收据',
                    always: '始终要求收据',
                },
                defaultTaxRate: '默认税率',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) => `转到[更多功能](${moreFeaturesLink})并启用工作流程，然后添加审批以解锁此功能。`,
            },
            customRules: {
                title: '自定义规则',
                cardSubtitle: '这里是你团队的报销政策，让所有人都清楚哪些费用涵盖在内。',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '收集',
                    description: '适合希望自动化流程的团队。',
                },
                corporate: {
                    label: '控制',
                    description: '适用于有高级需求的组织。',
                },
            },
            description: '选择适合您的计划。有关功能和价格的详细列表，请查看我们的',
            subscriptionLink: '计划类型和定价帮助页面',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `您已承诺在您的年度订阅到期日${annualSubscriptionEndDate}之前，在控制计划中保留1名活跃成员。您可以选择按使用付费的订阅方式，并在${annualSubscriptionEndDate}之后通过禁用自动续订降级到Collect计划。`,
                other: `您已承诺在控制计划中拥有 ${count} 名活跃成员，直到您的年度订阅在 ${annualSubscriptionEndDate} 结束。您可以通过在 ${annualSubscriptionEndDate} 开始禁用自动续订来切换到按使用付费订阅并降级到 Collect 计划。`,
            }),
            subscriptions: '订阅',
        },
    },
    getAssistancePage: {
        title: '获取帮助',
        subtitle: '我们在这里为您扫清通往成功的道路！',
        description: '从以下支持选项中选择：',
        chatWithConcierge: '与Concierge聊天',
        scheduleSetupCall: '安排设置电话会议',
        scheduleACall: '安排通话',
        questionMarkButtonTooltip: '获取我们团队的协助',
        exploreHelpDocs: '查看帮助文档',
        registerForWebinar: '注册网络研讨会',
        onboardingHelp: '入职帮助',
    },
    emojiPicker: {
        skinTonePickerLabel: '更改默认肤色',
        headers: {
            frequentlyUsed: '常用',
            smileysAndEmotion: '表情符号与情感',
            peopleAndBody: '人和身体',
            animalsAndNature: '动物和自然',
            foodAndDrink: '食品和饮料',
            travelAndPlaces: '旅行和地点',
            activities: '活动',
            objects: 'Objects',
            symbols: 'Symbols',
            flags: '标记',
        },
    },
    newRoomPage: {
        newRoom: '新房间',
        groupName: '群组名称',
        roomName: '房间名称',
        visibility: '可见性',
        restrictedDescription: '您工作区中的人员可以找到此房间',
        privateDescription: '被邀请到此房间的人可以找到它',
        publicDescription: '任何人都可以找到这个房间',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: '任何人都可以找到这个房间',
        createRoom: '创建房间',
        roomAlreadyExistsError: '已存在一个具有此名称的房间',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} 是所有工作区的默认房间。请选择另一个名称。`,
        roomNameInvalidError: '房间名称只能包含小写字母、数字和连字符',
        pleaseEnterRoomName: '请输入房间名称',
        pleaseSelectWorkspace: '请选择一个工作区',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}重命名为“${newName}”（之前为“${oldName}”）` : `${actor}将此房间重命名为“${newName}”（之前为“${oldName}”）`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `房间重命名为${newName}`,
        social: '社交',
        selectAWorkspace: '选择一个工作区',
        growlMessageOnRenameError: '无法重命名工作区房间。请检查您的连接并重试。',
        visibilityOptions: {
            restricted: '工作区', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: '私人',
            public: '公开',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: '公开公告',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: '提交并关闭',
        submitAndApprove: '提交并批准',
        advanced: '高级',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) => `已将${approverName}（${approverEmail}）添加为${field}“${name}”的审批人`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) => `将 ${approverName} (${approverEmail}) 从 ${field} "${name}" 的审批人中移除`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `将 ${field} "${name}" 的审批者更改为 ${formatApprover(newApproverName, newApproverEmail)}（之前是 ${formatApprover(oldApproverName, oldApproverEmail)}）`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `添加了类别“${categoryName}”`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `已移除类别“${categoryName}”`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'disabled' : '启用'} 类别 "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `将工资代码“${newValue}”添加到类别“${categoryName}”中`;
            }
            if (!newValue && oldValue) {
                return `从类别“${categoryName}”中删除了工资代码“${oldValue}”`;
            }
            return `将“${categoryName}”类别的工资代码更改为“${newValue}”（之前为“${oldValue}”）`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `将 GL 代码“${newValue}”添加到类别“${categoryName}”中`;
            }
            if (!newValue && oldValue) {
                return `从类别“${categoryName}”中移除了GL代码“${oldValue}”`;
            }
            return `将“${categoryName}”类别的GL代码更改为“${newValue}”（之前为“${oldValue}”）`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `将“${categoryName}”类别描述更改为${!oldValue ? '必需的' : '不需要'}（之前为${!oldValue ? '不需要' : '必需的'}）`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `为类别“${categoryName}”添加了一个${newAmount}的最大金额`;
            }
            if (oldAmount && !newAmount) {
                return `从类别“${categoryName}”中移除了${oldAmount}的最大金额`;
            }
            return `将“${categoryName}”类别的最大金额更改为${newAmount}（之前为${oldAmount}）`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `将限制类型${newValue}添加到类别"${categoryName}"中`;
            }
            return `将“${categoryName}”类别的限额类型更改为${newValue}（之前为${oldValue}）`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `通过将收据更改为${newValue}来更新类别“${categoryName}”`;
            }
            return `将“${categoryName}”类别更改为${newValue}（之前为${oldValue}）`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `将类别从“${oldName}”重命名为“${newName}”`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `从类别“${categoryName}”中移除了描述提示“${oldValue}”`;
            }
            return !oldValue ? `将描述提示“${newValue}”添加到类别“${categoryName}”中` : `将“${categoryName}”类别描述提示更改为“${newValue}”（之前为“${oldValue}”）`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `将标签列表名称更改为“${newName}”（之前为“${oldName}”）`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `将标签“${tagName}”添加到列表“${tagListName}”中`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `通过将标签“${oldName}”更改为“${newName}”，更新了标签列表“${tagListName}”`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? '启用' : 'disabled'} 列表“${tagListName}”中的标签“${tagName}”`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `已从列表“${tagListName}”中移除标签“${tagName}”`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `从列表“${tagListName}”中移除了“${count}”个标签`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `在列表“${tagListName}”中更新了标签“${tagName}”，将${updatedField}更改为“${newValue}”（之前为“${oldValue}”）`;
            }
            return `在列表“${tagListName}”中更新了标签“${tagName}”，添加了一个${updatedField}为“${newValue}”`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `将 ${customUnitName} 的 ${updatedField} 更改为“${newValue}”（之前为“${oldValue}”）`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? '启用' : 'disabled'} 税收跟踪距离费率`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `添加了新的“${customUnitName}”费率“${rateName}”`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `将${customUnitName} ${updatedField} "${customUnitRateName}" 的费率更改为 "${newValue}"（之前为 "${oldValue}"）`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `将距离费率 "${customUnitRateName}" 的税率更改为 "${newValue} (${newTaxPercentage})"（之前为 "${oldValue} (${oldTaxPercentage})"）`;
            }
            return `将税率“${newValue} (${newTaxPercentage})”添加到距离费率“${customUnitRateName}”中。`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `将距离费率中的可退税部分从 "${oldValue}" 更改为 "${newValue}"（之前为 "${customUnitRateName}"）`;
            }
            return `将税款可退还部分“${newValue}”添加到距离费率“${customUnitRateName}”中。`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `已移除“${customUnitName}”费率“${rateName}”`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `已添加 ${fieldType} 报告字段 "${fieldName}"`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) => `将报告字段 "${fieldName}" 的默认值设置为 "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `将选项“${optionName}”添加到报告字段“${fieldName}”中。`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `从报告字段“${fieldName}”中移除了选项“${optionName}”`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? '启用' : 'disabled'} 报告字段 "${fieldName}" 的选项 "${optionName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? '启用' : 'disabled'} 报告字段 "${fieldName}" 的所有选项`;
            }
            return `${allEnabled ? '启用' : 'disabled'} 报告字段 "${fieldName}" 的选项 "${optionName}"，使所有选项 ${allEnabled ? '启用' : 'disabled'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `已移除${fieldType}报告字段"${fieldName}"`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `将“Prevent self-approval”更新为“${newValue === 'true' ? '已启用' : '禁用'}”（之前为“${oldValue === 'true' ? '已启用' : '禁用'}”）`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `将所需收据的最大报销金额更改为${newValue}（之前为${oldValue}）`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `将违规的最大报销金额更改为${newValue}（之前为${oldValue}）`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `将“最大费用年龄（天数）”更新为“${newValue}”（之前为“${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}”）`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `将月度报告提交日期设置为"${newValue}"`;
            }
            return `将月度报告提交日期更新为“${newValue}”（之前为“${oldValue}”）`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `已将“重新向客户计费费用”更新为“${newValue}”（之前为“${oldValue}”）`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `已将“现金支出默认值”更新为“${newValue}”（之前为“${oldValue}”）`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `"强制执行默认报告标题" ${value ? 'on' : '关'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `已将此工作区的名称更新为“${newName}”（之前为“${oldName}”）`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription ? `将此工作区的描述设置为"${newDescription}"` : `已将此工作区的描述更新为“${newDescription}”（之前为“${oldDescription}”）`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('和');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `已将您从${joinedNames}的审批流程和费用聊天中移除。之前提交的报告仍将在您的收件箱中可供审批。`,
                other: `已将你从${joinedNames}的审批流程和费用聊天中移除。之前提交的报告仍将在你的收件箱中可供审批。`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) => `已将您在${policyName}中的角色从${oldRole}更新为用户。您已被移除出所有提交者费用聊天，除了您自己的。`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `将默认货币更新为${newCurrency}（之前为${oldCurrency}）`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) => `将自动报告频率更新为“${newFrequency}”（之前为“${oldFrequency}”）`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `将审批模式更新为"${newValue}"（之前为"${oldValue}"）`,
        upgradedWorkspace: '将此工作区升级到Control计划',
        forcedCorporateUpgrade: `此工作区已升级至 Control 方案。点击 <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">此处</a> 了解更多信息。`,
        downgradedWorkspace: '已将此工作区降级到 Collect 计划',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `将随机分配进行人工审批的报告比例更改为${Math.round(newAuditRate * 100)}％（之前为${Math.round(oldAuditRate * 100)}％）`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) => `将所有费用的人工审批限额更改为${newLimit}（之前为${oldLimit}）`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `此工作区的${enabled ? '已启用' : '已禁用'}笔报销`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `已添加税项 "${taxName}"`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `已删除税项 "${taxName}"`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `将税项 "${oldValue}" 重命名为 "${newValue}"`;
                }
                case 'code': {
                    return `将税项 "${taxName}" 的代码从 "${oldValue}" 更改为 "${newValue}"`;
                }
                case 'rate': {
                    return `将税项 "${taxName}" 的税率从 "${oldValue}" 更改为 "${newValue}"`;
                }
                case 'enabled': {
                    return `${oldValue ? `已禁用税项 "${taxName}"` : `已启用税项 "${taxName}"`}`;
                }
                default: {
                    return '';
                }
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? '已启用' : '已禁用'} 与会者跟踪`,
    },
    roomMembersPage: {
        memberNotFound: '未找到成员。',
        useInviteButton: '要邀请新成员加入聊天，请使用上面的邀请按钮。',
        notAuthorized: `您无权访问此页面。如果您想加入此房间，请让房间成员添加您。还有其他问题？请联系${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `此房间已被存档。如有疑问，请联系 ${CONST.EMAIL.CONCIERGE}。`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `您确定要将${memberName}从房间中移除吗？`,
            other: '您确定要从房间中移除选定的成员吗？',
        }),
        error: {
            genericAdd: '添加此房间成员时出现问题。',
        },
    },
    newTaskPage: {
        assignTask: '分配任务',
        assignMe: '分配给我',
        confirmTask: '确认任务',
        confirmError: '请输入标题并选择共享目标',
        descriptionOptional: '描述（可选）',
        pleaseEnterTaskName: '请输入标题',
        pleaseEnterTaskDestination: '请选择您要分享此任务的位置',
    },
    task: {
        task: '任务',
        title: '标题',
        description: '描述',
        assignee: '受让人',
        completed: '已完成',
        action: '完成',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `${title}的任务`,
            completed: '标记为完成',
            canceled: '已删除的任务',
            reopened: '标记为未完成',
            error: '您没有权限执行请求的操作',
        },
        markAsComplete: '标记为完成',
        markAsIncomplete: '标记为未完成',
        assigneeError: '分配此任务时发生错误。请尝试其他受让人。',
        genericCreateTaskFailureMessage: '创建此任务时出错。请稍后再试。',
        deleteTask: '删除任务',
        deleteConfirmation: '您确定要删除此任务吗？',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `${monthName} ${year} 对账单`,
    },
    keyboardShortcutsPage: {
        title: '键盘快捷键',
        subtitle: '使用这些方便的键盘快捷键节省时间：',
        shortcuts: {
            openShortcutDialog: '打开键盘快捷键对话框',
            markAllMessagesAsRead: '将所有消息标记为已读',
            escape: '逃逸对话框',
            search: '打开搜索对话框',
            newChat: '新的聊天屏幕',
            copy: '复制评论',
            openDebug: '打开测试偏好设置对话框',
        },
    },
    guides: {
        screenShare: '屏幕共享',
        screenShareRequest: 'Expensify邀请您进行屏幕共享',
    },
    search: {
        resultsAreLimited: '搜索结果有限。',
        viewResults: '查看结果',
        resetFilters: '重置过滤器',
        searchResults: {
            emptyResults: {
                title: '无内容显示',
                subtitle: `尝试调整您的搜索条件或使用 + 按钮创建内容。`,
            },
            emptyExpenseResults: {
                title: '您还没有创建任何费用',
                subtitle: '创建报销单或试用Expensify以了解更多信息。',
                subtitleWithOnlyCreateButton: '使用下面的绿色按钮创建一笔费用。',
            },
            emptyReportResults: {
                title: '您还没有创建任何报告',
                subtitle: '创建报告或试用Expensify以了解更多信息。',
                subtitleWithOnlyCreateButton: '使用下面的绿色按钮创建报告。',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    您还没有创建任何
                    发票
                `),
                subtitle: '发送发票或试用Expensify以了解更多信息。',
                subtitleWithOnlyCreateButton: '使用下面的绿色按钮发送发票。',
            },
            emptyTripResults: {
                title: '没有行程可显示',
                subtitle: '开始预订您的第一次旅行。',
                buttonText: '预订行程',
            },
            emptySubmitResults: {
                title: '没有费用可提交',
                subtitle: '一切顺利。庆祝一下吧！',
                buttonText: '创建报告',
            },
            emptyApproveResults: {
                title: '没有费用需要批准',
                subtitle: '零报销。最大限度地放松。干得好！',
            },
            emptyPayResults: {
                title: '没有费用需要支付',
                subtitle: '恭喜！你冲过终点线了。',
            },
            emptyExportResults: {
                title: '没有费用可导出',
                subtitle: '是时候放松一下了，干得好。',
            },
            emptyStatementsResults: {
                title: '无费用显示',
                subtitle: '无结果。请尝试调整过滤器。',
            },
            emptyUnapprovedResults: {
                title: '没有费用需要批准',
                subtitle: '零报销。最大限度地放松。干得好！',
            },
        },
        statements: '发言',
        unapprovedCash: '未经批准的现金',
        unapprovedCard: '未批准的卡',
        reconciliation: '对账',
        saveSearch: '保存搜索',
        deleteSavedSearch: '删除已保存的搜索',
        deleteSavedSearchConfirm: '您确定要删除此搜索吗？',
        searchName: '搜索名称',
        savedSearchesMenuItemTitle: '已保存',
        groupedExpenses: '分组费用',
        bulkActions: {
            approve: '批准',
            pay: '支付',
            delete: '删除',
            hold: '保持',
            unhold: '移除保留',
            reject: '拒绝',
            noOptionsAvailable: '所选费用组没有可用选项。',
        },
        filtersHeader: '筛选器',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Before ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `After ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `On ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: '从未',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: '上个月',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: '本月',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: '最后发言',
                },
            },
            status: '状态',
            keyword: '关键词',
            keywords: '关键词',
            currency: '货币',
            completed: '已完成',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `少于${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `大于${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `在 ${greaterThan} 和 ${lessThan} 之间`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `等于${amount ?? ''}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: '个人卡片',
                closedCards: '已关闭的卡片',
                cardFeeds: '卡片提要',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `All ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `所有已导入的CSV卡${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: '当前',
            past: '过去',
            submitted: '提交',
            approved: '批准',
            paid: '支付',
            exported: '导出',
            posted: '发布',
            withdrawn: '撤回',
            billable: '可计费的',
            reimbursable: '可报销的',
            purchaseCurrency: '购买货币',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: '从',
                [CONST.SEARCH.GROUP_BY.CARD]: '卡片',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '提现ID',
            },
            feed: '通道',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: '报销',
            },
            is: '是',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: '提交',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: '批准',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: '支付',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: '导出',
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} 是 ${value}`,
        },
        has: '有',
        groupBy: '组别',
        moneyRequestReport: {
            emptyStateTitle: '此报告没有费用。',
        },
        noCategory: '无类别',
        noTag: '无标签',
        expenseType: '费用类型',
        withdrawalType: '提款类型',
        recentSearches: '最近的搜索',
        recentChats: '最近的聊天记录',
        searchIn: '搜索在',
        searchPlaceholder: '搜索某物',
        suggestions: '建议',
        exportSearchResults: {
            title: '创建导出',
            description: '哇，物品真多！我们会将它们打包，Concierge 很快会给你发送一个文件。',
        },
        exportAll: {
            selectAllMatchingItems: '选择所有匹配的项目',
            allMatchingItemsSelected: '所有匹配项已选择',
        },
    },
    genericErrorPage: {
        title: '哦哦，出了点问题！',
        body: {
            helpTextMobile: '请关闭并重新打开应用程序，或切换到',
            helpTextWeb: 'web.',
            helpTextConcierge: '如果问题仍然存在，请联系',
        },
        refresh: '刷新',
    },
    fileDownload: {
        success: {
            title: '下载完成！',
            message: '附件下载成功！',
            qrMessage: '检查您的照片或下载文件夹中是否有您的二维码副本。专业提示：将其添加到演示文稿中，以便观众扫描并直接与您联系。',
        },
        generalError: {
            title: '附件错误',
            message: '附件无法下载',
        },
        permissionError: {
            title: '存储访问权限',
            message: 'Expensify无法在没有存储访问权限的情况下保存附件。点击设置以更新权限。',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'New Expensify',
        about: '关于 New Expensify',
        update: '更新 New Expensify',
        checkForUpdates: '检查更新',
        toggleDevTools: '切换开发者工具',
        viewShortcuts: '查看键盘快捷键',
        services: '服务',
        hide: '隐藏 New Expensify',
        hideOthers: '隐藏其他',
        showAll: '显示全部',
        quit: '退出 New Expensify',
        fileMenu: '文件',
        closeWindow: '关闭窗口',
        editMenu: '编辑',
        undo: '撤销',
        redo: '重做',
        cut: '剪切',
        copy: '复制',
        paste: '粘贴',
        pasteAndMatchStyle: '粘贴并匹配样式',
        pasteAsPlainText: '粘贴为纯文本',
        delete: '删除',
        selectAll: '全选',
        speechSubmenu: '演讲',
        startSpeaking: '开始说话',
        stopSpeaking: '停止说话',
        viewMenu: '查看',
        reload: '重新加载',
        forceReload: '强制重新加载',
        resetZoom: '实际大小',
        zoomIn: '放大',
        zoomOut: '缩小',
        togglefullscreen: '切换全屏',
        historyMenu: '历史',
        back: '返回',
        forward: '转发',
        windowMenu: '窗口',
        minimize: '最小化',
        zoom: 'Zoom',
        front: '全部移到前面',
        helpMenu: '帮助',
        learnMore: '了解更多',
        documentation: '文档',
        communityDiscussions: '社区讨论',
        searchIssues: '搜索问题',
    },
    historyMenu: {
        forward: '转发',
        back: '返回',
    },
    checkForUpdatesModal: {
        available: {
            title: '可用更新',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) => `新版本将很快推出。${!isSilentUpdating ? '我们准备好更新时会通知您。' : ''}`,
            soundsGood: '听起来不错',
        },
        notAvailable: {
            title: '更新不可用',
            message: '目前没有可用的更新。请稍后再查看！',
            okay: '好的',
        },
        error: {
            title: '更新检查失败',
            message: '我们无法检查更新。请稍后再试。',
        },
    },
    reportLayout: {
        reportLayout: '报告布局',
        groupByLabel: '分组方式：',
        selectGroupByOption: '选择如何对报告费用进行分组',
        uncategorized: '未分类',
        noTag: '无标签',
        selectGroup: ({groupName}: {groupName: string}) => `选择 ${groupName} 中的所有费用`,
        groupBy: {
            category: '类别',
            tag: '标签',
        },
    },
    report: {
        newReport: {
            createReport: '创建报告',
            chooseWorkspace: '为此报告选择一个工作区。',
            emptyReportConfirmationTitle: '你已经有一个空报告',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) => `确定要在 ${workspaceName} 中再创建一个报告吗？你可以在以下位置访问你的空报告`,
            emptyReportConfirmationPromptLink: '报告',
            genericWorkspaceName: '此工作区',
        },
        genericCreateReportFailureMessage: '创建此聊天时出现意外错误。请稍后再试。',
        genericAddCommentFailureMessage: '发表评论时出现意外错误。请稍后再试。',
        genericUpdateReportFieldFailureMessage: '更新字段时出现意外错误。请稍后再试。',
        genericUpdateReportNameEditFailureMessage: '重命名报告时出现意外错误。请稍后再试。',
        noActivityYet: '暂无活动',
        connectionSettings: '连接设置',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `已将${fieldName}更改为"${newValue}"（之前为"${oldValue}"`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `已将${fieldName}设置为"${newValue}"`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) => {
                    if (!toPolicyName) {
                        return `已更改工作区${fromPolicyName ? `（之前为 ${fromPolicyName}）` : ''}`;
                    }
                    return `已将工作区更改为 ${toPolicyName}${fromPolicyName ? `（之前为 ${fromPolicyName}）` : ''}`;
                },
                changeType: ({oldType, newType}: ChangeTypeParams) => `类型从${oldType}更改为${newType}`,
                exportedToCSV: `导出为CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => {
                        // The label will always be in English, so we need to translate it
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `导出到${translatedLabel}`;
                    },
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `通过 ${label} 导出到`,
                    automaticActionTwo: '会计设置',
                    manual: ({label}: ExportedToIntegrationParams) => `将此报告标记为手动导出到${label}。`,
                    automaticActionThree: '并成功创建了一个记录给',
                    reimburseableLink: '自掏腰包的费用',
                    nonReimbursableLink: '公司卡费用',
                    pending: ({label}: ExportedToIntegrationParams) => `开始将此报告导出到${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `无法将此报告导出到${label}（"${errorMessage}${linkText ? ` <a href="${linkURL}">${linkText}</a>` : ''}"）`,
                managerAttachReceipt: `添加了一张收据`,
                managerDetachReceipt: `已删除收据`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `在其他地方支付了${currency}${amount}`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `通过集成支付了${currency}${amount}`,
                outdatedBankAccount: `由于付款人的银行账户出现问题，无法处理付款。`,
                reimbursementACHBounce: `由于银行账户问题，无法处理付款。`,
                reimbursementACHCancelled: `取消了付款`,
                reimbursementAccountChanged: `无法处理付款，因为付款人更换了银行账户。`,
                reimbursementDelayed: `已处理付款，但会延迟1-2个工作日。`,
                selectedForRandomAudit: `随机选择进行审核`,
                selectedForRandomAuditMarkdown: `[随机选择](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule)进行审核`,
                share: ({to}: ShareParams) => `已邀请成员 ${to}`,
                unshare: ({to}: UnshareParams) => `已移除成员${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `支付了 ${currency}${amount}`,
                takeControl: `控制了`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `与 ${label} 同步时出现问题${errorMessage ? `（"${errorMessage}"）` : ''}。请在<a href="${workspaceAccountingLink}">工作区设置</a>中解决该问题。`,
                addEmployee: ({email, role}: AddEmployeeParams) => `已将${email}添加为${role === 'member' ? 'a' : '一个'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `将 ${email} 的角色更新为 ${newRole}（之前是 ${currentRole}）`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `已移除 ${email} 的自定义字段 1（之前为 "${previousValue}"）`;
                    }
                    return !previousValue ? `将“${newValue}”添加到${email}的自定义字段1中` : `将 ${email} 的自定义字段1更改为 "${newValue}"（之前为 "${previousValue}"）`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `已移除 ${email} 的自定义字段2（之前为“${previousValue}”）`;
                    }
                    return !previousValue ? `将“${newValue}”添加到${email}的自定义字段2中` : `将 ${email} 的自定义字段2更改为 "${newValue}"（之前为 "${previousValue}"）`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} 离开了工作区`,
                removeMember: ({email, role}: AddEmployeeParams) => `已移除${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `已移除与${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}的连接`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `已连接到${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: '离开了聊天',
            },
            error: {
                invalidCredentials: '凭证无效，请检查您的连接配置。',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} 为 ${dayCount} ${dayCount === 1 ? '天' : '天'} 直到 ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} 从 ${timePeriod} 于 ${date}`,
    },
    footer: {
        features: '功能',
        expenseManagement: '费用管理',
        spendManagement: '支出管理',
        expenseReports: '费用报告',
        companyCreditCard: '公司信用卡',
        receiptScanningApp: '收据扫描应用程序',
        billPay: 'Bill Pay',
        invoicing: '开票',
        CPACard: 'CPA 卡片',
        payroll: '工资单',
        travel: '旅行',
        resources: '资源',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: '新闻资料包',
        support: '支持',
        expensifyHelp: 'ExpensifyHelp',
        terms: '服务条款',
        privacy: '隐私',
        learnMore: '了解更多',
        aboutExpensify: '关于Expensify',
        blog: '博客',
        jobs: '职位',
        expensifyOrg: 'Expensify.org',
        investorRelations: '投资者关系',
        getStarted: '开始使用',
        createAccount: '创建新账户',
        logIn: '登录',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: '导航回聊天列表',
        chatWelcomeMessage: '聊天欢迎信息',
        navigatesToChat: '导航到聊天',
        newMessageLineIndicator: '新消息行指示器',
        chatMessage: '聊天消息',
        lastChatMessagePreview: '最后的聊天消息预览',
        workspaceName: '工作区名称',
        chatUserDisplayNames: '聊天成员显示名称',
        scrollToNewestMessages: '滚动到最新消息',
        preStyledText: '预设样式文本',
        viewAttachment: '查看附件',
    },
    parentReportAction: {
        deletedReport: '已删除报告',
        deletedMessage: '已删除消息',
        deletedExpense: '已删除的费用',
        reversedTransaction: '已撤销的交易',
        deletedTask: '已删除任务',
        hiddenMessage: '隐藏信息',
    },
    threads: {
        thread: '线程',
        replies: '回复',
        reply: '回复',
        from: '从',
        in: '在',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `From ${reportName}${workspaceName ? `在${workspaceName}中` : ''}`,
    },
    qrCodes: {
        copy: '复制网址',
        copied: '已复制！',
    },
    moderation: {
        flagDescription: '所有被标记的信息将被发送给管理员审核。',
        chooseAReason: '请选择标记的原因：',
        spam: '垃圾邮件',
        spamDescription: '未经请求的无关促销',
        inconsiderate: '不体谅的',
        inconsiderateDescription: '侮辱性或不尊重的措辞，意图可疑',
        intimidation: '恐吓',
        intimidationDescription: '在有效反对意见下积极推进议程',
        bullying: '欺凌',
        bullyingDescription: '针对个人以获得服从',
        harassment: '骚扰',
        harassmentDescription: '种族歧视、厌女或其他广泛的歧视行为',
        assault: '攻击',
        assaultDescription: '专门针对的情感攻击，意图造成伤害',
        flaggedContent: '此消息已被标记为违反我们的社区规则，内容已被隐藏。',
        hideMessage: '隐藏消息',
        revealMessage: '显示消息',
        levelOneResult: '发送匿名警告，消息已报告以供审核。',
        levelTwoResult: '消息已从频道中隐藏，并附有匿名警告，消息已提交审核。',
        levelThreeResult: '消息已从频道中移除，并收到匿名警告，消息已提交审核。',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: '邀请提交费用',
        inviteToChat: '仅邀请聊天',
        nothing: '什么都不做',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '接受',
        decline: '拒绝',
    },
    actionableMentionTrackExpense: {
        submit: '提交给某人',
        categorize: '分类它',
        share: '与我的会计分享',
        nothing: '暂时没有',
    },
    teachersUnitePage: {
        teachersUnite: '教师联合',
        joinExpensifyOrg: '加入 Expensify.org，消除世界各地的不公正现象。目前的“教师联合”运动通过分担基本学校用品的费用来支持各地的教育工作者。',
        iKnowATeacher: '我认识一位老师',
        iAmATeacher: '我是老师',
        getInTouch: '太好了！请分享他们的信息，以便我们可以与他们联系。',
        introSchoolPrincipal: '介绍你的校长',
        schoolPrincipalVerifyExpense: 'Expensify.org 分担基本学习用品的费用，以便低收入家庭的学生能够获得更好的学习体验。您的校长将被要求核实您的费用。',
        principalFirstName: '名',
        principalLastName: '校长姓氏',
        principalWorkEmail: '主要工作邮箱',
        updateYourEmail: '更新您的电子邮件地址',
        updateEmail: '更新电子邮件地址',
        schoolMailAsDefault: ({contactMethodsRoute}: ContactMethodsRouteParams) =>
            `在继续之前，请确保将您的学校电子邮件设置为默认联系方式。您可以在 设置 > 个人资料 > <a href="${contactMethodsRoute}">联系方式</a> 中进行设置。`,
        error: {
            enterPhoneEmail: '请输入有效的电子邮件或电话号码',
            enterEmail: '输入电子邮件地址',
            enterValidEmail: '请输入有效的电子邮件地址',
            tryDifferentEmail: '请尝试使用其他电子邮件',
        },
    },
    cardTransactions: {
        notActivated: '未激活',
        outOfPocket: '自付费用',
        companySpend: '公司支出',
    },
    distance: {
        addStop: '添加站点',
        deleteWaypoint: '删除航点',
        deleteWaypointConfirmation: '您确定要删除此航点吗？',
        address: '地址',
        waypointDescription: {
            start: '开始',
            stop: '停止',
        },
        mapPending: {
            title: '映射待处理',
            subtitle: '当您重新联网时，地图将被生成。',
            onlineSubtitle: '请稍等，我们正在设置地图。',
            errorTitle: '地图错误',
            errorSubtitle: '加载地图时出错。请重试。',
        },
        error: {
            selectSuggestedAddress: '请选择一个建议的地址或使用当前位置',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: '成绩单丢失或损坏',
        nextButtonLabel: '下一个',
        reasonTitle: '你为什么需要一张新卡？',
        cardDamaged: '我的卡被损坏了',
        cardLostOrStolen: '我的卡丢失或被盗',
        confirmAddressTitle: '请确认您新卡的邮寄地址。',
        cardDamagedInfo: '您的新卡将在2-3个工作日内到达。您的当前卡将继续有效，直到您激活新卡。',
        cardLostOrStolenInfo: '您的当前卡将在下订单后永久停用。大多数卡会在几个工作日内送达。',
        address: '地址',
        deactivateCardButton: '停用卡片',
        shipNewCardButton: '寄送新卡片',
        addressError: '地址是必需的',
        reasonError: '原因是必需的',
        successTitle: '您的卡片正在路上！',
        successDescription: '几天后到达时，您需要激活它。在此期间，您可以使用虚拟卡。',
    },
    eReceipt: {
        guaranteed: '保证电子收据',
        transactionDate: '交易日期',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: '开始聊天，<success><strong>推荐朋友</strong></success>。',
            header: '开始聊天，推荐朋友',
            body: '想让你的朋友也使用Expensify吗？只需与他们开始聊天，我们会处理剩下的事情。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '提交费用，<success><strong>推荐你的团队</strong></success>。',
            header: '提交报销，推荐给您的团队',
            body: '想让你的团队也使用Expensify吗？只需向他们提交一笔费用，其余的交给我们。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '推荐朋友',
            body: '想让你的朋友也使用Expensify吗？只需与他们聊天、付款或分摊费用，我们会处理剩下的事情。或者直接分享你的邀请链接！',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '推荐朋友',
            header: '推荐朋友',
            body: '想让你的朋友也使用Expensify吗？只需与他们聊天、付款或分摊费用，我们会处理剩下的事情。或者直接分享你的邀请链接！',
        },
        copyReferralLink: '复制邀请链接',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) => `与您的设置专家聊天在 <a href="${href}">${adminReportName}</a> 帮助`,
        default: `消息 <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> 帮助设置`,
    },
    violations: {
        allTagLevelsRequired: '所有标签均为必填项',
        autoReportedRejectedExpense: '这笔开支被拒绝了。',
        billableExpense: '可计费项不再有效',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `需要收据${formattedLimit ? `超过${formattedLimit}` : ''}`,
        categoryOutOfPolicy: '类别不再有效',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `已应用${surcharge}%的转换附加费`,
        customUnitOutOfPolicy: '此工作区的费率无效',
        duplicatedTransaction: 'Duplicate',
        fieldRequired: '报告字段是必需的',
        futureDate: '不允许未来日期',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `上调了 ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `日期超过${maxAge}天`,
        missingCategory: '缺少类别',
        missingComment: '所选类别需要描述',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Missing ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '金额与计算的距离不同';
                case 'card':
                    return '金额大于卡交易金额';
                default:
                    if (displayPercentVariance) {
                        return `金额比扫描的收据多${displayPercentVariance}%`;
                    }
                    return '金额大于扫描的收据';
            }
        },
        modifiedDate: '日期与扫描的收据不符',
        nonExpensiworksExpense: '非Expensiworks费用',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `费用超出了自动批准限额 ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `金额超过 ${formattedLimit}/人类别限制`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `金额超过${formattedLimit}/人限制`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `超过 ${formattedLimit}/次限额的金额`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `金额超过${formattedLimit}/人限制`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `金额超过每日 ${formattedLimit}/人类别限制`,
        receiptNotSmartScanned: '收据和费用详情手动添加。',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `超过${formattedLimit}的类别限额需要提供收据`;
            }
            if (formattedLimit) {
                return `超过${formattedLimit}需要收据`;
            }
            if (category) {
                return `超出类别限额需提供收据`;
            }
            return '需要收据';
        },
        prohibitedExpense: ({prohibitedExpenseTypes}) => {
            const preMessage = '禁止的费用：';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `酒精`;
                    case 'gambling':
                        return `赌博`;
                    case 'tobacco':
                        return `烟草`;
                    case 'adultEntertainment':
                        return `成人娱乐`;
                    case 'hotelIncidentals':
                        return `酒店杂费`;
                    default:
                        return `${prohibitedExpenseType}`;
                }
            };
            let types: string[] = [];
            if (Array.isArray(prohibitedExpenseTypes)) {
                types = prohibitedExpenseTypes;
            } else if (prohibitedExpenseTypes) {
                types = [prohibitedExpenseTypes];
            }
            if (types.length === 0) {
                return preMessage;
            }
            return `${preMessage} ${types.map(getProhibitedExpenseTypeText).join(', ')}`;
        },
        customRules: ({message}: ViolationsCustomRulesParams) => message,
        reviewRequired: '需要审核',
        rter: ({brokenBankConnection, isAdmin, isTransactionOlderThan7Days, member, rterType, companyCardPageURL}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return '由于银行连接中断，无法自动匹配收据。';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin ? `银行连接已中断。<a href="${companyCardPageURL}">重新连接以匹配收据</a>` : '银行连接已中断。请联系管理员重新连接以匹配收据。';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `请${member}标记为现金，或等待7天后再试一次。` : '正在等待与卡交易合并。';
            }
            return '';
        },
        brokenConnection530Error: '由于银行连接中断，收据待处理',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>由于银行连接中断，收据正在等待处理中。请前往 <a href="${workspaceCompanyCardRoute}">公司卡</a> 解决。</muted-text-label>`,
        memberBrokenConnectionError: '由于银行连接中断，收据待处理。请联系工作区管理员解决。',
        markAsCashToIgnore: '标记为现金以忽略并请求付款。',
        smartscanFailed: ({canEdit = true}) => `扫描收据失败。${canEdit ? '手动输入详细信息。' : ''}`,
        receiptGeneratedWithAI: '潜在的AI生成收据',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `缺少 ${tagName ?? '标签'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? '标签'} 不再有效`,
        taxAmountChanged: '税额已修改',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? '税务'} 不再有效`,
        taxRateChanged: '税率已修改',
        taxRequired: '缺少税率',
        none: 'None',
        taxCodeToKeep: '选择要保留的税码',
        tagToKeep: '选择保留哪个标签',
        isTransactionReimbursable: '选择交易是否可报销',
        merchantToKeep: '选择要保留的商家',
        descriptionToKeep: '选择要保留的描述',
        categoryToKeep: '选择要保留的类别',
        isTransactionBillable: '选择交易是否可计费',
        keepThisOne: 'Keep this one',
        confirmDetails: `确认您保留的详细信息`,
        confirmDuplicatesInfo: `你不保留的重复项将被保留，供提交者删除。`,
        hold: '此费用已被搁置',
        resolvedDuplicates: '解决了重复问题',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} 是必需的`,
    },
    violationDismissal: {
        rter: {
            manual: '将此收据标记为现金',
        },
        duplicatedTransaction: {
            manual: '解决了重复问题',
        },
    },
    videoPlayer: {
        play: '播放',
        pause: '暂停',
        fullscreen: '全屏',
        playbackSpeed: '播放速度',
        expand: '展开',
        mute: '静音',
        unmute: '取消静音',
        normal: '正常',
    },
    exitSurvey: {
        header: '在你走之前',
        reasonPage: {
            title: '请告诉我们您离开的原因',
            subtitle: '在您离开之前，请告诉我们您为什么想切换到 Expensify Classic。',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: '我需要一个只有在 Expensify Classic 中才有的功能。',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '我不明白如何使用 New Expensify。',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '我了解如何使用 New Expensify，但我更喜欢 Expensify Classic。',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: '在 New Expensify 中，您需要哪些尚未提供的功能？',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '你想要做什么？',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '您为什么更喜欢 Expensify Classic？',
        },
        responsePlaceholder: '您的回复',
        thankYou: '感谢您的反馈！',
        thankYouSubtitle: '您的反馈将帮助我们打造更好的产品来完成任务。非常感谢！',
        goToExpensifyClassic: '切换到 Expensify Classic',
        offlineTitle: '看起来你被卡住了...',
        offline: '您似乎处于离线状态。不幸的是，Expensify Classic 无法离线使用，但 New Expensify 可以。如果您更喜欢使用 Expensify Classic，请在有互联网连接时重试。',
        quickTip: '小提示...',
        quickTipSubTitle: '您可以通过访问expensify.com直接进入Expensify Classic。将其添加为书签以便捷访问！',
        bookACall: '预约电话',
        bookACallTitle: '您想与产品经理交谈吗？',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '直接在费用和报告上聊天',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: '能够在移动设备上完成所有操作',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: '以聊天的速度处理差旅和费用',
        },
        bookACallTextTop: '切换到 Expensify Classic，您将错过：',
        bookACallTextBottom: '我们很高兴能与你通话，以了解原因。你可以预约与我们的高级产品经理之一进行通话，讨论你的需求。',
        takeMeToExpensifyClassic: '带我去Expensify Classic',
    },
    listBoundary: {
        errorMessage: '加载更多消息时发生错误',
        tryAgain: '再试一次',
    },
    systemMessage: {
        mergedWithCashTransaction: '将此交易与收据匹配',
    },
    subscription: {
        authenticatePaymentCard: '验证支付卡',
        mobileReducedFunctionalityMessage: '您无法在移动应用中更改您的订阅。',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `免费试用：剩余 ${numOfDays} ${numOfDays === 1 ? '天' : '天'} 天`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: '您的付款信息已过期',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `请在${date}之前更新您的支付卡，以继续使用您所有喜欢的功能。`,
            },
            policyOwnerAmountOwedOverdue: {
                title: '您的付款无法处理',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed ? `您在${date}的${purchaseAmountOwed}费用无法处理。请添加一张支付卡以清除欠款。` : '请添加支付卡以清除欠款。',
            },
            policyOwnerUnderInvoicing: {
                title: '您的付款信息已过期',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `您的付款已逾期。请在${date}之前支付您的发票，以避免服务中断。`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: '您的付款信息已过期',
                subtitle: '您的付款已逾期。请支付您的发票。',
            },
            billingDisputePending: {
                title: '您的卡无法扣款',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `您对卡号以${cardEnding}结尾的卡上的${amountOwed}费用提出了异议。在与您的银行解决争议之前，您的账户将被锁定。`,
            },
            cardAuthenticationRequired: {
                title: '您的付款卡尚未完成身份验证。',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) => `请完成身份验证流程，以激活以 ${cardEnding} 结尾的付款卡。`,
            },
            insufficientFunds: {
                title: '您的卡无法扣款',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) => `由于资金不足，您的支付卡被拒绝。请重试或添加新的支付卡以清除您欠下的${amountOwed}余额。`,
            },
            cardExpired: {
                title: '您的卡无法扣款',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) => `您的付款卡已过期。请添加新的付款卡以清除您${amountOwed}的未结余额。`,
            },
            cardExpireSoon: {
                title: '您的银行卡即将过期',
                subtitle: '您的支付卡将于本月底过期。请点击下方的三点菜单进行更新，以继续使用您所有喜爱的功能。',
            },
            retryBillingSuccess: {
                title: '成功！',
                subtitle: '您的卡已成功扣款。',
            },
            retryBillingError: {
                title: '您的卡无法扣款',
                subtitle: '在重试之前，请直接联系您的银行授权Expensify费用并解除任何保留。否则，请尝试添加其他付款卡。',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `您对卡号以${cardEnding}结尾的卡上的${amountOwed}费用提出了异议。在与您的银行解决争议之前，您的账户将被锁定。`,
            preTrial: {
                title: '开始免费试用',
                subtitleStart: '作为下一步，',
                subtitleLink: '完成您的设置清单',
                subtitleEnd: '这样您的团队就可以开始报销了。',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `试用期：剩余 ${numOfDays} ${numOfDays === 1 ? '天' : '天'} 天！`,
                subtitle: '添加支付卡以继续使用您所有喜爱的功能。',
            },
            trialEnded: {
                title: '您的免费试用已结束',
                subtitle: '添加支付卡以继续使用您所有喜爱的功能。',
            },
            earlyDiscount: {
                claimOffer: '领取优惠',
                subscriptionPageTitle: ({discountType}: EarlyDiscountTitleParams) => `<strong>首年${discountType}%折扣！</strong> 只需添加一张支付卡并开始年度订阅。`,
                onboardingChatTitle: ({discountType}: EarlyDiscountTitleParams) => `限时优惠：首年${discountType}%折扣！`,
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `在 ${days > 0 ? `${days}天 :` : ''}${hours}小时 : ${minutes}分钟 : ${seconds}秒 内认领`,
            },
        },
        cardSection: {
            title: '付款',
            subtitle: '添加一张卡以支付您的Expensify订阅费用。',
            addCardButton: '添加支付卡',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `您的下一个付款日期是${nextPaymentDate}。`,
            cardEnding: ({cardNumber}: CardEndingParams) => `卡号以${cardNumber}结尾`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `名称: ${name}, 到期: ${expiration}, 货币: ${currency}`,
            changeCard: '更改支付卡',
            changeCurrency: '更改支付货币',
            cardNotFound: '未添加支付卡',
            retryPaymentButton: '重试付款',
            authenticatePayment: '验证付款',
            requestRefund: '请求退款',
            requestRefundModal: {
                full: '获取退款很简单，只需在下一个账单日期之前降级您的账户，您就会收到退款。 <br /> <br /> 注意：降级您的账户将导致您的工作区被删除。此操作无法撤销，但如果您改变主意，您可以随时创建一个新的工作区。',
                confirm: '删除工作区并降级',
            },
            viewPaymentHistory: '查看付款历史记录',
        },
        yourPlan: {
            title: '您的计划',
            exploreAllPlans: '浏览所有计划',
            customPricing: '自定义定价',
            asLowAs: ({price}: YourPlanPriceValueParams) => `每位活跃成员/月低至${price}`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `每位成员每月${price}`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `每位成员每月${price}`,
            perMemberMonth: '每位成员/月',
            collect: {
                title: '收集',
                description: '为小型企业提供费用、旅行和聊天功能的计划。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `从${lower}/活跃成员使用Expensify卡，${upper}/活跃成员未使用Expensify卡。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `从${lower}/活跃成员使用Expensify卡，${upper}/活跃成员未使用Expensify卡。`,
                benefit1: '收据扫描',
                benefit2: '报销',
                benefit3: '公司卡管理',
                benefit4: '费用和差旅审批',
                benefit5: '旅行预订和规则',
                benefit6: 'QuickBooks/Xero 集成',
                benefit7: '聊天关于费用、报告和房间',
                benefit8: 'AI和人工支持',
            },
            control: {
                title: '控制',
                description: '适用于大型企业的费用、差旅和聊天。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `从${lower}/活跃成员使用Expensify卡，${upper}/活跃成员未使用Expensify卡。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `从${lower}/活跃成员使用Expensify卡，${upper}/活跃成员未使用Expensify卡。`,
                benefit1: 'Collect 计划中的所有内容',
                benefit2: '多级审批工作流程',
                benefit3: '自定义费用规则',
                benefit4: 'ERP 集成 (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'HR 集成 (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: '自定义洞察和报告',
                benefit8: '预算编制',
            },
            thisIsYourCurrentPlan: '这是您当前的计划',
            downgrade: '降级到Collect',
            upgrade: '升级到Control',
            addMembers: '添加成员',
            saveWithExpensifyTitle: '使用Expensify卡节省费用',
            saveWithExpensifyDescription: '使用我们的储蓄计算器查看Expensify卡的现金返还如何减少您的Expensify账单。',
            saveWithExpensifyButton: '了解更多',
        },
        compareModal: {
            comparePlans: '比较计划',
            subtitle: `<muted-text>使用适合您的计划，释放您所需的功能。<a href="${CONST.PRICING}">查看我们的定价页面</a>或每个计划的完整功能明细。</muted-text>`,
        },
        details: {
            title: '订阅详情',
            annual: '年度订阅',
            taxExempt: '请求免税状态',
            taxExemptEnabled: '免税',
            taxExemptStatus: '免税状态',
            payPerUse: '按使用付费',
            subscriptionSize: '订阅大小',
            headsUp:
                '注意：如果您现在不设置订阅规模，我们将自动将其设置为您第一个月的活跃会员数量。然后，您将承诺在接下来的12个月内至少为这个数量的会员付费。您可以随时增加您的订阅规模，但在订阅结束之前无法减少。',
            zeroCommitment: '零承诺，以折扣年费订阅价格享受',
        },
        subscriptionSize: {
            title: '订阅大小',
            yourSize: '您的订阅规模是指在特定月份内可以由任何活跃成员填补的空位数量。',
            eachMonth: '每个月，您的订阅涵盖最多为上面设置的活跃成员数量。每当您增加订阅规模时，您将以新的规模开始一个新的12个月订阅。',
            note: '注意：活跃成员是指任何创建、编辑、提交、批准、报销或导出与您的公司工作区相关的费用数据的人。',
            confirmDetails: '确认您的新年度订阅详情：',
            subscriptionSize: '订阅大小',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} 活跃成员/月`,
            subscriptionRenews: '订阅续订',
            youCantDowngrade: '您无法在年度订阅期间降级。',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `您已经承诺每月有 ${size} 名活跃会员的年度订阅，直到 ${date}。您可以在 ${date} 通过禁用自动续订切换到按使用付费的订阅。`,
            error: {
                size: '请输入有效的订阅大小',
                sameSize: '请输入一个与您当前订阅大小不同的数字',
            },
        },
        paymentCard: {
            addPaymentCard: '添加支付卡',
            enterPaymentCardDetails: '输入您的支付卡信息',
            security: 'Expensify符合PCI-DSS标准，使用银行级加密，并利用冗余基础设施来保护您的数据。',
            learnMoreAboutSecurity: '了解更多关于我们的安全性。',
        },
        subscriptionSettings: {
            title: '订阅设置',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `订阅类型：${subscriptionType}，订阅规模：${subscriptionSize}，自动续订：${autoRenew}，自动增加年度席位：${autoIncrease}`,
            none: 'none',
            on: 'on',
            off: '关',
            annual: '年度的',
            autoRenew: '自动续订',
            autoIncrease: '自动增加年度席位数量',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `每位活跃成员每月最多可节省${amountWithCurrency}`,
            automaticallyIncrease: '自动增加您的年度席位，以容纳超过订阅规模的活跃成员。注意：这将延长您的年度订阅结束日期。',
            disableAutoRenew: '禁用自动续订',
            helpUsImprove: '帮助我们改进Expensify',
            whatsMainReason: '您禁用自动续订的主要原因是什么？',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `续订日期为${date}。`,
            pricingConfiguration: '定价取决于配置。为了获得最低价格，请选择年度订阅并获取Expensify卡。',
            learnMore: {
                part1: '在我们的网页上了解更多信息',
                pricingPage: '定价页面',
                part2: '或用您的语言与我们的团队聊天',
                adminsRoom: '#admins room.',
            },
            estimatedPrice: '预估价格',
            changesBasedOn: '这会根据您的 Expensify 卡使用情况和以下订阅选项而有所变化。',
        },
        requestEarlyCancellation: {
            title: '请求提前取消',
            subtitle: '您申请提前取消的主要原因是什么？',
            subscriptionCanceled: {
                title: '订阅已取消',
                subtitle: '您的年度订阅已被取消。',
                info: '如果您想继续按使用量付费的方式使用您的工作区，您就准备好了。',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `如果您想防止未来的活动和收费，您必须 <a href="${workspacesListRoute}">删除您的工作区</a> 请注意，当您删除工作区时，您将被收取当前日历月内产生的任何未结活动费用。`,
            },
            requestSubmitted: {
                title: '请求已提交',
                subtitle: '感谢您告知我们您想取消订阅。我们正在审核您的请求，并将尽快通过您与 <concierge-link>Concierge</concierge-link> 的聊天与您联系。',
            },
            acknowledgement: `通过请求提前取消，我承认并同意Expensify在Expensify条款下没有义务批准此类请求。<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>服务条款</a>或我与Expensify之间的其他适用服务协议，并且Expensify保留对授予任何此类请求的唯一酌情权。`,
        },
    },
    feedbackSurvey: {
        tooLimited: '功能需要改进',
        tooExpensive: '太贵了',
        inadequateSupport: '客户支持不足',
        businessClosing: '公司关闭、缩减规模或被收购',
        additionalInfoTitle: '您将迁移到什么软件以及原因是什么？',
        additionalInfoInputLabel: '您的回复',
    },
    roomChangeLog: {
        updateRoomDescription: '将房间描述设置为：',
        clearRoomDescription: '清除了房间描述',
        changedRoomAvatar: '更改了房间头像',
        removedRoomAvatar: '移除了房间头像',
    },
    delegate: {
        switchAccount: '切换账户：',
        copilotDelegatedAccess: 'Copilot：委托访问权限',
        copilotDelegatedAccessDescription: '允许其他成员访问您的账户。',
        addCopilot: '添加副驾驶',
        membersCanAccessYourAccount: '这些成员可以访问您的账户：',
        youCanAccessTheseAccounts: '您可以通过账户切换器访问这些账户：',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '满的';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '有限的';
                default:
                    return '';
            }
        },
        genericError: '哎呀，出了点问题。请再试一次。',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `代表${delegator}`,
        accessLevel: '访问级别',
        confirmCopilot: '确认您的助手如下。',
        accessLevelDescription: '请选择以下访问级别。完整访问和有限访问都允许副驾驶查看所有对话和费用。',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '允许其他成员代表您在您的账户中执行所有操作。包括聊天、提交、审批、付款、设置更新等。';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '允许其他成员代表您在您的账户中执行大多数操作。不包括审批、付款、拒绝和保留。';
                default:
                    return '';
            }
        },
        removeCopilot: '移除Copilot',
        removeCopilotConfirmation: '您确定要移除此副驾驶吗？',
        changeAccessLevel: '更改访问级别',
        makeSureItIsYou: '让我们确认一下身份',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `请输入发送到${contactMethod}的验证码以添加副驾驶。验证码应在一两分钟内到达。`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `请输入发送到${contactMethod}的验证码以更新您的副驾驶。`,
        notAllowed: '慢着...',
        noAccessMessage: dedent(`
            作为副驾驶，你无权访问此页面。抱歉！
        `),
        notAllowedMessage: ({accountOwnerEmail}: AccountOwnerParams) =>
            `作为 ${accountOwnerEmail} 的<a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">副驾驶员</a>，您无权执行此操作。对不起！`,
        copilotAccess: 'Copilot访问权限',
    },
    debug: {
        debug: '调试',
        details: '详情',
        JSON: 'JSON',
        reportActions: '操作',
        reportActionPreview: '预览',
        nothingToPreview: '无可预览内容',
        editJson: 'Edit JSON:',
        preview: '预览：',
        missingProperty: ({propertyName}: MissingPropertyParams) => `缺少${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `无效属性：${propertyName} - 预期：${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `无效值 - 预期: ${expectedValues}`,
        missingValue: '缺失值',
        createReportAction: '创建报告操作',
        reportAction: '报告操作',
        report: '报告',
        transaction: '交易',
        violations: '违规事项',
        transactionViolation: '交易违规',
        hint: '数据更改不会发送到后端',
        textFields: '文本字段',
        numberFields: '数字字段',
        booleanFields: '布尔字段',
        constantFields: '常量字段',
        dateTimeFields: '日期时间字段',
        date: '日期',
        time: '时间',
        none: 'None',
        visibleInLHN: '在左侧导航栏中可见',
        GBR: 'GBR',
        RBR: 'RBR',
        true: '真',
        false: '假',
        viewReport: '查看报告',
        viewTransaction: '查看交易',
        createTransactionViolation: '创建交易违规',
        reasonVisibleInLHN: {
            hasDraftComment: '有草稿评论',
            hasGBR: 'Has GBR',
            hasRBR: 'Has RBR',
            pinnedByUser: '已被成员置顶',
            hasIOUViolations: '有借款违规',
            hasAddWorkspaceRoomErrors: '添加工作区房间时出错',
            isUnread: '未读（专注模式）',
            isArchived: '已归档（最新模式）',
            isSelfDM: '是自我私信',
            isFocused: '暂时专注于',
        },
        reasonGBR: {
            hasJoinRequest: '有加入请求（管理员房间）',
            isUnreadWithMention: '未读且有提及',
            isWaitingForAssigneeToCompleteAction: '正在等待受让人完成操作',
            hasChildReportAwaitingAction: '有子报告等待处理',
            hasMissingInvoiceBankAccount: '缺少发票银行账户',
            hasUnresolvedCardFraudAlert: '有未解决的卡片欺诈警告',
        },
        reasonRBR: {
            hasErrors: '报告或报告操作数据中有错误',
            hasViolations: '有违规行为',
            hasTransactionThreadViolations: '有交易线程违规',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: '有一份报告等待处理',
            theresAReportWithErrors: '有一个报告存在错误',
            theresAWorkspaceWithCustomUnitsErrors: '有一个工作区存在自定义单位错误',
            theresAProblemWithAWorkspaceMember: '工作区成员出现问题',
            theresAProblemWithAWorkspaceQBOExport: '工作区连接导出设置出现问题。',
            theresAProblemWithAContactMethod: '联系方法出现问题',
            aContactMethodRequiresVerification: '一种联系方式需要验证',
            theresAProblemWithAPaymentMethod: '支付方式出现问题',
            theresAProblemWithAWorkspace: '工作区出现问题',
            theresAProblemWithYourReimbursementAccount: '您的报销账户存在问题',
            theresABillingProblemWithYourSubscription: '您的订阅存在账单问题',
            yourSubscriptionHasBeenSuccessfullyRenewed: '您的订阅已成功续订',
            theresWasAProblemDuringAWorkspaceConnectionSync: '工作区连接同步时出现问题',
            theresAProblemWithYourWallet: '您的钱包出现了问题',
            theresAProblemWithYourWalletTerms: '您的钱包条款存在问题',
        },
    },
    emptySearchView: {
        takeATestDrive: '试驾',
    },
    migratedUserWelcomeModal: {
        title: '欢迎使用 New Expensify！',
        subtitle: '它集成了你在我们经典体验中喜爱的所有内容，并带来一系列升级，让你的生活更加轻松：',
        confirmText: '我们走吧！',
        features: {
            chat: '就任何费用发起聊天，快速解决问题',
            search: '更强大的搜索，适用于移动端、网页端和桌面端',
            concierge: '内置 Concierge AI，帮助自动化处理您的报销',
        },
        helpText: '试用 2 分钟演示',
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip><strong>从这里开始</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>在这里重命名你保存的搜索</strong></tooltip>',
        accountSwitcher: '<tooltip>在这里访问你的<strong>副账户</strong></tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>扫描我们的测试发票</strong>了解其运作方式！</tooltip>',
            manager: '<tooltip>选择我们的<strong>测试经理</strong>来试用！</tooltip>',
            confirmation: '<tooltip>现在，<strong>提交你的报销</strong>，看看会发生什么！</tooltip>',
            tryItOut: '试试看',
        },
        outstandingFilter: '<tooltip>筛选出\n<strong>需要审批</strong>的报销</tooltip>',
        scanTestDriveTooltip: '<tooltip>发送此发票以\n<strong>完成测试流程！</strong></tooltip>',
    },
    discardChangesConfirmation: {
        title: '放弃更改？',
        body: '您确定要放弃所做的更改吗？',
        confirmText: '放弃更改',
    },
    scheduledCall: {
        book: {
            title: '安排通话',
            description: '找到一个适合你的时间。',
            slots: ({date}: {date: string}) => `<muted-text>可用时间为 <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: '确认通话',
            description: '请确保以下详细信息对您来说没有问题。一旦您确认通话，我们将发送包含更多信息的邀请。',
            setupSpecialist: '您的设置专家',
            meetingLength: '会议时长',
            dateTime: '日期和时间',
            minutes: '30分钟',
        },
        callScheduled: '通话已安排',
    },
    autoSubmitModal: {
        title: '全部清除并提交！',
        description: '所有警告和违规已被清除，因此：',
        submittedExpensesTitle: '这些费用已提交',
        submittedExpensesDescription: '这些费用已发送给您的审批人，但在批准之前仍可编辑。',
        pendingExpensesTitle: '待处理费用已被移动',
        pendingExpensesDescription: '任何未处理的卡片费用已被移至单独的报告中，直到它们被记录。',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '进行2分钟试用',
        },
        modal: {
            title: '试用我们吧',
            description: '进行一次简短的产品导览，快速上手。',
            confirmText: '开始试用',
            helpText: 'Skip',
            employee: {
                description: '<muted-text>让您的团队享受<strong>3个月的Expensify免费使用！</strong>只需在下方输入您老板的电子邮件并发送一笔测试费用。</muted-text>',
                email: '输入您老板的电子邮件地址',
                error: '该成员拥有一个工作区，请输入一个新成员进行测试。',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: '您目前正在试用 Expensify',
            readyForTheRealThing: '准备好来真的了吗？',
            getStarted: '开始使用',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) =>
            `# ${name}邀请你试用Expensify\n嘿！我刚为我们获得了*3个月免费*试用Expensify，这是处理费用的最快方式。\n\n这里有一个*测试收据*来向你展示它的工作原理：`,
    },
    export: {
        basicExport: '基本导出',
        reportLevelExport: '所有数据 - 报告级别',
        expenseLevelExport: '所有数据 - 费用级别',
        exportInProgress: '正在导出',
        conciergeWillSend: 'Concierge 很快会将文件发送给您。',
    },
    avatarPage: {title: '编辑个人资料图片', upload: '上传', uploadPhoto: '上传照片', selectAvatar: '选择头像', choosePresetAvatar: '或选择自定义头像'},
    openAppFailureModal: {title: '出了点问题...', subtitle: `我们未能加载您的所有数据。我们已收到通知，正在调查此问题。如果问题仍然存在，请联系`, refreshAndTryAgain: '刷新并重试'},
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>你</strong>添加费用。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `等待 <strong>${actor}</strong> 添加费用。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `等待管理员添加费用。`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `无需进一步操作！`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>你</strong>添加银行账户。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待<strong>${actor}</strong>添加银行账户。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `等待管理员添加银行账户。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: ({actor, actorType, eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `于${eta}` : ` ${eta}`;
                }
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>你的</strong>费用自动提交${formattedETA}。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待<strong>${actor}</strong>的费用自动提交${formattedETA}。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员的费用自动提交${formattedETA}。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>你</strong>修复问题。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待<strong>${actor}</strong>修复问题。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员修复问题。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `等待<strong>您</strong>批准报销。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待<strong>${actor}</strong>批准费用。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员批准费用。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>您</strong>导出此报告。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待<strong>${actor}</strong>导出此报告。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员导出此报告。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `等待<strong>你</strong>支付费用。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `等待<strong>${actor}</strong>支付费用。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员支付费用。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>您</strong>完成企业银行账户的设置。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待<strong>${actor}</strong>完成公司银行账户的设置。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `等待管理员完成公司银行账户的设置。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `在${eta}之前` : ` ${eta}`;
                }
                return `正在等待付款完成${formattedETA}。`;
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: '很快',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '今天晚些时候',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '在星期日',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '每月的1日和16日',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '在每月的最后一个工作日',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '在每月的最后一天',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '在您行程结束时',
        },
    },
    domain: {
        notVerified: '未验证',
        retry: '重试',
        verifyDomain: {
            title: '验证域名',
            beforeProceeding: ({domainName}: {domainName: string}) => `在继续之前，请通过更新其 DNS 设置来验证您拥有 <strong>${domainName}</strong>。`,
            accessYourDNS: ({domainName}: {domainName: string}) => `访问您的 DNS 提供商，并打开 <strong>${domainName}</strong> 的 DNS 设置。`,
            addTXTRecord: '添加以下 TXT 记录：',
            saveChanges: '保存更改并返回此处以验证您的域名。',
            youMayNeedToConsult: `您可能需要咨询您组织的 IT 部门以完成验证。<a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">了解更多</a>。`,
            warning: '验证完成后，您的域中的所有 Expensify 成员将收到一封电子邮件，告知他们的账户将由您的域进行管理。',
            codeFetchError: '无法获取验证码',
            genericError: '我们无法验证您的域名。请重试，如果问题仍然存在，请联系 Concierge。',
        },
        domainVerified: {
            title: '域名已验证',
            header: '哇哦！您的域名已通过验证',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>域名 <strong>${domainName}</strong> 已成功验证，您现在可以设置 SAML 和其他安全功能。</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'SAML 单点登录 (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> 是一项安全功能，可让您更好地控制使用 <strong>${domainName}</strong> 邮箱的成员如何登录 Expensify。要启用它，您需要验证自己是授权的公司管理员。</muted-text>`,
            fasterAndEasierLogin: '更快、更简单的登录',
            moreSecurityAndControl: '更强的安全性与控制',
            onePasswordForAnything: '一个密码搞定一切',
        },
        goToDomain: '前往域',
        samlLogin: {
            title: 'SAML 登录',
            subtitle: `<muted-text>使用<a href="${CONST.SAML_HELP_URL}">SAML 单点登录（SSO）</a>配置成员登录。</muted-text>`,
            enableSamlLogin: '启用 SAML 登录',
            allowMembers: '允许成员通过 SAML 登录。',
            requireSamlLogin: '强制使用 SAML 登录',
            anyMemberWillBeRequired: '使用不同方式登录的任何成员将被要求使用 SAML 重新进行身份验证。',
            enableError: '无法更新 SAML 启用设置',
            requireError: '无法更新 SAML 要求设置',
        },
        samlConfigurationDetails: {
            title: 'SAML 配置详细信息',
            subtitle: '使用这些详细信息来设置 SAML。',
            identityProviderMetaData: '身份提供者元数据',
            entityID: '实体 ID',
            nameIDFormat: '名称 ID 格式',
            loginUrl: '登录网址',
            acsUrl: 'ACS（断言消费者服务）URL',
            logoutUrl: '注销 URL',
            sloUrl: 'SLO (单点登出) URL',
            serviceProviderMetaData: '服务提供商元数据',
            oktaScimToken: 'Okta SCIM 令牌',
            revealToken: '显示令牌',
            fetchError: '无法获取 SAML 配置详细信息',
            setMetadataGenericError: '无法设置 SAML 元数据',
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
