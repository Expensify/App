import type {ReportAction} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';
import type en from './en';

type AddressLineParams = {
    lineNumber: number;
};

type CharacterLimitParams = {
    limit: number;
};

type MaxParticipantsReachedParams = {
    count: number;
};

type ZipCodeExampleFormatParams = {
    zipSampleFormat: string;
};

type LoggedInAsParams = {
    email: string;
};

type NewFaceEnterMagicCodeParams = {
    login: string;
};

type WelcomeEnterMagicCodeParams = {
    login: string;
};

type AlreadySignedInParams = {
    email: string;
};

type GoBackMessageParams = {
    provider: string;
};

type LocalTimeParams = {
    user: string;
    time: string;
};

type EditActionParams = {
    action: ReportAction | null;
};

type DeleteActionParams = {
    action: ReportAction | null;
};

type DeleteConfirmationParams = {
    action: ReportAction | null;
};

type BeginningOfChatHistoryDomainRoomPartOneParams = {
    domainRoom: string;
};

type BeginningOfChatHistoryAdminRoomPartOneParams = {
    workspaceName: string;
};

type BeginningOfChatHistoryAnnounceRoomPartOneParams = {
    workspaceName: string;
};

type BeginningOfChatHistoryAnnounceRoomPartTwo = {
    workspaceName: string;
};

type WelcomeToRoomParams = {
    roomName: string;
};

type UsePlusButtonParams = {
    additionalText: string;
};

type ReportArchiveReasonsClosedParams = {
    displayName: string;
};

type ReportArchiveReasonsMergedParams = {
    displayName: string;
    oldDisplayName: string;
};

type ReportArchiveReasonsRemovedFromPolicyParams = {
    displayName: string;
    policyName: string;
    shouldUseYou?: boolean;
};

type ReportArchiveReasonsPolicyDeletedParams = {
    policyName: string;
};

type RequestCountParams = {
    count: number;
    scanningReceipts: number;
    pendingReceipts: number;
};

type SettleExpensifyCardParams = {
    formattedAmount: string;
};

type RequestAmountParams = {amount: string};

type RequestedAmountMessageParams = {formattedAmount: string; comment?: string};

type SplitAmountParams = {amount: string};

type DidSplitAmountMessageParams = {formattedAmount: string; comment: string};

type AmountEachParams = {amount: string};

type PayerOwesAmountParams = {payer: string; amount: number | string; comment?: string};

type PayerOwesParams = {payer: string};

type PayerPaidAmountParams = {payer?: string; amount: number | string};

type ApprovedAmountParams = {amount: number | string};

type ManagerApprovedParams = {manager: string};

type ManagerApprovedAmountParams = {manager: string; amount: number | string};

type PayerPaidParams = {payer: string};

type PayerSettledParams = {amount: number | string};

type WaitingOnBankAccountParams = {submitterDisplayName: string};

type CanceledRequestParams = {amount: string; submitterDisplayName: string};

type AdminCanceledRequestParams = {manager: string; amount: string};

type SettledAfterAddedBankAccountParams = {submitterDisplayName: string; amount: string};

type PaidElsewhereWithAmountParams = {payer?: string; amount: string};

type PaidWithExpensifyWithAmountParams = {payer?: string; amount: string};

type ThreadRequestReportNameParams = {formattedAmount: string; comment: string};

type ThreadSentMoneyReportNameParams = {formattedAmount: string; comment: string};

type SizeExceededParams = {maxUploadSizeInMB: number};

type ResolutionConstraintsParams = {minHeightInPx: number; minWidthInPx: number; maxHeightInPx: number; maxWidthInPx: number};

type NotAllowedExtensionParams = {allowedExtensions: string[]};

type EnterMagicCodeParams = {contactMethod: string};

type TransferParams = {amount: string};

type InstantSummaryParams = {rate: string; minAmount: string};

type NotYouParams = {user: string};

type DateShouldBeBeforeParams = {dateString: string};

type DateShouldBeAfterParams = {dateString: string};

type WeSentYouMagicSignInLinkParams = {login: string; loginType: string};

type ToValidateLoginParams = {primaryLogin: string; secondaryLogin: string};

type NoLongerHaveAccessParams = {primaryLogin: string};

type OurEmailProviderParams = {login: string};

type ConfirmThatParams = {login: string};

type UntilTimeParams = {time: string};

type StepCounterParams = {step: number; total?: number; text?: string};

type UserIsAlreadyMemberParams = {login: string; name: string};

type GoToRoomParams = {roomName: string};

type WelcomeNoteParams = {workspaceName: string};

type RoomNameReservedErrorParams = {reservedName: string};

type RenamedRoomActionParams = {oldName: string; newName: string};

type RoomRenamedToParams = {newName: string};

