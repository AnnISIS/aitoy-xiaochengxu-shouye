import React, { useState,useEffect,useMemo } from 'react';
import { Text, View,Button,usePageEvent,navigateTo,Image,hideMenuButton,getStorage,setStorage,showToast,onDpDataChange, getCdnUrl, navigateBack, getLaunchOptionsSync} from '@ray-js/ray';
import styles from './index.module.less';
import cdnImage from '../../../cdn/cdnImage.json';
import space_ball_big from '../../assets/images/tab/space_ball_big.png'
import returnIcon from '../../assets/images/tab/return.png'
import space_ball1 from '../../assets/images/tab/space_ball1.png'
import space_ball2 from '../../assets/images/tab/space_ball2.png'
import space_ball3 from '../../assets/images/tab/space_ball3.png'
import space_ball4 from '../../assets/images/tab/space_ball4.png'
import space_circle1 from '../../assets/images/tab/space_circle1.png'
import space_circle2 from '../../assets/images/tab/space_circle2.png'
import space_circle3 from '../../assets/images/tab/space_circle3.png'
import match from '../../assets/images/tab/match.png'
import start from '../../assets/images/tab/start_match.png'
import friend from '../../assets/images/tab/friend.png'
import { useActions, useProps,utils } from '@ray-js/panel-sdk';
import FriendBall from '../../components/FriendBall';
import InformationPopup from '../../components/information_popup';
import{sp_switch_code,sp_contact_info_code,sp_contact_msg_code} from '@/constant/dpCodes';
import {ClosePosition,FarPosition} from './RandomPosition.jsx'
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import { getBallColorIndexByEsn } from '../../utils';
import Strings from '@/i18n';

