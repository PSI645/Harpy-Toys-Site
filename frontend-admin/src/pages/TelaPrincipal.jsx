import Sidebar from '../components/Sidebar'
import { Link } from 'react-router-dom'

export default function TelaPrincipal() {
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    const isAdmin = usuario?.perfil === 'admin'
    const podeGerenciarProdutos = usuario?.perfil === 'admin' || usuario?.perfil === 'estoque'

    return (
        <div className='principal-container'>
            <Sidebar />

            <div className='principal-content'>

                {/* Card do usuário logado */}
                <div className='card-area'>
                    <h1>{usuario?.nome}</h1>
                    <p>Informações do usuário logado</p>
                    <div className='links-area'>
                        <span>Email: {usuario?.email}</span>
                        <span>Senha: ********</span>
                        <span>Perfil: {usuario?.perfil}</span>
                    </div>
                </div>

                {/* Dashboard de Pedidos — acesso rápido, acima das demais opções */}
                <div className='card-area'>
                    <h1>📊 Dashboard de Pedidos</h1>
                    <p>Acompanhe vendas, faturamento e status dos pedidos</p>
                    <div className='links-area'>
                        <Link to='/dashboard'>Ver Dashboard</Link>
                    </div>
                </div>

                {/* Controle Administrador — visível apenas para admins */}
                {isAdmin && (
                    <div className='card-area'>
                        <h1>Controle Administrador</h1>
                        <p>Gerencie os usuários do sistema</p>
                        <div className='links-area'>
                            <Link to='/cadastro-usuario'>Cadastrar Usuário</Link>
                            <Link to='/controle-administrador'>Alterar / Bloquear Usuário</Link>
                        </div>
                    </div>
                )}

                {/* Gestão de Produtos — visível para admin e estoque */}
                {podeGerenciarProdutos && (
                    <div className='card-area'>
                        <h1>Cadastro de Produto</h1>
                        <p>Selecione a rotina que deseja</p>
                        <div className='links-area'>
                            <Link to='/cadastro-produto'>Cadastrar</Link>
                            <Link to='/produtos'>Alterar Dados</Link>
                            <Link to='/produtos'>Excluir Produto</Link>
                        </div>
                    </div>
                )}

                {/* Listagem — visível para todos */}
                <div className='card-area'>
                    <h1>Listagem de Produto</h1>
                    <p>Selecione a rotina que deseja</p>
                    <div className='links-area'>
                        <Link to='/produtos'>Consultar Produto</Link>
                        <Link to='/produtos'>Filtrar Produto</Link>
                    </div>
                </div>

                <div className='eventos'>
                    <h2>Eventos do Sistema:</h2>
                    <div className='eventos-box'></div>
                </div>

            </div>
        </div>
    )
}
