import Header from '@components/Header';
import PageNavigation from '@components/PageNavigation';
import Component from '@core/Component';

export default class Home extends Component {
  render() {
    return `
      <section class="w-full">
        <header id="header" class="bg-card text-text trs-color"></header>
        <main id="main"></main>
        <div id="page-navigation" class="bg-card text-text max-w-600 w-600 fixed bottom-0 trs-color"></div>
      </section>
    `;
  }

  appendChildComponent() {
    const $header = this.$('#header') as HTMLDivElement;
    const $pageNav = this.$('#page-navigation') as HTMLDivElement;

    new Header($header);
    new PageNavigation($pageNav);
  }
}