type OOOEventSummaryFullDayParams = {summary: string; dayCount: number; date: string};

type OOOEventSummaryPartialDayParams = {summary: string; timePeriod: string; date: string};

type ParentNavigationSummaryParams = {reportName?: string; workspaceName?: string};

type SetTheRequestParams = {valueName: string; newValueToDisplay: string};

type SetTheDistanceParams = {newDistanceToDisplay: string; newAmountToDisplay: string};

type RemovedTheRequestParams = {valueName: string; oldValueToDisplay: string};

type UpdatedTheRequestParams = {valueName: string; newValueToDisplay: string; oldValueToDisplay: string};

type UpdatedTheDistanceParams = {newDistanceToDisplay: string; oldDistanceToDisplay: string; newAmountToDisplay: string; oldAmountToDisplay: string};

type FormattedMaxLengthParams = {formattedMaxLength: string};

type WalletProgramParams = {walletProgram: string};

type ViolationsAutoReportedRejectedExpenseParams = {rejectedBy: string; rejectReason: string};

type ViolationsCashExpenseWithNoReceiptParams = {formattedLimit?: string};

type ViolationsConversionSurchargeParams = {surcharge?: number};

type ViolationsInvoiceMarkupParams = {invoiceMarkup?: number};

type ViolationsMaxAgeParams = {maxAge: number};

type ViolationsMissingTagParams = {tagName?: string};

type ViolationsOverAutoApprovalLimitParams = {formattedLimit?: string};

type ViolationsOverCategoryLimitParams = {formattedLimit?: string};

type ViolationsOverLimitParams = {formattedLimit?: string};

type ViolationsPerDayLimitParams = {formattedLimit?: string};

type ViolationsReceiptRequiredParams = {formattedLimit?: string; category?: string};

type ViolationsRterParams = {
    brokenBankConnection: boolean;
    isAdmin: boolean;
    email?: string;
    isTransactionOlderThan7Days: boolean;
    member?: string;
};

type ViolationsTagOutOfPolicyParams = {tagName?: string};

type ViolationsTaxOutOfPolicyParams = {taxName?: string};

type PaySomeoneParams = {name?: string};

type TaskCreatedActionParams = {title: string};

/* Translation Object types */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// type TranslationBaseValue = string | string[] | ((...args: any[]) => string);
// type TranslationBaseRecord = Record<string, TranslationBaseValue> | (() => Record<string, unknown>);

/* Flat Translation Object types */
// Flattens an object and returns concatenations of all the keys of nested objects
type FlattenObject<TObject, TPrefix extends string = ''> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [TKey in keyof TObject]: TObject[TKey] extends (...args: any[]) => any
        ? `${TPrefix}${TKey & string}`
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        TObject[TKey] extends any[]
        ? `${TPrefix}${TKey & string}`
        : // eslint-disable-next-line @typescript-eslint/ban-types
        TObject[TKey] extends object
        ? FlattenObject<TObject[TKey], `${TPrefix}${TKey & string}.`>
        : `${TPrefix}${TKey & string}`;
}[keyof TObject];

// Retrieves a type for a given key path (calculated from the type above)
type TranslateType<TObject, TPath extends string> = TPath extends keyof TObject
    ? TObject[TPath]
    : TPath extends `${infer TKey}.${infer TRest}`
    ? TKey extends keyof TObject
        ? TranslateType<TObject[TKey], TRest>
        : never
    : never;

type EnglishTranslation = typeof en;

type TranslationPaths = FlattenObject<EnglishTranslation>;

type TranslationFlatObject = {
    [TKey in TranslationPaths]: TranslateType<EnglishTranslation, TKey>;
};

type TermsParams = {amount: string};

type ElectronicFundsParams = {percentage: string; amount: string};

type LogSizeParams = {size: number};

type HeldRequestParams = {comment: string};

type DistanceRateOperationsParams = {count: number};

type ReimbursementRateParams = {unit: Unit};

