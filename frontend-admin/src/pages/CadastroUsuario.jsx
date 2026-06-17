import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

export default function CadastroUsuario() {
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [perfil, setPerfil] = useState('vendedor')
    const [carregando, setCarregando] = useState(false)

    const navigate = useNavigate()

    async function cadastrar() {
        if (nome === '' || email === '' || senha === '') {
            alert('Preencha todos os campos')
            return
        }

        setCarregando(true)
        try {
            await api.post('/funcionarios/cadastro', { nome, email, senha, perfil })
            alert('Usuário cadastrado com sucesso')
            navigate('/controle-administrador')
        } catch (error) {
            alert(error.response?.data?.mensagem || 'Erro ao cadastrar usuário')
        } finally {
            setCarregando(false)
        }
    }

    return (
        <div className='principal-container'>
            <Sidebar />

            <div className='page-admin'>

                <div className='page-admin-header'>
                    <div>
                        <h1>Cadastrar Usuário</h1>
                        <p>Adicione um novo membro à equipe e defina o nível de acesso.</p>
                    </div>
                </div>

                <div className='user-form-wrapper'>
                    <div className='form-card user-form-card'>
                        <div className='form-card-title'>
                            <span className='icon'>👤</span> Dados de Acesso
                        </div>

                        <div className='form-grid'>
                            <div className='form-field full'>
                                <label>Nome</label>
                                <input
                                    type='text'
                                    placeholder='Nome completo'
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                />
                            </div>

                            <div className='form-field full'>
                                <label>Email</label>
                                <input
                                    type='email'
                                    placeholder='email@harpytoys.com'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className='form-field full'>
                                <label>Senha</label>
                                <input
                                    type='password'
                                    placeholder='Defina uma senha de acesso'
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                />
                            </div>

                            <div className='form-field full'>
                                <label>Tipo de Perfil</label>
                                <select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
                                    <option value='estoque'>Estoque</option>
                                    <option value='vendedor'>Vendedor</option>
                                    <option value='suporte'>Suporte</option>
                                </select>
                                <span className='hint'>
                                    Define quais telas e ações este usuário poderá acessar.
                                </span>
                            </div>
                        </div>

                        <div className='page-admin-footer'>
                            <button className='btn-admin btn-admin-outline' onClick={() => navigate('/principal')}>
                                Voltar
                            </button>
                            <button className='btn-admin btn-admin-success' onClick={cadastrar} disabled={carregando}>
                                {carregando ? 'Cadastrando...' : 'Cadastrar'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
