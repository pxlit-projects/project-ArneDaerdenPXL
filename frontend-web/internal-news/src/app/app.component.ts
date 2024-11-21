import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PostFormComponent } from './components/posts/post-form/post-form.component';
import { DraftsComponent } from './components/drafts/drafts.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PostFormComponent, DraftsComponent],
  template: `
        <div class="app-container">
            <h1>{{ title }}</h1>
            <app-post-form></app-post-form>
            <app-drafts></app-drafts>
        </div>
    `,
    styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Internal news';
}