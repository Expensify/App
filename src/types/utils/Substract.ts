type Subtract<TypeA, TypeB> = {
    [Property in Exclude<keyof TypeA, keyof TypeB>]: TypeA[Property];
};

export default Subtract;
