import Header from '@components/Header';
import Component from '@core/Component';

export default class Home extends Component {
  render() {
    return `
      <section class="bg-card max-w-600 text-text trs-color">
        <div class="header"></div>
      </section>
    `;
  }

  appendChildComponent() {
    const $header = this.$('.header') as HTMLDivElement;

    new Header($header);
  }
}
