import type { Question } from '../types/game.ts';

// 300 verified bilingual unique questions:
// (general: 100 comprehensive general knowledge questions,
//  islamic: 100 comprehensive Prophets/Quran/Wives questions,
//  cinema [Egyptian & Turkish movies & TV series]: 100)
export const QUESTIONS_BANK_SIGNATURE = '8133c1eca51c';

const Q_CHUNK_0: Question[] = [
  {
    "id": "q_gen_1",
    "level": 1,
    "category": "general",
    "topic": "geography",
    "questionAr": "ما هي أكبر قارات العالم من حيث المساحة وعدد السكان؟",
    "questionEn": "Which continent is the largest in the world by both land area and population?",
    "optionsAr": [
      "قارة أوروبا",
      "قارة آسيا",
      "أمريكا الشمالية",
      "قارة أفريقيا"
    ],
    "optionsEn": [
      "Europe",
      "Asia",
      "North America",
      "Africa"
    ],
    "correctIndex": 1,
    "explanationAr": "تمتد قارة آسيا على نحو 44.5 مليون كيلومتر مربع وتضم أكثر من نصف سكان العالم.",
    "explanationEn": "Asia covers roughly 44.5 million sq km and holds over half of the global population."
  },
  {
    "id": "q_gen_2",
    "level": 1,
    "category": "general",
    "topic": "geography",
    "questionAr": "ما هو أكبر محيط على سطح الكرة الأرضية من حيث المساحة؟",
    "questionEn": "Which ocean is the largest and deepest on Earth?",
    "optionsAr": [
      "المحيط الأطلسي",
      "المحيط الهادئ",
      "المحيط الهندي",
      "المحيط المتجمد الشمالي"
    ],
    "optionsEn": [
      "The Atlantic Ocean",
      "The Pacific Ocean",
      "The Indian Ocean",
      "The Arctic Ocean"
    ],
    "correctIndex": 1,
    "explanationAr": "يغطي المحيط الهادئ قرابة ثلث سطح كوكب الأرض ويضم خندق ماريانا الأعمق عالمياً.",
    "explanationEn": "The Pacific Ocean covers nearly a third of Earth’s surface and contains the Mariana Trench."
  },
  {
    "id": "q_gen_3",
    "level": 2,
    "category": "general",
    "topic": "geography",
    "questionAr": "ما هو أطول نهر في قارة أفريقيا والعالم؟",
    "questionEn": "Which river is widely recognized as the longest in Africa and the world?",
    "optionsAr": [
      "نهر الراين",
      "نهر دجلة",
      "نهر النيل",
      "نهر الدانوب"
    ],
    "optionsEn": [
      "The Rhine River",
      "The Tigris River",
      "The Nile River",
      "The Danube River"
    ],
    "correctIndex": 2,
    "explanationAr": "يمتد نهر النيل لأكثر من 6,650 كيلومتراً مخترقاً إحدى عشرة دولة أفريقية حتى مصبه في المتوسط.",
    "explanationEn": "The Nile stretches over 6,650 km across eleven African countries into the Mediterranean."
  },
  {
    "id": "q_gen_4",
    "level": 2,
    "category": "general",
    "topic": "geography",
    "questionAr": "ما هي أكبر صحراء حارة على وجه الأرض؟",
    "questionEn": "What is the largest hot desert on Earth?",
    "optionsAr": [
      "صحراء أتاكاما",
      "صحراء كالاهاري",
      "صحراء غوبي",
      "الصحراء الكبرى في شمال أفريقيا"
    ],
    "optionsEn": [
      "The Atacama Desert",
      "The Kalahari Desert",
      "The Gobi Desert",
      "The Sahara Desert"
    ],
    "correctIndex": 3,
    "explanationAr": "تغطي الصحراء الكبرى نحو 9.2 ملايين كيلومتر مربع عبر شمال قارة أفريقيا.",
    "explanationEn": "The Sahara spans approximately 9.2 million sq km across northern Africa."
  },
  {
    "id": "q_gen_5",
    "level": 3,
    "category": "general",
    "topic": "geography",
    "questionAr": "ما هي أعلى قمة جبلية على سطح الأرض فوق مستوى سطح البحر؟",
    "questionEn": "What is the highest mountain peak on Earth above sea level?",
    "optionsAr": [
      "قمة كيليمنجارو",
      "قمة مون بلان",
      "قمة أكونكاغوا",
      "قمة إيفرست (8,848 متراً)"
    ],
    "optionsEn": [
      "Mount Kilimanjaro",
      "Mont Blanc",
      "Mount Aconcagua",
      "Mount Everest (8,848 m)"
    ],
    "correctIndex": 3,
    "explanationAr": "تقع قمة إيفرست في سلسلة جبال الهيمالايا على الحدود بين نيبال والتبت.",
    "explanationEn": "Mount Everest rises in the Himalayas along the border between Nepal and Tibet."
  },
  {
    "id": "q_gen_6",
    "level": 3,
    "category": "general",
    "topic": "geography",
    "questionAr": "ما اسم المضيق البحري الذي يربط البحر الأبيض المتوسط بالمحيط الأطلسي؟",
    "questionEn": "Which strait connects the Mediterranean Sea directly to the Atlantic Ocean?",
    "optionsAr": [
      "مضيق جبل طارق",
      "مضيق باب المندب",
      "مضيق هرمز",
      "مضيق البوسفور"
    ],
    "optionsEn": [
      "Strait of Gibraltar",
      "Bab el-Mandeb Strait",
      "Strait of Hormuz",
      "Bosphorus Strait"
    ],
    "correctIndex": 0,
    "explanationAr": "يفصل مضيق جبل طارق بين إسبانيا شمالاً والمغرب جنوباً بعرض لا يتجاوز 14 كيلومتراً.",
    "explanationEn": "The Strait of Gibraltar separates Spain and Morocco at a narrow 14 km gap."
  },
  {
    "id": "q_gen_7",
    "level": 4,
    "category": "general",
    "topic": "geography",
    "questionAr": "ما هي أكبر جزيرة في العالم من غير القارات؟",
    "questionEn": "Which island is the largest non-continental island on Earth?",
    "optionsAr": [
      "جزيرة أيسلندا",
      "جزيرة غرينلاند",
      "جزيرة سريلانكا",
      "جزيرة مدغشقر"
    ],
    "optionsEn": [
      "Iceland",
      "Greenland",
      "Sri Lanka",
      "Madagascar"
    ],
    "correctIndex": 1,
    "explanationAr": "تبلغ مساحة غرينلاند أكثر من 2.16 مليون كيلومتر مربع وتقع بين المحيطين الأطلسي والمتجمد الشمالي.",
    "explanationEn": "Greenland spans over 2.16 million sq km between the North Atlantic and Arctic oceans."
  },
  {
    "id": "q_gen_8",
    "level": 4,
    "category": "general",
    "topic": "geography",
    "questionAr": "ما هي عاصمة أستراليا الرسمية؟",
    "questionEn": "What is the official capital city of Australia?",
    "optionsAr": [
      "كانبرا",
      "سيدني",
      "ملبورن",
      "بيرث"
    ],
    "optionsEn": [
      "Canberra",
      "Sydney",
      "Melbourne",
      "Perth"
    ],
    "correctIndex": 0,
    "explanationAr": "اختيرت كانبرا عام 1908 حلاً وسطاً بين مدينتي سيدني وملبورن لتكون عاصمة البلاد.",
    "explanationEn": "Canberra was chosen in 1908 as Australia’s compromise capital between Sydney and Melbourne."
  },
  {
    "id": "q_gen_9",
    "level": 5,
    "category": "general",
    "topic": "geography",
    "questionAr": "ما هي أصغر دولة مستقلة في العالم من حيث المساحة؟",
    "questionEn": "Which is the smallest sovereign country in the world by land area?",
    "optionsAr": [
      "دولة الفاتيكان",
      "مالطا",
      "إمارة موناكو",
      "سان مارينو"
    ],
    "optionsEn": [
      "Vatican City",
      "Malta",
      "Monaco",
      "San Marino"
    ],
    "correctIndex": 0,
    "explanationAr": "تبلغ مساحة الفاتيكان نحو 0.49 كيلومتر مربع فقط وتقع داخل مدينة روما.",
    "explanationEn": "Vatican City covers roughly 0.49 sq km completely enclaved within Rome."
  },
  {
    "id": "q_gen_10",
    "level": 5,
    "category": "general",
    "topic": "geography",
    "questionAr": "ما اسم أطول سلسلة جبال قارية في العالم التي تمتد على طول الساحل الغربي لأمريكا الجنوبية؟",
    "questionEn": "What is the longest continental mountain range in the world, stretching down South America?",
    "optionsAr": [
      "جبال روكي",
      "جبال القوقاز",
      "جبال الأنديز",
      "جبال الألب"
    ],
    "optionsEn": [
      "The Rocky Mountains",
      "The Caucasus",
      "The Andes Mountains",
      "The Alps"
    ],
    "correctIndex": 2,
    "explanationAr": "تمتد جبال الأنديز مسافة تقارب 7,000 كيلومتر عبر سبع دول في أمريكا الجنوبية.",
    "explanationEn": "The Andes run roughly 7,000 km along the western spine of South America."
  },
  {
    "id": "q_gen_11",
    "level": 6,
    "category": "general",
    "topic": "geography",
    "questionAr": "أي مدينة كبرى يمر عبرها خط الطول الرئيسي صفر (خط غرينتش)؟",
    "questionEn": "Through which major world capital does the Prime Meridian (0° longitude) pass?",
    "optionsAr": [
      "لندن",
      "باريس",
      "برلين",
      "مدريد"
    ],
    "optionsEn": [
      "London",
      "Paris",
      "Berlin",
      "Madrid"
    ],
    "correctIndex": 0,
    "explanationAr": "يمر خط الطول الرئيسي عبر المرصد الملكي في حي غرينتش بالعاصمة البريطانية لندن.",
    "explanationEn": "The Prime Meridian passes through the Royal Observatory in Greenwich, London."
  },
  {
    "id": "q_gen_12",
    "level": 7,
    "category": "general",
    "topic": "geography",
    "questionAr": "ما اسم أكبر بحيرة مغلقة (بحر داخلي) في العالم من حيث المساحة؟",
    "questionEn": "What is the largest inland body of water (closed sea/lake) on Earth by surface area?",
    "optionsAr": [
      "البحر الميت",
      "بحيرة فيكتوريا",
      "بحيرة سوبيريور",
      "بحر قزوين"
    ],
    "optionsEn": [
      "The Dead Sea",
      "Lake Victoria",
      "Lake Superior",
      "The Caspian Sea"
    ],
    "correctIndex": 3,
    "explanationAr": "يمتد بحر قزوين على مساحة تقارب 371 ألف كيلومتر مربع بين أوروبا وآسيا.",
    "explanationEn": "The Caspian Sea spans roughly 371,000 sq km between Europe and Asia."
  },
  {
    "id": "q_gen_13",
    "level": 8,
    "category": "general",
    "topic": "geography",
    "questionAr": "في أي دولة تقع شلالات «أنجل» التي تُعد أعلى شلالات مياه متصلة في العالم؟",
    "questionEn": "In which country are Angel Falls, the world’s highest uninterrupted waterfall, located?",
    "optionsAr": [
      "كندا",
      "النرويج",
      "البرازيل",
      "فنزويلا"
    ],
    "optionsEn": [
      "Canada",
      "Norway",
      "Brazil",
      "Venezuela"
    ],
    "correctIndex": 3,
    "explanationAr": "تسقط مياه شلالات أنجل في حديقة كانيما الوطنية بفنزويلا من ارتفاع 979 متراً.",
    "explanationEn": "Angel Falls plunges 979 meters inside Venezuela’s Canaima National Park."
  },
  {
    "id": "q_gen_14",
    "level": 6,
    "category": "general",
    "topic": "geography",
    "questionAr": "ما اسم الدولة العربية التي تقع في قارتين هما أفريقيا وآسيا عبر شبه جزيرة سيناء؟",
    "questionEn": "Which Arab country spans both Africa and Asia across the Sinai Peninsula?",
    "optionsAr": [
      "مصر",
      "المغرب",
      "السودان",
      "الجزائر"
    ],
    "optionsEn": [
      "Egypt",
      "Morocco",
      "Sudan",
      "Algeria"
    ],
    "correctIndex": 0,
    "explanationAr": "تقع معظم أراضي مصر في شمال شرق أفريقيا بينما تقع شبه جزيرة سيناء في قارة آسيا.",
    "explanationEn": "Most of Egypt lies in northeastern Africa while the Sinai Peninsula extends into Asia."
  },
  {
    "id": "q_gen_15",
    "level": 7,
    "category": "general",
    "topic": "geography",
    "questionAr": "ما هما القناتان المائيتان الأشهر اللتان تربطان التجارة العالمية بين المحيطات؛ إحداهما في مصر والأخرى في أمريكا الوسطى؟",
    "questionEn": "Which vital Central American canal connects the Atlantic Ocean to the Pacific Ocean?",
    "optionsAr": [
      "قناة بنما",
      "قناة كورينث",
      "قناة السويس",
      "قناة كيل"
    ],
    "optionsEn": [
      "The Panama Canal",
      "The Corinth Canal",
      "The Suez Canal",
      "The Kiel Canal"
    ],
    "correctIndex": 0,
    "explanationAr": "تختصر قناة بنما آلاف الكيلومترات على السفن العابرة بين المحيطين الأطلسي والهادئ منذ عام 1914.",
    "explanationEn": "Opened in 1914, the Panama Canal connects the Atlantic and Pacific Oceans across Panama."
  },
  {
    "id": "q_gen_16",
    "level": 2,
    "category": "general",
    "topic": "history",
    "questionAr": "ما اسم الحضارة القديمة التي نشأت في بلاد ما بين النهرين وابتكرت الكتابة المسمارية؟",
    "questionEn": "Which ancient Mesopotamian civilization invented cuneiform script?",
    "optionsAr": [
      "الحضارة الفارسية",
      "الحضارة السومرية",
      "حضارة الإنكا",
      "الحضارة الإغريقية"
    ],
    "optionsEn": [
      "Persian civilization",
      "The Sumerian civilization",
      "Inca civilization",
      "Greek civilization"
    ],
    "correctIndex": 1,
    "explanationAr": "اخترع السومريون الكتابة المسمارية على ألواح الطين نحو عام 3200 قبل الميلاد في جنوب العراق.",
    "explanationEn": "The Sumerians developed cuneiform writing on clay tablets around 3200 BCE."
  },
  {
    "id": "q_gen_17",
    "level": 1,
    "category": "general",
    "topic": "history",
    "questionAr": "أي هرم من أهرامات الجيزة في مصر يُعد الأكبر والأطول ولا يزال قائماً من عجائب الدنيا السبع القديمة؟",
    "questionEn": "Which Egyptian pyramid is the largest at Giza and the only surviving Ancient Wonder of the World?",
    "optionsAr": [
      "هرم منقرع",
      "هرم زوسر",
      "هرم خوفو الأكبر",
      "معبد أبو سمبل"
    ],
    "optionsEn": [
      "Pyramid of Menkaure",
      "Pyramid of Djoser",
      "The Great Pyramid of Khufu",
      "Abu Simbel Temple"
    ],
    "correctIndex": 2,
    "explanationAr": "بُني هرم الملك خوفو في عهد الأسرة الرابعة نحو عام 2560 قبل الميلاد بارتفاع قارب 146 متراً.",
    "explanationEn": "Built for Pharaoh Khufu around 2560 BCE, it originally stood about 146 meters tall."
  },
  {
    "id": "q_gen_18",
    "level": 3,
    "category": "general",
    "topic": "history",
    "questionAr": "ما اسم الحجر الأثري الذي عُثر عليه في مصر عام 1799 وأسهم في فك رموز الكتابة الهيروغليفية؟",
    "questionEn": "Which inscribed stone discovered in Egypt in 1799 unlocked the decipherment of hieroglyphs?",
    "optionsAr": [
      "بردية إيبرس",
      "لوح حمورابي",
      "مسلة ميشع",
      "حجر رشيد"
    ],
    "optionsEn": [
      "Ebers Papyrus",
      "Stele of Hammurabi",
      "Mesha Stele",
      "The Rosetta Stone"
    ],
    "correctIndex": 3,
    "explanationAr": "احتوى حجر رشيد على نص بثلاث كتابات مما مكن جان فرانسوا شامبليون من حل لغز الهيروغليفية عام 1822.",
    "explanationEn": "Featuring three scripts, the Rosetta Stone enabled Jean-François Champollion to decode hieroglyphs in 1822."
  },
  {
    "id": "q_gen_19",
    "level": 4,
    "category": "general",
    "topic": "history",
    "questionAr": "من هو مؤسس إمبراطورية المغول التي امتدت عبر أوراسيا في القرن الثالث عشر الميلادي؟",
    "questionEn": "Who united the nomadic tribes to found the vast Mongol Empire in the 13th century?",
    "optionsAr": [
      "أكبر الأعظم",
      "قوبلاي خان",
      "جنكيز خان",
      "تيمورلنك"
    ],
    "optionsEn": [
      "Akbar the Great",
      "Kublai Khan",
      "Genghis Khan",
      "Timur"
    ],
    "correctIndex": 2,
    "explanationAr": "وحد تيموجين (جنكيز خان) القبائل المنغولية عام 1206 وأسس أكبر إمبراطورية متصلة في التاريخ.",
    "explanationEn": "Born Temüjin, Genghis Khan united the Mongol tribes in 1206 and forged the largest contiguous empire."
  },
  {
    "id": "q_gen_20",
    "level": 4,
    "category": "general",
    "topic": "history",
    "questionAr": "في أي عام تمكن رائد الفضاء نيل أرمسترونغ من السير على سطح القمر لأول مرة في التاريخ؟",
    "questionEn": "In which year did astronaut Neil Armstrong become the first human to walk on the Moon?",
    "optionsAr": [
      "عام 1957م",
      "عام 1969م",
      "عام 1975م",
      "عام 1981م"
    ],
    "optionsEn": [
      "1957",
      "1969",
      "1975",
      "1981"
    ],
    "correctIndex": 1,
    "explanationAr": "هبطت مركبة أبولو 11 على سطح القمر في 20 يوليو 1969م.",
    "explanationEn": "Apollo 11 landed on the Moon on July 20, 1969."
  },
  {
    "id": "q_gen_21",
    "level": 5,
    "category": "general",
    "topic": "history",
    "questionAr": "ما اسم الطريق التجاري التاريخي القديم الذي ربط بين الصين ودول حوض البحر الأبيض المتوسط؟",
    "questionEn": "What was the ancient network of trade routes linking China with the Mediterranean world?",
    "optionsAr": [
      "طريق التوابل البحري فقط",
      "طريق الحرير",
      "طريق البخور الجنوبي",
      "طريق العنبر البلطيقي"
    ],
    "optionsEn": [
      "The Spice Sea Lane only",
      "The Silk Road",
      "The Southern Incense Route",
      "The Baltic Amber Road"
    ],
    "correctIndex": 1,
    "explanationAr": "شكّل طريق الحرير شرياناً تجارياً وثقافياً بين شرق آسيا وغربها لقرون طويلة.",
    "explanationEn": "The Silk Road connected East Asia and the Mediterranean for over a millennium."
  },
  {
    "id": "q_gen_22",
    "level": 5,
    "category": "general",
    "topic": "history",
    "questionAr": "في أي دولة أوروبية انطلقت شرارة الثورة الصناعية الأولى في القرن الثامن عشر؟",
    "questionEn": "In which European nation did the First Industrial Revolution begin in the 18th century?",
    "optionsAr": [
      "ألمانيا",
      "إيطاليا",
      "فرنسا",
      "بريطانيا (إنجلترا)"
    ],
    "optionsEn": [
      "Germany",
      "Italy",
      "France",
      "Great Britain"
    ],
    "correctIndex": 3,
    "explanationAr": "بدأت الثورة الصناعية في بريطانيا قرابة عام 1760 بفضل الفحم والمحرك البخاري وصناعة النسيج.",
    "explanationEn": "The Industrial Revolution began in Great Britain around 1760 with steam power and mechanized textiles."
  },
  {
    "id": "q_gen_23",
    "level": 6,
    "category": "general",
    "topic": "history",
    "questionAr": "من الرحالة والمستكشف البرتغالي الذي قاد أول بعثة بدأت رحلة الإبحار للدوران حول الكرة الأرضية عام 1519؟",
    "questionEn": "Which Portuguese explorer organized and led the 1519 expedition that achieved the first circumnavigation of Earth?",
    "optionsAr": [
      "فاسكو دا غاما",
      "كريستوفر كولومبوس",
      "جيمس كوك",
      "فرديناند ماجلان"
    ],
    "optionsEn": [
      "Vasco da Gama",
      "Christopher Columbus",
      "James Cook",
      "Ferdinand Magellan"
    ],
    "correctIndex": 3,
    "explanationAr": "انطلق ماجلان عام 1519، وبعد وفاته في الفلبين أكمل خوان سباستيان إلكانو الرحلة عائداً إلى إسبانيا.",
    "explanationEn": "Magellan launched the expedition in 1519, and Juan Sebastián Elcano completed the return voyage in 1522."
  },
  {
    "id": "q_gen_24",
    "level": 6,
    "category": "general",
    "topic": "history",
    "questionAr": "ما اسم القصر الأبيض الضخم المصنوع من الرخام في مدينة أغرا الهندية والذي بُني في القرن السابع عشر؟",
    "questionEn": "What is the iconic 17th-century ivory-white marble mausoleum located in Agra, India?",
    "optionsAr": [
      "أنغكور وات",
      "قصر الحمراء",
      "تاج محل",
      "قلعة بعلبك"
    ],
    "optionsEn": [
      "Angkor Wat",
      "Alhambra Palace",
      "The Taj Mahal",
      "Baalbek Citadel"
    ],
    "correctIndex": 2,
    "explanationAr": "أمر الإمبراطور المغولي شاه جهان ببناء تاج محل على ضفة نهر يمونا سنة 1632.",
    "explanationEn": "Commissioned by Mughal Emperor Shah Jahan in 1632, the Taj Mahal stands along the Yamuna River."
  },
  {
    "id": "q_gen_25",
    "level": 7,
    "category": "general",
    "topic": "history",
    "questionAr": "في أي مدينة أثرية وردية اللون نحت الأنباط واجهاتهم الصخرية المدهشة جنوب الأردن؟",
    "questionEn": "Which ancient Nabataean capital in southern Jordan is carved directly into rose-red sandstone cliffs?",
    "optionsAr": [
      "بابل",
      "قرطاج",
      "تدمر",
      "البتراء"
    ],
    "optionsEn": [
      "Babylon",
      "Carthage",
      "Palmyra",
      "Petra"
    ],
    "correctIndex": 3,
    "explanationAr": "كانت البتراء عاصمة مملكة الأنباط المزدهرة بالتجارة نحو القرن الرابع قبل الميلاد.",
    "explanationEn": "Petra served as the thriving capital of the Nabataean Kingdom around the 4th century BCE."
  },
  {
    "id": "q_gen_26",
    "level": 8,
    "category": "general",
    "topic": "history",
    "questionAr": "ما اسم العصر التاريخي الأوروبي الذي ازدهرت فيه الفنون والعلوم في القرنين الخامس عشر والسادس عشر انطلاقاً من إيطاليا؟",
    "questionEn": "What name is given to the European period of artistic and scientific revival starting in Italy in the 14th–16th centuries?",
    "optionsAr": [
      "العصر الفيكتوري",
      "عصر النهضة (الرينيسانس)",
      "العصر الجليدي",
      "العصر البرونزي"
    ],
    "optionsEn": [
      "The Victorian Era",
      "The Renaissance",
      "The Ice Age",
      "The Bronze Age"
    ],
    "correctIndex": 1,
    "explanationAr": "بدأ عصر النهضة في مدن إيطاليا مثل فلورنسا وأسهم في تطور العمارة والعلوم الطبيعية.",
    "explanationEn": "Originating in Italian cities like Florence, the Renaissance sparked major cultural and scientific progress."
  },
  {
    "id": "q_gen_27",
    "level": 7,
    "category": "general",
    "topic": "history",
    "questionAr": "ما اسم السفينة العملاقة التي غرقت في المحيط الأطلسي الشمالي في أبريل 1912 بعد اصطدامها بجبل جليدي؟",
    "questionEn": "What was the name of the famous ocean liner that sank in the North Atlantic in April 1912 after striking an iceberg?",
    "optionsAr": [
      "آر إم إس تيتانيك",
      "سانتا ماريا",
      "لوسيتانيا",
      "كوين ماري"
    ],
    "optionsEn": [
      "RMS Titanic",
      "Santa Maria",
      "RMS Lusitania",
      "Queen Mary"
    ],
    "correctIndex": 0,
    "explanationAr": "غرقت سفينة تيتانيك في رحلتها الأولى بين ساوثهامبتون ونيويورك ليلة 14–15 أبريل 1912.",
    "explanationEn": "RMS Titanic sank during her maiden voyage from Southampton to New York City in April 1912."
  },
  {
    "id": "q_gen_28",
    "level": 8,
    "category": "general",
    "topic": "history",
    "questionAr": "في أي عام سقط جدار برلين الذي كان يقسم المدينة منذ عام 1961؟",
    "questionEn": "In which year did the Berlin Wall fall, reuniting East and West Berlin?",
    "optionsAr": [
      "عام 1995م",
      "عام 1989م",
      "عام 1968م",
      "عام 1979م"
    ],
    "optionsEn": [
      "1995",
      "1989",
      "1968",
      "1979"
    ],
    "correctIndex": 1,
    "explanationAr": "شهد التاسع من نوفمبر 1989 سقوط جدار برلين ليمهد لتوحيد ألمانيا في العام التالي.",
    "explanationEn": "The Berlin Wall fell on November 9, 1989, paving the way for German reunification."
  },
  {
    "id": "q_gen_29",
    "level": 9,
    "category": "general",
    "topic": "history",
    "questionAr": "ما اسم الألواح الطينية والقانون الحجري الشهير الذي وضعه ملك بابل القديمة في القرن الثامن عشر قبل الميلاد؟",
    "questionEn": "What is the famous ancient Babylonian legal code carved onto a black stone stele in the 18th century BCE?",
    "optionsAr": [
      "ألواح إبلا",
      "قوانين دراكون",
      "الماغنا كارتا",
      "شريعة حمورابي"
    ],
    "optionsEn": [
      "Tablets of Ebla",
      "Laws of Draco",
      "Magna Carta",
      "The Code of Hammurabi"
    ],
    "correctIndex": 3,
    "explanationAr": "تضم مسلة حمورابي 282 مادة قانونية مدونة بالخط المسماري وتُعرض في متحف اللوفر.",
    "explanationEn": "Comprising 282 laws inscribed in Akkadian cuneiform, the Code of Hammurabi is preserved at the Louvre."
  },
  {
    "id": "q_gen_30",
    "level": 1,
    "category": "general",
    "topic": "science",
    "questionAr": "ما هو الغاز الأكثر وفرةً في الغلاف الجوي لكوكب الأرض بنسبة تقارب 78%؟",
    "questionEn": "Which gas makes up approximately 78% of Earth’s atmosphere?",
    "optionsAr": [
      "الهيليوم",
      "النيتروجين",
      "الأكسجين",
      "ثاني أكسيد الكربون"
    ],
    "optionsEn": [
      "Helium",
      "Nitrogen",
      "Oxygen",
      "Carbon dioxide"
    ],
    "correctIndex": 1,
    "explanationAr": "يشكل النيتروجين نحو 78% من الهواء الجوي والأكسجين نحو 21%، والنسبة الباقية غازات أخرى.",
    "explanationEn": "Earth’s air is about 78% nitrogen, 21% oxygen, and 1% argon and other trace gases."
  },
  {
    "id": "q_gen_31",
    "level": 1,
    "category": "general",
    "topic": "science",
    "questionAr": "ما هي الصيغة الكيميائية لجزيء الماء النقي؟",
    "questionEn": "What is the chemical formula of pure water?",
    "optionsAr": [
      "NaCl",
      "O₃",
      "H₂O",
      "CO₂"
    ],
    "optionsEn": [
      "NaCl",
      "O₃",
      "H₂O",
      "CO₂"
    ],
    "correctIndex": 2,
    "explanationAr": "يتكون جزيء الماء من ذرتي هيدروجين مرتبطتين بذرة أكسجين واحدة.",
    "explanationEn": "A water molecule consists of two hydrogen atoms covalently bonded to one oxygen atom."
  },
  {
    "id": "q_gen_32",
    "level": 2,
    "category": "general",
    "topic": "science",
    "questionAr": "كم عدد العظام في جسم الإنسان البالغ؟",
    "questionEn": "How many bones are in a typical adult human skeleton?",
    "optionsAr": [
      "180 عظمة",
      "250 عظمة",
      "312 عظمة",
      "206 عظمات"
    ],
    "optionsEn": [
      "180 bones",
      "250 bones",
      "312 bones",
      "206 bones"
    ],
    "correctIndex": 3,
    "explanationAr": "يولد الطفل بأكثر من 270 عظمة تلتحم تدريجياً لتصبح 206 عظمات عند البلوغ.",
    "explanationEn": "Humans are born with around 270 bones that gradually fuse into 206 bones by adulthood."
  },
  {
    "id": "q_gen_33",
    "level": 2,
    "category": "general",
    "topic": "science",
    "questionAr": "ما هو أكبر كوكب في مجموعتنا الشمسية من حيث الحجم والكتلة؟",
    "questionEn": "Which is the largest planet in our Solar System by both diameter and mass?",
    "optionsAr": [
      "كوكب المشتري",
      "كوكب نبتون",
      "كوكب زحل",
      "كوكب المريخ"
    ],
    "optionsEn": [
      "Jupiter",
      "Neptune",
      "Saturn",
      "Mars"
    ],
    "correctIndex": 0,
    "explanationAr": "يفوق قطر المشتري قطر الأرض بأكثر من 11 مرة وتفوق كتلته مجموع كتل بقية الكواكب.",
    "explanationEn": "Jupiter is over 11 times wider than Earth and more massive than all other solar planets combined."
  },
  {
    "id": "q_gen_34",
    "level": 3,
    "category": "general",
    "topic": "science",
    "questionAr": "كم تبلغ سرعة الضوء في الفراغ تقريباً؟",
    "questionEn": "What is the approximate speed of light in a vacuum?",
    "optionsAr": [
      "3,000 كيلومتر في الثانية",
      "150,000 كيلومتر في الساعة",
      "30,000 كيلومتر في الثانية",
      "300,000 كيلومتر في الثانية"
    ],
    "optionsEn": [
      "3,000 km/s",
      "150,000 km/h",
      "30,000 km/s",
      "300,000 kilometers per second"
    ],
    "correctIndex": 3,
    "explanationAr": "تبلغ السرعة الدقيقة للضوء في الفراغ 299,792,458 متراً في الثانية أي قرابة 300 ألف كم/ث.",
    "explanationEn": "Light travels through a vacuum at roughly 299,792 kilometers per second."
  },
  {
    "id": "q_gen_35",
    "level": 3,
    "category": "general",
    "topic": "science",
    "questionAr": "ما هو المعدن الوحيد الذي يكون في الحالة السائلة عند درجة حرارة الغرفة القياسية؟",
    "questionEn": "Which metal is the only one that exists as a liquid at standard room temperature?",
    "optionsAr": [
      "الألمنيوم",
      "النحاس",
      "الرصاص",
      "الزئبق"
    ],
    "optionsEn": [
      "Aluminum",
      "Copper",
      "Lead",
      "Mercury"
    ],
    "correctIndex": 3,
    "explanationAr": "ينصهر الزئبق عند درجة −38.8 مئوية مما يجعله سائلاً لامعاً في الحرارة العادية.",
    "explanationEn": "Mercury melts at −38.8 °C, keeping it liquid at normal room temperatures."
  },
  {
    "id": "q_gen_36",
    "level": 4,
    "category": "general",
    "topic": "science",
    "questionAr": "ما اسم العضو الداخلي الأكبر حجماً في جسم الإنسان والمسؤول عن تنقية الدم وإنتاج العصارة الصفراوية؟",
    "questionEn": "Which is the largest internal organ in the human body, responsible for detoxification and bile production?",
    "optionsAr": [
      "الكبد",
      "البنكرياس",
      "الطحال",
      "المعدة"
    ],
    "optionsEn": [
      "The liver",
      "The pancreas",
      "The spleen",
      "The stomach"
    ],
    "correctIndex": 0,
    "explanationAr": "يزن الكبد قرابة 1.5 كجم في البالغ ويؤدي مئات الوظائف الأيضية والحيوية.",
    "explanationEn": "Weighing around 1.5 kg in adults, the liver is the largest internal organ and performs vital metabolic tasks."
  },
  {
    "id": "q_gen_37",
    "level": 4,
    "category": "general",
    "topic": "science",
    "questionAr": "ما وحدة القياس الدولية المستخدمة لقياس القوة الفيزيائية؟",
    "questionEn": "What is the SI unit used to measure force?",
    "optionsAr": [
      "الواط",
      "الأمبير",
      "الجول",
      "النيوتن"
    ],
    "optionsEn": [
      "The Watt (W)",
      "The Ampere (A)",
      "The Joule (J)",
      "The Newton (N)"
    ],
    "correctIndex": 3,
    "explanationAr": "سميت وحدة النيوتن تكريماً للعالم إسحاق نيوتن وتُعادل القوة اللازمة لتسريع 1 كجم بمعدل 1 م/ث².",
    "explanationEn": "Named after Sir Isaac Newton, one Newton is the force needed to accelerate 1 kg by 1 m/s²."
  },
  {
    "id": "q_gen_38",
    "level": 5,
    "category": "general",
    "topic": "science",
    "questionAr": "ما اسم العضية الخلوية المعروفة باسم «مصنع الطاقة» في الخلية الحيوانية لأنها تنتج جزيئات ATP؟",
    "questionEn": "Which organelle is known as the \"powerhouse of the cell\" because it generates most of the cell’s ATP?",
    "optionsAr": [
      "الريبوسومات",
      "جهاز غولجي",
      "الميتوكوندريا (المتقدرات)",
      "الجدار الخلوي"
    ],
    "optionsEn": [
      "Ribosomes",
      "Golgi apparatus",
      "Mitochondria",
      "Cell wall"
    ],
    "correctIndex": 2,
    "explanationAr": "تُحوّل الميتوكوندريا العناصر الغذائية والأكسجين إلى طاقة كيميائية قابلة للاستخدام في الخلية.",
    "explanationEn": "Mitochondria convert nutrients into ATP through cellular respiration."
  },
  {
    "id": "q_gen_39",
    "level": 5,
    "category": "general",
    "topic": "science",
    "questionAr": "ما الكوكب الأكثر سخونة في مجموعتنا الشمسية بسبب غلافه الجوي الكثيف من ثاني أكسيد الكربون؟",
    "questionEn": "Which planet has the hottest average surface temperature in the Solar System due to a runaway greenhouse effect?",
    "optionsAr": [
      "كوكب أورانوس",
      "كوكب عطارد",
      "كوكب المريخ",
      "كوكب الزهرة"
    ],
    "optionsEn": [
      "Uranus",
      "Mercury",
      "Mars",
      "Venus"
    ],
    "correctIndex": 3,
    "explanationAr": "رغم أن عطارد أقرب إلى الشمس، فإن غلاف الزهرة الكثيف يرفع حرارته إلى نحو 465 درجة مئوية.",
    "explanationEn": "Although Mercury is closer to the Sun, Venus’s dense CO₂ atmosphere traps heat at ~465 °C."
  },
  {
    "id": "q_gen_40",
    "level": 6,
    "category": "general",
    "topic": "science",
    "questionAr": "عند أي درجة حرارة مئوية يغلي الماء النقي عند مستوى سطح البحر القياسي؟",
    "questionEn": "At what temperature on the Celsius scale does pure water boil at standard sea-level pressure?",
    "optionsAr": [
      "90 درجة مئوية",
      "120 درجة مئوية",
      "100 درجة مئوية",
      "80 درجة مئوية"
    ],
    "optionsEn": [
      "90 °C",
      "120 °C",
      "100 °C",
      "80 °C"
    ],
    "correctIndex": 2,
    "explanationAr": "يتجمد الماء النقي عند 0 درجة مئوية ويغلي عند 100 درجة مئوية تحت ضغط جوي قياسي 1 بار.",
    "explanationEn": "At standard atmospheric pressure, pure water freezes at 0 °C and boils at 100 °C."
  },
  {
    "id": "q_gen_41",
    "level": 6,
    "category": "general",
    "topic": "science",
    "questionAr": "ما هو أشد المعادن الطبيعية صلابةً على مقياس موس للصلابة؟",
    "questionEn": "Which naturally occurring mineral ranks at the top (10/10) on the Mohs hardness scale?",
    "optionsAr": [
      "الكوارتز",
      "الألماس",
      "الحديد",
      "الذهب"
    ],
    "optionsEn": [
      "Quartz",
      "Diamond",
      "Iron",
      "Gold"
    ],
    "correctIndex": 1,
    "explanationAr": "يتكون الألماس من ذرات كربون مرتبة في شبكة بلورية رباعية تمنحه صلابة قياسية بدرجة 10.",
    "explanationEn": "Diamond’s tightly bonded tetrahedral carbon lattice gives it a top Mohs rating of 10."
  },
  {
    "id": "q_gen_42",
    "level": 7,
    "category": "general",
    "topic": "science",
    "questionAr": "ماذا تحمل فصيلة الدم التي توصف بأنها «المانح العام» لخلايا الدم الحمراء لأنها لا تحمل مستضدات A أو B أو عامل Rh؟",
    "questionEn": "Which blood type is the universal red blood cell donor because its cells lack A, B, and Rh antigens?",
    "optionsAr": [
      "فصيلة O السالب (O-)",
      "فصيلة B السالب (B-)",
      "فصيلة AB الموجب (AB+)",
      "فصيلة A الموجب (A+)"
    ],
    "optionsEn": [
      "O negative (O-)",
      "B negative (B-)",
      "AB positive (AB+)",
      "A positive (A+)"
    ],
    "correctIndex": 0,
    "explanationAr": "تُعطى كريات الدم الحمراء من فصيلة O- في حالات الطوارئ لأي مريض لغياب المستضدات التفاعلية.",
    "explanationEn": "O-negative red blood cells can be safely transfused in emergencies regardless of the recipient’s type."
  },
  {
    "id": "q_gen_43",
    "level": 8,
    "category": "general",
    "topic": "science",
    "questionAr": "لماذا لا ينتقل الصوت في الفضاء الخارجي الفارغ؟",
    "questionEn": "Why can sound waves not travel through the vacuum of outer space?",
    "optionsAr": [
      "لأن سرعة الصوت تتجاوز سرعة الضوء هناك",
      "لأن الصوت موجة ميكانيكية تحتاج إلى وسط مادي (غاز أو سائل أو صلب) للانتقال",
      "لأن الشمس تمتص كل الموجات الصوتية",
      "لأن انعدام الجاذبية يوقف الذبذبات تماماً"
    ],
    "optionsEn": [
      "Sound exceeds light speed there",
      "Because sound is a mechanical wave that requires a material medium to propagate",
      "The Sun absorbs all sound",
      "Zero gravity halts all vibration"
    ],
    "correctIndex": 1,
    "explanationAr": "ينتقل الصوت عبر اهتزاز جزيئات الوسط المادي، وبانعدام الجزيئات في الفراغ يتعذر انتشاره.",
    "explanationEn": "Sound travels via vibrating particles; without matter in a vacuum, vibrations cannot propagate."
  },
  {
    "id": "q_gen_44",
    "level": 9,
    "category": "general",
    "topic": "science",
    "questionAr": "ما اسم الجزيء الحيوي اللولبي المزدوج الذي يحمل التعليمات الوراثية للكائنات الحية؟",
    "questionEn": "What is the double-helix molecule that carries genetic instructions in living organisms?",
    "optionsAr": [
      "الأنسولين",
      "الحمض النووي الريبوزي منقوص الأكسجين (DNA)",
      "الهيموغلوبين",
      "الكولاجين"
    ],
    "optionsEn": [
      "Insulin",
      "Deoxyribonucleic acid (DNA)",
      "Hemoglobin",
      "Collagen"
    ],
    "correctIndex": 1,
    "explanationAr": "اكتشف بنية اللولب المزدوج للـ DNA العالمان واتسون وكريك بالاستناد إلى صور روزاليند فرانكلين.",
    "explanationEn": "DNA stores hereditary information using four nucleotide bases arranged in a double helix."
  },
  {
    "id": "q_gen_45",
    "level": 1,
    "category": "general",
    "topic": "sports_gen",
    "questionAr": "كم عدد اللاعبين الأساسيين في فريق كرة السلة الواحد داخل الملعب أثناء اللعب؟",
    "questionEn": "How many players from one basketball team are allowed on the court at the same time?",
    "optionsAr": [
      "9 لاعبين",
      "5 لاعبين",
      "6 لاعبين",
      "7 لاعبين"
    ],
    "optionsEn": [
      "9 players",
      "5 players",
      "6 players",
      "7 players"
    ],
    "correctIndex": 1,
    "explanationAr": "يلعب كل فريق في كرة السلة بخمسة لاعبين أساسيين داخل أرضية الملعب.",
    "explanationEn": "Each basketball team fields 5 active players on the court during play."
  },
  {
    "id": "q_gen_46",
    "level": 2,
    "category": "general",
    "topic": "sports_gen",
    "questionAr": "كم عدد لاعبي فريق الكرة الطائرة الأساسيين داخل الملعب لكل جانب؟",
    "questionEn": "How many players per side are on the court in a standard indoor volleyball match?",
    "optionsAr": [
      "6 لاعبين",
      "7 لاعبين",
      "8 لاعبين",
      "5 لاعبين"
    ],
    "optionsEn": [
      "6 players",
      "7 players",
      "8 players",
      "5 players"
    ],
    "correctIndex": 0,
    "explanationAr": "يتكون كل فريق في الكرة الطائرة من 6 لاعبين موزعين بين الخط الأمامي والخط الخلفي.",
    "explanationEn": "Indoor volleyball teams play with 6 players arranged in front and back rows."
  },
  {
    "id": "q_gen_47",
    "level": 3,
    "category": "general",
    "topic": "sports_gen",
    "questionAr": "كم عدد لاعبي فريق كرة اليد الأساسيين داخل الملعب (بمن فيهم حارس المرمى)؟",
    "questionEn": "How many players per team are on the court simultaneously in standard team handball?",
    "optionsAr": [
      "5 لاعبين",
      "6 لاعبين",
      "7 لاعبين",
      "9 لاعبين"
    ],
    "optionsEn": [
      "5 players",
      "6 players",
      "7 players",
      "9 players"
    ],
    "correctIndex": 2,
    "explanationAr": "يلعب فريق كرة اليد بستة لاعبين ميدانيين بالإضافة إلى حارس مرمى بإجمالي 7 لاعبين.",
    "explanationEn": "Team handball features 6 outfield players plus 1 goalkeeper, totaling 7 per side."
  },
  {
    "id": "q_gen_48",
    "level": 2,
    "category": "general",
    "topic": "sports_gen",
    "questionAr": "كل كم سنة تقام دورة الألعاب الأولمبية الصيفية بشكل دوري منتظم؟",
    "questionEn": "Every how many years are the Summer Olympic Games regularly held?",
    "optionsAr": [
      "كل 5 سنوات",
      "كل 4 سنوات",
      "كل سنتين",
      "كل 3 سنوات"
    ],
    "optionsEn": [
      "Every 5 years",
      "Every 4 years",
      "Every 2 years",
      "Every 3 years"
    ],
    "correctIndex": 1,
    "explanationAr": "تُعقد الألعاب الأولمبية الصيفية كل أربع سنوات في دورة تسمى الأولمبياد.",
    "explanationEn": "The Summer Olympics occur every four years in a cycle known as an Olympiad."
  },
  {
    "id": "q_gen_49",
    "level": 4,
    "category": "general",
    "topic": "sports_gen",
    "questionAr": "كم عدد الحفر في ملعب الغولف الكامل القياسي؟",
    "questionEn": "How many holes make up a standard full round of championship golf?",
    "optionsAr": [
      "18 حفرة",
      "12 حفرة",
      "24 حفرة",
      "9 حفر فقط"
    ],
    "optionsEn": [
      "18 holes",
      "12 holes",
      "24 holes",
      "9 holes only"
    ],
    "correctIndex": 0,
    "explanationAr": "تعود قاعدة الـ 18 حفرة في الغولف إلى ملعب سانت أندروز التاريخي في اسكتلندا عام 1764.",
    "explanationEn": "A full regulation golf course consists of 18 holes, standardized at St Andrews in 1764."
  },
  {
    "id": "q_gen_50",
    "level": 4,
    "category": "general",
    "topic": "sports_gen",
    "questionAr": "على أي نوع من الأرضيات تُقام مباريات بطولة ويمبلدون للتنس؟",
    "questionEn": "On which court surface is the Wimbledon Tennis Championship played?",
    "optionsAr": [
      "الملاعب الترابية الحمراء",
      "الملاعب الصلبة الإسمنتية",
      "الخشب الصلب",
      "الملاعب العشبية"
    ],
    "optionsEn": [
      "Red clay courts",
      "Hard concrete courts",
      "Hardwood floors",
      "Grass courts"
    ],
    "correctIndex": 3,
    "explanationAr": "تُعد ويمبلدون البطولة الوحيدة من بطولات الغراند سلام الأربع التي ما زالت تُلعب على العشب الطبيعي.",
    "explanationEn": "Wimbledon is the only Grand Slam tennis tournament still contested on natural grass."
  },
  {
    "id": "q_gen_51",
    "level": 5,
    "category": "general",
    "topic": "sports_gen",
    "questionAr": "في أي دولة نشأت رياضة الجودو القتالية الحديثة في أواخر القرن التاسع عشر؟",
    "questionEn": "In which country was the modern martial art and Olympic sport of Judo founded?",
    "optionsAr": [
      "اليابان",
      "تايلاند",
      "كوريا الجنوبية",
      "الصين"
    ],
    "optionsEn": [
      "Japan",
      "Thailand",
      "South Korea",
      "China"
    ],
    "correctIndex": 0,
    "explanationAr": "أسس جيغورو كانو رياضة الجودو في اليابان عام 1882 لتجمع بين اللياقة والانضباط الأخلاقي.",
    "explanationEn": "Jigoro Kano developed Judo in Japan in 1882 as a modern martial art and sport."
  },
  {
    "id": "q_gen_52",
    "level": 5,
    "category": "general",
    "topic": "sports_gen",
    "questionAr": "ما اسم الرياضة الأولمبية القتالية التي نشأت في شبه الجزيرة الكورية وتعتمد أساساً على ركلات القدم السريعة؟",
    "questionEn": "Which Korean Olympic martial art is renowned for its dynamic, high-speed kicking techniques?",
    "optionsAr": [
      "المصارعة الرومانية",
      "التايكوندو",
      "الملاكمة",
      "السومو"
    ],
    "optionsEn": [
      "Greco-Roman wrestling",
      "Taekwondo",
      "Boxing",
      "Sumo"
    ],
    "correctIndex": 1,
    "explanationAr": "تعني كلمة تايكوندو بالكورية «طريق القبضة والقدم»، وأصبحت رياضة أولمبية رسمية عام 2000.",
    "explanationEn": "Taekwondo originated in Korea and entered the official Olympic program at Sydney 2000."
  },
  {
    "id": "q_gen_53",
    "level": 6,
    "category": "general",
    "topic": "sports_gen",
    "questionAr": "كم يبلغ الطول القياسي للمسبح الأولمبي الدولي في سباقات السباحة؟",
    "questionEn": "What is the standard length of an Olympic-size swimming pool?",
    "optionsAr": [
      "25 متراً",
      "75 متراً",
      "50 متراً",
      "100 متر"
    ],
    "optionsEn": [
      "25 meters",
      "75 meters",
      "50 meters",
      "100 meters"
    ],
    "correctIndex": 2,
    "explanationAr": "يبلغ طول الحوض الأولمبي المعتمد من الاتحاد الدولي للسباحة 50 متراً وعرضه 25 متراً.",
    "explanationEn": "A regulation Olympic long-course swimming pool measures 50 meters long and 25 meters wide."
  },
  {
    "id": "q_gen_54",
    "level": 6,
    "category": "general",
    "topic": "sports_gen",
    "questionAr": "كم نقطة يحتاجها اللاعب للفوز بالشوط الواحد (المجموعة) في القواعد الحديثة لتنس الطاولة؟",
    "questionEn": "How many points are required to win a standard game in modern table tennis (with a 2-point lead)?",
    "optionsAr": [
      "25 نقطة",
      "11 نقطة",
      "15 نقطة",
      "21 نقطة"
    ],
    "optionsEn": [
      "25 points",
      "11 points",
      "15 points",
      "21 points"
    ],
    "correctIndex": 1,
    "explanationAr": "تُحسم مجموعة تنس الطاولة عند وصول أحد اللاعبين إلى 11 نقطة بفارق نقطتين على الأقل.",
    "explanationEn": "Since 2001, a game of table tennis is played to 11 points (winning by at least 2)."
  },
  {
    "id": "q_gen_55",
    "level": 7,
    "category": "general",
    "topic": "sports_gen",
    "questionAr": "ما اسم الرياضة الجماعية التي يركب فيها اللاعبون الخيول ويضربون الكرة بمضارب خشبية طويلة نحو المرمى؟",
    "questionEn": "In which equestrian team sport do players on horseback strike a ball with long wooden mallets toward a goal?",
    "optionsAr": [
      "الهوكي الجليدي",
      "الرجبي",
      "الكريكيت",
      "رياضة البولو"
    ],
    "optionsEn": [
      "Ice hockey",
      "Rugby",
      "Cricket",
      "Polo"
    ],
    "correctIndex": 3,
    "explanationAr": "تُعد رياضة البولو من أقدم رياضات الفروسية الجماعية وتُعرف باسم «رياضة الملوك».",
    "explanationEn": "Polo is one of the oldest horseback team sports in the world."
  },
  {
    "id": "q_gen_56",
    "level": 7,
    "category": "general",
    "topic": "sports_gen",
    "questionAr": "أي عدّاء جامايكي يحمل الرقم القياسي العالمي في سباق 100 متر بزمن 9.58 ثوانٍ؟",
    "questionEn": "Which Jamaican sprinter holds the men’s 100-meter world record of 9.58 seconds?",
    "optionsAr": [
      "يوسين بولت",
      "كارل لويس",
      "مو فرح",
      "تايسون غاي"
    ],
    "optionsEn": [
      "Usain Bolt",
      "Carl Lewis",
      "Mo Farah",
      "Tyson Gay"
    ],
    "correctIndex": 0,
    "explanationAr": "حقق يوسين بولت الرقم القياسي 9.58 ثانية في بطولة العالم لألعاب القوى ببرلين عام 2009.",
    "explanationEn": "Usain Bolt set the 100 m world record of 9.58 seconds in Berlin in 2009."
  },
  {
    "id": "q_gen_57",
    "level": 8,
    "category": "general",
    "topic": "sports_gen",
    "questionAr": "كم عدد بطولات «غراند سلام» الأربع الكبرى في عالم التنس للمحترفين كل عام؟",
    "questionEn": "How many Grand Slam major tournaments are contested each year on the professional tennis calendar?",
    "optionsAr": [
      "6 بطولات",
      "3 بطولات فقط",
      "5 بطولات",
      "4 بطولات (أستراليا، رولان غاروس، ويمبلدون، أمريكا)"
    ],
    "optionsEn": [
      "6 tournaments",
      "3 tournaments only",
      "5 tournaments",
      "4 tournaments (Australian, French, Wimbledon, US Open)"
    ],
    "correctIndex": 3,
    "explanationAr": "تشمل بطولات الغراند سلام الأربع: أستراليا المفتوحة، فرنسا المفتوحة (رولان غاروس)، ويمبلدون، وأمريكا المفتوحة.",
    "explanationEn": "The four Grand Slams are the Australian Open, French Open, Wimbledon, and US Open."
  },
  {
    "id": "q_gen_58",
    "level": 8,
    "category": "general",
    "topic": "sports_gen",
    "questionAr": "ما هي الدولة التي فازت بأكبر عدد من بطولات كأس أمم أوروبا لكرة القدم؟ (شراكةً مع ألمانيا بـ 3 أو إسبانيا بـ 4؟)",
    "questionEn": "Which nation became the sole record-holder with 4 UEFA European Championship titles after Euro 2024?",
    "optionsAr": [
      "إيطاليا (لقبان)",
      "هولندا (لقب واحد)",
      "إسبانيا (4 ألقاب)",
      "فرنسا (لقبان)"
    ],
    "optionsEn": [
      "Italy (2 titles)",
      "Netherlands (1 title)",
      "Spain (4 titles)",
      "France (2 titles)"
    ],
    "correctIndex": 2,
    "explanationAr": "انفردت إسبانيا بالرقم القياسي للبطولة الأوروبية بتتويجها الرابع عام 2024.",
    "explanationEn": "Spain lifted their fourth European Championship trophy in 2024, surpassing Germany’s three."
  },
  {
    "id": "q_gen_59",
    "level": 1,
    "category": "general",
    "topic": "inventions",
    "questionAr": "من هو المخترع الذي طور الهاتف العملي وحصل على أول براءة اختراع له عام 1876؟",
    "questionEn": "Who received the first US patent for inventing the practical telephone in 1876?",
    "optionsAr": [
      "نيكولا تسلا",
      "ألكسندر غراهام بيل",
      "مايكل فاراداي",
      "غوليلمو ماركوني"
    ],
    "optionsEn": [
      "Nikola Tesla",
      "Alexander Graham Bell",
      "Michael Faraday",
      "Guglielmo Marconi"
    ],
    "correctIndex": 1,
    "explanationAr": "نقل ألكسندر غراهام بيل أول مكالمة صوتية واضحة عبر الأسلاك في مارس 1876.",
    "explanationEn": "Alexander Graham Bell transmitted the first clear speech over wire in March 1876."
  },
  {
    "id": "q_gen_60",
    "level": 2,
    "category": "general",
    "topic": "inventions",
    "questionAr": "من المخترع الألماني الذي ابتكر المطبعة ذات الأحرف المعدنية المتحركة في أوروبا قرابة عام 1440؟",
    "questionEn": "Which German inventor introduced the mechanical movable-type printing press to Europe around 1440?",
    "optionsAr": [
      "غوتليب دايملر",
      "مارتين لوثر",
      "يوهانس غوتنبرغ",
      "فريدريش فويلر"
    ],
    "optionsEn": [
      "Gottlieb Daimler",
      "Martin Luther",
      "Johannes Gutenberg",
      "Friedrich Wöhler"
    ],
    "correctIndex": 2,
    "explanationAr": "أحدثت مطبعة غوتنبرغ ثورة في نشر الكتب والمعرفة حول العالم.",
    "explanationEn": "Gutenberg’s movable-type press sparked an unprecedented information revolution."
  },
  {
    "id": "q_gen_61",
    "level": 2,
    "category": "general",
    "topic": "inventions",
    "questionAr": "من العالم الاسكتلندي الذي اكتشف البنسلين عام 1928 ليكون أول مضاد حيوي فعال؟",
    "questionEn": "Which Scottish scientist discovered penicillin in 1928, launching the era of antibiotics?",
    "optionsAr": [
      "إدوارد جينر",
      "روبرت كوخ",
      "ألكسندر فليمنغ",
      "لويس باستور"
    ],
    "optionsEn": [
      "Edward Jenner",
      "Robert Koch",
      "Alexander Fleming",
      "Louis Pasteur"
    ],
    "correctIndex": 2,
    "explanationAr": "لاحظ فليمنغ أن عفن البنسيليوم يقتل البكتيريا في طبق معملي مما أنقذ ملايين الأرواح لاحقاً.",
    "explanationEn": "Alexander Fleming discovered that Penicillium mold inhibited bacteria growth, revolutionizing medicine."
  },
  {
    "id": "q_gen_62",
    "level": 3,
    "category": "general",
    "topic": "inventions",
    "questionAr": "من هما الأخوان اللذان نفذا أول رحلة طيران ناجحة بطائرة أثقل من الهواء مزودة بمحرك عام 1903؟",
    "questionEn": "Who achieved the first controlled, sustained, powered heavier-than-air airplane flight in 1903?",
    "optionsAr": [
      "الأخوان مونتغولفييه",
      "الأخوان أورفيل وويلبر رايت",
      "الأخوان لوميير",
      "فرديناند فون تسبلين"
    ],
    "optionsEn": [
      "The Montgolfier brothers",
      "Orville and Wilbur Wright",
      "The Lumière brothers",
      "Ferdinand von Zeppelin"
    ],
    "correctIndex": 1,
    "explanationAr": "حلق الأخوان رايت في كيتي هوك بولاية كارولاينا الشمالية في 17 ديسمبر 1903.",
    "explanationEn": "The Wright brothers flew at Kitty Hawk, North Carolina, on December 17, 1903."
  },
  {
    "id": "q_gen_63",
    "level": 3,
    "category": "general",
    "topic": "inventions",
    "questionAr": "من المهندس البريطاني الذي ابتكر الشبكة العنكبوتية العالمية (World Wide Web) ورمز HTTP عام 1989؟",
    "questionEn": "Which British computer scientist invented the World Wide Web (WWW) in 1989?",
    "optionsAr": [
      "فون نيومان",
      "آلان تورينغ",
      "تشارلز بابيج",
      "تيم بيرنرز لي"
    ],
    "optionsEn": [
      "John von Neumann",
      "Alan Turing",
      "Charles Babbage",
      "Tim Berners-Lee"
    ],
    "correctIndex": 3,
    "explanationAr": "طور تيم بيرنرز لي في مختبر CERN بروتوكول HTTP ولغة HTML وأول متصفح ويب.",
    "explanationEn": "Working at CERN, Tim Berners-Lee created HTTP, HTML, and the first web browser."
  },
  {
    "id": "q_gen_64",
    "level": 4,
    "category": "general",
    "topic": "inventions",
    "questionAr": "من العالم الإيطالي الذي صنع أول عمود كهربائي (بطارية كهربائية كيميائية) قرابة عام 1800؟",
    "questionEn": "Which Italian physicist invented the first true electric battery (the voltaic pile) around 1800?",
    "optionsAr": [
      "جورج أوم",
      "أندريه أمبير",
      "أليساندرو فولتا",
      "جيمس واط"
    ],
    "optionsEn": [
      "Georg Ohm",
      "André-Marie Ampère",
      "Alessandro Volta",
      "James Watt"
    ],
    "correctIndex": 2,
    "explanationAr": "سُميت وحدة الجهد الكهربائي «الفولت» تكريماً لإنجاز أليساندرو فولتا.",
    "explanationEn": "The volt unit of electric potential is named in honor of Alessandro Volta."
  },
  {
    "id": "q_gen_65",
    "level": 4,
    "category": "general",
    "topic": "inventions",
    "questionAr": "من العالم الذي اكتشف الأشعة السينية (X-rays) عام 1895 وفاز بأول جائزة نوبل في الفيزياء؟",
    "questionEn": "Who discovered X-rays in 1895 and won the very first Nobel Prize in Physics?",
    "optionsAr": [
      "فيلهلم رونتغن",
      "ماكس بلانك",
      "إرنست رذرفورد",
      "نيلز بور"
    ],
    "optionsEn": [
      "Wilhelm Röntgen",
      "Max Planck",
      "Ernest Rutherford",
      "Niels Bohr"
    ],
    "correctIndex": 0,
    "explanationAr": "تمكن رونتغن من تصوير عظام اليد لأول مرة باستخدام الأشعة التي اكتشفها.",
    "explanationEn": "Wilhelm Röntgen discovered X-radiation in 1895, transforming medical diagnostics."
  },
  {
    "id": "q_gen_66",
    "level": 5,
    "category": "general",
    "topic": "inventions",
    "questionAr": "من المخترع الأمريكي الذي طور المصباح الكهربائي المتوهج طويل العمر وأنظمة توزيع الطاقة الكهربائية؟",
    "questionEn": "Which American inventor developed the commercially practical long-lasting incandescent light bulb?",
    "optionsAr": [
      "صموئيل مورس",
      "توماس إديسون",
      "بنجامين فرانكلين",
      "هنري فورد"
    ],
    "optionsEn": [
      "Samuel Morse",
      "Thomas Edison",
      "Benjamin Franklin",
      "Henry Ford"
    ],
    "correctIndex": 1,
    "explanationAr": "أسهمت أبحاث إديسون في مختبر مينلو بارك عام 1879 في تعميم الإضاءة الكهربائية في المنازل.",
    "explanationEn": "Edison’s Menlo Park laboratory produced a long-lasting filament bulb in 1879."
  },
  {
    "id": "q_gen_67",
    "level": 5,
    "category": "general",
    "topic": "inventions",
    "questionAr": "ما اسم الأداة الملاحية المغناطيسية التي طورتها الحضارة الصينية القديمة ثم استُخدمت في إرشاد السفن نحو الشمال؟",
    "questionEn": "Which navigational instrument, originally developed in ancient China with lodestone, indicates magnetic north?",
    "optionsAr": [
      "السدس الجوي",
      "التوربين",
      "البارومتر",
      "البوصلة المغناطيسية"
    ],
    "optionsEn": [
      "The sextant",
      "The turbine",
      "The barometer",
      "The magnetic compass"
    ],
    "correctIndex": 3,
    "explanationAr": "أحدثت البوصلة نقلة حاسمة في الملاحة البحرية عبر المحيطات حتى في الأجواء الغائمة.",
    "explanationEn": "The magnetic compass enabled safe open-ocean navigation regardless of cloud cover."
  },
  {
    "id": "q_gen_68",
    "level": 6,
    "category": "general",
    "topic": "inventions",
    "questionAr": "من الكيميائي السويدي الذي اخترع الديناميت عام 1867 وخصص ثروته لتأسيس أشهر جوائز عالمية؟",
    "questionEn": "Which Swedish chemist invented dynamite in 1867 and later endowed the Nobel Prizes?",
    "optionsAr": [
      "ألفرد نوبل",
      "كارل لينيوس",
      "ديمتري مندليف",
      "أنتوني لافوازييه"
    ],
    "optionsEn": [
      "Alfred Nobel",
      "Carl Linnaeus",
      "Dmitri Mendeleev",
      "Antoine Lavoisier"
    ],
    "correctIndex": 0,
    "explanationAr": "ابتكر نوبل وسيلة لتثبيت النيتروغليسرين وأوصى بثروته لتكريم المبدعين في العلوم والسلام والأدب.",
    "explanationEn": "Alfred Nobel stabilized nitroglycerin to create dynamite and established the Nobel Prizes in his will."
  },
  {
    "id": "q_gen_69",
    "level": 6,
    "category": "general",
    "topic": "inventions",
    "questionAr": "من المهندس الذي حسّن المحرك البخاري بمكثف منفصل ليصبح عماد الثورة الصناعية وسُميت وحدة القدرة باسمه؟",
    "questionEn": "Which Scottish engineer dramatically improved the steam engine with a separate condenser, lending his name to the unit of power?",
    "optionsAr": [
      "بليز باسكال",
      "جيمس واط",
      "روبرت ستيفنسون",
      "مايكل فاراداي"
    ],
    "optionsEn": [
      "Blaise Pascal",
      "James Watt",
      "Robert Stephenson",
      "Michael Faraday"
    ],
    "correctIndex": 1,
    "explanationAr": "أضاف جيمس واط مكثفاً منفصلاً للمحرك البخاري مما ضاعف كفاءته واستهلك وقوداً أقل.",
    "explanationEn": "James Watt’s separate condenser boosted steam engine efficiency and powered industrial factories."
  },
  {
    "id": "q_gen_70",
    "level": 7,
    "category": "general",
    "topic": "inventions",
    "questionAr": "من الذي اخترع نظام الكتابة البارزة للقراءة باللمس للمكفوفين؟",
    "questionEn": "Who invented the tactile raised-dot reading and writing system used by visually impaired people worldwide?",
    "optionsAr": [
      "لويس برايل",
      "غوتنبرغ",
      "إيفان بافلوف",
      "بليز باسكال"
    ],
    "optionsEn": [
      "Louis Braille",
      "Gutenberg",
      "Ivan Pavlov",
      "Blaise Pascal"
    ],
    "correctIndex": 0,
    "explanationAr": "ابتكر الفرنسي لويس برايل هذا النظام المكون من 6 نقاط بارزة عام 1824 وهو في الخامسة عشرة.",
    "explanationEn": "French educator Louis Braille created his six-dot tactile code in 1824 at age fifteen."
  },
  {
    "id": "q_gen_71",
    "level": 7,
    "category": "general",
    "topic": "inventions",
    "questionAr": "أي مخترع إيطالي رائد أرسل أولى الإشارات اللاسلكية (الراديو) عبر المحيط الأطلسي عام 1901؟",
    "questionEn": "Which pioneer of wireless telegraphy transmitted the first transatlantic radio signal in 1901?",
    "optionsAr": [
      "إنريكو فيرمي",
      "غاليليو غاليلي",
      "غوليلمو ماركوني",
      "توماس إديسون"
    ],
    "optionsEn": [
      "Enrico Fermi",
      "Galileo Galilei",
      "Guglielmo Marconi",
      "Thomas Edison"
    ],
    "correctIndex": 2,
    "explanationAr": "توج ماركوني بجائزة نوبل في الفيزياء عام 1909 عن تطويره التلغراف اللاسلكي.",
    "explanationEn": "Guglielmo Marconi won the 1909 Nobel Prize for pioneering long-distance radio communication."
  },
  {
    "id": "q_gen_72",
    "level": 8,
    "category": "general",
    "topic": "inventions",
    "questionAr": "ما اسم الجهاز الذي يستخدم موجات الراديو لتحديد موقع الطائرات والسفن وسرعتها عن بُعد؟",
    "questionEn": "What detection system uses radio waves to determine the distance, angle, and velocity of aircraft and ships?",
    "optionsAr": [
      "التلسكوب الكاسر",
      "الرادار (RADAR)",
      "البارومتر",
      "الميكروسكوب"
    ],
    "optionsEn": [
      "Refracting telescope",
      "Radar",
      "Barometer",
      "Microscope"
    ],
    "correctIndex": 1,
    "explanationAr": "كلمة RADAR اختصار لكشف وتحديد المدى بموجات الراديو وتستعمل أيضاً في الأرصاد الجوية.",
    "explanationEn": "RADAR stands for Radio Detection And Ranging, essential in aviation, shipping, and meteorology."
  },
  {
    "id": "q_gen_73",
    "level": 1,
    "category": "general",
    "topic": "nature",
    "questionAr": "ما هو أسرع حيوان ثديي بري على وجه الأرض في الركض لمسافات قصيرة؟",
    "questionEn": "Which land mammal is the fastest sprinter on Earth over short distances?",
    "optionsAr": [
      "الغزال الرشيق",
      "الفهد الصياد (الشيتا)",
      "الذئب الرمادي",
      "الأسد الإفريقي"
    ],
    "optionsEn": [
      "Gazelle",
      "The cheetah",
      "Gray wolf",
      "African lion"
    ],
    "correctIndex": 1,
    "explanationAr": "تصل سرعة الفهد الصياد إلى قرابة 110–120 كم/ساعة خلال مطارداته القصيرة.",
    "explanationEn": "Cheetahs can accelerate up to roughly 110–120 km/h in short bursts."
  },
  {
    "id": "q_gen_74",
    "level": 1,
    "category": "general",
    "topic": "nature",
    "questionAr": "ما هو أضخم حيوان معروف عاش على كوكب الأرض على الإطلاق؟",
    "questionEn": "What is the largest animal known to have ever existed on Earth?",
    "optionsAr": [
      "الحوت الأزرق",
      "الفيل الأفريقي",
      "القرش الأبيض الكبير",
      "فرس النهر"
    ],
    "optionsEn": [
      "The blue whale",
      "African elephant",
      "Great white shark",
      "Hippopotamus"
    ],
    "correctIndex": 0,
    "explanationAr": "يصل طول الحوت الأزرق إلى نحو 30 متراً ووزنه إلى أكثر من 170 طناً في المحيطات.",
    "explanationEn": "Blue whales can grow up to 30 meters long and weigh more than 170 metric tons."
  },
  {
    "id": "q_gen_75",
    "level": 2,
    "category": "general",
    "topic": "nature",
    "questionAr": "ما العملية الحيوية التي تصنع بها النباتات الخضراء غذاءها باستخدام ضوء الشمس وثاني أكسيد الكربون والماء؟",
    "questionEn": "What biological process do green plants use to make food from sunlight, water, and carbon dioxide?",
    "optionsAr": [
      "التخمر",
      "التنفس اللاهوائي",
      "التمثيل الضوئي (البناء الضوئي)",
      "التبخر الحراري"
    ],
    "optionsEn": [
      "Fermentation",
      "Anaerobic respiration",
      "Photosynthesis",
      "Thermal evaporation"
    ],
    "correctIndex": 2,
    "explanationAr": "تمتص صبغة الكلوروفيل في الأوراق ضوء الشمس وتطلق غاز الأكسجين ناتجاً أساسياً للعملية.",
    "explanationEn": "Chlorophyll captures sunlight during photosynthesis, producing glucose and releasing oxygen."
  },
  {
    "id": "q_gen_76",
    "level": 2,
    "category": "general",
    "topic": "nature",
    "questionAr": "بأي عضو تتنفس معظم الأسماك الأكسجين الذائب في الماء؟",
    "questionEn": "Through which specialized organs do most fish extract dissolved oxygen from water?",
    "optionsAr": [
      "الزعانف الصدرية",
      "القشور",
      "الرئتان",
      "الخياشيم"
    ],
    "optionsEn": [
      "Pectoral fins",
      "Scales",
      "Lungs",
      "Gills"
    ],
    "correctIndex": 3,
    "explanationAr": "تمر المياه الغنية بالأكسجين فوق الشعيرات الدموية الدقيقة في الخياشيم لالتقاط الأكسجين.",
    "explanationEn": "Water flows over feather-like gill filaments rich in blood vessels to absorb dissolved oxygen."
  },
  {
    "id": "q_gen_77",
    "level": 3,
    "category": "general",
    "topic": "nature",
    "questionAr": "ما الطائر الوحيد القادر على الطيران إلى الخلف بمرونة عالية بفضل حركة جناحيه الدائرية؟",
    "questionEn": "Which tiny bird is the only bird family capable of hovering effortlessly and flying backward?",
    "optionsAr": [
      "طائر السنونو",
      "طائر الطنان",
      "الصقر الشاهين",
      "طائر النورس"
    ],
    "optionsEn": [
      "Swallow",
      "The hummingbird",
      "Peregrine falcon",
      "Seagull"
    ],
    "correctIndex": 1,
    "explanationAr": "يرفرف طائر الطنان بجناحيه عشرات المرات في الثانية بحركة رقم 8 في الهواء.",
    "explanationEn": "Hummingbirds beat their wings in a figure-eight pattern dozens of times per second."
  },
  {
    "id": "q_gen_78",
    "level": 3,
    "category": "general",
    "topic": "nature",
    "questionAr": "ما الظاهرة الطبيعية البحرية التي يسببها أساساً جذب القمر والشمس لمياه المحيطات؟",
    "questionEn": "Which regular ocean phenomenon is caused primarily by the gravitational pull of the Moon and Sun?",
    "optionsAr": [
      "المطر الحمضي",
      "المد والجزر",
      "التصحر القاري",
      "الصقيع القطبي"
    ],
    "optionsEn": [
      "Acid rain",
      "Tides (high and low tide)",
      "Desertification",
      "Polar frost"
    ],
    "correctIndex": 1,
    "explanationAr": "تجذب جاذبية القمر مياه البحار والمحيطات مسببة ارتفاع منسوبها ثم انحساره مرتين يومياً تقريباً.",
    "explanationEn": "Lunar and solar gravity pulls ocean water into rhythmic high and low tides."
  },
  {
    "id": "q_gen_79",
    "level": 4,
    "category": "general",
    "topic": "nature",
    "questionAr": "أي غابة استوائية شاسعة تُعد أكبر غابة مطيرة في العالم وتُلقب برئة الأرض؟",
    "questionEn": "Which vast South American rainforest is the largest tropical rainforest on Earth?",
    "optionsAr": [
      "غابة شيروود",
      "غابات السافانا المفتوحة",
      "غابات التايغا السيبيرية",
      "غابات الأمازون المطيرة"
    ],
    "optionsEn": [
      "Sherwood Forest",
      "Open Savanna",
      "Siberian Taiga",
      "The Amazon Rainforest"
    ],
    "correctIndex": 3,
    "explanationAr": "تمتد غابات الأمازون في تسع دول بأمريكا الجنوبية وتضم أكبر تنوع حيوي بري معروف.",
    "explanationEn": "Spanning nine South American nations, the Amazon hosts Earth’s richest terrestrial biodiversity."
  },
  {
    "id": "q_gen_80",
    "level": 4,
    "category": "general",
    "topic": "nature",
    "questionAr": "ما المادة الصخرية المنصهرة التي تكون في باطن الأرض قبل أن تندفع من فوهة البركان وتسمى «حُمماً» (لافا)؟",
    "questionEn": "What is molten rock beneath Earth’s surface called before it erupts from a volcano as lava?",
    "optionsAr": [
      "الألماس الخام",
      "الفوسفات",
      "الكوارتز البارد",
      "الصهارة (الماغما)"
    ],
    "optionsEn": [
      "Raw diamond",
      "Phosphate",
      "Cold quartz",
      "Magma"
    ],
    "correctIndex": 3,
    "explanationAr": "تُعرف الصخور المنصهرة تحت القشرة الأرضية بالماغما، وإذا خرجت على السطح تُسمى حُمماً بركانية (لافا).",
    "explanationEn": "Molten rock underground is termed magma; once it erupts onto the surface, it is called lava."
  },
  {
    "id": "q_gen_81",
    "level": 5,
    "category": "general",
    "topic": "nature",
    "questionAr": "ما اسم أكبر وأضخم طائر حي في العالم لا يستطيع الطيران ولكنه يعدو بسرعة فائقة؟",
    "questionEn": "What is the largest living flightless bird in the world, famous for its running speed?",
    "optionsAr": [
      "طائر الكيوي",
      "البطريق الإمبراطور",
      "البجع الأبيض",
      "النعامة"
    ],
    "optionsEn": [
      "Kiwi bird",
      "Emperor penguin",
      "White swan",
      "The ostrich"
    ],
    "correctIndex": 3,
    "explanationAr": "تصل سرعة النعامة إلى نحو 70 كم/ساعة وتضع أكبر بيضة بين جميع الطيور الحية.",
    "explanationEn": "Ostriches are the heaviest and tallest living birds and can sprint up to ~70 km/h."
  },
  {
    "id": "q_gen_82",
    "level": 5,
    "category": "general",
    "topic": "nature",
    "questionAr": "كيف تحصل النحلة العاملة على المادة الأولية التي تصنع منها العسل داخل الخلية؟",
    "questionEn": "From what natural plant source do honeybees gather the raw material to make honey?",
    "optionsAr": [
      "لحاء الجذور",
      "رمال الأنهار",
      "رحيق الأزهار",
      "أوراق الصنوبر اليابسة"
    ],
    "optionsEn": [
      "Root bark",
      "River sand",
      "Flower nectar",
      "Dried pine needles"
    ],
    "correctIndex": 2,
    "explanationAr": "تجمع النحلات رحيق الأزهار وتمزجه بإنزيماتها ثم تبخر ماءه في أقراص الشمع ليتكون العسل.",
    "explanationEn": "Bees collect flower nectar, transform it with enzymes, and dehydrate it in honeycombs."
  },
  {
    "id": "q_gen_83",
    "level": 6,
    "category": "general",
    "topic": "nature",
    "questionAr": "ما اسم الأضواء الطبيعية الملونة التي تظهر في سماء المناطق القطبية ليلاً نتيجة تفاعل الرياح الشمسية مع الغلاف المغناطيسي؟",
    "questionEn": "What are the glowing natural light displays in polar night skies caused by solar wind hitting Earth’s magnetosphere?",
    "optionsAr": [
      "السراب الصحراوي",
      "الشفق القطبي (الأورورا)",
      "قوس المطر الليلي",
      "الخسوف الكلي"
    ],
    "optionsEn": [
      "Desert mirage",
      "Aurora (Northern/Southern Lights)",
      "Night rainbow",
      "Total lunar eclipse"
    ],
    "correctIndex": 1,
    "explanationAr": "يظهر الشفق القطبي بألوان خضراء وبنفسجية خلابة قرب القطبين الشمالي والجنوبي.",
    "explanationEn": "Charged solar particles excite upper-atmospheric gases to create shimmering auroras near Earth’s poles."
  },
  {
    "id": "q_gen_84",
    "level": 6,
    "category": "general",
    "topic": "nature",
    "questionAr": "ما اسم أكبر حاجز للشعاب المرجانية في العالم والواقع قبالة الساحل الشمالي الشرقي لأستراليا؟",
    "questionEn": "What is the largest coral reef system in the world, located off the northeastern coast of Australia?",
    "optionsAr": [
      "مرتفع هاواي الجليدي",
      "الحاجز المرجاني العظيم",
      "خندق ماريانا",
      "شعب البحر البلطيقي"
    ],
    "optionsEn": [
      "Hawaiian Ice Shelf",
      "The Great Barrier Reef",
      "Mariana Trench",
      "Baltic Reef"
    ],
    "correctIndex": 1,
    "explanationAr": "يمتد الحاجز المرجاني العظيم أكثر من 2,300 كيلومتر ويمكن رؤيته من الفضاء.",
    "explanationEn": "Stretching over 2,300 km along Queensland, the Great Barrier Reef is visible from space."
  },
  {
    "id": "q_gen_85",
    "level": 7,
    "category": "general",
    "topic": "nature",
    "questionAr": "ما نوع الحيتان والدلافين والخفافيش من حيث التصنيف البيولوجي للفقاريات؟",
    "questionEn": "To which vertebrate class do whales, dolphins, and bats all biologically belong?",
    "optionsAr": [
      "الثدييات",
      "الزواحف",
      "الأسماك الغضروفية",
      "البرمائيات"
    ],
    "optionsEn": [
      "Mammals",
      "Reptiles",
      "Cartilaginous fish",
      "Amphibians"
    ],
    "correctIndex": 0,
    "explanationAr": "كلها من ذوات الدم الحار، تلد وترضع صغارها الحليب، وتتنفس الهواء عبر الرئتين.",
    "explanationEn": "Despite swimming or flying, whales, dolphins, and bats are warm-blooded, air-breathing mammals."
  },
  {
    "id": "q_gen_86",
    "level": 8,
    "category": "general",
    "topic": "nature",
    "questionAr": "ما الاسم العلمي للحركة الدائمة التي تتبادل فيها المياه بين المحيطات والجو واليابسة عبر التبخر والتكثف والهطول؟",
    "questionEn": "What is the continuous circulation of water between Earth’s oceans, atmosphere, and land called?",
    "optionsAr": [
      "الاحتباس الجيولوجي",
      "الانحراف المغناطيسي",
      "التآكل النيزكي",
      "دورة الماء في الطبيعة (الدورة الهيدرولوجية)"
    ],
    "optionsEn": [
      "Geological trapping",
      "Magnetic drift",
      "Meteoritic erosion",
      "The Water Cycle (Hydrologic Cycle)"
    ],
    "correctIndex": 3,
    "explanationAr": "تدور مياه الأرض باستمرار عبر التبخر من المسطحات، والتكثف سحباً، والهطول أمطاراً وثلوجاً.",
    "explanationEn": "Solar heat drives evaporation, condensation into clouds, and precipitation back to Earth."
  },
  {
    "id": "q_gen_87",
    "level": 1,
    "category": "general",
    "topic": "culture",
    "questionAr": "كم عدد ألوان الطيف المرئي في قوس قزح الكلاسيكي؟",
    "questionEn": "How many classic spectral colors make up a traditional rainbow?",
    "optionsAr": [
      "9 ألوان",
      "7 ألوان",
      "5 ألوان",
      "6 ألوان"
    ],
    "optionsEn": [
      "9 colors",
      "7 colors",
      "5 colors",
      "6 colors"
    ],
    "correctIndex": 1,
    "explanationAr": "الألوان السبعة هي: الأحمر والبرتقالي والأصفر والأخضر والأزرق والنيلي والبنفسجي.",
    "explanationEn": "The classic seven bands are red, orange, yellow, green, blue, indigo, and violet."
  },
  {
    "id": "q_gen_88",
    "level": 1,
    "category": "general",
    "topic": "culture",
    "questionAr": "كم يوماً في السنة الكبيسة بالتقويم الميلادي؟",
    "questionEn": "How many total days are in a Gregorian leap year?",
    "optionsAr": [
      "365 يوماً",
      "368 يوماً",
      "366 يوماً",
      "364 يوماً"
    ],
    "optionsEn": [
      "365 days",
      "368 days",
      "366 days",
      "364 days"
    ],
    "correctIndex": 2,
    "explanationAr": "يُضاف يوم 29 فبراير مرة كل أربع سنوات غالباً ليصبح مجموع أيام السنة 366 يوماً.",
    "explanationEn": "A leap year adds February 29, bringing the annual total from 365 to 366 days."
  },
  {
    "id": "q_gen_89",
    "level": 2,
    "category": "general",
    "topic": "culture",
    "questionAr": "ما اسم العملة الموحدة الرسمية المعتمدة في معظم دول منطقة اليورو بالاتحاد الأوروبي؟",
    "questionEn": "What is the official shared currency used by Eurozone member states in the European Union?",
    "optionsAr": [
      "الجنيه الإسترليني",
      "الفرنك السويسري",
      "الين الياباني",
      "اليورو"
    ],
    "optionsEn": [
      "Pound Sterling",
      "Swiss Franc",
      "Japanese Yen",
      "The Euro"
    ],
    "correctIndex": 3,
    "explanationAr": "طُرح اليورو عملةً نقدية متداولة في الأسواق الأوروبية عام 2002.",
    "explanationEn": "Euro banknotes and coins entered physical circulation across Europe in 2002."
  },
  {
    "id": "q_gen_90",
    "level": 2,
    "category": "general",
    "topic": "culture",
    "questionAr": "ما اسم اللوحة الشهيرة التي رسمها الفنان الإيطالي ليوناردو دا فينشي وتُعرض في متحف اللوفر بباريس؟",
    "questionEn": "What is the world-famous portrait painted by Leonardo da Vinci displayed at the Louvre Museum?",
    "optionsAr": [
      "العشاء الأخير بباريس",
      "ليلة النجوم",
      "الصرخة",
      "الموناليزا"
    ],
    "optionsEn": [
      "The Last Supper in Paris",
      "The Starry Night",
      "The Scream",
      "The Mona Lisa"
    ],
    "correctIndex": 3,
    "explanationAr": "تُعد الموناليزا التي رُسمت مطلع القرن السادس عشر أشهر لوحة فنية في العالم.",
    "explanationEn": "Painted in the early 1500s, the Mona Lisa is the centerpiece of the Louvre in Paris."
  },
  {
    "id": "q_gen_91",
    "level": 3,
    "category": "general",
    "topic": "culture",
    "questionAr": "كم عدد الحروف الهجائية الأساسية في اللغة العربية؟",
    "questionEn": "How many letters are in the standard Arabic alphabet?",
    "optionsAr": [
      "26 حرفاً",
      "28 حرفاً",
      "32 حرفاً",
      "24 حرفاً"
    ],
    "optionsEn": [
      "26 letters",
      "28 letters",
      "32 letters",
      "24 letters"
    ],
    "correctIndex": 1,
    "explanationAr": "يتكون الهجاء العربي من 28 حرفاً تبدأ بالألف وتنتهي بالياء.",
    "explanationEn": "The Arabic abjad/alphabet consists of 28 standard letters."
  },
  {
    "id": "q_gen_92",
    "level": 3,
    "category": "general",
    "topic": "culture",
    "questionAr": "ما هي اللغة التي تضم أكبر عدد من المتحدثين بها كلغة أم على مستوى العالم؟",
    "questionEn": "Which language has the highest number of native (first-language) speakers worldwide?",
    "optionsAr": [
      "الصينية الماندرين",
      "الإنجليزية",
      "الفرنسية",
      "الألمانية"
    ],
    "optionsEn": [
      "Mandarin Chinese",
      "English",
      "French",
      "German"
    ],
    "correctIndex": 0,
    "explanationAr": "يتحدث أكثر من 900 مليون إنسان اللغة الصينية الماندرين كلغة أم أولى.",
    "explanationEn": "More than 900 million people speak Mandarin Chinese as their native language."
  },
  {
    "id": "q_gen_93",
    "level": 4,
    "category": "general",
    "topic": "culture",
    "questionAr": "ما اسم الفن الياباني التقليدي المختص بطيّ الورق لصناعة أشكال هندسية ومجسمات دون قص أو لصق؟",
    "questionEn": "What is the traditional Japanese art of folding flat paper into intricate sculptures without cutting or glue?",
    "optionsAr": [
      "الكاليغرافي الغربي",
      "الأوريغامي",
      "الإيكيبانا",
      "السومو"
    ],
    "optionsEn": [
      "Western calligraphy",
      "Origami",
      "Ikebana",
      "Sumo"
    ],
    "correctIndex": 1,
    "explanationAr": "كلمة أوريغامي تعني باليابانية «طيّ الورق» وهي من أشهر الفنون التراثية اليابانية.",
    "explanationEn": "Origami literally means \"folding paper\" in Japanese."
  },
  {
    "id": "q_gen_94",
    "level": 4,
    "category": "general",
    "topic": "culture",
    "questionAr": "في أي مدينة يقع المقر الرئيسي لمنظمة الأمم المتحدة للتربية والعلم والثقافة (اليونسكو)؟",
    "questionEn": "In which city is the headquarters of UNESCO located?",
    "optionsAr": [
      "نيويورك",
      "فيينا",
      "جنيف",
      "باريس"
    ],
    "optionsEn": [
      "New York",
      "Vienna",
      "Geneva",
      "Paris"
    ],
    "correctIndex": 3,
    "explanationAr": "تأسست منظمة اليونسكو عام 1945 ويقع مقرها الرئيسي في العاصمة الفرنسية باريس.",
    "explanationEn": "Founded in 1945, UNESCO is headquartered at Place de Fontenoy in Paris."
  },
  {
    "id": "q_gen_95",
    "level": 5,
    "category": "general",
    "topic": "culture",
    "questionAr": "في أي مدينة هولندية تُلقب القنوات المائية الكثيرة وجسورها بلقب «فينيسيا الشمال»؟",
    "questionEn": "Which Dutch capital city is famous for its concentric ring of canals and wooden bridges?",
    "optionsAr": [
      "أمستردام",
      "برلين",
      "مدريد",
      "فيينا"
    ],
    "optionsEn": [
      "Amsterdam",
      "Berlin",
      "Madrid",
      "Vienna"
    ],
    "correctIndex": 0,
    "explanationAr": "تضم أمستردام أكثر من مئة كيلومتر من القنوات المائية ونحو 1,500 جسر.",
    "explanationEn": "Amsterdam features over 100 km of canals and roughly 1,500 bridges."
  },
  {
    "id": "q_gen_96",
    "level": 5,
    "category": "general",
    "topic": "culture",
    "questionAr": "ما هي الآلة الموسيقية الوترية الشرقية الشهيرة التي يعود اسمها إلى خشب الصنع وتُعد من أعمدة التخت الشرقي؟",
    "questionEn": "Which pear-shaped Arabic stringed instrument is a cornerstone of classical Middle Eastern music?",
    "optionsAr": [
      "الساكسفون",
      "البيانو الكبير",
      "آلة العود",
      "البوق النحاسي"
    ],
    "optionsEn": [
      "Saxophone",
      "Grand piano",
      "The Oud",
      "Brass trumpet"
    ],
    "correctIndex": 2,
    "explanationAr": "يُلقب العود بسلطان الآلات في الموسيقى العربية ومنه اشتُق اسم آلة اللوت الأوروبية.",
    "explanationEn": "The Oud is revered as the centerpiece of Arab music and is the ancestor of the European lute."
  },
  {
    "id": "q_gen_97",
    "level": 6,
    "category": "general",
    "topic": "culture",
    "questionAr": "ما اسم المدينة الإيطالية العائمة التي تتنقل فيها القوارب والجندول عبر القنوات بدلاً من السيارات؟",
    "questionEn": "Which Italian island city relies on canals and gondolas instead of cars for urban transport?",
    "optionsAr": [
      "تورينو",
      "البندقية (فينيسيا)",
      "نابولي",
      "ميلانو"
    ],
    "optionsEn": [
      "Turin",
      "Venice",
      "Naples",
      "Milan"
    ],
    "correctIndex": 1,
    "explanationAr": "بُنيت البندقية على أكثر من مئة جزيرة صغيرة في بحيرة الأدرياتيكي وترتبط بمئات الجسور.",
    "explanationEn": "Built on more than 100 small islands in the Adriatic lagoon, Venice uses waterways instead of roads."
  },
  {
    "id": "q_gen_98",
    "level": 6,
    "category": "general",
    "topic": "culture",
    "questionAr": "ما اسم الشفرة الدولية الشهيرة للاستغاثة في إشارات مورس والمكونة من ثلاث نقاط وثلاث شرطات وثلاث نقاط؟",
    "questionEn": "What is the internationally recognized Morse code distress signal (... --- ...)?",
    "optionsAr": [
      "VIP",
      "GPS",
      "ETA",
      "SOS"
    ],
    "optionsEn": [
      "VIP",
      "GPS",
      "ETA",
      "SOS"
    ],
    "correctIndex": 3,
    "explanationAr": "اعتمدت إشارة SOS عالمياً عام 1906 لسهولة إرسالها وتمييزها في البث اللاسلكي البحري.",
    "explanationEn": "Adopted internationally in 1906, SOS was chosen for its unmistakable rhythmic Morse pattern."
  },
  {
    "id": "q_gen_99",
    "level": 7,
    "category": "general",
    "topic": "culture",
    "questionAr": "ما اسم أقدم جامعة ما زالت مستمرة في العمل ومنح الدرجات العلمية في العالم وفق اليونسكو وموسوعة غينيس؟",
    "questionEn": "Which institution in Fez, Morocco is recognized by UNESCO as the oldest continually operating university?",
    "optionsAr": [
      "جامعة هارفارد",
      "جامعة السوربون",
      "جامعة القرويين (أسست عام 859م)",
      "جامعة كامبريدج"
    ],
    "optionsEn": [
      "Harvard University",
      "Sorbonne University",
      "University of al-Qarawiyyin (founded 859 CE)",
      "University of Cambridge"
    ],
    "correctIndex": 2,
    "explanationAr": "أسستها فاطمة الفهرية في مدينة فاس المغربية عام 859م ولا تزال قائمة حتى اليوم.",
    "explanationEn": "Founded by Fatima al-Fihri in 859 CE in Fez, Morocco, al-Qarawiyyin remains active today."
  },
  {
    "id": "q_gen_100",
    "level": 8,
    "category": "general",
    "topic": "culture",
    "questionAr": "ما اسم الجائزة الأدبية والصحفية العالمية المرموقة التي تُمنح سنوياً في الولايات المتحدة منذ عام 1917؟",
    "questionEn": "What prestigious annual American award recognizes excellence in journalism, literature, and musical composition since 1917?",
    "optionsAr": [
      "جائزة بوليتزر",
      "جائزة تورينج",
      "جائزة نوبل للفيزياء",
      "جائزة بوكر الأدبية"
    ],
    "optionsEn": [
      "The Pulitzer Prize",
      "Turing Award",
      "Nobel Prize in Physics",
      "Booker Prize"
    ],
    "correctIndex": 0,
    "explanationAr": "أُنشئت جائزة بوليتزر بوصية الناشر جوزيف بوليتزر وتديرها جامعة كولومبيا في نيويورك.",
    "explanationEn": "Established under Joseph Pulitzer’s will, the Pulitzer Prizes are administered by Columbia University."
  }
];

