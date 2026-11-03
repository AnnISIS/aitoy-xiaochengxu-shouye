import React, { FC} from 'react';
import { Text, View,Button,Image } from '@ray-js/ray';
import styles from './index.module.less';
import ball from '../../assets/images/tab/ball.png';
import Strings from '@/i18n';
declare module '*.png';
type Props = {
  visible: boolean;
  day:number;
  meet_times:number;
  first_meet:string;
  lately_meet:string;
  Name:string;
  userName:string;
  onClose?: () => void;
  onSend?: () => void;
};
const Popup: FC<Props> = ({ 
  Name,
  userName,
  lately_meet,
  first_meet,
  visible = false,     
  day=1,
  meet_times=1,
  onClose,
  onSend,
}) => {

  const close =()=>{
    onClose();
  }

  const send=()=>{
    onClose();
    onSend();
  }
    return (
        <>
          { visible &&
            <View className={styles.container}>
              <Image src={ball} className={styles.ball} />

              <Text className={styles.name}>{userName}{Strings.getLang('common_of')}{Name}</Text>

              <View className={styles.meet_time}>
                <Text className={styles.meet_time_font}>{Strings.getLang('popup_meet_times').replace('{{times}}', String(meet_times))}</Text>
              </View>

              <Text className={styles.first_meet}>{Strings.getLang('popup_first_meet_time')}\u00A0\u00A0{first_meet}</Text>
              <Text className={styles.lately_meet}>{Strings.getLang('popup_lately_meet_time')}\u00A0\u00A0{lately_meet}</Text>

              <Button className={styles.close} onClick={close}>x</Button>
              <Button className={styles.send} onClick={send}>{Strings.getLang('popup_send_message')}</Button>
            </View>  
            }


          <View className={styles.mask}/>
        </>
      );
}

export default Popup;
