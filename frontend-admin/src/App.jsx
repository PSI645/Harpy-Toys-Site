import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import TelaPrincipal from './pages/TelaPrincipal'
import Dashboard from './pages/Dashboard'
import CadastroUsuario from './pages/CadastroUsuario'
import CadastroProduto from './pages/CadastroProduto'
import ListagemProdutos from './pages/ListagemProdutos'
import ControleAdministrador from './pages/ControleAdministrador'

// Rota que redireciona se não estiver logado
function RotaProtegida({ children }) {
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    if (!usuario) return <Navigate to='/' />
    return children
}

// Rota exclusiva para admin
function RotaAdmin({ children }) {
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    if (!usuario) return <Navigate to='/' />
    if (usuario.perfil !== 'admin') return <Navigate to='/principal' />
    return children
}

// Rota para admin ou estoque
function RotaEstoque({ children }) {
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    if (!usuario) return <Navigate to='/' />
    if (usuario.perfil !== 'admin' && usuario.perfil !== 'estoque')
        return <Navigate to='/principal' />
    return children
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Login />} />

                <Route path='/principal' element={
                    <RotaProtegida><TelaPrincipal /></RotaProtegida>
                } />

                <Route path='/dashboard' element={
                    <RotaProtegida><Dashboard /></RotaProtegida>
                } />

                <Route path='/cadastro-usuario' element={
                    <RotaAdmin><CadastroUsuario /></RotaAdmin>
                } />

                <Route path='/controle-administrador' element={
                    <RotaAdmin><ControleAdministrador /></RotaAdmin>
                } />

                <Route path='/cadastro-produto' element={
                    <RotaEstoque><CadastroProduto /></RotaEstoque>
                } />

                <Route path='/produtos' element={
                    <RotaProtegida><ListagemProdutos /></RotaProtegida>
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default App