const Q_CHUNK_1: Question[] = [
  {
    "id": "q_isl_1",
    "level": 1,
    "category": "islamic",
    "topic": "adam",
    "questionAr": "ما الحرفة التي اشتغل بها نبي الله آدم عليه السلام بعد هبوطه إلى الأرض؟",
    "questionEn": "Which profession did Prophet Adam (AS) practice after descending to Earth?",
    "optionsAr": [
      "صناعة السفن",
      "خياطة الملابس",
      "الزراعة والحراثة",
      "الحدادة وصنع الدروع"
    ],
    "optionsEn": [
      "Shipbuilding",
      "Tailoring clothes",
      "Agriculture and farming",
      "Blacksmithing and armor making"
    ],
    "correctIndex": 2,
    "explanationAr": "اشتغل نبي الله آدم عليه السلام بالزراعة وحرث الأرض وغرسها ليأكل من عمل يده.",
    "explanationEn": "Prophet Adam (AS) practiced farming and tilling the soil to earn his livelihood."
  },
  {
    "id": "q_isl_2",
    "level": 3,
    "category": "islamic",
    "topic": "adam",
    "questionAr": "بماذا فضّل الله آدم عليه السلام على الملائكة عندما أراد جعله خليفة في الأرض؟",
    "questionEn": "With what did Allah honor Prophet Adam (AS) above the angels when appointing him as a vicegerent on Earth?",
    "optionsAr": [
      "علمه الأسماء كلها",
      "منحه ملك سليمان",
      "أنزل عليه التوراة",
      "سخر له الريح"
    ],
    "optionsEn": [
      "Teaching him the names of all things",
      "Granting him Solomon’s kingdom",
      "Revealing the Torah to him",
      "Subjecting the wind to him"
    ],
    "correctIndex": 0,
    "explanationAr": "قال تعالى: ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ ثم عرضهم على الملائكة.",
    "explanationEn": "Allah says in the Quran: \"And He taught Adam the names – all of them\" (Al-Baqarah 2:31)."
  },
  {
    "id": "q_isl_3",
    "level": 2,
    "category": "islamic",
    "topic": "adam",
    "questionAr": "من الذي امتنع عن السجود لآدم عليه السلام تكبراً واستعلاءً؟",
    "questionEn": "Who refused out of arrogance to prostrate to Adam (AS) when commanded by Allah?",
    "optionsAr": [
      "قارون",
      "قابيل",
      "النمرود",
      "إبليس"
    ],
    "optionsEn": [
      "Qarun",
      "Qabil",
      "Nimrod",
      "Iblis"
    ],
    "correctIndex": 3,
    "explanationAr": "أمر الله الملائكة بالسجود لآدم فسجدوا إلا إبليس أبى واستكبر وكان من الكافرين.",
    "explanationEn": "All the angels prostrated as commanded except Iblis, who refused out of pride."
  },
  {
    "id": "q_isl_4",
    "level": 5,
    "category": "islamic",
    "topic": "idris",
    "questionAr": "ما المهنة والحرفة التي اشتهر بها نبي الله إدريس عليه السلام وكان أول من عمل بها؟",
    "questionEn": "Which craft was Prophet Idris (AS) famous for being the first to practice?",
    "optionsAr": [
      "النحت في الجبال",
      "الغوص في البحار",
      "الخياطة وخياطة الثياب",
      "صناعة الفخار"
    ],
    "optionsEn": [
      "Mountain carving",
      "Deep-sea diving",
      "Tailoring and sewing garments",
      "Pottery making"
    ],
    "correctIndex": 2,
    "explanationAr": "ذُكر أن نبي الله إدريس عليه السلام كان خياطاً وأول من خاط الثياب وخطّ بالقلم.",
    "explanationEn": "Prophet Idris (AS) is renowned in Islamic tradition as a tailor and the first to sew garments and write with a pen."
  },
  {
    "id": "q_isl_5",
    "level": 6,
    "category": "islamic",
    "topic": "idris",
    "questionAr": "ما المنزلة التي أشار إليها القرآن الكريم في حق نبي الله إدريس عليه السلام في سورة مريم؟",
    "questionEn": "What elevated status does Surah Maryam mention Allah bestowed upon Prophet Idris (AS)?",
    "optionsAr": [
      "جعلناه على خزائن الأرض",
      "أسلنا له عين القطر",
      "ورفعناه مكاناً علياً",
      "نجيناه في بطن الحوت"
    ],
    "optionsEn": [
      "Appointing him over Earth’s storehouses",
      "Causing molten copper to flow for him",
      "Raising him to a high station",
      "Saving him inside a whale"
    ],
    "correctIndex": 2,
    "explanationAr": "قال الله تعالى في سورة مريم: ﴿وَاذْكُرْ فِي الْكِتَابِ إِدْرِيسَ إِنَّهُ كَانَ صِدِّيقاً نَبِيّاً * وَرَفَعْنَاهُ مَكَاناً عَلِيّاً﴾.",
    "explanationEn": "Surah Maryam states: \"And mention in the Book, Idris. Indeed, he was a man of truth and a prophet. And We raised him to a high station.\""
  },
  {
    "id": "q_isl_6",
    "level": 7,
    "category": "islamic",
    "topic": "idris",
    "questionAr": "بأي أداة كان نبي الله إدريس عليه السلام أول من كتب بها في التاريخ؟",
    "questionEn": "With which writing instrument was Prophet Idris (AS) known as the first to write?",
    "optionsAr": [
      "النول الخشبي",
      "السيف",
      "القلم",
      "الإزميل الحديدي"
    ],
    "optionsEn": [
      "The wooden loom",
      "The sword",
      "The pen",
      "The iron chisel"
    ],
    "correctIndex": 2,
    "explanationAr": "اشتهر إدريس عليه السلام بأنه أول من خط بالقلم وعلم الناس الكتابة والحساب.",
    "explanationEn": "Prophet Idris (AS) is celebrated as the first prophet to write with the pen."
  },
  {
    "id": "q_isl_7",
    "level": 2,
    "category": "islamic",
    "topic": "nuh",
    "questionAr": "ما الحرفة التي اشتغل بها نبي الله نوح عليه السلام بأمر الله ووحيِه؟",
    "questionEn": "Which craft did Prophet Nuh (AS) practice by Allah’s command and revelation?",
    "optionsAr": [
      "الحدادة وصهر النحاس",
      "الصيرفة والتجارة",
      "النجارة وصناعة السفينة",
      "صناعة الزجاج"
    ],
    "optionsEn": [
      "Iron and copper smelting",
      "Banking and trade",
      "Carpentry and shipbuilding",
      "Glassblowing"
    ],
    "correctIndex": 2,
    "explanationAr": "صنع نوح عليه السلام الفلك بأعين الله ووحيه، فكان يعمل بالنجارة.",
    "explanationEn": "Prophet Nuh (AS) built the Ark under Allah’s supervision, making him a master carpenter."
  },
  {
    "id": "q_isl_8",
    "level": 4,
    "category": "islamic",
    "topic": "nuh",
    "questionAr": "كم سنة لبث نبي الله نوح عليه السلام يدعو قومه إلى توحيد الله؟",
    "questionEn": "For how many years did Prophet Nuh (AS) remain calling his people to Allah?",
    "optionsAr": [
      "ألف سنة إلا خمسين عاماً (950 سنة)",
      "خمسمائة سنة",
      "ثلاثمائة سنة",
      "مائة وعشرون سنة"
    ],
    "optionsEn": [
      "Nine hundred and fifty years (1,000 minus 50)",
      "Five hundred years",
      "Three hundred years",
      "One hundred and twenty years"
    ],
    "correctIndex": 0,
    "explanationAr": "قال تعالى: ﴿فَلَبِثَ فِيهِمْ أَلْفَ سَنَةٍ إِلَّا خَمْسِينَ عَاماً﴾.",
    "explanationEn": "The Quran explicitly mentions: \"And he remained among them a thousand years minus fifty years\" (Al-Ankabut 29:14)."
  },
  {
    "id": "q_isl_9",
    "level": 5,
    "category": "islamic",
    "topic": "nuh",
    "questionAr": "ما اسم الجبل الذي استوت عليه سفينة نوح عليه السلام بعد انتهاء الطوفان؟",
    "questionEn": "What is the name of the mountain on which Prophet Nuh’s Ark came to rest?",
    "optionsAr": [
      "جبل الطور",
      "جبل أحد",
      "الجودي",
      "جبل قاسيون"
    ],
    "optionsEn": [
      "Mount Tur",
      "Mount Uhud",
      "Mount Judi",
      "Mount Qasioun"
    ],
    "correctIndex": 2,
    "explanationAr": "قال تعالى: ﴿وَاسْتَوَتْ عَلَى الْجُودِيِّ وَقِيلَ بُعْداً لِلْقَوْمِ الظَّالِمِينَ﴾.",
    "explanationEn": "Allah says in Surah Hud: \"And the ship rested on Mount Judi\" (11:44)."
  },
  {
    "id": "q_isl_10",
    "level": 6,
    "category": "islamic",
    "topic": "nuh",
    "questionAr": "ما العلامة التي جعلها الله لنوح عليه السلام إيذاناً ببدء الطوفان وركوب السفينة؟",
    "questionEn": "What physical sign marked the beginning of the Flood and the command for Nuh (AS) to board the Ark?",
    "optionsAr": [
      "فوران التنور بالماء",
      "توقف الرياح تماماً",
      "انهيار السد العظيم",
      "كسوف الشمس ثلاثاً"
    ],
    "optionsEn": [
      "Water gushing forth from the oven (Tannur)",
      "Complete stillness of wind",
      "Collapse of the Great Dam",
      "Three solar eclipses"
    ],
    "correctIndex": 0,
    "explanationAr": "قال تعالى: ﴿حَتَّى إِذَا جَاءَ أَمْرُنَا وَفَارَ التَّنُّورُ قُلْنَا احْمِلْ فِيهَا مِنْ كُلٍّ زَوْجَيْنِ اثْنَيْنِ﴾.",
    "explanationEn": "When the oven gushed forth with water (\"fara at-tannur\"), Nuh (AS) loaded pairs of every species aboard."
  },
  {
    "id": "q_isl_11",
    "level": 3,
    "category": "islamic",
    "topic": "hud",
    "questionAr": "إلى أي قوم أُرسل نبي الله هود عليه السلام في منطقة الأحقاف؟",
    "questionEn": "To which ancient nation living in Al-Ahqaf was Prophet Hud (AS) sent?",
    "optionsAr": [
      "قوم ثمود",
      "أصحاب مدين",
      "أصحاب الأيكة",
      "قوم عاد"
    ],
    "optionsEn": [
      "The people of Thamud",
      "The people of Madyan",
      "The Companions of the Wood",
      "The people of Ad"
    ],
    "correctIndex": 3,
    "explanationAr": "أرسل الله نبيه هوداً عليه السلام إلى قوم عاد الذين كانوا يسكنون الأحقاف.",
    "explanationEn": "Prophet Hud (AS) was sent as a messenger to the powerful tribe of Ad in Al-Ahqaf."
  },
  {
    "id": "q_isl_12",
    "level": 8,
    "category": "islamic",
    "topic": "hud",
    "questionAr": "ما العمل والمهنة التي اشتغل بها نبي الله هود عليه السلام لطلب الرزق؟",
    "questionEn": "Which occupation did Prophet Hud (AS) engage in to earn his living?",
    "optionsAr": [
      "حفر الآبار",
      "التجارة",
      "صياغة الذهب",
      "نسج الحرير"
    ],
    "optionsEn": [
      "Well digging",
      "Trade and commerce",
      "Goldsmithing",
      "Silk weaving"
    ],
    "correctIndex": 1,
    "explanationAr": "ذكر المؤرخون أن نبي الله هوداً عليه السلام (وكذلك صالحاً) كان يعمل بالتجارة.",
    "explanationEn": "Classical Islamic historians record that Prophet Hud (AS) worked as a merchant."
  },
  {
    "id": "q_isl_13",
    "level": 5,
    "category": "islamic",
    "topic": "hud",
    "questionAr": "بأي عذاب أهلك الله قوم عاد الذين كذبوا نبيهم هوداً عليه السلام؟",
    "questionEn": "By what punishment were the people of Ad destroyed after rejecting Prophet Hud (AS)?",
    "optionsAr": [
      "بطوفان أغرق جبالهم",
      "بريح صرصر عاتية سبع ليال وثمانية أيام",
      "بخسف الأرض بهم فقط",
      "بجراد وقمل وضفادع"
    ],
    "optionsEn": [
      "A flood covering their peaks",
      "A furious howling wind lasting seven nights and eight days",
      "Solely sinking into the earth",
      "Locusts, lice, and frogs"
    ],
    "correctIndex": 1,
    "explanationAr": "قال تعالى: ﴿وَأَمَّا عَادٌ فَأُهْلِكُوا بِرِيحٍ صَرْصَرٍ عَاتِيَةٍ سَخَّرَهَا عَلَيْهِمْ سَبْعَ لَيَالٍ وَثَمَانِيَةَ أَيَّامٍ حُسُوماً﴾.",
    "explanationEn": "Surah Al-Haqqah describes the fierce wind unleashed upon Ad for seven nights and eight days."
  },
  {
    "id": "q_isl_14",
    "level": 4,
    "category": "islamic",
    "topic": "salih",
    "questionAr": "ما المعجزة الحسية الباهرة التي أيد الله بها نبيه صالحاً عليه السلام أمام قوم ثمود؟",
    "questionEn": "What miraculous sign did Allah grant Prophet Salih (AS) for the people of Thamud?",
    "optionsAr": [
      "تحول العصا إلى ثعبان",
      "تسخير الجبال للتسبيح",
      "انشقاق القمر نصفين",
      "ناقة الله التي خرجت من الصخرة"
    ],
    "optionsEn": [
      "A staff turning into a serpent",
      "Mountains glorifying Allah",
      "Splitting of the moon",
      "The she-camel brought forth from a solid rock"
    ],
    "correctIndex": 3,
    "explanationAr": "أخرج الله لقوم ثمود ناقة عظيمة من صخرة صماء آية على صدق نبيهم صالح عليه السلام.",
    "explanationEn": "Allah caused a remarkable she-camel to emerge from solid rock as a clear sign for Thamud."
  },
  {
    "id": "q_isl_15",
    "level": 5,
    "category": "islamic",
    "topic": "salih",
    "questionAr": "ما اسم المنطقة الأثرية التي سكنها قوم ثمود ونحتوا بيوتهم في جبالها؟",
    "questionEn": "What is the name of the rocky valley where Thamud carved homes in the mountains?",
    "optionsAr": [
      "سد مأرب",
      "الحِجر (مدائن صالح)",
      "وادي بكة",
      "أرض بابل"
    ],
    "optionsEn": [
      "Dam of Marib",
      "Al-Hijr",
      "Valley of Bakkah",
      "Land of Babylon"
    ],
    "correctIndex": 1,
    "explanationAr": "أُطلق القرآن على ديار ثمود اسم «الحِجر» حيث كانوا ينحتون من الجبال بيوتاً آمنين.",
    "explanationEn": "The Quran calls the homeland of Thamud \"Al-Hijr,\" where they carved dwellings into mountains."
  },
  {
    "id": "q_isl_16",
    "level": 9,
    "category": "islamic",
    "topic": "salih",
    "questionAr": "ما العمل الذي كان يزاوله نبي الله صالح عليه السلام قبل نبوته وأثناءها؟",
    "questionEn": "Which livelihood did Prophet Salih (AS) practice to sustain himself?",
    "optionsAr": [
      "التجارة ورعاية الإبل",
      "صناعة الأسلحة الحديدية",
      "تعدين الفضة",
      "كتابة الصكوك الملكية"
    ],
    "optionsEn": [
      "Trade and tending camels",
      "Forging iron weapons",
      "Silver mining",
      "Royal scribing"
    ],
    "correctIndex": 0,
    "explanationAr": "عُرف عن نبي الله صالح عليه السلام اشتغاله بالتجارة واهتمامه برعاية الإبل في ديار ثمود.",
    "explanationEn": "Prophet Salih (AS) worked in commerce and tending camels in the land of Thamud."
  },
  {
    "id": "q_isl_17",
    "level": 2,
    "category": "islamic",
    "topic": "ibrahim",
    "questionAr": "ما اللقب الذي اختص الله به نبيه إبراهيم عليه السلام في القرآن الكريم؟",
    "questionEn": "Which honorable title did Allah bestow upon Prophet Ibrahim (AS) in the Quran?",
    "optionsAr": [
      "خليل الله (خليل الرحمن)",
      "كليم الله",
      "ذو النون",
      "إسرائيل"
    ],
    "optionsEn": [
      "Khalilullah (The Close Friend of Allah)",
      "Kalimullah",
      "Dhul-Nun",
      "Israel"
    ],
    "correctIndex": 0,
    "explanationAr": "قال الله تعالى في سورة النساء: ﴿وَاتَّخَذَ اللَّهُ إِبْرَاهِيمَ خَلِيلاً﴾.",
    "explanationEn": "Surah An-Nisa (4:125) declares: \"And Allah took Ibrahim as an intimate friend (Khalil).\""
  },
  {
    "id": "q_isl_18",
    "level": 4,
    "category": "islamic",
    "topic": "ibrahim",
    "questionAr": "ما العمل الجليل الذي شارك فيه إبراهيم عليه السلام مع ابنه إسماعيل في مكة؟",
    "questionEn": "Which monumental construction work did Ibrahim (AS) perform together with his son Ismail (AS) in Makkah?",
    "optionsAr": [
      "رفع القواعد وبناء الكعبة المشرفة",
      "تشييد سد ذي القرنين",
      "حفر الخندق حول المدينة",
      "بناء قصر غمدان"
    ],
    "optionsEn": [
      "Raising the foundations and building the Holy Kaaba",
      "Erecting the Barrier of Dhul-Qarnayn",
      "Digging the Trench around Madinah",
      "Building Ghumdan Palace"
    ],
    "correctIndex": 0,
    "explanationAr": "كان إبراهيم وإسماعيل عليهما السلام يعملان في البناء ورفع قواعد البيت الحرام.",
    "explanationEn": "Ibrahim and Ismail (AS) labored in masonry to raise the foundations of the Sacred House (Kaaba)."
  },
  {
    "id": "q_isl_19",
    "level": 3,
    "category": "islamic",
    "topic": "ibrahim",
    "questionAr": "كيف أنجى الله إبراهيم عليه السلام عندما ألقاه النمرود وقومه في النار العظيمة؟",
    "questionEn": "How did Allah save Prophet Ibrahim (AS) when Nimrod’s people cast him into the blazing fire?",
    "optionsAr": [
      "انشقت الأرض فاختبأ فيها",
      "جعل الله النار برداً وسلاماً عليه",
      "حمله الطير بعيداً عن النار",
      "أرسل ريحاً أطفأت النار قبل سقوطه"
    ],
    "optionsEn": [
      "The earth split to shelter him",
      "Allah commanded the fire to be coolness and peace for him",
      "Birds carried him far away",
      "A wind blew out the fire before he fell"
    ],
    "correctIndex": 1,
    "explanationAr": "قال الله تعالى: ﴿قُلْنَا يَا نَارُ كُونِي بَرْداً وَسَلَاماً عَلَى إِبْرَاهِيمَ﴾.",
    "explanationEn": "Allah commanded: \"O fire, be coolness and safety upon Ibrahim\" (Al-Anbiya 21:69)."
  },
  {
    "id": "q_isl_20",
    "level": 5,
    "category": "islamic",
    "topic": "ibrahim",
    "questionAr": "ما المهنة التي اشتغل بها نبي الله إبراهيم عليه السلام لكسب رزقه في حياته إلى جانب البناء؟",
    "questionEn": "Besides building the Kaaba, what livelihood did Prophet Ibrahim (AS) practice?",
    "optionsAr": [
      "صناعة السفن البحرية",
      "الزراعة ورعي الأنعام",
      "النجارة في قصر فرعون",
      "صياغة السيوف"
    ],
    "optionsEn": [
      "Building ocean ships",
      "Agriculture and herding livestock",
      "Carpentry in Pharaoh’s palace",
      "Forging swords"
    ],
    "correctIndex": 1,
    "explanationAr": "اشتغل إبراهيم عليه السلام برعي المواشي والزراعة كما بنى البيت الحرام بيديه.",
    "explanationEn": "Prophet Ibrahim (AS) tended livestock and farmed in addition to his masonry work at the Kaaba."
  },
  {
    "id": "q_isl_21",
    "level": 6,
    "category": "islamic",
    "topic": "ibrahim",
    "questionAr": "لماذا ترك إبراهيم عليه السلام أكبر صنم سالماً عندما حطم أصنام قومه؟",
    "questionEn": "Why did Prophet Ibrahim (AS) leave the largest idol unbroken after smashing the rest?",
    "optionsAr": [
      "خوفاً من النمرود",
      "لأنه عجز عن تحطيمه لثقله",
      "ليحتج عليهم به ويقيم الحجة أن الأصنام لا تنطق ولا تدافع عن نفسها",
      "ليأخذه معه في هجرته"
    ],
    "optionsEn": [
      "Out of fear of Nimrod",
      "Because it was too heavy to break",
      "To expose their helplessness and prove idols cannot speak or defend themselves",
      "To carry it on his migration"
    ],
    "correctIndex": 2,
    "explanationAr": "قال لهم: ﴿بَلْ فَعَلَهُ كَبِيرُهُمْ هَذَا فَاسْأَلُوهُمْ إِنْ كَانُوا يَنْطِقُونَ﴾ ليدركوا بطلان عبادتها.",
    "explanationEn": "He invited them to ask the largest idol so they would realize idols cannot speak, hear, or act."
  },
  {
    "id": "q_isl_22",
    "level": 4,
    "category": "islamic",
    "topic": "lut",
    "questionAr": "ما صلة القرابة بين نبي الله لوط ونبي الله إبراهيم عليهما السلام؟",
    "questionEn": "What was the family relationship between Prophet Lut (AS) and Prophet Ibrahim (AS)?",
    "optionsAr": [
      "لوط أخو إبراهيم الشقيق",
      "لوط ابن أخ إبراهيم عليه السلام",
      "لوط والد إبراهيم",
      "لوط ابن عم إبراهيم"
    ],
    "optionsEn": [
      "Lut was Ibrahim’s full brother",
      "Lut was Ibrahim’s nephew (brother’s son)",
      "Lut was Ibrahim’s father",
      "Lut was Ibrahim’s cousin"
    ],
    "correctIndex": 1,
    "explanationAr": "آمن لوط عليه السلام بعمه إبراهيم وهاجر معه ثم بعثه الله إلى أهل سدوم.",
    "explanationEn": "Prophet Lut (AS) was the nephew of Prophet Ibrahim (AS) and migrated with him."
  },
  {
    "id": "q_isl_23",
    "level": 5,
    "category": "islamic",
    "topic": "lut",
    "questionAr": "كيف أنجى الله نبيه لوطاً عليه السلام وأهله المؤمنين من عذاب قريتهم؟",
    "questionEn": "How did Allah rescue Prophet Lut (AS) and his believing family before the destruction of their city?",
    "optionsAr": [
      "صعدوا على سفينة في البحر",
      "أمره بالسير ليلاً وألا يلتفت أحد منهم إلا امرأته الهالكة",
      "حلقوا فوق السحاب",
      "اختبأوا في كهف لمدة سنة"
    ],
    "optionsEn": [
      "They sailed away on a ship",
      "He commanded him to depart by night without looking back, leaving behind his sinful wife",
      "They rose into the clouds",
      "They hid in a cave for a year"
    ],
    "correctIndex": 1,
    "explanationAr": "أرسل الله الملائكة لبشرى لوط بالنجاة ليلاً وأمرهم ألا يلتفتوا حتى نزل العذاب بالقرية.",
    "explanationEn": "Angels instructed Lut (AS) to travel out by night with his family and never look back."
  },
  {
    "id": "q_isl_24",
    "level": 3,
    "category": "islamic",
    "topic": "ismail",
    "questionAr": "ما البئر المباركة التي تفجرت تحت قدمي إسماعيل عليه السلام وأمه هاجر في مكة؟",
    "questionEn": "Which blessed well sprang forth beneath the feet of infant Ismail (AS) and Hajar in Makkah?",
    "optionsAr": [
      "بئر معونة",
      "بئر زمزم",
      "بئر أريس",
      "بئر رومة"
    ],
    "optionsEn": [
      "Well of Maunah",
      "The Well of Zamzam",
      "Well of Aris",
      "Well of Rumah"
    ],
    "correctIndex": 1,
    "explanationAr": "ضرب جبريل عليه السلام الأرض بجناحه أو عقبه فنبعت بئر زمزم المباركة سقياً لهاجر وإسماعيل.",
    "explanationEn": "Zamzam miraculously gushed forth in the barren valley of Makkah for Hajar and Ismail (AS)."
  },
  {
    "id": "q_isl_25",
    "level": 7,
    "category": "islamic",
    "topic": "ismail",
    "questionAr": "ما الأعمال التي عُرف بها نبي الله إسماعيل عليه السلام في حياته بمكة؟",
    "questionEn": "Which skills and occupations was Prophet Ismail (AS) renowned for in Makkah?",
    "optionsAr": [
      "حياكة السجاد",
      "صناعة السفن الضخمة",
      "البناء والصيد وركوب الخيل",
      "صياغة الفضة فقط"
    ],
    "optionsEn": [
      "Carpet weaving",
      "Building massive ships",
      "Masonry, hunting, archery, and horsemanship",
      "Silversmithing only"
    ],
    "correctIndex": 2,
    "explanationAr": "عاش إسماعيل عليه السلام قناصاً ماهراً ورامياً، وهو أول من ركب الخيل، وبنى الكعبة مع أبيه.",
    "explanationEn": "Prophet Ismail (AS) was a skilled hunter, archer, the first to tame and ride horses, and a builder of the Kaaba."
  },
  {
    "id": "q_isl_26",
    "level": 4,
    "category": "islamic",
    "topic": "ismail",
    "questionAr": "بم فدى الله نبي الله إسماعيل عليه السلام عندما استسلم لأمر الذبح؟",
    "questionEn": "With what did Allah ransom Prophet Ismail (AS) when he and his father submitted to the command?",
    "optionsAr": [
      "بذبح عظيم (كبش من الجنة)",
      "بمئة ناقة بيضاء",
      "بكنز من الذهب",
      "بفدية مالية لقومه"
    ],
    "optionsEn": [
      "A great sacrifice (a noble ram)",
      "One hundred white camels",
      "A treasure of gold",
      "A monetary ransom"
    ],
    "correctIndex": 0,
    "explanationAr": "قال الله تعالى: ﴿وَفَدَيْنَاهُ بِذِبْحٍ عَظِيمٍ﴾ وبقيت سنة الأضحية إحياءً لهذا الفداء.",
    "explanationEn": "Allah says: \"And We ransomed him with a great sacrifice\" (As-Saffat 37:107)."
  },
  {
    "id": "q_isl_27",
    "level": 4,
    "category": "islamic",
    "topic": "ishaq",
    "questionAr": "من أم نبي الله إسحاق عليه السلام التي بشرتها الملائكة به وبابنه يعقوب؟",
    "questionEn": "Who was the mother of Prophet Ishaq (AS), to whom angels gave glad tidings of him and his son Yaqub?",
    "optionsAr": [
      "السيدة آسية",
      "السيدة سارة عليها السلام",
      "السيدة هاجر",
      "السيدة مريم"
    ],
    "optionsEn": [
      "Lady Asiyah",
      "Lady Sarah (AS)",
      "Lady Hajar",
      "Lady Maryam"
    ],
    "correctIndex": 1,
    "explanationAr": "بشرت الملائكة السيدة سارة زوجة إبراهيم بإسحاق ومن وراء إسحاق يعقوب على كبر سنهما.",
    "explanationEn": "The angels gave Sarah (AS) glad tidings of Ishaq and, after Ishaq, Yaqub despite her old age."
  },
  {
    "id": "q_isl_28",
    "level": 6,
    "category": "islamic",
    "topic": "ishaq",
    "questionAr": "في أي منطقة مباركة بُعث نبي الله إسحاق عليه السلام وعمل فيها برعي الأنعام والزراعة؟",
    "questionEn": "In which blessed region did Prophet Ishaq (AS) live, preach, and tend herds and crops?",
    "optionsAr": [
      "بلاد الشام وفلسطين (أرض كنعان)",
      "وادي النيل الأعلى",
      "بلاد ما بين النهرين شرقاً",
      "بلاد اليمن"
    ],
    "optionsEn": [
      "Al-Sham and Palestine (Land of Canaan)",
      "Upper Nile Valley",
      "Eastern Mesopotamia",
      "Yemen"
    ],
    "correctIndex": 0,
    "explanationAr": "عاش نبي الله إسحاق عليه السلام في أرض كنعان بالشام داعياً إلى الله وراعياً للغنم والزراعة.",
    "explanationEn": "Prophet Ishaq (AS) lived in Canaan (Palestine/Al-Sham), calling to Allah while tending flocks and crops."
  },
  {
    "id": "q_isl_29",
    "level": 3,
    "category": "islamic",
    "topic": "yaqub",
    "questionAr": "ما الاسم الآخر لنبي الله يعقوب عليه السلام والذي نُسب إليه بنو هذا الاسم؟",
    "questionEn": "What is the other name of Prophet Yaqub (AS) used in the Quran?",
    "optionsAr": [
      "ذو الكفل",
      "إسرائيل",
      "الخضر",
      "إلياس"
    ],
    "optionsEn": [
      "Dhul-Kifl",
      "Israel",
      "Al-Khidr",
      "Ilyas"
    ],
    "correctIndex": 1,
    "explanationAr": "يعقوب عليه السلام هو نفسه «إسرائيل»، ومن أولاده الاثني عشر تفرع بنو إسرائيل.",
    "explanationEn": "Prophet Yaqub (AS) is Israel, from whose twelve sons the Children of Israel descended."
  },
  {
    "id": "q_isl_30",
    "level": 4,
    "category": "islamic",
    "topic": "yaqub",
    "questionAr": "كيف ارتد البصر إلى نبي الله يعقوب عليه السلام بعد أن ابيضت عيناه من الحزن؟",
    "questionEn": "How was Prophet Yaqub’s eyesight miraculously restored after he went blind from grief?",
    "optionsAr": [
      "بعد مضي مائة عام على الفقد",
      "عندما شرب من نهر النيل",
      "بعد أن وضع التراب على عينيه",
      "عندما أُلقي قميص يوسف على وجهه فارتد بصيراً"
    ],
    "optionsEn": [
      "After a hundred years passed",
      "After drinking from the Nile",
      "After placing dust on his eyes",
      "When Yusuf’s shirt was cast over his face"
    ],
    "correctIndex": 3,
    "explanationAr": "قال تعالى على لسان يوسف: ﴿اذْهَبُوا بِقَمِيصِي هَذَا فَأَلْقُوهُ عَلَى وَجْهِ أَبِي يَأْتِ بَصِيراً﴾.",
    "explanationEn": "Yusuf (AS) sent his shirt to be placed over his father’s face, instantly restoring his sight."
  },
  {
    "id": "q_isl_31",
    "level": 5,
    "category": "islamic",
    "topic": "yaqub",
    "questionAr": "بماذا أوصى يعقوب عليه السلام أبناءه عندما حضره الموت؟",
    "questionEn": "What testament did Prophet Yaqub (AS) ask his sons to uphold when death approached him?",
    "optionsAr": [
      "ببناء قصر منيف في كنعان",
      "بهجر الرعي والزراعة",
      "بتقسيم أموال مصر بينهم",
      "بعبادة الإله الواحد إله آبائه وألا يموتوا إلا وهم مسلمون"
    ],
    "optionsEn": [
      "To build a grand palace in Canaan",
      "To abandon herding and farming",
      "To divide Egypt’s wealth",
      "To worship the One God of their forefathers and die only as Muslims (submitting to Allah)"
    ],
    "correctIndex": 3,
    "explanationAr": "قال تعالى: ﴿أَمْ كُنْتُمْ شُهَدَاءَ إِذْ حَضَرَ يَعْقُوبَ الْمَوْتُ إِذْ قَالَ لِبَنِيهِ مَا تَعْبُدُونَ مِنْ بَعْدِي﴾.",
    "explanationEn": "Yaqub (AS) gathered his sons on his deathbed to affirm their unwavering worship of Allah alone."
  },
  {
    "id": "q_isl_32",
    "level": 4,
    "category": "islamic",
    "topic": "yusuf",
    "questionAr": "ما المهمة والمنصب الكبير الذي تولاه نبي الله يوسف عليه السلام في مصر؟",
    "questionEn": "Which vital economic and administrative office did Prophet Yusuf (AS) hold in Egypt?",
    "optionsAr": [
      "تولي خزائن الأرض وإدارة شؤون التموين والزراعة",
      "قيادة الأسطول البحري",
      "بناء الأهرامات",
      "حراسة الحدود الشرقية"
    ],
    "optionsEn": [
      "Minister over Egypt’s storehouses and food/economic administration",
      "Commanding the naval fleet",
      "Building the pyramids",
      "Guarding the eastern borders"
    ],
    "correctIndex": 0,
    "explanationAr": "قال يوسف عليه السلام لملك مصر: ﴿اجْعَلْنِي عَلَى خَزَائِنِ الْأَرْضِ إِنِّي حَفِيظٌ عَلِيمٌ﴾.",
    "explanationEn": "Prophet Yusuf (AS) asked: \"Appoint me over the storehouses of the land. Indeed, I will be a knowing guardian\" (12:55)."
  },
  {
    "id": "q_isl_33",
    "level": 2,
    "category": "islamic",
    "topic": "yusuf",
    "questionAr": "ما العلم والمعجزة التي اختص الله بها نبيه يوسف عليه السلام منذ صغره؟",
    "questionEn": "What special gift of knowledge did Allah bestow upon Prophet Yusuf (AS) from his youth?",
    "optionsAr": [
      "إبراء الأبرص",
      "تأويل الأحاديث وتعبير الرؤى",
      "التكلم مع الرياح",
      "إلانة الحديد باليد"
    ],
    "optionsEn": [
      "Healing leprosy",
      "Interpreting dreams and visions",
      "Speaking to the winds",
      "Softening iron by hand"
    ],
    "correctIndex": 1,
    "explanationAr": "قال تعالى: ﴿وَكَذَلِكَ يَجْتَبِيكَ رَبُّكَ وَيُعَلِّمُكَ مِنْ تَأْوِيلِ الْأَحَادِيثِ﴾، وقد أول رؤيا السجينين والملك.",
    "explanationEn": "Allah taught Yusuf (AS) the interpretation of dreams, enabling him to save Egypt during the seven lean years."
  },
  {
    "id": "q_isl_34",
    "level": 3,
    "category": "islamic",
    "topic": "yusuf",
    "questionAr": "في أي سورة وردت قصة يوسف عليه السلام كاملة ووُصفت بأنها «أحسن القصص»؟",
    "questionEn": "Which Quranic surah narrates the full story of Prophet Yusuf (AS) and describes it as \"the best of stories\"?",
    "optionsAr": [
      "سورة هود",
      "سورة الأنبياء",
      "سورة القصص",
      "سورة يوسف"
    ],
    "optionsEn": [
      "Surah Hud",
      "Surah Al-Anbiya",
      "Surah Al-Qasas",
      "Surah Yusuf"
    ],
    "correctIndex": 3,
    "explanationAr": "قال تعالى في مطلعها: ﴿نَحْنُ نَقُصُّ عَلَيْكَ أَحْسَنَ الْقَصَصِ بِمَا أَوْحَيْنَا إِلَيْكَ هَذَا الْقُرْآنَ﴾.",
    "explanationEn": "Surah Yusuf begins by declaring that Allah reveals the best of narratives."
  },
  {
    "id": "q_isl_35",
    "level": 6,
    "category": "islamic",
    "topic": "yusuf",
    "questionAr": "كم عدد السنين الخصيبة والسنين العجاف في رؤيا ملك مصر التي فسرها يوسف عليه السلام؟",
    "questionEn": "How many years of plenty followed by famine did Prophet Yusuf (AS) interpret from the King’s dream?",
    "optionsAr": [
      "سبع سنين خصب تعقبها سبع سنين شداد (قحط)",
      "خمس سنين خصب وخمس قحط",
      "ثلاث سنين خصب وعشر قحط",
      "سنة خصب وسبع قحط"
    ],
    "optionsEn": [
      "Seven fertile years followed by seven severe years of drought",
      "Five fertile and five lean years",
      "Three fertile and ten lean years",
      "One fertile and seven lean years"
    ],
    "correctIndex": 0,
    "explanationAr": "فسر يوسف البقرات السمان والسنبلات الخضر بسبع سنين زرعٍ ووفرة، ثم سبع سنين جدب، ثم عام فيه يغاث الناس.",
    "explanationEn": "Yusuf (AS) interpreted seven fat cows and green ears as seven abundant years followed by seven years of famine."
  },
  {
    "id": "q_isl_36",
    "level": 2,
    "category": "islamic",
    "topic": "ayyub",
    "questionAr": "ما الخُلق العظيم الذي يُضرب به المثل بنبي الله أيوب عليه السلام؟",
    "questionEn": "For which noble virtue is Prophet Ayyub (AS) universally remembered as the supreme example?",
    "optionsAr": [
      "رحلاته البحرية",
      "شدة البطش في القتال",
      "بناء المدن العالية",
      "الصبر والاحتساب في البلاء"
    ],
    "optionsEn": [
      "Sea voyages",
      "Fierceness in battle",
      "Building towering cities",
      "Steadfast patience during severe trial"
    ],
    "correctIndex": 3,
    "explanationAr": "أثنى الله على أيوب عليه السلام بقوله: ﴿إِنَّا وَجَدْنَاهُ صَابِراً نِعْمَ الْعَبْدُ إِنَّهُ أَوَّابٌ﴾.",
    "explanationEn": "Allah praised Ayyub (AS): \"Indeed, We found him patient, an excellent servant\" (Sad 38:44)."
  },
  {
    "id": "q_isl_37",
    "level": 5,
    "category": "islamic",
    "topic": "ayyub",
    "questionAr": "كيف جعل الله الشفاء لنبي الله أيوب عليه السلام من مرضه الطويل؟",
    "questionEn": "How did Allah miraculously cure Prophet Ayyub (AS) from his prolonged illness?",
    "optionsAr": [
      "سافر إلى طبيب في بابل",
      "اغتسل بماء زمزم",
      "أمره أن يضرب برجله الأرض فنبع ماء بارد اغتسل وشرب منه",
      "أكل من ثمار شجرة في البحر"
    ],
    "optionsEn": [
      "Visiting a physician in Babylon",
      "Bathing in Zamzam water",
      "He struck the ground with his foot and a cool spring gushed forth for him to bathe in and drink",
      "Eating fruit from a sea tree"
    ],
    "correctIndex": 2,
    "explanationAr": "قال تعالى: ﴿ارْكُضْ بِرِجْلِكَ هَذَا مُغْتَسَلٌ بَارِدٌ وَشَرَابٌ﴾ فشفاه الله وعافاه.",
    "explanationEn": "Allah told him: \"Strike with your foot; this is a cool spring for bathing and drinking\" (Sad 38:42)."
  },
  {
    "id": "q_isl_38",
    "level": 8,
    "category": "islamic",
    "topic": "ayyub",
    "questionAr": "ما العمل الذي كان يملكه ويعمل به نبي الله أيوب عليه السلام في أرض حوران قبل ابتلائه وبعد عافيته؟",
    "questionEn": "What livelihood did Prophet Ayyub (AS) have in the land of Hawran before his trial and after his recovery?",
    "optionsAr": [
      "نقش التماثيل الحجرية",
      "الزراعة ورعاية المواشي والإبل والغنم",
      "نحت الجبال",
      "تجارة اللؤلؤ البحري"
    ],
    "optionsEn": [
      "Carving stone statues",
      "Farming and herding cattle, camels, and sheep",
      "Mountain carving",
      "Sea pearl trading"
    ],
    "correctIndex": 1,
    "explanationAr": "كان أيوب عليه السلام صاحب حرث وزرع ومواشٍ كثيرة من الغنم والبقر والإبل، ثم ردها الله عليه مضاعفة.",
    "explanationEn": "Prophet Ayyub (AS) was blessed with vast farmlands and herds, which Allah restored and doubled after his trial."
  },
  {
    "id": "q_isl_39",
    "level": 4,
    "category": "islamic",
    "topic": "shuayb",
    "questionAr": "ما اللقب المشهور لنبي الله شعيب عليه السلام لحسن بيانه وبلاغته في محاورة قومه؟",
    "questionEn": "By what title was Prophet Shuayb (AS) famously known due to his eloquence?",
    "optionsAr": [
      "صاحب الحوت",
      "خطيب الأنبياء",
      "شيخ المرسلين",
      "كليم الله"
    ],
    "optionsEn": [
      "Companion of the Whale",
      "The Orator of the Prophets",
      "Elder of the Messengers",
      "The One Spoken to by Allah"
    ],
    "correctIndex": 1,
    "explanationAr": "لُقّب شعيب عليه السلام بخطيب الأنبياء لبلاغته وقوة حجته مع أهل مدين.",
    "explanationEn": "Prophet Shuayb (AS) was titled \"Orator of the Prophets\" (Khatib al-Anbiya) for his eloquent preaching."
  },
  {
    "id": "q_isl_40",
    "level": 3,
    "category": "islamic",
    "topic": "shuayb",
    "questionAr": "ما المخالفة الاقتصادية والأخلاقية التي حذر منها نبي الله شعيب عليه السلام أهل مدين؟",
    "questionEn": "Which economic injustice did Prophet Shuayb (AS) warn the people of Madyan against?",
    "optionsAr": [
      "عدم بناء الأهرامات",
      "تطفيف المكيال والميزان وبخس الناس أشياءهم",
      "الإسراف في حفر الآبار",
      "ترك صيد الأسماك يوم السبت"
    ],
    "optionsEn": [
      "Failing to build pyramids",
      "Cheating in weights and measures and defrauding people",
      "Over-digging wells",
      "Fishing on the Sabbath"
    ],
    "correctIndex": 1,
    "explanationAr": "دعا شعيب عليه السلام قومه إلى عبادة الله وإيفاء الكيل والميزان بالقسط وعدم البخس.",
    "explanationEn": "Shuayb (AS) called Madyan to worship Allah alone and give full, honest measure and weight."
  },
  {
    "id": "q_isl_41",
    "level": 7,
    "category": "islamic",
    "topic": "shuayb",
    "questionAr": "ما العمل الذي كان يزاوله شعيب عليه السلام أو آل مدين والذي استأجر عليه موسى عليه السلام؟",
    "questionEn": "Which livelihood did the household in Madyan engage in when hiring Prophet Musa (AS)?",
    "optionsAr": [
      "صناعة المراكب النيلية",
      "الخياطة الملكية",
      "رعي الأغنام والمواشي",
      "نسج السفن"
    ],
    "optionsEn": [
      "Building Nile boats",
      "Royal tailoring",
      "Shepherding sheep and livestock",
      "Weaving sails"
    ],
    "correctIndex": 2,
    "explanationAr": "كان الشيخ الصالح في مدين (وقيل شعيب) ذا غنم ومواشٍ، فاستأجر موسى على رعيها ثماني حجج.",
    "explanationEn": "Herding sheep and livestock was the household’s livelihood in Madyan when Musa (AS) was hired."
  },
  {
    "id": "q_isl_42",
    "level": 1,
    "category": "islamic",
    "topic": "musa",
    "questionAr": "ما اللقب الشهير لنبي الله موسى عليه السلام لأن الله كلمه بلا واسطة عند جبل الطور؟",
    "questionEn": "What is the famous title of Prophet Musa (AS) because Allah spoke to him directly?",
    "optionsAr": [
      "ذبيح الله",
      "كليم الله",
      "روح الله",
      "خليل الله"
    ],
    "optionsEn": [
      "Dhabihullah",
      "Kalimullah (The One Spoken to by Allah)",
      "Ruhullah",
      "Khalilullah"
    ],
    "correctIndex": 1,
    "explanationAr": "قال الله تعالى: ﴿وَكَلَّمَ اللَّهُ مُوسَى تَكْلِيماً﴾، فاختُص بلقب كليم الله.",
    "explanationEn": "The Quran states: \"And Allah spoke to Musa with [direct] speech\" (An-Nisa 4:164)."
  },
  {
    "id": "q_isl_43",
    "level": 5,
    "category": "islamic",
    "topic": "musa",
    "questionAr": "ما المهنة التي عمل بها نبي الله موسى عليه السلام في مدين مدة ثماني إلى عشر سنوات؟",
    "questionEn": "Which occupation did Prophet Musa (AS) work at in Madyan for eight to ten years?",
    "optionsAr": [
      "تجارة الخشب",
      "الخياطة",
      "الحدادة في الجبال",
      "رعي الغنم"
    ],
    "optionsEn": [
      "Timber trade",
      "Tailoring",
      "Mountain blacksmithing",
      "Shepherding sheep"
    ],
    "correctIndex": 3,
    "explanationAr": "عمل موسى عليه السلام راعياً للغنم في مدين مهراً لزواجه مدة ثماني حجج أو عشراً.",
    "explanationEn": "Prophet Musa (AS) worked as a shepherd in Madyan for eight to ten years as his marriage dowry."
  },
  {
    "id": "q_isl_44",
    "level": 2,
    "category": "islamic",
    "topic": "musa",
    "questionAr": "ما المعجزتان الأوليان اللتان أراهما الله لموسى عليه السلام عند الوادي المقدس طوى قبل ذهابه لفرعون؟",
    "questionEn": "What were the first two miracles Allah showed Musa (AS) in the Sacred Valley of Tuwa?",
    "optionsAr": [
      "تسبيح الجبال وإنطاق النمل",
      "انقلاب العصا حيةً واليد البيضاء من غير سوء",
      "إخراج ناقة وفوران التنور",
      "انشقاق القمر وإسالة النحاس"
    ],
    "optionsEn": [
      "Glorifying mountains and talking ants",
      "His staff turning into a serpent and his hand shining bright white without harm",
      "A she-camel and boiling oven",
      "Splitting the moon and molten copper"
    ],
    "correctIndex": 1,
    "explanationAr": "آتاه الله آيتين عظيمتين في البداية: العصا التي تتحول حية تسعى، وإخراج يده من جيبه بيضاء للناظرين.",
    "explanationEn": "Allah granted Musa (AS) the miracle of his staff becoming a snake and his luminous white hand."
  },
  {
    "id": "q_isl_45",
    "level": 3,
    "category": "islamic",
    "topic": "musa",
    "questionAr": "كيف نجّى الله موسى عليه السلام وبني إسرائيل عندما حاصرهم فرعون وجنوده أمام البحر؟",
    "questionEn": "How did Allah save Musa (AS) and the Children of Israel when Pharaoh’s army cornered them at the sea?",
    "optionsAr": [
      "ألقى حجارة ردمت البحر",
      "أوحى إليه أن يضرب البحر بعصاه فانفلق اثني عشر طريقاً يبساً",
      "أرسل لهم سفناً من السماء",
      "بنى جسراً من الحديد"
    ],
    "optionsEn": [
      "Cast stones to fill the sea",
      "Allah commanded him to strike the sea with his staff, parting it into dry paths",
      "Sent ships from the sky",
      "Built an iron bridge"
    ],
    "correctIndex": 1,
    "explanationAr": "ضرب موسى البحر بعصاه فانفلق فكان كل فرق كالطود العظيم، وعبروا وأغرق الله فرعون وجنوده.",
    "explanationEn": "Musa struck the sea with his staff, parting the waters into massive walls so they crossed safely."
  },
  {
    "id": "q_isl_46",
    "level": 4,
    "category": "islamic",
    "topic": "musa",
    "questionAr": "ما اسم الكتاب السماوي الذي أنزله الله على نبيه موسى عليه السلام؟",
    "questionEn": "What is the name of the Divine Scripture revealed to Prophet Musa (AS)?",
    "optionsAr": [
      "الإنجيل",
      "التوراة",
      "الصحف الأولى فقط",
      "الزبور"
    ],
    "optionsEn": [
      "The Gospel (Injil)",
      "The Torah (Tawrat)",
      "The First Scrolls only",
      "The Psalms (Zabur)"
    ],
    "correctIndex": 1,
    "explanationAr": "أنزل الله التوراة على موسى عليه السلام فيها هدى ونور لبني إسرائيل.",
    "explanationEn": "Allah revealed the Torah to Prophet Musa (AS) containing guidance and light."
  },
  {
    "id": "q_isl_47",
    "level": 6,
    "category": "islamic",
    "topic": "musa",
    "questionAr": "ما اسم العبد الصالح الذي سافر إليه موسى عليه السلام ليتعلم من علمه في سورة الكهف؟",
    "questionEn": "What is the name of the righteous servant whom Prophet Musa (AS) traveled to learn from in Surah Al-Kahf?",
    "optionsAr": [
      "الخضر عليه السلام",
      "طالوت",
      "ذو القرنين",
      "لقمان الحكيم"
    ],
    "optionsEn": [
      "Al-Khidr (AS)",
      "Talut",
      "Dhul-Qarnayn",
      "Luqman the Wise"
    ],
    "correctIndex": 0,
    "explanationAr": "انطلق موسى وفتاه يوشع بن نون حتى لقيا الخضر عند مجمع البحرين وتعلم منه حكمة القدر.",
    "explanationEn": "Prophet Musa (AS) met Al-Khidr at the junction of the two seas to learn hidden wisdom."
  },
  {
    "id": "q_isl_48",
    "level": 3,
    "category": "islamic",
    "topic": "harun",
    "questionAr": "لماذا دعا موسى عليه السلام ربه أن يشرك أخاه هارون معه في الرسالة؟",
    "questionEn": "Why did Prophet Musa (AS) ask Allah to make his brother Harun (AS) a partner in his mission?",
    "optionsAr": [
      "ليبقى هارون في مدين",
      "لأن هارون كان ملك مصر",
      "لأن موسى لم يكن يعرف القراءة والكتابة",
      "لأن هارون أفصح منه لساناً فيشد به أزره"
    ],
    "optionsEn": [
      "So Harun could stay in Madyan",
      "Because Harun was King of Egypt",
      "Because Musa could not read",
      "Because Harun was more eloquent in speech and would strengthen his back"
    ],
    "correctIndex": 3,
    "explanationAr": "قال موسى: ﴿وَأَخِي هَارُونُ هُوَ أَفْصَحُ مِنِّي لِسَاناً فَأَرْسِلْهُ مَعِيَ رِدْءاً يُصَدِّقُنِي﴾.",
    "explanationEn": "Musa (AS) prayed for Harun (AS) to join him because he was more eloquent in speech."
  },
  {
    "id": "q_isl_49",
    "level": 6,
    "category": "islamic",
    "topic": "harun",
    "questionAr": "من الذي صنع العجل الذهبي لبني إسرائيل في غياب موسى أثناء إشراف هارون عليه السلام عليهم؟",
    "questionEn": "Who fashioned the golden calf for the Israelites during Musa’s absence while Harun (AS) warned them against it?",
    "optionsAr": [
      "هامان",
      "جالوت",
      "السامري",
      "قارون"
    ],
    "optionsEn": [
      "Haman",
      "Goliath (Jalut)",
      "As-Samiri",
      "Qarun"
    ],
    "correctIndex": 2,
    "explanationAr": "صنع السامري عجلاً جسداً له خوار وأضلهم، ونهاهم هارون عليه السلام بشدة وحرص على عدم تفرقهم.",
    "explanationEn": "As-Samiri sculpted the golden calf, while Harun (AS) earnestly urged the people not to fall into idolatry."
  },
  {
    "id": "q_isl_50",
    "level": 8,
    "category": "islamic",
    "topic": "dhulkifl",
    "questionAr": "لماذا لُقب نبي الله ذو الكفل عليه السلام بهذا الاسم؟",
    "questionEn": "Why was Prophet Dhul-Kifl (AS) given the name meaning \"The Possessor of the Pledge\"?",
    "optionsAr": [
      "لأنه كفل ألف يتيم في مكة",
      "لأنه تكفل بقومه بالصيام والقيام والقضاء بالعدل ووفّى بكفالته",
      "لأنه حمل كفل الجبل على كتفه",
      "لأنه كان تاجراً للقفل الحديدي"
    ],
    "optionsEn": [
      "For sponsoring a thousand orphans in Makkah",
      "Because he pledged to fast by day, pray by night, and judge fairly—and fulfilled it faithfully",
      "For carrying a mountain",
      "For trading iron locks"
    ],
    "correctIndex": 1,
    "explanationAr": "تكفل عليه السلام أمام نبيٍّ قبله بصيام النهار وقيام الليل والقضاء بين الناس دون غضب، فوفّى بذلك.",
    "explanationEn": "He undertook a pledge to maintain daily fasting, nightly worship, and just judgment without anger, fulfilling it completely."
  },
  {
    "id": "q_isl_51",
    "level": 7,
    "category": "islamic",
    "topic": "dhulkifl",
    "questionAr": "ما الصفة التي جمع الله بها بين إسماعيل وإدريس وذي الكفل عليهم السلام في سورة الأنبياء؟",
    "questionEn": "With which shared virtue does Surah Al-Anbiya praise Ismail, Idris, and Dhul-Kifl (AS)?",
    "optionsAr": [
      "كلٌّ من الصابرين",
      "كلهم بنوا الكعبة",
      "كلهم سُخرت لهم الريح",
      "كلهم نزل عليهم الزبور"
    ],
    "optionsEn": [
      "All of them were among the steadfastly patient (As-Sabirin)",
      "All built the Kaaba",
      "All controlled the wind",
      "All received the Zabur"
    ],
    "correctIndex": 0,
    "explanationAr": "قال تعالى: ﴿وَإِسْمَاعِيلَ وَإِدْرِيسَ وَذَا الْكِفْلِ كُلٌّ مِنَ الصَّابِرِينَ﴾.",
    "explanationEn": "Surah Al-Anbiya (21:85) states: \"And Ismail and Idris and Dhul-Kifl; all were of the patient.\""
  },
  {
    "id": "q_isl_52",
    "level": 3,
    "category": "islamic",
    "topic": "dawud",
    "questionAr": "ما الحرفة التي اشتغل بها نبي الله داود عليه السلام مع أنه كان ملكاً عظيماً؟",
    "questionEn": "Which manual trade did Prophet Dawud (AS) practice despite being a great king?",
    "optionsAr": [
      "صناعة السفن",
      "الحدادة وصناعة الدروع السابغات",
      "نحت التماثيل",
      "حياكة الحرير"
    ],
    "optionsEn": [
      "Shipbuilding",
      "Blacksmithing and crafting coats of mail (armor)",
      "Sculpting statues",
      "Silk weaving"
    ],
    "correctIndex": 1,
    "explanationAr": "أكل داود عليه السلام من عمل يده؛ إذ كان يصنع الدروع الحديدية المتداخلة الحلقات.",
    "explanationEn": "Prophet Dawud (AS) ate from the work of his own hands by forging interlocking iron armor."
  },
  {
    "id": "q_isl_53",
    "level": 4,
    "category": "islamic",
    "topic": "dawud",
    "questionAr": "ما المعجزة المادية التي اختص الله بها داود عليه السلام في التعامل مع الحديد؟",
    "questionEn": "What physical miracle did Allah grant Prophet Dawud (AS) when working with iron?",
    "optionsAr": [
      "تحويل الحديد إلى ذهب خالص",
      "رفع الحديد في الهواء بالريح",
      "إذابة الجبال بلمسة واحدة",
      "ألان له الحديد في يده كالشمع أو العجين دون نار"
    ],
    "optionsEn": [
      "Turning iron into pure gold",
      "Floating iron in mid-air",
      "Melting mountains with one touch",
      "Softening solid iron in his hands like wax or dough without fire"
    ],
    "correctIndex": 3,
    "explanationAr": "قال الله تعالى: ﴿وَأَلَنَّا لَهُ الْحَدِيدَ * أَنِ اعْمَلْ سَابِغَاتٍ وَقَدِّرْ فِي السَّرْدِ﴾.",
    "explanationEn": "Allah says: \"And We made pliable for him iron, saying: Make full coats of mail and calculate precisely the links\" (Saba 34:10-11)."
  },
  {
    "id": "q_isl_54",
    "level": 4,
    "category": "islamic",
    "topic": "dawud",
    "questionAr": "ما اسم الكتاب السماوي الذي أنزله الله على نبيه داود عليه السلام؟",
    "questionEn": "Which Divine Scripture was revealed to Prophet Dawud (AS)?",
    "optionsAr": [
      "صحف إبراهيم",
      "الزبور",
      "الإنجيل",
      "التوراة"
    ],
    "optionsEn": [
      "Scrolls of Ibrahim",
      "The Psalms (Az-Zabur)",
      "The Gospel",
      "The Torah"
    ],
    "correctIndex": 1,
    "explanationAr": "قال الله تعالى: ﴿وَآتَيْنَا دَاوُودَ زَبُوراً﴾، وكانت الجبال والطير تسبح معه عند تلاوته.",
    "explanationEn": "Allah revealed the Zabur to Dawud (AS), and the mountains and birds echoed his glorification."
  },
  {
    "id": "q_isl_55",
    "level": 5,
    "category": "islamic",
    "topic": "dawud",
    "questionAr": "من القائد المتجبر الذي قتله داود عليه السلام بمقلاعه وهو شاب في جيش طالوت؟",
    "questionEn": "Which mighty tyrant did young Dawud (AS) slay with a sling while serving in Talut’s army?",
    "optionsAr": [
      "النمرود",
      "بختنصر",
      "جالوت",
      "هامان"
    ],
    "optionsEn": [
      "Nimrod",
      "Nebuchadnezzar",
      "Goliath (Jalut)",
      "Haman"
    ],
    "correctIndex": 2,
    "explanationAr": "قال تعالى: ﴿وَقَتَلَ دَاوُودُ جَالُوتَ وَآتَاهُ اللَّهُ الْمُلْكَ وَالْحِكْمَةَ﴾.",
    "explanationEn": "The Quran records: \"And Dawud killed Goliath, and Allah gave him the kingship and wisdom\" (2:251)."
  },
  {
    "id": "q_isl_56",
    "level": 7,
    "category": "islamic",
    "topic": "sulayman",
    "questionAr": "ما الحرفة اليدوية البسيطة التي اشتغل بها نبي الله سليمان عليه السلام ليأكل من عمل يده رغم ملكه العظيم؟",
    "questionEn": "Which humble handcraft did Prophet Sulayman (AS) practice to eat from his own labor despite his vast kingdom?",
    "optionsAr": [
      "حفر الأنفاق",
      "صياغة الخواتم فقط",
      "صناعة القفاف والمكتل من خوص النخل",
      "تقطيع الحجارة"
    ],
    "optionsEn": [
      "Digging tunnels",
      "Forging rings only",
      "Weaving baskets (qufaf) from palm fronds",
      "Quarrying stone"
    ],
    "correctIndex": 2,
    "explanationAr": "ورد في الآثار أن سليمان عليه السلام كان ينسج الخوص ويصنع القفاف بيديه ليأكل من كسبه.",
    "explanationEn": "Islamic reports mention that King-Prophet Sulayman (AS) wove palm-leaf baskets with his hands to earn his own bread."
  },
  {
    "id": "q_isl_57",
    "level": 3,
    "category": "islamic",
    "topic": "sulayman",
    "questionAr": "أي طائر أخبر نبي الله سليمان عليه السلام بملك سبأ في اليمن وعبادتهم للشمس؟",
    "questionEn": "Which bird informed Prophet Sulayman (AS) about the Queen of Sheba and her people’s sun worship?",
    "optionsAr": [
      "الهدهد",
      "الحمامة",
      "النسر",
      "الغراب"
    ],
    "optionsEn": [
      "The Hoopoe (Hudhud)",
      "The Dove",
      "The Eagle",
      "The Raven"
    ],
    "correctIndex": 0,
    "explanationAr": "جاء الهدهد لسليمان وقال: ﴿أَحَطْتُ بِمَا لَمْ تُحِطْ بِهِ وَجِئْتُكَ مِنْ سَبَإٍ بِنَبَإٍ يَقِينٍ﴾.",
    "explanationEn": "The Hoopoe brought Sulayman (AS) sure news from Sheba (Saba) in Yemen."
  },
  {
    "id": "q_isl_58",
    "level": 4,
    "category": "islamic",
    "topic": "sulayman",
    "questionAr": "ما المخلوقات والقوى التي سخرها الله لسليمان عليه السلام؟",
    "questionEn": "Which forces and creatures did Allah subject to Prophet Sulayman’s (AS) command?",
    "optionsAr": [
      "الجليد والنجوم",
      "الريح والجن والشياطين والطير والنمل وعين القطر (النحاس المذاب)",
      "الحيتان فقط",
      "البحر والجراد فقط"
    ],
    "optionsEn": [
      "Ice and stars",
      "The wind, jinn, birds, ants’ speech, and a spring of molten copper",
      "Only whales",
      "Only seas and locusts"
    ],
    "correctIndex": 1,
    "explanationAr": "وهب الله سليمان ملكاً لا ينبغي لأحد من بعده؛ فسخر له الريح والجن وعلمه منطق الطير والنمل.",
    "explanationEn": "Allah granted Sulayman (AS) dominion over the wind, jinn, molten copper, and the speech of birds and ants."
  },
  {
    "id": "q_isl_59",
    "level": 5,
    "category": "islamic",
    "topic": "sulayman",
    "questionAr": "كيف علم الجن بوفاة نبي الله سليمان عليه السلام وهو متكئ على عصاه؟",
    "questionEn": "How did the jinn finally discover that Prophet Sulayman (AS) had passed away while leaning on his staff?",
    "optionsAr": [
      "أخبرهم الهدهد فور وفاته",
      "نزل ملك وأعلن ذلك",
      "احترقت عصاه بصاعقة",
      "أكلت دابة الأرض (الأرضة) منسأته (عصاه) فخرّ ساقطاً"
    ],
    "optionsEn": [
      "The Hoopoe announced it at once",
      "An angel proclaimed it",
      "Lightning burned his staff",
      "A termite/wood-eating creature gnawed through his staff, causing him to fall"
    ],
    "correctIndex": 3,
    "explanationAr": "قال تعالى: ﴿فَلَمَّا خَرَّ تَبَيَّنَتِ الْجِنُّ أَنْ لَوْ كَانُوا يَعْلَمُونَ الْغَيْبَ مَا لَبِثُوا فِي الْعَذَابِ الْمُهِينِ﴾.",
    "explanationEn": "Only when a creature of the earth ate away his staff and he fell did the jinn realize he had passed away."
  },
  {
    "id": "q_isl_60",
    "level": 6,
    "category": "islamic",
    "topic": "ilyas",
    "questionAr": "ما اسم الصنم الذي نهى نبي الله إلياس عليه السلام قومه عن عبادته ودعاهم لرب العالمين؟",
    "questionEn": "What was the name of the idol that Prophet Ilyas (AS) forbade his people from worshipping?",
    "optionsAr": [
      "نسر",
      "اللات",
      "سُواع",
      "بَعْل"
    ],
    "optionsEn": [
      "Nasr",
      "Al-Lat",
      "Suwa",
      "Baal"
    ],
    "correctIndex": 3,
    "explanationAr": "قال تعالى في سورة الصافات: ﴿أَتَدْعُونَ بَعْلاً وَتَذَرُونَ أَحْسَنَ الْخَالِقِينَ﴾.",
    "explanationEn": "Surah As-Saffat (37:125) quotes Ilyas (AS): \"Do you call upon Baal and leave the best of creators?\""
  },
  {
    "id": "q_isl_61",
    "level": 9,
    "category": "islamic",
    "topic": "ilyas",
    "questionAr": "في أي مدينة تاريخية ببلاد الشام نُسب إليها الصنم «بعل» وقوم نبي الله إلياس عليه السلام؟",
    "questionEn": "Which historic city in the Levant is associated with the idol Baal and the mission of Prophet Ilyas (AS)?",
    "optionsAr": [
      "تونس",
      "بعلبك",
      "الإسكندرية",
      "البصرة"
    ],
    "optionsEn": [
      "Tunis",
      "Baalbek",
      "Alexandria",
      "Basra"
    ],
    "correctIndex": 1,
    "explanationAr": "عُرف قوم إلياس عليه السلام في بلاد الشام بسكنى مدينة بعلبك التي اشتهرت بعبادة بعل.",
    "explanationEn": "Prophet Ilyas (AS) was sent to the inhabitants of Baalbek in the Levant."
  },
  {
    "id": "q_isl_62",
    "level": 7,
    "category": "islamic",
    "topic": "alyasa",
    "questionAr": "من النبي الذي خلف نبي الله إلياس عليه السلام في دعوة بني إسرائيل وأثنى عليه القرآن مع الأخيار؟",
    "questionEn": "Which prophet succeeded Prophet Ilyas (AS) in guiding the Children of Israel and is praised among the chosen?",
    "optionsAr": [
      "شعيب عليه السلام",
      "هود عليه السلام",
      "اليسع عليه السلام",
      "نوح عليه السلام"
    ],
    "optionsEn": [
      "Prophet Shuayb",
      "Prophet Hud",
      "Prophet Al-Yasa (Elisha, AS)",
      "Prophet Nuh"
    ],
    "correctIndex": 2,
    "explanationAr": "تولى اليسع عليه السلام النبوة والدعوة في بني إسرائيل بعد إلياس، وذكر في القرآن في سورتي الأنعام وص.",
    "explanationEn": "Prophet Al-Yasa (AS) carried on the prophetic mission after Ilyas (AS) and is praised in Surahs Al-Anam and Sad."
  },
  {
    "id": "q_isl_63",
    "level": 8,
    "category": "islamic",
    "topic": "alyasa",
    "questionAr": "بأي وصف جمع الله بين اليسع وإسماعيل وذي الكفل عليهم السلام في سورة ص؟",
    "questionEn": "With which phrase does Surah Sad describe Al-Yasa, Ismail, and Dhul-Kifl (AS)?",
    "optionsAr": [
      "ملوك الأرض",
      "أصحاب الرقيم",
      "وكلٌّ من الأخيار",
      "أولو العزم الخمسة فقط"
    ],
    "optionsEn": [
      "Kings of the Earth",
      "Companions of the Inscription",
      "All of them are among the best/chosen (Al-Akhyar)",
      "Only the Five Ulul-Azm"
    ],
    "correctIndex": 2,
    "explanationAr": "قال تعالى في سورة ص: ﴿وَاذْكُرْ إِسْمَاعِيلَ وَالْيَسَعَ وَذَا الْكِفْلِ وَكُلٌّ مِنَ الْأَخْيَارِ﴾.",
    "explanationEn": "Surah Sad (38:48) declares: \"And remember Ismail, Al-Yasa, and Dhul-Kifl, and all are among the outstanding.\""
  },
  {
    "id": "q_isl_64",
    "level": 2,
    "category": "islamic",
    "topic": "yunus",
    "questionAr": "ما اللقب القرآني لنبي الله يونس عليه السلام نسبةً إلى الحوت الذي التقمه؟",
    "questionEn": "What Quranic title refers to Prophet Yunus (AS) in connection with the whale that swallowed him?",
    "optionsAr": [
      "ذو القرنين",
      "شيخ المرسلين",
      "ذو الكفل",
      "ذو النون (وصاحب الحوت)"
    ],
    "optionsEn": [
      "Dhul-Qarnayn",
      "Elder of the Messengers",
      "Dhul-Kifl",
      "Dhul-Nun (Companion of the Whale)"
    ],
    "correctIndex": 3,
    "explanationAr": "النون هو الحوت في اللغة العربية، فسمي يونس عليه السلام بذي النون وصاحب الحوت.",
    "explanationEn": "\"Nun\" means whale/great fish in Arabic, hence Prophet Yunus (AS) is titled Dhul-Nun."
  },
  {
    "id": "q_isl_65",
    "level": 3,
    "category": "islamic",
    "topic": "yunus",
    "questionAr": "ما الدعاء والتسبيح الذي نادى به يونس عليه السلام ربه في ظلمات البحر وبطن الحوت؟",
    "questionEn": "What supplication did Prophet Yunus (AS) recite in the darkness of the sea and the belly of the whale?",
    "optionsAr": [
      "رب اشرح لي صدري ويسر لي أمري",
      "رب لا تذرني فرداً وأنت خير الوارثين",
      "إني مسني الضر وأنت أرحم الراحمين",
      "لا إله إلا أنت سبحانك إني كنت من الظالمين"
    ],
    "optionsEn": [
      "My Lord, expand for me my breast",
      "My Lord, do not leave me alone",
      "Indeed, adversity has touched me",
      "La ilaha illa Anta Subhanaka inni kuntu minaz-zalimin (There is no deity except You; exalted are You, indeed I have been of the wrongdoers)"
    ],
    "correctIndex": 3,
    "explanationAr": "استجاب الله لدعاء يونس في الظلمات الثلاث ونجاه من الغم وجعلها بشارة للمؤمنين.",
    "explanationEn": "Allah answered Yunus’s earnest tasbih from the depths of darkness and delivered him safely ashore."
  },
  {
    "id": "q_isl_66",
    "level": 5,
    "category": "islamic",
    "topic": "yunus",
    "questionAr": "ما اسم المدينة التي كان فيها قوم يونس عليه السلام الذين آمنوا جميعاً فكشف الله عنهم العذاب؟",
    "questionEn": "Which city’s entire population repented and believed after Prophet Yunus’s (AS) warning, saving them from punishment?",
    "optionsAr": [
      "أريحا",
      "قرطبة",
      "تدمر",
      "نينوى (في العراق)"
    ],
    "optionsEn": [
      "Jericho",
      "Cordoba",
      "Palmyra",
      "Nineveh (in Iraq)"
    ],
    "correctIndex": 3,
    "explanationAr": "أُرسل يونس عليه السلام إلى أكثر من مئة ألف في نينوى، فلما آمنوا متعهم الله إلى حين.",
    "explanationEn": "Over a hundred thousand inhabitants of Nineveh repented sincerely, and Allah lifted the punishment from them."
  },
  {
    "id": "q_isl_67",
    "level": 5,
    "category": "islamic",
    "topic": "zakariya",
    "questionAr": "ما المهنة التي كان يعمل بها نبي الله زكريا عليه السلام ليأكل من كسب يده؟",
    "questionEn": "Which craft did Prophet Zakariya (AS) practice to earn his livelihood?",
    "optionsAr": [
      "النجارة",
      "صناعة الورق",
      "حراسة القصور",
      "صياغة الحلي"
    ],
    "optionsEn": [
      "Carpentry",
      "Papermaking",
      "Palace guarding",
      "Jewelry making"
    ],
    "correctIndex": 0,
    "explanationAr": "ثبت في صحيح مسلم عن النبي ﷺ أن زكريا عليه السلام كان نجاراً.",
    "explanationEn": "Authentic Hadith in Sahih Muslim confirms that Prophet Zakariya (AS) was a carpenter."
  },
  {
    "id": "q_isl_68",
    "level": 3,
    "category": "islamic",
    "topic": "zakariya",
    "questionAr": "من الفتاة الصالحة التي كفلها نبي الله زكريا عليه السلام في المحراب؟",
    "questionEn": "Who was the pious maiden placed under the guardianship of Prophet Zakariya (AS) in the sanctuary?",
    "optionsAr": [
      "آسية بنت مزاحم",
      "مريم ابنة عمران عليها السلام",
      "بلقيس ملكة سبأ",
      "هاجر أم إسماعيل"
    ],
    "optionsEn": [
      "Asiyah bint Muzahim",
      "Maryam (Mary), daughter of Imran",
      "Queen Bilqis",
      "Hajar mother of Ismail"
    ],
    "correctIndex": 1,
    "explanationAr": "قال تعالى: ﴿وَكَفَّلَهَا زَكَرِيَّا كُلَّمَا دَخَلَ عَلَيْهَا زَكَرِيَّا الْمِحْرَابَ وَجَدَ عِنْدَهَا رِزْقاً﴾.",
    "explanationEn": "Allah entrusted Maryam (AS) to Zakariya’s care, where he miraculously found unseasonal provisions with her."
  },
  {
    "id": "q_isl_69",
    "level": 4,
    "category": "islamic",
    "topic": "zakariya",
    "questionAr": "ما الآية المعجزة التي جعلها الله لزكريا عليه السلام علامة على حمل زوجته بيحيى؟",
    "questionEn": "What miraculous sign did Allah give Prophet Zakariya (AS) confirming that his wife would bear Yahya?",
    "optionsAr": [
      "تحول عصاه إلى شجرة زيتون",
      "ألا يكلم الناس ثلاثة أيام إلا رمزاً مع صحة لسانه",
      "انهمار المطر ثلاثة أشهر",
      "تفتح أزهار الجبل في الشتاء"
    ],
    "optionsEn": [
      "His staff turning into an olive tree",
      "Being unable to speak to people for three days except by gestures, despite being healthy",
      "Rain pouring for three months",
      "Mountain flowers blooming in winter"
    ],
    "correctIndex": 1,
    "explanationAr": "قال تعالى: ﴿آيَتُكَ أَلَّا تُكَلِّمَ النَّاسَ ثَلَاثَةَ أَيَّامٍ إِلَّا رَمْزاً﴾.",
    "explanationEn": "His sign was being able to communicate only by signs for three consecutive days while praising Allah."
  },
  {
    "id": "q_isl_70",
    "level": 5,
    "category": "islamic",
    "topic": "yahya",
    "questionAr": "ما الميزة الفريدة في اسم نبي الله يحيى عليه السلام كما ذكر القرآن الكريم؟",
    "questionEn": "What unique distinction does the Quran mention regarding the name of Prophet Yahya (AS)?",
    "optionsAr": [
      "اختاره قومه في قرعة",
      "لم يُسمَّ بهذا الاسم أحد قبله",
      "سُمي بهذا الاسم بعد الأربعين",
      "سمي على اسم جده الأكبر"
    ],
    "optionsEn": [
      "Chosen by his people’s lot",
      "No one had ever been given that name before him",
      "Named at age forty",
      "Named after his great-grandfather"
    ],
    "correctIndex": 1,
    "explanationAr": "قال تعالى: ﴿يَا زَكَرِيَّا إِنَّا نُبَشِّرُكَ بِغُلَامٍ اسْمُهُ يَحْيَى لَمْ نَجْعَلْ لَهُ مِنْ قَبْلُ سَمِيّاً﴾.",
    "explanationEn": "Allah named him Yahya and declared: \"We have not assigned to any before [this] name\" (Maryam 19:7)."
  },
  {
    "id": "q_isl_71",
    "level": 6,
    "category": "islamic",
    "topic": "yahya",
    "questionAr": "بماذا أنعم الله على يحيى عليه السلام وهو لا يزال طفلاً صغيراً في سورة مريم؟",
    "questionEn": "What did Allah grant Prophet Yahya (AS) while he was still a young boy according to Surah Maryam?",
    "optionsAr": [
      "ملك مصر والشام",
      "إلانة الحديد لصناعة الدروع",
      "آتاه الحكم (الفهم والنبوة) صبياً مع الحنان والزكاة والتقوى",
      "قيادة السفن"
    ],
    "optionsEn": [
      "Rule over Egypt and Syria",
      "Softening iron for armor",
      "Wisdom and judgment (Hukm) in childhood along with compassion and purity",
      "Commanding fleets"
    ],
    "correctIndex": 2,
    "explanationAr": "قال تعالى: ﴿يَا يَحْيَى خُذِ الْكِتَابَ بِقُوَّةٍ وَآتَيْنَاهُ الْحُكْمَ صَبِيّاً﴾.",
    "explanationEn": "Surah Maryam (19:12) states: \"O Yahya, take the Scripture with determination, and We gave him wisdom while yet a boy.\""
  },
  {
    "id": "q_isl_72",
    "level": 1,
    "category": "islamic",
    "topic": "isa",
    "questionAr": "ما اسم الكتاب السماوي الذي أنزله الله على نبيه عيسى ابن مريم عليه السلام؟",
    "questionEn": "What is the name of the Divine Scripture revealed to Prophet Isa (Jesus, AS)?",
    "optionsAr": [
      "صحف موسى",
      "الإنجيل",
      "الزبور",
      "التوراة"
    ],
    "optionsEn": [
      "Scrolls of Musa",
      "The Gospel (Al-Injil)",
      "The Psalms",
      "The Torah"
    ],
    "correctIndex": 1,
    "explanationAr": "آتى الله عيسى ابن مريم الإنجيل فيه هدى ونور ومصدقاً لما بين يديه من التوراة.",
    "explanationEn": "Allah revealed the Injil to Isa (AS) confirming the Torah and bringing guidance and light."
  },
  {
    "id": "q_isl_73",
    "level": 2,
    "category": "islamic",
    "topic": "isa",
    "questionAr": "ما المعجزة التي بدأ بها عيسى عليه السلام كلامه للناس وهو لا يزال رضيعاً؟",
    "questionEn": "What miracle did Prophet Isa (AS) perform while still a newborn infant?",
    "optionsAr": [
      "كتب التوراة في اليوم الأول",
      "تكلم في المهد دفاعاً عن أمه مريم وإعلاناً لنبوته",
      "أحيا عصفوراً في لحظة ولادته",
      "مشى على الماء فور ولادته"
    ],
    "optionsEn": [
      "Wrote the Torah on day one",
      "He spoke clearly from the cradle to defend his mother Maryam and declare his prophethood",
      "Raised a bird at birth",
      "Walked on water at birth"
    ],
    "correctIndex": 1,
    "explanationAr": "نطق عيسى عليه السلام في المهد قائلاً: ﴿إِنِّي عَبْدُ اللَّهِ آتَانِيَ الْكِتَابَ وَجَعَلَنِي نَبِيّاً﴾.",
    "explanationEn": "As an infant in the cradle, Isa (AS) spoke saying: \"Indeed, I am the servant of Allah; He has given me the Scripture and made me a prophet.\""
  },
  {
    "id": "q_isl_74",
    "level": 4,
    "category": "islamic",
    "topic": "isa",
    "questionAr": "أي من الآتي يُعد من المعجزات التي أجرى الله بها الشفاء والحياة على يد عيسى عليه السلام بإذن الله؟",
    "questionEn": "Which healing miracles did Allah perform through Prophet Isa (AS) by His permission?",
    "optionsAr": [
      "إبراء الأكمه والأبرص وإحياء الموتى بإذن الله",
      "شق البحر الأحمر وقلب العصا حية",
      "فوران التنور وبناء السفينة",
      "تسخير الجن والريح"
    ],
    "optionsEn": [
      "Curing those born blind and lepers, and raising the dead by Allah’s leave",
      "Parting the Red Sea and snake staff",
      "Boiling oven and shipbuilding",
      "Controlling jinn and wind"
    ],
    "correctIndex": 0,
    "explanationAr": "أيده الله بإبراء الأكمه والأبرص وإحياء الموتى بإذن الله، مع التحدي لمعارف الطب في زمانه.",
    "explanationEn": "By Allah’s permission, Isa (AS) healed the blind from birth, cured leprosy, and brought the dead to life."
  },
  {
    "id": "q_isl_75",
    "level": 6,
    "category": "islamic",
    "topic": "isa",
    "questionAr": "ما مصير عيسى عليه السلام عندما تآمر أعداؤه على قتله وصلبه؟",
    "questionEn": "What happened to Prophet Isa (AS) when his enemies plotted to crucify and kill him?",
    "optionsAr": [
      "دُفن في جبل الطور",
      "هاجر إلى المدينة المنورة",
      "غرق في البحر الميت",
      "ما قتلوه وما صلبوه بل رفعه الله إليه حياً"
    ],
    "optionsEn": [
      "He was buried on Mount Tur",
      "He migrated to Madinah",
      "He drowned in the Dead Sea",
      "They neither killed nor crucified him; rather, Allah raised him up to Himself"
    ],
    "correctIndex": 3,
    "explanationAr": "قال الله تعالى: ﴿وَمَا قَتَلُوهُ وَمَا صَلَبُوهُ وَلَكِنْ شُبِّهَ لَهُمْ... بَلْ رَفَعَهُ اللَّهُ إِلَيْهِ﴾.",
    "explanationEn": "The Quran confirms: \"They did not kill him, nor did they crucify him... Rather, Allah raised him to Himself\" (4:157-158)."
  },
  {
    "id": "q_isl_76",
    "level": 2,
    "category": "islamic",
    "topic": "muhammad",
    "questionAr": "ما المهنة التي عمل بها النبي محمد ﷺ في صغره بمكة شأن جميع الأنبياء من قبله؟",
    "questionEn": "Which occupation did Prophet Muhammad (ﷺ) work in during his youth, just like all prophets before him?",
    "optionsAr": [
      "رعي الغنم",
      "صناعة السفن في جدة",
      "النحت في الصخر",
      "الحدادة في سوق عكاظ"
    ],
    "optionsEn": [
      "Shepherding sheep",
      "Shipbuilding in Jeddah",
      "Stone carving",
      "Blacksmithing at Ukaz"
    ],
    "correctIndex": 0,
    "explanationAr": "قال ﷺ: «ما بعث الله نبياً إلا رعى الغنم»، وقد رعاها ﷺ لأهل مكة على قراريط.",
    "explanationEn": "The Prophet (ﷺ) stated that Allah never sent a prophet without having him shepherd sheep, and he shepherded in Makkah."
  },
  {
    "id": "q_isl_77",
    "level": 3,
    "category": "islamic",
    "topic": "muhammad",
    "questionAr": "ما المهنة التي اشتغل بها النبي محمد ﷺ في شبابه وعُرف فيها بالصادق الأمين؟",
    "questionEn": "Which profession did Prophet Muhammad (ﷺ) excel in during his young adulthood, earning the title \"As-Sadiq Al-Amin\"?",
    "optionsAr": [
      "صياغة التيجان الملكية",
      "التجارة (وسفره بتجارة السيدة خديجة إلى الشام)",
      "بناء القلاع",
      "صيد اللؤلؤ"
    ],
    "optionsEn": [
      "Crafting royal crowns",
      "Commerce and trade (leading Khadijah’s caravans to Ash-Sham)",
      "Building fortresses",
      "Pearl diving"
    ],
    "correctIndex": 1,
    "explanationAr": "عمل النبي ﷺ بالتجارة وخرج بتجارة خديجة رضي الله عنها إلى الشام فأثمر أموالها بأمانته وصدقه.",
    "explanationEn": "He worked as a trustworthy merchant, famously managing Lady Khadijah’s trade caravan to Ash-Sham."
  },
  {
    "id": "q_isl_78",
    "level": 1,
    "category": "islamic",
    "topic": "muhammad",
    "questionAr": "ما المعجزة الخالدة الكبرى التي أيد الله بها خاتم الأنبياء محمداً ﷺ إلى يوم القيامة؟",
    "questionEn": "What is the greatest, eternal miracle bestowed upon the Seal of the Prophets, Muhammad (ﷺ)?",
    "optionsAr": [
      "تسخير الريح لثلاثة أشهر",
      "الناقة التي تشرب الماء كله",
      "عصا تبتلع السحر",
      "القرآن الكريم"
    ],
    "optionsEn": [
      "Controlling the wind",
      "A miraculous she-camel",
      "A staff swallowing magic",
      "The Noble Quran"
    ],
    "correctIndex": 3,
    "explanationAr": "القرآن الكريم هو المعجزة العقلية والبيانية الخالدة الباقية محفوظة إلى يوم القيامة.",
    "explanationEn": "The Holy Quran is the everlasting linguistic, spiritual, and preserved miracle of Prophet Muhammad (ﷺ)."
  },
  {
    "id": "q_isl_79",
    "level": 4,
    "category": "islamic",
    "topic": "muhammad",
    "questionAr": "ما الرحلة المعجزة التي أُسري فيها بالنبي ﷺ من المسجد الحرام إلى المسجد الأقصى ثم عُرج به إلى السماوات العلى؟",
    "questionEn": "What is the miraculous night journey of Prophet Muhammad (ﷺ) from Makkah to Jerusalem and upward through the heavens?",
    "optionsAr": [
      "صلح الحديبية",
      "فتح مكة",
      "الهجرة إلى الحبشة",
      "الإسراء والمعراج"
    ],
    "optionsEn": [
      "Treaty of Hudaybiyyah",
      "Conquest of Makkah",
      "Migration to Abyssinia",
      "Al-Isra wal-Miraj"
    ],
    "correctIndex": 3,
    "explanationAr": "في رحلة الإسراء والمعراج أُسري بالنبي ﷺ ليلاً إلى المسجد الأقصى وعُرج به حيث فُرضت الصلوات الخمس.",
    "explanationEn": "During Al-Isra wal-Miraj, the Prophet (ﷺ) traveled to Al-Aqsa Mosque and ascended the heavens where five daily prayers were prescribed."
  },
  {
    "id": "q_isl_80",
    "level": 5,
    "category": "islamic",
    "topic": "muhammad",
    "questionAr": "من الذي رافق النبي محمداً ﷺ في غار ثور أثناء رحلة الهجرة النبوية إلى المدينة المنورة؟",
    "questionEn": "Who accompanied Prophet Muhammad (ﷺ) inside the Cave of Thawr during the Hijrah to Madinah?",
    "optionsAr": [
      "عمر بن الخطاب رضي الله عنه",
      "أبو بكر الصديق رضي الله عنه",
      "عثمان بن عفان رضي الله عنه",
      "علي بن أبي طالب رضي الله عنه"
    ],
    "optionsEn": [
      "Umar ibn Al-Khattab",
      "Abu Bakr As-Siddiq (RA)",
      "Uthman ibn Affan",
      "Ali ibn Abi Talib"
    ],
    "correctIndex": 1,
    "explanationAr": "كان أبو بكر الصديق رضي الله عنه رفيق النبي ﷺ في الغار، وقال فيه القرآن: ﴿إِذْ يَقُولُ لِصَاحِبِهِ لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا﴾.",
    "explanationEn": "Abu Bakr (RA) accompanied the Prophet (ﷺ) in Cave Thawr and was honored in the Quran as his companion."
  },
  {
    "id": "q_isl_81",
    "level": 1,
    "category": "islamic",
    "topic": "quran",
    "questionAr": "كم عدد سور القرآن الكريم كاملة في المصحف الشريف؟",
    "questionEn": "How many total surahs (chapters) are in the Holy Quran?",
    "optionsAr": [
      "114 سورة",
      "99 سورة",
      "100 سورة",
      "120 سورة"
    ],
    "optionsEn": [
      "114 Surahs",
      "99 Surahs",
      "100 Surahs",
      "120 Surahs"
    ],
    "correctIndex": 0,
    "explanationAr": "يتكون القرآن الكريم من 114 سورة تبدأ بسورة الفاتحة وتنتهي بسورة الناس.",
    "explanationEn": "The Holy Quran contains 114 Surahs, beginning with Al-Fatihah and ending with An-Nas."
  },
  {
    "id": "q_isl_82",
    "level": 2,
    "category": "islamic",
    "topic": "quran",
    "questionAr": "ما أول كلمة نزلت من القرآن الكريم على قلب النبي محمد ﷺ في غار حراء؟",
    "questionEn": "What was the very first word of the Holy Quran revealed to Prophet Muhammad (ﷺ) in Cave Hira?",
    "optionsAr": [
      "اقرأ",
      "سبّح",
      "الحمد",
      "اكتب"
    ],
    "optionsEn": [
      "Iqra (Read)",
      "Glorify",
      "Praise",
      "Write"
    ],
    "correctIndex": 0,
    "explanationAr": "أول ما نزل من القرآن صدر سورة العلق: ﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾.",
    "explanationEn": "The first revelation began with Surah Al-Alaq: \"Read (Iqra) in the name of your Lord who created.\""
  },
  {
    "id": "q_isl_83",
    "level": 3,
    "category": "islamic",
    "topic": "quran",
    "questionAr": "ما السورة الوحيدة في القرآن الكريم التي لا تبدأ بالبسملة (بسم الله الرحمن الرحيم)؟",
    "questionEn": "Which is the only Surah in the Holy Quran that does not begin with the Bismillah?",
    "optionsAr": [
      "سورة التوبة",
      "سورة النمل",
      "سورة الأنفال",
      "سورة الرعد"
    ],
    "optionsEn": [
      "Surah At-Tawbah",
      "Surah An-Naml",
      "Surah Al-Anfal",
      "Surah Ar-Rad"
    ],
    "correctIndex": 0,
    "explanationAr": "تخلو سورة التوبة (براءة) من البسملة في مطلعها؛ لأنها نزلت ببراءة وإنذار للمشركين.",
    "explanationEn": "Surah At-Tawbah opens without Bismillah, unlike the other 113 Surahs."
  },
  {
    "id": "q_isl_84",
    "level": 4,
    "category": "islamic",
    "topic": "quran",
    "questionAr": "في أي سورة وردت البسملة (بسم الله الرحمن الرحيم) مرتين في القرآن الكريم؟",
    "questionEn": "Which Surah in the Holy Quran contains the Bismillah twice?",
    "optionsAr": [
      "سورة سبأ",
      "سورة النمل",
      "سورة التوبة",
      "سورة القصص"
    ],
    "optionsEn": [
      "Surah Saba",
      "Surah An-Naml",
      "Surah At-Tawbah",
      "Surah Al-Qasas"
    ],
    "correctIndex": 1,
    "explanationAr": "ذُكرت البسملة في سورة النمل في مطلعها، وداخلها في رسالة سليمان لبلقيس: ﴿إِنَّهُ مِنْ سُلَيْمَانَ وَإِنَّهُ بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ﴾.",
    "explanationEn": "Surah An-Naml starts with Bismillah and includes it again in Sulayman’s letter (27:30)."
  },
  {
    "id": "q_isl_85",
    "level": 1,
    "category": "islamic",
    "topic": "quran",
    "questionAr": "ما هي أطول سورة في القرآن الكريم من حيث عدد الآيات والكلمات؟",
    "questionEn": "Which is the longest Surah in the Holy Quran?",
    "optionsAr": [
      "سورة البقرة",
      "سورة النساء",
      "سورة الأعراف",
      "سورة آل عمران"
    ],
    "optionsEn": [
      "Surah Al-Baqarah",
      "Surah An-Nisa",
      "Surah Al-Araf",
      "Surah Al-Imran"
    ],
    "correctIndex": 0,
    "explanationAr": "سورة البقرة هي أطول سور القرآن الكريم وتضم 286 آية وفيها أطول آية وأعظم آية.",
    "explanationEn": "Surah Al-Baqarah is the longest chapter of the Quran with 286 verses."
  },
  {
    "id": "q_isl_86",
    "level": 2,
    "category": "islamic",
    "topic": "quran",
    "questionAr": "ما هي أقصر سورة في القرآن الكريم وكم عدد آياتها؟",
    "questionEn": "Which is the shortest Surah in the Holy Quran?",
    "optionsAr": [
      "سورة الفلق (5 آيات)",
      "سورة الإخلاص (4 آيات)",
      "سورة قريش (4 آيات)",
      "سورة الكوثر (3 آيات)"
    ],
    "optionsEn": [
      "Surah Al-Falaq (5 verses)",
      "Surah Al-Ikhlas (4 verses)",
      "Surah Quraysh (4 verses)",
      "Surah Al-Kawthar (3 verses)"
    ],
    "correctIndex": 3,
    "explanationAr": "سورة الكوثر أقصر سورة في القرآن الكريم إذ تتألف من ثلاث آيات قصار.",
    "explanationEn": "Surah Al-Kawthar is the shortest Surah in the Quran, consisting of 3 brief verses."
  },
  {
    "id": "q_isl_87",
    "level": 3,
    "category": "islamic",
    "topic": "quran",
    "questionAr": "ما هي أعظم آية في كتاب الله كما أخبر النبي ﷺ؟",
    "questionEn": "Which verse did Prophet Muhammad (ﷺ) identify as the greatest verse in the Book of Allah?",
    "optionsAr": [
      "بداية سورة الفجر",
      "آية الكرسي (الآية 255 من سورة البقرة)",
      "آخر آية في سورة التوبة",
      "آية النور في سورة النور"
    ],
    "optionsEn": [
      "Opening of Al-Fajr",
      "Ayat al-Kursi (Al-Baqarah 2:255)",
      "Last verse of At-Tawbah",
      "Verse of Light in An-Nur"
    ],
    "correctIndex": 1,
    "explanationAr": "ثبت في صحيح مسلم أن النبي ﷺ سأل أبي بن كعب عن أعظم آية فأجاب: آية الكرسي، فهنأه النبي ﷺ.",
    "explanationEn": "In Sahih Muslim, the Prophet (ﷺ) affirmed Ayat al-Kursi as the greatest verse of the Quran."
  },
  {
    "id": "q_isl_88",
    "level": 4,
    "category": "islamic",
    "topic": "quran",
    "questionAr": "ما السورة التي أخبر النبي ﷺ أنها تعدل ثلث القرآن الكريم في الفضل؟",
    "questionEn": "Which Surah did Prophet Muhammad (ﷺ) say equals one-third of the Quran in reward?",
    "optionsAr": [
      "سورة الإخلاص",
      "سورة الزلزلة",
      "سورة العصر",
      "سورة الكافرون"
    ],
    "optionsEn": [
      "Surah Al-Ikhlas",
      "Surah Az-Zalzalah",
      "Surah Al-Asr",
      "Surah Al-Kafirun"
    ],
    "correctIndex": 0,
    "explanationAr": "قال النبي ﷺ: «أيعجز أحدكم أن يقرأ في ليلة ثلث القرآن؟ ﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾ تعدل ثلث القرآن».",
    "explanationEn": "Prophet Muhammad (ﷺ) taught that Surah Al-Ikhlas equals one-third of the Quran in merit."
  },
  {
    "id": "q_isl_89",
    "level": 5,
    "category": "islamic",
    "topic": "quran",
    "questionAr": "في عهد أي خليفة جُمع القرآن الكريم لأول مرة بين دفتين في مصحف واحد بعد استشهاد كثير من الحفاظ؟",
    "questionEn": "During which Caliph’s reign was the Quran first compiled into a single bound volume?",
    "optionsAr": [
      "علي بن أبي طالب رضي الله عنه",
      "معاوية بن أبي سفيان",
      "أبو بكر الصديق رضي الله عنه",
      "عمر بن عبد العزيز"
    ],
    "optionsEn": [
      "Ali ibn Abi Talib",
      "Muawiyah ibn Abi Sufyan",
      "Abu Bakr As-Siddiq (RA)",
      "Umar ibn Abdul-Aziz"
    ],
    "correctIndex": 2,
    "explanationAr": "بعد معركة اليمامة أشار عمر على أبي بكر الصديق بجمع القرآن فكلّف زيد بن ثابت فجمعه في مصحف واحد.",
    "explanationEn": "Upon Umar’s advice after the Battle of Yamamah, Caliph Abu Bakr (RA) commissioned Zayd ibn Thabit to compile the Quran."
  },
  {
    "id": "q_isl_90",
    "level": 6,
    "category": "islamic",
    "topic": "quran",
    "questionAr": "ما السورة التي وُصفت في الأثر بأنها «عروس القرآن» لكثرة فواصلها الجميلة ونعم الله فيها؟",
    "questionEn": "Which Surah is famously nicknamed \"The Bride of the Quran\" (Arus al-Quran)?",
    "optionsAr": [
      "سورة الرحمن",
      "سورة القمر",
      "سورة الملك",
      "سورة الواقعة"
    ],
    "optionsEn": [
      "Surah Ar-Rahman",
      "Surah Al-Qamar",
      "Surah Al-Mulk",
      "Surah Al-Waqiah"
    ],
    "correctIndex": 0,
    "explanationAr": "عُرفت سورة الرحمن بلقب عروس القرآن لما تضمنته من وصف بديع للنعم والجنة وتكرار ﴿فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ﴾.",
    "explanationEn": "Surah Ar-Rahman is renowned as Arus al-Quran due to its lyrical beauty and praise of Allah’s favors."
  },
  {
    "id": "q_isl_91",
    "level": 1,
    "category": "islamic",
    "topic": "wives",
    "questionAr": "من أولى زوجات النبي محمد ﷺ وأول من آمن به من النساء على الإطلاق؟",
    "questionEn": "Who was the first wife of Prophet Muhammad (ﷺ) and the very first person to believe in his message?",
    "optionsAr": [
      "السيدة خديجة بنت خويلد رضي الله عنها",
      "السيدة حفصة بنت عمر",
      "السيدة أم سلمة",
      "السيدة عائشة بنت أبي بكر"
    ],
    "optionsEn": [
      "Lady Khadijah bint Khuwaylid (RA)",
      "Lady Hafsah bint Umar",
      "Lady Umm Salamah",
      "Lady Aishah bint Abi Bakr"
    ],
    "correctIndex": 0,
    "explanationAr": "السيدة خديجة رضي الله عنها هي أول أمهات المؤمنين، وآزرته بمالها ونفسها وبُشّرت ببيت في الجنة من قصب.",
    "explanationEn": "Lady Khadijah (RA) stood faithfully beside the Prophet (ﷺ) from the first moment of revelation."
  },
  {
    "id": "q_isl_92",
    "level": 3,
    "category": "islamic",
    "topic": "wives",
    "questionAr": "من أم المؤمنين التي تزوجها النبي ﷺ بعد وفاة السيدة خديجة وكانت أول من تزوجها في مكة بعدها؟",
    "questionEn": "Who was the first woman Prophet Muhammad (ﷺ) married after Lady Khadijah (RA) passed away?",
    "optionsAr": [
      "السيدة زينب بنت جحش",
      "السيدة صفية بنت حيي",
      "السيدة سودة بنت زمعة رضي الله عنها",
      "السيدة جويرية بنت الحارث"
    ],
    "optionsEn": [
      "Lady Zaynab bint Jahsh",
      "Lady Safiyyah bint Huyayy",
      "Lady Sawdah bint Zamah (RA)",
      "Lady Juwayriyah bint Al-Harith"
    ],
    "correctIndex": 2,
    "explanationAr": "تزوج النبي ﷺ السيدة سودة بنت زمعة رضي الله عنها بعد عام الحزن وقبل الهجرة إلى المدينة.",
    "explanationEn": "Prophet Muhammad (ﷺ) married Sawdah bint Zamah (RA) in Makkah following Khadijah’s passing."
  },
  {
    "id": "q_isl_93",
    "level": 2,
    "category": "islamic",
    "topic": "wives",
    "questionAr": "من أم المؤمنين ابنة أبي بكر الصديق والتي كانت أعلم نساء الأمة وأكثرهن رواية للحديث النبوي؟",
    "questionEn": "Which Mother of the Believers, daughter of Abu Bakr (RA), was the most scholarly woman and narrated the most Hadiths?",
    "optionsAr": [
      "السيدة زينب بنت خزيمة",
      "السيدة ميمونة بنت الحارث",
      "السيدة أم حبيبة",
      "السيدة عائشة رضي الله عنها"
    ],
    "optionsEn": [
      "Lady Zaynab bint Khuzaymah",
      "Lady Maymunah bint Al-Harith",
      "Lady Umm Habibah",
      "Lady Aishah bint Abi Bakr (RA)"
    ],
    "correctIndex": 3,
    "explanationAr": "عائشة رضي الله عنها هي الصديقة بنت الصديق، روت 2210 أحاديث وكانت مرجعاً لكبار الصحابة.",
    "explanationEn": "Lady Aishah (RA) narrated over two thousand Hadiths and served as a foremost jurist and teacher to the Companions."
  },
  {
    "id": "q_isl_94",
    "level": 4,
    "category": "islamic",
    "topic": "wives",
    "questionAr": "من أم المؤمنين ابنة عمر بن الخطاب التي أُودعت عندها صحف المصحف المجموع في عهد أبي بكر وعمر؟",
    "questionEn": "Which Mother of the Believers, daughter of Umar ibn Al-Khattab (RA), safeguarded the compiled Quran manuscripts?",
    "optionsAr": [
      "السيدة سودة بنت زمعة",
      "السيدة صفية بنت حيي",
      "السيدة حفصة بنت عمر رضي الله عنها",
      "السيدة أم سلمة"
    ],
    "optionsEn": [
      "Lady Sawdah bint Zamah",
      "Lady Safiyyah bint Huyayy",
      "Lady Hafsah bint Umar (RA)",
      "Lady Umm Salamah"
    ],
    "correctIndex": 2,
    "explanationAr": "حفظت أم المؤمنين حفصة بنت عمر رضي الله عنها الصحف الأولى للقرآن حتى نسخ عثمان منها المصاحف.",
    "explanationEn": "Lady Hafsah (RA) preserved the original compiled sheets of the Quran used later by Caliph Uthman (RA)."
  },
  {
    "id": "q_isl_95",
    "level": 5,
    "category": "islamic",
    "topic": "wives",
    "questionAr": "ما اللقب الخيري الذي اشتهرت به أم المؤمنين السيدة زينب بنت خزيمة رضي الله عنها؟",
    "questionEn": "By what charitable title was Mother of the Believers Zaynab bint Khuzaymah (RA) famously known?",
    "optionsAr": [
      "ذات النطاقين",
      "أم المساكين",
      "أم الشهداء",
      "ذات الهجرتين"
    ],
    "optionsEn": [
      "Possessor of Two Belts",
      "Mother of the Poor (Umm al-Masakin)",
      "Mother of Martyrs",
      "Woman of Two Migrations"
    ],
    "correctIndex": 1,
    "explanationAr": "لُقبت زينب بنت خزيمة رضي الله عنها بأم المساكين لكثرة إطعامها وعطفها على الفقراء قبل الإسلام وبعده.",
    "explanationEn": "She earned the title Umm al-Masakin for her extraordinary generosity toward the needy."
  },
  {
    "id": "q_isl_96",
    "level": 6,
    "category": "islamic",
    "topic": "wives",
    "questionAr": "من أم المؤمنين التي أشارت على النبي ﷺ في صلح الحديبية أن يخرج فيحلق وينحر فاتبعه الصحابة؟",
    "questionEn": "Which wise Mother of the Believers advised Prophet Muhammad (ﷺ) at Hudaybiyyah to slaughter his sacrifice and shave his head first?",
    "optionsAr": [
      "السيدة أم حبيبة",
      "السيدة ميمونة بنت الحارث",
      "السيدة أم سلمة (هند بنت أبي أمية) رضي الله عنها",
      "السيدة جويرية بنت الحارث"
    ],
    "optionsEn": [
      "Lady Umm Habibah",
      "Lady Maymunah bint Al-Harith",
      "Lady Umm Salamah (Hind bint Abi Umayyah, RA)",
      "Lady Juwayriyah bint Al-Harith"
    ],
    "correctIndex": 2,
    "explanationAr": "كانت مشورة أم سلمة رضي الله عنها يوم الحديبية سبباً في مبادرة الصحابة بالاقتداء بالنبي ﷺ.",
    "explanationEn": "Lady Umm Salamah’s wise counsel at Hudaybiyyah immediately inspired the Companions to follow the Prophet’s example."
  },
  {
    "id": "q_isl_97",
    "level": 5,
    "category": "islamic",
    "topic": "wives",
    "questionAr": "من أم المؤمنين التي ذُكر زواجها في القرآن الكريم بقوله تعالى: ﴿فَلَمَّا قَضَى زَيْدٌ مِنْهَا وَطَراً زَوَّجْنَاكَهَا﴾؟",
    "questionEn": "Which Mother of the Believers had her marriage to the Prophet (ﷺ) directly ordained and mentioned in Surah Al-Ahzab?",
    "optionsAr": [
      "السيدة حفصة بنت عمر",
      "السيدة صفية بنت حيي",
      "السيدة زينب بنت جحش رضي الله عنها",
      "السيدة خديجة بنت خويلد"
    ],
    "optionsEn": [
      "Lady Hafsah bint Umar",
      "Lady Safiyyah bint Huyayy",
      "Lady Zaynab bint Jahsh (RA)",
      "Lady Khadijah bint Khuwaylid"
    ],
    "correctIndex": 2,
    "explanationAr": "تزوج النبي ﷺ السيدة زينب بنت جحش بأمر الله في سورة الأحزاب لإبطال حكم التبني في الجاهلية.",
    "explanationEn": "Lady Zaynab bint Jahsh (RA) proudly remarked that Allah Himself arranged her marriage from above seven heavens."
  },
  {
    "id": "q_isl_98",
    "level": 7,
    "category": "islamic",
    "topic": "wives",
    "questionAr": "من أم المؤمنين التي كان زواج النبي ﷺ بها سبباً في عتق مئة أهل بيت من قومها بني المصطلق؟",
    "questionEn": "Which Mother of the Believers brought about the freeing of a hundred families of Banu Al-Mustaliq through her marriage?",
    "optionsAr": [
      "السيدة سودة بنت زمعة",
      "السيدة جويرية بنت الحارث رضي الله عنها",
      "السيدة أم حبيبة",
      "السيدة ميمونة بنت الحارث"
    ],
    "optionsEn": [
      "Lady Sawdah bint Zamah",
      "Lady Juwayriyah bint Al-Harith (RA)",
      "Lady Umm Habibah",
      "Lady Maymunah bint Al-Harith"
    ],
    "correctIndex": 1,
    "explanationAr": "قالت عائشة عنها: ما أعلم امرأة كانت أعظم بركة على قومها من جويرية؛ إذ أعتق الصحابة أصهار رسول الله ﷺ.",
    "explanationEn": "The Companions freed all captives of Banu Al-Mustaliq out of honor when Juwayriyah (RA) became the Prophet’s wife."
  },
  {
    "id": "q_isl_99",
    "level": 8,
    "category": "islamic",
    "topic": "wives",
    "questionAr": "من أم المؤمنين التي كانت ابنة أبي سفيان وهاجرت إلى الحبشة وبعث النجاشي صداقها نيابة عن النبي ﷺ؟",
    "questionEn": "Which Mother of the Believers was the daughter of Abu Sufyan and migrated to Abyssinia where the Negus oversaw her marriage contract?",
    "optionsAr": [
      "السيدة أم حبيبة (رملة بنت أبي سفيان) رضي الله عنها",
      "السيدة زينب بنت خزيمة",
      "السيدة صفية بنت حيي",
      "السيدة حفصة بنت عمر"
    ],
    "optionsEn": [
      "Lady Umm Habibah (Ramlah bint Abi Sufyan, RA)",
      "Lady Zaynab bint Khuzaymah",
      "Lady Safiyyah bint Huyayy",
      "Lady Hafsah bint Umar"
    ],
    "correctIndex": 0,
    "explanationAr": "خطبها النبي ﷺ وهي في الحبشة، فتولى النجاشي عقد زواجها وأصدقها عن النبي ﷺ أربعمائة دينار.",
    "explanationEn": "King Negus of Abyssinia officiated the marriage contract of Umm Habibah (RA) on behalf of Prophet Muhammad (ﷺ)."
  },
  {
    "id": "q_isl_100",
    "level": 7,
    "category": "islamic",
    "topic": "wives",
    "questionAr": "من آخر أمهات المؤمنين زواجاً بالنبي ﷺ وكانت خالتها أم الفضل زوجة العباس؟",
    "questionEn": "Who was the last Mother of the Believers to marry Prophet Muhammad (ﷺ)?",
    "optionsAr": [
      "السيدة ميمونة بنت الحارث رضي الله عنها",
      "السيدة أم سلمة",
      "السيدة سودة بنت زمعة",
      "السيدة عائشة بنت أبي بكر"
    ],
    "optionsEn": [
      "Lady Maymunah bint Al-Harith (RA)",
      "Lady Umm Salamah",
      "Lady Sawdah bint Zamah",
      "Lady Aishah bint Abi Bakr"
    ],
    "correctIndex": 0,
    "explanationAr": "تزوج النبي ﷺ السيدة ميمونة بنت الحارث رضي الله عنها في عمرة القضاء سنة 7 هـ، فكانت آخر من تزوجهن.",
    "explanationEn": "Prophet Muhammad (ﷺ) married Maymunah bint Al-Harith (RA) in 7 AH, making her the last of the Mothers of the Believers."
  }
];

