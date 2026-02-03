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
import type {OriginalMessageSettlementAccountLocked, PolicyRulesModifiedFields} from '@src/types/onyx/OriginalMessage';
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
    MultifactorAuthenticationTranslationParams,
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
const translations: TranslationDeepObject<typeof en> = {
    common: {
        count: '数量',
        cancel: '取消',
        dismiss: '关闭',
        proceed: '继续',
        unshare: '取消共享',
        yes: '是',
        no: '否',
        ok: 'OK',
        notNow: '现在不要',
        noThanks: '不用，谢谢',
        learnMore: '了解详情',
        buttonConfirm: '明白了',
        name: '姓名',
        attachment: '附件',
        attachments: '附件',
        center: '中心',
        from: '来自',
        to: '至',
        in: '在',
        optional: '可选',
        new: '新',
        newFeature: '新功能',
        search: '搜索',
        reports: '报表',
        find: '查找',
        searchWithThreeDots: '搜索…',
        next: '下一步',
        previous: '上一页',
        goBack: '返回',
        create: '创建',
        add: '添加',
        resend: '重新发送',
        save: '保存',
        select: '选择',
        deselect: '取消选择',
        selectMultiple: '多选',
        saveChanges: '保存更改',
        submit: '提交',
        submitted: '已提交',
        rotate: '旋转',
        zoom: '缩放',
        password: '密码',
        magicCode: '魔法代码',
        digits: '数字',
        twoFactorCode: '双重验证代码',
        workspaces: '工作区',
        home: '首页',
        inbox: '收件箱',
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
        not: '非',
        signIn: '登录',
        signInWithGoogle: '使用 Google 登录',
        signInWithApple: '使用 Apple 登录',
        signInWith: '使用…登录',
        continue: '继续',
        firstName: '名\b字',
        lastName: '姓',
        scanning: '正在扫描',
        analyzing: '正在分析…',
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
        hidden: '已隐藏',
        visible: '可见',
        delete: '删除',
        archived: '已归档',
        contacts: '联系人',
        recents: '最近',
        close: '关闭',
        comment: '评论',
        download: '下载',
        downloading: '正在下载',
        uploading: '正在上传',
        pin: '置顶',
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
        currentYear: '本年度',
        currentMonth: '本月',
        ssnLast4: '社会安全号码后4位',
        ssnFull9: '完整 9 位数社会安全号码',
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
        zipPostCode: '邮编',
        whatThis: '这是什么？',
        iAcceptThe: '我接受',
        acceptTermsAndPrivacy: `我接受 <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify 服务条款</a> 和 <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">隐私政策</a>`,
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
        recentDestinations: '最近目的地',
        timePrefix: '它是',
        conjunctionFor: '用于',
        todayAt: '今天 在',
        tomorrowAt: '明天 于',
        yesterdayAt: '昨天 在',
        conjunctionAt: '在',
        conjunctionTo: '到',
        genericErrorMessage: '哎呀……出现问题，无法完成您的请求。请稍后再试。',
        percentage: '百分比',
        converted: '已转换',
        error: {
            invalidAmount: '金额无效',
            acceptTerms: '若要继续，您必须接受服务条款',
            phoneNumber: `请输入完整的电话号码
（例如：${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER}）`,
            fieldRequired: '此字段为必填项',
            requestModified: '此请求正在被其他成员修改',
            characterLimitExceedCounter: (length: number, limit: number) => `超出字符限制（${length}/${limit}）`,
            dateInvalid: '请选择有效日期',
            invalidDateShouldBeFuture: '请选择今天或将来的日期',
            invalidTimeShouldBeFuture: '请选择一个至少晚于当前时间一分钟的时间',
            invalidCharacter: '无效字符',
            enterMerchant: '输入商家名称',
            enterAmount: '输入金额',
            missingMerchantName: '缺少商家名称',
            missingAmount: '缺少金额',
            missingDate: '缺少日期',
            enterDate: '输入日期',
            invalidTimeRange: '请输入使用 12 小时制的时间（例如：2:30 PM）',
            pleaseCompleteForm: '请填写上方的表单以继续',
            pleaseSelectOne: '请在上方选择一个选项',
            invalidRateError: '请输入有效的费率',
            lowRateError: '费率必须大于 0',
            email: '请输入有效的电子邮箱地址',
            login: '登录时发生错误。请重试。',
        },
        comma: '逗号',
        semicolon: '分号',
        please: '请',
        contactUs: '联系我们',
        pleaseEnterEmailOrPhoneNumber: '请输入电子邮件地址或电话号码',
        fixTheErrors: '修复错误',
        inTheFormBeforeContinuing: '在继续之前填写表单',
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
        transferBalance: '转移余额',
        enterManually: '手动输入',
        message: '消息',
        leaveThread: '离开会话',
        you: '你',
        me: '我',
        youAfterPreposition: '你',
        your: '你的',
        conciergeHelp: '如需帮助，请联系 Concierge。',
        youAppearToBeOffline: '您似乎处于离线状态。',
        thisFeatureRequiresInternet: '此功能需要活动的互联网连接。',
        attachmentWillBeAvailableOnceBackOnline: '重新联网后，附件将可用。',
        errorOccurredWhileTryingToPlayVideo: '尝试播放此视频时发生错误。',
        areYouSure: '你确定吗？',
        verify: '验证',
        yesContinue: '是，继续',
        websiteExample: '例如：https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `例如：${zipSampleFormat}` : ''),
        description: '描述',
        title: '标题',
        assignee: '受托人',
        createdBy: '创建者',
        with: '带',
        shareCode: '共享代码',
        share: '分享',
        per: '每',
        mi: '英里',
        km: '千米',
        copied: '已复制！',
        someone: '某人',
        total: '总计',
        edit: '编辑',
        letsDoThis: `开始吧！`,
        letsStart: `开始让我们开始`,
        showMore: '显示更多',
        showLess: '收起',
        merchant: '商家',
        change: '更改',
        category: '类别',
        report: '报表',
        billable: '可计费',
        nonBillable: '不可计费',
        tag: '标签',
        receipt: '收据',
        verified: '已验证',
        replace: '替换',
        distance: '距离',
        mile: '英里',
        miles: '英里',
        kilometer: '千米',
        kilometers: '千米',
        recent: '最近',
        all: '全部',
        am: '上午',
        pm: '下午',
        tbd: '待定',
        selectCurrency: '选择货币',
        selectSymbolOrCurrency: '选择符号或货币',
        card: '卡',
        whyDoWeAskForThis: '为什么我们要索取这些信息？',
        required: '必填',
        showing: '显示',
        of: '的',
        default: '默认',
        update: '更新',
        member: '成员',
        auditor: '审计员',
        role: '角色',
        currency: '货币',
        groupCurrency: '群组货币',
        rate: '评分',
        emptyLHN: {
            title: '太棒了！都处理完了。',
            subtitleText1: '使用以下方式查找聊天',
            subtitleText2: '上方按钮，或使用该按钮创建内容',
            subtitleText3: '下方按钮。',
        },
        businessName: '企业名称',
        clear: '清除',
        type: '类型',
        reportName: '报表名称',
        action: '操作',
        expenses: '报销费用',
        totalSpend: '总支出',
        tax: '税',
        shared: '已共享',
        drafts: '草稿',
        draft: '草稿',
        finished: '已完成',
        upgrade: '升级',
        downgradeWorkspace: '降级工作区',
        companyID: '公司 ID',
        userID: '用户 ID',
        disable: '禁用',
        export: '导出',
        initialValue: '初始值',
        currentDate: '当前日期',
        value: '值',
        downloadFailedTitle: '下载失败',
        downloadFailedDescription: '无法完成下载。请稍后重试。',
        filterLogs: '筛选日志',
        network: '网络',
        reportID: '报表 ID',
        longReportID: '长报告 ID',
        withdrawalID: '提现编号',
        bankAccounts: '银行账户',
        chooseFile: '选择文件',
        chooseFiles: '选择文件',
        dropTitle: '松手上传',
        dropMessage: '将文件拖放到此处',
        ignore: '忽略',
        enabled: '已启用',
        disabled: '已禁用',
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
        secondAbbreviation: '秒',
        skip: '跳过',
        chatWithAccountManager: (accountManagerDisplayName: string) => `需要特定帮助？请联系您的客户经理 ${accountManagerDisplayName}。`,
        chatNow: '立即聊天',
        workEmail: '工作邮箱',
        destination: '目的地',
        subrate: '次级费率',
        perDiem: '每日补贴',
        validate: '验证',
        downloadAsPDF: '下载为 PDF',
        downloadAsCSV: '下载为 CSV',
        help: '帮助',
        expenseReport: '报销报告',
        expenseReports: '报销报告',
        rateOutOfPolicy: '不符合政策的费率',
        leaveWorkspace: '离开工作区',
        leaveWorkspaceConfirmation: '如果你离开此工作区，你将无法再向其提交报销。',
        leaveWorkspaceConfirmationAuditor: '如果你离开此工作区，你将无法查看其报表和设置。',
        leaveWorkspaceConfirmationAdmin: '如果你离开此工作区，将无法管理其设置。',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) => `如果你离开此工作空间，你在审批流程中的角色将由工作空间所有者 ${workspaceOwner} 接替。`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) => `如果你离开此工作区，你将由工作区所有者 ${workspaceOwner} 接替成为首选导出人。`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) => `如果你离开此工作空间，你作为技术联系人的角色将由工作空间所有者 ${workspaceOwner} 接替。`,
        leaveWorkspaceReimburser: '作为报销人，您无法离开此工作区。请在“工作区 > 进行或跟踪付款”中设置新的报销人，然后重试。',
        reimbursable: '可报销',
        editYourProfile: '编辑个人资料',
        comments: '评论',
        sharedIn: '共享于',
        unreported: '未报销',
        explore: '探索',
        insights: '洞察',
        todo: '待办事项',
        invoice: '发票',
        expense: '报销',
        chat: '聊天',
        task: '任务',
        trip: '行程',
        apply: '应用',
        status: '状态',
        on: '开已开',
        before: '之前',
        after: '之后',
        reschedule: '重新安排',
        general: '常规',
        workspacesTabTitle: '工作区',
        headsUp: '注意！',
        submitTo: '提交至',
        forwardTo: '转发给',
        merge: '合并',
        none: '无',
        unstableInternetConnection: '网络连接不稳定。请检查您的网络后重试。',
        enableGlobalReimbursements: '启用全球报销',
        purchaseAmount: '购买金额',
        originalAmount: '原始金额',
        frequency: '频率',
        link: '链接',
        pinned: '已置顶',
        read: '已读',
        copyToClipboard: '复制到剪贴板',
        thisIsTakingLongerThanExpected: '这比预期花费的时间更长…',
        domains: '域名',
        actionRequired: '需要操作',
        duplicate: '重复',
        duplicated: '已重复',
        duplicateExpense: '重复报销',
        exchangeRate: '汇率',
        reimbursableTotal: '可报销总额',
        nonReimbursableTotal: '不可报销总额',
        month: '月',
        week: '周',
        year: '年份',
        quarter: '季度',
    },
    supportalNoAccess: {
        title: '别急',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) => `当前为客服登录状态（命令：${command ?? ''}），你无权执行此操作。如果你认为 Success 应该能够执行此操作，请在 Slack 中发起讨论。`,
    },
    lockedAccount: {
        title: '账户已锁定',
        description: '由于此账户已被锁定，您无权完成此操作。请联系 concierge@expensify.com 以获取下一步指引',
    },
    location: {
        useCurrent: '使用当前位置',
        notFound: '我们无法获取您的位置信息。请重试或手动输入地址。',
        permissionDenied: '看起来你已拒绝访问你的位置信息。',
        please: '请',
        allowPermission: '在设置中允许访问位置信息',
        tryAgain: '然后重试。',
    },
    contact: {
        importContacts: '导入联系人',
        importContactsTitle: '导入联系人',
        importContactsText: '从手机导入联系人，让你常用的人脉始终触手可及。',
        importContactsExplanation: '这样，你最喜欢的人总在指尖触手可及。',
        importContactsNativeText: '只剩最后一步！请授权我们导入你的联系人。',
    },
    anonymousReportFooter: {
        logoTagline: '加入讨论。',
    },
    attachmentPicker: {
        cameraPermissionRequired: '相机访问',
        expensifyDoesNotHaveAccessToCamera: '未获得相机访问权限时，Expensify 无法拍照。点击“设置”以更新权限。',
        attachmentError: '附件错误',
        errorWhileSelectingAttachment: '选择附件时发生错误。请重试。',
        errorWhileSelectingCorruptedAttachment: '选择损坏的附件时发生错误。请尝试选择其他文件。',
        takePhoto: '拍照',
        chooseFromGallery: '从相册中选择',
        chooseDocument: '选择文件',
        attachmentTooLarge: '附件太大',
        sizeExceeded: '附件大小超过 24 MB 限制',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `附件大小超过 ${maxUploadSizeInMB} MB 限制`,
        attachmentTooSmall: '附件太小',
        sizeNotMet: '附件大小必须大于 240 字节',
        wrongFileType: '无效的文件类型',
        notAllowedExtension: '不允许此文件类型。请尝试其他文件类型。',
        folderNotAllowedMessage: '不允许上传文件夹。请尝试选择其他文件。',
        protectedPDFNotSupported: '不支持受密码保护的 PDF',
        attachmentImageResized: '此图片已为预览而调整大小。下载以查看完整分辨率。',
        attachmentImageTooLarge: '此图片过大，无法在上传前预览。',
        tooManyFiles: (fileLimit: number) => `一次最多只能上传 ${fileLimit} 个文件。`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `文件超过 ${maxUploadSizeInMB} MB。请重试。`,
        someFilesCantBeUploaded: '某些文件无法上传',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `文件大小必须小于 ${maxUploadSizeInMB} MB。更大的文件将不会被上传。`,
        maxFileLimitExceeded: '您一次最多可以上传 30 张收据。多出的收据将不会被上传。',
        unsupportedFileType: (fileType: string) => `不支持 ${fileType} 文件。只有支持的文件类型会被上传。`,
        learnMoreAboutSupportedFiles: '了解支持的格式。',
        passwordProtected: '不支持受密码保护的 PDF。只有受支持的文件会被上传。',
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
        description: '根据需要拖动、缩放并旋转你的图片。',
    },
    composer: {
        noExtensionFoundForMimeType: '未找到与该 MIME 类型对应的扩展名',
        problemGettingImageYouPasted: '获取您粘贴的图片时出现问题',
        commentExceededMaxLength: (formattedMaxLength: string) => `评论的最大长度为 ${formattedMaxLength} 个字符。`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `任务标题的最大长度为 ${formattedMaxLength} 个字符。`,
    },
    baseUpdateAppModal: {
        updateApp: '更新应用',
        updatePrompt: '此应用有新版本可用。\n现在更新，或稍后重新启动应用以下载最新更新。',
    },
    deeplinkWrapper: {
        launching: '正在启动 Expensify',
        expired: '您的会话已过期。',
        signIn: '请重新登录。',
    },
    multifactorAuthentication: {
        biometricsTest: {
            biometricsTest: '生物识别测试',
            authenticationSuccessful: '验证成功',
            successfullyAuthenticatedUsing: ({authType}: MultifactorAuthenticationTranslationParams) => `您已成功通过 ${authType} 完成身份验证。`,
            troubleshootBiometricsStatus: ({registered}: MultifactorAuthenticationTranslationParams) => `生物识别（${registered ? '已注册' : '未注册'}）`,
            yourAttemptWasUnsuccessful: '您的身份验证尝试未成功。',
            youCouldNotBeAuthenticated: '无法通过身份验证',
            areYouSureToReject: '确定要这样做吗？如果你关闭此屏幕，认证尝试将被拒绝。',
            rejectAuthentication: '拒绝认证',
            test: '测试',
            biometricsAuthentication: '生物识别验证',
        },
        pleaseEnableInSystemSettings: {
            start: '请在您的设备上启用面部/指纹验证或设置设备密码',
            link: '系统设置',
            end: '.',
        },
        oops: '哎呀，出错了',
        looksLikeYouRanOutOfTime: '看起来您的操作已超时！请在商户处重试。',
        youRanOutOfTime: '你的时间用完了',
        letsVerifyItsYou: '让我们验证一下是你本人',
        verifyYourself: {
            biometrics: '使用人脸或指纹验证身份',
        },
        enableQuickVerification: {
            biometrics: '使用面部或指纹即可进行快速、安全的验证，无需密码或验证码。',
        },
        revoke: {
            remove: '移除',
            title: '人脸识别/指纹和通行密钥',
            explanation: '一台或多台设备已启用面部识别/指纹或通行密钥验证。撤销访问权限后，下次在任何设备上进行验证都需要输入魔法验证码。',
            confirmationPrompt: '确定吗？你接下来的任意设备验证都需要魔法验证码。',
            cta: '撤销访问权限',
            noDevices: '您尚未注册任何用于人脸/指纹或通行密钥验证的设备。如果您注册了设备，您将可以在此撤销其访问权限。',
            dismiss: '明白了',
            error: '请求失败。请稍后再试。',
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            阿布拉卡达布拉，
            您已登录成功！
        `),
        successfulSignInDescription: '返回到你最初的标签页继续操作。',
        title: '这是您的魔法验证码',
        description: dedent(`
            请输入在最初请求代码的设备上显示的代码
        `),
        doNotShare: dedent(`
            请勿与任何人分享您的验证码。
            Expensify 绝不会向您索要它！
        `),
        or: '，或',
        signInHere: '只需在此登录',
        expiredCodeTitle: '魔法验证码已过期',
        expiredCodeDescription: '返回原始设备并请求新验证码',
        successfulNewCodeRequest: '已发送验证码。请查看您的设备。',
        tfaRequiredTitle: dedent(`
            需要两步验证
        `),
        tfaRequiredDescription: dedent(`
            请输入您正在尝试登录位置的两步验证代码。
        `),
        requestOneHere: '在此申请一个。',
    },
    moneyRequestConfirmationList: {
        paidBy: '支付方式',
        whatsItFor: '这是做什么用的？',
    },
    selectionList: {
        nameEmailOrPhoneNumber: '姓名、电子邮件或电话号码',
        findMember: '查找成员',
        searchForSomeone: '搜索某人',
    },
    customApprovalWorkflow: {
        title: '自定义审批流程',
        description: '您的公司在此工作区使用自定义审批流程。请在 Expensify Classic 中执行此操作',
        goToExpensifyClassic: '切换到 Expensify 经典版',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '提交报销，推荐你的团队',
            subtitleText: '也想让你的团队使用 Expensify 吗？只需向他们提交一笔报销，我们会帮你搞定剩下的一切。',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '预约通话',
    },
    hello: '你好',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '从下面开始。',
        anotherLoginPageIsOpen: '另一个登录页面已打开。',
        anotherLoginPageIsOpenExplanation: '你已在单独的标签页中打开登录页面。请在该标签页中完成登录。',
        welcome: '欢迎！',
        welcomeWithoutExclamation: '欢迎',
        phrase2: '金钱会说话。现在聊天和付款都在一个地方，一切也变得轻松自如。',
        phrase3: '你的报销到账速度，就像你表达清楚自己观点一样快。',
        enterPassword: '请输入您的密码',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}，很高兴在这里见到新面孔！`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `请输入发送到 ${login} 的魔法验证码。验证码应会在一两分钟内送达。`,
    },
    login: {
        hero: {
            header: '差旅与报销，畅享聊天般的极速体验',
            body: '欢迎使用新一代 Expensify，在情境化的实时聊天帮助下，让您的差旅和报销处理得更快。',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: '继续使用单点登录登录：',
        orContinueWithMagicCode: '您也可以使用魔法验证码登录',
        useSingleSignOn: '使用单点登录',
        useMagicCode: '使用魔法验证码',
        launching: '正在启动...',
        oneMoment: '正在将您重定向到您公司的单点登录门户，请稍候。',
    },
    reportActionCompose: {
        dropToUpload: '拖放以上传',
        sendAttachment: '发送附件',
        addAttachment: '添加附件',
        writeSomething: '写点什么…',
        blockedFromConcierge: '通信被禁止',
        fileUploadFailed: '上传失败。不支持该文件。',
        localTime: ({user, time}: LocalTimeParams) => `现在是 ${user} 的 ${time}`,
        edited: '（已编辑）',
        emoji: '表情符号',
        collapse: '收起',
        expand: '展开',
    },
    reportActionContextMenu: {
        copyMessage: '复制消息',
        copied: '已复制！',
        copyLink: '复制链接',
        copyURLToClipboard: '将 URL 复制到剪贴板',
        copyEmailToClipboard: '复制邮箱到剪贴板',
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
            return `删除${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = '评论';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `确定要删除此${type}吗？`;
        },
        onlyVisible: '仅对以下对象可见',
        explain: '解释',
        explainMessage: '请向我解释一下这个。',
        replyInThread: '在线程中回复',
        joinThread: '加入讨论串',
        leaveThread: '离开会话',
        copyOnyxData: '复制 Onyx 数据',
        flagAsOffensive: '标记为违规',
        menu: '菜单',
    },
    emojiReactions: {
        addReactionTooltip: '添加表情回应',
        reactedWith: '做出了以下表情反应',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `你错过了<strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>中的聚会，这里已经没有可看的内容。`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) => `此聊天包含 <strong>${domainRoom}</strong> 域上的所有 Expensify 成员。请用它与同事交流、分享技巧并提出问题。`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) => `此对话是与 <strong>${workspaceName}</strong> 管理员进行的。请用它来讨论工作区设置等内容。`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `此聊天包含 <strong>${workspaceName}</strong> 中的所有人。请用于发布最重要的公告。`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `此聊天室用于讨论任何与<strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>相关的内容。`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `此聊天用于在 <strong>${invoicePayer}</strong> 和 <strong>${invoiceReceiver}</strong> 之间处理发票。请使用 “+” 按钮发送发票。`,
        beginningOfChatHistory: (users: string) => `此聊天对象为 ${users}。`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `这是 <strong>${submitterDisplayName}</strong> 向 <strong>${workspaceName}</strong> 提交报销的地方。只需使用“+”按钮。`,
        beginningOfChatHistorySelfDM: '这是你的个人空间。可用于记录笔记、任务、草稿和提醒。',
        beginningOfChatHistorySystemDM: '欢迎！让我们来为你完成设置。',
        chatWithAccountManager: '在这里与您的客户经理聊天',
        askMeAnything: '随便问我任何问题！',
        sayHello: '打个招呼！',
        yourSpace: '你的空间',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `欢迎来到 ${roomName}！`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `使用“+”按钮来${additionalText}一笔报销。`,
        askConcierge: '提出问题并获得 24/7 实时支持。',
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
    adminOnlyCanPost: '只有管理员可以在此房间中发送消息。',
    reportAction: {
        asCopilot: '作为副驾驶，用于',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) => `创建了此报表，用于保存来自 <a href="${reportUrl}">${reportName}</a> 中、无法按照你选择的频率提交的所有费用`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName}: CreatedReportForUnapprovedTransactionsParams) =>
            `为从<a href="${reportUrl}">${reportName}</a>中保留的所有报销创建了此报表`,
    },
    mentionSuggestions: {
        hereAlternateText: '通知此对话中的所有人',
    },
    newMessages: '新消息',
    latestMessages: '最新消息',
    youHaveBeenBanned: '注意：你已被禁止在此频道中聊天。',
    reportTypingIndicator: {
        isTyping: '正在输入…',
        areTyping: '正在输入…',
        multipleMembers: '多个成员',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: '此聊天室已被归档。',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `此聊天已不再活动，因为${displayName}已关闭其账户。`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `此聊天已不再激活，因为${oldDisplayName}已将其账户与${displayName}合并。`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou ? `此聊天已不再活动，因为<strong>你</strong>已不再是 ${policyName} 工作区的成员。` : `此聊天已不再活跃，因为${displayName}已不再是${policyName}工作区的成员。`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `此聊天不再活跃，因为 ${policyName} 已不再是一个活跃的工作区。`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `此聊天不再活跃，因为 ${policyName} 已不再是一个活跃的工作区。`,
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
        buttonFind: '搜索内容...',
        buttonMySettings: '我的设置',
        fabNewChat: '开始聊天',
        fabNewChatExplained: '打开操作菜单',
        fabScanReceiptExplained: '扫描收据',
        chatPinned: '聊天已置顶',
        draftedMessage: '草稿消息',
        listOfChatMessages: '聊天消息列表',
        listOfChats: '聊天列表',
        saveTheWorld: '拯救世界',
        tooltip: '从这里开始！',
        redirectToExpensifyClassicModal: {
            title: '即将推出',
            description: '我们正在对全新的 Expensify 进行一些微调，以适配你的特定设置。与此同时，请先前往 Expensify Classic。',
        },
    },
    homePage: {
        forYou: '为你',
        timeSensitiveSection: {
            title: '时间敏感',
            cta: '报销申请',
            offer50off: {
                title: '首年可享受五折优惠！',
                subtitle: ({formattedTime}: {formattedTime: string}) => `剩余 ${formattedTime}`,
            },
            offer25off: {
                title: '首年立享 25% 折扣！',
                subtitle: ({days}: {days: number}) => `剩余 ${days} ${days === 1 ? '天' : '天'}`,
            },
            addShippingAddress: {
                title: '我们需要你的收货地址',
                subtitle: '请提供一个地址以接收您的 Expensify 卡。',
                cta: '添加地址',
            },
            activateCard: {
                title: '激活您的 Expensify 卡',
                subtitle: '验证您的卡片并开始消费。',
                cta: '启用',
            },
        },
        announcements: '公告',
        discoverSection: {
            title: '发现',
            menuItemTitleNonAdmin: '了解如何创建报销和提交报表。',
            menuItemTitleAdmin: '了解如何邀请成员、编辑审批流程以及对公司卡进行对账。',
            menuItemDescription: '了解 Expensify 在 2 分钟内能为您做什么',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `提交 ${count} ${count === 1 ? '报销单' : '报告'}`,
            approve: ({count}: {count: number}) => `批准 ${count} ${count === 1 ? '报销单' : '报告'}`,
            pay: ({count}: {count: number}) => `支付 ${count} ${count === 1 ? '报销单' : '报告'}`,
            export: ({count}: {count: number}) => `导出 ${count} ${count === 1 ? '报销单' : '报告'}`,
            begin: '开始',
            emptyStateMessages: {
                nicelyDone: '做得好',
                keepAnEyeOut: '留意接下来即将发生的事情！',
                allCaughtUp: '你已全部处理完毕',
                upcomingTodos: '即将到来的待办事项会显示在这里。',
            },
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
        manual: '手动',
        scan: '扫描',
        map: '地图',
        gps: 'GPS',
        odometer: '里程表',
    },
    spreadsheet: {
        upload: '上传电子表格',
        import: '导入电子表格',
        dragAndDrop: '<muted-link>将您的电子表格拖放到此处，或在下方选择文件。支持的格式：.csv、.txt、.xls 和 .xlsx。</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>将您的电子表格拖放到此处，或在下方选择一个文件。<a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">了解更多</a>有关支持的文件格式。</muted-link>`,
        chooseSpreadsheet: '<muted-link>选择要导入的电子表格文件。支持的格式：.csv、.txt、.xls 和 .xlsx。</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>选择要导入的电子表格文件。<a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">了解更多</a>支持的文件格式。</muted-link>`,
        fileContainsHeader: '文件包含列标题',
        column: (name: string) => `列 ${name}`,
        fieldNotMapped: (fieldName: string) => `哎呀！有一个必填字段（“${fieldName}”）尚未映射。请检查后重试。`,
        singleFieldMultipleColumns: (fieldName: string) => `糟糕！你已将同一个字段（“${fieldName}”）映射到多个列。请检查后重试。`,
        emptyMappedField: (fieldName: string) => `哎呀！字段（“${fieldName}”）包含一个或多个空值。请检查后重试。`,
        importSuccessfulTitle: '导入成功',
        importCategoriesSuccessfulDescription: ({categories}: {categories: number}) => (categories > 1 ? `已添加 ${categories} 个类别。` : '已添加 1 个类别。'),
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '尚未添加或更新任何成员。';
            }
            if (added && updated) {
                return `已添加 ${added} 名成员${added > 1 ? '秒' : ''}，已更新 ${updated} 名成员${updated > 1 ? '秒' : ''}。`;
            }
            if (updated) {
                return updated > 1 ? `${updated} 位成员已更新。` : '1 位成员已更新。';
            }
            return added > 1 ? `已添加 ${added} 名成员。` : '已添加 1 位成员。';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `已添加 ${tags} 个标签。` : '已添加 1 个标签。'),
        importMultiLevelTagsSuccessfulDescription: '已添加多级标签。',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `已添加 ${rates} 条每日补贴标准。` : '已添加 1 个日津贴标准。'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) => (transactions > 1 ? `已导入 ${transactions} 笔交易。` : '已导入 1 笔交易。'),
        importFailedTitle: '导入失败',
        importFailedDescription: '请确保所有字段都已正确填写，然后重试。如果问题仍然存在，请联系 Concierge。',
        importDescription: '通过单击下方每个导入列旁边的下拉菜单，选择要从电子表格中映射的字段。',
        sizeNotMet: '文件大小必须大于 0 字节',
        invalidFileMessage: '您上传的文件为空或包含无效数据。请确保文件格式正确并包含所需信息后再重新上传。',
        importSpreadsheetLibraryError: '无法加载电子表格模块。请检查您的网络连接，然后重试。',
        importSpreadsheet: '导入电子表格',
        downloadCSV: '下载 CSV',
        importMemberConfirmation: () => ({
            one: `请确认下方新工作区成员的详细信息，该成员将作为本次上传的一部分被添加。现有成员不会收到任何角色更新或邀请消息。`,
            other: (count: number) => `请确认以下有关将在本次上传中添加的 ${count} 位新工作区成员的详细信息。现有成员不会收到任何角色更新或邀请消息。`,
        }),
    },
    receipt: {
        upload: '上传发票',
        uploadMultiple: '上传收据',
        desktopSubtitleSingle: `或拖放到此处`,
        desktopSubtitleMultiple: `或将它们拖放到此处`,
        alternativeMethodsTitle: '添加收据的其他方式：',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">下载应用</a>，用手机扫描</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>将收据转发到 <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">添加您的号码</a>，将报销单短信发送到 ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>将收据短信发送至 ${phoneNumber}（仅限美国号码）</label-text>`,
        takePhoto: '拍照',
        cameraAccess: '需要访问相机才能拍摄收据照片。',
        deniedCameraAccess: `仍未授予摄像头访问权限，请按照<a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">这些说明</a>进行操作。`,
        cameraErrorTitle: '相机错误',
        cameraErrorMessage: '拍照时出错。请重试。',
        locationAccessTitle: '允许访问位置信息',
        locationAccessMessage: '位置访问有助于我们在您出行时随时保持您的时区和货币准确无误。',
        locationErrorTitle: '允许访问位置信息',
        locationErrorMessage: '位置访问有助于我们在您出行时随时保持您的时区和货币准确无误。',
        allowLocationFromSetting: `位置访问有助于我们在您出行时保持时区和货币的准确。请在设备的权限设置中允许位置访问。`,
        dropTitle: '放手',
        dropMessage: '在此处拖放您的文件',
        flash: '闪光',
        multiScan: '多重扫描',
        shutter: '快门',
        gallery: '图库',
        deleteReceipt: '删除收据',
        deleteConfirmation: '确定要删除这张收据吗？',
        addReceipt: '添加收据',
        scanFailed: '收据无法扫描，因为缺少商户、日期或金额。',
        addAReceipt: {
            phrase1: '添加收据',
            phrase2: '或将文件拖放到此处',
        },
    },
    quickAction: {
        scanReceipt: '扫描收据',
        recordDistance: '跟踪距离',
        requestMoney: '创建报销',
        perDiem: '创建每日津贴',
        splitBill: '拆分费用',
        splitScan: '拆分收据',
        splitDistance: '拆分距离',
        paySomeone: ({name}: PaySomeoneParams = {}) => `支付 ${name ?? '某人'}`,
        assignTask: '分配任务',
        header: '快速操作',
        noLongerHaveReportAccess: '您不再能访问之前的快速操作目标。请在下方选择一个新的。',
        updateDestination: '更新目的地',
        createReport: '创建报表',
    },
    iou: {
        amount: '金额',
        percent: '百分比',
        date: '日期',
        taxAmount: '税额',
        taxRate: '税率',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `批准 ${formattedAmount}` : '批准'),
        approved: '已批准',
        cash: '现金',
        card: '卡',
        original: '原始',
        split: '拆分',
        splitExpense: '拆分费用',
        splitDates: '拆分日期',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate} 至 ${endDate}（${count} 天）`,
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `来自 ${merchant} 的 ${amount}`,
        splitByPercentage: '按百分比分摊',
        splitByDate: '按日期拆分',
        addSplit: '添加拆分',
        makeSplitsEven: '平均拆分',
        editSplits: '编辑拆分',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `总金额比原始报销多出 ${amount}。`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `总金额比原始报销少 ${amount}。`,
        splitExpenseZeroAmount: '请先输入有效金额，然后再继续。',
        splitExpenseOneMoreSplit: '未添加拆分。请至少添加一项以保存。',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `编辑 ${merchant} 的 ${amount}`,
        removeSplit: '移除拆分',
        splitExpenseCannotBeEditedModalTitle: '此报销无法编辑',
        splitExpenseCannotBeEditedModalDescription: '已批准或已支付的报销无法编辑',
        splitExpenseDistanceErrorModalDescription: '请修复差旅距离费率错误，然后重试。',
        paySomeone: ({name}: PaySomeoneParams = {}) => `支付 ${name ?? '某人'}`,
        expense: '报销',
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
        chooseRecipient: '选择收款人',
        createExpenseWithAmount: ({amount}: {amount: string}) => `创建 ${amount} 笔费用`,
        confirmDetails: '确认详情',
        pay: '支付',
        cancelPayment: '取消付款',
        cancelPaymentConfirmation: '确定要取消此付款吗？',
        viewDetails: '查看详情',
        pending: '待处理',
        canceled: '已取消',
        posted: '已入账',
        deleteReceipt: '删除收据',
        findExpense: '查找报销',
        deletedTransaction: (amount: string, merchant: string) => `删除了一笔报销（${merchant} 的 ${amount}）`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `移动了一笔报销${reportName ? `来自 ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `已移动此报销${reportName ? `到 <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `已移动此报销${reportName ? `来自<a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `已将此报销移至你的<a href="${reportUrl}">个人空间</a>`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `已将此报表移动到<a href="${newParentReportUrl}">${toPolicyName}</a>工作区`;
            }
            return `已将此<a href="${movedReportUrl}">报表</a>移动到<a href="${newParentReportUrl}">${toPolicyName}</a>工作区`;
        },
        pendingMatchWithCreditCard: '收据正等待与卡片交易匹配',
        pendingMatch: '待匹配',
        pendingMatchWithCreditCardDescription: '收据正等待与卡片交易匹配。标记为现金以取消。',
        markAsCash: '标记为现金',
        routePending: '正在路由中…',
        receiptScanning: () => ({
            one: '正在扫描收据…',
            other: '正在扫描收据…',
        }),
        scanMultipleReceipts: '扫描多张收据',
        scanMultipleReceiptsDescription: '一次性拍下所有收据照片，然后自行确认明细，或者交给我们来处理。',
        receiptScanInProgress: '收据扫描进行中',
        receiptScanInProgressDescription: '收据扫描中。请稍后再查看，或立即输入详细信息。',
        removeFromReport: '从报表中移除',
        moveToPersonalSpace: '将报销移至你的个人空间',
        duplicateTransaction: (isSubmitted: boolean) => (!isSubmitted ? '发现可能重复的报销。请检查重复项以继续提交。' : '检测到可能重复的报销。请查看重复项以便完成审批。'),
        receiptIssuesFound: () => ({
            one: '发现问题',
            other: '发现的问题',
        }),
        fieldPending: '待处理…',
        defaultRate: '默认费率',
        receiptMissingDetails: '收据缺少明细',
        missingAmount: '缺少金额',
        missingMerchant: '缺少商户',
        receiptStatusTitle: '正在扫描…',
        receiptStatusText: '扫描时只有你能看到此收据。请稍后再来查看，或现在输入详细信息。',
        receiptScanningFailed: '收据扫描失败。请手动输入详细信息。',
        transactionPendingDescription: '交易待处理。入账可能需要几天时间。',
        companyInfo: '公司信息',
        companyInfoDescription: '在您发送第一张发票之前，我们还需要您提供更多详细信息。',
        yourCompanyName: '您的公司名称',
        yourCompanyWebsite: '公司网站',
        yourCompanyWebsiteNote: '如果你没有公司网站，可以改为提供公司在 LinkedIn 或其他社交媒体上的主页。',
        invalidDomainError: '您输入的域名无效。若要继续，请输入有效的域名。',
        publicDomainError: '您输入的是公共域名。要继续，请输入一个私有域名。',
        expenseCount: () => {
            return {
                one: '1 笔报销',
                other: (count: number) => `${count} 笔报销`,
            };
        },
        deleteExpense: () => ({
            one: '删除报销',
            other: '删除报销费用',
        }),
        deleteConfirmation: () => ({
            one: '确定要删除此报销吗？',
            other: '确定要删除这些报销吗？',
        }),
        deleteReport: '删除报表',
        deleteReportConfirmation: '确定要删除此报告吗？',
        settledExpensify: '已支付',
        done: '完成',
        settledElsewhere: '在别处支付',
        individual: '个人',
        business: '商务',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `使用 Expensify 支付 ${formattedAmount}` : `使用 Expensify 支付`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `以个人身份支付 ${formattedAmount}` : `使用个人账户支付`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `使用钱包支付 ${formattedAmount}` : `使用钱包支付`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `支付 ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `以公司身份支付 ${formattedAmount}` : `使用企业账户付款`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `将 ${formattedAmount} 标记为已支付` : `标记为已支付`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `使用个人账户 ${last4Digits} 支付了 ${amount}` : `使用个人账户支付`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `已使用企业账户尾号为 ${last4Digits} 的账户支付了 ${amount}` : `使用公司账户付款`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `通过 ${policyName} 支付 ${formattedAmount}` : `通过 ${policyName} 支付`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `使用银行账户 ${last4Digits} 支付了 ${amount}` : `使用银行账户 ${last4Digits} 支付`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `通过工作区规则使用银行账户 ${last4Digits} 支付了 ${amount ? `${amount} ` : ''}（<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">工作区规则</a>）`,
        invoicePersonalBank: (lastFour: string) => `个人账户 • 尾号 ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `公司账户 • ${lastFour}`,
        nextStep: '后续步骤',
        finished: '已完成',
        flip: '翻转',
        sendInvoice: ({amount}: RequestAmountParams) => `发送 ${amount} 发票`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `用于 ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `已提交${memo ? `，备注为 ${memo}` : ''}`,
        automaticallySubmitted: `通过<a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">延迟提交</a>提交`,
        queuedToSubmitViaDEW: '已排队，待通过自定义审批流程提交',
        queuedToApproveViaDEW: '已排队，等待通过自定义审批流程进行审批',
        trackedAmount: (formattedAmount: string, comment?: string) => `跟踪 ${formattedAmount}${comment ? `用于 ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `拆分 ${amount}`,
        didSplitAmount: (formattedAmount: string, comment: string) => `拆分 ${formattedAmount}${comment ? `用于 ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `您分摊的${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} 欠款 ${amount}${comment ? `用于 ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} 应付：`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}已支付 ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} 已支付：`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} 支出了 ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} 支出：`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} 已批准：`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager}已批准${amount}`,
        payerSettled: (amount: number | string) => `支付了 ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `已支付 ${amount}。添加银行账户以接收您的款项。`,
        automaticallyApproved: `通过<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">工作区规则</a>批准`,
        approvedAmount: (amount: number | string) => `已审批 ${amount}`,
        approvedMessage: `已批准`,
        unapproved: `未批准`,
        automaticallyForwarded: `通过<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">工作区规则</a>批准`,
        forwarded: `已批准`,
        rejectedThisReport: '拒绝了此报告',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `已开始付款，但正在等待${submitterDisplayName}添加银行账户。`,
        adminCanceledRequest: '已取消付款',
        canceledRequest: (amount: string, submitterDisplayName: string) => `已取消 ${amount} 付款，因为 ${submitterDisplayName} 未在 30 天内启用其 Expensify 钱包`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) => `${submitterDisplayName} 添加了一个银行账户。已完成 ${amount} 付款。`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}标记为已支付${comment ? `，说“${comment}”` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}使用钱包支付`,
        automaticallyPaidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}已通过 Expensify 按照<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">工作区规则</a>支付`,
        noReimbursableExpenses: '此报表的金额无效',
        pendingConversionMessage: '重新联网后将更新总计',
        changedTheExpense: '更改了报销费用',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `将 ${valueName} 更改为 ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `将 ${translatedChangedField} 设置为 ${newMerchant}，这会将金额设置为 ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `${valueName}（之前为 ${oldValueToDisplay}）`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `将${valueName}更改为${newValueToDisplay}（先前为${oldValueToDisplay}）`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `将 ${translatedChangedField} 更改为 ${newMerchant}（原为 ${oldMerchant}），从而将金额更新为 ${newAmountToDisplay}（原为 ${oldAmountToDisplay}）`,
        basedOnAI: '基于过去的活动',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `基于<a href="${rulesLink}">工作区规则</a>` : '基于工作区规则'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `用于 ${comment}` : '费用'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `发票报告 #${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `已发送 ${formattedAmount}${comment ? `用于 ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `已将报销从个人空间移动到 ${workspaceName ?? `与 ${reportName} 聊天`}`,
        movedToPersonalSpace: '已将报销移动到个人空间',
        error: {
            invalidCategoryLength: '类别名称超过 255 个字符。请缩短名称或选择其他类别。',
            invalidTagLength: '标签名称超过了 255 个字符。请缩短它或选择其他标签。',
            invalidAmount: '请先输入有效金额，然后再继续',
            invalidDistance: '请在继续之前输入有效的距离',
            invalidReadings: '请输入起始读数和结束读数',
            negativeDistanceNotAllowed: '结束读数必须大于开始读数',
            invalidIntegerAmount: '在继续之前请输入一个整数美元金额',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `最高税额为 ${amount}`,
            invalidSplit: '拆分金额之和必须等于总金额',
            invalidSplitParticipants: '请为至少两位参与者输入大于零的金额',
            invalidSplitYourself: '请输入此分摊项的非零金额',
            noParticipantSelected: '请选择参与者',
            other: '发生未知错误。请稍后重试。',
            genericCreateFailureMessage: '提交此报销时发生意外错误。请稍后重试。',
            genericCreateInvoiceFailureMessage: '发送此发票时出现意外错误。请稍后重试。',
            genericHoldExpenseFailureMessage: '暂时无法暂挂此报销，請稍后再试。',
            genericUnholdExpenseFailureMessage: '将此报销从挂起状态移除时发生意外错误。请稍后再试。',
            receiptDeleteFailureError: '删除此收据时发生意外错误。请稍后重试。',
            receiptFailureMessage: '<rbr>上传您的收据时出错。请先<a href="download">保存收据</a>，然后稍后<a href="retry">重试</a>。</rbr>',
            receiptFailureMessageShort: '上传您的收据时出错。',
            genericDeleteFailureMessage: '删除此报销时发生意外错误。请稍后重试。',
            genericEditFailureMessage: '编辑此报销时发生意外错误。请稍后重试。',
            genericSmartscanFailureMessage: '交易缺少字段',
            duplicateWaypointsErrorMessage: '请移除重复的途经点',
            atLeastTwoDifferentWaypoints: '请输入至少两个不同的地址',
            splitExpenseMultipleParticipantsErrorMessage: '一笔报销无法在工作区和其他成员之间拆分。请更新您的选择。',
            invalidMerchant: '请输入有效的商家',
            atLeastOneAttendee: '必须至少选择一位参与者',
            invalidQuantity: '请输入有效的数量',
            quantityGreaterThanZero: '数量必须大于零',
            invalidSubrateLength: '必须至少有一个子费率',
            invalidRate: '该费率对本工作区无效。请从此工作区中选择一个可用费率。',
            endDateBeforeStartDate: '结束日期不能早于开始日期',
            endDateSameAsStartDate: '结束日期不能与开始日期相同',
            manySplitsProvided: `允许的最大拆分数为 ${CONST.IOU.SPLITS_LIMIT}。`,
            dateRangeExceedsMaxDays: `日期范围不能超过 ${CONST.IOU.SPLITS_LIMIT} 天。`,
        },
        dismissReceiptError: '忽略错误',
        dismissReceiptErrorConfirmation: '注意！忽略此错误将会彻底删除你上传的收据。确定要继续吗？',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) => `已开始结算。付款已暂停，直到 ${submitterDisplayName} 启用他们的钱包。`,
        enableWallet: '启用钱包',
        hold: '暂挂',
        unhold: '解除保留',
        holdExpense: () => ({
            one: '暂缓报销',
            other: '挂起报销',
        }),
        unholdExpense: '取消冻结报销',
        heldExpense: '已搁置此报销项目',
        unheldExpense: '已解除此报销的保留状态',
        moveUnreportedExpense: '移动未报销费用',
        addUnreportedExpense: '添加未报销费用',
        selectUnreportedExpense: '请至少选择一笔报销添加到报表中。',
        emptyStateUnreportedExpenseTitle: '没有未报销的报销单',
        emptyStateUnreportedExpenseSubtitle: '看起来你还没有任何未报销的费用。请在下方新建一笔。',
        addUnreportedExpenseConfirm: '添加到报表',
        newReport: '新报表',
        explainHold: () => ({
            one: '请说明你为何暂缓处理这笔报销。',
            other: '请说明你为何暂时保留这些报销。',
        }),
        retracted: '已撤回',
        retract: '撤回',
        reopened: '重新打开',
        reopenReport: '重新打开报表',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) => `此报表已导出至 ${connectionName}。更改它可能导致数据不一致。确定要重新打开此报表吗？`,
        reason: '原因',
        holdReasonRequired: '暂挂时必须填写原因。',
        expenseWasPutOnHold: '报销已被暂挂',
        expenseOnHold: '此报销已被搁置。请查看评论以了解下一步操作。',
        expensesOnHold: '所有报销已被搁置。请查看评论以了解下一步操作。',
        expenseDuplicate: '此报销与另一条报销的明细相似。请检查重复项后再继续。',
        someDuplicatesArePaid: '其中有些重复项已经被批准或支付。',
        reviewDuplicates: '查看重复项',
        keepAll: '全部保留',
        confirmApprove: '确认批准金额',
        confirmApprovalAmount: '仅批准合规的报销，或批准整份报销报告。',
        confirmApprovalAllHoldAmount: () => ({
            one: '此报销已被暂挂。仍要批准吗？',
            other: '这些报销已被搁置。你仍然想要批准吗？',
        }),
        confirmPay: '确认付款金额',
        confirmPayAmount: '支付未冻结的部分，或支付整个报销单。',
        confirmPayAllHoldAmount: () => ({
            one: '此报销目前已被搁置。你仍然要付款吗？',
            other: '这些报销目前已被搁置。你仍然想要付款吗？',
        }),
        payOnly: '仅支付',
        approveOnly: '仅批准',
        holdEducationalTitle: '是否要暂缓处理这笔报销？',
        whatIsHoldExplain: '“搁置”就像按下报销的“暂停键”，等你准备好再提交。',
        holdIsLeftBehind: '即使提交整份报销单，被搁置的报销也会被保留在原处。',
        unholdWhenReady: '准备提交报销时，先取消搁置这些费用。',
        changePolicyEducational: {
            title: '你已移动此报表！',
            description: '请仔细检查以下项目，它们在将报表移动到新工作区时往往会发生变化。',
            reCategorize: '<strong>重新分类所有报销</strong>以符合工作区规则。',
            workflows: '此报表现在可能适用于不同的<strong>审批工作流程。</strong>',
        },
        changeWorkspace: '切换工作区',
        set: '设置',
        changed: '已更改',
        removed: '已移除',
        transactionPending: '交易处理中。',
        chooseARate: '选择工作区的每英里或每公里报销费率',
        unapprove: '取消批准',
        unapproveReport: '取消批准报销报告',
        headsUp: '注意！',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `此报销单已导出到 ${accountingIntegration}。修改它可能会导致数据不一致。确定要撤销批准此报销单吗？`,
        reimbursable: '可报销',
        nonReimbursable: '不可报销',
        bookingPending: '此预订待处理',
        bookingPendingDescription: '此预订处于待处理状态，因为尚未支付。',
        bookingArchived: '此预订已归档',
        bookingArchivedDescription: '此预订已归档，因为行程日期已过。如有需要，请为最终金额添加一笔报销。',
        attendees: '与会者',
        whoIsYourAccountant: '你的会计师是谁？',
        paymentComplete: '付款完成',
        time: '时间',
        startDate: '开始日期',
        endDate: '结束日期',
        startTime: '开始时间',
        endTime: '结束时间',
        deleteSubrate: '删除子费率',
        deleteSubrateConfirmation: '确定要删除此子费率吗？',
        quantity: '数量',
        subrateSelection: '选择一个子费率并输入数量。',
        qty: '数量',
        firstDayText: () => ({
            one: `第一天：1 小时`,
            other: (count: number) => `第一天：${count.toFixed(2)} 小时`,
        }),
        lastDayText: () => ({
            one: `最后一天：1 小时`,
            other: (count: number) => `最后一天：${count.toFixed(2)} 小时`,
        }),
        tripLengthText: () => ({
            one: `行程：1 整天`,
            other: (count: number) => `行程：${count} 个完整天数`,
        }),
        dates: '日期',
        rates: '费率',
        submitsTo: ({name}: SubmitsToParams) => `提交给 ${name}`,
        reject: {
            educationalTitle: '你要暂缓处理还是拒绝？',
            educationalText: '如果您还没准备好批准或支付一笔报销，您可以暂缓处理或拒绝它。',
            holdExpenseTitle: '在批准或付款前暂缓报销，以便要求提供更多详细信息。',
            approveExpenseTitle: '在保留搁置报销分配给您的同时，批准其他报销。',
            heldExpenseLeftBehindTitle: '当你审批整个报销报告时，被暂搁的报销会被保留在外。',
            rejectExpenseTitle: '拒绝你不打算批准或支付的报销。',
            reasonPageTitle: '拒绝报销单',
            reasonPageDescription: '请说明你拒绝此报销的原因。',
            rejectReason: '驳回原因',
            markAsResolved: '标记为已解决',
            rejectedStatus: '此报销已被退回。请尽快解决相关问题并标记为已解决，以便重新提交。',
            reportActions: {
                rejectedExpense: '拒绝了此报销',
                markedAsResolved: '已将拒绝原因标记为已解决',
            },
        },
        moveExpenses: () => ({one: '移动报销单', other: '移动费用'}),
        moveExpensesError: '您无法将每日津贴报销移动到其他工作区的报表中，因为不同工作区的每日津贴标准可能不同。',
        changeApprover: {
            title: '更改审批人',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `选择一个选项来更改此报表的审批人。（更新你的<a href="${workflowSettingLink}">工作区设置</a>，即可将所有报表的审批人永久更改为该设置。）`,
            changedApproverMessage: (managerID: number) => `将审批人更改为 <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: '添加审批人',
                addApproverSubtitle: '在现有工作流程中添加一位额外的审批人。',
                bypassApprovers: '跳过审批人',
                bypassApproversSubtitle: '将自己指定为最终审批人并跳过所有剩余审批人。',
            },
            addApprover: {
                subtitle: '在我们将此报告提交至其余审批流程之前，请为其选择一位额外审批人。',
            },
        },
        chooseWorkspace: '选择一个工作区',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `由于自定义审批流程，报告已转发至 ${to}`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? '小时' : '小时'} @ ${rate} / 小时`,
            hrs: '小时',
            hours: '小时',
            ratePreview: (rate: string) => `${rate} / 小时`,
            amountTooLargeError: '总金额过大。请减少工时或降低费率。',
        },
        correctDistanceRateError: '修复距离费率错误后请重试。',
        AskToExplain: `。<a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}"><strong>说明</strong></a> &#x2728;`,
        policyRulesModifiedFields: (policyRulesModifiedFields: PolicyRulesModifiedFields, policyRulesRoute: string, formatList: (list: string[]) => string) => {
            const entries = ObjectUtils.typedEntries(policyRulesModifiedFields);
            const fragments = entries.map(([key, value], i) => {
                const isFirst = i === 0;
                if (key === 'reimbursable') {
                    return value ? '将该报销单标记为“可报销”' : '将该报销单标记为“不可报销”';
                }
                if (key === 'billable') {
                    return value ? '已将该报销标记为“可计费”' : '将该报销标记为“不可向客户收费”';
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
                    return `将 ${translations.common[key].toLowerCase()} 设置为“${updatedValue}”`;
                }
                return `${translations.common[key].toLowerCase()} 到 “${updatedValue}”`;
            });
            return `通过<a href="${policyRulesRoute}">工作区规则</a>的 ${formatList(fragments)}`;
        },
    },
    transactionMerge: {
        listPage: {
            header: '合并费用',
            noEligibleExpenseFound: '未找到符合条件的报销费用',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>您没有任何可以与此报销合并的报销。<a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">了解详情</a>以查看符合条件的报销。</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `选择一个<a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">符合条件的报销</a>与<strong>${reportName}</strong>合并。`,
        },
        receiptPage: {
            header: '选择收据',
            pageTitle: '请选择要保留的收据：',
        },
        detailsPage: {
            header: '选择明细',
            pageTitle: '选择要保留的详细信息：',
            noDifferences: '未发现交易之间的差异',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? '一个' : 'a';
                return `请选择${article}${field}`;
            },
            pleaseSelectAttendees: '请选择参与者',
            selectAllDetailsError: '在继续之前请选择所有详细信息。',
        },
        confirmationPage: {
            header: '确认详情',
            pageTitle: '确认要保留的详细信息。未保留的详细信息将被删除。',
            confirmButton: '合并费用',
        },
    },
    share: {
        shareToExpensify: '分享到 Expensify',
        messageInputLabel: '消息',
    },
    notificationPreferencesPage: {
        header: '通知偏好设置',
        label: '通知我新消息',
        notificationPreferences: {
            always: '立即',
            daily: '每日',
            mute: '静音',
            hidden: '已隐藏',
        },
    },
    loginField: {
        numberHasNotBeenValidated: '号码尚未验证。点击按钮通过短信重新发送验证链接。',
        emailHasNotBeenValidated: '该邮箱尚未验证。点击按钮通过短信重新发送验证链接。',
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
            `请上传高度大于 ${minHeightInPx} 像素且宽度大于 ${minWidthInPx} 像素，并且高度小于 ${maxHeightInPx} 像素且宽度小于 ${maxWidthInPx} 像素的图片。`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `头像必须是以下类型之一：${allowedExtensions.join(', ')}。`,
    },
    avatarPage: {
        title: '编辑个人头像',
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
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>你</strong>添加报销。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待<strong>${actor}</strong>添加报销。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员添加报销。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>你</strong>提交报销。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待<strong>${actor}</strong>提交报销。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员提交报销。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `无需执行任何进一步操作！`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `于 ${eta}` : ` ${eta}`;
                }
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>您的</strong>报销自动提交${formattedETA}。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待<strong>${actor}</strong>的报销在${formattedETA}自动提交。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员的报销自动提交${formattedETA}。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>你</strong>来修复这些问题。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待<strong>${actor}</strong>修复这些问题。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员修复这些问题。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>你</strong>批准报销。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待<strong>${actor}</strong>批准报销。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员审核报销。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>你</strong>导出此报告。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待 <strong>${actor}</strong> 导出此报表。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员导出此报表。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `正在等待<strong>你</strong>报销费用。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `正在等待 <strong>${actor}</strong> 支付报销。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `正在等待管理员报销费用。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `截至 ${eta}` : ` ${eta}`;
                }
                return `正在等待付款完成${formattedETA}。`;
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_: NextStepParams) =>
                `哎呀！看起来你正在将报销单提交给<strong>自己</strong>。你的工作区<strong>禁止</strong>自行审批报销单。请将此报销单提交给其他人，或联系管理员更改你的提交对象。`,
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: '很快',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '今天稍晚',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '在星期日',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '在每月的1日和16日',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '在本月的最后一个工作日',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '在每月的最后一天',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '在行程结束时',
        },
    },
    profilePage: {
        profile: '个人资料',
        preferredPronouns: '首选代词',
        selectYourPronouns: '选择你的代词',
        selfSelectYourPronoun: '自选您的代词',
        emailAddress: '电子邮箱地址',
        setMyTimezoneAutomatically: '自动设置我的时区',
        timezone: '时区',
        invalidFileMessage: '文件无效。请尝试使用其他图片。',
        avatarUploadFailureMessage: '上传头像时出错。请重试。',
        online: '在线',
        offline: '离线',
        syncing: '正在同步',
        profileAvatar: '个人资料头像',
        publicSection: {
            title: '公开',
            subtitle: '这些详细信息会显示在你的公开个人资料中，任何人都可以看到。',
        },
        privateSection: {
            title: '私人',
            subtitle: '这些信息将用于差旅和付款，不会显示在你的公开资料中。',
        },
    },
    securityPage: {
        title: '安全选项',
        subtitle: '启用两步验证以保护您的账户安全。',
        goToSecurity: '返回安全页面',
    },
    shareCodePage: {
        title: '您的代码',
        subtitle: '通过分享您的个人二维码或推荐链接邀请成员加入 Expensify。',
    },
    pronounsPage: {
        pronouns: '代词',
        isShownOnProfile: '你的代词会显示在你的个人资料中。',
        placeholderText: '搜索以查看选项',
    },
    contacts: {
        contactMethods: '联系方式',
        featureRequiresValidate: '此功能需要你验证你的账户。',
        validateAccount: '验证您的账户',
        helpText: ({email}: {email: string}) =>
            `添加更多登录方式，并向 Expensify 发送收据。<br/><br/>添加电子邮箱地址，以便将收据转发到 <a href="mailto:${email}">${email}</a>，或添加电话号码，以便将收据短信发送到 47777（仅限美国号码）。`,
        pleaseVerify: '请验证此联系方式。',
        getInTouch: '我们将通过此方式联系你。',
        enterMagicCode: (contactMethod: string) => `请输入发送到 ${contactMethod} 的魔法验证码。它应会在一两分钟内送达。`,
        setAsDefault: '设为默认',
        yourDefaultContactMethod: '这是您当前的默认联系方式。在删除它之前，您需要先选择另一种联系方式并点击“设为默认”。',
        removeContactMethod: '移除联系方式',
        removeAreYouSure: '确定要移除此联系方式吗？此操作无法撤销。',
        failedNewContact: '添加此联系方式失败。',
        genericFailureMessages: {
            requestContactMethodValidateCode: '发送新的魔法验证码失败。请稍等片刻后再试。',
            validateSecondaryLogin: '魔法验证码不正确或无效。请重试或请求新验证码。',
            deleteContactMethod: '删除联系方法失败。请联系 Concierge 以获取帮助。',
            setDefaultContactMethod: '设置新的默认联系方式失败。请联系 Concierge 获取帮助。',
            addContactMethod: '添加此联系方式失败。请联系 Concierge 获取帮助。',
            enteredMethodIsAlreadySubmitted: '此联系方法已存在',
            passwordRequired: '需要密码。',
            contactMethodRequired: '联系方式为必填项',
            invalidContactMethod: '联系方式无效',
        },
        newContactMethod: '新联系方式',
        goBackContactMethods: '返回联系方式',
    },
    pronouns: {
        coCos: '公司 / 成本',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: '他 / 他 / 他的',
        heHimHisTheyThemTheirs: '他（He）/ 他（Him）/ 他的（His）/ 他们（They）/ 他们（Them）/ 他们的（Theirs）',
        sheHerHers: '她 / 她 / 她的',
        sheHerHersTheyThemTheirs: 'She / Her / Hers / They / Them / Theirs',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: '每人 / 每人',
        theyThemTheirs: 'TA / 他们（性别中立）',
        thonThons: 'Thon / Thon（复数）',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: '用我的名字叫我',
    },
    displayNamePage: {
        headerTitle: '显示名称',
        isShownOnProfile: '您的显示名称会显示在您的个人资料中。',
    },
    timezonePage: {
        timezone: '时区',
        isShownOnProfile: '您的时区会显示在您的个人资料中。',
        getLocationAutomatically: '自动确定你的位置',
    },
    updateRequiredView: {
        updateRequired: '需要更新',
        pleaseInstall: '请更新到最新版的 New Expensify',
        pleaseInstallExpensifyClassic: '请安装最新版本的 Expensify',
        toGetLatestChanges: '移动端请下载安装最新版本。网页端请刷新浏览器。',
        newAppNotAvailable: '新版 Expensify 应用已不再提供使用。',
    },
    initialSettingsPage: {
        about: '关于',
        aboutPage: {
            description: '全新 Expensify 应用由来自世界各地的开源开发者社区共同构建。欢迎加入我们，一起打造 Expensify 的未来。',
            appDownloadLinks: '应用下载链接',
            viewKeyboardShortcuts: '查看键盘快捷键',
            viewTheCode: '查看代码',
            viewOpenJobs: '查看开放职位',
            reportABug: '报告错误',
            troubleshoot: '故障排除',
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
            clearCacheAndRestart: '清除缓存并重启',
            viewConsole: '查看调试控制台',
            debugConsole: '调试控制台',
            description: '<muted-text>使用下方工具来帮助排查 Expensify 使用体验中的问题。如果遇到任何问题，请<concierge-link>提交错误报告</concierge-link>。</muted-text>',
            confirmResetDescription: '所有未发送的草稿消息都将丢失，但你的其他数据是安全的。',
            resetAndRefresh: '重置并刷新',
            clientSideLogging: '客户端日志',
            noLogsToShare: '没有可共享的日志',
            useProfiling: '使用分析工具',
            profileTrace: '性能分析追踪',
            results: '结果',
            releaseOptions: '发布选项',
            testingPreferences: '测试偏好设置',
            useStagingServer: '使用预发布服务器',
            forceOffline: '强制离线',
            simulatePoorConnection: '模拟网络连接不佳',
            simulateFailingNetworkRequests: '模拟网络请求失败',
            authenticationStatus: '认证状态',
            deviceCredentials: '设备凭证',
            invalidate: '使失效',
            destroy: '销毁',
            maskExportOnyxStateData: '在导出 Onyx 状态时屏蔽敏感成员数据',
            exportOnyxState: '导出 Onyx 状态',
            importOnyxState: '导入 Onyx 状态',
            testCrash: '测试崩溃',
            resetToOriginalState: '重置为原始状态',
            usingImportedState: '您正在使用导入的状态。点此清除。',
            debugMode: '调试模式',
            invalidFile: '文件无效',
            invalidFileDescription: '您尝试导入的文件无效。请重试。',
            invalidateWithDelay: '延迟作废',
            leftHandNavCache: '左侧导航缓存',
            clearleftHandNavCache: '清除',
            recordTroubleshootData: '记录故障排查数据',
            softKillTheApp: '软关闭应用程序',
            kill: '结束',
            sentryDebug: 'Sentry 调试',
            sentryDebugDescription: '将 Sentry 请求记录到控制台',
            sentryHighlightedSpanOps: '高亮的跨度名称',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interaction.click，navigation，ui.load',
        },
        debugConsole: {
            saveLog: '保存日志',
            shareLog: '共享日志',
            enterCommand: '输入命令',
            execute: '执行',
            noLogsAvailable: '暂无日志',
            logSizeTooLarge: ({size}: LogSizeParams) => `日志大小超过 ${size} MB 的限制。请使用“保存日志”来下载日志文件。`,
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
        whatIsNew: '最新功能',
        accountSettings: '账户设置',
        account: '账户',
        general: '常规',
    },
    closeAccountPage: {
        closeAccount: '关闭账户',
        reasonForLeavingPrompt: '我们很不舍得你离开！可以告诉我们原因吗，以便我们改进？',
        enterMessageHere: '在此输入消息',
        closeAccountWarning: '关闭您的账户后将无法恢复。',
        closeAccountPermanentlyDeleteData: '确定要删除你的账户吗？这将永久删除所有未处理的报销。',
        enterDefaultContactToConfirm: '请输入您的默认联系方式以确认您希望关闭账户。您的默认联系方式是：',
        enterDefaultContact: '输入你的默认联系方式',
        defaultContact: '默认联系方法：',
        enterYourDefaultContactMethod: '请输入您的默认联系方式以关闭您的账户。',
    },
    mergeAccountsPage: {
        mergeAccount: '合并账户',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `输入要合并到 <strong>${login}</strong> 的账户。`,
            notReversibleConsent: '我明白此操作不可撤销',
        },
        accountValidate: {
            confirmMerge: '确定要合并账户吗？',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) => `合并您的账户是不可逆的，并且会导致<strong>${login}</strong>的所有未提交报销被清除。`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `要继续，请输入发送到 <strong>${login}</strong> 的魔法验证码。`,
            errors: {
                incorrectMagicCode: '魔法验证码不正确或无效。请重试或请求新验证码。',
                fallback: '出现问题。请稍后再试。',
            },
        },
        mergeSuccess: {
            accountsMerged: '账户已合并！',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>您已成功将所有数据从 <strong>${from}</strong> 合并到 <strong>${to}</strong>。今后，您可以使用任一登录方式访问此账户。</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '我们正在处理此事',
            limitedSupport: '我们目前尚未在新版 Expensify 中支持合并账户。请改在 Expensify Classic 中执行此操作。',
            reachOutForHelp: '<muted-text><centered-text>如有任何疑问，欢迎<concierge-link>联系 Concierge</concierge-link>！</centered-text></muted-text>',
            goToExpensifyClassic: '前往 Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>您无法合并 <strong>${email}</strong>，因为它由 <strong>${email.split('@').at(1) ?? ''}</strong> 控制。请<concierge-link>联系 Concierge</concierge-link>获取帮助。</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>你无法将<strong>${email}</strong>合并到其他账户中，因为你的域管理员已将其设置为你的主登录账号。请改为将其他账户合并到此账号中。</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>你无法合并账户，因为 <strong>${email}</strong> 已启用双重身份验证（2FA）。请先为 <strong>${email}</strong> 禁用 2FA，然后重试。</centered-text></muted-text>`,
            learnMore: '详细了解如何合并账户。',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>无法合并<strong>${email}</strong>，因为它已被锁定。请<concierge-link>联系 Concierge</concierge-link>以获取帮助。</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>您无法合并账户，因为 <strong>${email}</strong> 还没有 Expensify 账户。请改为<a href="${contactMethodLink}">将其添加为联系方式</a>。</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>您无法将<strong>${email}</strong>合并到其他账户中。请将其他账户合并到此账户中。</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>您无法将其他账户合并到<strong>${email}</strong>，因为此账户拥有一条已开具发票的计费关系。</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '请稍后重试',
            description: '合并账户的尝试次数过多。请稍后再试。',
        },
        mergeFailureUnvalidatedAccount: {
            description: '由于此账号尚未验证，您无法将其与其他账号合并。请先验证该账号，然后重试。',
        },
        mergeFailureSelfMerge: {
            description: '您不能将一个账户与其自身合并。',
        },
        mergeFailureGenericHeading: '无法合并账户',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '举报可疑活动',
        lockAccount: '锁定账户',
        unlockAccount: '解锁账户',
        compromisedDescription: '发现账户有异常？提交报告后会立即锁定您的账户、阻止新的 Expensify Card 交易，并禁止进行任何账户更改。',
        domainAdminsDescription: '针对域管理员：这也会暂停您域内所有 Expensify Card 的活动和管理员操作。',
        areYouSure: '您确定要锁定您的 Expensify 账户吗？',
        onceLocked: '锁定后，在解锁请求提交并完成安全审查之前，您的账户将受到限制',
    },
    failedToLockAccountPage: {
        failedToLockAccount: '无法锁定账户',
        failedToLockAccountDescription: `我们无法锁定您的账户。请与 Concierge 聊天以解决此问题。`,
        chatWithConcierge: '与 Concierge 聊天',
    },
    unlockAccountPage: {
        accountLocked: '账户已锁定',
        yourAccountIsLocked: '你的账户已被锁定',
        chatToConciergeToUnlock: '与 Concierge 聊天以解决安全问题并解锁你的账户。',
        chatWithConcierge: '与 Concierge 聊天',
    },
    twoFactorAuth: {
        headerTitle: '双重身份验证',
        twoFactorAuthEnabled: '已启用双重身份验证',
        whatIsTwoFactorAuth: '双重身份验证（2FA）有助于保护您的账户安全。登录时，您需要输入由首选身份验证器应用生成的验证码。',
        disableTwoFactorAuth: '禁用双重身份验证',
        explainProcessToRemove: '若要停用双重身份验证（2FA），请在下方输入来自验证应用的有效验证码。',
        explainProcessToRemoveWithRecovery: '要停用双重认证（2FA），请输入有效的恢复代码。',
        disabled: '两步验证已停用',
        noAuthenticatorApp: '您登录 Expensify 时将不再需要使用验证器应用程序。',
        stepCodes: '恢复代码',
        keepCodesSafe: '请妥善保管这些恢复代码！',
        codesLoseAccess: dedent(`
            如果你无法使用身份验证器应用且没有这些代码，你将无法访问你的账户。

            注意：启用双重身份验证后，你将在其他所有活跃会话中被登出。
        `),
        errorStepCodes: '在继续之前请先复制或下载这些代码',
        stepVerify: '验证',
        scanCode: '使用你的扫码二维码',
        authenticatorApp: '身份验证器应用',
        addKey: '或者将此密钥添加到你的身份验证器应用：',
        enterCode: '然后输入由您的身份验证器应用生成的六位数代码。',
        stepSuccess: '已完成',
        enabled: '已启用双重身份验证',
        congrats: '恭喜！现在你已获得额外的安全保护。',
        copy: '复制',
        disable: '禁用',
        enableTwoFactorAuth: '启用双重身份验证',
        pleaseEnableTwoFactorAuth: '请启用双重身份验证。',
        twoFactorAuthIsRequiredDescription: '出于安全考虑，Xero 要求启用双重身份验证才能连接该集成。',
        twoFactorAuthIsRequiredForAdminsHeader: '需要启用双重身份验证',
        twoFactorAuthIsRequiredForAdminsTitle: '请启用双重身份验证',
        twoFactorAuthIsRequiredXero: '您的 Xero 会计连接需要启用双重身份验证。',
        twoFactorAuthIsRequiredCompany: '您的公司要求启用双重身份验证。',
        twoFactorAuthCannotDisable: '无法禁用双重身份验证',
        twoFactorAuthRequired: '您的 Xero 连接需要启用双重身份验证（2FA），且无法将其禁用。',
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
        personalNoteMessage: '在这里记录本次聊天的备注。只有你可以添加、编辑或查看这些备注。',
        sharedNoteMessage: '在此记录关于此聊天的备注。Expensify 员工和 team.expensify.com 域中的其他成员都可以查看这些备注。',
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
        changePaymentCurrency: '更改付款币种',
        paymentCurrency: '付款币种',
        paymentCurrencyDescription: '选择一种标准货币，用于转换所有个人报销费用',
        note: `注意：更改您的付款货币可能会影响您为 Expensify 支付的金额。有关完整详情，请参阅我们的<a href="${CONST.PRICING}">定价页面</a>。`,
    },
    addDebitCardPage: {
        addADebitCard: '添加借记卡',
        nameOnCard: '卡片上的姓名',
        debitCardNumber: '借记卡号',
        expiration: '到期日期',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: '账单地址',
        growlMessageOnSave: '您的借记卡已成功添加',
        expensifyPassword: 'Expensify 密码',
        error: {
            invalidName: '姓名只能包含字母',
            addressZipCode: '请输入有效的邮政编码',
            debitCardNumber: '请输入有效的借记卡号',
            expirationDate: '请选择有效的到期日期',
            securityCode: '请输入有效的安全码',
            addressStreet: '请输入一个不是邮政信箱的有效账单地址',
            addressState: '请选择一个州',
            addressCity: '请输入城市',
            genericFailureMessage: '添加您的卡片时出错。请重试。',
            password: '请输入您的 Expensify 密码',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '添加付款卡',
        nameOnCard: '卡片上的姓名',
        paymentCardNumber: '卡号',
        expiration: '到期日期',
        expirationDate: 'MM/YY',
        cvv: 'CVV',
        billingAddress: '账单地址',
        growlMessageOnSave: '您的支付卡已成功添加',
        expensifyPassword: 'Expensify 密码',
        error: {
            invalidName: '姓名只能包含字母',
            addressZipCode: '请输入有效的邮政编码',
            paymentCardNumber: '请输入有效的卡号',
            expirationDate: '请选择有效的到期日期',
            securityCode: '请输入有效的安全码',
            addressStreet: '请输入一个不是邮政信箱的有效账单地址',
            addressState: '请选择一个州',
            addressCity: '请输入城市',
            genericFailureMessage: '添加您的卡片时出错。请重试。',
            password: '请输入您的 Expensify 密码',
        },
    },
    walletPage: {
        balance: '余额',
        paymentMethodsTitle: '付款方式',
        setDefaultConfirmation: '设为默认支付方式',
        setDefaultSuccess: '已设置默认付款方式！',
        deleteAccount: '删除账户',
        deleteConfirmation: '确定要删除此账户吗？',
        deleteCard: '删除卡片',
        deleteCardConfirmation: '所有未提交的卡片交易（包括未关闭报表中的交易）都将被移除。确定要删除此卡片吗？此操作无法撤销。',
        error: {
            notOwnerOfBankAccount: '将此银行账户设为您的默认付款方式时出错',
            invalidBankAccount: '此银行账户已被暂时停用',
            notOwnerOfFund: '将此卡设为您的默认支付方式时出错',
            setDefaultFailure: '出现问题。请与 Concierge 聊天以获取进一步帮助。',
        },
        addBankAccountFailure: '尝试添加您的银行账户时发生意外错误。请重试。',
        getPaidFaster: '更快收款',
        addPaymentMethod: '添加付款方式，以便在应用中直接发送和接收付款。',
        getPaidBackFaster: '更快拿回报销款',
        secureAccessToYourMoney: '安全访问您的资金',
        receiveMoney: '以本地货币收款',
        expensifyWallet: 'Expensify 钱包（测试版）',
        sendAndReceiveMoney: '与朋友相互收付款。仅限美国银行账户。',
        enableWallet: '启用钱包',
        addBankAccountToSendAndReceive: '添加银行账户以进行收付款。',
        addDebitOrCreditCard: '添加借记卡或信用卡',
        assignedCards: '已分配的卡片',
        assignedCardsDescription: '这些卡的交易会自动同步。',
        expensifyCard: 'Expensify 卡',
        walletActivationPending: '我们正在审核您的信息。请几分钟后再回来查看！',
        walletActivationFailed: '很抱歉，您的钱包目前无法启用。请与 Concierge 聊天以获得进一步帮助。',
        addYourBankAccount: '添加你的银行账户',
        addBankAccountBody: '让我们将你的银行账户连接到 Expensify，这样你就可以更轻松地在应用中直接发送和接收付款。',
        chooseYourBankAccount: '选择你的银行账户',
        chooseAccountBody: '请确保选择正确的选项。',
        confirmYourBankAccount: '确认您的银行账户',
        personalBankAccounts: '个人银行账户',
        businessBankAccounts: '企业银行账户',
        shareBankAccount: '共享银行账户',
        bankAccountShared: '已共享银行账户',
        shareBankAccountTitle: '选择要与其共享此银行账户的管理员：',
        shareBankAccountSuccess: '银行账户已共享！',
        shareBankAccountSuccessDescription: '被选中的管理员将收到来自 Concierge 的确认消息。',
        shareBankAccountFailure: '在尝试共享银行账户时发生意外错误。请重试。',
        shareBankAccountEmptyTitle: '没有可用管理员',
        shareBankAccountEmptyDescription: '当前没有可与你共享此银行账户的工作区管理员。',
        shareBankAccountNoAdminsSelected: '继续之前请选择管理员',
        unshareBankAccount: '取消共享银行账户',
        unshareBankAccountDescription: '以下所有人都可以访问此银行账户。您可随时移除他们的访问权限。我们仍会完成任何正在处理中的付款。',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} 将失去对此企业银行账户的访问权限。我们仍会完成任何正在处理中 的付款。`,
        reachOutForHelp: '它正在与 Expensify Card 一起使用。若需取消共享，请<concierge-link>联系 Concierge</concierge-link>。',
        unshareErrorModalTitle: '无法取消共享银行账户',
    },
    cardPage: {
        expensifyCard: 'Expensify 卡',
        expensifyTravelCard: 'Expensify 差旅卡',
        availableSpend: '剩余额度',
        smartLimit: {
            name: '智能限额',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `您可以在此卡上花费最多 ${formattedLimit}，当您提交的报销被批准后，该额度将会重置。`,
        },
        fixedLimit: {
            name: '固定限额',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `您可以在此卡上消费最高 ${formattedLimit}，之后该卡将被停用。`,
        },
        monthlyLimit: {
            name: '月度限额',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `您每月最多可在此卡上消费 ${formattedLimit}。该限额将在每个日历月的第 1 天重置。`,
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
        suspiciousBannerDescription: '我们发现您的银行卡上有可疑交易。请点击下方进行查看。',
        cardLocked: '在我们团队审核你公司账户期间，你的卡已被暂时锁定。',
        markTransactionsAsReimbursable: '将交易标记为可报销',
        markTransactionsDescription: '启用后，从此卡导入的交易将默认标记为可报销。',
        csvCardDescription: 'CSV 导入',
        cardDetails: {
            cardNumber: '虚拟卡号',
            expiration: '到期日期',
            cvv: 'CVV',
            address: '地址',
            revealDetails: '显示详情',
            revealCvv: '显示 CVV',
            copyCardNumber: '复制卡号',
            updateAddress: '更新地址',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `已添加到 ${platform} 钱包`,
        cardDetailsLoadingFailure: '加载卡片详情时出错。请检查您的互联网连接，然后重试。',
        validateCardTitle: '让我们确认是你本人',
        enterMagicCode: (contactMethod: string) => `请输入发送到 ${contactMethod} 的魔法验证码以查看您的卡片详情。验证码应会在一两分钟内送达。`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `请先<a href="${missingDetailsLink}">添加您的个人信息</a>，然后重试。`,
        unexpectedError: '获取你的 Expensify 卡详情时出错。请重试。',
        cardFraudAlert: {
            confirmButtonText: '是的，我愿意',
            reportFraudButtonText: '不，这不是我',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `已清除可疑活动并重新激活卡片 x${cardLastFour}。一切就绪，继续报销吧！`,
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
    },
    workflowsPage: {
        workflowTitle: '支出',
        workflowDescription: '从支出发生的那一刻起配置完整的工作流，包括审批和付款。',
        submissionFrequency: '提交',
        submissionFrequencyDescription: '选择自定义报销提交时间表。',
        submissionFrequencyDateOfMonth: '日期（每月）',
        disableApprovalPromptDescription: '禁用审批将清除所有现有的审批流程。',
        addApprovalsTitle: '审批',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `来自${members}的报销，审批人为${approvers}`,
        addApprovalButton: '添加审批流程',
        addApprovalTip: '除非存在更具体的工作流，否则此默认工作流适用于所有成员。',
        approver: '审批人',
        addApprovalsDescription: '在授权付款前需要额外审批。',
        makeOrTrackPaymentsTitle: '付款',
        makeOrTrackPaymentsDescription: '为在 Expensify 中进行的付款添加一名授权付款人，或跟踪在其他地方完成的付款。',
        customApprovalWorkflowEnabled:
            '<muted-text-label>此工作区已启用自定义审批流程。若要查看或更改此流程，请联系您的<account-manager-link>客户经理</account-manager-link>或<concierge-link>Concierge</concierge-link>。</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>此工作区已启用自定义审批流程。若要查看或更改此流程，请联系<concierge-link>Concierge</concierge-link>。</muted-text-label>',
        editor: {
            submissionFrequency: '选择在分享无错误支出前，Expensify 应等待多长时间。',
        },
        frequencyDescription: '选择自动提交报销的频率，或改为手动提交',
        frequencies: {
            instant: '立即',
            weekly: '每周',
            monthly: '每月',
            twiceAMonth: '每月两次',
            byTrip: '按行程',
            manually: '手动',
            daily: '每日',
            lastDayOfMonth: '每月的最后一天',
            lastBusinessDayOfMonth: '每月最后一个工作日',
            ordinals: {
                one: '第st级',
                two: 'nd',
                few: '路右侧',
                other: '第',
                '1': '第一',
                '2': '秒',
                '3': '第三',
                '4': '第四',
                '5': '第五',
                '6': '第六',
                '7': '第七',
                '8': '第八',
                '9': '第九',
                '10': '第十',
            },
        },
        approverInMultipleWorkflows: '该成员已属于另一个审批流程。此处所做的任何更新也会在那边生效。',
        approverCircularReference: (name1: string, name2: string) => `<strong>${name1}</strong> 已经将报销单提交给 <strong>${name2}</strong> 审批。请选择其他审批人以避免形成循环流程。`,
        emptyContent: {
            title: '没有可显示的成员',
            expensesFromSubtitle: '所有工作区成员都已属于一个现有的审批流程。',
            approverSubtitle: '所有审批人都属于一个现有的工作流。',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: '提交频率无法更改。请重试或联系支持。',
        monthlyOffsetErrorMessage: '无法更改月度频率。请重试或联系支持。',
    },
    workflowsCreateApprovalsPage: {
        title: '确认',
        header: '添加更多审批人并确认。',
        additionalApprover: '附加审批人',
        submitButton: '添加工作流程',
    },
    workflowsEditApprovalsPage: {
        title: '编辑审批流程',
        deleteTitle: '删除审批工作流',
        deletePrompt: '确定要删除此审批流程吗？所有成员之后将改用默认流程。',
    },
    workflowsExpensesFromPage: {
        title: '报销单起始日期',
        header: '当以下成员提交报销时：',
    },
    workflowsApproverPage: {
        genericErrorMessage: '无法更改审批人。请重试或联系支持。',
        title: '设置审批人',
        description: '此人将审批这些报销。',
    },
    workflowsApprovalLimitPage: {
        title: '审批人',
        header: '（可选）想要添加审批上限吗？',
        description: ({approverName}: {approverName: string}) =>
            approverName ? `当<strong>${approverName}</strong>是审批人且报销单金额超过以下数额时，添加另一位审批人：` : '当报销单金额超过以下数额时，添加另一位审批人：',
        reportAmountLabel: '报表金额',
        additionalApproverLabel: '附加审批人',
        skip: '跳过',
        next: '下一步',
        removeLimit: '移除限额',
        enterAmountError: '请输入有效金额',
        enterApproverError: '设置报销限额时必须指定审批人',
        enterBothError: '输入报表金额和额外审批人',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `超过 ${approvalLimit} 的报告将转交给 ${approverName}`,
    },
    workflowsPayerPage: {
        title: '授权付款人',
        genericErrorMessage: '无法更改授权付款人。请重试。',
        admins: '管理员',
        payer: '付款人',
        paymentAccount: '付款账户',
    },
    reportFraudPage: {
        title: '报告虚拟卡欺诈',
        description: '如果您的虚拟卡信息被盗用或泄露，我们会永久停用您现有的虚拟卡，并为您提供一张新的虚拟卡及卡号。',
        deactivateCard: '停用卡片',
        reportVirtualCardFraud: '报告虚拟卡欺诈',
    },
    reportFraudConfirmationPage: {
        title: '已报告卡片欺诈',
        description: '我们已永久停用你现有的卡片。当你返回查看卡片详情时，你将会有一张新的虚拟卡可用。',
        buttonText: '明白了，谢谢！',
    },
    activateCardPage: {
        activateCard: '激活卡片',
        pleaseEnterLastFour: '请输入您银行卡的后四位数字。',
        activatePhysicalCard: '激活实体卡',
        error: {
            thatDidNotMatch: '这与您卡片的最后 4 位数字不匹配。请重试。',
            throttled: '您多次错误输入 Expensify Card 的后四位数字。如果您确认数字正确，请联系 Concierge 解决。否则，请稍后再试。',
        },
    },
    getPhysicalCard: {
        header: '获取实体卡',
        nameMessage: '请输入您的名字和姓氏，这些信息将显示在您的卡片上。',
        legalName: '法定姓名',
        legalFirstName: '法定名字',
        legalLastName: '法定姓氏',
        phoneMessage: '请输入您的手机号。',
        phoneNumber: '电话号码',
        address: '地址',
        addressMessage: '请输入您的收货地址。',
        streetAddress: '街道地址',
        city: '城市',
        state: '州',
        zipPostcode: '邮编',
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
        ach: '1-3 个工作日（银行账户）',
        achSummary: '无费用',
        whichAccount: '哪个账户？',
        fee: '费用',
        transferSuccess: '转账成功！',
        transferDetailBankAccount: '您的款项预计将在接下来的 1–3 个工作日内到账。',
        transferDetailDebitCard: '您的款项应会立即到账。',
        failedTransfer: '您的余额尚未全部结清。请转账至银行账户。',
        notHereSubTitle: '请在钱包页面转出您的余额',
        goToWallet: '前往钱包',
    },
    chooseTransferAccountPage: {
        chooseAccount: '选择账户',
    },
    paymentMethodList: {
        addPaymentMethod: '添加付款方式',
        addNewDebitCard: '添加新的借记卡',
        addNewBankAccount: '添加新银行账户',
        accountLastFour: '尾号为',
        cardLastFour: '卡号末尾为',
        addFirstPaymentMethod: '添加付款方式，以便在应用中直接发送和接收付款。',
        defaultPaymentMethod: '默认',
        bankAccountLastFour: (lastFour: string) => `银行账户 • ${lastFour}`,
    },
    expenseRulesPage: {
        title: '报销规则',
        subtitle: '这些规则将适用于你的报销。如果你提交到某个工作区，则该工作区的规则可能会覆盖这些规则。',
        findRule: '查找规则',
        emptyRules: {
            title: '您尚未创建任何规则',
            subtitle: '添加规则以自动化报销报告。',
        },
        changes: {
            billableUpdate: (value: boolean) => `更新报销 ${value ? '可计费' : '不可计费'}`,
            categoryUpdate: (value: string) => `将类别更新为“${value}”`,
            commentUpdate: (value: string) => `将描述更新为“${value}”`,
            merchantUpdate: (value: string) => `将商家更新为“${value}”`,
            reimbursableUpdate: (value: boolean) => `更新报销 ${value ? '可报销' : '不可报销'}`,
            tagUpdate: (value: string) => `将标签更新为 “${value}”`,
            taxUpdate: (value: string) => `将税率更新为“${value}”`,
            billable: (value: boolean) => `报销 ${value ? '可计费' : '不可计费'}`,
            category: (value: string) => `类别为“${value}”`,
            comment: (value: string) => `描述为“${value}”`,
            merchant: (value: string) => `商户为“${value}”`,
            reimbursable: (value: boolean) => `报销 ${value ? '可报销' : '不可报销'}`,
            tag: (value: string) => `标记为“${value}”`,
            tax: (value: string) => `税率为“${value}”`,
            report: (value: string) => `添加到名为“${value}”的报表`,
        },
        newRule: '新规则',
        addRule: {
            title: '添加规则',
            expenseContains: '如果报销包含：',
            applyUpdates: '然后应用以下更新：',
            merchantHint: '输入 . 以创建适用于所有商家的规则',
            addToReport: '添加到报表，名称为',
            createReport: '如有需要则创建报表',
            applyToExistingExpenses: '应用到已有的匹配报销费用',
            confirmError: '输入商家并至少应用一项更新',
            confirmErrorMerchant: '请输入商户',
            confirmErrorUpdate: '请至少应用一次更新',
            saveRule: '保存规则',
        },
        editRule: {
            title: '编辑规则',
        },
        deleteRule: {
            deleteSingle: '删除规则',
            deleteMultiple: '删除规则',
            deleteSinglePrompt: '确定要删除此规则吗？',
            deleteMultiplePrompt: '确定要删除这些规则吗？',
        },
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
        explainerText: '选择仅#focus在未读和已置顶的聊天，或显示所有聊天，并将最新和已置顶的聊天置于顶部。',
        priorityModes: {
            default: {
                label: '最新',
                description: '按最新排序显示所有聊天',
            },
            gsd: {
                label: '#focus',
                description: '仅按字母顺序显示未读',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `在 ${policyName} 中`,
        generatingPDF: '生成 PDF',
        waitForPDF: '请稍候，我们正在生成 PDF。',
        errorPDF: '尝试生成您的 PDF 时出错',
        successPDF: '您的 PDF 已生成！如果没有自动下载，请使用下面的按钮。',
    },
    reportDescriptionPage: {
        roomDescription: '房间描述',
        roomDescriptionOptional: '房间描述（可选）',
        explainerText: '为该房间设置自定义描述。',
    },
    groupChat: {
        lastMemberTitle: '注意！',
        lastMemberWarning: '由于你是此处最后一位成员，一旦离开，所有成员都将无法再访问此聊天。确定要离开吗？',
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
        chooseThemeBelowOrSync: '选择下面的主题，或与您的设备设置同步。',
    },
    termsOfUse: {
        terms: `<muted-text-xs>登录即表示你同意<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">服务条款</a>和<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">隐私政策</a>。</muted-text-xs>`,
        license: `<muted-text-xs>资金传输服务由 ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}（NMLS ID:2017010）根据其<a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">许可证</a>提供。</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: '没有收到魔法验证码？',
        enterAuthenticatorCode: '请输入您的验证器代码',
        enterRecoveryCode: '请输入您的恢复代码',
        requiredWhen2FAEnabled: '启用双重验证时必填',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `在<a>${timeRemaining}</a>后请求新验证码`,
        requestNewCodeAfterErrorOccurred: '请求新验证码',
        error: {
            pleaseFillMagicCode: '请输入您的魔法验证码',
            incorrectMagicCode: '魔法验证码不正确或无效。请重试或请求新验证码。',
            pleaseFillTwoFactorAuth: '请输入您的双重身份验证代码',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: '请填写所有字段',
        pleaseFillPassword: '请输入您的密码',
        pleaseFillTwoFactorAuth: '请输入您的双重验证代码',
        enterYourTwoFactorAuthenticationCodeToContinue: '请输入您的双重验证代码以继续',
        forgot: '忘记了？',
        requiredWhen2FAEnabled: '启用双重验证时必填',
        error: {
            incorrectPassword: '密码错误。请重试。',
            incorrectLoginOrPassword: '登录名或密码不正确。请重试。',
            incorrect2fa: '两步验证代码不正确。请重试。',
            twoFactorAuthenticationEnabled: '此账户已启用双重身份验证（2FA）。请使用您的邮箱或电话号码登录。',
            invalidLoginOrPassword: '登录名或密码无效。请重试或重置密码。',
            unableToResetPassword:
                '我们无法更改您的密码。这很可能是因为您在旧的密码重置邮件中使用的密码重置链接已过期。我们已向您发送了新的链接，您可以再试一次。请检查您的收件箱和垃圾邮件文件夹；新邮件应会在几分钟内送达。',
            noAccess: '您无权访问此应用程序。请添加您的 GitHub 用户名以获得访问权限。',
            accountLocked: '由于多次尝试失败，您的账户已被锁定。请在 1 小时后重试。',
            fallback: '出现问题。请稍后再试。',
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
        welcomeSignOffTitleManageTeam: '完成以上任务后，我们就可以探索更多功能，例如审批流程和规则！',
        welcomeSignOffTitle: '很高兴见到你！',
        explanationModal: {
            title: '欢迎使用 Expensify',
            description: '一款应用，以聊天般的速度处理您的商务和个人支出。试用一下并告诉我们您的想法。更多精彩功能即将推出！',
            secondaryDescription: '若要切换回 Expensify Classic，只需点击你的个人头像 > 前往 Expensify Classic。',
        },
        getStarted: '开始使用',
        whatsYourName: '你叫什么名字？',
        peopleYouMayKnow: '你可能认识的人已经在这里了！验证你的邮箱以加入他们。',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `${domain} 中的某位成员已经创建了一个工作区。请输入发送到 ${email} 的魔法验证码。`,
        joinAWorkspace: '加入工作区',
        listOfWorkspaces: '以下是你可以加入的工作区列表。别担心，如果你愿意，也可以稍后再加入。',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} 名成员${employeeCount > 1 ? '秒' : ''} • ${policyOwner}`,
        whereYouWork: '你在哪里工作？',
        errorSelection: '选择一个选项以继续',
        purpose: {
            title: '你今天想做什么？',
            errorContinue: '请点击“继续”完成设置',
            errorBackButton: '请完成设置问题以开始使用此应用程序',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '从雇主那里报销',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: '管理我团队的报销费用',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '跟踪并预算费用',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '与朋友聊天并分摊费用',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: '其他原因',
        },
        employees: {
            title: '您有多少名员工？',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 名员工',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11–50 名员工',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 名员工',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101–1,000 名员工',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '超过 1,000 名员工',
        },
        accounting: {
            title: '你使用任何会计软件吗？',
            none: '无',
        },
        interestedFeatures: {
            title: '您对哪些功能感兴趣？',
            featuresAlreadyEnabled: '以下是我们最受欢迎的功能：',
            featureYouMayBeInterestedIn: '启用更多功能：',
        },
        error: {
            requiredFirstName: '请输入您的名字以继续',
        },
        workEmail: {
            title: '你的工作邮箱是什么？',
            subtitle: '连接工作邮箱可让 Expensify 发挥最佳效果。',
            explanationModal: {
                descriptionOne: '转发到 receipts@expensify.com 进行扫描',
                descriptionTwo: '加入已经在使用 Expensify 的同事',
                descriptionThree: '享受更个性化的体验',
            },
            addWorkEmail: '添加工作邮箱',
        },
        workEmailValidation: {
            title: '验证你的工作邮箱',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `请输入发送到 ${workEmail} 的验证码。邮件应会在一两分钟内送达。`,
        },
        workEmailValidationError: {
            publicEmail: '请输入来自私有域的有效工作邮箱，例如：mitch@company.com',
            offline: '由于您似乎处于离线状态，我们无法添加您的工作邮箱',
        },
        mergeBlockScreen: {
            title: '无法添加工作邮箱',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) => `我们无法添加 ${workEmail}。请稍后在“设置”中重试，或与 Concierge 聊天以获取指导。`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `进行[试用](${testDriveURL})`,
                description: ({testDriveURL}) => `[快速体验产品](${testDriveURL})，看看为什么 Expensify 是处理报销最快的方式。`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `进行[试用](${testDriveURL})`,
                description: ({testDriveURL}) => `点击[试用](${testDriveURL})，让您的团队享受 *3 个月免费使用 Expensify！*`,
            },
            addExpenseApprovalsTask: {
                title: '添加报销审批',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *添加报销审批*，以便审核团队支出并对其进行管控。

                        操作步骤：

                        1. 前往 *工作区*。
                        2. 选择你的工作区。
                        3. 点击 *更多功能*。
                        4. 启用 *工作流*。
                        5. 在工作区编辑器中前往 *工作流*。
                        6. 启用 *审批*。
                        7. 你将被设置为报销审批人。邀请团队后，你可以将审批人更改为任意管理员。

                        [带我前往更多功能](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[创建](${workspaceConfirmationLink}) 一个工作区`,
                description: '在设置专员的协助下创建工作区并配置相关设置！',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `创建一个[工作区](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *创建一个工作区* 来跟踪报销、扫描收据、聊天等。

                        1. 点击 *工作区* > *新建工作区*。

                        *你的新工作区已准备就绪！* [去查看](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `设置[类别](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *设置类别*，让你的团队可以为报销分类，方便生成报表。

                        1. 点击 *工作区*。
                        2. 选择你的工作区。
                        3. 点击 *类别*。
                        4. 关闭所有不需要的类别。
                        5. 在右上角添加你自己的类别。

                        [前往工作区类别设置](${workspaceCategoriesLink})。

                        ![设置类别](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: '提交报销',
                description: dedent(`
                    通过输入金额或扫描收据来*提交报销*。

                    1. 点击 ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} 按钮。
                    2. 选择*创建报销*。
                    3. 输入金额或扫描收据。
                    4. 添加你上司的邮箱或电话号码。
                    5. 点击*创建*。

                    就完成了！
                `),
            },
            adminSubmitExpenseTask: {
                title: '提交报销',
                description: dedent(`
                    通过输入金额或扫描收据来*提交一笔报销*。

                    1. 点击 ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} 按钮。
                    2. 选择 *创建报销*。
                    3. 输入金额或扫描收据。
                    4. 确认详情。
                    5. 点击 *创建*。

                    完成！
                `),
            },
            trackExpenseTask: {
                title: '记录一笔报销',
                description: dedent(`
                    *记录报销*可以使用任何货币，无论有没有收据。

                    1. 点击 ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} 按钮。
                    2. 选择 *创建报销*。
                    3. 输入金额或扫描收据。
                    4. 选择你的*个人*空间。
                    5. 点击 *创建*。

                    就这样！真的就是这么简单。
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `连接${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : '到'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '你的' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        连接 ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '你的' : '到'} ${integrationName}，实现自动费用编码和同步，让月末关账变得轻而易举。

                        1. 点击 *Workspaces*。
                        2. 选择你的工作区。
                        3. 点击 *Accounting*。
                        4. 找到 ${integrationName}。
                        5. 点击 *Connect*。

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? `[带我前往会计页面](${workspaceAccountingLink}).

                        ![连接到 ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
        : `[带我前往会计页面](${workspaceAccountingLink})。`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `连接[您的公司卡](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        连接你现有的卡片，以自动导入交易、匹配收据和进行对账。

                        1. 点击 *工作区*。
                        2. 选择你的工作区。
                        3. 点击 *公司卡*。
                        4. 按提示连接你的卡片。

                        [带我前往公司卡](${corporateCardLink})。`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `邀请[你的团队](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *邀请你的团队*加入 Expensify，这样他们今天就可以开始追踪报销费用。

                        1. 点击 *工作区*。
                        2. 选择你的工作区。
                        3. 点击 *成员* > *邀请成员*。
                        4. 输入邮箱或电话号码。
                        5. 如有需要，可以添加自定义邀请消息！

                        [带我前往工作区成员页面](${workspaceMembersLink})。

                        ![邀请你的团队](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `设置[类别](${workspaceCategoriesLink})和[标签](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *设置类别和标签*，让您的团队可以为报销分类，便于轻松出具报表。

                        通过[连接您的会计软件](${workspaceAccountingLink})自动导入，或在[工作区设置](${workspaceCategoriesLink})中手动设置。`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `设置[标签](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        使用标签添加更多报销详情，例如项目、客户、地点和部门。如果你需要多级标签，可以升级到 Control 方案。

                        1. 点击 *Workspaces*。
                        2. 选择你的工作区。
                        3. 点击 *More features*。
                        4. 启用 *Tags*。
                        5. 在工作区编辑器中进入 *Tags*。
                        6. 点击 *+ Add tag* 创建你自己的标签。

                        [带我前往更多功能](${workspaceMoreFeaturesLink})。

                        ![设置标签](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `邀请你的[会计](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *邀请您的会计师*协作管理您的工作区和业务报销。

                        1. 点击 *工作区*。
                        2. 选择您的工作区。
                        3. 点击 *成员*。
                        4. 点击 *邀请成员*。
                        5. 输入您会计师的邮箱地址。

                        [立即邀请您的会计师](${workspaceMembersLink})。`),
            },
            startChatTask: {
                title: '开始聊天',
                description: dedent(`
                    *发起聊天*，只需使用对方的邮箱或电话号码。

                    1. 点击 ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} 按钮。
                    2. 选择 *发起聊天*。
                    3. 输入邮箱或电话号码。

                    如果他们还未使用 Expensify，我们会自动向他们发送邀请。

                    每次聊天也会同步变成一封电子邮件或短信，他们可以直接回复。
                `),
            },
            splitExpenseTask: {
                title: '拆分报销费用',
                description: dedent(`
                    与一人或多人*分摊报销*。

                    1. 点击 ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} 按钮。
                    2. 选择 *开始聊天*。
                    3. 输入邮箱或电话号码。
                    4. 在聊天中点击灰色 *+* 按钮 > *分摊报销*。
                    5. 通过选择 *手动*、*扫描* 或 *里程* 来创建报销。

                    如果愿意，可以添加更多详情，或者直接发送。让他们尽快把钱还给你！
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `查看你的[工作区设置](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        以下是查看和更新工作区设置的方法：
                        1. 点击“工作区”。
                        2. 选择你的工作区。
                        3. 查看并更新你的设置。
                        [前往你的工作区](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: '创建您的第一份报表',
                description: dedent(`
                    创建报表步骤如下：

                    1. 点击 ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} 按钮。
                    2. 选择 *创建报表*。
                    3. 点击 *添加报销*。
                    4. 添加您的第一笔报销。

                    全部完成！
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `进行[试用](${testDriveURL})` : '试用一下'),
            embeddedDemoIframeTitle: '试用',
            employeeFakeReceipt: {
                description: '我的试驾收据！',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: '拿回报销就像发条消息一样简单。我们先来了解一下基础。',
            onboardingPersonalSpendMessage: '以下是几步点击即可追踪支出的方式。',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # 您的免费试用已开始！让我们为您完成设置。
                        👋 您好，我是您的 Expensify 设置专员。我已经为您创建了一个工作区，帮助管理您团队的收据和报销。为了充分利用这 30 天的免费试用，请按照下方剩余的设置步骤继续操作！
                    `)
                    : dedent(`
                        # 您的免费试用已开始！让我们为您完成设置。
                        👋 你好，我是您的 Expensify 设置专员。现在您已经创建了一个工作区，请按照以下步骤操作，充分利用这 30 天的免费试用期！
                    `),
            onboardingTrackWorkspaceMessage:
                '# 让我们开始为你进行设置\n👋 你好，我是你的 Expensify 设置专员。我已经为你创建了一个用于管理收据和报销的工作区。为充分利用你的 30 天免费试用，请按照下面剩余的设置步骤完成操作！',
            onboardingChatSplitMessage: '和朋友平摊账单就像发消息一样简单。操作方法如下。',
            onboardingAdminMessage: '了解如何作为管理员管理团队工作区，并提交您自己的报销。',
            onboardingLookingAroundMessage: 'Expensify 最广为人知的是报销、差旅和企业卡管理功能，但我们的能力远不止于此。告诉我你感兴趣的内容，我会帮助你开始使用。',
            onboardingTestDriveReceiverMessage: '*你已获得3个月的免费使用期！从下方开始使用吧。*',
        },
        workspace: {
            title: '使用工作区保持井井有条',
            subtitle: '在同一个平台解锁强大工具，轻松简化您的报销管理。通过工作区，您可以：',
            explanationModal: {
                descriptionOne: '跟踪和整理收据',
                descriptionTwo: '分类并标记报销费用',
                descriptionThree: '创建并分享报表',
            },
            price: '免费试用 30 天，然后只需 <strong>$5/用户/月</strong> 即可升级。',
            createWorkspace: '创建工作区',
        },
        confirmWorkspace: {
            title: '确认工作区',
            subtitle: '创建一个工作区，用于跟踪收据、报销费用、管理差旅、生成报表等——一切都能以聊天的速度完成。',
        },
        inviteMembers: {
            title: '邀请成员',
            subtitle: '添加你的团队或邀请你的会计。人越多越热闹！',
        },
    },
    featureTraining: {
        doNotShowAgain: '不再显示此内容',
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: '名称不能包含特殊字符',
            containsReservedWord: '名称不能包含“Expensify”或“Concierge”这两个词',
            hasInvalidCharacter: '名称不能包含逗号或分号',
            requiredFirstName: '名字不能为空',
        },
    },
    privatePersonalDetails: {
        enterLegalName: '您的法定姓名是什么？',
        enterDateOfBirth: '你的出生日期是？',
        enterAddress: '你的地址是什么？',
        enterPhoneNumber: '你的电话号码是多少？',
        personalDetails: '个人信息',
        privateDataMessage: '这些信息将用于出行和付款，不会在你的公开个人资料中显示。',
        legalName: '法定姓名',
        legalFirstName: '法定名字',
        legalLastName: '法定姓氏',
        address: '地址',
        error: {
            dateShouldBeBefore: (dateString: string) => `日期必须早于 ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `日期应晚于 ${dateString}`,
            hasInvalidCharacter: '名称只能包含拉丁字符',
            incorrectZipFormat: (zipFormat?: string) => `邮政编码格式不正确${zipFormat ? `可接受的格式：${zipFormat}` : ''}`,
            invalidPhoneNumber: `请确保电话号码有效（例如：${CONST.EXAMPLE_PHONE_NUMBER}）`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: '链接已重新发送',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) => `我已向 ${login} 发送了一个魔术登录链接。请检查你的 ${loginType} 以登录。`,
        resendLink: '重新发送链接',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) => `要验证 ${secondaryLogin}，请从 ${primaryLogin} 的账户设置中重新发送魔法验证码。`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `如果你已无法访问 ${primaryLogin}，请先取消关联你的账户。`,
        unlink: '取消关联',
        linkSent: '链接已发送！',
        successfullyUnlinkedLogin: '已成功取消关联次要登录！',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) => `由于投递问题，我们的电子邮件服务提供商已暂时停止向 ${login} 发送邮件。要解除您登录的限制，请按以下步骤操作：`,
        confirmThat: (login: string) =>
            `<strong>请确认 ${login} 的拼写正确，并且是一个真实且可接收邮件的邮箱地址。</strong> 类似 “expenses@domain.com” 这样的邮箱别名，必须能够访问其自己的邮箱收件箱，才能作为有效的 Expensify 登录邮箱使用。`,
        ensureYourEmailClient: `<strong>请确保您的电子邮件客户端允许接收来自 expensify.com 的邮件。</strong> 您可以在<a href="${CONST.SET_NOTIFICATION_LINK}">此处</a>找到完成此步骤的说明，但您可能需要 IT 部门协助配置电子邮件设置。`,
        onceTheAbove: `完成以上步骤后，请联系 <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> 以解除您的登录限制。`,
    },
    openAppFailureModal: {
        title: '出现了一些问题…',
        subtitle: `我们尚未能够加载您的全部数据。我们已收到通知并正在调查此问题。如果问题仍然存在，请联系`,
        refreshAndTryAgain: '刷新后重试',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) => `我们一直无法向 ${login} 发送短信，因此已暂时停用该号码。请尝试验证你的号码：`,
        validationSuccess: '您的号码已验证！点击下方发送新的魔术登录验证码。',
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
                return '请稍等片刻后再试。';
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
            return `请稍等！在再次尝试验证您的号码前，您需要等待 ${timeText}。`;
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
        year: '年份',
        selectYear: '请选择年份',
    },
    focusModeUpdateModal: {
        title: '欢迎进入 #focus 模式！',
        prompt: (priorityModePageUrl: string) => `通过只查看未读聊天或需要你关注的聊天，随时掌握一切进展。别担心，你可以随时在<a href="${priorityModePageUrl}">设置</a>中更改此项。`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: '找不到您要查找的聊天。',
        getMeOutOfHere: '带我离开这里',
        iouReportNotFound: '找不到您要查看的付款详情。',
        notHere: '嗯……它不在这里',
        pageNotFound: '哎呀，无法找到此页面',
        noAccess: '此聊天或报销可能已被删除，或者您无权访问。\n\n如有任何疑问，请联系 concierge@expensify.com',
        goBackHome: '返回首页',
        commentYouLookingForCannotBeFound: '无法找到您要查找的评论。',
        goToChatInstead: '请改为前往聊天室。',
        contactConcierge: '如有任何问题，请联系 concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `糟糕… ${isBreakLine ? '\n' : ''}出错了`,
        subtitle: '您的请求未能完成。请稍后再试。',
        wrongTypeSubtitle: '该搜索无效。请尝试调整搜索条件。',
    },
    statusPage: {
        status: '状态',
        statusExplanation: '添加一个表情符号，让同事和朋友一眼就知道发生了什么。你也可以选择附加一条消息！',
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
        clearAfter: '清除于',
        whenClearStatus: '我们应该何时清除你的状态？',
        vacationDelegate: '休假代理',
        setVacationDelegate: `设置一个假期代理，在你不在办公室时代你审批报销报告。`,
        vacationDelegateError: '更新你的休假代理时出错。',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `作为 ${nameOrEmail} 的假期代理`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `作为 ${vacationDelegateName} 的休假代理提交给 ${submittedToName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `您正在将 ${nameOrEmail} 指定为您的假期代理。他们目前还不在您所有的工作区中。若选择继续，我们会向您所有的工作区管理员发送电子邮件，请他们将其添加进去。`,
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
        letsDoubleCheck: '我们再仔细检查一下，确保一切都正确。',
        accountEnding: '账户尾号',
        thisBankAccount: '此银行账户将用于您工作区的商务付款',
        accountNumber: '账号编号',
        routingNumber: '银行路由号码',
        chooseAnAccountBelow: '在下方选择一个账户',
        addBankAccount: '添加银行账户',
        chooseAnAccount: '选择一个账户',
        connectOnlineWithPlaid: '登录你的银行账号',
        connectManually: '手动连接',
        desktopConnection: '注意：若要连接 Chase、Wells Fargo、Capital One 或 Bank of America，请点击此处在浏览器中完成此流程。',
        yourDataIsSecure: '您的数据是安全的',
        toGetStarted: '添加一个银行账户，用于报销费用、发放 Expensify 卡、收取发票款项并在同一地点支付账单。',
        plaidBodyCopy: '为员工提供更轻松的方式支付公司费用并获得报销。',
        checkHelpLine: '您可以在该账户的支票上找到路由号码和账户号码。',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `要关联银行账户，请先<a href="${contactMethodRoute}">添加一个电子邮件作为您的主要登录方式</a>，然后重试。您可以将手机号添加为次要登录方式。`,
        hasBeenThrottledError: '添加您的银行账户时出错。请等待几分钟后再试一次。',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `哎呀！看起来您的工作区货币设置为非美元的其他货币。要继续，请前往<a href="${workspaceRoute}">工作区设置</a>将其修改为美元 (USD)，然后重试。`,
        bbaAdded: '已添加商业银行账户！',
        bbaAddedDescription: '已可以用于付款。',
        error: {
            youNeedToSelectAnOption: '请选择一个选项以继续',
            noBankAccountAvailable: '抱歉，没有可用的银行账户',
            noBankAccountSelected: '请选择一个账户',
            taxID: '请输入有效的税号',
            website: '请输入有效的网站地址',
            zipCode: `请输入有效的邮政编码，格式如下：${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: '请输入有效的电话号码',
            email: '请输入有效的电子邮箱地址',
            companyName: '请输入有效的公司名称',
            addressCity: '请输入有效的城市名称',
            addressStreet: '请输入有效的街道地址',
            addressState: '请选择一个有效的州',
            incorporationDateFuture: '成立日期不能是未来的日期',
            incorporationState: '请选择一个有效的州',
            industryCode: '请输入一个有效的六位数行业分类代码',
            restrictedBusiness: '请确认该企业不在受限企业列表中',
            routingNumber: '请输入有效的路由号码',
            accountNumber: '请输入有效的账号',
            routingAndAccountNumberCannotBeSame: '路由号码和账户号码不能相同',
            companyType: '请选择一个有效的公司类型',
            tooManyAttempts: '由于登录尝试次数过多，此选项已被停用24小时。请稍后重试或改为手动输入详细信息。',
            address: '请输入有效地址',
            dob: '请选择一个有效的出生日期',
            age: '必须年满 18 周岁',
            ssnLast4: '请输入有效的社保号码后四位',
            firstName: '请输入有效的名字',
            lastName: '请输入有效的姓氏',
            noDefaultDepositAccountOrDebitCardAvailable: '请添加一个默认的存款账户或借记卡',
            validationAmounts: '您输入的验证金额不正确。请仔细核对您的银行对账单后重试。',
            fullName: '请输入有效的全名',
            ownershipPercentage: '请输入有效的百分比数字',
            deletePaymentBankAccount: '此银行账户无法删除，因为它用于 Expensify Card 付款。如果您仍希望删除此账户，请联系 Concierge。',
            sameDepositAndWithdrawalAccount: '存入账户和取出账户相同。',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: '您的银行账户位于哪个国家/地区？',
        accountDetailsStepHeader: '你的账户详情是什么？',
        accountTypeStepHeader: '这是什么类型的账户？',
        bankInformationStepHeader: '你的银行账户信息是什么？',
        accountHolderInformationStepHeader: '账户持有人详细信息是什么？',
        howDoWeProtectYourData: '我们如何保护您的数据？',
        currencyHeader: '您的银行账户的币种是什么？',
        confirmationStepHeader: '请检查您的信息。',
        confirmationStepSubHeader: '请仔细核对以下详细信息，并勾选条款复选框以确认。',
        toGetStarted: '添加个人银行账户以接收报销、支付发票或启用 Expensify 钱包。',
    },
    addPersonalBankAccountPage: {
        enterPassword: '输入 Expensify 密码',
        alreadyAdded: '此账户已被添加。',
        chooseAccountLabel: '账户',
        successTitle: '已添加个人银行账户！',
        successMessage: '恭喜，您的银行账户已完成设置，可以接收报销款了。',
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
        errorMessageInvalidPhone: `请输入不带括号或破折号的有效电话号码。如果您在美国以外，请包含您的国家代码（例如 ${CONST.EXAMPLE_PHONE_NUMBER}）。`,
        errorMessageInvalidEmail: '无效的电子邮箱',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} 已经是 ${name} 的成员`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} 已是 ${name} 的管理员`,
    },
    onfidoStep: {
        acceptTerms: '通过继续申请激活您的 Expensify 钱包，即表示您确认已阅读、理解并接受',
        facialScan: 'Onfido 面部扫描政策与授权书',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfido 的人脸扫描政策和授权书</a>、<a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>隐私政策</a>以及<a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>服务条款</a>。</muted-text-micro>`,
        tryAgain: '重试',
        verifyIdentity: '验证身份',
        letsVerifyIdentity: '验证您的身份',
        butFirst: `不过先来点无聊的内容。在下一步仔细阅读法律条款，准备好后点击“接受”。`,
        genericError: '处理此步骤时发生错误。请重试。',
        cameraPermissionsNotGranted: '启用摄像头访问',
        cameraRequestMessage: '我们需要访问您的相机以完成银行账户验证。请在“设置”中找到“New Expensify”并启用相机访问权限。',
        microphonePermissionsNotGranted: '启用麦克风访问权限',
        microphoneRequestMessage: '我们需要访问您的麦克风来完成银行账户验证。请在“设置”>“New Expensify”中启用麦克风访问权限。',
        originalDocumentNeeded: '请上传您的身份证件原始照片，而不是屏幕截图或扫描图片。',
        documentNeedsBetterQuality: '您的身份证件似乎已损坏或缺少安全特征。请上传一张未损坏且完整可见的原始身份证件照片。',
        imageNeedsBetterQuality: '您的证件照片清晰度有问题。请重新上传一张能清晰显示整张证件的照片。',
        selfieIssue: '您的自拍/视频有问题。请上传一张实时自拍/视频。',
        selfieNotMatching: '您的自拍/视频与您的身份证件不符。请上传一张/一段能清晰看到您脸部的新的自拍/视频。',
        selfieNotLive: '您的自拍/视频似乎不是实时拍摄的照片/视频。请上传实时自拍/视频。',
    },
    additionalDetailsStep: {
        headerTitle: '更多详细信息',
        helpText: '在您可以使用钱包收付款之前，我们需要先确认以下信息。',
        helpTextIdologyQuestions: '我们还需要再问你几个问题，以完成您的身份验证。',
        helpLink: '了解我们为何需要这个。',
        legalFirstNameLabel: '法定名字',
        legalMiddleNameLabel: '法定中间名',
        legalLastNameLabel: '法定姓氏',
        selectAnswer: '请选择一个回复以继续',
        ssnFull9Error: '请输入有效的九位数社会安全号',
        needSSNFull9: '我们在验证您的社会安全号码时遇到问题。请输入完整的九位社会安全号码。',
        weCouldNotVerify: '我们无法验证',
        pleaseFixIt: '请先更正这些信息，然后再继续',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `我们无法验证您的身份。请稍后重试，或如有任何疑问，请联系 <a href="mailto:${conciergeEmail}">${conciergeEmail}</a>。`,
    },
    termsStep: {
        headerTitle: '条款和费用',
        headerTitleRefactor: '费用和条款',
        haveReadAndAgreePlain: '我已阅读并同意接收电子披露信息。',
        haveReadAndAgree: `我已阅读并同意接收<a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">电子披露文件</a>。`,
        agreeToThePlain: '我同意《隐私和钱包协议》。',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) => `我同意<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">隐私政策</a>和<a href="${walletAgreementUrl}">钱包协议</a>。`,
        enablePayments: '启用付款',
        monthlyFee: '月费',
        inactivity: '不活跃',
        noOverdraftOrCredit: '无透支/信用功能。',
        electronicFundsWithdrawal: '电子资金提取',
        standard: '标准',
        reviewTheFees: '看看一些费用。',
        checkTheBoxes: '请勾选下方复选框。',
        agreeToTerms: '同意条款后，你就可以开始使用了！',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Expensify 钱包由 ${walletProgram} 发行。`,
            perPurchase: '每次购买',
            atmWithdrawal: 'ATM 取款',
            cashReload: '现金充值',
            inNetwork: '网络内',
            outOfNetwork: '非网络内',
            atmBalanceInquiry: 'ATM 余额查询（站内或站外）',
            customerService: '客户服务（自动或人工客服）',
            inactivityAfterTwelveMonths: '不活跃（12个月内无交易后）',
            weChargeOneFee: '我们还收取 1 种其他类型的费用。具体为：',
            fdicInsurance: '您的资金符合 FDIC 存款保险的条件。',
            generalInfo: `有关预付账户的一般信息，请访问<a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>。`,
            conditionsDetails: `有关所有费用和服务的详细信息和条款，请访问 <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> 或致电 +1 833-400-0904。`,
            electronicFundsWithdrawalInstant: '电子资金取款（即时）',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `（最低 ${amount}）`,
        },
        longTermsForm: {
            listOfAllFees: '所有 Expensify 钱包费用列表',
            typeOfFeeHeader: '所有费用',
            feeAmountHeader: '金额',
            moreDetailsHeader: '详情',
            openingAccountTitle: '开户',
            openingAccountDetails: '开户无需任何费用。',
            monthlyFeeDetails: '没有月费。',
            customerServiceTitle: '客户服务',
            customerServiceDetails: '没有客户服务费用。',
            inactivityDetails: '没有不活跃费用。',
            sendingFundsTitle: '向另一位账户持有人转账',
            sendingFundsDetails: '使用您的余额、银行账户或借记卡向另一位账户持有人转账不收取任何费用。',
            electronicFundsStandardDetails: '使用标准选项从您的 Expensify 钱包转账资金到您的银行账户不收取任何费用。此类转账通常会在 1–3 个工作日内完成。',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                '使用即时转账选项将资金从您的 Expensify 钱包转入已关联的借记卡时需要支付手续费。此类转账通常会在几分钟内完成。' +
                `费用为转账金额的 ${percentage}%，（最低收费为 ${amount}）。`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `您的资金符合获得 FDIC 保险的条件。您的资金将由 ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}（一家受 FDIC 保险的机构）托管或转入该机构。` +
                `一旦资金存入后，在满足特定存款保险要求并完成银行卡注册的前提下，如${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}发生倒闭，您的资金可享受由 FDIC 提供的最高 ${amount} 的保险保障。详情请参阅 ${CONST.TERMS.FDIC_PREPAID}。`,
            contactExpensifyPayments: `通过拨打 +1 833-400-0904 联系 ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}，发送电子邮件至 ${CONST.EMAIL.CONCIERGE}，或在 ${CONST.NEW_EXPENSIFY_URL} 登录。`,
            generalInformation: `有关预付账户的一般信息，请访问 ${CONST.TERMS.CFPB_PREPAID}。如果您对预付账户有投诉，请致电消费者金融保护局：1-855-411-2372，或访问 ${CONST.TERMS.CFPB_COMPLAINT}。`,
            printerFriendlyView: '查看打印友好版',
            automated: '自动化',
            liveAgent: '人工客服',
            instant: '即时',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `最低 ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '启用付款',
        activatedTitle: '钱包已激活！',
        activatedMessage: '恭喜，您的钱包已设置完成，可以开始付款了。',
        checkBackLaterTitle: '稍等片刻…',
        checkBackLaterMessage: '我们仍在审核您的信息。请稍后再查看。',
        continueToPayment: '继续前往付款',
        continueToTransfer: '继续转账',
    },
    companyStep: {
        headerTitle: '公司信息',
        subtitle: '就快完成了！出于安全原因，我们需要确认一些信息：',
        legalBusinessName: '法定企业名称',
        companyWebsite: '公司网站',
        taxIDNumber: '税号',
        taxIDNumberPlaceholder: '9 位数字',
        companyType: '公司类型',
        incorporationDate: '成立日期',
        incorporationState: '注册州',
        industryClassificationCode: '行业分类代码',
        confirmCompanyIsNot: '我确认该公司不在',
        listOfRestrictedBusinesses: '受限业务列表',
        incorporationDatePlaceholder: '开始日期（yyyy-mm-dd）',
        incorporationTypes: {
            LLC: '有限责任公司',
            CORPORATION: '公司',
            PARTNERSHIP: '合作伙伴关系',
            COOPERATIVE: '合作社',
            SOLE_PROPRIETORSHIP: '个人独资企业',
            OTHER: '其他',
        },
        industryClassification: '该企业归类于哪个行业？',
        industryClassificationCodePlaceholder: '搜索行业分类代码',
    },
    requestorStep: {
        headerTitle: '个人信息',
        learnMore: '了解详情',
        isMyDataSafe: '我的数据安全吗？',
    },
    personalInfoStep: {
        personalInfo: '个人信息',
        enterYourLegalFirstAndLast: '您的法定姓名是什么？',
        legalFirstName: '法定名字',
        legalLastName: '法定姓氏',
        legalName: '法定姓名',
        enterYourDateOfBirth: '你的出生日期是？',
        enterTheLast4: '您的社会安全号码的后四位数字是多少？',
        dontWorry: '别担心，我们不会进行任何个人信用检查！',
        last4SSN: '社保号后四位',
        enterYourAddress: '你的地址是什么？',
        address: '地址',
        letsDoubleCheck: '我们再仔细检查一下，确保一切都正确。',
        byAddingThisBankAccount: '通过添加此银行账户，即表示您确认已阅读、理解并接受',
        whatsYourLegalName: '您的法定姓名是？',
        whatsYourDOB: '你的出生日期是？',
        whatsYourAddress: '你的地址是什么？',
        whatsYourSSN: '您的社会安全号码的后四位数字是多少？',
        noPersonalChecks: '放心，这里不会进行任何个人信用检查！',
        whatsYourPhoneNumber: '你的电话号码是多少？',
        weNeedThisToVerify: '我们需要此信息来验证您的钱包。',
    },
    businessInfoStep: {
        businessInfo: '公司信息',
        enterTheNameOfYourBusiness: '你的公司名称是什么？',
        businessName: '公司法定名称',
        enterYourCompanyTaxIdNumber: '贵公司的税号是多少？',
        taxIDNumber: '税号',
        taxIDNumberPlaceholder: '9 位数字',
        enterYourCompanyWebsite: '贵公司的网站是什么？',
        companyWebsite: '公司网站',
        enterYourCompanyPhoneNumber: '贵公司的电话号码是多少？',
        enterYourCompanyAddress: '你们公司的地址是什么？',
        selectYourCompanyType: '这是什么类型的公司？',
        companyType: '公司类型',
        incorporationType: {
            LLC: '有限责任公司',
            CORPORATION: '公司',
            PARTNERSHIP: '合作伙伴关系',
            COOPERATIVE: '合作社',
            SOLE_PROPRIETORSHIP: '个人独资企业',
            OTHER: '其他',
        },
        selectYourCompanyIncorporationDate: '贵公司的注册成立日期是？',
        incorporationDate: '成立日期',
        incorporationDatePlaceholder: '开始日期（yyyy-mm-dd）',
        incorporationState: '注册州',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '贵公司是在哪个州注册成立的？',
        letsDoubleCheck: '我们再仔细检查一下，确保一切都正确。',
        companyAddress: '公司地址',
        listOfRestrictedBusinesses: '受限业务列表',
        confirmCompanyIsNot: '我确认该公司不在',
        businessInfoTitle: '业务信息',
        legalBusinessName: '法定企业名称',
        whatsTheBusinessName: '公司名称是什么？',
        whatsTheBusinessAddress: '公司地址是什么？',
        whatsTheBusinessContactInformation: '商务联系信息是什么？',
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return '公司注册号码（CRN）是什么？';
                default:
                    return '企业注册号是多少？';
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '什么是雇主识别号码（EIN）？';
                case CONST.COUNTRY.CA:
                    return '企业号码（BN）是什么？';
                case CONST.COUNTRY.GB:
                    return '什么是增值税登记号（VRN）？';
                case CONST.COUNTRY.AU:
                    return '什么是澳大利亚商业号码（ABN）？';
                default:
                    return '欧盟增值税号是什么？';
            }
        },
        whatsThisNumber: '这个数字是什么？',
        whereWasTheBusinessIncorporated: '公司是在哪个地点注册成立的？',
        whatTypeOfBusinessIsIt: '这是什么类型的企业？',
        whatsTheBusinessAnnualPayment: '该企业的年度支付交易量是多少？',
        whatsYourExpectedAverageReimbursements: '您预计的平均报销金额是多少？',
        registrationNumber: '注册编号',
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
        annualPaymentVolume: '年度支付金额',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `以${currencyCode}计的年度支付金额`,
        averageReimbursementAmount: '平均报销金额',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `${currencyCode}的平均报销金额`,
        selectIncorporationType: '选择公司注册类型',
        selectBusinessCategory: '选择业务类别',
        selectAnnualPaymentVolume: '选择年度支付金额',
        selectIncorporationCountry: '选择注册国家',
        selectIncorporationState: '选择注册州',
        selectAverageReimbursement: '选择平均报销金额',
        selectBusinessType: '选择企业类型',
        findIncorporationType: '查找公司注册类型',
        findBusinessCategory: '查找业务类别',
        findAnnualPaymentVolume: '查找年度付款金额',
        findIncorporationState: '查找注册州',
        findAverageReimbursement: '查找平均报销金额',
        findBusinessType: '查找业务类型',
        error: {
            registrationNumber: '请提供有效的注册号',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '请提供有效的雇主识别号码（EIN）';
                    case CONST.COUNTRY.CA:
                        return '请提供有效的企业编号（BN）';
                    case CONST.COUNTRY.GB:
                        return '请提供有效的增值税登记号（VRN）';
                    case CONST.COUNTRY.AU:
                        return '请提供有效的澳大利亚商业编号（ABN）';
                    default:
                        return '请提供有效的欧盟增值税号';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `您是否拥有 ${companyName} 25% 或以上的股份？`,
        doAnyIndividualOwn25percent: (companyName: string) => `是否有个人持有 ${companyName} 25% 或以上的股份？`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `是否还有其他个人拥有 ${companyName} 25% 或以上的股权？`,
        regulationRequiresUsToVerifyTheIdentity: '法规要求我们核实任何持有该企业超过 25% 股权的个人身份。',
        companyOwner: '企业所有者',
        enterLegalFirstAndLastName: '所有者的法定姓名是什么？',
        legalFirstName: '法定名字',
        legalLastName: '法定姓氏',
        enterTheDateOfBirthOfTheOwner: '所有者的出生日期是什么？',
        enterTheLast4: '所有者社会安全号码的后四位数字是多少？',
        last4SSN: '社保号后四位',
        dontWorry: '别担心，我们不会进行任何个人信用检查！',
        enterTheOwnersAddress: '所有者的地址是什么？',
        letsDoubleCheck: '我们再仔细检查一下，确保一切都正确。',
        legalName: '法定姓名',
        address: '地址',
        byAddingThisBankAccount: '通过添加此银行账户，即表示您确认已阅读、理解并接受',
        owners: '所有者',
    },
    ownershipInfoStep: {
        ownerInfo: '所有者信息',
        businessOwner: '企业所有者',
        signerInfo: '签署人信息',
        doYouOwn: (companyName: string) => `您是否拥有 ${companyName} 25% 或以上的股份？`,
        doesAnyoneOwn: (companyName: string) => `是否有个人持有 ${companyName} 25% 或以上的股份？`,
        regulationsRequire: '根据相关法规，我们必须核实任何持有该企业超过 25% 股权的个人身份。',
        legalFirstName: '法定名字',
        legalLastName: '法定姓氏',
        whatsTheOwnersName: '所有者的法定姓名是什么？',
        whatsYourName: '您的法定姓名是什么？',
        whatPercentage: '业主拥有该企业的百分比是多少？',
        whatsYoursPercentage: '您拥有这家企业的百分之多少？',
        ownership: '所有权',
        whatsTheOwnersDOB: '所有者的出生日期是什么？',
        whatsYourDOB: '你的出生日期是？',
        whatsTheOwnersAddress: '所有者的地址是什么？',
        whatsYourAddress: '你的地址是什么？',
        whatAreTheLast: '所有者社会安全号码的后 4 位数字是什么？',
        whatsYourLast: '您的社会安全号码（SSN）的后4位数字是什么？',
        whatsYourNationality: '您的国籍是哪个国家？',
        whatsTheOwnersNationality: '所有者的国籍是哪个国家？',
        countryOfCitizenship: '国籍',
        dontWorry: '别担心，我们不会进行任何个人信用检查！',
        last4: '社保号后四位',
        whyDoWeAsk: '为什么我们要索取这些信息？',
        letsDoubleCheck: '我们再仔细检查一下，确保一切都正确。',
        legalName: '法定姓名',
        ownershipPercentage: '持股比例',
        areThereOther: (companyName: string) => `是否有其他个人拥有 ${companyName} 25% 或以上的股权？`,
        owners: '所有者',
        addCertified: '添加一份经过认证的组织结构图，显示受益所有人',
        regulationRequiresChart: '根据监管要求，我们必须收集一份经过认证的股权结构图，显示所有持有该企业25%或以上股份的个人或实体。',
        uploadEntity: '上传实体所有权结构图',
        noteEntity: '注意：实体所有权结构图必须由您的会计师、法律顾问签署，或经公证。',
        certified: '已认证实体所有权结构图',
        selectCountry: '选择国家',
        findCountry: '查找国家',
        address: '地址',
        chooseFile: '选择文件',
        uploadDocuments: '上传其他补充文件',
        pleaseUpload: '请在下方上传更多证明文件，以便我们核实您是否为该企业实体持股25%或以上的直接或间接所有人。',
        acceptedFiles: '可接受的文件格式：PDF、PNG、JPEG。每个部分的文件总大小不能超过 5 MB。',
        proofOfBeneficialOwner: '受益所有人证明',
        proofOfBeneficialOwnerDescription:
            '请提供由注册会计师、公证人或律师出具并签署的证明文件和组织架构图，用于核实对该企业25%或以上的持股情况。文件日期必须在最近三个月以内，并包含签署人的执照号码。',
        copyOfID: '实益所有人身份证复印件',
        copyOfIDDescription: '示例：护照、驾驶执照等。',
        proofOfAddress: '实益所有人地址证明',
        proofOfAddressDescription: '示例：水电费账单、租赁协议等。',
        codiceFiscale: '税号/纳税人识别号',
        codiceFiscaleDescription: '请上传一次现场拜访的视频或与签署负责人通话的录音视频。负责人必须提供：全名、出生日期、公司名称、注册号、税号、注册地址、业务性质以及开户用途。',
    },
    completeVerificationStep: {
        completeVerification: '完成验证',
        confirmAgreements: '请确认以下协议。',
        certifyTrueAndAccurate: '本人证明所提供的信息真实准确',
        certifyTrueAndAccurateError: '请证明这些信息真实且准确',
        isAuthorizedToUseBankAccount: '我已获授权使用此企业银行账户进行业务支出',
        isAuthorizedToUseBankAccountError: '您必须是具有授权可操作该企业银行账户的控制负责人',
        termsAndConditions: '条款和条件',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '验证您的银行账户',
        validateButtonText: '验证',
        validationInputLabel: '交易',
        maxAttemptsReached: '由于多次尝试失败，已停用此银行账户的验证功能。',
        description: `在 1–2 个工作日内，我们会以类似“Expensify, Inc. Validation”的名称向你的银行账户发送三笔小额交易。`,
        descriptionCTA: '请在下面的字段中输入每笔交易金额。示例：1.51。',
        letsChatText: '快完成了！我们需要你在聊天中帮忙核实最后几项信息。准备好了吗？',
        enable2FATitle: '防止欺诈，启用双重身份验证（2FA）',
        enable2FAText: '我们非常重视您的安全。请立即设置双重身份验证，为您的账户增加一层额外保护。',
        secureYourAccount: '保护你的账户',
    },
    countryStep: {
        confirmBusinessBank: '确认企业银行账户币种和国家',
        confirmCurrency: '确认货币和国家',
        yourBusiness: '您的企业银行账户币种必须与您的工作区币种一致。',
        youCanChange: '您可以在以下位置更改工作区货币设置：',
        findCountry: '查找国家',
        selectCountry: '选择国家',
    },
    bankInfoStep: {
        whatAreYour: '您的企业银行账户信息是什么？',
        letsDoubleCheck: '我们再仔细检查一下，一切看起来都没问题。',
        thisBankAccount: '此银行账户将用于您工作区的商务付款',
        accountNumber: '账号编号',
        accountHolderNameDescription: '授权签署人全名',
    },
    signerInfoStep: {
        signerInfo: '签署人信息',
        areYouDirector: (companyName: string) => `您是${companyName}的董事吗？`,
        regulationRequiresUs: '根据相关法规，我们必须核实签署人是否有权代表企业执行此操作。',
        whatsYourName: '你的法定姓名是什么',
        fullName: '法定全名',
        whatsYourJobTitle: '你的职位名称是什么？',
        jobTitle: '职位名称',
        whatsYourDOB: '你的出生日期是？',
        uploadID: '上传身份证明和地址证明',
        personalAddress: '个人住址证明（例如水电费账单）',
        letsDoubleCheck: '我们再仔细检查一下，确保一切都正确。',
        legalName: '法定姓名',
        proofOf: '个人住址证明',
        enterOneEmail: (companyName: string) => `输入 ${companyName} 一位董事的邮箱地址`,
        regulationRequiresOneMoreDirector: '根据规定，至少还需要一位董事作为签署人。',
        hangTight: '请稍候…',
        enterTwoEmails: (companyName: string) => `请输入 ${companyName} 的两位董事的邮箱`,
        sendReminder: '发送提醒',
        chooseFile: '选择文件',
        weAreWaiting: '我们正在等待其他人验证其作为公司董事的身份。',
        id: '身份证复印件',
        proofOfDirectors: '董事证明',
        proofOfDirectorsDescription: '示例：Oncorp 公司简介或企业注册。',
        codiceFiscale: '税号',
        codiceFiscaleDescription: '签署人、授权用户和实益所有人的税号（Codice Fiscale）。',
        PDSandFSG: 'PDS + FSG 披露文件',
        PDSandFSGDescription: dedent(`
            我们与 Corpay 建立的合作伙伴关系通过 API 连接，利用其庞大的国际银行合作网络，为 Expensify 的全球报销功能提供支持。根据澳大利亚法规要求，我们向您提供 Corpay 的《金融服务指南（FSG）》和《产品披露声明（PDS）》。

            请仔细阅读 FSG 和 PDS 文件，因为其中包含 Corpay 所提供产品与服务的完整细节和重要信息。请妥善保存这些文件以备日后查阅。
        `),
        pleaseUpload: '请在下方上传更多证明文件，以帮助我们核实您作为该企业董事的身份。',
        enterSignerInfo: '输入签署人信息',
        thisStep: '此步骤已完成',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `正在连接尾号为 ${bankAccountLastFour} 的 ${currency} 商业银行账户到 Expensify，以使用 ${currency} 支付员工。下一步需要一位董事的签署人信息。`,
        error: {
            emailsMustBeDifferent: '电子邮箱地址不能相同',
        },
    },
    agreementsStep: {
        agreements: '协议',
        pleaseConfirm: '请确认以下协议',
        regulationRequiresUs: '法规要求我们核实任何持有该企业超过 25% 股权的个人身份。',
        iAmAuthorized: '我已获授权使用该公司银行账户进行业务支出。',
        iCertify: '本人确认所提供的信息真实且准确。',
        iAcceptTheTermsAndConditions: `我接受<a href="https://cross-border.corpay.com/tc/">条款和条件</a>。`,
        iAcceptTheTermsAndConditionsAccessibility: '我接受条款和条件。',
        accept: '接受并添加银行账户',
        iConsentToThePrivacyNotice: '我同意<a href="https://payments.corpay.com/compliance">隐私声明</a>。',
        iConsentToThePrivacyNoticeAccessibility: '我同意隐私声明。',
        error: {
            authorized: '您必须是具有授权可操作该企业银行账户的控制负责人',
            certify: '请证明这些信息真实且准确',
            consent: '请同意隐私声明',
        },
    },
    docusignStep: {
        subheader: 'Docusign 表单',
        pleaseComplete: '请使用下方的 Docusign 链接填写 ACH 授权表，并将签署完成的副本上传到这里，以便我们可以直接从您的银行账户中扣款。',
        pleaseCompleteTheBusinessAccount: '请完成《商业账户申请直接借记安排》',
        pleaseCompleteTheDirect: '请使用下方的 DocuSign 链接完成直接扣款协议，然后在此上传已签署的副本，以便我们可以直接从您的银行账户扣款。',
        takeMeTo: '带我前往 DocuSign',
        uploadAdditional: '上传其他补充文件',
        pleaseUpload: '请上传 DEFT 表格和 Docusign 签名页',
        pleaseUploadTheDirect: '请上传直接扣款安排文件和Docusign 签名页',
    },
    finishStep: {
        letsFinish: '让我们在聊天中完成！',
        thanksFor: '感谢你提供这些详细信息。专属支持专员现在会审核你的信息。如果我们还需要你提供其他内容，会再联系你；同时，如有任何问题，欢迎随时与我们联系。',
        iHaveA: '我有一个问题',
        enable2FA: '启用双重身份验证（2FA）以防止欺诈',
        weTake: '我们非常重视您的安全。请立即设置双重身份验证，为您的账户增加一层额外保护。',
        secure: '保护你的账户',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '请稍候',
        explanationLine: '我们正在查看您的信息。您很快就可以继续进行下一步了。',
    },
    session: {
        offlineMessageRetry: '看起来你已离线。请检查你的网络连接，然后重试。',
    },
    travel: {
        header: '预订差旅',
        title: '聪明出行',
        subtitle: '使用 Expensify Travel 获取最优出行优惠，并在一个地方管理您所有的商务报销。',
        features: {
            saveMoney: '预订省钱',
            alerts: '行程变更时实时获取提醒',
        },
        bookTravel: '预订差旅',
        bookDemo: '预约演示',
        bookADemo: '预约演示',
        toLearnMore: '以了解更多。',
        termsAndConditions: {
            header: '在我们继续之前…',
            title: '条款和条件',
            label: '我同意条款和条件',
            subtitle: `请同意 Expensify Travel 的<a href="${CONST.TRAVEL_TERMS_URL}">条款和条件</a>。`,
            error: '要继续，请同意 Expensify Travel 的条款和条件',
            defaultWorkspaceError: '您需要先设置一个默认工作区才能启用 Expensify Travel。请前往“设置”>“工作区”，点击某个工作区旁边的三个竖点，选择“设为默认工作区”，然后再试一次！',
        },
        flight: '航班',
        flightDetails: {
            passenger: '乘客',
            layover: (layover: string) => `<muted-text-label>在此航班前你有<strong>${layover}的中转停留</strong></muted-text-label>`,
            takeOff: '起飞',
            landing: '着陆',
            seat: '席位',
            class: '舱位等级',
            recordLocator: '记录定位符',
            cabinClasses: {
                unknown: '未知',
                economy: '经济舱',
                premiumEconomy: '高端经济舱',
                business: '商务',
                first: '第一',
            },
        },
        hotel: '酒店',
        hotelDetails: {
            guest: '访客',
            checkIn: '值机',
            checkOut: '退房',
            roomType: '房型',
            cancellation: '取消政策',
            cancellationUntil: '免费取消截止至',
            confirmation: '确认号码',
            cancellationPolicies: {
                unknown: '未知',
                nonRefundable: '不可退款',
                freeCancellationUntil: '免费取消截止至',
                partiallyRefundable: '部分可退',
            },
        },
        car: '汽车',
        carDetails: {
            rentalCar: '租车',
            pickUp: '取件',
            dropOff: '下车',
            driver: '司机',
            carType: '车辆类型',
            cancellation: '取消政策',
            cancellationUntil: '免费取消截止至',
            freeCancellation: '免费取消',
            confirmation: '确认号码',
        },
        train: '轨道',
        trainDetails: {
            passenger: '乘客',
            departs: '出发时间',
            arrives: '到达',
            coachNumber: '车厢号',
            seat: '席位',
            fareDetails: '车费详情',
            confirmation: '确认号码',
        },
        viewTrip: '查看行程',
        modifyTrip: '修改行程',
        tripSupport: '行程支持',
        tripDetails: '行程详情',
        viewTripDetails: '查看行程详情',
        trip: '行程',
        trips: '行程',
        tripSummary: '行程摘要',
        departs: '出发时间',
        errorMessage: '出现问题。请稍后再试。',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) => `<rbr>请<a href="${phoneErrorMethodsRoute}">添加工作邮箱作为您的主要登录方式</a>以预订差旅。</rbr>`,
        domainSelector: {
            title: '域名',
            subtitle: '为 Expensify Travel 设置选择一个域名。',
            recommended: '推荐',
        },
        domainPermissionInfo: {
            title: '域名',
            restriction: (domain: string) => `您没有权限为域名 <strong>${domain}</strong> 启用 Expensify Travel。您需要请该域的管理员来启用差旅功能。`,
            accountantInvitation: `如果您是会计，建议加入 <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! 会计计划</a>，以为此域启用差旅功能。`,
        },
        publicDomainError: {
            title: '开始使用 Expensify Travel',
            message: `使用 Expensify Travel 时，你需要使用你的工作邮箱（例如 name@company.com），而不是你的个人邮箱（例如 name@gmail.com）。`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel 已被禁用',
            message: `您的管理员已关闭 Expensify Travel。请按照您公司的预订政策安排差旅。`,
        },
        verifyCompany: {
            title: '我们正在审核你的请求…',
            message: `我们正在进行一些检查，以确认您的账户已准备好使用 Expensify Travel。我们很快会与您联系！`,
            confirmText: '明白了',
            conciergeMessage: ({domain}: {domain: string}) => `为域名 ${domain} 启用差旅失败。请检查并为该域名启用差旅功能。`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `您已预订 ${startDate} 从 ${origin} 飞往 ${destination} 的 ${airlineCode} 航班。确认代码：${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `您在${startDate}搭乘的${airlineCode}航班（${origin} → ${destination}）机票已作废。`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `您于 ${startDate} 乘坐的航班 ${airlineCode}（${origin} → ${destination}）的机票已被退款或改签。`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `您在 ${startDate}} 搭乘的航班 ${airlineCode}（${origin} → ${destination}）已被航空公司取消。`,
            flightScheduleChangePending: (airlineCode: string) => `航空公司已对航班 ${airlineCode} 提出改签方案；我们正在等待确认。`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `行程变更已确认：航班 ${airlineCode} 现定于 ${startDate} 起飞。`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `您在 ${startDate} 搭乘的航班 ${airlineCode}（${origin} → ${destination}）已更新。`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `您在${airlineCode}航班上的舱位等级已更新为${cabinClass}。`,
            flightSeatConfirmed: (airlineCode: string) => `您在 ${airlineCode} 航班上的座位已确认。`,
            flightSeatChanged: (airlineCode: string) => `您在${airlineCode}航班上的座位分配已被更改。`,
            flightSeatCancelled: (airlineCode: string) => `您在航班 ${airlineCode} 上的座位分配已被移除。`,
            paymentDeclined: '您的机票预订付款失败。请重试。',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `您已取消您的${type}预订${id}。`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `供应商已取消您的${type}预订${id}。`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `您的${type}预订已重新预订。新的确认编号：${id}。`,
            bookingUpdated: ({type}: TravelTypeParams) => `您的${type}预订已更新。请在行程中查看新的详细信息。`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) => `您从 ${origin} 前往 ${destination} 的 ${startDate} 火车票已退款。款项将以余额形式处理。`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `您在 ${startDate} 从 ${origin} 前往 ${destination} 的火车票已成功改签。`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `您从 ${origin} 前往 ${destination} 的 ${startDate} 火车票已更新。`,
            defaultUpdate: ({type}: TravelTypeParams) => `您的${type}预订已更新。`,
        },
        flightTo: '航班前往',
        trainTo: '火车前往',
        carRental: '汽车租赁',
        nightIn: '夜宿',
        nightsIn: '晚数（于）',
    },
    workspace: {
        common: {
            card: '银行卡',
            expensifyCard: 'Expensify 卡',
            companyCards: '公司卡片',
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
            customFieldHint: '添加适用于该成员所有支出的自定义编码。',
            reports: '报表',
            reportFields: '报表字段',
            reportTitle: '报表标题',
            reportField: '报表字段',
            taxes: '税务',
            bills: '账单',
            invoices: '发票',
            perDiem: '每日补贴',
            travel: '差旅',
            members: '成员',
            accounting: '会计',
            receiptPartners: '收据合作伙伴',
            rules: '规则',
            displayedAs: '显示为',
            plan: '方案',
            profile: '概览',
            bankAccount: '银行账户',
            testTransactions: '测试交易',
            issueAndManageCards: '发放和管理卡片',
            reconcileCards: '对账卡片',
            selectAll: '全选',
            selected: () => ({
                one: '已选择 1 项',
                other: (count: number) => `已选择 ${count} 个`,
            }),
            settlementFrequency: '结算频率',
            setAsDefault: '设为默认工作区',
            defaultNote: `发送到 ${CONST.EMAIL.RECEIPTS} 的收据会显示在此工作区。`,
            deleteConfirmation: '确定要删除此工作区吗？',
            deleteWithCardsConfirmation: '您确定要删除此工作区吗？这将移除所有卡片流水和已分配的卡片。',
            unavailable: '工作区不可用',
            memberNotFound: '未找到成员。要邀请新成员加入工作区，请使用上方的邀请按钮。',
            notAuthorized: `您无权访问此页面。如果您正尝试加入此工作区，请让工作区所有者将您添加为成员。还有其他问题？请联系 ${CONST.EMAIL.CONCIERGE}。`,
            goToWorkspace: '前往工作区',
            duplicateWorkspace: '复制工作区',
            duplicateWorkspacePrefix: '重复',
            goToWorkspaces: '前往工作区',
            clearFilter: '清除筛选器',
            workspaceName: '工作区名称',
            workspaceOwner: '所有者',
            workspaceType: '工作区类型',
            workspaceAvatar: '工作区头像',
            mustBeOnlineToViewMembers: '您需要联网才能查看此工作区的成员。',
            moreFeatures: '更多功能',
            requested: '已请求',
            distanceRates: '行程费率',
            defaultDescription: '一个地方管理你所有的收据和报销。',
            descriptionHint: '与所有成员共享此工作区的相关信息。',
            welcomeNote: '请使用 Expensify 提交您的收据以获得报销，谢谢！',
            subscription: '订阅',
            markAsEntered: '标记为手动输入',
            markAsExported: '标记为已导出',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `导出到 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: '我们再仔细检查一下，确保一切都正确。',
            lineItemLevel: '逐项级别',
            reportLevel: '报表级别',
            topLevel: '顶级',
            appliedOnExport: '未导入到 Expensify，导出时应用',
            shareNote: {
                header: '与其他成员共享你的工作区',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `将此二维码分享给他人，或复制下面的链接，方便成员请求访问你的工作区。所有加入工作区的请求都会显示在<a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a>聊天室中，供你审核。`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `连接到 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: '创建新连接',
            reuseExistingConnection: '重用现有连接',
            existingConnections: '现有连接',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `由于您之前已连接到 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}，您可以选择复用现有连接或创建新连接。`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - 上次同步时间 ${formattedDate}`,
            authenticationError: (connectionName: string) => `由于身份验证错误，无法连接到 ${connectionName}。`,
            learnMore: '了解详情',
            memberAlternateText: '提交并批准报表。',
            adminAlternateText: '管理报表和工作区设置。',
            auditorAlternateText: '查看并评论报表。',
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
            planType: '套餐类型',
            youCantDowngradeInvoicing: '您无法在已开具发票的订阅中降级套餐。若要咨询或更改订阅，请联系您的客户经理或 Concierge 获取帮助。',
            defaultCategory: '默认类别',
            viewTransactions: '查看交易记录',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `${displayName} 的报销`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card 交易将通过<a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">我们的集成</a>自动导出到一个已创建的“Expensify Card 负债账户”。</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) => (organizationName ? `已连接到 ${organizationName}` : '在整个组织内自动化管理差旅和餐饮配送费用。'),
                sendInvites: '发送邀请',
                sendInvitesDescription: '这些工作区成员尚未拥有 Uber for Business 账户。请取消选择此时不想邀请的成员。',
                confirmInvite: '确认邀请',
                manageInvites: '管理邀请',
                confirm: '确认',
                allSet: '一切就绪',
                readyToRoll: '一切就绪，开始吧',
                takeBusinessRideMessage: '乘坐商务出行，您的 Uber 收据将自动导入 Expensify。出发！',
                all: '全部',
                linked: '已关联',
                outstanding: '未结',
                status: {
                    resend: '重新发送',
                    invite: '邀请',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: '已关联',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '待处理',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '已停用',
                },
                centralBillingAccount: '集中结算账户',
                centralBillingDescription: '选择导入所有 Uber 收据的位置。',
                invitationFailure: '邀请成员加入 Uber 企业版失败',
                autoInvite: '邀请新的工作区成员加入 Uber 企业版',
                autoRemove: '在 Uber for Business 中停用已移除的工作区成员',
                emptyContent: {
                    title: '没有未处理的邀请',
                    subtitle: '太棒了！我们到处查找，也没发现任何未处理的邀请。',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>设置每日津贴标准以控制员工每日支出。<a href="${CONST.DEEP_DIVE_PER_DIEM}">了解详情</a>。</muted-text>`,
            amount: '金额',
            deleteRates: () => ({
                one: '删除费率',
                other: '删除费率',
            }),
            deletePerDiemRate: '删除每日津贴费率',
            findPerDiemRate: '查找每日津贴标准',
            areYouSureDelete: () => ({
                one: '确定要删除此费率吗？',
                other: '确定要删除这些费率吗？',
            }),
            emptyList: {
                title: '每日补贴',
                subtitle: '设置每日津贴标准以控制员工每日支出。从电子表格导入标准即可开始。',
            },
            importPerDiemRates: '导入每日津贴费率',
            editPerDiemRate: '编辑每日津贴费率',
            editPerDiemRates: '编辑差旅补贴标准',
            editDestinationSubtitle: (destination: string) => `更新此目的地将会更改所有 ${destination} 的每日津贴子费率。`,
            editCurrencySubtitle: (destination: string) => `更新此货币将会更改所有 ${destination} 的每日津贴子费率。`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '设置报销费用导出到 QuickBooks Desktop 的方式。',
            exportOutOfPocketExpensesCheckToggle: '将支票标记为“稍后打印”',
            exportDescription: '配置 Expensify 数据导出到 QuickBooks Desktop 的方式。',
            date: '导出日期',
            exportInvoices: '导出发票至',
            exportExpensifyCard: '将 Expensify Card 交易导出为',
            account: '账户',
            accountDescription: '选择记账分录的入账位置。',
            accountsPayable: '应付账款',
            accountsPayableDescription: '选择供应商账单的创建位置。',
            bankAccount: '银行账户',
            notConfigured: '未配置',
            bankAccountDescription: '选择从哪里寄出支票。',
            creditCardAccount: '信用卡账户',
            exportDate: {
                label: '导出日期',
                description: '将报表导出到 QuickBooks Desktop 时使用此日期。',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最近报销日期',
                        description: '报表中最新报销的日期。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '导出日期',
                        description: '报表导出到 QuickBooks Desktop 的日期。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提交日期',
                        description: '报表提交审批的日期。',
                    },
                },
            },
            exportCheckDescription: '我们会为每份 Expensify 报告创建一张分项支票，并从下方的银行账户寄出。',
            exportJournalEntryDescription: '我们会为每份 Expensify 报告创建一条明细分录，并将其记入下面的科目。',
            exportVendorBillDescription: '我们会为每个 Expensify 报告创建一张分项供应商账单，并将其添加到账户如下所示。如果本会计期间已结账，我们将记入下一个未结期间的第一天。',
            outOfPocketTaxEnabledDescription: 'QuickBooks Desktop 不支持在导出日记账分录时包含税费。由于您在工作区中启用了税费，此导出选项当前不可用。',
            outOfPocketTaxEnabledError: '启用税费功能时无法使用分录导出。请选择其他导出选项。',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '信用卡',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '供应商账单',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '日记账分录',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '支票',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]: '我们会为每份 Expensify 报告创建一张分项支票，并从下方的银行账户寄出。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    '我们会自动将信用卡交易中的商户名称与 QuickBooks 中任何对应的供应商进行匹配。如果不存在供应商，我们将创建一个名为“Credit Card Misc.”的供应商以便关联。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '我们将为每个 Expensify 报告按照最后一笔报销的日期创建一张分项供应商账单，并将其添加到下方账户中。如果该会计期间已结账，我们将记入下一个未结会计期间的第一天。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '选择导出信用卡交易的去向。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '选择一个供应商，应用于所有信用卡交易。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '选择从哪里寄出支票。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: '启用地点后无法使用供应商账单。请选择其他导出选项。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '启用“地点”后无法使用支票功能。请选择其他导出选项。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '启用税费功能时无法使用分录导出。请选择其他导出选项。',
            },
            noAccountsFound: '未找到账户',
            noAccountsFoundDescription: '在 QuickBooks Desktop 中添加该账户，然后再次同步连接',
            qbdSetup: 'QuickBooks Desktop 设置',
            requiredSetupDevice: {
                title: '无法从此设备连接',
                body1: '您需要在托管 QuickBooks Desktop 公司文件的那台电脑上设置此连接。',
                body2: '连接完成后，您就可以随时随地进行同步和导出了。',
            },
            setupPage: {
                title: '打开此链接进行连接',
                body: '要完成设置，请在运行 QuickBooks Desktop 的电脑上打开以下链接。',
                setupErrorTitle: '出了点问题',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>QuickBooks Desktop 连接目前无法使用。请稍后重试，或在问题持续时<a href="${conciergeLink}">联系 Concierge</a>。</centered-text></muted-text>`,
            },
            importDescription: '选择要从 QuickBooks Desktop 导入到 Expensify 的编码配置。',
            classes: '类别',
            items: '条目',
            customers: '客户/项目',
            exportCompanyCardsDescription: '设置公司卡消费如何导出到 QuickBooks Desktop。',
            defaultVendorDescription: '设置一个默认供应商，在导出时应用于所有信用卡交易。',
            accountsDescription: '您的 QuickBooks Desktop 科目表将作为类别导入到 Expensify。',
            accountsSwitchTitle: '选择将新账户导入为启用或停用的类别。',
            accountsSwitchDescription: '启用的类别将在成员创建报销时可供选择。',
            classesDescription: '选择在 Expensify 中如何处理 QuickBooks Desktop 类别。',
            tagsDisplayedAsDescription: '单行项目级别',
            reportFieldsDisplayedAsDescription: '报表级别',
            customersDescription: '选择在 Expensify 中如何处理 QuickBooks Desktop 的客户/项目。',
            advancedConfig: {
                autoSyncDescription: 'Expensify 将每天自动与 QuickBooks Desktop 同步。',
                createEntities: '自动创建实体',
                createEntitiesDescription: '如果供应商在 QuickBooks Desktop 中尚不存在，Expensify 会自动创建这些供应商。',
            },
            itemsDescription: '选择如何在 Expensify 中处理 QuickBooks Desktop 项目。',
            accountingMethods: {
                label: '何时导出',
                description: '选择何时导出报销：',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '权责发生制',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '现金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自付报销将在最终批准后导出',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自付费用将在付款后导出',
                },
            },
        },
        qbo: {
            connectedTo: '已连接到',
            importDescription: '选择要从 QuickBooks Online 导入到 Expensify 的编码配置。',
            classes: '类别',
            locations: '地点',
            customers: '客户/项目',
            accountsDescription: '您的 QuickBooks Online 科目表将在导入 Expensify 时作为类别使用。',
            accountsSwitchTitle: '选择将新账户导入为启用或停用的类别。',
            accountsSwitchDescription: '启用的类别将在成员创建报销时可供选择。',
            classesDescription: '选择如何在 Expensify 中处理 QuickBooks Online 类别。',
            customersDescription: '选择如何在 Expensify 中处理 QuickBooks Online 客户/项目。',
            locationsDescription: '选择如何在 Expensify 中处理 QuickBooks Online 的地点。',
            taxesDescription: '选择在 Expensify 中如何处理 QuickBooks Online 的税费。',
            locationsLineItemsRestrictionDescription: 'QuickBooks Online 不支持在支票或供应商账单的明细行级别使用地点。如果你想在明细行使用地点，请确保使用日记账分录和信用卡/借记卡报销。',
            taxesJournalEntrySwitchNote: 'QuickBooks Online 不支持对日记账分录征税。请将导出选项更改为供应商账单或支票。',
            exportDescription: '配置 Expensify 数据导出到 QuickBooks Online 的方式。',
            date: '导出日期',
            exportInvoices: '导出发票至',
            exportExpensifyCard: '将 Expensify Card 交易导出为',
            exportDate: {
                label: '导出日期',
                description: '在将报表导出到 QuickBooks Online 时使用此日期。',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最近报销日期',
                        description: '报表中最新报销的日期。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '导出日期',
                        description: '报表导出到 QuickBooks Online 的日期。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提交日期',
                        description: '报表提交审批的日期。',
                    },
                },
            },
            receivable: '应收账款',
            archive: '应收账款存档',
            exportInvoicesDescription: '将发票导出到 QuickBooks Online 时请使用此账户。',
            exportCompanyCardsDescription: '设置公司卡消费如何导出到 QuickBooks Online。',
            vendor: '供应商',
            defaultVendorDescription: '设置一个默认供应商，在导出时应用于所有信用卡交易。',
            exportOutOfPocketExpensesDescription: '设置如何将自付费用导出到 QuickBooks Online。',
            exportCheckDescription: '我们会为每份 Expensify 报告创建一张分项支票，并从下方的银行账户寄出。',
            exportJournalEntryDescription: '我们会为每份 Expensify 报告创建一条明细分录，并将其记入下面的科目。',
            exportVendorBillDescription: '我们会为每个 Expensify 报告创建一张分项供应商账单，并将其添加到账户如下所示。如果本会计期间已结账，我们将记入下一个未结期间的第一天。',
            account: '账户',
            accountDescription: '选择记账分录的入账位置。',
            accountsPayable: '应付账款',
            accountsPayableDescription: '选择供应商账单的创建位置。',
            bankAccount: '银行账户',
            notConfigured: '未配置',
            bankAccountDescription: '选择从哪里寄出支票。',
            creditCardAccount: '信用卡账户',
            companyCardsLocationEnabledDescription: 'QuickBooks Online 不支持在供应商账单导出中使用地点。由于您的工作区已启用地点，此导出选项不可用。',
            outOfPocketTaxEnabledDescription: 'QuickBooks Online 不支持在导出的日记账分录中包含税金。由于你已在工作区中启用了税金功能，此导出选项不可用。',
            outOfPocketTaxEnabledError: '启用税费功能时无法使用分录导出。请选择其他导出选项。',
            advancedConfig: {
                autoSyncDescription: 'Expensify 将每天自动与 QuickBooks Online 同步。',
                inviteEmployees: '邀请员工',
                inviteEmployeesDescription: '导入 QuickBooks Online 员工记录并邀请员工加入此工作区。',
                createEntities: '自动创建实体',
                createEntitiesDescription: '如果供应商在 QuickBooks Online 中尚不存在，Expensify 会自动创建供应商，并在导出发票时自动创建客户。',
                reimbursedReportsDescription: '每当使用 Expensify ACH 支付报表时，系统都会在下方的 QuickBooks Online 账户中创建相应的账单付款记录。',
                qboBillPaymentAccount: 'QuickBooks 账单付款账户',
                qboInvoiceCollectionAccount: 'QuickBooks 发票收款账户',
                accountSelectDescription: '选择用于支付账单的账户，我们会在 QuickBooks Online 中创建这笔付款。',
                invoiceAccountSelectorDescription: '选择接收发票款项的账户，我们会在 QuickBooks Online 中创建这笔付款。',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: '借记卡',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '信用卡',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '供应商账单',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '日记账分录',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '支票',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    '我们会自动将借记卡交易中的商户名称与 QuickBooks 中对应的供应商进行匹配。如果不存在供应商，我们将创建一个名为“Debit Card Misc.”的供应商以进行关联。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    '我们会自动将信用卡交易中的商户名称与 QuickBooks 中任何对应的供应商进行匹配。如果不存在供应商，我们将创建一个名为“Credit Card Misc.”的供应商以便关联。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '我们将为每个 Expensify 报告按照最后一笔报销的日期创建一张分项供应商账单，并将其添加到下方账户中。如果该会计期间已结账，我们将记入下一个未结会计期间的第一天。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: '选择借记卡交易的导出位置。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '选择导出信用卡交易的去向。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '选择一个供应商，应用于所有信用卡交易。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: '启用地点后无法使用供应商账单。请选择其他导出选项。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '启用“地点”后无法使用支票功能。请选择其他导出选项。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '启用税费功能时无法使用分录导出。请选择其他导出选项。',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '为供应商账单导出选择一个有效的账户',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '为分录导出选择一个有效账户',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '为支票导出选择一个有效的账户',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '要使用应付账款账单导出功能，请在 QuickBooks Online 中设置应付账款账户',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '要使用分录导出功能，请在 QuickBooks Online 中设置一个日记账账户',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '要使用支票导出，请先在 QuickBooks Online 中设置银行账户',
            },
            noAccountsFound: '未找到账户',
            noAccountsFoundDescription: '在 QuickBooks Online 中添加该账户，然后再次同步连接。',
            accountingMethods: {
                label: '何时导出',
                description: '选择何时导出报销：',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '权责发生制',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '现金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自付报销将在最终批准后导出',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自付费用将在付款后导出',
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
            accountsDescription: '您的 Xero 会计科目表将作为类别导入到 Expensify。',
            accountsSwitchTitle: '选择将新账户导入为启用或停用的类别。',
            accountsSwitchDescription: '启用的类别将在成员创建报销时可供选择。',
            trackingCategories: '跟踪类别',
            trackingCategoriesDescription: '选择在 Expensify 中如何处理 Xero 跟踪类别。',
            mapTrackingCategoryTo: (categoryName: string) => `将 Xero 类别 ${categoryName} 映射到`,
            mapTrackingCategoryToDescription: (categoryName: string) => `选择在导出到 Xero 时将 ${categoryName} 映射到哪里。`,
            customers: '向客户重新开具账单',
            customersDescription: '选择是否在 Expensify 中向客户重新计费。你在 Xero 中的客户联系人可以被标记到报销中，并将作为销售发票导出到 Xero。',
            taxesDescription: '选择如何在 Expensify 中处理 Xero 税务。',
            notImported: '未导入',
            notConfigured: '未配置',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero 联系人默认值',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: '标签',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: '报表字段',
            },
            exportDescription: '配置 Expensify 数据导出到 Xero 的方式。',
            purchaseBill: '采购账单',
            exportDeepDiveCompanyCard: '导出的报销将作为银行交易记入下方的 Xero 银行账户，且交易日期将与您的银行对账单上的日期一致。',
            bankTransactions: '银行交易',
            xeroBankAccount: 'Xero 银行账户',
            xeroBankAccountDescription: '选择报销将作为银行交易入账的位置。',
            exportExpensesDescription: '报表将按照下方选择的日期和状态导出为一张采购账单。',
            purchaseBillDate: '采购账单日期',
            exportInvoices: '导出发票为',
            salesInvoice: '销售发票',
            exportInvoicesDescription: '销售发票始终显示发票发送的日期。',
            advancedConfig: {
                autoSyncDescription: 'Expensify 将每天自动与 Xero 同步。',
                purchaseBillStatusTitle: '采购账单状态',
                reimbursedReportsDescription: '每当使用 Expensify ACH 支付报表时，都会在下方的 Xero 账户中创建相应的账单付款记录。',
                xeroBillPaymentAccount: 'Xero 账单付款账户',
                xeroInvoiceCollectionAccount: 'Xero 发票回款账户',
                xeroBillPaymentAccountDescription: '选择用于支付账单的账户，我们会在 Xero 中创建这笔付款。',
                invoiceAccountSelectorDescription: '选择接收发票款项的账户，我们会在 Xero 中为您创建付款记录。',
            },
            exportDate: {
                label: '采购账单日期',
                description: '将报表导出到 Xero 时使用此日期。',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最近报销日期',
                        description: '报表中最新报销的日期。',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '导出日期',
                        description: '报表导出到 Xero 的日期。',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提交日期',
                        description: '报表提交审批的日期。',
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
            noAccountsFoundDescription: '请在 Xero 中添加该账户并重新同步连接',
            accountingMethods: {
                label: '何时导出',
                description: '选择何时导出报销：',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '权责发生制',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '现金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自付报销将在最终批准后导出',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自付费用将在付款后导出',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '首选导出方',
            taxSolution: '税务解决方案',
            notConfigured: '未配置',
            exportDate: {
                label: '导出日期',
                description: '导出报表到 Sage Intacct 时使用此日期。',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最近报销日期',
                        description: '报表中最新报销的日期。',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: '导出日期',
                        description: '报表导出到 Sage Intacct 的日期。',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '提交日期',
                        description: '报表提交审批的日期。',
                    },
                },
            },
            reimbursableExpenses: {
                description: '设置报销支出导出到 Sage Intacct 的方式。',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: '报销报告',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '供应商账单',
                },
            },
            nonReimbursableExpenses: {
                description: '设置公司信用卡消费导出到 Sage Intacct 的方式。',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: '信用卡',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '供应商账单',
                },
            },
            creditCardAccount: '信用卡账户',
            defaultVendor: '默认供应商',
            defaultVendorDescription: (isReimbursable: boolean) => `为没有在 Sage Intacct 中找到匹配供应商的${isReimbursable ? '' : '非'}可报销费用设置一个默认供应商。`,
            exportDescription: '配置 Expensify 数据导出到 Sage Intacct 的方式。',
            exportPreferredExporterNote: '首选导出人可以是任意工作区管理员，但如果你在“域设置”中为各个公司卡设置了不同的导出账户，则该导出人还必须是域管理员。',
            exportPreferredExporterSubNote: '设置完成后，首选导出人将在其账户中看到可导出的报表。',
            noAccountsFound: '未找到账户',
            noAccountsFoundDescription: `请在 Sage Intacct 中添加该账户，然后重新同步连接`,
            autoSync: '自动同步',
            autoSyncDescription: 'Expensify 将每天自动与 Sage Intacct 同步。',
            inviteEmployees: '邀请员工',
            inviteEmployeesDescription: '导入 Sage Intacct 员工记录，并邀请员工加入此工作区。您的审批流程将默认为管理者审批，且可在“成员”页面进行进一步配置。',
            syncReimbursedReports: '同步已报销报表',
            syncReimbursedReportsDescription: '每当使用 Expensify ACH 支付报表时，相应的账单付款将会在下方的 Sage Intacct 账户中创建。',
            paymentAccount: 'Sage Intacct 付款账户',
            accountingMethods: {
                label: '何时导出',
                description: '选择何时导出报销：',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '权责发生制',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '现金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自付报销将在最终批准后导出',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自付费用将在付款后导出',
                },
            },
        },
        netsuite: {
            subsidiary: '子公司',
            subsidiarySelectDescription: '选择要从中导入数据的 NetSuite 子公司。',
            exportDescription: '配置 Expensify 数据导出到 NetSuite 的方式。',
            exportInvoices: '导出发票至',
            journalEntriesTaxPostingAccount: '日记账分录税务过账科目',
            journalEntriesProvTaxPostingAccount: '日记账分录省税过账科目',
            foreignCurrencyAmount: '导出外币金额',
            exportToNextOpenPeriod: '导出到下一个未结期间',
            nonReimbursableJournalPostingAccount: '不可报销分录记账科目',
            reimbursableJournalPostingAccount: '可报销分录过账科目',
            journalPostingPreference: {
                label: '日记账分录过账偏好',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '每个报表一条逐项明细记录',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '每笔报销一条记录',
                },
            },
            invoiceItem: {
                label: '发票项目',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '帮我创建一个',
                        description: '在导出时，我们会为你创建一个“Expensify 发票行项目”（如果尚不存在）。',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '选择现有的',
                        description: '我们会将来自 Expensify 的发票关联到下方选定的项目。',
                    },
                },
            },
            exportDate: {
                label: '导出日期',
                description: '在将报表导出到 NetSuite 时使用此日期。',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最近报销日期',
                        description: '报表中最新报销的日期。',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: '导出日期',
                        description: '报表导出到 NetSuite 的日期。',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: '提交日期',
                        description: '报表提交审批的日期。',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: '报销报告',
                        reimbursableDescription: '自付报销将作为费用报表导出到 NetSuite。',
                        nonReimbursableDescription: '公司信用卡报销将作为报销报告导出到 NetSuite。',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '供应商账单',
                        reimbursableDescription: dedent(`
                            自掏腰包的报销将会以应付账单的形式导出给下方指定的 NetSuite 供应商。

                            如果你想为每张卡设置特定的供应商，请前往 *设置 > 域 > 公司卡*。
                        `),
                        nonReimbursableDescription: dedent(`
                            公司卡消费将以应付账单的形式导出给下方指定的 NetSuite 供应商。

                            如果你希望为每张卡设置单独的供应商，请前往 *设置 > 域 > 公司卡*。
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '日记账分录',
                        reimbursableDescription: dedent(`
                            个人垫付报销将作为日记账分录导出到下方指定的 NetSuite 账户。

                            如果你想为每张卡设置特定供应商，请前往 *设置 > 域 > 公司卡*。
                        `),
                        nonReimbursableDescription: dedent(`
                            公司卡费用将作为日记账分录导出到下方指定的 NetSuite 账户。

                            如果你想为每张卡设置特定的供应商，请前往 *Settings > Domains > Company Cards*。
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    '如果您将公司卡导出设置切换为报销单，单张卡片所使用的 NetSuite 供应商和入账科目将被停用。\n\n请放心，我们仍会保存您之前的选择，以便您日后需要时可以切换回来。',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify 将每天自动与 NetSuite 同步。',
                reimbursedReportsDescription: '每当使用 Expensify ACH 支付报表时，相应的账单付款都会在下面的 NetSuite 账户中创建。',
                reimbursementsAccount: '报销账户',
                reimbursementsAccountDescription: '选择你用于报销的银行账户，我们会在 NetSuite 中创建关联的付款。',
                collectionsAccount: '催收账户',
                collectionsAccountDescription: '一旦发票在 Expensify 中被标记为已支付并导出到 NetSuite，它就会显示在下面的账户中。',
                approvalAccount: '应付账款审批账户',
                approvalAccountDescription: '选择在 NetSuite 中用于审批交易对应入账的科目。如果你正在同步报销完成的报表，账单付款也会记入此科目。',
                defaultApprovalAccount: 'NetSuite 默认',
                inviteEmployees: '邀请员工并设置审批',
                inviteEmployeesDescription: '导入 NetSuite 员工记录并邀请员工加入此工作区。你的审批流程将默认为经理审批，并且可以在 *成员* 页面进行进一步配置。',
                autoCreateEntities: '自动创建员工/供应商',
                enableCategories: '启用新导入的类别',
                customFormID: '自定义表单 ID',
                customFormIDDescription: '默认情况下，Expensify 将使用在 NetSuite 中设置的首选交易表单来创建分录。或者，您也可以指定要使用的特定交易表单。',
                customFormIDReimbursable: '自付报销费用',
                customFormIDNonReimbursable: '公司卡报销',
                exportReportsTo: {
                    label: '报销报告审批级别',
                    description: '一旦报销单在 Expensify 中被批准并导出到 NetSuite，你就可以在过账之前在 NetSuite 中设置额外一级的审批流程。',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite 默认偏好设置',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '仅主管已批准',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '仅会计已批准',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '主管和会计已批准',
                    },
                },
                accountingMethods: {
                    label: '何时导出',
                    description: '选择何时导出报销：',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '权责发生制',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '现金',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自付报销将在最终批准后导出',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自付费用将在付款后导出',
                    },
                },
                exportVendorBillsTo: {
                    label: '供应商账单审批级别',
                    description: '一旦供应商账单在 Expensify 中获批并导出到 NetSuite，您就可以在 NetSuite 中在过账之前设置额外一级的审批流程。',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite 默认偏好设置',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '待审批',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '已批准过账',
                    },
                },
                exportJournalsTo: {
                    label: '日记账分录审批级别',
                    description: '一旦在 Expensify 中的日记账分录被批准并导出到 NetSuite，您可以在过账前在 NetSuite 中设置额外一级的审批。',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite 默认偏好设置',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '待审批',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '已批准过账',
                    },
                },
                error: {
                    customFormID: '请输入有效的数字自定义表单 ID',
                },
            },
            noAccountsFound: '未找到账户',
            noAccountsFoundDescription: '请在 NetSuite 中添加该账户并重新同步连接',
            noVendorsFound: '未找到供应商',
            noVendorsFoundDescription: '请在 NetSuite 中添加供应商，然后重新同步连接',
            noItemsFound: '未找到发票项目',
            noItemsFoundDescription: '请在 NetSuite 中添加发票项目，然后重新同步连接',
            noSubsidiariesFound: '未找到子公司',
            noSubsidiariesFoundDescription: '请在 NetSuite 中添加一个子公司，然后重新同步连接',
            tokenInput: {
                title: 'NetSuite 设置',
                formSteps: {
                    installBundle: {
                        title: '安装 Expensify 套件',
                        description: '在 NetSuite 中，依次进入 *Customization > SuiteBundler > Search & Install Bundles*，搜索 “Expensify”，然后安装该捆绑包。',
                    },
                    enableTokenAuthentication: {
                        title: '启用基于令牌的身份验证',
                        description: '在 NetSuite 中，前往 *Setup > Company > Enable Features > SuiteCloud*，然后启用 *token-based authentication*。',
                    },
                    enableSoapServices: {
                        title: '启用 SOAP Web 服务',
                        description: '在 NetSuite 中，前往 *Setup > Company > Enable Features > SuiteCloud*，然后启用 *SOAP Web Services*。',
                    },
                    createAccessToken: {
                        title: '创建访问令牌',
                        description:
                            '在 NetSuite 中，前往 *Setup > Users/Roles > Access Tokens*，为 “Expensify” 应用和 “Expensify Integration” 或 “Administrator” 角色创建一个访问令牌（access token）。\n\n*重要：* 请务必保存本步骤中的 *Token ID* 和 *Token Secret*。下一步将需要用到它们。',
                    },
                    enterCredentials: {
                        title: '输入您的 NetSuite 凭证',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite 帐户 ID',
                            netSuiteTokenID: '令牌 ID',
                            netSuiteTokenSecret: '令牌密钥',
                        },
                        netSuiteAccountIDDescription: '在 NetSuite 中，前往 *Setup > Integration > SOAP Web Services Preferences*。',
                    },
                },
            },
            import: {
                expenseCategories: '报销类别',
                expenseCategoriesDescription: '您的 NetSuite 费用类别将作为类别导入到 Expensify 中。',
                crossSubsidiaryCustomers: '跨子公司客户/项目',
                importFields: {
                    departments: {
                        title: '部门',
                        subtitle: '选择如何在 Expensify 中处理 NetSuite 的*部门*。',
                    },
                    classes: {
                        title: '类别',
                        subtitle: '选择如何在 Expensify 中处理 *类别*。',
                    },
                    locations: {
                        title: '地点',
                        subtitle: '选择在 Expensify 中如何处理*地点*。',
                    },
                },
                customersOrJobs: {
                    title: '客户/项目',
                    subtitle: '选择如何在 Expensify 中处理 NetSuite 的*客户*和*项目*。',
                    importCustomers: '导入客户',
                    importJobs: '导入项目',
                    customers: '客户',
                    jobs: '项目',
                    label: (importFields: string[], importType: string) => `${importFields.join('和')}, ${importType}`,
                },
                importTaxDescription: '从 NetSuite 导入税务组。',
                importCustomFields: {
                    chooseOptionBelow: '请选择以下一个选项：',
                    label: (importedTypes: string[]) => `已作为 ${importedTypes.join('和')} 导入`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `请输入${fieldName}`,
                    customSegments: {
                        title: '自定义分段/记录',
                        addText: '添加自定义分类/记录',
                        recordTitle: '自定义分段/记录',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '查看详细说明',
                        helpText: '关于配置自定义分段/记录。',
                        emptyTitle: '添加自定义段或自定义记录',
                        fields: {
                            segmentName: '姓名',
                            internalID: '内部 ID',
                            scriptID: '脚本 ID',
                            customRecordScriptID: '交易列 ID',
                            mapping: '显示为',
                        },
                        removeTitle: '移除自定义分段/记录',
                        removePrompt: '确定要删除此自定义段/记录吗？',
                        addForm: {
                            customSegmentName: '自定义细分名称',
                            customRecordName: '自定义记录名称',
                            segmentTitle: '自定义分段',
                            customSegmentAddTitle: '添加自定义维度',
                            customRecordAddTitle: '添加自定义记录',
                            recordTitle: '自定义记录',
                            segmentRecordType: '您想添加自定义段还是自定义记录？',
                            customSegmentNameTitle: '自定义分段名称是什么？',
                            customRecordNameTitle: '自定义记录名称是什么？',
                            customSegmentNameFooter: `您可以在 NetSuite 中的 *Customizations > Links, Records & Fields > Custom Segments* 页面找到自定义分段名称。

_如需更详细的说明，请[访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_。`,
                            customRecordNameFooter: `您可以在 NetSuite 全局搜索中输入“Transaction Column Field”来查找自定义记录名称。

_如需更详细的说明，请[访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})。_`,
                            customSegmentInternalIDTitle: '内部 ID 是什么？',
                            customSegmentInternalIDFooter: `首先，请确保您已在 NetSuite 中启用内部 ID：进入 *Home > Set Preferences > Show Internal ID*。

您可以在 NetSuite 中通过以下步骤找到自定义段（custom segment）的内部 ID：

1. 依次进入 *Customization > Lists, Records, & Fields > Custom Segments*。
2. 点击进入某个自定义段。
3. 点击 *Custom Record Type* 旁边的超链接。
4. 在底部的表格中找到内部 ID。

_如需更详细的操作说明，[请访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_。`,
                            customRecordInternalIDFooter: `您可以按照以下步骤在 NetSuite 中找到自定义记录的内部 ID：

1. 在全局搜索中输入“Transaction Line Fields”。
2. 点击进入一个自定义记录。
3. 在左侧找到内部 ID。

_如需更详细的说明，[请访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_。`,
                            customSegmentScriptIDTitle: '脚本 ID 是什么？',
                            customSegmentScriptIDFooter: `您可以在 NetSuite 中通过以下路径找到自定义段脚本 ID：  

1. *Customization > Lists, Records, & Fields > Custom Segments*  
2. 点击进入某一个自定义段。  
3. 点击页面底部附近的 *Application and Sourcing* 选项卡，然后：  
   a. 如果您想在 Expensify 中将自定义段显示为 *标签*（行项目级别），请点击 *Transaction Columns* 子选项卡，并使用 *Field ID*。  
   b. 如果您想在 Expensify 中将自定义段显示为 *报表字段*（报表级别），请点击 *Transactions* 子选项卡，并使用 *Field ID*。  

_如需更详细的说明，请[访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_。`,
                            customRecordScriptIDTitle: '交易列的 ID 是什么？',
                            customRecordScriptIDFooter: `您可以在 NetSuite 中通过以下步骤找到自定义记录脚本 ID：

1. 在全局搜索中输入 “Transaction Line Fields”。
2. 点击进入一个自定义记录。
3. 在左侧找到脚本 ID。

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
                            listName: '姓名',
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

_如需更详细的说明，请[访问我们的帮助网站](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})。_`,
                            mappingTitle: '此自定义列表应如何在 Expensify 中显示？',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `已存在使用此交易字段 ID 的自定义列表`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuite 员工默认设置',
                        description: '未导入到 Expensify，导出时应用',
                        footerContent: (importField: string) => `如果你在 NetSuite 中使用 ${importField}，我们将在导出到费用报表或日记账分录时应用员工记录上设置的默认值。`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: '标签',
                        description: '逐项级别',
                        footerContent: (importField: string) => `${startCase(importField)} 将可在员工报表中的每一笔单独报销中选择。`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: '报表字段',
                        description: '报表级别',
                        footerContent: (importField: string) => `${startCase(importField)} 选择将应用于员工报表中的所有费用。`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct 设置',
            prerequisitesTitle: '在你连接之前…',
            downloadExpensifyPackage: '下载适用于 Sage Intacct 的 Expensify 安装包',
            followSteps: '请按照我们的《操作指南：连接 Sage Intacct》中的步骤进行操作',
            enterCredentials: '输入您的 Sage Intacct 凭证',
            entity: '实体',
            employeeDefault: 'Sage Intacct 员工默认设置',
            employeeDefaultDescription: '如果存在默认部门，员工的默认部门将会在 Sage Intacct 中应用到其报销费用上。',
            displayedAsTagDescription: '员工报销单上的每一笔费用都可以单独选择部门。',
            displayedAsReportFieldDescription: '部门选择将应用于员工报表中的所有报销。',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `选择在 Expensify 中如何处理 Sage Intacct 的 <strong>${mappingTitle}</strong>。`,
            expenseTypes: '报销类型',
            expenseTypesDescription: '您的 Sage Intacct 费用类型将作为类别导入到 Expensify 中。',
            accountTypesDescription: '您的 Sage Intacct 科目表将作为类别导入到 Expensify 中。',
            importTaxDescription: '从 Sage Intacct 导入采购税率。',
            userDefinedDimensions: '用户定义维度',
            addUserDefinedDimension: '添加用户自定义维度',
            integrationName: '集成名称',
            dimensionExists: '已存在使用此名称的维度。',
            removeDimension: '移除用户自定义维度',
            removeDimensionPrompt: '确定要移除此用户自定义维度吗？',
            userDefinedDimension: '自定义维度',
            addAUserDefinedDimension: '添加用户自定义维度',
            detailedInstructionsLink: '查看详细说明',
            detailedInstructionsRestOfSentence: '关于添加用户自定义维度。',
            userDimensionsAdded: () => ({
                one: '已添加 1 个 UDD',
                other: (count: number) => `已添加 ${count} 个 UDD`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '部门';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return '课程';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return '地点';
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
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: '无法加载卡片馈送',
                workspaceFeedsCouldNotBeLoadedMessage: '加载工作区卡片信息流时出错。请重试或联系您的管理员。',
                feedCouldNotBeLoadedTitle: '无法加载此信息流',
                feedCouldNotBeLoadedMessage: '加载此订阅源时发生错误。请重试或联系您的管理员。',
                tryAgain: '重试',
            },
            addNewCard: {
                other: '其他',
                cardProviders: {
                    gl1025: 'American Express 企业卡',
                    cdf: 'Mastercard 商务卡',
                    vcf: 'Visa 商务卡',
                    stripe: 'Stripe 卡片',
                },
                yourCardProvider: `您的发卡机构是谁？`,
                whoIsYourBankAccount: '你的银行是哪个？',
                whereIsYourBankLocated: '你的银行位于哪里？',
                howDoYouWantToConnect: '你想如何连接到你的银行账户？',
                learnMoreAboutOptions: `<muted-text>详细了解这些<a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">选项</a>。</muted-text>`,
                commercialFeedDetails: '需要与你的银行进行设置。通常由较大的公司使用，如果你符合条件，这往往是最佳选项。',
                commercialFeedPlaidDetails: `需要与你的银行进行设置，但我们会引导你完成。此功能通常仅限于大型公司使用。`,
                directFeedDetails: '最简单的方法。立即使用你的主凭证进行连接。这是最常见的方法。',
                enableFeed: {
                    title: (provider: string) => `启用你的 ${provider} 数据馈送`,
                    heading: '我们已与您的发卡机构直接集成，可将您的交易数据快速、准确地导入 Expensify。\n\n开始之前，只需：',
                    visa: '我们在全球范围内与 Visa 集成，但资格要求因银行和卡片计划而异。\n\n要开始使用，只需：',
                    mastercard: '我们与 Mastercard 有全球整合，但资格会因发卡银行和卡片项目而异。\n\n开始使用，只需：',
                    vcf: `1. 请访问[此帮助文章](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})，查看如何设置 Visa 商务卡的详细说明。

2. 请[联系您的银行](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})，确认他们是否支持您项目的商务数据连接，并请求他们为您启用。

3. *在数据连接启用且您获得其详细信息后，请继续到下一屏。*`,
                    gl1025: `1. 访问[此帮助文章](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP})，了解 American Express 是否可以为你的项目启用商业卡交易通道。

2. 交易通道启用后，Amex 会向你发送一封正式函件。

3. *获取交易通道信息后，继续到下一屏。*`,
                    cdf: `1. 请访问[此帮助文章](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})，查看如何设置您的 Mastercard 商务卡的详细指南。

2. [联系您的银行](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})，确认他们是否支持您项目的商务卡数据连接，并请求他们为您启用。

3. *一旦数据连接已启用并且您拿到了相关详细信息，请继续前往下一屏。*`,
                    stripe: `1. 访问 Stripe 的控制面板，然后前往 [设置](${CONST.COMPANY_CARDS_STRIPE_HELP})。

2. 在“产品集成”下，点击 Expensify 旁边的“启用”。

3. 启用数据源后，点击下方的“提交”，我们将开始为您添加。`,
                },
                whatBankIssuesCard: '这些卡是由哪家银行发行的？',
                enterNameOfBank: '输入银行名称',
                feedDetails: {
                    vcf: {
                        title: 'Visa 交易导入的详细信息是什么？',
                        processorLabel: '处理器 ID',
                        bankLabel: '金融机构（银行）ID',
                        companyLabel: '公司 ID',
                        helpLabel: '我在哪里可以找到这些 ID？',
                    },
                    gl1025: {
                        title: `Amex 交付文件的名称是什么？`,
                        fileNameLabel: '交付文件名称',
                        helpLabel: '我在哪里可以找到传送文件名？',
                    },
                    cdf: {
                        title: `Mastercard 分发 ID 是什么？`,
                        distributionLabel: '分配 ID',
                        helpLabel: '我在哪里可以找到分发 ID？',
                    },
                },
                amexCorporate: '如果您的卡片正面标有“Corporate”，请选择此项',
                amexBusiness: '如果您的卡片正面标有“Business”，请选择此项',
                amexPersonal: '如果这些卡是个人卡，请选择此项',
                error: {
                    pleaseSelectProvider: '请先选择一个发卡机构，然后再继续',
                    pleaseSelectBankAccount: '在继续之前请选择一个银行账户',
                    pleaseSelectBank: '请先选择一个银行，然后再继续',
                    pleaseSelectCountry: '请先选择一个国家，然后再继续',
                    pleaseSelectFeedType: '在继续之前请选择一个订阅类型',
                },
                exitModal: {
                    title: '有什么问题吗？',
                    prompt: '我们注意到你还没有完成添加银行卡。如果遇到问题，请告诉我们，以便我们帮助你恢复正常进度。',
                    confirmText: '报告问题',
                    cancelText: '跳过',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: '每月的最后一天',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: '每月最后一个工作日',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: '自定义每月日期',
            },
            assign: '分配',
            assignCard: '分配卡片',
            findCard: '查找卡片',
            cardNumber: '卡号',
            commercialFeed: '商业订阅源',
            feedName: (feedName: string) => `${feedName} 卡片`,
            directFeed: '直接数据连接',
            whoNeedsCardAssigned: '谁需要分配一张卡？',
            chooseTheCardholder: '选择持卡人',
            chooseCard: '选择一张卡片',
            chooseCardFor: (assignee: string) => `为 <strong>${assignee}</strong> 选择一张卡片。找不到你要的卡片？<concierge-link>告诉我们。</concierge-link>`,
            noActiveCards: '此流水中没有有效卡片',
            somethingMightBeBroken:
                '<muted-text><centered-text>或者可能出现了某些问题。无论如何，如果你有任何疑问，请随时<concierge-link>联系 Concierge</concierge-link>。</centered-text></muted-text>',
            chooseTransactionStartDate: '选择交易开始日期',
            startDateDescription: '选择导入的开始日期。我们将从该日期起同步所有交易。',
            editStartDateDescription: '选择一个新的交易起始日期。我们将从该日期开始同步所有交易，但不包括已导入的交易。',
            fromTheBeginning: '从头开始',
            customStartDate: '自定义开始日期',
            customCloseDate: '自定义截止日期',
            letsDoubleCheck: '我们再仔细检查一下，确保一切都正确。',
            confirmationDescription: '我们将立即开始导入交易。',
            card: '卡',
            cardName: '卡片名称',
            brokenConnectionError: '<rbr>卡片流水连接已中断。请<a href="#">登录您的网上银行</a>，以便我们重新建立连接。</rbr>',
            assignedCard: (assignee: string, link: string) => `已将${assignee}分配了一个${link}！导入的交易将显示在此聊天中。`,
            companyCard: '公司卡',
            chooseCardFeed: '选择卡片流水来源',
            ukRegulation:
                'Expensify Limited 是 Plaid Financial Ltd. 的代理，Plaid Financial Ltd. 是一家根据 2017 年《支付服务条例》受金融行为监管局（Financial Conduct Authority）监管的获授权支付机构（公司参考编号：804718）。Plaid 通过其代理 Expensify Limited 向您提供受监管的账户信息服务。',
            assignCardFailedError: '分配卡片失败。',
            unassignCardFailedError: '卡片取消分配失败。',
            cardAlreadyAssignedError: '此卡片已分配给另一个工作区中的一位用户。',
            importTransactions: {
                title: '从文件导入交易',
                description: '请调整文件设置，这些设置将在导入时生效。',
                cardDisplayName: '卡片显示名称',
                currency: '货币',
                transactionsAreReimbursable: '交易可报销',
                flipAmountSign: '翻转金额符号',
                importButton: '导入交易',
            },
        },
        expensifyCard: {
            issueAndManageCards: '发放并管理您的 Expensify 卡片',
            getStartedIssuing: '从发放您的首张虚拟卡或实体卡开始使用。',
            verificationInProgress: '正在验证中…',
            verifyingTheDetails: '我们正在核实一些信息。Expensify 卡可以发行时，Concierge 会通知你。',
            disclaimer:
                'Expensify Visa® 商用卡由 The Bancorp Bank, N.A.（FDIC 会员）根据从 Visa U.S.A. Inc. 获得的许可发行，且可能无法在所有接受 Visa 卡的商户处使用。Apple® 和 Apple 标志® 是 Apple Inc. 在美国和其他国家注册的商标。App Store 是 Apple Inc. 的服务标志。Google Play 和 Google Play 标志是 Google LLC 的商标。',
            euUkDisclaimer:
                '向欧洲经济区（EEA）居民提供的卡片由 Transact Payments Malta Limited 发行，向英国居民提供的卡片由 Transact Payments Limited 根据 Visa Europe Limited 授权发行。Transact Payments Malta Limited 依照《1994 年金融机构法》获马耳他金融服务管理局正式授权并监管，作为一家金融机构运营。注册号 C 91879。Transact Payments Limited 获直布罗陀金融服务委员会授权并监管。',
            issueCard: '发卡',
            findCard: '查找卡片',
            newCard: '新卡片',
            name: '姓名',
            lastFour: '末四位',
            limit: '限额',
            currentBalance: '当前余额',
            currentBalanceDescription: '当前余额是自上次结算日期以来已入账的所有 Expensify Card 交易的总和。',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `余额将于 ${settlementDate} 结清`,
            settleBalance: '结清余额',
            cardLimit: '卡片限额',
            remainingLimit: '剩余额度',
            requestLimitIncrease: '请求提高限额',
            remainingLimitDescription:
                '在计算您的剩余额度时，我们会考虑多个因素：您作为客户的服务期限、您在注册时提供的与业务相关的信息，以及您企业银行账户中的可用现金。您的剩余额度可能会每天发生变化。',
            earnedCashback: '返现',
            earnedCashbackDescription: '现金返现余额基于您工作区内已结算的每月 Expensify Card 支出计算。',
            issueNewCard: '发新卡',
            finishSetup: '完成设置',
            chooseBankAccount: '选择银行账户',
            chooseExistingBank: '选择一个现有的企业银行账户来支付你的 Expensify 卡余额，或添加一个新的银行账户',
            accountEndingIn: '账户尾号',
            addNewBankAccount: '添加新银行账户',
            settlementAccount: '结算账户',
            settlementAccountDescription: '选择一个账户来支付你的 Expensify 卡余额。',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `请确保此账户与您的<a href="${reconciliationAccountSettingsLink}">对账账户</a>（${accountNumber}）一致，以确保持续对账功能正常运行。`,
            settlementFrequency: '结算频率',
            settlementFrequencyDescription: '选择支付 Expensify Card 余额的频率。',
            settlementFrequencyInfo: '如果你想切换为按月结算，你需要通过 Plaid 连接你的银行账户，并且拥有过去 90 天的正余额记录。',
            frequency: {
                daily: '每日',
                monthly: '每月',
            },
            cardDetails: '卡片详情',
            cardPending: ({name}: {name: string}) => `该卡当前为待处理状态，在验证完 ${name} 的账户后将予以发放。`,
            virtual: '虚拟',
            physical: '实体',
            deactivate: '停用卡片',
            changeCardLimit: '更改卡片限额',
            changeLimit: '更改限额',
            smartLimitWarning: (limit: number | string) => `如果您将此卡的额度更改为 ${limit}，在您批准卡上的更多报销前，新交易将会被拒绝。`,
            monthlyLimitWarning: (limit: number | string) => `如果您将此卡的限额更改为 ${limit}，在下个月之前新增交易都将被拒绝。`,
            fixedLimitWarning: (limit: number | string) => `如果您将此卡的额度更改为 ${limit}，新的交易将会被拒绝。`,
            changeCardLimitType: '更改银行卡限额类型',
            changeLimitType: '更改限额类型',
            changeCardSmartLimitTypeWarning: (limit: number | string) => `如果您将此卡的限额类型更改为智能限额，新交易将会被拒绝，因为未批准的 ${limit} 限额已用完。`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) => `如果将此卡的额度类型更改为“每月”，新的交易将被拒绝，因为已达到 ${limit} 的每月额度上限。`,
            addShippingDetails: '添加配送详情',
            issuedCard: (assignee: string) => `已为 ${assignee} 发行了一张 Expensify 卡！该卡将在 2–3 个工作日内送达。`,
            issuedCardNoShippingDetails: (assignee: string) => `已为${assignee}发放一张 Expensify 卡！在确认邮寄详情后，该卡将会寄出。`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `已向 ${assignee} 发放一张虚拟 Expensify 卡！${link} 可立即使用。`,
            addedShippingDetails: (assignee: string) => `${assignee} 已添加邮寄详情。Expensify Card 将在 2-3 个工作日内送达。`,
            replacedCard: (assignee: string) => `${assignee} 已更换他们的 Expensify Card。新卡将在 2-3 个工作日内送达。`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} 已更换其虚拟 Expensify 卡！${link} 可立即使用。`,
            card: '卡',
            replacementCard: '补发卡',
            verifyingHeader: '正在验证',
            bankAccountVerifiedHeader: '银行账户已验证',
            verifyingBankAccount: '正在验证银行账户…',
            verifyingBankAccountDescription: '请稍候，我们正在确认此账户是否可以用于发放 Expensify 卡。',
            bankAccountVerified: '银行账户已验证！',
            bankAccountVerifiedDescription: '您现在可以向工作区成员发放 Expensify 卡。',
            oneMoreStep: '还差一步…',
            oneMoreStepDescription: '看起来我们需要手动验证您的银行账户。请前往 Concierge 查看为您准备的具体操作说明。',
            gotIt: '明白了',
            goToConcierge: '前往 Concierge',
        },
        categories: {
            deleteCategories: '删除类别',
            deleteCategoriesPrompt: '确定要删除这些类别吗？',
            deleteCategory: '删除类别',
            deleteCategoryPrompt: '确定要删除此类别吗？',
            disableCategories: '禁用类别',
            disableCategory: '禁用类别',
            enableCategories: '启用类别',
            enableCategory: '启用类别',
            defaultSpendCategories: '默认支出类别',
            spendCategoriesDescription: '自定义信用卡交易和扫描收据中商户支出的分类方式。',
            deleteFailureMessage: '删除类别时出错，请重试',
            categoryName: '类别名称',
            requiresCategory: '成员必须为所有报销分类',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) => `要导出到 ${connectionName}，所有报销必须先进行分类。`,
            subtitle: '更好地了解资金的支出去向。使用我们的默认类别，或添加您自己的类别。',
            emptyCategories: {
                title: '你还没有创建任何类别',
                subtitle: '添加类别以组织您的支出。',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>您的类别目前正从会计连接中导入。前往<a href="${accountingPageURL}">会计</a>页面进行任何更改。</centered-text></muted-text>`,
            },
            updateFailureMessage: '更新类别时出错，请重试',
            createFailureMessage: '创建类别时出错，请重试',
            addCategory: '添加类别',
            editCategory: '编辑类别',
            editCategories: '编辑类别',
            findCategory: '查找类别',
            categoryRequiredError: '分类名称为必填项',
            existingCategoryError: '已存在同名类别',
            invalidCategoryName: '类别名称无效',
            importedFromAccountingSoftware: '以下类别是从您的',
            payrollCode: '工资代码',
            updatePayrollCodeFailureMessage: '更新工资代码时出错，请重试',
            glCode: '总账代码',
            updateGLCodeFailureMessage: '更新总账科目代码时出错，请重试',
            importCategories: '导入类别',
            cannotDeleteOrDisableAllCategories: {
                title: '无法删除或停用所有类别',
                description: `由于您的工作区需要类别，至少必须保留一个已启用的类别。`,
            },
        },
        moreFeatures: {
            subtitle: '随着业务发展，使用下方切换开关启用更多功能。每项功能都会出现在导航菜单中，便于进一步自定义。',
            spendSection: {
                title: '支出',
                subtitle: '启用有助于扩大发展团队规模的功能。',
            },
            manageSection: {
                title: '管理',
                subtitle: '添加控制措施，帮助将支出控制在预算范围内。',
            },
            earnSection: {
                title: '赚取',
                subtitle: '简化营收流程，加快收款速度。',
            },
            organizeSection: {
                title: '整理',
                subtitle: '分组并分析支出，记录每一笔已付税款。',
            },
            integrateSection: {
                title: '集成',
                subtitle: '将 Expensify 连接到常用的金融产品。',
            },
            distanceRates: {
                title: '行程费率',
                subtitle: '添加、更新并强制执行费率。',
            },
            perDiem: {
                title: '每日补贴',
                subtitle: '设置每日津贴标准以控制员工日常支出。',
            },
            travel: {
                title: '差旅',
                subtitle: '预订、管理并对账您的所有商务出行。',
                getStarted: {
                    title: '开始使用 Expensify Travel',
                    subtitle: '我们只需要再了解一些您的业务信息，然后您就可以起飞了。',
                    ctaText: '出发吧',
                },
                reviewingRequest: {
                    title: '收拾行囊吧，我们已经收到你的请求……',
                    subtitle: '我们正在审核你启用 Expensify Travel 的请求。别担心，准备就绪后我们会通知你。',
                    ctaText: '请求已发送',
                },
                bookOrManageYourTrip: {
                    title: '预订或管理您的行程',
                    subtitle: '使用 Expensify Travel 获取最佳出行优惠，并在一个地方管理您所有的商务报销。',
                    ctaText: '预订或管理',
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: '差旅预订',
                        subtitle: '恭喜！您已准备就绪，可以在此工作区预订和管理差旅。',
                        manageTravelLabel: '管理差旅',
                    },
                    centralInvoicingSection: {
                        title: '集中开票',
                        subtitle: '将所有差旅支出集中到每月发票中，而不是在购买时单独付款。',
                        learnHow: '了解如何操作。',
                        subsections: {
                            currentTravelSpendLabel: '当前差旅支出',
                            currentTravelSpendCta: '支付余额',
                            currentTravelLimitLabel: '当前差旅限额',
                            settlementAccountLabel: '结算账户',
                            settlementFrequencyLabel: '结算频率',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Expensify 卡',
                subtitle: '深入洞察并掌控支出。',
                disableCardTitle: '停用 Expensify 卡',
                disableCardPrompt: '你无法停用 Expensify Card，因为它已在使用中。请联系 Concierge 以获取下一步操作指引。',
                disableCardButton: '与 Concierge 聊天',
                feed: {
                    title: '获取 Expensify Card',
                    subTitle: '简化您的业务报销流程，最多可节省 50% 的 Expensify 账单费用，并且还能：',
                    features: {
                        cashBack: '每一笔美国消费都能获得返现',
                        unlimited: '无限虚拟卡',
                        spend: '支出管控和自定义限额',
                    },
                    ctaTitle: '发新卡',
                },
            },
            companyCards: {
                title: '公司卡片',
                subtitle: '连接你已有的银行卡。',
                feed: {
                    title: '自带卡片（BYOC）',
                    subtitle: '关联你已有的卡片，以自动导入交易、匹配收据并完成对账。',
                    features: {
                        support: '连接来自超过 10,000 家银行的银行卡',
                        assignCards: '关联你团队的现有卡片',
                        automaticImport: '我们会自动导入交易记录',
                    },
                },
                bankConnectionError: '银行连接问题',
                connectWithPlaid: '通过 Plaid 连接',
                connectWithExpensifyCard: '试用 Expensify 卡。',
                bankConnectionDescription: `请尝试重新添加您的银行卡。否则，您可以`,
                disableCardTitle: '停用公司信用卡',
                disableCardPrompt: '你无法停用公司卡，因为此功能正在使用中。请联系 Concierge 获取下一步操作指引。',
                disableCardButton: '与 Concierge 聊天',
                cardDetails: '卡片详情',
                cardNumber: '卡号',
                cardholder: '持卡人',
                cardName: '卡片名称',
                allCards: '所有卡片',
                assignedCards: '已分配',
                unassignedCards: '未分配',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} 导出` : `${integration} 导出`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `选择要导出交易的 ${integration} 账户。`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `选择要导出交易记录的 ${integration} 账户。选择不同的<a href="${exportPageLink}">导出选项</a>以更改可用账户。`,
                lastUpdated: '最近更新',
                transactionStartDate: '交易开始日期',
                updateCard: '更新卡片',
                unassignCard: '取消分配卡片',
                unassign: '取消分配',
                unassignCardDescription: '取消分配此卡将从持卡人账户中移除所有处于草稿报表中的交易。',
                assignCard: '分配卡片',
                cardFeedName: '银行卡流水名称',
                cardFeedNameDescription: '为此卡片流水命名一个唯一名称，以便与其他流水区分开来。',
                cardFeedTransaction: '删除交易',
                cardFeedTransactionDescription: '选择是否允许持卡人删除卡片交易。新交易将遵循这些规则。',
                cardFeedRestrictDeletingTransaction: '限制删除交易',
                cardFeedAllowDeletingTransaction: '允许删除交易',
                removeCardFeed: '移除卡片交易导入',
                removeCardFeedTitle: (feedName: string) => `移除 ${feedName} 连接`,
                removeCardFeedDescription: '确定要移除此卡片流水吗？这将取消分配所有卡片。',
                error: {
                    feedNameRequired: '必须填写卡片流水名称',
                    statementCloseDateRequired: '请选择账单结算日期。',
                },
                corporate: '限制删除交易',
                personal: '允许删除交易',
                setFeedNameDescription: '为此卡片流水命名一个独特的名称，以便与其他区分开来',
                setTransactionLiabilityDescription: '启用后，持卡人可以删除卡片交易。新交易将遵循此规则。',
                emptyAddedFeedTitle: '此列表中没有卡片',
                emptyAddedFeedDescription: '请确保您的银行发卡流水中有卡片。',
                pendingFeedTitle: `我们正在审核你的请求…`,
                pendingFeedDescription: `我们目前正在审核您的订阅源详情。完成后，我们会通过以下方式联系您`,
                pendingBankTitle: '检查你的浏览器窗口',
                pendingBankDescription: (bankName: string) => `请通过刚刚打开的浏览器窗口连接到 ${bankName}。如果没有打开浏览器窗口，`,
                pendingBankLink: '请点击此处',
                giveItNameInstruction: '给这张卡片起一个与众不同的名字。',
                updating: '正在更新…',
                neverUpdated: '从不',
                noAccountsFound: '未找到账户',
                defaultCard: '默认卡片',
                downgradeTitle: `无法降级工作区`,
                downgradeSubTitle: `无法降级此工作区，因为已连接多个银行卡流水（不包括 Expensify Cards）。请<a href="#">仅保留一个银行卡流水</a>后再继续。`,
                noAccountsFoundDescription: (connection: string) => `请在 ${connection} 中添加该账户，然后再次同步该连接`,
                expensifyCardBannerTitle: '获取 Expensify Card',
                expensifyCardBannerSubtitle: '每一笔美国消费都可享受返现，Expensify 账单最高可减免 50%，无限量虚拟卡等更多精彩优惠。',
                expensifyCardBannerLearnMoreButton: '了解详情',
                statementCloseDateTitle: '对账单结算日期',
                statementCloseDateDescription: '请告知我们您的信用卡结单日，我们会在 Expensify 中创建一份对应的结单。',
            },
            workflows: {
                title: '工作流程',
                subtitle: '配置支出如何审批和支付。',
                disableApprovalPrompt: '此工作区中的 Expensify Cards 目前依赖审批来设定其智能限额。请在停用审批之前，先修改所有使用智能限额的 Expensify Cards 的限额类型。',
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
                title: '税务',
                subtitle: '记录并申报可抵扣税款。',
            },
            reportFields: {
                title: '报表字段',
                subtitle: '为支出设置自定义字段。',
            },
            connections: {
                title: '会计',
                subtitle: '同步您的会计科目表等数据。',
            },
            receiptPartners: {
                title: '收据合作伙伴',
                subtitle: '自动导入收据。',
            },
            connectionsWarningModal: {
                featureEnabledTitle: '先别急…',
                featureEnabledText: '若要启用或停用此功能，您需要更改您的会计导入设置。',
                disconnectText: '若要停用会计功能，您需要将工作区与会计系统的连接断开。',
                manageSettings: '管理设置',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: '断开 Uber 连接',
                disconnectText: '要禁用此功能，请先断开 Uber for Business 集成。',
                description: '确定要断开此集成吗？',
                confirmText: '明白了',
            },
            workflowWarningModal: {
                featureEnabledTitle: '先别急…',
                featureEnabledText: '此工作区中的 Expensify Cards 依赖审批流程来定义其智能限额。\n\n在停用审批流程之前，请先更改所有使用智能限额的卡片的限额类型。',
                confirmText: '前往 Expensify 卡片',
            },
            rules: {
                title: '规则',
                subtitle: '要求收据、标记高额支出等。',
            },
            timeTracking: {
                title: '时间',
                subtitle: '为工时跟踪设置可计费的小时费率。',
                defaultHourlyRate: '默认时薪',
            },
        },
        reports: {
            reportsCustomTitleExamples: '示例：',
            customReportNamesSubtitle: `<muted-text>使用我们的<a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">丰富公式</a>自定义报表标题。</muted-text>`,
            customNameTitle: '默认报表标题',
            customNameDescription: `使用我们的<a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">强大公式</a>为报销报告自定义名称。`,
            customNameInputLabel: '姓名',
            customNameEmailPhoneExample: '成员的电子邮箱或电话：{report:submit:from}',
            customNameStartDateExample: '报表开始日期：{report:startdate}',
            customNameWorkspaceNameExample: '工作区名称：{report:workspacename}',
            customNameReportIDExample: '报销单 ID：{report:id}',
            customNameTotalExample: '总计：{report:total}。',
            preventMembersFromChangingCustomNamesTitle: '禁止成员更改自定义报表标题',
        },
        reportFields: {
            addField: '添加字段',
            delete: '删除字段',
            deleteFields: '删除字段',
            findReportField: '查找报表字段',
            deleteConfirmation: '确定要删除此报表字段吗？',
            deleteFieldsConfirmation: '确定要删除这些报表字段吗？',
            emptyReportFields: {
                title: '您尚未创建任何报表字段',
                subtitle: '添加一个会显示在报表上的自定义字段（文本、日期或下拉菜单）。',
            },
            subtitle: '报告字段适用于所有支出，并且在你希望提示填写额外信息时会很有帮助。',
            disableReportFields: '禁用报表字段',
            disableReportFieldsConfirmation: '确定要继续吗？文本和日期字段将被删除，列表将被禁用。',
            importedFromAccountingSoftware: '以下报表字段是从您的',
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
            initialValueInputSubtitle: '输入要在报表字段中显示的起始值。',
            listValuesInputSubtitle: '这些值将显示在报表字段的下拉菜单中。已启用的值可供成员选择。',
            listInputSubtitle: '这些值将显示在你的报表字段列表中。已启用的值可供成员选择。',
            deleteValue: '删除值',
            deleteValues: '删除值',
            disableValue: '禁用值',
            disableValues: '禁用值',
            enableValue: '启用值',
            enableValues: '启用值',
            emptyReportFieldsValues: {
                title: '您尚未创建任何列表值',
                subtitle: '添加要显示在报告中的自定义值。',
            },
            deleteValuePrompt: '确定要删除此列表值吗？',
            deleteValuesPrompt: '确定要删除这些列表值吗？',
            listValueRequiredError: '请输入列表值名称',
            existingListValueError: '已存在使用该名称的列表值',
            editValue: '编辑数值',
            listValues: '列出值',
            addValue: '增加价值',
            existingReportFieldNameError: '已存在同名的报表字段',
            reportFieldNameRequiredError: '请输入报表字段名称',
            reportFieldTypeRequiredError: '请选择报表字段类型',
            circularReferenceError: '此字段不能引用自身。请更新。',
            reportFieldInitialValueRequiredError: '请选择报表字段的初始值',
            genericFailureMessage: '更新报表字段时发生错误。请重试。',
        },
        tags: {
            tagName: '标签名称',
            requiresTag: '成员必须为所有报销添加标签',
            trackBillable: '跟踪可计费报销费用',
            customTagName: '自定义标签名称',
            enableTag: '启用标签',
            enableTags: '启用标签',
            requireTag: '必填标签',
            requireTags: '必填标签',
            notRequireTags: '不必要求',
            disableTag: '禁用标签',
            disableTags: '禁用标签',
            addTag: '添加标签',
            editTag: '编辑标签',
            editTags: '编辑标签',
            findTag: '查找标签',
            subtitle: '标签可以更详细地分类成本。',
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>您正在使用<a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">依赖标签</a>。您可以<a href="${importSpreadsheetLink}">重新导入电子表格</a>来更新您的标签。</muted-text>`,
            emptyTags: {
                title: '你还没有创建任何标签',
                subtitle: '添加标签以跟踪项目、地点、部门等。',
                subtitleHTML: `<muted-text><centered-text>添加标签以跟踪项目、地点、部门等。<a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">了解更多</a>关于用于导入的标签文件格式要求。</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>您的标签目前正从会计连接中导入。前往<a href="${accountingPageURL}">会计</a>以进行任何更改。</centered-text></muted-text>`,
            },
            deleteTag: '删除标签',
            deleteTags: '删除标签',
            deleteTagConfirmation: '您确定要删除此标签吗？',
            deleteTagsConfirmation: '确定要删除这些标签吗？',
            deleteFailureMessage: '删除标签时出错，请重试',
            tagRequiredError: '标签名称为必填项',
            existingTagError: '已存在同名标签',
            invalidTagNameError: '标签名称不能为 0。请选择其他值。',
            genericFailureMessage: '更新标签时出错，请重试',
            importedFromAccountingSoftware: '标签在您的系统中管理',
            employeesSeeTagsAs: '员工看到的标签为',
            glCode: '总账代码',
            updateGLCodeFailureMessage: '更新总账科目代码时出错，请重试',
            tagRules: '标签规则',
            approverDescription: '审批人',
            importTags: '导入标签',
            importTagsSupportingText: '为报销添加标签时，可使用一种标签类型或多种标签类型。',
            configureMultiLevelTags: '为多级标签配置您的标签列表。',
            importMultiLevelTagsSupportingText: `这是您的标签预览。如果一切看起来都没问题，请点击下方按钮导入。`,
            importMultiLevelTags: {
                firstRowTitle: '第一行是每个标签列表的标题',
                independentTags: '这些是独立的标签',
                glAdjacentColumn: '相邻列中有一个总账科目代码',
            },
            tagLevel: {
                singleLevel: '单级标签',
                multiLevel: '多级标签',
            },
            switchSingleToMultiLevelTagWarning: {
                title: '切换标签层级',
                prompt1: '切换标签级别将清除当前所有标签。',
                prompt2: '我们建议你先',
                prompt3: '下载备份',
                prompt4: '通过导出您的标签。',
                prompt5: '了解详情',
                prompt6: '关于标签级别。',
            },
            overrideMultiTagWarning: {
                title: '导入标签',
                prompt1: '你确定吗？',
                prompt2: '现有标签将被覆盖，但您可以',
                prompt3: '下载备份',
                prompt4: '首先。',
            },
            importedTagsMessage: (columnCounts: number) =>
                `我们在您的电子表格中找到了 *${columnCounts} 列*。请选择包含标签名称的列旁边的 *名称*。您也可以在设置标签状态的列旁边选择 *启用*。`,
            cannotDeleteOrDisableAllTags: {
                title: '无法删除或停用所有标签',
                description: `至少要保留一个标签启用，因为你的工作区需要使用标签。`,
            },
            cannotMakeAllTagsOptional: {
                title: '无法将所有标签都设为可选',
                description: `至少保留一个必填标签，因为您的工作区设置要求使用标签。`,
            },
            cannotMakeTagListRequired: {
                title: '无法将标签列表设为必填',
                description: '只有在您的策略配置了多个标签级别时，您才能将标签列表设置为必填。',
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
            foreignDefault: '外币默认设置',
            customTaxName: '自定义税种名称',
            value: '值',
            taxReclaimableOn: '可退税金额基于',
            taxRate: '税率',
            findTaxRate: '查找税率',
            error: {
                taxRateAlreadyExists: '此税种名称已被使用',
                taxCodeAlreadyExists: '此税码已被使用',
                valuePercentageRange: '请输入介于 0 到 100 之间的有效百分比',
                customNameRequired: '自定义税务名称为必填项',
                deleteFailureMessage: '删除税率时发生错误。请重试或向 Concierge 寻求帮助。',
                updateFailureMessage: '更新税率时出错。请重试或向 Concierge 寻求帮助。',
                createFailureMessage: '创建税率时出错。请重试或向 Concierge 寻求帮助。',
                updateTaxClaimableFailureMessage: '可报销部分必须小于里程费金额',
            },
            deleteTaxConfirmation: '确定要删除此税费吗？',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `确定要删除 ${taxAmount} 项税金吗？`,
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
            title: '为您的新工作区命名',
            selectFeatures: '选择要复制的功能',
            whichFeatures: '你想将哪些功能复制到新工作区？',
            confirmDuplicate: '您想要继续吗？',
            categories: '类别和您的自动分类规则',
            reimbursementAccount: '报销账户',
            welcomeNote: '请开始使用我的新工作区',
            delayedSubmission: '延迟提交',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `您即将创建并与原始工作区中的 ${totalMembers ?? 0} 位成员共享 ${newWorkspaceName ?? ''}。`,
            error: '复制您的新工作区时发生错误。请重试。',
        },
        emptyWorkspace: {
            title: '你没有工作区',
            subtitle: '跟踪收据、报销费用、管理差旅、发送发票等。',
            createAWorkspaceCTA: '开始使用',
            features: {
                trackAndCollect: '跟踪并收集收据',
                reimbursements: '报销员工费用',
                companyCards: '管理公司信用卡',
            },
            notFound: '未找到工作区',
            description: '聊天室是与多人讨论和协作的理想场所。要开始协作，请创建或加入一个工作区',
        },
        new: {
            newWorkspace: '新工作区',
            getTheExpensifyCardAndMore: '获取 Expensify 卡及更多服务',
            confirmWorkspace: '确认工作区',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `我的群组工作区${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `${userName} 的工作区${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: '从工作区移除成员时出错，请重试',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `确定要移除 ${memberName} 吗？`,
                other: '确定要移除这些成员吗？',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} 是此工作区的审批人。当你停止与 TA 共享此工作区后，我们会在审批流程中将其替换为工作区所有者 ${ownerName}`,
            removeMembersTitle: () => ({
                one: '移除成员',
                other: '移除成员',
            }),
            findMember: '查找成员',
            removeWorkspaceMemberButtonTitle: '从工作区中移除',
            removeGroupMemberButtonTitle: '从群组中移除',
            removeRoomMemberButtonTitle: '从聊天中移除',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `确定要移除 ${memberName} 吗？`,
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
                other: '创建审计员',
            }),
            selectAll: '全选',
            error: {
                genericAdd: '添加此工作区成员时出现问题',
                cannotRemove: '你不能移除自己或工作区所有者',
                genericRemove: '移除该工作区成员时出现问题',
            },
            addedWithPrimary: '部分成员已通过其主登录添加。',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `由辅助登录账号 ${secondaryLogin} 添加。`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `工作区成员总数：${count}`,
            importMembers: '导入成员',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `如果您将 ${approver} 从此工作区中移除，我们会在审批流程中用工作区所有者 ${workspaceOwner} 替代他们。`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) => `${memberName} 还有未审批的报销报告。请先让 TA 审批，或在将其从工作区中移除前接管其报销报告。`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) => `您无法将${memberName}从此工作区中移除。请在“工作流”>“进行或跟踪付款”中设置新的报销人，然后重试。`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `如果您将 ${memberName} 从此工作区中移除，我们会将其首选导出人替换为工作区拥有者 ${workspaceOwner}。`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `如果您将此工作区中移除 ${memberName}，我们会将他们的技术联系人身份替换为工作区所有者 ${workspaceOwner}。`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) => `${memberName} 还有一份待处理的报销单需要处理。请在将其从工作区中移除之前，先让 TA 完成所需操作。`,
        },
        card: {
            getStartedIssuing: '从发放您的首张虚拟卡或实体卡开始使用。',
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
                chooseLimitType: '选择限额类型',
                smartLimit: '智能限额',
                smartLimitDescription: '在需要审批前可花费最高限定金额',
                monthly: '每月',
                monthlyDescription: '每月支出不超过一定金额',
                fixedAmount: '固定金额',
                fixedAmountDescription: '单次消费最高可达指定金额',
                setLimit: '设置限额',
                cardLimitError: '请输入小于 $21,474,836 的金额',
                giveItName: '给它起个名字',
                giveItNameInstruction: '要足够独特，方便与其他卡片区分开来，具体的使用场景会更好！',
                cardName: '卡片名称',
                letsDoubleCheck: '我们再仔细检查一下，确保一切都正确。',
                willBeReadyToUse: '此卡将立即可用。',
                willBeReadyToShip: '此卡将立即准备好发货。',
                cardholder: '持卡人',
                cardType: '卡片类型',
                limit: '限额',
                limitType: '限额类型',
                disabledApprovalForSmartLimitError: '在设置智能限额之前，请先在 <strong>工作流 > 添加审批</strong> 中启用审批',
            },
            deactivateCardModal: {
                deactivate: '停用',
                deactivateCard: '停用卡片',
                deactivateConfirmation: '停用此卡将拒绝所有未来交易，且此操作不可撤销。',
            },
        },
        accounting: {
            settings: '设置',
            title: '连接',
            subtitle: '连接到您的会计系统，以使用您的科目表为交易编码、自动匹配付款，并保持财务数据同步。',
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
            needAnotherAccounting: '还需要其他会计软件吗？',
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
            errorODIntegration: (oldDotPolicyConnectionsURL: string) => `Expensify Classic 中已设置的连接发生错误。[前往 Expensify Classic 解决此问题](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: '前往 Expensify Classic 管理您的设置。',
            setup: '连接',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `上次同步于 ${relativeDate}`,
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
            taxes: '税务',
            imported: '已导入',
            notImported: '未导入',
            importAsCategory: '已作为类别导入',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: '已导入',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: '已导入为标签',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: '已导入',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: '未导入',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: '未导入',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: '已导入为报表字段',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'NetSuite 员工默认设置',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '此集成';
                return `确定要断开与 ${integrationName} 的连接吗？`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `确定要连接 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '此会计集成'} 吗？这将移除所有现有的会计连接。`,
            enterCredentials: '输入您的凭证',
            claimOffer: {
                badgeText: '优惠可用！',
                xero: {
                    headline: '免费使用 Xero 长达 6 个月！',
                    description: '<muted-text><centered-text>刚接触 Xero 吗？Expensify 客户可享受 6 个月免费试用。请在下方领取优惠。</centered-text></muted-text>',
                    connectButton: '连接至 Xero',
                },
                uber: {
                    headerTitle: 'Uber 商业版',
                    headline: 'Uber 行程享受 5% 折扣',
                    description: `<muted-text><centered-text>通过 Expensify 启用 Uber for Business，在 6 月前的所有商务出行可享受 5% 折扣。<a href="${CONST.UBER_TERMS_LINK}">适用条款。</a></centered-text></muted-text>`,
                    connectButton: '连接 Uber for Business',
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
                            return '导入员工';
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
                            return '同步已报销报表和账单付款';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '导入税码';
                        case 'quickbooksOnlineCheckConnection':
                            return '正在检查 QuickBooks Online 连接';
                        case 'quickbooksOnlineImportMain':
                            return '导入 QuickBooks Online 数据';
                        case 'startingImportXero':
                            return '导入 Xero 数据';
                        case 'startingImportQBO':
                            return '导入 QuickBooks Online 数据';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return '导入 QuickBooks Desktop 数据';
                        case 'quickbooksDesktopImportTitle':
                            return '正在导入标题';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '正在导入批准证书';
                        case 'quickbooksDesktopImportDimensions':
                            return '正在导入维度';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '正在导入保存策略';
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
                            return '更新客户/项目';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return '正在更新人员列表';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return '更新报表字段';
                        case 'jobDone':
                            return '正在等待导入的数据加载';
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
                            return '同步银行账户';
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
                            return '正在从 NetSuite 获取数据';
                        case 'netSuiteSyncImportTaxes':
                            return '导入税费';
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
                            return '以 Expensify 报告字段的形式导入数据';
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
                            return '导入子公司';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return '正在导入供应商';
                        case 'intacctCheckConnection':
                            return '正在检查 Sage Intacct 连接';
                        case 'intacctImportDimensions':
                            return '导入 Sage Intacct 维度';
                        case 'intacctImportTitle':
                            return '导入 Sage Intacct 数据';
                        default: {
                            return `阶段缺少翻译：${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '首选导出方',
            exportPreferredExporterNote: '首选导出人可以是任意工作区管理员，但如果你在“域设置”中为各个公司卡设置了不同的导出账户，则该导出人还必须是域管理员。',
            exportPreferredExporterSubNote: '设置完成后，首选导出人将在其账户中看到可导出的报表。',
            exportAs: '导出为',
            exportOutOfPocket: '将自付费用导出为',
            exportCompanyCard: '导出公司卡费用为',
            exportDate: '导出日期',
            defaultVendor: '默认供应商',
            autoSync: '自动同步',
            autoSyncDescription: '每日自动同步 NetSuite 和 Expensify。实时导出已完成报表',
            reimbursedReports: '同步已报销报表',
            cardReconciliation: '卡片对账',
            reconciliationAccount: '对账科目',
            continuousReconciliation: '持续对账',
            saveHoursOnReconciliation: '通过让 Expensify 持续为您对 Expensify Card 对账单和结算进行核对，每个会计期间都可节省数小时的对账时间。',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>若要启用持续对账，请为 ${connectionName} 启用<a href="${accountingAdvancedSettingsLink}">自动同步</a>。</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: '选择用于核对应付 Expensify 卡款项的银行账户。',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `请确保此账户与您的<a href="${settlementAccountUrl}">Expensify Card 清算账户</a>（以 ${lastFourPAN} 结尾）一致，以便持续对账功能正常运行。`,
            },
        },
        export: {
            notReadyHeading: '尚未准备好导出',
            notReadyDescription: '草稿或待处理的报销报告无法导出到会计系统。请在导出前先批准或支付这些报销。',
        },
        invoices: {
            sendInvoice: '发送发票',
            sendFrom: '发送自',
            invoicingDetails: '开票详情',
            invoicingDetailsDescription: '此信息将显示在您的发票上。',
            companyName: '公司名称',
            companyWebsite: '公司网站',
            paymentMethods: {
                personal: '个人',
                business: '商务',
                chooseInvoiceMethod: '请选择以下付款方式：',
                payingAsIndividual: '以个人身份付款',
                payingAsBusiness: '以企业身份支付',
            },
            invoiceBalance: '发票余额',
            invoiceBalanceSubtitle: '这是你通过收取发票款项获得的当前余额。如果你已添加银行账户，它会自动转入该账户。',
            bankAccountsSubtitle: '添加银行账户以进行和接收发票付款。',
        },
        invite: {
            member: '邀请成员',
            members: '邀请成员',
            invitePeople: '邀请新成员',
            genericFailureMessage: '邀请该成员加入工作区时发生错误。请重试。',
            pleaseEnterValidLogin: `请确保电子邮箱或电话号码有效（例如：${CONST.EXAMPLE_PHONE_NUMBER}）。`,
            user: '用户',
            users: '用户',
            invited: '已邀请',
            removed: '已移除',
            to: '到',
            from: '从',
        },
        inviteMessage: {
            confirmDetails: '确认详情',
            inviteMessagePrompt: '在下方添加一条留言，让你的邀请与众不同！',
            personalMessagePrompt: '消息',
            genericFailureMessage: '邀请该成员加入工作区时发生错误。请重试。',
            inviteNoMembersError: '请至少选择一位成员进行邀请',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} 请求加入 ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: '哎呀！别那么快……',
            workspaceNeeds: '一个工作区至少需要启用一个距离费率。',
            distance: '距离',
            centrallyManage: '集中管理费率，以英里或公里跟踪，并设置默认类别。',
            rate: '评分',
            addRate: '添加费率',
            findRate: '查找汇率',
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
            taxFeatureNotEnabledMessage: '<muted-text>必须在工作区中启用税费才能使用此功能。前往<a href="#">更多功能</a>进行更改。</muted-text>',
            deleteDistanceRate: '删除距离费率',
            areYouSureDelete: () => ({
                one: '确定要删除此费率吗？',
                other: '确定要删除这些费率吗？',
            }),
            errors: {
                rateNameRequired: '费率名称为必填项',
                existingRateName: '已存在同名的里程费率',
            },
        },
        editor: {
            descriptionInputLabel: '描述',
            nameInputLabel: '姓名',
            typeInputLabel: '类型',
            initialValueInputLabel: '初始值',
            nameInputHelpText: '这是您在工作区中将看到的名称。',
            nameIsRequiredError: '你需要为你的工作区起一个名称',
            currencyInputLabel: '默认货币',
            currencyInputHelpText: '此工作区中的所有报销都将转换为此货币。',
            currencyInputDisabledText: (currency: string) => `无法更改默认货币，因为此工作区已链接到一个以 ${currency} 为单位的银行账户。`,
            save: '保存',
            genericFailureMessage: '更新工作区时发生错误。请重试。',
            avatarUploadFailureMessage: '上传头像时出错。请重试。',
            addressContext: '启用 Expensify Travel 需要填写一个 Workspace 地址。请输入与您业务相关的地址。',
            policy: '报销政策',
        },
        bankAccount: {
            continueWithSetup: '继续设置',
            youAreAlmostDone: '您几乎已经完成银行账户的设置，这将使您能够发放公司卡、报销费用、收取发票并支付账单。',
            streamlinePayments: '优化支付流程',
            connectBankAccountNote: '注意：个人银行账户不能用于工作区的付款。',
            oneMoreThing: '还有一件事！',
            allSet: '一切就绪！',
            accountDescriptionWithCards: '此银行账户将用于发行公司卡、报销费用、收取发票款项和支付账单。',
            letsFinishInChat: '让我们在聊天中完成！',
            finishInChat: '在聊天中完成',
            almostDone: '快完成了！',
            disconnectBankAccount: '断开银行账户',
            startOver: '重新开始',
            updateDetails: '更新详细信息',
            yesDisconnectMyBankAccount: '是的，断开我的银行账户',
            yesStartOver: '是的，重新开始',
            disconnectYourBankAccount: (bankName: string) => `断开您的 <strong>${bankName}</strong> 银行账户连接。此账户的所有未完成交易仍会正常完成。`,
            clearProgress: '重新开始将清除你目前为止的进度。',
            areYouSure: '你确定吗？',
            workspaceCurrency: '工作区货币',
            updateCurrencyPrompt: '您的工作区当前使用的货币似乎不是 USD。请点击下方按钮，将您的货币立即更新为 USD。',
            updateToUSD: '更新为 USD',
            updateWorkspaceCurrency: '更新工作区货币',
            workspaceCurrencyNotSupported: '不支持工作区货币',
            yourWorkspace: `您的工作区当前使用不受支持的货币。请查看<a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">支持的货币列表</a>。`,
            chooseAnExisting: '选择一个现有的银行账户来支付报销或添加一个新账户。',
        },
        changeOwner: {
            changeOwnerPageTitle: '转移所有者',
            addPaymentCardTitle: '输入你的付款卡以转移所有权',
            addPaymentCardButtonText: '接受条款并添加付款卡',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>阅读并接受<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">条款</a>和<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">隐私</a>政策以添加您的卡。</muted-text-micro>`,
            addPaymentCardPciCompliant: '符合 PCI-DSS 标准',
            addPaymentCardBankLevelEncrypt: '银行级加密',
            addPaymentCardRedundant: '冗余基础架构',
            addPaymentCardLearnMore: `<muted-text>详细了解我们的<a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">安全性</a>。</muted-text>`,
            amountOwedTitle: '未结清余额',
            amountOwedButtonText: 'OK',
            amountOwedText: '此账户有上个月未结清的欠款。\n\n是否要清除该欠款并接管此工作区的账单？',
            ownerOwesAmountTitle: '未结清余额',
            ownerOwesAmountButtonText: '转移余额',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `拥有此工作区的账户（${email}）有上个月未结清的欠款。

你是否要支付这笔金额（${amount}）以接管此工作区的账单？你的支付卡将会立即被扣款。`,
            subscriptionTitle: '接管年度订阅',
            subscriptionButtonText: '转移订阅',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `接管此工作区会将其年度订阅与您当前的订阅合并。这会将您的订阅规模增加 ${usersCount} 名成员，使您的新订阅规模变为 ${finalCount}。您要继续吗？`,
            duplicateSubscriptionTitle: '重复订阅警报',
            duplicateSubscriptionButtonText: '继续',
            duplicateSubscriptionText: (email: string, workspaceName: string) => `看起来你正在尝试接管 ${email} 的工作区账单，但要做到这一点，你需要先成为其所有工作区的管理员。

如果你只想接管工作区 ${workspaceName} 的账单，请点击“继续”。

如果你想接管其整个订阅的账单，请先让他们将你添加为其所有工作区的管理员，然后再来接管账单。`,
            hasFailedSettlementsTitle: '无法转移所有权',
            hasFailedSettlementsButtonText: '明白了',
            hasFailedSettlementsText: (email: string) =>
                `您无法接管账单管理，因为 ${email} 存在逾期未结清的 Expensify Card 结算。请让 TA 联系 concierge@expensify.com 解决此问题。之后，您即可为此工作区接管账单管理。`,
            failedToClearBalanceTitle: '清除余额失败',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: '我们无法清除该余额。请稍后重试。',
            successTitle: '太棒了！一切就绪。',
            successDescription: '您现在是此工作区的所有者。',
            errorTitle: '哎呀！别那么快……',
            errorDescription: `<muted-text><centered-text>转移此工作区所有权时出现问题。请重试，或<concierge-link>联系 Concierge</concierge-link>获取帮助。</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '小心！',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) => `以下报销单已导出到 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}：

${reportName}

确定要再次导出它们吗？`,
            confirmText: '是的，再次导出',
            cancelText: '取消',
        },
        upgrade: {
            reportFields: {
                title: '报表字段',
                description: `报表字段可用于指定报表层级的抬头信息，与适用于各个明细行中费用的标签不同。这些信息可以包括特定项目名称、出差信息、地点等。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>报表字段仅在 Control 方案中可用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `通过 Expensify 与 NetSuite 集成，享受自动同步并减少手动录入。借助对原生和自定义维度（包括项目与客户映射）的支持，获取深入的实时财务洞察。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>我们的 NetSuite 集成功能仅适用于 Control 方案，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `通过 Expensify 与 Sage Intacct 的集成，享受自动同步功能并减少手动录入。借助用户自定义维度，以及按部门、类别、地点、客户和项目（工作）进行的费用编码，获取深入且实时的财务洞察。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>我们的 Sage Intacct 集成仅适用于 Control 方案，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `通过 Expensify 与 QuickBooks Desktop 的集成，享受自动同步，减少手工录入。借助实时双向连接，以及按类别、项目、客户和项目进行费用编码，实现极致效率。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>我们的 QuickBooks Desktop 集成仅适用于 Control 方案，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '高级审批',
                description: `如果你想在审批流程中增加更多层级，或者只是想确保金额最大的报销能再多一道审核，我们都能满足你的需求。高级审批功能帮助你在各个层级设置合适的把关机制，从而让团队支出始终保持在可控范围内。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>高级审批仅在 Control 方案中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            categories: {
                title: '类别',
                description: '类别可帮助您跟踪和整理支出。您可以使用我们的默认类别或添加您自己的类别。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>类别在 Collect 方案中可用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            glCodes: {
                title: '总账科目代码',
                description: `为类别和标签添加总账代码，便于将费用轻松导出到您的会计和薪资系统。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>总账代码仅在 Control 方案中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: '总账与薪资代码',
                description: `为类别添加总账和薪资代码，便于将报销支出轻松导出到您的会计和薪资系统。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>总账和薪资代码仅适用于 Control 方案，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            taxCodes: {
                title: '税码',
                description: `将税码添加到您的税务设置中，以便轻松将报销费用导出到您的会计和薪酬系统。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>税码仅在 Control 方案中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            companyCards: {
                title: '无限公司卡',
                description: `需要添加更多卡片流水？解锁无限公司卡片，从所有主要发卡机构同步交易。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>此功能仅适用于 Control 方案，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            rules: {
                title: '规则',
                description: `规则在后台运行，帮助你将支出控制在范围内，让你不必为每一笔小花销操心。

你可以要求填写收据和描述等报销明细，设置限额和默认值，并在一个地方自动化处理审批和付款。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>规则仅适用于 Control 方案，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            perDiem: {
                title: '每日补贴',
                description: '每日津贴是在员工出差时，使日常费用保持合规且可预测的绝佳方式。您可以使用自定义费率、默认类别等功能，以及更精细的设置，如目的地和子费率等详细信息。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>差旅补贴仅在 Control 方案中提供，起价为<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            travel: {
                title: '差旅',
                description: 'Expensify Travel 是一款全新的企业差旅预订和管理平台，允许成员预订住宿、机票、交通等各类行程。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>差旅功能在 Collect 方案中提供，起价为<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            reports: {
                title: '报表',
                description: '报表可帮助你将费用分组，以便更轻松地追踪和管理。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>报表可在 Collect 方案中使用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            multiLevelTags: {
                title: '多级标签',
                description:
                    '多级标签可帮助你更加精确地追踪报销。为每一条目分配多个标签（例如部门、客户或成本中心），以完整记录每笔报销的背景信息。这样可以实现更详细的报表、更完善的审批流程以及更细致的会计导出。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>多级标签仅在 Control 方案中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            distanceRates: {
                title: '行程费率',
                description: '创建和管理自己的费率，以英里或千米跟踪里程，并为差旅距离报销设置默认类别。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>距离报销费率可在 Collect 方案中使用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            auditor: {
                title: '审计员',
                description: '审计员将获得所有报表的只读访问权限，以实现全面透明和合规监控。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>审计员仅在 Control 方案中可用，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '多级审批',
                description: '多级审批是一个适用于需要多个人在报销前先批准报表的公司的工作流程工具。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>多级审批仅在 Control 方案中提供，起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}</muted-text>`,
            },
            pricing: {
                perActiveMember: '每位活跃成员每月。',
                perMember: '每位成员每月。',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) => `<muted-text>升级以使用此功能，或<a href="${subscriptionLink}">了解更多</a>我们的方案和定价。</muted-text>`,
            upgradeToUnlock: '解锁此功能',
            completed: {
                headline: `您已升级您的工作区！`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>您已成功将 ${policyName} 升级到 Control 方案！有关更多详情，请<a href="${subscriptionLink}">查看您的订阅</a>。</centered-text>`,
                categorizeMessage: `您已成功升级到 Collect 方案。现在您可以为报销费用分类了！`,
                travelMessage: `您已成功升级到 Collect 方案。现在可以开始预订和管理差旅了！`,
                distanceRateMessage: `您已成功升级到 Collect 方案。现在您可以修改里程费率了！`,
                gotIt: '明白了，谢谢',
                createdWorkspace: `您已创建一个工作区！`,
            },
            commonFeatures: {
                title: '升级到 Control 方案',
                note: '解锁我们最强大的功能，包括：',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Control 方案起价为 <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `每位成员每月。` : `每位活跃成员每月。`}，<a href="${learnMoreMethodsRoute}">了解更多</a> 关于我们的方案和定价。</muted-text>`,
                    benefit1: '高级会计连接（NetSuite、Sage Intacct 等）',
                    benefit2: '智能报销规则',
                    benefit3: '多级审批工作流',
                    benefit4: '增强安全控制',
                    toUpgrade: '要升级，请点击',
                    selectWorkspace: '选择一个工作区，并将套餐类型更改为',
                },
                upgradeWorkspaceWarning: `无法升级工作区`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: '您的公司已限制创建工作区。请联系管理员以获取帮助。',
            },
        },
        downgrade: {
            commonFeatures: {
                title: '降级到 Collect 方案',
                note: '如果您降级，您将无法再使用以下功能及更多：',
                benefits: {
                    note: '若要全面比较我们的方案，请查看我们的',
                    pricingPage: '定价页面',
                    confirm: '确定要降级并移除您的配置吗？',
                    warning: '此操作无法撤销。',
                    benefit1: '会计连接（QuickBooks Online 和 Xero 除外）',
                    benefit2: '智能报销规则',
                    benefit3: '多级审批工作流',
                    benefit4: '增强安全控制',
                    headsUp: '注意！',
                    multiWorkspaceNote: '在首次月度付款前，您需要先将所有工作区降级，才能以 Collect 费率开始订阅。点击',
                    selectStep: '> 选择每个工作区 > 将套餐类型更改为',
                },
            },
            completed: {
                headline: '您的工作区已被降级',
                description: '您还有其他工作区使用的是 Control 方案。若要按 Collect 费率计费，您必须将所有工作区全部降级。',
                gotIt: '明白了，谢谢',
            },
        },
        payAndDowngrade: {
            title: '支付并降级',
            headline: '您的最终付款',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `此订阅的最终账单金额为 <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `查看您在${date}的明细如下：`,
            subscription: '注意！此操作将终止你的 Expensify 订阅，删除此工作区，并移除所有工作区成员。如果你只想移除自己并保留此工作区，请先让另一位管理员接管账单。',
            genericFailureMessage: '支付账单时出错。请重试。',
        },
        restrictedAction: {
            restricted: '受限',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `当前对 ${workspaceName} 工作区的操作受到限制`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `工作区所有者 ${workspaceOwnerName} 需要添加或更新档案中的付款卡片才能解锁新的工作区活动。`,
            youWillNeedToAddOrUpdatePaymentCard: '您需要添加或更新备案的支付卡片，才能解锁新的工作区活动。',
            addPaymentCardToUnlock: '添加一张付款卡以解锁！',
            addPaymentCardToContinueUsingWorkspace: '添加付款卡以继续使用此工作区',
            pleaseReachOutToYourWorkspaceAdmin: '如有任何问题，请联系您的工作区管理员。',
            chatWithYourAdmin: '与管理员聊天',
            chatInAdmins: '在 #admins 中聊天',
            addPaymentCard: '添加付款卡',
            goToSubscription: '前往订阅',
        },
        rules: {
            individualExpenseRules: {
                title: '报销费用',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>为单笔报销设置支出控制和默认值。你也可以为<a href="${categoriesPageLink}">类别</a>和<a href="${tagsPageLink}">标签</a>创建规则。</muted-text>`,
                receiptRequiredAmount: '必须附上收据的金额',
                receiptRequiredAmountDescription: '当支出超过此金额时要求提供收据，除非被类别规则覆盖。',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `金额不能大于分项收据所需金额（${amount}）`,
                itemizedReceiptRequiredAmount: '需要逐项列明收据的金额',
                itemizedReceiptRequiredAmountDescription: '当支出超过此金额时要求提供分项收据，除非被类别规则覆盖。',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `金额不能低于常规收据所需的金额（${amount}）`,
                maxExpenseAmount: '费用金额上限',
                maxExpenseAmountDescription: '标记超过此金额的支出，除非被类别规则覆盖。',
                maxAge: '最大年龄',
                maxExpenseAge: '费用最长期限',
                maxExpenseAgeDescription: '标记早于特定天数的支出。',
                maxExpenseAgeDays: () => ({
                    one: '1 天',
                    other: (count: number) => `${count} 天`,
                }),
                cashExpenseDefault: '现金报销默认设置',
                cashExpenseDefaultDescription: '选择现金报销应如何创建。如果一笔报销不是导入的公司卡交易，则被视为现金报销。这包括手动创建的报销、收据、每日津贴、里程和工时报销。',
                reimbursableDefault: '可报销',
                reimbursableDefaultDescription: '报销费用通常是偿还给员工的',
                nonReimbursableDefault: '不可报销',
                nonReimbursableDefaultDescription: '员工有时会获得报销',
                alwaysReimbursable: '始终可报销',
                alwaysReimbursableDescription: '费用始终报销给员工',
                alwaysNonReimbursable: '始终不予报销',
                alwaysNonReimbursableDescription: '费用从不报销给员工',
                billableDefault: '可计费默认设置',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>选择现金和信用卡报销是否应默认可计费。可计费报销可在<a href="${tagsPageLink}">标签</a>中启用或禁用。</muted-text>`,
                billable: '可计费',
                billableDescription: '费用通常会重新向客户计费',
                nonBillable: '不可计费',
                nonBillableDescription: '费用会不定期重新向客户开账',
                eReceipts: '电子收据',
                eReceiptsHint: `电子收据会自动为[大多数美元信用卡交易](${CONST.DEEP_DIVE_ERECEIPTS})创建。`,
                attendeeTracking: '参会者跟踪',
                attendeeTrackingHint: '跟踪每笔报销中每个人的费用成本。',
                prohibitedDefaultDescription: '标记所有包含酒精、赌博或其他受限项目的收据。包含这些明细项目的报销将需要人工审核。',
                prohibitedExpenses: '禁止报销的费用',
                alcohol: '酒精',
                hotelIncidentals: '酒店杂费',
                gambling: '赌博',
                tobacco: '烟草',
                adultEntertainment: '成人娱乐',
                requireCompanyCard: '所有消费都必须使用公司卡',
                requireCompanyCardDescription: '标记所有现金支出，包括里程和每日补贴报销。',
            },
            expenseReportRules: {
                title: '高级',
                subtitle: '自动化处理费用报表的合规、审批和支付。',
                preventSelfApprovalsTitle: '防止自我审批',
                preventSelfApprovalsSubtitle: '禁止工作区成员批准自己的报销报告。',
                autoApproveCompliantReportsTitle: '自动批准合规报表',
                autoApproveCompliantReportsSubtitle: '配置哪些报销报告符合自动批准的条件。',
                autoApproveReportsUnderTitle: '自动批准报销单上限',
                autoApproveReportsUnderDescription: '在此金额以下且完全合规的报销单将自动获批。',
                randomReportAuditTitle: '随机报表审计',
                randomReportAuditDescription: '即使报表符合自动审批条件，也要求对部分报表进行人工审批。',
                autoPayApprovedReportsTitle: '自动支付已批准的报销报告',
                autoPayApprovedReportsSubtitle: '配置哪些报销报告符合自动付款条件。',
                autoPayApprovedReportsLimitError: (currency?: string) => `请输入小于 ${currency ?? ''}20,000 的金额`,
                autoPayApprovedReportsLockedSubtitle: '前往“更多功能”并启用“工作流程”，然后添加“付款”以解锁此功能。',
                autoPayReportsUnderTitle: '自动支付报销单条件为',
                autoPayReportsUnderDescription: '金额低于此数且完全合规的报销单将自动支付。',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `添加 ${featureName} 以解锁此功能。`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) => `前往[更多功能](${moreFeaturesLink})并启用${featureName}以解锁此功能。`,
            },
            merchantRules: {
                title: '商家',
                subtitle: '设置商户规则，使报销能正确编码并减少后期整理。',
                addRule: '添加商家规则',
                addRuleTitle: '添加规则',
                editRuleTitle: '编辑规则',
                expensesWith: '对于符合以下条件的费用：',
                expensesExactlyMatching: '对于完全符合以下条件的报销：',
                applyUpdates: '应用这些更新：',
                saveRule: '保存规则',
                previewMatches: '预览匹配项',
                confirmError: '输入商家并至少应用一项更新',
                confirmErrorMerchant: '请输入商户',
                confirmErrorUpdate: '请至少应用一次更新',
                previewMatchesEmptyStateTitle: '无内容可显示',
                previewMatchesEmptyStateSubtitle: '没有未提交的报销符合此规则。',
                deleteRule: '删除规则',
                deleteRuleConfirmation: '确定要删除此规则吗？',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `如果商家 ${isExactMatch ? '完全匹配' : '包含'}“${merchantName}”`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `将商家重命名为“${merchantName}”`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `将 ${fieldName} 更新为“${fieldValue}”`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `标记为“${reimbursable ? '可报销' : '不可报销'}”`,
                ruleSummarySubtitleBillable: (billable: boolean) => `标记为“${billable ? '可计费' : '不可计费'}”`,
                matchType: '匹配类型',
                matchTypeContains: '包含',
                matchTypeExact: '完全匹配',
                duplicateRuleTitle: '相似的商家规则已存在',
                duplicateRulePrompt: (merchantName: string) => `尽管你已经有一条针对“${merchantName}”的规则，仍要再保存一条新规则吗？`,
                saveAnyway: '仍然保存',
                applyToExistingUnsubmittedExpenses: '应用到现有的未提交报销费用',
            },
            categoryRules: {
                title: '类别规则',
                approver: '审批人',
                requireDescription: '需要填写说明',
                requireFields: '必填字段',
                requiredFieldsTitle: '必填字段',
                requiredFieldsDescription: (categoryName: string) => `这将应用于所有被分类为 <strong>${categoryName}</strong> 的报销。`,
                requireAttendees: '要求参与者',
                descriptionHint: '描述提示',
                descriptionHintDescription: (categoryName: string) => `提醒员工为“${categoryName}”支出提供更多信息。此提示将显示在报销单的描述字段中。`,
                descriptionHintLabel: '提示',
                descriptionHintSubtitle: '专业提示：越短越好！',
                maxAmount: '最高金额',
                flagAmountsOver: '标记超出以下金额',
                flagAmountsOverDescription: (categoryName: string) => `适用于类别“${categoryName}”。`,
                flagAmountsOverSubtitle: '这将覆盖所有报销的最高金额限制。',
                expenseLimitTypes: {
                    expense: '单笔报销',
                    expenseSubtitle: '按类别标记报销金额。此规则会覆盖工作区的一般“最大报销金额”规则。',
                    daily: '类别总计',
                    dailySubtitle: '为每份报销单标记每日各类别的总支出。',
                },
                requireReceiptsOver: '要求报销单超过',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} 默认`,
                    never: '永不要求收据',
                    always: '始终要求收据',
                },
                requireItemizedReceiptsOver: '要求逐项明细收据超过',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} 默认`,
                    never: '永不要求分项收据',
                    always: '始终要求明细收据',
                },
                defaultTaxRate: '默认税率',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) => `前往 [更多功能](${moreFeaturesLink}) 并启用工作流程，然后添加审批以解锁此功能。`,
            },
            customRules: {
                title: '报销政策',
                cardSubtitle: '这是你们团队的报销政策所在位置，让所有人都清楚哪些费用可以报销。',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '收款',
                    description: '适合希望自动化流程的团队。',
                },
                corporate: {
                    label: '控制',
                    description: '适用于具有高级需求的组织。',
                },
            },
            description: '选择适合您的方案。有关功能和价格的详细列表，请查看我们的',
            subscriptionLink: '方案类型和定价帮助页面',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `在 ${annualSubscriptionEndDate} 之前，您已承诺在 Control 方案中保留 1 名活跃成员，直至年度订阅结束。从 ${annualSubscriptionEndDate} 起，您可以通过停用自动续订切换为按量付费订阅并降级至 Collect 方案，具体操作为在`,
                other: `您已在 Control 方案中承诺拥有 ${count} 名活跃成员，直到您的年度订阅于 ${annualSubscriptionEndDate} 到期。您可以在 ${annualSubscriptionEndDate} 开始，通过关闭自动续订，切换为按使用量付费订阅并降级到 Collect 方案，操作路径为`,
            }),
            subscriptions: '订阅',
        },
    },
    getAssistancePage: {
        title: '获取帮助',
        subtitle: '我们在这里为你扫清通往卓越的道路！',
        description: '从以下支持选项中进行选择：',
        chatWithConcierge: '与 Concierge 聊天',
        scheduleSetupCall: '安排设置电话会议',
        scheduleACall: '安排通话',
        questionMarkButtonTooltip: '获取我们的团队协助',
        exploreHelpDocs: '浏览帮助文档',
        registerForWebinar: '注册网络研讨会',
        onboardingHelp: '入门帮助',
    },
    emojiPicker: {
        skinTonePickerLabel: '更改默认肤色',
        headers: {
            frequentlyUsed: '常用',
            smileysAndEmotion: '表情与情感',
            peopleAndBody: '人物与身体',
            animalsAndNature: '动物与自然',
            foodAndDrink: '餐饮',
            travelAndPlaces: '旅行和地点',
            activities: '活动',
            objects: '对象',
            symbols: '符号',
            flags: '标记',
        },
    },
    newRoomPage: {
        newRoom: '新房间',
        groupName: '群组名称',
        roomName: '房间名称',
        visibility: '可见性',
        restrictedDescription: '您工作区中的成员可以找到此聊天室',
        privateDescription: '受邀加入此房间的人可以找到它',
        publicDescription: '任何人都可以找到此房间',
        public_announceDescription: '任何人都可以找到此房间',
        createRoom: '创建房间',
        roomAlreadyExistsError: '已存在同名房间',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} 是所有工作区中的默认聊天室名称。请选择另一个名称。`,
        roomNameInvalidError: '聊天室名称只能包含小写字母、数字和连字符',
        pleaseEnterRoomName: '请输入房间名称',
        pleaseSelectWorkspace: '请选择工作区',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}重命名为“${newName}”（之前为“${oldName}”）` : `${actor}将此房间重命名为“${newName}”（原名为“${oldName}”）`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `房间已重命名为 ${newName}`,
        social: '社交',
        selectAWorkspace: '选择工作区',
        growlMessageOnRenameError: '无法重命名工作区房间。请检查您的网络连接，然后重试。',
        visibilityOptions: {
            restricted: '工作区',
            private: '私人',
            public: '公开',
            public_announce: '公开公告',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: '提交并关闭',
        submitAndApprove: '提交并批准',
        advanced: '高级',
        dynamicExternal: '动态_外部',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `将默认企业银行账户设置为“${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}”`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `已移除默认企业银行账户“${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}”`,
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
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `已将公司地址更改为“${newAddress}”（原为“${previousAddress}”）` : `将公司地址设置为“${newAddress}”`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) => `已将${approverName}（${approverEmail}）添加为${field}“${name}”的审批人`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) => `已将 ${approverName}（${approverEmail}）从 ${field}“${name}”的审批人中移除`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `已将 ${field}“${name}”的审批人更改为 ${formatApprover(newApproverName, newApproverEmail)}（之前为 ${formatApprover(oldApproverName, oldApproverEmail)}）`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `已添加类别“${categoryName}”`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `已移除类别“${categoryName}”`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? '已禁用' : '已启用'} 类别 “${categoryName}”`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `已将工资代码“${newValue}”添加到类别“${categoryName}”`;
            }
            if (!newValue && oldValue) {
                return `已从类别“${categoryName}”中移除工资代码“${oldValue}”`;
            }
            return `已将“${categoryName}”类别的工资代码更改为“${newValue}”（之前为“${oldValue}”）`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `已将总账代码 “${newValue}” 添加到类别 “${categoryName}”`;
            }
            if (!newValue && oldValue) {
                return `已从类别“${categoryName}”中移除总账代码“${oldValue}”`;
            }
            return `已将“${categoryName}”类别的总账科目代码更改为“${newValue}”（之前为“${oldValue}”）`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `将“${categoryName}”类别的描述更改为 ${!oldValue ? '必填' : '非必填'}（先前为 ${!oldValue ? '非必填' : '必填'}）`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `已将类别“${categoryName}”的最高金额设置为 ${newAmount}`;
            }
            if (oldAmount && !newAmount) {
                return `已从类别“${categoryName}”中移除 ${oldAmount} 的最高金额限制`;
            }
            return `已将“${categoryName}”类别的最高金额更改为 ${newAmount}（之前为 ${oldAmount}）`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `已为类别“${categoryName}”添加限额类型：${newValue}`;
            }
            return `将“${categoryName}”类别的限额类型更改为${newValue}（之前为${oldValue}）`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `通过将“收据”更改为 ${newValue}，更新了类别“${categoryName}”`;
            }
            return `已将“${categoryName}”类别更改为${newValue}（之前为${oldValue}）`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `通过将“逐项明细收据”更改为 ${newValue} 更新了类别“${categoryName}”`;
            }
            return `将“${categoryName}”类别的分项收据更改为 ${newValue}（之前为 ${oldValue}）`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `已将类别“${oldName}”重命名为“${newName}”`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `已从类别“${categoryName}”中移除了描述提示“${oldValue}”`;
            }
            return !oldValue ? `已将描述提示“${newValue}”添加到类别“${categoryName}”` : `将“${categoryName}”类别的描述提示更改为“${newValue}”（之前为“${oldValue}”）`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `将标签列表名称更改为“${newName}”（原为“${oldName}”）`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `已将标签“${tagName}”添加到列表“${tagListName}”`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `通过将标签“${oldName}”更改为“${newName}”，更新了标签列表“${tagListName}”`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? '已启用' : '已禁用'} 列表“${tagListName}”中的标签“${tagName}”`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `已从列表“${tagListName}”中移除标签“${tagName}”`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `已从列表“${tagListName}”中移除“${count}”个标签`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `通过将 ${updatedField} 从“${oldValue}”更改为“${newValue}”，更新了列表“${tagListName}”中的标签“${tagName}”`;
            }
            return `通过添加“${newValue}”作为${updatedField}，更新了列表“${tagListName}”中的标签“${tagName}”`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `已将${customUnitName}的${updatedField}更改为“${newValue}”（之前为“${oldValue}”）`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? '已启用' : '已禁用'} 距离费率的税务跟踪`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `添加了新的“${customUnitName}”费率“${rateName}”`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `将${customUnitName}的${updatedField}“${customUnitRateName}”的费率更改为“${newValue}”（之前为“${oldValue}”）`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `已将距离费率“${customUnitRateName}”的税率更改为“${newValue}（${newTaxPercentage}）”（此前为“${oldValue}（${oldTaxPercentage}）”）`;
            }
            return `已将税率“${newValue}（${newTaxPercentage}）”添加到距离费率“${customUnitRateName}”`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `将距离费率“${customUnitRateName}”中的可退税部分更改为“${newValue}”（原为“${oldValue}”）`;
            }
            return `已将可退税部分“${newValue}”添加到距离费率“${customUnitRateName}”`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? '已启用' : '已禁用'} 的 ${customUnitName} 费率“${customUnitRateName}”`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `已移除“${customUnitName}”费率“${rateName}”`,
        addedReportField: (fieldType: string, fieldName?: string) => `已添加${fieldType}报表字段“${fieldName}”`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) => `将报表字段“${fieldName}”的默认值设置为“${defaultValue}”`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `已将选项“${optionName}”添加到报表字段“${fieldName}”`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `已从报表字段“${fieldName}”中移除选项“${optionName}”`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? '已启用' : '已禁用'} 报告字段“${fieldName}”的选项“${optionName}”`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? '已启用' : '已禁用'} 报告字段“${fieldName}”的所有选项`;
            }
            return `将报表字段“${fieldName}”的选项“${optionName}”设置为${allEnabled ? '已启用' : '已禁用'}，使所有选项都为${allEnabled ? '已启用' : '已禁用'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `已移除 ${fieldType} 报告字段“${fieldName}”`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `已将“禁止自我审批”更新为“${newValue === 'true' ? '已启用' : '已禁用'}”（先前为“${oldValue === 'true' ? '已启用' : '已禁用'}”）`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `将月度报表提交日期设置为“${newValue}”`;
            }
            return `已将月度报告提交日期更新为“${newValue}”（之前为“${oldValue}”）`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `已将“向客户重新计费报销”更新为“${newValue}”（先前为“${oldValue}”）`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `已将“现金报销默认值”更新为“${newValue}”（此前为“${oldValue}”）`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `已将“强制使用默认报表标题”切换为 ${value ? '开上' : '关关闭'}`,
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `将自定义报表名称公式更改为“${newValue}”（原为“${oldValue}”）`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `已将此工作区名称更新为“${newName}”（原为“${oldName}”）`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription ? `将此工作区的描述设置为“${newDescription}”` : `将此工作区的描述更新为“${newDescription}”（原为“${oldDescription}”）`,
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
                one: `已将你从 ${joinedNames} 的审批流程和报销聊天中移除。此前提交的报表仍可在你的收件箱中进行审批。`,
                other: `已将你从 ${joinedNames} 的审批流程和报销聊天中移除。之前提交的报销单仍可在你的收件箱中进行审批。`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) => `已将你在 ${policyName} 中的角色从 ${oldRole} 更新为用户。你已从所有报销提交人的聊天中被移除，你自己的除外。`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `已将默认货币更新为 ${newCurrency}（之前为 ${oldCurrency}）`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) => `已将自动报表频率更新为“${newFrequency}”（之前为“${oldFrequency}”）`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `已将审批模式更新为“${newValue}”（之前为“${oldValue}”）`,
        upgradedWorkspace: '已将此工作区升级到 Control 方案',
        forcedCorporateUpgrade: `此工作区已升级至 Control 方案。点击<a href="${CONST.COLLECT_UPGRADE_HELP_URL}">此处</a>了解更多信息。`,
        downgradedWorkspace: '已将此工作区降级为 Collect 方案',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `已将随机路由进行人工审批的报表比例更改为 ${Math.round(newAuditRate * 100)}%（之前为 ${Math.round(oldAuditRate * 100)}%）`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) => `将所有报销的人工审批上限更改为 ${newLimit}（之前为 ${oldLimit}）`,
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
                    return `${enabled ? '已启用' : '已禁用'} Expensify 卡片`;
                case 'company cards':
                    return `${enabled ? '已启用' : '已禁用'} 张公司卡`;
                case 'invoicing':
                    return `${enabled ? '已启用' : '已禁用'} 开具发票`;
                case 'per diem':
                    return `${enabled ? '已启用' : '已禁用'} 每日津贴`;
                case 'receipt partners':
                    return `${enabled ? '已启用' : '已禁用'} 笔收据合作方`;
                case 'rules':
                    return `${enabled ? '已启用' : '已禁用'} 条规则`;
                case 'tax tracking':
                    return `${enabled ? '已启用' : '已禁用'} 税务跟踪`;
                default:
                    return `${enabled ? '已启用' : '已禁用'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? '已启用' : '已禁用'} 参与者跟踪`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? '已启用' : '已禁用'} 个自动付款已批准报表`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `将自动支付的已批准报表阈值设置为 “${newLimit}”`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) => `已将自动付款的已批准报销单阈值更改为“${newLimit}”（之前为“${oldLimit}”）`,
        removedAutoPayApprovedReportsLimit: '移除了自动支付已批准报表的阈值',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `将默认审批人更改为 ${newApprover}（之前为 ${previousApprover}）` : `将默认审批人更改为 ${newApprover}`,
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
            let text = `已将${members}的审批流程更改为向${approver}提交报销报告`;
            if (wasDefaultApprover && previousApprover) {
                text += `（原默认审批人：${previousApprover}）`;
            } else if (wasDefaultApprover) {
                text += '（之前的默认审批人）';
            } else if (previousApprover) {
                text += `（原为 ${previousApprover}）`;
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
            let text = approver ? `已将 ${members} 的审批流程更改为向默认审批人 ${approver} 提交报销报告` : `已将 ${members} 的审批流程更改为向默认审批人提交报告`;
            if (wasDefaultApprover && previousApprover) {
                text += `（原默认审批人：${previousApprover}）`;
            } else if (wasDefaultApprover) {
                text += '（之前的默认审批人）';
            } else if (previousApprover) {
                text += `（原为 ${previousApprover}）`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `将 ${approver} 的审批流程更改为在批准报告后转发给 ${forwardsTo}（之前转发给 ${previousForwardsTo}）`
                : `将 ${approver} 的审批流程更改为在报告批准后转发给 ${forwardsTo}（之前为最终批准的报告）`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo ? `将 ${approver} 的审批流程更改为不再转发已批准的报表（之前会转发给 ${previousForwardsTo}）` : `已将${approver}的审批流程更改为不再转发已批准的报告`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `将发票公司名称更改为“${newValue}”（原为“${oldValue}”）` : `将发票公司名称设置为“${newValue}”`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `将发票公司网站更改为“${newValue}”（之前为“${oldValue}”）` : `将发票公司网站设置为“${newValue}”`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser ? `将授权付款人更改为“${newReimburser}”（之前为“${previousReimburser}”）` : `已将授权付款人更改为“${newReimburser}”`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? '已启用' : '已禁用'} 笔报销`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `已添加税费“${taxName}”`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `已移除税费“${taxName}”`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `已将税率“${oldValue}”重命名为“${newValue}”`;
                }
                case 'code': {
                    return `已将“${taxName}”的税码从“${oldValue}”更改为“${newValue}”`;
                }
                case 'rate': {
                    return `已将“${taxName}”的税率从“${oldValue}”更改为“${newValue}”`;
                }
                case 'enabled': {
                    return `${oldValue ? '已禁用' : '已启用'} 税费“${taxName}”`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `将所需收据金额设置为“${newValue}”`,
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `已将所需收据金额更改为“${newValue}”（之前为“${oldValue}”）`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `已移除所需收据金额（先前为“${oldValue}”）`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `将最高报销金额设为“${newValue}”`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `将单笔报销金额上限更改为“${newValue}”（此前为“${oldValue}”）`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `已移除最高报销金额（先前为“${oldValue}”）`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `将报销单最大天数设置为“${newValue}”天`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `已将报销单最久天数更改为“${newValue}”天（之前为“${oldValue}”天）`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `已移除报销单最大天数限制（原为“${oldValue}”天）`,
    },
    roomMembersPage: {
        memberNotFound: '未找到成员。',
        useInviteButton: '要邀请新成员加入聊天，请使用上方的邀请按钮。',
        notAuthorized: `您无权访问此页面。如果您正在尝试加入此房间，请让房间成员将您加入。还有其他问题？请联系 ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `此聊天室似乎已被归档。如有疑问，请联系 ${CONST.EMAIL.CONCIERGE}。`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `确定要将 ${memberName} 移出此房间吗？`,
            other: '确定要将选中的成员从此房间中移除吗？',
        }),
        error: {
            genericAdd: '添加此房间成员时出现问题',
        },
    },
    newTaskPage: {
        assignTask: '分配任务',
        assignMe: '分配给我',
        confirmTask: '确认任务',
        confirmError: '请输入标题并选择共享目标',
        descriptionOptional: '描述（可选）',
        pleaseEnterTaskName: '请输入标题',
        pleaseEnterTaskDestination: '请选择您要共享此任务的位置',
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
            completed: '标记为已完成',
            canceled: '已删除的任务',
            reopened: '标记为未完成',
            error: '您没有权限执行所请求的操作',
        },
        markAsComplete: '标记为完成',
        markAsIncomplete: '标记为未完成',
        assigneeError: '分配此任务时出错。请尝试选择其他负责人。',
        genericCreateTaskFailureMessage: '创建此任务时出错。请稍后重试。',
        deleteTask: '删除任务',
        deleteConfirmation: '确定要删除此任务吗？',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `${year}年${monthName}对账单`,
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
            openDebug: '打开测试偏好设置对话框',
        },
    },
    guides: {
        screenShare: '屏幕共享',
        screenShareRequest: 'Expensify 邀请你加入屏幕共享',
    },
    search: {
        resultsAreLimited: '搜索结果已受限制。',
        viewResults: '查看结果',
        resetFilters: '重置筛选条件',
        searchResults: {
            emptyResults: {
                title: '无内容可显示',
                subtitle: `请尝试调整搜索条件，或使用“+”按钮创建新项目。`,
            },
            emptyExpenseResults: {
                title: '你还没有创建任何报销记录',
                subtitle: '创建一笔报销，或试用 Expensify 以了解更多信息。',
                subtitleWithOnlyCreateButton: '使用下方的绿色按钮来创建一笔报销。',
            },
            emptyReportResults: {
                title: '你还没有创建任何报表',
                subtitle: '创建报表或试用体验 Expensify 以了解更多信息。',
                subtitleWithOnlyCreateButton: '使用下面的绿色按钮创建报表。',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    您还没有创建任何发票
                `),
                subtitle: '发送发票或试用 Expensify，了解更多信息。',
                subtitleWithOnlyCreateButton: '使用下方的绿色按钮发送发票。',
            },
            emptyTripResults: {
                title: '没有可显示的行程',
                subtitle: '从在下方预订您的第一趟行程开始。',
                buttonText: '预订行程',
            },
            emptySubmitResults: {
                title: '没有可提交的报销',
                subtitle: '一切顺利。好好庆祝一下吧！',
                buttonText: '创建报表',
            },
            emptyApproveResults: {
                title: '没有需要审批的报销',
                subtitle: '报销为零，轻松到底。干得好！',
            },
            emptyPayResults: {
                title: '没有可支付的报销',
                subtitle: '恭喜！你冲过终点线了。',
            },
            emptyExportResults: {
                title: '没有可导出的报销费用',
                subtitle: '该轻松一下了，干得漂亮。',
            },
            emptyStatementsResults: {
                title: '没有可显示的报销记录',
                subtitle: '无结果。请尝试调整筛选条件。',
            },
            emptyUnapprovedResults: {
                title: '没有需要审批的报销',
                subtitle: '报销为零，轻松到底。干得好！',
            },
        },
        columns: '列',
        resetColumns: '重置列',
        groupColumns: '分组列',
        expenseColumns: '报销列',
        statements: '对账单',
        unapprovedCash: '未批准现金',
        unapprovedCard: '未批准的卡片',
        reconciliation: '对账',
        topSpenders: '最高支出者',
        saveSearch: '保存搜索',
        deleteSavedSearch: '删除已保存的搜索',
        deleteSavedSearchConfirm: '确定要删除此搜索吗？',
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
            unhold: '解除保留',
            reject: '拒绝',
            noOptionsAvailable: '所选费用组暂无可用选项。',
        },
        filtersHeader: '筛选器',
        filters: {
            date: {
                before: (date?: string) => `在 ${date ?? ''} 之前`,
                after: (date?: string) => `在 ${date ?? ''} 之后`,
                on: (date?: string) => `于 ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: '从不',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: '上个月',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: '本月',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: '本年度至今',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: '上期对账单',
                },
            },
            status: '状态',
            keyword: '关键词',
            keywords: '关键词',
            limit: '限额',
            limitDescription: '为搜索结果设置一个上限。',
            currency: '货币',
            completed: '已完成',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `小于 ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `大于 ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `介于 ${greaterThan} 和 ${lessThan} 之间`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `等于 ${amount ?? ''}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: '个人卡片',
                closedCards: '已关闭的卡片',
                cardFeeds: '银行卡数据馈送',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `所有 ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `所有已导入的 CSV 卡片${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} 是 ${value}`,
            current: '当前',
            past: '过去',
            submitted: '已提交',
            approved: '已批准',
            paid: '已支付',
            exported: '已导出',
            posted: '已入账',
            withdrawn: '已撤回',
            billable: '可计费',
            reimbursable: '可报销',
            purchaseCurrency: '购买货币',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: '来自',
                [CONST.SEARCH.GROUP_BY.CARD]: '卡',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '提现编号',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: '类别',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: '商家',
                [CONST.SEARCH.GROUP_BY.TAG]: '标签',
                [CONST.SEARCH.GROUP_BY.MONTH]: '月',
                [CONST.SEARCH.GROUP_BY.WEEK]: '周',
                [CONST.SEARCH.GROUP_BY.YEAR]: '年份',
                [CONST.SEARCH.GROUP_BY.QUARTER]: '季度',
            },
            feed: '动态',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Expensify 卡',
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
        view: {
            label: '查看',
            table: '表',
            bar: '栏',
        },
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: '来自',
            [CONST.SEARCH.GROUP_BY.CARD]: '银行卡',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '导出',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: '类别',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: '商户',
            [CONST.SEARCH.GROUP_BY.TAG]: '标签',
            [CONST.SEARCH.GROUP_BY.MONTH]: '月份',
            [CONST.SEARCH.GROUP_BY.WEEK]: '周',
            [CONST.SEARCH.GROUP_BY.YEAR]: '年',
            [CONST.SEARCH.GROUP_BY.QUARTER]: '季度',
        },
        moneyRequestReport: {
            emptyStateTitle: '此报表没有任何报销。',
            accessPlaceHolder: '打开查看详情',
        },
        noCategory: '无类别',
        noMerchant: '无商家',
        noTag: '无标签',
        expenseType: '报销类型',
        withdrawalType: '提现类型',
        recentSearches: '最近搜索',
        recentChats: '最近聊天',
        searchIn: '搜索范围',
        searchPlaceholder: '搜索内容',
        suggestions: '建议',
        exportSearchResults: {
            title: '创建导出',
            description: '哇，项目真不少！我们会把它们打包好，Concierge 很快会给你发送一个文件。',
        },
        exportedTo: '已导出到',
        exportAll: {
            selectAllMatchingItems: '选择所有匹配的项目',
            allMatchingItemsSelected: '已选择所有匹配项',
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
            qrMessage: '在照片或下载文件夹中查找你的二维码副本。专业提示：把它添加到演示文稿中，方便观众扫码并直接与你联系。',
        },
        generalError: {
            title: '附件错误',
            message: '无法下载附件',
        },
        permissionError: {
            title: '存储访问',
            message: 'Expensify 在没有存储空间访问权限的情况下无法保存附件。请点击“设置”以更新权限。',
        },
    },
    settlement: {
        status: {
            pending: '待处理',
            cleared: '已结清',
            failed: '失败',
        },
        failedError: ({link}: {link: string}) => `当你<a href="${link}">解锁你的账户</a>后，我们将重新尝试进行此结算。`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • 提现编号：${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: '报表布局',
        groupByLabel: '分组依据：',
        selectGroupByOption: '选择报表费用的分组方式',
        uncategorized: '未分类',
        noTag: '无标签',
        selectGroup: ({groupName}: {groupName: string}) => `选择${groupName}中的所有报销费用`,
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
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) => `您确定要在 ${workspaceName} 中创建另一份报表吗？您可以在以下位置访问您的空报表`,
            emptyReportConfirmationPromptLink: '报表',
            emptyReportConfirmationDontShowAgain: '不再显示此内容',
            genericWorkspaceName: '此工作区',
        },
        genericCreateReportFailureMessage: '创建此聊天时发生意外错误。请稍后再试。',
        genericAddCommentFailureMessage: '发表评论时发生未知错误。请稍后重试。',
        genericUpdateReportFieldFailureMessage: '更新此字段时发生意外错误。请稍后重试。',
        genericUpdateReportNameEditFailureMessage: '重命名报告时发生未知错误。请稍后再试。',
        noActivityYet: '暂无活动',
        connectionSettings: '连接设置',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `将${fieldName}更改为“${newValue}”（之前为“${oldValue}”）`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `将 ${fieldName} 设置为“${newValue}”`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `已更改工作区${fromPolicyName ? `（原为 ${fromPolicyName}）` : ''}`;
                    }
                    return `将工作区更改为 ${toPolicyName}${fromPolicyName ? `（原为 ${fromPolicyName}）` : ''}`;
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
                    manual: (label: string) => `将此报销单标记为已手动导出到 ${label}。`,
                    automaticActionThree: '并成功创建了记录：',
                    reimburseableLink: '自付费用',
                    nonReimbursableLink: '公司卡报销',
                    pending: (label: string) => `已开始将此报表导出到 ${label}……`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `无法将此报表导出到${label}（“${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}”）`,
                managerAttachReceipt: `添加了一张收据`,
                managerDetachReceipt: `删除了一张收据`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `在其他地方支付了 ${currency}${amount}`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `通过集成支付了${currency}${amount}`,
                outdatedBankAccount: `由于付款人的银行账户出现问题，无法处理该付款`,
                reimbursementACHBounce: `由于银行账户问题，无法处理付款`,
                reimbursementACHCancelled: `已取消付款`,
                reimbursementAccountChanged: `由于付款方更换了银行账户，无法处理该付款`,
                reimbursementDelayed: `已处理付款，但将再延迟 1–2 个工作日`,
                selectedForRandomAudit: `随机选中进行审核`,
                selectedForRandomAuditMarkdown: `被[randomly selected](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule)进行审核`,
                share: ({to}: ShareParams) => `已邀请成员 ${to}`,
                unshare: ({to}: UnshareParams) => `已移除成员 ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `已支付 ${currency}${amount}`,
                takeControl: `取得控制权`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `与 ${label}${errorMessage ? ` ("${errorMessage}")` : ''} 同步时出现问题。请在<a href="${workspaceAccountingLink}">工作区设置</a>中解决该问题。`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `${feedName} 连接已中断。若要恢复导入卡片交易，请<a href='${workspaceCompanyCardRoute}'>登录您的网上银行</a>。`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `您与企业银行账户的 Plaid 连接已中断。请<a href='${walletRoute}'>重新连接您的银行账户 ${maskedAccountNumber}</a>，以便继续使用您的 Expensify 卡。`,
                addEmployee: (email: string, role: string) => `已将 ${email} 添加为 ${role === 'member' ? 'a' : '一个'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `已将 ${email} 的角色更新为 ${newRole}（原为 ${currentRole}）`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `已移除 ${email} 的自定义字段 1（先前为“${previousValue}”）`;
                    }
                    return !previousValue ? `已将“${newValue}”添加到 ${email} 的自定义字段 1` : `已将 ${email} 的自定义字段 1 更改为“${newValue}”（之前为“${previousValue}”）`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `已移除 ${email} 的自定义字段 2（原为 “${previousValue}”）`;
                    }
                    return !previousValue ? `已将“${newValue}”添加到 ${email} 的自定义字段 2` : `将 ${email} 的自定义字段 2 更改为 “${newValue}”（之前为 “${previousValue}”）`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} 离开了工作区`,
                removeMember: (email: string, role: string) => `已移除 ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `已移除与 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} 的连接`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `已连接到 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: '已离开聊天',
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `由于报销或 Expensify Card 清算出现问题，企业银行账户 ${maskedBankAccountNumber} 已被自动锁定。请在<a href="${linkURL}">工作区设置</a>中解决此问题。`,
            },
            error: {
                invalidCredentials: '凭证无效，请检查您的连接配置。',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `截至 ${date} 的 ${dayCount} ${dayCount === 1 ? '天' : '天'} 的 ${summary}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${date} ${timePeriod}的${summary}`,
    },
    footer: {
        features: '功能',
        expenseManagement: '费用管理',
        spendManagement: '支出管理',
        expenseReports: '报销报告',
        companyCreditCard: '公司信用卡',
        receiptScanningApp: '收据扫描应用程序',
        billPay: '账单支付',
        invoicing: '开具发票',
        CPACard: 'CPA 卡',
        payroll: '薪资',
        travel: '差旅',
        resources: '资源',
        expensifyApproved: '已通过Expensify审核！',
        pressKit: '媒体资料包',
        support: '支持',
        expensifyHelp: 'Expensify帮助',
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
        navigatesToChat: '跳转到聊天',
        newMessageLineIndicator: '新消息行指示器',
        chatMessage: '聊天消息',
        lastChatMessagePreview: '最近聊天消息预览',
        workspaceName: '工作区名称',
        chatUserDisplayNames: '聊天成员显示名称',
        scrollToNewestMessages: '滚动到最新消息',
        preStyledText: '预设样式文本',
        viewAttachment: '查看附件',
    },
    parentReportAction: {
        deletedReport: '已删除的报告',
        deletedMessage: '已删除的消息',
        deletedExpense: '已删除的报销',
        reversedTransaction: '冲销交易',
        deletedTask: '已删除的任务',
        hiddenMessage: '隐藏消息',
    },
    threads: {
        thread: '线程',
        replies: '回复',
        reply: '回复',
        from: '来自',
        in: '在',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `来自${reportName}${workspaceName ? `在 ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: '复制 URL',
        copied: '已复制！',
    },
    moderation: {
        flagDescription: '所有被标记的消息都会发送给审核员进行审查。',
        chooseAReason: '请选择下方标记的原因：',
        spam: '垃圾邮件',
        spamDescription: '主动发布与主题无关的推广内容',
        inconsiderate: '不体贴',
        inconsiderateDescription: '措辞具有侮辱性或不尊重，且意图存疑',
        intimidation: '恐吓',
        intimidationDescription: '在有正当反对意见的情况下依然咄咄逼人地推进某个议程',
        bullying: '霸凌',
        bullyingDescription: '以个体为目标以获得服从',
        harassment: '骚扰',
        harassmentDescription: '种族歧视、厌女或其他广泛歧视性行为',
        assault: '袭击',
        assaultDescription: '带有伤害意图的有针对性的情感攻击',
        flaggedContent: '此消息已被标记为违反我们的社区规则，内容已被隐藏。',
        hideMessage: '隐藏消息',
        revealMessage: '显示消息',
        levelOneResult: '发送匿名警告，并将消息报告以供审核。',
        levelTwoResult: '消息已从频道中隐藏，附带匿名警告，并已将该消息报告以供审核。',
        levelThreeResult: '消息已从频道中移除，发送匿名警告，并将该消息报告以供审核。',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: '邀请提交报销费用',
        inviteToChat: '仅邀请聊天',
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
        nothing: '暂时没有内容',
    },
    teachersUnitePage: {
        teachersUnite: '教师联合',
        joinExpensifyOrg: '加入 Expensify.org，一起消除世界各地的不公。当前的“教师联合”活动通过分担必需教学用品的费用来支持各地教育工作者。',
        iKnowATeacher: '我认识一位老师',
        iAmATeacher: '我是老师',
        getInTouch: '太好了！请分享他们的联系信息，以便我们与他们取得联系。',
        introSchoolPrincipal: '与你的学校校长的介绍',
        schoolPrincipalVerifyExpense: 'Expensify.org 会分担基本学习用品的费用，让来自低收入家庭的学生能够拥有更好的学习体验。我们会请您的校长核实您的报销费用。',
        principalFirstName: '主要负责人的名（拼音）',
        principalLastName: '负责人姓氏',
        principalWorkEmail: '主要工作邮箱',
        updateYourEmail: '更新你的邮箱地址',
        updateEmail: '更新邮箱地址',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `在继续之前，请先将你的学校邮箱设置为默认联系方式。你可以前往“设置”>“个人资料”> <a href="${contactMethodsRoute}">联系方式</a>中进行设置。`,
        error: {
            enterPhoneEmail: '请输入有效的邮箱地址或电话号码',
            enterEmail: '输入电子邮箱',
            enterValidEmail: '请输入有效的邮箱地址',
            tryDifferentEmail: '请尝试使用其他邮箱',
        },
    },
    cardTransactions: {
        notActivated: '未激活',
        outOfPocket: '自掏腰包支出',
        companySpend: '公司支出',
    },
    distance: {
        addStop: '添加站点',
        deleteWaypoint: '删除途径点',
        deleteWaypointConfirmation: '确定要删除此途经点吗？',
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
            selectSuggestedAddress: '请选择一个推荐地址或使用当前位置',
        },
        odometer: {
            startReading: '开始阅读',
            endReading: '结束阅读',
            saveForLater: '稍后保存',
            totalDistance: '总距离',
        },
    },
    gps: {
        disclaimer: '使用 GPS 根据您的行程创建报销。点按下方的“开始”以开始跟踪。',
        error: {
            failedToStart: '启动位置跟踪失败。',
            failedToGetPermissions: '获取必要的定位权限失败。',
        },
        trackingDistance: '正在记录距离…',
        stopped: '已停止',
        start: '开始',
        stop: '停止',
        discard: '丢弃',
        stopGpsTrackingModal: {
            title: '停止 GPS 跟踪',
            prompt: '您确定吗？这将结束您当前的流程。',
            cancel: '恢复跟踪',
            confirm: '停止 GPS 跟踪',
        },
        discardDistanceTrackingModal: {
            title: '放弃距离跟踪',
            prompt: '是否确定？这将放弃你当前的流程，且此操作无法撤销。',
            confirm: '放弃距离跟踪',
        },
        zeroDistanceTripModal: {
            title: '无法创建报销项目',
            prompt: '您不能创建起点和终点相同的报销。',
        },
        locationRequiredModal: {
            title: '需要访问位置信息',
            prompt: '请在设备设置中允许位置访问以开始 GPS 距离跟踪。',
            allow: '允许',
        },
        androidBackgroundLocationRequiredModal: {
            title: '需要后台位置访问权限',
            prompt: '请在设备设置中将定位权限设置为允许后台访问（选择“始终允许”选项），以开始 GPS 距离跟踪。',
        },
        preciseLocationRequiredModal: {
            title: '需要精确位置信息',
            prompt: '请在设备设置中启用“精确位置”以开始使用 GPS 距离跟踪。',
        },
        desktop: {
            title: '在手机上记录距离',
            subtitle: '使用 GPS 自动记录英里或公里，并将行程即时转换为报销费用。',
            button: '下载应用',
        },
        notification: {
            title: '正在进行 GPS 追踪',
            body: '前往应用完成操作',
        },
        continueGpsTripModal: {
            title: '继续记录 GPS 行程？',
            prompt: '看起来应用在你上一次的 GPS 行程中被关闭了。你想从那次行程继续记录吗？',
            confirm: '继续行程',
            cancel: '查看行程',
        },
        signOutWarningTripInProgress: {
            title: '正在进行 GPS 追踪',
            prompt: '确定要放弃此行程并注销吗？',
            confirm: '放弃并退出登录',
        },
        locationServicesRequiredModal: {
            title: '需要访问位置信息',
            confirm: '打开设置',
            prompt: '请在设备设置中允许位置访问以开始 GPS 距离跟踪。',
        },
        fabGpsTripExplained: '前往 GPS 屏幕（悬浮操作）',
    },
    reportCardLostOrDamaged: {
        screenTitle: '成绩单丢失或损坏',
        nextButtonLabel: '下一步',
        reasonTitle: '你为什么需要一张新卡？',
        cardDamaged: '我的卡损坏了',
        cardLostOrStolen: '我的卡丢失或被盗',
        confirmAddressTitle: '请确认您的新卡邮寄地址。',
        cardDamagedInfo: '您的新卡将会在 2–3 个工作日内送达。在您激活新卡之前，您当前的卡片将继续正常使用。',
        cardLostOrStolenInfo: '一旦您下单，当前的卡片将被永久停用。大多数卡片会在几个工作日内送达。',
        address: '地址',
        deactivateCardButton: '停用卡片',
        shipNewCardButton: '寄送新卡',
        addressError: '地址为必填项',
        reasonError: '原因为必填项',
        successTitle: '您的新卡正在寄送中！',
        successDescription: '几个工作日后寄达后，您需要先激活它。与此同时，您可以使用虚拟卡。',
    },
    eReceipt: {
        guaranteed: '保证电子收据',
        transactionDate: '交易日期',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: '开始聊天，<success><strong>推荐好友</strong></success>。',
            header: '开始聊天，推荐朋友',
            body: '也想让你的朋友一起使用 Expensify 吗？只要和他们开始聊天，剩下的交给我们。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '提交报销，<success><strong>推荐你的团队</strong></success>。',
            header: '提交报销，推荐你的团队',
            body: '也想让你的团队使用 Expensify 吗？只需向他们提交一笔报销，我们会帮你搞定剩下的一切。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '推荐好友',
            body: '也想让你的朋友使用 Expensify 吗？只要和他们聊天、付款或分摊一笔报销，其余的就交给我们。或者直接分享你的邀请链接！',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '推荐好友',
            header: '推荐好友',
            body: '也想让你的朋友使用 Expensify 吗？只要和他们聊天、付款或分摊一笔报销，其余的就交给我们。或者直接分享你的邀请链接！',
        },
        copyReferralLink: '复制邀请链接',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) => `在 <a href="${href}">${adminReportName}</a> 中与您的设置专员聊天以获取帮助`,
        default: `如需设置方面的帮助，请发送消息给 <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link>`,
    },
    violations: {
        allTagLevelsRequired: '所有标签为必填项',
        autoReportedRejectedExpense: '该报销被驳回。',
        billableExpense: '可计费已不再有效',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `需要收据${formattedLimit ? `超过 ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: '类别已失效',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `已应用 ${surcharge}% 兑换附加费`,
        customUnitOutOfPolicy: '此工作区的费率无效',
        duplicatedTransaction: '可能重复',
        fieldRequired: '报表字段为必填项',
        futureDate: '不允许使用未来日期',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `加价 ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `日期早于 ${maxAge} 天`,
        missingCategory: '缺少类别',
        missingComment: '所选类别需要填写说明',
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
        modifiedDate: '日期与扫描的收据不符',
        nonExpensiworksExpense: '非 Expensiworks 报销',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `报销金额超出自动审批限额 ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `超出每人 ${formattedLimit} 类别限额的金额`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `超出每人 ${formattedLimit} 限额的金额`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `金额超出每次行程 ${formattedLimit} 限额`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `超出每人 ${formattedLimit} 限额的金额`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `超出每日每人 ${formattedLimit} 类别限额的金额`,
        receiptNotSmartScanned: '已手动添加收据和报销明细。',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `金额超过 ${formattedLimit} 的类别需提供收据`;
            }
            if (formattedLimit) {
                return `超过 ${formattedLimit} 需要收据`;
            }
            if (category) {
                return `类别超限需上传票据`;
            }
            return '需要收据';
        },
        itemizedReceiptRequired: ({formattedLimit}: {formattedLimit?: string}) => `需要分项收据${formattedLimit ? `超过 ${formattedLimit}` : ''}`,
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
        brokenConnection530Error: '由于银行连接中断，收据待处理',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>由于银行连接中断，收据处于待处理状态。请前往<a href="${workspaceCompanyCardRoute}">公司卡</a>中解决。</muted-text-label>`,
        memberBrokenConnectionError: '由于银行连接中断，收据处于待处理状态。请联系工作区管理员解决。',
        markAsCashToIgnore: '标记为现金以忽略并请求付款。',
        smartscanFailed: ({canEdit = true}) => `收据扫描失败。${canEdit ? '手动输入详细信息。' : ''}`,
        receiptGeneratedWithAI: '可能由 AI 生成的收据',
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
        merchantToKeep: '选择要保留的商户',
        descriptionToKeep: '选择要保留的说明',
        categoryToKeep: '选择保留哪个类别',
        isTransactionBillable: '选择此交易是否可计费',
        keepThisOne: '保留这个',
        confirmDetails: `确认要保留的详细信息`,
        confirmDuplicatesInfo: `您未保留的重复项将保留，供提交人删除。`,
        hold: '此报销已被搁置',
        resolvedDuplicates: '已解决重复项',
        companyCardRequired: '必须使用公司卡消费',
        noRoute: '请选择一个有效的地址',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} 为必填项`,
        reportContainsExpensesWithViolations: '报表包含有违规的报销。',
    },
    violationDismissal: {
        rter: {
            manual: '将此收据标记为现金',
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
        normal: '正常',
    },
    exitSurvey: {
        header: '在你离开之前',
        reasonPage: {
            title: '请告诉我们你离开的原因',
            subtitle: '在你离开之前，请告诉我们你为什么想切换到 Expensify Classic。',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: '我需要一个只有在 Expensify Classic 中才有的功能。',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '我不明白如何使用新版 Expensify。',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '我明白如何使用新版 Expensify，但我更喜欢经典版 Expensify。',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: '在新版 Expensify 中，你还需要哪些尚未提供的功能？',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '你正在尝试做什么？',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '你为什么更喜欢使用 Expensify 经典版？',
        },
        responsePlaceholder: '你的回复',
        thankYou: '感谢你的反馈！',
        thankYouSubtitle: '您的反馈将帮助我们打造更高效的产品，助您完成各项工作。非常感谢！',
        goToExpensifyClassic: '切换到 Expensify 经典版',
        offlineTitle: '看起来你被困在这里了…',
        offline: '您似乎处于离线状态。不幸的是，Expensify Classic 在离线时无法使用，但 New Expensify 可以。如果您更喜欢使用 Expensify Classic，请在连接到互联网后重试。',
        quickTip: '小提示...',
        quickTipSubTitle: '您可以通过访问 expensify.com 直接进入 Expensify 经典版。将其加入书签以便快速访问！',
        bookACall: '预约通话',
        bookACallTitle: '您想与产品经理聊一聊吗？',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '直接在报销和报表上聊天',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: '在手机上完成所有操作的能力',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: '聊天般极速的差旅与报销',
        },
        bookACallTextTop: '如果切换回 Expensify 经典版，您将错过：',
        bookACallTextBottom: '我们非常期待与您通话以了解原因。您可以预约与我们的高级产品经理通话，讨论您的需求。',
        takeMeToExpensifyClassic: '带我进入 Expensify 经典版',
    },
    listBoundary: {
        errorMessage: '加载更多消息时发生错误',
        tryAgain: '重试',
    },
    systemMessage: {
        mergedWithCashTransaction: '已将一张收据匹配到此交易',
    },
    subscription: {
        authenticatePaymentCard: '认证支付卡',
        mobileReducedFunctionalityMessage: '你无法在移动应用中更改你的订阅。',
        badge: {
            freeTrial: (numOfDays: number) => `免费试用：剩余 ${numOfDays} ${numOfDays === 1 ? '天' : '天'}`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: '您的付款信息已过期',
                subtitle: (date: string) => `请在 ${date} 前更新您的支付卡，以便继续使用您所有喜爱的功能。`,
            },
            policyOwnerAmountOwedOverdue: {
                title: '无法处理您的付款',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed ? `您在${date}的${purchaseAmountOwed}扣款未能成功处理。请添加一张付款卡以结清所欠金额。` : '请添加一张付款卡以结清所欠金额。',
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
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `您对尾号为 ${cardEnding} 的银行卡上金额为 ${amountOwed} 的扣款提出了争议。在与您的银行解决该争议之前，您的账户将被锁定。`,
            },
            cardAuthenticationRequired: {
                title: '您的支付卡尚未完成全部认证。',
                subtitle: (cardEnding: string) => `请完成身份验证流程，以激活末尾为 ${cardEnding} 的支付卡。`,
            },
            insufficientFunds: {
                title: '无法扣款您的银行卡',
                subtitle: (amountOwed: number) => `由于余额不足，您的支付卡被拒绝。请重试或添加一张新的支付卡，以结清您未付的 ${amountOwed}。`,
            },
            cardExpired: {
                title: '无法扣款您的银行卡',
                subtitle: (amountOwed: number) => `您的付款卡已过期。请添加一张新的付款卡以结清您尚未支付的 ${amountOwed} 余额。`,
            },
            cardExpireSoon: {
                title: '您的卡片即将过期',
                subtitle: '您的支付卡将在本月底到期。请点击下方的三点菜单进行更新，以便继续使用您最喜爱的所有功能。',
            },
            retryBillingSuccess: {
                title: '成功！',
                subtitle: '您的银行卡已成功扣款。',
            },
            retryBillingError: {
                title: '无法扣款您的银行卡',
                subtitle: '在重试之前，请直接联系您的银行，授权 Expensify 扣款并移除任何冻结。否则，请尝试添加其他付款卡。',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `您对尾号为 ${cardEnding} 的银行卡上金额为 ${amountOwed} 的扣款提出了争议。在与您的银行解决该争议之前，您的账户将被锁定。`,
            preTrial: {
                title: '开始免费试用',
                subtitle: '接下来，请<a href="#">完成设置清单</a>，以便你的团队开始报销。',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `试用：剩余 ${numOfDays} ${numOfDays === 1 ? '天' : '天'}！`,
                subtitle: '添加一张付款卡以继续使用您所有喜爱的功能。',
            },
            trialEnded: {
                title: '您的免费试用已结束',
                subtitle: '添加一张付款卡以继续使用您所有喜爱的功能。',
            },
            earlyDiscount: {
                claimOffer: '领取优惠',
                subscriptionPageTitle: (discountType: number) => `<strong>首年立减 ${discountType}%！</strong> 只需添加一张支付卡并开始年度订阅。`,
                onboardingChatTitle: (discountType: number) => `限时优惠：首年立享 ${discountType}% 折扣！`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `请在 ${days > 0 ? `${days}天：` : ''}${hours}小时 ${minutes}分 ${seconds}秒 内领取`,
            },
        },
        cardSection: {
            title: '付款',
            subtitle: '添加一张卡来支付你的 Expensify 订阅费用。',
            addCardButton: '添加付款卡',
            cardInfo: (name: string, expiration: string, currency: string) => `名称：${name}，到期日期：${expiration}，货币：${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `您的下一次付款日期是 ${nextPaymentDate}。`,
            cardEnding: (cardNumber: string) => `尾号为 ${cardNumber} 的卡片`,
            changeCard: '更改付款卡',
            changeCurrency: '更改付款币种',
            cardNotFound: '未添加付款卡',
            retryPaymentButton: '重试付款',
            authenticatePayment: '验证付款',
            requestRefund: '申请退款',
            requestRefundModal: {
                full: '退款很简单，只需在下一个账单日期前将账户降级，您就会收到退款。<br /> <br /> 提醒：将账户降级意味着您的工作区将被删除。此操作无法撤销，但如果您改变主意，始终可以创建一个新的工作区。',
                confirm: '删除工作区并降级',
            },
            viewPaymentHistory: '查看付款历史',
        },
        yourPlan: {
            title: '您的方案',
            exploreAllPlans: '查看所有方案',
            customPricing: '自定义定价',
            asLowAs: ({price}: YourPlanPriceValueParams) => `每位活跃成员每月低至 ${price}`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `每位成员每月 ${price}`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `每位成员每月 ${price}`,
            perMemberMonth: '每位成员/月',
            collect: {
                title: '收款',
                description: '为小型企业提供报销、差旅和聊天的一体化方案。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `从持有 Expensify Card 的每位活跃成员 ${lower}，到未持有 Expensify Card 的每位活跃成员 ${upper}。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `从持有 Expensify Card 的每位活跃成员 ${lower}，到未持有 Expensify Card 的每位活跃成员 ${upper}。`,
                benefit1: '收据扫描',
                benefit2: '报销',
                benefit3: '公司企业卡管理',
                benefit4: '报销和差旅审批',
                benefit5: '差旅预订和规则',
                benefit6: 'QuickBooks/Xero 集成',
                benefit7: '就费用、报销和聊天室进行聊天',
                benefit8: 'AI 与人工支持',
            },
            control: {
                title: '控制',
                description: '适用于大型企业的报销、差旅和聊天。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `从持有 Expensify Card 的每位活跃成员 ${lower}，到未持有 Expensify Card 的每位活跃成员 ${upper}。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `从持有 Expensify Card 的每位活跃成员 ${lower}，到未持有 Expensify Card 的每位活跃成员 ${upper}。`,
                benefit1: 'Collect 方案中的所有内容',
                benefit2: '多级审批工作流',
                benefit3: '自定义报销规则',
                benefit4: 'ERP 集成（NetSuite、Sage Intacct、Oracle）',
                benefit5: '人力资源集成（Workday、Certinia）',
                benefit6: 'SAML/SSO',
                benefit7: '自定义洞察和报告',
                benefit8: '预算管理',
            },
            thisIsYourCurrentPlan: '这是你当前的方案',
            downgrade: '降级为 Collect',
            upgrade: '升级到 Control',
            addMembers: '添加成员',
            saveWithExpensifyTitle: '使用 Expensify 卡省钱',
            saveWithExpensifyDescription: '使用我们的节省计算器，了解 Expensify Card 返现如何减少你的 Expensify 账单。',
            saveWithExpensifyButton: '了解详情',
        },
        compareModal: {
            comparePlans: '对比方案',
            subtitle: `<muted-text>选择适合您的方案，解锁所需功能。<a href="${CONST.PRICING}">查看我们的定价页面</a>，了解各方案的完整功能对比。</muted-text>`,
        },
        details: {
            title: '订阅详情',
            annual: '年度订阅',
            taxExempt: '申请免税状态',
            taxExemptEnabled: '免税',
            taxExemptStatus: '免税状态',
            payPerUse: '按次付费',
            subscriptionSize: '订阅规模',
            headsUp:
                '提醒：如果你现在不设置订阅人数，我们会自动将其设为你第一个月的活跃成员数量。接下来 12 个月内，你至少需要为这一人数的成员付费。你可以随时增加订阅人数，但在本次订阅期结束前无法减少。',
            zeroCommitment: '零承诺享受折扣年订阅价',
        },
        subscriptionSize: {
            title: '订阅规模',
            yourSize: '您的订阅规模是指在任意一个月内，可由任何活跃成员占用的空闲席位数量。',
            eachMonth: '每个月，您的订阅包含最多为上方所设定数量的活跃成员。每当您增加订阅人数时，您都会以该新人数开始一个新的 12 个月订阅周期。',
            note: '注意：活跃成员指任何在您的公司工作区中创建、编辑、提交、批准、报销或导出过报销数据的人员。',
            confirmDetails: '确认您的新年度订阅详情：',
            subscriptionSize: '订阅规模',
            activeMembers: ({size}: SubscriptionSizeParams) => `每月 ${size} 名活跃成员`,
            subscriptionRenews: '订阅续订',
            youCantDowngrade: '在年度订阅期间，您无法降级。',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `您已承诺在 ${date} 之前的年度订阅中，每月订阅规模为 ${size} 名活跃成员。您可以在 ${date} 通过关闭自动续订来切换为按使用量付费的订阅。`,
            error: {
                size: '请输入有效的订阅数量',
                sameSize: '请输入一个与您当前订阅规模不同的数字',
            },
        },
        paymentCard: {
            addPaymentCard: '添加付款卡',
            enterPaymentCardDetails: '输入您的付款银行卡信息',
            security: 'Expensify 符合 PCI-DSS 标准，使用银行级加密，并通过冗余基础设施来保护您的数据。',
            learnMoreAboutSecurity: '进一步了解我们的安全措施。',
        },
        subscriptionSettings: {
            title: '订阅设置',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `订阅类型：${subscriptionType}，订阅规模：${subscriptionSize}，自动续订：${autoRenew}，自动增加年度席位：${autoIncrease}`,
            none: '无',
            on: '开上',
            off: '关关闭',
            annual: '每年',
            autoRenew: '自动续订',
            autoIncrease: '自动增加年度席位',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `每位活跃成员每月最多可节省 ${amountWithCurrency}`,
            automaticallyIncrease: '当活跃成员人数超过当前订阅席位数时，自动增加您的年度席位数量以满足需求。注意：这将延长您的年度订阅结束日期。',
            disableAutoRenew: '禁用自动续订',
            helpUsImprove: '帮助我们改进 Expensify',
            whatsMainReason: '您取消自动续订的主要原因是什么？',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `在 ${date} 续订。`,
            pricingConfiguration: '价格取决于配置。若想获得最低价格，请选择年度订阅并申请 Expensify Card。',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>请在我们的<a href="${CONST.PRICING}">定价页面</a>了解更多信息，或在您的 ${hasAdminsRoom ? `<a href="adminsRoom">#admins 房间。</a>` : '#admins 房间。'} 中与我们的团队聊天</muted-text>`,
            estimatedPrice: '预估价格',
            changesBasedOn: '此金额会根据你对 Expensify 卡的使用情况以及下方的订阅选项而变化。',
        },
        requestEarlyCancellation: {
            title: '申请提前取消',
            subtitle: '您申请提前取消的主要原因是什么？',
            subscriptionCanceled: {
                title: '订阅已取消',
                subtitle: '您的年度订阅已被取消。',
                info: '如果你想按次付费继续使用你的工作区，已经全部设置好了。',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `如果你想避免将来的活动和费用，你必须<a href="${workspacesListRoute}">删除你的工作区</a>。请注意，当你删除工作区时，你将被收取本日历月内已产生但尚未结清的所有活动费用。`,
            },
            requestSubmitted: {
                title: '请求已提交',
                subtitle: '感谢您告知我们您有意取消订阅。我们正在审核您的请求，稍后会通过您与<concierge-link>Concierge</concierge-link>的聊天与您联系。',
            },
            acknowledgement: `通过申请提前终止，我确认并同意，Expensify 在 Expensify 的<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>服务条款</a>或我与 Expensify 之间其他适用服务协议项下，没有义务批准此类申请，且 Expensify 对是否批准任何此类申请保留完全自行裁量权。`,
        },
    },
    feedbackSurvey: {
        tooLimited: '功能有待改进',
        tooExpensive: '太贵了',
        inadequateSupport: '客户支持不足',
        businessClosing: '公司关闭、缩减规模或被收购',
        additionalInfoTitle: '您要迁移到什么软件？为什么？',
        additionalInfoInputLabel: '你的回复',
    },
    roomChangeLog: {
        updateRoomDescription: '将房间描述设置为：',
        clearRoomDescription: '清除了房间描述',
        changedRoomAvatar: '更改了聊天室头像',
        removedRoomAvatar: '移除了聊天室头像',
    },
    delegate: {
        switchAccount: '切换账户：',
        copilotDelegatedAccess: 'Copilot：委派访问',
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
        genericError: '哎呀，出了点问题。请重试。',
        onBehalfOfMessage: (delegator: string) => `代表 ${delegator}`,
        accessLevel: '访问级别',
        confirmCopilot: '在下方确认你的副驾。',
        accessLevelDescription: '请选择下面的访问级别。完整访问和受限访问都允许副驾驶查看所有会话和报销。',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '允许其他成员以你的名义在你的账户中执行所有操作。包括聊天、提交、审批、付款、设置更新等。';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '允许其他成员代替你在你的账户中执行大部分操作。不包括审批、付款、拒绝和冻结。';
                default:
                    return '';
            }
        },
        removeCopilot: '移除副驾驶',
        removeCopilotConfirmation: '确定要移除这个副驾驶吗？',
        changeAccessLevel: '更改访问级别',
        makeSureItIsYou: '让我们确认是你本人',
        enterMagicCode: (contactMethod: string) => `请输入发送到 ${contactMethod} 的魔法验证码以添加副驾驶。验证码应在一两分钟内送达。`,
        enterMagicCodeUpdate: (contactMethod: string) => `请输入发送到 ${contactMethod} 的魔法验证码，以更新你的副驾驶。`,
        notAllowed: '先别急…',
        noAccessMessage: dedent(`
            作为副驾驶，你无权访问此页面。抱歉！
        `),
        notAllowedMessage: (accountOwnerEmail: string) => `作为 ${accountOwnerEmail} 的<a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">协作者</a>，你没有执行此操作的权限。抱歉！`,
        copilotAccess: 'Copilot 访问权限',
    },
    debug: {
        debug: '调试',
        details: '详情',
        JSON: 'JSON',
        reportActions: '操作',
        reportActionPreview: '预览',
        nothingToPreview: '无可预览内容',
        editJson: '编辑 JSON：',
        preview: '预览：',
        missingProperty: ({propertyName}: MissingPropertyParams) => `缺少 ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `属性无效：${propertyName} - 预期类型：${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `无效值 - 预期：${expectedValues}`,
        missingValue: '缺少值',
        createReportAction: '创建报表操作',
        reportAction: '报告操作',
        report: '报表',
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
        GBR: 'GBR',
        RBR: 'RBR',
        true: '真',
        false: 'false',
        viewReport: '查看报表',
        viewTransaction: '查看交易',
        createTransactionViolation: '创建交易违规',
        reasonVisibleInLHN: {
            hasDraftComment: '有草稿评论',
            hasGBR: '拥有 GBR',
            hasRBR: '有 RBR',
            pinnedByUser: '成员已置顶',
            hasIOUViolations: '存在借条违规',
            hasAddWorkspaceRoomErrors: '添加工作区聊天室时出错',
            isUnread: '为未读（专注模式）',
            isArchived: '已归档（最近模式）',
            isSelfDM: '是否为自我私信',
            isFocused: '暂时被聚焦',
        },
        reasonGBR: {
            hasJoinRequest: '有加入请求（管理员房间）',
            isUnreadWithMention: '提及且未读',
            isWaitingForAssigneeToCompleteAction: '正在等待受托人完成操作',
            hasChildReportAwaitingAction: '有子报销单等待处理',
            hasMissingInvoiceBankAccount: '缺少发票收款银行账户',
            hasUnresolvedCardFraudAlert: '有未处理的银行卡欺诈警报',
            hasDEWApproveFailed: 'DEW 审批是否失败',
        },
        reasonRBR: {
            hasErrors: '报表或报表操作数据中存在错误',
            hasViolations: '有违规',
            hasTransactionThreadViolations: '存在交易线程违规',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: '有一份报表正等待处理',
            theresAReportWithErrors: '有一份报表存在错误',
            theresAWorkspaceWithCustomUnitsErrors: '有一个包含自定义单位错误的工作区',
            theresAProblemWithAWorkspaceMember: '工作区成员存在问题',
            theresAProblemWithAWorkspaceQBOExport: '工作区连接导出设置出现问题。',
            theresAProblemWithAContactMethod: '联系方式存在问题',
            aContactMethodRequiresVerification: '联系方法需要验证',
            theresAProblemWithAPaymentMethod: '付款方式存在问题',
            theresAProblemWithAWorkspace: '工作区出现问题',
            theresAProblemWithYourReimbursementAccount: '您的报销账户出现问题',
            theresABillingProblemWithYourSubscription: '您的订阅存在账单问题',
            yourSubscriptionHasBeenSuccessfullyRenewed: '您的订阅已成功续订',
            theresWasAProblemDuringAWorkspaceConnectionSync: '工作区连接同步过程中出现问题',
            theresAProblemWithYourWallet: '您的钱包出现问题',
            theresAProblemWithYourWalletTerms: '您的钱包条款存在问题',
        },
    },
    emptySearchView: {
        takeATestDrive: '试用一下',
    },
    migratedUserWelcomeModal: {
        title: '欢迎使用全新 Expensify！',
        subtitle: '它保留了我们经典体验中你喜爱的全部内容，并加入了一系列升级，让你的生活变得更加轻松：',
        confirmText: '出发吧！',
        helpText: '试用 2 分钟演示',
        features: {
            search: '更强大的搜索功能，适用于移动端、网页和桌面端',
            concierge: '内置 Concierge AI，帮助自动化处理报销费用',
            chat: '在任意报销单上聊天，快速解决疑问',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '<tooltip>从<strong>这里</strong>开始！</tooltip>',
        saveSearchTooltip: '<tooltip><strong>在这里重命名您保存的搜索</strong>！</tooltip>',
        accountSwitcher: '<tooltip>在这里访问你的<strong>Copilot 账户</strong></tooltip>',
        scanTestTooltip: {
            main: '<tooltip>扫描我们的<strong>测试收据</strong>，看看它是如何工作的！</tooltip>',
            manager: '<tooltip>选择我们的<strong>测试管理员</strong>来试用吧！</tooltip>',
            confirmation: '<tooltip>现在，<strong>提交你的报销</strong>，见证奇迹发生！</tooltip>',
            tryItOut: '试用一下',
        },
        outstandingFilter: '<tooltip>筛选<strong>待审批</strong>的报销</tooltip>',
        scanTestDriveTooltip: '<tooltip>发送此收据以<strong>完成试用体验！</strong></tooltip>',
        gpsTooltip: '<tooltip>正在进行 GPS 轨迹记录！完成后，请在下方停止记录。</tooltip>',
    },
    discardChangesConfirmation: {
        title: '放弃更改？',
        body: '确定要放弃您所做的更改吗？',
        confirmText: '放弃更改',
    },
    scheduledCall: {
        book: {
            title: '安排通话',
            description: '找到一个适合你的时间。',
            slots: ({date}: {date: string}) => `<muted-text><strong>${date}</strong> 的可用时间</muted-text>`,
        },
        confirmation: {
            title: '确认通话',
            description: '请确认以下详细信息是否正确。一旦您确认通话，我们将发送包含更多信息的邀请。',
            setupSpecialist: '您的设置专员',
            meetingLength: '会议时长',
            dateTime: '日期和时间',
            minutes: '30 分钟',
        },
        callScheduled: '已安排通话',
    },
    autoSubmitModal: {
        title: '一切就绪并已提交！',
        description: '所有警告和违规都已清除，因此：',
        submittedExpensesTitle: '这些报销已提交',
        submittedExpensesDescription: '这些报销已经发送给您的审批人，但在被批准之前仍可编辑。',
        pendingExpensesTitle: '待处理报销已被移动',
        pendingExpensesDescription: '任何待处理的卡片费用都已移动到单独的报销单中，直到它们入账。',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '来体验 2 分钟试用之旅',
        },
        modal: {
            title: '试用一下我们吧',
            description: '快速了解产品，立即上手。',
            confirmText: '开始试用',
            helpText: '跳过',
            employee: {
                description: '<muted-text>为您的团队争取<strong>3 个月免费的 Expensify 使用时间！</strong>只需在下方输入您老板的邮箱，并给 TA 发送一笔测试报销。</muted-text>',
                email: '输入你老板的邮箱',
                error: '该成员拥有一个工作区，请输入其他成员进行测试。',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: '您目前正在试用 Expensify',
            readyForTheRealThing: '准备好来点真的了吗？',
            getStarted: '开始使用',
        },
        employeeInviteMessage: (name: string) => `# ${name} 邀请你试用 Expensify
嗨！我刚为我们争取到 *3 个月免费* 试用 Expensify，这是处理报销最快捷的方式。

这里有一张 *测试收据*，来展示它是如何运作的：`,
    },
    export: {
        basicExport: '基础导出',
        reportLevelExport: '所有数据 - 报告级别',
        expenseLevelExport: '所有数据 - 报销级别',
        exportInProgress: '导出进行中',
        conciergeWillSend: 'Concierge 会很快把文件发送给你。',
    },
    domain: {
        notVerified: '未验证',
        retry: '重试',
        verifyDomain: {
            title: '验证域名',
            beforeProceeding: ({domainName}: {domainName: string}) => `在继续之前，请先通过更新其 DNS 设置来验证您拥有 <strong>${domainName}</strong>。`,
            accessYourDNS: ({domainName}: {domainName: string}) => `访问你的 DNS 服务商并打开 <strong>${domainName}</strong> 的 DNS 设置。`,
            addTXTRecord: '添加以下 TXT 记录：',
            saveChanges: '保存更改并返回此处以验证您的域。',
            youMayNeedToConsult: `您可能需要联系您组织的 IT 部门以完成验证。<a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">了解详情</a>。`,
            warning: '验证完成后，您域中的所有 Expensify 成员都会收到一封电子邮件，告知其账户将由您的域进行管理。',
            codeFetchError: '无法获取验证码',
            genericError: '我们无法验证您的域名。请重试，如果问题仍然存在，请联系 Concierge。',
        },
        domainVerified: {
            title: '域名已验证',
            header: '哇哦！您的域名已通过验证',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>域名 <strong>${domainName}</strong> 已验证成功，您现在可以设置 SAML 和其他安全功能。</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'SAML 单点登录 (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML 单点登录</a>是一项安全功能，可让你更好地控制使用 <strong>${domainName}</strong> 邮箱的成员如何登录 Expensify。要启用此功能，你需要先完成验证，证明自己是授权的公司管理员。</muted-text>`,
            fasterAndEasierLogin: '更快速、更便捷的登录',
            moreSecurityAndControl: '更高的安全性和控制权',
            onePasswordForAnything: '一个密码通行所有内容',
        },
        goToDomain: '转到域名',
        samlLogin: {
            title: 'SAML 登录',
            subtitle: `<muted-text>使用<a href="${CONST.SAML_HELP_URL}">SAML 单点登录（SSO）</a>配置成员登录。</muted-text>`,
            enableSamlLogin: '启用 SAML 登录',
            allowMembers: '允许成员使用 SAML 登录。',
            requireSamlLogin: '要求使用 SAML 登录',
            anyMemberWillBeRequired: '使用其他方式登录的任何成员都需要使用 SAML 重新进行身份验证。',
            enableError: '无法更新 SAML 启用设置',
            requireError: '无法更新 SAML 要求设置',
            disableSamlRequired: '禁用 SAML 要求',
            oktaWarningPrompt: '确定要这样做吗？这也会禁用 Okta SCIM。',
            requireWithEmptyMetadataError: '请在下方添加身份提供商元数据以启用',
        },
        samlConfigurationDetails: {
            title: 'SAML 配置详情',
            subtitle: '使用以下详细信息来完成 SAML 设置。',
            identityProviderMetadata: '身份提供商元数据',
            entityID: '实体 ID',
            nameIDFormat: '名称 ID 格式',
            loginUrl: '登录 URL',
            acsUrl: 'ACS（断言消费者服务）URL',
            logoutUrl: '注销 URL',
            sloUrl: 'SLO（单点登出）URL',
            serviceProviderMetaData: '服务提供商元数据',
            oktaScimToken: 'Okta SCIM 令牌',
            revealToken: '显示令牌',
            fetchError: '无法获取 SAML 配置详情',
            setMetadataGenericError: '无法设置 SAML 元数据',
        },
        accessRestricted: {
            title: '访问受限',
            subtitle: (domainName: string) => `如果你需要管理以下内容，请先验证自己是 <strong>${domainName}</strong> 的授权公司管理员：`,
            companyCardManagement: '公司卡管理',
            accountCreationAndDeletion: '账户创建和删除',
            workspaceCreation: '工作区创建',
            samlSSO: 'SAML 单点登录',
        },
        addDomain: {
            title: '添加域名',
            subtitle: '输入你要访问的私有域名（例如 expensify.com）。',
            domainName: '域名',
            newDomain: '新域名',
        },
        domainAdded: {
            title: '已添加域名',
            description: '接下来，你需要验证该域名的所有权并调整安全设置。',
            configure: '配置',
        },
        enhancedSecurity: {
            title: '增强的安全性',
            subtitle: '要求您域中的成员通过单点登录进行登录、限制工作区创建等。',
            enable: '启用',
        },
        domainAdmins: '域管理员',
        admins: {
            title: '管理员',
            findAdmin: '查找管理员',
            primaryContact: '主要联系人',
            addPrimaryContact: '添加主要联系人',
            setPrimaryContactError: '无法设置主要联系人。请稍后重试。',
            settings: '设置',
            consolidatedDomainBilling: '整合域名账单',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>启用后，主要联系人将为所有由 <strong>${domainName}</strong> 成员拥有的工作区付款，并接收所有账单收据。</muted-text-label></comment>`,
            consolidatedDomainBillingError: '无法更改合并域名账单。请稍后重试。',
            addAdmin: '添加管理员',
            addAdminError: '无法将此成员添加为管理员。请重试。',
            revokeAdminAccess: '撤销管理员访问权限',
            cantRevokeAdminAccess: '无法撤销技术联系人的管理员权限',
            error: {
                removeAdmin: '无法将此用户从管理员中移除。请重试。',
                removeDomain: '无法移除此域。请重试。',
                removeDomainNameInvalid: '请输入您的域名以重置它。',
            },
            resetDomain: '重置域名',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `请输入 <strong>${domainName}</strong> 以确认重置域名。`,
            enterDomainName: '在此输入您的域名',
            resetDomainInfo: `此操作<strong>不可撤销</strong>，并将删除以下数据：<br/> <ul><li>公司卡连接以及这些卡片上所有未报销的费用</li> <li>SAML 和群组设置</li> </ul> 所有账号、工作区、报表、费用及其他数据将保留。<br/><br/>注意：您可以通过从<a href="#">联系方法</a>中移除关联邮箱来将此域从您的域列表中清除。`,
        },
        members: {
            title: '成员',
            findMember: '查找成员',
            addMember: '添加成员',
            email: '电子邮箱地址',
            errors: {
                addMember: '无法添加此成员。请重试。',
            },
        },
    },
};
export default translations;
