import React from 'react';
import './Sidebar.css';

const Sidebar = props => {
return (
  <div className="wrapper">
    <nav id="sidebar" className="active">
        <span id="dismiss" onClick={() => document.getElementById('sidebar').classList.toggle('active')}>&#x2715;</span>
        <div className="sidebar-header">
            <h3>PseudoCoin</h3>
        </div>
        <ul className="list-unstyled components">
            <p>Hello!</p>
            <li>
                <a href="/">Home</a>
            </li>
            <li>
                <a href="/wallet">Wallet</a>
            </li>
            <li>
                <a href="/trade">Trade</a>
            </li>
            <li>
                <a href="/notifications">Notifications</a>
            </li>
            <li>
                <a href="/trade">Trade</a>
            </li>
        </ul>
    </nav>
    <div id="content">
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
            <button 
            type="button" 
            id="sidebarCollapse" 
            className="btn btn-info"
            onClick={() => document.getElementById('sidebar').classList.toggle('active')}>
                <span>Menu</span>
            </button>

        </div>
    </nav>
    </div>
</div>
)
}

export default Sidebar;