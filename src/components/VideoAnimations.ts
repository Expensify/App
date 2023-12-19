const ExpensifySonicMinimalVocal = require('../../assets/videos/native/Expensify_Sonic_Minimal_Vocal.mp4');
const ExpensifySonicMinimalNonvocal = require('../../assets/videos/native/Expensify_Sonic_Minimal_Nonvocal.mp4');
const ExpensifyFullVocal = require('../../assets/videos/native/Expensify_Sonic_Full_Vocal.mp4');
const ExpensifyFullNonvocal = require('../../assets/videos/native/Expensify_Sonic_Full_Nonvocal.mp4');

const splashVideoVariants = [
    {file: ExpensifyFullNonvocal, fileName: 'Full Nonvocal'},
    {file: ExpensifyFullVocal, fileName: 'Full Vocal'},
    {file: ExpensifySonicMinimalNonvocal, fileName: 'Sonic Minimal Nonvocal'},
    {file: ExpensifySonicMinimalVocal, fileName: 'Sonic Minimal Vocal'},
];
export {ExpensifySonicMinimalVocal, ExpensifySonicMinimalNonvocal, ExpensifyFullVocal, ExpensifyFullNonvocal, splashVideoVariants};
