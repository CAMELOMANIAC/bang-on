//@ts-check
import { useEffect, useState } from "react";
import "../styles/ChannelCard.css";
import { useColor } from 'color-thief-react';
import { getLocalStorageToArray } from "../utils/function/common";
import React from "react";
import { IoMdNotifications, IoMdNotificationsOutline } from "react-icons/io";
import { useQueryClient } from "@tanstack/react-query";

const ChannelCard = ({ data }) => {
    const currnetTime = new Date().getTime();
    const openTime = new Date(data.openDate).getTime();
    const diffTime = Math.floor((currnetTime - openTime) / 1000 / 60);

    //아프리카는 채널 이미지가 가짜일때 빈 이미지로 처리
    const [afreecaImage, setAfreecaImage] = useState('');
    useEffect(() => {
        if (data.platform === 'afreeca') {
            fetch(data.imageUrl).then(response => {
                if (response.ok) {
                    setAfreecaImage(data.imageUrl)
                }
            }).catch(() => {
                setAfreecaImage('https://res.afreecatv.com/afreeca.ico')
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.platform]);

    //치지직은 라이브 이미지의 src를 변경해야함(cors때문에 프록시를 거치도록 변경)
    const [liveImage, setLiveImage] = useState("/img/broadReady.svg");
    useEffect(() => {
        if (data.isAdult) {
            setLiveImage('/img/FBIWarning.jpg');
        } else if (data.platform === 'chzzk') {
            const replaceUrl = data.liveImageUrl ? (data.liveImageUrl).replace('{type}', '480') : '/img/broadReady.svg';
            const proxyUrl = replaceUrl.replace('https://livecloud-thumb.akamaized.net/', '/chzzk_thumb/');
            setLiveImage(proxyUrl);
        } else
            setLiveImage(data.liveImageUrl || '/img/broadReady.svg');
    }, [data.isAdult, data.liveImageUrl, data.platform])

    const { data: color, } = useColor(liveImage, 'rgbString', {
        crossOrigin: 'anonymous',
        quality: 10,
    });

    const rgbValues = color?.replace('rgb(', '').replace(')', '').split(',').map(Number);
    const averageColor = rgbValues && (rgbValues.reduce((acc, cur) => acc + cur) / rgbValues?.length);//rgb값의 평균으로 어두운지 밝은지 판단을 위한 변수
    const queryClient = useQueryClient();

    const onClickHandler = (e) => {
        const queryKey = data.platform === 'chzzk' ? data.name : data.id;
        queryClient.invalidateQueries({ queryKey: [queryKey], refetchType: 'all' });
        e.preventDefault();
        if (isLocalSave) {
            localStorage.removeItem(data.id);
            setIsLocalSave(false);
        } else {
            localStorage.setItem(data.id, JSON.stringify({ platform: data.platform, id: data.platform === 'chzzk' ? data.name : data.id }))
            setIsLocalSave(true);
        }
    }

    const [isLocalSave, setIsLocalSave] = useState(getLocalStorageToArray('id').some(item => item === data.id));

    useEffect(() => {
        setIsLocalSave(getLocalStorageToArray('id').some(item => item === data.id));
    }, [data.id])

    return (
        <a className="card_container_border_round" href={data.liveUrl && data.liveUrl} target="_blank" rel="noreferrer">
            <article className='card_container' style={{
                backgroundSize: `${data.liveImageUrl ? '400px' : 'contain'}`,
                backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 40%, ${data.liveImageUrl ? color : '#111'} 65%), url(${liveImage && liveImage})`,
                backgroundPosition: 'top center',
                backgroundRepeat: 'no-repeat',
                boxShadow: `${data.liveImageUrl ? "inset 0 0 10px 5px #111" : "none"}`,
                color: averageColor && averageColor > 128 ? 'black' : 'white'
            }}>
                <div className='liveImage_container'>
                    <button onClick={(e) => onClickHandler(e)}>
                        {isLocalSave ? <IoMdNotifications className="notification_button" /> : <IoMdNotificationsOutline className="notification_button" />}
                    </button>
                </div>

                <div className='platform_container'>
                    {data.platform === 'chzzk' && <>
                        <img src='https://ssl.pstatic.net/static/nng/glive/icon/favicon.png' alt='chzzk_icon' width={20}></img>
                        <p>치지직 {data.openDate && (diffTime < 60 ? diffTime + '분 전 시작' : Math.floor(diffTime / 60) + '시간 전 시작')}</p>
                    </>}
                    {data.platform === 'afreeca' && <>
                        <img src='https://res.afreecatv.com/afreeca.ico' alt='afreeca_icon' width={20}></img>
                        <p>아프리카tv {data.openDate && (diffTime < 60 ? diffTime + '분 전 시작' : Math.floor(diffTime / 60) + '시간 전 시작')}</p>
                    </>}
                </div>
                <div className='info_container'>
                    <div className='channelImage_container'>
                        {data.platform === 'chzzk' && <img src={data.imageUrl || 'https://ssl.pstatic.net/static/nng/glive/icon/favicon.png'} alt='channel_image' className="channelImage"></img>}
                        {data.platform === 'afreeca' && <img src={afreecaImage || 'https://res.afreecatv.com/afreeca.ico'} alt='channel_image' className="channelImage"></img>}
                    </div>
                    <div className='channelInfo_container'>
                        <h3 className='channelName'>{data.name}</h3>
                        <p className='liveTitle'>{data.liveTitle || '휴뱅'}</p>
                    </div>
                </div>
            </article>
        </a >
    );
};

export default ChannelCard;




/*

    const [imageSrc, setImageSrc] = useState(null);
    const { data } = useColor(imageSrc, 'rgbString');
    const [afreecaImage, setAfreecaImage] = useState(null);
    const isShowLive = useRecoilValue(showLiveState);
    const [steamingService, setSteamingService] = useRecoilState(steamingServiceState);
    const [subscribedChannel, setSubscribedChannel] = useRecoilState(subscribedChannelState);

    useEffect(() => {
        let imageSrc = liveImage;
        if (info.platform === "chzzk" && liveImage) {
            imageSrc = liveImage.replace('https://livecloud-thumb.akamaized.net/', '/chzzk_thumb/')
        }
        fetch(imageSrc)
            .then(response => response.blob())
            .then(blob => {
                const objectURL = URL.createObjectURL(blob);
                setImageSrc(objectURL);
            });
    }, [info.platform, liveImage]);

    useEffect(() => {
        if (info.platform === "afreeca") {//아프리카는 채널 이미지가 없을때 빈 이미지로 처리
            fetch(channelImage).then(response => {
                if (response.ok) {
                    setAfreecaImage(channelImage);
                } else {
                    setAfreecaImage("https://res.afreecatv.com/images/afmain/img_thumb_profile.gif");
                }
            })
        }
    }, [channelImage, info.platform])

    const rgbValues = data?.replace('rgb(', '').replace(')', '').split(',').map(Number);
    const averageColor = rgbValues?.reduce((acc, cur) => acc + cur) / rgbValues?.length;

    const onClick = () => {
        const clickItemChannelName = localStorage.getItem(info.platform + info.channelName);
        if (clickItemChannelName) {
            localStorage.removeItem(info.platform + info.channelName);
        } else {
            localStorage.setItem(info.platform + info.channelName, JSON.stringify(info));
        }
        //로컬스토리지 값을 다시 불러와서 상태에 반영
        setSubscribedChannel(getLocalStorageToArray());
    }

    const currnetTime = new Date().getTime();
    const openTime = new Date(info.openDate).getTime();
    const diffTime = Math.floor((currnetTime - openTime) / 1000 / 60);

    return (
        <article className='card_container' style={{
            backgroundSize: '400px',
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 40%, ${data} 65%), url(${liveImage && liveImage})`,
            backgroundPosition: 'top center',
            backgroundRepeat: 'no-repeat',
            color: averageColor > 128 ? 'black' : 'white',
            display: steamingService.includes(info.platform) ? (isShowLive ? (info.liveTitle ? 'flex' : 'none') : 'flex') : 'none'
        }} onClick={() => onClick()}>
            <div className='liveImage_container'>
                {/* {liveImage && liveImage !== "undefined" && <img src={liveImage} alt="live_image" className="liveImage"></img>}
                info.adult && '연령제한'}
                </div>
    
                {info.platform === 'chzzk' && <div className='platform_container'>
                    <img src='https://ssl.pstatic.net/static/nng/glive/icon/favicon.png' alt='chzzk_icon' width={20}></img>
                    <p>치지직 {info.openDate && (diffTime < 60 ? diffTime + '분 전 시작' : Math.floor(diffTime / 60) + '시간 전 시작')}</p>
                </div>}
                {info.platform === 'afreeca' && <div className='platform_container'>
                    <img src='https://res.afreecatv.com/afreeca.ico' alt='chzzk_icon' width={20}></img>
                    <p>아프리카 {info.openDate && (diffTime < 60 ? diffTime + '분 전 시작' : Math.floor(diffTime / 60) + '시간 전 시작')}</p>
                </div>}
                <div className='info_container'>
                    <div className='channelImage_container'>
                        {<img src={info.platform === 'chzzk' ? (channelImage ? channelImage : 'https://ssl.pstatic.net/static/nng/glive/icon/favicon.png') : afreecaImage} alt='channel_image' className="channelImage"></img>}
                    </div>
                    <div className='channelInfo_container'>
                        <h3 className='channelName'>{info.channelName}</h3>
                        <p className='liveTitle'>{info.liveTitle ? info.liveTitle : '휴뱅'}</p>
                    </div>
                </div>
            </article>
        );
         */