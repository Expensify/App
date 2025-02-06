const isMobile = () => /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator?.userAgent || '');

export default isMobile;
