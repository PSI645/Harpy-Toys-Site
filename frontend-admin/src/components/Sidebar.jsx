import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

import {
  FaHome,
  FaChartBar,
  FaUserPlus,
  FaBoxOpen,
  FaClipboardList,
  FaSignOutAlt
} from 'react-icons/fa'

export default function Sidebar(){

    return(

        <div className='sidebar'>

            <img src={logo} className='sidebar-logo'/>

            <div className='sidebar-icons'>

                <Link to='/principal' title='Tela Principal'>
                    <FaHome/>
                </Link>

                <Link to='/dashboard' title='Dashboard de Pedidos'>
                    <FaChartBar/>
                </Link>

                <Link to='/cadastro-usuario' title='Cadastro de Usuário'>
                    <FaUserPlus/>
                </Link>

                <Link to='/cadastro-produto' title='Cadastro de Produto'>
                    <FaBoxOpen/>
                </Link>

                <Link to='/produtos' title='Listagem de Produtos'>
                    <FaClipboardList/>
                </Link>

                <Link to='/' title='Sair'>
                    <FaSignOutAlt/>
                </Link>

            </div>

        </div>

    )
}