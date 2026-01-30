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
import StringUtils from '@libs/StringUtils';
import dedent from '@libs/StringUtils/dedent';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type OriginalMessage from '@src/types/onyx/OriginalMessage';
import {OriginalMessageSettlementAccountLocked, PolicyRulesModifiedFields} from '@src/types/onyx/OriginalMessage';
import ObjectUtils from '@src/types/utils/ObjectUtils';
import type en from './en';
import type {
    ChangeFieldParams,
    ConnectionNameParams,
    CreatedReportForUnapprovedTransactionsParams,
    DelegateRoleParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    EditActionParams,
    ExportAgainModalDescriptionParams,
    ExportIntegrationSelectedParams,
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
    ParentNavigationSummaryParams,
    PayAndDowngradeDescriptionParams,
    PayerOwesParams,
    PayerPaidParams,
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
    RequiredFieldParams,
    ResolutionConstraintsParams,
    ReviewParams,
    RoleNamesParams,
    RoomNameReservedErrorParams,
    RoomRenamedToParams,
    RoutedDueToDEWParams,
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
    SplitDateRangeParams,
    SplitExpenseEditTitleParams,
    SplitExpenseSubtitleParams,
    StatementTitleParams,
    StepCounterParams,
    StripePaidParams,
    SubmitsToParams,
    SubmittedToVacationDelegateParams,
    SubmittedWithMemoParams,
    SubscriptionCommitmentParams,
    SubscriptionSettingsLearnMoreParams,
    SubscriptionSettingsRenewsOnParams,
    SubscriptionSettingsSaveUpToParams,
    SubscriptionSettingsSummaryParams,
    SubscriptionSizeParams,
    SyncStageNameConnectionsParams,
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
    UpdatedPolicyCustomUnitRateEnabledParams,
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
    UpdatedPolicyReimburserParams,
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
    ViolationsProhibitedExpenseParams,
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
        // @context Used as a noun meaning a numerical total or quantity, not the verb “to count.”
        count: '数量',
        cancel: '取消',
        // @context Refers to closing or hiding a notification or message, not rejecting or ignoring something.
        dismiss: '关闭',
        // @context Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”
        proceed: '继续',
        yes: '是',
        no: '否',
        // @context Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.
        ok: 'OK',
        notNow: '现在不要',
        noThanks: '不用，谢谢',
        unshare: '取消分享',
        learnMore: '了解更多',
        buttonConfirm: '明白了',
        name: '名称',
        attachment: '附件',
        attachments: '附件',
        center: '中心',
        from: '从',
        to: '至',
        in: '在',
        optional: '可选',
        new: '新',
        search: '搜索',
        reports: '报表',
        find: '查找',
        searchWithThreeDots: '搜索…',
        next: '下一步',
        previous: '上一步',
        goBack: '返回',
        create: '创建',
        add: '添加',
        resend: '重新发送',
        save: '保存',
        select: '选择',
        deselect: '取消选择',
        // @context Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.
        selectMultiple: '多选',
        saveChanges: '保存更改',
        submit: '提交',
        // @context Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”
        submitted: '已提交',
        rotate: '旋转',
        zoom: 'Zoom',
        password: '密码',
        magicCode: '魔法代码',
        digits: '位数字',
        twoFactorCode: '双重验证代码',
        workspaces: '工作区',
        inbox: '收件箱',
        // @context Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”
        success: '成功',
        group: '群组',
        profile: '个人资料',
        referral: '推荐',
        payments: '付款',
        approvals: '审批',
        wallet: '钱包',
        preferences: '偏好设置',
        view: '查看',
        review: (reviewParams?: ReviewParams) => `审核${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: '否',
        signIn: '登录',
        signInWithGoogle: '使用 Google 登录',
        signInWithApple: '使用 Apple 登录',
        signInWith: '使用以下方式登录',
        continue: '继续',
        firstName: '名',
        lastName: '姓',
        scanning: '扫描中',
        analyzing: '正在分析...',
        addCardTermsOfService: 'Expensify 服务条款',
        perPerson: '每人',
        phone: '电话',
        phoneNumber: '电话号码',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: '电子邮箱',
        and: '和',
        or: '或',
        details: '详情',
        privacy: '隐私',
        privacyPolicy: '隐私政策',
        hidden: '隐藏',
        visible: '可见',
        delete: '删除',
        // @context UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.
        archived: '已归档',
        contacts: '联系人',
        recents: '最近',
        close: '关闭',
        comment: '评论',
        download: '下载',
        downloading: '正在下载',
        // @context Indicates that a file is currently being uploaded (sent to the server), not downloaded.
        uploading: '正在上传',
        // @context as a verb, not a noun
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
        currentMonth: '本月',
        ssnLast4: '社会安全号后 4 位',
        ssnFull9: '完整 9 位 SSN',
        addressLine: (lineNumber: number) => `地址行 ${lineNumber}`,
        personalAddress: '个人地址',
        companyAddress: '公司地址',
        noPO: '请不要使用邮政信箱或代收邮件地址。',
        city: '城市',
        state: '州',
        streetAddress: '街道地址',
        stateOrProvince: '州 / 省',
        country: '国家',
        zip: '邮政编码',
        zipPostCode: '邮编 / 邮政编码',
        whatThis: '这是什么？',
        iAcceptThe: '我接受',
        acceptTermsAndPrivacy: `我接受<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify 服务条款</a>和<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">隐私政策</a>`,
        acceptTermsAndConditions: `我接受<a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">条款和条件</a>`,
        acceptTermsOfService: `我接受<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify 服务条款</a>`,
        remove: '移除',
        admin: '管理员',
        owner: '所有者',
        dateFormat: 'YYYY-MM-DD',
        send: '发送',
        na: '不适用',
        noResultsFound: '未找到结果',
        noResultsFoundMatching: (searchString: string) => `未找到与“${searchString}”匹配的结果`,
        recentDestinations: '最近的目的地',
        timePrefix: '它是',
        conjunctionFor: '用于',
        todayAt: '今天 在',
        tomorrowAt: '明天 在',
        yesterdayAt: '昨天 在',
        conjunctionAt: '在',
        conjunctionTo: '到',
        genericErrorMessage: '哎呀……出现了一些问题，无法完成您的请求。请稍后再试。',
        percentage: '百分比',
        converted: '已转换',
        error: {
            invalidAmount: '金额无效',
            acceptTerms: '您必须接受服务条款才能继续',
            phoneNumber: `请输入完整的电话号码
（例如：${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER}）`,
            fieldRequired: '此字段为必填项',
            requestModified: '此请求正在被另一位成员修改中',
            characterLimitExceedCounter: (length: number, limit: number) => `超出字符限制（${length}/${limit}）`,
            dateInvalid: '请选择一个有效日期',
            invalidDateShouldBeFuture: '请选择今天或将来的日期',
            invalidTimeShouldBeFuture: '请选择一个至少比当前时间晚一分钟的时间',
            invalidCharacter: '无效字符',
            enterMerchant: '输入商户名称',
            enterAmount: '输入金额',
            missingMerchantName: '缺少商家名称',
            missingAmount: '缺少金额',
            missingDate: '缺少日期',
            enterDate: '输入日期',
            invalidTimeRange: '请输入使用12小时制的时间（例如：2:30 PM）',
            pleaseCompleteForm: '请填写上方的表格以继续',
            pleaseSelectOne: '请在上方选择一个选项',
            invalidRateError: '请输入有效的费率',
            lowRateError: '费率必须大于 0',
            email: '请输入有效的电子邮箱地址',
            login: '登录时发生错误。请重试。',
        },
        comma: '逗号',
        semicolon: '分号',
        please: '请',
        // @context Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.
        contactUs: '联系我们',
        pleaseEnterEmailOrPhoneNumber: '请输入电子邮箱或电话号码',
        // @context Instruction prompting the user to correct multiple issues. Should use imperative form when translated.
        fixTheErrors: '修复错误',
        inTheFormBeforeContinuing: '在继续之前，请先填写表单',
        confirm: '确认',
        reset: '重置',
        // @context Status or button indicating that an action or process has been completed. Should reflect completion.
        done: '已完成',
        more: '更多',
        debitCard: '借记卡',
        bankAccount: '银行账户',
        personalBankAccount: '个人银行账户',
        businessBankAccount: '企业银行账户',
        join: '加入',
        leave: '请假',
        decline: '拒绝',
        reject: '拒绝',
        transferBalance: '转移余额',
        // @context Instruction telling the user to input data manually. Refers to entering text or values in a field.
        enterManually: '手动输入',
        message: '消息',
        leaveThread: '离开会话',
        you: '你',
        // @context Refers to the current user in the UI. Should follow capitalization rules for labels/pronouns in the target language.
        me: '我',
        youAfterPreposition: '你',
        your: '您的',
        conciergeHelp: '如需帮助，请联系 Concierge。',
        youAppearToBeOffline: '您似乎处于离线状态。',
        thisFeatureRequiresInternet: '此功能需要有效的互联网连接。',
        attachmentWillBeAvailableOnceBackOnline: '附件将在恢复联网后可用。',
        errorOccurredWhileTryingToPlayVideo: '尝试播放此视频时发生错误。',
        areYouSure: '你确定吗？',
        verify: '验证',
        yesContinue: '是的，继续',
        // @context Provides an example format for a website URL.
        websiteExample: '例如：https://www.expensify.com',
        // @context Provides an example format for a ZIP/postal code.
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `例如：${zipSampleFormat}` : ''),
        description: '描述',
        title: '标题',
        assignee: '受托人',
        createdBy: '创建者',
        with: '与',
        shareCode: '分享代码',
        share: '分享',
        per: '每',
        // @context Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.
        mi: '英里',
        km: '公里',
        copied: '已复制！',
        someone: '某人',
        total: '总计',
        edit: '编辑',
        letsDoThis: `开始吧！`,
        letsStart: `我们开始吧`,
        showMore: '显示更多',
        showLess: '收起',
        merchant: '商户',
        change: '更改',
        category: '类别',
        report: '报告',
        billable: '可计费',
        nonBillable: '不可计费',
        tag: '标签',
        receipt: '收据',
        verified: '已验证',
        replace: '替换',
        distance: '距离',
        mile: '英里',
        // @context Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.
        miles: '英里',
        kilometer: '公里',
        kilometers: '千米',
        recent: '最近',
        all: '全部',
        am: '上午',
        pm: '下午',
        // @context Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.
        tbd: '待定',
        selectCurrency: '选择一种货币',
        selectSymbolOrCurrency: '选择符号或货币',
        card: '卡片',
        whyDoWeAskForThis: '我们为什么要请求这些信息？',
        required: '必填',
        showing: '显示',
        of: '的',
        default: '默认',
        update: '更新',
        member: '成员',
        auditor: '审核员',
        role: '角色',
        currency: '货币',
        groupCurrency: '群组货币',
        rate: '费率',
        emptyLHN: {
            title: '嗷呼！全部搞定了。',
            subtitleText1: '使用以下方式查找聊天',
            subtitleText2: '上方的按钮，或使用该按钮创建内容',
            subtitleText3: '下方的按钮。',
        },
        businessName: '公司名称',
        clear: '清除',
        type: '类型',
        reportName: '报表名称',
        action: '操作',
        expenses: '报销',
        totalSpend: '总支出',
        tax: '税',
        shared: '共享',
        drafts: '草稿',
        // @context as a noun, not a verb
        draft: '草稿',
        finished: '已完成',
        upgrade: '升级',
        downgradeWorkspace: '降级工作区',
        companyID: '公司 ID',
        userID: '用户 ID',
        disable: '禁用',
        export: '导出',
        initialValue: '初始值',
        // @context UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.
        currentDate: '当前日期',
        value: '值',
        downloadFailedTitle: '下载失败',
        downloadFailedDescription: '您的下载未能完成。请稍后再试。',
        filterLogs: '筛选日志',
        network: '网络',
        reportID: '报告 ID',
        longReportID: '长报表 ID',
        withdrawalID: '提款 ID',
        bankAccounts: '银行账户',
        chooseFile: '选择文件',
        chooseFiles: '选择文件',
        // @context Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.
        dropTitle: '松开鼠标',
        // @context Instruction for dropping one or more files into an upload area.
        dropMessage: '将文件拖放到此处',
        ignore: '忽略',
        enabled: '已启用',
        disabled: '已禁用',
        // @context Action button for importing a file or data. Should use the verb form, not the noun form.
        import: '导入',
        offlinePrompt: '你现在无法执行此操作。',
        // @context meaning "remaining to be paid, done, or dealt with", not "exceptionally good"
        outstanding: '未完成',
        chats: '聊天',
        tasks: '任务',
        unread: '未读',
        sent: '已发送',
        links: '链接',
        // @context Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).
        day: '日',
        days: '天',
        rename: '重命名',
        address: '地址',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        secondAbbreviation: 's',
        skip: '跳过',
        chatWithAccountManager: (accountManagerDisplayName: string) => `需要特定帮助？请与您的客户经理 ${accountManagerDisplayName} 聊天。`,
        chatNow: '立即聊天',
        workEmail: '工作邮箱',
        destination: '目的地',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: '次级费率',
        perDiem: '每日津贴',
        validate: '验证',
        downloadAsPDF: '下载为 PDF',
        downloadAsCSV: '下载为 CSV',
        help: '帮助',
        expenseReport: '报销报告',
        expenseReports: '费用报表',
        // @context Rate as a noun, not a verb
        rateOutOfPolicy: '超出政策的费率',
        leaveWorkspace: '离开工作区',
        leaveWorkspaceConfirmation: '如果你离开此工作区，将无法再向其提交报销。',
        leaveWorkspaceConfirmationAuditor: '如果你离开此工作区，将无法查看其报表和设置。',
        leaveWorkspaceConfirmationAdmin: '如果你离开此工作区，将无法管理其设置。',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) => `如果你离开此工作区，你在审批流程中的位置将由工作区所有者 ${workspaceOwner} 替代。`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) => `如果你离开此工作空间，你将被工作空间所有者 ${workspaceOwner} 替换为首选导出人。`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) => `如果你离开此工作区，你作为技术联系人的角色将由工作区所有者 ${workspaceOwner} 取代。`,
        leaveWorkspaceReimburser: '您无法以报销人身份离开此工作区。请在“工作区 > 进行或跟踪付款”中设置新的报销人，然后重试。',
        reimbursable: '可报销',
        editYourProfile: '编辑个人资料',
        comments: '评论',
        sharedIn: '共享于',
        unreported: '未报告',
        explore: '探索',
        todo: '待办事项',
        invoice: '发票',
        expense: '费用',
        chat: '聊天',
        task: '任务',
        trip: '行程',
        apply: '应用',
        status: '状态',
        on: '开',
        before: '之前',
        after: '之后',
        reschedule: '重新安排',
        general: '常规',
        workspacesTabTitle: '工作区',
        headsUp: '提醒一下！',
        submitTo: '提交给',
        forwardTo: '转发至',
        merge: '合并',
        none: '无',
        unstableInternetConnection: '网络连接不稳定。请检查您的网络后重试。',
        enableGlobalReimbursements: '启用全球报销',
        purchaseAmount: '购买金额',
        frequency: '频率',
        link: '链接',
        pinned: '已置顶',
        read: '阅读',
        copyToClipboard: '复制到剪贴板',
        thisIsTakingLongerThanExpected: '这比预期花费的时间更长...',
        domains: '域名',
        actionRequired: '需要操作',
        duplicate: '复制',
        duplicated: '已重复',
        exchangeRate: '汇率',
        reimbursableTotal: '可报销总额',
        nonReimbursableTotal: '不可报销总额',
        originalAmount: '原始金额',
        insights: '洞察',
        duplicateExpense: '重复报销',
        newFeature: '新功能',
        month: '月',
        home: '首页',
        week: '周',
        year: '年',
        quarter: '季度',
    },
    supportalNoAccess: {
        title: '先别急',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) => `当以支持身份登录时，您无权执行此操作（命令：${command ?? ''}）。如果您认为 Success 应该能够执行此操作，请在 Slack 中发起会话。`,
    },
    lockedAccount: {
        title: '账户已锁定',
        description: '由于此账户已被锁定，您无权执行此操作。请联系 concierge@expensify.com 以获取后续步骤',
    },
    location: {
        useCurrent: '使用当前位置',
        notFound: '我们无法找到您的位置。请重试或手动输入地址。',
        permissionDenied: '看起来你已拒绝访问你的位置信息。',
        please: '请',
        allowPermission: '在设置中允许访问位置信息',
        tryAgain: '然后再试一次。',
    },
    contact: {
        importContacts: '导入联系人',
        importContactsTitle: '导入你的联系人',
        importContactsText: '从手机导入联系人，让你常用的联系人始终只需轻轻一点即可联系。',
        importContactsExplanation: '这样，你最喜欢的人始终只需轻轻一点即可联系。',
        importContactsNativeText: '还差最后一步！请授权我们导入你的联系人。',
    },
    anonymousReportFooter: {
        logoTagline: '加入讨论。',
    },
    attachmentPicker: {
        cameraPermissionRequired: '相机访问',
        expensifyDoesNotHaveAccessToCamera: 'Expensify 需要访问你的相机才能拍照。请点击“设置”来更新权限。',
        attachmentError: '附件错误',
        errorWhileSelectingAttachment: '选择附件时出错。请重试。',
        errorWhileSelectingCorruptedAttachment: '选择已损坏的附件时发生错误。请尝试选择其他文件。',
        takePhoto: '拍照',
        chooseFromGallery: '从图库中选择',
        chooseDocument: '选择文件',
        attachmentTooLarge: '附件太大',
        sizeExceeded: '附件大小超过 24 MB 限制',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `附件大小超过 ${maxUploadSizeInMB} MB 限制`,
        attachmentTooSmall: '附件太小',
        sizeNotMet: '附件大小必须大于 240 字节',
        wrongFileType: '无效的文件类型',
        notAllowedExtension: '不允许此文件类型。请尝试使用其他文件类型。',
        folderNotAllowedMessage: '不允许上传文件夹。请尝试选择其他文件。',
        protectedPDFNotSupported: '不支持受密码保护的 PDF',
        attachmentImageResized: '此图片已调整大小以供预览。下载以查看完整分辨率。',
        attachmentImageTooLarge: '此图片过大，无法在上传前预览。',
        tooManyFiles: (fileLimit: number) => `一次最多只能上传 ${fileLimit} 个文件。`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `文件超过 ${maxUploadSizeInMB} MB。请重试。`,
        someFilesCantBeUploaded: '某些文件无法上传',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `文件大小必须小于 ${maxUploadSizeInMB} MB。更大的文件将不会被上传。`,
        maxFileLimitExceeded: '您一次最多可以上传 30 张收据。超出部分将不会被上传。',
        unsupportedFileType: (fileType: string) => `不支持 ${fileType} 文件。只有支持的文件类型会被上传。`,
        learnMoreAboutSupportedFiles: '了解支持的格式详情。',
        passwordProtected: '不支持受密码保护的 PDF 文件。只有受支持的文件会被上传。',
    },
    dropzone: {
        addAttachments: '添加附件',
        addReceipt: '添加收据',
        scanReceipts: '扫描收据',
        replaceReceipt: '替换收据',
    },
    filePicker: {
        fileError: '文件错误',
        errorWhileSelectingFile: '选择文件时出错。请重试。',
    },
    connectionComplete: {
        title: '连接完成',
        supportingText: '你可以关闭此窗口并返回 Expensify 应用。',
    },
    avatarCropModal: {
        title: '编辑照片',
        description: '按照你的喜好拖动、缩放和旋转图像。',
    },
    composer: {
        noExtensionFoundForMimeType: '未找到与该 MIME 类型对应的扩展名',
        problemGettingImageYouPasted: '获取您粘贴的图片时出现问题',
        commentExceededMaxLength: (formattedMaxLength: string) => `最大评论长度为 ${formattedMaxLength} 个字符。`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `任务标题的最大长度为 ${formattedMaxLength} 个字符。`,
    },
    baseUpdateAppModal: {
        updateApp: '更新应用程序',
        updatePrompt: '此应用有新版本可用。\n现在更新，或稍后重新启动应用以下载最新更改。',
    },
    deeplinkWrapper: {
        launching: '正在启动 Expensify',
        expired: '您的会话已过期。',
        signIn: '请重新登录。',
    },
    multifactorAuthentication: {
        biometricsTest: {
            biometricsTest: '生物特征测试',
            authenticationSuccessful: '认证成功',
            successfullyAuthenticatedUsing: ({authType}) => `您已成功使用${authType}进行认证。`,
            troubleshootBiometricsStatus: ({registered}) => `生物特征（${registered ? '已注册' : '未注册'}）`,
            yourAttemptWasUnsuccessful: '您的认证尝试未成功。',
            youCouldNotBeAuthenticated: '无法认证您',
            areYouSureToReject: '您确定要拒绝吗？如果您关闭此屏幕，认证尝试将被拒绝。',
            rejectAuthentication: '拒绝认证',
            test: '测试',
            biometricsAuthentication: '生物特征认证',
        },
        pleaseEnableInSystemSettings: {
            start: '请在',
            link: '系统设置',
            end: '中启用面部/指纹验证或设置设备密码。',
        },
        oops: '哎呀，出错了',
        looksLikeYouRanOutOfTime: '看起来你的时间用完了！请在商户处再试一次。',
        youRanOutOfTime: '时间已经用完',
        letsVerifyItsYou: '让我们验证是不是你',
        verifyYourself: {
            biometrics: '用你的脸部或指纹进行身份验证',
        },
        enableQuickVerification: {
            biometrics: '使用您的脸部或指纹启用快速安全验证。无需密码或代码。',
        },
        revoke: {
            revoke: '撤销',
            title: '面部识别/指纹识别与通行密钥',
            explanation: '在一台或多台设备上已启用面部 / 指纹或通行密钥验证。撤销访问权限后，下次在任何设备上进行验证时都需要使用魔法验证码',
            confirmationPrompt: '你确定吗？在任何设备上进行下一步验证时，你都需要一个魔法代码',
            cta: '撤销访问权限',
            noDevices: '您尚未注册任何用于人脸/指纹或通行密钥验证的设备。如果您注册了设备，您将可以在此撤销其访问权限。',
            dismiss: '明白了',
            error: '请求失败。请稍后重试。',
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            阿布拉卡达布拉，
            你已登录！
        `),
        successfulSignInDescription: '返回到您原来的标签页以继续。',
        title: '这是你的魔法代码',
        description: dedent(`
            请输入在最初请求该代码的设备上显示的代码
        `),
        doNotShare: dedent(`
            不要与任何人分享你的验证码。
            Expensify 永远不会向你索要它！
        `),
        or: '，或',
        signInHere: '只需在此登录',
        expiredCodeTitle: '魔法代码已过期',
        expiredCodeDescription: '返回原始设备并请求新验证码',
        successfulNewCodeRequest: '已请求验证码。请检查您的设备。',
        tfaRequiredTitle: dedent(`
            双重身份验证
            必填
        `),
        tfaRequiredDescription: dedent(`
            请输入您尝试登录位置的两步验证代码。
        `),
        requestOneHere: '在此请求一次。',
    },
    moneyRequestConfirmationList: {
        paidBy: '支付方',
        whatsItFor: '它是用来做什么的？',
    },
    selectionList: {
        nameEmailOrPhoneNumber: '姓名、电子邮箱或电话号码',
        findMember: '查找成员',
        searchForSomeone: '搜索人员',
    },
    customApprovalWorkflow: {
        title: '自定义审批流程',
        description: '您的公司在此工作区中使用了自定义审批工作流程。请在 Expensify Classic 中执行此操作',
        goToExpensifyClassic: '切换到 Expensify 经典版',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '提交报销，推荐你的团队',
            subtitleText: '也想让你的团队使用 Expensify 吗？只需向他们提交一笔报销，我们会处理剩下的一切。',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '预约通话',
    },
    hello: '你好',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '请从下方开始。',
        anotherLoginPageIsOpen: '另一个登录页面已打开。',
        anotherLoginPageIsOpenExplanation: '您已在单独的标签页中打开登录页面。请在该标签页中完成登录。',
        welcome: '欢迎！',
        welcomeWithoutExclamation: '欢迎',
        phrase2: '金钱会说话。现在聊天和支付都在同一个地方，一切也变得简单了。',
        phrase3: '只要你表达得够快，你的款项就能同样迅速到账。',
        enterPassword: '请输入您的密码',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}，很高兴在这里见到新面孔！`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `请输入发送到 ${login} 的魔法代码。它应该会在一两分钟内送达。`,
    },
    login: {
        hero: {
            header: '以聊天速度处理差旅和报销',
            body: '欢迎使用新一代 Expensify，在这里，借助具备上下文的实时聊天功能，您的差旅和报销处理将更加快速高效。',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: '继续使用单点登录登录：',
        orContinueWithMagicCode: '您也可以使用魔法验证码登录',
        useSingleSignOn: '使用单点登录',
        useMagicCode: '使用魔法代码',
        launching: '正在启动...',
        oneMoment: '请稍候，我们正在将您重定向到您公司的单点登录门户。',
    },
    reportActionCompose: {
        dropToUpload: '拖放以上传',
        sendAttachment: '发送附件',
        addAttachment: '添加附件',
        writeSomething: '写点什么…',
        blockedFromConcierge: '通信已被禁止',
        fileUploadFailed: '上传失败。不支持该文件。',
        localTime: ({user, time}: LocalTimeParams) => `现在是 ${user} 的 ${time}`,
        edited: '（已编辑）',
        emoji: '表情符号',
        collapse: '折叠',
        expand: '展开',
    },
    reportActionContextMenu: {
        copyMessage: '复制消息',
        copied: '已复制！',
        copyLink: '复制链接',
        copyURLToClipboard: '复制 URL 到剪贴板',
        copyEmailToClipboard: '将邮箱复制到剪贴板',
        markAsUnread: '标记为未读',
        markAsRead: '标记为已读',
        editAction: ({action}: EditActionParams) => `编辑 ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '费用' : '评论'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = '评论';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `删除 ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = '评论';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `您确定要删除此${type}吗？`;
        },
        onlyVisible: '仅对…可见',
        explain: '解释',
        explainMessage: '请为我解释一下。',
        replyInThread: '在线程中回复',
        joinThread: '加入话题',
        leaveThread: '离开会话',
        copyOnyxData: '复制 Onyx 数据',
        flagAsOffensive: '标记为冒犯内容',
        menu: '菜单',
    },
    emojiReactions: {
        addReactionTooltip: '添加表情回应',
        reactedWith: '做出反应：',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `你错过了<strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>中的聚会，这里已经没什么可看的了。`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) => `此聊天室面向 <strong>${domainRoom}</strong> 域上的所有 Expensify 成员。用它与同事聊天、分享技巧并提出问题。`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) => `这是与 <strong>${workspaceName}</strong> 管理员的聊天。可用于讨论工作区设置等内容。`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `此聊天包含 <strong>${workspaceName}</strong> 中的所有人。请用于发布最重要的公告。`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `此聊天室用于讨论任何与 <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> 相关的内容。`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `此聊天用于 <strong>${invoicePayer}</strong> 与 <strong>${invoiceReceiver}</strong> 之间的发票。使用 "+" 按钮发送发票。`,
        beginningOfChatHistory: (users: string) => `此聊天是与${users}的聊天。`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `这是 <strong>${submitterDisplayName}</strong> 向 <strong>${workspaceName}</strong> 提交报销的地方。只需使用“+”按钮即可。`,
        beginningOfChatHistorySelfDM: '这是你的个人空间。可用于记录笔记、任务、草稿和提醒。',
        beginningOfChatHistorySystemDM: '欢迎！我们来为你完成设置。',
        chatWithAccountManager: '在这里与您的客户经理聊天',
        askMeAnything: '问我任何问题！',
        sayHello: '打个招呼！',
        yourSpace: '您的空间',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `欢迎来到 ${roomName}！`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `使用“+”按钮来${additionalText}一笔报销。`,
        askConcierge: '随时提问并获得 24/7 实时支持。',
        conciergeSupport: '7×24 小时支持',
        create: '创建',
        iouTypes: {
            pay: '支付',
            split: '拆分',
            submit: '提交',
            track: '跟踪',
            invoice: '发票',
        },
    },
    adminOnlyCanPost: '只有管理员可以在此房间发送消息。',
    reportAction: {
        asCopilot: '作为副驾驶用于',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) => `创建了此报表以汇总 <a href="${reportUrl}">${reportName}</a> 中无法按您选择的频率提交的所有费用`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName}: CreatedReportForUnapprovedTransactionsParams) =>
            `为来自 <a href="${reportUrl}">${reportName}</a> 的所有暂挂报销创建了此报表`,
    },
    mentionSuggestions: {
        hereAlternateText: '通知此对话中的所有人',
    },
    newMessages: '新消息',
    latestMessages: '最新消息',
    youHaveBeenBanned: '注意：您已被禁止在此频道聊天。',
    reportTypingIndicator: {
        isTyping: '正在输入…',
        areTyping: '正在输入…',
        multipleMembers: '多个成员',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: '此聊天室已被归档。',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `由于${displayName}已关闭其账号，此聊天已不再活跃。`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `此聊天不再活跃，因为${oldDisplayName}已将其账户与${displayName}合并。`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou ? `此聊天已不再活动，因为<strong>您</strong>已不再是 ${policyName} 工作空间的成员。` : `此聊天已不再有效，因为${displayName}不再是${policyName}工作区的成员。`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) => `此聊天不再可用，因为 ${policyName} 不再是一个活跃的工作区。`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `此聊天不再可用，因为 ${policyName} 不再是一个活跃的工作区。`,
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
        buttonFind: '查找内容…',
        buttonMySettings: '我的设置',
        fabNewChat: '开始聊天',
        fabNewChatExplained: '打开操作菜单',
        fabScanReceiptExplained: '扫描收据（浮动操作）',
        chatPinned: '聊天已置顶',
        draftedMessage: '已起草的消息',
        listOfChatMessages: '聊天消息列表',
        listOfChats: '聊天列表',
        saveTheWorld: '拯救世界',
        tooltip: '从这里开始！',
        redirectToExpensifyClassicModal: {
            title: '即将推出',
            description: '我们正在对新版 Expensify 的一些细节进行微调，以适配您的特定设置。与此同时，请先前往 Expensify 经典版。',
        },
    },
    allSettingsScreen: {
        subscription: '订阅',
        domains: '域名',
    },
    tabSelector: {chat: '聊天', room: '房间', distance: '距离', manual: '手动', scan: '扫描', map: '地图', gps: 'GPS', odometer: '里程表'},
    spreadsheet: {
        upload: '上传电子表格',
        import: '导入电子表格',
        dragAndDrop: '<muted-link>将您的电子表格拖放到此处，或在下方选择一个文件。支持的格式：.csv、.txt、.xls 和 .xlsx。</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>将您的电子表格拖放到此处，或在下方选择一个文件。<a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">了解更多</a>支持的文件格式。</muted-link>`,
        chooseSpreadsheet: '<muted-link>选择要导入的电子表格文件。支持的格式：.csv、.txt、.xls 和 .xlsx。</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>选择要导入的电子表格文件。<a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">了解更多</a>有关支持的文件格式的信息。</muted-link>`,
        fileContainsHeader: '文件包含列标题',
        column: (name: string) => `列 ${name}`,
        fieldNotMapped: (fieldName: string) => `哎呀！必填字段（“${fieldName}”）尚未映射。请检查后重试。`,
        singleFieldMultipleColumns: (fieldName: string) => `哎呀！您已将单个字段（“${fieldName}”）映射到了多个列。请检查后重试。`,
        emptyMappedField: (fieldName: string) => `哎呀！字段（“${fieldName}”）包含一个或多个空值。请检查后重试。`,
        importSuccessfulTitle: '导入成功',
        importCategoriesSuccessfulDescription: ({categories}: {categories: number}) => (categories > 1 ? `已添加 ${categories} 个类别。` : '已添加 1 个类别。'),
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '尚未添加或更新任何成员。';
            }
            if (added && updated) {
                return `已添加 ${added} 名成员${added > 1 ? 's' : ''}，已更新 ${updated} 名成员${updated > 1 ? 's' : ''}。`;
            }
            if (updated) {
                return updated > 1 ? `已更新 ${updated} 名成员。` : '1 名成员已更新。';
            }
            return added > 1 ? `已添加 ${added} 名成员。` : '已添加 1 名成员。';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `已添加 ${tags} 个标签。` : '已添加 1 个标签。'),
        importMultiLevelTagsSuccessfulDescription: '已添加多级标签。',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `已添加 ${rates} 项每日津贴标准。` : '已添加 1 个日津贴费率。'),
        importFailedTitle: '导入失败',
        importFailedDescription: '请确保所有字段均已正确填写，然后重试。如果问题仍然存在，请联系 Concierge。',
        importDescription: '通过单击下面每个已导入列旁边的下拉菜单，选择要从电子表格映射的字段。',
        sizeNotMet: '文件大小必须大于 0 字节',
        invalidFileMessage: '您上传的文件为空或包含无效数据。请确认文件格式正确且包含必要信息后，再次上传。',
        importSpreadsheetLibraryError: '加载电子表格模块失败。请检查您的网络连接，然后重试。',
        importSpreadsheet: '导入电子表格',
        downloadCSV: '下载 CSV',
        importMemberConfirmation: () => ({
            one: `请确认以下将通过本次上传添加的新工作区成员的详细信息。现有成员不会收到任何角色更新或邀请消息。`,
            other: (count: number) => `请确认以下有关将在此次上传中添加的 ${count} 位新的工作区成员的详细信息。现有成员不会收到任何角色更新或邀请消息。`,
        }),
    },
    receipt: {
        upload: '上传收据',
        uploadMultiple: '上传收据',
        desktopSubtitleSingle: `或将其拖放到此处`,
        desktopSubtitleMultiple: `或将它们拖放到此处`,
        alternativeMethodsTitle: '添加收据的其他方式：',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">下载应用</a>，以便使用手机扫描</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>将收据转发至 <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">添加你的号码</a>以将收据短信发送到${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>将收据短信发送至 ${phoneNumber}（仅限美国号码）</label-text>`,
        takePhoto: '拍照',
        cameraAccess: '需要相机权限才能拍摄收据照片。',
        deniedCameraAccess: `仍未授予相机访问权限，请按照<a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">这些说明</a>操作。`,
        cameraErrorTitle: '相机错误',
        cameraErrorMessage: '拍照时发生错误。请重试。',
        locationAccessTitle: '允许访问位置信息',
        locationAccessMessage: '位置访问有助于我们在您出行的任何地方保持时区和货币的准确。',
        locationErrorTitle: '允许访问位置信息',
        locationErrorMessage: '位置访问有助于我们在您出行的任何地方保持时区和货币的准确。',
        allowLocationFromSetting: `位置访问有助于我们在您出行的任何地方都保持时区和货币的准确。请在设备的权限设置中允许位置访问。`,
        dropTitle: '随它去',
        dropMessage: '将文件拖到此处',
        flash: '闪现',
        multiScan: '多重扫描',
        shutter: '快门',
        gallery: '图库',
        deleteReceipt: '删除收据',
        deleteConfirmation: '您确定要删除此收据吗？',
        addReceipt: '添加收据',
        scanFailed: '无法扫描该收据，因为缺少商家、日期或金额。',
        addAReceipt: {
            phrase1: '添加收据',
            phrase2: '或者拖拽到这里',
        },
    },
    quickAction: {
        scanReceipt: '扫描收据',
        recordDistance: '跟踪距离',
        requestMoney: '创建报销',
        perDiem: '创建津贴',
        splitBill: '拆分报销',
        splitScan: '拆分收据',
        splitDistance: '拆分距离',
        paySomeone: ({name}: PaySomeoneParams = {}) => `支付 ${name ?? '某人'}`,
        assignTask: '分配任务',
        header: '快速操作',
        noLongerHaveReportAccess: '你已无法访问之前的快速操作目标。请在下方选择一个新的。',
        updateDestination: '更新目的地',
        createReport: '创建报表',
    },
    iou: {
        amount: '金额',
        percent: '百分比',
        taxAmount: '税额',
        taxRate: '税率',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `批准 ${formattedAmount}` : '批准'),
        approved: '已批准',
        cash: '现金',
        card: '卡片',
        original: '原始',
        split: '拆分',
        splitExpense: '拆分报销',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `来自 ${merchant} 的 ${amount}`,
        splitByPercentage: '按百分比拆分',
        addSplit: '添加拆分',
        makeSplitsEven: '平均分配',
        editSplits: '编辑拆分',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `总金额比原始报销金额多出 ${amount}。`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `总金额比原始费用少 ${amount}。`,
        splitExpenseZeroAmount: '在继续之前请输入有效的金额。',
        splitExpenseOneMoreSplit: '未添加拆分。请至少添加一项以便保存。',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `编辑 ${merchant} 的 ${amount}`,
        removeSplit: '移除拆分',
        splitExpenseCannotBeEditedModalTitle: '此报销无法编辑',
        splitExpenseCannotBeEditedModalDescription: '已批准或已支付的费用无法编辑',
        splitExpenseDistanceErrorModalDescription: '请修复距离费率错误后重试。',
        paySomeone: ({name}: PaySomeoneParams = {}) => `支付 ${name ?? '某人'}`,
        expense: '费用',
        categorize: '分类',
        share: '分享',
        participants: '参与者',
        createExpense: '创建报销',
        trackDistance: '跟踪距离',
        createExpenses: (expensesNumber: number) => `创建 ${expensesNumber} 笔报销`,
        removeExpense: '移除报销',
        removeThisExpense: '移除此报销',
        removeExpenseConfirmation: '确定要删除此收据吗？此操作无法撤销。',
        addExpense: '添加报销',
        chooseRecipient: '选择收件人',
        createExpenseWithAmount: ({amount}: {amount: string}) => `创建${amount}笔报销`,
        confirmDetails: '确认详情',
        pay: '支付',
        cancelPayment: '取消支付',
        cancelPaymentConfirmation: '您确定要取消此付款吗？',
        viewDetails: '查看详情',
        pending: '待处理',
        canceled: '已取消',
        posted: '已发布',
        deleteReceipt: '删除收据',
        findExpense: '查找报销',
        deletedTransaction: (amount: string, merchant: string) => `删除了一笔费用（${amount}，商家：${merchant}）`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `移动了一笔报销${reportName ? `来自 ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `已移动此报销${reportName ? `到 <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `已移动此报销${reportName ? `来自 <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `已将此报销移动到你的<a href="${reportUrl}">个人空间</a>`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `已将此报表移动到 <a href="${newParentReportUrl}">${toPolicyName}</a> 工作区`;
            }
            return `已将此<a href="${movedReportUrl}">报表</a>移动到<a href="${newParentReportUrl}">${toPolicyName}</a>工作区`;
        },
        pendingMatchWithCreditCard: '收据正在等待与卡片交易匹配',
        pendingMatch: '待匹配',
        pendingMatchWithCreditCardDescription: '收据正在等待与银行卡交易匹配。标记为现金以取消。',
        markAsCash: '标记为现金',
        routePending: '路由处理中…',
        receiptScanning: () => ({
            one: '正在扫描收据…',
            other: '正在扫描收据…',
        }),
        scanMultipleReceipts: '扫描多张收据',
        scanMultipleReceiptsDescription: '一次性拍下所有收据的照片，然后自行确认明细，或者交给我们替你完成。',
        receiptScanInProgress: '收据扫描进行中',
        receiptScanInProgressDescription: '收据扫描进行中。稍后再查看或立即输入详细信息。',
        removeFromReport: '从报表中移除',
        moveToPersonalSpace: '将报销移至您的个人空间',
        duplicateTransaction: (isSubmitted: boolean) => (!isSubmitted ? '发现可能存在重复报销。请查看重复项以继续提交。' : '发现可能重复的报销。请检查重复项以启用审批。'),
        receiptIssuesFound: () => ({
            one: '发现问题',
            other: '发现的问题',
        }),
        fieldPending: '待处理…',
        defaultRate: '默认费率',
        receiptMissingDetails: '收据缺少详细信息',
        missingAmount: '缺少金额',
        missingMerchant: '缺少商户',
        receiptStatusTitle: '正在扫描…',
        receiptStatusText: '在扫描过程中，只有你自己能看到此收据。稍后再回来查看，或立即输入详细信息。',
        receiptScanningFailed: '收据扫描失败。请手动输入详细信息。',
        transactionPendingDescription: '交易处理中。可能需要几天时间才能入账。',
        companyInfo: '公司信息',
        companyInfoDescription: '在您发送第一张发票之前，我们还需要一些详细信息。',
        yourCompanyName: '您的公司名称',
        yourCompanyWebsite: '贵公司的网站',
        yourCompanyWebsiteNote: '如果你没有网站，可以改为提供你公司的 LinkedIn 或社交媒体主页。',
        invalidDomainError: '您输入的域名无效。若要继续，请输入有效的域名。',
        publicDomainError: '您输入的是公共域名。若要继续，请输入一个私有域名。',
        expenseCount: () => {
            return {
                one: '1 笔报销',
                other: (count: number) => `${count} 笔报销`,
            };
        },
        deleteExpense: () => ({
            one: '删除报销',
            other: '删除报销记录',
        }),
        deleteConfirmation: () => ({
            one: '你确定要删除此报销吗？',
            other: '您确定要删除这些报销吗？',
        }),
        deleteReport: '删除报表',
        deleteReportConfirmation: '您确定要删除此报告吗？',
        settledExpensify: '已支付',
        done: '完成',
        settledElsewhere: '在其他地方已支付',
        individual: '个人',
        business: '商务',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `使用 Expensify 支付 ${formattedAmount}` : `使用 Expensify 付款`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `以个人身份支付 ${formattedAmount}` : `使用个人账户支付`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `用钱包支付 ${formattedAmount}` : `使用钱包支付`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `支付 ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `以企业身份支付 ${formattedAmount}` : `使用公司账户付款`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `将 ${formattedAmount} 标记为已支付` : `标记为已支付`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `使用个人账户 ${last4Digits} 支付了 ${amount}` : `使用个人账户付款`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `已使用商务账户尾号为 ${last4Digits} 支付 ${amount}` : `使用公司账户支付`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `通过 ${policyName} 支付 ${formattedAmount}` : `通过 ${policyName} 支付`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `已使用银行账户 ${last4Digits} 支付 ${amount}` : `使用银行账户 ${last4Digits} 支付`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `已使用银行账户尾号为 ${last4Digits}，通过<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">工作区规则</a>支付了 ${amount ? `${amount} ` : ''}`,
        invoicePersonalBank: (lastFour: string) => `个人账户 • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `商务账户 · 尾号 ${lastFour}`,
        nextStep: '下一步',
        finished: '已完成',
        flip: '翻转',
        sendInvoice: ({amount}: RequestAmountParams) => `发送发票：${amount}`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `为 ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `已提交${memo ? `，备注为 ${memo}` : ''}`,
        automaticallySubmitted: `通过 <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">延迟提交</a> 提交`,
        queuedToSubmitViaDEW: '已排队等待通过自定义审批工作流提交',
        queuedToApproveViaDEW: '已排队等待通过自定义审批工作流审批',
        trackedAmount: (formattedAmount: string, comment?: string) => `正在跟踪 ${formattedAmount}${comment ? `为 ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `拆分 ${amount}`,
        didSplitAmount: (formattedAmount: string, comment: string) => `拆分 ${formattedAmount}${comment ? `为 ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `您分摊的金额 ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} 欠 ${amount}${comment ? `为 ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} 欠款：`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}已支付 ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} 支付了：`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} 花费了 ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} 支出：`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} 已批准：`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} 已批准 ${amount}`,
        payerSettled: (amount: number | string) => `已支付 ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `已支付 ${amount}。添加一个银行账户以接收你的付款。`,
        automaticallyApproved: `已通过<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">工作区规则</a>批准`,
        approvedAmount: (amount: number | string) => `已批准 ${amount}`,
        approvedMessage: `已批准`,
        unapproved: `未批准`,
        automaticallyForwarded: `已通过<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">工作区规则</a>批准`,
        forwarded: `已批准`,
        rejectedThisReport: '拒绝了此报表',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `已发起付款，但正在等待 ${submitterDisplayName} 添加银行账户。`,
        adminCanceledRequest: '已取消付款',
        canceledRequest: (amount: string, submitterDisplayName: string) => `已取消金额为 ${amount} 的付款，因为 ${submitterDisplayName} 未在 30 天内启用其 Expensify Wallet`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) => `${submitterDisplayName} 添加了一个银行账户。${amount} 付款已完成。`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}标记为已支付${comment ? `，说"${comment}"` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}使用钱包支付`,
        automaticallyPaidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}通过 Expensify 按照<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">工作区规则</a>付款`,
        noReimbursableExpenses: '此报表包含无效金额',
        pendingConversionMessage: '总金额将在你重新联网后更新',
        changedTheExpense: '已更改报销单',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `将 ${valueName} 更改为 ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `将 ${translatedChangedField} 设置为 ${newMerchant}，这会将金额设置为 ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `${valueName}（先前为 ${oldValueToDisplay}）`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `将 ${valueName} 更改为 ${newValueToDisplay}（之前为 ${oldValueToDisplay}）`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `将${translatedChangedField}更改为${newMerchant}（之前为${oldMerchant}），从而将金额更新为${newAmountToDisplay}（之前为${oldAmountToDisplay}）`,
        basedOnAI: '基于过去的活动',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `基于<a href="${rulesLink}">工作区规则</a>` : '基于工作区规则'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `用于${comment}` : '费用'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `发票报表 #${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `已发送 ${formattedAmount}${comment ? `为 ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `已将报销从个人空间移动到 ${workspaceName ?? `与 ${reportName} 聊天`}`,
        movedToPersonalSpace: '已将报销移动到个人空间',
        error: {
            invalidCategoryLength: '类别名称超过 255 个字符。请缩短名称或选择其他类别。',
            invalidTagLength: '标签名称超过了255个字符。请缩短它或选择其他标签。',
            invalidAmount: '请在继续之前输入有效金额',
            invalidDistance: '在继续之前请输入有效的距离',
            invalidIntegerAmount: '请在继续之前输入一个整数美元金额',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `最高税额为 ${amount}`,
            invalidSplit: '拆分金额之和必须等于总金额',
            invalidSplitParticipants: '请为至少两位参与者输入大于零的金额',
            invalidSplitYourself: '请为您的分摊输入一个非零金额',
            noParticipantSelected: '请选择参与者',
            other: '发生未知错误。请稍后重试。',
            genericCreateFailureMessage: '提交此费用时报出意外错误。请稍后重试。',
            genericCreateInvoiceFailureMessage: '发送此发票时出现意外错误。请稍后重试。',
            genericHoldExpenseFailureMessage: '暂时无法搁置此报销。请稍后重试。',
            genericUnholdExpenseFailureMessage: '从此报销中移除挂起状态时发生未知错误。请稍后重试。',
            receiptDeleteFailureError: '删除此收据时发生意外错误。请稍后重试。',
            receiptFailureMessage: '<rbr>上传收据时出错。请<a href="download">保存收据</a>，并稍后<a href="retry">重试</a>。</rbr>',
            receiptFailureMessageShort: '上传收据时出错。',
            genericDeleteFailureMessage: '删除此报销时发生意外错误。请稍后重试。',
            genericEditFailureMessage: '编辑此报销时出现意外错误。请稍后重试。',
            genericSmartscanFailureMessage: '交易缺少字段',
            duplicateWaypointsErrorMessage: '请移除重复的航路点',
            atLeastTwoDifferentWaypoints: '请输入至少两个不同的地址',
            splitExpenseMultipleParticipantsErrorMessage: '一笔报销不能在一个工作区和其他成员之间拆分。请更新你的选择。',
            invalidMerchant: '请输入有效的商家',
            atLeastOneAttendee: '必须至少选择一位参加者',
            invalidQuantity: '请输入有效的数量',
            quantityGreaterThanZero: '数量必须大于零',
            invalidSubrateLength: '必须至少有一个子费率',
            invalidRate: '此汇率对该工作区无效。请选择此工作区中的可用汇率。',
            endDateBeforeStartDate: '结束日期不能早于开始日期',
            endDateSameAsStartDate: '结束日期不能与开始日期相同',
            manySplitsProvided: `允许的最大拆分数为${CONST.IOU.SPLITS_LIMIT}。`,
            dateRangeExceedsMaxDays: `日期范围不能超过${CONST.IOU.SPLITS_LIMIT}天。`,
            invalidReadings: '请输入起始读数和结束读数',
            negativeDistanceNotAllowed: '结束读数必须大于开始读数',
        },
        dismissReceiptError: '忽略错误',
        dismissReceiptErrorConfirmation: '提醒！关闭此错误会完全删除你上传的收据。确定要继续吗？',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) => `已开始结算。在 ${submitterDisplayName} 启用其钱包之前，付款将被暂挂。`,
        enableWallet: '启用钱包',
        hold: '暂挂',
        unhold: '移除保留',
        holdExpense: () => ({
            one: '暂挂费用',
            other: '暂挂报销',
        }),
        unholdExpense: '取消暂挂报销',
        heldExpense: '已暂扣此费用',
        unheldExpense: '取消冻结此报销',
        moveUnreportedExpense: '移动未报销费用',
        addUnreportedExpense: '添加未报销的费用',
        selectUnreportedExpense: '请选择至少一笔报销添加到报表中。',
        emptyStateUnreportedExpenseTitle: '没有未报销的费用',
        emptyStateUnreportedExpenseSubtitle: '看起来你没有任何未报销的费用。试着在下面创建一笔。',
        addUnreportedExpenseConfirm: '添加到报表',
        newReport: '新报表',
        explainHold: () => ({
            one: '请说明您为何暂缓处理此报销。',
            other: '请解释您为何暂缓处理这些报销。',
        }),
        retracted: '已撤回',
        retract: '撤回',
        reopened: '已重新打开',
        reopenReport: '重新打开报告',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) => `此报告已导出到 ${connectionName}。更改它可能会导致数据不一致。您确定要重新打开此报告吗？`,
        reason: '原因',
        holdReasonRequired: '进行暂挂时需要提供原因。',
        expenseWasPutOnHold: '报销已被搁置',
        expenseOnHold: '此报销已被搁置。请查看评论以了解下一步操作。',
        expensesOnHold: '所有报销都已被暂停。请查看评论以了解下一步操作。',
        expenseDuplicate: '此报销与另一条报销的详细信息相似。请查看重复项以继续。',
        someDuplicatesArePaid: '其中有些重复项已经被批准或支付。',
        reviewDuplicates: '查看重复项',
        keepAll: '全部保留',
        confirmApprove: '确认批准金额',
        confirmApprovalAmount: '仅批准符合规定的报销，或批准整份报表。',
        confirmApprovalAllHoldAmount: () => ({
            one: '此报销已被暂挂。仍然要批准吗？',
            other: '这些报销已被搁置。仍然要批准吗？',
        }),
        confirmPay: '确认付款金额',
        confirmPayAmount: '支付未被搁置的部分，或支付整份报表。',
        confirmPayAllHoldAmount: () => ({
            one: '此报销目前被搁置。您仍然要支付吗？',
            other: '这些报销目前被搁置。你仍然想要付款吗？',
        }),
        payOnly: '仅付款',
        approveOnly: '仅批准',
        holdEducationalTitle: '你应该暂缓处理这笔报销吗？',
        whatIsHoldExplain: '“暂挂”就像对一笔报销按下“暂停键”，直到你准备好提交为止。',
        holdIsLeftBehind: '即使你提交了整份报销报告，被暂挂的报销也会被保留在外。',
        unholdWhenReady: '当你准备好提交报销时，取消对其的搁置。',
        changePolicyEducational: {
            title: '你已移动此报表！',
            description: '请再次检查这些项目，因为在将报表移至新工作区时，它们往往会发生变化。',
            reCategorize: '<strong>重新分类所有费用</strong>以符合工作区规则。',
            workflows: '此报表现在可能需要遵循不同的<strong>审批流程。</strong>',
        },
        changeWorkspace: '切换工作区',
        set: '设置',
        changed: '已更改',
        removed: '已移除',
        transactionPending: '交易待处理。',
        chooseARate: '请选择一个工作区的每英里或每公里报销费率',
        unapprove: '取消批准',
        unapproveReport: '撤销批准报表',
        headsUp: '提醒一下！',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `此报表已导出到 ${accountingIntegration}。更改它可能会导致数据不一致。确定要取消批准此报表吗？`,
        reimbursable: '可报销',
        nonReimbursable: '不予报销',
        bookingPending: '此预订正在待处理',
        bookingPendingDescription: '此预订尚未付款，因此处于待处理状态。',
        bookingArchived: '此预订已归档',
        bookingArchivedDescription: '此预订已被归档，因为行程日期已过。如有需要，请为最终金额添加一笔报销。',
        attendees: '参与者',
        whoIsYourAccountant: '你的会计是谁？',
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
            one: `第一天：1 小时`,
            other: (count: number) => `第一天：${count.toFixed(2)} 小时`,
        }),
        lastDayText: () => ({
            one: `最后一天：1小时`,
            other: (count: number) => `最后一天：${count.toFixed(2)} 小时`,
        }),
        tripLengthText: () => ({
            one: `行程：1整天`,
            other: (count: number) => `行程：${count} 个完整天数`,
        }),
        dates: '日期',
        rates: '费率',
        submitsTo: ({name}: SubmitsToParams) => `提交给 ${name}`,
        reject: {
            educationalTitle: '你应该保留还是拒绝？',
            educationalText: '如果你还没准备好批准或支付一笔报销，你可以暂缓处理或拒绝它。',
            holdExpenseTitle: '在审批或付款前暂缓处理报销，以便请求更多详细信息。',
            approveExpenseTitle: '在保留搁置报销分配给您的同时，审批其他报销。',
            heldExpenseLeftBehindTitle: '当你批准整份报销报告时，被搁置的费用会被留在原处。',
            rejectExpenseTitle: '拒绝你不打算批准或支付的报销。',
            reasonPageTitle: '拒绝报销',
            reasonPageDescription: '请说明您拒绝此报销的原因。',
            rejectReason: '拒绝原因',
            markAsResolved: '标记为已解决',
            rejectedStatus: '该报销已被拒绝。请先修复问题并标记为已解决，以便重新提交。',
            reportActions: {
                rejectedExpense: '拒绝了此报销',
                markedAsResolved: '已将拒绝原因标记为已解决',
            },
        },
        moveExpenses: () => ({one: '移动报销', other: '移动报销费用'}),
        moveExpensesError: '您无法将每日津贴费用移至其他工作区的报告，因为不同工作区之间的每日津贴费率可能有所不同。',
        changeApprover: {
            title: '更改审批人',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `选择一个选项来更改此报告的审批人。（更新您的<a href="${workflowSettingLink}">工作区设置</a>，可永久更改所有报告的审批人。）`,
            changedApproverMessage: (managerID: number) => `将审批人更改为 <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: '添加审批人',
                addApproverSubtitle: '在现有工作流程中添加一位额外的审批人。',
                bypassApprovers: '绕过审批人',
                bypassApproversSubtitle: '将自己指定为最终审批人，并跳过所有剩余审批人。',
            },
            addApprover: {
                subtitle: '在我们将此报销单送交其余审批流程之前，请为其选择一位额外的审批人。',
            },
        },
        chooseWorkspace: '选择一个工作区',
        date: '日期',
        splitDates: '拆分日期',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate} 至 ${endDate}（${count} 天）`,
        splitByDate: '按日期拆分',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `报告因自定义审批工作流而转发至 ${to}`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? '小时' : '小时'} @ ${rate} / 小时`,
            hrs: '小时',
            hours: '小时',
            ratePreview: (rate: string) => `${rate} / 小时`,
            amountTooLargeError: '总金额过大。请减少工时或降低费率。',
        },
        correctDistanceRateError: '修复里程费率错误后请重试。',
        AskToExplain: `. <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}"><strong>解释</strong></a> &#x2728;`,
        policyRulesModifiedFields: (policyRulesModifiedFields: PolicyRulesModifiedFields, policyRulesRoute: string, formatList: (list: string[]) => string) => {
            const entries = ObjectUtils.typedEntries(policyRulesModifiedFields);
            const fragments = entries.map(([key, value], i) => {
                const isFirst = i === 0;
                if (key === 'reimbursable') {
                    return value ? '将该报销单标记为“可报销”' : '将该报销单标记为“不可报销”';
                }
                if (key === 'billable') {
                    return value ? '将该报销标记为“可向客户收费”' : '已将该报销标记为“不可计费”';
                }
                if (key === 'tax') {
                    const taxEntry = value as PolicyRulesModifiedFields['tax'];
                    const taxRateName = taxEntry?.field_id_TAX.name ?? '';
                    if (isFirst) {
                        return `将税率设置为“${taxRateName}”`;
                    }
                    return `税率为“${taxRateName}”`;
                }
                const updatedValue = value as string | boolean;
                if (isFirst) {
                    return `将 ${translations.common[key].toLowerCase()} 设置为 “${updatedValue}”`;
                }
                return `${translations.common[key].toLowerCase()} 为 “${updatedValue}”`;
            });
            return `${formatList(fragments)} 通过<a href="${policyRulesRoute}">工作区规则</a>`;
        },
    },
    transactionMerge: {
        listPage: {
            header: '合并报销',
            noEligibleExpenseFound: '未找到符合条件的报销项目',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>您没有任何可以与此合并的报销。<a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">了解更多</a>符合条件的报销。</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `选择一个<a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">符合条件的费用</a>与<strong>${reportName}</strong>合并。`,
        },
        receiptPage: {
            header: '选择收据',
            pageTitle: '选择要保留的收据：',
        },
        detailsPage: {
            header: '选择详情',
            pageTitle: '选择要保留的详细信息：',
            noDifferences: '未发现交易之间存在差异',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? '一个' : 'a';
                return `请选择${article}${field}`;
            },
            pleaseSelectAttendees: '请选择出席者',
            selectAllDetailsError: '在继续之前请选择所有详情。',
        },
        confirmationPage: {
            header: '确认详情',
            pageTitle: '确认你要保留的详细信息。未保留的详细信息将被删除。',
            confirmButton: '合并报销',
        },
    },
    share: {
        shareToExpensify: '分享至 Expensify',
        messageInputLabel: '消息',
    },
    notificationPreferencesPage: {
        header: '通知偏好',
        label: '提醒我有新消息',
        notificationPreferences: {
            always: '立即',
            daily: '每天',
            mute: '静音',
            // @context UI label indicating that something is concealed or not visible to the user.
            hidden: '已隐藏',
        },
    },
    loginField: {
        numberHasNotBeenValidated: '该号码尚未验证。点击按钮通过短信重新发送验证链接。',
        emailHasNotBeenValidated: '电子邮箱尚未验证。点击按钮通过短信重新发送验证链接。',
    },
    avatarWithImagePicker: {
        uploadPhoto: '上传照片',
        removePhoto: '移除照片',
        editImage: '编辑照片',
        viewPhoto: '查看照片',
        imageUploadFailed: '图片上传失败',
        deleteWorkspaceError: '抱歉，删除您的工作区头像时出现了意外问题',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `所选图片超过了最大上传大小 ${maxUploadSizeInMB} MB。`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `请上传一张大于 ${minHeightInPx}x${minWidthInPx} 像素且小于 ${maxHeightInPx}x${maxWidthInPx} 像素的图片。`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `头像图片必须是以下类型之一：${allowedExtensions.join(', ')}。`,
    },
    avatarPage: {
        title: '编辑个人资料照片',
        upload: '上传',
        uploadPhoto: '上传照片',
        selectAvatar: '选择头像',
        choosePresetAvatar: '或选择自定义头像',
    },
    modal: {
        backdropLabel: '模态背景',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>你</strong>添加报销。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待 <strong>${actor}</strong> 添加报销。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员添加报销。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>你</strong>提交报销。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待 <strong>${actor}</strong> 提交报销。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员提交报销。`;
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
                        return `正在等待 <strong>${actor}</strong> 添加银行账户。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员添加银行账户。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: ({actor, actorType, eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `在 ${eta}` : ` ${eta}`;
                }
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>您的</strong>报销单自动提交${formattedETA}。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待<strong>${actor}</strong>的报销在${formattedETA}自动提交。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员的报销在${formattedETA}自动提交。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>你</strong>解决这些问题。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待<strong>${actor}</strong>解决问题。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员修复这些问题。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>您</strong>批准报销。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待<strong>${actor}</strong>审批报销。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员批准报销。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>你</strong>导出此报告。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待 <strong>${actor}</strong> 导出此报告。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员导出此报表。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>你</strong>支付报销费用。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待 <strong>${actor}</strong> 支付报销。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员报销费用。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>你</strong>完成企业银行账户的设置。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待<strong>${actor}</strong>完成企业银行账户的设置。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员完成企业银行账户的设置。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `在 ${eta} 之前` : ` ${eta}`;
                }
                return `正在等待付款完成${formattedETA}。`;
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_: NextStepParams) =>
                `哎呀！看起来你正在将报销单提交给<strong>自己</strong>。根据你的工作区规定，<strong>禁止</strong>自行审批报销单。请将此报销单提交给其他人，或联系你的管理员更改你的提交对象。`,
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: '很快',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '今天晚些时候',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '在周日',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '在每月的1日和16日',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '在本月的最后一个工作日',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '在本月的最后一天',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '在您行程结束时',
        },
    },
    profilePage: {
        profile: '个人资料',
        preferredPronouns: '首选代词',
        selectYourPronouns: '选择您的代词',
        selfSelectYourPronoun: '自选您的代词',
        emailAddress: '电子邮件地址',
        setMyTimezoneAutomatically: '自动设置我的时区',
        timezone: '时区',
        invalidFileMessage: '无效的文件。请尝试使用另一张图片。',
        avatarUploadFailureMessage: '上传头像时出错。请重试。',
        online: '在线',
        offline: '离线',
        syncing: '正在同步',
        profileAvatar: '个人资料头像',
        publicSection: {
            title: '公开',
            subtitle: '这些详细信息会显示在你的公开个人资料上，任何人都可以看到。',
        },
        privateSection: {
            title: '私人',
            subtitle: '这些信息将用于出行和付款，不会显示在您的公开个人资料中。',
        },
    },
    securityPage: {
        title: '安全选项',
        subtitle: '启用双重身份验证以确保您的账户安全。',
        goToSecurity: '返回安全页面',
    },
    shareCodePage: {
        title: '您的代码',
        subtitle: '通过分享你的个人二维码或推荐链接，将成员邀请到 Expensify。',
    },
    pronounsPage: {
        pronouns: '代词',
        isShownOnProfile: '你的代词会显示在你的个人资料中。',
        placeholderText: '搜索以查看选项',
    },
    contacts: {
        contactMethods: '联系方法',
        featureRequiresValidate: '此功能需要您验证您的账户。',
        validateAccount: '验证您的账户',
        helpText: ({email}: {email: string}) =>
            `添加更多方式登录并向 Expensify 发送收据。<br/><br/>添加一个电子邮箱地址，将收据转发至 <a href="mailto:${email}">${email}</a>，或添加一个电话号码，将收据短信发送至 47777（仅限美国号码）。`,
        pleaseVerify: '请验证此联系方式。',
        getInTouch: '我们将通过此方式联系你。',
        enterMagicCode: (contactMethod: string) => `请输入发送到 ${contactMethod} 的验证码。它应在一两分钟内送达。`,
        setAsDefault: '设为默认',
        yourDefaultContactMethod: '这是您当前的默认联系方法。在您删除它之前，您需要先选择另一种联系方法并点击“设为默认”。',
        removeContactMethod: '移除联系方式',
        removeAreYouSure: '确定要删除此联系方式吗？此操作无法撤销。',
        failedNewContact: '添加此联系方式失败。',
        genericFailureMessages: {
            requestContactMethodValidateCode: '发送新的魔法验证码失败。请稍等片刻后重试。',
            validateSecondaryLogin: '魔法代码不正确或无效。请重试或申请新代码。',
            deleteContactMethod: '删除联系方式失败。请联系 Concierge 获取帮助。',
            setDefaultContactMethod: '设置新的默认联系方式失败。请联系 Concierge 获取帮助。',
            addContactMethod: '无法添加此联系方法。请联系 Concierge 获取帮助。',
            enteredMethodIsAlreadySubmitted: '此联系方式已存在',
            passwordRequired: '需要密码。',
            contactMethodRequired: '必须填写联系方式',
            invalidContactMethod: '联系人方式无效',
        },
        newContactMethod: '新联系方式',
        goBackContactMethods: '返回到联系方式',
    },
    // cspell:disable
    pronouns: {
        coCos: '公司 / 成本中心',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: '他 / 他 / 他的',
        heHimHisTheyThemTheirs: '他 / 他 / 他的 / 他们 / 他们 / 他们的',
        sheHerHers: '她 / 她 / 她的',
        sheHerHersTheyThemTheirs: '她 / 她 / 她的 / 他们 / 他们 / 他们的',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: '每 / 每人',
        theyThemTheirs: 'TA / TA / TA的',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: '我们 / 我们的',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: '用我的名字称呼我',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: '显示名称',
        isShownOnProfile: '您的显示名称会显示在您的个人资料中。',
    },
    timezonePage: {
        timezone: '时区',
        isShownOnProfile: '您的时区会显示在您的个人资料中。',
        getLocationAutomatically: '自动确定您的位置',
    },
    updateRequiredView: {
        updateRequired: '需要更新',
        pleaseInstall: '请更新到最新版 New Expensify',
        pleaseInstallExpensifyClassic: '请安装最新版本的 Expensify',
        toGetLatestChanges: '对于移动端，请下载并安装最新版本。对于网页端，请刷新浏览器。',
        newAppNotAvailable: '新版 Expensify 应用已不再提供。',
    },
    initialSettingsPage: {
        about: '关于',
        aboutPage: {
            description: '全新的 Expensify 应用由来自世界各地的开源开发者社区共同打造。帮助我们一起构建 Expensify 的未来。',
            appDownloadLinks: '应用下载链接',
            viewKeyboardShortcuts: '查看键盘快捷键',
            viewTheCode: '查看代码',
            viewOpenJobs: '查看未完成的工作',
            reportABug: '报告错误',
            troubleshoot: '疑难解答',
        },
        appDownloadLinks: {
            android: {
                label: 'Android',
            },
            ios: {
                label: 'iOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: '清除缓存并重新启动',
            viewConsole: '查看调试控制台',
            debugConsole: '调试控制台',
            description: '<muted-text>使用下面的工具来帮助排查 Expensify 的使用问题。如果遇到任何问题，请<concierge-link>提交错误报告</concierge-link>。</muted-text>',
            confirmResetDescription: '所有未发送的草稿消息将会丢失，但您的其他数据是安全的。',
            resetAndRefresh: '重置并刷新',
            clientSideLogging: '客户端日志记录',
            noLogsToShare: '没有可共享的日志',
            useProfiling: '使用性能分析',
            profileTrace: '配置文件跟踪',
            results: '结果',
            releaseOptions: '发布选项',
            testingPreferences: '测试偏好设置',
            useStagingServer: '使用预发布服务器',
            forceOffline: '强制离线',
            simulatePoorConnection: '模拟网络连接不佳',
            simulateFailingNetworkRequests: '模拟网络请求失败',
            authenticationStatus: '认证状态',
            deviceCredentials: '设备凭证',
            invalidate: '作废',
            destroy: '销毁',
            maskExportOnyxStateData: '导出 Onyx 状态时屏蔽敏感成员数据',
            exportOnyxState: '导出 Onyx 状态',
            importOnyxState: '导入 Onyx 状态',
            testCrash: '测试崩溃',
            resetToOriginalState: '重置为原始状态',
            usingImportedState: '您正在使用导入的状态。点此清除。',
            debugMode: '调试模式',
            invalidFile: '无效的文件',
            invalidFileDescription: '您尝试导入的文件无效。请重试。',
            invalidateWithDelay: '延迟失效',
            recordTroubleshootData: '记录故障排查数据',
            softKillTheApp: '软关闭应用',
            kill: '终止',
            sentryDebug: 'Sentry调试',
            sentryDebugDescription: '将Sentry请求记录到控制台',
            sentryHighlightedSpanOps: '突出显示的Span名称',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interaction.click, navigation, ui.load',
            leftHandNavCache: '左侧导航缓存',
            clearleftHandNavCache: '清除',
        },
        debugConsole: {
            saveLog: '保存日志',
            shareLog: '分享日志',
            enterCommand: '输入命令',
            execute: '执行',
            noLogsAvailable: '没有可用的日志',
            logSizeTooLarge: ({size}: LogSizeParams) => `日志大小超过 ${size} MB 限制。请使用“保存日志”来下载日志文件。`,
            logs: '日志',
            viewConsole: '查看控制台',
        },
        security: '安全',
        signOut: '退出登录',
        restoreStashed: '恢复暂存的登录',
        signOutConfirmationText: '如果你退出登录，任何离线更改都会丢失。',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>阅读<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">服务条款</a>和<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">隐私政策</a>。</muted-text-micro>`,
        help: '帮助',
        whatIsNew: '新功能',
        accountSettings: '账户设置',
        account: '账户',
        general: '常规',
    },
    closeAccountPage: {
        // @context close as a verb, not an adjective
        closeAccount: '关闭账户',
        reasonForLeavingPrompt: '我们很不舍得你离开！能告诉我们原因，以便我们改进吗？',
        enterMessageHere: '在此输入消息',
        closeAccountWarning: '关闭您的账户后将无法撤销。',
        closeAccountPermanentlyDeleteData: '您确定要删除您的账户吗？这将永久删除所有未结报销。',
        enterDefaultContactToConfirm: '请输入您的默认联系方法以确认您希望关闭账户。您的默认联系方法为：',
        enterDefaultContact: '输入您的默认联系方法',
        defaultContact: '默认联系方式',
        enterYourDefaultContactMethod: '请输入您的默认联系方式以关闭您的账户。',
    },
    mergeAccountsPage: {
        mergeAccount: '合并账户',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `输入您想要合并到 <strong>${login}</strong> 的账户。`,
            notReversibleConsent: '我明白这不可逆转',
        },
        accountValidate: {
            confirmMerge: '您确定要合并账户吗？',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) => `合并您的账户是不可逆的，并且会导致 <strong>${login}</strong> 的所有未提交报销被清除。`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `要继续，请输入发送到 <strong>${login}</strong> 的魔法代码。`,
            errors: {
                incorrectMagicCode: '魔法代码不正确或无效。请重试或申请新代码。',
                fallback: '出现问题。请稍后重试。',
            },
        },
        mergeSuccess: {
            accountsMerged: '账户已合并！',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>您已成功将来自 <strong>${from}</strong> 的所有数据合并到 <strong>${to}</strong>。今后，您可以使用任一登录方式访问此账户。</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '我们正在处理此事',
            limitedSupport: '我们目前尚不支持在 New Expensify 上合并账户。请改在 Expensify Classic 上执行此操作。',
            reachOutForHelp: '<muted-text><centered-text>如果你有任何问题，请随时<concierge-link>联系 Concierge</concierge-link>！</centered-text></muted-text>',
            goToExpensifyClassic: '前往 Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>您无法合并 <strong>${email}</strong>，因为它由 <strong>${email.split('@').at(1) ?? ''}</strong> 控制。请<concierge-link>联系 Concierge</concierge-link>获取帮助。</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>你无法将 <strong>${email}</strong> 合并到其他账号中，因为你的域管理员已将其设为你的主要登录账号。请将其他账号合并到此账号中。</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>您无法合并账户，因为 <strong>${email}</strong> 已启用双重验证 (2FA)。请为 <strong>${email}</strong> 禁用 2FA，然后重试。</centered-text></muted-text>`,
            learnMore: '了解更多关于合并账户的信息。',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>你无法合并<strong>${email}</strong>，因为它已被锁定。请<concierge-link>联系 Concierge</concierge-link>获取帮助。</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>您无法合并账号，因为 <strong>${email}</strong> 没有 Expensify 账号。请<a href="${contactMethodLink}">将其添加为联系方式</a>。</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>您无法将<strong>${email}</strong>合并到其他账户中。请改为将其他账户合并到该账户。</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>你无法将账户合并到 <strong>${email}</strong>，因为此账户拥有已开发票的计费关系。</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '请稍后再试',
            description: '尝试合并账户的次数过多。请稍后重试。',
        },
        mergeFailureUnvalidatedAccount: {
            description: '您无法合并到其他账户，因为该账户尚未验证。请先验证该账户，然后重试。',
        },
        mergeFailureSelfMerge: {
            description: '您不能将一个账户与其自身合并。',
        },
        mergeFailureGenericHeading: '无法合并账户',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '报告可疑活动',
        lockAccount: '锁定账户',
        unlockAccount: '解锁账户',
        compromisedDescription: '发现您的账户有异常？报告后将立即锁定您的账户，阻止新的 Expensify Card 交易，并禁止进行任何账户更改。',
        domainAdminsDescription: '对于域管理员：这也会暂停您域内所有 Expensify Card 活动和管理员操作。',
        areYouSure: '你确定要锁定你的 Expensify 账户吗？',
        onceLocked: '一旦被锁定，您的账户将受到限制，直到提交解锁请求并完成安全审查',
    },
    failedToLockAccountPage: {
        failedToLockAccount: '锁定账户失败',
        failedToLockAccountDescription: `我们无法锁定您的账户。请与 Concierge 联系以解决此问题。`,
        chatWithConcierge: '与 Concierge 聊天',
    },
    unlockAccountPage: {
        accountLocked: '账户已锁定',
        yourAccountIsLocked: '您的账户已被锁定',
        chatToConciergeToUnlock: '与 Concierge 聊天以解决安全问题并解锁您的账户。',
        chatWithConcierge: '与 Concierge 聊天',
    },
    twoFactorAuth: {
        headerTitle: '双重身份验证',
        twoFactorAuthEnabled: '已启用双重身份验证',
        whatIsTwoFactorAuth: '双重身份验证（2FA）有助于保护您的账户安全。登录时，您需要输入由首选验证器应用生成的验证码。',
        disableTwoFactorAuth: '禁用双重身份验证',
        explainProcessToRemove: '若要禁用双重身份验证 (2FA)，请输入来自您的身份验证应用中的有效验证码。',
        explainProcessToRemoveWithRecovery: '若要停用双重身份验证 (2FA)，请输入有效的恢复代码。',
        disabled: '双重身份验证已被禁用',
        noAuthenticatorApp: '你将不再需要使用验证器应用来登录 Expensify。',
        stepCodes: '恢复代码',
        keepCodesSafe: '请妥善保管这些恢复代码！',
        codesLoseAccess: dedent(`
            如果你失去对身份验证应用的访问权限，并且没有这些代码，你将无法访问你的账户。

            注意：设置双重验证将会让你从所有其他活动会话中登出。
        `),
        errorStepCodes: '在继续之前，请先复制或下载代码',
        stepVerify: '验证',
        scanCode: '使用您的手机扫描二维码',
        authenticatorApp: '身份验证器应用',
        addKey: '或者将此密钥添加到你的身份验证器应用：',
        enterCode: '然后输入由您的身份验证器应用生成的六位数验证码。',
        stepSuccess: '已完成',
        enabled: '已启用双重身份验证',
        congrats: '恭喜！现在你多了一层额外的安全保护。',
        copy: '复制',
        disable: '禁用',
        enableTwoFactorAuth: '启用双重身份验证',
        pleaseEnableTwoFactorAuth: '请启用双重身份验证。',
        twoFactorAuthIsRequiredDescription: '出于安全原因，Xero 要求使用双重身份验证才能连接此集成。',
        twoFactorAuthIsRequiredForAdminsHeader: '需要双重身份验证',
        twoFactorAuthIsRequiredForAdminsTitle: '请启用双重身份验证',
        twoFactorAuthIsRequiredXero: '您的 Xero 会计连接需要启用双重身份验证。',
        twoFactorAuthIsRequiredCompany: '您的公司要求使用双重身份验证。',
        twoFactorAuthCannotDisable: '无法禁用双重身份验证',
        twoFactorAuthRequired: '您的 Xero 连接需要启用双重身份验证 (2FA)，且无法将其禁用。',
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
            pleaseFillTwoFactorAuth: '请输入您的双重身份验证代码',
            incorrect2fa: '两步验证代码不正确。请重试。',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: '密码已更新！',
        allSet: '一切就绪。请妥善保管你的新密码。',
    },
    privateNotes: {
        title: '私人备注',
        personalNoteMessage: '在此记录关于此聊天的笔记。只有你可以添加、编辑或查看这些笔记。',
        sharedNoteMessage: '在此记录关于此聊天的备注。Expensify 员工和 team.expensify.com 域中的其他成员可以查看这些备注。',
        composerLabel: '备注',
        myNote: '我的备注',
        error: {
            genericFailureMessage: '无法保存私人备注',
        },
    },
    billingCurrency: {
        error: {
            securityCode: '请输入有效的安全码',
        },
        securityCode: '安全代码',
        changeBillingCurrency: '更改结算货币',
        changePaymentCurrency: '更改付款货币',
        paymentCurrency: '付款货币',
        paymentCurrencyDescription: '选择一个标准货币，用于转换所有个人报销费用',
        note: `注意：更改您的付款货币可能会影响您为 Expensify 支付的金额。完整详情请参阅我们的<a href="${CONST.PRICING}">定价页面</a>。`,
    },
    addDebitCardPage: {
        addADebitCard: '添加借记卡',
        nameOnCard: '卡片上的姓名',
        debitCardNumber: '借记卡号',
        expiration: '到期日期',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: '账单地址',
        growlMessageOnSave: '已成功添加您的借记卡',
        expensifyPassword: 'Expensify 密码',
        error: {
            invalidName: '名称只能包含字母',
            addressZipCode: '请输入有效的邮政编码',
            debitCardNumber: '请输入有效的借记卡号',
            expirationDate: '请选择有效的到期日期',
            securityCode: '请输入有效的安全码',
            addressStreet: '请输入一个不是邮政信箱的有效账单地址',
            addressState: '请选择一个州',
            addressCity: '请输入城市',
            genericFailureMessage: '添加您的银行卡时出现错误。请重试。',
            password: '请输入您的 Expensify 密码',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '添加付款卡',
        nameOnCard: '卡片上的姓名',
        paymentCardNumber: '卡号',
        expiration: '到期日期',
        expirationDate: '月/年',
        cvv: 'CVV',
        billingAddress: '账单地址',
        growlMessageOnSave: '您的支付卡已成功添加',
        expensifyPassword: 'Expensify 密码',
        error: {
            invalidName: '名称只能包含字母',
            addressZipCode: '请输入有效的邮政编码',
            paymentCardNumber: '请输入有效的卡号',
            expirationDate: '请选择有效的到期日期',
            securityCode: '请输入有效的安全码',
            addressStreet: '请输入一个不是邮政信箱的有效账单地址',
            addressState: '请选择一个州',
            addressCity: '请输入城市',
            genericFailureMessage: '添加您的银行卡时出现错误。请重试。',
            password: '请输入您的 Expensify 密码',
        },
    },
    walletPage: {
        balance: '余额',
        paymentMethodsTitle: '付款方式',
        setDefaultConfirmation: '设为默认付款方式',
        setDefaultSuccess: '默认支付方式已设置！',
        deleteAccount: '删除账户',
        deleteConfirmation: '您确定要删除此账户吗？',
        error: {
            notOwnerOfBankAccount: '将此银行账户设为您的默认付款方式时发生错误',
            invalidBankAccount: '此银行账户已被暂时停用',
            notOwnerOfFund: '将此卡设为您的默认付款方式时发生错误',
            setDefaultFailure: '出现错误。请与 Concierge 聊天以获取进一步帮助。',
        },
        addBankAccountFailure: '在尝试添加您的银行账户时发生意外错误。请重试。',
        getPaidFaster: '更快收到款项',
        addPaymentMethod: '在应用中添加支付方式，以便直接发送和接收付款。',
        getPaidBackFaster: '更快拿回报销款',
        secureAccessToYourMoney: '安全访问您的资金',
        receiveMoney: '以本地货币收款',
        expensifyWallet: 'Expensify 钱包（测试版）',
        sendAndReceiveMoney: '与朋友之间收发款项。仅限美国银行账户。',
        enableWallet: '启用钱包',
        addBankAccountToSendAndReceive: '添加银行账户以进行或接收付款。',
        addDebitOrCreditCard: '添加借记卡或信用卡',
        assignedCards: '已分配的卡片',
        assignedCardsDescription: '这些卡的交易会自动同步。',
        expensifyCard: 'Expensify Card',
        walletActivationPending: '我们正在审核您的信息。请几分钟后再回来查看！',
        walletActivationFailed: '很遗憾，您的钱包目前无法启用。请与 Concierge 聊天以获得更多帮助。',
        addYourBankAccount: '添加您的银行账户',
        addBankAccountBody: '让我们将你的银行账户连接到 Expensify，这样你就可以在应用中更轻松地直接发送和接收付款。',
        chooseYourBankAccount: '选择您的银行账户',
        chooseAccountBody: '请确保选择正确的那个。',
        confirmYourBankAccount: '确认您的银行账户',
        personalBankAccounts: '个人银行账户',
        businessBankAccounts: '企业银行账户',
        shareBankAccount: '共享银行账户',
        bankAccountShared: '已共享银行账户',
        shareBankAccountTitle: '选择要共享此银行账户的管理员：',
        shareBankAccountSuccess: '已共享银行账户！',
        shareBankAccountSuccessDescription: '选定的管理员将收到来自礼宾部的确认消息。',
        shareBankAccountFailure: '尝试共享银行账户时发生意外错误。请重试。',
        shareBankAccountEmptyTitle: '暂无管理员可用',
        shareBankAccountEmptyDescription: '没有可与您共享此银行账户的工作区管理员。',
        shareBankAccountNoAdminsSelected: '请先选择一位管理员再继续',
        unshareBankAccount: '取消共享银行账户',
        unshareBankAccountDescription: '以下所有用户均可访问此银行账户。您可以随时取消访问权限。我们仍将完成所有正在进行的付款。',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} 将失去对此企业银行账户的访问权限。我们仍将完成所有正在进行的付款。`,
        reachOutForHelp: '此账户正在与 Expensify 卡一起使用。如果您需要取消共享，请联系礼宾部。',
        unshareErrorModalTitle: '无法取消共享银行账户',
        deleteCard: '删除卡片',
        deleteCardConfirmation: '所有未提交的银行卡交易（包括开放报表中的交易）都将被移除。确定要删除此银行卡吗？此操作无法撤销。',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify 差旅卡',
        availableSpend: '剩余额度',
        smartLimit: {
            name: '智能限额',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `您可以在此卡上消费最高 ${formattedLimit}，当您提交的报销被批准后，额度将会重置。`,
        },
        fixedLimit: {
            name: '固定上限',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `您可以在此卡上消费最多 ${formattedLimit}，之后该卡将被停用。`,
        },
        monthlyLimit: {
            name: '月度限额',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `您每月在此卡上的最高可用额度为 ${formattedLimit}。该额度将在每个日历月的第 1 天重置。`,
        },
        virtualCardNumber: '虚拟卡号',
        travelCardCvv: '差旅卡 CVV',
        physicalCardNumber: '实体卡号',
        physicalCardPin: 'PIN',
        getPhysicalCard: '获取实体卡',
        reportFraud: '报告虚拟卡欺诈',
        reportTravelFraud: '报告差旅卡欺诈',
        reviewTransaction: '审核交易',
        suspiciousBannerTitle: '可疑交易',
        suspiciousBannerDescription: '我们注意到您的卡上有可疑交易。请点击下方进行查看。',
        cardLocked: '在我们团队审核您公司的账户期间，您的卡已被暂时锁定。',
        markTransactionsAsReimbursable: '将交易标记为可报销',
        markTransactionsDescription: '启用后，从此卡导入的交易将默认标记为可报销。',
        cardDetails: {
            cardNumber: '虚拟卡号',
            expiration: '到期',
            cvv: 'CVV',
            address: '地址',
            revealDetails: '显示详情',
            revealCvv: '显示 CVV',
            copyCardNumber: '复制卡号',
            updateAddress: '更新地址',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `已添加到 ${platform} 钱包`,
        cardDetailsLoadingFailure: '加载卡片详情时出错。请检查您的互联网连接，然后重试。',
        validateCardTitle: '让我们确认是你',
        enterMagicCode: (contactMethod: string) => `请输入发送到 ${contactMethod} 的魔法验证码以查看您的卡片详情。它通常会在一两分钟内送达。`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `请先<a href="${missingDetailsLink}">添加您的个人信息</a>，然后再试一次。`,
        unexpectedError: '尝试获取您的 Expensify 卡片详情时出错。请重试。',
        cardFraudAlert: {
            confirmButtonText: '是的，我愿意',
            reportFraudButtonText: '不，不是我',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `已清除可疑活动并重新激活尾号为 x${cardLastFour} 的卡片。一切就绪，可以继续报销了！`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `已停用以 ${cardLastFour} 结尾的卡片`,
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
            }) => `在尾号为 ${cardLastFour} 的卡上发现可疑活动。您是否认得这笔消费？

${amount}，商户：${merchant} - ${date}`,
        },
        csvCardDescription: 'CSV 导入',
    },
    workflowsPage: {
        workflowTitle: '支出',
        workflowDescription: '从支出发生的那一刻起配置完整的工作流，包括审批和付款。',
        submissionFrequency: '提交',
        submissionFrequencyDescription: '选择一个自定义报销提交计划。',
        submissionFrequencyDateOfMonth: '月份中的日期',
        disableApprovalPromptDescription: '禁用审批将删除所有现有的审批工作流程。',
        addApprovalsTitle: '审批',
        addApprovalButton: '添加审批工作流程',
        addApprovalTip: '此默认工作流程适用于所有成员，除非存在更具体的工作流程。',
        approver: '审批人',
        addApprovalsDescription: '在授权付款前需要额外审批。',
        makeOrTrackPaymentsTitle: '付款',
        makeOrTrackPaymentsDescription: '为在 Expensify 中进行的付款添加授权付款人，或跟踪在其他地方进行的付款。',
        customApprovalWorkflowEnabled:
            '<muted-text-label>此工作区已启用自定义审批流程。要查看或更改此流程，请联系您的<account-manager-link>客户经理</account-manager-link>或<concierge-link>Concierge</concierge-link>。</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>此工作区已启用自定义审批流程。若要查看或更改此流程，请联系<concierge-link>Concierge</concierge-link>。</muted-text-label>',
        editor: {
            submissionFrequency: '选择 Expensify 在共享无错误支出前应等待多长时间。',
        },
        frequencyDescription: '选择费用自动提交的频率，或将其设置为手动',
        frequencies: {
            instant: '立即',
            weekly: '每周',
            monthly: '每月',
            twiceAMonth: '每月两次',
            byTrip: '按行程',
            manually: '手动',
            daily: '每天',
            lastDayOfMonth: '每月最后一天',
            lastBusinessDayOfMonth: '每月最后一个工作日',
            ordinals: {
                one: '第',
                two: '日',
                few: '路',
                other: '第',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': '第一',
                '2': '第二',
                '3': '第三',
                '4': '第四个',
                '5': '第五',
                '6': '第六',
                '7': '第七',
                '8': '第八',
                '9': '第九',
                '10': '第十',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: '此成员已属于另一审批工作流。在此所做的任何更新也会同步反映到那里。',
        approverCircularReference: (name1: string, name2: string) => `<strong>${name1}</strong> 已经把报销提交给 <strong>${name2}</strong> 审批。请另选一位审批人以避免形成循环审批流程。`,
        emptyContent: {
            title: '没有可显示的成员',
            expensesFromSubtitle: '所有工作区成员已属于现有的审批流程。',
            approverSubtitle: '所有审批人都属于一个现有的工作流程。',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: '无法更改提交频率。请重试或联系支持。',
        monthlyOffsetErrorMessage: '无法更改每月频率。请重试或联系客服支持。',
    },
    workflowsCreateApprovalsPage: {
        title: '确认',
        header: '添加更多审批人并确认。',
        additionalApprover: '额外审批人',
        submitButton: '添加工作流',
    },
    workflowsEditApprovalsPage: {
        title: '编辑审批流程',
        deleteTitle: '删除审批工作流程',
        deletePrompt: '确定要删除此审批流程吗？所有成员之后都将遵循默认流程。',
    },
    workflowsExpensesFromPage: {
        title: '来自的报销',
        header: '当以下成员提交报销时：',
    },
    workflowsApproverPage: {
        genericErrorMessage: '无法更改审批人。请重试或联系支持。',
        title: '发送给该成员以供审批：',
        description: '此人将审批费用。',
    },
    workflowsApprovalLimitPage: {
        title: '审批人',
        header: '（可选）是否添加审批限额？',
        description: ({approverName}: {approverName: string}) =>
            approverName ? `当<strong>${approverName}</strong>为审批人且报告超过以下金额时，添加另一位审批人：` : '当报告超过以下金额时，添加另一位审批人：',
        reportAmountLabel: '报告金额',
        additionalApproverLabel: '额外审批人',
        skip: '跳过',
        next: '下一步',
        removeLimit: '移除限额',
        enterAmountError: '请输入有效金额',
        enterApproverError: '设置报告限额时需要审批人',
        enterBothError: '请输入报告金额和额外审批人',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `超过${approvalLimit}的报告将转发给${approverName}`,
    },
    workflowsPayerPage: {
        title: '授权付款人',
        genericErrorMessage: '无法更改授权付款人。请重试。',
        admins: '管理员',
        payer: '付款方',
        paymentAccount: '付款账户',
    },
    reportFraudPage: {
        title: '报告虚拟卡欺诈',
        description: '如果您的虚拟卡信息被盗或遭到泄露，我们将永久停用您现有的卡片，并为您提供一张新的虚拟卡和卡号。',
        deactivateCard: '停用卡片',
        reportVirtualCardFraud: '报告虚拟卡欺诈',
    },
    reportFraudConfirmationPage: {
        title: '已报告卡片欺诈',
        description: '我们已永久停用你的现有卡片。当你返回查看卡片详情时，你将会看到一张新的虚拟卡可用。',
        buttonText: '明白了，谢谢！',
    },
    activateCardPage: {
        activateCard: '激活卡片',
        pleaseEnterLastFour: '请输入您银行卡的后四位数字。',
        activatePhysicalCard: '启用实体卡',
        error: {
            thatDidNotMatch: '这与您卡片的末四位数字不匹配。请重试。',
            throttled: '您多次错误输入了 Expensify 卡的后 4 位数字。如果您确定数字无误，请联系 Concierge 以解决问题。否则，请稍后再试。',
        },
    },
    getPhysicalCard: {
        header: '获取实体卡',
        nameMessage: '请输入您的名字和姓氏，因为这将显示在您的卡片上。',
        legalName: '法定姓名',
        legalFirstName: '法定名',
        legalLastName: '法定姓氏',
        phoneMessage: '请输入您的电话号码。',
        phoneNumber: '电话号码',
        address: '地址',
        addressMessage: '请输入您的收货地址。',
        streetAddress: '街道地址',
        city: '城市',
        state: '州',
        zipPostcode: '邮政编码',
        country: '国家',
        confirmMessage: '请在下方确认您的详细信息。',
        estimatedDeliveryMessage: '您的实体卡将在 2–3 个工作日内送达。',
        next: '下一步',
        getPhysicalCard: '获取实体卡',
        shipCard: '寄送卡片',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `转账${amount ? ` ${amount}` : ''}`,
        instant: '即时（借记卡）',
        instantSummary: (rate: string, minAmount: string) => `${rate}% 费用（最低 ${minAmount}）`,
        ach: '1–3 个工作日（银行账户）',
        achSummary: '无手续费',
        whichAccount: '哪个账户？',
        fee: '费用',
        transferSuccess: '转账成功！',
        transferDetailBankAccount: '您的款项应会在接下来的 1–3 个工作日内到账。',
        transferDetailDebitCard: '您的资金应会立即到账。',
        failedTransfer: '您的余额尚未完全结清。请转账到银行账户。',
        notHereSubTitle: '请在钱包页面转出您的余额',
        goToWallet: '前往钱包',
    },
    chooseTransferAccountPage: {
        chooseAccount: '选择账户',
    },
    paymentMethodList: {
        addPaymentMethod: '添加付款方式',
        addNewDebitCard: '添加新借记卡',
        addNewBankAccount: '添加新银行账户',
        accountLastFour: '结尾为',
        cardLastFour: '尾号为',
        addFirstPaymentMethod: '在应用中添加支付方式，以便直接发送和接收付款。',
        defaultPaymentMethod: '默认',
        bankAccountLastFour: (lastFour: string) => `银行账户 • ${lastFour}`,
    },
    expenseRulesPage: {
        title: '报销规则',
        subtitle: '这些规则将适用于你的报销。如果你提交到工作区，则该工作区的规则可能会覆盖这些规则。',
        findRule: '查找规则',
        emptyRules: {title: '你还没有创建任何规则', subtitle: '添加一条规则以自动化报销报告。'},
        changes: {
            billableUpdate: (value: boolean) => `更新报销 ${value ? '可计费' : '不可计费'}`,
            categoryUpdate: (value: string) => `将类别更新为“${value}”`,
            commentUpdate: (value: string) => `将描述更改为 “${value}”`,
            merchantUpdate: (value: string) => `将商户更新为“${value}”`,
            reimbursableUpdate: (value: boolean) => `更新报销 ${value ? '可报销' : '不予报销'}`,
            tagUpdate: (value: string) => `将标签更新为“${value}”`,
            taxUpdate: (value: string) => `将税率更新为 ${value}`,
            billable: (value: boolean) => `报销 ${value ? '可计费' : '不可计费'}`,
            category: (value: string) => `将类别为“${value}”`,
            comment: (value: string) => `将描述为 “${value}”`,
            merchant: (value: string) => `将商户为“${value}”`,
            reimbursable: (value: boolean) => `报销 ${value ? '可报销' : '不予报销'}`,
            tag: (value: string) => `将标签为“${value}”`,
            tax: (value: string) => `将税率为 ${value}`,
            report: (value: string) => `添加到名为“${value}”的报表`,
        },
        newRule: '新规则',
        addRule: {
            title: '添加规则',
            expenseContains: '如果报销包含：',
            applyUpdates: '然后应用这些更新：',
            merchantHint: '输入 * 以创建适用于所有商家的规则',
            addToReport: '添加到名为',
            createReport: '如有必要则创建报表',
            applyToExistingExpenses: '应用到现有匹配报销',
            confirmError: '输入商户并至少应用一项更新',
            confirmErrorMerchant: '请输入商家',
            confirmErrorUpdate: '请至少应用一次更新',
            saveRule: '保存规则',
        },
        editRule: {title: '编辑规则'},
        deleteRule: {deleteSingle: '删除规则', deleteMultiple: '删除规则', deleteSinglePrompt: '您确定要删除此规则吗？', deleteMultiplePrompt: '您确定要删除这些规则吗？'},
    },
    preferencesPage: {
        appSection: {
            title: '应用偏好设置',
        },
        testSection: {
            title: '测试偏好设置',
            subtitle: '用于在预发布环境中调试和测试应用的设置。',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '接收相关功能更新和 Expensify 新闻',
        muteAllSounds: '静音所有来自 Expensify 的声音',
    },
    priorityModePage: {
        priorityMode: '优先模式',
        explainerText: '选择仅#focus未读和已置顶的聊天，或显示所有聊天，并将最新和已置顶的聊天置于顶部。',
        priorityModes: {
            default: {
                label: '最新',
                description: '按最近排序显示所有聊天',
            },
            gsd: {
                label: '#专注',
                description: '仅显示按字母顺序排序的未读内容',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `在 ${policyName}`,
        generatingPDF: '正在生成  PDF',
        waitForPDF: '我们正在生成 PDF，请稍候',
        errorPDF: '尝试生成您的 PDF 时出错',
        successPDF: '你的 PDF 已生成！如果没有自动下载，请使用下面的按钮。',
    },
    reportDescriptionPage: {
        roomDescription: '房间描述',
        roomDescriptionOptional: '房间描述（可选）',
        explainerText: '为此房间设置自定义描述。',
    },
    groupChat: {
        lastMemberTitle: '提醒一下！',
        lastMemberWarning: '由于您是此处的最后一位成员，一旦离开，此聊天将对所有成员变为不可访问。您确定要离开吗？',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `${displayName} 的群聊`,
    },
    languagePage: {
        language: '语言',
        aiGenerated: '此语言的翻译由系统自动生成，可能包含错误。',
    },
    themePage: {
        theme: '主题',
        themes: {
            dark: {
                label: '深色',
            },
            light: {
                label: '浅色',
            },
            system: {
                label: '使用设备设置',
            },
        },
        chooseThemeBelowOrSync: '请选择下面的主题，或与您的设备设置同步。',
    },
    termsOfUse: {
        terms: `<muted-text-xs>登录即表示您同意<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">服务条款</a>和<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">隐私政策</a>。</muted-text-xs>`,
        license: `<muted-text-xs>资金转移服务由 ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}（NMLS ID:2017010）根据其<a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">许可证</a>提供。</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: '没有收到魔法验证码？',
        enterAuthenticatorCode: '请输入您的验证器验证码',
        enterRecoveryCode: '请输入您的恢复代码',
        requiredWhen2FAEnabled: '启用双重验证时为必填项',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `在<a>${timeRemaining}</a>后请求新验证码`,
        requestNewCodeAfterErrorOccurred: '请求新验证码',
        error: {
            pleaseFillMagicCode: '请输入您的魔法代码',
            incorrectMagicCode: '魔法代码不正确或无效。请重试或申请新代码。',
            pleaseFillTwoFactorAuth: '请输入您的双重身份验证代码',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: '请填写所有字段',
        pleaseFillPassword: '请输入您的密码',
        pleaseFillTwoFactorAuth: '请输入您的双重验证代码',
        enterYourTwoFactorAuthenticationCodeToContinue: '请输入您的双重身份验证代码以继续',
        forgot: '忘记了？',
        requiredWhen2FAEnabled: '启用双重验证时为必填项',
        error: {
            incorrectPassword: '密码错误。请重试。',
            incorrectLoginOrPassword: '登录名或密码不正确。请重试。',
            incorrect2fa: '两步验证代码不正确。请重试。',
            twoFactorAuthenticationEnabled: '此账户已启用双重身份验证 (2FA)。请使用您的邮箱或手机号登录。',
            invalidLoginOrPassword: '登录名或密码无效。请重试或重置您的密码。',
            unableToResetPassword:
                '我们无法更改您的密码。这很可能是由于您在旧的密码重置邮件中使用的密码重置链接已过期。我们已经向您发送了一个新的链接，您可以再试一次。请检查您的收件箱和垃圾邮件文件夹；邮件应会在几分钟内送达。',
            noAccess: '您无权访问此应用程序。请添加您的 GitHub 用户名以获取访问权限。',
            accountLocked: '由于多次尝试失败，您的账户已被锁定。请在 1 小时后重试。',
            fallback: '出现问题。请稍后重试。',
        },
    },
    loginForm: {
        phoneOrEmail: '电话或邮箱',
        error: {
            invalidFormatEmailLogin: '输入的邮箱无效。请修正格式后重试。',
        },
        cannotGetAccountDetails: '无法获取账户详情。请尝试重新登录。',
        loginForm: '登录表单',
        notYou: ({user}: NotYouParams) => `不是 ${user}？`,
    },
    onboarding: {
        welcome: '欢迎！',
        welcomeSignOffTitleManageTeam: '完成以上任务后，我们就可以探索更多功能，比如审批工作流和规则！',
        welcomeSignOffTitle: '很高兴见到你！',
        explanationModal: {
            title: '欢迎使用 Expensify',
            description: '一款应用即可以聊天般的速度处理您的商务和个人支出。试用一下，并告诉我们您的想法。更多精彩功能即将上线！',
            secondaryDescription: '要切换回 Expensify Classic，只需点击你的头像 > 前往 Expensify Classic。',
        },
        getStarted: '开始使用',
        whatsYourName: '你叫什么名字？',
        peopleYouMayKnow: '你可能认识的人已经在这儿了！验证你的邮箱加入他们吧。',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `来自 ${domain} 的某人已创建了一个工作空间。请输入发送到 ${email} 的魔法代码。`,
        joinAWorkspace: '加入工作区',
        listOfWorkspaces: '这是你可以加入的工作区列表。别担心，如果你愿意，你随时可以稍后加入。',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} 名成员${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: '你在哪里工作？',
        errorSelection: '选择一个选项以继续',
        purpose: {
            title: '你今天想做什么？',
            errorContinue: '请点击“继续”进行设置',
            errorBackButton: '请完成设置问题以开始使用此应用程序',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '由我的雇主报销支付',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: '管理我团队的报销',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '跟踪和预算支出',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '与朋友聊天并分摊费用',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: '其他内容',
        },
        employees: {
            title: '你有多少名员工？',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 名员工',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 名员工',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 名员工',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1,000 名员工',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '超过 1,000 名员工',
        },
        accounting: {
            title: '你是否使用任何会计软件？',
            none: '无',
        },
        interestedFeatures: {
            title: '您对哪些功能感兴趣？',
            featuresAlreadyEnabled: '以下是我们最受欢迎的功能：',
            featureYouMayBeInterestedIn: '启用其他功能',
        },
        error: {
            requiredFirstName: '请输入您的名字以继续',
        },
        workEmail: {
            title: '你的工作邮箱是什么？',
            subtitle: '当你连接工作邮箱时，Expensify 的效果最佳。',
            explanationModal: {
                descriptionOne: '转发到 receipts@expensify.com 进行扫描',
                descriptionTwo: '加入已经在使用 Expensify 的同事',
                descriptionThree: '享受更加个性化的体验',
            },
            addWorkEmail: '添加工作邮箱',
        },
        workEmailValidation: {
            title: '验证您的工作邮箱',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `请输入发送到 ${workEmail} 的验证码。它将在一两分钟内送达。`,
        },
        workEmailValidationError: {
            publicEmail: '请输入来自私人域的有效工作邮箱，例如 mitch@company.com',
            offline: '由于您似乎处于离线状态，我们无法添加您的工作邮箱',
        },
        mergeBlockScreen: {
            title: '无法添加工作邮箱',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) => `我们无法添加 ${workEmail}。请稍后在“设置”中重试，或与 Concierge 聊天以获取指导。`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `试用一下 [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[快速浏览产品](${testDriveURL})，了解为什么 Expensify 是处理报销的最快方式。`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `试用一下 [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `通过[试驾](${testDriveURL})来体验，让您的团队享受 *3 个月免费使用 Expensify！*`,
            },
            addExpenseApprovalsTask: {
                title: '添加报销审批',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *添加报销审批*，以便审核团队支出并将其控制在合理范围内。

                        操作步骤如下：

                        1. 进入 *Workspaces*。
                        2. 选择你的工作区。
                        3. 点击 *More features*。
                        4. 启用 *Workflows*。
                        5. 在工作区编辑器中进入 *Workflows*。
                        6. 启用 *Approvals*。
                        7. 你将被设为报销审批人。邀请团队成员后，你可以将此角色更改为任何管理员。

                        [带我前往更多功能](${workspaceMoreFeaturesLink})。`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[创建](${workspaceConfirmationLink})一个工作区`,
                description: '在设置专家的帮助下创建一个工作区并配置设置！',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `创建[工作区](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *创建一个工作区* 来跟踪费用、扫描收据、聊天等。

                        1. 点击 *工作区* > *新建工作区*。

                        *您的新工作区已准备就绪！* [去看看](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `设置[类别](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *设置类别*，以便您的团队为报销支出编码，从而轻松生成报表。

                        1. 点击 *Workspaces*。
                        2. 选择您的工作区。
                        3. 点击 *Categories*。
                        4. 禁用任何不需要的类别。
                        5. 在右上角添加您自己的类别。

                        [带我前往工作区类别设置](${workspaceCategoriesLink})。

                        ![设置类别](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: '提交报销',
                description: dedent(`
                    *提交报销*，可以输入金额或扫描收据。

                    1. 点击 ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} 按钮。
                    2. 选择 *创建报销*。
                    3. 输入金额或扫描收据。
                    4. 添加你老板的邮箱或电话号码。
                    5. 点击 *创建*。

                    就完成了！
                `),
            },
            adminSubmitExpenseTask: {
                title: '提交报销',
                description: dedent(`
                    通过输入金额或扫描收据来*提交报销*。

                    1. 点击 ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} 按钮。
                    2. 选择*创建报销*。
                    3. 输入金额或扫描收据。
                    4. 确认详情。
                    5. 点击*创建*。

                    就完成了！
                `),
            },
            trackExpenseTask: {
                title: '跟踪一笔报销',
                description: dedent(`
                    *记录一笔报销*，支持任意货币，无论是否有收据。

                    1. 点击 ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} 按钮。
                    2. 选择 *创建报销*。
                    3. 输入金额或扫描收据。
                    4. 选择你的 *个人* 空间。
                    5. 点击 *创建*。

                    就这么简单！是的，真的就这么容易。
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `连接${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : '到'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '您的' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        连接 ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '您的' : '到'} ${integrationName}，实现自动费用编码和同步，让月末结账轻松无比。

                        1. 点击 *Workspaces*。
                        2. 选择你的工作区。
                        3. 点击 *Accounting*。
                        4. 找到 ${integrationName}。
                        5. 点击 *Connect*。

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? `[带我前往会计页面](${workspaceAccountingLink}).

                        ![连接到 ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
        : `[带我前往会计页面](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `连接[您的公司信用卡](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        连接您已有的卡片，以自动导入交易、匹配收据和进行对账。

                        1. 点击 *Workspaces*。
                        2. 选择您的工作区。
                        3. 点击 *Company cards*。
                        4. 按照提示连接您的卡片。

                        [带我前往公司卡片](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `邀请[您的团队](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *邀请您的团队*加入 Expensify，这样他们今天就可以开始记录费用。

                        1. 点击 *Workspaces*。
                        2. 选择您的 workspace。
                        3. 点击 *Members* > *Invite member*。
                        4. 输入邮箱或电话号码。
                        5. 如有需要，可添加自定义邀请信息！

                        [带我前往 Workspace 成员页面](${workspaceMembersLink})。

                        ![邀请您的团队](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `设置[类别](${workspaceCategoriesLink})和[标签](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *设置类别和标签*，以便您的团队为报销费用编码，从而轻松生成报表。

                        通过[连接您的会计软件](${workspaceAccountingLink})自动导入，或在[工作区设置](${workspaceCategoriesLink})中手动设置。`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `设置[标签](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        使用标签为报销添加更多详细信息，例如项目、客户、地点和部门。如果你需要多级标签，可以升级到 Control 方案。

                        1. 点击 *Workspaces*。
                        2. 选择你的工作区。
                        3. 点击 *More features*。
                        4. 启用 *Tags*。
                        5. 在工作区编辑器中前往 *Tags*。
                        6. 点击 *+ Add tag* 创建你自己的标签。

                        [带我前往更多功能](${workspaceMoreFeaturesLink})。

                        ![设置标签](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `邀请你的[会计](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *邀请您的会计师*加入您的工作区，共同管理您的业务费用。

                        1. 点击 *工作区*。
                        2. 选择您的工作区。
                        3. 点击 *成员*。
                        4. 点击 *邀请成员*。
                        5. 输入您会计师的电子邮箱地址。

                        [立即邀请您的会计师](${workspaceMembersLink})。`),
            },
            startChatTask: {
                title: '开始聊天',
                description: dedent(`
                    使用他们的邮箱或手机号*开始聊天*。

                    1. 点击 ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} 按钮。
                    2. 选择 *开始聊天*。
                    3. 输入邮箱或手机号。

                    如果他们还没有在使用 Expensify，将会自动收到邀请。

                    每次聊天也会变成他们可以直接回复的电子邮件或短信。
                `),
            },
            splitExpenseTask: {
                title: '拆分一笔报销',
                description: dedent(`
                    与一人或多人*分摊费用*。

                    1. 点击 ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} 按钮。
                    2. 选择 *开始聊天*。
                    3. 输入邮箱地址或电话号码。
                    4. 在聊天中点击灰色 *+* 按钮 > *分摊费用*。
                    5. 通过选择 *手动输入*、*扫描* 或 *里程* 来创建费用。

                    如果你愿意，可以添加更多详情，或者直接发送。让我们帮你把钱要回来！
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
                title: '创建您的第一份报表',
                description: dedent(`
                    以下是创建报表的方法：

                    1. 点击 ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} 按钮。
                    2. 选择 *创建报表*。
                    3. 点击 *添加报销*。
                    4. 添加您的第一笔报销。

                    就完成了！
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `试用一下 [test drive](${testDriveURL})` : '试用体验'),
            embeddedDemoIframeTitle: '试用',
            employeeFakeReceipt: {
                description: '我的试驾收据！',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: '拿回报销款就像发消息一样简单。让我们先了解一下基本流程。',
            onboardingPersonalSpendMessage: '以下是几次点击即可跟踪支出的方式。',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # 您的免费试用已开始！让我们来为您完成设置。
                        👋 您好，我是您的 Expensify 设置专员。我已经为您创建了一个用于管理团队收据和报销的工作区。要充分利用这 30 天的免费试用，只需按照下面剩余的设置步骤操作即可！
                    `)
                    : dedent(`
                        # 您的免费试用已开始！让我们来为您完成设置。
                        👋 您好，我是您的 Expensify 设置专员。现在您已经创建了一个工作区，请按照以下步骤操作，充分利用这 30 天的免费试用期！
                    `),
            onboardingTrackWorkspaceMessage:
                '# 让我们开始为你进行设置\n\n👋 你好，我是你的 Expensify 设置专员。我已经为你创建了一个工作区，来帮助管理你的收据和报销。为了充分利用你的 30 天免费试用，请按照下面剩余的设置步骤进行操作！',
            onboardingChatSplitMessage: '与朋友分摊账单，就像发消息一样简单。操作方法如下。',
            onboardingAdminMessage: '了解如何以管理员身份管理您团队的工作区，并提交您自己的报销。',
            onboardingLookingAroundMessage: 'Expensify 最广为人知的是报销、出行和企业银行卡管理，但我们的功能远不止于此。告诉我你感兴趣的内容，我会帮你开始使用。',
            onboardingTestDriveReceiverMessage: '*您已获得 3 个月的免费使用！请从下方开始。*',
        },
        workspace: {
            title: '使用工作区保持井井有条',
            subtitle: '解锁强大的工具，在同一处简化您的报销管理。通过一个工作区，您可以：',
            explanationModal: {
                descriptionOne: '跟踪和整理收据',
                descriptionTwo: '分类并标记报销费用',
                descriptionThree: '创建并分享报告',
            },
            price: '免费试用 30 天，然后仅需 <strong>$5/用户/月</strong> 即可升级。',
            createWorkspace: '创建工作区',
        },
        confirmWorkspace: {
            title: '确认工作区',
            subtitle: '创建一个工作区，用于跟踪收据、报销费用、管理差旅、创建报表等——一切都以聊天般的速度完成。',
        },
        inviteMembers: {
            title: '邀请成员',
            subtitle: '添加您的团队或邀请您的会计。人多更热闹！',
        },
    },
    featureTraining: {
        doNotShowAgain: '不要再显示此内容',
    },
    personalDetails: {
        error: {
            containsReservedWord: '名称不能包含“Expensify”或“Concierge”',
            hasInvalidCharacter: '名称不能包含逗号或分号',
            requiredFirstName: '名字不能为空',
            cannotContainSpecialCharacters: '名称不能包含特殊字符',
        },
    },
    privatePersonalDetails: {
        enterLegalName: '你的法定姓名是什么？',
        enterDateOfBirth: '你的出生日期是什么？',
        enterAddress: '你的地址是什么？',
        enterPhoneNumber: '你的电话号码是多少？',
        personalDetails: '个人信息',
        privateDataMessage: '这些信息用于旅行和付款，永远不会显示在你的公开资料中。',
        legalName: '法定姓名',
        legalFirstName: '法定名',
        legalLastName: '法定姓氏',
        address: '地址',
        error: {
            dateShouldBeBefore: (dateString: string) => `日期应早于 ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `日期应晚于 ${dateString}`,
            hasInvalidCharacter: '名称只能包含拉丁字符',
            incorrectZipFormat: (zipFormat?: string) => `邮政编码格式不正确${zipFormat ? `可接受的格式：${zipFormat}` : ''}`,
            invalidPhoneNumber: `请确保电话号码有效（例如：${CONST.EXAMPLE_PHONE_NUMBER}）`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: '链接已重新发送',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) => `我已将魔术登录链接发送到 ${login}。请检查你的 ${loginType} 以登录。`,
        resendLink: '重新发送链接',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) => `要验证 ${secondaryLogin}，请从 ${primaryLogin} 的账户设置中重新发送魔法验证码。`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `如果你不再能访问 ${primaryLogin}，请先取消关联你的账户。`,
        unlink: '取消关联',
        linkSent: '链接已发送！',
        successfullyUnlinkedLogin: '次要登录已成功取消关联！',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) => `由于投递问题，我们的电子邮件服务提供商已暂时停止向 ${login} 发送邮件。要解除该登录的阻止状态，请按照以下步骤操作：`,
        confirmThat: (login: string) =>
            `<strong>请确认 ${login} 拼写正确，并且是一个真实、可投递的电子邮箱地址。</strong> 类似 “expenses@domain.com” 这样的邮箱别名，必须能访问其对应的邮箱收件箱，才能作为有效的 Expensify 登录邮箱使用。`,
        ensureYourEmailClient: `<strong>请确保您的邮件客户端允许接收来自 expensify.com 的邮件。</strong> 您可以在<a href="${CONST.SET_NOTIFICATION_LINK}">此处</a>查看完成此步骤的说明，但可能需要您的 IT 部门协助配置您的邮箱设置。`,
        onceTheAbove: `完成上述步骤后，请联系 <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> 以解除登录限制。`,
    },
    openAppFailureModal: {
        title: '出错了…',
        subtitle: `我们未能加载您的所有数据。我们已收到通知并正在调查该问题。如果问题仍然存在，请联系`,
        refreshAndTryAgain: '刷新后重试',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) => `我们无法向 ${login} 发送短信，因此已暂时停用。请尝试验证您的号码：`,
        validationSuccess: '您的号码已验证！点击下方发送新的魔法登录验证码。',
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
                return '请稍候片刻后再试。';
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
            return `请稍等！在再次尝试验证您的号码之前，您需要等待 ${timeText}。`;
        },
    },
    welcomeSignUpForm: {
        join: '加入',
    },
    detailsPage: {
        localTime: '本地时间',
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
        title: '欢迎使用 #focus 模式！',
        prompt: (priorityModePageUrl: string) => `通过仅查看未读聊天或需要你关注的聊天，随时掌握一切动态。别担心，你可以随时在<a href="${priorityModePageUrl}">设置</a>中更改此选项。`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: '找不到您要查找的聊天记录。',
        getMeOutOfHere: '带我离开这里',
        iouReportNotFound: '找不到您要查找的付款详情。',
        notHere: '嗯……它不在这儿',
        pageNotFound: '糟糕，找不到此页面',
        noAccess: '此聊天或报销可能已被删除，或者您无权访问。\n\n如有任何疑问，请联系 concierge@expensify.com',
        goBackHome: '返回首页',
        commentYouLookingForCannotBeFound: '找不到您要查找的评论。',
        goToChatInstead: '请改为前往聊天。',
        contactConcierge: '如有任何问题，请联系 concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `哎呀……${isBreakLine ? '\n' : ''}出现了一些问题`,
        subtitle: '无法完成您的请求。请稍后再试。',
        wrongTypeSubtitle: '该搜索无效。请尝试调整你的搜索条件。',
    },
    statusPage: {
        status: '状态',
        statusExplanation: '添加一个表情符号，让同事和朋友能轻松了解发生了什么。你也可以选择性地添加一条消息！',
        today: '今天',
        clearStatus: '清除状态',
        save: '保存',
        message: '消息',
        timePeriods: {
            never: '从不',
            thirtyMinutes: '30 分钟',
            oneHour: '1 小时',
            afterToday: '今天',
            afterWeek: '一周',
            custom: '自定义',
        },
        untilTomorrow: '直到明天',
        untilTime: ({time}: UntilTimeParams) => `直到 ${time}`,
        date: '日期',
        time: '时间',
        clearAfter: '在…后清除',
        whenClearStatus: '我们应何时清除你的状态？',
        vacationDelegate: '休假代理',
        setVacationDelegate: `设置一个休假代理，在你不在办公室时代你审批报销报告。`,
        vacationDelegateError: '更新你的休假代理时出错。',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `作为 ${nameOrEmail} 的休假代理`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `作为 ${vacationDelegateName} 的休假代理，提交给 ${submittedToName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `您正在将 ${nameOrEmail} 指定为您的休假代理。他们尚未加入您的所有工作区。如果您选择继续，将会向您所有工作区管理员发送电子邮件以将其添加。`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `第 ${step} 步`;
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
        letsDoubleCheck: '让我们再仔细检查一下，确保一切都正确。',
        accountEnding: '以 … 结尾的账户',
        thisBankAccount: '此银行账户将用于您工作区中的业务付款',
        accountNumber: '账号编号',
        routingNumber: '路由号码',
        chooseAnAccountBelow: '在下方选择一个账户',
        addBankAccount: '添加银行账户',
        chooseAnAccount: '选择一个账户',
        connectOnlineWithPlaid: '登录到您的银行',
        connectManually: '手动连接',
        desktopConnection: '注意：若要连接 Chase、Wells Fargo、Capital One 或 Bank of America，请点击此处在浏览器中完成此流程。',
        yourDataIsSecure: '您的数据是安全的',
        toGetStarted: '在同一处添加银行账户，用于报销费用、发放 Expensify Cards、收取发票款项并支付账单。',
        plaidBodyCopy: '为员工提供更便捷的方式来支付公司费用，并获得报销。',
        checkHelpLine: '您可以在该账户的支票上找到路由号码和账户号码。',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `要连接银行账户，请先<a href="${contactMethodRoute}">添加一个电子邮箱作为您的主要登录方式</a>，然后重试。您可以将手机号添加为次要登录方式。`,
        hasBeenThrottledError: '在添加您的银行账户时出错。请等待几分钟后再试一次。',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `哎呀！看起来你的工作区货币设置为非 USD。要继续操作，请前往<a href="${workspaceRoute}">你的工作区设置</a>，将其更改为 USD 后再重试。`,
        bbaAdded: '企业银行账户已添加！',
        bbaAddedDescription: '已准备好用于付款。',
        error: {
            youNeedToSelectAnOption: '请选择一个选项以继续',
            noBankAccountAvailable: '抱歉，目前没有可用的银行账户',
            noBankAccountSelected: '请选择一个账户',
            taxID: '请输入有效的税号',
            website: '请输入有效的网站',
            zipCode: `请输入有效的邮政编码，格式如下：${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: '请输入有效的电话号码',
            email: '请输入有效的电子邮箱地址',
            companyName: '请输入有效的企业名称',
            addressCity: '请输入有效的城市',
            addressStreet: '请输入有效的街道地址',
            addressState: '请选择有效的州/省',
            incorporationDateFuture: '成立日期不能晚于今天',
            incorporationState: '请选择有效的州/省',
            industryCode: '请输入一个由六位数字组成的有效行业分类代码',
            restrictedBusiness: '请确认该企业不在受限企业列表中',
            routingNumber: '请输入有效的路由号码',
            accountNumber: '请输入有效的账号',
            routingAndAccountNumberCannotBeSame: '路由号码和账户号码不能相同',
            companyType: '请选择一个有效的公司类型',
            tooManyAttempts: '由于登录尝试次数过多，此选项已被禁用 24 小时。请稍后重试或改为手动输入详细信息。',
            address: '请输入有效的地址',
            dob: '请选择有效的出生日期',
            age: '必须年满 18 周岁',
            ssnLast4: '请输入有效的社会安全号码后四位',
            firstName: '请输入有效的名字',
            lastName: '请输入有效的姓氏',
            noDefaultDepositAccountOrDebitCardAvailable: '请添加默认存款账户或借记卡',
            validationAmounts: '您输入的验证金额不正确。请仔细核对您的银行对账单，然后重试。',
            fullName: '请输入有效的全名',
            ownershipPercentage: '请输入有效的百分比数字',
            deletePaymentBankAccount: '此银行账户无法删除，因为它被用于 Expensify Card 付款。如果你仍然想删除此账户，请联系 Concierge。',
            sameDepositAndWithdrawalAccount: '存款和取款账户相同。',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: '您的银行账户位于哪里？',
        accountDetailsStepHeader: '你的账户详情是什么？',
        accountTypeStepHeader: '这是什么类型的账户？',
        bankInformationStepHeader: '你的银行账户信息是什么？',
        accountHolderInformationStepHeader: '账户持有人详细信息是什么？',
        howDoWeProtectYourData: '我们如何保护您的数据？',
        currencyHeader: '您的银行账户使用什么货币？',
        confirmationStepHeader: '检查您的信息。',
        confirmationStepSubHeader: '请仔细核对以下详情，并勾选条款复选框以确认。',
        toGetStarted: '添加个人银行账户以接收报销、支付发票或启用 Expensify 钱包。',
    },
    addPersonalBankAccountPage: {
        enterPassword: '输入 Expensify 密码',
        alreadyAdded: '此账户已被添加。',
        chooseAccountLabel: '账户',
        successTitle: '个人银行账户已添加！',
        successMessage: '恭喜，您的银行账户已设置完成，可以开始接收报销款了。',
    },
    attachmentView: {
        unknownFilename: '未知文件名',
        passwordRequired: '请输入密码',
        passwordIncorrect: '密码错误。请重试。',
        failedToLoadPDF: 'PDF 文件加载失败',
        pdfPasswordForm: {
            title: '受密码保护的 PDF',
            infoText: '此 PDF 受密码保护。',
            beforeLinkText: '请',
            linkText: '输入密码',
            afterLinkText: '以查看。',
            formLabel: '查看 PDF',
        },
        attachmentNotFound: '未找到附件',
        retry: '重试',
    },
    messages: {
        errorMessageInvalidPhone: `请输入不带括号或短横线的有效电话号码。如果您在美国以外，请包含您的国家区号（例如：${CONST.EXAMPLE_PHONE_NUMBER}）。`,
        errorMessageInvalidEmail: '无效的邮箱',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} 已经是 ${name} 的成员`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} 已经是 ${name} 的管理员`,
    },
    onfidoStep: {
        acceptTerms: '通过继续申请激活您的 Expensify Wallet，即表示您确认已阅读、理解并接受',
        facialScan: 'Onfido 面部扫描政策与授权',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfido 面部扫描政策与授权</a>，<a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>隐私</a> 和 <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>服务条款</a>。</muted-text-micro>`,
        tryAgain: '重试',
        verifyIdentity: '验证身份',
        letsVerifyIdentity: '让我们验证您的身份',
        butFirst: `不过首先是一些无聊的内容。在下一步中阅读法律条款，准备好后点击“接受”。`,
        genericError: '处理此步骤时发生错误。请重试。',
        cameraPermissionsNotGranted: '启用相机访问',
        cameraRequestMessage: '我们需要访问您的摄像头以完成银行账户验证。请在“设置 > New Expensify”中启用。',
        microphonePermissionsNotGranted: '启用麦克风访问',
        microphoneRequestMessage: '我们需要访问您的麦克风来完成银行账户验证。请前往“设置 > New Expensify”中启用。',
        originalDocumentNeeded: '请上传您的身份证原件照片，而不是屏幕截图或扫描件。',
        documentNeedsBetterQuality: '您的身份证件似乎已损坏或缺少安全特征。请上传一张未损坏且完整可见的身份证件原始图片。',
        imageNeedsBetterQuality: '您的身份证件图片质量存在问题。请上传一张新的图片，确保整个证件清晰可见。',
        selfieIssue: '您的自拍/视频存在问题。请上传实时自拍/视频。',
        selfieNotMatching: '您的自拍/视频与您的身份证件不匹配。请上传一张/段能清晰看见您脸部的新自拍/视频。',
        selfieNotLive: '您的自拍/视频似乎不是实时拍摄的照片/视频。请上传一张实时自拍或实时视频。',
    },
    additionalDetailsStep: {
        headerTitle: '更多详细信息',
        helpText: '在您可以通过钱包收发资金之前，我们需要先确认以下信息。',
        helpTextIdologyQuestions: '我们还需要再问你几个问题，以完成你的身份验证。',
        helpLink: '了解我们为何需要此信息的更多详情。',
        legalFirstNameLabel: '法定名',
        legalMiddleNameLabel: '法定中间名',
        legalLastNameLabel: '法定姓氏',
        selectAnswer: '请选择一个回复以继续',
        ssnFull9Error: '请输入有效的九位数社会安全号码',
        needSSNFull9: '我们在验证您的 SSN 时遇到问题。请输入您的 SSN 的完整九位数字。',
        weCouldNotVerify: '我们无法验证',
        pleaseFixIt: '在继续之前，请先修正此信息',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) => `我们无法验证您的身份。请稍后再试，或在有任何问题时联系 <a href="mailto:${conciergeEmail}">${conciergeEmail}</a>。`,
    },
    termsStep: {
        headerTitle: '条款和费用',
        headerTitleRefactor: '费用和条款',
        haveReadAndAgreePlain: '我已阅读并同意接收电子披露信息。',
        haveReadAndAgree: `我已阅读并同意接收<a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">电子披露信息</a>。`,
        agreeToThePlain: '我同意《隐私和钱包协议》。',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) => `我同意<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">隐私条款</a>和<a href="${walletAgreementUrl}">钱包协议</a>。`,
        enablePayments: '启用支付',
        monthlyFee: '月费',
        inactivity: '无操作',
        noOverdraftOrCredit: '无透支/信用功能。',
        electronicFundsWithdrawal: '电子资金提取',
        standard: '标准',
        reviewTheFees: '看看一些费用。',
        checkTheBoxes: '请勾选下方的复选框。',
        agreeToTerms: '同意条款后，你就可以开始使用了！',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Expensify 钱包由 ${walletProgram} 发行。`,
            perPurchase: '每次购买',
            atmWithdrawal: 'ATM 取款',
            cashReload: '现金充值',
            inNetwork: '网络内',
            outOfNetwork: '网络外',
            atmBalanceInquiry: 'ATM 余额查询（行内或跨行）',
            customerService: '客户服务（自动或人工客服）',
            inactivityAfterTwelveMonths: '非活跃（在 12 个月内无交易后）',
            weChargeOneFee: '我们还收取 1 种其他费用。它是：',
            fdicInsurance: '您的资金符合 FDIC 保险资格。',
            generalInfo: `有关预付账户的一般信息，请访问 <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>。`,
            conditionsDetails: `有关所有费用和服务的详细信息和条款，请访问 <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> 或致电 +1 833-400-0904。`,
            electronicFundsWithdrawalInstant: '电子资金取款（即时）',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `（最低 ${amount}）`,
        },
        longTermsForm: {
            listOfAllFees: '所有 Expensify Wallet 费用列表',
            typeOfFeeHeader: '所有费用',
            feeAmountHeader: '金额',
            moreDetailsHeader: '详情',
            openingAccountTitle: '开户',
            openingAccountDetails: '开立账户不收取任何费用。',
            monthlyFeeDetails: '没有月费。',
            customerServiceTitle: '客户服务',
            customerServiceDetails: '没有客户服务费用。',
            inactivityDetails: '没有不活跃费用。',
            sendingFundsTitle: '向另一位账户持有人转账',
            sendingFundsDetails: '使用您的余额、银行账户或借记卡向其他账户持有人转账不收取任何费用。',
            electronicFundsStandardDetails: '使用标准选项从你的 Expensify 钱包转账到你的银行账户是免费的。此类转账通常会在 1–3 个工作日内完成。',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                `使用即时转账选项从您的 Expensify 钱包转账到已关联借记卡将收取手续费。此类转账通常会在几分钟内完成。费用为转账金额的 ${percentage}%（最低费用为 ${amount}）。`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `您的资金符合 FDIC 保险资格。您的资金将由 ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}（一家受 FDIC 保险保障的机构）托管或转入。` +
                `一旦资金转入后，如果符合特定存款保险要求且您的卡已注册，在${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}发生故障的情况下，您的资金可由 FDIC 提供最高 ${amount} 的保险。详情请参阅 ${CONST.TERMS.FDIC_PREPAID}。`,
            contactExpensifyPayments: `通过拨打 +1 833-400-0904 联系 ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}，通过电子邮件 ${CONST.EMAIL.CONCIERGE}，或登录 ${CONST.NEW_EXPENSIFY_URL}。`,
            generalInformation: `有关预付账户的一般信息，请访问 ${CONST.TERMS.CFPB_PREPAID}。如果您对预付账户有投诉，请致电消费者金融保护局，电话号码为 1-855-411-2372，或访问 ${CONST.TERMS.CFPB_COMPLAINT}。`,
            printerFriendlyView: '查看打印友好版本',
            automated: '自动化',
            liveAgent: '人工客服',
            instant: '即时',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `最低 ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '启用支付',
        activatedTitle: '钱包已启用！',
        activatedMessage: '恭喜，您的钱包已设置完成，可以开始付款了。',
        checkBackLaterTitle: '稍等片刻…',
        checkBackLaterMessage: '我们仍在审核您的信息。请稍后再来查看。',
        continueToPayment: '继续付款',
        continueToTransfer: '继续转账',
    },
    companyStep: {
        headerTitle: '公司信息',
        subtitle: '差不多完成了！出于安全考虑，我们需要确认一些信息：',
        legalBusinessName: '法定企业名称',
        companyWebsite: '公司网站',
        taxIDNumber: '税号',
        taxIDNumberPlaceholder: '9 位数字',
        companyType: '公司类型',
        incorporationDate: '成立日期',
        incorporationState: '注册州',
        industryClassificationCode: '行业分类代码',
        confirmCompanyIsNot: '我确认这家公司未在',
        listOfRestrictedBusinesses: '受限业务列表',
        incorporationDatePlaceholder: '开始日期（yyyy-mm-dd）',
        incorporationTypes: {
            LLC: '有限责任公司',
            CORPORATION: '公司',
            PARTNERSHIP: '合作伙伴关系',
            COOPERATIVE: '合作社',
            SOLE_PROPRIETORSHIP: '独资企业',
            OTHER: '其他',
        },
        industryClassification: '该业务被归类到哪个行业？',
        industryClassificationCodePlaceholder: '搜索行业分类代码',
    },
    requestorStep: {
        headerTitle: '个人信息',
        learnMore: '了解更多',
        isMyDataSafe: '我的数据安全吗？',
    },
    personalInfoStep: {
        personalInfo: '个人信息',
        enterYourLegalFirstAndLast: '你的法定姓名是什么？',
        legalFirstName: '法定名',
        legalLastName: '法定姓氏',
        legalName: '法定姓名',
        enterYourDateOfBirth: '你的出生日期是什么？',
        enterTheLast4: '您的社会安全号码的后四位数字是多少？',
        dontWorry: '别担心，我们不会进行任何个人信用审查！',
        last4SSN: '社保号后四位',
        enterYourAddress: '你的地址是什么？',
        address: '地址',
        letsDoubleCheck: '让我们再仔细检查一下，确保一切都正确。',
        byAddingThisBankAccount: '通过添加此银行账户，您确认您已阅读、理解并接受',
        whatsYourLegalName: '您的法定姓名是什么？',
        whatsYourDOB: '你的出生日期是？',
        whatsYourAddress: '你的地址是什么？',
        whatsYourSSN: '您的社会安全号码的后四位数字是多少？',
        noPersonalChecks: '别担心，这里不会进行任何个人信用检查！',
        whatsYourPhoneNumber: '你的电话号码是多少？',
        weNeedThisToVerify: '我们需要这个来验证你的钱包。',
    },
    businessInfoStep: {
        businessInfo: '公司信息',
        enterTheNameOfYourBusiness: '你的公司叫什么名字？',
        businessName: '公司法定名称',
        enterYourCompanyTaxIdNumber: '你们公司的税号是多少？',
        taxIDNumber: '税号',
        taxIDNumberPlaceholder: '9 位数字',
        enterYourCompanyWebsite: '你们公司的网站是什么？',
        companyWebsite: '公司网站',
        enterYourCompanyPhoneNumber: '你们公司的电话号码是多少？',
        enterYourCompanyAddress: '你们公司的地址是什么？',
        selectYourCompanyType: '这是什么类型的公司？',
        companyType: '公司类型',
        incorporationType: {
            LLC: '有限责任公司',
            CORPORATION: '公司',
            PARTNERSHIP: '合作伙伴关系',
            COOPERATIVE: '合作社',
            SOLE_PROPRIETORSHIP: '独资企业',
            OTHER: '其他',
        },
        selectYourCompanyIncorporationDate: '贵公司的注册成立日期是什么时候？',
        incorporationDate: '成立日期',
        incorporationDatePlaceholder: '开始日期（yyyy-mm-dd）',
        incorporationState: '注册州',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '贵公司是在哪个州注册成立的？',
        letsDoubleCheck: '让我们再仔细检查一下，确保一切都正确。',
        companyAddress: '公司地址',
        listOfRestrictedBusinesses: '受限业务列表',
        confirmCompanyIsNot: '我确认这家公司未在',
        businessInfoTitle: '公司信息',
        legalBusinessName: '法定企业名称',
        whatsTheBusinessName: '公司名称是什么？',
        whatsTheBusinessAddress: '公司地址是什么？',
        whatsTheBusinessContactInformation: '商务联系信息是什么？',
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return '公司注册号（CRN）是什么？';
                default:
                    return '营业注册号是多少？';
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '什么是雇主识别号码（EIN）？';
                case CONST.COUNTRY.CA:
                    return '什么是商业号码（BN）？';
                case CONST.COUNTRY.GB:
                    return '增值税登记号（VRN）是什么？';
                case CONST.COUNTRY.AU:
                    return '澳大利亚商业号码（ABN）是什么？';
                default:
                    return '什么是欧盟增值税号？';
            }
        },
        whatsThisNumber: '这个数字是什么？',
        whereWasTheBusinessIncorporated: '公司是在哪里注册成立的？',
        whatTypeOfBusinessIsIt: '这是什么类型的企业？',
        whatsTheBusinessAnnualPayment: '该企业的年度支付总额是多少？',
        whatsYourExpectedAverageReimbursements: '您预期的平均报销金额是多少？',
        registrationNumber: '注册号',
        taxIDEIN: (country: string) => {
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
                    return '欧盟增值税';
            }
        },
        businessAddress: '公司地址',
        businessType: '业务类型',
        incorporation: '公司注册',
        incorporationCountry: '注册国家',
        incorporationTypeName: '公司类型',
        businessCategory: '业务类别',
        annualPaymentVolume: '年度支付总额',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `按年支付金额（${currencyCode}）`,
        averageReimbursementAmount: '平均报销金额',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `平均报销金额（以 ${currencyCode} 计）`,
        selectIncorporationType: '选择公司注册类型',
        selectBusinessCategory: '选择业务类别',
        selectAnnualPaymentVolume: '选择年度支付金额',
        selectIncorporationCountry: '选择注册国家',
        selectIncorporationState: '选择注册州',
        selectAverageReimbursement: '选择平均报销金额',
        selectBusinessType: '选择业务类型',
        findIncorporationType: '查找公司注册类型',
        findBusinessCategory: '查找业务类别',
        findAnnualPaymentVolume: '查找年度支付总额',
        findIncorporationState: '查找注册州',
        findAverageReimbursement: '查找平均报销金额',
        findBusinessType: '查找业务类型',
        error: {
            registrationNumber: '请提供有效的注册号',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '请输入有效的雇主识别号码 (EIN)';
                    case CONST.COUNTRY.CA:
                        return '请提供有效的商业号码（BN）';
                    case CONST.COUNTRY.GB:
                        return '请输入有效的增值税注册号 (VRN)';
                    case CONST.COUNTRY.AU:
                        return '请提供一个有效的澳大利亚商业号码（ABN）';
                    default:
                        return '请提供有效的欧盟增值税号';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `您是否拥有 ${companyName} 25% 或以上的股份？`,
        doAnyIndividualOwn25percent: (companyName: string) => `是否有任何个人拥有 ${companyName} 25% 或以上的股份？`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `是否还有其他个人拥有 ${companyName} 25% 或以上的股份？`,
        regulationRequiresUsToVerifyTheIdentity: '法规要求我们核实任何持有公司超过 25% 股权的个人身份。',
        companyOwner: '企业所有者',
        enterLegalFirstAndLastName: '所有者的法定姓名是什么？',
        legalFirstName: '法定名',
        legalLastName: '法定姓氏',
        enterTheDateOfBirthOfTheOwner: '所有者的出生日期是什么？',
        enterTheLast4: '所有者社会安全号码的后四位数字是什么？',
        last4SSN: '社保号后四位',
        dontWorry: '别担心，我们不会进行任何个人信用审查！',
        enterTheOwnersAddress: '所有者的地址是什么？',
        letsDoubleCheck: '让我们再仔细检查一下，确保一切都正确。',
        legalName: '法定姓名',
        address: '地址',
        byAddingThisBankAccount: '通过添加此银行账户，您确认您已阅读、理解并接受',
        owners: '所有者',
    },
    ownershipInfoStep: {
        ownerInfo: '所有者信息',
        businessOwner: '企业所有者',
        signerInfo: '签署人信息',
        doYouOwn: (companyName: string) => `您是否拥有 ${companyName} 25% 或以上的股份？`,
        doesAnyoneOwn: (companyName: string) => `是否有任何个人拥有 ${companyName} 25% 或以上的股份？`,
        regulationsRequire: '法规要求我们核实任何持有该企业超过 25% 股份的个人身份。',
        legalFirstName: '法定名',
        legalLastName: '法定姓氏',
        whatsTheOwnersName: '所有者的法定姓名是什么？',
        whatsYourName: '你的法定姓名是什么？',
        whatPercentage: '业主拥有企业的百分比是多少？',
        whatsYoursPercentage: '您拥有这家企业的百分之多少？',
        ownership: '所有权',
        whatsTheOwnersDOB: '所有者的出生日期是什么？',
        whatsYourDOB: '你的出生日期是什么？',
        whatsTheOwnersAddress: '所有者的地址是什么？',
        whatsYourAddress: '你的地址是什么？',
        whatAreTheLast: '所有者社会安全号码（SSN）的后四位数字是什么？',
        whatsYourLast: '您的社会安全号码的后 4 位数字是多少？',
        whatsYourNationality: '您的国籍是？',
        whatsTheOwnersNationality: '所有者的国籍是哪个国家？',
        countryOfCitizenship: '国籍',
        dontWorry: '别担心，我们不会进行任何个人信用审查！',
        last4: '社保号后四位',
        whyDoWeAsk: '我们为什么要请求这些信息？',
        letsDoubleCheck: '让我们再仔细检查一下，确保一切都正确。',
        legalName: '法定姓名',
        ownershipPercentage: '持股比例',
        areThereOther: (companyName: string) => `是否有其他个人持有 ${companyName} 25% 或以上的股份？`,
        owners: '所有者',
        addCertified: '添加一份经过认证的组织结构图，显示受益所有人',
        regulationRequiresChart: '根据相关法规，我们必须收集一份经过认证的股权结构图，注明所有持有公司 25% 或以上股份的个人或实体。',
        uploadEntity: '上传实体所有权结构图',
        noteEntity: '注意：实体所有权图表必须由您的会计师、法律顾问签署，或经过公证。',
        certified: '认证实体所有权结构图',
        selectCountry: '选择国家',
        findCountry: '查找国家',
        address: '地址',
        chooseFile: '选择文件',
        uploadDocuments: '上传附加文档',
        pleaseUpload: '请在下方上传更多证明文件，以便我们核实您是否为该企业实体25%或以上的直接或间接所有者。',
        acceptedFiles: '可接受的文件格式：PDF、PNG、JPEG。每个部分的文件总大小不得超过 5 MB。',
        proofOfBeneficialOwner: '实际受益所有人证明',
        proofOfBeneficialOwnerDescription:
            '请提供由注册会计师、公证人或律师出具并签署的证明文件和组织结构图，用于核实企业 25% 及以上股权的所有权。该文件必须为最近三个月内出具，并包含签署人的执照号码。',
        copyOfID: '实益所有人的身份证复印件',
        copyOfIDDescription: '例如：护照、驾驶证等。',
        proofOfAddress: '受益所有人地址证明',
        proofOfAddressDescription: '示例：水电费账单、租赁协议等。',
        codiceFiscale: '税号/纳税人识别号',
        codiceFiscaleDescription: '请上传一次实地拜访的视频，或与签字授权人的通话录音视频。该签字授权人必须提供：全名、出生日期、公司名称、注册编号、税号、注册地址、业务性质以及开户目的。',
    },
    completeVerificationStep: {
        completeVerification: '完成验证',
        confirmAgreements: '请确认以下协议。',
        certifyTrueAndAccurate: '本人证明所提供的信息真实准确',
        certifyTrueAndAccurateError: '请证明这些信息真实且准确',
        isAuthorizedToUseBankAccount: '我被授权使用此企业银行账户进行业务支出',
        isAuthorizedToUseBankAccountError: '您必须是拥有操作该企业银行账户授权的主管人员',
        termsAndConditions: '条款和条件',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '验证您的银行账户',
        validateButtonText: '验证',
        validationInputLabel: '交易',
        maxAttemptsReached: '由于多次尝试验证失败，此银行账户的验证已被禁用。',
        description: `在 1–2 个工作日内，我们会从类似 “Expensify, Inc. Validation” 的名称向您的银行账户发送三（3）笔小额交易。`,
        descriptionCTA: '请在下面的字段中输入每笔交易金额。例如：1.51。',
        letsChatText: '快完成了！我们需要你在聊天中帮忙验证最后几条信息。准备好了吗？',
        enable2FATitle: '防止欺诈，启用双重身份验证（2FA）',
        enable2FAText: '我们非常重视您的账户安全。请立即设置双重认证（2FA），为您的账户增加一层额外保护。',
        secureYourAccount: '保护您的账户',
    },
    countryStep: {
        confirmBusinessBank: '确认企业银行账户的货币和国家',
        confirmCurrency: '确认货币和国家',
        yourBusiness: '您的企业银行账户币种必须与您的工作区币种相匹配。',
        youCanChange: '您可以在您的',
        findCountry: '查找国家',
        selectCountry: '选择国家',
    },
    bankInfoStep: {
        whatAreYour: '你的企业银行账户详细信息是什么？',
        letsDoubleCheck: '让我们再仔细检查一下，确保一切都没问题。',
        thisBankAccount: '此银行账户将用于您工作区中的业务付款',
        accountNumber: '账号编号',
        accountHolderNameDescription: '授权签署人全名',
    },
    signerInfoStep: {
        signerInfo: '签署人信息',
        areYouDirector: (companyName: string) => `您是${companyName}的董事吗？`,
        regulationRequiresUs: '法规要求我们核实签署人是否有权代表公司执行此操作。',
        whatsYourName: '你的法定姓名是什么',
        fullName: '法定全名',
        whatsYourJobTitle: '你的职位名称是什么？',
        jobTitle: '职位名称',
        whatsYourDOB: '你的出生日期是什么？',
        uploadID: '上传身份证件和地址证明',
        personalAddress: '个人住址证明（例如：水电费账单）',
        letsDoubleCheck: '让我们再仔细检查一下，确保一切都正确。',
        legalName: '法定姓名',
        proofOf: '个人住址证明',
        enterOneEmail: (companyName: string) => `输入 ${companyName} 的一位主管的邮箱`,
        regulationRequiresOneMoreDirector: '法规要求至少再增加一名董事作为签署人。',
        hangTight: '请稍等……',
        enterTwoEmails: (companyName: string) => `输入 ${companyName} 的两位董事的电子邮箱`,
        sendReminder: '发送提醒',
        chooseFile: '选择文件',
        weAreWaiting: '我们正在等待其他人验证其作为公司董事的身份。',
        id: '身份证复印件',
        proofOfDirectors: '董事证明',
        proofOfDirectorsDescription: '例如：Oncorp Corporate Profile 或 Business Registration。',
        codiceFiscale: '税号',
        codiceFiscaleDescription: '法定代表人、授权用户和实益所有人的 Codice Fiscale。',
        PDSandFSG: 'PDS + FSG 披露文件',
        PDSandFSGDescription: dedent(`
            我们与 Corpay 的合作通过 API 连接，利用其庞大的国际银行合作伙伴网络，为 Expensify 的全球报销功能提供支持。根据澳大利亚相关法规，我们向您提供 Corpay 的《金融服务指南（FSG）》和《产品披露声明（PDS）》。

            请仔细阅读 FSG 和 PDS 文档，因为其中包含 Corpay 所提供产品和服务的完整细节及重要信息。请妥善保存这些文件以备将来参考。
        `),
        pleaseUpload: '请在下方上传更多证明文件，以帮助我们核实您作为企业董事的身份。',
        enterSignerInfo: '输入签署人信息',
        thisStep: '此步骤已完成',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `正在将以 ${currency} 计价、账号末尾为 ${bankAccountLastFour} 的企业银行账户连接到 Expensify，以便用 ${currency} 支付员工。下一步需要一位董事的签署人信息。`,
        error: {
            emailsMustBeDifferent: '邮箱地址必须不同',
        },
    },
    agreementsStep: {
        agreements: '协议',
        pleaseConfirm: '请确认以下协议',
        regulationRequiresUs: '法规要求我们核实任何持有公司超过 25% 股权的个人身份。',
        iAmAuthorized: '我已获授权使用公司银行账户进行业务支出。',
        iCertify: '我确认所提供的信息真实且准确。',
        iAcceptTheTermsAndConditions: `我接受<a href="https://cross-border.corpay.com/tc/">条款和条件</a>。`,
        iAcceptTheTermsAndConditionsAccessibility: '我接受条款和条件。',
        accept: '接受并添加银行账户',
        iConsentToThePrivacyNotice: '我同意<a href="https://payments.corpay.com/compliance">隐私声明</a>。',
        iConsentToThePrivacyNoticeAccessibility: '我同意隐私声明。',
        error: {
            authorized: '您必须是拥有操作该企业银行账户授权的主管人员',
            certify: '请证明这些信息真实且准确',
            consent: '请同意隐私声明',
        },
    },
    docusignStep: {
        subheader: 'Docusign 表单',
        pleaseComplete: '请使用下方的 Docusign 链接完成 ACH 授权表，并将签署后的副本上传到此处，以便我们可以直接从您的银行账户中扣款',
        pleaseCompleteTheBusinessAccount: '请完成《企业账户申请直接借记安排》',
        pleaseCompleteTheDirect: '请使用下面的 Docusign 链接完成直接借记安排，然后在此上传已签署的副本，以便我们可以直接从您的银行账户中扣款。',
        takeMeTo: '带我前往 Docusign',
        uploadAdditional: '上传附加文档',
        pleaseUpload: '请上传 DEFT 表格和 Docusign 签名页',
        pleaseUploadTheDirect: '请上传直接借记安排文件和Docusign签名页',
    },
    finishStep: {
        letsFinish: '让我们在聊天中完成吧！',
        thanksFor: '感谢你提供这些详细信息。专属客服人员现在会审核你的信息。如果我们还需要你提供其他内容，会再与您联系。与此同时，如有任何疑问，欢迎随时与我们联系。',
        iHaveA: '我有一个问题',
        enable2FA: '启用双重身份验证（2FA）以防止欺诈',
        weTake: '我们非常重视您的账户安全。请立即设置双重认证（2FA），为您的账户增加一层额外保护。',
        secure: '保护您的账户',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '请稍候',
        explanationLine: '我们正在查看您的信息。您很快就可以继续下一步了。',
    },
    session: {
        offlineMessageRetry: '看起来你已离线。请检查你的网络连接，然后重试。',
    },
    travel: {
        header: '预订出行',
        title: '聪明出行',
        subtitle: '使用 Expensify Travel 获取最优惠的旅行方案，并在一个地方管理您所有的商务报销。',
        features: {
            saveMoney: '在预订时省钱',
            alerts: '如果您的旅行计划发生变化，获取实时提醒',
        },
        bookTravel: '预订出行',
        bookDemo: '预订演示',
        bookADemo: '预约演示',
        toLearnMore: '以了解更多。',
        termsAndConditions: {
            header: '在我们继续之前…',
            title: '条款和条件',
            label: '我同意条款和条件',
            subtitle: `请同意 Expensify Travel 的<a href="${CONST.TRAVEL_TERMS_URL}">条款和条件</a>。`,
            error: '您必须同意 Expensify Travel 的条款和条件才能继续',
            defaultWorkspaceError: '您需要设置一个默认工作区才能启用 Expensify Travel。前往“设置”>“工作区”> 点击工作区旁边的三个竖点 > “设为默认工作区”，然后再试一次！',
        },
        flight: '航班',
        flightDetails: {
            passenger: '乘客',
            layover: (layover: string) => `<muted-text-label>在此航班前，你有一段<strong>${layover}的中转停留时间</strong></muted-text-label>`,
            takeOff: '起飞',
            landing: '登录页',
            seat: '座位',
            class: '舱位等级',
            recordLocator: '记录定位符',
            cabinClasses: {
                unknown: '未知',
                economy: '经济',
                premiumEconomy: 'Premium Economy',
                business: '商务',
                first: '第一',
            },
        },
        hotel: '酒店',
        hotelDetails: {
            guest: '访客',
            checkIn: '签到',
            checkOut: '退房',
            roomType: '房型',
            cancellation: '取消政策',
            cancellationUntil: '在此之前可免费取消',
            confirmation: '确认号码',
            cancellationPolicies: {
                unknown: '未知',
                nonRefundable: '不可退款',
                freeCancellationUntil: '在此之前可免费取消',
                partiallyRefundable: '部分可退款',
            },
        },
        car: '汽车',
        carDetails: {
            rentalCar: '租车',
            pickUp: '取件',
            dropOff: '下车点',
            driver: '司机',
            carType: '汽车类型',
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
            coachNumber: '车厢号',
            seat: '座位',
            fareDetails: '票价详情',
            confirmation: '确认号码',
        },
        viewTrip: '查看行程',
        modifyTrip: '修改行程',
        tripSupport: '差旅支持',
        tripDetails: '行程详情',
        viewTripDetails: '查看行程详情',
        trip: '行程',
        trips: '行程',
        tripSummary: '行程摘要',
        departs: '出发',
        errorMessage: '出现问题。请稍后重试。',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) => `<rbr>请<a href="${phoneErrorMethodsRoute}">添加工作邮箱作为您的主要登录方式</a>以预订差旅。</rbr>`,
        domainSelector: {
            title: '域',
            subtitle: '为 Expensify Travel 设置选择一个域名。',
            recommended: '推荐',
        },
        domainPermissionInfo: {
            title: '域',
            restriction: (domain: string) => `您没有权限为域名 <strong>${domain}</strong> 启用 Expensify Travel。您需要请该域名的相关人员来启用差旅功能。`,
            accountantInvitation: `如果您是会计，请考虑加入 <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! 会计计划</a>，以为此域启用差旅。`,
        },
        publicDomainError: {
            title: '开始使用 Expensify Travel',
            message: `您需要在 Expensify Travel 中使用您的工作邮箱（例如：name@company.com），而不是您的个人邮箱（例如：name@gmail.com）。`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel 已被禁用',
            message: `您的管理员已关闭 Expensify Travel。请按照您公司的预订政策安排差旅行程。`,
        },
        verifyCompany: {
            title: '我们正在审核您的请求…',
            message: `我们正在进行一些检查，以确认您的账户已准备好使用 Expensify Travel。我们很快会与您联系！`,
            confirmText: '明白了',
            conciergeMessage: ({domain}: {domain: string}) => `为域名：${domain} 启用差旅失败。请检查并为此域名启用差旅。`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `您于${startDate}的航班 ${airlineCode}（${origin} → ${destination}）已预订成功。确认代码：${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `您在${startDate}乘坐的航班${airlineCode}（${origin} → ${destination}）的机票已作废。`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `您于 ${startDate} 搭乘的航班 ${airlineCode}（${origin} → ${destination}）的机票已被退款或改签。`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `您在 ${startDate}} 搭乘的航班 ${airlineCode}（${origin} → ${destination}）已被航空公司取消。`,
            flightScheduleChangePending: (airlineCode: string) => `航空公司已对航班 ${airlineCode} 提出行程变更，我们正在等待确认。`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `行程变更已确认：航班 ${airlineCode} 现在将于 ${startDate} 起飞。`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) => `您在${startDate}的航班 ${airlineCode}（${origin} → ${destination}）已更新。`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `您在航班 ${airlineCode} 上的舱位等级已更新为 ${cabinClass}。`,
            flightSeatConfirmed: (airlineCode: string) => `您在航班 ${airlineCode} 上的座位分配已确认。`,
            flightSeatChanged: (airlineCode: string) => `您在航班 ${airlineCode} 上的座位分配已被更改。`,
            flightSeatCancelled: (airlineCode: string) => `您在航班 ${airlineCode} 上的座位分配已被移除。`,
            paymentDeclined: '您的机票预订付款失败。请重试。',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `您已取消您的${type}预订 ${id}。`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `供应商已取消您的${type}预订 ${id}。`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `您的${type}预订已重新预订。新的确认编号：${id}。`,
            bookingUpdated: ({type}: TravelTypeParams) => `您的${type}预订已更新。请在行程中查看新的详细信息。`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) => `您从 ${origin} 到 ${destination} 的 ${startDate} 火车票已退款。退款额度将被处理。`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `您从 ${origin} → ${destination} 的火车票（出行日期：${startDate}）已成功改签。`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `您从 ${origin} 前往 ${destination}、日期为 ${startDate} 的火车票已更新。`,
            defaultUpdate: ({type}: TravelTypeParams) => `您的${type}预订已更新。`,
        },
        flightTo: '飞往',
        trainTo: '训练到',
        carRental: '租车',
        nightIn: '夜晚中',
        nightsIn: '晚数在',
    },
    workspace: {
        common: {
            card: '卡片',
            expensifyCard: 'Expensify Card',
            companyCards: '公司信用卡',
            workflows: '工作流程',
            workspace: '工作区',
            findWorkspace: '查找工作区',
            edit: '编辑工作区',
            enabled: '已启用',
            disabled: '已禁用',
            everyone: '所有人',
            delete: '删除工作区',
            settings: '设置',
            reimburse: '报销',
            categories: '类别',
            tags: '标签',
            customField1: '自定义字段 1',
            customField2: '自定义字段 2',
            customFieldHint: '为该成员的所有支出添加适用的自定义编码。',
            reports: '报表',
            reportFields: '报表字段',
            reportTitle: '报表标题',
            reportField: '报表字段',
            taxes: '税费',
            bills: '账单',
            invoices: '发票',
            perDiem: '每日津贴',
            travel: '差旅',
            members: '成员',
            accounting: '会计',
            receiptPartners: '收据合作伙伴',
            rules: '规则',
            displayedAs: '显示为',
            plan: '套餐',
            profile: '概览',
            bankAccount: '银行账户',
            testTransactions: '测试交易',
            issueAndManageCards: '发放和管理卡片',
            reconcileCards: '对账卡片',
            selectAll: '全选',
            selected: () => ({
                one: '已选择 1 项',
                other: (count: number) => `已选择 ${count}`,
            }),
            settlementFrequency: '结算频率',
            setAsDefault: '设为默认工作区',
            defaultNote: `发送到 ${CONST.EMAIL.RECEIPTS} 的收据会显示在此工作区中。`,
            deleteConfirmation: '您确定要删除此工作区吗？',
            deleteWithCardsConfirmation: '您确定要删除此工作区吗？这将移除所有卡片馈送和已分配的卡片。',
            unavailable: '工作区不可用',
            memberNotFound: '未找到成员。要邀请新成员加入工作区，请使用上方的邀请按钮。',
            notAuthorized: `你无权访问此页面。如果你正尝试加入此工作区，只需请该工作区的所有者将你添加为成员。还有其他问题？请联系 ${CONST.EMAIL.CONCIERGE}。`,
            goToWorkspace: '前往工作区',
            duplicateWorkspace: '重复工作区',
            duplicateWorkspacePrefix: '重复',
            goToWorkspaces: '前往工作区',
            clearFilter: '清除筛选',
            workspaceName: '工作区名称',
            workspaceOwner: '所有者',
            workspaceType: '工作区类型',
            workspaceAvatar: '工作区头像',
            mustBeOnlineToViewMembers: '您需要在线才能查看此工作区的成员。',
            moreFeatures: '更多功能',
            requested: '已请求',
            distanceRates: '距离费率',
            defaultDescription: '一个地方管理您所有的收据和报销。',
            descriptionHint: '与所有成员共享此工作区的信息。',
            welcomeNote: '请使用 Expensify 提交报销收据，谢谢！',
            subscription: '订阅',
            markAsEntered: '标记为手动输入',
            markAsExported: '标记为已导出',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `导出到 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: '让我们再仔细检查一下，确保一切都正确。',
            lineItemLevel: '逐项级别',
            reportLevel: '报表级别',
            topLevel: '顶层',
            appliedOnExport: '未导入到 Expensify，在导出时应用',
            shareNote: {
                header: '与其他成员共享您的工作区',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `分享此二维码或复制下面的链接，方便成员请求访问您的工作区。所有加入工作区的请求都会显示在 <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> 聊天室中供您审核。`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `连接到 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: '创建新连接',
            reuseExistingConnection: '重复使用现有连接',
            existingConnections: '现有连接',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `由于您之前已连接到 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}，您可以选择复用现有连接或创建新连接。`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - 上次同步时间：${formattedDate}`,
            authenticationError: (connectionName: string) => `由于身份验证错误，无法连接到 ${connectionName}。`,
            learnMore: '了解更多',
            memberAlternateText: '提交并批准报表。',
            adminAlternateText: '管理报表和工作区设置。',
            auditorAlternateText: '查看并评论报表。',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return '管理员';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return '审核员';
                    case CONST.POLICY.ROLE.USER:
                        return '成员';
                    default:
                        return '成员';
                }
            },
            frequency: {
                manual: '手动',
                instant: '即时',
                immediate: '每天',
                trip: '按行程',
                weekly: '每周',
                semimonthly: '每月两次',
                monthly: '每月',
            },
            planType: '计划类型',
            defaultCategory: '默认类别',
            viewTransactions: '查看交易',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `${displayName} 的报销`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card 交易将通过<a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">我们的集成</a>自动导出到使用其创建的“Expensify Card Liability Account”。</muted-text-label>`,
            youCantDowngradeInvoicing: '发票结算的订阅无法降级方案。若要讨论或更改订阅，请联系您的客户经理或 Concierge 获取帮助。',
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) => (organizationName ? `已连接到 ${organizationName}` : '在整个组织内自动处理出行和餐饮配送报销。'),
                sendInvites: '发送邀请',
                sendInvitesDescription: '这些工作区成员尚未拥有 Uber for Business 帐户。请取消选择此时不希望邀请的任何成员。',
                confirmInvite: '确认邀请',
                manageInvites: '管理邀请',
                confirm: '确认',
                allSet: '一切就绪',
                readyToRoll: '你已经准备就绪',
                takeBusinessRideMessage: '选择商务出行，您的 Uber 收据将自动导入 Expensify。快出发吧！',
                all: '全部',
                linked: '已关联',
                outstanding: '未结清',
                status: {
                    resend: '重新发送',
                    invite: '邀请',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: '已关联',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '待处理',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '已暂停',
                },
                centralBillingAccount: '集中计费账户',
                centralBillingDescription: '选择要将所有 Uber 收据导入到哪里。',
                invitationFailure: '无法邀请成员加入 Uber for Business',
                autoInvite: '邀请新的工作区成员加入 Uber for Business',
                autoRemove: '在 Uber for Business 中停用已移除的工作区成员',
                emptyContent: {
                    title: '没有未处理的邀请',
                    subtitle: '万岁！我们到处都找过了，也没发现任何未处理的邀请。',
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
            deletePerDiemRate: '删除每日津贴费率',
            findPerDiemRate: '查找每日津贴标准',
            areYouSureDelete: () => ({
                one: '你确定要删除此费率吗？',
                other: '您确定要删除这些费率吗？',
            }),
            emptyList: {
                title: '每日津贴',
                subtitle: '设置每日津贴标准以控制员工每日支出。可从电子表格导入费率以开始使用。',
            },
            importPerDiemRates: '导入每日补贴费率',
            editPerDiemRate: '编辑日津贴费率',
            editPerDiemRates: '编辑每日补贴费率',
            editDestinationSubtitle: (destination: string) => `更新此目的地将会更改所有 ${destination} 伙食津贴子费率的设置。`,
            editCurrencySubtitle: (destination: string) => `更新此货币将会更改所有 ${destination} 按日津贴子费率的货币。`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '设置自掏腰包报销如何导出到 QuickBooks Desktop。',
            exportOutOfPocketExpensesCheckToggle: '将支票标记为“稍后打印”',
            exportDescription: '配置 Expensify 数据导出到 QuickBooks Desktop 的方式。',
            date: '导出日期',
            exportInvoices: '将发票导出到',
            exportExpensifyCard: '将 Expensify Card 交易导出为',
            account: '账户',
            accountDescription: '选择发布日记账分录的位置。',
            accountsPayable: '应付账款',
            accountsPayableDescription: '选择在何处创建供应商账单。',
            bankAccount: '银行账户',
            notConfigured: '未配置',
            bankAccountDescription: '选择从哪里发送支票。',
            creditCardAccount: '信用卡账户',
            exportDate: {
                label: '导出日期',
                description: '将导出报表到 QuickBooks Desktop 时使用此日期。',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '上次报销日期',
                        description: '报表中最新报销日期。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '导出日期',
                        description: '报表导出到 QuickBooks Desktop 的日期。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提交日期',
                        description: '报告提交审批的日期。',
                    },
                },
            },
            exportCheckDescription: '我们将为每份 Expensify 报告创建一张分项支票，并从下面的银行账户发送。',
            exportJournalEntryDescription: '我们会为每一份 Expensify 报告创建一条分项日记账分录，并将其过账到下方的账户。',
            exportVendorBillDescription: '我们会为每份 Expensify 报告创建一张分项供应商账单，并将其添加到账户如下所示。如果本期间已关闭，我们将记入下一个开放期间的第 1 天。',
            outOfPocketTaxEnabledDescription: 'QuickBooks Desktop 不支持在日记账分录导出中包含税费。由于您在工作区中启用了税费功能，此导出选项不可用。',
            outOfPocketTaxEnabledError: '启用税费时无法使用分录。请选择其他导出选项。',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '信用卡',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '供应商账单',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '日记分录',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '检查',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]: '我们将为每份 Expensify 报告创建一张分项支票，并从下面的银行账户发送。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    '我们会自动将信用卡交易中的商户名称与 QuickBooks 中对应的供应商进行匹配。如果不存在相应的供应商，我们将创建一个名为“Credit Card Misc.”的供应商以进行关联。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '我们会为每份 Expensify 报告创建一张逐项列明的供应商账单，日期为最后一笔费用的日期，并将其添加到账下方的账户中。如果当前期间已结账，我们将记入下一个未结期间的第一天。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '选择将信用卡交易导出到哪里。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '选择一个供应商，应用于所有信用卡交易。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '选择从哪里发送支票。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: '启用地点时无法使用供应商账单。请选择其他导出选项。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '启用地点后无法使用支票功能。请选择其他导出选项。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '启用税费时无法使用分录。请选择其他导出选项。',
            },
            noAccountsFound: '未找到账户',
            noAccountsFoundDescription: '在 QuickBooks Desktop 中添加该账户，然后再次同步连接',
            qbdSetup: 'QuickBooks Desktop 设置',
            requiredSetupDevice: {
                title: '无法从此设备连接',
                body1: '您需要在存放 QuickBooks Desktop 公司文件的计算机上设置此连接。',
                body2: '连接完成后，您就可以在任何地方进行同步和导出了。',
            },
            setupPage: {
                title: '打开此链接以连接',
                body: '要完成设置，请在运行 QuickBooks Desktop 的电脑上打开以下链接。',
                setupErrorTitle: '出现问题',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>QuickBooks Desktop 连接当前无法使用。请稍后重试，或在问题持续存在时<a href="${conciergeLink}">联系 Concierge</a>。</centered-text></muted-text>`,
            },
            importDescription: '选择要从 QuickBooks Desktop 导入到 Expensify 的编码配置。',
            classes: '课程',
            items: '项目',
            customers: '客户/项目',
            exportCompanyCardsDescription: '设置公司信用卡消费导出到 QuickBooks Desktop 的方式。',
            defaultVendorDescription: '设置一个默认供应商，在导出时应用于所有信用卡交易。',
            accountsDescription: '您的 QuickBooks Desktop 科目表将作为类别导入到 Expensify 中。',
            accountsSwitchTitle: '选择将新账户导入为启用或禁用的类别。',
            accountsSwitchDescription: '启用的类别将在成员创建报销时可供选择。',
            classesDescription: '选择在 Expensify 中如何处理 QuickBooks Desktop 类别。',
            tagsDisplayedAsDescription: '单项明细级别',
            reportFieldsDisplayedAsDescription: '报表级别',
            customersDescription: '选择如何在 Expensify 中处理 QuickBooks Desktop 客户/项目。',
            advancedConfig: {
                autoSyncDescription: 'Expensify 将会每天自动与 QuickBooks Desktop 同步。',
                createEntities: '自动创建实体',
                createEntitiesDescription: '如果供应商在 QuickBooks Desktop 中尚不存在，Expensify 会自动创建这些供应商。',
            },
            itemsDescription: '选择如何在 Expensify 中处理 QuickBooks Desktop 项目。',
            accountingMethods: {
                label: '何时导出',
                description: '选择何时导出报销：',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '应计',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '现金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '员工垫付费用将在最终批准后导出',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自付报销将在付款时导出',
                },
            },
        },
        qbo: {
            connectedTo: '已连接到',
            importDescription: '选择要从 QuickBooks Online 导入到 Expensify 的编码配置。',
            classes: '课程',
            locations: '地点',
            customers: '客户/项目',
            accountsDescription: '您的 QuickBooks Online 科目表将作为类别导入到 Expensify 中。',
            accountsSwitchTitle: '选择将新账户导入为启用或禁用的类别。',
            accountsSwitchDescription: '启用的类别将在成员创建报销时可供选择。',
            classesDescription: '选择如何在 Expensify 中处理 QuickBooks Online 类别。',
            customersDescription: '选择如何在 Expensify 中处理 QuickBooks Online 客户/项目。',
            locationsDescription: '选择在 Expensify 中如何处理 QuickBooks Online 位置。',
            taxesDescription: '选择如何在 Expensify 中处理 QuickBooks Online 的税款。',
            locationsLineItemsRestrictionDescription: 'QuickBooks Online 不支持在支票或供应商账单的行级别使用地点。如果你希望在行级别使用地点，请确保使用日记账分录和信用卡/借记卡报销。',
            taxesJournalEntrySwitchNote: 'QuickBooks Online 不支持在日记账分录中使用税费。请将您的导出选项更改为供应商账单或支票。',
            exportDescription: '配置 Expensify 数据如何导出到 QuickBooks Online。',
            date: '导出日期',
            exportInvoices: '将发票导出到',
            exportExpensifyCard: '将 Expensify Card 交易导出为',
            exportDate: {
                label: '导出日期',
                description: '将导出报表到 QuickBooks Online 时使用此日期。',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '上次报销日期',
                        description: '报表中最新报销日期。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '导出日期',
                        description: '报表导出到 QuickBooks Online 的日期。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提交日期',
                        description: '报告提交审批的日期。',
                    },
                },
            },
            receivable: '应收账款', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: '应收账款归档', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: '将发票导出到 QuickBooks Online 时，请使用此科目。',
            exportCompanyCardsDescription: '设置公司卡消费导出到 QuickBooks Online 的方式。',
            vendor: '供应商',
            defaultVendorDescription: '设置一个默认供应商，在导出时应用于所有信用卡交易。',
            exportOutOfPocketExpensesDescription: '设置报销支出的导出方式到 QuickBooks Online。',
            exportCheckDescription: '我们将为每份 Expensify 报告创建一张分项支票，并从下面的银行账户发送。',
            exportJournalEntryDescription: '我们会为每一份 Expensify 报告创建一条分项日记账分录，并将其过账到下方的账户。',
            exportVendorBillDescription: '我们会为每份 Expensify 报告创建一张分项供应商账单，并将其添加到账户如下所示。如果本期间已关闭，我们将记入下一个开放期间的第 1 天。',
            account: '账户',
            accountDescription: '选择发布日记账分录的位置。',
            accountsPayable: '应付账款',
            accountsPayableDescription: '选择在何处创建供应商账单。',
            bankAccount: '银行账户',
            notConfigured: '未配置',
            bankAccountDescription: '选择从哪里发送支票。',
            creditCardAccount: '信用卡账户',
            companyCardsLocationEnabledDescription: 'QuickBooks Online 不支持在供应商账单导出中使用地点。由于您在工作区中启用了地点功能，此导出选项不可用。',
            outOfPocketTaxEnabledDescription: 'QuickBooks Online 不支持在日记账分录导出中包含税费。由于你已在工作区中启用了税费，此导出选项当前不可用。',
            outOfPocketTaxEnabledError: '启用税费时无法使用分录。请选择其他导出选项。',
            advancedConfig: {
                autoSyncDescription: 'Expensify 将会每天自动与 QuickBooks Online 同步。',
                inviteEmployees: '邀请员工',
                inviteEmployeesDescription: '导入 QuickBooks Online 员工记录，并邀请员工加入此工作区。',
                createEntities: '自动创建实体',
                createEntitiesDescription: '如果供应商在 QuickBooks Online 中尚不存在，Expensify 会自动创建供应商，并在导出发票时自动创建客户。',
                reimbursedReportsDescription: '每当通过 Expensify ACH 支付报销单时，将在下方的 QuickBooks Online 账户中创建相应的账单付款记录。',
                qboBillPaymentAccount: 'QuickBooks 账单付款账户',
                qboInvoiceCollectionAccount: 'QuickBooks 发票收款账户',
                accountSelectDescription: '选择用于支付账单的账户，我们会在 QuickBooks Online 中创建付款记录。',
                invoiceAccountSelectorDescription: '选择接收发票款项的账户，我们会在 QuickBooks Online 中创建相应的付款记录。',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: '借记卡',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '信用卡',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '供应商账单',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '日记分录',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '检查',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    '我们会自动将借记卡交易上的商户名称与 QuickBooks 中任何相应的供应商进行匹配。如果不存在供应商，我们将创建一个“Debit Card Misc.”供应商以进行关联。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    '我们会自动将信用卡交易中的商户名称与 QuickBooks 中对应的供应商进行匹配。如果不存在相应的供应商，我们将创建一个名为“Credit Card Misc.”的供应商以进行关联。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '我们会为每份 Expensify 报告创建一张逐项列明的供应商账单，日期为最后一笔费用的日期，并将其添加到账下方的账户中。如果当前期间已结账，我们将记入下一个未结期间的第一天。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: '选择借记卡交易的导出目标位置。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '选择将信用卡交易导出到哪里。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '选择一个供应商，应用于所有信用卡交易。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: '启用地点时无法使用供应商账单。请选择其他导出选项。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '启用地点后无法使用支票功能。请选择其他导出选项。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '启用税费时无法使用分录。请选择其他导出选项。',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '为供应商账单导出选择一个有效的账户',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '为日记账导出选择一个有效账户',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '为支票导出选择一个有效的账户',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '若要使用供应商账单导出功能，请在 QuickBooks Online 中设置一个应付账款科目',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '若要使用分录导出功能，请在 QuickBooks Online 中设置一个日记账账户',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '要使用支票导出，请在 QuickBooks Online 中设置一个银行账户',
            },
            noAccountsFound: '未找到账户',
            noAccountsFoundDescription: '在 QuickBooks Online 中添加该账户，然后再次同步连接。',
            accountingMethods: {
                label: '何时导出',
                description: '选择何时导出报销：',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '应计',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '现金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '员工垫付费用将在最终批准后导出',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自付报销将在付款时导出',
                },
            },
        },
        workspaceList: {
            joinNow: '立即加入',
            askToJoin: '请求加入',
        },
        xero: {
            organization: 'Xero 组织',
            organizationDescription: '选择要从中导入数据的 Xero 组织。',
            importDescription: '选择要从 Xero 导入到 Expensify 的编码配置。',
            accountsDescription: '您的 Xero 会计科目表将作为类别导入到 Expensify 中。',
            accountsSwitchTitle: '选择将新账户导入为启用或禁用的类别。',
            accountsSwitchDescription: '启用的类别将在成员创建报销时可供选择。',
            trackingCategories: '跟踪类别',
            trackingCategoriesDescription: '选择如何在 Expensify 中处理 Xero 跟踪类别。',
            mapTrackingCategoryTo: (categoryName: string) => `将 Xero ${categoryName} 映射到`,
            mapTrackingCategoryToDescription: (categoryName: string) => `选择在导出到 Xero 时将 ${categoryName} 映射到哪里。`,
            customers: '向客户重新计费',
            customersDescription: '选择是否在 Expensify 中向客户重新计费。您在 Xero 中的客户联系人可以被标记到报销中，并会以销售发票的形式导出到 Xero。',
            taxesDescription: '选择如何在 Expensify 中处理 Xero 税费。',
            notImported: '未导入',
            notConfigured: '未配置',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero 联系人默认设置',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: '标签',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: '报表字段',
            },
            exportDescription: '配置 Expensify 数据导出到 Xero 的方式。',
            purchaseBill: '采购账单',
            exportDeepDiveCompanyCard: '导出的报销将作为银行交易记入下方的 Xero 银行账户，且交易日期将与您的银行对账单上的日期一致。',
            bankTransactions: '银行交易',
            xeroBankAccount: 'Xero 银行账户',
            xeroBankAccountDescription: '选择费用将作为银行交易入账的位置。',
            exportExpensesDescription: '报表将按照下方选择的日期和状态导出为采购账单。',
            purchaseBillDate: '采购账单日期',
            exportInvoices: '将发票导出为',
            salesInvoice: '销售发票',
            exportInvoicesDescription: '销售发票始终会显示发票发送的日期。',
            advancedConfig: {
                autoSyncDescription: 'Expensify 将每天自动与 Xero 同步。',
                purchaseBillStatusTitle: '采购账单状态',
                reimbursedReportsDescription: '每当通过 Expensify ACH 支付报表时，将在下方的 Xero 账户中创建相应的账单付款。',
                xeroBillPaymentAccount: 'Xero 账单付款账户',
                xeroInvoiceCollectionAccount: 'Xero 发票收款账户',
                xeroBillPaymentAccountDescription: '选择从哪里支付账单，我们会在 Xero 中创建付款。',
                invoiceAccountSelectorDescription: '选择接收发票款项的账户，我们会在 Xero 中创建付款。',
            },
            exportDate: {
                label: '采购账单日期',
                description: '将导出报表到 Xero 时使用此日期。',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '上次报销日期',
                        description: '报表中最新报销日期。',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '导出日期',
                        description: '报告导出到 Xero 的日期。',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提交日期',
                        description: '报告提交审批的日期。',
                    },
                },
            },
            invoiceStatus: {
                label: '采购账单状态',
                description: '在将采购账单导出到 Xero 时使用此状态。',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '草稿',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '等待审批',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '等待付款',
                },
            },
            noAccountsFound: '未找到账户',
            noAccountsFoundDescription: '请在 Xero 中添加该账户，然后再次同步连接',
            accountingMethods: {
                label: '何时导出',
                description: '选择何时导出报销：',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '应计',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '现金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '员工垫付费用将在最终批准后导出',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自付报销将在付款时导出',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '首选导出工具',
            taxSolution: '税务解决方案',
            notConfigured: '未配置',
            exportDate: {
                label: '导出日期',
                description: '将导出报表至 Sage Intacct 时使用此日期。',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '上次报销日期',
                        description: '报表中最新报销日期。',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: '导出日期',
                        description: '报表导出到 Sage Intacct 的日期。',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '提交日期',
                        description: '报告提交审批的日期。',
                    },
                },
            },
            reimbursableExpenses: {
                description: '设置自付费用导出到 Sage Intacct 的方式。',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: '报销报告',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '供应商账单',
                },
            },
            nonReimbursableExpenses: {
                description: '设置公司卡消费导出到 Sage Intacct 的方式。',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: '信用卡',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '供应商账单',
                },
            },
            creditCardAccount: '信用卡账户',
            defaultVendor: '默认供应商',
            defaultVendorDescription: (isReimbursable: boolean) => `为 ${isReimbursable ? '' : '非'}可报销费用设置一个默认供应商，用于在 Sage Intacct 中没有匹配供应商的费用。`,
            exportDescription: '配置 Expensify 数据导出到 Sage Intacct 的方式。',
            exportPreferredExporterNote: '首选导出人可以是任何工作区管理员，但如果你在“域设置”中为各个公司卡片设置了不同的导出账户，则该导出人还必须是域管理员。',
            exportPreferredExporterSubNote: '设置完成后，首选导出人将在其账户中看到可导出的报表。',
            noAccountsFound: '未找到账户',
            noAccountsFoundDescription: `请在 Sage Intacct 中添加该账户，然后再次同步连接`,
            autoSync: '自动同步',
            autoSyncDescription: 'Expensify 将每天自动与 Sage Intacct 同步。',
            inviteEmployees: '邀请员工',
            inviteEmployeesDescription: '导入 Sage Intacct 员工记录，并邀请员工加入此工作区。您的审批流程将默认为经理审批，并可在“成员”页面进行进一步配置。',
            syncReimbursedReports: '同步已报销报表',
            syncReimbursedReportsDescription: '每当通过 Expensify ACH 支付报表时，将在下方的 Sage Intacct 账户中创建相应的账单付款。',
            paymentAccount: 'Sage Intacct 付款账户',
            accountingMethods: {
                label: '何时导出',
                description: '选择何时导出报销：',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '应计',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '现金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '员工垫付费用将在最终批准后导出',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自付报销将在付款时导出',
                },
            },
        },
        netsuite: {
            subsidiary: '子公司',
            subsidiarySelectDescription: '选择要从中导入数据的 NetSuite 子公司。',
            exportDescription: '配置 Expensify 数据导出到 NetSuite 的方式。',
            exportInvoices: '将发票导出到',
            journalEntriesTaxPostingAccount: '日记账分录税务过账科目',
            journalEntriesProvTaxPostingAccount: '日记账分录省级税金入账科目',
            foreignCurrencyAmount: '导出外币金额',
            exportToNextOpenPeriod: '导出到下一个开放期间',
            nonReimbursableJournalPostingAccount: '不可报销日记账入账科目',
            reimbursableJournalPostingAccount: '可报销日记账过账科目',
            journalPostingPreference: {
                label: '日记帐分录过账偏好',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '每份报表对应一条逐项分录',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '每笔报销一条记录',
                },
            },
            invoiceItem: {
                label: '发票项目',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '帮我创建一个',
                        description: '导出时，我们会为您创建一个“Expensify 发票行项目”（如果尚不存在）。',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '选择现有的',
                        description: '我们会将来自 Expensify 的发票关联到下面选择的项目。',
                    },
                },
            },
            exportDate: {
                label: '导出日期',
                description: '将导出报告到 NetSuite 时使用此日期。',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '上次报销日期',
                        description: '报表中最新报销日期。',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: '导出日期',
                        description: '报表导出到 NetSuite 的日期。',
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
                        label: '报销报告',
                        reimbursableDescription: '自掏腰包的费用将作为费用报表导出到 NetSuite。',
                        nonReimbursableDescription: '公司银行卡报销将作为报销报告导出到 NetSuite。',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '供应商账单',
                        reimbursableDescription: dedent(`
                            自掏腰包的费用将会导出为应付给下方指定 NetSuite 供应商的账单。

                            如果您想为每张卡设置特定的供应商，请前往 *设置 > 域 > 公司卡*。
                        `),
                        nonReimbursableDescription: dedent(`
                            公司卡费用将作为应付账单导出给下方指定的 NetSuite 供应商。

                            如果你希望为每张卡设置特定的供应商，请前往 *设置 > 域名 > 公司卡*。
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '日记账分录',
                        reimbursableDescription: dedent(`
                            个人垫付费用将作为日记账分录导出到下方指定的 NetSuite 账户。

                            如果你希望为每张卡设置特定的供应商，请前往 *设置 > 域 > 公司卡*。
                        `),
                        nonReimbursableDescription: dedent(`
                            公司卡消费将作为日记账分录导出到下方指定的 NetSuite 账户。

                            如果你想为每张卡设置特定的供应商，请前往 *设置 > 域 > 公司卡*。
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    '如果您将公司卡导出设置切换为报销单，单张卡片对应的 NetSuite 供应商和过账科目将被停用。\n\n别担心，我们会保存您之前的选择，以便您日后需要时切换回来。',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify 将每天自动与 NetSuite 同步。',
                reimbursedReportsDescription: '每当使用 Expensify ACH 支付报表时，相应的账单付款将会在下面的 NetSuite 账户中创建。',
                reimbursementsAccount: '报销账户',
                reimbursementsAccountDescription: '选择您用于报销的银行账户，我们将会在 NetSuite 中创建相应的付款。',
                collectionsAccount: '催收账户',
                collectionsAccountDescription: '一旦发票在 Expensify 中被标记为已付款并导出到 NetSuite，它就会显示在下面的账户中。',
                approvalAccount: '应付账款审批账户',
                approvalAccountDescription: '选择在 NetSuite 中用于审批交易的账户。如果你正在同步已报销的报销单，这也是用于生成账单付款的账户。',
                defaultApprovalAccount: 'NetSuite 默认',
                inviteEmployees: '邀请员工并设置审批',
                inviteEmployeesDescription: '导入 NetSuite 员工记录并邀请员工加入此工作区。您的审批流程将默认为经理审批，您可以在 *成员* 页面中进行进一步配置。',
                autoCreateEntities: '自动创建员工/供应商',
                enableCategories: '启用新导入的类别',
                customFormID: '自定义表单 ID',
                customFormIDDescription: '默认情况下，Expensify 将使用在 NetSuite 中设置的首选交易表单来创建分录。或者，您也可以指定要使用的特定交易表单。',
                customFormIDReimbursable: '自掏腰包报销费用',
                customFormIDNonReimbursable: '公司卡费用',
                exportReportsTo: {
                    label: '费用报销单审批级别',
                    description: '一旦报销报告在 Expensify 中获批并导出到 NetSuite，您可以在过账前在 NetSuite 中设置额外一层审批。',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite 默认首选项',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '仅主管已批准',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '仅会计已批准',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '主管和会计已批准',
                    },
                },
                accountingMethods: {
                    label: '何时导出',
                    description: '选择何时导出报销：',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '应计',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '现金',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '员工垫付费用将在最终批准后导出',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自付报销将在付款时导出',
                    },
                },
                exportVendorBillsTo: {
                    label: '供应商账单审批级别',
                    description: '一旦供应商账单在 Expensify 中获批并导出到 NetSuite，您就可以在过账之前在 NetSuite 中设置额外的审批级别。',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite 默认首选项',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '待审批',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '已批准发布',
                    },
                },
                exportJournalsTo: {
                    label: '日记账分录审批级别',
                    description: '在 Expensify 中的日记账分录一经批准并导出到 NetSuite 后，您可以在过账之前在 NetSuite 中设置额外一级审批。',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite 默认首选项',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '待审批',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '已批准发布',
                    },
                },
                error: {
                    customFormID: '请输入有效的数字自定义表单 ID',
                },
            },
            noAccountsFound: '未找到账户',
            noAccountsFoundDescription: '请在 NetSuite 中添加该账户，然后再次同步连接',
            noVendorsFound: '未找到供应商',
            noVendorsFoundDescription: '请在 NetSuite 中添加供应商，然后再次同步连接',
            noItemsFound: '未找到发票项目',
            noItemsFoundDescription: '请在 NetSuite 中添加发票项目，然后再次同步连接',
            noSubsidiariesFound: '未找到子公司',
            noSubsidiariesFoundDescription: '请在 NetSuite 中添加子公司，然后再次同步连接',
            tokenInput: {
                title: 'NetSuite 设置',
                formSteps: {
                    installBundle: {
                        title: '安装 Expensify 捆绑包',
                        description: '在 NetSuite 中，依次进入 *Customization > SuiteBundler > Search & Install Bundles*，搜索 “Expensify”，然后安装该 bundle。',
                    },
                    enableTokenAuthentication: {
                        title: '启用基于令牌的身份验证',
                        description: '在 NetSuite 中，依次前往 *Setup > Company > Enable Features > SuiteCloud*，然后启用 *token-based authentication*。',
                    },
                    enableSoapServices: {
                        title: '启用 SOAP Web 服务',
                        description: '在 NetSuite 中，依次前往 *Setup > Company > Enable Features > SuiteCloud*，然后启用 *SOAP Web Services*。',
                    },
                    createAccessToken: {
                        title: '创建访问令牌',
                        description:
                            '在 NetSuite 中，依次进入 *Setup > Users/Roles > Access Tokens*，为 “Expensify” 应用以及 “Expensify Integration” 或 “Administrator” 角色创建一个访问令牌。\n\n*重要：* 请务必保存此步骤中的 *Token ID* 和 *Token Secret*。下一步中将需要用到它们。',
                    },
                    enterCredentials: {
                        title: '请输入您的 NetSuite 凭证',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite 账户 ID',
                            netSuiteTokenID: '代币 ID',
                            netSuiteTokenSecret: '令牌密钥',
                        },
                        netSuiteAccountIDDescription: '在 NetSuite 中，前往 *Setup > Integration > SOAP Web Services Preferences*。',
                    },
                },
            },
            import: {
                expenseCategories: '报销类别',
                expenseCategoriesDescription: '您的 NetSuite 费用类别将作为类别导入到 Expensify。',
                crossSubsidiaryCustomers: '跨子公司客户/项目',
                importFields: {
                    departments: {
                        title: '部门',
                        subtitle: '选择如何在 Expensify 中处理 NetSuite 的 *departments*。',
                    },
                    classes: {
                        title: '课程',
                        subtitle: '选择如何在 Expensify 中处理 *classes*。',
                    },
                    locations: {
                        title: '地点',
                        subtitle: '选择如何在 Expensify 中处理*位置*。',
                    },
                },
                customersOrJobs: {
                    title: '客户/项目',
                    subtitle: '选择如何在 Expensify 中处理 NetSuite 的 *customers* 和 *projects*。',
                    importCustomers: '导入客户',
                    importJobs: '导入项目',
                    customers: '客户',
                    jobs: '项目',
                    label: (importFields: string[], importType: string) => `${importFields.join('和')}, ${importType}`,
                },
                importTaxDescription: '从 NetSuite 导入税务组。',
                importCustomFields: {
                    chooseOptionBelow: '请选择下面的一个选项：',
                    label: (importedTypes: string[]) => `已作为 ${importedTypes.join('和')} 导入`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `请输入${fieldName}`,
                    customSegments: {
                        title: '自定义分段/记录',
                        addText: '添加自定义段/记录',
                        recordTitle: '自定义分段/记录',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '查看详细说明',
                        helpText: '关于配置自定义分段/记录。',
                        emptyTitle: '添加自定义分段或自定义记录',
                        fields: {
                            segmentName: '名称',
                            internalID: '内部 ID',
                            scriptID: '脚本 ID',
                            customRecordScriptID: '交易列 ID',
                            mapping: '显示为',
                        },
                        removeTitle: '移除自定义分段/记录',
                        removePrompt: '您确定要删除此自定义段/记录吗？',
                        addForm: {
                            customSegmentName: '自定义分段名称',
                            customRecordName: '自定义记录名称',
                            segmentTitle: '自定义分段',
                            customSegmentAddTitle: '添加自定义分段',
                            customRecordAddTitle: '添加自定义记录',
                            recordTitle: '自定义记录',
                            segmentRecordType: '你想添加自定义分类还是自定义记录？',
                            customSegmentNameTitle: '自定义分段名称是什么？',
                            customRecordNameTitle: '自定义记录名称是什么？',
                            customSegmentNameFooter: `您可以在 NetSuite 中的 *Customizations > Links, Records & Fields > Custom Segments* 页面找到自定义分段名称。

_如需更详细的说明，请[访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_。`,
                            customRecordNameFooter: `您可以在全局搜索中输入“Transaction Column Field”来在 NetSuite 中查找自定义记录名称。

_如需更详细的说明，请[访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_。`,
                            customSegmentInternalIDTitle: '内部 ID 是什么？',
                            customSegmentInternalIDFooter: `首先，请确保你已在 NetSuite 中启用内部 ID，路径为：*Home > Set Preferences > Show Internal ID。*

你可以在 NetSuite 中通过以下路径找到自定义段的内部 ID：

1. *Customization > Lists, Records, & Fields > Custom Segments*。
2. 点击进入某个自定义段。
3. 点击 *Custom Record Type* 旁边的超链接。
4. 在底部表格中找到内部 ID。

_如需更详细的说明，[请访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_。`,
                            customRecordInternalIDFooter: `您可以按照以下步骤在 NetSuite 中找到自定义记录的内部 ID：

1. 在全局搜索中输入 “Transaction Line Fields”。
2. 点击进入一个自定义记录。
3. 在左侧找到内部 ID。

_如需更详细的说明，[请访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_`,
                            customSegmentScriptIDTitle: '脚本 ID 是什么？',
                            customSegmentScriptIDFooter: `您可以在 NetSuite 中通过以下路径找到自定义段脚本 ID：

1. *Customization > Lists, Records, & Fields > Custom Segments*。
2. 点击进入某个自定义段。
3. 点击底部附近的 *Application and Sourcing* 选项卡，然后：
    a. 如果您希望在 Expensify 中将自定义段显示为 *标签*（行项目级别），请点击 *Transaction Columns* 子选项卡，并使用 *Field ID*。
    b. 如果您希望在 Expensify 中将自定义段显示为 *报表字段*（报表级别），请点击 *Transactions* 子选项卡，并使用 *Field ID*。

_如需更详细的说明，[请访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_`,
                            customRecordScriptIDTitle: '交易列 ID 是什么？',
                            customRecordScriptIDFooter: `您可以在 NetSuite 中通过以下步骤找到自定义记录脚本 ID：

1. 在全局搜索中输入 “Transaction Line Fields”。
2. 点击进入某个自定义记录。
3. 在左侧找到 Script ID。

_如需更详细的说明，请[访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_。`,
                            customSegmentMappingTitle: '此自定义分段应如何在 Expensify 中显示？',
                            customRecordMappingTitle: '此自定义记录应如何在 Expensify 中显示？',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `已存在使用此 ${fieldName?.toLowerCase()} 的自定义分段/记录`,
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
                            internalID: '内部 ID',
                            transactionFieldID: '交易字段 ID',
                            mapping: '显示为',
                        },
                        removeTitle: '移除自定义列表',
                        removePrompt: '确定要删除此自定义列表吗？',
                        addForm: {
                            listNameTitle: '选择自定义列表',
                            transactionFieldIDTitle: '交易字段 ID 是什么？',
                            transactionFieldIDFooter: `您可以按照以下步骤在 NetSuite 中找到交易字段 ID：

1. 在全局搜索中输入“Transaction Line Fields”。
2. 点击进入一个自定义列表。
3. 在左侧找到交易字段 ID。

_如需更详细的说明，请[访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_。`,
                            mappingTitle: '此自定义列表应如何在 Expensify 中显示？',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `已存在使用此交易字段 ID 的自定义列表`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuite 员工默认值',
                        description: '未导入到 Expensify，在导出时应用',
                        footerContent: (importField: string) => `如果您在 NetSuite 中使用 ${importField}，我们将在导出至 Expense Report 或 Journal Entry 时应用员工记录中设置的默认值。`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: '标签',
                        description: '逐项级别',
                        footerContent: (importField: string) => `${startCase(importField)} 将可在员工报表中的每一笔单独费用上进行选择。`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: '报表字段',
                        description: '报表级别',
                        footerContent: (importField: string) => `${startCase(importField)} 选择将应用于员工报表上的所有报销费用。`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct 设置',
            prerequisitesTitle: '在你连接之前…',
            downloadExpensifyPackage: '下载适用于 Sage Intacct 的 Expensify 软件包',
            followSteps: '请按照我们的《操作指南：如何连接到 Sage Intacct》中的步骤进行操作',
            enterCredentials: '输入您的 Sage Intacct 凭证',
            entity: '实体',
            employeeDefault: 'Sage Intacct 员工默认值',
            employeeDefaultDescription: '如果员工已在 Sage Intacct 中设置了默认部门，该部门将自动应用到其报销费用中。',
            displayedAsTagDescription: '在员工报表中的每一笔单独报销中，都可以选择所属部门。',
            displayedAsReportFieldDescription: '部门选择将适用于员工报表中的所有报销。',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `选择如何在 Expensify 中处理 Sage Intacct <strong>${mappingTitle}</strong>。`,
            expenseTypes: '费用类型',
            expenseTypesDescription: '您的 Sage Intacct 费用类型将作为类别导入 Expensify。',
            accountTypesDescription: '您的 Sage Intacct 科目表将作为类别导入到 Expensify 中。',
            importTaxDescription: '从 Sage Intacct 导入采购税率。',
            userDefinedDimensions: '用户自定义维度',
            addUserDefinedDimension: '添加用户定义维度',
            integrationName: '集成名称',
            dimensionExists: '已存在具有此名称的维度。',
            removeDimension: '移除用户自定义维度',
            removeDimensionPrompt: '确定要删除此用户定义的维度吗？',
            userDefinedDimension: '用户自定义维度',
            addAUserDefinedDimension: '添加用户定义维度',
            detailedInstructionsLink: '查看详细说明',
            detailedInstructionsRestOfSentence: '关于添加用户定义维度。',
            userDimensionsAdded: () => ({
                one: '已添加 1 个 UDD',
                other: (count: number) => `已添加 ${count} 个 UDD`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '部门';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return '类别';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return '位置';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '客户';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return '项目（工作）';
                    default:
                        return '映射';
                }
            },
        },
        type: {
            free: '免费',
            control: '控制',
            collect: '收款',
        },
        companyCards: {
            addCards: '添加卡片',
            selectCards: '选择卡片',
            addNewCard: {
                other: '其他',
                cardProviders: {
                    gl1025: 'American Express 公司卡',
                    cdf: 'Mastercard 商务卡',
                    vcf: 'Visa 商务卡',
                    stripe: 'Stripe 卡片',
                },
                yourCardProvider: `您的发卡机构是哪家？`,
                whoIsYourBankAccount: '你的银行是哪家？',
                whereIsYourBankLocated: '你的银行位于哪里？',
                howDoYouWantToConnect: '您想如何连接到您的银行？',
                learnMoreAboutOptions: `<muted-text>详细了解这些<a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">选项</a>。</muted-text>`,
                commercialFeedDetails: '需要与你的银行进行设置。通常由大型公司使用，如果你符合条件，这往往是最佳选项。',
                commercialFeedPlaidDetails: `需要与你的银行进行设置，但我们会指导你完成。此功能通常仅限较大规模的公司使用。`,
                directFeedDetails: '最简单的方法。立即使用您的主凭证进行连接。此方法最为常见。',
                enableFeed: {
                    title: (provider: string) => `启用您的 ${provider} 订阅源`,
                    heading: '我们已与您的发卡机构进行了直接集成，可以快速且准确地将您的交易数据导入 Expensify。\n\n要开始使用，只需：',
                    visa: '我们与 Visa 有全球集成，但资格取决于发卡银行和卡片项目。\n\n要开始使用，只需：',
                    mastercard: '我们与 Mastercard 建立了全球集成，但可用性会因银行和卡片计划而异。\n\n要开始使用，只需：',
                    vcf: `1. 请访问[此帮助文章](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})，获取有关如何设置 Visa 商务卡的详细说明。

2. 请[联系您的银行](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})，确认他们是否支持您项目的商务数据源，并请求他们为您启用。

3. *在数据源启用并且您获得相关详细信息后，继续进入下一屏。*`,
                    gl1025: `1. 访问[此帮助文章](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP})，了解 American Express 是否可以为您的项目启用商业数据馈送。

2. 数据馈送启用后，Amex 会向您发送生产函。

3. *获得数据馈送信息后，继续到下一屏。*`,
                    cdf: `1. 访问[此帮助文章](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})，获取如何设置您的 Mastercard 商务卡的详细说明。

2. [联系您的银行](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})，确认他们是否支持您项目的商业数据馈送，并请求他们为您启用。

3. *一旦数据馈送被启用并且您获取了其详细信息，请继续到下一屏幕。*`,
                    stripe: `1. 访问 Stripe 的仪表板，然后前往 [Settings](${CONST.COMPANY_CARDS_STRIPE_HELP})。

2. 在 Product Integrations 下，点击 Expensify 旁边的 Enable。

3. 数据馈送启用后，点击下方的 Submit，我们会开始添加。`,
                },
                whatBankIssuesCard: '这些卡是由哪家银行发行的？',
                enterNameOfBank: '输入银行名称',
                feedDetails: {
                    vcf: {
                        title: 'Visa 交易信息详情是什么？',
                        processorLabel: '处理器 ID',
                        bankLabel: '金融机构（银行）ID',
                        companyLabel: '公司 ID',
                        helpLabel: '我在哪里可以找到这些 ID？',
                    },
                    gl1025: {
                        title: `Amex 交付文件的名称是什么？`,
                        fileNameLabel: '交付文件名',
                        helpLabel: '我在哪里可以找到交付文件名？',
                    },
                    cdf: {
                        title: `什么是 Mastercard 分发 ID？`,
                        distributionLabel: '分发 ID',
                        helpLabel: '我在哪里可以找到分发 ID？',
                    },
                },
                amexCorporate: '如果您的卡片正面标有“Corporate”，请选择此项',
                amexBusiness: '如果您的卡片正面写着“Business”，请选择此项',
                amexPersonal: '如果您的卡是个人卡，请选择此项',
                error: {
                    pleaseSelectProvider: '在继续之前请选择一个发卡机构',
                    pleaseSelectBankAccount: '请先选择一个银行账户，然后再继续',
                    pleaseSelectBank: '请先选择一个银行，然后再继续',
                    pleaseSelectCountry: '请在继续之前选择一个国家',
                    pleaseSelectFeedType: '请先选择一个馈送类型，然后再继续',
                },
                exitModal: {
                    title: '有问题无法正常使用？',
                    prompt: '我们注意到你尚未完成添加银行卡。如果遇到问题，请告诉我们，我们会帮你把一切重新理顺。',
                    confirmText: '报告问题',
                    cancelText: '跳过',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: '每月最后一天',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: '每月最后一个工作日',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: '自定义每月日期',
            },
            assignCard: '分配卡片',
            findCard: '查找卡片',
            cardNumber: '卡号',
            commercialFeed: '商业费用提要',
            feedName: (feedName: string) => `${feedName} 卡片`,
            directFeed: '直接数据馈送',
            whoNeedsCardAssigned: '谁需要被分配一张卡？',
            chooseTheCardholder: '选择持卡人',
            chooseCard: '选择一张卡片',
            chooseCardFor: (assignee: string) => `为 <strong>${assignee}</strong> 选择一张卡片。找不到您要找的卡片？<concierge-link>请告诉我们。</concierge-link>`,
            noActiveCards: '此信息流中没有有效的卡片',
            somethingMightBeBroken:
                '<muted-text><centered-text>或者某些功能可能出现故障。无论如何，如果你有任何问题，只需<concierge-link>联系 Concierge</concierge-link>。</centered-text></muted-text>',
            chooseTransactionStartDate: '选择交易开始日期',
            startDateDescription: '我们将导入从此日期起的所有交易。如果未指定日期，我们会追溯到银行所允许的最早日期。',
            fromTheBeginning: '从头开始',
            customStartDate: '自定义开始日期',
            customCloseDate: '自定义结束日期',
            letsDoubleCheck: '让我们再仔细检查一下，确保一切都正确。',
            confirmationDescription: '我们会立即开始导入交易。',
            card: '卡片',
            cardName: '卡片名称',
            brokenConnectionError: '<rbr>银行卡信息连接已中断。请<a href="#">登录您的银行账户</a>以便我们重新建立连接。</rbr>',
            assignedCard: (assignee: string, link: string) => `已将${assignee}分配到${link}！导入的交易将显示在此聊天中。`,
            companyCard: '公司卡',
            chooseCardFeed: '选择卡片流水来源',
            ukRegulation:
                'Expensify Limited 是 Plaid Financial Ltd. 的代理机构，Plaid Financial Ltd. 是一家在《2017 年支付服务条例》下受金融行为监管局（Financial Conduct Authority）监管并获授权的支付机构（公司参考编号：804718）。Plaid 通过其代理 Expensify Limited 向您提供受监管的账户信息服务。',
            assign: '分配',
            assignCardFailedError: '卡片分配失败。',
            cardAlreadyAssignedError: 'This card is already assigned to a user in another workspace.',
            editStartDateDescription: '选择一个新的交易起始日期。我们将从该日期起同步所有交易，但不包括已经导入的交易。',
            unassignCardFailedError: '卡片取消分配失败。',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: '无法加载卡片信息流',
                workspaceFeedsCouldNotBeLoadedMessage: '加载工作区卡片动态时出错。请重试或联系您的管理员。',
                feedCouldNotBeLoadedTitle: '无法加载此订阅内容',
                feedCouldNotBeLoadedMessage: '加载此信息流时出错。请重试或联系您的管理员。',
                tryAgain: '重试',
            },
        },
        expensifyCard: {
            issueAndManageCards: '发放和管理您的 Expensify 卡',
            getStartedIssuing: '从开通您的第一张虚拟或实体卡开始使用。',
            verificationInProgress: '正在验证中…',
            verifyingTheDetails: '我们正在核实一些信息。Expensify Card 准备好发放时，Concierge 会通知你。',
            disclaimer:
                'Expensify Visa® 商业卡由 The Bancorp Bank, N.A.（联邦存款保险公司 FDIC 成员）依据 Visa U.S.A. Inc. 授权发行，且可能无法在所有接受 Visa 卡的商户使用。Apple® 和 Apple 标志® 是 Apple Inc. 在美国及其他国家注册的商标。App Store 是 Apple Inc. 的服务标志。Google Play 和 Google Play 标志是 Google LLC 的商标。',
            euUkDisclaimer:
                '向欧洲经济区居民提供的卡片由 Transact Payments Malta Limited 发行，向英国居民提供的卡片由 Transact Payments Limited 根据 Visa Europe Limited 授权发行。Transact Payments Malta Limited 经马耳他金融服务管理局正式授权并监管，作为《1994 年金融机构法》下的金融机构运营。注册号 C 91879。Transact Payments Limited 经直布罗陀金融服务委员会授权并监管。',
            issueCard: '发卡',
            findCard: '查找卡片',
            newCard: '新卡片',
            name: '名称',
            lastFour: '后4位',
            limit: '限制',
            currentBalance: '当前余额',
            currentBalanceDescription: '当前余额是自上次结算日期以来已入账的所有 Expensify Card 交易的总和。',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `余额将于 ${settlementDate} 结清`,
            settleBalance: '结清余额',
            cardLimit: '卡片限额',
            remainingLimit: '剩余额度',
            requestLimitIncrease: '请求提高限额',
            remainingLimitDescription:
                '在计算您的剩余额度时，我们会考虑多个因素：您作为客户的服务年限、您在注册时提供的与业务相关的信息，以及您公司银行账户中的可用现金。您的剩余额度可能会每天波动。',
            earnedCashback: '返现',
            earnedCashbackDescription: '现金返还余额是根据您工作区内已结算的每月 Expensify Card 消费计算得出。',
            issueNewCard: '发放新卡',
            finishSetup: '完成设置',
            chooseBankAccount: '选择银行账户',
            chooseExistingBank: '选择现有的企业银行账户来支付你的 Expensify Card 余额，或添加一个新的银行账户',
            accountEndingIn: '以 … 结尾的账户',
            addNewBankAccount: '添加新银行账户',
            settlementAccount: '结算账户',
            settlementAccountDescription: '选择一个账户来支付您的 Expensify Card 余额。',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `请确保此账户与您的<a href="${reconciliationAccountSettingsLink}">对账账户</a>（${accountNumber}）一致，以便持续对账功能正常运行。`,
            settlementFrequency: '结算频率',
            settlementFrequencyDescription: '选择支付 Expensify Card 余额的频率。',
            settlementFrequencyInfo: '如果你想切换为按月结算，你需要通过 Plaid 连接你的银行账户，并且拥有过去 90 天为正数的余额记录。',
            frequency: {
                daily: '每天',
                monthly: '每月',
            },
            cardDetails: '卡片详情',
            cardPending: ({name}: {name: string}) => `卡片目前处于待处理状态，将在${name}的账户通过验证后发行。`,
            virtual: '虚拟',
            physical: '实体',
            deactivate: '停用卡片',
            changeCardLimit: '更改卡片限额',
            changeLimit: '更改限额',
            smartLimitWarning: (limit: number | string) => `如果您将此卡的额度更改为 ${limit}，在您批准该卡上的更多报销前，新交易将被拒绝。`,
            monthlyLimitWarning: (limit: number | string) => `如果您将此卡的限额更改为 ${limit}，新的交易将在下个月之前被拒绝。`,
            fixedLimitWarning: (limit: number | string) => `如果您将此卡的限额更改为 ${limit}，新的交易将被拒绝。`,
            changeCardLimitType: '更改卡片限额类型',
            changeLimitType: '更改限额类型',
            changeCardSmartLimitTypeWarning: (limit: number | string) => `如果您将此卡的限额类型更改为智能限额，新交易将会被拒绝，因为未批准的 ${limit} 限额已被用尽。`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) => `如果您将此卡的限额类型更改为“每月”，新的交易将被拒绝，因为已达到 ${limit} 的每月限额。`,
            addShippingDetails: '添加配送详情',
            issuedCard: (assignee: string) => `已为 ${assignee} 发放了一张 Expensify Card！该卡将在 2–3 个工作日内送达。`,
            issuedCardNoShippingDetails: (assignee: string) => `已为 ${assignee} 发行了一张 Expensify Card！一旦确认邮寄详情，卡片将被寄出。`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `已向 ${assignee} 发放了一张虚拟 Expensify 卡！可以立即使用 ${link}。`,
            addedShippingDetails: (assignee: string) => `${assignee} 已添加邮寄详情。Expensify Card 将在 2–3 个工作日内送达。`,
            replacedCard: (assignee: string) => `${assignee} 已更换其 Expensify Card。新卡将在 2-3 个工作日内送达。`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} 已更换他们的虚拟 Expensify 卡！${link} 可以立即使用。`,
            card: '卡片',
            replacementCard: '补发卡',
            verifyingHeader: '验证中',
            bankAccountVerifiedHeader: '银行账户已验证',
            verifyingBankAccount: '正在验证银行账户…',
            verifyingBankAccountDescription: '请稍候，我们正在确认此账户是否可以用于发放 Expensify 卡。',
            bankAccountVerified: '银行账户已验证！',
            bankAccountVerifiedDescription: '您现在可以向您的工作区成员发放 Expensify Cards。',
            oneMoreStep: '还差一步…',
            oneMoreStepDescription: '看起来我们需要手动验证您的银行账户。请前往 Concierge，那里有为您准备的操作说明。',
            gotIt: '明白了',
            goToConcierge: '前往 Concierge',
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
            spendCategoriesDescription: '自定义信用卡交易和扫描收据中商户消费的分类方式。',
            deleteFailureMessage: '删除类别时发生错误，请重试',
            categoryName: '类别名称',
            requiresCategory: '成员必须为所有费用设置类别',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) => `为了导出到 ${connectionName}，所有报销都必须进行分类。`,
            subtitle: '更好地掌握资金的支出去向。使用我们的默认类别，或添加您自己的类别。',
            emptyCategories: {
                title: '您尚未创建任何类别',
                subtitle: '添加一个类别来整理您的支出。',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>您的类别当前正从会计连接中导入。请前往<a href="${accountingPageURL}">会计</a>进行任何更改。</centered-text></muted-text>`,
            },
            updateFailureMessage: '更新类别时发生错误，请重试',
            createFailureMessage: '创建类别时发生错误，请重试',
            addCategory: '添加类别',
            editCategory: '编辑类别',
            editCategories: '编辑类别',
            findCategory: '查找类别',
            categoryRequiredError: '类别名称为必填项',
            existingCategoryError: '已存在同名类别',
            invalidCategoryName: '类别名称无效',
            importedFromAccountingSoftware: '以下类别是从您的',
            payrollCode: '工资代码',
            updatePayrollCodeFailureMessage: '更新工资代码时出错，请重试',
            glCode: '总账代码',
            updateGLCodeFailureMessage: '更新总账代码时发生错误，请重试',
            importCategories: '导入类别',
            cannotDeleteOrDisableAllCategories: {
                title: '无法删除或停用所有类别',
                description: `由于您的工作区需要类别，至少必须保留一个已启用的类别。`,
            },
        },
        moreFeatures: {
            subtitle: '随着您的业务增长，请使用下面的切换按钮来启用更多功能。每个功能都会出现在导航菜单中，以便进一步自定义。',
            spendSection: {
                title: '支出',
                subtitle: '启用有助于扩大全队规模的功能。',
            },
            manageSection: {
                title: '管理',
                subtitle: '添加控件，帮助将支出控制在预算范围内。',
            },
            earnSection: {
                title: '赚',
                subtitle: '简化您的营收并更快收款。',
            },
            organizeSection: {
                title: '整理',
                subtitle: '分组并分析支出，记录每一笔已缴税款。',
            },
            integrateSection: {
                title: '集成',
                subtitle: '将 Expensify 连接到常用的金融产品。',
            },
            distanceRates: {
                title: '距离费率',
                subtitle: '添加、更新并执行费率。',
            },
            perDiem: {
                title: '每日津贴',
                subtitle: '设置每日津贴标准以控制员工日常支出。',
            },
            travel: {
                title: '旅行',
                subtitle: '预订、管理和核对您的所有商务旅行。',
                getStarted: {
                    title: '开始使用 Expensify Travel',
                    subtitle: '我们只需要您企业的更多信息，然后您就可以准备出发了。',
                    ctaText: '开始吧',
                },
                reviewingRequest: {
                    title: '收拾行李，我们已收到您的请求...',
                    subtitle: '我们正在审查您启用 Expensify Travel 的请求。别担心，准备就绪时我们会通知您。',
                    ctaText: '请求已发送',
                },
                bookOrManageYourTrip: {
                    title: '预订或管理您的旅行',
                    subtitle: '使用 Expensify Travel 获得最佳旅行优惠，并在一个地方管理所有商务费用。',
                    ctaText: '预订或管理',
                },
                travelInvoicing: {
                    travelBookingSection: {title: '旅行预订', subtitle: '恭喜！您现在可以在此工作区预订和管理差旅了。', manageTravelLabel: '管理差旅'},
                    centralInvoicingSection: {
                        title: '集中开票',
                        subtitle: '将所有差旅支出集中到月度发票中，而不是在购买时逐笔付款。',
                        learnHow: '了解如何操作。',
                        subsections: {
                            currentTravelSpendLabel: '当前差旅行支出',
                            currentTravelSpendCta: '支付余额',
                            currentTravelLimitLabel: '当前出差限额',
                            settlementAccountLabel: '结算账户',
                            settlementFrequencyLabel: '结算频率',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: '获取支出洞察并实现有效管控。',
                disableCardTitle: '禁用 Expensify Card',
                disableCardPrompt: '您无法停用 Expensify Card，因为它当前正在使用中。请联系 Concierge 获取下一步操作指引。',
                disableCardButton: '与 Concierge 聊天',
                feed: {
                    title: '获取 Expensify 卡',
                    subTitle: '简化您的企业报销流程，最多可节省 50% 的 Expensify 账单费用，此外还能：',
                    features: {
                        cashBack: '每一笔美国消费都可享受返现',
                        unlimited: '无限虚拟卡',
                        spend: '支出控制和自定义限额',
                    },
                    ctaTitle: '发放新卡',
                },
            },
            companyCards: {
                title: '公司信用卡',
                subtitle: '连接你已有的卡片。',
                feed: {
                    title: '自带卡片（BYOC）',
                    features: {support: '连接来自 10,000 多家银行的卡片', assignCards: '关联你团队的现有卡片', automaticImport: '我们会自动导入交易记录'},
                    subtitle: '关联你已有的卡片，以自动导入交易、匹配收据并进行对账。',
                },
                bankConnectionError: '银行连接问题',
                connectWithPlaid: '通过 Plaid 连接',
                connectWithExpensifyCard: '试用 Expensify Card。',
                bankConnectionDescription: `请尝试再次添加您的卡片。否则，您可以`,
                disableCardTitle: '禁用公司卡片',
                disableCardPrompt: '由于该功能正在使用中，您无法停用公司卡。请联系 Concierge 以获取下一步指引。',
                disableCardButton: '与 Concierge 聊天',
                cardDetails: '卡片详情',
                cardNumber: '卡号',
                cardholder: '持卡人',
                cardName: '卡片名称',
                allCards: '所有卡片',
                assignedCards: '已分配',
                unassignedCards: '未分配',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} 导出` : `${integration} 导出`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `选择要导出交易记录的 ${integration} 账户。`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `选择要导出交易记录的 ${integration} 账户。请选择不同的<a href="${exportPageLink}">导出选项</a>以更改可用账户。`,
                lastUpdated: '最近更新',
                transactionStartDate: '交易开始日期',
                updateCard: '更新卡片',
                unassignCard: '取消分配卡片',
                unassign: '取消分配',
                unassignCardDescription: '取消分配此卡将从持卡人的账户中移除所有处于草稿报表中的交易。',
                assignCard: '分配卡片',
                cardFeedName: '卡片流水名称',
                cardFeedNameDescription: '为此卡片流水起一个独特的名称，以便将它与其他卡片流水区分开来。',
                cardFeedTransaction: '删除交易',
                cardFeedTransactionDescription: '选择是否允许持卡人删除卡片交易。新的交易将遵循这些规则。',
                cardFeedRestrictDeletingTransaction: '限制删除交易',
                cardFeedAllowDeletingTransaction: '允许删除交易',
                removeCardFeed: '移除卡片流水',
                removeCardFeedTitle: (feedName: string) => `移除 ${feedName} 订阅源`,
                removeCardFeedDescription: '您确定要移除此银行卡导入吗？这将取消分配所有银行卡。',
                error: {
                    feedNameRequired: '必须填写卡片流水名称',
                    statementCloseDateRequired: '请选择账单结算日期。',
                },
                corporate: '限制删除交易',
                personal: '允许删除交易',
                setFeedNameDescription: '为此卡片流水命名一个唯一名称，以便与其他区分',
                setTransactionLiabilityDescription: '启用后，持卡人可以删除卡片交易。新的交易将遵循此规则。',
                emptyAddedFeedTitle: '分配公司卡',
                emptyAddedFeedDescription: '首先将您的第一张卡分配给一位成员以开始使用。',
                pendingFeedTitle: `我们正在审核您的请求…`,
                pendingFeedDescription: `我们目前正在审核您的数据源详情。完成后，我们将通过以下方式与您联系`,
                pendingBankTitle: '检查您的浏览器窗口',
                pendingBankDescription: (bankName: string) => `请通过刚刚打开的浏览器窗口连接到 ${bankName}。如果没有打开，`,
                pendingBankLink: '请点击此处',
                giveItNameInstruction: '为此卡片起一个与众不同的名称。',
                updating: '正在更新…',
                neverUpdated: '从不',
                noAccountsFound: '未找到账户',
                defaultCard: '默认卡片',
                downgradeTitle: `无法降级工作区`,
                downgradeSubTitle: `由于连接了多个银行卡流水（不包括 Expensify Cards），此工作区无法降级。请<a href="#">仅保留一个银行卡流水</a>后再继续。`,
                noAccountsFoundDescription: (connection: string) => `请在 ${connection} 中添加该账户，然后再次同步该连接`,
                expensifyCardBannerTitle: '获取 Expensify 卡',
                expensifyCardBannerSubtitle: '在每一笔美国消费中享受现金返现，Expensify 账单最高可减免 50%，无限虚拟卡，还有更多精彩优惠。',
                expensifyCardBannerLearnMoreButton: '了解更多',
                statementCloseDateTitle: '对账单结算日期',
                statementCloseDateDescription: '请告知我们您的信用卡结单结算日期，我们会在 Expensify 中创建一份对应的结单。',
            },
            workflows: {
                title: '工作流程',
                subtitle: '配置支出审批和支付方式。',
                disableApprovalPrompt: '此工作区中的 Expensify Cards 目前依赖审批来定义其智能限额（Smart Limits）。在停用审批之前，请修改所有具有智能限额的 Expensify Cards 的限额类型。',
            },
            invoices: {
                title: '发票',
                subtitle: '发送和接收发票。',
            },
            categories: {
                title: '类别',
                subtitle: '跟踪并整理支出。',
            },
            tags: {
                title: '标签',
                subtitle: '分类成本并跟踪可计费费用。',
            },
            taxes: {
                title: '税费',
                subtitle: '记录并申报可抵扣税款。',
            },
            reportFields: {
                title: '报表字段',
                subtitle: '为支出设置自定义字段。',
            },
            connections: {
                title: '会计',
                subtitle: '同步您的科目表及更多内容。',
            },
            receiptPartners: {
                title: '收据合作伙伴',
                subtitle: '自动导入收据。',
            },
            connectionsWarningModal: {
                featureEnabledTitle: '没那么快……',
                featureEnabledText: '若要启用或停用此功能，您需要更改会计导入设置。',
                disconnectText: '若要禁用会计功能，您需要在工作区中断开您的会计连接。',
                manageSettings: '管理设置',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: '断开 Uber',
                disconnectText: '若要禁用此功能，请先断开 Uber for Business 集成连接。',
                description: '确定要断开此集成吗？',
                confirmText: '明白了',
            },
            workflowWarningModal: {
                featureEnabledTitle: '没那么快……',
                featureEnabledText: '此工作区中的 Expensify 卡依赖审批流程来定义其智能限额。\n\n在禁用工作流程之前，请先更改所有具有智能限额的卡片的限额类型。',
                confirmText: '前往 Expensify 卡片',
            },
            rules: {
                title: '规则',
                subtitle: '要求收据、标记高额支出等。',
            },
            timeTracking: {
                title: '时间',
                subtitle: '为时间跟踪设置按小时计费费率。',
                defaultHourlyRate: '默认时薪',
            },
        },
        reports: {
            reportsCustomTitleExamples: '示例：',
            customReportNamesSubtitle: `<muted-text>使用我们的<a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">丰富公式</a>自定义报表标题。</muted-text>`,
            customNameTitle: '默认报表标题',
            customNameDescription: `使用我们的<a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">丰富公式</a>为费用报表选择自定义名称。`,
            customNameInputLabel: '名称',
            customNameEmailPhoneExample: '成员的邮箱或电话：{report:submit:from}',
            customNameStartDateExample: '报告开始日期：{report:startdate}',
            customNameWorkspaceNameExample: '工作区名称：{report:workspacename}',
            customNameReportIDExample: '报表 ID：{report:id}',
            customNameTotalExample: '总计：{report:total}。',
            preventMembersFromChangingCustomNamesTitle: '阻止成员更改自定义报表标题',
        },
        reportFields: {
            addField: '添加字段',
            delete: '删除字段',
            deleteFields: '删除字段',
            findReportField: '查找报表字段',
            deleteConfirmation: '您确定要删除此报表字段吗？',
            deleteFieldsConfirmation: '您确定要删除这些报表字段吗？',
            emptyReportFields: {
                title: '您尚未创建任何报表字段',
                subtitle: '添加一个自定义字段（文本、日期或下拉菜单），使其显示在报表上。',
            },
            subtitle: '报表字段适用于所有支出，在你希望提示填写额外信息时会很有帮助。',
            disableReportFields: '禁用报表字段',
            disableReportFieldsConfirmation: '您确定吗？文本和日期字段将被删除，列表将被停用。',
            importedFromAccountingSoftware: '下面的报告字段是从您的',
            textType: '文本',
            dateType: '日期',
            dropdownType: '列表',
            formulaType: '公式',
            textAlternateText: '添加一个自由文本输入字段。',
            dateAlternateText: '添加用于选择日期的日历。',
            dropdownAlternateText: '添加一个可供选择的选项列表。',
            formulaAlternateText: '添加一个公式字段。',
            nameInputSubtitle: '为报表字段选择一个名称。',
            typeInputSubtitle: '选择要使用的报表字段类型。',
            initialValueInputSubtitle: '请输入要在报表字段中显示的起始值。',
            listValuesInputSubtitle: '这些值将显示在您的报表字段下拉菜单中。已启用的值可供成员选择。',
            listInputSubtitle: '这些值将显示在您的报表字段列表中。已启用的值可供成员选择。',
            deleteValue: '删除值',
            deleteValues: '删除值',
            disableValue: '禁用值',
            disableValues: '禁用值',
            enableValue: '启用值',
            enableValues: '启用值',
            emptyReportFieldsValues: {
                title: '你还没有创建任何列表值',
                subtitle: '在报表中添加要显示的自定义值。',
            },
            deleteValuePrompt: '确定要删除此列表值吗？',
            deleteValuesPrompt: '确定要删除这些列表值吗？',
            listValueRequiredError: '请输入列表值名称',
            existingListValueError: '已存在同名的列表值',
            editValue: '编辑值',
            listValues: '列出值',
            addValue: '增加值',
            existingReportFieldNameError: '已存在同名的报表字段',
            reportFieldNameRequiredError: '请输入报表字段名称',
            reportFieldTypeRequiredError: '请选择报表字段类型',
            circularReferenceError: '此字段不能引用自身。请更新。',
            reportFieldInitialValueRequiredError: '请选择报表字段的初始值',
            genericFailureMessage: '更新报表字段时出错。请重试。',
        },
        tags: {
            tagName: '标签名称',
            requiresTag: '成员必须为所有报销添加标签',
            trackBillable: '跟踪可计费费用',
            customTagName: '自定义标签名称',
            enableTag: '启用标签',
            enableTags: '启用标签',
            requireTag: '必填标签',
            requireTags: '必填标签',
            notRequireTags: '不要求',
            disableTag: '禁用标签',
            disableTags: '禁用标签',
            addTag: '添加标签',
            editTag: '编辑标签',
            editTags: '编辑标签',
            findTag: '查找标签',
            subtitle: '标签提供了更详细的方式来对成本进行分类。',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>你正在使用<a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">依赖标签</a>。你可以<a href="${importSpreadsheetLink}">重新导入电子表格</a>来更新你的标签。</muted-text>`,
            emptyTags: {
                title: '你尚未创建任何标签',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: '添加标签以跟踪项目、地点、部门等。',
                subtitleHTML: `<muted-text><centered-text>添加标签以跟踪项目、地点、部门等。<a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">了解更多</a>关于用于导入的标签文件格式。</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>您的标签当前正从会计连接中导入。请前往<a href="${accountingPageURL}">会计</a>页面进行任何更改。</centered-text></muted-text>`,
            },
            deleteTag: '删除标签',
            deleteTags: '删除标签',
            deleteTagConfirmation: '确定要删除此标签吗？',
            deleteTagsConfirmation: '您确定要删除这些标签吗？',
            deleteFailureMessage: '删除标签时出错，请重试',
            tagRequiredError: '标签名称为必填项',
            existingTagError: '已存在同名标签',
            invalidTagNameError: '标签名称不能为 0。请选择其他值。',
            genericFailureMessage: '更新标签时出错，请重试',
            importedFromAccountingSoftware: '下面的标签是从您的',
            glCode: '总账代码',
            updateGLCodeFailureMessage: '更新总账代码时发生错误，请重试',
            tagRules: '标签规则',
            approverDescription: '审批人',
            importTags: '导入标签',
            importTagsSupportingText: '用一种或多种标签为你的报销进行编码。',
            configureMultiLevelTags: '为多级标签配置你的标签列表。',
            importMultiLevelTagsSupportingText: `这是您的标签预览。如果一切看起来都不错，请点击下方将其导入。`,
            importMultiLevelTags: {
                firstRowTitle: '第一行是每个标签列表的标题',
                independentTags: '这些是独立标签',
                glAdjacentColumn: '相邻列中有一个总账代码',
            },
            tagLevel: {
                singleLevel: '单层标签',
                multiLevel: '多级标签',
            },
            switchSingleToMultiLevelTagWarning: {
                title: '切换标签级别',
                prompt1: '切换标签级别将清除当前所有标签。',
                prompt2: '我们建议您先',
                prompt3: '下载备份',
                prompt4: '通过导出您的标签。',
                prompt5: '了解更多',
                prompt6: '关于标签级别。',
            },
            overrideMultiTagWarning: {
                title: '导入标签',
                prompt1: '你确定吗？',
                prompt2: '现有标签将被覆盖，但您可以',
                prompt3: '下载备份',
                prompt4: '第一。',
            },
            importedTagsMessage: (columnCounts: number) =>
                `我们在您的电子表格中找到了 *${columnCounts} 列*。请在包含标签名称的列旁边选择 *Name*。您也可以在设置标签状态的列旁边选择 *Enabled*。`,
            cannotDeleteOrDisableAllTags: {
                title: '无法删除或禁用所有标签',
                description: `由于您的工作区需要标签，至少必须保留一个已启用的标签。`,
            },
            cannotMakeAllTagsOptional: {
                title: '无法将所有标签设为可选',
                description: `至少必须保留一个必填标签，因为你的工作区设置要求使用标签。`,
            },
            cannotMakeTagListRequired: {
                title: '无法将标签列表设为必填',
                description: '只有在您的策略配置了多个标签级别时，您才能将标签列表设为必填。',
            },
            tagCount: () => ({
                one: '1 天',
                other: (count: number) => `${count} 个标签`,
            }),
        },
        taxes: {
            subtitle: '添加税种名称、税率，并设置默认值。',
            addRate: '添加费率',
            workspaceDefault: '工作区默认货币',
            foreignDefault: '外币默认值',
            customTaxName: '自定义税费名称',
            value: '值',
            taxReclaimableOn: '可退税金额',
            taxRate: '税率',
            findTaxRate: '查找税率',
            error: {
                taxRateAlreadyExists: '此税务名称已在使用中',
                taxCodeAlreadyExists: '此税码已被使用',
                valuePercentageRange: '请输入介于 0 到 100 之间的有效百分比',
                customNameRequired: '自定义税名称为必填项',
                deleteFailureMessage: '删除税率时出错。请重试或联系 Concierge 寻求帮助。',
                updateFailureMessage: '更新税率时发生错误。请重试或向 Concierge 寻求帮助。',
                createFailureMessage: '创建税率时出错。请重试或向 Concierge 寻求帮助。',
                updateTaxClaimableFailureMessage: '可报销部分必须小于里程费率金额',
            },
            deleteTaxConfirmation: '您确定要删除此税项吗？',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `您确定要删除 ${taxAmount} 个税项吗？`,
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
            title: '为你的新工作区命名',
            selectFeatures: '选择要复制的功能',
            whichFeatures: '您希望将哪些功能复制到您的新工作区？',
            confirmDuplicate: '您要继续吗？',
            categories: '类别和您的自动分类规则',
            reimbursementAccount: '报销账户',
            welcomeNote: '请开始使用我的新工作区',
            delayedSubmission: '延迟提交',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `您即将创建并分享 ${newWorkspaceName ?? ''} 给原工作区中的 ${totalMembers ?? 0} 名成员。`,
            error: '复制您的新工作区时出错。请重试。',
        },
        emptyWorkspace: {
            title: '你还没有任何工作区',
            subtitle: '跟踪收据、报销费用、管理差旅、发送发票等。',
            createAWorkspaceCTA: '开始使用',
            features: {
                trackAndCollect: '跟踪并收集收据',
                reimbursements: '报销员工',
                companyCards: '管理公司卡',
            },
            notFound: '未找到工作区',
            description: '聊天室是与多人讨论和协作的理想场所。要开始协作，请创建或加入一个工作区',
        },
        new: {
            newWorkspace: '新工作区',
            getTheExpensifyCardAndMore: '获取 Expensify 卡及更多',
            confirmWorkspace: '确认工作区',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `我的群组工作区${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `${userName} 的工作区${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: '从工作区中移除成员时出错，请重试',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `您确定要移除 ${memberName} 吗？`,
                other: '您确定要移除这些成员吗？',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} 是此工作区中的审批人。当你停止与其共享此工作区时，我们会在审批流程中用工作区所有者 ${ownerName} 替换他们`,
            removeMembersTitle: () => ({
                one: '移除成员',
                other: '移除成员',
            }),
            findMember: '查找成员',
            removeWorkspaceMemberButtonTitle: '从工作区中移除',
            removeGroupMemberButtonTitle: '从群组中移除',
            removeRoomMemberButtonTitle: '从聊天中移除',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `您确定要移除 ${memberName} 吗？`,
            removeMemberTitle: '移除成员',
            transferOwner: '转移所有者',
            makeMember: () => ({
                one: '设为成员',
                other: '设为成员',
            }),
            makeAdmin: () => ({
                one: '设为管理员',
                other: '设为管理员',
            }),
            makeAuditor: () => ({
                one: '设为审计员',
                other: '设为审计员',
            }),
            selectAll: '全选',
            error: {
                genericAdd: '添加此工作区成员时出现问题',
                cannotRemove: '你无法移除自己或工作区所有者',
                genericRemove: '移除该工作区成员时出现问题',
            },
            addedWithPrimary: '有些成员是使用其主登录名添加的。',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `由次要登录账号 ${secondaryLogin} 添加。`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `工作区成员总数：${count}`,
            importMembers: '导入成员',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `如果你将 ${approver} 从此工作区移除，我们会在审批工作流中用工作区所有者 ${workspaceOwner} 来替代他们。`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) => `${memberName} 还有待审批的报销报告。请让他们先完成审批，或在将其从工作区中移除之前接管他们的报告。`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) => `您无法将 ${memberName} 从此工作区移除。请先在“工作流 > 进行或跟踪付款”中设置新的报销人，然后再试一次。`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `如果您将此工作区中移除 ${memberName}，我们会将首选导出人替换为工作区所有者 ${workspaceOwner}。`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `如果您将此工作区中移除 ${memberName}，我们会将其技术联系人更改为工作区所有者 ${workspaceOwner}。`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) => `${memberName} 还有一份待处理报表需要采取行动。请在将其从工作区移除之前，先让 TA 完成所需操作。`,
        },
        card: {
            getStartedIssuing: '从开通您的第一张虚拟或实体卡开始使用。',
            issueCard: '发卡',
            issueNewCard: {
                whoNeedsCard: '谁需要一张卡？',
                inviteNewMember: '邀请新成员',
                findMember: '查找成员',
                chooseCardType: '选择卡类型',
                physicalCard: '实体卡',
                physicalCardDescription: '非常适合经常消费的用户',
                virtualCard: '虚拟卡',
                virtualCardDescription: '即时且灵活',
                chooseLimitType: '选择限额类型',
                smartLimit: '智能额度',
                smartLimitDescription: '在需要审批前可支出至指定金额',
                monthly: '每月',
                monthlyDescription: '每月支出不超过指定金额',
                fixedAmount: '固定金额',
                fixedAmountDescription: '一次性消费最高至某个金额',
                setLimit: '设置限制',
                cardLimitError: '请输入少于 $21,474,836 的金额',
                giveItName: '给它起个名字',
                giveItNameInstruction: '让它足够独特，以便与其他卡片区分开来。提供具体的使用场景会更好！',
                cardName: '卡片名称',
                letsDoubleCheck: '让我们再仔细检查一下，确保一切都正确。',
                willBeReadyToUse: '此卡将立即可用。',
                willBeReadyToShip: '此卡将立即准备好发货。',
                cardholder: '持卡人',
                cardType: '卡类型',
                limit: '限制',
                limitType: '限额类型',
                disabledApprovalForSmartLimitError: '在设置智能限额之前，请先在 <strong>Workflows > Add approvals</strong> 中启用审批',
            },
            deactivateCardModal: {
                deactivate: '停用',
                deactivateCard: '停用卡片',
                deactivateConfirmation: '停用此卡将拒绝所有未来交易，且此操作无法撤销。',
            },
        },
        accounting: {
            settings: '设置',
            title: '连接',
            subtitle: '连接到您的会计系统，使用科目表为交易编码，自动匹配付款，并保持您的财务数据同步。',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: '与您的设置专员聊天。',
            talkYourAccountManager: '与您的客户经理聊天。',
            talkToConcierge: '与 Concierge 聊天。',
            needAnotherAccounting: '需要其他会计软件？',
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
            errorODIntegration: (oldDotPolicyConnectionsURL: string) => `Expensify Classic 中已设置的连接出现错误。[前往 Expensify Classic 解决此问题。](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: '前往 Expensify Classic 管理您的设置。',
            setup: '连接',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `上次同步时间：${relativeDate}`,
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
                return `断开连接 ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `连接 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '会计集成'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return '无法连接到 QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return '无法连接到 Xero';
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
            taxes: '税费',
            imported: '已导入',
            notImported: '未导入',
            importAsCategory: '已作为类别导入',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: '已导入',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: '作为标签导入',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: '已导入',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: '未导入',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: '未导入',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: '已作为报表字段导入',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'NetSuite 员工默认值',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '此集成';
                return `您确定要断开与 ${integrationName} 的连接吗？`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `您确定要连接 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '此会计集成'} 吗？这将移除所有现有的会计连接。`,
            enterCredentials: '请输入您的凭证',
            claimOffer: {
                badgeText: '优惠可用！',
                xero: {
                    headline: '免费使用 Xero 6 个月！',
                    description: '<muted-text><centered-text>首次使用 Xero？Expensify 客户可免费使用 6 个月。请在下方领取您的优惠。</centered-text></muted-text>',
                    connectButton: '连接到 Xero',
                },
                uber: {
                    headerTitle: 'Uber for Business',
                    headline: 'Uber 乘车享受 5% 折扣',
                    description: `<muted-text><centered-text>通过 Expensify 激活 Uber for Business，在 6 月之前的所有商务乘车均可享受 5% 折扣。<a href="${CONST.UBER_TERMS_LINK}">适用条款。</a></centered-text></muted-text>`,
                    connectButton: '连接到 Uber for Business',
                },
            },
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return '正在导入客户';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return '正在导入员工';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return '正在导入账户';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return '正在导入类别';
                        case 'quickbooksOnlineImportLocations':
                            return '正在导入地点';
                        case 'quickbooksOnlineImportProcessing':
                            return '正在处理导入的数据';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '正在同步已报销报表和账单付款';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '正在导入税码';
                        case 'quickbooksOnlineCheckConnection':
                            return '正在检查 QuickBooks Online 连接';
                        case 'quickbooksOnlineImportMain':
                            return '正在导入 QuickBooks Online 数据';
                        case 'startingImportXero':
                            return '正在导入 Xero 数据';
                        case 'startingImportQBO':
                            return '正在导入 QuickBooks Online 数据';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return '正在导入 QuickBooks Desktop 数据';
                        case 'quickbooksDesktopImportTitle':
                            return '正在导入标题';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '正在导入批准证书';
                        case 'quickbooksDesktopImportDimensions':
                            return '正在导入维度';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '正在导入保存的策略';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return '仍在与 QuickBooks 同步数据… 请确保 Web Connector 正在运行';
                        case 'quickbooksOnlineSyncTitle':
                            return '正在同步 QuickBooks Online 数据';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return '正在加载数据';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return '正在更新类别';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '正在更新客户/项目';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return '正在更新人员列表';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return '正在更新报表字段';
                        case 'jobDone':
                            return '正在加载导入的数据';
                        case 'xeroSyncImportChartOfAccounts':
                            return '正在同步科目表';
                        case 'xeroSyncImportCategories':
                            return '正在同步类别';
                        case 'xeroSyncImportCustomers':
                            return '正在同步客户';
                        case 'xeroSyncXeroReimbursedReports':
                            return '将 Expensify 报告标记为已报销';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return '将 Xero 账单和发票标记为已支付';
                        case 'xeroSyncImportTrackingCategories':
                            return '正在同步跟踪类别';
                        case 'xeroSyncImportBankAccounts':
                            return '正在同步银行账户';
                        case 'xeroSyncImportTaxRates':
                            return '正在同步税率';
                        case 'xeroCheckConnection':
                            return '正在检查 Xero 连接';
                        case 'xeroSyncTitle':
                            return '正在同步 Xero 数据';
                        case 'netSuiteSyncConnection':
                            return '正在初始化与 NetSuite 的连接';
                        case 'netSuiteSyncCustomers':
                            return '正在导入客户';
                        case 'netSuiteSyncInitData':
                            return '正在从 NetSuite 检索数据';
                        case 'netSuiteSyncImportTaxes':
                            return '正在导入税费';
                        case 'netSuiteSyncImportItems':
                            return '正在导入项目';
                        case 'netSuiteSyncData':
                            return '将数据导入 Expensify';
                        case 'netSuiteSyncAccounts':
                            return '正在同步账户';
                        case 'netSuiteSyncCurrencies':
                            return '正在同步货币';
                        case 'netSuiteSyncCategories':
                            return '正在同步类别';
                        case 'netSuiteSyncReportFields':
                            return '将数据导入为 Expensify 报告字段';
                        case 'netSuiteSyncTags':
                            return '将数据导入为 Expensify 标签';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '正在更新连接信息';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return '将 Expensify 报告标记为已报销';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return '将 NetSuite 账单和发票标记为已支付';
                        case 'netSuiteImportVendorsTitle':
                            return '正在导入供应商';
                        case 'netSuiteImportCustomListsTitle':
                            return '导入自定义列表';
                        case 'netSuiteSyncImportCustomLists':
                            return '导入自定义列表';
                        case 'netSuiteSyncImportSubsidiaries':
                            return '正在导入子公司';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return '正在导入供应商';
                        case 'intacctCheckConnection':
                            return '正在检查 Sage Intacct 连接';
                        case 'intacctImportDimensions':
                            return '正在导入 Sage Intacct 维度';
                        case 'intacctImportTitle':
                            return '正在导入 Sage Intacct 数据';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `阶段缺少翻译：${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '首选导出工具',
            exportPreferredExporterNote: '首选导出人可以是任何工作区管理员，但如果你在“域设置”中为各个公司卡片设置了不同的导出账户，则该导出人还必须是域管理员。',
            exportPreferredExporterSubNote: '设置完成后，首选导出人将在其账户中看到可导出的报表。',
            exportAs: '导出为',
            exportOutOfPocket: '将自付费用导出为',
            exportCompanyCard: '将公司卡费用导出为',
            exportDate: '导出日期',
            defaultVendor: '默认供应商',
            autoSync: '自动同步',
            autoSyncDescription: '每天自动同步 NetSuite 和 Expensify。实时导出已定稿报表',
            reimbursedReports: '同步已报销报表',
            cardReconciliation: '卡片对账',
            reconciliationAccount: '对账科目',
            continuousReconciliation: '持续对账',
            saveHoursOnReconciliation: '通过让 Expensify 持续为你对账 Expensify Card 的对账单和结算，每个会计期间都能节省数小时的对账时间。',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>要启用持续对账，请为 ${connectionName} 启用<a href="${accountingAdvancedSettingsLink}">自动同步</a>。</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: '选择用于对账 Expensify Card 付款的银行账户。',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `请确认此账户与您的<a href="${settlementAccountUrl}">Expensify Card 结算账户</a>（以 ${lastFourPAN} 结尾）一致，以确保“持续对账”功能正常运行。`,
            },
        },
        export: {
            notReadyHeading: '尚未准备好导出',
            notReadyDescription: '草稿或待处理的报销报告无法导出到会计系统。请先批准或支付这些报销后再导出。',
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
            invoiceBalanceSubtitle: '这是你通过收取发票款项获得的当前余额。如果你已经添加了银行账户，它会自动转入你的银行账户。',
            bankAccountsSubtitle: '添加一个银行账户以进行和接收发票付款。',
        },
        invite: {
            member: '邀请成员',
            members: '邀请成员',
            invitePeople: '邀请新成员',
            genericFailureMessage: '在邀请成员加入工作区时发生错误。请重试。',
            pleaseEnterValidLogin: `请确保电子邮箱或电话号码有效（例如：${CONST.EXAMPLE_PHONE_NUMBER}）。`,
            user: '用户',
            users: '用户',
            invited: '已邀请',
            removed: '已移除',
            to: '到',
            from: '来自',
        },
        inviteMessage: {
            confirmDetails: '确认详情',
            inviteMessagePrompt: '通过在下方添加一条消息，让您的邀请变得更加特别！',
            personalMessagePrompt: '消息',
            genericFailureMessage: '在邀请成员加入工作区时发生错误。请重试。',
            inviteNoMembersError: '请选择至少一名成员进行邀请',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} 请求加入 ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: '哎呀！先别着急……',
            workspaceNeeds: '一个工作区至少需要启用一个距离费率。',
            distance: '距离',
            centrallyManage: '集中管理费率，以英里或公里跟踪，并设置默认类别。',
            rate: '费率',
            addRate: '添加费率',
            findRate: '查找费率',
            trackTax: '跟踪税费',
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
            taxFeatureNotEnabledMessage: '<muted-text>必须在工作区启用税费功能才能使用此功能。前往<a href="#">更多功能</a>进行更改。</muted-text>',
            deleteDistanceRate: '删除里程费率',
            areYouSureDelete: () => ({
                one: '你确定要删除此费率吗？',
                other: '您确定要删除这些费率吗？',
            }),
            errors: {
                rateNameRequired: '费率名称为必填项',
                existingRateName: '已存在使用此名称的里程费率',
            },
        },
        editor: {
            descriptionInputLabel: '描述',
            nameInputLabel: '名称',
            typeInputLabel: '类型',
            initialValueInputLabel: '初始值',
            nameInputHelpText: '这是您在工作区中将看到的名称。',
            nameIsRequiredError: '你需要为你的工作区命名',
            currencyInputLabel: '默认货币',
            currencyInputHelpText: '此工作区中的所有报销都会转换为该货币。',
            currencyInputDisabledText: (currency: string) => `无法更改默认货币，因为此工作区已关联到一个 ${currency} 银行账户。`,
            save: '保存',
            genericFailureMessage: '更新工作区时出错。请重试。',
            avatarUploadFailureMessage: '上传头像时出错。请重试。',
            addressContext: '要启用 Expensify Travel，需要提供一个工作区地址。请输入与您的企业关联的地址。',
            policy: '报销政策',
        },
        bankAccount: {
            continueWithSetup: '继续设置',
            youAreAlmostDone: '您几乎已经完成银行账户的设置，这将使您能够发放公司卡、报销费用、收取发票并支付账单。',
            streamlinePayments: '简化付款',
            connectBankAccountNote: '注意：个人银行账户不能用于工作区的付款。',
            oneMoreThing: '还有一件事！',
            allSet: '一切就绪！',
            accountDescriptionWithCards: '此银行账户将用于发放公司卡、报销费用、收取发票款项和支付账单。',
            letsFinishInChat: '让我们在聊天中完成吧！',
            finishInChat: '在聊天中完成',
            almostDone: '快完成了！',
            disconnectBankAccount: '断开银行账户',
            startOver: '重新开始',
            updateDetails: '更新详情',
            yesDisconnectMyBankAccount: '是的，断开我的银行账户',
            yesStartOver: '是的，重新开始',
            disconnectYourBankAccount: (bankName: string) => `断开您的 <strong>${bankName}</strong> 银行账户连接。此账户的所有未完成交易仍将继续处理。`,
            clearProgress: '重新开始将清除你目前为止的进度。',
            areYouSure: '你确定吗？',
            workspaceCurrency: '工作区货币',
            updateCurrencyPrompt: '看起来你的工作区当前使用的货币不是 USD。请点击下方按钮，将货币立即更新为 USD。',
            updateToUSD: '更新为 USD',
            updateWorkspaceCurrency: '更新工作区货币',
            workspaceCurrencyNotSupported: '不支持工作区货币',
            yourWorkspace: `您的工作区当前设置为不支持的货币。请查看<a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">支持的货币列表</a>。`,
            chooseAnExisting: '选择一个已有的银行账户来支付报销，或添加一个新账户。',
        },
        changeOwner: {
            changeOwnerPageTitle: '转移所有者',
            addPaymentCardTitle: '输入您的付款卡以转移所有权',
            addPaymentCardButtonText: '接受条款并添加付款卡',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>阅读并接受<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">条款</a>和<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">隐私</a>政策以添加您的卡片。</muted-text-micro>`,
            addPaymentCardPciCompliant: '符合 PCI-DSS 标准',
            addPaymentCardBankLevelEncrypt: '银行级加密',
            addPaymentCardRedundant: '冗余基础设施',
            addPaymentCardLearnMore: `<muted-text>详细了解我们的<a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">安全性</a>。</muted-text>`,
            amountOwedTitle: '未结余额',
            amountOwedButtonText: '确定',
            amountOwedText: '此账户有上个月未结清的余额。\n\n你是否要清除该余额并接管此工作区的付费？',
            ownerOwesAmountTitle: '未结余额',
            ownerOwesAmountButtonText: '转移余额',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `拥有此工作区的账户（${email}）有来自上个月的未结清余额。

您是否要转移这笔金额（${amount}），以便接管此工作区的账单？您的支付卡将立即被扣款。`,
            subscriptionTitle: '接管年度订阅',
            subscriptionButtonText: '转移订阅',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `接管此工作区将把其年度订阅与您当前的订阅合并。这样会将您的订阅人数增加 ${usersCount} 名成员，使您的新订阅人数达到 ${finalCount}。您想要继续吗？`,
            duplicateSubscriptionTitle: '重复订阅警报',
            duplicateSubscriptionButtonText: '继续',
            duplicateSubscriptionText: (email: string, workspaceName: string) => `看起来你正在尝试接管 ${email} 的工作区的账单，但要做到这一点，你需要先成为他们所有工作区的管理员。

如果你只想接管工作区 ${workspaceName} 的账单，请点击“继续”。

如果你想接管其整个订阅的账单，请先让他们将你添加为其所有工作区的管理员，然后再接管账单。`,
            hasFailedSettlementsTitle: '无法转移所有权',
            hasFailedSettlementsButtonText: '明白了',
            hasFailedSettlementsText: (email: string) =>
                `您无法接管账单，因为 ${email} 有一笔逾期未结清的 Expensify Card 结算。请让他们联系 concierge@expensify.com 解决此问题。之后，您就可以接管此工作区的账单。`,
            failedToClearBalanceTitle: '清除余额失败',
            failedToClearBalanceButtonText: '确定',
            failedToClearBalanceText: '我们无法清除该余额。请稍后重试。',
            successTitle: '哇哦！一切就绪。',
            successDescription: '您现在是此工作区的所有者。',
            errorTitle: '哎呀！先别着急……',
            errorDescription: `<muted-text><centered-text>转移此工作区所有权时出现问题。请重试，或<concierge-link>联系 Concierge</concierge-link>获取帮助。</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '小心！',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) => `以下报销报告已导出至 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}：

${reportName}

确定要再次导出它们吗？`,
            confirmText: '是的，再次导出',
            cancelText: '取消',
        },
        upgrade: {
            reportFields: {
                title: '报表字段',
                description: `报表字段可用于指定报表级别的详细信息，这些信息不同于适用于各条费用明细的标签。此类详细信息可以包括特定项目名称、出差信息、地点等。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>报表字段仅在 Control 方案中可用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `通过 Expensify 与 NetSuite 集成，享受自动同步并减少手动录入。借助对原生和自定义维度（包含项目和客户映射）的支持，获取深入的实时财务洞察。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>我们的 NetSuite 集成仅适用于 Control 方案，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `通过 Expensify + Sage Intacct 集成，享受自动同步并减少手动录入。借助用户自定义维度，以及按部门、类别、地点、客户和项目（作业）进行的费用编码，获取深度且实时的财务洞察。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>我们的 Sage Intacct 集成仅适用于 Control 方案，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `通过 Expensify 与 QuickBooks Desktop 的集成，享受自动同步，减少手动录入。借助实时的双向连接，以及按类别、项目、客户和项目进行费用编码，获得极致的工作效率。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>我们的 QuickBooks Desktop 集成仅适用于 Control 方案，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '高级审批',
                description: `如果你想在审批流程中增加更多层级——或者只是想确保最大金额的报销能再多一道审核——我们都能满足你的需求。高级审批功能可帮助你在每个层级设置合适的控制措施，从而让你将团队支出牢牢掌控在内。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>高级审批仅在 Control 方案中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            categories: {
                title: '类别',
                description: '类别可帮助您跟踪和管理支出。您可以使用我们的默认类别或添加自定义类别。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>类别可在 Collect 方案中使用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            glCodes: {
                title: '总账科目代码',
                description: `将 GL 代码添加到您的类别和标签中，以便轻松将费用导出到您的会计和薪资系统。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>总账代码仅在 Control 方案中可用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: '总账和薪资代码',
                description: `将总账和薪资代码添加到您的类别中，以便轻松将报销费用导出到您的会计和薪资系统。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>总账和薪资代码仅在 Control 方案中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            taxCodes: {
                title: '税码',
                description: `将税码添加到您的税务中，以便轻松将费用导出到您的会计和薪资系统。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>税码仅在 Control 方案中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            companyCards: {
                title: '无限公司卡',
                description: `需要添加更多卡片数据？解锁无限公司卡，以同步所有主要发卡机构的交易。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>此功能仅适用于 Control 方案，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            rules: {
                title: '规则',
                description: `规则在后台运行，帮助你控制支出，让你不用为这些小事操心。

在一个地方即可要求报销明细（如收据和描述）、设置限额和默认值，并自动化审批和付款流程。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>规则仅在 Control 方案中可用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            perDiem: {
                title: '每日津贴',
                description: '每日津贴是一种极佳方式，可在员工出差时让您的每日成本保持合规并可预测。您可以使用自定义费率、默认类别，以及目的地和子费率等更细化的功能。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>每日津贴仅在 Control 方案中可用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            travel: {
                title: '差旅',
                description: 'Expensify Travel 是一款全新的企业差旅预订和管理平台，允许成员预订住宿、航班、交通等更多服务。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Travel 可在 Collect 方案中使用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            reports: {
                title: '报表',
                description: '报表可让您将费用分组，以便更轻松地跟踪和管理。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>报表可在 Collect 方案中使用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            multiLevelTags: {
                title: '多级标签',
                description:
                    '多级标签可帮助你更加精确地跟踪报销。为每一条报销项目分配多个标签（例如部门、客户或成本中心），以完整记录每笔报销的全部背景信息。这样可以实现更细致的报表分析、审批流程以及会计数据导出。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>多级标签仅在 Control 方案中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            distanceRates: {
                title: '距离费率',
                description: '创建和管理您自己的费率，以英里或公里跟踪，并为差旅里程费用设置默认类别。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>里程费率可在 Collect 方案中使用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            auditor: {
                title: '审核员',
                description: '审计人员将获得所有报表的只读访问权限，以实现全面透明和合规监控。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>审核员仅在 Control 方案中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '多级审批',
                description: '多级审批是针对那些在报销前需要多人审批报销单的公司而设计的工作流程工具。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>多级审批仅适用于 Control 方案，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            pricing: {
                perActiveMember: '每位活跃成员每月。',
                perMember: '每位成员每月。',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) => `<muted-text>升级以使用此功能，或<a href="${subscriptionLink}">详细了解</a>我们的方案和定价。</muted-text>`,
            upgradeToUnlock: '解锁此功能',
            completed: {
                headline: `您已升级您的工作区！`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>您已成功将 ${policyName} 升级到 Control 方案！<a href="${subscriptionLink}">查看您的订阅</a>以了解更多详情。</centered-text>`,
                categorizeMessage: `您已成功升级到 Collect 方案。现在您可以对报销进行分类了！`,
                travelMessage: `您已成功升级为 Collect 方案。现在您可以开始预订和管理差旅了！`,
                distanceRateMessage: `您已成功升级到 Collect 方案。现在您可以更改里程费率了！`,
                gotIt: '明白了，谢谢',
                createdWorkspace: `你已创建一个工作区！`,
            },
            commonFeatures: {
                title: '升级到 Control 方案',
                note: '解锁我们最强大的功能，包括：',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Control 方案起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}，<a href="${learnMoreMethodsRoute}">了解更多</a>关于我们的方案和价格。</muted-text>`,
                    benefit1: '高级会计连接（NetSuite、Sage Intacct 等）',
                    benefit2: '智能报销规则',
                    benefit3: '多级审批工作流程',
                    benefit4: '增强的安全控制',
                    toUpgrade: '要升级，请点击',
                    selectWorkspace: '选择一个工作区，并将套餐类型更改为',
                },
                upgradeWorkspaceWarning: '无法升级工作区',
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: '您的公司已限制工作区创建。请联系管理员寻求帮助。',
            },
        },
        downgrade: {
            commonFeatures: {
                title: '降级到 Collect 方案',
                note: '如果您降级，您将失去对以下功能及更多功能的访问权：',
                benefits: {
                    note: '如需完整比较我们的套餐，请查看我们的',
                    pricingPage: '定价页面',
                    confirm: '您确定要降级并移除您的配置吗？',
                    warning: '此操作无法撤销。',
                    benefit1: '会计连接（QuickBooks Online 和 Xero 除外）',
                    benefit2: '智能报销规则',
                    benefit3: '多级审批工作流程',
                    benefit4: '增强的安全控制',
                    headsUp: '提醒一下！',
                    multiWorkspaceNote: '在首次月度付款之前，您需要先将所有工作区降级，才能以 Collect 费率开始订阅。点击',
                    selectStep: '> 选择每个工作区 > 将套餐类型更改为',
                },
            },
            completed: {
                headline: '您的工作区已被降级',
                description: '您的其他工作区目前使用的是 Control 方案。若要按 Collect 费率计费，您必须将所有工作区降级。',
                gotIt: '明白了，谢谢',
            },
        },
        payAndDowngrade: {
            title: '支付并降级',
            headline: '您的最终付款',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `此订阅的最终账单金额为 <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `查看 ${date} 的明细如下：`,
            subscription: '提醒！此操作将结束你的 Expensify 订阅、删除此工作区，并移除所有工作区成员。如果你想保留此工作区且只移除自己，请先让另一位管理员接管账单。',
            genericFailureMessage: '支付账单时发生错误。请重试。',
        },
        restrictedAction: {
            restricted: '受限',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `当前对 ${workspaceName} 工作空间的操作受到限制`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `工作区所有者 ${workspaceOwnerName} 需要添加或更新档案中的付款卡片，以解锁新的工作区活动。`,
            youWillNeedToAddOrUpdatePaymentCard: '您需要添加或更新档案中的付款卡，才能解锁新的工作区活动。',
            addPaymentCardToUnlock: '添加付款卡以解锁！',
            addPaymentCardToContinueUsingWorkspace: '添加付款卡以继续使用此工作区',
            pleaseReachOutToYourWorkspaceAdmin: '如有任何疑问，请联系您的工作区管理员。',
            chatWithYourAdmin: '与您的管理员聊天',
            chatInAdmins: '在 #admins 中聊天',
            addPaymentCard: '添加付款卡',
            goToSubscription: '前往订阅',
        },
        rules: {
            individualExpenseRules: {
                title: '报销',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>为单笔报销设置支出控制和默认值。您还可以为<a href="${categoriesPageLink}">类别</a>和<a href="${tagsPageLink}">标签</a>创建规则。</muted-text>`,
                receiptRequiredAmount: '所需收据金额',
                receiptRequiredAmountDescription: '当支出超过此金额时要求提供收据，除非被类别规则覆盖。',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `金额不能高于明细收据所需金额（${amount}）`,
                itemizedReceiptRequiredAmount: '明细收据所需金额',
                itemizedReceiptRequiredAmountDescription: '当支出超过此金额时需要明细收据，除非被类别规则覆盖。',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `金额不能低于常规收据所需金额（${amount}）`,
                maxExpenseAmount: '最大报销金额',
                maxExpenseAmountDescription: '标记超过此金额的支出，除非被类别规则覆盖。',
                maxAge: '最大年龄',
                maxExpenseAge: '费用最长期限',
                maxExpenseAgeDescription: '标记早于指定天数的支出。',
                maxExpenseAgeDays: () => ({
                    one: '1 天',
                    other: (count: number) => `${count} 天`,
                }),
                cashExpenseDefault: '现金报销默认值',
                cashExpenseDefaultDescription: '选择现金报销应如何创建。如果一笔报销不是导入的公司卡交易，则视为现金报销。这包括手动创建的报销、收据、日津贴、里程和工时报销。',
                reimbursableDefault: '可报销',
                reimbursableDefaultDescription: '费用通常是报销给员工的',
                nonReimbursableDefault: '不可报销',
                nonReimbursableDefaultDescription: '员工有时会报销费用',
                alwaysReimbursable: '始终可报销',
                alwaysReimbursableDescription: '费用始终会报销给员工',
                alwaysNonReimbursable: '始终为不予报销',
                alwaysNonReimbursableDescription: '从不向员工报销费用',
                billableDefault: '可计费默认设置',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>选择现金和信用卡报销是否应默认为可计费。可计费报销可在<a href="${tagsPageLink}">标签</a>中启用或停用。</muted-text>`,
                billable: '可计费',
                billableDescription: '费用最常会重新向客户计费',
                nonBillable: '不可计费',
                nonBillableDescription: '费用有时会重新向客户计费',
                eReceipts: '电子收据',
                eReceiptsHint: `电子收据会自动创建[用于大多数美元信用交易](${CONST.DEEP_DIVE_ERECEIPTS})。`,
                attendeeTracking: '出席者跟踪',
                attendeeTrackingHint: '跟踪每一笔报销的单人费用。',
                prohibitedDefaultDescription: '标记所有包含酒精、赌博或其他受限制项目的收据。带有这些项目行的收据所对应的报销将需要人工审核。',
                prohibitedExpenses: '禁止报销的费用',
                alcohol: '酒精',
                hotelIncidentals: '酒店杂费',
                gambling: '赌博',
                tobacco: '烟草',
                adultEntertainment: '成人娱乐',
                requireCompanyCard: '所有购买均需使用公司卡',
                requireCompanyCardDescription: '标记所有现金支出，包括里程和日津贴费用。',
            },
            expenseReportRules: {
                title: '高级',
                subtitle: '自动化处理费用报表的合规性、审批和付款。',
                preventSelfApprovalsTitle: '防止自我审批',
                preventSelfApprovalsSubtitle: '防止工作区成员批准自己的报销报告。',
                autoApproveCompliantReportsTitle: '自动批准合规报表',
                autoApproveCompliantReportsSubtitle: '配置哪些费用报表符合自动审批的条件。',
                autoApproveReportsUnderTitle: '自动批准低于此金额的报销单',
                autoApproveReportsUnderDescription: '低于此金额且完全合规的报销报告将自动获批。',
                randomReportAuditTitle: '随机报表审计',
                randomReportAuditDescription: '即使报表符合自动审批条件，也要求其中一部分必须由人工审批。',
                autoPayApprovedReportsTitle: '自动支付已批准的报表',
                autoPayApprovedReportsSubtitle: '配置哪些报销报告符合自动付款条件。',
                autoPayApprovedReportsLimitError: (currency?: string) => `请输入小于 ${currency ?? ''}20,000 的金额`,
                autoPayApprovedReportsLockedSubtitle: '前往“更多功能”并启用“工作流”，然后添加“付款”以解锁此功能。',
                autoPayReportsUnderTitle: '自动支付报表至',
                autoPayReportsUnderDescription: '金额低于此数且完全合规的报销单将自动支付。',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `添加 ${featureName} 以解锁此功能。`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) => `前往[更多功能](${moreFeaturesLink})并启用 ${featureName} 以解锁此功能。`,
            },
            categoryRules: {
                title: '类别规则',
                approver: '审批人',
                requireDescription: '要求描述',
                requireFields: '必填字段',
                requiredFieldsTitle: '必填项',
                requiredFieldsDescription: (categoryName: string) => `这将适用于所有被归类为 <strong>${categoryName}</strong> 的费用。`,
                requireAttendees: '要求与会者',
                descriptionHint: '描述提示',
                descriptionHintDescription: (categoryName: string) => `提醒员工为“${categoryName}”支出提供更多信息。此提示将显示在报销单的描述字段中。`,
                descriptionHintLabel: '提示',
                descriptionHintSubtitle: '专业提示：越短越好！',
                maxAmount: '最高金额',
                flagAmountsOver: '标记高于',
                flagAmountsOverDescription: (categoryName: string) => `适用于类别“${categoryName}”。`,
                flagAmountsOverSubtitle: '这将覆盖所有报销的最高金额。',
                expenseLimitTypes: {
                    expense: '单笔报销',
                    expenseSubtitle: '按类别标记报销金额。此规则会覆盖工作区的一般最高报销金额规则。',
                    daily: '类别总计',
                    dailySubtitle: '标记每份报销单中每日类别总支出。',
                },
                requireReceiptsOver: '要求收据超过',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} 默认`,
                    never: '从不要求收据',
                    always: '始终要求收据',
                },
                requireItemizedReceiptsOver: '要求明细收据超过',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} 默认`,
                    never: '从不要求明细收据',
                    always: '始终要求明细收据',
                },
                defaultTaxRate: '默认税率',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) => `前往[更多功能](${moreFeaturesLink})并启用工作流，然后添加审批以解锁此功能。`,
            },
            customRules: {
                title: '报销政策',
                cardSubtitle: '这里是你们团队报销政策所在的位置，让所有人都能清楚了解哪些费用包含在内。',
            },
            merchantRules: {
                title: '商家',
                subtitle: '设置商家规则，让报销费用自动按正确科目归类，减少后期清理工作。',
                addRule: '添加商家规则',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `如果商家 ${isExactMatch ? '完全匹配' : '包含'}「${merchantName}」`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `将商家重命名为 “${merchantName}”`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `将 ${fieldName} 更新为“${fieldValue}”`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `标记为“${reimbursable ? '可报销' : '不予报销'}”`,
                ruleSummarySubtitleBillable: (billable: boolean) => `标记为“${billable ? '可计费' : '不可计费'}”`,
                addRuleTitle: '添加规则',
                expensesWith: '对于以下费用：',
                applyUpdates: '应用这些更新：',
                saveRule: '保存规则',
                confirmError: '输入商家并至少应用一项更新',
                confirmErrorMerchant: '请输入商家',
                confirmErrorUpdate: '请至少进行一次更新',
                editRuleTitle: '编辑规则',
                deleteRule: '删除规则',
                deleteRuleConfirmation: '您确定要删除此规则吗？',
                previewMatches: '预览匹配结果',
                previewMatchesEmptyStateTitle: '无内容可显示',
                previewMatchesEmptyStateSubtitle: '没有未提交的报销符合此规则。',
                matchType: '匹配类型',
                matchTypeContains: '包含',
                matchTypeExact: '完全匹配',
                expensesExactlyMatching: '对于完全匹配以下条件的报销：',
                duplicateRuleTitle: '类似的商家规则已存在',
                duplicateRulePrompt: (merchantName: string) => `即使您已经有一个现有规则，是否仍要为“${merchantName}”保存新规则？`,
                saveAnyway: '仍要保存',
                applyToExistingUnsubmittedExpenses: '应用到现有的未提交报销费用',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '收款',
                    description: '适用于希望自动化其流程的团队。',
                },
                corporate: {
                    label: '控制',
                    description: '适用于具有高级需求的组织。',
                },
            },
            description: '选择适合你的方案。有关功能和价格的详细列表，请查看我们的',
            subscriptionLink: '计划类型和定价帮助页面',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `您已承诺在 Control 方案中保留 1 名活跃成员，直到您的年度订阅于 ${annualSubscriptionEndDate} 结束。您可以从 ${annualSubscriptionEndDate} 起，通过在 中关闭自动续订，改为按次付费订阅并降级为 Collect 方案`,
                other: `您已在 Control 方案中承诺为 ${count} 位活跃成员订阅服务，直到您的年度订阅在 ${annualSubscriptionEndDate} 结束。自 ${annualSubscriptionEndDate} 起，您可以通过在 中停用自动续订来切换到按使用量付费订阅并降级至 Collect 方案。`,
            }),
            subscriptions: '订阅',
        },
    },
    getAssistancePage: {
        title: '获取协助',
        subtitle: '我们在这里为你扫清通往伟大的道路！',
        description: '从以下支持选项中进行选择：',
        chatWithConcierge: '与 Concierge 聊天',
        scheduleSetupCall: '安排设置电话会议',
        scheduleACall: '安排通话',
        questionMarkButtonTooltip: '获得我们团队的协助',
        exploreHelpDocs: '查看帮助文档',
        registerForWebinar: '注册网络研讨会',
        onboardingHelp: '入门帮助',
    },
    emojiPicker: {
        skinTonePickerLabel: '更改默认肤色',
        headers: {
            frequentlyUsed: '常用',
            smileysAndEmotion: '笑脸与表情',
            peopleAndBody: '人物与身体',
            animalsAndNature: '动物和自然',
            foodAndDrink: '餐饮',
            travelAndPlaces: '旅行与地点',
            activities: '活动',
            objects: '对象',
            symbols: '符号',
            flags: '标记',
        },
    },
    newRoomPage: {
        newRoom: '新聊天室',
        groupName: '群组名称',
        roomName: '房间名称',
        visibility: '可见性',
        restrictedDescription: '您的工作区成员可以找到此房间',
        privateDescription: '被邀请到此房间的人可以找到它',
        publicDescription: '任何人都可以找到此房间',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: '任何人都可以找到此房间',
        createRoom: '创建房间',
        roomAlreadyExistsError: '已存在使用此名称的房间',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} 是所有工作区中的默认房间。请选择另一个名称。`,
        roomNameInvalidError: '房间名称只能包含小写字母、数字和连字符',
        pleaseEnterRoomName: '请输入房间名称',
        pleaseSelectWorkspace: '请选择一个工作区',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}重命名为“${newName}”（原名为“${oldName}”）` : `${actor}将此房间重命名为“${newName}”（原名为“${oldName}”）`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `房间已重命名为 ${newName}`,
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
        dynamicExternal: '动态_外部',
        smartReport: '智能报表',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `将公司地址更改为“${newAddress}”（原为“${previousAddress}”）` : `将公司地址设置为“${newAddress}”`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) => `已将 ${approverName}（${approverEmail}）添加为字段 ${field}“${name}”的审批人`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) => `已将 ${approverName}（${approverEmail}）从 ${field}“${name}”的审批人中移除`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `将${field}“${name}”的审批人更改为${formatApprover(newApproverName, newApproverEmail)}（之前为${formatApprover(oldApproverName, oldApproverEmail)}）`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `已添加类别“${categoryName}”`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `已移除类别“${categoryName}”`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? '已禁用' : '已启用'} 类别“${categoryName}”`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `已将工资代码“${newValue}”添加到类别“${categoryName}”`;
            }
            if (!newValue && oldValue) {
                return `从类别“${categoryName}”中移除了工资代码“${oldValue}”`;
            }
            return `已将“${categoryName}”类别的工资代码更改为“${newValue}”（之前为“${oldValue}”）`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `已将总账代码 "${newValue}" 添加到类别 "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `已从类别“${categoryName}”中移除总账代码“${oldValue}”`;
            }
            return `已将“${categoryName}”类别的总账代码更改为“${newValue}”（之前为“${oldValue}”）`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `已将“${categoryName}”类别描述更改为 ${!oldValue ? '必填' : '非必填'}（之前为 ${!oldValue ? '非必填' : '必填'}）`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `已为类别“${categoryName}”添加了 ${newAmount} 的最高金额限制`;
            }
            if (oldAmount && !newAmount) {
                return `从类别“${categoryName}”中移除了 ${oldAmount} 的最高金额限制`;
            }
            return `将“${categoryName}”类别的最高金额更改为 ${newAmount}（之前为 ${oldAmount}）`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `已向类别“${categoryName}”添加了限额类型 ${newValue}`;
            }
            return `将“${categoryName}”类别的限额类型更改为 ${newValue}（先前为 ${oldValue}）`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `通过将收据更改为 ${newValue}，已更新类别 "${categoryName}"`;
            }
            return `将"${categoryName}"类别更改为 ${newValue}（之前为 ${oldValue}）`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `通过将明细收据更改为${newValue}来更新类别"${categoryName}"`;
            }
            return `将"${categoryName}"类别的明细收据更改为${newValue}（之前为${oldValue}）`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `已将类别"${oldName}"重命名为"${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `从类别 “${categoryName}” 中移除了描述提示 “${oldValue}”`;
            }
            return !oldValue ? `已将描述提示“${newValue}”添加到类别“${categoryName}”` : `将“${categoryName}”类别的描述提示更改为“${newValue}”（之前为“${oldValue}”）`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `已将标签列表名称更改为“${newName}”（原为“${oldName}”）`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `已将标签“${tagName}”添加到列表“${tagListName}”`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `通过将标签“${oldName}”更改为“${newName}”，更新了标签列表“${tagListName}”`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? '已启用' : '已禁用'} 列表“${tagListName}”上的标签“${tagName}”`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `已从列表“${tagListName}”中移除标签“${tagName}”`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `已从列表“${tagListName}”中移除“${count}”个标签`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `通过将${updatedField}从“${oldValue}”更改为“${newValue}”，已更新列表“${tagListName}”中的标签“${tagName}”`;
            }
            return `通过添加一个 ${updatedField}：“${newValue}”，已更新列表“${tagListName}”中的标签“${tagName}”`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `将 ${customUnitName} 的 ${updatedField} 更改为“${newValue}”（之前为“${oldValue}”）`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `在距离费率上启用 ${newValue ? '已启用' : '已禁用'} 税务跟踪`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `添加了新的“${customUnitName}”费率“${rateName}”`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `将${customUnitName}的${updatedField}“${customUnitRateName}”的费率更改为“${newValue}”（之前为“${oldValue}”）`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `将距离费率“${customUnitRateName}”的税率更改为“${newValue} (${newTaxPercentage})”（原为“${oldValue} (${oldTaxPercentage})”）`;
            }
            return `已将税率“${newValue} (${newTaxPercentage})”添加到距离费率“${customUnitRateName}”中`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `已将里程费率“${customUnitRateName}”中的可抵扣税部分更改为“${newValue}”（之前为“${oldValue}”）`;
            }
            return `在距离费率“${customUnitRateName}”中添加了可退税部分“${newValue}”`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? '已启用' : '已禁用'} ${customUnitName} 费率“${customUnitRateName}”`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `已移除“${customUnitName}”费率“${rateName}”`,
        addedReportField: (fieldType: string, fieldName?: string) => `已添加 ${fieldType} 报告字段 “${fieldName}”`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) => `将报表字段“${fieldName}”的默认值设置为“${defaultValue}”`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `已将选项“${optionName}”添加到报表字段“${fieldName}”中`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `已从报表字段“${fieldName}”中移除选项“${optionName}”`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? '已启用' : '已禁用'} 报告字段 “${fieldName}” 的选项 “${optionName}”`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? '已启用' : '已禁用'} 报告字段“${fieldName}”的所有选项`;
            }
            return `${allEnabled ? '已启用' : '已禁用'} 报告字段“${fieldName}”的选项“${optionName}”，使所有选项都为 ${allEnabled ? '已启用' : '已禁用'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `已移除 ${fieldType} 报告字段“${fieldName}”`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `已将“Prevent self-approval”更新为“${newValue === 'true' ? '已启用' : '已禁用'}”（先前为“${oldValue === 'true' ? '已启用' : '已禁用'}”）`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `将月度报表提交日期设置为“${newValue}”`;
            }
            return `已将月度报告提交日期更新为“${newValue}”（之前为“${oldValue}”）`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `已将“向客户重新计费用的支出”更新为“${newValue}”（之前为“${oldValue}”）`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `已将“现金报销默认值”更新为“${newValue}”（之前为“${oldValue}”）`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `已开启“强制使用默认报表标题”${value ? '开' : '关'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `已将此工作区名称更新为“${newName}”（之前为“${oldName}”）`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription ? `将此工作区的描述设置为“${newDescription}”` : `已将此工作区的描述更新为“${newDescription}”（之前为“${oldDescription}”）`,
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
                one: `已将你从 ${joinedNames} 的审批流程和报销聊天中移除。你之前提交的报表仍可在你的收件箱中供审批使用。`,
                other: `已将你从${joinedNames}的审批流程和报销聊天中移除。先前提交的报表仍可在你的收件箱中进行审批。`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) => `已将你在 ${policyName} 中的角色从 ${oldRole} 更新为用户。你已从所有报销提交人的聊天中被移除，只保留你自己的聊天。`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `已将默认货币更新为 ${newCurrency}（之前为 ${oldCurrency}）`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) => `已将自动报表频率更新为“${newFrequency}”（之前为“${oldFrequency}”）`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `已将审批模式更新为“${newValue}”（之前为“${oldValue}”）`,
        upgradedWorkspace: '已将此工作区升级到 Control 方案',
        forcedCorporateUpgrade: `此工作区已升级至 Control 方案。点击<a href="${CONST.COLLECT_UPGRADE_HELP_URL}">此处</a>了解更多信息。`,
        downgradedWorkspace: '已将此工作区降级为 Collect 方案',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `将随机分配为人工审批的报销单比例更改为 ${Math.round(newAuditRate * 100)}%（之前为 ${Math.round(oldAuditRate * 100)}%）`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) => `将所有报销的人工审批额度更改为 ${newLimit}（原为 ${oldLimit}）`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? '已启用' : '已禁用'} 个类别`;
                case 'tags':
                    return `${enabled ? '已启用' : '已禁用'} 个标签`;
                case 'workflows':
                    return `${enabled ? '已启用' : '已禁用'} 个工作流`;
                case 'distance rates':
                    return `${enabled ? '已启用' : '已禁用'} 距离费率`;
                case 'accounting':
                    return `${enabled ? '已启用' : '已禁用'} 会计`;
                case 'Expensify Cards':
                    return `${enabled ? '已启用' : '已禁用'} Expensify 卡`;
                case 'company cards':
                    return `${enabled ? '已启用' : '已禁用'} 张公司卡`;
                case 'invoicing':
                    return `${enabled ? '已启用' : '已禁用'} 发票开具`;
                case 'per diem':
                    return `${enabled ? '已启用' : '已禁用'} 每日津贴`;
                case 'receipt partners':
                    return `${enabled ? '已启用' : '已禁用'} 收据合作伙伴`;
                case 'rules':
                    return `${enabled ? '已启用' : '已禁用'} 条规则`;
                case 'tax tracking':
                    return `${enabled ? '已启用' : '已禁用'} 税务跟踪`;
                default:
                    return `${enabled ? '已启用' : '已禁用'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? '已启用' : '已禁用'} 与会者跟踪`,
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `将默认审批人更改为 ${newApprover}（原为 ${previousApprover}）` : `已将默认审批人更改为 ${newApprover}`,
        changedSubmitsToApprover: ({
            members,
            approver,
            previousApprover,
            wasDefaultApprover,
        }: {
            members: string;
            approver: string;
            previousApprover?: string;
            wasDefaultApprover?: boolean;
        }) => {
            let text = `已将${members}的审批流程更改为向${approver}提交报销单`;
            if (wasDefaultApprover && previousApprover) {
                text += `(之前的默认审批人 ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '（之前的默认审批人）';
            } else if (previousApprover) {
                text += `（之前为 ${previousApprover}）`;
            }
            return text;
        },
        changedSubmitsToDefault: ({
            members,
            approver,
            previousApprover,
            wasDefaultApprover,
        }: {
            members: string;
            approver?: string;
            previousApprover?: string;
            wasDefaultApprover?: boolean;
        }) => {
            let text = approver ? `已更改 ${members} 的审批流程，使其将报销单提交给默认审批人 ${approver}` : `已将${members}的审批流程更改为将报销单提交给默认审批人`;
            if (wasDefaultApprover && previousApprover) {
                text += `(之前的默认审批人 ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '（之前的默认审批人）';
            } else if (previousApprover) {
                text += `（之前为 ${previousApprover}）`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `将${approver}的审批流程更改为把已批准的报表转发给${forwardsTo}（之前转发给${previousForwardsTo}）`
                : `将为${approver}的审批流程更改为将已批准的报告转发给${forwardsTo}（之前为最终批准的报告）`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo ? `已将 ${approver} 的审批流程更改为停止转发已批准的报销单（之前转发给 ${previousForwardsTo}）` : `已将 ${approver} 的审批流程更改为不再转发已批准的报销单`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? '已启用' : '已禁用'} 笔报销`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `已添加税费“${taxName}”`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `已移除税费“${taxName}”`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `已将税项名称从“${oldValue}”重命名为“${newValue}”`;
                }
                case 'code': {
                    return `已将“${taxName}”的税码从“${oldValue}”更改为“${newValue}”`;
                }
                case 'rate': {
                    return `将“${taxName}”的税率从“${oldValue}”更改为“${newValue}”`;
                }
                case 'enabled': {
                    return `${oldValue ? '已禁用' : '已启用'} 税费 “${taxName}”`;
                }
                default: {
                    return '';
                }
            }
        },
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `将默认企业银行账户设置为“${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}”`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `移除了默认的企业银行账户 “${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}”`,
        changedDefaultBankAccount: ({
            bankAccountName,
            maskedBankAccountNumber,
            oldBankAccountName,
            oldMaskedBankAccountNumber,
        }: {
            bankAccountName: string;
            maskedBankAccountNumber: string;
            oldBankAccountName: string;
            oldMaskedBankAccountNumber: string;
        }) =>
            `已将默认企业银行账户更改为“${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}”（之前为“${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}”）`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `将发票公司名称更改为“${newValue}”（之前为“${oldValue}”）` : `将发票公司名称设置为“${newValue}”`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `将发票公司网站更改为 “${newValue}”（之前为 “${oldValue}”）` : `将发票公司网站设置为“${newValue}”`,
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `将自定义报表名称公式更改为“${newValue}”（之前为“${oldValue}”）`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser ? `将授权付款人更改为“${newReimburser}”（原为“${previousReimburser}”）` : `已将授权付款人更改为“${newReimburser}”`,
        setReceiptRequiredAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `将报销单必填金额设置为“${newValue}”`,
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `将报销单所需金额更改为“${newValue}”（之前为“${oldValue}”）`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `已移除所需报销单金额（先前为“${oldValue}”）`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `将最高报销金额设置为“${newValue}”`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `将最高报销金额更改为 “${newValue}”（之前为 “${oldValue}”）`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `已移除最⾼报销金额（原为“${oldValue}”）`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `将最大报销天数设置为“${newValue}”天`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `将最大报销单据天数更改为 “${newValue}” 天（之前为 “${oldValue}”）`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `已移除费用最长期限（之前为“${oldValue}”天）`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? '已启用' : '已禁用'} 份已批准的自动支付报销报告`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `将自动支付已审批报表的阈值设置为 “${newLimit}”`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) => `将自动支付已批准报销单的阈值更改为 “${newLimit}”（此前为 “${oldLimit}”）`,
        removedAutoPayApprovedReportsLimit: '已移除自动支付已批准报表的阈值',
    },
    roomMembersPage: {
        memberNotFound: '未找到成员。',
        useInviteButton: '要邀请新成员加入聊天，请使用上方的邀请按钮。',
        notAuthorized: `您无权访问此页面。如果您正尝试加入此聊天室，请让聊天室成员将您加入。还有其他问题？请联系 ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `此房间似乎已被归档。如有问题，请联系 ${CONST.EMAIL.CONCIERGE}。`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `您确定要将 ${memberName} 从此房间中移除吗？`,
            other: '您确定要将选中的成员从此聊天室中移除吗？',
        }),
        error: {
            genericAdd: '添加此房间成员时出现问题',
        },
    },
    newTaskPage: {
        assignTask: '分配任务',
        assignMe: '分配给我',
        confirmTask: '确认任务',
        confirmError: '请输入标题并选择分享目标',
        descriptionOptional: '描述（可选）',
        pleaseEnterTaskName: '请输入标题',
        pleaseEnterTaskDestination: '请选择你要将此任务分享到哪里',
    },
    task: {
        task: '任务',
        title: '标题',
        description: '描述',
        assignee: '受托人',
        completed: '已完成',
        action: '完成',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `${title} 的任务`,
            completed: '标记为完成',
            canceled: '已删除的任务',
            reopened: '标记为未完成',
            error: '您无权执行所请求的操作',
        },
        markAsComplete: '标记为完成',
        markAsIncomplete: '标记为未完成',
        assigneeError: '分配此任务时发生错误。请尝试选择其他被分配人。',
        genericCreateTaskFailureMessage: '创建此任务时出错。请稍后重试。',
        deleteTask: '删除任务',
        deleteConfirmation: '确定要删除此任务吗？',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `${monthName} ${year} 对账单`,
    },
    keyboardShortcutsPage: {
        title: '键盘快捷键',
        subtitle: '使用这些方便的键盘快捷键来节省时间：',
        shortcuts: {
            openShortcutDialog: '打开键盘快捷键对话框',
            markAllMessagesAsRead: '将所有消息标为已读',
            escape: '退出对话框',
            search: '打开搜索对话框',
            newChat: '新聊天界面',
            copy: '复制评论',
            openDebug: '打开测试首选项对话框',
        },
    },
    guides: {
        screenShare: '屏幕共享',
        screenShareRequest: 'Expensify 正在邀请你进行屏幕共享',
    },
    search: {
        resultsAreLimited: '搜索结果已受限制。',
        viewResults: '查看结果',
        resetFilters: '重置筛选条件',
        searchResults: {
            emptyResults: {
                title: '无内容可显示',
                subtitle: `请尝试调整搜索条件，或使用“+”按钮创建内容。`,
            },
            emptyExpenseResults: {
                title: '你还没有创建任何报销记录',
                subtitle: '创建一笔报销，或试用 Expensify 以了解更多。',
                subtitleWithOnlyCreateButton: '使用下方的绿色按钮创建一笔报销。',
            },
            emptyReportResults: {
                title: '你尚未创建任何报表',
                subtitle: '创建报表或试用 Expensify，以了解更多信息。',
                subtitleWithOnlyCreateButton: '请使用下方的绿色按钮创建报表。',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    你还没有创建任何
                    发票
                `),
                subtitle: '发送发票，或试用 Expensify 以了解更多。',
                subtitleWithOnlyCreateButton: '使用下方的绿色按钮发送发票。',
            },
            emptyTripResults: {
                title: '暂无行程可显示',
                subtitle: '通过在下方预订您的第一趟行程来开始使用。',
                buttonText: '预订行程',
            },
            emptySubmitResults: {
                title: '没有可提交的报销',
                subtitle: '一切顺利。好好庆祝一下你的胜利吧！',
                buttonText: '创建报表',
            },
            emptyApproveResults: {
                title: '没有待批准的报销',
                subtitle: '报销为零，轻松满分。干得好！',
            },
            emptyPayResults: {
                title: '没有可支付的报销',
                subtitle: '恭喜！你已经冲过终点线。',
            },
            emptyExportResults: {
                title: '没有可导出的报销事项',
                subtitle: '该放松一下了，干得不错。',
            },
            emptyStatementsResults: {
                title: '暂无可显示的报销项目',
                subtitle: '无结果。请尝试调整筛选条件。',
            },
            emptyUnapprovedResults: {
                title: '没有待批准的报销',
                subtitle: '报销为零，轻松满分。干得好！',
            },
        },
        columns: '列',
        resetColumns: '重置列',
        groupColumns: '分组列',
        expenseColumns: '报销列',
        statements: '对账单',
        unapprovedCash: '未批准的现金',
        unapprovedCard: '未批准的卡片',
        reconciliation: '对账',
        saveSearch: '保存搜索',
        deleteSavedSearch: '删除已保存的搜索',
        deleteSavedSearchConfirm: '您确定要删除此搜索吗？',
        searchName: '搜索名称',
        savedSearchesMenuItemTitle: '已保存',
        topCategories: '热门类别',
        topMerchants: '热门商家',
        groupedExpenses: '已分组报销费用',
        bulkActions: {
            approve: '批准',
            pay: '支付',
            delete: '删除',
            hold: '暂挂',
            unhold: '移除保留',
            reject: '拒绝',
            noOptionsAvailable: '所选费用组没有可用选项。',
        },
        filtersHeader: '筛选器',
        filters: {
            date: {
                before: (date?: string) => `在 ${date ?? ''} 之前`,
                after: (date?: string) => `在 ${date ?? ''} 之后`,
                on: (date?: string) => `在 ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: '从不',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: '上个月',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: '本月',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: '本年截至目前',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: '最新对账单',
                },
            },
            status: '状态',
            keyword: '关键字',
            keywords: '关键词',
            limit: '限制',
            currency: '货币',
            completed: '已完成',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `少于 ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `大于 ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `介于 ${greaterThan} 和 ${lessThan} 之间`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `等于 ${amount ?? ''}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: '个人卡片',
                closedCards: '已关闭的卡片',
                cardFeeds: '卡片数据源',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `所有${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `所有已导入的 CSV 卡片${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} 是 ${value}`,
            current: '当前',
            past: '过去',
            submitted: '已提交',
            approved: '已批准',
            paid: '已支付',
            exported: '已导出',
            posted: '已发布',
            withdrawn: '已撤回',
            billable: '可计费',
            reimbursable: '可报销',
            purchaseCurrency: '购买货币',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: '来自',
                [CONST.SEARCH.GROUP_BY.CARD]: '卡',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '提现编号',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: '类别',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: '商户',
                [CONST.SEARCH.GROUP_BY.TAG]: '标签',
                [CONST.SEARCH.GROUP_BY.MONTH]: '月',
                [CONST.SEARCH.GROUP_BY.WEEK]: '周',
                [CONST.SEARCH.GROUP_BY.YEAR]: '年',
                [CONST.SEARCH.GROUP_BY.QUARTER]: '季度',
            },
            feed: '动态',
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
        },
        has: '有',
        groupBy: '分组依据',
        moneyRequestReport: {
            emptyStateTitle: '此报表没有任何报销。',
            accessPlaceHolder: '打开以查看详情',
        },
        noCategory: '无类别',
        noMerchant: '无商户',
        noTag: '无标签',
        expenseType: '费用类型',
        withdrawalType: '提现类型',
        recentSearches: '最近的搜索',
        recentChats: '最近的聊天',
        searchIn: '搜索 于',
        searchPlaceholder: '搜索内容',
        suggestions: '建议',
        exportSearchResults: {
            title: '创建导出',
            description: '哇，项目真不少！我们会把它们打包好，Concierge 很快就会给你发送一个文件。',
        },
        exportedTo: 'Exported to',
        exportAll: {
            selectAllMatchingItems: '选择所有匹配的项目',
            allMatchingItemsSelected: '已选择所有匹配的项目',
        },
        topSpenders: '最高支出者',
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: '来自',
            [CONST.SEARCH.GROUP_BY.CARD]: '卡片',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '导出',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: '类别',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: '商家',
            [CONST.SEARCH.GROUP_BY.TAG]: '标签',
            [CONST.SEARCH.GROUP_BY.MONTH]: '月份',
            [CONST.SEARCH.GROUP_BY.WEEK]: '周',
            [CONST.SEARCH.GROUP_BY.YEAR]: '年',
            [CONST.SEARCH.GROUP_BY.QUARTER]: '季度',
        },
    },
    genericErrorPage: {
        title: '哎呀，出错了！',
        body: {
            helpTextMobile: '请关闭并重新打开应用，或切换到',
            helpTextWeb: '网页。',
            helpTextConcierge: '如果问题仍然存在，请联系',
        },
        refresh: '刷新',
    },
    fileDownload: {
        success: {
            title: '已下载！',
            message: '附件已成功下载！',
            qrMessage: '在你的照片或下载文件夹中查找你的二维码副本。专业提示：把它添加到演示文稿中，让观众扫描二维码并直接与你联系。',
        },
        generalError: {
            title: '附件错误',
            message: '附件无法下载',
        },
        permissionError: {
            title: '存储访问',
            message: 'Expensify 在没有存储访问权限的情况下无法保存附件。点击“设置”来更新权限。',
        },
    },
    settlement: {
        status: {
            pending: '待处理',
            cleared: '已入账',
            failed: '失败',
        },
        failedError: ({link}: {link: string}) => `当你<a href="${link}">解锁你的账户</a>后，我们会重试此次结算。`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • 提现 ID：${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: '报表布局',
        groupByLabel: '分组依据：',
        selectGroupByOption: '选择如何对报表费用进行分组',
        uncategorized: '未分类',
        noTag: '无标签',
        selectGroup: ({groupName}: {groupName: string}) => `选择 ${groupName} 中的所有报销费用`,
        groupBy: {
            category: '类别',
            tag: '标签',
        },
    },
    report: {
        newReport: {
            createExpense: '创建报销',
            createReport: '创建报表',
            chooseWorkspace: '为此报表选择一个工作区。',
            emptyReportConfirmationTitle: '你已经有一份空报销单',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) => `您确定要在 ${workspaceName} 中创建另一份报表吗？您可以在 中访问您的空报表`,
            emptyReportConfirmationPromptLink: '报表',
            genericWorkspaceName: '此工作区',
            emptyReportConfirmationDontShowAgain: '不再显示此内容',
        },
        genericCreateReportFailureMessage: '创建此聊天时发生意外错误。请稍后再试。',
        genericAddCommentFailureMessage: '发表评论时发生意外错误。请稍后重试。',
        genericUpdateReportFieldFailureMessage: '更新该字段时发生意外错误。请稍后重试。',
        genericUpdateReportNameEditFailureMessage: '重命名报表时发生意外错误。请稍后重试。',
        noActivityYet: '暂无活动',
        connectionSettings: '连接设置',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `将 ${fieldName} 更改为 “${newValue}”（之前为 “${oldValue}”）`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `将 ${fieldName} 设置为 “${newValue}”`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `更改了工作区${fromPolicyName ? `（先前为 ${fromPolicyName}）` : ''}`;
                    }
                    return `将工作区更改为 ${toPolicyName}${fromPolicyName ? `（先前为 ${fromPolicyName}）` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `将类型从 ${oldType} 更改为 ${newType}`,
                exportedToCSV: `已导出为 CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `已导出到 ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `已通过 ${label} 导出`,
                    automaticActionTwo: '会计设置',
                    manual: (label: string) => `已将此报表标记为手动导出到 ${label}。`,
                    automaticActionThree: '并成功创建了记录给',
                    reimburseableLink: '自付费用',
                    nonReimbursableLink: '公司信用卡报销',
                    pending: (label: string) => `已开始将此报表导出到${label}…`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `未能将此报表导出到 ${label}（“${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}”）`,
                managerAttachReceipt: `已添加收据`,
                managerDetachReceipt: `已移除一张收据`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `在其他地方已支付 ${currency}${amount}`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `通过集成支付了 ${currency}${amount}`,
                outdatedBankAccount: `由于付款人银行账户出现问题，无法处理付款`,
                reimbursementACHBounce: `由于银行账户问题，无法处理付款`,
                reimbursementACHCancelled: `已取消付款`,
                reimbursementAccountChanged: `由于付款人更换了银行账户，无法处理该付款`,
                reimbursementDelayed: `已处理付款，但将再延迟 1–2 个工作日`,
                selectedForRandomAudit: `被随机选中进行审核`,
                selectedForRandomAuditMarkdown: `已被[随机选中](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule)进行审核`,
                share: ({to}: ShareParams) => `已邀请成员 ${to}`,
                unshare: ({to}: UnshareParams) => `已移除成员 ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `已支付 ${currency}${amount}`,
                takeControl: `取得控制权`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `与 ${label}${errorMessage ? ` ("${errorMessage}")` : ''} 同步时出现问题。请在<a href="${workspaceAccountingLink}">工作区设置</a>中解决该问题。`,
                addEmployee: (email: string, role: string) => `已将 ${email} 添加为 ${role === 'member' ? 'a' : '一个'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `已将 ${email} 的角色更新为 ${newRole}（之前为 ${currentRole}）`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `已移除 ${email} 的自定义字段 1（原为“${previousValue}”）`;
                    }
                    return !previousValue ? `已将“${newValue}”添加到 ${email} 的自定义字段 1` : `将 ${email} 的自定义字段 1 更改为“${newValue}”（之前为“${previousValue}”）`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `已移除 ${email} 的自定义字段 2（原为“${previousValue}”）`;
                    }
                    return !previousValue ? `已将 “${newValue}” 添加到 ${email} 的自定义字段 2` : `将 ${email} 的自定义字段 2 更改为“${newValue}”（之前为“${previousValue}”）`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} 离开了工作区`,
                removeMember: (email: string, role: string) => `已移除 ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `已移除与 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} 的连接`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `已连接到 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: '已离开聊天',
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `${feedName} 连接已中断。要恢复卡片导入，请<a href='${workspaceCompanyCardRoute}'>登录到您的银行</a>`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `您的企业银行账户的 Plaid 连接已中断。请<a href='${walletRoute}'>重新连接您的银行账户 ${maskedAccountNumber}</a>，以便继续使用您的 Expensify 卡。`,
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `企业银行账户 ${maskedBankAccountNumber} 由于报销或 Expensify Card 结算问题已被自动锁定。请前往<a href="${linkURL}">工作区设置</a>中解决该问题。`,
            },
            error: {
                invalidCredentials: '凭证无效，请检查您的连接配置。',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary}，${dayCount} ${dayCount === 1 ? '天' : '天'}，截至 ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} 来自 ${timePeriod}，日期为 ${date}`,
    },
    footer: {
        features: '功能',
        expenseManagement: '费用管理',
        spendManagement: '支出管理',
        expenseReports: '费用报表',
        companyCreditCard: '公司信用卡',
        receiptScanningApp: '收据扫描应用',
        billPay: '账单支付',
        invoicing: '开具发票',
        CPACard: 'CPA 卡',
        payroll: '薪资',
        travel: '差旅',
        resources: '资源',
        expensifyApproved: 'Expensify 已通过审批！',
        pressKit: '媒体资料包',
        support: '支持',
        expensifyHelp: 'Expensify 帮助',
        terms: '服务条款',
        privacy: '隐私',
        learnMore: '了解更多',
        aboutExpensify: '关于 Expensify',
        blog: '博客',
        jobs: '工作',
        expensifyOrg: 'Expensify.org',
        investorRelations: '投资者关系',
        getStarted: '开始使用',
        createAccount: '创建新账户',
        logIn: '登录',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: '返回聊天列表',
        chatWelcomeMessage: '聊天欢迎消息',
        navigatesToChat: '导航到聊天',
        newMessageLineIndicator: '新消息行指示器',
        chatMessage: '聊天消息',
        lastChatMessagePreview: '上条聊天消息预览',
        workspaceName: '工作区名称',
        chatUserDisplayNames: '聊天成员显示名称',
        scrollToNewestMessages: '滚动到最新消息',
        preStyledText: '预设样式文本',
        viewAttachment: '查看附件',
    },
    parentReportAction: {
        deletedReport: '已删除的报表',
        deletedMessage: '已删除的消息',
        deletedExpense: '已删除的报销',
        reversedTransaction: '已冲销的交易',
        deletedTask: '已删除的任务',
        hiddenMessage: '隐藏的信息',
    },
    threads: {
        thread: '会话',
        replies: '回复',
        reply: '回复',
        from: '从',
        in: '在',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `来自 ${reportName}${workspaceName ? `在 ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: '复制 URL',
        copied: '已复制！',
    },
    moderation: {
        flagDescription: '所有被标记的消息都会发送给版主进行审核。',
        chooseAReason: '请选择下方标记的原因：',
        spam: '垃圾邮件',
        spamDescription: '未经请求的无关推广',
        inconsiderate: '不体贴',
        inconsiderateDescription: '带有侮辱性或不尊重的措辞，意图存疑',
        intimidation: '恐吓',
        intimidationDescription: '在有正当反对意见的情况下，仍咄咄逼人地推进某项议程',
        bullying: '欺凌',
        bullyingDescription: '以个人为目标以获得其服从',
        harassment: '骚扰',
        harassmentDescription: '种族主义、厌女症或其他广泛歧视性的行为',
        assault: '袭击',
        assaultDescription: '以造成伤害为目的的有针对性的情感攻击',
        flaggedContent: '此消息已被标记为违反我们的社区规则，内容已被隐藏。',
        hideMessage: '隐藏消息',
        revealMessage: '显示消息',
        levelOneResult: '发送匿名警告，并将消息报告以供审核。',
        levelTwoResult: '消息已从频道中隐藏，并附带匿名警告且该消息已被举报以供审核。',
        levelThreeResult: '消息已从频道中移除并附带匿名警告，且该消息已被报告以供审核。',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: '邀请提交报销单',
        inviteToChat: '仅邀请加入聊天',
        nothing: '什么都不做',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '接受',
        decline: '拒绝',
    },
    actionableMentionTrackExpense: {
        submit: '提交给某人',
        categorize: '对其进行分类',
        share: '与我的会计共享',
        nothing: '目前没有内容',
    },
    teachersUnitePage: {
        teachersUnite: '教师联合',
        joinExpensifyOrg: '加入 Expensify.org，一起消除全球的不公不义。当前的 “Teachers Unite” 活动通过分担必需教学用品的费用，支持世界各地的教育工作者。',
        iKnowATeacher: '我认识一位老师',
        iAmATeacher: '我是一名教师',
        getInTouch: '太好了！请分享他们的联系方式，以便我们与他们取得联系。',
        introSchoolPrincipal: '给你们学校校长的介绍',
        schoolPrincipalVerifyExpense: 'Expensify.org 会分担基本学习用品的费用，让来自低收入家庭的学生拥有更好的学习体验。你的校长将被要求核实你的报销。',
        principalFirstName: '主要负责人名',
        principalLastName: '校长姓氏',
        principalWorkEmail: '主要工作邮箱',
        updateYourEmail: '更新你的邮箱地址',
        updateEmail: '更新邮箱地址',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `在继续之前，请确保将你的学校邮箱设置为默认联系方式。你可以前往“设置” > “个人资料” > <a href="${contactMethodsRoute}">联系方式</a>进行设置。`,
        error: {
            enterPhoneEmail: '请输入有效的电子邮箱地址或电话号码',
            enterEmail: '输入邮箱',
            enterValidEmail: '请输入有效的邮箱',
            tryDifferentEmail: '请尝试使用其他电子邮箱',
        },
    },
    cardTransactions: {
        notActivated: '未激活',
        outOfPocket: '自掏腰包支出',
        companySpend: '公司支出',
    },
    distance: {
        addStop: '添加站点',
        deleteWaypoint: '删除航路点',
        deleteWaypointConfirmation: '您确定要删除此途经点吗？',
        address: '地址',
        waypointDescription: {
            start: '开始',
            stop: '停止',
        },
        mapPending: {
            title: '映射待处理',
            subtitle: '当你重新联网时将生成地图',
            onlineSubtitle: '正在为您设置地图，请稍候',
            errorTitle: '地图错误',
            errorSubtitle: '加载地图时出错。请重试。',
        },
        error: {
            selectSuggestedAddress: '请选择一个建议地址或使用当前位置',
        },
        odometer: {startReading: '开始阅读', endReading: '结束阅读', saveForLater: '稍后保存', totalDistance: '总距离'},
    },
    reportCardLostOrDamaged: {
        screenTitle: '成绩单遗失或损坏',
        nextButtonLabel: '下一步',
        reasonTitle: '你为什么需要一张新卡？',
        cardDamaged: '我的卡片损坏了',
        cardLostOrStolen: '我的卡丢失或被盗',
        confirmAddressTitle: '请确认您新卡的邮寄地址。',
        cardDamagedInfo: '您的新卡将在 2–3 个工作日内送达。在您激活新卡之前，当前的卡片将继续可用。',
        cardLostOrStolenInfo: '一旦您下单，您当前的卡片将被永久停用。大多数卡片会在几个工作日内送达。',
        address: '地址',
        deactivateCardButton: '停用卡片',
        shipNewCardButton: '寄送新卡',
        addressError: '地址为必填项',
        reasonError: '原因为必填项',
        successTitle: '您的新卡正在寄送途中！',
        successDescription: '在您的卡片于几个工作日后寄达后，您需要先激活它。在此期间，您可以使用虚拟卡。',
    },
    eReceipt: {
        guaranteed: '保证电子收据',
        transactionDate: '交易日期',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: '开始聊天，<success><strong>推荐好友</strong></success>。',
            header: '开始聊天，推荐好友',
            body: '也想让你的朋友一起使用 Expensify 吗？只要和他们开始聊天，剩下的就交给我们。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '提交一笔报销，<success><strong>推荐你的团队</strong></success>。',
            header: '提交报销，推荐你的团队',
            body: '也想让你的团队使用 Expensify 吗？只需向他们提交一笔报销，我们会处理剩下的一切。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '推荐好友',
            body: '也想让你的朋友使用 Expensify 吗？只要和他们聊天、转账或分摊一笔费用，其余的交给我们。或者直接分享你的邀请链接！',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '推荐好友',
            header: '推荐好友',
            body: '也想让你的朋友使用 Expensify 吗？只要和他们聊天、转账或分摊一笔费用，其余的交给我们。或者直接分享你的邀请链接！',
        },
        copyReferralLink: '复制邀请链接',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) => `在 <a href="${href}">${adminReportName}</a> 中与您的设置专员聊天以获得帮助`,
        default: `如需设置帮助，请发送消息给 <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link>`,
    },
    violations: {
        allTagLevelsRequired: '所有标签为必填项',
        autoReportedRejectedExpense: '该报销已被拒绝。',
        billableExpense: '可计费项不再有效',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `需要收据${formattedLimit ? `超过 ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: '类别不再有效',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `已应用 ${surcharge}% 的转换附加费`,
        customUnitOutOfPolicy: '此工作区的费率无效',
        duplicatedTransaction: '可能重复',
        fieldRequired: '报表字段为必填项',
        futureDate: '不允许未来日期',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `加价 ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `日期早于 ${maxAge} 天`,
        missingCategory: '缺少类别',
        missingComment: '所选类别需要填写描述',
        missingAttendees: '此类别需要多个参与者',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `缺少 ${tagName ?? '标签'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '金额与计算出的距离不符';
                case 'card':
                    return '金额大于卡片交易金额';
                default:
                    if (displayPercentVariance) {
                        return `金额比扫描的收据高出 ${displayPercentVariance}%`;
                    }
                    return '金额大于已扫描收据';
            }
        },
        modifiedDate: '日期与扫描的收据不一致',
        nonExpensiworksExpense: '非 Expensiworks 报销',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `报销超出自动审批限额 ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `金额超出每人类别限额 ${formattedLimit}`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `超过每人限额 ${formattedLimit} 的金额`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `金额超过每次行程限额 ${formattedLimit}`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `超过每人限额 ${formattedLimit} 的金额`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `金额超出每日 ${formattedLimit}/人类别限额`,
        receiptNotSmartScanned: '收据和报销明细已手动添加。',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `收据是超过 ${formattedLimit} 类别限额所必需的`;
            }
            if (formattedLimit) {
                return `需要收据，金额超过 ${formattedLimit}`;
            }
            if (category) {
                return `收据为该类别超额消费所必需`;
            }
            return '需要收据';
        },
        itemizedReceiptRequired: ({formattedLimit}: {formattedLimit?: string}) => `需要明细收据${formattedLimit ? `超过 ${formattedLimit}` : ''}`,
        prohibitedExpense: ({prohibitedExpenseTypes}: ViolationsProhibitedExpenseParams) => {
            const preMessage = '禁止报销的费用：';
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
                return '由于银行连接中断，无法自动匹配收据';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin ? `银行连接已断开。<a href="${companyCardPageURL}">重新连接以匹配收据</a>` : '银行连接已中断。请联系管理员重新连接以匹配收据。';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `请让 ${member} 标记为现金，或等待 7 天后再试` : '正在等待与卡片交易合并。';
            }
            return '';
        },
        brokenConnection530Error: '由于银行连接中断，收据正在等待处理中',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>由于银行连接中断，收据正在等待处理。请前往<a href="${workspaceCompanyCardRoute}">公司卡</a>中解决。</muted-text-label>`,
        memberBrokenConnectionError: '由于银行连接中断，收据处于待处理状态。请联系工作区管理员解决。',
        markAsCashToIgnore: '标记为现金以忽略并请求付款。',
        smartscanFailed: ({canEdit = true}) => `收据扫描失败。${canEdit ? '手动输入详细信息。' : ''}`,
        receiptGeneratedWithAI: '潜在的 AI 生成收据',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `缺少 ${tagName ?? '标签'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? '标签'} 不再有效`,
        taxAmountChanged: '税额已被修改',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? '税'} 不再有效`,
        taxRateChanged: '税率已被修改',
        taxRequired: '缺少税率',
        none: '无',
        taxCodeToKeep: '选择要保留的税码',
        tagToKeep: '选择要保留的标签',
        isTransactionReimbursable: '选择此交易是否可报销',
        merchantToKeep: '选择要保留的商家',
        descriptionToKeep: '选择要保留的描述',
        categoryToKeep: '选择要保留的类别',
        isTransactionBillable: '选择此交易是否可计费',
        keepThisOne: '保留这个',
        confirmDetails: `确认你要保留的详细信息`,
        confirmDuplicatesInfo: `您不保留的重复项将由提交者自行删除。`,
        hold: '此报销已被搁置',
        resolvedDuplicates: '已解决重复项',
        companyCardRequired: '需要公司卡消费',
        noRoute: '请选择一个有效的地址',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName}为必填项`,
        reportContainsExpensesWithViolations: '报表包含有违规的报销费用。',
    },
    violationDismissal: {
        rter: {
            manual: '已将此收据标记为现金',
        },
        duplicatedTransaction: {
            manual: '已解决重复项',
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
        normal: '普通',
    },
    exitSurvey: {
        header: '在您离开之前',
        reasonPage: {
            title: '请告诉我们您离开的原因',
            subtitle: '在你离开之前，请告诉我们你为什么想切换到 Expensify Classic。',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: '我需要一个只有在 Expensify Classic 中才提供的功能。',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '我不明白如何使用 New Expensify。',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '我明白如何使用 New Expensify，但我更喜欢 Expensify Classic。',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: '你在新版 Expensify 中需要但尚未提供的功能是什么？',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '你想要做什么？',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '你为什么更喜欢使用 Expensify Classic？',
        },
        responsePlaceholder: '您的回复',
        thankYou: '感谢您的反馈！',
        thankYouSubtitle: '您的反馈将帮助我们打造一款更高效完成任务的产品。非常感谢！',
        goToExpensifyClassic: '切换到 Expensify 经典版',
        offlineTitle: '看起来你被卡在这里了…',
        offline: '您似乎已离线。很遗憾，Expensify Classic 无法离线使用，但 New Expensify 支持离线使用。如果您更倾向于使用 Expensify Classic，请在连接到互联网后重试。',
        quickTip: '小提示…',
        quickTipSubTitle: '您可以通过访问 expensify.com 直接进入 Expensify Classic。将其加入书签以便快速访问！',
        bookACall: '预约通话',
        bookACallTitle: '您想与产品经理交谈吗？',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '在费用和报表上直接聊天',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: '能够在手机上完成所有操作',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: '以聊天般的速度处理差旅和报销',
        },
        bookACallTextTop: '如果切换到 Expensify 经典版，您将会错过：',
        bookACallTextBottom: '我们非常期待与您通话，以了解其中原因。您可以预约与我们的一位高级产品经理通话，讨论您的需求。',
        takeMeToExpensifyClassic: '带我前往 Expensify Classic',
    },
    listBoundary: {
        errorMessage: '加载更多消息时出错',
        tryAgain: '重试',
    },
    systemMessage: {
        mergedWithCashTransaction: '已将一张收据匹配到此交易',
    },
    subscription: {
        authenticatePaymentCard: '验证支付卡',
        mobileReducedFunctionalityMessage: '您无法在移动应用中更改订阅。',
        badge: {
            freeTrial: (numOfDays: number) => `免费试用：剩余 ${numOfDays} ${numOfDays === 1 ? '天' : '天'}`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: '您的付款信息已过期',
                subtitle: (date: string) => `请在 ${date} 前更新您的支付卡，以继续使用您最喜爱的所有功能。`,
            },
            policyOwnerAmountOwedOverdue: {
                title: '无法处理您的付款',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed ? `您在${date}的${purchaseAmountOwed}消费无法处理。请添加一张支付卡以结清所欠金额。` : '请添加一张支付卡以清除所欠金额。',
            },
            policyOwnerUnderInvoicing: {
                title: '您的付款信息已过期',
                subtitle: (date: string) => `您的付款已逾期。请在 ${date} 前支付您的发票，以避免服务中断。`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: '您的付款信息已过期',
                subtitle: '您的付款已逾期。请支付您的发票。',
            },
            billingDisputePending: {
                title: '无法扣款您的银行卡',
                subtitle: (amountOwed: number, cardEnding: string) => `您对以 ${cardEnding} 结尾的银行卡上的 ${amountOwed} 费用提出了争议。在与您的银行解决该争议之前，您的账户将被锁定。`,
            },
            cardAuthenticationRequired: {
                title: '您的付款卡尚未完成身份验证。',
                subtitle: (cardEnding: string) => `请完成身份验证流程，以激活您尾号为 ${cardEnding} 的支付卡。`,
            },
            insufficientFunds: {
                title: '无法扣款您的银行卡',
                subtitle: (amountOwed: number) => `由于资金不足，您的付款卡被拒。请重试或添加新的付款卡以清清您尚未结清的 ${amountOwed} 余额。`,
            },
            cardExpired: {
                title: '无法扣款您的银行卡',
                subtitle: (amountOwed: number) => `您的付款卡已过期。请添加一张新的付款卡以清除您未结清的${amountOwed}余额。`,
            },
            cardExpireSoon: {
                title: '您的银行卡即将到期',
                subtitle: '您的支付卡将于本月底到期。请点击下方的三点菜单进行更新，以便继续使用您喜爱的全部功能。',
            },
            retryBillingSuccess: {
                title: '成功！',
                subtitle: '您的卡已成功扣款。',
            },
            retryBillingError: {
                title: '无法扣款您的银行卡',
                subtitle: '在重试之前，请直接致电您的银行，授权对 Expensify 的扣款并解除任何冻结。否则，请尝试添加一张不同的支付卡。',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) => `您对以 ${cardEnding} 结尾的银行卡上的 ${amountOwed} 费用提出了争议。在与您的银行解决该争议之前，您的账户将被锁定。`,
            preTrial: {
                title: '开始免费试用',
                subtitle: '下一步，请<a href="#">完成您的设置清单</a>，这样您的团队就可以开始报销。',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `试用：剩余 ${numOfDays} ${numOfDays === 1 ? '天' : '天'}！`,
                subtitle: '添加付款卡以继续使用您所有喜爱的功能。',
            },
            trialEnded: {
                title: '您的免费试用已结束',
                subtitle: '添加付款卡以继续使用您所有喜爱的功能。',
            },
            earlyDiscount: {
                claimOffer: '领取优惠',
                subscriptionPageTitle: (discountType: number) => `<strong>首年优惠 ${discountType}%！</strong> 只需添加一张支付卡并开始年度订阅。`,
                onboardingChatTitle: (discountType: number) => `限时优惠：首年立减 ${discountType}%！`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `在 ${days > 0 ? `${days}天 :` : ''}${hours} 小时 ${minutes} 分钟 ${seconds} 秒内申请`,
            },
        },
        cardSection: {
            title: '付款',
            subtitle: '添加一张银行卡来支付你的 Expensify 订阅费用。',
            addCardButton: '添加付款卡',
            cardInfo: (name: string, expiration: string, currency: string) => `名称：${name}，到期日：${expiration}，货币：${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `您的下一个付款日期是 ${nextPaymentDate}。`,
            cardEnding: (cardNumber: string) => `以 ${cardNumber} 结尾的卡片`,
            changeCard: '更改付款卡',
            changeCurrency: '更改付款货币',
            cardNotFound: '未添加付款卡',
            retryPaymentButton: '重试付款',
            authenticatePayment: '验证付款',
            requestRefund: '请求退款',
            requestRefundModal: {
                full: '要获得退款很简单，只需在下一个结算日期前降级您的账户，您就会收到退款。<br /> <br /> 提醒：降级您的账户会导致您的工作区被删除。此操作无法撤销，但如果您改变主意，随时可以创建新的工作区。',
                confirm: '删除工作区并降级',
            },
            viewPaymentHistory: '查看付款历史',
        },
        yourPlan: {
            title: '您的方案',
            exploreAllPlans: '查看所有套餐',
            customPricing: '自定义定价',
            asLowAs: ({price}: YourPlanPriceValueParams) => `每位活跃成员每月最低仅需 ${price}`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `每位成员每月 ${price}`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `每位成员每月 ${price}`,
            perMemberMonth: '每位成员/月',
            collect: {
                title: '收款',
                description: '为小型企业提供报销、差旅和聊天功能的套餐。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `从每位持有 Expensify Card 的活跃成员 ${lower}，到每位未持有 Expensify Card 的活跃成员 ${upper}。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `从每位持有 Expensify Card 的活跃成员 ${lower}，到每位未持有 Expensify Card 的活跃成员 ${upper}。`,
                benefit1: '收据扫描',
                benefit2: '报销',
                benefit3: '公司信用卡管理',
                benefit4: '费用和差旅审批',
                benefit5: '差旅预订和规则',
                benefit6: 'QuickBooks/Xero 集成',
                benefit7: '在费用、报表和聊天室中进行聊天',
                benefit8: 'AI 和人工支持',
            },
            control: {
                title: '控制',
                description: '适用于大型企业的报销、差旅和聊天服务。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `从每位持有 Expensify Card 的活跃成员 ${lower}，到每位未持有 Expensify Card 的活跃成员 ${upper}。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `从每位持有 Expensify Card 的活跃成员 ${lower}，到每位未持有 Expensify Card 的活跃成员 ${upper}。`,
                benefit1: 'Collect 方案中的所有内容',
                benefit2: '多级审批工作流程',
                benefit3: '自定义报销规则',
                benefit4: 'ERP 集成（NetSuite、Sage Intacct、Oracle）',
                benefit5: '人力资源集成（Workday、Certinia）',
                benefit6: 'SAML/SSO',
                benefit7: '自定义洞察和报表',
                benefit8: '预算管理',
            },
            thisIsYourCurrentPlan: '这是您当前的方案',
            downgrade: '降级为 Collect',
            upgrade: '升级到 Control',
            addMembers: '添加成员',
            saveWithExpensifyTitle: '使用 Expensify Card 节省开支',
            saveWithExpensifyDescription: '使用我们的节省计算器，了解 Expensify Card 的返现如何降低你的 Expensify 账单。',
            saveWithExpensifyButton: '了解更多',
        },
        compareModal: {
            comparePlans: '比较套餐',
            subtitle: `<muted-text>选择适合您的方案，解锁所需功能。<a href="${CONST.PRICING}">查看我们的定价页面</a>，了解各个方案的完整功能明细。</muted-text>`,
        },
        details: {
            title: '订阅详情',
            annual: '年度订阅',
            taxExempt: '请求免税状态',
            taxExemptEnabled: '免税',
            taxExemptStatus: '免税状态',
            payPerUse: '按次付费',
            subscriptionSize: '订阅规模',
            headsUp:
                '提醒：如果你现在不设置订阅人数，我们将会自动将其设为您首月的活跃成员数量。之后的 12 个月内，您至少需要为这一人数的成员付费。您可以随时增加订阅人数，但在订阅期结束前无法减少。',
            zeroCommitment: '零承诺，享受优惠的年度订阅价格',
        },
        subscriptionSize: {
            title: '订阅规模',
            yourSize: '您的订阅规模是指在特定月份内，可由任意活跃成员占用的空余席位数量。',
            eachMonth: '每个月，您的订阅可涵盖上方所设定数量上限内的活跃成员。每当您增加订阅人数上限时，系统都会按新的人数上限为您开启一份新的 12 个月订阅。',
            note: '注意：活跃成员是指在您公司的工作区中创建、编辑、提交、审批、报销或导出过报销数据的任何人。',
            confirmDetails: '确认您的新年度订阅详情：',
            subscriptionSize: '订阅规模',
            activeMembers: ({size}: SubscriptionSizeParams) => `每月 ${size} 名活跃成员`,
            subscriptionRenews: '订阅续订',
            youCantDowngrade: '您无法在年度订阅期间降级。',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `您已经承诺在 ${date} 之前每月订阅年度套餐，订阅规模为 ${size} 名活跃成员。您可以在 ${date} 通过禁用自动续费来切换为按使用量付费的订阅。`,
            error: {
                size: '请输入有效的订阅数量',
                sameSize: '请输入一个与您当前订阅规模不同的数字',
            },
        },
        paymentCard: {
            addPaymentCard: '添加付款卡',
            enterPaymentCardDetails: '输入您的支付卡详细信息',
            security: 'Expensify 符合 PCI-DSS 标准，使用银行级加密，并采用冗余基础设施来保护您的数据。',
            learnMoreAboutSecurity: '详细了解我们的安全性。',
        },
        subscriptionSettings: {
            title: '订阅设置',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `订阅类型：${subscriptionType}，订阅规模：${subscriptionSize}，自动续订：${autoRenew}，年度席位自动增加：${autoIncrease}`,
            none: '无',
            on: '开',
            off: '关',
            annual: '年度',
            autoRenew: '自动续订',
            autoIncrease: '自动增加年度席位',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `每位活跃成员每月最多可节省 ${amountWithCurrency}`,
            automaticallyIncrease: '自动增加您的年度席位数，以容纳超过当前订阅人数上限的活跃成员。注意：这将延长您的年度订阅结束日期。',
            disableAutoRenew: '禁用自动续订',
            helpUsImprove: '帮助我们改进 Expensify',
            whatsMainReason: '你取消自动续费的主要原因是什么？',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `将在 ${date} 续订。`,
            pricingConfiguration: '价格取决于配置。要获得最低价格，请选择年度订阅并申请 Expensify Card。',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>在我们的<a href="${CONST.PRICING}">定价页面</a>了解更多，或在您的 ${hasAdminsRoom ? `<a href="adminsRoom">#admins 聊天室。</a>` : '#admins 房间。'} 中与我们的团队聊天</muted-text>`,
            estimatedPrice: '预估价格',
            changesBasedOn: '这将根据你使用 Expensify Card 的情况以及下面的订阅选项而变化。',
        },
        requestEarlyCancellation: {
            title: '请求提前取消',
            subtitle: '您申请提前取消的主要原因是什么？',
            subscriptionCanceled: {
                title: '订阅已取消',
                subtitle: '您的年度订阅已被取消。',
                info: '如果你想继续以按次付费的方式使用你的工作区，你已经全部搞定了。',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `如果您想防止今后的活动和收费，您必须<a href="${workspacesListRoute}">删除您的工作区</a>。请注意，当您删除工作区时，您将被收取在当前日历月内产生的所有未结活动费用。`,
            },
            requestSubmitted: {
                title: '请求已提交',
                subtitle: '感谢你告知我们你有意取消订阅。我们正在审核你的请求，并会很快通过你与<concierge-link>Concierge</concierge-link>的聊天与你联系。',
            },
            acknowledgement: `通过申请提前终止，我确认并同意，根据 Expensify 的<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>服务条款</a>或我与 Expensify 之间其他适用的服务协议，Expensify 没有义务批准此类请求，并且 Expensify 保留就是否批准任何此类请求的完全酌情权。`,
        },
    },
    feedbackSurvey: {
        tooLimited: '功能需要改进',
        tooExpensive: '太贵',
        inadequateSupport: '客户支持不足',
        businessClosing: '公司关闭、裁员或被收购',
        additionalInfoTitle: '你要改用什么软件？为什么？',
        additionalInfoInputLabel: '您的回复',
    },
    roomChangeLog: {
        updateRoomDescription: '将房间描述设置为：',
        clearRoomDescription: '清空了房间描述',
        changedRoomAvatar: '更改了聊天室头像',
        removedRoomAvatar: '已移除房间头像',
    },
    delegate: {
        switchAccount: '切换账户：',
        copilotDelegatedAccess: 'Copilot：委托访问',
        copilotDelegatedAccessDescription: '允许其他成员访问你的账户。',
        addCopilot: '添加副驾驶',
        membersCanAccessYourAccount: '这些成员可以访问你的账户：',
        youCanAccessTheseAccounts: '您可以通过账户切换器访问这些账户：',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '完整';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '受限';
                default:
                    return '';
            }
        },
        genericError: '糟糕，出了点问题。请重试。',
        onBehalfOfMessage: (delegator: string) => `代表 ${delegator}`,
        accessLevel: '访问级别',
        confirmCopilot: '在下方确认你的副驾驶。',
        accessLevelDescription: '请选择下面的访问级别。完整访问和受限访问都允许副驾驶查看所有会话和报销。',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '允许其他成员代表你在你的账户中执行所有操作。包括聊天、提交、审批、付款、设置更新等。';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '允许其他成员代表你在你的账户中执行大部分操作。不包括审批、付款、拒绝和保留。';
                default:
                    return '';
            }
        },
        removeCopilot: '移除 Copilot',
        removeCopilotConfirmation: '您确定要移除这个副驾驶吗？',
        changeAccessLevel: '更改访问级别',
        makeSureItIsYou: '让我们确认是你',
        enterMagicCode: (contactMethod: string) => `请输入发送到 ${contactMethod} 的魔法验证码以添加副驾驶。验证码应会在一两分钟内送达。`,
        enterMagicCodeUpdate: (contactMethod: string) => `请输入发送到 ${contactMethod} 的验证码以更新您的 Copilot。`,
        notAllowed: '没那么快……',
        noAccessMessage: dedent(`
            作为协助者，你无权访问此页面。抱歉！
        `),
        notAllowedMessage: (accountOwnerEmail: string) => `作为${accountOwnerEmail}的<a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">副驾</a>，你没有权限执行此操作。抱歉！`,
        copilotAccess: 'Copilot 访问权限',
    },
    debug: {
        debug: '调试',
        details: '详情',
        JSON: 'JSON',
        reportActions: '操作',
        reportActionPreview: '预览',
        nothingToPreview: '没有可预览的内容',
        editJson: '编辑 JSON：',
        preview: '预览：',
        missingProperty: ({propertyName}: MissingPropertyParams) => `缺少 ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `无效属性：${propertyName} - 预期：${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `无效值 - 预期：${expectedValues}`,
        missingValue: '缺少值',
        createReportAction: '创建报表操作',
        reportAction: '报表操作',
        report: '报告',
        transaction: '交易',
        violations: '违规',
        transactionViolation: '交易违规',
        hint: '数据更改不会发送到后端',
        textFields: '文本字段',
        numberFields: '数字字段',
        booleanFields: '布尔字段',
        constantFields: '常量字段',
        dateTimeFields: '日期时间字段',
        date: '日期',
        time: '时间',
        none: '无',
        visibleInLHN: '在左侧边栏中可见',
        GBR: '英国',
        RBR: 'RBR',
        true: '真',
        false: '假',
        viewReport: '查看报表',
        viewTransaction: '查看交易',
        createTransactionViolation: '创建交易违规',
        reasonVisibleInLHN: {
            hasDraftComment: '有草稿评论',
            hasGBR: '具有 GBR',
            hasRBR: '有 RBR',
            pinnedByUser: '由成员置顶',
            hasIOUViolations: '有借款违规',
            hasAddWorkspaceRoomErrors: '有添加工作区聊天室错误',
            isUnread: '是否未读（专注模式）',
            isArchived: '已归档（最新模式）',
            isSelfDM: '是否为自己的私信',
            isFocused: '暂时专注中',
        },
        reasonGBR: {
            hasJoinRequest: '有加入请求（管理员房间）',
            isUnreadWithMention: '有未读并被提及',
            isWaitingForAssigneeToCompleteAction: '正在等待受让人完成操作',
            hasChildReportAwaitingAction: '有子报表等待处理',
            hasMissingInvoiceBankAccount: '缺少发票银行账户',
            hasUnresolvedCardFraudAlert: '有未解决的银行卡欺诈警报',
            hasDEWApproveFailed: 'DEW审批失败',
        },
        reasonRBR: {
            hasErrors: '报表或报表操作数据中存在错误',
            hasViolations: '有违规',
            hasTransactionThreadViolations: '有交易线程违规',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: '有一份报表正在等待处理',
            theresAReportWithErrors: '有一份报表存在错误',
            theresAWorkspaceWithCustomUnitsErrors: '有一个工作区存在自定义单位错误',
            theresAProblemWithAWorkspaceMember: '工作区成员出现问题',
            theresAProblemWithAWorkspaceQBOExport: '工作区连接的导出设置出现问题。',
            theresAProblemWithAContactMethod: '联系方法存在问题',
            aContactMethodRequiresVerification: '联系方法需要验证',
            theresAProblemWithAPaymentMethod: '支付方式存在问题',
            theresAProblemWithAWorkspace: '工作区存在问题',
            theresAProblemWithYourReimbursementAccount: '您的报销账户存在问题',
            theresABillingProblemWithYourSubscription: '您的订阅存在账单问题',
            yourSubscriptionHasBeenSuccessfullyRenewed: '您的订阅已成功续订',
            theresWasAProblemDuringAWorkspaceConnectionSync: '在工作区连接同步过程中出现问题',
            theresAProblemWithYourWallet: '你的钱包出现问题',
            theresAProblemWithYourWalletTerms: '您的钱包条款存在问题',
        },
    },
    emptySearchView: {
        takeATestDrive: '试用体验',
    },
    migratedUserWelcomeModal: {
        title: '欢迎使用 New Expensify！',
        subtitle: '它保留了我们经典体验中你喜爱的一切，并加入了一大堆升级，让你的生活变得更加轻松：',
        confirmText: '开始吧！',
        helpText: '试用 2 分钟演示',
        features: {
            search: '更强大的移动端、网页端和桌面端搜索',
            concierge: '内置 Concierge AI，助您自动化管理报销',
            chat: '在任何报销上发起聊天，快速解决疑问',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>从<strong>这里</strong>开始！</tooltip>',
        saveSearchTooltip: '<tooltip><strong>在这里重命名已保存的搜索</strong>！</tooltip>',
        accountSwitcher: '<tooltip>在此访问你的<strong>Copilot 账户</strong></tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>扫描我们的测试收据</strong>来查看它是如何工作的！</tooltip>',
            manager: '<tooltip>选择我们的<strong>测试管理员</strong>来试用！</tooltip>',
            confirmation: '<tooltip>现在，<strong>提交你的报销</strong>，见证奇迹发生！</tooltip>',
            tryItOut: '试用一下',
        },
        outstandingFilter: '<tooltip>筛选<strong>需要批准</strong>的报销</tooltip>',
        scanTestDriveTooltip: '<tooltip>发送此收据以\n<strong>完成试用体验！</strong></tooltip>',
        gpsTooltip: '<tooltip>GPS 跟踪进行中！完成后，请在下方停止跟踪。</tooltip>',
    },
    discardChangesConfirmation: {
        title: '放弃更改？',
        body: '确定要放弃您所做的更改吗？',
        confirmText: '放弃更改',
    },
    scheduledCall: {
        book: {
            title: '安排通话',
            description: '选择一个适合您的时间。',
            slots: ({date}: {date: string}) => `<muted-text><strong>${date}</strong> 的可用时间</muted-text>`,
        },
        confirmation: {
            title: '确认通话',
            description: '请确认以下详情是否正确。确认通话后，我们会发送包含更多信息的邀请。',
            setupSpecialist: '您的设置专员',
            meetingLength: '会议时长',
            dateTime: '日期和时间',
            minutes: '30 分钟',
        },
        callScheduled: '已安排呼叫',
    },
    autoSubmitModal: {
        title: '一切就绪并已提交！',
        description: '所有警告和违规已被清除，因此：',
        submittedExpensesTitle: '这些报销已被提交',
        submittedExpensesDescription: '这些报销已发送给你的审批人，但在通过审批之前仍可编辑。',
        pendingExpensesTitle: '待处理报销已被移动',
        pendingExpensesDescription: '所有待处理的银行卡报销已被移到单独的报销单中，直至入账。',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '进行 2 分钟试用',
        },
        modal: {
            title: '带我们试驾一下',
            description: '快速浏览产品导览，立即上手。',
            confirmText: '开始试用',
            helpText: '跳过',
            employee: {
                description: '<muted-text>为你的团队获取<strong>3 个月免费的 Expensify！</strong>只需在下方输入你老板的邮箱并给 TA 发送一笔测试报销。</muted-text>',
                email: '输入您上司的邮箱',
                error: '该成员拥有一个工作区，请输入一位新成员进行测试。',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: '您当前正在试用 Expensify',
            readyForTheRealThing: '准备好来点真正的吗？',
            getStarted: '开始使用',
        },
        employeeInviteMessage: (name: string) => `# ${name} 邀请你试用 Expensify
嘿！我刚为我们拿到 *3 个月免费* 试用 Expensify 的机会，这是处理报销最快的方式。

这里有一张 *测试收据*，来向你展示它是如何工作的：`,
    },
    export: {
        basicExport: '基础导出',
        reportLevelExport: '全部数据 - 报告级别',
        expenseLevelExport: '全部数据 - 报销级别',
        exportInProgress: '正在导出',
        conciergeWillSend: 'Concierge 将很快把文件发送给你。',
    },
    domain: {
        notVerified: '未验证',
        retry: '重试',
        verifyDomain: {
            title: '验证域名',
            beforeProceeding: ({domainName}: {domainName: string}) => `在继续之前，请通过更新其 DNS 设置来验证您拥有 <strong>${domainName}</strong>。`,
            accessYourDNS: ({domainName}: {domainName: string}) => `访问你的 DNS 服务提供商，并打开 <strong>${domainName}</strong> 的 DNS 设置。`,
            addTXTRecord: '添加以下 TXT 记录：',
            saveChanges: '保存更改并返回此处以验证您的域。',
            youMayNeedToConsult: `您可能需要联系您组织的 IT 部门来完成验证。<a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">了解详情</a>。`,
            warning: '验证完成后，您域中的所有 Expensify 成员都会收到一封电子邮件，告知其账户将由您的域进行管理。',
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
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> 是一项安全功能，可让您更好地控制使用 <strong>${domainName}</strong> 邮箱的成员如何登录 Expensify。要启用此功能，您需要先验证自己是已授权的公司管理员。</muted-text>`,
            fasterAndEasierLogin: '更快速、更便捷的登录',
            moreSecurityAndControl: '更多安全性与控制权',
            onePasswordForAnything: '一个密码通行所有内容',
        },
        goToDomain: '前往域名',
        samlLogin: {
            title: 'SAML 登录',
            subtitle: `<muted-text>使用 <a href="${CONST.SAML_HELP_URL}">SAML 单点登录 (SSO)</a> 配置成员登录。</muted-text>`,
            enableSamlLogin: '启用 SAML 登录',
            allowMembers: '允许成员通过 SAML 登录。',
            requireSamlLogin: '要求使用 SAML 登录',
            anyMemberWillBeRequired: '使用不同方式登录的任何成员都必须使用 SAML 重新进行身份验证。',
            enableError: '无法更新 SAML 启用设置',
            requireError: '无法更新 SAML 要求设置',
            disableSamlRequired: '禁用 SAML 要求',
            oktaWarningPrompt: '您确定吗？这也会禁用 Okta SCIM。',
            requireWithEmptyMetadataError: '请在下方添加身份提供商元数据以启用',
        },
        samlConfigurationDetails: {
            title: 'SAML 配置详情',
            subtitle: '使用以下详细信息来完成 SAML 设置。',
            identityProviderMetadata: '身份提供商元数据',
            entityID: '实体 ID',
            nameIDFormat: '名称 ID 格式',
            loginUrl: '登录 URL',
            acsUrl: 'ACS（断言使用者服务）URL',
            logoutUrl: '注销 URL',
            sloUrl: 'SLO（单点登出）URL',
            serviceProviderMetaData: '服务提供商元数据',
            oktaScimToken: 'Okta SCIM 令牌',
            revealToken: '显示令牌',
            fetchError: '无法获取 SAML 配置详情',
            setMetadataGenericError: '无法设置 SAML MetaData',
        },
        accessRestricted: {
            title: '访问受限',
            subtitle: (domainName: string) => `如果您需要对以下内容进行管理，请验证您是 <strong>${domainName}</strong> 的授权公司管理员：`,
            companyCardManagement: '公司卡管理',
            accountCreationAndDeletion: '账户创建和删除',
            workspaceCreation: '工作区创建',
            samlSSO: 'SAML 单点登录',
        },
        addDomain: {title: '添加域', subtitle: '请输入您想访问的私有域名（例如：expensify.com）。', domainName: '域名', newDomain: '新域名'},
        domainAdded: {title: '已添加域名', description: '接下来，您需要验证域名的所有权并调整您的安全设置。', configure: '配置'},
        enhancedSecurity: {title: '增强的安全性', subtitle: '要求您域内的成员使用单点登录登录、限制工作区创建等。', enable: '启用'},
        admins: {
            title: '管理员',
            findAdmin: '查找管理员',
            primaryContact: '主要联系人',
            addPrimaryContact: '添加主要联系人',
            setPrimaryContactError: '无法设置主要联系人。请稍后重试。',
            settings: '设置',
            consolidatedDomainBilling: '合并域名结算',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>启用后，主要联系人将为<strong>${domainName}</strong>成员拥有的所有工作区付款，并接收所有账单收据。</muted-text-label></comment>`,
            consolidatedDomainBillingError: '无法更改合并域账单。请稍后重试。',
            addAdmin: '添加管理员',
            addAdminError: '无法将此成员添加为管理员。请重试。',
            revokeAdminAccess: '撤销管理员访问权限',
            cantRevokeAdminAccess: '无法撤销技术联系人的管理员访问权限',
            error: {removeAdmin: '无法将此用户从管理员中移除。请重试。', removeDomain: '无法移除此域名。请重试。', removeDomainNameInvalid: '请输入您的域名以重置。'},
            resetDomain: '重置域名',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `请输入 <strong>${domainName}</strong> 以确认重置该域名。`,
            enterDomainName: '在此输入您的域名',
            resetDomainInfo: `此操作是<strong>永久性的</strong>，并且以下数据将被删除：<br/> <ul><li>公司卡连接以及这些卡片上所有未报销的费用</li> <li>SAML 和群组设置</li> </ul> 所有账户、工作区、报表、费用以及其他数据将会保留。<br/><br/>注意：您可以通过从<a href="#">联系方法</a>中移除关联的邮箱，将此域名从您的域名列表中清除。`,
        },
        members: {title: '成员', findMember: '查找成员', addMember: '添加成员', email: '电子邮箱地址', errors: {addMember: '无法添加此成员。请重试。'}},
        domainAdmins: '域管理员',
    },
    gps: {
        disclaimer: '使用 GPS 根据您的行程创建报销。点击下方的“开始”以开始跟踪。',
        error: {failedToStart: '启动位置跟踪失败。', failedToGetPermissions: '获取必需的位置权限失败。'},
        trackingDistance: '正在跟踪距离…',
        stopped: '已停止',
        start: '开始',
        stop: '停止',
        discard: '丢弃',
        stopGpsTrackingModal: {title: '停止 GPS 追踪', prompt: '你确定吗？这将结束你当前的旅程。', cancel: '恢复追踪', confirm: '停止 GPS 追踪'},
        discardDistanceTrackingModal: {title: '丢弃距离跟踪', prompt: '您确定吗？这将放弃您当前的流程，且无法撤销。', confirm: '丢弃距离跟踪'},
        zeroDistanceTripModal: {title: '无法创建报销', prompt: '你不能创建起点和终点相同的报销。'},
        locationRequiredModal: {title: '需要访问位置信息', prompt: '请在设备设置中允许位置访问以开始 GPS 距离跟踪。', allow: '允许'},
        androidBackgroundLocationRequiredModal: {title: '需要后台位置访问权限', prompt: '请在设备设置中允许应用使用“始终允许”位置访问权限，以开始 GPS 距离跟踪。'},
        preciseLocationRequiredModal: {title: '需要精确位置', prompt: '请在设备设置中启用“精确位置”以开始 GPS 距离跟踪。'},
        desktop: {title: '在手机上跟踪距离', subtitle: '使用 GPS 自动记录英里或公里，并将行程即时转换为报销费用。', button: '下载应用程序'},
        signOutWarningTripInProgress: {title: 'GPS 跟踪进行中', prompt: '您确定要放弃此行程并登出吗？', confirm: '放弃并退出'},
        notification: {title: '正在进行 GPS 跟踪', body: '前往应用完成'},
        continueGpsTripModal: {title: '是否继续记录 GPS 行程？', prompt: '看起来在您上一次的 GPS 行程中应用已关闭。您想从那次行程继续记录吗？', confirm: '继续行程', cancel: '查看行程'},
        locationServicesRequiredModal: {title: '需要访问位置信息', confirm: '打开设置', prompt: '请在设备设置中允许位置访问，以开始 GPS 距离跟踪。'},
        fabGpsTripExplained: '前往 GPS 屏幕（悬浮操作）',
    },
    homePage: {
        forYou: '为你',
        announcements: '公告',
        discoverSection: {
            title: '发现',
            menuItemTitleNonAdmin: '了解如何创建报销和提交报告。',
            menuItemTitleAdmin: '了解如何邀请成员、编辑审批流程以及对公司信用卡进行对账。',
            menuItemDescription: '看看 Expensify 在 2 分钟内能为你做什么',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `提交 ${count} ${count === 1 ? '报销单' : '报销单'}`,
            approve: ({count}: {count: number}) => `批准 ${count} ${count === 1 ? '报销单' : '报销单'}`,
            pay: ({count}: {count: number}) => `支付 ${count} ${count === 1 ? '报销单' : '报销单'}`,
            export: ({count}: {count: number}) => `导出 ${count} ${count === 1 ? '报销单' : '报销单'}`,
            begin: '开始',
            emptyStateMessages: {nicelyDone: '做得很好', keepAnEyeOut: '敬请关注接下来的更新！', allCaughtUp: '你已经全部看完了', upcomingTodos: '即将进行的待办事项会显示在此处。'},
        },
        timeSensitiveSection: {
            title: '时间敏感',
            cta: '报销申请',
            offer50off: {title: '首年立享五折优惠！', subtitle: ({formattedTime}: {formattedTime: string}) => `剩余 ${formattedTime}`},
            offer25off: {title: '首次年度订阅立享 25% 折扣！', subtitle: ({days}: {days: number}) => `剩余 ${days} ${days === 1 ? '天' : '天'}`},
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
