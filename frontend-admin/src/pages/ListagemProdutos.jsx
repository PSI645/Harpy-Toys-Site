import { useEffect, useState, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function ListagemProdutos() {
    const [pesquisa, setPesquisa] = useState('')
    const [produtos, setProdutos] = useState([])
    const [editando, setEditando] = useState(false)
    const [idEditando, setIdEditando] = useState(null)

    const [nome, setNome] = useState('')
    const [preco, setPreco] = useState('')
    const [descricao, setDescricao] = useState('')
    const [estoque, setEstoque] = useState(0)
    const [destaque, setDestaque] = useState(false)
    const [imagemAtual, setImagemAtual] = useState(null)  // URL já salva
    const [novaImagem, setNovaImagem] = useState(null)    // File novo
    const [preview, setPreview] = useState(null)

    const [categoriaId, setCategoriaId] = useState('')
    const [categoriaSecundariaId, setCategoriaSecundariaId] = useState('')
    const [emOferta, setEmOferta] = useState(false)
    const [descontoPercentual, setDescontoPercentual] = useState(10)
    const [categorias, setCategorias] = useState([])

    // Slugs das categorias "etiqueta" — segunda forma de categorizar o produto
    const SLUGS_SECUNDARIAS = ['ofertas', 'garotos', 'garotas', 'ate-80-off']
    const categoriasPrincipais  = categorias.filter(c => !SLUGS_SECUNDARIAS.includes(c.slug))
    const categoriasSecundarias = categorias.filter(c => SLUGS_SECUNDARIAS.includes(c.slug))

    const inputRef = useRef(null)
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    const podeEditar = usuario?.perfil === 'admin' || usuario?.perfil === 'estoque'

    async function carregarProdutos() {
        try {
            const resposta = await api.get('/produtos')
            setProdutos(resposta.data)
        } catch {
            alert('Erro ao carregar produtos')
        }
    }

    useEffect(() => {
        carregarProdutos()
        api.get('/produtos/categorias')
            .then(r => setCategorias(r.data))
            .catch(() => {})
    }, [])

    function editarProduto(produto) {
        setEditando(true)
        setIdEditando(produto.id)
        setNome(produto.nome)
        setPreco(produto.preco)
        setDescricao(produto.descricao || '')
        setEstoque(produto.estoque || 0)
        setDestaque(!!produto.destaque)
        setCategoriaId(produto.categoria_id || '')
        setCategoriaSecundariaId(produto.categoria_secundaria_id || '')
        setEmOferta(!!produto.em_oferta)
        setDescontoPercentual(produto.desconto_percentual || 10)
        setImagemAtual(produto.imagem_url || null)
        setNovaImagem(null)
        setPreview(null)
    }

    function selecionarImagem(e) {
        const arquivo = e.target.files[0]
        if (!arquivo) return
        setNovaImagem(arquivo)
        setPreview(URL.createObjectURL(arquivo))
    }

    function removerNovaImagem() {
        setNovaImagem(null)
        setPreview(null)
        if (inputRef.current) inputRef.current.value = ''
    }

    async function salvarEdicao() {
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
        formData.append('ativo', 1)
        if (novaImagem) formData.append('imagem', novaImagem)

        try {
            await api.put(`/produtos/${idEditando}`, formData)
            alert('Produto atualizado com sucesso')
            cancelarEdicao()
            carregarProdutos()
        } catch (error) {
            alert(error.response?.data?.mensagem || 'Erro ao editar produto')
        }
    }

    function cancelarEdicao() {
        setEditando(false)
        setIdEditando(null)
        setNome('')
        setPreco('')
        setDescricao('')
        setEstoque(0)
        setDestaque(false)
        setCategoriaId('')
        setCategoriaSecundariaId('')
        setEmOferta(false)
        setDescontoPercentual(10)
        setImagemAtual(null)
        setNovaImagem(null)
        setPreview(null)
    }

    async function excluirProduto(id) {
        if (!confirm('Deseja remover este produto?')) return
        try {
            await api.delete(`/produtos/${id}`)
            alert('Produto removido com sucesso')
            carregarProdutos()
        } catch (error) {
            alert(error.response?.data?.mensagem || 'Erro ao remover produto')
        }
    }

    const produtosFiltrados = produtos.filter(p => {
        const texto = pesquisa.toLowerCase()
        return p.nome?.toLowerCase().includes(texto) || String(p.id).includes(texto)
    })

    // Monta src da imagem: se começa com /uploads, usa o backend; senão usa direto
    function srcImagem(url) {
        if (!url) return null
        return url.startsWith('/uploads') ? `${BASE_URL}${url}` : url
    }

    return (
        <div className='principal-container'>
            <Sidebar />

            <div className='listagem-container'>
                <div className='listagem-topo'>
                    <h1>Listagem de Produtos</h1>
                    <input
                        type='text'
                        placeholder='Pesquisar produto...'
                        value={pesquisa}
                        onChange={(e) => setPesquisa(e.target.value)}
                    />
                </div>

                {editando && (
                    <div className='form-edicao'>
                        <h2>Editar Produto</h2>

                        <input type='text' placeholder='Nome' value={nome}
                            onChange={(e) => setNome(e.target.value)} />
                        <input type='number' placeholder='Preço' value={preco} step='0.01'
                            onChange={(e) => setPreco(e.target.value)} />
                        <input type='text' placeholder='Descrição' value={descricao}
                            onChange={(e) => setDescricao(e.target.value)} />
                        <input type='number' placeholder='Estoque' value={estoque}
                            onChange={(e) => setEstoque(e.target.value)} />

                        <label>
                            <input type='checkbox' checked={destaque}
                                onChange={(e) => setDestaque(e.target.checked)} />
                            {' '}Destaque
                        </label>

                        {/* Categoria principal */}
                        {categoriasPrincipais.length > 0 && (
                            <div className='produto-input'>
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

                        {/* Categoria secundária — segunda forma de categorizar (opcional) */}
                        {categoriasSecundarias.length > 0 && (
                            <div className='produto-input'>
                                <select
                                    value={categoriaSecundariaId}
                                    onChange={(e) => setCategoriaSecundariaId(e.target.value)}
                                >
                                    <option value=''>Categoria secundária (opcional)</option>
                                    {categoriasSecundarias.map(c => (
                                        <option key={c.id} value={c.id}>{c.nome}</option>
                                    ))}
                                </select>
                                <small style={{ display: 'block', marginTop: 4, color: '#666' }}>
                                    O produto aparecerá tanto na categoria principal quanto nesta.
                                </small>
                            </div>
                        )}

                        {/* Oferta — desconto de até 20% sobre o preço */}
                        <div className='produto-input produto-destaque'>
                            <label>
                                <input
                                    type='checkbox'
                                    checked={emOferta}
                                    onChange={(e) => setEmOferta(e.target.checked)}
                                />
                                {' '}Produto em oferta (aplica desconto)
                            </label>

                            {emOferta && (
                                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <input
                                        type='range'
                                        min='0'
                                        max='20'
                                        step='1'
                                        value={descontoPercentual}
                                        onChange={(e) => setDescontoPercentual(e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <strong style={{ minWidth: 48, textAlign: 'right' }}>
                                        {descontoPercentual}%
                                    </strong>
                                </div>
                            )}

                            {emOferta && preco && (
                                <small style={{ display: 'block', marginTop: 6, color: '#666' }}>
                                    Preço de R$ {parseFloat(preco).toFixed(2).replace('.', ',')}
                                    {' → '}
                                    <strong style={{ color: '#0a7d2c' }}>
                                        R$ {(parseFloat(preco) * (1 - descontoPercentual / 100)).toFixed(2).replace('.', ',')}
                                    </strong>
                                    {' '}com {descontoPercentual}% de desconto
                                </small>
                            )}
                        </div>

                        {/* Imagem atual ou preview da nova */}
                        <div className='imagem-area'>
                            {(preview || imagemAtual) ? (
                                <div className='imagem-preview-wrapper'>
                                    <img
                                        src={preview || srcImagem(imagemAtual)}
                                        alt='Preview'
                                        className='imagem-preview'
                                    />
                                    {preview && (
                                        <button
                                            className='btn-remover-imagem'
                                            onClick={removerNovaImagem}
                                            type='button'
                                        >
                                            ✕ Remover nova imagem
                                        </button>
                                    )}
                                </div>
                            ) : null}

                            <div
                                className='imagem-drop-zone'
                                onClick={() => inputRef.current?.click()}
                                style={{ marginTop: '8px' }}
                            >
                                <span>📷 {imagemAtual ? 'Trocar imagem' : 'Selecionar imagem'}</span>
                                <small>JPG, PNG, WEBP ou GIF · máx. 5 MB</small>
                            </div>

                            <input
                                ref={inputRef}
                                type='file'
                                accept='image/jpeg,image/png,image/webp,image/gif'
                                onChange={selecionarImagem}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <button className='btn-editar' onClick={salvarEdicao}>Salvar</button>
                        <button className='btn-apagar' onClick={cancelarEdicao}>Cancelar</button>
                    </div>
                )}

                <table className='tabela-produtos'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Imagem</th>
                            <th>Produto</th>
                            <th>Preço</th>
                            <th>Estoque</th>
                            <th>Categoria</th>
                            <th>Etiquetas</th>
                            {podeEditar && <th>Ações</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {produtosFiltrados.map((produto) => (
                            <tr key={produto.id}>
                                <td>{produto.id}</td>
                                <td>
                                    {produto.imagem_url
                                        ? <img
                                            src={srcImagem(produto.imagem_url)}
                                            alt={produto.nome}
                                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                                          />
                                        : <span style={{ color: '#aaa' }}>—</span>
                                    }
                                </td>
                                <td>{produto.nome}</td>
                                <td>{produto.preco_fmt || `R$ ${parseFloat(produto.preco).toFixed(2)}`}</td>
                                <td>{produto.estoque}</td>
                                <td>{produto.categoria || '—'}</td>
                                <td>
                                    {produto.em_oferta && parseFloat(produto.desconto_percentual) > 0 && (
                                        <span style={{ background: '#ffe082', color: '#7a4f01', borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 700, marginRight: 4, display: 'inline-block' }}>
                                            -{produto.desconto_percentual}%
                                        </span>
                                    )}
                                    {produto.categoria_secundaria && (
                                        <span style={{ background: '#cce5ff', color: '#004085', borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 700, display: 'inline-block' }}>
                                            {produto.categoria_secundaria}
                                        </span>
                                    )}
                                    {!produto.em_oferta && !produto.categoria_secundaria && (
                                        <span style={{ color: '#aaa' }}>—</span>
                                    )}
                                </td>
                                {podeEditar && (
                                    <td>
                                        <button className='btn-editar'
                                            onClick={() => editarProduto(produto)}>
                                            Editar
                                        </button>
                                        <button className='btn-apagar'
                                            onClick={() => excluirProduto(produto.id)}>
                                            Excluir
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