const Q_CHUNK_2: Question[] = [
  {
    "id": "q_ent_1",
    "level": 1,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "من قام ببطولة شخصية «اللمبي» الشهيرة في سلسلة الأفلام الكوميدية المصرية؟",
    "questionEn": "Which Egyptian actor starred as the iconic comic character \"El-Limby\"?",
    "optionsAr": [
      "محمد سعد",
      "هاني رمزي",
      "محمد هنيدي",
      "أحمد حلمي"
    ],
    "optionsEn": [
      "Mohamed Saad",
      "Hany Ramzy",
      "Mohamed Henedy",
      "Ahmed Helmy"
    ],
    "correctIndex": 0,
    "explanationAr": "قدم محمد سعد شخصية اللمبي لأول مرة في فيلم «الناظر» ثم في فيلم «اللمبي» عام 2002.",
    "explanationEn": "Mohamed Saad first played El-Limby in \"El-Nazer\" before leading the 2002 hit film \"El-Limby\"."
  },
  {
    "id": "q_ent_2",
    "level": 1,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما اسم الشخصية التي جسدها علاء ولي الدين كمدير مدرسة في فيلم «الناظر»؟",
    "questionEn": "What was the name of the school principal character played by Alaa Wali El-Din in the film \"El-Nazer\"?",
    "optionsAr": [
      "صلاح الدين عاشور",
      "حزلقوم",
      "محروس بتاع الوزير",
      "خلف الدهشوري"
    ],
    "optionsEn": [
      "Salah El-Din Ashour",
      "Hazalkoum",
      "Mahrous",
      "Khalaf El-Dahshouri"
    ],
    "correctIndex": 0,
    "explanationAr": "أدى علاء ولي الدين دور الأب عاشور والابن صلاح الدين عاشور والجدة جواهر في فيلم «الناظر».",
    "explanationEn": "Alaa Wali El-Din famously played Ashour, his son Salah El-Din, and grandmother Jawaher in \"El-Nazer\"."
  },
  {
    "id": "q_ent_3",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما اسم الصعيدي الذي ذهب للدراسة في القاهرة في فيلم «صعيدي في الجامعة الأمريكية»؟",
    "questionEn": "What was Mohamed Henedy’s character name in \"An Upper Egyptian at the American University\"?",
    "optionsAr": [
      "تيمور وشفيقة",
      "خلف الدهشوري خلف",
      "رمضان مبروك أبو العلمين",
      "يحيى الفخراني"
    ],
    "optionsEn": [
      "Taimour",
      "Khalaf El-Dahshouri Khalaf",
      "Ramadan Mabrouk",
      "Wahid"
    ],
    "correctIndex": 1,
    "explanationAr": "حقق محمد هنيدي نجاحاً تاريخياً بدور خلف الدهشوري في فيلم «صعيدي في الجامعة الأمريكية» عام 1998.",
    "explanationEn": "Mohamed Henedy starred as Khalaf El-Dahshouri in the 1998 blockbuster comedy."
  },
  {
    "id": "q_ent_4",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "من قام ببطولة فيلم «عسل أسود» الذي يحكي قصة شاب يعود إلى مصر بعد غياب عشرين عاماً؟",
    "questionEn": "Who starred as \"Masry El-Araby\" returning to Egypt after 20 years in the film \"Asal Eswed\"?",
    "optionsAr": [
      "أحمد مكي",
      "أحمد حلمي",
      "أحمد السقا",
      "كريم عبد العزيز"
    ],
    "optionsEn": [
      "Ahmed Mekky",
      "Ahmed Helmy",
      "Ahmed El Sakka",
      "Karim Abdel Aziz"
    ],
    "correctIndex": 1,
    "explanationAr": "جسد أحمد حلمي شخصية مصري العربي الذي يزور وطنه بجواز سفر أمريكي في فيلم «عسل أسود» (2010).",
    "explanationEn": "Ahmed Helmy portrayed Masry El-Araby in the 2010 comedy-drama \"Asal Eswed\" (Bittersweet)."
  },
  {
    "id": "q_ent_5",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما مهنة «أحمد سبع الليل» الذي جسده عادل إمام في فيلم «الإرهاب والكباب»؟",
    "questionEn": "What was the simple character role played by Adel Emam (\"Ahmed\") inside Mogamma El-Tahrir in \"Terrorism and Kebab\"?",
    "optionsAr": [
      "ضابط شرطة متخفي",
      "محامٍ مشهور في المحكمة",
      "صحفي يحقق في قضية فساد",
      "مواطن بسيط يحاول نقل أولاده من المدرسة في مجمع التحرير"
    ],
    "optionsEn": [
      "An undercover police officer",
      "A famous courtroom lawyer",
      "An investigative journalist",
      "An ordinary citizen trying to transfer his children’s school at Mogamma"
    ],
    "correctIndex": 3,
    "explanationAr": "تدور أحداث الفيلم عندما ذهب أحمد لنقل أوراق ابنه من المدرسة فيحتل مع المظلومين مجمع التحرير بالصدفة.",
    "explanationEn": "Adel Emam plays an ordinary father whose bureaucratic frustration at Mogamma escalates into an accidental standoff."
  },
  {
    "id": "q_ent_6",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "كم شخصية شقيقة توأم جسدها أحمد حلمي في فيلم «كده رضا»؟",
    "questionEn": "How many identical brothers (triplets) did Ahmed Helmy play in the movie \"Keda Reda\"?",
    "optionsAr": [
      "خمسة أشقاء",
      "شقيقان توأمان فقط",
      "ثلاثة توائم (سمسم وبرنس وبيبو)",
      "أربعة إخوة"
    ],
    "optionsEn": [
      "Five siblings",
      "Two twins only",
      "Three triplets (Semsem, Prince, and Bebo)",
      "Four brothers"
    ],
    "correctIndex": 2,
    "explanationAr": "أدى أحمد حلمي أدوار الأشقاء الثلاثة سمسم وبيبو وبرنس الذين استخرج لهم والدهم بطاقة شخصية واحدة باسم رضا.",
    "explanationEn": "Ahmed Helmy brilliantly portrayed triplets Semsem, Bebo, and Prince sharing one official ID under the name Reda."
  },
  {
    "id": "q_ent_7",
    "level": 4,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما اسم الفيلم المصري الشهير الذي جسد فيه كريم عبد العزيز دور طبيب نفسي يدعى «يحيى راشد»؟",
    "questionEn": "In which acclaimed Egyptian thriller did Karim Abdel Aziz play psychiatrist Dr. Yehia Rashed?",
    "optionsAr": [
      "الجزيرة",
      "إبراهيم الأبيض",
      "ولاد رزق",
      "الفيل الأزرق"
    ],
    "optionsEn": [
      "The Island",
      "Ibrahim Labyad",
      "Sons of Rizk",
      "The Blue Elephant (El-Feel El-Azraq)"
    ],
    "correctIndex": 3,
    "explanationAr": "أخرج مروان حامد فيلم «الفيل الأزرق» المأخوذ عن رواية أحمد مراد وحقق نجاحاً جماهيرياً كبيراً.",
    "explanationEn": "Directed by Marwan Hamed from Ahmed Mourad’s novel, \"The Blue Elephant\" starred Karim Abdel Aziz as Dr. Yehia."
  },
  {
    "id": "q_ent_8",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما اسم الضابط الذي جسده أحمد السقا في فيلم «تيتو» قبل أن يطارده من الماضي؟",
    "questionEn": "Wait — who played the relentless police detective \"Refaat El-Soghayar\" pursuing \"Tito\" in the film \"Tito\"?",
    "optionsAr": [
      "أحمد عز",
      "محمود حميدة",
      "خالد صالح",
      "طارق لطفي"
    ],
    "optionsEn": [
      "Ahmed Ezz",
      "Mahmoud Hemida",
      "Khaled Saleh",
      "Tarek Lotfy"
    ],
    "correctIndex": 2,
    "explanationAr": "أبدع الراحل خالد صالح في دور العقيد الفاسد رفعت السكري أمام أحمد السقا (طاهر عبد الحي سليم / تيتو).",
    "explanationEn": "The late Khaled Saleh delivered an unforgettable performance as corrupt detective Refaat opposite Ahmed El Sakka."
  },
  {
    "id": "q_ent_9",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما اسم شخصية الشاب الإسكندراني الصارم الذي جسده أحمد السقا في فيلم «الجزيرة»؟",
    "questionEn": "What was the name of the Upper Egyptian outlaw leader played by Ahmed El Sakka in \"El-Gezira\" (The Island)?",
    "optionsAr": [
      "منصور الحفني",
      "طه الغريب",
      "إبراهيم الأبيض",
      "حسين الزناتي"
    ],
    "optionsEn": [
      "Mansour El-Hefny",
      "Taha El-Gharib",
      "Ibrahim Labyad",
      "Hussein El-Zanaty"
    ],
    "correctIndex": 0,
    "explanationAr": "استوحي فيلم «الجزيرة» من أحداث حقيقية وجسد السقا فيه شخصية منصور الحفني كبير الجزيرة.",
    "explanationEn": "Ahmed El Sakka starred as Mansour El-Hefny, the powerful leader of a Nile island in Upper Egypt."
  },
  {
    "id": "q_ent_10",
    "level": 4,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما اسم الفيلم الذي اجتمع فيه كريم عبد العزيز وأحمد عز في ثنائي المقاومة المصرية ضد الاحتلال البريطاني عام 1919؟",
    "questionEn": "Which historical Egyptian epic united Karim Abdel Aziz and Ahmed Ezz as 1919 resistance fighters?",
    "optionsAr": [
      "الخلية",
      "العارف",
      "كيرة والجن",
      "الممر"
    ],
    "optionsEn": [
      "El-Khaleya",
      "El-Aref",
      "Kira & El-Gin",
      "El-Mamar (The Passage)"
    ],
    "correctIndex": 2,
    "explanationAr": "جسد كريم عبد العزيز دور أحمد عبد الحي كيرة وأحمد عز دور عبد القادر الجن في فيلم «كيرة والجن» (2022).",
    "explanationEn": "Released in 2022, \"Kira & El-Gin\" starred Karim Abdel Aziz as Kira and Ahmed Ezz as Abdel Qader El-Gin."
  },
  {
    "id": "q_ent_11",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما الجملة الكوميدية الشهيرة التي رددها صلاح ذو الفقار لسعاد حسني في فيلم «مراتي مدير عام»؟",
    "questionEn": "Who directed the classic comedy \"My Wife, the General Manager\" starring Salah Zulfikar and Shadia?",
    "optionsAr": [
      "يوسف شاهين",
      "كمال الشيخ",
      "هنري بركات",
      "فطين عبد الوهاب"
    ],
    "optionsEn": [
      "Youssef Chahine",
      "Kamal El Sheikh",
      "Henry Barakat",
      "Fatin Abdel Wahab"
    ],
    "correctIndex": 3,
    "explanationAr": "أخرج فطين عبد الوهاب رائعة «مراتي مدير عام» عام 1966 من بطولة شادية وصلاح ذو الفقار.",
    "explanationEn": "Fatin Abdel Wahab directed the beloved 1966 comedy starring Shadia and Salah Zulfikar."
  },
  {
    "id": "q_ent_12",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "من قام بدور «الشيخ حسني» الكفيف الذي يقود دراجة نارية في شوارع إمبابة بفيلم «الكيت كات»؟",
    "questionEn": "Who played the blind oud player Sheikh Hosny riding a motorcycle through Imbaba in \"Kit Kat\"?",
    "optionsAr": [
      "محمود عبد العزيز",
      "عادل إمام",
      "نور الشريف",
      "أحمد زكي"
    ],
    "optionsEn": [
      "Mahmoud Abdel Aziz",
      "Adel Emam",
      "Nour El-Sherif",
      "Ahmed Zaki"
    ],
    "correctIndex": 0,
    "explanationAr": "قدم الراحل محمود عبد العزيز أحد أعظم أدواره في السينما المصرية بشخصية الشيخ حسني عام 1991.",
    "explanationEn": "Mahmoud Abdel Aziz gave an iconic performance as Sheikh Hosny in Daoud Abdel Sayed’s 1991 masterpiece."
  },
  {
    "id": "q_ent_13",
    "level": 4,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "من أخرج الملحمة السينمائية «الناصر صلاح الدين» عام 1963 من بطولة أحمد مظهر؟",
    "questionEn": "Who directed the 1963 historical Egyptian epic \"Saladin the Victorious\" starring Ahmed Mazhar?",
    "optionsAr": [
      "يوسف شاهين",
      "حسام الدين مصطفى",
      "عاطف الطيب",
      "صلاح أبو سيف"
    ],
    "optionsEn": [
      "Youssef Chahine",
      "Hossam El Din Mostafa",
      "Atef El-Tayeb",
      "Salah Abu Seif"
    ],
    "correctIndex": 0,
    "explanationAr": "أخرج يوسف شاهين فيلم «الناصر صلاح الدين» وشارك في بطولته أحمد مظهر ونادية لطفي وصلاح ذو الفقار.",
    "explanationEn": "Youssef Chahine directed \"El-Nasser Salah El-Din\" in 1963, one of Arab cinema’s grandest epics."
  },
  {
    "id": "q_ent_14",
    "level": 5,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما اسم الفيلم المصري الذي أدى فيه أحمد مكي ثلاث شخصيات مختلفة هم «حزلقوم» و«دبور» و«هيثم دبور»؟",
    "questionEn": "Wait: in which movie did Ahmed Mekky play BOTH \"H-Dabbour\" and later appear as \"Hazalkoum\" in another hit — which film introduced Hazalkoum?",
    "optionsAr": [
      "طير إنت",
      "إتش دبور",
      "سيما علي بابا",
      "لا تراجع ولا استسلام (القبضة الدامية)"
    ],
    "optionsEn": [
      "Teer Enta",
      "H-Dabbour",
      "Cima Ali Baba",
      "La Taragoa Wala Esteslam (No Retreat, No Surrender)"
    ],
    "correctIndex": 3,
    "explanationAr": "ظهرت شخصية حزلقوم الكوميدية الشهيرة لأول مرة عام 2010 في فيلم «لا تراجع ولا استسلام» لأحمد مكي.",
    "explanationEn": "Ahmed Mekky introduced his iconic red-haired character Hazalkoum in \"La Taragoa Wala Esteslam\" (2010)."
  },
  {
    "id": "q_ent_15",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما اسم الضابط البطل الذي جسده شكري سرحان أمام مريم فخر الدين في الفيلم الكلاسيكي «رد قلبي»؟",
    "questionEn": "What was the name of the army officer played by Shoukry Sarhan opposite Mariam Fakhr Eddine in \"Back Again\" (Rod Qalbi)?",
    "optionsAr": [
      "إسماعيل يونس",
      "أدهم صبري",
      "محسن ممتاز",
      "علي ابن الجنايني"
    ],
    "optionsEn": [
      "Ismail Younis",
      "Adham Sabry",
      "Mohsen Momtaz",
      "Ali, the gardener’s son"
    ],
    "correctIndex": 3,
    "explanationAr": "جسد شكري سرحان شخصية علي ابن الريس عبد الواحد الجنايني الذي أحب الأميرة إنجي في فيلم «رد قلبي».",
    "explanationEn": "Shoukry Sarhan portrayed Ali, the gardener’s son who falls in love with Princess Ingy in the 1957 classic."
  },
  {
    "id": "q_ent_16",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "من قام ببطولة دور «كامل» الكوميدي الذي تسبب في فضيحة كروية وشائعة حب مع سعاد حسني في فيلم «إشاعة حب»؟",
    "questionEn": "Who starred as the shy character \"Hussein\" caught in fabricated rumors in \"Rumor of Love\" (Eshaat Hob)?",
    "optionsAr": [
      "أحمد رمزي",
      "عبد الحليم حافظ",
      "عمر الشريف",
      "رشدي أباظة"
    ],
    "optionsEn": [
      "Ahmed Ramzy",
      "Abdel Halim Hafez",
      "Omar Sharif",
      "Rushdy Abaza"
    ],
    "correctIndex": 2,
    "explanationAr": "تألق عمر الشريف في دور حسين الشاب الخجول أمام يوسف وهبي وسعاد حسني وهند رستم في «إشاعة حب» (1960).",
    "explanationEn": "Omar Sharif showed brilliant comedic timing as Hussein opposite Soad Hosny and Youssef Wahbi in 1960."
  },
  {
    "id": "q_ent_17",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "من غنى أغنية «الكيمي كيمي كا» الكوميدية الشهيرة في فيلم «الكيف» مع يحيى الفخراني؟",
    "questionEn": "Which actor sang the famous satirical song \"El-Kimi Kimi Ka\" alongside Yehia El-Fakharany in \"El-Keif\"?",
    "optionsAr": [
      "سعيد صالح",
      "محمود عبد العزيز",
      "فؤاد المهندس",
      "سمير غانم"
    ],
    "optionsEn": [
      "Saeed Saleh",
      "Mahmoud Abdel Aziz",
      "Fouad El-Mohandes",
      "Samir Ghanem"
    ],
    "correctIndex": 1,
    "explanationAr": "أدى محمود عبد العزيز دور المغني الشعبي «مزاجنجي» أمام الدكتور صلاح (يحيى الفخراني) في فيلم «الكيف» (1985).",
    "explanationEn": "Mahmoud Abdel Aziz played street singer Mazagangy opposite Yehia El-Fakharany in the 1985 classic \"El-Keif\"."
  },
  {
    "id": "q_ent_18",
    "level": 4,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما أسماء الإخوة الثلاثة الذين دار حولهم الصراع الأخلاقي في الفيلم المصري الكلاسيكي «العار» (1982)؟",
    "questionEn": "Which three renowned Egyptian actors starred as the three brothers in the 1982 classic drama \"El-Aar\" (The Shame)?",
    "optionsAr": [
      "سمير غانم وجورج سيدهم والضيف أحمد",
      "عادل إمام وأحمد زكي ويحيى الفخراني",
      "فاروق الفيشاوي وعزت العلايلي وصلاح السعدني",
      "نور الشريف ومحمود عبد العزيز وحسين فهمي"
    ],
    "optionsEn": [
      "Samir Ghanem, George Sidhom & El-Deif Ahmed",
      "Adel Emam, Ahmed Zaki & Yehia El-Fakharany",
      "Farouk El-Fishawy, Ezzat El-Alaili & Salah El-Saadany",
      "Nour El-Sherif, Mahmoud Abdel Aziz, and Hussein Fahmy"
    ],
    "correctIndex": 3,
    "explanationAr": "جسد نور الشريف دور كمال، ومحمود عبد العزيز دور الطبيب عادل، وحسين فهمي دور رئيس النيابة شكري.",
    "explanationEn": "Nour El-Sherif (Kamal), Mahmoud Abdel Aziz (Dr. Adel), and Hussein Fahmy (prosecutor Shoukry) led Ali Abdel Khalek’s hit."
  },
  {
    "id": "q_ent_19",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما اسم اللص الطيب خفيف الظل الذي تحدى عبود في فيلم «عبود على الحدود» من بطولة علاء ولي الدين؟",
    "questionEn": "Which three young actors debuted or co-starred alongside Alaa Wali El-Din in the 1999 hit \"Abboud on the Border\"?",
    "optionsAr": [
      "أحمد حلمي وكريم عبد العزيز وعزت أبو عوف",
      "أحمد مكي وماجد الكدواني وشيكو",
      "تامر حسني وخالد سليم وهيثم شاكر",
      "محمد سعد وهاني رمزي وأحمد السقا"
    ],
    "optionsEn": [
      "Ahmed Helmy, Karim Abdel Aziz, and Ezzat Abou Ouf",
      "Ahmed Mekky, Maged El Kedwany & Chico",
      "Tamer Hosny, Khaled Selim & Haitham Shaker",
      "Mohamed Saad, Hany Ramzy & Ahmed El Sakka"
    ],
    "correctIndex": 0,
    "explanationAr": "شكّل فيلم «عبود على الحدود» (1999) انطلاقة كبرى لكل من علاء ولي الدين وأحمد حلمي وكريم عبد العزيز.",
    "explanationEn": "The 1999 military comedy \"Abboud Ala El Hodoud\" launched Ahmed Helmy and Karim Abdel Aziz alongside Alaa Wali El-Din."
  },
  {
    "id": "q_ent_20",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما اسم المحاميين الصديقين المتنافسين اللذين جسدهما عادل إمام ويسرا في فيلم «طيور الظلام»؟",
    "questionEn": "Who played the two rival lawyer friends \"Fathi Nofal\" and \"Ali El-Zanaty\" in \"Birds of Darkness\" (Toyour El-Zalam)?",
    "optionsAr": [
      "أحمد زكي ونور الشريف",
      "محمود ياسين وفاروق الفيشاوي",
      "مصطفى فهمي ومحمود حميدة",
      "عادل إمام ورياض الخولي"
    ],
    "optionsEn": [
      "Ahmed Zaki & Nour El-Sherif",
      "Mahmoud Yassin & Farouk El-Fishawy",
      "Mostafa Fahmy & Mahmoud Hemida",
      "Adel Emam and Riad El-Kholy"
    ],
    "correctIndex": 3,
    "explanationAr": "أبدع عادل إمام في دور فتحي نوفل ورياض الخولي في دور علي الزناتي في فيلم وحيد حامد وشريف عرفة (1995).",
    "explanationEn": "Adel Emam played opportunistic lawyer Fathi Nofal opposite Riad El-Kholy as Ali El-Zanaty in the 1995 political drama."
  },
  {
    "id": "q_ent_21",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما اسم الفيلم الذي قدم فيه أحمد عز وعمرو يوسف وأحمد الفيشاوي وأحمد داود عصابة الأشقاء الأربعة؟",
    "questionEn": "What is the title of the hit Egyptian action film series about four criminal brothers starring Ahmed Ezz and Amr Youssef?",
    "optionsAr": [
      "كازابلانكا",
      "الجزيرة",
      "حرب كرموز",
      "ولاد رزق"
    ],
    "optionsEn": [
      "Casablanca",
      "El-Gezira",
      "Karmouz War",
      "Welad Rizk (Sons of Rizk)"
    ],
    "correctIndex": 3,
    "explanationAr": "أخرج طارق العريان سلسلة «ولاد رزق» التي تدور حول رضا وربيع ورجب وكريم أبناء رزق.",
    "explanationEn": "Directed by Tarek Alarian, \"Welad Rizk\" follows the four brothers Reda, Rabie, Ragab, and Karim."
  },
  {
    "id": "q_ent_22",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "من جسد شخصية الضابط «بسيوني» الذي يعجب بالفتاة الثرية «أمنية» في فيلم «الباشا تلميذ»؟",
    "questionEn": "Who starred as undercover police officer \"Bassiouni\" infiltrating a university in the comedy \"El-Basha Telmeez\"?",
    "optionsAr": [
      "أحمد السقا",
      "رامز جلال",
      "أحمد حلمي",
      "كريم عبد العزيز"
    ],
    "optionsEn": [
      "Ahmed El Sakka",
      "Ramez Galal",
      "Ahmed Helmy",
      "Karim Abdel Aziz"
    ],
    "correctIndex": 3,
    "explanationAr": "جسد كريم عبد العزيز دور الضابط بسيوني متنكراً في هيئة طالب جامعي مع حسن حسني وغادة عادل (2004).",
    "explanationEn": "Karim Abdel Aziz starred as officer Bassiouni opposite Ghada Adel and Hassan Hosny in the 2004 hit."
  },
  {
    "id": "q_ent_23",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما اسم الشخصية التي أداها محمد هنيدي كقبطان بحري خفيف الظل في فيلم «أمير البحار»؟",
    "questionEn": "What was the name of the funny maritime student turned captain played by Mohamed Henedy in \"Amir El Behar\"?",
    "optionsAr": [
      "أمير نور الدين",
      "فول الصين العظيم",
      "وش إجرام",
      "عندليب الدقي"
    ],
    "optionsEn": [
      "Amir Nour El-Din",
      "Fool El-Seen El-Azim",
      "Wesh Egram",
      "Andaleeb El-Dokki"
    ],
    "correctIndex": 0,
    "explanationAr": "لعب محمد هنيدي دور أمير نور الدين الطالب بالأكاديمية البحرية الذي يتصدى لقراصنة البحر مع زملائه.",
    "explanationEn": "Mohamed Henedy played marine academy student Amir Nour El-Din facing sea pirates in \"Amir El Behar\" (2009)."
  },
  {
    "id": "q_ent_24",
    "level": 4,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "أي نجمة جسدت شخصية «بثينة» السكرتيرة الشابة التي تعمل لدى زكي الدسوقي (عادل إمام) في فيلم «عمارة يعقوبيان»؟",
    "questionEn": "Which actress played \"Busayna El-Sayed\" working for Zaki El-Dessouki in \"The Yacoubian Building\"?",
    "optionsAr": [
      "نيللي كريم",
      "منى زكي",
      "هند صبري",
      "يسرا"
    ],
    "optionsEn": [
      "Nelly Karim",
      "Mona Zaki",
      "Hend Sabry",
      "Yousra"
    ],
    "correctIndex": 2,
    "explanationAr": "شاركت هند صبري بدور بثينة أمام عادل إمام ونور الشريف ويسرا في فيلم «عمارة يعقوبيان» (2006).",
    "explanationEn": "Hend Sabry portrayed Busayna El-Sayed opposite Adel Emam in the acclaimed 2006 adaptation of Alaa Al Aswany’s novel."
  },
  {
    "id": "q_ent_25",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما اسم الشاب السمين الموهوب في الرسم الذي جسده أحمد حلمي في فيلم «إكس لارج»؟",
    "questionEn": "What was the profession of \"Magdy\" (played by Ahmed Helmy) in the romantic comedy-drama \"X-Large\"?",
    "optionsAr": [
      "مهندس معماري",
      "معلق رياضي",
      "رسام كاريكاتير",
      "طيار مدني"
    ],
    "optionsEn": [
      "An architect",
      "A sports commentator",
      "A caricature / cartoon artist",
      "A commercial pilot"
    ],
    "correctIndex": 2,
    "explanationAr": "أدى أحمد حلمي دور مجدي مكرم رسام الكاريكاتير في فيلم «إكس لارج» (2011) إلى جانب دنيا سمير غانم.",
    "explanationEn": "Ahmed Helmy starred as struggling caricature artist Magdy opposite Donia Samir Ghanem in \"X-Large\" (2011)."
  },
  {
    "id": "q_ent_26",
    "level": 4,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "من قام ببطولة فيلم «الممر» الذي تناول بطولات الجيش المصري خلال حرب الاستنزاف عام 1967-1968؟",
    "questionEn": "Who starred as Lieutenant Colonel Nour leading a commando unit in the war film \"The Passage\" (El-Mamar)?",
    "optionsAr": [
      "كريم عبد العزيز",
      "أمير كرارة",
      "أحمد عز",
      "محمد رمضان"
    ],
    "optionsEn": [
      "Karim Abdel Aziz",
      "Amir Karara",
      "Ahmed Ezz",
      "Mohamed Ramadan"
    ],
    "correctIndex": 2,
    "explanationAr": "جسد أحمد عز دور المقدم نور في فيلم «الممر» (2019) من إخراج شريف عرفة.",
    "explanationEn": "Ahmed Ezz portrayed Lieutenant Colonel Nour in Sherif Arafa’s 2019 war drama \"El-Mamar\"."
  },
  {
    "id": "q_ent_27",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما اسم الفتاة التي أدت دورها منى زكي والتي تزور جوهانسبرغ في رحلة علمية في فيلم «أفريكانو»؟",
    "questionEn": "Which actress co-starred opposite Ahmed El Sakka as \"Gamila\" in the South Africa-set film \"Africano\"?",
    "optionsAr": [
      "غادة عادل",
      "حنان ترك",
      "ياسمين عبد العزيز",
      "منى زكي"
    ],
    "optionsEn": [
      "Ghada Adel",
      "Hanan Tork",
      "Yasmin Abdelaziz",
      "Mona Zaki"
    ],
    "correctIndex": 3,
    "explanationAr": "تدور أحداث «أفريكانو» (2001) حول الطبيب البيطري بدر (أحمد السقا) وابنة عمه جميلة (منى زكي) في جنوب أفريقيا.",
    "explanationEn": "Mona Zaki starred as Gamila alongside Ahmed El Sakka as vet Badr in the 2001 hit filmed in South Africa."
  },
  {
    "id": "q_ent_28",
    "level": 4,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما الشخصية التي أداها الفنان الراحل إسماعيل ياسين مع زينات صدقي وعبد الفتاح القصري في فيلم «ابن حميدو»؟",
    "questionEn": "Who played the boisterous fisherman captain \"El-Rayes El-Hanafi\" with the catchphrase \"No word after mine\" in \"Ibn Hamido\"?",
    "optionsAr": [
      "محمود المليجي",
      "توفيق الدقن",
      "عبد الفتاح القصري",
      "استيفان روستي"
    ],
    "optionsEn": [
      "Mahmoud El-Meliguy",
      "Tawfik El-Dekn",
      "Abdel Fattah El Qasri",
      "Stephan Rosti"
    ],
    "correctIndex": 2,
    "explanationAr": "اشتهر عبد الفتاح القصري بدور المعلم حنفي وجملته الخالدة «كلمتي ما تنزلش الأرض أبداً» أمام زينات صدقي في «ابن حميدو».",
    "explanationEn": "Abdel Fattah El Qasri became an icon as El-Rayes El-Hanafi in the 1957 comedy \"Ibn Hamido\"."
  },
  {
    "id": "q_ent_29",
    "level": 5,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "من أدى دور «قناوي» بائع الصحف الشهير وأخرج في الوقت نفسه فيلم «باب الحديد» عام 1958؟",
    "questionEn": "Who both directed and starred as newspaper seller \"Qinawi\" in the 1958 masterpiece \"Cairo Station\" (Bab El-Hadid)?",
    "optionsAr": [
      "يوسف شاهين",
      "توفيق صالح",
      "صلاح ذو الفقار",
      "عز الدين ذو الفقار"
    ],
    "optionsEn": [
      "Youssef Chahine",
      "Tewfik Saleh",
      "Salah Zulfikar",
      "Ezz El-Dine Zulfikar"
    ],
    "correctIndex": 0,
    "explanationAr": "جسد يوسف شاهين نفسه دور قناوي في «باب الحديد» إلى جانب هند رستم (هنومة) وفريد شوقي (أبو سريع).",
    "explanationEn": "Youssef Chahine delivered an unforgettable acting and directing feat as Qinawi alongside Hind Rostom and Farid Shawqi."
  },
  {
    "id": "q_ent_30",
    "level": 4,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما اسم الفلاح الذي تمسك بأرضه حتى الرمق الأخير في فيلم «الأرض» (1970) من بطولة محمود المليجي؟",
    "questionEn": "What was the name of the defiant peasant farmer portrayed by Mahmoud El-Meliguy in \"The Land\" (El-Ard)?",
    "optionsAr": [
      "محمد أبو سويلم",
      "أبو العلا البشري",
      "عبد الموجود السويسي",
      "حسين الصعيدي"
    ],
    "optionsEn": [
      "Mohamed Abu Sweilam",
      "Abou El-Ela El-Bishry",
      "Abdel Mawgood El-Sweisy",
      "Hussein El-Saidi"
    ],
    "correctIndex": 0,
    "explanationAr": "أبدع محمود المليجي في دور محمد أبو سويلم أحد أعمدة السينما الواقعية المصرية في فيلم «الأرض».",
    "explanationEn": "Mahmoud El-Meliguy starred as the resolute peasant Mohamed Abu Sweilam in Youssef Chahine’s 1970 classic."
  },
  {
    "id": "q_ent_31",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما اسم الفيلم الذي تنكر فيه محمد سعد في شخصية مذيعة تلفزيونية لكشف فساد مصنع ألبان فاسدة؟",
    "questionEn": "In which comedy film did Mohamed Henedy play \"Nader\", a desperate actor posing as an anchor to expose corrupt businessmen?",
    "optionsAr": [
      "بلية ودماغه العالية",
      "جاءنا البيان التالي",
      "عسكر في المعسكر",
      "همام في أمستردام"
    ],
    "optionsEn": [
      "Belia",
      "Ga’ana El-Bayan El-Taly (Breaking News)",
      "Askar in the Camp",
      "Hammam in Amsterdam"
    ],
    "correctIndex": 1,
    "explanationAr": "قدم محمد هنيدي وحنان ترك فيلم «جاءنا البيان التالي» عام 2001 الذي كشف فيه نادر قضية مصنع الألبان الفاسدة.",
    "explanationEn": "Mohamed Henedy starred as journalist Nader Seif El-Din opposite Hanan Tork in the 2001 satire \"Ga’ana El-Bayan El-Taly\"."
  },
  {
    "id": "q_ent_32",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما دور كل من عادل إمام وعمر الشريف في الفيلم الكوميدي الاجتماعي «حسن ومرقص» (2008)؟",
    "questionEn": "What identities did Adel Emam and Omar Sharif switch to protect their families in \"Hassan and Marcus\" (2008)?",
    "optionsAr": [
      "شرطي يتنكر في هيئة لص ولص يصبح قاضياً",
      "شيخ أزهري يتنكر في هيئة قس مسيحي وقس مسيحي يتنكر في هيئة شيخ",
      "تاجر أسلحة يتنكر كطبيب ومهندس كسائق",
      "صحفيان يبدلان جوازي سفرهما في المطار"
    ],
    "optionsEn": [
      "A cop posing as a thief and vice versa",
      "A Christian priest disguises as a Muslim sheikh, and an Azhar sheikh disguises as a priest",
      "An arms dealer posing as a doctor",
      "Two journalists swapping passports"
    ],
    "correctIndex": 1,
    "explanationAr": "أدى عادل إمام دور الأستاذ اللاهوتي بولس الذي تحول إلى الشيخ حسن العطار، وعمر الشريف دور الشيخ محمود الذي تحول إلى مرقص.",
    "explanationEn": "Adel Emam played Christian theologian Boulis hiding as Sheikh Hassan, while Omar Sharif played Sheikh Mahmoud hiding as Marcus."
  },
  {
    "id": "q_ent_33",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "في فيلم «جعلتني مجرماً»، من خطفت قلب رشدي (أحمد حلمي) بعد أن تظاهرت بتحريره من العصابة الوهمية؟",
    "questionEn": "Which actress starred opposite Ahmed Helmy as \"Malak\" who stages a fake kidnapping in \"Gaaltany Mogreman\"?",
    "optionsAr": [
      "درة",
      "منة شلبي",
      "نيكول سابا",
      "غادة عادل"
    ],
    "optionsEn": [
      "Dorra",
      "Menna Shalaby",
      "Nicole Saba",
      "Ghada Adel"
    ],
    "correctIndex": 3,
    "explanationAr": "لعب أحمد حلمي وغادة عادل وحسن حسني بطولة الكوميديا الرومانسية «جعلتني مجرماً» عام 2006.",
    "explanationEn": "Ghada Adel starred as Malak opposite Ahmed Helmy and Hassan Hosny in the 2006 hit comedy."
  },
  {
    "id": "q_ent_34",
    "level": 4,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "ما اسم الفيلم الذي جسد فيه أحمد زكي شخصية «هشام» المصور الصحفي الذي يتورط في مقتل رئيس تحرير بعد فضيحة؟",
    "questionEn": "In which 1986 Egyptian film did Ahmed Zaki play \"Hasan El-Sabanikh\", the innocent prisoner seeking justice—wait, who played \"Abdel Samad\" the innocent security guard in \"El-Baree\" (The Innocent)?",
    "optionsAr": [
      "محمود ياسين",
      "حسين فهمي",
      "أحمد زكي",
      "نور الشريف"
    ],
    "optionsEn": [
      "Mahmoud Yassin",
      "Hussein Fahmy",
      "Ahmed Zaki",
      "Nour El-Sherif"
    ],
    "correctIndex": 2,
    "explanationAr": "قدم أحمد زكي أحد أعظم أدوار السينما العربية بشخصية المجند البسيط أحمد سبع الليل في فيلم «البريء» (1986).",
    "explanationEn": "Ahmed Zaki gave an unforgettable performance as naive conscript Ahmed Sabaa El-Leil in Atef El-Tayeb’s \"El-Baree\"."
  },
  {
    "id": "q_ent_35",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_movies",
    "questionAr": "من قام ببطولة فيلم «مافيا» بدور «حسين أمين» الشاب الذي تجنده المخابرات المصرية لحماية شخصية عالمية؟",
    "questionEn": "Who starred as \"Hussein Amin\", recruited by Egyptian intelligence to thwart an assassination plot in \"Mafia\" (2002)?",
    "optionsAr": [
      "أحمد عز",
      "مصطفى شعبان",
      "أحمد السقا",
      "تامر هجرس"
    ],
    "optionsEn": [
      "Ahmed Ezz",
      "Mostafa Shaban",
      "Ahmed El Sakka",
      "Tamer Hagras"
    ],
    "correctIndex": 2,
    "explanationAr": "جمع فيلم «مافيا» (2002) أحمد السقا ومنى زكي ومصطفى شعبان وأحمد رزق من إخراج شريف عرفة.",
    "explanationEn": "Ahmed El Sakka led Sherif Arafa’s 2002 espionage action hit \"Mafia\" alongside Mona Zaki and Mostafa Shaban."
  },
  {
    "id": "q_ent_36",
    "level": 1,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "ما اسم الشخصية الشهيرة التي جسدها نور الشريف لتاجر الخردة العصامي في مسلسل «لن أعيش في جلباب أبي»؟",
    "questionEn": "What was the name of the self-made scrap metal tycoon played by Nour El-Sherif in \"I Will Not Live in My Father’s Robes\"?",
    "optionsAr": [
      "عبد الغفور البرعي",
      "سليم البدري",
      "سليمان غانم",
      "الحاج متولي"
    ],
    "optionsEn": [
      "Abdel Ghafour El-Boraie",
      "Selim El-Badry",
      "Soliman Ghanem",
      "El-Hag Metwally"
    ],
    "correctIndex": 0,
    "explanationAr": "أصبح عبد الغفور البرعي وزوجته فاطمة كشري (عبلة كامل) من أشهر شخصيات الدراما العربية في رمضان 1996.",
    "explanationEn": "Abdel Ghafour El-Boraie (Nour El-Sherif) and Fatma Koshary (Abla Kamel) remain icons of Egyptian television."
  },
  {
    "id": "q_ent_37",
    "level": 1,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "من جسد شخصية الجاسوس المصري «رفعت الجمال» في المسلسل الشهير «رأفت الهجان»؟",
    "questionEn": "Who starred as real-life Egyptian intelligence hero \"Raafat El-Haggan\" across three television seasons?",
    "optionsAr": [
      "نور الشريف",
      "محمود ياسين",
      "محمود عبد العزيز",
      "عادل إمام"
    ],
    "optionsEn": [
      "Nour El-Sherif",
      "Mahmoud Yassin",
      "Mahmoud Abdel Aziz",
      "Adel Emam"
    ],
    "correctIndex": 2,
    "explanationAr": "لعب محمود عبد العزيز دور رفعت الجمال (ديفيد شارل سمحون) في ملحمة «رأفت الهجان» للكاتب صالح مرسي.",
    "explanationEn": "Mahmoud Abdel Aziz brilliantly portrayed Egyptian intelligence agent Refaat El-Gammal in \"Raafat El-Haggan\"."
  },
  {
    "id": "q_ent_38",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "كم زوجة جمعهن «الحاج متولي» (نور الشريف) في مسلسل «عائلة الحاج متولي»؟",
    "questionEn": "How many wives did El-Hag Metwally (Nour El-Sherif) marry in total in \"El-Hag Metwally’s Family\"?",
    "optionsAr": [
      "زوجتان فقط",
      "أربع زوجات (زبيدة، أمينة، نعمة الله، مديحة)",
      "ثلاث زوجات",
      "خمس زوجات"
    ],
    "optionsEn": [
      "Two wives only",
      "Four wives (Zobeida, Amina, Nematallah, and Madiha)",
      "Three wives",
      "Five wives"
    ],
    "correctIndex": 1,
    "explanationAr": "تزوج الحاج متولي بعد وفاة زبيدة (فادية عبد الغني) من أمينة (ماجدة زكي) ونعمة الله (غادة عبد الرازق) ومديحة (سمية الخشاب).",
    "explanationEn": "Metwally married Zobeida (who passed away early) and later Amina, Nematallah, and Madiha."
  },
  {
    "id": "q_ent_39",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "ما اسم التوأمين المتناقضين في طباعهما اللذين جسدهما يحيى الفخراني وصلاح السعدني كخصمين في «ليالي الحلمية»؟",
    "questionEn": "Who portrayed lifelong rivals \"Selim El-Badry\" and \"Soliman Ghanem\" in the epic drama \"Layali El-Helmiya\"?",
    "optionsAr": [
      "عادل إمام وسعيد صالح",
      "أحمد عبد العزيز وعبد الله غيث",
      "فاروق الفيشاوي ومحمود مرسي",
      "يحيى الفخراني وصلاح السعدني"
    ],
    "optionsEn": [
      "Adel Emam & Saeed Saleh",
      "Ahmed Abdel Aziz & Abdullah Ghaith",
      "Farouk El-Fishawy & Mahmoud Morsy",
      "Yehia El-Fakharany and Salah El-Saadany"
    ],
    "correctIndex": 3,
    "explanationAr": "أبدع يحيى الفخراني (سليم باشا البدري) وصلاح السعدني (العمدة سليمان غانم) في رائعة أسامة أنور عكاشة.",
    "explanationEn": "Yehia El-Fakharany played aristocrat Selim El-Badry while Salah El-Saadany played Mayor Soliman Ghanem."
  },
  {
    "id": "q_ent_40",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "من قدم شخصية العمدة أو الرجل الكوميدي القاهري في الصعيد «الكبير أوي» وشقيقيه «جوني» و«حزلقوم»؟",
    "questionEn": "Which actor plays the triplets \"El-Kabeer Awi\", \"Johnny\", and \"Hazalkoum\" in the comedy series \"El-Kabeer Awi\"?",
    "optionsAr": [
      "أكرم حسني",
      "أحمد مكي",
      "أحمد فهمي",
      "هشام ماجد"
    ],
    "optionsEn": [
      "Akram Hosny",
      "Ahmed Mekky",
      "Ahmed Fahmy",
      "Hesham Maged"
    ],
    "correctIndex": 1,
    "explanationAr": "يؤدي أحمد مكي الشخصيات الثلاث في المزاريطة بمواسم «الكبير أوي» المتتالية أمام رحمة أحمد ومحمد سلام.",
    "explanationEn": "Ahmed Mekky plays all three contrasting brothers in the fictional Upper Egyptian village of El-Mazarita."
  },
  {
    "id": "q_ent_41",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "ما اسم القرية الصعيدية التي دارت فيها أحداث مسلسل «ذئاب الجبل» وشخصية «علوان البكري»؟",
    "questionEn": "Which veteran actor portrayed the cunning villain \"Elwan El-Bakry\" in the Upper Egyptian classic \"The Mountain Wolves\"?",
    "optionsAr": [
      "أحمد بدير",
      "عبد الله غيث",
      "حمدي غيث",
      "محمود الجندي"
    ],
    "optionsEn": [
      "Ahmed Bedier",
      "Abdullah Ghaith",
      "Hamdy Ghaith",
      "Mahmoud El-Gendy"
    ],
    "correctIndex": 1,
    "explanationAr": "كان دور علوان البكري في «ذئاب الجبل» (1993) من أشهر أدوار الراحل عبد الله غيث أمام سماح أنور وأحمد عبد العزيز.",
    "explanationEn": "Abdullah Ghaith delivered an iconic final performance as Elwan El-Bakry in the 1993 hit \"Ze’ab El-Gabal\"."
  },
  {
    "id": "q_ent_42",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "ما المهنة التي برع فيها «حسن أرابيسك» (صلاح السعدني) في مسلسل «أرابيسك»؟",
    "questionEn": "What traditional craft was master artisan \"Hassan Arabesque\" (Salah El-Saadany) famous for in the series \"Arabesque\"?",
    "optionsAr": [
      "صناعة وزخرفة الأرابيسك الخشبي",
      "صناعة السجاد اليدوي الحريري",
      "صياغة الفضة والنحاس في خان الخليلي",
      "خياطة الجلابيب التراثية"
    ],
    "optionsEn": [
      "Traditional woodcraft and arabesque design",
      "Silk carpet weaving",
      "Silver & copper engraving",
      "Tailoring traditional garments"
    ],
    "correctIndex": 0,
    "explanationAr": "اشتهر حسن النعماني الملقب بحسن أرابيسك بمهارته الفائقة في فن الأرابيسك رغم تمرده ومزاجيته.",
    "explanationEn": "Hassan El-Nomani was a brilliant yet troubled master of traditional wooden arabesque architecture."
  },
  {
    "id": "q_ent_43",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "في مسلسل «جعفر العمدة» (2023)، ما الأزمة الكبرى التي ظل جعفر (محمد رمضان) يبحث عنها طوال 19 عاماً؟",
    "questionEn": "In the 2023 hit drama \"Gaafar El-Omda\", what lifelong mystery drives Gaafar (Mohamed Ramadan)?",
    "optionsAr": [
      "العثور على ابنه المختطف منذ يوم ولادته",
      "الهروب من عصابة دولية في أوروبا",
      "اكتشاف هوية قاتل شقيقه التوأم",
      "استرداد كنز أثري مدفون في قصر قديم"
    ],
    "optionsEn": [
      "Finding his son who was kidnapped on the day of his birth 19 years earlier",
      "Fleeing an international syndicate",
      "Solving his twin brother’s disappearance",
      "Recovering hidden treasure in an old palace"
    ],
    "correctIndex": 0,
    "explanationAr": "قضى جعفر العمدة 19 عاماً يبحث عن ابنه المختطف (سيف) دون أن يعلم أنه قريب منه في السيدة زينب.",
    "explanationEn": "Gaafar spent 19 years searching for his kidnapped infant son Seif, unaware he was nearby in Sayeda Zeinab."
  },
  {
    "id": "q_ent_44",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "من جسدتا البطولة النسائية الكوميدية في المسلسل الكلاسيكي «بكيزة وزغلول»؟",
    "questionEn": "Which two actresses starred as the contrasting duo \"Bakiza and Zaghloul\" in the 1987 Egyptian comedy series?",
    "optionsAr": [
      "يسرا وليلى علوي",
      "سعاد حسني ونادية لطفي",
      "دلال عبد العزيز وميرفت أمين",
      "سهير البابلي وإسعاد يونس"
    ],
    "optionsEn": [
      "Yousra & Laila Elwi",
      "Soad Hosny & Nadia Lutfi",
      "Dalal Abdel Aziz & Mervat Amin",
      "Soheir El-Bably and Esaad Younis"
    ],
    "correctIndex": 3,
    "explanationAr": "كتبت إسعاد يونس المسلسل وأدت دور زغلول الفتاة الفقيرة أمام سهير البابلي بدور الهانم بكيزة الدرملي.",
    "explanationEn": "Esaad Younis wrote the series and played Zaghloul opposite Soheir El-Bably as the aristocratic Bakiza El-Darmally."
  },
  {
    "id": "q_ent_45",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "من قام ببطولة مسلسل «يوميات ونيس» وكتب أغنياته الهادفة عن الأخلاق وتربية الأبناء؟",
    "questionEn": "Who starred as the devoted father \"Wanis\" in the beloved family sitcom \"Yawmeyat Wanis\"?",
    "optionsAr": [
      "محمد صبحي",
      "هاني رمزي",
      "فؤاد المهندس",
      "عادل إمام"
    ],
    "optionsEn": [
      "Mohamed Sobhy",
      "Hany Ramzy",
      "Fouad El-Mohandes",
      "Adel Emam"
    ],
    "correctIndex": 0,
    "explanationAr": "شكل محمد صبحي وسعاد نصر (ماما مايسة) وأبناؤهما عز الدين وجهاد وهبة وشرف الدين أحد أنجح المسلسلات التربوية.",
    "explanationEn": "Mohamed Sobhy and Soad Nasr starred as Wanis and Mama Maysa in the iconic multi-season family series."
  },
  {
    "id": "q_ent_46",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "ما الاسم الكامل للشخصية التي عاد بها يحيى الفخراني بعد غياب 20 عاماً فاقداً للذاكرة في مسلسل «عباس الأبيض في اليوم الأسود»؟",
    "questionEn": "Under what mistaken identity was Abbas El-Demery (Yehia El-Fakharany) imprisoned abroad before returning home in \"Abbas El-Abyad\"?",
    "optionsAr": [
      "شيخ العرب همام",
      "لطفي الجنايني",
      "الخواجة عبد القادر",
      "يونس ولد فضة"
    ],
    "optionsEn": [
      "Sheikh El-Arab Hammam",
      "Lotfy El-Ganainy",
      "El-Khawaga Abdel Qader",
      "Younis Weld Fadda"
    ],
    "correctIndex": 1,
    "explanationAr": "دخل عباس الدميري السجن في العراق بتهمة باسم زميله لطفي الجنايني، وعاد ليجد زوجته تزوجت بأعز أصدقائه.",
    "explanationEn": "Abbas El-Demery spent 20 years in a foreign prison under the name Lotfy El-Ganainy before returning to Cairo."
  },
  {
    "id": "q_ent_47",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "ما اسم العائلة الصعيدية التي حاربت الشر وتسلط «البيه الكبير» في مسلسل «الضوء الشارد»؟",
    "questionEn": "Which actor starred as the upright elder brother \"Rafie El-Azayzy\" in the 1998 Upper Egyptian drama \"El-Daw El-Shared\"?",
    "optionsAr": [
      "محمد رياض",
      "ممدوح عبد العليم",
      "أحمد ماهر",
      "رياض الخولي"
    ],
    "optionsEn": [
      "Mohamed Riad",
      "Mamdouh Abdel Alim",
      "Ahmed Maher",
      "Riad El-Kholy"
    ],
    "correctIndex": 1,
    "explanationAr": "جسد ممدوح عبد العليم دور رفيع بيه العزايزي أمام يوسف شعبان ومنى زكي ومحمد رياض في «الضوء الشارد».",
    "explanationEn": "Mamdouh Abdel Alim played noble brother Rafie El-Azayzy opposite Youssef Shaaban and Mona Zaki."
  },
  {
    "id": "q_ent_48",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "في مسلسل «الاختيار» (الجزء الأول)، من جسد شخصية الشهيد البطل العقيد «أحمد صابر المنسي»؟",
    "questionEn": "Who portrayed Colonel Ahmed Saber El-Mansi in the first season of the biographical military drama \"El-Ekhtiyar\" (The Choice)?",
    "optionsAr": [
      "ياسر جلال",
      "أمير كرارة",
      "أحمد العوضي",
      "كريم عبد العزيز"
    ],
    "optionsEn": [
      "Yasser Galal",
      "Amir Karara",
      "Ahmed El-Awady",
      "Karim Abdel Aziz"
    ],
    "correctIndex": 1,
    "explanationAr": "أدى أمير كرارة دور العقيد أحمد المنسي أمام أحمد العوضي (هشام عشماوي) في «الاختيار 1» عام 2020.",
    "explanationEn": "Amir Karara starred as Colonel Ahmed El-Mansi in the 2020 hit series directed by Peter Mimi."
  },
  {
    "id": "q_ent_49",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "ما اسم الشخصية التي أداها محمد رمضان في مسلسل «الأسطورة» وقُتلت على يد عصام النمر ليثأر لها شقيقه ناصر؟",
    "questionEn": "What were the names of the twin brothers both played by Mohamed Ramadan in the 2016 hit series \"El-Ostoora\"?",
    "optionsAr": [
      "جعفر العمدة وسيف",
      "موسى وشداد",
      "رفاعي الدسوقي وناصر الدسوقي",
      "رضوان البرنس وفتحي البرنس"
    ],
    "optionsEn": [
      "Gaafar & Seif",
      "Mousa & Shaddad",
      "Refaie El-Dessouky and Nasser El-Dessouky",
      "Radwan & Fathy El-Prince"
    ],
    "correctIndex": 2,
    "explanationAr": "جسد محمد رمضان شخصيتي الأخوين رفاعي وناصر الدسوقي في مسلسل «الأسطورة» (2016) من إخراج محمد سامي.",
    "explanationEn": "Mohamed Ramadan played both elder brother Refaie and law graduate Nasser El-Dessouky in \"El-Ostoora\"."
  },
  {
    "id": "q_ent_50",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "من أدى شخصية الشقيق الشرير «فتحي البرنس» الذي تآمر لسجن أخيه «رضوان» في مسلسل «البرنس»؟",
    "questionEn": "Which actor played the ruthless brother \"Fathy El-Prince\" plotting against Radwan (Mohamed Ramadan) in \"El-Prince\"?",
    "optionsAr": [
      "محمد علاء",
      "أحمد زاهر",
      "إدوارد",
      "فتوح أحمد"
    ],
    "optionsEn": [
      "Mohamed Alaa",
      "Ahmed Zaher",
      "Edward",
      "Fattouh Ahmed"
    ],
    "correctIndex": 1,
    "explanationAr": "تألق أحمد زاهر في دور فتحي البرنس مع روجينا (فدوى) في رمضان 2020.",
    "explanationEn": "Ahmed Zaher gained huge attention for his villainous role as Fathy opposite Rogena and Mohamed Ramadan."
  },
  {
    "id": "q_ent_51",
    "level": 4,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "في مسلسل «جراند أوتيل» (2016)، في أي مدينة سياحية مصرية تدور أحداث الفندق الفاخر بالخمسينيات؟",
    "questionEn": "In which historic southern Egyptian city is the 1950s luxury hotel in \"Grand Hotel\" (Secret of the Nile) located?",
    "optionsAr": [
      "الأقصر",
      "الإسكندرية",
      "أسوان",
      "شرم الشيخ"
    ],
    "optionsEn": [
      "Luxor",
      "Alexandria",
      "Aswan",
      "Sharm El-Sheikh"
    ],
    "correctIndex": 2,
    "explanationAr": "صُوّرت أحداث «جراند أوتيل» (بطولة عمرو يوسف وأمينة خليل) في فندق كتراكت التاريخي بمدينة أسوان.",
    "explanationEn": "Starring Amr Youssef and Amina Khalil, \"Grand Hotel\" was filmed at Aswan’s historic Old Cataract Hotel."
  },
  {
    "id": "q_ent_52",
    "level": 4,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "من جسد شخصية الصيدلي الذي يخدع زوجته وأولاده في مسلسل «هذا المساء» وشخصية الشيطان الوسواس في مسلسل «ونوس»؟",
    "questionEn": "Who portrayed the charismatic devil-like tempter \"Wanoos\" in the 2016 philosophical drama \"Wanoos\"?",
    "optionsAr": [
      "خالد الصاوي",
      "ماجد الكدواني",
      "محمود حميدة",
      "يحيى الفخراني"
    ],
    "optionsEn": [
      "Khaled El-Sawy",
      "Maged El Kedwany",
      "Mahmoud Hemida",
      "Yehia El-Fakharany"
    ],
    "correctIndex": 3,
    "explanationAr": "أبدع يحيى الفخراني في دور «ونوس» الذي يغوي عائلة بأكملها مقابل بيع مبادئهم إلى جانب هالة صدقي ونبيل الحلفاوي.",
    "explanationEn": "Yehia El-Fakharany starred as the Mephistophelean \"Wanoos\" tempting a Cairo family."
  },
  {
    "id": "q_ent_53",
    "level": 4,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "في مسلسل «الحشاشين» (رمضان 2024)، من أدى دور «حسن الصباح» مؤسس قلعة ألموت؟",
    "questionEn": "Who starred as Hassan-i Sabbah, leader of the Alamut fortress order, in the 2024 epic series \"El-Hashashin\"?",
    "optionsAr": [
      "أحمد عز",
      "كريم عبد العزيز",
      "عمرو سعد",
      "أحمد السقا"
    ],
    "optionsEn": [
      "Ahmed Ezz",
      "Karim Abdel Aziz",
      "Amr Saad",
      "Ahmed El Sakka"
    ],
    "correctIndex": 1,
    "explanationAr": "جسد كريم عبد العزيز دور حسن الصباح أمام فتحي عبد الوهاب (نظام الملك) وأحمد عيد (زيد بن سيحون).",
    "explanationEn": "Karim Abdel Aziz portrayed Hassan-i Sabbah opposite Fathy Abdel Wahab in Peter Mimi’s 2024 historical series."
  },
  {
    "id": "q_ent_54",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "من أدى دوري الشقيقين الضابط والطبيب (أو التوأم في «كفر دلهاب») مع روجينا؟",
    "questionEn": "Who starred as the mysterious doctor \"Saad\" seeking revenge in the horror drama \"Kafr Delhab\"?",
    "optionsAr": [
      "عمرو يوسف",
      "ظافر العابدين",
      "خالد النبوي",
      "يوسف الشريف"
    ],
    "optionsEn": [
      "Amr Youssef",
      "Dhafer L’Abidine",
      "Khaled El Nabawy",
      "Youssef El-Sherif"
    ],
    "correctIndex": 3,
    "explanationAr": "أدى يوسف الشريف شخصية الطبيب سعد / شهاب الدين في مسلسل «كفر دلهاب» عام 2017.",
    "explanationEn": "Youssef El-Sherif led the suspenseful mystery \"Kafr Delhab\" (2017) written by Amr Samir Atef."
  },
  {
    "id": "q_ent_55",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "ما اسم المسلسل الكوميدي الذي جمعت بطولته بين الشقيقتين دنيا وإيمي سمير غانم بدوري ابنتي عم؟",
    "questionEn": "What was the title of the hit 2016 comedy series co-starring sisters Donia and Amy Samir Ghanem as cousins?",
    "optionsAr": [
      "في ال لا لا لاند",
      "بدل الحدوتة تلاتة",
      "نيللي وشريهان",
      "لهفة"
    ],
    "optionsEn": [
      "Fil La La Land",
      "Badal El Hadouta Talata",
      "Nelly and Sherihan",
      "Lahfa"
    ],
    "correctIndex": 2,
    "explanationAr": "حقق «نيللي وشريهان» نجاحاً ضخماً بفضل ثنائية نيللي الثرية وشريهان البسيطة الباحثتين عن لغز الميراث.",
    "explanationEn": "Donia (rich Nelly) and Amy (down-to-earth Sherihan) searched together for their grandfather’s hidden fortune."
  },
  {
    "id": "q_ent_56",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "من جسدتا دوري أختين تقاومان الفساد في مسلسل «سجن النسا» إلى جانب نيللي كريم؟",
    "questionEn": "Who played the lead warden-turned-inmate \"Ghalia\" in Kamla Abu Zekry’s acclaimed prison drama \"Segn El-Nesa\"?",
    "optionsAr": [
      "نيللي كريم",
      "هند صبري",
      "غادة عبد الرازق",
      "منه شلبي"
    ],
    "optionsEn": [
      "Nelly Karim",
      "Hend Sabry",
      "Ghada Abdel Razek",
      "Menna Shalaby"
    ],
    "correctIndex": 0,
    "explanationAr": "قدمت نيللي كريم دور السجانة غالية التي يدمرها زوجها صابر فتدخل السجن مع روبي ودرة (2014).",
    "explanationEn": "Nelly Karim starred as Ghalia alongside Ruby and Dorra in the 2014 Ramadan drama."
  },
  {
    "id": "q_ent_57",
    "level": 4,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "ما اسم الباشا الثري ومؤرخ حارة المال والبنون في مسلسل «المال والبنون» من بطولة عبد الله غيث ويوسف شعبان؟",
    "questionEn": "Who played the two childhood friends split by illegal wealth (\"Abbas El-Daw\" and \"Salama Farawla\") in \"Money and Sons\"?",
    "optionsAr": [
      "عزت العلايلي وسمير صبري",
      "محمود مرسي وصلاح قابيل",
      "نور الشريف وأحمد زكي",
      "عبد الله غيث ويوسف شعبان"
    ],
    "optionsEn": [
      "Ezzat El-Alaili & Samir Sabri",
      "Mahmoud Morsy & Salah Qabil",
      "Nour El-Sherif & Ahmed Zaki",
      "Abdullah Ghaith and Youssef Shaaban"
    ],
    "correctIndex": 3,
    "explanationAr": "رفض عباس الضو (عبد الله غيث) تقاسم المال الحرام مع شريكه سلامة فراولة (يوسف شعبان) في رائعة «المال والبنون».",
    "explanationEn": "Abdullah Ghaith (Abbas El-Daw) refused ill-gotten fortune while Youssef Shaaban (Salama Farawla) embraced it."
  },
  {
    "id": "q_ent_58",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "في مسلسل «سلسال الدم»، من أدت دور «ناصرة» المرأة الصعيدية القوية في صراعها الطويل مع «هارون»؟",
    "questionEn": "Who played the fearless Upper Egyptian matriarch \"Nasra\" clashing with Haroun (Riad El-Kholy) in \"Selsal El-Dam\"?",
    "optionsAr": [
      "معالي زايد",
      "ليلى علوي",
      "إلهام شاهين",
      "عبلة كامل"
    ],
    "optionsEn": [
      "Maali Zayed",
      "Laila Elwi",
      "Elham Shahin",
      "Abla Kamel"
    ],
    "correctIndex": 3,
    "explanationAr": "امتد مسلسل «سلسال الدم» لخمسة أجزاء وجمع بين عبلة كامل (ناصرة) ورياض الخولي (العمدة هارون).",
    "explanationEn": "Abla Kamel starred across five seasons as Nasra fighting Mayor Haroun in \"Selsal El-Dam\"."
  },
  {
    "id": "q_ent_59",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "ما اسم المسلسل الكوميدي الذي وجد فيه «عمرو» (أكرم حسني) وصديقه «سمسم» وصية بمزرعة ومهام غريبة؟",
    "questionEn": "Which comedy series teamed Akram Hosny (\"Ebo\") with Ahmed Amin (\"Semsem\") carrying out eccentric charity wishes?",
    "optionsAr": [
      "الوصية",
      "مكتوب عليا",
      "رجالة البيت",
      "اللعبة"
    ],
    "optionsEn": [
      "El-Wasaya (The Will)",
      "Maktoob Alaya",
      "Regalet El-Beit",
      "El-Le’ba"
    ],
    "correctIndex": 0,
    "explanationAr": "شارك أكرم حسني وأحمد أمين وريم مصطفى في مسلسل «الوصية» (2018) وحققوا شهرة بشخصية «إيبو وسمسم».",
    "explanationEn": "Akram Hosny (Ebo) and Ahmed Amin (Semsem) became fan favorites in the 2018 comedy \"El-Wasaya\"."
  },
  {
    "id": "q_ent_60",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "من أديا دورَي الصديقين المتنافسين في التحديات المجنونة «وسيم» و«مازو» في مسلسل «اللعبة»؟",
    "questionEn": "Which comedy duo stars as lifelong competitive friends \"Wasim\" and \"Mazo\" in the hit series \"El-Le’ba\"?",
    "optionsAr": [
      "بيومي فؤاد ومحمد ثروت",
      "أحمد فهمي وأكرم حسني",
      "علي ربيع ومصطفى خاطر",
      "شيكو وهشام ماجد"
    ],
    "optionsEn": [
      "Bayoumi Fouad & Mohamed Tharwat",
      "Ahmed Fahmy & Akram Hosny",
      "Ali Rabee & Mostafa Khater",
      "Chico and Hesham Maged"
    ],
    "correctIndex": 3,
    "explanationAr": "يتنافس شيكو (وسيم) وهشام ماجد (مازو) عبر مواسم «اللعبة» في تحديات غريبة أمام مي كساب وميرنا جميل.",
    "explanationEn": "Chico (Wasim) and Hesham Maged (Mazo) face escalating pranks and tasks in the hit multi-season comedy."
  },
  {
    "id": "q_ent_61",
    "level": 4,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "ما اسم الشخصية الصعيدية التي جسدها عمرو يوسف في مسلسل «طايع» (2018) وهو طبيب يواجه الثأر والآثار؟",
    "questionEn": "Who starred as Upper Egyptian doctor \"Taye\" caught in a blood feud and antiquities smuggling in \"Taye\" (2018)?",
    "optionsAr": [
      "آسر ياسين",
      "أحمد داود",
      "عمرو يوسف",
      "محمد رمضان"
    ],
    "optionsEn": [
      "Asser Yassin",
      "Ahmed Dawood",
      "Amr Youssef",
      "Mohamed Ramadan"
    ],
    "correctIndex": 2,
    "explanationAr": "لعب عمرو يوسف دور الدكتور طايع الهواري أمام عمرو عبد الجليل (الريس حربي) وصبا مبارك (مهجة).",
    "explanationEn": "Amr Youssef played Taye El-Hawary opposite Amr Abdel Gelil as Harbi and Saba Mubarak as Mohga."
  },
  {
    "id": "q_ent_62",
    "level": 3,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "من جسد شخصية الصديقين الشعبيين «سفينة» و«سرية» في مسلسل «ملوك الجدعنة»؟",
    "questionEn": "Which two actors co-starred as best friends \"Safina\" and \"Serreya\" in the 2021 drama \"Molouk El-Gadaana\"?",
    "optionsAr": [
      "تامر حسني وأحمد السقا",
      "مصطفى شعبان وعمرو سعد",
      "كريم فهمي وأحمد حاتم",
      "ماجد المصري وياسر جلال"
    ],
    "optionsEn": [
      "Tamer Hosny & Ahmed El Sakka",
      "Mostafa Shaban and Amr Saad",
      "Karim Fahmy & Ahmed Hatem",
      "Maged El Masry & Yasser Galal"
    ],
    "correctIndex": 1,
    "explanationAr": "اجتمع مصطفى شعبان (سفينة) وعمرو سعد (سرية) في «ملوك الجدعنة» عام 2021 أمام الراحلة دلال عبد العزيز.",
    "explanationEn": "Mostafa Shaban and Amr Saad teamed up as loyal friends Safina and Serreya in the 2021 Ramadan hit."
  },
  {
    "id": "q_ent_63",
    "level": 4,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "ما اسم المسلسل التاريخي الوطني الذي قدمه أحمد بدير وسهير المرشدي وشوقي شامخ وحكى تاريخ بوابة مصر؟",
    "questionEn": "Who composed the iconic score and starring cast—wait, who played \"أبو بكر القماش\" أو \"الحلواني\"؛ من كتب مسلسل «بوابة الحلواني» التاريخي؟",
    "optionsAr": [
      "مدحت العدل",
      "وحيد حامد",
      "محفوظ عبد الرحمن",
      "محمود أبو زيد"
    ],
    "optionsEn": [
      "Medhat El Adl",
      "Wahid Hamed",
      "Mahfouz Abdel Rahman",
      "Mahmoud Abou Zeid"
    ],
    "correctIndex": 2,
    "explanationAr": "كتب الكاتب الكبير محفوظ عبد الرحمن ملحمة «بوابة الحلواني» بأربعة أجزاء وتألق فيها علي الحجار وصلاح قابيل.",
    "explanationEn": "Acclaimed playwright Mahfouz Abdel Rahman penned the four-season historical series \"Bawabet El-Halawany\"."
  },
  {
    "id": "q_ent_64",
    "level": 2,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "من أدى دور الضابط «تامر» وزوجته «شوقية» في مسلسل الست كوم الشهير «تامر وشوقية»؟",
    "questionEn": "Which actors starred as mismatched couple \"Tamer\" and \"Shawqeya\" in the popular Egyptian sitcom \"Tamer & Shawqeya\"?",
    "optionsAr": [
      "أحمد الفيشاوي ومي كساب",
      "أشرف عبد الباقي وإنتصار",
      "رامز جلال وداليا البحيري",
      "أحمد السعدني وريهام عبد الغفور"
    ],
    "optionsEn": [
      "Ahmed El-Fishawy and Mai Kassab",
      "Ashraf Abdel Baky & Entesar",
      "Ramez Galal & Dalia El-Behairy",
      "Ahmed El-Saadany & Riham Abdel Ghafour"
    ],
    "correctIndex": 0,
    "explanationAr": "دارت حلقات «تامر وشوقية» حول المفارقات الكوميدية بين عائلة المحامي الأرستقراطي تامر وعائلة شوقية الشعبية.",
    "explanationEn": "Ahmed El-Fishawy and Mai Kassab led the multi-season sitcom contrasting two very different Cairo families."
  },
  {
    "id": "q_ent_65",
    "level": 5,
    "category": "cinema",
    "topic": "egyptian_series",
    "questionAr": "ما اسم المسلسل الرمضاني الذي تناول سيرة الأديب العالمي أو حي «الجمالية» بأدوار «عطا المراكيبي» و«جليلة»؟",
    "questionEn": "In \"Hadith El-Sabah Wal-Masaa\" (based on Naguib Mahfouz’s novel), who played the powerful matriarch \"Galila\" (or \"Hoda\")—which actor played \"Atta El-Marakibi\"?",
    "optionsAr": [
      "خالد النبوي",
      "أحمد السقا",
      "هاني سلامة",
      "شريف منير"
    ],
    "optionsEn": [
      "Khaled El-Nabawy",
      "Ahmed El Sakka",
      "Hany Salama",
      "Sherif Mounir"
    ],
    "correctIndex": 0,
    "explanationAr": "أبدعت عبلة كامل (جليلة) وليلى علوي (هدى هانم) وخالد النبوي (داود باشا) وأحمد خليل (عطا المراكيبي) في رائعة نجيب محفوظ.",
    "explanationEn": "Khaled El-Nabawy played Dawoud Pasha alongside Abla Kamel as Galila and Laila Elwi as Hoda Hanem."
  },
  {
    "id": "q_ent_66",
    "level": 1,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "ما اسم البطل الأشقر الذي أدى دور «مهند» في المسلسل التركي الشهير «نور ومهند»؟",
    "questionEn": "Which Turkish star played \"Mohannad\" (Mehmet) in the hit series \"Noor\" (Gümüş)?",
    "optionsAr": [
      "كينان إميرزالي أوغلو",
      "كيفانش تاتليتوغ",
      "بوراك أوزجيفيت",
      "تولجهان سايشمان"
    ],
    "optionsEn": [
      "Kenan İmirzalıoğlu",
      "Kıvanç Tatlıtuğ",
      "Burak Özçivit",
      "Tolgahan Sayışman"
    ],
    "correctIndex": 1,
    "explanationAr": "نال كيفانش تاتليتوغ وسونغول أودين (نور) شهرة عربية هائلة مع عرض مسلسل «نور» عام 2008.",
    "explanationEn": "Kıvanç Tatlıtuğ starred alongside Songül Öden (Noor) in the phenomenon series that swept Arab television."
  },
  {
    "id": "q_ent_67",
    "level": 1,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "ما اسم البطلين اللذين جسدت قصتهما المأساوية شهرة مسلسل «سنوات الضياع» في العالم العربي؟",
    "questionEn": "What were the Arabic dubbed names of the main tragic lovers played by Bülent İnal and Tuba Büyüküstün in \"Ihlamurlar Altında\"?",
    "optionsAr": [
      "كمال ونيهان",
      "يحيى ولميس",
      "سمر وبهلول",
      "أمير وعاصي"
    ],
    "optionsEn": [
      "Kemal & Nihan",
      "Yehia and Lamis",
      "Bihter & Behlül",
      "Amir & Asi"
    ],
    "correctIndex": 1,
    "explanationAr": "حقق بولنت إينال (يحيى) وتوبا بويوكوستون (لميس) شعبية جارفة عبر مسلسل «سنوات الضياع».",
    "explanationEn": "Bülent İnal (Yehia) and Tuba Büyüküstün (Lamis) captivated millions across the Middle East."
  },
  {
    "id": "q_ent_68",
    "level": 2,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "ما اسم الشخصية التي جسدها نجاتي شاشماز في سلسلة الأكشن التركية الطويلة «وادي الذئاب»؟",
    "questionEn": "What is the famous name of the intelligence hero played by Necati Şaşmaz in \"Valley of the Wolves\" (Kurtlar Vadisi)?",
    "optionsAr": [
      "ياماش كوشوفالي",
      "عمر أوتشار",
      "مراد علمدار (بولات علمدار)",
      "بويراز كارايل"
    ],
    "optionsEn": [
      "Yamaç Koçovalı",
      "Ömer Uçar",
      "Polat Alemdar (Murad Alemdar)",
      "Poyraz Karayel"
    ],
    "correctIndex": 2,
    "explanationAr": "أدى نجاتي شاشماز دور العميل بولات علمدار (مراد علمدار بالدبلجة العربية) لعشرة مواسم متواصلة.",
    "explanationEn": "Necati Şaşmaz starred as Polat Alemdar (Murad Alemdar in Arabic) across the iconic Turkish action saga."
  },
  {
    "id": "q_ent_69",
    "level": 2,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "من أدت دور «سمر» (بيهتار) في المسلسل الرومانسي التركي «العشق الممنوع»؟",
    "questionEn": "Which actress portrayed \"Bihter Ziyagil\" (Samar) in the celebrated Turkish drama \"Forbidden Love\" (Aşk-ı Memnu)?",
    "optionsAr": [
      "هازال كايا",
      "توبا بويوكوستون",
      "مريم أوزيرلي",
      "بيرين سات"
    ],
    "optionsEn": [
      "Hazal Kaya",
      "Tuba Büyüküstün",
      "Meryem Uzerli",
      "Beren Saat"
    ],
    "correctIndex": 3,
    "explanationAr": "شاركت بيرين سات بدور سمر أمام كيفانش تاتليتوغ (بهلول) وسلجوق يونتام (عدنان بك) وهازال كايا (نهال).",
    "explanationEn": "Beren Saat starred as Bihter opposite Kıvanç Tatlıtuğ (Behlül) and Hazal Kaya (Nihal)."
  },
  {
    "id": "q_ent_70",
    "level": 1,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "من قام ببطولة دور السلطان العثماني سليمان القانوني في المسلسل التاريخي «حريم السلطان»؟",
    "questionEn": "Which Turkish actor starred as Sultan Suleiman the Magnificent in \"Muhteşem Yüzyıl\" (Hareem Al Sultan)?",
    "optionsAr": [
      "خالد أرغنتش",
      "بوراك أوزجيفيت",
      "أوكان يالابيك",
      "إنجين ألتان"
    ],
    "optionsEn": [
      "Halit Ergenç",
      "Burak Özçivit",
      "Okan Yalabık",
      "Engin Altan Düzyatan"
    ],
    "correctIndex": 0,
    "explanationAr": "جسد خالد أرغنتش دور السلطان سليمان القانوني أمام مريم أوزيرلي (السلطانة هيام).",
    "explanationEn": "Halit Ergenç played Sultan Suleiman alongside Meryem Uzerli as Hürrem Sultan."
  },
  {
    "id": "q_ent_71",
    "level": 2,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "ما اسم البطل الذي أدى دور «أرطغرل بن سليمان شاه» على مدار 5 مواسم في مسلسل «قيامة أرطغرل»؟",
    "questionEn": "Who starred in the title role of Ertuğrul Gazi for all five seasons of \"Diriliş: Ertuğrul\"?",
    "optionsAr": [
      "بوراك أوزجيفيت",
      "إنجين أكيوريك",
      "جنكيز جوشكون",
      "إنجين ألتان دوزياتان"
    ],
    "optionsEn": [
      "Burak Özçivit",
      "Engin Akyürek",
      "Cengiz Coşkun",
      "Engin Altan Düzyatan"
    ],
    "correctIndex": 3,
    "explanationAr": "حقق إنجين ألتان دوزياتان شهرة عالمية بدور الغازي أرطغرل أمام إسراء بيلغيتش (حليمة خاتون) وجنكيز جوشكون (تورغوت ألب).",
    "explanationEn": "Engin Altan Düzyatan became an international star playing Ertuğrul Gazi opposite Esra Bilgiç (Halime Hatun)."
  },
  {
    "id": "q_ent_72",
    "level": 1,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "من يؤدي دور البطل «عثمان بن أرطغرل» مؤسس الدولة العثمانية في مسلسل «المؤسس عثمان»؟",
    "questionEn": "Which Turkish actor plays Osman Bey in the hit historical drama \"Kuruluş: Osman\"?",
    "optionsAr": [
      "بوراك أوزجيفيت",
      "جان يامان",
      "كيفانش تاتليتوغ",
      "أراس بولوت إينيملي"
    ],
    "optionsEn": [
      "Burak Özçivit",
      "Can Yaman",
      "Kıvanç Tatlıtuğ",
      "Aras Bulut İynemli"
    ],
    "correctIndex": 0,
    "explanationAr": "يتولى بوراك أوزجيفيت بطولة مسلسل «المؤسس عثمان» المكمل لملحمة «قيامة أرطغرل» منذ عام 2019.",
    "explanationEn": "Burak Özçivit stars as Osman Bey, son of Ertuğrul, in the sequel series \"Kuruluş: Osman\"."
  },
  {
    "id": "q_ent_73",
    "level": 2,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "ما اسم حي «عائلة كوشوفالي» الذي يدافع عنه ياماش وأشقاؤه في مسلسل «الحفرة» (Çukur)؟",
    "questionEn": "Who starred as \"Yamaç Koçovalı\", the youngest son returning to lead his family’s neighborhood in \"Çukur\" (The Pit)?",
    "optionsAr": [
      "نجيب ميملي",
      "أونور صايلاك",
      "أركان كولتشاك كوستنديل",
      "أراس بولوت إينيملي"
    ],
    "optionsEn": [
      "Necip Memili",
      "Onur Saylak",
      "Erkan Kolçak Köstendil",
      "Aras Bulut İynemli"
    ],
    "correctIndex": 3,
    "explanationAr": "تألق أراس بولوت إينيملي في دور ياماش كوشوفالي وأركان كولتشاك في دور فارتولو سعد الدين بمسلسل «الحفرة».",
    "explanationEn": "Aras Bulut İynemli led the acclaimed crime series \"Çukur\" as Yamaç alongside Erkan Kolçak Köstendil as Vartolu."
  },
  {
    "id": "q_ent_74",
    "level": 2,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "من أدت دور «نيهان سيزين» أمام بوراك أوزجيفيت (كمال) في مسلسل «حب أعمى» الحائز على جائزة إيمي؟",
    "questionEn": "Which actress starred as \"Nihan Sezin\" opposite Burak Özçivit (Kemal) in the International Emmy-winning series \"Kara Sevda\" (Endless Love)?",
    "optionsAr": [
      "فهرية أفجين",
      "هاندا أرتشيل",
      "نسليهان أتاغول",
      "أوزغي غوريل"
    ],
    "optionsEn": [
      "Fahriye Evcen",
      "Hande Erçel",
      "Neslihan Atagül",
      "Özge Gürel"
    ],
    "correctIndex": 2,
    "explanationAr": "جمع «حب أعمى» (2015-2017) بين كمال (بوراك أوزجيفيت) ونيهان (نسليهان أتاغول) والشرير أمير (كان أورغانجي أوغلو).",
    "explanationEn": "Neslihan Atagül played Nihan alongside Burak Özçivit as Kemal and Kaan Urgancıoğlu as Emir."
  },
  {
    "id": "q_ent_75",
    "level": 2,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "ما اسم الممثلين اللذين قدما الثنائي الكوميدي الرومانسي «سيركان بولات» و«إيدا يلديز» في مسلسل «أنت اطرق بابي»؟",
    "questionEn": "Which two actors starred as \"Serkan Bolat\" and \"Eda Yıldız\" in the global romantic comedy \"Sen Çal Kapımı\" (Love Is in the Air)?",
    "optionsAr": [
      "كرم بورسين وهاندا أرتشيل",
      "ألب نافروز وألينا بوز",
      "جان يامان وديميت أوزديمير",
      "باريش أردوتش وإلتشين سانغو"
    ],
    "optionsEn": [
      "Kerem Bürsin and Hande Erçel",
      "Alp Navruz & Alina Boz",
      "Can Yaman & Demet Özdemir",
      "Barış Arduç & Elçin Sangu"
    ],
    "correctIndex": 0,
    "explanationAr": "حقق كرم بورسين (المهندس المعماري سيركان) وهاندا أرتشيل (إيدا بائعة الزهور) نجاحاً عالمياً ضخماً.",
    "explanationEn": "Kerem Bürsin (architect Serkan Bolat) and Hande Erçel (florist Eda Yıldız) gained massive global viewership."
  },
  {
    "id": "q_ent_76",
    "level": 2,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "ما لقب المصور المغامر «جان ديفيت» الذي جسده جان يامان أمام ديميت أوزديمير (سنام) في «الطائر المبكر»؟",
    "questionEn": "Which actress starred as daydreaming aspiring writer \"Sanem Aydın\" opposite Can Yaman in \"Erkenci Kuş\" (Daydreamer)?",
    "optionsAr": [
      "ديلان تشيتشك دينيز",
      "بينار دينيز",
      "بورجو أوزبيرك",
      "ديميت أوزديمير"
    ],
    "optionsEn": [
      "Dilan Çiçek Deniz",
      "Pınar Deniz",
      "Burcu Özberk",
      "Demet Özdemir"
    ],
    "correctIndex": 3,
    "explanationAr": "نالت ديميت أوزديمير وجان يامان جوائز الفراشة الذهبية عن دوريهما سنام وجان في «الطائر المبكر».",
    "explanationEn": "Demet Özdemir won the Golden Butterfly Award for her lively role as Sanem opposite Can Yaman."
  },
  {
    "id": "q_ent_77",
    "level": 3,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "من قام ببطولة مسلسل التشويق والانتقام التركي الشهير «إيزيل» بشخصية عمر الذي غير ملامحه؟",
    "questionEn": "Who starred as betrayed friend-turned-mastermind \"Ezel Bayraktar\" in the hit thriller series \"Ezel\"?",
    "optionsAr": [
      "إنجين أكيوريك",
      "شتاي أولوسوي",
      "خالد أرغنتش",
      "كينان إميرزالي أوغلو"
    ],
    "optionsEn": [
      "Engin Akyürek",
      "Çağatay Ulusoy",
      "Halit Ergenç",
      "Kenan İmirzalıoğlu"
    ],
    "correctIndex": 3,
    "explanationAr": "جسد كينان إميرزالي أوغلو دور إيزيل أمام جانسو ديري (عيشان) ويغيت أوزشنير (جنكيز) وتونجل كورتيز (الخال رامز).",
    "explanationEn": "Kenan İmirzalıoğlu played Ezel opposite Cansu Dere (Eyşan) and Tuncel Kurtiz (Uncle Ramiz)."
  },
  {
    "id": "q_ent_78",
    "level": 3,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "ما اسم الزوج المخلص الذي وقف بجانب «فاطمة» (بيرين سات) في محنتها بمسلسل «ما ذنب فاطمة غول»؟",
    "questionEn": "Which actor co-starred as \"Kerim Ilgaz\" opposite Beren Saat in the acclaimed drama \"Fatmagül\"?",
    "optionsAr": [
      "أركان بيتيكايا",
      "إنجين أكيوريك",
      "مراد يلدريم",
      "كيفانش تاتليتوغ"
    ],
    "optionsEn": [
      "Erkan Petekkaya",
      "Engin Akyürek",
      "Murat Yıldırım",
      "Kıvanç Tatlıtuğ"
    ],
    "correctIndex": 1,
    "explanationAr": "أبدع إنجين أكيوريك في دور كريم الغاز الذي تحول زواجه المضطر إلى حب صادق ودعم لقضية فاطمة.",
    "explanationEn": "Engin Akyürek played Kerim Ilgaz, becoming one of Turkey’s most beloved dramatic leading men."
  },
  {
    "id": "q_ent_79",
    "level": 3,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "في مسلسل «حب للإيجار»، من جسدا شخصيتي «عمر إبليكتشي» مصمم الأحذية و«دفنة توبال»؟",
    "questionEn": "Who played perfectionist shoe designer \"Ömer İplikçi\" and waitress \"Defne Topal\" in \"Kiralık Aşk\" (Love for Rent)?",
    "optionsAr": [
      "تولغا ساريتاش وآيبوكي بوسات",
      "فوركان بالالي ودميت أوزديمير",
      "باريش أردوتش وإلتشين سانغو",
      "سيركان شاي أوغلو وأوزغي غوريل"
    ],
    "optionsEn": [
      "Tolga Sarıtaş & Aybüke Pusat",
      "Furkan Palalı & Demet Özdemir",
      "Barış Arduç and Elçin Sangu",
      "Serkan Çayoğlu & Özge Gürel"
    ],
    "correctIndex": 2,
    "explanationAr": "أصبح باريش أردوتش وإلتشين سانغو أحد أنجح الثنائيات الرومانسية التركية في «حب للإيجار».",
    "explanationEn": "Barış Arduç (Ömer) and Elçin Sangu (Defne) formed one of Turkish rom-com television’s most iconic couples."
  },
  {
    "id": "q_ent_80",
    "level": 3,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "ما اسم الطبيب الشاب المصاب بالتوحد ومتلازمة الموهوب الذي جسده «تانير أولماز» في مسلسل «الطبيب المعجزة»؟",
    "questionEn": "What is the name of the autistic savant surgical resident played by Taner Ölmez in \"Mucize Doktor\" (The Miracle Doctor)?",
    "optionsAr": [
      "الدكتور كمال سويديري",
      "الدكتور علي وفاء",
      "الدكتور عمر أوتشار",
      "الدكتور سليم بولات"
    ],
    "optionsEn": [
      "Dr. Kemal Soydere",
      "Dr. Ali Vefa",
      "Dr. Ömer Uçar",
      "Dr. Selim Bolat"
    ],
    "correctIndex": 1,
    "explanationAr": "نجح تانير أولماز بتجسيد شخصية الدكتور علي وفاء بمهارة إنسانية عالية أمام أونور تونا (الدكتور فرمان).",
    "explanationEn": "Taner Ölmez portrayed surgical genius Dr. Ali Vefa alongside Onur Tuna as Chief Surgeon Dr. Ferman."
  },
  {
    "id": "q_ent_81",
    "level": 3,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "في مسلسل «زهرة الثالوث» (Hercai) المصوّر في ماردين، ما اسما البطلين الرئيسيين؟",
    "questionEn": "What are the character names played by Akın Akınözü and Ebru Şahin in the Mardin-set drama \"Hercai\"?",
    "optionsAr": [
      "ميران أصلانباي وريان شاد أوغلو",
      "طاهر ونفس",
      "سنجار وناري",
      "فريد وسيران"
    ],
    "optionsEn": [
      "Miran Aslanbey and Reyyan Şadoğlu",
      "Tahir & Nefes",
      "Sancar & Nare",
      "Ferit & Seyran"
    ],
    "correctIndex": 0,
    "explanationAr": "دارت قصة الانتقام والحب المستحيل بين ميران (أكين أكينوزو) وريان (إيبرو شاهين) وسط جبال ماردين.",
    "explanationEn": "Akın Akınözü (Miran) and Ebru Şahin (Reyyan) led three seasons of \"Hercai\" filmed in historic Midyat, Mardin."
  },
  {
    "id": "q_ent_82",
    "level": 3,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "ما اسم البطلين في مسلسل «الطائر الرفراف» (Yalı Çapkını) اللذين تزوجا قسراً في قصر عائلة كورهان؟",
    "questionEn": "Who play the troubled young spouses \"Ferit Korhan\" and \"Seyran Şanlı\" in the hit drama \"Yalı Çapkını\" (Golden Boy)?",
    "optionsAr": [
      "شتاي أولوسوي وسيريناي ساريكايا",
      "ميرت رمضان ديمير وعفراء ساراتش أوغلو",
      "إبراهيم تشيليكول وبيرجي أكالاي",
      "كرم بورسين وهاندا أرتشيل"
    ],
    "optionsEn": [
      "Çağatay Ulusoy & Serenay Sarıkaya",
      "Mert Ramazan Demir and Afra Saraçoğlu",
      "İbrahim Çelikkol & Birce Akalay",
      "Kerem Bürsin & Hande Erçel"
    ],
    "correctIndex": 1,
    "explanationAr": "أدى ميرت رمضان ديمير وعفراء ساراتش أوغلو دوري فريد وسيران في واحد من أعلى المسلسلات التركية مشاهدة.",
    "explanationEn": "Mert Ramazan Demir (Ferit) and Afra Saraçoğlu (Seyran) starred in the ratings juggernaut \"Yalı Çapkını\"."
  },
  {
    "id": "q_ent_83",
    "level": 3,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "ما اسم المسلسل الذي جسد فيه «شتاي أولوسوي» الشاب الفقير يامان كوبر أمام سيريناي ساريكايا (ميرا)؟",
    "questionEn": "Which hit Turkish youth drama starred Çağatay Ulusoy as \"Yaman Koper\" and Serenay Sarıkaya as \"Mira Beylice\"?",
    "optionsAr": [
      "أسميتها فريحة",
      "في الداخل (İçerde)",
      "المد والجزر (Medcezir)",
      "الحفرة"
    ],
    "optionsEn": [
      "Adını Feriha Koydum",
      "İçerde",
      "Medcezir (Ebb and Tide)",
      "Çukur"
    ],
    "correctIndex": 2,
    "explanationAr": "حقق «المد والجزر» (2013-2015) نجاحاً ضخماً لشتاي أولوسوي وسيريناي ساريكايا وباريش فالاي.",
    "explanationEn": "Inspired by \"The O.C.\", \"Medcezir\" launched Çağatay Ulusoy and Serenay Sarıkaya to mega-stardom."
  },
  {
    "id": "q_ent_84",
    "level": 3,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "من جسد دورَي الشقيقين الضائعين «صرب» و«أوموت/مارت» في مسلسل الإثارة البوليسي «في الداخل» (İçerde)؟",
    "questionEn": "Who played the two long-lost brothers working as undercover moles against each other in \"İçerde\" (Insider)?",
    "optionsAr": [
      "جان يامان وكرم بورسين",
      "كيفانش تاتليتوغ وبوراك دنيز",
      "شتاي أولوسوي وأراس بولوت إينيملي",
      "إبراهيم تشيليكول وتولغا ساريتاش"
    ],
    "optionsEn": [
      "Can Yaman & Kerem Bürsin",
      "Kıvanç Tatlıtuğ & Burak Deniz",
      "Çağatay Ulusoy and Aras Bulut İynemli",
      "İbrahim Çelikkol & Tolga Sarıtaş"
    ],
    "correctIndex": 2,
    "explanationAr": "تألق شتاي أولوسوي (صرب) وأراس بولوت إينيملي (مارت) أمام جيتين تيكيندور (جلال بابا) في «في الداخل».",
    "explanationEn": "Çağatay Ulusoy (Sarp) and Aras Bulut İynemli (Mert) delivered powerhouse performances opposite Çetin Tekindor."
  },
  {
    "id": "q_ent_85",
    "level": 3,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "في أي مدينة تركية جنوبية تدور أحداث مسلسل «عاصي» (Asi) من بطولة توبا بويوكوستون ومراد يلدريم؟",
    "questionEn": "Which southern Turkish province/city is the scenic backdrop for \"Asi\" starring Tuba Büyüküstün and Murat Yıldırım?",
    "optionsAr": [
      "بودروم",
      "أنطاكيا (هاتاي)",
      "طرابزون",
      "إسطنبول"
    ],
    "optionsEn": [
      "Bodrum",
      "Antakya (Hatay)",
      "Trabzon",
      "Istanbul"
    ],
    "correctIndex": 1,
    "explanationAr": "استمد المسلسل اسمه من نهر العاصي الذي يعبر مدينة أنطاكيا حيث التقت عاصي كوزجو أوغلو بأمير دوغان.",
    "explanationEn": "Named after the Orontes (Asi) River flowing through Antakya, the series starred Tuba Büyüküstün as Asi and Murat Yıldırım as Demir."
  },
  {
    "id": "q_ent_86",
    "level": 4,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "في مسلسل «ابنة السفير» (Sefirin Kızı)، من جسد دور «سنجار إيفه أوغلو» أمام نسليهان أتاغول ثم توبا بويوكوستون؟",
    "questionEn": "Who starred as \"Sancar Efeoğlu\" in the dramatic romance \"The Ambassador’s Daughter\" (Sefirin Kızı)?",
    "optionsAr": [
      "أوراز كايغيلار أوغلو",
      "إنجين أكيوريك",
      "أونور تونا",
      "مراد يلدريم"
    ],
    "optionsEn": [
      "Uraz Kaygılaroğlu",
      "Engin Akyürek",
      "Onur Tuna",
      "Murat Yıldırım"
    ],
    "correctIndex": 1,
    "explanationAr": "أدى إنجين أكيوريك دور سنجار إيفه أمام نسليهان أتاغول (ناري) ثم توبا بويوكوستون (مافي) في موغلا.",
    "explanationEn": "Engin Akyürek portrayed proud Efe Sancar in the coastal province of Muğla."
  },
  {
    "id": "q_ent_87",
    "level": 4,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "ما اسم المسلسل الحائز على جائزة إيمي الدولية لعام 2023 وبطلاه «إيلغاز كايا» وكبيرة المحامين «جيلين إيرغوفان»؟",
    "questionEn": "What is the title of the 2023 International Emmy-winning Turkish legal thriller starring Kaan Urgancıoğlu (Ilgaz) and Pınar Deniz (Ceylin)?",
    "optionsAr": [
      "البروفيسور",
      "بويراز كارايل",
      "القضاء (Yargı)",
      "الخائن"
    ],
    "optionsEn": [
      "Kırmızı Oda",
      "Poyraz Karayel",
      "Yargı (Family Secrets / Judgment)",
      "Sadakatsiz"
    ],
    "correctIndex": 2,
    "explanationAr": "حصد مسلسل «القضاء» جائزة إيمي لأفضل تيلينوفيلا عام 2023 ببطولة كان أورغانجي أوغلو وبينار دينيز.",
    "explanationEn": "Created by Sema Ergenekon, \"Yargı\" won the 2023 International Emmy for prosecutor Ilgaz and lawyer Ceylin’s story."
  },
  {
    "id": "q_ent_88",
    "level": 4,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "في مسلسل «إخوتي» (Kardeşlerim)، كم شقيقاً فقدوا والديهم في الحلقة الأولى وبدأوا كفاح البقاء معاً؟",
    "questionEn": "How many Eren siblings lose both parents early and struggle to stay together in the drama \"Kardeşlerim\" (For My Family)?",
    "optionsAr": [
      "أربعة إخوة (قدير، عمر، آسيا، أمل)",
      "ثلاثة إخوة",
      "خمسة إخوة",
      "شقيقان فقط"
    ],
    "optionsEn": [
      "Four siblings (Kadir, Ömer, Asiye, and Emel)",
      "Three siblings",
      "Five siblings",
      "Two siblings only"
    ],
    "correctIndex": 0,
    "explanationAr": "تناولت القصة كفاح الأشقاء الأربعة قدير وعمر وآسيا والصغيرة أمل في إسطنبول.",
    "explanationEn": "The series chronicles the hardships and unbreakable bond of the four Eren siblings in Istanbul."
  },
  {
    "id": "q_ent_89",
    "level": 3,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "ما اسم الشرطي السابق الذي يعمل سائق تاكسي ويتسلل إلى عصابة المافيا من أجل استعادة ابنه سنان في «بويراز كارايل»؟",
    "questionEn": "Who played ex-cop turned undercover cabbie \"Poyraz Karayel\" alongside Burçin Terzioğlu (Ayşegül)?",
    "optionsAr": [
      "مورات يلدريم",
      "إبراهيم تشيليكول",
      "أراس بولوت إينيملي",
      "إيلكر كاليلي"
    ],
    "optionsEn": [
      "Murat Yıldırım",
      "İbrahim Çelikkol",
      "Aras Bulut İynemli",
      "İlker Kaleli"
    ],
    "correctIndex": 3,
    "explanationAr": "نال إيلكر كاليلي جائزة الفراشة الذهبية عن شخصية بويراز كارايل أمام بورتشين ترزي أوغلو وموسى أوزونلار (بحري بابا).",
    "explanationEn": "İlker Kaleli won critical acclaim for his witty and heartbreaking lead turn as Poyraz Karayel."
  },
  {
    "id": "q_ent_90",
    "level": 4,
    "category": "cinema",
    "topic": "turkish_series",
    "questionAr": "في مسلسل «بنات الشمس» (Güneşin Kızları)، من لعبتا دوري التوأم الشقيقتين «سيلين» و«نازلي»؟",
    "questionEn": "Which two actresses played twin sisters \"Selin\" and \"Nazlı\" in \"Güneşin Kızları\" (Daughters of Sun)?",
    "optionsAr": [
      "هاندا أرتشيل وبورجو أوزبيرك",
      "دميت أوزديمير وإلتشين سانغو",
      "نسليهان أتاغول وهازال كايا",
      "عفراء ساراتش أوغلو وألينا بوز"
    ],
    "optionsEn": [
      "Hande Erçel and Burcu Özberk",
      "Demet Özdemir & Elçin Sangu",
      "Neslihan Atagül & Hazal Kaya",
      "Afra Saraçoğlu & Alina Boz"
    ],
    "correctIndex": 0,
    "explanationAr": "أطلق مسلسل «بنات الشمس» (2015) نجومية هاندا أرتشيل (سيلين) وبورجو أوزبيرك (نازلي) وتولغا ساريتاش (علي).",
    "explanationEn": "The 2015 hit launched the careers of Hande Erçel (Selin) and Burcu Özberk (Nazlı) alongside Tolga Sarıtaş."
  },
  {
    "id": "q_ent_91",
    "level": 1,
    "category": "cinema",
    "topic": "turkish_movies",
    "questionAr": "ما اسم الأب الطيب ذو الإعاقة الذهنية الذي سُجن ظلماً في الفيلم التركي المؤثر «معجزة في الزنزانة 7»؟",
    "questionEn": "What is the name of the loving father with an intellectual disability played by Aras Bulut İynemli in \"Miracle in Cell No. 7\"?",
    "optionsAr": [
      "سنجار",
      "ميمو (محمد كويونجو)",
      "كرم",
      "ياماش"
    ],
    "optionsEn": [
      "Sancar",
      "Memo (Mehmet Koyuncu)",
      "Kerem",
      "Yamaç"
    ],
    "correctIndex": 1,
    "explanationAr": "حصد أراس بولوت إينيملي والطفلة نيسا صوفيا أكسونغور (أوفا) إعجاباً عالمياً بالنسخة التركية من الفيلم عام 2019.",
    "explanationEn": "Aras Bulut İynemli as Memo and Nisa Sofiya Aksongur as his daughter Ova moved audiences worldwide in 2019."
  },
  {
    "id": "q_ent_92",
    "level": 2,
    "category": "cinema",
    "topic": "turkish_movies",
    "questionAr": "في الفيلم التركي الشهير «معجزة في الزنزانة 7»، ما الجملة الخاصة التي يتبادلها ميمو وابنته الصغيرة أوفا تعبيراً عن الحب؟",
    "questionEn": "What heartfelt exchange phrase do Memo and his daughter Ova share in \"Miracle in Cell No. 7\"?",
    "optionsAr": [
      "لينجو لينجو — زجاجات (أشعر بك)",
      "افتح يا سمسم",
      "يا طائر البحر الأسود",
      "أهلاً بأبي الحبيب"
    ],
    "optionsEn": [
      "Lingo lingo — bottles!",
      "Open Sesame",
      "Fly Black Sea bird",
      "Welcome dear father"
    ],
    "correctIndex": 0,
    "explanationAr": "ارتبطت عبارة «لينجو لينجو» و«شيشلير» (زجاجات) بأحد أكثر المشاهد تأثيراً في السينما التركية الحديثة.",
    "explanationEn": "Memo and Ova’s signature \"Lingo lingo... şişeler!\" call-and-response became the emotional heartbeat of the film."
  },
  {
    "id": "q_ent_93",
    "level": 3,
    "category": "cinema",
    "topic": "turkish_movies",
    "questionAr": "عن أي حرب دارت القصة الحقيقية للفيلم التركي «أيلا: ابنة الحرب» الذي يتبنى فيه الجندي سليمان طفلة يتيمة؟",
    "questionEn": "During which war does Turkish sergeant Süleyman rescue and care for a little orphan girl in the true-story film \"Ayla: The Daughter of War\"?",
    "optionsAr": [
      "حرب تحرير إزمير",
      "حرب البلقان",
      "الحرب العالمية الأولى",
      "الحرب الكورية (1950)"
    ],
    "optionsEn": [
      "Turkish War of Independence",
      "The Balkan Wars",
      "World War I",
      "The Korean War (1950)"
    ],
    "correctIndex": 3,
    "explanationAr": "تستند قصة فيلم «أيلا» (2017) إلى الواقعة الحقيقية للرقيب التركي سليمان ديلبيرليجي الذي أنقذ طفلة كورية عام 1950.",
    "explanationEn": "\"Ayla\" dramatizes the real 1950 story of Turkish soldier Süleyman Dilbirliği and Korean orphan Kim Eun-ja."
  },
  {
    "id": "q_ent_94",
    "level": 3,
    "category": "cinema",
    "topic": "turkish_movies",
    "questionAr": "ما اسم الفيلم التركي الكلاسيكي الشهير من إخراج شاغان إرماك الذي يروي عودة صحفي مريض مع ابنه الصغير دنيز إلى مزرعة جده؟",
    "questionEn": "What is the title of Çağan Irmak’s beloved 2005 Turkish tearjerker about a dying journalist returning to his estranged father’s farm with young Deniz?",
    "optionsAr": [
      "حلم الفراشة",
      "وقت السعادة",
      "أبي وابني (Babam ve Oğlum)",
      "سبات شتوي"
    ],
    "optionsEn": [
      "The Butterfly’s Dream",
      "Time of Happiness",
      "My Father and My Son (Babam ve Oğlum)",
      "Winter Sleep"
    ],
    "correctIndex": 2,
    "explanationAr": "شارك جيتين تيكيندور وفكرت كوشكان والطفل إيجه تانمان في «أبي وابني» الذي يُعد من أيقونات السينما التركية.",
    "explanationEn": "Starring Çetin Tekindor and Fikret Kuşkan, \"Babam ve Oğlum\" remains one of Turkey’s most cherished dramas."
  },
  {
    "id": "q_ent_95",
    "level": 4,
    "category": "cinema",
    "topic": "turkish_movies",
    "questionAr": "ما اسم الفيلم التركي الحائز على جائزة السعفة الذهبية في مهرجان كان عام 2014 للمخرج نوري بيلجي جيلان؟",
    "questionEn": "Which Turkish film directed by Nuri Bilge Ceylan won the Palme d’Or at the 2014 Cannes Film Festival?",
    "optionsAr": [
      "بعيد (Uzak)",
      "حدث ذات مرة في الأناضول",
      "شجرة الكمثرى البرية",
      "سبات شتوي (Winter Sleep)"
    ],
    "optionsEn": [
      "Distant (Uzak)",
      "Once Upon a Time in Anatolia",
      "The Wild Pear Tree",
      "Winter Sleep (Kış Uykusu)"
    ],
    "correctIndex": 3,
    "explanationAr": "نال فيلم «سبات شتوي» بطولة هالوك بيلغينر (أيدين) وديميت أكباغ السعفة الذهبية في كان 2014.",
    "explanationEn": "Starring Haluk Bilginer as former actor Aydın running a hotel in Cappadocia, \"Winter Sleep\" won the 2014 Palme d’Or."
  },
  {
    "id": "q_ent_96",
    "level": 3,
    "category": "cinema",
    "topic": "turkish_movies",
    "questionAr": "في فيلم «وقت السعادة» (Mutluluk Zamanı)، من اجتمع مجدداً في البطولة الرومانسية بعد نجاحهما في مسلسل «حب للإيجار»؟",
    "questionEn": "Which famous TV romance pair reunited on the big screen for the 2017 comedy \"Time of Happiness\" (Mutluluk Zamanı)?",
    "optionsAr": [
      "كيفانش تاتليتوغ وبيرين سات",
      "كرم بورسين وهاندا أرتشيل",
      "بوراك أوزجيفيت وفهرية أفجين",
      "باريش أردوتش وإلتشين سانغو"
    ],
    "optionsEn": [
      "Kıvanç Tatlıtuğ & Beren Saat",
      "Kerem Bürsin & Hande Erçel",
      "Burak Özçivit & Fahriye Evcen",
      "Barış Arduç and Elçin Sangu"
    ],
    "correctIndex": 3,
    "explanationAr": "بعد نجاحهما التاريخي في «حب للإيجار»، قدم باريش أردوتش (مرت) وإلتشين سانغو (أدا) فيلم «وقت السعادة».",
    "explanationEn": "Following \"Kiralık Aşk\", Barış Arduç and Elçin Sangu co-starred as Mert and Ada in \"Mutluluk Zamanı\"."
  },
  {
    "id": "q_ent_97",
    "level": 4,
    "category": "cinema",
    "topic": "turkish_movies",
    "questionAr": "ما دور كيفانش تاتليتوغ وميرت فرات في الفيلم التاريخي الرومانسي التركي «حلم الفراشة» (Kelebeğin Rüyası)؟",
    "questionEn": "In the 2013 period drama \"The Butterfly’s Dream\", what are the protagonists played by Kıvanç Tatlıtuğ and Mert Fırat?",
    "optionsAr": [
      "شاعران شابان في زونغولداق يكتبان الشعر رغم مرض السل",
      "ملازمان في البحرية العثمانية",
      "عازفا بيانو في أنقرة",
      "طياران حربيان في إسطنبول"
    ],
    "optionsEn": [
      "Two young poets in 1940s Zonguldak writing poetry while battling tuberculosis",
      "Two Ottoman navy officers",
      "Two concert pianists in Ankara",
      "Two fighter pilots in Istanbul"
    ],
    "correctIndex": 0,
    "explanationAr": "أخرج يلماز أردوغان فيلم «حلم الفراشة» المستوحى من القصة الحقيقية للشاعرين التركيين رشدي أونور ومظفر طيب أوسلو.",
    "explanationEn": "Directed by Yılmaz Erdoğan, it dramatizes real-life 1940s poets Rüştü Onur and Muzaffer Tayyip Uslu."
  },
  {
    "id": "q_ent_98",
    "level": 3,
    "category": "cinema",
    "topic": "turkish_movies",
    "questionAr": "في الفيلم التركي الرومانسي «ديلوبال» (Delibal)، ماذا كانت موهبة البطل «باريش» الذي جسده شاتاي أولوسوي؟",
    "questionEn": "In the 2015 Turkish romance \"Delibal\", what artistic passion did Çağatay Ulusoy’s character Barış pursue alongside architecture?",
    "optionsAr": [
      "رسم اللوحات الزيتية",
      "نحت التماثيل الرخامية",
      "عزف الطبول والموسيقى في فرقة",
      "التمثيل المسرحي الصامت"
    ],
    "optionsEn": [
      "Oil painting",
      "Marble sculpting",
      "Playing drums in a music band",
      "Mime theater"
    ],
    "correctIndex": 2,
    "explanationAr": "جسد شاتاي أولوسوي دور طالب الهندسة المعمارية وعازف الدرامز باريش أمام ليلى ليديا توغوتلو (فوسون).",
    "explanationEn": "Çağatay Ulusoy played passionate drummer and architecture student Barış opposite Leyla Lydia Tuğutlu."
  },
  {
    "id": "q_ent_99",
    "level": 4,
    "category": "cinema",
    "topic": "turkish_movies",
    "questionAr": "في الفيلم التركي الشهير «المعجزة» (Mucize - 2015)، ما اسم المعلم الذي انتقل للتدريس في قرية جبلية نائية بشرق الأناضول؟",
    "questionEn": "In Mahsun Kırmızıgül’s hit drama \"The Miracle\" (Mucize), who arrives in a remote 1960s mountain village to build a school?",
    "optionsAr": [
      "القبطان فكرت",
      "المعلم ماهر (طالبان بولاك)",
      "الشيخ رامز",
      "المفوض يحيى"
    ],
    "optionsEn": [
      "Captain Fikret",
      "Teacher Mahir",
      "Uncle Ramiz",
      "Inspector Yahya"
    ],
    "correctIndex": 1,
    "explanationAr": "ساند المعلم ماهر الشاب عزيز المصاب بإعاقة في قريته النائية حتى تغيرت حياتهما بالكامل في فيلم «المعجزة».",
    "explanationEn": "Teacher Mahir changes the lives of the village children and disabled young Aziz in the 2015 film."
  },
  {
    "id": "q_ent_100",
    "level": 5,
    "category": "cinema",
    "topic": "turkish_movies",
    "questionAr": "أي فيلم تركي للمخرج سميح كابلان أوغلو فاز بجائزة الدب الذهبي في مهرجان برلين 2010 وحكى عن فتى يبحث عن أبيه النحال؟",
    "questionEn": "Which Turkish drama directed by Semih Kaplanoğlu won the Golden Bear at the 2010 Berlin Film Festival following a beekeeper’s young son?",
    "optionsAr": [
      "عسل (Bal)",
      "بيضة (Yumurta)",
      "الأب",
      "حليب (Süt)"
    ],
    "optionsEn": [
      "Honey (Bal)",
      "Egg (Yumurta)",
      "Babam",
      "Milk (Süt)"
    ],
    "correctIndex": 0,
    "explanationAr": "حصد فيلم «عسل» الجزء الختامي من ثلاثية يوسف للمخرج سميح كابلان أوغلو الدب الذهبي في برلين.",
    "explanationEn": "The final chapter of Semih Kaplanoğlu’s Yusuf Trilogy, \"Bal\" (Honey) won Berlin’s Golden Bear in 2010."
  }
];

export const QUESTIONS_BANK: Question[] = [
  ...Q_CHUNK_0,
  ...Q_CHUNK_1,
  ...Q_CHUNK_2
];

export const getRandomQuestionByLevel = (level: number, excludeIds: string[] = []): Question => {
  const exactPool = QUESTIONS_BANK.filter((q) => q.level === level && !excludeIds.includes(q.id));
  if (exactPool.length > 0) {
    return exactPool[Math.floor(Math.random() * exactPool.length)];
  }
  const nearPool = QUESTIONS_BANK.filter((q) => Math.abs(q.level - level) <= 2 && !excludeIds.includes(q.id));
  if (nearPool.length > 0) {
    return nearPool[Math.floor(Math.random() * nearPool.length)];
  }
  const remainingPool = QUESTIONS_BANK.filter((q) => !excludeIds.includes(q.id));
  if (remainingPool.length === 0) return QUESTIONS_BANK[0];
  return remainingPool[Math.floor(Math.random() * remainingPool.length)];
};

export const getQuestionsCount = (): number => QUESTIONS_BANK.length;
