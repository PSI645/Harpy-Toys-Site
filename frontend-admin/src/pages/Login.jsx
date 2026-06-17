import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import logo from '../assets/logo.png'

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [carregando, setCarregando] = useState(false)

    async function entrar() {
        if (email === '' || senha === '') {
            alert('Preencha todos os campos')
            return
        }

        setCarregando(true)
        try {
            const resposta = await api.post('/funcionarios/login', { email, senha })

            localStorage.setItem('usuario', JSON.stringify(resposta.data.usuario))
            localStorage.setItem('token', resposta.data.token)

            navigate('/principal')
        } catch (error) {
            alert(error.response?.data?.mensagem || 'Email ou senha incorretos')
        } finally {
            setCarregando(false)
        }
    }

    function teclaEnter(e) {
        if (e.key === 'Enter') entrar()
    }

    return (
        <div className='login-container'>
            <div className='login-box'>
                <img src={logo} className='logo' alt='HarpyToys' />
                <h1>Seja Bem-Vindo(a)</h1>

                <div className='input-group'>
                    <label>Email</label>
                    <input
                        type='email'
                        placeholder='Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={teclaEnter}
                    />
                </div>

                <div className='input-group'>
                    <label>Senha</label>
                    <input
                        type='password'
                        placeholder='Senha'
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        onKeyDown={teclaEnter}
                    />
                </div>

                <button onClick={entrar} disabled={carregando}>
                    {carregando ? 'Entrando...' : 'Entrar'}
                </button>
            </div>
        </div>
    )
}
