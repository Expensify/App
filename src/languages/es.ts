import {CONST as COMMON_CONST} from 'expensify-common';
import dedent from '@libs/StringUtils/dedent';
import CONST from '@src/CONST';
import type {OriginalMessageSettlementAccountLocked, PolicyRulesModifiedFields} from '@src/types/onyx/OriginalMessage';
import ObjectUtils from '@src/types/utils/ObjectUtils';
import type en from './en';
import type {CreatedReportForUnapprovedTransactionsParams, PaidElsewhereParams, RoutedDueToDEWParams, SplitDateRangeParams, ViolationsRterParams} from './params';
import type {TranslationDeepObject} from './types';

/* eslint-disable max-len */
const translations: TranslationDeepObject<typeof en> = {
    common: {
        count: 'Contar',
        cancel: 'Cancelar',
        dismiss: 'Descartar',
        proceed: 'Proceder',
        unshare: 'Dejar de compartir',
        yes: 'Sí',
        no: 'No',
        ok: 'OK',
        notNow: 'Ahora no',
        noThanks: 'No, gracias',
        learnMore: 'Más información',
        buttonConfirm: 'Ok, entendido',
        name: 'Nombre',
        attachment: 'Archivo adjunto',
        attachments: 'Archivos adjuntos',
        from: 'De',
        to: 'A',
        in: 'En',
        optional: 'Opcional',
        new: 'Nuevo',
        newFeature: 'Nueva función',
        center: 'Centrar',
        search: 'Buscar',
        reports: 'Informes',
        find: 'Encontrar',
        searchWithThreeDots: 'Buscar...',
        select: 'Seleccionar',
        deselect: 'Deseleccionar',
        selectMultiple: 'Seleccionar varios',
        next: 'Siguiente',
        create: 'Crear',
        previous: 'Anterior',
        goBack: 'Volver',
        add: 'Añadir',
        resend: 'Reenviar',
        save: 'Guardar',
        saveChanges: 'Guardar cambios',
        submit: 'Enviar',
        submitted: 'Enviado',
        rotate: 'Rotar',
        zoom: 'Zoom',
        password: 'Contraseña',
        magicCode: 'Código mágico',
        digits: 'dígitos',
        twoFactorCode: 'Autenticación de dos factores',
        workspaces: 'Espacios de trabajo',
        inbox: 'Recibidos',
        home: 'Inicio',
        group: 'Grupo',
        profile: 'Perfil',
        referral: 'Remisión',
        payments: 'Pagos',
        approvals: 'Aprobaciones',
        wallet: 'Billetera',
        preferences: 'Preferencias',
        view: 'Ver',
        review: (reviewParams) => `Revisar${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'No',
        privacyPolicy: 'la Política de Privacidad de Expensify',
        addCardTermsOfService: 'Términos de Servicio',
        perPerson: 'por persona',
        signIn: 'Conectarse',
        signInWithGoogle: 'Iniciar sesión con Google',
        signInWithApple: 'Iniciar sesión con Apple',
        signInWith: 'Iniciar sesión con',
        continue: 'Continuar',
        firstName: 'Nombre',
        lastName: 'Apellidos',
        scanning: 'Escaneando',
        analyzing: 'Analizando...',
        phone: 'Teléfono',
        phoneNumber: 'Número de teléfono',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'Correo electrónico',
        and: 'y',
        or: 'o',
        details: 'Detalles',
        privacy: 'Privacidad',
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
        unPin: 'Desfijar',
        back: 'Volver',
        saveAndContinue: 'Guardar y continuar',
        settings: 'Configuración',
        termsOfService: 'Términos de Servicio',
        members: 'Miembros',
        invite: 'Invitar',
        here: 'aquí',
        date: 'Fecha',
        dob: 'Fecha de nacimiento',
        currentYear: 'Año actual',
        currentMonth: 'Mes actual',
        ssnLast4: 'Últimos 4 dígitos de tu SSN',
        ssnFull9: 'Los 9 dígitos del SSN',
        addressLine: (lineNumber) => `Dirección línea ${lineNumber}`,
        personalAddress: 'Dirección física personal',
        companyAddress: 'Dirección física de la empresa',
        noPO: 'Nada de apartados de correos ni direcciones de envío, por favor.',
        city: 'Ciudad',
        state: 'Estado',
        streetAddress: 'Dirección',
        stateOrProvince: 'Estado / Provincia',
        country: 'País',
        zip: 'Código postal',
        zipPostCode: 'Código postal',
        whatThis: '¿Qué es esto?',
        iAcceptThe: 'Acepto los ',
        acceptTermsAndPrivacy: `Acepto los <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Términos de Servicio</a> y <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">la Política de Privacidad de Expensify</a>`,
        acceptTermsAndConditions: `Acepto los <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">Términos y Condiciones</a>`,
        acceptTermsOfService: `Acepto los <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Términos de Servicio</a>`,
        remove: 'Eliminar',
        admin: 'Administrador',
        owner: 'Dueño',
        dateFormat: 'AAAA-MM-DD',
        send: 'Enviar',
        na: 'N/A',
        noResultsFound: 'No se han encontrado resultados',
        noResultsFoundMatching: (searchString: string) => `No se encontraron resultados que coincidan con "${searchString}"`,
        recentDestinations: 'Destinos recientes',
        timePrefix: 'Son las',
        conjunctionFor: 'para',
        todayAt: 'Hoy a las',
        tomorrowAt: 'Mañana a las',
        yesterdayAt: 'Ayer a las',
        conjunctionAt: 'a',
        conjunctionTo: 'a',
        genericErrorMessage: 'Ups... algo no ha ido bien y la acción no se ha podido completar. Por favor, inténtalo más tarde.',
        percentage: 'Porcentaje',
        converted: 'Convertido',
        error: {
            invalidAmount: 'Importe no válido',
            acceptTerms: 'Debes aceptar los Términos de Servicio para continuar',
            phoneNumber: `Por favor, introduce un número de teléfono completo\n(ej. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Este campo es obligatorio',
            requestModified: 'Esta solicitud está siendo modificada por otro miembro',
            characterLimitExceedCounter: (length, limit) => `Se superó el límite de caracteres (${length}/${limit})`,
            dateInvalid: 'Por favor, selecciona una fecha válida',
            invalidDateShouldBeFuture: 'Por favor, elige una fecha igual o posterior a hoy',
            invalidTimeShouldBeFuture: 'Por favor, elige una hora al menos un minuto en el futuro',
            invalidCharacter: 'Carácter invalido',
            enterMerchant: 'Introduce un comerciante',
            enterAmount: 'Introduce un importe',
            enterDate: 'Introduce una fecha',
            missingMerchantName: 'Falta el nombre del comerciante',
            missingAmount: 'Falta el importe',
            missingDate: 'Falta la fecha',
            invalidTimeRange: 'Por favor, introduce una hora entre 1 y 12 (por ejemplo, 2:30 PM)',
            pleaseCompleteForm: 'Por favor complete el formulario de arriba para continuar',
            pleaseSelectOne: 'Seleccione una de las opciones',
            invalidRateError: 'Por favor, introduce una tarifa válida',
            lowRateError: 'La tarifa debe ser mayor que 0',
            email: 'Por favor, introduzca una dirección de correo electrónico válida',
            login: 'Se produjo un error al iniciar sesión. Por favor intente nuevamente.',
        },
        comma: 'la coma',
        semicolon: 'el punto y coma',
        please: 'Por favor',
        rename: 'Renombrar',
        skip: 'Saltarse',
        contactUs: 'contáctenos',
        pleaseEnterEmailOrPhoneNumber: 'Por favor, escribe un correo electrónico o número de teléfono',
        fixTheErrors: 'corrige los errores',
        inTheFormBeforeContinuing: 'en el formulario antes de continuar',
        confirm: 'Confirmar',
        reset: 'Restablecer',
        done: 'Listo',
        more: 'Más',
        debitCard: 'Tarjeta de débito',
        bankAccount: 'Cuenta bancaria',
        personalBankAccount: 'Cuenta bancaria personal',
        businessBankAccount: 'Cuenta bancaria comercial',
        join: 'Unirse',
        leave: 'Salir',
        decline: 'Rechazar',
        reject: 'Rechazar',
        transferBalance: 'Transferencia de saldo',
        enterManually: 'Introducir manualmente',
        message: 'Chatear con',
        leaveThread: 'Salir del hilo',
        you: 'Tú',
        me: 'yo',
        youAfterPreposition: 'ti',
        your: 'tu',
        conciergeHelp: 'Por favor, contacta con Concierge para obtener ayuda.',
        youAppearToBeOffline: 'Parece que estás desconectado.',
        thisFeatureRequiresInternet: 'Esta función requiere una conexión a Internet activa.',
        attachmentWillBeAvailableOnceBackOnline: 'El archivo adjunto estará disponible cuando vuelvas a estar en línea.',
        errorOccurredWhileTryingToPlayVideo: 'Se produjo un error al intentar reproducir este video.',
        areYouSure: '¿Estás seguro?',
        verify: 'Verifique',
        yesContinue: 'Sí, continuar',
        websiteExample: 'p. ej. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}) => (zipSampleFormat ? `p. ej. ${zipSampleFormat}` : ''),
        description: 'Descripción',
        title: 'Título',
        assignee: 'Asignado a',
        createdBy: 'Creado por',
        with: 'con',
        shareCode: 'Compartir código',
        share: 'Compartir',
        per: 'por',
        mi: 'milla',
        km: 'kilómetro',
        copied: '¡Copiado!',
        someone: 'Alguien',
        total: 'Total',
        edit: 'Editar',
        letsDoThis: '¡Hagámoslo!',
        letsStart: 'Empecemos',
        showMore: 'Mostrar más',
        showLess: 'Mostrar menos',
        merchant: 'Comerciante',
        change: 'Cambio',
        category: 'Categoría',
        report: 'Informe',
        billable: 'Facturable',
        nonBillable: 'No facturable',
        tag: 'Etiqueta',
        receipt: 'Recibo',
        verified: 'Verificado',
        replace: 'Sustituir',
        distance: 'Distancia',
        mile: 'milla',
        miles: 'millas',
        kilometer: 'kilómetro',
        kilometers: 'kilómetros',
        recent: 'Reciente',
        all: 'Todo',
        am: 'AM',
        pm: 'PM',
        tbd: 'Por determinar',
        selectCurrency: 'Selecciona una moneda',
        selectSymbolOrCurrency: 'Selecciona un símbolo o moneda',
        card: 'Tarjeta',
        whyDoWeAskForThis: '¿Por qué pedimos esto?',
        required: 'Obligatorio',
        showing: 'Mostrando',
        of: 'de',
        default: 'Predeterminado',
        update: 'Actualizar',
        member: 'Miembro',
        success: 'Éxito',
        auditor: 'Auditor',
        role: 'Role',
        currency: 'Divisa',
        groupCurrency: 'Moneda del grupo',
        rate: 'Tarifa',
        emptyLHN: {
            title: 'Woohoo! Todo al día.',
            subtitleText1: 'Encuentra un chat usando el botón',
            subtitleText2: 'o crea algo usando el botón',
            subtitleText3: '.',
        },
        businessName: 'Nombre de la empresa',
        clear: 'Borrar',
        type: 'Tipo',
        reportName: 'Nombre del informe',
        action: 'Acción',
        expenses: 'Gastos',
        totalSpend: 'Gasto total',
        tax: 'Impuesto',
        shared: 'Compartidos',
        drafts: 'Borradores',
        draft: 'Borrador',
        finished: 'Finalizados',
        upgrade: 'Mejora',
        downgradeWorkspace: 'Desmejora tu espacio de trabajo',
        companyID: 'Empresa ID',
        userID: 'Usuario ID',
        disable: 'Deshabilitar',
        export: 'Exportar',
        initialValue: 'Valor inicial',
        currentDate: 'Fecha actual',
        value: 'Valor',
        downloadFailedTitle: 'Error en la descarga',
        downloadFailedDescription: 'No se pudo completar la descarga. Por favor, inténtalo más tarde.',
        filterLogs: 'Registros de filtrado',
        network: 'La red',
        reportID: 'ID del informe',
        longReportID: 'ID de informe largo',
        withdrawalID: 'ID de retiro',
        bankAccounts: 'Cuentas bancarias',
        chooseFile: 'Elegir archivo',
        chooseFiles: 'Elegir archivos',
        dropTitle: 'Suéltalo',
        dropMessage: 'Suelta tu archivo aquí',
        enabled: 'Habilitado',
        disabled: 'Desactivada',
        ignore: 'Ignorar',
        import: 'Importar',
        offlinePrompt: 'No puedes realizar esta acción ahora mismo.',
        outstanding: 'Pendiente',
        chats: 'Chats',
        tasks: 'Tareas',
        unread: 'No leído',
        sent: 'Enviado',
        links: 'Enlaces',
        day: 'día',
        days: 'días',
        address: 'Dirección',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        secondAbbreviation: 's',
        chatWithAccountManager: (accountManagerDisplayName) => `¿Necesitas algo específico? Habla con tu gerente de cuenta, ${accountManagerDisplayName}.`,
        chatNow: 'Chatear ahora',
        workEmail: 'correo electrónico de trabajo',
        destination: 'Destino',
        subrate: 'Subtasa',
        perDiem: 'Per diem',
        validate: 'Validar',
        downloadAsPDF: 'Descargar como PDF',
        downloadAsCSV: 'Descargar como CSV',
        help: 'Ayuda',
        expenseReport: 'Informe de Gastos',
        expenseReports: 'Informes de Gastos',
        rateOutOfPolicy: 'Tasa fuera de póliza',
        leaveWorkspace: 'Salir del espacio de trabajo',
        leaveWorkspaceConfirmation: 'Si sales de este espacio de trabajo, no podrás enviar gastos en él.',
        leaveWorkspaceConfirmationAuditor: 'Si sales de este espacio de trabajo, no podrás ver sus informes y configuraciones.',
        leaveWorkspaceConfirmationAdmin: 'Si sales de este espacio de trabajo, no podrás gestionar su configuración.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Si sales de este espacio de trabajo, serás reemplazado en el flujo de aprobación por ${workspaceOwner}, el propietario del espacio de trabajo.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Si sales de este espacio de trabajo, serás reemplazado como el exportador preferido por ${workspaceOwner}, el propietario del espacio de trabajo.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Si dejas este espacio de trabajo, serás reemplazado como el contacto técnico por ${workspaceOwner}, el propietario del espacio de trabajo.`,
        leaveWorkspaceReimburser:
            'No puedes salir de este espacio de trabajo como reembolsador. Por favor, establece un nuevo reembolsador en Espacios de trabajo > Realizar o rastrear pagos y luego inténtalo de nuevo.',
        reimbursable: 'Reembolsable',
        editYourProfile: 'Edita tu perfil',
        comments: 'Comentarios',
        sharedIn: 'Compartido en',
        unreported: 'No reportado',
        explore: 'Explorar',
        insights: 'Información',
        todo: 'Tereas',
        invoice: 'Factura',
        expense: 'Gasto',
        chat: 'Chat',
        task: 'Tarea',
        trip: 'Viaje',
        apply: 'Aplicar',
        status: 'Estado',
        on: 'El',
        before: 'Antes',
        after: 'Después',
        reschedule: 'Reprogramar',
        general: 'General',
        workspacesTabTitle: 'Espacios',
        headsUp: '¡Atención!',
        submitTo: 'Enviar a',
        forwardTo: 'Reenviar a',
        merge: 'Fusionar',
        none: 'Ninguno',
        unstableInternetConnection: 'Conexión a internet inestable. Por favor, revisa tu red e inténtalo de nuevo.',
        enableGlobalReimbursements: 'Habilitar Reembolsos Globales',
        purchaseAmount: 'Importe de compra',
        originalAmount: 'Importe original',
        frequency: 'Frecuencia',
        link: 'Enlace',
        pinned: 'Fijado',
        read: 'Leído',
        copyToClipboard: 'Copiar al portapapeles',
        thisIsTakingLongerThanExpected: 'Está tardando más de lo esperado...',
        domains: 'Dominios',
        actionRequired: 'Acción requerida',
        duplicate: 'Duplicar',
        duplicated: 'Duplicado',
        duplicateExpense: 'Duplicar gasto',
        exchangeRate: 'Tipo de cambio',
        reimbursableTotal: 'Total reembolsable',
        nonReimbursableTotal: 'Total no reembolsable',
        month: 'Monat',
        week: 'Semana',
        year: 'Año',
        quarter: 'Trimestre',
    },
    supportalNoAccess: {
        title: 'No tan rápido',
        descriptionWithCommand: ({command} = {}) =>
            `No estás autorizado para realizar esta acción cuando el soporte ha iniciado sesión (comando: ${command ?? ''}). Si crees que Success debería poder realizar esta acción, inicia una conversación en Slack.`,
    },
    lockedAccount: {
        title: 'Cuenta Bloqueada',
        description: 'No puedes completar esta acción porque esta cuenta ha sido bloqueada. Para obtener más información, escribe a concierge@expensify.com.',
    },
    connectionComplete: {
        title: 'Conexión completa',
        supportingText: 'Ya puedes cerrar esta página y volver a la App de Expensify.',
    },
    location: {
        useCurrent: 'Usar ubicación actual',
        notFound: 'No pudimos encontrar tu ubicación. Inténtalo de nuevo o introduce una dirección manualmente.',
        permissionDenied: 'Parece que has denegado el permiso a tu ubicación.',
        please: 'Por favor,',
        allowPermission: 'habilita el permiso de ubicación en la configuración',
        tryAgain: 'e inténtalo de nuevo.',
    },
    contact: {
        importContacts: 'Importar contactos',
        importContactsTitle: 'Importa tus contactos',
        importContactsText: 'Importa contactos desde tu teléfono para que tus personas favoritas siempre estén a un toque de distancia.',
        importContactsExplanation: 'para que tus personas favoritas estén siempre a un toque de distancia.',
        importContactsNativeText: '¡Solo un paso más! Danos luz verde para importar tus contactos.',
    },
    anonymousReportFooter: {
        logoTagline: 'Únete a la discusión.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Permiso para acceder a la cámara',
        expensifyDoesNotHaveAccessToCamera: 'Expensify no puede tomar fotos sin acceso a la cámara. Haz click en configuración para actualizar los permisos.',
        attachmentError: 'Error al adjuntar archivo',
        errorWhileSelectingAttachment: 'Se ha producido un error al seleccionar un archivo adjunto. Por favor, inténtalo de nuevo.',
        errorWhileSelectingCorruptedAttachment: 'Se ha producido un error al seleccionar un archivo adjunto corrupto. Por favor, inténtalo con otro archivo.',
        takePhoto: 'Hacer una foto',
        chooseFromGallery: 'Elegir de la galería',
        chooseDocument: 'Elegir un archivo',
        attachmentTooLarge: 'Archivo adjunto demasiado grande',
        sizeExceeded: 'El archivo adjunto supera el límite de 24 MB.',
        sizeExceededWithLimit: ({maxUploadSizeInMB}) => `El archivo adjunto supera el límite de ${maxUploadSizeInMB} MB.`,
        attachmentTooSmall: 'Archivo adjunto demasiado pequeño',
        sizeNotMet: 'El archivo adjunto debe ser más grande que 240 bytes.',
        wrongFileType: 'Tipo de archivo inválido',
        notAllowedExtension: 'Este tipo de archivo no es compatible',
        folderNotAllowedMessage: 'Subir una carpeta no está permitido. Prueba con otro archivo.',
        protectedPDFNotSupported: 'Los PDFs con contraseña no son compatibles',
        attachmentImageResized: 'Se ha cambiado el tamaño de esta imagen para obtener una vista previa. Descargar para resolución completa.',
        attachmentImageTooLarge: 'Esta imagen es demasiado grande para obtener una vista previa antes de subirla.',
        tooManyFiles: (fileLimit) => `Solamente puedes suber ${fileLimit} archivos a la vez.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}) => `El archivo supera los ${maxUploadSizeInMB} MB. Por favor, vuelve a intentarlo.`,
        someFilesCantBeUploaded: 'Algunos archivos no se pueden subir',
        sizeLimitExceeded: ({maxUploadSizeInMB}) => `Los archivos deben ser menores a ${maxUploadSizeInMB} MB. Los archivos más grandes no se subirán.`,
        maxFileLimitExceeded: 'Puedes subir hasta 30 recibos a la vez. Los extras no se subirán.',
        unsupportedFileType: (fileType) => `${fileType} archivos no son compatibles. Solo se subirán los archivos compatibles.`,
        learnMoreAboutSupportedFiles: 'Obtén más información sobre los formatos compatibles.',
        passwordProtected: 'Los PDFs con contraseña no son compatibles. Solo se subirán los archivos compatibles',
    },
    dropzone: {
        addAttachments: 'Añadir archivos adjuntos',
        addReceipt: 'Añadir recibo',
        scanReceipts: 'Escanear recibos',
        replaceReceipt: 'Reemplazar recibo',
    },
    filePicker: {
        fileError: 'Error de archivo',
        errorWhileSelectingFile: 'An error occurred while selecting an file. Please try again.',
    },
    avatarCropModal: {
        title: 'Editar foto',
        description: 'Arrastra, haz zoom y rota tu imagen para que quede como te gusta.',
    },
    composer: {
        noExtensionFoundForMimeType: 'No se encontró una extension para este tipo de contenido',
        problemGettingImageYouPasted: 'Ha ocurrido un problema al obtener la imagen que has pegado',
        commentExceededMaxLength: (formattedMaxLength) => `El comentario debe tener máximo ${formattedMaxLength} caracteres.`,
        taskTitleExceededMaxLength: (formattedMaxLength) => `La longitud máxima del título de una tarea es de ${formattedMaxLength} caracteres.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Actualizar app',
        updatePrompt: 'Existe una nueva versión de esta aplicación.\nActualiza ahora or reinicia la aplicación más tarde para recibir la última versión.',
    },
    deeplinkWrapper: {
        launching: 'Cargando Expensify',
        expired: 'Tu sesión ha expirado.',
        signIn: 'Por favor, inicia sesión de nuevo.',
    },
    multifactorAuthentication: {
        biometricsTest: {
            biometricsTest: 'Prueba de biometría',
            authenticationSuccessful: 'Autenticación exitosa',
            successfullyAuthenticatedUsing: ({authType}) => `Te has autenticado exitosamente con ${authType}.`,
            troubleshootBiometricsStatus: ({registered}) => `Biometría (${registered ? 'Registrada' : 'No registrada'})`,
            yourAttemptWasUnsuccessful: 'Tu intento de autenticación fue fallido.',
            youCouldNotBeAuthenticated: 'No se pudo autenticar',
            areYouSureToReject: '¿Estás seguro? El intento de autenticación será rechazado si cierras esta pantalla.',
            rejectAuthentication: 'Rechazar autenticación',
            test: 'Prueba',
            biometricsAuthentication: 'Autenticación biométrica',
        },
        pleaseEnableInSystemSettings: {
            start: 'Por favor, activa la verificación de rostro/huella digital o establece un código de acceso en tus ',
            link: 'ajustes del sistema',
            end: '.',
        },
        oops: 'Ups, algo salió mal',
        looksLikeYouRanOutOfTime: '¡Parece que se te acabó el tiempo! Por favor, inténtalo de nuevo en el comercio.',
        youRanOutOfTime: 'Se te acabó el tiempo',
        letsVerifyItsYou: 'Verifiquemos que eres tú',
        verifyYourself: {
            biometrics: 'Verifícate con tu rostro o huella dactilar',
        },
        enableQuickVerification: {
            biometrics: 'Activa la verificación rápida y segura usando tu rostro o huella dactilar. No se requieren contraseñas ni códigos.',
        },
        revoke: {
            revoke: 'Revocar',
            title: 'Reconocimiento facial/huella digital y claves de acceso',
            explanation:
                'La verificación mediante reconocimiento facial, huella digital o clave de acceso está habilitada en uno o más dispositivos. Revocar el acceso requerirá un código mágico para la próxima verificación en cualquier dispositivo.',
            confirmationPrompt: '¿Estás seguro? Necesitarás un código mágico para la próxima verificación en cualquier dispositivo.',
            cta: 'Revocar acceso',
            noDevices:
                'No tienes ningún dispositivo registrado para la verificación mediante reconocimiento facial, huella digital o clave de acceso. Si registras alguno, podrás revocar ese acceso aquí.',
            dismiss: 'Entendido',
            error: 'La solicitud ha fallado. Inténtalo de nuevo más tarde.',
        },
    },
    validateCodeModal: {
        successfulSignInTitle: 'Abracadabra,\n¡sesión iniciada!',
        successfulSignInDescription: 'Vuelve a la pestaña original para continuar.',
        title: 'Aquí está tu código mágico',
        or: ', ¡o',
        doNotShare: '¡No compartas tu código con nadie.\nExpensify nunca te lo pedirá.',
        description: 'Por favor, introduce el código utilizando el dispositivo\nen el que se solicitó originalmente',
        signInHere: 'simplemente inicia sesión aquí',
        expiredCodeTitle: 'Código mágico caducado',
        expiredCodeDescription: 'Vuelve al dispositivo original y solicita un código nuevo',
        successfulNewCodeRequest: 'Código solicitado. Por favor, comprueba tu dispositivo.',
        tfaRequiredTitle: 'Se requiere autenticación\nde dos factores',
        tfaRequiredDescription: 'Por favor, introduce el código de autenticación de dos factores\ndonde estás intentando iniciar sesión.',
        requestOneHere: 'solicite uno aquí.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Pagado por',
        whatsItFor: '¿Para qué es?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Nombre, correo electrónico o número de teléfono',
        findMember: 'Encuentra un miembro',
        searchForSomeone: 'Busca a alguien',
    },
    customApprovalWorkflow: {
        title: 'Flujo de aprobación personalizado',
        description: 'Tu empresa tiene un flujo de aprobación personalizado en este espacio de trabajo. Por favor, realiza esta acción en Expensify Classic',
        goToExpensifyClassic: 'Cambiar a Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Presenta un gasto, recomienda a tu equipo',
            subtitleText: '¿Quieres que tu equipo también use Expensify? Simplemente envíale un gasto y nosotros nos encargaremos del resto.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Programar una llamada',
    },
    hello: 'Hola',
    phoneCountryCode: '34',
    welcomeText: {
        getStarted: 'Comience a continuación.',
        anotherLoginPageIsOpen: 'Otra página de inicio de sesión está abierta.',
        anotherLoginPageIsOpenExplanation: 'Ha abierto la página de inicio de sesión en una pestaña separada. Inicie sesión desde esa pestaña específica.',
        welcome: '¡Bienvenido!',
        welcomeWithoutExclamation: 'Bienvenido',
        phrase2: 'El dinero habla. Y ahora que chat y pagos están en un mismo lugar, es también fácil.',
        phrase3: 'Tus pagos llegan tan rápido como tus mensajes.',
        enterPassword: 'Por favor, introduce tu contraseña',
        welcomeNewFace: ({login}) => `${login}, siempre es genial ver una cara nueva por aquí!`,
        welcomeEnterMagicCode: ({login}) => `Por favor, introduce el código mágico enviado a ${login}. Debería llegar en un par de minutos.`,
    },
    login: {
        hero: {
            header: 'Viajes y gastos, a la velocidad del chat',
            body: 'Bienvenido a la próxima generación de Expensify, donde tus viajes y gastos avanzan más rápido con la ayuda de un chat contextual en tiempo real.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Continua iniciando sesión con el inicio de sesión único:',
        orContinueWithMagicCode: 'También puedes iniciar sesión con un código mágico',
        useSingleSignOn: 'Usar el inicio de sesión único',
        useMagicCode: 'Usar código mágico',
        launching: 'Cargando...',
        oneMoment: 'Un momento mientras te redirigimos al portal de inicio de sesión único de tu empresa.',
    },
    reportActionCompose: {
        dropToUpload: 'Suelta el archivo aquí para compartirlo',
        sendAttachment: 'Enviar adjunto',
        addAttachment: 'Añadir archivo adjunto',
        writeSomething: 'Escribe algo...',
        blockedFromConcierge: 'Comunicación no permitida',
        fileUploadFailed: 'Subida fallida. El archivo no es compatible.',
        localTime: ({user, time}) => `Son las ${time} para ${user}`,
        edited: '(editado)',
        emoji: 'Emoji',
        collapse: 'Colapsar',
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
        editAction: ({action}) => `Editar ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'gasto' : 'comentario'}`,
        deleteAction: ({action}) => {
            let type = 'comentario';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'gasto';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'informe';
            }
            return `Eliminar ${type}`;
        },
        deleteConfirmation: ({action}) => {
            let type = 'comentario';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'gasto';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'informe';
            }
            return `¿Estás seguro de que quieres eliminar este ${type}?`;
        },
        onlyVisible: 'Visible sólo para',
        explain: 'Explicar',
        explainMessage: 'Por favor explícame esto.',
        replyInThread: 'Responder en el hilo',
        joinThread: 'Unirse al hilo',
        leaveThread: 'Dejar hilo',
        copyOnyxData: 'Copiar datos de Onyx',
        flagAsOffensive: 'Marcar como ofensivo',
        menu: 'Menú',
    },
    emojiReactions: {
        addReactionTooltip: 'Añadir una reacción',
        reactedWith: 'reaccionó con',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName, reportDetailsLink) =>
            `Te perdiste la fiesta en <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, no hay nada que ver aquí.`,
        beginningOfChatHistoryDomainRoom: (domainRoom) =>
            `Este chat es con todos los miembros de Expensify en el dominio <strong>${domainRoom}</strong>. Úsalo para chatear con colegas, compartir consejos y hacer preguntas.`,
        beginningOfChatHistoryAdminRoom: (workspaceName) =>
            `Este chat es con los administradores del espacio de trabajo <strong>${workspaceName}</strong>. Úsalo para hablar sobre la configuración del espacio de trabajo y más.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName) =>
            `Este chat es con todos en <strong>${workspaceName}</strong>. Úsalo para hablar sobre la configuración del espacio de trabajo y más.`,
        beginningOfChatHistoryUserRoom: (reportName, reportDetailsLink) =>
            `Esta sala de chat es para cualquier cosa relacionada con <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer, invoiceReceiver) =>
            `Este chat es para facturas entre <strong>${invoicePayer}</strong> y <strong>${invoiceReceiver}</strong>. Usa el botón + para enviar una factura.`,
        beginningOfChatHistory: (users) => `Este chat es con ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName, submitterDisplayName) =>
            `Aquí es donde <strong>${submitterDisplayName}</strong> enviará los gastos al espacio de trabajo <strong>${workspaceName}</strong>. Solo usa el botón +.`,
        beginningOfChatHistorySelfDM: 'Este es tu espacio personal. Úsalo para notas, tareas, borradores y recordatorios.',
        beginningOfChatHistorySystemDM: '¡Bienvenido! Vamos a configurar tu cuenta.',
        chatWithAccountManager: 'Chatea con tu gestor de cuenta aquí',
        askMeAnything: '¡Pregúntame lo que quieras!',
        sayHello: '¡Saluda!',
        yourSpace: 'Tu espacio',
        welcomeToRoom: ({roomName}) => `¡Bienvenido a ${roomName}!`,
        usePlusButton: ({additionalText}) => ` Usa el botón + para ${additionalText} un gasto`,
        askConcierge: ' Haz preguntas y obtén soporte en tiempo real las 24/7.',
        conciergeSupport: 'Soporte 24/7',
        create: 'crear',
        iouTypes: {
            pay: 'pagar',
            split: 'dividir',
            submit: 'presentar',
            track: 'rastrear',
            invoice: 'facturar',
        },
    },
    adminOnlyCanPost: 'Solo los administradores pueden enviar mensajes en esta sala.',
    reportAction: {
        asCopilot: 'como copiloto de',
        harvestCreatedExpenseReport: (reportUrl, reportName) =>
            `creó este informe para contener todos los gastos de <a href="${reportUrl}">${reportName}</a> que no se pudieron enviar con la frecuencia que elegiste`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName}: CreatedReportForUnapprovedTransactionsParams) =>
            `creó este informe para cualquier gasto retenido de <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: 'Notificar a todos en esta conversación',
    },
    newMessages: 'Mensajes nuevos',
    latestMessages: 'Últimos mensajes',
    youHaveBeenBanned: 'Nota: Se te ha prohibido comunicarte en este canal',
    reportTypingIndicator: {
        isTyping: 'está escribiendo...',
        areTyping: 'están escribiendo...',
        multipleMembers: 'Varios miembros',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Esta sala de chat ha sido eliminada.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}) => `Este chat está desactivado porque ${displayName} ha cerrado tu cuenta.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}) => `Este chat está desactivado porque ${oldDisplayName} ha combinado tu cuenta con ${displayName}`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}) =>
            shouldUseYou
                ? `Este chat ya no está activo porque <strong>tu</strong> ya no eres miembro del espacio de trabajo ${policyName}.`
                : `Este chat está desactivado porque ${displayName} ha dejado de ser miembro del espacio de trabajo ${policyName}.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}) => `Este chat está desactivado porque el espacio de trabajo ${policyName} se ha eliminado.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}) => `Este chat está desactivado porque el espacio de trabajo ${policyName} se ha eliminado.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Esta reserva está archivada.',
    },
    writeCapabilityPage: {
        label: 'Quién puede postear',
        writeCapability: {
            all: 'Todos los miembros',
            admins: 'Solo administradores',
        },
    },
    sidebarScreen: {
        buttonFind: 'Encuentre algo...',
        buttonMySettings: 'Mi configuración',
        fabNewChat: 'Iniciar chat',
        fabNewChatExplained: 'Abrir menú de acciones',
        fabScanReceiptExplained: 'Escanear recibo',
        chatPinned: 'Chat fijado',
        draftedMessage: 'Mensaje borrador',
        listOfChatMessages: 'Lista de mensajes del chat',
        listOfChats: 'lista de chats',
        saveTheWorld: 'Salvar el mundo',
        tooltip: '¡Comienza aquí!',
        redirectToExpensifyClassicModal: {
            title: 'Próximamente',
            description: 'Estamos ajustando algunos detalles de New Expensify para adaptarla a tu configuración específica. Mientras tanto, dirígete a Expensify Classic.',
        },
    },
    homePage: {
        forYou: 'Para ti',
        timeSensitiveSection: {
            title: 'Requiere atención inmediata',
            cta: 'Reclamar',
            offer50off: {
                title: '¡Obtén 50% de descuento en tu primer año!',
                subtitle: ({formattedTime}: {formattedTime: string}) => `${formattedTime} restantes`,
            },
            offer25off: {
                title: '¡Obtén 25% de descuento en tu primer año!',
                subtitle: ({days}: {days: number}) => `${days} ${days === 1 ? 'día' : 'días'} restantes`,
            },
        },
        announcements: 'Anuncios',
        discoverSection: {
            title: 'Descubrir',
            menuItemTitleNonAdmin: 'Aprende a crear gastos y enviar informes.',
            menuItemTitleAdmin: 'Aprende a invitar a miembros, editar flujos de aprobación y conciliar tarjetas corporativas.',
            menuItemDescription: 'Descubre lo que Expensify puede hacer en 2 minutos',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `Enviar ${count} ${count === 1 ? 'informe' : 'informes'}`,
            approve: ({count}: {count: number}) => `Aprobar ${count} ${count === 1 ? 'informe' : 'informes'}`,
            pay: ({count}: {count: number}) => `Pagar ${count} ${count === 1 ? 'informe' : 'informes'}`,
            export: ({count}: {count: number}) => `Exportar ${count} ${count === 1 ? 'informe' : 'informes'}`,
            begin: 'Comenzar',
            emptyStateMessages: {
                nicelyDone: '¡Muy bien hecho!',
                keepAnEyeOut: '¡Mantente atento a lo que viene a continuación!',
                allCaughtUp: 'Ya estás al día',
                upcomingTodos: 'Las tareas pendientes aparecerán aquí.',
            },
        },
    },
    allSettingsScreen: {
        subscription: 'Suscripcion',
        domains: 'Dominios',
    },
    tabSelector: {
        chat: 'Chat',
        room: 'Sala',
        distance: 'Distancia',
        manual: 'Manual',
        scan: 'Escanear',
        map: 'Map',
        gps: 'GPS',
        odometer: 'Odómetro',
    },
    spreadsheet: {
        upload: 'Importar',
        import: 'Importar hoja de cálculo',
        dragAndDrop: '<muted-link>Arrastra y suelta un archivo de hoja de cálculo aquí</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Arrastra y suelta un archivo de hoja de cálculo aquí, o elige un archivo a continuación. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Aprende más</a> sobre los formatos de archivo soportados.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Elige un archivo de hoja de cálculo para importar. Los formatos soportados son .csv, .txt, .xls y .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Elige un archivo de hoja de cálculo para importar. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Aprende más</a> sobre los formatos de archivo soportados.</muted-link>`,
        fileContainsHeader: 'El archivo contiene encabezados',
        column: (name) => `Columna ${name}`,
        fieldNotMapped: (fieldName) => `¡Vaya! Un campo obligatorio ("${fieldName}") no ha sido mapeado. Por favor, revisa e inténtalo de nuevo.`,
        singleFieldMultipleColumns: (fieldName) => `¡Vaya! Has mapeado un solo campo ("${fieldName}") a varias columnas. Por favor, revisa e inténtalo de nuevo.`,
        emptyMappedField: (fieldName) => `¡Vaya! El campo ("${fieldName}") contiene uno o más valores vacíos. Por favor, revísalo e inténtalo de nuevo.`,
        importFailedTitle: 'Fallo en la importación',
        importFailedDescription: 'Por favor, asegúrate de que todos los campos estén llenos correctamente e inténtalo de nuevo. Si el problema persiste, por favor contacta a Concierge.',
        importCategoriesSuccessfulDescription: ({categories}) => (categories > 1 ? `Se han agregado ${categories} categorías.` : 'Se ha agregado 1 categoría.'),
        importMembersSuccessfulDescription: ({added, updated}) => {
            if (!added && !updated) {
                return 'No se han añadido ni actualizado miembros.';
            }

            if (added && updated) {
                const getPluralSuffix = (count: number) => (count > 1 ? 's' : '');
                return `${added} miembro${getPluralSuffix(added)} añadido${getPluralSuffix(added)}, ${updated} miembro${getPluralSuffix(updated)} actualizado${getPluralSuffix(updated)}.`;
            }

            if (updated) {
                return updated > 1 ? `${updated} miembros han sido actualizados.` : '1 miembro ha sido actualizado.';
            }

            return added > 1 ? `Se han agregado ${added} miembros` : 'Se ha agregado 1 miembro.';
        },
        importTagsSuccessfulDescription: ({tags}) => (tags > 1 ? `Se han agregado ${tags} etiquetas.` : 'Se ha agregado 1 etiqueta.'),
        importMultiLevelTagsSuccessfulDescription: 'Etiquetas de nivel múltiple han sido agregadas.',
        importPerDiemRatesSuccessfulDescription: ({rates}) => (rates > 1 ? `Se han añadido ${rates} tasas de per diem.` : 'Se ha añadido 1 tasa de per diem.'),
        importTransactionsSuccessfulDescription: ({transactions}) => (transactions > 1 ? `Se han importado ${transactions} transacciones.` : 'Se ha importado 1 transacción.'),
        importCompanyCardTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `Se han importado ${transactions} transacciones.` : 'Se ha importado 1 transacción.',
        importSuccessfulTitle: 'Importar categorías',
        importDescription: 'Elige qué campos mapear desde tu hoja de cálculo haciendo clic en el menú desplegable junto a cada columna importada a continuación.',
        sizeNotMet: 'El archivo adjunto debe ser más grande que 0 bytes.',
        invalidFileMessage:
            'El archivo que subiste está vacío o contiene datos no válidos. Asegúrate de que el archivo esté correctamente formateado y contenga la información necesaria antes de volver a subirlo.',
        importSpreadsheetLibraryError: 'Error al cargar el módulo de hojas de cálculo. Por favor, verifica tu conexión a internet e inténtalo de nuevo.',
        importSpreadsheet: 'Importar hoja de cálculo',
        downloadCSV: 'Descargar CSV',
        importMemberConfirmation: () => ({
            one: `Por favor confirma los detalles a continuación para un nuevo miembro del espacio de trabajo que se agregará como parte de esta carga. Los miembros existentes no recibirán actualizaciones de rol ni mensajes de invitación.`,
            other: (count: number) =>
                `Por favor confirma los detalles a continuación para los ${count} nuevos miembros del espacio de trabajo que se agregarán como parte de esta carga. Los miembros existentes no recibirán actualizaciones de rol ni mensajes de invitación.`,
        }),
    },
    receipt: {
        upload: 'Subir recibo',
        uploadMultiple: 'Subir recibos',
        desktopSubtitleSingle: 'o arrastra y suéltalo aquí',
        desktopSubtitleMultiple: 'o arrástralos y suéltalos aquí',
        alternativeMethodsTitle: 'Otras formas de añadir recibos:',
        alternativeMethodsDownloadApp: ({downloadUrl}) => `<label-text><a href="${downloadUrl}">Descarga la aplicación</a> para escanear desde tu teléfono</label-text>`,
        alternativeMethodsForwardReceipts: ({email}) => `<label-text>Reenvía recibos a <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}) =>
            `<label-text><a href="${contactMethodsUrl}">Añade tu número</a> para enviar recibos por SMS a ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}) => `<label-text>Envía recibos por SMS a ${phoneNumber} (solo números de EE.UU.)</label-text>`,
        takePhoto: 'Haz una foto',
        cameraAccess: 'Se requiere acceso a la cámara para hacer fotos de los recibos.',
        deniedCameraAccess: `No se ha concedido el acceso a la cámara, siga <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">estas instrucciones</a>.`,
        cameraErrorTitle: 'Error en la cámara',
        locationAccessTitle: 'Permitir acceso a la ubicación',
        locationAccessMessage: 'El acceso a la ubicación nos ayuda a mantener tu zona horaria y moneda precisas dondequiera que vayas.',
        locationErrorTitle: 'Permitir acceso a la ubicación',
        locationErrorMessage: 'El acceso a la ubicación nos ayuda a mantener tu zona horaria y moneda precisas dondequiera que vayas.',
        allowLocationFromSetting: `El acceso a la ubicación nos ayuda a mantener tu zona horaria y moneda precisas dondequiera que estés. Por favor, permite el acceso a la ubicación en la configuración de permisos de tu dispositivo.`,
        cameraErrorMessage: 'Se ha producido un error al hacer una foto. Por favor, inténtalo de nuevo.',
        dropTitle: 'Suéltalo',
        dropMessage: 'Suelta tu archivo aquí',
        flash: 'flash',
        multiScan: 'escaneo múltiple',
        shutter: 'obturador',
        gallery: 'galería',
        deleteReceipt: 'Eliminar recibo',
        deleteConfirmation: '¿Estás seguro de que quieres borrar este recibo?',
        addReceipt: 'Añadir recibo',
        scanFailed: 'El recibo no pudo ser escaneado, ya que falta el comerciante, la fecha o el monto.',
        addAReceipt: {
            phrase1: 'Añade un recibo',
            phrase2: 'o arrastra y suelta uno aquí',
        },
    },
    quickAction: {
        scanReceipt: 'Escanear recibo',
        recordDistance: 'Gasto de distancia',
        requestMoney: 'Crear gasto',
        perDiem: 'Crear dietas',
        splitBill: 'Dividir gasto',
        splitScan: 'Dividir recibo',
        splitDistance: 'Dividir distancia',
        paySomeone: ({name} = {}) => `Pagar a ${name ?? 'alguien'}`,
        assignTask: 'Assignar tarea',
        header: 'Acción rápida',
        noLongerHaveReportAccess: 'Ya no tienes acceso al destino previo de esta acción rápida. Escoge uno nuevo a continuación.',
        updateDestination: 'Actualiza el destino',
        createReport: 'Crear informe',
    },
    iou: {
        amount: 'Importe',
        percent: 'Porcentaje',
        date: 'Fecha',
        taxAmount: 'Importe del impuesto',
        taxRate: 'Tasa de impuesto',
        approve: ({formattedAmount} = {}) => (formattedAmount ? `Aprobar ${formattedAmount}` : 'Aprobar'),
        approved: 'Aprobado',
        cash: 'Efectivo',
        card: 'Tarjeta',
        original: 'Original',
        split: 'Dividir',
        splitExpense: 'Dividir gasto',
        splitDates: 'Fechas de división',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate} al ${endDate} (${count} días)`,
        splitExpenseSubtitle: ({amount, merchant}) => `${amount} de ${merchant}`,
        splitByPercentage: 'Dividir por porcentaje',
        splitByDate: 'Dividir por fecha',
        addSplit: 'Añadir división',
        makeSplitsEven: 'Igualar divisiones',
        editSplits: 'Editar divisiones',
        totalAmountGreaterThanOriginal: ({amount}) => `El importe total es ${amount} mayor que el gasto original.`,
        totalAmountLessThanOriginal: ({amount}) => `El importe total es ${amount} menor que el gasto original.`,
        splitExpenseZeroAmount: 'Por favor, introduce un importe válido antes de continuar.',
        splitExpenseOneMoreSplit: 'No se han añadido divisiones. Añade al menos una para guardar.',
        splitExpenseEditTitle: ({amount, merchant}) => `Editar ${amount} para ${merchant}`,
        removeSplit: 'Eliminar división',
        splitExpenseCannotBeEditedModalTitle: 'Este gasto no se puede editar',
        splitExpenseCannotBeEditedModalDescription: 'Los gastos aprobados o pagados no se pueden editar',
        splitExpenseDistanceErrorModalDescription: 'Corrige el error de la tarifa de distancia e inténtalo de nuevo.',
        addExpense: 'Agregar gasto',
        expense: 'Gasto',
        categorize: 'Categorizar',
        share: 'Compartir',
        participants: 'Participantes',
        createExpense: 'Crear gasto',
        trackDistance: 'Gasto de distancia',
        createExpenses: (expensesNumber) => `Crear ${expensesNumber} gastos`,
        removeExpense: 'Eliminar gasto',
        removeThisExpense: 'Eliminar este gasto',
        removeExpenseConfirmation: '¿Estás seguro de que quieres eliminar este recibo? Esta acción no se puede deshacer.',
        paySomeone: ({name} = {}) => `Pagar a ${name ?? 'alguien'}`,
        chooseRecipient: 'Elige destinatario',
        createExpenseWithAmount: ({amount}) => `Crear un gasto de ${amount}`,
        confirmDetails: 'Confirma los detalles',
        pay: 'Pagar',
        cancelPayment: 'Cancelar el pago',
        cancelPaymentConfirmation: '¿Estás seguro de que quieres cancelar este pago?',
        viewDetails: 'Ver detalles',
        pending: 'Pendiente',
        canceled: 'Canceló',
        posted: 'Contabilizado',
        deleteReceipt: 'Eliminar recibo',
        pendingMatch: 'Pendiente de coincidencia',
        pendingMatchWithCreditCard: 'Recibo pendiente de adjuntar con la transacción de la tarjeta',
        pendingMatchWithCreditCardDescription: 'Recibo pendiente de adjuntar con la transacción de la tarjeta. Márcalo como efectivo para cancelar.',
        markAsCash: 'Marcar como efectivo',
        routePending: 'Ruta pendiente...',
        findExpense: 'Buscar gasto',
        deletedTransaction: (amount, merchant) => `eliminó un gasto (${amount} para ${merchant})`,
        movedFromReport: ({reportName}) => `movió un gasto${reportName ? ` desde ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}) => `movió este gasto${reportName ? ` a <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}) => `movió este gasto${reportName ? ` desde <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}) => `movió este gasto a tu <a href="${reportUrl}">espacio personal</a>`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}) => {
            if (shouldHideMovedReportUrl) {
                return `movió este informe al espacio de trabajo <a href="${newParentReportUrl}">${toPolicyName}</a>`;
            }
            return `movió este <a href="${movedReportUrl}">informe</a> al espacio de trabajo <a href="${newParentReportUrl}">${toPolicyName}</a>`;
        },
        receiptIssuesFound: () => ({
            one: 'Problema encontrado',
            other: 'Problemas encontrados',
        }),
        fieldPending: 'Pendiente...',
        receiptScanning: () => ({
            one: 'Escaneando recibo...',
            other: 'Escaneando recibos...',
        }),
        scanMultipleReceipts: 'Escanea varios recibos',
        scanMultipleReceiptsDescription: 'Haz fotos de todos tus recibos a la vez y confirma los detalles tú mismo o nosotros lo haremos por ti.',
        receiptScanInProgress: 'Escaneado de recibo en proceso',
        receiptScanInProgressDescription: 'Escaneado de recibo en proceso. Vuelve a comprobarlo más tarde o introduce los detalles ahora.',
        removeFromReport: 'Eliminar del informe',
        moveToPersonalSpace: 'Mover gastos a tu espacio personal',
        duplicateTransaction: (isSubmitted) =>
            !isSubmitted
                ? 'Se han identificado posibles gastos duplicados. Revisa los duplicados para habilitar el envío.'
                : 'Se han identificado posibles gastos duplicados. Revisa los duplicados para habilitar la aprobación.',
        defaultRate: 'Tasa predeterminada',
        receiptMissingDetails: 'Recibo con campos vacíos',
        missingAmount: 'Falta importe',
        missingMerchant: 'Falta comerciante',
        receiptStatusTitle: 'Escaneando…',
        receiptStatusText: 'Solo tú puedes ver este recibo cuando se está escaneando. Vuelve más tarde o introduce los detalles ahora.',
        receiptScanningFailed: 'El escaneo de recibo ha fallado. Introduce los detalles manualmente.',
        transactionPendingDescription: 'Transacción pendiente. Puede tardar unos días en contabilizarse.',
        companyInfo: 'Información de la empresa',
        companyInfoDescription: 'Necesitamos algunos detalles más antes de que pueda enviar su primera factura.',
        yourCompanyName: 'Nombre de su empresa',
        yourCompanyWebsite: 'Sitio web de su empresa',
        yourCompanyWebsiteNote: 'Si no tiene un sitio web, puede proporcionar el perfil de LinkedIn o de las redes sociales de su empresa.',
        invalidDomainError: 'Ha introducido un dominio no válido. Para continuar, introduzca un dominio válido.',
        publicDomainError: 'Ha introducido un dominio público. Para continuar, introduzca un dominio privado.',
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
            one: '¿Estás seguro de que quieres eliminar esta solicitud?',
            other: '¿Estás seguro de que quieres eliminar estas solicitudes?',
        }),
        deleteReport: 'Eliminar informe',
        deleteReportConfirmation: '¿Estás seguro de que quieres eliminar este informe?',
        settledExpensify: 'Pagado',
        done: 'Listo',
        settledElsewhere: 'Pagado de otra forma',
        individual: 'Individual',
        business: 'Empresa',
        settleExpensify: ({formattedAmount}) => (formattedAmount ? `Pagar ${formattedAmount} con Expensify` : `Pagar con Expensify`),
        settlePersonal: ({formattedAmount}) => (formattedAmount ? `Pago ${formattedAmount} como individuo` : `Pago con cuenta personal`),
        settleWallet: ({formattedAmount}) => (formattedAmount ? `Pagar ${formattedAmount} con billetera` : `con billetera`),
        settlePayment: ({formattedAmount}) => `Pagar ${formattedAmount}`,
        settleBusiness: ({formattedAmount}) => (formattedAmount ? `Pagar ${formattedAmount} como negocio` : `Pago con cuenta empresarial`),
        payElsewhere: ({formattedAmount}) => (formattedAmount ? `Marcar ${formattedAmount} como pagado` : `Marcar como pagado`),
        settleInvoicePersonal: (amount, last4Digits) => (amount ? `pagado ${amount} con cuenta personal ${last4Digits}` : `Pagado con cuenta personal`),
        settleInvoiceBusiness: (amount, last4Digits) => (amount ? `pagado ${amount} con cuenta de empresa ${last4Digits}` : `Pagado con cuenta de empresa`),
        payWithPolicy: ({formattedAmount, policyName}) => (formattedAmount ? `Pay ${formattedAmount} via ${policyName}` : `Pay via ${policyName}`),
        businessBankAccount: (amount, last4Digits) => (amount ? `pagó ${amount} con la cuenta bancaria ${last4Digits}.` : `pagó con la cuenta bancaria ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount, last4Digits) =>
            `pagado ${amount ? `${amount} ` : ''}con la cuenta bancaria terminada en ${last4Digits} vía <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">reglas del espacio de trabajo</a>`,
        invoicePersonalBank: (lastFour) => `Cuenta personal • ${lastFour}`,
        invoiceBusinessBank: (lastFour) => `Cuenta de empresa • ${lastFour}`,
        nextStep: 'Pasos siguientes',
        finished: 'Finalizado',
        flip: 'Cambiar',
        sendInvoice: ({amount}) => `Enviar factura de ${amount}`,
        expenseAmount: (formattedAmount, comment) => `${formattedAmount}${comment ? ` para ${comment}` : ''}`,
        submitted: ({memo}) => `enviado${memo ? `, dijo ${memo}` : ''}`,
        automaticallySubmitted: `envió mediante <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">retrasar envíos</a>`,
        queuedToSubmitViaDEW: 'en cola para enviar a través del flujo de aprobación personalizado',
        queuedToApproveViaDEW: 'en cola para aprobar a través del flujo de aprobación personalizado',
        trackedAmount: (formattedAmount, comment) => `realizó un seguimiento de ${formattedAmount}${comment ? ` para ${comment}` : ''}`,
        splitAmount: ({amount}) => `dividir ${amount}`,
        didSplitAmount: (formattedAmount, comment) => `dividió ${formattedAmount}${comment ? ` para ${comment}` : ''}`,
        yourSplit: ({amount}) => `Tu parte ${amount}`,
        payerOwesAmount: (amount, payer, comment) => `${payer} debe ${amount}${comment ? ` para ${comment}` : ''}`,
        payerOwes: ({payer}) => `${payer} debe: `,
        payerPaidAmount: (amount, payer) => `${payer ? `${payer} ` : ''}pagó ${amount}`,
        payerPaid: ({payer}) => `${payer} pagó: `,
        payerSpentAmount: (amount, payer) => `${payer} gastó ${amount}`,
        payerSpent: ({payer}) => `${payer} gastó: `,
        managerApproved: ({manager}) => `${manager} aprobó:`,
        managerApprovedAmount: ({manager, amount}) => `${manager} aprobó ${amount}`,
        payerSettled: (amount) => `pagó ${amount}`,
        payerSettledWithMissingBankAccount: (amount) => `pagó ${amount}. Agrega una cuenta bancaria para recibir tu pago.`,
        automaticallyApproved: `aprobó mediante <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">reglas del espacio de trabajo</a>`,
        approvedAmount: (amount) => `aprobó ${amount}`,
        approvedMessage: `aprobado`,
        unapproved: `no aprobado`,
        automaticallyForwarded: `aprobó mediante <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">reglas del espacio de trabajo</a>`,
        forwarded: `aprobó`,
        rejectedThisReport: 'rechazó este informe',
        waitingOnBankAccount: ({submitterDisplayName}) => `inició el pago, pero está esperando a que ${submitterDisplayName} añada una cuenta bancaria.`,
        adminCanceledRequest: 'canceló el pago',
        canceledRequest: (amount, submitterDisplayName) => `canceló el pago  ${amount}, porque ${submitterDisplayName} no habilitó tu Billetera Expensify en un plazo de 30 días.`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}) => `${submitterDisplayName} añadió una cuenta bancaria. El pago de ${amount} se ha realizado.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}marcó como pagado${comment ? `, diciendo "${comment}"` : ''}`,
        paidWithExpensify: (payer) => `${payer ? `${payer} ` : ''}pagó con la billetera`,
        automaticallyPaidWithExpensify: (payer) =>
            `${payer ? `${payer} ` : ''}pagó con Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">reglas del espacio de trabajo</a>`,
        noReimbursableExpenses: 'El importe de este informe no es válido',
        pendingConversionMessage: 'El total se actualizará cuando estés online',
        changedTheExpense: 'cambió el gasto',
        setTheRequest: ({valueName, newValueToDisplay}) =>
            `${valueName === 'comerciante' || valueName === 'importe' || valueName === 'gasto' ? 'el' : 'la'} ${valueName} a ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}) =>
            `estableció la ${translatedChangedField} a ${newMerchant}, lo que estableció el importe a ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}) =>
            `${valueName === 'comerciante' || valueName === 'importe' || valueName === 'gasto' ? 'el' : 'la'} ${valueName} (previamente ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}) =>
            `${valueName === 'comerciante' || valueName === 'importe' || valueName === 'gasto' ? 'el' : 'la'} ${valueName} a ${newValueToDisplay} (previamente ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}) =>
            `cambió la ${translatedChangedField} a ${newMerchant} (previamente ${oldMerchant}), lo que cambió el importe a ${newAmountToDisplay} (previamente ${oldAmountToDisplay})`,
        basedOnAI: 'basado en actividad pasada',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `basado en <a href="${rulesLink}">reglas del espacio de trabajo</a>` : 'basado en regla del espacio de trabajo'),
        threadExpenseReportName: ({formattedAmount, comment}) => `${comment ? `${formattedAmount} para ${comment}` : `Gasto de ${formattedAmount}`}`,
        invoiceReportName: ({linkedReportID}) => `Informe de facturación #${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}) => `${formattedAmount} enviado${comment ? ` para ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}) => `movió el gasto desde su espacio personal a ${workspaceName ?? `un chat con ${reportName}`}`,
        movedToPersonalSpace: 'movió el gasto a su espacio personal',
        error: {
            invalidCategoryLength: 'La longitud de la categoría escogida excede el máximo permitido (255). Por favor, escoge otra categoría o acorta la categoría primero.',
            invalidTagLength: 'La longitud de la etiqueta escogida excede el máximo permitido (255). Por favor, escoge otra etiqueta o acorta la etiqueta primero.',
            invalidAmount: 'Por favor, ingresa un importe válido antes de continuar',
            invalidDistance: 'Por favor, ingresa una distancia válida antes de continuar',
            invalidReadings: 'Por favor ingrese ambas lecturas de inicio y fin',
            negativeDistanceNotAllowed: 'La lectura final debe ser mayor que la lectura inicial',
            invalidIntegerAmount: 'Por favor, introduce una cantidad entera en dólares antes de continuar',
            invalidTaxAmount: ({amount}) => `El importe máximo del impuesto es ${amount}`,
            invalidSplit: 'La suma de las partes debe ser igual al importe total',
            invalidSplitParticipants: 'Introduce un importe superior a cero para al menos dos participantes',
            invalidSplitYourself: 'Por favor, introduce una cantidad diferente de cero para tu parte',
            noParticipantSelected: 'Por favor, selecciona un participante',
            other: 'Error inesperado. Por favor, inténtalo más tarde.',
            genericHoldExpenseFailureMessage: 'Error inesperado al retener el gasto. Por favor, inténtalo de nuevo más tarde.',
            genericUnholdExpenseFailureMessage: 'Error inesperado al desbloquear el gasto. Por favor, inténtalo de nuevo más tarde.',
            genericCreateFailureMessage: 'Error inesperado al enviar este gasto. Por favor, inténtalo más tarde.',
            genericCreateInvoiceFailureMessage: 'Error inesperado al enviar la factura. Por favor, inténtalo de nuevo más tarde.',
            receiptDeleteFailureError: 'Error inesperado al borrar este recibo. Por favor, vuelve a intentarlo más tarde.',
            receiptFailureMessage: '<rbr>Hubo un error al cargar tu recibo. Por favor, <a href="download">guarda el recibo</a> e <a href="retry">inténtalo de nuevo</a> más tarde.</rbr>',
            receiptFailureMessageShort: 'Hubo un error al cargar tu recibo.',
            genericDeleteFailureMessage: 'Error inesperado al eliminar este gasto. Por favor, inténtalo más tarde.',
            genericEditFailureMessage: 'Error inesperado al editar este gasto. Por favor, inténtalo más tarde.',
            genericSmartscanFailureMessage: 'La transacción tiene campos vacíos',
            duplicateWaypointsErrorMessage: 'Por favor, elimina los puntos de ruta duplicados',
            atLeastTwoDifferentWaypoints: 'Por favor, introduce al menos dos direcciones diferentes',
            splitExpenseMultipleParticipantsErrorMessage: 'Solo puedes dividir un gasto entre un único espacio de trabajo o con miembros individuales. Por favor, actualiza tu selección.',
            invalidMerchant: 'Por favor, introduce un comerciante válido',
            atLeastOneAttendee: 'Debe seleccionarse al menos un asistente',
            invalidQuantity: 'Por favor, introduce una cantidad válida',
            quantityGreaterThanZero: 'La cantidad debe ser mayor que cero',
            invalidSubrateLength: 'Debe haber al menos una subtasa',
            invalidRate: 'Tasa no válida para este espacio de trabajo. Por favor, selecciona una tasa disponible en el espacio de trabajo.',
            endDateBeforeStartDate: 'La fecha de finalización no puede ser anterior a la fecha de inicio',
            endDateSameAsStartDate: 'La fecha de finalización no puede ser la misma que la fecha de inicio',
            manySplitsProvided: `La cantidad máxima de divisiones permitidas es ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `El rango de fechas no puede exceder los ${CONST.IOU.SPLITS_LIMIT} días.`,
        },
        dismissReceiptError: 'Descartar error',
        dismissReceiptErrorConfirmation: '¡Atención! Descartar este error eliminará completamente tu recibo cargado. ¿Estás seguro?',
        waitingOnEnabledWallet: ({submitterDisplayName}) => `inició el pago, pero no se procesará hasta que ${submitterDisplayName} active su billetera`,
        enableWallet: 'Habilitar billetera',
        holdExpense: () => ({
            one: 'Retener gasto',
            other: 'Retener gastos',
        }),
        unholdExpense: 'Desbloquear gasto',
        moveUnreportedExpense: 'Mover gasto no reportado',
        addUnreportedExpense: 'Añadir gasto no reportado',
        selectUnreportedExpense: 'Selecciona al menos un gasto para agregar al informe.',
        emptyStateUnreportedExpenseTitle: 'No hay gastos no reportados',
        emptyStateUnreportedExpenseSubtitle: 'Parece que no tienes gastos no reportados. Puedes crear uno a continuación.',
        addUnreportedExpenseConfirm: 'Añadir al informe',
        heldExpense: 'retuvo este gasto',
        unheldExpense: 'desbloqueó este gasto',
        newReport: 'Nuevo informe',
        explainHold: () => ({
            one: 'Explica la razón para retener esta solicitud.',
            other: 'Explica la razón para retener estas solicitudes.',
        }),
        retract: 'Retractar',
        reopened: 'reabrir',
        reopenReport: 'Reabrir informe',
        reopenExportedReportConfirmation: ({connectionName}) =>
            `Este informe ya ha sido exportado a ${connectionName}. Cambiarlo puede provocar discrepancias en los datos. ¿Estás seguro de que deseas reabrir este informe?`,
        reason: 'Razón',
        retracted: 'retractado',
        holdReasonRequired: 'Se requiere una razón para retener.',
        expenseWasPutOnHold: 'Este gasto está retenido',
        expenseOnHold: 'Este gasto está retenido. Revisa los comentarios para saber como proceder.',
        expensesOnHold: 'Todos los gastos están retenidos. Revisa los comentarios para saber como proceder.',
        expenseDuplicate: 'Este gasto tiene detalles similares a otro. Por favor, revisa los duplicados para continuar.',
        someDuplicatesArePaid: 'Algunos de estos duplicados ya han sido aprobados o pagados.',
        reviewDuplicates: 'Revisar duplicados',
        keepAll: 'Mantener todos',
        confirmApprove: 'Confirmar importe a aprobar',
        confirmApprovalAmount: 'Aprueba sólo los gastos conformes, o aprueba todo el informe.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Este gasto está retenido. ¿Quieres aprobarlo de todos modos?',
            other: 'Estos gastos están retenidos. ¿Quieres aprobarlos de todos modos?',
        }),
        confirmPay: 'Confirmar importe de pago',
        confirmPayAmount: 'Paga lo que no está retenido, o paga el informe completo.',
        confirmPayAllHoldAmount: () => ({
            one: 'Este gasto está retenido. ¿Quieres pagarlo de todos modos?',
            other: 'Estos gastos están retenidos. ¿Quieres pagarlos de todos modos?',
        }),
        payOnly: 'Solo pagar',
        approveOnly: 'Solo aprobar',
        hold: 'Retener',
        unhold: 'Desbloquear',
        holdEducationalTitle: '¿Deberías retener este gasto?',
        whatIsHoldExplain: 'Retener es como presionar "pausa" en un gasto hasta que estés listo para enviarlo.',
        holdIsLeftBehind: 'Los gastos retenidos se quedan fuera incluso si envías un informe completo.',
        unholdWhenReady: 'Desbloquea los gastos cuando estés listo para enviarlos.',
        changePolicyEducational: {
            title: '¡Has movido este informe!',
            description: 'Revisa cuidadosamente estos elementos, que tienden a cambiar al trasladar informes a un nuevo espacio de trabajo.',
            reCategorize: '<strong>Vuelve a categorizar los gastos</strong> para cumplir con las reglas del espacio de trabajo.',
            workflows: 'Este informe ahora puede estar sujeto a un <strong>flujo de aprobación</strong> diferente.',
        },
        changeWorkspace: 'Cambiar espacio de trabajo',
        set: 'estableció',
        changed: 'cambió',
        removed: 'eliminó',
        transactionPending: 'Transacción pendiente.',
        chooseARate: 'Selecciona una tasa de reembolso por milla o kilómetro para el espacio de trabajo',
        unapprove: 'Desaprobar',
        unapproveReport: 'Anular la aprobación del informe',
        headsUp: 'Atención!',
        unapproveWithIntegrationWarning: ({accountingIntegration}) =>
            `Este informe ya se ha exportado a ${accountingIntegration}. Modificarlo puede provocar discrepancias en los datos. ¿Estás seguro de que deseas cancelar la aprobación de este informe?`,
        reimbursable: 'reembolsable',
        nonReimbursable: 'no reembolsable',
        bookingPending: 'Esta reserva está pendiente',
        bookingPendingDescription: 'Esta reserva está pendiente porque aún no se ha pagado.',
        bookingArchived: 'Esta reserva está archivada',
        bookingArchivedDescription: 'Esta reserva está archivada porque la fecha del viaje ha pasado. Agregue un gasto por el monto final si es necesario.',
        attendees: 'Asistentes',
        whoIsYourAccountant: '¿Quién es tu contador?',
        paymentComplete: 'Pago completo',
        time: 'Tiempo',
        startDate: 'Fecha de inicio',
        endDate: 'Fecha de finalización',
        startTime: 'Hora de inicio',
        endTime: 'Hora de finalización',
        deleteSubrate: 'Eliminar subtasa',
        deleteSubrateConfirmation: '¿Estás seguro de que deseas eliminar esta subtasa?',
        quantity: 'Cantidad',
        subrateSelection: 'Selecciona una subtasa e introduce una cantidad.',
        qty: 'Cant',
        firstDayText: () => ({
            one: `Primer día: 1 hora`,
            other: (count: number) => `Primer día: ${count} horas`,
        }),
        lastDayText: () => ({
            one: `Último día: 1 hora`,
            other: (count: number) => `Último día: ${count} horas`,
        }),
        tripLengthText: () => ({
            one: `Viaje: 1 día completo`,
            other: (count: number) => `Viaje: ${count} días completos`,
        }),
        dates: 'Fechas',
        rates: 'Tasas',
        submitsTo: ({name}) => `Se envía a ${name}`,
        reject: {
            educationalTitle: '¿Debes retener o rechazar?',
            educationalText: 'Si no estás listo para aprobar o pagar un gasto, puedes retenerlo o rechazarlo.',
            holdExpenseTitle: 'Retén un gasto para pedir más detalles antes de aprobarlo o pagarlo.',
            approveExpenseTitle: 'Aprueba otros gastos mientras los gastos retenidos permanecen asignados a ti.',
            heldExpenseLeftBehindTitle: 'Los gastos retenidos se dejan atrás cuando apruebas un informe completo.',
            rejectExpenseTitle: 'Rechaza un gasto que no tengos intención de aprobar o pagar.',
            reasonPageTitle: 'Rechazar gasto',
            reasonPageDescription: 'Explica por qué estás rechazando este gasto.',
            rejectReason: 'Motivo del rechazo',
            markAsResolved: 'Marcar como resuelto',
            rejectedStatus: 'Este gasto fue rechazado. Estamos esperando que soluciones los problemas y lo marques como resuelto para poder enviarlo.',
            reportActions: {
                rejectedExpense: 'rechazó este gasto',
                markedAsResolved: 'marcó el motivo del rechazo como resuelto',
            },
        },

        moveExpenses: () => ({one: 'Mover gasto', other: 'Mover gastos'}),
        moveExpensesError: 'No puedes mover gastos per diem a informes de otros espacios de trabajo, porque las tarifas de dietas pueden diferir entre espacios de trabajo.',
        changeApprover: {
            title: 'Cambiar aprobador',
            header: ({workflowSettingLink}) =>
                `Elige una opción para cambiar el aprobador de este informe. (Actualiza la <a href="${workflowSettingLink}">configuración del espacio de trabajo</a> para cambiarlo de forma permanente en todos los informes.)`,
            changedApproverMessage: (managerID) => `cambió el aprobador a <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Añadir aprobador',
                addApproverSubtitle: 'Añade un aprobador adicional al flujo de trabajo existente.',
                bypassApprovers: 'Omitir aprobadores',
                bypassApproversSubtitle: 'Asígnate como aprobador final y omite a los aprobadores restantes.',
            },
            addApprover: {
                subtitle: 'Elige un aprobador adicional para este informe antes de que lo enviemos por el resto del flujo de aprobación.',
            },
        },
        chooseWorkspace: 'Elige un espacio de trabajo',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `informe enviado a ${to} debido a un flujo de aprobación personalizado`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'hora' : 'horas'} a ${rate} / hora`,
            hrs: 'h',
            hours: 'Horas',
            ratePreview: (rate: string) => `${rate} / hora`,
            amountTooLargeError: 'El importe total es demasiado alto. Reduce las horas o disminuye la tasa.',
        },
        correctDistanceRateError: 'Corrige el error de la tasa de distancia y vuelve a intentarlo.',
        AskToExplain: `. <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}"><strong>Explicar</strong></a> &#x2728;`,
        policyRulesModifiedFields: (policyRulesModifiedFields: PolicyRulesModifiedFields, policyRulesRoute: string, formatList: (list: string[]) => string) => {
            const entries = ObjectUtils.typedEntries(policyRulesModifiedFields);

            const fragments = entries.map(([key, value], i) => {
                const isFirst = i === 0;

                if (key === 'reimbursable') {
                    return value ? 'marcó el gasto como "reembolsable"' : 'marcó el gasto como "no reembolsable"';
                }

                if (key === 'billable') {
                    return value ? 'marcó el gasto como "facturable"' : 'marcó el gasto como "no facturable"';
                }

                if (key === 'tax') {
                    const taxEntry = value as PolicyRulesModifiedFields['tax'];
                    const taxRateName = taxEntry?.field_id_TAX.name ?? '';
                    if (isFirst) {
                        return `estableció la tasa de impuesto a "${taxRateName}"`;
                    }
                    return `tasa de impuesto a "${taxRateName}"`;
                }

                const updatedValue = value as string | boolean;
                if (isFirst) {
                    return `estableció el ${translations.common[key].toLowerCase()} a "${updatedValue}"`;
                }

                return `${translations.common[key].toLowerCase()} a "${updatedValue}"`;
            });

            return `${formatList(fragments)} a través de <a href="${policyRulesRoute}">reglas del espacio de trabajo</a>`;
        },
    },
    transactionMerge: {
        listPage: {
            header: 'Fusionar gastos',
            noEligibleExpenseFound: 'No se encontraron gastos válidos',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>No tienes ningún gasto que pueda fusionarse con éste. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Obtén más información</a> sobre gastos válidos.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}) => `Selecciona un <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">gasto válido</a> con el que fusionar <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: 'Selecciona el comprobante',
            pageTitle: 'Selecciona el comprobante que deseas conservar:',
        },
        detailsPage: {
            header: 'Selecciona los detalles',
            pageTitle: 'Selecciona los detalles que deseas conservar:',
            noDifferences: 'No se encontraron diferencias entre las transacciones',
            pleaseSelectError: ({field}) => `Por favor, selecciona un(a) ${field}`,
            pleaseSelectAttendees: 'Por favor, selecciona asistentes',
            selectAllDetailsError: 'Selecciona todos los detalles antes de continuar.',
        },
        confirmationPage: {
            header: 'Confirma los detalles',
            pageTitle: 'Confirma los detalles que conservarás. Los detalles que no conserves serán eliminados.',
            confirmButton: 'Fusionar gastos',
        },
    },
    share: {
        shareToExpensify: 'Compartir para Expensify',
        messageInputLabel: 'Mensaje',
    },
    notificationPreferencesPage: {
        header: 'Preferencias de avisos',
        label: 'Avisar sobre nuevos mensajes',
        notificationPreferences: {
            always: 'Inmediatamente',
            daily: 'Cada día',
            mute: 'Nunca',
            hidden: 'Oculto',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'El número no está validado todavía. Haz click en el botón para reenviar el enlace de confirmación via SMS.',
        emailHasNotBeenValidated: 'El correo electrónico no está validado todavía. Haz click en el botón para reenviar el enlace de confirmación via correo electrónico.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Subir foto',
        removePhoto: 'Eliminar foto',
        editImage: 'Editar foto',
        viewPhoto: 'Ver foto',
        imageUploadFailed: 'Error al cargar la imagen',
        deleteWorkspaceError: 'Lo sentimos, hubo un problema eliminando el avatar de tu espacio de trabajo',
        sizeExceeded: ({maxUploadSizeInMB}) => `La imagen supera el tamaño máximo de ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}) =>
            `Por favor, elige una imagen más grande que ${minHeightInPx}x${minWidthInPx} píxeles y más pequeña que ${maxHeightInPx}x${maxWidthInPx} píxeles.`,
        notAllowedExtension: ({allowedExtensions}) => `La foto de perfil debe ser de uno de los siguientes tipos: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: 'Editar foto de perfil',
        upload: 'Subir',
        uploadPhoto: 'Subir foto',
        selectAvatar: 'Seleccionar avatar',
        choosePresetAvatar: 'O elige un avatar personalizado',
    },
    modal: {
        backdropLabel: 'Fondo del Modal',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que <strong>tú</strong> añadas gastos.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Esperando a que <strong>${actor}</strong> añada gastos.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando a que un administrador añada gastos.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que <strong>tú</strong> envíes los gastos.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Esperando a que <strong>${actor}</strong> envíe los gastos.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando a que un administrador envíe los gastos.`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_) => `¡No se requiere ninguna acción adicional!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que <strong>tú</strong> añadas una cuenta bancaria.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Esperando a que <strong>${actor}</strong> añada una cuenta bancaria.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando a que un administrador añada una cuenta bancaria.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: ({actor, actorType, eta, etaType}) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? ` el ${eta}` : ` ${eta}`;
                }

                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que tus gastos se envíen automáticamente${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Esperando a que los gastos de <strong>${actor}</strong> se envíen automáticamente${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando a que los gastos de un administrador se envíen automáticamente${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que <strong>tú</strong> soluciones ellos problemas.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Esperando a que <strong>${actor}</strong> solucione ellos problemas.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando a que un administrador solucione ellos problemas.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que <strong>tú</strong> apruebes los gastos.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Esperando a que <strong>${actor}</strong> apruebe los gastos.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando a que un administrador apruebe los gastos.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que <strong>tú</strong> exportes este informe.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Esperando a que <strong>${actor}</strong> exporte este informe.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando a que un administrador exporte este informe.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que <strong>tú</strong> pagues los gastos.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Esperando a que <strong>${actor}</strong> pague los gastos.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando a que un administrador pague los gastos.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Esperando a que <strong>tú</strong> termines de configurar una cuenta bancaria de empresa.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Esperando a que <strong>${actor}</strong> termine de configurar una cuenta bancaria de empresa.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Esperando a que un administrador termine de configurar una cuenta bancaria de empresa.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? ` para el ${eta}` : ` ${eta}`;
                }

                return `Esperando a que se complete el pago${formattedETA}.`;
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_) =>
                `¡Ups! Parece que estás enviando el informe a <strong>ti mismo</strong>. Aprobar tus propios informes está <strong>prohibido</strong> por tu espacio de trabajo. Por favor, envía este informe a otra persona o contacta a tu administrador para cambiar la persona a la que lo envías.`,
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'en breve',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'más tarde hoy',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'el domingo',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: 'el 1 y el 16 de cada mes',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: 'el último día hábil del mes',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: 'el último día del mes',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: 'al final de tu viaje',
        },
    },

    profilePage: {
        profile: 'Perfil',
        preferredPronouns: 'Pronombres preferidos',
        selectYourPronouns: 'Selecciona tus pronombres',
        selfSelectYourPronoun: 'Auto-selecciona tu pronombre',
        emailAddress: 'Dirección de correo electrónico',
        setMyTimezoneAutomatically: 'Configura mi zona horaria automáticamente',
        timezone: 'Zona horaria',
        invalidFileMessage: 'Archivo inválido. Pruebe con una imagen diferente.',
        avatarUploadFailureMessage: 'No se pudo subir el avatar. Por favor, inténtalo de nuevo.',
        online: 'En línea',
        offline: 'Desconectado',
        syncing: 'Sincronizando',
        profileAvatar: 'Perfil avatar',
        publicSection: {
            title: 'Público',
            subtitle: 'Estos detalles se muestran en tu perfil público, a disposición de los demás.',
        },
        privateSection: {
            title: 'Privado',
            subtitle: 'Estos detalles se utilizan para viajes y pagos. Nunca se mostrarán en tu perfil público.',
        },
    },
    securityPage: {
        title: 'Opciones de seguridad',
        subtitle: 'Activa la autenticación de dos factores para mantener tu cuenta segura.',
        goToSecurity: 'Volver a la página de seguridad',
    },
    shareCodePage: {
        title: 'Tu código',
        subtitle: 'Invita a miembros a Expensify compartiendo tu código QR personal o enlace de invitación.',
    },
    pronounsPage: {
        pronouns: 'Pronombres',
        isShownOnProfile: 'Tus pronombres se muestran en tu perfil.',
        placeholderText: 'Buscar para ver opciones',
    },
    contacts: {
        contactMethods: 'Métodos de contacto',
        featureRequiresValidate: 'Esta función requiere que valides tu cuenta.',
        validateAccount: 'Valida tu cuenta',
        helpText: ({email}: {email: string}) =>
            `Agrega más formas de iniciar sesión y enviar recibos a Expensify.<br/><br/>Agrega una dirección de correo electrónico para reenviar recibos a <a href="mailto:${email}">${email}</a> o agrega un número de teléfono para enviar recibos por mensaje de texto al 47777 (solo números de EE. UU.).`,
        pleaseVerify: 'Por favor, verifica este método de contacto.',
        getInTouch: 'Usaremos este método para comunicarnos contigo.',
        enterMagicCode: (contactMethod) => `Por favor, introduce el código mágico enviado a ${contactMethod}. Debería llegar en un par de minutos.`,
        setAsDefault: 'Establecer como predeterminado',
        yourDefaultContactMethod:
            'Este es tu método de contacto predeterminado. Antes de poder eliminarlo, tendrás que elegir otro método de contacto y haz clic en "Establecer como predeterminado".',
        removeContactMethod: 'Eliminar método de contacto',
        removeAreYouSure: '¿Estás seguro de que quieres eliminar este método de contacto? Esta acción no se puede deshacer.',
        failedNewContact: 'Se ha producido un error al añadir este método de contacto.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'No se ha podido enviar un nuevo código mágico. Espera un rato y vuelve a intentarlo.',
            validateSecondaryLogin: 'Código mágico incorrecto o no válido. Inténtalo de nuevo o solicita otro código.',
            deleteContactMethod: 'No se ha podido eliminar este método de contacto. Por favor, contacta con Concierge para obtener ayuda.',
            setDefaultContactMethod: 'No se pudo establecer un nuevo método de contacto predeterminado. Por favor contacta con Concierge para obtener ayuda.',
            addContactMethod: 'Se ha producido un error al añadir este método de contacto. Por favor, contacta con Concierge para obtener ayuda.',
            enteredMethodIsAlreadySubmitted: 'El método de contacto ingresado ya existe',
            passwordRequired: 'Se requiere contraseña',
            contactMethodRequired: 'Se requiere método de contacto',
            invalidContactMethod: 'Método de contacto no válido',
        },
        newContactMethod: 'Nuevo método de contacto',
        goBackContactMethods: 'Volver a métodos de contacto',
    },
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Él',
        heHimHisTheyThemTheirs: 'Él / Ellos',
        sheHerHers: 'Ella',
        sheHerHersTheyThemTheirs: 'Ella / Ellos',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: 'Ellos',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Llámame por mi nombre',
    },
    displayNamePage: {
        headerTitle: 'Nombre',
        isShownOnProfile: 'Este nombre es visible en tu perfil.',
    },
    timezonePage: {
        timezone: 'Zona horaria',
        isShownOnProfile: 'Tu zona horaria se muestra en tu perfil.',
        getLocationAutomatically: 'Detecta tu ubicación automáticamente',
    },
    updateRequiredView: {
        updateRequired: 'Actualización requerida',
        pleaseInstall: 'Por favor, actualiza a la última versión de New Expensify',
        pleaseInstallExpensifyClassic: 'Por favor, instala la última versión de Expensify',
        toGetLatestChanges: 'Para móvil, descarga e instala la última versión. Para la web, actualiza tu navegador.',
        newAppNotAvailable: 'La App New Expensify ya no está disponible.',
    },
    initialSettingsPage: {
        about: 'Acerca de',
        aboutPage: {
            description: 'New Expensify está creada por una comunidad de desarrolladores de código abierto de todo el mundo. Ayúdanos a construir el futuro de Expensify.',
            appDownloadLinks: 'Enlaces para descargar la App',
            viewKeyboardShortcuts: 'Ver atajos de teclado',
            viewTheCode: 'Ver código',
            viewOpenJobs: 'Ver trabajos disponibles',
            reportABug: 'Reportar un error',
            troubleshoot: 'Solución de problemas',
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
            viewConsole: 'Ver la consola de depuración',
            debugConsole: 'Consola de depuración',
            description:
                '<muted-text>Utilice las herramientas que aparecen a continuación para solucionar los problemas de Expensify. Si tiene algún problema, por favor <concierge-link>envíe un informe de error</concierge-link>.</muted-text>',
            confirmResetDescription: 'Todos los borradores no enviados se perderán, pero el resto de tus datos estarán a salvo.',
            resetAndRefresh: 'Restablecer y actualizar',
            clientSideLogging: 'Registro a nivel cliente',
            noLogsToShare: 'No hay logs que compartir',
            useProfiling: 'Usar el trazado',
            profileTrace: 'Traza de ejecución',
            results: 'Resultados',
            releaseOptions: 'Opciones de publicación',
            testingPreferences: 'Preferencias para Tests',
            useStagingServer: 'Usar servidor "staging"',
            forceOffline: 'Forzar desconexión',
            simulatePoorConnection: 'Simular una conexión a internet deficiente',
            simulateFailingNetworkRequests: 'Simular fallos en solicitudes de red',
            authenticationStatus: 'Estado de autenticación',
            deviceCredentials: 'Credenciales del dispositivo',
            invalidate: 'Invalidar',
            destroy: 'Destruir',
            maskExportOnyxStateData: 'Enmascare los datos frágiles del miembro mientras exporta el estado Onyx',
            exportOnyxState: 'Exportar estado Onyx',
            importOnyxState: 'Importar estado Onyx',
            testCrash: 'Prueba de fallo',
            resetToOriginalState: 'Restablecer al estado original',
            usingImportedState: 'Estás utilizando el estado importado. Pulsa aquí para borrarlo.',
            debugMode: 'Modo depuración',
            invalidFile: 'Archivo inválido',
            invalidFileDescription: 'El archivo que ests intentando importar no es válido. Por favor, inténtalo de nuevo.',
            invalidateWithDelay: 'Invalidar con retraso',
            leftHandNavCache: 'Caché del menú de navegación izquierdo',
            clearleftHandNavCache: 'borrar',
            recordTroubleshootData: 'Registrar datos de resolución de problemas',
            softKillTheApp: 'Desactivar la aplicación',
            kill: 'Matar',
            sentryDebug: 'Depuración de Sentry',
            sentryDebugDescription: 'Registrar las solicitudes de Sentry en la consola',
            sentryHighlightedSpanOps: 'Nombres de spans resaltados',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interaction.click, navigation, ui.load',
        },
        debugConsole: {
            saveLog: 'Guardar registro',
            shareLog: 'Compartir registro',
            enterCommand: 'Introducir comando',
            execute: 'Ejecutar',
            noLogsAvailable: 'No hay registros disponibles',
            logSizeTooLarge: ({size}) => `El tamaño del registro excede el límite de ${size} MB. Utilice "Guardar registro" para descargar el archivo de registro.`,
            logs: 'Logs',
            viewConsole: 'Ver consola',
        },
        security: 'Seguridad',
        restoreStashed: 'Restablecer login guardado',
        signOut: 'Desconectar',
        signOutConfirmationText: 'Si cierras sesión perderás los cambios hechos mientras estabas desconectado',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>Leer los <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Términos de Servicio</a> y <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacidad</a>.</muted-text-micro>`,
        help: 'Ayuda',
        whatIsNew: 'Qué hay de nuevo',
        accountSettings: 'Configuración de la cuenta',
        account: 'Cuenta',
        general: 'General',
    },
    closeAccountPage: {
        closeAccount: 'Cerrar cuenta',
        reasonForLeavingPrompt: '¡Lamentamos verte partir! ¿Serías tan amable de decirnos por qué, para que podamos mejorar?',
        enterMessageHere: 'Escribe aquí tu mensaje',
        closeAccountWarning: 'Una vez cerrada tu cuenta no se puede revertir.',
        closeAccountPermanentlyDeleteData: '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción eliminará permanentemente toda la información de cualquier gasto pendiente.',
        enterDefaultContactToConfirm: 'Por favor, escribe tu método de contacto predeterminado para confirmar que deseas eliminar tu cuenta. Tu método de contacto predeterminado es:',
        enterDefaultContact: 'Tu método de contacto predeterminado',
        defaultContact: 'Método de contacto predeterminado:',
        enterYourDefaultContactMethod: 'Por favor, introduce tu método de contacto predeterminado para cerrar tu cuenta.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Fusionar cuentas',
        accountDetails: {
            accountToMergeInto: ({login}) => `Introduce la cuenta en la que deseas fusionar <strong>${login}</strong>.`,
            notReversibleConsent: 'Entiendo que esto no es reversible',
        },
        accountValidate: {
            confirmMerge: '¿Estás seguro de que deseas fusionar cuentas?',
            lossOfUnsubmittedData: ({login}) => `Fusionar tus cuentas es irreversible y resultará en la pérdida de cualquier gasto no enviado de <strong>${login}</strong>.`,
            enterMagicCode: ({login}) => `Para continuar, por favor introduce el código mágico enviado a <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: 'Código mágico incorrecto o no válido. Inténtalo de nuevo o solicita otro código.',
                fallback: 'Ha ocurrido un error. Por favor, inténtalo mas tarde.',
            },
        },
        mergeSuccess: {
            accountsMerged: '¡Cuentas fusionadas!',
            description: ({from, to}) =>
                `<muted-text><centered-text>Has fusionado exitosamente todos los datos de <strong>${from}</strong> en <strong>${to}</strong>. De ahora en adelante, puedes usar cualquiera de los inicios de sesión para esta cuenta.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Estamos trabajando en ello',
            limitedSupport: 'Todavía no es posible fusionar cuentas en New Expensify. Por favor, realiza esta acción en Expensify Classic en su lugar',
            reachOutForHelp: '<muted-text><centered-text>¡No dudes en <concierge-link>comunicarte con Concierge</concierge-link> si tienes alguna pregunta!</centered-text></muted-text>',
            goToExpensifyClassic: 'Dirígete a Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}) =>
            `<muted-text><centered-text>No puedes fusionar <strong>${email}</strong> porque está controlado por <strong>${email.split('@').at(1) ?? ''}</strong>. Póngase <concierge-link>en contacto con Concierge</concierge-link> si necesita ayuda.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}) =>
            `<muted-text><centered-text>No puedes fusionar <strong>${email}</strong> en otras cuentas porque tu administrador de dominio la ha establecido como tu inicio de sesión principal. Por favor, fusiona otras cuentas en esta en su lugar.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}) =>
                `<muted-text><centered-text>'No puedes fusionar cuentas porque <strong>${email}</strong> tiene habilitada la autenticación de dos factores (2FA). Por favor, deshabilita 2FA para <strong>${email}</strong> e inténtalo nuevamente.</centered-text></muted-text>`,
            learnMore: 'Aprende más sobre cómo fusionar cuentas.',
        },
        mergeFailureAccountLockedDescription: ({email}) =>
            `<muted-text><centered-text>No puedes fusionar <strong>${email}</strong> porque está bloqueado. Póngase <concierge-link>en contacto con Concierge</concierge-link> si necesita ayuda.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}) =>
            `<muted-text><centered-text>No puedes fusionar cuentas porque <strong>${email}</strong> no tiene una cuenta de Expensify. Por favor, <a href="${contactMethodLink}">añádela como método de contacto</a> en su lugar.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}) =>
            `<muted-text><centered-text>No puedes fusionar <strong>${email}</strong> en otras cuentas. Por favor, fusiona otras cuentas en esta en su lugar.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}) =>
            `<muted-text><centered-text>No puedes fusionar cuentas en <strong>${email}</strong> porque esta cuenta tiene una relación de facturación con factura emitida.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Inténtalo de nuevo más tarde',
            description: 'Hubo demasiados intentos de fusionar cuentas. Por favor, inténtalo de nuevo más tarde.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'No puedes fusionarte con otras cuentas porque no está validada. Por favor, valida la cuenta e inténtalo de nuevo.',
        },
        mergeFailureSelfMerge: {
            description: 'No puedes combinar una cuenta consigo misma.',
        },
        mergeFailureGenericHeading: 'No se pueden fusionar cuentas',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Informar de actividad sospechosa',
        lockAccount: 'Bloquear cuenta',
        unlockAccount: 'Desbloquear cuenta',
        compromisedDescription:
            '¿Notas algo extraño en tu cuenta? Informarlo bloqueará tu cuenta de inmediato, detendrá nuevas transacciones con la Tarjeta Expensify y evitará cualquier cambio en la cuenta.',
        domainAdminsDescription: 'Para administradores de dominio: Esto también detiene toda la actividad de la Tarjeta Expensify y las acciones administrativas en tus dominios.',
        areYouSure: '¿Estás seguro de que deseas bloquear tu cuenta de Expensify?',
        onceLocked: 'Una vez bloqueada, tu cuenta estará restringida hasta que se solicite el desbloqueo y se realice una revisión de seguridad.',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'No se pudo bloquear la cuenta',
        failedToLockAccountDescription: 'No pudimos bloquear tu cuenta. Por favor, chatea con Concierge para resolver este problema.',
        chatWithConcierge: 'Chatear con Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Cuenta bloqueada',
        yourAccountIsLocked: 'Tu cuenta está bloqueada',
        chatToConciergeToUnlock: 'Chatea con Concierge para resolver los problemas de seguridad y desbloquear tu cuenta.',
        chatWithConcierge: 'Chatear con Concierge',
    },
    twoFactorAuth: {
        headerTitle: 'Autenticación de dos factores',
        twoFactorAuthEnabled: 'Autenticación de dos factores habilitada',
        whatIsTwoFactorAuth:
            'La autenticación de dos factores (2FA) ayuda a mantener tu cuenta segura. Al iniciar sesión, deberás ingresar un código generado por tu aplicación de autenticación preferida.',
        disableTwoFactorAuth: 'Deshabilitar la autenticación de dos factores',
        explainProcessToRemove: 'Para deshabilitar la autenticación de dos factores (2FA), por favor introduce un código válido de tu aplicación de autenticación.',
        explainProcessToRemoveWithRecovery: 'Para deshabilitar la autenticación en dos pasos (2FA), por favor introduce un código de recuperación válido.',
        disabled: 'La autenticación de dos factores está ahora deshabilitada',
        noAuthenticatorApp: 'Ya no necesitarás una aplicación de autenticación para iniciar sesión en Expensify.',
        stepCodes: 'Códigos de recuperación',
        keepCodesSafe: '¡Guarda los códigos de recuperación en un lugar seguro!',
        codesLoseAccess:
            'Si pierdes el acceso a tu aplicación de autenticación y no tienes estos códigos, perderás el acceso a tu cuenta. \n\nNota: Configurar la autenticación de dos factores cerrará la sesión de todas las demás sesiones activas.',
        errorStepCodes: 'Copia o descarga los códigos antes de continuar',
        stepVerify: 'Verificar',
        scanCode: 'Escanea el código QR usando tu',
        authenticatorApp: 'aplicación de autenticación',
        addKey: 'O añade esta clave secreta a tu aplicación de autenticación:',
        enterCode: 'Luego introduce el código de seis dígitos generado por tu aplicación de autenticación.',
        stepSuccess: 'Finalizado',
        enabled: 'La autenticación de dos factores habilitada',
        congrats: '¡Felicidades! Ahora tienes esa seguridad adicional.',
        copy: 'Copiar',
        disable: 'Deshabilitar',
        enableTwoFactorAuth: 'Activar la autenticación de dos factores',
        pleaseEnableTwoFactorAuth: 'Activa la autenticación de dos factores.',
        twoFactorAuthIsRequiredDescription: 'Por razones de seguridad, Xero requiere la autenticación de dos factores para conectar la integración.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Autenticación de dos factores requerida',
        twoFactorAuthIsRequiredForAdminsTitle: 'Por favor, habilita la autenticación de dos factores',
        twoFactorAuthIsRequiredXero: 'Tu conexión de contabilidad con Xero requiere el uso de autenticación de dos factores. Por favor, habilítala para seguir usando Expensify.',
        twoFactorAuthIsRequiredCompany: 'Tu empresa requiere el uso de autenticación de dos factores. Por favor, habilítala para seguir usando Expensify.',
        twoFactorAuthCannotDisable: 'No se puede desactivar la autenticación de dos factores (2FA)',
        twoFactorAuthRequired: 'La autenticación de dos factores (2FA) es obligatoria para tu conexión a Xero y no se puede desactivar.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Por favor, introduce tu código de recuperación',
            incorrectRecoveryCode: 'Código de recuperación incorrecto. Por favor, inténtalo de nuevo.',
        },
        useRecoveryCode: 'Usar código de recuperación',
        recoveryCode: 'Código de recuperación',
        use2fa: 'Usar autenticación de dos factores',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Por favor, introduce tu código de autenticación de dos factores',
            incorrect2fa: 'Código de autenticación de dos factores incorrecto. Por favor, inténtalo de nuevo.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: '¡Contraseña actualizada!',
        allSet: 'Todo está listo. Guarda tu contraseña en un lugar seguro.',
    },
    privateNotes: {
        title: 'Notas privadas',
        personalNoteMessage: 'Guarda notas sobre este chat aquí. Usted es la única persona que puede añadir, editar o ver estas notas.',
        sharedNoteMessage: 'Guarda notas sobre este chat aquí. Los empleados de Expensify y otros miembros del dominio team.expensify.com pueden ver estas notas.',
        composerLabel: 'Notas',
        myNote: 'Mi nota',
        error: {
            genericFailureMessage: 'Las notas privadas no han podido ser guardadas',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Por favor, introduce un código de seguridad válido',
        },
        securityCode: 'Código de seguridad',
        changePaymentCurrency: 'Cambiar moneda de facturación',
        changeBillingCurrency: 'Cambiar la moneda de pago',
        paymentCurrency: 'Moneda de pago',
        paymentCurrencyDescription: 'Selecciona una moneda estándar a la que se deben convertir todos los gastos personales',
        note: `Nota: Cambiar tu moneda de pago puede afectar cuánto pagarás por Expensify. Consulta nuestra <a href="${CONST.PRICING}">página de precios</a> para conocer todos los detalles.`,
    },
    addDebitCardPage: {
        addADebitCard: 'Añadir una tarjeta de débito',
        nameOnCard: 'Nombre en la tarjeta',
        debitCardNumber: 'Número de la tarjeta de débito',
        expiration: 'Fecha de vencimiento',
        expirationDate: 'MMAA',
        cvv: 'CVV',
        billingAddress: 'Dirección de envio',
        growlMessageOnSave: 'Tu tarteja de débito se añadió correctamente',
        expensifyPassword: 'Contraseña de Expensify',
        error: {
            invalidName: 'El nombre sólo puede incluir letras',
            addressZipCode: 'Por favor, introduce un código postal válido',
            debitCardNumber: 'Por favor, introduce un número de tarjeta de débito válido',
            expirationDate: 'Por favor, selecciona una fecha de vencimiento válida',
            securityCode: 'Por favor, introduce un código de seguridad válido',
            addressStreet: 'Por favor, introduce una dirección de facturación válida que no sea un apartado postal',
            addressState: 'Por favor, selecciona un estado',
            addressCity: 'Por favor, introduce una ciudad',
            genericFailureMessage: 'Se ha producido un error al añadir tu tarjeta. Por favor, vuelva a intentarlo.',
            password: 'Por favor, introduce tu contraseña de Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Añade tarjeta de pago',
        nameOnCard: 'Nombre en la tarjeta',
        paymentCardNumber: 'Número de la tarjeta',
        expiration: 'Fecha de vencimiento',
        expirationDate: 'MM/AA',
        cvv: 'CVV',
        billingAddress: 'Dirección de envio',
        growlMessageOnSave: 'Tu tarjeta de pago se añadió correctamente',
        expensifyPassword: 'Contraseña de Expensify',
        error: {
            invalidName: 'El nombre sólo puede incluir letras',
            addressZipCode: 'Por favor, introduce un código postal válido',
            paymentCardNumber: 'Por favor, introduce un número de tarjeta de pago válido',
            expirationDate: 'Por favor, selecciona una fecha de vencimiento válida',
            securityCode: 'Por favor, introduce un código de seguridad válido',
            addressStreet: 'Por favor, introduce una dirección de facturación válida que no sea un apartado postal',
            addressState: 'Por favor, selecciona un estado',
            addressCity: 'Por favor, introduce una ciudad',
            genericFailureMessage: 'Se ha producido un error al añadir tu tarjeta. Por favor, vuelva a intentarlo.',
            password: 'Por favor, introduce tu contraseña de Expensify',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Métodos de pago',
        setDefaultConfirmation: 'Marcar como método de pago predeterminado',
        setDefaultSuccess: 'Método de pago configurado',
        deleteAccount: 'Eliminar cuenta',
        deleteConfirmation: '¿Estás seguro de que quieres eliminar esta cuenta?',
        deleteCard: 'Eliminar tarjeta',
        deleteCardConfirmation:
            'Todas las transacciones no enviadas, incluidas las de informes abiertos, serán eliminadas. ¿Estás seguro de que quieres eliminar esta tarjeta? Esta acción no se puede deshacer.',
        error: {
            notOwnerOfBankAccount: 'Se ha producido un error al establecer esta cuenta bancaria como método de pago predeterminado',
            invalidBankAccount: 'Esta cuenta bancaria está temporalmente suspendida',
            notOwnerOfFund: 'Se ha producido un error al establecer esta tarjeta de crédito como método de pago predeterminado',
            setDefaultFailure: 'No se ha podido configurar el método de pago',
        },
        addBankAccountFailure: 'Ocurrió un error inesperado al intentar añadir la cuenta bancaria. Inténtalo de nuevo.',
        getPaidFaster: 'Cobra más rápido',
        addPaymentMethod: 'Añade un método de pago para enviar y recibir pagos directamente en la aplicación.',
        getPaidBackFaster: 'Recibe tus pagos más rápido',
        secureAccessToYourMoney: 'Acceso seguro a tu dinero',
        receiveMoney: 'Recibe dinero en tu moneda local',
        expensifyWallet: 'Billetera Expensify (Beta)',
        sendAndReceiveMoney: 'Envía y recibe dinero desde tu Billetera Expensify. Solo cuentas bancarias de EE. UU.',
        enableWallet: 'Habilitar billetera',
        addBankAccountToSendAndReceive: 'Añade una cuenta bancaria para hacer o recibir pagos.',
        addDebitOrCreditCard: 'Añadir tarjeta de débito o crédito',
        assignedCards: 'Tarjetas asignadas',
        assignedCardsDescription: 'Las transacciones de estas tarjetas se sincronizan automáticamente.',
        expensifyCard: 'Tarjeta Expensify',
        walletActivationPending: 'Estamos revisando tu información. Por favor, vuelve en unos minutos.',
        walletActivationFailed: 'Lamentablemente, no podemos activar tu billetera en este momento. Chatea con Concierge para obtener más ayuda.',
        addYourBankAccount: 'Añadir tu cuenta bancaria',
        addBankAccountBody: 'Conectemos tu cuenta bancaria a Expensify para que sea más fácil que nunca enviar y recibir pagos directamente en la aplicación.',
        chooseYourBankAccount: 'Elige tu cuenta bancaria',
        chooseAccountBody: 'Asegúrese de elegir el adecuado.',
        confirmYourBankAccount: 'Confirma tu cuenta bancaria',
        personalBankAccounts: 'Cuentas bancarias personales',
        businessBankAccounts: 'Cuentas bancarias empresariales',
        shareBankAccount: 'Compartir cuenta bancaria',
        bankAccountShared: 'Cuenta bancaria compartida',
        shareBankAccountTitle: 'Seleccionar los administradores con quienes compartir esta cuenta bancaria:',
        shareBankAccountSuccess: '¡Cuenta bancaria compartida!',
        shareBankAccountSuccessDescription: 'Los administradores seleccionados recibirán un mensaje de confirmación de Concierge.',
        shareBankAccountFailure: 'Se produjo un error inesperado al intentar compartir la cuenta bancaria. Inténtelo de nuevo.',
        shareBankAccountEmptyTitle: 'No hay administradores disponibles',
        shareBankAccountEmptyDescription: 'No hay administradores del espacio de trabajo con los que puedas compartir esta cuenta bancaria',
        shareBankAccountNoAdminsSelected: 'Seleccione un administrador antes de continuar',
        unshareBankAccount: 'Dejar de compartir la cuenta bancaria',
        unshareBankAccountDescription:
            'Todas las personas a continuación tienen acceso a esta cuenta bancaria. Puede retirar el acceso en cualquier momento. Seguiremos completando los pagos en proceso.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} perderá el acceso a esta cuenta bancaria comercial. Seguiremos completando los pagos en proceso.`,
        reachOutForHelp: 'Se está usando con la tarjeta Expensify. <concierge-link>Contacte con Concierge</concierge-link> si necesita dejar de compartirla.',
        unshareErrorModalTitle: 'No se puede dejar de compartir la cuenta bancaria',
    },
    cardPage: {
        expensifyCard: 'Tarjeta Expensify',
        expensifyTravelCard: 'Tarjeta Expensify de Viaje',
        availableSpend: 'Límite restante',
        smartLimit: {
            name: 'Límite inteligente',
            title: ({formattedLimit}) => `Puedes gastar hasta ${formattedLimit} en esta tarjeta al mes. El límite se restablecerá el primer día del mes.`,
        },
        fixedLimit: {
            name: 'Límite fijo',
            title: ({formattedLimit}) => `Puedes gastar hasta ${formattedLimit} en esta tarjeta, luego se desactivará.`,
        },
        monthlyLimit: {
            name: 'Límite mensual',
            title: ({formattedLimit}) => `Puedes gastar hasta ${formattedLimit} en esta tarjeta y el límite se restablecerá a medida que se aprueben tus gastos.`,
        },
        virtualCardNumber: 'Número de la tarjeta virtual',
        travelCardCvv: 'CVV de la tarjeta de viaje',
        physicalCardNumber: 'Número de la tarjeta física',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Obtener tarjeta física',
        reportFraud: 'Reportar fraude con la tarjeta virtual',
        reportTravelFraud: 'Reportar fraude con la tarjeta de viaje',
        reviewTransaction: 'Revisar transacción',
        suspiciousBannerTitle: 'Transacción sospechosa',
        suspiciousBannerDescription: 'Hemos detectado una transacción sospechosa en la tarjeta. Haz click abajo para revisarla.',
        cardLocked: 'La tarjeta está temporalmente bloqueada mientras nuestro equipo revisa la cuenta de tu empresa.',
        markTransactionsAsReimbursable: 'Marcar transacciones como reembolsables',
        markTransactionsDescription: 'Cuando está habilitado, las transacciones importadas de esta tarjeta se marcan como reembolsables por defecto.',
        csvCardDescription: 'Importación CSV',
        cardDetails: {
            cardNumber: 'Número de tarjeta virtual',
            expiration: 'Expiración',
            cvv: 'CVV',
            address: 'Dirección',
            revealDetails: 'Revelar detalles',
            revealCvv: 'Revelar CVV',
            copyCardNumber: 'Copiar número de la tarjeta',
            updateAddress: 'Actualizar dirección',
        },
        cardAddedToWallet: ({platform}) => `Añadida a ${platform} Wallet`,
        cardDetailsLoadingFailure: 'Se ha producido un error al cargar los datos de la tarjeta. Comprueba tu conexión a Internet e inténtalo de nuevo.',
        validateCardTitle: 'Asegurémonos de que eres tú',
        enterMagicCode: (contactMethod) => `Introduzca el código mágico enviado a ${contactMethod} para ver los datos de su tarjeta. Debería llegar en un par de minutos.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `Por favor, <a href="${missingDetailsLink}">agrega tus datos personales</a> y vuelve a intentarlo.`,
        unexpectedError: 'Se produjo un error al intentar obtener los detalles de tu tarjeta Expensify. Vuelve a intentarlo.',
        cardFraudAlert: {
            confirmButtonText: 'Sí, lo hago',
            reportFraudButtonText: 'No, no fui yo',
            clearedMessage: ({cardLastFour}) => `se eliminó la actividad sospechosa anterior y se reactivó la tarjeta x${cardLastFour}. ¡Todo listo para seguir gastando!`,
            deactivatedMessage: ({cardLastFour}) => `la tarjeta terminada en ${cardLastFour} ha sido desactivada`,
            alertMessage: ({cardLastFour, amount, merchant, date}) => `se identificó actividad sospechosa en la tarjeta terminada en ${cardLastFour}. ¿Reconoces este cargo?

${amount} para ${merchant} - ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: 'Gasto',
        workflowDescription: 'Configure un flujo de trabajo desde el momento en que se produce el gasto, incluida la aprobación y el pago',
        submissionFrequency: 'Frecuencia de envíos',
        submissionFrequencyDescription: 'Elige un horario personalizado para enviar los gastos.',
        disableApprovalPromptDescription: 'Deshabilitar las aprobaciones borrará todos los flujos de trabajo de aprobación existentes.',
        submissionFrequencyDateOfMonth: 'Fecha del mes',
        addApprovalsTitle: 'Aprobaciones',
        addApprovalButton: 'Añadir flujo de aprobación',
        addApprovalTip: 'Este flujo de trabajo por defecto se aplica a todos los miembros, a menos que exista un flujo de trabajo más específico.',
        approver: 'Aprobador',
        addApprovalsDescription: 'Requiere una aprobación adicional antes de autorizar un pago.',
        makeOrTrackPaymentsTitle: 'Realizar o seguir pagos',
        makeOrTrackPaymentsDescription: 'Añade un pagador autorizado para los pagos realizados en Expensify o realiza un seguimiento de los pagos realizados en otro lugar.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>Este espacio de trabajo tiene habilitado un flujo de aprobación personalizado. Para revisar o cambiar este flujo de trabajo, comunícate con tu <account-manager-link>Administrador de cuenta</account-manager-link> o <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Este espacio de trabajo tiene habilitado un flujo de aprobación personalizado. Para revisar o cambiar este flujo de trabajo, comunícate con <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Elige cuánto tiempo Expensify debe esperar antes de compartir los gastos sin errores.',
        },
        frequencyDescription: 'Elige la frecuencia de presentación automática de gastos, o preséntalos manualmente',
        frequencies: {
            instant: 'Al instante',
            weekly: 'Semanal',
            monthly: 'Mensual',
            twiceAMonth: 'Dos veces al mes',
            byTrip: 'Por viaje',
            manually: 'Manualmente',
            daily: 'Diaria',
            lastDayOfMonth: 'Último día del mes',
            lastBusinessDayOfMonth: 'Último día hábil del mes',
            ordinals: {
                one: 'º',
                two: 'º',
                few: 'º',
                other: 'º',
                /* eslint-disable @typescript-eslint/naming-convention */
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
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Este miembro ya pertenece a otro flujo de aprobación. Cualquier actualización aquí se reflejará allí también.',
        approverCircularReference: (name1, name2) =>
            `<strong>${name1}</strong> ya aprueba informes a <strong>${name2}</strong>. Por favor, elige un aprobador diferente para evitar un flujo de trabajo circular.`,
        emptyContent: {
            title: 'No hay miembros para mostrar',
            expensesFromSubtitle: 'Todos los miembros del espacio de trabajo ya pertenecen a un flujo de aprobación existente.',
            approverSubtitle: 'Todos los aprobadores pertenecen a un flujo de trabajo existente.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'La frecuencia de envío no pudo ser cambiada. Por favor, inténtelo de nuevo o contacte al soporte.',
        monthlyOffsetErrorMessage: 'La frecuencia mensual no pudo ser cambiada. Por favor, inténtelo de nuevo o contacte al soporte.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Confirmar',
        header: 'Agrega más aprobadores y confirma.',
        additionalApprover: 'Añadir aprobador',
        submitButton: 'Añadir flujo de trabajo',
    },
    workflowsEditApprovalsPage: {
        title: 'Edicion flujo de aprobación',
        deleteTitle: 'Eliminar flujo de trabajo de aprobación',
        deletePrompt: '¿Estás seguro de que quieres eliminar este flujo de trabajo de aprobación? Todos los miembros pasarán a usar el flujo de trabajo predeterminado.',
    },
    workflowsExpensesFromPage: {
        title: 'Gastos de',
        header: 'Cuando los siguientes miembros presenten gastos:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'El aprobador no pudo ser cambiado. Por favor, inténtelo de nuevo o contacte al soporte.',
        title: 'Establecer aprobador',
        description: 'Esta persona aprobará los gastos.',
    },
    workflowsApprovalLimitPage: {
        title: 'Aprobador',
        header: '(Opcional) ¿Quieres añadir un límite de aprobación?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `Añadir otro aprobador cuando <strong>${approverName}</strong> es aprobador y el informe supera el importe indicado:`
                : 'Añadir otro aprobador cuando el informe supera el importe indicado:',
        reportAmountLabel: 'Importe del informe',
        additionalApproverLabel: 'Aprobador adicional',
        skip: 'Omitir',
        next: 'Siguiente',
        removeLimit: 'Eliminar límite',
        enterAmountError: 'Por favor, introduce un importe válido',
        enterApproverError: 'Se requiere un aprobador cuando estableces un límite de informe',
        enterBothError: 'Introduce un importe del informe y un aprobador adicional',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `Los informes superiores a ${approvalLimit} se envían a ${approverName}`,
    },
    workflowsPayerPage: {
        title: 'Pagador autorizado',
        genericErrorMessage: 'El pagador autorizado no se pudo cambiar. Por favor, inténtalo mas tarde.',
        admins: 'Administradores',
        payer: 'Pagador',
        paymentAccount: 'Cuenta de pago',
    },
    reportFraudPage: {
        title: 'Reportar fraude con la tarjeta virtual',
        description:
            'Si los datos de tu tarjeta virtual han sido robados o se han visto comprometidos, desactivaremos permanentemente la tarjeta actual y le proporcionaremos una tarjeta virtual y un número nuevo.',
        deactivateCard: 'Desactivar tarjeta',
        reportVirtualCardFraud: 'Reportar fraude con la tarjeta virtual',
    },
    reportFraudConfirmationPage: {
        title: 'Fraude con tarjeta reportado',
        description: 'Hemos desactivado permanentemente tu tarjeta existente. Cuando vuelvas a ver los detalles de tu tarjeta, tendrás una nueva tarjeta virtual disponible.',
        buttonText: 'Entendido, ¡gracias!',
    },
    activateCardPage: {
        activateCard: 'Activar tarjeta',
        pleaseEnterLastFour: 'Introduce los cuatro últimos dígitos de la tarjeta.',
        activatePhysicalCard: 'Activar tarjeta física',
        error: {
            thatDidNotMatch: 'Los 4 últimos dígitos de tu tarjeta no coinciden. Por favor, inténtalo de nuevo.',
            throttled:
                'Has introducido incorrectamente los 4 últimos dígitos de tu tarjeta Expensify demasiadas veces. Si estás seguro de que los números son correctos, ponte en contacto con Concierge para solucionarlo. De lo contrario, inténtalo de nuevo más tarde.',
        },
    },
    getPhysicalCard: {
        header: 'Obtener tarjeta física',
        nameMessage: 'Introduce tu nombre y apellido como aparecerá en tu tarjeta.',
        legalName: 'Nombre completo',
        legalFirstName: 'Nombre legal',
        legalLastName: 'Apellidos legales',
        phoneMessage: 'Introduce tu número de teléfono.',
        phoneNumber: 'Número de teléfono',
        address: 'Dirección',
        addressMessage: 'Introduce tu dirección de envío.',
        streetAddress: 'Calle de dirección',
        city: 'Ciudad',
        state: 'Estado',
        zipPostcode: 'Código postal',
        country: 'País',
        confirmMessage: 'Por favor confirma tus datos.',
        estimatedDeliveryMessage: 'Tu tarjeta física llegará en 2-3 días laborales.',
        next: 'Siguiente',
        getPhysicalCard: 'Obtener tarjeta física',
        shipCard: 'Enviar tarjeta',
    },
    transferAmountPage: {
        transfer: ({amount}) => `Transferir${amount ? ` ${amount}` : ''}`,
        instant: 'Instante',
        instantSummary: (rate, minAmount) => `Tarifa del ${rate}% (${minAmount} mínimo)`,
        ach: '1-3 días laborales',
        achSummary: 'Sin cargo',
        whichAccount: '¿Qué cuenta?',
        fee: 'Tarifa',
        transferSuccess: '¡Transferencia exitosa!',
        transferDetailBankAccount: 'Tu dinero debería llegar en 1-3 días laborables.',
        transferDetailDebitCard: 'Tu dinero debería llegar de inmediato.',
        failedTransfer: 'Tu saldo no se ha acreditado completamente. Por favor, transfiere los fondos a una cuenta bancaria.',
        notHereSubTitle: 'Por favor, transfiere el saldo desde la página de billetera',
        goToWallet: 'Ir a billetera',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Elegir cuenta',
    },
    paymentMethodList: {
        addPaymentMethod: 'Añadir método de pago',
        addNewDebitCard: 'Añadir nueva tarjeta de débito',
        addNewBankAccount: 'Añadir nueva cuenta de banco',
        accountLastFour: 'Terminada en',
        cardLastFour: 'Tarjeta terminada en',
        addFirstPaymentMethod: 'Añade un método de pago para enviar y recibir pagos directamente desde la aplicación.',
        defaultPaymentMethod: 'Predeterminado',
        bankAccountLastFour: (lastFour) => `Cuenta bancaria • ${lastFour}`,
    },
    expenseRulesPage: {
        title: 'Reglas de gastos',
        subtitle: 'Estas reglas se aplicarán a tus gastos. Si los envías a un espacio de trabajo, las reglas del espacio de trabajo pueden anularlas.',
        findRule: 'Encontrar regla',
        emptyRules: {
            title: 'Aún no has creado ninguna regla',
            subtitle: 'Añade una regla para automatizar los informes de gastos.',
        },
        changes: {
            billableUpdate: (value: boolean) => `Actualiza el gasto a ${value ? 'facturable' : 'no facturable'}`,
            categoryUpdate: (value: string) => `Actualiza la categoría a "${value}"`,
            commentUpdate: (value: string) => `Cambia la descripción a "${value}"`,
            merchantUpdate: (value: string) => `Actualiza el comercio a "${value}"`,
            reimbursableUpdate: (value: boolean) => `Actualiza el gasto a ${value ? 'reembolsable' : 'no reembolsable'}`,
            tagUpdate: (value: string) => `Actualiza la etiqueta a "${value}"`,
            taxUpdate: (value: string) => `Actualiza la tasa de impuesto a ${value}`,
            billable: (value: boolean) => `el gasto a ${value ? 'facturable' : 'no facturable'}`,
            category: (value: string) => `la categoría a "${value}"`,
            comment: (value: string) => `la descripción a "${value}"`,
            merchant: (value: string) => `el comercio a "${value}"`,
            reimbursable: (value: boolean) => `el gasto a ${value ? 'reembolsable' : 'no reembolsable'}`,
            tag: (value: string) => `la etiqueta a "${value}"`,
            tax: (value: string) => `la tasa de impuesto a ${value}`,
            report: (value: string) => `añadir a un informe llamado "${value}"`,
        },
        newRule: 'Nueva regla',
        addRule: {
            title: 'Añadir regla',
            expenseContains: 'Si el gasto contiene:',
            applyUpdates: 'Entonces aplica estas actualizaciones:',
            merchantHint: 'Escribe * para crear una regla que se aplique a todos los comercios',
            addToReport: 'Añadir a un informe llamado',
            createReport: 'Crear informe si es necesario',
            applyToExistingExpenses: 'Aplicar a gastos existentes que coincidan',
            confirmError: 'Introduce el comercio y aplica al menos una actualización',
            confirmErrorMerchant: 'Por favor, introduce el comercio',
            confirmErrorUpdate: 'Por favor, aplica al menos una actualización',
            saveRule: 'Guardar regla',
        },
        editRule: {
            title: 'Editar regla',
        },
        deleteRule: {
            deleteSingle: 'Eliminar regla',
            deleteMultiple: 'Eliminar reglas',
            deleteSinglePrompt: '¿Estás seguro de que quieres eliminar esta regla?',
            deleteMultiplePrompt: '¿Estás seguro de que quieres eliminar estas reglas?',
        },
    },
    preferencesPage: {
        appSection: {
            title: 'Preferencias de la aplicación',
        },
        testSection: {
            title: 'Preferencias para tests',
            subtitle: 'Ajustes para ayudar a depurar y probar la aplicación en “staging”.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Recibir noticias sobre Expensify y actualizaciones del producto',
        muteAllSounds: 'Silenciar todos los sonidos de Expensify',
    },
    priorityModePage: {
        priorityMode: 'Modo prioridad',
        explainerText:
            'Elige #concentración si deseas enfocarte sólo en los chats no leídos y en los anclados, o mostrarlo todo con los chats más recientes y los anclados en la parte superior.',
        priorityModes: {
            default: {
                label: 'Más recientes',
                description: 'Mostrar todos los chats ordenados desde el más reciente',
            },
            gsd: {
                label: '#concentración',
                description: 'Mostrar sólo los no leídos ordenados alfabéticamente',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}) => `en ${policyName}`,
        generatingPDF: 'Generar PDF',
        waitForPDF: 'Por favor, espera mientras creamos el PDF.',
        errorPDF: 'Ocurrió un error al crear el PDF',
        successPDF: '¡Tu PDF ha sido generado! Si no se descargó automáticamente, usa el botón de abajo.',
    },
    reportDescriptionPage: {
        roomDescription: 'Descripción de la sala de chat',
        roomDescriptionOptional: 'Descripción de la sala de chat (opcional)',
        explainerText: 'Establece una descripción personalizada para la sala de chat.',
    },
    groupChat: {
        lastMemberTitle: '¡Atención!',
        lastMemberWarning: 'Ya que eres la última persona aquí, si te vas, este chat quedará inaccesible para todos los miembros. ¿Estás seguro de que quieres salir del chat?',
        defaultReportName: ({displayName}) => `Chat de grupo de ${displayName}`,
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
                label: 'Utiliza los ajustes del dispositivo',
            },
        },
        chooseThemeBelowOrSync: 'Elige un tema a continuación o sincronízalo con los ajustes de tu dispositivo.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>Al iniciar sesión, estás accediendo a los <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Términos de Servicio</a> y <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacidad</a>.</muted-text-xs>`,
        license: `<muted-text-xs>El envío de dinero es brindado por ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) de conformidad con sus <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licencias</a>.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: '¿No recibiste un código mágico?',
        enterAuthenticatorCode: 'Por favor, introduce el código de autenticador',
        enterRecoveryCode: 'Por favor, introduce tu código de recuperación',
        requiredWhen2FAEnabled: 'Obligatorio cuando A2F está habilitado',
        requestNewCode: ({timeRemaining}) => `Pedir un código nuevo en <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Solicitar un nuevo código',
        error: {
            pleaseFillMagicCode: 'Por favor, introduce el código mágico.',
            incorrectMagicCode: 'Código mágico incorrecto o no válido. Inténtalo de nuevo o solicita otro código.',
            pleaseFillTwoFactorAuth: 'Por favor, introduce tu código de autenticación de dos factores.',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Por favor, completa todos los campos',
        pleaseFillPassword: 'Por favor, introduce tu contraseña',
        pleaseFillTwoFactorAuth: 'Por favor, introduce tu código 2 factores',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Introduce el código de autenticación de dos factores para continuar',
        forgot: '¿Has olvidado la contraseña?',
        requiredWhen2FAEnabled: 'Obligatorio cuando A2F está habilitado',
        error: {
            incorrectPassword: 'Contraseña incorrecta. Por favor, inténtalo de nuevo.',
            incorrectLoginOrPassword: 'Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.',
            incorrect2fa: 'Código de autenticación de dos factores incorrecto. Por favor, inténtalo de nuevo.',
            twoFactorAuthenticationEnabled: 'Tienes autenticación de 2 factores activada en esta cuenta. Por favor, conéctate usando tu correo electrónico o número de teléfono.',
            invalidLoginOrPassword: 'Usuario o clave incorrectos. Por favor, inténtalo de nuevo o restablece la contraseña.',
            unableToResetPassword:
                'No se pudo cambiar tu clave. Probablemente porque el enlace para restablecer la contrasenña ha expirado. Te hemos enviado un nuevo enlace. Comprueba tu bandeja de entrada y carpeta de Spam.',
            noAccess: 'No tienes acceso a esta aplicación. Por favor, añade tu usuario de GitHub para acceder.',
            accountLocked: 'Tu cuenta ha sido bloqueada tras varios intentos fallidos. Por favor, inténtalo de nuevo dentro de una hora.',
            fallback: 'Ha ocurrido un error. Por favor, inténtalo mas tarde.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Número de teléfono o correo electrónico',
        error: {
            invalidFormatEmailLogin: 'El correo electrónico introducido no es válido. Corrígelo e inténtalo de nuevo.',
        },
        cannotGetAccountDetails: 'No se pudieron cargar los detalles de tu cuenta. Por favor, intenta iniciar sesión de nuevo.',
        loginForm: 'Formulario de inicio de sesión',
        notYou: ({user}) => `¿No eres ${user}?`,
    },
    onboarding: {
        welcome: '¡Bienvenido!',
        welcomeSignOffTitle: '¡Es un placer conocerte!',
        welcomeSignOffTitleManageTeam: 'Una vez que termines las tareas anteriores, podemos explorar más funcionalidades como flujos de aprobación y reglas.',
        explanationModal: {
            title: 'Bienvenido a Expensify',
            description: 'Una aplicación para gestionar en un chat todos los gastos de tu empresa y personales. Inténtalo y dinos qué te parece. ¡Hay mucho más por venir!',
            secondaryDescription: 'Para volver a Expensify Classic, simplemente haz click en tu foto de perfil > Ir a Expensify Classic.',
        },
        getStarted: 'Comenzar',
        whatsYourName: '¿Cómo te llamas?',
        peopleYouMayKnow: 'Las personas que tal vez conozcas ya están aquí. Verifica tu correo electrónico para unirte a ellos.',
        workspaceMemberList: ({employeeCount, policyOwner}) => `${employeeCount} miembro${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        workspaceYouMayJoin: ({domain, email}) => `Alguien de ${domain} ya ha creado un espacio de trabajo. Por favor, introduce el código mágico enviado a ${email}.`,
        joinAWorkspace: 'Unirse a un espacio de trabajo',
        listOfWorkspaces: 'Aquí está la lista de espacios de trabajo a los que puedes unirte. No te preocupes, siempre puedes unirte a ellos más tarde si lo prefieres.',
        whereYouWork: '¿Dónde trabajas?',
        errorSelection: 'Selecciona una opción para continuar',
        purpose: {
            title: '¿Qué quieres hacer hoy?',
            errorContinue: 'Por favor, haz click en continuar para configurar tu cuenta',
            errorBackButton: 'Por favor, finaliza las preguntas de configuración para empezar a utilizar la aplicación',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Cobrar de mi empresa',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Gestionar los gastos de mi equipo',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Controlar y presupuestar gastos',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Chatea y divide gastos con tus amigos',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Algo más',
        },
        employees: {
            title: '¿Cuántos empleados tienes?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 empleados',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 empleados',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 empleados',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1,000 empleados',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Más de 1,000 empleados',
        },
        accounting: {
            title: '¿Utilizas algún software de contabilidad?',
            none: 'Ninguno',
        },
        interestedFeatures: {
            title: '¿Qué funciones te interesan?',
            featuresAlreadyEnabled: 'Aquí están nuestras funciones más populares:',
            featureYouMayBeInterestedIn: 'Habilita funciones adicionales:',
        },
        error: {
            requiredFirstName: 'Introduce tu nombre para continuar',
        },
        workEmail: {
            title: 'Cuál es tu correo electrónico de trabajo',
            subtitle: 'Expensify funciona mejor cuando conectas tu correo electrónico de trabajo.',
            explanationModal: {
                descriptionOne: 'Reenvía a receipts@expensify.com para escanear',
                descriptionTwo: 'Únete a tus compañeros de trabajo que ya están usando Expensify',
                descriptionThree: 'Disfruta de una experiencia más personalizada',
            },
            addWorkEmail: 'Añadir correo electrónico de trabajo',
        },
        workEmailValidation: {
            title: 'Verifica tu correo electrónico de trabajo',
            magicCodeSent: ({workEmail}) => `Por favor, introduce el código mágico enviado a ${workEmail}. Debería llegar en uno o dos minutos.`,
        },
        workEmailValidationError: {
            publicEmail: 'Por favor, introduce un correo electrónico laboral válido de un dominio privado, por ejemplo: mitch@company.com',
            offline: 'No pudimos añadir tu correo electrónico laboral porque parece que estás sin conexión.',
        },
        mergeBlockScreen: {
            title: 'No se pudo añadir el correo electrónico de trabajo',
            subtitle: ({workEmail}) => `No pudimos añadir ${workEmail}. Por favor, inténtalo de nuevo más tarde en Configuración o chatea con Concierge para obtener ayuda.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Haz una [prueba](${testDriveURL})`,
                description: ({testDriveURL}) => `[Haz un recorrido rápido por el producto](${testDriveURL}) para ver por qué Expensify es la forma más rápida de gestionar tus gastos.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Haz una [prueba](${testDriveURL})`,
                description: ({testDriveURL}) => `Haz una [prueba](${testDriveURL}) y consigue *3 meses gratis de Expensify para tu equipo!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Añadir aprobaciones de gastos',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Añade aprobaciones de gastos* para revisar los gastos de tu equipo y mantenerlos bajo control.

                        Así es como puedes añadir aprobaciones de gastos:

                        1. Ve a *Espacios de trabajo*.
                        2. Selecciona tu espacio de trabajo.
                        3. Haz clic en *Más funciones*.
                        4. Activa *Flujos de trabajo*.
                        5. Navega a *Flujos de trabajo* en el editor del espacio de trabajo.
                        6. Activa *Añadir aprobaciones*.
                        7. Serás asignado como aprobador de gastos. Podrás cambiarlo a cualquier administrador una vez que lo invites a tu equipo.

                        [Llévame a más funciones](${workspaceMoreFeaturesLink}).
                    `),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Crea](${workspaceConfirmationLink}) un espacio de trabajo`,
                description: 'Crea un espacio de trabajo y configura los ajustes con la ayuda de tu especialista asignado.',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Crea un [espacio de trabajo](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Crea un espacio de trabajo* para organizar gastos, escanear recibos, chatear y más.

                        1. Haz clic en *Espacios de trabajo* > *Nuevo espacio de trabajo*.

                        *¡Tu nuevo espacio de trabajo está listo!* [Échale un vistazo](${workspaceSettingsLink}).
                    `),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Configura [categorías](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Configura categorías* para que tu equipo pueda clasificar los gastos y facilitar los informes.

                        1. Haz clic en *Espacios de trabajo*.
                        2. Selecciona tu espacio de trabajo.
                        3. Haz clic en *Categorías*.
                        4. Desactiva cualquier categoría que no necesites.
                        5. Añade tus propias categorías en la esquina superior derecha.

                        [Ir a la configuración de categorías del espacio de trabajo](${workspaceCategoriesLink}).

                        ![Configura categorías](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)
                    `),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Envía un gasto',
                description: dedent(`
                    *Envía un gasto* introduciendo una cantidad o escaneando un recibo.

                    1. Haz clic en el botón ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Elige *Crear gasto*.
                    3. Introduce una cantidad o escanea un recibo.
                    4. Añade el correo o teléfono de tu jefe.
                    5. Haz clic en *Crear*.

                    ¡Y listo!
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Envía un gasto',
                description: dedent(`
                    *Envía un gasto* introduciendo una cantidad o escaneando un recibo.

                    1. Haz clic en el botón ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Elige *Crear gasto*.
                    3. Introduce una cantidad o escanea un recibo.
                    4. Confirma los detalles.
                    5. Haz clic en *Crear*.

                    ¡Y listo!
                `),
            },
            trackExpenseTask: {
                title: 'Organiza un gasto',
                description: dedent(`
                    *Organiza un gasto* en cualquier moneda, tengas recibo o no.

                    1. Haz clic en el botón ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Elige *Crear gasto*.
                    3. Introduce una cantidad o escanea un recibo.
                    4. Elige tu espacio *personal*.
                    5. Haz clic en *Crear*.

                    ¡Y listo! Sí, así de fácil.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Conéctate${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : ' a'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'tu' : ''} ${integrationName}](${workspaceAccountingLink})`,

                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Conéctate ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'tu' : 'a'} ${integrationName} para la clasificación y sincronización automática de gastos, lo que facilita el cierre de fin de mes.

                        1. Haz clic en *Espacios de trabajo*.
                        2. Selecciona tu espacio de trabajo.
                        3. Haz clic en *Contabilidad*.
                        4. Busca ${integrationName}.
                        5. Haz clic en *Conectar*.

                        ${
                            integrationName && CONST.connectionsVideoPaths[integrationName]
                                ? `[Ir a contabilidad](${workspaceAccountingLink}).

                        ![Conéctate a ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
                                : `[Ir a contabilidad](${workspaceAccountingLink}).`
                        }`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Conecta [tu tarjeta corporativa](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Conecta tu tarjeta corporativa para importar y clasificar gastos automáticamente.

                        1. Haz clic en *Espacios de trabajo*.
                        2. Selecciona tu espacio de trabajo.
                        3. Haz clic en *Tarjetas corporativas*.
                        4. Sigue las instrucciones para conectar tu tarjeta.

                        [Ir a conectar mis tarjetas corporativas](${corporateCardLink}).
                    `),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Invita a [tu equipo](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Invita a tu equipo* a Expensify para que empiecen a organizar gastos hoy mismo.

                        1. Haz clic en *Espacios de trabajo*.
                        2. Selecciona tu espacio de trabajo.
                        3. Haz clic en *Miembros* > *Invitar miembro*.
                        4. Introduce correos o teléfonos.
                        5. Añade un mensaje personalizado si lo deseas.

                        [Ir a miembros del espacio de trabajo](${workspaceMembersLink}).

                        ![Invita a tu equipo](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)
                    `),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Configura [categorías](${workspaceCategoriesLink}) y [etiquetas](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Configura categorías y etiquetas* para que tu equipo pueda clasificar los gastos fácilmente.

                        Impórtalas automáticamente al [conectarte con tu software contable](${workspaceAccountingLink}), o configúralas manualmente en tu [configuración del espacio de trabajo](${workspaceCategoriesLink}).
                    `),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Configura [etiquetas](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Usa etiquetas para añadir detalles como proyectos, clientes, ubicaciones y departamentos. Si necesitas múltiples niveles, puedes mejorar al plan Controlar.

                        1. Haz clic en *Espacios de trabajo*.
                        2. Selecciona tu espacio de trabajo.
                        3. Haz clic en *Más funciones*.
                        4. Habilita *Etiquetas*.
                        5. Navega a *Etiquetas* en el editor del espacio.
                        6. Haz clic en *+ Añadir etiqueta* para crear la tuya.

                        [Ir a más funciones](${workspaceMoreFeaturesLink}).

                        ![Configura etiquetas](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)
                    `),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Invita a tu [contador](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Invita a tu contador* para que colabore en tu espacio de trabajo y gestione los gastos de tu negocio.

                        1. Haz clic en *Espacios de trabajo*.
                        2. Selecciona tu espacio de trabajo.
                        3. Haz clic en *Miembros*.
                        4. Haz clic en *Invitar miembro*.
                        5. Introduce la dirección de correo electrónico de tu contador.

                        [Invita a tu contador ahora](${workspaceMembersLink}).
                    `),
            },
            startChatTask: {
                title: 'Inicia un chat',
                description: dedent(`
                    *Inicia un chat* con cualquier persona usando su correo o número.

                    1. Haz clic en el botón ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Elige *Iniciar chat*.
                    3. Introduce un correo o teléfono.

                    Si aún no usan Expensify, se les invitará automáticamente.

                    Cada chat también se convierte en un correo o mensaje de texto al que pueden responder directamente.
                `),
            },
            splitExpenseTask: {
                title: 'Divide un gasto',
                description: dedent(`
                    *Divide gastos* con una o más personas.

                    1. Haz clic en el botón ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Elige *Iniciar chat*.
                    3. Introduce correos o teléfonos.
                    4. Haz clic en el botón gris *+* en el chat > *Dividir gasto*.
                    5. Crea el gasto seleccionando *Manual*, *Escanear* o *Distancia*.

                    Puedes añadir más detalles si quieres, o simplemente enviarlo. ¡Vamos a que te reembolsen!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Revisa tu [configuración del espacio de trabajo](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        Aquí te mostramos cómo revisar y actualizar la configuración de tu espacio de trabajo:
                        1. Haz clic en Espacios de trabajo.
                        2. Selecciona tu espacio de trabajo.
                        3. Revisa y actualiza tu configuración.
                        [Ir a tu espacio de trabajo.](${workspaceSettingsLink})
                    `),
            },
            createReportTask: {
                title: 'Crea tu primer informe',
                description: dedent(`
                    Así es como puedes crear un informe:

                    1. Haz clic en el botón ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Elige *Crear informe*.
                    3. Haz clic en *Añadir gasto*.
                    4. Añade tu primer gasto.

                    ¡Y listo!
                `),
            },
        },
        testDrive: {
            name: ({testDriveURL}) => (testDriveURL ? `Haz una [prueba](${testDriveURL})` : 'Haz una prueba'),
            embeddedDemoIframeTitle: 'Prueba',
            employeeFakeReceipt: {
                description: '¡Mi recibo de prueba!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Que te reembolsen es tan fácil como enviar un mensaje. Repasemos lo básico.',
            onboardingPersonalSpendMessage: 'Aquí tienes cómo organizar tus gastos en unos pocos clics.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # ¡Tu prueba gratuita ha comenzado! Vamos a configurarte.
                        👋 Hola, soy tu **especialista asignado** de configuración de Expensify. Ya he creado un espacio de trabajo para ayudarte a gestionar los recibos y gastos de tu equipo. Para aprovechar al máximo tu prueba gratuita de 30 días, ¡solo sigue los pasos de configuración restantes que aparecen a continuación!
                    `)
                    : dedent(`
                        # ¡Tu prueba gratuita ha comenzado! Vamos a configurarte.
                        👋 Hola, soy tu **especialista asignado** de configuración de Expensify. Ahora que ya has creado un espacio de trabajo, aprovecha al máximo tu prueba gratuita de 30 días siguiendo los pasos que aparecen a continuación.
                    `),
            onboardingTrackWorkspaceMessage:
                '# Vamos a configurarte\n👋 Hola, soy tu **especialista asignado** de configuración de Expensify. Ya he creado un espacio de trabajo para ayudarte a gestionar tus recibos y gastos. Para aprovechar al máximo tu prueba gratuita de 30 días, ¡solo sigue los pasos de configuración restantes que aparecen a continuación!',
            onboardingChatSplitMessage: 'Dividir cuentas con amigos es tan fácil como enviar un mensaje. Así se hace.',
            onboardingAdminMessage: 'Aprende a gestionar el espacio de tu equipo como administrador y enviar tus propios gastos.',
            onboardingLookingAroundMessage:
                'Expensify es conocido por gastos, viajes y gestión de tarjetas corporativas, pero hacemos mucho más. Dime qué te interesa y te ayudaré a empezar.',
            onboardingTestDriveReceiverMessage: '*¡Tienes 3 meses gratis! Empieza abajo.*',
        },
        workspace: {
            title: 'Mantente organizado con un espacio de trabajo',
            subtitle: 'Desbloquea herramientas potentes para simplificar la gestión de tus gastos, todo en un solo lugar. Con un espacio de trabajo, puedes:',
            explanationModal: {
                descriptionOne: 'Organiza recibos',
                descriptionTwo: 'Clasifica y etiqueta gastos',
                descriptionThree: 'Crea y comparte informes',
            },
            price: 'Pruébalo gratis durante 30 días y luego mejora por solo <strong>$5/usuario/mes</strong>.',
            createWorkspace: 'Crear espacio de trabajo',
        },
        confirmWorkspace: {
            title: 'Confirmar espacio de trabajo',
            subtitle: 'Crea un espacio de trabajo para organizar recibos, reembolsar gastos, gestionar viajes, crear informes y más, todo a la velocidad del chat.',
        },
        inviteMembers: {
            title: 'Invita a miembros',
            subtitle: 'Añade a tu equipo o invita a tu contador. ¡Cuantos más, mejor!',
        },
    },
    featureTraining: {
        doNotShowAgain: 'No muestres esto otra vez',
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: 'El nombre no puede contener caracteres especiales',
            containsReservedWord: 'El nombre no puede contener las palabras Expensify o Concierge',
            hasInvalidCharacter: 'El nombre no puede contener una coma o un punto y coma',
            requiredFirstName: 'El nombre no puede estar vacío',
        },
    },
    privatePersonalDetails: {
        enterLegalName: '¿Cuál es tu nombre legal?',
        enterDateOfBirth: '¿Cuál es tu fecha de nacimiento?',
        enterAddress: '¿Cuál es tu dirección?',
        enterPhoneNumber: '¿Cuál es tu número de teléfono?',
        personalDetails: 'Datos personales',
        privateDataMessage: 'Estos detalles se utilizan para viajes y pagos. Nunca se mostrarán en tu perfil público.',
        legalName: 'Nombre completo',
        legalFirstName: 'Nombre legal',
        legalLastName: 'Apellidos legales',
        address: 'Dirección',
        error: {
            dateShouldBeBefore: (dateString) => `La fecha debe ser anterior a ${dateString}`,
            dateShouldBeAfter: (dateString) => `La fecha debe ser posterior a ${dateString}`,
            incorrectZipFormat: (zipFormat) => `Formato de código postal incorrecto.${zipFormat ? ` Formato aceptable: ${zipFormat}` : ''}`,
            hasInvalidCharacter: 'El nombre sólo puede incluir caracteres latinos',
            invalidPhoneNumber: `Asegúrese de que el número de teléfono sean válidos (p. ej. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'El enlace se ha reenviado',
        weSentYouMagicSignInLink: ({login, loginType}) => `Te he enviado un hiperenlace mágico para iniciar sesión a ${login}. Por favor, revisa tu ${loginType}`,
        resendLink: 'Reenviar enlace',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}) => `Para validar ${secondaryLogin}, reenvía el código mágico desde la Configuración de la cuenta de ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}) => `Si ya no tienes acceso a ${primaryLogin} por favor, desvincula las cuentas.`,
        unlink: 'Desvincular',
        linkSent: '¡Enlace enviado!',
        successfullyUnlinkedLogin: '¡Nombre de usuario secundario desvinculado correctamente!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}) =>
            `Nuestro proveedor de correo electrónico ha suspendido temporalmente los correos electrónicos a ${login} debido a problemas de entrega. Para desbloquear el inicio de sesión, sigue estos pasos:`,
        confirmThat: (login) =>
            `<strong>Confirma que ${login} está escrito correctamente y que es una dirección de correo electrónico real que puede recibir correos.</strong> Los alias de correo electrónico como "expenses@domain.com" deben tener acceso a tu propia bandeja de entrada de correo electrónico para que sea un inicio de sesión válido de Expensify.`,
        ensureYourEmailClient: `<strong>Asegúrese de que tu cliente de correo electrónico permita correos electrónicos de expensify.com.</strong> Puedes encontrar instrucciones sobre cómo completar este paso <a href="${CONST.SET_NOTIFICATION_LINK}">here</a>, pero es posible que necesites que el departamento de informática te ayude a configurar los ajustes de correo electrónico.`,
        onceTheAbove: `Una vez completados los pasos anteriores, ponte en contacto con <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> para desbloquear el inicio de sesión.`,
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}) => `No hemos podido entregar mensajes SMS a ${login}, así que lo hemos suspendido temporalmente. Por favor, intenta validar tu número:`,
        validationSuccess: '¡Tu número ha sido validado! Haz clic abajo para enviar un nuevo código mágico de inicio de sesión.',
        validationFailed: ({timeData}) => {
            if (!timeData) {
                return 'Por favor, espera un momento antes de intentarlo de nuevo.';
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
                timeText = `${timeParts.at(0)} y ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, y ${timeParts.at(2)}`;
            }

            return `¡Un momento! Debes esperar ${timeText} antes de intentar validar tu número nuevamente.`;
        },
    },
    welcomeSignUpForm: {
        join: 'Unirse',
    },
    detailsPage: {
        localTime: 'Hora local',
    },
    newChatPage: {
        startGroup: 'Crear grupo',
        addToGroup: 'Añadir al grupo',
    },
    yearPickerPage: {
        year: 'Año',
        selectYear: 'Por favor, selecciona un año',
    },
    focusModeUpdateModal: {
        title: '¡Bienvenido al modo #concentración!',
        prompt: (priorityModePageUrl) =>
            `Mantente al tanto de todo viendo sólo los chats no leídos o los que necesitan tu atención. No te preocupes, puedes cambiar el ajuste en cualquier momento desde la <a href="${priorityModePageUrl}">configuración</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'El chat que estás buscando no se pudo encontrar.',
        getMeOutOfHere: 'Sácame de aquí',
        iouReportNotFound: 'Los detalles del pago que estás buscando no se pudieron encontrar.',
        notHere: 'Hmm… no está aquí',
        pageNotFound: 'Ups, no deberías estar aquí',
        noAccess: 'Es posible que este chat o gasto haya sido eliminado o que no tengas acceso a él. \n\nPara cualquier consulta, contáctanos a través de concierge@expensify.com',
        goBackHome: 'Volver a la página principal',
        commentYouLookingForCannotBeFound: 'No se puede encontrar el comentario que estás buscando. Vuelve al chat',
        contactConcierge: 'Para cualquier consulta, contáctanos a través de concierge@expensify.com',
        goToChatInstead: 'Ve al chat en su lugar.',
    },
    errorPage: {
        title: ({isBreakLine}) => `Ups... ${isBreakLine ? '\n' : ''}Algo no ha ido bien`,
        subtitle: 'No se ha podido completar la acción. Por favor, inténtalo más tarde.',
        wrongTypeSubtitle: 'Esa búsqueda no es válida. Intenta ajustar tus criterios de búsqueda.',
    },
    statusPage: {
        status: 'Estado',
        statusExplanation: 'Añade un emoji para que tus colegas y amigos puedan saber fácilmente qué está pasando. ¡También puedes añadir un mensaje opcionalmente!',
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
        untilTime: ({time}) => {
            // Check for HH:MM AM/PM format and starts with '01:'
            if (CONST.REGEX.TIME_STARTS_01.test(time)) {
                return `Hasta la ${time}`;
            }
            // Check for any HH:MM AM/PM format not starting with '01:'
            if (CONST.REGEX.TIME_FORMAT.test(time)) {
                return `Hasta las ${time}`;
            }
            // Check for date-time format like "06-29 11:30 AM"
            if (CONST.REGEX.DATE_TIME_FORMAT.test(time)) {
                return `Hasta el día ${time}`;
            }
            // Default case
            return `Hasta ${time}`;
        },
        date: 'Fecha',
        time: 'Hora',
        clearAfter: 'Borrar después',
        whenClearStatus: '¿Cuándo deberíamos borrar tu estado?',
        vacationDelegate: 'Delegado de vacaciones',
        setVacationDelegate: 'Configura un delegado de vacaciones para aprobar informes en tu nombre mientras estás fuera de la oficina.',
        vacationDelegateError: 'Hubo un error al actualizar tu delegado de vacaciones.',
        asVacationDelegate: ({nameOrEmail: managerName}) => `como delegado de vacaciones de ${managerName}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}) => `a ${submittedToName} como delegado de vacaciones de ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}) =>
            `Está asignando a ${nameOrEmail} como su delegado de vacaciones. Aún no está en todos sus espacios de trabajo. Si decide continuar, se enviará un correo electrónico a todos los administradores de sus espacios de trabajo para agregarlo.`,
    },
    stepCounter: ({step, total, text}) => {
        let result = `Paso ${step}`;

        if (total) {
            result = `${result} de ${total}`;
        }

        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Información bancaria',
        confirmBankInfo: 'Confirmar información bancaria',
        manuallyAdd: '¿Cuáles son los detalles de tu cuenta bancaria comercial?',
        letsDoubleCheck: 'Verifiquemos que todo esté correcto.',
        accountEnding: 'Cuenta terminada en',
        thisBankAccount: 'Esta cuenta bancaria se utilizará para pagos comerciales en tu espacio de trabajo',
        accountNumber: 'Número de cuenta',
        routingNumber: 'Número de ruta',
        chooseAnAccountBelow: 'Elige una cuenta a continuación',
        addBankAccount: 'Añadir cuenta bancaria',
        chooseAnAccount: 'Elige una cuenta',
        connectOnlineWithPlaid: 'Inicia sesión en tu banco',
        connectManually: 'Conectar manualmente',
        desktopConnection: 'Para conectarse con Chase, Wells Fargo, Capital One o Bank of America, haz clic aquí para completar este proceso en un navegador.',
        yourDataIsSecure: 'Tus datos están seguros',
        toGetStarted: 'Conecta una cuenta bancaria para reembolsar gastos, emitir Tarjetas Expensify, y cobrar y pagar facturas todo desde un mismo lugar.',
        plaidBodyCopy: 'Ofrezca a sus empleados una forma más sencilla de pagar - y recuperar - los gastos de la empresa.',
        checkHelpLine: 'Tus números de ruta y de cuenta se pueden encontrar en un cheque de la cuenta bancaria.',
        hasPhoneLoginError: (contactMethodRoute) =>
            `Para añadir una cuenta bancaria verificada, <a href="${contactMethodRoute}">asegúrate de que tu nombre de usuario principal sea un correo electrónico válido</a> y vuelve a intentarlo. Puedes añadir tu número de teléfono como nombre de usuario secundario.`,
        hasBeenThrottledError: 'Se ha producido un error al intentar añadir tu cuenta bancaria. Por favor, espera unos minutos e inténtalo de nuevo.',
        hasCurrencyError: ({workspaceRoute}) =>
            `¡Ups! Parece que la moneda de tu espacio de trabajo no está configurada en USD. Para continuar, ve a <a href="${workspaceRoute}">la configuración del área de trabajo</a>, configúrala en USD e inténtalo nuevamente.`,
        bbaAdded: '¡Cuenta bancaria empresarial agregada!',
        bbaAddedDescription: 'Está lista para ser utilizada en pagos.',
        error: {
            youNeedToSelectAnOption: 'Debes seleccionar una opción para continuar',
            noBankAccountAvailable: 'Lo sentimos, no hay ninguna cuenta bancaria disponible',
            noBankAccountSelected: 'Por favor, elige una cuenta bancaria',
            taxID: 'Por favor, introduce un número de identificación fiscal válido',
            website: 'Por favor, introduce un sitio web válido',
            zipCode: `Formato de código postal incorrecto. Formato aceptable: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}.`,
            phoneNumber: 'Por favor, introduce un teléfono válido',
            email: 'Por favor, introduce una dirección de correo electrónico válida',
            companyName: 'Por favor, introduce un nombre comercial legal válido',
            addressCity: 'Por favor, introduce una ciudad válida',
            addressStreet: 'Por favor, introduce una dirección válida que no sea un apartado postal',
            addressState: 'Por favor, selecciona un estado',
            incorporationDateFuture: 'La fecha de incorporación no puede ser futura',
            incorporationState: 'Por favor, selecciona una estado válido',
            industryCode: 'Por favor, introduce un código de clasificación de industria válido',
            restrictedBusiness: 'Por favor, confirma que la empresa no está en la lista de negocios restringidos',
            routingNumber: 'Por favor, introduce un número de ruta válido',
            accountNumber: 'Por favor, introduce un número de cuenta válido',
            routingAndAccountNumberCannotBeSame: 'Los números de ruta y de cuenta no pueden ser iguales',
            companyType: 'Por favor, selecciona un tipo de compañía válido',
            tooManyAttempts:
                'Debido a la gran cantidad de intentos de inicio de sesión, esta opción ha sido desactivada temporalmente durante 24 horas. Por favor, inténtalo de nuevo más tarde.',
            address: 'Por favor, introduce una dirección válida',
            dob: 'Por favor, selecciona una fecha de nacimiento válida',
            age: 'Debe ser mayor de 18 años',
            ssnLast4: 'Por favor, introduce los últimos 4 dígitos del número de seguridad social',
            firstName: 'Por favor, introduce el nombre',
            lastName: 'Por favor, introduce los apellidos',
            noDefaultDepositAccountOrDebitCardAvailable: 'Por favor, añade una cuenta bancaria para depósitos o una tarjeta de débito',
            validationAmounts: 'Los importes de validación que introduciste son incorrectos. Por favor, comprueba tu cuenta bancaria e inténtalo de nuevo.',
            fullName: 'Por favor, introduce un nombre completo válido',
            ownershipPercentage: 'Por favor, ingrese un número de porcentaje válido',
            deletePaymentBankAccount:
                'Esta cuenta bancaria no se puede eliminar porque se utiliza para pagos con la tarjeta Expensify. Si aún deseas eliminar esta cuenta, por favor contacta con Concierge.',
            sameDepositAndWithdrawalAccount: 'Las cuentas de depósito y retiro son las mismas.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: '¿Dónde está ubicada tu cuenta bancaria?',
        accountDetailsStepHeader: '¿Cuáles son los detalles de tu cuenta?',
        accountTypeStepHeader: '¿Qué tipo de cuenta es esta?',
        bankInformationStepHeader: '¿Cuáles son los detalles de tu banco?',
        accountHolderInformationStepHeader: '¿Cuáles son los detalles del titular de la cuenta?',
        howDoWeProtectYourData: '¿Cómo protegemos tus datos?',
        currencyHeader: '¿Cuál es la moneda de tu cuenta bancaria?',
        confirmationStepHeader: 'Verifica tu información.',
        confirmationStepSubHeader: 'Verifica dos veces los detalles a continuación y marca la casilla de términos para confirmar.',
        toGetStarted: 'Agrega una cuenta bancaria personal para recibir reembolsos, pagar facturas o habilitar la Cartera de Expensify.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Escribe tu contraseña de Expensify',
        alreadyAdded: 'Esta cuenta ya ha sido añadida.',
        chooseAccountLabel: 'Cuenta',
        successTitle: '¡Cuenta bancaria personal añadida!',
        successMessage: 'Enhorabuena, tu cuenta bancaria está lista para recibir reembolsos.',
    },
    attachmentView: {
        unknownFilename: 'Archivo desconocido',
        passwordRequired: 'Por favor, introduce tu contraseña',
        passwordIncorrect: 'Contraseña incorrecta. Por favor, inténtalo de nuevo.',
        failedToLoadPDF: 'Se ha producido un error al intentar cargar el PDF',
        pdfPasswordForm: {
            title: 'PDF protegido con contraseña',
            infoText: 'Este PDF esta protegido con contraseña.',
            beforeLinkText: 'Por favor',
            linkText: 'introduce la contraseña',
            afterLinkText: 'para verlo.',
            formLabel: 'Ver PDF',
        },
        attachmentNotFound: 'Archivo adjunto no encontrado',
        retry: 'Reintentar',
    },
    messages: {
        errorMessageInvalidPhone: `Por favor, introduce un número de teléfono válido sin paréntesis o guiones. Si reside fuera de Estados Unidos, por favor incluye el prefijo internacional (p. ej. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Correo electrónico inválido',
        userIsAlreadyMember: ({login, name}) => `${login} ya es miembro de ${name}`,
        userIsAlreadyAnAdmin: ({login, name}) => `${login} ya es administrador de ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Al continuar con la solicitud para activar tu Billetera Expensify, confirma que ha leído, comprende y acepta ',
        facialScan: 'Política y lanzamiento de la exploración facial de Onfido',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Política y lanzamiento de la exploración facial de Onfido</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Privacidad</a> y <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Términos de Servicio</a>.</muted-text-micro>`,
        tryAgain: 'Intentar otra vez',
        verifyIdentity: 'Verificar identidad',
        letsVerifyIdentity: '¡Vamos a verificar tu identidad!',
        butFirst: 'Pero primero, lo aburrido. Lee la jerga legal en el siguiente paso y haz clic en "Aceptar" cuando estés listo.',
        genericError: 'Se ha producido un error al procesar este paso. Inténtalo de nuevo.',
        cameraPermissionsNotGranted: 'Permiso para acceder a la cámara',
        cameraRequestMessage: 'Necesitamos acceso a tu cámara para completar la verificación de tu cuenta de banco. Por favor habilita los permisos en Configuración > New Expensify.',
        microphonePermissionsNotGranted: 'Permiso para acceder al micrófono',
        microphoneRequestMessage: 'Necesitamos acceso a tu micrófono para completar la verificación de tu cuenta de banco. Por favor habilita los permisos en Configuración > New Expensify.',
        originalDocumentNeeded: 'Por favor, sube una imagen original de tu identificación en lugar de una captura de pantalla o imagen escaneada.',
        documentNeedsBetterQuality:
            'Parece que tu identificación esta dañado o le faltan características de seguridad. Por favor, sube una imagen de tu documento sin daños y que se vea completamente.',
        imageNeedsBetterQuality: 'Hay un problema con la calidad de la imagen de tu identificación. Por favor, sube una nueva imagen donde el identificación se vea con claridad.',
        selfieIssue: 'Hay un problema con tu selfie/video. Por favor, sube un nuevo selfie/video grabado en el momento',
        selfieNotMatching: 'Tu selfie/video no concuerda con tu identificación. Por favor, sube un nuevo selfie/video donde se vea tu cara con claridad.',
        selfieNotLive: 'Tu selfie/video no parece ser un selfie/video en vivo. Por favor, sube un selfie/video a tiempo real.',
    },
    additionalDetailsStep: {
        headerTitle: 'Detalles adicionales',
        helpText: 'Necesitamos confirmar la siguiente información antes de que puedas enviar y recibir dinero desde tu billetera.',
        helpTextIdologyQuestions: 'Tenemos que preguntarte unas preguntas más para terminar de verificar tu identidad',
        helpLink: 'Obtén más información sobre por qué necesitamos esto.',
        legalFirstNameLabel: 'Primer nombre legal',
        legalMiddleNameLabel: 'Segundo nombre legal',
        legalLastNameLabel: 'Apellidos legales',
        selectAnswer: 'Selecciona una respuesta',
        ssnFull9Error: 'Por favor, introduce los 9 dígitos de un número de seguridad social válido',
        needSSNFull9: 'Estamos teniendo problemas para verificar tu número de seguridad social. Introduce los 9 dígitos del número de seguridad social.',
        weCouldNotVerify: 'No se pudo verificar',
        pleaseFixIt: 'Corrige esta información antes de continuar.',
        failedKYCMessage: ({conciergeEmail}) =>
            `No se ha podido verificar correctamente tu identidad. Vuelve a intentarlo más tarde o comunícate con <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> si tienes alguna pregunta.`,
    },
    termsStep: {
        headerTitle: 'Condiciones y tarifas',
        headerTitleRefactor: 'Tarifas y condiciones',
        haveReadAndAgreePlain: 'He leído y acepto recibir divulgaciones electrónicas.',
        haveReadAndAgree: `He leído y acepto recibir <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">divulgaciones electrónicas</a>.`,
        agreeToThePlain: 'Estoy de acuerdo con el Privacidad y Acuerdo de la billetera.',
        agreeToThe: ({walletAgreementUrl}) =>
            `Estoy de acuerdo con el <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacidad</a> y <a href="${walletAgreementUrl}">Acuerdo de la billetera</a>.`,
        enablePayments: 'Habilitar pagos',
        monthlyFee: 'Cuota mensual',
        inactivity: 'Inactividad',
        noOverdraftOrCredit: 'Sin función de sobregiro/crédito',
        electronicFundsWithdrawal: 'Retiro electrónico de fondos',
        standard: 'Estándar',
        reviewTheFees: 'Echa un vistazo a algunas de las tarifas.',
        checkTheBoxes: 'Por favor, marca las siguientes casillas.',
        agreeToTerms: 'Debes aceptar los términos y condiciones para continuar.',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}) => `La Billetera Expensify es emitida por ${walletProgram}.`,
            perPurchase: 'Por compra',
            atmWithdrawal: 'Retiro en cajeros automáticos',
            cashReload: 'Recarga de efectivo',
            inNetwork: 'en la red',
            outOfNetwork: 'fuera de la red',
            atmBalanceInquiry: 'Consulta de saldo en cajeros automáticos (dentro o fuera de la red)',
            customerService: 'Servicio al cliente (agente automatizado o en vivo)',
            inactivityAfterTwelveMonths: 'Inactividad (después de 12 meses sin transacciones)',
            weChargeOneFee: 'Cobramos otro tipo de tarifa. Es:',
            fdicInsurance: 'Tus fondos pueden acogerse al seguro de la FDIC.',
            generalInfo: `Para obtener información general sobre cuentas de prepago, visite <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Encuentra detalles y condiciones para todas las tarifas y servicios visitando <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> o llamando al +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Retiro electrónico de fondos (instantáneo)',
            electronicFundsInstantFeeMin: ({amount}) => `(mínimo ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Una lista de todas las tarifas de la Billetera Expensify',
            typeOfFeeHeader: 'Todas las tarifas',
            feeAmountHeader: 'Cantidad',
            moreDetailsHeader: 'Descripción',
            openingAccountTitle: 'Abrir una cuenta',
            openingAccountDetails: 'No hay tarifa para abrir una cuenta.',
            monthlyFeeDetails: 'No hay tarifa mensual.',
            customerServiceTitle: 'Servicio al cliente',
            customerServiceDetails: 'No hay tarifas de servicio al cliente.',
            inactivityDetails: 'No hay tarifa de inactividad.',
            sendingFundsTitle: 'Enviar fondos a otro titular de cuenta',
            sendingFundsDetails: 'No se aplica ningún cargo por enviar fondos a otro titular de cuenta utilizando tu saldo cuenta bancaria o tarjeta de débito',
            electronicFundsStandardDetails:
                "'No hay cargo por transferir fondos desde tu Billetera Expensify a tu cuenta bancaria utilizando la opción estándar. Esta transferencia generalmente se completa en 1-3 días laborables.",
            electronicFundsInstantDetails: (percentage, amount) =>
                dedent(`
                    Hay una tarifa para transferir fondos desde tu Billetera Expensify a la tarjeta de débito vinculada utilizando la opción de transferencia instantánea. Esta transferencia generalmente se completa dentro de varios minutos. La tarifa es el ${percentage}% del importe de la transferencia (con una tarifa mínima de ${amount}).
                `),
            fdicInsuranceBancorp: ({amount}) =>
                `Tus fondos pueden acogerse al seguro de la FDIC. Tus fondos se mantendrán o serán transferidos a ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, una institución asegurada por la FDIC.` +
                ` Una vez allí, tus fondos están asegurados hasta ${amount} por la FDIC en caso de que ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} quiebre, ` +
                `si se cumplen los requisitos específicos del seguro de depósitos y tu tarjeta está registrada. Ver ${CONST.TERMS.FDIC_PREPAID} para más detalles.`,
            contactExpensifyPayments: `Comunícate con ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} llamando al + 1833-400-0904, o por correo electrónico a ${CONST.EMAIL.CONCIERGE} o inicie sesión en ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Para obtener información general sobre cuentas de prepago, visite ${CONST.TERMS.CFPB_PREPAID}. Si tienes alguna queja sobre una cuenta de prepago, llama al Consumer Financial Oficina de Protección al 1-855-411-2372 o visita ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Ver versión para imprimir',
            automated: 'Automatizado',
            liveAgent: 'Agente en vivo',
            instant: 'Instantáneo',
            electronicFundsInstantFeeMin: ({amount}) => `Mínimo ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Habilitar pagos',
        activatedTitle: '¡Billetera  activada!',
        activatedMessage: 'Felicidades, tu billetera está configurada y lista para hacer pagos.',
        checkBackLaterTitle: 'Un momento...',
        checkBackLaterMessage: 'Todavía estamos revisando tu información. Por favor, vuelve más tarde.',
        continueToPayment: 'Continuar al pago',
        continueToTransfer: 'Continuar a la transferencia',
    },
    companyStep: {
        headerTitle: 'Información de la empresa',
        subtitle: '¡Ya casi estamos! Por motivos de seguridad, necesitamos confirmar la siguiente información:',
        legalBusinessName: 'Nombre comercial legal',
        companyWebsite: 'Página web de la empresa',
        taxIDNumber: 'Número de identificación fiscal',
        taxIDNumberPlaceholder: '9 dígitos',
        companyType: 'Tipo de empresa',
        incorporationDate: 'Fecha de incorporación',
        incorporationState: 'Estado de incorporación',
        industryClassificationCode: 'Código de clasificación industrial',
        confirmCompanyIsNot: 'Confirmo que esta empresa no está en el',
        listOfRestrictedBusinesses: 'lista de negocios restringidos',
        incorporationDatePlaceholder: 'Fecha de inicio (aaaa-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Sociedad',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Propietario único',
            OTHER: 'Otra',
        },
        industryClassification: '¿A qué categoría pertenece el negocio?',
        industryClassificationCodePlaceholder: 'Buscar código de clasificación industrial',
    },
    requestorStep: {
        headerTitle: 'Información personal',
        learnMore: 'Más información',
        isMyDataSafe: '¿Están seguros mis datos?',
    },
    personalInfoStep: {
        personalInfo: 'Información Personal',
        enterYourLegalFirstAndLast: '¿Cuál es tu nombre legal?',
        legalFirstName: 'Nombre',
        legalLastName: 'Apellidos',
        legalName: 'Nombre legal',
        enterYourDateOfBirth: '¿Cuál es tu fecha de nacimiento?',
        enterTheLast4: '¿Cuáles son los últimos 4 dígitos de tu número de la seguridad social?',
        dontWorry: 'No te preocupes, no hacemos verificaciones de crédito personales.',
        last4SSN: 'Últimos 4 dígitos de tu SSN',
        enterYourAddress: '¿Cuál es tu dirección?',
        address: 'Dirección',
        letsDoubleCheck: 'Revisemos que todo esté bien',
        byAddingThisBankAccount: 'Añadiendo esta cuenta bancaria, confirmas que has leído, entendido y aceptado',
        whatsYourLegalName: '¿Cuál es tu nombre legal?',
        whatsYourDOB: '¿Cuál es tu fecha de nacimiento?',
        whatsYourAddress: '¿Cuál es tu dirección?',
        whatsYourSSN: '¿Cuáles son los últimos 4 dígitos de tu número de la seguridad social?',
        noPersonalChecks: 'No te preocupes, no hacemos verificaciones de crédito personales.',
        whatsYourPhoneNumber: '¿Cuál es tu número de teléfono?',
        weNeedThisToVerify: 'Necesitamos esto para verificar tu billetera.',
    },
    businessInfoStep: {
        businessInfo: 'Información de la empresa',
        enterTheNameOfYourBusiness: '¿Cuál es el nombre de tu empresa?',
        businessName: 'Nombre de la empresa',
        enterYourCompanyTaxIdNumber: '¿Cuál es el número de identificación fiscal?',
        taxIDNumber: 'Número de identificación fiscal',
        taxIDNumberPlaceholder: '9 dígitos',
        enterYourCompanyWebsite: '¿Cuál es la página web de tu empresa?',
        companyWebsite: 'Página web de la empresa',
        enterYourCompanyPhoneNumber: '¿Cuál es el número de teléfono de tu empresa?',
        enterYourCompanyAddress: '¿Cuál es la dirección de tu empresa?',
        selectYourCompanyType: '¿Cuál es el tipo de empresa?',
        companyType: 'Tipo de empresa',
        incorporationType: {
            LLC: 'SRL',
            CORPORATION: 'Corporación',
            PARTNERSHIP: 'Sociedad',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Empresa individual',
            OTHER: 'Otros',
        },
        selectYourCompanyIncorporationDate: '¿Cuál es la fecha de constitución de la empresa?',
        incorporationDate: 'Fecha de constitución',
        incorporationDatePlaceholder: 'Fecha de inicio (yyyy-mm-dd)',
        incorporationState: 'Estado en el que se constituyó',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '¿Cuál es el estado en el que se constituyó la empresa?',
        letsDoubleCheck: 'Verifiquemos que todo esté correcto',
        companyAddress: 'Dirección de la empresa',
        listOfRestrictedBusinesses: 'lista de negocios restringidos',
        confirmCompanyIsNot: 'Confirmo que esta empresa no está en la',
        businessInfoTitle: 'Información del negocio',
        legalBusinessName: 'Nombre legal de la empresa',
        whatsTheBusinessName: '¿Cuál es el nombre de la empresa?',
        whatsTheBusinessAddress: '¿Cuál es la dirección de la empresa?',
        whatsTheBusinessContactInformation: '¿Cuál es la información de contacto de la empresa?',
        whatsTheBusinessRegistrationNumber: (country) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return '¿Cuál es el número de registro de la empresa (CRN)?';
                default:
                    return '¿Cuál es el número de registro de la empresa?';
            }
        },
        whatsTheBusinessTaxIDEIN: (country) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '¿Cuál es el Número de Identificación del Empleador (EIN)?';
                case CONST.COUNTRY.CA:
                    return '¿Cuál es el Número de Empresa (BN)?';
                case CONST.COUNTRY.GB:
                    return '¿Cuál es el Número de Registro de IVA (VRN)?';
                case CONST.COUNTRY.AU:
                    return '¿Cuál es el Número de Empresa Australiano (ABN)?';
                default:
                    return '¿Cuál es el número de IVA de la UE?';
            }
        },
        whatsThisNumber: '¿Qué es este número?',
        whereWasTheBusinessIncorporated: '¿Dónde se constituyó la empresa?',
        whatTypeOfBusinessIsIt: '¿Qué tipo de empresa es?',
        whatsTheBusinessAnnualPayment: '¿Cuál es el volumen anual de pagos de la empresa?',
        whatsYourExpectedAverageReimbursements: '¿Cuál es el monto promedio esperado de reembolso?',
        registrationNumber: 'Número de registro',
        taxIDEIN: (country) => {
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
                    return 'EU VAT';
            }
        },
        businessAddress: 'Dirección de la empresa',
        businessType: 'Tipo de empresa',
        incorporation: 'Constitución',
        incorporationCountry: 'País de constitución',
        incorporationTypeName: 'Tipo de constitución',
        businessCategory: 'Categoría de la empresa',
        annualPaymentVolume: 'Volumen anual de pagos',
        annualPaymentVolumeInCurrency: (currencyCode) => `Volumen anual de pagos en ${currencyCode}`,
        averageReimbursementAmount: 'Monto promedio de reembolso',
        averageReimbursementAmountInCurrency: (currencyCode) => `Monto promedio de reembolso en ${currencyCode}`,
        selectIncorporationType: 'Seleccione tipo de constitución',
        selectBusinessCategory: 'Seleccione categoría de la empresa',
        selectAnnualPaymentVolume: 'Seleccione volumen anual de pagos',
        selectIncorporationCountry: 'Seleccione país de constitución',
        selectIncorporationState: 'Seleccione estado de constitución',
        selectAverageReimbursement: 'Selecciona el monto promedio de reembolso',
        selectBusinessType: 'Seleccionar tipo de negocio',
        findIncorporationType: 'Buscar tipo de constitución',
        findBusinessCategory: 'Buscar categoría de la empresa',
        findAnnualPaymentVolume: 'Buscar volumen anual de pagos',
        findIncorporationState: 'Buscar estado de constitución',
        findAverageReimbursement: 'Encuentra el monto promedio de reembolso',
        findBusinessType: 'Buscar tipo de negocio',
        error: {
            registrationNumber: 'Por favor, proporciona un número de registro válido',
            taxIDEIN: (country) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Por favor, proporcione un Número de Identificación del Empleador (EIN) válido';
                    case CONST.COUNTRY.CA:
                        return 'Por favor, proporcione un Número de Empresa (BN) válido';
                    case CONST.COUNTRY.GB:
                        return 'Por favor, proporcione un Número de Registro de IVA (VRN) válido';
                    case CONST.COUNTRY.AU:
                        return 'Por favor, proporcione un Número de Empresa Australiano (ABN) válido';
                    default:
                        return 'Por favor, proporcione un número de IVA de la UE válido';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName) => `¿Posee el 25% o más de ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName) => `¿Alguien posee el 25% o más de ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName) => `¿Hay más personas que posean el 25% o más de ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: 'La ley nos exige verificar la identidad de cualquier persona que posea más del 25% de la empresa.',
        companyOwner: 'Dueño de la empresa',
        enterLegalFirstAndLastName: '¿Cuál es el nombre legal del dueño?',
        legalFirstName: 'Nombre legal',
        legalLastName: 'Apellidos legales',
        enterTheDateOfBirthOfTheOwner: '¿Cuál es la fecha de nacimiento del dueño?',
        enterTheLast4: '¿Cuáles son los últimos 4 dígitos del número de la seguridad social del dueño?',
        last4SSN: 'Últimos 4 dígitos del número de la seguridad social',
        dontWorry: 'No te preocupes, ¡no realizamos verificaciones de crédito personales!',
        enterTheOwnersAddress: '¿Cuál es la dirección del dueño?',
        letsDoubleCheck: 'Vamos a verificar que todo esté correcto.',
        legalName: 'Nombre legal',
        address: 'Dirección',
        byAddingThisBankAccount: 'Al añadir esta cuenta bancaria, confirmas que has leído, comprendido y aceptado',
        owners: 'Dueños',
    },
    ownershipInfoStep: {
        ownerInfo: 'Información del propietario',
        businessOwner: 'Propietario del negocio',
        signerInfo: 'Información del firmante',
        doYouOwn: (companyName) => `¿Posee el 25% o más de ${companyName}?`,
        doesAnyoneOwn: (companyName) => `¿Alguien posee el 25% o más de ${companyName}?`,
        regulationsRequire: 'Las regulaciones requieren que verifiquemos la identidad de cualquier persona que posea más del 25% del negocio.',
        legalFirstName: 'Nombre legal',
        legalLastName: 'Apellido legal',
        whatsTheOwnersName: '¿Cuál es el nombre legal del propietario?',
        whatsYourName: '¿Cuál es su nombre legal?',
        whatPercentage: '¿Qué porcentaje del negocio pertenece al propietario?',
        whatsYoursPercentage: '¿Qué porcentaje del negocio posee?',
        ownership: 'Propiedad',
        whatsTheOwnersDOB: '¿Cuál es la fecha de nacimiento del propietario?',
        whatsYourDOB: '¿Cuál es su fecha de nacimiento?',
        whatsTheOwnersAddress: '¿Cuál es la dirección del propietario?',
        whatsYourAddress: '¿Cuál es su dirección?',
        whatAreTheLast: '¿Cuáles son los últimos 4 dígitos del número de seguro social del propietario?',
        whatsYourLast: '¿Cuáles son los últimos 4 dígitos de su número de seguro social?',
        whatsYourNationality: '¿Cuál es tu país de ciudadanía?',
        whatsTheOwnersNationality: '¿Cuál es el país de ciudadanía del propietario?',
        countryOfCitizenship: 'País de ciudadanía',
        dontWorry: 'No se preocupe, ¡no realizamos ninguna verificación de crédito personal!',
        last4: 'Últimos 4 del SSN',
        whyDoWeAsk: '¿Por qué solicitamos esto?',
        letsDoubleCheck: 'Verifiquemos que todo esté correcto.',
        legalName: 'Nombre legal',
        ownershipPercentage: 'Porcentaje de propiedad',
        areThereOther: (companyName) => `¿Hay otras personas que posean el 25% o más de ${companyName}?`,
        owners: 'Propietarios',
        addCertified: 'Agregue un organigrama certificado que muestre los propietarios beneficiarios',
        regulationRequiresChart: 'La regulación nos exige recopilar una copia certificada del organigrama que muestre a cada persona o entidad que posea el 25% o más del negocio.',
        uploadEntity: 'Subir organigrama de propiedad de la entidad',
        noteEntity: 'Nota: El organigrama de propiedad de la entidad debe estar firmado por su contador, asesor legal o notariado.',
        certified: 'Organigrama certificado de propiedad de la entidad',
        selectCountry: 'Seleccionar país',
        findCountry: 'Buscar país',
        address: 'Dirección',
        chooseFile: 'Elige archivo',
        uploadDocuments: 'Sube documentación adicional',
        pleaseUpload:
            'Por favor, sube la documentación adicional a continuación para ayudarnos a verificar tu identidad como propietario directo o indirecto del 25% o más de la entidad empresarial.',
        acceptedFiles: 'Formatos de archivo aceptados: PDF, PNG, JPEG. El tamaño total del archivo para cada sección no puede superar los 5 MB.',
        proofOfBeneficialOwner: 'Prueba del propietario beneficiario',
        proofOfBeneficialOwnerDescription:
            'Por favor, proporciona una declaración firmada y un organigrama de un contador público, notario o abogado que verifique la propiedad del 25% o más del negocio. Debe estar fechado dentro de los últimos tres meses e incluir el número de licencia del firmante.',
        copyOfID: 'Copia de la identificación del propietario beneficiario',
        copyOfIDDescription: 'Ejemplos: Pasaporte, licencia de conducir, etc.',
        proofOfAddress: 'Prueba de la dirección del propietario beneficiario',
        proofOfAddressDescription: 'Ejemplos: Factura de servicios, contrato de alquiler, etc.',
        codiceFiscale: 'Codice fiscale/ID fiscal',
        codiceFiscaleDescription:
            'Por favor, sube un video de una visita al sitio o una llamada grabada con el oficial firmante. El oficial debe proporcionar: nombre completo, fecha de nacimiento, nombre de la empresa, número de registro, número de código fiscal, dirección registrada, naturaleza del negocio y propósito de la cuenta.',
    },
    completeVerificationStep: {
        completeVerification: 'Completar la verificación',
        confirmAgreements: 'Por favor, confirma los acuerdos siguientes.',
        certifyTrueAndAccurate: 'Certifico que la información dada es verdadera y precisa',
        certifyTrueAndAccurateError: 'Por favor, certifica que la información es verdadera y exacta',
        isAuthorizedToUseBankAccount: 'Estoy autorizado para usar la cuenta bancaria de mi empresa para gastos de empresa',
        isAuthorizedToUseBankAccountError: 'Debes ser el responsable oficial con autorización para operar la cuenta bancaria de la empresa',
        termsAndConditions: 'Términos y Condiciones',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Valida tu cuenta bancaria',
        validateButtonText: 'Validar',
        validationInputLabel: 'Transacción',
        maxAttemptsReached: 'La validación de esta cuenta bancaria se ha desactivado debido a demasiados intentos incorrectos.',
        description: 'Enviaremos tres (3) pequeñas transacciones a tu cuenta bancaria a nombre de "Expensify, Inc. Validation" dentro de los próximos 1-2 días laborables.',
        descriptionCTA: 'Introduce el importe de cada transacción en los campos siguientes. Ejemplo: 1.51.',
        letsChatText: '¡Ya casi estamos! Necesitamos tu ayuda para verificar unos últimos datos a través del chat. ¿Estás listo?',
        enable2FATitle: '¡Evita fraudes, activa la autenticación de dos factores!',
        enable2FAText: 'Tu seguridad es importante para nosotros. Por favor, configura ahora la autenticación de dos factores para añadir una capa adicional de protección a tu cuenta.',
        secureYourAccount: 'Asegura tu cuenta',
    },
    countryStep: {
        confirmBusinessBank: 'Confirmar moneda y país de la cuenta bancaria comercial',
        confirmCurrency: 'Confirmar moneda y país',
        yourBusiness: 'La moneda de su cuenta bancaria comercial debe coincidir con la moneda de su espacio de trabajo.',
        youCanChange: 'Puede cambiar la moneda de su espacio de trabajo en su',
        findCountry: 'Encontrar país',
        selectCountry: 'Seleccione su país',
    },
    bankInfoStep: {
        whatAreYour: '¿Cuáles son los detalles de tu cuenta bancaria comercial?',
        letsDoubleCheck: 'Verifiquemos que todo esté bien.',
        thisBankAccount: 'Esta cuenta bancaria se utilizará para pagos comerciales en tu espacio de trabajo.',
        accountNumber: 'Número de cuenta',
        accountHolderNameDescription: 'Nombre completo del firmante autorizado',
    },
    signerInfoStep: {
        signerInfo: 'Información del firmante',
        areYouDirector: (companyName) => `¿Es usted director en ${companyName}?`,
        regulationRequiresUs: 'La regulación requiere que verifiquemos si el firmante tiene la autoridad para realizar esta acción en nombre de la empresa.',
        whatsYourName: '¿Cuál es tu nombre legal?',
        fullName: 'Nombre legal completo',
        whatsYourJobTitle: '¿Cuál es tu puesto de trabajo?',
        jobTitle: 'Título profesional',
        whatsYourDOB: '¿Cual es tu fecha de nacimiento?',
        uploadID: 'Subir documento de identidad y prueba de domicilio',
        personalAddress: 'Prueba de domicilio personal (por ejemplo, factura de servicios públicos)',
        letsDoubleCheck: 'Vamos a verificar que todo esté correcto.',
        legalName: 'Nombre legal',
        proofOf: 'Comprobante de domicilio personal',
        enterOneEmail: (companyName) => `Introduce el correo electrónico del director en ${companyName}`,
        regulationRequiresOneMoreDirector: 'El reglamento exige que haya otro director como firmante.',
        hangTight: 'Espera un momento...',
        enterTwoEmails: (companyName) => `Introduce los correos electrónicos de dos directores en ${companyName}`,
        sendReminder: 'Enviar un recordatorio',
        chooseFile: 'Seleccionar archivo',
        weAreWaiting: 'Estamos esperando que otros verifiquen sus identidades como directores de la empresa.',
        id: 'Copia de identificación',
        proofOfDirectors: 'Prueba de director(es)',
        proofOfDirectorsDescription: 'Ejemplos: Perfil Corporativo de Oncorp o Registro Comercial.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale para firmantes, usuarios autorizados y beneficiarios finales.',
        PDSandFSG: 'Documentación de divulgación PDS + FSG',
        PDSandFSGDescription:
            'Nuestra colaboración con Corpay utiliza una conexión API para aprovechar su amplia red de socios bancarios internacionales y facilitar los reembolsos globales en Expensify. Según la normativa australiana, te proporcionamos la Guía de Servicios Financieros (FSG) y el Documento de Divulgación del Producto (PDS) de Corpay.\n\nPor favor, lee detenidamente los documentos FSG y PDS, ya que contienen información completa e importante sobre los productos y servicios que ofrece Corpay. Conserva estos documentos para futuras consultas.',
        pleaseUpload: 'Sube documentación adicional a continuación para ayudarnos a verificar tu identidad como director de la empresa.',
        enterSignerInfo: 'Ingrese la información del firmante',
        thisStep: 'Este paso ha sido completado',
        isConnecting: ({bankAccountLastFour, currency}) =>
            `está conectando una cuenta bancaria comercial en ${currency} que termina en ${bankAccountLastFour} a Expensify para pagar a los empleados en ${currency}. El siguiente paso requiere la información del firmante de un director.`,
        error: {
            emailsMustBeDifferent: 'Los correos electrónicos deben ser diferentes',
        },
    },
    agreementsStep: {
        agreements: 'Acuerdos',
        pleaseConfirm: 'Por favor confirme los acuerdos a continuación',
        regulationRequiresUs: 'La normativa requiere que verifiquemos la identidad de cualquier individuo que posea más del 25% del negocio.',
        iAmAuthorized: 'Estoy autorizado para usar la cuenta bancaria para gastos del negocio.',
        iCertify: 'Certifico que la información proporcionada es verdadera y correcta.',
        iAcceptTheTermsAndConditions: `Acepto los <a href="https://cross-border.corpay.com/tc/">términos y condiciones</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Acepto los términos y condiciones.',
        accept: 'Agregar y aceptar cuenta bancaria',
        iConsentToThePrivacyNotice: 'Doy mi consentimiento para el <a href="https://payments.corpay.com/compliance">aviso de privacidad</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Doy mi consentimiento para el aviso de privacidad.',
        error: {
            authorized: 'Debe ser un funcionario controlador con autorización para operar la cuenta bancaria comercial',
            certify: 'Por favor certifique que la información es verdadera y exacta',
            consent: 'Por favor, acepte el aviso de privacidad',
        },
    },
    docusignStep: {
        subheader: 'Formulario de Docusign',
        pleaseComplete:
            'Por favor, complete el formulario de autorización ACH utilizando el enlace de Docusign a continuación y luego cargue esa copia firmada aquí para que podamos retirar fondos directamente de su cuenta bancaria.',
        pleaseCompleteTheBusinessAccount: 'Por favor, complete la Solicitud de Cuenta Comercial y el Acuerdo de Débito Directo.',
        pleaseCompleteTheDirect:
            'Por favor, complete el Acuerdo de Débito Directo utilizando el enlace de Docusign a continuación y luego cargue esa copia firmada aquí para que podamos retirar fondos directamente de su cuenta bancaria.',
        takeMeTo: 'Llévame a Docusign',
        uploadAdditional: 'Cargar documentación adicional',
        pleaseUpload: 'Por favor, cargue el formulario DEFT y la página de firma de Docusign.',
        pleaseUploadTheDirect: 'Por favor, cargue los Acuerdos de Débito Directo y la página de firma de Docusign.',
    },
    finishStep: {
        letsFinish: '¡Terminemos en el chat!',
        thanksFor:
            'Gracias por esos detalles. Un agente de soporte dedicado revisará ahora tu información. Nos pondremos en contacto si necesitamos algo más de tu parte, pero mientras tanto, no dudes en comunicarte con nosotros si tienes alguna pregunta.',
        iHaveA: 'Tengo una pregunta',
        enable2FA: 'Habilite la autenticación de dos factores (2FA) para prevenir fraudes',
        weTake: 'Nos tomamos su seguridad en serio. Por favor, configure 2FA ahora para agregar una capa adicional de protección a su cuenta.',
        secure: 'Asegure su cuenta',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Un momento',
        explanationLine: 'Estamos verificando tu información y podrás continuar con los siguientes pasos en unos momentos.',
    },
    session: {
        offlineMessageRetry: 'Parece que estás desconectado. Por favor, comprueba tu conexión e inténtalo de nuevo.',
    },
    travel: {
        header: 'Reservar viajes',
        title: 'Viaja de forma inteligente',
        subtitle: 'Utiliza Expensify Travel para obtener las mejores ofertas de viaje y gestionar todos los gastos de tu negocio en un solo lugar.',
        features: {
            saveMoney: 'Ahorra dinero en tus reservas',
            alerts: 'Recibe alertas en tiempo real si tus planes de viaje cambian',
        },
        bookTravel: 'Reservar viajes',
        bookDemo: 'Pedir demostración',
        bookADemo: 'Reserva una demo',
        toLearnMore: ' para obtener más información.',
        termsAndConditions: {
            header: 'Antes de continuar...',
            title: 'Términos y condiciones de Expensify Travel',
            label: 'Acepto los términos y condiciones',
            subtitle: `Por favor, acepta los <a href="${CONST.TRAVEL_TERMS_URL}">términos y condiciones</a> de Expensify Travel.`,
            error: 'Debes aceptar los términos y condiciones de Expensify Travel para continuar',
            defaultWorkspaceError:
                'Debes establecer un espacio de trabajo predeterminado para habilitar Expensify Travel. Ve a Configuración > Espacios de trabajo > haz clic en los tres puntos verticales junto a un espacio de trabajo > Establecer como espacio de trabajo predeterminado y luego inténtalo de nuevo.',
        },
        flight: 'Vuelo',
        flightDetails: {
            passenger: 'Pasajero',
            layover: (layover) => `<muted-text-label>Tienes una <strong>escala de ${layover}</strong> antes de este vuelo</muted-text-label>`,
            takeOff: 'Despegue',
            landing: 'Aterrizaje',
            seat: 'Asiento',
            class: 'Clase de cabina',
            recordLocator: 'Localizador de la reserva',
            cabinClasses: {
                unknown: 'Desconocido',
                economy: 'Económica',
                premiumEconomy: 'Económica Premium',
                business: 'Ejecutiva',
                first: 'Primera',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Cliente',
            checkIn: 'Entrada',
            checkOut: 'Salida',
            roomType: 'Tipo de habitación',
            cancellation: 'Política de cancelación',
            cancellationUntil: 'Cancelación gratuita hasta el',
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
            rentalCar: 'Coche de alquiler',
            pickUp: 'Recogida',
            dropOff: 'Devolución',
            driver: 'Conductor',
            carType: 'Tipo de coche',
            cancellation: 'Política de cancelación',
            cancellationUntil: 'Cancelación gratuita hasta el',
            freeCancellation: 'Cancelación gratuita',
            confirmation: 'Número de confirmación',
        },
        train: 'Tren',
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
        tripSupport: 'Soporte de Viaje',
        tripDetails: 'Detalles del viaje',
        viewTripDetails: 'Ver detalles del viaje',
        trip: 'Viaje',
        trips: 'Viajes',
        tripSummary: 'Resumen del viaje',
        departs: 'Sale',
        errorMessage: 'Ha ocurrido un error. Por favor, inténtalo mas tarde.',
        phoneError: ({phoneErrorMethodsRoute}) => `<rbr>Para reservar viajes, <a href="${phoneErrorMethodsRoute}">añade una dirección de correo electrónico de trabajo</a>.</rbr>`,
        domainSelector: {
            title: 'Dominio',
            subtitle: 'Elige un dominio para configurar Expensify Travel.',
            recommended: 'Recomendado',
        },
        domainPermissionInfo: {
            title: 'Dominio',
            restriction: (domain) =>
                `No tienes permiso para habilitar Expensify Travel para el dominio <strong>${domain}</strong>. Tendrás que pedir a alguien de ese dominio que habilite Travel por ti.`,
            accountantInvitation: `Si eres contador, considera unirte al <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">programa de contadores ExpensifyApproved!</a> para habilitar Travel para este dominio.`,
        },
        publicDomainError: {
            title: 'Comienza con Expensify Travel',
            message: 'Tendrás que usar tu correo electrónico laboral (por ejemplo, nombre@empresa.com) con Expensify Travel, no tu correo personal (por ejemplo, nombre@gmail.com).',
        },
        blockedFeatureModal: {
            title: 'Expensify Travel ha sido deshabilitado',
            message: 'Tu administrador ha desactivado Expensify Travel. Por favor, sigue la política de reservas de tu empresa para organizar tus viajes.',
        },
        verifyCompany: {
            title: 'Estamos revisando tu solicitud...',
            message: `Estamos realizando algunas comprobaciones para verificar que tu cuenta esté lista para Expensify Travel. ¡Nos pondremos en contacto contigo en breve!`,
            confirmText: 'Entendido',
            conciergeMessage: ({domain}) => `Hubo un error habilitando viajes para el dominio: ${domain}. Por favor, revisa y habilita los viajes para este dominio.`,
        },
        updates: {
            bookingTicketed: (airlineCode, origin, destination, startDate, confirmationID = '') =>
                `Tu vuelo ${airlineCode} (${origin} → ${destination}) para el ${startDate} ha sido reservado. Código de confirmación: ${confirmationID}`,
            ticketVoided: (airlineCode, origin, destination, startDate) => `Tu billete para el vuelo ${airlineCode} (${origin} → ${destination}) del ${startDate} ha sido anulado.`,
            ticketRefunded: (airlineCode, origin, destination, startDate) =>
                `Tu billete para el vuelo ${airlineCode} (${origin} → ${destination}) del ${startDate} ha sido reembolsado o cambiado.`,
            flightCancelled: (airlineCode, origin, destination, startDate) => `Tu vuelo ${airlineCode} (${origin} → ${destination}) del ${startDate} ha sido cancelado por la aerolínea.`,
            flightScheduleChangePending: (airlineCode) => `La aerolínea ha propuesto un cambio de horario para el vuelo ${airlineCode}; estamos esperando la confirmación.`,
            flightScheduleChangeClosed: (airlineCode, startDate) => `Cambio de horario confirmado: el vuelo ${airlineCode} ahora sale a las ${startDate}.`,
            flightUpdated: (airlineCode, origin, destination, startDate) => `Tu vuelo ${airlineCode} (${origin} → ${destination}) del ${startDate} ha sido actualizado.`,
            flightCabinChanged: (airlineCode, cabinClass) => `Tu clase de cabina ha sido actualizada a ${cabinClass} en el vuelo ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode) => `Tu asignación de asiento en el vuelo ${airlineCode} ha sido confirmada.`,
            flightSeatChanged: (airlineCode) => `Tu asignación de asiento en el vuelo ${airlineCode} ha sido modificada.`,
            flightSeatCancelled: (airlineCode) => `Tu asignación de asiento en el vuelo ${airlineCode} fue eliminada.`,
            paymentDeclined: 'El pago de tu reserva aérea ha fallado. Por favor, inténtalo de nuevo.',
            bookingCancelledByTraveler: ({type, id = ''}) => `Cancelaste tu reserva de ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}) => `El proveedor canceló tu reserva de ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}) => `Tu reserva de ${type} fue reprogramada. Nuevo número de confirmación: ${id}.`,
            bookingUpdated: ({type}) => `Tu reserva de ${type} fue actualizada. Revisa los nuevos detalles en el itinerario.`,
            railTicketRefund: ({origin, destination, startDate}) => `Tu billete de tren de ${origin} a ${destination} para el ${startDate} ha sido reembolsado. Se procesará un crédito.`,
            railTicketExchange: ({origin, destination, startDate}) => `Tu billete de tren de ${origin} a ${destination} para el ${startDate} ha sido cambiado.`,
            railTicketUpdate: ({origin, destination, startDate}) => `Tu billete de tren de ${origin} a ${destination} para el ${startDate} ha sido actualizado.`,
            defaultUpdate: ({type}) => `Tu reserva de ${type} fue actualizada.`,
        },
        flightTo: 'Vuelo a',
        trainTo: 'Tren a',
        carRental: ' de alquiler de coche',
        nightIn: 'noche en',
        nightsIn: 'noches en',
    },
    workspace: {
        common: {
            card: 'Tarjetas',
            expensifyCard: 'Tarjeta Expensify',
            companyCards: 'Tarjetas de empresa',
            workflows: 'Flujos de trabajo',
            workspace: 'Espacio de trabajo',
            findWorkspace: 'Encontrar espacio de trabajo',
            edit: 'Editar espacio de trabajo',
            enabled: 'Activada',
            disabled: 'Desactivada',
            everyone: 'Todos',
            delete: 'Eliminar espacio de trabajo',
            settings: 'Configuración',
            reimburse: 'Reembolsos',
            categories: 'Categorías',
            tags: 'Etiquetas',
            customField1: 'Campo personalizado 1',
            customField2: 'Campo personalizado 2',
            customFieldHint: 'Añade una codificación personalizada que se aplique a todos los gastos de este miembro.',
            reports: 'Informes',
            reportFields: 'Campos de informe',
            reportTitle: 'El título del informe.',
            taxes: 'Impuestos',
            bills: 'Pagar facturas',
            invoices: 'Facturas',
            perDiem: 'Per diem',
            travel: 'Viajes',
            members: 'Miembros',
            accounting: 'Contabilidad',
            receiptPartners: 'Socios de recibos',
            rules: 'Reglas',
            plan: 'Plan',
            profile: 'Resumen',
            bankAccount: 'Cuenta bancaria',
            displayedAs: 'Mostrado como',
            testTransactions: 'Transacciones de prueba',
            issueAndManageCards: 'Emitir y gestionar tarjetas',
            reconcileCards: 'Reconciliar tarjetas',
            selectAll: 'Seleccionar todo',
            selected: () => ({
                one: '1 seleccionado',
                other: (count: number) => `${count} seleccionados`,
            }),
            settlementFrequency: 'Frecuencia de liquidación',
            setAsDefault: 'Establecer como espacio de trabajo predeterminado',
            defaultNote: `Los recibos enviados a ${CONST.EMAIL.RECEIPTS} aparecerán en este espacio de trabajo.`,
            deleteConfirmation: '¿Estás seguro de que quieres eliminar este espacio de trabajo?',
            deleteWithCardsConfirmation: '¿Estás seguro de que quieres eliminar este espacio de trabajo? Se eliminarán todos los datos de las tarjetas y las tarjetas asignadas.',
            unavailable: 'Espacio de trabajo no disponible',
            memberNotFound: 'Miembro no encontrado. Para invitar a un nuevo miembro al espacio de trabajo, por favor, utiliza el botón invitar que está arriba.',
            notAuthorized: `No tienes acceso a esta página. Si estás intentando unirte a este espacio de trabajo, pide al dueño del espacio de trabajo que te añada como miembro. ¿Necesitas algo más? Comunícate con ${CONST.EMAIL.CONCIERGE}`,
            goToWorkspace: 'Ir al espacio de trabajo',
            duplicateWorkspace: 'Duplicar espacio de trabajo',
            duplicateWorkspacePrefix: 'Duplicar',
            goToWorkspaces: 'Ir a espacios de trabajo',
            clearFilter: 'Borrar filtro',
            workspaceName: 'Nombre del espacio de trabajo',
            workspaceOwner: 'Dueño',
            workspaceType: 'Tipo de espacio de trabajo',
            workspaceAvatar: 'Espacio de trabajo avatar',
            mustBeOnlineToViewMembers: 'Debes estar en línea para poder ver los miembros de este espacio de trabajo.',
            moreFeatures: 'Más características',
            requested: 'Solicitado',
            distanceRates: 'Tasas de distancia',
            defaultDescription: 'Un solo lugar para todos tus recibos y gastos.',
            descriptionHint: 'Comparte información sobre este espacio de trabajo con todos los miembros.',
            welcomeNote: `Por favor, utiliza Expensify para enviar tus recibos para reembolso, ¡gracias!`,
            subscription: 'Suscripción',
            markAsEntered: 'Marcar como introducido manualmente',
            markAsExported: 'Marcar como exportado',
            exportIntegrationSelected: ({connectionName}) => `Exportar a  ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Verifiquemos que todo esté correcto',
            reportField: 'Campo del informe',
            lineItemLevel: 'Nivel de partida',
            reportLevel: 'Nivel de informe',
            appliedOnExport: 'No se importa en Expensify, se aplica en la exportación',
            shareNote: {
                header: 'Comparte tu espacio de trabajo con otros miembros',
                content: ({adminsRoomLink}) =>
                    `Comparte este código QR o copia el enlace de abajo para facilitar que los miembros soliciten acceso a tu espacio de trabajo. Todas las solicitudes para unirse al espacio de trabajo aparecerán en la sala <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> para tu revisión.`,
            },
            connectTo: ({connectionName}) => `Conéctate a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Crear una nueva conexión',
            reuseExistingConnection: 'Reutilizar la conexión existente',
            existingConnections: 'Conexiones existentes',
            existingConnectionsDescription: ({connectionName}) =>
                `Como ya te has conectado a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} antes, puedes optar por reutilizar una conexión existente o crear una nueva.`,
            lastSyncDate: ({connectionName, formattedDate}) => `${connectionName} - Última sincronización ${formattedDate}`,
            topLevel: 'Nivel superior',
            authenticationError: (connectionName) => `No se puede conectar a ${connectionName} debido a un error de autenticación.`,
            learnMore: 'Más información',
            memberAlternateText: 'Presentar y aprobar informes.',
            adminAlternateText: 'Gestionar informes y configuración del área de trabajo.',
            auditorAlternateText: 'Ver y comentar los informes.',
            roleName: ({role} = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Administrador';
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
                immediate: 'Diaria',
                trip: 'Por viaje',
                weekly: 'Semanal',
                semimonthly: 'Dos veces al mes',
                monthly: 'Mensual',
            },
            planType: 'Tipo de plan',
            youCantDowngradeInvoicing:
                'No es posible cambiar a un plan inferior en una suscripción facturada. Para hablar sobre tu suscripción o realizar cambios en ella, ponte en contacto con tu gestor de cuentas o con Concierge para obtener ayuda.',
            defaultCategory: 'Categoría predeterminada',
            viewTransactions: 'Ver transacciones',
            policyExpenseChatName: ({displayName}) => `${displayName}'s gastos`,
            deepDiveExpensifyCard: `<muted-text-label>Las transacciones de la Tarjeta Expensify se exportan automáticamente a una "Cuenta de Responsabilidad de la Tarjeta Expensify" creada con <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">nuestra integración</a>.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}) => (organizationName ? `Conectado a ${organizationName}` : 'Automatice los gastos de viajes y entrega de comidas en toda su organización.'),
                sendInvites: 'Invitar miembros',
                sendInvitesDescription: 'Estos miembros del workspace aún no tienen una cuenta de Uber for Business. Deselecciona cualquier miembro que no desees invitar en este momento.',
                confirmInvite: 'Confirmar invitación',
                manageInvites: 'Administrar invitaciones',
                confirm: 'Confirmar',
                allSet: 'Todo listo',
                readyToRoll: 'Estás listo para empezar',
                takeBusinessRideMessage: 'Toma un viaje de negocios y tus recibos de Uber se importarán a Expensify. ¡Vámonos!',
                all: 'Todos',
                linked: 'Vinculado',
                outstanding: 'Pendiente',
                status: {
                    resend: 'Reenviar',
                    invite: 'Invitar',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'Vinculado',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: 'Pendiente',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Suspendido',
                },
                centralBillingAccount: 'Cuenta de facturación central',
                centralBillingDescription: 'Elija dónde importar todos los recibos de Uber.',
                invitationFailure: 'Error al invitar miembro a Uber for Business',
                autoInvite: 'Invitar a nuevos miembros del espacio de trabajo a Uber para Empresas',
                autoRemove: 'Desactivar miembros del espacio de trabajo eliminados de Uber para Empresas',
                emptyContent: {
                    title: 'No hay invitaciones pendientes',
                    subtitle: '¡Hurra! Buscamos por todas partes y no encontramos ninguna invitación pendiente.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Establece las tasas per diem para controlar los gastos diarios de los empleados. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Más información</a>.</muted-text>`,
            amount: 'Cantidad',
            deleteRates: () => ({
                one: 'Eliminar tasa',
                other: 'Eliminar tasas',
            }),
            deletePerDiemRate: 'Eliminar tasa per diem',
            findPerDiemRate: 'Encontrar tasa per diem',
            areYouSureDelete: () => ({
                one: '¿Estás seguro de que quieres eliminar esta tasa?',
                other: '¿Estás seguro de que quieres eliminar estas tasas?',
            }),
            emptyList: {
                title: 'Per diem',
                subtitle: 'Establece dietas per diem para controlar el gasto diario de los empleados. Importa las tarifas desde una hoja de cálculo para comenzar.',
            },
            importPerDiemRates: 'Importar tasas de per diem',
            editPerDiemRate: 'Editar la tasa de per diem',
            editPerDiemRates: 'Editar las tasas de per diem',
            editDestinationSubtitle: (destination) => `Actualizar este destino lo modificará para todas las subtasas per diem de ${destination}.`,
            editCurrencySubtitle: (destination) => `Actualizar esta moneda la modificará para todas las subtasas per diem de ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Establezca cómo se exportan los gastos de bolsillo a QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Marcar los cheques como “imprimir más tarde”',
            exportDescription: 'Configura cómo se exportan los datos de Expensify a QuickBooks Desktop.',
            date: 'Fecha de exportación',
            exportInvoices: 'Exportar facturas a',
            exportExpensifyCard: 'Exportar las transacciones de la tarjeta Expensify como',
            account: 'Cuenta',
            accountDescription: 'Elige dónde contabilizar los asientos contables.',
            accountsPayable: 'Cuentas por pagar',
            accountsPayableDescription: 'Elige dónde crear las facturas de proveedores.',
            bankAccount: 'Cuenta bancaria',
            notConfigured: 'No configurado',
            bankAccountDescription: 'Elige desde dónde enviar los cheques.',
            creditCardAccount: 'Cuenta de la tarjeta de crédito',
            exportDate: {
                label: 'Fecha de exportación',
                description: 'Usa esta fecha al exportar informes a QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Fecha del último gasto',
                        description: 'Fecha del gasto más reciente en el informe.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Fecha de exportación',
                        description: 'Fecha de exportación del informe a QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Fecha de envío',
                        description: 'Fecha en la que el informe se envió para aprobación.',
                    },
                },
            },
            exportCheckDescription: 'Crearemos un cheque desglosado para cada informe de Expensify y lo enviaremos desde la cuenta bancaria a continuación.',
            exportJournalEntryDescription: 'Crearemos una entrada contable desglosada para cada informe de Expensify y lo contabilizaremos en la cuenta a continuación.',
            exportVendorBillDescription:
                'Crearemos una factura de proveedor desglosada para cada informe de Expensify y la añadiremos a la cuenta a continuación. Si este periodo está cerrado, lo contabilizaremos el 1º del siguiente periodo abierto.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop no admite impuestos en las exportaciones de asientos contables. Como tienes impuestos habilitados en tu espacio de trabajo, esta opción de exportación no está disponible.',
            outOfPocketTaxEnabledError: 'Los asientos contables no están disponibles cuando los impuestos están habilitados. Por favor, selecciona otra opción de exportación.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Tarjeta de crédito',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Factura del proveedor',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Asiento contable',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Cheque',

                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Crearemos un cheque desglosado para cada informe de Expensify y lo enviaremos desde la cuenta bancaria a continuación.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "Automáticamente relacionaremos el nombre del comerciante de la transacción con tarjeta de crédito con cualquier proveedor correspondiente en QuickBooks. Si no existen proveedores, crearemos un proveedor asociado 'Credit Card Misc.'.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Crearemos una factura de proveedor desglosada para cada informe de Expensify con la fecha del último gasto, y la añadiremos a la cuenta a continuación. Si este periodo está cerrado, lo contabilizaremos el 1º del siguiente periodo abierto.',

                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Elige dónde exportar las transacciones con tarjeta de crédito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'Selecciona el proveedor que se aplicará a todas las transacciones con tarjeta de crédito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Elige desde dónde enviar los cheques.',

                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Las facturas de proveedores no están disponibles cuando las ubicaciones están habilitadas. Por favor, selecciona otra opción de exportación.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Los cheques no están disponibles cuando las ubicaciones están habilitadas. Por favor, selecciona otra opción de exportación.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Los asientos contables no están disponibles cuando los impuestos están habilitados. Por favor, selecciona otra opción de exportación.',
            },
            noAccountsFound: 'No se encontraron cuentas',
            noAccountsFoundDescription: 'Añade la cuenta en QuickBooks Desktop y sincroniza de nuevo la conexión',
            qbdSetup: 'Configuración de QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'No se puede conectar desde este dispositivo',
                body1: 'Deberás configurar esta conexión desde la computadora que hospeda tu archivo de empresa de QuickBooks Desktop.',
                body2: 'Una vez que estés conectado, podrás sincronizar y exportar desde cualquier lugar.',
            },
            setupPage: {
                title: 'Abre este enlace para conectar',
                body: 'Para completar la configuración, abre el siguiente enlace en la computadora donde se está ejecutando QuickBooks Desktop.',
                setupErrorTitle: '¡Ups! Ha ocurrido un error',
                setupErrorBody: ({conciergeLink}) =>
                    `<muted-text><centered-text>La conexión con QuickBooks Desktop no está funcionando en este momento. Por favor, inténtalo de nuevo más tarde o <a href="${conciergeLink}">contacta con Concierge</a> si el problema persiste.</centered-text></muted-text>`,
            },
            importDescription: 'Elige que configuraciónes de codificación son importadas desde QuickBooks Desktop a Expensify.',
            classes: 'Clases',
            items: 'Artículos',
            customers: 'Clientes/proyectos',
            exportCompanyCardsDescription: 'Establece cómo se exportan las compras con tarjeta de empresa a QuickBooks Desktop.',
            defaultVendorDescription: 'Establece un proveedor predeterminado que se aplicará a todas las transacciones con tarjeta de crédito al momento de exportarlas.',
            accountsDescription: 'Tu plan de cuentas de QuickBooks Desktop se importará a Expensify como categorías.',
            accountsSwitchTitle: 'Elige importar cuentas nuevas como categorías activadas o desactivadas.',
            accountsSwitchDescription: 'Las categorías activas estarán disponibles para ser escogidas cuando se crea un gasto.',
            classesDescription: 'Elige cómo gestionar las clases de QuickBooks Desktop en Expensify.',
            tagsDisplayedAsDescription: 'Nivel de partida',
            reportFieldsDisplayedAsDescription: 'Nivel de informe',
            customersDescription: 'Elige cómo gestionar los clientes/proyectos de QuickBooks Desktop en Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se sincronizará automáticamente con QuickBooks Desktop todos los días.',
                createEntities: 'Crear entidades automáticamente',
                createEntitiesDescription: 'Expensify creará automáticamente proveedores en QuickBooks Desktop si aún no existen.',
            },
            itemsDescription: 'Elige cómo gestionar los elementos de QuickBooks Desktop en Expensify.',
            accountingMethods: {
                label: 'Cuándo Exportar',
                description: 'Elige cuándo exportar los gastos:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Devengo',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Efectivo',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Los gastos por cuenta propia se exportarán cuando estén aprobados definitivamente',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Los gastos por cuenta propia se exportarán cuando estén pagados',
                },
            },
        },
        qbo: {
            connectedTo: 'Conectado a',
            importDescription: 'Elige que configuraciónes de codificación son importadas desde QuickBooks Online a Expensify.',
            classes: 'Clases',
            locations: 'Lugares',
            customers: 'Clientes/proyectos',
            accountsDescription: 'Tu plan de cuentas de QuickBooks Online se importará a Expensify como categorías.',
            accountsSwitchTitle: 'Elige importar cuentas nuevas como categorías activadas o desactivadas.',
            accountsSwitchDescription: 'Las categorías activas estarán disponibles para ser escogidas cuando se crea un gasto.',
            classesDescription: 'Elige cómo gestionar las clases de QuickBooks Online en Expensify.',
            customersDescription: 'Elige cómo gestionar los clientes/proyectos de QuickBooks Online en Expensify.',
            locationsDescription: 'Elige cómo gestionar los lugares de QuickBooks Online en Expensify.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online no admite Ubicaciones a nivel de línea para cheques o facturas de proveedores. Si deseas tener ubicaciones a nivel de línea, asegúrate de estar usando asientos contables y gastos con tarjetas de crédito/débito.',
            taxesDescription: 'Elige cómo gestionar los impuestos de QuickBooks Online en Expensify.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online no permite impuestos en los asientos contables. Por favor, cambia la opción de exportación a factura de proveedor o cheque.',
            exportInvoices: 'Exportar facturas a',
            exportDescription: 'Configura cómo se exportan los datos de Expensify a QuickBooks Online.',
            date: 'Fecha de exportación',
            exportExpensifyCard: 'Exportar las transacciones de las tarjetas Expensify como',
            exportDate: {
                label: 'Fecha de exportación',
                description: 'Usa esta fecha al exportar informe a QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Fecha del último gasto',
                        description: 'Fecha del gasto mas reciente en el informe.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Fecha de exportación',
                        description: 'Fecha de exportación del informe a QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Fecha de envío',
                        description: 'Fecha en la que el informe se envió para tu aprobación.',
                    },
                },
            },
            receivable: 'Cuentas por cobrar', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archivo de cuentas por cobrar', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Usa esta cuenta al exportar facturas a QuickBooks Online.',
            exportCompanyCardsDescription: 'Establece cómo se exportan las compras con tarjeta de empresa a QuickBooks Online.',
            account: 'Cuenta',
            accountDescription: 'Elige dónde contabilizar los asientos contables.',
            vendor: 'Proveedor',
            defaultVendorDescription: 'Establece un proveedor predeterminado que se aplicará a todas las transacciones con tarjeta de crédito al momento de exportarlas.',
            accountsPayable: 'Cuentas por pagar',
            accountsPayableDescription: 'Elige dónde crear las facturas de proveedores.',
            bankAccount: 'Cuenta bancaria',
            notConfigured: 'No configurado',
            bankAccountDescription: 'Elige desde dónde enviar los cheques.',
            creditCardAccount: 'Cuenta de la tarjeta de crédito',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online no permite lugares en las exportaciones de facturas de proveedores. Como tienes activadas los lugares en tu espacio de trabajo, esta opción de exportación no está disponible.',
            exportOutOfPocketExpensesDescription: 'Establezca cómo se exportan los gastos de bolsillo a QuickBooks Online.',
            exportCheckDescription: 'Crearemos un cheque desglosado para cada informe de Expensify y lo enviaremos desde la cuenta bancaria a continuación.',
            exportJournalEntryDescription: 'Crearemos una entrada contable desglosada para cada informe de Expensify y lo contabilizaremos en la cuenta a continuación.',
            exportVendorBillDescription:
                'Crearemos una factura de proveedor desglosada para cada informe de Expensify y la añadiremos a la cuenta a continuación. Si este periodo está cerrado, lo contabilizaremos en el día 1 del siguiente periodo abierto.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online no permite impuestos en las exportaciones de entradas a los asientos contables. Como tienes los impuestos activados en tu espacio de trabajo, esta opción de exportación no está disponible.',
            outOfPocketTaxEnabledError: 'La anotacion en el diario no está disponible cuando los impuestos están activados. Por favor, selecciona otra opción de exportación diferente.',

            advancedConfig: {
                autoSyncDescription: 'Expensify se sincronizará automáticamente con QuickBooks Online todos los días.',
                inviteEmployees: 'Invitar empleados',
                inviteEmployeesDescription: 'Importe los registros de los empleados de QuickBooks Online e invítelos a este espacio de trabajo.',
                createEntities: 'Crear entidades automáticamente',
                createEntitiesDescription: 'Expensify creará automáticamente proveedores en QuickBooks Online si aún no existen, y creará automáticamente clientes al exportar facturas.',
                reimbursedReportsDescription:
                    'Cada vez que se pague un informe utilizando Expensify ACH, se creará el correspondiente pago de la factura en la cuenta de QuickBooks Online indicadas a continuación.',
                qboBillPaymentAccount: 'Cuenta de pago de las facturas de QuickBooks',
                qboInvoiceCollectionAccount: 'Cuenta de cobro de las facturas QuickBooks',
                accountSelectDescription: 'Elige desde dónde pagar las facturas y crearemos el pago en QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Elige dónde recibir los pagos de facturas y crearemos el pago en QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Tarjeta de débito',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Tarjeta de crédito',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Factura del proveedor',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Asiento contable',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Cheque',

                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "Automáticamente relacionaremos el nombre del comerciante de la transacción con tarjeta de débito con cualquier proveedor correspondiente en QuickBooks. Si no existen proveedores, crearemos un proveedor asociado 'Debit Card Misc.'.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "Automáticamente relacionaremos el nombre del comerciante de la transacción con tarjeta de crédito con cualquier proveedor correspondiente en QuickBooks. Si no existen proveedores, crearemos un proveedor asociado 'Credit Card Misc.'.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Crearemos una factura de proveedor desglosada para cada informe de Expensify con la fecha del último gasto, y la añadiremos a la cuenta a continuación. Si este periodo está cerrado, lo contabilizaremos en el día 1 del siguiente periodo abierto.',

                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Elige dónde exportar las transacciones con tarjeta de débito.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Elige dónde exportar las transacciones con tarjeta de crédito.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Selecciona el proveedor que se aplicará a todas las transacciones con tarjeta de crédito.',

                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Las facturas de proveedores no están disponibles cuando las ubicaciones están habilitadas. Por favor, selecciona otra opción de exportación diferente.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'La verificación no está disponible cuando las ubicaciones están habilitadas. Por favor, selecciona otra opción de exportación diferente.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'El asiento de diario no está disponible cuando los impuestos están habilitados. Por favor, selecciona otra opción de exportación diferente.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Elige una cuenta válida para la exportación de facturas de proveedor',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Elige una cuenta válida para la exportación de asientos contables',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Elige una cuenta válida para la exportación de cheques',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Para usar la exportación de facturas de proveedor, configura una cuenta receptora de pagos en QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Para usar la exportación de asientos contables, configura una cuenta contable en QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Para usar la exportación de cheques, configura una cuenta bancaria en QuickBooks Online',
            },
            noAccountsFound: 'No se ha encontrado ninguna cuenta',
            noAccountsFoundDescription: 'Añade la cuenta en QuickBooks Online y sincroniza de nuevo la conexión.',
            accountingMethods: {
                label: 'Cuándo Exportar',
                description: 'Elige cuándo exportar los gastos:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Devengo',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Efectivo',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Los gastos por cuenta propia se exportarán cuando estén aprobados definitivamente',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Los gastos por cuenta propia se exportarán cuando estén pagados',
                },
            },
        },
        workspaceList: {
            joinNow: 'Únete ahora',
            askToJoin: 'Pedir unirse',
        },
        xero: {
            organization: 'Organización Xero',
            organizationDescription: 'Seleccione la organización en Xero desde la que está importando los datos.',
            importDescription: 'Elija qué configuraciones de codificación se importan de Xero a Expensify.',
            accountsDescription: 'Tu plan de cuentas de Xero se importará a Expensify como categorías.',
            accountsSwitchTitle: 'Elige importar cuentas nuevas como categorías activadas o desactivadas.',
            accountsSwitchDescription: 'Las categorías activas estarán disponibles para ser escogidas cuando se crea un gasto.',
            trackingCategories: 'Categorías de seguimiento',
            trackingCategoriesDescription: 'Elige cómo gestionar categorías de seguimiento de Xero en Expensify.',
            mapTrackingCategoryTo: (categoryName) => `Asignar ${categoryName} de Xero a`,
            mapTrackingCategoryToDescription: (categoryName) => `Elige dónde mapear ${categoryName} al exportar a Xero.`,
            customers: 'Volver a facturar a los clientes',
            customersDescription:
                'Elige si quieres volver a facturar a los clientes en Expensify. Tus contactos de clientes de Xero se pueden etiquetar como gastos, y se exportarán a Xero como una factura de venta.',
            taxesDescription: 'Elige cómo gestionar los impuestos de Xero en Expensify.',
            notImported: 'No importado',
            notConfigured: 'No configurado',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Contacto de Xero por defecto',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Etiquetas',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Campos de informes',
            },
            exportDescription: 'Configura cómo se exportan los datos de Expensify a Xero.',
            purchaseBill: 'Factura de compra',
            exportDeepDiveCompanyCard:
                'Cada gasto exportado se contabiliza como una transacción bancaria en la cuenta bancaria de Xero que selecciones a continuación. Las fechas de las transacciones coincidirán con las fechas de el extracto bancario.',
            bankTransactions: 'Transacciones bancarias',
            xeroBankAccount: 'Cuenta bancaria de Xero',
            xeroBankAccountDescription: 'Elige dónde se contabilizarán los gastos como transacciones bancarias.',
            exportExpensesDescription: 'Los informes se exportarán como una factura de compra utilizando la fecha y el estado que seleccione a continuación',
            purchaseBillDate: 'Fecha de la factura de compra',
            exportInvoices: 'Exportar facturas como',
            salesInvoice: 'Factura de venta',
            exportInvoicesDescription: 'Las facturas de venta siempre muestran la fecha en la que se envió la factura.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se sincronizará automáticamente con Xero todos los días.',
                purchaseBillStatusTitle: 'Estado de la factura de compra',
                reimbursedReportsDescription:
                    'Cada vez que se pague un informe utilizando Expensify ACH, se creará el correspondiente pago de la factura en la cuenta de Xero indicadas a continuación.',
                xeroBillPaymentAccount: 'Cuenta de pago de las facturas de Xero',
                xeroInvoiceCollectionAccount: 'Cuenta de cobro de las facturas Xero',
                xeroBillPaymentAccountDescription: 'Elige desde dónde pagar las facturas y crearemos el pago en Xero.',
                invoiceAccountSelectorDescription: 'Elige dónde recibir los pagos de facturas y crearemos el pago en Xero.',
            },
            exportDate: {
                label: 'Fecha de la factura de compra',
                description: 'Usa esta fecha al exportar el informe a Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Fecha del último gasto',
                        description: 'Fecha del gasto mas reciente en el informe.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Fecha de exportación',
                        description: 'Fecha de exportación del informe a Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Fecha de envío',
                        description: 'Fecha en la que el informe se envió para su aprobación.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Estado de la factura de compra',
                description: 'Usa este estado al exportar facturas de compra a Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Borrador',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Pendiente de aprobación',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Pendiente de pago',
                },
            },
            noAccountsFound: 'No se ha encontrado ninguna cuenta',
            noAccountsFoundDescription: 'Añade la cuenta en Xero y sincroniza de nuevo la conexión',
            accountingMethods: {
                label: 'Cuándo Exportar',
                description: 'Elige cuándo exportar los gastos:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Devengo',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Efectivo',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Los gastos por cuenta propia se exportarán cuando estén aprobados definitivamente',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Los gastos por cuenta propia se exportarán cuando estén pagados',
                },
            },
        },

        sageIntacct: {
            preferredExporter: 'Exportador preferido',
            taxSolution: 'Solución fiscal',
            notConfigured: 'No configurado',
            exportDate: {
                label: 'Fecha de exportación',
                description: 'Utilice esta fecha cuando exporte informes a Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Fecha del último gasto',
                        description: 'Fecha del gasto más reciente del informe.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Fecha de exportación',
                        description: 'Fecha en la que se exportó el informe a Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Fecha de envío',
                        description: 'Fecha de presentación del informe para su aprobación.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Establece cómo se exportan los gastos por cuenta propia a Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Informes de gastos',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Facturas de proveedores',
                },
            },
            nonReimbursableExpenses: {
                description: 'Establece cómo se exportan las compras con tarjeta de empresa a Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Tarjetas de crédito',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Facturas de proveedores',
                },
            },
            creditCardAccount: 'Cuenta de tarjeta de crédito',
            defaultVendor: 'Proveedor por defecto',
            defaultVendorDescription: (isReimbursable) =>
                `Establezca un proveedor predeterminado que se aplicará a los gastos ${isReimbursable ? '' : 'no '}reembolsables que no tienen un proveedor coincidente en Sage Intacct.`,
            exportDescription: 'Configure cómo se exportan los datos de Expensify a Sage Intacct.',
            exportPreferredExporterNote:
                'El exportador preferido puede ser cualquier administrador del área de trabajo, pero también debe ser un administrador del dominio si establece diferentes cuentas de exportación para tarjetas de empresa individuales en Configuración del dominio.',
            exportPreferredExporterSubNote: 'Una vez configurado, el exportador preferido verá los informes para exportar en su cuenta.',
            noAccountsFound: 'No se ha encontrado ninguna cuenta',
            noAccountsFoundDescription: 'Añade la cuenta en Sage Intacct y sincroniza de nuevo la conexión',
            autoSync: 'Sincronización automática',
            autoSyncDescription: 'Sincronice Sage Intacct y Expensify automáticamente, todos los días.',
            inviteEmployees: 'Invitar a los empleados',
            inviteEmployeesDescription:
                'Importe los registros de empleados de Sage Intacct e invite a los empleados a este espacio de trabajo. Su flujo de trabajo de aprobación será por defecto la aprobación del gerente y se puede configurar aún más en la página Miembros.',
            syncReimbursedReports: 'Sincronizar informes reembolsados',
            syncReimbursedReportsDescription:
                'Cuando un informe se reembolsa utilizando Expensify ACH, la factura de compra correspondiente se creará en la cuenta de Sage Intacct a continuación.',
            paymentAccount: 'Cuenta de pago Sage Intacct',
            accountingMethods: {
                label: 'Cuándo Exportar',
                description: 'Elige cuándo exportar los gastos:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Devengo',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Efectivo',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Los gastos por cuenta propia se exportarán cuando estén aprobados definitivamente',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Los gastos por cuenta propia se exportarán cuando estén pagados',
                },
            },
        },
        netsuite: {
            subsidiary: 'Subsidiaria',
            subsidiarySelectDescription: 'Elige la subsidiaria de NetSuite de la que deseas importar datos.',
            exportDescription: 'Configura cómo se exportan los datos de Expensify a NetSuite.',
            exportInvoices: 'Exportar facturas a',
            journalEntriesTaxPostingAccount: 'Cuenta de registro de impuestos de asientos contables',
            journalEntriesProvTaxPostingAccount: 'Cuenta de registro de impuestos provinciales de asientos contables',
            foreignCurrencyAmount: 'Exportar importe en moneda extranjera',
            exportToNextOpenPeriod: 'Exportar al siguiente período abierto',
            nonReimbursableJournalPostingAccount: 'Cuenta de registro de diario no reembolsable',
            reimbursableJournalPostingAccount: 'Cuenta de registro de diario reembolsable',
            journalPostingPreference: {
                label: 'Preferencia de registro de asientos contables',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Entrada única y detallada para cada informe',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Entrada única para cada gasto individual',
                },
            },
            invoiceItem: {
                label: 'Artículo de la factura',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Crear uno para mí',
                        description: "Crearemos un 'Artículo de línea de factura de Expensify' para ti al exportar (si aún no existe).",
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Seleccionar existente',
                        description: 'Asociaremos las facturas de Expensify al artículo seleccionado a continuación.',
                    },
                },
            },
            exportDate: {
                label: 'Fecha de exportación',
                description: 'Usa esta fecha al exportar informe a NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Fecha del último gasto',
                        description: 'Fecha del gasto mas reciente en el informe.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Fecha de exportación',
                        description: 'Fecha de exportación del informe a NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Fecha de envío',
                        description: 'Fecha en la que el informe se envió para su aprobación.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Informes de gastos',
                        reimbursableDescription: 'Los gastos reembolsables se exportarán como informes de gastos a NetSuite.',
                        nonReimbursableDescription: 'Los gastos no reembolsables se exportarán como informes de gastos a NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Facturas de proveedores',
                        reimbursableDescription: dedent(`
                            Los gastos reembolsables se exportarán como facturas pagaderas al proveedor especificado en NetSuite.

                            Si deseas establecer un proveedor específico para cada tarjeta, ve a *Configuraciones > Dominios > Tarjetas de Empresa*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Los gastos no reembolsables se exportarán como facturas pagaderas al proveedor especificado en NetSuite.

                            Si deseas establecer un proveedor específico para cada tarjeta, ve a *Configuraciones > Dominios > Tarjetas de Empresa*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Asientos contables',
                        reimbursableDescription: dedent(`
                            Los gastos reembolsables se exportarán como asientos contables a la cuenta especificada en NetSuite.

                            Si deseas establecer un proveedor específico para cada tarjeta, ve a *Configuraciones > Dominios > Tarjetas de Empresa*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Los gastos no reembolsables se exportarán como asientos contables a la cuenta especificada en NetSuite.

                            Si deseas establecer un proveedor específico para cada tarjeta, ve a *Configuraciones > Dominios > Tarjetas de Empresa*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Si cambias la configuración de exportación de tarjetas de empresa a informes de gastos, los proveedores de NetSuite y las cuentas de publicación para tarjetas individuales se deshabilitarán.\n\nNo te preocupes, aún guardaremos tus selecciones previas en caso de que quieras volver a cambiar más tarde.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify se sincronizará automáticamente con NetSuite todos los días.',
                reimbursedReportsDescription:
                    'Cada vez que se pague un informe utilizando Expensify ACH, se creará el correspondiente pago de la factura en la cuenta de NetSuite indicadas a continuación.',
                reimbursementsAccount: 'Cuenta de reembolsos',
                reimbursementsAccountDescription: 'Elija la cuenta bancaria que utilizará para los reembolsos y crearemos el pago asociado en NetSuite.',
                collectionsAccount: 'Cuenta de cobros',
                collectionsAccountDescription: 'Una vez que una factura se marca como pagada en Expensify y se exporta a NetSuite, aparecerá contra la cuenta de abajo.',
                approvalAccount: 'Cuenta de aprobación de cuentas por pagar',
                approvalAccountDescription:
                    'Elija la cuenta con la que se aprobarán las transacciones en NetSuite. Si está sincronizando informes reembolsados, esta es también la cuenta con la que se crearán los pagos de facturas.',
                defaultApprovalAccount: 'Preferencia predeterminada de NetSuite',
                inviteEmployees: 'Invitar empleados y establecer aprobaciones',
                inviteEmployeesDescription:
                    'Importar registros de empleados de NetSuite e invitar a empleados a este espacio de trabajo. Su flujo de trabajo de aprobación será por defecto la aprobación del gerente y se puede configurar más en la página *Miembros*.',
                autoCreateEntities: 'Crear automáticamente empleados/proveedores',
                enableCategories: 'Activar categorías recién importadas',
                customFormID: 'ID de formulario personalizado',
                customFormIDDescription:
                    'Por defecto, Expensify creará entradas utilizando el formulario de transacción preferido configurado en NetSuite. Alternativamente, tienes la opción de designar un formulario de transacción específico para ser utilizado.',
                customFormIDReimbursable: 'Gasto reembolsable',
                customFormIDNonReimbursable: 'Gasto no reembolsable',
                exportReportsTo: {
                    label: 'Nivel de aprobación del informe de gastos',
                    description:
                        'Una vez aprobado un informe de gastos en Expensify y exportado a NetSuite, puede establecer un nivel adicional de aprobación en NetSuite antes de su contabilización.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Preferencia predeterminada de NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Solo aprobado por el supervisor',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Solo aprobado por contabilidad',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Aprobado por supervisor y contabilidad',
                    },
                },
                accountingMethods: {
                    label: 'Cuándo Exportar',
                    description: 'Elige cuándo exportar los gastos:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Devengo',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Efectivo',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Los gastos por cuenta propia se exportarán cuando estén aprobados definitivamente',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Los gastos por cuenta propia se exportarán cuando estén pagados',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Nivel de aprobación de facturas de proveedores',
                    description:
                        'Una vez aprobada una factura de proveedor en Expensify y exportada a NetSuite, puede establecer un nivel adicional de aprobación en NetSuite antes de su contabilización.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Preferencia predeterminada de NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Aprobación pendiente',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Aprobado para publicación',
                    },
                },
                exportJournalsTo: {
                    label: 'Nivel de aprobación de asientos contables',
                    description: 'Una vez aprobado un asiento en Expensify y exportado a NetSuite, puede establecer un nivel adicional de aprobación en NetSuite antes de contabilizarlo.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Preferencia predeterminada de NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Aprobación pendiente',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Aprobado para publicación',
                    },
                },
                error: {
                    customFormID: 'Introduzca un ID numérico válido para el formulario personalizado',
                },
            },
            noAccountsFound: 'No se han encontrado cuentas',
            noAccountsFoundDescription: 'Añade la cuenta en NetSuite y sincroniza la conexión de nuevo',
            noVendorsFound: 'No se han encontrado proveedores',
            noVendorsFoundDescription: 'Añade proveedores en NetSuite y sincroniza la conexión de nuevo',
            noItemsFound: 'No se han encontrado artículos de factura',
            noItemsFoundDescription: 'Añade artículos de factura en NetSuite y sincroniza la conexión de nuevo',
            noSubsidiariesFound: 'No se ha encontrado subsidiarias',
            noSubsidiariesFoundDescription: 'Añade la subsidiaria en NetSuite y sincroniza de nuevo la conexión',
            tokenInput: {
                title: 'Netsuite configuración',
                formSteps: {
                    installBundle: {
                        title: 'Instala el paquete de Expensify',
                        description: 'En NetSuite, ir a *Personalización > SuiteBundler > Buscar e Instalar Paquetes* > busca "Expensify" > instala el paquete.',
                    },
                    enableTokenAuthentication: {
                        title: 'Habilitar la autenticación basada en token',
                        description: 'En NetSuite, ir a *Configuración > Empresa > Habilitar Funciones > SuiteCloud* > activar *autenticación basada en token*.',
                    },
                    enableSoapServices: {
                        title: 'Habilitar servicios web SOAP',
                        description: 'En NetSuite, ir a *Configuración > Empresa > Habilitar funciones > SuiteCloud* > habilitar *Servicios Web SOAP*.',
                    },
                    createAccessToken: {
                        title: 'Crear un token de acceso',
                        description:
                            'En NetSuite, ir a *Configuración > Usuarios/Roles > Tokens de Acceso* > crear un token de acceso para la aplicación "Expensify" y tambiém para el rol de "Integración Expensify" o "Administrador".\n\n*Importante:* Asegúrese de guardar el ID y el secreto del Token en este paso. Los necesitará para el siguiente paso.',
                    },
                    enterCredentials: {
                        title: 'Ingresa tus credenciales de NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'ID de Cuenta NetSuite',
                            netSuiteTokenID: 'ID de Token',
                            netSuiteTokenSecret: 'Secreto de Token',
                        },
                        netSuiteAccountIDDescription: 'En NetSuite, ir a *Configuración > Integración > Preferencias de Servicios Web SOAP*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Categorías de gastos',
                expenseCategoriesDescription: 'Las categorías de gastos de NetSuite se importan a Expensify como categorías.',
                crossSubsidiaryCustomers: 'Clientes/proyectos entre subsidiaria',
                importFields: {
                    departments: {
                        title: 'Departamentos',
                        subtitle: 'Elige cómo manejar los *departamentos* de NetSuite en Expensify.',
                    },
                    classes: {
                        title: 'Clases',
                        subtitle: 'Elige cómo manejar las *clases* en Expensify.',
                    },
                    locations: {
                        title: 'Ubicaciones',
                        subtitle: 'Elija cómo manejar *ubicaciones* en Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Clientes/proyectos',
                    subtitle: 'Elija cómo manejar los *clientes* y *proyectos* de NetSuite en Expensify.',
                    importCustomers: 'Importar clientes',
                    importJobs: 'Importar proyectos',
                    customers: 'clientes',
                    jobs: 'proyectos',
                    label: (importFields, importType) => `${importFields.join(' y ')}, ${importType}`,
                },
                importTaxDescription: 'Importar grupos de impuestos desde NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Elija una de las opciones siguientes:',
                    label: (importedTypes) => `Importados como ${importedTypes.join(' y ')}`,
                    requiredFieldError: ({fieldName}) => `Por favor, introduzca el ${fieldName}`,
                    customSegments: {
                        title: 'Segmentos/registros personalizados',
                        addText: 'Añadir segmento/registro personalizado',
                        recordTitle: 'Segmento/registro personalizado',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Ver instrucciones detalladas',
                        helpText: ' sobre la configuración de segmentos/registros personalizado.',
                        emptyTitle: 'Añadir un segmento personalizado o un registro personalizado',
                        fields: {
                            segmentName: 'Name',
                            internalID: 'Identificación interna',
                            scriptID: 'ID de guión',
                            mapping: 'Mostrado como',
                            customRecordScriptID: 'ID de columna de transacción',
                        },
                        removeTitle: 'Eliminar segmento/registro personalizado',
                        removePrompt: '¿Está seguro de que desea eliminar este segmento/registro personalizado?',
                        addForm: {
                            customSegmentName: 'nombre de segmento personalizado',
                            customRecordName: 'nombre de registro personalizado',
                            segmentTitle: 'Segmento personalizado',
                            customSegmentAddTitle: 'Añadir segmento personalizado',
                            customRecordAddTitle: 'Añadir registro personalizado',
                            recordTitle: 'Registro personalizado',
                            segmentRecordType: '¿Desea añadir un segmento personalizado o un registro personalizado?',
                            customSegmentNameTitle: '¿Cuál es el nombre del segmento personalizado?',
                            customRecordNameTitle: '¿Cuál es el nombre del registro personalizado?',
                            customSegmentNameFooter: `Puede encontrar los nombres de los segmentos personalizados en NetSuite en la página *Personalizaciones > Vínculos, registros y campos > Segmentos personalizados*.\nn_Para obtener instrucciones más detalladas, [visite nuestro sitio de ayuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Puede encontrar nombres de registros personalizados en NetSuite introduciendo el "Campo de columna de transacción" en la búsqueda global.\nn_Para obtener instrucciones más detalladas, [visite nuestro sitio de ayuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: '¿Cuál es la identificación interna?',
                            customSegmentInternalIDFooter: `En primer lugar, asegúrese de que ha habilitado los ID internos en NetSuite en *Inicio > Establecer preferencias > Mostrar ID interno*. *Personalización > Listas, registros y campos > Segmentos personalizados*.\n2. Haga clic en un segmento personalizado. Haga clic en un segmento personalizado. Haga clic en el hipervínculo situado junto a *Tipo de registro personalizado*.\n4. Para obtener instrucciones más detalladas, [visite nuestro sitio de ayuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Puede encontrar IDs internos de registros personalizados en NetSuite siguiendo estos pasos:\n\n1. Introduzca "Campos de línea de transacción" en la búsqueda global. Haga clic en un registro personalizado. Para obtener instrucciones más detalladas, [visite nuestro sitio de ayuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: '¿Cuál es el ID del guión?',
                            customSegmentScriptIDFooter: `Puede encontrar IDs de script de segmentos personalizados en NetSuite en: \n\n1. *Personalización > Listas, Registros y Campos > Segmentos Personalizados*.\n2. Haga clic en un segmento personalizado. a. Si desea mostrar el segmento personalizado como una *etiqueta* (a nivel de partida) en Expensify, haga clic en la subpestaña *Columnas de transacción* y utilice el *ID de campo*. b. Si desea mostrar el segmento personalizado como una *etiqueta* (a nivel de partida) en Expensify, haga clic en la subpestaña *Columnas de transacción* y utilice el *ID de campo*. Si desea mostrar el segmento personalizado como un *campo de informe* (a nivel de informe) en Expensify, haga clic en la subpestaña *Transacciones* y utilice el *ID de campo*. Para obtener instrucciones más detalladas, [visite nuestro sitio de ayuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: '¿Cuál es el ID de columna de la transacción?',
                            customRecordScriptIDFooter: `Puede encontrar IDs de script de registro personalizados en NetSuite en:\n\n1. Introduzca "Campos de línea de transacción" en la búsqueda global.\n2. Haga clic en un registro personalizado.\n3. Para obtener instrucciones más detalladas, [visite nuestro sitio de ayuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: '¿Cómo debería mostrarse este segmento personalizado en Expensify?',
                            customRecordMappingTitle: '¿Cómo debería mostrarse este registro de segmento personalizado en Expensify?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}) => `Ya existe un segmento/registro personalizado con este ${fieldName?.toLowerCase()}`,
                        },
                    },
                    customLists: {
                        title: 'Listas personalizadas',
                        addText: 'Añadir lista personalizada',
                        recordTitle: 'Lista personalizado',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Ver instrucciones detalladas',
                        helpText: ' sobre cómo configurar listas personalizada.',
                        emptyTitle: 'Añadir una lista personalizado',
                        fields: {
                            listName: 'Nombre',
                            internalID: 'Identificación interna',
                            transactionFieldID: 'ID del campo de transacción',
                            mapping: 'Mostrado como',
                        },
                        removeTitle: 'Eliminar lista personalizado',
                        removePrompt: '¿Está seguro de que desea eliminar esta lista personalizado?',
                        addForm: {
                            listNameTitle: 'Elija una lista personalizada',
                            transactionFieldIDTitle: '¿Cuál es el ID del campo de transacción?',
                            transactionFieldIDFooter: `Puede encontrar los ID de campo de transacción en NetSuite siguiendo estos pasos:\n\n1. Introduzca "Campos de línea de transacción" en búsqueda global. Introduzca "Campos de línea de transacción" en la búsqueda global.\n2. Haga clic en una lista personalizada.\n3. Para obtener instrucciones más detalladas, [visite nuestro sitio de ayuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: '¿Cómo debería mostrarse esta lista personalizada en Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Ya existe una lista personalizada con este ID de campo de transacción`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Predeterminado del empleado NetSuite',
                        description: 'No importado a Expensify, aplicado en exportación',
                        footerContent: (importField) =>
                            `Si usa ${importField} en NetSuite, aplicaremos el conjunto predeterminado en el registro del empleado al exportarlo a Informe de gastos o Entrada de diario.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Etiquetas',
                        description: 'Nivel de línea de pedido',
                        footerContent: (importField) => `Se podrán seleccionar ${importField} para cada gasto individual en el informe de un empleado.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Campos de informe',
                        description: 'Nivel de informe',
                        footerContent: (importField) => `La selección de ${importField} se aplicará a todos los gastos en el informe de un empleado.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct configuración',
            prerequisitesTitle: 'Antes de conectar...',
            downloadExpensifyPackage: 'Descargar el paquete Expensify para Sage Intacct',
            followSteps: 'Siga los pasos de nuestras instrucciones Cómo: Instrucciones para conectarse a Sage Intacct',
            enterCredentials: 'Introduzca sus credenciales de Sage Intacct',
            entity: 'Entidad',
            employeeDefault: 'Sage Intacct empleado por defecto',
            employeeDefaultDescription: 'El departamento por defecto del empleado se aplicará a sus gastos en Sage Intacct si existe.',
            displayedAsTagDescription: 'Se podrá seleccionar el departamento para cada gasto individual en el informe de un empleado.',
            displayedAsReportFieldDescription: 'La selección de departamento se aplicará a todos los gastos que figuren en el informe de un empleado.',
            toggleImportTitle: ({mappingTitle}) => `Elija cómo gestionar Sage Intacct <strong>${mappingTitle}</strong> en Expensify.`,
            expenseTypes: 'Tipos de gastos',
            expenseTypesDescription: 'Los tipos de gastos de Sage Intacct se importan a Expensify como categorías.',
            accountTypesDescription: 'Su plan de cuentas de Sage Intacct se importará a Expensify como categorías.',
            importTaxDescription: 'Importar el tipo impositivo de compra desde Sage Intacct.',
            userDefinedDimensions: 'Dimensiones definidas por el usuario',
            addUserDefinedDimension: 'Añadir dimensión definida por el usuario',
            integrationName: 'Nombre de la integración',
            dimensionExists: 'Ya existe una dimensión con ese nombre.',
            removeDimension: 'Eliminar dimensión definida por el usuario',
            removeDimensionPrompt: 'Está seguro de que desea eliminar esta dimensión definida por el usuario?',
            userDefinedDimension: 'Dimensión definida por el usuario',
            addAUserDefinedDimension: 'Añadir una dimensión definida por el usuario',
            detailedInstructionsLink: 'Ver instrucciones detalladas',
            detailedInstructionsRestOfSentence: ' para añadir dimensiones definidas por el usuario.',
            userDimensionsAdded: () => ({
                one: '1 UDD añadido',
                other: (count: number) => `${count} UDDs añadido`,
            }),
            mappingTitle: ({mappingName}) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'departamentos';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'clases';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'lugares';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'clientes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'proyectos (empleos)';
                    default:
                        return 'asignaciones';
                }
            },
        },
        type: {
            free: 'Gratis',
            control: 'Controlar',
            collect: 'Recopilar',
        },
        companyCards: {
            addCards: 'Añadir tarjetas',
            selectCards: 'Seleccionar tarjetas',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: 'Error al cargar las fuentes de tarjetas del espacio de trabajo',
                workspaceFeedsCouldNotBeLoadedMessage:
                    'Ocurrió un error al cargar las fuentes de tarjetas del espacio de trabajo. Por favor, inténtelo de nuevo o contacte a su administrador.',
                feedCouldNotBeLoadedTitle: 'Error al cargar esta fuente de tarjetas',
                feedCouldNotBeLoadedMessage: 'Ocurrió un error al cargar esta fuente de tarjetas. Por favor, inténtelo de nuevo o contacte a su administrador.',
                tryAgain: 'Inténtalo de nuevo',
            },
            addNewCard: {
                other: 'Otros',
                fileImport: 'Importar transacciones desde un archivo',
                createFileFeedHelpText: `<muted-text>Please follow this <a href="${CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL}">help guide</a> to get your company card expenses imported!</muted-text>`,
                companyCardLayoutName: 'Company card layout name',
                useAdvancedFields: 'Use advanced fields (not recommended)',
                cardProviders: {
                    gl1025: 'Tarjetas de empresa American Express',
                    cdf: 'Tarjetas comerciales Mastercard',
                    vcf: 'Tarjetas comerciales Visa',
                    stripe: 'Tarjetas comerciales Stripe',
                },
                yourCardProvider: `¿Quién es su proveedor de tarjetas?`,
                whoIsYourBankAccount: '¿Cuál es tu banco?',
                whereIsYourBankLocated: '¿Dónde está ubicado tu banco?',
                howDoYouWantToConnect: '¿Cómo deseas conectarte a tu banco?',
                learnMoreAboutOptions: `<muted-text>Obtén más información sobre estas <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">opciones</a>.</muted-text>`,
                commercialFeedDetails: 'Requiere configuración con tu banco. Esto suele ser utilizado por empresas más grandes y a menudo es la mejor opción si calificas.',
                commercialFeedPlaidDetails: 'Requiere configurarlo con tu banco, pero te guiaremos. Esto suele estar limitado a empresas más grandes.',
                directFeedDetails: 'El enfoque más simple. Conéctate de inmediato usando tus credenciales maestras. Este método es el más común.',
                enableFeed: {
                    title: (provider) => `Habilita tu feed ${provider}`,
                    heading:
                        'Tenemos una integración directa con el emisor de su tarjeta y podemos importar los datos de sus transacciones a Expensify de forma rápida y precisa.\n\nPara empezar, simplemente:',
                    visa: 'Contamos con integraciones globales con Visa, aunque la elegibilidad varía según el banco y el programa de la tarjeta.\n\nTPara empezar, simplemente:',
                    mastercard: 'Contamos con integraciones globales con Mastercard, aunque la elegibilidad varía según el banco y el programa de la tarjeta.\n\nPara empezar, simplemente:',
                    vcf: `1. Visite [este artículo de ayuda](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) para obtener instrucciones detalladas sobre cómo configurar sus tarjetas comerciales Visa.\n\n2. [Póngase en contacto con su banco](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) para comprobar que admiten un feed personalizado para su programa, y pídales que lo activen.\n\n3. *Una vez que el feed esté habilitado y tengas sus datos, pasa a la siguiente pantalla.*`,
                    gl1025: `1. Visite [este artículo de ayuda](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) para saber si American Express puede habilitar un feed personalizado para su programa.\n\n2. Una vez activada la alimentación, Amex le enviará una carta de producción.\n\n3. *Una vez que tenga la información de alimentación, continúe con la siguiente pantalla.*`,
                    cdf: `1. Visite [este artículo de ayuda](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) para obtener instrucciones detalladas sobre cómo configurar sus tarjetas comerciales Mastercard.\n\n 2. [Póngase en contacto con su banco](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) para verificar que admiten un feed personalizado para su programa, y pídales que lo habiliten.\n\n3. *Una vez que el feed esté habilitado y tengas sus datos, pasa a la siguiente pantalla.*`,
                    stripe: `1. Visita el Panel de Stripe y ve a [Configuraciones](${CONST.COMPANY_CARDS_STRIPE_HELP}).\n\n2. En Integraciones de Productos, haz clic en Habilitar junto a Expensify.\n\n3. Una vez que la fuente esté habilitada, haz clic en Enviar abajo y comenzaremos a añadirla.`,
                },
                whatBankIssuesCard: '¿Qué banco emite estas tarjetas?',
                enterNameOfBank: 'Introduzca el nombre del banco',
                feedDetails: {
                    vcf: {
                        title: '¿Cuáles son los datos de alimentación de Visa?',
                        processorLabel: 'ID del procesador',
                        bankLabel: 'Identificación de la institución financiera (banco)',
                        companyLabel: 'Empresa ID',
                        helpLabel: '¿Dónde encuentro estos IDs?',
                    },
                    gl1025: {
                        title: `¿Cuál es el nombre del archivo de entrega de Amex?`,
                        fileNameLabel: 'Nombre del archivo de entrega',
                        helpLabel: '¿Dónde encuentro el nombre del archivo de entrega?',
                    },
                    cdf: {
                        title: `¿Cuál es el identificador de distribución de Mastercard?`,
                        distributionLabel: 'ID de distribución',
                        helpLabel: '¿Dónde encuentro el ID de distribución?',
                    },
                },
                amexCorporate: 'Seleccione esto si el frente de sus tarjetas dice “Corporativa”',
                amexBusiness: 'Seleccione esta opción si el frente de sus tarjetas dice “Negocios”',
                amexPersonal: 'Selecciona esta opción si tus tarjetas son personales',
                error: {
                    pleaseSelectProvider: 'Seleccione un proveedor de tarjetas antes de continuar',
                    pleaseSelectBankAccount: 'Seleccione una cuenta bancaria antes de continuar',
                    pleaseSelectBank: 'Seleccione una bancaria antes de continuar',
                    pleaseSelectCountry: 'Seleccione un país antes de continuar',
                    pleaseSelectFeedType: 'Seleccione un tipo de pienso antes de continuar',
                },
                exitModal: {
                    title: '¿Algo no funciona?',
                    prompt: 'Notamos que no terminaste de añadir tus tarjetas. Si encontraste un problema, háznoslo saber para que podamos ayudarte a solucionarlo.',
                    confirmText: 'Informar problema',
                    cancelText: 'Saltar',
                },
                csvColumns: {
                    cardNumber: 'Card number',
                    postedDate: 'Date',
                    merchant: 'Merchant',
                    amount: 'Amount',
                    currency: 'Currency',
                    ignore: 'Ignore',
                    originalTransactionDate: 'Original transaction date',
                    originalAmount: 'Original amount',
                    originalCurrency: 'Original currency',
                    comment: 'Comment',
                    category: 'Category',
                    tag: 'Tag',
                    uniqueID: 'Unique ID',
                },
                csvErrors: {
                    requiredColumns: (missingColumns: string) => `Please assign a column to each of the attributes: ${missingColumns}.`,
                    duplicateColumns: (duplicateColumn: string) => `Oops! You've mapped a single field ("${duplicateColumn}") to multiple columns. Please review and try again.`,
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: 'Último día del mes',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: 'Último día hábil del mes',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'Día personalizado del mes',
            },
            assign: 'Asignar',
            assignCard: 'Asignar tarjeta',
            findCard: 'Encontrar tarjeta',
            cardNumber: 'Número de la tarjeta',
            commercialFeed: 'Fuente comercial',
            feedName: (feedName) => `Tarjetas ${feedName}`,
            directFeed: 'Fuente directa',
            whoNeedsCardAssigned: '¿Quién necesita una tarjeta?',
            chooseTheCardholder: 'Elige el titular de la tarjeta',
            chooseCard: 'Elige una tarjeta',
            chooseCardFor: (assignee) => `Elige una tarjeta para <strong>${assignee}</strong>. ¿No encuentras la tarjeta que buscas? <concierge-link>Avísanos.</concierge-link>`,
            noActiveCards: 'No hay tarjetas activas en este feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>O algo podría estar roto. De cualquier manera, si tienes alguna pregunta, <concierge-link>contacta a Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Elige una fecha de inicio de transacciones',
            startDateDescription: 'Importaremos todas las transacciones desde esta fecha en adelante. Si no se especifica una fecha, iremos tan atrás como lo permita tu banco.',
            editStartDateDescription:
                'Elige una nueva fecha de inicio de transacciones. Sincronizaremos todas las transacciones a partir de esa fecha, excepto las que ya hayamos importado.',
            fromTheBeginning: 'Desde el principio',
            customStartDate: 'Fecha de inicio personalizada',
            customCloseDate: 'Fecha de cierre personalizada',
            letsDoubleCheck: 'Verifiquemos que todo esté bien.',
            confirmationDescription: 'Comenzaremos a importar transacciones inmediatamente.',
            card: 'Tarjeta',
            cardName: 'Nombre de la tarjeta',
            brokenConnectionError:
                '<rbr>La conexión de la fuente de tarjetas está rota. Por favor, <a href="#">inicia sesión en tu banco</a> para que podamos restablecer la conexión.</rbr>',
            assignedCard: (assignee, link) => `ha asignado a ${assignee} una ${link}! Las transacciones importadas aparecerán en este chat.`,
            companyCard: 'tarjeta de empresa',
            chooseCardFeed: 'Elige feed de tarjetas',
            ukRegulation:
                'Expensify Limited es un agente de Plaid Financial Ltd., una institución de pago autorizada y regulada por la Financial Conduct Authority conforme al Reglamento de Servicios de Pago de 2017 (Número de Referencia de la Firma: 804718). Plaid te proporciona servicios regulados de información de cuentas a través de Expensify Limited como su agente.',
            assignCardFailedError: 'Error al asignar la tarjeta.',
            unassignCardFailedError: 'Error al desasignar la tarjeta.',
            cardAlreadyAssignedError: 'Esta tarjeta ya está asignada a un usuario en otro espacio de trabajo.',
            importTransactions: {
                title: 'Importar transacciones desde archivo',
                description: 'Por favor, ajusta la configuración de archivo que se aplicará al importar.',
                cardDisplayName: 'Nombre de la tarjeta',
                currency: 'Moneda',
                transactionsAreReimbursable: 'Las transacciones son reembolsables',
                flipAmountSign: 'Invertir el signo del monto',
                importButton: 'Importar transacciones',
            },
        },
        expensifyCard: {
            issueAndManageCards: 'Emitir y gestionar Tarjetas Expensify',
            getStartedIssuing: 'Empieza emitiendo tu primera tarjeta virtual o física.',
            verificationInProgress: 'Verificación en curso...',
            verifyingTheDetails: 'Estamos verificando algunos detalles. Concierge te avisará cuando las tarjetas de Expensify estén listas para emitirse.',
            disclaimer:
                'La tarjeta comercial Expensify Visa® es emitida por The Bancorp Bank, N.A., miembro de la FDIC, en virtud de una licencia de Visa U.S.A. Inc. y no puede utilizarse en todos los comercios que aceptan tarjetas Visa. Apple® y el logotipo de Apple® son marcas comerciales de Apple Inc. registradas en EE.UU. y otros países. App Store es una marca de servicio de Apple Inc. Google Play y el logotipo de Google Play son marcas comerciales de Google LLC.',
            euUkDisclaimer:
                'Las tarjetas proporcionadas a residentes del EEE son emitidas por Transact Payments Malta Limited, y las proporcionadas a residentes del Reino Unido son emitidas por Transact Payments Limited con licencia de Visa Europe Limited. Transact Payments Malta Limited está debidamente autorizada y regulada por la Autoridad de Servicios Financieros de Malta como Institución Financiera, de conformidad con la Ley de Instituciones Financieras de 1994. Número de registro: C 91879. Transact Payments Limited está autorizada y regulada por la Comisión de Servicios Financieros de Gibraltar.',
            issueCard: 'Emitir tarjeta',
            findCard: 'Encontrar tarjeta',
            newCard: 'Nueva tarjeta',
            name: 'Nombre',
            lastFour: '4 últimos',
            limit: 'Limite',
            currentBalance: 'Saldo actual',
            currentBalanceDescription:
                'El saldo actual es la suma de todas las transacciones contabilizadas con la Tarjeta Expensify que se han producido desde la última fecha de liquidación.',
            balanceWillBeSettledOn: ({settlementDate}) => `El saldo se liquidará el ${settlementDate}.`,
            settleBalance: 'Liquidar saldo',
            cardLimit: 'Límite de la tarjeta',
            remainingLimit: 'Límite restante',
            requestLimitIncrease: 'Solicitar aumento de límite',
            remainingLimitDescription:
                'A la hora de calcular tu límite restante, tenemos en cuenta una serie de factores: su antigüedad como cliente, la información relacionada con tu negocio que nos facilitaste al darte de alta y el efectivo disponible en tu cuenta bancaria comercial. Tu límite restante puede fluctuar a diario.',
            earnedCashback: 'Reembolso',
            earnedCashbackDescription: 'El saldo de devolución se basa en el gasto mensual realizado con la tarjeta Expensify en tu espacio de trabajo.',
            issueNewCard: 'Emitir nueva tarjeta',
            finishSetup: 'Terminar configuración',
            chooseBankAccount: 'Elegir cuenta bancaria',
            chooseExistingBank: 'Elige una cuenta bancaria comercial existente para pagar el saldo de su Tarjeta Expensify o añade una nueva cuenta bancaria.',
            accountEndingIn: 'Cuenta terminada en',
            addNewBankAccount: 'Añadir nueva cuenta bancaria',
            settlementAccount: 'Cuenta de liquidación',
            settlementAccountDescription: 'Elige una cuenta para pagar el saldo de tu Tarjeta Expensify.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}) =>
                `Asegúrate de que esta cuenta coincide con tu <a href="${reconciliationAccountSettingsLink}">Cuenta de conciliación</a> (${accountNumber}) para que Reconciliación Continua funcione correctamente.`,
            settlementFrequency: 'Frecuencia de liquidación',
            settlementFrequencyDescription: 'Elige con qué frecuencia pagarás el saldo de tu Tarjeta Expensify',
            settlementFrequencyInfo:
                'Si deseas cambiar a la liquidación mensual, deberás conectar tu cuenta bancaria a través de Plaid y tener un historial de saldo positivo en los últimos 90 días.',
            frequency: {
                daily: 'Cada día',
                monthly: 'Mensual',
            },
            cardDetails: 'Datos de la tarjeta',
            cardPending: ({name}: {name: string}) => `La tarjeta está pendiente y se emitirá una vez que la cuenta de ${name} haya sido validada.`,
            virtual: 'Virtual',
            physical: 'Física',
            deactivate: 'Desactivar tarjeta',
            changeCardLimit: 'Modificar el límite de la tarjeta',
            changeLimit: 'Modificar límite',
            smartLimitWarning: (limit) => `Si cambias el límite de esta tarjeta a ${limit}, las nuevas transacciones serán rechazadas hasta que apruebes antiguos gastos de la tarjeta.`,
            monthlyLimitWarning: (limit) => `Si cambias el límite de esta tarjeta a ${limit}, las nuevas transacciones serán rechazadas hasta el próximo mes.`,
            fixedLimitWarning: (limit) => `Si cambias el límite de esta tarjeta a ${limit}, se rechazarán las nuevas transacciones.`,
            changeCardLimitType: 'Modificar el tipo de límite de la tarjeta',
            changeLimitType: 'Modificar el tipo de límite',
            changeCardSmartLimitTypeWarning: (limit) =>
                `Si cambias el tipo de límite de esta tarjeta a Límite inteligente, las nuevas transacciones serán rechazadas porque ya se ha alcanzado el límite de ${limit} no aprobado.`,
            changeCardMonthlyLimitTypeWarning: (limit) =>
                `Si cambias el tipo de límite de esta tarjeta a Mensual, las nuevas transacciones serán rechazadas porque ya se ha alcanzado el límite de ${limit} mensual.`,
            addShippingDetails: 'Añadir detalles de envío',
            issuedCard: (assignee) => `emitió a ${assignee} una Tarjeta Expensify. La tarjeta llegará en 2-3 días laborables.`,
            issuedCardNoShippingDetails: (assignee) => `emitió a ${assignee} una Tarjeta Expensify. La tarjeta se enviará una vez que se confirmen los detalles de envío.`,
            issuedCardVirtual: ({assignee, link}) => `emitió a ${assignee} una ${link} virtual. La tarjeta puede utilizarse inmediatamente.`,
            addedShippingDetails: (assignee) => `${assignee} agregó los detalles de envío. La Tarjeta Expensify llegará en 2-3 días hábiles.`,
            replacedCard: (assignee) => `${assignee} reemplazó su Tarjeta Expensify. La nueva tarjeta llegará en 2-3 días hábiles.`,
            replacedVirtualCard: ({assignee, link}) => `${assignee} reemplazó su Tarjeta Expensify virtual! La ${link} puede utilizarse inmediatamente.`,
            card: 'tarjeta',
            replacementCard: 'tarjeta de reemplazo',
            verifyingHeader: 'Verificando',
            bankAccountVerifiedHeader: 'Cuenta bancaria verificada',
            verifyingBankAccount: 'Verificando cuenta bancaria...',
            verifyingBankAccountDescription: 'Por favor, espere mientras confirmamos que esta cuenta se puede utilizar para emitir tarjetas Expensify.',
            bankAccountVerified: '¡Cuenta bancaria verificada!',
            bankAccountVerifiedDescription: 'Ahora puedes emitir tarjetas de Expensify para los miembros de tu espacio de trabajo.',
            oneMoreStep: 'Un paso más',
            oneMoreStepDescription: 'Parece que tenemos que verificar manualmente tu cuenta bancaria. Dirígete a Concierge, donde te esperan las instrucciones.',
            gotIt: 'Entendido',
            goToConcierge: 'Ir a Concierge',
        },
        categories: {
            deleteCategories: 'Eliminar categorías',
            deleteCategoriesPrompt: '¿Estás seguro de que quieres eliminar estas categorías?',
            deleteCategory: 'Eliminar categoría',
            deleteCategoryPrompt: '¿Estás seguro de que quieres eliminar esta categoría?',
            disableCategories: 'Desactivar categorías',
            disableCategory: 'Desactivar categoría',
            enableCategories: 'Activar categorías',
            enableCategory: 'Activar categoría',
            defaultSpendCategories: 'Categorías de gasto predeterminadas',
            spendCategoriesDescription: 'Personaliza cómo se categorizan los gastos de los comerciantes para las transacciones con tarjeta de crédito y los recibos escaneados.',
            deleteFailureMessage: 'Se ha producido un error al intentar eliminar la categoría. Por favor, inténtalo más tarde.',
            categoryName: 'Nombre de la categoría',
            requiresCategory: 'Los miembros deben clasificar todos los gastos',
            needCategoryForExportToIntegration: ({connectionName}) => `Todos los gastos deben estar categorizados para poder exportar a ${connectionName}.`,
            subtitle: 'Obtén una visión general de dónde te gastas el dinero. Utiliza las categorías predeterminadas o añade las tuyas propias.',
            emptyCategories: {
                title: 'No has creado ninguna categoría',
                subtitle: 'Añade una categoría para organizar tu gasto.',
                subtitleWithAccounting: (accountingPageURL) =>
                    `<muted-text><centered-text>Tus categorías se están importando actualmente desde una conexión de contabilidad. Dirígete a <a href="${accountingPageURL}">contabilidad</a> para hacer cualquier cambio.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Se ha producido un error al intentar eliminar la categoría. Por favor, inténtalo más tarde.',
            createFailureMessage: 'Se ha producido un error al intentar crear la categoría. Por favor, inténtalo más tarde.',
            addCategory: 'Añadir categoría',
            editCategory: 'Editar categoría',
            editCategories: 'Editar categorías',
            findCategory: 'Encontrar categoría',
            categoryRequiredError: 'Lo nombre de la categoría es obligatorio',
            existingCategoryError: 'Ya existe una categoría con este nombre',
            invalidCategoryName: 'Lo nombre de la categoría es invalido',
            importedFromAccountingSoftware: 'Categorías importadas desde',
            payrollCode: 'Código de nómina',
            updatePayrollCodeFailureMessage: 'Se produjo un error al actualizar el código de nómina, por favor intente nuevamente',
            glCode: 'Código de Libro Mayor',
            updateGLCodeFailureMessage: 'Se produjo un error al actualizar el código de Libro Mayor. Inténtelo nuevamente.',
            importCategories: 'Importar categorías',
            cannotDeleteOrDisableAllCategories: {
                title: 'No se pueden eliminar ni deshabilitar todas las categorías',
                description: `Debe quedar al menos una categoría habilitada porque tu espacio de trabajo requiere categorías.`,
            },
        },
        moreFeatures: {
            subtitle: 'Utiliza los botones de abajo para activar más funciones a medida que creces. Cada función aparecerá en el menú de navegación para una mayor personalización.',
            spendSection: {
                title: 'Gasto',
                subtitle: 'Habilita otras funcionalidades que ayudan a aumentar tu equipo.',
            },
            manageSection: {
                title: 'Gestionar',
                subtitle: 'Añade controles que ayudan a mantener los gastos dentro del presupuesto.',
            },
            earnSection: {
                title: 'Gane',
                subtitle: 'Agiliza tus ingresos y recibe pagos más rápido.',
            },
            organizeSection: {
                title: 'Organizar',
                subtitle: 'Agrupa y analiza el gasto, registra cada impuesto pagado.',
            },
            integrateSection: {
                title: 'Integrar',
                subtitle: 'Conecta Expensify a otros productos financieros populares.',
            },
            distanceRates: {
                title: 'Tasas de distancia',
                subtitle: 'Añade, actualiza y haz cumplir las tasas.',
            },
            perDiem: {
                title: 'Per diem',
                subtitle: 'Establece las tasas per diem para controlar los gastos diarios de los empleados.',
            },
            travel: {
                title: 'Viajes',
                subtitle: 'Reserva, gestiona y concilia todos tus viajes de negocios.',
                getStarted: {
                    title: 'Comienza con Expensify Travel',
                    subtitle: 'Solo necesitamos algunos datos más sobre tu empresa y estarás listo para despegar.',
                    ctaText: 'Vamos allá',
                },
                reviewingRequest: {
                    title: 'Prepara las maletas, tenemos tu solicitud...',
                    subtitle: 'Estamos revisando tu solicitud para habilitar Expensify Travel. No te preocupes, te avisaremos cuando esté listo.',
                    ctaText: 'Solicitud enviada',
                },
                bookOrManageYourTrip: {
                    title: 'Reserva o gestiona tu viaje',
                    subtitle: 'Usa Expensify Travel para obtener las mejores ofertas de viaje y gestionar todos tus gastos de empresa en un solo lugar.',
                    ctaText: 'Reservar o gestionar',
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: 'Reserva de viajes',
                        subtitle: '¡Felicidades! Todo está listo para reservar y gestionar viajes en este espacio de trabajo.',
                        manageTravelLabel: 'Gestionar viajes',
                    },
                    centralInvoicingSection: {
                        title: 'Facturación centralizada',
                        subtitle: 'Centraliza todos los gastos de viaje en una factura mensual en lugar de pagar en el momento de la compra.',
                        learnHow: 'Aprende cómo.',
                        subsections: {
                            currentTravelSpendLabel: 'Gasto actual en viajes',
                            currentTravelSpendCta: 'Pagar saldo',
                            currentTravelLimitLabel: 'Límite actual de viajes',
                            settlementAccountLabel: 'Cuenta de liquidación',
                            settlementFrequencyLabel: 'Frecuencia de liquidación',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Tarjeta Expensify',
                subtitle: 'Obtén información y control sobre tus gastos.',
                disableCardTitle: 'Deshabilitar la Tarjeta Expensify',
                disableCardPrompt: 'No puedes deshabilitar la Tarjeta Expensify porque ya está en uso. Por favor, contacta con Concierge para conocer los pasos a seguir.',
                disableCardButton: 'Chatear con Concierge',
                feed: {
                    title: 'Consigue la Tarjeta Expensify',
                    subTitle: 'Simplifica los gastos de tu empresa y ahorra hasta un 50 % en tu factura de Expensify, además:',
                    features: {
                        cashBack: 'Devolución de dinero en cada compra en Estados Unidos',
                        unlimited: 'Un número ilimitado de tarjetas virtuales',
                        spend: 'Controles de gastos y límites personalizados',
                    },
                    ctaTitle: 'Emitir nueva tarjeta',
                },
            },
            companyCards: {
                title: 'Tarjetas de empresa',
                subtitle: 'Conecta las tarjetas que ya tienes.',
                feed: {
                    title: 'Trae tus propias tarjetas (BYOC)',
                    subtitle: 'Vincula las tarjetas que ya tienes para la importación automática de transacciones, coincidencia de recibos y conciliación.',
                    features: {
                        support: 'Conecta tarjetas de más de 10,000 bancos',
                        assignCards: 'Vincula las tarjetas existentes de tu equipo',
                        automaticImport: 'Importaremos las transacciones automáticamente',
                    },
                },
                bankConnectionError: 'Problema de conexión bancaria',
                connectWithPlaid: 'Conectarse a través de Plaid',
                connectWithExpensifyCard: 'Pruebe la tarjeta Expensify',
                bankConnectionDescription: 'Intente agregar sus tarjetas de nuevo. De lo contrario, puede',
                disableCardTitle: 'Deshabilitar tarjetas de empresa',
                disableCardPrompt: 'No puedes deshabilitar las tarjetas de empresa porque esta función está en uso. Por favor, contacta a Concierge para los próximos pasos.',
                disableCardButton: 'Chatear con Concierge',
                cardDetails: 'Datos de la tarjeta',
                cardNumber: 'Número de la tarjeta',
                cardholder: 'Titular de la tarjeta',
                cardName: 'Nombre de la tarjeta',
                allCards: 'Todas las tarjetas',
                assignedCards: 'Asignadas',
                unassignedCards: 'No asignadas',
                integrationExport: ({integration, type}) => (integration && type ? `Exportación a ${integration} ${type.toLowerCase()}` : `Exportación a ${integration}`),
                integrationExportTitleXero: ({integration}) => `Seleccione la cuenta ${integration} donde se deben exportar las transacciones.`,
                integrationExportTitle: ({integration, exportPageLink}) =>
                    `Seleccione la cuenta ${integration} donde se deben exportar las transacciones. Seleccione una cuenta diferente <a href="${exportPageLink}">opción de exportación</a> para cambiar las cuentas disponibles.`,
                lastUpdated: 'Última actualización',
                transactionStartDate: 'Fecha de inicio de transacciones',
                updateCard: 'Actualizar tarjeta',
                unassignCard: 'Desasignar tarjeta',
                unassign: 'Desasignar',
                unassignCardDescription: 'Desasignar esta tarjeta eliminará todas las transacciones en informes en borrador de la cuenta del titular.',
                assignCard: 'Asignar tarjeta',
                cardFeedName: 'Nombre del feed de tarjeta',
                cardFeedNameDescription: 'Dale al feed de tarjeta un nombre único para que puedas distinguirlo de los demás.',
                cardFeedTransaction: 'Eliminar transacciones',
                cardFeedTransactionDescription: 'Elige si los titulares de tarjetas pueden eliminar transacciones de tarjetas. Las nuevas transacciones seguirán estas reglas.',
                cardFeedRestrictDeletingTransaction: 'Restringir eliminación de transacciones',
                cardFeedAllowDeletingTransaction: 'Permitir eliminación de transacciones',
                removeCardFeed: 'Quitar la alimentación de tarjetas',
                removeCardFeedTitle: (feedName) => `Eliminar el feed de ${feedName}`,
                removeCardFeedDescription: '¿Estás seguro de que deseas eliminar esta fuente de tarjetas? Esto anulará la asignación de todas las tarjetas.',
                error: {
                    feedNameRequired: 'Se requiere el nombre de la fuente de la tarjeta',
                    statementCloseDateRequired: 'Por favor, selecciona una fecha de cierre del estado de cuenta.',
                },
                corporate: 'Restringir eliminación de transacciones',
                personal: 'Permitir eliminación de transacciones',
                setFeedNameDescription: 'Dale al feed de tarjeta un nombre único para que puedas distinguirlo de los demás',
                setTransactionLiabilityDescription:
                    'Cuando está habilitada, los titulares de tarjetas pueden eliminar transacciones con tarjeta. Las transacciones nuevas seguirán esta regla.',
                emptyAddedFeedTitle: 'Asignar tarjetas de empresa',
                emptyAddedFeedDescription: 'Comienza asignando tu primera tarjeta a un miembro.',
                pendingFeedTitle: `Estamos revisando tu solicitud...`,
                pendingFeedDescription: `Actualmente estamos revisando los detalles de tu feed. Una vez hecho esto, nos pondremos en contacto contigo a través de`,
                pendingBankTitle: 'Comprueba la ventana de tu navegador',
                pendingBankDescription: (bankName) => `Conéctese a ${bankName} a través de la ventana del navegador que acaba de abrir. Si no se abrió, `,
                pendingBankLink: 'por favor haga clic aquí',
                giveItNameInstruction: 'Nombra la tarjeta para distingirla de las demás.',
                updating: 'Actualizando...',
                neverUpdated: 'Nunca',
                noAccountsFound: 'No se han encontrado cuentas',
                defaultCard: 'Tarjeta predeterminada',
                downgradeTitle: 'No se puede degradar el espacio de trabajo',
                downgradeSubTitle: `No es posible cambiar a una versión inferior de este espacio de trabajo porque hay varias fuentes de tarjetas conectadas (excluidas las tarjetas Expensify). Por favor <a href="#">mantenga solo una tarjeta</a> para continuar.`,
                noAccountsFoundDescription: (connection) => `Añade la cuenta en ${connection} y sincroniza la conexión de nuevo`,
                expensifyCardBannerTitle: 'Obtén la Tarjeta Expensify',
                expensifyCardBannerSubtitle:
                    'Disfruta de una devolución en cada compra en Estados Unidos, hasta un 50% de descuento en tu factura de Expensify, tarjetas virtuales ilimitadas y mucho más.',
                expensifyCardBannerLearnMoreButton: 'Más información',
                statementCloseDateTitle: 'Fecha de cierre del estado de cuenta',
                statementCloseDateDescription: 'Indícanos cuándo cierra el estado de cuenta de tu tarjeta y crearemos uno correspondiente en Expensify.',
            },
            workflows: {
                title: 'Flujos de trabajo',
                subtitle: 'Configura cómo se aprueba y paga los gastos.',
                disableApprovalPrompt:
                    'Las Tarjetas Expensify de este espacio de trabajo dependen actualmente de la aprobación para definir sus Límites Inteligentes. Por favor, modifica los tipos de límite de cualquier Tarjeta Expensify con Límites Inteligentes antes de deshabilitar las aprobaciones.',
            },
            invoices: {
                title: 'Facturas',
                subtitle: 'Enviar y recibir facturas.',
            },
            categories: {
                title: 'Categorías',
                subtitle: 'Monitoriza y organiza los gastos.',
            },
            tags: {
                title: 'Etiquetas',
                subtitle: 'Clasifica costes y rastrea gastos facturables.',
            },
            taxes: {
                title: 'Impuestos',
                subtitle: 'Documenta y reclama los impuestos aplicables.',
            },
            reportFields: {
                title: 'Campos de informes',
                subtitle: 'Configura campos personalizados para los gastos.',
            },
            connections: {
                title: 'Contabilidad',
                subtitle: 'Sincroniza tu plan de cuentas y otras opciones.',
            },
            receiptPartners: {
                title: 'Socios de recibos',
                subtitle: 'Importación automática de recibos.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'No tan rápido...',
                featureEnabledText: 'Para activar o desactivar esta función, cambia la configuración de importación contable.',
                disconnectText: 'Para desactivar la contabilidad, desconecta tu conexión contable del espacio de trabajo.',
                manageSettings: 'Gestionar la configuración',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Desconectar Uber',
                disconnectText: 'Para desactivar esta función, desconecta primero la integración de Uber for Business.',
                description: '¿Está seguro de que desea desconectar esta integración?',
                confirmText: 'Entendido',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'No tan rápido...',
                featureEnabledText:
                    'Las Tarjetas Expensify de este espacio de trabajo dependen actualmente de la aprobación para definir sus Límites Inteligentes.\n\nPor favor, modifica los tipos de límite de cualquier Tarjeta Expensify con Límites Inteligentes antes de deshabilitar las flujos de trabajo.',
                confirmText: 'Ir a Tarjeta Expensify',
            },
            rules: {
                title: 'Reglas',
                subtitle: 'Solicita recibos, resalta gastos de alto importe y mucho más.',
            },
            timeTracking: {
                title: 'Tiempo',
                subtitle: 'Establecer una tarifa por hora facturable para el seguimiento de tiempo.',
                defaultHourlyRate: 'Tarifa por hora predeterminada',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Ejemplos:',
            customReportNamesSubtitle: `<muted-text>Personaliza los títulos de los informes usando nuestras <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">amplias fórmulas</a>.</muted-text>`,
            customNameTitle: 'Título de informe predeterminado',
            customNameDescription: `Elige un nombre personalizado para los informes de gastos usando nuestras <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">fórmulas variadas</a>.`,
            customNameInputLabel: 'Nombre',
            customNameEmailPhoneExample: 'Correo electrónico o teléfono del miembro: {report:submit:from}',
            customNameStartDateExample: 'Fecha de inicio del informe: {report:startdate}',
            customNameWorkspaceNameExample: 'Nombre del espacio de trabajo: {report:workspacename}',
            customNameReportIDExample: 'ID del informe: {report:id}',
            customNameTotalExample: 'Total: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Evitar que los miembros cambien los nombres personalizados de los informes',
        },
        reportFields: {
            addField: 'Añadir campo',
            delete: 'Eliminar campo',
            deleteFields: 'Eliminar campos',
            findReportField: 'Encontrar campo del informe',
            deleteConfirmation: '¿Está seguro de que desea eliminar este campo del informe?',
            deleteFieldsConfirmation: '¿Está seguro de que desea eliminar estos campos del informe?',
            emptyReportFields: {
                title: 'No has creado ningún campo de informe',
                subtitle: 'Añade un campo personalizado (texto, fecha o desplegable) que aparezca en los informes.',
            },
            subtitle: 'Los campos de informe se aplican a todos los gastos y pueden ser útiles cuando quieras solicitar información adicional.',
            disableReportFields: 'Desactivar campos de informe',
            disableReportFieldsConfirmation: 'Estás seguro? Se eliminarán los campos de texto y fecha y se desactivarán las listas.',
            importedFromAccountingSoftware: 'Campos de informes importadas desde',
            textType: 'Texto',
            dateType: 'Fecha',
            dropdownType: 'Lista',
            formulaType: 'Fórmula',
            textAlternateText: 'Añade un campo para introducir texto libre.',
            dateAlternateText: 'Añade un calendario para la selección de fechas.',
            dropdownAlternateText: 'Añade una lista de opciones para elegir.',
            formulaAlternateText: 'Añade un campo con una fórmula.',
            nameInputSubtitle: 'Elige un nombre para el campo del informe.',
            typeInputSubtitle: 'Elige qué tipo de campo de informe utilizar.',
            initialValueInputSubtitle: 'Ingresa un valor inicial para mostrar en el campo del informe.',
            listValuesInputSubtitle: 'Estos valores aparecerán en el desplegable del campo de tu informe. Los miembros pueden seleccionar los valores habilitados.',
            listInputSubtitle: 'Estos valores aparecerán en la lista de campos de tu informe. Los miembros pueden seleccionar los valores habilitados.',
            deleteValue: 'Eliminar valor',
            deleteValues: 'Eliminar valores',
            disableValue: 'Desactivar valor',
            disableValues: 'Desactivar valores',
            enableValue: 'Habilitar valor',
            enableValues: 'Habilitar valores',
            emptyReportFieldsValues: {
                title: 'No has creado ningún valor en la lista',
                subtitle: 'Añade valores personalizados para que aparezcan en los informes.',
            },
            deleteValuePrompt: '¿Estás seguro de que quieres eliminar este valor de la lista?',
            deleteValuesPrompt: '¿Estás seguro de que quieres eliminar estos valores de la lista?',
            listValueRequiredError: 'Ingresa un nombre para el valor de la lista',
            existingListValueError: 'Ya existe un valor en la lista con este nombre',
            editValue: 'Editar valor',
            listValues: 'Valores de la lista',
            addValue: 'Añade valor',
            existingReportFieldNameError: 'Ya existe un campo de informe con este nombre',
            reportFieldNameRequiredError: 'Ingresa un nombre de campo de informe',
            reportFieldTypeRequiredError: 'Elige un tipo de campo de informe',
            circularReferenceError: 'Este campo no puede hacer referencia a sí mismo. Por favor, actualizar.',
            reportFieldInitialValueRequiredError: 'Elige un valor inicial de campo de informe',
            genericFailureMessage: 'Se ha producido un error al actualizar el campo de informe. Por favor, inténtalo de nuevo.',
        },
        tags: {
            tagName: 'Nombre de etiqueta',
            requiresTag: 'Los miembros deben etiquetar todos los gastos',
            trackBillable: 'Permitir marcar gastos como facturables',
            customTagName: 'Nombre de etiqueta personalizada',
            enableTag: 'Habilitar etiqueta',
            enableTags: 'Habilitar etiquetas',
            requireTag: 'Requerir etiqueta',
            requireTags: 'Requerir etiquetas',
            notRequireTags: 'No requerir etiquetas',
            disableTag: 'Desactivar etiqueta',
            disableTags: 'Desactivar etiquetas',
            addTag: 'Añadir etiqueta',
            editTag: 'Editar etiqueta',
            editTags: 'Editar etiquetas',
            findTag: 'Encontrar etiquetas',
            subtitle: 'Las etiquetas añaden formas más detalladas de clasificar los costos.',
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink) =>
                `<muted-text>Estás usando <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">etiquetas dependientes</a>. Puedes <a href="${importSpreadsheetLink}">reimportar una hoja de cálculo</a> para actualizar tus etiquetas.</muted-text>`,
            emptyTags: {
                title: 'No has creado ninguna etiqueta',
                subtitle: 'Añade una etiqueta para realizar el seguimiento de proyectos, ubicaciones, departamentos y otros.',
                subtitleHTML: `<muted-text><centered-text>Importa una hoja de cálculo para añadir etiquetas y organizar proyectos, ubicaciones, departamentos y más. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Obtén más información</a> sobre cómo dar formato a los archivos de etiquetas.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL) =>
                    `<muted-text><centered-text>Tus etiquetas se están importando actualmente desde una conexión de contabilidad. Dirígete a <a href="${accountingPageURL}">contabilidad</a> para hacer cualquier cambio.</centered-text></muted-text>`,
            },
            deleteTag: 'Eliminar etiqueta',
            deleteTags: 'Eliminar etiquetas',
            deleteTagConfirmation: '¿Estás seguro de que quieres eliminar esta etiqueta?',
            deleteTagsConfirmation: '¿Estás seguro de que quieres eliminar estas etiquetas?',
            deleteFailureMessage: 'Se ha producido un error al intentar eliminar la etiqueta. Por favor, inténtalo más tarde.',
            tagRequiredError: 'Lo nombre de la etiqueta es obligatorio',
            existingTagError: 'Ya existe una etiqueta con este nombre',
            invalidTagNameError: 'El nombre de la etiqueta no puede ser 0. Por favor, elige un valor diferente.',
            genericFailureMessage: 'Se ha producido un error al actualizar la etiqueta. Por favor, inténtelo nuevamente.',
            importedFromAccountingSoftware: 'Etiquetas importadas desde',
            glCode: 'Código de Libro Mayor',
            updateGLCodeFailureMessage: 'Se produjo un error al actualizar el código de Libro Mayor. Por favor, inténtelo nuevamente.',
            tagRules: 'Reglas de etiquetas',
            approverDescription: 'Aprobador',
            importTags: 'Importar categorías',
            importTagsSupportingText: 'Clasifica tus gastos con un tipo de etiqueta o con varios.',
            configureMultiLevelTags: 'Configura etiquetas multinivel',
            importMultiLevelTagsSupportingText: `Aquí tienes una vista previa de tus etiquetas. Si todo se ve bien, haz clic abajo para importarlas.`,
            importMultiLevelTags: {
                firstRowTitle: 'La primera fila es el título de cada lista de etiquetas',
                independentTags: 'Estas son etiquetas independientes',
                glAdjacentColumn: 'Hay un código GL en la columna adyacente',
            },
            tagLevel: {
                singleLevel: 'Nivel único de etiquetas',
                multiLevel: 'Etiquetas multinivel',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Cambiar niveles de etiquetas',
                prompt1: 'Cambiar el nivel de etiquetas eliminará todas las etiquetas actuales.',
                prompt2: ' Te recomendamos primero',
                prompt3: ' descargar una copia de seguridad',
                prompt4: ' exportando tus etiquetas.',
                prompt5: ' Aprende más',
                prompt6: ' sobre los niveles de etiquetas.',
            },
            overrideMultiTagWarning: {
                title: 'Importar etiquetas',
                prompt1: '¿Estás seguro?',
                prompt2: ' Las etiquetas existentes se sobrescribirán, pero puedes',
                prompt3: ' descargar una copia de seguridad',
                prompt4: ' primero.',
            },
            importedTagsMessage: (columnCounts) =>
                `Hemos encontrado *${columnCounts} columnas* en su hoja de cálculo. Seleccione *Nombre* junto a la columna que contiene los nombres de las etiquetas. También puede seleccionar *Habilitado* junto a la columna que establece el estado de la etiqueta.`,
            cannotDeleteOrDisableAllTags: {
                title: 'No se pueden eliminar ni deshabilitar todas las etiquetas',
                description: `Debe quedar al menos una etiqueta habilitada porque tu espacio de trabajo requiere etiquetas.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'No se pueden hacer opcionales todas las etiquetas',
                description: `Debe haber al menos una etiqueta obligatoria porque la configuración de tu espacio de trabajo requiere etiquetas.`,
            },
            cannotMakeTagListRequired: {
                title: 'No se puede hacer que la lista de etiquetas sea obligatoria',
                description: 'Solo puedes hacer que una lista de etiquetas sea obligatoria si tu política tiene varios niveles de etiquetas configurados.',
            },
            tagCount: () => ({
                one: '1 etiqueta',
                other: (count: number) => `${count} etiquetas`,
            }),
        },
        taxes: {
            subtitle: 'Añade nombres, tasas y establezca valores por defecto para los impuestos.',
            addRate: 'Añadir tasa',
            workspaceDefault: 'Moneda por defecto del espacio de trabajo',
            foreignDefault: 'Moneda extranjera por defecto',
            customTaxName: 'Nombre del impuesto',
            value: 'Valor',
            taxRate: 'Tasa de impuesto',
            findTaxRate: 'Encontrar tasa de impuesto',
            taxReclaimableOn: 'Impuesto recuperable en',
            error: {
                taxRateAlreadyExists: 'Ya existe un impuesto con este nombre',
                taxCodeAlreadyExists: 'Ya existe un código de impuesto con este nombre',
                customNameRequired: 'El nombre del impuesto es obligatorio',
                valuePercentageRange: 'Por favor, introduce un porcentaje entre 0 y 100',
                deleteFailureMessage: 'Se ha producido un error al intentar eliminar la tasa de impuesto. Por favor, inténtalo más tarde.',
                updateFailureMessage: 'Se ha producido un error al intentar modificar la tasa de impuesto. Por favor, inténtalo más tarde.',
                createFailureMessage: 'Se ha producido un error al intentar crear la tasa de impuesto. Por favor, inténtalo más tarde.',
                updateTaxClaimableFailureMessage: 'La porción recuperable debe ser menor al monto del importe por distancia',
            },
            deleteTaxConfirmation: '¿Estás seguro de que quieres eliminar este impuesto?',
            deleteMultipleTaxConfirmation: ({taxAmount}) => `¿Estás seguro de que quieres eliminar ${taxAmount} impuestos?`,
            actions: {
                delete: 'Eliminar tasa',
                deleteMultiple: 'Eliminar tasas',
                enable: 'Activar tasa',
                disable: 'Desactivar tasa',
                enableTaxRates: () => ({
                    one: 'Activar tasa',
                    other: 'Activar tasas',
                }),
                disableTaxRates: () => ({
                    one: 'Desactivar tasa',
                    other: 'Desactivar tasas',
                }),
            },
            importedFromAccountingSoftware: 'Impuestos importadas desde',
            taxCode: 'Código de impuesto',
            updateTaxCodeFailureMessage: 'Se produjo un error al actualizar el código tributario, inténtelo nuevamente',
        },
        duplicateWorkspace: {
            title: 'Nombra tu nuevo espacio de trabajo',
            selectFeatures: 'Selecciona las funciones a copiar',
            whichFeatures: '¿Qué funciones deseas copiar a tu nuevo espacio de trabajo?',
            confirmDuplicate: '\n\n¿Quieres continuar?',
            categories: 'categorías y tus reglas de auto-categorización',
            reimbursementAccount: 'cuenta de reembolso',
            delayedSubmission: 'presentación retrasada',
            welcomeNote: 'Por favor, comience a utilizar mi nuevo espacio de trabajo.',
            confirmTitle: ({newWorkspaceName, totalMembers}) =>
                `Estás a punto de crear y compartir ${newWorkspaceName ?? ''} con ${totalMembers ?? 0} miembros del espacio de trabajo original.`,
            error: 'Se produjo un error al duplicar tu nuevo espacio de trabajo. Inténtalo de nuevo.',
        },
        emptyWorkspace: {
            title: 'No tienes espacios de trabajo',
            subtitle: 'Organiza recibos, reembolsa gastos, gestiona viajes, envía facturas y mucho más.',
            createAWorkspaceCTA: 'Comenzar',
            features: {
                trackAndCollect: 'Organiza recibos',
                reimbursements: 'Reembolsa a los empleados',
                companyCards: 'Gestiona tarjetas de la empresa',
            },
            notFound: 'No se encontró ningún espacio de trabajo',
            description: 'Las salas son un gran lugar para discutir y trabajar con varias personas. Para comenzar a colaborar, cree o únase a un espacio de trabajo',
        },
        new: {
            newWorkspace: 'Nuevo espacio de trabajo',
            getTheExpensifyCardAndMore: 'Consigue la Tarjeta Expensify y más',
            confirmWorkspace: 'Confirmar espacio de trabajo',
            myGroupWorkspace: ({workspaceNumber}) => `Mi Espacio de Trabajo en Grupo${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}) => `Espacio de trabajo${workspaceNumber ? ` ${workspaceNumber}` : ''} de ${userName}`,
        },
        people: {
            genericFailureMessage: 'Se ha producido un error al intentar eliminar a un miembro del espacio de trabajo. Por favor, inténtalo más tarde.',
            removeMembersPrompt: ({memberName}) => ({
                one: `¿Estás seguro de que deseas eliminar ${memberName}`,
                other: '¿Estás seguro de que deseas eliminar a estos miembros?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}) =>
                `${memberName} es un aprobador en este espacio de trabajo. Cuando lo elimine de este espacio de trabajo, los sustituiremos en el flujo de trabajo de aprobación por el propietario del espacio de trabajo, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Eliminar miembro',
                other: 'Eliminar miembros',
            }),
            findMember: 'Encontrar miembro',
            removeWorkspaceMemberButtonTitle: 'Eliminar del espacio de trabajo',
            removeGroupMemberButtonTitle: 'Eliminar del grupo',
            removeRoomMemberButtonTitle: 'Eliminar del chat',
            removeMemberPrompt: ({memberName}) => `¿Estás seguro de que deseas eliminar a ${memberName}?`,
            removeMemberTitle: 'Eliminar miembro',
            transferOwner: 'Transferir la propiedad',
            makeMember: () => ({
                one: 'Convertir en miembro',
                other: 'Convertir en miembros',
            }),
            makeAdmin: () => ({
                one: 'Hacer administrador',
                other: 'Convertir en administradores',
            }),
            makeAuditor: () => ({
                one: 'Convertir en auditor',
                other: 'Convertir en auditores',
            }),
            selectAll: 'Seleccionar todo',
            error: {
                genericAdd: 'Ha ocurrido un problema al añadir el miembro al espacio de trabajo',
                cannotRemove: 'No puedes eliminarte ni a ti mismo ni al dueño del espacio de trabajo',
                genericRemove: 'Ha ocurrido un problema al eliminar al miembro del espacio de trabajo',
            },
            addedWithPrimary: 'Se agregaron algunos miembros con sus nombres de usuario principales.',
            invitedBySecondaryLogin: ({secondaryLogin}) => `Agregado por nombre de usuario secundario ${secondaryLogin}.`,
            workspaceMembersCount: ({count}) => `Total de miembros del espacio de trabajo: ${count}`,
            importMembers: 'Importar miembros',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Si eliminas a ${approver} de este espacio de trabajo, lo reemplazaremos en el flujo de aprobación por ${workspaceOwner}, el propietario del espacio de trabajo.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `No puedes eliminar a ${memberName} de este espacio de trabajo. Por favor, establece un nuevo reembolsador en Flujos de trabajo > Realizar o rastrear pagos y vuelve a intentarlo.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Si eliminas a ${memberName} de este espacio de trabajo, lo reemplazaremos como el exportador preferido por ${workspaceOwner}, el propietario del espacio de trabajo.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Si eliminas a ${memberName} de este espacio de trabajo, lo reemplazaremos como contacto técnico por ${workspaceOwner}, el propietario del espacio de trabajo.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} tiene gastos pendientes por aprobar. Por favor, pídeles que aprueben o tomen el control de sus informes antes de eliminarlos del espacio de trabajo.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} tiene un informe en proceso pendiente de acción. Pídele que complete la acción requerida antes de eliminarlo del espacio de trabajo.`,
        },
        accounting: {
            settings: 'configuración',
            title: 'Conexiones',
            subtitle: 'Conecta a tu sistema de contabilidad para codificar transacciones con tu plan de cuentas, auto-cotejar pagos, y mantener tus finanzas sincronizadas.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Chatea con tu especialista asignado.',
            talkYourAccountManager: 'Chatea con tu gestor de cuenta.',
            talkToConcierge: 'Chatear con Concierge.',
            needAnotherAccounting: '¿Necesitas otro software de contabilidad? ',
            connectionName: ({connectionName}) => {
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
            errorODIntegration: (oldDotPolicyConnectionsURL) =>
                `Hay un error con una conexión que se ha configurado en Expensify Classic. [Ve a Expensify Classic para solucionar este problema.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: 'Ve a Expensify Classic para gestionar tus configuraciones.',
            setup: 'Configurar',
            lastSync: ({relativeDate}) => `Recién sincronizado ${relativeDate}`,
            notSync: 'No sincronizado',
            import: 'Importar',
            export: 'Exportar',
            advanced: 'Avanzado',
            other: 'Otro',
            syncNow: 'Sincronizar ahora',
            disconnect: 'Desconectar',
            reinstall: 'Reinstalar el conector',
            disconnectTitle: ({connectionName} = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integración';
                return `Desconectar ${integrationName}`;
            },
            connectTitle: ({connectionName}) => `Conectar ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'accounting integration'}`,
            syncError: ({connectionName}) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'No se puede conectar a QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'No se puede conectar a Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'No se puede conectar a NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'No se puede conectar a QuickBooks Desktop';
                    default: {
                        return 'No se ha podido conectar a la integración';
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
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Predeterminado del empleado NetSuite',
            },
            disconnectPrompt: ({connectionName} = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integración';
                return `¿Estás seguro de que quieres desconectar ${integrationName}?`;
            },
            connectPrompt: ({connectionName}) =>
                `¿Estás seguro de que quieres conectar a ${
                    CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'esta integración contable'
                }? Esto eliminará cualquier conexión contable existente.`,
            enterCredentials: 'Ingresa tus credenciales',
            claimOffer: {
                badgeText: '¡Oferta disponible!',
                xero: {
                    headline: '¡Obtén Xero gratis por 6 meses!',
                    description:
                        '<muted-text><centered-text>¿Nuevo en Xero? Los clientes de Expensify obtienen 6 meses gratis. Reclama tu oferta a continuación.</centered-text></muted-text>',
                    connectButton: 'Conectar con Xero',
                },
                uber: {
                    headerTitle: 'Uber for Business',
                    headline: 'Obtén 5% de descuento en viajes de Uber',
                    description: `<muted-text><centered-text>Activa Uber for Business a través de Expensify y ahorra 5% en todos los viajes de negocios hasta junio. <a href="${CONST.UBER_TERMS_LINK}">Aplican términos.</a></centered-text></muted-text>`,
                    connectButton: 'Conectar con Uber for Business',
                },
            },
            connections: {
                syncStageName: ({stage}) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Importando clientes';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return 'Importando empleados';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Importando cuentas';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Importando clases';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importando localidades';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Procesando datos importados';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Sincronizando reportes reembolsados y facturas pagadas';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importando tipos de impuestos';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Revisando conexión a QuickBooks Online';
                        case 'quickbooksOnlineImportMain':
                            return 'Importando datos desde QuickBooks Online';
                        case 'startingImportXero':
                            return 'Importando datos desde Xero';
                        case 'startingImportQBO':
                            return 'Importando datos desde QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importando datos desde QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importando título';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importando certificado de aprobación';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importando dimensiones';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importando política de guardado';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Aún sincronizando datos con QuickBooks... Por favor, asegúrate de que el Conector Web esté en funcionamiento';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Sincronizando datos desde QuickBooks Online';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Cargando datos';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Actualizando categorías';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Actualizando clientes/proyectos';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Actualizando empleados';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Actualizando clases';
                        case 'jobDone':
                            return 'Esperando a que se carguen los datos importados';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Sincronizando plan de cuentas';
                        case 'xeroSyncImportCategories':
                            return 'Sincronizando categorias';
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
                            return 'Sincronizando las tasas de impuesto';
                        case 'xeroCheckConnection':
                            return 'Comprobando la conexión a Xero';
                        case 'xeroSyncTitle':
                            return 'Sincronizando los datos de Xero';
                        case 'netSuiteSyncConnection':
                            return 'Iniciando conexión a NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Importando clientes';
                        case 'netSuiteSyncInitData':
                            return 'Recuperando datos de NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Importando impuestos';
                        case 'netSuiteSyncImportItems':
                            return 'Importando artículos';
                        case 'netSuiteSyncData':
                            return 'Importando datos a Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Sincronizando cuentas';
                        case 'netSuiteSyncCurrencies':
                            return 'Sincronizando divisas';
                        case 'netSuiteSyncCategories':
                            return 'Sincronizando categorías';
                        case 'netSuiteSyncReportFields':
                            return 'Importando datos como campos de informe de Expensify';
                        case 'netSuiteSyncTags':
                            return 'Importando datos como etiquetas de Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Actualizando información de conexión';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Marcando informes de Expensify como reembolsados';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importando listas personalizadas';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importando subsidiarias';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importando proveedores';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Marcando facturas y recibos de NetSuite como pagados';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importando proveedores';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importando listas personalizadas';
                        case 'intacctCheckConnection':
                            return 'Comprobando la conexión a Sage Intacct';
                        case 'intacctImportDimensions':
                            return 'Importando dimensiones';
                        case 'intacctImportTitle':
                            return 'Importando datos desde Sage Intacct';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Translation missing for stage: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Exportador preferido',
            exportPreferredExporterNote:
                'Puede ser cualquier administrador del espacio de trabajo, pero debe ser un administrador de dominio si configura diferentes cuentas de exportación para tarjetas de empresa individuales en la configuración del dominio.',
            exportPreferredExporterSubNote: 'Una vez configurado, el exportador preferido verá los informes para exportar en tu cuenta.',
            exportAs: 'Exportar cómo',
            exportOutOfPocket: ' Exportar gastos por cuenta propia como',
            exportCompanyCard: 'Exportar gastos de la tarjeta de empresa como',
            exportDate: 'Fecha de exportación',
            defaultVendor: 'Proveedor predeterminado',
            autoSync: 'Autosincronización',
            autoSyncDescription: 'Sincroniza NetSuite y Expensify automáticamente, todos los días. Exporta el informe finalizado en tiempo real',
            reimbursedReports: 'Sincronizar informes reembolsados',
            cardReconciliation: 'Conciliación de tarjetas',
            reconciliationAccount: 'Cuenta de conciliación',
            continuousReconciliation: 'Conciliación continua',
            saveHoursOnReconciliation:
                'Ahorra horas de conciliación en cada período contable haciendo que Expensify concilie continuamente los extractos y liquidaciones de la Tarjeta Expensify en tu nombre.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink, connectionName) =>
                `<muted-text-label>Para activar la Conciliación Continua, activa la <a href="${accountingAdvancedSettingsLink}">auto-sync</a> para ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Elige la cuenta bancaria con la que se conciliarán los pagos de tu Tarjeta Expensify.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}) =>
                    `Asegúrate de que esta cuenta coincide con <a href="${settlementAccountUrl}">la cuenta de liquidación de tu Tarjeta Expensify</a> (que termina en ${lastFourPAN}) para que la conciliación continua funcione correctamente.`,
            },
        },
        card: {
            issueCard: 'Emitir tarjeta',
            getStartedIssuing: 'Empieza emitiendo tu primera tarjeta virtual o física.',
            issueNewCard: {
                whoNeedsCard: '¿Quién necesita una tarjeta?',
                inviteNewMember: 'Invitar nuevo miembro',
                findMember: 'Buscar miembro',
                chooseCardType: 'Elegir un tipo de tarjeta',
                physicalCard: 'Tarjeta física',
                physicalCardDescription: 'Ideal para los consumidores habituales',
                virtualCard: 'Tarjeta virtual',
                virtualCardDescription: 'Instantáneo y flexible',
                chooseLimitType: 'Elegir un tipo de límite',
                smartLimit: 'Límite inteligente',
                smartLimitDescription: 'Gasta hasta una determinada cantidad antes de requerir aprobación',
                monthly: 'Mensual',
                monthlyDescription: 'Gasta hasta una determinada cantidad al mes',
                fixedAmount: 'Cantidad fija',
                fixedAmountDescription: 'Gasta hasta una determinada cantidad una vez',
                cardLimitError: 'Por favor, introduce un monto menor a $21,474,836',
                setLimit: 'Establecer un límite',
                giveItName: 'Dale un nombre',
                giveItNameInstruction: 'Hazlo lo suficientemente único para distinguirla de otras tarjetas. ¡Los casos de uso específicos son aún mejores!',
                cardName: 'Nombre de la tarjeta',
                letsDoubleCheck: 'Vuelve a comprobar que todo parece correcto. ',
                willBeReadyToUse: 'Esta tarjeta estará lista para su uso inmediato.',
                willBeReadyToShip: 'Esta tarjeta estará lista para enviarse de inmediato.',
                cardholder: 'Titular de la tarjeta',
                cardType: 'Tipo de tarjeta',
                limit: 'Limite',
                limitType: 'Tipo de limite',
                disabledApprovalForSmartLimitError: 'Por favor, habilita las aprobaciones en <strong>Flujos de trabajo > Aprobaciones</strong> antes de configurar los límites inteligentes',
            },
            deactivateCardModal: {
                deactivate: 'Desactivar',
                deactivateCard: 'Desactivar tarjeta',
                deactivateConfirmation: 'Al desactivar esta tarjeta, se rechazarán todas las transacciones futuras y no se podrá deshacer.',
            },
        },

        export: {
            notReadyHeading: 'No está listo para exportar',
            notReadyDescription:
                'Los borradores o informes de gastos pendientes no se pueden exportar al sistema contabilidad. Por favor, apruebe o pague estos gastos antes de exportarlos.',
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
                business: 'Empresas',
                chooseInvoiceMethod: 'Elija un método de pago:',
                payingAsIndividual: 'Pago individual',
                payingAsBusiness: 'Pagar como una empresa',
            },
            invoiceBalance: 'Saldo de la factura',
            invoiceBalanceSubtitle: 'Este es tu saldo actual de la recaudación de pagos de facturas. Se transferirá automáticamente a tu cuenta bancaria si has agregado una.',
            bankAccountsSubtitle: 'Agrega una cuenta bancaria para hacer y recibir pagos de facturas.',
        },
        invite: {
            member: 'Invitar miembros',
            members: 'Invitar miembros',
            invitePeople: 'Invitar nuevos miembros',
            genericFailureMessage: 'Se ha producido un error al invitar al miembro al espacio de trabajo. Vuelva a intentarlo.',
            pleaseEnterValidLogin: `Asegúrese de que el correo electrónico o el número de teléfono sean válidos (p. ej. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'miembro',
            users: 'miembros',
            invited: 'invitó',
            removed: 'eliminó',
            to: 'a',
            from: 'de',
        },
        inviteMessage: {
            confirmDetails: 'Confirma los detalles',
            inviteMessagePrompt: '¡Añadir un mensaje para hacer tu invitación destacar!',
            personalMessagePrompt: 'Mensaje',
            inviteNoMembersError: 'Por favor, selecciona al menos un miembro a invitar.',
            genericFailureMessage: 'Se ha producido un error al invitar al miembro al espacio de trabajo. Por favor, vuelva a intentarlo.',
            joinRequest: ({user, workspaceName}) => `${user} solicitó unirse al espacio de trabajo ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ups! No tan rápido...',
            workspaceNeeds: 'Un espacio de trabajo necesita al menos una tasa de distancia activa.',
            distance: 'Distancia',
            centrallyManage: 'Gestiona centralizadamente las tasas, elige si contabilizar en millas o kilómetros, y define una categoría por defecto',
            rate: 'Tasa',
            addRate: 'Agregar tasa',
            findRate: 'Encontrar tasa',
            trackTax: 'Impuesto de seguimiento',
            deleteRates: () => ({
                one: 'Eliminar tasa',
                other: 'Eliminar tasas',
            }),
            enableRates: () => ({
                one: 'Activar tasa',
                other: 'Activar tasas',
            }),
            disableRates: () => ({
                one: 'Desactivar tasa',
                other: 'Desactivar tasas',
            }),
            enableRate: 'Activar tasa',
            status: 'Estado',
            unit: 'Unidad',
            taxFeatureNotEnabledMessage:
                '<muted-text>Los impuestos deben estar activados en el área de trabajo para poder utilizar esta función. Dirígete a <a href="#">Más funcionalidades</a> para hacer ese cambio.</muted-text>',
            deleteDistanceRate: 'Eliminar tasa de distancia',
            areYouSureDelete: () => ({
                one: '¿Estás seguro de que quieres eliminar esta tasa?',
                other: '¿Estás seguro de que quieres eliminar estas tasas?',
            }),
            errors: {
                rateNameRequired: 'El nombre de la tasa es obligatorio',
                existingRateName: 'Ya existe una tasa de distancia con este nombre',
            },
        },
        editor: {
            nameInputLabel: 'Nombre',
            descriptionInputLabel: 'Descripción',
            typeInputLabel: 'Tipo',
            initialValueInputLabel: 'Valor inicial',
            nameInputHelpText: 'Este es el nombre que verás en tu espacio de trabajo.',
            nameIsRequiredError: 'Debes definir un nombre para tu espacio de trabajo',
            currencyInputLabel: 'Moneda por defecto',
            currencyInputHelpText: 'Todas los gastos en este espacio de trabajo serán convertidos a esta moneda.',
            currencyInputDisabledText: (currency) => `La moneda predeterminada no se puede cambiar porque este espacio de trabajo está vinculado a una cuenta bancaria en ${currency}.`,
            save: 'Guardar',
            genericFailureMessage: 'Se ha producido un error al guardar el espacio de trabajo. Por favor, inténtalo de nuevo.',
            avatarUploadFailureMessage: 'No se pudo subir el avatar. Por favor, inténtalo de nuevo.',
            addressContext: 'Se requiere una dirección para habilitar Expensify Travel. Por favor, introduce una dirección asociada con tu negocio.',
            policy: 'Política de gastos',
        },
        bankAccount: {
            continueWithSetup: 'Continuar con la configuración',
            youAreAlmostDone: 'Casi has acabado de configurar tu cuenta bancaria, que te permitirá emitir tarjetas corporativas, reembolsar gastos y cobrar pagar facturas.',
            streamlinePayments: 'Optimiza pagos',
            connectBankAccountNote: 'Nota: No se pueden usar cuentas bancarias personales para realizar pagos en los espacios de trabajo.',
            oneMoreThing: '¡Una cosa más!',
            allSet: '¡Todo listo!',
            accountDescriptionWithCards: 'Esta cuenta bancaria se utilizará para emitir tarjetas corporativas, reembolsar gastos y cobrar y pagar facturas.',
            letsFinishInChat: '¡Continuemos en el chat!',
            finishInChat: 'Continuemos en el chat',
            almostDone: '¡Casi listo!',
            disconnectBankAccount: 'Desconectar cuenta bancaria',
            startOver: 'Empezar de nuevo',
            updateDetails: 'Actualizar detalles',
            yesDisconnectMyBankAccount: 'Sí, desconecta mi cuenta bancaria',
            yesStartOver: 'Sí, empezar de nuevo',
            disconnectYourBankAccount: (bankName) => `Desconecta tu cuenta bancaria de <strong>${bankName}</strong>. Los reembolsos pendientes serán completados sin problemas.`,
            clearProgress: 'Empezar de nuevo descartará lo completado hasta ahora.',
            areYouSure: '¿Estás seguro?',
            workspaceCurrency: 'Moneda del espacio de trabajo',
            updateCurrencyPrompt:
                'Parece que tu espacio de trabajo está configurado actualmente en una moneda diferente a USD. Por favor, haz clic en el botón de abajo para actualizar tu moneda a USD ahora.',
            updateToUSD: 'Actualizar a USD',
            updateWorkspaceCurrency: 'Actualizar la moneda del espacio de trabajo',
            workspaceCurrencyNotSupported: 'Moneda del espacio de trabajo no soportada',
            yourWorkspace: `Tu espacio de trabajo está configurado en una moneda no soportada. Consulta la <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">lista de monedas soportadas</a>.`,
            chooseAnExisting: 'Elige una cuenta bancaria existente para pagar gastos o añade una nueva.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Transferir la propiedad',
            addPaymentCardTitle: 'Ingrese tu tarjeta de pago para transferir la propiedad',
            addPaymentCardButtonText: 'Aceptar términos y agregar tarjeta de pago',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Lea y acepte <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">los términos</a> y <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">la política de privacidad</a> para agregar tu tarjeta.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS obediente',
            addPaymentCardBankLevelEncrypt: 'Cifrado a nivel bancario',
            addPaymentCardRedundant: 'Infraestructura redundante',
            addPaymentCardLearnMore: `<muted-text>Conozca más sobre nuestra <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">seguridad</a>.</muted-text>`,
            amountOwedTitle: 'Saldo pendiente',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Esta cuenta tiene un saldo pendiente de un mes anterior.\n\n¿Quiere liquidar el saldo y hacerse cargo de la facturación de este espacio de trabajo?',
            ownerOwesAmountTitle: 'Saldo pendiente',
            ownerOwesAmountButtonText: 'Transferir saldo',
            ownerOwesAmountText: ({email, amount}) =>
                `La cuenta propietaria de este espacio de trabajo (${email}) tiene un saldo pendiente de un mes anterior.\n\n¿Desea transferir este monto (${amount}) para hacerse cargo de la facturación de este espacio de trabajo? tu tarjeta de pago se cargará inmediatamente.`,
            subscriptionTitle: 'Asumir la suscripción anual',
            subscriptionButtonText: 'Transferir suscripción',
            subscriptionText: (usersCount, finalCount) =>
                `Al hacerse cargo de este espacio de trabajo se fusionará tu suscripción anual asociada con tu suscripción actual. Esto aumentará el tamaño de tu suscripción en ${usersCount} miembros, lo que hará que tu nuevo tamaño de suscripción sea ${finalCount}. ¿Te gustaria continuar?`,
            duplicateSubscriptionTitle: 'Alerta de suscripción duplicada',
            duplicateSubscriptionButtonText: 'Continuar',
            duplicateSubscriptionText: (email, workspaceName) =>
                `Parece que estás intentando hacerte cargo de la facturación de los espacios de trabajo de ${email}, pero para hacerlo, primero debes ser administrador de todos sus espacios de trabajo.\n\nHaz clic en "Continuar" si solo quieres tomar sobrefacturación para el espacio de trabajo ${workspaceName}.\n\nSi desea hacerse cargo de la facturación de toda tu suscripción, pídales que lo agreguen como administrador a todos sus espacios de trabajo antes de hacerse cargo de la facturación.`,
            hasFailedSettlementsTitle: 'No se puede transferir la propiedad',
            hasFailedSettlementsButtonText: 'Entiendo',
            hasFailedSettlementsText: (email) =>
                `No puede hacerse cargo de la facturación porque ${email} tiene una liquidación vencida de la tarjeta Expensify. Avíseles que se comuniquen con concierge@expensify.com para resolver el problema. Luego, podrá hacerse cargo de la facturación de este espacio de trabajo.`,
            failedToClearBalanceTitle: 'Fallo al liquidar el saldo',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'No hemos podido liquidar el saldo, por favor, inténtalo más tarde.',
            successTitle: '¡Guau! Todo listo.',
            successDescription: 'Ahora eres el propietario de este espacio de trabajo.',
            errorTitle: '¡Ups! No tan rapido...',
            errorDescription: `<muted-text><centered-text>Hubo un problema al transferir la propiedad de este espacio de trabajo. Inténtalo de nuevo, o <concierge-link>contacta con Concierge</concierge-link> por ayuda.</centered-text></muted-text>`,
        },

        exportAgainModal: {
            title: '¡Cuidado!',
            description: ({reportName, connectionName}) =>
                `Los siguientes informes ya se han exportado a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:\n\n${reportName}\n\n¿Estás seguro de que deseas exportarlos de nuevo?`,
            confirmText: 'Sí, exportar de nuevo',
            cancelText: 'Cancelar',
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Recopilar',
                    description: 'Para equipos que buscan automatizar sus procesos.',
                },
                corporate: {
                    label: 'Controlar',
                    description: 'Para organizaciones con requisitos avanzados.',
                },
            },
            description: 'Elige el plan adecuado para ti. Para ver una lista detallada de funciones y precios, consulta nuestra',
            subscriptionLink: 'página de ayuda sobre tipos de planes y precios',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}) => ({
                one: `Tienes un compromiso anual de 1 miembro activo en el plan Controlar hasta el ${annualSubscriptionEndDate}. Puedes cambiar a una suscripción de pago por uso y desmejorar al plan Recopilar a partir del ${annualSubscriptionEndDate} desactivando la renovación automática en`,
                other: `Tienes un compromiso anual de ${count} miembros activos en el plan Controlar hasta el ${annualSubscriptionEndDate}. Puedes cambiar a una suscripción de pago por uso y desmejorar al plan Recopilar a partir del ${annualSubscriptionEndDate} desactivando la renovación automática en`,
            }),
            subscriptions: 'Suscripciones',
        },
        upgrade: {
            reportFields: {
                title: 'Los campos',
                description: `Los campos de informe permiten especificar detalles a nivel de cabecera, distintos de las etiquetas que pertenecen a los gastos en partidas individuales. Estos detalles pueden incluir nombres de proyectos específicos, información sobre viajes de negocios, ubicaciones, etc.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}) =>
                    `<muted-text>Los campos de informe sólo están disponibles en el plan Controlar, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Disfruta de la sincronización automática y reduce las entradas manuales con la integración Expensify + NetSuite. Obtén información financiera en profundidad y en tiempo real con la compatibilidad nativa y personalizada con segmentos, incluida la asignación de proyectos y clientes.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}) =>
                    `<muted-text>Nuestra integración NetSuite sólo está disponible en el plan Controlar, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Disfruta de una sincronización automatizada y reduce las entradas manuales con la integración Expensify + Sage Intacct. Obtén información financiera en profundidad y en tiempo real con dimensiones definidas por el usuario, así como codificación de gastos por departamento, clase, ubicación, cliente y proyecto (trabajo).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}) =>
                    `<muted-text>Nuestra integración Sage Intacct sólo está disponible en el plan Controlar, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Disfruta de la sincronización automática y reduce las entradas manuales con la integración de Expensify + QuickBooks Desktop. Obtén la máxima eficiencia con una conexión bidireccional en tiempo real y la codificación de gastos por clase, artículo, cliente y proyecto.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}) =>
                    `<muted-text>Nuestra integración con QuickBooks Desktop solo está disponible en el plan Controlar, que comienza en <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Aprobaciones anticipadas',
                description: `Si quieres añadir más niveles de aprobación, o simplemente asegurarte de que los gastos más importantes reciben otro vistazo, no hay problema. Las aprobaciones avanzadas ayudan a realizar las comprobaciones adecuadas a cada nivel para mantener los gastos de tu equipo bajo control.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}) =>
                    `<muted-text>Las aprobaciones avanzadas sólo están disponibles en el plan Controlar, con precios desde <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            categories: {
                title: 'Categorías',
                description: 'Las categorías te permiten rastrear y organizar gastos. Usa nuestras categorías predeterminadas o añade las tuyas propias.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}) =>
                    `<muted-text>Las categorías están disponibles en el plan Recopilar, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            glCodes: {
                title: 'Códigos de libro mayor',
                description: `Añada códigos de libro mayor a sus categorías para exportar fácilmente los gastos a sus sistemas de contabilidad y nómina.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}) =>
                    `<muted-text>Los códigos de libro mayor solo están disponibles en el plan Controlar, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Códigos de libro mayor y nómina',
                description: `Añada códigos de libro mayor y nómina a sus categorías para exportar fácilmente los gastos a sus sistemas de contabilidad y nómina.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}) =>
                    `<muted-text>Los códigos de libro mayor y nómina solo están disponibles en el plan Controlar, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Código de impuesto',
                description: `Añada código de impuesto mayor a sus categorías para exportar fácilmente los gastos a sus sistemas de contabilidad y nómina.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}) =>
                    `<muted-text>Los código de impuesto mayor solo están disponibles en el plan Controlar, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            companyCards: {
                title: 'Tarjetas de empresa ilimitadas',
                description: `¿Necesita agregar más canales de tarjetas? Desbloquee tarjetas de empresa ilimitadas para sincronizar transacciones de todos los principales emisores de tarjetas.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}) =>
                    `<muted-text>Esto solo está disponible en el plan Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            rules: {
                title: 'Reglas',
                description: `Las reglas se ejecutan en segundo plano y mantienen tus gastos bajo control para que no tengas que preocuparte por los detalles pequeños.\n\nExige detalles de los gastos, como recibos y descripciones, establece límites y valores predeterminados, y automatiza las aprobaciones y los pagos, todo en un mismo lugar.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}) =>
                    `<muted-text>Las reglas están disponibles solo en el plan Controlar, que comienza en <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            perDiem: {
                title: 'Per diem',
                description:
                    'Las dietas per diem (ej.: $100 por día para comidas) son una excelente forma de mantener los gastos diarios predecibles y ajustados a las políticas de la empresa, especialmente si tus empleados viajan por negocios. Disfruta de funciones como tasas personalizadas, categorías por defecto y detalles más específicos como destinos y subtasas.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}) =>
                    `<muted-text>Las dietas per diem solo están disponibles en el plan Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            travel: {
                title: 'Viajes',
                description:
                    'Expensify Travel es una nueva plataforma corporativa de reserva y gestión de viajes que permite a los miembros reservar alojamientos, vuelos, transporte y mucho más.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}) =>
                    `<muted-text>Los viajes están disponibles en el plan Recopilar, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            reports: {
                title: 'Informes',
                description: 'Los informes te permiten agrupar gastos para un seguimiento y organización más fáciles.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}) =>
                    `<muted-text>Los informes están disponibles en el plan Recopilar, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Etiquetas multinivel',
                description:
                    'Las etiquetas multinivel te ayudan a llevar un control más preciso de los gastos. Asigna múltiples etiquetas a cada partida, como departamento, cliente o centro de costos, para capturar el contexto completo de cada gasto. Esto permite informes más detallados, flujos de aprobación y exportaciones contables.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}) =>
                    `<muted-text>Las etiquetas multinivel solo están disponibles en el plan Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Tasas de distancia',
                description: 'Crea y gestiona tus propias tasas, realiza el seguimiento en millas o kilómetros y establece categorías predeterminadas para los gastos de distancia.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}) =>
                    `<muted-text>Las tasas de distancia están disponibles en el plan Recopilar, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            auditor: {
                title: 'Auditor',
                description: 'Los auditores tienen acceso de lectura a todos los informes para una visibilidad completa y la supervisión del cumplimiento.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Los auditores solo están disponibles con el plan Control, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Múltiples niveles de aprobación',
                description:
                    'Los múltiples niveles de aprobación son una herramienta de flujo de trabajo para empresas que requieren que más de una persona apruebe un informe antes de que pueda ser reembolsado.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}) =>
                    `<muted-text>Los múltiples niveles de aprobación solo están disponibles en el plan Controlar, a partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`}</muted-text>`,
            },
            note: ({subscriptionLink}) => `<muted-text>Mejore para acceder a esta función, o <a href="${subscriptionLink}">más información</a> sobre nuestros planes y precios.</muted-text>`,
            pricing: {
                perActiveMember: 'por miembro activo al mes.',
                perMember: 'por miembro al mes.',
            },
            upgradeToUnlock: 'Desbloquear esta función',
            completed: {
                headline: 'Has mejorado tu espacio de trabajo.',
                categorizeMessage: `Has actualizado con éxito al plan Recopilar. ¡Ahora puedes categorizar tus gastos!`,
                travelMessage: 'Has actualizado con éxito al plan Recopilar. ¡Ahora puedes comenzar a reservar y gestionar viajes!',
                successMessage: ({policyName, subscriptionLink}) =>
                    `<centered-text>Has actualizado con éxito ${policyName} al plan Controlar. <a href="${subscriptionLink}">Ver su suscripción</a> para obtener más información.</centered-text>`,
                distanceRateMessage: 'Has actualizado correctamente al plan Recopilar. ¡Ahora puedes cambiar la tasa de distancia!',
                gotIt: 'Entendido, gracias.',
                createdWorkspace: '¡Has creado un espacio de trabajo!',
            },
            commonFeatures: {
                title: 'Mejorar al plan Controlar',
                note: 'Desbloquea nuestras funciones más potentes, incluyendo:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}) =>
                        `<muted-text>El plan Controlar comienza desde <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `por miembro al mes.` : `por miembro activo al mes.`} <a href="${learnMoreMethodsRoute}">Más información</a> sobre nuestros planes y precios.</muted-text>`,
                    benefit1: 'Conexiones avanzadas de contabilidad (NetSuite, Sage Intacct y más)',
                    benefit2: 'Reglas inteligentes de gastos',
                    benefit3: 'Flujos de aprobación de varios niveles',
                    benefit4: 'Controles de seguridad mejorados',
                    toUpgrade: 'Para mejorar, haz clic en',
                    selectWorkspace: 'selecciona un espacio de trabajo y cambia el tipo de plan a',
                },
                upgradeWorkspaceWarning: 'No se puede actualizar el espacio de trabajo',
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt:
                    'Su empresa ha restringido la creación de espacios de trabajo. Por favor, contacte a un administrador para obtener ayuda.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Desmejorar al plan Recopilar',
                note: 'Si desmejoras, perderás acceso a estas funciones y más:',
                benefits: {
                    note: 'Para una comparación completa de nuestros planes, consulta nuestra',
                    pricingPage: 'página de precios',
                    confirm: '¿Estás seguro de que deseas desmejorar y eliminar tus configuraciones?',
                    warning: 'Esto no se puede deshacer.',
                    benefit1: 'Conexiones de contabilidad (excepto QuickBooks Online y Xero)',
                    benefit2: 'Reglas inteligentes de gastos',
                    benefit3: 'Flujos de aprobación de varios niveles',
                    benefit4: 'Controles de seguridad mejorados',
                    headsUp: '¡Atención!',
                    multiWorkspaceNote:
                        'Tendrás que bajar de categoría todos tus espacios de trabajo antes de tu primer pago mensual para comenzar una suscripción con la tasa del plan Recopilar. Haz clic en',
                    selectStep: '> selecciona cada espacio de trabajo > cambia el tipo de plan a',
                },
            },
            completed: {
                headline: 'Tu espacio de trabajo ha sido bajado de categoría',
                description: 'Tienes otros espacios de trabajo en el plan Controlar. Para facturarte con la tasa del plan Recopilar, debes bajar de categoría todos los espacios de trabajo.',
                gotIt: 'Entendido, gracias.',
            },
        },
        payAndDowngrade: {
            title: 'Pagar y bajar de categoría',
            headline: 'Tu pago final',
            description1: ({formattedAmount}) => `Tu factura final por esta suscripción será <strong>${formattedAmount}</strong>`,
            description2: (date) => `Consulta el desglose a continuación para ${date}:`,
            subscription:
                '¡Atención! Esta acción finalizará tu suscripción a Expensify, eliminará este espacio de trabajo y eliminará a todos los miembros del espacio de trabajo. Si deseas conservar este espacio de trabajo y solo eliminarte a ti mismo, haz que otro administrador tome el control de la facturación primero.',
            genericFailureMessage: 'Ocurrió un error al pagar tu factura. Por favor, inténtalo de nuevo.',
        },
        restrictedAction: {
            restricted: 'Restringido',
            actionsAreCurrentlyRestricted: (workspaceName) => `Las acciones en el espacio de trabajo ${workspaceName} están actualmente restringidas`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}) =>
                `El propietario del espacio de trabajo, ${workspaceOwnerName} tendrá que añadir o actualizar la tarjeta de pago registrada para desbloquear nueva actividad en el espacio de trabajo.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Debes añadir o actualizar la tarjeta de pago registrada para desbloquear nueva actividad en el espacio de trabajo.',
            addPaymentCardToUnlock: 'Añade una tarjeta para desbloquearlo!',
            addPaymentCardToContinueUsingWorkspace: 'Añade una tarjeta de pago para seguir utilizando este espacio de trabajo',
            pleaseReachOutToYourWorkspaceAdmin: 'Si tienes alguna pregunta, ponte en contacto con el administrador de su espacio de trabajo.',
            chatWithYourAdmin: 'Chatea con tu administrador',
            chatInAdmins: 'Chatea en #admins',
            addPaymentCard: 'Agregar tarjeta de pago',
            goToSubscription: 'Ir a Suscripción',
        },
        rules: {
            individualExpenseRules: {
                title: 'Gastos',
                subtitle: (categoriesPageLink, tagsPageLink) =>
                    `<muted-text>Establece controles y valores predeterminados para gastos individuales. También puedes crear reglas para <a href="${categoriesPageLink}">categorías</a> y <a href="${tagsPageLink}">etiquetas</a>.</muted-text>`,
                receiptRequiredAmount: 'Cantidad requerida para los recibos',
                receiptRequiredAmountDescription: 'Exige recibos cuando los gastos superen este importe, a menos que lo anule una regla de categoría.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `La cantidad no puede ser mayor que la cantidad requerida para recibos detallados (${amount})`,
                itemizedReceiptRequiredAmount: 'Cantidad requerida para recibos detallados',
                itemizedReceiptRequiredAmountDescription: 'Exige recibos detallados cuando los gastos superen este importe, a menos que lo anule una regla de categoría.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `La cantidad no puede ser menor que la cantidad requerida para recibos regulares (${amount})`,
                maxExpenseAmount: 'Importe máximo del gasto',
                maxExpenseAmountDescription: 'Marca los gastos que superen este importe, a menos que una regla de categoría lo anule.',
                maxAge: 'Antigüedad máxima',
                maxExpenseAge: 'Antigüedad máxima de los gastos',
                maxExpenseAgeDescription: 'Marca los gastos de más de un número determinado de días.',
                maxExpenseAgeDays: () => ({
                    one: '1 día',
                    other: (count: number) => `${count} días`,
                }),
                cashExpenseDefault: 'Valor predeterminado para gastos en efectivo',
                cashExpenseDefaultDescription:
                    'Elige cómo deben crearse los gastos en efectivo. Un gasto se considera en efectivo si no es una transacción importada desde una tarjeta de empresa. Esto incluye gastos creados manualmente, recibos, viáticos y gastos de distancia y tiempo.',
                reimbursableDefault: 'Reembolsable',
                reimbursableDefaultDescription: 'Los gastos suelen ser reembolsados a los empleados',
                nonReimbursableDefault: 'No reembolsable',
                nonReimbursableDefaultDescription: 'Los gastos ocasionalmente son reembolsados a los empleados',
                alwaysReimbursable: 'Siempre reembolsable',
                alwaysReimbursableDescription: 'Los gastos siempre se reembolsados a los empleados',
                alwaysNonReimbursable: 'Siempre no reembolsable',
                alwaysNonReimbursableDescription: 'Los gastos nunca son reembolsados a los empleados',
                billableDefault: 'Valor predeterminado facturable',
                billableDefaultDescription: (tagsPageLink) =>
                    `<muted-text>Elige si los gastos en efectivo y con tarjeta de crédito deben ser facturables por defecto. Los gastos facturables se activan o desactivan en <a href="${tagsPageLink}">etiquetas</a>.</muted-text>`,
                billable: 'Facturable',
                billableDescription: 'Los gastos se vuelven a facturar a los clientes en la mayoría de los casos',
                nonBillable: 'No facturable',
                nonBillableDescription: 'Los gastos se vuelven a facturar a los clientes en ocasiones',
                eReceipts: 'Recibos electrónicos',
                eReceiptsHint: `Los recibos electrónicos se crean automáticamente [para la mayoría de las transacciones en USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Seguimiento de asistentes',
                attendeeTrackingHint: 'Haz un seguimiento del coste por persona para cada gasto.',
                prohibitedDefaultDescription:
                    'Marque cualquier recibo donde aparezcan alcohol, apuestas u otros artículos restringidos. Los gastos con recibos que incluyan estos conceptos requerirán una revisión manual.',
                prohibitedExpenses: 'Gastos prohibidos',
                alcohol: 'Alcohol',
                hotelIncidentals: 'Gastos adicionales de hotel',
                gambling: 'Juegos de apuestas',
                tobacco: 'Tabaco',
                adultEntertainment: 'Entretenimiento para adultos',
                requireCompanyCard: 'Requerir que todas las compras se hagan con la tarjeta de empresa',
                requireCompanyCardDescription: 'Marca todo gasto en efectivo, incluyendo kilometraje y gastos per diem.',
            },
            expenseReportRules: {
                title: 'Avanzado',
                subtitle: 'Automatiza el cumplimiento, la aprobación y el pago de los informes de gastos.',
                preventSelfApprovalsTitle: 'Evitar autoaprobaciones',
                preventSelfApprovalsSubtitle: 'Evita que los miembros del espacio de trabajo aprueben sus propios informes de gastos.',
                autoApproveCompliantReportsTitle: 'Aprobación automática de informes conformes',
                autoApproveCompliantReportsSubtitle: 'Configura qué informes de gastos pueden aprobarse de forma automática.',
                autoApproveReportsUnderTitle: 'Aprobar automáticamente informes por debajo de',
                autoApproveReportsUnderDescription: 'Los informes de gastos totalmente conformes por debajo de esta cantidad se aprobarán automáticamente.',
                randomReportAuditTitle: 'Auditoría aleatoria de informes',
                randomReportAuditDescription: 'Requiere que algunos informes sean aprobados manualmente, incluso si son elegibles para la aprobación automática.',
                autoPayApprovedReportsTitle: 'Pago automático de informes aprobados',
                autoPayApprovedReportsSubtitle: 'Configura qué informes de gastos pueden pagarse de forma automática.',
                autoPayApprovedReportsLimitError: (currency) => `Por favor, introduce un monto menor a ${currency ?? ''}20,000`,
                autoPayApprovedReportsLockedSubtitle: 'Ve a más funciones y habilita flujos de trabajo, luego agrega pagos para desbloquear esta función.',
                autoPayReportsUnderTitle: 'Pagar automáticamente informes por debajo de',
                autoPayReportsUnderDescription: 'Los informes de gastos totalmente conformes por debajo de esta cantidad se pagarán automáticamente.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName) => `Añade ${featureName} para desbloquear esta función.`,
                enableFeatureSubtitle: (featureName, moreFeaturesLink) => `Ir a [más características](${moreFeaturesLink}) y habilita ${featureName} para desbloquear esta función.`,
            },
            merchantRules: {
                title: 'Comerciante',
                subtitle: 'Configura las reglas de comerciante para que los gastos lleguen correctamente codificados y requieran menos limpieza.',
                addRule: 'Añadir regla de comerciante',
                addRuleTitle: 'Añadir regla',
                editRuleTitle: 'Editar regla',
                expensesWith: 'Para gastos con:',
                expensesExactlyMatching: 'Para gastos que coincidan exactamente con:',
                applyUpdates: 'Aplicar estas actualizaciones:',
                saveRule: 'Guardar regla',
                previewMatches: 'Vista previa de coincidencias',
                confirmError: 'Ingresa comerciante y aplica al menos una actualización',
                confirmErrorMerchant: 'Por favor ingresa comerciante',
                confirmErrorUpdate: 'Por favor aplica al menos una actualización',
                previewMatchesEmptyStateTitle: 'Nada que mostrar',
                previewMatchesEmptyStateSubtitle: 'No hay gastos no enviados que coincidan con esta regla.',
                deleteRule: 'Eliminar regla',
                deleteRuleConfirmation: '¿Estás seguro de que quieres eliminar esta regla?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `Si el comerciante ${isExactMatch ? 'coincide exactamente con' : 'contiene'} "${merchantName}"`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `Renombrar comerciante a "${merchantName}"`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `Actualizar ${fieldName} a "${fieldValue}"`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `Marcar como "${reimbursable ? 'reembolsable' : 'no reembolsable'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `Marcar como "${billable ? 'facturable' : 'no facturable'}"`,
                matchType: 'Tipo de coincidencia',
                matchTypeContains: 'Contiene',
                matchTypeExact: 'Coincide exactamente',
                duplicateRuleTitle: 'Ya existe una regla de comerciante similar',
                duplicateRulePrompt: (merchantName: string) => `¿Quieres guardar una nueva regla para "${merchantName}" aunque ya tengas una existente?`,
                saveAnyway: 'Guardar de todos modos',
                applyToExistingUnsubmittedExpenses: 'Aplicar a gastos existentes no enviados',
            },
            categoryRules: {
                title: 'Reglas de categoría',
                approver: 'Aprobador',
                requireDescription: 'Requerir descripción',
                requireFields: 'Requerir campos',
                requiredFieldsTitle: 'Campos obligatorios',
                requiredFieldsDescription: (categoryName) => `Esto se aplicará a todos los gastos categorizados como <strong>${categoryName}</strong>.`,
                requireAttendees: 'Requerir asistentes',
                descriptionHint: 'Sugerencia de descripción',
                descriptionHintDescription: (categoryName) =>
                    `Recuerda a los empleados que deben proporcionar información adicional para los gastos de “${categoryName}”. Esta sugerencia aparece en el campo de descripción en los gastos.`,
                descriptionHintLabel: 'Sugerencia',
                descriptionHintSubtitle: 'Consejo: ¡Cuanto más corta, mejor!',
                maxAmount: 'Importe máximo',
                flagAmountsOver: 'Señala importes superiores a',
                flagAmountsOverDescription: (categoryName) => `Aplica a la categoría “${categoryName}”.`,
                flagAmountsOverSubtitle: 'Esto anula el importe máximo para todos los gastos.',
                expenseLimitTypes: {
                    expense: 'Gasto individual',
                    expenseSubtitle: 'Señala importes de gastos por categoría. Esta regla anula la regla general del espacio de trabajo para el importe máximo de gastos.',
                    daily: 'Total por categoría',
                    dailySubtitle: 'Marcar el gasto total por día por categoría en cada informe de gastos.',
                },
                requireReceiptsOver: 'Requerir recibos para importes superiores a',
                requireReceiptsOverList: {
                    default: (defaultAmount) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Predeterminado`,
                    never: 'Nunca requerir recibos',
                    always: 'Requerir recibos siempre',
                },
                requireItemizedReceiptsOver: 'Requerir recibos detallados para importes superiores a',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Predeterminado`,
                    never: 'Nunca requerir recibos detallados',
                    always: 'Requerir recibos detallados siempre',
                },
                defaultTaxRate: 'Tasa de impuesto predeterminada',
                enableWorkflows: ({moreFeaturesLink}) =>
                    `Ve a [Más características](${moreFeaturesLink}) y habilita los flujos de trabajo, luego añade aprobaciones para desbloquear esta función.`,
            },
            customRules: {
                title: 'Reglas personalizadas',
                cardSubtitle: 'Aquí es donde se definen las reglas de tu equipo, para que todos sepan lo que esta cubierto.',
            },
        },
    },
    getAssistancePage: {
        title: 'Obtener ayuda',
        subtitle: '¡Estamos aquí para ayudarte!',
        description: 'Elige una de las siguientes opciones:',
        chatWithConcierge: 'Chatear con Concierge',
        scheduleSetupCall: 'Concertar una llamada',
        scheduleACall: 'Programar llamada',
        questionMarkButtonTooltip: 'Obtén ayuda de nuestro equipo',
        exploreHelpDocs: 'Explorar la documentación de ayuda',
        registerForWebinar: 'Registrarse para el seminario web',
        onboardingHelp: 'Ayuda de incorporación',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Elige el tono de piel por defecto',
        headers: {
            frequentlyUsed: 'Usado frecuentemente',
            smileysAndEmotion: 'Emoticonos y emociones',
            peopleAndBody: 'Personas y Cuerpo',
            animalsAndNature: 'Animales y naturaleza',
            foodAndDrink: 'Alimentos y bebidas',
            travelAndPlaces: 'Viajes y lugares',
            activities: 'Actividades',
            objects: 'Objetos',
            symbols: 'Símbolos',
            flags: 'Banderas',
        },
    },
    newRoomPage: {
        newRoom: 'Nueva sala de chat',
        groupName: 'Nombre del grupo',
        roomName: 'Nombre de la sala',
        visibility: 'Visibilidad',
        restrictedDescription: 'Sólo las personas en tu espacio de trabajo pueden encontrar esta sala',
        privateDescription: 'Sólo las personas que están invitadas a esta sala pueden encontrarla',
        publicDescription: 'Cualquier persona puede unirse a esta sala',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Cualquier persona puede unirse a esta sala',
        createRoom: 'Crea una sala de chat',
        roomAlreadyExistsError: 'Ya existe una sala con este nombre',
        roomNameReservedError: ({reservedName}) => `${reservedName} es el nombre una sala por defecto de todos los espacios de trabajo. Por favor, elige otro nombre.`,
        roomNameInvalidError: 'Los nombres de las salas solo pueden contener minúsculas, números y guiones',
        pleaseEnterRoomName: 'Por favor, escribe el nombre de una sala',
        pleaseSelectWorkspace: 'Por favor, selecciona un espacio de trabajo',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}cambió el nombre a "${newName}" (previamente "${oldName}")` : `${actor}cambió el nombre de la sala a "${newName}" (previamente "${oldName}")`;
        },
        roomRenamedTo: ({newName}) => `Sala renombrada a ${newName}`,
        social: 'social',
        selectAWorkspace: 'Seleccionar un espacio de trabajo',
        growlMessageOnRenameError: 'No se ha podido cambiar el nombre del espacio de trabajo. Por favor, comprueba tu conexión e inténtalo de nuevo.',
        visibilityOptions: {
            restricted: 'Espacio de trabajo', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privada',
            public: 'Público',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Anuncio Público',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Enviar y Cerrar',
        submitAndApprove: 'Enviar y Aprobar',
        advanced: 'AVANZADO',
        dynamicExternal: 'DINÁMICO_EXTERNO',
        smartReport: 'INFORME_INTELIGENTE',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `estableció la cuenta bancaria de empresa predeterminada a "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `eliminó la cuenta bancaria de empresa predeterminada "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
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
            `cambió la cuenta bancaria de empresa predeterminada a "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" (previamente "${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}")`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `cambió la dirección de la empresa a "${newAddress}" (anteriormente "${previousAddress}")` : `estableció la dirección de la empresa en "${newAddress}"`,
        addApprovalRule: (approverEmail, approverName, field, name) => `añadió a ${approverName} (${approverEmail}) como aprobador para la ${field} "${name}"`,
        deleteApprovalRule: (approverEmail, approverName, field, name) => `eliminó a ${approverName} (${approverEmail}) como aprobador para la ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);

            return `cambió el aprobador para la ${field} "${name}" a ${formatApprover(newApproverName, newApproverEmail)} (previamente ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}) => `añadió la categoría "${categoryName}""`,
        deleteCategory: ({categoryName}) => `eliminó la categoría "${categoryName}"`,
        updateCategory: ({oldValue, categoryName}) => `${oldValue ? 'deshabilitó' : 'habilitó'} la categoría "${categoryName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}) => {
            if (!newValue) {
                return `eliminó la sugerencia de descripción "${oldValue}" de la categoría "${categoryName}"`;
            }

            return !oldValue
                ? `añadió la sugerencia de descripción "${newValue}" a la categoría "${categoryName}"`
                : `cambió la sugerencia de descripción de la categoría "${categoryName}" a “${newValue}” (anteriormente “${oldValue}”)`;
        },
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}) => {
            if (!oldValue) {
                return `añadió el código de nómina "${newValue}" a la categoría "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `eliminó el código de nómina "${oldValue}" de la categoría "${categoryName}"`;
            }
            return `cambió el código de nómina de la categoría "${categoryName}" a “${newValue}” (previamente “${oldValue}”)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}) => {
            if (!oldValue) {
                return `añadió el código GL "${newValue}" a la categoría "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `eliminó el código GL "${oldValue}" de la categoría "${categoryName}"`;
            }
            return `cambió el código GL de la categoría “${categoryName}” a “${newValue}” (previamente “${oldValue}”)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}) => {
            return `cambió la descripción de la categoría "${categoryName}" a ${!oldValue ? 'requerida' : 'no requerida'} (previamente ${!oldValue ? 'no requerida' : 'requerida'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}) => {
            if (newAmount && !oldAmount) {
                return `añadió un importe máximo de ${newAmount} a la categoría "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `eliminó el importe máximo de ${oldAmount} de la categoría "${categoryName}"`;
            }
            return `cambió el importe máximo de la categoría "${categoryName}" a ${newAmount} (previamente ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}) => {
            if (!oldValue) {
                return `añadió un tipo de límite de ${newValue} a la categoría "${categoryName}"`;
            }
            return `actualizó la categoría "${categoryName}" cambiando el Tipo de Límite a ${newValue} (previamente "${oldValue}")`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}) => {
            if (!oldValue) {
                return `actualizó la categoría "${categoryName}" cambiando Recibos a ${newValue}`;
            }
            return `cambió la categoría "${categoryName}" a ${newValue} (previamente ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}) => {
            if (!oldValue) {
                return `actualizó la categoría "${categoryName}" cambiando Recibos detallados a ${newValue}`;
            }
            return `cambió los Recibos detallados de la categoría "${categoryName}" a ${newValue} (previamente ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}) => `renombró la categoría "${oldName}" a "${newName}"`,
        updateTagListName: ({oldName, newName}) => `cambió el nombre de la lista de etiquetas a "${newName}" (previamente "${oldName}")`,
        addTag: ({tagListName, tagName}) => `añadió la etiqueta "${tagName}" a la lista "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}) => `actualizó la lista de etiquetas "${tagListName}" cambiando la etiqueta "${oldName}" a "${newName}"`,
        updateTagEnabled: ({tagListName, tagName, enabled}) => `${enabled ? 'habilitó' : 'deshabilitó'} la etiqueta "${tagName}" en la lista "${tagListName}"`,
        deleteTag: ({tagListName, tagName}) => `eliminó la etiqueta "${tagName}" de la lista "${tagListName}"`,
        deleteMultipleTags: ({count, tagListName}) => `eliminó "${count}" etiquetas de la lista "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}) => {
            if (oldValue) {
                return `actualizó la etiqueta "${tagName}" en la lista "${tagListName}" cambiando el ${updatedField} a "${newValue}" (previamente "${oldValue}")`;
            }
            return `actualizó la etiqueta "${tagName}" en la lista "${tagListName}" añadiendo un ${updatedField} de "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}) => `cambió el ${customUnitName} ${updatedField} a "${newValue}" (previamente "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}) => `${newValue ? 'habilitó' : 'deshabilitó'} el seguimiento de impuestos en tasas de distancia`,
        addCustomUnitRate: (customUnitName, rateName) => `añadió una nueva tasa de "${rateName}" para "${customUnitName}"`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}) =>
            `cambió la tasa de ${customUnitName} ${updatedField} "${customUnitRateName}" a "${newValue}" (previamente "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}) => {
            if (oldTaxPercentage && oldValue) {
                return `cambió la tasa de impuesto en la tasa por distancia "${customUnitRateName}" a "${newValue} (${newTaxPercentage})" (previamente "${oldValue} (${oldTaxPercentage})")`;
            }
            return `añadió la tasa de impuesto "${newValue} (${newTaxPercentage})" a la tasa de distancia "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}) => {
            if (oldValue) {
                return `cambió la parte recuperable de impuestos en la tasa por distancia "${customUnitRateName}" a "${newValue}" (previamente "${oldValue}")`;
            }
            return `añadió una parte recuperable de impuestos de "${newValue}" a la tasa por distancia "${customUnitRateName}`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}) => {
            return `${newValue ? 'habilitó' : 'deshabilitó'} la tasa de ${customUnitName} "${customUnitRateName}"`;
        },
        deleteCustomUnitRate: (customUnitName, rateName) => `eliminó la tasa "${rateName}" de "${customUnitName}"`,
        addedReportField: (fieldType, fieldName) => `añadió el campo de informe ${fieldType} "${fieldName}"`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}) => `estableció el valor predeterminado del campo de informe "${fieldName}" en "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}) => `añadió la opción "${optionName}" al campo de informe "${fieldName}"`,
        removedReportFieldOption: ({fieldName, optionName}) => `eliminó la opción "${optionName}" del campo de informe "${fieldName}"`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}) =>
            `${optionEnabled ? 'habilitó' : 'deshabilitó'} la opción "${optionName}" para el campo de informe "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'habilitó' : 'deshabilitó'} todas las opciones para el campo de informe "${fieldName}"`;
            }
            return `${allEnabled ? 'habilitó' : 'deshabilitó'} la opción "${optionName}" para el campo de informe "${fieldName}", haciendo que todas las opciones queden ${
                allEnabled ? 'habilitadas' : 'deshabilitadas'
            }`;
        },
        deleteReportField: (fieldType, fieldName) => `eliminó el campo de informe ${fieldType} "${fieldName}"`,
        preventSelfApproval: ({oldValue, newValue}) =>
            `actualizó "Evitar la autoaprobación" a "${newValue === 'true' ? 'Habilitada' : 'Deshabilitada'}" (previamente "${oldValue === 'true' ? 'Habilitada' : 'Deshabilitada'}")`,
        setReceiptRequiredAmount: ({newValue}) => `estableció el importe requerido del recibo en "${newValue}"`,
        changedReceiptRequiredAmount: ({oldValue, newValue}) => `cambió el importe requerido del recibo a "${newValue}" (antes "${oldValue}")`,
        removedReceiptRequiredAmount: ({oldValue}) => `eliminó el importe requerido del recibo (antes "${oldValue}")`,

        setMaxExpenseAmount: ({newValue}) => `estableció el importe máximo del gasto en "${newValue}"`,
        changedMaxExpenseAmount: ({oldValue, newValue}) => `cambió el importe máximo del gasto a "${newValue}" (antes "${oldValue}")`,
        removedMaxExpenseAmount: ({oldValue}) => `eliminó el importe máximo del gasto (antes "${oldValue}")`,

        setMaxExpenseAge: ({newValue}) => `estableció la antigüedad máxima del gasto en "${newValue}" días`,
        changedMaxExpenseAge: ({oldValue, newValue}) => `cambió la antigüedad máxima del gasto a "${newValue}" días (antes "${oldValue}")`,
        removedMaxExpenseAge: ({oldValue}) => `eliminó la antigüedad máxima del gasto (anteriormente "${oldValue}" días)`,
        updateDefaultBillable: ({oldValue, newValue}) => `actualizó "Volver a facturar gastos a clientes" a "${newValue}" (previamente "${oldValue}")`,
        updateDefaultReimbursable: ({oldValue, newValue}) => `actualizó "Valor predeterminado para gastos en efectivo" a "${newValue}" (previamente "${oldValue}")`,
        updateMonthlyOffset: ({oldValue, newValue}) => {
            if (!oldValue) {
                return `establecer la fecha de envío del informe mensual a "${newValue}"`;
            }
            return `actualizar la fecha de envío del informe mensual a "${newValue}" (previamente "${oldValue}")`;
        },
        updateDefaultTitleEnforced: ({value}) => `cambió "Requerir título predeterminado de informe" a ${value ? 'activado' : 'desactivado'}`,
        changedCustomReportNameFormula: ({newValue, oldValue}) => `cambió la fórmula personalizado del nombre del informe a "${newValue}" (anteriormente "${oldValue}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}) =>
            !oldDescription
                ? `estableció la descripción de este espacio de trabajo como "${newDescription}"`
                : `actualizó la descripción de este espacio de trabajo a "${newDescription}" (previamente "${oldDescription}")`,
        renamedWorkspaceNameAction: ({oldName, newName}) => `actualizó el nombre de este espacio de trabajo a "${newName}" (previamente "${oldName}")`,
        removedFromApprovalWorkflow: ({submittersNames}) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join(' y ');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} y ${submittersNames.at(-1)}`;
            }
            return {
                one: `te eliminó del flujo de trabajo de aprobaciones y del chat de gastos de ${joinedNames}. Los informes enviados anteriormente seguirán estando disponibles para su aprobación en tu bandeja de entrada.`,
                other: `te eliminó de los flujos de trabajo de aprobaciones y de los chats de gastos de ${joinedNames}. Los informes enviados anteriormente seguirán estando disponibles para su aprobación en tu bandeja de entrada.`,
            };
        },
        demotedFromWorkspace: (policyName, oldRole) => `cambió tu rol en ${policyName} de ${oldRole} a miembro. Te eliminamos de todos los chats de gastos, excepto el suyo.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}) => `actualizó la moneda predeterminada a ${newCurrency} (previamente ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}) => `actualizó la frecuencia de generación automática de informes a "${newFrequency}" (previamente "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}) => `actualizó el modo de aprobación a "${newValue}" (previamente "${oldValue}")`,
        upgradedWorkspace: 'mejoró este espacio de trabajo al plan Controlar',
        forcedCorporateUpgrade: `Este espacio de trabajo ha sido actualizado al plan Control. Haz clic <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">aquí</a> para obtener más información.`,
        downgradedWorkspace: 'bajó de categoría este espacio de trabajo al plan Recopilar',
        updatedAuditRate: ({oldAuditRate, newAuditRate}) =>
            `cambió la tasa de informes enviados aleatoriamente para aprobación manual a ${Math.round(newAuditRate * 100)}% (previamente ${Math.round(oldAuditRate * 100)}%)`,
        changedReimburser: ({newReimburser, previousReimburser}) =>
            previousReimburser ? `cambió el pagador autorizado a "${newReimburser}" (previamente "${previousReimburser}")` : `cambió el pagador autorizado a "${newReimburser}"`,
        updateReimbursementEnabled: ({enabled}) => `${enabled ? 'habilitó' : 'deshabilitó'} los reembolsos`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}) => `cambió el límite de aprobación manual para todos los gastos a ${newLimit} (previamente ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'activó' : 'desactivó'} las categorías`;
                case 'tags':
                    return `${enabled ? 'activó' : 'desactivó'} las etiquetas`;
                case 'workflows':
                    return `${enabled ? 'activó' : 'desactivó'} los flujos de trabajo`;
                case 'distance rates':
                    return `${enabled ? 'activó' : 'desactivó'} las tasas por distancia`;
                case 'accounting':
                    return `${enabled ? 'activó' : 'desactivó'} la contabilidad`;
                case 'Expensify Cards':
                    return `${enabled ? 'activó' : 'desactivó'} las tarjetas Expensify`;
                case 'company cards':
                    return `${enabled ? 'activó' : 'desactivó'} las tarjetas de empresa`;
                case 'invoicing':
                    return `${enabled ? 'activó' : 'desactivó'} las facturas`;
                case 'per diem':
                    return `${enabled ? 'activó' : 'desactivó'} per diem`;
                case 'receipt partners':
                    return `${enabled ? 'activó' : 'desactivó'} la importación de recibos`;
                case 'rules':
                    return `${enabled ? 'activó' : 'desactivó'} las reglas`;
                case 'tax tracking':
                    return `${enabled ? 'activó' : 'desactivó'} el seguimiento de impuestos`;
                default:
                    return `${enabled ? 'activó' : 'desactivó'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? 'habilitó' : 'deshabilitó'} el seguimiento de asistentes`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? 'habilitó' : 'deshabilitó'} el autopago de informes aprobados`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `estableció el umbral de autopago de informes aprobados en "${newLimit}"`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `cambió el umbral de autopago de informes aprobados a "${newLimit}" (previamente "${oldLimit}")`,
        removedAutoPayApprovedReportsLimit: 'eliminó el umbral de autopago de informes aprobados',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `cambió el aprobador predeterminado a ${newApprover} (anteriormente ${previousApprover})` : `cambió el aprobador predeterminado a ${newApprover}`,
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
            let text = `cambió el flujo de aprobación para ${members} para enviar informes a ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += ` (aprobador predeterminado anterior: ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += ' (anteriormente aprobador predeterminado)';
            } else if (previousApprover) {
                text += ` (anteriormente ${previousApprover})`;
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
                ? `cambió el flujo de aprobación para ${members} para enviar informes al aprobador predeterminado ${approver}`
                : `cambió el flujo de aprobación para ${members} para enviar informes al aprobador predeterminado`;
            if (wasDefaultApprover && previousApprover) {
                text += ` (aprobador predeterminado anterior: ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += ' (anteriormente aprobador predeterminado)';
            } else if (previousApprover) {
                text += ` (anteriormente ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `cambió el flujo de aprobación para ${approver} para reenviar informes aprobados a ${forwardsTo} (anteriormente reenviados a ${previousForwardsTo})`
                : `cambió el flujo de aprobación para ${approver} para reenviar informes aprobados a ${forwardsTo} (anteriormente informes aprobados finales)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `cambió el flujo de aprobación para ${approver} para dejar de reenviar informes aprobados (anteriormente reenviados a ${previousForwardsTo})`
                : `cambió el flujo de aprobación para ${approver} para dejar de reenviar informes aprobados`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `cambió el nombre de la empresa de la factura a "${newValue}" (previamente "${oldValue}")` : `estableció el nombre de la empresa de la factura como "${newValue}"`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue
                ? `cambió el sitio web de la empresa de la factura a "${newValue}" (previamente "${oldValue}")`
                : `estableció el sitio web de la empresa de la factura como "${newValue}"`,
        addTax: ({taxName}) => `añadió el impuesto "${taxName}"`,
        deleteTax: ({taxName}) => `eliminó el impuesto "${taxName}"`,
        updateTax: ({oldValue, taxName, updatedField, newValue}) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `cambió el nombre del impuesto de "${oldValue}" a "${newValue}"`;
                }
                case 'code': {
                    return `cambió el código del impuesto "${taxName}" de "${oldValue}" a "${newValue}"`;
                }
                case 'rate': {
                    return `cambió la tasa del impuesto "${taxName}" de "${oldValue}" a "${newValue}"`;
                }
                case 'enabled': {
                    return `${oldValue ? 'deshabilitó' : 'habilitó'} el impuesto "${taxName}"`;
                }
                default: {
                    return '';
                }
            }
        },
    },
    roomMembersPage: {
        memberNotFound: 'Miembro no encontrado.',
        useInviteButton: 'Para invitar a un nuevo miembro al chat, por favor, utiliza el botón invitar que está más arriba.',
        notAuthorized: `No tienes acceso a esta página. Si estás intentando unirte a esta sala, pide a un miembro de la sala que te añada. ¿Necesitas algo más? Comunícate con ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Parece que esta sala ha sido archivada. Si tienes preguntas, comunícate con ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}) => ({
            one: `¿Estás seguro de que quieres eliminar ${memberName} de la sala de chat?`,
            other: '¿Estás seguro de que quieres eliminar a los miembros seleccionados de la sala de chat?',
        }),
        error: {
            genericAdd: 'Hubo un problema al añadir este miembro a la sala de chat',
        },
    },
    newTaskPage: {
        assignTask: 'Asignar tarea',
        assignMe: 'Asignar a mí mismo',
        confirmTask: 'Confirmar tarea',
        confirmError: 'Por favor, introduce un título y selecciona un destino de tarea',
        descriptionOptional: 'Descripción (opcional)',
        pleaseEnterTaskName: 'Por favor, introduce un título',
        pleaseEnterTaskDestination: 'Por favor, selecciona dónde deseas compartir esta tarea',
    },
    task: {
        task: 'Tarea',
        title: 'Título',
        description: 'Descripción',
        assignee: 'Miembro asignado',
        completed: 'Completada',
        action: 'Completar',
        messages: {
            created: ({title}) => `tarea para ${title}`,
            completed: 'marcada como completa',
            canceled: 'tarea eliminada',
            reopened: 'marcada como incompleta',
            error: 'No tiene permiso para realizar la acción solicitada',
        },
        markAsComplete: 'Marcar como completada',
        markAsIncomplete: 'Marcar como incompleta',
        assigneeError: 'Se ha producido un error al asignar esta tarea. Por favor, inténtalo con otro miembro.',
        genericCreateTaskFailureMessage: 'Error inesperado al crear la tarea. Por favor, inténtalo más tarde.',
        deleteTask: 'Eliminar tarea',
        deleteConfirmation: '¿Estás seguro de que quieres eliminar esta tarea?',
    },
    statementPage: {
        title: ({year, monthName}) => `Estado de cuenta de ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Atajos de teclado',
        subtitle: 'Ahorra tiempo con estos atajos de teclado:',
        shortcuts: {
            openShortcutDialog: 'Abre el cuadro de diálogo de métodos abreviados de teclado',
            markAllMessagesAsRead: 'Marcar todos los mensajes como leídos',
            escape: 'Diálogos de escape',
            search: 'Abrir diálogo de búsqueda',
            newChat: 'Nueva pantalla de chat',
            copy: 'Copiar comentario',
            openDebug: 'Abrir el diálogo de preferencias de pruebas',
        },
    },
    guides: {
        screenShare: 'Compartir pantalla',
        screenShareRequest: 'Expensify te está invitando a compartir la pantalla',
    },
    search: {
        resultsAreLimited: 'Los resultados de búsqueda están limitados.',
        viewResults: 'Ver resultados',
        resetFilters: 'Restablecer filtros',
        searchResults: {
            emptyResults: {
                title: 'No hay nada que ver aquí',
                subtitle: `Intenta ajustar tus criterios de búsqueda o crear algo con el botón +.`,
            },
            emptyExpenseResults: {
                title: 'Aún no has creado ningún gasto',
                subtitle: 'Crea un gasto o haz una prueba por Expensify para aprender más.',
                subtitleWithOnlyCreateButton: 'Usa el botón verde de abajo para crear un gasto.',
            },
            emptyReportResults: {
                title: 'Aún no has creado ningún informe',
                subtitle: 'Crea un informe o haz una prueba de Expensify para aprender más.',
                subtitleWithOnlyCreateButton: 'Usa el botón verde de abajo para crear un informe.',
            },
            emptyInvoiceResults: {
                title: 'Aún no has creado \nninguna factura',
                subtitle: 'Envía una factura o haz una prueba por Expensify para aprender más.',
                subtitleWithOnlyCreateButton: 'Usa el botón verde de abajo para enviar una factura.',
            },
            emptyTripResults: {
                title: 'No tienes viajes',
                subtitle: 'Reserva tu primer viaje a continuación.',
                buttonText: 'Reserva un viaje',
            },
            emptySubmitResults: {
                title: 'No hay gastos para enviar',
                subtitle: 'Todo despejado. ¡Date una vuelta de victoria!',
                buttonText: 'Crear informe',
            },
            emptyApproveResults: {
                title: 'No hay gastos para aprobar',
                subtitle: 'Cero gastos. Máxima relajación. ¡Bien hecho!',
            },
            emptyPayResults: {
                title: 'No hay gastos para pagar',
                subtitle: '¡Felicidades! Has cruzado la línea de meta.',
            },
            emptyExportResults: {
                title: 'No hay gastos para exportar',
                subtitle: 'Es hora de relajarse, buen trabajo.',
            },
            emptyStatementsResults: {
                title: 'No hay gastos para mostrar',
                subtitle: 'Sin resultados. Intenta ajustar tus filtros.',
            },
            emptyUnapprovedResults: {
                title: 'No hay gastos para aprobar',
                subtitle: 'Cero gastos. Máxima relajación. ¡Bien hecho!',
            },
        },
        columns: 'Columnas',
        resetColumns: 'Restablecer columnas',
        groupColumns: 'Columnas de grupo',
        expenseColumns: 'Columnas de gastos',
        statements: 'Extractos',
        unapprovedCash: 'Efectivo no aprobado',
        unapprovedCard: 'Tarjeta no aprobada',
        reconciliation: 'Conciliación',
        topSpenders: 'Mayores gastadores',
        view: {label: 'Ver', table: 'Tabla', bar: 'Barra'},
        saveSearch: 'Guardar búsqueda',
        savedSearchesMenuItemTitle: 'Guardadas',
        topCategories: 'Categorías principales',
        topMerchants: 'Principales comerciantes',
        searchName: 'Nombre de la búsqueda',
        deleteSavedSearch: 'Eliminar búsqueda guardada',
        deleteSavedSearchConfirm: '¿Estás seguro de que quieres eliminar esta búsqueda?',
        groupedExpenses: 'gastos agrupados',
        bulkActions: {
            approve: 'Aprobar',
            pay: 'Pagar',
            delete: 'Eliminar',
            hold: 'Retener',
            unhold: 'Desbloquear',
            reject: 'Rechazar',
            noOptionsAvailable: 'No hay opciones disponibles para el grupo de gastos seleccionado.',
        },
        filtersHeader: 'Filtros',
        filters: {
            date: {
                before: (date) => `Antes de ${date ?? ''}`,
                after: (date) => `Después de ${date ?? ''}`,
                on: (date) => `En ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Nunca',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'El mes pasado',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'Este mes',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: 'Año hasta la fecha',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Último extracto',
                },
            },
            status: 'Estado',
            keyword: 'Palabra clave',
            keywords: 'Palabras clave',
            limit: 'Límite',
            limitDescription: 'Establece un límite para los resultados de tu búsqueda.',
            currency: 'Divisa',
            completed: 'Completadas',
            card: {
                expensify: 'Expensify',
                individualCards: 'Tarjetas individuales',
                closedCards: 'Tarjetas cerradas',
                cardFeeds: 'Flujos de tarjetas',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}) => `Todo ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}) => `Todas las Tarjetas Importadas desde CSV${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            amount: {
                lessThan: ({amount} = {}) => `Menos de ${amount ?? ''}`,
                greaterThan: ({amount} = {}) => `Más que ${amount ?? ''}`,
                between: (greaterThan, lessThan) => `Entre ${greaterThan} y ${lessThan}`,
                equalTo: ({amount} = {}) => `Igual a ${amount ?? ''}`,
            },
            current: 'Actual',
            past: 'Anterior',
            submitted: 'Envío',
            approved: 'Aprobación',
            paid: 'Pago',
            exported: 'Exportación',
            posted: 'Contabilización',
            withdrawn: 'Retirada',
            billable: 'Facturable',
            reimbursable: 'Reembolsable',
            purchaseCurrency: 'Moneda de compra',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: 'De',
                [CONST.SEARCH.GROUP_BY.CARD]: 'Tarjeta',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'ID de retiro',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Categoría',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: 'Comerciante',
                [CONST.SEARCH.GROUP_BY.TAG]: 'Etiqueta',
                [CONST.SEARCH.GROUP_BY.MONTH]: 'Mes',
                [CONST.SEARCH.GROUP_BY.WEEK]: 'Semana',
                [CONST.SEARCH.GROUP_BY.YEAR]: 'Año',
                [CONST.SEARCH.GROUP_BY.QUARTER]: 'Trimestre',
            },
            feed: 'Feed',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: 'Reembolso',
            },
            is: 'Es',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: 'Enviar',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: 'Aprobar',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: 'Pagar',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'Exportar',
            },
            reportField: ({name, value}) => `${name} es ${value}`,
        },
        has: 'Tiene',
        groupBy: 'Agrupar por',
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: 'De',
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
        searchPlaceholder: 'Busca algo',
        suggestions: 'Sugerencias',
        exportSearchResults: {
            title: 'Crear exportación',
            description: '¡Wow, esos son muchos elementos! Los agruparemos y Concierge te enviará un archivo en breve.',
        },
        exportedTo: 'Exported to',
        exportAll: {
            selectAllMatchingItems: 'Seleccionar todos los elementos coincidentes',
            allMatchingItemsSelected: 'Todos los elementos coincidentes seleccionados',
        },
    },
    genericErrorPage: {
        title: '¡Oh-oh, algo salió mal!',
        body: {
            helpTextMobile: 'Intenta cerrar y volver a abrir la aplicación o cambiar a la',
            helpTextWeb: 'web.',
            helpTextConcierge: 'Si el problema persiste, comunícate con',
        },
        refresh: 'Actualizar',
    },
    fileDownload: {
        success: {
            title: '¡Descargado!',
            message: 'Archivo descargado correctamente',
            qrMessage:
                'Busca la copia de tu código QR en la carpeta de fotos o descargas. Consejo: Añádelo a una presentación para que el público pueda escanearlo y conectar contigo directamente.',
        },
        generalError: {
            title: 'Error en la descarga',
            message: 'No se puede descargar el archivo adjunto',
        },
        permissionError: {
            title: 'Permiso para acceder al almacenamiento',
            message: 'Expensify no puede guardar los archivos adjuntos sin permiso para acceder al almacenamiento. Haz click en configuración para actualizar los permisos.',
        },
    },
    settlement: {
        status: {
            pending: 'Pendiente',
            cleared: 'Liquidado',
            failed: 'Fallido',
        },
        failedError: ({link}: {link: string}) => `Reintentaremos esta liquidación cuando <a href="${link}">desbloquees tu cuenta</a>.`,
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
            emptyReportConfirmationPromptLink: 'Informes',
            emptyReportConfirmationDontShowAgain: 'No me muestres esto otra vez',
            genericWorkspaceName: 'este espacio de trabajo',
        },
        genericCreateReportFailureMessage: 'Error inesperado al crear el chat. Por favor, inténtalo más tarde.',
        genericAddCommentFailureMessage: 'Error inesperado al añadir el comentario. Por favor, inténtalo más tarde.',
        genericUpdateReportFieldFailureMessage: 'Error inesperado al actualizar el campo. Por favor, inténtalo más tarde.',
        genericUpdateReportNameEditFailureMessage: 'Error inesperado al cambiar el nombre del informe. Por favor, intentarlo más tarde.',
        noActivityYet: 'Sin actividad todavía',
        connectionSettings: 'Configuración de conexión',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}) => `cambió ${fieldName} a "${newValue}" (previamente "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}) => `estableció ${fieldName} a ${newValue}`,
                changeReportPolicy: (toPolicyName, fromPolicyName) => {
                    if (!toPolicyName) {
                        return `cambió el espacio de trabajo${fromPolicyName ? ` (previamente ${fromPolicyName})` : ''}`;
                    }
                    return `cambió el espacio de trabajo a ${toPolicyName}${fromPolicyName ? ` (previamente ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType, newType) => `cambió type de ${oldType} a ${newType}`,
                exportedToCSV: `exportado a CSV`,
                exportedToIntegration: {
                    automatic: (label) => {
                        // The label will always be in English, so we need to translate it
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `exportado a ${translatedLabel}`;
                    },
                    automaticActionOne: (label) => `exportado a ${label} mediante`,
                    automaticActionTwo: 'configuración contable',
                    manual: (label) => `marcó este informe como exportado manualmente a ${label}.`,
                    automaticActionThree: 'y creó un registro con éxito para',
                    reimburseableLink: 'Exportar gastos por cuenta propia como',
                    nonReimbursableLink: 'gastos de la tarjeta de empresa',
                    pending: (label) => `comenzó a exportar este informe a ${label}...`,
                },
                integrationsMessage: ({label, errorMessage, linkText, linkURL}) =>
                    `no se pudo exportar este informe a ${label} ("${errorMessage}${linkText ? ` <a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `agregó un recibo`,
                managerDetachReceipt: `quitó un recibo`,
                markedReimbursed: ({amount, currency}) => `pagó ${currency}${amount} en otro lugar`,
                markedReimbursedFromIntegration: ({amount, currency}) => `pagó ${currency}${amount} mediante integración`,
                outdatedBankAccount: `no se pudo procesar el pago debido a un problema con la cuenta bancaria del pagador`,
                reimbursementACHBounce: `no se pudo procesar el pago debido a un problema con la cuenta bancaria`,
                reimbursementACHCancelled: `canceled the payment`,
                reimbursementAccountChanged: `no se pudo procesar el pago porque el pagador cambió de cuenta bancaria`,
                reimbursementDelayed: `procesó el pago pero se retrasó entre 1 y 2 días hábiles más`,
                selectedForRandomAudit: `seleccionado al azar para revisión`,
                selectedForRandomAuditMarkdown: `[seleccionado al azar](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) para revisión`,
                share: ({to}) => `miembro invitado ${to}`,
                unshare: ({to}) => `miembro eliminado ${to}`,
                stripePaid: ({amount, currency}) => `pagado ${currency}${amount}`,
                takeControl: `tomó el control`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}) =>
                    `hubo un problema al sincronizar con ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Por favor, soluciona el problema en la <a href="${workspaceAccountingLink}">configuración del espacio de trabajo</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `La conexión ${feedName} está rota. Para restaurar las importaciones de tarjetas, <a href='${workspaceCompanyCardRoute}'>inicia sesión en tu banco</a>`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `la conexión Plaid con tu cuenta bancaria de empresa está rota. Por favor, <a href='${walletRoute}'>reconecta tu cuenta bancaria ${maskedAccountNumber}</a> para poder seguir usando tus Tarjetas Expensify.`,
                addEmployee: (email, role) => `agregó a ${email} como ${role}`,
                updateRole: ({email, currentRole, newRole}) => `actualizó el rol ${email} a ${newRole} (previamente ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}) => {
                    if (!newValue) {
                        return `eliminó el campo personalizado 1 de ${email} (previamente "${previousValue}")`;
                    }

                    return !previousValue
                        ? `añadió "${newValue}" al campo personalizado 1 de ${email}`
                        : `cambió el campo personalizado 1 de ${email} a "${newValue}" (previamente "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}) => {
                    if (!newValue) {
                        return `eliminó el campo personalizado 2 de ${email} (previamente "${previousValue}")`;
                    }

                    return !previousValue
                        ? `añadió "${newValue}" al campo personalizado 2 de ${email}`
                        : `cambió el campo personalizado 2 de ${email} a "${newValue}" (previamente "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}) => `${nameOrEmail} salió del espacio de trabajo`,
                removeMember: (email, role) => `eliminado ${role} ${email}`,
                removedConnection: ({connectionName}) => `eliminó la conexión a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}) => `se conectó a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'salió del chat',
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `La cuenta bancaria comercial ${maskedBankAccountNumber} ha sido bloqueada automáticamente debido a un problema con el reembolso o la liquidación de la Tarjeta Expensify. Por favor, soluciona el problema en la <a href='${linkURL}'>configuración del espacio de trabajo</a>.`,
            },
            error: {
                invalidCredentials: 'Credenciales no válidas, por favor verifica la configuración de tu conexión.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}) => `${summary} por ${dayCount} ${dayCount === 1 ? 'día' : 'días'} hasta el ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}) => `${summary} de ${timePeriod} del ${date}`,
    },
    footer: {
        features: 'Características',
        expenseManagement: 'Gestión de Gastos',
        spendManagement: 'Control de Gastos',
        expenseReports: 'Informes de Gastos',
        companyCreditCard: 'Tarjeta de Crédito Corporativa',
        receiptScanningApp: 'Aplicación de Escaneado de Recibos',
        billPay: 'Pago de Facturas',
        invoicing: 'Facturación',
        CPACard: 'Tarjeta Para Contables',
        payroll: 'Nómina',
        travel: 'Viajes',
        resources: 'Recursos',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: 'Kit de Prensa',
        support: 'Soporte',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Términos de Servicio',
        privacy: 'Privacidad',
        learnMore: 'Más Información',
        aboutExpensify: 'Acerca de Expensify',
        blog: 'Blog',
        jobs: 'Empleo',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Relaciones Con Los Inversores',
        getStarted: 'Comenzar',
        createAccount: 'Crear Una Cuenta Nueva',
        logIn: 'Conectarse',
    },
    allStates: {
        AK: {
            stateISO: 'AK',
            stateName: 'Alaska',
        },
        AL: {
            stateISO: 'AL',
            stateName: 'Alabama',
        },
        AR: {
            stateISO: 'AR',
            stateName: 'Arkansas',
        },
        AZ: {
            stateISO: 'AZ',
            stateName: 'Arizona',
        },
        CA: {
            stateISO: 'CA',
            stateName: 'California',
        },
        CO: {
            stateISO: 'CO',
            stateName: 'Colorado',
        },
        CT: {
            stateISO: 'CT',
            stateName: 'Connecticut',
        },
        DE: {
            stateISO: 'DE',
            stateName: 'Delaware',
        },
        FL: {
            stateISO: 'FL',
            stateName: 'Florida',
        },
        GA: {
            stateISO: 'GA',
            stateName: 'Georgia',
        },
        HI: {
            stateISO: 'HI',
            stateName: 'Hawái',
        },
        IA: {
            stateISO: 'IA',
            stateName: 'Iowa',
        },
        ID: {
            stateISO: 'ID',
            stateName: 'Idaho',
        },
        IL: {
            stateISO: 'IL',
            stateName: 'Illinois',
        },
        IN: {
            stateISO: 'IN',
            stateName: 'Indiana',
        },
        KS: {
            stateISO: 'KS',
            stateName: 'Kansas',
        },
        KY: {
            stateISO: 'KY',
            stateName: 'Kentucky',
        },
        LA: {
            stateISO: 'LA',
            stateName: 'Luisiana',
        },
        MA: {
            stateISO: 'MA',
            stateName: 'Massachusetts',
        },
        MD: {
            stateISO: 'MD',
            stateName: 'Maryland',
        },
        ME: {
            stateISO: 'ME',
            stateName: 'Maine',
        },
        MI: {
            stateISO: 'MI',
            stateName: 'Míchigan',
        },
        MN: {
            stateISO: 'MN',
            stateName: 'Minnesota',
        },
        MO: {
            stateISO: 'MO',
            stateName: 'Misuri',
        },
        MS: {
            stateISO: 'MS',
            stateName: 'Misisipi',
        },
        MT: {
            stateISO: 'MT',
            stateName: 'Montana',
        },
        NC: {
            stateISO: 'NC',
            stateName: 'Carolina del Norte',
        },
        ND: {
            stateISO: 'ND',
            stateName: 'Dakota del Norte',
        },
        NE: {
            stateISO: 'NE',
            stateName: 'Nebraska',
        },
        NH: {
            stateISO: 'NH',
            stateName: 'Nuevo Hampshire',
        },
        NJ: {
            stateISO: 'NJ',
            stateName: 'Nueva Jersey',
        },
        NM: {
            stateISO: 'NM',
            stateName: 'Nuevo México',
        },
        NV: {
            stateISO: 'NV',
            stateName: 'Nevada',
        },
        NY: {
            stateISO: 'NY',
            stateName: 'Nueva York',
        },
        OH: {
            stateISO: 'OH',
            stateName: 'Ohio',
        },
        OK: {
            stateISO: 'OK',
            stateName: 'Oklahoma',
        },
        OR: {
            stateISO: 'OR',
            stateName: 'Oregón',
        },
        PA: {
            stateISO: 'PA',
            stateName: 'Pensilvania',
        },
        PR: {
            stateISO: 'PR',
            stateName: 'Puerto Rico',
        },
        RI: {
            stateISO: 'RI',
            stateName: 'Rhode Island',
        },
        SC: {
            stateISO: 'SC',
            stateName: 'Carolina del Sur',
        },
        SD: {
            stateISO: 'SD',
            stateName: 'Dakota del Sur',
        },
        TN: {
            stateISO: 'TN',
            stateName: 'Tennessee',
        },
        TX: {
            stateISO: 'TX',
            stateName: 'Texas',
        },
        UT: {
            stateISO: 'UT',
            stateName: 'Utah',
        },
        VA: {
            stateISO: 'VA',
            stateName: 'Virginia',
        },
        VT: {
            stateISO: 'VT',
            stateName: 'Vermont',
        },
        WA: {
            stateISO: 'WA',
            stateName: 'Washington',
        },
        WI: {
            stateISO: 'WI',
            stateName: 'Wisconsin',
        },
        WV: {
            stateISO: 'WV',
            stateName: 'Virginia Occidental',
        },
        WY: {
            stateISO: 'WY',
            stateName: 'Wyoming',
        },
        DC: {
            stateISO: 'DC',
            stateName: 'Distrito de Columbia',
        },
    },
    allCountries: {
        AF: 'Afganistán',
        AL: 'Albania',
        DE: 'Alemania',
        AD: 'Andorra',
        AO: 'Angola',
        AI: 'Anguila',
        AQ: 'Antártida',
        AG: 'Antigua y Barbuda',
        SA: 'Arabia Saudita',
        DZ: 'Argelia',
        AR: 'Argentina',
        AM: 'Armenia',
        AW: 'Aruba',
        AU: 'Australia',
        AT: 'Austria',
        AZ: 'Azerbaiyán',
        BS: 'Bahamas',
        BH: 'Bahrein',
        BD: 'Bangladesh',
        BB: 'Barbados',
        BE: 'Bélgica',
        BZ: 'Belice',
        BJ: 'Benin',
        BT: 'Bhután',
        BY: 'Bielorrusia',
        MM: 'Birmania',
        BO: 'Bolivia',
        BQ: 'Bonaire, San Eustaquio y Saba',
        BA: 'Bosnia y Herzegovina',
        BW: 'Botsuana',
        BR: 'Brazil',
        BN: 'Brunéi',
        BG: 'Bulgaria',
        BF: 'Burkina Faso',
        BI: 'Burundi',
        CV: 'Cabo Verde',
        KH: 'Camboya',
        CM: 'Camerún',
        CA: 'Canadá',
        TD: 'Chad',
        CL: 'Chile',
        CN: 'China',
        CY: 'Chipre',
        VA: 'Ciudad del Vaticano',
        CO: 'Colombia',
        KM: 'Comoras',
        KP: 'Corea del Norte',
        KR: 'Corea del Sur',
        CI: 'Costa de Marfil',
        CR: 'Costa Rica',
        HR: 'Croacia',
        CU: 'Cuba',
        CW: 'Curazao',
        DK: 'Dinamarca',
        DM: 'Dominica',
        EC: 'Ecuador',
        EG: 'Egipto',
        SV: 'El Salvador',
        AE: 'Emiratos Árabes Unidos',
        ER: 'Eritrea',
        SK: 'Eslovaquia',
        SI: 'Eslovenia',
        ES: 'España',
        US: 'Estados Unidos de América',
        EE: 'Estonia',
        ET: 'Etiopía',
        PH: 'Filipinas',
        FI: 'Finlandia',
        FJ: 'Fiyi',
        FR: 'Francia',
        GA: 'Gabón',
        GM: 'Gambia',
        GE: 'Georgia',
        GH: 'Ghana',
        GI: 'Gibraltar',
        GD: 'Granada',
        GR: 'Greece',
        GL: 'Groenlandia',
        GP: 'Guadeloupe',
        GU: 'Guam',
        GT: 'Guatemala',
        GF: 'Guayana Francesa',
        GG: 'Guernsey',
        GN: 'Guinea',
        GQ: 'Guinea Ecuatorial',
        GW: 'Guinea-Bissau',
        GY: 'Guyana',
        HT: 'Haiti',
        HN: 'Honduras',
        HK: 'Hong Kong',
        HU: 'Hungría',
        IN: 'India',
        ID: 'Indonesia',
        IQ: 'Irak',
        IR: 'Irán',
        IE: 'Irlanda',
        AC: 'Isla Ascensión',
        IM: 'Isla de Man',
        CX: 'Isla de Navidad',
        NF: 'Isla Norfolk',
        IS: 'Islandia',
        BM: 'Islas Bermudas',
        KY: 'Islas Caimán',
        CC: 'Islas Cocos (Keeling)',
        CK: 'Islas Cook',
        AX: 'Islas de Åland',
        FO: 'Islas Feroe',
        GS: 'Islas Georgias del Sur y Sandwich del Sur',
        MV: 'Islas Maldivas',
        FK: 'Islas Malvinas',
        MP: 'Islas Marianas del Norte',
        MH: 'Islas Marshall',
        PN: 'Islas Pitcairn',
        SB: 'Islas Salomón',
        TC: 'Islas Turcas y Caicos',
        UM: 'Islas Ultramarinas Menores de Estados Unidos',
        VG: 'Islas Vírgenes Británicas',
        VI: 'Islas Vírgenes de los Estados Unidos',
        IL: 'Israel',
        IT: 'Italia',
        JM: 'Jamaica',
        JP: 'Japón',
        JE: 'Jersey',
        JO: 'Jordania',
        KZ: 'Kazajistán',
        KE: 'Kenia',
        KG: 'Kirguistán',
        KI: 'Kiribati',
        XK: 'Kosovo',
        KW: 'Kuwait',
        LA: 'Laos',
        LS: 'Lesoto',
        LV: 'Letonia',
        LB: 'Líbano',
        LR: 'Liberia',
        LY: 'Libia',
        LI: 'Liechtenstein',
        LT: 'Lituania',
        LU: 'Luxemburgo',
        MO: 'Macao',
        MK: 'Macedônia',
        MG: 'Madagascar',
        MY: 'Malasia',
        MW: 'Malawi',
        ML: 'Mali',
        MT: 'Malta',
        MA: 'Marruecos',
        MQ: 'Martinica',
        MR: 'Mauritania',
        MU: 'Mauritius',
        YT: 'Mayotte',
        MX: 'México',
        FM: 'Micronesia',
        MD: 'Moldavia',
        MC: 'Mónaco',
        MN: 'Mongolia',
        ME: 'Montenegro',
        MS: 'Montserrat',
        MZ: 'Mozambique',
        NA: 'Namibia',
        NR: 'Nauru',
        NP: 'Nepal',
        NI: 'Nicaragua',
        NE: 'Niger',
        NG: 'Nigeria',
        NU: 'Niue',
        NO: 'Noruega',
        NC: 'Nueva Caledonia',
        NZ: 'Nueva Zealand',
        OM: 'Omán',
        NL: 'Países Bajos',
        PK: 'Pakistán',
        PW: 'Palau',
        PS: 'Palestina',
        PA: 'Panamá',
        PG: 'Papúa Nueva Guinea',
        PY: 'Paraguay',
        PE: 'Perú',
        PF: 'Polinesia Francesa',
        PL: 'Polonia',
        PT: 'Portugal',
        PR: 'Puerto Rico',
        QA: 'Qatar',
        GB: 'Reino Unido',
        CF: 'República Centroafricana',
        CZ: 'República Checa',
        SS: 'República de Sudán del Sur',
        CG: 'República del Congo',
        CD: 'República Democrática del Congo',
        DO: 'República Dominicana',
        RE: 'Reunión',
        RW: 'Ruanda',
        RO: 'Rumanía',
        RU: 'Rusia',
        EH: 'Sahara Occidental',
        WS: 'Samoa',
        AS: 'Samoa Americana',
        BL: 'San Bartolomé',
        KN: 'San Cristóbal y Nieves',
        SM: 'San Marino',
        MF: 'San Martín (Francia)',
        PM: 'San Pedro y Miquelón',
        VC: 'San Vicente y las Granadinas',
        SH: 'Santa Elena',
        LC: 'Santa Lucía',
        ST: 'Santo Tomé y Príncipe',
        SN: 'Senegal',
        RS: 'Serbia',
        SC: 'Seychelles',
        SL: 'Sierra Leona',
        SG: 'Singapur',
        SX: 'Sint Maarten',
        SY: 'Siria',
        SO: 'Somalia',
        LK: 'Sri Lanka',
        ZA: 'Sudáfrica',
        SD: 'Sudán',
        SE: 'Suecia',
        CH: 'Suiza',
        SR: 'Surinám',
        SJ: 'Svalbard y Jan Mayen',
        SZ: 'Swazilandia',
        TH: 'Tailandia',
        TW: 'Taiwán',
        TZ: 'Tanzania',
        TJ: 'Tayikistán',
        IO: 'Territorio Británico del Océano Índico',
        TF: 'Territorios Australes y Antárticas Franceses',
        TL: 'Timor Oriental',
        TG: 'Togo',
        TK: 'Tokelau',
        TO: 'Tonga',
        TT: 'Trinidad y Tobago',
        TA: 'Tristán de Acuña',
        TN: 'Tunez',
        TM: 'Turkmenistán',
        TR: 'Turquía',
        TV: 'Tuvalu',
        UA: 'Ucrania',
        UG: 'Uganda',
        UY: 'Uruguay',
        UZ: 'Uzbekistan',
        VU: 'Vanuatu',
        VE: 'Venezuela',
        VN: 'Vietnam',
        WF: 'Wallis y Futuna',
        YE: 'Yemen',
        DJ: 'Yibuti',
        ZM: 'Zambia',
        ZW: 'Zimbabue',
    },
    accessibilityHints: {
        navigateToChatsList: 'Vuelve a la lista de chats',
        chatWelcomeMessage: 'Mensaje de bienvenida al chat',
        navigatesToChat: 'Navega a un chat',
        newMessageLineIndicator: 'Indicador de nueva línea de mensaje',
        chatMessage: 'mensaje de chat',
        lastChatMessagePreview: 'Vista previa del último mensaje del chat',
        workspaceName: 'Nombre del espacio de trabajo',
        chatUserDisplayNames: 'Nombres de los miembros del chat',
        scrollToNewestMessages: 'Desplázate a los mensajes más recientes',
        preStyledText: 'texto preestilizado',
        viewAttachment: 'Ver archivo adjunto',
    },
    parentReportAction: {
        deletedReport: 'Informe eliminado',
        deletedMessage: 'Mensaje eliminado',
        deletedExpense: 'Gasto eliminado',
        reversedTransaction: 'Transacción anulada',
        deletedTask: 'Tarea eliminada',
        hiddenMessage: 'Mensaje oculto',
    },
    threads: {
        thread: 'Hilo',
        replies: 'Respuestas',
        reply: 'Respuesta',
        from: 'De',
        in: 'en',
        parentNavigationSummary: ({reportName, workspaceName}) => `De ${reportName}${workspaceName ? ` en ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: 'Copiar URL',
        copied: '¡Copiado!',
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
        submit: 'Pedirle a alguien que lo pague',
        categorize: 'Categorizarlo',
        share: 'Compartirlo con mi contador',
        nothing: 'Por ahora, nada',
    },
    moderation: {
        flagDescription: 'Todos los mensajes marcados se enviarán a un moderador para tu revisión.',
        chooseAReason: 'Elige abajo un motivo para reportarlo:',
        spam: 'Spam',
        spamDescription: 'Publicidad no solicitada',
        inconsiderate: 'Desconsiderado',
        inconsiderateDescription: 'Frase insultante o irrespetuosa, con intenciones cuestionables',
        intimidation: 'Intimidación',
        intimidationDescription: 'Persigue agresivamente una agenda sobre objeciones válidas',
        bullying: 'Bullying',
        bullyingDescription: 'Se dirige a un individuo para obtener obediencia',
        harassment: 'Acoso',
        harassmentDescription: 'Comportamiento racista, misógino u otro comportamiento discriminatorio',
        assault: 'Agresion',
        assaultDescription: 'Ataque emocional específicamente dirigido con la intención de hacer daño',
        flaggedContent: 'Este mensaje ha sido marcado por violar las reglas de nuestra comunidad y el contenido se ha ocultado.',
        hideMessage: 'Ocultar mensaje',
        revealMessage: 'Revelar mensaje',
        levelOneResult: 'Envía una advertencia anónima y el mensaje es reportado para revisión.',
        levelTwoResult: 'Mensaje ocultado en el canal, más advertencia anónima y mensaje reportado para revisión.',
        levelThreeResult: 'Mensaje eliminado del canal, más advertencia anónima y mensaje reportado para revisión.',
    },
    teachersUnitePage: {
        teachersUnite: 'Profesores Unidos',
        joinExpensifyOrg: 'Únete a Expensify.org para eliminar la injusticia en todo el mundo y ayuda a los profesores a dividir sus gastos para las aulas más necesitadas.',
        iKnowATeacher: 'Yo conozco a un profesor',
        iAmATeacher: 'Soy profesor',
        getInTouch: '¡Excelente! Por favor, comparte tu información para que podamos ponernos en contacto con ellos.',
        introSchoolPrincipal: 'Introducción al director del colegio',
        schoolPrincipalVerifyExpense:
            'Expensify.org divide el coste del material escolar esencial para que los estudiantes de familias con bajos ingresos puedan tener una mejor experiencia de aprendizaje. Se pedirá a tu director que verifique tus gastos.',
        principalFirstName: 'Nombre del director',
        principalLastName: 'Apellido del director',
        principalWorkEmail: 'Correo electrónico de trabajo del director',
        updateYourEmail: 'Actualiza tu dirección de correo electrónico',
        updateEmail: 'Actualización de la dirección de correo electrónico',
        schoolMailAsDefault: (contactMethodsRoute) =>
            `Antes de seguir adelante, asegúrate de establecer el correo electrónico de tu colegio como método de contacto predeterminado. Puede hacerlo en Configuración > Perfil > <a href="${contactMethodsRoute}">Métodos de contacto</a>.`,
        error: {
            enterPhoneEmail: 'Ingrese un correo electrónico o número de teléfono válido',
            enterEmail: 'Introduce un correo electrónico',
            enterValidEmail: 'Introduzca un correo electrónico válido',
            tryDifferentEmail: 'Por favor intenta con un correo electrónico diferente',
        },
    },
    cardTransactions: {
        notActivated: 'No activado',
        outOfPocket: 'Gastos por cuenta propia',
        companySpend: 'Gastos de empresa',
    },
    distance: {
        addStop: 'Añadir parada',
        deleteWaypoint: 'Eliminar punto de ruta',
        deleteWaypointConfirmation: '¿Estás seguro de que quieres eliminar este punto de ruta?',
        address: 'Dirección',
        waypointDescription: {
            start: 'Comienzo',
            stop: 'Parada',
        },
        mapPending: {
            title: 'Mapa pendiente',
            subtitle: 'El mapa se generará cuando vuelvas a estar en línea',
            onlineSubtitle: 'Un momento mientras configuramos el mapa',
            errorTitle: 'Mapa error',
            errorSubtitle: 'No se pudo cargar el mapa. Por favor, inténtalo de nuevo.',
        },
        error: {
            selectSuggestedAddress: 'Por favor, selecciona una dirección sugerida o usa la ubicación actual',
        },
        odometer: {
            startReading: 'Lectura inicial',
            endReading: 'Lectura final',
            saveForLater: 'Guardar para después',
            totalDistance: 'Distancia total',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Notificar la pérdida o deterioro de la tarjeta',
        nextButtonLabel: 'Siguiente',
        reasonTitle: '¿Por qué necesitas una tarjeta nueva?',
        cardDamaged: 'Mi tarjeta está dañada',
        cardLostOrStolen: 'He perdido o me han robado la tarjeta',
        confirmAddressTitle: 'Por favor, confirma la dirección postal de tu nueva tarjeta.',
        cardDamagedInfo: 'La nueva tarjeta te llegará en 2-3 días laborables. La tarjeta actual seguirá funcionando hasta que actives la nueva.',
        cardLostOrStolenInfo: 'La tarjeta actual se desactivará permanentemente en cuanto realices el pedido. La mayoría de las tarjetas llegan en pocos días laborables.',
        address: 'Dirección',
        deactivateCardButton: 'Desactivar tarjeta',
        shipNewCardButton: 'Enviar tarjeta nueva',
        addressError: 'La dirección es obligatoria',
        reasonError: 'Se requiere justificación',
        successTitle: '¡Tu nueva tarjeta está en camino!',
        successDescription: 'Tendrás que activarla cuando llegue en unos días hábiles. Mientras tanto, puedes usar una tarjeta virtual.',
    },
    eReceipt: {
        guaranteed: 'eRecibo garantizado',
        transactionDate: 'Fecha de transacción',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Inicia un chat y <success><strong>recomienda a un amigo</strong></success>',
            header: 'Inicia un chat, recomienda a un amigo',
            body: '¿Quieres que tus amigos también usen Expensify? Simplemente inicia un chat con ellos y nosotros nos encargaremos del resto.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Presenta un gasto y <success><strong>recomienda a tu equipo</strong></success>',
            header: 'Envía un gasto, recomienda a tu equipo',
            body: '¿Quieres que tu equipo también use Expensify? Simplemente envíale un gasto y nosotros nos encargaremos del resto.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Recomienda a un amigo',
            body: '¿Quieres que tus amigos también usen Expensify? Simplemente chatea, paga o divide un gasto con ellos y nosotros nos encargaremos del resto. ¡O simplemente comparte tu enlace de invitación!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Recomienda a un amigo',
            header: 'Recomienda a un amigo',
            body: '¿Quieres que tus amigos también usen Expensify? Simplemente chatea, paga o divide un gasto con ellos y nosotros nos encargaremos del resto. ¡O simplemente comparte tu enlace de invitación!',
        },
        copyReferralLink: 'Copiar enlace de invitación',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}) => `Chatea con tu especialista asignado en <a href="${href}">${adminReportName}</a> para obtener ayuda`,
        default: `Envía un correo electrónico a <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> para obtener ayuda con la configuración`,
    },
    violations: {
        allTagLevelsRequired: 'Todas las etiquetas son obligatorias',
        autoReportedRejectedExpense: 'Este gasto fue rechazado.',
        billableExpense: 'La opción facturable ya no es válida',
        cashExpenseWithNoReceipt: ({formattedLimit} = {}) => `Recibo obligatorio para cantidades mayores de ${formattedLimit}`,
        categoryOutOfPolicy: 'La categoría ya no es válida',
        conversionSurcharge: ({surcharge}) => `${surcharge}% de recargo aplicado`,
        customUnitOutOfPolicy: 'Tasa inválida para este espacio de trabajo',
        duplicatedTransaction: 'Posible duplicado',
        fieldRequired: 'Los campos del informe son obligatorios',
        futureDate: 'Fecha futura no permitida',
        invoiceMarkup: ({invoiceMarkup}) => `Incrementado un ${invoiceMarkup}%`,
        maxAge: ({maxAge}) => `Fecha de más de ${maxAge} días`,
        missingCategory: 'Falta categoría',
        missingComment: 'Descripción obligatoria para la categoría seleccionada',
        missingAttendees: 'Se requieren múltiples asistentes para esta categoría',
        missingTag: ({tagName} = {}) => `Falta ${tagName ?? 'etiqueta'}`,
        modifiedAmount: ({type, displayPercentVariance}) => {
            switch (type) {
                case 'distance':
                    return 'Importe difiere del calculado basado en distancia';
                case 'card':
                    return 'Importe mayor al de la transacción de la tarjeta';
                default:
                    if (displayPercentVariance) {
                        return `Importe ${displayPercentVariance}% mayor al del recibo escaneado`;
                    }
                    return 'Importe mayor al del recibo escaneado';
            }
        },
        modifiedDate: 'Fecha difiere del recibo escaneado',
        nonExpensiworksExpense: 'Gasto no proviene de Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}) => `Importe supera el límite de aprobación automática${formattedLimit ? ` de ${formattedLimit}` : ''}`,
        overCategoryLimit: ({formattedLimit}) => `Importe supera el límite para la categoría${formattedLimit ? ` de ${formattedLimit}/persona` : ''}`,
        overLimit: ({formattedLimit}) => `Importe supera el límite${formattedLimit ? ` de ${formattedLimit}/persona` : ''}`,
        overTripLimit: ({formattedLimit}) => `Importe supera el límite${formattedLimit ? ` de ${formattedLimit}/viaje` : ''}`,
        overLimitAttendee: ({formattedLimit}) => `Importe supera el límite${formattedLimit ? ` de ${formattedLimit}/persona` : ''}`,
        perDayLimit: ({formattedLimit}) => `Importe supera el límite diario de la categoría${formattedLimit ? ` de ${formattedLimit}/persona` : ''}`,
        receiptNotSmartScanned: 'Detalles del recibo y del gasto añadidos manualmente.',
        receiptRequired: ({formattedLimit, category}) => {
            if (formattedLimit && category) {
                return `Recibo obligatorio para importes sobre ${formattedLimit} el límite de la categoría`;
            }

            if (formattedLimit) {
                return `Recibo obligatorio para importes sobre ${formattedLimit}`;
            }

            if (category) {
                return 'Recibo obligatorio para importes sobre el límite de la categoría';
            }

            return 'Recibo obligatorio';
        },
        itemizedReceiptRequired: ({formattedLimit}) => `Recibo detallado requerido${formattedLimit ? ` para importes sobre ${formattedLimit}` : ''}`,
        prohibitedExpense: ({prohibitedExpenseTypes}) => {
            const preMessage = 'Gastos prohibidos:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `alcohol`;
                    case 'gambling':
                        return `juegos de apuestas`;
                    case 'tobacco':
                        return `tabaco`;
                    case 'adultEntertainment':
                        return `entretenimiento para adultos`;
                    case 'hotelIncidentals':
                        return `gastos adicionales de hotel`;
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
        customRules: ({message}) => message,
        reviewRequired: 'Revisión requerida',
        rter: ({brokenBankConnection, isAdmin, isTransactionOlderThan7Days, member, rterType, companyCardPageURL}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'No se puede emparejar automáticamente el recibo debido a una conexión bancaria interrumpida.';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Conexión bancaria interrumpida. <a href="${companyCardPageURL}">Vuelve a conectarte para emparejar el recibo</a>`
                    : 'Conexión bancaria interrumpida. Pide a un administrador que la vuelva a conectar para emparejar el recibo.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin
                    ? `Pide a ${member} que marque la transacción como efectivo o espera 7 días e inténtalo de nuevo`
                    : 'Esperando a adjuntar automáticamente la transacción de tarjeta de crédito';
            }
            return '';
        },
        brokenConnection530Error: 'Recibo pendiente debido a una conexión bancaria rota',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}) =>
            `<muted-text-label>Recibo pendiente debido a una conexión bancaria rota. Por favor, resuélvelo en <a href="${workspaceCompanyCardRoute}">Tarjetas de empresa</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Recibo pendiente debido a una conexión bancaria rota. Por favor, pide a un administrador del espacio de trabajo que lo resuelva.',
        markAsCashToIgnore: 'Márcalo como efectivo para ignorar y solicitar el pago.',
        smartscanFailed: ({canEdit = true}) => `No se pudo escanear el recibo.${canEdit ? ' Introduce los datos manualmente.' : ''}`,
        receiptGeneratedWithAI: 'Posible recibo generado por IA',
        someTagLevelsRequired: ({tagName} = {}) => `Falta ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName} = {}) => `La etiqueta ${tagName ? `${tagName} ` : ''}ya no es válida`,
        taxAmountChanged: 'El importe del impuesto fue modificado',
        taxOutOfPolicy: ({taxName} = {}) => `${taxName ?? 'El impuesto'} ya no es válido`,
        taxRateChanged: 'La tasa de impuesto fue modificada',
        taxRequired: 'Falta la tasa de impuesto',
        none: 'Ninguno',
        taxCodeToKeep: 'Elige qué tasa de impuesto quieres conservar',
        tagToKeep: 'Elige qué etiqueta quieres conservar',
        isTransactionReimbursable: 'Elige si la transacción es reembolsable',
        merchantToKeep: 'Elige qué comerciante quieres conservar',
        descriptionToKeep: 'Elige qué descripción quieres conservar',
        categoryToKeep: 'Elige qué categoría quieres conservar',
        isTransactionBillable: 'Elige si la transacción es facturable',
        keepThisOne: 'Mantener éste',
        confirmDetails: 'Confirma los detalles que conservas',
        confirmDuplicatesInfo: 'Los duplicados que no conserves se mantendrán para que el remitente los elimine.',
        hold: 'Este gasto está retenido',
        resolvedDuplicates: 'resolvió el duplicado',
        companyCardRequired: 'Se requieren compras con la tarjeta de la empresa.',
        noRoute: 'Por favor, selecciona una dirección válida',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}) => `${fieldName} es obligatorio`,
        reportContainsExpensesWithViolations: 'El informe contiene gastos con violaciones.',
    },
    violationDismissal: {
        rter: {
            manual: 'marcó el recibo como pagado en efectivo',
        },
        duplicatedTransaction: {
            manual: 'resolvió el duplicado',
        },
    },
    videoPlayer: {
        play: 'Reproducir',
        pause: 'Pausar',
        fullscreen: 'Pantalla completa',
        playbackSpeed: 'Velocidad',
        expand: 'Expandir',
        mute: 'Silenciar',
        unmute: 'Activar sonido',
        normal: 'Normal',
    },
    exitSurvey: {
        header: 'Antes de irte',
        reasonPage: {
            title: 'Dinos por qué te vas',
            subtitle: 'Antes de irte, por favor dinos por qué te gustaría cambiarte a Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Necesito una función que sólo está disponible en Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'No entiendo cómo usar New Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Entiendo cómo usar New Expensify, pero prefiero Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: '¿Qué función necesitas que no esté disponible en New Expensify?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '¿Qué estás tratando de hacer?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '¿Por qué prefieres Expensify Classic?',
        },
        responsePlaceholder: 'Tu respuesta',
        thankYou: '¡Gracias por tus comentarios!',
        thankYouSubtitle: 'Sus respuestas nos ayudarán a crear un mejor producto para hacer las cosas bien. ¡Muchas gracias!',
        goToExpensifyClassic: 'Cambiar a Expensify Classic',
        offlineTitle: 'Parece que estás atrapado aquí...',
        offline:
            'Parece que estás desconectado. Desafortunadamente, Expensify Classic no funciona sin conexión, pero New Expensify sí. Si prefieres utilizar Expensify Classic, inténtalo de nuevo cuando tengas conexión a internet.',
        quickTip: 'Consejo rápido...',
        quickTipSubTitle: 'Puedes ir directamente a Expensify Classic visitando expensify.com. Márcalo como favorito para tener un acceso directo fácil.',
        bookACall: 'Reservar una llamada',
        bookACallTitle: '¿Desea hablar con un responsable de producto?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Chat directo sobre gastos e informes',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Posibilidad de hacerlo todo desde el móvil',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Viajes y gastos a la velocidad del chat',
        },
        bookACallTextTop: 'Al cambiar a Expensify Classic, se perderá:',
        bookACallTextBottom: 'Nos encantaría hablar con usted para entender por qué. Puede concertar una llamada con uno de nuestros jefes de producto para hablar de sus necesidades.',
        takeMeToExpensifyClassic: 'Llévame a Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Se ha producido un error al cargar más mensajes',
        tryAgain: 'Inténtalo de nuevo',
    },
    systemMessage: {
        mergedWithCashTransaction: 'encontró un recibo para esta transacción',
    },
    subscription: {
        authenticatePaymentCard: 'Autenticar tarjeta de pago',
        mobileReducedFunctionalityMessage: 'No puedes hacer cambios en tu suscripción en la aplicación móvil.',
        badge: {
            freeTrial: (numOfDays) => `Prueba gratuita: ${numOfDays === 1 ? `queda 1 día` : `quedan ${numOfDays} días`}`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Tu información de pago está desactualizada',
                subtitle: (date) => `Actualiza tu tarjeta de pago antes del ${date} para continuar utilizando todas tus herramientas favoritas`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'No se pudo procesar tu pago',
                subtitle: (date, purchaseAmountOwed) =>
                    date && purchaseAmountOwed
                        ? `No se ha podido procesar tu cargo de ${purchaseAmountOwed} del día ${date}. Por favor, añade una tarjeta de pago para saldar la cantidad adeudada.`
                        : 'Por favor, añade una tarjeta de pago para saldar la cantidad adeudada.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Tu información de pago está desactualizada',
                subtitle: (date) => `Tu pago está vencido. Por favor, paga tu factura antes del ${date} para evitar la interrupción del servicio.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Tu información de pago está desactualizada',
                subtitle: 'Tu pago está vencido. Por favor, paga tu factura.',
            },
            billingDisputePending: {
                title: 'No se ha podido realizar el cobro a tu tarjeta',
                subtitle: (amountOwed, cardEnding) =>
                    `Has impugnado el cargo ${amountOwed} en la tarjeta terminada en ${cardEnding}. Tu cuenta estará bloqueada hasta que se resuelva la disputa con tu banco.`,
            },
            cardAuthenticationRequired: {
                title: 'Tu tarjeta de pago no ha sido autenticada por completo.',
                subtitle: (cardEnding) => `Completa el proceso de autenticación para activar tu tarjeta de pago que termina en ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'No se ha podido realizar el cobro a tu tarjeta',
                subtitle: (amountOwed) =>
                    `Tu tarjeta de pago fue rechazada por falta de fondos. Vuelve a intentarlo o añade una nueva tarjeta de pago para liquidar tu saldo pendiente de ${amountOwed}.`,
            },
            cardExpired: {
                title: 'No se ha podido realizar el cobro a tu tarjeta',
                subtitle: (amountOwed) => `Tu tarjeta de pago ha expirado. Por favor, añade una nueva tarjeta de pago para liquidar tu saldo pendiente de ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'Tu tarjeta caducará pronto',
                subtitle:
                    'Tu tarjeta de pago caducará a finales de este mes. Haz clic en el menú de tres puntos que aparece a continuación para actualizarla y continuar utilizando todas tus herramientas favoritas.',
            },
            retryBillingSuccess: {
                title: 'Éxito!',
                subtitle: 'Tu tarjeta fue facturada correctamente.',
            },
            retryBillingError: {
                title: 'No se ha podido realizar el cobro a tu tarjeta',
                subtitle:
                    'Antes de volver a intentarlo, llama directamente a tu banco para que autorice los cargos de Expensify y elimine las retenciones. De lo contrario, añade una tarjeta de pago diferente.',
            },
            cardOnDispute: (amountOwed, cardEnding) =>
                `Has impugnado el cargo ${amountOwed} en la tarjeta terminada en ${cardEnding}. Tu cuenta estará bloqueada hasta que se resuelva la disputa con tu banco.`,
            preTrial: {
                title: 'Iniciar una prueba gratuita',
                subtitle: 'El próximo paso es <a href="#">completar la configuración</a> para que tu equipo pueda empezar a enviar gastos.',
            },
            trialStarted: {
                title: ({numOfDays}) => `Prueba gratuita: ¡${numOfDays === 1 ? `queda 1 día` : `${numOfDays} días`}!`,
                subtitle: 'Añade una tarjeta de pago para seguir utilizando tus funciones favoritas.',
            },
            trialEnded: {
                title: 'Tu prueba gratuita ha terminado',
                subtitle: 'Añade una tarjeta de pago para seguir utilizando tus funciones favoritas.',
            },
            earlyDiscount: {
                claimOffer: 'Solicitar oferta',
                subscriptionPageTitle: (discountType) =>
                    `<strong>¡${discountType}% de descuento en tu primer año!</strong> ¡Solo añade una tarjeta de pago y comienza una suscripción anual!`,
                onboardingChatTitle: (discountType) => `Oferta por tiempo limitado: ¡${discountType}% de descuento en tu primer año!`,
                subtitle: (days, hours, minutes, seconds) => `Solicítala en ${days > 0 ? `${days}d : ` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Pago',
            subtitle: 'Añade una tarjeta para pagar tu suscripción a Expensify.',
            addCardButton: 'Añade tarjeta de pago',
            cardInfo: (name, expiration, currency) => `Nombre: ${name}, Expiración: ${expiration}, Moneda: ${currency}`,
            cardNextPayment: (nextPaymentDate) => `Tu próxima fecha de pago es ${nextPaymentDate}.`,
            cardEnding: (cardNumber) => `Tarjeta terminada en ${cardNumber}`,
            changeCard: 'Cambiar tarjeta de pago',
            changeCurrency: 'Cambiar moneda de pago',
            cardNotFound: 'No se ha añadido ninguna tarjeta de pago',
            retryPaymentButton: 'Reintentar el pago',
            authenticatePayment: 'Autenticar el pago',
            requestRefund: 'Solicitar reembolso',
            requestRefundModal: {
                full: 'Obtener un reembolso es fácil, simplemente baja tu cuenta de categoría antes de la próxima fecha de facturación y recibirás un reembolso. <br /> <br /> Atención: Bajar tu cuenta de categoría significa que tu(s) espacio(s) de trabajo será(n) eliminado(s). Esta acción no se puede deshacer, pero siempre puedes crear un nuevo espacio de trabajo si cambias de opinión.',
                confirm: 'Eliminar y bajar de categoría',
            },
            viewPaymentHistory: 'Ver historial de pagos',
        },
        yourPlan: {
            title: 'Tu plan',
            exploreAllPlans: 'Explorar todos los planes',
            customPricing: 'Precios personalizados',
            asLowAs: ({price}) => `desde ${price} por miembro activo/mes`,
            pricePerMemberMonth: ({price}) => `${price} por miembro/mes`,
            pricePerMemberPerMonth: ({price}) => `${price} por miembro por mes`,
            perMemberMonth: 'por miembro/mes',
            collect: {
                title: 'Recopilar',
                description: 'El plan para pequeñas empresas que te ofrece gestión de gastos, viajes y chat.',
                priceAnnual: ({lower, upper}) => `Desde ${lower}/miembro activo con la Tarjeta Expensify, ${upper}/miembro activo sin la Tarjeta Expensify.`,
                pricePayPerUse: ({lower, upper}) => `Desde ${lower}/miembro activo con la Tarjeta Expensify, ${upper}/miembro activo sin la Tarjeta Expensify.`,
                benefit1: 'Escaneo de recibos',
                benefit2: 'Reembolsos',
                benefit3: 'Gestión de tarjetas corporativas',
                benefit4: 'Aprobaciones de gastos y viajes',
                benefit5: 'Reservas y reglas de viaje',
                benefit6: 'Integraciones con QuickBooks/Xero',
                benefit7: 'Chat sobre gastos, reportes y salas',
                benefit8: 'Soporte con IA y asistencia humana',
            },
            control: {
                title: 'Controlar',
                description: 'Gastos, viajes y chat para empresas más grandes.',
                priceAnnual: ({lower, upper}) => `Desde ${lower}/miembro activo con la Tarjeta Expensify, ${upper}/miembro activo sin la Tarjeta Expensify.`,
                pricePayPerUse: ({lower, upper}) => `Desde ${lower}/miembro activo con la Tarjeta Expensify, ${upper}/miembro activo sin la Tarjeta Expensify.`,
                benefit1: 'Todo lo incluido en el plan Collect',
                benefit2: 'Flujos de aprobación multinivel',
                benefit3: 'Reglas de gastos personalizadas',
                benefit4: 'Integraciones con ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Integraciones con RR. HH. (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Informes y análisis personalizados',
                benefit8: 'Presupuestación',
            },
            thisIsYourCurrentPlan: 'Este es tu plan actual',
            downgrade: 'Reducir a Collect',
            upgrade: 'Actualizar a Control',
            addMembers: 'Agregar miembros',
            saveWithExpensifyTitle: 'Ahorra con la Tarjeta Expensify',
            saveWithExpensifyDescription: 'Utiliza nuestra calculadora de ahorro para ver cómo el reembolso en efectivo de la Tarjeta Expensify puede reducir tu factura de Expensify',
            saveWithExpensifyButton: 'Más información',
        },
        compareModal: {
            comparePlans: 'Comparar planes',
            subtitle: `<muted-text>Desbloquea las funciones que necesitas con el plan adecuado para ti. <a href="${CONST.PRICING}">Consulta nuestra página de precios</a> para ver un desglose completo de las funciones de cada uno de nuestros planes.</muted-text>`,
        },
        details: {
            title: 'Datos de suscripción',
            annual: 'Suscripción anual',
            taxExempt: 'Solicitar estado de exención de impuestos',
            taxExemptEnabled: 'Exento de impuestos',
            taxExemptStatus: 'Estado de exención de impuestos',
            payPerUse: 'Pago por uso',
            subscriptionSize: 'Tamaño de suscripción',
            headsUp:
                'Atención: Si no estableces ahora el tamaño de tu suscripción, lo haremos automáticamente con el número de suscriptores activos del primer mes. A partir de ese momento, estarás suscrito para pagar al menos por ese número de afiliados durante los 12 meses siguientes. Puedes aumentar el tamaño de tu suscripción en cualquier momento, pero no puedes reducirlo hasta que finalice tu suscripción.',
            zeroCommitment: 'Compromiso cero con la tarifa de suscripción anual reducida',
        },
        subscriptionSize: {
            title: 'Tamaño de suscripción',
            yourSize: 'El tamaño de tu suscripción es el número de plazas abiertas que puede ocupar cualquier miembro activo en un mes determinado.',
            eachMonth:
                'Cada mes, tu suscripción cubre hasta el número de miembros activos establecido anteriormente. Cada vez que aumentes el tamaño de tu suscripción, iniciarás una nueva suscripción de 12 meses con ese nuevo tamaño.',
            note: 'Nota: Un miembro activo es cualquiera que haya creado, editado, enviado, aprobado, reembolsado, o exportado datos de gastos vinculados al espacio de trabajo de tu empresa.',
            confirmDetails: 'Confirma los datos de tu nueva suscripción anual:',
            subscriptionSize: 'Tamaño de suscripción',
            activeMembers: ({size}) => `${size} miembros activos/mes`,
            subscriptionRenews: 'Renovación de la suscripción',
            youCantDowngrade: 'No puedes bajar de categoría durante tu suscripción anual.',
            youAlreadyCommitted: ({size, date}) =>
                `Ya se ha comprometido a un tamaño de suscripción anual de ${size} miembros activos al mes hasta el ${date}. Puede cambiar a una suscripción de pago por uso en ${date} desactivando la auto-renovación.`,
            error: {
                size: 'Por favor ingrese un tamaño de suscripción valido',
                sameSize: 'Por favor, introduce un número diferente al de tu subscripción actual',
            },
        },
        paymentCard: {
            addPaymentCard: 'Añade tarjeta de pago',
            enterPaymentCardDetails: 'Introduce los datos de tu tarjeta de pago',
            security: 'Expensify es PCI-DSS obediente, utiliza cifrado a nivel bancario, y emplea infraestructura redundante para proteger tus datos.',
            learnMoreAboutSecurity: 'Obtén más información sobre nuestra seguridad.',
        },
        subscriptionSettings: {
            title: 'Configuración de suscripción',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}) =>
                `Tipo de suscripción: ${subscriptionType}, Tamaño de suscripción: ${subscriptionSize}, Renovación automática: ${autoRenew}, Aumento automático de asientos anuales: ${autoIncrease}`,
            none: 'ninguno',
            on: 'activado',
            off: 'desactivado',
            annual: 'Anual',
            autoRenew: 'Auto-renovación',
            autoIncrease: 'Auto-incremento',
            saveUpTo: ({amountWithCurrency}) => `Ahorre hasta ${amountWithCurrency} al mes por miembro activo`,
            automaticallyIncrease:
                'Aumenta automáticamente tus plazas anuales para dar lugar a los miembros activos que superen el tamaño de tu suscripción. Nota: Esto ampliará la fecha de finalización de tu suscripción anual.',
            disableAutoRenew: 'Desactivar auto-renovación',
            helpUsImprove: 'Ayúdanos a mejorar Expensify',
            whatsMainReason: '¿Cuál es la razón principal por la que deseas desactivar la auto-renovación?',
            renewsOn: ({date}) => `Se renovará el ${date}.`,
            pricingConfiguration: 'El precio depende de la configuración. Para obtener el precio más bajo, elige una suscripción anual y obtén la Tarjeta Expensify.',
            learnMore: ({hasAdminsRoom}) =>
                `<muted-text>Obtén más información en nuestra <a href="${CONST.PRICING}">página de precios</a> o chatea con nuestro equipo en tu ${hasAdminsRoom ? `<a href="adminsRoom">sala #admins.</a>` : '#admins room.'}</muted-text>`,
            estimatedPrice: 'Precio estimado',
            changesBasedOn: 'Esto varía según el uso de tu Tarjeta Expensify y las opciones de suscripción que elijas a continuación.',
        },
        requestEarlyCancellation: {
            title: 'Solicitar cancelación anticipada',
            subtitle: '¿Cuál es la razón principal por la que solicitas la cancelación anticipada?',
            subscriptionCanceled: {
                title: 'Suscripción cancelada',
                subtitle: 'Tu suscripción anual ha sido cancelada.',
                info: 'Ya puedes seguir utilizando tu(s) espacio(s) de trabajo en la modalidad de pago por uso.',
                preventFutureActivity: ({workspacesListRoute}) =>
                    `Si quieres evitar actividad y cargos futuros, debes <a href="${workspacesListRoute}">eliminar tu(s) espacio(s) de trabajo.</a> Ten en cuenta que cuando elimines tu(s) espacio(s) de trabajo, se te cobrará cualquier actividad pendienteque se haya incurrido durante el mes en curso.`,
            },
            requestSubmitted: {
                title: 'Solicitud enviada',
                subtitle:
                    'Gracias por hacernos saber que deseas cancelar tu suscripción. Estamos revisando tu solicitud y nos comunicaremos contigo en breve a través de tu chat con <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Al solicitar la cancelación anticipada, reconozco y acepto que Expensify no tiene ninguna obligación de conceder dicha solicitud en virtud de las <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Condiciones de Servicio</a> de Expensify u otro acuerdo de servicios aplicable entre Expensify y yo, y que Expensify se reserva el derecho exclusivo a conceder dicha solicitud.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Hay que mejorar la funcionalidad',
        tooExpensive: 'Demasiado caro',
        inadequateSupport: 'Atención al cliente inadecuada',
        businessClosing: 'Cierre, reducción, o adquisición de la empresa',
        additionalInfoTitle: '¿A qué software está migrando y por qué?',
        additionalInfoInputLabel: 'Tu respuesta',
    },
    roomChangeLog: {
        updateRoomDescription: 'establece la descripción de la sala a:',
        clearRoomDescription: 'la descripción de la habitación ha sido borrada',
        changedRoomAvatar: 'Cambió el avatar de la sala',
        removedRoomAvatar: 'Eliminó el avatar de la sala',
    },
    delegate: {
        switchAccount: 'Cambiar de cuenta:',
        copilotDelegatedAccess: 'Copilot: Acceso delegado',
        copilotDelegatedAccessDescription: 'Permitir que otros miembros accedan a tu cuenta.',
        addCopilot: 'Agregar copiloto',
        membersCanAccessYourAccount: 'Estos miembros pueden acceder a tu cuenta:',
        youCanAccessTheseAccounts: 'Puedes acceder a estas cuentas a través del conmutador de cuentas:',
        role: ({role} = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Completo';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Limitado';
                default:
                    return '';
            }
        },
        genericError: '¡Ups! Ha ocurrido un error. Por favor, inténtalo de nuevo.',
        onBehalfOfMessage: (delegator) => `en nombre de ${delegator}`,
        accessLevel: 'Nivel de acceso',
        confirmCopilot: 'Confirma tu copiloto a continuación.',
        accessLevelDescription: 'Elige un nivel de acceso a continuación. Tanto el acceso Completo como el Limitado permiten a los copilotos ver todas las conversaciones y gastos.',
        roleDescription: ({role} = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Permite a otro miembro realizar todas las acciones en tu cuenta, en tu nombre. Incluye chat, presentaciones, aprobaciones, pagos, actualizaciones de configuración y más.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Permite a otro miembro realizar la mayoría de las acciones en tu cuenta, en tu nombre. Excluye aprobaciones, pagos, rechazos y retenciones.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Eliminar copiloto',
        removeCopilotConfirmation: '¿Estás seguro de que quieres eliminar este copiloto?',
        changeAccessLevel: 'Cambiar nivel de acceso',
        makeSureItIsYou: 'Vamos a asegurarnos de que eres tú',
        enterMagicCode: (contactMethod) => `Por favor, introduce el código mágico enviado a ${contactMethod} para agregar un copiloto. Debería llegar en un par de minutos.`,
        enterMagicCodeUpdate: (contactMethod) => `Por favor, introduce el código mágico enviado a ${contactMethod} para actualizar el nivel de acceso de tu copiloto.`,
        notAllowed: 'No tan rápido...',
        noAccessMessage: 'Como copiloto, no tienes acceso a esta página. ¡Lo sentimos!',
        notAllowedMessage: (accountOwnerEmail) =>
            `Como <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copiloto</a> de ${accountOwnerEmail}, no tienes permiso para realizar esta acción. ¡Lo siento!`,
        copilotAccess: 'Acceso a Copilot',
    },
    debug: {
        debug: 'Depuración',
        details: 'Detalles',
        JSON: 'JSON',
        reportActions: 'Acciones',
        reportActionPreview: 'Previa',
        nothingToPreview: 'Nada que previsualizar',
        editJson: 'Editar JSON:',
        preview: 'Previa:',
        missingProperty: ({propertyName}) => `Falta ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}) => `Propiedad inválida: ${propertyName} - Esperado: ${expectedType}`,
        invalidValue: ({expectedValues}) => `Valor inválido - Esperado: ${expectedValues}`,
        missingValue: 'Valor en falta',
        createReportAction: 'Crear acción de informe',
        reportAction: 'Acciones del informe',
        report: 'Informe',
        transaction: 'Transacción',
        violations: 'Violaciones',
        transactionViolation: 'Violación de transacción',
        hint: 'Los cambios de datos no se enviarán al backend',
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
        viewReport: 'Ver Informe',
        viewTransaction: 'Ver transacción',
        createTransactionViolation: 'Crear infracción de transacción',
        reasonVisibleInLHN: {
            hasDraftComment: 'Tiene comentario en borrador',
            hasGBR: 'Tiene GBR',
            hasRBR: 'Tiene RBR',
            pinnedByUser: 'Fijado por el miembro',
            hasIOUViolations: 'Tiene violaciones de IOU',
            hasAddWorkspaceRoomErrors: 'Tiene errores al agregar sala de espacio de trabajo',
            isUnread: 'No leído (modo de enfoque)',
            isArchived: 'Archivado (modo más reciente)',
            isSelfDM: 'Es un mensaje directo propio',
            isFocused: 'Está temporalmente enfocado',
        },
        reasonGBR: {
            hasJoinRequest: 'Tiene solicitud de unión (sala de administrador)',
            isUnreadWithMention: 'No leído con mención',
            isWaitingForAssigneeToCompleteAction: 'Esperando a que el asignado complete la acción',
            hasChildReportAwaitingAction: 'Informe secundario pendiente de acción',
            hasMissingInvoiceBankAccount: 'Falta la cuenta bancaria de la factura',
            hasUnresolvedCardFraudAlert: 'Tiene una alerta de fraude de tarjeta sin resolver',
            hasDEWApproveFailed: 'La aprobación DEW ha fallado',
        },
        reasonRBR: {
            hasErrors: 'Tiene errores en los datos o las acciones del informe',
            hasViolations: 'Tiene violaciones',
            hasTransactionThreadViolations: 'Tiene violaciones de hilo de transacciones',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Hay un informe pendiente de acción',
            theresAReportWithErrors: 'Hay un informe con errores',
            theresAWorkspaceWithCustomUnitsErrors: 'Hay un espacio de trabajo con errores en las unidades personalizadas',
            theresAProblemWithAWorkspaceMember: 'Hay un problema con un miembro del espacio de trabajo',
            theresAProblemWithAWorkspaceQBOExport: 'Hubo un problema con la configuración de exportación de la conexión del espacio de trabajo.',
            theresAProblemWithAContactMethod: 'Hay un problema con un método de contacto',
            aContactMethodRequiresVerification: 'Un método de contacto requiere verificación',
            theresAProblemWithAPaymentMethod: 'Hay un problema con un método de pago',
            theresAProblemWithAWorkspace: 'Hay un problema con un espacio de trabajo',
            theresAProblemWithYourReimbursementAccount: 'Hay un problema con tu cuenta de reembolso',
            theresABillingProblemWithYourSubscription: 'Hay un problema de facturación con tu suscripción',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Tu suscripción se ha renovado con éxito',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Hubo un problema durante la sincronización de la conexión del espacio de trabajo',
            theresAProblemWithYourWallet: 'Hay un problema con tu billetera',
            theresAProblemWithYourWalletTerms: 'Hay un problema con los términos de tu billetera',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Haz una prueba',
    },
    migratedUserWelcomeModal: {
        title: '¡Bienvenido a New Expensify!',
        subtitle: 'Tiene todo lo que te encanta de nuestra experiencia clásica con un montón de mejoras para hacerte la vida aún más fácil:',
        confirmText: '¡Vamos!',
        helpText: 'Prueba la demo de 2 minutos',
        features: {
            search: 'Búsqueda más potente en móviles, web y ordenadores',
            concierge: 'Concierge AI integrada para ayudarte a automatizar tus gastos',
            chat: 'Chatea en tus gastos para resolver cualquier duda rápidamente.',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>¡Comienza <strong>aquí</strong>!</tooltip>',
        saveSearchTooltip: '<tooltip><strong>Renombra tus búsquedas guardadas</strong> aquí</tooltip>',
        accountSwitcher: '<tooltip>Accede a tus <strong>cuentas copiloto</strong> aquí</tooltip>',
        scanTestTooltip: {
            main: '<tooltip>¡<strong>Escanea nuestro recibo de prueba</strong> para ver cómo funciona!</tooltip>',
            manager: '<tooltip>¡Elige a <strong>nuestro gerente</strong> de prueba para probarlo!</tooltip>',
            confirmation: '<tooltip>Ahora, <strong>envía tu gasto y</strong>\n¡observa cómo ocurre la magia!</tooltip>',
            tryItOut: 'Prueba esto',
        },
        outstandingFilter: '<tooltip>Filtra los gastos\nque <strong>necesitan aprobación</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>¡Envía este recibo para\n<strong>completar la prueba</strong>!</tooltip>',
        gpsTooltip: '<tooltip>¡Seguimiento por GPS en curso! Cuando termines, detén el seguimiento a continuación.</tooltip>',
    },
    discardChangesConfirmation: {
        title: '¿Descartar cambios?',
        body: '¿Estás seguro de que quieres descartar los cambios que hiciste?',
        confirmText: 'Descartar cambios',
    },
    scheduledCall: {
        book: {
            title: 'Programar llamada',
            description: 'Encuentra un horario que funcione para ti.',
            slots: ({date}) => `<muted-text>Horarios disponibles para el <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Confirmar llamada',
            description: 'Asegúrate de que los detalles a continuación sean correctos. Una vez que confirmes la llamada, enviaremos una invitación con más información.',
            setupSpecialist: 'Tu especialista asignado',
            meetingLength: 'Duración de la reunión',
            dateTime: 'Fecha y hora',
            minutes: '30 minutos',
        },
        callScheduled: 'Llamada programada',
    },
    autoSubmitModal: {
        title: '¡Todo claro y enviado!',
        description: 'Se han solucionado todas las advertencias e infracciones, así que:',
        submittedExpensesTitle: 'Estos gastos han sido enviados',
        submittedExpensesDescription: 'Estos gastos se han enviado a tu aprobador pero aún se pueden editar hasta que sean aprobados.',
        pendingExpensesTitle: 'Los gastos pendientes se han movido',
        pendingExpensesDescription: 'Todo gasto de tarjeta pendiente se ha movido a un informe separado hasta que sea contabilizado.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Haz una prueba de 2 minutos',
        },
        modal: {
            title: 'Haz una prueba con nosotros',
            description: 'Haz un recorrido rápido por el producto para ponerte al día rápidamente.',
            confirmText: 'Iniciar prueba',
            helpText: 'Saltar',
            employee: {
                description:
                    '<muted-text>Consigue <strong>3 meses gratis</strong>  de Expensify para tu equipo. Solo introduce el correo electrónico de tu jefe abajo para enviarle un gasto escaneado de prueba.</muted-text>',
                email: 'Introduce el correo electrónico de tu jefe',
                error: 'Ese miembro es propietario de un espacio de trabajo, por favor introduce un nuevo miembro para probar.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Actualmente estás probando Expensify',
            readyForTheRealThing: '¿Listo para la versión real?',
            getStarted: 'Comenzar',
        },
        employeeInviteMessage: (name) =>
            `# ${name} te invitó a probar Expensify\n\n¡Hola! Acabo de conseguirnos *3 meses gratis* para probar Expensify, la forma más rápida de gestionar gastos.\n\nAquí tienes un *recibo de prueba* para mostrarte cómo funciona:`,
    },
    export: {
        basicExport: 'Exportar básico',
        reportLevelExport: 'Todos los datos - a nivel de informe',
        expenseLevelExport: 'Todos los datos - a nivel de gasto',
        exportInProgress: 'Exportación en curso',
        conciergeWillSend: 'Concierge te enviará el archivo en breve.',
    },
    openAppFailureModal: {
        title: 'Algo salió mal...',
        subtitle: `No hemos podido cargar todos sus datos. Hemos sido notificados y estamos investigando el problema. Si esto persiste, por favor comuníquese con`,
        refreshAndTryAgain: 'Actualizar e intentar de nuevo',
    },
    domain: {
        notVerified: 'No verificado',
        retry: 'Reintentar',
        verifyDomain: {
            title: 'Verificar dominio',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Antes de continuar, verifica que eres propietario de <strong>${domainName}</strong> actualizando su configuración DNS.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Accede a tu proveedor de DNS y abre la configuración DNS de <strong>${domainName}</strong>.`,
            addTXTRecord: 'Añade el siguiente registro TXT:',
            saveChanges: 'Guarda los cambios y vuelve aquí para verificar tu dominio.',
            youMayNeedToConsult: `Es posible que necesites consultar con el servicio informático de tu organización para completar la verificación. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Más información</a>.`,
            warning:
                'Después de la verificación, todos los miembros de Expensify en tu dominio recibirán un correo electrónico informando que sus cuentas serán gestionadas bajo tu dominio.',
            codeFetchError: 'No se pudo obtener el código de verificación',
            genericError: 'No pudimos verificar tu dominio. Por favor, inténtalo de nuevo y contacta con Concierge si el problema persiste.',
        },
        domainVerified: {
            title: 'Dominio verificado',
            header: '¡Wooo! Tu dominio ha sido verificado',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>El dominio <strong>${domainName}</strong> se ha verificado correctamente y ahora puedes configurar SAML y otras funciones de seguridad.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'Inicio de sesión único SAML (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> es una función de seguridad que te da más control sobre cómo los miembros con correos <strong>${domainName}</strong> inician sesión en Expensify. Para habilitarla, deberás verificarte como administrador autorizado de la empresa.</muted-text>`,
            fasterAndEasierLogin: 'Inicio de sesión más rápido y sencillo',
            moreSecurityAndControl: 'Más seguridad y control',
            onePasswordForAnything: 'Una sola contraseña para todo',
        },
        goToDomain: 'Ir al dominio',
        samlLogin: {
            title: 'Inicio de sesión SAML',
            subtitle: `<muted-text>Configura el inicio de sesión de los miembros con <a href="${CONST.SAML_HELP_URL}">Inicio de sesión único SAML (SSO).</a></muted-text>`,
            enableSamlLogin: 'Habilitar inicio de sesión SAML',
            allowMembers: 'Permitir que los miembros inicien sesión con SAML.',
            requireSamlLogin: 'Requerir inicio de sesión SAML',
            anyMemberWillBeRequired: 'Cualquier miembro que haya iniciado sesión con un método diferente deberá volver a autenticarse usando SAML.',
            enableError: 'No se pudo actualizar la configuración de habilitación de SAML',
            requireError: 'No se pudo actualizar la configuración de requerimiento de SAML',
            disableSamlRequired: 'Deshabilitar requisito de SAML',
            oktaWarningPrompt: '¿Estás seguro? Esto también deshabilitará Okta SCIM.',
            requireWithEmptyMetadataError: 'Por favor, añade los metadatos del Proveedor de Identidad a continuación para habilitar',
        },
        samlConfigurationDetails: {
            title: 'Detalles de configuración de SAML',
            subtitle: 'Utiliza estos detalles para configurar SAML.',
            identityProviderMetadata: 'Metadatos del proveedor de identidad',
            entityID: 'ID de entidad',
            nameIDFormat: 'Formato de ID de nombre',
            loginUrl: 'URL de inicio de sesión',
            acsUrl: 'URL ACS (Assertion Consumer Service)',
            logoutUrl: 'URL de cierre de sesión',
            sloUrl: 'URL SLO (Single Logout)',
            serviceProviderMetaData: 'Metadatos del proveedor de servicios',
            oktaScimToken: 'Token SCIM de Okta',
            revealToken: 'Revelar token',
            fetchError: 'No se pudieron obtener los detalles de configuración de SAML',
            setMetadataGenericError: 'No se pudieron establecer los metadatos de SAML',
        },
        accessRestricted: {
            title: 'Acceso restringido',
            subtitle: (domainName: string) => `Por favor, verifícate como un administrador autorizado de la empresa para <strong>${domainName}</strong> si necesitas control sobre:`,
            companyCardManagement: 'Gestión de tarjetas de la empresa',
            accountCreationAndDeletion: 'Creación y eliminación de cuentas',
            workspaceCreation: 'Creación de espacios de trabajo',
            samlSSO: 'SAML SSO',
        },
        addDomain: {
            title: 'Añadir dominio',
            subtitle: 'Introduce el nombre del dominio privado al que deseas acceder (por ejemplo, expensify.com).',
            domainName: 'Nombre de dominio',
            newDomain: 'Nuevo dominio',
        },
        domainAdded: {
            title: 'Dominio añadido',
            description: 'A continuación, deberás verificar la propiedad del dominio y ajustar tu configuración de seguridad.',
            configure: 'Configurar',
        },
        enhancedSecurity: {
            title: 'Seguridad mejorada',
            subtitle: 'Solicita que los miembros de tu dominio inicien sesión mediante inicio de sesión único, restringe la creación de espacios de trabajo y más.',
            enable: 'Habilitar',
        },
        domainAdmins: 'Administradores de dominio',
        admins: {
            title: 'Administradores',
            findAdmin: 'Encontrar administrador',
            primaryContact: 'Contacto principal',
            addPrimaryContact: 'Añadir contacto principal',
            setPrimaryContactError: 'No se pudo establecer el contacto principal. Por favor, inténtalo de nuevo más tarde.',
            settings: 'Configuración',
            consolidatedDomainBilling: 'Facturación consolidada del dominio',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>Cuando está habilitada, el contacto principal pagará todos los espacios de trabajo de los miembros de <strong>${domainName}</strong> y recibirá todos los recibos de facturación.</muted-text-label></comment>`,
            consolidatedDomainBillingError: 'No se pudo cambiar la facturación consolidada del dominio. Por favor, inténtalo de nuevo más tarde.',
            addAdmin: 'Añadir administrador',
            addAdminError: 'No se pudo añadir a este miembro como administrador. Por favor, inténtalo de nuevo.',
            revokeAdminAccess: 'Revocar acceso de administrador',
            cantRevokeAdminAccess: 'No se puede revocar el acceso de administrador del contacto técnico',
            error: {
                removeAdmin: 'No se pudo eliminar a este usuario como administrador. Por favor, inténtalo de nuevo.',
                removeDomain: 'No se pudo eliminar este dominio. Por favor inténtalo de nuevo.',
                removeDomainNameInvalid: 'Introduce el nombre de tu dominio para restablecerlo.',
            },
            resetDomain: 'Restablecer dominio',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Por favor escribe <strong>${domainName}</strong> para confirmar el restablecimiento del dominio.`,
            enterDomainName: 'Introduce aquí tu nombre de dominio',
            resetDomainInfo: `Esta acción es <strong>permanente</strong> y se eliminarán los siguientes datos: <br/> <ul><li>Conexiones de tarjeta corporativa y cualquier gasto no reportado de esas tarjetas</li> <li>Configuración de SAML y grupos</li> </ul> Todas las cuentas, espacios de trabajo, informes, gastos y otros datos se conservarán. <br/><br/>Nota: Puedes eliminar este dominio de tu lista de dominios eliminando el correo electrónico asociado de tus <a href="#">métodos de contacto</a>.`,
        },
        members: {
            title: 'Miembros',
            findMember: 'Buscar miembro',
            addMember: 'Añadir miembro',
            email: 'Dirección de correo electrónico',
            errors: {
                addMember: 'No se pudo añadir este miembro. Por favor, inténtalo de nuevo.',
            },
        },
    },
    gps: {
        disclaimer: 'Utiliza el GPS para crear un gasto a partir de tu trayecto. Toca Iniciar a continuación para comenzar el seguimiento.',
        error: {
            failedToStart: 'No se pudo iniciar el seguimiento de la ubicación.',
            failedToGetPermissions: 'No se pudieron obtener los permisos de ubicación necesarios.',
        },
        trackingDistance: 'Seguimiento de distancia...',
        stopped: 'Detenido',
        start: 'Iniciar',
        stop: 'Detener',
        discard: 'Descartar',
        stopGpsTrackingModal: {
            title: 'Detener seguimiento por GPS',
            prompt: '¿Estás seguro? Esto finalizará tu trayecto actual.',
            cancel: 'Reanudar seguimiento',
            confirm: 'Detener seguimiento por GPS',
        },
        discardDistanceTrackingModal: {
            title: 'Descartar seguimiento de distancia',
            prompt: '¿Estás seguro? Esto descartará tu trayecto actual y no se puede deshacer.',
            confirm: 'Descartar seguimiento de distancia',
        },
        zeroDistanceTripModal: {
            title: 'No se puede crear el gasto',
            prompt: 'No puedes crear un gasto con la misma ubicación de inicio y fin.',
        },
        locationRequiredModal: {
            title: 'Se requiere acceso a la ubicación',
            prompt: 'Por favor, permite el acceso a la ubicación en la configuración de tu dispositivo para iniciar el seguimiento de distancia por GPS.',
            allow: 'Permitir',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Se requiere acceso a la ubicación en segundo plano',
            prompt: 'Por favor, permite el acceso a la ubicación en segundo plano en la configuración de tu dispositivo (opción "Permitir solo con la app en uso") para iniciar el seguimiento de distancia por GPS.',
        },
        preciseLocationRequiredModal: {
            title: 'Se requiere ubicación precisa',
            prompt: 'Por favor, habilita la "ubicación precisa" en la configuración de tu dispositivo para iniciar el seguimiento de distancia por GPS.',
        },
        desktop: {
            title: 'Registra la distancia en tu teléfono',
            subtitle: 'Registra millas o kilómetros automáticamente con GPS y convierte los viajes en gastos al instante.',
            button: 'Descarga la app',
        },
        notification: {
            title: 'Seguimiento GPS en curso',
            body: 'Ve a la app para finalizar',
        },
        continueGpsTripModal: {
            title: '¿Continuar el registro del viaje por GPS?',
            prompt: 'Parece que la app se cerró durante tu último viaje por GPS. ¿Te gustaría continuar grabando ese viaje?',
            confirm: 'Continuar viaje',
            cancel: 'Ver viaje',
        },
        signOutWarningTripInProgress: {
            title: 'Seguimiento por GPS en curso',
            prompt: '¿Seguro que quieres descartar el viaje y cerrar sesión?',
            confirm: 'Descartar y cerrar sesión',
        },
        locationServicesRequiredModal: {
            title: 'Se requiere acceso a la ubicación',
            confirm: 'Abrir ajustes',
            prompt: 'Por favor, permite el acceso a la ubicación en los ajustes de tu dispositivo para iniciar el seguimiento de distancia por GPS.',
        },
        fabGpsTripExplained: 'Ir a la pantalla de GPS (Acción flotante)',
    },
};

export default translations;
