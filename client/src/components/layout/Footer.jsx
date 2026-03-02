import React from 'react'
import { Link } from 'react-router-dom'
import {
  PawPrint,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'

const Footer = () => {
  return (
    <footer className='footer-container'>
      <div className='glass-card footer-content'>
        <div className='footer-grid'>
          
          <div className='footer-brand'>
            <Link to='/' className='footer-logo'>
              <PawPrint size={28} className='logo-icon' />
              <span>VetCare</span>
            </Link>
            <p className='brand-desc'>
              Providing premium veterinary care and pet management services with
              a modern touch. Your pet's health is our top priority.
            </p>
            <div className='social-links'>
              <a href='#' className='social-icon'>
                <Facebook size={20} />
              </a>
              <a href='#' className='social-icon'>
                <Twitter size={20} />
              </a>
              <a href='#' className='social-icon'>
                <Instagram size={20} />
              </a>
            </div>
          </div>

          
          <div className='footer-section'>
            <h3 className='footer-heading'>Quick Links</h3>
            <ul className='footer-links'>
              <li>
                <Link to='/'>Home</Link>
              </li>
              <li>
                <Link to='/appointments'>Appointments</Link>
              </li>
              <li>
                <Link to='/shop'>Shop</Link>
              </li>
              <li>
                <Link to='/pets'>My Pets</Link>
              </li>
            </ul>
          </div>

          
          <div className='footer-section'>
            <h3 className='footer-heading'>Services</h3>
            <ul className='footer-links'>
              <li>
                <Link to='#'>Health Checkups</Link>
              </li>
              <li>
                <Link to='#'>Vaccinations</Link>
              </li>
              <li>
                <Link to='#'>Pet Grooming</Link>
              </li>
              <li>
                <Link to='#'>Emergency Care</Link>
              </li>
            </ul>
          </div>

          
          <div className='footer-section'>
            <h3 className='footer-heading'>Contact Us</h3>
            <ul className='footer-contact'>
              <li>
                <MapPin size={18} />
                <span>Samakhushi 5 street, Kathmandu, Nepal</span>
              </li>
              <li>
                <Phone size={18} />
                <span>(977) 9806747363</span>
              </li>
              <li>
                <Mail size={18} />
                <span>support@vetcare.com</span>
              </li>
            </ul>
          </div>
        </div>

        
        <div className='footer-bottom'>
          <p>&copy; {new Date().getFullYear()} VetCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
