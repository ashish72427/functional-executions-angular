import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

const isDarkTheme = localStorage.getItem('isDarkTheme') === 'true';
if (isDarkTheme) {
  document.body.classList.add('dark-theme');
} else {
  document.body.classList.add('light-theme');
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
