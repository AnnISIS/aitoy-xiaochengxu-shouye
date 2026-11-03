import React, { FC,useState} from 'react';
import { Text, View,Button,Image, usePageEvent,getStorage,withPageLifecycle,showToast, setStorage, getCdnUrl  } from '@ray-js/ray';
import styles from './index.module.less';
import ball from '../../assets/images/tab/ball.png';
import send_popup_ball1 from '../../assets/images/tab/send_popup_ball1.png';
import send_popup_ball2 from '../../assets/images/tab/send_popup_ball2.png';
import send_popup_ball3 from '../../assets/images/tab/send_popup_ball3.png';
import send_popup_ball4 from '../../assets/images/tab/send_popup_ball4.png';
import warning from '../../assets/images/tab/warning.png';
import CloseImg from '../../assets/images/tab/close.png';
import sendPopupTop from '../../assets/images/tab/send_popup_top.png';
import isActiveImg from '../../assets/images/tab/is_active.png';
import {sp_contact_msg_code} from '@/constant/dpCodes';
import { useActions, useProps,utils } from '@ray-js/panel-sdk';
import cdnImage from '../../../cdn/cdnImage.json';
import { log } from '@ray-js/panel-sdk/lib/sdm/utils';
import Strings from '@/i18n';

type Props = {
  Name:string;
  userName:string;
  onClose?:()=>void;
  onConfirm?:(value:string)=>void;
  MySend:boolean;
  OtherSend:boolean;
  esn:string;
  distance:number;
  myballname:string;
  myusername:string;
  ballColor?:string;
  onOpenMeetPopup?:()=>void;
};
const SendPopup: FC<Props> = ({ 
    distance,
    esn,
    MySend,
    OtherSend,
    Name,
    userName,
    myballname,
    myusername,
    ballColor,
    onClose,
    onConfirm,
    onOpenMeetPopup,
}) => {
    const [is_active1,setis_active1]=useState(false);
    const [is_active2,setis_active2]=useState(false);
    const [is_active3,setis_active3]=useState(false);
    const [msg,setmsg]=useState('');

    const [SendActive,setSendActive]=useState(false);
    
    // 获取CDN背景图片URL
    const sendPopupBgUrl = getCdnUrl('send_popup_bg.png', cdnImage);
    
    // 根据ballColor选择对应的send_popup_ball图片
    const getBallImage = () => {
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
    const send1=()=>{
      setis_active1(true);
      setis_active2(false);
      setis_active3(false);
      setSendActive(true);
      setmsg(Strings.getLang('send_popup_message_hi'));
    }

    const send2=()=>{
      setis_active1(false);
      setis_active2(true);
      setis_active3(false);
      setSendActive(true);
      setmsg(Strings.getLang('send_popup_message_raise'));
    }

    const send3=()=>{
      setis_active1(false);
      setis_active2(false);
      setis_active3(true);
      setSendActive(true);
      setmsg(Strings.getLang('send_popup_message_play'));
    }

    const close=()=>{
      onClose();
    }

    const actions = useActions();
    const { stringifyJSON } = utils;
    const send=()=>{
      // //crane test
      // // 测试代码：点击发送时弹出相遇弹窗
      // if(onOpenMeetPopup) {
      //   // 先关闭send_popup
      //   onClose();
      //   onOpenMeetPopup();
      // }
      
      getStorage({
        key:'Myesn',
        success(res){
          if(MySend)
            {
              if(true || OtherSend)        //对方回复了
              {
                const Send=stringifyJSON({rsn:esn,msg,ssn:res.data,sun:myusername,sdn:myballname});
                // const Send=stringifyJSON({rsn:esn,msg,sdn:res.data,sun:myusername});
                console.log('结果')
                console.log('Send',Send);
                actions[sp_contact_msg_code].set(Send);
                getStorage({
                  key:esn,
                  success(res){
                    setStorage({
                      key:esn,
                      data:{
                        ...res.data,
                        MeetMySend:true
                      }
                    })
                  }
                })
                console.log('对方回复了，继续发送');
              }
              else{               //对方未回复
                //发送失败
                showToast({ 
                  title:Strings.getLang('send_popup_send_failed'),
                  mask:true,
                 })
                console.log('对方未回复，发送失败');
              }
            }
            else{                 //第一次发送
              const Send=stringifyJSON({rsn:esn,msg,ssn:res.data,sun:myusername,sdn:myballname});
              // const Send=stringifyJSON({rsn:esn,msg,sdn:res.data,sun:myusername});
              actions[sp_contact_msg_code].set(Send);
              console.log('第一次发送');
              getStorage({
                key:esn,
                success(res){
                  setStorage({
                    key:esn,
                    data:{
                      ...res.data,
                      MySend:true,
                      MeetMySend:true
                    }
                  })
                }
              })
            }
            onClose();
        }
      })
      
    }

    const nosend=()=>{        //没选择信息不给发送

    }

    return (
        <>
          <View className={styles.container} style={{backgroundImage: `url(${sendPopupBgUrl})`}}>

            <Image src={sendPopupTop} className={styles.topImage}></Image>

            <Image src={CloseImg} className={styles.close} onClick={close}></Image>

            <Image src={getBallImage()} className={styles.ball} />

            <Text className={styles.name}>{userName}{Strings.getLang('common_of')}{Name}</Text>

            <Text className={styles.distant_font}>{Strings.getLang('information_popup_nearby_message')}</Text>


            <View className={styles.send1} onClick={send1}>
              {is_active1 && <Image src={isActiveImg} className={styles.activeIcon} />}
              <Text>{Strings.getLang('send_popup_message_hi')}</Text>
            </View>
            <View className={styles.send2} onClick={send2}>
              {is_active2 && <Image src={isActiveImg} className={styles.activeIcon} />}
              <Text>{Strings.getLang('send_popup_message_raise')}</Text>
            </View>
            <View className={styles.send3} onClick={send3}>
              {is_active3 && <Image src={isActiveImg} className={styles.activeIcon} />}
              <Text>{Strings.getLang('send_popup_message_play')}</Text>
            </View>

            <Text className={styles.warning_font}>{Strings.getLang('send_popup_warning')}</Text>

            <Button className={SendActive?styles.send_btn_active:styles.send_btn} onClick={SendActive?send:nosend}>{Strings.getLang('send_popup_send_button')}</Button>
        </View>


          <View className={styles.mask}/>
        </>
      );
}

export default SendPopup;


