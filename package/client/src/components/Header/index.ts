import { BarIcon, DarkThemeIcon, LightThemeIcon } from '@components/Icons';
import Component from '@core/Component';

import { getBodyThemeAttr } from '../../theme';

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
      <header class="px-40 h-96 flex items-center justify-between">
         <h1 class="text-s24">VTS-TODO</h1>
         <div>
           <button type="button" class="p-4" data-theme-button>
             ${
               theme === 'dark' ? DarkThemeIcon(textCn) : LightThemeIcon(textCn)
             }
           </button>
           <button type="button" class="p-4">
             ${BarIcon(textCn)}
           </button>
         </div>
      </header>     
    `;
  }
}
