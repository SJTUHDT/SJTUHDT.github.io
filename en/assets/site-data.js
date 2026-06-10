window.SITE_CONFIG = {
  siteName: "New Personal Homepage",
  titleSeparator: " | ",
  pages: {
    home: {
      title: "New Personal Homepage"
    },
    profile: {
      label: "Profile",
      title: "Profile"
    },
    journal: {
      label: "Journal",
      title: "Journal"
    },
    gallery: {
      label: "Gallery",
      title: "Gallery"
    },
    contact: {
      label: "Contact",
      title: "Contact"
    },
    journalEntry: {
      title: "Journal Entry"
    }
  },
  nav: [
    { id: "profile", label: "Profile", file: "profile.html" },
    { id: "journal", label: "Journal", file: "journal.html" },
    { id: "gallery", label: "Gallery", file: "gallery.html" },
    { id: "contact", label: "Contact", file: "contact.html" }
  ],
  home: {
    kicker: "Personal Archive",
    title: "A personal homepage<br>for works, notes,<br>and contact.",
    titlePlain: "A personal homepage for works, notes, and contact.",
    language: "EN / CN",
    copyright: "©2026",
    sideLeft: ["Design & development", "Purveyors"],
    sideRight: ["hand-crafted", "digital design Refuge"],
    bottomCenter: [
      ["Gold idEAs", "seekers"],
      ["Republic of", "collaborative minds"]
    ],
    scaleLeft: "72PX&nbsp;|&nbsp;54PT",
    scaleRight: "16.1KM&nbsp;|&nbsp;10MI"
  },
  gallery: {
    kicker: "Everything born from our explorations:",
    title: "Gallery",
    intro: "work-in-progress visuals, photography studies, material tests, design sketches, and experimental projects",
    note: "A behind-the-scenes look at the creative process.",
    items: [
      { src: "../assets/gallery/gallery-01.webp", alt: "Gallery image 1" },
      { src: "../assets/gallery/gallery-02.webp", alt: "Gallery image 2" },
      { src: "../assets/gallery/gallery-03.webp", alt: "Gallery image 3" },
      { src: "../assets/gallery/gallery-04.webp", alt: "Gallery image 4" },
      { src: "../assets/gallery/gallery-05.webp", alt: "Gallery image 5" },
      { src: "../assets/gallery/gallery-06.webp", alt: "Gallery image 6" },
      { src: "../assets/gallery/gallery-07.webp", alt: "Gallery image 7" },
      { src: "../assets/gallery/gallery-08.webp", alt: "Gallery image 8" },
      { src: "../assets/gallery/gallery-09.webp", alt: "Gallery image 9" },
      { src: "../assets/gallery/gallery-10.webp", alt: "Gallery image 10" },
      { src: "../assets/gallery/gallery-11.webp", alt: "Gallery image 11" },
      { src: "../assets/gallery/gallery-12.webp", alt: "Gallery image 12" },
      { src: "../assets/gallery/gallery-13.webp", alt: "Gallery image 13" }
    ]
  },
  profile: {
    kicker: "Profile / Curriculum Vitae",
    title: "Personal<br>Resume",
    lead: "Placeholder introduction for a personal homepage. Replace this line with a concise statement about research, design, study, and practice.",
    portraitPlaceholder: "Portrait Placeholder",
    identity: {
      name: "Your Name",
      role: "Student / Researcher / Designer",
      location: "Shanghai, China"
    },
    about: [
      "Placeholder paragraph for the main biography. Write a short personal background here, including your current academic direction, creative interests, and the kind of work you want this website to collect.",
      "Placeholder paragraph for a second layer of context. This can describe how your research, visual work, writing, and technical experiments connect with each other."
    ],
    education: [
      {
        period: "20XX - Present",
        title: "University / Program Name",
        text: "Placeholder text for degree, laboratory, advisor, coursework, or academic focus."
      },
      {
        period: "20XX - 20XX",
        title: "Previous Education",
        text: "Placeholder text for prior institution, major, exchange experience, or academic record."
      }
    ],
    research: "Placeholder text for research topics, ongoing questions, experimental methods, and publication plans.",
    projects: "Placeholder text for selected projects. This can later link to journal entries, gallery images, or independent case pages.",
    skills: [
      "Research writing",
      "Visual layout",
      "Frontend prototyping",
      "Image editing",
      "Data organization",
      "Documentation"
    ],
    experience: "Placeholder text for internships, studio practice, lab work, collaboration, or independent responsibilities.",
    awards: "Placeholder text for honors, scholarships, exhibitions, competitions, certificates, or public presentations.",
    imagePlaceholders: [
      "Image Placeholder 01",
      "Image Placeholder 02",
      "Image Placeholder 03",
      "Image Placeholder 04",
      "Image Placeholder 05"
    ],
    contactText: "Placeholder text for collaboration intention, academic contact, portfolio request, or professional profile links.",
    contactLinkLabel: "Contact Me"
  },
  contact: {
    title: "Contact Me",
    description: "For collaborations, commissions, or a simple hello, this is the place to reach me.",
    tagline: "I keep this page quiet and direct so the contact details can be updated without rebuilding the layout.",
    email: [
      "18536597776@163.com",
      "rankelife@sjtu.edu.cn",
      "secretrepublic24@gmail.com"
    ],
    phone: "+86 18536597776",
    address: "Shanghai Jiao Tong University, No. 800 Dongchuan Road, Jiangchuan Road Subdistrict, Minhang District, Shanghai, China",
    addressNote: "Please message ahead for visits or deliveries. I will confirm the best time and entrance.",
    emailHref: "mailto:18536597776@163.com",
    phoneHref: "tel:+8618536597776",
    locations: ["Available for selected projects", "Shanghai / Remote"],
    background: "../assets/contact/contact-background.webp",
    stamp: ""
  }
};
