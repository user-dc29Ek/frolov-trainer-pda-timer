import {withNaming} from '@bem-react/classname';

export type CnMods = Record<string, string | boolean | undefined>;

export const NAMESPACE = 'pdat-';

export const cn = withNaming({e: '__', m: '_'});
export const block = withNaming({n: NAMESPACE, e: '__', m: '_'});

export type CnBlock = ReturnType<typeof cn>;