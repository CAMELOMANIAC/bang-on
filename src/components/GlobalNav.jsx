//@ts-check
import React, { useState } from 'react';
import "../styles/GlobalNav.css";
import { IoMdMenu, IoMdNotificationsOutline } from 'react-icons/io';
import { BiSearch } from 'react-icons/bi';
import ChannelCard from './ChannelCard';
import useGetFavoriteChannelData from '../utils/hooks/useGetFavoriteChannelData';

const GlobalNav = () => {
    const [isActive, setActive] = useState(false);

    const { queriesResults, isSuccess } = useGetFavoriteChannelData();

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
                {isSuccess && queriesResults.map((item, index) => (
                    <div className={`${isActive ? 'card_grow' : 'card_shrink'}`} key={index}>
                        <ChannelCard data={item}></ChannelCard>
                    </div>
                ))}
            </section>
        </nav>
    );
};

export default GlobalNav;