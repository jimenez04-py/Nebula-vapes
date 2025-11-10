import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CatalogComponent } from './components/catalog/catalog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CatalogComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {}

