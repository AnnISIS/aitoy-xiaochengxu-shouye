import { getCdnUrl } from 'ray'
import cdnImage from '../../../cdn/cdnImage.json'
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Text, View, Button, Image, Input, navigateTo, usePageEvent, hideMenuButton, getStorage, setStorage, useAppEvent, getLaunchOptionsSync, queryDps, onDpDataChange, registerDeviceListListener, getDpsInfos, changeDebugMode, navigateBack, exitMiniProgram, getDeviceInfo } from '@ray-js/ray';
import styles from './index.module.less';
import manman from '../../assets/images/tab/manman_with_animation.gif'
declare module '*.gif';
import ballBg1 from '../../assets/images/tab/ball_bg1.png'
import ballBg2 from '../../assets/images/tab/ball_bg2.png'
import grow from '../../assets/images/tab/grow.png'
import space from '../../assets/images/tab/space.png'
import card from '../../assets/images/tab/card.png'
import messageIcon from '../../assets/images/tab/message.png'
import batteryHigh from '../../assets/images/tab/battery_high.png'
import batteryMedium from '../../assets/images/tab/battery_medium.png'
import batteryLow from '../../assets/images/tab/battery_low.png'
import chargingFull from '../../assets/images/tab/charging_full.png'
import chargingLow from '../../assets/images/tab/charging_low.png'
import chargingMedium from '../../assets/images/tab/charging_medium.png'
import returnIcon from '../../assets/images/tab/return.png'
import renameIcon from '../../assets/images/tab/rename.png'
import wifiConnected from '../../assets/images/tab/wifi_connected.png'
import wifiDisconnected from '../../assets/images/tab/wifi_disconnected.png'
import voiceUnmute from '../../assets/images/tab/voice_unmute.png'
import voiceMute from '../../assets/images/tab/voice_mute.png'
import { useActions, useProps } from '@ray-js/panel-sdk';
import { volumeSetCode, batteryPercentageCode, chargeStatusCode, dev_name_code, user_name_code, volume_mute_code, request_dp_code } from '@/constant/dpCodes';
import { devices } from '@/devices';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import { Slider } from '@ray-js/smart-ui';
import Rename_popup from '../../components/rename_popup';
import { device } from '@ray-js/ray'
const { openDeviceDetailPage } = device
import DailyPopup from '../../components/DailyPopup';
import Popup from '../../components/popup';
import { utils } from '@ray-js/panel-sdk';
const { parseHour12 } = utils;
const { stringToSecond } = utils;
import { requestWifiSignal, getAI2AgentVariableAgentVariableList, updateAI2AgentVariableAgentVariable, getAI2AgentRoles, bindAI2AgentRoles, getAccountInfo } from '@ray-js/ray'
import { emojitestNew } from './emojiDataI18n.jsx'
import FlowerLetter from '../../components/FlowerLetter';
import { set, stubFalse } from 'lodash-es';
import { dayColorMap, getColorName } from '@/constant/dayColorMap';
import Strings from '@/i18n';
const HomeBgImage = getCdnUrl('home_bg.png', cdnImage)
const HomeBottomImage = getCdnUrl('home_bottom.png', cdnImage)

type charge_status = 'charging' | 'none' | 'charge_done';

// 电池显示组件
const BatteryDisplay = ({ batteryValue, isCharging }) => {
  // 根据充电状态和电量选择对应的电池图片
  const getBatteryImage = () => {
    if (isCharging) {
      // 充电状态
      if (batteryValue >= 70) {
        return chargingFull; // 充电高电量
      } else if (batteryValue >= 30) {
        return chargingMedium; // 充电中电量
      } else {
        return chargingLow; // 充电低电量
      }
    } else {
      // 非充电状态
      if (batteryValue >= 70) {
        return batteryHigh; // 高电量 (70%-100%)
      } else if (batteryValue >= 30) {
        return batteryMedium; // 中电量 (30%-69%)
      } else {
        return batteryLow; // 低电量 (0%-29%)
      }
    }
  };

  return (
    <View className={styles.battery_container}>
      {/* 电池图片 - 根据充电状态和电量显示不同图片 */}
      <Image 
        src={getBatteryImage()} 
        className={styles.battery_image}
      />
    </View>
  );
};

