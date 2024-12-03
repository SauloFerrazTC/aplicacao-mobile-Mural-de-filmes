import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'filme',
    loadComponent: () => import('./filme/filme.page').then( m => m.FilmePage)
  },
  {
    path: 'cadastrar-filme',
    loadComponent: () => import('./cadastrar-filme/cadastrar-filme.page').then( m => m.CadastrarFilmePage)
  },
  {
    path: 'comentario',
    loadComponent: () => import('./comentario/comentario.page').then( m => m.ComentarioPage)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./cadastro/cadastro.page').then( m => m.CadastroPage)
  },
];
