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

    // Supported languages
    this.translate.addLangs([
      'en',
      'de',
      'fr',
      'es',
      'hi',
      'mr'
    ]);

    // Default language
    this.translate.setDefaultLang('en');

    let savedLang: string | null = null;

    if (this.isBrowser) {
      savedLang = localStorage.getItem('lang');
    }

    // Always start in English if nothing saved
    if (savedLang) {
      this.translate.use(savedLang);
    } else {
      this.translate.use('en');
    }
  }

  switchLanguage(lang: string): void {

    this.translate.use(lang);

    if (this.isBrowser) {
      localStorage.setItem('lang', lang);
    }
  }

  onLangChange(event: Event): void {

    const select = event.target as HTMLSelectElement;

    if (select) {
      this.switchLanguage(select.value);
    }
  }
}