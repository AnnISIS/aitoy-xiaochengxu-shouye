import React ,{useState,useEffect} from 'react';
import { Text, View,Button,Image,usePageEvent, getStorage, setStorage,hideMenuButton,getLaunchOptionsSync, navigateBack, getCdnUrl } from '@ray-js/ray';
import styles from './index.module.less'
import FriendBox from '../../components/friend_box';
import space_ball1 from '../../assets/images/tab/space_ball1.png'
import space_ball2 from '../../assets/images/tab/space_ball2.png'
import space_ball3 from '../../assets/images/tab/space_ball3.png'
import space_ball4 from '../../assets/images/tab/space_ball4.png'
import NoFriendBall from '../../assets/images/tab/NoFriendBall.png'
import returnIcon from '../../assets/images/tab/return.png'
import cdnImage from '../../../cdn/cdnImage.json'
import { getBallColorIndexByEsn } from '../../utils'
import Strings from '@/i18n'

const HomeBgImage = getCdnUrl('home_bg.png', cdnImage)
const firstPosition = 12;
const gap = 13;
const position = [
  firstPosition,
  firstPosition + gap,
  firstPosition + gap * 2,
  firstPosition + gap * 3,
  firstPosition + gap * 4,
];

export default function friend() {

  const [MeetBallList,setMeetBallList]=useState([]);
  const [Background,setBackground]=useState(false);

  // 球球颜色数组（4种颜色）
  const spaceBalls = [space_ball1, space_ball2, space_ball3, space_ball4];

  // 根据 esn 获取球球颜色的函数
  const getBallColorByEsn = (esn: string) => {
    const colorIndex = getBallColorIndexByEsn(esn, spaceBalls.length);
    return spaceBalls[colorIndex];
  };

  // 返回按钮处理函数
  const handleBack = () => {
    navigateBack();
  }
  usePageEvent('onReady',()=>{
    const {query: { deviceId }} = getLaunchOptionsSync();
    hideMenuButton({});
    getStorage({
      key:deviceId+'0',
      success(res){
        if(res.data!==null){
        const customList = Object.entries(res.data).map(([key, value]) => ({
          esn: key,
          weight: value ,
        }));
        const filteredList = customList.filter(item =>          //将权重为0，1,2,3,4的球球筛选出来
          [0, 1, 2, 3, 4].includes(Number(item.weight))
        );
        
        setMeetBallList(filteredList);
        }
        else{   
          setBackground(true);
        }
      }
    })
  })

  return (
    <>
    {/* 背景图片 */}
    <Image src={HomeBgImage} className={styles.home_bg_image} />
    
    {/* 顶部导航栏 */}
    <View className={styles.navbar}>
      <Button className={styles.nav_back_button} onClick={handleBack}>
        <Image src={returnIcon} className={styles.nav_back_icon} />
      </Button>
      <Text className={styles.nav_title}>{Strings.getLang('friend_nav_title')}</Text>
      <View className={styles.nav_placeholder}></View>
    </View>

    {Background &&
      <View className={styles.NoFriednBg}>
        <Image className={styles.NoFriendBall} src={NoFriendBall}></Image>
        <Text className={styles.NoFriendText1}>{Strings.getLang('friend_empty_title')}</Text>
        <Text className={styles.NoFriendText2}>{Strings.getLang('friend_empty_subtitle')}</Text>
      </View>
    }
      
    {MeetBallList[0]?.esn !== undefined && 
      [...MeetBallList].reverse().map((item, index) => (
        <FriendBox 
          key={item.esn}
          friendball_img={getBallColorByEsn(item.esn)} 
          top={position[index]} 
          esn={item.esn} 
        />
      ))
    }


    

    </>
  );
}


