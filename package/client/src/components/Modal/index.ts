import Component from '@core/Component';
import modalStore from '@stores/modalStore';

export interface Props {
  dimmedColor?: string;
}

export interface State {}

export default class Modal extends Component<State, Props> {
  render() {
    const { open } = modalStore.state;
    const { dimmedColor = 'rgba(0, 0, 0, 0.6)' } = this.props;

    return !open
      ? ``
      : `
      <div class="modal-layer absolute left-0 right-0 top-0 bottom-0">
        <div class="modal-dimmed w-screen h-screen" style="background-color: ${dimmedColor}"></div>
        <div class="modal-content"></div>
      </div>
    `;
  }

  appendChildComponent() {
    const { open, content } = modalStore.state;

    if (!open) return;

    const $modalContent = this.$<HTMLElement>('.modal-content');

    content?.($modalContent);
  }
}
