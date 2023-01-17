import type TodoStorage from '@/storage/TodoStorage';

import Header from '@components/Header';
import PageNavigation from '@components/PageNavigation';
import TodoLayer from '@components/TodoLayer';
import Component from '@core/Component';

import './styles.scss';

interface Props {
  todoStorage: TodoStorage;
}

export default class Home extends Component<unknown, Props> {
  render() {
    return `
      <section class="w-full h-screen bg-background shadow-xl">
        <header id="header"></header>
        <main id="main" class="bg-background py-14 px-24"></main>
        <nav id="page-navigation" class="fixed bottom-0 shadow-xl"></nav> 
      </section>
    `;
  }

  appendChildComponent() {
    const { todoStorage } = this.props;

    const $header = this.$('#header') as HTMLDivElement;
    const $pageNav = this.$('#page-navigation') as HTMLDivElement;
    const $main = this.$('#main') as HTMLDivElement;

    new Header($header);
    new PageNavigation($pageNav);
    new TodoLayer($main, { todoStorage });
  }
}
