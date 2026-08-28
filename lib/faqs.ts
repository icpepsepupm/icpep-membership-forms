export type Faq = {
  question: string
  answer: string
  keywords: string[]
}

export const FAQS: Faq[] = [
  {
    question: "How do I apply?",
    answer:
      "Pick the department that fits you best from the cards on this page, hit Continue, then fill in your details and submit. It takes about two minutes.",
    keywords: ["apply", "application", "how", "join", "sign up", "register", "start"],
  },
  {
    question: "What departments can I join?",
    answer:
      "There are five: Graphics (design & branding), Marketing (socials & campaigns), Tech (web/app development), Operations (logistics & events), and Secretariat (records & documentation).",
    keywords: ["department", "departments", "team", "teams", "graphics", "marketing", "tech", "operations", "secretariat", "which"],
  },
  {
    question: "Can I apply to more than one department?",
    answer:
      "Each application is for a single department so we can match you properly. If you're torn between two, apply to the one you're most excited about — you can submit another application for a different department afterward.",
    keywords: ["more than one", "multiple", "two", "several", "another", "again", "second"],
  },
  {
    question: "Who can join ICPEP?",
    answer:
      "Any PUP student interested in computer engineering and the org's work is welcome to apply. You don't need to be a CpE major — enthusiasm and willingness to learn matter most.",
    keywords: ["who", "eligible", "qualify", "requirements", "student", "major", "course", "eligibility"],
  },
  {
    question: "Do I need experience?",
    answer:
      "No prior experience is required for most roles. Share whatever skills or past projects you have in the form — we value willingness to learn just as much as existing skills.",
    keywords: ["experience", "skills", "beginner", "new", "portfolio", "qualified", "need to know"],
  },
  {
    question: "What happens after I submit?",
    answer:
      "Your application goes straight to our officers for review. If it's a good fit, we'll reach out through the email you provided with next steps, so keep an eye on your inbox.",
    keywords: ["after", "next", "happens", "review", "wait", "response", "hear back", "results", "accepted"],
  },
  {
    question: "Is there a fee to join?",
    answer:
      "Applying is free. Any membership dues or event fees, if applicable, will be clearly communicated by the officers after you're accepted.",
    keywords: ["fee", "cost", "pay", "payment", "free", "price", "dues", "money"],
  },
  {
    question: "When is the deadline?",
    answer:
      "Recruitment is currently open. We recommend applying as early as you can — we'll announce a closing date on our official social media pages.",
    keywords: ["deadline", "when", "close", "closing", "date", "time", "last day", "open"],
  },
  {
    question: "Is my information safe?",
    answer:
      "Yes. Your details are stored securely and only accessible to authorized ICPEP officers reviewing applications. We only use them for recruitment.",
    keywords: ["safe", "privacy", "data", "secure", "information", "private", "confidential"],
  },
]

export const CHATBOT_GREETING =
  "Hi! I'm the ICPEP assistant. Ask me anything about joining — or tap a question below."
