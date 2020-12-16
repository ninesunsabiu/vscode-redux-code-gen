export const actionPayloadFileTpl = `import type { ActionPayloadRecord } from '@/model/types';
import * as actions from './#_prefix#Action';

export type #prefix#ActionPayload = ActionPayloadRecord<typeof actions>;
`;