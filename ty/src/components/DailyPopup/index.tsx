import React, { FC, useState, useEffect } from 'react';
import { Text, View, Button, Image, usePageEvent, share, getImageInfo } from '@ray-js/ray';
import styles from './index.module.less';
import share_img from '../../assets/images/tab/share.png'
// import Welcome from '../../assets/images/tab/welcome.gif'
import save from '../../assets/images/tab/save.png'
import wechat from '../../assets/images/tab/wechat.png'
import { dayColorMap } from '@/constant/dayColorMap';
import CloseImg from '../../assets/images/tab/close.png'
import logo from '../../assets/images/tab/logo.png'
import qrCode from '../../assets/images/tab/qr_code.png'
import { Lunar } from 'lunar-javascript'
import { getCdnUrl } from 'ray'
import cdnImage from '@/../cdn/cdnImage.json'
import Strings from '@/i18n'
export default function FirstRenamePopup(props) {
  // const [ShowGif, setShowGif] = useState(props.fireworks);
  const [showWish, setShowWish] = useState(props.wishExist);
  const [ShareBtn, setShareBtn] = useState(true);
  const wishBg = getCdnUrl('wish.png', cdnImage)
  const [showPopup, setShowPopup] = useState(!props.wishExist);
  // console.log('showWish', showWish)
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setShowGif(false);
  //   }, 3000);
  //   return () => clearTimeout(timer);
  // }, []);


  const close = () => {
    props.onClose();
  }

  const today = new Date();
  const lunar = Lunar.fromDate(new Date());
  //设置天数
  const Day = today.getDate();
  //设置月份
  const monthIndex = today.getMonth() + 1;
  const Month = Strings.getLang(`daily_popup_month_${monthIndex}` as any);
  //设置星期几
  const Weeks = ['日', '一', '二', '三', '四', '五', '六'];
  const Week = Weeks[today.getDay()];
  //设置农历月份
  const LunarMonth = lunar.getMonthInChinese();
  //设置农历日
  const LunarDay = lunar.getDayInChinese();
  //设置农历字样
  const [LunarDate, setLunarDate] = useState('');
  useEffect(() => {
    if (lunar.getFestivals().length !== 0) {
      setLunarDate(lunar.getFestivals()[0]);
    } else if (lunar.getJieQi()) { // 注意：getJieQi() 返回的是字符串或null，没有length属性
      setLunarDate(lunar.getJieQi());
    } else {
      setLunarDate(`${Strings.getLang('daily_popup_lunar_prefix')}${LunarMonth}月${LunarDay}`);
    }
  }, []);

  const [snapshotWrapper, setSnapshotWrapper] = useState(null);

  //设置分享按钮是否存在
  const [Share_containerExist, setShare_containerExist] = useState(false);
  const OpenShare = () => {
    setShare_containerExist(true);
    setShareBtn(false);
  }



  //保存卡片到手机本地
  const Save = () => {
    const wrapper = createSnapshotWrapper();
    setSnapshotWrapper(wrapper);
    setTimeout(() => {
      ty.snapshot({
        selector: '#snapshot-temp',
        success: function (res1) {
          console.log('ty.snapshot', res1);
          const { tempImagePath } = res1;
          console.log('tempImagePath', tempImagePath);
          ty.showModal({
            title: Strings.getLang('daily_popup_save_to_album'),
            content: Strings.getLang('daily_popup_save_confirm_content'),
            cancelText: Strings.getLang('cancel'),
            confirmText: Strings.getLang('confirm'),
            success({ confirm }) {
              if (confirm) {
                ty.authorize({
                  scope: 'scope.writePhotosAlbum', //  保存到相册权限
                  success() {
                    ty.saveImageToPhotosAlbum({ // 保存到相册
                      filePath: tempImagePath,
                      success(res4) {
                        console.log('saveImageToPhotosAlbum', res4);
                        ty.showToast({
                          title: Strings.getLang('daily_popup_save_success'),
                        });
                      },
                      fail(res5) {
                        ty.showToast({
                          title: Strings.getLang('daily_popup_save_failed'),
                        });
                        console.log('saveImageToPhotosAlbum', res5);
                      },
                    });
                  },
                  fail(err) {
                    console.log(err);
                    ty.showToast({
                      title: Strings.getLang('daily_popup_auth_failed'),
                    });
                  },
                });
              }
            },
          });
        },
        fail: function (res) {
          console.log('ty.snapshot', res);
        },
      });
    }, 100);
  }

  //转发卡片给微信好友
  const ShareToWechatFriend = () => {
    const wrapper = createSnapshotWrapper();
    setSnapshotWrapper(wrapper);
    setTimeout(() => {
      ty.snapshot({
        selector: '#snapshot-temp',
        success: function (res1) {
          const { tempImagePath } = res1;
          console.log('tempImagePath', tempImagePath);
          getImageInfo({
            src: tempImagePath as unknown as string,
            success(res2: any) {
              console.log('res2', res2);
              const resolvedPath = (res2 && (res2.path || res2.tempFilePath)) || tempImagePath;
              console.log('resolvedPath', resolvedPath)
              share({
                type: 'WeChat',
                title: Strings.getLang('daily_popup_share_image'),
                message: Strings.getLang('daily_popup_test_image'),
                imagePath: resolvedPath,
                contentType: 'image',
                success: (res) => {
                  console.log('Share success:', res);
                },
                fail(res) {
                  console.log('Share failed:', res);
                }
              });
            },
            fail(res3) {
              console.log('res3', res3);
            }
          })
        },
      })
    }, 100);
  }

  const createSnapshotWrapper = () => {
    return (
      <View className={styles.snapshotWrapper} id="snapshot-temp"
        style={{
          backgroundImage: `url(${dayColorMap[today.getDay()].shareBgImage})`,
        }}
      >
        <View
          className={styles.container}
          style={{
            backgroundImage: `url(${dayColorMap[today.getDay()].bgImage})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        >
          <View className={styles.FirstLineContainer}>
            <Text className={styles.MonthFont}>{Month}</Text>
            <Text className={styles.Lunar}>{LunarDate}</Text>
            <Text className={styles.DayFont}>{Day}{Strings.getLang('daily_popup_day_suffix')}</Text>
          </View>

          <View className={styles.ContentContainer}>
            {props.text1.length <= 4 ? (
              // 中文模式：4个字符，使用弧形布局
              <View className={styles.curvedTextMethod1}>
                <Text className={`${styles.char} ${styles.char1}`}>{props.text1[0]}</Text>
                <Text className={`${styles.char} ${styles.char2}`}>{props.text1[1]}</Text>
                <Text className={`${styles.char} ${styles.char3}`}>{props.text1[2]}</Text>
                <Text className={`${styles.char} ${styles.char4}`}>{props.text1[3]}</Text>
              </View>
            ) : (
              // 英文模式：多个单词，使用普通布局
              <Text className={styles.content1English}>{props.text1}</Text>
            )}
          </View>

          <View className={styles.ContentContainer2}>
            <Text className={styles.content2}>{props.text2Part1}</Text>
            <Text className={styles.content2}>{props.text2Part2}</Text>
          </View>

          <View className={styles.ContentContainer3}>
            <Text className={styles.ColorFont}>{Strings.getLang('daily_popup_chinese_traditional_color')}\u00A0<Text className={styles.dot}>•</Text>\u00A0{props.text3}</Text>
          </View>
        </View>
        <View className={styles.qrCodeContainer}>
          <Image src={qrCode} className={styles.qrCodeImg}></Image>
        </View>
      </View>
    );
  };

  return (
    <>
      <View className={styles.bg}>

        {showPopup && (
          <>
            <View
              className={styles.container}
              style={{
                backgroundImage: `url(${dayColorMap[props.dayindex].bgImage})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}
              id='card'
            >
              <View className={styles.FirstLineContainer}>
                <Text className={styles.MonthFont}>{Month}</Text>
                <Text className={styles.Lunar}>{LunarDate}</Text>
                <Text className={styles.DayFont}>{Day}{Strings.getLang('daily_popup_day_suffix')}</Text>
              </View>

              <View className={styles.ContentContainer}>
                {props.text1.length <= 4 ? (
                  // 中文模式：4个字符，使用弧形布局
                  <View className={styles.curvedTextMethod1}>
                    <Text className={`${styles.char} ${styles.char1}`}>{props.text1[0]}</Text>
                    <Text className={`${styles.char} ${styles.char2}`}>{props.text1[1]}</Text>
                    <Text className={`${styles.char} ${styles.char3}`}>{props.text1[2]}</Text>
                    <Text className={`${styles.char} ${styles.char4}`}>{props.text1[3]}</Text>
                  </View>
                ) : (
                  // 英文模式：多个单词，使用普通布局
                  <Text className={styles.content1English}>{props.text1}</Text>
                )}
              </View>
              <View className={styles.ContentContainer2}>
                <Text className={styles.content2}>{props.text2Part1}</Text>
                <Text className={styles.content2}>{props.text2Part2}</Text>
              </View>
              <View className={styles.ContentContainer3}>
                <Text className={styles.ColorFont}>{Strings.getLang('daily_popup_chinese_traditional_color')}\u00A0<Text className={styles.dot}>•</Text>\u00A0{props.text3}</Text>
              </View>

              {/* {!ShowGif &&  */}
              {ShareBtn &&
                <View className={styles.shareContainer}>
                  <Button className={styles.Share_btn} onClick={OpenShare}>
                    <Image src={share_img} className={styles.Share_img}></Image>
                  </Button>
                  <Text className={styles.ShareFont}>{Strings.getLang('daily_popup_share_to_friends')}</Text>
                </View>
              }

              {Share_containerExist &&
                <View className={styles.shareContainer2}>
                  <View className={styles.SaveContainer}>
                    <Button className={styles.SaveBtn} onClick={Save}>
                      <Image className={styles.SaveImg} src={save}></Image>
                    </Button>
                    <Text className={styles.Font}>{Strings.getLang('daily_popup_save')}</Text>
                  </View>

                  <View className={styles.WeChatContainer}>
                    <Button className={styles.WechatBtn} onClick={ShareToWechatFriend}>
                      <Image className={styles.WechatImg} src={wechat}></Image>
                    </Button>
                    <Text className={styles.Font}>{Strings.getLang('daily_popup_wechat')}</Text>
                  </View>
                </View>}
            </View>
            <View className={styles.CloseContainer}>
              <Button className={styles.close_btn} onClick={close}>
                <Image src={CloseImg} className={styles.close_img}></Image>
              </Button>
            </View>
          </>
        )}

        {/* { !ShowGif && ShareBtn &&
              <Button className={styles.Share_btn} onClick={OpenShare}>
              <Image src={share_img} className={styles.Share_img}></Image>
            </Button>} 在2.0需求里，去除了烟花效果*/}

        {/* {ShowGif &&
          <Image src={Welcome} className={styles.Welcome_gif}></Image>} */}

        {showWish &&
          <View className={styles.wishPopup}
            style={{
              backgroundImage: `url(${wishBg})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}
          >
            <Image src={CloseImg} className={styles.wishCloseBtn} onClick={() => {
              setShowWish(false);
              close();
            }
            }></Image>
            <Text className={styles.wishInstruction}>{Strings.getLang('daily_popup_wish_instruction')}</Text>
            <Button className={styles.wishButton} onClick={() => {
              setShowWish(false);
              setShowPopup(true);
              props.onWishButtonClick && props.onWishButtonClick();
            }}
              style={{
                backgroundColor: '#FFADDE',
                borderRadius: '48px',

              }}
            >
              <Text className={styles.wishButtonText}>{Strings.getLang('daily_popup_wish_button')}</Text>
            </Button>
          </View>
        }
      </View>
      {snapshotWrapper}
    </>
  );

}

