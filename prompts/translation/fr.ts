import dedent from '@libs/StringUtils/dedent';
import Glossary from './Glossary';

const frenchGlossary = new Glossary([
    // Workflow actions
    {sourceTerm: 'Submit', targetTerm: 'Soumettre', partOfSpeech: 'verb', usage: 'UI workflow action'},
    {sourceTerm: 'Resubmit', targetTerm: 'Soumettre à nouveau', partOfSpeech: 'verb', usage: 'UI workflow action'},
    {sourceTerm: 'Review', targetTerm: 'Examiner', partOfSpeech: 'verb', usage: 'Approval workflow action'},
    {sourceTerm: 'Approve', targetTerm: 'Approuver', partOfSpeech: 'verb', usage: 'Approval workflow action'},
    {sourceTerm: 'Reject', targetTerm: 'Rejeter', partOfSpeech: 'verb', usage: 'Approval workflow action'},
    {sourceTerm: 'Approval', targetTerm: 'Approbation'},

    // User roles
    {sourceTerm: 'Approver', targetTerm: 'Approbateur', partOfSpeech: 'noun', usage: 'User role in approval workflow'},
    {sourceTerm: 'Submitter', targetTerm: 'Déclarant', usage: 'User submitting expenses or reports'},
    {sourceTerm: 'Admin', targetTerm: 'Administrateur'},
    {sourceTerm: 'Member', targetTerm: 'Membre'},
    {sourceTerm: 'Owner', targetTerm: 'Responsable', usage: 'Workspace or policy owner'},

    // Core product objects
    {sourceTerm: 'Report', targetTerm: 'Note de frais', usage: 'Expense container'},
    {sourceTerm: 'Expense', targetTerm: 'Dépense'},
    {sourceTerm: 'Workspace', targetTerm: 'Espace de travail'},
    {sourceTerm: 'Policy', targetTerm: 'Politique', usage: 'Rules and settings governing expenses'},
    {sourceTerm: 'Category', targetTerm: 'Catégorie'},
    {sourceTerm: 'Tag', targetTerm: 'Tag'},
    {sourceTerm: 'Receipt', targetTerm: 'Reçu'},

    // Financial data
    {sourceTerm: 'Amount', targetTerm: 'Montant'},
    {sourceTerm: 'Currency', targetTerm: 'Devise'},
    {sourceTerm: 'Rate', targetTerm: 'Taux', usage: 'Financial rate'},
    {sourceTerm: 'Subrate', targetTerm: 'Sous-taux', usage: 'Secondary reimbursement rate'},

    // Financial actions and statuses
    {sourceTerm: 'Reimburse', targetTerm: 'Rembourser', partOfSpeech: 'verb', usage: 'Financial action'},
    {sourceTerm: 'Reimbursement', targetTerm: 'Remboursement'},
    {sourceTerm: 'Reimbursed', targetTerm: 'Remboursé', partOfSpeech: 'adjective', usage: 'Payment status'},

    // System states and configuration
    {sourceTerm: 'Default', targetTerm: 'Par défaut', usage: 'System state or configuration'},
    {sourceTerm: 'Set', targetTerm: 'Défini', partOfSpeech: 'adjective', usage: 'System state'},
    {sourceTerm: 'Unset', targetTerm: 'Non défini', partOfSpeech: 'adjective', usage: 'System state'},
    {sourceTerm: 'Enabled', targetTerm: 'Activé', partOfSpeech: 'adjective', usage: 'Feature state'},
    {sourceTerm: 'Disabled', targetTerm: 'Désactivé', partOfSpeech: 'adjective', usage: 'Feature state'},
    {sourceTerm: 'Applied', targetTerm: 'Appliqué', partOfSpeech: 'adjective', usage: 'Configuration state'},
    {sourceTerm: 'Required', targetTerm: 'Obligatoire', partOfSpeech: 'adjective', usage: 'Form or rule requirement'},
    {sourceTerm: 'Optional', targetTerm: 'Facultatif', partOfSpeech: 'adjective', usage: 'Form or rule requirement'},

    // Common UI high-impact actions
    {sourceTerm: 'Move', targetTerm: 'Déplacer', partOfSpeech: 'verb', usage: 'UI bulk action'},
    {sourceTerm: 'Assign', targetTerm: 'Assigner', partOfSpeech: 'verb', usage: 'UI workflow action'},
    {sourceTerm: 'Unassign', targetTerm: "Retirer l'assignation", partOfSpeech: 'verb', usage: 'UI workflow action'},
    {sourceTerm: 'Remove', targetTerm: 'Supprimer', partOfSpeech: 'verb', usage: 'UI destructive action'},
    {sourceTerm: 'Cancel', targetTerm: 'Annuler', partOfSpeech: 'verb', usage: 'UI cancellation action'},
    {sourceTerm: 'Confirm', targetTerm: 'Confirmer', partOfSpeech: 'verb', usage: 'UI confirmation action'},

    // Statuses
    {sourceTerm: 'Draft', targetTerm: 'Brouillon', usage: 'Status label'},
    {sourceTerm: 'Pending', targetTerm: 'En attente', usage: 'Status label'},
    {sourceTerm: 'Approved', targetTerm: 'Approuvé', usage: 'Status label'},
    {sourceTerm: 'Rejected', targetTerm: 'Rejeté', usage: 'Status label'},
    {sourceTerm: 'Permanently', targetTerm: 'Définitivement', usage: 'Irreversible action qualifier'},
]);

export default dedent(`
    When translating to French, follow these rules:

    - Maintain French capitalization norms for UI labels and keep labels concise.
    - Ensure proper spacing between sentences when French strings are concatenated (especially after periods).
    - Apply a single, consistent French convention for file transfer verbs ("télécharger" vs "téléverser") across the app.
    - Translate "e-receipts" using the standardized French typographic form "e-reçus".
    - Be cautious with English false cognates in French (e.g., "principal" = head of school, not "principal/main").
    - Translate navigation terms like "Forward" according to UI navigation context, not as sending or transferring.
    - Translate video player controls like "Expand" using standard French UI conventions for enlarging a view.
    - Avoid literal translations of misleading compounds such as "report card"; use the meaning implied by the product context.
    - Apply required French spacing before punctuation such as ":", "?" (and other French typography conventions), when applicable.
    - Use standardized FR technical terms where applicable (e.g., prefer "booléens" for "boolean fields" in debug contexts) only for French.

    Use the following glossary for canonical French translations of common terms:

    ${frenchGlossary.toXML()}
`);
