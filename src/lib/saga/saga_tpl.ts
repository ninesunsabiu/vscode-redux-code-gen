export const sagaHandlerTpl = `
export function* #_key#Saga(action: AGAction<#prefix#ActionPayload['#_key#']>) {
    yield {};
}
`;

export const sagaFileTpl = `import type { AGAction } from '@/model/AGAction';
import type { #prefix#ActionPayload } from './#_prefix#ActionPayload';
${sagaHandlerTpl}\
`;