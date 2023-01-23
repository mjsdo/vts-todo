import type Component from '@core/Component';

import Store from '@core/Store';

export interface ModalState {
  open: boolean;
  content?: ($parent: HTMLElement) => InstanceType<typeof Component>;
}

const initialState = {
  open: false,
  content: undefined
} as const;

const modalStore = new Store<ModalState>(initialState);

export default modalStore;
