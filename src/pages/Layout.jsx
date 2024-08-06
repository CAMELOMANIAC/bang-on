import React from 'react';
import GlobalNav from '../components/GlobalNav';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div>
            <GlobalNav />
            <Outlet />
        </div>
    );
};

export default Layout;