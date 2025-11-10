import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { importProvidersFrom } from '@angular/core';
import { CatalogComponent } from './components/catalog/catalog.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(CatalogComponent)
  ]
};
