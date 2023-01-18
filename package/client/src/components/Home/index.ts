import type TodoStorage from '@storage/TodoStorage';

import Gnb from '@components/Gnb';
import TodoLayer from '@components/TodoLayer';
import TopBar from '@components/TopBar';
import Component from '@core/Component';

import './styles.scss';

interface Props {
  todoStorage: TodoStorage;
}

export default class Home extends Component<unknown, Props> {
  render() {
    return `
      <section class="w-full h-screen bg-background shadow-xl">
        <header class="top-bar min-w-396"></header>
        <main class="main bg-background px-24 min-w-396 relative"></main>
        <nav class="gnb fixed bottom-0 shadow-xl min-w-396 max-w-600 w-screen"></nav> 
      </section>
    `;
  }

  appendChildComponent() {
    const { todoStorage } = this.props;

    const $topBar = this.$<HTMLElement>('.top-bar');
    const $main = this.$<HTMLElement>('.main');
    const $gnb = this.$<HTMLElement>('.gnb');

    new TopBar($topBar);
    new TodoLayer($main, { todoStorage });
    new Gnb($gnb);
  }
}
