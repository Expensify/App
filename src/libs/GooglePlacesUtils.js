import _ from 'underscore';

function getAddressComponent(addressComponents, type, field) {
    return _.chain(addressComponents)
        .find(component => _.contains(component.types, type))
        .get(field)
        .value();
}

function validateAddressComponents(addressComponents) {
    if (!addressComponents) {
        return false;
    }
    if (!_.some(addressComponents, component => _.includes(component.types, 'street_number'))) {
        // Missing Street number
        return false;
    }
    if (!_.some(addressComponents, component => _.includes(component.types, 'postal_code'))) {
        // Missing zip code
        return false;
    }
    if (!_.some(addressComponents, component => _.includes(component.types, 'administrative_area_level_1'))) {
        // Missing state
        return false;
    }
    if (!_.some(addressComponents, component => _.includes(component.types, 'locality'))
        && !_.some(addressComponents, component => _.includes(component.types, 'sublocality'))) {
        // Missing city
        return false;
    }
    if (_.some(addressComponents, component => _.includes(component.types, 'post_box'))) {
        // Reject PO box
        return false;
    }
    return true;
}

export {
    getAddressComponent,
    validateAddressComponents,
};
