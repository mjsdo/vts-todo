import type TodoStorage from '@storage/TodoStorage';

import Gnb from '@components/Gnb';
import Layout from '@components/Layout';
import Modal from '@components/Modal';
import TodoLayer from '@components/TodoLayer';
import TopBar from '@components/TopBar';
import Component from '@core/Component';
import modalStore from '@stores/modalStore';

import './styles.scss';

interface Props {
  todoStorage: TodoStorage;
}

export default class Home extends Component<unknown, Props> {
  render() {
    return `
      <section class="w-full h-screen bg-background shadow-xl">
        ${Layout()}
        <section class="modal font-sans"></section>
      </section>
    `;
  }

  appendChildComponent() {
    const { todoStorage } = this.props;

    const $topBar = this.$<HTMLElement>('.top-bar');
    const $main = this.$<HTMLElement>('.main');
    const $gnb = this.$<HTMLElement>('.gnb');
    const $modal = this.$<HTMLElement>('.modal');

    new TopBar($topBar);
    new TodoLayer($main, { todoStorage });
    new Gnb($gnb);
    modalStore.subscribe('modal', new Modal($modal));
  }
}
