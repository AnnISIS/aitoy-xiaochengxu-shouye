import React, { FC, useState, useEffect, useRef } from 'react';
import { View, Image, Button, Text, getCdnUrl, setStorage, getAI2AgentVariableAgentVariableList, getLaunchOptionsSync } from '@ray-js/ray';
import styles from './index.module.less';
import cdnImage from '../../../cdn/cdnImage.json'
import FlowerFront from '../../assets/images/tab/FlowerFront.png'
import PercentBubbleReal from '../../assets/images/tab/percent_bubble_real.png'
import PercentBubbleBrave from '../../assets/images/tab/percent_bubble_brave.png'
import PercentBubbleCaring from '../../assets/images/tab/percent_bubble_caring.png'
import PercentBubbleAware from '../../assets/images/tab/percent_bubble_aware.png'
import PercentBubbleAction from '../../assets/images/tab/percent_bubble_action.png'
import loveBubble from '../../assets/images/tab/love_bubble.png';
import roundBubble from '../../assets/images/tab/round_bubble.png';
import circleBubble from '../../assets/images/tab/circle_bubble.png';
import Strings from '@/i18n';

// 测试模式开关：设置为 true 启用测试，会自动模拟 flowerValue 的变化
const TEST_MODE = false;
const TEST_INTERVAL = 5000;
// === 倍数参数：将从API获取的值乘以该倍数 ===
const VALUE_MULTIPLIER = 10;

type Props = {
  visible: boolean;
  flowerType: 'RealFlower' | 'BraveFlower' | 'CaringFlower' | 'AwareFlower' | 'ActionFlower';
  flowerValue: number;
  onClose?: () => void;
};