type TranslationBase = {
    common: {
        cancel: string;
        dismiss: string;
        yes: string;
        no: string;
        ok: string;
        learnMore: string;
        buttonConfirm: string;
        name: string;
        attachment: string;
        to: string;
        optional: string;
        new: string;
        search: string;
        find: string;
        searchWithThreeDots: string;
        next: string;
        previous: string;
        goBack: string;
        create: string;
        add: string;
        resend: string;
        save: string;
        select: string;
        saveChanges: string;
        submit: string;
        rotate: string;
        zoom: string;
        password: string;
        magicCode: string;
        twoFactorCode: string;
        workspaces: string;
        chats: string;
        group: string;
        profile: string;
        referral: string;
        payments: string;
        wallet: string;
        preferences: string;
        view: string;
        not: string;
        signIn: string;
        signInWithGoogle: string;
        signInWithApple: string;
        signInWith: string;
        continue: string;
        firstName: string;
        lastName: string;
        phone: string;
        phoneNumber: string;
        phoneNumberPlaceholder: string;
        email: string;
        and: string;
        details: string;
        privacy: string;
        hidden: string;
        visible: string;
        delete: string;
        archived: string;
        contacts: string;
        recents: string;
        close: string;
        download: string;
        downloading: string;
        pin: string;
        unPin: string;
        back: string;
        saveAndContinue: string;
        settings: string;
        termsOfService: string;
        expensifyTermsOfService: string;
        members: string;
        invite: string;
        here: string;
        date: string;
        dob: string;
        currentYear: string;
        currentMonth: string;
        ssnLast4: string;
        ssnFull9: string;
        addressLine: (params: AddressLineParams) => string;
        personalAddress: string;
        companyAddress: string;
        noPO: string;
        city: string;
        state: string;
        streetAddress: string;
        stateOrProvince: string;
        country: string;
        zip: string;
        zipPostCode: string;
        whatThis: string;
        iAcceptThe: string;
        remove: string;
        admin: string;
        owner: string;
        dateFormat: string;
        send: string;
        notifications: string;
        na: string;
        noResultsFound: string;
        recentDestinations: string;
        timePrefix: string;
        conjunctionFor: string;
        todayAt: string;
        tomorrowAt: string;
        yesterdayAt: string;
        conjunctionAt: string;
        genericErrorMessage: string;
        error: {
            invalidAmount: string;
            acceptTerms: string;
            phoneNumber: string;
            fieldRequired: string;
            requestModified: string;
            characterLimit: (params: CharacterLimitParams) => string;
            characterLimitExceedCounter: (params: {length: number; limit: number}) => string;
            dateInvalid: string;
            invalidDateShouldBeFuture: string;
            invalidTimeShouldBeFuture: string;
            invalidCharacter: string;
            enterMerchant: string;
            enterAmount: string;
            enterDate: string;
            invalidTimeRange: string;
        };
        comma: string;
        semicolon: string;
        please: string;
        contactUs: string;
        pleaseEnterEmailOrPhoneNumber: string;
        fixTheErrors: string;
        inTheFormBeforeContinuing: string;
        confirm: string;
        reset: string;
        done: string;
        more: string;
        debitCard: string;
        bankAccount: string;
        personalBankAccount: string;
        businessBankAccount: string;
        join: string;
        leave: string;
        decline: string;
        transferBalance: string;
        cantFindAddress: string;
        enterManually: string;
        message: string;
        leaveThread: string;
        you: string;
        youAfterPreposition: string;
        your: string;
        conciergeHelp: string;
        maxParticipantsReached: (params: {count: number}) => {
            one: string;
            other: string;
        };
        youAppearToBeOffline: string;
        thisFeatureRequiresInternet: string;
        areYouSure: string;
        verify: string;
        yesContinue: string;
        websiteExample: string;
        zipCodeExampleFormat: (params: ZipCodeExampleFormatParams) => string;
        description: string;
        with: string;
        shareCode: string;
        share: string;
        per: string;
        mi: string;
        km: string;
        copied: string;
        someone: string;
        total: string;
        edit: string;
        letsDoThis: string;
        letsStart: string;
        showMore: string;
        merchant: string;
        category: string;
        billable: string;
        nonBillable: string;
        tag: string;
        receipt: string;
        replace: string;
        distance: string;
        mile: string;
        miles: string;
        kilometer: string;
        kilometers: string;
        recent: string;
        all: string;
        am: string;
        pm: string;
        tbd: string;
        selectCurrency: string;
        card: string;
        whyDoWeAskForThis: string;
        required: string;
        showing: string;
        of: string;
        default: string;
        update: string;
        member: string;
        role: string;
        currency: string;
        rate: string;
        emptyLHN: {
            title: string;
            subtitleText1: string;
            subtitleText2: string;
            subtitleText3: string;
        };
        businessName: string;
    };
    location: {
        useCurrent: string;
        notFound: string;
        permissionDenied: string;
        please: string;
        allowPermission: string;
        tryAgain: string;
    };
    anonymousReportFooter: {
        logoTagline: string;
    };
    attachmentPicker: {
        cameraPermissionRequired: string;
        expensifyDoesntHaveAccessToCamera: string;
        attachmentError: string;
        errorWhileSelectingAttachment: string;
        errorWhileSelectingCorruptedImage: string;
        takePhoto: string;
        chooseFromGallery: string;
        chooseDocument: string;
        attachmentTooLarge: string;
        sizeExceeded: string;
        attachmentTooSmall: string;
        sizeNotMet: string;
        wrongFileType: string;
        notAllowedExtension: string;
        folderNotAllowedMessage: string;
        protectedPDFNotSupported: string;
    };
    avatarCropModal: {
        title: string;
        description: string;
    };
    composer: {
        noExtensionFoundForMimeType: string;
        problemGettingImageYouPasted: string;
        commentExceededMaxLength: (params: FormattedMaxLengthParams) => string;
    };
    baseUpdateAppModal: {
        updateApp: string;
        updatePrompt: string;
    };
    deeplinkWrapper: {
        launching: string;
        expired: string;
        signIn: string;
        redirectedToDesktopApp: string;
        youCanAlso: string;
        openLinkInBrowser: string;
        loggedInAs: (params: LoggedInAsParams) => string;
        doNotSeePrompt: string;
        tryAgain: string;
        or: string;
        continueInWeb: string;
    };
    validateCodeModal: {
        successfulSignInTitle: string;
        successfulSignInDescription: string;
        title: string;
        description: string;
        or: string;
        signInHere: string;
        expiredCodeTitle: string;
        expiredCodeDescription: string;
        successfulNewCodeRequest: string;
        tfaRequiredTitle: string;
        tfaRequiredDescription: string;
    };
    moneyRequestConfirmationList: {
        paidBy: string;
        splitWith: string;
        whatsItFor: string;
    };
    optionsSelector: {
        nameEmailOrPhoneNumber: string;
        findMember: string;
    };
    videoChatButtonAndMenu: {
        tooltip: string;
    };
    hello: string;
    phoneCountryCode: string;
    welcomeText: {
        getStarted: string;
        anotherLoginPageIsOpen: string;
        anotherLoginPageIsOpenExplanation: string;
        welcomeBack: string;
        welcome: string;
        phrase2: string;
        phrase3: string;
        enterPassword: string;
        newFaceEnterMagicCode: (params: NewFaceEnterMagicCodeParams) => string;
        welcomeEnterMagicCode: (params: WelcomeEnterMagicCodeParams) => string;
    };
    login: {
        hero: {
            header: string;
            body: string;
        };
    };
    thirdPartySignIn: {
        alreadySignedIn: (params: AlreadySignedInParams) => string;
        goBackMessage: (params: GoBackMessageParams) => string;
        continueWithMyCurrentSession: string;
        redirectToDesktopMessage: string;
        signInAgreementMessage: string;
        termsOfService: string;
        privacy: string;
    };
    samlSignIn: {
        welcomeSAMLEnabled: string;
        orContinueWithMagicCode: string;
        useSingleSignOn: string;
        useMagicCode: string;
        launching: string;
        oneMoment: string;
    };
    reportActionCompose: {
        dropToUpload: string;
        sendAttachment: string;
        addAttachment: string;
        writeSomething: string;
        conciergePlaceholderOptions: (params: {isSmallScreenWidth: boolean}) => string;
        blockedFromConcierge: string;
        fileUploadFailed: string;
        localTime: (params: LocalTimeParams) => string;
        edited: string;
        emoji: string;
        collapse: string;
        expand: string;
    };
    reportActionContextMenu: {
        copyToClipboard: string;
        copied: string;
        copyLink: string;
        copyURLToClipboard: string;
        copyEmailToClipboard: string;
        markAsUnread: string;
        markAsRead: string;
        editAction: (params: EditActionParams) => string;
        deleteAction: (params: DeleteActionParams) => string;
        deleteConfirmation: (params: DeleteConfirmationParams) => string;
        onlyVisible: string;
        replyInThread: string;
        joinThread: string;
        leaveThread: string;
        flagAsOffensive: string;
        menu: string;
    };
    emojiReactions: {
        addReactionTooltip: string;
        reactedWith: string;
    };
    reportActionsView: {
        beginningOfArchivedRoomPartOne: string;
        beginningOfArchivedRoomPartTwo: string;
        beginningOfChatHistoryDomainRoomPartOne: (params: BeginningOfChatHistoryDomainRoomPartOneParams) => string;
        beginningOfChatHistoryDomainRoomPartTwo: string;
        beginningOfChatHistoryAdminRoomPartOne: (params: BeginningOfChatHistoryAdminRoomPartOneParams) => string;
        beginningOfChatHistoryAdminRoomPartTwo: string;
        beginningOfChatHistoryAdminOnlyPostingRoom: string;
        beginningOfChatHistoryAnnounceRoomPartOne: (params: BeginningOfChatHistoryAnnounceRoomPartOneParams) => string;
        beginningOfChatHistoryAnnounceRoomPartTwo: (params: BeginningOfChatHistoryAnnounceRoomPartTwo) => string;
        beginningOfChatHistoryUserRoomPartOne: string;
        beginningOfChatHistoryUserRoomPartTwo: string;
        beginningOfChatHistoryInvoiceRoom: string;
        beginningOfChatHistory: string;
        beginningOfChatHistoryPolicyExpenseChatPartOne: string;
        beginningOfChatHistoryPolicyExpenseChatPartTwo: string;
        beginningOfChatHistoryPolicyExpenseChatPartThree: string;
        beginningOfChatHistorySelfDM: string;
        chatWithAccountManager: string;
        sayHello: string;
        yourSpace: string;
        welcomeToRoom: (params: WelcomeToRoomParams) => string;
        usePlusButton: (params: UsePlusButtonParams) => string;
        iouTypes: {
            pay: string;
            split: string;
            submit: string;
            track: string;
            invoice: string;
        };
    };
    reportAction: {
        asCopilot: string;
    };
    mentionSuggestions: {
        hereAlternateText: string;
    };
    newMessages: string;
    reportTypingIndicator: {
        isTyping: string;
        areTyping: string;
        multipleUsers: string;
    };
    reportArchiveReasons: Record<string, string | ((params: unknown) => string)>;
    writeCapabilityPage: {
        label: string;
        writeCapability: {
            all: string;
            admins: string;
        };
    };
    sidebarScreen: {
        buttonFind: string;
        buttonMySettings: string;
        fabNewChat: string;
        fabNewChatExplained: string;
        chatPinned: string;
        draftedMessage: string;
        listOfChatMessages: string;
        listOfChats: string;
        saveTheWorld: string;
    };
    allSettingsScreen: {
        subscriptions: string;
        cardsAndDomains: string;
    };
    tabSelector: {
        chat: string;
        room: string;
        distance: string;
        manual: string;
        scan: string;
    };
    receipt: {
        upload: string;
        dragReceiptBeforeEmail: string;
        dragReceiptAfterEmail: string;
        chooseReceipt: string;
        chooseFile: string;
        takePhoto: string;
        cameraAccess: string;
        cameraErrorTitle: string;
        cameraErrorMessage: string;
        dropTitle: string;
        dropMessage: string;
        flash: string;
        shutter: string;
        gallery: string;
        deleteReceipt: string;
        deleteConfirmation: string;
        addReceipt: string;
    };
    quickAction: {
        scanReceipt: string;
        recordDistance: string;
        requestMoney: string;
        splitBill: string;
        splitScan: string;
        splitDistance: string;
        sendMoney: string;
        assignTask: string;
        header: string;
        trackManual: string;
        trackScan: string;
        trackDistance: string;
    };
    iou: {
        amount: string;
        taxAmount: string;
        taxRate: string;
        approve: string;
        approved: string;
        cash: string;
        card: string;
        original: string;
        split: string;
        splitExpense: string;
        paySomeone: (params: PaySomeoneParams) => string;
        expense: string;
        categorize: string;
        share: string;
        participants: string;
        submitExpense: string;
        trackExpense: string;
        pay: string;
        cancelPayment: string;
        cancelPaymentConfirmation: string;
        viewDetails: string;
        pending: string;
        canceled: string;
        posted: string;
        deleteReceipt: string;
        fieldPending: string;
        defaultRate: string;
        receiptScanning: string;
        receiptMissingDetails: string;
        missingAmount: string;
        missingMerchant: string;
        receiptStatusTitle: string;
        receiptStatusText: string;
        receiptScanningFailed: string;
        transactionPendingText: string;
        expenseCount: (params: {count: number; scanningReceipts?: number; pendingReceipts?: number}) => {
            one: string;
            other: string;
        };
        deleteExpense: string;
        deleteConfirmation: string;
        settledExpensify: string;
        settledElsewhere: string;
        settleExpensify: (params: SettleExpensifyCardParams) => string;
        payElsewhere: (params: SettleExpensifyCardParams) => string;
        nextStep: string;
        finished: string;
        submitAmount: (params: RequestAmountParams) => string;
        trackAmount: (params: RequestAmountParams) => string;
        submittedAmount: (params: RequestedAmountMessageParams) => string;
        trackedAmount: (params: RequestedAmountMessageParams) => string;
        splitAmount: (params: SplitAmountParams) => string;
        didSplitAmount: (params: DidSplitAmountMessageParams) => string;
        amountEach: (params: AmountEachParams) => string;
        payerOwesAmount: (params: PayerOwesAmountParams) => string;
        payerOwes: (params: PayerOwesParams) => string;
        payerPaidAmount: (params: PayerPaidAmountParams) => string;
        payerPaid: (params: PayerPaidParams) => string;
        payerSpentAmount: (params: PayerPaidAmountParams) => string;
        payerSpent: (params: PayerPaidParams) => string;
        managerApproved: (params: ManagerApprovedParams) => string;
        managerApprovedAmount: (params: ManagerApprovedAmountParams) => string;
        payerSettled: (params: PayerSettledParams) => string;
        approvedAmount: (params: ApprovedAmountParams) => string;
        waitingOnBankAccount: (params: WaitingOnBankAccountParams) => string;
        adminCanceledRequest: (params: AdminCanceledRequestParams) => string;
        canceledRequest: (params: CanceledRequestParams) => string;
        settledAfterAddedBankAccount: (params: SettledAfterAddedBankAccountParams) => string;
        paidElsewhereWithAmount: (params: PaidElsewhereWithAmountParams) => string;
        paidWithExpensifyWithAmount: (params: PaidWithExpensifyWithAmountParams) => string;
        noReimbursableExpenses: string;
        pendingConversionMessage: string;
        changedTheExpense: string;
        setTheRequest: (params: SetTheRequestParams) => string;
        setTheDistance: (params: SetTheDistanceParams) => string;
        removedTheRequest: (params: RemovedTheRequestParams) => string;
        updatedTheRequest: (params: UpdatedTheRequestParams) => string;
        updatedTheDistance: (params: UpdatedTheDistanceParams) => string;
        threadExpenseReportName: (params: ThreadRequestReportNameParams) => string;
        threadTrackReportName: (params: ThreadRequestReportNameParams) => string;
        threadPaySomeoneReportName: (params: ThreadSentMoneyReportNameParams) => string;
        tagSelection: string;
        categorySelection: string;
        error: {
            invalidCategoryLength: string;
            invalidAmount: string;
            invalidTaxAmount: (params: RequestAmountParams) => string;
            invalidSplit: string;
            other: string;
            genericCreateFailureMessage: string;
            receiptFailureMessage: string;
            saveFileMessage: string;
            loseFileMessage: string;
            genericDeleteFailureMessage: string;
            genericEditFailureMessage: string;
            genericSmartscanFailureMessage: string;
            duplicateWaypointsErrorMessage: string;
            atLeastTwoDifferentWaypoints: string;
            splitExpenseMultipleParticipantsErrorMessage: string;
            invalidMerchant: string;
        };
        waitingOnEnabledWallet: (params: WaitingOnBankAccountParams) => string;
        enableWallet: string;
        hold: string;
        holdExpense: string;
        unholdExpense: string;
        heldExpense: string;
        unheldExpense: string;
        explainHold: string;
        reason: string;
        holdReasonRequired: string;
        expenseOnHold: string;
        confirmApprove: string;
        confirmApprovalAmount: string;
        confirmPay: string;
        confirmPayAmount: string;
        payOnly: string;
        approveOnly: string;
        holdEducationalTitle: string;
        whatIsHoldTitle: string;
        whatIsHoldExplain: string;
        holdIsTemporaryTitle: string;
        holdIsTemporaryExplain: string;
        deleteHoldTitle: string;
        deleteHoldExplain: string;
        set: string;
        changed: string;
        removed: string;
        chooseARate: (params: ReimbursementRateParams) => string;
    };
    notificationPreferencesPage: {
        header: string;
        label: string;
        notificationPreferences: {
            always: string;
            daily: string;
            mute: string;
            hidden: string;
        };
    };
    loginField: {
        numberHasNotBeenValidated: string;
        emailHasNotBeenValidated: string;
    };
    avatarWithImagePicker: {
        uploadPhoto: string;
        removePhoto: string;
        editImage: string;
        viewPhoto: string;
        imageUploadFailed: string;
        deleteWorkspaceError: string;
        sizeExceeded: (params: SizeExceededParams) => string;
        resolutionConstraints: (params: ResolutionConstraintsParams) => string;
        notAllowedExtension: (params: NotAllowedExtensionParams) => string;
    };
    profilePage: {
        profile: string;
        preferredPronouns: string;
        selectYourPronouns: string;
        selfSelectYourPronoun: string;
        emailAddress: string;
        setMyTimezoneAutomatically: string;
        timezone: string;
        invalidFileMessage: string;
        avatarUploadFailureMessage: string;
        online: string;
        offline: string;
        syncing: string;
        profileAvatar: string;
        publicSection: {
            title: string;
            subtitle: string;
        };
        privateSection: {
            title: string;
            subtitle: string;
        };
    };
    securityPage: {
        title: string;
        subtitle: string;
    };
    shareCodePage: {
        title: string;
        subtitle: string;
    };
    pronounsPage: {
        pronouns: string;
        isShownOnProfile: string;
        placeholderText: string;
    };
    contacts: {
        contactMethod: string;
        contactMethods: string;
        helpTextBeforeEmail: string;
        helpTextAfterEmail: string;
        pleaseVerify: string;
        getInTouch: string;
        enterMagicCode: (params: EnterMagicCodeParams) => string;
        setAsDefault: string;
        yourDefaultContactMethod: string;
        removeContactMethod: string;
        removeAreYouSure: string;
        failedNewContact: string;
        genericFailureMessages: {
            requestContactMethodValidateCode: string;
            validateSecondaryLogin: string;
            deleteContactMethod: string;
            setDefaultContactMethod: string;
            addContactMethod: string;
            enteredMethodIsAlreadySubmited: string;
            passwordRequired: string;
            contactMethodRequired: string;
            invalidContactMethod: string;
        };
        newContactMethod: string;
        goBackContactMethods: string;
    };
    pronouns: {
        coCos: string;
        eEyEmEir: string;
        faeFaer: string;
        heHimHis: string;
        heHimHisTheyThemTheirs: string;
        sheHerHers: string;
        sheHerHersTheyThemTheirs: string;
        merMers: string;
        neNirNirs: string;
        neeNerNers: string;
        perPers: string;
        theyThemTheirs: string;
        thonThons: string;
        veVerVis: string;
        viVir: string;
        xeXemXyr: string;
        zeZieZirHir: string;
        zeHirHirs: string;
        callMeByMyName: string;
    };
    displayNamePage: {
        headerTitle: string;
        isShownOnProfile: string;
    };
    timezonePage: {
        timezone: string;
        isShownOnProfile: string;
        getLocationAutomatically: string;
    };
    updateRequiredView: {
        updateRequired: string;
        pleaseInstall: string;
        toGetLatestChanges: string;
    };
    initialSettingsPage: {
        about: string;
        aboutPage: {
            description: string;
            appDownloadLinks: string;
            viewKeyboardShortcuts: string;
            viewTheCode: string;
            viewOpenJobs: string;
            reportABug: string;
            troubleshoot: string;
        };
        appDownloadLinks: {
            android: {
                label: string;
            };
            ios: {
                label: string;
            };
            desktop: {
                label: string;
            };
        };
        troubleshoot: {
            clearCacheAndRestart: string;
            viewConsole: string;
            debugConsole: string;
            description: string;
            submitBug: string;
            confirmResetDescription: string;
            resetAndRefresh: string;
            clientSideLogging: string;
            noLogsToShare: string;
            useProfiling: string;
            profileTrace: string;
            releaseOptions: string;
            testingPreferences: string;
            useStagingServer: string;
            forceOffline: string;
            simulatFailingNetworkRequests: string;
            authenticationStatus: string;
            deviceCredentials: string;
            invalidate: string;
            destroy: string;
        };
        debugConsole: {
            saveLog: string;
            shareLog: string;
            enterCommand: string;
            execute: string;
            noLogsAvailable: string;
            logSizeTooLarge: (params: LogSizeParams) => string;
            logs: string;
        };
        security: string;
        signOut: string;
        restoreStashed: string;
        signOutConfirmationText: string;
        versionLetter: string;
        readTheTermsAndPrivacy: {
            phrase1: string;
            phrase2: string;
            phrase3: string;
            phrase4: string;
        };
        returnToClassic: string;
        help: string;
        accountSettings: string;
        account: string;
        general: string;
    };
    closeAccountPage: {
        closeAccount: string;
        reasonForLeavingPrompt: string;
        enterMessageHere: string;
        closeAccountWarning: string;
        closeAccountPermanentlyDeleteData: string;
        enterDefaultContactToConfirm: string;
        enterDefaultContact: string;
        defaultContact: string;
        enterYourDefaultContactMethod: string;
    };
    passwordPage: {
        changePassword: string;
        changingYourPasswordPrompt: string;
        currentPassword: string;
        newPassword: string;
        newPasswordPrompt: string;
        errors: {
            currentPassword: string;
            newPasswordSameAsOld: string;
            newPassword: string;
        };
    };
    twoFactorAuth: {
        headerTitle: string;
        twoFactorAuthEnabled: string;
        whatIsTwoFactorAuth: string;
        disableTwoFactorAuth: string;
        disableTwoFactorAuthConfirmation: string;
        disabled: string;
        noAuthenticatorApp: string;
        stepCodes: string;
        keepCodesSafe: string;
        codesLoseAccess: string;
        errorStepCodes: string;
        stepVerify: string;
        scanCode: string;
        authenticatorApp: string;
        addKey: string;
        enterCode: string;
        stepSuccess: string;
        enabled: string;
        congrats: string;
        copy: string;
        disable: string;
    };
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: string;
            incorrectRecoveryCode: string;
        };
        useRecoveryCode: string;
        recoveryCode: string;
        use2fa: string;
    };
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: string;
            incorrect2fa: string;
        };
    };
    passwordConfirmationScreen: {
        passwordUpdated: string;
        allSet: string;
    };
    privateNotes: {
        title: string;
        personalNoteMessage: string;
        sharedNoteMessage: string;
        composerLabel: string;
        myNote: string;
        error: {
            genericFailureMessage: string;
        };
    };
    addDebitCardPage: {
        addADebitCard: string;
        nameOnCard: string;
        debitCardNumber: string;
        expiration: string;
        expirationDate: string;
        cvv: string;
        billingAddress: string;
        growlMessageOnSave: string;
        expensifyPassword: string;
        error: {
            invalidName: string;
            addressZipCode: string;
            debitCardNumber: string;
            expirationDate: string;
            securityCode: string;
            addressStreet: string;
            addressState: string;
            addressCity: string;
            genericFailureMessage: string;
            password: string;
        };
    };
    walletPage: {
        paymentMethodsTitle: string;
        setDefaultConfirmation: string;
        setDefaultSuccess: string;
        deleteAccount: string;
        deleteConfirmation: string;
        error: {
            notOwnerOfBankAccount: string;
            invalidBankAccount: string;
        };
    };
};

