import Component from '@core/Component';
import modalStore from '@stores/modalStore';

export interface Props {
  message: string;
  handleSubmit?: () => void;
  handleCancel?: () => void;
}

export default class AlertBox extends Component<unknown, Props> {
  render() {
    const { message } = this.props;

    return `
      <div class="fixed flex flex-col w-300 p-24 gap-20 pos-center bg-background rounded-2xl">
        <div class="text-center">
          <p class="text-s16 text-text font-bold">${message}</p>
        </div>
        <div class="flex justify-center gap-20">
          <button type="button" class="alert-cancel button button-cancel flex-1">취소</button>
          <button type="button" class="alert-submit button button-accent flex-1">확인</button>
        </div>
      </div> 
    `;
  }

  effect() {
    const { handleSubmit, handleCancel } = this.props;

    this.on('click', '.alert-cancel', () => {
      handleCancel?.();
      modalStore.reset();
    });

    this.on('click', '.alert-submit', () => {
      handleSubmit?.();
    });
  }
}
