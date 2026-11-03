import React, { FC,useState,useEffect} from 'react';
import { Text, View,Button,Image,getStorage,setStorage, showToast, usePageEvent,getLaunchOptionsSync,getAI2AgentVariableAgentVariableList,getSystemInfoSync } from '@ray-js/ray';
import styles from './index.module.less';
import SendImg from '../../assets/images/tab/sendImg.png'
import Popup from '../popup';
import SendPopup from '../send_popup';
import InformationPopup from '../information_popup';
import MeetPopup from '../../components/meet_popup';
import { useActions, useProps,utils } from '@ray-js/panel-sdk';
import{dev_name_code,sp_switch_code,dev_info_code,sp_contact_info_code,sp_contact_msg_code} from '@/constant/dpCodes';
import Strings from '@/i18n';


export default function FriendBall(props){
  const [popup_exist,setpopup_exist]=useState(false);
  const [Sendpopup_exist,setSendpopup_exist]=useState(false);
  const [InformationPopupExist,setInformationPopupExist]=useState(false);

//打开其他球球信息弹窗
  const [information,setinformation]=useState('');
  const open_popup=()=>{
    getStorage({
      key:props.esn,
      success(res){
        const result=Boolean(res.data.isSendInformation);
        if(result)
        {
          getStorage({
            key:props.esn,
            success(res){
              const result=String(res.data.InformationContent)
              setinformation(result);
              setInformationPopupExist(true);
            }
          })
          getStorage({
            key:props.esn,
            success(res){
              setStorage({
                key:props.esn,
                data:{
                  ...res.data,
                  isSendInformation:false
                },
                success(res){
      
                }
              })
            }
          })
        }
        else{
          // 跳过 popup_exist 窗口，直接打开 Sendpopup_exist
          open_Sendpopup();
        }
      }
    })

  }

//关闭球球信息弹窗
  const close_popup=()=>{
    setpopup_exist(false);
  }

//关闭球球回复信息弹窗
  const  close_informationpopup=()=>{
    setInformationPopupExist(false);
  }

//打开发送消息弹窗
const [mysend,setmysend]=useState(false);
const [othersend,setothersend]=useState(false);
  const open_Sendpopup=()=>{
    getStorage({
      key:props.esn,
      success(res){
        setmysend(res.data.MySend);
        setothersend(res.data.OtherSend);
      }
    })
    setSendpopup_exist(true);
    setInformationPopupExist(false);
  }

  const close_SendPopup=()=>{
    setSendpopup_exist(false);
  }

//球球有无消息实时显示
  const [MeetTimes,setMeetTimes]=useState(0);
  const [FirstMeet,setFirstMeet]=useState('');
  const [LastMeet,setLastMeet]=useState('');
  const [isOtherSend,setisOtherSend]=useState(false);
    useEffect(() => {
      const {query: { deviceId }} = getLaunchOptionsSync();
      getStorage({
        key:props.esn,
        success(res){
          const result = Boolean(res.data.isSendInformation);
          setisOtherSend(result);
        }
      })
      const timer = setInterval(() => {
      getStorage({
        key:props.esn,
        success(res){
          const result = Boolean(res.data.isSendInformation);
          setisOtherSend(result);             //其他球球是否发信息显示信息符号
          const meetmysend=Boolean(res.data.MeetMySend);
          const meetothersend=Boolean(res.data.MeetOtherSend);
          const ismeet=Boolean(res.data.isMeet);
          const meettimes=Number(res.data.MeetTimes);
          const firstmeet=Boolean(res.data.FirstMeet);
          const fristmeetday=String(res.data.FirstMeetDay);
          const lastmeetday=String(res.data.LastMeetDay);
          setMeetTimes(meettimes);
          setFirstMeet(fristmeetday);
          setLastMeet(lastmeetday);
          if(meetmysend && meetothersend )     //互发消息检测
          {
            getStorage({
              key:props.esn,
              success(res){
                setStorage({
                  key:props.esn,
                  data:{
                    ...res.data,
                    MeetMySend:false,
                    MeetOtherSend:false,
                    isMeet:true
                  },
                  success(){
                    if(!ismeet)       //检测到相遇的时候显示相遇弹窗,相遇次数加一
                    {
                      
                      const now = new Date();
                      const formattedDate = formatDate(now);

                      //设置相遇记录的球球
                      getStorage({
                        key:deviceId+'0',
                        success(res){
                          //将取得数据对象转换为对象数组
                          let customList;
                          if(res.data===null)
                          {
                            customList=[{esn:'',weight:''}];
                          }
                          else{
                            customList = Object.entries(res.data).map(([key, value]) => ({
                              esn: key,
                              weight: value ,
                            }));
                          }
                          

                          //检查是否有满足在列表中的esn
                          const esn = customList.find(user => user.esn === props.esn);
                          if ((esn && Number(esn.weight) < 0)||esn===undefined){
                            //满足权重是4,3,2,1,0的权重减一
                          const updatedList = customList.map(item => {
                            if ([4, 3, 2, 1, 0].includes(Number(item.weight))) {
                              return { ...item, weight: Number(item.weight) - 1 };
                            }
                            return item; // 其他情况保留原值
                          });
                          console.log('updatedList',updatedList)
                          //再将对象数组转换为对象
                          const usersMap = updatedList.reduce((acc, user) => {
                            acc[user.esn] = user.weight; // 直接提取 name
                            return acc;
                          }, {});
                          console.log('usersMap',usersMap)
                          //将对象写入本地存储
                          setStorage({
                            key:deviceId+'0',
                            data:usersMap,
                            success(){
                              //将最近相遇球球权重设置为4
                              getStorage({
                                key:deviceId+'0',
                                success(res){
                                  setStorage({
                                    key:deviceId+'0',
                                    data:{
                                      ...res.data,
                                      [props.esn]:4
                                    }
                                  })
                                }
                              })
                            },
                            fail(res){
                              console.log('失败',res)
                            }
                          })
                          }
                          
                        }
                      })
                      
                      getStorage({
                        key:props.esn,
                        success(res){
                          const meettimes=Number(res.data.MeetTimes);
                          setStorage({
                            key:props.esn,
                            data:{
                              ...res.data,
                              MeetTimes:meettimes+1,
                              LastMeetDay:formattedDate,
                            },
                            success(){
                              if(!firstmeet)
                                {
                                  console.log('触发第一次');
                                  getStorage({
                                    key:props.esn,
                                    success(res1){
                                      setStorage({
                                        key:props.esn,
                                        data:{
                                          ...res1.data,
                                          FirstMeetDay:formattedDate,
                                          FirstMeet:true
                                        },
                                        success(){
                                          console.log('成功设置第一次相遇')
                                        }
                                      })
                                    }
                                  })
                                }
                            }
                          })
                        }
                      })
                      setMeetPopupExist(true);
                      
                    }
                  }
                })
              }
            })
            
          }
        }
      })
      }, 1000);
  return () => clearTimeout(timer);
  }, []);

  //相遇弹窗
  const[MeetPopupExist,setMeetPopupExist]=useState(false);
  const close_MeetPopup=()=>{
    setMeetPopupExist(false);
  }
  
  // // 测试代码：打开相遇弹窗
  // // crane test
  // const open_MeetPopup=()=>{
  //   setMeetPopupExist(true);
  // }

  //我的名称初始渲染
  const [MyBallName,setMyBallName]=useState('球球');
  const [MyUserName,setMyUserName]=useState('');
  useEffect(()=>{
    const {query: { deviceId }} = getLaunchOptionsSync();
    const FetchVariable=async()=>{
      try{
        const newVariables = await getAI2AgentVariableAgentVariableList({  
        devId: deviceId,  
        });
      const call = newVariables.find(user => user.variableKey === 'custom.call')?.variableValue;
      setMyUserName(call);
    } catch(error){}
      
      
      // const BallName = newVariables.find(user => user.variableKey === 'custom.ballName')?.variableValue;
      // setMyBallName(BallName);
    }
    FetchVariable();
  },[])

  // 检测当前语言代码
  // 支持：简体中文(zh/zh-CN)、英语(en)、繁体中文(zh-TW)、德语(de)、意大利语(it)、西班牙语(es)、法语(fr)、波兰语(pl)
  // crane todo:支持更多的语言,未测试
  const getCurrentLanguage = (): string => {
    try {
      // 优先使用系统语言信息
      const systemInfo = getSystemInfoSync();
      const systemLang = systemInfo?.language || '';
      
      if (systemLang) {
        // 标准化语言代码
        const langLower = systemLang.toLowerCase();
        
        // 处理中文变体
        if (langLower.startsWith('zh')) {
          // 检查是否是繁体中文
          if (langLower.includes('tw') || langLower.includes('hk') || langLower.includes('hant')) {
            return 'zh-TW';
          }
          // 简体中文
          return 'zh';
        }
        
        // 其他语言
        if (langLower.startsWith('en')) return 'en';
        if (langLower.startsWith('de')) return 'de';
        if (langLower.startsWith('it')) return 'it';
        if (langLower.startsWith('es')) return 'es';
        if (langLower.startsWith('fr')) return 'fr';
        if (langLower.startsWith('pl')) return 'pl';
      }
    } catch (error) {
      console.warn('Failed to get system language:', error);
    }
    
    // 降级方案：通过国际化字符串判断
    const ballName = Strings.getLang('ball_name');
    if (ballName === 'Bobo') return 'en'; // 英语
    if (ballName === '球球') return 'zh'; // 简体中文
    
    const commonOf = Strings.getLang('common_of');
    if (commonOf === "'s") return 'en';
    if (commonOf === '的') return 'zh';
    
    // 默认返回中文
    return 'zh';
  }

  // 日期格式化函数，根据语言返回不同格式
  // 支持：简体中文、英语、繁体中文、德语、意大利语、西班牙语、法语、波兰语
  const formatDate = (date: Date) => {
    const lang = getCurrentLanguage();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    switch (lang) {
      case 'en': // 英语: January 1, 2024
        const enMonths = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
        return `${enMonths[date.getMonth()]} ${day}, ${year}`;
      
      case 'zh': // 简体中文: 2024年1月1日
        return `${year}年${month}月${day}日`;
      
      case 'zh-TW': // 繁体中文: 2024年1月1日
        return `${year}年${month}月${day}日`;
      
      case 'de': // 德语: 1. Januar 2024
        const deMonths = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                         'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        return `${day}. ${deMonths[date.getMonth()]} ${year}`;
      
      case 'it': // 意大利语: 1 gennaio 2024
        const itMonths = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
                         'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
        return `${day} ${itMonths[date.getMonth()]} ${year}`;
      
      case 'es': // 西班牙语: 1 de enero de 2024
        const esMonths = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                         'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        return `${day} de ${esMonths[date.getMonth()]} de ${year}`;
      
      case 'fr': // 法语: 1 janvier 2024
        const frMonths = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                         'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        return `${day} ${frMonths[date.getMonth()]} ${year}`;
      
      case 'pl': // 波兰语: 1 stycznia 2024
        const plMonths = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
                         'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
        return `${day} ${plMonths[date.getMonth()]} ${year}`;
      
      default: // 默认使用中文格式
        return `${year}年${month}月${day}日`;
    }
  }
  // 根据球球位置计算倾斜角度：左边向左倾斜-3度，右边向右倾斜3度
  const tiltAngle = props.left < 50 ? -3 : 3;

  return(
    <>
    <View className={styles.bg} style={{top:`${props.top}vw`,left:`${props.left}vw`,opacity:(props.isDim)?0.3:1}}>
      { isOtherSend &&
        <Image className={styles.send_img} src={SendImg}></Image>}

      <Button className={styles.FriendBall_btn} onClick={open_popup} style={{transform: `rotate(${tiltAngle}deg)`}}>
        <Image src={props.friendball_img} className={styles.FriendBall_img}></Image>
      </Button>
      
      <View className={styles.name_box}>
        <Text className={styles.FriendBall_name}>{props.FriendUserName}{Strings.getLang('common_of')}{props.FriendBallName}</Text>
      </View> 
    </View>

    { popup_exist &&
      <Popup 
        visible={true} 
        day={1} 
        meet_times={MeetTimes} 
        first_meet={FirstMeet} 
        lately_meet={LastMeet}
        onClose={close_popup} 
        onSend={open_Sendpopup}
        Name={props.FriendBallName}
        userName={props.FriendUserName}
        >
        </Popup>}

    { Sendpopup_exist &&
      <SendPopup onClose={close_SendPopup} 
      Name={props.FriendBallName} 
      myballname={MyBallName} 
      myusername={MyUserName} 
      userName={props.FriendUserName} MySend={mysend} OtherSend={othersend} esn={props.esn} distance={props.distance} ballColor={props.friendball_img} 
      // crane test
      // onOpenMeetPopup={open_MeetPopup}
      />
    }

    { InformationPopupExist &&
      <InformationPopup onClose={close_informationpopup} 
      Name={props.FriendBallName} 
      userName={props.FriendUserName} onOpenSendPopup={open_Sendpopup} information={information} distance={props.distance} ballColor={props.friendball_img}></InformationPopup>
    }

    { MeetPopupExist &&
      <MeetPopup onClose={close_MeetPopup} 
      FriendBallName={props.FriendBallName} 
      userName={props.FriendUserName}
      myBallColor={props.myBallColor}
      friendBallColor={props.friendball_img}
      ></MeetPopup>}
    </>
  )

}





