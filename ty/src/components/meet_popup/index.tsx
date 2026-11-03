import React, { FC,useEffect,useState} from 'react';
import { Text, View,Button,Image,getLaunchOptionsSync,getAI2AgentVariableAgentVariableList,getCdnUrl} from '@ray-js/ray';
import styles from './index.module.less';
import ball from '../../assets/images/tab/ball.png';
import send_popup_ball1 from '../../assets/images/tab/send_popup_ball1.png';
import send_popup_ball2 from '../../assets/images/tab/send_popup_ball2.png';
import send_popup_ball3 from '../../assets/images/tab/send_popup_ball3.png';
import send_popup_ball4 from '../../assets/images/tab/send_popup_ball4.png';
import meetPopupFont from '../../assets/images/tab/meet_popup_font.png';
import cdnImage from '../../../cdn/cdnImage.json';
import Strings from '@/i18n';



export default function MeetPopup(props){

  const close=()=>{
    props.onClose();
  }

  const [Myname,setMyname]=useState('');
  
  // 获取CDN背景图片URL
  const meetPopupBgUrl = getCdnUrl('meet_popup_bg.png', cdnImage);
  
  // 根据ballColor选择对应的send_popup_ball图片
  const getBallImage = (ballColor) => {
    if (!ballColor) return ball; // 默认图片
    
    // 从ballColor路径中提取ball编号
    const ballNumber = ballColor.match(/space_ball(\d+)-/)?.[1];
    if (!ballNumber) return ball; // 如果无法提取编号，返回默认图片
    
    // 根据编号返回对应的send_popup_ball图片
    switch (ballNumber) {
      case '1': return send_popup_ball1;
      case '2': return send_popup_ball2;
      case '3': return send_popup_ball3;
      case '4': return send_popup_ball4;
      default: return ball;
    }
  };
  useEffect(()=>{

    const {query: { deviceId }} = getLaunchOptionsSync();
    const FetchVariable=async()=>{
      try{
        const newVariables = await getAI2AgentVariableAgentVariableList({  
          devId: deviceId,  
        });
        const call = newVariables.find(user => user.variableKey === 'custom.call')?.variableValue;
        setMyname(`${call}${Strings.getLang('common_of')}${Strings.getLang('ball_name')}`);
      } catch(error){
        setMyname(Strings.getLang('meet_popup_owner_ball'));
      }
    }
    FetchVariable();
  })

    return (
        <>
          <View className={styles.bg} style={{backgroundImage: `url(${meetPopupBgUrl})`, backgroundPosition: 'center 20%'}}>
            <Image src={meetPopupFont} className={styles.meet_font} />
            <View className={styles.circle_container}>
              <View className={styles.box}>
                <Image src={getBallImage(props.myBallColor)} className={styles.Ball}></Image>
                <View className={styles.name_box}>
                  <Text className={styles.text1}>{Myname}</Text>
                </View>
              </View>
              <View className={styles.box}>
                <Image src={getBallImage(props.friendBallColor)} className={styles.Ball}></Image>
                <View className={styles.name_box}>
                  <Text className={styles.text1}>{props.userName}{Strings.getLang('common_of')}{props.FriendBallName}</Text>
                </View>
              </View>
            </View>

            <Button className={styles.know_btn} onClick={close}>{Strings.getLang('meet_popup_know_button')}</Button>
          </View>
          
          <View className={styles.mask}/>
        </>
      );
}

