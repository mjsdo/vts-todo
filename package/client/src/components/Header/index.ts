import { BarIcon, DarkThemeIcon, LightThemeIcon } from '@components/Icons';
import { TAB_INDEX } from '@constants/css';
import Component from '@core/Component';

import { getBodyThemeAttr, setBodyThemeAttr } from '@/theme';

import './styles.scss';

interface State {
  theme: 'dark' | 'light';
}

export default class Header extends Component<State> {
  state = {
    theme: getBodyThemeAttr(),
  };

  render() {
    const { theme } = this.state;
    const textCn = 'text-text text-s20';

    return `
      <div class="px-40 bg-card text-text flex items-center justify-between" data-app-topbar>
         <h1 class="text-s24 font-sans">VTS-TODO</h1>
         <div>
           <button type="button" class="p-4" tabindex="${
             TAB_INDEX.TOP_BAR
           }" data-theme-button>
             ${
               theme === 'dark' ? DarkThemeIcon(textCn) : LightThemeIcon(textCn)
             }
             <span class="sr-only">테마 변경</span>
           </button>
           <button type="button" class="p-4" tabindex="${TAB_INDEX.TOP_BAR}">
             ${BarIcon(textCn)}
             <span class="sr-only">애플리케이션 메뉴</span>
           </button>
         </div>
      </div>     
    `;
  }

  setEventListeners() {
    /* handleClickThemeButton */
    this.on('click', '[data-theme-button]', () => {
      const nextTheme = this.state.theme === 'dark' ? 'light' : 'dark';

      this.setState({ theme: nextTheme }); // theme 아이콘
      setBodyThemeAttr(nextTheme); // class variable 변경
    });
  }
}
