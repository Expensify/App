// rh/incompatible-library: react-hook-form's watch() relies on interior mutability, which
// memoization breaks. The import is matched by module name, so the package need not be installed.
import {useForm} from 'react-hook-form';

export function WatchesForm() {
    const {watch} = useForm();
    const value = watch('field');
    return <div>{String(value)}</div>;
}
