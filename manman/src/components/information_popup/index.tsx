import React, { FC,useState} from 'react';
import { Text, View,Button,Image, navigateTo, getCdnUrl } from '@ray-js/ray';
import styles from './index.module.less';
import ball from '../../assets/images/tab/ball.png';
import send_popup_ball1 from '../../assets/images/tab/send_popup_ball1.png';
import send_popup_ball2 from '../../assets/images/tab/send_popup_ball2.png';
import send_popup_ball3 from '../../assets/images/tab/send_popup_ball3.png';
import send_popup_ball4 from '../../assets/images/tab/send_popup_ball4.png';
import CloseImg from '../../assets/images/tab/close.png';
import informationPopupTop from '../../assets/images/tab/information_popup_top.png';
import cdnImage from '../../../cdn/cdnImage.json';
import Strings from '@/i18n';



export default function InformationPopup(props){

  
  const close=()=>{
    props.onClose();
  }

  const OpenSendPopup=()=>{
    props.onOpenSendPopup();
  }

  // 获取CDN背景图片URL
  const informationPopupBgUrl = getCdnUrl('information_popup_bg.png', cdnImage);

  // 根据ballColor选择对应的send_popup_ball图片
  const getBallImage = () => {
    if (!props.ballColor) return ball; // 默认图片
    
    // 从ballColor路径中提取ball编号
    const ballNumber = props.ballColor.match(/space_ball(\d+)-/)?.[1];
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

    return (
        <>
          <View className={styles.container} style={{backgroundImage: `url(${informationPopupBgUrl})`}}>

            <Image src={informationPopupTop} className={styles.topImage}></Image>

            <Image src={CloseImg} className={styles.close} onClick={close}></Image>

            <Image src={getBallImage()} className={styles.ball} />

            <Text className={styles.name}>{props.userName}{Strings.getLang('common_of')}{props.Name}</Text>

            <Text className={styles.distant_font}>{Strings.getLang('information_popup_nearby_message')}</Text>

            <View className={styles.messageBox}>
              <Text className={styles.information}>{props.information}</Text>
            </View>

            <Button className={styles.reply_btn} onClick={OpenSendPopup}>{Strings.getLang('information_popup_reply')}</Button>
          </View>

          <View className={styles.mask}/>
        </>
      );
}

