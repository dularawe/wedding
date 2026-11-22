// Text used by the AR bubbles and the guest page, in English, Sinhala and Tamil.
export const LANGS = { en: 'English', si: 'සිංහල', ta: 'தமிழ்', zh: '中文', hi: 'हिन्दी', ko: '한국어', es: 'Español', fr: 'Français' };

export const T = {
  en: {
    dear: n => `Dear ${n},`, hi: 'Hello everyone!', married: 'We are getting married!',
    joinOn: 'Join us on', at: l => `${l} at`, ceremonyAt: 'Ceremony at', tba: 'To be announced',
    venue: 'Venue', seeYou: 'See you there!', tapRsvp: 'Tap RSVP to reply',
    invited: 'You are invited', open: 'Open invitation', toOurWedding: 'to our wedding',
    seeAR: 'See us in your room', arHint: 'Tap the button, point your camera at the floor or a table. Pinch to resize.',
    noAR: 'Open this link on your phone to place us in your room with AR.', drag: 'Drag to look around',
    days: 'days', hours: 'hours', togo: 'to go', married2: 'Just married!',
    rsvp: 'RSVP', location: 'Location', whatsapp: 'WhatsApp', calendar: 'Calendar',
    rsvpTitle: 'Will you join us?', yourName: 'Your name', attending: 'Joyfully accept', notAttending: 'Sadly decline',
    guests: 'Number of guests', wishes: 'Wishes for the couple (optional)', send: 'Send reply',
    thanksYes: n => `Thank you${n ? ', ' + n : ''}! We can't wait to celebrate with you.`,
    thanksNo: n => `Thank you${n ? ', ' + n : ''}. We'll miss you!`, edit: 'Change reply',
    replyBy: d => `Kindly reply by ${d}`, loading: 'Preparing your invitation…', events: 'The day',
    sentWa: 'Your reply opened in WhatsApp. Please press send there.', nameNeeded: 'Please enter your name.',
    notFound: 'This invitation link is not valid. Please ask the couple for a new link.'
  },
  si: {
    dear: n => `ආදරණීය ${n},`, hi: 'ඔබ සැමට ආයුබෝවන්!', married: 'අපි විවාහ වෙනවා!',
    joinOn: 'අප සමඟ එක්වන්න', at: l => `${l}`, ceremonyAt: 'මංගල චාරිත්‍ර', tba: 'පසුව දැනුම් දෙනු ඇත',
    venue: 'ස්ථානය', seeYou: 'එදා හමුවෙමු!', tapRsvp: 'පිළිතුරු දීමට RSVP ඔබන්න',
    invited: 'ඔබට ආරාධනා කරමු', open: 'ආරාධනාව විවෘත කරන්න', toOurWedding: 'අපගේ මංගල්‍යයට',
    seeAR: 'අපව ඔබේ කාමරයේ බලන්න', arHint: 'බොත්තම ඔබා කැමරාව බිම හෝ මේසයක් දෙසට යොමු කරන්න.',
    noAR: 'AR හරහා බැලීමට මෙම සබැඳිය ඔබේ දුරකථනයෙන් විවෘත කරන්න.', drag: 'වටේට බැලීමට අදින්න',
    days: 'දින', hours: 'පැය', togo: 'ඉතිරියි', married2: 'විවාහ වූහ!',
    rsvp: 'RSVP', location: 'ස්ථානය', whatsapp: 'WhatsApp', calendar: 'දින දර්ශනය',
    rsvpTitle: 'ඔබ අප සමඟ එක්වනවාද?', yourName: 'ඔබගේ නම', attending: 'සතුටින් පැමිණෙමි', notAttending: 'කණගාටුයි, නොපැමිණෙමි',
    guests: 'අමුත්තන් ගණන', wishes: 'සුබ පැතුම් (අත්‍යවශ්‍ය නැත)', send: 'පිළිතුර යවන්න',
    thanksYes: n => `ස්තූතියි${n ? ' ' + n : ''}! ඔබ සමඟ සැමරීමට අපි බලාපොරොත්තු වෙමු.`,
    thanksNo: n => `ස්තූතියි${n ? ' ' + n : ''}. අපට ඔබව මග හැරෙනු ඇත!`, edit: 'පිළිතුර වෙනස් කරන්න',
    replyBy: d => `කරුණාකර ${d} ට පෙර පිළිතුරු දෙන්න`, loading: 'ඔබේ ආරාධනාව සූදානම් වෙමින්…', events: 'මංගල දිනය',
    sentWa: 'ඔබේ පිළිතුර WhatsApp හි විවෘත විය. එහි send ඔබන්න.', nameNeeded: 'කරුණාකර ඔබගේ නම ඇතුළත් කරන්න.',
    notFound: 'මෙම සබැඳිය වලංගු නැත. නව සබැඳියක් ඉල්ලන්න.'
  },
  ta: {
    dear: n => `அன்புள்ள ${n},`, hi: 'அனைவருக்கும் வணக்கம்!', married: 'எங்களுக்கு திருமணம்!',
    joinOn: 'எங்களுடன் இணையுங்கள்', at: l => `${l}`, ceremonyAt: 'திருமண விழா', tba: 'பின்னர் அறிவிக்கப்படும்',
    venue: 'இடம்', seeYou: 'அங்கே சந்திப்போம்!', tapRsvp: 'பதிலளிக்க RSVP அழுத்தவும்',
    invited: 'உங்களை அன்புடன் அழைக்கிறோம்', open: 'அழைப்பிதழைத் திறக்கவும்', toOurWedding: 'எங்கள் திருமணத்திற்கு',
    seeAR: 'உங்கள் அறையில் எங்களைப் பாருங்கள்', arHint: 'பொத்தானை அழுத்தி, கேமராவை தரை அல்லது மேசையை நோக்கி காட்டவும்.',
    noAR: 'AR இல் பார்க்க இந்த இணைப்பை உங்கள் தொலைபேசியில் திறக்கவும்.', drag: 'சுற்றிப் பார்க்க இழுக்கவும்',
    days: 'நாட்கள்', hours: 'மணி', togo: 'உள்ளன', married2: 'திருமணம் நடந்தது!',
    rsvp: 'RSVP', location: 'இடம்', whatsapp: 'WhatsApp', calendar: 'நாட்காட்டி',
    rsvpTitle: 'நீங்கள் வருவீர்களா?', yourName: 'உங்கள் பெயர்', attending: 'மகிழ்ச்சியுடன் வருகிறேன்', notAttending: 'வர இயலாது',
    guests: 'விருந்தினர் எண்ணிக்கை', wishes: 'வாழ்த்துகள் (விருப்பம்)', send: 'பதில் அனுப்பு',
    thanksYes: n => `நன்றி${n ? ' ' + n : ''}! உங்களுடன் கொண்டாட காத்திருக்கிறோம்.`,
    thanksNo: n => `நன்றி${n ? ' ' + n : ''}. உங்களை மிஸ் செய்வோம்!`, edit: 'பதிலை மாற்று',
    replyBy: d => `${d} க்குள் பதிலளிக்கவும்`, loading: 'உங்கள் அழைப்பிதழ் தயாராகிறது…', events: 'திருமண நாள்',
    sentWa: 'உங்கள் பதில் WhatsApp இல் திறந்தது. அங்கே send அழுத்தவும்.', nameNeeded: 'உங்கள் பெயரை உள்ளிடவும்.',
    notFound: 'இந்த இணைப்பு செல்லாது. புதிய இணைப்பைக் கேளுங்கள்.'
  }
};