//导出模块
export default function space() {
  const actions = useActions();
  const [remaining,setremaining]=useState(5);
  //crane add for test, change to true to open the space
  const [isOn,setisOn]=useState(false);
  
  // 获取CDN背景图片URL
  const spaceBgUrl = getCdnUrl(cdnImage['space_bg.png']);

  // 返回按钮处理函数
  const handleBack = () => {
    navigateBack();
  }

  //附近球球信息获取并添加进列表
  const [isFirstLoad1,setisFirstLoad1]=useState(false);
  const [deviceList, setDeviceList] = useState([]);
  // 跟踪每个球球是否收到消息
  const [messageStatus, setMessageStatus] = useState({});
  const sp_contact_info = useProps(props => props[sp_contact_info_code]);
  const { parseJSON } = utils;
  useEffect(() => {
    //首次加载页面不执行
    if(!isFirstLoad1)
    {
      setisFirstLoad1(true);
      return;
    }
    const dev_infomation=parseJSON(sp_contact_info);

    //根据下发的距离的不同设置
    let TempDistance;
    let isDim;
    if(dev_infomation.distance==="0,20")
    {
      TempDistance=20;
      isDim=false;
    }
    else if(dev_infomation.distance==="20,100")
    {
      TempDistance=100;
      isDim=true;
    }
    else{
      TempDistance=-1;
      isDim=true;
    }
    //设置自身的esn
    setStorage({
      key:'Myesn',
      data:dev_infomation.myesn
    })
    const hasBob = deviceList.some(item => item.esn === dev_infomation.esn);
    //距离小于一百米且不是同一个球球才显示
    if(!hasBob && TempDistance!==-1){        //去重
    setDeviceList([...deviceList, {
      // ballname:dev_infomation.dn,
      username:dev_infomation.un,
      esn:dev_infomation.esn,
      pid:dev_infomation.pid,
      dv:dev_infomation.dv,
      distance:TempDistance,
      isdim:isDim
    }]);
    getStorage({
      key:dev_infomation.esn,
      success(res){
        console.log('球球信息',res);
        if(res.data===null)
        {
          setStorage({
            key:dev_infomation.esn,
            data:{
              esn:dev_infomation.esn,
              pid:'1234',
              dv:'0.0.1',
              OtherSend:false,
              MySend:false,
              OtherSendInformation:false,
              InformationContent:'',
              MeetTimes:0,
              MeetMySend:false,
              MeetOtherSend:false,
              isMeet:false,
              FirstMeet:false,
              FirstMeetDay:'无',
              LastMeetDay:'无',
              Name:dev_infomation.dn,
              userName:dev_infomation.un,
              isSendInformation:false
            }
          })
        }
        else{
          getStorage({                  //每次打开开关搜索到熟悉的球球时偶遇逻辑
            key:dev_infomation.esn,
            success(res){
              setStorage({
                key:dev_infomation.esn,
                data:{
                  ...res.data,
                  MeetMySend:false,
                  isMeet:false,
                  Name:dev_infomation.dn,
                  userName:dev_infomation.un
                }
              })
            }
          })
        }
      },
    })
  }
    
  }, [sp_contact_info]);


  //附近球球发信息过来
  const sp_contact_msg = useProps(props => props[sp_contact_msg_code]);
  const [isFirstLoad2,setisFirstLoad2]=useState(false);
  
  useEffect(() => {
    //首次加载页面不执行
    if(!isFirstLoad2)
    {
      setisFirstLoad2(true);
      return;
    }
    console.log('触发了sp_contact_msg消息接收')
    const infomation=parseJSON(sp_contact_msg);
    if(sp_contact_msg!=='' && infomation.ssn !== null)
    {
      getStorage({
        key:infomation.ssn,
        success(res){
          if(res.data===null)    //如果发信息的球球未经过存储，设置初始值
          {
            setStorage({
              key:infomation.ssn,
              data:{
                esn:infomation.ssn,
                pid:'1234',
                dv:'0.0.1',
                OtherSend:true,
                MySend:false,
                OtherSendInformation:false,
                InformationContent:infomation.msg,
                MeetTimes:0,
                MeetMySend:false,
                MeetOtherSend:true,
                isMeet:false,
                FirstMeet:false,
                FirstMeetDay:'无',
                LastMeetDay:'无',
                Name:infomation.sdn,
                userName:infomation.sun,
                isSendInformation:true
              }
            })
          }
          else{
            setStorage({
              key:infomation.ssn,
              data:{
                ...res.data,
                OtherSend:true,
                MeetOtherSend:true,
                isSendInformation:true,
                InformationContent:infomation.msg
              },
            })
          }

          // 收到的消息已经存储在本地storage了，删除云端消息
          getStorage({
            key: 'Myesn',
            success(myEsnRes) {
              if (myEsnRes?.data !== infomation?.ssn) {
                actions[sp_contact_msg_code].set('');
              }
            },
          });
        }
      })
    }
  }, [sp_contact_msg]);

// 球球颜色数组（4种颜色）
const spaceBalls = [space_ball1, space_ball2, space_ball3, space_ball4];

// 根据 esn 获取球球颜色的函数
const getBallColorByEsn = (esn: string) => {
  const colorIndex = getBallColorIndexByEsn(esn, spaceBalls.length);
  return spaceBalls[colorIndex];
};

// 当前用户的球球颜色（固定为粉色 send_popup_ball3）
const myBallColor = space_ball3;

//空间智能开关打开
  const start_match =()=>{
    if(!isOn)         //从关闭到打开
    {
      actions[sp_switch_code].set(true);
    }
    else{             //从打开到关闭
      setDeviceList([]);
      actions[sp_switch_code].set(false);
    }
    setisOn(!isOn);
  }


//正在寻找...文本动态化
  const [dots, setDots] = useState('...');
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '.';
        if (prev === '.') return '..';
        return '...';
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

//页面跳转到好友列表
  const navigatetofriend=()=>{
    navigateTo({
      url:'/pages/friend/index',
    })
  }

//其他球球信息弹窗显示与关闭
  const [InformationPopupExist,setInformationPopupExist]=useState(false);
  const closeInformationPopup=()=>{
    setInformationPopupExist(false);
  }

//右上角胶囊按钮隐藏
  usePageEvent('onShow',()=>{
    hideMenuButton({});
  })

  //页面卸载时
  usePageEvent('onUnload',()=>{
    actions[sp_switch_code].set(false);
  })

  // 定期检查每个球球的消息状态
  useEffect(() => {
    if (deviceList.length === 0) return;
    
    const checkMessageStatus = () => {
      const newStatus = {};
      deviceList.forEach(device => {
        getStorage({
          key: device.esn,
          success(res) {
            if (res.data && typeof res.data === 'object') {
              const data = res.data as any;
              if (data && 'isSendInformation' in data) {
                const isSendInfo = Boolean(data.isSendInformation);
                newStatus[device.esn] = isSendInfo;
                setMessageStatus(prev => ({...prev, [device.esn]: isSendInfo}));
              }
            }
          }
        });
      });
    };
    
    checkMessageStatus();
    const timer = setInterval(checkMessageStatus, 1000);
    return () => clearInterval(timer);
  }, [deviceList]);

  // 对球球列表排序：收到消息的排在前面
  const sortedDeviceList = useMemo(() => {
    return [...deviceList].sort((a, b) => {
      const aHasMessage = messageStatus[a.esn] || false;
      const bHasMessage = messageStatus[b.esn] || false;
      
      // 收到消息的排在前面
      if (aHasMessage && !bHasMessage) return -1;
      if (!aHasMessage && bHasMessage) return 1;
      return 0;
    });
  }, [deviceList, messageStatus]);

  return (
    <>
    <View className={styles.bg} style={{backgroundImage: `url(${spaceBgUrl})`}}>
    
    {/* 顶部导航栏 */}
    <View className={styles.navbar}>
      <Button className={styles.nav_back_button} onClick={handleBack}>
        <Image src={returnIcon} className={styles.nav_back_icon} />
      </Button>
      <Text className={styles.nav_title}>{Strings.getLang('space_nav_title')}</Text>
      <Button className={styles.nav_friend_button} onClick={navigatetofriend}>
        <Image src={friend} className={styles.nav_friend_icon} />
      </Button>
    </View>

    <View className={styles.remindercontainer}>
      <Text className={styles.reminder1}> { isOn ? Strings.getLang('space_reminder_searching') + dots : Strings.getLang('space_reminder_click_switch')}</Text>
      <Text className={styles.reminder2}>{Strings.getLang('space_reminder_subtitle')}</Text>
    </View>

    <Image src={space_ball_big} className={`${styles.ball_img} ${isOn ? styles.ball_img_animated : ''}`} />

    { isOn &&
      <View>
      <Image src={space_circle1} className={styles.circle1} />
      <Image src={space_circle2} className={styles.circle2} />
      <Image src={space_circle3} className={styles.circle3} />
    </View>}

    <View className={styles.spacecontainer}>
      <Button className={styles.space_btn} onClick={start_match}>
        <Image src={isOn ? match : start} className={`${styles.space_img} ${!isOn ? styles.heartbeat_img : ''}`} />
      </Button>
      {isOn ?
        <Text className={styles.match_font}>{Strings.getLang('space_btn_stop')}</Text>:
        <Text className={styles.match_font}>{Strings.getLang('space_btn_start')}</Text>}
    </View>


    { sortedDeviceList[0]?.esn !== undefined  && sortedDeviceList.length >= 1 && sortedDeviceList.map((item, index) => {
      // 根据 esn 生成固定的球球颜色
      const ballImg = getBallColorByEsn(item.esn);
      return isOn && (
        <FriendBall 
          key={item.esn}
          top={item.distance<=20?ClosePosition[index].y:FarPosition[index].y} 
          left={item.distance<=20?ClosePosition[index].x:FarPosition[index].x} 
          isDim={item.isdim}
          remain={remaining} 
          friendball_img={ballImg}
          myBallColor={myBallColor}
          // FriendBallName={item.ballname}
          FriendBallName={Strings.getLang('ball_name')}
          FriendUserName={item.username}
          esn={item.esn}
          distance={item.distance}
          >
          </FriendBall>
      );
    })}

    </View>

    { InformationPopupExist &&
      <InformationPopup onClose={closeInformationPopup}></InformationPopup>}

    </>
  );
}


