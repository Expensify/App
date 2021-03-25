export default (initialUrl) => {
    const initialURLObject = new URL(initialUrl);
    return initialURLObject.pathname;
};
