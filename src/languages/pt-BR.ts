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
        count: 'Contagem',
        cancel: 'Cancelar',
        // @context Refers to closing or hiding a notification or message, not rejecting or ignoring something.
        dismiss: 'Fechar',
        // @context Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”
        proceed: 'Prosseguir',
        unshare: 'Deixar de compartilhar',
        yes: 'Sim',
        no: 'Não',
        // @context Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.
        ok: 'OK',
        notNow: 'Agora não',
        noThanks: 'Não, obrigado',
        learnMore: 'Saiba mais',
        buttonConfirm: 'Entendi',
        name: 'Nome',
        attachment: 'Anexo',
        attachments: 'Anexos',
        center: 'Centralizar',
        from: 'De',
        to: 'Para',
        in: 'Em',
        optional: 'Opcional',
        new: 'Novo',
        search: 'Pesquisar',
        reports: 'Relatórios',
        find: 'Encontrar',
        searchWithThreeDots: 'Pesquisar...',
        next: 'Próximo',
        previous: 'Anterior',
        goBack: 'Voltar',
        create: 'Criar',
        add: 'Adicionar',
        resend: 'Reenviar',
        save: 'Salvar',
        select: 'Selecionar',
        deselect: 'Desmarcar',
        // @context Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.
        selectMultiple: 'Selecionar múltiplos',
        saveChanges: 'Salvar alterações',
        submit: 'Enviar',
        // @context Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”
        submitted: 'Enviado',
        rotate: 'Girar',
        zoom: 'Zoom',
        password: 'Senha',
        magicCode: 'Código mágico',
        digits: 'dígitos',
        twoFactorCode: 'Código de autenticação de dois fatores',
        workspaces: 'Workspaces',
        inbox: 'Caixa de entrada',
        // @context Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”
        success: 'Sucesso',
        group: 'Grupo',
        profile: 'Perfil',
        referral: 'Indicação',
        payments: 'Pagamentos',
        approvals: 'Aprovações',
        wallet: 'Carteira',
        preferences: 'Preferências',
        view: 'Visualizar',
        review: (reviewParams?: ReviewParams) => `Revisar${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Não',
        signIn: 'Entrar',
        signInWithGoogle: 'Entrar com o Google',
        signInWithApple: 'Entrar com a Apple',
        signInWith: 'Entrar com',
        continue: 'Continuar',
        firstName: 'First name',
        lastName: 'Sobrenome',
        scanning: 'Escaneando',
        analyzing: 'Analisando...',
        addCardTermsOfService: 'Termos de Serviço da Expensify',
        perPerson: 'por pessoa',
        phone: 'Telefone',
        phoneNumber: 'Número de telefone',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'E-mail',
        and: 'e',
        or: 'ou',
        details: 'Detalhes',
        privacy: 'Privacidade',
        privacyPolicy: 'Política de Privacidade',
        hidden: 'Oculto',
        visible: 'Visível',
        delete: 'Excluir',
        // @context UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.
        archived: 'Arquivado',
        contacts: 'Contatos',
        recents: 'Recentes',
        close: 'Fechar',
        comment: 'Comentário',
        download: 'Baixar',
        downloading: 'Baixando',
        // @context Indicates that a file is currently being uploaded (sent to the server), not downloaded.
        uploading: 'Enviando',
        // @context as a verb, not a noun
        pin: 'Fixar',
        unPin: 'Desafixar',
        back: 'Voltar',
        saveAndContinue: 'Salvar e continuar',
        settings: 'Configurações',
        termsOfService: 'Termos de Serviço',
        members: 'Membros',
        invite: 'Convidar',
        here: 'aqui',
        date: 'Data',
        dob: 'Data de nascimento',
        currentYear: 'Ano atual',
        currentMonth: 'Mês atual',
        ssnLast4: 'Últimos 4 dígitos do SSN',
        ssnFull9: '9 dígitos completos do SSN',
        addressLine: (lineNumber: number) => `Linha de endereço ${lineNumber}`,
        personalAddress: 'Endereço pessoal',
        companyAddress: 'Endereço da empresa',
        noPO: 'Por favor, não use caixas postais ou endereços de recebimento de correspondência.',
        city: 'Cidade',
        state: 'Estado',
        streetAddress: 'Endereço (rua)',
        stateOrProvince: 'Estado / Província',
        country: 'País',
        zip: 'CEP',
        zipPostCode: 'CEP / Código postal',
        whatThis: 'O que é isto?',
        iAcceptThe: 'Eu aceito o',
        acceptTermsAndPrivacy: `Eu aceito os <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Termos de Serviço da Expensify</a> e a <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Política de Privacidade</a>`,
        acceptTermsAndConditions: `Eu aceito os <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">termos e condições</a>`,
        acceptTermsOfService: `Eu aceito os <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Termos de Serviço da Expensify</a>`,
        remove: 'Remover',
        admin: 'Administrador',
        owner: 'Proprietário',
        dateFormat: 'AAAA-MM-DD',
        send: 'Enviar',
        na: 'N/D',
        noResultsFound: 'Nenhum resultado encontrado',
        noResultsFoundMatching: (searchString: string) => `Nenhum resultado encontrado correspondente a "${searchString}"`,
        recentDestinations: 'Destinos recentes',
        timePrefix: 'É',
        conjunctionFor: 'para',
        todayAt: 'Hoje às',
        tomorrowAt: 'Amanhã às',
        yesterdayAt: 'Ontem às',
        conjunctionAt: 'em',
        conjunctionTo: 'para',
        genericErrorMessage: 'Ops... algo deu errado e sua solicitação não pôde ser concluída. Tente novamente mais tarde.',
        percentage: 'Porcentagem',
        converted: 'Convertido',
        error: {
            invalidAmount: 'Valor inválido',
            acceptTerms: 'Você deve aceitar os Termos de Serviço para continuar',
            phoneNumber: `Insira um número de telefone completo
(p.ex., ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Este campo é obrigatório',
            requestModified: 'Esta solicitação está sendo modificada por outro membro',
            characterLimitExceedCounter: (length: number, limit: number) => `Limite de caracteres excedido (${length}/${limit})`,
            dateInvalid: 'Selecione uma data válida',
            invalidDateShouldBeFuture: 'Por favor, escolha hoje ou uma data futura',
            invalidTimeShouldBeFuture: 'Escolha um horário pelo menos um minuto à frente',
            invalidCharacter: 'Caractere inválido',
            enterMerchant: 'Insira o nome do estabelecimento',
            enterAmount: 'Insira um valor',
            missingMerchantName: 'Nome do estabelecimento ausente',
            missingAmount: 'Valor ausente',
            missingDate: 'Data ausente',
            enterDate: 'Insira uma data',
            invalidTimeRange: 'Insira um horário usando o formato de 12 horas (por exemplo, 14h30)',
            pleaseCompleteForm: 'Conclua o formulário acima para continuar',
            pleaseSelectOne: 'Selecione uma opção acima',
            invalidRateError: 'Insira uma taxa válida',
            lowRateError: 'A taxa deve ser maior que 0',
            email: 'Insira um endereço de e-mail válido',
            login: 'Ocorreu um erro ao fazer login. Tente novamente.',
        },
        comma: 'vírgula',
        semicolon: 'ponto e vírgula',
        please: 'Por favor',
        // @context Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.
        contactUs: 'Fale conosco',
        pleaseEnterEmailOrPhoneNumber: 'Insira um e-mail ou número de telefone',
        // @context Instruction prompting the user to correct multiple issues. Should use imperative form when translated.
        fixTheErrors: 'corrija os erros',
        inTheFormBeforeContinuing: 'no formulário antes de continuar',
        confirm: 'Confirmar',
        reset: 'Redefinir',
        // @context Status or button indicating that an action or process has been completed. Should reflect completion.
        done: 'Concluído',
        more: 'Mais',
        debitCard: 'Cartão de débito',
        bankAccount: 'Conta bancária',
        personalBankAccount: 'Conta bancária pessoal',
        businessBankAccount: 'Conta bancária empresarial',
        join: 'Participar',
        leave: 'Sair',
        decline: 'Recusar',
        reject: 'Rejeitar',
        transferBalance: 'Transferir saldo',
        // @context Instruction telling the user to input data manually. Refers to entering text or values in a field.
        enterManually: 'Insira manualmente',
        message: 'Mensagem',
        leaveThread: 'Sair da conversa',
        you: 'Você',
        // @context Refers to the current user in the UI. Should follow capitalization rules for labels/pronouns in the target language.
        me: 'Eu',
        youAfterPreposition: 'você',
        your: 'seu',
        conciergeHelp: 'Entre em contato com o Concierge para obter ajuda.',
        youAppearToBeOffline: 'Parece que você está offline.',
        thisFeatureRequiresInternet: 'Este recurso requer uma conexão ativa com a internet.',
        attachmentWillBeAvailableOnceBackOnline: 'O anexo ficará disponível assim que você voltar a ficar online.',
        errorOccurredWhileTryingToPlayVideo: 'Ocorreu um erro ao tentar reproduzir este vídeo.',
        areYouSure: 'Tem certeza?',
        verify: 'Verificar',
        yesContinue: 'Sim, continuar',
        // @context Provides an example format for a website URL.
        websiteExample: 'p.ex. https://www.expensify.com',
        // @context Provides an example format for a ZIP/postal code.
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `por exemplo, ${zipSampleFormat}` : ''),
        description: 'Descrição',
        title: 'Título',
        assignee: 'Responsável',
        createdBy: 'Criado por',
        with: 'com',
        shareCode: 'Compartilhar código',
        share: 'Compartilhar',
        per: 'por',
        // @context Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.
        mi: 'milha',
        km: 'quilômetro',
        copied: 'Copiado!',
        someone: 'Alguém',
        total: 'Total',
        edit: 'Editar',
        letsDoThis: `Vamos nessa!`,
        letsStart: `Vamos começar`,
        showMore: 'Mostrar mais',
        showLess: 'Mostrar menos',
        merchant: 'Comerciante',
        change: 'Alterar',
        category: 'Categoria',
        report: 'Relatório',
        billable: 'Faturável',
        nonBillable: 'Não faturável',
        tag: 'Tag',
        receipt: 'Recibo',
        verified: 'Verificado',
        replace: 'Substituir',
        distance: 'Distância',
        mile: 'milha',
        // @context Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.
        miles: 'milhas',
        kilometer: 'quilômetro',
        kilometers: 'quilômetros',
        recent: 'Recentes',
        all: 'Todos',
        am: 'AM',
        pm: 'PM',
        // @context Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.
        tbd: 'A definir',
        selectCurrency: 'Selecione uma moeda',
        selectSymbolOrCurrency: 'Selecione um símbolo ou moeda',
        card: 'Cartão',
        whyDoWeAskForThis: 'Por que pedimos isso?',
        required: 'Obrigatório',
        showing: 'Mostrando',
        of: 'de',
        default: 'Padrão',
        update: 'Atualizar',
        member: 'Membro',
        auditor: 'Auditor',
        role: 'Função',
        currency: 'Moeda',
        groupCurrency: 'Moeda do grupo',
        rate: 'Taxa',
        emptyLHN: {
            title: 'Oba! Você está em dia com tudo.',
            subtitleText1: 'Encontre um chat usando o',
            subtitleText2: 'botão acima ou crie algo usando o',
            subtitleText3: 'botão abaixo.',
        },
        businessName: 'Nome da empresa',
        clear: 'Limpar',
        type: 'Tipo',
        reportName: 'Nome do relatório',
        action: 'Ação',
        expenses: 'Despesas',
        totalSpend: 'Gasto total',
        tax: 'Imposto',
        shared: 'Compartilhado',
        drafts: 'Rascunhos',
        // @context as a noun, not a verb
        draft: 'Rascunho',
        finished: 'Concluído',
        upgrade: 'Fazer upgrade',
        downgradeWorkspace: 'Rebaixar espaço de trabalho',
        companyID: 'ID da empresa',
        userID: 'ID do usuário',
        disable: 'Desativar',
        export: 'Exportar',
        initialValue: 'Valor inicial',
        // @context UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.
        currentDate: 'Data atual',
        value: 'Valor',
        downloadFailedTitle: 'Falha no download',
        downloadFailedDescription: 'Seu download não pôde ser concluído. Tente novamente mais tarde.',
        filterLogs: 'Filtrar Logs',
        network: 'Rede',
        reportID: 'ID do Relatório',
        longReportID: 'ID de relatório longo',
        withdrawalID: 'ID de saque',
        bankAccounts: 'Contas bancárias',
        chooseFile: 'Escolher arquivo',
        chooseFiles: 'Escolher arquivos',
        // @context Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.
        dropTitle: 'Solte aqui',
        // @context Instruction for dropping one or more files into an upload area.
        dropMessage: 'Solte seu arquivo aqui',
        ignore: 'Ignorar',
        enabled: 'Ativado',
        disabled: 'Desativado',
        // @context Action button for importing a file or data. Should use the verb form, not the noun form.
        import: 'Importar',
        offlinePrompt: 'Você não pode realizar esta ação agora.',
        // @context meaning "remaining to be paid, done, or dealt with", not "exceptionally good"
        outstanding: 'Pendente',
        chats: 'Chats',
        tasks: 'Tarefas',
        unread: 'Não lido',
        sent: 'Enviado',
        links: 'Links',
        // @context Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).
        day: 'dia',
        days: 'dias',
        rename: 'Renomear',
        address: 'Endereço',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        secondAbbreviation: 's',
        skip: 'Pular',
        chatWithAccountManager: (accountManagerDisplayName: string) => `Precisa de algo específico? Converse com seu gerente de conta, ${accountManagerDisplayName}.`,
        chatNow: 'Conversar agora',
        workEmail: 'E-mail de trabalho',
        destination: 'Destino',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: 'Taxa secundária',
        perDiem: 'Diária',
        validate: 'Validar',
        downloadAsPDF: 'Baixar como PDF',
        downloadAsCSV: 'Baixar como CSV',
        help: 'Ajuda',
        expenseReport: 'Relatório de Despesas',
        expenseReports: 'Relatórios de despesas',
        // @context Rate as a noun, not a verb
        rateOutOfPolicy: 'Tarifa fora da política',
        leaveWorkspace: 'Sair do workspace',
        leaveWorkspaceConfirmation: 'Se você sair deste workspace, não poderá enviar despesas para ele.',
        leaveWorkspaceConfirmationAuditor: 'Se você sair deste espaço de trabalho, não poderá ver seus relatórios e configurações.',
        leaveWorkspaceConfirmationAdmin: 'Se você sair deste workspace, não poderá mais gerenciar suas configurações.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Se você sair deste workspace, você será substituído no fluxo de aprovação por ${workspaceOwner}, o proprietário do workspace.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Se você sair deste workspace, você será substituído como exportador preferencial por ${workspaceOwner}, o proprietário do workspace.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Se você sair deste workspace, você será substituído como contato técnico por ${workspaceOwner}, o proprietário do workspace.`,
        leaveWorkspaceReimburser: 'Você não pode sair deste workspace sendo o reembolsador. Defina um novo reembolsador em Workspaces > Fazer ou acompanhar pagamentos e tente novamente.',
        reimbursable: 'Reembolsável',
        editYourProfile: 'Editar seu perfil',
        comments: 'Comentários',
        sharedIn: 'Compartilhado em',
        unreported: 'Não reportado',
        explore: 'Explorar',
        todo: 'A fazer',
        invoice: 'Fatura',
        expense: 'Despesa',
        chat: 'Chat',
        task: 'Tarefa',
        trip: 'Viagem',
        apply: 'Aplicar',
        status: 'Status',
        on: 'Ativado',
        before: 'Antes',
        after: 'Depois',
        reschedule: 'Reagendar',
        general: 'Geral',
        workspacesTabTitle: 'Workspaces',
        headsUp: 'Atenção!',
        submitTo: 'Enviar para',
        forwardTo: 'Encaminhar para',
        merge: 'Mesclar',
        none: 'Nenhum',
        unstableInternetConnection: 'Conexão de internet instável. Verifique sua rede e tente novamente.',
        enableGlobalReimbursements: 'Ativar Reembolsos Globais',
        purchaseAmount: 'Valor da compra',
        frequency: 'Frequência',
        link: 'Link',
        pinned: 'Fixado',
        read: 'Ler',
        copyToClipboard: 'Copiar para a área de transferência',
        thisIsTakingLongerThanExpected: 'Isso está levando mais tempo do que o esperado...',
        domains: 'Domínios',
        actionRequired: 'Ação necessária',
        duplicate: 'Duplicar',
        duplicated: 'Duplicado',
        exchangeRate: 'Taxa de câmbio',
        reimbursableTotal: 'Total reembolsável',
        nonReimbursableTotal: 'Total não reembolsável',
        originalAmount: 'Valor original',
        insights: 'Insights',
        duplicateExpense: 'Despesa duplicada',
        newFeature: 'Novo recurso',
        month: 'Mês',
        home: 'Início',
        week: 'Semana',
        year: 'Ano',
        quarter: 'Trimestre',
    },
    supportalNoAccess: {
        title: 'Não tão rápido',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) =>
            `Você não está autorizado a realizar esta ação quando o suporte estiver conectado (comando: ${command ?? ''}). Se você acha que a equipe de Sucesso deveria poder realizar esta ação, inicie uma conversa no Slack.`,
    },
    lockedAccount: {
        title: 'Conta bloqueada',
        description: 'Você não tem permissão para concluir esta ação, pois esta conta foi bloqueada. Entre em contato com concierge@expensify.com para saber os próximos passos.',
    },
    location: {
        useCurrent: 'Usar localização atual',
        notFound: 'Não foi possível encontrar sua localização. Tente novamente ou insira um endereço manualmente.',
        permissionDenied: 'Parece que você negou acesso à sua localização.',
        please: 'Por favor',
        allowPermission: 'permitir acesso à localização nas configurações',
        tryAgain: 'e tente novamente.',
    },
    contact: {
        importContacts: 'Importar contatos',
        importContactsTitle: 'Importe seus contatos',
        importContactsText: 'Importe os contatos do seu telefone para que suas pessoas favoritas estejam sempre a um toque de distância.',
        importContactsExplanation: 'assim, suas pessoas favoritas estarão sempre a um toque de distância.',
        importContactsNativeText: 'Só mais um passo! Dê-nos o sinal verde para importar seus contatos.',
    },
    anonymousReportFooter: {
        logoTagline: 'Participe da discussão.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Acesso à câmera',
        expensifyDoesNotHaveAccessToCamera: 'O Expensify não pode tirar fotos sem acesso à sua câmera. Toque em Configurações para atualizar as permissões.',
        attachmentError: 'Erro de anexo',
        errorWhileSelectingAttachment: 'Ocorreu um erro ao selecionar um anexo. Tente novamente.',
        errorWhileSelectingCorruptedAttachment: 'Ocorreu um erro ao selecionar um anexo corrompido. Tente outro arquivo.',
        takePhoto: 'Tirar foto',
        chooseFromGallery: 'Escolher na galeria',
        chooseDocument: 'Escolher arquivo',
        attachmentTooLarge: 'O anexo é grande demais',
        sizeExceeded: 'O tamanho do anexo é maior que o limite de 24 MB',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `O tamanho do anexo é maior que o limite de ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Anexo é muito pequeno',
        sizeNotMet: 'O tamanho do anexo deve ser maior que 240 bytes',
        wrongFileType: 'Tipo de arquivo inválido',
        notAllowedExtension: 'Este tipo de arquivo não é permitido. Tente um tipo de arquivo diferente.',
        folderNotAllowedMessage: 'Não é permitido enviar uma pasta. Tente um arquivo diferente.',
        protectedPDFNotSupported: 'PDF protegido por senha não é compatível',
        attachmentImageResized: 'Esta imagem foi redimensionada para visualização. Baixe para a resolução completa.',
        attachmentImageTooLarge: 'Esta imagem é muito grande para ser visualizada antes do envio.',
        tooManyFiles: (fileLimit: number) => `Você só pode enviar até ${fileLimit} arquivos por vez.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Os arquivos excedem ${maxUploadSizeInMB} MB. Tente novamente.`,
        someFilesCantBeUploaded: 'Alguns arquivos não podem ser enviados',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Os arquivos devem ter menos de ${maxUploadSizeInMB} MB. Arquivos maiores não serão carregados.`,
        maxFileLimitExceeded: 'Você pode enviar até 30 recibos por vez. Quaisquer extras não serão enviados.',
        unsupportedFileType: (fileType: string) => `Arquivos ${fileType} não são compatíveis. Somente tipos de arquivo compatíveis serão enviados.`,
        learnMoreAboutSupportedFiles: 'Saiba mais sobre os formatos compatíveis.',
        passwordProtected: 'PDFs protegidos por senha não são compatíveis. Somente arquivos compatíveis serão enviados.',
    },
    dropzone: {
        addAttachments: 'Adicionar anexos',
        addReceipt: 'Adicionar recibo',
        scanReceipts: 'Digitalizar recibos',
        replaceReceipt: 'Substituir recibo',
    },
    filePicker: {
        fileError: 'Erro de arquivo',
        errorWhileSelectingFile: 'Ocorreu um erro ao selecionar um arquivo. Tente novamente.',
    },
    connectionComplete: {
        title: 'Conexão concluída',
        supportingText: 'Você pode fechar esta janela e voltar para o aplicativo Expensify.',
    },
    avatarCropModal: {
        title: 'Editar foto',
        description: 'Arraste, amplie e gire sua imagem como quiser.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Nenhuma extensão encontrada para o tipo MIME',
        problemGettingImageYouPasted: 'Houve um problema ao obter a imagem que você colou',
        commentExceededMaxLength: (formattedMaxLength: string) => `O comprimento máximo do comentário é de ${formattedMaxLength} caracteres.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `O comprimento máximo do título da tarefa é de ${formattedMaxLength} caracteres.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Atualizar app',
        updatePrompt: 'Uma nova versão deste app está disponível.\nAtualize agora ou reinicie o app mais tarde para baixar as alterações mais recentes.',
    },
    deeplinkWrapper: {
        launching: 'Lançando o Expensify',
        expired: 'Sua sessão expirou.',
        signIn: 'Entre novamente.',
    },
    multifactorAuthentication: {
        biometricsTest: {
            biometricsTest: 'Teste biométrico',
            authenticationSuccessful: 'Autenticação bem-sucedida',
            successfullyAuthenticatedUsing: ({authType}) => `Você autenticou com sucesso utilizando ${authType}.`,
            troubleshootBiometricsStatus: ({registered}) => `Biometria (${registered ? 'Registrada' : 'Não registrada'})`,
            yourAttemptWasUnsuccessful: 'Sua tentativa de autenticação não foi bem-sucedida.',
            youCouldNotBeAuthenticated: 'Você não pôde ser autenticado',
            areYouSureToReject: 'Tem certeza? A tentativa de autenticação será rejeitada se você fechar esta tela.',
            rejectAuthentication: 'Rejeitar autenticação',
            test: 'Teste',
            biometricsAuthentication: 'Autenticação biométrica',
        },
        pleaseEnableInSystemSettings: {
            start: 'Por favor, habilite a verificação por rosto/impressão digital ou defina um código de acesso do dispositivo em suas ',
            link: 'configurações do sistema',
            end: '.',
        },
        oops: 'Ops, algo deu errado',
        looksLikeYouRanOutOfTime: 'Parece que você ficou sem tempo! Por favor, tente novamente no comerciante.',
        youRanOutOfTime: 'Você ficou sem tempo',
        letsVerifyItsYou: 'Vamos verificar se é você',
        verifyYourself: {
            biometrics: 'Verifique sua identidade com seu rosto ou impressão digital',
        },
        enableQuickVerification: {
            biometrics: 'Habilite a verificação rápida e segura usando seu rosto ou impressão digital. Sem senhas ou códigos necessários.',
        },
        revoke: {
            title: 'Rosto/digital & chaves de acesso',
            explanation:
                'A verificação por rosto/digital ou chave de acesso está ativada em um ou mais dispositivos. Revogar o acesso exigirá um código mágico na próxima verificação em qualquer dispositivo.',
            confirmationPrompt: 'Tem certeza? Você precisará de um código mágico para a próxima verificação em qualquer dispositivo.',
            cta: 'Revogar acesso',
            noDevices: 'Você não tem nenhum dispositivo registrado para verificação por rosto/digital ou passkey. Se você registrar algum, poderá revogar esse acesso aqui.',
            dismiss: 'Entendi',
            error: 'Falha na solicitação. Tente novamente mais tarde.',
            remove: 'Remover',
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            Abracadabra,
            você entrou!
        `),
        successfulSignInDescription: 'Volte para a sua aba original para continuar.',
        title: 'Aqui está o seu código mágico',
        description: dedent(`
            Digite o código no dispositivo
            onde ele foi solicitado originalmente
        `),
        doNotShare: dedent(`
            Não compartilhe seu código com ninguém.
            A Expensify nunca irá pedi-lo!
        `),
        or: ', ou',
        signInHere: 'basta entrar aqui',
        expiredCodeTitle: 'Código mágico expirado',
        expiredCodeDescription: 'Volte ao dispositivo original e solicite um novo código',
        successfulNewCodeRequest: 'Código solicitado. Verifique seu dispositivo.',
        tfaRequiredTitle: dedent(`
            Autenticação de dois fatores
            obrigatória
        `),
        tfaRequiredDescription: dedent(`
            Insira o código de autenticação em duas etapas
            no local em que você está tentando entrar.
        `),
        requestOneHere: 'solicitar um aqui.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Pago por',
        whatsItFor: 'Para que serve?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Nome, e-mail ou número de telefone',
        findMember: 'Encontrar um membro',
        searchForSomeone: 'Pesquisar alguém',
    },
    customApprovalWorkflow: {
        title: 'Fluxo de aprovação personalizado',
        description: 'Sua empresa tem um fluxo de aprovação personalizado neste espaço de trabalho. Por favor, faça esta ação no Expensify Classic',
        goToExpensifyClassic: 'Mudar para o Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Envie uma despesa, indique sua equipe',
            subtitleText: 'Quer que sua equipe use o Expensify também? Basta enviar uma despesa para eles e nós cuidaremos do resto.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Agendar uma ligação',
    },
    hello: 'Olá',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Comece abaixo.',
        anotherLoginPageIsOpen: 'Outra página de login está aberta.',
        anotherLoginPageIsOpenExplanation: 'Você abriu a página de login em uma aba separada. Faça login a partir dessa aba.',
        welcome: 'Bem-vindo!',
        welcomeWithoutExclamation: 'Bem-vindo',
        phrase2: 'Dinheiro fala mais alto. E agora que bate-papo e pagamentos estão em um só lugar, também ficou fácil.',
        phrase3: 'Seus pagamentos chegam até você tão rápido quanto você consegue transmitir sua mensagem.',
        enterPassword: 'Insira sua senha',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, é sempre ótimo ver um rosto novo por aqui!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Insira o código mágico enviado para ${login}. Ele deve chegar dentro de um ou dois minutos.`,
    },
    login: {
        hero: {
            header: 'Viagens e despesas, na velocidade do chat',
            body: 'Bem-vindo à próxima geração do Expensify, onde suas viagens e despesas avançam mais rápido com a ajuda de um chat contextual em tempo real.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Continue fazendo login com logon único',
        orContinueWithMagicCode: 'Você também pode entrar com um código mágico',
        useSingleSignOn: 'Usar logon único',
        useMagicCode: 'Use código mágico',
        launching: 'Iniciando...',
        oneMoment: 'Um momento enquanto redirecionamos você para o portal de login único da sua empresa.',
    },
    reportActionCompose: {
        dropToUpload: 'Solte para enviar',
        sendAttachment: 'Enviar anexo',
        addAttachment: 'Adicionar anexo',
        writeSomething: 'Escreva algo...',
        blockedFromConcierge: 'A comunicação está bloqueada',
        fileUploadFailed: 'Falha no upload. Arquivo não é compatível.',
        localTime: ({user, time}: LocalTimeParams) => `É ${time} para ${user}`,
        edited: '(editado)',
        emoji: 'Emoji',
        collapse: 'Recolher',
        expand: 'Expandir',
    },
    reportActionContextMenu: {
        copyMessage: 'Copiar mensagem',
        copied: 'Copiado!',
        copyLink: 'Copiar link',
        copyURLToClipboard: 'Copiar URL para a área de transferência',
        copyEmailToClipboard: 'Copiar e-mail para a área de transferência',
        markAsUnread: 'Marcar como não lida',
        markAsRead: 'Marcar como lido',
        editAction: ({action}: EditActionParams) => `Editar ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'despesa' : 'comentário'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = 'comentário';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Excluir ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = 'comentário';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Tem certeza de que deseja excluir este(a) ${type}?`;
        },
        onlyVisible: 'Visível apenas para',
        explain: 'Explicar',
        explainMessage: 'Por favor, explique isso para mim.',
        replyInThread: 'Responder na conversa',
        joinThread: 'Participar da conversa',
        leaveThread: 'Sair da conversa',
        copyOnyxData: 'Copiar dados do Onyx',
        flagAsOffensive: 'Marcar como ofensivo',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Adicionar reação',
        reactedWith: 'reagiu com',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `Você perdeu a festa em <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, não há nada para ver aqui.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `Este chat é com todos os membros da Expensify no domínio <strong>${domainRoom}</strong>. Use-o para conversar com colegas, compartilhar dicas e fazer perguntas.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `Este chat é com o administrador de <strong>${workspaceName}</strong>. Use-o para conversar sobre a configuração do espaço de trabalho e muito mais.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `Este chat é com todos em <strong>${workspaceName}</strong>. Use-o para os anúncios mais importantes.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `Esta sala de chat é para qualquer coisa relacionada a <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `Este chat é para faturas entre <strong>${invoicePayer}</strong> e <strong>${invoiceReceiver}</strong>. Use o botão + para enviar uma fatura.`,
        beginningOfChatHistory: (users: string) => `Este chat é com ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `É aqui que <strong>${submitterDisplayName}</strong> enviará despesas para <strong>${workspaceName}</strong>. Basta usar o botão +.`,
        beginningOfChatHistorySelfDM: 'Este é o seu espaço pessoal. Use-o para anotações, tarefas, rascunhos e lembretes.',
        beginningOfChatHistorySystemDM: 'Bem-vindo(a)! Vamos configurar tudo para você.',
        chatWithAccountManager: 'Converse com o seu gerente de conta aqui',
        askMeAnything: 'Pergunte-me qualquer coisa!',
        sayHello: 'Diga olá!',
        yourSpace: 'Seu espaço',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Bem-vindo(a) a ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Use o botão + para ${additionalText} uma despesa.`,
        askConcierge: 'Faça perguntas e receba suporte em tempo real 24/7.',
        conciergeSupport: 'Suporte 24 horas por dia, 7 dias por semana',
        create: 'Criar',
        iouTypes: {
            pay: 'pagar',
            split: 'Dividir',
            submit: 'Enviar',
            track: 'acompanhar',
            invoice: 'fatura',
        },
    },
    adminOnlyCanPost: 'Somente administradores podem enviar mensagens nesta sala.',
    reportAction: {
        asCopilot: 'como copiloto para',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `criou este relatório para agrupar todas as despesas de <a href="${reportUrl}">${reportName}</a> que não puderam ser enviadas na frequência que você escolheu`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName}: CreatedReportForUnapprovedTransactionsParams) =>
            `criou este relatório para quaisquer despesas retidas de <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: 'Notificar todos nesta conversa',
    },
    newMessages: 'Novas mensagens',
    latestMessages: 'Mensagens mais recentes',
    youHaveBeenBanned: 'Observação: Você foi banido de conversar neste canal.',
    reportTypingIndicator: {
        isTyping: 'está digitando...',
        areTyping: 'estão digitando...',
        multipleMembers: 'Vários membros',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Esta sala de chat foi arquivada.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Este chat não está mais ativo porque ${displayName} encerrou a conta.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Este chat não está mais ativo porque ${oldDisplayName} mesclou a conta com ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Este chat não está mais ativo porque <strong>você</strong> não é mais um membro do workspace ${policyName}.`
                : `Este chat não está mais ativo porque ${displayName} não é mais membro do workspace ${policyName}.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Este chat não está mais ativo porque ${policyName} não é mais um workspace ativo.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Este chat não está mais ativo porque ${policyName} não é mais um workspace ativo.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Esta reserva está arquivada.',
    },
    writeCapabilityPage: {
        label: 'Quem pode postar',
        writeCapability: {
            all: 'Todos os membros',
            admins: 'Apenas administradores',
        },
    },
    sidebarScreen: {
        buttonFind: 'Encontre algo...',
        buttonMySettings: 'Minhas configurações',
        fabNewChat: 'Iniciar chat',
        fabNewChatExplained: 'Abrir menu de ações',
        fabScanReceiptExplained: 'Digitalizar recibo (Ação flutuante)',
        chatPinned: 'Conversa fixada',
        draftedMessage: 'Mensagem rascunhada',
        listOfChatMessages: 'Lista de mensagens de chat',
        listOfChats: 'Lista de conversas',
        saveTheWorld: 'Salvar o mundo',
        tooltip: 'Comece aqui!',
        redirectToExpensifyClassicModal: {
            title: 'Em breve',
            description: 'Estamos ajustando mais alguns detalhes do New Expensify para acomodar sua configuração específica. Enquanto isso, acesse o Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Assinatura',
        domains: 'Domínios',
    },
    tabSelector: {chat: 'Chat', room: 'Sala', distance: 'Distância', manual: 'Manual', scan: 'Escanear', map: 'Mapa', gps: 'GPS', odometer: 'Odômetro'},
    spreadsheet: {
        upload: 'Enviar uma planilha',
        import: 'Importar planilha',
        dragAndDrop: '<muted-link>Arraste e solte sua planilha aqui ou escolha um arquivo abaixo. Formatos compatíveis: .csv, .txt, .xls e .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Arraste e solte sua planilha aqui ou escolha um arquivo abaixo. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Saiba mais</a> sobre os formatos de arquivo compatíveis.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Selecione um arquivo de planilha para importar. Formatos compatíveis: .csv, .txt, .xls e .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Selecione um arquivo de planilha para importar. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Saiba mais</a> sobre os formatos de arquivo compatíveis.</muted-link>`,
        fileContainsHeader: 'Arquivo contém cabeçalhos de coluna',
        column: (name: string) => `Coluna ${name}`,
        fieldNotMapped: (fieldName: string) => `Ops! Um campo obrigatório ("${fieldName}") não foi mapeado. Revise e tente novamente.`,
        singleFieldMultipleColumns: (fieldName: string) => `Opa! Você associou um único campo ("${fieldName}") a várias colunas. Revise e tente novamente.`,
        emptyMappedField: (fieldName: string) => `Opa! O campo ("${fieldName}") contém um ou mais valores vazios. Verifique e tente novamente.`,
        importSuccessfulTitle: 'Importação bem-sucedida',
        importCategoriesSuccessfulDescription: ({categories}: {categories: number}) => (categories > 1 ? `${categories} categorias foram adicionadas.` : '1 categoria foi adicionada.'),
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return 'Nenhum membro foi adicionado ou atualizado.';
            }
            if (added && updated) {
                return `${added} membro${added > 1 ? 's' : ''} adicionado, ${updated} membro${updated > 1 ? 's' : ''} atualizado.`;
            }
            if (updated) {
                return updated > 1 ? `${updated} membros foram atualizados.` : '1 membro foi atualizado.';
            }
            return added > 1 ? `${added} membros foram adicionados.` : '1 membro foi adicionado.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `${tags} tags foram adicionadas.` : '1 tag foi adicionada.'),
        importMultiLevelTagsSuccessfulDescription: 'Tags em vários níveis foram adicionadas.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `Foram adicionadas taxas diárias de ${rates}.` : '1 taxa de diária foi adicionada.'),
        importFailedTitle: 'Falha na importação',
        importFailedDescription: 'Verifique se todos os campos foram preenchidos corretamente e tente novamente. Se o problema persistir, entre em contato com a Concierge.',
        importDescription: 'Escolha quais campos mapear da sua planilha clicando no menu suspenso ao lado de cada coluna importada abaixo.',
        sizeNotMet: 'O tamanho do arquivo deve ser maior que 0 bytes',
        invalidFileMessage:
            'O arquivo que você enviou está vazio ou contém dados inválidos. Verifique se o arquivo está corretamente formatado e contém as informações necessárias antes de enviá-lo novamente.',
        importSpreadsheetLibraryError: 'Falha ao carregar o módulo de planilha. Verifique sua conexão com a internet e tente novamente.',
        importSpreadsheet: 'Importar planilha',
        downloadCSV: 'Baixar CSV',
        importMemberConfirmation: () => ({
            one: `Confirme os detalhes abaixo para um novo membro do workspace que será adicionado como parte deste upload. Os membros existentes não receberão nenhuma atualização de função nem mensagens de convite.`,
            other: (count: number) =>
                `Confirme os detalhes abaixo para os ${count} novos membros do workspace que serão adicionados como parte deste upload. Membros existentes não receberão nenhuma atualização de função nem mensagens de convite.`,
        }),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `${transactions} transações foram importadas.` : '1 transação foi importada.',
    },
    receipt: {
        upload: 'Enviar recibo',
        uploadMultiple: 'Enviar recibos',
        desktopSubtitleSingle: `ou arraste e solte aqui`,
        desktopSubtitleMultiple: `ou arraste e solte-os aqui`,
        alternativeMethodsTitle: 'Outras formas de adicionar recibos:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">Baixe o app</a> para escanear do seu celular</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Encaminhe recibos para <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Adicione seu número</a> para enviar recibos por SMS para ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Envie recibos por texto para ${phoneNumber} (apenas números dos EUA)</label-text>`,
        takePhoto: 'Tirar uma foto',
        cameraAccess: 'O acesso à câmera é necessário para tirar fotos dos recibos.',
        deniedCameraAccess: `O acesso à câmera ainda não foi concedido, siga por favor <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">estas instruções</a>.`,
        cameraErrorTitle: 'Erro da câmera',
        cameraErrorMessage: 'Ocorreu um erro ao tirar a foto. Tente novamente.',
        locationAccessTitle: 'Permitir acesso à localização',
        locationAccessMessage: 'O acesso à localização nos ajuda a manter seu fuso horário e sua moeda precisos, onde quer que você vá.',
        locationErrorTitle: 'Permitir acesso à localização',
        locationErrorMessage: 'O acesso à localização nos ajuda a manter seu fuso horário e sua moeda precisos, onde quer que você vá.',
        allowLocationFromSetting: `O acesso à localização nos ajuda a manter seu fuso horário e sua moeda precisos onde quer que você vá. Permita o acesso à localização nas configurações de permissão do seu dispositivo.`,
        dropTitle: 'Deixe pra lá',
        dropMessage: 'Solte seu arquivo aqui',
        flash: 'flash',
        multiScan: 'Multidigitalização',
        shutter: 'obturador',
        gallery: 'galeria',
        deleteReceipt: 'Excluir recibo',
        deleteConfirmation: 'Tem certeza de que deseja excluir este recibo?',
        addReceipt: 'Adicionar recibo',
        scanFailed: 'O recibo não pôde ser escaneado, pois está faltando o comerciante, a data ou o valor.',
        addAReceipt: {
            phrase1: 'Adicionar um recibo',
            phrase2: 'ou arraste e solte um aqui',
        },
    },
    quickAction: {
        scanReceipt: 'Escanear recibo',
        recordDistance: 'Rastrear distância',
        requestMoney: 'Criar despesa',
        perDiem: 'Criar diária',
        splitBill: 'Dividir despesa',
        splitScan: 'Dividir recibo',
        splitDistance: 'Dividir distância',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Pagar ${name ?? 'alguém'}`,
        assignTask: 'Atribuir tarefa',
        header: 'Ação rápida',
        noLongerHaveReportAccess: 'Você não tem mais acesso ao seu destino de ação rápida anterior. Selecione um novo abaixo.',
        updateDestination: 'Atualizar destino',
        createReport: 'Criar relatório',
    },
    iou: {
        amount: 'Valor',
        percent: 'Porcentagem',
        taxAmount: 'Valor do imposto',
        taxRate: 'Alíquota de imposto',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `Aprovar ${formattedAmount}` : 'Aprovar'),
        approved: 'Aprovado',
        cash: 'Dinheiro',
        card: 'Cartão',
        original: 'Original',
        split: 'Dividir',
        splitExpense: 'Dividir despesa',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} de ${merchant}`,
        splitByPercentage: 'Dividir por porcentagem',
        addSplit: 'Adicionar divisão',
        makeSplitsEven: 'Dividir igualmente',
        editSplits: 'Editar divisões',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `O valor total é ${amount} maior do que a despesa original.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `O valor total é ${amount} menor que a despesa original.`,
        splitExpenseZeroAmount: 'Insira um valor válido antes de continuar.',
        splitExpenseOneMoreSplit: 'Nenhuma divisão adicionada. Adicione pelo menos uma para salvar.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Editar ${amount} para ${merchant}`,
        removeSplit: 'Remover divisão',
        splitExpenseCannotBeEditedModalTitle: 'Esta despesa não pode ser editada',
        splitExpenseCannotBeEditedModalDescription: 'Despesas aprovadas ou pagas não podem ser editadas',
        splitExpenseDistanceErrorModalDescription: 'Corrija o erro da taxa de distância e tente novamente.',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Pagar ${name ?? 'alguém'}`,
        expense: 'Despesa',
        categorize: 'Categorizar',
        share: 'Compartilhar',
        participants: 'Participantes',
        createExpense: 'Criar despesa',
        trackDistance: 'Rastrear distância',
        createExpenses: (expensesNumber: number) => `Criar ${expensesNumber} despesas`,
        removeExpense: 'Remover despesa',
        removeThisExpense: 'Remover esta despesa',
        removeExpenseConfirmation: 'Tem certeza de que deseja remover este recibo? Esta ação não poderá ser desfeita.',
        addExpense: 'Adicionar despesa',
        chooseRecipient: 'Escolher destinatário',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Criar despesa de ${amount}`,
        confirmDetails: 'Confirmar detalhes',
        pay: 'Pagar',
        cancelPayment: 'Cancelar pagamento',
        cancelPaymentConfirmation: 'Tem certeza de que deseja cancelar este pagamento?',
        viewDetails: 'Ver detalhes',
        pending: 'Pendente',
        canceled: 'Cancelado',
        posted: 'Lançado',
        deleteReceipt: 'Excluir recibo',
        findExpense: 'Encontrar despesa',
        deletedTransaction: (amount: string, merchant: string) => `excluiu uma despesa (${amount} para ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `moveu uma despesa${reportName ? `de ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `moveu esta despesa${reportName ? `para <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `moveu esta despesa${reportName ? `de <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `moveu esta despesa para o seu <a href="${reportUrl}">espaço pessoal</a>`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `moveu este relatório para o workspace <a href="${newParentReportUrl}">${toPolicyName}</a>`;
            }
            return `moveu este <a href="${movedReportUrl}">relatório</a> para o workspace <a href="${newParentReportUrl}">${toPolicyName}</a>`;
        },
        pendingMatchWithCreditCard: 'Recibo aguardando correspondência com transação do cartão',
        pendingMatch: 'Correspondência pendente',
        pendingMatchWithCreditCardDescription: 'Recibo aguardando correspondência com transação do cartão. Marque como dinheiro para cancelar.',
        markAsCash: 'Marcar como dinheiro',
        routePending: 'Rota pendente...',
        receiptScanning: () => ({
            one: 'Escaneando recibo...',
            other: 'Escaneando recibos...',
        }),
        scanMultipleReceipts: 'Escanear vários recibos',
        scanMultipleReceiptsDescription: 'Tire fotos de todos os seus recibos de uma vez, depois confirme os detalhes você mesmo ou nós faremos isso por você.',
        receiptScanInProgress: 'Digitalização de recibo em andamento',
        receiptScanInProgressDescription: 'Digitalização do recibo em andamento. Volte mais tarde ou insira os detalhes agora.',
        removeFromReport: 'Remover do relatório',
        moveToPersonalSpace: 'Mover despesas para seu espaço pessoal',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Possíveis despesas duplicadas identificadas. Revise as duplicatas para permitir o envio.'
                : 'Despesas potencialmente duplicadas identificadas. Revise as duplicatas para permitir a aprovação.',
        receiptIssuesFound: () => ({
            one: 'Problema encontrado',
            other: 'Problemas encontrados',
        }),
        fieldPending: 'Pendente...',
        defaultRate: 'Taxa padrão',
        receiptMissingDetails: 'Recibo com detalhes faltando',
        missingAmount: 'Valor ausente',
        missingMerchant: 'Comerciante ausente',
        receiptStatusTitle: 'Escaneando…',
        receiptStatusText: 'Só você pode ver este recibo enquanto ele está sendo digitalizado. Volte mais tarde ou insira os detalhes agora.',
        receiptScanningFailed: 'Falha ao digitalizar o recibo. Insira os detalhes manualmente.',
        transactionPendingDescription: 'Transação pendente. Pode levar alguns dias para ser lançada.',
        companyInfo: 'Informações da empresa',
        companyInfoDescription: 'Precisamos de mais alguns detalhes antes que você possa enviar sua primeira fatura.',
        yourCompanyName: 'Nome da sua empresa',
        yourCompanyWebsite: 'Site da sua empresa',
        yourCompanyWebsiteNote: 'Se você não tiver um site, pode fornecer o LinkedIn da sua empresa ou o perfil em redes sociais.',
        invalidDomainError: 'Você inseriu um domínio inválido. Para continuar, insira um domínio válido.',
        publicDomainError: 'Você inseriu um domínio público. Para continuar, insira um domínio privado.',
        expenseCount: () => {
            return {
                one: '1 despesa',
                other: (count: number) => `${count} despesas`,
            };
        },
        deleteExpense: () => ({
            one: 'Excluir despesa',
            other: 'Excluir despesas',
        }),
        deleteConfirmation: () => ({
            one: 'Você tem certeza de que deseja excluir esta despesa?',
            other: 'Tem certeza de que deseja excluir estas despesas?',
        }),
        deleteReport: 'Excluir relatório',
        deleteReportConfirmation: 'Tem certeza de que deseja excluir este relatório?',
        settledExpensify: 'Pago',
        done: 'Concluído',
        settledElsewhere: 'Pago em outro lugar',
        individual: 'Individual',
        business: 'Negócios',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pagar ${formattedAmount} com o Expensify` : `Pagar com Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pagar ${formattedAmount} como pessoa física` : `Pagar com conta pessoal`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pagar ${formattedAmount} com carteira` : `Pagar com carteira`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Pagar ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pagar ${formattedAmount} como empresa` : `Pagar com conta empresarial`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Marcar ${formattedAmount} como pago` : `Marcar como pago`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `pagou ${amount} com a conta pessoal ${last4Digits}` : `Pago com conta pessoal`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `pagou ${amount} com a conta empresarial ${last4Digits}` : `Pago com conta empresarial`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `Pagar ${formattedAmount} via ${policyName}` : `Pagar via ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `pagou ${amount} com a conta bancária ${last4Digits}` : `pago com conta bancária ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `pagou ${amount ? `${amount} ` : ''} com a conta bancária ${last4Digits} via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regras do workspace</a>`,
        invoicePersonalBank: (lastFour: string) => `Conta pessoal • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Conta empresarial • ${lastFour}`,
        nextStep: 'Próximas etapas',
        finished: 'Concluído',
        flip: 'Virar',
        sendInvoice: ({amount}: RequestAmountParams) => `Enviar fatura de ${amount}`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `para ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `enviado${memo ? `, dizendo ${memo}` : ''}`,
        automaticallySubmitted: `enviado via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">atrasar envios</a>`,
        queuedToSubmitViaDEW: 'enfileirado para envio via fluxo de aprovação personalizado',
        queuedToApproveViaDEW: 'enfileirado para aprovação via fluxo de aprovação personalizado',
        trackedAmount: (formattedAmount: string, comment?: string) => `rastreamento de ${formattedAmount}${comment ? `para ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `dividir ${amount}`,
        didSplitAmount: (formattedAmount: string, comment: string) => `dividir ${formattedAmount}${comment ? `para ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Sua parte ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} deve ${amount}${comment ? `para ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} deve:`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}pagou ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} pagou:`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} gastou ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} gastou:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} aprovou:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} aprovou ${amount}`,
        payerSettled: (amount: number | string) => `pago ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `pagou ${amount}. Adicione uma conta bancária para receber seu pagamento.`,
        automaticallyApproved: `aprovado via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regras do workspace</a>`,
        approvedAmount: (amount: number | string) => `${amount} aprovado`,
        approvedMessage: `aprovado`,
        unapproved: `não aprovado`,
        automaticallyForwarded: `aprovado via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regras do workspace</a>`,
        forwarded: `aprovado`,
        rejectedThisReport: 'rejeitou este relatório',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `iniciou o pagamento, mas está aguardando ${submitterDisplayName} adicionar uma conta bancária.`,
        adminCanceledRequest: 'cancelou o pagamento',
        canceledRequest: (amount: string, submitterDisplayName: string) => `cancelou o pagamento de ${amount}, porque ${submitterDisplayName} não ativou sua Expensify Wallet em 30 dias`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} adicionou uma conta bancária. O pagamento de ${amount} foi realizado.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}marcado como pago${comment ? `, dizendo "${comment}"` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}pagou com carteira`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}pago com Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regras do workspace</a>`,
        noReimbursableExpenses: 'Este relatório tem um valor inválido',
        pendingConversionMessage: 'O total será atualizado quando você voltar a ficar online',
        changedTheExpense: 'alterou a despesa',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `o ${valueName} para ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `definir ${translatedChangedField} como ${newMerchant}, o que definiu o valor como ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `o ${valueName} (anteriormente ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `${valueName} para ${newValueToDisplay} (anteriormente ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `alterou ${translatedChangedField} para ${newMerchant} (antes ${oldMerchant}), o que atualizou o valor para ${newAmountToDisplay} (antes ${oldAmountToDisplay})`,
        basedOnAI: 'com base em atividades anteriores',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `com base nas <a href="${rulesLink}">regras do workspace</a>` : 'com base na regra do workspace'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `para ${comment}` : 'despesa'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Relatório de Fatura nº ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} enviado${comment ? `para ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `despesa movida do espaço pessoal para ${workspaceName ?? `conversar com ${reportName}`}`,
        movedToPersonalSpace: 'despesa movida para o espaço pessoal',
        error: {
            invalidCategoryLength: 'O nome da categoria excede 255 caracteres. Reduza-o ou escolha uma categoria diferente.',
            invalidTagLength: 'O nome da tag excede 255 caracteres. Reduza-o ou escolha uma tag diferente.',
            invalidAmount: 'Insira um valor válido antes de continuar',
            invalidDistance: 'Insira uma distância válida antes de continuar',
            invalidIntegerAmount: 'Insira um valor em dólares inteiros antes de continuar',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `O valor máximo de imposto é ${amount}`,
            invalidSplit: 'A soma das divisões deve ser igual ao valor total',
            invalidSplitParticipants: 'Insira um valor maior que zero para pelo menos dois participantes',
            invalidSplitYourself: 'Insira um valor diferente de zero para sua divisão',
            noParticipantSelected: 'Selecione um participante',
            other: 'Erro inesperado. Tente novamente mais tarde.',
            genericCreateFailureMessage: 'Erro inesperado ao enviar esta despesa. Tente novamente mais tarde.',
            genericCreateInvoiceFailureMessage: 'Erro inesperado ao enviar esta fatura. Tente novamente mais tarde.',
            genericHoldExpenseFailureMessage: 'Erro inesperado ao reter esta despesa. Tente novamente mais tarde.',
            genericUnholdExpenseFailureMessage: 'Erro inesperado ao tirar esta despesa de espera. Tente novamente mais tarde.',
            receiptDeleteFailureError: 'Erro inesperado ao excluir este recibo. Tente novamente mais tarde.',
            receiptFailureMessage: '<rbr>Ocorreu um erro ao enviar o seu recibo. Por favor, <a href="download">salve o recibo</a> e <a href="retry">tente novamente</a> mais tarde.</rbr>',
            receiptFailureMessageShort: 'Ocorreu um erro ao fazer upload do seu recibo.',
            genericDeleteFailureMessage: 'Erro inesperado ao excluir esta despesa. Tente novamente mais tarde.',
            genericEditFailureMessage: 'Erro inesperado ao editar esta despesa. Tente novamente mais tarde.',
            genericSmartscanFailureMessage: 'A transação está com campos ausentes',
            duplicateWaypointsErrorMessage: 'Remova pontos de passagem duplicados',
            atLeastTwoDifferentWaypoints: 'Insira pelo menos dois endereços diferentes',
            splitExpenseMultipleParticipantsErrorMessage: 'Uma despesa não pode ser dividida entre um workspace e outros membros. Atualize sua seleção.',
            invalidMerchant: 'Insira um comerciante válido',
            atLeastOneAttendee: 'Pelo menos um participante deve ser selecionado',
            invalidQuantity: 'Insira uma quantidade válida',
            quantityGreaterThanZero: 'A quantidade deve ser maior que zero',
            invalidSubrateLength: 'Deve haver pelo menos uma subtarifa',
            invalidRate: 'Taxa inválida para este workspace. Selecione uma taxa disponível do workspace.',
            endDateBeforeStartDate: 'A data de término não pode ser anterior à data de início',
            endDateSameAsStartDate: 'A data de término não pode ser igual à data de início',
            manySplitsProvided: `O número máximo de divisões permitidas é ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `O intervalo de datas não pode exceder ${CONST.IOU.SPLITS_LIMIT} dias.`,
            invalidReadings: 'Insira as leituras de início e fim',
            negativeDistanceNotAllowed: 'A leitura final deve ser maior que a leitura inicial',
        },
        dismissReceiptError: 'Dispensar erro',
        dismissReceiptErrorConfirmation: 'Atenção! Ignorar este erro removerá completamente o seu recibo enviado. Tem certeza?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `começou o acerto de contas. O pagamento está em espera até que ${submitterDisplayName} ative a carteira.`,
        enableWallet: 'Ativar carteira',
        hold: 'Reter',
        unhold: 'Remover retenção',
        holdExpense: () => ({
            one: 'Reter despesa',
            other: 'Reter despesas',
        }),
        unholdExpense: 'Liberar despesa',
        heldExpense: 'reteveio esta despesa',
        unheldExpense: 'desbloqueou esta despesa',
        moveUnreportedExpense: 'Mover despesa não reportada',
        addUnreportedExpense: 'Adicionar despesa não reportada',
        selectUnreportedExpense: 'Selecione pelo menos uma despesa para adicionar ao relatório.',
        emptyStateUnreportedExpenseTitle: 'Nenhuma despesa não reportada',
        emptyStateUnreportedExpenseSubtitle: 'Parece que você não tem nenhuma despesa não reportada. Tente criar uma abaixo.',
        addUnreportedExpenseConfirm: 'Adicionar ao relatório',
        newReport: 'Novo relatório',
        explainHold: () => ({
            one: 'Explique por que você está retendo esta despesa.',
            other: 'Explique por que você está retendo essas despesas.',
        }),
        retracted: 'Retirado',
        retract: 'Revogar',
        reopened: 'reaberto',
        reopenReport: 'Reabrir relatório',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Este relatório já foi exportado para ${connectionName}. Alterá-lo pode causar discrepâncias nos dados. Tem certeza de que deseja reabrir este relatório?`,
        reason: 'Motivo',
        holdReasonRequired: 'É necessário informar um motivo ao reter.',
        expenseWasPutOnHold: 'Despesa foi colocada em espera',
        expenseOnHold: 'Esta despesa foi colocada em espera. Revise os comentários para saber os próximos passos.',
        expensesOnHold: 'Todas as despesas foram colocadas em espera. Revise os comentários para saber os próximos passos.',
        expenseDuplicate: 'Esta despesa tem detalhes semelhantes aos de outra. Revise os duplicados para continuar.',
        someDuplicatesArePaid: 'Alguns desses duplicados já foram aprovados ou pagos.',
        reviewDuplicates: 'Revisar duplicados',
        keepAll: 'Manter tudo',
        confirmApprove: 'Confirmar valor de aprovação',
        confirmApprovalAmount: 'Aprove apenas as despesas em conformidade ou aprove o relatório inteiro.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Essa despesa está em espera. Deseja aprovar mesmo assim?',
            other: 'Estas despesas estão em espera. Deseja aprovar mesmo assim?',
        }),
        confirmPay: 'Confirmar valor do pagamento',
        confirmPayAmount: 'Pague o que não está em espera ou pague o relatório inteiro.',
        confirmPayAllHoldAmount: () => ({
            one: 'Esta despesa está em espera. Você quer pagar mesmo assim?',
            other: 'Essas despesas estão em espera. Deseja pagar mesmo assim?',
        }),
        payOnly: 'Pagar somente',
        approveOnly: 'Aprovar apenas',
        holdEducationalTitle: 'Você deve reter esta despesa?',
        whatIsHoldExplain: 'Colocar em espera é como apertar “pausar” em uma despesa até que você esteja pronto para enviá-la.',
        holdIsLeftBehind: 'Despesas retidas são deixadas de fora mesmo que você envie um relatório inteiro.',
        unholdWhenReady: 'Retome as despesas quando estiver pronto para enviá-las.',
        changePolicyEducational: {
            title: 'Você moveu este relatório!',
            description: 'Verifique novamente estes itens, que tendem a mudar ao mover relatórios para um novo workspace.',
            reCategorize: '<strong>Recategorize todas as despesas</strong> para cumprir as regras do workspace.',
            workflows: 'Este relatório agora pode estar sujeito a um <strong>fluxo de aprovação</strong> diferente.',
        },
        changeWorkspace: 'Mudar espaço de trabalho',
        set: 'definir',
        changed: 'alterado',
        removed: 'Removido',
        transactionPending: 'Transação pendente.',
        chooseARate: 'Selecione uma taxa de reembolso do workspace por milha ou quilômetro',
        unapprove: 'Desaprovar',
        unapproveReport: 'Desaprovar relatório',
        headsUp: 'Atenção!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Este relatório já foi exportado para ${accountingIntegration}. Alterá-lo pode causar inconsistências nos dados. Tem certeza de que deseja desaprovar este relatório?`,
        reimbursable: 'reembolsável',
        nonReimbursable: 'não reembolsável',
        bookingPending: 'Esta reserva está pendente',
        bookingPendingDescription: 'Esta reserva está pendente porque ainda não foi paga.',
        bookingArchived: 'Esta reserva está arquivada',
        bookingArchivedDescription: 'Esta reserva está arquivada porque a data da viagem já passou. Adicione uma despesa com o valor final, se necessário.',
        attendees: 'Participantes',
        whoIsYourAccountant: 'Quem é o seu contador?',
        paymentComplete: 'Pagamento concluído',
        time: 'Hora',
        startDate: 'Data de início',
        endDate: 'Data de término',
        startTime: 'Hora de início',
        endTime: 'Hora de término',
        deleteSubrate: 'Excluir subcategoria',
        deleteSubrateConfirmation: 'Você tem certeza de que deseja excluir esta subtarifa?',
        quantity: 'Quantidade',
        subrateSelection: 'Selecione uma subtarifa e insira uma quantidade.',
        qty: 'Qtd',
        firstDayText: () => ({
            one: `Primeiro dia: 1 hora`,
            other: (count: number) => `Primeiro dia: ${count.toFixed(2)} horas`,
        }),
        lastDayText: () => ({
            one: `Último dia: 1 hora`,
            other: (count: number) => `Último dia: ${count.toFixed(2)} horas`,
        }),
        tripLengthText: () => ({
            one: `Viagem: 1 dia inteiro`,
            other: (count: number) => `Viagem: ${count} dias completos`,
        }),
        dates: 'Datas',
        rates: 'Taxas',
        submitsTo: ({name}: SubmitsToParams) => `Envia para ${name}`,
        reject: {
            educationalTitle: 'Você deve manter ou rejeitar?',
            educationalText: 'Se você não estiver pronto para aprovar ou pagar uma despesa, poderá colocá-la em espera ou rejeitá-la.',
            holdExpenseTitle: 'Segure uma despesa para pedir mais detalhes antes da aprovação ou pagamento.',
            approveExpenseTitle: 'Aprove outras despesas enquanto as despesas retidas permanecem atribuídas a você.',
            heldExpenseLeftBehindTitle: 'As despesas retidas são deixadas para trás quando você aprova um relatório inteiro.',
            rejectExpenseTitle: 'Rejeite uma despesa que você não pretende aprovar ou pagar.',
            reasonPageTitle: 'Rejeitar despesa',
            reasonPageDescription: 'Explique por que você está rejeitando esta despesa.',
            rejectReason: 'Motivo da rejeição',
            markAsResolved: 'Marcar como resolvido',
            rejectedStatus: 'Esta despesa foi rejeitada. Aguardando você corrigir os problemas e marcar como resolvida para permitir o envio.',
            reportActions: {
                rejectedExpense: 'rejeitou esta despesa',
                markedAsResolved: 'marcou o motivo da rejeição como resolvido',
            },
        },
        moveExpenses: () => ({one: 'Mover despesa', other: 'Mover despesas'}),
        moveExpensesError: 'Você não pode mover despesas de diária para relatórios em outros espaços de trabalho, porque as taxas de diária podem diferir entre espaços de trabalho.',
        changeApprover: {
            title: 'Alterar aprovador',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Escolha uma opção para alterar o aprovador deste relatório. (Atualize suas <a href="${workflowSettingLink}">configurações de espaço de trabalho</a> para alterar permanentemente o aprovador para todos os relatórios.)`,
            changedApproverMessage: (managerID: number) => `alterou o aprovador para <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Adicionar aprovador',
                addApproverSubtitle: 'Adicione um aprovador adicional ao fluxo de aprovação existente.',
                bypassApprovers: 'Ignorar aprovadores',
                bypassApproversSubtitle: 'Atribuir a si mesmo como aprovador final e pular quaisquer aprovadores restantes.',
            },
            addApprover: {
                subtitle: 'Escolha um aprovador adicional para este relatório antes de o encaminharmos pelo restante do fluxo de aprovação.',
            },
        },
        chooseWorkspace: 'Escolha um workspace',
        date: 'Data',
        splitDates: 'Dividir datas',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate} a ${endDate} (${count} dias)`,
        splitByDate: 'Dividir por data',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `relatório encaminhado para ${to} devido ao fluxo de trabalho de aprovação personalizado`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'hora' : 'horas'} @ ${rate} / hora`,
            hrs: 'h',
            hours: 'Horas',
            ratePreview: (rate: string) => `${rate} / hora`,
            amountTooLargeError: 'O valor total é muito alto. Reduza as horas ou diminua a tarifa.',
        },
        correctDistanceRateError: 'Corrija o erro na taxa de distância e tente novamente.',
        AskToExplain: `. <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}"><strong>Explicar</strong></a> &#x2728;`,
        policyRulesModifiedFields: (policyRulesModifiedFields: PolicyRulesModifiedFields, policyRulesRoute: string, formatList: (list: string[]) => string) => {
            const entries = ObjectUtils.typedEntries(policyRulesModifiedFields);
            const fragments = entries.map(([key, value], i) => {
                const isFirst = i === 0;
                if (key === 'reimbursable') {
                    return value ? 'marcou a despesa como "reembolsável"' : 'marcou a despesa como “não reembolsável”';
                }
                if (key === 'billable') {
                    return value ? 'marcou a despesa como “faturável”' : 'marcou a despesa como "não faturável"';
                }
                if (key === 'tax') {
                    const taxEntry = value as PolicyRulesModifiedFields['tax'];
                    const taxRateName = taxEntry?.field_id_TAX.name ?? '';
                    if (isFirst) {
                        return `definir a taxa de imposto como "${taxRateName}"`;
                    }
                    return `alíquota de imposto para "${taxRateName}"`;
                }
                const updatedValue = value as string | boolean;
                if (isFirst) {
                    return `defina o ${translations.common[key].toLowerCase()} como "${updatedValue}"`;
                }
                return `${translations.common[key].toLowerCase()} para "${updatedValue}"`;
            });
            return `${formatList(fragments)} via <a href="${policyRulesRoute}">regras do workspace</a>`;
        },
    },
    transactionMerge: {
        listPage: {
            header: 'Mesclar despesas',
            noEligibleExpenseFound: 'Nenhuma despesa qualificada encontrada',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Você não tem nenhuma despesa que possa ser mesclada com esta. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Saiba mais</a> sobre despesas elegíveis.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Selecione uma <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">despesa elegível</a> para mesclar com <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: 'Selecionar recibo',
            pageTitle: 'Selecione o recibo que você deseja manter:',
        },
        detailsPage: {
            header: 'Selecionar detalhes',
            pageTitle: 'Selecione os detalhes que você quer manter:',
            noDifferences: 'Nenhuma diferença encontrada entre as transações',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? 'um' : 'a';
                return `Selecione ${article} ${field}`;
            },
            pleaseSelectAttendees: 'Selecione os participantes',
            selectAllDetailsError: 'Selecione todos os detalhes antes de continuar.',
        },
        confirmationPage: {
            header: 'Confirmar detalhes',
            pageTitle: 'Confirme os dados que você vai manter. Os dados que você não mantiver serão excluídos.',
            confirmButton: 'Mesclar despesas',
        },
    },
    share: {
        shareToExpensify: 'Compartilhar com Expensify',
        messageInputLabel: 'Mensagem',
    },
    notificationPreferencesPage: {
        header: 'Preferências de notificação',
        label: 'Notificar-me sobre novas mensagens',
        notificationPreferences: {
            always: 'Imediatamente',
            daily: 'Diário',
            mute: 'Silenciar',
            // @context UI label indicating that something is concealed or not visible to the user.
            hidden: 'Oculto',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'O número não foi validado. Clique no botão para reenviar o link de validação por mensagem de texto.',
        emailHasNotBeenValidated: 'O e-mail não foi validado. Clique no botão para reenviar o link de validação por mensagem de texto.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Enviar foto',
        removePhoto: 'Remover foto',
        editImage: 'Editar foto',
        viewPhoto: 'Ver foto',
        imageUploadFailed: 'Falha no envio da imagem',
        deleteWorkspaceError: 'Desculpe, houve um problema inesperado ao excluir o avatar do seu workspace',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `A imagem selecionada excede o tamanho máximo de upload de ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Envie uma imagem maior que ${minHeightInPx}x${minWidthInPx} pixels e menor que ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `A foto de perfil deve ser um dos seguintes tipos: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: 'Editar foto de perfil',
        upload: 'Enviar',
        uploadPhoto: 'Enviar foto',
        selectAvatar: 'Selecionar avatar',
        choosePresetAvatar: 'Ou escolha um avatar personalizado',
    },
    modal: {
        backdropLabel: 'Plano de Fundo do Modal',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Aguardando que <strong>você</strong> adicione despesas.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Aguardando <strong>${actor}</strong> adicionar despesas.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Aguardando um administrador adicionar despesas.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Aguardando que <strong>você</strong> envie as despesas.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Aguardando <strong>${actor}</strong> enviar despesas.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Aguardando um administrador enviar despesas.`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Nenhuma ação adicional necessária!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Aguardando <strong>você</strong> adicionar uma conta bancária.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Aguardando <strong>${actor}</strong> adicionar uma conta bancária.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Aguardando um administrador adicionar uma conta bancária.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: ({actor, actorType, eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `em ${eta}` : ` ${eta}`;
                }
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando <strong>suas</strong> despesas serem enviadas automaticamente${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Aguardando as despesas de <strong>${actor}</strong> serem enviadas automaticamente${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Aguardando as despesas de um administrador serem enviadas automaticamente${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Aguardando <strong>você</strong> resolver os problemas.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Aguardando <strong>${actor}</strong> corrigir os problemas.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Aguardando um administrador corrigir os problemas.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Aguardando <strong>você</strong> aprovar despesas.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Aguardando <strong>${actor}</strong> aprovar as despesas.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Aguardando um administrador aprovar as despesas.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Aguardando <strong>você</strong> exportar este relatório.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Aguardando <strong>${actor}</strong> exportar este relatório.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Aguardando um administrador exportar este relatório.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Aguardando que <strong>você</strong> pague as despesas.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Aguardando <strong>${actor}</strong> pagar as despesas.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Aguardando um administrador pagar as despesas.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Aguardando que <strong>você</strong> finalize a configuração de uma conta bancária empresarial.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Aguardando <strong>${actor}</strong> concluir a configuração de uma conta bancária empresarial.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Aguardando um administrador concluir a configuração de uma conta bancária empresarial.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `até ${eta}` : ` ${eta}`;
                }
                return `Aguardando a conclusão do pagamento${formattedETA}.`;
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_: NextStepParams) =>
                `Ops! Parece que você está enviando para <strong>si mesmo</strong>. Aprovar seus próprios relatórios é <strong>proibido</strong> pelo seu workspace. Envie este relatório para outra pessoa ou entre em contato com o seu administrador para alterar a pessoa para quem você envia.`,
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'em breve',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'mais tarde hoje',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'no domingo',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: 'no dia 1º e 16 de cada mês',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: 'no último dia útil do mês',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: 'no último dia do mês',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: 'no final da sua viagem',
        },
    },
    profilePage: {
        profile: 'Perfil',
        preferredPronouns: 'Pronomes preferidos',
        selectYourPronouns: 'Selecione seus pronomes',
        selfSelectYourPronoun: 'Selecione seu pronome você mesmo',
        emailAddress: 'Endereço de e-mail',
        setMyTimezoneAutomatically: 'Definir meu fuso horário automaticamente',
        timezone: 'Fuso horário',
        invalidFileMessage: 'Arquivo inválido. Tente outra imagem.',
        avatarUploadFailureMessage: 'Ocorreu um erro ao enviar o avatar. Tente novamente.',
        online: 'Conectado',
        offline: 'Offline',
        syncing: 'Sincronizando',
        profileAvatar: 'Avatar do perfil',
        publicSection: {
            title: 'Público',
            subtitle: 'Esses detalhes são exibidos no seu perfil público. Qualquer pessoa pode vê-los.',
        },
        privateSection: {
            title: 'Privado',
            subtitle: 'Esses dados são usados para viagens e pagamentos. Eles nunca são exibidos no seu perfil público.',
        },
    },
    securityPage: {
        title: 'Opções de segurança',
        subtitle: 'Ative a autenticação em duas etapas para manter sua conta segura.',
        goToSecurity: 'Voltar para a página de segurança',
    },
    shareCodePage: {
        title: 'Seu código',
        subtitle: 'Convide membros para o Expensify compartilhando seu QR code pessoal ou link de indicação.',
    },
    pronounsPage: {
        pronouns: 'Pronomes',
        isShownOnProfile: 'Seus pronomes são exibidos no seu perfil.',
        placeholderText: 'Pesquisar para ver opções',
    },
    contacts: {
        contactMethods: 'Métodos de contato',
        featureRequiresValidate: 'Este recurso exige que você valide sua conta.',
        validateAccount: 'Validar sua conta',
        helpText: ({email}: {email: string}) =>
            `Adicione mais maneiras de fazer login e enviar recibos para o Expensify.<br/><br/>Adicione um endereço de e-mail para encaminhar recibos para <a href="mailto:${email}">${email}</a> ou adicione um número de telefone para enviar recibos por SMS para 47777 (apenas números dos EUA).`,
        pleaseVerify: 'Verifique este método de contato.',
        getInTouch: 'Usaremos este método para entrar em contato com você.',
        enterMagicCode: (contactMethod: string) => `Insira o código mágico enviado para ${contactMethod}. Ele deve chegar em um ou dois minutos.`,
        setAsDefault: 'Definir como padrão',
        yourDefaultContactMethod: 'Este é o seu método de contato padrão atual. Antes de poder excluí-lo, você precisará escolher outro método de contato e clicar em “Definir como padrão”.',
        removeContactMethod: 'Remover método de contato',
        removeAreYouSure: 'Tem certeza de que deseja remover este método de contato? Esta ação não pode ser desfeita.',
        failedNewContact: 'Falha ao adicionar este método de contato.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Falha ao enviar um novo código mágico. Aguarde um pouco e tente novamente.',
            validateSecondaryLogin: 'Código mágico incorreto ou inválido. Tente novamente ou solicite um novo código.',
            deleteContactMethod: 'Falha ao excluir o método de contato. Entre em contato com a Concierge para obter ajuda.',
            setDefaultContactMethod: 'Falha ao definir um novo método de contato padrão. Entre em contato com a Concierge para obter ajuda.',
            addContactMethod: 'Falha ao adicionar este método de contato. Entre em contato com o Concierge para obter ajuda.',
            enteredMethodIsAlreadySubmitted: 'Esse método de contato já existe',
            passwordRequired: 'senha obrigatória.',
            contactMethodRequired: 'O método de contato é obrigatório',
            invalidContactMethod: 'Método de contato inválido',
        },
        newContactMethod: 'Novo método de contato',
        goBackContactMethods: 'Voltar para métodos de contato',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Empresa / Empresas',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Ele / Dele / Seu',
        heHimHisTheyThemTheirs: 'Ele / Dele / Dele / Eles / Deles / Deles',
        sheHerHers: 'Ela / Dela / Delas',
        sheHerHersTheyThemTheirs: 'Ela / Ela / Dela / Elu / Elu / Delu',
        merMers: 'Qua / Quas',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: 'Elu / Delu / Seus',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Me chame pelo meu nome',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: 'Nome de exibição',
        isShownOnProfile: 'Seu nome de exibição é mostrado no seu perfil.',
    },
    timezonePage: {
        timezone: 'Fuso horário',
        isShownOnProfile: 'Seu fuso horário é exibido no seu perfil.',
        getLocationAutomatically: 'Determinar sua localização automaticamente',
    },
    updateRequiredView: {
        updateRequired: 'Atualização necessária',
        pleaseInstall: 'Atualize para a versão mais recente do New Expensify',
        pleaseInstallExpensifyClassic: 'Instale a versão mais recente do Expensify',
        toGetLatestChanges: 'Para dispositivos móveis, baixe e instale a versão mais recente. Para web, atualize seu navegador.',
        newAppNotAvailable: 'O novo aplicativo Expensify não está mais disponível.',
    },
    initialSettingsPage: {
        about: 'Sobre',
        aboutPage: {
            description: 'O novo aplicativo Expensify é desenvolvido por uma comunidade de desenvolvedores open source do mundo todo. Ajude-nos a construir o futuro do Expensify.',
            appDownloadLinks: 'Links para download do app',
            viewKeyboardShortcuts: 'Ver atalhos de teclado',
            viewTheCode: 'Ver o código',
            viewOpenJobs: 'Ver vagas em aberto',
            reportABug: 'Reportar um bug',
            troubleshoot: 'Solucionar problemas',
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
            clearCacheAndRestart: 'Limpar cache e reiniciar',
            viewConsole: 'Ver console de depuração',
            debugConsole: 'Console de depuração',
            description:
                '<muted-text>Use as ferramentas abaixo para ajudar a solucionar problemas na experiência do Expensify. Se você encontrar algum problema, por favor, <concierge-link>envie um bug</concierge-link>.</muted-text>',
            confirmResetDescription: 'Todas as mensagens de rascunho não enviadas serão perdidas, mas o restante dos seus dados estará seguro.',
            resetAndRefresh: 'Redefinir e atualizar',
            clientSideLogging: 'Log de cliente',
            noLogsToShare: 'Sem registros para compartilhar',
            useProfiling: 'Usar criação de perfil',
            profileTrace: 'Rastreamento de perfil',
            results: 'Resultados',
            releaseOptions: 'Opções de lançamento',
            testingPreferences: 'Preferências de teste',
            useStagingServer: 'Usar servidor de staging',
            forceOffline: 'Forçar modo offline',
            simulatePoorConnection: 'Simular conexão de internet fraca',
            simulateFailingNetworkRequests: 'Simular falhas em requisições de rede',
            authenticationStatus: 'Status de autenticação',
            deviceCredentials: 'Credenciais do dispositivo',
            invalidate: 'Invalidar',
            destroy: 'Destruir',
            maskExportOnyxStateData: 'Mascarar dados confidenciais de membros ao exportar o estado do Onyx',
            exportOnyxState: 'Exportar estado do Onyx',
            importOnyxState: 'Importar estado do Onyx',
            testCrash: 'Teste de falha',
            resetToOriginalState: 'Redefinir para o estado original',
            usingImportedState: 'Você está usando um estado importado. Pressione aqui para limpá-lo.',
            debugMode: 'Modo de depuração',
            invalidFile: 'Arquivo inválido',
            invalidFileDescription: 'O arquivo que você está tentando importar não é válido. Tente novamente.',
            invalidateWithDelay: 'Invalidar com atraso',
            recordTroubleshootData: 'Registrar Dados de Solução de Problemas',
            softKillTheApp: 'Encerrar o aplicativo sem forçar',
            kill: 'Encerrar',
            sentryDebug: 'Depuração do Sentry',
            sentryDebugDescription: 'Registrar solicitações do Sentry no console',
            sentryHighlightedSpanOps: 'Nomes de spans destacados',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interaction.click, navigation, ui.load',
            leftHandNavCache: 'Cache da navegação lateral esquerda',
            clearleftHandNavCache: 'Limpar',
        },
        debugConsole: {
            saveLog: 'Salvar log',
            shareLog: 'Compartilhar registro',
            enterCommand: 'Inserir comando',
            execute: 'Executar',
            noLogsAvailable: 'Nenhum log disponível',
            logSizeTooLarge: ({size}: LogSizeParams) => `O tamanho do log excede o limite de ${size} MB. Use “Salvar log” para baixar o arquivo de log.`,
            logs: 'Registros',
            viewConsole: 'Ver console',
        },
        security: 'Segurança',
        signOut: 'Sair',
        restoreStashed: 'Restaurar login armazenado',
        signOutConfirmationText: 'Você perderá quaisquer alterações offline se sair.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>Leia os <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Termos de Serviço</a> e a <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacidade</a>.</muted-text-micro>`,
        help: 'Ajuda',
        whatIsNew: 'Novidades',
        accountSettings: 'Configurações da conta',
        account: 'Conta',
        general: 'Geral',
    },
    closeAccountPage: {
        // @context close as a verb, not an adjective
        closeAccount: 'Fechar conta',
        reasonForLeavingPrompt: 'Não gostaríamos de ver você ir embora! Você poderia nos dizer o motivo, para que possamos melhorar?',
        enterMessageHere: 'Digite a mensagem aqui',
        closeAccountWarning: 'Fechar sua conta não pode ser desfeito.',
        closeAccountPermanentlyDeleteData: 'Tem certeza de que deseja excluir sua conta? Isso excluirá permanentemente todas as despesas pendentes.',
        enterDefaultContactToConfirm: 'Insira seu método de contato padrão para confirmar que deseja encerrar sua conta. Seu método de contato padrão é:',
        enterDefaultContact: 'Insira seu método de contato padrão',
        defaultContact: 'Método de contato padrão:',
        enterYourDefaultContactMethod: 'Insira seu método de contato padrão para encerrar sua conta.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Mesclar contas',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Insira a conta que você deseja mesclar em <strong>${login}</strong>.`,
            notReversibleConsent: 'Entendo que isso não é reversível',
        },
        accountValidate: {
            confirmMerge: 'Você tem certeza de que deseja mesclar as contas?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `A fusão das suas contas é irreversível e resultará na perda de quaisquer despesas não enviadas para <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Para continuar, insira o código mágico enviado para <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: 'Código mágico incorreto ou inválido. Tente novamente ou solicite um novo código.',
                fallback: 'Algo deu errado. Tente novamente mais tarde.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Contas mescladas!',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Você mesclou com sucesso todos os dados de <strong>${from}</strong> em <strong>${to}</strong>. De agora em diante, você pode usar qualquer um dos logins para esta conta.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Estamos trabalhando nisso',
            limitedSupport: 'Ainda não oferecemos suporte à mesclagem de contas no New Expensify. Em vez disso, realize essa ação no Expensify Classic.',
            reachOutForHelp:
                '<muted-text><centered-text>Fique à vontade para <concierge-link>entrar em contato com a Concierge</concierge-link> se tiver qualquer dúvida!</centered-text></muted-text>',
            goToExpensifyClassic: 'Ir para o Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Você não pode mesclar <strong>${email}</strong> porque ele é controlado por <strong>${email.split('@').at(1) ?? ''}</strong>. Por favor, <concierge-link>entre em contato com o Concierge</concierge-link> para obter ajuda.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Você não pode mesclar <strong>${email}</strong> em outras contas porque o administrador do seu domínio o definiu como seu login principal. Em vez disso, mescle outras contas nele.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Você não pode mesclar contas porque <strong>${email}</strong> tem a autenticação de dois fatores (2FA) ativada. Desative o 2FA para <strong>${email}</strong> e tente novamente.</centered-text></muted-text>`,
            learnMore: 'Saiba mais sobre como mesclar contas.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Você não pode mesclar <strong>${email}</strong> porque ele está bloqueado. Por favor, <concierge-link>entre em contato com o Concierge</concierge-link> para obter ajuda.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Não é possível mesclar contas porque <strong>${email}</strong> não tem uma conta Expensify. Em vez disso, <a href="${contactMethodLink}">adicione-o como um método de contato</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Você não pode mesclar <strong>${email}</strong> em outras contas. Em vez disso, mescle outras contas nela.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Você não pode mesclar contas em <strong>${email}</strong> porque esta conta é proprietária de um relacionamento de cobrança faturado.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Tente novamente mais tarde',
            description: 'Houveram muitas tentativas de mesclar contas. Tente novamente mais tarde.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Você não pode fazer merge em outras contas porque ela não foi validada. Valide a conta e tente novamente.',
        },
        mergeFailureSelfMerge: {
            description: 'Você não pode mesclar uma conta com ela mesma.',
        },
        mergeFailureGenericHeading: 'Não é possível mesclar contas',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Reportar atividade suspeita',
        lockAccount: 'Bloquear conta',
        unlockAccount: 'Desbloquear conta',
        compromisedDescription:
            'Notou algo estranho na sua conta? Relatar isso bloqueará imediatamente sua conta, impedirá novas transações com o Cartão Expensify e evitará qualquer alteração na conta.',
        domainAdminsDescription: 'Para administradores de domínio: isso também pausa toda a atividade do Expensify Card e as ações de administrador em todo o(s) seu(s) domínio(s).',
        areYouSure: 'Tem certeza de que deseja bloquear sua conta Expensify?',
        onceLocked: 'Depois de bloqueada, sua conta ficará restrita até que seja feita uma solicitação de desbloqueio e uma revisão de segurança',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Falha ao bloquear conta',
        failedToLockAccountDescription: `Não foi possível bloquear sua conta. Por favor, converse com o Concierge para resolver esse problema.`,
        chatWithConcierge: 'Conversar com Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Conta bloqueada',
        yourAccountIsLocked: 'Sua conta está bloqueada',
        chatToConciergeToUnlock: 'Converse com o Concierge para resolver questões de segurança e desbloquear sua conta.',
        chatWithConcierge: 'Conversar com Concierge',
    },
    twoFactorAuth: {
        headerTitle: 'Autenticação em duas etapas',
        twoFactorAuthEnabled: 'Autenticação de dois fatores ativada',
        whatIsTwoFactorAuth:
            'A autenticação de dois fatores (2FA) ajuda a manter sua conta segura. Ao fazer login, você precisará inserir um código gerado pelo seu aplicativo autenticador preferido.',
        disableTwoFactorAuth: 'Desativar autenticação de dois fatores',
        explainProcessToRemove: 'Para desativar a autenticação de dois fatores (2FA), insira um código válido do seu aplicativo de autenticação.',
        explainProcessToRemoveWithRecovery: 'Para desativar a autenticação de dois fatores (2FA), insira um código de recuperação válido.',
        disabled: 'A autenticação em duas etapas agora está desativada',
        noAuthenticatorApp: 'Você não precisará mais de um app autenticador para entrar no Expensify.',
        stepCodes: 'Códigos de recuperação',
        keepCodesSafe: 'Guarde estes códigos de recuperação em segurança!',
        codesLoseAccess: dedent(`
            Se você perder o acesso ao seu aplicativo autenticador e não tiver esses códigos, perderá o acesso à sua conta.

            Observação: Configurar a autenticação em duas etapas fará com que você seja desconectado de todas as outras sessões ativas.
        `),
        errorStepCodes: 'Copie ou faça o download dos códigos antes de continuar',
        stepVerify: 'Verificar',
        scanCode: 'Escaneie o código QR usando seu',
        authenticatorApp: 'aplicativo autenticador',
        addKey: 'Ou adicione esta chave secreta ao seu app autenticador:',
        enterCode: 'Em seguida, insira o código de seis dígitos gerado pelo seu app autenticador.',
        stepSuccess: 'Concluído',
        enabled: 'Autenticação de dois fatores ativada',
        congrats: 'Parabéns! Agora você tem essa segurança extra.',
        copy: 'Copiar',
        disable: 'Desativar',
        enableTwoFactorAuth: 'Ativar autenticação de dois fatores',
        pleaseEnableTwoFactorAuth: 'Por favor, ative a autenticação de dois fatores.',
        twoFactorAuthIsRequiredDescription: 'Por motivos de segurança, a Xero exige autenticação em duas etapas para conectar a integração.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Autenticação de dois fatores obrigatória',
        twoFactorAuthIsRequiredForAdminsTitle: 'Ative a autenticação em duas etapas',
        twoFactorAuthIsRequiredXero: 'Sua conexão de contabilidade com o Xero requer autenticação em duas etapas.',
        twoFactorAuthIsRequiredCompany: 'Sua empresa exige autenticação em duas etapas.',
        twoFactorAuthCannotDisable: 'Não é possível desativar a 2FA',
        twoFactorAuthRequired: 'A autenticação de dois fatores (2FA) é obrigatória para sua conexão com o Xero e não pode ser desativada.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Insira seu código de recuperação',
            incorrectRecoveryCode: 'Código de recuperação incorreto. Tente novamente.',
        },
        useRecoveryCode: 'Usar código de recuperação',
        recoveryCode: 'Código de recuperação',
        use2fa: 'Usar código de autenticação em duas etapas',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Insira seu código de autenticação em duas etapas',
            incorrect2fa: 'Código de autenticação em duas etapas incorreto. Tente novamente.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Senha atualizada!',
        allSet: 'Tudo pronto. Mantenha sua nova senha em segurança.',
    },
    privateNotes: {
        title: 'Notas privadas',
        personalNoteMessage: 'Mantenha anotações sobre este chat aqui. Você é a única pessoa que pode adicionar, editar ou visualizar essas anotações.',
        sharedNoteMessage: 'Mantenha anotações sobre este chat aqui. Funcionários da Expensify e outros membros no domínio team.expensify.com podem ver essas anotações.',
        composerLabel: 'Notas',
        myNote: 'Minha observação',
        error: {
            genericFailureMessage: 'Não foi possível salvar as notas privadas',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Insira um código de segurança válido',
        },
        securityCode: 'Código de segurança',
        changeBillingCurrency: 'Alterar moeda de cobrança',
        changePaymentCurrency: 'Alterar moeda de pagamento',
        paymentCurrency: 'Moeda de pagamento',
        paymentCurrencyDescription: 'Selecione uma moeda padronizada para a qual todas as despesas pessoais devem ser convertidas',
        note: `Observação: Alterar sua moeda de pagamento pode impactar quanto você pagará pelo Expensify. Consulte nossa <a href="${CONST.PRICING}">página de preços</a> para mais detalhes.`,
    },
    addDebitCardPage: {
        addADebitCard: 'Adicionar um cartão de débito',
        nameOnCard: 'Nome no cartão',
        debitCardNumber: 'Número do cartão de débito',
        expiration: 'Data de validade',
        expirationDate: 'MMAA',
        cvv: 'CVV',
        billingAddress: 'Endereço de cobrança',
        growlMessageOnSave: 'Seu cartão de débito foi adicionado com sucesso',
        expensifyPassword: 'Senha do Expensify',
        error: {
            invalidName: 'O nome pode incluir apenas letras',
            addressZipCode: 'Insira um CEP válido',
            debitCardNumber: 'Insira um número de cartão de débito válido',
            expirationDate: 'Selecione uma data de validade válida',
            securityCode: 'Insira um código de segurança válido',
            addressStreet: 'Insira um endereço de cobrança válido que não seja uma caixa postal',
            addressState: 'Selecione um estado',
            addressCity: 'Por favor, insira uma cidade',
            genericFailureMessage: 'Ocorreu um erro ao adicionar seu cartão. Tente novamente.',
            password: 'Insira sua senha do Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Adicionar cartão de pagamento',
        nameOnCard: 'Nome no cartão',
        paymentCardNumber: 'Número do cartão',
        expiration: 'Data de validade',
        expirationDate: 'MM/AA',
        cvv: 'CVV',
        billingAddress: 'Endereço de cobrança',
        growlMessageOnSave: 'Seu cartão de pagamento foi adicionado com sucesso',
        expensifyPassword: 'Senha do Expensify',
        error: {
            invalidName: 'O nome pode incluir apenas letras',
            addressZipCode: 'Insira um CEP válido',
            paymentCardNumber: 'Insira um número de cartão válido',
            expirationDate: 'Selecione uma data de validade válida',
            securityCode: 'Insira um código de segurança válido',
            addressStreet: 'Insira um endereço de cobrança válido que não seja uma caixa postal',
            addressState: 'Selecione um estado',
            addressCity: 'Por favor, insira uma cidade',
            genericFailureMessage: 'Ocorreu um erro ao adicionar seu cartão. Tente novamente.',
            password: 'Insira sua senha do Expensify',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Formas de pagamento',
        setDefaultConfirmation: 'Tornar método de pagamento padrão',
        setDefaultSuccess: 'Método de pagamento padrão definido!',
        deleteAccount: 'Excluir conta',
        deleteConfirmation: 'Tem certeza de que deseja excluir esta conta?',
        error: {
            notOwnerOfBankAccount: 'Ocorreu um erro ao definir esta conta bancária como seu método de pagamento padrão',
            invalidBankAccount: 'Esta conta bancária está temporariamente suspensa',
            notOwnerOfFund: 'Ocorreu um erro ao definir este cartão como seu método de pagamento padrão',
            setDefaultFailure: 'Algo deu errado. Por favor, converse com o Concierge para obter mais assistência.',
        },
        addBankAccountFailure: 'Ocorreu um erro inesperado ao tentar adicionar sua conta bancária. Tente novamente.',
        getPaidFaster: 'Receba pagamentos mais rápido',
        addPaymentMethod: 'Adicione uma forma de pagamento para enviar e receber pagamentos diretamente no app.',
        getPaidBackFaster: 'Seja reembolsado mais rápido',
        secureAccessToYourMoney: 'Acesso seguro ao seu dinheiro',
        receiveMoney: 'Receba dinheiro na sua moeda local',
        expensifyWallet: 'Carteira Expensify (Beta)',
        sendAndReceiveMoney: 'Envie e receba dinheiro com amigos. Apenas contas bancárias dos EUA.',
        enableWallet: 'Ativar carteira',
        addBankAccountToSendAndReceive: 'Adicione uma conta bancária para fazer ou receber pagamentos.',
        addDebitOrCreditCard: 'Adicionar cartão de débito ou crédito',
        assignedCards: 'Cartões atribuídos',
        assignedCardsDescription: 'As transações desses cartões são sincronizadas automaticamente.',
        expensifyCard: 'Cartão Expensify',
        walletActivationPending: 'Estamos analisando suas informações. Volte daqui a alguns minutos!',
        walletActivationFailed: 'Infelizmente, sua carteira não pode ser ativada neste momento. Converse com o Concierge para obter mais assistência.',
        addYourBankAccount: 'Adicione sua conta bancária',
        addBankAccountBody: 'Vamos conectar sua conta bancária ao Expensify para que seja mais fácil do que nunca enviar e receber pagamentos diretamente no app.',
        chooseYourBankAccount: 'Escolha sua conta bancária',
        chooseAccountBody: 'Certifique-se de selecionar o correto.',
        confirmYourBankAccount: 'Confirme sua conta bancária',
        personalBankAccounts: 'Contas bancárias pessoais',
        businessBankAccounts: 'Contas bancárias empresariais',
        shareBankAccount: 'Compartilhar conta bancária',
        bankAccountShared: 'Conta bancária compartilhada',
        shareBankAccountTitle: 'Selecione os administradores com quem compartilhar esta conta bancária:',
        shareBankAccountSuccess: 'Conta bancária compartilhada!',
        shareBankAccountSuccessDescription: 'Os administradores selecionados receberão uma mensagem de confirmação do Concierge.',
        shareBankAccountFailure: 'Ocorreu um erro inesperado ao tentar compartilhar a conta bancária. Tente novamente.',
        shareBankAccountEmptyTitle: 'Nenhum administrador disponível',
        shareBankAccountEmptyDescription: 'Não há administradores de espaço de trabalho com quem você possa compartilhar esta conta bancária.',
        shareBankAccountNoAdminsSelected: 'Selecione um administrador antes de continuar',
        unshareBankAccount: 'Descompartilhar conta bancária',
        unshareBankAccountDescription: 'Todos abaixo têm acesso a esta conta bancária. Você pode remover o acesso a qualquer momento. Ainda concluiremos quaisquer pagamentos em andamento.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} perderá o acesso a esta conta bancária comercial. Ainda concluiremos quaisquer pagamentos em andamento.`,
        reachOutForHelp: 'Está sendo usada com o Cartão Expensify. <concierge-link>Entre em contato com o Concierge</concierge-link> se precisar descompartilhar.',
        unshareErrorModalTitle: 'Não foi possível descompartilhar a conta bancária',
        deleteCard: 'Excluir cartão',
        deleteCardConfirmation:
            'Todas as transações de cartão não enviadas, incluindo aquelas em relatórios em aberto, serão removidas. Tem certeza de que deseja excluir este cartão? Esta ação não pode ser desfeita.',
    },
    cardPage: {
        expensifyCard: 'Cartão Expensify',
        expensifyTravelCard: 'Cartão de Viagem Expensify',
        availableSpend: 'Limite restante',
        smartLimit: {
            name: 'Limite inteligente',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Você pode gastar até ${formattedLimit} neste cartão, e o limite será reajustado conforme suas despesas enviadas forem aprovadas.`,
        },
        fixedLimit: {
            name: 'Limite fixo',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Você pode gastar até ${formattedLimit} neste cartão e, em seguida, ele será desativado.`,
        },
        monthlyLimit: {
            name: 'Limite mensal',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Você pode gastar até ${formattedLimit} neste cartão por mês. O limite será redefinido no 1º dia de cada mês do calendário.`,
        },
        virtualCardNumber: 'Número do cartão virtual',
        travelCardCvv: 'CVV do cartão de viagem',
        physicalCardNumber: 'Número do cartão físico',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Obter cartão físico',
        reportFraud: 'Denunciar fraude em cartão virtual',
        reportTravelFraud: 'Reportar fraude no cartão de viagem',
        reviewTransaction: 'Revisar transação',
        suspiciousBannerTitle: 'Transação suspeita',
        suspiciousBannerDescription: 'Notamos transações suspeitas no seu cartão. Toque abaixo para revisar.',
        cardLocked: 'Seu cartão está temporariamente bloqueado enquanto nossa equipe analisa a conta da sua empresa.',
        markTransactionsAsReimbursable: 'Marcar transações como reembolsáveis',
        markTransactionsDescription: 'Quando ativado, as transações importadas deste cartão são marcadas como reembolsáveis por padrão.',
        cardDetails: {
            cardNumber: 'Número do cartão virtual',
            expiration: 'Vencimento',
            cvv: 'CVV',
            address: 'Endereço',
            revealDetails: 'Revelar detalhes',
            revealCvv: 'Revelar CVV',
            copyCardNumber: 'Copiar número do cartão',
            updateAddress: 'Atualizar endereço',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Adicionado à carteira ${platform}`,
        cardDetailsLoadingFailure: 'Ocorreu um erro ao carregar os detalhes do cartão. Verifique sua conexão com a internet e tente novamente.',
        validateCardTitle: 'Vamos confirmar que é você',
        enterMagicCode: (contactMethod: string) => `Insira o código mágico enviado para ${contactMethod} para ver os detalhes do seu cartão. Ele deve chegar em um ou dois minutos.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `Por favor, <a href="${missingDetailsLink}">adicione seus dados pessoais</a> e tente novamente.`,
        unexpectedError: 'Ocorreu um erro ao tentar obter os detalhes do seu cartão Expensify. Tente novamente.',
        cardFraudAlert: {
            confirmButtonText: 'Sim, eu quero',
            reportFraudButtonText: 'Não, não fui eu',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `removeu a atividade suspeita e reativou o cartão x${cardLastFour}. Tudo pronto para continuar enviando despesas!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `desativou o cartão terminado em ${cardLastFour}`,
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
            }) => `atividade suspeita identificada no cartão com final ${cardLastFour}. Você reconhece esta cobrança?

${amount} para ${merchant} - ${date}`,
        },
        csvCardDescription: 'Importar CSV',
    },
    workflowsPage: {
        workflowTitle: 'Gastos',
        workflowDescription: 'Configure um fluxo de trabalho desde o momento em que o gasto ocorre, incluindo aprovação e pagamento.',
        submissionFrequency: 'Envios',
        submissionFrequencyDescription: 'Escolha uma programação personalizada para enviar despesas.',
        submissionFrequencyDateOfMonth: 'Data do mês',
        disableApprovalPromptDescription: 'Desativar as aprovações apagará todos os fluxos de trabalho de aprovação existentes.',
        addApprovalsTitle: 'Aprovações',
        addApprovalButton: 'Adicionar fluxo de aprovação',
        addApprovalTip: 'Este fluxo de trabalho padrão se aplica a todos os membros, a menos que exista um fluxo de trabalho mais específico.',
        approver: 'Aprovador',
        addApprovalsDescription: 'Exigir aprovação adicional antes de autorizar um pagamento.',
        makeOrTrackPaymentsTitle: 'Pagamentos',
        makeOrTrackPaymentsDescription: 'Adicione um pagador autorizado para pagamentos feitos no Expensify ou acompanhe pagamentos feitos em outros lugares.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>Um fluxo de aprovação personalizado está ativado neste workspace. Para revisar ou alterar esse fluxo, entre em contato com seu <account-manager-link>Gerente de Conta</account-manager-link> ou com o <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Um fluxo de aprovação personalizado está ativado neste workspace. Para revisar ou alterar esse fluxo de trabalho, entre em contato com o <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Escolha por quanto tempo o Expensify deve esperar antes de compartilhar despesas sem erro.',
        },
        frequencyDescription: 'Escolha com que frequência você quer que as despesas sejam enviadas automaticamente ou torne o envio manual',
        frequencies: {
            instant: 'Instantaneamente',
            weekly: 'Semanal',
            monthly: 'Mensal',
            twiceAMonth: 'Duas vezes por mês',
            byTrip: 'Por viagem',
            manually: 'Manualmente',
            daily: 'Diário',
            lastDayOfMonth: 'Último dia do mês',
            lastBusinessDayOfMonth: 'Último dia útil do mês',
            ordinals: {
                one: 'º',
                two: 'e',
                few: 'º',
                other: 'º',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Primeiro',
                '2': 'Segundo',
                '3': 'Terceiro',
                '4': 'Quarto',
                '5': 'Quinto',
                '6': 'Sexto',
                '7': 'Sétimo',
                '8': 'Oitavo',
                '9': 'Nono',
                '10': 'Décimo',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Este membro já pertence a outro fluxo de aprovação. Quaisquer atualizações aqui serão refletidas lá também.',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> já aprova relatórios para <strong>${name2}</strong>. Escolha um aprovador diferente para evitar um fluxo de trabalho circular.`,
        emptyContent: {
            title: 'Nenhum membro para exibir',
            expensesFromSubtitle: 'Todos os membros do workspace já pertencem a um fluxo de aprovação existente.',
            approverSubtitle: 'Todos os aprovadores pertencem a um fluxo de trabalho existente.',
        },
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `despesas de ${members}, e o aprovador é ${approvers}`,
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'A frequência de envio não pôde ser alterada. Tente novamente ou entre em contato com o suporte.',
        monthlyOffsetErrorMessage: 'A frequência mensal não pôde ser alterada. Tente novamente ou entre em contato com o suporte.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Confirmar',
        header: 'Adicione mais aprovadores e confirme.',
        additionalApprover: 'Aprovador adicional',
        submitButton: 'Adicionar fluxo de trabalho',
    },
    workflowsEditApprovalsPage: {
        title: 'Editar fluxo de aprovação',
        deleteTitle: 'Excluir fluxo de aprovação',
        deletePrompt: 'Tem certeza de que deseja excluir este fluxo de aprovação? Todos os membros passarão a seguir o fluxo padrão.',
    },
    workflowsExpensesFromPage: {
        title: 'Despesas de',
        header: 'Quando os seguintes membros enviarem despesas:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'O aprovador não pôde ser alterado. Tente novamente ou entre em contato com o suporte.',
        title: 'Enviar para este membro para aprovação:',
        description: 'Esta pessoa aprovará as despesas.',
    },
    workflowsApprovalLimitPage: {
        title: 'Aprovador',
        header: '(Opcional) Deseja adicionar um limite de aprovação?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `Adicione outro aprovador quando <strong>${approverName}</strong> for aprovador e o relatório exceder o valor abaixo:`
                : 'Adicione outro aprovador quando o relatório exceder o valor abaixo:',
        reportAmountLabel: 'Valor do relatório',
        additionalApproverLabel: 'Aprovador adicional',
        skip: 'Pular',
        next: 'Próximo',
        removeLimit: 'Remover limite',
        enterAmountError: 'Por favor, insira um valor válido',
        enterApproverError: 'Um aprovador é necessário quando você define um limite de relatório',
        enterBothError: 'Insira um valor do relatório e um aprovador adicional',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) =>
            `Relatórios acima de ${approvalLimit} são encaminhados para ${approverName}`,
    },
    workflowsPayerPage: {
        title: 'Pagador autorizado',
        genericErrorMessage: 'O pagador autorizado não pôde ser alterado. Tente novamente.',
        admins: 'Administradores',
        payer: 'Pagador',
        paymentAccount: 'Conta de pagamento',
    },
    reportFraudPage: {
        title: 'Denunciar fraude em cartão virtual',
        description:
            'Se os dados do seu cartão virtual tiverem sido roubados ou comprometidos, desativaremos permanentemente o seu cartão atual e forneceremos um novo cartão virtual e um novo número.',
        deactivateCard: 'Desativar cartão',
        reportVirtualCardFraud: 'Denunciar fraude em cartão virtual',
    },
    reportFraudConfirmationPage: {
        title: 'Fraude no cartão reportada',
        description: 'Desativamos permanentemente seu cartão atual. Quando você voltar para ver os detalhes do cartão, um novo cartão virtual estará disponível.',
        buttonText: 'Entendi, obrigado!',
    },
    activateCardPage: {
        activateCard: 'Ativar cartão',
        pleaseEnterLastFour: 'Insira os últimos quatro dígitos do seu cartão.',
        activatePhysicalCard: 'Ativar cartão físico',
        error: {
            thatDidNotMatch: 'Isso não correspondeu aos últimos 4 dígitos do seu cartão. Tente novamente.',
            throttled:
                'Você digitou incorretamente os últimos 4 dígitos do seu Cartão Expensify muitas vezes. Se tiver certeza de que os números estão corretos, entre em contato com o Concierge para resolver. Caso contrário, tente novamente mais tarde.',
        },
    },
    getPhysicalCard: {
        header: 'Obter cartão físico',
        nameMessage: 'Digite seu nome e sobrenome, pois isso será exibido no seu cartão.',
        legalName: 'Nome legal',
        legalFirstName: 'Primeiro nome legal',
        legalLastName: 'Sobrenome legal',
        phoneMessage: 'Insira seu número de telefone.',
        phoneNumber: 'Número de telefone',
        address: 'Endereço',
        addressMessage: 'Insira seu endereço de entrega.',
        streetAddress: 'Endereço (rua)',
        city: 'Cidade',
        state: 'Estado',
        zipPostcode: 'CEP/Código Postal',
        country: 'País',
        confirmMessage: 'Confirme seus dados abaixo.',
        estimatedDeliveryMessage: 'Seu cartão físico chegará em 2–3 dias úteis.',
        next: 'Próximo',
        getPhysicalCard: 'Obter cartão físico',
        shipCard: 'Enviar cartão',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transferir${amount ? ` ${amount}` : ''}`,
        instant: 'Imediato (Cartão de débito)',
        instantSummary: (rate: string, minAmount: string) => `Taxa de ${rate}% (${minAmount} mínimo)`,
        ach: '1–3 dias úteis (Conta bancária)',
        achSummary: 'Sem taxa',
        whichAccount: 'Qual conta?',
        fee: 'Taxa',
        transferSuccess: 'Transferência bem-sucedida!',
        transferDetailBankAccount: 'Seu dinheiro deve chegar nos próximos 1–3 dias úteis.',
        transferDetailDebitCard: 'Seu dinheiro deve chegar imediatamente.',
        failedTransfer: 'Seu saldo não está totalmente quitado. Transfira para uma conta bancária.',
        notHereSubTitle: 'Transfira seu saldo da página da carteira',
        goToWallet: 'Ir para Carteira',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Escolher conta',
    },
    paymentMethodList: {
        addPaymentMethod: 'Adicionar forma de pagamento',
        addNewDebitCard: 'Adicionar novo cartão de débito',
        addNewBankAccount: 'Adicionar nova conta bancária',
        accountLastFour: 'Termina em',
        cardLastFour: 'Cartão terminado em',
        addFirstPaymentMethod: 'Adicione uma forma de pagamento para enviar e receber pagamentos diretamente no app.',
        defaultPaymentMethod: 'Padrão',
        bankAccountLastFour: (lastFour: string) => `Conta bancária • ${lastFour}`,
    },
    expenseRulesPage: {
        title: 'Regras de despesas',
        subtitle: 'Essas regras serão aplicadas às suas despesas. Se você enviar para um workspace, as regras do workspace poderão substituí-las.',
        findRule: 'Encontrar regra',
        emptyRules: {title: 'Você não criou nenhuma regra', subtitle: 'Adicione uma regra para automatizar o relatório de despesas.'},
        changes: {
            billableUpdate: (value: boolean) => `Atualizar despesa ${value ? 'cobrável' : 'não faturável'}`,
            categoryUpdate: (value: string) => `Atualizar categoria para "${value}"`,
            commentUpdate: (value: string) => `Alterar descrição para "${value}"`,
            merchantUpdate: (value: string) => `Atualizar comerciante para "${value}"`,
            reimbursableUpdate: (value: boolean) => `Atualizar despesa ${value ? 'reembolsável' : 'não reembolsável'}`,
            tagUpdate: (value: string) => `Atualizar etiqueta para "${value}"`,
            taxUpdate: (value: string) => `Atualizar taxa de imposto para ${value}`,
            billable: (value: boolean) => `despesa ${value ? 'cobrável' : 'não faturável'}`,
            category: (value: string) => `categoria para "${value}"`,
            comment: (value: string) => `descrição para "${value}"`,
            merchant: (value: string) => `comerciante para "${value}"`,
            reimbursable: (value: boolean) => `despesa ${value ? 'reembolsável' : 'não reembolsável'}`,
            tag: (value: string) => `etiqueta para "${value}"`,
            tax: (value: string) => `taxa de imposto para ${value}`,
            report: (value: string) => `adicionar a um relatório chamado "${value}"`,
        },
        newRule: 'Nova regra',
        addRule: {
            title: 'Adicionar regra',
            expenseContains: 'Se a despesa contiver:',
            applyUpdates: 'Em seguida, aplique estas atualizações:',
            merchantHint: 'Digite * para criar uma regra que se aplique a todos os estabelecimentos',
            addToReport: 'Adicionar a um relatório chamado',
            createReport: 'Criar relatório se necessário',
            applyToExistingExpenses: 'Aplicar às despesas correspondentes existentes',
            confirmError: 'Insira o comerciante e aplique pelo menos uma atualização',
            confirmErrorMerchant: 'Insira o comerciante',
            confirmErrorUpdate: 'Por favor, aplique pelo menos uma atualização',
            saveRule: 'Salvar regra',
        },
        editRule: {title: 'Editar regra'},
        deleteRule: {
            deleteSingle: 'Excluir regra',
            deleteMultiple: 'Excluir regras',
            deleteSinglePrompt: 'Tem certeza de que deseja excluir esta regra?',
            deleteMultiplePrompt: 'Tem certeza de que deseja excluir estas regras?',
        },
    },
    preferencesPage: {
        appSection: {
            title: 'Preferências do app',
        },
        testSection: {
            title: 'Preferências de teste',
            subtitle: 'Configurações para ajudar a depurar e testar o app em staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Receba atualizações relevantes de recursos e notícias da Expensify',
        muteAllSounds: 'Silenciar todos os sons do Expensify',
    },
    priorityModePage: {
        priorityMode: 'Modo prioritário',
        explainerText: 'Escolha se deseja #focar apenas em chats não lidos e fixados ou mostrar tudo, com os chats mais recentes e fixados no topo.',
        priorityModes: {
            default: {
                label: 'Mais recente',
                description: 'Mostrar todos os chats ordenados por mais recentes',
            },
            gsd: {
                label: '#foco',
                description: 'Mostrar apenas não lidas em ordem alfabética',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `em ${policyName}`,
        generatingPDF: 'Gerando PDF...',
        waitForPDF: 'Aguarde enquanto geramos o PDF.',
        errorPDF: 'Ocorreu um erro ao tentar gerar seu PDF.',
        successPDF: 'Seu PDF foi gerado! Se ele não foi baixado automaticamente, use o botão abaixo.',
    },
    reportDescriptionPage: {
        roomDescription: 'Descrição do quarto',
        roomDescriptionOptional: 'Descrição da sala (opcional)',
        explainerText: 'Definir uma descrição personalizada para a sala.',
    },
    groupChat: {
        lastMemberTitle: 'Atenção!',
        lastMemberWarning: 'Como você é a última pessoa aqui, sair tornará este chat inacessível para todos os membros. Tem certeza de que deseja sair?',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `Chat em grupo de ${displayName}`,
    },
    languagePage: {
        language: 'Idioma',
        aiGenerated: 'As traduções para este idioma são geradas automaticamente e podem conter erros.',
    },
    themePage: {
        theme: 'Tema',
        themes: {
            dark: {
                label: 'Escuro',
            },
            light: {
                label: 'Claro',
            },
            system: {
                label: 'Usar configurações do dispositivo',
            },
        },
        chooseThemeBelowOrSync: 'Escolha um tema abaixo ou sincronize com as configurações do seu dispositivo.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>Ao fazer login, você concorda com os <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Termos de Serviço</a> e com a <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacidade</a>.</muted-text-xs>`,
        license: `<muted-text-xs>A transmissão de dinheiro é fornecida por ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) de acordo com suas <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenças</a>.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Não recebeu um código mágico?',
        enterAuthenticatorCode: 'Insira seu código do autenticador',
        enterRecoveryCode: 'Insira seu código de recuperação',
        requiredWhen2FAEnabled: 'Obrigatório quando a autenticação em duas etapas estiver ativada',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Solicitar um novo código em <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Solicitar um novo código',
        error: {
            pleaseFillMagicCode: 'Insira seu código mágico',
            incorrectMagicCode: 'Código mágico incorreto ou inválido. Tente novamente ou solicite um novo código.',
            pleaseFillTwoFactorAuth: 'Insira seu código de autenticação em duas etapas',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Preencha todos os campos',
        pleaseFillPassword: 'Insira sua senha',
        pleaseFillTwoFactorAuth: 'Insira seu código de autenticação em duas etapas',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Insira seu código de autenticação em duas etapas para continuar',
        forgot: 'Esqueceu?',
        requiredWhen2FAEnabled: 'Obrigatório quando a autenticação em duas etapas estiver ativada',
        error: {
            incorrectPassword: 'Senha incorreta. Tente novamente.',
            incorrectLoginOrPassword: 'Login ou senha incorretos. Tente novamente.',
            incorrect2fa: 'Código de autenticação em duas etapas incorreto. Tente novamente.',
            twoFactorAuthenticationEnabled: 'Você ativou a autenticação em duas etapas (2FA) nesta conta. Acesse usando seu e-mail ou número de telefone.',
            invalidLoginOrPassword: 'Login ou senha inválidos. Tente novamente ou redefina sua senha.',
            unableToResetPassword:
                'Não foi possível alterar sua senha. Isso provavelmente ocorreu devido a um link de redefinição de senha expirado em um e-mail antigo de redefinição de senha. Enviamos um novo link por e-mail para que você tente novamente. Verifique sua caixa de entrada e a pasta de spam; ele deve chegar em apenas alguns minutos.',
            noAccess: 'Você não tem acesso a este aplicativo. Adicione seu nome de usuário do GitHub para obter acesso.',
            accountLocked: 'Sua conta foi bloqueada após muitas tentativas malsucedidas. Tente novamente após 1 hora.',
            fallback: 'Algo deu errado. Tente novamente mais tarde.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefone ou e-mail',
        error: {
            invalidFormatEmailLogin: 'O e-mail inserido é inválido. Corrija o formato e tente novamente.',
        },
        cannotGetAccountDetails: 'Não foi possível recuperar os detalhes da conta. Tente entrar novamente.',
        loginForm: 'Formulário de login',
        notYou: ({user}: NotYouParams) => `Não é ${user}?`,
    },
    onboarding: {
        welcome: 'Bem-vindo!',
        welcomeSignOffTitleManageTeam: 'Assim que você concluir as tarefas acima, poderemos explorar mais funcionalidades, como fluxos de aprovação e regras!',
        welcomeSignOffTitle: 'É ótimo conhecer você!',
        explanationModal: {
            title: 'Bem-vindo ao Expensify',
            description: 'Um app para gerenciar seus gastos empresariais e pessoais na velocidade de um chat. Experimente e nos conte o que você achou. Muito mais vem por aí!',
            secondaryDescription: 'Para voltar para o Expensify Classic, basta tocar na sua foto de perfil > Ir para Expensify Classic.',
        },
        getStarted: 'Começar',
        whatsYourName: 'Qual é o seu nome?',
        peopleYouMayKnow: 'Pessoas que você talvez conheça já estão aqui! Verifique seu e-mail para se juntar a elas.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Alguém de ${domain} já criou um workspace. Insira o código mágico enviado para ${email}.`,
        joinAWorkspace: 'Entrar em um workspace',
        listOfWorkspaces: 'Aqui está a lista de espaços de trabalho que você pode entrar. Não se preocupe, você sempre poderá entrar neles mais tarde, se preferir.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} membro${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Onde você trabalha?',
        errorSelection: 'Selecione uma opção para seguir em frente',
        purpose: {
            title: 'O que você quer fazer hoje?',
            errorContinue: 'Pressione Continuar para concluir a configuração',
            errorBackButton: 'Conclua as perguntas de configuração para começar a usar o aplicativo',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Ser reembolsado pelo meu empregador',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Gerenciar as despesas da minha equipe',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Acompanhe e faça o orçamento de despesas',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Converse e divida despesas com amigos',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Algo mais',
        },
        employees: {
            title: 'Quantos funcionários você tem?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1 a 10 funcionários',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11 a 50 funcionários',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51–100 funcionários',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101–1.000 funcionários',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Mais de 1.000 funcionários',
        },
        accounting: {
            title: 'Você usa algum software de contabilidade?',
            none: 'Nenhum',
        },
        interestedFeatures: {
            title: 'Quais recursos interessam a você?',
            featuresAlreadyEnabled: 'Aqui estão nossos recursos mais populares:',
            featureYouMayBeInterestedIn: 'Ativar recursos adicionais:',
        },
        error: {
            requiredFirstName: 'Insira seu primeiro nome para continuar',
        },
        workEmail: {
            title: 'Qual é o seu e-mail de trabalho?',
            subtitle: 'O Expensify funciona melhor quando você conecta seu e-mail de trabalho.',
            explanationModal: {
                descriptionOne: 'Encaminhar para receipts@expensify.com para digitalização',
                descriptionTwo: 'Junte-se aos seus colegas que já usam o Expensify',
                descriptionThree: 'Aproveite uma experiência mais personalizada',
            },
            addWorkEmail: 'Adicionar e-mail de trabalho',
        },
        workEmailValidation: {
            title: 'Verifique seu e-mail de trabalho',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Insira o código mágico enviado para ${workEmail}. Ele deve chegar em um ou dois minutos.`,
        },
        workEmailValidationError: {
            publicEmail: 'Insira um e-mail de trabalho válido de um domínio privado, por exemplo: mitch@company.com',
            offline: 'Não foi possível adicionar seu e-mail de trabalho, pois parece que você está offline',
        },
        mergeBlockScreen: {
            title: 'Não foi possível adicionar o e-mail de trabalho',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Não foi possível adicionar ${workEmail}. Tente novamente mais tarde em Configurações ou fale com a Concierge para obter orientação.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Faça um [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[Faça um rápido tour pelo produto](${testDriveURL}) para ver por que o Expensify é a maneira mais rápida de fazer suas despesas.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Faça um [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `Faça um [test drive](${testDriveURL}) conosco e garanta para sua equipe *3 meses grátis de Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Adicionar aprovações de despesas',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Adicione aprovações de despesas* para revisar os gastos da sua equipe e mantê-los sob controle.

                        Veja como:

                        1. Vá para *Espaços de trabalho*.
                        2. Selecione seu espaço de trabalho.
                        3. Clique em *Mais recursos*.
                        4. Ative *Workflows*.
                        5. Acesse *Workflows* no editor do espaço de trabalho.
                        6. Ative *Approvals*.
                        7. Você será definido como o aprovador de despesas. Você pode alterar isso para qualquer administrador depois de convidar sua equipe.

                        [Leve-me para mais recursos](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Crie](${workspaceConfirmationLink}) um workspace`,
                description: 'Crie um workspace e configure as definições com a ajuda do seu especialista de configuração!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Criar um [espaço de trabalho](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Crie um workspace* para controlar despesas, digitalizar recibos, conversar e muito mais.

                        1. Clique em *Workspaces* > *Novo workspace*.

                        *Seu novo workspace está pronto!* [Confira](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Configurar [categorias](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Configure categorias* para que sua equipe possa classificar despesas para relatórios fáceis.

                        1. Clique em *Workspaces*.
                        2. Selecione seu workspace.
                        3. Clique em *Categories*.
                        4. Desative quaisquer categorias de que você não precise.
                        5. Adicione suas próprias categorias no canto superior direito.

                        [Leve-me para as configurações de categorias do workspace](${workspaceCategoriesLink}).

                        ![Configure categorias](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Enviar uma despesa',
                description: dedent(`
                    *Envie uma despesa* inserindo um valor ou digitalizando um recibo.

                    1. Clique no botão ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Escolha *Criar despesa*.
                    3. Insira um valor ou escaneie um recibo.
                    4. Adicione o e-mail ou número de telefone do seu chefe.
                    5. Clique em *Criar*.

                    E pronto!
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Enviar uma despesa',
                description: dedent(`
                    *Envie uma despesa* digitando um valor ou escaneando um recibo.

                    1. Clique no botão ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Escolha *Criar despesa*.
                    3. Insira um valor ou escaneie um recibo.
                    4. Confirme os detalhes.
                    5. Clique em *Criar*.

                    E pronto!
                `),
            },
            trackExpenseTask: {
                title: 'Rastrear uma despesa',
                description: dedent(`
                    *Acompanhe uma despesa* em qualquer moeda, com ou sem recibo.

                    1. Clique no botão ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Escolha *Criar despesa*.
                    3. Insira um valor ou escaneie um recibo.
                    4. Escolha seu espaço *pessoal*.
                    5. Clique em *Criar*.

                    E pronto! Sim, é simples assim.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Conectar${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'para'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'seu' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Conecte ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'seu' : 'para'} ${integrationName} para categorização automática de despesas e sincronização que tornam o fechamento de fim de mês muito mais fácil.

                        1. Clique em *Workspaces*.
                        2. Selecione seu workspace.
                        3. Clique em *Accounting*.
                        4. Encontre ${integrationName}.
                        5. Clique em *Connect*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? `[Leve-me para a contabilidade](${workspaceAccountingLink}).

                        ![Conectar a ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
        : `[Levar-me para a contabilidade](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Conecte [seus cartões corporativos](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Conecte os cartões que você já possui para importação automática de transações, correspondência de recibos e conciliação.

                        1. Clique em *Espaços de trabalho*.
                        2. Selecione seu espaço de trabalho.
                        3. Clique em *Cartões da empresa*.
                        4. Siga as instruções para conectar seus cartões.

                        [Leve-me aos cartões da empresa](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Convide [sua equipe](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Convide sua equipe* para o Expensify para que eles possam começar a registrar despesas hoje.

                        1. Clique em *Workspaces*.
                        2. Selecione seu workspace.
                        3. Clique em *Members* > *Invite member*.
                        4. Insira e-mails ou números de telefone.
                        5. Adicione uma mensagem de convite personalizada, se quiser!

                        [Leve-me aos membros do workspace](${workspaceMembersLink}).

                        ![Convide sua equipe](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Configurar [categorias](${workspaceCategoriesLink}) e [tags](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Configure categorias e tags* para que sua equipe possa classificar despesas para facilitar os relatórios.

                        Importe-as automaticamente [conectando seu software de contabilidade](${workspaceAccountingLink}) ou configure-as manualmente nas [configurações do seu workspace](${workspaceCategoriesLink}).`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Configurar [tags](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Use tags para adicionar detalhes extras às despesas, como projetos, clientes, locais e departamentos. Se você precisar de vários níveis de tags, poderá fazer upgrade para o plano Control.

                        1. Clique em *Workspaces*.
                        2. Selecione seu workspace.
                        3. Clique em *More features*.
                        4. Ative *Tags*.
                        5. Vá para *Tags* no editor do workspace.
                        6. Clique em *+ Add tag* para criar a sua própria.

                        [Leve-me para mais recursos](${workspaceMoreFeaturesLink}).

                        ![Configure tags](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Convide seu [contador](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Convide seu contador* para colaborar no seu workspace e gerenciar as despesas da sua empresa.

                        1. Clique em *Workspaces*.
                        2. Selecione seu workspace.
                        3. Clique em *Members*.
                        4. Clique em *Invite member*.
                        5. Insira o endereço de e-mail do seu contador.

                        [Convide seu contador agora](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Iniciar um chat',
                description: dedent(`
                    *Inicie um chat* com qualquer pessoa usando o e-mail ou número de telefone dela.

                    1. Clique no botão ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Escolha *Iniciar chat*.
                    3. Insira um e-mail ou número de telefone.

                    Se ela ainda não estiver usando o Expensify, será convidada automaticamente.

                    Todo chat também se tornará um e-mail ou SMS ao qual ela poderá responder diretamente.
                `),
            },
            splitExpenseTask: {
                title: 'Dividir uma despesa',
                description: dedent(`
                    *Divida despesas* com uma ou mais pessoas.

                    1. Clique no botão ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Escolha *Iniciar chat*.
                    3. Insira e-mails ou números de telefone.
                    4. Clique no botão cinza *+* no chat > *Dividir despesa*.
                    5. Crie a despesa selecionando *Manual*, *Scanner* ou *Distância*.

                    Fique à vontade para adicionar mais detalhes, se quiser, ou simplesmente enviar. Vamos fazer você receber seu reembolso!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Revise suas [configurações do workspace](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        Veja como revisar e atualizar as configurações do seu workspace:
                        1. Clique em Workspaces.
                        2. Selecione seu workspace.
                        3. Revise e atualize suas configurações.
                        [Ir para o seu workspace.](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: 'Crie seu primeiro relatório',
                description: dedent(`
                    Veja como criar um relatório:

                    1. Clique no botão ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Escolha *Criar relatório*.
                    3. Clique em *Adicionar despesa*.
                    4. Adicione sua primeira despesa.

                    E pronto!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Faça um [test drive](${testDriveURL})` : 'Faça um test drive'),
            embeddedDemoIframeTitle: 'Test Drive',
            employeeFakeReceipt: {
                description: 'Meu recibo de test drive!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Receber o reembolso é tão fácil quanto enviar uma mensagem. Vamos ver o básico.',
            onboardingPersonalSpendMessage: 'Veja como controlar seus gastos em poucos cliques.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Sua avaliação gratuita começou! Vamos fazer a sua configuração.
                        👋 Olá, eu sou o seu especialista de configuração do Expensify. Eu já criei um workspace para ajudar a gerenciar os recibos e despesas da sua equipe. Para aproveitar ao máximo a sua avaliação gratuita de 30 dias, basta seguir as etapas de configuração restantes abaixo!
                    `)
                    : dedent(`
                        # Sua avaliação gratuita começou! Vamos fazer a configuração.

                        👋 Olá, sou o seu especialista de configuração da Expensify. Agora que você criou um workspace, aproveite ao máximo seus 30 dias de avaliação gratuita seguindo as etapas abaixo!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Vamos configurar tudo para você\n👋 Olá, sou o seu especialista de configuração da Expensify. Já criei um workspace para ajudar a gerenciar seus recibos e despesas. Para aproveitar ao máximo seu teste grátis de 30 dias, basta seguir as etapas de configuração restantes abaixo!',
            onboardingChatSplitMessage: 'Dividir contas com amigos é tão fácil quanto enviar uma mensagem. Veja como.',
            onboardingAdminMessage: 'Aprenda a gerenciar o espaço de trabalho da sua equipe como administrador e a enviar suas próprias despesas.',
            onboardingLookingAroundMessage:
                'A Expensify é mais conhecida por gerenciamento de despesas, viagens e cartões corporativos, mas fazemos muito mais do que isso. Me diga no que você tem interesse e vou ajudar você a começar.',
            onboardingTestDriveReceiverMessage: '*Você ganhou 3 meses grátis! Comece abaixo.*',
        },
        workspace: {
            title: 'Mantenha-se organizado com um workspace',
            subtitle: 'Desbloqueie ferramentas poderosas para simplificar sua gestão de despesas, tudo em um só lugar. Com um workspace, você pode:',
            explanationModal: {
                descriptionOne: 'Acompanhe e organize recibos',
                descriptionTwo: 'Categorize e etiquete despesas',
                descriptionThree: 'Criar e compartilhar relatórios',
            },
            price: 'Experimente gratuitamente por 30 dias e depois faça o upgrade por apenas <strong>US$5/usuário/mês</strong>.',
            createWorkspace: 'Criar workspace',
        },
        confirmWorkspace: {
            title: 'Confirmar workspace',
            subtitle: 'Crie um workspace para acompanhar recibos, reembolsar despesas, gerenciar viagens, criar relatórios e muito mais — tudo na velocidade de um chat.',
        },
        inviteMembers: {
            title: 'Convidar membros',
            subtitle: 'Adicione sua equipe ou convide seu contador. Quanto mais gente, melhor!',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Não mostrar isso novamente',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'O nome não pode conter as palavras Expensify ou Concierge',
            hasInvalidCharacter: 'O nome não pode conter vírgula ou ponto e vírgula',
            requiredFirstName: 'Nome não pode ficar em branco',
            cannotContainSpecialCharacters: 'O nome não pode conter caracteres especiais',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Qual é o seu nome legal?',
        enterDateOfBirth: 'Qual é a sua data de nascimento?',
        enterAddress: 'Qual é o seu endereço?',
        enterPhoneNumber: 'Qual é o seu número de telefone?',
        personalDetails: 'Detalhes pessoais',
        privateDataMessage: 'Esses detalhes são usados para viagens e pagamentos. Eles nunca são exibidos no seu perfil público.',
        legalName: 'Nome legal',
        legalFirstName: 'Primeiro nome legal',
        legalLastName: 'Sobrenome legal',
        address: 'Endereço',
        error: {
            dateShouldBeBefore: (dateString: string) => `A data deve ser anterior a ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `A data deve ser posterior a ${dateString}`,
            hasInvalidCharacter: 'O nome pode incluir apenas caracteres latinos',
            incorrectZipFormat: (zipFormat?: string) => `Formato de CEP incorreto${zipFormat ? `Formato aceitável: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Certifique-se de que o número de telefone é válido (por exemplo, ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'O link foi reenviado',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) => `Enviei um link mágico de acesso para ${login}. Verifique seu ${loginType} para entrar.`,
        resendLink: 'Reenviar link',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) => `Para validar ${secondaryLogin}, reenvie o código mágico nas Configurações da Conta de ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Se você não tiver mais acesso a ${primaryLogin}, desvincule suas contas.`,
        unlink: 'Desvincular',
        linkSent: 'Link enviado!',
        successfullyUnlinkedLogin: 'Login secundário desvinculado com sucesso!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Nosso provedor de e-mail suspendeu temporariamente os e-mails para ${login} devido a problemas de entrega. Para desbloquear seu login, siga estas etapas:`,
        confirmThat: (login: string) =>
            `<strong>Confirme que ${login} está escrito corretamente e é um endereço de e-mail real e utilizável.</strong> Apelidos de e-mail como "expenses@domain.com" devem ter acesso à própria caixa de entrada de e-mail para que sejam um login Expensify válido.`,
        ensureYourEmailClient: `<strong>Certifique-se de que seu cliente de e-mail permita e-mails do domínio expensify.com.</strong> Você pode encontrar instruções sobre como concluir esta etapa <a href="${CONST.SET_NOTIFICATION_LINK}">aqui</a>, mas talvez precise da ajuda do seu departamento de TI para configurar as configurações de e-mail.`,
        onceTheAbove: `Depois que as etapas acima forem concluídas, entre em contato com <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> para desbloquear seu login.`,
    },
    openAppFailureModal: {
        title: 'Algo deu errado...',
        subtitle: `Não foi possível carregar todos os seus dados. Fomos notificados e estamos analisando o problema. Se isso persistir, entre em contato com`,
        refreshAndTryAgain: 'Atualize e tente novamente',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Não conseguimos entregar mensagens SMS para ${login}, então o suspendemos temporariamente. Tente validar seu número:`,
        validationSuccess: 'Seu número foi validado! Clique abaixo para enviar um novo código mágico de acesso.',
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
                return 'Por favor, aguarde um momento antes de tentar novamente.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? 'dia' : 'dias'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? 'hora' : 'horas'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? 'minuto' : 'minutos'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `Segure firme! Você precisa esperar ${timeText} antes de tentar validar seu número novamente.`;
        },
    },
    welcomeSignUpForm: {
        join: 'Participar',
    },
    detailsPage: {
        localTime: 'Hora local',
    },
    newChatPage: {
        startGroup: 'Iniciar grupo',
        addToGroup: 'Adicionar ao grupo',
    },
    yearPickerPage: {
        year: 'Ano',
        selectYear: 'Selecione um ano',
    },
    focusModeUpdateModal: {
        title: 'Bem-vindo ao modo #focus!',
        prompt: (priorityModePageUrl: string) =>
            `Mantenha-se em dia vendo apenas os chats não lidos ou os chats que precisam da sua atenção. Não se preocupe, você pode alterar isso a qualquer momento em <a href="${priorityModePageUrl}">configurações</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'O chat que você está procurando não pode ser encontrado.',
        getMeOutOfHere: 'Tire-me daqui',
        iouReportNotFound: 'Os detalhes de pagamento que você está procurando não podem ser encontrados.',
        notHere: 'Hmm... não está aqui',
        pageNotFound: 'Opa, esta página não pode ser encontrada',
        noAccess: 'Este chat ou despesa pode ter sido excluído ou você não tem acesso a ele.\n\nPara qualquer dúvida, entre em contato com concierge@expensify.com',
        goBackHome: 'Voltar para a página inicial',
        commentYouLookingForCannotBeFound: 'O comentário que você está procurando não foi encontrado.',
        goToChatInstead: 'Vá para o chat em vez disso.',
        contactConcierge: 'Para qualquer dúvida, entre em contato com concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ops... ${isBreakLine ? '\n' : ''}Algo deu errado`,
        subtitle: 'Não foi possível concluir sua solicitação. Tente novamente mais tarde.',
        wrongTypeSubtitle: 'Essa pesquisa não é válida. Tente ajustar seus critérios de pesquisa.',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Adicione um emoji para que seus colegas e amigos saibam facilmente o que está acontecendo. Você também pode adicionar uma mensagem, se quiser!',
        today: 'Hoje',
        clearStatus: 'Limpar status',
        save: 'Salvar',
        message: 'Mensagem',
        timePeriods: {
            never: 'Nunca',
            thirtyMinutes: '30 minutos',
            oneHour: '1 hora',
            afterToday: 'Hoje',
            afterWeek: 'Uma semana',
            custom: 'Personalizado',
        },
        untilTomorrow: 'Até amanhã',
        untilTime: ({time}: UntilTimeParams) => `Até ${time}`,
        date: 'Data',
        time: 'Hora',
        clearAfter: 'Limpar após',
        whenClearStatus: 'Quando devemos limpar seu status?',
        vacationDelegate: 'Delegado de férias',
        setVacationDelegate: `Defina um delegado de férias para aprovar relatórios em seu nome enquanto você estiver fora do escritório.`,
        vacationDelegateError: 'Ocorreu um erro ao atualizar o seu delegado de férias.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `como representante de férias de ${nameOrEmail}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) =>
            `para ${submittedToName} como representante de férias de ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Você está atribuindo ${nameOrEmail} como seu delegado de férias. Eles ainda não estão em todos os seus espaços de trabalho. Se você escolher continuar, um e-mail será enviado a todos os administradores dos seus espaços de trabalho para que eles sejam adicionados.`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `Etapa ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Dados bancários',
        confirmBankInfo: 'Confirmar dados bancários',
        manuallyAdd: 'Adicionar sua conta bancária manualmente',
        letsDoubleCheck: 'Vamos conferir se está tudo certo.',
        accountEnding: 'Conta terminando em',
        thisBankAccount: 'Esta conta bancária será usada para pagamentos comerciais no seu workspace',
        accountNumber: 'Número da conta',
        routingNumber: 'Número de roteamento',
        chooseAnAccountBelow: 'Escolha uma conta abaixo',
        addBankAccount: 'Adicionar conta bancária',
        chooseAnAccount: 'Escolher uma conta',
        connectOnlineWithPlaid: 'Faça login no seu banco',
        connectManually: 'Conectar manualmente',
        desktopConnection: 'Observação: Para se conectar com Chase, Wells Fargo, Capital One ou Bank of America, clique aqui para concluir este processo em um navegador.',
        yourDataIsSecure: 'Seus dados estão seguros',
        toGetStarted: 'Adicione uma conta bancária para reembolsar despesas, emitir Cartões Expensify, receber pagamentos de faturas e pagar contas, tudo em um só lugar.',
        plaidBodyCopy: 'Dê aos seus funcionários uma maneira mais fácil de pagar — e serem reembolsados — por despesas da empresa.',
        checkHelpLine: 'Seu número de roteamento e o número da conta podem ser encontrados em um cheque dessa conta.',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `Para conectar uma conta bancária, por favor, <a href="${contactMethodRoute}">adicione um e-mail como seu login principal</a> e tente novamente. Você pode adicionar seu número de telefone como login secundário.`,
        hasBeenThrottledError: 'Ocorreu um erro ao adicionar sua conta bancária. Aguarde alguns minutos e tente novamente.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Ops! Parece que a moeda do seu workspace está definida como uma moeda diferente de USD. Para continuar, acesse as <a href="${workspaceRoute}">configurações do seu workspace</a> para defini-la como USD e tente novamente.`,
        bbaAdded: 'Conta bancária empresarial adicionada!',
        bbaAddedDescription: 'Está pronto para ser usado para pagamentos.',
        error: {
            youNeedToSelectAnOption: 'Selecione uma opção para continuar',
            noBankAccountAvailable: 'Desculpe, não há nenhuma conta bancária disponível',
            noBankAccountSelected: 'Por favor, escolha uma conta',
            taxID: 'Insira um número de identificação fiscal válido',
            website: 'Insira um site válido',
            zipCode: `Insira um CEP válido usando o formato: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Insira um número de telefone válido',
            email: 'Insira um endereço de e-mail válido',
            companyName: 'Insira um nome comercial válido',
            addressCity: 'Insira uma cidade válida',
            addressStreet: 'Insira um endereço de rua válido',
            addressState: 'Selecione um estado válido',
            incorporationDateFuture: 'A data de constituição não pode estar no futuro',
            incorporationState: 'Selecione um estado válido',
            industryCode: 'Insira um código de classificação de indústria válido com seis dígitos',
            restrictedBusiness: 'Confirme que a empresa não está na lista de empresas restritas',
            routingNumber: 'Insira um número de roteamento válido',
            accountNumber: 'Insira um número de conta válido',
            routingAndAccountNumberCannotBeSame: 'Os números de roteamento e de conta não podem coincidir',
            companyType: 'Selecione um tipo de empresa válido',
            tooManyAttempts: 'Devido a um número elevado de tentativas de login, esta opção foi desativada por 24 horas. Tente novamente mais tarde ou insira os dados manualmente.',
            address: 'Insira um endereço válido',
            dob: 'Selecione uma data de nascimento válida',
            age: 'Deve ter mais de 18 anos',
            ssnLast4: 'Insira os últimos 4 dígitos válidos do SSN',
            firstName: 'Insira um nome próprio válido',
            lastName: 'Insira um sobrenome válido',
            noDefaultDepositAccountOrDebitCardAvailable: 'Adicione uma conta de depósito padrão ou cartão de débito',
            validationAmounts: 'Os valores de validação que você inseriu estão incorretos. Verifique novamente seu extrato bancário e tente outra vez.',
            fullName: 'Insira um nome completo válido',
            ownershipPercentage: 'Insira um número de porcentagem válido',
            deletePaymentBankAccount:
                'Esta conta bancária não pode ser excluída porque é usada para pagamentos do Expensify Card. Se ainda quiser excluir esta conta, entre em contato com a Concierge.',
            sameDepositAndWithdrawalAccount: 'As contas de depósito e de saque são as mesmas.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Onde sua conta bancária está localizada?',
        accountDetailsStepHeader: 'Quais são os detalhes da sua conta?',
        accountTypeStepHeader: 'Que tipo de conta é esta?',
        bankInformationStepHeader: 'Quais são os seus dados bancários?',
        accountHolderInformationStepHeader: 'Quais são os dados do titular da conta?',
        howDoWeProtectYourData: 'Como protegemos seus dados?',
        currencyHeader: 'Qual é a moeda da sua conta bancária?',
        confirmationStepHeader: 'Verifique suas informações.',
        confirmationStepSubHeader: 'Verifique os detalhes abaixo e marque a caixa de termos para confirmar.',
        toGetStarted: 'Adicione uma conta bancária pessoal para receber reembolsos, pagar faturas ou ativar a Carteira Expensify.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Digite a senha do Expensify',
        alreadyAdded: 'Esta conta já foi adicionada.',
        chooseAccountLabel: 'Conta',
        successTitle: 'Conta bancária pessoal adicionada!',
        successMessage: 'Parabéns, sua conta bancária está configurada e pronta para receber reembolsos.',
    },
    attachmentView: {
        unknownFilename: 'Nome de arquivo desconhecido',
        passwordRequired: 'Por favor, insira uma senha',
        passwordIncorrect: 'Senha incorreta. Tente novamente.',
        failedToLoadPDF: 'Falha ao carregar o arquivo PDF',
        pdfPasswordForm: {
            title: 'PDF protegido por senha',
            infoText: 'Este PDF está protegido por senha.',
            beforeLinkText: 'Por favor',
            linkText: 'digite a senha',
            afterLinkText: 'para visualizá-lo.',
            formLabel: 'Ver PDF',
        },
        attachmentNotFound: 'Anexo não encontrado',
        retry: 'Tentar novamente',
    },
    messages: {
        errorMessageInvalidPhone: `Insira um número de telefone válido sem parênteses ou traços. Se você estiver fora dos EUA, inclua o código do seu país (por exemplo, ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'E-mail inválido',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} já é membro de ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} já é um administrador de ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Ao prosseguir com o pedido para ativar sua Carteira Expensify, você confirma que leu, compreende e aceita',
        facialScan: 'Política e Autorização de Varredura Facial da Onfido',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Política e Autorização de Varredura Facial da Onfido</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Privacidade</a> e <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Termos de Serviço</a>.</muted-text-micro>`,
        tryAgain: 'Tentar novamente',
        verifyIdentity: 'Verificar identidade',
        letsVerifyIdentity: 'Vamos verificar sua identidade',
        butFirst: `Mas antes, a parte chata. Leia os termos legais na próxima etapa e clique em "Aceitar" quando estiver pronto.`,
        genericError: 'Ocorreu um erro ao processar esta etapa. Tente novamente.',
        cameraPermissionsNotGranted: 'Ativar acesso à câmera',
        cameraRequestMessage: 'Precisamos de acesso à sua câmera para concluir a verificação da conta bancária. Ative em Ajustes > New Expensify.',
        microphonePermissionsNotGranted: 'Ativar acesso ao microfone',
        microphoneRequestMessage: 'Precisamos de acesso ao seu microfone para concluir a verificação da conta bancária. Ative em Ajustes > New Expensify.',
        originalDocumentNeeded: 'Faça upload de uma imagem original do seu documento de identidade, em vez de uma captura de tela ou imagem digitalizada.',
        documentNeedsBetterQuality:
            'Seu documento de identidade parece estar danificado ou com recursos de segurança ausentes. Envie uma imagem original de um documento de identidade sem danos que esteja totalmente visível.',
        imageNeedsBetterQuality: 'Há um problema com a qualidade da imagem do seu documento de identidade. Envie uma nova imagem em que todo o seu documento possa ser visto com clareza.',
        selfieIssue: 'Há um problema com sua selfie/vídeo. Faça o upload de uma selfie/vídeo ao vivo.',
        selfieNotMatching: 'Sua selfie/vídeo não corresponde ao seu documento de identidade. Envie uma nova selfie/vídeo em que seu rosto possa ser visto com clareza.',
        selfieNotLive: 'Sua selfie/vídeo não parece ser uma foto/vídeo ao vivo. Envie uma selfie/vídeo ao vivo.',
    },
    additionalDetailsStep: {
        headerTitle: 'Detalhes adicionais',
        helpText: 'Precisamos confirmar as seguintes informações antes que você possa enviar e receber dinheiro da sua carteira.',
        helpTextIdologyQuestions: 'Precisamos fazer apenas mais algumas perguntas para concluir a validação da sua identidade.',
        helpLink: 'Saiba mais sobre por que precisamos disso.',
        legalFirstNameLabel: 'Primeiro nome legal',
        legalMiddleNameLabel: 'Nome do meio legal',
        legalLastNameLabel: 'Sobrenome legal',
        selectAnswer: 'Selecione uma resposta para continuar',
        ssnFull9Error: 'Insira um SSN de nove dígitos válido',
        needSSNFull9: 'Estamos com dificuldades para verificar seu SSN. Insira os nove dígitos completos do seu SSN.',
        weCouldNotVerify: 'Não foi possível verificar',
        pleaseFixIt: 'Corrija estas informações antes de continuar',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Não foi possível verificar sua identidade. Tente novamente mais tarde ou entre em contato com <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> se tiver alguma dúvida.`,
    },
    termsStep: {
        headerTitle: 'Termos e taxas',
        headerTitleRefactor: 'Taxas e termos',
        haveReadAndAgreePlain: 'Li e concordo em receber divulgações eletrônicas.',
        haveReadAndAgree: `Li e concordo em receber <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">divulgações eletrônicas</a>.`,
        agreeToThePlain: 'Eu concordo com o Acordo de Privacidade e Carteira.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Eu concordo com a <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Política de Privacidade</a> e o <a href="${walletAgreementUrl}">Contrato da Carteira</a>.`,
        enablePayments: 'Ativar pagamentos',
        monthlyFee: 'Taxa mensal',
        inactivity: 'Inatividade',
        noOverdraftOrCredit: 'Sem recurso de cheque especial/crédito.',
        electronicFundsWithdrawal: 'Retirada de fundos eletrônica',
        standard: 'Padrão',
        reviewTheFees: 'Dê uma olhada em algumas taxas.',
        checkTheBoxes: 'Marque as caixas abaixo.',
        agreeToTerms: 'Concorde com os termos e você estará pronto para começar!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `A Wallet Expensify é emitida por ${walletProgram}.`,
            perPurchase: 'Por compra',
            atmWithdrawal: 'Saque em caixa eletrônico',
            cashReload: 'Recarga em dinheiro',
            inNetwork: 'Na rede credenciada',
            outOfNetwork: 'fora da rede',
            atmBalanceInquiry: 'Consulta de saldo em caixa eletrônico (dentro ou fora da rede)',
            customerService: 'Atendimento ao cliente (automatizado ou agente ao vivo)',
            inactivityAfterTwelveMonths: 'Inatividade (após 12 meses sem transações)',
            weChargeOneFee: 'Cobramos 1 outro tipo de taxa. É:',
            fdicInsurance: 'Seus fundos são elegíveis para seguro FDIC.',
            generalInfo: `Para obter informações gerais sobre contas pré-pagas, visite <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Para detalhes e condições de todas as tarifas e serviços, visite <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> ou ligue para +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Retirada de fundos eletrônica (instantânea)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(mín. ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Uma lista de todas as taxas da Expensify Wallet',
            typeOfFeeHeader: 'Todas as tarifas',
            feeAmountHeader: 'Valor',
            moreDetailsHeader: 'Detalhes',
            openingAccountTitle: 'Abertura de conta',
            openingAccountDetails: 'Não há taxa para abrir uma conta.',
            monthlyFeeDetails: 'Não há taxa mensal.',
            customerServiceTitle: 'Atendimento ao cliente',
            customerServiceDetails: 'Não há taxas de atendimento ao cliente.',
            inactivityDetails: 'Não há taxa de inatividade.',
            sendingFundsTitle: 'Enviando fundos para outro titular de conta',
            sendingFundsDetails: 'Não há tarifa para enviar fundos para outro titular de conta usando seu saldo, conta bancária ou cartão de débito.',
            electronicFundsStandardDetails:
                'Não há taxa para transferir fundos da sua Expensify Wallet para a sua conta bancária usando a opção padrão. Essa transferência geralmente é concluída em 1 a 3 dias úteis.',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                'Há uma taxa para transferir fundos da sua Carteira Expensify para o seu cartão de débito vinculado usando a opção de transferência instantânea. Essa transferência geralmente é concluída em alguns minutos.' +
                `A taxa é de ${percentage}% do valor da transferência (com uma taxa mínima de ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Seus fundos são elegíveis para seguro do FDIC. Seus fundos serão mantidos em ou transferidos para ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, uma instituição segurada pelo FDIC.` +
                `Uma vez lá, seus fundos são assegurados em até ${amount} pelo FDIC caso o ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} venha a falhar, se requisitos específicos de seguro de depósito forem atendidos e seu cartão estiver registrado. Consulte ${CONST.TERMS.FDIC_PREPAID} para obter detalhes.`,
            contactExpensifyPayments: `Entre em contato com ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} ligando para +1 833-400-0904, por e-mail em ${CONST.EMAIL.CONCIERGE} ou acessando ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Para obter informações gerais sobre contas pré-pagas, visite ${CONST.TERMS.CFPB_PREPAID}. Se você tiver uma reclamação sobre uma conta pré-paga, ligue para o Consumer Financial Protection Bureau pelo número 1-855-411-2372 ou visite ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Ver versão para impressão',
            automated: 'Automatizado',
            liveAgent: 'Atendente ao vivo',
            instant: 'Instantâneo',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Mín. ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Ativar pagamentos',
        activatedTitle: 'Carteira ativada!',
        activatedMessage: 'Parabéns, sua carteira está configurada e pronta para fazer pagamentos.',
        checkBackLaterTitle: 'Só um minuto...',
        checkBackLaterMessage: 'Ainda estamos analisando suas informações. Por favor, tente novamente mais tarde.',
        continueToPayment: 'Continuar para o pagamento',
        continueToTransfer: 'Continuar transferência',
    },
    companyStep: {
        headerTitle: 'Informações da empresa',
        subtitle: 'Quase pronto! Por motivos de segurança, precisamos confirmar algumas informações:',
        legalBusinessName: 'Nome comercial legal',
        companyWebsite: 'Site da empresa',
        taxIDNumber: 'Número de identificação fiscal',
        taxIDNumberPlaceholder: '9 dígitos',
        companyType: 'Tipo de empresa',
        incorporationDate: 'Data de constituição',
        incorporationState: 'Estado de incorporação',
        industryClassificationCode: 'Código de classificação da indústria',
        confirmCompanyIsNot: 'Confirmo que esta empresa não está na',
        listOfRestrictedBusinesses: 'lista de empresas restritas',
        incorporationDatePlaceholder: 'Data de início (aaaa-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corporação',
            PARTNERSHIP: 'Parceria',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Empresa individual',
            OTHER: 'Outro',
        },
        industryClassification: 'Em qual setor a empresa está classificada?',
        industryClassificationCodePlaceholder: 'Buscar código de classificação da indústria',
    },
    requestorStep: {
        headerTitle: 'Informações pessoais',
        learnMore: 'Saiba mais',
        isMyDataSafe: 'Meus dados estão seguros?',
    },
    personalInfoStep: {
        personalInfo: 'Informações pessoais',
        enterYourLegalFirstAndLast: 'Qual é o seu nome legal?',
        legalFirstName: 'Primeiro nome legal',
        legalLastName: 'Sobrenome legal',
        legalName: 'Nome legal',
        enterYourDateOfBirth: 'Qual é a sua data de nascimento?',
        enterTheLast4: 'Quais são os últimos quatro dígitos do seu Número de Seguridade Social?',
        dontWorry: 'Não se preocupe, nós não fazemos nenhuma verificação de crédito pessoal!',
        last4SSN: 'Últimos 4 do SSN',
        enterYourAddress: 'Qual é o seu endereço?',
        address: 'Endereço',
        letsDoubleCheck: 'Vamos conferir se está tudo certo.',
        byAddingThisBankAccount: 'Ao adicionar esta conta bancária, você confirma que leu, compreendeu e aceitou',
        whatsYourLegalName: 'Qual é o seu nome legal?',
        whatsYourDOB: 'Qual é a sua data de nascimento?',
        whatsYourAddress: 'Qual é o seu endereço?',
        whatsYourSSN: 'Quais são os últimos quatro dígitos do seu Número de Seguridade Social?',
        noPersonalChecks: 'Não se preocupe, não fazemos análise de crédito pessoal aqui!',
        whatsYourPhoneNumber: 'Qual é o seu número de telefone?',
        weNeedThisToVerify: 'Precisamos disso para verificar sua carteira.',
    },
    businessInfoStep: {
        businessInfo: 'Informações da empresa',
        enterTheNameOfYourBusiness: 'Qual é o nome da sua empresa?',
        businessName: 'Nome jurídico da empresa',
        enterYourCompanyTaxIdNumber: 'Qual é o número de identificação fiscal da sua empresa?',
        taxIDNumber: 'Número de identificação fiscal',
        taxIDNumberPlaceholder: '9 dígitos',
        enterYourCompanyWebsite: 'Qual é o site da sua empresa?',
        companyWebsite: 'Site da empresa',
        enterYourCompanyPhoneNumber: 'Qual é o número de telefone da sua empresa?',
        enterYourCompanyAddress: 'Qual é o endereço da sua empresa?',
        selectYourCompanyType: 'Que tipo de empresa é?',
        companyType: 'Tipo de empresa',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corporação',
            PARTNERSHIP: 'Parceria',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Empresa individual',
            OTHER: 'Outro',
        },
        selectYourCompanyIncorporationDate: 'Qual é a data de constituição da sua empresa?',
        incorporationDate: 'Data de constituição',
        incorporationDatePlaceholder: 'Data de início (aaaa-mm-dd)',
        incorporationState: 'Estado de incorporação',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'Em qual estado sua empresa foi constituída?',
        letsDoubleCheck: 'Vamos conferir se está tudo certo.',
        companyAddress: 'Endereço da empresa',
        listOfRestrictedBusinesses: 'lista de empresas restritas',
        confirmCompanyIsNot: 'Confirmo que esta empresa não está na',
        businessInfoTitle: 'Informações comerciais',
        legalBusinessName: 'Nome comercial legal',
        whatsTheBusinessName: 'Qual é o nome da empresa?',
        whatsTheBusinessAddress: 'Qual é o endereço comercial?',
        whatsTheBusinessContactInformation: 'Quais são as informações de contato comercial?',
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return 'Qual é o Número de Registro da Empresa (CRN)?';
                default:
                    return 'Qual é o número de registro comercial?';
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'Qual é o Número de Identificação do Empregador (EIN)?';
                case CONST.COUNTRY.CA:
                    return 'O que é o Business Number (BN)?';
                case CONST.COUNTRY.GB:
                    return 'Qual é o número de registro de IVA (VRN)?';
                case CONST.COUNTRY.AU:
                    return 'Qual é o Australian Business Number (ABN)?';
                default:
                    return 'Qual é o número de IVA da UE?';
            }
        },
        whatsThisNumber: 'Que número é este?',
        whereWasTheBusinessIncorporated: 'Onde a empresa foi constituída?',
        whatTypeOfBusinessIsIt: 'Que tipo de empresa é?',
        whatsTheBusinessAnnualPayment: 'Qual é o volume anual de pagamentos da empresa?',
        whatsYourExpectedAverageReimbursements: 'Qual é o seu valor médio de reembolso esperado?',
        registrationNumber: 'Número de registro',
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
                    return 'IVA da UE';
            }
        },
        businessAddress: 'Endereço comercial',
        businessType: 'Tipo de empresa',
        incorporation: 'Incorporação',
        incorporationCountry: 'País de incorporação',
        incorporationTypeName: 'Tipo de constituição',
        businessCategory: 'Categoria de negócios',
        annualPaymentVolume: 'Volume anual de pagamento',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `Volume anual de pagamento em ${currencyCode}`,
        averageReimbursementAmount: 'Valor médio do reembolso',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `Valor médio de reembolso em ${currencyCode}`,
        selectIncorporationType: 'Selecione o tipo de incorporação',
        selectBusinessCategory: 'Selecionar categoria de negócios',
        selectAnnualPaymentVolume: 'Selecione o volume anual de pagamento',
        selectIncorporationCountry: 'Selecione o país de constituição',
        selectIncorporationState: 'Selecione o estado de incorporação',
        selectAverageReimbursement: 'Selecionar valor médio de reembolso',
        selectBusinessType: 'Selecionar tipo de empresa',
        findIncorporationType: 'Encontrar tipo de incorporação',
        findBusinessCategory: 'Encontrar categoria de negócios',
        findAnnualPaymentVolume: 'Encontrar volume anual de pagamentos',
        findIncorporationState: 'Encontrar estado de incorporação',
        findAverageReimbursement: 'Encontrar valor médio de reembolso',
        findBusinessType: 'Encontrar tipo de empresa',
        error: {
            registrationNumber: 'Forneça um número de registro válido',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Forneça um Número de Identificação do Empregador (EIN) válido';
                    case CONST.COUNTRY.CA:
                        return 'Forneça um Número de Empresa (BN) válido';
                    case CONST.COUNTRY.GB:
                        return 'Forneça um número de registro de IVA (VRN) válido';
                    case CONST.COUNTRY.AU:
                        return 'Forneça um Australian Business Number (ABN) válido';
                    default:
                        return 'Forneça um número de IVA da UE válido';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `Você possui 25% ou mais da ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `Algum indivíduo possui 25% ou mais de ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `Existem mais pessoas que possuam 25% ou mais de ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: 'A regulamentação exige que verifiquemos a identidade de qualquer indivíduo que possua mais de 25% do negócio.',
        companyOwner: 'Proprietário da empresa',
        enterLegalFirstAndLastName: 'Qual é o nome legal do proprietário?',
        legalFirstName: 'Primeiro nome legal',
        legalLastName: 'Sobrenome legal',
        enterTheDateOfBirthOfTheOwner: 'Qual é a data de nascimento do proprietário?',
        enterTheLast4: 'Quais são os últimos 4 dígitos do Número de Seguridade Social do titular?',
        last4SSN: 'Últimos 4 do SSN',
        dontWorry: 'Não se preocupe, nós não fazemos nenhuma verificação de crédito pessoal!',
        enterTheOwnersAddress: 'Qual é o endereço do proprietário?',
        letsDoubleCheck: 'Vamos conferir se está tudo certo.',
        legalName: 'Nome legal',
        address: 'Endereço',
        byAddingThisBankAccount: 'Ao adicionar esta conta bancária, você confirma que leu, compreendeu e aceitou',
        owners: 'Proprietários',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informações do proprietário',
        businessOwner: 'Proprietário da empresa',
        signerInfo: 'Informações do signatário',
        doYouOwn: (companyName: string) => `Você possui 25% ou mais da ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `Algum indivíduo possui 25% ou mais de ${companyName}?`,
        regulationsRequire: 'Regulamentos exigem que verifiquemos a identidade de qualquer indivíduo que possua mais de 25% do negócio.',
        legalFirstName: 'Primeiro nome legal',
        legalLastName: 'Sobrenome legal',
        whatsTheOwnersName: 'Qual é o nome legal do proprietário?',
        whatsYourName: 'Qual é o seu nome legal?',
        whatPercentage: 'Qual porcentagem do negócio pertence ao proprietário?',
        whatsYoursPercentage: 'Qual porcentagem do negócio você possui?',
        ownership: 'Propriedade',
        whatsTheOwnersDOB: 'Qual é a data de nascimento do proprietário?',
        whatsYourDOB: 'Qual é a sua data de nascimento?',
        whatsTheOwnersAddress: 'Qual é o endereço do proprietário?',
        whatsYourAddress: 'Qual é o seu endereço?',
        whatAreTheLast: 'Quais são os últimos 4 dígitos do Número de Seguridade Social do proprietário?',
        whatsYourLast: 'Quais são os últimos 4 dígitos do seu Número de Seguridade Social?',
        whatsYourNationality: 'Qual é o seu país de cidadania?',
        whatsTheOwnersNationality: 'Qual é o país de cidadania do proprietário?',
        countryOfCitizenship: 'País de cidadania',
        dontWorry: 'Não se preocupe, nós não fazemos nenhuma verificação de crédito pessoal!',
        last4: 'Últimos 4 do SSN',
        whyDoWeAsk: 'Por que pedimos isso?',
        letsDoubleCheck: 'Vamos conferir se está tudo certo.',
        legalName: 'Nome legal',
        ownershipPercentage: 'Percentual de participação',
        areThereOther: (companyName: string) => `Há outros indivíduos que possuem 25% ou mais de ${companyName}?`,
        owners: 'Proprietários',
        addCertified: 'Adicionar um organograma certificado que mostre os beneficiários finais',
        regulationRequiresChart:
            'A regulamentação exige que coletemos uma cópia certificada do organograma societário que mostre cada pessoa física ou jurídica que detenha 25% ou mais do negócio.',
        uploadEntity: 'Carregar organograma de propriedade da entidade',
        noteEntity: 'Observação: O organograma de propriedade da entidade deve ser assinado pelo seu contador, assessor jurídico ou reconhecido em cartório.',
        certified: 'Organograma de propriedade de entidade certificada',
        selectCountry: 'Selecionar país',
        findCountry: 'Encontrar país',
        address: 'Endereço',
        chooseFile: 'Escolher arquivo',
        uploadDocuments: 'Fazer upload de documentação adicional',
        pleaseUpload: 'Envie documentação adicional abaixo para nos ajudar a verificar sua identidade como proprietário direto ou indireto de 25% ou mais da entidade empresarial.',
        acceptedFiles: 'Formatos de arquivo aceitos: PDF, PNG, JPEG. O tamanho total do arquivo para cada seção não pode exceder 5 MB.',
        proofOfBeneficialOwner: 'Comprovante de beneficiário final',
        proofOfBeneficialOwnerDescription:
            'Forneça uma declaração assinada e um organograma emitidos por um contador público, tabelião ou advogado, verificando a titularidade de 25% ou mais do negócio. O documento deve estar datado dos últimos três meses e incluir o número de licença do signatário.',
        copyOfID: 'Cópia do documento de identidade do beneficiário final',
        copyOfIDDescription: 'Exemplos: Passaporte, carteira de motorista, etc.',
        proofOfAddress: 'Comprovante de endereço do beneficiário final',
        proofOfAddressDescription: 'Exemplos: Conta de serviços, contrato de aluguel, etc.',
        codiceFiscale: 'Codice fiscale/ID fiscal',
        codiceFiscaleDescription:
            'Carregue um vídeo de uma visita ao local ou de uma chamada gravada com o responsável pela assinatura. O responsável deve fornecer: nome completo, data de nascimento, nome da empresa, número de registro, número do código fiscal, endereço registrado, natureza do negócio e finalidade da conta.',
    },
    completeVerificationStep: {
        completeVerification: 'Concluir verificação',
        confirmAgreements: 'Confirme os contratos abaixo.',
        certifyTrueAndAccurate: 'Certifico que as informações fornecidas são verdadeiras e precisas',
        certifyTrueAndAccurateError: 'Por favor, confirme que as informações são verdadeiras e precisas',
        isAuthorizedToUseBankAccount: 'Estou autorizado a usar esta conta bancária empresarial para despesas comerciais',
        isAuthorizedToUseBankAccountError: 'Você deve ser um responsável controlador com autorização para operar a conta bancária da empresa',
        termsAndConditions: 'termos e condições',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Validar sua conta bancária',
        validateButtonText: 'Validar',
        validationInputLabel: 'Transação',
        maxAttemptsReached: 'A validação desta conta bancária foi desativada devido a muitas tentativas incorretas.',
        description: `Em 1 a 2 dias úteis, enviaremos três (3) pequenas transações para sua conta bancária com um nome como "Expensify, Inc. Validation".`,
        descriptionCTA: 'Insira o valor de cada transação nos campos abaixo. Exemplo: 1,51.',
        letsChatText: 'Quase lá! Precisamos da sua ajuda para verificar mais algumas informações pelo chat. Pronto?',
        enable2FATitle: 'Prevenha fraudes, ative a autenticação de dois fatores (2FA)',
        enable2FAText: 'Levamos sua segurança a sério. Configure a autenticação em duas etapas (2FA) agora para adicionar uma camada extra de proteção à sua conta.',
        secureYourAccount: 'Proteja sua conta',
    },
    countryStep: {
        confirmBusinessBank: 'Confirme a moeda e o país da conta bancária empresarial',
        confirmCurrency: 'Confirmar moeda e país',
        yourBusiness: 'A moeda da conta bancária da sua empresa deve corresponder à moeda do seu workspace.',
        youCanChange: 'Você pode alterar a moeda do seu workspace em seu',
        findCountry: 'Encontrar país',
        selectCountry: 'Selecionar país',
    },
    bankInfoStep: {
        whatAreYour: 'Quais são os dados da sua conta bancária empresarial?',
        letsDoubleCheck: 'Vamos conferir se está tudo certo.',
        thisBankAccount: 'Esta conta bancária será usada para pagamentos comerciais no seu workspace',
        accountNumber: 'Número da conta',
        accountHolderNameDescription: 'Nome completo do signatário autorizado',
    },
    signerInfoStep: {
        signerInfo: 'Informações do signatário',
        areYouDirector: (companyName: string) => `Você é diretor na ${companyName}?`,
        regulationRequiresUs: 'A regulamentação exige que verifiquemos se o signatário tem autoridade para tomar esta ação em nome da empresa.',
        whatsYourName: 'Qual é seu nome legal',
        fullName: 'Nome completo legal',
        whatsYourJobTitle: 'Qual é o seu cargo?',
        jobTitle: 'Cargo',
        whatsYourDOB: 'Qual é a sua data de nascimento?',
        uploadID: 'Enviar documento de identidade e comprovante de endereço',
        personalAddress: 'Comprovante de endereço residencial (por exemplo, conta de serviços públicos)',
        letsDoubleCheck: 'Vamos conferir se está tudo certo.',
        legalName: 'Nome legal',
        proofOf: 'Comprovante de endereço residencial',
        enterOneEmail: (companyName: string) => `Insira o e-mail de um diretor em ${companyName}`,
        regulationRequiresOneMoreDirector: 'A regulamentação exige pelo menos mais um diretor como signatário.',
        hangTight: 'Aguarde um instante...',
        enterTwoEmails: (companyName: string) => `Insira os e-mails de dois diretores em ${companyName}`,
        sendReminder: 'Enviar lembrete',
        chooseFile: 'Escolher arquivo',
        weAreWaiting: 'Estamos aguardando que outras pessoas verifiquem suas identidades como diretores da empresa.',
        id: 'Cópia do documento de identidade',
        proofOfDirectors: 'Comprovante de diretor(es)',
        proofOfDirectorsDescription: 'Exemplos: Perfil Corporativo Oncorp ou Registro de Empresa.',
        codiceFiscale: 'Código Fiscal',
        codiceFiscaleDescription: 'Codice Fiscale para signatários, usuários autorizados e beneficiários finais.',
        PDSandFSG: 'Documentação de divulgação PDS + FSG',
        PDSandFSGDescription: dedent(`
            Nossa parceria com a Corpay utiliza uma conexão de API para aproveitar sua ampla rede de parceiros bancários internacionais para viabilizar os Reembolsos Globais no Expensify. De acordo com a regulamentação australiana, estamos fornecendo a você o Guia de Serviços Financeiros (FSG) e o Documento de Divulgação de Produto (PDS) da Corpay.

            Leia atentamente os documentos FSG e PDS, pois eles contêm detalhes completos e informações importantes sobre os produtos e serviços oferecidos pela Corpay. Guarde esses documentos para referência futura.
        `),
        pleaseUpload: 'Envie documentação adicional abaixo para nos ajudar a verificar sua identidade como diretor da empresa.',
        enterSignerInfo: 'Inserir informações do signatário',
        thisStep: 'Esta etapa foi concluída',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `está conectando uma conta bancária empresarial em ${currency} terminando em ${bankAccountLastFour} ao Expensify para pagar funcionários em ${currency}. A próxima etapa exige as informações de assinatura de um diretor.`,
        error: {
            emailsMustBeDifferent: 'Os e-mails devem ser diferentes',
        },
    },
    agreementsStep: {
        agreements: 'Acordos',
        pleaseConfirm: 'Confirme os acordos abaixo',
        regulationRequiresUs: 'A regulamentação exige que verifiquemos a identidade de qualquer indivíduo que possua mais de 25% do negócio.',
        iAmAuthorized: 'Estou autorizado a usar a conta bancária empresarial para gastos da empresa.',
        iCertify: 'Eu certifico que as informações fornecidas são verdadeiras e precisas.',
        iAcceptTheTermsAndConditions: `Eu aceito os <a href="https://cross-border.corpay.com/tc/">termos e condições</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Eu aceito os termos e condições.',
        accept: 'Aceitar e adicionar conta bancária',
        iConsentToThePrivacyNotice: 'Eu concordo com o <a href="https://payments.corpay.com/compliance">aviso de privacidade</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Eu concordo com o aviso de privacidade.',
        error: {
            authorized: 'Você deve ser um responsável controlador com autorização para operar a conta bancária da empresa',
            certify: 'Por favor, confirme que as informações são verdadeiras e precisas',
            consent: 'Por favor, concorde com o aviso de privacidade',
        },
    },
    docusignStep: {
        subheader: 'Formulário Docusign',
        pleaseComplete:
            'Preencha o formulário de autorização de ACH com o link do Docusign abaixo e depois envie a cópia assinada aqui para que possamos debitar fundos diretamente da sua conta bancária',
        pleaseCompleteTheBusinessAccount: 'Conclua o Formulário de Débito Direto da Conta Empresarial',
        pleaseCompleteTheDirect:
            'Conclua o Acordo de Débito Direto usando o link do Docusign abaixo e, em seguida, envie a cópia assinada aqui para que possamos debitar valores diretamente da sua conta bancária.',
        takeMeTo: 'Leve-me ao Docusign',
        uploadAdditional: 'Fazer upload de documentação adicional',
        pleaseUpload: 'Carregue, por favor, o formulário DEFT e a página de assinatura do Docusign',
        pleaseUploadTheDirect: 'Faça upload do Arranjo de Débito Direto e da página de assinatura Docusign',
    },
    finishStep: {
        letsFinish: 'Vamos terminar no chat!',
        thanksFor:
            'Obrigado por esses detalhes. Um agente de suporte dedicado agora irá revisar suas informações. Entraremos em contato se precisarmos de mais alguma coisa de você, mas, enquanto isso, sinta-se à vontade para nos procurar caso tenha alguma dúvida.',
        iHaveA: 'Tenho uma pergunta',
        enable2FA: 'Ative a autenticação de dois fatores (2FA) para prevenir fraudes',
        weTake: 'Levamos sua segurança a sério. Configure a autenticação em duas etapas (2FA) agora para adicionar uma camada extra de proteção à sua conta.',
        secure: 'Proteja sua conta',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Um momento',
        explanationLine: 'Estamos analisando suas informações. Em breve você poderá continuar com as próximas etapas.',
    },
    session: {
        offlineMessageRetry: 'Parece que você está offline. Verifique sua conexão e tente novamente.',
    },
    travel: {
        header: 'Reservar viagem',
        title: 'Viaje inteligente',
        subtitle: 'Use o Expensify Travel para obter as melhores ofertas de viagem e gerenciar todas as suas despesas de negócios em um só lugar.',
        features: {
            saveMoney: 'Economize nas suas reservas',
            alerts: 'Receba alertas em tempo real se seus planos de viagem mudarem',
        },
        bookTravel: 'Reservar viagem',
        bookDemo: 'Agendar demonstração',
        bookADemo: 'Agendar uma demonstração',
        toLearnMore: 'para saber mais.',
        termsAndConditions: {
            header: 'Antes de continuarmos...',
            title: 'Termos e condições',
            label: 'Eu concordo com os termos e condições',
            subtitle: `Por favor, concorde com os <a href="${CONST.TRAVEL_TERMS_URL}">termos e condições</a> do Expensify Travel.`,
            error: 'Você deve concordar com os termos e condições do Expensify Travel para continuar',
            defaultWorkspaceError:
                'Você precisa definir um workspace padrão para ativar o Expensify Travel. Vá para Configurações > Workspaces > clique nos três pontos verticais ao lado de um workspace > Definir como workspace padrão e tente novamente!',
        },
        flight: 'Voo',
        flightDetails: {
            passenger: 'Passageiro',
            layover: (layover: string) => `<muted-text-label>Você tem uma <strong>conexão de ${layover}</strong> antes deste voo</muted-text-label>`,
            takeOff: 'Decolagem',
            landing: 'Página inicial',
            seat: 'Assento',
            class: 'Classe da cabine',
            recordLocator: 'Localizador de registro',
            cabinClasses: {
                unknown: 'Desconhecido',
                economy: 'Econômica',
                premiumEconomy: 'Econômica Premium',
                business: 'Negócios',
                first: 'Primeiro',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Convidado',
            checkIn: 'Check-in',
            checkOut: 'Check-out',
            roomType: 'Tipo de quarto',
            cancellation: 'Política de cancelamento',
            cancellationUntil: 'Cancelamento gratuito até',
            confirmation: 'Número de confirmação',
            cancellationPolicies: {
                unknown: 'Desconhecido',
                nonRefundable: 'Não reembolsável',
                freeCancellationUntil: 'Cancelamento gratuito até',
                partiallyRefundable: 'Parcialmente reembolsável',
            },
        },
        car: 'Carro',
        carDetails: {
            rentalCar: 'Aluguel de carro',
            pickUp: 'Retirada',
            dropOff: 'Entrega',
            driver: 'Motorista',
            carType: 'Tipo de carro',
            cancellation: 'Política de cancelamento',
            cancellationUntil: 'Cancelamento gratuito até',
            freeCancellation: 'Cancelamento gratuito',
            confirmation: 'Número de confirmação',
        },
        train: 'Trilho',
        trainDetails: {
            passenger: 'Passageiro',
            departs: 'Partidas',
            arrives: 'Chega',
            coachNumber: 'Número do treinador',
            seat: 'Assento',
            fareDetails: 'Detalhes da tarifa',
            confirmation: 'Número de confirmação',
        },
        viewTrip: 'Ver viagem',
        modifyTrip: 'Modificar viagem',
        tripSupport: 'Suporte à viagem',
        tripDetails: 'Detalhes da viagem',
        viewTripDetails: 'Ver detalhes da viagem',
        trip: 'Viagem',
        trips: 'Viagens',
        tripSummary: 'Resumo da viagem',
        departs: 'Partidas',
        errorMessage: 'Algo deu errado. Tente novamente mais tarde.',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>Por favor, <a href="${phoneErrorMethodsRoute}">adicione um e-mail de trabalho como seu login principal</a> para reservar viagens.</rbr>`,
        domainSelector: {
            title: 'Domínio',
            subtitle: 'Escolha um domínio para a configuração do Expensify Travel.',
            recommended: 'Recomendado',
        },
        domainPermissionInfo: {
            title: 'Domínio',
            restriction: (domain: string) =>
                `Você não tem permissão para ativar o Expensify Travel para o domínio <strong>${domain}</strong>. Você precisará pedir para alguém desse domínio ativar o Travel.`,
            accountantInvitation: `Se você é contador, considere participar do <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">programa para contadores ExpensifyApproved!</a> para habilitar viagens para este domínio.`,
        },
        publicDomainError: {
            title: 'Comece a usar o Expensify Travel',
            message: `Você precisará usar seu e-mail de trabalho (por exemplo, nome@empresa.com) com o Expensify Travel, e não seu e-mail pessoal (por exemplo, nome@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel foi desativado',
            message: `Seu administrador desativou o Expensify Travel. Siga a política de reservas de viagem da sua empresa para fazer suas viagens.`,
        },
        verifyCompany: {
            title: 'Estamos analisando sua solicitação...',
            message: `Estamos realizando algumas verificações do nosso lado para confirmar que sua conta está pronta para o Expensify Travel. Entraremos em contato em breve!`,
            confirmText: 'Entendi',
            conciergeMessage: ({domain}: {domain: string}) => `Falha na habilitação de viagens para o domínio: ${domain}. Revise e habilite viagens para este domínio.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `Seu voo ${airlineCode} (${origin} → ${destination}) em ${startDate} foi reservado. Código de confirmação: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Sua passagem para o voo ${airlineCode} (${origin} → ${destination}) em ${startDate} foi anulada.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Sua passagem para o voo ${airlineCode} (${origin} → ${destination}) em ${startDate} foi reembolsada ou alterada.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Seu voo ${airlineCode} (${origin} → ${destination}) em ${startDate}} foi cancelado pela companhia aérea.`,
            flightScheduleChangePending: (airlineCode: string) => `A companhia aérea propôs uma mudança de horário para o voo ${airlineCode}; estamos aguardando confirmação.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Alteração de horário confirmada: o voo ${airlineCode} agora parte em ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Seu voo ${airlineCode} (${origin} → ${destination}) em ${startDate} foi atualizado.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `Sua classe de cabine foi atualizada para ${cabinClass} no voo ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `Sua poltrona no voo ${airlineCode} foi confirmada.`,
            flightSeatChanged: (airlineCode: string) => `Sua marcação de assento no voo ${airlineCode} foi alterada.`,
            flightSeatCancelled: (airlineCode: string) => `Sua atribuição de assento no voo ${airlineCode} foi removida.`,
            paymentDeclined: 'O pagamento da sua reserva de voo falhou. Tente novamente.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Você cancelou sua reserva de ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `O fornecedor cancelou sua reserva de ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Sua reserva de ${type} foi remarcada. Novo número de confirmação: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Sua reserva de ${type} foi atualizada. Confira os novos detalhes no itinerário.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Sua passagem de trem de ${origin} → ${destination} em ${startDate} foi reembolsada. Um crédito será processado.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Sua passagem de trem de ${origin} → ${destination} em ${startDate} foi trocada.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Sua passagem de trem de ${origin} → ${destination} em ${startDate} foi atualizada.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Sua reserva de ${type} foi atualizada.`,
        },
        flightTo: 'Voo para',
        trainTo: 'Trem para',
        carRental: 'aluguel de carro',
        nightIn: 'noite em',
        nightsIn: 'noites em',
    },
    workspace: {
        common: {
            card: 'Cartões',
            expensifyCard: 'Cartão Expensify',
            companyCards: 'Cartões corporativos',
            workflows: 'Fluxos de trabalho',
            workspace: 'Espaço de trabalho',
            findWorkspace: 'Encontrar espaço de trabalho',
            edit: 'Editar espaço de trabalho',
            enabled: 'Ativado',
            disabled: 'Desativado',
            everyone: 'Todos',
            delete: 'Excluir workspace',
            settings: 'Configurações',
            reimburse: 'Reembolsos',
            categories: 'Categorias',
            tags: 'Tags',
            customField1: 'Campo personalizado 1',
            customField2: 'Campo personalizado 2',
            customFieldHint: 'Adicionar codificação personalizada que se aplique a todos os gastos deste membro.',
            reports: 'Relatórios',
            reportFields: 'Campos de relatório',
            reportTitle: 'Título do relatório',
            reportField: 'Campo de relatório',
            taxes: 'Impostos',
            bills: 'Contas',
            invoices: 'Faturas',
            perDiem: 'Diária',
            travel: 'Viagem',
            members: 'Membros',
            accounting: 'Contabilidade',
            receiptPartners: 'Parceiros de recibos',
            rules: 'Regras',
            displayedAs: 'Exibido como',
            plan: 'Plano',
            profile: 'Visão geral',
            bankAccount: 'Conta bancária',
            testTransactions: 'Transações de teste',
            issueAndManageCards: 'Emitir e gerenciar cartões',
            reconcileCards: 'Conciliar cartões',
            selectAll: 'Selecionar tudo',
            selected: () => ({
                one: '1 selecionado',
                other: (count: number) => `${count} selecionado`,
            }),
            settlementFrequency: 'Frequência de liquidação',
            setAsDefault: 'Definir como espaço de trabalho padrão',
            defaultNote: `Recibos enviados para ${CONST.EMAIL.RECEIPTS} aparecerão neste workspace.`,
            deleteConfirmation: 'Tem certeza de que deseja excluir este workspace?',
            deleteWithCardsConfirmation: 'Tem certeza de que deseja excluir este workspace? Isso removerá todos os feeds de cartões e cartões atribuídos.',
            unavailable: 'Workspace indisponível',
            memberNotFound: 'Membro não encontrado. Para convidar um novo membro para o workspace, use o botão de convite acima.',
            notAuthorized: `Você não tem acesso a esta página. Se estiver tentando entrar neste workspace, basta pedir ao proprietário do workspace para adicionar você como membro. Outra coisa? Entre em contato com ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Ir para o workspace',
            duplicateWorkspace: 'Duplicar workspace',
            duplicateWorkspacePrefix: 'Duplicado',
            goToWorkspaces: 'Ir para áreas de trabalho',
            clearFilter: 'Limpar filtro',
            workspaceName: 'Nome do workspace',
            workspaceOwner: 'Proprietário',
            workspaceType: 'Tipo de workspace',
            workspaceAvatar: 'Avatar do workspace',
            mustBeOnlineToViewMembers: 'Você precisa estar online para ver os membros deste workspace.',
            moreFeatures: 'Mais recursos',
            requested: 'Solicitado',
            distanceRates: 'Tarifas de distância',
            defaultDescription: 'Um lugar para todos os seus recibos e despesas.',
            descriptionHint: 'Compartilhar informações sobre este workspace com todos os membros.',
            welcomeNote: 'Por favor, use o Expensify para enviar seus recibos para reembolso, obrigado!',
            subscription: 'Assinatura',
            markAsEntered: 'Marcar como inserido manualmente',
            markAsExported: 'Marcar como exportado',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exportar para ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Vamos conferir se está tudo certo.',
            lineItemLevel: 'Nível de item de linha',
            reportLevel: 'Nível de relatório',
            topLevel: 'Nível superior',
            appliedOnExport: 'Não importado para o Expensify, aplicado na exportação',
            shareNote: {
                header: 'Compartilhe seu workspace com outros membros',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Compartilhe este código QR ou copie o link abaixo para facilitar que os membros solicitem acesso ao seu workspace. Todas as solicitações para entrar no workspace aparecerão na sala <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> para a sua revisão.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Conectar a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Criar nova conexão',
            reuseExistingConnection: 'Reutilizar conexão existente',
            existingConnections: 'Conexões existentes',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Como você já se conectou ao ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} antes, pode optar por reutilizar uma conexão existente ou criar uma nova.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Última sincronização em ${formattedDate}`,
            authenticationError: (connectionName: string) => `Não é possível conectar a ${connectionName} devido a um erro de autenticação.`,
            learnMore: 'Saiba mais',
            memberAlternateText: 'Enviar e aprovar relatórios.',
            adminAlternateText: 'Gerencie relatórios e configurações do workspace.',
            auditorAlternateText: 'Visualize e comente relatórios.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Administrador';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Auditor';
                    case CONST.POLICY.ROLE.USER:
                        return 'Membro';
                    default:
                        return 'Membro';
                }
            },
            frequency: {
                manual: 'Manualmente',
                instant: 'Instantâneo',
                immediate: 'Diário',
                trip: 'Por viagem',
                weekly: 'Semanal',
                semimonthly: 'Duas vezes por mês',
                monthly: 'Mensal',
            },
            planType: 'Tipo de plano',
            defaultCategory: 'Categoria padrão',
            viewTransactions: 'Ver transações',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Despesas de ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>As transações do Cartão Expensify serão exportadas automaticamente para uma “Conta de Responsabilidade do Cartão Expensify” criada com <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">nossa integração</a>.</muted-text-label>`,
            youCantDowngradeInvoicing:
                'Você não pode fazer downgrade do seu plano em uma assinatura faturada. Para discutir ou fazer alterações na sua assinatura, entre em contato com o gerente da sua conta ou com o Concierge para obter ajuda.',
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Conectado a ${organizationName}` : 'Automatize despesas de viagem e entrega de refeições em toda a sua organização.',
                sendInvites: 'Enviar convites',
                sendInvitesDescription: 'Esses membros do workspace ainda não têm uma conta Uber for Business. Desmarque os membros que você não deseja convidar neste momento.',
                confirmInvite: 'Confirmar convite',
                manageInvites: 'Gerenciar convites',
                confirm: 'Confirmar',
                allSet: 'Tudo pronto',
                readyToRoll: 'Você está pronto para começar',
                takeBusinessRideMessage: 'Faça uma corrida de negócios e seus recibos do Uber serão importados para o Expensify. Vamos lá!',
                all: 'Todos',
                linked: 'Vinculado',
                outstanding: 'Pendente',
                status: {
                    resend: 'Reenviar',
                    invite: 'Convidar',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'Vinculado',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: 'Pendente',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Suspenso',
                },
                centralBillingAccount: 'Conta de faturamento central',
                centralBillingDescription: 'Escolha onde importar todos os recibos da Uber.',
                invitationFailure: 'Falha ao convidar membro para Uber for Business',
                autoInvite: 'Convidar novos membros do espaço de trabalho para o Uber for Business',
                autoRemove: 'Desativar membros removidos do workspace no Uber for Business',
                emptyContent: {
                    title: 'Nenhum convite pendente',
                    subtitle: 'Uhul! Procuramos em todos os lugares e não conseguimos encontrar nenhum convite pendente.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Defina diárias para controlar os gastos diários dos funcionários. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Saiba mais</a>.</muted-text>`,
            amount: 'Valor',
            deleteRates: () => ({
                one: 'Excluir tarifa',
                other: 'Excluir taxas',
            }),
            deletePerDiemRate: 'Excluir taxa de diária',
            findPerDiemRate: 'Encontrar taxa de diária',
            areYouSureDelete: () => ({
                one: 'Tem certeza de que deseja excluir esta taxa?',
                other: 'Tem certeza de que deseja excluir essas tarifas?',
            }),
            emptyList: {
                title: 'Diária',
                subtitle: 'Defina taxas de diária para controlar os gastos diários dos funcionários. Importe taxas de uma planilha para começar.',
            },
            importPerDiemRates: 'Importar taxas de diária',
            editPerDiemRate: 'Editar taxa de diária',
            editPerDiemRates: 'Editar diárias',
            editDestinationSubtitle: (destination: string) => `Atualizar este destino irá alterá-lo para todas as subtarifas de diária de ${destination}.`,
            editCurrencySubtitle: (destination: string) => `Atualizar esta moeda irá alterá-la para todas as subdiárias de ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Defina como as despesas reembolsáveis serão exportadas para o QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Marca cheques como “imprimir depois”',
            exportDescription: 'Configure como os dados do Expensify são exportados para o QuickBooks Desktop.',
            date: 'Data de exportação',
            exportInvoices: 'Exportar faturas para',
            exportExpensifyCard: 'Exportar transações do Cartão Expensify como',
            account: 'Conta',
            accountDescription: 'Escolha onde registrar lançamentos contábeis.',
            accountsPayable: 'Contas a pagar',
            accountsPayableDescription: 'Escolha onde criar contas de fornecedor.',
            bankAccount: 'Conta bancária',
            notConfigured: 'Não configurado',
            bankAccountDescription: 'Escolha de onde enviar os cheques.',
            creditCardAccount: 'Conta de cartão de crédito',
            exportDate: {
                label: 'Data de exportação',
                description: 'Use esta data ao exportar relatórios para o QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data da última despesa',
                        description: 'Data da despesa mais recente no relatório.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data de exportação',
                        description: 'Data em que o relatório foi exportado para o QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data de envio',
                        description: 'Data em que o relatório foi enviado para aprovação.',
                    },
                },
            },
            exportCheckDescription: 'Criaremos um cheque detalhado para cada relatório do Expensify e o enviaremos a partir da conta bancária abaixo.',
            exportJournalEntryDescription: 'Criaremos um lançamento contábil detalhado para cada relatório do Expensify e o registraremos na conta abaixo.',
            exportVendorBillDescription:
                'Criaremos uma conta de fornecedor detalhada para cada relatório do Expensify e a adicionaremos à conta abaixo. Se este período estiver fechado, lançaremos no 1º do próximo período em aberto.',
            outOfPocketTaxEnabledDescription:
                'O QuickBooks Desktop não oferece suporte a impostos em exportações de lançamentos contábeis. Como você ativou impostos no seu espaço de trabalho, essa opção de exportação não está disponível.',
            outOfPocketTaxEnabledError: 'Lançamentos contábeis não estão disponíveis quando os impostos estão ativados. Escolha uma opção de exportação diferente.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Cartão de crédito',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Fatura de fornecedor',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Lançamento contábil',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Verificar',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Criaremos um cheque detalhado para cada relatório do Expensify e o enviaremos a partir da conta bancária abaixo.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Vamos corresponder automaticamente o nome do estabelecimento na transação do cartão de crédito a quaisquer fornecedores correspondentes no QuickBooks. Se não existirem fornecedores, criaremos um fornecedor “Credit Card Misc.” para associação.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Criaremos uma fatura detalhada de fornecedor para cada relatório do Expensify com a data da última despesa e a adicionaremos à conta abaixo. Se esse período estiver fechado, registraremos no dia 1º do próximo período em aberto.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Escolha para onde exportar as transações do cartão de crédito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Escolha um fornecedor para aplicar a todas as transações de cartão de crédito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Escolha de onde enviar os cheques.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Faturas de fornecedores não estão disponíveis quando os locais estão ativados. Por favor, escolha uma opção de exportação diferente.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Cheques não estão disponíveis quando locais estão ativados. Escolha uma opção de exportação diferente.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Lançamentos contábeis não estão disponíveis quando os impostos estão ativados. Escolha uma opção de exportação diferente.',
            },
            noAccountsFound: 'Nenhuma conta encontrada',
            noAccountsFoundDescription: 'Adicione a conta no QuickBooks Desktop e sincronize a conexão novamente',
            qbdSetup: 'Configuração do QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Não é possível conectar deste dispositivo',
                body1: 'Você precisará configurar essa conexão a partir do computador que hospeda o arquivo da empresa do QuickBooks Desktop.',
                body2: 'Depois que você estiver conectado, poderá sincronizar e exportar de qualquer lugar.',
            },
            setupPage: {
                title: 'Abra este link para conectar',
                body: 'Para concluir a configuração, abra o seguinte link no computador onde o QuickBooks Desktop está em execução.',
                setupErrorTitle: 'Algo deu errado',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>A conexão com o QuickBooks Desktop não está funcionando no momento. Tente novamente mais tarde ou <a href="${conciergeLink}">entre em contato com o Concierge</a> se o problema persistir.</centered-text></muted-text>`,
            },
            importDescription: 'Escolha quais configurações de codificação importar do QuickBooks Desktop para o Expensify.',
            classes: 'Classes',
            items: 'Itens',
            customers: 'Clientes/projetos',
            exportCompanyCardsDescription: 'Defina como as compras com cartão corporativo serão exportadas para o QuickBooks Desktop.',
            defaultVendorDescription: 'Defina um fornecedor padrão que será aplicado a todas as transações de cartão de crédito durante a exportação.',
            accountsDescription: 'Seu plano de contas do QuickBooks Desktop será importado para o Expensify como categorias.',
            accountsSwitchTitle: 'Escolha importar novas contas como categorias ativadas ou desativadas.',
            accountsSwitchDescription: 'As categorias ativadas estarão disponíveis para os membros selecionarem ao criar suas despesas.',
            classesDescription: 'Escolha como lidar com as classes do QuickBooks Desktop no Expensify.',
            tagsDisplayedAsDescription: 'Nível de item de linha',
            reportFieldsDisplayedAsDescription: 'Nível de relatório',
            customersDescription: 'Escolha como gerenciar clientes/projetos do QuickBooks Desktop no Expensify.',
            advancedConfig: {
                autoSyncDescription: 'O Expensify sincronizará automaticamente com o QuickBooks Desktop todos os dias.',
                createEntities: 'Criar entidades automaticamente',
                createEntitiesDescription: 'O Expensify criará automaticamente fornecedores no QuickBooks Desktop se eles ainda não existirem.',
            },
            itemsDescription: 'Escolha como lidar com itens do QuickBooks Desktop no Expensify.',
            accountingMethods: {
                label: 'Quando Exportar',
                description: 'Escolha quando exportar as despesas:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Regime de competência',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Dinheiro',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'As despesas fora do bolso serão exportadas quando forem aprovadas em definitivo',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Despesas desembolsadas serão exportadas quando forem pagas',
                },
            },
        },
        qbo: {
            connectedTo: 'Conectado a',
            importDescription: 'Escolha quais configurações de codificação importar do QuickBooks Online para o Expensify.',
            classes: 'Classes',
            locations: 'Locais',
            customers: 'Clientes/projetos',
            accountsDescription: 'Seu plano de contas do QuickBooks Online será importado para o Expensify como categorias.',
            accountsSwitchTitle: 'Escolha importar novas contas como categorias ativadas ou desativadas.',
            accountsSwitchDescription: 'As categorias ativadas estarão disponíveis para os membros selecionarem ao criar suas despesas.',
            classesDescription: 'Escolha como lidar com as classes do QuickBooks Online no Expensify.',
            customersDescription: 'Escolha como lidar com clientes/projetos do QuickBooks Online no Expensify.',
            locationsDescription: 'Escolha como gerenciar locais do QuickBooks Online no Expensify.',
            taxesDescription: 'Escolha como lidar com os impostos do QuickBooks Online no Expensify.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online não oferece suporte a Localizações no nível de linha para Cheques ou Contas de Fornecedores. Se você quiser ter localizações no nível de linha, certifique-se de usar Lançamentos de Diário e despesas de Cartão de Crédito/Débito.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online não oferece suporte a impostos em lançamentos contábeis. Altere sua opção de exportação para conta de fornecedor ou cheque.',
            exportDescription: 'Configure como os dados do Expensify são exportados para o QuickBooks Online.',
            date: 'Data de exportação',
            exportInvoices: 'Exportar faturas para',
            exportExpensifyCard: 'Exportar transações do Cartão Expensify como',
            exportDate: {
                label: 'Data de exportação',
                description: 'Use esta data ao exportar relatórios para o QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data da última despesa',
                        description: 'Data da despesa mais recente no relatório.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data de exportação',
                        description: 'Data em que o relatório foi exportado para o QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data de envio',
                        description: 'Data em que o relatório foi enviado para aprovação.',
                    },
                },
            },
            receivable: 'Contas a receber', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Arquivo de contas a receber', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Use esta conta ao exportar faturas para o QuickBooks Online.',
            exportCompanyCardsDescription: 'Defina como as compras com cartão corporativo são exportadas para o QuickBooks Online.',
            vendor: 'Fornecedor',
            defaultVendorDescription: 'Defina um fornecedor padrão que será aplicado a todas as transações de cartão de crédito durante a exportação.',
            exportOutOfPocketExpensesDescription: 'Defina como as despesas pagas do próprio bolso serão exportadas para o QuickBooks Online.',
            exportCheckDescription: 'Criaremos um cheque detalhado para cada relatório do Expensify e o enviaremos a partir da conta bancária abaixo.',
            exportJournalEntryDescription: 'Criaremos um lançamento contábil detalhado para cada relatório do Expensify e o registraremos na conta abaixo.',
            exportVendorBillDescription:
                'Criaremos uma conta de fornecedor detalhada para cada relatório do Expensify e a adicionaremos à conta abaixo. Se este período estiver fechado, lançaremos no 1º do próximo período em aberto.',
            account: 'Conta',
            accountDescription: 'Escolha onde registrar lançamentos contábeis.',
            accountsPayable: 'Contas a pagar',
            accountsPayableDescription: 'Escolha onde criar contas de fornecedor.',
            bankAccount: 'Conta bancária',
            notConfigured: 'Não configurado',
            bankAccountDescription: 'Escolha de onde enviar os cheques.',
            creditCardAccount: 'Conta de cartão de crédito',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online não oferece suporte a locais em exportações de contas de fornecedores. Como você habilitou locais no seu workspace, essa opção de exportação não está disponível.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online não oferece suporte a impostos em exportações de lançamentos contábeis. Como você ativou impostos no seu espaço de trabalho, esta opção de exportação não está disponível.',
            outOfPocketTaxEnabledError: 'Lançamentos contábeis não estão disponíveis quando os impostos estão ativados. Escolha uma opção de exportação diferente.',
            advancedConfig: {
                autoSyncDescription: 'O Expensify irá sincronizar automaticamente com o QuickBooks Online todos os dias.',
                inviteEmployees: 'Convidar funcionários',
                inviteEmployeesDescription: 'Importar registros de funcionários do QuickBooks Online e convidar funcionários para este workspace.',
                createEntities: 'Criar entidades automaticamente',
                createEntitiesDescription:
                    'A Expensify criará automaticamente fornecedores no QuickBooks Online se eles ainda não existirem e criará automaticamente clientes ao exportar faturas.',
                reimbursedReportsDescription: 'Sempre que um relatório for pago usando Expensify ACH, o pagamento de conta correspondente será criado na conta do QuickBooks Online abaixo.',
                qboBillPaymentAccount: 'Conta de pagamento de contas do QuickBooks',
                qboInvoiceCollectionAccount: 'Conta de cobranças de faturas do QuickBooks',
                accountSelectDescription: 'Escolha de onde pagar as contas e criaremos o pagamento no QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Escolha onde receber os pagamentos de faturas e nós criaremos o pagamento no QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Cartão de débito',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Cartão de crédito',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Fatura de fornecedor',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Lançamento contábil',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Verificar',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Correspondência automática do nome do estabelecimento na transação do cartão de débito com quaisquer fornecedores correspondentes no QuickBooks. Se não houver fornecedores, criaremos um fornecedor “Cartão de débito – Diversos” para associação.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Vamos corresponder automaticamente o nome do estabelecimento na transação do cartão de crédito a quaisquer fornecedores correspondentes no QuickBooks. Se não existirem fornecedores, criaremos um fornecedor “Credit Card Misc.” para associação.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Criaremos uma fatura detalhada de fornecedor para cada relatório do Expensify com a data da última despesa e a adicionaremos à conta abaixo. Se esse período estiver fechado, registraremos no dia 1º do próximo período em aberto.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Escolha para onde exportar as transações do cartão de débito.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Escolha para onde exportar as transações do cartão de crédito.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Escolha um fornecedor para aplicar a todas as transações de cartão de crédito.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Faturas de fornecedores não estão disponíveis quando os locais estão ativados. Por favor, escolha uma opção de exportação diferente.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Cheques não estão disponíveis quando locais estão ativados. Escolha uma opção de exportação diferente.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Lançamentos contábeis não estão disponíveis quando os impostos estão ativados. Escolha uma opção de exportação diferente.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Escolha uma conta válida para exportar contas de fornecedor',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Escolha uma conta válida para exportar o lançamento de diário',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Escolha uma conta válida para exportar cheques',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Para usar a exportação de contas de fornecedores, configure uma conta de contas a pagar no QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Para usar a exportação de lançamentos de diário, configure uma conta de diário no QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Para usar a exportação de cheques, configure uma conta bancária no QuickBooks Online',
            },
            noAccountsFound: 'Nenhuma conta encontrada',
            noAccountsFoundDescription: 'Adicione a conta no QuickBooks Online e sincronize a conexão novamente.',
            accountingMethods: {
                label: 'Quando Exportar',
                description: 'Escolha quando exportar as despesas:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Regime de competência',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Dinheiro',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'As despesas fora do bolso serão exportadas quando forem aprovadas em definitivo',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Despesas desembolsadas serão exportadas quando forem pagas',
                },
            },
        },
        workspaceList: {
            joinNow: 'Inscreva-se agora',
            askToJoin: 'Pedir para participar',
        },
        xero: {
            organization: 'Organização Xero',
            organizationDescription: 'Escolha a organização Xero da qual você gostaria de importar dados.',
            importDescription: 'Escolha quais configurações de codificação importar do Xero para o Expensify.',
            accountsDescription: 'Seu plano de contas do Xero será importado para o Expensify como categorias.',
            accountsSwitchTitle: 'Escolha importar novas contas como categorias ativadas ou desativadas.',
            accountsSwitchDescription: 'As categorias ativadas estarão disponíveis para os membros selecionarem ao criar suas despesas.',
            trackingCategories: 'Categorias de rastreamento',
            trackingCategoriesDescription: 'Escolha como lidar com as categorias de rastreamento do Xero no Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `Mapear ${categoryName} do Xero para`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Escolha onde mapear ${categoryName} ao exportar para Xero.`,
            customers: 'Refaturar clientes',
            customersDescription:
                'Escolha se deseja refaturar clientes no Expensify. Seus contatos de clientes do Xero podem ser associados às despesas e serão exportados para o Xero como uma fatura de venda.',
            taxesDescription: 'Escolha como lidar com os impostos do Xero no Expensify.',
            notImported: 'Não importado',
            notConfigured: 'Não configurado',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Padrão de contato do Xero',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Campos de relatório',
            },
            exportDescription: 'Configure como os dados do Expensify são exportados para o Xero.',
            purchaseBill: 'Conta de compra',
            exportDeepDiveCompanyCard:
                'As despesas exportadas serão lançadas como transações bancárias na conta bancária Xero abaixo, e as datas das transações irão corresponder às datas do seu extrato bancário.',
            bankTransactions: 'Transações bancárias',
            xeroBankAccount: 'Conta bancária do Xero',
            xeroBankAccountDescription: 'Escolha onde as despesas serão registradas como transações bancárias.',
            exportExpensesDescription: 'Relatórios serão exportados como uma conta de compra com a data e o status selecionados abaixo.',
            purchaseBillDate: 'Data da fatura de compra',
            exportInvoices: 'Exportar faturas como',
            salesInvoice: 'Fatura de vendas',
            exportInvoicesDescription: 'Faturas de vendas sempre exibem a data em que a fatura foi enviada.',
            advancedConfig: {
                autoSyncDescription: 'O Expensify será sincronizado automaticamente com o Xero todos os dias.',
                purchaseBillStatusTitle: 'Status da fatura de compra',
                reimbursedReportsDescription: 'Sempre que um relatório for pago usando Expensify ACH, o pagamento de conta correspondente será criado na conta do Xero abaixo.',
                xeroBillPaymentAccount: 'Conta de pagamento de faturas do Xero',
                xeroInvoiceCollectionAccount: 'Conta de cobrança de faturas do Xero',
                xeroBillPaymentAccountDescription: 'Escolha de onde pagar as contas e nós criaremos o pagamento no Xero.',
                invoiceAccountSelectorDescription: 'Escolha onde receber os pagamentos de faturas e nós criaremos o pagamento no Xero.',
            },
            exportDate: {
                label: 'Data da fatura de compra',
                description: 'Use esta data ao exportar relatórios para o Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data da última despesa',
                        description: 'Data da despesa mais recente no relatório.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data de exportação',
                        description: 'Data em que o relatório foi exportado para o Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data de envio',
                        description: 'Data em que o relatório foi enviado para aprovação.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Status da fatura de compra',
                description: 'Use este status ao exportar contas de compra para o Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Rascunho',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Aguardando aprovação',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Aguardando pagamento',
                },
            },
            noAccountsFound: 'Nenhuma conta encontrada',
            noAccountsFoundDescription: 'Adicione a conta no Xero e sincronize a conexão novamente',
            accountingMethods: {
                label: 'Quando Exportar',
                description: 'Escolha quando exportar as despesas:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Regime de competência',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Dinheiro',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'As despesas fora do bolso serão exportadas quando forem aprovadas em definitivo',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Despesas desembolsadas serão exportadas quando forem pagas',
                },
            },
        },
        sageIntacct: {
            preferredExporter: 'Exportador preferido',
            taxSolution: 'Solução fiscal',
            notConfigured: 'Não configurado',
            exportDate: {
                label: 'Data de exportação',
                description: 'Use esta data ao exportar relatórios para o Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data da última despesa',
                        description: 'Data da despesa mais recente no relatório.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Data de exportação',
                        description: 'Data em que o relatório foi exportado para o Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data de envio',
                        description: 'Data em que o relatório foi enviado para aprovação.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Defina como as despesas reembolsáveis serão exportadas para o Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Relatórios de despesas',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Contas de fornecedores',
                },
            },
            nonReimbursableExpenses: {
                description: 'Defina como as compras com cartão corporativo são exportadas para o Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Cartões de crédito',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Contas de fornecedores',
                },
            },
            creditCardAccount: 'Conta de cartão de crédito',
            defaultVendor: 'Fornecedor padrão',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Defina um fornecedor padrão que será aplicado às despesas reembolsáveis de ${isReimbursable ? '' : 'não-'} que não tiverem um fornecedor correspondente no Sage Intacct.`,
            exportDescription: 'Configure como os dados do Expensify são exportados para o Sage Intacct.',
            exportPreferredExporterNote:
                'O exportador preferencial pode ser qualquer administrador do espaço de trabalho, mas também deve ser um Administrador de Domínio se você definir contas de exportação diferentes para cartões corporativos individuais nas Configurações de Domínio.',
            exportPreferredExporterSubNote: 'Depois de definido, o exportador preferencial verá os relatórios para exportação na conta dele.',
            noAccountsFound: 'Nenhuma conta encontrada',
            noAccountsFoundDescription: `Adicione a conta no Sage Intacct e sincronize a conexão novamente`,
            autoSync: 'Sincronização automática',
            autoSyncDescription: 'A Expensify fará a sincronização automática com o Sage Intacct todos os dias.',
            inviteEmployees: 'Convidar funcionários',
            inviteEmployeesDescription:
                'Importe os registros de funcionários do Sage Intacct e convide funcionários para este workspace. Seu fluxo de aprovação será definido por padrão como aprovação do gerente e poderá ser configurado ainda mais na página Membros.',
            syncReimbursedReports: 'Sincronizar relatórios reembolsados',
            syncReimbursedReportsDescription: 'Sempre que um relatório for pago usando Expensify ACH, o pagamento de conta correspondente será criado na conta Sage Intacct abaixo.',
            paymentAccount: 'Conta de pagamento do Sage Intacct',
            accountingMethods: {
                label: 'Quando Exportar',
                description: 'Escolha quando exportar as despesas:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Regime de competência',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Dinheiro',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'As despesas fora do bolso serão exportadas quando forem aprovadas em definitivo',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Despesas desembolsadas serão exportadas quando forem pagas',
                },
            },
        },
        netsuite: {
            subsidiary: 'Subsidiária',
            subsidiarySelectDescription: 'Escolha a subsidiária no NetSuite da qual você gostaria de importar dados.',
            exportDescription: 'Configure como os dados do Expensify são exportados para o NetSuite.',
            exportInvoices: 'Exportar faturas para',
            journalEntriesTaxPostingAccount: 'Conta de lançamento de imposto em diário',
            journalEntriesProvTaxPostingAccount: 'Conta de lançamento de imposto provincial em lançamentos contábeis',
            foreignCurrencyAmount: 'Exportar valor em moeda estrangeira',
            exportToNextOpenPeriod: 'Exportar para o próximo período aberto',
            nonReimbursableJournalPostingAccount: 'Conta de lançamento de diário não reembolsável',
            reimbursableJournalPostingAccount: 'Conta de lançamento de diário reembolsável',
            journalPostingPreference: {
                label: 'Preferência de lançamento de lançamentos contábeis',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Lançamento único, detalhado, para cada relatório',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Uma única entrada para cada despesa',
                },
            },
            invoiceItem: {
                label: 'Item da fatura',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Crie um para mim',
                        description: 'Criaremos um “item de linha de fatura do Expensify” para você ao exportar (se ainda não existir).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Selecionar existente',
                        description: 'Nós vincularemos as faturas do Expensify ao item selecionado abaixo.',
                    },
                },
            },
            exportDate: {
                label: 'Data de exportação',
                description: 'Use esta data ao exportar relatórios para o NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data da última despesa',
                        description: 'Data da despesa mais recente no relatório.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Data de exportação',
                        description: 'Data em que o relatório foi exportado para o NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data de envio',
                        description: 'Data em que o relatório foi enviado para aprovação.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Relatórios de despesas',
                        reimbursableDescription: 'Despesas reembolsáveis serão exportadas como relatórios de despesas para o NetSuite.',
                        nonReimbursableDescription: 'As despesas do cartão corporativo serão exportadas como relatórios de despesas para o NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Contas de fornecedores',
                        reimbursableDescription: dedent(`
                            Despesas pagas do próprio bolso serão exportadas como contas a pagar ao fornecedor do NetSuite especificado abaixo.

                            Se você quiser definir um fornecedor específico para cada cartão, vá para *Configurações > Domínios > Cartões Corporativos*.
                        `),
                        nonReimbursableDescription: dedent(`
                            As despesas com cartão corporativo serão exportadas como contas a pagar ao fornecedor do NetSuite especificado abaixo.

                            Se você quiser definir um fornecedor específico para cada cartão, vá em *Configurações > Domínios > Cartões Corporativos*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Lançamentos contábeis',
                        reimbursableDescription: dedent(`
                            As despesas do próprio bolso serão exportadas como lançamentos de diário para a conta NetSuite especificada abaixo.

                            Se quiser definir um fornecedor específico para cada cartão, vá em *Configurações > Domínios > Cartões Corporativos*.
                        `),
                        nonReimbursableDescription: dedent(`
                            As despesas do cartão corporativo serão exportadas como lançamentos contábeis para a conta do NetSuite especificada abaixo.

                            Se você quiser definir um fornecedor específico para cada cartão, vá em *Configurações > Domínios > Cartões Corporativos*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Se você alterar a configuração de exportação de cartão corporativo para relatórios de despesas, os fornecedores e as contas de lançamento do NetSuite para cartões individuais serão desativados.\n\nNão se preocupe, ainda salvaremos suas seleções anteriores caso você queira voltar mais tarde.',
            },
            advancedConfig: {
                autoSyncDescription: 'O Expensify irá sincronizar automaticamente com o NetSuite todos os dias.',
                reimbursedReportsDescription: 'Sempre que um relatório for pago usando Expensify ACH, o pagamento de conta correspondente será criado na conta NetSuite abaixo.',
                reimbursementsAccount: 'Conta de reembolsos',
                reimbursementsAccountDescription: 'Escolha a conta bancária que você usará para reembolsos e criaremos o pagamento associado no NetSuite.',
                collectionsAccount: 'Conta de cobranças',
                collectionsAccountDescription: 'Depois que uma fatura é marcada como paga no Expensify e exportada para o NetSuite, ela aparecerá vinculada à conta abaixo.',
                approvalAccount: 'Conta de aprovação de contas a pagar',
                approvalAccountDescription:
                    'Escolha a conta na qual as transações serão aprovadas no NetSuite. Se você estiver sincronizando relatórios reembolsados, esta também será a conta na qual os pagamentos de contas serão criados.',
                defaultApprovalAccount: 'Padrão do NetSuite',
                inviteEmployees: 'Convide funcionários e defina aprovações',
                inviteEmployeesDescription:
                    'Importe os registros de funcionários do NetSuite e convide funcionários para este workspace. Seu fluxo de aprovação terá, por padrão, a aprovação do gerente e poderá ser configurado ainda mais na página *Membros*.',
                autoCreateEntities: 'Criar automaticamente funcionários/fornecedores',
                enableCategories: 'Ativar categorias recém-importadas',
                customFormID: 'ID de formulário personalizado',
                customFormIDDescription:
                    'Por padrão, o Expensify criará lançamentos usando o formulário de transação preferencial definido no NetSuite. Alternativamente, você pode designar um formulário de transação específico para ser usado.',
                customFormIDReimbursable: 'Despesa paga do próprio bolso',
                customFormIDNonReimbursable: 'Despesa de cartão corporativo',
                exportReportsTo: {
                    label: 'Nível de aprovação de relatório de despesas',
                    description:
                        'Depois que um relatório de despesas é aprovado no Expensify e exportado para o NetSuite, você pode definir um nível adicional de aprovação no NetSuite antes de lançá-lo.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Preferência padrão do NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Apenas aprovado pelo supervisor',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Somente aprovado pela contabilidade',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Aprovado pela supervisão e contabilidade',
                    },
                },
                accountingMethods: {
                    label: 'Quando Exportar',
                    description: 'Escolha quando exportar as despesas:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Regime de competência',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Dinheiro',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'As despesas fora do bolso serão exportadas quando forem aprovadas em definitivo',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Despesas desembolsadas serão exportadas quando forem pagas',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Nível de aprovação de conta de fornecedor',
                    description:
                        'Depois que uma fatura de fornecedor é aprovada no Expensify e exportada para o NetSuite, você pode definir um nível adicional de aprovação no NetSuite antes de lançá-la.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Preferência padrão do NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Aprovação pendente',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Aprovado para publicação',
                    },
                },
                exportJournalsTo: {
                    label: 'Nível de aprovação de lançamento contábil',
                    description:
                        'Depois que um lançamento de diário é aprovado no Expensify e exportado para o NetSuite, você pode definir um nível adicional de aprovação no NetSuite antes de lançá-lo.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Preferência padrão do NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Aprovação pendente',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Aprovado para publicação',
                    },
                },
                error: {
                    customFormID: 'Insira um ID numérico de formulário personalizado válido',
                },
            },
            noAccountsFound: 'Nenhuma conta encontrada',
            noAccountsFoundDescription: 'Adicione a conta no NetSuite e sincronize a conexão novamente',
            noVendorsFound: 'Nenhum fornecedor encontrado',
            noVendorsFoundDescription: 'Adicione fornecedores no NetSuite e sincronize a conexão novamente',
            noItemsFound: 'Nenhum item de fatura encontrado',
            noItemsFoundDescription: 'Adicione itens de fatura no NetSuite e sincronize a conexão novamente',
            noSubsidiariesFound: 'Nenhuma subsidiária encontrada',
            noSubsidiariesFoundDescription: 'Adicione uma subsidiária no NetSuite e sincronize a conexão novamente',
            tokenInput: {
                title: 'Configuração do NetSuite',
                formSteps: {
                    installBundle: {
                        title: 'Instale o pacote do Expensify',
                        description: 'No NetSuite, vá para *Customization > SuiteBundler > Search & Install Bundles* > pesquise por "Expensify" > instale o pacote.',
                    },
                    enableTokenAuthentication: {
                        title: 'Ativar autenticação baseada em token',
                        description: 'No NetSuite, vá para *Setup > Company > Enable Features > SuiteCloud* > ative *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'Ativar serviços web SOAP',
                        description: 'No NetSuite, vá para *Setup > Company > Enable Features > SuiteCloud* > ative *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Criar um token de acesso',
                        description:
                            'No NetSuite, vá para *Setup > Users/Roles > Access Tokens* > crie um token de acesso para o app "Expensify" e para o papel "Expensify Integration" ou "Administrator".\n\n*Importante:* Certifique-se de salvar o *Token ID* e o *Token Secret* desta etapa. Você irá precisar deles na próxima etapa.',
                    },
                    enterCredentials: {
                        title: 'Insira suas credenciais do NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'ID da conta NetSuite',
                            netSuiteTokenID: 'ID do token',
                            netSuiteTokenSecret: 'Segredo do Token',
                        },
                        netSuiteAccountIDDescription: 'No NetSuite, vá para *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Categorias de despesa',
                expenseCategoriesDescription: 'Suas categorias de despesas do NetSuite serão importadas para o Expensify como categorias.',
                crossSubsidiaryCustomers: 'Clientes/projetos entre subsidiárias',
                importFields: {
                    departments: {
                        title: 'Departamentos',
                        subtitle: 'Escolha como lidar com os *departamentos* do NetSuite no Expensify.',
                    },
                    classes: {
                        title: 'Classes',
                        subtitle: 'Escolha como lidar com *classes* no Expensify.',
                    },
                    locations: {
                        title: 'Locais',
                        subtitle: 'Escolha como lidar com *locais* no Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Clientes/projetos',
                    subtitle: 'Escolha como lidar com *clientes* e *projetos* do NetSuite no Expensify.',
                    importCustomers: 'Importar clientes',
                    importJobs: 'Importar projetos',
                    customers: 'clientes',
                    jobs: 'projetos',
                    label: (importFields: string[], importType: string) => `${importFields.join('e')}, ${importType}`,
                },
                importTaxDescription: 'Importar grupos de impostos do NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Escolha uma opção abaixo:',
                    label: (importedTypes: string[]) => `Importado como ${importedTypes.join('e')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Por favor, insira o ${fieldName}`,
                    customSegments: {
                        title: 'Segmentos/registros personalizados',
                        addText: 'Adicionar segmento/registro personalizado',
                        recordTitle: 'Segmento/registro personalizado',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Ver instruções detalhadas',
                        helpText: 'sobre a configuração de segmentos/registros personalizados.',
                        emptyTitle: 'Adicionar um segmento personalizado ou registro personalizado',
                        fields: {
                            segmentName: 'Nome',
                            internalID: 'ID interno',
                            scriptID: 'ID do script',
                            customRecordScriptID: 'ID da coluna de transação',
                            mapping: 'Exibido como',
                        },
                        removeTitle: 'Remover segmento/registro personalizado',
                        removePrompt: 'Tem certeza de que deseja remover este segmento/registro personalizado?',
                        addForm: {
                            customSegmentName: 'nome de segmento personalizado',
                            customRecordName: 'nome de registro personalizado',
                            segmentTitle: 'Segmento personalizado',
                            customSegmentAddTitle: 'Adicionar segmento personalizado',
                            customRecordAddTitle: 'Adicionar registro personalizado',
                            recordTitle: 'Registro personalizado',
                            segmentRecordType: 'Você quer adicionar um segmento personalizado ou um registro personalizado?',
                            customSegmentNameTitle: 'Qual é o nome do segmento personalizado?',
                            customRecordNameTitle: 'Qual é o nome do registro personalizado?',
                            customSegmentNameFooter: `Você pode encontrar os nomes de segmentos personalizados no NetSuite na página *Customizations > Links, Records & Fields > Custom Segments*.

_Para instruções mais detalhadas, [visite nossa central de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Você pode encontrar nomes de registros personalizados no NetSuite inserindo o "Transaction Column Field" na pesquisa global.

_Para instruções mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Qual é o ID interno?',
                            customSegmentInternalIDFooter: `Primeiro, certifique-se de que você ativou os IDs internos no NetSuite em *Home > Set Preferences > Show Internal ID.*

Você pode encontrar os IDs internos de segmentos personalizados no NetSuite em:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Clique em um segmento personalizado.
3. Clique no hiperlink ao lado de *Custom Record Type*.
4. Encontre o ID interno na tabela na parte inferior.

_Para instruções mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Você pode encontrar os IDs internos de registros personalizados no NetSuite seguindo estas etapas:

1. Digite "Transaction Line Fields" na pesquisa global.
2. Clique em um registro personalizado.
3. Encontre o ID interno no lado esquerdo.

_Para obter instruções mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Qual é o ID do script?',
                            customSegmentScriptIDFooter: `Você pode encontrar os IDs de script de segmento personalizado no NetSuite em:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Clique em um segmento personalizado.
3. Clique na aba *Application and Sourcing* perto da parte inferior e, em seguida:
    a. Se você quiser exibir o segmento personalizado como uma *tag* (no nível de item de linha) no Expensify, clique na subaba *Transaction Columns* e use o *Field ID*.
    b. Se você quiser exibir o segmento personalizado como um *campo de relatório* (no nível de relatório) no Expensify, clique na subaba *Transactions* e use o *Field ID*.

_Para instruções mais detalhadas, [visite nossa central de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Qual é o ID da coluna de transação?',
                            customRecordScriptIDFooter: `Você pode encontrar os IDs de script de registro personalizado no NetSuite em:

1. Digite "Transaction Line Fields" na pesquisa global.
2. Clique em um registro personalizado.
3. Encontre o ID de script no lado esquerdo.

_Para instruções mais detalhadas, [visite nossa central de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Como esse segmento personalizado deve ser exibido no Expensify?',
                            customRecordMappingTitle: 'Como esse registro personalizado deve ser exibido no Expensify?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Já existe um segmento/registro personalizado com este ${fieldName?.toLowerCase()}`,
                        },
                    },
                    customLists: {
                        title: 'Listas personalizadas',
                        addText: 'Adicionar lista personalizada',
                        recordTitle: 'Lista personalizada',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Ver instruções detalhadas',
                        helpText: 'sobre a configuração de listas personalizadas.',
                        emptyTitle: 'Adicionar uma lista personalizada',
                        fields: {
                            listName: 'Nome',
                            internalID: 'ID interno',
                            transactionFieldID: 'ID do campo de transação',
                            mapping: 'Exibido como',
                        },
                        removeTitle: 'Remover lista personalizada',
                        removePrompt: 'Tem certeza de que deseja remover esta lista personalizada?',
                        addForm: {
                            listNameTitle: 'Escolha uma lista personalizada',
                            transactionFieldIDTitle: 'Qual é o ID do campo de transação?',
                            transactionFieldIDFooter: `Você pode encontrar os IDs de campos de transação no NetSuite seguindo estas etapas:

1. Digite "Transaction Line Fields" na busca global.
2. Clique em uma lista personalizada.
3. Encontre o ID do campo de transação no lado esquerdo.

_Para instruções mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Como essa lista personalizada deve ser exibida no Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Já existe uma lista personalizada com este ID de campo de transação`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Padrão de funcionário NetSuite',
                        description: 'Não importado para o Expensify, aplicado na exportação',
                        footerContent: (importField: string) =>
                            `Se você usar ${importField} no NetSuite, aplicaremos o padrão definido no registro do funcionário ao exportar para Expense Report ou Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tags',
                        description: 'Nível de item de linha',
                        footerContent: (importField: string) => `${startCase(importField)} estará disponível para seleção em cada despesa individual no relatório de um funcionário.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Campos de relatório',
                        description: 'Nível de relatório',
                        footerContent: (importField: string) => `A seleção de ${startCase(importField)} será aplicada a todas as despesas no relatório de um funcionário.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Configuração do Sage Intacct',
            prerequisitesTitle: 'Antes de você se conectar...',
            downloadExpensifyPackage: 'Baixe o pacote Expensify para Sage Intacct',
            followSteps: 'Siga as etapas em nosso guia “Como fazer: Conectar ao Sage Intacct”',
            enterCredentials: 'Insira suas credenciais do Sage Intacct',
            entity: 'Entidade',
            employeeDefault: 'Padrão de funcionário do Sage Intacct',
            employeeDefaultDescription: 'O departamento padrão do funcionário será aplicado às suas despesas no Sage Intacct, caso exista.',
            displayedAsTagDescription: 'O departamento poderá ser selecionado para cada despesa individual no relatório de um funcionário.',
            displayedAsReportFieldDescription: 'A seleção de departamento será aplicada a todas as despesas no relatório de um funcionário.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Escolha como lidar com Sage Intacct <strong>${mappingTitle}</strong> no Expensify.`,
            expenseTypes: 'Tipos de despesa',
            expenseTypesDescription: 'Seus tipos de despesa do Sage Intacct serão importados para o Expensify como categorias.',
            accountTypesDescription: 'Seu plano de contas do Sage Intacct será importado para o Expensify como categorias.',
            importTaxDescription: 'Importar taxa de imposto de compra do Sage Intacct.',
            userDefinedDimensions: 'Dimensões definidas pelo usuário',
            addUserDefinedDimension: 'Adicionar dimensão definida pelo usuário',
            integrationName: 'Nome da integração',
            dimensionExists: 'Já existe uma dimensão com esse nome.',
            removeDimension: 'Remover dimensão definida pelo usuário',
            removeDimensionPrompt: 'Tem certeza de que deseja remover esta dimensão definida pelo usuário?',
            userDefinedDimension: 'Dimensão definida pelo usuário',
            addAUserDefinedDimension: 'Adicionar uma dimensão definida pelo usuário',
            detailedInstructionsLink: 'Ver instruções detalhadas',
            detailedInstructionsRestOfSentence: 'ao adicionar dimensões definidas pelo usuário.',
            userDimensionsAdded: () => ({
                one: '1 UDD adicionada',
                other: (count: number) => `${count} UDDs adicionados`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'departamentos';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'classes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'Locais';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'clientes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'projetos (trabalhos)';
                    default:
                        return 'mapeamentos';
                }
            },
        },
        type: {
            free: 'Grátis',
            control: 'Controle',
            collect: 'Coletar',
        },
        companyCards: {
            addCards: 'Adicionar cartões',
            selectCards: 'Selecionar cartões',
            addNewCard: {
                other: 'Outro',
                cardProviders: {
                    gl1025: 'Cartões Corporativos American Express',
                    cdf: 'Cartões Comerciais Mastercard',
                    vcf: 'Cartões Comerciais Visa',
                    stripe: 'Cartões Stripe',
                },
                yourCardProvider: `Quem é o emissor do seu cartão?`,
                whoIsYourBankAccount: 'Qual é o seu banco?',
                whereIsYourBankLocated: 'Onde seu banco está localizado?',
                howDoYouWantToConnect: 'Como você quer se conectar ao seu banco?',
                learnMoreAboutOptions: `<muted-text>Saiba mais sobre essas <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">opções</a>.</muted-text>`,
                commercialFeedDetails: 'Requer configuração com o seu banco. Isso geralmente é usado por empresas maiores e costuma ser a melhor opção se você se qualificar.',
                commercialFeedPlaidDetails: `Requer configuração com o seu banco, mas vamos orientar você. Isso geralmente é limitado a empresas maiores.`,
                directFeedDetails: 'A abordagem mais simples. Conecte-se imediatamente usando suas credenciais principais. Esse método é o mais comum.',
                enableFeed: {
                    title: (provider: string) => `Ative seu feed ${provider}`,
                    heading:
                        'Temos uma integração direta com o emissor do seu cartão e podemos importar seus dados de transação para o Expensify de forma rápida e precisa.\n\nPara começar, simplesmente:',
                    visa: 'Temos integrações globais com a Visa, embora a elegibilidade varie de acordo com o banco e o programa do cartão.\n\nPara começar, basta:',
                    mastercard: 'Temos integrações globais com a Mastercard, embora a elegibilidade varie conforme o banco e o programa do cartão.\n\nPara começar, basta:',
                    vcf: `1. Visite [este artigo de ajuda](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) para obter instruções detalhadas sobre como configurar seus Visa Commercial Cards.

2. [Entre em contato com seu banco](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) para verificar se eles oferecem um feed comercial para o seu programa e peça para habilitá-lo.

3. *Quando o feed estiver habilitado e você tiver os detalhes, continue para a próxima tela.*`,
                    gl1025: `1. Visite [este artigo de ajuda](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) para saber se a American Express pode ativar um feed comercial para o seu programa.

2. Assim que o feed for ativado, a Amex enviará uma carta de produção para você.

3. *Depois de ter as informações do feed, continue para a próxima tela.*`,
                    cdf: `1. Visite [este artigo de ajuda](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) para obter instruções detalhadas sobre como configurar seus Mastercard Commercial Cards.

2. [Entre em contato com seu banco](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) para verificar se eles oferecem um feed comercial para o seu programa e peça para que o habilitem.

3. *Assim que o feed estiver habilitado e você tiver os detalhes, continue para a próxima tela.*`,
                    stripe: `1. Acesse o painel do Stripe e vá para [Configurações](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Em Integrações de produtos, clique em Ativar ao lado de Expensify.

3. Quando o feed estiver ativado, clique em Enviar abaixo e começaremos a adicioná-lo.`,
                },
                whatBankIssuesCard: 'Qual banco emite esses cartões?',
                enterNameOfBank: 'Insira o nome do banco',
                feedDetails: {
                    vcf: {
                        title: 'Quais são os detalhes do feed Visa?',
                        processorLabel: 'ID do processador',
                        bankLabel: 'ID da instituição financeira (banco)',
                        companyLabel: 'ID da empresa',
                        helpLabel: 'Onde encontro esses IDs?',
                    },
                    gl1025: {
                        title: `Qual é o nome do arquivo de entrega da Amex?`,
                        fileNameLabel: 'Nome do arquivo de entrega',
                        helpLabel: 'Onde encontro o nome do arquivo de entrega?',
                    },
                    cdf: {
                        title: `Qual é o ID de distribuição da Mastercard?`,
                        distributionLabel: 'ID de distribuição',
                        helpLabel: 'Onde encontro o ID de distribuição?',
                    },
                },
                amexCorporate: 'Selecione isto se a frente dos seus cartões disser “Corporate”',
                amexBusiness: 'Selecione esta opção se a frente dos seus cartões disser “Business”',
                amexPersonal: 'Selecione esta opção se seus cartões forem pessoais',
                error: {
                    pleaseSelectProvider: 'Selecione um provedor de cartão antes de continuar',
                    pleaseSelectBankAccount: 'Selecione uma conta bancária antes de continuar',
                    pleaseSelectBank: 'Selecione um banco antes de continuar',
                    pleaseSelectCountry: 'Selecione um país antes de continuar',
                    pleaseSelectFeedType: 'Selecione um tipo de feed antes de continuar',
                },
                exitModal: {
                    title: 'Algo não está funcionando?',
                    prompt: 'Percebemos que você não terminou de adicionar seus cartões. Se encontrou algum problema, avise-nos para que possamos ajudar a colocar tudo nos trilhos novamente.',
                    confirmText: 'Reportar problema',
                    cancelText: 'Pular',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: 'Último dia do mês',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: 'Último dia útil do mês',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'Dia personalizado do mês',
            },
            assignCard: 'Atribuir cartão',
            findCard: 'Encontrar cartão',
            cardNumber: 'Número do cartão',
            commercialFeed: 'Feed comercial',
            feedName: (feedName: string) => `Cartões ${feedName}`,
            directFeed: 'Conexão direta',
            whoNeedsCardAssigned: 'Quem precisa de um cartão atribuído?',
            chooseTheCardholder: 'Escolha o portador do cartão',
            chooseCard: 'Escolha um cartão',
            chooseCardFor: (assignee: string) =>
                `Escolha um cartão para <strong>${assignee}</strong>. Não encontra o cartão que está procurando? <concierge-link>Avise-nos.</concierge-link>`,
            noActiveCards: 'Nenhum cartão ativo neste feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>Ou algo pode estar quebrado. De qualquer forma, se você tiver alguma dúvida, apenas <concierge-link>entre em contato com a Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Escolha uma data de início da transação',
            startDateDescription: 'Vamos importar todas as transações a partir desta data. Se nenhuma data for especificada, iremos tão longe quanto o seu banco permitir.',
            fromTheBeginning: 'Desde o início',
            customStartDate: 'Data de início personalizada',
            customCloseDate: 'Data de fechamento personalizada',
            letsDoubleCheck: 'Vamos conferir se está tudo certo.',
            confirmationDescription: 'Começaremos a importar transações imediatamente.',
            card: 'Cartão',
            cardName: 'Nome do cartão',
            brokenConnectionError: '<rbr>A conexão com o feed do cartão foi interrompida. Por favor, <a href="#">faça login no seu banco</a> para que possamos restabelecer a conexão.</rbr>',
            assignedCard: (assignee: string, link: string) => `atribuiu ${assignee} um(a) ${link}! Transações importadas aparecerão neste chat.`,
            companyCard: 'cartão corporativo',
            chooseCardFeed: 'Escolher feed do cartão',
            ukRegulation:
                'Expensify Limited é um agente da Plaid Financial Ltd., uma instituição de pagamento autorizada e regulada pela Financial Conduct Authority sob as Payment Services Regulations 2017 (Número de Referência da Empresa: 804718). A Plaid fornece a você serviços regulados de informações de conta por meio da Expensify Limited como seu agente.',
            assign: 'Atribuir',
            assignCardFailedError: 'Falha na atribuição do cartão.',
            cardAlreadyAssignedError: 'This card is already assigned to a user in another workspace.',
            editStartDateDescription: 'Escolha uma nova data de início das transações. Vamos sincronizar todas as transações a partir dessa data, excluindo aquelas que já importamos.',
            unassignCardFailedError: 'Falha ao desatribuir o cartão.',
            importTransactions: {
                title: 'Importar transações do arquivo',
                description: 'Ajuste as configurações do seu arquivo que serão aplicadas na importação.',
                cardDisplayName: 'Nome exibido no cartão',
                currency: 'Moeda',
                transactionsAreReimbursable: 'As transações são reembolsáveis',
                flipAmountSign: 'Inverter o sinal do valor',
                importButton: 'Importar transações',
            },
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: 'Não foi possível carregar os feeds do cartão',
                workspaceFeedsCouldNotBeLoadedMessage: 'Ocorreu um erro ao carregar os feeds de cartões do workspace. Tente novamente ou entre em contato com o administrador.',
                feedCouldNotBeLoadedTitle: 'Não foi possível carregar este feed',
                feedCouldNotBeLoadedMessage: 'Ocorreu um erro ao carregar este feed. Tente novamente ou entre em contato com o seu administrador.',
                tryAgain: 'Tentar novamente',
            },
        },
        expensifyCard: {
            issueAndManageCards: 'Emitir e gerenciar seus Cartões Expensify',
            getStartedIssuing: 'Comece solicitando seu primeiro cartão virtual ou físico.',
            verificationInProgress: 'Verificação em andamento...',
            verifyingTheDetails: 'Estamos verificando alguns detalhes. Concierge avisará você quando os Cartões Expensify estiverem prontos para serem emitidos.',
            disclaimer:
                'O Cartão Comercial Expensify Visa® é emitido pelo The Bancorp Bank, N.A., membro FDIC, de acordo com uma licença da Visa U.S.A. Inc. e pode não ser aceito em todos os estabelecimentos que aceitam cartões Visa. Apple® e o logotipo Apple® são marcas registradas da Apple Inc., registradas nos EUA e em outros países. App Store é uma marca de serviço da Apple Inc. Google Play e o logotipo Google Play são marcas registradas da Google LLC.',
            euUkDisclaimer:
                'Os cartões fornecidos a residentes do EEE são emitidos pela Transact Payments Malta Limited e os cartões fornecidos a residentes do Reino Unido são emitidos pela Transact Payments Limited, nos termos de licença concedida pela Visa Europe Limited. A Transact Payments Malta Limited é devidamente autorizada e regulada pela Autoridade de Serviços Financeiros de Malta como uma Instituição Financeira sob a Lei de Instituições Financeiras de 1994. Número de registro C 91879. A Transact Payments Limited é autorizada e regulada pela Comissão de Serviços Financeiros de Gibraltar.',
            issueCard: 'Emitir cartão',
            findCard: 'Encontrar cartão',
            newCard: 'Novo cartão',
            name: 'Nome',
            lastFour: 'Últimos 4',
            limit: 'Limite',
            currentBalance: 'Saldo atual',
            currentBalanceDescription: 'O saldo atual é a soma de todas as transações lançadas no Expensify Card que ocorreram desde a última data de liquidação.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `O saldo será liquidado em ${settlementDate}`,
            settleBalance: 'Quitar saldo',
            cardLimit: 'Limite do cartão',
            remainingLimit: 'Limite restante',
            requestLimitIncrease: 'Solicitar aumento de limite',
            remainingLimitDescription:
                'Levamos em conta vários fatores ao calcular seu limite remanescente: seu tempo como cliente, as informações comerciais fornecidas durante o cadastro e o dinheiro disponível na conta bancária da sua empresa. Seu limite remanescente pode variar diariamente.',
            earnedCashback: 'Dinheiro de volta',
            earnedCashbackDescription: 'O saldo de cashback é baseado nos gastos mensais liquidados com o Cartão Expensify em todo o seu workspace.',
            issueNewCard: 'Emitir novo cartão',
            finishSetup: 'Concluir configuração',
            chooseBankAccount: 'Escolher conta bancária',
            chooseExistingBank: 'Escolha uma conta bancária empresarial existente para pagar o saldo do seu Cartão Expensify ou adicione uma nova conta bancária',
            accountEndingIn: 'Conta terminando em',
            addNewBankAccount: 'Adicionar uma nova conta bancária',
            settlementAccount: 'Conta de liquidação',
            settlementAccountDescription: 'Escolha uma conta para pagar o saldo do seu Expensify Card.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Certifique-se de que esta conta corresponda à sua <a href="${reconciliationAccountSettingsLink}">Conta de reconciliação</a> (${accountNumber}) para que a Reconciliação Contínua funcione corretamente.`,
            settlementFrequency: 'Frequência de liquidação',
            settlementFrequencyDescription: 'Escolha com que frequência você pagará o saldo do seu Cartão Expensify.',
            settlementFrequencyInfo: 'Se quiser mudar para liquidação mensal, será necessário conectar sua conta bancária via Plaid e ter um histórico de saldo positivo de 90 dias.',
            frequency: {
                daily: 'Diário',
                monthly: 'Mensal',
            },
            cardDetails: 'Detalhes do cartão',
            cardPending: ({name}: {name: string}) => `O cartão está atualmente pendente e será emitido assim que a conta de ${name} for validada.`,
            virtual: 'Virtual',
            physical: 'Físico',
            deactivate: 'Desativar cartão',
            changeCardLimit: 'Alterar limite do cartão',
            changeLimit: 'Alterar limite',
            smartLimitWarning: (limit: number | string) =>
                `Se você alterar o limite deste cartão para ${limit}, novas transações serão recusadas até que você aprove mais despesas no cartão.`,
            monthlyLimitWarning: (limit: number | string) => `Se você alterar o limite deste cartão para ${limit}, novas transações serão recusadas até o próximo mês.`,
            fixedLimitWarning: (limit: number | string) => `Se você alterar o limite deste cartão para ${limit}, novas transações serão recusadas.`,
            changeCardLimitType: 'Alterar tipo de limite do cartão',
            changeLimitType: 'Alterar tipo de limite',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `Se você alterar o tipo de limite deste cartão para Limite Inteligente, novas transações serão recusadas porque o limite não aprovado de ${limit} já foi atingido.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `Se você alterar o tipo de limite deste cartão para Mensal, novas transações serão recusadas porque o limite mensal de ${limit} já foi atingido.`,
            addShippingDetails: 'Adicionar detalhes de envio',
            issuedCard: (assignee: string) => `emitiu um Cartão Expensify para ${assignee}! O cartão chegará em 2–3 dias úteis.`,
            issuedCardNoShippingDetails: (assignee: string) => `emitiu um Expensify Card para ${assignee}! O cartão será enviado assim que os detalhes de envio forem confirmados.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `emitiu para ${assignee} um Cartão virtual Expensify! O ${link} pode ser usado imediatamente.`,
            addedShippingDetails: (assignee: string) => `${assignee} adicionou os detalhes de envio. O cartão Expensify chegará em 2-3 dias úteis.`,
            replacedCard: (assignee: string) => `${assignee} substituiu o cartão Expensify. O novo cartão chegará em 2–3 dias úteis.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} substituiu o cartão virtual Expensify! O ${link} já pode ser usado.`,
            card: 'cartão',
            replacementCard: 'cartão de substituição',
            verifyingHeader: 'Verificando',
            bankAccountVerifiedHeader: 'Conta bancária verificada',
            verifyingBankAccount: 'Verificando conta bancária...',
            verifyingBankAccountDescription: 'Aguarde enquanto confirmamos se esta conta pode ser usada para emitir Cartões Expensify.',
            bankAccountVerified: 'Conta bancária verificada!',
            bankAccountVerifiedDescription: 'Agora você pode emitir Cartões Expensify para os membros do seu workspace.',
            oneMoreStep: 'Mais um passo...',
            oneMoreStepDescription: 'Parece que precisamos verificar sua conta bancária manualmente. Acesse o Concierge, onde suas instruções estão esperando por você.',
            gotIt: 'Entendi',
            goToConcierge: 'Ir para o Concierge',
        },
        categories: {
            deleteCategories: 'Excluir categorias',
            deleteCategoriesPrompt: 'Tem certeza de que deseja excluir estas categorias?',
            deleteCategory: 'Excluir categoria',
            deleteCategoryPrompt: 'Tem certeza de que deseja excluir esta categoria?',
            disableCategories: 'Desativar categorias',
            disableCategory: 'Desativar categoria',
            enableCategories: 'Ativar categorias',
            enableCategory: 'Ativar categoria',
            defaultSpendCategories: 'Categorias de gasto padrão',
            spendCategoriesDescription: 'Personalize como os gastos dos estabelecimentos são categorizados para transações de cartão de crédito e recibos digitalizados.',
            deleteFailureMessage: 'Ocorreu um erro ao excluir a categoria, tente novamente',
            categoryName: 'Nome da categoria',
            requiresCategory: 'Os membros devem categorizar todas as despesas',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Todas as despesas devem ser categorizadas para serem exportadas para ${connectionName}.`,
            subtitle: 'Tenha uma visão melhor de onde o dinheiro está sendo gasto. Use nossas categorias padrão ou adicione as suas próprias.',
            emptyCategories: {
                title: 'Você não criou nenhuma categoria',
                subtitle: 'Adicione uma categoria para organizar seus gastos.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Suas categorias estão sendo importadas de uma conexão de contabilidade. Vá até <a href="${accountingPageURL}">contabilidade</a> para fazer qualquer alteração.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Ocorreu um erro ao atualizar a categoria, tente novamente',
            createFailureMessage: 'Ocorreu um erro ao criar a categoria, tente novamente',
            addCategory: 'Adicionar categoria',
            editCategory: 'Editar categoria',
            editCategories: 'Editar categorias',
            findCategory: 'Encontrar categoria',
            categoryRequiredError: 'O nome da categoria é obrigatório',
            existingCategoryError: 'Já existe uma categoria com esse nome',
            invalidCategoryName: 'Nome de categoria inválido',
            importedFromAccountingSoftware: 'As categorias abaixo são importadas do seu',
            payrollCode: 'Código de folha de pagamento',
            updatePayrollCodeFailureMessage: 'Ocorreu um erro ao atualizar o código de folha de pagamento, tente novamente',
            glCode: 'Código contábil',
            updateGLCodeFailureMessage: 'Ocorreu um erro ao atualizar o código GL, tente novamente',
            importCategories: 'Importar categorias',
            cannotDeleteOrDisableAllCategories: {
                title: 'Não é possível excluir ou desativar todas as categorias',
                description: `Pelo menos uma categoria deve permanecer ativada porque seu workspace exige categorias.`,
            },
        },
        moreFeatures: {
            subtitle: 'Use os toggles abaixo para ativar mais recursos conforme você cresce. Cada recurso aparecerá no menu de navegação para mais personalizações.',
            spendSection: {
                title: 'Gastos',
                subtitle: 'Ative a funcionalidade que ajuda você a expandir sua equipe.',
            },
            manageSection: {
                title: 'Gerenciar',
                subtitle: 'Adicione controles que ajudem a manter os gastos dentro do orçamento.',
            },
            earnSection: {
                title: 'Ganhar',
                subtitle: 'Otimize sua receita e receba pagamentos mais rápido.',
            },
            organizeSection: {
                title: 'Organizar',
                subtitle: 'Agrupe e analise os gastos, registre todos os impostos pagos.',
            },
            integrateSection: {
                title: 'Integrar',
                subtitle: 'Conecte o Expensify a produtos financeiros populares.',
            },
            distanceRates: {
                title: 'Tarifas de distância',
                subtitle: 'Adicione, atualize e aplique tarifas.',
            },
            perDiem: {
                title: 'Diária',
                subtitle: 'Defina diárias para controlar os gastos diários dos funcionários.',
            },
            travel: {
                title: 'Viagem',
                subtitle: 'Reserve, gerencie e reconcilie todas as suas viagens de negócios.',
                getStarted: {
                    title: 'Comece com o Expensify Travel',
                    subtitle: 'Precisamos apenas de algumas informações adicionais sobre sua empresa, então você estará pronto para decolar.',
                    ctaText: 'Vamos lá',
                },
                reviewingRequest: {
                    title: 'Faça as malas, temos sua solicitação...',
                    subtitle: 'Estamos atualmente revisando sua solicitação para habilitar o Expensify Travel. Não se preocupe, avisaremos quando estiver pronto.',
                    ctaText: 'Solicitação enviada',
                },
                bookOrManageYourTrip: {
                    title: 'Reserve ou gerencie sua viagem',
                    subtitle: 'Use o Expensify Travel para obter as melhores ofertas de viagem e gerencie todas as suas despesas comerciais em um só lugar.',
                    ctaText: 'Reservar ou gerenciar',
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: 'Reserva de viagem',
                        subtitle: 'Parabéns! Agora você está pronto para reservar e gerenciar viagens neste workspace.',
                        manageTravelLabel: 'Gerenciar viagens',
                    },
                    centralInvoicingSection: {
                        title: 'Faturamento centralizado',
                        subtitle: 'Centralize todos os gastos de viagem em uma fatura mensal em vez de pagar no momento da compra.',
                        learnHow: 'Saiba como.',
                        subsections: {
                            currentTravelSpendLabel: 'Gasto atual com viagens',
                            currentTravelSpendCta: 'Pagar saldo',
                            currentTravelLimitLabel: 'Limite de viagem atual',
                            settlementAccountLabel: 'Conta de liquidação',
                            settlementFrequencyLabel: 'Frequência de liquidação',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Cartão Expensify',
                subtitle: 'Obtenha insights e controle sobre os gastos.',
                disableCardTitle: 'Desativar Cartão Expensify',
                disableCardPrompt: 'Você não pode desativar o Expensify Card porque ele já está em uso. Entre em contato com o Concierge para saber os próximos passos.',
                disableCardButton: 'Conversar com Concierge',
                feed: {
                    title: 'Obter o Cartão Expensify',
                    subTitle: 'Otimize as despesas da sua empresa e economize até 50% na sua fatura do Expensify, além de:',
                    features: {
                        cashBack: 'Cashback em todas as compras nos EUA',
                        unlimited: 'Cartões virtuais ilimitados',
                        spend: 'Controles de gastos e limites personalizados',
                    },
                    ctaTitle: 'Emitir novo cartão',
                },
            },
            companyCards: {
                title: 'Cartões corporativos',
                subtitle: 'Conecte os cartões que você já tem.',
                feed: {
                    title: 'Traga seus próprios cartões (BYOC)',
                    features: {
                        support: 'Conecte cartões de mais de 10.000 bancos',
                        assignCards: 'Vincule os cartões existentes da sua equipe',
                        automaticImport: 'Vamos importar as transações automaticamente',
                    },
                    subtitle: 'Vincule os cartões que você já possui para importação automática de transações, correspondência de recibos e reconciliação.',
                },
                bankConnectionError: 'Problema de conexão bancária',
                connectWithPlaid: 'conectar via Plaid',
                connectWithExpensifyCard: 'experimente o Cartão Expensify.',
                bankConnectionDescription: `Tente adicionar seus cartões novamente. Caso contrário, você pode`,
                disableCardTitle: 'Desativar cartões corporativos',
                disableCardPrompt: 'Você não pode desativar cartões corporativos porque esse recurso está em uso. Entre em contato com o Concierge para saber os próximos passos.',
                disableCardButton: 'Conversar com Concierge',
                cardDetails: 'Detalhes do cartão',
                cardNumber: 'Número do cartão',
                cardholder: 'Titular do cartão',
                cardName: 'Nome do cartão',
                allCards: 'Todos os cartões',
                assignedCards: 'Atribuído',
                unassignedCards: 'Não atribuído',
                integrationExport: ({integration, type}: IntegrationExportParams) =>
                    integration && type ? `exportação de ${integration} ${type.toLowerCase()}` : `Exportação de ${integration}`,
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Escolha a conta do ${integration} para a qual as transações devem ser exportadas.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Escolha a conta do ${integration} para a qual as transações devem ser exportadas. Selecione uma <a href="${exportPageLink}">opção de exportação</a> diferente para alterar as contas disponíveis.`,
                lastUpdated: 'Última atualização',
                transactionStartDate: 'Data de início da transação',
                updateCard: 'Atualizar cartão',
                unassignCard: 'Desatribuir cartão',
                unassign: 'Desatribuir',
                unassignCardDescription: 'Desatribuir este cartão removerá todas as transações em relatórios em rascunho da conta do titular do cartão.',
                assignCard: 'Atribuir cartão',
                cardFeedName: 'Nome do feed do cartão',
                cardFeedNameDescription: 'Dê ao feed do cartão um nome exclusivo para que você possa diferenciá-lo dos outros.',
                cardFeedTransaction: 'Excluir transações',
                cardFeedTransactionDescription: 'Escolha se os portadores de cartão podem excluir transações do cartão. Novas transações seguirão essas regras.',
                cardFeedRestrictDeletingTransaction: 'Restringir exclusão de transações',
                cardFeedAllowDeletingTransaction: 'Permitir excluir transações',
                removeCardFeed: 'Remover feed do cartão',
                removeCardFeedTitle: (feedName: string) => `Remover feed ${feedName}`,
                removeCardFeedDescription: 'Tem certeza de que deseja remover este feed de cartão? Isso irá desatribuir todos os cartões.',
                error: {
                    feedNameRequired: 'O nome do feed do cartão é obrigatório',
                    statementCloseDateRequired: 'Selecione uma data de fechamento do extrato.',
                },
                corporate: 'Restringir exclusão de transações',
                personal: 'Permitir excluir transações',
                setFeedNameDescription: 'Dê um nome exclusivo ao feed do cartão para poder diferenciá-lo dos outros',
                setTransactionLiabilityDescription: 'Quando ativado, os portadores do cartão podem excluir transações do cartão. Novas transações seguirão essa regra.',
                emptyAddedFeedTitle: 'Atribuir cartões corporativos',
                emptyAddedFeedDescription: 'Comece atribuindo seu primeiro cartão a um membro.',
                pendingFeedTitle: `Estamos analisando sua solicitação...`,
                pendingFeedDescription: `Atualmente estamos analisando os detalhes do seu feed. Assim que isso for concluído, entraremos em contato com você por meio de`,
                pendingBankTitle: 'Verifique a janela do seu navegador',
                pendingBankDescription: (bankName: string) => `Conecte-se ao ${bankName} pela janela do navegador que acabou de abrir. Se nenhuma tiver sido aberta,`,
                pendingBankLink: 'clique aqui, por favor',
                giveItNameInstruction: 'Dê ao cartão um nome que o diferencie dos outros.',
                updating: 'Atualizando...',
                neverUpdated: 'Nunca',
                noAccountsFound: 'Nenhuma conta encontrada',
                defaultCard: 'Cartão padrão',
                downgradeTitle: `Não é possível rebaixar o workspace`,
                downgradeSubTitle: `Este workspace não pode ser rebaixado porque vários feeds de cartão estão conectados (excluindo Expensify Cards). Por favor, <a href="#">mantenha apenas um feed de cartão</a> para continuar.`,
                noAccountsFoundDescription: (connection: string) => `Adicione a conta em ${connection} e sincronize a conexão novamente`,
                expensifyCardBannerTitle: 'Obter o Cartão Expensify',
                expensifyCardBannerSubtitle: 'Aproveite cashback em todas as compras nos EUA, até 50% de desconto na sua fatura do Expensify, cartões virtuais ilimitados e muito mais.',
                expensifyCardBannerLearnMoreButton: 'Saiba mais',
                statementCloseDateTitle: 'Data de fechamento do extrato',
                statementCloseDateDescription: 'Avise-nos quando o fechamento da fatura do seu cartão ocorrer e criaremos uma fatura correspondente no Expensify.',
            },
            workflows: {
                title: 'Fluxos de trabalho',
                subtitle: 'Configure como os gastos são aprovados e pagos.',
                disableApprovalPrompt:
                    'Os Cartões Expensify deste workspace atualmente dependem de aprovação para definir seus Smart Limits. Altere os tipos de limite de quaisquer Cartões Expensify com Smart Limits antes de desativar as aprovações.',
            },
            invoices: {
                title: 'Faturas',
                subtitle: 'Enviar e receber faturas.',
            },
            categories: {
                title: 'Categorias',
                subtitle: 'Acompanhe e organize os gastos.',
            },
            tags: {
                title: 'Tags',
                subtitle: 'Classifique custos e acompanhe despesas faturáveis.',
            },
            taxes: {
                title: 'Impostos',
                subtitle: 'Documente e recupere impostos elegíveis.',
            },
            reportFields: {
                title: 'Campos de relatório',
                subtitle: 'Configure campos personalizados para gastos.',
            },
            connections: {
                title: 'Contabilidade',
                subtitle: 'Sincronize seu plano de contas e muito mais.',
            },
            receiptPartners: {
                title: 'Parceiros de recibos',
                subtitle: 'Importar recibos automaticamente.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Não tão rápido...',
                featureEnabledText: 'Para ativar ou desativar este recurso, você precisará alterar suas configurações de importação contábil.',
                disconnectText: 'Para desativar a contabilidade, você precisará desconectar sua conexão de contabilidade do seu espaço de trabalho.',
                manageSettings: 'Gerenciar configurações',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Desconectar Uber',
                disconnectText: 'Para desativar este recurso, desconecte primeiro a integração do Uber for Business.',
                description: 'Tem certeza de que deseja desconectar esta integração?',
                confirmText: 'Entendi',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Não tão rápido...',
                featureEnabledText:
                    'Os Cartões Expensify neste workspace dependem de fluxos de aprovação para definir seus Limites Inteligentes.\n\nAltere os tipos de limite de quaisquer cartões com Limites Inteligentes antes de desativar os fluxos de trabalho.',
                confirmText: 'Ir para Expensify Cards',
            },
            rules: {
                title: 'Regras',
                subtitle: 'Exigir recibos, sinalizar gastos elevados e muito mais.',
            },
            timeTracking: {
                title: 'Hora',
                subtitle: 'Defina uma taxa horária faturável para o controle de tempo.',
                defaultHourlyRate: 'Taxa horária padrão',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Exemplos:',
            customReportNamesSubtitle: `<muted-text>Personalize os títulos dos relatórios usando nossas <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">fórmulas avançadas</a>.</muted-text>`,
            customNameTitle: 'Título padrão do relatório',
            customNameDescription: `Escolha um nome personalizado para os relatórios de despesas usando nossas <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">fórmulas avançadas</a>.`,
            customNameInputLabel: 'Nome',
            customNameEmailPhoneExample: 'E-mail ou telefone do membro: {report:submit:from}',
            customNameStartDateExample: 'Data de início do relatório: {report:startdate}',
            customNameWorkspaceNameExample: 'Nome do workspace: {report:workspacename}',
            customNameReportIDExample: 'ID do relatório: {report:id}',
            customNameTotalExample: 'Total: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Impedir que membros alterem títulos personalizados de relatórios',
        },
        reportFields: {
            addField: 'Adicionar campo',
            delete: 'Excluir campo',
            deleteFields: 'Excluir campos',
            findReportField: 'Encontrar campo de relatório',
            deleteConfirmation: 'Tem certeza de que deseja excluir este campo de relatório?',
            deleteFieldsConfirmation: 'Tem certeza de que deseja excluir estes campos de relatório?',
            emptyReportFields: {
                title: 'Você ainda não criou nenhum campo de relatório',
                subtitle: 'Adicione um campo personalizado (texto, data ou menu suspenso) que apareça nos relatórios.',
            },
            subtitle: 'Os campos de relatório se aplicam a todos os gastos e podem ser úteis quando você quiser solicitar informações adicionais.',
            disableReportFields: 'Desativar campos de relatório',
            disableReportFieldsConfirmation: 'Tem certeza? Campos de texto e data serão excluídos e as listas serão desativadas.',
            importedFromAccountingSoftware: 'Os campos de relatório abaixo são importados do seu',
            textType: 'Texto',
            dateType: 'Data',
            dropdownType: 'Lista',
            formulaType: 'Fórmula',
            textAlternateText: 'Adicionar um campo para entrada de texto livre.',
            dateAlternateText: 'Adicione um calendário para seleção de data.',
            dropdownAlternateText: 'Adicione uma lista de opções para escolher.',
            formulaAlternateText: 'Adicione um campo de fórmula.',
            nameInputSubtitle: 'Escolha um nome para o campo de relatório.',
            typeInputSubtitle: 'Escolha qual tipo de campo de relatório usar.',
            initialValueInputSubtitle: 'Insira um valor inicial para mostrar no campo do relatório.',
            listValuesInputSubtitle: 'Esses valores aparecerão no menu suspenso do campo do seu relatório. Valores ativados podem ser selecionados pelos membros.',
            listInputSubtitle: 'Esses valores aparecerão na lista de campos do seu relatório. Valores habilitados podem ser selecionados pelos membros.',
            deleteValue: 'Excluir valor',
            deleteValues: 'Excluir valores',
            disableValue: 'Desativar valor',
            disableValues: 'Desativar valores',
            enableValue: 'Habilitar valor',
            enableValues: 'Ativar valores',
            emptyReportFieldsValues: {
                title: 'Você não criou nenhum valor de lista',
                subtitle: 'Adicione valores personalizados para aparecerem nos relatórios.',
            },
            deleteValuePrompt: 'Tem certeza de que deseja excluir este valor da lista?',
            deleteValuesPrompt: 'Tem certeza de que deseja excluir esses valores de lista?',
            listValueRequiredError: 'Insira um nome para o valor da lista',
            existingListValueError: 'Já existe um valor de lista com este nome',
            editValue: 'Editar valor',
            listValues: 'Listar valores',
            addValue: 'Adicionar valor',
            existingReportFieldNameError: 'Já existe um campo de relatório com esse nome',
            reportFieldNameRequiredError: 'Insira um nome de campo de relatório',
            reportFieldTypeRequiredError: 'Escolha um tipo de campo de relatório',
            circularReferenceError: 'Este campo não pode fazer referência a si mesmo. Atualize-o.',
            reportFieldInitialValueRequiredError: 'Por favor, escolha um valor inicial para o campo de relatório',
            genericFailureMessage: 'Ocorreu um erro ao atualizar o campo do relatório. Tente novamente.',
        },
        tags: {
            tagName: 'Nome da tag',
            requiresTag: 'Membros devem etiquetar todas as despesas',
            trackBillable: 'Controlar despesas faturáveis',
            customTagName: 'Nome de tag personalizada',
            enableTag: 'Ativar etiqueta',
            enableTags: 'Ativar tags',
            requireTag: 'Exigir etiqueta',
            requireTags: 'Exigir tags',
            notRequireTags: 'Não exigir',
            disableTag: 'Desativar tag',
            disableTags: 'Desativar tags',
            addTag: 'Adicionar tag',
            editTag: 'Editar etiqueta',
            editTags: 'Editar tags',
            findTag: 'Encontrar tag',
            subtitle: 'Tags adicionam maneiras mais detalhadas de classificar custos.',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>Você está usando <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">tags dependentes</a>. Você pode <a href="${importSpreadsheetLink}">reimportar uma planilha</a> para atualizar suas tags.</muted-text>`,
            emptyTags: {
                title: 'Você não criou nenhuma tag',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Adicione uma tag para acompanhar projetos, locais, departamentos e muito mais.',
                subtitleHTML: `<muted-text><centered-text>Adicione tags para acompanhar projetos, localizações, departamentos e muito mais. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Saiba mais</a> sobre como formatar arquivos de tags para importação.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Suas tags estão sendo importadas de uma conexão contábil. Vá até <a href="${accountingPageURL}">contabilidade</a> para fazer qualquer alteração.</centered-text></muted-text>`,
            },
            deleteTag: 'Excluir etiqueta',
            deleteTags: 'Excluir tags',
            deleteTagConfirmation: 'Tem certeza de que deseja excluir esta tag?',
            deleteTagsConfirmation: 'Tem certeza de que deseja excluir estas tags?',
            deleteFailureMessage: 'Ocorreu um erro ao excluir a tag, tente novamente',
            tagRequiredError: 'Nome da tag é obrigatório',
            existingTagError: 'Já existe uma tag com esse nome',
            invalidTagNameError: 'O nome da tag não pode ser 0. Escolha um valor diferente.',
            genericFailureMessage: 'Ocorreu um erro ao atualizar a tag, tente novamente',
            importedFromAccountingSoftware: 'As tags abaixo são importadas do seu',
            glCode: 'Código contábil',
            updateGLCodeFailureMessage: 'Ocorreu um erro ao atualizar o código GL, tente novamente',
            tagRules: 'Regras de tags',
            approverDescription: 'Aprovador',
            importTags: 'Importar tags',
            importTagsSupportingText: 'Classifique seus gastos com um tipo de tag ou com várias.',
            configureMultiLevelTags: 'Configure sua lista de tags para marcação em múltiplos níveis.',
            importMultiLevelTagsSupportingText: `Aqui está uma prévia das suas tags. Se tudo estiver correto, clique abaixo para importá-las.`,
            importMultiLevelTags: {
                firstRowTitle: 'A primeira linha é o título de cada lista de tags',
                independentTags: 'Estas são tags independentes',
                glAdjacentColumn: 'Há um código GL na coluna adjacente',
            },
            tagLevel: {
                singleLevel: 'Nível único de tags',
                multiLevel: 'Tags em múltiplos níveis',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Alternar Níveis de Tag',
                prompt1: 'Alterar os níveis de tag apagará todas as tags atuais.',
                prompt2: 'Sugerimos que você primeiro',
                prompt3: 'baixar um backup',
                prompt4: 'exportando suas tags.',
                prompt5: 'Saiba mais',
                prompt6: 'sobre níveis de etiqueta.',
            },
            overrideMultiTagWarning: {
                title: 'Importar tags',
                prompt1: 'Tem certeza?',
                prompt2: 'As tags existentes serão substituídas, mas você pode',
                prompt3: 'baixar um backup',
                prompt4: 'primeiro.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `Encontramos *${columnCounts} colunas* na sua planilha. Selecione *Nome* ao lado da coluna que contém os nomes das tags. Você também pode selecionar *Ativado* ao lado da coluna que define o status das tags.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Não é possível excluir ou desativar todas as tags',
                description: `Pelo menos uma tag deve permanecer ativada porque seu workspace exige tags.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Não é possível tornar todas as tags opcionais',
                description: `Pelo menos uma tag deve permanecer obrigatória porque as configurações do seu workspace exigem tags.`,
            },
            cannotMakeTagListRequired: {
                title: 'Não é possível tornar a lista de tags obrigatória',
                description: 'Você só pode tornar uma lista de tags obrigatória se sua política tiver vários níveis de tags configurados.',
            },
            tagCount: () => ({
                one: '1 dia',
                other: (count: number) => `${count} Etiquetas`,
            }),
        },
        taxes: {
            subtitle: 'Adicione nomes de impostos, taxas e defina padrões.',
            addRate: 'Adicionar taxa',
            workspaceDefault: 'Moeda padrão do workspace',
            foreignDefault: 'Padrão de moeda estrangeira',
            customTaxName: 'Nome de imposto personalizado',
            value: 'Valor',
            taxReclaimableOn: 'Imposto recuperável em',
            taxRate: 'Alíquota de imposto',
            findTaxRate: 'Encontrar taxa de imposto',
            error: {
                taxRateAlreadyExists: 'Este nome de imposto já está em uso',
                taxCodeAlreadyExists: 'Este código de imposto já está em uso',
                valuePercentageRange: 'Insira uma porcentagem válida entre 0 e 100',
                customNameRequired: 'Nome de imposto personalizado é obrigatório',
                deleteFailureMessage: 'Ocorreu um erro ao excluir a taxa de imposto. Tente novamente ou peça ajuda ao Concierge.',
                updateFailureMessage: 'Ocorreu um erro ao atualizar a taxa de imposto. Tente novamente ou peça ajuda ao Concierge.',
                createFailureMessage: 'Ocorreu um erro ao criar a taxa de imposto. Tente novamente ou peça ajuda ao Concierge.',
                updateTaxClaimableFailureMessage: 'A parte reembolsável deve ser menor que o valor da tarifa de distância',
            },
            deleteTaxConfirmation: 'Tem certeza de que deseja excluir este imposto?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Tem certeza de que deseja excluir ${taxAmount} impostos?`,
            actions: {
                delete: 'Excluir tarifa',
                deleteMultiple: 'Excluir taxas',
                enable: 'Ativar taxa',
                disable: 'Desativar taxa',
                enableTaxRates: () => ({
                    one: 'Ativar taxa',
                    other: 'Ativar tarifas',
                }),
                disableTaxRates: () => ({
                    one: 'Desativar taxa',
                    other: 'Desativar tarifas',
                }),
            },
            importedFromAccountingSoftware: 'Os impostos abaixo são importados do seu',
            taxCode: 'Código de imposto',
            updateTaxCodeFailureMessage: 'Ocorreu um erro ao atualizar o código de imposto, tente novamente',
        },
        duplicateWorkspace: {
            title: 'Dê um nome ao seu novo workspace',
            selectFeatures: 'Selecione recursos para copiar',
            whichFeatures: 'Quais recursos você deseja copiar para o seu novo workspace?',
            confirmDuplicate: 'Você deseja continuar?',
            categories: 'categorias e suas regras de categorização automática',
            reimbursementAccount: 'conta de reembolso',
            welcomeNote: 'Comece a usar meu novo workspace',
            delayedSubmission: 'envio atrasado',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Você está prestes a criar e compartilhar ${newWorkspaceName ?? ''} com ${totalMembers ?? 0} membros do workspace original.`,
            error: 'Ocorreu um erro ao duplicar seu novo workspace. Tente novamente.',
        },
        emptyWorkspace: {
            title: 'Você não tem espaços de trabalho',
            subtitle: 'Acompanhe recibos, reembolse despesas, gerencie viagens, envie faturas e muito mais.',
            createAWorkspaceCTA: 'Começar',
            features: {
                trackAndCollect: 'Acompanhe e colete recibos',
                reimbursements: 'Reembolsar funcionários',
                companyCards: 'Gerenciar cartões corporativos',
            },
            notFound: 'Nenhum workspace encontrado',
            description: 'Salas são um ótimo lugar para conversar e trabalhar com várias pessoas. Para começar a colaborar, crie ou participe de um workspace',
        },
        new: {
            newWorkspace: 'Novo espaço de trabalho',
            getTheExpensifyCardAndMore: 'Obtenha o Cartão Expensify e muito mais',
            confirmWorkspace: 'Confirmar espaço de trabalho',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Meu Espaço de Trabalho em Grupo${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Workspace de ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Ocorreu um erro ao remover um membro do workspace, tente novamente',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Tem certeza de que deseja remover ${memberName}?`,
                other: 'Tem certeza de que deseja remover estes membros?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} é um aprovador neste espaço de trabalho. Quando você deixar de compartilhar este espaço de trabalho com ele(a), nós o(a) substituiremos no fluxo de aprovação pelo proprietário do espaço de trabalho, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Remover membro',
                other: 'Remover membros',
            }),
            findMember: 'Encontrar membro',
            removeWorkspaceMemberButtonTitle: 'Remover do workspace',
            removeGroupMemberButtonTitle: 'Remover do grupo',
            removeRoomMemberButtonTitle: 'Remover do chat',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Tem certeza de que deseja remover ${memberName}?`,
            removeMemberTitle: 'Remover membro',
            transferOwner: 'Transferir proprietário',
            makeMember: () => ({
                one: 'Tornar membro',
                other: 'Tornar membros',
            }),
            makeAdmin: () => ({
                one: 'Tornar administrador',
                other: 'Tornar administradores',
            }),
            makeAuditor: () => ({
                one: 'Tornar auditor',
                other: 'Tornar auditores',
            }),
            selectAll: 'Selecionar tudo',
            error: {
                genericAdd: 'Houve um problema ao adicionar este membro do workspace',
                cannotRemove: 'Você não pode remover a si mesmo ou o proprietário do workspace',
                genericRemove: 'Houve um problema ao remover esse membro do workspace',
            },
            addedWithPrimary: 'Alguns membros foram adicionados com seus logins principais.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Adicionado pelo login secundário ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Total de membros do workspace: ${count}`,
            importMembers: 'Importar membros',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Se você remover ${approver} deste workspace, nós o substituiremos no fluxo de aprovação por ${workspaceOwner}, o proprietário do workspace.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} tem relatórios de despesas pendentes para aprovar. Peça que os aprove ou assuma o controle dos relatórios antes de removê-lo do workspace.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Você não pode remover ${memberName} deste workspace. Defina um novo reembolsador em Fluxos de Trabalho > Fazer ou acompanhar pagamentos e tente novamente.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Se você remover ${memberName} deste espaço de trabalho, nós o substituiremos como exportador preferencial por ${workspaceOwner}, o proprietário do espaço de trabalho.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Se você remover ${memberName} deste workspace, nós o substituiremos como contato técnico por ${workspaceOwner}, o proprietário do workspace.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} tem um relatório em processamento pendente de ação. Peça a ele(a) que conclua a ação necessária antes de removê-lo(a) do workspace.`,
        },
        card: {
            getStartedIssuing: 'Comece solicitando seu primeiro cartão virtual ou físico.',
            issueCard: 'Emitir cartão',
            issueNewCard: {
                whoNeedsCard: 'Quem precisa de um cartão?',
                inviteNewMember: 'Convidar novo membro',
                findMember: 'Encontrar membro',
                chooseCardType: 'Escolha um tipo de cartão',
                physicalCard: 'Cartão físico',
                physicalCardDescription: 'Ótimo para quem gasta com frequência',
                virtualCard: 'Cartão virtual',
                virtualCardDescription: 'Instantâneo e flexível',
                chooseLimitType: 'Escolha um tipo de limite',
                smartLimit: 'Limite Inteligente',
                smartLimitDescription: 'Gastar até um determinado valor antes de exigir aprovação',
                monthly: 'Mensal',
                monthlyDescription: 'Gaste até um determinado valor por mês',
                fixedAmount: 'Valor fixo',
                fixedAmountDescription: 'Gastar até um determinado valor uma vez',
                setLimit: 'Definir um limite',
                cardLimitError: 'Insira um valor menor que US$ 21.474.836',
                giveItName: 'Dê um nome',
                giveItNameInstruction: 'Torne-o único o suficiente para diferenciá-lo de outros cartões. Casos de uso específicos são ainda melhores!',
                cardName: 'Nome do cartão',
                letsDoubleCheck: 'Vamos conferir se está tudo certo.',
                willBeReadyToUse: 'Este cartão estará pronto para uso imediatamente.',
                willBeReadyToShip: 'Este cartão estará pronto para envio imediato.',
                cardholder: 'Titular do cartão',
                cardType: 'Tipo de cartão',
                limit: 'Limite',
                limitType: 'Tipo de limite',
                disabledApprovalForSmartLimitError: 'Ative as aprovações em <strong>Workflows > Adicionar aprovações</strong> antes de configurar limites inteligentes',
                singleUse: 'Uso único',
                singleUseDescription: 'Expira após uma transação',
                validFrom: 'Válido a partir de',
                startDate: 'Data de início',
                endDate: 'Data de término',
                noExpirationHint: 'Um cartão sem data de validade não expirará',
                validFromTo: ({startDate, endDate}: {startDate: string; endDate: string}) => `Válido de ${startDate} a ${endDate}`,
                validFromToWithoutText: ({startDate, endDate}: {startDate: string; endDate: string}) => `${startDate} a ${endDate}`,
                combineWithExpiration: 'Combine com opções de validade para controle adicional de gastos',
                enterValidDate: 'Digite uma data válida',
                expirationDate: 'Data de validade',
                limitAmount: 'Valor do limite',
                setExpiryOptions: 'Definir opções de validade',
                setExpiryDate: 'Definir data de validade',
                setExpiryDateDescription: 'O cartão expirará conforme indicado no cartão',
                amount: 'Valor',
            },
            deactivateCardModal: {
                deactivate: 'Desativar',
                deactivateCard: 'Desativar cartão',
                deactivateConfirmation: 'Desativar este cartão recusará todas as transações futuras e não poderá ser desfeito.',
            },
        },
        accounting: {
            settings: 'Configurações',
            title: 'Conexões',
            subtitle:
                'Conecte-se ao seu sistema contábil para classificar transações com seu plano de contas, fazer a correspondência automática de pagamentos e manter suas finanças em sincronia.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Converse com seu especialista de configuração.',
            talkYourAccountManager: 'Converse com o seu gerente de conta.',
            talkToConcierge: 'Converse com o Concierge.',
            needAnotherAccounting: 'Precisa de outro software de contabilidade?',
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
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `Há um erro em uma conexão configurada no Expensify Classic. [Vá para o Expensify Classic para corrigir esse problema.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: 'Vá para o Expensify Classic para gerenciar suas configurações.',
            setup: 'Conectar',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Última sincronização ${relativeDate}`,
            notSync: 'Não sincronizado',
            import: 'Importar',
            export: 'Exportar',
            advanced: 'Avançado',
            other: 'Outro',
            syncNow: 'Sincronizar agora',
            disconnect: 'Desconectar',
            reinstall: 'Reinstalar conector',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integração';
                return `Desconectar ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Conectar ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'integração contábil'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Não é possível conectar ao QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Não é possível conectar ao Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Não é possível conectar ao NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Não é possível conectar ao QuickBooks Desktop';
                    default: {
                        return 'Não é possível conectar à integração';
                    }
                }
            },
            accounts: 'Plano de contas',
            taxes: 'Impostos',
            imported: 'Importado',
            notImported: 'Não importado',
            importAsCategory: 'Importado como categorias',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'Importado',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Importado como tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Importado',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'Não importado',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'Não importado',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Importado como campos de relatório',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Padrão de funcionário NetSuite',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'esta integração';
                return `Tem certeza de que deseja desconectar ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Tem certeza de que deseja conectar ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'esta integração contábil'}? Isso removerá quaisquer conexões contábeis existentes.`,
            enterCredentials: 'Insira suas credenciais',
            claimOffer: {
                badgeText: 'Oferta disponível!',
                xero: {
                    headline: 'Obtenha Xero grátis por 6 meses!',
                    description: '<muted-text><centered-text>Novo no Xero? Clientes Expensify ganham 6 meses grátis. Resgate sua oferta abaixo.</centered-text></muted-text>',
                    connectButton: 'Conectar ao Xero',
                },
                uber: {
                    headerTitle: 'Uber for Business',
                    headline: 'Obtenha 5% de desconto em viagens do Uber',
                    description: `<muted-text><centered-text>Ative o Uber for Business através do Expensify e economize 5% em todas as viagens de negócios até junho. <a href="${CONST.UBER_TERMS_LINK}">Termos se aplicam.</a></centered-text></muted-text>`,
                    connectButton: 'Conectar ao Uber for Business',
                },
            },
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Importando clientes';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return 'Importando funcionários';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Importando contas';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Importando classes';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importando locais';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Processando dados importados';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Sincronizando relatórios reembolsados e pagamentos de contas';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importando códigos de imposto';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Verificando conexão com QuickBooks Online';
                        case 'quickbooksOnlineImportMain':
                            return 'Importando dados do QuickBooks Online';
                        case 'startingImportXero':
                            return 'Importando dados do Xero';
                        case 'startingImportQBO':
                            return 'Importando dados do QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importando dados do QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importando título';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importando certificado de aprovação';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importando dimensões';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importando política de salvamento';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Ainda sincronizando dados com o QuickBooks... Certifique-se de que o Web Connector esteja em execução';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Sincronizando dados do QuickBooks Online';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Carregando dados';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Atualizando categorias';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Atualizando clientes/projetos';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Atualizando lista de pessoas';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Atualizando campos do relatório';
                        case 'jobDone':
                            return 'Aguardando o carregamento dos dados importados';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Sincronizando plano de contas';
                        case 'xeroSyncImportCategories':
                            return 'Sincronizando categorias';
                        case 'xeroSyncImportCustomers':
                            return 'Sincronizando clientes';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Marcando relatórios do Expensify como reembolsados';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Marcando contas e faturas do Xero como pagas';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Sincronizando categorias de rastreamento';
                        case 'xeroSyncImportBankAccounts':
                            return 'Sincronizando contas bancárias';
                        case 'xeroSyncImportTaxRates':
                            return 'Sincronizando taxas de imposto';
                        case 'xeroCheckConnection':
                            return 'Verificando conexão com Xero';
                        case 'xeroSyncTitle':
                            return 'Sincronizando dados do Xero';
                        case 'netSuiteSyncConnection':
                            return 'Inicializando conexão com o NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Importando clientes';
                        case 'netSuiteSyncInitData':
                            return 'Recuperando dados do NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Importando impostos';
                        case 'netSuiteSyncImportItems':
                            return 'Importando itens';
                        case 'netSuiteSyncData':
                            return 'Importando dados para o Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Sincronizando contas';
                        case 'netSuiteSyncCurrencies':
                            return 'Sincronizando moedas';
                        case 'netSuiteSyncCategories':
                            return 'Sincronizando categorias';
                        case 'netSuiteSyncReportFields':
                            return 'Importando dados como campos de relatório do Expensify';
                        case 'netSuiteSyncTags':
                            return 'Importando dados como tags do Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Atualizando informações de conexão';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Marcando relatórios do Expensify como reembolsados';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Marcando contas e faturas do NetSuite como pagas';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importando fornecedores';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importando listas personalizadas';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importando listas personalizadas';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importando subsidiárias';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importando fornecedores';
                        case 'intacctCheckConnection':
                            return 'Verificando conexão com Sage Intacct';
                        case 'intacctImportDimensions':
                            return 'Importando dimensões do Sage Intacct';
                        case 'intacctImportTitle':
                            return 'Importando dados do Sage Intacct';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Tradução ausente para o estágio: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Exportador preferido',
            exportPreferredExporterNote:
                'O exportador preferencial pode ser qualquer administrador do espaço de trabalho, mas também deve ser um Administrador de Domínio se você definir contas de exportação diferentes para cartões corporativos individuais nas Configurações de Domínio.',
            exportPreferredExporterSubNote: 'Depois de definido, o exportador preferencial verá os relatórios para exportação na conta dele.',
            exportAs: 'Exportar como',
            exportOutOfPocket: 'Exportar despesas pagas do próprio bolso como',
            exportCompanyCard: 'Exportar despesas de cartão corporativo como',
            exportDate: 'Data de exportação',
            defaultVendor: 'Fornecedor padrão',
            autoSync: 'Sincronização automática',
            autoSyncDescription: 'Sincronize o NetSuite e o Expensify automaticamente, todos os dias. Exporte relatórios finalizados em tempo real',
            reimbursedReports: 'Sincronizar relatórios reembolsados',
            cardReconciliation: 'Reconciliação de cartão',
            reconciliationAccount: 'Conta de reconciliação',
            continuousReconciliation: 'Conciliação Contínua',
            saveHoursOnReconciliation:
                'Economize horas em cada período contábil de conciliação fazendo com que a Expensify reconcilie continuamente, em seu nome, os extratos e liquidações do Expensify Card.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>Para ativar a Conciliação Contínua, ative a <a href="${accountingAdvancedSettingsLink}">sincronização automática</a> para ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Escolha a conta bancária na qual os pagamentos do seu Cartão Expensify serão conciliados.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Certifique-se de que esta conta corresponda à sua <a href="${settlementAccountUrl}">conta de liquidação do Cartão Expensify</a> (terminando em ${lastFourPAN}) para que a Conciliação Contínua funcione corretamente.`,
            },
        },
        export: {
            notReadyHeading: 'Não pronto para exportar',
            notReadyDescription: 'Relatórios de despesas em rascunho ou pendentes não podem ser exportados para o sistema contábil. Aprove ou pague essas despesas antes de exportá-las.',
        },
        invoices: {
            sendInvoice: 'Enviar fatura',
            sendFrom: 'Enviar de',
            invoicingDetails: 'Detalhes de faturamento',
            invoicingDetailsDescription: 'Essas informações aparecerão em suas faturas.',
            companyName: 'Nome da empresa',
            companyWebsite: 'Site da empresa',
            paymentMethods: {
                personal: 'Pessoal',
                business: 'Negócios',
                chooseInvoiceMethod: 'Escolha um método de pagamento abaixo:',
                payingAsIndividual: 'Pagando como pessoa física',
                payingAsBusiness: 'Pagando como empresa',
            },
            invoiceBalance: 'Saldo da fatura',
            invoiceBalanceSubtitle:
                'Este é o seu saldo atual proveniente do recebimento de pagamentos de faturas. Ele será transferido automaticamente para sua conta bancária se você tiver adicionado uma.',
            bankAccountsSubtitle: 'Adicione uma conta bancária para fazer e receber pagamentos de faturas.',
        },
        invite: {
            member: 'Convidar membro',
            members: 'Convidar membros',
            invitePeople: 'Convidar novos membros',
            genericFailureMessage: 'Ocorreu um erro ao convidar o membro para o workspace. Tente novamente.',
            pleaseEnterValidLogin: `Certifique-se de que o e-mail ou número de telefone seja válido (por exemplo, ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'usuário',
            users: 'Usuários',
            invited: 'convidado',
            removed: 'Removido',
            to: 'para',
            from: 'de',
        },
        inviteMessage: {
            confirmDetails: 'Confirmar detalhes',
            inviteMessagePrompt: 'Deixe seu convite ainda mais especial adicionando uma mensagem abaixo!',
            personalMessagePrompt: 'Mensagem',
            genericFailureMessage: 'Ocorreu um erro ao convidar o membro para o workspace. Tente novamente.',
            inviteNoMembersError: 'Selecione pelo menos um membro para convidar',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} solicitou para entrar em ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Opa! Calma lá...',
            workspaceNeeds: 'Uma workspace precisa de pelo menos uma tarifa de distância ativada.',
            distance: 'Distância',
            centrallyManage: 'Gerencie tarifas centralmente, registre em milhas ou quilômetros e defina uma categoria padrão.',
            rate: 'Taxa',
            addRate: 'Adicionar taxa',
            findRate: 'Encontrar taxa',
            trackTax: 'Acompanhar imposto',
            deleteRates: () => ({
                one: 'Excluir tarifa',
                other: 'Excluir taxas',
            }),
            enableRates: () => ({
                one: 'Ativar taxa',
                other: 'Ativar tarifas',
            }),
            disableRates: () => ({
                one: 'Desativar taxa',
                other: 'Desativar tarifas',
            }),
            enableRate: 'Ativar taxa',
            status: 'Status',
            unit: 'Unidade',
            taxFeatureNotEnabledMessage:
                '<muted-text>Os impostos devem estar ativados no workspace para usar este recurso. Vá até <a href="#">Mais recursos</a> para fazer essa alteração.</muted-text>',
            deleteDistanceRate: 'Excluir taxa de distância',
            areYouSureDelete: () => ({
                one: 'Tem certeza de que deseja excluir esta taxa?',
                other: 'Tem certeza de que deseja excluir essas tarifas?',
            }),
            errors: {
                rateNameRequired: 'Nome da taxa é obrigatório',
                existingRateName: 'Já existe uma tarifa de distância com este nome',
            },
        },
        editor: {
            descriptionInputLabel: 'Descrição',
            nameInputLabel: 'Nome',
            typeInputLabel: 'Tipo',
            initialValueInputLabel: 'Valor inicial',
            nameInputHelpText: 'Este é o nome que você verá no seu workspace.',
            nameIsRequiredError: 'Você precisará dar um nome ao seu workspace',
            currencyInputLabel: 'Moeda padrão',
            currencyInputHelpText: 'Todas as despesas neste workspace serão convertidas para esta moeda.',
            currencyInputDisabledText: (currency: string) => `A moeda padrão não pode ser alterada porque este workspace está vinculado a uma conta bancária em ${currency}.`,
            save: 'Salvar',
            genericFailureMessage: 'Ocorreu um erro ao atualizar o workspace. Tente novamente.',
            avatarUploadFailureMessage: 'Ocorreu um erro ao enviar o avatar. Tente novamente.',
            addressContext: 'Um endereço do espaço de trabalho é necessário para ativar o Expensify Travel. Insira um endereço associado à sua empresa.',
            policy: 'Política de despesas',
        },
        bankAccount: {
            continueWithSetup: 'Continuar configuração',
            youAreAlmostDone:
                'Você está quase terminando a configuração da sua conta bancária, o que permitirá emitir cartões corporativos, reembolsar despesas, receber faturas e pagar contas.',
            streamlinePayments: 'Agilizar pagamentos',
            connectBankAccountNote: 'Observação: Contas bancárias pessoais não podem ser usadas para pagamentos em espaços de trabalho.',
            oneMoreThing: 'Mais uma coisa!',
            allSet: 'Tudo pronto!',
            accountDescriptionWithCards: 'Esta conta bancária será usada para emitir cartões corporativos, reembolsar despesas, receber faturas e pagar contas.',
            letsFinishInChat: 'Vamos terminar no chat!',
            finishInChat: 'Concluir no chat',
            almostDone: 'Quase pronto!',
            disconnectBankAccount: 'Desconectar conta bancária',
            startOver: 'Recomeçar',
            updateDetails: 'Atualizar detalhes',
            yesDisconnectMyBankAccount: 'Sim, desconectar minha conta bancária',
            yesStartOver: 'Sim, começar de novo',
            disconnectYourBankAccount: (bankName: string) => `Desconecte sua conta bancária <strong>${bankName}</strong>. Qualquer transação pendente para esta conta ainda será concluída.`,
            clearProgress: 'Recomeçar apagará o progresso que você fez até agora.',
            areYouSure: 'Tem certeza?',
            workspaceCurrency: 'Moeda do workspace',
            updateCurrencyPrompt: 'Parece que seu workspace está atualmente definido para uma moeda diferente de USD. Clique no botão abaixo para atualizar sua moeda para USD agora.',
            updateToUSD: 'Atualizar para USD',
            updateWorkspaceCurrency: 'Atualizar moeda do workspace',
            workspaceCurrencyNotSupported: 'Moeda do workspace não é compatível',
            yourWorkspace: `Sua workspace está configurada para uma moeda não compatível. Veja a <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">lista de moedas compatíveis</a>.`,
            chooseAnExisting: 'Escolha uma conta bancária existente para pagar despesas ou adicione uma nova.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Transferir proprietário',
            addPaymentCardTitle: 'Insira seu cartão de pagamento para transferir a propriedade',
            addPaymentCardButtonText: 'Aceitar os termos e adicionar cartão de pagamento',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Leia e aceite os <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">termos</a> e a <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">política de privacidade</a> para adicionar seu cartão.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'Compatível com PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Criptografia em nível bancário',
            addPaymentCardRedundant: 'Infraestrutura redundante',
            addPaymentCardLearnMore: `<muted-text>Saiba mais sobre nossa <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">segurança</a>.</muted-text>`,
            amountOwedTitle: 'Saldo pendente',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Esta conta tem um saldo pendente de um mês anterior.\n\nVocê quer quitar o saldo e assumir a cobrança deste espaço de trabalho?',
            ownerOwesAmountTitle: 'Saldo pendente',
            ownerOwesAmountButtonText: 'Transferir saldo',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `A conta proprietária deste espaço de trabalho (${email}) tem um saldo pendente de um mês anterior.

Você deseja transferir esse valor (${amount}) para assumir a cobrança deste espaço de trabalho? Seu cartão de pagamento será cobrado imediatamente.`,
            subscriptionTitle: 'Assumir assinatura anual',
            subscriptionButtonText: 'Transferir assinatura',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Assumir este workspace irá mesclar a assinatura anual dele com a sua assinatura atual. Isso aumentará o tamanho da sua assinatura em ${usersCount} membros, tornando o novo tamanho da sua assinatura ${finalCount}. Você gostaria de continuar?`,
            duplicateSubscriptionTitle: 'Alerta de assinatura duplicada',
            duplicateSubscriptionButtonText: 'Continuar',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `Parece que você está tentando assumir a cobrança dos workspaces de ${email}, mas, para isso, primeiro você precisa ser administrador de todos os workspaces dessa pessoa.

Clique em “Continuar” se você quiser assumir a cobrança apenas do workspace ${workspaceName}.

Se você quiser assumir a cobrança de toda a assinatura, peça para essa pessoa adicioná-lo como administrador em todos os workspaces dela antes de assumir a cobrança.`,
            hasFailedSettlementsTitle: 'Não é possível transferir a propriedade',
            hasFailedSettlementsButtonText: 'Entendi',
            hasFailedSettlementsText: (email: string) =>
                `Você não pode assumir o faturamento porque ${email} tem uma quitação em atraso do Expensify Card. Peça para essa pessoa entrar em contato com concierge@expensify.com para resolver o problema. Depois disso, você poderá assumir o faturamento deste workspace.`,
            failedToClearBalanceTitle: 'Falha ao limpar saldo',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Não foi possível zerar o saldo. Tente novamente mais tarde.',
            successTitle: 'Eba! Tudo pronto.',
            successDescription: 'Você agora é o proprietário deste workspace.',
            errorTitle: 'Opa! Calma lá...',
            errorDescription: `<muted-text><centered-text>Houve um problema ao transferir a propriedade deste workspace. Tente novamente ou <concierge-link>entre em contato com o Concierge</concierge-link> para obter ajuda.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: 'Cuidado!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `Os seguintes relatórios já foram exportados para ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:

${reportName}

Tem certeza de que deseja exportá-los novamente?`,
            confirmText: 'Sim, exportar novamente',
            cancelText: 'Cancelar',
        },
        upgrade: {
            reportFields: {
                title: 'Campos de relatório',
                description: `Os campos de relatório permitem especificar detalhes no nível do cabeçalho, distintos das tags que se aplicam às despesas em itens de linha individuais. Esses detalhes podem incluir nomes específicos de projetos, informações de viagens de negócios, localidades e muito mais.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Os campos de relatório estão disponíveis apenas no plano Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Aproveite a sincronização automática e reduza lançamentos manuais com a integração Expensify + NetSuite. Obtenha insights financeiros detalhados em tempo real com suporte a segmentos nativos e personalizados, incluindo mapeamento de projetos e clientes.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nossa integração com o NetSuite está disponível apenas no plano Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Aproveite a sincronização automatizada e reduza os lançamentos manuais com a integração Expensify + Sage Intacct. Obtenha insights financeiros detalhados e em tempo real com dimensões definidas pelo usuário, além da categorização de despesas por departamento, classe, local, cliente e projeto (trabalho).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nossa integração com o Sage Intacct está disponível apenas no plano Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Aproveite a sincronização automática e reduza lançamentos manuais com a integração Expensify + QuickBooks Desktop. Alcance máxima eficiência com uma conexão bidirecional em tempo real e categorização de despesas por classe, item, cliente e projeto.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nossa integração com o QuickBooks Desktop está disponível apenas no plano Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Aprovações Avançadas',
                description: `Se você quiser adicionar mais camadas de aprovação ao processo – ou apenas garantir que as maiores despesas recebam uma segunda olhada – nós cuidamos disso para você. As aprovações avançadas ajudam você a implementar os controles certos em cada nível, para manter os gastos da sua equipe sob controle.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Aprovações avançadas estão disponíveis apenas no plano Control, que começa em <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            categories: {
                title: 'Categorias',
                description: 'Categorias permitem que você acompanhe e organize os gastos. Use nossas categorias padrão ou adicione as suas próprias.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Categorias estão disponíveis no plano Collect, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            glCodes: {
                title: 'Códigos GL',
                description: `Adicione códigos GL às suas categorias e tags para facilitar a exportação de despesas para seus sistemas de contabilidade e folha de pagamento.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Códigos GL estão disponíveis apenas no plano Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Códigos de GL e folha de pagamento',
                description: `Adicione códigos de Razão Contábil (GL) e de Folha de Pagamento às suas categorias para facilitar a exportação de despesas para seus sistemas contábeis e de folha de pagamento.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Códigos de GL e Folha de pagamento estão disponíveis apenas no plano Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Códigos de imposto',
                description: `Adicione códigos de imposto aos seus impostos para facilitar a exportação de despesas para seus sistemas contábeis e de folha de pagamento.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Códigos de impostos estão disponíveis apenas no plano Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            companyCards: {
                title: 'Cartões corporativos ilimitados',
                description: `Precisa adicionar mais feeds de cartões? Desbloqueie cartões corporativos ilimitados para sincronizar transações de todos os principais emissores de cartões.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Isso está disponível apenas no plano Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            rules: {
                title: 'Regras',
                description: `As regras são executadas em segundo plano e mantêm seus gastos sob controle para que você não precise se preocupar com os detalhes.

Exija detalhes de despesas como recibos e descrições, defina limites e padrões e automatize aprovações e pagamentos – tudo em um só lugar.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Regras estão disponíveis apenas no plano Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            perDiem: {
                title: 'Diária',
                description:
                    'Per diem é uma ótima maneira de manter seus custos diários em conformidade e previsíveis sempre que seus funcionários viajarem. Aproveite recursos como tarifas personalizadas, categorias padrão e detalhes mais granulares, como destinos e subtaxas.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Diárias só estão disponíveis no plano Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            travel: {
                title: 'Viagem',
                description:
                    'Expensify Travel é uma nova plataforma corporativa de reserva e gerenciamento de viagens que permite aos membros reservar acomodações, voos, transporte e muito mais.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Viagens está disponível no plano Collect, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            reports: {
                title: 'Relatórios',
                description: 'Relatórios permitem agrupar despesas para facilitar o acompanhamento e a organização.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Relatórios estão disponíveis no plano Collect, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Tags em múltiplos níveis',
                description:
                    'Tags em vários níveis ajudam você a rastrear despesas com maior precisão. Atribua várias tags a cada item de linha — como departamento, cliente ou centro de custo — para capturar todo o contexto de cada despesa. Isso permite relatórios mais detalhados, fluxos de aprovação e exportações contábeis.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Marcadores de múltiplos níveis estão disponíveis apenas no plano Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Tarifas de distância',
                description: 'Crie e gerencie suas próprias tarifas, registre em milhas ou quilômetros e defina categorias padrão para despesas de deslocamento.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>As tarifas de distância estão disponíveis no plano Collect, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            auditor: {
                title: 'Auditor',
                description: 'Auditores recebem acesso somente leitura a todos os relatórios para total visibilidade e monitoramento de conformidade.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Auditores estão disponíveis apenas no plano Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Vários níveis de aprovação',
                description:
                    'Múltiplos níveis de aprovação são uma ferramenta de fluxo de trabalho para empresas que exigem que mais de uma pessoa aprove um relatório antes que ele possa ser reembolsado.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Vários níveis de aprovação estão disponíveis apenas no plano Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'por membro ativo por mês.',
                perMember: 'por membro por mês.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Faça o upgrade para acessar este recurso ou <a href="${subscriptionLink}">saiba mais</a> sobre nossos planos e preços.</muted-text>`,
            upgradeToUnlock: 'Desbloquear este recurso',
            completed: {
                headline: `Você atualizou seu workspace!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Você atualizou ${policyName} para o plano Control com sucesso! <a href="${subscriptionLink}">Veja sua assinatura</a> para mais detalhes.</centered-text>`,
                categorizeMessage: `Você fez o upgrade com sucesso para o plano Collect. Agora você pode categorizar suas despesas!`,
                travelMessage: `Você fez upgrade com sucesso para o plano Collect. Agora você pode começar a reservar e gerenciar viagens!`,
                distanceRateMessage: `Você fez upgrade para o plano Collect com sucesso. Agora você pode alterar a taxa de distância!`,
                gotIt: 'Entendido, obrigado',
                createdWorkspace: `Você criou um workspace!`,
            },
            commonFeatures: {
                title: 'Atualizar para o plano Control',
                note: 'Desbloqueie nossos recursos mais poderosos, incluindo:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>O plano Control começa em <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por membro por mês.` : `por membro ativo por mês.`} <a href="${learnMoreMethodsRoute}">Saiba mais</a> sobre nossos planos e preços.</muted-text>`,
                    benefit1: 'Conexões avançadas de contabilidade (NetSuite, Sage Intacct e mais)',
                    benefit2: 'Regras inteligentes de despesas',
                    benefit3: 'Fluxos de aprovação em vários níveis',
                    benefit4: 'Controles de segurança avançados',
                    toUpgrade: 'Para fazer upgrade, clique',
                    selectWorkspace: 'selecione um workspace e altere o tipo de plano para',
                },
                upgradeWorkspaceWarning: 'Não é possível atualizar o espaço de trabalho',
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: 'Sua empresa restringiu a criação de espaços de trabalho. Entre em contato com um administrador para obter ajuda.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Fazer downgrade para o plano Collect',
                note: 'Se você fizer o downgrade, perderá acesso a estes recursos e mais:',
                benefits: {
                    note: 'Para uma comparação completa dos nossos planos, confira nosso',
                    pricingPage: 'página de preços',
                    confirm: 'Tem certeza de que deseja fazer o downgrade e remover suas configurações?',
                    warning: 'Isso não pode ser desfeito.',
                    benefit1: 'Conexões contábeis (exceto QuickBooks Online e Xero)',
                    benefit2: 'Regras inteligentes de despesas',
                    benefit3: 'Fluxos de aprovação em vários níveis',
                    benefit4: 'Controles de segurança avançados',
                    headsUp: 'Atenção!',
                    multiWorkspaceNote:
                        'Você precisará rebaixar todos os seus espaços de trabalho antes do seu primeiro pagamento mensal para iniciar uma assinatura na tarifa Collect. Clique',
                    selectStep: '> selecione cada espaço de trabalho > altere o tipo de plano para',
                },
            },
            completed: {
                headline: 'Seu workspace foi rebaixado',
                description: 'Você tem outros espaços de trabalho no plano Control. Para ser cobrado na tarifa Collect, é preciso rebaixar todos os espaços de trabalho.',
                gotIt: 'Entendido, obrigado',
            },
        },
        payAndDowngrade: {
            title: 'Pagar e fazer downgrade',
            headline: 'Seu pagamento final',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Sua fatura final para esta assinatura será de <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `Veja seu detalhamento abaixo para ${date}:`,
            subscription:
                'Atenção! Esta ação encerrará sua assinatura do Expensify, excluirá este workspace e removerá todos os membros do workspace. Se você quiser manter este workspace e apenas se remover, peça para outro administrador assumir a cobrança primeiro.',
            genericFailureMessage: 'Ocorreu um erro ao pagar sua fatura. Tente novamente.',
        },
        restrictedAction: {
            restricted: 'Restrito',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Ações no workspace ${workspaceName} estão atualmente restritas`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `O proprietário do workspace, ${workspaceOwnerName}, precisará adicionar ou atualizar o cartão de pagamento em arquivo para desbloquear novas atividades no workspace.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Você precisará adicionar ou atualizar o cartão de pagamento em arquivo para desbloquear novas atividades do workspace.',
            addPaymentCardToUnlock: 'Adicione um cartão de pagamento para desbloquear!',
            addPaymentCardToContinueUsingWorkspace: 'Adicione um cartão de pagamento para continuar usando este workspace',
            pleaseReachOutToYourWorkspaceAdmin: 'Entre em contato com o administrador do seu workspace para quaisquer dúvidas.',
            chatWithYourAdmin: 'Converse com o seu administrador',
            chatInAdmins: 'Converse em #admins',
            addPaymentCard: 'Adicionar cartão de pagamento',
            goToSubscription: 'Ir para Assinatura',
        },
        rules: {
            individualExpenseRules: {
                title: 'Despesas',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>Defina controles de gastos e padrões para despesas individuais. Você também pode criar regras para <a href="${categoriesPageLink}">categorias</a> e <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                receiptRequiredAmount: 'Valor que exige recibo',
                receiptRequiredAmountDescription: 'Exigir recibos quando o gasto exceder este valor, a menos que seja substituído por uma regra de categoria.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `O valor não pode ser maior que o valor necessário para recibos detalhados (${amount})`,
                itemizedReceiptRequiredAmount: 'Valor necessário do recibo detalhado',
                itemizedReceiptRequiredAmountDescription: 'Exigir recibos detalhados quando o gasto exceder este valor, a menos que seja substituído por uma regra de categoria.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `O valor não pode ser menor que o valor necessário para recibos regulares (${amount})`,
                maxExpenseAmount: 'Valor máximo da despesa',
                maxExpenseAmountDescription: 'Sinalizar gastos que excedam esse valor, a menos que sejam substituídos por uma regra de categoria.',
                maxAge: 'Idade máxima',
                maxExpenseAge: 'Idade máxima da despesa',
                maxExpenseAgeDescription: 'Sinalizar despesas mais antigas que um número específico de dias.',
                maxExpenseAgeDays: () => ({
                    one: '1 dia',
                    other: (count: number) => `${count} dias`,
                }),
                cashExpenseDefault: 'Padrão de despesa em dinheiro',
                cashExpenseDefaultDescription:
                    'Escolha como as despesas em dinheiro devem ser criadas. Uma despesa é considerada em dinheiro se não for uma transação de cartão corporativo importada. Isso inclui despesas criadas manualmente, recibos, diárias, distância e despesas de tempo.',
                reimbursableDefault: 'Reembolsável',
                reimbursableDefaultDescription: 'As despesas geralmente são reembolsadas aos funcionários',
                nonReimbursableDefault: 'Não reembolsável',
                nonReimbursableDefaultDescription: 'Despesas são ocasionalmente reembolsadas aos funcionários',
                alwaysReimbursable: 'Sempre reembolsável',
                alwaysReimbursableDescription: 'As despesas são sempre reembolsadas aos funcionários',
                alwaysNonReimbursable: 'Sempre não reembolsável',
                alwaysNonReimbursableDescription: 'Despesas nunca são reembolsadas aos funcionários',
                billableDefault: 'Faturável padrão',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Escolha se as despesas em dinheiro e no cartão de crédito devem ser faturáveis por padrão. As despesas faturáveis são ativadas ou desativadas em <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                billable: 'Faturável',
                billableDescription: 'Despesas são mais frequentemente refaturadas para clientes',
                nonBillable: 'Não faturável',
                nonBillableDescription: 'Despesas são ocasionalmente refaturadas para clientes',
                eReceipts: 'eRecibos',
                eReceiptsHint: `Os eReceipts são criados automaticamente [para a maioria das transações em crédito em USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Rastreamento de participantes',
                attendeeTrackingHint: 'Acompanhe o custo por pessoa de cada despesa.',
                prohibitedDefaultDescription:
                    'Sinalize quaisquer recibos em que apareçam álcool, jogos de azar ou outros itens restritos. Despesas com recibos em que esses itens de linha apareçam exigirão revisão manual.',
                prohibitedExpenses: 'Despesas proibidas',
                alcohol: 'Álcool',
                hotelIncidentals: 'Despesas extras de hotel',
                gambling: 'Jogos de azar',
                tobacco: 'Tabaco',
                adultEntertainment: 'Entretenimento adulto',
                requireCompanyCard: 'Exigir cartões corporativos para todas as compras',
                requireCompanyCardDescription: 'Sinalize todas as despesas em dinheiro, incluindo quilometragem e diárias.',
            },
            expenseReportRules: {
                title: 'Avançado',
                subtitle: 'Automatize a conformidade, as aprovações e o pagamento de relatórios de despesas.',
                preventSelfApprovalsTitle: 'Impedir autoaprovações',
                preventSelfApprovalsSubtitle: 'Impedir que membros do workspace aprovem seus próprios relatórios de despesas.',
                autoApproveCompliantReportsTitle: 'Aprovar automaticamente relatórios em conformidade',
                autoApproveCompliantReportsSubtitle: 'Configure quais relatórios de despesas são elegíveis para aprovação automática.',
                autoApproveReportsUnderTitle: 'Aprovar automaticamente relatórios abaixo de',
                autoApproveReportsUnderDescription: 'Relatórios de despesa totalmente conformes abaixo deste valor serão aprovados automaticamente.',
                randomReportAuditTitle: 'Auditoria aleatória de relatório',
                randomReportAuditDescription: 'Exigir que alguns relatórios sejam aprovados manualmente, mesmo que sejam elegíveis para aprovação automática.',
                autoPayApprovedReportsTitle: 'Relatórios aprovados para pagamento automático',
                autoPayApprovedReportsSubtitle: 'Configure quais relatórios de despesas são elegíveis para pagamento automático.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Insira um valor menor que ${currency ?? ''}20.000`,
                autoPayApprovedReportsLockedSubtitle: 'Vá para Mais recursos e ative Fluxos de trabalho, depois adicione Pagamentos para desbloquear este recurso.',
                autoPayReportsUnderTitle: 'Relatórios de pagamento automático sob',
                autoPayReportsUnderDescription: 'Relatórios de despesas totalmente compatíveis abaixo deste valor serão pagos automaticamente.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `Adicione ${featureName} para desbloquear esse recurso.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `Vá para [mais recursos](${moreFeaturesLink}) e ative ${featureName} para desbloquear este recurso.`,
            },
            categoryRules: {
                title: 'Regras de categoria',
                approver: 'Aprovador',
                requireDescription: 'Exigir descrição',
                requireFields: 'Exigir campos',
                requiredFieldsTitle: 'Campos obrigatórios',
                requiredFieldsDescription: (categoryName: string) => `Isso será aplicado a todas as despesas categorizadas como <strong>${categoryName}</strong>.`,
                requireAttendees: 'Exigir participantes',
                descriptionHint: 'Dica de descrição',
                descriptionHintDescription: (categoryName: string) =>
                    `Lembre os funcionários de fornecer informações adicionais para gastos em “${categoryName}”. Essa dica aparece no campo de descrição das despesas.`,
                descriptionHintLabel: 'Dica',
                descriptionHintSubtitle: 'Dica profissional: Quanto mais curto, melhor!',
                maxAmount: 'Valor máximo',
                flagAmountsOver: 'Sinalizar valores acima de',
                flagAmountsOverDescription: (categoryName: string) => `Aplica-se à categoria “${categoryName}”.`,
                flagAmountsOverSubtitle: 'Isso substitui o valor máximo para todas as despesas.',
                expenseLimitTypes: {
                    expense: 'Despesa individual',
                    expenseSubtitle: 'Sinalizar valores de despesas por categoria. Esta regra substitui a regra geral do espaço de trabalho para o valor máximo de despesa.',
                    daily: 'Total da categoria',
                    dailySubtitle: 'Sinalizar o total diário gasto por categoria em cada relatório de despesas.',
                },
                requireReceiptsOver: 'Exigir recibos acima de',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Padrão`,
                    never: 'Nunca exigir recibos',
                    always: 'Sempre exigir recibos',
                },
                requireItemizedReceiptsOver: 'Exigir recibos detalhados acima de',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Padrão`,
                    never: 'Nunca exigir recibos detalhados',
                    always: 'Sempre exigir recibos detalhados',
                },
                defaultTaxRate: 'Taxa de imposto padrão',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Vá para [Mais recursos](${moreFeaturesLink}) e ative os fluxos de trabalho, depois adicione aprovações para desbloquear este recurso.`,
            },
            customRules: {
                title: 'Política de despesas',
                cardSubtitle: 'É aqui que fica a política de despesas da sua equipe, para que todos estejam alinhados sobre o que é coberto.',
            },
            merchantRules: {
                title: 'Estabelecimento',
                subtitle: 'Defina as regras de comerciante para que as despesas cheguem corretamente categorizadas e exijam menos retrabalho.',
                addRule: 'Adicionar regra de estabelecimento',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `Se o comerciante ${isExactMatch ? 'corresponde exatamente' : 'contém'} "${merchantName}"`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `Renomear comerciante para "${merchantName}"`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `Atualizar ${fieldName} para "${fieldValue}"`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `Marcar como "${reimbursable ? 'reembolsável' : 'não reembolsável'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `Marcar como "${billable ? 'faturável' : 'não faturável'}"`,
                addRuleTitle: 'Adicionar regra',
                expensesWith: 'Para despesas com:',
                applyUpdates: 'Aplicar estas atualizações:',
                saveRule: 'Salvar regra',
                confirmError: 'Insira o estabelecimento e aplique pelo menos uma atualização',
                confirmErrorMerchant: 'Insira o comerciante',
                confirmErrorUpdate: 'Por favor, aplique pelo menos uma atualização',
                editRuleTitle: 'Editar regra',
                deleteRule: 'Excluir regra',
                deleteRuleConfirmation: 'Tem certeza de que deseja excluir esta regra?',
                previewMatches: 'Visualizar correspondências',
                previewMatchesEmptyStateTitle: 'Nada para mostrar',
                previewMatchesEmptyStateSubtitle: 'Nenhuma despesa não enviada corresponde a esta regra.',
                matchType: 'Tipo de correspondência',
                matchTypeContains: 'Contém',
                matchTypeExact: 'Corresponde exatamente',
                expensesExactlyMatching: 'Para despesas que correspondem exatamente:',
                duplicateRuleTitle: 'Já existe uma regra semelhante para este comerciante',
                duplicateRulePrompt: (merchantName: string) => `Você quer salvar uma nova regra para "${merchantName}", mesmo já tendo uma existente?`,
                saveAnyway: 'Salvar mesmo assim',
                applyToExistingUnsubmittedExpenses: 'Aplicar às despesas não enviadas existentes',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Coletar',
                    description: 'Para equipes que buscam automatizar seus processos.',
                },
                corporate: {
                    label: 'Controle',
                    description: 'Para organizações com requisitos avançados.',
                },
            },
            description: 'Escolha o plano ideal para você. Para uma lista detalhada de recursos e preços, confira nosso',
            subscriptionLink: 'página de ajuda sobre tipos de plano e preços',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Você se comprometeu com 1 membro ativo no plano Control até o fim da sua assinatura anual em ${annualSubscriptionEndDate}. Você pode mudar para a assinatura de pagamento por uso e fazer downgrade para o plano Collect a partir de ${annualSubscriptionEndDate}, desativando a renovação automática em`,
                other: `Você se comprometeu com ${count} membros ativos no plano Control até o fim da sua assinatura anual em ${annualSubscriptionEndDate}. Você pode mudar para a assinatura por uso e fazer downgrade para o plano Collect a partir de ${annualSubscriptionEndDate} desativando a renovação automática em`,
            }),
            subscriptions: 'Assinaturas',
        },
    },
    getAssistancePage: {
        title: 'Obter assistência',
        subtitle: 'Estamos aqui para abrir o seu caminho rumo à grandeza!',
        description: 'Escolha entre as opções de suporte abaixo:',
        chatWithConcierge: 'Conversar com Concierge',
        scheduleSetupCall: 'Agendar uma ligação de configuração',
        scheduleACall: 'Agendar ligação',
        questionMarkButtonTooltip: 'Obtenha assistência da nossa equipe',
        exploreHelpDocs: 'Explorar documentos de ajuda',
        registerForWebinar: 'Registrar-se para o webinar',
        onboardingHelp: 'Ajuda de integração',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Alterar tom de pele padrão',
        headers: {
            frequentlyUsed: 'Usado com Frequência',
            smileysAndEmotion: 'Carinhas & Emoções',
            peopleAndBody: 'Pessoas e Corpo',
            animalsAndNature: 'Animais e Natureza',
            foodAndDrink: 'Comidas e Bebidas',
            travelAndPlaces: 'Viagem e lugares',
            activities: 'Atividades',
            objects: 'Objetos',
            symbols: 'Símbolos',
            flags: 'Bandeiras',
        },
    },
    newRoomPage: {
        newRoom: 'Nova sala',
        groupName: 'Nome do grupo',
        roomName: 'Nome da sala',
        visibility: 'Visibilidade',
        restrictedDescription: 'Pessoas no seu workspace podem encontrar esta sala',
        privateDescription: 'Pessoas convidadas para esta sala podem encontrá-la',
        publicDescription: 'Qualquer pessoa pode encontrar esta sala',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Qualquer pessoa pode encontrar esta sala',
        createRoom: 'Criar sala',
        roomAlreadyExistsError: 'Já existe uma sala com esse nome',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} é uma sala padrão em todos os espaços de trabalho. Escolha outro nome.`,
        roomNameInvalidError: 'Os nomes das salas podem incluir apenas letras minúsculas, números e hífens',
        pleaseEnterRoomName: 'Insira um nome de sala',
        pleaseSelectWorkspace: 'Selecione um workspace',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}renomeado para "${newName}" (anteriormente "${oldName}")` : `${actor}renomeou esta sala para "${newName}" (anteriormente "${oldName}")`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Sala renomeada para ${newName}`,
        social: 'Social',
        selectAWorkspace: 'Selecione um espaço de trabalho',
        growlMessageOnRenameError: 'Não foi possível renomear a sala do espaço de trabalho. Verifique sua conexão e tente novamente.',
        visibilityOptions: {
            restricted: 'Espaço de trabalho', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privado',
            public: 'Público',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Anúncio público',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Enviar e Fechar',
        submitAndApprove: 'Enviar e Aprovar',
        advanced: 'AVANÇADO',
        dynamicExternal: 'DINÂMICO_EXTERNO',
        smartReport: 'RELATÓRIO INTELIGENTE',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `alterou o endereço da empresa para "${newAddress}" (anteriormente "${previousAddress}")` : `definir o endereço da empresa como "${newAddress}"`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `adicionou ${approverName} (${approverEmail}) como aprovador para o campo ${field} "${name}"`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) => `removeu ${approverName} (${approverEmail}) como aprovador para ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `alterou o aprovador do(a) ${field} "${name}" para ${formatApprover(newApproverName, newApproverEmail)} (anteriormente ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `adicionou a categoria "${categoryName}"`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `removeu a categoria "${categoryName}"`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'desativado' : 'ativado'} a categoria "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `adicionou o código de folha de pagamento "${newValue}" à categoria "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `removeu o código de folha de pagamento "${oldValue}" da categoria "${categoryName}"`;
            }
            return `alterou o código de folha de pagamento da categoria "${categoryName}" para “${newValue}” (antes “${oldValue}”)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `adicionou o código GL "${newValue}" à categoria "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `removeu o código GL "${oldValue}" da categoria "${categoryName}"`;
            }
            return `alterou o código GL da categoria “${categoryName}” para “${newValue}” (anteriormente “${oldValue}“)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `alterou a descrição da categoria "${categoryName}" para ${!oldValue ? 'obrigatório' : 'não obrigatório'} (anteriormente ${!oldValue ? 'não obrigatório' : 'obrigatório'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `adicionou um valor máximo de ${newAmount} à categoria "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `removeu o valor máximo de ${oldAmount} da categoria "${categoryName}"`;
            }
            return `alterou o valor máximo da categoria "${categoryName}" para ${newAmount} (anteriormente ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `adicionou um tipo de limite de ${newValue} à categoria "${categoryName}"`;
            }
            return `alterou o tipo de limite da categoria "${categoryName}" para ${newValue} (anteriormente ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `atualizou a categoria "${categoryName}" alterando Recibos para ${newValue}`;
            }
            return `alterou a categoria "${categoryName}" para ${newValue} (antes ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `atualizou a categoria "${categoryName}" alterando Recibos detalhados para ${newValue}`;
            }
            return `alterou os Recibos detalhados da categoria "${categoryName}" para ${newValue} (anteriormente ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `renomeou a categoria "${oldName}" para "${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `removeu a dica de descrição "${oldValue}" da categoria "${categoryName}"`;
            }
            return !oldValue
                ? `adicionou a dica de descrição "${newValue}" à categoria "${categoryName}"`
                : `alterou a dica de descrição da categoria "${categoryName}" para “${newValue}” (antes “${oldValue}”)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `alterou o nome da lista de tags para "${newName}" (anteriormente "${oldName}")`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `adicionou a tag "${tagName}" à lista "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `atualizou a lista de tags "${tagListName}" alterando a tag "${oldName}" para "${newName}"`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'ativado' : 'desativado'} a tag "${tagName}" na lista "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `removeu a tag "${tagName}" da lista "${tagListName}"`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `removeu as tags "${count}" da lista "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `atualizou a tag "${tagName}" na lista "${tagListName}" alterando ${updatedField} para "${newValue}" (anteriormente "${oldValue}")`;
            }
            return `atualizou a tag "${tagName}" na lista "${tagListName}" adicionando um(a) ${updatedField} de "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `alterou o ${customUnitName} ${updatedField} para "${newValue}" (antes "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'ativado' : 'desativado'} acompanhamento de impostos em tarifas de distância`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `adicionou uma nova taxa de "${customUnitName}" "${rateName}"`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `alterou a taxa de ${customUnitName} ${updatedField} "${customUnitRateName}" para "${newValue}" (anteriormente "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `alterou a taxa de imposto na taxa de distância "${customUnitRateName}" para "${newValue} (${newTaxPercentage})" (anteriormente "${oldValue} (${oldTaxPercentage})")`;
            }
            return `adicionou a taxa de imposto "${newValue} (${newTaxPercentage})" à taxa de distância "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `alterou a parcela de imposto recuperável na taxa de distância "${customUnitRateName}" para "${newValue}" (anteriormente "${oldValue}")`;
            }
            return `adicionou uma parte de imposto recuperável de "${newValue}" à taxa de distância "${customUnitRateName}"`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? 'ativado' : 'Desativado'} a taxa de ${customUnitName} "${customUnitRateName}"`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `removeu a taxa "${customUnitName}" "${rateName}"`,
        addedReportField: (fieldType: string, fieldName?: string) => `${fieldType} de relatório "${fieldName}" adicionado`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `definir o valor padrão do campo de relatório "${fieldName}" como "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `adicionou a opção "${optionName}" ao campo de relatório "${fieldName}"`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `removeu a opção "${optionName}" do campo de relatório "${fieldName}"`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'ativado' : 'desativado'} a opção "${optionName}" para o campo de relatório "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'ativado' : 'desativado'} todas as opções para o campo de relatório "${fieldName}"`;
            }
            return `${allEnabled ? 'ativado' : 'desativado'} a opção "${optionName}" para o campo de relatório "${fieldName}", tornando todas as opções ${allEnabled ? 'ativado' : 'desativado'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `removeu o Campo de Relatório de ${fieldType} "${fieldName}"`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `atualizado "Evitar autoaprovação" para "${newValue === 'true' ? 'Ativado' : 'Desativado'}" (anteriormente "${oldValue === 'true' ? 'Ativado' : 'Desativado'}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `defina a data de envio do relatório mensal para "${newValue}"`;
            }
            return `atualizou a data de envio do relatório mensal para "${newValue}" (anteriormente "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `atualizou "Refaturar despesas para clientes" para "${newValue}" (anteriormente "${oldValue}")`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `atualizado "Padrão de despesa em dinheiro" para "${newValue}" (anteriormente "${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `ativou "Aplicar títulos padrão de relatório" ${value ? 'Ativado' : 'Desativado'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `atualizou o nome deste workspace para "${newName}" (anteriormente "${oldName}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `definir a descrição deste workspace para "${newDescription}"`
                : `atualizou a descrição deste workspace para "${newDescription}" (anteriormente "${oldDescription}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('e');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `removeu você do fluxo de aprovação e do chat de despesas de ${joinedNames}. Relatórios enviados anteriormente continuarão disponíveis para aprovação na sua Caixa de entrada.`,
                other: `removeu você dos fluxos de aprovação e chats de despesas de ${joinedNames}. Relatórios enviados anteriormente continuarão disponíveis para aprovação na sua Caixa de entrada.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `atualizou seu papel em ${policyName} de ${oldRole} para usuário. Você foi removido de todos os chats de despesas de solicitantes, exceto do seu próprio.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `atualizou a moeda padrão para ${newCurrency} (anteriormente ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `atualizou a frequência de relatórios automáticos para "${newFrequency}" (anteriormente "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `atualizou o modo de aprovação para "${newValue}" (anteriormente "${oldValue}")`,
        upgradedWorkspace: 'atualizou este workspace para o plano Control',
        forcedCorporateUpgrade: `Este espaço de trabalho foi atualizado para o plano Control. Clique <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">aqui</a> para mais informações.`,
        downgradedWorkspace: 'rebaixou este workspace para o plano Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `alterou a taxa de relatórios roteados aleatoriamente para aprovação manual para ${Math.round(newAuditRate * 100)}% (anteriormente ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `alterou o limite de aprovação manual para todas as despesas para ${newLimit} (anteriormente ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'ativado' : 'desativado'} categorias`;
                case 'tags':
                    return `${enabled ? 'ativado' : 'desativado'} etiquetas`;
                case 'workflows':
                    return `${enabled ? 'ativado' : 'desativado'} fluxos de trabalho`;
                case 'distance rates':
                    return `${enabled ? 'ativado' : 'desativado'} tarifas de distância`;
                case 'accounting':
                    return `${enabled ? 'ativado' : 'desativado'} contabilidade`;
                case 'Expensify Cards':
                    return `${enabled ? 'ativado' : 'desativado'} Cartões Expensify`;
                case 'company cards':
                    return `${enabled ? 'ativado' : 'desativado'} cartões corporativos`;
                case 'invoicing':
                    return `Faturamento de ${enabled ? 'ativado' : 'desativado'}`;
                case 'per diem':
                    return `${enabled ? 'ativado' : 'desativado'} por diem`;
                case 'receipt partners':
                    return `${enabled ? 'ativado' : 'desativado'} parceiros de recibos`;
                case 'rules':
                    return `${enabled ? 'ativado' : 'desativado'} regras`;
                case 'tax tracking':
                    return `Rastreamento de impostos ${enabled ? 'ativado' : 'desativado'}`;
                default:
                    return `${enabled ? 'ativado' : 'desativado'} ${featureName}`;
            }
        },
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `alterou o aprovador padrão para ${newApprover} (anteriormente ${previousApprover})` : `alterou o aprovador padrão para ${newApprover}`,
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
            let text = `alterou o fluxo de aprovação para ${members} enviar relatórios para ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `(aprovador padrão anterior ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(aprovador padrão anterior)';
            } else if (previousApprover) {
                text += `(anteriormente ${previousApprover})`;
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
            let text = approver
                ? `alterou o fluxo de aprovação para que ${members} enviem relatórios ao aprovador padrão ${approver}`
                : `alterou o fluxo de aprovação para que ${members} enviem relatórios ao aprovador padrão`;
            if (wasDefaultApprover && previousApprover) {
                text += `(aprovador padrão anterior ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(aprovador padrão anterior)';
            } else if (previousApprover) {
                text += `(anteriormente ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `alterou o fluxo de aprovação de ${approver} para encaminhar relatórios aprovados para ${forwardsTo} (anteriormente encaminhava para ${previousForwardsTo})`
                : `alterou o fluxo de aprovação de ${approver} para encaminhar relatórios aprovados para ${forwardsTo} (anteriormente, relatórios com aprovação final)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `alterou o fluxo de aprovação de ${approver} para deixar de encaminhar relatórios aprovados (anteriormente encaminhados para ${previousForwardsTo})`
                : `alterou o fluxo de aprovação de ${approver} para interromper o encaminhamento de relatórios aprovados`,
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `Rastreamento de participante ${enabled ? 'ativado' : 'desativado'}`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? 'ativado' : 'desativado'} reembolsos`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `adicionou o imposto "${taxName}"`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `removeu o imposto "${taxName}"`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `renomeou o imposto de "${oldValue}" para "${newValue}"`;
                }
                case 'code': {
                    return `alterou o código de imposto de "${taxName}" de "${oldValue}" para "${newValue}"`;
                }
                case 'rate': {
                    return `alterou a taxa de imposto de "${taxName}" de "${oldValue}" para "${newValue}"`;
                }
                case 'enabled': {
                    return `${oldValue ? 'desativado' : 'ativado'} o imposto "${taxName}"`;
                }
                default: {
                    return '';
                }
            }
        },
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `definir a conta bancária empresarial padrão como "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `removeu a conta bancária empresarial padrão "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
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
            `alterou a conta bancária empresarial padrão para "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" (anteriormente "${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}")`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `alterou o nome da empresa da fatura para "${newValue}" (anteriormente "${oldValue}")` : `definir o nome da empresa da fatura como "${newValue}"`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `alterou o site da empresa na fatura para "${newValue}" (anteriormente "${oldValue}")` : `definir o site da empresa na fatura como "${newValue}"`,
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `alterou a fórmula do nome do relatório personalizado para "${newValue}" (anteriormente "${oldValue}")`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser ? `alterou o pagador autorizado para "${newReimburser}" (anteriormente "${previousReimburser}")` : `alterou o pagador autorizado para "${newReimburser}"`,
        setReceiptRequiredAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `definir valor obrigatório do recibo como "${newValue}"`,
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `alterou o valor exigido do recibo para "${newValue}" (anteriormente "${oldValue}")`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `valor obrigatório de recibo removido (antes era "${oldValue}")`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `definir valor máximo de despesa como "${newValue}"`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `valor máximo de despesa alterado para "${newValue}" (antes "${oldValue}")`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `removeu o valor máximo de despesa (anteriormente "${oldValue}")`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `definir idade máxima da despesa como "${newValue}" dias`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `alterou a idade máxima da despesa para "${newValue}" dias (antes "${oldValue}")`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `removeu a idade máxima de despesa (anteriormente "${oldValue}" dias)`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? 'ativado' : 'desativado'} relatórios com pagamento automático aprovado`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `definir o limite de relatórios aprovados para pagamento automático como "${newLimit}"`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `alterou o limite de relatórios aprovados com pagamento automático para "${newLimit}" (anteriormente "${oldLimit}")`,
        removedAutoPayApprovedReportsLimit: 'removeu o limite de relatórios aprovados para pagamento automático',
    },
    roomMembersPage: {
        memberNotFound: 'Membro não encontrado.',
        useInviteButton: 'Para convidar um novo membro para o chat, use o botão de convite acima.',
        notAuthorized: `Você não tem acesso a esta página. Se estiver tentando entrar nesta sala, peça a um membro da sala para adicioná-lo. Alguma outra coisa? Entre em contato com ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Parece que esta sala foi arquivada. Em caso de dúvidas, entre em contato com ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Tem certeza de que deseja remover ${memberName} da sala?`,
            other: 'Tem certeza de que deseja remover os membros selecionados da sala?',
        }),
        error: {
            genericAdd: 'Ocorreu um problema ao adicionar este membro da sala',
        },
    },
    newTaskPage: {
        assignTask: 'Atribuir tarefa',
        assignMe: 'Atribuir a mim',
        confirmTask: 'Confirmar tarefa',
        confirmError: 'Insira um título e selecione um destino de compartilhamento',
        descriptionOptional: 'Descrição (opcional)',
        pleaseEnterTaskName: 'Insira um título',
        pleaseEnterTaskDestination: 'Selecione onde você quer compartilhar esta tarefa',
    },
    task: {
        task: 'Tarefa',
        title: 'Título',
        description: 'Descrição',
        assignee: 'Responsável',
        completed: 'Concluído',
        action: 'Concluir',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `tarefa para ${title}`,
            completed: 'marcado como concluído',
            canceled: 'tarefa excluída',
            reopened: 'marcado como incompleto',
            error: 'Você não tem permissão para executar a ação solicitada',
        },
        markAsComplete: 'Marcar como concluído',
        markAsIncomplete: 'Marcar como incompleto',
        assigneeError: 'Ocorreu um erro ao atribuir esta tarefa. Tente selecionar outro responsável.',
        genericCreateTaskFailureMessage: 'Ocorreu um erro ao criar esta tarefa. Tente novamente mais tarde.',
        deleteTask: 'Excluir tarefa',
        deleteConfirmation: 'Tem certeza de que deseja excluir esta tarefa?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `Extrato de ${monthName} de ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Atalhos de teclado',
        subtitle: 'Economize tempo com estes práticos atalhos de teclado:',
        shortcuts: {
            openShortcutDialog: 'Abre a caixa de diálogo de atalhos de teclado',
            markAllMessagesAsRead: 'Marcar todas as mensagens como lidas',
            escape: 'Diálogos de escape',
            search: 'Abrir caixa de busca',
            newChat: 'Nova tela de chat',
            copy: 'Copiar comentário',
            openDebug: 'Abrir diálogo de preferências de teste',
        },
    },
    guides: {
        screenShare: 'Compartilhar tela',
        screenShareRequest: 'A Expensify está convidando você para compartilhar a tela',
    },
    search: {
        resultsAreLimited: 'Os resultados da pesquisa são limitados.',
        viewResults: 'Ver resultados',
        resetFilters: 'Redefinir filtros',
        searchResults: {
            emptyResults: {
                title: 'Nada para mostrar',
                subtitle: `Tente ajustar seus critérios de busca ou criar algo com o botão +.`,
            },
            emptyExpenseResults: {
                title: 'Você ainda não criou nenhuma despesa',
                subtitle: 'Crie uma despesa ou faça um test drive do Expensify para saber mais.',
                subtitleWithOnlyCreateButton: 'Use o botão verde abaixo para criar uma despesa.',
            },
            emptyReportResults: {
                title: 'Você ainda não criou nenhum relatório',
                subtitle: 'Crie um relatório ou faça um test drive do Expensify para saber mais.',
                subtitleWithOnlyCreateButton: 'Use o botão verde abaixo para criar um relatório.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    Você ainda não criou
                    nenhuma fatura
                `),
                subtitle: 'Envie uma fatura ou faça um test drive do Expensify para saber mais.',
                subtitleWithOnlyCreateButton: 'Use o botão verde abaixo para enviar uma fatura.',
            },
            emptyTripResults: {
                title: 'Nenhuma viagem para exibir',
                subtitle: 'Comece reservando sua primeira viagem abaixo.',
                buttonText: 'Reservar uma viagem',
            },
            emptySubmitResults: {
                title: 'Nenhuma despesa para enviar',
                subtitle: 'Está tudo certo. Dê a sua volta da vitória!',
                buttonText: 'Criar relatório',
            },
            emptyApproveResults: {
                title: 'Nenhuma despesa para aprovar',
                subtitle: 'Zero despesas. Máxima tranquilidade. Muito bem!',
            },
            emptyPayResults: {
                title: 'Nenhuma despesa para pagar',
                subtitle: 'Parabéns! Você cruzou a linha de chegada.',
            },
            emptyExportResults: {
                title: 'Nenhuma despesa para exportar',
                subtitle: 'Hora de relaxar, bom trabalho.',
            },
            emptyStatementsResults: {
                title: 'Nenhuma despesa para exibir',
                subtitle: 'Nenhum resultado. Tente ajustar seus filtros.',
            },
            emptyUnapprovedResults: {
                title: 'Nenhuma despesa para aprovar',
                subtitle: 'Zero despesas. Máxima tranquilidade. Muito bem!',
            },
        },
        columns: 'Colunas',
        resetColumns: 'Redefinir colunas',
        groupColumns: 'Agrupar colunas',
        expenseColumns: 'Colunas de Despesas',
        statements: 'Extratos',
        unapprovedCash: 'Dinheiro não aprovado',
        unapprovedCard: 'Cartão não aprovado',
        reconciliation: 'Reconciliação',
        saveSearch: 'Salvar pesquisa',
        deleteSavedSearch: 'Excluir pesquisa salva',
        deleteSavedSearchConfirm: 'Você tem certeza de que deseja excluir esta pesquisa?',
        searchName: 'Pesquisar nome',
        savedSearchesMenuItemTitle: 'Salvo',
        topCategories: 'Principais categorias',
        topMerchants: 'Principais comerciantes',
        groupedExpenses: 'despesas agrupadas',
        bulkActions: {
            approve: 'Aprovar',
            pay: 'Pagar',
            delete: 'Excluir',
            hold: 'Reter',
            unhold: 'Remover retenção',
            reject: 'Rejeitar',
            noOptionsAvailable: 'Nenhuma opção disponível para o grupo de despesas selecionado.',
        },
        filtersHeader: 'Filtros',
        filters: {
            date: {
                before: (date?: string) => `Antes de ${date ?? ''}`,
                after: (date?: string) => `Depois de ${date ?? ''}`,
                on: (date?: string) => `Em ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Nunca',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'Mês passado',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'Este mês',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: 'Ano até a data',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Último extrato',
                },
            },
            status: 'Status',
            keyword: 'Palavra-chave',
            keywords: 'Palavras-chave',
            limit: 'Limite',
            limitDescription: 'Defina um limite para os resultados da sua pesquisa.',
            currency: 'Moeda',
            completed: 'Concluído',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Menos de ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Maior que ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `Entre ${greaterThan} e ${lessThan}`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Igual a ${amount ?? ''}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Cartões individuais',
                closedCards: 'Cartões fechados',
                cardFeeds: 'Feeds de cartão',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Todos os ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Todos os cartões importados em CSV${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} é ${value}`,
            current: 'Atual',
            past: 'Passado',
            submitted: 'Enviado',
            approved: 'Aprovado',
            paid: 'Pago',
            exported: 'Exportado',
            posted: 'Lançado',
            withdrawn: 'Retirado',
            billable: 'Faturável',
            reimbursable: 'Reembolsável',
            purchaseCurrency: 'Moeda de compra',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: 'De',
                [CONST.SEARCH.GROUP_BY.CARD]: 'Cartão',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'ID de saque',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Categoria',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: 'Estabelecimento',
                [CONST.SEARCH.GROUP_BY.TAG]: 'Etiqueta',
                [CONST.SEARCH.GROUP_BY.MONTH]: 'Mês',
                [CONST.SEARCH.GROUP_BY.WEEK]: 'Semana',
                [CONST.SEARCH.GROUP_BY.YEAR]: 'Ano',
                [CONST.SEARCH.GROUP_BY.QUARTER]: 'Trimestre',
            },
            feed: 'Feed',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Cartão Expensify',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: 'Reembolso',
            },
            is: 'É',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: 'Enviar',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: 'Aprovar',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: 'Pagar',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'Exportar',
            },
        },
        has: 'Tem',
        groupBy: 'Agrupar por',
        moneyRequestReport: {
            emptyStateTitle: 'Este relatório não tem despesas.',
            accessPlaceHolder: 'Abra para ver detalhes',
        },
        noCategory: 'Sem categoria',
        noMerchant: 'Sem comerciante',
        noTag: 'Sem tag',
        expenseType: 'Tipo de despesa',
        withdrawalType: 'Tipo de saque',
        recentSearches: 'Pesquisas recentes',
        recentChats: 'Chats recentes',
        searchIn: 'Pesquisar em',
        searchPlaceholder: 'Pesquisar algo',
        suggestions: 'Sugestões',
        exportSearchResults: {
            title: 'Criar exportação',
            description: 'Uau, são muitos itens! Vamos agrupá-los e o Concierge enviará um arquivo para você em breve.',
        },
        exportedTo: 'Exported to',
        exportAll: {
            selectAllMatchingItems: 'Selecionar todos os itens correspondentes',
            allMatchingItemsSelected: 'Todos os itens correspondentes selecionados',
        },
        topSpenders: 'Maiores gastadores',
        view: {label: 'Ver', table: 'Tabela', bar: 'Bar'},
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: 'De',
            [CONST.SEARCH.GROUP_BY.CARD]: 'Cartões',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'Exportações',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Categorias',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: 'Comerciantes',
            [CONST.SEARCH.GROUP_BY.TAG]: 'Tags',
            [CONST.SEARCH.GROUP_BY.MONTH]: 'Meses',
            [CONST.SEARCH.GROUP_BY.WEEK]: 'Semanas',
            [CONST.SEARCH.GROUP_BY.YEAR]: 'Anos',
            [CONST.SEARCH.GROUP_BY.QUARTER]: 'Trimestres',
        },
    },
    genericErrorPage: {
        title: 'Opa, algo deu errado!',
        body: {
            helpTextMobile: 'Feche e reabra o app ou mude para',
            helpTextWeb: 'web.',
            helpTextConcierge: 'Se o problema persistir, entre em contato com',
        },
        refresh: 'Atualizar',
    },
    fileDownload: {
        success: {
            title: 'Baixado!',
            message: 'Anexo baixado com sucesso!',
            qrMessage:
                'Confira se há uma cópia do seu código QR na pasta de fotos ou de downloads. Dica: adicione-o a uma apresentação para que seu público possa escanear e se conectar diretamente com você.',
        },
        generalError: {
            title: 'Erro de anexo',
            message: 'O anexo não pode ser baixado',
        },
        permissionError: {
            title: 'Acesso ao armazenamento',
            message: 'O Expensify não pode salvar anexos sem acesso ao armazenamento. Toque em Configurações para atualizar as permissões.',
        },
    },
    settlement: {
        status: {
            pending: 'Pendente',
            cleared: 'Compensado',
            failed: 'Falhou',
        },
        failedError: ({link}: {link: string}) => `Tentaremos novamente este acerto quando você <a href="${link}">desbloquear sua conta</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • ID de retirada: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'Layout do relatório',
        groupByLabel: 'Agrupar por:',
        selectGroupByOption: 'Selecione como agrupar as despesas do relatório',
        uncategorized: 'Não categorizado',
        noTag: 'Sem tag',
        selectGroup: ({groupName}: {groupName: string}) => `Selecionar todas as despesas em ${groupName}`,
        groupBy: {
            category: 'Categoria',
            tag: 'Tag',
        },
    },
    report: {
        newReport: {
            createExpense: 'Criar despesa',
            createReport: 'Criar relatório',
            chooseWorkspace: 'Escolha um workspace para este relatório.',
            emptyReportConfirmationTitle: 'Você já tem um relatório em branco',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Tem certeza de que deseja criar outro relatório em ${workspaceName}? Você pode acessar seus relatórios em branco em`,
            emptyReportConfirmationPromptLink: 'Relatórios',
            emptyReportConfirmationDontShowAgain: 'Não mostrar isso novamente',
            genericWorkspaceName: 'este workspace',
        },
        genericCreateReportFailureMessage: 'Erro inesperado ao criar este chat. Tente novamente mais tarde.',
        genericAddCommentFailureMessage: 'Erro inesperado ao publicar o comentário. Tente novamente mais tarde.',
        genericUpdateReportFieldFailureMessage: 'Erro inesperado ao atualizar o campo. Tente novamente mais tarde.',
        genericUpdateReportNameEditFailureMessage: 'Erro inesperado ao renomear o relatório. Tente novamente mais tarde.',
        noActivityYet: 'Nenhuma atividade ainda',
        connectionSettings: 'Configurações de conexão',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `alterado ${fieldName} para "${newValue}" (anteriormente "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `definir ${fieldName} como "${newValue}"`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `alterou o espaço de trabalho${fromPolicyName ? `(antes ${fromPolicyName})` : ''}`;
                    }
                    return `alterou o espaço de trabalho para ${toPolicyName}${fromPolicyName ? `(antes ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `tipo alterado de ${oldType} para ${newType}`,
                exportedToCSV: `exportado para CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `exportado para ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `exportado para ${label} via`,
                    automaticActionTwo: 'configurações de contabilidade',
                    manual: (label: string) => `marcou este relatório como exportado manualmente para ${label}.`,
                    automaticActionThree: 'e criou com sucesso um registro para',
                    reimburseableLink: 'despesas desembolsadas',
                    nonReimbursableLink: 'despesas de cartão corporativo',
                    pending: (label: string) => `começou a exportar este relatório para ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `falha ao exportar este relatório para ${label} ("${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `adicionou um recibo`,
                managerDetachReceipt: `removeu um recibo`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `pagou ${currency}${amount} em outro lugar`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `pagou ${currency}${amount} via integração`,
                outdatedBankAccount: `não foi possível processar o pagamento devido a um problema com a conta bancária do pagador`,
                reimbursementACHBounce: `não foi possível processar o pagamento devido a um problema na conta bancária`,
                reimbursementACHCancelled: `cancelou o pagamento`,
                reimbursementAccountChanged: `não foi possível processar o pagamento, pois o pagador mudou de conta bancária`,
                reimbursementDelayed: `processou o pagamento, mas ele será atrasado em mais 1–2 dias úteis`,
                selectedForRandomAudit: `selecionado aleatoriamente para revisão`,
                selectedForRandomAuditMarkdown: `[selecionado aleatoriamente](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) para revisão`,
                share: ({to}: ShareParams) => `membro convidado ${to}`,
                unshare: ({to}: UnshareParams) => `membro removido ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `pagou ${currency}${amount}`,
                takeControl: `assumiu o controle`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `houve um problema ao sincronizar com ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Corrija o problema nas <a href="${workspaceAccountingLink}">configurações do workspace</a>.`,
                addEmployee: (email: string, role: string) => `adicionou ${email} como ${role === 'member' ? 'a' : 'um'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `atualizou a função de ${email} para ${newRole} (anteriormente ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `removeu o campo personalizado 1 de ${email} (anteriormente "${previousValue}")`;
                    }
                    return !previousValue
                        ? `adicionou "${newValue}" ao campo personalizado 1 de ${email}`
                        : `alterou o campo personalizado 1 de ${email} para "${newValue}" (anteriormente "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `removeu o campo personalizado 2 de ${email} (anteriormente "${previousValue}")`;
                    }
                    return !previousValue
                        ? `adicionou "${newValue}" ao campo personalizado 2 de ${email}`
                        : `alterou o campo personalizado 2 de ${email} para "${newValue}" (anteriormente "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} saiu do workspace`,
                removeMember: (email: string, role: string) => `removeu ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `removeu a conexão com ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `conectado a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'saiu do chat',
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `A conexão ${feedName} está quebrada. Para restaurar as importações do cartão, <a href='${workspaceCompanyCardRoute}'>faça login no seu banco</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `a conexão Plaid com sua conta bancária empresarial está quebrada. Por favor, <a href='${walletRoute}'>reconecte sua conta bancária ${maskedAccountNumber}</a> para continuar usando seus Cartões Expensify.`,
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `a conta bancária comercial ${maskedBankAccountNumber} foi bloqueada automaticamente devido a um problema com o reembolso ou a liquidação do cartão Expensify. Corrija o problema nas <a href="${linkURL}">configurações do seu workspace</a>.`,
            },
            error: {
                invalidCredentials: 'Credenciais inválidas, verifique a configuração da sua conexão.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} de ${dayCount} ${dayCount === 1 ? 'dia' : 'dias'} até ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} de ${timePeriod} em ${date}`,
    },
    footer: {
        features: 'Funcionalidades',
        expenseManagement: 'Gestão de Despesas',
        spendManagement: 'Gestão de Despesas',
        expenseReports: 'Relatórios de despesas',
        companyCreditCard: 'Cartão de crédito corporativo',
        receiptScanningApp: 'App de Digitalização de Recibos',
        billPay: 'Pagamento de Contas',
        invoicing: 'Faturamento',
        CPACard: 'Cartão CPA',
        payroll: 'Folha de pagamento',
        travel: 'Viagem',
        resources: 'Recursos',
        expensifyApproved: 'ExpensifyAprovado!',
        pressKit: 'Kit de Imprensa',
        support: 'Suporte',
        expensifyHelp: 'ExpensifyAjuda',
        terms: 'Termos de Serviço',
        privacy: 'Privacidade',
        learnMore: 'Saiba mais',
        aboutExpensify: 'Sobre o Expensify',
        blog: 'Blog',
        jobs: 'Trabalhos',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Relações com Investidores',
        getStarted: 'Começar',
        createAccount: 'Criar Uma Nova Conta',
        logIn: 'Entrar',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Navegar de volta para a lista de chats',
        chatWelcomeMessage: 'Mensagem de boas-vindas do chat',
        navigatesToChat: 'Navega para um chat',
        newMessageLineIndicator: 'Indicador de nova linha de mensagem',
        chatMessage: 'Mensagem de chat',
        lastChatMessagePreview: 'Visualização da última mensagem do chat',
        workspaceName: 'Nome do workspace',
        chatUserDisplayNames: 'Nomes exibidos dos membros do chat',
        scrollToNewestMessages: 'Rolar até as mensagens mais recentes',
        preStyledText: 'Texto pré-formatado',
        viewAttachment: 'Ver anexo',
    },
    parentReportAction: {
        deletedReport: 'Relatório excluído',
        deletedMessage: 'Mensagem excluída',
        deletedExpense: 'Despesa excluída',
        reversedTransaction: 'Transação estornada',
        deletedTask: 'Tarefa excluída',
        hiddenMessage: 'Mensagem oculta',
    },
    threads: {
        thread: 'Tópico',
        replies: 'Respostas',
        reply: 'Responder',
        from: 'De',
        in: 'em',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `De ${reportName}${workspaceName ? `em ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: 'Copiar URL',
        copied: 'Copiado!',
    },
    moderation: {
        flagDescription: 'Todas as mensagens sinalizadas serão enviadas a um moderador para revisão.',
        chooseAReason: 'Escolha um motivo para sinalizar abaixo:',
        spam: 'Spam',
        spamDescription: 'Promoção não solicitada fora de contexto',
        inconsiderate: 'Indelicado',
        inconsiderateDescription: 'Formulação insultuosa ou desrespeitosa, com intenções questionáveis',
        intimidation: 'Intimidação',
        intimidationDescription: 'Perseguir agressivamente uma agenda apesar de objeções válidas',
        bullying: 'Bullying',
        bullyingDescription: 'Alvejar um indivíduo para obter obediência',
        harassment: 'Assédio',
        harassmentDescription: 'Comportamento racista, misógino ou amplamente discriminatório',
        assault: 'Agressão',
        assaultDescription: 'Ataque emocional especificamente direcionado com a intenção de causar dano',
        flaggedContent: 'Esta mensagem foi sinalizada como violando nossas regras da comunidade e o conteúdo foi ocultado.',
        hideMessage: 'Ocultar mensagem',
        revealMessage: 'Revelar mensagem',
        levelOneResult: 'Envia um aviso anônimo e a mensagem é reportada para revisão.',
        levelTwoResult: 'Mensagem oculta do canal, além de um aviso anônimo, e a mensagem foi reportada para revisão.',
        levelThreeResult: 'Mensagem removida do canal com aviso anônimo e a mensagem foi reportada para revisão.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Convidar para enviar despesas',
        inviteToChat: 'Convidar apenas para o chat',
        nothing: 'Não fazer nada',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Aceitar',
        decline: 'Recusar',
    },
    actionableMentionTrackExpense: {
        submit: 'Enviar para alguém',
        categorize: 'Categorizar',
        share: 'Compartilhar com meu contador',
        nothing: 'Nada por enquanto',
    },
    teachersUnitePage: {
        teachersUnite: 'Professores Unidos',
        joinExpensifyOrg:
            'Junte-se à Expensify.org na eliminação da injustiça ao redor do mundo. A campanha atual “Teachers Unite” apoia educadores em todos os lugares ao dividir os custos de materiais escolares essenciais.',
        iKnowATeacher: 'Eu conheço um professor',
        iAmATeacher: 'Eu sou professor',
        getInTouch: 'Excelente! Compartilhe as informações deles para que possamos entrar em contato com eles.',
        introSchoolPrincipal: 'Introdução ao diretor da sua escola',
        schoolPrincipalVerifyExpense:
            'O Expensify.org divide o custo de materiais escolares essenciais para que estudantes de famílias de baixa renda possam ter uma melhor experiência de aprendizado. Seu diretor será solicitado a verificar suas despesas.',
        principalFirstName: 'Primeiro nome principal',
        principalLastName: 'Sobrenome do principal',
        principalWorkEmail: 'E-mail de trabalho principal',
        updateYourEmail: 'Atualize seu endereço de e-mail',
        updateEmail: 'Atualizar endereço de e-mail',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Antes de continuar, certifique-se de definir seu e-mail escolar como seu método de contato padrão. Você pode fazer isso em Configurações > Perfil > <a href="${contactMethodsRoute}">Métodos de contato</a>.`,
        error: {
            enterPhoneEmail: 'Insira um e-mail ou número de telefone válido',
            enterEmail: 'Insira um e-mail',
            enterValidEmail: 'Insira um e-mail válido',
            tryDifferentEmail: 'Por favor, tente um e-mail diferente',
        },
    },
    cardTransactions: {
        notActivated: 'Não ativado',
        outOfPocket: 'Gasto do próprio bolso',
        companySpend: 'Gastos da empresa',
    },
    distance: {
        addStop: 'Adicionar parada',
        deleteWaypoint: 'Excluir ponto de passagem',
        deleteWaypointConfirmation: 'Tem certeza de que deseja excluir este ponto de passagem?',
        address: 'Endereço',
        waypointDescription: {
            start: 'Iniciar',
            stop: 'Parar',
        },
        mapPending: {
            title: 'Mapeamento pendente',
            subtitle: 'O mapa será gerado quando você voltar a ficar online',
            onlineSubtitle: 'Um momento enquanto configuramos o mapa',
            errorTitle: 'Erro de mapa',
            errorSubtitle: 'Ocorreu um erro ao carregar o mapa. Tente novamente.',
        },
        error: {
            selectSuggestedAddress: 'Selecione um endereço sugerido ou use a localização atual',
        },
        odometer: {startReading: 'Começar a ler', endReading: 'Encerrar leitura', saveForLater: 'Salvar para depois', totalDistance: 'Distância total'},
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Boletim perdido ou danificado',
        nextButtonLabel: 'Próximo',
        reasonTitle: 'Por que você precisa de um novo cartão?',
        cardDamaged: 'Meu cartão foi danificado',
        cardLostOrStolen: 'Meu cartão foi perdido ou roubado',
        confirmAddressTitle: 'Por favor, confirme o endereço de correspondência para o seu novo cartão.',
        cardDamagedInfo: 'Seu novo cartão chegará em 2–3 dias úteis. Seu cartão atual continuará funcionando até que você ative o novo.',
        cardLostOrStolenInfo: 'Seu cartão atual será desativado permanentemente assim que seu pedido for feito. A maioria dos cartões chega em alguns dias úteis.',
        address: 'Endereço',
        deactivateCardButton: 'Desativar cartão',
        shipNewCardButton: 'Enviar novo cartão',
        addressError: 'Endereço é obrigatório',
        reasonError: 'Motivo é obrigatório',
        successTitle: 'Seu novo cartão está a caminho!',
        successDescription: 'Você precisará ativá-lo assim que ele chegar em alguns dias úteis. Enquanto isso, você pode usar um cartão virtual.',
    },
    eReceipt: {
        guaranteed: 'Comprovante eletrônico garantido',
        transactionDate: 'Data da transação',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Inicie um chat, <success><strong>indique um amigo</strong></success>.',
            header: 'Iniciar um chat, indicar um amigo',
            body: 'Quer que seus amigos também usem o Expensify? Basta iniciar um chat com eles e nós cuidaremos do resto.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Envie um gasto, <success><strong>indique sua equipe</strong></success>.',
            header: 'Envie uma despesa, indique sua equipe',
            body: 'Quer que sua equipe use o Expensify também? Basta enviar uma despesa para eles e nós cuidaremos do resto.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Indicar um amigo',
            body: 'Quer que seus amigos também usem o Expensify? Basta conversar, pagar ou dividir uma despesa com eles e nós cuidaremos do resto. Ou então é só compartilhar seu link de convite!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Indicar um amigo',
            header: 'Indicar um amigo',
            body: 'Quer que seus amigos também usem o Expensify? Basta conversar, pagar ou dividir uma despesa com eles e nós cuidaremos do resto. Ou então é só compartilhar seu link de convite!',
        },
        copyReferralLink: 'Copiar link de convite',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Converse com seu especialista de configuração em <a href="${href}">${adminReportName}</a> para obter ajuda`,
        default: `Envie uma mensagem para <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> para obter ajuda com a configuração`,
    },
    violations: {
        allTagLevelsRequired: 'Todas as tags obrigatórias',
        autoReportedRejectedExpense: 'Esta despesa foi rejeitada.',
        billableExpense: 'Faturável não é mais válido',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Recibo obrigatório${formattedLimit ? `acima de ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Categoria não é mais válida',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Aplicado sobretaxa de conversão de ${surcharge}%`,
        customUnitOutOfPolicy: 'Taxa inválida para este workspace',
        duplicatedTransaction: 'Possível duplicado',
        fieldRequired: 'Os campos do relatório são obrigatórios',
        futureDate: 'Data futura não permitida',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Acrescido em ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Data anterior a ${maxAge} dias`,
        missingCategory: 'Categoria ausente',
        missingComment: 'Descrição obrigatória para a categoria selecionada',
        missingAttendees: 'Vários participantes são obrigatórios para esta categoria',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Faltando ${tagName ?? 'Tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'O valor difere da distância calculada';
                case 'card':
                    return 'Valor maior que a transação do cartão';
                default:
                    if (displayPercentVariance) {
                        return `Valor ${displayPercentVariance}% maior que o recibo escaneado`;
                    }
                    return 'Valor maior que o do recibo escaneado';
            }
        },
        modifiedDate: 'A data é diferente do recibo escaneado',
        nonExpensiworksExpense: 'Despesa fora do Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Despesa excede o limite de aprovação automática de ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Valor acima do limite de categoria de ${formattedLimit}/pessoa`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Valor acima do limite de ${formattedLimit}/pessoa`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Valor acima do limite de ${formattedLimit}/viagem`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Valor acima do limite de ${formattedLimit}/pessoa`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Valor acima do limite diário de ${formattedLimit}/pessoa por categoria`,
        receiptNotSmartScanned: 'Detalhes do recibo e da despesa adicionados manualmente.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Recibo obrigatório acima do limite de categoria de ${formattedLimit}`;
            }
            if (formattedLimit) {
                return `Recibo obrigatório acima de ${formattedLimit}`;
            }
            if (category) {
                return `Recibo obrigatório acima do limite da categoria`;
            }
            return 'Recibo obrigatório';
        },
        itemizedReceiptRequired: ({formattedLimit}: {formattedLimit?: string}) => `Recibo detalhado necessário${formattedLimit ? ` acima de ${formattedLimit}` : ''}`,
        prohibitedExpense: ({prohibitedExpenseTypes}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'Despesa proibida:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `álcool`;
                    case 'gambling':
                        return `jogos de azar`;
                    case 'tobacco':
                        return `tabaco`;
                    case 'adultEntertainment':
                        return `entretenimento adulto`;
                    case 'hotelIncidentals':
                        return `despesas extras de hotel`;
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
        reviewRequired: 'Revisão necessária',
        rter: ({brokenBankConnection, isAdmin, isTransactionOlderThan7Days, member, rterType, companyCardPageURL}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'Não é possível corresponder o recibo automaticamente devido a uma conexão bancária com problemas';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Conexão com o banco interrompida. <a href="${companyCardPageURL}">Reconectar para corresponder ao recibo</a>`
                    : 'Conexão bancária interrompida. Peça a um administrador para reconectar e corresponder o recibo.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Peça para ${member} marcar como dinheiro em espécie ou aguarde 7 dias e tente novamente` : 'Aguardando combinação com a transação do cartão.';
            }
            return '';
        },
        brokenConnection530Error: 'Recibo pendente devido à conexão bancária quebrada',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Recibo pendente devido a conexão bancária interrompida. Resolva em <a href="${workspaceCompanyCardRoute}">Cartões da empresa</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Recibo pendente devido à conexão bancária quebrada. Peça a um administrador do workspace para resolver.',
        markAsCashToIgnore: 'Marcar como dinheiro para ignorar e solicitar pagamento.',
        smartscanFailed: ({canEdit = true}) => `Falha na digitalização do recibo.${canEdit ? 'Insira os detalhes manualmente.' : ''}`,
        receiptGeneratedWithAI: 'Recibo potencialmente gerado por IA',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Faltando ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} não é mais válido`,
        taxAmountChanged: 'O valor do imposto foi modificado',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Imposto'} não é mais válido`,
        taxRateChanged: 'A alíquota de imposto foi modificada',
        taxRequired: 'Taxa de imposto ausente',
        none: 'Nenhum',
        taxCodeToKeep: 'Escolha qual código de imposto manter',
        tagToKeep: 'Escolha qual tag manter',
        isTransactionReimbursable: 'Escolha se a transação é reembolsável',
        merchantToKeep: 'Escolha qual comerciante manter',
        descriptionToKeep: 'Escolha qual descrição manter',
        categoryToKeep: 'Escolha qual categoria manter',
        isTransactionBillable: 'Escolha se a transação é faturável',
        keepThisOne: 'Manter este',
        confirmDetails: `Confirme os detalhes que você está mantendo`,
        confirmDuplicatesInfo: `Os duplicados que você não mantiver serão mantidos para que o remetente os exclua.`,
        hold: 'Esta despesa foi colocada em espera',
        resolvedDuplicates: 'duplicata resolvida',
        companyCardRequired: 'Compras com cartão da empresa obrigatórias',
        noRoute: 'Selecione um endereço válido',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} é obrigatório`,
        reportContainsExpensesWithViolations: 'O relatório contém despesas com violações.',
    },
    violationDismissal: {
        rter: {
            manual: 'marcou este recibo como dinheiro',
        },
        duplicatedTransaction: {
            manual: 'duplicata resolvida',
        },
    },
    videoPlayer: {
        play: 'Reproduzir',
        pause: 'Pausar',
        fullscreen: 'Tela cheia',
        playbackSpeed: 'Velocidade de reprodução',
        expand: 'Expandir',
        mute: 'Silenciar',
        unmute: 'Ativar som',
        normal: 'Normal',
    },
    exitSurvey: {
        header: 'Antes de você ir',
        reasonPage: {
            title: 'Por favor, nos diga por que você está saindo',
            subtitle: 'Antes de você ir, conte-nos por que você gostaria de mudar para o Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Eu preciso de um recurso que só está disponível no Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Eu não entendo como usar o New Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Eu entendo como usar o New Expensify, mas prefiro o Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'De qual recurso você precisa que não está disponível no New Expensify?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'O que você está tentando fazer?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Por que você prefere o Expensify Classic?',
        },
        responsePlaceholder: 'Sua resposta',
        thankYou: 'Obrigado pelo feedback!',
        thankYouSubtitle: 'Suas respostas nos ajudarão a criar um produto melhor para fazer as coisas acontecerem. Muito obrigado!',
        goToExpensifyClassic: 'Mudar para o Expensify Classic',
        offlineTitle: 'Parece que você está preso aqui...',
        offline:
            'Parece que você está offline. Infelizmente, o Expensify Classic não funciona offline, mas o New Expensify funciona. Se você preferir usar o Expensify Classic, tente novamente quando tiver uma conexão com a internet.',
        quickTip: 'Dica rápida...',
        quickTipSubTitle: 'Você pode ir diretamente para o Expensify Classic acessando expensify.com. Adicione-o aos favoritos para ter um atalho fácil!',
        bookACall: 'Agendar uma ligação',
        bookACallTitle: 'Você gostaria de falar com um gerente de produto?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Conversando diretamente em despesas e relatórios',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Capacidade de fazer tudo no celular',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Viagem e despesas na velocidade de um chat',
        },
        bookACallTextTop: 'Ao mudar para o Expensify Classic, você deixará de aproveitar:',
        bookACallTextBottom:
            'Ficaríamos empolgados em fazer uma ligação com você para entender o motivo. Você pode agendar uma chamada com um de nossos gerentes de produto sênior para discutir suas necessidades.',
        takeMeToExpensifyClassic: 'Leve-me ao Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Ocorreu um erro ao carregar mais mensagens',
        tryAgain: 'Tentar novamente',
    },
    systemMessage: {
        mergedWithCashTransaction: 'associou um recibo a esta transação',
    },
    subscription: {
        authenticatePaymentCard: 'Autenticar cartão de pagamento',
        mobileReducedFunctionalityMessage: 'Você não pode fazer alterações na sua assinatura no aplicativo móvel.',
        badge: {
            freeTrial: (numOfDays: number) => `Avaliação gratuita: restam ${numOfDays} ${numOfDays === 1 ? 'dia' : 'dias'}`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Suas informações de pagamento estão desatualizadas',
                subtitle: (date: string) => `Atualize seu cartão de pagamento até ${date} para continuar usando todos os seus recursos favoritos.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Seu pagamento não pôde ser processado',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `Sua cobrança de ${date} no valor de ${purchaseAmountOwed} não pôde ser processada. Adicione um cartão de pagamento para quitar o valor devido.`
                        : 'Adicione um cartão de pagamento para quitar o valor devido.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Suas informações de pagamento estão desatualizadas',
                subtitle: (date: string) => `Seu pagamento está atrasado. Pague sua fatura até ${date} para evitar a interrupção do serviço.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Suas informações de pagamento estão desatualizadas',
                subtitle: 'Seu pagamento está vencido. Pague sua fatura, por favor.',
            },
            billingDisputePending: {
                title: 'Não foi possível cobrar no seu cartão',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `Você contestou a cobrança de ${amountOwed} no cartão com final ${cardEnding}. Sua conta ficará bloqueada até que a contestação seja resolvida com seu banco.`,
            },
            cardAuthenticationRequired: {
                title: 'Seu cartão de pagamento não foi totalmente autenticado.',
                subtitle: (cardEnding: string) => `Conclua o processo de autenticação para ativar seu cartão de pagamento com final ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'Não foi possível cobrar no seu cartão',
                subtitle: (amountOwed: number) =>
                    `Seu cartão de pagamento foi recusado por falta de saldo. Tente novamente ou adicione um novo cartão de pagamento para liquidar o saldo pendente de ${amountOwed}.`,
            },
            cardExpired: {
                title: 'Não foi possível cobrar no seu cartão',
                subtitle: (amountOwed: number) => `Seu cartão de pagamento expirou. Adicione um novo cartão de pagamento para quitar o saldo pendente de ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'Seu cartão vai expirar em breve',
                subtitle: 'Seu cartão de pagamento expirará no final deste mês. Clique no menu de três pontos abaixo para atualizá-lo e continuar usando todos os seus recursos favoritos.',
            },
            retryBillingSuccess: {
                title: 'Sucesso!',
                subtitle: 'Seu cartão foi cobrado com sucesso.',
            },
            retryBillingError: {
                title: 'Não foi possível cobrar no seu cartão',
                subtitle:
                    'Antes de tentar novamente, ligue diretamente para o seu banco para autorizar as cobranças da Expensify e remover qualquer bloqueio. Caso contrário, tente adicionar um cartão de pagamento diferente.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `Você contestou a cobrança de ${amountOwed} no cartão com final ${cardEnding}. Sua conta ficará bloqueada até que a contestação seja resolvida com seu banco.`,
            preTrial: {
                title: 'Iniciar avaliação gratuita',
                subtitle: 'Como próximo passo, <a href="#">conclua sua lista de verificação de configuração</a> para que sua equipe possa começar a registrar despesas.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Teste: ${numOfDays} ${numOfDays === 1 ? 'dia' : 'dias'} restantes!`,
                subtitle: 'Adicione um cartão de pagamento para continuar usando todos os seus recursos favoritos.',
            },
            trialEnded: {
                title: 'Seu período de avaliação gratuita terminou',
                subtitle: 'Adicione um cartão de pagamento para continuar usando todos os seus recursos favoritos.',
            },
            earlyDiscount: {
                claimOffer: 'Resgatar oferta',
                subscriptionPageTitle: (discountType: number) =>
                    `<strong>${discountType}% de desconto no seu primeiro ano!</strong> Basta adicionar um cartão de pagamento e iniciar uma assinatura anual.`,
                onboardingChatTitle: (discountType: number) => `Oferta por tempo limitado: ${discountType}% de desconto no seu primeiro ano!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `Reivindique dentro de ${days > 0 ? `${days}d :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Pagamento',
            subtitle: 'Adicione um cartão para pagar sua assinatura do Expensify.',
            addCardButton: 'Adicionar cartão de pagamento',
            cardInfo: (name: string, expiration: string, currency: string) => `Nome: ${name}, Validade: ${expiration}, Moeda: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `Sua próxima data de pagamento é ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `Cartão terminado em ${cardNumber}`,
            changeCard: 'Alterar cartão de pagamento',
            changeCurrency: 'Alterar moeda de pagamento',
            cardNotFound: 'Nenhum cartão de pagamento adicionado',
            retryPaymentButton: 'Tentar pagamento novamente',
            authenticatePayment: 'Autenticar pagamento',
            requestRefund: 'Solicitar reembolso',
            requestRefundModal: {
                full: 'Receber um reembolso é fácil, basta fazer o downgrade da sua conta antes da sua próxima data de cobrança e você receberá um reembolso. <br /> <br /> Atenção: Fazer o downgrade da sua conta significa que seu(s) workspace(s) será(ão) excluído(s). Essa ação não pode ser desfeita, mas você sempre pode criar um novo workspace se mudar de ideia.',
                confirm: 'Excluir espaço(s) de trabalho e fazer downgrade',
            },
            viewPaymentHistory: 'Ver histórico de pagamento',
        },
        yourPlan: {
            title: 'Seu plano',
            exploreAllPlans: 'Explorar todos os planos',
            customPricing: 'Preço personalizado',
            asLowAs: ({price}: YourPlanPriceValueParams) => `a partir de ${price} por membro ativo/mês`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} por membro/mês`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} por membro por mês`,
            perMemberMonth: 'por membro/mês',
            collect: {
                title: 'Coletar',
                description: 'O plano para pequenas empresas que oferece despesas, viagens e chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membro ativo com o Expensify Card, ${upper}/membro ativo sem o Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membro ativo com o Expensify Card, ${upper}/membro ativo sem o Expensify Card.`,
                benefit1: 'Digitalização de recibos',
                benefit2: 'Reembolsos',
                benefit3: 'Gerenciamento de cartão corporativo',
                benefit4: 'Aprovações de despesas e viagens',
                benefit5: 'Reserva de viagem e regras',
                benefit6: 'Integrações com QuickBooks/Xero',
                benefit7: 'Converse sobre despesas, relatórios e salas',
                benefit8: 'Suporte com IA e humano',
            },
            control: {
                title: 'Controle',
                description: 'Despesas, viagens e chat para grandes empresas.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membro ativo com o Expensify Card, ${upper}/membro ativo sem o Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membro ativo com o Expensify Card, ${upper}/membro ativo sem o Expensify Card.`,
                benefit1: 'Tudo no plano Collect',
                benefit2: 'Fluxos de aprovação em vários níveis',
                benefit3: 'Regras de despesas personalizadas',
                benefit4: 'Integrações de ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Integrações de RH (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Insights e relatórios personalizados',
                benefit8: 'Orçamento',
            },
            thisIsYourCurrentPlan: 'Este é o seu plano atual',
            downgrade: 'Rebaixar para Collect',
            upgrade: 'Atualizar para Control',
            addMembers: 'Adicionar membros',
            saveWithExpensifyTitle: 'Economize com o Cartão Expensify',
            saveWithExpensifyDescription: 'Use nossa calculadora de economia para ver como o cash back do Cartão Expensify pode reduzir sua fatura da Expensify.',
            saveWithExpensifyButton: 'Saiba mais',
        },
        compareModal: {
            comparePlans: 'Comparar planos',
            subtitle: `<muted-text>Desbloqueie os recursos de que você precisa com o plano ideal para você. <a href="${CONST.PRICING}">Veja nossa página de preços</a> para uma análise completa dos recursos de cada um dos nossos planos.</muted-text>`,
        },
        details: {
            title: 'Detalhes da assinatura',
            annual: 'Assinatura anual',
            taxExempt: 'Solicitar status de isenção de impostos',
            taxExemptEnabled: 'Isento de imposto',
            taxExemptStatus: 'Status de isenção de impostos',
            payPerUse: 'Pagamento por uso',
            subscriptionSize: 'Tamanho da assinatura',
            headsUp:
                'Aviso: Se você não definir o tamanho da sua assinatura agora, nós o definiremos automaticamente com base na quantidade de membros ativos do seu primeiro mês. Você ficará então comprometido a pagar por pelo menos esse número de membros pelos próximos 12 meses. Você pode aumentar o tamanho da sua assinatura a qualquer momento, mas não pode diminuí-lo até que sua assinatura termine.',
            zeroCommitment: 'Zero compromisso na assinatura anual com desconto',
        },
        subscriptionSize: {
            title: 'Tamanho da assinatura',
            yourSize: 'O tamanho da sua assinatura é o número de vagas abertas que podem ser preenchidas por qualquer membro ativo em um determinado mês.',
            eachMonth:
                'Todo mês, sua assinatura cobre até o número de membros ativos definido acima. Sempre que você aumentar o tamanho da sua assinatura, uma nova assinatura de 12 meses será iniciada nesse novo tamanho.',
            note: 'Observação: Um membro ativo é qualquer pessoa que tenha criado, editado, enviado, aprovado, reembolsado ou exportado dados de despesas vinculados ao espaço de trabalho da sua empresa.',
            confirmDetails: 'Confirme os detalhes da sua nova assinatura anual:',
            subscriptionSize: 'Tamanho da assinatura',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} membros ativos/mês`,
            subscriptionRenews: 'Renovação da assinatura',
            youCantDowngrade: 'Você não pode fazer downgrade durante a sua assinatura anual.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Você já contratou uma assinatura anual para ${size} membros ativos por mês até ${date}. Você pode mudar para uma assinatura de pagamento por uso em ${date} desativando a renovação automática.`,
            error: {
                size: 'Insira um tamanho de assinatura válido',
                sameSize: 'Insira um número diferente do tamanho atual da sua assinatura',
            },
        },
        paymentCard: {
            addPaymentCard: 'Adicionar cartão de pagamento',
            enterPaymentCardDetails: 'Insira os dados do seu cartão de pagamento',
            security: 'Expensify é compatível com PCI-DSS, usa criptografia em nível bancário e utiliza infraestrutura redundante para proteger seus dados.',
            learnMoreAboutSecurity: 'Saiba mais sobre nossa segurança.',
        },
        subscriptionSettings: {
            title: 'Configurações de assinatura',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Tipo de assinatura: ${subscriptionType}, Tamanho da assinatura: ${subscriptionSize}, Renovação automática: ${autoRenew}, Aumento automático de licenças anuais: ${autoIncrease}`,
            none: 'nenhum',
            on: 'Ativado',
            off: 'Desativado',
            annual: 'Anual',
            autoRenew: 'Renovação automática',
            autoIncrease: 'Aumento automático de assentos anuais',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Economize até ${amountWithCurrency}/mês por membro ativo`,
            automaticallyIncrease:
                'Aumente automaticamente seus assentos anuais para acomodar os membros ativos que excederem o tamanho da sua assinatura. Observação: isso irá estender a data de término da sua assinatura anual.',
            disableAutoRenew: 'Desativar renovação automática',
            helpUsImprove: 'Ajude-nos a melhorar o Expensify',
            whatsMainReason: 'Qual é o principal motivo para você desativar a renovação automática?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Renova em ${date}.`,
            pricingConfiguration: 'O preço depende da configuração. Para obter o menor preço, escolha uma assinatura anual e peça o Expensify Card.',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>Saiba mais em nossa <a href="${CONST.PRICING}">página de preços</a> ou converse com nossa equipe no seu ${hasAdminsRoom ? `<a href="adminsRoom">sala #admins.</a>` : '#sala dos admins.'}</muted-text>`,
            estimatedPrice: 'Preço estimado',
            changesBasedOn: 'Isso muda com base no uso do seu Expensify Card e nas opções de assinatura abaixo.',
        },
        requestEarlyCancellation: {
            title: 'Solicitar cancelamento antecipado',
            subtitle: 'Qual é o principal motivo pelo qual você está solicitando o cancelamento antecipado?',
            subscriptionCanceled: {
                title: 'Assinatura cancelada',
                subtitle: 'Sua assinatura anual foi cancelada.',
                info: 'Se você quiser continuar usando seu(s) workspace(s) em um modelo de pagamento por uso, está tudo certo.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Se você quiser impedir atividades e cobranças futuras, você deve <a href="${workspacesListRoute}">excluir seu(s) espaço(s) de trabalho</a>. Observe que, ao excluir seu(s) espaço(s) de trabalho, será cobrado por qualquer atividade pendente que tenha ocorrido durante o mês-calendário atual.`,
            },
            requestSubmitted: {
                title: 'Solicitação enviada',
                subtitle:
                    'Obrigado por nos avisar que você está interessado em cancelar sua assinatura. Estamos analisando sua solicitação e entraremos em contato em breve pelo seu chat com o <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Ao solicitar o cancelamento antecipado, reconheço e concordo que a Expensify não tem obrigação de conceder tal solicitação nos termos dos <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Termos de Serviço</a> da Expensify ou de outro contrato de serviços aplicável entre mim e a Expensify, e que a Expensify mantém total discricionariedade quanto à concessão de qualquer solicitação desse tipo.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Funcionalidade precisa de melhorias',
        tooExpensive: 'Muito caro',
        inadequateSupport: 'Atendimento ao cliente inadequado',
        businessClosing: 'Empresa fechando, reduzindo pessoal ou adquirida',
        additionalInfoTitle: 'Para qual software você está migrando e por quê?',
        additionalInfoInputLabel: 'Sua resposta',
    },
    roomChangeLog: {
        updateRoomDescription: 'defina a descrição da sala para:',
        clearRoomDescription: 'removeu a descrição da sala',
        changedRoomAvatar: 'alterou o avatar da sala',
        removedRoomAvatar: 'removeu o avatar da sala',
    },
    delegate: {
        switchAccount: 'Trocar de conta:',
        copilotDelegatedAccess: 'Copilot: Acesso delegado',
        copilotDelegatedAccessDescription: 'Permitir que outros membros acessem sua conta.',
        addCopilot: 'Adicionar copiloto',
        membersCanAccessYourAccount: 'Estes membros podem acessar sua conta:',
        youCanAccessTheseAccounts: 'Você pode acessar estas contas pelo alternador de contas:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Completo';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Limitado';
                default:
                    return '';
            }
        },
        genericError: 'Ops, algo deu errado. Tente novamente.',
        onBehalfOfMessage: (delegator: string) => `em nome de ${delegator}`,
        accessLevel: 'Nível de acesso',
        confirmCopilot: 'Confirme seu copiloto abaixo.',
        accessLevelDescription: 'Escolha um nível de acesso abaixo. Tanto o acesso Completo quanto o Limitado permitem que copilotos visualizem todas as conversas e despesas.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Permita que outro membro realize todas as ações na sua conta, em seu nome. Inclui chat, envios, aprovações, pagamentos, atualizações de configurações e mais.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Permita que outro membro execute a maioria das ações na sua conta, em seu nome. Exclui aprovações, pagamentos, rejeições e bloqueios.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Remover copiloto',
        removeCopilotConfirmation: 'Tem certeza de que deseja remover este copiloto?',
        changeAccessLevel: 'Alterar nível de acesso',
        makeSureItIsYou: 'Vamos confirmar que é você',
        enterMagicCode: (contactMethod: string) => `Insira o código mágico enviado para ${contactMethod} para adicionar um copiloto. Ele deve chegar em um ou dois minutos.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Insira o código mágico enviado para ${contactMethod} para atualizar seu copiloto.`,
        notAllowed: 'Não tão rápido...',
        noAccessMessage: dedent(`
            Como copiloto, você não tem acesso
            a esta página. Desculpe!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `Como <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copiloto</a> de ${accountOwnerEmail}, você não tem permissão para realizar esta ação. Desculpe!`,
        copilotAccess: 'Acesso ao Copilot',
    },
    debug: {
        debug: 'Depurar',
        details: 'Detalhes',
        JSON: 'JSON',
        reportActions: 'Ações',
        reportActionPreview: 'Visualizar',
        nothingToPreview: 'Nada para visualizar',
        editJson: 'Editar JSON:',
        preview: 'Pré-visualização:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Faltando ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Propriedade inválida: ${propertyName} - Esperado: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Valor inválido - Esperado: ${expectedValues}`,
        missingValue: 'Valor ausente',
        createReportAction: 'Criar ação de relatório',
        reportAction: 'Ação de Relatório',
        report: 'Relatório',
        transaction: 'Transação',
        violations: 'Violações',
        transactionViolation: 'Violação de transação',
        hint: 'As alterações de dados não serão enviadas para o backend',
        textFields: 'Campos de texto',
        numberFields: 'Campos numéricos',
        booleanFields: 'Campos booleanos',
        constantFields: 'Campos constantes',
        dateTimeFields: 'Campos de data e hora',
        date: 'Data',
        time: 'Hora',
        none: 'Nenhum',
        visibleInLHN: 'Visível no LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'verdadeiro',
        false: 'falso',
        viewReport: 'Ver relatório',
        viewTransaction: 'Ver transação',
        createTransactionViolation: 'Criar violação de transação',
        reasonVisibleInLHN: {
            hasDraftComment: 'Tem comentário em rascunho',
            hasGBR: 'Tem GBR',
            hasRBR: 'Tem RBR',
            pinnedByUser: 'Fixado por membro',
            hasIOUViolations: 'Tem violações de IOU',
            hasAddWorkspaceRoomErrors: 'Tem erros ao adicionar sala ao workspace',
            isUnread: 'Está não lida (modo de foco)',
            isArchived: 'Está arquivado (modo mais recente)',
            isSelfDM: 'É DM própria',
            isFocused: 'Está temporariamente focado',
        },
        reasonGBR: {
            hasJoinRequest: 'Tem solicitação de entrada (sala de administrador)',
            isUnreadWithMention: 'Está não lido com menção',
            isWaitingForAssigneeToCompleteAction: 'Está aguardando o responsável concluir a ação',
            hasChildReportAwaitingAction: 'Tem relatório filho aguardando ação',
            hasMissingInvoiceBankAccount: 'Está com conta bancária de fatura ausente',
            hasUnresolvedCardFraudAlert: 'Tem alerta de fraude de cartão não resolvido',
            hasDEWApproveFailed: 'Aprovação DEW falhou',
        },
        reasonRBR: {
            hasErrors: 'Tem erros nos dados do relatório ou nas ações do relatório',
            hasViolations: 'Tem violações',
            hasTransactionThreadViolations: 'Tem violações de thread de transação',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Há um relatório aguardando ação',
            theresAReportWithErrors: 'Há um relatório com erros',
            theresAWorkspaceWithCustomUnitsErrors: 'Há um espaço de trabalho com erros nas unidades personalizadas',
            theresAProblemWithAWorkspaceMember: 'Há um problema com um membro do espaço de trabalho',
            theresAProblemWithAWorkspaceQBOExport: 'Houve um problema com a configuração de exportação da conexão do espaço de trabalho.',
            theresAProblemWithAContactMethod: 'Há um problema com um método de contato',
            aContactMethodRequiresVerification: 'Um método de contato requer verificação',
            theresAProblemWithAPaymentMethod: 'Há um problema com um método de pagamento',
            theresAProblemWithAWorkspace: 'Há um problema com um workspace',
            theresAProblemWithYourReimbursementAccount: 'Há um problema com sua conta de reembolso',
            theresABillingProblemWithYourSubscription: 'Há um problema de cobrança com a sua assinatura',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Sua assinatura foi renovada com sucesso',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Houve um problema durante a sincronização da conexão do workspace',
            theresAProblemWithYourWallet: 'Há um problema com sua carteira',
            theresAProblemWithYourWalletTerms: 'Há um problema com os termos da sua carteira',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Faça um test drive',
    },
    migratedUserWelcomeModal: {
        title: 'Bem-vindo ao Novo Expensify!',
        subtitle: 'Tem tudo o que você ama na nossa experiência clássica, com um monte de melhorias para deixar sua vida ainda mais fácil:',
        confirmText: 'Vamos lá!',
        helpText: 'Experimentar demo de 2 minutos',
        features: {
            search: 'Pesquisa mais poderosa em dispositivos móveis, web e desktop',
            concierge: 'Concierge IA integrada para ajudar a automatizar suas despesas',
            chat: 'Converse sobre qualquer despesa para resolver dúvidas rapidamente',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>Comece <strong>aqui!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Renomeie suas pesquisas salvas</strong> aqui!</tooltip>',
        accountSwitcher: '<tooltip>Acesse suas <strong>contas do Copilot</strong> aqui</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Escaneie nosso recibo de teste</strong> para ver como funciona!</tooltip>',
            manager: '<tooltip>Escolha nosso <strong>gerenciador de teste</strong> para experimentar!</tooltip>',
            confirmation: '<tooltip>Agora, <strong>envie sua despesa</strong> e veja a mágica acontecer!</tooltip>',
            tryItOut: 'Experimente',
        },
        outstandingFilter: '<tooltip>Filtrar despesas\nque <strong>precisam de aprovação</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Envie este recibo para\n<strong>concluir o test drive!</strong></tooltip>',
        gpsTooltip: '<tooltip>Rastreamento por GPS em andamento! Quando terminar, pare o rastreamento abaixo.</tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Descartar alterações?',
        body: 'Tem certeza de que deseja descartar as alterações que você fez?',
        confirmText: 'Descartar alterações',
    },
    scheduledCall: {
        book: {
            title: 'Agendar ligação',
            description: 'Encontre um horário que funcione para você.',
            slots: ({date}: {date: string}) => `<muted-text>Horários disponíveis para <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Confirmar chamada',
            description: 'Verifique se os detalhes abaixo estão corretos para você. Depois de confirmar a chamada, enviaremos um convite com mais informações.',
            setupSpecialist: 'Seu especialista de configuração',
            meetingLength: 'Duração da reunião',
            dateTime: 'Data e hora',
            minutes: '30 minutos',
        },
        callScheduled: 'Chamada agendada',
    },
    autoSubmitModal: {
        title: 'Tudo certo e enviado!',
        description: 'Todos os avisos e violações foram resolvidos, então:',
        submittedExpensesTitle: 'Essas despesas foram enviadas',
        submittedExpensesDescription: 'Essas despesas foram enviadas ao seu aprovador, mas ainda podem ser editadas até serem aprovadas.',
        pendingExpensesTitle: 'As despesas pendentes foram movidas',
        pendingExpensesDescription: 'Quaisquer despesas pendentes do cartão foram movidas para um relatório separado até que sejam lançadas.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Faça um test drive de 2 minutos',
        },
        modal: {
            title: 'Faça um test drive conosco',
            description: 'Faça um rápido tour pelo produto para se atualizar rapidamente.',
            confirmText: 'Iniciar test drive',
            helpText: 'Pular',
            employee: {
                description:
                    '<muted-text>Garanta para sua equipe <strong>3 meses grátis de Expensify!</strong> Basta inserir o e-mail do seu chefe abaixo e enviar uma despesa de teste para ele.</muted-text>',
                email: 'Insira o e-mail do seu chefe',
                error: 'Esse membro é proprietário de um workspace, insira um novo membro para testar.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Você está atualmente testando o Expensify',
            readyForTheRealThing: 'Pronto para a coisa de verdade?',
            getStarted: 'Começar',
        },
        employeeInviteMessage: (name: string) => `# ${name} convidou você para fazer um test drive do Expensify
Ei! Acabei de conseguir *3 meses grátis* para fazermos um test drive do Expensify, a maneira mais rápida de lidar com despesas.

Aqui está um *recibo de teste* para mostrar como funciona:`,
    },
    export: {
        basicExport: 'Exportação básica',
        reportLevelExport: 'Todos os dados - nível de relatório',
        expenseLevelExport: 'Todos os dados - nível de despesa',
        exportInProgress: 'Exportação em andamento',
        conciergeWillSend: 'Concierge enviará o arquivo para você em breve.',
    },
    domain: {
        notVerified: 'Não verificado',
        retry: 'Tentar novamente',
        verifyDomain: {
            title: 'Verificar domínio',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Antes de continuar, verifique que você é o proprietário de <strong>${domainName}</strong> atualizando as configurações de DNS dele.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Acesse o seu provedor de DNS e abra as configurações de DNS para <strong>${domainName}</strong>.`,
            addTXTRecord: 'Adicione o seguinte registro TXT:',
            saveChanges: 'Salve as alterações e volte aqui para verificar seu domínio.',
            youMayNeedToConsult: `Talvez seja necessário consultar o departamento de TI da sua organização para concluir a verificação. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Saiba mais</a>.`,
            warning: 'Após a verificação, todos os membros do Expensify no seu domínio receberão um e-mail informando que a conta deles será gerenciada sob o seu domínio.',
            codeFetchError: 'Não foi possível obter o código de verificação',
            genericError: 'Não foi possível verificar seu domínio. Tente novamente e entre em contato com o Concierge se o problema persistir.',
        },
        domainVerified: {
            title: 'Domínio verificado',
            header: 'Uhuu! Seu domínio foi verificado',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>O domínio <strong>${domainName}</strong> foi verificado com sucesso e você já pode configurar SAML e outros recursos de segurança.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'Logon Único SAML (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SSO SAML</a> é um recurso de segurança que oferece mais controle sobre como membros com e-mails <strong>${domainName}</strong> fazem login no Expensify. Para ativá-lo, você precisará se verificar como um administrador autorizado da empresa.</muted-text>`,
            fasterAndEasierLogin: 'Login mais rápido e fácil',
            moreSecurityAndControl: 'Mais segurança e controle',
            onePasswordForAnything: 'Uma senha para tudo',
        },
        goToDomain: 'Ir para o domínio',
        samlLogin: {
            title: 'Login SAML',
            subtitle: `<muted-text>Configure o login de membros com <a href="${CONST.SAML_HELP_URL}">Single Sign-On (SSO) com SAML.</a></muted-text>`,
            enableSamlLogin: 'Ativar login SAML',
            allowMembers: 'Permitir que membros façam login com SAML.',
            requireSamlLogin: 'Exigir login SAML',
            anyMemberWillBeRequired: 'Qualquer membro que tiver iniciado sessão com um método diferente precisará se autenticar novamente usando SAML.',
            enableError: 'Não foi possível atualizar a configuração de habilitação SAML',
            requireError: 'Não foi possível atualizar a configuração de requisito SAML',
            disableSamlRequired: 'Desativar SAML obrigatório',
            oktaWarningPrompt: 'Você tem certeza? Isso também desativará o Okta SCIM.',
            requireWithEmptyMetadataError: 'Adicione os metadados do Provedor de Identidade abaixo para ativar',
        },
        samlConfigurationDetails: {
            title: 'Detalhes da configuração SAML',
            subtitle: 'Use estes detalhes para configurar o SAML.',
            identityProviderMetadata: 'Metadados do Provedor de Identidade',
            entityID: 'ID da entidade',
            nameIDFormat: 'Formato de ID de Nome',
            loginUrl: 'URL de login',
            acsUrl: 'URL ACS (Assertion Consumer Service)',
            logoutUrl: 'URL de logout',
            sloUrl: 'URL de SLO (Single Logout)',
            serviceProviderMetaData: 'Metadados do Provedor de Serviço',
            oktaScimToken: 'Token SCIM do Okta',
            revealToken: 'Revelar token',
            fetchError: 'Não foi possível buscar os detalhes de configuração SAML',
            setMetadataGenericError: 'Não foi possível definir os metadados SAML',
        },
        accessRestricted: {
            title: 'Acesso restrito',
            subtitle: (domainName: string) => `Confirme que você é um administrador autorizado da empresa para <strong>${domainName}</strong> se precisar de controle sobre:`,
            companyCardManagement: 'Gerenciamento de cartões corporativos',
            accountCreationAndDeletion: 'Criação e exclusão de conta',
            workspaceCreation: 'Criação do espaço de trabalho',
            samlSSO: 'SSO SAML',
        },
        addDomain: {
            title: 'Adicionar domínio',
            subtitle: 'Digite o nome do domínio privado que você deseja acessar (ex.: expensify.com).',
            domainName: 'Nome de domínio',
            newDomain: 'Novo domínio',
        },
        domainAdded: {
            title: 'Domínio adicionado',
            description: 'Em seguida, você precisará verificar a propriedade do domínio e ajustar suas configurações de segurança.',
            configure: 'Configurar',
        },
        enhancedSecurity: {
            title: 'Segurança aprimorada',
            subtitle: 'Exija que os membros do seu domínio façam login por meio de logon único (SSO), restrinja a criação de espaços de trabalho e muito mais.',
            enable: 'Ativar',
        },
        admins: {
            title: 'Administradores',
            findAdmin: 'Encontrar administrador',
            primaryContact: 'Contato principal',
            addPrimaryContact: 'Adicionar contato principal',
            setPrimaryContactError: 'Não foi possível definir o contato principal. Tente novamente mais tarde.',
            settings: 'Configurações',
            consolidatedDomainBilling: 'Cobrança consolidada de domínio',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>Quando ativado, o contato principal pagará por todos os espaços de trabalho pertencentes aos membros de <strong>${domainName}</strong> e receberá todos os recibos de cobrança.</muted-text-label></comment>`,
            consolidatedDomainBillingError: 'A cobrança de domínio consolidada não pôde ser alterada. Tente novamente mais tarde.',
            addAdmin: 'Adicionar administrador',
            addAdminError: 'Não foi possível adicionar este membro como administrador. Tente novamente.',
            revokeAdminAccess: 'Revogar acesso de administrador',
            cantRevokeAdminAccess: 'Não é possível revogar o acesso de administrador do contato técnico',
            error: {
                removeAdmin: 'Não foi possível remover este usuário como Administrador. Tente novamente.',
                removeDomain: 'Não foi possível remover este domínio. Tente novamente.',
                removeDomainNameInvalid: 'Insira o nome do seu domínio para redefini-lo.',
            },
            resetDomain: 'Redefinir domínio',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Digite <strong>${domainName}</strong> para confirmar a redefinição do domínio.`,
            enterDomainName: 'Insira seu nome de domínio aqui',
            resetDomainInfo: `Esta ação é <strong>permanente</strong> e os seguintes dados serão excluídos: <br/> <ul><li>Conexões de cartão corporativo e quaisquer despesas não reportadas desses cartões</li> <li>Configurações de SAML e de grupo</li> </ul> Todas as contas, workspaces, relatórios, despesas e outros dados permanecerão. <br/><br/>Observação: Você pode remover este domínio da sua lista de domínios excluindo o e-mail associado dos seus <a href="#">métodos de contato</a>.`,
        },
        members: {
            title: 'Membros',
            findMember: 'Encontrar membro',
            addMember: 'Adicionar membro',
            email: 'Endereço de e-mail',
            errors: {addMember: 'Não foi possível adicionar este membro. Tente novamente.'},
        },
        domainAdmins: 'Administradores de domínio',
    },
    gps: {
        disclaimer: 'Use o GPS para criar uma despesa a partir da sua viagem. Toque em Iniciar abaixo para começar o rastreamento.',
        error: {failedToStart: 'Falha ao iniciar o rastreamento de localização.', failedToGetPermissions: 'Falha ao obter as permissões de localização necessárias.'},
        trackingDistance: 'Acompanhando a distância...',
        stopped: 'Parado',
        start: 'Iniciar',
        stop: 'Parar',
        discard: 'Descartar',
        stopGpsTrackingModal: {
            title: 'Parar rastreamento por GPS',
            prompt: 'Tem certeza? Isso encerrará sua jornada atual.',
            cancel: 'Retomar rastreamento',
            confirm: 'Parar rastreamento por GPS',
        },
        discardDistanceTrackingModal: {
            title: 'Descartar rastreamento de distância',
            prompt: 'Tem certeza? Isso descartará sua jornada atual e não poderá ser desfeito.',
            confirm: 'Descartar rastreamento de distância',
        },
        zeroDistanceTripModal: {title: 'Não é possível criar a despesa', prompt: 'Você não pode criar uma despesa com o mesmo local de partida e de chegada.'},
        locationRequiredModal: {
            title: 'Acesso à localização necessário',
            prompt: 'Permita o acesso à localização nas configurações do seu dispositivo para iniciar o rastreamento de distância por GPS.',
            allow: 'Permitir',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Acesso à localização em segundo plano necessário',
            prompt: 'Permita o acesso à localização em segundo plano nas configurações do seu dispositivo (opção "Permitir o tempo todo") para iniciar o rastreamento de distância por GPS.',
        },
        preciseLocationRequiredModal: {
            title: 'Localização precisa obrigatória',
            prompt: 'Ative a opção "localização precisa" nas configurações do seu dispositivo para iniciar o rastreamento de distância por GPS.',
        },
        desktop: {
            title: 'Controle a distância no seu telefone',
            subtitle: 'Registre milhas ou quilômetros automaticamente com o GPS e transforme viagens em despesas instantaneamente.',
            button: 'Baixar o app',
        },
        continueGpsTripModal: {
            title: 'Continuar gravação da viagem por GPS?',
            prompt: 'Parece que o app foi fechado durante sua última viagem com GPS. Você gostaria de continuar a gravação dessa viagem?',
            confirm: 'Continuar viagem',
            cancel: 'Ver viagem',
        },
        signOutWarningTripInProgress: {title: 'Rastreamento por GPS em andamento', prompt: 'Tem certeza de que deseja descartar a viagem e sair?', confirm: 'Descartar e sair'},
        notification: {title: 'Rastreamento por GPS em andamento', body: 'Ir para o app para finalizar'},
        locationServicesRequiredModal: {
            title: 'Acesso à localização obrigatório',
            confirm: 'Abrir configurações',
            prompt: 'Permita o acesso à localização nas configurações do seu dispositivo para iniciar o rastreamento de distância por GPS.',
        },
        fabGpsTripExplained: 'Ir para a tela de GPS (Ação flutuante)',
    },
    homePage: {
        forYou: 'Para você',
        announcements: 'Anúncios',
        discoverSection: {
            title: 'Descobrir',
            menuItemTitleNonAdmin: 'Aprenda como criar despesas e enviar relatórios.',
            menuItemTitleAdmin: 'Aprenda como convidar membros, editar fluxos de aprovação e reconciliar cartões corporativos.',
            menuItemDescription: 'Veja o que o Expensify pode fazer em 2 minutos',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `Enviar ${count} ${count === 1 ? 'relatório' : 'relatórios'}`,
            approve: ({count}: {count: number}) => `Aprovar ${count} ${count === 1 ? 'relatório' : 'relatórios'}`,
            pay: ({count}: {count: number}) => `Pagar ${count} ${count === 1 ? 'relatório' : 'relatórios'}`,
            export: ({count}: {count: number}) => `Exportar ${count} ${count === 1 ? 'relatório' : 'relatórios'}`,
            begin: 'Iniciar',
            emptyStateMessages: {
                nicelyDone: 'Muito bem feito',
                keepAnEyeOut: 'Fique de olho no que vem a seguir!',
                allCaughtUp: 'Você está em dia',
                upcomingTodos: 'Próximas tarefas aparecerão aqui.',
            },
        },
        timeSensitiveSection: {
            title: 'Urgente',
            cta: 'Solicitação',
            offer50off: {title: 'Ganhe 50% de desconto no seu primeiro ano!', subtitle: ({formattedTime}: {formattedTime: string}) => `${formattedTime} restante`},
            offer25off: {title: 'Ganhe 25% de desconto no seu primeiro ano!', subtitle: ({days}: {days: number}) => `${days} ${days === 1 ? 'dia' : 'dias'} restantes`},
            addShippingAddress: {title: 'Precisamos do seu endereço de entrega', subtitle: 'Forneça um endereço para receber seu Expensify Card.', cta: 'Adicionar endereço'},
            activateCard: {title: 'Ative seu Cartão Expensify', subtitle: 'Valide seu cartão e comece a gastar.', cta: 'Ativar'},
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
