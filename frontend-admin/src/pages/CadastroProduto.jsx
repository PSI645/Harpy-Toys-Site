import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'

export default function CadastroProduto() {
    const [nome, setNome] = useState('')
    const [preco, setPreco] = useState('')
    const [descricao, setDescricao] = useState('')
    const [estoque, setEstoque] = useState(0)
    const [destaque, setDestaque] = useState(false)
    const [categoriaId, setCategoriaId] = useState('')
    const [categoriaSecundariaId, setCategoriaSecundariaId] = useState('')
    const [emOferta, setEmOferta] = useState(false)
    const [descontoPercentual, setDescontoPercentual] = useState(10)
    const [categorias, setCategorias] = useState([])

    // Slugs das categorias "etiqueta" — segunda forma de categorizar o produto
    const SLUGS_SECUNDARIAS = ['ofertas', 'garotos', 'garotas', 'ate-80-off']
    const categoriasPrincipais  = categorias.filter(c => !SLUGS_SECUNDARIAS.includes(c.slug))
    const categoriasSecundarias = categorias.filter(c => SLUGS_SECUNDARIAS.includes(c.slug))

    const [imagem, setImagem] = useState(null)        // File object
    const [preview, setPreview] = useState(null)      // URL de preview
    const [carregando, setCarregando] = useState(false)

    const inputImagemRef = useRef(null)
    const navigate = useNavigate()

    // Carrega categorias do banco
    useEffect(() => {
        api.get('/produtos/categorias')
            .then(r => setCategorias(r.data))
            .catch(() => {}) // silencioso se rota ainda não existir
    }, [])

    function selecionarImagem(e) {
        const arquivo = e.target.files[0]
        if (!arquivo) return

        const tiposValidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!tiposValidos.includes(arquivo.type)) {
            alert('Apenas imagens JPG, PNG, WEBP ou GIF são permitidas.')
            return
        }

        if (arquivo.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5 MB.')
            return
        }

        setImagem(arquivo)
        setPreview(URL.createObjectURL(arquivo))
    }

    function removerImagem() {
        setImagem(null)
        setPreview(null)
        if (inputImagemRef.current) inputImagemRef.current.value = ''
    }

    async function cadastrar() {
        if (nome === '' || preco === '') {
            alert('Nome e preço são obrigatórios')
            return
        }

        const formData = new FormData()
        formData.append('nome', nome)
        formData.append('preco', preco)
        formData.append('descricao', descricao)
        formData.append('estoque', estoque)
        formData.append('destaque', destaque)
        if (categoriaId) formData.append('categoria_id', categoriaId)
        if (categoriaSecundariaId) formData.append('categoria_secundaria_id', categoriaSecundariaId)
        formData.append('em_oferta', emOferta)
        formData.append('desconto_percentual', descontoPercentual)
        if (imagem) formData.append('imagem', imagem)

        setCarregando(true)
        try {
            await api.post('/produtos/cadastro', formData)

            alert('Produto cadastrado com sucesso!')

            setNome('')
            setPreco('')
            setDescricao('')
            setEstoque(0)
            setDestaque(false)
            setCategoriaId('')
            setCategoriaSecundariaId('')
            setEmOferta(false)
            setDescontoPercentual(10)
            removerImagem()

        } catch (error) {
            alert(error.response?.data?.mensagem || 'Erro ao cadastrar produto')
        } finally {
            setCarregando(false)
        }
    }

    const precoValido = parseFloat(preco) > 0

    return (
        <div className='principal-container'>
            <Sidebar />

            <div className='page-admin'>

                <div className='page-admin-header'>
                    <div>
                        <h1>Cadastrar Produto</h1>
                        <p>Preencha as informações abaixo para adicionar um novo item à loja.</p>
                    </div>
                    <button className='btn-admin btn-admin-outline' onClick={() => navigate('/produtos')}>
                        Ver Produtos
                    </button>
                </div>

                {/* Informações básicas */}
                <div className='form-card'>
                    <div className='form-card-title'>
                        <span className='icon'>📦</span> Informações Básicas
                    </div>

                    <div className='form-grid'>
                        <div className='form-field full'>
                            <label>Nome do produto *</label>
                            <input
                                type='text'
                                placeholder='Ex: Urso de Pelúcia Gigante'
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />
                        </div>

                        <div className='form-field'>
                            <label>Preço (R$) *</label>
                            <input
                                type='number'
                                placeholder='0,00'
                                value={preco}
                                onChange={(e) => setPreco(e.target.value)}
                                step='0.01'
                                min='0'
                            />
                        </div>

                        <div className='form-field'>
                            <label>Estoque</label>
                            <input
                                type='number'
                                placeholder='0'
                                value={estoque}
                                onChange={(e) => setEstoque(e.target.value)}
                                min='0'
                            />
                        </div>

                        <div className='form-field full'>
                            <label>Descrição</label>
                            <textarea
                                placeholder='Descreva detalhes, materiais, idade recomendada, etc.'
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Categorização */}
                <div className='form-card'>
                    <div className='form-card-title'>
                        <span className='icon'>🏷️</span> Categorização
                    </div>

                    <div className='form-grid'>
                        {categoriasPrincipais.length > 0 && (
                            <div className='form-field'>
                                <label>Categoria principal</label>
                                <select
                                    value={categoriaId}
                                    onChange={(e) => setCategoriaId(e.target.value)}
                                >
                                    <option value=''>Selecione a categoria</option>
                                    {categoriasPrincipais.map(c => (
                                        <option key={c.id} value={c.id}>{c.nome}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {categoriasSecundarias.length > 0 && (
                            <div className='form-field'>
                                <label>Categoria secundária (opcional)</label>
                                <select
                                    value={categoriaSecundariaId}
                                    onChange={(e) => setCategoriaSecundariaId(e.target.value)}
                                >
                                    <option value=''>Nenhuma</option>
                                    {categoriasSecundarias.map(c => (
                                        <option key={c.id} value={c.id}>{c.nome}</option>
                                    ))}
                                </select>
                                <span className='hint'>
                                    O produto aparecerá na categoria principal e também nesta.
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Imagem do produto */}
                <div className='form-card'>
                    <div className='form-card-title'>
                        <span className='icon'>🖼️</span> Imagem do Produto
                    </div>

                    {preview ? (
                        <div className='upload-preview-wrap'>
                            <img src={preview} alt='Preview' className='upload-preview-img' />
                            <div className='upload-preview-actions'>
                                <button
                                    className='btn-admin btn-admin-outline'
                                    onClick={() => inputImagemRef.current?.click()}
                                    type='button'
                                >
                                    Trocar imagem
                                </button>
                                <button
                                    className='btn-admin'
                                    style={{ background: '#fdf2f2', color: 'var(--admin-danger)', border: '1.5px solid #f6c9c9' }}
                                    onClick={removerImagem}
                                    type='button'
                                >
                                    Remover imagem
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className='upload-zone' onClick={() => inputImagemRef.current?.click()}>
                            <span className='upload-icon'>📷</span>
                            <strong>Clique para selecionar uma imagem</strong>
                            <small>JPG, PNG, WEBP ou GIF · máx. 5 MB</small>
                        </div>
                    )}

                    <input
                        ref={inputImagemRef}
                        type='file'
                        accept='image/jpeg,image/png,image/webp,image/gif'
                        onChange={selecionarImagem}
                        style={{ display: 'none' }}
                    />
                </div>

                {/* Oferta e visibilidade */}
                <div className='form-card'>
                    <div className='form-card-title'>
                        <span className='icon'>🎯</span> Oferta e Visibilidade
                    </div>

                    <div className='toggle-row'>
                        <div className='toggle-label'>
                            <strong>Produto em oferta</strong>
                            <span>Aplica um desconto de até 20% sobre o preço.</span>
                        </div>
                        <label className='switch'>
                            <input
                                type='checkbox'
                                checked={emOferta}
                                onChange={(e) => setEmOferta(e.target.checked)}
                            />
                            <span className='slider'></span>
                        </label>
                    </div>

                    {emOferta && (
                        <div className='oferta-panel'>
                            <div className='oferta-slider-row'>
                                <input
                                    type='range'
                                    min='0'
                                    max='20'
                                    step='1'
                                    value={descontoPercentual}
                                    onChange={(e) => setDescontoPercentual(e.target.value)}
                                />
                                <strong>{descontoPercentual}%</strong>
                            </div>

                            {precoValido && (
                                <div className='oferta-preview'>
                                    De <span className='old-price'>R$ {parseFloat(preco).toFixed(2).replace('.', ',')}</span>
                                    {' '}por{' '}
                                    <span className='new-price'>
                                        R$ {(parseFloat(preco) * (1 - descontoPercentual / 100)).toFixed(2).replace('.', ',')}
                                    </span>
                                    {' '}com {descontoPercentual}% de desconto
                                </div>
                            )}
                        </div>
                    )}

                    <div className='toggle-row'>
                        <div className='toggle-label'>
                            <strong>Destaque na Home</strong>
                            <span>Exibe este produto na seção de destaques da página inicial.</span>
                        </div>
                        <label className='switch'>
                            <input
                                type='checkbox'
                                checked={destaque}
                                onChange={(e) => setDestaque(e.target.checked)}
                            />
                            <span className='slider'></span>
                        </label>
                    </div>
                </div>

                {/* Ações */}
                <div className='page-admin-footer'>
                    <button className='btn-admin btn-admin-outline' onClick={() => navigate('/principal')}>
                        Voltar
                    </button>
                    <button className='btn-admin btn-admin-outline' onClick={() => navigate('/produtos')}>
                        Ver Produtos
                    </button>
                    <button className='btn-admin btn-admin-success' onClick={cadastrar} disabled={carregando}>
                        {carregando ? 'Cadastrando...' : 'Cadastrar Produto'}
                    </button>
                </div>

            </div>
        </div>
    )
}
