import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

export default function ControleAdministrador() {
    const [usuarios, setUsuarios] = useState([])
    const [editando, setEditando] = useState(false)
    const [idEditando, setIdEditando] = useState(null)
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [perfil, setPerfil] = useState('vendedor')

    async function carregarUsuarios() {
        try {
            const resposta = await api.get('/funcionarios')
            setUsuarios(resposta.data)
        } catch (error) {
            alert(error.response?.data?.mensagem || 'Erro ao carregar usuários')
        }
    }

    useEffect(() => { carregarUsuarios() }, [])

    function editarUsuario(usuario) {
        setEditando(true)
        setIdEditando(usuario.id)
        setNome(usuario.nome)
        setEmail(usuario.email)
        setPerfil(usuario.perfil)
    }

    async function salvarEdicao() {
        try {
            await api.put(`/funcionarios/${idEditando}`, { nome, email, perfil })
            alert('Usuário atualizado')
            cancelarEdicao()
            carregarUsuarios()
        } catch (error) {
            alert(error.response?.data?.mensagem || 'Erro ao editar usuário')
        }
    }

    function cancelarEdicao() {
        setEditando(false)
        setIdEditando(null)
        setNome('')
        setEmail('')
        setPerfil('vendedor')
    }

    async function alterarStatus(usuario) {
        const novoAtivo = !usuario.ativo
        const acao = novoAtivo ? 'ativar' : 'bloquear'
        if (!confirm(`Deseja ${acao} o usuário ${usuario.nome}?`)) return

        try {
            await api.put(`/funcionarios/status/${usuario.id}`, { ativo: novoAtivo })
            carregarUsuarios()
        } catch (error) {
            alert(error.response?.data?.mensagem || 'Erro ao alterar status')
        }
    }

    async function excluirUsuario(usuario) {
        if (!confirm(`Excluir permanentemente o usuário ${usuario.nome}?`)) return

        try {
            await api.delete(`/funcionarios/${usuario.id}`)
            alert('Usuário excluído')
            carregarUsuarios()
        } catch (error) {
            alert(error.response?.data?.mensagem || 'Erro ao excluir usuário')
        }
    }

    const labelPerfil = {
        admin: 'Admin',
        estoque: 'Estoque',
        vendedor: 'Vendedor',
        suporte: 'Suporte',
    }

    return (
        <div className='principal-container'>
            <Sidebar />

            <div className='listagem-container'>
                <h1>Controle Administrador</h1>

                {editando && (
                    <div className='form-edicao'>
                        <h2>Editar Usuário</h2>

                        <input
                            type='text'
                            placeholder='Nome'
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />

                        <input
                            type='email'
                            placeholder='Email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
                            <option value='estoque'>Estoque</option>
                            <option value='vendedor'>Vendedor</option>
                            <option value='suporte'>Suporte</option>
                        </select>

                        <button className='btn-editar' onClick={salvarEdicao}>Salvar</button>
                        <button className='btn-apagar' onClick={cancelarEdicao}>Cancelar</button>
                    </div>
                )}

                <table className='tabela-produtos'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Perfil</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((usuario) => (
                            <tr key={usuario.id}>
                                <td>{usuario.id}</td>
                                <td>{usuario.nome}</td>
                                <td>{usuario.email}</td>
                                <td>{labelPerfil[usuario.perfil] || usuario.perfil}</td>
                                <td>{usuario.ativo ? 'Ativo' : 'Bloqueado'}</td>
                                <td>
                                    <button
                                        className='btn-editar'
                                        onClick={() => editarUsuario(usuario)}
                                    >
                                        Editar
                                    </button>

                                    <button
                                        className='btn-apagar'
                                        onClick={() => alterarStatus(usuario)}
                                    >
                                        {usuario.ativo ? 'Bloquear' : 'Ativar'}
                                    </button>

                                    <button
                                        className='btn-apagar'
                                        onClick={() => excluirUsuario(usuario)}
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
