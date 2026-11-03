import React from 'react';
import { Text, View, Button, Image, getCdnUrl } from '@ray-js/ray';
import styles from './index.module.less';
import FlowerLetterBall from '../../assets/images/tab/flower_reminder_ball.png';
import CloseImg from '../../assets/images/tab/close.png';
import cdnImage from '../../../cdn/cdnImage.json';
import Strings from '@/i18n';



export default function FlowerLetter(props){

    const close = () => {
      props.onClose && props.onClose();
    }

    const closeButton = () => {
      props.onCloseButton && props.onCloseButton();
    }

    const letterBgName = () => {
      const type = String(props.flowertype || props.flowerType || '').toLowerCase();
      switch (type) {
        case 'action':
          return 'ActionFlowerLetter.png';
        case 'aware':
          return 'AwareFlowerLetter.png';
        case 'brave':
          return 'BraveFlowerLetter.png';
        case 'caring':
          return 'CaringFlowerLetter.png';
        case 'real':
          return 'RealFlowerLetter.png';
        default:
          return 'ActionFlowerLetter.png';
      }
    }

    // 根据花类型生成对应的文案
    const getLetterTextByType = () => {
      const type = String(props.flowertype || props.flowerType || '').toLowerCase();
      const userName = props.UserName || '';
      
      switch (type) {
        case 'brave':
          return Strings.getLang('flower_letter_brave_text');
        case 'real':
          return Strings.getLang('flower_letter_real_text');
        case 'caring':
          return Strings.getLang('flower_letter_caring_text');
        case 'aware':
          return Strings.getLang('flower_letter_aware_text');
        case 'action':
          return Strings.getLang('flower_letter_action_text');
        default:
          return props.text || '';
      }
    }

    // 根据花类型生成对应的签名
    const getLetterSignature = () => {
      const type = String(props.flowertype || props.flowerType || '').toLowerCase();
      switch (type) {
        case 'brave':
          return Strings.getLang('flower_letter_brave_signature');
        case 'real':
          return Strings.getLang('flower_letter_real_signature');
        case 'caring':
          return Strings.getLang('flower_letter_caring_signature');
        case 'aware':
          return Strings.getLang('flower_letter_aware_signature');
        case 'action':
          return Strings.getLang('flower_letter_action_signature');
        default:
          return '';
      }
    }

    const baseReminderBgUrl = getCdnUrl('flower_reminder_bg.png', cdnImage);
    const overlayFlowerUrl = getCdnUrl(letterBgName(), cdnImage);
    const overlayLightUrl = getCdnUrl('flower_letter_bg_light.png', cdnImage);

    return (
        <>
          <View className={styles.overlayFlower} style={{ backgroundImage: `url(${overlayFlowerUrl})` }} />
          <View className={styles.overlayLight} style={{ backgroundImage: `url(${overlayLightUrl})` }} />
          <View className={styles.container} style={{ backgroundImage: `url(${baseReminderBgUrl})` }}>
            <Image src={FlowerLetterBall} className={styles.ball} />

            <Image src={CloseImg} className={styles.close} onClick={closeButton} />

            <View className={styles.messageBox}>
              <View className={styles.messageContent}>
                <Text className={styles.dear}>{Strings.getLang('flower_letter_dear')}\u00A0{props.UserName}</Text>
                <Text className={styles.information}>
                  {props.flowertype || props.flowerType 
                    ? getLetterTextByType()
                    : props.text}
                </Text>
                {props.flowertype || props.flowerType ? (
                  <Text className={styles.signature}>
                    {getLetterSignature()}
                  </Text>
                ) : null}
              </View>
            </View>

            <Button className={styles.reply_btn} onClick={close}>{Strings.getLang('flower_letter_button')}</Button>
          </View>

          <View className={styles.mask}/>
        </>
      );
}

