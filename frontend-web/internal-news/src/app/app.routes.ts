import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { PostsComponent } from './components/posts/posts/posts.component';
import { PostFormComponent } from './components/posts/post-form/post-form.component';
import { DraftsComponent } from './components/drafts/drafts.component';

export const routes: Routes = [
  { path: '', redirectTo: '/posts', pathMatch: 'full' },
  { path: 'posts', component: PostsComponent },
  { path: 'create-post', component: PostFormComponent },
  { path: 'drafts', component: DraftsComponent },
];