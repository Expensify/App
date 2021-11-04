import exampleCheckImageEn from '../../../assets/images/example-check-image-en.png';
import exampleCheckImageEs from '../../../assets/images/example-check-image-es.png';

const images = {
    en: exampleCheckImageEn,
    es: exampleCheckImageEs,
};

function exampleCheckImage(languageKey = 'en') {
    return images[languageKey];
}

export default exampleCheckImage;
