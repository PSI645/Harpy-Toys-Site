import { useState, useEffect, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

const STATUS_INFO = {
    pendente:    { label: 'Pendente',    bg: '#fff8e1', color: '#f57f17', border: '#ffe082' },
    pago:        { label: 'Pago',        bg: '#e8f5e9', color: '#2e7d32', border: '#c5e1a5' },
    processando: { label: 'Processando', bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' },
    enviado:     { label: 'Enviado',     bg: '#ede7f6', color: '#4527a0', border: '#b39ddb' },
    entregue:    { label: 'Entregue',    bg: '#e8f5e9', color: '#2e7d32', border: '#c5e1a5' },
    cancelado:   { label: 'Cancelado',   bg: '#ffebee', color: '#c62828', border: '#ffcdd2' },
}

const fmtPreco = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',')

const fmtData = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

export default function Dashboard() {
    const [resumo, setResumo] = useState(null)
    const [pedidos, setPedidos] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState('')

    const [busca, setBusca] = useState('')
    const [filtroStatus, setFiltroStatus] = useState('todos')

    async function carregar() {
        setCarregando(true)
        setErro('')
        try {
            const [resResumo, resPedidos] = await Promise.all([
                api.get('/pedidos/resumo'),
                api.get('/pedidos'),
            ])
            setResumo(resResumo.data)
            setPedidos(resPedidos.data)
        } catch (error) {
            setErro(error.response?.data?.mensagem || 'Erro ao carregar pedidos')
        } finally {
            setCarregando(false)
        }
    }

    useEffect(() => { carregar() }, [])

    async function alterarStatus(pedido, novoStatus) {
        try {
            await api.put(`/pedidos/${pedido.id}/status`, { status: novoStatus })
            setPedidos(prev => prev.map(p => p.id === pedido.id ? { ...p, status: novoStatus } : p))
        } catch (error) {
            alert(error.response?.data?.mensagem || 'Erro ao atualizar status')
        }
    }

    const pedidosFiltrados = useMemo(() => {
        return pedidos.filter(p => {
            if (filtroStatus !== 'todos' && (p.status || 'pendente') !== filtroStatus) return false
            if (busca) {
                const termo = busca.toLowerCase()
                const nome = (p.cliente_nome || '').toLowerCase()
                const email = (p.cliente_email || '').toLowerCase()
                const numero = (p.numero_pedido || '').toLowerCase()
                if (!nome.includes(termo) && !email.includes(termo) && !numero.includes(termo)) return false
            }
            return true
        })
    }, [pedidos, busca, filtroStatus])

    return (
        <div className='principal-container'>
            <Sidebar />

            <div className='page-admin'>

                <div className='page-admin-header'>
                    <div>
                        <h1>Dashboard de Pedidos</h1>
                        <p>Visão geral das vendas realizadas na loja.</p>
                    </div>
                    <button className='btn-admin btn-admin-outline' onClick={carregar} disabled={carregando}>
                        {carregando ? 'Atualizando...' : '⟳ Atualizar'}
                    </button>
                </div>

                {erro && (
                    <div className='form-card' style={{ borderColor: '#f6c9c9', background: '#fdf2f2', color: 'var(--admin-danger)', fontWeight: 700 }}>
                        {erro}
                    </div>
                )}

                {/* KPIs */}
                <div className='kpi-grid'>
                    <div className='kpi-card'>
                        <span className='kpi-icon'>🧾</span>
                        <div>
                            <span className='kpi-label'>Total de Pedidos</span>
                            <strong className='kpi-value'>{resumo ? resumo.total_pedidos : '—'}</strong>
                        </div>
                    </div>

                    <div className='kpi-card'>
                        <span className='kpi-icon'>💰</span>
                        <div>
                            <span className='kpi-label'>Faturamento Total</span>
                            <strong className='kpi-value kpi-success'>{resumo ? fmtPreco(resumo.faturamento_total) : '—'}</strong>
                        </div>
                    </div>

                    <div className='kpi-card'>
                        <span className='kpi-icon'>⏳</span>
                        <div>
                            <span className='kpi-label'>Pedidos Pendentes</span>
                            <strong className='kpi-value kpi-warning'>{resumo ? resumo.pedidos_pendentes : '—'}</strong>
                        </div>
                    </div>

                    <div className='kpi-card'>
                        <span className='kpi-icon'>📊</span>
                        <div>
                            <span className='kpi-label'>Ticket Médio</span>
                            <strong className='kpi-value'>{resumo ? fmtPreco(resumo.ticket_medio) : '—'}</strong>
                        </div>
                    </div>
                </div>

                {/* Tabela de pedidos */}
                <div className='form-card'>
                    <div className='form-card-title' style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <span><span className='icon'>🛍️</span> Pedidos</span>

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <input
                                type='text'
                                placeholder='Buscar por cliente, email ou nº do pedido'
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                style={{
                                    height: 38, padding: '0 14px', borderRadius: 10,
                                    border: '1.5px solid var(--admin-border)', fontSize: 13,
                                    fontFamily: 'inherit', minWidth: 240
                                }}
                            />
                            <select
                                value={filtroStatus}
                                onChange={(e) => setFiltroStatus(e.target.value)}
                                style={{
                                    height: 38, padding: '0 12px', borderRadius: 10,
                                    border: '1.5px solid var(--admin-border)', fontSize: 13,
                                    fontFamily: 'inherit'
                                }}
                            >
                                <option value='todos'>Todos os status</option>
                                {Object.entries(STATUS_INFO).map(([key, info]) => (
                                    <option key={key} value={key}>{info.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {carregando ? (
                        <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--admin-muted)' }}>
                            Carregando pedidos...
                        </p>
                    ) : pedidosFiltrados.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--admin-muted)' }}>
                            Nenhum pedido encontrado.
                        </p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className='tabela-produtos'>
                                <thead>
                                    <tr>
                                        <th>Pedido</th>
                                        <th>Cliente</th>
                                        <th>Itens</th>
                                        <th>Valor Total</th>
                                        <th>Pagamento</th>
                                        <th>Status</th>
                                        <th>Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidosFiltrados.map(pedido => {
                                        const statusKey = (pedido.status || 'pendente').toLowerCase()
                                        const st = STATUS_INFO[statusKey] || STATUS_INFO.pendente

                                        return (
                                            <tr key={pedido.id}>
                                                <td style={{ fontWeight: 700 }}>{pedido.numero_pedido || `#${pedido.id}`}</td>
                                                <td>
                                                    <div style={{ fontWeight: 700 }}>{pedido.cliente_nome || 'Cliente não identificado'}</div>
                                                    <div style={{ fontSize: 12, color: 'var(--admin-muted)' }}>{pedido.cliente_email || '—'}</div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>{pedido.total_itens}</td>
                                                <td style={{ fontWeight: 800, color: 'var(--admin-accent)' }}>{fmtPreco(pedido.valor_total)}</td>
                                                <td style={{ textTransform: 'capitalize' }}>{(pedido.forma_pagamento || '—').replace('_', ' ')}</td>
                                                <td>
                                                    <select
                                                        value={statusKey}
                                                        onChange={(e) => alterarStatus(pedido, e.target.value)}
                                                        style={{
                                                            background: st.bg, color: st.color, border: `1.5px solid ${st.border}`,
                                                            borderRadius: 20, padding: '4px 10px', fontWeight: 800, fontSize: 12,
                                                            fontFamily: 'inherit', cursor: 'pointer'
                                                        }}
                                                    >
                                                        {Object.entries(STATUS_INFO).map(([key, info]) => (
                                                            <option key={key} value={key}>{info.label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td style={{ fontSize: 13, color: 'var(--admin-muted)' }}>{fmtData(pedido.data_pedido)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
