import dedent from '@libs/StringUtils/dedent';
import Glossary from './Glossary';

const spanishGlossary = new Glossary([
    {sourceTerm: 'Export out-of-pocket expenses as', targetTerm: 'Exportar gastos por cuenta propia como'},
    {sourceTerm: 'Enable optional functionality', targetTerm: 'Habilita funciones opcionales'},
    {sourceTerm: 'Rate', targetTerm: 'Tasa', partOfSpeech: 'noun', usage: 'Financial or tax rate'},
    {sourceTerm: 'Switch accounts', targetTerm: 'cambiar de cuenta'},
    {sourceTerm: 'Oops something went wrong. Please try again.', targetTerm: '¡Ups! Ha ocurrido un error. Por favor, inténtalo de nuevo.'},
    {
        sourceTerm: 'In order to disable two-factor authentication, please enter a valid code from your authentication app.',
        targetTerm: 'Para deshabilitar la autenticación de dos factores, por favor introduce un código válido de tu aplicación de autenticación.',
    },
    {
        sourceTerm: 'Use the toggles below to enable more features as you grow. Each feature will appear in the navigation menu for further customization.',
        targetTerm:
            'Utiliza los interruptores a continuación para habilitar más funciones a medida que creces. Cada función aparecerá en el menú de navegación para una mayor personalización.',
    },
    {
        sourceTerm: 'Make it unique enough to tell apart from other cards. Specific use cases are even better!',
        targetTerm: 'Hazlo lo suficientemente único para distinguirla de otras tarjetas. ¡Los casos de uso específicos son aún mejores!',
    },
    {sourceTerm: 'Cash back on every US purchase', targetTerm: 'Devolución de dinero en cada compra en Estados Unidos'},
    {sourceTerm: 'Enter', targetTerm: 'Introduce', partOfSpeech: 'verb', usage: 'Prompt to input a value'},
    {sourceTerm: 'Expensify Card will arrive in 2-3 business days.', targetTerm: 'La Tarjeta Expensify llegará en 2-3 días hábiles.', usage: 'Branded Expensify payment card'},
    {sourceTerm: 'Colleagues', targetTerm: 'compañeros de trabajo'},
    {sourceTerm: 'Removed connection to X', targetTerm: 'Eliminó la conexión a X'},
    {
        sourceTerm: 'Connect to QuickBooks Online for automatic expense coding and syncing that makes month-end close a breeze.',
        targetTerm: 'Conéctate a QuickBooks Online para la clasificación y sincronización automática de gastos, lo que facilita el cierre de fin de mes.',
    },
    {sourceTerm: 'Please enter a whole dollar amount before continuing', targetTerm: 'Por favor, introduce una cantidad entera en dólares antes de continuar'},
    {sourceTerm: 'Track and collect receipts', targetTerm: 'Organiza recibos'},
    {sourceTerm: 'Track receipts', targetTerm: 'Organiza recibos'},
    {sourceTerm: 'Manage company cards', targetTerm: 'Gestiona tarjetas de la empresa'},
    {sourceTerm: 'Travel and expense, at the speed of chat', targetTerm: 'Viajes y gastos, a la velocidad del chat'},
    {sourceTerm: 'Collect plan', targetTerm: 'plan Recopilar'},
    {sourceTerm: 'Control plan', targetTerm: 'plan Controlar'},
    {
        sourceTerm: "We're fine-tuning a few more bits and pieces of New Expensify to accommodate your specific setup. In the meantime, head over to Expensify Classic.",
        targetTerm: 'Estamos ajustando algunos detalles de New Expensify para adaptarla a tu configuración específica. Mientras tanto, dirígete a Expensify Classic.',
    },
    {sourceTerm: 'Add', targetTerm: 'añadir', partOfSpeech: 'verb', usage: 'Verb form; use añade where the source uses imperative phrasing'},
    {sourceTerm: 'Add', targetTerm: 'añade', usage: 'Imperative or short label form when appropriate'},
    {sourceTerm: 'Require receipts, flag high spend, and more.', targetTerm: 'Solicita recibos, resalta gastos de alto importe y mucho más.'},
    {
        sourceTerm: "Camera access still hasn't been granted, please follow these instructions.",
        targetTerm: 'No se ha concedido el acceso a la cámara, siga estas instrucciones.',
    },
    {sourceTerm: 'Hold', targetTerm: 'Retener', partOfSpeech: 'verb', usage: 'Payment or card hold'},
    {sourceTerm: 'You haven’t created any invoices yet', targetTerm: 'Aún no has creado ninguna factura'},
    {
        sourceTerm: 'Use the green button below to send an invoice or take a tour of Expensify to learn more.',
        targetTerm: 'Usa el botón verde de abajo para crear una factura o haz un tour por Expensify para aprender más.',
    },
    {sourceTerm: 'Unhold', targetTerm: 'Desbloquea', partOfSpeech: 'verb', usage: 'Release a hold'},
    {sourceTerm: 'Account manager', targetTerm: 'gestor de cuenta'},
    {sourceTerm: 'Setup specialist', targetTerm: 'especialista asignado'},
    {sourceTerm: 'Chat with Concierge.', targetTerm: 'Chatear con Concierge.'},
    {sourceTerm: 'Clear', targetTerm: 'borrar', partOfSpeech: 'verb', usage: 'Clear field or selection'},
    {sourceTerm: 'Upgrade', targetTerm: 'Mejorar', partOfSpeech: 'verb', usage: 'Plan or account upgrade'},
    {sourceTerm: 'Downgrade to the Collect plan', targetTerm: 'Bajar de categoría al plan Recopilar'},
    {sourceTerm: 'Downgrade your account', targetTerm: 'Baja tu cuenta de categoría'},
    {
        sourceTerm: 'moved expense from self DM to chat with [username]',
        targetTerm: 'movió el gasto desde su propio mensaje directo a un chat con [username]',
        usage: 'System message; preserve [username] placeholder',
    },
    {sourceTerm: 'Email', targetTerm: 'Correo electrónico'},
    {sourceTerm: 'Previously', targetTerm: 'previamente'},
    {sourceTerm: 'Approver', targetTerm: 'aprobador', partOfSpeech: 'noun', usage: 'User role in approval workflow'},
    {sourceTerm: 'If you qualify', targetTerm: 'si calificas'},
    {sourceTerm: 'Master credentials', targetTerm: 'credenciales maestras'},
    {sourceTerm: 'Updated', targetTerm: 'actualizó', partOfSpeech: 'verb', usage: 'Past tense in activity feed'},
    {sourceTerm: 'Re-bill', targetTerm: 'Volver a facturar', partOfSpeech: 'verb', usage: 'Billing action'},
    {sourceTerm: 'Accounting connection', targetTerm: 'Conexión de contabilidad'},
    {sourceTerm: 'Per diem', targetTerm: 'Per diem', usage: 'Keep Latin term as product convention'},
]);

export default dedent(`
    When translating to Spanish, follow these rules:

    - Prefer clear, natural Spanish for the product locale; keep branded names (Expensify, Concierge, QuickBooks Online, New Expensify, Expensify Classic) as in the source unless the glossary says otherwise.
    - Always use the informal tú and not the more formal usted form

    Use the following glossary for canonical Spanish translations of common terms:

    ${spanishGlossary.toXML()}
`);
