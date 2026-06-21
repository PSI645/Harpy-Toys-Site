import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
})

// Injeta token automaticamente
// Para FormData (upload), NÃO define Content-Type manualmente —
// o browser precisa setar sozinho para incluir o boundary do multipart
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Remove Content-Type para FormData — axios/browser gerencia o boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  return config
})

export default api