const FlowerDetailPopup: FC<Props> = ({ 
  visible = false,     
  flowerType,
  flowerValue = 0,
  onClose,
}) => {

  const contentRef = useRef<any>(null);
  // 在组件变量内保存一组旧值
  const oldValues = useRef({
    realValueDetail: 0,
    braveValueDetail: 0,
    caringValueDetail: 0,
    awareValueDetail: 0,
    actionValueDetail: 0,
  });

  // 使用 ref 来保存最新的值（避免 React state 异步更新问题）
  const newValues = useRef({
    realValueDetail: 0,
    braveValueDetail: 0,
    caringValueDetail: 0,
    awareValueDetail: 0,
    actionValueDetail: 0,
  });

  // 用于触发重新渲染的计数器（当 newValues.current 更新时增加）
  const [valuesUpdateCounter, setValuesUpdateCounter] = useState(0);

  // 花朵展示动画中间态
  const [bubbles, setBubbles] = useState<any[]>([]);
  const bubbleImgs = [loveBubble, roundBubble, circleBubble];
  const bubbleMoveTimer = useRef<NodeJS.Timeout | null>(null);

  // 每10秒轮询取变量和更新storage，仅在弹窗显示时启动，首次立即刷新
  useEffect(() => {
    if (!visible) return;
    const { query: { deviceId } } = getLaunchOptionsSync();
    let mockStep = 0;
    let firstInit = true; // 新增：用于只在首次storage读取后初始化mockStep
    const fetchAndStoreVariables = async () => {
      try {
        const storageKey = deviceId + '1';
        let previous = {
          realValueDetail: 0,
          braveValueDetail: 0,
          caringValueDetail: 0,
          awareValueDetail: 0,
          actionValueDetail: 0,
        };
        // 获取storage里的新值
        let stData: any = {};
        try {
          stData = await new Promise<any>((resolve, reject) => {
            require('@ray-js/ray').getStorage({
              key: storageKey,
              success: res => resolve(res.data || {}),
              fail: () => resolve({}),
            });
          });
          previous = {
            realValueDetail: Number((stData as any).realValueDetail) || 0,
            braveValueDetail: Number((stData as any).braveValueDetail) || 0,
            caringValueDetail: Number((stData as any).caringValueDetail) || 0,
            awareValueDetail: Number((stData as any).awareValueDetail) || 0,
            actionValueDetail: Number((stData as any).actionValueDetail) || 0,
          };
          oldValues.current = { ...previous };
          // 新增：只在首次storage解析后初始化mockStep
          if (TEST_MODE && firstInit) {
            mockStep = previous.realValueDetail;
            firstInit = false;
          }
        } catch {}
        let guReal, guBrave, guLove, guCheck, guAction;
        if (TEST_MODE) {
          // 测试模式：从storage获取值
          guReal = Number(stData.realValue) || 0;
          guBrave = Number(stData.braveValue) || 0;
          guLove = Number(stData.caringValue) || 0;
          guCheck = Number(stData.awareValue) || 0;
          guAction = Number(stData.actionValue) || 0;
        } else {
          // 实际调用
          const newVariables = await getAI2AgentVariableAgentVariableList({devId: deviceId});
          guReal = Math.min((Number(newVariables.find(user => user.variableKey === 'custom.guReal')?.variableValue) || 0) * VALUE_MULTIPLIER, 100);
          guBrave = Math.min((Number(newVariables.find(user => user.variableKey === 'custom.guBrave')?.variableValue) || 0) * VALUE_MULTIPLIER, 100);
          guLove = Math.min((Number(newVariables.find(user => user.variableKey === 'custom.guLove')?.variableValue) || 0) * VALUE_MULTIPLIER, 100);
          guCheck = Math.min((Number(newVariables.find(user => user.variableKey === 'custom.guCheck')?.variableValue) || 0) * VALUE_MULTIPLIER, 100);
          guAction = Math.min((Number(newVariables.find(user => user.variableKey === 'custom.guAction')?.variableValue) || 0) * VALUE_MULTIPLIER, 100);
        }
        setStorage({
          key: storageKey,
          data: {
            ...((stData && typeof stData === 'object') ? stData : {}),
            realValueDetail: guReal,
            braveValueDetail: guBrave,
            caringValueDetail: guLove,
            awareValueDetail: guCheck,
            actionValueDetail: guAction
          }
        });
        
        // 更新 ref，确保可以立即访问最新值
        newValues.current.realValueDetail = guReal;
        newValues.current.braveValueDetail = guBrave;
        newValues.current.caringValueDetail = guLove;
        newValues.current.awareValueDetail = guCheck;
        newValues.current.actionValueDetail = guAction;
        
        // 触发重新渲染
        setValuesUpdateCounter(prev => prev + 1);
      } catch (error) {
        // 错误无需处理
      }
    };
    fetchAndStoreVariables();
    const timer = setInterval(fetchAndStoreVariables, TEST_INTERVAL);
    return () => clearInterval(timer);
  }, [visible]);

  function createBubbles(count: number) {
    if (bubbleMoveTimer.current) {
      clearInterval(bubbleMoveTimer.current);
      bubbleMoveTimer.current = null;
    }
    const n = Math.min(Math.max(count, 0), 10); // 限制最大10，不为负
    if (n === 0) return setBubbles([]);
    const arr = Array.from({ length: n }).map(() => ({
      id: Math.random().toString(36).slice(2),
      img: bubbleImgs[Math.floor(Math.random() * bubbleImgs.length)],
      left: 30 + Math.random() * 30,
      bottom: 55,
      curvePhase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5, // 每个泡泡一个不同的速度
    }));
    setBubbles(arr);
    bubbleMoveTimer.current = setInterval(() => {
      setBubbles(cur => {
        const next = cur.map(b => ({ ...b, bottom: b.bottom + b.speed }));
        return next.filter(b => b.bottom <= 90);
      });
    }, 50);
  }

  useEffect(() => {
    let startVal = 0, endVal = 0;
    switch (flowerType) {
      case 'RealFlower':
        startVal = oldValues.current.realValueDetail;
        endVal = newValues.current.realValueDetail;
        break;
      case 'BraveFlower':
        startVal = oldValues.current.braveValueDetail;
        endVal = newValues.current.braveValueDetail;
        break;
      case 'CaringFlower':
        startVal = oldValues.current.caringValueDetail;
        endVal = newValues.current.caringValueDetail;
        break;
      case 'AwareFlower':
        startVal = oldValues.current.awareValueDetail;
        endVal = newValues.current.awareValueDetail;
        break;
      case 'ActionFlower':
        startVal = oldValues.current.actionValueDetail;
        endVal = newValues.current.actionValueDetail;
        break;
    }
    const diff = Math.max(0, Math.min(10, endVal - startVal));
    createBubbles(diff);
    
    // 动画触发后，更新 oldValues 为当前的 newValues，供下次比较使用
    oldValues.current = { ...newValues.current };
    
    return () => {
      if (bubbleMoveTimer.current) {
        clearInterval(bubbleMoveTimer.current);
        bubbleMoveTimer.current = null;
      }
    };
  }, [flowerType, valuesUpdateCounter]);

  const handleWrapperClick = (e: any) => {
    try {
      const el = contentRef.current as any;
      if (el && typeof el.contains === 'function') {
        if (el.contains(e.target)) return; // inside content: do nothing
      }
    } catch {}
    close();
  };

  const close = () => {
    onClose?.();
  }

  // 根据flowerType和displayValue选择对应的图片（从CDN获取）
  const getFlowerImage = () => {
    // 区间步长，必须从大到小判断
    const steps = [100, 80, 60, 40, 20, 0];
    const value = Math.max(0, Math.min(100, Math.round(displayValue)));
    const matchedStep = steps.find(step => value >= step) ?? 0;
    const imgName = `${flowerType}${matchedStep}.png`;
    return getCdnUrl(imgName, cdnImage);
  };

  // 根据flowerType选择对应的光线图片（从CDN获取）
  const getFlowerLight = () => {
    switch (flowerType) {
      case 'RealFlower': return getCdnUrl('RealFlowerLight.png', cdnImage);
      case 'BraveFlower': return getCdnUrl('BraveFlowerLight.png', cdnImage);
      case 'CaringFlower': return getCdnUrl('CaringFlowerLight.png', cdnImage);
      case 'AwareFlower': return getCdnUrl('AwareFlowerLight.png', cdnImage);
      case 'ActionFlower': return getCdnUrl('ActionFlowerLight.png', cdnImage);
      default: return getCdnUrl('RealFlowerLight.png', cdnImage);
    }
  };

  // 返回统一的底图
  const getFlowerFront = () => {
    return FlowerFront;
  };

  // 根据flowerType获取花朵名称文字
  const getFlowerName = () => {
    switch (flowerType) {
      case 'RealFlower': return Strings.getLang('grow_flower_real_name');
      case 'BraveFlower': return Strings.getLang('grow_flower_brave_name');
      case 'CaringFlower': return Strings.getLang('grow_flower_caring_name');
      case 'AwareFlower': return Strings.getLang('grow_flower_aware_name');
      case 'ActionFlower': return Strings.getLang('grow_flower_action_name');
      default: return Strings.getLang('grow_flower_real_name');
    }
  };

  // 根据flowerType获取标题和描述
  const getFlowerInfo = () => {
    switch (flowerType) {
      case 'RealFlower': return {
        title: Strings.getLang('grow_flower_real_name'),
        description: Strings.getLang('flower_detail_real_desc')
      };
      case 'BraveFlower': return {
        title: Strings.getLang('grow_flower_brave_name'),
        description: Strings.getLang('flower_detail_brave_desc')
      };
      case 'CaringFlower': return {
        title: Strings.getLang('grow_flower_caring_name'),
        description: Strings.getLang('flower_detail_caring_desc')
      };
      case 'AwareFlower': return {
        title: Strings.getLang('grow_flower_aware_name'),
        description: Strings.getLang('flower_detail_aware_desc')
      };
      case 'ActionFlower': return {
        title: Strings.getLang('grow_flower_action_name'),
        description: Strings.getLang('flower_detail_action_desc')
      };
      default: return {
        title: Strings.getLang('grow_flower_real_name'),
        description: Strings.getLang('flower_detail_real_desc')
      };
    }
  };

  // 获取CDN背景图片URL
  const popupBgUrl = getCdnUrl('flower_detail_popup.png', cdnImage);

  // 根据flowerType选择对应的百分气泡背景图片（本地assets）
  const getPercentBubbleImage = () => {
    switch (flowerType) {
      case 'RealFlower': return PercentBubbleReal;
      case 'BraveFlower': return PercentBubbleBrave;
      case 'CaringFlower': return PercentBubbleCaring;
      case 'AwareFlower': return PercentBubbleAware;
      case 'ActionFlower': return PercentBubbleAction;
      default: return PercentBubbleReal;
    }
  };

  const flowerInfo = getFlowerInfo();

  if (!visible) return null;

  // 直接使用当前最终值作为进度条百分比（从 ref 获取）
  const displayValue = (() => {
    switch (flowerType) {
      case 'RealFlower': return newValues.current.realValueDetail;
      case 'BraveFlower': return newValues.current.braveValueDetail;
      case 'CaringFlower': return newValues.current.caringValueDetail;
      case 'AwareFlower': return newValues.current.awareValueDetail;
      case 'ActionFlower': return newValues.current.actionValueDetail;
      default: return 0;
    }
  })();

  return (
    <View>
      <View className={styles.wrapper} onClick={handleWrapperClick}>
        {bubbles.map((b) => {
          const leftOffset = Math.sin(b.bottom / 7 + b.curvePhase) * 8;
          return (
            <Image
              key={b.id}
              src={b.img}
              style={{
                position: 'absolute' as React.CSSProperties['position'],
                left: `calc(${b.left}% + ${leftOffset}px)`,
                bottom: `${b.bottom}%`,
                width: '32px',
                height: '32px',
                zIndex: 20000,
                pointerEvents: 'none' as React.CSSProperties['pointerEvents'],
                transition: 'bottom 0.07s linear',
              }}
              className="bubbleFloat"
            />
          );
        })}
        <View ref={contentRef}>
          <Image src={getFlowerLight()} className={styles.flowerLight} />
          <Image src={getFlowerImage()} className={styles.flowerImage} />

        <View className={styles.container} style={{ backgroundImage: `url(${popupBgUrl})` }}>
          <View className={styles.contentArea}>
            <View className={styles.flowerFrontWrapper}>
              <Image src={getFlowerFront()} className={styles.flowerFront} />
              <View className={styles.flowerNameContainer}>
                {(() => {
                  const name = getFlowerName();
                  const chars = name.split('');
                  const totalChars = chars.length;
                  // 判断是否为中文（检测第一个字符）
                  const isChinese = /[\u4e00-\u9fa5]/.test(chars[0]);
                  
                  // 根据字符数量自动计算总角度范围，让文字均匀分布
                  // 中文：4个字占用约45度，英文：根据字符数动态调整
                  const totalAngle = isChinese ? 50 : Math.min(70, totalChars * 5.5);
                  const angleStep = totalChars > 1 ? totalAngle / (totalChars - 1) : 0;
                  const radius = 120; // 增大半径，让字符分布更宽
                  
                  // 根据语言和字符数量动态调整字体大小
                  const fontSize = isChinese ? 60 : (totalChars > 15 ? 28 : totalChars > 10 ? 30 : 34);
                  
                  // 根据语言选择字体
                  const fontFamily = isChinese ? 'PingFang SC' : 'Georgia, Baskerville, serif';
                  
                  return chars.map((char, index) => {
                    const angle = (index - (totalChars - 1) / 2) * angleStep;
                    const radian = (angle * Math.PI) / 180;
                    const x = Math.sin(radian) * radius;
                    const y = -Math.cos(radian) * radius + radius;
                    
                    return (
                      <Text
                        key={index}
                        className={styles.flowerNameChar}
                        style={{
                          '--char-x': `${x}px`,
                          '--char-y': `${y}px`,
                          '--char-rotate': `${angle}deg`,
                          '--font-size': `${fontSize}rpx`,
                          '--font-family': fontFamily,
                        } as React.CSSProperties}
                      >
                        {char}
                      </Text>
                    );
                  });
                })()}
              </View>
            </View>
            <Text className={styles.description}>{flowerInfo.description}</Text>

            <View className={styles.progressContainer}>
              <View className={styles.progressTrackWrapper}>
                <Text className={styles.zeroPercent}>0%</Text>
                <View className={styles.progressTrack}>
                  <View className={styles.progressClip}>
                    <View
                      className={`${styles.progressFill} ${
                        flowerType === 'RealFlower' ? styles.progressFillReal :
                        flowerType === 'BraveFlower' ? styles.progressFillBrave :
                        flowerType === 'AwareFlower' ? styles.progressFillAware :
                        flowerType === 'ActionFlower' ? styles.progressFillAction :
                        styles.progressFillCaring
                      }`}
                      style={{
                        width: `${Math.max(0, Math.min(100, Math.round(displayValue)))}%`,
                        borderTopRightRadius: Math.round(displayValue) >= 100 ? '999px' : '0',
                        borderBottomRightRadius: Math.round(displayValue) >= 100 ? '999px' : '0'
                      }}
                    ></View>
                  </View>
                  <View
                    className={styles.percentBubble}
                    style={{
                      left: `calc(${Math.max(4, Math.min(93, Math.round(displayValue)))}% - 1px)`
                    }}
                  >
                    <Image src={getPercentBubbleImage()} className={styles.percentBubbleImg} />
                    <Text className={styles.percentText}>{Math.round(displayValue)}%</Text>
                  </View>
                </View>
                <Text className={styles.fullPercent}>100%</Text>
              </View>
            </View>
          </View>
        </View>
        </View>
      </View>
      <View className={styles.mask} />
    </View>
  );
};

export default FlowerDetailPopup;