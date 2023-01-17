import type TodoStorage from '@storage/TodoStorage';

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
        <header id="header" class="min-w-396"></header>
        <main id="main" class="bg-background px-24 min-w-396 relative"></main>
        <nav id="page-navigation" class="fixed bottom-0 shadow-xl min-w-396 max-w-600 w-screen"></nav> 
      </section>
    `;
  }

  appendChildComponent() {
    const { todoStorage } = this.props;

    const $header = this.$<HTMLElement>('#header');
    const $pageNav = this.$<HTMLElement>('#page-navigation');
    const $main = this.$<HTMLElement>('#main');

    new Header($header);
    new PageNavigation($pageNav);
    new TodoLayer($main, { todoStorage });
  }
}
