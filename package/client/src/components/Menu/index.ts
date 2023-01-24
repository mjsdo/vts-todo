import Gnb from '@components/Gnb';
import Layout from '@components/Layout';
import TopBar from '@components/TopBar';
import Component from '@core/Component';

export default class Menu extends Component {
  render() {
    return `
      <section class="w-full h-screen bg-background shadow-xl">
        ${Layout()}
      </section>
    `;
  }

  appendChildComponent() {
    const $topBar = this.$<HTMLElement>('.top-bar');
    const $main = this.$<HTMLElement>('.main');
    const $gnb = this.$<HTMLElement>('.gnb');

    new TopBar($topBar);
    $main.innerHTML = '<h2 class="absolute pos-center text-text text-s24">Menu</h2>'
    new Gnb($gnb);
  }
}