export type {
    AdminCanceledRequestParams,
    ApprovedAmountParams,
    AddressLineParams,
    AlreadySignedInParams,
    AmountEachParams,
    BeginningOfChatHistoryAdminRoomPartOneParams,
    BeginningOfChatHistoryAnnounceRoomPartOneParams,
    BeginningOfChatHistoryAnnounceRoomPartTwo,
    BeginningOfChatHistoryDomainRoomPartOneParams,
    CanceledRequestParams,
    CharacterLimitParams,
    ConfirmThatParams,
    DateShouldBeAfterParams,
    DateShouldBeBeforeParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    DidSplitAmountMessageParams,
    DistanceRateOperationsParams,
    EditActionParams,
    ElectronicFundsParams,
    EnglishTranslation,
    EnterMagicCodeParams,
    FormattedMaxLengthParams,
    GoBackMessageParams,
    GoToRoomParams,
    InstantSummaryParams,
    LocalTimeParams,
    LoggedInAsParams,
    ManagerApprovedAmountParams,
    ManagerApprovedParams,
    MaxParticipantsReachedParams,
    NewFaceEnterMagicCodeParams,
    NoLongerHaveAccessParams,
    NotAllowedExtensionParams,
    NotYouParams,
    OOOEventSummaryFullDayParams,
    OOOEventSummaryPartialDayParams,
    OurEmailProviderParams,
    PaidElsewhereWithAmountParams,
    PaidWithExpensifyWithAmountParams,
    ParentNavigationSummaryParams,
    PayerOwesAmountParams,
    PayerOwesParams,
    PayerPaidAmountParams,
    PayerPaidParams,
    PayerSettledParams,
    RemovedTheRequestParams,
    RenamedRoomActionParams,
    ReportArchiveReasonsClosedParams,
    ReportArchiveReasonsMergedParams,
    ReportArchiveReasonsPolicyDeletedParams,
    ReportArchiveReasonsRemovedFromPolicyParams,
    RequestAmountParams,
    RequestCountParams,
    RequestedAmountMessageParams,
    ResolutionConstraintsParams,
    RoomNameReservedErrorParams,
    RoomRenamedToParams,
    SetTheDistanceParams,
    SetTheRequestParams,
    SettleExpensifyCardParams,
    SettledAfterAddedBankAccountParams,
    SizeExceededParams,
    SplitAmountParams,
    StepCounterParams,
    TaskCreatedActionParams,
    TermsParams,
    ThreadRequestReportNameParams,
    ThreadSentMoneyReportNameParams,
    ToValidateLoginParams,
    TransferParams,
    TranslationBase,
    TranslationFlatObject,
    TranslationPaths,
    UntilTimeParams,
    UpdatedTheDistanceParams,
    UpdatedTheRequestParams,
    UserIsAlreadyMemberParams,
    ViolationsAutoReportedRejectedExpenseParams,
    ViolationsCashExpenseWithNoReceiptParams,
    ViolationsConversionSurchargeParams,
    ViolationsInvoiceMarkupParams,
    ViolationsMaxAgeParams,
    ViolationsMissingTagParams,
    ViolationsOverAutoApprovalLimitParams,
    ViolationsOverCategoryLimitParams,
    ViolationsOverLimitParams,
    ViolationsPerDayLimitParams,
    ViolationsReceiptRequiredParams,
    ViolationsRterParams,
    ViolationsTagOutOfPolicyParams,
    ViolationsTaxOutOfPolicyParams,
    WaitingOnBankAccountParams,
    WalletProgramParams,
    UsePlusButtonParams,
    WeSentYouMagicSignInLinkParams,
    WelcomeEnterMagicCodeParams,
    WelcomeNoteParams,
    WelcomeToRoomParams,
    ZipCodeExampleFormatParams,
    LogSizeParams,
    HeldRequestParams,
    PaySomeoneParams,
    ReimbursementRateParams,
};
