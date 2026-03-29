import fs from 'fs';
import path from 'path';

describe('WebGenericPressable disabled semantics', () => {
    it('does not globally derive fullDisabled from disabled on web', () => {
        const implementation = fs.readFileSync(path.join(process.cwd(), 'src/components/Pressable/GenericPressable/implementation/index.tsx'), 'utf8');

        expect(implementation).not.toContain('fullDisabled={!!props.fullDisabled || !!props.disabled}');
        expect(implementation).not.toContain('fullDisabled={props.fullDisabled || props.disabled}');
    });
});
