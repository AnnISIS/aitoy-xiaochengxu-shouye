import React, { FC,useState, useRef } from 'react';
import { Text, View,Button,Image,updateAI2AgentVariableAgentVariable,getLaunchOptionsSync } from '@ray-js/ray';
import styles from './index.module.less';
import warning from '../../assets/images/tab/warning.png';
import bgImg from '../../assets/images/tab/rename_popup_background.png';
import closeBtnImg from '../../assets/images/tab/rename_popup_close_button.png';
import editImg from '../../assets/images/tab/rename_popup_edit.png';
import Strings from '@/i18n';

import { Input } from '@ray-js/ray';


export default function Rename_popup(props){ 
  const [inputValue, setInputValue] = useState(props.currentHostName || '');
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const prevInputValueRef = useRef(props.currentHostName || '');

  const MAX_NAME_LENGTH = 6;
  const limitToMaxChars = (text) => Array.from(String(text || '')).slice(0, MAX_NAME_LENGTH).join('');


  const close=()=>{
    props.onClose();
  }

  //重命名球球
  const RenameBallName=(e)=>{
    if(e.detail.value==='')   //至少一个字符
    {
      return;
    }
    const { query: { deviceId } } = getLaunchOptionsSync();
    updateAI2AgentVariableAgentVariable({  
      devId: deviceId,  
      variableMap: {  
        "custom.ballName":e.detail.value,
      }  
    });
  }

  //重命名对主人的称呼
  const RenameHostName=(e)=>{
    if(e.detail.value==='')   //至少一个字符
    {
      return;
    }
    console.log('RenameHostName called', e.detail.value); // 调试输出
    const { query: { deviceId } } = getLaunchOptionsSync();
    updateAI2AgentVariableAgentVariable({  
      devId: deviceId,  
      variableMap: {  
        "custom.call":e.detail.value,
      }  
    });
  }

  const handleInput = e => {
    const value = e.detail.value;
    const prevValue = prevInputValueRef.current;
    // 立即截断到6个字，不允许超过
    const truncatedValue = limitToMaxChars(value);
    const currentLength = Array.from(String(truncatedValue || '')).length;
    const prevLength = Array.from(String(prevValue || '')).length;
    
    // 始终设置为截断后的值，确保不会超过限制
    setInputValue(truncatedValue);
    
    // 检测用户是否尝试输入超过限制：
    // 当输入达到6个字时，显示警告
    if (currentLength >= MAX_NAME_LENGTH) {
      // 如果用户刚刚达到6个字，立即显示警告
      if (prevLength < MAX_NAME_LENGTH) {
        setShowWarning(true);
        setWarningMessage(Strings.getLang('rename_popup_max_length_warning'));
        // 3秒后自动隐藏警告
        setTimeout(() => {
          setShowWarning(false);
          setWarningMessage('');
        }, 3000);
      } else {
        // 如果已经是6个字，保持警告显示（用户可能还在尝试继续输入）
        // 但为了避免警告一直显示，我们只在用户尝试继续输入时短暂显示
        // 由于 maxLength 的限制，当用户尝试输入第7个字符时，onInput 可能不会触发
        // 或者即使触发了，value 也还是只有6个字符
        // 所以这里我们保持警告显示，直到用户删除字符
        if (!showWarning) {
          setShowWarning(true);
          setWarningMessage(Strings.getLang('rename_popup_max_length_warning'));
          // 2秒后自动隐藏警告
          setTimeout(() => {
            setShowWarning(false);
            setWarningMessage('');
          }, 2000);
        }
      }
    } else {
      // 如果长度小于6个字，隐藏警告
      setShowWarning(false);
      setWarningMessage('');
    }
    
    // 更新上一次的值
    prevInputValueRef.current = truncatedValue;
  };

  const handleBlur = e => {
    const value = e.detail.value;
    // 确保值被截断到6个字
    const truncatedValue = limitToMaxChars(value);
    setInputValue(truncatedValue);
    
    // 如果输入被截断了，显示警告
    const originalLength = Array.from(String(value || '')).length;
    if (originalLength > MAX_NAME_LENGTH) {
      setShowWarning(true);
      setWarningMessage(Strings.getLang('rename_popup_max_length_warning'));
    } else {
      setShowWarning(false);
      setWarningMessage('');
      // 只有在值有效时才调用重命名
      if (truncatedValue.trim().length > 0) {
        RenameHostName({ ...e, detail: { ...e.detail, value: truncatedValue } });
      }
    }
    
    // 这里可以调用重命名逻辑
    if (props.onRename) {
      props.onRename(truncatedValue);
    }
  };

  const handleConfirm = () => {
    const value = String(inputValue).trim();
    const valueLen = Array.from(value).length;
    if (valueLen === 0) {
      setShowWarning(true);
      setWarningMessage(Strings.getLang('rename_popup_empty_warning'));
      return;
    }
    if (valueLen > MAX_NAME_LENGTH) {
      setShowWarning(true);
      setWarningMessage(Strings.getLang('rename_popup_max_length_warning'));
      setInputValue(limitToMaxChars(value));
      return;
    }
    const { query: { deviceId } } = getLaunchOptionsSync();
    updateAI2AgentVariableAgentVariable({  
      devId: deviceId,  
      variableMap: {  
        "custom.call": value,
      }  
    });
    setShowWarning(false);
    setWarningMessage('');
    if (props.onConfirm) {
      props.onConfirm(value);
    }
    if (props.onClose) {
      props.onClose();
    }
  };

  return (
    <View className={styles.popupBg}>
      <View className={styles.popupWrapper}>
        <View className={styles.popupContainer}>
          <Image className={styles.backgroundImg} src={bgImg} mode="aspectFit" />
          <Image
            className={styles.closeBtn}
            src={closeBtnImg}
            onClick={props.onClose}
            mode="aspectFit" 
          />
          <View className={styles.descriptionText}>
            <Text className={styles.descLine1}>{Strings.getLang('rename_popup_desc_line1')}</Text>
            <Text className={styles.descLine2}>{Strings.getLang('rename_popup_desc_line2')}</Text>
          </View>
          <View className={styles.inputWrap}>
            <Input
              className={styles.inputBox}
              placeholder={props.currentHostName && String(props.currentHostName).trim().length > 0 ? props.currentHostName : Strings.getLang('rename_popup_placeholder')}
              placeholderStyle="color:#E1B19C;font-family:PingFang SC;font-weight:600;font-size:44px;line-height:100%;letter-spacing:0px;text-align:center;"
              value={inputValue}
              maxLength={MAX_NAME_LENGTH}
              onInput={handleInput}
              onBlur={handleBlur}
              onConfirm={RenameHostName}
              type="text"
            />
          </View>
        </View>
        
      <View className={`${styles.warningBox} ${showWarning ? styles.show : ''}`}>
        <Text>{warningMessage || Strings.getLang('rename_popup_max_length_warning')}</Text>
      </View>
      <View className={styles.actionBar}>
        <Button className={styles.confirmBtn} onClick={handleConfirm}>{Strings.getLang('rename_popup_confirm')}</Button>
      </View>
      </View>
    </View>
  );
}
