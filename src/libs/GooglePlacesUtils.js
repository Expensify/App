import _ from 'underscore';
import lodashGet from 'lodash/get';

/**
 * Finds an address component by type, and returns the value associated to key. Each address component object
 * inside the addressComponents array has the following structure:
 * {
 *   long_name: "New York",
 *   short_name: "New York",
 *   types: [ "locality", "political" ]
 * }
 *
 * @param {Array} addressComponents
 * @param {String} type
 * @param {String} key
 * @returns {String|undefined}
 */
function getAddressComponent(addressComponents, type, key) {
    return _.chain(addressComponents)
        .find(component => _.contains(component.types, type))
        .get(key)
        .value();
}

function getAddressComponentsUnderscore(addressComponents, fieldsToExtract) {
    //const startTime = performance.now();
    const result = _.mapObject(fieldsToExtract, () => '');
    _.each(addressComponents, (addressComponent) => {
        _.each(addressComponent.types, (addressType) => {
            if (!_.has(fieldsToExtract, addressType) || !_.isEmpty(result[addressType])) {
                return;
            }
            result[addressType] = lodashGet(addressComponent, fieldsToExtract[addressType], '');
        });
    });
    //const endTime = performance.now();
    //console.log(`Call to getAddressComponentsUnderscore took ${endTime - startTime}ms`);
    return result;
}

function getAddressComponentsNested(addressComponents, fieldsToExtract) {
    //const startTime = performance.now();

    const result = {};
    for(const field in fieldsToExtract) {
        const typeToFind = field;
        const nameToFind = fieldsToExtract[field];
        const addressComponent = addressComponents.find((elm, indx) => {
            if (_.isArray(elm['types'])) {
                return elm.types.find((type) => {
                    return type === typeToFind;
                })
            } else {
                return false;
            }
        });

        result[typeToFind] = addressComponent ? addressComponent[nameToFind] : '';
    }
    //const endTime = performance.now();
    //console.log(`Call to getAddressComponentsNested took ${endTime - startTime}ms`);
    return result;
}

function getAddressComponents(addressComponents, fieldsToExtract) {
    //const startTime = performance.now();
    // We want to avoid using a nested loops in conjunction with nested array built-ins so that we avoid
    // large O(n^2) complexity so separate out finding the objects we want from the loop of building an object to return
    const typesToFind = Object.keys(fieldsToExtract);
    const nameToFind = Object.values(fieldsToExtract);
    const matchedComponents = addressComponents.filter(component => component['types'] && component['types'].some(type => typesToFind.indexOf(type) >= 0));

    const result = typesToFind.reduce((obj, type, indx) => {
        return {...obj, [type]: (matchedComponents[indx] ? matchedComponents[indx][nameToFind[indx]] : '')};
    }, {});

    //const endTime = performance.now();
    //console.log(`Call to getAddressComponents took ${endTime - startTime}ms`);
    return result;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getAddressComponent,
    getAddressComponentsUnderscore,
    getAddressComponentsNested,
    getAddressComponents,
};
