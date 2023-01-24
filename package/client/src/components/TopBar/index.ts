import { DarkThemeIcon, LightThemeIcon } from '@components/Icons';
import { TAB_INDEX } from '@constants/css';
import Component from '@core/Component';

import { getBodyThemeAttr, setBodyThemeAttr } from '@/theme';

import './styles.scss';

interface State {
  theme: 'dark' | 'light';
}

export default class TopBar extends Component<State> {
  state = {
    theme: getBodyThemeAttr(),
  };

  render() {
    const { theme } = this.state;
    const textCn = 'text-text text-s20';

    return `
      <div class="top-bar-layer px-40 bg-card text-text flex items-center justify-between">
         <h1 class="text-s24 font-sans uppercase user-select-none">todo list</h1>
         <div>
           <button type="button" class="theme-button p-4" tabindex="${
             TAB_INDEX.TOP_BAR
           }" >
             ${
               theme === 'dark' ? DarkThemeIcon(textCn) : LightThemeIcon(textCn)
             }
             <span class="sr-only">테마 변경</span>
           </button>
         </div>
      </div>     
    `;
  }

  effect() {
    /* handleClickThemeButton */
    this.on('click', '.theme-button', () => {
      const nextTheme = this.state.theme === 'dark' ? 'light' : 'dark';

      this.setState({ theme: nextTheme }); // theme 아이콘
      setBodyThemeAttr(nextTheme); // class variable 변경
    });
  }
}
