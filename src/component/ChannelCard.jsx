import React, { useEffect, useState } from 'react';
import "./ChannelCard.css";
import { useColor } from 'color-thief-react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { showLiveState, steamingServiceState, subscribedChannelState } from '../globalState/atom';
import { getLocalStorageToArray } from '../publicFunction/getLocalStorageToArray';
import broadReadyImage from "../img/broadReady.svg";
import convertJSONPToJSON from '../publicFunction/convertJSONPToJSON';
import { useQuery } from 'react-query';


const fetchAfreecaLiveData = async (searchQuery) => {
    return fetch(
        `https://sch.afreecatv.com/api.php?callback=jQuery1102029730713549332743_1714718653058&m=liveSearch&v=1.0&szOrder=&c=UTF-8&szKeyword=${encodeURIComponent(
            searchQuery
        )}&nPageNo=1&nListCnt=1&hl=1&onlyParent=1&tab=LIVE&location=total_search`
    )
        .then((response) => response.text())
        .then((text) => {
            const jsonText = convertJSONPToJSON(text);
            const data = JSON.parse(jsonText);
            return data;
        });
};

const ChannelCard = ({ channelImage, info }) => {
    const [liveImage, setLiveImage] = useState(info.liveImage || broadReadyImage);
    const [imageSrc, setImageSrc] = useState(null);
    const { data } = useColor(imageSrc, 'rgbString');
    const [afreecaImage, setAfreecaImage] = useState(null);
    const isShowLive = useRecoilValue(showLiveState);
    const steamingService = useRecoilValue(steamingServiceState);
    const [_subscribedChannel, setSubscribedChannel] = useRecoilState(subscribedChannelState);// eslint-disable-line no-unused-vars
    const [isQueryEnabled, setIsQueryEnabled] = useState(false);

    const { data: afreecaLiveData, isSuccess } = useQuery(['afreecaLiveData', info.channelName + info.platform],
        () => fetchAfreecaLiveData(info.channelName),
        { enabled: isQueryEnabled, onSuccess: (data) => (setIsQueryEnabled(false)) })

    //const {data: chzzkLiveData} = useQuery(['chzzkLiveData', info.channelName + info.platform])
    useEffect(() => {
        if (info.platform === "afreeca") {
            setIsQueryEnabled(true);
        }
        if (info.platform === "chzzk") {

        }
    }, [])// eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (isSuccess && info?.platform === "afreeca") {
            if (afreecaLiveData.REAL_BROAD) {
                const liveData = afreecaLiveData.REAL_BROAD[0];
                if ((liveData?.user_nick === info.channelName) && liveData) {
                    setLiveImage(liveData.broad_img);
                    info.liveTitle = liveData.broad_title;
                }
            }
        }
    }, [isSuccess])// eslint-disable-line react-hooks/exhaustive-deps

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
                {/* {liveImage && liveImage !== "undefined" && <img src={liveImage} alt="live_image" className="liveImage"></img>} */
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
};

export default ChannelCard;