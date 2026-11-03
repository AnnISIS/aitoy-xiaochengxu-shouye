// pages/index.tsx
import React, { useState,useEffect } from 'react';
import { View, Button,Image,Text,setStorage,navigateTo, usePageEvent,getStorage,getLaunchOptionsSync,getAI2AgentVariableAgentVariableList,hideMenuButton,getAccountInfo,getCdnUrl,navigateBack } from '@ray-js/ray';
import styles from './index.module.less';
import cdnImage from '../../../cdn/cdnImage.json';
import RealFlower from '../../assets/images/tab/RealFlower.png'
import BraveFlower from '../../assets/images/tab/BraveFlower.png'
import CaringFlower from '../../assets/images/tab/CaringFlower.png'
import AwareFlower from '../../assets/images/tab/AwareFlower.png'
import ActionFlower from '../../assets/images/tab/ActionFlower.png'
import returnIcon from '../../assets/images/tab/return.png'
import FlowerDetailPopup from '../../components/FlowerDetailPopup';
import FlowerReminder from '../../components/FlowerReminder';
import FlowerLetter from '../../components/FlowerLetter';
import Strings from '@/i18n';

export default function IndexPage() {

  // 获取CDN背景图片URL
  const growBgUrl = getCdnUrl(cdnImage['grow_bg.png']);

  // 安全获取百分比值，防止 NaN
  const getSafePercent = (value: number): number => {
    if (isNaN(value) || !isFinite(value)) {
      return 0;
    }
    return Math.round(value);
  };

  const clampPercent = (value: number): number => {
    const safeValue = getSafePercent(value);
    return Math.min(100, Math.max(0, safeValue));
  };

  // 返回按钮处理函数
  const handleBack = () => {
    navigateBack();
  }

  //长按成长花园页面顶端居中位置5秒显示版本号
  const [VersionExist,setVersionExist]=useState(false)
  const [Version,setVersion]=useState('')
  const pressTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // 花朵详情弹窗状态
  const [selectedFlowerType, setSelectedFlowerType] = useState<'RealFlower' | 'BraveFlower' | 'CaringFlower' | 'AwareFlower' | 'ActionFlower' | null>(null);
  
  // 使用 ref 存储弹窗状态，避免闭包陷阱
  const showReminderRef = React.useRef(false);
  const flowerLetterVisibleRef = React.useRef(false);
  const flowerPopupVisibleRef = React.useRef(false);

  // 用来记录是否有未显示的letter弹窗
  const pendingLetterKindRef = React.useRef<'Real' | 'Brave' | 'Caring' | 'Aware' | 'Action' | null>(null);
  
  // 渲染触发器：用于在 ref 更新时触发组件重新渲染
  const [renderTrigger, setRenderTrigger] = useState(0);
  
  // 辅助函数：更新 ref 并触发渲染
  const updateShowReminder = (value: boolean) => {
    showReminderRef.current = value;
    setRenderTrigger(prev => prev + 1);
  };
  
  const updateFlowerLetterVisible = (value: boolean) => {
    flowerLetterVisibleRef.current = value;
    setRenderTrigger(prev => prev + 1);
  };
  
  const updateFlowerPopupVisible = (value: boolean) => {
    flowerPopupVisibleRef.current = value;
    setRenderTrigger(prev => prev + 1);
  };

  // 开始长按计时
  const startPressTimer = () => {
    // 先清除之前的定时器（如果存在）
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    // 创建新的定时器
    pressTimerRef.current = setTimeout(() => {
      setVersionExist(!VersionExist);
      pressTimerRef.current = null;
    }, 5000); // 5秒
  };

  // 取消长按计时
  const cancelPressTimer = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  // 封装一个获取成长数据并set的函数
  const fetchFlowerValues = () => {
    const { query: { deviceId } } = getLaunchOptionsSync();
    getStorage({
      key: deviceId + '1',
      success(res) {
        let result1, result2, result3, result4, result5;
        let prev1, prev2, prev3, prev4, prev5;
        if (res.data === null) {
          result1 = result2 = result3 = result4 = result5 = 0;
          prev1 = prev2 = prev3 = prev4 = prev5 = 0;
        } else {
          result1 = Number((res.data as any).realValue) || 0;
          result2 = Number((res.data as any).braveValue) || 0;
          result3 = Number((res.data as any).caringValue) || 0;
          result4 = Number((res.data as any).awareValue) || 0;
          result5 = Number((res.data as any).actionValue) || 0;
          prev1 = Number((res.data as any).realValueReminded) || 0;
          prev2 = Number((res.data as any).braveValueReminded) || 0;
          prev3 = Number((res.data as any).caringValueReminded) || 0;
          prev4 = Number((res.data as any).awareValueReminded) || 0;
          prev5 = Number((res.data as any).actionValueReminded) || 0;
        }
        // 确保值不是 NaN
        result1 = isNaN(result1) ? 0 : result1;
        result2 = isNaN(result2) ? 0 : result2;
        result3 = isNaN(result3) ? 0 : result3;
        result4 = isNaN(result4) ? 0 : result4;
        result5 = isNaN(result5) ? 0 : result5;
        prev1 = isNaN(prev1) ? 0 : prev1;
        prev2 = isNaN(prev2) ? 0 : prev2;
        prev3 = isNaN(prev3) ? 0 : prev3;
        prev4 = isNaN(prev4) ? 0 : prev4;
        prev5 = isNaN(prev5) ? 0 : prev5;
        // 同步更新 latestValues ref，用于在动画函数中访问最新状态
        latestValues.current = {
          realValue: result1,
          braveValue: result2,
          caringValue: result3,
          awareValue: result4,
          actionValue: result5,
        };
        // 触发动画更新
        setValuesUpdateCounter(prev => prev + 1);
        // 恢复 reminded 值到 ref（ref 可以立即访问最新值）
        remindedValuesRef.current.Real = prev1;
        remindedValuesRef.current.Brave = prev2;
        remindedValuesRef.current.Caring = prev3;
        remindedValuesRef.current.Aware = prev4;
        remindedValuesRef.current.Action = prev5;

        // 初始化内存中的 oldValues ref，用于百分比动画
        oldValues.current = {
          realValue: result1,
          braveValue: result2,
          caringValue: result3,
          awareValue: result4,
          actionValue: result5,
        };

        // 标记初始化完成
        initializedRef.current = true;
      }
    })
  };

  // === 测试模式开关和参数 ===
  const TEST_MODE = false; // 或根据实际需求外部配置
  const TEST_INTERVAL = 10000;
  const TEST_MAX = 100;
  // === 倍数参数：将从API获取的值乘以该倍数 ===
  const VALUE_MULTIPLIER = 10;
  // 为每个值创建独立的ref
  const mockRealRef = React.useRef(5);
  const mockBraveRef = React.useRef(20);
  const mockLoveRef = React.useRef(30);
  const mockCheckRef = React.useRef(60);
  const mockActionRef = React.useRef(80);

  // 页面mount时执行
  useEffect(() => {
    // 获取小程序版本号
    getAccountInfo({
      success: (res) => {
        setVersion(res.miniProgram.version)
      },
      fail: (error) => {
        console.log('getAccountInfo fail', error);
      }
    });
    // 隐藏胶囊按钮
    hideMenuButton({ });
    // 初始获取变量（如果需要后续初始化也在此完成）
    const { query: { deviceId } } = getLaunchOptionsSync();
    fetchFlowerValues();
    
    // 组件卸载时清理定时器
    return () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }
    };
  }, []);

  // 监听弹窗显示状态，关闭时刷新成长值
  useEffect(() => {
    if (!flowerPopupVisibleRef.current) {
      fetchFlowerValues();
    }
  }, [renderTrigger]);

  // 用于触发动画更新的计数器（当 latestValues.current 更新时增加）
  const [valuesUpdateCounter, setValuesUpdateCounter] = useState(0);
  // 用于保存已提醒过的数值快照（用来判断是否需要弹窗，弹窗后，reminded值会更新为云端获取的最新值）
  // 使用 ref 来立即访问最新的 Reminded 值（避免 React state 异步更新问题）
  const remindedValuesRef = React.useRef({
    Real: 0,
    Brave: 0,
    Caring: 0,
    Aware: 0,
    Action: 0,
  });
  
  // 在内存中保存旧值，用于百分比动画
  const oldValues = React.useRef({
    realValue: 0,
    braveValue: 0,
    caringValue: 0,
    awareValue: 0,
    actionValue: 0,
  });
  // 在内存中保存最新的值，用于在动画函数中访问最新状态
  const latestValues = React.useRef({
    realValue: 0,
    braveValue: 0,
    caringValue: 0,
    awareValue: 0,
    actionValue: 0,
  });
  // 跟踪哪些动画正在进行中
  const animationInProgressRef = React.useRef({
    realValue: false,
    braveValue: false,
    caringValue: false,
    awareValue: false,
    actionValue: false,
  });
  // 用于动画显示的值（使用 ref 存储，配合渲染触发器）
  const animatedValues = React.useRef({
    realValue: 0,
    braveValue: 0,
    caringValue: 0,
    awareValue: 0,
    actionValue: 0,
  });
  // 用于触发重新渲染的计数器（当 animatedValues 更新时增加）
  const [animatedValuesUpdateCounter, setAnimatedValuesUpdateCounter] = useState(0);
  // 花信弹窗状态
  const flowerLetterTextRef = React.useRef('');
  const flowerLetterKindRef = React.useRef<'Real' | 'Brave' | 'Caring' | 'Aware' | 'Action' | null>(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchAndStoreVariables = async () => {
      const { query: { deviceId } } = getLaunchOptionsSync();
      const storageKey = deviceId + '1';
      
      let guReal: number, guBrave: number, guLove: number, guCheck: number, guAction: number;
      
      // 根据TEST_MODE分支选择测试代码或真实API调用
      if (TEST_MODE) {
        // 如果有弹窗打开，跳过测试模拟逻辑（使用 ref 避免闭包陷阱）
        if (flowerPopupVisibleRef.current || flowerLetterVisibleRef.current || showReminderRef.current) {
          return;
        }
        
        // === 测试模拟逻辑 ===
        // 使用当前值，每轮在原来基础上加10，达到100后不再增加
        guReal = mockRealRef.current;
        guBrave = mockBraveRef.current;
        guLove = mockLoveRef.current;
        guCheck = mockCheckRef.current;
        guAction = mockActionRef.current;
        
        // 更新各值（加0-10的随机数，但不超过100）
        mockRealRef.current = Math.min(mockRealRef.current + Math.floor(Math.random() * 30), TEST_MAX);
        mockBraveRef.current = Math.min(mockBraveRef.current + Math.floor(Math.random() * 30), TEST_MAX);
        mockLoveRef.current = Math.min(mockLoveRef.current + Math.floor(Math.random() * 30), TEST_MAX);
        mockCheckRef.current = Math.min(mockCheckRef.current + Math.floor(Math.random() * 30), TEST_MAX);
        mockActionRef.current = Math.min(mockActionRef.current + Math.floor(Math.random() * 30), TEST_MAX);
      } else {
        // === 真实API调用 ===
        try {
          const newVariables = await getAI2AgentVariableAgentVariableList({devId: deviceId});
          guReal = Math.min((Number(newVariables.find(user => user.variableKey === 'custom.guReal')?.variableValue) || 0) * VALUE_MULTIPLIER, 100);
          guBrave = Math.min((Number(newVariables.find(user => user.variableKey === 'custom.guBrave')?.variableValue) || 0) * VALUE_MULTIPLIER, 100);
          guLove = Math.min((Number(newVariables.find(user => user.variableKey === 'custom.guLove')?.variableValue) || 0) * VALUE_MULTIPLIER, 100);
          guCheck = Math.min((Number(newVariables.find(user => user.variableKey === 'custom.guCheck')?.variableValue) || 0) * VALUE_MULTIPLIER, 100);
          guAction = Math.min((Number(newVariables.find(user => user.variableKey === 'custom.guAction')?.variableValue) || 0) * VALUE_MULTIPLIER, 100);
        } catch (e) {
          // 忽略错误，直接返回
          return;
        }
      }
      
      // 检查值是否有效：不是 NaN 且是有限数字
      const isValidValue = (value: number) => !isNaN(value) && isFinite(value);

      // 花朵值映射结构：定义新值和对应的存储字段名
      const flowerValueMap = {
        realValue: { newValue: guReal },
        braveValue: { newValue: guBrave },
        caringValue: { newValue: guLove },
        awareValue: { newValue: guCheck },
        actionValue: { newValue: guAction },
      };

      // 写入当前最新值到storage，无论值变大还是变小都更新（只要值有效）
      // 这样在将来删除倍数时，storage 能够正确更新
      getStorage({
        key: storageKey,
        success(res) {
          const existingData = (res.data && typeof res.data === 'object') ? res.data : {};
          const updateData: any = { ...existingData };
          
          // 统一处理所有花的值：在更新之前先保存旧值到内存中的 oldValues ref，用于百分比动画
          Object.entries(flowerValueMap).forEach(([fieldName, { newValue }]) => {
            if (isValidValue(newValue)) {
              const oldValue = Number((existingData as any)[fieldName]) || 0;
              if (isValidValue(oldValue) && oldValue !== newValue) {
                // 保存旧值到内存中的 ref，不保存到 storage
                (oldValues.current as any)[fieldName] = oldValue;
              }
              updateData[fieldName] = newValue;
            }
          });
          
          setStorage({
            key: storageKey,
            data: updateData,
          });
        },
      });

      // 同步到latestValues，只要值有效就更新，无论变大还是变小
      let hasUpdate = false;
      if (isValidValue(guReal)) {
        latestValues.current.realValue = guReal;
        hasUpdate = true;
      }
      if (isValidValue(guBrave)) {
        latestValues.current.braveValue = guBrave;
        hasUpdate = true;
      }
      if (isValidValue(guLove)) {
        latestValues.current.caringValue = guLove;
        hasUpdate = true;
      }
      if (isValidValue(guCheck)) {
        latestValues.current.awareValue = guCheck;
        hasUpdate = true;
      }
      if (isValidValue(guAction)) {
        latestValues.current.actionValue = guAction;
        hasUpdate = true;
      }
      // 如果有任何更新，触发动画
      if (hasUpdate) {
        setValuesUpdateCounter(prev => prev + 1);
      }
    };
    fetchAndStoreVariables();
    // 根据TEST_MODE选择不同的间隔时间
    const interval = TEST_MODE ? TEST_INTERVAL : 10000;
    const timer = setInterval(fetchAndStoreVariables, interval);
    return () => clearInterval(timer);
  }, []);

  // 获取用户名（称呼）用于花信弹窗
  useEffect(() => {
    const { query: { deviceId } } = getLaunchOptionsSync();
    const fetchUsername = async () => {
      try {
        const newVariables = await getAI2AgentVariableAgentVariableList({ devId: deviceId });
        const call = newVariables.find(user => user.variableKey === 'custom.call')?.variableValue;
        // 如果有值就使用，否则使用默认值
        setUsername(call && String(call).trim() ? (call as string) : Strings.getLang('grow_default_username'));
      } catch {
        // 如果获取失败，使用默认值
        setUsername(Strings.getLang('grow_default_username'));
      }
    };
    fetchUsername();
  }, []);

    const OpenRealFlower=()=>{

        getStorage({
          key:'FlowerExist',
          success(res){
            setStorage({
              key:'FlowerExist',
              data:{
                ...((res.data && typeof res.data === 'object') ? res.data : {}),
                RealFlower:true
              }
            })
          }
        })
        
        setSelectedFlowerType('RealFlower');
        updateFlowerPopupVisible(true);
    }
    const OpenBraveFlower=()=>{

      getStorage({
        key:'FlowerExist',
        success(res){
          setStorage({
            key:'FlowerExist',
            data:{
              ...((res.data && typeof res.data === 'object') ? res.data : {}),
              BraveFlower:true
            }
          })
        }
      })
        
        setSelectedFlowerType('BraveFlower');
        updateFlowerPopupVisible(true);
    }
    const OpenCaringFlower=()=>{

      getStorage({
        key:'FlowerExist',
        success(res){
          setStorage({
            key:'FlowerExist',
            data:{
              ...((res.data && typeof res.data === 'object') ? res.data : {}),
              CaringFlower:true
            }
          })
        }
      })
        
        setSelectedFlowerType('CaringFlower');
        updateFlowerPopupVisible(true);
    }
    const OpenAwareFlower=()=>{

      getStorage({
        key:'FlowerExist',
        success(res){
          setStorage({
            key:'FlowerExist',
            data:{
              ...((res.data && typeof res.data === 'object') ? res.data : {}),
              AwareFlower:true
            }
          })
        }
      })
        
        setSelectedFlowerType('AwareFlower');
        updateFlowerPopupVisible(true);
    }
    const OpenActionFlower=()=>{

      getStorage({
        key:'FlowerExist',
        success(res){
          setStorage({
            key:'FlowerExist',
            data:{
              ...((res.data && typeof res.data === 'object') ? res.data : {}),
              ActionFlower:true
            }
          })
        }
      })
        
        setSelectedFlowerType('ActionFlower');
        updateFlowerPopupVisible(true);
    }

  const reminderSteps = [100, 80, 60, 40, 20];
  const reminderTextRef = React.useRef('');
  const reminderKindRef = React.useRef<'Real' | 'Brave' | 'Caring' | 'Aware' | 'Action' | null>(null);
  const currentReminderStepRef = React.useRef<number | null>(null);

  // 记录每朵花已触发的阈值，防止重复弹
  const triggeredStepsRef = React.useRef({
    Real: new Set<number>() as Set<number>,
    Brave: new Set<number>() as Set<number>,
    Caring: new Set<number>() as Set<number>,
    Aware: new Set<number>() as Set<number>,
    Action: new Set<number>() as Set<number>,
  });
  
  // 标记是否已完成初始化（reminded值已从storage加载）
  const initializedRef = React.useRef(false);

  // 不同花在不同百分比下的提醒文案（通过多语言 key 获取）
  const getReminderText = (kind: 'Real' | 'Brave' | 'Caring' | 'Aware' | 'Action', step: number) =>
    Strings.getLang(`grow_reminder_${kind}_${step}` as Parameters<typeof Strings.getLang>[0]);

  // 记录每朵花100%花信是否已弹
  const letterTriggeredRef = React.useRef({
    Real: false,
    Brave: false,
    Caring: false,
    Aware: false,
    Action: false,
  });

  function getLetterText(kind: 'Real' | 'Brave' | 'Caring' | 'Aware' | 'Action') {
    // 文本内容已移除，返回空字符串
    return '';
  }
 
  function tryTriggerFlowerLetter(kind: 'Real' | 'Brave' | 'Caring' | 'Aware' | 'Action', value: number) {
    if (flowerLetterVisibleRef.current || showReminderRef.current || flowerPopupVisibleRef.current) return false;
    const pendingKind = pendingLetterKindRef.current;
    if (pendingKind && pendingKind !== kind) return false;
    if (Math.round(value) !== 100) return false;

    // 如果letter已经触发过，不重复触发
    if (letterTriggeredRef.current[kind]) return false;
    
    // 如果还未完成初始化，不触发弹窗
    if (!initializedRef.current) return false;

    // 获取对应的 reminded 值（使用 ref 可以立即访问最新值）和当前值进行比较
    // 只有在reminded值100，才触发letter
    const remindedValue = remindedValuesRef.current[kind];
    if (Math.round(remindedValue) < 100) {
      return false;
    }

    letterTriggeredRef.current[kind] = true;
    flowerLetterKindRef.current = kind;
    flowerLetterTextRef.current = getLetterText(kind);
    updateFlowerLetterVisible(true);
    pendingLetterKindRef.current = null;
    return true;
  }

  // 手动触发letter（用于在reminder关闭后触发）
  function triggerFlowerLetterManually(kind: 'Real' | 'Brave' | 'Caring' | 'Aware' | 'Action') {
    if (flowerLetterVisibleRef.current || showReminderRef.current || flowerPopupVisibleRef.current) return false;
    if (letterTriggeredRef.current[kind]) return false;

    letterTriggeredRef.current[kind] = true;
    flowerLetterKindRef.current = kind;
    flowerLetterTextRef.current = getLetterText(kind);
    updateFlowerLetterVisible(true);
    pendingLetterKindRef.current = null;
    return true;
  }

  function scheduleFlowerLetter(kind: 'Real' | 'Brave' | 'Caring' | 'Aware' | 'Action') {
    pendingLetterKindRef.current = kind;
    const attemptShowLetter = () => {
      if (letterTriggeredRef.current[kind]) {
        pendingLetterKindRef.current = null;
        return;
      }
      const opened = triggerFlowerLetterManually(kind);
      if (!opened) {
        setTimeout(attemptShowLetter, 100);
      }
    };
    attemptShowLetter();
  }

  function tryTriggerReminder(kind: 'Real' | 'Brave' | 'Caring' | 'Aware' | 'Action', value: number) {
    // 如果有任何弹窗打开，不触发新的reminder（使用 ref 避免闭包陷阱）
    if (showReminderRef.current || flowerLetterVisibleRef.current || flowerPopupVisibleRef.current) return false;
    if (pendingLetterKindRef.current) return false;
    
    // 如果还未完成初始化，不触发弹窗
    if (!initializedRef.current) return false;
    
    // 获取对应的 reminded 值（使用 ref 可以立即访问最新值）和当前值进行比较
    const remindedValue = remindedValuesRef.current[kind];

    // 如果旧值和新值一致，证明已经弹窗过了，不用再弹
    if (Math.round(remindedValue) === Math.round(value)) {
      return false;
    }
    
    // 查找value所属的区间（找到第一个小于等于value的step）
    // 例如：value=30 属于 20-40 区间，匹配到 20
    const step = reminderSteps.find(s => value >= s);
    if (!step) return false;
    const set = triggeredStepsRef.current[kind];
    if (set.has(step)) return false;
    set.add(step);
    // 从新的文案数据结构中获取对应花和百分比的文案
    const text = getReminderText(kind, step as 20 | 40 | 60 | 80 | 100);
    reminderTextRef.current = text;
    reminderKindRef.current = kind;
    currentReminderStepRef.current = step; // 记录当前reminder的step值
    
    // 更新对应的 reminded 值并保存到 storage
    const roundedValue = Math.round(value);
    const { query: { deviceId } } = getLaunchOptionsSync();
    const storageKey = deviceId + '1';
    
    // 根据 kind 更新对应的 reminded ref 和 storage
    const storageFieldMap = {
      Real: 'realValueReminded',
      Brave: 'braveValueReminded',
      Caring: 'caringValueReminded',
      Aware: 'awareValueReminded',
      Action: 'actionValueReminded',
    };
    
    // 更新 ref，确保可以立即访问最新值
    remindedValuesRef.current[kind] = roundedValue;
    const storageFieldKey = storageFieldMap[kind];
    
    // 保存到 storage
    getStorage({
      key: storageKey,
      success(res) {
        setStorage({
          key: storageKey,
          data: {
            ...((res.data && typeof res.data === 'object') ? res.data : {}),
            [storageFieldKey]: roundedValue,
          },
        });
      },
    });
    
    updateShowReminder(true);
    return true;
  }

  // 通用的动画函数
  const createAnimationEffect = (
    startValue: number,
    endValue: number,
    currentAnimatedValue: number,
    setAnimatedValue: (value: number) => void,
    flowerKey: 'realValue' | 'braveValue' | 'caringValue' | 'awareValue' | 'actionValue',
    onComplete?: () => void
  ) => {
    // 确保值不是 NaN 或 Infinity
    const safeStartValue = isNaN(startValue) || !isFinite(startValue) ? 0 : startValue;
    const safeEndValue = isNaN(endValue) || !isFinite(endValue) ? 0 : endValue;
    const safeCurrentAnimatedValue = isNaN(currentAnimatedValue) || !isFinite(currentAnimatedValue) ? 0 : currentAnimatedValue;

    // 如果值没有变化，不需要动画
    if (safeStartValue === safeEndValue) {
      setAnimatedValue(safeEndValue);
      animationInProgressRef.current[flowerKey] = false;
      onComplete?.();
      return null;
    }

    // 如果起始值和目标值都是 0，直接设置（首次加载的情况）
    if (safeStartValue === 0 && safeEndValue === 0) {
      setAnimatedValue(0);
      animationInProgressRef.current[flowerKey] = false;
      onComplete?.();
      return null;
    }

    // 标记动画开始
    animationInProgressRef.current[flowerKey] = true;

    // 动画持续时间（毫秒）
    const duration = 1500;
    const frameTime = 33; // 约30fps
    const startTime = Date.now();
    let animationTimerId: NodeJS.Timeout | null = null;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用 easing 函数实现平滑过渡（ease-out）
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = safeStartValue + (safeEndValue - safeStartValue) * easeOut;
      // 确保计算出的值不是 NaN
      const safeCurrentValue = isNaN(currentValue) || !isFinite(currentValue) ? safeEndValue : currentValue;
      setAnimatedValue(safeCurrentValue);

      if (progress < 1) {
        animationTimerId = setTimeout(animate, frameTime);
      } else {
        // 动画完成，设置最终值
        setAnimatedValue(safeEndValue);
        // 标记动画完成
        animationInProgressRef.current[flowerKey] = false;
        // 调用完成回调
        onComplete?.();
      }
    };

    // 设置初始值
    setAnimatedValue(safeStartValue);
    // 启动动画
    animationTimerId = setTimeout(animate, frameTime);

    // 返回清理函数
    return () => {
      if (animationTimerId !== null) {
        clearTimeout(animationTimerId);
      }
      animationInProgressRef.current[flowerKey] = false;
    };
  };

  // RealValue 动画效果：从 oldValues.current.realValue 动画到 latestValues.current.realValue
  useEffect(() => {
    // 创建更新函数：同时更新 ref 和触发重新渲染
    const updateAnimatedValue = (value: number) => {
      animatedValues.current.realValue = value;
      setAnimatedValuesUpdateCounter(prev => prev + 1);
    };
    return createAnimationEffect(
      oldValues.current.realValue,
      latestValues.current.realValue,
      animatedValues.current.realValue,
      updateAnimatedValue,
      'realValue',
      () => {
        // 动画完成后将旧值更新为新值
        oldValues.current.realValue = latestValues.current.realValue;
        // 动画完成后检查是否需要触发 reminder（使用 ref 避免闭包陷阱）
        if (!flowerLetterVisibleRef.current && !showReminderRef.current && !flowerPopupVisibleRef.current) {
          tryTriggerReminder('Real', latestValues.current.realValue);
          tryTriggerFlowerLetter('Real', latestValues.current.realValue);
        }
      }
    ) || undefined;
  }, [valuesUpdateCounter]);

  // BraveValue 动画效果：从 oldValues.current.braveValue 动画到 latestValues.current.braveValue
  useEffect(() => {
    // 创建更新函数：同时更新 ref 和触发重新渲染
    const updateAnimatedValue = (value: number) => {
      animatedValues.current.braveValue = value;
      setAnimatedValuesUpdateCounter(prev => prev + 1);
    };
    return createAnimationEffect(
      oldValues.current.braveValue,
      latestValues.current.braveValue,
      animatedValues.current.braveValue,
      updateAnimatedValue,
      'braveValue',
      () => {
        // 动画完成后将旧值更新为新值
        oldValues.current.braveValue = latestValues.current.braveValue;
        // 动画完成后检查是否需要触发 reminder（使用 ref 避免闭包陷阱）
        if (!flowerLetterVisibleRef.current && !showReminderRef.current && !flowerPopupVisibleRef.current) {
          tryTriggerReminder('Brave', latestValues.current.braveValue);
          tryTriggerFlowerLetter('Brave', latestValues.current.braveValue);
        }
      }
    ) || undefined;
  }, [valuesUpdateCounter]);

  // CaringValue 动画效果：从 oldValues.current.caringValue 动画到 latestValues.current.caringValue
  useEffect(() => {
    // 创建更新函数：同时更新 ref 和触发重新渲染
    const updateAnimatedValue = (value: number) => {
      animatedValues.current.caringValue = value;
      setAnimatedValuesUpdateCounter(prev => prev + 1);
    };
    return createAnimationEffect(
      oldValues.current.caringValue,
      latestValues.current.caringValue,
      animatedValues.current.caringValue,
      updateAnimatedValue,
      'caringValue',
      () => {
        // 动画完成后将旧值更新为新值
        oldValues.current.caringValue = latestValues.current.caringValue;
        // 动画完成后检查是否需要触发 reminder（使用 ref 避免闭包陷阱）
        if (!flowerLetterVisibleRef.current && !showReminderRef.current && !flowerPopupVisibleRef.current) {
          tryTriggerReminder('Caring', latestValues.current.caringValue);
          tryTriggerFlowerLetter('Caring', latestValues.current.caringValue);
        }
      }
    ) || undefined;
  }, [valuesUpdateCounter]);

  // AwareValue 动画效果：从 oldValues.current.awareValue 动画到 latestValues.current.awareValue
  useEffect(() => {
    // 创建更新函数：同时更新 ref 和触发重新渲染
    const updateAnimatedValue = (value: number) => {
      animatedValues.current.awareValue = value;
      setAnimatedValuesUpdateCounter(prev => prev + 1);
    };
    return createAnimationEffect(
      oldValues.current.awareValue,
      latestValues.current.awareValue,
      animatedValues.current.awareValue,
      updateAnimatedValue,
      'awareValue',
      () => {
        // 动画完成后将旧值更新为新值
        oldValues.current.awareValue = latestValues.current.awareValue;
        // 动画完成后检查是否需要触发 reminder（使用 ref 避免闭包陷阱）
        if (!flowerLetterVisibleRef.current && !showReminderRef.current && !flowerPopupVisibleRef.current) {
          tryTriggerReminder('Aware', latestValues.current.awareValue);
          tryTriggerFlowerLetter('Aware', latestValues.current.awareValue);
        }
      }
    ) || undefined;
  }, [valuesUpdateCounter]);

  // ActionValue 动画效果：从 oldValues.current.actionValue 动画到 latestValues.current.actionValue
  useEffect(() => {
    // 创建更新函数：同时更新 ref 和触发重新渲染
    const updateAnimatedValue = (value: number) => {
      animatedValues.current.actionValue = value;
      setAnimatedValuesUpdateCounter(prev => prev + 1);
    };
    return createAnimationEffect(
      oldValues.current.actionValue,
      latestValues.current.actionValue,
      animatedValues.current.actionValue,
      updateAnimatedValue,
      'actionValue',
      () => {
        // 动画完成后将旧值更新为新值
        oldValues.current.actionValue = latestValues.current.actionValue;
        // 动画完成后检查是否需要触发 reminder（使用 ref 避免闭包陷阱）
        if (!flowerLetterVisibleRef.current && !showReminderRef.current && !flowerPopupVisibleRef.current) {
          tryTriggerReminder('Action', latestValues.current.actionValue);
          tryTriggerFlowerLetter('Action', latestValues.current.actionValue);
        }
      }
    ) || undefined;
  }, [valuesUpdateCounter]);

  // 监听flowerLetter关闭，关闭后检查是否有待显示的reminder
  useEffect(() => {
    if (!flowerLetterVisibleRef.current) {
      // 当flowerLetter关闭后，触发一次检查，看是否有待显示的reminder
      // 使用setTimeout确保状态已更新
      setTimeout(() => {
        if (!showReminderRef.current && !flowerLetterVisibleRef.current && !flowerPopupVisibleRef.current) {
          // 重新检查是否需要触发reminder
          if (tryTriggerReminder('Real', latestValues.current.realValue)) return;
          if (tryTriggerReminder('Brave', latestValues.current.braveValue)) return;
          if (tryTriggerReminder('Caring', latestValues.current.caringValue)) return;
          if (tryTriggerReminder('Aware', latestValues.current.awareValue)) return;
          if (tryTriggerReminder('Action', latestValues.current.actionValue)) return;
        }
      }, 100);
    }
  }, [renderTrigger]);

  // 监听flowerPopup关闭，关闭后检查是否有待显示的reminder
  useEffect(() => {
    if (!flowerPopupVisibleRef.current) {
      // 当flowerPopup关闭后，触发一次检查，看是否有待显示的reminder
      // 使用setTimeout确保状态已更新，延迟增加到200ms确保状态同步完成
      setTimeout(() => {
        // 再次确认flowerPopupVisible确实已关闭（使用 ref 避免闭包陷阱）
        if (!showReminderRef.current && !flowerLetterVisibleRef.current) {
          // 重新检查是否需要触发reminder，按顺序检查，找到第一个符合条件的就停止
          if (tryTriggerReminder('Real', latestValues.current.realValue)) return;
          if (tryTriggerReminder('Brave', latestValues.current.braveValue)) return;
          if (tryTriggerReminder('Caring', latestValues.current.caringValue)) return;
          if (tryTriggerReminder('Aware', latestValues.current.awareValue)) return;
          if (tryTriggerReminder('Action', latestValues.current.actionValue)) return;
        }
      }, 200);
    }
  }, [renderTrigger]);

  // 统一监听五种花的数值变化，先尝试阈值提醒（包括100%），100%的letter会在reminder关闭后触发
  // 注意：现在 reminder 会在动画完成后通过 onComplete 回调触发，这里只作为备用检查
  useEffect(() => {
    // 若当前已有任一弹窗，等待关闭再处理（使用 ref 避免闭包陷阱）
    if (flowerLetterVisibleRef.current || showReminderRef.current || flowerPopupVisibleRef.current) return;
    
    // 如果有任何动画正在进行中，不触发 reminder（等待动画完成）
    const hasAnimationInProgress = Object.values(animationInProgressRef.current).some(v => v);
    if (hasAnimationInProgress) return;
    
    // 先尝试reminder（包括100%的情况）
    if (tryTriggerReminder('Real', latestValues.current.realValue)) return;
    if (tryTriggerFlowerLetter('Real', latestValues.current.realValue)) return;

    if (tryTriggerReminder('Brave', latestValues.current.braveValue)) return;
    if (tryTriggerFlowerLetter('Brave', latestValues.current.braveValue)) return;

    if (tryTriggerReminder('Caring', latestValues.current.caringValue)) return;
    if (tryTriggerFlowerLetter('Caring', latestValues.current.caringValue)) return;

    if (tryTriggerReminder('Aware', latestValues.current.awareValue)) return;
    if (tryTriggerFlowerLetter('Aware', latestValues.current.awareValue)) return;

    if (tryTriggerReminder('Action', latestValues.current.actionValue)) return;
    if (tryTriggerFlowerLetter('Action', latestValues.current.actionValue)) return;

  }, [valuesUpdateCounter, renderTrigger]);

  // 打开对应的flowerdetailpopup的辅助函数
  const openFlowerDetailPopup = (kind: 'Real' | 'Brave' | 'Caring' | 'Aware' | 'Action') => {
    const flowerTypeMap: Record<'Real' | 'Brave' | 'Caring' | 'Aware' | 'Action', 'RealFlower' | 'BraveFlower' | 'CaringFlower' | 'AwareFlower' | 'ActionFlower'> = {
      Real: 'RealFlower',
      Brave: 'BraveFlower',
      Caring: 'CaringFlower',
      Aware: 'AwareFlower',
      Action: 'ActionFlower',
    };
    
    const flowerType = flowerTypeMap[kind];
    
    getStorage({
      key: 'FlowerExist',
      success(res) {
        setStorage({
          key: 'FlowerExist',
          data: {
            ...((res.data && typeof res.data === 'object') ? res.data : {}),
            [flowerType]: true
          }
        });
      }
    });
    
    setSelectedFlowerType(flowerType);
    updateFlowerPopupVisible(true);
  };

  // 点击"我知道了"按钮的处理：关闭后打开详情页
  const handleReminderClose = () => {
    const currentKind = reminderKindRef.current;
    const step = currentReminderStepRef.current;
    
    // 如果关闭的是100%的reminder，则触发对应的letter
    if (currentKind && step === 100) {
      updateShowReminder(false);
      reminderKindRef.current = null;
      currentReminderStepRef.current = null;

      // 显示letter
      scheduleFlowerLetter(currentKind);
    } else if (currentKind && step !== 100) {
      // 如果不是100%，先打开对应的flowerdetailpopup（防止在关闭期间触发新的reminder）
      openFlowerDetailPopup(currentKind);
      // 然后关闭reminder
      updateShowReminder(false);
      reminderKindRef.current = null;
      currentReminderStepRef.current = null;
    } else {
      // 没有kind，直接关闭
      updateShowReminder(false);
      reminderKindRef.current = null;
      currentReminderStepRef.current = null;
    }
  };

  // 点击右上角关闭按钮的处理：只关闭，不打开详情页
  const handleReminderCloseButton = () => {
    updateShowReminder(false);
    reminderKindRef.current = null;
    currentReminderStepRef.current = null;
  };
  
  const realPercent = clampPercent(animatedValues.current.realValue);
  const bravePercent = clampPercent(animatedValues.current.braveValue);
  const awarePercent = clampPercent(animatedValues.current.awareValue);
  const actionPercent = clampPercent(animatedValues.current.actionValue);
  const caringPercent = clampPercent(animatedValues.current.caringValue);

  return(
    <>
      <View className={styles.bgimg} style={{backgroundImage: `url(${growBgUrl})`}}>
        {/* 版本号显示 */}
        {VersionExist &&
            <Text className={styles.version}>{Strings.getLang('grow_version_label')}{Version}</Text>
        }
        
        {/* 顶部导航栏 */}
        <View className={styles.navbar}>
          <Button className={styles.nav_back_button} onClick={handleBack}>
            <Image src={returnIcon} className={styles.nav_back_icon} />
          </Button>
          <Text className={styles.nav_title}>{Strings.getLang('home_growth_garden')}</Text>
          <View style={{width: '44px'}}></View>
        </View>

        <View className={styles.FlowerContainer}>

            <View className={styles.box} onClick={OpenRealFlower} style={{backgroundColor:'#ffffff', opacity: 0.7, borderRadius: '15px'}}>
                <Button className={styles.FlowerBtn}>
                    <Image className={styles.FlowerImg} src={RealFlower}></Image>
                </Button>
                <Text className={styles.FlowerName}>{Strings.getLang('grow_flower_real_name')}</Text>
                <Text className={styles.FlowerContent}>{Strings.getLang('grow_flower_real_desc')}</Text>
                <View className={`${styles.FlowerPercent} ${styles.FlowerPercentReal}`}>
                  <View className={styles.FlowerPercentTrack}>
                    <View
                      className={`${styles.FlowerPercentFill} ${styles.FlowerPercentFillReal}`}
                      style={{ 
                        width: `${realPercent}%`,
                        borderTopRightRadius: realPercent >= 100 ? '999px' : '0',
                        borderBottomRightRadius: realPercent >= 100 ? '999px' : '0'
                      }}
                    />
                  </View>
                  <Text className={realPercent === 0 ? styles.FlowerPercentTextLight : styles.FlowerPercentText}>{`${realPercent}%`}</Text>
                </View>
            </View>

            <View className={styles.box} onClick={OpenBraveFlower} style={{backgroundColor:'#ffffff', opacity: 0.7, borderRadius: '15px'}}>
                <Button className={styles.FlowerBtn}>
                    <Image className={styles.FlowerImg} src={BraveFlower}></Image>
                </Button>
                <Text className={styles.FlowerName}>{Strings.getLang('grow_flower_brave_name')}</Text>
                <Text className={styles.FlowerContent}>{Strings.getLang('grow_flower_brave_desc')}</Text>
                <View className={`${styles.FlowerPercent} ${styles.FlowerPercentBrave}`}>
                  <View className={styles.FlowerPercentTrack}>
                    <View
                      className={`${styles.FlowerPercentFill} ${styles.FlowerPercentFillBrave}`}
                      style={{ 
                        width: `${bravePercent}%`,
                        borderTopRightRadius: bravePercent >= 100 ? '999px' : '0',
                        borderBottomRightRadius: bravePercent >= 100 ? '999px' : '0'
                      }}
                    />
                  </View>
                  <Text className={bravePercent === 0 ? styles.FlowerPercentTextLight : styles.FlowerPercentText}>{`${bravePercent}%`}</Text>
                </View>
            </View>

            <View className={styles.box} onClick={OpenAwareFlower} style={{backgroundColor:'#ffffff', opacity: 0.7, borderRadius: '15px'}}>
                <Button className={styles.FlowerBtn}>
                    <Image className={styles.FlowerImg} src={AwareFlower}></Image>
                </Button>
                <Text className={styles.FlowerName}>{Strings.getLang('grow_flower_aware_name')}</Text>
                <Text className={styles.FlowerContent}>{Strings.getLang('grow_flower_aware_desc')}</Text>
                <View className={`${styles.FlowerPercent} ${styles.FlowerPercentAware}`}>
                  <View className={styles.FlowerPercentTrack}>
                    <View
                      className={`${styles.FlowerPercentFill} ${styles.FlowerPercentFillAware}`}
                      style={{ 
                        width: `${awarePercent}%`,
                        borderTopRightRadius: awarePercent >= 100 ? '999px' : '0',
                        borderBottomRightRadius: awarePercent >= 100 ? '999px' : '0'
                      }}
                    />
                  </View>
                  <Text className={awarePercent === 0 ? styles.FlowerPercentTextLight : styles.FlowerPercentText}>{`${awarePercent}%`}</Text>
                </View>
            </View>

            <View className={styles.box} onClick={OpenActionFlower} style={{backgroundColor:'#ffffff', opacity: 0.7, borderRadius: '15px'}}>
                <Button className={styles.FlowerBtn}>
                    <Image className={styles.FlowerImg} src={ActionFlower}></Image>
                </Button>
                <Text className={styles.FlowerName}>{Strings.getLang('grow_flower_action_name')}</Text>
                <Text className={styles.FlowerContent}>{Strings.getLang('grow_flower_action_desc')}</Text>
                <View className={`${styles.FlowerPercent} ${styles.FlowerPercentAction}`}>
                  <View className={styles.FlowerPercentTrack}>
                    <View
                      className={`${styles.FlowerPercentFill} ${styles.FlowerPercentFillAction}`}
                      style={{ 
                        width: `${actionPercent}%`,
                        borderTopRightRadius: actionPercent >= 100 ? '999px' : '0',
                        borderBottomRightRadius: actionPercent >= 100 ? '999px' : '0'
                      }}
                    />
                  </View>
                  <Text className={actionPercent === 0 ? styles.FlowerPercentTextLight : styles.FlowerPercentText}>{`${actionPercent}%`}</Text>
                </View>
            </View>

            <View className={styles.box} onClick={OpenCaringFlower} style={{backgroundColor:'#ffffff', opacity: 0.7, borderRadius: '15px'}}>
                <Button className={styles.FlowerBtn}>
                    <Image className={styles.FlowerImg} src={CaringFlower}></Image>
                </Button>
                <Text className={styles.FlowerName}>{Strings.getLang('grow_flower_caring_name')}</Text>
                <Text className={styles.FlowerContent}>{Strings.getLang('grow_flower_caring_desc')}</Text>
                <View className={`${styles.FlowerPercent} ${styles.FlowerPercentCaring}`}>
                  <View className={styles.FlowerPercentTrack}>
                    <View
                      className={`${styles.FlowerPercentFill} ${styles.FlowerPercentFillCaring}`}
                      style={{ 
                        width: `${caringPercent}%`,
                        borderTopRightRadius: caringPercent >= 100 ? '999px' : '0',
                        borderBottomRightRadius: caringPercent >= 100 ? '999px' : '0'
                      }}
                    />
                  </View>
                  <Text className={caringPercent === 0 ? styles.FlowerPercentTextLight : styles.FlowerPercentText}>{`${caringPercent}%`}</Text>
                </View>
            </View>
        </View>

        <View className={styles.touch} style={{left:'3%',top:'13%'}} onClick={OpenRealFlower}></View>
        <View className={styles.touch} style={{left:'22%',top:'13%'}} onClick={OpenBraveFlower}></View>
        <View className={styles.touch} style={{left:'41%',top:'13%'}} onClick={OpenAwareFlower}></View>
        <View className={styles.touch} style={{left:'60%',top:'13%'}} onClick={OpenActionFlower}></View>
        <View className={styles.touch} style={{left:'79%',top:'13%'}} onClick={OpenCaringFlower}></View>

        <View className={styles.CheckVersion} onTouchStart={startPressTimer} onTouchEnd={cancelPressTimer} onTouchCancel={cancelPressTimer}></View>

        {/* 花朵详情弹窗 */}
        {selectedFlowerType && (
          <FlowerDetailPopup
            visible={flowerPopupVisibleRef.current}
            flowerType={selectedFlowerType}
            flowerValue={
              selectedFlowerType === 'RealFlower' ? latestValues.current.realValue :
              selectedFlowerType === 'BraveFlower' ? latestValues.current.braveValue :
              selectedFlowerType === 'CaringFlower' ? latestValues.current.caringValue :
              selectedFlowerType === 'AwareFlower' ? latestValues.current.awareValue :
              selectedFlowerType === 'ActionFlower' ? latestValues.current.actionValue : 0
            }
            onClose={() => {
              updateFlowerPopupVisible(false);
              setSelectedFlowerType(null);
            }}
          />
        )}
        {showReminderRef.current && (
          <FlowerReminder
            flowerType={reminderKindRef.current ? reminderKindRef.current.toLowerCase() : ''}
            text={reminderTextRef.current}
            onClose={handleReminderClose}
            onCloseButton={handleReminderCloseButton}
          />
        )}
        {flowerLetterVisibleRef.current && (
          <FlowerLetter
            UserName={username}
            flowerType={flowerLetterKindRef.current ? flowerLetterKindRef.current.toLowerCase() : ''}
            text={flowerLetterTextRef.current}
            onClose={() => {
              const currentKind = flowerLetterKindRef.current;
              // 先打开对应的详情页（防止在关闭期间触发新的reminder）
              if (currentKind) {
                openFlowerDetailPopup(currentKind);
              }
              // 然后关闭letter
              updateFlowerLetterVisible(false);
              flowerLetterKindRef.current = null;
              pendingLetterKindRef.current = null;
            }}
            onCloseButton={() => {
              // 点击右上角关闭按钮：只关闭，不打开详情页
              updateFlowerLetterVisible(false);
              flowerLetterKindRef.current = null;
              pendingLetterKindRef.current = null;
            }}
          />
        )}
      </View>
    </>
  );
}