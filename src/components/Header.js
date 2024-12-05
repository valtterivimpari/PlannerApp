// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
    return (
        <div className="header">
            <Link to="/" className="logo">
                <span className="logo-gradient">Matkasuunnittelija</span>
            </Link>
        </div>
    );
}

export default Header;
