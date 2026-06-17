import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Home             from "./pages/Home";
import Carrinho         from "./pages/Carrinho";
import FinalizarPedido  from "./pages/FinalizarPedido";
import Login            from "./pages/Login";
import Vitrine          from "./pages/Vitrine";
import Produto          from "./pages/Produto";
import Cadastro         from "./pages/Cadastro";
import EsqueceuSenha    from "./pages/EsqueceuSenha";
import RedefinirSenha   from "./pages/RedefinirSenha";
import Perfil           from "./pages/Perfil";
import PerfilConta      from "./pages/PerfilConta";
import PerfilPedidos    from "./pages/PerfilPedidos";
import PerfilCartoes    from "./pages/PerfilCartoes";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                   element={<Home />} />
          <Route path="/carrinho"           element={<Carrinho />} />
          <Route path="/finalizar"          element={<FinalizarPedido />} />
          <Route path="/login"              element={<Login />} />
          <Route path="/vitrine/:categoria" element={<Vitrine />} />
          <Route path="/produto/:id"        element={<Produto />} />
          <Route path="/Cadastro"           element={<Cadastro />} />
          <Route path="/esqueceu-senha"     element={<EsqueceuSenha />} />
          <Route path="/redefinir-senha"    element={<RedefinirSenha />} />
          <Route path="/perfil"             element={<Perfil />} />
          <Route path="/perfil/conta"       element={<PerfilConta />} />
          <Route path="/perfil/pedidos"     element={<PerfilPedidos />} />
          <Route path="/perfil/cartoes"     element={<PerfilCartoes />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
