import React from 'react';
import { Text, View, Button, Image, getCdnUrl } from '@ray-js/ray';
import styles from './index.module.less';
import CloseImg from '../../assets/images/tab/close.png';
import cdnImage from '../../../cdn/cdnImage.json';
import flowerReminderBall from '../../assets/images/tab/flower_reminder_ball.png';
import AwareFlower from '../../assets/images/tab/AwareFlower.png';
import ActionFlower from '../../assets/images/tab/ActionFlower.png';
import BraveFlower from '../../assets/images/tab/BraveFlower.png';
import CaringFlower from '../../assets/images/tab/CaringFlower.png';
import RealFlower from '../../assets/images/tab/RealFlower.png';
import Strings from '@/i18n';

export default function FlowerReminder(props){

    const close = () => {
      props.onClose();
    }

    const closeButton = () => {
      props.onCloseButton && props.onCloseButton();
    }

    // 背景图与 information_popup 保持一致
    const flowerReminderBgUrl = getCdnUrl('flower_reminder_bg.png', cdnImage);

    const getFlowerImage = () => {
      const type = String(props.flowertype || props.flowerType || '').toLowerCase();
      switch (type) {
        case 'action':
          return ActionFlower;
        case 'aware':
          return AwareFlower;
        case 'brave':
          return BraveFlower;
        case 'caring':
          return CaringFlower;
        case 'real':
          return RealFlower;
        default:
          return AwareFlower;
      }
    }

    return (
        <>
          <View className={styles.container} style={{backgroundImage: `url(${flowerReminderBgUrl})`}}>
            <Image src={flowerReminderBall} className={styles.ball} />
            <Image src={getFlowerImage()} className={styles.flower} />

            <Image src={CloseImg} className={styles.close} onClick={closeButton}></Image>

            <View className={styles.messageBox}>
              <Text className={styles.information}>{props.text}</Text>
            </View>

            <Button className={styles.reply_btn} onClick={close}>{Strings.getLang('flower_letter_button')}</Button>
          </View>

          <View className={styles.mask}/>
        </>
      );
}

