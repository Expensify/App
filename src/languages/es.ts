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
import type {ValueOf} from 'type-fest';
import type {OnboardingTask} from '@libs/actions/Welcome/OnboardingFlow';
import StringUtils from '@libs/StringUtils';
import dedent from '@libs/StringUtils/dedent';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type OriginalMessage from '@src/types/onyx/OriginalMessage';
import type {OriginalMessageSettlementAccountLocked, PersonalRulesModifiedFields, PolicyRulesModifiedFields} from '@src/types/onyx/OriginalMessage';
import type en from './en';
import type {
    ChangeFieldParams,
    ConciergeBrokenCardConnectionParams,
    ConnectionNameParams,
    CreatedReportForUnapprovedTransactionsParams,
    DelegateRoleParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    EditActionParams,
    ExportAgainModalDescriptionParams,
    ExportIntegrationSelectedParams,
    IntacctMappingTitleParams,
    InvalidPropertyParams,
    InvalidValueParams,
    MarkReimbursedFromIntegrationParams,
    MissingPropertyParams,
    MovedFromPersonalSpaceParams,
    NotAllowedExtensionParams,
    OptionalParam,
    PaidElsewhereParams,
    ParentNavigationSummaryParams,
    RemovedFromApprovalWorkflowParams,
    ReportArchiveReasonsClosedParams,
    ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams,
    ReportArchiveReasonsMergedParams,
    ReportArchiveReasonsRemovedFromPolicyParams,
    ResolutionConstraintsParams,
    ShareParams,
    SizeExceededParams,
    StepCounterParams,
    SyncStageNameConnectionsParams,
    UnshareParams,
    UnsupportedFormulaValueErrorParams,
    UpdatedTheDistanceMerchantParams,
    UpdatedTheRequestParams,
    UpdateRoleParams,
    UserIsAlreadyMemberParams,
    ViolationsIncreasedDistanceParams,
    ViolationsMissingTagParams,
    ViolationsModifiedAmountParams,
    WorkspaceLockedPlanTypeParams,
    YourPlanPriceParams,
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
        count: 'Cantidad',
        cancel: 'Cancelar',
        dismiss: 'Descartar',
        proceed: 'Continuar',
        unshare: 'Dejar de compartir',
        yes: 'Sí',
        no: 'No',
        ok: 'OK',
        notNow: 'Ahora no',
        noThanks: 'No, gracias',
        learnMore: 'Más información',
        buttonConfirm: 'Entendido',
        name: 'Nombre',
        attachment: 'Adjunto',
        attachments: 'Archivos adjuntos',
        center: 'Centro',
        from: 'Desde',
        to: 'Para',
        in: 'En',
        optional: 'Opcional',
        new: 'Nuevo',
        newFeature: 'Función nueva',
        beta: 'Beta',
        search: 'Buscar',
        reports: 'Informes',
        spend: 'Gasto',
        find: 'Buscar',
        searchWithThreeDots: 'Buscar...',
        next: 'Siguiente',
        previous: 'Anterior',
        previousMonth: 'Mes anterior',
        nextMonth: 'El próximo mes',
        previousYear: 'Año anterior',
        nextYear: 'El próximo año',
        goBack: 'Volver atrás',
        create: 'Crear',
        add: 'Agregar',
        resend: 'Reenviar',
        save: 'Guardar',
        select: 'Seleccionar',
        deselect: 'Deseleccionar',
        selectMultiple: 'Selección múltiple',
        saveChanges: 'Guardar cambios',
        submit: 'Enviar',
        submitted: 'Enviado',
        rotate: 'Girar',
        zoom: 'Acercar',
        password: 'Contraseña',
        magicCode: 'Código mágico',
        digits: 'dígitos',
        twoFactorCode: 'Código de verificación en dos pasos',
        workspaces: 'Espacios de trabajo',
        home: 'Inicio',
        inbox: 'Bandeja de entrada',
        yourReviewIsRequired: 'Se requiere tu revisión',
        actionBadge: {
            submit: 'Enviar',
            approve: 'Aprobar',
            pay: 'Pagar',
            fix: 'Corregir',
        },
        success: 'Éxito',
        group: 'Grupo',
        profile: 'Perfil',
        referral: 'Recomendación',
        payments: 'Pagos',
        approvals: 'Aprobaciones',
        wallet: 'Billetera',
        preferences: 'Preferencias',
        view: 'Ver',
        review: (amount?: string) => `Revisar${amount ? ` ${amount}` : ''}`,
        not: 'No',
        signIn: 'Iniciar sesión',
        signInWithGoogle: 'Inicia sesión con Google',
        signInWithApple: 'Iniciar sesión con Apple',
        signInWith: 'Inicia sesión con',
        continue: 'Continuar',
        firstName: 'Nombre(s)',
        lastName: 'Apellido',
        scanning: 'Escaneando',
        analyzing: 'Analizando...',
        thinking: 'Concierge está pensando...',
        addCardTermsOfService: 'Términos de servicio de Expensify',
        perPerson: 'por persona',
        phone: 'Teléfono',
        phoneNumber: 'Número de teléfono',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'Correo electrónico',
        and: 'y',
        or: 'o',
        details: 'Detalles',
        privacy: 'Privacidad',
        privacyPolicy: 'Política de privacidad',
        hidden: 'Oculto',
        visible: 'Visible',
        delete: 'Eliminar',
        archived: 'archivado',
        contacts: 'Contactos',
        recents: 'Recientes',
        close: 'Cerrar',
        comment: 'Comentario',
        download: 'Descargar',
        downloading: 'Descargando',
        uploading: 'Subiendo',
        pin: 'Fijar',
        unPin: 'Desanclar',
        back: 'Atrás',
        saveAndContinue: 'Guardar y continuar',
        settings: 'Configuración',
        termsOfService: 'Términos del servicio',
        members: 'Miembros',
        invite: 'Invitar',
        here: 'aquí',
        date: 'Fecha',
        dob: 'Fecha de nacimiento',
        currentYear: 'Año actual',
        currentMonth: 'Mes actual',
        ssnLast4: 'Últimos 4 dígitos del SSN',
        ssnFull9: '9 dígitos completos del SSN',
        addressLine: (lineNumber: number) => `Línea de dirección ${lineNumber}`,
        personalAddress: 'Dirección personal',
        companyAddress: 'Dirección de la empresa',
        noPO: 'Sin apartados postales ni direcciones de casilleros, por favor.',
        city: 'Ciudad',
        state: 'Estado',
        streetAddress: 'Dirección (calle y número)',
        stateOrProvince: 'Estado / Provincia',
        country: 'País',
        zip: 'Código postal',
        zipPostCode: 'Código postal',
        whatThis: '¿Qué es esto?',
        iAcceptThe: 'Acepto los',
        acceptTermsAndPrivacy: `Acepto los <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Términos de servicio de Expensify</a> y la <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Política de privacidad</a>`,
        acceptTermsAndConditions: `Acepto los <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">términos y condiciones</a>`,
        acceptTermsOfService: `Acepto los <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Términos de servicio de Expensify</a>`,
        downloadFailedEmptyReportDescription: () => ({
            one: 'No puedes exportar un informe vacío.',
            other: () => `No puedes exportar reportes vacíos.`,
        }),
        remove: 'Eliminar',
        admin: 'Admin',
        owner: 'Propietario',
        dateFormat: 'YYYY-MM-DD',
        send: 'Enviar',
        na: 'N/D',
        noResultsFound: 'No se encontraron resultados',
        noResultsFoundMatching: (searchString: string) => `No se encontraron resultados que coincidan con "${searchString}"`,
        suggestionsAvailableFor: (searchString: string) => (searchString ? `Sugerencias disponibles para «${searchString}».` : 'Sugerencias disponibles.'),
        recentDestinations: 'Destinos recientes',
        timePrefix: 'Es',
        conjunctionFor: 'para',
        todayAt: 'Hoy a las',
        tomorrowAt: 'Mañana a las',
        yesterdayAt: 'Ayer a las',
        conjunctionAt: 'en',
        conjunctionTo: 'a',
        genericErrorMessage: 'Uy... algo salió mal y no se pudo completar tu solicitud. Inténtalo de nuevo más tarde.',
        percentage: 'Porcentaje',
        progressBarLabel: 'Progreso de incorporación',
        converted: 'Convertido',
        error: {
            invalidAmount: 'Importe no válido',
            acceptTerms: 'Debes aceptar los Términos de servicio para continuar',
            phoneNumber: `Ingresa un número de teléfono completo
(p. ej., ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Este campo es obligatorio',
            requestModified: 'Otro miembro está modificando esta solicitud',
            characterLimitExceedCounter: (length: number, limit: number) => `Límite de caracteres excedido (${length}/${limit})`,
            dateInvalid: 'Selecciona una fecha válida',
            invalidDateShouldBeFuture: 'Elige hoy o una fecha futura',
            invalidTimeShouldBeFuture: 'Elige una hora al menos un minuto por adelantado',
            invalidCharacter: 'Carácter no válido',
            enterMerchant: 'Ingresa el nombre del comercio',
            enterAmount: 'Ingresa un monto',
            missingMerchantName: 'Falta el nombre del comercio',
            missingAmount: 'Falta el importe',
            missingDate: 'Falta la fecha',
            enterDate: 'Ingresa una fecha',
            invalidTimeRange: 'Introduce una hora usando el formato de reloj de 12 horas (p. ej., 2:30 PM)',
            pleaseCompleteForm: 'Completa el formulario de arriba para continuar',
            pleaseSelectOne: 'Selecciona una opción arriba',
            invalidRateError: 'Introduce una tarifa válida',
            lowRateError: 'La tarifa debe ser mayor que 0',
            email: 'Introduce una dirección de correo electrónico válida',
            login: 'Ocurrió un error al iniciar sesión. Inténtalo de nuevo, por favor.',
        },
        comma: 'coma',
        semicolon: 'punto y coma',
        please: 'Por favor',
        contactUs: 'contáctanos',
        pleaseEnterEmailOrPhoneNumber: 'Introduce un correo electrónico o número de teléfono',
        fixTheErrors: 'corrige los errores',
        inTheFormBeforeContinuing: 'en el formulario antes de continuar',
        confirm: 'Confirmar',
        reset: 'Restablecer',
        done: 'Hecho',
        more: 'Más',
        debitCard: 'Tarjeta de débito',
        bankAccount: 'Cuenta bancaria',
        personalBankAccount: 'Cuenta bancaria personal',
        businessBankAccount: 'Cuenta bancaria empresarial',
        join: 'Unirse',
        leave: 'Salir',
        decline: 'Rechazar',
        reject: 'Rechazar',
        transferBalance: 'Transferir saldo',
        enterManually: 'Ingresarlo manualmente',
        message: 'Mensaje',
        leaveThread: 'Salir del hilo',
        you: 'Tú',
        me: 'yo',
        youAfterPreposition: 'tú',
        your: 'tu',
        conciergeHelp: 'Comunícate con Concierge para obtener ayuda.',
        youAppearToBeOffline: 'Parece que estás sin conexión.',
        thisFeatureRequiresInternet: 'Esta función requiere una conexión a internet activa.',
        attachmentWillBeAvailableOnceBackOnline: 'El archivo adjunto estará disponible cuando vuelvas a estar en línea.',
        errorOccurredWhileTryingToPlayVideo: 'Se produjo un error al intentar reproducir este video.',
        areYouSure: '¿Estás seguro?',
        verify: 'Verificar',
        yesContinue: 'Sí, continuar',
        websiteExample: 'p. ej. https://www.expensify.com',
        zipCodeExampleFormat: (zipSampleFormat: string) => (zipSampleFormat ? `p. ej., ${zipSampleFormat}` : ''),
        description: 'Descripción',
        title: 'Título',
        assignee: 'Cesionario',
        createdBy: 'Creado por',
        with: 'con',
        shareCode: 'Compartir código',
        share: 'Compartir',
        per: 'por',
        mi: 'milla',
        km: 'kilómetro',
        milesAbbreviated: 'mi',
        kilometersAbbreviated: 'km',
        copied: '¡Copiado!',
        someone: 'Alguien',
        total: 'Total',
        edit: 'Editar',
        letsDoThis: `¡Hagámoslo!`,
        letsStart: `Empecemos`,
        showMore: 'Mostrar más',
        showLess: 'Mostrar menos',
        plusMore: ({count}: {count: number}) => `+${count} más`,
        merchant: 'Comercio',
        change: 'Cambiar',
        category: 'Categoría',
        report: 'Informe',
        billable: 'Facturable',
        nonBillable: 'No facturable',
        tag: 'Etiqueta',
        receipt: 'Recibo',
        verified: 'Verificado',
        replace: 'Reemplazar',
        distance: 'Distancia',
        mile: 'milla',
        miles: 'millas',
        kilometer: 'kilómetro',
        kilometers: 'kilómetros',
        recent: 'Reciente',
        all: 'Todo',
        am: 'a. m.',
        pm: 'p. m.',
        tbd: 'Por determinar',
        selectCurrency: 'Selecciona una moneda',
        selectSymbolOrCurrency: 'Selecciona un símbolo o moneda',
        card: 'Tarjeta',
        whyDoWeAskForThis: '¿Por qué pedimos esto?',
        required: 'Obligatorio',
        automatic: 'Automático',
        showing: 'Mostrando',
        of: 'de',
        default: 'Predeterminado',
        update: 'Actualizar',
        member: 'Miembro',
        auditor: 'Auditor',
        role: 'Rol',
        roleCannotBeChanged: (workflowsLinkPage: string) =>
            `El rol no se puede cambiar porque esta persona es un(a) <a href="${workflowsLinkPage}">pagador(a)</a> en este espacio de trabajo.`,
        currency: 'Moneda',
        groupCurrency: 'Moneda del grupo',
        rate: 'Calificar',
        emptyLHN: {
            title: '¡Genial! Estás al día.',
            subtitleText1: 'Busca un chat usando el',
            subtitleText2: 'botón de arriba, o crea algo usando el',
            subtitleText3: 'botón de abajo.',
        },
        businessName: 'Nombre de la empresa',
        clear: 'Borrar',
        type: 'Tipo',
        reportName: 'Nombre del informe',
        action: 'Acción',
        expenses: 'Gastos',
        totalSpend: 'Gasto total',
        tax: 'Impuesto',
        shared: 'Compartido',
        drafts: 'Borradores',
        draft: 'Borrador',
        finished: 'Finalizado',
        upgrade: 'Mejorar',
        downgradeWorkspace: 'Bajar de nivel el espacio de trabajo',
        companyID: 'ID de empresa',
        userID: 'ID de usuario',
        disable: 'Desactivar',
        export: 'Exportar',
        initialValue: 'Valor inicial',
        currentDate: 'Fecha actual',
        value: 'Valor',
        downloadFailedTitle: 'Descarga fallida',
        downloadFailedDescription: 'No se pudo completar la descarga. Inténtalo de nuevo más tarde.',
        filterLogs: 'Filtrar registros',
        network: 'Red de trabajo',
        reportID: 'ID de informe',
        longReportID: 'ID de reporte largo',
        withdrawalID: 'ID de retiro',
        withdrawalStatus: 'Estado del retiro',
        bankAccounts: 'Cuentas bancarias',
        chooseFile: 'Elegir archivo',
        chooseFiles: 'Elegir archivos',
        dropTitle: 'Suelta el archivo',
        dropMessage: 'Suelta tu archivo aquí',
        ignore: 'Ignorar',
        enabled: 'Activado',
        disabled: 'Desactivado',
        import: 'Importar',
        offlinePrompt: 'No puedes realizar esta acción en este momento.',
        outstanding: 'Pendiente',
        chats: 'Chats',
        tasks: 'Tareas',
        unread: 'No leído',
        sent: 'Enviado',
        links: 'Enlaces',
        day: 'día',
        days: 'días',
        rename: 'Renombrar',
        address: 'Dirección',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        secondAbbreviation: 's',
        skip: 'Omitir',
        chatWithAccountManager: (accountManagerDisplayName: string) => `¿Necesitas algo específico? Chatea con tu gerente de cuenta, ${accountManagerDisplayName}.`,
        chatNow: 'Chatear ahora',
        workEmail: 'Correo de trabajo',
        destination: 'Destino',
        subrate: 'Tasa secundaria',
        perDiem: 'Viáticos',
        validate: 'Validar',
        downloadAsPDF: 'Descargar como PDF',
        downloadAsCSV: 'Descargar como CSV',
        print: 'Imprimir',
        help: 'Ayuda',
        collapsed: 'Colapsado',
        expanded: 'Expandido',
        expenseReport: 'Informe de gastos',
        rateOutOfPolicy: 'Tarifa fuera de la política',
        leaveWorkspace: 'Abandonar espacio de trabajo',
        leaveWorkspaceConfirmation: 'Si abandonas este espacio de trabajo, no podrás enviarle gastos.',
        leaveWorkspaceConfirmationAuditor: 'Si abandonas este espacio de trabajo, no podrás ver sus informes ni su configuración.',
        leaveWorkspaceConfirmationAdmin: 'Si abandonas este espacio de trabajo, no podrás administrar su configuración.',
        leaveWorkspaceConfirmationApprover: (workspaceOwner: string) =>
            `Si abandonas este espacio de trabajo, ${workspaceOwner}, la persona propietaria del espacio de trabajo, te reemplazará en el flujo de aprobación.`,
        leaveWorkspaceConfirmationExporter: (workspaceOwner: string) =>
            `Si abandonas este espacio de trabajo, dejarás de ser la persona exportadora preferida y serás reemplazada por ${workspaceOwner}, la persona propietaria del espacio de trabajo.`,
        leaveWorkspaceConfirmationTechContact: (workspaceOwner: string) =>
            `Si abandonas este espacio de trabajo, ${workspaceOwner}, la persona propietaria del espacio de trabajo, pasará a ser el contacto técnico.`,
        leaveWorkspaceReimburser:
            'No puedes salir de este espacio de trabajo como reembolsador. Establece una nueva persona reembolsadora en Espacios de trabajo > Realizar o seguir pagos y luego inténtalo de nuevo.',
        reimbursable: 'Reembolsable',
        editYourProfile: 'Editar tu perfil',
        comments: 'Comentarios',
        sharedIn: 'Compartido en',
        unreported: 'No informado',
        invoice: 'Factura',
        expense: 'Gasto',
        chat: 'Chat',
        task: 'Tarea',
        trip: 'Viaje',
        apply: 'Aplicar',
        status: 'Estado',
        on: 'Activado',
        before: 'Antes',
        after: 'Después',
        range: 'Rango',
        reschedule: 'Reprogramar',
        general: 'General',
        workspacesTabTitle: 'Espacios de trabajo',
        headsUp: '¡Atención!',
        submitTo: 'Enviar a',
        forwardTo: 'Reenviar a',
        approvalLimit: 'Límite de aprobación',
        overLimitForwardTo: 'Reenviar por exceder límite a',
        merge: 'Combinar',
        none: 'Ninguno',
        unstableInternetConnection: 'Conexión a internet inestable. Revisa tu red e inténtalo de nuevo.',
        enableGlobalReimbursements: 'Habilitar reembolsos globales',
        purchaseAmount: 'Importe de la compra',
        originalAmount: 'Importe original',
        frequency: 'Frecuencia',
        link: 'Enlace',
        pinned: 'Fijado',
        read: 'Leer',
        copyToClipboard: 'Copiar al portapapeles',
        thisIsTakingLongerThanExpected: 'Esto está tardando más de lo esperado...',
        domains: 'Dominios',
        actionRequired: 'Acción requerida',
        duplicate: 'Duplicar',
        duplicated: 'Duplicado',
        duplicateExpense: 'Gasto duplicado',
        duplicateReport: 'Informe duplicado',
        copyOfReportName: (reportName: string) => `Copia de ${reportName}`,
        exchangeRate: 'Tipo de cambio',
        reimbursableTotal: 'Total reembolsable',
        nonReimbursableTotal: 'Total no reembolsable',
        opensInNewTab: 'Se abre en una nueva pestaña',
        locked: 'Bloqueado',
        month: 'Mes',
        week: 'Semana',
        year: 'Año',
        quarter: 'Trimestre',
        concierge: {
            sidePanelGreeting: 'Hola, ¿en qué puedo ayudarte?',
            showHistory: 'Mostrar historial',
        },
        vacationDelegate: 'Delegado de vacaciones',
        expensifyLogo: 'Logotipo de Expensify',
        approver: 'Aprobador',
        enterDigitLabel: ({digitIndex, totalDigits}: {digitIndex: number; totalDigits: number}) => `ingresa el dígito ${digitIndex} de ${totalDigits}`,
    },
    socials: {
        podcast: 'Síguenos en el pódcast',
        twitter: 'Síguenos en Twitter',
        instagram: 'Síguenos en Instagram',
        facebook: 'Síguenos en Facebook',
        linkedin: 'Síguenos en LinkedIn',
    },
    concierge: {
        collapseReasoning: 'Contraer razonamiento',
        expandReasoning: 'Ampliar razonamiento',
    },
    supportalNoAccess: {
        title: 'No tan rápido',
        descriptionWithCommand: (command?: string) =>
            `No tienes autorización para realizar esta acción cuando Soporte ha iniciado sesión (comando: ${command ?? ''}). Si crees que Success debería poder realizar esta acción, inicia una conversación en Slack.`,
    },
    lockedAccount: {
        title: 'Cuenta bloqueada',
        description: 'No tienes permiso para completar esta acción porque esta cuenta ha sido bloqueada. Comunícate con concierge@expensify.com para conocer los próximos pasos',
    },
    location: {
        useCurrent: 'Usar ubicación actual',
        notFound: 'No pudimos encontrar tu ubicación. Inténtalo de nuevo o introduce una dirección manualmente.',
        permissionDenied: 'Parece que has denegado el acceso a tu ubicación.',
        please: 'Por favor',
        allowPermission: 'permite el acceso a la ubicación en la configuración',
        tryAgain: 'e inténtalo de nuevo.',
    },
    contact: {
        importContacts: 'Importar contactos',
        importContactsTitle: 'Importa tus contactos',
        importContactsText: 'Importa tus contactos desde tu teléfono para que tus personas favoritas estén siempre a un toque de distancia.',
        importContactsExplanation: 'para que tus personas favoritas siempre estén a un toque de distancia.',
        importContactsNativeText: '¡Solo un paso más! Danos luz verde para importar tus contactos.',
    },
    anonymousReportFooter: {
        logoTagline: 'Únete a la conversación.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Acceso a la cámara',
        expensifyDoesNotHaveAccessToCamera: 'Expensify no puede tomar fotos sin acceso a tu cámara. Toca Configuración para actualizar los permisos.',
        attachmentError: 'Error de adjunto',
        errorWhileSelectingAttachment: 'Se produjo un error al seleccionar un archivo adjunto. Inténtalo de nuevo.',
        errorWhileSelectingCorruptedAttachment: 'Ocurrió un error al seleccionar un archivo adjunto dañado. Intenta con otro archivo.',
        takePhoto: 'Tomar foto',
        chooseFromGallery: 'Elegir de la galería',
        chooseDocument: 'Elegir archivo',
        attachmentTooLarge: 'El archivo adjunto es demasiado grande',
        sizeExceeded: 'El tamaño del archivo adjunto supera el límite de 24 MB',
        sizeExceededWithLimit: (maxUploadSizeInMB: number) => `El tamaño del archivo adjunto supera el límite de ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'El archivo adjunto es demasiado pequeño',
        sizeNotMet: 'El tamaño del archivo adjunto debe ser mayor que 240 bytes',
        wrongFileType: 'Tipo de archivo no válido',
        notAllowedExtension: 'Este tipo de archivo no está permitido. Prueba con un tipo de archivo diferente.',
        folderNotAllowedMessage: 'No se permite subir una carpeta. Intenta con un archivo diferente.',
        protectedPDFNotSupported: 'No se admite el PDF protegido con contraseña',
        attachmentImageResized: 'Esta imagen se ha redimensionado para la vista previa. Descárgala para verla en resolución completa.',
        attachmentImageTooLarge: 'Esta imagen es demasiado grande para previsualizarla antes de subirla.',
        imageDimensionsTooLarge: 'Las dimensiones de la imagen son demasiado grandes para procesarla. Usa una imagen más pequeña.',
        tooManyFiles: (fileLimit: number) => `Solo puedes subir hasta ${fileLimit} archivos a la vez.`,
        sizeExceededWithValue: (maxUploadSizeInMB: number) => `Los archivos superan ${maxUploadSizeInMB} MB. Vuelve a intentarlo.`,
        someFilesCantBeUploaded: 'Algunos archivos no se pueden cargar',
        sizeLimitExceeded: (maxUploadSizeInMB: number) => `Los archivos deben ser menores de ${maxUploadSizeInMB} MB. Los archivos más grandes no se subirán.`,
        maxFileLimitExceeded: 'Puedes subir hasta 30 recibos a la vez. Los adicionales no se subirán.',
        unsupportedFileType: (fileType: string) => `Los archivos ${fileType} no son compatibles. Solo se subirán los tipos de archivo compatibles.`,
        learnMoreAboutSupportedFiles: 'Más información sobre los formatos admitidos.',
        passwordProtected: 'Los archivos PDF protegidos con contraseña no son compatibles. Solo se subirán los archivos compatibles.',
    },
    dropzone: {
        addAttachments: 'Agregar archivos adjuntos',
        addReceipt: 'Agregar recibo',
        scanReceipts: 'Escanear recibos',
        replaceReceipt: 'Reemplazar recibo',
    },
    filePicker: {
        fileError: 'Error de archivo',
        errorWhileSelectingFile: 'Se produjo un error al seleccionar un archivo. Inténtalo de nuevo.',
    },
    connectionComplete: {
        title: 'Conexión completada',
        supportingText: 'Puedes cerrar esta ventana y volver a la aplicación de Expensify.',
    },
    avatarCropModal: {
        title: 'Editar foto',
        description: 'Arrastra, acerca y rota tu imagen como quieras.',
    },
    composer: {
        noExtensionFoundForMimeType: 'No se encontró ninguna extensión para el tipo MIME',
        problemGettingImageYouPasted: 'Hubo un problema al obtener la imagen que pegaste',
        commentExceededMaxLength: (formattedMaxLength: string) => `La longitud máxima del comentario es de ${formattedMaxLength} caracteres.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `La longitud máxima del título de la tarea es de ${formattedMaxLength} caracteres.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Actualizar app',
        updatePrompt: 'Hay una nueva versión de esta aplicación disponible.\nActualiza ahora o reinicia la aplicación más tarde para descargar los cambios más recientes.',
    },
    deeplinkWrapper: {
        launching: 'Iniciando Expensify',
        expired: 'Tu sesión ha vencido.',
        signIn: 'Vuelve a iniciar sesión.',
    },
    multifactorAuthentication: {
        reviewTransaction: {
            reviewTransaction: 'Revisar transacción',
            pleaseReview: 'Revisa esta transacción',
            requiresYourReview: 'Una transacción de Expensify Card requiere tu revisión.',
            transactionDetails: 'Detalles de la transacción',
            attemptedTransaction: 'Transacción intentada',
            deny: 'Denegar',
            approve: 'Aprobar',
            denyTransaction: 'Rechazar transacción',
            transactionDenied: 'Transacción denegada',
            transactionApproved: '¡Transacción aprobada!',
            areYouSureToDeny: '¿Estás seguro/a? La transacción será rechazada si cierras esta pantalla.',
            youCanTryAgainAtMerchantOrReachOut:
                'Puedes intentarlo de nuevo en el comercio. Si no realizaste esta transacción, <concierge-link>comunícate con Concierge</concierge-link> para reportar un posible fraude.',
            youNeedToTryAgainAtMerchant: 'Esta transacción no se verificó, así que la rechazamos. Tendrás que intentarlo de nuevo con el comercio.',
            goBackToTheMerchant: 'Vuelve al sitio del comercio para continuar con la transacción.',
            transactionFailed: 'Transacción fallida',
            transactionCouldNotBeCompleted: 'No se pudo completar tu transacción. Inténtalo de nuevo con el comercio.',
            transactionCouldNotBeCompletedReachOut:
                'No se pudo completar tu transacción. Si no intentaste hacer esta transacción, <concierge-link>comunícate con Concierge</concierge-link> para informar un posible fraude.',
            reviewFailed: 'La revisión falló',
            alreadyReviewedSubtitle:
                'Ya revisaste esta transacción. Por favor, consulta tu <transaction-history-link>historial de transacciones</transaction-history-link> o contacta a <concierge-link>Concierge</concierge-link> para informar cualquier problema.',
        },
        unsupportedDevice: {
            unsupportedDevice: 'Dispositivo no compatible',
            pleaseDownloadMobileApp: `Esta acción no es compatible con tu dispositivo. Descarga la aplicación de Expensify desde la <a href="${CONST.APP_DOWNLOAD_LINKS.IOS}">App Store</a> o desde <a href="${CONST.APP_DOWNLOAD_LINKS.ANDROID}">Google Play Store</a> e inténtalo de nuevo.`,
            pleaseUseWebApp: `Esta acción no es compatible con tu dispositivo. Usa la <a href="${CONST.NEW_EXPENSIFY_URL}">aplicación web de Expensify</a> e inténtalo de nuevo.`,
        },
        biometricsTest: {
            biometricsTest: 'Prueba biométrica',
            authenticationSuccessful: 'Autenticación correcta',
            successfullyAuthenticatedUsing: (authType?: string) => `Has autenticado correctamente usando ${authType}.`,
            troubleshootBiometricsStatus: ({status}: {status?: string}) => `Datos biométricos (${status})`,
            statusNeverRegistered: 'Nunca registrado',
            statusNotRegistered: 'No registrado',
            statusRegisteredOtherDevice: () => ({one: 'Otro dispositivo registrado', other: 'Otros dispositivos registrados'}),
            statusRegisteredThisDevice: 'Registrado',
            yourAttemptWasUnsuccessful: 'Tu intento de autenticación no tuvo éxito.',
            youCouldNotBeAuthenticated: 'No se pudo autenticar tu identidad',
            areYouSureToReject: '¿Estás seguro? El intento de autenticación se rechazará si cierras esta pantalla.',
            rejectAuthentication: 'Rechazar autenticación',
            test: 'Prueba',
            biometricsAuthentication: 'Autenticación biométrica',
            authType: {
                unknown: 'Desconocido',
                none: 'Ninguno',
                credentials: 'Credenciales',
                biometrics: 'Biometría',
                faceId: 'Face ID',
                touchId: 'Touch ID',
                opticId: 'ID óptica',
                passkey: 'Llave de acceso',
            },
        },
        pleaseEnableInSystemSettings: {
            start: 'Activa la verificación por rostro/huella dactilar o configura un código de acceso en tu',
            link: 'configuración del sistema',
            end: '.',
        },
        oops: 'Ups, algo salió mal',
        verificationFailed: 'Verificación fallida',
        looksLikeYouRanOutOfTime: 'Parece que se te acabó el tiempo. Vuelve a intentarlo con el comercio.',
        youRanOutOfTime: 'Se te acabó el tiempo',
        letsVerifyItsYou: 'Verifiquemos que eres tú',
        nowLetsAuthenticateYou: 'Ahora, vamos a autenticarte...',
        letsAuthenticateYou: 'Vamos a autenticarte...',
        verifyYourself: {
            biometrics: 'Verifícate con tu rostro o huella dactilar',
            passkeys: 'Verifícate con una clave de acceso',
        },
        enableQuickVerification: {
            biometrics: 'Activa una verificación rápida y segura con tu rostro o huella dactilar. No se requieren contraseñas ni códigos.',
            passkeys: 'Activa una verificación rápida y segura con una llave de acceso. No se necesitan contraseñas ni códigos.',
        },
        revoke: {
            revoke: 'Revocar',
            title: 'Cara/huella y claves de acceso',
            explanation:
                'La verificación por rostro/huella dactilar o clave de acceso está habilitada en uno o más dispositivos. Revocar el acceso requerirá un código mágico para la próxima verificación en ese dispositivo.',
            confirmationPrompt: '¿Estás seguro/a? Necesitarás un código mágico para la próxima verificación en ese dispositivo.',
            confirmationPromptThisDevice: '¿Estás seguro? Necesitarás un código mágico para la próxima verificación en este dispositivo.',
            confirmationPromptMultiple: '¿Estás seguro/a? Necesitarás un código mágico para la próxima verificación en esos dispositivos.',
            confirmationPromptAll: '¿Estás seguro? Necesitarás un código mágico para la próxima verificación en cualquier dispositivo.',
            cta: 'Revocar acceso',
            ctaAll: 'Revocar todo',
            noDevices: 'No tienes ningún dispositivo registrado para la verificación con rostro/huella dactilar o llave de acceso. Si registras alguno, podrás revocar ese acceso aquí.',
            dismiss: 'Entendido',
            error: 'La solicitud falló. Inténtalo de nuevo más tarde.',
            thisDevice: 'Este dispositivo',
            otherDevices: (otherDeviceCount?: number) => {
                const numberWords = ['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'];
                const displayCount = otherDeviceCount !== undefined && otherDeviceCount >= 1 && otherDeviceCount <= 9 ? numberWords.at(otherDeviceCount - 1) : `${otherDeviceCount}`;
                return `${displayCount} ${otherDeviceCount === 1 ? 'dispositivo' : 'dispositivos'} más`;
            },
        },
        setPin: {
            didNotShipCard: 'No enviamos tu tarjeta. Inténtalo de nuevo.',
        },
        revealPin: {
            couldNotReveal: 'No pudimos mostrar tu PIN. Inténtalo de nuevo.',
        },
        changePin: {
            didNotChange: 'No cambiamos tu PIN. Inténtalo de nuevo.',
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            ¡Abracadabra,
            has iniciado sesión!
        `),
        successfulSignInDescription: 'Vuelve a tu pestaña original para continuar.',
        title: 'Aquí tienes tu código mágico',
        description: dedent(`
            Introduce el código desde el dispositivo donde se solicitó originalmente
        `),
        doNotShare: dedent(`
            No compartas tu código con nadie.
            ¡Expensify nunca te lo pedirá!
        `),
        or: ', o',
        signInHere: 'solo inicia sesión aquí',
        expiredCodeTitle: 'El código mágico ha caducado',
        expiredCodeDescription: 'Vuelve al dispositivo original y solicita un código nuevo',
        successfulNewCodeRequest: 'Código solicitado. Por favor, revisa tu dispositivo.',
        tfaRequiredTitle: dedent(`
            Se requiere autenticación de dos factores
        `),
        tfaRequiredDescription: dedent(`
            Introduce el código de autenticación en dos pasos donde estás intentando iniciar sesión.
        `),
        requestOneHere: 'solicita una aquí.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Pagado por',
        whatsItFor: '¿Para qué es?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Nombre, correo electrónico o número de teléfono',
        findMember: 'Buscar miembro',
        searchForSomeone: 'Buscar a alguien',
        userSelected: (username: string) => `${username} seleccionado`,
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Presenta un gasto, invita a tu equipo',
            subtitleText: '¿Quieres que tu equipo también use Expensify? Solo envíales un gasto y nosotros nos encargaremos del resto.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Reservar una llamada',
    },
    hello: 'Hola',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Comienza a continuación.',
        anotherLoginPageIsOpen: 'Otra página de inicio de sesión está abierta.',
        anotherLoginPageIsOpenExplanation: 'Has abierto la página de inicio de sesión en una pestaña aparte. Inicia sesión desde esa pestaña.',
        welcome: '¡Bienvenido!',
        welcomeWithoutExclamation: 'Bienvenido',
        phrase2: 'El dinero habla. Y ahora que el chat y los pagos están en un solo lugar, también es fácil.',
        phrase3: 'Tus pagos llegan tan rápido como puedas hacerte entender.',
        enterPassword: 'Introduce tu contraseña',
        welcomeNewFace: (login: string) => `${login}, ¡siempre es un gusto ver una cara nueva por aquí!`,
        welcomeEnterMagicCode: (login: string) => `Introduce el código mágico enviado a ${login}. Debería llegar en uno o dos minutos.`,
    },
    login: {
        hero: {
            header: 'Viajes y gastos, a la velocidad del chat',
            body: 'Bienvenido a la nueva generación de Expensify, donde tus viajes y gastos avanzan más rápido con la ayuda de un chat contextual en tiempo real.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Continúa iniciando sesión con inicio de sesión único:',
        orContinueWithMagicCode: 'También puedes iniciar sesión con un código mágico',
        useSingleSignOn: 'Usar inicio de sesión único',
        useMagicCode: 'Usar código mágico',
        launching: 'Iniciando...',
        oneMoment: 'Un momento mientras te redirigimos al portal de inicio de sesión único de tu empresa.',
    },
    reportActionCompose: {
        dropToUpload: 'Suelta para subir',
        sendAttachment: 'Enviar archivo adjunto',
        addAttachment: 'Agregar archivo adjunto',
        writeSomething: 'Escribe algo...',
        blockedFromConcierge: 'La comunicación está bloqueada',
        askConciergeToUpdate: 'Prueba con «Actualizar un gasto»...',
        askConciergeToCorrect: 'Prueba con “Corregir un gasto”…',
        askConciergeForHelp: 'Pide ayuda a Concierge AI...',
        fileUploadFailed: 'La carga falló. El archivo no es compatible.',
        localTime: (user: string, time: string) => `Es ${time} para ${user}`,
        edited: '(editado)',
        emoji: 'Emoji',
        collapse: 'Contraer',
        expand: 'Expandir',
    },
    reportActionContextMenu: {
        copyMessage: 'Copiar mensaje',
        copied: '¡Copiado!',
        copyLink: 'Copiar enlace',
        copyURLToClipboard: 'Copiar URL al portapapeles',
        copyEmailToClipboard: 'Copiar correo electrónico al portapapeles',
        markAsUnread: 'Marcar como no leído',
        markAsRead: 'Marcar como leído',
        editAction: ({action}: EditActionParams) => `Editar ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'gasto' : 'comentario'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = 'comentario';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Eliminar ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = 'comentario';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `¿Seguro que quieres eliminar este ${type}?`;
        },
        onlyVisible: 'Visible solo para',
        explain: 'Explicar',
        explainMessage: 'Por favor, explícame esto.',
        replyInThread: 'Responder en el hilo',
        joinThread: 'Unirse al hilo',
        leaveThread: 'Salir del hilo',
        copyOnyxData: 'Copiar datos de Onyx',
        flagAsOffensive: 'Marcar como ofensivo',
        menu: 'Menú',
    },
    emojiReactions: {
        addReactionTooltip: 'Añadir reacción',
        reactedWith: 'reaccionó con',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `Te perdiste la fiesta en <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, aquí no hay nada que ver.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `Este chat es con todas las personas de Expensify en el dominio <strong>${domainRoom}</strong>. Úsalo para chatear con tus colegas, compartir consejos y hacer preguntas.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `Este chat es con la persona administradora de <strong>${workspaceName}</strong>. Úsalo para hablar sobre la configuración del espacio de trabajo y más.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `Este chat es con todas las personas de <strong>${workspaceName}</strong>. Úsalo para los anuncios más importantes.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `Esta sala de chat es para todo lo relacionado con <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `Este chat es para facturas entre <strong>${invoicePayer}</strong> y <strong>${invoiceReceiver}</strong>. Usa el botón + para enviar una factura.`,
        beginningOfChatHistory: (users: string) => `Este chat es con ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `Aquí es donde <strong>${submitterDisplayName}</strong> presentará gastos a <strong>${workspaceName}</strong>. Solo usa el botón +.`,
        beginningOfChatHistorySelfDM: 'Este es tu espacio personal. Úsalo para notas, tareas, borradores y recordatorios.',
        beginningOfChatHistorySystemDM: '¡Bienvenido! Vamos a configurarlo.',
        chatWithAccountManager: 'Chatea con tu gestor de cuenta aquí',
        askMeAnything: '¡Pregúntame lo que quieras!',
        sayHello: '¡Di hola!',
        yourSpace: 'Tu espacio',
        welcomeToRoom: (roomName: string) => `¡Bienvenido/a a ${roomName}!`,
        usePlusButton: (additionalText: string) => `Usa el botón + para ${additionalText} un gasto.`,
        askConcierge: 'Este es tu chat con Concierge, tu agente de IA personal. ¡Puedo hacer casi cualquier cosa, pruébame!',
        conciergeSupport: 'Tu agente de IA personal',
        create: 'crear',
        iouTypes: {
            pay: 'pagar',
            split: 'dividir',
            submit: 'enviar',
            track: 'seguir',
            invoice: 'factura',
        },
    },
    adminOnlyCanPost: 'Solo las personas administradoras pueden enviar mensajes en esta sala.',
    readOnlyConversation: 'Esta conversación es de solo lectura.',
    reportAction: {
        asCopilot: 'como copiloto de',
        assistedBy: (agentName: string) => `con la asistencia de ${agentName}`,
        humanSupportAgent: 'un agente de soporte humano',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `creó este informe para contener todos los gastos de <a href="${reportUrl}">${reportName}</a> que no se pudieron enviar con la frecuencia que elegiste`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName, reportID, isReportDeleted}: CreatedReportForUnapprovedTransactionsParams) =>
            isReportDeleted
                ? `creó este informe para cualquier gasto retenido del informe eliminado n.º ${reportID}`
                : `creó este informe para cualquier gasto retenido de <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: 'Notificar a todas las personas en esta conversación',
    },
    newMessages: 'Mensajes nuevos',
    latestMessages: 'Mensajes más recientes',
    youHaveBeenBanned: 'Nota: Se te ha prohibido chatear en este canal.',
    reportTypingIndicator: {
        isTyping: 'está escribiendo...',
        areTyping: 'están escribiendo...',
        multipleMembers: 'Varios miembros',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Esta sala de chat ha sido archivada.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Este chat ya no está activo porque ${displayName} cerró su cuenta.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Este chat ya no está activo porque ${oldDisplayName} ha fusionado su cuenta con ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Este chat ya no está activo porque <strong>ya no eres</strong> miembro del espacio de trabajo ${policyName}.`
                : `Este chat ya no está activo porque ${displayName} ya no es miembro del espacio de trabajo ${policyName}.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Este chat ya no está activo porque ${policyName} ya no es un espacio de trabajo activo.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Este chat ya no está activo porque ${policyName} ya no es un espacio de trabajo activo.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Esta reserva está archivada.',
    },
    writeCapabilityPage: {
        label: 'Quién puede publicar',
        writeCapability: {
            all: 'Todos los miembros',
            admins: 'Solo administradores',
        },
    },
    sidebarScreen: {
        buttonFind: 'Encuentra algo...',
        buttonMySettings: 'Mis ajustes',
        fabNewChat: 'Iniciar chat',
        fabNewChatExplained: 'Abrir menú de acciones',
        fabScanReceiptExplained: 'Escanear recibo',
        chatPinned: 'Chat fijado',
        draftedMessage: 'Mensaje borrador',
        listOfChatMessages: 'Lista de mensajes de chat',
        listOfChats: 'Lista de chats',
        saveTheWorld: 'Salvar el mundo',
        tooltip: '¡Empieza aquí!',
        redirectToExpensifyClassicModal: {
            title: 'Próximamente',
            description: 'Estamos ajustando algunos detalles más de la Nueva Expensify para adaptarla a tu configuración específica. Mientras tanto, ve a Expensify Classic.',
        },
    },
    homePage: {
        forYou: 'Para ti',
        timeSensitiveSection: {
            title: 'Urgente',
            ctaFix: 'Corregir',
            fixCompanyCardConnection: {
                title: ({feedName}: {feedName: string}) => (feedName ? `Corregir la conexión de la tarjeta corporativa ${feedName}` : 'Corregir conexión de tarjeta de empresa'),
                defaultSubtitle: 'Espacio de trabajo',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            fixPersonalCardConnection: {
                title: ({cardName}: {cardName?: string}) => (cardName ? `Corregir la conexión de la tarjeta personal ${cardName}` : 'Corregir conexión de tarjeta personal'),
                subtitle: 'Billetera',
            },
            fixAccountingConnection: {
                title: ({integrationName}: {integrationName: string}) => `Arreglar la conexión de ${integrationName}`,
                defaultSubtitle: 'Espacio de trabajo',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            addShippingAddress: {
                title: 'Necesitamos tu dirección de envío',
                subtitle: 'Proporciona una dirección para recibir tu Expensify Card.',
                cta: 'Agregar dirección',
            },
            addPaymentCard: {
                title: 'Agrega una tarjeta de pago para seguir usando Expensify',
                subtitle: 'Cuenta > Suscripción',
                cta: 'Agregar',
            },
            activateCard: {
                title: 'Activa tu Expensify Card',
                subtitle: 'Valida tu tarjeta y empieza a gastar.',
                cta: 'Activar',
            },
            reviewCardFraud: {
                title: 'Revisa un posible fraude en tu Expensify Card',
                titleWithDetails: ({amount, merchant}: {amount: string; merchant: string}) => `Revisar ${amount} de posible fraude en ${merchant}`,
                subtitle: 'Tarjeta Expensify',
                cta: 'Revisar',
            },
            validateAccount: {
                title: 'Valida tu cuenta para seguir usando Expensify',
                subtitle: 'Cuenta',
                cta: 'Validar',
            },
            fixFailedBilling: {
                title: 'No pudimos cobrar a tu tarjeta registrada',
                subtitle: 'Suscripción',
            },
            unlockBankAccount: {
                workspaceTitle: 'Tu cuenta bancaria empresarial ha sido bloqueada',
                personalTitle: 'Tu cuenta bancaria ha sido bloqueada',
                workspaceSubtitle: ({policyName}: {policyName: string}) => policyName,
                personalSubtitle: 'Billetera',
            },
        },
        freeTrialSection: {
            title: ({days}: {days: number}) => `Prueba gratuita: ¡quedan ${days} ${days === 1 ? 'día' : 'días'}!`,
            offer50Body: '¡Obtén un 50% de descuento en tu primer año!',
            offer25Body: '¡Obtén un 25% de descuento en tu primer año!',
            addCardBody: 'No esperes. Agrega tu tarjeta de pago ahora.',
            ctaClaim: 'Reclamar',
            ctaAdd: 'Agregar tarjeta',
            timeRemaining: ({formattedTime}: {formattedTime: string}) => `Tiempo restante: ${formattedTime}`,
            timeRemainingDays: () => ({
                one: 'Tiempo restante: 1 día',
                other: (pluralCount: number) => `Tiempo restante: ${pluralCount} días`,
            }),
        },
        assignedCards: 'Tus tarjetas Expensify',
        assignedCardsRemaining: ({amount}: {amount: string}) => `Quedan ${amount}`,
        announcements: 'Anuncios',
        discoverSection: {
            title: 'Descubrir',
            menuItemTitleNonAdmin: 'Aprende a crear gastos y enviar informes.',
            menuItemTitleAdmin: 'Aprende a invitar miembros, editar flujos de aprobación y conciliar tarjetas corporativas.',
            menuItemDescription: 'Descubre lo que Expensify puede hacer en 2 minutos',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `Enviar ${count} ${count === 1 ? 'informe' : 'informes'}`,
            approve: ({count}: {count: number}) => `Aprobar ${count} ${count === 1 ? 'informe' : 'informes'}`,
            pay: ({count}: {count: number}) => `Pagar ${count} ${count === 1 ? 'informe' : 'informes'}`,
            export: ({count}: {count: number}) => `Exportar ${count} ${count === 1 ? 'informe' : 'informes'}`,
            begin: 'Comenzar',
            emptyStateMessages: {
                thumbsUpStarsTitle: '¡Has terminado!',
                thumbsUpStarsDescription: 'Pulgares arriba para ti, mantente atento a más tareas.',
                smallRocketTitle: 'Todo al día',
                smallRocketDescription: 'Las próximas tareas pendientes aparecerán aquí.',
                cowboyHatTitle: '¡Has terminado!',
                cowboyHatDescription: 'Todas las tareas están controladas, mantente atento a más.',
                trophy1Title: 'Nada que mostrar',
                trophy1Description: '¡Lo lograste! Estate pendiente de más tareas.',
                palmTreeTitle: 'Todo al día',
                palmTreeDescription: 'Es hora de relajarse, pero mantente atento a futuras tareas.',
                fishbowlBlueTitle: '¡Has terminado!',
                fishbowlBlueDescription: 'Mostraremos aquí las tareas futuras.',
                targetTitle: 'Todo al día',
                targetDescription: 'Bien hecho, sigues en el buen camino. ¡Vuelve más tarde para ver más tareas!',
                chairTitle: 'Nada que mostrar',
                chairDescription: 'Ve y relájate, aquí mostraremos tus próximas tareas pendientes.',
                broomTitle: '¡Has terminado!',
                broomDescription: 'Las tareas están al día, aunque estate atento a más pendientes.',
                houseTitle: 'Todo al día',
                houseDescription: 'Este es tu punto de partida para las próximas tareas pendientes.',
                conciergeBotTitle: 'Nada que mostrar',
                conciergeBotDescription: 'Bip bip bip bip, ¡vuelve más tarde para más tareas!',
                checkboxTextTitle: 'Todo al día',
                checkboxTextDescription: 'Marca tus próximas tareas pendientes aquí.',
                flashTitle: '¡Has terminado!',
                flashDescription: 'Aquí enviaremos tus próximas tareas.',
                sunglassesTitle: 'Nada que mostrar',
                sunglassesDescription: 'Hora de relajarse, pero mantente atento a lo que viene.',
                f1FlagsTitle: 'Todo al día',
                f1FlagsDescription: 'Has completado todas las tareas pendientes.',
            },
        },
        gettingStartedSection: {
            title: 'Comenzar',
            createWorkspace: 'Crear un espacio de trabajo',
            connectAccounting: ({integrationName}: {integrationName: string}) => `Conectar con ${integrationName}`,
            connectAccountingDefault: 'Conectar con contabilidad',
            customizeCategories: 'Personalizar categorías contables',
            linkCompanyCards: 'Vincular tarjetas corporativas',
            setupRules: 'Configurar reglas de gastos',
        },
        upcomingTravel: 'Próximos viajes',
        upcomingTravelSection: {
            flightTo: ({destination}: {destination: string}) => `Vuelo a ${destination}`,
            trainTo: ({destination}: {destination: string}) => `Tren a ${destination}`,
            hotelIn: ({destination}: {destination: string}) => `Hotel en ${destination}`,
            carRentalIn: ({destination}: {destination: string}) => `Alquiler de coche en ${destination}`,
            inOneWeek: 'En 1 semana',
            inDays: () => ({
                one: 'En 1 día',
                other: (count: number) => `En ${count} días`,
            }),
            today: 'Hoy',
        },
    },
    allSettingsScreen: {
        subscription: 'Suscripción',
        domains: 'Dominios',
    },
    tabSelector: {
        chat: 'Chat',
        room: 'Habitación',
        distance: 'Distancia',
        manual: 'Manual',
        scan: 'Escanear',
        map: 'Mapa',
        gps: 'GPS',
        odometer: 'Odómetro',
    },
    spreadsheet: {
        upload: 'Sube una hoja de cálculo',
        import: 'Importar hoja de cálculo',
        dragAndDrop: '<muted-link>Arrastra y suelta tu hoja de cálculo aquí, o elige un archivo abajo. Formatos admitidos: .csv, .txt, .xls y .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Arrastra y suelta tu hoja de cálculo aquí, o elige un archivo a continuación. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Más información</a> sobre los formatos de archivo compatibles.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Selecciona un archivo de hoja de cálculo para importar. Formatos admitidos: .csv, .txt, .xls y .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Selecciona un archivo de hoja de cálculo para importar. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Más información</a> sobre los formatos de archivo compatibles.</muted-link>`,
        fileContainsHeader: 'El archivo contiene encabezados de columna',
        column: (name: string) => `Columna ${name}`,
        fieldNotMapped: (fieldName: string) => `¡Ups! Un campo obligatorio (“${fieldName}”) no ha sido asignado. Revisa y vuelve a intentarlo.`,
        singleFieldMultipleColumns: (fieldName: string) => `¡Ups! Has asignado un único campo («${fieldName}») a varias columnas. Revísalo e inténtalo de nuevo.`,
        emptyMappedField: (fieldName: string) => `¡Ups! El campo ("${fieldName}") contiene uno o más valores vacíos. Revisa y vuelve a intentarlo.`,
        importSuccessfulTitle: 'Importación correcta',
        importCategoriesSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return 'No se agregó ni actualizó ninguna categoría.';
            }
            if (added && updated) {
                return `${added} ${added === 1 ? 'categoría' : 'categorías'} añadido(s), ${updated} ${updated === 1 ? 'categoría' : 'categorías'} actualizado(s).`;
            }
            if (added) {
                return added === 1 ? 'Se ha añadido 1 categoría.' : `Se han añadido ${added} categorías.`;
            }
            return updated === 1 ? 'Se ha actualizado 1 categoría.' : `Se han actualizado ${updated} categorías.`;
        },
        importCompanyCardTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `Se han agregado ${transactions} transacciones.` : 'Se ha añadido 1 transacción.',
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return 'No se añadió ni actualizó ningún miembro.';
            }
            if (added && updated) {
                return `${added} miembro${added > 1 ? 's' : ''} añadido, ${updated} miembro${updated > 1 ? 's' : ''} actualizado.`;
            }
            if (updated) {
                return updated > 1 ? `Se han actualizado ${updated} miembros.` : 'Se ha actualizado 1 miembro.';
            }
            return added > 1 ? `Se han agregado ${added} miembros.` : 'Se ha añadido 1 miembro.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `Se han añadido ${tags} etiquetas.` : 'Se ha añadido 1 etiqueta.'),
        importMultiLevelTagsSuccessfulDescription: 'Se han añadido etiquetas multinivel.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `Se han agregado ${rates} tarifas de viáticos diarios.` : 'Se ha añadido 1 tarifa de viáticos.'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `Se han importado ${transactions} transacciones.` : 'Se ha importado 1 transacción.',
        importFailedTitle: 'Error al importar',
        importFailedDescription: 'Asegúrate de que todos los campos estén completos correctamente e inténtalo de nuevo. Si el problema continúa, comunícate con Concierge.',
        importDescription: 'Elige qué campos asignar desde tu hoja de cálculo haciendo clic en el menú desplegable junto a cada columna importada a continuación.',
        sizeNotMet: 'El tamaño del archivo debe ser mayor que 0 bytes',
        invalidFileMessage:
            'El archivo que subiste está vacío o contiene datos no válidos. Asegúrate de que el archivo tenga el formato correcto y contenga la información necesaria antes de volver a subirlo.',
        importSpreadsheetLibraryError: 'Error al cargar el módulo de hoja de cálculo. Por favor, verifica tu conexión a internet e inténtalo de nuevo.',
        importSpreadsheet: 'Importar hoja de cálculo',
        downloadCSV: 'Descargar CSV',
        importMemberConfirmation: () => ({
            one: `Confirma los siguientes detalles para la nueva persona del espacio de trabajo que se añadirá como parte de esta carga. Los miembros existentes no recibirán actualizaciones de rol ni mensajes de invitación.`,
            other: (count: number) =>
                `Confirma los siguientes detalles para las ${count} personas nuevas del espacio de trabajo que se añadirán como parte de esta carga. Las personas que ya sean miembros no recibirán actualizaciones de rol ni mensajes de invitación.`,
        }),
    },
    receipt: {
        upload: 'Subir recibo',
        uploadMultiple: 'Subir recibos',
        desktopSubtitleSingle: `o arrástralo y suéltalo aquí`,
        desktopSubtitleMultiple: `o arrástralos y suéltalos aquí`,
        alternativeMethodsTitle: 'Otras formas de añadir recibos:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">Descarga la app</a> para escanear desde tu teléfono</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Reenvía recibos a <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Agrega tu número</a> para enviar recibos por SMS a ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Envía recibos por SMS al ${phoneNumber} (solo números de EE. UU.)</label-text>`,
        takePhoto: 'Tomar una foto',
        cameraAccess: 'Es necesario acceder a la cámara para tomar fotos de los recibos.',
        deniedCameraAccess: `Todavía no se ha otorgado acceso a la cámara, sigue por favor <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">estas instrucciones</a>.`,
        cameraErrorTitle: 'Error de cámara',
        cameraErrorMessage: 'Se produjo un error al tomar la foto. Inténtalo de nuevo.',
        locationAccessTitle: 'Permitir acceso a la ubicación',
        locationAccessMessage: 'El acceso a la ubicación nos ayuda a mantener tu zona horaria y tu moneda precisas dondequiera que vayas.',
        locationErrorTitle: 'Permitir acceso a la ubicación',
        locationErrorMessage: 'El acceso a la ubicación nos ayuda a mantener tu zona horaria y tu moneda precisas dondequiera que vayas.',
        allowLocationFromSetting: `El acceso a la ubicación nos ayuda a mantener tu zona horaria y tu moneda precisas dondequiera que vayas. Permite el acceso a la ubicación en los ajustes de permisos de tu dispositivo.`,
        dropTitle: 'Déjalo ir',
        dropMessage: 'Suelta tu archivo aquí',
        flash: 'flash',
        multiScan: 'escaneo múltiple',
        shutter: 'obturador',
        gallery: 'galería',
        deleteReceipt: 'Eliminar recibo',
        deleteConfirmation: '¿Seguro que quieres eliminar este recibo?',
        addReceipt: 'Agregar recibo',
        addAdditionalReceipt: 'Agregar recibo adicional',
        scanFailed: 'No se pudo escanear el recibo porque falta el comercio, la fecha o el importe.',
        crop: 'Recortar',
        addAReceipt: {
            phrase1: 'Agregar un recibo',
            phrase2: 'o arrastra y suelta uno aquí',
        },
    },
    quickAction: {
        scanReceipt: 'Escanear recibo',
        recordDistance: 'Registrar distancia',
        requestMoney: 'Crear gasto',
        perDiem: 'Crear viáticos',
        splitBill: 'Dividir gasto',
        splitScan: 'Dividir recibo',
        splitDistance: 'Dividir distancia',
        paySomeone: (name?: string) => `Pagar ${name ?? 'alguien'}`,
        assignTask: 'Asignar tarea',
        header: 'Acción rápida',
        noLongerHaveReportAccess: 'Ya no tienes acceso a tu destino anterior de acción rápida. Elige uno nuevo a continuación.',
        updateDestination: 'Actualizar destino',
        createReport: 'Crear informe',
        createTimeExpense: 'Crear gasto de tiempo',
    },
    iou: {
        amount: 'Importe',
        percent: 'Porcentaje',
        date: 'Fecha',
        taxAmount: 'Importe de impuestos',
        taxRate: 'Tasa de impuesto',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `Aprobar ${formattedAmount}` : 'Aprobar'),
        approved: 'Aprobado',
        cash: 'Efectivo',
        card: 'Tarjeta',
        original: 'Original',
        split: 'Dividir',
        splitExpense: 'Dividir gasto',
        splitDates: 'Dividir fechas',
        splitDateRange: (startDate: string, endDate: string, count: number) => `${startDate} a ${endDate} (${count} días)`,
        splitExpenseSubtitle: (amount: string, merchant: string) => `${amount} de ${merchant}`,
        splitByPercentage: 'Dividir por porcentaje',
        splitByDate: 'Dividir por fecha',
        addSplit: 'Agregar división',
        makeSplitsEven: 'Dividir montos equitativamente',
        editSplits: 'Editar divisiones',
        totalAmountGreaterThanOriginal: (amount: string) => `El importe total es ${amount} mayor que el gasto original.`,
        totalAmountLessThanOriginal: (amount: string) => `El importe total es ${amount} menor que el gasto original.`,
        splitExpenseZeroAmount: 'Introduce un importe válido antes de continuar.',
        splitExpenseOneMoreSplit: 'No se agregaron divisiones. Agrega al menos una para guardar.',
        splitExpenseEditTitle: (amount: string, merchant: string) => `Editar ${amount} para ${merchant}`,
        removeSplit: 'Eliminar división',
        splitExpenseCannotBeEditedModalTitle: 'Este gasto no se puede editar',
        splitExpenseCannotBeEditedModalDescription: 'Los gastos aprobados o pagados no se pueden editar',
        paySomeone: (name?: string) => `Pagar ${name ?? 'alguien'}`,
        splitExpenseDistanceErrorModalDescription: 'Corrige el error en la tarifa de distancia e inténtalo de nuevo.',
        splitExpensePerDiemRateErrorModalDescription: 'Corrige el error en la tarifa de viáticos e inténtalo de nuevo.',
        expense: 'Gasto',
        categorize: 'Categorizar',
        share: 'Compartir',
        participants: 'Participantes',
        createExpense: 'Crear gasto',
        trackDistance: 'Registrar distancia',
        createExpenses: (expensesNumber: number) => `Crear ${expensesNumber} gastos`,
        removeExpense: 'Eliminar gasto',
        removeThisExpense: 'Eliminar este gasto',
        removeExpenseConfirmation: '¿Seguro que quieres eliminar este recibo? Esta acción no se puede deshacer.',
        addExpense: 'Agregar gasto',
        chooseRecipient: 'Elegir destinatario',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Crear gasto de ${amount}`,
        confirmDetails: 'Confirmar detalles',
        pay: 'Pagar',
        cancelPayment: 'Cancelar pago',
        cancelPaymentConfirmation: '¿Seguro que quieres cancelar este pago?',
        viewDetails: 'Ver detalles',
        pending: 'Pendiente',
        canceled: 'Cancelado',
        posted: 'Publicado',
        deleteReceipt: 'Eliminar recibo',
        findExpense: 'Buscar gasto',
        deletedTransaction: (amount: string, merchant: string) => `eliminó un gasto (${amount} por ${merchant})`,
        movedFromReport: (reportName: string) => `movió un gasto${reportName ? `de ${reportName}` : ''}`,
        movedTransactionTo: (reportUrl: string, reportName?: string) => `movió este gasto${reportName ? `a <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: (reportUrl: string, reportName?: string) => `movió este gasto${reportName ? `de <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: (reportUrl: string) => `movió este gasto a tu <a href="${reportUrl}">espacio personal</a>`,
        movedAction: (shouldHideMovedReportUrl: boolean, movedReportUrl: string, newParentReportUrl: string, toPolicyName: string) => {
            if (shouldHideMovedReportUrl) {
                return `movió este informe al espacio de trabajo <a href="${newParentReportUrl}">${toPolicyName}</a>`;
            }
            return `movió este <a href="${movedReportUrl}">informe</a> al espacio de trabajo <a href="${newParentReportUrl}">${toPolicyName}</a>`;
        },
        pendingMatchWithCreditCard: 'Recibo pendiente de conciliar con la transacción de la tarjeta',
        pendingMatch: 'Coincidencia pendiente',
        pendingMatchWithCreditCardDescription: 'Recibo pendiente de coincidir con una transacción de tarjeta. Márcalo como efectivo para cancelar.',
        markAsCash: 'Marcar como efectivo',
        pendingMatchSubmitTitle: 'Enviar informe',
        pendingMatchSubmitDescription: 'Algunos gastos están a la espera de coincidir con una transacción de tarjeta de crédito. ¿Quieres marcarlos como en efectivo?',
        routePending: 'Enrutando pendiente...',
        automaticallyEnterExpenseDetails: 'Concierge ingresará automáticamente los detalles del gasto por ti o puedes añadirlos manualmente.',
        receiptScanning: () => ({
            one: 'Escaneando recibo...',
            other: 'Escaneando recibos...',
        }),
        scanMultipleReceipts: 'Escanear varios recibos',
        scanMultipleReceiptsDescription: 'Toma fotos de todos tus recibos a la vez y luego confirma los detalles tú o deja que los confirmemos por ti.',
        receiptScanInProgress: 'Escaneo de recibo en curso',
        receiptScanInProgressDescription: 'Escaneo del recibo en progreso. Vuelve más tarde o ingresa los datos ahora.',
        removeFromReport: 'Quitar del informe',
        moveToPersonalSpace: 'Mover gastos a tu espacio personal',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Se detectaron posibles gastos duplicados. Revisa los duplicados para habilitar el envío.'
                : 'Se identificaron posibles gastos duplicados. Revisa los duplicados para habilitar la aprobación.',
        receiptIssuesFound: () => ({
            one: 'Problema encontrado',
            other: 'Problemas encontrados',
        }),
        fieldPending: 'Pendiente...',
        defaultRate: 'Tarifa predeterminada',
        receiptMissingDetails: 'Faltan datos en el recibo',
        missingAmount: 'Falta el importe',
        missingMerchant: 'Comercio faltante',
        receiptStatusTitle: 'Escaneando…',
        receiptStatusText: 'Solo tú puedes ver este recibo mientras se está escaneando. Vuelve más tarde o ingresa los detalles ahora.',
        receiptScanningFailed: 'Error al escanear el recibo. Introduce los datos manualmente.',
        transactionPendingDescription: 'Transacción pendiente. Puede tardar unos días en registrarse.',
        companyInfo: 'Información de la compañía',
        companyInfoDescription: 'Necesitamos algunos datos más antes de que puedas enviar tu primera factura.',
        yourCompanyName: 'Nombre de tu empresa',
        yourCompanyWebsite: 'El sitio web de tu empresa',
        yourCompanyWebsiteNote: 'Si no tienes un sitio web, puedes proporcionar el perfil de LinkedIn o de redes sociales de tu empresa en su lugar.',
        invalidDomainError: 'Has introducido un dominio no válido. Para continuar, introduce un dominio válido.',
        publicDomainError: 'Has introducido un dominio público. Para continuar, ingresa un dominio privado.',
        expenseCount: () => {
            return {
                one: '1 gasto',
                other: (count: number) => `${count} gastos`,
            };
        },
        deleteExpense: () => ({
            one: 'Eliminar gasto',
            other: 'Eliminar gastos',
        }),
        deleteConfirmation: () => ({
            one: '¿Estás seguro de que quieres eliminar este gasto?',
            other: '¿Seguro que quieres eliminar estos gastos?',
        }),
        deleteReport: () => ({
            one: 'Eliminar informe',
            other: 'Eliminar informes',
        }),
        deleteReportConfirmation: () => ({
            one: '¿Estás seguro de que quieres eliminar este informe?',
            other: '¿Estás seguro de que quieres eliminar estos informes?',
        }),
        settledExpensify: 'Pagado',
        done: 'Listo',
        deleted: 'Eliminado',
        settledElsewhere: 'Pagado en otro lugar',
        individual: 'Individual',
        business: 'Negocio',
        settlePersonal: (formattedAmount?: string) => (formattedAmount ? `Pagar ${formattedAmount} como persona individual` : `Pagar con cuenta personal`),
        settleWallet: (formattedAmount?: string) => (formattedAmount ? `Pagar ${formattedAmount} con monedero` : `Pagar con monedero`),
        settlePayment: (formattedAmount: string) => `Pagar ${formattedAmount}`,
        settleBusiness: (formattedAmount?: string) => (formattedAmount ? `Paga ${formattedAmount} como empresa` : `Pagar con cuenta empresarial`),
        payElsewhere: (formattedAmount?: string) => (formattedAmount ? `Marcar ${formattedAmount} como pagado` : `Marcar como pagado`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `pagó ${amount} con la cuenta personal ${last4Digits}` : `Pagado con cuenta personal`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `pagó ${amount} con la cuenta empresarial ${last4Digits}` : `Pagado con cuenta de empresa`),
        payWithPolicy: (policyName: string, formattedAmount?: string) => (formattedAmount ? `Paga ${formattedAmount} mediante ${policyName}` : `Pagar con ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `pagó ${amount} con la cuenta bancaria ${last4Digits}` : `pagado con cuenta bancaria ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `pagado ${amount ? `${amount} ` : ''} con la cuenta bancaria ${last4Digits} mediante las <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">reglas del espacio de trabajo</a>`,
        invoicePersonalBank: (lastFour: string) => `Cuenta personal • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Cuenta empresarial • ${lastFour}`,
        nextStep: 'Próximos pasos',
        finished: 'Finalizado',
        flip: 'Voltear',
        sendInvoice: (amount: string) => `Enviar factura de ${amount}`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `para ${comment}` : ''}`,
        submitted: (memo?: string) => `enviado${memo ? `, diciendo ${memo}` : ''}`,
        automaticallySubmitted: `enviado mediante <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">aplazar envíos</a>`,
        queuedToSubmitViaDEW: 'en cola para enviar mediante flujo de aprobación personalizado',
        failedToAutoSubmitViaDEW: (reason: string) => `no se pudo enviar el informe mediante <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">retrasar envíos</a>. ${reason}`,
        failedToSubmitViaDEW: (reason: string) => `no se pudo enviar el informe. ${reason}`,
        failedToAutoApproveViaDEW: (reason: string) =>
            `no se pudo aprobar mediante las <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">reglas del espacio de trabajo</a>. ${reason}`,
        failedToApproveViaDEW: (reason: string) => `no se pudo aprobar. ${reason}`,
        queuedToApproveViaDEW: 'en cola para aprobar mediante flujo de aprobación personalizado',
        trackedAmount: (formattedAmount: string, comment?: string) => `rastreando ${formattedAmount}${comment ? `para ${comment}` : ''}`,
        splitAmount: (amount: string) => `dividir ${amount}`,
        didSplitAmount: (formattedAmount: string, comment?: string) => `dividir ${formattedAmount}${comment ? `para ${comment}` : ''}`,
        yourSplit: (amount: string) => `Tu parte de ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} debe ${amount}${comment ? `para ${comment}` : ''}`,
        payerOwes: (payer: string) => `${payer} debe:`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}pagó ${amount}`,
        payerPaid: (payer: string) => `${payer} pagó:`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} gastó ${amount}`,
        payerSpent: (payer: string) => `${payer} gastó:`,
        managerApproved: (manager: string) => `${manager} aprobó:`,
        managerApprovedAmount: (manager: string, amount: number | string) => `${manager} aprobó ${amount}`,
        payerSettled: (amount: number | string) => `pagó ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `pagó ${amount}. Agrega una cuenta bancaria para recibir tu pago.`,
        automaticallyApproved: `aprobado mediante las <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">reglas del espacio de trabajo</a>`,
        approvedAmount: (amount: number | string) => `aprobado ${amount}`,
        approvedMessage: `aprobado`,
        unapproved: `no aprobado`,
        automaticallyForwarded: `aprobado mediante las <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">reglas del espacio de trabajo</a>`,
        forwarded: `aprobado`,
        rejectedThisReport: 'rechazado',
        waitingOnBankAccount: (submitterDisplayName: string) => `inició el pago, pero está esperando a que ${submitterDisplayName} agregue una cuenta bancaria.`,
        adminCanceledRequest: 'canceló el pago',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `canceló el pago de ${amount} porque ${submitterDisplayName} no habilitó su Expensify Wallet en un plazo de 30 días`,
        settledAfterAddedBankAccount: (submitterDisplayName: string, amount: string) => `${submitterDisplayName} agregó una cuenta bancaria. Se ha realizado el pago de ${amount}.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}marcado como pagado${comment ? `, diciendo «${comment}»` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}pagado con billetera`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}pagado con Expensify mediante las <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">reglas del espacio de trabajo</a>`,
        reimbursedThisReport: 'reembolsó este informe',
        paidThisBill: 'pagó esta factura',
        reimbursedOnBehalfOf: (actor: string) => `en nombre de ${actor}`,
        reimbursedFromBankAccount: (debitBankAccount: string) => `desde la cuenta bancaria terminada en ${debitBankAccount}`,
        reimbursedSubmitterAddedBankAccount: (submitter: string) => `${submitter} agregó una cuenta bancaria y quitó el informe de la retención. El reembolso se ha iniciado`,
        reimbursedWithFastACH: ({
            isCurrentUser,
            submitterLogin,
            creditBankAccount,
            expectedDate,
        }: {
            isCurrentUser: boolean;
            submitterLogin: string;
            creditBankAccount: string;
            expectedDate: string;
        }) =>
            isCurrentUser
                ? `. El dinero va en camino a tu${creditBankAccount ? `cuenta bancaria que termina en ${creditBankAccount}` : 'cuenta'}. Reembolso estimado para completarse el ${expectedDate}.`
                : `. El dinero va en camino a la cuenta de ${submitterLogin}${creditBankAccount ? `cuenta bancaria que termina en ${creditBankAccount}` : 'cuenta'}. Se estima que el reembolso se completará el ${expectedDate}.`,
        reimbursedWithCheck: 'mediante cheque.',
        reimbursedWithStripeConnect: ({
            isCurrentUser,
            submitterLogin,
            creditBankAccount,
            isCard,
        }: {
            isCurrentUser: boolean;
            submitterLogin: string;
            creditBankAccount: string;
            isCard: boolean;
        }) => {
            const paymentMethod = isCard ? 'tarjeta' : 'cuenta bancaria';
            return isCurrentUser
                ? `. El dinero va en camino a tu ${creditBankAccount ? `cuenta bancaria que termina en ${creditBankAccount}` : 'cuenta'} (pagado mediante ${paymentMethod}). Esto puede tardar hasta 10 días hábiles.`
                : `. El dinero está en camino a la cuenta ${creditBankAccount ? `cuenta bancaria que termina en ${creditBankAccount}` : 'cuenta'} de ${submitterLogin} (pagado mediante ${paymentMethod}). Esto podría tardar hasta 10 días hábiles.`;
        },
        reimbursedWithACH: ({creditBankAccount, expectedDate}: {creditBankAccount?: string; expectedDate?: string}) =>
            `con depósito directo (ACH)${creditBankAccount ? `a la cuenta bancaria terminada en ${creditBankAccount}.` : '. '}${expectedDate ? `Se estima que el reembolso se completará para el ${expectedDate}.` : 'Esto suele tardar entre 4 y 5 días hábiles.'}`,
        noReimbursableExpenses: 'Este informe tiene un importe no válido',
        pendingConversionMessage: 'El total se actualizará cuando vuelvas a estar en línea',
        changedTheExpense: 'cambió el gasto',
        setTheRequest: (valueName: string, newValueToDisplay: string) => `el ${valueName} a ${newValueToDisplay}`,
        setTheDistanceMerchant: (translatedChangedField: string, newMerchant: string, newAmountToDisplay: string) =>
            `estableció ${translatedChangedField} en ${newMerchant}, lo que estableció el importe en ${newAmountToDisplay}`,
        removedTheRequest: (valueName: string, oldValueToDisplay: string) => `el/la ${valueName} (antes ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `el/la ${valueName} a ${newValueToDisplay} (antes ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `cambió ${translatedChangedField} a ${newMerchant} (antes ${oldMerchant}), lo que actualizó el importe a ${newAmountToDisplay} (antes ${oldAmountToDisplay})`,
        basedOnAI: 'según la actividad anterior',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `según las <a href="${rulesLink}">reglas del espacio de trabajo</a>` : 'según la regla del espacio de trabajo'),
        threadExpenseReportName: (formattedAmount: string, comment?: string) => `${formattedAmount} ${comment ? `para ${comment}` : 'gasto'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Informe de factura n.º ${linkedReportID}`,
        threadPaySomeoneReportName: (formattedAmount: string, comment?: string) => `${formattedAmount} enviado${comment ? `para ${comment}` : ''}`,
        movedFromPersonalSpace: ({reportName, workspaceName}: MovedFromPersonalSpaceParams) => `movió el gasto del espacio personal a ${workspaceName ?? `chatear con ${reportName}`}`,
        movedToPersonalSpace: 'movió el gasto al espacio personal',
        error: {
            invalidCategoryLength: 'El nombre de la categoría supera los 255 caracteres. Acórtalo o elige otra categoría.',
            invalidTagLength: 'El nombre de la etiqueta supera los 255 caracteres. Acórtalo o elige una etiqueta diferente.',
            invalidAmount: 'Introduce un importe válido antes de continuar',
            invalidDistance: 'Introduce una distancia válida antes de continuar',
            invalidReadings: 'Ingresa las lecturas inicial y final para continuar',
            negativeDistanceNotAllowed: 'La lectura final debe ser mayor que la lectura inicial',
            distanceAmountTooLarge: 'El importe total es demasiado alto. Reduce la distancia o baja la tarifa.',
            distanceAmountTooLargeReduceDistance: 'El importe total es demasiado grande. Reduce la distancia.',
            distanceAmountTooLargeReduceRate: 'El importe total es demasiado alto. Reduce la tarifa.',
            odometerReadingTooLarge: (formattedMax: string) => `Las lecturas del odómetro no pueden superar ${formattedMax}.`,
            stitchOdometerImagesFailed: 'No se pudieron combinar las imágenes del odómetro. Inténtalo de nuevo más tarde.',
            invalidIntegerAmount: 'Ingresa un monto en dólares enteros antes de continuar',
            invalidTaxAmount: (amount: string) => `El importe máximo de impuestos es ${amount}`,
            invalidSplit: 'La suma de las divisiones debe ser igual al importe total',
            invalidSplitParticipants: 'Introduce un monto mayor que cero para al menos dos participantes',
            invalidSplitYourself: 'Ingresa un monto distinto de cero para tu división',
            noParticipantSelected: 'Selecciona a una persona participante',
            other: 'Error inesperado. Inténtalo de nuevo más tarde.',
            genericCreateFailureMessage: 'Error inesperado al enviar este gasto. Inténtalo de nuevo más tarde.',
            genericCreateInvoiceFailureMessage: 'Error inesperado al enviar esta factura. Inténtalo de nuevo más tarde.',
            genericHoldExpenseFailureMessage: 'Error inesperado al retener este gasto. Inténtalo de nuevo más tarde.',
            genericUnholdExpenseFailureMessage: 'Error inesperado al quitar esta expensa de la retención. Inténtalo de nuevo más tarde.',
            receiptDeleteFailureError: 'Error inesperado al eliminar este recibo. Inténtalo de nuevo más tarde.',
            receiptFailureMessage:
                '<rbr>Se produjo un error al subir tu recibo. Por favor, <a href="download">guarda el recibo</a> y <a href="retry">vuelve a intentarlo</a> más tarde.</rbr>',
            receiptFailureMessageShort: 'Se produjo un error al subir tu recibo.',
            genericDeleteFailureMessage: 'Error inesperado al eliminar este gasto. Inténtalo de nuevo más tarde.',
            genericEditFailureMessage: 'Error inesperado al editar este gasto. Inténtalo de nuevo más tarde.',
            genericSmartscanFailureMessage: 'A la transacción le faltan campos',
            duplicateWaypointsErrorMessage: 'Elimina los puntos de ruta duplicados',
            atLeastTwoDifferentWaypoints: 'Introduce al menos dos direcciones diferentes',
            splitExpenseMultipleParticipantsErrorMessage: 'Un gasto no se puede dividir entre un espacio de trabajo y otras personas. Actualiza tu selección.',
            invalidMerchant: 'Introduce un comerciante válido',
            atLeastOneAttendee: 'Se debe seleccionar al menos una persona asistente',
            invalidQuantity: 'Ingresa una cantidad válida',
            quantityGreaterThanZero: 'La cantidad debe ser mayor que cero',
            invalidSubrateLength: 'Debe haber al menos una subtarifa',
            invalidRate: 'La tarifa no es válida para este espacio de trabajo. Selecciona una tarifa disponible del espacio de trabajo.',
            endDateBeforeStartDate: 'La fecha de finalización no puede ser anterior a la fecha de inicio',
            endDateSameAsStartDate: 'La fecha de finalización no puede ser igual a la fecha de inicio',
            manySplitsProvided: `El número máximo de divisiones permitidas es ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `El intervalo de fechas no puede superar los ${CONST.IOU.SPLITS_LIMIT} días.`,
        },
        dismissReceiptError: 'Descartar error',
        dismissReceiptErrorConfirmation: '¡Atención! Si descartas este error, se eliminará por completo tu recibo cargado. ¿Estás seguro?',
        waitingOnEnabledWallet: (submitterDisplayName: string) => `empezó a saldar la cuenta. El pago está en espera hasta que ${submitterDisplayName} habilite su monedero.`,
        enableWallet: 'Activar monedero',
        hold: 'Retener',
        unhold: 'Eliminar retención',
        holdExpense: () => ({
            one: 'Retener gasto',
            other: 'Retener gastos',
        }),
        unholdExpense: 'Liberar gasto',
        heldExpense: 'retuvo este gasto',
        unheldExpense: 'liberó este gasto',
        moveUnreportedExpense: 'Mover gasto no informado',
        addExistingExpense: 'Agregar gasto existente',
        selectExistingExpense: 'Selecciona al menos un gasto para añadir al informe.',
        emptyStateExistingExpenseTitle: 'No hay gastos existentes',
        emptyStateExistingExpenseSubtitle: 'Parece que no tienes gastos existentes. Prueba a crear uno a continuación.',
        addExistingExpenseConfirm: 'Agregar al informe',
        newReport: 'Informe nuevo',
        explainHold: () => ({
            one: 'Explica por qué estás reteniendo este gasto.',
            other: 'Explica por qué estás reteniendo estos gastos.',
        }),
        explainHoldApprover: () => ({
            one: 'Explica qué necesitas antes de aprobar este gasto.',
            other: 'Explica qué necesitas antes de aprobar estos gastos.',
        }),
        retracted: 'retirado',
        retract: 'Retraer',
        reopened: 'reabierto',
        reopenReport: 'Reabrir informe',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Este informe ya se exportó a ${connectionName}. Cambiarlo puede generar discrepancias en los datos. ¿Seguro que quieres reabrir este informe?`,
        reason: 'Motivo',
        holdReasonRequired: 'Se requiere un motivo al retener.',
        expenseWasPutOnHold: 'Gasto fue puesto en espera',
        expenseOnHold: 'Este gasto se ha puesto en espera. Revisa los comentarios para conocer los siguientes pasos.',
        expensesOnHold: 'Todos los gastos se pusieron en espera. Revisa los comentarios para conocer los siguientes pasos.',
        expenseDuplicate: 'Este gasto tiene detalles similares a otro. Revisa los duplicados para continuar.',
        someDuplicatesArePaid: 'Algunos de estos duplicados ya se han aprobado o pagado.',
        reviewDuplicates: 'Revisar duplicados',
        keepAll: 'Conservar todo',
        noDuplicatesTitle: '¡Todo listo!',
        noDuplicatesDescription: 'No hay transacciones duplicadas para revisar aquí.',
        confirmApprove: 'Confirmar monto de aprobación',
        confirmApprovalAmount: 'Aprueba solo los gastos conformes o aprueba el informe completo.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Este gasto está en espera. ¿Quieres aprobarlo de todos modos?',
            other: 'Estos gastos están en espera. ¿Quieres aprobarlos de todos modos?',
        }),
        confirmPay: 'Confirmar importe del pago',
        confirmPayAmount: 'Paga lo que no esté en retención o paga el informe completo.',
        confirmPayAllHoldAmount: () => ({
            one: 'Este gasto está en espera. ¿Quieres pagar de todos modos?',
            other: 'Estos gastos están en espera. ¿Quieres pagar de todos modos?',
        }),
        payOnly: 'Pagar solamente',
        approveOnly: 'Solo aprobar',
        holdEducationalTitle: '¿Deberías retener este gasto?',
        whatIsHoldExplain: 'Mantener es como presionar “pausa” en un gasto hasta que estés listo para enviarlo.',
        holdIsLeftBehind: 'Los gastos retenidos se dejan atrás incluso si envías un informe completo.',
        unholdWhenReady: 'Quita la retención de los gastos cuando estés listo para enviarlos.',
        changePolicyEducational: {
            title: '¡Moviste este informe!',
            description: 'Vuelve a comprobar estos elementos, que suelen cambiar al mover informes a un nuevo espacio de trabajo.',
            reCategorize: '<strong>Vuelve a categorizar los gastos necesarios</strong> para cumplir con las reglas del espacio de trabajo.',
            workflows: 'Este informe ahora podría estar sujeto a un <strong>flujo de aprobación</strong> diferente.',
        },
        changeWorkspace: 'Cambiar espacio de trabajo',
        set: 'establecer',
        changed: 'cambió',
        removed: 'eliminado',
        transactionPending: 'Transacción pendiente.',
        chooseARate: 'Selecciona una tarifa de reembolso del espacio de trabajo por milla o kilómetro',
        unapprove: 'Anular aprobación',
        unapproveReport: 'Desaprobar informe',
        headsUp: '¡Atención!',
        unapproveWithIntegrationWarning: (accountingIntegration: string) =>
            `Este informe ya se exportó a ${accountingIntegration}. Cambiarlo puede generar discrepancias en los datos. ¿Estás seguro de que quieres desaprobar este informe?`,
        reimbursable: 'reembolsable',
        nonReimbursable: 'no reembolsable',
        bookingPending: 'Esta reserva está pendiente',
        bookingPendingDescription: 'Esta reserva está pendiente porque aún no se ha pagado.',
        bookingArchived: 'Esta reserva está archivada',
        bookingArchivedDescription: 'Esta reserva está archivada porque la fecha del viaje ya pasó. Agrega un gasto por el importe final si es necesario.',
        attendees: 'Asistentes',
        totalPerAttendee: 'Por asistente',
        whoIsYourAccountant: '¿Quién es tu contador o contadora?',
        paymentComplete: 'Pago completado',
        time: 'Hora',
        startDate: 'Fecha de inicio',
        endDate: 'Fecha de finalización',
        startTime: 'Hora de inicio',
        endTime: 'Hora de finalización',
        deleteSubrate: 'Eliminar subtarifa',
        deleteSubrateConfirmation: '¿Seguro que quieres eliminar esta subtarifa?',
        quantity: 'Cantidad',
        subrateSelection: 'Selecciona una subtarifa e introduce una cantidad.',
        qty: 'Cant.',
        firstDayText: () => ({
            one: `Primer día: 1 hora`,
            other: (count: number) => `Primer día: ${count.toFixed(2)} horas`,
        }),
        lastDayText: () => ({
            one: `Último día: 1 hora`,
            other: (count: number) => `Último día: ${count.toFixed(2)} horas`,
        }),
        tripLengthText: () => ({
            one: `Viaje: 1 día completo`,
            other: (count: number) => `Viaje: ${count} días completos`,
        }),
        dates: 'Fechas',
        rates: 'Tarifas',
        submitsTo: (name: string) => `Envía a ${name}`,
        reject: {
            educationalTitle: '¿Deberías retener o rechazar?',
            educationalText: 'Si no estás listo para aprobar o pagar un gasto, puedes ponerlo en espera o rechazarlo.',
            holdExpenseTitle: 'Retén un gasto para pedir más detalles antes de aprobarlo o pagarlo.',
            approveExpenseTitle: 'Aprueba otros gastos mientras los gastos retenidos permanecen asignados a ti.',
            heldExpenseLeftBehindTitle: 'Los gastos retenidos se dejan fuera cuando apruebas un informe completo.',
            rejectExpenseTitle: 'Rechaza un gasto que no tengas intención de aprobar o pagar.',
            reasonPageTitle: 'Rechazar gasto',
            reasonPageDescription: 'Explique por qué no aprobará este gasto.',
            rejectReason: 'Motivo del rechazo',
            markAsResolved: 'Marcar como resuelto',
            rejectedStatus: 'Este gasto fue rechazado. Estamos esperando que corrijas los problemas y lo marques como resuelto para permitir el envío.',
            reportActions: {
                rejectedExpense: 'rechazó este gasto',
                markedAsResolved: 'marcó el motivo de rechazo como resuelto',
            },
        },
        rejectReport: {
            title: 'Rechazar informe',
            description: 'Explica por qué no aprobarás este informe:',
            rejectReason: 'Motivo del rechazo',
            selectTarget: 'Elige a la persona a la que se rechazará este informe para su revisión:',
            lastApprover: 'Última persona que aprueba',
            submitter: 'Remitente',
            rejectedReportMessage: 'Este informe fue rechazado.',
            rejectedNextStep: 'Se rechazó este informe. Esperamos a que soluciones los problemas y lo vuelvas a enviar manualmente.',
            selectMemberError: 'Selecciona a una persona a quien devolver este informe para rechazarlo.',
            couldNotReject: 'No se pudo rechazar el informe. Inténtalo de nuevo.',
        },
        moveExpenses: 'Mover al informe',
        moveExpensesError: 'No puedes mover los gastos de viáticos a informes de otros espacios de trabajo, porque las tarifas de viáticos pueden diferir entre espacios de trabajo.',
        changeApprover: {
            title: 'Cambiar aprobador',
            header: (workflowSettingLink: string) =>
                `Elige una opción para cambiar a la persona que aprueba este informe. (Actualiza la <a href="${workflowSettingLink}">configuración del espacio de trabajo</a> para cambiar esto de forma permanente para todos los informes).`,
            changedApproverMessage: (managerID: number) => `cambió la persona aprobadora a <mention-user accountID="${managerID}"/>`,
            reassignedApproverMessage: (managerID: number) => `reasignó la persona aprobadora a <mention-user accountID="${managerID}"/> mediante una actualización del flujo de trabajo`,
            actions: {
                addApprover: 'Agregar aprobador',
                addApproverSubtitle: 'Añade un aprobador adicional al flujo de aprobación existente.',
                bypassApprovers: 'Omitir aprobadores',
                bypassApproversSubtitle: 'Asígnate como aprobador final y omite a los aprobadores restantes.',
            },
            addApprover: {
                subtitle: 'Elige un aprobador adicional para este informe antes de que lo enviemos por el resto del flujo de aprobación.',
                bulkSubtitle: 'Elige un aprobador adicional para estos informes antes de que los enviemos al resto del flujo de aprobación.',
            },
            bulkSubtitle: 'Elige una opción para cambiar la persona que aprueba estos informes.',
        },
        chooseWorkspace: 'Elige un espacio de trabajo',
        routedDueToDEW: (to: string, reason?: string) => `informe enviado a ${to}${reason ? `porque ${reason}` : ''}`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'hora' : 'horas'} a ${rate} / hora`,
            hrs: 'h',
            hours: 'Horas',
            ratePreview: (rate: string) => `${rate} / hora`,
            amountTooLargeError: 'El importe total es demasiado alto. Reduce las horas o baja la tarifa.',
        },
        correctRateError: 'Corrige el error de tarifa e inténtalo de nuevo.',
        AskToExplain: `. <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}">Explicar<sparkles-icon/></a>`,
        rulesModifiedFields: {
            reimbursable: (value: boolean) => (value ? 'marcó el gasto como «reembolsable»' : 'marcó el gasto como “no reembolsable”'),
            billable: (value: boolean) => (value ? 'marcó el gasto como "facturable"' : 'marcó el gasto como «no facturable»'),
            tax: (value: string, isFirst: boolean) => (isFirst ? `establece la tasa de impuesto en «${value}»` : `tasa de impuesto a «${value}»`),
            reportName: (value: string) => `movió este gasto al informe «${value}»`,
            common: (key: keyof PolicyRulesModifiedFields | keyof PersonalRulesModifiedFields, value: string, isFirst: boolean) => {
                const field = translations.common[key].toLowerCase();
                return isFirst ? `establece ${field} en «${value}»` : `${field} a «${value}»`;
            },
            formatPersonalRules: (fragments: string, route: string) => `${fragments} mediante las <a href="${route}">reglas de gastos personales</a>`,
            formatPolicyRules: (fragments: string, route: string) => `${fragments} mediante las <a href="${route}">reglas del espacio de trabajo</a>`,
        },
        duplicateNonDefaultWorkspacePerDiemError: 'No puedes duplicar gastos de viáticos entre espacios de trabajo porque las tarifas pueden diferir entre ellos.',
        cannotDuplicateDistanceExpense: 'No puedes duplicar gastos de distancia entre espacios de trabajo porque las tarifas pueden diferir entre ellos.',
        bulkDuplicateLimit: `Puedes duplicar hasta ${CONST.SEARCH.BULK_DUPLICATE_LIMIT} gastos a la vez. Selecciona menos gastos e inténtalo de nuevo.`,
        taxDisabledAlert: {
            title: 'Impuesto deshabilitado',
            prompt: 'Activa el seguimiento de impuestos en el espacio de trabajo para editar los detalles del gasto o eliminar el impuesto de este gasto.',
            confirmText: 'Eliminar impuesto',
        },
    },
    transactionMerge: {
        listPage: {
            header: 'Combinar gastos',
            noEligibleExpenseFound: 'No se encontraron gastos aptos',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>No tienes ningún gasto que se pueda combinar con este. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Más información</a> sobre los gastos que cumplen los requisitos.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Selecciona un <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">gasto elegible</a> para combinarlo con <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: 'Seleccionar recibo',
            pageTitle: 'Selecciona el recibo que quieres conservar:',
        },
        detailsPage: {
            header: 'Selecciona detalles',
            pageTitle: 'Selecciona los detalles que quieres conservar:',
            noDifferences: 'No se encontraron diferencias entre las transacciones',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? 'un' : 'a';
                return `Selecciona ${article} ${field}`;
            },
            pleaseSelectAttendees: 'Selecciona asistentes',
            selectAllDetailsError: 'Selecciona todos los detalles antes de continuar.',
        },
        confirmationPage: {
            header: 'Confirmar detalles',
            pageTitle: 'Confirma los datos que quieres conservar. Los datos que no conserves se eliminarán.',
            confirmButton: 'Combinar gastos',
        },
    },
    share: {
        shareToExpensify: 'Compartir en Expensify',
        messageInputLabel: 'Mensaje',
    },
    notificationPreferencesPage: {
        header: 'Preferencias de notificaciones',
        label: 'Notificarme sobre nuevos mensajes',
        notificationPreferences: {
            always: 'Inmediatamente',
            daily: 'Diario',
            mute: 'Silenciar',
            hidden: 'Oculto',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'El número no se ha validado. Haz clic en el botón para reenviar el enlace de validación por mensaje de texto.',
        emailHasNotBeenValidated: 'El correo electrónico no se ha validado. Haz clic en el botón para reenviar el enlace de validación por mensaje de texto.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Subir foto',
        removePhoto: 'Eliminar foto',
        editImage: 'Editar foto',
        viewPhoto: 'Ver foto',
        imageUploadFailed: 'Error al subir la imagen',
        deleteWorkspaceError: 'Lo sentimos, hubo un problema inesperado al eliminar el avatar de tu espacio de trabajo',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `La imagen seleccionada supera el tamaño máximo de subida de ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Sube una imagen de más de ${minHeightInPx}x${minWidthInPx} píxeles y de menos de ${maxHeightInPx}x${maxWidthInPx} píxeles.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `La foto de perfil debe ser uno de los siguientes tipos: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: 'Editar foto de perfil',
        upload: 'Subir',
        uploadPhoto: 'Subir foto',
        selectAvatar: 'Seleccionar avatar',
        choosePresetAvatar: 'O elige un avatar personalizado',
    },
    modal: {
        backdropLabel: 'Fondo del modal',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que <strong>tú</strong> añadas gastos.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Esperando a que <strong>${actor}</strong> agregue gastos.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando a que una persona administradora añada gastos.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que <strong>tú</strong> envíes los gastos.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Esperando a que <strong>${actor}</strong> presente los gastos.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando a que una persona administradora envíe los gastos.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => `¡No se requiere ninguna acción adicional!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que <strong>tú</strong> agregues una cuenta bancaria.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Esperando a que <strong>${actor}</strong> agregue una cuenta bancaria.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando a que una persona administradora agregue una cuenta bancaria.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                eta?: string,
                etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `el ${eta} de cada mes` : ` ${eta}`;
                }
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que tus gastos se envíen automáticamente${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Esperando a que los gastos de <strong>${actor}</strong> se envíen automáticamente${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando que los gastos de una persona administradora se envíen automáticamente${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que <strong>tú</strong> soluciones los problemas.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Esperando a que <strong>${actor}</strong> solucione los problemas.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando a que una persona administradora solucione los problemas.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que <strong>tú</strong> apruebes los gastos.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Esperando a que <strong>${actor}</strong> apruebe los gastos.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando a que una persona administradora apruebe los gastos.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que <strong>tú</strong> exportes este informe.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Esperando a que <strong>${actor}</strong> exporte este informe.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando a que una persona administradora exporte este informe.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que <strong>tú</strong> pagues los gastos.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `En espera de que <strong>${actor}</strong> pague los gastos.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando a que un administrador pague los gastos.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que <strong>termines</strong> de configurar una cuenta bancaria empresarial.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Esperando a que <strong>${actor}</strong> termine de configurar una cuenta bancaria comercial.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando a que una persona administradora termine de configurar una cuenta bancaria de empresa.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                eta?: string,
                etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `para las ${eta}` : ` ${eta}`;
                }
                return `Esperando a que se complete el pago${formattedETA}.`;
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) =>
                `¡Ups! Parece que estás enviando este informe a <strong>ti mismo/a</strong>. Aprobar tus propios informes está <strong>prohibido</strong> por tu espacio de trabajo. Envía este informe a otra persona o contacta a tu administrador para cambiar la persona a la que envías.`,
            [CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Este informe fue rechazado. Estamos esperando a que <strong>tú</strong> soluciones los problemas y lo vuelvas a enviar manualmente.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Este informe fue rechazado. Esperando a que <strong>${actor}</strong> solucione los problemas y lo vuelva a enviar manualmente.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Este informe fue rechazado. Estamos esperando que una persona administradora solucione los problemas y lo vuelva a enviar manualmente.`;
                }
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'en breve',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'más tarde hoy',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'el domingo',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: 'el día 1 y el 16 de cada mes',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: 'el último día hábil del mes',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: 'el último día del mes',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: 'al final de tu viaje',
        },
    },
    profilePage: {
        profile: 'Perfil',
        preferredPronouns: 'Pronombres preferidos',
        selectYourPronouns: 'Selecciona tus pronombres',
        selfSelectYourPronoun: 'Elige tu pronombre',
        emailAddress: 'Dirección de correo electrónico',
        setMyTimezoneAutomatically: 'Configurar mi zona horaria automáticamente',
        timezone: 'Zona horaria',
        invalidFileMessage: 'Archivo no válido. Prueba con otra imagen.',
        avatarUploadFailureMessage: 'Se produjo un error al subir el avatar. Inténtalo de nuevo.',
        online: 'En línea',
        offline: 'Sin conexión',
        syncing: 'Sincronizando',
        profileAvatar: 'Avatar de perfil',
        publicSection: {
            title: 'Público',
            subtitle: 'Estos detalles se muestran en tu perfil público. Cualquier persona puede verlos.',
        },
        privateSection: {
            title: 'Privado',
            subtitle: 'Estos datos se usan para viajes y pagos. Nunca se mostrarán en tu perfil público.',
        },
    },
    securityPage: {
        title: 'Opciones de seguridad',
        subtitle: 'Activa la autenticación de dos factores para mantener tu cuenta segura.',
        goToSecurity: 'Volver a la página de seguridad',
    },
    shareCodePage: {
        title: 'Tu código',
        subtitle: 'Invita a personas a Expensify compartiendo tu código QR personal o tu enlace de referencia.',
    },
    pronounsPage: {
        pronouns: 'Pronombres',
        isShownOnProfile: 'Tus pronombres se muestran en tu perfil.',
        placeholderText: 'Busca para ver las opciones',
    },
    contacts: {
        contactMethods: 'Métodos de contacto',
        featureRequiresValidate: 'Esta función requiere que verifiques tu cuenta.',
        validateAccount: 'Verifica tu cuenta',
        helpText: ({email}: {email: string}) =>
            `Añade más formas de iniciar sesión y enviar recibos a Expensify.<br/><br/>Añade una dirección de correo electrónico para reenviar recibos a <a href="mailto:${email}">${email}</a> o añade un número de teléfono para enviar recibos por mensaje de texto al 47777 (solo números de EE. UU.).`,
        pleaseVerify: 'Verifica este método de contacto.',
        getInTouch: 'Usaremos este método para comunicarnos contigo.',
        enterMagicCode: (contactMethod: string) => `Introduce el código mágico enviado a ${contactMethod}. Debería llegar en uno o dos minutos.`,
        setAsDefault: 'Establecer como predeterminado',
        yourDefaultContactMethod:
            'Este es tu método de contacto predeterminado actual. Antes de poder eliminarlo, deberás elegir otro método de contacto y hacer clic en «Establecer como predeterminado».',
        yourDefaultContactMethodRestrictedSwitch: 'Este es tu método de contacto predeterminado actual. Tu empresa ha restringido eliminarlo o cambiarlo.',
        removeContactMethod: 'Eliminar método de contacto',
        removeAreYouSure: '¿Seguro que quieres eliminar este método de contacto? Esta acción no se puede deshacer.',
        failedNewContact: 'No se pudo agregar este método de contacto.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'No se pudo enviar un nuevo código mágico. Espera un momento e inténtalo de nuevo.',
            validateSecondaryLogin: 'Código mágico incorrecto o no válido. Vuelve a intentarlo o solicita un código nuevo.',
            deleteContactMethod: 'No se pudo eliminar el método de contacto. Comunícate con Concierge para obtener ayuda.',
            setDefaultContactMethod: 'No se pudo establecer un nuevo método de contacto predeterminado. Comunícate con Concierge para obtener ayuda.',
            addContactMethod: 'No se pudo agregar este método de contacto. Comunícate con Concierge para obtener ayuda.',
            enteredMethodIsAlreadySubmitted: 'Este método de contacto ya existe',
            passwordRequired: 'se requiere contraseña.',
            contactMethodRequired: 'El método de contacto es obligatorio',
            invalidContactMethod: 'Método de contacto no válido',
        },
        newContactMethod: 'Nuevo método de contacto',
        goBackContactMethods: 'Volver a los métodos de contacto',
    },
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Él / Lo / Su',
        heHimHisTheyThemTheirs: 'Él / Lo / Suyo / Elle / Le / Suyos',
        sheHerHers: 'Ella / La / Suya',
        sheHerHersTheyThemTheirs: 'Ella / La / Suya / Elle / Le / Suyes',
        merMers: 'Mercader / Mercaderes',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Por persona / Por personas',
        theyThemTheirs: 'Elle / Elle / Elles',
        thonThons: 'Ton / Tons',
        veVerVis: 'Visto / Vistos / Vistas',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Llámame por mi nombre',
    },
    displayNamePage: {
        headerTitle: 'Nombre visible',
        isShownOnProfile: 'Tu nombre para mostrar se muestra en tu perfil.',
    },
    timezonePage: {
        timezone: 'Zona horaria',
        isShownOnProfile: 'Tu zona horaria se muestra en tu perfil.',
        getLocationAutomatically: 'Determinar automáticamente tu ubicación',
    },
    updateRequiredView: {
        updateRequired: 'Actualización requerida',
        pleaseInstall: 'Actualiza a la última versión de New Expensify',
        pleaseInstallExpensifyClassic: 'Instala la última versión de Expensify',
        toGetLatestChanges: 'En móvil, descarga e instala la versión más reciente. En la web, actualiza tu navegador.',
        newAppNotAvailable: 'La aplicación New Expensify ya no está disponible.',
    },
    initialSettingsPage: {
        about: 'Acerca de',
        aboutPage: {
            description: 'La nueva app de Expensify está creada por una comunidad de desarrolladores de código abierto de todo el mundo. Ayúdanos a construir el futuro de Expensify.',
            appDownloadLinks: 'Enlaces de descarga de la aplicación',
            viewKeyboardShortcuts: 'Ver atajos de teclado',
            viewTheCode: 'Ver el código',
            viewOpenJobs: 'Ver trabajos abiertos',
            reportABug: 'Informar de un error',
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
            clearCacheAndRestart: 'Borrar caché y reiniciar',
            description:
                '<muted-text>Usa las herramientas de abajo para ayudarte a diagnosticar la experiencia en Expensify. Si encuentras algún problema, por favor <concierge-link>envía un informe de error</concierge-link>.</muted-text>',
            confirmResetDescription: 'Todos los borradores de mensajes sin enviar se perderán, pero el resto de tus datos está a salvo.',
            resetAndRefresh: 'Restablecer y actualizar',
            clientSideLogging: 'Registro del lado del cliente',
            noLogsToShare: 'No hay registros para compartir',
            useProfiling: 'Usar perfilado',
            profileTrace: 'Trazar perfil',
            results: 'Resultados',
            releaseOptions: 'Opciones de lanzamiento',
            testingPreferences: 'Preferencias de prueba',
            useStagingServer: 'Usar servidor de pruebas',
            forceOffline: 'Forzar modo sin conexión',
            simulatePoorConnection: 'Simular conexión a internet deficiente',
            simulateFailingNetworkRequests: 'Simular fallos en las solicitudes de red',
            authenticationStatus: 'Estado de autenticación',
            deviceCredentials: 'Credenciales del dispositivo',
            invalidate: 'Invalidar',
            destroy: 'Destruir',
            maskExportOnyxStateData: 'Enmascarar datos delicados de miembros al exportar el estado de Onyx',
            exportOnyxState: 'Exportar estado de Onyx',
            importOnyxState: 'Importar estado de Onyx',
            testCrash: 'Prueba de bloqueo',
            resetToOriginalState: 'Restablecer al estado original',
            usingImportedState: 'Estás usando un estado importado. Pulsa aquí para borrarlo.',
            debugMode: 'Modo de depuración',
            showBranchNameInTitle: 'Mostrar nombre de rama en el título del navegador',
            invalidFile: 'Archivo no válido',
            invalidFileDescription: 'El archivo que intentas importar no es válido. Inténtalo de nuevo.',
            invalidateWithDelay: 'Invalidar con retraso',
            leftHandNavCache: 'Caché de navegación izquierda',
            clearleftHandNavCache: 'Borrar',
            softKillTheApp: 'Cerrar la app suavemente',
            kill: 'Matar',
            sentryDebug: 'Depuración de Sentry',
            sentrySendDescription: 'Enviar datos a Sentry',
            sentryDebugDescription: 'Registrar solicitudes de Sentry en la consola',
            sentryHighlightedSpanOps: 'Nombres de intervalos resaltados',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interacción.clic, navegación, ui.carga',
        },
        security: 'Seguridad',
        signOut: 'Cerrar sesión',
        restoreStashed: 'Restaurar inicio de sesión almacenado',
        signOutConfirmationText: 'Perderás cualquier cambio sin conexión si cierras sesión.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `Lee los <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Términos del servicio</a> y la <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Política de privacidad</a>.`,
        help: 'Ayuda',
        helpPage: {
            title: '¿Tienes preguntas?',
            description: 'Estamos aquí para ayudarte, las 24 horas del día.',
            helpSite: 'Sitio de ayuda',
            conciergeChat: 'Concierge',
            conciergeChatDescription: 'Tu agente de IA personal',
            accountManagerDescription: 'Tu gestor de cuenta',
            partnerManagerDescription: 'Tu gestor de socios',
            guideDescription: 'Tu especialista de configuración',
        },
        whatIsNew: 'Novedades',
        accountSettings: 'Configuración de la cuenta',
        account: 'Cuenta',
        general: 'General',
    },
    closeAccountPage: {
        closeAccount: 'Cerrar cuenta',
        reasonForLeavingPrompt: '¡No nos gustaría verte irte! ¿Podrías decirnos por qué, para que podamos mejorar?',
        enterMessageHere: 'Ingresa el mensaje aquí',
        closeAccountWarning: 'Cerrar tu cuenta no se puede deshacer.',
        closeAccountPermanentlyDeleteData: '¿Seguro que quieres eliminar tu cuenta? Esto eliminará de forma permanente cualquier gasto pendiente.',
        enterDefaultContactToConfirm: 'Ingresa tu método de contacto predeterminado para confirmar que deseas cerrar tu cuenta. Tu método de contacto predeterminado es:',
        enterDefaultContact: 'Introduce tu método de contacto predeterminado',
        defaultContact: 'Método de contacto predeterminado:',
        enterYourDefaultContactMethod: 'Ingresa tu método de contacto predeterminado para cerrar tu cuenta.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Combinar cuentas',
        accountDetails: {
            accountToMergeInto: (login: string) => `Ingresa la cuenta que quieres fusionar con <strong>${login}</strong>.`,
            notReversibleConsent: 'Entiendo que esto no es reversible',
        },
        accountValidate: {
            confirmMerge: '¿Seguro que quieres fusionar las cuentas?',
            lossOfUnsubmittedData: (login: string) => `La fusión de tus cuentas es irreversible y provocará la pérdida de todos los gastos no enviados de <strong>${login}</strong>.`,
            enterMagicCode: (login: string) => `Para continuar, introduce el código mágico enviado a <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: 'Código mágico incorrecto o no válido. Vuelve a intentarlo o solicita un código nuevo.',
                fallback: 'Algo salió mal. Inténtalo de nuevo más tarde.',
            },
        },
        mergeSuccess: {
            accountsMerged: '¡Cuentas combinadas!',
            description: (from: string, to: string) =>
                `<muted-text><centered-text>Has fusionado correctamente todos los datos de <strong>${from}</strong> en <strong>${to}</strong>. De ahora en adelante, puedes usar cualquiera de los dos inicios de sesión para esta cuenta.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Estamos trabajando en ello',
            limitedSupport: 'Todavía no admitimos la fusión de cuentas en el Nuevo Expensify. Realiza esta acción en Expensify Classic.',
            reachOutForHelp: '<muted-text><centered-text>No dudes en <concierge-link>contactar a Concierge</concierge-link> si tienes alguna pregunta.</centered-text></muted-text>',
            goToExpensifyClassic: 'Ir a Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: (email: string) =>
            `<muted-text><centered-text>No puedes fusionar <strong>${email}</strong> porque está controlado por <strong>${email.split('@').at(1) ?? ''}</strong>. Por favor, <concierge-link>contacta a Concierge</concierge-link> para obtener ayuda.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: (email: string) =>
            `<muted-text><centered-text>No puedes fusionar <strong>${email}</strong> con otras cuentas porque la administración de tu dominio la ha establecido como tu inicio de sesión principal. En su lugar, fusiona otras cuentas con esta.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: (email: string) =>
                `<muted-text><centered-text>No puedes fusionar cuentas porque <strong>${email}</strong> tiene la autenticación en dos pasos (2FA) activada. Desactiva la 2FA para <strong>${email}</strong> e inténtalo de nuevo.</centered-text></muted-text>`,
            learnMore: 'Más información sobre cómo fusionar cuentas.',
        },
        mergeFailureAccountLockedDescription: (email: string) =>
            `<muted-text><centered-text>No puedes fusionar <strong>${email}</strong> porque está bloqueado. Por favor, <concierge-link>contacta a Concierge</concierge-link> para obtener ayuda.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: (email: string, contactMethodLink: string) =>
            `<muted-text><centered-text>No puedes fusionar cuentas porque <strong>${email}</strong> no tiene una cuenta de Expensify. En su lugar, <a href="${contactMethodLink}">añádela como método de contacto</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: (email: string) =>
            `<muted-text><centered-text>No puedes fusionar <strong>${email}</strong> con otras cuentas. En su lugar, fusiona otras cuentas con esta.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: (email: string) =>
            `<muted-text><centered-text>No puedes fusionar cuentas en <strong>${email}</strong> porque esta cuenta es propietaria de una relación de facturación con factura emitida.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Inténtalo de nuevo más tarde',
            description: 'Hubo demasiados intentos de fusionar cuentas. Inténtalo de nuevo más tarde.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'No puedes fusionar con otras cuentas porque no está validada. Valida la cuenta e inténtalo de nuevo.',
        },
        mergeFailureSelfMerge: {
            description: 'No puedes fusionar una cuenta consigo misma.',
        },
        mergeFailureGenericHeading: 'No se pueden fusionar las cuentas',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Informar actividad sospechosa',
        lockAccount: 'Bloquear cuenta',
        unlockAccount: 'Desbloquear cuenta',
        unlockTitle: 'Hemos recibido tu solicitud',
        unlockDescription: 'Revisaremos la cuenta para verificar que sea seguro desbloquearla y nos pondremos en contacto a través de Concierge si hay alguna pregunta.',
        compromisedDescription:
            '¿Notas algo inusual en tu cuenta? Informarlo bloqueará tu cuenta de inmediato, detendrá las nuevas transacciones con la Expensify Card y evitará cualquier cambio en la cuenta.',
        domainAdminsDescription: 'Para administradores de dominio: esto también detiene toda la actividad de Expensify Card y las acciones de administración en tus dominios.',
        areYouSure: '¿Estás seguro de que quieres bloquear tu cuenta de Expensify?',
        onceLocked: 'Una vez bloqueada, tu cuenta quedará restringida a la espera de una solicitud de desbloqueo y una revisión de seguridad',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Error al bloquear la cuenta',
        failedToLockAccountDescription: `No pudimos bloquear tu cuenta. Chatea con Concierge para resolver este problema.`,
        chatWithConcierge: 'Chatear con Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Cuenta bloqueada',
        yourAccountIsLocked: 'Tu cuenta está bloqueada',
        chatToConciergeToUnlock: 'Chatea con Concierge para resolver problemas de seguridad y desbloquear tu cuenta.',
        chatWithConcierge: 'Chatear con Concierge',
    },
    twoFactorAuth: {
        headerTitle: 'Autenticación de dos factores',
        twoFactorAuthEnabled: 'Autenticación en dos pasos activada',
        whatIsTwoFactorAuth:
            'La autenticación de dos factores (2FA) ayuda a mantener tu cuenta segura. Al iniciar sesión, tendrás que introducir un código generado por tu aplicación de autenticación preferida.',
        disableTwoFactorAuth: 'Desactivar la autenticación de dos factores',
        explainProcessToRemove: 'Para desactivar la autenticación en dos pasos (2FA), introduce un código válido de tu aplicación de autenticación.',
        explainProcessToRemoveWithRecovery: 'Para desactivar la autenticación de dos factores (2FA), introduce un código de recuperación válido.',
        disabled: 'La autenticación de dos factores ahora está desactivada',
        noAuthenticatorApp: 'Ya no necesitarás una app de autenticación para iniciar sesión en Expensify.',
        stepCodes: 'Códigos de recuperación',
        keepCodesSafe: '¡Mantén estos códigos de recuperación a salvo!',
        codesLoseAccess: dedent(`
            Si pierdes el acceso a tu aplicación de autenticación y no tienes estos códigos, perderás el acceso a tu cuenta.

            Nota: Configurar la autenticación en dos pasos cerrará tu sesión en todas las demás sesiones activas.
        `),
        errorStepCodes: 'Copia o descarga los códigos antes de continuar',
        stepVerify: 'Verificar',
        scanCode: 'Escanea el código QR usando tu',
        authenticatorApp: 'aplicación autenticadora',
        addKey: 'O agrega esta clave secreta a tu app de autenticación:',
        secretKey: 'clave secreta',
        enterCode: 'Luego ingresa el código de seis dígitos generado por tu aplicación de autenticación.',
        stepSuccess: 'Finalizado',
        enabled: 'Autenticación en dos pasos activada',
        congrats: '¡Felicidades! Ahora tienes esa seguridad adicional.',
        copy: 'Copiar',
        disable: 'Desactivar',
        enableTwoFactorAuth: 'Activar la autenticación de dos factores',
        pleaseEnableTwoFactorAuth: 'Activa la autenticación de dos factores.',
        twoFactorAuthIsRequiredDescription: 'Por motivos de seguridad, Xero requiere autenticación de dos factores para conectar la integración.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Se requiere autenticación de dos factores',
        twoFactorAuthIsRequiredForAdminsTitle: 'Habilita la autenticación de dos factores',
        twoFactorAuthIsRequiredXero: 'Tu conexión contable con Xero requiere autenticación de dos factores.',
        twoFactorAuthIsRequiredCompany: 'Tu empresa requiere autenticación en dos pasos.',
        twoFactorAuthCannotDisable: 'No se puede desactivar la autenticación en dos pasos',
        twoFactorAuthRequired: 'La autenticación de dos factores (2FA) es obligatoria para tu conexión con Xero y no se puede desactivar.',
        replaceDevice: 'Reemplazar dispositivo',
        replaceDeviceTitle: 'Reemplazar dispositivo de autenticación en dos pasos',
        verifyOldDeviceTitle: 'Verificar dispositivo antiguo',
        verifyOldDeviceDescription: 'Introduce el código de seis dígitos de tu aplicación de autenticación actual para confirmar que tienes acceso a ella.',
        verifyNewDeviceTitle: 'Configurar nuevo dispositivo',
        verifyNewDeviceDescription: 'Escanea el código QR con tu nuevo dispositivo y luego introduce el código para completar la configuración.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Ingresa tu código de recuperación',
            incorrectRecoveryCode: 'Código de recuperación incorrecto. Inténtalo de nuevo.',
        },
        useRecoveryCode: 'Usar código de recuperación',
        recoveryCode: 'Código de recuperación',
        use2fa: 'Usar código de autenticación de dos factores',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Introduce tu código de autenticación de dos factores',
            incorrect2fa: 'Código de autenticación de dos factores incorrecto. Inténtalo de nuevo.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: '¡Contraseña actualizada!',
        allSet: 'Todo listo. Mantén tu nueva contraseña segura.',
    },
    privateNotes: {
        title: 'Notas privadas',
        personalNoteMessage: 'Guarda notas sobre este chat aquí. Eres la única persona que puede agregar, editar o ver estas notas.',
        sharedNoteMessage: 'Guarda notas sobre este chat aquí. Las personas empleadas de Expensify y otros miembros del dominio team.expensify.com pueden ver estas notas.',
        composerLabel: 'Notas',
        myNote: 'Mi nota',
        error: {
            genericFailureMessage: 'No se pudieron guardar las notas privadas',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Introduce un código de seguridad válido',
        },
        securityCode: 'Código de seguridad',
        changeBillingCurrency: 'Cambiar moneda de facturación',
        changePaymentCurrency: 'Cambiar moneda de pago',
        paymentCurrency: 'Moneda de pago',
        paymentCurrencyDescription: 'Selecciona una moneda estandarizada a la que se deban convertir todos los gastos personales',
        note: `Nota: Cambiar tu moneda de pago puede afectar cuánto pagarás por Expensify. Consulta nuestra <a href="${CONST.PRICING}">página de precios</a> para ver todos los detalles.`,
    },
    addDebitCardPage: {
        addADebitCard: 'Agregar una tarjeta de débito',
        nameOnCard: 'Nombre en la tarjeta',
        debitCardNumber: 'Número de tarjeta de débito',
        expiration: 'Fecha de vencimiento',
        expirationDate: 'MMAA',
        cvv: 'CVV',
        billingAddress: 'Dirección de facturación',
        growlMessageOnSave: 'Tu tarjeta de débito se agregó correctamente',
        expensifyPassword: 'Contraseña de Expensify',
        error: {
            invalidName: 'El nombre solo puede incluir letras',
            addressZipCode: 'Introduce un código postal válido',
            debitCardNumber: 'Introduce un número de tarjeta de débito válido',
            expirationDate: 'Selecciona una fecha de vencimiento válida',
            securityCode: 'Introduce un código de seguridad válido',
            addressStreet: 'Introduce una dirección de facturación válida que no sea un apartado postal',
            addressState: 'Selecciona un estado',
            addressCity: 'Introduce una ciudad',
            genericFailureMessage: 'Se produjo un error al agregar tu tarjeta. Inténtalo de nuevo.',
            password: 'Introduce tu contraseña de Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Agregar tarjeta de pago',
        nameOnCard: 'Nombre en la tarjeta',
        paymentCardNumber: 'Número de tarjeta',
        expiration: 'Fecha de vencimiento',
        expirationDate: 'MM/AA',
        cvv: 'CVV',
        billingAddress: 'Dirección de facturación',
        growlMessageOnSave: 'Tu tarjeta de pago se agregó correctamente',
        expensifyPassword: 'Contraseña de Expensify',
        error: {
            invalidName: 'El nombre solo puede incluir letras',
            addressZipCode: 'Introduce un código postal válido',
            paymentCardNumber: 'Introduce un número de tarjeta válido',
            expirationDate: 'Selecciona una fecha de vencimiento válida',
            securityCode: 'Introduce un código de seguridad válido',
            addressStreet: 'Introduce una dirección de facturación válida que no sea un apartado postal',
            addressState: 'Selecciona un estado',
            addressCity: 'Introduce una ciudad',
            genericFailureMessage: 'Se produjo un error al agregar tu tarjeta. Inténtalo de nuevo.',
            password: 'Introduce tu contraseña de Expensify',
        },
    },
    personalCard: {
        addPersonalCard: 'Agregar tarjeta personal',
        addCompanyCard: 'Agregar tarjeta de empresa',
        lookingForCompanyCards: '¿Necesitas agregar tarjetas corporativas?',
        lookingForCompanyCardsDescription: 'Trae tus propias tarjetas de más de 10,000 bancos en todo el mundo.',
        personalCardAdded: '¡Tarjeta personal agregada!',
        personalCardAddedDescription: 'Felicidades, comenzaremos a importar las transacciones de tu tarjeta.',
        isPersonalCard: '¿Es esta una tarjeta personal?',
        thisIsPersonalCard: 'Es una tarjeta personal',
        thisIsCompanyCard: 'Esta es una tarjeta corporativa',
        askAdmin: 'Consulta a tu admin',
        warningDescription: ({isAdmin}: {isAdmin?: boolean}) =>
            `Si es así, ¡genial! Pero si es una tarjeta de <strong>empresa</strong>, por favor ${isAdmin ? 'asígnalo desde tu espacio de trabajo en su lugar.' : 'pídele a tu administrador que te lo asigne desde el espacio de trabajo.'}`,
        bankConnectionError: 'Problema de conexión bancaria',
        bankConnectionDescription: 'Vuelve a intentar agregar tus tarjetas. De lo contrario, puedes',
        connectWithPlaid: 'conectar mediante Plaid.',
        brokenConnection: 'La conexión de tu tarjeta está rota.',
        fixCard: 'Arreglar tarjeta',
        conciergeBrokenConnection: ({cardName, connectionLink}: ConciergeBrokenCardConnectionParams) =>
            connectionLink
                ? `La conexión de tu tarjeta ${cardName} está interrumpida. <a href="${connectionLink}">Inicia sesión en tu banco</a> para arreglarla.`
                : `La conexión de tu tarjeta ${cardName} está rota. Inicia sesión en tu banco para arreglarla.`,
        addAdditionalCards: 'Agregar tarjetas adicionales',
        upgradeDescription: '¿Necesitas agregar más tarjetas? Crea un espacio de trabajo para añadir tarjetas personales adicionales o asignar tarjetas de la empresa a todo el equipo.',
        onlyAvailableOnPlan: ({formattedPrice}: {formattedPrice: string}) =>
            `<muted-text>Esto está disponible en el plan Collect, que cuesta <strong>${formattedPrice}</strong> por miembro al mes.</muted-text>`,
        note: (subscriptionLink: string) =>
            `<muted-text>Crea un espacio de trabajo para acceder a esta función o <a href="${subscriptionLink}">obtén más información</a> sobre nuestros planes y precios.</muted-text>`,
        workspaceCreated: 'Espacio de trabajo creado',
        newWorkspace: '¡Creaste un espacio de trabajo!',
        successMessage: ({subscriptionLink}: {subscriptionLink: string}) =>
            `<centered-text>Ya puedes añadir tarjetas adicionales. <a href="${subscriptionLink}">Ver tu suscripción</a> para más detalles.</centered-text>`,
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Métodos de pago',
        setDefaultConfirmation: 'Establecer forma de pago predeterminada',
        setDefaultSuccess: '¡Método de pago predeterminado establecido!',
        deleteAccount: 'Eliminar cuenta',
        deleteConfirmation: '¿Seguro que quieres eliminar esta cuenta?',
        deleteCard: 'Eliminar tarjeta',
        deleteCardConfirmation:
            'Se eliminarán todas las transacciones de la tarjeta que no se hayan enviado, incluidas las de los informes abiertos. ¿Seguro que quieres eliminar esta tarjeta? No podrás deshacer esta acción.',
        error: {
            notOwnerOfBankAccount: 'Ocurrió un error al configurar esta cuenta bancaria como tu método de pago predeterminado',
            invalidBankAccount: 'Esta cuenta bancaria está suspendida temporalmente',
            notOwnerOfFund: 'Se produjo un error al establecer esta tarjeta como tu método de pago predeterminado',
            setDefaultFailure: 'Algo salió mal. Chatea con Concierge para obtener más ayuda.',
        },
        addBankAccountFailure: 'Se produjo un error inesperado al intentar agregar tu cuenta bancaria. Inténtalo de nuevo.',
        getPaidFaster: 'Cobra más rápido',
        addPaymentMethod: 'Agrega un método de pago para enviar y recibir pagos directamente en la app.',
        getPaidBackFaster: 'Recibe reembolsos más rápido',
        secureAccessToYourMoney: 'Accede de forma segura a tu dinero',
        receiveMoney: 'Recibe dinero en tu moneda local',
        expensifyWallet: 'Billetera de Expensify (Beta)',
        sendAndReceiveMoney: 'Envía y recibe dinero con amistades. Solo cuentas bancarias de EE. UU.',
        enableWallet: 'Activar monedero',
        addBankAccountToSendAndReceive: 'Agrega una cuenta bancaria para hacer o recibir pagos.',
        addDebitOrCreditCard: 'Agregar tarjeta de débito o crédito',
        cardInactive: 'Inactivo',
        assignedCards: 'Tarjetas asignadas',
        assignedCardsDescription: 'Las transacciones de estas tarjetas se sincronizan automáticamente.',
        expensifyCard: 'Tarjeta Expensify',
        walletActivationPending: 'Estamos revisando tu información. ¡Vuelve a consultar en unos minutos!',
        walletActivationFailed: 'Lamentablemente, tu monedero no se puede habilitar en este momento. Chatea con Concierge para obtener más ayuda.',
        addYourBankAccount: 'Agrega tu cuenta bancaria',
        addBankAccountBody: 'Conectemos tu cuenta bancaria a Expensify para que sea más fácil que nunca enviar y recibir pagos directamente en la aplicación.',
        chooseYourBankAccount: 'Elige tu cuenta bancaria',
        chooseAccountBody: 'Asegúrate de seleccionar el correcto.',
        confirmYourBankAccount: 'Confirma tu cuenta bancaria',
        personalBankAccounts: 'Cuentas bancarias personales',
        businessBankAccounts: 'Cuentas bancarias comerciales',
        shareBankAccount: 'Compartir cuenta bancaria',
        bankAccountShared: 'Cuenta bancaria compartida',
        shareBankAccountTitle: 'Selecciona las personas administradoras con las que compartir esta cuenta bancaria:',
        shareBankAccountSuccess: '¡Cuenta bancaria compartida!',
        shareBankAccountSuccessDescription: 'Los administradores seleccionados recibirán un mensaje de confirmación de Concierge.',
        shareBankAccountFailure: 'Se produjo un error inesperado al intentar compartir la cuenta bancaria. Inténtalo de nuevo.',
        shareBankAccountEmptyTitle: 'No hay administradores disponibles',
        shareBankAccountEmptyDescription: 'No hay administradores del espacio de trabajo con quienes puedas compartir esta cuenta bancaria.',
        shareBankAccountNoAdminsSelected: 'Selecciona una persona administradora antes de continuar',
        unshareBankAccount: 'Dejar de compartir cuenta bancaria',
        unshareBankAccountDescription:
            'Todas las personas a continuación tienen acceso a esta cuenta bancaria. Puedes quitar el acceso en cualquier momento. Aun así completaremos cualquier pago en proceso.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} perderá el acceso a esta cuenta bancaria de empresa. Aun así, completaremos cualquier pago en proceso.`,
        reachOutForHelp: 'Se está utilizando con la Tarjeta Expensify. <concierge-link>Contacta a Concierge</concierge-link> si necesitas dejar de compartirla.',
        unshareErrorModalTitle: `No se puede dejar de compartir la cuenta bancaria`,
        travelCVV: {
            title: 'CVV de viaje',
            subtitle: 'Usar esto al reservar viajes',
            description: 'Usa esta tarjeta para tus reservas con Expensify Travel. Aparecerá como “Tarjeta de viaje” al pagar.',
        },
        chaseAccountNumberDifferent: '¿Por qué mi número de cuenta es diferente?',
    },
    cardPage: {
        expensifyCard: 'Tarjeta Expensify',
        expensifyTravelCard: 'Tarjeta de viaje de Expensify',
        availableSpend: 'Límite restante',
        smartLimit: {
            name: 'Límite inteligente',
            title: (formattedLimit: string) => `Puedes gastar hasta ${formattedLimit} con esta tarjeta, y el límite se restablecerá a medida que se aprueben tus gastos enviados.`,
        },
        fixedLimit: {
            name: 'Límite fijo',
            title: (formattedLimit: string) => `Puedes gastar hasta ${formattedLimit} con esta tarjeta y luego se desactivará.`,
        },
        monthlyLimit: {
            name: 'Límite mensual',
            title: (formattedLimit: string) => `Puedes gastar hasta ${formattedLimit} con esta tarjeta por mes. El límite se restablecerá el día 1 de cada mes calendario.`,
        },
        virtualCardNumber: 'Número de tarjeta virtual',
        travelCardCvv: 'CVV de tarjeta de viaje',
        physicalCardNumber: 'Número de tarjeta física',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Obtener tarjeta física',
        reportFraud: 'Reportar fraude con tarjeta virtual',
        reportTravelFraud: 'Reportar fraude en la tarjeta de viaje',
        spendRules: 'Reglas de gasto',
        editSpendRules: 'Editar reglas de gasto',
        reviewTransaction: 'Revisar transacción',
        suspiciousBannerTitle: 'Transacción sospechosa',
        suspiciousBannerDescription: 'Detectamos transacciones sospechosas en tu tarjeta. Toca abajo para revisarlas.',
        cardLocked: 'Tu tarjeta está bloqueada temporalmente mientras nuestro equipo revisa la cuenta de tu empresa.',
        markTransactionsAsReimbursable: 'Marcar transacciones como reembolsables',
        markTransactionsDescription: 'Cuando está activada, las transacciones importadas de esta tarjeta se marcan como reembolsables de forma predeterminada.',
        csvCardDescription: 'Importar CSV',
        cardDetails: {
            cardNumber: 'Número de tarjeta virtual',
            expiration: 'Vencimiento',
            cvv: 'CVV',
            address: 'Dirección',
            revealDetails: 'Mostrar detalles',
            revealCvv: 'Mostrar CVV',
            copyCardNumber: 'Copiar número de tarjeta',
            updateAddress: 'Actualizar dirección',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Agregado a la Billetera de ${platform}`,
        cardDetailsLoadingFailure: 'Se produjo un error al cargar los detalles de la tarjeta. Verifica tu conexión a internet y vuelve a intentarlo.',
        validateCardTitle: 'Verifiquemos que seas tú',
        enterMagicCode: (contactMethod: string) => `Ingresa el código mágico enviado a ${contactMethod} para ver los detalles de tu tarjeta. Debería llegar en uno o dos minutos.`,
        unexpectedError: 'Se produjo un error al intentar obtener los detalles de tu tarjeta Expensify. Inténtalo de nuevo.',
        cardFraudAlert: {
            confirmButtonText: 'Sí, lo hago',
            reportFraudButtonText: 'No, no fui yo',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `eliminó la actividad sospechosa y reactivó la tarjeta x${cardLastFour}. ¡Todo listo para seguir registrando gastos!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `desactivó la tarjeta que termina en ${cardLastFour}`,
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
            }) => `se identificó actividad sospechosa en la tarjeta que termina en ${cardLastFour}. ¿Reconoces este cargo?

${amount} en ${merchant} - ${date}`,
        },
        setYourPin: 'Configura el PIN de tu tarjeta.',
        confirmYourPin: 'Introduce tu PIN de nuevo para confirmarlo.',
        changeYourPin: 'Ingresa un nuevo PIN para tu tarjeta.',
        confirmYourChangedPin: 'Confirma tu nuevo PIN.',
        pinMustBeFourDigits: 'El PIN debe tener exactamente 4 dígitos.',
        invalidPin: 'Elige un PIN más seguro.',
        pinMismatch: 'Los PIN no coinciden. Inténtalo de nuevo.',
        revealPin: 'Mostrar PIN',
        hidePin: 'Ocultar PIN',
        pin: 'PIN',
        pinChanged: '¡PIN cambiado!',
        pinChangedHeader: 'PIN cambiado',
        pinChangedDescription: 'Ya está todo listo para usar tu PIN ahora.',
        changePin: 'Cambiar PIN',
        changePinAtATM: 'Cambia tu PIN en cualquier cajero automático',
        changePinAtATMDescription: 'Esto es obligatorio en tu región. <concierge-link>Contacta a Concierge</concierge-link> si tienes alguna pregunta.',
        freezeCard: 'Congelar tarjeta',
        unfreeze: 'Descongelar',
        unfreezeCard: 'Descongelar tarjeta',
        askToUnfreeze: 'Pedir desbloqueo',
        freezeDescription: 'Una tarjeta congelada no se puede usar para compras ni transacciones. Puedes descongelarla en cualquier momento.',
        unfreezeDescription: 'Al descongelar esta tarjeta, se volverán a permitir compras y transacciones. Continúa solo si estás seguro de que es seguro usar la tarjeta.',
        frozen: 'Congelado',
        youFroze: ({date}: {date: string}) => `Congelaste esta tarjeta el ${date}.`,
        frozenBy: ({person, date}: {person: string; date: string}) => `${person} congeló esta tarjeta el ${date}.`,
        frozenByAdminPrefix: ({date}: {date: string}) => `Esta tarjeta fue congelada el ${date} por`,
        frozenByAdminNeedsUnfreezePrefix: 'Esta tarjeta fue congelada por',
        frozenByAdminNeedsUnfreezeSuffix: '. Comunícate con una persona administradora para descongelarlo.',
        frozenByAdminNeedsUnfreeze: ({person}: {person: string}) => `${person} bloqueó esta tarjeta. Ponte en contacto con una persona administradora para desbloquearla.`,
    },
    workflowsPage: {
        workflowTitle: 'Gasto',
        workflowDescription: 'Configura un flujo de trabajo desde el momento en que se genera el gasto, incluyendo la aprobación y el pago.',
        submissionFrequency: 'Envíos',
        submissionFrequencyDescription: 'Elige una frecuencia personalizada para enviar los gastos.',
        submissionFrequencyDateOfMonth: 'Fecha del mes',
        disableApprovalPromptDescription: 'Desactivar las aprobaciones eliminará todos los flujos de aprobación existentes.',
        addApprovalsTitle: 'Aprobaciones',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `gastos de ${members}, y la persona que aprueba es ${approvers}`,
        addApprovalButton: 'Agregar flujo de aprobación',
        findWorkflow: 'Buscar flujo de trabajo',
        addApprovalTip: 'Este flujo de trabajo predeterminado se aplica a todos los miembros, a menos que exista un flujo de trabajo más específico.',
        approver: 'Aprobador',
        addApprovalsDescription: 'Requerir una aprobación adicional antes de autorizar un pago.',
        makeOrTrackPaymentsTitle: 'Pagos',
        makeOrTrackPaymentsDescription: 'Agrega una persona autorizada para pagos realizados en Expensify o registra pagos realizados en otro lugar.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>Hay un flujo de aprobación personalizado habilitado en este espacio de trabajo. Para revisar o cambiar este flujo, comunícate con tu <account-manager-link>Account Manager</account-manager-link> o con <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Hay un flujo de aprobación personalizado habilitado en este espacio de trabajo. Para revisarlo o cambiarlo, comunícate con <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Elige cuánto tiempo debe esperar Expensify antes de compartir el gasto sin errores.',
        },
        frequencyDescription: 'Elige con qué frecuencia quieres que los gastos se envíen automáticamente, o hazlo manualmente',
        frequencies: {
            instant: 'Al instante',
            weekly: 'Semanal',
            monthly: 'Mensual',
            twiceAMonth: 'Dos veces al mes',
            byTrip: 'Por viaje',
            manually: 'Manualmente',
            daily: 'Diario',
            lastDayOfMonth: 'Último día del mes',
            lastBusinessDayOfMonth: 'Último día hábil del mes',
            ordinals: {
                one: 'er',
                two: 'º',
                few: 'rd',
                other: '.º',
                '1': 'Primero',
                '2': 'Segundo',
                '3': 'Tercero',
                '4': 'Cuarto',
                '5': 'Quinto',
                '6': 'Sexto',
                '7': 'Séptimo',
                '8': 'Octavo',
                '9': 'Noveno',
                '10': 'Décimo',
            },
        },
        approverInMultipleWorkflows: 'Este miembro ya pertenece a otro flujo de aprobación. Cualquier actualización aquí se reflejará allí también.',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> ya aprueba los informes de <strong>${name2}</strong>. Elige a otra persona aprobadora para evitar un flujo de trabajo circular.`,
        emptyContent: {
            title: 'No hay miembros para mostrar',
            expensesFromSubtitle: 'Todos los miembros del espacio de trabajo ya pertenecen a un flujo de aprobación existente.',
            approverSubtitle: 'Todas las personas aprobadoras pertenecen a un flujo de trabajo existente.',
            bulkApproverSubtitle: 'Ningún aprobador coincide con los criterios para los informes seleccionados.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'No se pudo cambiar la frecuencia de envío. Inténtalo de nuevo o contacta al soporte.',
        monthlyOffsetErrorMessage: 'No se pudo cambiar la frecuencia mensual. Inténtalo de nuevo o contacta al soporte.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Confirmar',
        header: 'Añade más aprobadores y confirma.',
        additionalApprover: 'Aprobador adicional',
        submitButton: 'Agregar flujo de trabajo',
    },
    workflowsEditApprovalsPage: {
        title: 'Editar flujo de aprobación',
        deleteTitle: 'Eliminar flujo de aprobación',
        deletePrompt: '¿Estás seguro de que quieres eliminar este flujo de aprobación? A partir de entonces, todas las personas miembros seguirán el flujo predeterminado.',
    },
    workflowsExpensesFromPage: {
        title: 'Gastos desde',
        header: 'Cuando las siguientes personas envían gastos:',
        memberAlreadyInWorkflowTitle: 'La persona ya está en un flujo de trabajo',
        memberAlreadyInWorkflowPrompt: ({memberName, approverName}: {memberName: string; approverName: string}) =>
            `${memberName} ya está en un flujo de aprobación que envía a ${approverName}. Agregarle aquí le moverá a este flujo de trabajo.`,
    },
    workflowsApproverPage: {
        genericErrorMessage: 'No se pudo cambiar a la persona aprobadora. Vuelve a intentarlo o contacta al soporte.',
        title: 'Establecer aprobador',
        description: 'Esta persona aprobará los gastos.',
    },
    workflowsApprovalLimitPage: {
        title: 'Aprobador',
        header: '(Opcional) ¿Quieres agregar un límite de aprobación?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `Agregar otra persona aprobadora cuando <strong>${approverName}</strong> sea quien aprueba y el informe exceda el importe indicado a continuación:`
                : 'Agregar otra persona aprobadora cuando un informe supere el monto indicado a continuación:`',
        reportAmountLabel: 'Importe del informe',
        additionalApproverLabel: 'Aprobador adicional',
        skip: 'Omitir',
        next: 'Siguiente',
        removeLimit: 'Quitar límite',
        enterAmountError: 'Ingresa un monto válido',
        enterApproverError: 'Es necesario un aprobador cuando estableces un límite de informe',
        enterBothError: 'Ingresa un importe de informe y un aprobador adicional',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `Los informes superiores a ${approvalLimit} se envían a ${approverName}`,
    },
    workflowsPayerPage: {
        title: 'Pagador autorizado',
        genericErrorMessage: 'No se pudo cambiar el pagador autorizado. Inténtalo de nuevo.',
        admins: 'Administradores',
        payer: 'Pagador',
        paymentAccount: 'Cuenta de pago',
        shareBankAccount: {
            shareTitle: '¿Compartir acceso a la cuenta bancaria?',
            shareDescription: ({admin}: {admin: string}) => `Deberás compartir el acceso a la cuenta bancaria con ${admin} para convertirlo en el pagador.`,
            validationTitle: 'Cuenta bancaria en espera de validación',
            validationDescription: ({admin}: {admin: string}) =>
                `Debes <a href="#">validar esta cuenta bancaria</a>. Una vez hecho esto, podrás compartir el acceso a la cuenta bancaria con ${admin} para convertirle en la persona que realiza los pagos.`,
            errorTitle: 'No se puede cambiar el pagador',
            errorDescription: ({admin, owner}: {admin: string; owner: string}) =>
                `${admin} no tiene acceso a esta cuenta bancaria, así que no puedes convertirle en la persona que paga. <a href="#">Chatea con ${owner}</a> si la cuenta bancaria debe compartirse.`,
        },
    },
    reportFraudPage: {
        title: 'Reportar fraude con tarjeta virtual',
        description:
            'Si los datos de tu tarjeta virtual han sido robados o comprometidos, desactivaremos permanentemente tu tarjeta actual y te proporcionaremos una nueva tarjeta virtual y un nuevo número.',
        deactivateCard: 'Desactivar tarjeta',
        reportVirtualCardFraud: 'Reportar fraude con tarjeta virtual',
    },
    reportFraudConfirmationPage: {
        title: 'Fraude con tarjeta reportado',
        description: 'Hemos desactivado permanentemente tu tarjeta actual. Cuando vuelvas a ver los detalles de tu tarjeta, tendrás disponible una nueva tarjeta virtual.',
        buttonText: '¡Entendido, gracias!',
    },
    activateCardPage: {
        activateCard: 'Activar tarjeta',
        pleaseEnterLastFour: 'Introduce los últimos cuatro dígitos de tu tarjeta.',
        activatePhysicalCard: 'Activar tarjeta física',
        error: {
            thatDidNotMatch: 'Eso no coincide con los últimos 4 dígitos de tu tarjeta. Intenta de nuevo.',
            throttled:
                'Has introducido incorrectamente los últimos 4 dígitos de tu Expensify Card demasiadas veces. Si estás seguro de que los números son correctos, ponte en contacto con Concierge para resolverlo. De lo contrario, inténtalo de nuevo más tarde.',
        },
    },
    getPhysicalCard: {
        header: 'Obtener tarjeta física',
        nameMessage: 'Escribe tu nombre y apellido, ya que se mostrará en tu tarjeta.',
        legalName: 'Nombre legal',
        legalFirstName: 'Nombre legal (nombre)',
        legalLastName: 'Apellido legal',
        phoneMessage: 'Introduce tu número de teléfono.',
        phoneNumber: 'Número de teléfono',
        address: 'Dirección',
        addressMessage: 'Ingresa tu dirección de envío.',
        streetAddress: 'Dirección postal',
        city: 'Ciudad',
        state: 'Estado',
        zipPostcode: 'Código postal',
        country: 'País',
        confirmMessage: 'Confirma tus datos a continuación.',
        estimatedDeliveryMessage: 'Tu tarjeta física llegará en 2-3 días hábiles.',
        next: 'Siguiente',
        getPhysicalCard: 'Obtener tarjeta física',
        shipCard: 'Enviar tarjeta',
    },
    transferAmountPage: {
        transfer: (amount: string) => `Transferir${amount ? ` ${amount}` : ''}`,
        instant: 'Instantáneo (Tarjeta de débito)',
        instantSummary: (rate: string, minAmount: string) => `${rate}% de comisión (mínimo ${minAmount})`,
        ach: 'De 1 a 3 días hábiles (cuenta bancaria)',
        achSummary: 'Sin comisión',
        whichAccount: '¿Qué cuenta?',
        fee: 'Tarifa',
        transferSuccess: '¡Transferencia exitosa!',
        transferDetailBankAccount: 'Tu dinero debería llegar en los próximos 1 a 3 días hábiles.',
        transferDetailDebitCard: 'Tu dinero debería llegar de inmediato.',
        failedTransfer: 'Tu saldo no está totalmente pagado. Transfiere a una cuenta bancaria.',
        notHereSubTitle: 'Transfiere tu saldo desde la página de billetera',
        goToWallet: 'Ir a Billetera',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Elegir cuenta',
    },
    paymentMethodList: {
        addPaymentMethod: 'Agregar método de pago',
        addNewDebitCard: 'Agregar nueva tarjeta de débito',
        addNewBankAccount: 'Agregar nueva cuenta bancaria',
        accountLastFour: 'Termina en',
        cardLastFour: 'Tarjeta terminada en',
        addFirstPaymentMethod: 'Agrega un método de pago para enviar y recibir pagos directamente en la app.',
        defaultPaymentMethod: 'Predeterminado',
        bankAccountLastFour: (lastFour: string) => `Cuenta bancaria • ${lastFour}`,
    },
    agentsPage: {
        title: 'Agentes',
        subtitle: 'Crea agentes para gestionar tu flujo de trabajo. Omite el trabajo manual y recupera horas en tu día.',
        newAgent: 'Nuevo agente',
        emptyAgents: {
            title: 'No se crearon agentes',
            subtitle: 'Deja de hacer cosas manualmente. Indica las instrucciones a un agente y ahórrate mucho tiempo.',
        },
    },
    expenseRulesPage: {
        title: 'Reglas de gastos',
        subtitle: 'Estas reglas se aplicarán a tus gastos.',
        findRule: 'Buscar regla',
        emptyRules: {
            title: 'No has creado ninguna regla',
            subtitle: 'Agrega una regla para automatizar la presentación de gastos.',
        },
        changes: {
            billableUpdate: (value: boolean) => `Actualizar gasto ${value ? 'facturable' : 'no facturable'}`,
            categoryUpdate: (value: string) => `Actualizar categoría a "${value}"`,
            commentUpdate: (value: string) => `Actualizar la descripción a "${value}"`,
            merchantUpdate: (value: string) => `Actualizar comerciante a «${value}»`,
            reimbursableUpdate: (value: boolean) => `Actualizar gasto ${value ? 'reembolsable' : 'no reembolsable'}`,
            tagUpdate: (value: string) => `Actualizar etiqueta a «${value}»`,
            taxUpdate: (value: string) => `Actualizar tasa de impuestos a «${value}»`,
            billable: (value: boolean) => `gasto ${value ? 'facturable' : 'no facturable'}`,
            category: (value: string) => `categoría a «${value}»`,
            comment: (value: string) => `descripción a "${value}"`,
            merchant: (value: string) => `comerciante a «${value}»`,
            reimbursable: (value: boolean) => `gasto ${value ? 'reembolsable' : 'no reembolsable'}`,
            tag: (value: string) => `etiquetar como "${value}"`,
            tax: (value: string) => `tasa de impuesto a «${value}»`,
            report: (value: string) => `agregar a un informe llamado «${value}»`,
        },
        newRule: 'Nueva regla',
        addRule: {
            title: 'Agregar regla',
            expenseContains: 'Si el gasto contiene:',
            applyUpdates: 'Luego aplica estas actualizaciones:',
            merchantHint: 'Escribe . para crear una regla que se aplique a todos los comercios',
            addToReport: 'Agregar a un informe llamado',
            createReport: 'Crear informe si es necesario',
            applyToExistingExpenses: 'Aplicar a los gastos coincidentes existentes',
            confirmError: 'Ingresa el comercio y aplica al menos una actualización',
            confirmErrorMerchant: 'Introduce el comercio',
            confirmErrorUpdate: 'Aplica al menos una actualización',
            saveRule: 'Guardar regla',
        },
        editRule: {
            title: 'Editar regla',
        },
        deleteRule: {
            deleteSingle: 'Eliminar regla',
            deleteMultiple: 'Eliminar reglas',
            deleteSinglePrompt: '¿Seguro que quieres eliminar esta regla?',
            deleteMultiplePrompt: '¿Seguro que quieres eliminar estas reglas?',
        },
    },
    preferencesPage: {
        appSection: {
            title: 'Preferencias de la aplicación',
        },
        testSection: {
            title: 'Preferencias de prueba',
            subtitle: 'Configuración para ayudar a depurar y probar la aplicación en el entorno de pruebas.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Recibe actualizaciones relevantes de funciones y noticias de Expensify',
        muteAllSounds: 'Silenciar todos los sonidos de Expensify',
    },
    priorityModePage: {
        priorityMode: 'Modo de prioridad',
        explainerText: 'Elige si quieres #centrarte solo en los chats no leídos y fijados, o mostrar todo, con los chats más recientes y fijados en la parte superior.',
        priorityModes: {
            default: {
                label: 'Más reciente',
                description: 'Mostrar todos los chats ordenados por más recientes',
            },
            gsd: {
                label: '#focus',
                description: 'Mostrar solo no leídos ordenados alfabéticamente',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: (policyName: string) => `en ${policyName}`,
        generatingPDF: 'Generar PDF',
        waitForPDF: 'Espera mientras generamos el PDF.',
        errorPDF: 'Se produjo un error al intentar generar tu PDF',
        successPDF: '¡Tu PDF se ha generado! Si no se descargó automáticamente, usa el botón de abajo.',
    },
    reportDescriptionPage: {
        roomDescription: 'Descripción de la sala',
        roomDescriptionOptional: 'Descripción de la sala (opcional)',
        explainerText: 'Establece una descripción personalizada para la sala.',
    },
    groupChat: {
        lastMemberTitle: '¡Atención!',
        lastMemberWarning: 'Como eres la última persona aquí, si te vas este chat quedará inaccesible para todos los miembros. ¿Seguro que quieres salir?',
        defaultReportName: (displayName: string) => `Chat grupal de ${displayName}`,
    },
    languagePage: {
        language: 'Idioma',
        aiGenerated: 'Las traducciones para este idioma se generan automáticamente y pueden contener errores.',
    },
    themePage: {
        theme: 'Tema',
        themes: {
            dark: {
                label: 'Oscuro',
            },
            light: {
                label: 'Claro',
            },
            system: {
                label: 'Usar configuración del dispositivo',
            },
        },
        highContrastMode: 'Modo de alto contraste',
        chooseThemeBelowOrSync: 'Elige un tema a continuación o sincroniza con la configuración de tu dispositivo.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>Al iniciar sesión, aceptas los <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Términos del servicio</a> y la <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacidad</a>.</muted-text-xs>`,
        license: `La transmisión de dinero es proporcionada por ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) de acuerdo con sus <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licencias</a>.`,
    },
    validateCodeForm: {
        magicCodeNotReceived: '¿No recibiste un código mágico?',
        enterAuthenticatorCode: 'Introduce tu código del autenticador',
        enterRecoveryCode: 'Ingresa tu código de recuperación',
        requiredWhen2FAEnabled: 'Obligatorio cuando la 2FA está activada',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Solicita un nuevo código en <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Solicitar un código nuevo',
        timeRemainingAnnouncement: ({timeRemaining}: {timeRemaining: number}) => `Tiempo restante: ${timeRemaining} ${timeRemaining === 1 ? 'segundo' : 'segundos'}`,
        timeExpiredAnnouncement: 'El tiempo ha expirado',
        error: {
            pleaseFillMagicCode: 'Introduce tu código mágico',
            incorrectMagicCode: 'Código mágico incorrecto o no válido. Vuelve a intentarlo o solicita un código nuevo.',
            pleaseFillTwoFactorAuth: 'Introduce tu código de autenticación de dos factores',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Completa todos los campos',
        pleaseFillPassword: 'Introduce tu contraseña',
        pleaseFillTwoFactorAuth: 'Introduce tu código de autenticación en dos pasos',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Ingresa tu código de autenticación de dos factores para continuar',
        forgot: '¿Olvidaste tu contraseña?',
        requiredWhen2FAEnabled: 'Obligatorio cuando la 2FA está activada',
        error: {
            incorrectPassword: 'Contraseña incorrecta. Inténtalo de nuevo.',
            incorrectLoginOrPassword: 'Usuario o contraseña incorrectos. Inténtalo de nuevo.',
            incorrect2fa: 'Código de autenticación de dos factores incorrecto. Inténtalo de nuevo.',
            twoFactorAuthenticationEnabled: 'Tienes la autenticación en dos pasos (2FA) activada en esta cuenta. Inicia sesión con tu correo electrónico o número de teléfono.',
            invalidLoginOrPassword: 'Usuario o contraseña no válidos. Inténtalo de nuevo o restablece tu contraseña.',
            unableToResetPassword:
                'No pudimos cambiar tu contraseña. Es probable que se deba a que el enlace para restablecer la contraseña en un correo electrónico antiguo ha caducado. Te hemos enviado un nuevo enlace para que puedas volver a intentarlo. Revisa tu bandeja de entrada y tu carpeta de correo no deseado; debería llegar en unos pocos minutos.',
            noAccess: 'No tienes acceso a esta aplicación. Agrega tu nombre de usuario de GitHub para obtener acceso.',
            accountLocked: 'Tu cuenta se ha bloqueado después de demasiados intentos fallidos. Vuelve a intentarlo después de 1 hora.',
            fallback: 'Algo salió mal. Inténtalo de nuevo más tarde.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Teléfono o correo electrónico',
        error: {
            invalidFormatEmailLogin: 'El correo electrónico ingresado no es válido. Corrige el formato e inténtalo de nuevo.',
        },
        cannotGetAccountDetails: 'No se pudieron obtener los detalles de la cuenta. Intenta iniciar sesión de nuevo.',
        loginForm: 'Formulario de inicio de sesión',
        notYou: (user: string) => `¿No eres ${user}?`,
    },
    onboarding: {
        welcome: '¡Bienvenido!',
        welcomeSignOffTitleManageTeam: 'Una vez que termines las tareas anteriores, podremos explorar más funciones como los flujos de aprobación y las reglas.',
        welcomeSignOffTitle: '¡Es un placer conocerte!',
        explanationModal: {
            title: 'Bienvenido a Expensify',
            description: 'Una sola app para gestionar tus gastos empresariales y personales a la velocidad del chat. Pruébala y cuéntanos qué te parece. ¡Y se vienen muchas más novedades!',
            secondaryDescription: 'Para volver a Expensify Classic, solo toca tu foto de perfil > Ir a Expensify Classic.',
        },
        getStarted: 'Comenzar',
        whatsYourName: '¿Cómo te llamas?',
        peopleYouMayKnow: '¡Personas que quizás conozcas ya están aquí! Verifica tu correo electrónico para unirte a ellas.',
        workspaceYouMayJoin: (domain: string, email: string) => `Alguien de ${domain} ya creó un espacio de trabajo. Ingresa el código mágico enviado a ${email}.`,
        joinAWorkspace: 'Unirse a un espacio de trabajo',
        listOfWorkspaces: 'Aquí tienes la lista de espacios de trabajo a los que puedes unirte. No te preocupes, siempre podrás unirte más adelante si lo prefieres.',
        skipForNow: 'Omitir por ahora',
        workspaceMemberList: (employeeCount: number, policyOwner: string) => `${employeeCount} miembro${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: '¿Dónde trabajas?',
        errorSelection: 'Selecciona una opción para continuar',
        purpose: {
            title: '¿Qué quieres hacer hoy?',
            errorContinue: 'Pulsa continuar para configurarte',
            errorBackButton: 'Responde las preguntas de configuración para empezar a usar la aplicación',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Recibir el reembolso de mi empleador',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Gestionar los gastos de mi equipo',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Controla y presupuesta gastos',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Chatea y divide gastos con amistades',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Otra cosa',
        },
        employees: {
            title: '¿Cuántas personas empleas?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_SMALL]: '1-4 empleados',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_MEDIUM]: '5-10 empleados',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 empleados',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 empleados',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 personas empleadas',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1.000 empleados',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Más de 1,000 empleados',
        },
        accounting: {
            title: '¿Usas algún software de contabilidad?',
            none: 'Ninguno',
        },
        interestedFeatures: {
            title: '¿En qué funciones estás interesado?',
            featuresAlreadyEnabled: 'Estas son nuestras funciones más populares:',
            featureYouMayBeInterestedIn: 'Habilitar funciones adicionales:',
        },
        error: {
            requiredFirstName: 'Introduce tu nombre de pila para continuar',
        },
        workEmail: {
            title: '¿Cuál es tu correo electrónico del trabajo?',
            subtitle: 'Expensify funciona mejor cuando conectas tu correo electrónico del trabajo.',
            explanationModal: {
                descriptionOne: 'Reenviar a receipts@expensify.com para escanear',
                descriptionTwo: 'Únete a tus colegas que ya usan Expensify',
                descriptionThree: 'Disfruta de una experiencia más personalizada',
            },
            addWorkEmail: 'Agregar correo del trabajo',
        },
        workEmailValidation: {
            title: 'Verifica tu correo de trabajo',
            magicCodeSent: (workEmail: string | undefined) => `Ingresa el código mágico enviado a ${workEmail}. Debería llegar en uno o dos minutos.`,
        },
        workEmailValidationError: {
            publicEmail: 'Introduce un correo laboral válido de un dominio privado, por ejemplo: mitch@company.com',
            sameAsSignupEmail: 'Ingresa un correo electrónico diferente al que usaste para registrarte',
            offline: 'No pudimos añadir tu correo de trabajo porque parece que estás sin conexión',
        },
        mergeBlockScreen: {
            title: 'No se pudo agregar el correo electrónico del trabajo',
            subtitle: (workEmail: string | undefined) => `No pudimos agregar ${workEmail}. Inténtalo de nuevo más tarde en Configuración o chatea con Concierge para recibir ayuda.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Haz una [prueba de manejo](${testDriveURL})`,
                description: ({testDriveURL}) => `[Haz un recorrido rápido por el producto](${testDriveURL}) para ver por qué Expensify es la forma más rápida de hacer tus gastos.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Haz una [prueba de manejo](${testDriveURL})`,
                description: ({testDriveURL}) => `Haz una [prueba de manejo](${testDriveURL}) con nosotros y obtén para tu equipo *3 meses gratis de Expensify.*`,
            },
            addExpenseApprovalsTask: {
                title: 'Agregar aprobaciones de gastos',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Agrega aprobaciones de gastos* para revisar los gastos de tu equipo y mantenerlos bajo control.

                        Así es como funciona:

                        1. Ve a *Espacios de trabajo*.
                        2. Selecciona tu espacio de trabajo.
                        3. Haz clic en *Más funciones*.
                        4. Activa *Flujos de trabajo*.
                        5. Ve a *Flujos de trabajo* en el editor del espacio de trabajo.
                        6. Activa *Aprobaciones*.
                        7. Se te establecerá como la persona que aprueba los gastos. Podrás cambiar esto a cualquier administrador una vez que invites a tu equipo.

                        [Llévame a más funciones](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Crear](${workspaceConfirmationLink}) un espacio de trabajo`,
                description: 'Crea un espacio de trabajo y configura los ajustes con la ayuda de tu especialista de implementación.',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Crea un [espacio de trabajo](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Crea un espacio de trabajo* para registrar gastos, escanear recibos, chatear y más.

                        1. Haz clic en *Espacios de trabajo* > *Nuevo espacio de trabajo*.

                        *¡Tu nuevo espacio de trabajo está listo!* [Échale un vistazo](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Configurar [categorías](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Configura categorías* para que tu equipo pueda codificar gastos y facilitar los reportes.

                        1. Haz clic en *Workspaces*.
                        2. Selecciona tu espacio de trabajo.
                        3. Haz clic en *Categories*.
                        4. Desactiva las categorías que no necesites.
                        5. Agrega tus propias categorías en la esquina superior derecha.

                        [Llévame a la configuración de categorías del espacio de trabajo](${workspaceCategoriesLink}).`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Enviar un gasto',
                description: dedent(`
                    *Presenta un gasto* introduciendo un importe o escaneando un recibo.

                    1. Haz clic en el botón *+*.
                    2. Elige *Crear gasto*.
                    3. Introduce un importe o escanea un recibo.
                    4. Añade el correo electrónico o número de teléfono de tu jefe.
                    5. Haz clic en *Crear*.

                    ¡Y listo!
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Enviar un gasto',
                description: dedent(`
                    *Presenta un gasto* ingresando un monto o escaneando un recibo.

                    1. Haz clic en el botón *+*.
                    2. Elige *Crear gasto*.
                    3. Ingresa un monto o escanea un recibo.
                    4. Confirma los detalles.
                    5. Haz clic en *Crear*.

                    ¡Y listo!
                `),
            },
            trackExpenseTask: {
                title: 'Registrar un gasto',
                description: dedent(`
                    *Registra un gasto* en cualquier moneda, tengas o no un recibo.

                    1. Haz clic en el botón *+*.
                    2. Elige *Crear gasto*.
                    3. Ingresa un importe o escanea un recibo.
                    4. Elige tu espacio *personal*.
                    5. Haz clic en *Crear*.

                    ¡Y listo! Sí, así de fácil.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Conectar${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'a'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'tu' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Conecta ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'tu' : 'a'} ${integrationName} para una codificación y sincronización automática de gastos que hará que el cierre de fin de mes sea muy sencillo.

                        1. Haz clic en *Espacios de trabajo*.
                        2. Selecciona tu espacio de trabajo.
                        3. Haz clic en *Contabilidad*.
                        4. Busca ${integrationName}.
                        5. Haz clic en *Conectar*.

                        [Llévame a contabilidad](${workspaceAccountingLink}).`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Conecta [tus tarjetas corporativas](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Conecta las tarjetas que ya tienes para importar transacciones automáticamente, conciliar recibos y realizar la reconciliación.

                        1. Haz clic en *Espacios de trabajo*.
                        2. Selecciona tu espacio de trabajo.
                        3. Haz clic en *Tarjetas de empresa*.
                        4. Sigue las indicaciones para conectar tus tarjetas.

                        [Llévame a tarjetas de empresa](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Invita a [tu equipo](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Invita a tu equipo* a Expensify para que puedan empezar a registrar gastos hoy.

                        1. Haz clic en *Espacios de trabajo*.
                        2. Selecciona tu espacio de trabajo.
                        3. Haz clic en *Miembros* > *Invitar miembro*.
                        4. Ingresa correos electrónicos o números de teléfono.
                        5. ¡Agrega un mensaje de invitación personalizado si quieres!

                        [Llévame a los miembros del espacio de trabajo](${workspaceMembersLink}).`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Configura [categorías](${workspaceCategoriesLink}) y [etiquetas](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Configura categorías y etiquetas* para que tu equipo pueda codificar gastos y facilitar los reportes.

                        Impórtalas automáticamente [conectando tu software de contabilidad](${workspaceAccountingLink}) o configúralas manualmente en la [configuración de tu espacio de trabajo](${workspaceCategoriesLink}).`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Configurar [etiquetas](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Usa etiquetas para agregar detalles adicionales a los gastos, como proyectos, clientes, ubicaciones y departamentos. Si necesitas varios niveles de etiquetas, puedes mejorar al plan Control.

                        1. Haz clic en *Workspaces*.
                        2. Selecciona tu workspace.
                        3. Haz clic en *More features*.
                        4. Activa *Tags*.
                        5. Ve a *Tags* en el editor del workspace.
                        6. Haz clic en *+ Add tag* para crear tus propias etiquetas.

                        [Llévame a more features](${workspaceMoreFeaturesLink}).`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Invita a tu [contador/a](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Invita a tu contador* a colaborar en tu espacio de trabajo y gestionar los gastos de tu negocio.

                        1. Haz clic en *Espacios de trabajo*.
                        2. Selecciona tu espacio de trabajo.
                        3. Haz clic en *Miembros*.
                        4. Haz clic en *Invitar miembro*.
                        5. Ingresa la dirección de correo electrónico de tu contador.

                        [Invita a tu contador ahora](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Iniciar un chat',
                description: dedent(`
                    *Inicia un chat* con cualquier persona usando su correo electrónico o número de teléfono.

                    1. Haz clic en el botón *+*.
                    2. Elige *Iniciar chat*.
                    3. Ingresa un correo electrónico o número de teléfono.

                    Si todavía no usan Expensify, se les invitará automáticamente.

                    Cada chat también se convertirá en un correo electrónico o mensaje de texto al que podrán responder directamente.
                `),
            },
            splitExpenseTask: {
                title: 'Dividir un gasto',
                description: dedent(`
                    *Divide gastos* con una o más personas.

                    1. Haz clic en el botón *+*.
                    2. Elige *Iniciar chat*.
                    3. Ingresa correos electrónicos o números de teléfono.
                    4. Haz clic en el botón gris *+* en el chat > *Dividir gasto*.
                    5. Crea el gasto seleccionando *Manual*, *Escanear* o *Distancia*.

                    Si quieres, añade más detalles o simplemente envíalo. ¡Vamos a conseguir que te reembolsen!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Revisa la [configuración de tu espacio de trabajo](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        Aquí se explica cómo revisar y actualizar la configuración de tu espacio de trabajo:
                        1. Haz clic en Espacios de trabajo.
                        2. Selecciona tu espacio de trabajo.
                        3. Revisa y actualiza tu configuración.
                        [Ve a tu espacio de trabajo.](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: 'Crea tu primer informe',
                description: dedent(`
                    Así es como crear un informe:

                    1. Haz clic en el botón *+*.
                    2. Elige *Crear informe*.
                    3. Haz clic en *Agregar gasto*.
                    4. Agrega tu primer gasto.

                    ¡Y listo!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Haz una [prueba de manejo](${testDriveURL})` : 'Haz una prueba'),
            embeddedDemoIframeTitle: 'Prueba de manejo',
            employeeFakeReceipt: {
                description: '¡Mi recibo de prueba de manejo!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Recibir el reembolso es tan fácil como enviar un mensaje. Repasemos lo básico.',
            onboardingPersonalSpendMessage: 'Así puedes controlar tus gastos en unos pocos clics.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # ¡Tu prueba gratuita ha comenzado! Vamos a configurarte.
                        👋 Hola, soy tu especialista de configuración de Expensify. Ya he creado un espacio de trabajo para ayudarte a gestionar los recibos y gastos de tu equipo. Para aprovechar al máximo tu prueba gratuita de 30 días, solo sigue los pasos de configuración restantes a continuación.
                    `)
                    : dedent(`
                        # ¡Tu prueba gratuita ha comenzado! Vamos a configurarte.
                        👋 Hola, soy tu especialista de configuración de Expensify. Ahora que has creado un espacio de trabajo, aprovecha al máximo tu prueba gratuita de 30 días siguiendo los pasos a continuación.
                    `),
            onboardingTrackWorkspaceMessage: 'Para aprovechar al máximo tu prueba gratuita de 30 días, sigue los pasos restantes a continuación:',
            onboardingChatSplitMessage: 'Dividir cuentas con amistades es tan fácil como enviar un mensaje. Así es cómo.',
            onboardingAdminMessage: 'Aprende a administrar el espacio de trabajo de tu equipo como administrador y a enviar tus propios gastos.',
            onboardingTestDriveReceiverMessage: '*¡Tienes 3 meses gratis! Comienza abajo.*',
        },
        workspace: {
            title: 'Mantente organizado con un espacio de trabajo',
            subtitle: 'Desbloquea potentes herramientas para simplificar la gestión de tus gastos, todo en un solo lugar. Con un espacio de trabajo, puedes:',
            explanationModal: {
                descriptionOne: 'Controla y organiza recibos',
                descriptionTwo: 'Clasificar y etiquetar gastos',
                descriptionThree: 'Crear y compartir informes',
            },
            price: (price?: string) => `Pruébalo gratis durante 30 días, luego actualiza por solo <strong>${price ?? '$5'}/usuario/mes</strong>.`,
            createWorkspace: 'Crear espacio de trabajo',
        },
        confirmWorkspace: {
            title: 'Confirmar espacio de trabajo',
            subtitle: 'Crea un espacio de trabajo para rastrear recibos, reembolsar gastos, gestionar viajes, crear informes y más, todo a la velocidad del chat.',
        },
        inviteMembers: {
            title: 'Invitar miembros',
            subtitle: 'Agrega a tu equipo o invita a tu contador o contadora. ¡Cuantas más personas, mejor!',
        },
    },
    featureTraining: {
        doNotShowAgain: 'No volver a mostrar esto',
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: 'El nombre no puede contener caracteres especiales',
            containsReservedWord: 'El nombre no puede contener las palabras Expensify o Concierge',
            hasInvalidCharacter: 'El nombre no puede contener una coma ni un punto y coma',
            requiredFirstName: 'El nombre no puede estar vacío',
        },
    },
    privatePersonalDetails: {
        enterLegalName: '¿Cuál es tu nombre legal?',
        enterDateOfBirth: '¿Cuál es tu fecha de nacimiento?',
        enterAddress: '¿Cuál es tu dirección?',
        enterPhoneNumber: '¿Cuál es tu número de teléfono?',
        personalDetails: 'Datos personales',
        privateDataMessage: 'Estos datos se usan para viajes y pagos. Nunca se mostrarán en tu perfil público.',
        legalName: 'Nombre legal',
        legalFirstName: 'Nombre legal (nombre)',
        legalLastName: 'Apellido legal',
        address: 'Dirección',
        error: {
            dateShouldBeBefore: (dateString: string) => `La fecha debe ser anterior a ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `La fecha debe ser posterior a ${dateString}`,
            hasInvalidCharacter: 'El nombre solo puede incluir caracteres latinos',
            cannotIncludeCommaOrSemicolon: 'El nombre no puede contener una coma ni un punto y coma',
            incorrectZipFormat: (zipFormat?: string) => `Formato de código postal incorrecto${zipFormat ? `Formato aceptable: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Asegúrate de que el número de teléfono sea válido (p. ej., ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Se ha reenviado el enlace',
        weSentYouMagicSignInLink: (login: string, loginType: string) => `He enviado un enlace mágico para iniciar sesión a ${login}. Por favor, revisa tu ${loginType} para iniciar sesión.`,
        resendLink: 'Reenviar enlace',
    },
    unlinkLoginForm: {
        toValidateLogin: (primaryLogin: string, secondaryLogin: string) =>
            `Para validar ${secondaryLogin}, vuelve a enviar el código mágico desde la configuración de cuenta de ${primaryLogin}.`,
        noLongerHaveAccess: (primaryLogin: string) => `Si ya no tienes acceso a ${primaryLogin}, desvincula tus cuentas.`,
        unlink: 'Desvincular',
        linkSent: '¡Enlace enviado!',
        successfullyUnlinkedLogin: '¡Se desvinculó correctamente el inicio de sesión secundario!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: (login: string) =>
            `Nuestro proveedor de correo electrónico ha suspendido temporalmente los correos a ${login} debido a problemas de entrega. Para desbloquear tu inicio de sesión, sigue estos pasos:`,
        confirmThat: (login: string) =>
            `<strong>Confirma que ${login} esté escrito correctamente y sea una dirección de correo electrónico real y entregable.</strong> Los alias de correo como "expenses@domain.com" deben tener acceso a su propia bandeja de entrada para que sean un inicio de sesión válido de Expensify.`,
        ensureYourEmailClient: `<strong>Asegúrate de que tu cliente de correo permita correos de expensify.com.</strong> Puedes encontrar instrucciones sobre cómo completar este paso <a href="${CONST.SET_NOTIFICATION_LINK}">aquí</a>, pero es posible que necesites que tu departamento de TI te ayude a configurar la configuración de tu correo electrónico.`,
        onceTheAbove: `Una vez que hayas completado los pasos anteriores, comunícate con <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> para desbloquear tu inicio de sesión.`,
    },
    openAppFailureModal: {
        title: 'Algo salió mal...',
        subtitle: `No hemos podido cargar todos tus datos. Hemos sido notificados y estamos investigando el problema. Si esto continúa, comunícate con`,
        refreshAndTryAgain: 'Actualiza y vuelve a intentarlo',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: (login: string) => `No hemos podido enviar mensajes SMS a ${login}, así que lo hemos suspendido temporalmente. Intenta validar tu número:`,
        validationSuccess: '¡Tu número ha sido validado! Haz clic abajo para enviar un nuevo código mágico de inicio de sesión.',
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
                return 'Espera un momento antes de intentarlo de nuevo.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? 'día' : 'días'}`);
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
            return `¡Espera un momento! Debes esperar ${timeText} antes de intentar validar tu número nuevamente.`;
        },
    },
    welcomeSignUpForm: {
        join: 'Unirse',
    },
    detailsPage: {
        localTime: 'Hora local',
    },
    newChatPage: {
        startGroup: 'Iniciar grupo',
        addToGroup: 'Agregar al grupo',
        addUserToGroup: (username: string) => `Añadir a ${username} al grupo`,
    },
    yearPickerPage: {
        year: 'Año',
        selectYear: 'Selecciona un año',
    },
    monthPickerPage: {
        month: 'Mes',
        selectMonth: 'Selecciona un mes',
    },
    focusModeUpdateModal: {
        title: '¡Bienvenido al modo #focus!',
        prompt: (priorityModePageUrl: string) =>
            `Mantente al tanto de todo viendo solo los chats no leídos o los que necesitan tu atención. No te preocupes, puedes cambiar esto en cualquier momento en la <a href="${priorityModePageUrl}">configuración</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'No se puede encontrar el chat que estás buscando.',
        getMeOutOfHere: 'Sácame de aquí',
        iouReportNotFound: 'No se pueden encontrar los detalles de pago que estás buscando.',
        notHere: 'Mmm... no está aquí',
        pageNotFound: 'Vaya, esta página no se puede encontrar',
        noAccess: 'Es posible que este chat o gasto se haya eliminado o que no tengas acceso a él.\n\nSi tienes alguna pregunta, comunícate con concierge@expensify.com',
        goBackHome: 'Volver a la página de inicio',
        commentYouLookingForCannotBeFound: 'No se puede encontrar el comentario que estás buscando.',
        goToChatInstead: 'Ve al chat en su lugar.',
        contactConcierge: 'Si tienes alguna pregunta, comunícate con concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ups... ${isBreakLine ? '\n' : ''}Algo salió mal`,
        subtitle: 'No se pudo completar tu solicitud. Inténtalo de nuevo más tarde.',
        wrongTypeSubtitle: 'Esa búsqueda no es válida. Intenta ajustar tus criterios de búsqueda.',
    },
    statusPage: {
        status: 'Estado',
        statusExplanation: 'Añade un emoji para que tus colegas y amistades tengan una forma fácil de saber qué está pasando. ¡También puedes añadir un mensaje opcionalmente!',
        today: 'Hoy',
        clearStatus: 'Borrar estado',
        save: 'Guardar',
        message: 'Mensaje',
        timePeriods: {
            never: 'Nunca',
            thirtyMinutes: '30 minutos',
            oneHour: '1 hora',
            afterToday: 'Hoy',
            afterWeek: 'Una semana',
            custom: 'Personalizado',
        },
        untilTomorrow: 'Hasta mañana',
        untilTime: (time: string) => `Hasta las ${time}`,
        date: 'Fecha',
        time: 'Hora',
        clearAfter: 'Borrar después',
        whenClearStatus: '¿Cuándo debemos borrar tu estado?',
        setVacationDelegate: `Configura una persona delegada de vacaciones para aprobar informes en tu nombre mientras estés fuera de la oficina.`,
        cannotSetVacationDelegate: `No puedes establecer un delegado de vacaciones porque actualmente eres el delegado de los siguientes miembros:`,
        addVacationDelegate: 'Agregar delegado de vacaciones',
        vacationDelegateError: 'Se produjo un error al actualizar tu delegado de vacaciones.',
        asVacationDelegate: (nameOrEmail: string) => `como representante de vacaciones de ${nameOrEmail}`,
        toAsVacationDelegate: (submittedToName: string, vacationDelegateName: string) => `a ${submittedToName} como delegado/a de vacaciones de ${vacationDelegateName}`,
        vacationDelegateWarning: (nameOrEmail: string) =>
            `Estás asignando a ${nameOrEmail} como tu delegado de vacaciones. Aún no está en todos tus espacios de trabajo. Si decides continuar, se enviará un correo electrónico a todas las personas administradoras de tus espacios de trabajo para que lo agreguen.`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `Paso ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Información bancaria',
        confirmBankInfo: 'Confirmar información bancaria',
        manuallyAdd: 'Añade tu cuenta bancaria manualmente',
        letsDoubleCheck: 'Verifiquemos que todo se vea bien.',
        accountEnding: 'Cuenta que termina en',
        thisBankAccount: 'Esta cuenta bancaria se usará para pagos empresariales en tu espacio de trabajo',
        accountNumber: 'Número de cuenta',
        routingNumber: 'Número de ruta',
        chooseAnAccountBelow: 'Elige una cuenta de abajo',
        addBankAccount: 'Agregar cuenta bancaria',
        chooseAnAccount: 'Elige una cuenta',
        connectOnlineWithPlaid: 'Inicia sesión en tu banco',
        connectManually: 'Conectar manualmente',
        desktopConnection: 'Nota: Para conectarte con Chase, Wells Fargo, Capital One o Bank of America, haz clic aquí para completar este proceso en un navegador.',
        yourDataIsSecure: 'Tus datos están seguros',
        toGetStarted: 'Agrega una cuenta bancaria para reembolsar gastos, emitir Tarjetas Expensify, cobrar pagos de facturas y pagar cuentas, todo desde un solo lugar.',
        plaidBodyCopy: 'Ofrece a tus empleados una manera más fácil de pagar —y que les reembolsen— los gastos de la empresa.',
        checkHelpLine: 'El número de ruta y el número de cuenta se pueden encontrar en un cheque de la cuenta.',
        bankAccountPurposeTitle: '¿Qué quieres hacer con tu cuenta bancaria?',
        getReimbursed: 'Obtén el reembolso',
        getReimbursedDescription: 'Por el empleador u otras personas',
        makePayments: 'Hacer pagos',
        makePaymentsDescription: 'Paga gastos o emite Tarjetas Expensify',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `Para conectar una cuenta bancaria, por favor <a href="${contactMethodRoute}">agrega un correo electrónico como tu inicio de sesión principal</a> e inténtalo de nuevo. Puedes agregar tu número de teléfono como inicio de sesión secundario.`,
        hasBeenThrottledError: 'Se produjo un error al agregar tu cuenta bancaria. Espera unos minutos y vuelve a intentarlo.',
        hasCurrencyError: (workspaceRoute: string) =>
            `¡Ups! Parece que la moneda de tu espacio de trabajo está configurada en una moneda diferente a USD. Para continuar, ve a <a href="${workspaceRoute}">la configuración de tu espacio de trabajo</a> para cambiarla a USD e inténtalo de nuevo.`,
        bbaAdded: '¡Cuenta bancaria comercial agregada!',
        bbaAddedDescription: 'Está listo para usarse para pagos.',
        lockedBankAccount: 'Cuenta bancaria bloqueada',
        unlockBankAccount: 'Desbloquear cuenta bancaria',
        youCantPayThis: `No puedes pagar este informe porque tienes una <a href="${CONST.UNLOCK_BANK_ACCOUNT_HELP_URL}">cuenta bancaria bloqueada</a>. Toca abajo y Concierge te ayudará con los siguientes pasos para desbloquearla.`,
        htmlUnlockMessage: (maskedAccountNumber: string) =>
            `<h1>Cuenta bancaria empresarial de Expensify ${maskedAccountNumber}</h1><p>Gracias por enviar una solicitud para desbloquear tu cuenta bancaria. Las solicitudes de retiro pueden rechazarse por fondos insuficientes o si la cuenta bancaria no ha sido habilitada para el débito directo. Revisaremos tu caso y nos pondremos en contacto contigo si necesitamos algo más para resolver este problema.</p>`,
        textUnlockMessage: (maskedAccountNumber: string) => `Cuenta bancaria empresarial de Expensify ${maskedAccountNumber}
Gracias por enviar una solicitud para desbloquear tu cuenta bancaria. Las solicitudes de retiro pueden rechazarse por fondos insuficientes o si la cuenta bancaria no se ha habilitado para el débito directo. Revisaremos tu caso y nos pondremos en contacto contigo si necesitamos algo más para resolver este problema.`,
        error: {
            youNeedToSelectAnOption: 'Selecciona una opción para continuar',
            noBankAccountAvailable: 'Lo sentimos, no hay ninguna cuenta bancaria disponible',
            noBankAccountSelected: 'Elige una cuenta',
            taxID: 'Ingresa un número de identificación fiscal válido',
            website: 'Introduce un sitio web válido',
            zipCode: `Introduce un código ZIP válido usando el formato: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Ingresa un número de teléfono válido',
            email: 'Introduce una dirección de correo electrónico válida',
            companyName: 'Introduce un nombre comercial válido',
            addressCity: 'Ingresa una ciudad válida',
            addressStreet: 'Introduce una dirección de calle válida',
            addressState: 'Selecciona un estado válido',
            incorporationDateFuture: 'La fecha de constitución no puede estar en el futuro',
            incorporationState: 'Selecciona un estado válido',
            industryCode: 'Introduce un código de clasificación de industria válido de seis dígitos',
            restrictedBusiness: 'Confirma que la empresa no está en la lista de negocios restringidos',
            routingNumber: 'Introduce un número de ruta válido',
            accountNumber: 'Introduce un número de cuenta válido',
            routingAndAccountNumberCannotBeSame: 'Los números de ruta y de cuenta no pueden coincidir',
            companyType: 'Selecciona un tipo de empresa válido',
            tooManyAttempts:
                'Debido a la gran cantidad de intentos de inicio de sesión, esta opción se ha deshabilitado durante 24 horas. Inténtalo de nuevo más tarde o introduce los datos manualmente.',
            address: 'Introduce una dirección válida',
            dob: 'Selecciona una fecha de nacimiento válida',
            age: 'Debe ser mayor de 18 años',
            ssnLast4: 'Introduce los últimos 4 dígitos válidos del SSN',
            firstName: 'Introduce un nombre de pila válido',
            lastName: 'Introduce un apellido válido',
            noDefaultDepositAccountOrDebitCardAvailable: 'Agrega una cuenta de depósito predeterminada o una tarjeta de débito',
            validationAmounts: 'Los importes de validación que ingresaste son incorrectos. Vuelve a comprobar tu estado de cuenta bancario e inténtalo de nuevo.',
            fullName: 'Ingresa un nombre completo válido',
            ownershipPercentage: 'Introduce un número de porcentaje válido',
            deletePaymentBankAccount:
                'Esta cuenta bancaria no se puede eliminar porque se utiliza para pagos de Expensify Card. Si aun así quieres eliminar esta cuenta, ponte en contacto con Concierge.',
            sameDepositAndWithdrawalAccount: 'Las cuentas de depósito y retiro son las mismas.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: '¿Dónde se encuentra tu cuenta bancaria?',
        accountDetailsStepHeader: '¿Cuáles son los detalles de tu cuenta?',
        accountTypeStepHeader: '¿Qué tipo de cuenta es esta?',
        bankInformationStepHeader: '¿Cuáles son los datos de tu banco?',
        accountHolderInformationStepHeader: '¿Cuáles son los datos de la persona titular de la cuenta?',
        howDoWeProtectYourData: '¿Cómo protegemos tus datos?',
        currencyHeader: '¿Cuál es la moneda de tu cuenta bancaria?',
        confirmationStepHeader: 'Revisa tu información.',
        confirmationStepSubHeader: 'Vuelve a comprobar los datos de abajo y marca la casilla de términos para confirmar.',
        toGetStarted: 'Agrega una cuenta bancaria personal para recibir reembolsos, pagar facturas o habilitar la Cartera de Expensify.',
        updatePersonalInfo: 'Actualizar cuenta bancaria',
        updatePersonalInfoFailure: 'No se puede actualizar la información de la cuenta bancaria. Inténtalo de nuevo más tarde.',
        updateSuccessTitle: '¡Cuenta bancaria actualizada!',
        updateSuccessHeader: 'Cuenta bancaria actualizada',
        updateSuccessMessage: 'Felicidades, tu cuenta bancaria está configurada y lista para recibir reembolsos.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Introduce la contraseña de Expensify',
        alreadyAdded: 'Esta cuenta ya ha sido agregada.',
        chooseAccountLabel: 'Cuenta',
        successTitle: '¡Cuenta bancaria personal agregada!',
        successMessage: 'Felicidades, tu cuenta bancaria está configurada y lista para recibir reembolsos.',
    },
    attachmentView: {
        unknownFilename: 'Nombre de archivo desconocido',
        passwordRequired: 'Introduce una contraseña',
        passwordIncorrect: 'Contraseña incorrecta. Inténtalo de nuevo.',
        failedToLoadPDF: 'No se pudo cargar el archivo PDF',
        pdfPasswordForm: {
            title: 'PDF protegido con contraseña',
            infoText: 'Este PDF está protegido con contraseña.',
            beforeLinkText: 'Por favor',
            linkText: 'introduce la contraseña',
            afterLinkText: 'para verlo.',
            formLabel: 'Ver PDF',
        },
        attachmentNotFound: 'Archivo adjunto no encontrado',
        retry: 'Reintentar',
    },
    messages: {
        errorMessageInvalidPhone: `Introduce un número de teléfono válido sin paréntesis ni guiones. Si estás fuera de EE. UU., incluye el código de tu país (p. ej., ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Correo electrónico no válido',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} ya es miembro de ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} ya es administrador/a de ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Al continuar con la solicitud para activar tu Billetera de Expensify, confirmas que has leído, comprendes y aceptas',
        facialScan: 'Política y Autorización de Escaneo Facial de Onfido',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Política y autorización de escaneo facial de Onfido</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Privacidad</a> y <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Términos del servicio</a>.</muted-text-micro>`,
        tryAgain: 'Inténtalo de nuevo',
        verifyIdentity: 'Verificar identidad',
        letsVerifyIdentity: 'Verifiquemos tu identidad',
        butFirst: `Pero antes, lo aburrido. Lee la letra pequeña en el siguiente paso y haz clic en «Aceptar» cuando estés listo.`,
        genericError: 'Se produjo un error al procesar este paso. Inténtalo de nuevo.',
        cameraPermissionsNotGranted: 'Habilitar acceso a la cámara',
        cameraRequestMessage: 'Necesitamos acceder a tu cámara para completar la verificación de la cuenta bancaria. Actívala en Configuración > New Expensify.',
        microphonePermissionsNotGranted: 'Habilitar acceso al micrófono',
        microphoneRequestMessage: 'Necesitamos acceder a tu micrófono para completar la verificación de la cuenta bancaria. Habilítalo en Configuración > New Expensify.',
        originalDocumentNeeded: 'Sube una imagen original de tu identificación en lugar de una captura de pantalla o una imagen escaneada.',
        documentNeedsBetterQuality:
            'Parece que tu identificación está dañada o le faltan elementos de seguridad. Sube una imagen original de una identificación sin daños que sea completamente visible.',
        imageNeedsBetterQuality: 'Hay un problema con la calidad de la imagen de tu identificación. Sube una nueva imagen donde se vea claramente toda tu identificación.',
        selfieIssue: 'Hay un problema con tu selfie/video. Sube un selfie/video en vivo.',
        selfieNotMatching: 'Tu selfie/video no coincide con tu identificación. Sube un nuevo selfie/video en el que tu rostro se vea claramente.',
        selfieNotLive: 'Tu selfie/video no parece ser una foto/video en vivo. Sube un selfie/video en vivo.',
    },
    additionalDetailsStep: {
        headerTitle: 'Detalles adicionales',
        helpText: 'Necesitamos confirmar la siguiente información antes de que puedas enviar y recibir dinero desde tu monedero.',
        helpTextIdologyQuestions: 'Necesitamos hacerte solo algunas preguntas más para terminar de verificar tu identidad.',
        helpLink: 'Más información sobre por qué necesitamos esto.',
        legalFirstNameLabel: 'Nombre legal (nombre)',
        legalMiddleNameLabel: 'Segundo nombre legal',
        legalLastNameLabel: 'Apellido legal',
        selectAnswer: 'Selecciona una respuesta para continuar',
        ssnFull9Error: 'Introduce un SSN válido de nueve dígitos',
        needSSNFull9: 'Tenemos problemas para verificar tu SSN. Ingresa los nueve dígitos completos de tu SSN.',
        weCouldNotVerify: 'No pudimos verificar',
        pleaseFixIt: 'Corrige esta información antes de continuar',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `No pudimos verificar tu identidad. Inténtalo de nuevo más tarde o comunícate con <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> si tienes alguna pregunta.`,
    },
    termsStep: {
        headerTitle: 'Términos y comisiones',
        headerTitleRefactor: 'Tarifas y condiciones',
        haveReadAndAgreePlain: 'He leído y acepto recibir divulgaciones electrónicas.',
        haveReadAndAgree: `He leído y acepto recibir <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">divulgaciones electrónicas</a>.`,
        agreeToThePlain: 'Acepto el acuerdo de Privacidad y Billetera.',
        agreeToThe: (walletAgreementUrl: string) =>
            `Acepto la <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Política de privacidad</a> y el <a href="${walletAgreementUrl}">Acuerdo de Wallet</a>.`,
        enablePayments: 'Habilitar pagos',
        monthlyFee: 'Cuota mensual',
        inactivity: 'Inactividad',
        noOverdraftOrCredit: 'Sin función de sobregiro/crédito.',
        electronicFundsWithdrawal: 'Retiro de fondos electrónicos',
        standard: 'Estándar',
        reviewTheFees: 'Echa un vistazo a algunas tarifas.',
        checkTheBoxes: 'Marca las casillas de abajo.',
        agreeToTerms: 'Acepta los términos y estarás listo para empezar.',
        shortTermsForm: {
            expensifyPaymentsAccount: (walletProgram: string) => `La Expensify Wallet es emitida por ${walletProgram}.`,
            perPurchase: 'Por compra',
            atmWithdrawal: 'Retiro en cajero automático',
            cashReload: 'Recarga en efectivo',
            inNetwork: 'dentro de la red',
            outOfNetwork: 'fuera de la red',
            atmBalanceInquiry: 'Consulta de saldo en cajero automático (dentro o fuera de la red)',
            customerService: 'Servicio de atención al cliente (automatizado o con agente en vivo)',
            inactivityAfterTwelveMonths: 'Inactividad (después de 12 meses sin transacciones)',
            weChargeOneFee: 'Cobramos 1 otro tipo de tarifa. Es:',
            fdicInsurance: 'Tus fondos son elegibles para el seguro de la FDIC.',
            generalInfo: `Para obtener información general sobre cuentas prepagadas, visita <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Para obtener detalles y condiciones de todas las comisiones y servicios, visita <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> o llama al +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Retiro electrónico de fondos (instantáneo)',
            electronicFundsInstantFeeMin: (amount: string) => `(mín ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Lista de todas las comisiones de Expensify Wallet',
            typeOfFeeHeader: 'Todas las tarifas',
            feeAmountHeader: 'Importe',
            moreDetailsHeader: 'Detalles',
            openingAccountTitle: 'Apertura de cuenta',
            openingAccountDetails: 'No hay ninguna comisión para abrir una cuenta.',
            monthlyFeeDetails: 'No hay comisión mensual.',
            customerServiceTitle: 'Servicio al cliente',
            customerServiceDetails: 'No hay cargos por servicio al cliente.',
            inactivityDetails: 'No hay comisión por inactividad.',
            sendingFundsTitle: 'Enviando fondos a otra persona titular de la cuenta',
            sendingFundsDetails: 'No hay comisión por enviar fondos a otra persona titular de cuenta usando tu saldo, cuenta bancaria o tarjeta de débito.',
            electronicFundsStandardDetails:
                'No se cobra ninguna comisión por transferir fondos de tu Billetera Expensify a tu cuenta bancaria usando la opción estándar. Esta transferencia suele completarse en un plazo de 1 a 3 días hábiles.',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                'Hay una comisión por transferir fondos desde tu Expensify Wallet a tu tarjeta de débito vinculada usando la opción de transferencia instantánea. Esta transferencia normalmente se completa en pocos minutos.' +
                `La comisión es del ${percentage}% del importe de la transferencia (con una comisión mínima de ${amount}).`,
            fdicInsuranceBancorp: (amount: string) =>
                `Tus fondos son elegibles para el seguro de la FDIC. Tus fondos se mantendrán o transferirán a ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, una institución asegurada por la FDIC.` +
                `Una vez allí, tus fondos están asegurados por la FDIC hasta ${amount} en caso de que falle ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, si se cumplen los requisitos específicos del seguro de depósito y tu tarjeta está registrada. Consulta ${CONST.TERMS.FDIC_PREPAID} para más detalles.`,
            contactExpensifyPayments: `Contacta a ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} llamando al +1 833-400-0904, por correo electrónico a ${CONST.EMAIL.CONCIERGE} o inicia sesión en ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Para obtener información general sobre cuentas prepago, visita ${CONST.TERMS.CFPB_PREPAID}. Si tienes una queja sobre una cuenta prepago, llama a la Oficina para la Protección Financiera del Consumidor al 1-855-411-2372 o visita ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Ver versión para imprimir',
            automated: 'Automatizado',
            liveAgent: 'Agente en vivo',
            instant: 'Instantáneo',
            electronicFundsInstantFeeMin: (amount: string) => `Mín. ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Habilitar pagos',
        activatedTitle: '¡Billetera activada!',
        activatedMessage: 'Enhorabuena, tu monedero está configurado y listo para hacer pagos.',
        checkBackLaterTitle: 'Solo un momento...',
        checkBackLaterMessage: 'Seguimos revisando tu información. Vuelve a consultar más tarde.',
        continueToPayment: 'Continuar al pago',
        continueToTransfer: 'Continuar con la transferencia',
    },
    companyStep: {
        headerTitle: 'Información de la empresa',
        subtitle: '¡Casi terminamos! Por motivos de seguridad, necesitamos confirmar algunos datos:',
        legalBusinessName: 'Nombre legal de la empresa',
        companyWebsite: 'Sitio web de la empresa',
        taxIDNumber: 'Número de identificación fiscal',
        taxIDNumberPlaceholder: '9 dígitos',
        companyType: 'Tipo de empresa',
        incorporationDate: 'Fecha de constitución',
        incorporationState: 'Estado de constitución',
        industryClassificationCode: 'Código de clasificación de la industria',
        confirmCompanyIsNot: 'Confirmo que esta empresa no está en la',
        listOfRestrictedBusinesses: 'lista de negocios restringidos',
        incorporationDatePlaceholder: 'Fecha de inicio (aaaa-mm-dd)',
        incorporationTypes: {
            LLC: 'SRL',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Colaboración',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Empresa unipersonal',
            OTHER: 'Otro',
        },
        industryClassification: '¿En qué sector está clasificada la empresa?',
        industryClassificationCodePlaceholder: 'Buscar código de clasificación de industria',
    },
    requestorStep: {
        headerTitle: 'Información personal',
        learnMore: 'Más información',
        isMyDataSafe: '¿Mis datos están seguros?',
    },
    personalInfoStep: {
        personalInfo: 'Información personal',
        enterYourLegalFirstAndLast: '¿Cuál es tu nombre legal?',
        legalFirstName: 'Nombre legal (nombre)',
        legalLastName: 'Apellido legal',
        legalName: 'Nombre legal',
        enterYourDateOfBirth: '¿Cuál es tu fecha de nacimiento?',
        enterTheLast4: '¿Cuáles son los últimos cuatro dígitos de tu número de Seguro Social?',
        dontWorry: 'No te preocupes, no hacemos ninguna verificación de crédito personal.',
        last4SSN: 'Últimos 4 del SSN',
        enterYourAddress: '¿Cuál es tu dirección?',
        address: 'Dirección',
        letsDoubleCheck: 'Verifiquemos que todo se vea bien.',
        byAddingThisBankAccount: 'Al agregar esta cuenta bancaria, confirmas que has leído, entiendes y aceptas',
        whatsYourLegalName: '¿Cuál es tu nombre legal?',
        whatsYourDOB: '¿Cuál es tu fecha de nacimiento?',
        whatsYourAddress: '¿Cuál es tu dirección?',
        whatsYourSSN: '¿Cuáles son los últimos cuatro dígitos de tu número de Seguro Social?',
        noPersonalChecks: 'No te preocupes, aquí no hacemos verificaciones de crédito personales.',
        whatsYourPhoneNumber: '¿Cuál es tu número de teléfono?',
        weNeedThisToVerify: 'Necesitamos esto para verificar tu billetera.',
    },
    businessInfoStep: {
        businessInfo: 'Información de la compañía',
        enterTheNameOfYourBusiness: '¿Cuál es el nombre de tu empresa?',
        businessName: 'Nombre legal de la empresa',
        enterYourCompanyTaxIdNumber: '¿Cuál es el número de identificación fiscal de tu empresa?',
        taxIDNumber: 'Número de identificación fiscal',
        taxIDNumberPlaceholder: '9 dígitos',
        enterYourCompanyWebsite: '¿Cuál es el sitio web de tu empresa?',
        companyWebsite: 'Sitio web de la empresa',
        enterYourCompanyPhoneNumber: '¿Cuál es el número de teléfono de tu empresa?',
        enterYourCompanyAddress: '¿Cuál es la dirección de tu empresa?',
        selectYourCompanyType: '¿Qué tipo de empresa es?',
        companyType: 'Tipo de empresa',
        incorporationType: {
            LLC: 'SRL',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Colaboración',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Empresa unipersonal',
            OTHER: 'Otro',
        },
        selectYourCompanyIncorporationDate: '¿Cuál es la fecha de constitución de tu empresa?',
        incorporationDate: 'Fecha de constitución',
        incorporationDatePlaceholder: 'Fecha de inicio (aaaa-mm-dd)',
        incorporationState: 'Estado de constitución',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '¿En qué estado se constituyó tu empresa?',
        letsDoubleCheck: 'Verifiquemos que todo se vea bien.',
        companyAddress: 'Dirección de la empresa',
        listOfRestrictedBusinesses: 'lista de negocios restringidos',
        confirmCompanyIsNot: 'Confirmo que esta empresa no está en la',
        businessInfoTitle: 'Información comercial',
        legalBusinessName: 'Nombre legal de la empresa',
        whatsTheBusinessName: '¿Cuál es el nombre de la empresa?',
        whatsTheBusinessAddress: '¿Cuál es la dirección comercial?',
        whatsTheBusinessContactInformation: '¿Cuál es la información de contacto comercial?',
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return '¿Cuál es el número de registro de la empresa (CRN)?';
                default:
                    return '¿Cuál es el número de registro comercial?';
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '¿Cuál es el Número de Identificación del Empleador (EIN)?';
                case CONST.COUNTRY.CA:
                    return '¿Qué es el número de empresa (BN)?';
                case CONST.COUNTRY.GB:
                    return '¿Cuál es el número de registro de IVA (VRN)?';
                case CONST.COUNTRY.AU:
                    return '¿Qué es el Australian Business Number (ABN)?';
                default:
                    return '¿Cuál es el número de IVA de la UE?';
            }
        },
        whatsThisNumber: '¿Qué es este número?',
        whereWasTheBusinessIncorporated: '¿Dónde se constituyó la empresa?',
        whatTypeOfBusinessIsIt: '¿Qué tipo de negocio es?',
        whatsTheBusinessAnnualPayment: '¿Cuál es el volumen anual de pagos de la empresa?',
        whatsYourExpectedAverageReimbursements: '¿Cuál es tu importe promedio de reembolso esperado?',
        registrationNumber: 'Número de registro',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'N.º de identificación del empleador (EIN)';
                case CONST.COUNTRY.CA:
                    return 'BN';
                case CONST.COUNTRY.GB:
                    return 'NIF del IVA';
                case CONST.COUNTRY.AU:
                    return 'ABN';
                default:
                    return 'IVA de la UE';
            }
        },
        businessAddress: 'Dirección comercial',
        businessType: 'Tipo de negocio',
        incorporation: 'Constitución',
        incorporationCountry: 'País de constitución',
        incorporationTypeName: 'Tipo de constitución',
        businessCategory: 'Categoría de negocio',
        annualPaymentVolume: 'Volumen anual de pagos',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `Volumen de pagos anual en ${currencyCode}`,
        averageReimbursementAmount: 'Importe promedio de reembolso',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `Importe promedio del reembolso en ${currencyCode}`,
        selectIncorporationType: 'Selecciona el tipo de constitución',
        selectBusinessCategory: 'Seleccionar categoría de negocio',
        selectAnnualPaymentVolume: 'Selecciona el volumen anual de pagos',
        selectIncorporationCountry: 'Selecciona el país de constitución',
        selectIncorporationState: 'Selecciona el estado de constitución',
        selectAverageReimbursement: 'Selecciona el importe promedio de reembolso',
        selectBusinessType: 'Selecciona el tipo de negocio',
        findIncorporationType: 'Buscar tipo de constitución',
        findBusinessCategory: 'Buscar categoría de negocio',
        findAnnualPaymentVolume: 'Encontrar el volumen anual de pagos',
        findIncorporationState: 'Buscar estado de constitución',
        findAverageReimbursement: 'Encontrar el importe promedio de reembolso',
        findBusinessType: 'Encontrar tipo de empresa',
        error: {
            registrationNumber: 'Proporciona un número de registro válido',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Proporciona un Número de Identificación del Empleador (EIN) válido';
                    case CONST.COUNTRY.CA:
                        return 'Proporciona un número de empresa (BN) válido';
                    case CONST.COUNTRY.GB:
                        return 'Proporciona un número de registro de IVA (VRN) válido';
                    case CONST.COUNTRY.AU:
                        return 'Proporciona un Número de Empresa Australiano (ABN) válido';
                    default:
                        return 'Proporciona un número de IVA de la UE válido';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `¿Posees el 25 % o más de ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `¿Hay personas que posean el 25% o más de ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `¿Hay más personas que poseen el 25 % o más de ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: 'La normativa nos exige verificar la identidad de cualquier persona que posea más del 25% del negocio.',
        companyOwner: 'Persona propietaria del negocio',
        enterLegalFirstAndLastName: '¿Cuál es el nombre legal de la persona propietaria?',
        legalFirstName: 'Nombre legal (nombre)',
        legalLastName: 'Apellido legal',
        enterTheDateOfBirthOfTheOwner: '¿Cuál es la fecha de nacimiento de la persona propietaria?',
        enterTheLast4: '¿Cuáles son los últimos 4 dígitos del número de Seguro Social de la persona propietaria?',
        last4SSN: 'Últimos 4 del SSN',
        dontWorry: 'No te preocupes, no hacemos ninguna verificación de crédito personal.',
        enterTheOwnersAddress: '¿Cuál es la dirección del propietario?',
        letsDoubleCheck: 'Verifiquemos que todo se vea bien.',
        legalName: 'Nombre legal',
        address: 'Dirección',
        byAddingThisBankAccount: 'Al agregar esta cuenta bancaria, confirmas que has leído, entiendes y aceptas',
        owners: 'Propietarios',
    },
    ownershipInfoStep: {
        ownerInfo: 'Información del propietario',
        businessOwner: 'Persona propietaria del negocio',
        signerInfo: 'Información de firmante',
        doYouOwn: (companyName: string) => `¿Posees el 25 % o más de ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `¿Hay personas que posean el 25% o más de ${companyName}?`,
        regulationsRequire: 'Las regulaciones nos exigen verificar la identidad de cualquier persona que posea más del 25% del negocio.',
        legalFirstName: 'Nombre legal (nombre)',
        legalLastName: 'Apellido legal',
        whatsTheOwnersName: '¿Cuál es el nombre legal de la persona propietaria?',
        whatsYourName: '¿Cuál es tu nombre legal?',
        whatPercentage: '¿Qué porcentaje del negocio pertenece a la persona propietaria?',
        whatsYoursPercentage: '¿Qué porcentaje del negocio posees?',
        ownership: 'Propiedad',
        whatsTheOwnersDOB: '¿Cuál es la fecha de nacimiento de la persona propietaria?',
        whatsYourDOB: '¿Cuál es tu fecha de nacimiento?',
        whatsTheOwnersAddress: '¿Cuál es la dirección del propietario?',
        whatsYourAddress: '¿Cuál es tu dirección?',
        whatAreTheLast: '¿Cuáles son los últimos 4 dígitos del número de Seguro Social de la persona propietaria?',
        whatsYourLast: '¿Cuáles son los últimos 4 dígitos de tu número de Seguro Social?',
        whatsYourNationality: '¿Cuál es tu país de ciudadanía?',
        whatsTheOwnersNationality: '¿Cuál es el país de ciudadanía de la persona propietaria?',
        countryOfCitizenship: 'País de ciudadanía',
        dontWorry: 'No te preocupes, no hacemos ninguna verificación de crédito personal.',
        last4: 'Últimos 4 del SSN',
        whyDoWeAsk: '¿Por qué pedimos esto?',
        letsDoubleCheck: 'Verifiquemos que todo se vea bien.',
        legalName: 'Nombre legal',
        ownershipPercentage: 'Porcentaje de propiedad',
        areThereOther: (companyName: string) => `¿Hay otras personas que sean propietarias del 25 % o más de ${companyName}?`,
        owners: 'Propietarios',
        addCertified: 'Añade un organigrama certificado que muestre a los beneficiarios finales',
        regulationRequiresChart:
            'La normativa exige que recopilemos una copia certificada del organigrama de propiedad que muestre a todas las personas o entidades que posean el 25% o más del negocio.',
        uploadEntity: 'Sube el organigrama de propiedad de la entidad',
        noteEntity: 'Nota: El diagrama de propiedad de la entidad debe estar firmado por tu contador, asesor legal o estar notariado.',
        certified: 'Organigrama certificado de propiedad de la entidad',
        selectCountry: 'Selecciona el país',
        findCountry: 'Encontrar país',
        address: 'Dirección',
        chooseFile: 'Elegir archivo',
        uploadDocuments: 'Subir documentación adicional',
        pleaseUpload: 'Sube documentación adicional a continuación para ayudarnos a verificar tu identidad como propietario directo o indirecto del 25% o más de la entidad comercial.',
        acceptedFiles: 'Formatos de archivo aceptados: PDF, PNG, JPEG. El tamaño total del archivo para cada sección no puede superar los 5 MB.',
        proofOfBeneficialOwner: 'Prueba de titular beneficiario',
        proofOfBeneficialOwnerDescription:
            'Proporcione una declaración firmada y un organigrama de un contador público, notario o abogado que verifique la propiedad del 25 % o más del negocio. Debe estar fechada dentro de los últimos tres meses e incluir el número de licencia de la persona firmante.',
        copyOfID: 'Copia de identificación de la persona beneficiaria',
        copyOfIDDescription: 'Ejemplos: pasaporte, licencia de conducir, etc.',
        proofOfAddress: 'Comprobante de domicilio del beneficiario real',
        proofOfAddressDescription: 'Ejemplos: factura de servicios, contrato de alquiler, etc.',
        codiceFiscale: 'Código fiscal/ID fiscal',
        codiceFiscaleDescription:
            'Sube un video de una visita al sitio o de una llamada grabada con la persona autorizada para firmar. La persona deberá proporcionar: nombre completo, fecha de nacimiento, razón social de la empresa, número de registro, número de código fiscal, domicilio social, actividad de la empresa y finalidad de la cuenta.',
    },
    completeVerificationStep: {
        completeVerification: 'Completar verificación',
        confirmAgreements: 'Confirma los acuerdos a continuación.',
        certifyTrueAndAccurate: 'Certifico que la información proporcionada es verdadera y exacta',
        certifyTrueAndAccurateError: 'Certifique que la información es verdadera y exacta',
        isAuthorizedToUseBankAccount: 'Estoy autorizado para usar esta cuenta bancaria empresarial para gastos del negocio',
        isAuthorizedToUseBankAccountError: 'Debes ser un directivo responsable con autorización para operar la cuenta bancaria de la empresa',
        termsAndConditions: 'términos y condiciones',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Valida tu cuenta bancaria',
        validateButtonText: 'Validar',
        validationInputLabel: 'Transacción',
        maxAttemptsReached: 'La validación de esta cuenta bancaria se ha desactivado debido a demasiados intentos incorrectos.',
        description: `En un plazo de 1 a 2 días hábiles, enviaremos tres (3) pequeñas transacciones a tu cuenta bancaria desde un nombre similar a "Expensify, Inc. Validation".`,
        descriptionCTA: 'Ingresa el monto de cada transacción en los campos de abajo. Ejemplo: 1.51.',
        letsChatText: '¡Ya casi terminamos! Necesitamos tu ayuda para verificar algunos últimos datos por chat. ¿Listo/a?',
        enable2FATitle: 'Evita el fraude, habilita la autenticación de dos factores (2FA)',
        enable2FAText: 'Nos tomamos tu seguridad en serio. Configura ahora la autenticación en dos pasos (2FA) para añadir una capa adicional de protección a tu cuenta.',
        secureYourAccount: 'Protege tu cuenta',
    },
    countryStep: {
        confirmBusinessBank: 'Confirma la divisa y el país de la cuenta bancaria empresarial',
        confirmCurrency: 'Confirma la moneda y el país',
        yourBusiness: 'La moneda de la cuenta bancaria de tu empresa debe coincidir con la moneda de tu espacio de trabajo.',
        youCanChange: 'Puedes cambiar la moneda de tu espacio de trabajo en tu',
        findCountry: 'Encontrar país',
        selectCountry: 'Selecciona el país',
        error: {
            connectToWorkspace: (workspaceRoute: string) =>
                `Conecta esta cuenta bancaria a un <a href="${workspaceRoute}">espacio de trabajo</a> para que puedas invitar a una persona administradora a iniciar sesión en un paso posterior.`,
        },
    },
    bankInfoStep: {
        whatAreYour: '¿Cuáles son los datos de tu cuenta bancaria comercial?',
        letsDoubleCheck: 'Verifiquemos que todo se vea bien.',
        thisBankAccount: 'Esta cuenta bancaria se usará para pagos empresariales en tu espacio de trabajo',
        accountNumber: 'Número de cuenta',
        accountHolderNameDescription: 'Nombre completo de la persona autorizada a firmar',
    },
    signerInfoStep: {
        signerInfo: 'Información de firmante',
        areYouDirector: (companyName: string) => `¿Eres director en ${companyName}?`,
        regulationRequiresUs: 'La normativa nos exige verificar si la persona firmante tiene la autoridad para realizar esta acción en nombre de la empresa.',
        whatsYourName: '¿Cuál es tu nombre legal?',
        fullName: 'Nombre legal completo',
        whatsYourJobTitle: '¿Cuál es tu cargo?',
        jobTitle: 'Cargo laboral',
        whatsYourDOB: '¿Cuál es tu fecha de nacimiento?',
        uploadID: 'Sube tu identificación y comprobante de domicilio',
        personalAddress: 'Comprobante de domicilio personal (p. ej., recibo de servicio público)',
        letsDoubleCheck: 'Verifiquemos que todo se vea bien.',
        legalName: 'Nombre legal',
        proofOf: 'Comprobante de domicilio personal',
        enterOneEmail: (companyName: string) => `Introduce el correo electrónico de una persona directiva de ${companyName}`,
        regulationRequiresOneMoreDirector: 'La normativa exige al menos otro director como firmante.',
        hangTight: 'Espera un momento...',
        enterTwoEmails: (companyName: string) => `Ingresa los correos electrónicos de dos directores de ${companyName}`,
        sendReminder: 'Enviar un recordatorio',
        chooseFile: 'Elegir archivo',
        weAreWaiting: 'Estamos esperando a que otras personas verifiquen su identidad como directores del negocio.',
        id: 'Copia de identificación',
        proofOfDirectors: 'Prueba de director(es)',
        proofOfDirectorsDescription: 'Ejemplos: perfil corporativo de Oncorp o registro comercial.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale para firmantes, usuarios autorizados y beneficiarios reales.',
        PDSandFSG: 'Documentación de divulgación PDS + FSG',
        PDSandFSGDescription: dedent(`
            Nuestra alianza con Corpay utiliza una conexión por API para aprovechar su amplia red de socios bancarios internacionales y así impulsar los Reembolsos Globales en Expensify. De acuerdo con la normativa australiana, te proporcionamos la Guía de Servicios Financieros (FSG, por sus siglas en inglés) y el Documento de Divulgación del Producto (PDS, por sus siglas en inglés) de Corpay.

            Lee atentamente los documentos FSG y PDS, ya que contienen información completa e importante sobre los productos y servicios que ofrece Corpay. Conserva estos documentos para futuras consultas.
        `),
        pleaseUpload: 'Carga documentación adicional a continuación para ayudarnos a verificar tu identidad como director o directora de la empresa.',
        enterSignerInfo: 'Ingresa la información del firmante',
        thisStep: 'Este paso se ha completado',
        isConnecting: (bankAccountLastFour: string | undefined, currency: string | undefined) =>
            `está conectando una cuenta bancaria empresarial en ${currency} que termina en ${bankAccountLastFour} a Expensify para pagar a las personas empleadas en ${currency}. El siguiente paso requiere la información de la persona firmante que es directora.`,
        error: {
            emailsMustBeDifferent: 'Los correos electrónicos deben ser diferentes',
            connectToWorkspace: (workspaceRoute: string) =>
                `Conecta esta cuenta bancaria a un <a href="${workspaceRoute}">espacio de trabajo</a> para invitar a una persona directora a firmar.`,
        },
    },
    agreementsStep: {
        agreements: 'Acuerdos',
        pleaseConfirm: 'Confirma los acuerdos a continuación',
        regulationRequiresUs: 'La normativa nos exige verificar la identidad de cualquier persona que posea más del 25% del negocio.',
        iAmAuthorized: 'Estoy autorizado para usar la cuenta bancaria de la empresa para gastos comerciales.',
        iCertify: 'Certifico que la información proporcionada es verdadera y exacta.',
        iAcceptTheTermsAndConditions: `Acepto los <a href="https://www.corpay.com/cross-border/terms">términos y condiciones</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Acepto los términos y condiciones.',
        accept: 'Aceptar y agregar cuenta bancaria',
        iConsentToThePrivacyNotice: 'Doy mi consentimiento al <a href="https://payments.corpay.com/compliance">aviso de privacidad</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Doy mi consentimiento al aviso de privacidad.',
        error: {
            authorized: 'Debes ser un directivo responsable con autorización para operar la cuenta bancaria de la empresa',
            certify: 'Certifique que la información es verdadera y exacta',
            consent: 'Por favor, acepta el aviso de privacidad',
        },
    },
    docusignStep: {
        subheader: 'Formulario de DocuSign',
        pleaseComplete:
            'Completa el formulario de autorización ACH con el enlace de Docusign que aparece a continuación y luego sube aquí la copia firmada para que podamos retirar fondos directamente de tu cuenta bancaria',
        pleaseCompleteTheBusinessAccount: 'Por favor completa la Solicitud de Cuenta Comercial para el Acuerdo de Débito Directo',
        pleaseCompleteTheDirect:
            'Completa el acuerdo de domiciliación bancaria usando el enlace de Docusign a continuación y luego sube aquí la copia firmada para que podamos retirar fondos directamente de tu cuenta bancaria.',
        takeMeTo: 'Llévame a Docusign',
        uploadAdditional: 'Subir documentación adicional',
        pleaseUpload: 'Carga el formulario DEFT y la página de firma de DocuSign',
        pleaseUploadTheDirect: 'Sube las disposiciones de domiciliación bancaria y la página de firma de DocuSign',
    },
    finishStep: {
        letsFinish: '¡Terminemos en el chat!',
        thanksFor:
            'Gracias por esos detalles. Un agente de soporte dedicado revisará ahora tu información. Nos volveremos a comunicar contigo si necesitamos algo más, pero mientras tanto, no dudes en contactarnos si tienes alguna pregunta.',
        iHaveA: 'Tengo una pregunta',
        enable2FA: 'Habilita la autenticación de dos factores (2FA) para evitar fraudes',
        weTake: 'Nos tomamos tu seguridad en serio. Configura ahora la autenticación en dos pasos (2FA) para añadir una capa adicional de protección a tu cuenta.',
        secure: 'Protege tu cuenta',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Un momento',
        explanationLine: 'Estamos revisando tu información. Podrás continuar con los siguientes pasos en breve.',
    },
    session: {
        offlineMessageRetry: 'Parece que estás sin conexión. Comprueba tu conexión e inténtalo de nuevo.',
    },
    travel: {
        header: 'Reservar viaje',
        title: 'Viaja inteligentemente',
        subtitle: 'Usa Expensify Travel para conseguir las mejores ofertas de viaje y administrar todos tus gastos de negocios en un solo lugar.',
        features: {
            saveMoney: 'Ahorra dinero en tus reservas',
            alerts: 'Recibe alertas en tiempo real si cambian tus planes de viaje',
        },
        bookTravel: 'Reservar viaje',
        bookDemo: 'Reservar demostración',
        bookADemo: 'Reserva una demostración',
        toLearnMore: 'para obtener más información.',
        termsAndConditions: {
            header: 'Antes de continuar...',
            title: 'Términos y condiciones',
            label: 'Acepto los términos y condiciones',
            subtitle: `Acepta los <a href="${CONST.TRAVEL_TERMS_URL}">términos y condiciones</a> de Expensify Travel.`,
            error: 'Debes aceptar los términos y condiciones de Expensify Travel para continuar',
            defaultWorkspaceError:
                'Debes establecer un espacio de trabajo predeterminado para habilitar Expensify Travel. Ve a Configuración > Espacios de trabajo > haz clic en los tres puntos verticales junto a un espacio de trabajo > Establecer como espacio de trabajo predeterminado y luego inténtalo de nuevo.',
        },
        flight: 'Vuelo',
        flightDetails: {
            passenger: 'Pasajero',
            layover: (layover: string) => `<muted-text-label>Tienes una <strong>escala de ${layover}</strong> antes de este vuelo</muted-text-label>`,
            takeOff: 'Despegue',
            landing: 'Inicio',
            seat: 'Asiento',
            class: 'Clase de cabina',
            recordLocator: 'Localizador de registro',
            cabinClasses: {
                unknown: 'Desconocido',
                economy: 'Económica',
                premiumEconomy: 'Clase turista premium',
                business: 'Negocio',
                first: 'Primero',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Invitado',
            checkIn: 'Registro de entrada',
            checkOut: 'Pago y salida',
            roomType: 'Tipo de habitación',
            cancellation: 'Política de cancelación',
            cancellationUntil: 'Cancelación gratuita hasta',
            confirmation: 'Número de confirmación',
            cancellationPolicies: {
                unknown: 'Desconocido',
                nonRefundable: 'No reembolsable',
                freeCancellationUntil: 'Cancelación gratuita hasta',
                partiallyRefundable: 'Parcialmente reembolsable',
            },
        },
        car: 'Auto',
        carDetails: {
            rentalCar: 'Alquiler de coche',
            pickUp: 'Recogida',
            dropOff: 'Entrega',
            driver: 'Conductor',
            carType: 'Tipo de coche',
            cancellation: 'Política de cancelación',
            cancellationUntil: 'Cancelación gratuita hasta',
            freeCancellation: 'Cancelación gratuita',
            confirmation: 'Número de confirmación',
        },
        train: 'Barandilla',
        trainDetails: {
            passenger: 'Pasajero',
            departs: 'Sale',
            arrives: 'Llega',
            coachNumber: 'Número de vagón',
            seat: 'Asiento',
            fareDetails: 'Detalles de la tarifa',
            confirmation: 'Número de confirmación',
        },
        viewTrip: 'Ver viaje',
        modifyTrip: 'Modificar viaje',
        tripSupport: 'Asistencia de viaje',
        tripDetails: 'Detalles del viaje',
        viewTripDetails: 'Ver detalles del viaje',
        trip: 'Viaje',
        trips: 'Viajes',
        tripSummary: 'Resumen del viaje',
        departs: 'Sale',
        errorMessage: 'Algo salió mal. Inténtalo de nuevo más tarde.',
        phoneError: (phoneErrorMethodsRoute: string) =>
            `<rbr>Por favor, <a href="${phoneErrorMethodsRoute}">agrega un correo de trabajo como tu inicio de sesión principal</a> para reservar viajes.</rbr>`,
        domainSelector: {
            title: 'Dominio',
            subtitle: 'Elige un dominio para la configuración de Expensify Travel.',
            recommended: 'Recomendado',
        },
        domainPermissionInfo: {
            title: 'Dominio',
            restriction: (domain: string) =>
                `No tienes permiso para habilitar Expensify Travel para el dominio <strong>${domain}</strong>. En su lugar, tendrás que pedirle a alguien de ese dominio que habilite los viajes.`,
            accountantInvitation: `Si eres contador, considera unirte al <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">programa para contadores ExpensifyApproved!</a> para habilitar los viajes en este dominio.`,
        },
        publicDomainError: {
            title: 'Empieza con Expensify Travel',
            message: `Deberás usar tu correo electrónico del trabajo (por ejemplo, nombre@empresa.com) con Expensify Travel, no tu correo personal (por ejemplo, nombre@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel se ha desactivado',
            message: `Tu administrador ha desactivado Expensify Travel. Sigue la política de reservas de tu empresa para organizar tus viajes.`,
        },
        verifyCompany: {
            title: 'Estamos revisando tu solicitud...',
            message: `Estamos realizando algunas comprobaciones de nuestro lado para verificar que tu cuenta esté lista para Expensify Travel. ¡Nos pondremos en contacto contigo en breve!`,
            confirmText: 'Entendido',
            conciergeMessage: ({domain}: {domain: string}) => `La habilitación de viajes falló para el dominio: ${domain}. Revisa y habilita los viajes para este dominio.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `Tu vuelo ${airlineCode} (${origin} → ${destination}) del ${startDate} ha sido reservado. Código de confirmación: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Tu billete para el vuelo ${airlineCode} (${origin} → ${destination}) del ${startDate} ha sido anulado.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Tu billete para el vuelo ${airlineCode} (${origin} → ${destination}) del ${startDate} ha sido reembolsado o cambiado.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Tu vuelo ${airlineCode} (${origin} → ${destination}) del ${startDate}} ha sido cancelado por la aerolínea.`,
            flightScheduleChangePending: (airlineCode: string) => `La aerolínea ha propuesto un cambio de horario para el vuelo ${airlineCode}; estamos a la espera de confirmación.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Cambio de horario confirmado: el vuelo ${airlineCode} ahora sale a las ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Tu vuelo ${airlineCode} (${origin} → ${destination}) del ${startDate} se ha actualizado.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `Tu clase de cabina se actualizó a ${cabinClass} en el vuelo ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `Tu asignación de asiento en el vuelo ${airlineCode} ha sido confirmada.`,
            flightSeatChanged: (airlineCode: string) => `Tu asignación de asiento en el vuelo ${airlineCode} ha sido cambiada.`,
            flightSeatCancelled: (airlineCode: string) => `Se ha eliminado tu asignación de asiento en el vuelo ${airlineCode}.`,
            paymentDeclined: 'El pago de tu reserva de vuelo ha fallado. Inténtalo de nuevo.',
            bookingCancelledByTraveler: (type: string, id = '') => `Cancelaste tu reserva de ${type} ${id}.`,
            bookingCancelledByVendor: (type: string, id = '') => `El proveedor canceló tu reserva de ${type} ${id}.`,
            bookingRebooked: (type: string, id = '') => `Tu reserva de ${type} se volvió a reservar. Nuevo número de confirmación: ${id}.`,
            bookingUpdated: (type: string) => `Tu reserva de ${type} se actualizó. Revisa los nuevos detalles en el itinerario.`,
            railTicketRefund: (origin: string, destination: string, startDate: string) =>
                `Tu billete de tren de ${origin} → ${destination} para el ${startDate} ha sido reembolsado. Se procesará un crédito.`,
            railTicketExchange: (origin: string, destination: string, startDate: string) => `Tu billete de tren para ${origin} → ${destination} el ${startDate} ha sido cambiado.`,
            railTicketUpdate: (origin: string, destination: string, startDate: string) => `Tu billete de tren de ${origin} → ${destination} para el ${startDate} se ha actualizado.`,
            defaultUpdate: (type: string) => `Tu reserva de ${type} se actualizó.`,
        },
        flightTo: 'Vuelo a',
        trainTo: 'Tren a',
        carRental: 'alquiler de coche',
        nightIn: 'noche en',
        nightsIn: 'noches en',
    },
    proactiveAppReview: {
        title: '¿Disfrutas de New Expensify?',
        description: 'Háznoslo saber para que podamos ayudarte a que tu experiencia con los gastos sea aún mejor.',
        positiveButton: '¡Sí!',
        negativeButton: 'La verdad es que no',
    },
    workspace: {
        common: {
            card: 'Tarjetas',
            expensifyCard: 'Tarjeta Expensify',
            companyCards: 'Tarjetas de empresa',
            personalCards: 'Tarjetas personales',
            workflows: 'Flujos de trabajo',
            workspace: 'Espacio de trabajo',
            findWorkspace: 'Buscar espacio de trabajo',
            edit: 'Editar espacio de trabajo',
            enabled: 'Activado',
            disabled: 'Desactivado',
            everyone: 'Todos',
            delete: 'Eliminar espacio de trabajo',
            settings: 'Configuración',
            categories: 'Categorías',
            tags: 'Etiquetas',
            customField1: 'Campo personalizado 1',
            customField2: 'Campo personalizado 2',
            customFieldHint: 'Agrega una codificación personalizada que se aplique a todos los gastos de este miembro.',
            reports: 'Informes',
            reportFields: 'Campos del informe',
            reportTitle: 'Título del informe',
            reportField: 'Campo de informe',
            taxes: 'Impuestos',
            bills: 'Facturas',
            invoices: 'Facturas',
            perDiem: 'Viáticos',
            travel: 'Viaje',
            members: 'Miembros',
            accounting: 'Contabilidad',
            hr: 'RR. HH.',
            receiptPartners: 'Socios de recibos',
            rules: 'Reglas',
            displayedAs: 'Se muestra como',
            plan: 'Plan',
            profile: 'Resumen',
            bankAccount: 'Cuenta bancaria',
            testTransactions: 'Transacciones de prueba',
            issueAndManageCards: 'Emitir y gestionar tarjetas',
            reconcileCards: 'Conciliar tarjetas',
            selectAll: 'Seleccionar todo',
            selected: () => ({
                one: '1 seleccionado',
                other: (count: number) => `${count} seleccionados`,
            }),
            settlementFrequency: 'Frecuencia de liquidación',
            setAsDefault: 'Establecer como espacio de trabajo predeterminado',
            defaultNote: `Los recibos enviados a ${CONST.EMAIL.RECEIPTS} aparecerán en este espacio de trabajo.`,
            deleteConfirmation: '¿Estás seguro de que quieres eliminar este espacio de trabajo?',
            deleteWithCardsConfirmation: '¿Estás seguro de que quieres eliminar este espacio de trabajo? Esto eliminará todos los feeds de tarjetas y las tarjetas asignadas.',
            deleteOpenExpensifyCardsError: 'Tu empresa todavía tiene Expensify Cards abiertas.',
            outstandingBalanceWarning:
                'Tienes un saldo pendiente que debe liquidarse antes de eliminar tu último espacio de trabajo. Ve a la configuración de tu suscripción para resolver el pago.',
            settleBalance: 'Ir a suscripción',
            unavailable: 'Espacio de trabajo no disponible',
            memberNotFound: 'No se encontró a la persona. Para invitar a una nueva persona al espacio de trabajo, usa el botón de invitación de arriba.',
            notAuthorized: `No tienes acceso a esta página. Si estás intentando unirte a este espacio de trabajo, solo pídele a la persona propietaria del espacio que te agregue como miembro. ¿Otra cosa? Comunícate con ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Ir al espacio de trabajo',
            duplicateWorkspace: 'Duplicar espacio de trabajo',
            duplicateWorkspacePrefix: 'Duplicar',
            goToWorkspaces: 'Ir a espacios de trabajo',
            clearFilter: 'Borrar filtro',
            workspaceName: 'Nombre del espacio de trabajo',
            workspaceOwner: 'Propietario',
            keepMeAsAdmin: 'Mantenerme como administrador',
            workspaceType: 'Tipo de espacio de trabajo',
            workspaceAvatar: 'Avatar del espacio de trabajo',
            clientID: 'ID de cliente',
            clientIDInputHint: 'Introduce el identificador único del cliente',
            mustBeOnlineToViewMembers: 'Debes estar en línea para ver a los miembros de este espacio de trabajo.',
            moreFeatures: 'Más funciones',
            requested: 'Solicitado',
            distanceRates: 'Tarifas por distancia',
            defaultDescription: 'Un solo lugar para todos tus recibos y gastos.',
            descriptionHint: 'Comparte información sobre este espacio de trabajo con todos los miembros.',
            welcomeNote: 'Por favor, usa Expensify para enviar tus recibos para reembolso, ¡gracias!',
            subscription: 'Suscripción',
            markAsEntered: 'Marcar como introducido manualmente',
            markAsExported: 'Marcar como exportado',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exportar a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Verifiquemos que todo se vea bien.',
            lineItemLevel: 'Nivel de partida individual',
            reportLevel: 'Nivel de informe',
            topLevel: 'Nivel superior',
            appliedOnExport: 'No se importa en Expensify, se aplica al exportar',
            shareNote: {
                header: 'Comparte tu espacio de trabajo con otras personas',
                content: (adminsRoomLink: string) =>
                    `Comparte este código QR o copia el enlace de abajo para que las personas puedan solicitar acceso a tu espacio de trabajo fácilmente. Todas las solicitudes para unirse al espacio de trabajo aparecerán en la sala <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> para que las revises.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Conectar con ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Crear nueva conexión',
            reuseExistingConnection: 'Reutilizar conexión existente',
            existingConnections: 'Conexiones existentes',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Como ya te has conectado a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} antes, puedes elegir reutilizar una conexión existente o crear una nueva.`,
            lastSyncDate: (connectionName: string, formattedDate: string) => `${connectionName} - Última sincronización ${formattedDate}`,
            authenticationError: (connectionName: string) => `No se puede conectar a ${connectionName} debido a un error de autenticación.`,
            learnMore: 'Más información',
            memberAlternateText: 'Enviar y aprobar informes.',
            adminAlternateText: 'Administra los informes y la configuración del espacio de trabajo.',
            auditorAlternateText: 'Ver y comentar informes.',
            reimbursementChoice: {
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES]: 'Directo',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO]: 'Ninguno',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL]: 'Indirecto',
            },
            roleName: (role?: string) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Auditor';
                    case CONST.POLICY.ROLE.USER:
                        return 'Miembro';
                    default:
                        return 'Miembro';
                }
            },
            frequency: {
                manual: 'Manualmente',
                instant: 'Instantáneo',
                immediate: 'Diario',
                trip: 'Por viaje',
                weekly: 'Semanal',
                semimonthly: 'Dos veces al mes',
                monthly: 'Mensual',
            },
            budgetFrequency: {
                monthly: 'mensual',
                yearly: 'anual',
            },
            budgetFrequencyUnit: {
                monthly: 'mes',
                yearly: 'año',
            },
            budgetTypeForNotificationMessage: {
                tag: 'etiqueta',
                category: 'categoría',
            },
            planType: 'Tipo de plan',
            youCantDowngradeInvoicing:
                'No puedes cambiar a un plan inferior en una suscripción facturada. Para hablar o hacer cambios en tu suscripción, comunícate con tu gestor de cuenta o con Concierge para recibir ayuda.',
            defaultCategory: 'Categoría predeterminada',
            viewTransactions: 'Ver transacciones',
            policyExpenseChatName: (displayName: string) => `Gastos de ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Las transacciones de la Expensify Card se exportarán automáticamente a una “Cuenta de pasivo de Expensify Card” creada con <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">nuestra integración</a>.</muted-text-label>`,
            travelInvoicing: 'Exportar por pagar de Expensify Travel a',
            travelInvoicingVendor: 'Proveedor de viajes',
            travelInvoicingPayableAccount: 'Cuenta por pagar de viajes',
        },
        receiptPartners: {
            uber: {
                subtitle: (organizationName: string) =>
                    organizationName ? `Conectado a ${organizationName}` : 'Automatiza los gastos de viaje y de entrega de comidas en toda tu organización.',
                sendInvites: 'Enviar invitaciones',
                sendInvitesDescription: 'Estas personas del espacio de trabajo todavía no tienen una cuenta de Uber for Business. Anula la selección de quienes no desees invitar por ahora.',
                confirmInvite: 'Confirmar invitación',
                manageInvites: 'Administrar invitaciones',
                confirm: 'Confirmar',
                allSet: 'Todo listo',
                readyToRoll: 'Todo listo para comenzar',
                takeBusinessRideMessage: 'Haz un viaje de trabajo y tus recibos de Uber se importarán en Expensify. ¡Vamos!',
                all: 'Todo',
                linked: 'Vinculado',
                outstanding: 'Pendiente',
                status: {
                    resend: 'Reenviar',
                    invite: 'Invitar',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'Vinculado',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: 'Pendiente',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Suspendida',
                },
                centralBillingAccount: 'Cuenta de facturación centralizada',
                centralBillingDescription: 'Elige dónde importar todos los recibos de Uber.',
                invitationFailure: 'Error al invitar al miembro a Uber for Business',
                autoInvite: 'Invita a nuevas personas del espacio de trabajo a Uber for Business',
                autoRemove: 'Desactivar de Uber for Business a los miembros eliminados del espacio de trabajo',
                emptyContent: {
                    title: 'No hay invitaciones pendientes',
                    subtitle: '¡Hurra! Buscamos por todas partes y no pudimos encontrar ninguna invitación pendiente.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Establece tasas de viáticos para controlar el gasto diario de las personas del equipo. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Más información</a>.</muted-text>`,
            amount: 'Importe',
            deleteRates: () => ({
                one: 'Eliminar tarifa',
                other: 'Eliminar tarifas',
            }),
            deletePerDiemRate: 'Eliminar tarifa de viáticos',
            findPerDiemRate: 'Buscar tarifa de viáticos',
            areYouSureDelete: () => ({
                one: '¿Seguro que quieres eliminar esta tarifa?',
                other: '¿Seguro que quieres eliminar estas tarifas?',
            }),
            emptyList: {
                title: 'Viáticos',
                subtitle: 'Establece dietas para controlar el gasto diario de las personas empleadas. Importa las tarifas desde una hoja de cálculo para comenzar.',
            },
            importPerDiemRates: 'Importar tarifas de viáticos',
            editPerDiemRate: 'Editar tasa de viáticos',
            editPerDiemRates: 'Editar tarifas de viáticos',
            editDestinationSubtitle: (destination: string) => `Actualizar este destino lo cambiará para todas las subtarifas de viáticos de ${destination}.`,
            editCurrencySubtitle: (destination: string) => `Actualizar esta moneda la cambiará para todas las subtarifas de viáticos de ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Configura cómo se exportan los gastos de bolsillo a QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Marcar cheques como “imprimir más tarde”',
            exportDescription: 'Configura cómo se exportan los datos de Expensify a QuickBooks Desktop.',
            date: 'Fecha de exportación',
            exportInvoices: 'Exportar facturas a',
            exportExpensifyCard: 'Exportar transacciones de la Expensify Card como',
            account: 'Cuenta',
            accountDescription: 'Elige dónde registrar los asientos contables.',
            accountsPayable: 'Cuentas por pagar',
            accountsPayableDescription: 'Elige dónde crear facturas de proveedor.',
            bankAccount: 'Cuenta bancaria',
            notConfigured: 'No configurado',
            bankAccountDescription: 'Elige desde dónde enviar los cheques.',
            creditCardAccount: 'Cuenta de tarjeta de crédito',
            exportDate: {
                label: 'Fecha de exportación',
                description: 'Utiliza esta fecha al exportar reportes a QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Fecha del último gasto',
                        description: 'Fecha del gasto más reciente en el informe.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Fecha de exportación',
                        description: 'Fecha en que el informe se exportó a QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Fecha de envío',
                        description: 'Fecha en que se envió el informe para aprobación.',
                    },
                },
            },
            exportCheckDescription: 'Crearemos un cheque desglosado para cada informe de Expensify y lo enviaremos desde la cuenta bancaria que aparece a continuación.',
            exportJournalEntryDescription: 'Crearemos un asiento contable detallado para cada informe de Expensify y lo contabilizaremos en la cuenta de abajo.',
            exportVendorBillDescription:
                'Crearemos una factura detallada de proveedor por cada informe de Expensify y la agregaremos a la cuenta de abajo. Si este período está cerrado, la registraremos el día 1 del siguiente período abierto.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop no admite impuestos en las exportaciones de asientos contables. Como tienes los impuestos habilitados en tu espacio de trabajo, esta opción de exportación no está disponible.',
            outOfPocketTaxEnabledError: 'Los asientos contables no están disponibles cuando los impuestos están habilitados. Elige otra opción de exportación.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Tarjeta de crédito',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Factura de proveedor',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Asiento contable',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Cheque',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Crearemos un cheque desglosado para cada informe de Expensify y lo enviaremos desde la cuenta bancaria que aparece a continuación.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Asociaremos automáticamente el nombre del comercio en la transacción de tarjeta de crédito con cualquier proveedor correspondiente en QuickBooks. Si no existen proveedores, crearemos un proveedor llamado "Credit Card Misc." para la asociación.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Crearemos una factura detallada de proveedor para cada informe de Expensify con la fecha del último gasto y la agregaremos a la cuenta que aparece abajo. Si este período está cerrado, la registraremos el día 1 del siguiente período abierto.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Elige dónde exportar las transacciones de tarjeta de crédito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Elige un proveedor para aplicar a todas las transacciones con tarjeta de crédito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Elige desde dónde enviar los cheques.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Las facturas de proveedores no están disponibles cuando las ubicaciones están habilitadas. Elige una opción de exportación diferente.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Los cheques no están disponibles cuando las ubicaciones están habilitadas. Elige otra opción de exportación.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Los asientos contables no están disponibles cuando los impuestos están habilitados. Elige otra opción de exportación.',
            },
            noAccountsFound: 'No se encontraron cuentas',
            noAccountsFoundDescription: 'Agrega la cuenta en QuickBooks Desktop y sincroniza la conexión nuevamente',
            qbdSetup: 'Configuración de QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'No se puede conectar desde este dispositivo',
                body1: 'Deberás configurar esta conexión desde la computadora que aloja el archivo de empresa de QuickBooks Desktop.',
                body2: 'Una vez que te conectes, podrás sincronizar y exportar desde cualquier lugar.',
            },
            setupPage: {
                title: 'Abre este enlace para conectar',
                body: 'Para completar la configuración, abre el siguiente enlace en la computadora donde se está ejecutando QuickBooks Desktop.',
                setupErrorTitle: 'Algo salió mal',
                setupErrorBody: (conciergeLink: string) =>
                    `<muted-text><centered-text>La conexión con QuickBooks Desktop no funciona en este momento. Vuelve a intentarlo más tarde o <a href="${conciergeLink}">contacta con Concierge</a> si el problema persiste.</centered-text></muted-text>`,
            },
            importDescription: 'Elige qué configuraciones de codificación importar de QuickBooks Desktop a Expensify.',
            classes: 'Clases',
            items: 'Artículos',
            customers: 'Clientes/proyectos',
            exportCompanyCardsDescription: 'Configura cómo se exportan las compras con tarjeta de empresa a QuickBooks Desktop.',
            defaultVendorDescription: 'Establece un proveedor predeterminado que se aplicará a todas las transacciones con tarjeta de crédito al exportarlas.',
            accountsDescription: 'Tu plan de cuentas de QuickBooks Desktop se importará en Expensify como categorías.',
            accountsSwitchTitle: 'Elige importar las nuevas cuentas como categorías habilitadas o deshabilitadas.',
            accountsSwitchDescription: 'Las categorías habilitadas estarán disponibles para que las personas miembros las seleccionen al crear sus gastos.',
            classesDescription: 'Elige cómo gestionar las clases de QuickBooks Desktop en Expensify.',
            tagsDisplayedAsDescription: 'Nivel de partida de línea',
            reportFieldsDisplayedAsDescription: 'Nivel de informe',
            customersDescription: 'Elige cómo gestionar los clientes/proyectos de QuickBooks Desktop en Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se sincronizará automáticamente con QuickBooks Desktop todos los días.',
                createEntities: 'Crear entidades automáticamente',
                createEntitiesDescription: 'Expensify creará automáticamente proveedores en QuickBooks Desktop si aún no existen.',
            },
            itemsDescription: 'Elige cómo gestionar los elementos de QuickBooks Desktop en Expensify.',
            accountingMethods: {
                label: 'Cuándo exportar',
                description: 'Elige cuándo exportar los gastos:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Devengo',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Efectivo',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Los gastos de bolsillo se exportarán cuando estén aprobados de forma definitiva',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Los gastos de bolsillo se exportarán cuando se paguen',
                },
            },
        },
        qbo: {
            connectedTo: 'Conectado a',
            importDescription: 'Elige qué configuraciones de codificación importar de QuickBooks Online a Expensify.',
            classes: 'Clases',
            locations: 'Ubicaciones',
            customers: 'Clientes/proyectos',
            accountsDescription: 'Tu catálogo de cuentas de QuickBooks Online se importará a Expensify como categorías.',
            accountsSwitchTitle: 'Elige importar las nuevas cuentas como categorías habilitadas o deshabilitadas.',
            accountsSwitchDescription: 'Las categorías habilitadas estarán disponibles para que las personas miembros las seleccionen al crear sus gastos.',
            classesDescription: 'Elige cómo gestionar las clases de QuickBooks Online en Expensify.',
            customersDescription: 'Elige cómo gestionar los clientes/proyectos de QuickBooks Online en Expensify.',
            locationsDescription: 'Elige cómo gestionar las ubicaciones de QuickBooks Online en Expensify.',
            taxesDescription: 'Elige cómo gestionar los impuestos de QuickBooks Online en Expensify.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online no admite ubicaciones a nivel de línea para cheques o facturas de proveedor. Si deseas tener ubicaciones a nivel de línea, asegúrate de usar asientos contables y gastos con tarjeta de crédito/débito.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online no admite impuestos en los asientos de diario. Cambia tu opción de exportación a factura de proveedor o cheque.',
            exportDescription: 'Configura cómo se exportan los datos de Expensify a QuickBooks Online.',
            date: 'Fecha de exportación',
            exportInvoices: 'Exportar facturas a',
            exportExpensifyCard: 'Exportar transacciones de la Expensify Card como',
            exportDate: {
                label: 'Fecha de exportación',
                description: 'Usa esta fecha al exportar informes a QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Fecha del último gasto',
                        description: 'Fecha del gasto más reciente en el informe.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Fecha de exportación',
                        description: 'Fecha en que el informe se exportó a QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Fecha de envío',
                        description: 'Fecha en que se envió el informe para aprobación.',
                    },
                },
            },
            receivable: 'Cuentas por cobrar',
            archive: 'Archivo de cuentas por cobrar',
            exportInvoicesDescription: 'Usa esta cuenta al exportar facturas a QuickBooks Online.',
            exportCompanyCardsDescription: 'Establece cómo se exportan las compras con tarjetas corporativas a QuickBooks Online.',
            vendor: 'Proveedor',
            defaultVendorDescription: 'Establece un proveedor predeterminado que se aplicará a todas las transacciones con tarjeta de crédito al exportarlas.',
            exportOutOfPocketExpensesDescription: 'Configura cómo se exportan los gastos de bolsillo a QuickBooks Online.',
            exportCheckDescription: 'Crearemos un cheque desglosado para cada informe de Expensify y lo enviaremos desde la cuenta bancaria que aparece a continuación.',
            exportJournalEntryDescription: 'Crearemos un asiento contable detallado para cada informe de Expensify y lo contabilizaremos en la cuenta de abajo.',
            exportVendorBillDescription:
                'Crearemos una factura detallada de proveedor por cada informe de Expensify y la agregaremos a la cuenta de abajo. Si este período está cerrado, la registraremos el día 1 del siguiente período abierto.',
            account: 'Cuenta',
            accountDescription: 'Elige dónde registrar los asientos contables.',
            accountsPayable: 'Cuentas por pagar',
            accountsPayableDescription: 'Elige dónde crear facturas de proveedor.',
            bankAccount: 'Cuenta bancaria',
            notConfigured: 'No configurado',
            bankAccountDescription: 'Elige desde dónde enviar los cheques.',
            creditCardAccount: 'Cuenta de tarjeta de crédito',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online no permite usar ubicaciones en las exportaciones de facturas de proveedor. Como tienes las ubicaciones habilitadas en tu espacio de trabajo, esta opción de exportación no está disponible.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online no admite impuestos en las exportaciones de asientos contables. Como tienes los impuestos habilitados en tu espacio de trabajo, esta opción de exportación no está disponible.',
            outOfPocketTaxEnabledError: 'Los asientos contables no están disponibles cuando los impuestos están habilitados. Elige otra opción de exportación.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se sincronizará automáticamente con QuickBooks Online todos los días.',
                inviteEmployees: 'Invitar a empleados',
                inviteEmployeesDescription: 'Importa los registros de empleados de QuickBooks Online e invita a las personas de tu equipo a este espacio de trabajo.',
                createEntities: 'Crear entidades automáticamente',
                createEntitiesDescription: 'Expensify creará automáticamente proveedores en QuickBooks Online si aún no existen y creará automáticamente clientes al exportar facturas.',
                reimbursedReportsDescription:
                    'Cada vez que se pague un informe usando Expensify ACH, el pago de factura correspondiente se creará en la cuenta de QuickBooks Online que aparece a continuación.',
                qboBillPaymentAccount: 'Cuenta de pago de facturas de QuickBooks',
                qboInvoiceCollectionAccount: 'Cuenta de cobro de facturas de QuickBooks',
                accountSelectDescription: 'Elige desde dónde pagar las facturas y crearemos el pago en QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Elige dónde recibir los pagos de facturas y crearemos el pago en QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Tarjeta de débito',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Tarjeta de crédito',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Factura de proveedor',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Asiento contable',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Cheque',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Asociaremos automáticamente el nombre del comercio de la transacción con tarjeta de débito con cualquier proveedor correspondiente en QuickBooks. Si no existen proveedores, crearemos un proveedor «Debit Card Misc.» para la asociación.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Asociaremos automáticamente el nombre del comercio en la transacción de tarjeta de crédito con cualquier proveedor correspondiente en QuickBooks. Si no existen proveedores, crearemos un proveedor llamado "Credit Card Misc." para la asociación.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Crearemos una factura detallada de proveedor para cada informe de Expensify con la fecha del último gasto y la agregaremos a la cuenta que aparece abajo. Si este período está cerrado, la registraremos el día 1 del siguiente período abierto.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Elige dónde exportar las transacciones de la tarjeta de débito.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Elige dónde exportar las transacciones de tarjeta de crédito.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Elige un proveedor para aplicar a todas las transacciones con tarjeta de crédito.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Las facturas de proveedores no están disponibles cuando las ubicaciones están habilitadas. Elige una opción de exportación diferente.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Los cheques no están disponibles cuando las ubicaciones están habilitadas. Elige otra opción de exportación.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Los asientos contables no están disponibles cuando los impuestos están habilitados. Elige otra opción de exportación.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Elige una cuenta válida para exportar la factura del proveedor',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Elige una cuenta válida para la exportación del asiento contable',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Elige una cuenta válida para la exportación de cheques',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Para usar la exportación de facturas de proveedor, configura una cuenta de cuentas por pagar en QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Para usar la exportación de asientos contables, configura una cuenta de diario en QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Para usar la exportación de cheques, configura una cuenta bancaria en QuickBooks Online',
            },
            noAccountsFound: 'No se encontraron cuentas',
            noAccountsFoundDescription: 'Agrega la cuenta en QuickBooks Online y sincroniza la conexión de nuevo.',
            accountingMethods: {
                label: 'Cuándo exportar',
                description: 'Elige cuándo exportar los gastos:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Devengo',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Efectivo',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Los gastos de bolsillo se exportarán cuando estén aprobados de forma definitiva',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Los gastos de bolsillo se exportarán cuando se paguen',
                },
            },
        },
        workspaceList: {
            joinNow: 'Únete ahora',
            askToJoin: 'Pedir unirse',
        },
        xero: {
            organization: 'Organización de Xero',
            organizationDescription: 'Elige la organización de Xero desde la que te gustaría importar datos.',
            importDescription: 'Elige qué configuraciones de codificación importar de Xero a Expensify.',
            accountsDescription: 'Tu plan de cuentas de Xero se importará en Expensify como categorías.',
            accountsSwitchTitle: 'Elige importar las nuevas cuentas como categorías habilitadas o deshabilitadas.',
            accountsSwitchDescription: 'Las categorías habilitadas estarán disponibles para que las personas miembros las seleccionen al crear sus gastos.',
            trackingCategories: 'Categorías de seguimiento',
            trackingCategoriesDescription: 'Elige cómo gestionar las categorías de seguimiento de Xero en Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `Mapear Xero ${categoryName} a`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Elige dónde asignar ${categoryName} al exportar a Xero.`,
            customers: 'Refacturar a clientes',
            customersDescription:
                'Elige si quieres volver a facturar a los clientes en Expensify. Tus contactos de clientes de Xero se pueden etiquetar en los gastos y se exportarán a Xero como una factura de venta.',
            taxesDescription: 'Elige cómo gestionar los impuestos de Xero en Expensify.',
            notImported: 'No importado',
            notConfigured: 'No configurado',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Predeterminado de contacto de Xero',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Etiquetas',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Campos del informe',
            },
            exportDescription: 'Configura cómo se exportan los datos de Expensify a Xero.',
            purchaseBill: 'Factura de compra',
            exportDeepDiveCompanyCard:
                'Los gastos exportados se registrarán como transacciones bancarias en la cuenta bancaria de Xero que aparece a continuación, y las fechas de las transacciones coincidirán con las fechas de su estado de cuenta bancario.',
            bankTransactions: 'Transacciones bancarias',
            xeroBankAccount: 'Cuenta bancaria de Xero',
            xeroBankAccountDescription: 'Elige dónde se registrarán los gastos como transacciones bancarias.',
            exportExpensesDescription: 'Los informes se exportarán como una factura de compra con la fecha y el estado seleccionados a continuación.',
            purchaseBillDate: 'Fecha de factura de compra',
            exportInvoices: 'Exportar facturas como',
            salesInvoice: 'Factura de ventas',
            exportInvoicesDescription: 'Las facturas de venta siempre muestran la fecha en la que se envió la factura.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se sincronizará automáticamente con Xero todos los días.',
                purchaseBillStatusTitle: 'Estado de factura de compra',
                reimbursedReportsDescription: 'Cada vez que se pague un informe usando Expensify ACH, se creará el pago de factura correspondiente en la cuenta de Xero indicada abajo.',
                xeroBillPaymentAccount: 'Cuenta de pago de facturas de Xero',
                xeroInvoiceCollectionAccount: 'Cuenta de cobranza de facturas de Xero',
                xeroBillPaymentAccountDescription: 'Elige desde dónde pagar las facturas y crearemos el pago en Xero.',
                invoiceAccountSelectorDescription: 'Elige dónde recibir los pagos de facturas y crearemos el pago en Xero.',
            },
            exportDate: {
                label: 'Fecha de factura de compra',
                description: 'Usa esta fecha al exportar informes a Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Fecha del último gasto',
                        description: 'Fecha del gasto más reciente en el informe.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Fecha de exportación',
                        description: 'Fecha en que el informe se exportó a Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Fecha de envío',
                        description: 'Fecha en que se envió el informe para aprobación.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Estado de factura de compra',
                description: 'Usa este estado al exportar facturas de compra a Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Borrador',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'En espera de aprobación',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Pago pendiente',
                },
            },
            noAccountsFound: 'No se encontraron cuentas',
            noAccountsFoundDescription: 'Agrega la cuenta en Xero y sincroniza la conexión nuevamente',
            accountingMethods: {
                label: 'Cuándo exportar',
                description: 'Elige cuándo exportar los gastos:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Devengo',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Efectivo',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Los gastos de bolsillo se exportarán cuando estén aprobados de forma definitiva',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Los gastos de bolsillo se exportarán cuando se paguen',
                },
            },
        },
        sageIntacct: {
            preferredExporter: 'Exportador preferido',
            taxSolution: 'Solución fiscal',
            notConfigured: 'No configurado',
            exportDate: {
                label: 'Fecha de exportación',
                description: 'Usa esta fecha al exportar informes a Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Fecha del último gasto',
                        description: 'Fecha del gasto más reciente en el informe.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Fecha de exportación',
                        description: 'Fecha en que se exportó el informe a Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Fecha de envío',
                        description: 'Fecha en que se envió el informe para aprobación.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Configura cómo se exportan los gastos de bolsillo a Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Informes de gastos',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Facturas de proveedor',
                },
            },
            nonReimbursableExpenses: {
                description: 'Configura cómo se exportan las compras con tarjetas corporativas a Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Tarjetas de crédito',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Facturas de proveedor',
                },
            },
            creditCardAccount: 'Cuenta de tarjeta de crédito',
            defaultVendor: 'Proveedor predeterminado',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Establece un proveedor predeterminado que se aplicará a los gastos reembolsables de ${isReimbursable ? '' : 'no-'} que no tengan un proveedor coincidente en Sage Intacct.`,
            exportDescription: 'Configura cómo se exportan los datos de Expensify a Sage Intacct.',
            exportPreferredExporterNote:
                'La persona exportadora preferida puede ser cualquier administrador del espacio de trabajo, pero también debe ser una persona administradora de dominio si configuras diferentes cuentas de exportación para tarjetas corporativas individuales en Configuración de dominio.',
            exportPreferredExporterSubNote: 'Una vez configurado, la persona exportadora preferida verá los informes para exportar en su cuenta.',
            noAccountsFound: 'No se encontraron cuentas',
            noAccountsFoundDescription: `Agrega la cuenta en Sage Intacct y sincroniza la conexión otra vez`,
            autoSync: 'Sincronización automática',
            autoSyncDescription: 'Expensify se sincronizará automáticamente con Sage Intacct todos los días.',
            inviteEmployees: 'Invitar a empleados',
            inviteEmployeesDescription:
                'Importa los registros de empleados de Sage Intacct e invita a las personas a este espacio de trabajo. Tu flujo de aprobación tendrá como valor predeterminado la aprobación del gerente y se puede configurar más en la página Miembros.',
            syncReimbursedReports: 'Sincronizar informes reembolsados',
            syncReimbursedReportsDescription:
                'Cada vez que se pague un informe mediante Expensify ACH, se creará el pago de factura correspondiente en la cuenta de Sage Intacct que aparece a continuación.',
            paymentAccount: 'Cuenta de pago de Sage Intacct',
            accountingMethods: {
                label: 'Cuándo exportar',
                description: 'Elige cuándo exportar los gastos:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Devengo',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Efectivo',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Los gastos de bolsillo se exportarán cuando estén aprobados de forma definitiva',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Los gastos de bolsillo se exportarán cuando se paguen',
                },
            },
        },
        netsuite: {
            subsidiary: 'Sucursal',
            subsidiarySelectDescription: 'Elige la subsidiaria en NetSuite desde la que te gustaría importar datos.',
            exportDescription: 'Configura cómo se exportan los datos de Expensify a NetSuite.',
            exportInvoices: 'Exportar facturas a',
            journalEntriesTaxPostingAccount: 'Cuenta de contabilización de impuestos de asientos de diario',
            journalEntriesProvTaxPostingAccount: 'Cuenta de registro de asientos para contabilización de impuesto provincial',
            foreignCurrencyAmount: 'Exportar importe en moneda extranjera',
            exportToNextOpenPeriod: 'Exportar al siguiente período abierto',
            nonReimbursableJournalPostingAccount: 'Cuenta contable para asientos no reembolsables',
            reimbursableJournalPostingAccount: 'Cuenta contable para asientos reembolsables',
            journalPostingPreference: {
                label: 'Preferencia de contabilización de asientos contables',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Entrada única y detallada para cada informe',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Registro único para cada gasto',
                },
            },
            invoiceItem: {
                label: 'Concepto de factura',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Crea uno para mí',
                        description: 'Crearemos un “elemento de línea de factura de Expensify” por ti al exportar (si aún no existe uno).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Seleccionar existente',
                        description: 'Vincularemos las facturas de Expensify con el elemento seleccionado a continuación.',
                    },
                },
            },
            exportDate: {
                label: 'Fecha de exportación',
                description: 'Utiliza esta fecha al exportar informes a NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Fecha del último gasto',
                        description: 'Fecha del gasto más reciente en el informe.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Fecha de exportación',
                        description: 'Fecha en que el informe se exportó a NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Fecha de envío',
                        description: 'Fecha en que se envió el informe para aprobación.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Informes de gastos',
                        reimbursableDescription: 'Los gastos de bolsillo se exportarán como informes de gastos a NetSuite.',
                        nonReimbursableDescription: 'Los gastos de tarjeta de empresa se exportarán como informes de gastos a NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Facturas de proveedor',
                        reimbursableDescription: dedent(`
                            Los gastos de bolsillo se exportarán como facturas pagaderas al proveedor de NetSuite especificado a continuación.

                            Si quieres establecer un proveedor específico para cada tarjeta, ve a *Configuración > Dominios > Tarjetas de empresa*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Los gastos de tarjetas de empresa se exportarán como facturas pagaderas al proveedor de NetSuite especificado a continuación.

                            Si quieres establecer un proveedor específico para cada tarjeta, ve a *Ajustes > Dominios > Tarjetas de empresa*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Asientos contables',
                        reimbursableDescription: dedent(`
                            Los gastos de bolsillo se exportarán como asientos contables a la cuenta de NetSuite especificada a continuación.

                            Si quieres configurar un proveedor específico para cada tarjeta, ve a *Configuración > Dominios > Tarjetas de empresa*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Los gastos de la tarjeta corporativa se exportarán como asientos contables a la cuenta de NetSuite especificada a continuación.

                            Si deseas establecer un proveedor específico para cada tarjeta, ve a *Ajustes > Dominios > Tarjetas corporativas*.
                        `),
                        travelDescription: 'Los gastos de viaje se exportarán como asientos contables a la cuenta de NetSuite indicada a continuación.',
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Si cambias la configuración de exportación de tarjetas de empresa a informes de gastos, se deshabilitarán los proveedores de NetSuite y las cuentas contables de las tarjetas individuales.\n\nNo te preocupes, seguiremos guardando tus selecciones anteriores por si quieres volver a cambiarlo más adelante.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify se sincronizará automáticamente con NetSuite todos los días.',
                reimbursedReportsDescription:
                    'Cada vez que se pague un informe usando Expensify ACH, se creará el pago de factura correspondiente en la cuenta de NetSuite que aparece a continuación.',
                reimbursementsAccount: 'Cuenta de reembolsos',
                reimbursementsAccountDescription: 'Elige la cuenta bancaria que usarás para los reembolsos y crearemos el pago asociado en NetSuite.',
                collectionsAccount: 'Cuenta de cobro',
                collectionsAccountDescription: 'Una vez que una factura se marque como pagada en Expensify y se exporte a NetSuite, aparecerá contra la cuenta de abajo.',
                approvalAccount: 'Cuenta de aprobación de CxP',
                approvalAccountDescription:
                    'Elige la cuenta contra la que se aprobarán las transacciones en NetSuite. Si estás sincronizando informes reembolsados, esta también es la cuenta contra la que se crearán los pagos de facturas.',
                defaultApprovalAccount: 'Predeterminado de NetSuite',
                inviteEmployees: 'Invita a empleados y configura aprobaciones',
                inviteEmployeesDescription:
                    'Importa los registros de empleados de NetSuite e invita a las personas de tu empresa a este espacio de trabajo. Tu flujo de aprobación tendrá como valor predeterminado la aprobación de la persona responsable y podrá configurarse más adelante en la página *Miembros*.',
                autoCreateEntities: 'Crear automáticamente empleados/proveedores',
                enableCategories: 'Habilitar categorías recién importadas',
                customFormID: 'ID de formulario personalizado',
                customFormIDDescription:
                    'De forma predeterminada, Expensify creará asientos utilizando el formulario de transacción preferido configurado en NetSuite. Como alternativa, puedes designar un formulario de transacción específico para que se use.',
                customFormIDReimbursable: 'Gasto de bolsillo',
                customFormIDNonReimbursable: 'Gasto con tarjeta de empresa',
                exportReportsTo: {
                    label: 'Nivel de aprobación de informe de gastos',
                    description:
                        'Una vez que un informe de gastos se aprueba en Expensify y se exporta a NetSuite, puedes establecer un nivel adicional de aprobación en NetSuite antes de contabilizarlo.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Preferencia predeterminada de NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Solo supervisor aprobado',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Solo aprobado por contabilidad',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Supervisión y contabilidad aprobadas',
                    },
                },
                accountingMethods: {
                    label: 'Cuándo exportar',
                    description: 'Elige cuándo exportar los gastos:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Devengo',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Efectivo',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Los gastos de bolsillo se exportarán cuando estén aprobados de forma definitiva',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Los gastos de bolsillo se exportarán cuando se paguen',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Nivel de aprobación de factura de proveedor',
                    description:
                        'Una vez que una factura de proveedor se aprueba en Expensify y se exporta a NetSuite, puedes establecer un nivel adicional de aprobación en NetSuite antes de contabilizarla.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Preferencia predeterminada de NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Aprobación pendiente',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Aprobado para publicación',
                    },
                },
                exportJournalsTo: {
                    label: 'Nivel de aprobación de asientos contables',
                    description:
                        'Una vez que un asiento contable se aprueba en Expensify y se exporta a NetSuite, puedes establecer un nivel adicional de aprobación en NetSuite antes de contabilizarlo.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Preferencia predeterminada de NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Aprobación pendiente',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Aprobado para publicación',
                    },
                },
                error: {
                    customFormID: 'Introduce un ID numérico válido para el formulario personalizado',
                },
            },
            noAccountsFound: 'No se encontraron cuentas',
            noAccountsFoundDescription: 'Agrega la cuenta en NetSuite y vuelve a sincronizar la conexión',
            noVendorsFound: 'No se encontraron proveedores',
            noVendorsFoundDescription: 'Agrega proveedores en NetSuite y sincroniza la conexión de nuevo',
            noItemsFound: 'No se encontraron elementos de factura',
            noItemsFoundDescription: 'Agrega artículos de factura en NetSuite y sincroniza la conexión nuevamente',
            noSubsidiariesFound: 'No se encontraron subsidiarias',
            noSubsidiariesFoundDescription: 'Agrega una subsidiaria en NetSuite y vuelve a sincronizar la conexión',
            tokenInput: {
                title: 'Configuración de NetSuite',
                formSteps: {
                    installBundle: {
                        title: 'Instalar el paquete de Expensify',
                        description: 'En NetSuite, ve a *Customization > SuiteBundler > Search & Install Bundles* > busca "Expensify" > instala el paquete.',
                    },
                    enableTokenAuthentication: {
                        title: 'Habilitar la autenticación basada en token',
                        description: 'En NetSuite, ve a *Setup > Company > Enable Features > SuiteCloud* y habilita *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'Habilitar servicios web SOAP',
                        description: 'En NetSuite, ve a *Setup > Company > Enable Features > SuiteCloud* y habilita *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Crear un token de acceso',
                        description:
                            'En NetSuite, ve a *Setup > Users/Roles > Access Tokens* > crea un token de acceso para la aplicación "Expensify" y el rol "Expensify Integration" o "Administrator".\n\n*Importante:* Asegúrate de guardar el *Token ID* y el *Token Secret* de este paso. Los necesitarás para el siguiente paso.',
                    },
                    enterCredentials: {
                        title: 'Introduce tus credenciales de NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'ID de cuenta de NetSuite',
                            netSuiteTokenID: 'ID de token',
                            netSuiteTokenSecret: 'Secreto del token',
                        },
                        netSuiteAccountIDDescription: 'En NetSuite, ve a *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Categorías de gastos',
                expenseCategoriesDescription: 'Tus categorías de gastos de NetSuite se importarán en Expensify como categorías.',
                crossSubsidiaryCustomers: 'Clientes/proyectos entre subsidiarias',
                importFields: {
                    departments: {
                        title: 'Departamentos',
                        subtitle: 'Elige cómo gestionar los *departamentos* de NetSuite en Expensify.',
                    },
                    classes: {
                        title: 'Clases',
                        subtitle: 'Elige cómo gestionar las *clases* en Expensify.',
                    },
                    locations: {
                        title: 'Ubicaciones',
                        subtitle: 'Elige cómo gestionar las *ubicaciones* en Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Clientes/proyectos',
                    subtitle: 'Elige cómo gestionar los *clientes* y *proyectos* de NetSuite en Expensify.',
                    importCustomers: 'Importar clientes',
                    importJobs: 'Importar proyectos',
                    customers: 'clientes',
                    jobs: 'proyectos',
                    label: (importFields: string[], importType: string) => `${importFields.join('y')}, ${importType}`,
                },
                importTaxDescription: 'Importar grupos de impuestos desde NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Elige una opción a continuación:',
                    label: (importedTypes: string[]) => `Importado como ${importedTypes.join('y')}`,
                    requiredFieldError: (fieldName: string) => `Por favor, introduce el/la ${fieldName}`,
                    customSegments: {
                        title: 'Segmentos/registros personalizados',
                        addText: 'Agregar segmento/registro personalizado',
                        recordTitle: 'Segmento/registro personalizado',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Ver instrucciones detalladas',
                        helpText: 'sobre cómo configurar segmentos/registros personalizados.',
                        emptyTitle: 'Agregar un segmento personalizado o un registro personalizado',
                        fields: {
                            segmentName: 'Nombre',
                            internalID: 'ID interno',
                            scriptID: 'ID de script',
                            customRecordScriptID: 'ID de columna de transacción',
                            mapping: 'Se muestra como',
                        },
                        removeTitle: 'Eliminar segmento/registro personalizado',
                        removePrompt: '¿Seguro que quieres eliminar este segmento/registro personalizado?',
                        addForm: {
                            customSegmentName: 'nombre de segmento personalizado',
                            customRecordName: 'nombre de registro personalizado',
                            segmentTitle: 'Segmento personalizado',
                            customSegmentAddTitle: 'Agregar segmento personalizado',
                            customRecordAddTitle: 'Agregar registro personalizado',
                            recordTitle: 'Registro personalizado',
                            segmentRecordType: '¿Quieres agregar un segmento personalizado o un registro personalizado?',
                            customSegmentNameTitle: '¿Cuál es el nombre del segmento personalizado?',
                            customRecordNameTitle: '¿Cuál es el nombre del registro personalizado?',
                            customSegmentNameFooter: `Puedes encontrar los nombres de segmentos personalizados en NetSuite en la página *Customizations > Links, Records & Fields > Custom Segments*.

_Para obtener instrucciones más detalladas, [visita nuestro sitio de ayuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Puedes encontrar nombres de registros personalizados en NetSuite introduciendo "Transaction Column Field" en la búsqueda global.

_Para obtener instrucciones más detalladas, [visita nuestro sitio de ayuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: '¿Cuál es el ID interno?',
                            customSegmentInternalIDFooter: `Primero, asegúrate de haber habilitado los IDs internos en NetSuite en *Home > Set Preferences > Show Internal ID.*

Puedes encontrar los IDs internos de segmentos personalizados en NetSuite en:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Haz clic en un segmento personalizado.
3. Haz clic en el hipervínculo junto a *Custom Record Type*.
4. Busca el ID interno en la tabla de la parte inferior.

_Para obtener instrucciones más detalladas, [visita nuestro sitio de ayuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Puedes encontrar los ID internos de registros personalizados en NetSuite siguiendo estos pasos:

1. Ingresa "Transaction Line Fields" en la búsqueda global.
2. Haz clic en un registro personalizado.
3. Busca el ID interno en el lado izquierdo.

_Para obtener instrucciones más detalladas, [visita nuestro sitio de ayuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: '¿Cuál es el ID del script?',
                            customSegmentScriptIDFooter: `Puedes encontrar los IDs de script de segmentos personalizados en NetSuite en: 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Haz clic en un segmento personalizado.
3. Haz clic en la pestaña *Application and Sourcing* cerca de la parte inferior y luego:
    a. Si quieres mostrar el segmento personalizado como una *etiqueta* (a nivel de partida) en Expensify, haz clic en la subpestaña *Transaction Columns* y usa el *Field ID*.
    b. Si quieres mostrar el segmento personalizado como un *campo de informe* (a nivel de informe) en Expensify, haz clic en la subpestaña *Transactions* y usa el *Field ID*.

_Para obtener instrucciones más detalladas, [visita nuestro sitio de ayuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: '¿Cuál es el ID de la columna de transacción?',
                            customRecordScriptIDFooter: `Puedes encontrar los IDs de script de registros personalizados en NetSuite en:

1. Ingresa "Transaction Line Fields" en la búsqueda global.
2. Haz clic en un registro personalizado.
3. Busca el ID de script en el lado izquierdo.

_Para obtener instrucciones más detalladas, [visita nuestro sitio de ayuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: '¿Cómo debería mostrarse este segmento personalizado en Expensify?',
                            customRecordMappingTitle: '¿Cómo se debe mostrar este registro personalizado en Expensify?',
                        },
                        errors: {
                            uniqueFieldError: (fieldName: string) => `Ya existe un segmento/registro personalizado con este ${fieldName?.toLowerCase()}`,
                        },
                    },
                    customLists: {
                        title: 'Listas personalizadas',
                        addText: 'Agregar lista personalizada',
                        recordTitle: 'Lista personalizada',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Ver instrucciones detalladas',
                        helpText: 'sobre cómo configurar listas personalizadas.',
                        emptyTitle: 'Agregar una lista personalizada',
                        fields: {
                            listName: 'Nombre',
                            internalID: 'ID interno',
                            transactionFieldID: 'ID de campo de transacción',
                            mapping: 'Se muestra como',
                        },
                        removeTitle: 'Eliminar lista personalizada',
                        removePrompt: '¿Seguro que quieres eliminar esta lista personalizada?',
                        addForm: {
                            listNameTitle: 'Elige una lista personalizada',
                            transactionFieldIDTitle: '¿Cuál es el ID del campo de transacción?',
                            transactionFieldIDFooter: `Puedes encontrar los IDs de campos de transacción en NetSuite siguiendo estos pasos:

1. Escribe "Transaction Line Fields" en la búsqueda global.
2. Haz clic en una lista personalizada.
3. Busca el ID del campo de transacción en el lado izquierdo.

_Para obtener instrucciones más detalladas, [visita nuestro sitio de ayuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: '¿Cómo debería mostrarse esta lista personalizada en Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Ya existe una lista personalizada con este ID de campo de transacción`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Predeterminado de empleado de NetSuite',
                        description: 'No se importa en Expensify, se aplica al exportar',
                        footerContent: (importField: string) =>
                            `Si usas ${importField} en NetSuite, aplicaremos el valor predeterminado establecido en el registro del empleado al exportar a Informe de gastos o Asiento contable.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Etiquetas',
                        description: 'Nivel de partida individual',
                        footerContent: (importField: string) => `${startCase(importField)} se podrá seleccionar para cada gasto individual en el informe de la persona empleada.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Campos del informe',
                        description: 'Nivel de informe',
                        footerContent: (importField: string) => `La selección de ${startCase(importField)} se aplicará a todos los gastos en el informe de la persona empleada.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Configuración de Sage Intacct',
            prerequisitesTitle: 'Antes de conectarte...',
            downloadExpensifyPackage: 'Descarga el paquete de Expensify para Sage Intacct',
            followSteps: 'Sigue los pasos de nuestras instrucciones de la guía “Cómo conectar con Sage Intacct”',
            enterCredentials: 'Introduce tus credenciales de Sage Intacct',
            entity: 'Entidad',
            employeeDefault: 'Valor predeterminado de empleado de Sage Intacct',
            employeeDefaultDescription: 'El departamento predeterminado de la persona empleada se aplicará a sus gastos en Sage Intacct si existe uno.',
            displayedAsTagDescription: 'El departamento se podrá seleccionar para cada gasto individual en el informe de la persona empleada.',
            displayedAsReportFieldDescription: 'La selección de departamento se aplicará a todos los gastos del informe de la persona empleada.',
            toggleImportTitle: (mappingTitle: string) => `Elige cómo manejar Sage Intacct <strong>${mappingTitle}</strong> en Expensify.`,
            expenseTypes: 'Tipos de gastos',
            expenseTypesDescription: 'Tus tipos de gastos de Sage Intacct se importarán en Expensify como categorías.',
            accountTypesDescription: 'Tu plan de cuentas de Sage Intacct se importará en Expensify como categorías.',
            importTaxDescription: 'Importar tasa de impuesto de compra desde Sage Intacct.',
            userDefinedDimensions: 'Dimensiones definidas por el usuario',
            addUserDefinedDimension: 'Agregar dimensión definida por el usuario',
            integrationName: 'Nombre de la integración',
            dimensionExists: 'Ya existe una dimensión con este nombre.',
            removeDimension: 'Eliminar dimensión definida por el usuario',
            removeDimensionPrompt: '¿Seguro que quieres eliminar esta dimensión definida por el usuario?',
            userDefinedDimension: 'Dimensión definida por el usuario',
            addAUserDefinedDimension: 'Agregar una dimensión definida por el usuario',
            detailedInstructionsLink: 'Ver instrucciones detalladas',
            detailedInstructionsRestOfSentence: 'al agregar dimensiones definidas por el usuario.',
            userDimensionsAdded: () => ({
                one: '1 DDU agregado',
                other: (count: number) => `Se añadieron ${count} UDDs`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'departamentos';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'clases';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'ubicaciones';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'clientes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'proyectos (trabajos)';
                    default:
                        return 'asignaciones';
                }
            },
        },
        type: {
            free: 'Gratis',
            control: 'Control',
            collect: 'Cobrar',
        },
        companyCards: {
            addCards: 'Agregar tarjetas',
            selectCards: 'Seleccionar tarjetas',
            fromOtherWorkspaces: 'De otros espacios de trabajo',
            addWorkEmail: 'Añade tu correo de trabajo',
            addWorkEmailDescription: 'Agrega tu correo electrónico laboral para poder usar los feeds existentes de otros espacios de trabajo.',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: 'No se pudieron cargar los feeds de tarjetas',
                workspaceFeedsCouldNotBeLoadedMessage: 'Se produjo un error al cargar las fuentes de tarjetas del espacio de trabajo. Vuelve a intentarlo o contacta a tu administrador.',
                feedCouldNotBeLoadedTitle: 'No se pudo cargar este feed',
                feedCouldNotBeLoadedMessage: 'Se produjo un error al cargar este feed. Vuelve a intentarlo o contacta a tu administrador.',
                tryAgain: 'Inténtalo de nuevo',
            },
            addNewCard: {
                other: 'Otro',
                fileImport: 'Importar transacciones desde archivo',
                createFileFeedHelpText: `<muted-text>Consulta esta <a href="${CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL}">guía de ayuda</a> para importar los gastos de las tarjetas de empresa.</muted-text>`,
                companyCardLayoutName: 'Nombre del diseño de tarjeta de empresa',
                cardLayoutNameRequired: 'El nombre del diseño de la tarjeta de empresa es obligatorio',
                useAdvancedFields: 'Usar campos avanzados (no recomendado)',
                cardProviders: {
                    gl1025: 'Tarjetas corporativas American Express',
                    cdf: 'Tarjetas comerciales Mastercard',
                    vcf: 'Tarjetas comerciales Visa',
                    stripe: 'Tarjetas de Stripe',
                },
                yourCardProvider: `¿Quién es el emisor de tu tarjeta?`,
                whoIsYourBankAccount: '¿Cuál es tu banco?',
                whereIsYourBankLocated: '¿Dónde se encuentra tu banco?',
                howDoYouWantToConnect: '¿Cómo quieres conectarte a tu banco?',
                learnMoreAboutOptions: `<muted-text>Obtén más información sobre estas <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">opciones</a>.</muted-text>`,
                commercialFeedDetails: 'Requiere configuración con tu banco. Normalmente la usan empresas más grandes y suele ser la mejor opción si cumples los requisitos.',
                commercialFeedPlaidDetails: `Requiere configuración con tu banco, pero te guiaremos. Normalmente está limitado a empresas más grandes.`,
                directFeedDetails: 'El enfoque más sencillo. Conéctate de inmediato usando tus credenciales maestras. Este método es el más común.',
                enableFeed: {
                    title: (provider: string) => `Activa tu feed de ${provider}`,
                    heading:
                        'Tenemos una integración directa con el emisor de tu tarjeta y podemos importar tus datos de transacciones en Expensify de forma rápida y precisa.\n\nPara comenzar, simplemente:',
                    visa: 'Tenemos integraciones globales con Visa, aunque la elegibilidad varía según el banco y el programa de la tarjeta.\n\nPara comenzar, simplemente:',
                    mastercard: 'Contamos con integraciones globales con Mastercard, aunque la elegibilidad varía según el banco y el programa de la tarjeta.\n\nPara comenzar, simplemente:',
                    vcf: `1. Visita [este artículo de ayuda](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) para obtener instrucciones detalladas sobre cómo configurar tus tarjetas Visa Commercial.

2. [Contacta a tu banco](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) para verificar que admiten un feed comercial para tu programa y pídeles que lo habiliten.

3. *Una vez que el feed esté habilitado y tengas sus detalles, continúa a la siguiente pantalla.*`,
                    gl1025: `1. Visita [este artículo de ayuda](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) para saber si American Express puede habilitar un feed comercial para tu programa.

2. Una vez que el feed esté habilitado, Amex te enviará una carta de producción.

3. *Una vez que tengas la información del feed, continúa a la siguiente pantalla.*`,
                    cdf: `1. Visita [este artículo de ayuda](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) para obtener instrucciones detalladas sobre cómo configurar tus Mastercard Commercial Cards.

2. [Contacta a tu banco](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) para verificar que admiten una conexión comercial para tu programa y pídeles que la activen.

3. *Una vez que la conexión esté activada y tengas sus datos, continúa a la siguiente pantalla.*`,
                    stripe: `1. Visita el panel de Stripe y ve a [Configuración](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. En Integraciones de productos, haz clic en Habilitar junto a Expensify.

3. Una vez que el feed esté habilitado, haz clic en Enviar abajo y nos encargaremos de añadirlo.`,
                },
                whatBankIssuesCard: '¿Qué banco emite estas tarjetas?',
                enterNameOfBank: 'Introduce el nombre del banco',
                feedDetails: {
                    vcf: {
                        title: '¿Cuáles son los detalles del feed de Visa?',
                        processorLabel: 'ID de procesador',
                        bankLabel: 'ID de la institución financiera (banco)',
                        companyLabel: 'ID de empresa',
                        helpLabel: '¿Dónde encuentro estos ID?',
                    },
                    gl1025: {
                        title: `¿Cuál es el nombre del archivo de entrega de Amex?`,
                        fileNameLabel: 'Nombre del archivo de entrega',
                        helpLabel: '¿Dónde encuentro el nombre del archivo de entrega?',
                    },
                    cdf: {
                        title: `¿Cuál es el ID de distribución de Mastercard?`,
                        distributionLabel: 'ID de distribución',
                        helpLabel: '¿Dónde encuentro el ID de distribución?',
                    },
                },
                amexCorporate: 'Selecciona esto si en la parte frontal de tus tarjetas dice «Corporate»',
                amexBusiness: 'Selecciona esto si en la parte frontal de tus tarjetas dice «Business»',
                amexPersonal: 'Selecciona esto si tus tarjetas son personales',
                error: {
                    pleaseSelectProvider: 'Selecciona un proveedor de tarjeta antes de continuar',
                    pleaseSelectBankAccount: 'Selecciona una cuenta bancaria antes de continuar',
                    pleaseSelectBank: 'Selecciona un banco antes de continuar',
                    pleaseSelectCountry: 'Selecciona un país antes de continuar',
                    pleaseSelectFeedType: 'Selecciona un tipo de feed antes de continuar',
                },
                exitModal: {
                    title: '¿Algo no funciona?',
                    prompt: 'Notamos que no terminaste de agregar tus tarjetas. Si encontraste algún problema, cuéntanos para que podamos ayudarte a que todo vuelva a la normalidad.',
                    confirmText: 'Informar problema',
                    cancelText: 'Omitir',
                },
                csvColumns: {
                    cardNumber: 'Número de tarjeta',
                    postedDate: 'Fecha',
                    merchant: 'Comercio',
                    amount: 'Importe',
                    currency: 'Moneda',
                    ignore: 'Ignorar',
                    originalTransactionDate: 'Fecha original de la transacción',
                    originalAmount: 'Importe original',
                    originalCurrency: 'Moneda original',
                    comment: 'Comentario',
                    category: 'Categoría',
                    tag: 'Etiqueta',
                },
                csvErrors: {
                    requiredColumns: (missingColumns: string) => `Asigna una columna a cada uno de los atributos: ${missingColumns}.`,
                    duplicateColumns: (duplicateColumn: string) => `¡Ups! Has asignado un solo campo («${duplicateColumn}») a varias columnas. Revísalo y vuelve a intentarlo.`,
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: 'Último día del mes',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: 'Último día hábil del mes',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'Día personalizado del mes',
            },
            assign: 'Asignar',
            assignCard: 'Asignar tarjeta',
            findCard: 'Buscar tarjeta',
            cardNumber: 'Número de tarjeta',
            commercialFeed: 'Flujo comercial',
            feedName: (feedName: string) => `Tarjetas ${feedName}`,
            deletedFeed: 'Feed eliminado',
            deletedCard: 'Tarjeta eliminada',
            directFeed: 'Conexión directa',
            whoNeedsCardAssigned: '¿Quién necesita que se le asigne una tarjeta?',
            chooseTheCardholder: 'Elige a la persona titular de la tarjeta',
            chooseCard: 'Elige una tarjeta',
            chooseCardFor: (assignee: string) =>
                `Elige una tarjeta para <strong>${assignee}</strong>. ¿No encuentras la tarjeta que buscas? <concierge-link>Háznoslo saber.</concierge-link>`,
            noActiveCards: 'No hay tarjetas activas en este feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>O puede que algo esté fallando. En cualquier caso, si tienes alguna pregunta, solo <concierge-link>contacta con Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Elige una fecha de inicio de transacción',
            startDateDescription: 'Elige tu fecha de inicio de importación. Sincronizaremos todas las transacciones desde esa fecha en adelante.',
            editStartDateDescription:
                'Elige una nueva fecha de inicio de transacciones. Sincronizaremos todas las transacciones desde esa fecha en adelante, excluyendo las que ya hayamos importado.',
            fromTheBeginning: 'Desde el principio',
            customStartDate: 'Fecha de inicio personalizada',
            customCloseDate: 'Fecha de cierre personalizada',
            letsDoubleCheck: 'Verifiquemos que todo se vea bien.',
            confirmationDescription: 'Comenzaremos a importar las transacciones de inmediato.',
            card: 'Tarjeta',
            cardName: 'Nombre de la tarjeta',
            brokenConnectionError:
                '<rbr>La conexión del flujo de la tarjeta está interrumpida. Por favor, <a href="#">inicia sesión en tu banco</a> para que podamos restablecer la conexión.</rbr>',
            assignedCard: (assignee: string, link: string) => `asignó un(a) ${link} a ${assignee}. Las transacciones importadas aparecerán en este chat.`,
            companyCard: 'tarjeta de empresa',
            chooseCardFeed: 'Elegir fuente de tarjeta',
            ukRegulation:
                'Expensify Limited es un agente de Plaid Financial Ltd., una institución de pago autorizada y regulada por la Financial Conduct Authority según las Payment Services Regulations 2017 (Número de referencia de la entidad: 804718). Plaid te proporciona servicios regulados de información de cuentas a través de Expensify Limited como su agente.',
            assignCardFailedError: 'Error al asignar la tarjeta.',
            unassignCardFailedError: 'Error al desasignar la tarjeta.',
            cardAlreadyAssignedError: 'Esta tarjeta ya está asignada a una persona usuaria en otro espacio de trabajo.',
            importTransactions: {
                title: 'Importar transacciones desde archivo',
                description: 'Ajusta la configuración de tu archivo que se aplicará al importarlo.',
                cardDisplayName: 'Nombre en la tarjeta',
                currency: 'Moneda',
                transactionsAreReimbursable: 'Las transacciones son reembolsables',
                flipAmountSign: 'Cambiar signo del importe',
                importButton: 'Importar transacciones',
            },
            assignNewCards: {
                title: 'Asignar nuevas tarjetas',
                description: 'Obtén las tarjetas más recientes para asignar desde tu banco',
            },
        },
        expensifyCard: {
            issueAndManageCards: 'Emite y gestiona tus tarjetas Expensify',
            getStartedIssuing: 'Empieza emitiendo tu primera tarjeta virtual o física.',
            verificationInProgress: 'Verificación en curso...',
            verifyingTheDetails: 'Estamos verificando algunos detalles. Concierge te avisará cuando las Expensify Cards estén listas para emitir.',
            disclaimer:
                'La tarjeta comercial Expensify Visa® es emitida por The Bancorp Bank, N.A., miembro de la FDIC, de conformidad con una licencia de Visa U.S.A. Inc. y puede no ser aceptada en todos los comercios que aceptan tarjetas Visa. Apple® y el logotipo de Apple® son marcas comerciales de Apple Inc., registradas en EE. UU. y otros países. App Store es una marca de servicio de Apple Inc. Google Play y el logotipo de Google Play son marcas comerciales de Google LLC.',
            euUkDisclaimer:
                'Las tarjetas proporcionadas a residentes del EEE son emitidas por Transact Payments Malta Limited y las tarjetas proporcionadas a residentes del Reino Unido son emitidas por Transact Payments Limited en virtud de una licencia de Visa Europe Limited. Transact Payments Malta Limited está debidamente autorizada y regulada por la Autoridad de Servicios Financieros de Malta como Institución Financiera en virtud de la Ley de Instituciones Financieras de 1994. Número de registro C 91879. Transact Payments Limited está autorizada y regulada por la Comisión de Servicios Financieros de Gibraltar.',
            issueCard: 'Emitir tarjeta',
            exportAsCSV: 'Exportar como CSV',
            csvColumnType: 'Tipo',
            csvColumnLimitType: 'Tipo de límite',
            csvColumnLimit: 'Límite',
            findCard: 'Buscar tarjeta',
            newCard: 'Nueva tarjeta',
            name: 'Nombre',
            lastFour: 'Últimos 4',
            limit: 'Límite',
            currentBalance: 'Saldo actual',
            currentBalanceDescription: 'El saldo actual es la suma de todas las transacciones registradas de la Expensify Card que han ocurrido desde la última fecha de liquidación.',
            balanceWillBeSettledOn: (settlementDate: string) => `El saldo se liquidará el ${settlementDate}`,
            settleBalance: 'Liquidar saldo',
            cardLimit: 'Límite de la tarjeta',
            remainingLimit: 'Límite restante',
            requestLimitIncrease: 'Solicitar aumento de límite',
            remainingLimitDescription:
                'Tenemos en cuenta varios factores al calcular tu límite restante: tu antigüedad como cliente, la información relacionada con tu negocio que proporcionaste durante el registro y el efectivo disponible en la cuenta bancaria de tu empresa. Tu límite restante puede fluctuar a diario.',
            earnedCashback: 'Reembolso en efectivo',
            earnedCashbackDescription: 'El saldo de reembolsos en efectivo se basa en el gasto mensual liquidado de la Expensify Card en tu espacio de trabajo.',
            issueNewCard: 'Emitir nueva tarjeta',
            finishSetup: 'Finalizar configuración',
            chooseBankAccount: 'Elegir cuenta bancaria',
            chooseExistingBank: 'Elige una cuenta bancaria empresarial existente para pagar el saldo de tu Expensify Card o agrega una nueva cuenta bancaria',
            accountEndingIn: 'Cuenta que termina en',
            addNewBankAccount: 'Agregar una nueva cuenta bancaria',
            settlementAccount: 'Cuenta de liquidación',
            settlementAccountDescription: 'Elige una cuenta para pagar el saldo de tu tarjeta Expensify.',
            settlementAccountInfo: (reconciliationAccountSettingsLink: string, accountNumber: string) =>
                `Asegúrate de que esta cuenta coincida con tu <a href="${reconciliationAccountSettingsLink}">cuenta de conciliación</a> (${accountNumber}) para que la conciliación continua funcione correctamente.`,
            settlementFrequency: 'Frecuencia de liquidación',
            settlementFrequencyDescription: 'Elige con qué frecuencia pagarás el saldo de tu Expensify Card.',
            settlementFrequencyInfo: 'Si quieres cambiar a la liquidación mensual, tendrás que conectar tu cuenta bancaria mediante Plaid y tener un historial de saldo positivo de 90 días.',
            frequency: {
                daily: 'Diario',
                monthly: 'Mensual',
            },
            cardDetails: 'Detalles de la tarjeta',
            cardPending: ({name}: {name: string}) => `La tarjeta está pendiente actualmente y se emitirá una vez que se valide la cuenta de ${name}.`,
            virtual: 'Virtual',
            physical: 'Físico',
            deactivate: 'Desactivar tarjeta',
            changeCardLimit: 'Cambiar límite de tarjeta',
            changeLimit: 'Cambiar límite',
            smartLimitWarning: (limit: number | string) =>
                `Si cambias el límite de esta tarjeta a ${limit}, se rechazarán las nuevas transacciones hasta que apruebes más gastos en la tarjeta.`,
            monthlyLimitWarning: (limit: number | string) => `Si cambias el límite de esta tarjeta a ${limit}, las nuevas transacciones serán rechazadas hasta el próximo mes.`,
            fixedLimitWarning: (limit: number | string) => `Si cambias el límite de esta tarjeta a ${limit}, se rechazarán las nuevas transacciones.`,
            changeCardLimitType: 'Cambiar tipo de límite de tarjeta',
            changeLimitType: 'Cambiar tipo de límite',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `Si cambias el tipo de límite de esta tarjeta a Límite inteligente, las nuevas transacciones se rechazarán porque ya se ha alcanzado el límite sin aprobar de ${limit}.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `Si cambias el tipo de límite de esta tarjeta a Mensual, se rechazarán las nuevas transacciones porque ya se ha alcanzado el límite mensual de ${limit}.`,
            addShippingDetails: 'Agregar detalles de envío',
            issuedCard: (assignee: string) => `emitió una Expensify Card a ${assignee}. La tarjeta llegará en 2-3 días hábiles.`,
            issuedCardNoShippingDetails: (assignee: string) => `emitió una Expensify Card a ${assignee}. La tarjeta se enviará una vez que se confirmen los datos de envío.`,
            issuedCardVirtual: (assignee: string, link: string) => `emitió una Tarjeta virtual de Expensify a ${assignee}. El/La ${link} se puede usar de inmediato.`,
            addedShippingDetails: (assignee: string) => `${assignee} agregó los detalles de envío. La Tarjeta Expensify llegará en 2-3 días hábiles.`,
            replacedCard: (assignee: string) => `${assignee} reemplazó su tarjeta Expensify. La nueva tarjeta llegará en 2-3 días hábiles.`,
            replacedVirtualCard: (assignee: string, link: string) => `¡${assignee} reemplazó su tarjeta virtual de Expensify! El/la ${link} se puede usar de inmediato.`,
            card: 'tarjeta',
            replacementCard: 'tarjeta de reemplazo',
            verifyingHeader: 'Verificando',
            bankAccountVerifiedHeader: 'Cuenta bancaria verificada',
            verifyingBankAccount: 'Verificando cuenta bancaria...',
            verifyingBankAccountDescription: 'Espera mientras confirmamos que esta cuenta se pueda usar para emitir Tarjetas Expensify.',
            bankAccountVerified: '¡Cuenta bancaria verificada!',
            bankAccountVerifiedDescription: 'Ahora puedes emitir Expensify Cards a las personas de tu espacio de trabajo.',
            oneMoreStep: 'Un paso más...',
            oneMoreStepDescription: 'Parece que necesitamos verificar tu cuenta bancaria manualmente. Ve a Concierge, donde te esperan tus instrucciones.',
            gotIt: 'Entendido',
            goToConcierge: 'Ir a Concierge',
        },
        categories: {
            deleteCategories: 'Eliminar categorías',
            deleteCategoriesPrompt: '¿Seguro que quieres eliminar estas categorías?',
            deleteCategory: 'Eliminar categoría',
            deleteCategoryPrompt: '¿Seguro que quieres eliminar esta categoría?',
            disableCategories: 'Desactivar categorías',
            disableCategory: 'Desactivar categoría',
            enableCategories: 'Habilitar categorías',
            enableCategory: 'Habilitar categoría',
            defaultSpendCategories: 'Categorías de gasto predeterminadas',
            spendCategoriesDescription: 'Personaliza cómo se categoriza el gasto por comerciante en las transacciones con tarjeta de crédito y los recibos escaneados.',
            deleteFailureMessage: 'Se produjo un error al eliminar la categoría, inténtalo de nuevo por favor',
            categoryName: 'Nombre de la categoría',
            requiresCategory: 'Les miembros deben categorizar todos los gastos',
            needCategoryForExportToIntegration: (connectionName: string) => `Todos los gastos deben estar categorizados para poder exportarlos a ${connectionName}.`,
            subtitle: 'Obtén una mejor visión general de en qué se está gastando el dinero. Usa nuestras categorías predeterminadas o agrega las tuyas.',
            emptyCategories: {
                title: 'No has creado ninguna categoría',
                subtitle: 'Añade una categoría para organizar tus gastos.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Tus categorías se están importando actualmente desde una conexión de contabilidad. Dirígete a <a href="${accountingPageURL}">contabilidad</a> para hacer cualquier cambio.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Se produjo un error al actualizar la categoría, inténtalo de nuevo',
            createFailureMessage: 'Ocurrió un error al crear la categoría, inténtalo de nuevo por favor',
            addCategory: 'Agregar categoría',
            editCategory: 'Editar categoría',
            editCategories: 'Editar categorías',
            findCategory: 'Buscar categoría',
            categoryRequiredError: 'El nombre de la categoría es obligatorio',
            existingCategoryError: 'Ya existe una categoría con este nombre',
            invalidCategoryName: 'Nombre de categoría no válido',
            importedFromAccountingSoftware: 'Las siguientes categorías se importan desde tu',
            payrollCode: 'Código de nómina',
            updatePayrollCodeFailureMessage: 'Se produjo un error al actualizar el código de nómina, inténtalo de nuevo por favor',
            glCode: 'Código GL',
            updateGLCodeFailureMessage: 'Ocurrió un error al actualizar el código GL, por favor inténtalo de nuevo',
            importCategories: 'Importar categorías',
            cannotDeleteOrDisableAllCategories: {
                title: 'No se pueden eliminar o desactivar todas las categorías',
                description: `Al menos una categoría debe permanecer habilitada porque tu espacio de trabajo requiere categorías.`,
            },
        },
        moreFeatures: {
            subtitle: 'Usa los interruptores de abajo para activar más funciones a medida que creces. Cada función aparecerá en el menú de navegación para seguir personalizándola.',
            spendSection: {
                title: 'Gasto',
                subtitle: 'Habilita funciones que te ayuden a escalar tu equipo.',
            },
            manageSection: {
                title: 'Gestionar',
                subtitle: 'Agrega controles que ayuden a mantener los gastos dentro del presupuesto.',
            },
            earnSection: {
                title: 'Obtener',
                subtitle: 'Optimiza tus ingresos y cobra más rápido.',
            },
            organizeSection: {
                title: 'Organizar',
                subtitle: 'Agrupa y analiza los gastos, registra cada impuesto pagado.',
            },
            integrateSection: {
                title: 'Integrar',
                subtitle: 'Conecta Expensify con productos financieros populares.',
            },
            distanceRates: {
                title: 'Tarifas por distancia',
                subtitle: 'Añade, actualiza y aplica tarifas.',
            },
            perDiem: {
                title: 'Viáticos',
                subtitle: 'Establece tasas de viáticos para controlar el gasto diario de las personas empleadas.',
            },
            travel: {
                title: 'Viaje',
                subtitle: 'Reserva, gestiona y concilia todos tus viajes de negocios.',
                getStarted: {
                    title: 'Empieza con Expensify Travel',
                    subtitle: 'Solo necesitamos algunos datos más sobre tu empresa y estarás listo para despegar.',
                    ctaText: 'Vamos',
                },
                reviewingRequest: {
                    title: 'Haz las maletas, ya tenemos tu solicitud...',
                    subtitle: 'Actualmente estamos revisando tu solicitud para habilitar Expensify Travel. No te preocupes, te avisaremos cuando esté listo.',
                    ctaText: 'Solicitud enviada',
                },
                bookOrManageYourTrip: {
                    title: 'Reserva de viaje',
                    subtitle: '¡Felicitaciones! Ya estás listo para reservar y gestionar viajes en este espacio de trabajo.',
                    ctaText: 'Gestionar viajes',
                },
                settings: {
                    autoAddTripName: {
                        title: 'Agregar nombres de viaje a los gastos',
                        subtitle: 'Añade automáticamente los nombres de los viajes a las descripciones de gastos para los viajes reservados en Expensify.',
                    },
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: 'Reserva de viaje',
                        subtitle: '¡Felicitaciones! Ya estás listo para reservar y gestionar viajes en este espacio de trabajo.',
                        manageTravelLabel: 'Gestionar viajes',
                    },
                    centralInvoicingSection: {
                        title: 'Facturación centralizada',
                        subtitle: 'Centraliza todos los gastos de viaje en una factura mensual en lugar de pagar en el momento de la compra.',
                        learnHow: 'Aprende cómo.',
                        subsections: {
                            currentTravelSpendLabel: 'Gasto de viaje actual',
                            currentTravelSpendPaymentQueued: (amount: string) => `El pago de ${amount} está en cola y se procesará pronto.`,
                            currentTravelSpendCta: 'Pagar saldo',
                            currentTravelLimitLabel: 'Límite de viaje actual',
                            settlementAccountLabel: 'Cuenta de liquidación',
                            settlementFrequencyLabel: 'Frecuencia de liquidación',
                            settlementFrequencyDescription:
                                'Con qué frecuencia Expensify retirará fondos de tu cuenta bancaria empresarial para liquidar las transacciones recientes de Expensify Travel.',
                            monthlySpendLimitLabel: 'Límite de gasto mensual por miembro',
                            monthlySpendLimitDescription: 'El monto máximo que cada miembro puede gastar en viajes por mes.',
                            reduceLimitTitle: '¿Reducir el límite de gastos de viaje?',
                            reduceLimitWarning: 'Si reduces el límite, las personas que ya hayan gastado más de este monto no podrán hacer nuevas reservas de viaje hasta el próximo mes.',
                            provisioningError:
                                'No pudimos aprovisionar a algunos miembros de tu espacio de trabajo para la facturación central. Inténtalo de nuevo más tarde o comunícate con Concierge para obtener ayuda.',
                        },
                    },
                    disableModal: {
                        title: '¿Desactivar la facturación de viajes?',
                        body: 'Es posible que las próximas reservas de hotel y alquiler de coche deban volver a reservarse con un método de pago diferente para evitar la cancelación.',
                        confirm: 'Apagar',
                    },
                    outstandingBalanceModal: {
                        title: 'No se puede desactivar la facturación de viajes',
                        body: 'Todavía tienes un saldo de viaje pendiente. Primero paga tu saldo.',
                        confirm: 'Entendido',
                    },
                    payBalanceModal: {
                        title: (amount: string) => `¿Pagar el saldo de ${amount}?`,
                        body: 'El pago se pondrá en cola y se procesará poco después. Esta acción no se puede deshacer una vez iniciada.',
                    },
                    exportToPDF: 'Exportar a PDF',
                    exportToCSV: 'Exportar a CSV',
                    selectDateRangeError: 'Selecciona un intervalo de fechas para exportar',
                    invalidDateRangeError: 'La fecha de inicio debe ser anterior a la fecha de fin',
                    enabled: '¡Facturación centralizada activada!',
                    enabledDescription: 'Todo el gasto de viajes en este espacio de trabajo ahora se centralizará en una factura mensual.',
                },
                personalDetailsDescription: 'Para reservar viajes, ingresa tu nombre legal tal como aparece en tu documento de identidad emitido por el gobierno.',
            },
            expensifyCard: {
                title: 'Tarjeta Expensify',
                subtitle: 'Obtén información y controla los gastos.',
                disableCardTitle: 'Desactivar tarjeta Expensify',
                disableCardPrompt: 'No puedes desactivar la Expensify Card porque ya está en uso. Ponte en contacto con Concierge para conocer los siguientes pasos.',
                disableCardButton: 'Chatear con Concierge',
                feed: {
                    title: 'Obtén la tarjeta Expensify',
                    subTitle: 'Agiliza los gastos de tu negocio y ahorra hasta un 50 % en tu factura de Expensify, además:',
                    features: {
                        cashBack: 'Reembolso en efectivo en cada compra en EE. UU.',
                        unlimited: 'Tarjetas virtuales ilimitadas',
                        spend: 'Controles de gasto y límites personalizados',
                    },
                    ctaTitle: 'Emitir nueva tarjeta',
                },
            },
            companyCards: {
                title: 'Tarjetas de empresa',
                subtitle: 'Conecta las tarjetas que ya tienes.',
                feed: {
                    title: 'Trae tus propias tarjetas (BYOC)',
                    subtitle: 'Vincula las tarjetas que ya tienes para importar automáticamente las transacciones, conciliar los recibos y realizar la conciliación.',
                    features: {
                        support: 'Conecta tarjetas de más de 10,000 bancos',
                        assignCards: 'Vincula las tarjetas existentes de tu equipo',
                        automaticImport: 'Importaremos las transacciones automáticamente',
                    },
                },
                bankConnectionError: 'Problema de conexión bancaria',
                connectWithPlaid: 'conectar vía Plaid',
                connectWithExpensifyCard: 'prueba la Tarjeta Expensify.',
                bankConnectionDescription: `Vuelve a intentar agregar tus tarjetas. De lo contrario, puedes`,
                disableCardTitle: 'Desactivar tarjetas de empresa',
                disableCardPrompt: 'No puedes desactivar las tarjetas de empresa porque esta función está en uso. Comunícate con Concierge para conocer los próximos pasos.',
                disableCardButton: 'Chatear con Concierge',
                cardDetails: 'Detalles de la tarjeta',
                cardNumber: 'Número de tarjeta',
                cardholder: 'Titular de la tarjeta',
                cardName: 'Nombre de la tarjeta',
                allCards: 'Todas las tarjetas',
                assignedCards: 'Asignada',
                unassignedCards: 'Sin asignar',
                integrationExport: (integration: string, type?: string) => (integration && type ? `exportación de ${integration} ${type.toLowerCase()}` : `Exportación de ${integration}`),
                integrationExportTitleXero: (integration: string) => `Elige la cuenta de ${integration} a la que se deben exportar las transacciones.`,
                integrationExportTitle: (integration: string, exportPageLink: string) =>
                    `Elige la cuenta de ${integration} donde se deben exportar las transacciones. Selecciona una <a href="${exportPageLink}">opción de exportación</a> diferente para cambiar las cuentas disponibles.`,
                lastUpdated: 'Última actualización',
                transactionStartDate: 'Fecha de inicio de la transacción',
                updateCard: 'Actualizar tarjeta',
                unassignCard: 'Desasignar tarjeta',
                unassign: 'Quitar asignación',
                unassignCardDescription: 'Al desasignar esta tarjeta se eliminarán todas las transacciones no enviadas.',
                assignCard: 'Asignar tarjeta',
                removeCard: 'Eliminar tarjeta',
                remove: 'Eliminar',
                removeCardDescription: 'Eliminar esta tarjeta borrará todas las transacciones no enviadas.',
                cardFeedName: 'Nombre del feed de tarjeta',
                cardFeedNameDescription: 'Asigna un nombre único al feed de la tarjeta para poder distinguirlo de los demás.',
                cardFeedTransaction: 'Eliminar transacciones',
                cardFeedTransactionDescription: 'Elige si las personas titulares de tarjeta pueden eliminar transacciones de tarjeta. Las nuevas transacciones seguirán estas reglas.',
                cardFeedRestrictDeletingTransaction: 'Restringir la eliminación de transacciones',
                cardFeedAllowDeletingTransaction: 'Permitir eliminar transacciones',
                removeCardFeed: 'Eliminar conexión de tarjeta',
                removeCardFeedTitle: (feedName: string) => `Eliminar el feed ${feedName}`,
                removeCardFeedDescription: '¿Seguro que quieres eliminar esta fuente de tarjetas? Esto desasignará todas las tarjetas.',
                error: {
                    feedNameRequired: 'El nombre del feed de tarjeta es obligatorio',
                    statementCloseDateRequired: 'Selecciona una fecha de cierre de estado de cuenta.',
                },
                corporate: 'Restringir la eliminación de transacciones',
                personal: 'Permitir eliminar transacciones',
                setFeedNameDescription: 'Asigna un nombre único al feed de la tarjeta para poder distinguirlo de los demás',
                setTransactionLiabilityDescription:
                    'Cuando esté habilitado, las personas titulares de la tarjeta podrán eliminar transacciones de tarjeta. Las nuevas transacciones seguirán esta regla.',
                emptyAddedFeedTitle: 'No hay tarjetas en este feed',
                emptyAddedFeedDescription: 'Asegúrate de que haya tarjetas en el feed de tarjetas de tu banco.',
                pendingFeedTitle: `Estamos revisando tu solicitud...`,
                pendingFeedDescription: `Actualmente estamos revisando los detalles de tu feed. Cuando terminemos, nos pondremos en contacto contigo por`,
                pendingBankTitle: 'Revisa la ventana de tu navegador',
                pendingBankDescription: (bankName: string) => `Conéctate a ${bankName} en la ventana del navegador que se acaba de abrir. Si no se abrió ninguna,`,
                pendingBankLink: 'haz clic aquí',
                giveItNameInstruction: 'Dale a la tarjeta un nombre que la distinga de las demás.',
                updating: 'Actualizando...',
                neverUpdated: 'Nunca',
                noAccountsFound: 'No se encontraron cuentas',
                defaultCard: 'Tarjeta predeterminada',
                downgradeTitle: `No se puede cambiar el espacio de trabajo a un plan inferior`,
                downgradeSubTitle: `Este espacio de trabajo no se puede cambiar a un plan inferior porque hay varias fuentes de tarjetas conectadas (excepto las Expensify Cards). Por favor, <a href="#">mantén solo una fuente de tarjeta</a> para continuar.`,
                noAccountsFoundDescription: (connection: string) => `Agrega la cuenta en ${connection} y sincroniza la conexión de nuevo`,
                expensifyCardBannerTitle: 'Obtén la tarjeta Expensify',
                expensifyCardBannerSubtitle:
                    'Disfruta de reembolsos en efectivo en cada compra en EE. UU., hasta un 50% de descuento en tu factura de Expensify, tarjetas virtuales ilimitadas y mucho más.',
                expensifyCardBannerLearnMoreButton: 'Más información',
                statementCloseDateTitle: 'Fecha de cierre del estado de cuenta',
                statementCloseDateDescription: 'Indícanos cuándo cierra el estado de cuenta de tu tarjeta y crearemos un estado de cuenta coincidente en Expensify.',
            },
            workflows: {
                title: 'Flujos de trabajo',
                subtitle: 'Configura cómo se aprueba y se paga el gasto.',
                disableApprovalPrompt:
                    'Las Expensify Cards de este espacio de trabajo dependen actualmente de la aprobación para definir sus Smart Limits. Modifica los tipos de límite de cualquier Expensify Card con Smart Limits antes de desactivar las aprobaciones.',
            },
            invoices: {
                title: 'Facturas',
                subtitle: 'Enviar y recibir facturas.',
            },
            categories: {
                title: 'Categorías',
                subtitle: 'Controla y organiza los gastos.',
            },
            tags: {
                title: 'Etiquetas',
                subtitle: 'Clasifica costos y registra gastos facturables.',
            },
            taxes: {
                title: 'Impuestos',
                subtitle: 'Documenta y recupera los impuestos aplicables.',
            },
            reportFields: {
                title: 'Campos del informe',
                subtitle: 'Configura campos personalizados para los gastos.',
            },
            connections: {
                title: 'Contabilidad',
                subtitle: 'Sincroniza tu plan de cuentas y más.',
            },
            receiptPartners: {
                title: 'Socios de recibos',
                subtitle: 'Importar recibos automáticamente.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'No tan rápido...',
                featureEnabledText: 'Para activar o desactivar esta función, debes cambiar la configuración de importación contable.',
                disconnectText: 'Para desactivar la contabilidad, deberás desconectar la conexión contable de tu espacio de trabajo.',
                manageSettings: 'Administrar configuración',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Desconectar Uber',
                disconnectText: 'Para desactivar esta función, primero desconecta la integración de Uber for Business.',
                description: '¿Estás seguro de que quieres desconectar esta integración?',
                confirmText: 'Entendido',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'No tan rápido...',
                featureEnabledText:
                    'Las Expensify Cards de este espacio de trabajo dependen de flujos de aprobación para definir sus Smart Limits.\n\nCambia los tipos de límite de cualquier tarjeta con Smart Limits antes de desactivar los flujos de trabajo.',
                confirmText: 'Ir a Expensify Cards',
            },
            rules: {
                title: 'Reglas',
                subtitle: 'Exige comprobantes, marca gastos elevados y más.',
            },
            timeTracking: {
                title: 'Hora',
                subtitle: 'Establece una tarifa horaria facturable para el seguimiento del tiempo.',
                defaultHourlyRate: 'Tarifa horaria predeterminada',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Ejemplos:',
            customReportNamesSubtitle: `<muted-text>Personaliza los títulos de los informes usando nuestras <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensas fórmulas</a>.</muted-text>`,
            customNameTitle: 'Título de informe predeterminado',
            customNameDescription: `Elige un nombre personalizado para los informes de gastos usando nuestras <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">fórmulas avanzadas</a>.`,
            customNameInputLabel: 'Nombre',
            customNameEmailPhoneExample: 'Correo electrónico o teléfono de la persona miembro: {report:submit:from}',
            customNameStartDateExample: 'Fecha de inicio del informe: {report:startdate}',
            customNameWorkspaceNameExample: 'Nombre del workspace: {report:workspacename}',
            customNameReportIDExample: 'ID del informe: {report:id}',
            customNameTotalExample: 'Total: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Evitar que las personas miembros cambien los títulos personalizados de los informes',
        },
        reportFields: {
            addField: 'Agregar campo',
            delete: 'Eliminar campo',
            deleteFields: 'Eliminar campos',
            findReportField: 'Buscar campo de informe',
            deleteConfirmation: '¿Seguro que quieres eliminar este campo de informe?',
            deleteFieldsConfirmation: '¿Seguro que quieres eliminar estos campos de informe?',
            emptyReportFields: {
                title: 'No has creado ningún campo de informe',
                subtitle: 'Agrega un campo personalizado (texto, fecha o lista desplegable) que aparezca en los informes.',
            },
            subtitle: 'Los campos del informe se aplican a todos los gastos y pueden ser útiles cuando quieres solicitar información adicional.',
            disableReportFields: 'Desactivar campos de informe',
            disableReportFieldsConfirmation: '¿Estás seguro/a? Los campos de texto y fecha se eliminarán y las listas se deshabilitarán.',
            importedFromAccountingSoftware: 'Los campos de informe a continuación se importan desde tu',
            textType: 'Texto',
            dateType: 'Fecha',
            dropdownType: 'Lista',
            formulaType: 'Fórmula',
            textAlternateText: 'Añade un campo para introducir texto libre.',
            dateAlternateText: 'Agregar un calendario para seleccionar la fecha.',
            dropdownAlternateText: 'Agrega una lista de opciones para elegir.',
            formulaAlternateText: 'Agrega un campo de fórmula.',
            nameInputSubtitle: 'Elige un nombre para el campo de informe.',
            typeInputSubtitle: 'Elige qué tipo de campo de informe usar.',
            initialValueInputSubtitle: 'Introduce un valor inicial para mostrar en el campo del informe.',
            listValuesInputSubtitle: 'Estos valores aparecerán en el menú desplegable del campo del informe. Los valores habilitados pueden ser seleccionados por los miembros.',
            listInputSubtitle: 'Estos valores aparecerán en la lista de campos de tu informe. Los valores habilitados podrán ser seleccionados por las personas miembros.',
            deleteValue: 'Eliminar valor',
            deleteValues: 'Eliminar valores',
            disableValue: 'Desactivar valor',
            disableValues: 'Desactivar valores',
            enableValue: 'Habilitar valor',
            enableValues: 'Habilitar valores',
            emptyReportFieldsValues: {
                title: 'No has creado ningún valor de lista',
                subtitle: 'Agrega valores personalizados para que aparezcan en los informes.',
            },
            deleteValuePrompt: '¿Seguro que quieres eliminar este valor de la lista?',
            deleteValuesPrompt: '¿Seguro que quieres eliminar estos valores de la lista?',
            listValueRequiredError: 'Introduce un nombre para el valor de la lista',
            existingListValueError: 'Ya existe un valor de lista con este nombre',
            editValue: 'Editar valor',
            listValues: 'Enumerar valores',
            addValue: 'Añadir valor',
            existingReportFieldNameError: 'Ya existe un campo de informe con este nombre',
            reportFieldNameRequiredError: 'Introduce un nombre de campo de informe',
            reportFieldTypeRequiredError: 'Elige un tipo de campo de informe',
            circularReferenceError: 'Este campo no puede hacer referencia a sí mismo. Actualízalo, por favor.',
            unsupportedFormulaValueError: ({value}: UnsupportedFormulaValueErrorParams) => `Campo de fórmula ${value} no reconocido`,
            reportFieldInitialValueRequiredError: 'Elige un valor inicial para el campo del informe',
            genericFailureMessage: 'Se produjo un error al actualizar el campo del informe. Inténtalo de nuevo.',
        },
        tags: {
            tagName: 'Nombre de etiqueta',
            requiresTag: 'Los miembros deben etiquetar todos los gastos',
            trackBillable: 'Registrar gastos facturables',
            customTagName: 'Nombre de etiqueta personalizada',
            enableTag: 'Habilitar etiqueta',
            enableTags: 'Activar etiquetas',
            requireTag: 'Etiqueta obligatoria',
            requireTags: 'Etiquetas obligatorias',
            notRequireTags: 'No exigir',
            disableTag: 'Desactivar etiqueta',
            disableTags: 'Desactivar etiquetas',
            addTag: 'Agregar etiqueta',
            editTag: 'Editar etiqueta',
            editTags: 'Editar etiquetas',
            findTag: 'Buscar etiqueta',
            subtitle: 'Las etiquetas añaden formas más detalladas de clasificar los costos.',
            subtitleWithDependentTags: (importSpreadsheetLink: string) =>
                `<muted-text>Las etiquetas añaden formas más detalladas de clasificar los costos. Estás usando <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">etiquetas dependientes</a>. Puedes <a href="${importSpreadsheetLink}">volver a importar una hoja de cálculo</a> para actualizar tus etiquetas.</muted-text>`,
            emptyTags: {
                title: 'No has creado ninguna etiqueta',
                subtitle: 'Agrega una etiqueta para seguir proyectos, ubicaciones, departamentos y más.',
                subtitleHTML: `<muted-text><centered-text>Añade etiquetas para hacer seguimiento de proyectos, ubicaciones, departamentos y más. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Más información</a> sobre cómo formatear archivos de etiquetas para importarlos.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Tus etiquetas se están importando actualmente desde una conexión contable. Ve a <a href="${accountingPageURL}">contabilidad</a> para hacer cualquier cambio.</centered-text></muted-text>`,
            },
            deleteTag: 'Eliminar etiqueta',
            deleteTags: 'Eliminar etiquetas',
            deleteTagConfirmation: '¿Seguro que quieres eliminar esta etiqueta?',
            deleteTagsConfirmation: '¿Estás seguro de que quieres eliminar estas etiquetas?',
            deleteFailureMessage: 'Se produjo un error al eliminar la etiqueta, inténtalo de nuevo',
            tagRequiredError: 'El nombre de la etiqueta es obligatorio',
            existingTagError: 'Ya existe una etiqueta con este nombre',
            invalidTagNameError: 'El nombre de la etiqueta no puede ser 0. Elige un valor diferente.',
            genericFailureMessage: 'Se produjo un error al actualizar la etiqueta, inténtalo de nuevo',
            importedFromAccountingSoftware: 'Las etiquetas se administran en tu',
            employeesSeeTagsAs: 'Les personas empleadas ven las etiquetas como',
            glCode: 'Código GL',
            updateGLCodeFailureMessage: 'Ocurrió un error al actualizar el código GL, por favor inténtalo de nuevo',
            tagRules: 'Reglas de etiquetas',
            approverDescription: 'Aprobador',
            importTags: 'Importar etiquetas',
            importTagsSupportingText: 'Codifica tus gastos con un solo tipo de etiqueta o con muchas.',
            configureMultiLevelTags: 'Configura tu lista de etiquetas para el etiquetado multinivel.',
            importMultiLevelTagsSupportingText: `Aquí tienes una vista previa de tus etiquetas. Si todo se ve bien, haz clic abajo para importarlas.`,
            importMultiLevelTags: {
                firstRowTitle: 'La primera fila es el título de cada lista de etiquetas',
                independentTags: 'Estas son etiquetas independientes',
                glAdjacentColumn: 'Hay un código GL en la columna adyacente',
            },
            tagLevel: {
                singleLevel: 'Un solo nivel de etiquetas',
                multiLevel: 'Etiquetas multinivel',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Cambiar niveles de etiquetas',
                prompt1: 'Cambiar los niveles de etiquetas borrará todas las etiquetas actuales.',
                prompt2: 'Te sugerimos primero',
                prompt3: 'descargar una copia de seguridad',
                prompt4: 'exportando tus etiquetas.',
                prompt5: 'Más información',
                prompt6: 'sobre los niveles de etiquetas.',
            },
            overrideMultiTagWarning: {
                title: 'Importar etiquetas',
                prompt1: '¿Estás seguro?',
                prompt2: 'Las etiquetas existentes se sobrescribirán, pero puedes',
                prompt3: 'descargar una copia de seguridad',
                prompt4: 'primero.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `Encontramos *${columnCounts} columnas* en tu hoja de cálculo. Selecciona *Nombre* junto a la columna que contiene los nombres de las etiquetas. También puedes seleccionar *Habilitado* junto a la columna que define el estado de las etiquetas.`,
            cannotDeleteOrDisableAllTags: {
                title: 'No se pueden eliminar o desactivar todas las etiquetas',
                description: `Al menos una etiqueta debe permanecer habilitada porque tu espacio de trabajo requiere etiquetas.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'No se pueden hacer todas las etiquetas opcionales',
                description: `Al menos una etiqueta debe seguir siendo obligatoria porque la configuración de tu espacio de trabajo requiere etiquetas.`,
            },
            cannotMakeTagListRequired: {
                title: 'No se puede hacer que la lista de etiquetas sea obligatoria',
                description: 'Solo puedes hacer que una lista de etiquetas sea obligatoria si tu política tiene varios niveles de etiquetas configurados.',
            },
            tagCount: () => ({
                one: '1 día',
                other: (count: number) => `${count} etiquetas`,
            }),
        },
        taxes: {
            subtitle: 'Agrega nombres de impuestos, tasas y establece valores predeterminados.',
            addRate: 'Agregar tarifa',
            workspaceDefault: 'Moneda predeterminada del espacio de trabajo',
            foreignDefault: 'Moneda extranjera predeterminada',
            customTaxName: 'Nombre de impuesto personalizado',
            value: 'Valor',
            taxReclaimableOn: 'Impuesto recuperable en',
            taxRate: 'Tasa de impuesto',
            findTaxRate: 'Encontrar tasa de impuesto',
            error: {
                taxRateAlreadyExists: 'Este nombre de impuesto ya está en uso',
                taxCodeAlreadyExists: 'Este código de impuestos ya está en uso',
                valuePercentageRange: 'Por favor, introduce un porcentaje válido entre 0 y 100',
                customNameRequired: 'Se requiere un nombre de impuesto personalizado',
                deleteFailureMessage: 'Se produjo un error al eliminar la tasa de impuesto. Inténtalo de nuevo o pide ayuda a Concierge.',
                updateFailureMessage: 'Se produjo un error al actualizar la tasa de impuesto. Intenta de nuevo o pide ayuda a Concierge.',
                createFailureMessage: 'Se produjo un error al crear la tasa de impuesto. Inténtalo de nuevo o pide ayuda a Concierge.',
                updateTaxClaimableFailureMessage: 'La parte reembolsable debe ser menor que el importe de la tarifa por distancia',
            },
            deleteTaxConfirmation: '¿Seguro que quieres eliminar este impuesto?',
            deleteMultipleTaxConfirmation: (taxAmount: number) => `¿Seguro que quieres eliminar ${taxAmount} impuestos?`,
            actions: {
                delete: 'Eliminar tarifa',
                deleteMultiple: 'Eliminar tarifas',
                enable: 'Habilitar tarifa',
                disable: 'Desactivar tarifa',
                enableTaxRates: () => ({
                    one: 'Habilitar tarifa',
                    other: 'Habilitar tarifas',
                }),
                disableTaxRates: () => ({
                    one: 'Desactivar tarifa',
                    other: 'Desactivar tarifas',
                }),
            },
            importedFromAccountingSoftware: 'Los impuestos de abajo se importan desde tu',
            taxCode: 'Código de impuestos',
            updateTaxCodeFailureMessage: 'Se produjo un error al actualizar el código de impuestos, inténtalo de nuevo por favor',
        },
        duplicateWorkspace: {
            title: 'Nombra tu nuevo espacio de trabajo',
            selectFeatures: 'Selecciona las funciones para copiar',
            whichFeatures: '¿Qué funciones quieres copiar a tu nuevo espacio de trabajo?',
            confirmDuplicate: '¿Quieres continuar?',
            categories: 'categorías y tus reglas de categorización automática',
            reimbursementAccount: 'cuenta de reembolso',
            welcomeNote: 'Por favor, empieza a usar mi nuevo espacio de trabajo',
            delayedSubmission: 'presentación retrasada',
            merchantRules: 'Reglas de comerciante',
            merchantRulesCount: () => ({
                one: '1 regla de comercio',
                other: (count: number) => `${count} reglas de comercio`,
            }),
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Estás a punto de crear y compartir ${newWorkspaceName ?? ''} con ${totalMembers ?? 0} miembros del espacio de trabajo original.`,
            error: 'Se produjo un error al duplicar tu nuevo espacio de trabajo. Inténtalo de nuevo.',
        },
        emptyWorkspace: {
            title: 'Todavía no hay espacios de trabajo',
            subtitle: 'Crea un espacio de trabajo para gestionar tus gastos, reembolsos y tarjetas corporativas.',
            createAWorkspaceCTA: 'Comenzar',
            features: {
                trackAndCollect: 'Controla y recopila recibos',
                reimbursements: 'Reembolsar a personas empleadas',
                companyCards: 'Administrar tarjetas de la empresa',
            },
            notFound: 'No se encontró ningún espacio de trabajo',
            description: 'Las salas son un excelente lugar para conversar y trabajar con varias personas. Para empezar a colaborar, crea o únete a un espacio de trabajo',
        },
        new: {
            newWorkspace: 'Nuevo espacio de trabajo',
            getTheExpensifyCardAndMore: 'Obtén la Expensify Card y más',
            confirmWorkspace: 'Confirmar espacio de trabajo',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Mi espacio de trabajo de grupo${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: (userName: string, workspaceNumber?: number) => `Espacio de trabajo de ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Ocurrió un error al eliminar a una persona del espacio de trabajo, inténtalo de nuevo',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `¿Seguro que quieres eliminar a ${memberName}?`,
                other: '¿Seguro que quieres eliminar a estas personas integrantes?',
            }),
            removeMembersWarningPrompt: (memberName: string, ownerName: string) =>
                `${memberName} es una persona aprobadora en este espacio de trabajo. Cuando dejes de compartir este espacio de trabajo con esa persona, la reemplazaremos en el flujo de aprobación por la persona propietaria del espacio de trabajo, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Eliminar miembro',
                other: 'Quitar miembros',
            }),
            findMember: 'Buscar miembro',
            removeWorkspaceMemberButtonTitle: 'Quitar del espacio de trabajo',
            removeGroupMemberButtonTitle: 'Quitar del grupo',
            removeRoomMemberButtonTitle: 'Quitar del chat',
            removeMemberPrompt: (memberName: string) => `¿Seguro que quieres eliminar a ${memberName}?`,
            removeMemberTitle: 'Eliminar miembro',
            transferOwner: 'Transferir propiedad',
            makeMember: () => ({
                one: 'Hacer miembro',
                other: 'Convertir en miembros',
            }),
            makeAdmin: () => ({
                one: 'Hacer administrador',
                other: 'Hacer admins',
            }),
            makeAuditor: () => ({
                one: 'Hacer auditor',
                other: 'Crear auditores',
            }),
            selectAll: 'Seleccionar todo',
            error: {
                genericAdd: 'Hubo un problema al agregar a esta persona al espacio de trabajo',
                cannotRemove: 'No puedes eliminarte a ti ni a la persona propietaria del espacio de trabajo',
                genericRemove: 'Hubo un problema al eliminar a esa persona del espacio de trabajo',
            },
            addedWithPrimary: 'Se añadieron algunas personas con sus inicios de sesión principales.',
            invitedBySecondaryLogin: (secondaryLogin: string) => `Agregado por el inicio de sesión secundario ${secondaryLogin}.`,
            workspaceMembersCount: (count: number) => `Total de miembros del espacio de trabajo: ${count}`,
            allMembers: 'Todos los miembros',
            admins: 'Administradores',
            approvers: 'Aprobadores',
            auditors: 'Auditores',
            emptyRoleFilter: {
                title: 'Ningún miembro coincide con este filtro',
                subtitle: 'Invita a un miembro o cambia el filtro de arriba.',
            },
            importMembers: 'Importar miembros',
            removeMemberPromptApprover: (approver: string, workspaceOwner: string) =>
                `Si eliminas a ${approver} de este espacio de trabajo, lo reemplazaremos en el flujo de aprobación con ${workspaceOwner}, la persona propietaria del espacio de trabajo.`,
            removeMemberPromptPendingApproval: (memberName: string) =>
                `${memberName} tiene informes de gastos pendientes de aprobar. Pídele que los apruebe o toma control de sus informes antes de eliminarle del espacio de trabajo.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `No puedes eliminar a ${memberName} de este espacio de trabajo. Define una nueva persona reembolsadora en Flujo de trabajo > Realizar o rastrear pagos y vuelve a intentarlo.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Si quitas a ${memberName} de este espacio de trabajo, lo reemplazaremos como exportador preferido con ${workspaceOwner}, la persona propietaria del espacio de trabajo.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Si quitas a ${memberName} de este espacio de trabajo, lo reemplazaremos como contacto técnico por ${workspaceOwner}, la persona propietaria del espacio de trabajo.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} tiene un informe en procesamiento pendiente de acción. Pídele que complete la acción requerida antes de eliminarlo del espacio de trabajo.`,
        },
        card: {
            getStartedIssuing: 'Empieza emitiendo tu primera tarjeta virtual o física.',
            issueCard: 'Emitir tarjeta',
            issueNewCard: {
                whoNeedsCard: '¿Quién necesita una tarjeta?',
                inviteNewMember: 'Invitar a nueva persona',
                findMember: 'Buscar miembro',
                chooseCardType: 'Elige un tipo de tarjeta',
                physicalCard: 'Tarjeta física',
                physicalCardDescription: 'Ideal para quienes gastan con frecuencia',
                virtualCard: 'Tarjeta virtual',
                virtualCardDescription: 'Instantáneo y flexible',
                chooseLimitType: 'Elige un tipo de límite',
                smartLimit: 'Límite inteligente',
                smartLimitDescription: 'Gasta hasta un cierto monto antes de requerir aprobación',
                monthly: 'Mensual',
                monthlyDescription: 'El límite se renueva mensualmente',
                fixedAmount: 'Monto fijo',
                fixedAmountDescription: 'Gastar hasta alcanzar el límite',
                setLimit: 'Establecer un límite',
                cardLimitError: 'Introduce un monto menor que $21,474,836',
                giveItName: 'Ponle un nombre',
                giveItNameInstruction: 'Hazlo lo suficientemente único para distinguirlo de otras tarjetas. ¡Los casos de uso específicos son aún mejores!',
                cardName: 'Nombre de la tarjeta',
                letsDoubleCheck: 'Verifiquemos que todo se vea bien.',
                willBeReadyToUse: 'Esta tarjeta estará lista para usarla de inmediato.',
                willBeReadyToShip: 'Esta tarjeta estará lista para enviarse de inmediato.',
                cardholder: 'Titular de la tarjeta',
                cardType: 'Tipo de tarjeta',
                limit: 'Límite',
                limitType: 'Tipo de límite',
                disabledApprovalForSmartLimitError: 'Habilita las aprobaciones en <strong>Flujos de trabajo > Agregar aprobaciones</strong> antes de configurar límites inteligentes',
                singleUse: 'De un solo uso',
                singleUseDescription: 'Expira después de una transacción',
                validFrom: 'Válido desde',
                startDate: 'Fecha de inicio',
                endDate: 'Fecha de finalización',
                noExpirationHint: 'Una tarjeta sin fecha de vencimiento no caducará',
                validFromTo: ({startDate, endDate}: {startDate: string; endDate: string}) => `Válido del ${startDate} al ${endDate}`,
                validFromToWithoutText: ({startDate, endDate}: {startDate: string; endDate: string}) => `${startDate} a ${endDate}`,
                combineWithExpiration: 'Combínalo con opciones de vencimiento para un mayor control del gasto',
                enterValidDate: 'Ingresa una fecha válida',
                expirationDate: 'Fecha de vencimiento',
                limitAmount: 'Importe límite',
                setExpiryOptions: 'Configurar opciones de vencimiento',
                setExpiryDate: 'Establecer fecha de vencimiento',
                setExpiryDateDescription: 'La tarjeta vencerá en la fecha indicada en la tarjeta',
                amount: 'Importe',
            },
            deactivateCardModal: {
                deactivate: 'Desactivar',
                deactivateCard: 'Desactivar tarjeta',
                deactivateConfirmation: 'Desactivar esta tarjeta rechazará todas las transacciones futuras y no se podrá deshacer.',
            },
        },
        accounting: {
            settings: 'ajustes',
            title: 'Conexiones',
            subtitle: 'Conéctate a tu sistema contable para clasificar transacciones con tu plan de cuentas, conciliar automáticamente los pagos y mantener tus finanzas sincronizadas.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Chatea con tu especialista de configuración.',
            talkYourAccountManager: 'Chatea con tu gerente de cuenta.',
            talkToConcierge: 'Chatear con Concierge.',
            needAnotherAccounting: '¿Necesitas otro software de contabilidad?',
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
                `Hay un error con una conexión que se ha configurado en Expensify Classic. [Ve a Expensify Classic para solucionar este problema.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: 'Ve a Expensify Classic para administrar tu configuración.',
            setup: 'Conectar',
            lastSync: (relativeDate: string) => `Última sincronización: ${relativeDate}`,
            notSync: 'No sincronizado',
            import: 'Importar',
            export: 'Exportar',
            advanced: 'Avanzado',
            other: 'Otro',
            syncNow: 'Sincronizar ahora',
            disconnect: 'Desconectar',
            reinstall: 'Reinstalar conector',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integración';
                return `Desconectar ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Conectar ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'integración contable'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'No se puede conectar con QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'No se puede conectar con Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'No se puede conectar a NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'No se puede conectar a QuickBooks Desktop';
                    default: {
                        return 'No se puede conectar a la integración';
                    }
                }
            },
            accounts: 'Plan de cuentas',
            taxes: 'Impuestos',
            imported: 'Importado',
            notImported: 'No importado',
            importAsCategory: 'Importado como categorías',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'Importado',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Importado como etiquetas',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Importado',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'No importado',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'No importado',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Importado como campos de informe',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Predeterminado de empleado de NetSuite',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'esta integración';
                return `¿Estás seguro de que quieres desconectar ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `¿Seguro que quieres conectar ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'esta integración contable'}? Esto eliminará cualquier conexión contable existente.`,
            enterCredentials: 'Introduce tus credenciales',
            claimOffer: {
                badgeText: '¡Oferta disponible!',
                xero: {
                    headline: '¡Obtén Xero gratis durante 6 meses!',
                    description:
                        '<muted-text><centered-text>¿Nuevo en Xero? Los clientes de Expensify obtienen 6 meses gratis. Canjea tu oferta a continuación.</centered-text></muted-text>',
                    connectButton: 'Conectar con Xero',
                },
                uber: {
                    headerTitle: 'Uber para Empresas',
                    headline: 'Obtén un 5% de descuento en viajes de Uber',
                    description: `<muted-text><centered-text>Activa Uber for Business a través de Expensify y ahorra un 5% en todos los viajes de negocios hasta junio. <a href="${CONST.UBER_TERMS_LINK}">Se aplican términos.</a></centered-text></muted-text>`,
                    connectButton: 'Conectar con Uber for Business',
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
                            return 'Importar empleados';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Importando cuentas';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Importar clases';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importando ubicaciones';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Procesando datos importados';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Sincronizar informes reembolsados y pagos de facturas';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importar códigos de impuestos';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Comprobando la conexión con QuickBooks Online';
                        case 'quickbooksOnlineImportMain':
                            return 'Importar datos de QuickBooks Online';
                        case 'startingImportXero':
                            return 'Importar datos de Xero';
                        case 'startingImportQBO':
                            return 'Importar datos de QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importar datos de QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importando título';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importando certificado de aprobación';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importando dimensiones';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importando política de guardado';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Aún se están sincronizando los datos con QuickBooks... Asegúrate de que Web Connector esté en ejecución';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Sincronizando datos de QuickBooks Online';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Cargando datos';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Actualizando categorías';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Actualizando clientes/proyectos';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Actualizando la lista de personas';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Actualizando campos del informe';
                        case 'jobDone':
                            return 'Esperando a que se carguen los datos importados';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Sincronizando el plan de cuentas';
                        case 'xeroSyncImportCategories':
                            return 'Sincronizando categorías';
                        case 'xeroSyncImportCustomers':
                            return 'Sincronizando clientes';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Marcar los informes de Expensify como reembolsados';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Marcar facturas y recibos de Xero como pagados';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Sincronizando categorías de seguimiento';
                        case 'xeroSyncImportBankAccounts':
                            return 'Sincronizando cuentas bancarias';
                        case 'xeroSyncImportTaxRates':
                            return 'Sincronizando tipos impositivos';
                        case 'xeroCheckConnection':
                            return 'Comprobando la conexión con Xero';
                        case 'xeroSyncTitle':
                            return 'Sincronizando datos de Xero';
                        case 'netSuiteSyncConnection':
                            return 'Iniciando conexión con NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Importando clientes';
                        case 'netSuiteSyncInitData':
                            return 'Recuperando datos de NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Importar impuestos';
                        case 'netSuiteSyncImportItems':
                            return 'Importando elementos';
                        case 'netSuiteSyncData':
                            return 'Importar datos en Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Sincronizando cuentas';
                        case 'netSuiteSyncCurrencies':
                            return 'Sincronizando divisas';
                        case 'netSuiteSyncCategories':
                            return 'Sincronizando categorías';
                        case 'netSuiteSyncReportFields':
                            return 'Importar datos como campos de informe de Expensify';
                        case 'netSuiteSyncTags':
                            return 'Importar datos como etiquetas de Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Actualizando información de conexión';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Marcar los informes de Expensify como reembolsados';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Marcar las facturas y recibos de NetSuite como pagados';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importando proveedores';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importar listas personalizadas';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importar listas personalizadas';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importando subsidiarias';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importando proveedores';
                        case 'intacctCheckConnection':
                            return 'Comprobando la conexión con Sage Intacct';
                        case 'intacctImportDimensions':
                            return 'Importar dimensiones de Sage Intacct';
                        case 'intacctImportTitle':
                            return 'Importar datos de Sage Intacct';
                        default: {
                            return `Falta la traducción para la etapa: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Exportador preferido',
            exportPreferredExporterNote:
                'La persona exportadora preferida puede ser cualquier administrador del espacio de trabajo, pero también debe ser una persona administradora de dominio si configuras diferentes cuentas de exportación para tarjetas corporativas individuales en Configuración de dominio.',
            exportPreferredExporterSubNote: 'Una vez configurado, la persona exportadora preferida verá los informes para exportar en su cuenta.',
            exportAs: 'Exportar como',
            exportOutOfPocket: 'Exportar gastos de bolsillo como',
            exportCompanyCard: 'Exportar gastos de tarjeta de empresa como',
            exportDate: 'Fecha de exportación',
            defaultVendor: 'Proveedor predeterminado',
            autoSync: 'Sincronización automática',
            autoSyncDescription: 'Sincroniza NetSuite y Expensify automáticamente todos los días. Exporta el informe finalizado en tiempo real',
            reimbursedReports: 'Sincronizar informes reembolsados',
            cardReconciliation: 'Conciliación de tarjetas',
            reconciliationAccount: 'Cuenta de conciliación',
            continuousReconciliation: 'Conciliación continua',
            saveHoursOnReconciliation:
                'Ahorra horas en la conciliación de cada período contable haciendo que Expensify concilie de forma continua los estados de cuenta y los asentamientos de la Expensify Card por ti.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>Para habilitar la Conciliación continua, habilita la <a href="${accountingAdvancedSettingsLink}">sincronización automática</a> para ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Elige la cuenta bancaria con la que se conciliarán los pagos de tu Expensify Card.',
                settlementAccountReconciliation: (settlementAccountUrl: string, lastFourPAN: string) =>
                    `Asegúrate de que esta cuenta coincida con tu <a href="${settlementAccountUrl}">cuenta de liquidación de la Expensify Card</a> (terminada en ${lastFourPAN}) para que la conciliación continua funcione correctamente.`,
            },
        },
        hr: {
            title: 'RR. HH.',
            subtitle: 'Conecta herramientas de RR. HH. y mantén las aprobaciones de empleados sincronizadas.',
            settingsTitle: 'Configuración de Gusto',
            syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                switch (stage) {
                    case 'startingImportGusto':
                        return 'Importando datos de Gusto';
                    case 'gustoSyncLoadCompany':
                        return 'Cargando datos de la empresa de Gusto';
                    case 'gustoSyncImportEmployees':
                        return 'Importar empleados';
                    case 'gustoSyncBuildApprovalChains':
                        return 'Creando cadenas de aprobación';
                    case 'gustoSyncFinalize':
                        return 'Finalizando la sincronización';
                    case 'jobDone':
                        return 'Esperando a que se carguen los datos importados';
                    default: {
                        return `Falta la traducción para la etapa: ${stage}`;
                    }
                }
            },
            gusto: {
                title: 'Gusto',
                connect: 'Conectar',
                connectionDescription: 'Conecta Gusto para mantener las aprobaciones de empleados sincronizadas con tu espacio de trabajo.',
                approvalMode: 'Modo de aprobación',
                finalApprover: 'Aprobador final',
            },
        },
        export: {
            notReadyHeading: 'No listo para exportar',
            notReadyDescription: 'Los informes de gastos en borrador o pendientes no se pueden exportar al sistema contable. Aprueba o paga estos gastos antes de exportarlos.',
        },
        invoices: {
            sendInvoice: 'Enviar factura',
            sendFrom: 'Enviar desde',
            invoicingDetails: 'Detalles de facturación',
            invoicingDetailsDescription: 'Esta información aparecerá en tus facturas.',
            companyName: 'Nombre de la empresa',
            companyWebsite: 'Sitio web de la empresa',
            paymentMethods: {
                personal: 'Personal',
                business: 'Negocio',
                chooseInvoiceMethod: 'Elige un método de pago a continuación:',
                payingAsIndividual: 'Pagar como persona física',
                payingAsBusiness: 'Pagar como empresa',
            },
            invoiceBalance: 'Saldo de la factura',
            invoiceBalanceSubtitle: 'Este es tu saldo actual por la cobranza de facturas. Se transferirá automáticamente a tu cuenta bancaria si ya agregaste una.',
            bankAccountsSubtitle: 'Agrega una cuenta bancaria para hacer y recibir pagos de facturas.',
        },
        invite: {
            member: 'Invitar miembro',
            members: 'Invitar miembros',
            invitePeople: 'Invitar a nuevas personas',
            genericFailureMessage: 'Se produjo un error al invitar a la persona al espacio de trabajo. Vuelve a intentarlo.',
            pleaseEnterValidLogin: `Asegúrate de que el correo electrónico o el número de teléfono sea válido (p. ej., ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'usuario',
            users: 'usuarios',
            invited: 'invitó',
            removed: 'eliminado',
            to: 'a',
            from: 'de',
        },
        inviteMessage: {
            confirmDetails: 'Confirmar detalles',
            inviteMessagePrompt: 'Haz que tu invitación sea aún más especial añadiendo un mensaje abajo.',
            personalMessagePrompt: 'Mensaje',
            genericFailureMessage: 'Se produjo un error al invitar a la persona al espacio de trabajo. Vuelve a intentarlo.',
            inviteNoMembersError: 'Selecciona al menos un miembro para invitar',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} solicitó unirse a ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: '¡Uy! No tan rápido...',
            workspaceNeeds: 'Un espacio de trabajo necesita al menos una tarifa de distancia habilitada.',
            distance: 'Distancia',
            centrallyManage: 'Administra las tarifas de forma centralizada, lleva el registro en millas o kilómetros y establece una categoría predeterminada.',
            rate: 'Calificar',
            addRate: 'Agregar tarifa',
            findRate: 'Encontrar tarifa',
            trackTax: 'Registrar impuestos',
            deleteRates: () => ({
                one: 'Eliminar tarifa',
                other: 'Eliminar tarifas',
            }),
            enableRates: () => ({
                one: 'Habilitar tarifa',
                other: 'Habilitar tarifas',
            }),
            disableRates: () => ({
                one: 'Desactivar tarifa',
                other: 'Desactivar tarifas',
            }),
            enableRate: 'Habilitar tarifa',
            status: 'Estado',
            unit: 'Unidad',
            taxFeatureNotEnabledMessage:
                '<muted-text>Los impuestos deben estar habilitados en el espacio de trabajo para usar esta función. Ve a <a href="#">Más funciones</a> para hacer ese cambio.</muted-text>',
            deleteDistanceRate: 'Eliminar tarifa de distancia',
            areYouSureDelete: () => ({
                one: '¿Seguro que quieres eliminar esta tarifa?',
                other: '¿Seguro que quieres eliminar estas tarifas?',
            }),
            errors: {
                rateNameRequired: 'El nombre de la tarifa es obligatorio',
                existingRateName: 'Ya existe una tarifa de distancia con este nombre',
            },
        },
        editor: {
            descriptionInputLabel: 'Descripción',
            nameInputLabel: 'Nombre',
            typeInputLabel: 'Tipo',
            initialValueInputLabel: 'Valor inicial',
            nameInputHelpText: 'Este es el nombre que verás en tu espacio de trabajo.',
            nameIsRequiredError: 'Tienes que darle un nombre a tu espacio de trabajo',
            currencyInputLabel: 'Moneda predeterminada',
            currencyInputHelpText: 'Todos los gastos de este espacio de trabajo se convertirán a esta moneda.',
            currencyInputDisabledText: (currency: string) =>
                `La divisa predeterminada no se puede cambiar porque este espacio de trabajo está vinculado a una cuenta bancaria en ${currency}.`,
            save: 'Guardar',
            genericFailureMessage: 'Se produjo un error al actualizar el espacio de trabajo. Inténtalo de nuevo.',
            avatarUploadFailureMessage: 'Se produjo un error al subir el avatar. Inténtalo de nuevo.',
            addressContext: 'Se requiere una dirección del espacio de trabajo para habilitar Expensify Travel. Ingresa una dirección asociada con tu empresa.',
            policy: 'Política de gastos',
        },
        bankAccount: {
            continueWithSetup: 'Continuar configuración',
            youAreAlmostDone: 'Casi terminas de configurar tu cuenta bancaria, lo que te permitirá emitir tarjetas corporativas, reembolsar gastos, cobrar facturas y pagar cuentas.',
            streamlinePayments: 'Agiliza los pagos',
            connectBankAccountNote: 'Nota: no se pueden usar cuentas bancarias personales para pagos en espacios de trabajo.',
            oneMoreThing: '¡Una cosa más!',
            allSet: '¡Ya está todo listo!',
            accountDescriptionWithCards: 'Esta cuenta bancaria se usará para emitir tarjetas corporativas, reembolsar gastos, cobrar facturas y pagar cuentas.',
            letsFinishInChat: '¡Terminemos en el chat!',
            finishInChat: 'Terminar en el chat',
            almostDone: '¡Casi listo!',
            disconnectBankAccount: 'Desconectar cuenta bancaria',
            startOver: 'Empezar de nuevo',
            updateDetails: 'Actualizar detalles',
            yesDisconnectMyBankAccount: 'Sí, desconectar mi cuenta bancaria',
            yesStartOver: 'Sí, comenzar de nuevo',
            disconnectYourBankAccount: (bankName: string) =>
                `Desconecta tu cuenta bancaria de <strong>${bankName}</strong>. Cualquier transacción pendiente de esta cuenta seguirá completándose.`,
            clearProgress: 'Comenzar de nuevo borrará el progreso que has logrado hasta ahora.',
            areYouSure: '¿Estás seguro?',
            workspaceCurrency: 'Moneda del workspace',
            updateCurrencyPrompt:
                'Parece que tu espacio de trabajo está configurado actualmente en una moneda diferente a USD. Haz clic en el botón de abajo para actualizar ahora tu moneda a USD.',
            updateToUSD: 'Actualizar a USD',
            updateWorkspaceCurrency: 'Actualizar la moneda del espacio de trabajo',
            workspaceCurrencyNotSupported: 'Moneda del espacio de trabajo no admitida',
            yourWorkspace: `Tu espacio de trabajo está configurado en una moneda no admitida. Consulta la <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">lista de monedas admitidas</a>.`,
            chooseAnExisting: 'Elige una cuenta bancaria existente para pagar gastos o añade una nueva.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Transferir propiedad',
            addPaymentCardTitle: 'Introduce tu tarjeta de pago para transferir la propiedad',
            addPaymentCardButtonText: 'Aceptar términos y agregar tarjeta de pago',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Lee y acepta los <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">términos</a> y la <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">política de privacidad</a> para agregar tu tarjeta.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'Cumple con PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Cifrado de nivel bancario',
            addPaymentCardRedundant: 'Infraestructura redundante',
            addPaymentCardLearnMore: `<muted-text>Obtén más información sobre nuestra <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">seguridad</a>.</muted-text>`,
            amountOwedTitle: 'Saldo pendiente',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Esta cuenta tiene un saldo pendiente de un mes anterior.\n\n¿Quieres saldar el saldo y hacerte cargo de la facturación de este espacio de trabajo?',
            ownerOwesAmountTitle: 'Saldo pendiente',
            ownerOwesAmountButtonText: 'Transferir saldo',
            ownerOwesAmountText: (email: string, amount: string) => `La cuenta propietaria de este espacio de trabajo (${email}) tiene un saldo pendiente de un mes anterior.

¿Quieres transferir este importe (${amount}) para hacerte cargo de la facturación de este espacio de trabajo? Tu tarjeta de pago se cargará de inmediato.`,
            subscriptionTitle: 'Asumir suscripción anual',
            subscriptionButtonText: 'Transferir suscripción',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Al hacerte cargo de este espacio de trabajo, su suscripción anual se fusionará con tu suscripción actual. Esto aumentará el tamaño de tu suscripción en ${usersCount} miembros, haciendo que el nuevo tamaño de tu suscripción sea de ${finalCount}. ¿Quieres continuar?`,
            duplicateSubscriptionTitle: 'Alerta de suscripción duplicada',
            duplicateSubscriptionButtonText: 'Continuar',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `Parece que estás intentando hacerte cargo de la facturación de los espacios de trabajo de ${email}, pero para hacerlo primero debes ser administrador de todos sus espacios de trabajo.

Haz clic en «Continuar» si solo quieres hacerte cargo de la facturación del espacio de trabajo ${workspaceName}.

Si quieres hacerte cargo de la facturación de toda su suscripción, pídele primero que te agregue como administrador a todos sus espacios de trabajo antes de hacerte cargo de la facturación.`,
            hasFailedSettlementsTitle: 'No se puede transferir la propiedad',
            hasFailedSettlementsButtonText: 'Entendido',
            hasFailedSettlementsText: (email: string) =>
                `No puedes hacerte cargo de la facturación porque ${email} tiene una liquidación pendiente vencida de la Expensify Card. Pídele que se comunique con concierge@expensify.com para resolver el problema. Luego podrás hacerte cargo de la facturación de este espacio de trabajo.`,
            failedToClearBalanceTitle: 'No se pudo liquidar el saldo',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'No pudimos compensar el saldo. Inténtalo de nuevo más tarde.',
            successTitle: '¡Genial! Todo listo.',
            successDescription: 'Ahora eres la persona propietaria de este espacio de trabajo.',
            errorTitle: '¡Uy! No tan rápido...',
            errorDescription: `<muted-text><centered-text>Hubo un problema al transferir la propiedad de este espacio de trabajo. Inténtalo de nuevo o <concierge-link>comunícate con Concierge</concierge-link> para obtener ayuda.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '¡Cuidado!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `Los siguientes informes ya se exportaron a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:

${reportName}

¿Seguro que quieres exportarlos de nuevo?`,
            confirmText: 'Sí, exportar de nuevo',
            cancelText: 'Cancelar',
        },
        upgrade: {
            reportFields: {
                title: 'Campos del informe',
                description: `Los campos de informe te permiten especificar detalles a nivel de encabezado, distintos de las etiquetas que se aplican a los gastos de partidas individuales. Estos detalles pueden abarcar nombres específicos de proyectos, información de viajes de negocios, ubicaciones y más.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Los campos de informe solo están disponibles en el plan Control, desde <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Disfruta de la sincronización automatizada y reduce las cargas manuales con la integración Expensify + NetSuite. Obtén información financiera detallada y en tiempo real con compatibilidad para segmentos nativos y personalizados, incluida la asignación de proyectos y clientes.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nuestra integración con NetSuite solo está disponible en el plan Control, desde <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Disfruta de la sincronización automática y reduce los registros manuales con la integración de Expensify + Sage Intacct. Obtén información financiera detallada y en tiempo real con dimensiones definidas por el usuario, así como categorización de gastos por departamento, clase, ubicación, cliente y proyecto (trabajo).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nuestra integración con Sage Intacct solo está disponible en el plan Control, desde <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Disfruta de la sincronización automática y reduce las entradas manuales con la integración de Expensify + QuickBooks Desktop. Obtén la máxima eficiencia con una conexión bidireccional en tiempo real y categorización de gastos por clase, artículo, cliente y proyecto.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nuestra integración con QuickBooks Desktop solo está disponible en el plan Control, desde <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Aprobaciones avanzadas',
                description: `Si quieres añadir más niveles de aprobación al proceso, o simplemente asegurarte de que los gastos más grandes reciban una segunda revisión, te tenemos cubierto. Las aprobaciones avanzadas te ayudan a establecer los controles adecuados en cada nivel para mantener el gasto de tu equipo bajo control.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Las aprobaciones avanzadas solo están disponibles en el plan Control, que comienza en <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            categories: {
                title: 'Categorías',
                description: 'Las categorías te permiten seguir y organizar tus gastos. Usa nuestras categorías predeterminadas o agrega las tuyas propias.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Las categorías están disponibles en el plan Collect, desde <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            glCodes: {
                title: 'Códigos de contabilidad',
                description: `Agrega códigos GL a tus categorías y etiquetas para exportar fácilmente los gastos a tus sistemas de contabilidad y nómina.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Los códigos GL solo están disponibles en el plan Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Códigos de contabilidad general y de nómina',
                description: `Añade códigos contables y de nómina a tus categorías para exportar fácilmente los gastos a tus sistemas de contabilidad y nómina.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Los códigos de contabilidad general y de nómina solo están disponibles en el plan Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Códigos de impuestos',
                description: `Agrega códigos de impuestos a tus impuestos para facilitar la exportación de gastos a tus sistemas contables y de nómina.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Los códigos de impuestos solo están disponibles en el plan Control, desde <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            companyCards: {
                title: 'Tarjetas corporativas ilimitadas',
                description: `¿Necesitas agregar más feeds de tarjetas? Desbloquea tarjetas corporativas ilimitadas para sincronizar transacciones de todos los principales emisores de tarjetas.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Esto solo está disponible en el plan Control, desde <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            rules: {
                title: 'Reglas',
                description: `Las reglas se ejecutan en segundo plano y mantienen tus gastos bajo control para que no tengas que preocuparte por los pequeños detalles.

Exige información de los gastos como recibos y descripciones, establece límites y valores predeterminados, y automatiza las aprobaciones y los pagos, todo en un solo lugar.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Las reglas solo están disponibles en el plan Control, desde <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            perDiem: {
                title: 'Viáticos',
                description:
                    'La dieta es una excelente forma de mantener tus costos diarios conformes y previsibles siempre que tu personal viaje. Disfruta de funciones como tarifas personalizadas, categorías predeterminadas y detalles más específicos como destinos y subtarifas.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Las dietas solo están disponibles en el plan Control, desde <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            hr: {
                title: 'Integraciones de RR. HH.',
                description:
                    'Conecta tu proveedor de RR. HH. para sincronizar automáticamente a las personas empleadas y gestionar los flujos de aprobación. Mantén la plantilla de tu equipo y la estructura de reportes actualizadas sin trabajo manual.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Las integraciones de RR. HH. solo están disponibles en el plan Control, desde <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            travel: {
                title: 'Viaje',
                description:
                    'Expensify Travel es una nueva plataforma corporativa para reservar y gestionar viajes que permite a los miembros reservar alojamientos, vuelos, transporte y más.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Viajes está disponible en el plan Collect, desde <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            reports: {
                title: 'Informes',
                description: 'Los informes te permiten agrupar gastos para facilitar su seguimiento y organización.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Los informes están disponibles en el plan Collect, desde <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Etiquetas multinivel',
                description:
                    'Las etiquetas de varios niveles te ayudan a registrar los gastos con mayor precisión. Asigna varias etiquetas a cada partida (como departamento, cliente o centro de costos) para capturar todo el contexto de cada gasto. Esto permite reportes más detallados, flujos de aprobación y exportaciones contables.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Las etiquetas de varios niveles solo están disponibles en el plan Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Tarifas por distancia',
                description: 'Crea y gestiona tus propias tarifas, registra en millas o kilómetros y establece categorías predeterminadas para los gastos de distancia.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Las tarifas por distancia están disponibles en el plan Collect, desde <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            auditor: {
                title: 'Auditor',
                description: 'Las personas auditoras obtienen acceso de solo lectura a todos los reportes para una visibilidad total y supervisar el cumplimiento.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Los auditores solo están disponibles en el plan Control, desde <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Varios niveles de aprobación',
                description:
                    'Los múltiples niveles de aprobación son una herramienta de flujo de trabajo para las empresas que requieren que más de una persona apruebe un informe antes de que pueda ser reembolsado.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Los múltiples niveles de aprobación solo están disponibles en el plan Control, desde <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'por miembro activo por mes.',
                perMember: 'por miembro al mes.',
            },
            note: (subscriptionLink: string) =>
                `<muted-text>Mejora tu plan para acceder a esta función o <a href="${subscriptionLink}">obtén más información</a> sobre nuestros planes y precios.</muted-text>`,
            upgradeToUnlock: 'Desbloquear esta función',
            completed: {
                headline: `¡Has mejorado tu espacio de trabajo!`,
                successMessage: (policyName: string, subscriptionLink: string) =>
                    `<centered-text>Has actualizado correctamente ${policyName} al plan Control. <a href="${subscriptionLink}">Ver tu suscripción</a> para más detalles.</centered-text>`,
                categorizeMessage: `Has actualizado correctamente al plan Collect. ¡Ahora puedes clasificar tus gastos!`,
                travelMessage: `Has ascendido correctamente al plan Collect. ¡Ahora puedes empezar a reservar y gestionar viajes!`,
                distanceRateMessage: `Has actualizado correctamente al plan Collect. ¡Ahora puedes cambiar la tarifa por distancia!`,
                gotIt: 'Entendido, gracias',
                createdWorkspace: `¡Has creado un espacio de trabajo!`,
            },
            commonFeatures: {
                title: 'Actualiza al plan Control',
                note: 'Desbloquea nuestras funciones más potentes, que incluyen:',
                benefits: {
                    startsAtFull: (learnMoreMethodsRoute: string, formattedPrice: string, hasTeam2025Pricing: boolean) =>
                        `<muted-text>El plan Control comienza en <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo por mes.`} <a href="${learnMoreMethodsRoute}">Más información</a> sobre nuestros planes y precios.</muted-text>`,
                    benefit1: 'Conexiones avanzadas de contabilidad (NetSuite, Sage Intacct y más)',
                    benefit2: 'Reglas inteligentes de gastos',
                    benefit3: 'Flujos de aprobación multinivel',
                    benefit4: 'Controles de seguridad mejorados',
                    toUpgrade: 'Para mejorar, haz clic',
                    selectWorkspace: 'selecciona un espacio de trabajo y cambia el tipo de plan a',
                },
                upgradeWorkspaceWarning: `No se puede actualizar el espacio de trabajo`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt:
                    'Tu empresa ha restringido la creación de espacios de trabajo. Ponte en contacto con una persona administradora para obtener ayuda.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Cambiar a Collect',
                note: 'Perderás el acceso a las siguientes funciones',
                noteAndMore: 'y más:',
                benefits: {
                    important: 'IMPORTANTE:',
                    confirm: 'Deberás cambiar el “Tipo de plan” de cada espacio de trabajo a “Collect” para asegurar la tarifa de Collect.',
                    benefit1Label: 'Integraciones ERP',
                    benefit1: 'NetSuite, Sage Intacct, QuickBooks Desktop, Oracle, Microsoft Dynamics',
                    benefit2Label: 'Integraciones de RR. HH.',
                    benefit2: 'Workday, Certinia',
                    benefit3Label: 'Seguridad',
                    benefit3: 'SSO/SAML',
                    benefit4Label: 'Avanzado',
                    benefit4: 'Reglas de gastos inteligentes, dietas, aprobaciones multinivel, informes personalizados y presupuestos',
                    headsUp: '¡Atención!',
                    multiWorkspaceNote:
                        'Deberás cambiar todos tus espacios de trabajo a un plan inferior antes de tu primer pago mensual para comenzar una suscripción con la tarifa Collect. Haz clic',
                    selectStep: '> selecciona cada espacio de trabajo > cambia el tipo de plan a',
                },
            },
            completed: {
                headline: 'Tu espacio de trabajo se ha degradado',
                description: 'Tienes otros espacios de trabajo en el plan Control. Para que se te cobre a la tarifa Collect, debes cambiar todos los espacios de trabajo a un plan inferior.',
                gotIt: 'Entendido, gracias',
            },
        },
        payAndDowngrade: {
            title: 'Pagar y cambiar a un plan inferior',
            headline: 'Tu pago final',
            description1: (formattedAmount: string) => `Tu factura final para esta suscripción será de <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `Consulta tu desglose a continuación para ${date}:`,
            subscription:
                '¡Atención! Esta acción finalizará tu suscripción a Expensify, eliminará este espacio de trabajo y quitará a todas las personas miembros del espacio de trabajo. Si quieres conservar este espacio de trabajo y solo darte de baja tú, haz que otra persona administradora se haga cargo de la facturación primero.',
            genericFailureMessage: 'Se produjo un error al pagar tu factura. Inténtalo de nuevo.',
        },
        restrictedAction: {
            restricted: 'Restringido',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Las acciones en el espacio de trabajo ${workspaceName} están restringidas actualmente`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: (workspaceOwnerName: string) =>
                `La persona propietaria del espacio de trabajo, ${workspaceOwnerName}, deberá añadir o actualizar la tarjeta de pago registrada para desbloquear la nueva actividad del espacio de trabajo.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Deberás agregar o actualizar la tarjeta de pago registrada para desbloquear nueva actividad del espacio de trabajo.',
            addPaymentCardToUnlock: '¡Agrega una tarjeta de pago para desbloquear!',
            addPaymentCardToContinueUsingWorkspace: 'Agrega una tarjeta de pago para seguir usando este espacio de trabajo',
            pleaseReachOutToYourWorkspaceAdmin: 'Comunícate con el administrador de tu espacio de trabajo si tienes alguna pregunta.',
            chatWithYourAdmin: 'Chatea con tu admin',
            chatInAdmins: 'Chatear en #admins',
            addPaymentCard: 'Agregar tarjeta de pago',
            goToSubscription: 'Ir a Suscripción',
        },
        rules: {
            individualExpenseRules: {
                title: 'Gastos',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>Configura controles de gasto y valores predeterminados para gastos individuales. También puedes crear reglas para las <a href="${categoriesPageLink}">categorías</a> y las <a href="${tagsPageLink}">etiquetas</a>.</muted-text>`,
                receiptRequiredAmount: 'Monto que requiere recibo',
                receiptRequiredAmountDescription: 'Exigir recibos cuando el gasto supere este importe, a menos que una regla de categoría lo anule.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `El importe no puede ser mayor que el importe requerido del recibo detallado (${amount})`,
                itemizedReceiptRequiredAmount: 'Importe que requiere recibo detallado',
                itemizedReceiptRequiredAmountDescription: 'Exigir recibos detallados cuando el gasto supere este importe, a menos que una regla de categoría lo anule.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `El importe no puede ser inferior al importe requerido para los recibos normales (${amount})`,
                maxExpenseAmount: 'Importe máximo del gasto',
                maxExpenseAmountDescription: 'Marcar gastos que superen este monto, a menos que una regla de categoría los anule.',
                maxAge: 'Edad máxima',
                maxExpenseAge: 'Antigüedad máxima del gasto',
                maxExpenseAgeDescription: 'Marcar gastos anteriores a un número específico de días.',
                maxExpenseAgeDays: () => ({
                    one: '1 día',
                    other: (count: number) => `${count} días`,
                }),
                cashExpenseDefault: 'Predeterminado de gasto en efectivo',
                cashExpenseDefaultDescription:
                    'Elige cómo se deben crear los gastos en efectivo. Un gasto se considera en efectivo si no es una transacción de tarjeta corporativa importada. Esto incluye los gastos creados manualmente, recibos, viáticos, distancia y gastos de tiempo.',
                reimbursableDefault: 'Reembolsable',
                reimbursableDefaultDescription: 'Los gastos casi siempre se reembolsan a las personas empleadas',
                nonReimbursableDefault: 'No reembolsable',
                nonReimbursableDefaultDescription: 'A veces se reembolsan los gastos a las personas empleadas',
                alwaysReimbursable: 'Siempre reembolsable',
                alwaysReimbursableDescription: 'Los gastos siempre se reembolsan a las personas empleadas',
                alwaysNonReimbursable: 'Siempre no reembolsable',
                alwaysNonReimbursableDescription: 'Los gastos nunca se reembolsan a las personas empleadas',
                billableDefault: 'Facturable predeterminado',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Elige si los gastos en efectivo y con tarjeta de crédito deben ser facturables de forma predeterminada. Los gastos facturables se habilitan o deshabilitan en las <a href="${tagsPageLink}">etiquetas</a>.</muted-text>`,
                billable: 'Facturable',
                billableDescription: 'Los gastos se vuelven a facturar a los clientes con mayor frecuencia',
                nonBillable: 'No facturable',
                nonBillableDescription: 'A veces se vuelven a facturar los gastos a los clientes',
                eReceipts: 'Recibos electrónicos',
                eReceiptsHint: `Los eReceipts se crean automáticamente [para la mayoría de transacciones con tarjeta de crédito en USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Seguimiento de asistentes',
                attendeeTrackingHint: 'Haz seguimiento del costo por persona de cada gasto.',
                prohibitedDefaultDescription: 'Marcar los recibos con estos conceptos de línea para revisión manual.',
                prohibitedExpenses: 'Gastos prohibidos',
                alcohol: 'Alcohol',
                hotelIncidentals: 'Gastos imprevistos de hotel',
                gambling: 'Juego de azar',
                tobacco: 'Tabaco',
                adultEntertainment: 'Entretenimiento para adultos',
                requireCompanyCard: 'Exigir tarjetas corporativas para todas las compras',
                requireCompanyCardDescription: 'Marca todos los gastos en efectivo, incluidos los de kilometraje y viáticos.',
                requireCompanyCardDisabledTooltip: 'Activa las tarjetas de empresa (en Más funciones) para desbloquear.',
            },
            expenseReportRules: {
                title: 'Avanzado',
                subtitle: 'Automatiza el cumplimiento, las aprobaciones y el pago de los informes de gastos.',
                preventSelfApprovalsTitle: 'Evitar autoaprobaciones',
                preventSelfApprovalsSubtitle: 'Evita que las personas del espacio de trabajo aprueben sus propios informes de gastos.',
                autoApproveCompliantReportsTitle: 'Aprobar automáticamente los informes conformes',
                autoApproveCompliantReportsSubtitle: 'Configura qué informes de gastos son aptos para la aprobación automática.',
                autoApproveReportsUnderTitle: 'Aprobar automáticamente los informes con todos los gastos inferiores a',
                autoApproveReportsUnderDescription:
                    'Los informes de gastos completamente conformes en los que todos los gastos estén por debajo de este importe se aprobarán automáticamente.',
                randomReportAuditTitle: 'Auditoría aleatoria de informes',
                randomReportAuditDescription: 'Requerir que algunos informes se aprueben manualmente, incluso si son aptos para la aprobación automática.',
                autoPayApprovedReportsTitle: 'Pagar automáticamente los informes aprobados',
                autoPayApprovedReportsSubtitle: 'Configura qué informes de gastos son aptos para pago automático.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Introduce un importe menor que ${currency ?? ''}20,000`,
                autoPayApprovedReportsLockedSubtitle: 'Ve a más funciones y habilita los flujos de trabajo, luego agrega pagos para desbloquear esta función.',
                autoPayReportsUnderTitle: 'Pagos automáticos de informes debajo de',
                autoPayReportsUnderDescription: 'Los informes de gastos totalmente conformes por debajo de este importe se pagarán automáticamente.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `Agrega ${featureName} para desbloquear esta función.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `Ve a [más funciones](${moreFeaturesLink}) y habilita ${featureName} para desbloquear esta función.`,
            },
            merchantRules: {
                title: 'Comercio',
                subtitle: 'Configura reglas de comerciante para que los gastos lleguen con la codificación correcta y requieran menos limpieza.',
                addRule: 'Agregar regla de comerciante',
                findRule: 'Buscar regla de comerciante',
                addRuleTitle: 'Agregar regla',
                editRuleTitle: 'Editar regla',
                expensesWith: 'Para gastos con:',
                expensesExactlyMatching: 'Para los gastos que coincidan exactamente:',
                applyUpdates: 'Aplica estas actualizaciones:',
                saveRule: 'Guardar regla',
                previewMatches: 'Vista previa de coincidencias',
                confirmError: 'Ingresa el comercio y aplica al menos una actualización',
                confirmErrorMerchant: 'Introduce el comercio',
                confirmErrorUpdate: 'Aplica al menos una actualización',
                previewMatchesEmptyStateTitle: 'Nada que mostrar',
                previewMatchesEmptyStateSubtitle: 'Ningún gasto sin enviar coincide con esta regla.',
                deleteRule: 'Eliminar regla',
                deleteRuleConfirmation: '¿Seguro que quieres eliminar esta regla?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `Si el comercio ${isExactMatch ? 'coincide exactamente' : 'contiene'} "${merchantName}"`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `Renombrar comercio a «${merchantName}»`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `Actualizar ${fieldName} a «${fieldValue}»`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `Marcar como "${reimbursable ? 'reembolsable' : 'no reembolsable'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `Marcar como «${billable ? 'facturable' : 'no facturable'}»`,
                matchType: 'Tipo de coincidencia',
                matchTypeContains: 'Contiene',
                matchTypeExact: 'Coincide exactamente',
                duplicateRuleTitle: 'Ya existe una regla similar para este comercio',
                duplicateRulePrompt: (merchantName: string) => `Tu regla existente para «${merchantName}» tendrá prioridad sobre esta. ¿Guardar de todos modos?`,
                saveAnyway: 'Guardar de todos modos',
                applyToExistingUnsubmittedExpenses: 'Aplicar a los gastos existentes sin enviar',
            },
            categoryRules: {
                title: 'Reglas de categoría',
                approver: 'Aprobador',
                requireDescription: 'Descripción obligatoria',
                requireFields: 'Campos obligatorios',
                requiredFieldsTitle: 'Campos obligatorios',
                requiredFieldsDescription: (categoryName: string) => `Esto se aplicará a todos los gastos categorizados como <strong>${categoryName}</strong>.`,
                requireAttendees: 'Exigir asistentes',
                descriptionHint: 'Sugerencia de descripción',
                descriptionHintDescription: (categoryName: string) =>
                    `Recordar a las personas empleadas que proporcionen información adicional para los gastos de “${categoryName}”. Este aviso aparece en el campo de descripción de los gastos.`,
                descriptionHintLabel: 'Sugerencia',
                descriptionHintSubtitle: 'Consejo profesional: ¡cuanto más corto, mejor!',
                maxAmount: 'Importe máximo',
                flagAmountsOver: 'Marcar importes superiores a',
                flagAmountsOverDescription: (categoryName: string) => `Se aplica a la categoría «${categoryName}».`,
                flagAmountsOverSubtitle: 'Esto anula el importe máximo para todos los gastos.',
                expenseLimitTypes: {
                    expense: 'Gasto individual',
                    expenseSubtitle: 'Marca los importes de gastos por categoría. Esta regla reemplaza la regla general del espacio de trabajo sobre el importe máximo de gasto.',
                    daily: 'Total por categoría',
                    dailySubtitle: 'Marcar el gasto total diario por categoría en cada informe de gastos.',
                },
                requireReceiptsOver: 'Exigir recibos superiores a',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Predeterminado`,
                    never: 'Nunca exigir recibos',
                    always: 'Exigir siempre recibos',
                },
                requireItemizedReceiptsOver: 'Requerir recibos desglosados superiores a',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Predeterminado`,
                    never: 'Nunca exigir recibos desglosados',
                    always: 'Requerir siempre recibos desglosados',
                },
                defaultTaxRate: 'Tasa de impuesto predeterminada',
                enableWorkflows: (moreFeaturesLink: string) =>
                    `Ve a [Más funciones](${moreFeaturesLink}) y habilita los flujos de trabajo, luego agrega aprobaciones para desbloquear esta función.`,
            },
            customRules: {
                title: 'Política de gastos',
                cardSubtitle: 'Aquí es donde se encuentra la política de gastos de tu equipo, para que todas las personas estén alineadas sobre qué está cubierto.',
            },
            spendRules: {
                title: 'Gasto',
                subtitle: 'Aprueba o rechaza transacciones de la Expensify Card en tiempo real.',
                defaultRuleDescription: 'Todas las tarjetas',
                block: 'Bloquear',
                defaultRuleTitle: 'Categorías: Servicios para adultos, cajeros automáticos, juegos de azar, transferencias de dinero',
                builtInProtectionModal: {
                    title: 'Las Expensify Cards ofrecen protección integrada, siempre',
                    description: `Expensify siempre rechaza estos cargos:

  • Servicios para adultos
  • Cajeros automáticos (ATM)
  • Juegos de azar
  • Transferencias de dinero

Añade más reglas de gasto para proteger el flujo de caja de la empresa.`,
                },
                addSpendRule: 'Agregar regla de gasto',
                editRuleTitle: 'Editar regla',
                cardPageTitle: 'Tarjeta',
                cardsSectionTitle: 'Tarjetas',
                chooseCards: 'Elegir tarjetas',
                saveRule: 'Guardar regla',
                deleteRule: 'Eliminar regla',
                deleteRuleConfirmation: '¿Seguro que quieres eliminar esta regla?',
                allow: 'Permitir',
                spendRuleSectionTitle: 'Regla de gasto',
                restrictionType: 'Tipo de restricción',
                restrictionTypeHelpAllow: 'Los cargos se aprueban si coinciden con cualquier comercio o categoría y no superan un importe máximo.',
                restrictionTypeHelpBlock: 'Los cargos se rechazan si coinciden con algún comercio o categoría, o si superan un monto máximo.',
                addMerchant: 'Agregar comerciante',
                merchantContains: 'El comercio contiene',
                merchantExactlyMatches: 'El comerciante coincide exactamente',
                noBlockedMerchants: 'No hay comercios bloqueados',
                addMerchantToBlockSpend: 'Agregar un comercio para bloquear gastos',
                noAllowedMerchants: 'No hay comercios permitidos',
                addMerchantToAllowSpend: 'Agrega un comercio para permitir gastos',
                matchType: 'Tipo de coincidencia',
                matchTypeContains: 'Contiene',
                matchTypeExact: 'Coincide exactamente',
                spendCategory: 'Categoría de gasto',
                maxAmount: 'Importe máximo',
                maxAmountHelp: 'Cualquier cargo que supere este monto será rechazado, independientemente de las restricciones de comercio y categoría de gasto.',
                currencyMismatchTitle: 'Incompatibilidad de moneda',
                currencyMismatchPrompt: 'Para establecer un monto máximo, selecciona tarjetas que liquiden en la misma moneda.',
                reviewSelectedCards: 'Revisar tarjetas seleccionadas',
                summaryMoreCount: ({summary, count}: {summary: string; count: number}) => (count > 0 ? `${summary}, +${count} más` : summary),
                summaryMerchants: ({
                    merchants,
                    hiddenCount,
                    shownCount,
                    action,
                }: {
                    merchants: string;
                    hiddenCount: number;
                    shownCount: number;
                    action: ValueOf<typeof CONST.SPEND_RULES.ACTION>;
                }) =>
                    `${action === CONST.SPEND_RULES.ACTION.BLOCK ? 'Bloqueado' : 'Permitido'} ${shownCount > 1 ? 'comerciantes' : 'comerciante'}: ${merchants}${hiddenCount > 0 ? `, +${hiddenCount} más` : ''}`,
                summaryCategories: ({
                    categories,
                    hiddenCount,
                    shownCount,
                    action,
                }: {
                    categories: string;
                    hiddenCount: number;
                    shownCount: number;
                    action: ValueOf<typeof CONST.SPEND_RULES.ACTION>;
                }) =>
                    `${action === CONST.SPEND_RULES.ACTION.BLOCK ? 'Bloqueado' : 'Permitido'} ${shownCount > 1 ? 'categorías' : 'categoría'}: ${categories}${hiddenCount > 0 ? `, +${hiddenCount} más` : ''}`,
                confirmErrorApplyAtLeastOneSpendRuleToOneCard: 'Aplica al menos una regla de gasto a una tarjeta',
                confirmErrorCardRequired: 'La tarjeta es un campo obligatorio',
                confirmErrorApplyAtLeastOneSpendRule: 'Aplica al menos una regla de gasto',
                categories: 'Categorías',
                merchants: 'Comerciantes',
                noAvailableCards: 'Todas las tarjetas ya tienen una regla',
                noAvailableCardsSubtitle: 'Editar una regla de tarjeta existente para hacer cambios',
                noCardsIssuedTitle: 'No se emitieron tarjetas Expensify',
                noCardsIssuedSubtitle: 'Emite tarjetas Expensify para crear reglas de gasto',
                max: 'Máximo',
                categoryOptions: {
                    [CONST.SPEND_RULES.CATEGORIES.AIRLINES]: 'Aerolíneas',
                    [CONST.SPEND_RULES.CATEGORIES.ALCOHOL_AND_BARS]: 'Alcohol y bares',
                    [CONST.SPEND_RULES.CATEGORIES.AMAZON_AND_BOOKSTORES]: 'Amazon y librerías',
                    [CONST.SPEND_RULES.CATEGORIES.AUTOMOTIVE]: 'Automotriz',
                    [CONST.SPEND_RULES.CATEGORIES.CAR_RENTALS]: 'Alquiler de autos',
                    [CONST.SPEND_RULES.CATEGORIES.DINING]: 'Restaurantes',
                    [CONST.SPEND_RULES.CATEGORIES.FUEL_AND_GAS]: 'Combustible y gasolina',
                    [CONST.SPEND_RULES.CATEGORIES.GOVERNMENT_AND_NON_PROFITS]: 'Gobierno y organizaciones sin fines de lucro',
                    [CONST.SPEND_RULES.CATEGORIES.GROCERIES]: 'Comestibles',
                    [CONST.SPEND_RULES.CATEGORIES.GYMS_AND_FITNESS]: 'Gimnasios y fitness',
                    [CONST.SPEND_RULES.CATEGORIES.HEALTHCARE]: 'Salud',
                    [CONST.SPEND_RULES.CATEGORIES.HOTELS]: 'Hoteles',
                    [CONST.SPEND_RULES.CATEGORIES.INTERNET_AND_PHONE]: 'Internet y teléfono',
                    [CONST.SPEND_RULES.CATEGORIES.OFFICE_SUPPLIES]: 'Material de oficina',
                    [CONST.SPEND_RULES.CATEGORIES.PARKING_AND_TOLLS]: 'Estacionamiento y peajes',
                    [CONST.SPEND_RULES.CATEGORIES.PROFESSIONAL_SERVICES]: 'Servicios profesionales',
                    [CONST.SPEND_RULES.CATEGORIES.RETAIL]: 'Venta minorista',
                    [CONST.SPEND_RULES.CATEGORIES.SHIPPING_AND_DELIVERY]: 'Envío y entrega',
                    [CONST.SPEND_RULES.CATEGORIES.SOFTWARE]: 'Software',
                    [CONST.SPEND_RULES.CATEGORIES.TRANSIT_AND_RIDESHARE]: 'Transporte público y viajes compartidos',
                    [CONST.SPEND_RULES.CATEGORIES.TRAVEL_AGENCIES]: 'Agencias de viajes',
                },
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Cobrar',
                    description: 'Para equipos que buscan automatizar sus procesos.',
                },
                corporate: {
                    label: 'Control',
                    description: 'Para organizaciones con requisitos avanzados.',
                },
            },
            description: 'Elige el plan adecuado para ti. Para ver una lista detallada de funciones y precios, consulta nuestra',
            subscriptionLink: 'página de ayuda sobre tipos de planes y precios',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Te has comprometido a 1 miembro activo en el plan Control hasta que finalice tu suscripción anual el ${annualSubscriptionEndDate}. Puedes cambiar a una suscripción de pago por uso y cambiar al plan Collect a partir del ${annualSubscriptionEndDate} desactivando la renovación automática en`,
                other: `Te has comprometido a ${count} miembros activos en el plan Control hasta que tu suscripción anual finalice el ${annualSubscriptionEndDate}. Puedes cambiar a una suscripción de pago por uso y cambiar al plan Collect a partir del ${annualSubscriptionEndDate} desactivando la renovación automática en`,
            }),
            subscriptions: 'Suscripciones',
        },
    },
    getAssistancePage: {
        title: 'Obtener ayuda',
        subtitle: '¡Estamos aquí para despejar tu camino hacia la grandeza!',
        description: 'Elige una de las opciones de soporte a continuación:',
        chatWithConcierge: 'Chatear con Concierge',
        scheduleSetupCall: 'Programar una llamada de configuración',
        scheduleACall: 'Programar llamada',
        questionMarkButtonTooltip: 'Obtén ayuda de nuestro equipo',
        exploreHelpDocs: 'Explorar documentos de ayuda',
        registerForWebinar: 'Registrarse en el seminario web',
        onboardingHelp: 'Ayuda de incorporación',
    },
    emojiPicker: {
        emojiNotSelected: 'Emoji no seleccionado',
        skinTonePickerLabel: 'Cambiar tono de piel predeterminado',
        headers: {
            frequentlyUsed: 'Usados frecuentemente',
            smileysAndEmotion: 'Emoticonos y emociones',
            peopleAndBody: 'Personas y cuerpo',
            animalsAndNature: 'Animales y naturaleza',
            foodAndDrink: 'Comida y bebidas',
            travelAndPlaces: 'Viajes y lugares',
            activities: 'Actividades',
            objects: 'Objetos',
            symbols: 'Símbolos',
            flags: 'Banderas',
        },
    },
    newRoomPage: {
        newRoom: 'Nueva sala',
        groupName: 'Nombre del grupo',
        roomName: 'Nombre de la sala',
        visibility: 'Visibilidad',
        restrictedDescription: 'Las personas de tu espacio de trabajo pueden encontrar esta sala',
        privateDescription: 'Las personas invitadas a esta sala pueden encontrarla',
        publicDescription: 'Cualquiera puede encontrar esta sala',
        public_announceDescription: 'Cualquiera puede encontrar esta sala',
        createRoom: 'Crear sala',
        roomAlreadyExistsError: 'Ya existe una sala con este nombre',
        roomNameReservedError: (reservedName: string) => `${reservedName} es una sala predeterminada en todos los espacios de trabajo. Elige otro nombre.`,
        roomNameInvalidError: 'Los nombres de las salas solo pueden incluir letras minúsculas, números y guiones',
        pleaseEnterRoomName: 'Introduce un nombre de sala',
        pleaseSelectWorkspace: 'Selecciona un espacio de trabajo',
        renamedRoomAction: (oldName: string, newName: string, isExpenseReport: boolean, actorName?: string) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor} cambió el nombre a «${newName}» (antes «${oldName}»)` : `${actor} cambió el nombre de esta sala a «${newName}» (antes «${oldName}»)`;
        },
        roomRenamedTo: (newName: string) => `Sala renombrada a ${newName}`,
        social: 'social',
        selectAWorkspace: 'Selecciona un espacio de trabajo',
        growlMessageOnRenameError: 'No se puede cambiar el nombre de la sala del espacio de trabajo. Verifica tu conexión e inténtalo de nuevo.',
        visibilityOptions: {
            restricted: 'Espacio de trabajo',
            private: 'Privado',
            public: 'Público',
            public_announce: 'Anuncio público',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Enviar y cerrar',
        submitAndApprove: 'Enviar y aprobar',
        advanced: 'AVANZADO',
        dynamicExternal: 'EXTERNO DINÁMICO',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `establecer la cuenta bancaria comercial predeterminada en "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `eliminó la cuenta bancaria comercial predeterminada "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
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
            `cambió la cuenta bancaria comercial predeterminada a "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" (antes "${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}")`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `cambió la dirección de la empresa a «${newAddress}» (antes «${previousAddress}»)` : `establecer la dirección de la empresa en "${newAddress}"`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `se agregó a ${approverName} (${approverEmail}) como aprobador para ${field} «${name}»`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `se eliminó a ${approverName} (${approverEmail}) como aprobador de ${field} «${name}»`,
        updateApprovalRule: (field: string, name: string, newApproverEmail: string, newApproverName: string | undefined, oldApproverEmail: string, oldApproverName: string | undefined) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `cambió la persona aprobadora del/de la ${field} «${name}» a ${formatApprover(newApproverName, newApproverEmail)} (antes ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: (categoryName: string) => `añadió la categoría «${categoryName}»`,
        deleteCategory: (categoryName: string) => `eliminó la categoría "${categoryName}"`,
        updateCategory: (categoryName: string, oldValue: boolean) => `${oldValue ? 'desactivado' : 'activado'} la categoría «${categoryName}»`,
        updateCategoryPayrollCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `añadió el código de nómina «${newValue}» a la categoría «${categoryName}»`;
            }
            if (!newValue && oldValue) {
                return `eliminó el código de nómina «${oldValue}» de la categoría «${categoryName}»`;
            }
            return `cambió el código de nómina de la categoría «${categoryName}» a «${newValue}» (antes «${oldValue}»)`;
        },
        updateCategoryGLCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `añadió el código GL «${newValue}» a la categoría «${categoryName}»`;
            }
            if (!newValue && oldValue) {
                return `eliminó el código GL «${oldValue}» de la categoría «${categoryName}»`;
            }
            return `cambió el código GL de la categoría «${categoryName}» a «${newValue}» (antes «${oldValue}»)`;
        },
        updateAreCommentsRequired: (categoryName: string, oldValue: boolean) => {
            return `cambió la descripción de la categoría "${categoryName}" a ${!oldValue ? 'obligatorio' : 'no requerido'} (anteriormente ${!oldValue ? 'no requerido' : 'obligatorio'})`;
        },
        updateCategoryMaxExpenseAmount: (categoryName: string, newAmount?: string, oldAmount?: string) => {
            if (newAmount && !oldAmount) {
                return `añadió un importe máximo de ${newAmount} a la categoría "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `eliminó el importe máximo de ${oldAmount} de la categoría «${categoryName}»`;
            }
            return `cambió el monto máximo de la categoría "${categoryName}" a ${newAmount} (antes ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `añadió un tipo de límite de ${newValue} a la categoría «${categoryName}»`;
            }
            return `cambió el tipo de límite de la categoría «${categoryName}» a ${newValue} (antes ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `actualizó la categoría "${categoryName}" cambiando Recibos a ${newValue}`;
            }
            return `cambió la categoría «${categoryName}» a ${newValue} (antes ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: (categoryName: string, oldValue: string | undefined, newValue: string) => {
            if (!oldValue) {
                return `actualizó la categoría "${categoryName}" cambiando los recibos detallados a ${newValue}`;
            }
            return `cambió los recibos desglosados de la categoría «${categoryName}» a ${newValue} (antes ${oldValue})`;
        },
        setCategoryName: (oldName: string, newName: string) => `cambió el nombre de la categoría "${oldName}" a "${newName}"`,
        updatedDescriptionHint: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!newValue) {
                return `eliminó la sugerencia de descripción «${oldValue}» de la categoría «${categoryName}»`;
            }
            return !oldValue
                ? `añadió la sugerencia de descripción "${newValue}" a la categoría "${categoryName}"`
                : `cambió la sugerencia de descripción de la categoría "${categoryName}" a “${newValue}” (antes “${oldValue}”)`;
        },
        updateCategories: (count: number) => `actualizó ${count} categorías`,
        updateTagListName: (oldName: string, newName: string) => `cambió el nombre de la lista de etiquetas a «${newName}» (antes «${oldName}»)`,
        updateTagList: (tagListName: string) => `etiquetas actualizadas en la lista «${tagListName}»`,
        updateTagListRequired: (tagListsName: string, isRequired: boolean) => `cambió la lista de etiquetas "${tagListsName}" a ${isRequired ? 'obligatorio' : 'no requerido'}`,
        importTags: 'etiquetas importadas desde una hoja de cálculo',
        deletedAllTags: 'eliminó todas las etiquetas',
        addTag: (tagListName: string, tagName?: string) => `agregó la etiqueta «${tagName}» a la lista «${tagListName}»`,
        updateTagName: (tagListName: string, newName: string, oldName: string) => `actualizó la lista de etiquetas "${tagListName}" cambiando la etiqueta "${oldName}" a "${newName}"`,
        updateTagEnabled: (tagListName: string, tagName?: string, enabled?: boolean) => `${enabled ? 'activado' : 'desactivado'} la etiqueta "${tagName}" en la lista "${tagListName}"`,
        deleteTag: (tagListName: string, tagName?: string) => `eliminó la etiqueta «${tagName}» de la lista «${tagListName}»`,
        deleteMultipleTags: (count?: string, tagListName?: string) => `se eliminaron "${count}" etiquetas de la lista "${tagListName}"`,
        updateTag: (tagListName: string, newValue: string, tagName: string, updatedField: string, oldValue?: string) => {
            if (oldValue) {
                return `actualizó la etiqueta «${tagName}» en la lista «${tagListName}» cambiando ${updatedField} a «${newValue}» (antes «${oldValue}»)`;
            }
            return `actualizó la etiqueta «${tagName}» en la lista «${tagListName}» añadiendo un(a) ${updatedField} de «${newValue}»`;
        },
        updateCustomUnit: (customUnitName: string, newValue: string, oldValue: string, updatedField: string) =>
            `cambió el/la ${customUnitName} ${updatedField} a «${newValue}» (antes «${oldValue}»)`,
        updateCustomUnitTaxEnabled: (newValue: boolean) => `Seguimiento de impuestos en las tarifas por distancia ${newValue ? 'activado' : 'desactivado'}`,
        updateCustomUnitDefaultCategory: (customUnitName: string, newValue?: string, oldValue?: string) =>
            `cambió la categoría predeterminada de ${customUnitName} a "${newValue}" ${oldValue ? `(antes "${oldValue}")` : ''}`,
        importCustomUnitRates: (customUnitName: string) => `tarifas importadas para la unidad personalizada "${customUnitName}"`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `agregó una nueva tarifa de ${customUnitName} «${rateName}»`,
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `eliminó la tarifa de "${customUnitName}" "${rateName}"`,
        updateCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, customUnitSubRateName: string, oldValue: string, newValue: string, updatedField: string) =>
            `cambió la tarifa de "${customUnitName}", la sub-tarifa "${customUnitRateName}" y la sub-tarifa "${customUnitSubRateName}" de ${updatedField} a "${newValue}" (antes "${oldValue}")`,
        removedCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, removedSubRateName: string) =>
            `se eliminó la tarifa «${customUnitName}», subtarifa «${customUnitRateName}» de la subtarifa «${removedSubRateName}»`,
        addedReportField: (fieldType: string, fieldName?: string, defaultValue?: string) =>
            `se agregó el campo de informe ${fieldType} «${fieldName}»${defaultValue ? `con el valor predeterminado "${defaultValue}"` : ''}`,
        updatedCustomUnitRate: (customUnitName: string, customUnitRateName: string, updatedField: string, newValue: string, oldValue: string) =>
            `cambió la tarifa de ${customUnitName} ${updatedField} «${customUnitRateName}» a «${newValue}» (antes «${oldValue}»)`,
        updatedCustomUnitTaxRateExternalID: (customUnitRateName: string, newValue: string, newTaxPercentage: string, oldTaxPercentage?: string, oldValue?: string) => {
            if (oldTaxPercentage && oldValue) {
                return `cambió la tasa de impuesto en la tarifa de distancia «${customUnitRateName}» a «${newValue} (${newTaxPercentage})» (antes «${oldValue} (${oldTaxPercentage})»)`;
            }
            return `se agregó la tasa de impuesto «${newValue} (${newTaxPercentage})» a la tarifa por distancia «${customUnitRateName}»`;
        },
        updatedCustomUnitTaxClaimablePercentage: (customUnitRateName: string, newValue: number, oldValue?: number) => {
            if (oldValue) {
                return `cambió la parte recuperable de impuestos en la tarifa por distancia «${customUnitRateName}» a «${newValue}» (antes «${oldValue}»)`;
            }
            return `agregó una parte recuperable de impuestos de «${newValue}» a la tarifa por distancia «${customUnitRateName}»`;
        },
        updatedCustomUnitRateEnabled: (customUnitName: string, customUnitRateName: string, newValue: boolean) => {
            return `${newValue ? 'activado' : 'desactivado'} la tarifa de ${customUnitName} "${customUnitRateName}"`;
        },
        updateReportFieldDefaultValue: (defaultValue?: string, fieldName?: string) => `establecer el valor predeterminado del campo de informe "${fieldName}" en "${defaultValue}"`,
        addedReportFieldOption: (fieldName: string, optionName: string) => `agregó la opción «${optionName}» al campo de informe «${fieldName}»`,
        removedReportFieldOption: (fieldName: string, optionName: string) => `eliminó la opción «${optionName}» del campo de informe «${fieldName}»`,
        updateReportFieldOptionDisabled: (fieldName: string, optionName: string, optionEnabled: boolean) =>
            `${optionEnabled ? 'activado' : 'desactivado'} la opción «${optionName}» para el campo de informe «${fieldName}»`,
        updateReportFieldAllOptionsDisabled: (fieldName: string, optionName: string, allEnabled: boolean, toggledOptionsCount?: number) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'activado' : 'desactivado'} todas las opciones para el campo de informe "${fieldName}"`;
            }
            return `${allEnabled ? 'activado' : 'desactivado'} la opción «${optionName}» para el campo de informe «${fieldName}», haciendo que todas las opciones sean ${allEnabled ? 'activado' : 'desactivado'}`;
        },
        deleteReportField: ({fieldType, fieldName}: {fieldType: string; fieldName?: string}) => `eliminó el campo de informe de ${fieldType} «${fieldName}»`,
        addedCardFeed: (feedName: string) => `se agregó la fuente de tarjeta «${feedName}»`,
        removedCardFeed: (feedName: string) => `se eliminó la conexión de tarjeta "${feedName}"`,
        renamedCardFeed: (newName: string, oldName: string) => `cambió el nombre del feed de tarjeta a «${newName}» (antes «${oldName}»)`,
        assignedCompanyCard: (email: string, feedName: string, cardLastFour: string) =>
            `asignó a ${email} la tarjeta de empresa ${feedName ? `"${feedName}" ` : ''} que termina en ${cardLastFour}`,
        unassignedCompanyCard: (email: string, feedName: string, cardLastFour: string) =>
            `no asignada ${email} tarjeta de empresa ${feedName ? `"${feedName}" ` : ''} que termina en ${cardLastFour}`,
        updatedCardFeedLiability: (feedName: string, enabled: boolean) =>
            `${enabled ? 'activado' : 'desactivado'} titulares de tarjetas para eliminar transacciones de tarjetas del flujo de tarjetas "${feedName}"`,
        updatedCardFeedStatementPeriod: (feedName: string, newValue?: string, previousValue?: string) =>
            `cambió el día de fin del período del extracto del feed de tarjeta "${feedName}"${newValue ? `a "${newValue}"` : ''}${previousValue ? `(anteriormente "${previousValue}")` : ''}`,
        preventSelfApproval: (oldValue: string, newValue: string) =>
            `actualizó "Prevenir la autoaprobación" a "${newValue === 'true' ? 'Activado' : 'Desactivado'}" (antes "${oldValue === 'true' ? 'Activado' : 'Desactivado'}")`,
        updateMonthlyOffset: (oldValue: string, newValue: string) => {
            if (!oldValue) {
                return `establecer la fecha de envío del informe mensual en «${newValue}»`;
            }
            return `actualizó la fecha de envío del informe mensual a «${newValue}» (antes «${oldValue}»)`;
        },
        updateDefaultBillable: (oldValue: string, newValue: string) => `actualizó "Refacturar gastos a clientes" a "${newValue}" (antes "${oldValue}")`,
        updateDefaultReimbursable: (oldValue: string, newValue: string) => `se actualizó "Gasto en efectivo predeterminado" a "${newValue}" (antes "${oldValue}")`,
        updateDefaultTitleEnforced: (value: boolean) => `activó «Aplicar títulos de informe predeterminados» ${value ? 'activado' : 'apagado'}`,
        changedCustomReportNameFormula: (oldValue: string, newValue: string) => `cambió la fórmula del nombre del informe personalizado a «${newValue}» (antes «${oldValue}»)`,
        renamedWorkspaceNameAction: (oldName: string, newName: string) => `actualizó el nombre de este espacio de trabajo a «${newName}» (antes «${oldName}»)`,
        updateWorkspaceDescription: (newDescription: string, oldDescription: string) =>
            !oldDescription
                ? `establecer la descripción de este espacio de trabajo en "${newDescription}"`
                : `actualizó la descripción de este espacio de trabajo a «${newDescription}» (antes «${oldDescription}»)`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('y');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `te quitó del flujo de aprobación y del chat de gastos de ${joinedNames}. Los informes enviados anteriormente seguirán disponibles para su aprobación en tu Bandeja de entrada.`,
                other: `te quitó de los flujos de aprobación y chats de gastos de ${joinedNames}. Los informes enviados anteriormente seguirán disponibles para aprobación en tu Bandeja de entrada.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `actualizó tu rol en ${policyName} de ${oldRole} a usuario. Has sido eliminado de todos los chats de gastos de personas que informan gastos, excepto del tuyo propio.`,
        updatedWorkspaceCurrencyAction: (oldCurrency: string, newCurrency: string) => `actualizó la moneda predeterminada a ${newCurrency} (anteriormente ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: (oldFrequency: string, newFrequency: string) => `actualizó la frecuencia de informes automáticos a «${newFrequency}» (antes «${oldFrequency}»)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `actualizó el modo de aprobación a «${newValue}» (antes «${oldValue}»)`,
        upgradedWorkspace: 'actualizó este espacio de trabajo al plan Control',
        forcedCorporateUpgrade: `Este espacio de trabajo se ha actualizado al plan Control. Haz clic <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">aquí</a> para obtener más información.`,
        downgradedWorkspace: 'degradó este espacio de trabajo al plan Collect',
        updatedAuditRate: (oldAuditRate: number, newAuditRate: number) =>
            `cambió la tasa de informes asignados aleatoriamente para aprobación manual a ${Math.round(newAuditRate * 100)}% (antes ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: (oldLimit: string, newLimit: string) => `cambió el límite de aprobación manual para todos los gastos a ${newLimit} (antes ${oldLimit})`,
        addBudget: (frequency: string, entityName: string, entityType: string, shared?: string, individual?: string, notificationThreshold?: number) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `con un umbral de notificación de "${notificationThreshold}%"` : '';
            if (typeof shared !== 'undefined' && typeof individual !== 'undefined') {
                return `se agregó un presupuesto individual ${frequency} de «${individual}» y un presupuesto compartido ${frequency} de «${shared}»${thresholdSuffix} al/la ${entityType} «${entityName}»`;
            }
            if (typeof individual !== 'undefined') {
                return `se agregó un presupuesto individual de ${frequency} de "${individual}"${thresholdSuffix} al/la ${entityType} "${entityName}"`;
            }
            return `se agregó un presupuesto compartido ${frequency} de «${shared}»${thresholdSuffix} al ${entityType} «${entityName}»`;
        },
        updateBudget: (
            entityType: string,
            entityName: string,
            oldFrequency?: string,
            newFrequency?: string,
            oldIndividual?: string,
            newIndividual?: string,
            oldShared?: string,
            newShared?: string,
            oldNotificationThreshold?: number,
            newNotificationThreshold?: number,
        ) => {
            const frequencyChanged = !!(newFrequency && oldFrequency !== newFrequency);
            const sharedChanged = !!(newShared && oldShared !== newShared);
            const individualChanged = !!(newIndividual && oldIndividual !== newIndividual);
            const thresholdChanged = typeof newNotificationThreshold === 'number' && oldNotificationThreshold !== newNotificationThreshold;
            const changesList: string[] = [];
            if (frequencyChanged) {
                changesList.push(`cambió la frecuencia del presupuesto a «${newFrequency}» (antes «${oldFrequency}»)`);
            }
            if (sharedChanged) {
                changesList.push(`cambió el presupuesto total del espacio de trabajo a «${newShared}» (antes «${oldShared}»)`);
            }
            if (individualChanged) {
                changesList.push(`cambió el presupuesto individual a «${newIndividual}» (antes «${oldIndividual}»)`);
            }
            if (thresholdChanged) {
                changesList.push(`cambió el umbral de notificación a «${newNotificationThreshold}%» (antes «${oldNotificationThreshold}%»)`);
            }
            if (!frequencyChanged && !sharedChanged && !individualChanged && !thresholdChanged) {
                return `presupuesto actualizado para el/la ${entityType} «${entityName}»`;
            }
            if (changesList.length === 1) {
                if (frequencyChanged) {
                    return `cambió la frecuencia del presupuesto para la ${entityType} «${entityName}» a «${newFrequency}» (antes «${oldFrequency}»)`;
                }
                if (sharedChanged) {
                    return `cambió el presupuesto total del espacio de trabajo para el ${entityType} «${entityName}» a «${newShared}» (antes «${oldShared}»)`;
                }
                if (individualChanged) {
                    return `cambió el presupuesto individual para el/la ${entityType} «${entityName}» a «${newIndividual}» (antes «${oldIndividual}»)`;
                }
                return `cambió el umbral de notificación para el/la ${entityType} «${entityName}» a «${newNotificationThreshold}%» (antes «${oldNotificationThreshold}%»)`;
            }
            return `presupuesto actualizado para ${entityType} «${entityName}»: ${changesList.join('; ')}`;
        },
        deleteBudget: (entityType: string, entityName: string, frequency?: string, individual?: string, shared?: string, notificationThreshold?: number) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `con un umbral de notificación de "${notificationThreshold}%"` : '';
            if (shared && individual) {
                return `se eliminaron ${frequency} el presupuesto compartido de «${shared}» y el presupuesto individual de «${individual}»${thresholdSuffix} de la/el ${entityType} «${entityName}»`;
            }
            if (shared) {
                return `se eliminó el presupuesto compartido de ${frequency} "${shared}"${thresholdSuffix} de la ${entityType} "${entityName}"`;
            }
            if (individual) {
                return `se eliminó el presupuesto individual ${frequency} de «${individual}»${thresholdSuffix} del/de la ${entityType} «${entityName}»`;
            }
            return `se eliminó el presupuesto del/de la ${entityType} «${entityName}»`;
        },
        updatedTimeEnabled: (enabled?: boolean) => {
            return `${enabled ? 'activado' : 'desactivado'} seguimiento de tiempo`;
        },
        updatedTimeRate: (newRate?: string, oldRate?: string) => {
            return `cambió la tarifa por hora a «${newRate}» (antes «${oldRate}»)`;
        },
        addedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `se agregó «${prohibitedExpense}» a los gastos prohibidos`,
        removedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `eliminó "${prohibitedExpense}" de los gastos prohibidos`,
        updatedReimbursementChoice: (newReimbursementChoice: string, oldReimbursementChoice: string) =>
            `cambió el método de reembolso a «${newReimbursementChoice}» (antes «${oldReimbursementChoice}»)`,
        setAutoJoin: ({enabled}: {enabled: boolean}) => `${enabled ? 'activado' : 'desactivado'} aprobación previa de solicitudes para unirse al espacio de trabajo`,
        updatedDefaultTitle: (newDefaultTitle: string, oldDefaultTitle: string) =>
            `cambió la fórmula del nombre del informe personalizado a «${newDefaultTitle}» (antes «${oldDefaultTitle}»)`,
        updatedOwnership: (oldOwnerEmail: string, oldOwnerName: string, policyName: string) => `asumió la propiedad de ${policyName} de parte de ${oldOwnerName} (${oldOwnerEmail})`,
        updatedAutoHarvesting: (enabled: boolean) => `Envío programado de ${enabled ? 'activado' : 'desactivado'}`,
        updatedIndividualBudgetNotification: (
            budgetAmount: string,
            budgetFrequency: string,
            budgetName: string,
            budgetTypeForNotificationMessage: string,
            thresholdPercentage: number,
            totalSpend: number,
            unsubmittedSpend: number,
            awaitingApprovalSpend: number,
            approvedReimbursedClosedSpend: number,
            summaryLink?: string,
            userEmail?: string,
        ) =>
            `¡Atención! Este espacio de trabajo tiene un presupuesto ${budgetFrequency} de «${budgetAmount}» para el/la ${budgetTypeForNotificationMessage} «${budgetName}». ${userEmail} está actualmente en ${approvedReimbursedClosedSpend}, lo que supera el ${thresholdPercentage}% del presupuesto. Además, hay ${awaitingApprovalSpend} en espera de aprobación y ${unsubmittedSpend} que aún no se han enviado, para un total de ${totalSpend}.${summaryLink ? `<a href="${summaryLink}">Aquí tienes un informe</a> con todos esos gastos para tu registro.` : ''}`,
        updatedSharedBudgetNotification: (
            budgetAmount: string,
            budgetFrequency: string,
            budgetName: string,
            budgetTypeForNotificationMessage: string,
            summaryLink: string | undefined,
            thresholdPercentage: number,
            totalSpend: number,
            unsubmittedSpend: number,
            awaitingApprovalSpend: number,
            approvedReimbursedClosedSpend: number,
        ) =>
            `¡Aviso! Este espacio de trabajo tiene un presupuesto ${budgetFrequency} de «${budgetAmount}» para el/la ${budgetTypeForNotificationMessage} «${budgetName}». Actualmente llevas ${approvedReimbursedClosedSpend}, lo que supera el ${thresholdPercentage}% del presupuesto. También hay ${awaitingApprovalSpend} en espera de aprobación y ${unsubmittedSpend} que aún no se ha enviado, para un total de ${totalSpend}. ${summaryLink ? `<a href="${summaryLink}">Aquí tienes un informe</a> con todos esos gastos para tus registros.` : ''}`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'activado' : 'desactivado'} categorías`;
                case 'tags':
                    return `${enabled ? 'activado' : 'desactivado'} etiquetas`;
                case 'workflows':
                    return `Flujos de trabajo ${enabled ? 'activado' : 'desactivado'}`;
                case 'distance rates':
                    return `Tarifas de distancia ${enabled ? 'activado' : 'desactivado'}`;
                case 'accounting':
                    return `${enabled ? 'activado' : 'desactivado'} contabilidad`;
                case 'Expensify Cards':
                    return `${enabled ? 'activado' : 'desactivado'} Tarjetas Expensify`;
                case 'travel invoicing':
                    return `${enabled ? 'activado' : 'desactivado'} facturación de viajes`;
                case 'company cards':
                    return `${enabled ? 'activado' : 'desactivado'} tarjetas corporativas`;
                case 'invoicing':
                    return `Facturación de ${enabled ? 'activado' : 'desactivado'}`;
                case 'per diem':
                    return `${enabled ? 'activado' : 'desactivado'} de viáticos`;
                case 'receipt partners':
                    return `Socios de recibos ${enabled ? 'activado' : 'desactivado'}`;
                case 'rules':
                    return `Reglas de ${enabled ? 'activado' : 'desactivado'}`;
                case 'tax tracking':
                    return `Seguimiento de impuestos ${enabled ? 'activado' : 'desactivado'}`;
                default:
                    return `${enabled ? 'activado' : 'desactivado'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `seguimiento de asistentes ${enabled ? 'activado' : 'desactivado'}`,
        updatedRequireCompanyCards: ({enabled}: {enabled: boolean}) => `${enabled ? 'activado' : 'desactivado'} el requisito de compras con tarjeta de empresa`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? 'activado' : 'desactivado'} informes aprobados para pago automático`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `establecer el umbral de aprobación automática de informes en «${newLimit}»`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `cambió el umbral de aprobación automática de informes a «${newLimit}» (antes «${oldLimit}»)`,
        removedAutoPayApprovedReportsLimit: 'eliminó el umbral de aprobación automática de informes',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `cambió la persona aprobadora predeterminada a ${newApprover} (antes ${previousApprover})` : `cambió la persona aprobadora predeterminada a ${newApprover}`,
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
            let text = `cambió el flujo de aprobación para que ${members} envíen informes a ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `(antes persona aprobadora predeterminada ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(antes aprobador predeterminado)';
            } else if (previousApprover) {
                text += `(antes ${previousApprover})`;
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
                ? `cambió el flujo de aprobación de ${members} para que envíen informes al aprobador predeterminado ${approver}`
                : `cambió el flujo de aprobación de ${members} para enviar los informes a la persona aprobadora predeterminada`;
            if (wasDefaultApprover && previousApprover) {
                text += `(antes persona aprobadora predeterminada ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(antes aprobador predeterminado)';
            } else if (previousApprover) {
                text += `(antes ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `cambió el flujo de aprobación de ${approver} para reenviar los informes aprobados a ${forwardsTo} (anteriormente se reenviaban a ${previousForwardsTo})`
                : `cambió el flujo de aprobación para ${approver} para reenviar los informes aprobados a ${forwardsTo} (antes los informes aprobados finales)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `cambió el flujo de aprobación de ${approver} para dejar de reenviar los informes aprobados (anteriormente se reenviaban a ${previousForwardsTo})`
                : `cambió el flujo de aprobación de ${approver} para dejar de reenviar los informes aprobados`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `cambió el nombre de la empresa de la factura a «${newValue}» (antes «${oldValue}»)` : `establece el nombre de la empresa de la factura en «${newValue}»`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue
                ? `cambió el sitio web de la empresa de la factura a «${newValue}» (anteriormente «${oldValue}»)`
                : `establecer el sitio web de la empresa de la factura a "${newValue}"`,
        changedReimburser: (newReimburser: string, previousReimburser?: string) =>
            previousReimburser
                ? `cambió la persona autorizada para pagar a «${newReimburser}» (antes «${previousReimburser}»)`
                : `cambió la persona autorizada para el reembolso a «${newReimburser}»`,
        updateReimbursementEnabled: (enabled: boolean) => `Reembolsos ${enabled ? 'activado' : 'desactivado'}`,
        updateCustomTaxName: (oldName: string, newName: string) => `cambió el nombre del impuesto personalizado a «${newName}» (antes «${oldName}»)`,
        updateCurrencyDefaultTax: (oldName: string, newName: string) => `cambió la tasa de impuesto predeterminada de la moneda del espacio de trabajo a «${newName}» (antes «${oldName}»)`,
        updateForeignCurrencyDefaultTax: (oldName: string, newName: string) => `cambió la tasa de impuesto predeterminada de moneda extranjera a «${newName}» (anteriormente «${oldName}»)`,
        addTax: (taxName: string) => `añadió el impuesto «${taxName}»`,
        deleteTax: (taxName: string) => `eliminó el impuesto «${taxName}»`,
        updateTax: (oldValue?: string | boolean | number, taxName?: string, updatedField?: string, newValue?: string | boolean | number) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `cambió el nombre del impuesto de «${oldValue}» a «${newValue}»`;
                }
                case 'code': {
                    return `cambió el código de impuesto para «${taxName}» de «${oldValue}» a «${newValue}»`;
                }
                case 'rate': {
                    return `cambió la tasa de impuesto de "${taxName}" de "${oldValue}" a "${newValue}"`;
                }
                case 'enabled': {
                    return `${oldValue ? 'desactivado' : 'activado'} el impuesto «${taxName}»`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: (newValue: string) => `establecer el importe requerido del recibo en «${newValue}»`,
        changedReceiptRequiredAmount: (oldValue: string, newValue: string) => `cambió el importe requerido del recibo a «${newValue}» (antes «${oldValue}»)`,
        removedReceiptRequiredAmount: (oldValue: string) => `se eliminó el importe requerido del recibo (antes "${oldValue}")`,
        setMaxExpenseAmount: (newValue: string) => `establecer el importe máximo del gasto en «${newValue}»`,
        changedMaxExpenseAmount: (oldValue: string, newValue: string) => `cambió el monto máximo de gasto a «${newValue}» (antes «${oldValue}»)`,
        removedMaxExpenseAmount: (oldValue: string) => `eliminó el importe máximo de gasto (antes «${oldValue}»)`,
        setMaxExpenseAge: (newValue: string) => `establecer antigüedad máxima del gasto en "${newValue}" días`,
        changedMaxExpenseAge: (oldValue: string, newValue: string) => `cambió la antigüedad máxima del gasto a "${newValue}" días (antes "${oldValue}")`,
        removedMaxExpenseAge: (oldValue: string) => `se eliminó la antigüedad máxima de gastos (antes "${oldValue}" días)`,
    },
    roomMembersPage: {
        memberNotFound: 'No se encontró el miembro.',
        useInviteButton: 'Para invitar a una nueva persona al chat, usa el botón de invitación de arriba.',
        notAuthorized: `No tienes acceso a esta página. Si estás intentando unirte a esta sala, solo pídele a una persona miembro de la sala que te agregue. ¿Algo más? Comunícate con ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Parece que esta sala fue archivada. Si tienes preguntas, comunícate con ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `¿Seguro que quieres eliminar a ${memberName} de la sala?`,
            other: '¿Estás seguro de que quieres eliminar a los miembros seleccionados de la sala?',
        }),
        error: {
            genericAdd: 'Hubo un problema al añadir a esta persona a la sala',
        },
    },
    newTaskPage: {
        assignTask: 'Asignar tarea',
        assignMe: 'Asignar a mí',
        confirmTask: 'Confirmar tarea',
        confirmError: 'Ingresa un título y selecciona un destino para compartir',
        descriptionOptional: 'Descripción (opcional)',
        pleaseEnterTaskName: 'Introduce un título',
        pleaseEnterTaskDestination: 'Selecciona dónde quieres compartir esta tarea',
    },
    task: {
        task: 'Tarea',
        title: 'Título',
        description: 'Descripción',
        assignee: 'Cesionario',
        completed: 'Completado',
        action: 'Completar',
        messages: {
            created: (title: string) => `tarea para ${title}`,
            completed: 'marcado como completo',
            canceled: 'tarea eliminada',
            reopened: 'marcado como incompleto',
            error: 'No tienes permiso para realizar la acción solicitada',
        },
        markAsComplete: 'Marcar como completado',
        markAsIncomplete: 'Marcar como incompleto',
        assigneeError: 'Se produjo un error al asignar esta tarea. Prueba con otra persona asignada.',
        genericCreateTaskFailureMessage: 'Se produjo un error al crear esta tarea. Inténtalo de nuevo más tarde.',
        deleteTask: 'Eliminar tarea',
        deleteConfirmation: '¿Estás seguro de que quieres eliminar esta tarea?',
    },
    statementPage: {
        title: (year: number | string, monthName: string) => `Estado de cuenta de ${monthName} de ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Atajos de teclado',
        subtitle: 'Ahorra tiempo con estos prácticos atajos de teclado:',
        shortcuts: {
            openShortcutDialog: 'Abre el diálogo de atajos de teclado',
            markAllMessagesAsRead: 'Marcar todos los mensajes como leídos',
            escape: 'Cerrar cuadros de diálogo',
            search: 'Abrir cuadro de búsqueda',
            newChat: 'Nueva pantalla de chat',
            copy: 'Copiar comentario',
            openDebug: 'Abrir el cuadro de preferencias de prueba',
        },
    },
    guides: {
        screenShare: 'Compartir pantalla',
        screenShareRequest: 'Expensify te está invitando a compartir pantalla',
    },
    search: {
        tabs: {
            expenseReports: 'Informes de gastos',
            reports: 'Informes',
            expenses: 'Gastos',
            submit: 'Borradores',
            approve: 'Requiere aprobación',
            pay: 'Listo para pagar',
            accounting: 'Contabilidad',
            export: 'En espera de exportación',
            unapprovedCash: 'Devengos de efectivo',
            unapprovedCard: 'Devengos de tarjeta',
            statements: 'Estados de tarjeta',
            reconciliation: 'Conciliación bancaria',
            insights: 'Información',
            topSpenders: 'Quienes más gastan',
            topCategories: 'Categorías principales',
            topMerchants: 'Comercios principales',
        },
        resultsAreLimited: 'Los resultados de búsqueda son limitados.',
        viewResults: 'Ver resultados',
        appliedFilters: 'Filtros aplicados',
        resetFilters: 'Restablecer filtros',
        searchResults: {
            emptyResults: {
                title: 'Nada que mostrar',
                subtitle: `Prueba ajustando tus criterios de búsqueda o crea algo con el botón +.`,
            },
            emptyExpenseResults: {
                title: 'Aún no has creado ningún gasto',
                subtitle: 'Crea un gasto o prueba Expensify para obtener más información.',
                subtitleWithOnlyCreateButton: 'Usa el botón verde de abajo para crear un gasto.',
            },
            emptyReportResults: {
                title: 'Todavía no has creado ningún informe',
                subtitle: 'Crea un informe o haz una prueba de Expensify para obtener más información.',
                subtitleWithOnlyCreateButton: 'Usa el botón verde de abajo para crear un informe.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    Todavía no has creado ninguna
                    factura
                `),
                subtitle: 'Envía una factura o haz una prueba de Expensify para obtener más información.',
                subtitleWithOnlyCreateButton: 'Usa el botón verde de abajo para enviar una factura.',
            },
            emptyTripResults: {
                title: 'No hay viajes para mostrar',
                subtitle: 'Comienza reservando tu primer viaje a continuación.',
                buttonText: 'Reservar un viaje',
            },
            emptySubmitResults: {
                title: 'No hay gastos para enviar',
                subtitle: 'Todo listo. ¡Disfruta tu victoria!',
                buttonText: 'Crear informe',
            },
            emptyApproveResults: {
                title: 'No hay gastos que aprobar',
                subtitle: 'Cero gastos. Máxima calma. ¡Bien hecho!',
            },
            emptyPayResults: {
                title: 'No hay gastos por pagar',
                subtitle: '¡Felicidades! Cruzaste la línea de meta.',
            },
            emptyExportResults: {
                title: 'No hay gastos para exportar',
                subtitle: 'Es hora de tomárselo con calma, buen trabajo.',
            },
            emptyStatementsResults: {
                title: 'No hay gastos para mostrar',
                subtitle: 'Sin resultados. Prueba ajustando tus filtros.',
            },
            emptyUnapprovedResults: {
                title: 'No hay gastos que aprobar',
                subtitle: 'Cero gastos. Máxima calma. ¡Bien hecho!',
            },
        },
        columns: 'Columnas',
        editColumns: 'Editar columnas',
        resetColumns: 'Restablecer columnas',
        groupColumns: 'Agrupar columnas',
        expenseColumns: 'Columnas de gastos',
        saveSearch: 'Guardar búsqueda',
        deleteSavedSearch: 'Eliminar búsqueda guardada',
        deleteSavedSearchConfirm: '¿Estás seguro de que quieres eliminar esta búsqueda?',
        searchName: 'Buscar nombre',
        savedSearchesMenuItemTitle: 'Guardado',
        spendOverTime: 'Gasto a lo largo del tiempo',
        groupedExpenses: 'gastos agrupados',
        bulkActions: {
            editMultiple: 'Editar varios',
            editMultipleTitle: 'Editar varios gastos',
            editMultipleDescription: 'Los cambios se aplicarán a todos los gastos seleccionados y reemplazarán cualquier valor establecido anteriormente. Solo digo.',
            approve: 'Aprobar',
            pay: 'Pagar',
            delete: 'Eliminar',
            hold: 'Retener',
            unhold: 'Eliminar retención',
            reject: 'Rechazar',
            duplicateExpense: ({count}: {count: number}) => `Duplicar ${count === 1 ? 'gasto' : 'gastos'}`,
            duplicateReport: ({count}: {count: number}) => `Duplicado ${count === 1 ? 'informe' : 'informes'}`,
            undelete: 'Restaurar',
            noOptionsAvailable: 'No hay opciones disponibles para el grupo de gastos seleccionado.',
        },
        filtersHeader: 'Filtros',
        filters: {
            date: {
                before: (date?: string) => `Antes de ${date ?? ''}`,
                after: (date?: string) => `Después de ${date ?? ''}`,
                on: (date?: string) => `En ${date ?? ''}`,
                customDate: 'Fecha personalizada',
                customRange: 'Rango personalizado',
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Nunca',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'El mes pasado',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'Este mes',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: 'Año hasta la fecha',
                    [CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS]: 'Últimos 12 meses',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Último estado de cuenta',
                },
            },
            status: 'Estado',
            keyword: 'Palabra clave',
            keywords: 'Palabras clave',
            limit: 'Límite',
            limitDescription: 'Establece un límite para los resultados de tu búsqueda.',
            currency: 'Moneda',
            completed: 'Completado',
            amount: {
                lessThan: (amount?: string) => `Menos de ${amount ?? ''}`,
                greaterThan: (amount?: string) => `Mayor que ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `Entre ${greaterThan} y ${lessThan}`,
                equalTo: (amount?: string) => `Igual a ${amount ?? ''}`,
            },
            card: {
                expensify: 'Expensify',
                centralInvoicing: 'Facturación centralizada',
                individualCards: 'Tarjetas individuales',
                closedCards: 'Tarjetas cerradas',
                cardFeeds: 'Flujos de tarjeta',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Todas las ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Todas las tarjetas CSV importadas${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: (name: string, value: string) => `${name} es ${value}`,
            current: 'Actual',
            past: 'Pasado',
            submitted: 'Enviado',
            approved: 'Aprobado',
            paid: 'Pagado',
            exported: 'Exportado',
            posted: 'Publicado',
            withdrawn: 'Retirado',
            billable: 'Facturable',
            reimbursable: 'Reembolsable',
            purchaseCurrency: 'Moneda de compra',
            sortOrder: {
                [CONST.SEARCH.SORT_ORDER.ASC]: 'Ascendente',
                [CONST.SEARCH.SORT_ORDER.DESC]: 'Descendente',
            },
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: 'Desde',
                [CONST.SEARCH.GROUP_BY.CARD]: 'Tarjeta',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'ID de retiro',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Categoría',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: 'Comercio',
                [CONST.SEARCH.GROUP_BY.TAG]: 'Etiqueta',
                [CONST.SEARCH.GROUP_BY.MONTH]: 'Mes',
                [CONST.SEARCH.GROUP_BY.WEEK]: 'Semana',
                [CONST.SEARCH.GROUP_BY.YEAR]: 'Año',
                [CONST.SEARCH.GROUP_BY.QUARTER]: 'Trimestre',
            },
            feed: 'Feed',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Tarjeta Expensify',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: 'Reembolso',
            },
            is: 'Es',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: 'Enviar',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: 'Aprobar',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: 'Pagar',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'Exportar',
            },
        },
        display: {
            label: 'Mostrar',
            sortBy: 'Ordenar por',
            sortOrder: 'Orden de clasificación',
            groupBy: 'Agrupar por',
            limitResults: 'Limitar resultados',
        },
        has: 'Tiene',
        view: {
            label: 'Ver',
            table: 'Tabla',
            bar: 'Bar',
            line: 'Línea',
            pie: 'Pastel',
        },
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: 'Desde',
            [CONST.SEARCH.GROUP_BY.CARD]: 'Tarjetas',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'Exportaciones',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Categorías',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: 'Comerciantes',
            [CONST.SEARCH.GROUP_BY.TAG]: 'Etiquetas',
            [CONST.SEARCH.GROUP_BY.MONTH]: 'Meses',
            [CONST.SEARCH.GROUP_BY.WEEK]: 'Semanas',
            [CONST.SEARCH.GROUP_BY.YEAR]: 'Años',
            [CONST.SEARCH.GROUP_BY.QUARTER]: 'Trimestres',
        },
        moneyRequestReport: {
            emptyStateTitle: 'Este informe no tiene gastos.',
            accessPlaceHolder: 'Abrir para ver detalles',
        },
        noCategory: 'Sin categoría',
        noMerchant: 'Sin comerciante',
        noTag: 'Sin etiqueta',
        expenseType: 'Tipo de gasto',
        withdrawalType: 'Tipo de retiro',
        recentSearches: 'Búsquedas recientes',
        recentChats: 'Chats recientes',
        searchIn: 'Buscar en',
        askConcierge: (message: string) => `Preguntar a Concierge “${message}”`,
        searchPlaceholder: 'Busca algo...',
        suggestions: 'Sugerencias',
        suggestionsAvailable: (
            {
                count,
            }: {
                count: number;
            },
            query = '',
        ) => ({
            one: `Sugerencias disponibles${query ? `para ${query}` : ''}. ${count} resultado.`,
            other: (resultCount: number) => `Sugerencias disponibles${query ? `para ${query}` : ''}. ${resultCount} resultados.`,
        }),
        exportSearchResults: {
            title: 'Crear exportación',
            description: '¡Vaya, son muchos elementos! Los agruparemos y Concierge te enviará un archivo en breve.',
        },
        exportedTo: 'Exportado a',
        exportAll: {
            selectAllMatchingItems: 'Selecciona todos los elementos que coincidan',
            allMatchingItemsSelected: 'Todos los elementos coincidentes seleccionados',
        },
        errors: {
            pleaseSelectDatesForBothFromAndTo: 'Selecciona fechas tanto para Desde como para Hasta',
        },
    },
    genericErrorPage: {
        title: '¡Uy! ¡Algo salió mal!',
        body: {
            helpTextMobile: 'Cierra y vuelve a abrir la app, o cambia a',
            helpTextWeb: 'web.',
            helpTextConcierge: 'Si el problema persiste, ponte en contacto con',
        },
        refresh: 'Actualizar',
    },
    fileDownload: {
        success: {
            title: '¡Descargado!',
            message: '¡Adjunto descargado correctamente!',
            qrMessage:
                'Busca en tu carpeta de fotos o de descargas una copia de tu código QR. Consejo profesional: agrégalo a una presentación para que tu audiencia lo escanee y se conecte contigo directamente.',
        },
        generalError: {
            title: 'Error de adjunto',
            message: 'No se puede descargar el archivo adjunto',
        },
        permissionError: {
            title: 'Acceso al almacenamiento',
            message: 'Expensify no puede guardar archivos adjuntos sin acceso al almacenamiento. Toca en configuración para actualizar los permisos.',
        },
    },
    settlement: {
        status: {
            pending: 'Pendiente',
            cleared: 'Compensado',
            failed: 'Error',
        },
        failedError: ({link}: {link: string}) => `Volveremos a intentar esta liquidación cuando <a href="${link}">desbloquees tu cuenta</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • ID de retiro: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'Diseño del informe',
        groupByLabel: 'Agrupar por:',
        selectGroupByOption: 'Selecciona cómo agrupar los gastos del informe',
        uncategorized: 'Sin categoría',
        noTag: 'Sin etiqueta',
        selectGroup: ({groupName}: {groupName: string}) => `Seleccionar todos los gastos en ${groupName}`,
        groupBy: {
            category: 'Categoría',
            tag: 'Etiqueta',
        },
    },
    report: {
        newReport: {
            createExpense: 'Crear gasto',
            createReport: 'Crear informe',
            chooseWorkspace: 'Elige un espacio de trabajo para este informe.',
            emptyReportConfirmationTitle: 'Ya tienes un informe vacío',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `¿Estás seguro de que quieres crear otro informe en ${workspaceName}? Puedes acceder a tus informes vacíos en`,
            emptyReportConfirmationDontShowAgain: 'No volver a mostrar esto',
            genericWorkspaceName: 'este espacio de trabajo',
        },
        genericCreateReportFailureMessage: 'Error inesperado al crear este chat. Vuelve a intentarlo más tarde.',
        genericAddCommentFailureMessage: 'Error inesperado al publicar el comentario. Inténtalo de nuevo más tarde.',
        genericUpdateReportFieldFailureMessage: 'Error inesperado al actualizar el campo. Inténtalo de nuevo más tarde.',
        genericUpdateReportNameEditFailureMessage: 'Error inesperado al cambiar el nombre del informe. Inténtalo de nuevo más tarde.',
        noActivityYet: 'Aún no hay actividad',
        connectionSettings: 'Configuración de conexión',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `cambió ${fieldName} a «${newValue}» (antes «${oldValue}»)`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `establecer ${fieldName} en «${newValue}»`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `cambió el espacio de trabajo${fromPolicyName ? `(antes ${fromPolicyName})` : ''}`;
                    }
                    return `cambió el espacio de trabajo a ${toPolicyName}${fromPolicyName ? `(antes ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `cambió el tipo de ${oldType} a ${newType}`,
                exportedToCSV: `exportado a CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `exportado a ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `exportado a ${label} mediante`,
                    automaticActionTwo: 'configuración de contabilidad',
                    manual: (label: string) => `marcó este informe como exportado manualmente a ${label}.`,
                    automaticActionThree: 'y creó correctamente un registro para',
                    reimburseableLink: 'gastos de bolsillo',
                    nonReimbursableLink: 'gastos con tarjeta de la empresa',
                    pending: (label: string) => `empezó a exportar este informe a ${label}...`,
                },
                integrationsMessage: (errorMessage: string, label: string, linkText?: string, linkURL?: string) =>
                    `no se pudo exportar este informe a ${label} ("${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `agregó un recibo`,
                managerDetachReceipt: `eliminó un recibo`,
                markedReimbursed: (amount: string, currency: string) => `pagó ${currency}${amount} en otro lugar`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `pagó ${currency}${amount} mediante integración`,
                outdatedBankAccount: `no se pudo procesar el pago debido a un problema con la cuenta bancaria de la persona que paga`,
                reimbursementACHBounceDefault: `no se pudo procesar el pago debido a un número de ruta/cuenta incorrecto o una cuenta cerrada`,
                reimbursementACHBounceWithReason: ({returnReason}: {returnReason: string}) => `no se pudo procesar el pago: ${returnReason}`,
                reimbursementACHCancelled: `canceló el pago`,
                reimbursementAccountChanged: `no se pudo procesar el pago, ya que la persona que paga cambió de cuenta bancaria`,
                reimbursementDelayed: `procesó el pago, pero se retrasará entre 1 y 2 días hábiles más`,
                selectedForRandomAudit: `seleccionado aleatoriamente para revisión`,
                selectedForRandomAuditMarkdown: `[seleccionado aleatoriamente](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) para revisión`,
                share: ({to}: ShareParams) => `invitó a la persona miembro ${to}`,
                unshare: ({to}: UnshareParams) => `eliminó al miembro ${to}`,
                stripePaid: (amount: string, currency: string) => `pagó ${currency}${amount}`,
                takeControl: `tomó el control`,
                actionableCard3DSTransactionApproval: (amount: string, merchant: string | undefined) => {
                    const amountAndMerchantText = [amount, merchant].filter((s) => !!s?.length).join(' ');
                    return `Abre la aplicación móvil de Expensify para revisar tu transacción ${amountAndMerchantText ? `${amountAndMerchantText} ` : ''}`;
                },
                integrationSyncFailed: (label: string, errorMessage: string, workspaceAccountingLink?: string) =>
                    `hubo un problema al sincronizar con ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Soluciona el problema en la <a href="${workspaceAccountingLink}">configuración del espacio de trabajo</a>.`,
                integrationSyncFailedRecurrence: ({count}: {count: number}) => `(Repetido ${count} veces.)`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `La conexión de ${feedName} se ha interrumpido. Para restaurar las importaciones de tarjetas, <a href='${workspaceCompanyCardRoute}'>inicia sesión en tu banco</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `la conexión de Plaid con tu cuenta bancaria empresarial está interrumpida. Por favor, <a href='${walletRoute}'>vuelve a conectar tu cuenta bancaria ${maskedAccountNumber}</a> para que puedas seguir usando tus Expensify Cards.`,
                addEmployee: (email: string, role: string, didJoinPolicy?: boolean) =>
                    didJoinPolicy ? `${email} se unió mediante el enlace de invitación del espacio de trabajo` : `se agregó a ${email} como ${role === 'member' ? 'a' : 'un'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `actualizó el rol de ${email} a ${newRole} (antes ${currentRole})`,
                updatedCustomField1: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `se eliminó el campo personalizado 1 de ${email} (antes "${previousValue}")`;
                    }
                    return !previousValue
                        ? `se agregó «${newValue}» al campo personalizado 1 de ${email}`
                        : `cambió el campo personalizado 1 de ${email} a "${newValue}" (antes "${previousValue}")`;
                },
                updatedCustomField2: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `eliminó el campo personalizado 2 de ${email} (antes «${previousValue}»)`;
                    }
                    return !previousValue
                        ? `se agregó «${newValue}» al campo personalizado 2 de ${email}`
                        : `cambió el campo personalizado 2 de ${email} a "${newValue}" (antes "${previousValue}")`;
                },
                leftWorkspace: (nameOrEmail: string) => `${nameOrEmail} salió del espacio de trabajo`,
                removeMember: (email: string, role: string) => `eliminó ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `se eliminó la conexión con ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `conectado a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'salió del chat',
                leftTheChatWithName: (nameOrEmail: string) => `${nameOrEmail ? `${nameOrEmail}: ` : ''} salió del chat`,
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `la cuenta bancaria comercial ${maskedBankAccountNumber} se bloqueó automáticamente debido a un problema con el reembolso o la liquidación de la tarjeta Expensify. Soluciona el problema en la <a href="${linkURL}">configuración del espacio de trabajo</a>.`,
            },
            error: {
                invalidCredentials: 'Credenciales no válidas, por favor verifica la configuración de tu conexión.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: (summary: string, dayCount: number, date: string) => `${summary} durante ${dayCount} ${dayCount === 1 ? 'día' : 'días'} hasta ${date}`,
        oooEventSummaryPartialDay: (summary: string, timePeriod: string, date: string) => `${summary} de ${timePeriod} el ${date}`,
        startTimer: 'Iniciar temporizador',
        stopTimer: 'Detener temporizador',
        scheduleOOO: 'Programar ausencia',
        scheduleOOOTitle: 'Programar fuera de la oficina',
        date: 'Fecha',
        time: 'Hora (usar formato de 24 horas)',
        durationAmount: 'Duración',
        durationUnit: 'Unidad',
        reason: 'Motivo',
        workingPercentage: 'Porcentaje trabajado',
        dateRequired: 'La fecha es obligatoria.',
        invalidTimeFormat: 'Introduce una hora válida en formato de 24 horas (p. ej., 14:30).',
        enterANumber: 'Introduce un número.',
        hour: 'horas',
        day: 'días',
        week: 'semanas',
        month: 'meses',
    },
    footer: {
        features: 'Funciones',
        expenseManagement: 'Gestión de gastos',
        spendManagement: 'Gestión de gastos',
        expenseReports: 'Informes de gastos',
        companyCreditCard: 'Tarjeta de crédito corporativa',
        receiptScanningApp: 'Aplicación de escaneo de recibos',
        billPay: 'Pago de facturas',
        invoicing: 'Facturación',
        CPACard: 'Tarjeta CPA',
        payroll: 'Nómina',
        travel: 'Viaje',
        resources: 'Recursos',
        expensifyApproved: '¡ExpensifyAprobado!',
        pressKit: 'Kit de prensa',
        support: 'Ayuda',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Términos del servicio',
        privacy: 'Privacidad',
        learnMore: 'Más información',
        aboutExpensify: 'Acerca de Expensify',
        blog: 'Blog',
        jobs: 'Trabajos',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Relaciones con Inversionistas',
        getStarted: 'Comenzar',
        createAccount: 'Crear una cuenta nueva',
        logIn: 'Iniciar sesión',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Volver a la lista de chats',
        chatWelcomeMessage: 'Mensaje de bienvenida del chat',
        navigatesToChat: 'Navega a un chat',
        newMessageLineIndicator: 'Indicador de nueva línea de mensaje',
        chatMessage: 'Mensaje de chat',
        lastChatMessagePreview: 'Vista previa del último mensaje de chat',
        workspaceName: 'Nombre del espacio de trabajo',
        chatUserDisplayNames: 'Nombres visibles de miembros del chat',
        scrollToNewestMessages: 'Desplazarse a los mensajes más recientes',
        preStyledText: 'Texto con estilo previo',
        viewAttachment: 'Ver adjunto',
        contextMenuAvailable: 'Menú contextual disponible. Pulsa Mayús+F10 para abrirlo.',
        contextMenuAvailableMacOS: 'Menú contextual disponible. Pulsa VO-Mayús-M para abrirlo.',
        contextMenuAvailableNative: 'Menú contextual disponible. Toca dos veces y mantén presionado para abrir.',
        selectAllFeatures: 'Seleccionar todas las funciones',
        selectAllTransactions: 'Seleccionar todas las transacciones',
        selectAllItems: 'Seleccionar todos los elementos',
    },
    parentReportAction: {
        deletedReport: 'Informe eliminado',
        deletedMessage: 'Mensaje eliminado',
        deletedExpense: 'Gasto eliminado',
        reversedTransaction: 'Transacción revertida',
        deletedTask: 'Tarea eliminada',
        hiddenMessage: 'Mensaje oculto',
    },
    threads: {
        thread: 'Hilo',
        replies: 'Respuestas',
        reply: 'Responder',
        from: 'Desde',
        in: 'en',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `De ${reportName}${workspaceName ? `en ${workspaceName}` : ''}`,
    },
    qrCodes: {
        qrCode: 'Código QR',
        copy: 'Copiar URL',
        copied: '¡Copiado!',
    },
    moderation: {
        flagDescription: 'Todos los mensajes marcados se enviarán a una persona moderadora para su revisión.',
        chooseAReason: 'Elige un motivo para marcar a continuación:',
        spam: 'Correo no deseado',
        spamDescription: 'Promoción no solicitada fuera de tema',
        inconsiderate: 'Desconsiderado',
        inconsiderateDescription: 'Frases insultantes o irrespetuosas, con intenciones cuestionables',
        intimidation: 'Intimidación',
        intimidationDescription: 'Perseguir una agenda de forma agresiva a pesar de objeciones válidas',
        bullying: 'Acoso',
        bullyingDescription: 'Acosa a una persona para obtener obediencia',
        harassment: 'Acoso',
        harassmentDescription: 'Conducta racista, misógina u otra conducta ampliamente discriminatoria',
        assault: 'Agresión',
        assaultDescription: 'Ataque emocional específicamente dirigido con la intención de causar daño',
        flaggedContent: 'Este mensaje se ha marcado como una infracción de nuestras normas de la comunidad y su contenido se ha ocultado.',
        hideMessage: 'Ocultar mensaje',
        revealMessage: 'Revelar mensaje',
        levelOneResult: 'Envía una advertencia anónima y el mensaje se informa para revisión.',
        levelTwoResult: 'Mensaje oculto del canal, más advertencia anónima y mensaje informado para revisión.',
        levelThreeResult: 'Mensaje eliminado del canal, advertencia anónima enviada y mensaje reportado para revisión.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Invitar a enviar gastos',
        inviteToChat: 'Invitar solo a chatear',
        nothing: 'No hacer nada',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Aceptar',
        decline: 'Rechazar',
    },
    actionableMentionTrackExpense: {
        submit: 'Envíalo a alguien',
        categorize: 'Clasifícalo',
        share: 'Compartirlo con mi contador',
        nothing: 'Nada por ahora',
    },
    teachersUnitePage: {
        teachersUnite: 'Unión de Docentes',
        joinExpensifyOrg:
            'Únete a Expensify.org para eliminar la injusticia en todo el mundo. La campaña actual “Teachers Unite” apoya a docentes de todas partes compartiendo el costo de los suministros escolares esenciales.',
        iKnowATeacher: 'Conozco a un profesor',
        iAmATeacher: 'Soy docente',
        personalKarma: {
            title: 'Activar Karma personal',
            description: 'Dona 1 US$ a Expensify.org por cada 500 US$ que gastes cada mes',
            stopDonationsPrompt: '¿Seguro que quieres dejar de donar a Expensify.org?',
        },
        getInTouch: '¡Excelente! Comparte su información para que podamos ponernos en contacto con ellos.',
        introSchoolPrincipal: 'Presentación a la directora o director de tu escuela',
        schoolPrincipalVerifyExpense:
            'Expensify.org divide el costo de los útiles escolares esenciales para que estudiantes de hogares de bajos ingresos puedan tener una mejor experiencia de aprendizaje. Se le pedirá a tu director/a que verifique tus gastos.',
        principalFirstName: 'Nombre de pila del titular',
        principalLastName: 'Apellido principal',
        principalWorkEmail: 'Correo electrónico laboral principal',
        updateYourEmail: 'Actualiza tu dirección de correo electrónico',
        updateEmail: 'Actualizar dirección de correo electrónico',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Antes de continuar, asegúrate de establecer tu correo electrónico escolar como tu método de contacto predeterminado. Puedes hacerlo en Configuración > Perfil > <a href="${contactMethodsRoute}">Métodos de contacto</a>.`,
        error: {
            enterPhoneEmail: 'Ingresa un correo electrónico o número de teléfono válido',
            enterEmail: 'Ingresa un correo electrónico',
            enterValidEmail: 'Introduce un correo electrónico válido',
            tryDifferentEmail: 'Prueba con otro correo electrónico',
        },
    },
    cardTransactions: {
        notActivated: 'No activado',
        outOfPocket: 'Reembolsable',
        companySpend: 'No reembolsable',
        personalCard: 'Tarjeta personal',
        companyCard: 'Tarjeta de empresa',
        expensifyCard: 'Tarjeta Expensify',
        centralInvoicing: 'Facturación centralizada',
    },
    distance: {
        addStop: 'Agregar parada',
        address: 'Dirección',
        waypointDescription: {
            start: 'Iniciar',
            stop: 'Detener',
        },
        mapPending: {
            title: 'Asignación pendiente',
            subtitle: 'El mapa se generará cuando vuelvas a estar en línea',
            onlineSubtitle: 'Un momento mientras configuramos el mapa',
            errorTitle: 'Error de mapa',
            errorSubtitle: 'Se produjo un error al cargar el mapa. Inténtalo de nuevo.',
        },
        error: {
            selectSuggestedAddress: 'Selecciona una dirección sugerida o usa la ubicación actual',
        },
        odometer: {
            startReading: 'Comenzar a leer',
            endReading: 'Terminar de leer',
            saveForLater: 'Guardar para más tarde',
            totalDistance: 'Distancia total',
            startTitle: 'Foto del odómetro inicial',
            endTitle: 'Foto del kilometraje final',
            deleteOdometerPhoto: 'Eliminar foto del odómetro',
            deleteOdometerPhotoConfirmation: '¿Seguro que quieres eliminar esta foto del odómetro?',
            startMessageWeb: 'Agrega una foto del odómetro desde el <strong>inicio</strong> de tu viaje. Arrastra un archivo aquí o elige uno para subir.',
            endMessageWeb: 'Agrega una foto del odómetro tomada al <strong>final</strong> de tu viaje. Arrastra un archivo aquí o elige uno para subir.',
            cameraAccessRequired: 'Se requiere acceso a la cámara para tomar fotos.',
            snapPhotoStart: '<muted-text-label>Toma una foto de tu odómetro al <strong>inicio</strong> de tu viaje.</muted-text-label>',
            snapPhotoEnd: '<muted-text-label>Toma una foto de tu odómetro al <strong>final</strong> de tu viaje.</muted-text-label>',
        },
    },
    gps: {
        error: {
            failedToStart: 'No se pudo iniciar el seguimiento de la ubicación.',
            failedToGetPermissions: 'No se pudieron obtener los permisos de ubicación necesarios.',
        },
        trackingDistance: 'Rastreando distancia...',
        stopped: 'Detenido',
        start: 'Iniciar',
        stop: 'Detener',
        discard: 'Descartar',
        stopGpsTrackingModal: {
            title: 'Detener el seguimiento por GPS',
            prompt: '¿Estás seguro/a? Esto terminará tu recorrido actual.',
            cancel: 'Reanudar seguimiento',
            confirm: 'Detener el seguimiento por GPS',
        },
        discardDistanceTrackingModal: {
            title: 'Descartar el seguimiento de distancia',
            prompt: '¿Estás seguro/a? Esto descartará tu recorrido actual y no se podrá deshacer.',
            confirm: 'Descartar el seguimiento de distancia',
        },
        zeroDistanceTripModal: {
            title: 'No se puede crear el gasto',
            prompt: 'No puedes crear un gasto con la misma ubicación de inicio y fin.',
        },
        locationRequiredModal: {
            title: 'Se requiere acceso a la ubicación',
            prompt: 'Permite el acceso a la ubicación en la configuración de tu dispositivo para iniciar el seguimiento de distancia por GPS.',
            allow: 'Permitir',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Se requiere acceso a la ubicación en segundo plano',
            prompt: 'Permite el acceso a la ubicación en segundo plano en los ajustes de tu dispositivo (opción «Permitir siempre») para comenzar a registrar la distancia por GPS.',
        },
        preciseLocationRequiredModal: {
            title: 'Se requiere ubicación precisa',
            prompt: 'Activa la “ubicación precisa” en la configuración de tu dispositivo para comenzar a rastrear la distancia por GPS.',
        },
        desktop: {
            title: 'Registra la distancia en tu teléfono',
            subtitle: 'Registra millas o kilómetros automáticamente con el GPS y convierte los viajes en gastos al instante.',
            button: 'Descarga la app',
        },
        notification: {
            title: 'Seguimiento por GPS en curso',
            body: 'Ve a la aplicación para terminar',
        },
        continueGpsTripModal: {
            title: '¿Continuar grabando el viaje por GPS?',
            prompt: 'Parece que la aplicación se cerró durante tu último viaje con GPS. ¿Te gustaría seguir grabando a partir de ese viaje?',
            confirm: 'Continuar viaje',
            cancel: 'Ver viaje',
        },
        signOutWarningTripInProgress: {
            title: 'Seguimiento por GPS en curso',
            prompt: '¿Seguro que quieres descartar el viaje y cerrar sesión?',
            confirm: 'Descartar y cerrar sesión',
        },
        switchToODWarningTripInProgress: {
            title: 'Seguimiento por GPS en curso',
            prompt: '¿Seguro que deseas detener el seguimiento por GPS y cambiar a Expensify Classic?',
            confirm: 'Detener y cambiar',
        },
        switchAccountWarningTripInProgress: {
            title: 'Seguimiento por GPS en curso',
            prompt: '¿Seguro que quieres detener el seguimiento por GPS y cambiar de cuenta?',
            confirm: 'Detener y cambiar',
        },
        locationServicesRequiredModal: {
            title: 'Se requiere acceso a la ubicación',
            confirm: 'Abrir configuración',
            prompt: 'Permite el acceso a la ubicación en la configuración de tu dispositivo para iniciar el seguimiento de distancia por GPS.',
        },
        gpsFloatingPillText: 'Seguimiento por GPS en curso...',
        liveActivity: {
            subtitle: 'Seguimiento de distancia',
            button: 'Ver progreso',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Boleta de calificaciones perdida o dañada',
        nextButtonLabel: 'Siguiente',
        reasonTitle: '¿Por qué necesitas una nueva tarjeta?',
        cardDamaged: 'Mi tarjeta estaba dañada',
        cardLostOrStolen: 'Mi tarjeta se perdió o fue robada',
        confirmAddressTitle: 'Confirma la dirección postal para tu nueva tarjeta.',
        cardDamagedInfo: 'Tu nueva tarjeta llegará en 2 o 3 días hábiles. Tu tarjeta actual seguirá funcionando hasta que actives la nueva.',
        cardLostOrStolenInfo: 'Tu tarjeta actual se desactivará permanentemente en cuanto realices tu pedido. La mayoría de las tarjetas llegan en unos pocos días hábiles.',
        address: 'Dirección',
        deactivateCardButton: 'Desactivar tarjeta',
        shipNewCardButton: 'Enviar nueva tarjeta',
        addressError: 'La dirección es obligatoria',
        reasonError: 'El motivo es obligatorio',
        successTitle: '¡Tu nueva tarjeta está en camino!',
        successDescription: 'Tendrás que activarla cuando llegue en unos pocos días hábiles. Mientras tanto, puedes usar una tarjeta virtual.',
    },
    eReceipt: {
        guaranteed: 'Factura electrónica garantizada',
        transactionDate: 'Fecha de la transacción',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Inicia un chat, <success><strong>recomienda a un amigo</strong></success>.',
            header: 'Inicia un chat, recomienda a un amigo',
            closeAccessibilityLabel: 'Cerrar, iniciar un chat, recomendar a un amigo, banner',
            body: '¿Quieres que tus amistades también usen Expensify? Solo comienza un chat con ellas y nosotros nos encargamos del resto.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Presenta un gasto, <success><strong>recomienda a tu equipo</strong></success>.',
            header: 'Presenta un gasto, invita a tu equipo',
            closeAccessibilityLabel: 'Cerrar, enviar un gasto, recomendar a tu equipo, banner',
            body: '¿Quieres que tu equipo también use Expensify? Solo envíales un gasto y nosotros nos encargaremos del resto.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Recomienda a un amigo',
            body: '¿Quieres que tus amistades también usen Expensify? Solo chatea, paga o divide un gasto con ellas y nos encargaremos del resto. ¡O simplemente comparte tu enlace de invitación!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Recomienda a un amigo',
            header: 'Recomienda a un amigo',
            body: '¿Quieres que tus amistades también usen Expensify? Solo chatea, paga o divide un gasto con ellas y nos encargaremos del resto. ¡O simplemente comparte tu enlace de invitación!',
        },
        copyReferralLink: 'Copiar enlace de invitación',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Chatea con tu especialista de configuración en <a href="${href}">${adminReportName}</a> para obtener ayuda`,
        default: `Envía un mensaje a <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> para obtener ayuda con la configuración`,
    },
    violations: {
        allTagLevelsRequired: 'Todas las etiquetas son obligatorias',
        autoReportedRejectedExpense: 'Este gasto fue rechazado.',
        billableExpense: 'Facturable ya no es válido',
        cashExpenseWithNoReceipt: (formattedLimit?: string) => `Se requiere recibo${formattedLimit ? `más de ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'La categoría ya no es válida',
        conversionSurcharge: (surcharge: number) => `Se aplicó un recargo de conversión del ${surcharge}%`,
        customUnitOutOfPolicy: 'Tarifa no válida para este espacio de trabajo',
        duplicatedTransaction: 'Posible duplicado',
        fieldRequired: 'Los campos del informe son obligatorios',
        futureDate: 'No se permiten fechas futuras',
        invoiceMarkup: (invoiceMarkup: number) => `Aumentado en un ${invoiceMarkup}%`,
        maxAge: (maxAge: number) => `Fecha anterior a hace ${maxAge} días`,
        missingCategory: 'Categoría faltante',
        missingComment: 'Se requiere una descripción para la categoría seleccionada',
        missingAttendees: 'Se requieren varios asistentes para esta categoría',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Falta ${tagName ?? 'etiqueta'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'El importe difiere de la distancia calculada';
                case 'card':
                    return 'Importe mayor que la transacción de la tarjeta';
                default:
                    if (displayPercentVariance) {
                        return `Importe ${displayPercentVariance}% mayor que el recibo escaneado`;
                    }
                    return 'Importe mayor que el recibo escaneado';
            }
        },
        modifiedDate: 'La fecha difiere del recibo escaneado',
        increasedDistance: ({formattedRouteDistance}: ViolationsIncreasedDistanceParams) =>
            formattedRouteDistance ? `La distancia excede la ruta calculada de ${formattedRouteDistance}` : 'La distancia excede la ruta calculada',
        nonExpensiworksExpense: 'Gasto fuera de Expensiworks',
        overAutoApprovalLimit: (formattedLimit: string) => `El gasto supera el límite de aprobación automática de ${formattedLimit}`,
        overCategoryLimit: (formattedLimit: string) => `Importe superior al límite de categoría de ${formattedLimit} por persona`,
        overLimit: (formattedLimit: string) => `Importe que supera el límite de ${formattedLimit} por persona`,
        overTripLimit: (formattedLimit: string) => `Importe superior al límite de ${formattedLimit}/viaje`,
        overLimitAttendee: (formattedLimit: string) => `Importe que supera el límite de ${formattedLimit} por persona`,
        perDayLimit: (formattedLimit: string) => `Importe que supera el límite diario de la categoría de ${formattedLimit}/persona`,
        receiptNotSmartScanned: 'Detalles del recibo y del gasto añadidos manualmente.',
        receiptRequired: (formattedLimit?: string, category?: string) => {
            if (formattedLimit && category) {
                return `Se requiere recibo por límite de categoría superior a ${formattedLimit}`;
            }
            if (formattedLimit) {
                return `Se requiere recibo por encima de ${formattedLimit}`;
            }
            if (category) {
                return `Se requiere recibo por superar el límite de la categoría`;
            }
            return 'Recibo obligatorio';
        },
        itemizedReceiptRequired: (formattedLimit?: string) => `Se requiere recibo detallado${formattedLimit ? `más de ${formattedLimit}` : ''}`,
        prohibitedExpense: (prohibitedExpenseTypes: string | string[]) => {
            const preMessage = 'Gasto prohibido:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `alcohol`;
                    case 'gambling':
                        return `juegos de azar`;
                    case 'tobacco':
                        return `tabaco`;
                    case 'adultEntertainment':
                        return `entretenimiento para adultos`;
                    case 'hotelIncidentals':
                        return `gastos incidentales de hotel`;
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
        customRules: (message: string) => message,
        reviewRequired: 'Revisión requerida',
        rter: (
            brokenBankConnection: boolean,
            isAdmin: boolean,
            isTransactionOlderThan7Days: boolean,
            member?: string,
            rterType?: ValueOf<typeof CONST.RTER_VIOLATION_TYPES>,
            companyCardPageURL?: string,
            connectionLink?: string,
            isPersonalCard?: boolean,
            isMarkAsCash?: boolean,
        ) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'No se puede conciliar automáticamente el recibo debido a una conexión bancaria interrumpida.';
            }
            if (isPersonalCard && (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION || brokenBankConnection)) {
                if (!connectionLink) {
                    return 'No se puede conciliar automáticamente el recibo debido a una conexión bancaria interrumpida.';
                }
                return isMarkAsCash
                    ? `No se puede hacer coincidir automáticamente el recibo debido a una conexión de tarjeta interrumpida. Márcalo como efectivo para ignorarlo o <a href="${connectionLink}">repara la tarjeta</a> para hacer coincidir el recibo.`
                    : `No se puede asociar automáticamente el recibo debido a una conexión de tarjeta interrumpida. <a href="${connectionLink}">Repara la tarjeta</a> para asociar el recibo.`;
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Conexión bancaria interrumpida. <a href="${companyCardPageURL}">Vuelve a conectar para asociar el recibo</a>`
                    : 'Conexión bancaria interrumpida. Pide a una persona administradora que la vuelva a conectar para que coincida con el recibo.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Pídele a ${member} que lo marque como efectivo o espera 7 días e inténtalo de nuevo` : 'En espera de combinación con la transacción de la tarjeta.';
            }
            return '';
        },
        brokenConnection530Error: 'Recibo pendiente debido a una conexión bancaria interrumpida',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Recibo pendiente debido a una conexión bancaria interrumpida. Resuélvela en <a href="${workspaceCompanyCardRoute}">Tarjetas de empresa</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Recibo pendiente debido a una conexión bancaria interrumpida. Pide a una persona administradora del espacio de trabajo que lo resuelva.',
        markAsCashToIgnore: 'Marcar como efectivo para ignorarlo y solicitar el pago.',
        smartscanFailed: ({canEdit = true}) => `El escaneo del recibo falló.${canEdit ? 'Introduce los datos manualmente.' : ''}`,
        receiptGeneratedWithAI: 'Posible recibo generado por IA',
        someTagLevelsRequired: (tagName?: string) => `Falta ${tagName ?? 'Etiqueta'}`,
        tagOutOfPolicy: (tagName?: string) => `${tagName ?? 'Etiqueta'} ya no es válido`,
        taxAmountChanged: 'Se modificó el importe del impuesto',
        taxOutOfPolicy: (taxName?: string) => `${taxName ?? 'Impuesto'} ya no es válido`,
        taxRateChanged: 'La tasa de impuesto se modificó',
        taxRequired: 'Falta la tasa de impuesto',
        none: 'Ninguno',
        taxCodeToKeep: 'Elige qué código de impuesto conservar',
        tagToKeep: 'Elige qué etiqueta mantener',
        isTransactionReimbursable: 'Elige si la transacción es reembolsable',
        merchantToKeep: 'Elige qué comerciante conservar',
        descriptionToKeep: 'Elige qué descripción conservar',
        categoryToKeep: 'Elige qué categoría conservar',
        isTransactionBillable: 'Elige si la transacción es facturable',
        keepThisOne: 'Conservar este',
        confirmDetails: `Confirma los detalles que conservarás`,
        confirmDuplicatesInfo: `Los duplicados que no conserves se guardarán para que la persona que los envió los elimine.`,
        hold: 'Este gasto se puso en espera',
        resolvedDuplicates: 'resolvió el duplicado',
        companyCardRequired: 'Se requieren compras con tarjeta corporativa',
        noRoute: 'Selecciona una dirección válida',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: (fieldName: string) => `${fieldName} es obligatorio`,
        reportContainsExpensesWithViolations: 'El informe contiene gastos con infracciones.',
    },
    violationDismissal: {
        rter: {
            manual: 'marcó este recibo como efectivo',
        },
        duplicatedTransaction: {
            manual: 'resolvió el duplicado',
        },
    },
    videoPlayer: {
        play: 'Reproducir',
        pause: 'Pausar',
        fullscreen: 'Pantalla completa',
        playbackSpeed: 'Velocidad de reproducción',
        expand: 'Expandir',
        mute: 'Silenciar',
        unmute: 'Activar sonido',
        normal: 'Normal',
    },
    exitSurvey: {
        header: 'Antes de irte',
        reasonPage: {
            title: 'Cuéntanos por qué te vas',
            subtitle: 'Antes de irte, cuéntanos por qué quieres cambiar a Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Necesito una función que solo está disponible en Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'No entiendo cómo usar New Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Entiendo cómo usar el nuevo Expensify, pero prefiero Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: '¿Qué función necesitas que no esté disponible en el nuevo Expensify?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '¿Qué estás intentando hacer?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '¿Por qué prefieres Expensify Classic?',
        },
        responsePlaceholder: 'Tu respuesta',
        thankYou: '¡Gracias por tus comentarios!',
        thankYouSubtitle: 'Tus respuestas nos ayudarán a crear un mejor producto para hacer las cosas. ¡Muchas gracias!',
        goToExpensifyClassic: 'Cambiar a Expensify Classic',
        offlineTitle: 'Parece que estás atascado aquí...',
        offline:
            'Parece que estás sin conexión. Lamentablemente, Expensify Classic no funciona sin conexión, pero New Expensify sí. Si prefieres usar Expensify Classic, vuelve a intentarlo cuando tengas conexión a internet.',
        quickTip: 'Consejo rápido...',
        quickTipSubTitle: 'Puedes ir directamente a Expensify Classic visitando expensify.com. ¡Añádelo a tus marcadores para tener un acceso rápido!',
        bookACall: 'Reservar una llamada',
        bookACallTitle: '¿Te gustaría hablar con una persona del equipo de producto?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Chatear directamente en gastos e informes',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Capacidad de hacerlo todo desde el móvil',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Viajes y gastos a la velocidad del chat',
        },
        bookACallTextTop: 'Al cambiar a Expensify Classic, te perderás de:',
        bookACallTextBottom:
            'Nos encantaría tener una llamada contigo para entender por qué. Puedes reservar una llamada con una de nuestras personas responsables sénior de producto para hablar sobre tus necesidades.',
        takeMeToExpensifyClassic: 'Llévame a Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Se produjo un error al cargar más mensajes',
        tryAgain: 'Inténtalo de nuevo',
    },
    systemMessage: {
        mergedWithCashTransaction: 'coincidió un recibo con esta transacción',
    },
    subscription: {
        authenticatePaymentCard: 'Autenticar tarjeta de pago',
        mobileReducedFunctionalityMessage: 'No puedes hacer cambios en tu suscripción desde la aplicación móvil.',
        badge: {
            freeTrial: (numOfDays: number) => `Prueba gratuita: ${numOfDays} ${numOfDays === 1 ? 'día' : 'días'} restantes`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Tu información de pago está desactualizada',
                subtitle: (date: string) => `Actualiza tu tarjeta de pago antes del ${date} para seguir usando todas tus funciones favoritas.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'No se pudo procesar tu pago',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `No se pudo procesar tu cargo del ${date} por ${purchaseAmountOwed}. Añade una tarjeta de pago para saldar el importe adeudado.`
                        : 'Añade una tarjeta de pago para saldar el monto adeudado.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Tu información de pago está desactualizada',
                subtitle: (date: string) => `Tu pago está vencido. Paga tu factura antes del ${date} para evitar la interrupción del servicio.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Tu información de pago está desactualizada',
                subtitle: 'Tu pago está vencido. Por favor paga tu factura.',
            },
            billingDisputePending: {
                title: 'No se pudo cargar el importe a tu tarjeta',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `Disputaste el cargo de ${amountOwed} en la tarjeta terminada en ${cardEnding}. Tu cuenta estará bloqueada hasta que la disputa se resuelva con tu banco.`,
            },
            cardAuthenticationRequired: {
                title: 'Tu tarjeta de pago no se ha autenticado por completo.',
                subtitle: (cardEnding: string) => `Completa el proceso de autenticación para activar tu tarjeta de pago que termina en ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'No se pudo cargar el importe a tu tarjeta',
                subtitle: (amountOwed: number) =>
                    `Tu tarjeta de pago fue rechazada por fondos insuficientes. Vuelve a intentarlo o agrega una nueva tarjeta de pago para saldar tu saldo pendiente de ${amountOwed}.`,
            },
            cardExpired: {
                title: 'No se pudo cargar el importe a tu tarjeta',
                subtitle: (amountOwed: number) => `Tu tarjeta de pago ha caducado. Agrega una nueva tarjeta de pago para saldar tu saldo pendiente de ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'Tu tarjeta vencerá pronto',
                subtitle: 'Tu tarjeta de pago vencerá a fin de este mes. Haz clic en el menú de tres puntos de abajo para actualizarla y seguir usando todas tus funciones favoritas.',
            },
            retryBillingSuccess: {
                title: '¡Listo!',
                subtitle: 'Tu tarjeta se ha cargado correctamente.',
            },
            retryBillingError: {
                title: 'No se pudo cargar el importe a tu tarjeta',
                subtitle:
                    'Antes de volver a intentarlo, llama directamente a tu banco para autorizar los cargos de Expensify y eliminar cualquier bloqueo. De lo contrario, prueba a añadir otra tarjeta de pago.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `Disputaste el cargo de ${amountOwed} en la tarjeta terminada en ${cardEnding}. Tu cuenta estará bloqueada hasta que la disputa se resuelva con tu banco.`,
            preTrial: {
                title: 'Inicia una prueba gratuita',
                subtitle: 'Como siguiente paso, <a href="#">completa tu lista de verificación de configuración</a> para que tu equipo pueda empezar a reportar gastos.',
            },
            trialStarted: {
                title: (numOfDays: number) => `Prueba: ¡quedan ${numOfDays} ${numOfDays === 1 ? 'día' : 'días'}!`,
                subtitle: 'Agrega una tarjeta de pago para seguir usando todas tus funciones favoritas.',
            },
            trialEnded: {
                title: 'Tu prueba gratuita ha finalizado',
                subtitle: 'Agrega una tarjeta de pago para seguir usando todas tus funciones favoritas.',
            },
            earlyDiscount: {
                claimOffer: 'Canjear oferta',
                subscriptionPageTitle: (discountType: number) =>
                    `<strong>¡${discountType}% de descuento en tu primer año!</strong> Solo agrega una tarjeta de pago y comienza una suscripción anual.`,
                onboardingChatTitle: (discountType: number) => `Oferta por tiempo limitado: ¡${discountType}% de descuento en tu primer año!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `Reclama en ${days > 0 ? `${days}d :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Pago',
            subtitle: 'Añade una tarjeta para pagar tu suscripción de Expensify.',
            addCardButton: 'Agregar tarjeta de pago',
            cardInfo: (name: string, expiration: string, currency: string) => `Nombre: ${name}, Vencimiento: ${expiration}, Moneda: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `Tu próxima fecha de pago es el ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `Tarjeta que termina en ${cardNumber}`,
            changeCard: 'Cambiar tarjeta de pago',
            changeCurrency: 'Cambiar moneda de pago',
            cardNotFound: 'No se añadió ninguna tarjeta de pago',
            retryPaymentButton: 'Reintentar pago',
            authenticatePayment: 'Autenticar pago',
            requestRefund: 'Solicitar reembolso',
            requestRefundModal: {
                full: 'Obtener un reembolso es fácil, solo degrada tu cuenta antes de tu próxima fecha de facturación y recibirás un reembolso. <br /> <br /> Aviso: Degradar tu cuenta significa que se eliminarán tus espacios de trabajo. Esta acción no se puede deshacer, pero siempre puedes crear un nuevo espacio de trabajo si cambias de opinión.',
                confirm: 'Eliminar espacios de trabajo y degradar',
            },
            viewPaymentHistory: 'Ver historial de pagos',
        },
        yourPlan: {
            title: 'Tu plan',
            exploreAllPlans: 'Explorar todos los planes',
            customPricing: 'Precios personalizados',
            asLowAs: (price: string) => `desde ${price} por miembro activo/mes`,
            pricePerMemberMonth: (price: string) => `${price} por miembro/mes`,
            pricePerMemberPerMonth: (price: string) => `${price} por miembro al mes`,
            perMemberMonth: 'por miembro/mes',
            collect: {
                title: 'Cobrar',
                description: 'El plan para pequeñas empresas que te ofrece gastos, viajes y chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/miembro activo con la Expensify Card, ${upper}/miembro activo sin la Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/miembro activo con la Expensify Card, ${upper}/miembro activo sin la Expensify Card.`,
                benefit1: 'Escaneo de recibos',
                benefit2: 'Reembolsos',
                benefit3: 'Gestión de tarjetas corporativas',
                benefit4: 'Aprobaciones de gastos y viajes',
                benefit5: 'Reserva de viaje y reglas',
                benefit6: 'Integraciones con QuickBooks/Xero',
                benefit7: 'Chatea sobre gastos, informes y salas',
                benefit8: 'Asistencia con IA y humana',
            },
            control: {
                title: 'Control',
                description: 'Gastos, viajes y chat para empresas más grandes.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/miembro activo con la Expensify Card, ${upper}/miembro activo sin la Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/miembro activo con la Expensify Card, ${upper}/miembro activo sin la Expensify Card.`,
                benefit1: 'Todo lo del plan Collect',
                benefit2: 'Flujos de aprobación multinivel',
                benefit3: 'Reglas de gastos personalizadas',
                benefit4: 'Integraciones con ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Integraciones de RR. HH. (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Informes y análisis personalizados',
                benefit8: 'Presupuestación',
            },
            thisIsYourCurrentPlan: 'Este es tu plan actual',
            downgrade: 'Cambiar a Collect',
            upgrade: 'Actualizar a Control',
            addMembers: 'Agregar miembros',
            saveWithExpensifyTitle: 'Ahorra con la Tarjeta Expensify',
            saveWithExpensifyDescription: 'Usa nuestra calculadora de ahorros para ver cómo el reembolso en efectivo de la Expensify Card puede reducir tu factura de Expensify.',
            saveWithExpensifyButton: 'Más información',
        },
        compareModal: {
            comparePlans: 'Comparar planes',
            subtitle: `<muted-text>Desbloquea las funciones que necesitas con el plan adecuado para ti. <a href="${CONST.PRICING}">Consulta nuestra página de precios</a> para ver un desglose completo de las funciones de cada uno de nuestros planes.</muted-text>`,
        },
        details: {
            title: 'Detalles de la suscripción',
            annual: 'Suscripción anual',
            creditBalance: 'Saldo a favor',
            taxExempt: 'Solicitar estado de exención de impuestos',
            taxExemptEnabled: 'Exento de impuestos',
            taxExemptStatus: 'Estado de exención de impuestos',
            payPerUse: 'Pago por uso',
            subscriptionSize: 'Tamaño de la suscripción',
            headsUp:
                'Atención: si no configuras ahora el tamaño de tu suscripción, lo estableceremos automáticamente según la cantidad de miembros activos de tu primer mes. A partir de entonces, te comprometerás a pagar al menos por esta cantidad de miembros durante los próximos 12 meses. Puedes aumentar el tamaño de tu suscripción en cualquier momento, pero no podrás reducirlo hasta que tu suscripción termine.',
            zeroCommitment: 'Cero compromiso con la tarifa anual de suscripción con descuento',
        },
        subscriptionSize: {
            title: 'Tamaño de la suscripción',
            yourSize: 'El tamaño de tu suscripción es el número de plazas abiertas que pueden ser ocupadas por cualquier miembro activo en un mes determinado.',
            eachMonth:
                'Cada mes, tu suscripción cubre hasta el número de miembros activos establecido arriba. Cada vez que aumentes el tamaño de tu suscripción, comenzarás una nueva suscripción de 12 meses con ese nuevo tamaño.',
            note: 'Nota: Una persona miembro activa es cualquiera que haya creado, editado, enviado, aprobado, reembolsado o exportado datos de gastos vinculados al espacio de trabajo de tu empresa.',
            confirmDetails: 'Confirma los detalles de tu nueva suscripción anual:',
            subscriptionSize: 'Tamaño de la suscripción',
            activeMembers: (size: number) => `${size} miembros activos/mes`,
            subscriptionRenews: 'Renovación de la suscripción',
            youCantDowngrade: 'No puedes cambiar a un plan inferior durante tu suscripción anual.',
            youAlreadyCommitted: (size: number, date: string) =>
                `Ya te comprometiste con una suscripción anual de ${size} miembros activos por mes hasta ${date}. Puedes cambiar a una suscripción de pago por uso el ${date} desactivando la renovación automática.`,
            error: {
                size: 'Ingresa un tamaño de suscripción válido',
                sameSize: 'Introduce un número diferente al tamaño actual de tu suscripción',
            },
        },
        paymentCard: {
            addPaymentCard: 'Agregar tarjeta de pago',
            enterPaymentCardDetails: 'Introduce los datos de tu tarjeta de pago',
            security: 'Expensify cumple con la norma PCI-DSS, utiliza cifrado de nivel bancario y emplea infraestructura redundante para proteger tus datos.',
            learnMoreAboutSecurity: 'Obtén más información sobre nuestra seguridad.',
        },
        expensifyCode: {
            title: 'Código de Expensify',
            discountCode: 'Código de descuento',
            enterCode: 'Ingresa un código de Expensify para aplicarlo a tu suscripción.',
            discountMessage: (promoDiscount: string, validBillingCycles: string) =>
                `Obtendrás un descuento del ${promoDiscount}% en tus próximos ${validBillingCycles ? `${validBillingCycles} ` : ''}cargos de facturación.`,
            apply: 'Aplicar',
            error: {
                invalid: 'Este código no es válido',
            },
        },
        subscriptionSettings: {
            title: 'Configuración de suscripción',
            summary: (subscriptionType: string, subscriptionSize: string, expensifyCode: string, autoRenew: string, autoIncrease: string) =>
                `Tipo de suscripción: ${subscriptionType}, Tamaño de la suscripción: ${subscriptionSize}${expensifyCode ? `, código de Expensify: ${expensifyCode}` : ''}, Renovación automática: ${autoRenew}, Aumento automático anual de asientos: ${autoIncrease}`,
            none: 'ninguno',
            on: 'activado',
            off: 'apagado',
            annual: 'Anual',
            autoRenew: 'Renovación automática',
            autoIncrease: 'Aumentar automáticamente los asientos anuales',
            saveUpTo: (amountWithCurrency: string) => `Ahorra hasta ${amountWithCurrency}/mes por miembro activo`,
            automaticallyIncrease:
                'Aumenta automáticamente tus asientos anuales para adaptarlos a los miembros activos que superen el tamaño de tu suscripción. Nota: esto ampliará la fecha de finalización de tu suscripción anual.',
            disableAutoRenew: 'Desactivar renovación automática',
            helpUsImprove: 'Ayúdanos a mejorar Expensify',
            whatsMainReason: '¿Cuál es el motivo principal por el que desactivas la renovación automática?',
            renewsOn: (date: string) => `Se renueva el ${date}.`,
            pricingConfiguration: 'El precio depende de la configuración. Para obtener el precio más bajo, elige una suscripción anual y consigue la Expensify Card.',
            learnMore: (hasAdminsRoom: boolean) =>
                `<muted-text>Obtén más información en nuestra <a href="${CONST.PRICING}">página de precios</a> o chatea con nuestro equipo en tu ${hasAdminsRoom ? `<a href="adminsRoom">Sala #admins.</a>` : 'Sala #admins.'}</muted-text>`,
            estimatedPrice: 'Precio estimado',
            changesBasedOn: 'Esto cambia según el uso de tu Expensify Card y las opciones de suscripción que aparecen abajo.',
            collectBillingDescription: 'Los espacios de trabajo de Collect se facturan mensualmente por miembro, sin compromiso anual.',
            pricing: 'Precios',
        },
        cancelSubscription: {
            title: 'Cancelar suscripción',
            subtitle: '¿Cuál es el motivo principal por el que estás cancelando tu suscripción?',
            subscriptionCanceled: {
                title: 'Suscripción cancelada',
                subtitle: 'Tu suscripción anual ha sido cancelada.',
                info: 'Si quieres seguir usando tu(s) espacio(s) de trabajo con pago por uso, ya está todo listo.',
                preventFutureActivity: (workspacesListRoute: string) =>
                    `Si deseas evitar actividades y cargos futuros, debes <a href="${workspacesListRoute}">eliminar tu(s) espacio(s) de trabajo</a>. Ten en cuenta que, cuando elimines tu(s) espacio(s) de trabajo, se te cobrará cualquier actividad pendiente que se haya generado durante el mes calendario actual.`,
            },
            requestSubmitted: {
                title: 'Solicitud enviada',
                subtitle:
                    'Gracias por informarnos que estás interesado en cancelar tu suscripción. Estamos revisando tu solicitud y nos pondremos en contacto contigo pronto a través de tu chat con <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Al solicitar la cancelación, reconozco y acepto que Expensify no tiene ninguna obligación de conceder dicha solicitud según los <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Términos de servicio</a> de Expensify ni en virtud de ningún otro acuerdo de servicios aplicable entre Expensify y yo, y que Expensify conserva a su exclusiva discreción la decisión de conceder o no cualquier solicitud de este tipo.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'La funcionalidad necesita mejorar',
        tooExpensive: 'Demasiado caro',
        inadequateSupport: 'Atención al cliente insuficiente',
        businessClosing: 'La empresa cierra, reduce personal o fue adquirida',
        additionalInfoTitle: '¿A qué software te estás cambiando y por qué?',
        additionalInfoInputLabel: 'Tu respuesta',
    },
    roomChangeLog: {
        updateRoomDescription: 'establecer la descripción de la sala en:',
        clearRoomDescription: 'borró la descripción de la sala',
        changedRoomAvatar: 'cambió el avatar de la sala',
        removedRoomAvatar: 'eliminó el avatar de la sala',
    },
    delegate: {
        switchAccount: 'Cambiar de cuenta:',
        copilotDelegatedAccess: 'Copilot: Acceso delegado',
        copilotDelegatedAccessDescription: 'Permitir que otros miembros accedan a tu cuenta.',
        learnMoreAboutDelegatedAccess: 'Más información sobre el acceso delegado',
        addCopilot: 'Agregar copiloto',
        membersCanAccessYourAccount: 'Estas personas pueden acceder a tu cuenta:',
        youCanAccessTheseAccounts: 'Puedes acceder a estas cuentas mediante el selector de cuentas:',
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
        genericError: 'Uy, algo salió mal. Inténtalo de nuevo.',
        onBehalfOfMessage: (delegator: string) => `en nombre de ${delegator}`,
        accessLevel: 'Nivel de acceso',
        confirmCopilot: 'Confirma tu copiloto a continuación.',
        accessLevelDescription: 'Elige un nivel de acceso a continuación. Tanto el acceso Completo como el Limitado permiten que los copilotos vean todas las conversaciones y gastos.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Permite que otra persona usuaria pueda realizar todas las acciones de tu cuenta en tu nombre. Incluye chat, envíos, aprobaciones, pagos, actualizaciones de ajustes y más.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Permite que otra persona pueda realizar la mayoría de las acciones en tu cuenta en tu nombre. Excluye aprobaciones, pagos, rechazos y retenciones.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Eliminar copiloto',
        removeCopilotConfirmation: '¿Estás seguro de que quieres eliminar a este copiloto?',
        changeAccessLevel: 'Cambiar nivel de acceso',
        makeSureItIsYou: 'Verifiquemos que seas tú',
        enterMagicCode: (contactMethod: string) => `Ingresa el código mágico enviado a ${contactMethod} para añadir una persona copiloto. Debería llegar en uno o dos minutos.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Introduce el código mágico enviado a ${contactMethod} para actualizar tu copiloto.`,
        notAllowed: 'No tan rápido...',
        noAccessMessage: dedent(`
            Como copiloto, no tienes acceso a
            esta página. ¡Lo sentimos!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `Como <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copiloto</a> de ${accountOwnerEmail}, no tienes permiso para realizar esta acción. ¡Lo sentimos!`,
        copilotAccess: 'Acceso a Copilot',
    },
    debug: {
        debug: 'Depurar',
        details: 'Detalles',
        JSON: 'JSON',
        reportActions: 'Acciones',
        reportActionPreview: 'Vista previa',
        nothingToPreview: 'Nada que mostrar',
        editJson: 'Editar JSON:',
        preview: 'Vista previa:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Falta ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Propiedad no válida: ${propertyName} - Se esperaba: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Valor no válido: se esperaba: ${expectedValues}`,
        missingValue: 'Valor faltante',
        createReportAction: 'Crear acción de informe',
        reportAction: 'Acción del informe',
        report: 'Informe',
        transaction: 'Transacción',
        violations: 'Infracciones',
        transactionViolation: 'Infracción de transacción',
        hint: 'Los cambios de datos no se enviarán al servidor backend',
        textFields: 'Campos de texto',
        numberFields: 'Campos numéricos',
        booleanFields: 'Campos booleanos',
        constantFields: 'Campos constantes',
        dateTimeFields: 'Campos de fecha y hora',
        date: 'Fecha',
        time: 'Hora',
        none: 'Ninguno',
        visibleInLHN: 'Visible en LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'verdadero',
        false: 'falso',
        viewReport: 'Ver informe',
        viewTransaction: 'Ver transacción',
        createTransactionViolation: 'Crear infracción de transacción',
        reasonVisibleInLHN: {
            hasDraftComment: 'Tiene comentario en borrador',
            hasGBR: 'Tiene GBR',
            hasRBR: 'Tiene RBR',
            pinnedByUser: 'Fijado por miembro',
            hasIOUViolations: 'Tiene infracciones de IOU',
            hasAddWorkspaceRoomErrors: 'Tiene errores al agregar la sala del espacio de trabajo',
            isUnread: 'Está sin leer (modo concentración)',
            isArchived: 'Está archivado (modo más reciente)',
            isSelfDM: 'Es mensaje directo propio',
            isFocused: 'Está temporalmente enfocado',
        },
        reasonGBR: {
            hasJoinRequest: 'Tiene solicitud de unión (sala de administrador)',
            isUnreadWithMention: 'No leído con mención',
            isWaitingForAssigneeToCompleteAction: 'Está esperando a que la persona asignada complete la acción',
            hasChildReportAwaitingAction: 'Tiene un informe secundario pendiente de acción',
            hasMissingInvoiceBankAccount: 'Tiene una cuenta bancaria de factura faltante',
            hasUnresolvedCardFraudAlert: 'Tiene una alerta de fraude en la tarjeta sin resolver',
            hasDEWApproveFailed: 'Falló la aprobación de DEW',
        },
        reasonRBR: {
            hasErrors: 'Tiene errores en los datos del informe o en las acciones del informe',
            hasViolations: 'Tiene infracciones',
            hasTransactionThreadViolations: 'Tiene infracciones de hilos de transacción',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Hay un informe pendiente de acción',
            theresAReportWithErrors: 'Hay un informe con errores',
            theresAWorkspaceWithCustomUnitsErrors: 'Hay un espacio de trabajo con errores en unidades personalizadas',
            theresAProblemWithAWorkspaceMember: 'Hay un problema con un miembro del espacio de trabajo',
            theresAProblemWithAWorkspaceQBOExport: 'Hubo un problema con la configuración de exportación de la conexión del espacio de trabajo.',
            theresAProblemWithAContactMethod: 'Hay un problema con un método de contacto',
            aContactMethodRequiresVerification: 'Un método de contacto requiere verificación',
            theresAProblemWithAPaymentMethod: 'Hay un problema con un método de pago',
            theresAProblemWithAWorkspace: 'Hay un problema con un espacio de trabajo',
            theresAProblemWithYourReimbursementAccount: 'Hay un problema con tu cuenta de reembolso',
            theresABillingProblemWithYourSubscription: 'Hay un problema de facturación con tu suscripción',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Tu suscripción se ha renovado correctamente',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Hubo un problema durante la sincronización de conexión del espacio de trabajo',
            theresAProblemWithYourWallet: 'Hay un problema con tu monedero',
            theresAProblemWithYourWalletTerms: 'Hay un problema con las condiciones de tu monedero',
            aBankAccountIsLocked: 'Una cuenta bancaria está bloqueada',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Haz una prueba',
    },
    migratedUserWelcomeModal: {
        title: '¡Bienvenido a New Expensify!',
        subtitle: 'Tiene todo lo que te encanta de nuestra experiencia clásica, con un montón de mejoras para hacer tu vida aún más fácil:',
        confirmText: '¡Vamos!',
        helpText: 'Prueba la demo de 2 minutos',
        features: {
            search: 'Búsqueda más potente en dispositivos móviles, web y escritorio',
            concierge: 'Con Concierge IA integrada para ayudarte a automatizar tus gastos',
            chat: 'Chatea en cualquier gasto para resolver dudas rápidamente',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '<tooltip>Empieza <strong>aquí.</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Cambia el nombre de tus búsquedas guardadas</strong> aquí.</tooltip>',
        accountSwitcher: '<tooltip>Accede a tus <strong>cuentas Copilot</strong> aquí</tooltip>',
        outstandingFilter: '<tooltip>Filtra los gastos\nque <strong>necesitan aprobación</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Envía este recibo para\n<strong>completar la prueba de manejo.</strong></tooltip>',
        gpsTooltip: '<tooltip>¡Seguimiento por GPS en curso! Cuando termines, detén el seguimiento abajo.</tooltip>',
        hasFilterNegation: '<tooltip>Busca gastos sin recibos usando <strong>-has:receipt</strong>.</tooltip>',
    },
    discardChangesConfirmation: {
        title: '¿Descartar los cambios?',
        body: '¿Seguro que quieres descartar los cambios que hiciste?',
        confirmText: 'Descartar cambios',
    },
    scheduledCall: {
        book: {
            title: 'Programar llamada',
            description: 'Encuentra una hora que te funcione.',
            slots: ({date}: {date: string}) => `<muted-text>Horarios disponibles para <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Confirmar llamada',
            description: 'Asegúrate de que los siguientes detalles se vean bien para ti. Una vez que confirmes la llamada, enviaremos una invitación con más información.',
            setupSpecialist: 'Tu especialista de configuración',
            meetingLength: 'Duración de la reunión',
            dateTime: 'Fecha y hora',
            minutes: '30 minutos',
        },
        callScheduled: 'Llamada programada',
    },
    autoSubmitModal: {
        title: '¡Todo listo y enviado!',
        description: 'Se han eliminado todas las advertencias e infracciones, así que:',
        submittedExpensesTitle: 'Estos gastos han sido enviados',
        submittedExpensesDescription: 'Estos gastos se han enviado a tu aprobador, pero aún se pueden editar hasta que sean aprobados.',
        pendingExpensesTitle: 'Los gastos pendientes se han movido',
        pendingExpensesDescription: 'Cualquier gasto pendiente de tarjeta se ha movido a un informe separado hasta que se contabilice.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Haz una prueba de 2 minutos',
        },
        modal: {
            title: 'Pruébanos en un viaje de prueba',
            description: 'Haz una visita rápida al producto para ponerte al día rápidamente.',
            confirmText: 'Iniciar prueba',
            helpText: 'Omitir',
            employee: {
                description:
                    '<muted-text>¡Consigue para tu equipo <strong>3 meses gratis de Expensify</strong>! Solo ingresa el correo electrónico de tu jefe abajo y envíale un gasto de prueba.</muted-text>',
                email: 'Escribe el correo electrónico de tu jefe',
                error: 'Esa persona es propietaria de un espacio de trabajo, introduce otra persona para hacer la prueba.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Actualmente estás probando Expensify',
            readyForTheRealThing: '¿Listo para lo de verdad?',
            getStarted: 'Comenzar',
        },
        employeeInviteMessage: (name: string) => `# ${name} te invitó a probar Expensify
¡Hola! Acabo de conseguirnos *3 meses gratis* para probar Expensify, la forma más rápida de gestionar gastos.

Aquí tienes un *recibo de prueba* para mostrarte cómo funciona:`,
    },
    export: {
        basicExport: 'Exportación básica',
        reportLevelExport: 'Todos los datos - nivel de informe',
        expenseLevelExport: 'Todos los datos: nivel de gasto',
        exportInProgress: 'Exportación en curso',
        conciergeWillSend: 'Concierge te enviará el archivo en breve.',
    },
    domain: {
        notVerified: 'No verificado',
        retry: 'Reintentar',
        verifyDomain: {
            title: 'Verificar dominio',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Antes de continuar, verifica que eres el propietario de <strong>${domainName}</strong> actualizando su configuración de DNS.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Accede a tu proveedor de DNS y abre la configuración de DNS para <strong>${domainName}</strong>.`,
            addTXTRecord: 'Agrega el siguiente registro TXT:',
            saveChanges: 'Guarda los cambios y vuelve aquí para verificar tu dominio.',
            youMayNeedToConsult: `Es posible que debas consultar con el departamento de TI de tu organización para completar la verificación. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Más información</a>.`,
            warning:
                'Tras la verificación, todas las personas usuarias de Expensify en tu dominio recibirán un correo electrónico informando que su cuenta será administrada bajo tu dominio.',
            codeFetchError: 'No se pudo obtener el código de verificación',
            genericError: 'No pudimos verificar tu dominio. Inténtalo de nuevo y comunícate con Concierge si el problema persiste.',
        },
        domainVerified: {
            title: 'Dominio verificado',
            header: '¡Wooo! Tu dominio ha sido verificado',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>El dominio <strong>${domainName}</strong> se ha verificado correctamente y ahora puedes configurar SAML y otras funciones de seguridad.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'Inicio de sesión único (SSO) con SAML',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> es una función de seguridad que te da más control sobre cómo las personas con correos electrónicos de <strong>${domainName}</strong> inician sesión en Expensify. Para activarla, tendrás que verificar que eres una persona administradora autorizada de la empresa.</muted-text>`,
            fasterAndEasierLogin: 'Inicio de sesión más rápido y sencillo',
            moreSecurityAndControl: 'Más seguridad y control',
            onePasswordForAnything: 'Una sola contraseña para todo',
        },
        goToDomain: 'Ir al dominio',
        samlLogin: {
            title: 'Inicio de sesión SAML',
            subtitle: `<muted-text>Configura el inicio de sesión de miembros con <a href="${CONST.SAML_HELP_URL}">inicio de sesión único SAML (SSO)</a>.</muted-text>`,
            enableSamlLogin: 'Habilitar inicio de sesión SAML',
            allowMembers: 'Permitir que las personas usuarias inicien sesión con SAML.',
            requireSamlLogin: 'Requerir inicio de sesión SAML',
            anyMemberWillBeRequired: 'Cualquier miembro que haya iniciado sesión con un método diferente deberá volver a autenticarse usando SAML.',
            enableError: 'No se pudo actualizar la configuración de habilitación de SAML',
            requireError: 'No se pudo actualizar la configuración del requisito de SAML',
            disableSamlRequired: 'Desactivar SAML obligatorio',
            oktaWarningPrompt: '¿Estás seguro? Esto también desactivará Okta SCIM.',
            requireWithEmptyMetadataError: 'Agrega los metadatos del proveedor de identidad a continuación para habilitar',
            pleaseDisableTwoFactorAuth: (twoFactorAuthSettingsUrl: string) =>
                `<muted-text>Desactiva <a href="${twoFactorAuthSettingsUrl}">forzar la autenticación de dos factores</a> para habilitar el inicio de sesión con SAML.</muted-text>`,
        },
        samlConfigurationDetails: {
            title: 'Detalles de configuración de SAML',
            subtitle: 'Usa estos datos para configurar SAML.',
            identityProviderMetadata: 'Metadatos del proveedor de identidad',
            entityID: 'ID de entidad',
            nameIDFormat: 'Formato de ID de nombre',
            loginUrl: 'URL de inicio de sesión',
            acsUrl: 'URL de ACS (Assertion Consumer Service)',
            logoutUrl: 'URL de cierre de sesión',
            sloUrl: 'URL de SLO (Single Logout)',
            serviceProviderMetaData: 'Metadatos del proveedor de servicios',
            oktaScimToken: 'Token SCIM de Okta',
            revealToken: 'Revelar token',
            fetchError: 'No se pudieron obtener los detalles de la configuración de SAML',
            setMetadataGenericError: 'No se pudo configurar los metadatos SAML',
        },
        accessRestricted: {
            title: 'Acceso restringido',
            subtitle: (domainName: string) => `Verifícate como administrador autorizado de la empresa para <strong>${domainName}</strong> si necesitas controlar:`,
            companyCardManagement: 'Gestión de tarjetas de empresa',
            accountCreationAndDeletion: 'Creación y eliminación de cuentas',
            workspaceCreation: 'Creación de espacio de trabajo',
            samlSSO: 'SSO de SAML',
        },
        addDomain: {
            title: 'Agregar dominio',
            subtitle: 'Ingresa el nombre del dominio privado al que quieres acceder (por ejemplo, expensify.com).',
            domainName: 'Nombre de dominio',
            newDomain: 'Dominio nuevo',
        },
        domainAdded: {
            title: 'Dominio añadido',
            description: 'A continuación, tendrás que verificar la propiedad del dominio y ajustar tu configuración de seguridad.',
            configure: 'Configurar',
        },
        enhancedSecurity: {
            title: 'Seguridad mejorada',
            subtitle: 'Exige que las personas de tu dominio inicien sesión mediante inicio de sesión único, restringe la creación de espacios de trabajo y más.',
            enable: 'Activar',
        },
        domainAdmins: 'Administradores de dominio',
        admins: {
            title: 'Administradores',
            findAdmin: 'Buscar administrador',
            primaryContact: 'Contacto principal',
            addPrimaryContact: 'Agregar contacto principal',
            setPrimaryContactError: 'No se puede establecer el contacto principal. Inténtalo de nuevo más tarde.',
            consolidatedDomainBilling: 'Facturación de dominio consolidada',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>Cuando esté activada, la persona de contacto principal pagará por todos los espacios de trabajo propiedad de los miembros de <strong>${domainName}</strong> y recibirá todos los recibos de facturación.</muted-text-label></comment>`,
            consolidatedDomainBillingError: 'La facturación consolidada de dominio no se pudo cambiar. Intenta de nuevo más tarde.',
            addAdmin: 'Agregar administrador',
            addAdminError: 'No se puede añadir a esta persona como administrador. Inténtalo de nuevo.',
            revokeAdminAccess: 'Revocar acceso de administrador',
            cantRevokeAdminAccess: 'No se puede revocar el acceso de administrador del contacto técnico',
            error: {
                removeAdmin: 'No se puede quitar a este usuario como administrador. Inténtalo de nuevo.',
                removeDomain: 'No se puede eliminar este dominio. Inténtalo de nuevo.',
                removeDomainNameInvalid: 'Ingresa tu nombre de dominio para restablecerlo.',
            },
            resetDomain: 'Restablecer dominio',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Escribe <strong>${domainName}</strong> para confirmar el restablecimiento del dominio.`,
            enterDomainName: 'Escribe aquí tu nombre de dominio',
            resetDomainInfo: `Esta acción es <strong>permanente</strong> y se eliminarán los siguientes datos: <br/> <bullet-list><bullet-item>Conexiones de tarjetas corporativas y todos los gastos no informados de esas tarjetas</bullet-item><bullet-item>Ajustes de SAML y de grupos</bullet-item><bullet-item>Datos de viajes y acceso a Expensify Travel</bullet-item></bullet-list> Todas las cuentas, espacios de trabajo, informes, gastos y otros datos se mantendrán. <br/><br/>Nota: Puedes quitar este dominio de tu lista de dominios eliminando el correo electrónico asociado de tus <a href="#">métodos de contacto</a>.`,
        },
        domainMembers: 'Miembros del dominio',
        members: {
            title: 'Miembros',
            findMember: 'Buscar miembro',
            addMember: 'Agregar miembro',
            emptyMembers: {
                title: 'No hay miembros en este grupo',
                subtitle: 'Agrega una persona miembro o intenta cambiar el filtro de arriba.',
            },
            allMembers: 'Todos los miembros',
            email: 'Dirección de correo electrónico',
            closeAccountPrompt: '¿Estás seguro? Esta acción es permanente.',
            forceCloseAccount: () => ({
                one: 'Forzar cierre de cuenta',
                other: 'Forzar cierre de cuentas',
            }),
            safeCloseAccount: () => ({
                one: 'Cerrar cuenta de forma segura',
                other: 'Cierra cuentas de forma segura',
            }),
            closeAccountInfo: () => ({
                one: 'Recomendamos cerrar la cuenta de forma segura para omitir su cierre en caso de que haya: <bullet-list><bullet-item>aprobaciones pendientes</bullet-item><bullet-item>reembolsos activos</bullet-item><bullet-item>ningún método de inicio de sesión alternativo</bullet-item></bullet-list>De lo contrario, puedes ignorar las precauciones de seguridad anteriores y forzar el cierre de la cuenta seleccionada.',
                other: 'Recomendamos cerrar las cuentas de forma segura para omitir el cierre en caso de que haya: <bullet-list><bullet-item>Aprobaciones pendientes</bullet-item><bullet-item>Reembolsos activos</bullet-item><bullet-item>Sin métodos de inicio de sesión alternativos</bullet-item></bullet-list>De lo contrario, puedes ignorar las precauciones de seguridad anteriores y forzar el cierre de las cuentas seleccionadas.',
            }),
            closeAccount: () => ({
                one: 'Cerrar cuenta',
                other: 'Cerrar cuentas',
            }),
            moveToGroup: 'Mover al grupo',
            domainGroup: 'Grupo de dominios',
            chooseWhereToMove: ({count}: {count: number}) => `Elige adónde mover ${count} ${count === 1 ? 'miembro' : 'miembros'}.`,
            chooseWhereToMoveName: ({name}: {name: string}) => `Elige adónde mover a ${name}.`,
            error: {
                addMember: 'No se puede agregar a esta persona. Inténtalo de nuevo.',
                removeMember: 'No se puede eliminar a esta persona usuaria. Inténtalo de nuevo.',
                moveMember: 'No se puede mover a esta persona. Inténtalo de nuevo.',
                vacationDelegate: 'No se puede establecer a esta persona como delegado de vacaciones. Inténtalo de nuevo.',
            },
            cannotSetVacationDelegateForMember: (email: string) =>
                `No puedes asignar un delegado de vacaciones para ${email} porque actualmente es la persona delegada para los siguientes miembros:`,
            reportSuspiciousActivityPrompt: (email: string) =>
                `¿Estás seguro? Esto bloqueará la cuenta de <strong>la cuenta de ${email}</strong>. <br /><br /> Nuestro equipo revisará la cuenta y eliminará cualquier acceso no autorizado. Para recuperar el acceso, tendrán que trabajar con Concierge.`,
            reportSuspiciousActivityConfirmationPrompt:
                'Revisaremos la cuenta para verificar que sea seguro desbloquearla y nos pondremos en contacto a través de Concierge si hay alguna pregunta.',
        },
        common: {
            settings: 'Configuración',
            forceTwoFactorAuth: 'Forzar la autenticación en dos pasos',
            forceTwoFactorAuthSAMLEnabledDescription: (samlPageUrl: string) =>
                `<muted-text>Desactiva <a href="${samlPageUrl}">SAML</a> para forzar la autenticación de dos factores.</muted-text>`,
            forceTwoFactorAuthDescription: `<muted-text>Requerir autenticación de dos factores para todas las personas de este dominio. Las personas de este dominio deberán configurar la autenticación de dos factores en su cuenta cuando inicien sesión.</muted-text>`,
            forceTwoFactorAuthError: 'No se pudo cambiar la obligación de usar la autenticación en dos pasos. Inténtalo de nuevo más tarde.',
            resetTwoFactorAuth: 'Restablecer la autenticación de dos factores',
            error: 'No se pudo guardar este cambio. Inténtalo de nuevo.',
        },
        groups: {
            title: 'Grupos',
            memberCount: () => {
                return {
                    one: '1 miembro',
                    other: (count: number) => `${count} miembros`,
                };
            },
            defaultGroup: 'Grupo predeterminado para nuevos miembros',
            defaultGroupPrompt: (currentName: string, newName: string) =>
                `¿Seguro que quieres establecer ${newName} como el grupo predeterminado? Los nuevos miembros serán invitados a este grupo en lugar del grupo predeterminado anterior (${currentName}).`,
            makeDefault: 'Establecer como predeterminado',
            neverMind: 'No importa',
            permissions: 'Permisos del grupo',
            strictlyEnforceWorkspaceRules: 'Aplicar estrictamente las reglas del espacio de trabajo',
            strictlyEnforceWorkspaceRulesDescription: 'Todas las reglas del espacio de trabajo deben cumplirse antes de enviar un informe. No se permiten excepciones manuales.',
            restrictExpenseWorkspaceCreation: 'Restringir la creación/eliminación de espacios de trabajo de gastos',
            restrictExpenseWorkspaceCreationDescription:
                'Evita que las personas miembros puedan crear un espacio de trabajo de gastos o eliminarse de uno. Esto es útil para impedir que usen Expensify para enviar informes que se utilicen fuera de tu dominio cuando se combina con una aplicación estricta de espacios de trabajo.',
        },
    },
};
export default translations;
