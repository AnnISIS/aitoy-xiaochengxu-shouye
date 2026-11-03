import { getCdnUrl } from 'ray'
import cdnImage from '../../cdn/cdnImage.json'
import Strings from '@/i18n'

const CardFenBG = getCdnUrl('card_fen_bg.png', cdnImage)
const CardHuangBG = getCdnUrl('card_huang_bg.png', cdnImage)
const CardLanBG = getCdnUrl('card_lan_bg.png', cdnImage)
const CardLvBG = getCdnUrl('card_lv_bg.png', cdnImage)
const CardQingBG = getCdnUrl('card_qing_bg.png', cdnImage)
const CardZiBG = getCdnUrl('card_zi_bg.png', cdnImage)
const CardJuBG = getCdnUrl('card_ju_bg.png', cdnImage)

const shareBgImageUrlJu = getCdnUrl('ju_qrcode_bg.png', cdnImage)
const shareBgImageUrlLv = getCdnUrl('lv_qrcode_bg.png', cdnImage)
const shareBgImageUrlZi = getCdnUrl('zi_qrcode_bg.png', cdnImage)
const shareBgImageUrlFen = getCdnUrl('fen_qrcode_bg.png', cdnImage)
const shareBgImageUrlLan = getCdnUrl('lan_qrcode_bg.png', cdnImage)
const shareBgImageUrlQing = getCdnUrl('qing_qrcode_bg.png', cdnImage)
const shareBgImageUrlHuang = getCdnUrl('huang_qrcode_bg.png', cdnImage)

export const dayColorMap = {
    0: { // Sunday
        emojiId: 'huang',
        color: '#FFE6AA',
        colorNameKey: 'color_name_huang',
        bgImage: CardHuangBG,
        shareBgImage: shareBgImageUrlHuang
    },
    1: { // Monday
        emojiId: 'lv',
        color: '#CCE0BA',
        colorNameKey: 'color_name_lv',
        bgImage: CardLvBG,
        shareBgImage: shareBgImageUrlLv
    },
    2: { // Tuesday
        emojiId: 'lan',
        color: '#BDD8E5',
        colorNameKey: 'color_name_lan',
        bgImage: CardLanBG,
        shareBgImage: shareBgImageUrlLan
    },
    3: { // Wednesday
        emojiId: 'ju',
        color: '#F9CEA7',
        colorNameKey: 'color_name_ju',
        bgImage: CardJuBG,
        shareBgImage: shareBgImageUrlJu
    },
    4: { // Thursday
        emojiId: 'qing',
        color: '#BBE4D8',
        colorNameKey: 'color_name_qing',
        bgImage: CardQingBG,
        shareBgImage: shareBgImageUrlQing
    },
    5: { // Friday
        emojiId: 'fen',
        color: '#FBDBE0',
        colorNameKey: 'color_name_fen',
        bgImage: CardFenBG,
        shareBgImage: shareBgImageUrlFen
    },
    6: { // Saturday
        emojiId: 'zi',
        color: '#E0BFE3',
        colorNameKey: 'color_name_zi',
        bgImage: CardZiBG,
        shareBgImage: shareBgImageUrlZi
    }
};

// Helper function to get localized color name
export const getColorName = (dayIndex: number): string => {
    const colorConfig = dayColorMap[dayIndex];
    return colorConfig ? Strings.getLang(colorConfig.colorNameKey as any) : '';
};