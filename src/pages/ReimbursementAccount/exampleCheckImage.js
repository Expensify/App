import exampleCheckImageEn from '../../../assets/images/example-check-image-en.png';
import exampleCheckImageEs from '../../../assets/images/example-check-image-es.png';
import CONST from '../../CONST';

const images = {
    [CONST.LOCALES.EN]: exampleCheckImageEn,
    [CONST.LOCALES.ES]: exampleCheckImageEs,
};

function exampleCheckImage(languageKey = CONST.LOCALES.EN) {
    return images[languageKey];
}

export default exampleCheckImage;
