const Expensicons = jest.requireActual('../Expensicons');

module.exports = Object.keys(Expensicons).reduce((prev, curr) => {
    const fn = () => '';
    Object.defineProperty(fn, 'name', {value: curr});
    return {...prev, [curr]: fn};
}, {});
