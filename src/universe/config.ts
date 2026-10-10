// Edit all texts here. Photos: put image URLs into `photos` (or add them live in the gallery).
export const story = {
  name: "Parizoda",
  intro: {
    title: "Parizodam... sen uchun yuragimdan bir hikoya ✨",
    subtitle: "Koinotdagi har bir yulduz va gulbarg faqat senga atalgan...",
    button: "Sehrli olamga kirish ✨",
  },
  garden: {
    first: "Parizoda, balki bilmasdan ko‘nglingni og‘ritgandirman...",
    lines: [
      "Mening hayotimdagi eng go‘zal mo‘jiza — bu sening borliging.",
      "Agar seni xafa qilgan bo‘lsam, butun qalbim bilan kechirim so‘rayman.",
      "Sening xotirjamliging va tabassuming men uchun butun dunyodan qadrli.",
      "Seni har doim tinglashga, ardoqlashga va xatolarimni amalda tuzatishga tayyorman.",
    ],
  },
  gallery: {
    caption: "Eng qadrli lahzalar — bu sen bilan o‘tgan har bir soniya, Parizodam.",
    photos: [
      "/pari/photo_2026-10-10_22-43-13.jpg",
      "/pari/video_2026-10-10_22-42-40.mp4",
      "/pari/photo_2026-10-10_22-43-19.jpg",
      "/pari/video_2026-10-10_22-43-21.mp4",
      "/pari/video_2026-10-10_22-43-25.mp4",
      "/pari/video_2026-10-10_22-43-28.mp4",
      "/pari/video_2026-10-10_22-43-30.mp4",
    ],
    captions: [
      "Parizodam bilan ilk tabassum 🌸",
      "Ko‘zlaringdagi bepoyon sehr ✨",
      "Birga bosib o‘tgan yo‘llarimiz 🌹",
      "Eng samimiy kulgularimiz 💫",
      "Qalblarimiz gaplashgan onlar 🌙",
      "Bizning sevimli taronamiz 🎶",
      "Bizning porloq kelajagimiz 💖",
    ],
  },
  heart: {
    title: "Bu yurakda faqat sen borsan, Parizodam...",
    button: "Yuragimdagi gaplarni och 💌",
    message:
      "Parizoda, men xatolarimni oqlamoqchi emasman. Seni chin dildan tushunishni, har bir lahzada asrashni va ishonchingni amallarim bilan qozonishni istayman. Sening tabassuming — mening hayotim mazmuni.",
  },
  letter: {
    hint: "Parizodaga atalgan maktubni oching ✉",
    salutation: "Mening eng aziz va sevikli Parizodam...",
    paragraphs: [
      "Bu maktubni qalbimning eng to‘ridagi samimiy va sof tuyg‘ularim bilan yozyapman. Hayotimga kirib kelganingdan beri butun olamim yorishdi, har bir soniyam o‘zgacha ma’no va baxtga to‘ldi.",
      "Balki qachondir bilmasdan yoki tushunmay ko‘nglingga ozor yetkazgandirman, ko‘zlaringga ma’yuslik soya solgandirman... Agar shunday bo‘lgan bo‘lsa, meni chin yurakdan kechirgin, sevgilim. Sening ko‘zlaringdagi ma’yuslikni ko‘rish — men uchun eng katta azob.",
      "Men sening har bir tabassumingni, samimiy kulgingni va beg‘ubor qalbingni butun dunyodan qizg‘onaman va cheksiz ardoqlayman. Sening baxting va xotirjamliging — mening eng oliy maqsadim.",
      "Bilgin, qanday kunlar bo‘lmasin, men har doim yoningdaman. Seni tushunishga, qo‘llaringdan tutishga va cheksiz muhabbatim bilan ardoqlashga va’da beraman.",
      "Sen mening hayotimdagi eng go‘zal va yagona mo‘jizasan. Seni bor vujudim bilan, jonimdan ortiq sevaman... ❤️",
    ],
    signature: "Cheksiz muhabbat va sadoqat bilan, sening sevgiling ✨",
  },
  sky: {
    lines: [
      "Osmondagi millionlab yulduzlar ichida eng yorug‘i — sening ko‘zlaring, Parizoda...",
      "Hatto cheksiz koinot ham sening go‘zalliging va samimiyating oldida lol qoladi.",
      "Sen mening hayotimdagi eng yorqin, eng aziz yulduzimsan ✨",
    ],
  },
  final: {
    question: "Parizodam, meni sevasanmi? ❤️",
    subtitle: "Yuragingdagi eng samimiy javobni ayt...",
    yes: "Ha, sizni sevaman ❤️",
    no: "Yo‘q, sevmayman 🙈",
    yesReply: "Men ham sizni dunyolardan ortiq sevaman, Parizodam! 💖💍 Har bir nafasimda siz borsiz, bir umr birga bo‘lamiz! ✨",
    errors: [
      "❌ Xatolik 404: Bu javob tizimda mavjud emas! 😜",
      "⚠️ Tizim xatoligi: Yurak bunga ruxsat bermaydi! Faqat «Ha» deyish mumkin! 😂",
      "🏃‍♂️ Tugma qochib ketdi! Sevmaslikning aslo iloji yo‘q! 🥰",
      "🚫 Ruxsat berilmadi: Parizoda faqat sevishi mumkin! ❤️",
      "💖 Xatolik: Urinib ko‘rmang, faqat «Ha, sizni sevaman» ishlaydi! 🙈",
    ],
  },
};

export const SCENES = ["intro", "garden", "gallery", "heart", "letter", "sky", "final"] as const;
export type SceneId = (typeof SCENES)[number];
export const SCENE_LABELS: Record<SceneId, string> = {
  intro: "Boshlanish",
  garden: "Atirgullar",
  gallery: "Xotiralar",
  heart: "Yurak",
  letter: "Maktub",
  sky: "Osmon",
  final: "Savol",
};
