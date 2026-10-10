// Edit all texts here. Photos: put image URLs into `photos` (or add them live in the gallery).
export const story = {
  intro: { title: "Sen uchun... yuragimdan bir hikoya ❤️", button: "Sehrli olamga kirish" },
  garden: {
    first: "Balki ko‘nglingni og‘ritgandirman...",
    lines: [
      "Agar seni xafa qilgan bo‘lsam, meni kechir.",
      "Men uchun hislaring muhim.",
      "Seni tinglashga va xatolarimni amalda tuzatishga tayyorman.",
    ],
  },
  gallery: {
    caption: "Eng chiroyli lahzalar katta narsalarda emas, qalbimizda qolgan kichkina xotiralarda.",
    photos: [] as string[],
    captions: ["Birinchi tabassum", "Birga yurgan yo‘l", "Kechki osmon", "Kulgilar", "Jim lahzalar", "Bizning qo‘shiq", "Kelajak"],
  },
  heart: {
    title: "Bu yurakda senga aytilmagan gaplar bor...",
    button: "Yuragimdagi gaplarni och",
    message:
      "Men xatolarimni oqlamoqchi emasman. Seni tushunishni, tinglashni va ishonchingni amallarim bilan qozonishni istayman.",
  },
  letter: {
    hint: "Konvertni och",
    paragraphs: [
      "Men seni xafa qilishni istamagandim. Lekin niyatim qanday bo‘lganidan qat’i nazar, hislaringni ham tushunishim muhim.",
      "Agar seni tinglamay qo‘ygan bo‘lsam yoki ko‘nglingni og‘ritgan bo‘lsam, chin yurakdan kechir.",
      "Men hamma narsani bir zumda o‘zgartira olmasligimni bilaman. Lekin xatolarimni tan olishga va ularni tuzatishga tayyorman.",
      "Senga bosim o‘tkazmoqchi emasman. Shunchaki sen men uchun qadrli ekaningni bilishingni istadim.",
      "Agar tayyor bo‘lsang, bir-birimizni xotirjam tinglashdan boshlasak. ❤️",
    ],
    signature: "Samimiyat bilan...",
  },
  sky: {
    lines: [
      "Ba'zi insonlar biz uchun oddiy inson bo‘lib qolmaydi...",
      "Ularning tabassumi, xotirjamligi va qalbi biz uchun muhim bo‘lib qoladi.",
    ],
  },
  final: {
    question: "Menga bir imkon berasanmi? ❤️",
    subtitle: "Shoshilmaymiz. Men seni tinglashga va hislaringni hurmat qilishga tayyorman.",
    yes: "Gaplashib ko‘ramiz ❤️",
    time: "Menga biroz vaqt kerak 🌷",
    yesReply: "Rahmat, meni tinglashga tayyor bo‘lganing uchun. Keling, bir-birimizni xotirjam tinglaylik. ❤️",
    timeReply: "Tushunaman. O‘zingga kerakli vaqtni ol. Hislaringni hurmat qilaman. 🌷",
  },
};

export const SCENES = ["intro", "garden", "gallery", "heart", "letter", "sky", "final"] as const;
export type SceneId = (typeof SCENES)[number];
export const SCENE_LABELS: Record<SceneId, string> = {
  intro: "Boshlanish", garden: "Atirgullar", gallery: "Xotiralar", heart: "Yurak",
  letter: "Maktub", sky: "Osmon", final: "Savol",
};
