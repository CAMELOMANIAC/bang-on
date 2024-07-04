//@ts-check
import React, { useState } from 'react';
import "../styles/GlobalNav.css";
import { IoMdMenu, IoMdNotificationsOutline } from 'react-icons/io';
import { BiSearch } from 'react-icons/bi';
import ChannelCard from './ChannelCard';

const GlobalNav = () => {
    const [isActive, setActive] = useState(false);

    return (
        <nav className={`nav_container ${isActive ? 'active' : ''}`}>
            <button onClick={() => setActive(prev => !prev)}>
                <IoMdMenu className={`nav_active_button ${isActive ? 'rotate' : ''}`} />
            </button>
            <div className={`nav_item_container ${isActive ? 'active' : ''}`}>
                <button>
                    <BiSearch className='nav_button' />
                </button>
                <input type='search' className='nav_search_box'></input>
            </div>
            <section className='favorite_container'>
                <button className='nav_inner_button'>
                    <IoMdNotificationsOutline className='nav_button' />
                </button>
                <div className={`${isActive ? 'card_grow' : 'card_shrink'}`}>
                    <ChannelCard data={{ id: 'asdf', name: 'test', platform: "chzzk" }}></ChannelCard>
                </div>
            </section>
        </nav>
    );
};

export default GlobalNav;