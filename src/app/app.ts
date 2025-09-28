import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  private isBrowser: boolean;

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    translate.addLangs(['en', 'es','fr', 'de','hi']);
    translate.setDefaultLang('en');

    let savedLang: string | null = null;
    if (this.isBrowser) {
      savedLang = localStorage.getItem('lang');
    }
    const browserLang = translate.getBrowserLang();
    const fallbackLang = 'en';

    if (savedLang) {
      translate.use(savedLang);
    } else if (browserLang && ['en', 'es','fr', 'de','hi'].includes(browserLang)) {
      translate.use(browserLang);
    } else {
      translate.use(fallbackLang);
    }
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    if (this.isBrowser) {
      localStorage.setItem('lang', lang);
    }
  }

  onLangChange(event: Event) {
    const select = event.target as HTMLSelectElement | null;
    if (select) {
      this.switchLanguage(select.value);
    }
  }
}