//根据时间戳计算天数差
function getDayDifference(timestamp1, timestamp2) {
  // 1 天 = 24 小时 × 60 分钟 × 60 秒 = 86400 秒
  const secondsPerDay = 86400;

  // 计算时间差（绝对值）
  const diffSeconds = Math.abs(timestamp1 - timestamp2);

  // 计算完整天数
  return Math.floor(diffSeconds / secondsPerDay);
}

//获取开始时时间戳
function getTodayStartTimestamp() {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // 设置为当天的00:00:00.000
  return Math.floor(now.getTime() / 1000); // 转换为秒级时间戳
}

export default function New_toy_home() {
  const [BatteryValue, setBatteryValue] = useState(20);
  let dpVolumeSet = useProps(props => props[volumeSetCode]);
  useEffect(() => {
    //刚进入首页时发出DP请求获取DP值
    const { query: { deviceId } } = getLaunchOptionsSync();
    let roleid;

    const BindAI = async () => {         //绑定智能体角色
      try {
        const result = await bindAI2AgentRoles({
          devId: deviceId,
          roleId: roleid
        });
        console.log('绑定结果', result)
      } catch (error) {
        console.log(error)
      }
    }

    const fetchAI = async () => {
      try {
        const result = await getAI2AgentRoles({
          devId: deviceId,
          pageNo: 1,
          pageSize: 10
        });
        roleid = result.list[0].roleId;
        console.log('智能体角色列表', result)
        BindAI()
      } catch (error) {
        console.log(error)
      }

    }
    fetchAI()

    getDpsInfos({
      devId: deviceId,
      gwId: deviceId,
    })

      .then(res => {
        const initialbattery = Number(res.find(user => user.code === 'battery_percentage')?.value);
        const chargestatus = res.find(user => user.code === 'charge_status')?.value;
        dpVolumeSet = Number(res.find(user => user.code === 'volume_set')?.value);
        const initialismute = res.find(user => user.code === 'volume_mute')?.value;
        const boolinitialismute = initialismute === 'true';
        if (chargestatus === 'charging' || chargestatus === 'none' || chargestatus === 'charge_done') {
          setCharge(chargestatus);
        }

        setBatteryValue(initialbattery);
        
        // TODO:test code - 设置电量为10%
        // setBatteryValue(100);
      })
      .catch(error => {
        console.log(error);
      });

    //刚进入首页时根据球球虚拟ID不同去分配值，并更新StartTimeStamp为设备激活时间
    getStorage({
      key: deviceId,
      success(res) {
        // 应用启动时，总是从云端获取设备激活时间并更新storage
        getDeviceInfo({
          deviceId,
          success: (info) => {
            console.log('getDeviceInfo success', info);
            const Start = info.activeTime || getTodayStartTimestamp(); // 使用激活时间，如果获取失败则使用当天开始时间作为兜底
            
            // 根据激活时间计算陪伴天数
            const End = getTodayStartTimestamp();
            const AccompanyDay = getDayDifference(End, Start);
            setday(AccompanyDay + 1);
            
            if (res.data === null) {
              // 如果storage中没有数据，创建新数据
              const InitialBattery = 20;
              const initialWishExist = true;
              setwishExist(initialWishExist);
              setStorage({
                key: deviceId,
                data: {
                  StartTimeStamp: Start,
                  battery: InitialBattery,
                  wishExist: initialWishExist
                }
              })
            } else {
              // 如果storage中已有数据，只更新StartTimeStamp，保留其他字段
              const existingData = typeof res.data === 'object' && res.data !== null ? res.data : {};
              setStorage({
                key: deviceId,
                data: {
                  ...existingData,
                  StartTimeStamp: Start
                }
              })
            }
          },
          fail: (error) => {
            console.log('getDeviceInfo fail', error);
            
            if (res.data === null) {
              // 如果storage中没有数据且获取失败，使用当天开始时间作为兜底
              const Start = getTodayStartTimestamp();
              const InitialBattery = 20;
              const initialWishExist = true;
              // 计算陪伴天数（使用当天开始时间，所以是第1天）
              setday(1);
              setwishExist(initialWishExist);
              setStorage({
                key: deviceId,
                data: {
                  StartTimeStamp: Start,
                  battery: InitialBattery,
                  wishExist: initialWishExist
                }
              })
            } else {
              // 如果storage中已有数据但获取失败，保持原有数据不变，只计算天数
              const existingData = typeof res.data === 'object' && res.data !== null ? res.data : {};
              const End = getTodayStartTimestamp();
              const existingStart = Number((existingData as any).StartTimeStamp) || getTodayStartTimestamp();
              const AccompanyDay = getDayDifference(End, existingStart);
              setday(AccompanyDay + 1);
              // 不更新storage，保持原有数据
            }
          }
        });
      }
    })
  }, [])
  const [day, setday] = useState(0);

  //跳转到成长花园
  const navigateTogrow = () => {
    navigateTo({
      url: '/pages/grow/index',
    })
  }

  //跳转到空间智能
  const navigateTospace = () => {
    navigateTo({
      url: '/pages/space/index',
    })
  }

  //电池电量获取
  const dpBattery = useProps(props => props[batteryPercentageCode]);
  const [isFirstLoad3, setisFirstLoad3] = useState(true);
  useEffect(() => {
    if (isFirstLoad3) {
      setisFirstLoad3(false);
      return;
    }
    setBatteryValue(dpBattery);
  }, [dpBattery]);

  //充电状态获取
  const [Charge, setCharge] = useState<charge_status>('none');
  const changeCharge = (newType: string) => {
    const validTypes: charge_status[] = ['charging', 'none', 'charge_done'];
    if (validTypes.includes(newType as charge_status)) {
      setCharge(newType as charge_status);
    } else {
      console.error(Strings.getLang('home_invalid_type'), newType);
    }
  };
  const dpCharge = useProps(props => props[chargeStatusCode]);
  useEffect(() => {
    changeCharge(dpCharge);
  }, [dpCharge]);

  //音量键操作
  const [voice_exist, setvoice_exist] = useState(false);
  const voice_change = () => {
    // 音量静音逻辑
    if (isMute === true) {
      setisMute(false);
      actions[volume_mute_code]?.set(false);
      actions[volumeSetCode]?.set(dpVolumeSet);
    }

    if (voice_exist) {
      setvoice_exist(false);
    }
    else {
      setvoice_exist(true);
    }
  }

  //音量设置
  const actions = useActions();
  const {
    property: { min = 0, max = 100 },
  } = devices.common.getDpSchema()[volumeSetCode] || { property: { min: 0, max: 100 } };
  const handleAfterChange = useMemo(
    () =>
      throttle((value: number) => {
        actions[volumeSetCode]?.set(value), { debounce: 200 };
        if (value === 0) {
          setisMute(true);
          actions[volume_mute_code]?.set(true);
        } else {
          setisMute(false);
          actions[volume_mute_code]?.set(false);
        }
      }, 200),
    [actions]
  );
  // 作为快速滑动的兜底：在拖动过程中节流提交，手指松开时再强制提交一次
  const handleChangeDebounced = useMemo(
    () =>
      debounce((value: number) => {
        actions[volumeSetCode]?.set(value);
        if (value === 0) {
          setisMute(true);
          actions[volume_mute_code]?.set(true);
        } else {
          setisMute(false);
          actions[volume_mute_code]?.set(false);
        }
      }, 200),
    [actions]
  );
  useEffect(() => {
    if (dpVolumeSet === 0) {
      setisMute(true);
      actions[volume_mute_code]?.set(true);
    }

  }, [dpVolumeSet])

  //球球和主人的名字
  const [BallName, setBallName] = useState(Strings.getLang('ball_name'));
  const [HostName, setHostName] = useState('');

  //在用户名称和球球名称改变时上报一次DP
  // useEffect(()=>{
  //   if(BallName==='')     //如果是空数据
  //   {
  //     return;
  //   }
  //   actions[dev_name_code].set(BallName);
  // },[BallName])
  useEffect(() => {
    if (HostName === '')   //如果是空数据
    {
      return;
    }
    actions[user_name_code].set(HostName);
  }, [HostName])

  //重命名的弹窗
  const [show_rename_popup, set_show_rename_popup] = useState(false);
  const Open_popup = () => {
    set_show_rename_popup(true);
  }
  const close = () => {
    set_show_rename_popup(false);
  }


  //打开设备详情页
  const open_device = () => {
    const {
      query: { deviceId }
    } = getLaunchOptionsSync();
    openDeviceDetailPage({
      deviceId,
      success(res) {
      },
      fail(res) {
        console.log(res);
      }
    })
  }


  //每日卡片的颜色初始化
  const today = new Date();
  const dayIndex = today.getDay(); // 获取今天是星期几，0-6
  const [DailyPopupdayindex, setDailyPopupdayindex] = useState(dayIndex);
  const [DailyPopupcolor1, setDailyPopupcolor1] = useState(() => {
    return dayColorMap[dayIndex].color
  });
  const [DailyPopupcolor2, setDailyPopupcolor2] = useState(() => {
    return dayColorMap[dayIndex].color
  });

  // text1 是4个大字，text2 是后面的小字，将会在后面通过随机数赋值。其中text2 又通过 / 来区分成两行
  const [DailyPopuptext1, setDailyPopuptext1] = useState(''); 
  const [DailyPopuptext2Part1, setDailyPopuptext2Part1] = useState('');
  const [DailyPopuptext2Part2, setDailyPopuptext2Part2] = useState('');
  // useEffect(() => {
  //   const text2 = emojitestNew[dayColorMap[dayIndex].emojiId].text.text1.text_2;
  //   const parts = text2.split('/');
  //   setDailyPopuptext1(emojitestNew[dayColorMap[dayIndex].emojiId].text.text1.text_1);
  //   setDailyPopuptext2Part1(parts[0].trim() || '');
  //   setDailyPopuptext2Part2(parts[1].trim() || '');
  // }, [dayIndex]);
  const [DailyPopuptext3, setDailyPopuptext3] = useState(getColorName(dayIndex));
  const [DailyPopupExist, setDailyPopupExist] = useState(false);
  // const [fireworksExist, setfireworksExist] = useState(false);
  const [wishExist, setwishExist] = useState(false);
  
  // 更新 wishExist 并同步到 storage
  const updateWishExist = (value: boolean) => {
    setwishExist(value);
    const { query: { deviceId } } = getLaunchOptionsSync();
    getStorage({
      key: deviceId,
      success(res) {
        const existingData = typeof res.data === 'object' && res.data !== null ? res.data : {};
        setStorage({
          key: deviceId,
          data: {
            ...existingData,
            wishExist: value
          }
        });
      },
      fail() {
        // 如果读取失败，直接创建新数据
        setStorage({
          key: deviceId,
          data: {
            wishExist: value
          }
        });
      }
    });
  };
  //烟花效果，删掉了烟花效果在需求2.0里
  // useEffect(()=>{
  //   setfireworksExist(false);
  // },[DailyPopupExist])

  //开关每日卡片
  const CloseDailyPopup = () => {
    setDailyPopupExist(false);
  }
  const OpenDailyPopup = () => {
    setDailyPopupExist(true);
  }

  //时间格式转换函数,例:2025.08.30这样的格式
  const TransformTimeFormat = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  //时间格式转换函数,例:12:12:30这样的格式
  const formatWithColons = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const { query: { deviceId } } = getLaunchOptionsSync();
    //胶囊隐藏
    hideMenuButton({

    })

    //计算陪伴天数逻辑
    getStorage({
      key: deviceId,
      success(res) {
          const End = getTodayStartTimestamp();
          const Start = Number((res.data as any).StartTimeStamp);
          const AccompanyDay = getDayDifference(End, Start);
          setday(AccompanyDay + 1);
      }
    })
    //页面渲染时获取智能体变量主人和球球名字

    const FetchVariable = async () => {
      try {
        const newVariables = await getAI2AgentVariableAgentVariableList({
          devId: deviceId,
        });
        const call = newVariables.find(user => user.variableKey === 'custom.call')?.variableValue;
        // const BallName = newVariables.find(user => user.variableKey === 'custom.ballName')?.variableValue;
        setHostName(call);
        // setBallName(BallName);
      } catch {

      }
    }

    FetchVariable();

    let RecentDate = '';
    const second = stringToSecond(formatWithColons(new Date()));
    const CurrentDate = TransformTimeFormat(new Date());

    // 生成卡片数据的公共函数
    const generateCardData = () => {
      const keystest = Object.keys(emojitestNew[dayColorMap[dayIndex].emojiId].text);
      const randomKeytest = keystest[Math.floor(Math.random() * keystest.length)];
      const randomtext = emojitestNew[dayColorMap[dayIndex].emojiId].text[randomKeytest];
      const parts = randomtext.text_2.split('/');
      const part1 = parts[0]?.trim() || '';
      const part2 = parts[1]?.trim() || '';
      
      return {
        dayindex: dayIndex,
        color1: dayColorMap[dayIndex].color,
        color2: dayColorMap[dayIndex].color,
        content1: randomtext.text_1,
        content2part1: part1,
        content2part2: part2,
        content3: getColorName(dayIndex),
        part1,
        part2,
        text1: randomtext.text_1
      };
    };

    // 设置卡片数据到状态的函数
    const setCardDataToState = (cardData) => {
      setDailyPopupdayindex(cardData.dayindex);
      setDailyPopupcolor1(cardData.color1);
      setDailyPopupcolor2(cardData.color2);
      setDailyPopuptext1(cardData.text1);
      setDailyPopuptext2Part1(cardData.part1);
      setDailyPopuptext2Part2(cardData.part2);
      setDailyPopuptext3(cardData.content3);
    };

    getStorage({
      key: deviceId + '4',
      success: async (res) => {
        RecentDate = res.data;
        const isFirstTime = res.data === null;
        if (isFirstTime) {
          RecentDate = '初始化';
        }

        //判断是不是第一次打开，或者超过早上八点且日期不同
        if (isFirstTime || ((second > 28800) && (CurrentDate !== RecentDate)))
        // if(true)// TODO:测试代码
        {
          const cardData = generateCardData();

          // setfireworksExist(true);
          updateWishExist(true);
          setDailyPopupExist(false);

          //将日期数据存储起来
          setStorage({
            key: deviceId + '4',
            data: CurrentDate,
            success: () => {
            },
            fail: (err) => {
              console.log(err);
            }
          });
          //将每日卡片内容（文字，颜色等）存储起来
          setStorage({
            key: deviceId + '5',
            data: {
              dayindex: cardData.dayindex,
              color1: cardData.color1,
              color2: cardData.color2,
              content1: cardData.content1,
              content2part1: cardData.content2part1,
              content2part2: cardData.content2part2,
              content3: cardData.content3,
            },
            success() {
              setCardDataToState(cardData);
            }
          })
        }
        else {               //如果不符合每日更新卡片内容条件
          //取每日卡片内容并渲染
          getStorage({
            key: deviceId + '5',
            success(res) {
              if (res.data && typeof res.data === 'object' && res.data !== null) {
                const cardData = res.data as any;
                setDailyPopupdayindex(cardData.dayindex !== undefined ? cardData.dayindex : dayIndex);
                setDailyPopupcolor1(cardData.color1);
                setDailyPopupcolor2(cardData.color2);
                setDailyPopuptext1(cardData.content1);
                setDailyPopuptext2Part1(cardData.content2part1);
                setDailyPopuptext2Part2(cardData.content2part2);
                setDailyPopuptext3(cardData.content3);
              } else {
                // 如果存储中没有数据，生成新数据作为兜底
                const cardData = generateCardData();
                setCardDataToState(cardData);
              }
            },
            fail: () => {
              // 如果读取失败，生成新数据作为兜底
              const cardData = generateCardData();
              setCardDataToState(cardData);
            }
          })
        }
      },
      fail: (err) => {

      }
    });

  }, [])

  //信号强度
  const [Signal, setSignal] = useState(-100);
  const isFirstLoad = useRef(true);
  const fetchTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 请求WiFi信号的公共函数
  const fetchWifiSignal = () => {
    const { query: { deviceId } } = getLaunchOptionsSync();
    
    requestWifiSignal({
      deviceId,
      success: (signal) => {
        const num = Number(signal);
        setSignal(num);
      },
      fail: (error) => {
        setSignal(-100);
      }
    });
  };

  // 初始化时请求WiFi信号（仅第一次打开时执行）
  useEffect(() => {
    fetchWifiSignal();
    isFirstLoad.current = false;
  }, []);

  // 处理从后台恢复时的WiFi信号请求（带防抖）
  const handleShow = () => {
    // 跳过第一次加载，因为已经在 useEffect 中处理了
    if (!isFirstLoad.current) {
      // 清除之前的定时器，避免重复请求
      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
      }
      // 添加延迟，确保应用完全恢复后再请求
      fetchTimerRef.current = setTimeout(() => {
        fetchWifiSignal();
        fetchTimerRef.current = null;
      }, 300);
    }
  };

  // 页面显示时请求WiFi信号（从后台恢复时触发）
  usePageEvent('onShow', handleShow);

  // 应用级别：监听应用从后台恢复
  useAppEvent('onShow', handleShow);

  // 定时器：每10分钟请求一次WiFi信号
  useEffect(() => {
    const timer = setInterval(() => {
      fetchWifiSignal();
    }, 600000);

    return () => clearInterval(timer); // 组件卸载时清除定时器
  }, [])

  useEffect(() => {
    const timer = setInterval(async () => {

      const {
        query: { deviceId }
      } = getLaunchOptionsSync();

      try {
        const newVariables = await getAI2AgentVariableAgentVariableList({
          devId: deviceId,
        });
        const call = newVariables.find(user => user.variableKey === 'custom.call')?.variableValue;
        // const BallName = newVariables.find(user => user.variableKey === 'custom.ballName')?.variableValue;
        // setBallName(BallName);
        setHostName(call);
      } catch {

      }

    }, 3500);

    return () => clearInterval(timer); // 组件卸载时清除定时器
  }, [])

  //静音DP
  const [isMute, setisMute] = useState(false);
  const volumemute = useProps(props => props[volume_mute_code]);
  useEffect(() => {
    setisMute(volumemute);
  }, [volumemute])

  //充电提示气泡框状态
  const [showChargingTooltip, setShowChargingTooltip] = useState(false);

  // 返回按钮处理函数 - 返回到上一个应用
  const handleBack = () => {
    exitMiniProgram();
  }

  // 充电按钮点击处理函数
  const handleChargingClick = () => {
    // 无论是否充电都显示提示气泡框
    setShowChargingTooltip(true);
    // 3秒后自动隐藏
    setTimeout(() => {
      setShowChargingTooltip(false);
    }, 3000);
  }

  // 根据充电状态和电量获取提示文本
  const getTooltipText = () => {
    if (Charge === 'charging') {
      return Strings.getLang('home_charging_tooltip_charging');
    } else {
      // 未充电时根据电量显示不同提示
      if (BatteryValue >= 70) {
        return Strings.getLang('home_charging_tooltip_high');
      } else if (BatteryValue >= 30) {
        return Strings.getLang('home_charging_tooltip_medium');
      } else {
        return Strings.getLang('home_charging_tooltip_low');
      }
    }
  }
  return (
    <>
      <Image src={HomeBgImage} className={styles.home_bg_image} />
      <Image src={HomeBottomImage} className={styles.home_bottom_image} />
      
      {/* 返回按钮 */}
      <Button className={styles.back_button} onClick={handleBack}>
        <Image src={returnIcon} className={styles.back_icon} />
      </Button>
      
      <View className={styles.menus_row}>
        <View className={styles.card_btn} onClick={OpenDailyPopup}>
          <View className={styles.oval_outer}>
            <Image src={card} className={styles.card_img} />
            {wishExist && (
              <View className={styles.message_badge}>
                <Image src={messageIcon} className={styles.message_icon} />
                <Text className={styles.message_count}>1</Text>
              </View>
            )}
            <Text className={styles.card_font}>{Strings.getLang('home_good_luck_code')}</Text>
          </View>
        </View>

        <View className={styles.grow_btn} onClick={navigateTogrow}>
          <View className={styles.oval_outer}>
            <Image src={grow} className={styles.card_img} />
            <Text className={styles.card_font}>{Strings.getLang('home_growth_garden')}</Text>
          </View>
        </View>

        <View className={styles.space_btn} onClick={navigateTospace}>
          <View className={styles.oval_outer}>
            <Image src={space} className={styles.card_img} />
            <Text className={styles.card_font}>{Strings.getLang('home_nearby_ball')}</Text>
          </View>
        </View>
      </View>

      <View className={styles.ball_container}>
        <Image src={ballBg1} className={styles.ball_bg1} />
        <Image src={ballBg2} className={styles.ball_bg2} />
        <Image src={manman} className={styles.ball} />
      </View>

      <View className={styles.name_box}>
        <Text className={styles.name}>
          {HostName}
          {Strings.getLang('common_of')}
          {Strings.getLang('common_space_before_ball')}
          {BallName}
        </Text>
        <Button className={styles.rename_btn} onClick={Open_popup}>
          <Image src={renameIcon} className={styles.rename_icon} />
        </Button>
      </View>

      {false && <Text className={styles.text2}>{Strings.getLang('home_ask_name_tip')}</Text>}

      <Text className={styles.text1}>
        {Strings.getLang('home_ball_accompany_you')}
        <Text className={styles.day}>
          {`${Strings.getLang('home_day_prefix')}${day}${Strings.getLang('home_day_suffix')}`}
        </Text>
      </Text>


      <View className={styles.bottom_menus_root}>

        <View className={styles.container}>

          <View className={`${styles.menu} ${styles['menu-charge']}`} onClick={handleChargingClick}>
            <View className={`${styles.electric_box} ${BatteryValue <= 30 ? styles.low : styles.middle}`}>
              <BatteryDisplay 
                batteryValue={BatteryValue} 
                isCharging={Charge === 'charging'} 
              />
            </View>
            <Text className={styles.electric_value}>{BatteryValue}%</Text>
          </View>


          <view className={styles.menu}>
            <view className={styles.menu_item} onClick={open_device}>
              <Image 
                src={Signal > -100 ? wifiConnected : wifiDisconnected} 
                className={styles.menu_icon}
              />
            </view>
          </view>


          <view className={styles.menu}>
            <view className={styles.menu_item} onClick={voice_change}>
              <Image 
                src={(dpVolumeSet === 0 || isMute) ? voiceMute : voiceUnmute} 
                className={styles.menu_icon}
              />
            </view>
          </view>

        </View>


      </View>

      {voice_exist &&
        <Slider className={styles.slider}
          maxTrackHeight="200px"
          minTrackHeight="8px"
          minTrackWidth="5px"
          maxTrackWidth="5px"
          thumbHeight="15px"
          thumbWidth="15px"
          thumbColor="#8eb9f6"
          minTrackColor="#8eb9f6"
          min={min}
          max={max}
          value={dpVolumeSet}
          onChange={(v)=>handleChangeDebounced(v)}
          onAfterChange={(v)=>{ handleChangeDebounced.cancel(); handleAfterChange(v); }}
          isVertical
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '5%',
          }}
        />}

      {show_rename_popup &&
        <Rename_popup onClose={close} currentBallName={BallName} currentHostName={HostName} />}
      {show_rename_popup &&
        <View className={styles.mask} />}


      {DailyPopupExist &&
        <DailyPopup onClose={CloseDailyPopup}
          dayindex={DailyPopupdayindex}
          color1={DailyPopupcolor1}
          color2={DailyPopupcolor2}
          text1={DailyPopuptext1}
          text2Part1={DailyPopuptext2Part1}
          text2Part2={DailyPopuptext2Part2}
          text3={DailyPopuptext3}
          // fireworks={fireworksExist}
          wishExist={wishExist}
          onWishButtonClick={() => updateWishExist(false)}></DailyPopup>}

      {/* 充电提示气泡框 */}
      {showChargingTooltip && (
        <View className={styles.charging_tooltip}>
          <Text className={styles.charging_tooltip_text}>{getTooltipText()}</Text>
        </View>
      )}
    </>
  )
}