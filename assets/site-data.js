const SITE_CONFIGS = {
  en: {
    locale: "en",
    siteName: "H·D·T",
    titleSeparator: " | ",
    pages: {
      home: { title: "H·D·T Personal Homepage" },
      profile: { label: "Profile", title: "Profile" },
      journal: { label: "Journal", title: "Journal" },
      gallery: { label: "Gallery", title: "Gallery" },
      contact: { label: "Contact", title: "Contact" },
      journalEntry: { title: "Journal Entry" }
    },
    nav: [
      { id: "profile", label: "Profile", route: "profile" },
      { id: "journal", label: "Journal", route: "journal" },
      { id: "gallery", label: "Gallery", route: "gallery" },
      { id: "contact", label: "Contact", route: "contact" }
    ],
    home: {
      kicker: "Research Training / Visual Notes / Personal Archive",
      title: "Research notes<br>travel images<br>long-term archive.",
      titlePlain: "Research notes, travel images, and a long-term archive.",
      copyright: "©2026",
      sideLeft: ["Research in progress", "Notes & methods"],
      sideRight: ["images collected", "website evolving"],
      bottomCenter: [
        ["Lab", "and travel"],
        ["Evidence", "with memory"]
      ],
      scaleLeft: "H¹&nbsp;|&nbsp;H²&nbsp;|&nbsp;H³",
      scaleRight: "Lab&nbsp;|&nbsp;Travel&nbsp;|&nbsp;Archive"
    },
    gallery: {
      kicker: "Visual materials from travel, research, and everyday observation:",
      title: "Gallery",
      intro: "Travel photography first, then gradually mixed with paper-reading images, research figures, lab-group materials, visual details from this site, and other images worth showing.",
      note: "This is a display page, not only a traditional portfolio and not only a process archive. In the early stage, travel images can set the visual tone; later, paper, experiment, and project materials can be mixed in naturally.",
      items: [
        { src: "../assets/gallery/gallery-01.webp", alt: "Travel photograph 01" },
        { src: "../assets/gallery/gallery-02.webp", alt: "Travel photograph 02" },
        { src: "../assets/gallery/gallery-03.webp", alt: "City streets and architecture" },
        { src: "../assets/gallery/gallery-04.webp", alt: "Landscape and route" },
        { src: "../assets/gallery/gallery-05.webp", alt: "Light and detail during travel" },
        { src: "../assets/gallery/gallery-06.webp", alt: "Museum, exhibition, or space" },
        { src: "../assets/gallery/gallery-07.webp", alt: "Campus or everyday city scene" },
        { src: "../assets/gallery/gallery-08.webp", alt: "Route and transport record" },
        { src: "../assets/gallery/gallery-09.webp", alt: "Travel photo collection" },
        { src: "../assets/gallery/gallery-10.webp", alt: "Personal website visual detail" },
        { src: "../assets/gallery/gallery-11.webp", alt: "Paper-reading image" },
        { src: "../assets/gallery/gallery-12.webp", alt: "Research figure or lab material" },
        { src: "../assets/gallery/gallery-13.webp", alt: "Lab-group related image" }
      ]
    },
    contact: {
      title: "Contact",
      description: "Email is the preferred way to reach me for research training, lab-group experience, website content, the Gallery, travel images, or necessary information confirmation.",
      tagline: "This page stays simple. I do not publish excessive private information here; exact time, location, and phone contact can be confirmed when needed.",
      email: ["rankelife@sjtu.edu.cn", "secretrepublic24@gmail.com", "18536597776@163.com"],
      phone: "Available by email when necessary",
      address: "Shanghai, China / Flexible",
      addressNote: "Please email ahead for visits, deliveries, or offline meetings. I will confirm the appropriate time and location.",
      emailHref: "mailto:rankelife@sjtu.edu.cn",
      phoneHref: "",
      locations: ["Research training / Site in progress", "Shanghai / Remote communication available"],
      background: "../assets/contact/contact-background.webp",
      stamp: "H·D·T"
    },
    journalDetail: {
      notFound: "No matching journal entry found.",
      loading: "Loading journal content.",
      back: "Back",
      edit: "Edit",
      save: "Save",
      imageLabel: "Image"
    }
  },
  cn: {
    locale: "cn",
    siteName: "氕氘氚",
    titleSeparator: " | ",
    pages: {
      home: { title: "氕氘氚的个人主页" },
      profile: { label: "简历", title: "简历" },
      journal: { label: "日志", title: "日志" },
      gallery: { label: "Gallery", title: "Gallery" },
      contact: { label: "联系", title: "联系" },
      journalEntry: { title: "日志详情" }
    },
    nav: [
      { id: "profile", label: "简历", route: "profile" },
      { id: "journal", label: "日志", route: "journal" },
      { id: "gallery", label: "Gallery", route: "gallery" },
      { id: "contact", label: "联系", route: "contact" }
    ],
    home: {
      kicker: "研究训练 / 影像记录 / 个人档案",
      title: "研究经历<br>旅行影像<br>长期档案",
      titlePlain: "研究经历、旅行影像、长期档案。",
      copyright: "©2026",
      sideLeft: ["Research in progress", "Notes & methods"],
      sideRight: ["images collected", "website evolving"],
      bottomCenter: [
        ["Lab", "and travel"],
        ["Evidence", "with memory"]
      ],
      scaleLeft: "H¹&nbsp;|&nbsp;H²&nbsp;|&nbsp;H³",
      scaleRight: "Lab&nbsp;|&nbsp;Travel&nbsp;|&nbsp;Archive"
    },
    gallery: {
      kicker: "来自旅行、研究和日常观察的视觉材料：",
      title: "Gallery",
      intro: "以旅行照片为主，逐步加入论文阅读图片、研究图表、课题组相关材料、网站视觉细节和其他值得展示的图像。",
      note: "这里是展示页，不限定为传统作品集，也不只呈现过程档案。前期用旅行影像建立视觉基调，后续自然混入论文、实验和项目材料。",
      items: [
        { src: "../assets/gallery/gallery-01.webp", alt: "旅行照片 01" },
        { src: "../assets/gallery/gallery-02.webp", alt: "旅行照片 02" },
        { src: "../assets/gallery/gallery-03.webp", alt: "城市街景与建筑" },
        { src: "../assets/gallery/gallery-04.webp", alt: "自然风景与路途" },
        { src: "../assets/gallery/gallery-05.webp", alt: "旅行中的光影细节" },
        { src: "../assets/gallery/gallery-06.webp", alt: "博物馆、展览或空间" },
        { src: "../assets/gallery/gallery-07.webp", alt: "校园或城市日常" },
        { src: "../assets/gallery/gallery-08.webp", alt: "路线与交通记录" },
        { src: "../assets/gallery/gallery-09.webp", alt: "旅行照片合集" },
        { src: "../assets/gallery/gallery-10.webp", alt: "个人网站视觉细节" },
        { src: "../assets/gallery/gallery-11.webp", alt: "论文阅读相关图片" },
        { src: "../assets/gallery/gallery-12.webp", alt: "研究图表或实验材料" },
        { src: "../assets/gallery/gallery-13.webp", alt: "课题组相关图片" }
      ]
    },
    contact: {
      title: "联系",
      description: "可以通过邮件联系我，适合讨论研究训练、课题组经历、网站内容、Gallery、旅行影像或必要的信息确认。",
      tagline: "这个页面保持简洁。公开网站上不放过多私人信息，具体时间、地点和电话按需确认。",
      email: ["rankelife@sjtu.edu.cn", "secretrepublic24@gmail.com", "18536597776@163.com"],
      phone: "按需通过邮件提供",
      address: "中国上海 / 可变动",
      addressNote: "来访、寄送或线下沟通请先通过邮件确认，避免直接公开个人行程和具体地点。",
      emailHref: "mailto:rankelife@sjtu.edu.cn",
      phoneHref: "",
      locations: ["研究训练 / 网站持续更新", "上海 / 可远程沟通"],
      background: "../assets/contact/contact-background.webp",
      stamp: "H·D·T"
    },
    journalDetail: {
      notFound: "没有找到对应日志。",
      loading: "正在加载日志内容。",
      back: "返回",
      edit: "编辑",
      save: "保存",
      imageLabel: "图片"
    }
  }
};

const detectLocale = () => (
  /\/cn(\/|$)/.test(window.location.pathname) ? "cn" : "en"
);

window.SITE_LOCALE = detectLocale();
window.SITE_CONFIGS = SITE_CONFIGS;
window.SITE_CONFIG = SITE_CONFIGS[window.SITE_LOCALE] || SITE_CONFIGS.en;
