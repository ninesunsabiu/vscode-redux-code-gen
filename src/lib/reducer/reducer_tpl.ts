export const reducerSwitchCaseTpl = `\
        case #prefix#ActionKey.#key#:
            return #_key#Handler(state, action.payload!);\
`;

export const reducerStateHandlerTpl = `\
const #_key#Handler: #prefix#StateHandler<#prefix#ActionPayload['#_key#']> = (state, payload) => {
    const {  } = payload;
    return { ...state };
};\
`;

export const reducerFileTpl = `import type { ReducerStateHandler } from '@/model/types';
import type { AGAction } from '@/model/AGAction';
import type { #prefix#ActionPayload } from './#_prefix#ActionPayload';
import { #prefix#ActionKey } from './#_prefix#ActionKey';

interface AG#prefix#ReducerState {

}

type #prefix#StateHandler<P> = ReducerStateHandler<AG#prefix#ReducerState, P>;

const initialState: AG#prefix#ReducerState = {

};

export function reducer(state = initialState, action: AGAction<any>) {
    switch (action.type) {
${reducerSwitchCaseTpl}
        default:
            return state;
    }
}

${reducerStateHandlerTpl}
`;