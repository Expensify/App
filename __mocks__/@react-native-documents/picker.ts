import type {FileToCopy} from '@react-native-documents/picker';

const keepLocalCopy = jest.fn();
const pick = jest.fn();
const types = Object.freeze({
    allFiles: 'public.item',
    audio: 'public.audio',
    csv: 'public.comma-separated-values-text',
    doc: 'com.microsoft.word.doc',
    docx: 'org.openxmlformats.wordprocessingml.document',
    images: 'public.image',
    json: 'public.json',
    pdf: 'com.adobe.pdf',
    plainText: 'public.plain-text',
    ppt: 'com.microsoft.powerpoint.ppt',
    pptx: 'org.openxmlformats.presentationml.presentation',
    video: 'public.movie',
    xls: 'com.microsoft.excel.xls',
    xlsx: 'org.openxmlformats.spreadsheetml.sheet',
    zip: 'public.zip-archive',
});

export type {FileToCopy};
export {keepLocalCopy, pick, types};
