type PartOfSpeech = 'verb' | 'noun' | 'adjective';

type GlossaryTerm = {
    sourceTerm: string;
    targetTerm: string;
    partOfSpeech?: PartOfSpeech;
    usage?: string;
};

class Glossary {
    private terms: GlossaryTerm[];

    constructor(terms: GlossaryTerm[]) {
        this.terms = terms;
    }

    toXML(): string {
        const termElements = this.terms.map((term) => {
            let xml = '  <term>\n';
            xml += `    <sourceTerm>${term.sourceTerm}</sourceTerm>\n`;
            xml += `    <targetTerm>${term.targetTerm}</targetTerm>\n`;
            if (term.partOfSpeech) {
                xml += `    <partOfSpeech>${term.partOfSpeech}</partOfSpeech>\n`;
            }
            if (term.usage) {
                xml += `    <usage>${term.usage}</usage>\n`;
            }
            xml += '  </term>';
            return xml;
        });
        return `<glossary>\n${termElements.join('\n')}\n</glossary>`;
    }
}

export default Glossary;
export type {GlossaryTerm, PartOfSpeech};
