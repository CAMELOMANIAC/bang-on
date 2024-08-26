//@ts-check
import React, { useEffect, useRef, useState } from 'react';
import "../styles/GlobalNav.css";
import { IoMdMenu, IoMdNotificationsOutline } from 'react-icons/io';
import { BiSearch } from 'react-icons/bi';
import ChannelCard from './ChannelCard';
import useGetFavoriteChannelData from '../utils/hooks/useGetFavoriteChannelData';
import { useLocation, useNavigate } from 'react-router-dom';

const GlobalNav = () => {
    const [isActive, setActive] = useState(false);
    const { queriesResults, isSuccess } = useGetFavoriteChannelData();
    /** @type {{ current: HTMLInputElement | null }} */
    const inputRef = useRef(null);
    //{isLoading && "loading"}
    const { search } = useLocation();
    const searchParams = decodeURI(search.replace("?search=", ''));
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = searchParams;
        }
    }, [searchParams]);
    const navigate = useNavigate();
    const onClickSearchHandler = () => {
        navigate("/?search=" + (inputRef.current && inputRef.current.value));
    }

    return (
        <nav className={`nav_container ${isActive ? 'active' : ''}`}>
            <button onClick={() => setActive(prev => !prev)}>
                <IoMdMenu className={`nav_active_button ${isActive ? 'rotate' : ''}`} />
            </button>
            <div className={`nav_item_container ${isActive ? 'active' : ''}`}>
                <button onClick={onClickSearchHandler}>
                    <BiSearch className='nav_button' />
                </button>
                <input type='search' className='nav_search_box' ref={inputRef} aria-label="search" placeholder='스트리머 이름'></input>
            </div>
            <section className='favorite_container'>
                <button className='nav_inner_button'>
                    <IoMdNotificationsOutline className='nav_button' />
                </button>
                {isSuccess && queriesResults.map((item, index) => (
                    'platform' in item &&
                    <div className={`${isActive ? 'card_grow' : 'card_shrink'}`} key={index}>
                        <ChannelCard data={item}></ChannelCard>
                    </div>
                ))}
            </section>
        </nav>
    );
};

export default GlobalNav;