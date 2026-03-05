import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LogOut,
  Home,
  Calendar,
  PawPrint,
  ShoppingBag,
  LayoutDashboard,
  User,
  Package,
  Menu,
  X,
} from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    navigate('/login')
  }

  const linkStyle = (path) => ({
    color: location.pathname === path ? '#6366f1' : 'white',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 15px',
    borderRadius: '8px',
    background:
      location.pathname === path ? 'rgba(99,102,241,0.15)' : 'transparent',
    transition: 'all 0.2s',
    width: '100%',
  })

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <nav
      className='glass-card'
      style={{
        margin: '15px',
        padding: '12px 20px',
        position: 'sticky',
        top: '15px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Link
          to='/'
          onClick={() => setIsOpen(false)}
          style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '1.4rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <PawPrint size={26} /> VetCare
        </Link>

        <button
          onClick={toggleMenu}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
          }}
          className='mobile-show'
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div
          style={{
            display: isOpen ? 'none' : 'flex',
            gap: '5px',
            alignItems: 'center',
          }}
          className='mobile-hide'
        >
          <Link to='/' style={linkStyle('/')}>
            <Home size={18} /> Home
          </Link>
          {user ? (
            <>
              {user.role === 'Admin' ? (
                <Link
                  to='/admin'
                  style={{
                    ...linkStyle('/admin'),
                    color: '#fbbf24',
                    fontWeight: '600',
                  }}
                >
                  <LayoutDashboard size={18} /> Admin Panel
                </Link>
              ) : (
                <>
                  <Link to='/dashboard' style={linkStyle('/dashboard')}>
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <Link to='/pets' style={linkStyle('/pets')}>
                    <PawPrint size={18} /> My Pets
                  </Link>
                  <Link to='/appointments' style={linkStyle('/appointments')}>
                    <Calendar size={18} /> Appointments
                  </Link>
                  <Link to='/shop' style={linkStyle('/shop')}>
                    <ShoppingBag size={18} /> Shop
                  </Link>
                  <Link to='/orders' style={linkStyle('/orders')}>
                    <Package size={18} /> Orders
                  </Link>
                </>
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginLeft: '10px',
                  borderLeft: '1px solid rgba(255,255,255,0.1)',
                  paddingLeft: '15px',
                }}
              >
                <Link to='/profile' style={linkStyle('/profile')}>
                  <User size={18} /> {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className='btn-primary'
                  style={{ padding: '8px 15px' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to='/login' style={linkStyle('/login')}>
                Login
              </Link>
              <Link
                to='/register'
                className='btn-primary'
                style={{ textDecoration: 'none' }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            marginTop: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '10px 0',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
          className='mobile-show'
        >
          <Link to='/' onClick={() => setIsOpen(false)} style={linkStyle('/')}>
            <Home size={18} /> Home
          </Link>
          {user ? (
            <>
              {user.role === 'Admin' ? (
                <Link
                  to='/admin'
                  onClick={() => setIsOpen(false)}
                  style={{ ...linkStyle('/admin'), color: '#fbbf24' }}
                >
                  <LayoutDashboard size={18} /> Admin Panel
                </Link>
              ) : (
                <>
                  <Link
                    to='/dashboard'
                    onClick={() => setIsOpen(false)}
                    style={linkStyle('/dashboard')}
                  >
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <Link
                    to='/pets'
                    onClick={() => setIsOpen(false)}
                    style={linkStyle('/pets')}
                  >
                    <PawPrint size={18} /> My Pets
                  </Link>
                  <Link
                    to='/appointments'
                    onClick={() => setIsOpen(false)}
                    style={linkStyle('/appointments')}
                  >
                    <Calendar size={18} /> Appointments
                  </Link>
                  <Link
                    to='/shop'
                    onClick={() => setIsOpen(false)}
                    style={linkStyle('/shop')}
                  >
                    <ShoppingBag size={18} /> Shop
                  </Link>
                  <Link
                    to='/orders'
                    onClick={() => setIsOpen(false)}
                    style={linkStyle('/orders')}
                  >
                    <Package size={18} /> My Orders
                  </Link>
                </>
              )}
              <Link
                to='/profile'
                onClick={() => setIsOpen(false)}
                style={linkStyle('/profile')}
              >
                <User size={18} /> Profile ({user.username})
              </Link>
              <button
                onClick={handleLogout}
                className='btn-primary'
                style={{
                  padding: '12px',
                  width: '100%',
                  marginTop: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '10px',
                }}
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <Link
                to='/login'
                onClick={() => setIsOpen(false)}
                style={linkStyle('/login')}
              >
                Login
              </Link>
              <Link
                to='/register'
                onClick={() => setIsOpen(false)}
                className='btn-primary'
                style={{ textDecoration: 'none', textAlign: 'center' }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