Object.assign(T, {
  zh: {
    dear: n => `亲爱的${n}，`, hi: '大家好！', married: '我们要结婚啦！',
    joinOn: '诚邀您参加', at: l => `${l}`, ceremonyAt: '婚礼仪式', tba: '稍后公布',
    venue: '地点', seeYou: '不见不散！', tapRsvp: '点击 RSVP 回复',
    invited: '诚挚邀请您', open: '打开请柬', toOurWedding: '参加我们的婚礼',
    seeAR: '在您的房间里看我们', arHint: '点击按钮，将相机对准地面或桌面。双指缩放大小。',
    noAR: '请用手机打开此链接，通过 AR 把我们放进您的房间。', drag: '拖动以环顾四周',
    days: '天', hours: '小时', togo: '倒计时', married2: '新婚快乐！',
    rsvp: 'RSVP', location: '位置', whatsapp: 'WhatsApp', calendar: '日历',
    rsvpTitle: '您会来吗？', yourName: '您的姓名', attending: '欣然出席', notAttending: '遗憾缺席',
    guests: '出席人数', wishes: '给新人的祝福（可选）', send: '发送回复',
    thanksYes: n => `谢谢${n ? '，' + n : ''}！期待与您共庆。`,
    thanksNo: n => `谢谢${n ? '，' + n : ''}。我们会想念您！`, edit: '修改回复',
    replyBy: d => `请于 ${d} 前回复`, loading: '正在准备您的请柬…', events: '婚礼流程',
    sentWa: '您的回复已在 WhatsApp 中打开，请点击发送。', nameNeeded: '请输入您的姓名。',
    notFound: '此请柬链接无效，请向新人索取新链接。'
  },
  hi: {
    dear: n => `प्रिय ${n},`, hi: 'आप सभी को नमस्ते!', married: 'हमारी शादी हो रही है!',
    joinOn: 'हमारे साथ शामिल हों', at: l => `${l}`, ceremonyAt: 'विवाह समारोह', tba: 'जल्द घोषित होगा',
    venue: 'स्थान', seeYou: 'वहीं मिलते हैं!', tapRsvp: 'जवाब के लिए RSVP दबाएँ',
    invited: 'आप सादर आमंत्रित हैं', open: 'निमंत्रण खोलें', toOurWedding: 'हमारी शादी में',
    seeAR: 'हमें अपने कमरे में देखें', arHint: 'बटन दबाएँ और कैमरा फ़र्श या मेज़ की ओर करें। आकार बदलने के लिए पिंच करें।',
    noAR: 'AR में देखने के लिए यह लिंक अपने फ़ोन पर खोलें।', drag: 'घुमाकर देखने के लिए खींचें',
    days: 'दिन', hours: 'घंटे', togo: 'बाकी', married2: 'शादी हो गई!',
    rsvp: 'RSVP', location: 'स्थान', whatsapp: 'WhatsApp', calendar: 'कैलेंडर',
    rsvpTitle: 'क्या आप आएँगे?', yourName: 'आपका नाम', attending: 'ज़रूर आऊँगा/आऊँगी', notAttending: 'नहीं आ पाऊँगा/पाऊँगी',
    guests: 'मेहमानों की संख्या', wishes: 'जोड़े के लिए शुभकामनाएँ (वैकल्पिक)', send: 'जवाब भेजें',
    thanksYes: n => `धन्यवाद${n ? ' ' + n : ''}! आपके साथ जश्न मनाने का इंतज़ार है।`,
    thanksNo: n => `धन्यवाद${n ? ' ' + n : ''}। हम आपको याद करेंगे!`, edit: 'जवाब बदलें',
    replyBy: d => `कृपया ${d} तक जवाब दें`, loading: 'आपका निमंत्रण तैयार हो रहा है…', events: 'कार्यक्रम',
    sentWa: 'आपका जवाब WhatsApp में खुल गया है। वहाँ send दबाएँ।', nameNeeded: 'कृपया अपना नाम लिखें।',
    notFound: 'यह निमंत्रण लिंक मान्य नहीं है। कृपया नया लिंक माँगें।'
  },
  ko: {
    dear: n => `${n}님께,`, hi: '안녕하세요, 여러분!', married: '저희 결혼합니다!',
    joinOn: '함께해 주세요', at: l => `${l}`, ceremonyAt: '예식', tba: '추후 안내',
    venue: '장소', seeYou: '그날 만나요!', tapRsvp: 'RSVP를 눌러 답해 주세요',
    invited: '소중한 분을 초대합니다', open: '청첩장 열기', toOurWedding: '저희 결혼식에',
    seeAR: '내 방에서 저희를 만나보세요', arHint: '버튼을 누르고 카메라를 바닥이나 테이블에 비춰 주세요. 두 손가락으로 크기를 조절하세요.',
    noAR: 'AR로 보려면 휴대폰에서 이 링크를 열어 주세요.', drag: '드래그해서 둘러보기',
    days: '일', hours: '시간', togo: '남음', married2: '결혼했어요!',
    rsvp: 'RSVP', location: '위치', whatsapp: 'WhatsApp', calendar: '캘린더',
    rsvpTitle: '참석하시나요?', yourName: '성함', attending: '기쁘게 참석합니다', notAttending: '아쉽지만 불참합니다',
    guests: '참석 인원', wishes: '축하 메시지 (선택)', send: '답장 보내기',
    thanksYes: n => `감사합니다${n ? ', ' + n + '님' : ''}! 함께 축하해 주세요.`,
    thanksNo: n => `감사합니다${n ? ', ' + n + '님' : ''}. 보고 싶을 거예요!`, edit: '답장 수정',
    replyBy: d => `${d}까지 답해 주세요`, loading: '청첩장을 준비하고 있어요…', events: '예식 순서',
    sentWa: '답장이 WhatsApp에서 열렸어요. 전송을 눌러 주세요.', nameNeeded: '성함을 입력해 주세요.',
    notFound: '유효하지 않은 링크입니다. 새 링크를 요청해 주세요.'
  },
  es: {
    dear: n => `Querido/a ${n}:`, hi: '¡Hola a todos!', married: '¡Nos casamos!',
    joinOn: 'Acompáñanos el', at: l => `${l} a las`, ceremonyAt: 'Ceremonia a las', tba: 'Por confirmar',
    venue: 'Lugar', seeYou: '¡Te esperamos!', tapRsvp: 'Pulsa RSVP para responder',
    invited: 'Estás invitado/a', open: 'Abrir invitación', toOurWedding: 'a nuestra boda',
    seeAR: 'Míranos en tu habitación', arHint: 'Pulsa el botón y apunta la cámara al suelo o a una mesa. Pellizca para cambiar el tamaño.',
    noAR: 'Abre este enlace en tu móvil para vernos en realidad aumentada.', drag: 'Arrastra para mirar alrededor',
    days: 'días', hours: 'horas', togo: 'restantes', married2: '¡Recién casados!',
    rsvp: 'RSVP', location: 'Ubicación', whatsapp: 'WhatsApp', calendar: 'Calendario',
    rsvpTitle: '¿Nos acompañas?', yourName: 'Tu nombre', attending: 'Asistiré con alegría', notAttending: 'No podré asistir',
    guests: 'Número de invitados', wishes: 'Buenos deseos para la pareja (opcional)', send: 'Enviar respuesta',
    thanksYes: n => `¡Gracias${n ? ', ' + n : ''}! Estamos deseando celebrarlo contigo.`,
    thanksNo: n => `Gracias${n ? ', ' + n : ''}. ¡Te echaremos de menos!`, edit: 'Cambiar respuesta',
    replyBy: d => `Por favor, responde antes del ${d}`, loading: 'Preparando tu invitación…', events: 'El gran día',
    sentWa: 'Tu respuesta se abrió en WhatsApp. Pulsa enviar allí.', nameNeeded: 'Escribe tu nombre, por favor.',
    notFound: 'Este enlace no es válido. Pide uno nuevo a la pareja.'
  },
  fr: {
    dear: n => `Cher/Chère ${n},`, hi: 'Bonjour à tous !', married: 'Nous nous marions !',
    joinOn: 'Rejoignez-nous le', at: l => `${l} à`, ceremonyAt: 'Cérémonie à', tba: 'À confirmer',
    venue: 'Lieu', seeYou: 'À très bientôt !', tapRsvp: 'Touchez RSVP pour répondre',
    invited: 'Vous êtes invité(e)', open: "Ouvrir l'invitation", toOurWedding: 'à notre mariage',
    seeAR: 'Voyez-nous chez vous', arHint: 'Touchez le bouton et pointez la caméra vers le sol ou une table. Pincez pour redimensionner.',
    noAR: 'Ouvrez ce lien sur votre téléphone pour nous voir en réalité augmentée.', drag: 'Faites glisser pour tourner autour',
    days: 'jours', hours: 'heures', togo: 'restantes', married2: 'Jeunes mariés !',
    rsvp: 'RSVP', location: 'Lieu', whatsapp: 'WhatsApp', calendar: 'Agenda',
    rsvpTitle: 'Serez-vous des nôtres ?', yourName: 'Votre nom', attending: 'Avec joie', notAttending: 'Malheureusement non',
    guests: 'Nombre de personnes', wishes: 'Un mot pour les mariés (facultatif)', send: 'Envoyer la réponse',
    thanksYes: n => `Merci${n ? ', ' + n : ''} ! Nous avons hâte de fêter ça avec vous.`,
    thanksNo: n => `Merci${n ? ', ' + n : ''}. Vous nous manquerez !`, edit: 'Modifier la réponse',
    replyBy: d => `Merci de répondre avant le ${d}`, loading: 'Préparation de votre invitation…', events: 'Le programme',
    sentWa: 'Votre réponse est ouverte dans WhatsApp. Appuyez sur envoyer.', nameNeeded: 'Veuillez indiquer votre nom.',
    notFound: "Ce lien d'invitation n'est pas valide. Demandez-en un nouveau."
  }
});

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  si: ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'],
  ta: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
  hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
};
const DAYS = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  si: ['ඉරිදා', 'සඳුදා', 'අඟහරුවාදා', 'බදාදා', 'බ්‍රහස්පතින්දා', 'සිකුරාදා', 'සෙනසුරාදා'],
  ta: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
  zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
  ko: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
};
const parse = iso => { const [y, m, d] = String(iso).split('-').map(Number); return { y, m, d, wd: new Date(y, m - 1, d).getDay() }; };
export function longDate(iso, lang = 'en') {
  if (!iso) return '';
  const { y, m, d } = parse(iso);
  if (lang === 'zh') return `${y}年${m}月${d}日`;
  if (lang === 'ko') return `${y}년 ${m}월 ${d}일`;
  const mo = (MONTHS[lang] || MONTHS.en)[m - 1];
  if (lang === 'si') return `${y} ${mo} ${d}`;
  if (lang === 'es') return `${d} de ${mo} de ${y}`;
  return `${d} ${mo} ${y}`;
}
export function weekday(iso, lang = 'en') { if (!iso) return ''; return (DAYS[lang] || DAYS.en)[parse(iso).wd]; }
