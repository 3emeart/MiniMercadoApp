import { Routes } from '@angular/router';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { Login } from './pages/login/login';
import { ProdutoCadastro } from './pages/produtos/produto-cadastro/produto-cadastro';
import { ProductList } from './components/product-list/product-list';
import { PdvComponent } from './pages/vendas/pdv/pdv';
import { UsuarioLista } from './pages/usuarios/usuario-lista/usuario-lista';
import { PdvLogin } from './pages/vendas/pdv-login/pdv-login';
import { EstoqueGestao } from './pages/estoque/estoque-gestao/estoque-gestao';
import { FinanceiroDetalhe } from './pages/financeiro/financeiro-detalhe/financeiro-detalhe';
import { CategoriaLista } from './pages/produtos/categoria-lista/categoria-lista';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AuthLayout,
    children: [
      { path: 'login', component: Login }
    ]
  },
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: 'produtos', component: ProductList },
      { path: 'produtos/novo', component: ProdutoCadastro },
      { path: 'produtos/editar/:id', component: ProdutoCadastro },
      { path: 'estoque', component: EstoqueGestao },
      { path: 'financeiro', component: FinanceiroDetalhe },
      { path: 'usuarios', component: UsuarioLista },
      { path: 'categorias', component: CategoriaLista }
    ]
  },
  {
    path: 'pdv/login',
    component: PdvLogin
  },
  {
    path: 'pdv',
    component: PdvComponent
  }
];
