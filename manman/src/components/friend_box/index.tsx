import React, { FC,useEffect,useState} from 'react';
import { Text, View,Button,Image, navigateTo,getStorage } from '@ray-js/ray';
import styles from './index.module.less';
import Strings from '@/i18n';

export default function FriendBox(props){

  const [UserName,setUserName]=useState('');
  const [meet_times,setmeet_times]=useState(0);
  const [first_meet,setfirst_meet]=useState('');
  const [recent_meet,setrecent_meet]=useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      getStorage({
        key:props.esn,
        success(res){
          // const name=String(res.data.Name);
          const username=String(res.data.userName);
          const firstmeetday=String(res.data.FirstMeetDay);
          const lastmeetday=String(res.data.LastMeetDay);
          const meettimes=Number(res.data.MeetTimes);
          // setname(name);
          setUserName(username);
          setmeet_times(meettimes);
          setfirst_meet(firstmeetday);
          setrecent_meet(lastmeetday);
        }
      })
    }, 200);

    return () => clearInterval(timer); // 组件卸载时清理
  }, []);

    return (
        <>
          <View className={styles.container} style={{top:`${props.top}%`}}>
            <Image src={props.friendball_img} className={styles.friendball_img}></Image>

            <View className={styles.name_meet_row}>
              <Text className={styles.friendball_name}>{UserName}{Strings.getLang('common_of')}{Strings.getLang('ball_name')}</Text>
              <View className={styles.meet_times_box}>
                <Text className={styles.meet_times}>{Strings.getLang('friend_box_meet_times').replace('{{times}}', String(meet_times))}</Text>
              </View>
            </View>

            <Text className={styles.first_meet_font}>{Strings.getLang('friend_box_first_meet')}\u00A0\u00A0{first_meet}</Text>
            <Text className={styles.recent_meet_font}>{Strings.getLang('friend_box_recent_meet')}\u00A0\u00A0{recent_meet}</Text>
          </View>
        </>
      );
}

