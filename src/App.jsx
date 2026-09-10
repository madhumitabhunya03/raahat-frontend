import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback, useReducer, useContext } from "react";
import * as THREE from "three";
import {
  Mic, Type, MessageCircle, HelpCircle, X, Phone, MapPin, Shield, Heart,
  ChevronRight, ChevronLeft, Check, AlertTriangle, Pause, Play, Volume2,
  Globe, Search, Filter, Clock, FileText, Users, UserCheck, Activity,
  TrendingUp, Calendar, LogOut, Edit2, Save, Trash2, Eye, Lock, Upload,
  ArrowRight, ArrowLeft, Info, CheckCircle2, XCircle, Circle, Sun, Leaf,
  Waves, PhoneCall, Send, MicOff, RefreshCw, ChevronDown, ChevronUp,
  Loader2, Sparkles, HandHeart, Scale, Stethoscope, Building2, ShieldAlert,
  ClipboardList, BellRing, UserCog, ScrollText, LifeBuoy, PauseCircle,
  PlayCircle, Languages, Wifi, WifiOff, PlusCircle, Landmark
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/* Design tokens                                                          */
/* ---------------------------------------------------------------------- */
const T = {
  bg: "#FAF7F2",
  lavender: "#E9E3F5",
  teal: "#3F8A82",
  tealDark: "#2E6B64",
  sage: "#8CA888",
  indigo: "#2D2467",
  coral: "#E15C43",
  coralDark: "#C44A34",
  white: "#FFFFFF",
  amber: "#C98A2E",
  amberBg: "#FBF0DC",
  blueChip: "#3E6FA8",
  blueChipBg: "#E4ECF7",
  greenChip: "#3F8A56",
  greenChipBg: "#E4F1E6",
  coralBg: "#FBE6E1",
  line: "#E4DDCF",
  tealBg: "#E4F1EF",
  sageBg: "#EEF3ED",
};

/* A soft cycle through the palette's tints, used to keep card grids from  */
/* reading as flat white-on-white. */
const TINT_CYCLE = [T.lavender, T.tealBg, T.sageBg, T.amberBg, T.coralBg];

const FONT_STACK = '"Nunito Sans","Work Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
const MONO_STACK = '"IBM Plex Mono","SFMono-Regular",Consolas,monospace';

const RM_QUERY = "(prefers-reduced-motion: reduce)";
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(RM_QUERY);
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener ? mq.addEventListener("change", handler) : mq.addListener(handler);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", handler) : mq.removeListener(handler);
    };
  }, []);
  return reduced;
}

/* ---------------------------------------------------------------------- */
/* Language / translations                                                */
/* ---------------------------------------------------------------------- */
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "bn", label: "বাংলা" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "mr", label: "मराठी" },
  { code: "kn", label: "ಕನ್ನಡ" },
];

const STRINGS = {
  heroHeadline: {
    en: "You are not alone. Help is here.",
    hi: "आप अकेले नहीं हैं। मदद यहाँ है।",
    mr: "तुम्ही एकटे नाही आहात. मदत इथे आहे.",
  },
  getHelpNow: {
    en: "Get help now",
    hi: "अभी मदद पाएं",
    mr: "आत्ता मदत मिळवा",
  },
  trackCase: {
    en: "Track my case",
    hi: "मेरा केस देखें",
    mr: "माझं प्रकरण पहा",
  },
  officerLogin: {
    en: "Officer Login",
    hi: "अधिकारी लॉगिन",
    mr: "अधिकारी लॉगिन",
  },
  howItWorks: {
    en: "How it works",
    hi: "यह कैसे काम करता है",
    mr: "हे कसे कार्य करते",
  },
  channels: { en: "Channels", hi: "माध्यम", mr: "माध्यमे" },
  forOfficials: { en: "For officials", hi: "अधिकारियों के लिए", mr: "अधिकाऱ्यांसाठी" },
  architecture: { en: "Architecture", hi: "संरचना", mr: "रचना" },
  skipToMain: { en: "Skip to main content", hi: "मुख्य सामग्री पर जाएँ", mr: "मुख्य मजकुरावर जा" },
  speakChoice: { en: "Speak", hi: "बोलें", mr: "बोला" },
  typeChoice: { en: "Type", hi: "लिखें", mr: "टाइप करा" },
  shareOnlySafe: {
    en: "Share only what feels safe. You can skip any question.",
    hi: "केवल वही साझा करें जो सुरक्षित लगे। आप कोई भी सवाल छोड़ सकते हैं।",
    mr: "फक्त जे सुरक्षित वाटतं तेच सांगा. तुम्ही कोणताही प्रश्न वगळू शकता.",
  },
  urgentHelp: { en: "Urgent help", hi: "तुरंत मदद", mr: "तातडीची मदत" },
  quickExit: { en: "Quick exit", hi: "तुरंत बाहर जाएँ", mr: "पटकन बाहेर पडा" },
  aiReviewBanner: {
    en: "AI suggestions require authorized human review.",
    hi: "एआई सुझावों के लिए अधिकृत मानव समीक्षा आवश्यक है।",
    mr: "एआय सूचनांसाठी अधिकृत मानवी पुनरावलोकन आवश्यक आहे.",
  },
  submitForReview: { en: "Submit for Human Review", hi: "मानव समीक्षा हेतु भेजें", mr: "मानवी पुनरावलोकनासाठी सबमिट करा" },
};
function useLang() {
  const [lang, setLang] = useState("en");
  const t = useCallback(
    (key) => (STRINGS[key] && (STRINGS[key][lang] || STRINGS[key].en)) || key,
    [lang]
  );
  return { lang, setLang, t };
}

const HERO_ROTATING_LINES = [
  {
    en: "Speak in your language. We will listen.",
    hi: "अपनी भाषा में बोलें। हम सुनेंगे।",
    mr: "तुमच्या भाषेत बोला. आम्ही ऐकू.",
  },
  {
    en: "A trained person will review your case.",
    hi: "एक प्रशिक्षित व्यक्ति आपके मामले की समीक्षा करेगा।",
    mr: "एक प्रशिक्षित व्यक्ती तुमच्या प्रकरणाचे पुनरावलोकन करेल.",
  },
  {
    en: "Your privacy is protected at every step.",
    hi: "हर कदम पर आपकी गोपनीयता सुरक्षित है।",
    mr: "प्रत्येक टप्प्यावर तुमची गोपनीयता सुरक्षित आहे.",
  },
];

function RotatingLine({ lang, reducedMotion }) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      if (reducedMotion) {
        setIdx((i) => (i + 1) % HERO_ROTATING_LINES.length);
        return;
      }
      setFade(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % HERO_ROTATING_LINES.length);
        setFade(true);
      }, 260);
    }, 4000);
    return () => clearInterval(id);
  }, [reducedMotion]);
  const line = HERO_ROTATING_LINES[idx];
  return (
    <p
      aria-live="polite"
      className="text-base font-semibold mb-5"
      style={{
        color: "#BFEAE0",
        fontFamily: FONT_STACK,
        opacity: reducedMotion ? 1 : fade ? 1 : 0,
        transition: reducedMotion ? "none" : "opacity 0.26s ease",
        minHeight: 24,
        textShadow: "0 1px 10px rgba(0,0,0,0.3)",
      }}
    >
      {line[lang] || line.en}
    </p>
  );
}

/* ---------------------------------------------------------------------- */
/* Mock reference data                                                    */
/* ---------------------------------------------------------------------- */
const STATE_DISTRICTS = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
  Bihar: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur"],
  "Tamil Nadu": ["Chennai", "Madurai", "Coimbatore", "Salem"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Malda"],
};
const ALL_DISTRICTS = Object.values(STATE_DISTRICTS).flat();

const SUPPORT_LANGUAGES = ["Hindi", "English", "Bengali", "Tamil", "Telugu", "Marathi", "Kannada"];

const COUNSELLORS = [
  { id: "C1", name: "Dr. Anjali Verma", languages: ["Hindi", "English"], modes: ["Call", "Video"], availability: "Available now", specialNeed: "Trauma-informed", district: "Patna" },
  { id: "C2", name: "Fr. Thomas Kutty", languages: ["English", "Tamil"], modes: ["Call", "Chat"], availability: "Available today, 4–7 PM", specialNeed: "Grief & loss", district: "Chennai" },
  { id: "C3", name: "Ms. Priya Raman", languages: ["Tamil", "English"], modes: ["Video", "Chat"], availability: "Available now", specialNeed: "Survivor support", district: "Madurai" },
  { id: "C4", name: "Dr. Sunita Oraon", languages: ["Hindi", "Bengali"], modes: ["Call"], availability: "Available tomorrow, 10 AM", specialNeed: "Adolescent support", district: "Malda" },
  { id: "C5", name: "Mr. Ravi Naik", languages: ["Marathi", "Hindi"], modes: ["Call", "Video"], availability: "Available now", specialNeed: "Trauma-informed", district: "Pune" },
  { id: "C6", name: "Ms. Lakshmi Devi", languages: ["Telugu", "English"], modes: ["Chat", "Video"], availability: "Available today, 2–6 PM", specialNeed: "Family mediation", district: "Nagpur" },
  { id: "C7", name: "Dr. Farida Sheikh", languages: ["Hindi", "Urdu", "English"], modes: ["Call", "Chat"], availability: "Available now", specialNeed: "Crisis support", district: "Mumbai" },
  { id: "C8", name: "Mr. Debashish Roy", languages: ["Bengali", "Hindi"], modes: ["Video", "Call"], availability: "Available tomorrow, 11 AM", specialNeed: "Survivor support", district: "Kolkata" },
];

/* District STD codes, used only to give each generated listing a plausible */
/* local phone number — approximate, for demo purposes.                    */
const DISTRICT_STD_CODES = {
  Mumbai: "022", Pune: "020", Nagpur: "0712", Nashik: "0253",
  Patna: "0612", Gaya: "0631", Muzaffarpur: "0621", Bhagalpur: "0641",
  Chennai: "044", Madurai: "0452", Coimbatore: "0422", Salem: "0427",
  Kolkata: "033", Howrah: "033", Darjeeling: "0354", Malda: "03512",
};

/* One template set per recommendation category. Each district gets every   */
/* template in a category, so "at least 3-4 real-looking entries per type   */
/* per district" holds everywhere, not just for a couple of seed districts. */
const CENTRE_TEMPLATES = {
  medical: [
    { type: "District Hospital", name: (d) => `${d} District Hospital`, addr: (d) => `Hospital Road, ${d}`, timings: "24×7 emergency · OPD 9:00 AM–4:00 PM" },
    { type: "Primary Health Centre", name: (d) => `Primary Health Centre, ${d} Rural`, addr: (d) => `PHC Campus, ${d} Rural`, timings: "9:00 AM–5:00 PM (Mon–Sat)" },
    { type: "Municipal General Hospital", name: (d) => `Municipal General Hospital, ${d}`, addr: (d) => `Civil Lines, ${d}`, timings: "24×7" },
    { type: "Community Health Centre", name: (d) => `Community Health Centre, ${d} East`, addr: (d) => `Station Road, ${d} East`, timings: "9:00 AM–6:00 PM (Mon–Sat)" },
  ],
  legal: [
    { type: "DLSA Office", name: (d) => `District Legal Services Authority (DLSA), ${d}`, addr: (d) => `District Court Complex, ${d}`, timings: "10:00 AM–5:00 PM (Mon–Fri)" },
    { type: "Legal Aid Clinic", name: (d) => `Legal Aid Clinic, ${d} Bar Association`, addr: (d) => `Bar Association Building, ${d}`, timings: "11:00 AM–4:00 PM (Mon–Sat)" },
    { type: "Taluka Legal Services Committee", name: (d) => `Taluka Legal Services Committee, ${d}`, addr: (d) => `Taluka Office Complex, ${d}`, timings: "10:00 AM–5:00 PM (Mon–Fri)" },
  ],
  sakhi: [
    { type: "Sakhi One Stop Centre", name: (d) => `Sakhi One Stop Centre, ${d}`, addr: (d) => `Near District Hospital, ${d}`, timings: "24×7" },
    { type: "One Stop Centre", name: (d) => `One Stop Centre, ${d} Rural`, addr: (d) => `Collectorate Campus, ${d} Rural`, timings: "24×7" },
    { type: "Sakhi Centre", name: (d) => `Sakhi Centre, ${d} Municipal Office`, addr: (d) => `Municipal Office Complex, ${d}`, timings: "9:00 AM–6:00 PM (Mon–Sat)" },
  ],
  welfare: [
    { type: "District Social Welfare Office", name: (d) => `District Social Welfare Office, ${d}`, addr: (d) => `Collectorate Campus, ${d}`, timings: "10:00 AM–5:00 PM (Mon–Fri)" },
    { type: "Women & Child Development Office", name: (d) => `Women & Child Development Office, ${d}`, addr: (d) => `WCD Building, ${d}`, timings: "10:00 AM–5:00 PM (Mon–Fri)" },
    { type: "ICDS Project Office", name: (d) => `ICDS Project Office, ${d}`, addr: (d) => `Anganwadi Complex, ${d}`, timings: "9:30 AM–5:30 PM (Mon–Sat)" },
  ],
  police: [
    { type: "Police Cell", name: (d) => `Special Cell for Women & Children, ${d}`, addr: (d) => `Police Lines, ${d}`, timings: "24×7" },
    { type: "Police Cell", name: (d) => `All Women Police Station, ${d}`, addr: (d) => `Civil Lines, ${d}`, timings: "24×7" },
  ],
};

function buildSupportCentres() {
  const out = {};
  let districtIdx = 0;
  for (const d of ALL_DISTRICTS) {
    const std = DISTRICT_STD_CODES[d] || "0120";
    const entries = [];
    let seedIdx = 0;
    for (const [category, templates] of Object.entries(CENTRE_TEMPLATES)) {
      templates.forEach((tpl, i) => {
        const local = String(210000 + ((districtIdx * 137 + seedIdx * 53) % 700000)).padStart(6, "0");
        entries.push({
          category,
          type: tpl.type,
          name: tpl.name(d),
          address: tpl.addr(d),
          timings: tpl.timings,
          phone: `${std}-${local}`,
          distanceKm: Math.round((1.4 + i * 1.5 + (districtIdx % 5) * 0.5) * 10) / 10,
        });
        seedIdx++;
      });
    }
    out[d] = entries;
    districtIdx++;
  }
  return out;
}

const SUPPORT_CENTRES = buildSupportCentres();

const FIRST_NAMES = ["Meena", "Suresh", "Kavita", "Ramesh", "Anita", "Vikram", "Sunita", "Ajay", "Geeta", "Manoj", "Rekha", "Sanjay"];
const LAST_NAMES = ["Devi", "Kumar", "Bai", "Singh", "Prasad", "Yadav", "Kumari", "Mahato", "Oraon", "Nayak"];
const DISTRICT_POOL = ["Mumbai", "Pune", "Patna", "Gaya", "Chennai", "Madurai", "Kolkata", "Howrah", "Nagpur", "Muzaffarpur", "Coimbatore", "Malda"];
const SUPPORT_TYPES = ["Counselling", "Legal aid", "Medical support", "Welfare support", "Safety planning"];
const TIERS = ["Low", "Moderate", "High", "Critical"];
const VERIFICATION_STATES = ["Unverified", "Pending documents", "Verified"];

function seededCases() {
  const cases = [];
  const tierCycle = ["Low", "Low", "Moderate", "Moderate", "Moderate", "High", "High", "High", "Critical", "Critical", "Critical", "Low"];
  for (let i = 0; i < 12; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const district = DISTRICT_POOL[i % DISTRICT_POOL.length];
    const language = SUPPORT_LANGUAGES[i % SUPPORT_LANGUAGES.length];
    const tier = tierCycle[i];
    const isFlagship = i === 8; // the fully-populated critical case
    const daysAgo = i + 1;
    const created = new Date(Date.now() - daysAgo * 86400000 - i * 3600000);
    cases.push({
      id: `RAH-2026-00${1200 + i}`,
      name: `${first} ${last}`,
      district,
      language,
      supportType: SUPPORT_TYPES[i % SUPPORT_TYPES.length],
      svi: tier,
      sviScore: tier === "Critical" ? 82 + i : tier === "High" ? 58 + i : tier === "Moderate" ? 34 + i : 10 + i,
      safetyOverride: isFlagship || (tier === "Critical" && i % 2 === 0),
      status: i % 5 === 0 ? "Resolved" : i % 3 === 0 ? "Referral / Follow-up" : i % 2 === 0 ? "Support Recommended" : "Human Review",
      verification: VERIFICATION_STATES[i % 3],
      createdAt: created.toISOString(),
      assignedOfficer: i % 4 === 0 ? "Unassigned" : ["S. Kulkarni", "P. Banerjee", "R. Iyer", "N. Sharma"][i % 4],
      transcript: isFlagship
        ? "They keep threatening our family and the whole village has stopped talking to us. I don't feel safe here anymore. Sometimes I don't want to go on living like this."
        : "I wanted to share what happened at the panchayat meeting last week. I felt scared and unsure who to tell.",
      textIndicators: isFlagship
        ? ["fear", "threats to family", "social boycott", "suicidal ideation", "extreme vulnerability"]
        : tier === "High"
        ? ["fear", "intimidation", "anxiety"]
        : tier === "Moderate"
        ? ["anxiety", "social isolation"]
        : ["trauma"],
      speechSignals: [
        { label: "Pause frequency", value: tier === "Critical" ? "High" : tier === "High" ? "Elevated" : "Typical", flagged: tier === "Critical" || tier === "High" },
        { label: "Pitch variation", value: tier === "Critical" ? "Very low (flat affect)" : "Moderate", flagged: tier === "Critical" },
        { label: "Speaking rate", value: tier === "Critical" ? "Slow, halting" : "Steady", flagged: tier === "Critical" },
        { label: "Voice tremor", value: tier === "Critical" || tier === "High" ? "Detected" : "Not detected", flagged: tier === "Critical" || tier === "High" },
        { label: "Long silences", value: tier === "Critical" ? "3 silences over 4s" : "None significant", flagged: tier === "Critical" },
      ],
      summary: isFlagship
        ? "Caller describes ongoing threats and social boycott against her family, with signs of acute distress and a safety override triggered by suicidal ideation language. Requires urgent human review."
        : `Caller shared concerns related to ${SUPPORT_TYPES[i % SUPPORT_TYPES.length].toLowerCase()}. Indicators suggest a ${tier.toLowerCase()} level of concern.`,
      consent: { shareVoice: i % 2 === 0, receiveUpdates: true, shareLocation: i % 3 !== 0 },
      timeline: [
        { stage: "Received", at: created.toISOString(), done: true },
        { stage: "Human Review", at: new Date(created.getTime() + 3600000).toISOString(), done: true },
        { stage: "Support Recommended", at: new Date(created.getTime() + 7200000).toISOString(), done: i % 2 === 0 || isFlagship },
        { stage: "Referral / Follow-up", at: new Date(created.getTime() + 10800000).toISOString(), done: i % 3 === 0 || isFlagship },
        { stage: "Resolved", at: new Date(created.getTime() + 172800000).toISOString(), done: i % 5 === 0 },
      ],
      auditLog: [
        { at: created.toISOString(), actor: "System", role: "System", action: "Case created from citizen intake" },
        { at: new Date(created.getTime() + 3600000).toISOString(), actor: "S. Kulkarni", role: "Helpline Officer", action: "Reviewed AI-generated summary and indicators" },
        ...(isFlagship
          ? [
              { at: new Date(created.getTime() + 3700000).toISOString(), actor: "S. Kulkarni", role: "Helpline Officer", action: "Escalated: Safety Override Flag confirmed" },
              { at: new Date(created.getTime() + 5400000).toISOString(), actor: "R. Iyer", role: "District Administrator", action: "Assigned for urgent counsellor + police liaison follow-up" },
            ]
          : []),
      ],
    });
  }
  return cases;
}
const SEED_CASES = seededCases();

/* ---------------------------------------------------------------------- */
/* Assessment engine — deterministic, auditable                          */
/* ---------------------------------------------------------------------- */
const INDICATOR_KEYWORDS = {
  trauma: { points: 8, words: ["trauma", "traumatic", "haunts me", "can't forget", "nightmare"] },
  fear: { points: 8, words: ["afraid", "scared", "fear", "frightened", "terrified"] },
  anxiety: { points: 6, words: ["anxious", "anxiety", "panic", "worried all the time", "can't breathe"] },
  depression: { points: 8, words: ["hopeless", "no point", "empty inside", "depressed", "worthless"] },
  "suicidal ideation": { points: 40, words: ["don't want to live", "end my life", "kill myself", "not want to go on", "not want to live", "suicide", "hurt myself"] },
  intimidation: { points: 10, words: ["threaten", "threatening", "intimidate", "warned me", "warned us"] },
  "social isolation": { points: 6, words: ["no one talks to", "alone", "isolated", "no one to turn to"] },
  "extreme vulnerability": { points: 10, words: ["disabled", "elderly", "child alone", "no family left", "vulnerable"] },
  "social boycott": { points: 14, words: ["boycott", "stopped talking to us", "excluded from the village", "won't let us"] },
  displacement: { points: 10, words: ["had to leave our home", "displaced", "fled our village", "forced out"] },
  "threats to family": { points: 14, words: ["threatening our family", "threaten my family", "harm my children", "hurt my family"] },
  "prolonged legal proceedings": { points: 6, words: ["case has been going on", "years in court", "no hearing date", "still waiting for justice"] },
  "physical violence": { points: 16, words: ["beaten", "hit me", "assaulted", "attacked", "physically hurt"] },
  "sexual violence": { points: 20, words: ["raped", "sexually assaulted", "molested", "sexual violence"] },
};
const INDICATOR_LIST = Object.keys(INDICATOR_KEYWORDS);

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function tierFromScore(score) {
  if (score >= 70) return "Critical";
  if (score >= 45) return "High";
  if (score >= 20) return "Moderate";
  return "Low";
}

/* Exactly three bullets for the admin "3-Second Case Brief": who & what,  */
/* the risk drivers behind the tier, and the recommended immediate action. */
/* Derived deterministically from the case record — nothing invented.     */
const TIER_IMMEDIATE_ACTION = {
  Critical: "Escalate now — urgent human review and a safety check-in are required.",
  High: "Priority review within the hour; assign an officer today.",
  Moderate: "Route to the standard review queue; contact within 24–48 hrs.",
  Low: "Log and monitor; respond at the standard SLA.",
};
function caseBrief(c) {
  const topIndicators = (c.textIndicators || []).slice(0, 3);
  const flaggedSignals = (c.speechSignals || []).filter((s) => s.flagged).map((s) => s.label.toLowerCase());
  const riskParts = [];
  if (c.safetyOverride) riskParts.push("safety override triggered");
  if (topIndicators.length) riskParts.push(topIndicators.join(", "));
  if (flaggedSignals.length) riskParts.push(`speech: ${flaggedSignals.join(", ")}`);
  const riskLine = riskParts.length ? riskParts.join(" · ") : "no elevated indicators detected";

  const action = c.safetyOverride ? TIER_IMMEDIATE_ACTION.Critical : (TIER_IMMEDIATE_ACTION[c.svi] || TIER_IMMEDIATE_ACTION.Low);

  return [
    `${c.name}, ${c.district} — ${(c.supportType || "a concern").toLowerCase()} (${c.language}).`,
    `Risk drivers: ${riskLine} — SVI ${c.svi}, ${c.sviScore}/100.`,
    action,
  ];
}

const NEED_TYPE_POINTS = {
  "stressed or scared": 6,
  medical: 4,
  legal: 4,
  "feel unsafe": 16,
  "not sure": 2,
};

function assess(intake) {
  const transcript = (intake.transcript || "").toLowerCase();
  const guided = intake.guidedAnswers || {};
  let score = 0;
  const textIndicators = [];

  for (const indicator of INDICATOR_LIST) {
    const { points, words } = INDICATOR_KEYWORDS[indicator];
    const matched = words.some((w) => transcript.includes(w));
    if (matched) {
      textIndicators.push(indicator);
      score += points;
    }
  }

  if (guided.needType && NEED_TYPE_POINTS[guided.needType]) {
    score += NEED_TYPE_POINTS[guided.needType];
  }

  let safetyOverride = false;
  if (guided.safe === "No") safetyOverride = true;
  if (textIndicators.includes("suicidal ideation")) safetyOverride = true;

  score = Math.max(0, Math.min(100, score));
  let svi = tierFromScore(score);
  let sviScore = score;

  if (intake.demoOverride) {
    svi = intake.demoOverride;
    sviScore = { Low: 12, Moderate: 32, High: 58, Critical: 88 }[svi];
    safetyOverride = svi === "Critical" ? true : safetyOverride;
  } else if (safetyOverride) {
    svi = "Critical";
    sviScore = Math.max(sviScore, 85);
  }

  const seed = hashString(transcript || "seed") + sviScore;
  const pick = (arr, offset) => arr[(seed + offset) % arr.length];
  const speechSignals = [
    { label: "Pause frequency", value: pick(["Typical", "Slightly elevated", "Elevated", "High"], 1), flagged: svi === "Critical" || svi === "High" },
    { label: "Pitch variation", value: pick(["Normal range", "Reduced", "Very low (flat affect)"], 2), flagged: svi === "Critical" },
    { label: "Speaking rate", value: pick(["Steady", "Slightly rushed", "Slow, halting"], 3), flagged: svi === "Critical" },
    { label: "Voice tremor", value: svi === "Critical" || svi === "High" ? "Detected" : "Not detected", flagged: svi === "Critical" || svi === "High" },
    { label: "Long silences", value: svi === "Critical" ? `${1 + (seed % 3)} silences over 4s` : "None significant", flagged: svi === "Critical" },
  ];

  const recommendations = [];
  if (safetyOverride || svi === "Critical") {
    recommendations.push("Speaking with a trained support person right away may help.");
    recommendations.push("A district welfare officer can be asked to reach out to you.");
  }
  if (guided.needType === "medical" || textIndicators.includes("physical violence") || textIndicators.includes("sexual violence")) {
    recommendations.push("Nearby medical support is available if you need care.");
  }
  if (guided.needType === "legal" || textIndicators.includes("prolonged legal proceedings")) {
    recommendations.push("Free legal aid can help you understand your options.");
  }
  if (textIndicators.includes("social isolation") || textIndicators.includes("social boycott")) {
    recommendations.push("A Sakhi Centre nearby can offer a safe space and support.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Based on what you shared, speaking with a trained support person may help.");
    recommendations.push("You can also explore welfare support in your district.");
  }
  recommendations.push("You can ask a human officer to contact you at a time that works for you.");

  const summary = safetyOverride
    ? "What you shared points to a situation needing urgent, careful attention. A trained person has been notified."
    : svi === "High"
    ? "What you shared points to real concerns that deserve prompt, caring attention."
    : svi === "Moderate"
    ? "Thank you for sharing this. There are a few support options that could help you."
    : "Thank you for reaching out. Here are some options that may be useful for you.";

  return { sviScore, svi, safetyOverride, textIndicators, speechSignals, summary, recommendations };
}

/* ---------------------------------------------------------------------- */
/* Small shared atoms                                                     */
/* ---------------------------------------------------------------------- */
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

/* Low bandwidth mode — toggled from the government strip. Reads via        */
/* context so shared primitives (buttons, headings) and the hero can react  */
/* without threading a prop through every section on the landing page.      */
const LowBandwidthContext = React.createContext(false);
function useLowBandwidth() {
  return useContext(LowBandwidthContext);
}

function PrimaryButton({ children, onClick, icon: Icon, variant = "indigo", size = "lg", full, type = "button", disabled }) {
  const lowBandwidth = useLowBandwidth();
  const effectiveSize = lowBandwidth && size === "lg" ? "xl" : size;
  const palette = {
    indigo: { bg: T.indigo, fg: T.white },
    teal: { bg: T.teal, fg: T.white },
    coral: { bg: T.coral, fg: T.white },
    outline: { bg: "transparent", fg: T.indigo },
    outlineLight: { bg: "rgba(255,255,255,0.08)", fg: T.white },
  }[variant];
  const isOutline = variant === "outline";
  const isOutlineLight = variant === "outlineLight";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center gap-3 rounded-2xl font-semibold transition-transform focus:outline-none focus-visible:ring-4 active:scale-[0.98]",
        effectiveSize === "xl" ? "px-8 text-xl" : effectiveSize === "lg" ? "px-7 text-lg" : "px-5 text-base",
        full ? "w-full" : "",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      )}
      style={{
        minHeight: effectiveSize === "xl" ? 64 : effectiveSize === "lg" ? 56 : 48,
        backgroundColor: palette.bg,
        color: palette.fg,
        border: isOutline ? `2px solid ${T.indigo}` : isOutlineLight ? "2px solid rgba(255,255,255,0.85)" : "none",
        boxShadow: isOutline || isOutlineLight ? "none" : "0 6px 16px rgba(45,36,103,0.16)",
        fontFamily: FONT_STACK,
        ringColor: T.teal,
      }}
    >
      {Icon && <Icon size={effectiveSize === "xl" ? 26 : 22} strokeWidth={2.2} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}

function Card({ children, className, style, padded = true, onClick, as = "div" }) {
  const Comp = as;
  return (
    <Comp
      onClick={onClick}
      className={cx("rounded-3xl bg-white", padded ? "p-6" : "", className)}
      style={{ boxShadow: "0 4px 24px rgba(45,36,103,0.07)", border: `1px solid ${T.line}`, ...style }}
    >
      {children}
    </Comp>
  );
}

function Chip({ children, tone = "neutral", flagged, icon: Icon }) {
  const tones = {
    neutral: { bg: T.lavender, fg: T.indigo },
    critical: { bg: T.coralBg, fg: T.coralDark },
    high: { bg: T.amberBg, fg: T.amber },
    moderate: { bg: T.blueChipBg, fg: T.blueChip },
    low: { bg: T.greenChipBg, fg: T.greenChip },
  };
  const tone_ = flagged ? tones.critical : tones[tone] || tones.neutral;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
      style={{ backgroundColor: tone_.bg, color: tone_.fg, fontFamily: FONT_STACK }}
    >
      {Icon && <Icon size={14} strokeWidth={2.4} />}
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    Critical: "critical",
    High: "high",
    Moderate: "moderate",
    Low: "low",
  };
  return <Chip tone={map[status] || "neutral"}>{status}</Chip>;
}

function SectionHeading({ eyebrow, title, subtitle, align = "left" }) {
  const lowBandwidth = useLowBandwidth();
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow && (
        <p style={{ color: T.teal, fontFamily: FONT_STACK }} className="font-semibold mb-2 text-sm">
          {eyebrow}
        </p>
      )}
      <h2 style={{ color: T.indigo, fontFamily: FONT_STACK }} className={cx("font-bold leading-tight", lowBandwidth ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl")}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ color: "#5B5482", fontFamily: FONT_STACK }} className={cx("mt-3 max-w-2xl", lowBandwidth ? "text-xl" : "text-lg")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" style={{ background: "rgba(45,36,103,0.45)" }} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={cx("bg-white w-full rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto", wide ? "sm:max-w-2xl" : "sm:max-w-md")}
        style={{ fontFamily: FONT_STACK }}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-2 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold" style={{ color: T.indigo }}>{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 focus:outline-none focus-visible:ring-4"
            style={{ backgroundColor: T.lavender, ringColor: T.teal }}
          >
            <X size={20} color={T.indigo} />
          </button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}

function BreathingCircle({ reducedMotion, seconds = 30, onDone }) {
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      onDone && onDone();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [running, remaining, onDone]);
  const phase = Math.floor((seconds - remaining) / 5) % 2 === 0 ? "Breathe in" : "Breathe out";
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        aria-hidden="true"
        className="rounded-full flex items-center justify-center"
        style={{
          width: 140,
          height: 140,
          backgroundColor: T.lavender,
          transform: running && !reducedMotion ? (Math.floor((seconds - remaining) / 5) % 2 === 0 ? "scale(1.15)" : "scale(0.9)") : "scale(1)",
          transition: reducedMotion ? "none" : "transform 5s ease-in-out",
        }}
      >
        <Waves size={40} color={T.teal} />
      </div>
      <p style={{ color: T.indigo, fontFamily: FONT_STACK }} className="font-medium">
        {running ? `${phase}… ${remaining}s left` : "Take one slow breath, if you'd like."}
      </p>
      <button
        onClick={() => { setRemaining(seconds); setRunning((r) => !r); }}
        className="rounded-full px-5 py-2 font-semibold focus:outline-none focus-visible:ring-4"
        style={{ backgroundColor: T.sage, color: T.white, fontFamily: FONT_STACK, ringColor: T.teal }}
      >
        {running ? "Stop" : "Start breathing exercise"}
      </button>
    </div>
  );
}

function LanguageSelector({ lang, setLang, compact, light }) {
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-4 shrink-0"
        style={
          light
            ? { backgroundColor: "transparent", color: T.white, border: "1px solid rgba(255,255,255,0.45)", fontFamily: FONT_STACK, ringColor: T.teal }
            : { backgroundColor: compact ? "transparent" : T.lavender, color: T.indigo, fontFamily: FONT_STACK, ringColor: T.teal }
        }
      >
        <Languages size={16} /> {current.label} <ChevronDown size={14} />
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 mt-2 w-40 rounded-xl bg-white shadow-lg z-40 py-2" style={{ border: `1px solid ${T.line}` }}>
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                onClick={() => { setLang(l.code); setOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:outline-none"
                style={{ color: T.indigo, fontFamily: FONT_STACK, fontWeight: l.code === lang ? 700 : 400 }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* A simplified, illustrative rendition of the national emblem — not an   */
/* official reproduction — used purely as a branding cue in this          */
/* prototype's chrome (strip, footer).                                    */
function AshokaEmblemMark({ size = 18, color = T.white }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="none" stroke={color} strokeWidth="1.4" />
      <circle cx="12" cy="12" r="1.6" fill={color} />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 12 + Math.cos(angle) * 3.2;
        const y1 = 12 + Math.sin(angle) * 3.2;
        const x2 = 12 + Math.cos(angle) * 8.6;
        const y2 = 12 + Math.sin(angle) * 8.6;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1" />;
      })}
    </svg>
  );
}

function LowBandwidthToggle({ lowBandwidth, setLowBandwidth }) {
  return (
    <label
      className="inline-flex items-center gap-2 cursor-pointer select-none"
      title="Low bandwidth mode — RAAHAT is designed to work on slow rural connections"
    >
      <span
        className="relative inline-flex items-center rounded-full shrink-0"
        style={{ width: 34, height: 18, backgroundColor: lowBandwidth ? T.teal : "rgba(255,255,255,0.35)", transition: "background-color 0.2s" }}
      >
        <input
          type="checkbox"
          checked={lowBandwidth}
          onChange={(e) => setLowBandwidth(e.target.checked)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Low bandwidth mode — RAAHAT is designed to work on slow rural connections"
        />
        <span
          aria-hidden="true"
          className="inline-block rounded-full shadow"
          style={{ width: 14, height: 14, backgroundColor: T.white, transform: lowBandwidth ? "translateX(18px)" : "translateX(2px)", transition: "transform 0.2s" }}
        />
      </span>
      <span className="underline decoration-dotted">Low bandwidth mode</span>
      <span className="hidden lg:inline opacity-80">— works on slow rural connections</span>
    </label>
  );
}

function GovStrip({ t, lang, setLang, lowBandwidth, setLowBandwidth }) {
  const [textSize, setTextSize] = useState(0);
  return (
    // the strip itself stays RAAHAT's own deep indigo; the thin blue line below is
    // the only nod to the official government colour — an accent, not the brand
    <div style={{ backgroundColor: T.indigo, color: T.white, fontFamily: FONT_STACK, borderBottom: `2px solid ${T.blueChip}` }} className="text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 sm:px-6 py-2">
        <div className="flex items-center gap-2">
          <AshokaEmblemMark />
          <span className="hidden sm:inline">भारत सरकार / Government of India</span>
          <span className="hidden lg:inline opacity-80">— सामाजिक न्याय और अधिकारिता मंत्रालय / Ministry of Social Justice and Empowerment</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <a href="#main" className="underline decoration-dotted hidden sm:inline">{t("skipToMain")}</a>
          <button onClick={() => setTextSize((s) => (s + 1) % 3)} className="underline decoration-dotted" aria-label="Change text size">
            A{textSize === 1 ? "+" : textSize === 2 ? "++" : ""}
          </button>
          <LowBandwidthToggle lowBandwidth={lowBandwidth} setLowBandwidth={setLowBandwidth} />
          <a href="tel:14566" className="underline decoration-dotted hidden sm:inline">NHAA 14566</a>
          <span className="hidden sm:inline-block self-stretch opacity-30" style={{ width: 1, backgroundColor: T.white }} />
          <LanguageSelector lang={lang} setLang={setLang} compact light />
          <QuickExitButton t={t} compact />
        </div>
      </div>
    </div>
  );
}

/* Measures a DOM node's rendered height and keeps it current across       */
/* resizes / reflows (e.g. the strip wrapping to two lines, or the text-   */
/* size toggle growing its font). Used so NavBar can sit flush below the   */
/* pinned government strip without a guessed pixel offset drifting out    */
/* of sync and causing the two bars to overlap.                            */
function useMeasuredHeight() {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }
    window.addEventListener("resize", measure);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  return [ref, height];
}

/* ---------------------------------------------------------------------- */
/* Persistent safety controls: Quick Exit + Urgent Help                   */
/* ---------------------------------------------------------------------- */
/* Quick Exit lives inline in the sticky header rows (not viewport-fixed)  */
/* so it never floats on top of the language selector — see GovStrip's    */
/* utility row on Landing, and CitizenTopBar in the citizen flow. Being   */
/* inside a sticky row keeps it reachable at any scroll position.         */
function QuickExitButton({ t, compact }) {
  const doExit = () => {
    try {
      window.location.href = "https://www.google.com";
    } catch (e) {
      /* no-op in sandboxed preview */
    }
  };
  return (
    <button
      onClick={doExit}
      className={cx(
        "inline-flex items-center gap-2 rounded-full font-semibold shadow-sm focus:outline-none focus-visible:ring-4 shrink-0",
        compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
      )}
      style={{ backgroundColor: T.white, color: T.indigo, border: `2px solid ${T.indigo}`, fontFamily: FONT_STACK, ringColor: T.teal }}
      aria-label={t("quickExit") + " — leaves this site immediately"}
    >
      <X size={compact ? 14 : 16} strokeWidth={2.6} /> {t("quickExit")}
    </button>
  );
}

function UrgentHelpSheet({ open, onClose, t, district }) {
  const centres = SUPPORT_CENTRES[district] || SUPPORT_CENTRES.Mumbai;
  const actions = [
    { icon: PhoneCall, label: "Call 14566", sub: "NHAA helpline — free, 24x7", tone: "coral" },
    { icon: Phone, label: "Call emergency services", sub: "Police / ambulance — 112", tone: "coral" },
    { icon: Stethoscope, label: "Nearby medical support", sub: centres.find((c) => c.category === "medical")?.name || "Nearest hospital", tone: "teal" },
    { icon: HandHeart, label: "Nearby Sakhi Centre", sub: centres.find((c) => c.category === "sakhi")?.name || "One Stop Centre", tone: "teal" },
    { icon: UserCheck, label: "Request urgent human review", sub: "An officer will be alerted right away", tone: "teal" },
  ];
  return (
    <Modal open={open} onClose={onClose} title={t("urgentHelp")}>
      <p className="mb-4" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>
        {/* API: POST /v1/urgent/request -> { requestId, dispatchedTo, ackAt } */}
        You can reach any of these right away. This does not share anything you haven't already told us.
      </p>
      <div className="flex flex-col gap-3">
        {actions.map((a, i) => (
          <button
            key={i}
            className="flex items-center gap-4 rounded-2xl p-4 text-left focus:outline-none focus-visible:ring-4"
            style={{
              backgroundColor: a.tone === "coral" ? T.coralBg : T.lavender,
              minHeight: 56,
              ringColor: T.teal,
            }}
          >
            <span className="rounded-full p-2.5" style={{ backgroundColor: a.tone === "coral" ? T.coral : T.teal }}>
              <a.icon size={22} color={T.white} strokeWidth={2.2} />
            </span>
            <span>
              <span className="block font-bold" style={{ color: a.tone === "coral" ? T.coralDark : T.indigo, fontFamily: FONT_STACK, fontSize: 17 }}>
                {a.label}
              </span>
              <span className="block text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>{a.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

function UrgentHelpFAB({ t, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="fixed z-40 bottom-4 right-3 sm:right-4 inline-flex items-center gap-2 rounded-full pl-3 pr-5 py-3.5 font-bold shadow-xl focus:outline-none focus-visible:ring-4"
      style={{ backgroundColor: T.coral, color: T.white, fontFamily: FONT_STACK, minHeight: 56, ringColor: T.coralDark }}
    >
      <span className="rounded-full p-1.5" style={{ backgroundColor: "rgba(255,255,255,0.25)" }}>
        <ShieldAlert size={20} strokeWidth={2.4} />
      </span>
      {t("urgentHelp")}
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* Hero — a faded Ashoka Chakra watermark in the right-hand hero space     */
/* (inline SVG, SMIL). Not a focal point: 24 accurate spokes at very low   */
/* opacity, rotating extremely slowly, with soft concentric ripples of     */
/* light breathing outward behind it and a quiet ministry/helpline text    */
/* lockup underneath. No Lion Capital detail — chakra only, it's the only  */
/* part of the emblem that reads cleanly at this size. Warm pastel palette */
/* throughout, deep indigo linework, amber used only as a small, sparing   */
/* accent at the hub and in the ripples — no blue here, that accent is     */
/* reserved for the government strip. Pure vector/SVG, so it stays light   */
/* on 2G. Motion can be paused; the SVG's own SMIL clock is paused as one  */
/* unit, and prefers-reduced-motion starts paused.                         */
/* ---------------------------------------------------------------------- */
function HeroScene({ reducedMotion }) {
  const svgRef = useRef(null);
  const [paused, setPaused] = useState(reducedMotion);

  useEffect(() => {
    setPaused(reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    try {
      if (paused && typeof svg.pauseAnimations === "function") svg.pauseAnimations();
      else if (!paused && typeof svg.unpauseAnimations === "function") svg.unpauseAnimations();
    } catch (e) {
      /* SMIL time-control API unsupported — the scene simply renders its first frame */
    }
  }, [paused]);

  const CX = 610;
  const CY = 215;
  const R = 150;
  const SPOKES = 24; // accurate Ashoka Chakra spoke count, 15° apart

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        viewBox="0 0 800 450"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        role="img"
        aria-label="A faded, large Ashoka Chakra watermark turning very slowly, with soft rings of light breathing outward behind it, and the words Ministry of Social Justice and Empowerment, National Helpline Against Atrocities in quiet faded type beneath it."
      >
        <defs>
          <linearGradient id="raahatSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={T.lavender} />
            <stop offset="55%" stopColor="#F3D8C8" />
            <stop offset="100%" stopColor={T.amberBg} />
          </linearGradient>
        </defs>

        {/* sky — a still, warm pastel wash; almost no motion in this scene */}
        <rect x="0" y="0" width="800" height="450" fill="url(#raahatSky)" />

        {/* concentric ripples of soft light, breathing outward behind the chakra */}
        <g fill="none" stroke="#FFD27A" strokeWidth="1.5">
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={CX} cy={CY} r="40" opacity="0">
              <animate attributeName="r" values="30;175" dur="9s" begin={`${i * 3}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.55;0" dur="9s" begin={`${i * 3}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>

        {/* the Ashoka Chakra — 24 spokes, low opacity, turning almost imperceptibly slowly */}
        <g opacity="0.16" stroke={T.indigo} fill="none">
          <animateTransform attributeName="transform" type="rotate" from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`} dur="240s" repeatCount="indefinite" />
          <circle cx={CX} cy={CY} r={R} strokeWidth="2.5" />
          <circle cx={CX} cy={CY} r={R - 14} strokeWidth="1" opacity="0.6" />
          {Array.from({ length: SPOKES }).map((_, i) => {
            const angle = (i * (360 / SPOKES) * Math.PI) / 180;
            const x1 = CX + Math.cos(angle) * 17;
            const y1 = CY + Math.sin(angle) * 17;
            const x2 = CX + Math.cos(angle) * (R - 8);
            const y2 = CY + Math.sin(angle) * (R - 8);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="2" />;
          })}
          <circle cx={CX} cy={CY} r="11" fill={T.indigo} stroke="none" />
        </g>
        {/* a small, sparing warm accent at the hub — the only amber in this scene */}
        <circle cx={CX} cy={CY} r="4.5" fill={T.amber} opacity="0.5" />

        {/* quiet watermark lockup — faded, never competing with the headline */}
        <g fill={T.white} opacity="0.4" style={{ fontFamily: FONT_STACK }} textAnchor="middle">
          <text x={CX} y="398" fontSize="12" fontWeight="700" letterSpacing="0.14em">MINISTRY OF SOCIAL JUSTICE &amp; EMPOWERMENT</text>
          <text x={CX} y="418" fontSize="12" fontWeight="700" letterSpacing="0.14em">NATIONAL HELPLINE AGAINST ATROCITIES</text>
        </g>
      </svg>

      <button
        onClick={() => setPaused((p) => !p)}
        className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium shadow focus:outline-none focus-visible:ring-4"
        style={{ backgroundColor: "rgba(20,15,42,0.5)", color: "rgba(255,255,255,0.9)", fontFamily: FONT_STACK, ringColor: T.teal }}
        aria-pressed={paused}
      >
        {paused ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
        {paused ? "Play motion" : "Pause motion"}
      </button>
    </div>
  );
}

/* Low bandwidth mode — replaces the hero scene with a flat, static        */
/* gradient. No SMIL, no shapes to paint each frame, nothing to pause.     */
function FlatGradientScene() {
  return (
    <div
      className="absolute inset-0"
      style={{ background: `linear-gradient(160deg, ${T.indigo} 0%, ${T.tealDark} 55%, ${T.coralDark} 100%)` }}
      role="img"
      aria-label="A calm, still gradient background. Low bandwidth mode is on, so decorative animation is switched off."
    />
  );
}

/* ---------------------------------------------------------------------- */
/* 3D — reactive voice orb                                                */
/* ---------------------------------------------------------------------- */
function VoiceOrb3D({ amplitudeRef, reducedMotion, listening }) {
  const mountRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const size = Math.min(mount.clientWidth || 260, 260);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(3, 4, 5);
    scene.add(dir);

    const geometry = new THREE.IcosahedronGeometry(1.15, 3);
    const basePositions = geometry.attributes.position.array.slice();
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(T.teal),
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 0.95,
    });
    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);

    stateRef.current = { renderer, scene, camera, orb, geometry, basePositions, raf: null };

    let t = 0;
    const animate = () => {
      stateRef.current.raf = requestAnimationFrame(animate);
      t += reducedMotion ? 0.004 : 0.02;
      const amp = amplitudeRef && amplitudeRef.current ? amplitudeRef.current : 0.05;
      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const ix = i * 3;
        const bx = basePositions[ix], by = basePositions[ix + 1], bz = basePositions[ix + 2];
        const len = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
        const nx = bx / len, ny = by / len, nz = bz / len;
        const noise = Math.sin(bx * 3 + t * 2) * Math.cos(by * 3 + t * 1.7) * 0.5 + 0.5;
        const disp = 1 + noise * amp * 1.4 + (reducedMotion ? 0 : Math.sin(t * 3 + i) * 0.01);
        pos.array[ix] = nx * (len * disp);
        pos.array[ix + 1] = ny * (len * disp);
        pos.array[ix + 2] = nz * (len * disp);
      }
      pos.needsUpdate = true;
      if (!reducedMotion) orb.rotation.y += 0.003;
      const targetColor = listening ? T.teal : T.sage;
      material.color.set(targetColor);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, listening]);

  return <div ref={mountRef} style={{ width: 220, height: 220 }} aria-hidden="true" />;
}

/* ---------------------------------------------------------------------- */
/* Mic amplitude + speech recognition hooks (graceful fallback)           */
/* ---------------------------------------------------------------------- */
function useMicAmplitude(active) {
  const amplitudeRef = useRef(0.05);
  const [micAvailable, setMicAvailable] = useState(true);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!active) {
      if (cleanupRef.current) cleanupRef.current();
      return;
    }
    let cancelled = false;
    let audioCtx, analyser, source, stream, rafId;
    async function start() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("no getUserMedia");
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i];
          const avg = sum / data.length / 255;
          amplitudeRef.current = Math.max(0.04, Math.min(1, avg * 1.8));
          rafId = requestAnimationFrame(tick);
        };
        tick();
      } catch (e) {
        setMicAvailable(false);
        // simulated gentle idle pulse so the orb never looks dead
        const idle = () => {
          amplitudeRef.current = 0.08 + Math.random() * 0.05;
          rafId = requestAnimationFrame(idle);
        };
        idle();
      }
    }
    start();
    cleanupRef.current = () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (source) source.disconnect();
      if (audioCtx) audioCtx.close().catch(() => {});
      if (stream) stream.getTracks().forEach((tr) => tr.stop());
    };
    return () => cleanupRef.current && cleanupRef.current();
  }, [active]);

  return { amplitudeRef, micAvailable };
}

/* Maps the app's UI language codes to a BCP-47 tag SpeechRecognition       */
/* understands. If recognition.lang doesn't match what the person is        */
/* actually speaking, results silently come back empty — no error fires.    */
const SPEECH_LANG_MAP = { en: "en-IN", hi: "hi-IN", bn: "bn-IN", ta: "ta-IN", te: "te-IN", mr: "mr-IN", kn: "kn-IN" };

function useSpeechRecognition(uiLang) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [errorReason, setErrorReason] = useState(null);
  const [resultCount, setResultCount] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);
  const recRef = useRef(null);
  const watchdogRef = useRef(null); // 15s "heard nothing at all" watchdog — only from an explicit start()
  const restartTimeoutRef = useRef(null); // pending auto-restart after Chrome's pause-triggered onend
  const finalTranscriptRef = useRef(""); // accumulates final text across internal restarts
  const shouldListenRef = useRef(false); // the user's intent — true between explicit start() and stop()
  const hasResultRef = useRef(false); // at least one onresult since the last explicit start()

  useEffect(() => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) {
      setSupported(false);
      setErrorReason("unsupported");
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = SPEECH_LANG_MAP[uiLang] || "en-IN";

    rec.onstart = () => {
      console.log("[SPEECH] onstart");
      setLastEvent("onstart");
      setListening(true);
    };
    rec.onaudiostart = () => {
      console.log("[SPEECH] onaudiostart");
      setLastEvent("onaudiostart");
    };
    rec.onspeechstart = () => {
      console.log("[SPEECH] onspeechstart");
      setLastEvent("onspeechstart");
    };
    rec.onresult = (e) => {
      console.log("[SPEECH] onresult", e);
      setLastEvent("onresult");
      hasResultRef.current = true;
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalTranscriptRef.current += res[0].transcript;
        else interim += res[0].transcript;
      }
      setTranscript((finalTranscriptRef.current + interim).trim());
      setResultCount((n) => n + 1);
    };
    rec.onnomatch = () => {
      console.log("[SPEECH] onnomatch");
      setLastEvent("onnomatch");
    };
    rec.onerror = (e) => {
      const errType = (e && e.error) || "unknown";
      console.log("[SPEECH] onerror:", errType);
      setLastEvent(`onerror:${errType}`);
      shouldListenRef.current = false;
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      setSupported(false);
      setListening(false);
      setErrorReason(errType);
    };
    rec.onend = () => {
      console.log("[SPEECH] onend");
      setLastEvent("onend");
      // Chrome stops recognition after a pause even with continuous=true. If the
      // user hasn't explicitly stopped and no error occurred, this is that quirk —
      // restart quietly instead of treating a silent onend as a failure.
      if (shouldListenRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          try {
            rec.start();
          } catch (err) {
            console.log("[SPEECH] auto-restart failed:", err);
          }
        }, 250);
      } else {
        setListening(false);
      }
    };

    recRef.current = rec;
    return () => {
      shouldListenRef.current = false;
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      try { rec.stop(); } catch (e) {}
    };
  }, []);

  // keep recognition.lang matched to the selected UI language (takes effect on next start)
  useEffect(() => {
    if (recRef.current) {
      recRef.current.lang = SPEECH_LANG_MAP[uiLang] || "en-IN";
      console.log("[SPEECH] lang set to", recRef.current.lang);
    }
  }, [uiLang]);

  const start = useCallback(() => {
    if (!recRef.current) return;
    finalTranscriptRef.current = "";
    hasResultRef.current = false;
    shouldListenRef.current = true;
    setTranscript("");
    setResultCount(0);
    setErrorReason(null);
    setSupported(true);
    try {
      recRef.current.start();
      // Only a genuine 15s stretch with zero results — not a routine pause-triggered
      // onend — should send the citizen to the typing fallback.
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      watchdogRef.current = setTimeout(() => {
        if (!hasResultRef.current && shouldListenRef.current) {
          console.log("[SPEECH] no results after 15s — falling back to typing");
          shouldListenRef.current = false;
          if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
          }
          try { recRef.current.stop(); } catch (e) {}
          setSupported(false);
          setListening(false);
          setErrorReason("no-speech-15s");
        }
      }, 15000);
    } catch (e) {
      console.log("[SPEECH] start failed:", e);
      setSupported(false);
      setErrorReason((e && e.name) || "start-failed");
    }
  }, []);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (!recRef.current) return;
    try { recRef.current.stop(); } catch (e) {}
    setListening(false);
  }, []);

  return {
    supported, listening, transcript, setTranscript, start, stop, errorReason,
    resultCount, lastEvent, resolvedLang: SPEECH_LANG_MAP[uiLang] || "en-IN",
  };
}

/* ---------------------------------------------------------------------- */
/* Landing page                                                           */
/* ---------------------------------------------------------------------- */
function NavBar({ t, onOfficerLogin, onGetHelp, stickyTop = 0 }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky z-30 bg-white/95 backdrop-blur" style={{ top: stickyTop, borderBottom: `1px solid ${T.line}` }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="rounded-xl p-2" style={{ backgroundColor: T.lavender }}>
            <Landmark size={22} color={T.indigo} />
          </span>
          <span className="text-xl font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>RAAHAT</span>
        </div>
        <div className="hidden md:flex items-center gap-7" style={{ fontFamily: FONT_STACK }}>
          {[t("howItWorks"), t("channels"), t("forOfficials"), t("architecture")].map((label) => (
            <a key={label} href="#" onClick={(e) => e.preventDefault()} className="font-medium" style={{ color: T.indigo }}>
              {label}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={onOfficerLogin} className="rounded-xl px-4 py-2.5 font-semibold" style={{ backgroundColor: T.indigo, color: T.white, fontFamily: FONT_STACK }}>
            {t("officerLogin")}
          </button>
        </div>
        <button className="md:hidden rounded-lg p-2" style={{ backgroundColor: T.lavender }} onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <ChevronUp size={20} color={T.indigo} /> : <ChevronDown size={20} color={T.indigo} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3" style={{ fontFamily: FONT_STACK }}>
          {[t("howItWorks"), t("channels"), t("forOfficials"), t("architecture")].map((label) => (
            <a key={label} href="#" onClick={(e) => e.preventDefault()} className="font-medium" style={{ color: T.indigo }}>{label}</a>
          ))}
          <button onClick={onOfficerLogin} className="rounded-xl px-4 py-3 font-semibold text-left" style={{ backgroundColor: T.indigo, color: T.white }}>
            {t("officerLogin")}
          </button>
        </div>
      )}
    </nav>
  );
}

function Hero({ t, lang, reducedMotion, lowBandwidth, onGetHelp, onTrack }) {
  return (
    <section className="relative w-full overflow-hidden" style={{ height: "70vh", minHeight: 520 }}>
      {/* full-bleed scene, edge to edge, behind everything */}
      <div className="absolute inset-0">
        {lowBandwidth ? <FlatGradientScene /> : <HeroScene reducedMotion={reducedMotion} />}
      </div>

      {/* scrim: keeps the overlaid text readable against the pastel wash and the */}
      {/* faded chakra watermark, heaviest on the text side and easing off right */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "linear-gradient(100deg, rgba(20,15,42,0.82) 0%, rgba(20,15,42,0.62) 40%, rgba(20,15,42,0.32) 68%, rgba(20,15,42,0.08) 100%)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "linear-gradient(0deg, rgba(15,11,32,0.4) 0%, rgba(15,11,32,0) 30%)" }}
      />

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
        <div className="max-w-xl py-10">
          <p className="font-semibold mb-3 text-sm" style={{ color: "#BFEAE0", fontFamily: FONT_STACK }}>National Helpline Against Atrocities</p>
          <h1
            className={cx("font-bold leading-tight mb-4", lowBandwidth ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl")}
            style={{ color: T.white, fontFamily: FONT_STACK, textShadow: "0 2px 20px rgba(0,0,0,0.35)" }}
          >
            {t("heroHeadline")}
          </h1>
          {/* rotating line is motion + decorative flourish — skipped in low bandwidth mode */}
          {!lowBandwidth && <RotatingLine lang={lang} reducedMotion={reducedMotion} />}
          <p className={cx("mb-6 max-w-lg", lowBandwidth ? "text-xl" : "text-lg")} style={{ color: "rgba(255,255,255,0.9)", fontFamily: FONT_STACK }}>
            RAAHAT listens carefully, understands what you're going through, and connects you to a trained human — quietly and at your pace.
          </p>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <PrimaryButton icon={Heart} variant="indigo" onClick={onGetHelp}>{t("getHelpNow")}</PrimaryButton>
            <PrimaryButton icon={ClipboardList} variant="outlineLight" onClick={onTrack}>{t("trackCase")}</PrimaryButton>
          </div>
          <a href="tel:14566" className="inline-flex items-center gap-3 rounded-2xl px-5 py-3" style={{ backgroundColor: "rgba(255,255,255,0.96)", backdropFilter: "blur(6px)" }}>
            <PhoneCall size={26} color={T.indigo} />
            <span>
              <span className={cx("block font-bold", lowBandwidth ? "text-3xl" : "text-2xl")} style={{ color: T.indigo, fontFamily: FONT_STACK }}>14566</span>
              <span className={cx("block", lowBandwidth ? "text-base" : "text-sm")} style={{ color: "#5B5482", fontFamily: FONT_STACK }}>Free, 24×7 helpline</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

function StatBand() {
  const lowBandwidth = useLowBandwidth();
  const stats = [
    { value: "1.8L+", label: "Atrocity cases registered nationally each year" },
    { value: "62%", label: "Victims who never formally report what happened" },
    { value: "9 days", label: "Average time before a first support contact today" },
    { value: "<10 min", label: "Time for RAAHAT to route a case for human review" },
  ];
  const accents = [T.teal, T.sage, T.lavender, T.coral];
  return (
    <section style={{ backgroundColor: T.indigo }} className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={s.label} className="text-center">
            {/* decorative accent bar — hidden in low bandwidth mode */}
            {!lowBandwidth && <span className="block mx-auto mb-3 rounded-full" style={{ width: 36, height: 4, backgroundColor: accents[i % accents.length] }} />}
            <p className={cx("font-bold", lowBandwidth ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl")} style={{ color: T.white, fontFamily: FONT_STACK }}>{s.value}</p>
            <p className={cx("mt-2", lowBandwidth ? "text-base" : "text-sm")} style={{ color: "#C9C3E8", fontFamily: FONT_STACK }}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks({ t }) {
  const steps = [
    { icon: Mic, title: "Voice or text is shared", body: "A person speaks or types, in the language they're most comfortable with." },
    { icon: Activity, title: "Speech + NLP analysis", body: "Deterministic rules read the words and speech patterns — no black box." },
    { icon: ShieldAlert, title: "SVI category & indicators", body: "A Stress Vulnerability Index and plain-language indicators are produced." },
    { icon: HandHeart, title: "Calm support options", body: "The citizen sees supportive next steps — never a score or a label." },
    { icon: UserCheck, title: "Human officer reviews & acts", body: "An authorised officer confirms and decides — always a human in the loop." },
  ];
  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: T.bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading eyebrow="Process" title="How RAAHAT works" subtitle="A calm, explainable path from a first word to human support." align="center" />
        <div className="mt-12 grid md:grid-cols-5 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="flex flex-col items-center text-center gap-3">
              <span className="rounded-2xl p-4" style={{ backgroundColor: TINT_CYCLE[i % TINT_CYCLE.length] }}>
                <s.icon size={28} color={T.indigo} strokeWidth={2} />
              </span>
              <h3 className="font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>{s.title}</h3>
              <p className="text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>{s.body}</p>
              {i < steps.length - 1 && <ArrowRight className="hidden md:block mt-1" size={18} color={T.sage} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChannelsStrip() {
  const channels = [
    { icon: PhoneCall, name: "14566 Helpline", body: "Talk to a human directly; RAAHAT supports the officer in real time." },
    { icon: Phone, name: "IVRS (feature phone)", body: "Press-key voice menu — no smartphone or internet needed." },
    { icon: MessageCircle, name: "Chatbot", body: "Text conversation on WhatsApp or SMS-based channels." },
    { icon: Globe, name: "Integrated Portal", body: "Web access for citizens, NGOs, and welfare partners." },
    { icon: Sparkles, name: "Mobile app", body: "Offline-friendly capture that syncs once connected." },
  ];
  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: T.white }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading eyebrow="Reach" title="One assessment layer, every channel" subtitle="RAAHAT sits behind the ways people already reach out." />
        <div className="mt-10 grid sm:grid-cols-2 md:grid-cols-5 gap-5">
          {channels.map((c, i) => (
            <Card key={c.name} className="flex flex-col gap-3" style={{ backgroundColor: TINT_CYCLE[i % TINT_CYCLE.length], border: "none" }}>
              <c.icon size={26} color={T.indigo} />
              <h3 className="font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>{c.name}</h3>
              <p className="text-sm" style={{ color: "#4A4472", fontFamily: FONT_STACK }}>{c.body}</p>
            </Card>
          ))}
        </div>
        <div className="mt-8 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4" style={{ backgroundColor: T.lavender }}>
          <div className="flex items-center gap-3">
            <Phone size={28} color={T.indigo} />
            <p className="font-semibold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>No smartphone or data connection? IVRS covers the full intake by voice.</p>
          </div>
          <a href="#ivrs" className="inline-flex items-center gap-1 text-sm font-bold underline" style={{ color: T.teal, fontFamily: FONT_STACK }}>
            See the press-key flow <ChevronRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* IVRS — a first-class path, not just one card in the channels strip.    */
/* Most rural users, with a feature phone and no internet, will actually  */
/* reach RAAHAT this way: dial 14566 and complete the whole intake by     */
/* voice menu. This section spells out the press-key flow explicitly.     */
/* ---------------------------------------------------------------------- */
function IVRSKeypadGraphic() {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
  return (
    <div className="mx-auto rounded-3xl p-5" style={{ backgroundColor: "rgba(255,255,255,0.06)", maxWidth: 220 }}>
      <div className="rounded-xl mb-4 px-3 py-2 text-center" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
        <span className="font-mono text-lg tracking-widest" style={{ color: T.white, fontFamily: MONO_STACK }}>14566</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {keys.map((k) => (
          <span
            key={k}
            className="flex items-center justify-center rounded-lg font-semibold"
            style={{ backgroundColor: "rgba(255,255,255,0.12)", color: T.white, fontFamily: FONT_STACK, aspectRatio: "1", fontSize: 15 }}
          >
            {k}
          </span>
        ))}
      </div>
      <p className="text-xs text-center mt-3" style={{ color: "#C9C3E8", fontFamily: FONT_STACK }}>Any phone. No internet. No app.</p>
    </div>
  );
}

function IVRSSection() {
  const flow = [
    { key: "Dial", title: "Dial 14566", body: "Toll-free, works from any phone, 24×7 — no smartphone or data connection needed." },
    { key: "1–7", title: "Press a number to choose your language", body: "A short voice menu reads out the options: Hindi, English, Bengali, Tamil, Telugu, Marathi, Kannada." },
    { key: "1/2/3", title: "Press 1 to report, 2 to check a case, 3 for an officer", body: "The menu adapts to what's needed right now, in the caller's own language." },
    { key: "1/2", title: "Answer a few short voice prompts", body: "Press 1 for yes and 2 for no, or simply speak after the beep — at your own pace, skipping anything you'd rather not answer." },
    { key: "✓", title: "A trained officer calls back", body: "The same assessment and human-review pipeline as the app and web portal — just reached entirely by voice." },
  ];
  return (
    <section id="ivrs" className="py-16 sm:py-20" style={{ backgroundColor: T.indigo }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="rounded-xl p-2" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <Phone size={22} color={T.white} />
          </span>
          <p className="font-semibold text-sm" style={{ color: "#BFEAE0", fontFamily: FONT_STACK }}>No smartphone? No internet? No problem.</p>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4" style={{ color: T.white, fontFamily: FONT_STACK }}>
          IVRS: help by voice, from any phone
        </h2>
        <p className="text-lg max-w-2xl mb-10" style={{ color: "#C9C3E8", fontFamily: FONT_STACK }}>
          This is how most rural users will actually reach RAAHAT. A victim with a basic feature phone and no
          internet can call 14566 and complete the entire intake through a simple press-key voice menu — no app,
          no data, no literacy required.
        </p>
        <div className="grid lg:grid-cols-[220px,1fr] gap-10 items-start">
          <IVRSKeypadGraphic />
          <div className="flex flex-col gap-4">
            {flow.map((step) => (
              <div key={step.title} className="flex items-start gap-4 rounded-2xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                <span
                  className="shrink-0 rounded-full flex items-center justify-center font-mono text-xs font-bold text-center"
                  style={{ width: 44, height: 44, backgroundColor: T.teal, color: T.white, fontFamily: MONO_STACK, padding: "0 4px" }}
                >
                  {step.key}
                </span>
                <div>
                  <p className="font-bold" style={{ color: T.white, fontFamily: FONT_STACK }}>{step.title}</p>
                  <p className="text-sm mt-1" style={{ color: "#C9C3E8", fontFamily: FONT_STACK }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RolesSection() {
  const roles = [
    { icon: PhoneCall, name: "Helpline Officer", scope: "Reviews new cases, contacts citizens, escalates urgent ones." },
    { icon: Stethoscope, name: "Counsellor", scope: "Accesses assigned cases, logs sessions, updates follow-ups." },
    { icon: Building2, name: "District Administrator", scope: "Oversees district case load, assigns officers, tracks SLAs." },
    { icon: HandHeart, name: "Welfare Partner", scope: "Views referred cases in their scope; cannot override status." },
    { icon: UserCog, name: "System Administrator", scope: "Manages roles, access, and platform configuration." },
  ];
  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: T.bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading eyebrow="Access" title="Built for every role" subtitle="Role-based access keeps sensitive details in the right hands." />
        <div className="mt-10 grid sm:grid-cols-2 md:grid-cols-5 gap-5">
          {roles.map((r, i) => (
            <Card key={r.name} className="flex flex-col gap-3" style={{ borderTop: `3px solid ${[T.teal, T.sage, T.indigo, T.coral, T.amber][i % 5]}` }}>
              <r.icon size={24} color={T.indigo} />
              <h3 className="font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>{r.name}</h3>
              <p className="text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>{r.scope}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  const tiers = [
    { icon: Mic, title: "Channel & Capture", body: "14566, IVRS, chatbot, portal, and app all feed one intake pipeline." },
    { icon: Activity, title: "Intelligence", body: "Speech analytics, NLP indicator extraction, deterministic SVI scoring." },
    { icon: Users, title: "Application", body: "Role-based dashboards, immutable audit logs, referral workflows." },
  ];
  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: T.white }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading eyebrow="How it's built" title="Three tiers, one auditable pipeline" align="center" />
        <div className="mt-10 flex flex-col md:flex-row gap-4 items-stretch">
          {tiers.map((tier, i) => (
            <React.Fragment key={tier.title}>
              <div className="flex-1 rounded-3xl p-6" style={{ backgroundColor: T.lavender }}>
                <tier.icon size={28} color={T.indigo} />
                <h3 className="font-bold mt-3" style={{ color: T.indigo, fontFamily: FONT_STACK }}>{tier.title}</h3>
                <p className="text-sm mt-2" style={{ color: "#4A4472", fontFamily: FONT_STACK }}>{tier.body}</p>
              </div>
              {i < tiers.length - 1 && (
                <div className="hidden md:flex items-center justify-center">
                  <ArrowRight size={22} color={T.sage} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

function LandingFooter({ onOfficerLogin }) {
  return (
    <footer style={{ backgroundColor: T.indigo, color: T.white, fontFamily: FONT_STACK }} className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AshokaEmblemMark />
            <h4 className="font-bold">RAAHAT</h4>
          </div>
          <p className="text-sm" style={{ color: "#C9C3E8" }}>सामाजिक न्याय और अधिकारिता मंत्रालय</p>
          <p className="text-sm" style={{ color: "#C9C3E8" }}>Ministry of Social Justice and Empowerment</p>
          <p className="text-sm mt-2" style={{ color: "#C9C3E8" }}>NHAA 14566 — National Helpline Against Atrocities, free &amp; 24×7</p>
        </div>
        <div>
          <h4 className="font-bold mb-2">Stakeholders</h4>
          <ul className="text-sm space-y-1" style={{ color: "#C9C3E8" }}>
            <li>State Governments & UTs</li>
            <li>District Administrations</li>
            <li>Counsellors & Mental Health Professionals</li>
            <li>Law Enforcement Agencies</li>
            <li>Rehabilitation & Welfare Authorities</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-2">For citizens</h4>
          <ul className="text-sm space-y-1" style={{ color: "#C9C3E8" }}>
            <li>Get help now</li>
            <li>Track my case</li>
            <li>Consent Center</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-2">For officials</h4>
          <button onClick={onOfficerLogin} className="text-sm underline">Officer Login</button>
        </div>
      </div>
      <p className="text-center text-xs mt-10" style={{ color: "#8F88BB" }}>Prototype built for Smart India Hackathon — demonstration data only.</p>
    </footer>
  );
}

function Landing({ t, lang, setLang, reducedMotion, onGetHelp, onTrack, onOfficerLogin }) {
  const [govRef, govHeight] = useMeasuredHeight();
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const effectiveReducedMotion = reducedMotion || lowBandwidth;
  return (
    <LowBandwidthContext.Provider value={lowBandwidth}>
      <div>
        <div ref={govRef} className="sticky top-0 z-50">
          <GovStrip t={t} lang={lang} setLang={setLang} lowBandwidth={lowBandwidth} setLowBandwidth={setLowBandwidth} />
        </div>
        <NavBar t={t} onOfficerLogin={onOfficerLogin} onGetHelp={onGetHelp} stickyTop={govHeight} />
        {lowBandwidth && (
          <div className="text-center text-sm font-semibold py-2 px-4" style={{ backgroundColor: T.amberBg, color: T.amber, fontFamily: FONT_STACK }}>
            Low bandwidth mode is on — animation is paused and text is larger, so RAAHAT stays usable on slow rural connections.
          </div>
        )}
        <main id="main">
          <Hero t={t} lang={lang} reducedMotion={effectiveReducedMotion} lowBandwidth={lowBandwidth} onGetHelp={onGetHelp} onTrack={onTrack} />
          <IVRSSection />
          <StatBand />
          <HowItWorks t={t} />
          <ChannelsStrip />
          <RolesSection />
          <ArchitectureSection />
        </main>
        <LandingFooter onOfficerLogin={onOfficerLogin} />
      </div>
    </LowBandwidthContext.Provider>
  );
}

/* ---------------------------------------------------------------------- */
/* Citizen flow — shared shell                                            */
/* ---------------------------------------------------------------------- */
function OfflineToggleButton({ isOffline, setForcedOffline }) {
  return (
    <button
      onClick={() => setForcedOffline((o) => !o)}
      className="rounded-full p-2.5 focus:outline-none focus-visible:ring-4 shrink-0"
      style={{ backgroundColor: isOffline ? T.coralBg : T.lavender, ringColor: T.teal, minWidth: 44, minHeight: 44 }}
      aria-pressed={isOffline}
      aria-label={isOffline ? "Offline (simulated) — tap to reconnect" : "Simulate offline to preview the offline flow"}
      title={isOffline ? "Offline (simulated) — tap to reconnect" : "Simulate offline"}
    >
      {isOffline ? <WifiOff size={18} color={T.coralDark} /> : <Wifi size={18} color={T.indigo} />}
    </button>
  );
}

function CitizenTopBar({ t, lang, setLang, onBack, onExitToLanding, title, isOffline, setForcedOffline }) {
  return (
    <div className="sticky top-0 z-30 bg-white" style={{ borderBottom: `1px solid ${T.line}` }}>
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 px-4 py-3">
        <button onClick={onBack} aria-label="Go back" className="rounded-full p-2.5 focus:outline-none focus-visible:ring-4 shrink-0" style={{ backgroundColor: T.lavender, ringColor: T.teal, minWidth: 44, minHeight: 44 }}>
          <ArrowLeft size={20} color={T.indigo} />
        </button>
        <button onClick={onExitToLanding} className="font-bold text-lg truncate" style={{ color: T.indigo, fontFamily: FONT_STACK }}>
          {title || "RAAHAT"}
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <OfflineToggleButton isOffline={isOffline} setForcedOffline={setForcedOffline} />
          <LanguageSelector lang={lang} setLang={setLang} compact />
          <QuickExitButton t={t} compact />
        </div>
      </div>
    </div>
  );
}

function CitizenShell({ children, t, lang, setLang, onBack, onExitToLanding, title, district, onOpenConsent, urgentOpen, setUrgentOpen, isOffline, setForcedOffline }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: T.bg }}>
      <CitizenTopBar t={t} lang={lang} setLang={setLang} onBack={onBack} onExitToLanding={onExitToLanding} title={title} isOffline={isOffline} setForcedOffline={setForcedOffline} />
      {isOffline && (
        <div className="text-center text-sm font-semibold py-2 px-4" style={{ backgroundColor: T.coralBg, color: T.coralDark, fontFamily: FONT_STACK }}>
          You're offline. What you share is saved on this device and sent automatically once the connection returns.
        </div>
      )}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 pb-28">{children}</main>
      <div className="max-w-2xl mx-auto w-full px-4 pb-4">
        <button onClick={onOpenConsent} className="text-sm underline" style={{ color: T.teal, fontFamily: FONT_STACK }}>Consent Center</button>
      </div>
      <UrgentHelpFAB t={t} onOpen={() => setUrgentOpen(true)} />
      <UrgentHelpSheet open={urgentOpen} onClose={() => setUrgentOpen(false)} t={t} district={district} />
    </div>
  );
}

function StepDots({ total, current }) {
  return (
    <div className="flex items-center gap-2 mb-6" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className="rounded-full" style={{ width: i === current ? 24 : 8, height: 8, backgroundColor: i <= current ? T.teal : T.lavender, transition: "width .2s" }} />
      ))}
    </div>
  );
}

/* Screen: choose how to share ------------------------------------------ */
function ChooseHowToShare({ t, onSpeak, onType, onGuided, onNotReady }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: T.indigo, fontFamily: FONT_STACK }}>How would you like to share?</h1>
      <p className="mb-6" style={{ color: "#5B5482", fontFamily: FONT_STACK, fontSize: 17 }}>{t("shareOnlySafe")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button onClick={onSpeak} className="rounded-3xl p-8 flex flex-col items-center gap-3 text-center focus:outline-none focus-visible:ring-4" style={{ backgroundColor: T.lavender, minHeight: 180, ringColor: T.teal }}>
          <span className="rounded-full p-4" style={{ backgroundColor: T.white }}><Mic size={32} color={T.indigo} /></span>
          <span className="text-xl font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>{t("speakChoice")}</span>
          <span className="text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>Talk it through, at your pace</span>
        </button>
        <button onClick={onType} className="rounded-3xl p-8 flex flex-col items-center gap-3 text-center focus:outline-none focus-visible:ring-4" style={{ backgroundColor: "#E4EEEC", minHeight: 180, ringColor: T.teal }}>
          <span className="rounded-full p-4" style={{ backgroundColor: T.white }}><Type size={32} color={T.indigo} /></span>
          <span className="text-xl font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>{t("typeChoice")}</span>
          <span className="text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>Write in your own words</span>
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <button onClick={onGuided} className="flex items-center gap-3 rounded-2xl p-4 text-left" style={{ backgroundColor: T.white, border: `1px solid ${T.line}`, minHeight: 56 }}>
          <HelpCircle size={22} color={T.teal} />
          <span style={{ color: T.indigo, fontFamily: FONT_STACK, fontWeight: 600 }}>Guide me with simple questions</span>
        </button>
        <button onClick={onNotReady} className="flex items-center gap-3 rounded-2xl p-4 text-left" style={{ backgroundColor: T.white, border: `1px solid ${T.line}`, minHeight: 56 }}>
          <Circle size={22} color={T.sage} />
          <span style={{ color: T.indigo, fontFamily: FONT_STACK, fontWeight: 600 }}>I'm not ready yet</span>
        </button>
      </div>
    </div>
  );
}

/* Screen: I'm not ready yet ---------------------------------------------*/
function NotReadyScreen({ t, onExitToLanding, onOpenUrgent }) {
  return (
    <div className="text-center flex flex-col items-center gap-5 py-10">
      <span className="rounded-full p-5" style={{ backgroundColor: T.lavender }}><Sun size={36} color={T.indigo} /></span>
      <h1 className="text-2xl font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>That's okay. There's no rush.</h1>
      <p className="max-w-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK, fontSize: 17 }}>
        You can come back to RAAHAT any time — nothing you've done so far has been sent anywhere. 14566 is always open if you change your mind.
      </p>
      <PrimaryButton variant="outline" onClick={onExitToLanding}>Return to the homepage</PrimaryButton>
    </div>
  );
}

/* Screen: voice capture ---------------------------------------------- */
/* A realistic distressed statement for demo purposes. Loading it produces */
/* a real, non-trivial SVI: fear + intimidation + threats-to-family +      */
/* social-boycott indicators score into the "High" tier deterministically. */
const SAMPLE_STATEMENT =
  "They keep threatening our family since the incident happened, and I feel so scared for my children. The whole village has stopped talking to us and won't let us draw water from the common well. I don't know who to trust anymore.";

function micErrorMessage(reason) {
  switch (reason) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone permission was blocked here (common in an embedded preview) — let's continue by typing instead.";
    case "no-speech-15s":
      return "We haven't heard anything for 15 seconds — let's continue by typing instead.";
    case "timeout":
      return "We didn't hear anything back from the microphone — let's continue by typing instead.";
    case "unsupported":
    case "start-failed":
      return "Voice input isn't available in this browser — let's continue by typing instead.";
    case "no-speech":
      return "We didn't catch any speech — you can try again, or continue by typing.";
    case "audio-capture":
      return "No microphone was found on this device — let's continue by typing instead.";
    default:
      return "We couldn't access voice on this device or browser, so let's continue by typing — nothing is lost.";
  }
}

function VoiceCapture({ t, lang, reducedMotion, transcript, setTranscript, onContinue }) {
  const {
    supported, listening, transcript: liveTranscript, setTranscript: setLiveTranscript,
    start, stop, errorReason, resultCount, resolvedLang,
  } = useSpeechRecognition(lang);
  const { amplitudeRef, micAvailable } = useMicAmplitude(listening);
  const [seconds, setSeconds] = useState(0);
  const [usedFallback, setUsedFallback] = useState(!supported);
  const [manualText, setManualText] = useState(transcript || "");

  useEffect(() => {
    if (!listening) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [listening]);

  useEffect(() => {
    if (liveTranscript) setManualText(liveTranscript);
  }, [liveTranscript]);

  useEffect(() => {
    if (!supported) setUsedFallback(true);
  }, [supported]);

  const useSample = () => {
    setManualText(SAMPLE_STATEMENT);
    setLiveTranscript(SAMPLE_STATEMENT);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  if (usedFallback) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Let's write it instead</h1>
        <p className="mb-4 text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>{micErrorMessage(errorReason)}</p>
        <textarea
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          rows={8}
          placeholder="Share what feels safe to share…"
          className="w-full rounded-2xl p-4 text-lg focus:outline-none focus-visible:ring-4"
          style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK, color: T.indigo, ringColor: T.teal }}
        />
        <button
          onClick={useSample}
          className="mt-3 inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold"
          style={{ backgroundColor: T.lavender, color: T.indigo, fontFamily: FONT_STACK }}
        >
          <Sparkles size={16} /> Use sample statement
        </button>
        <div className="mt-6">
          <PrimaryButton full icon={ArrowRight} onClick={() => onContinue(manualText)} disabled={!manualText.trim()}>Continue</PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-2xl font-bold mb-2" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Speak whenever you're ready</h1>
      <p className="mb-6 text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>{t("shareOnlySafe")}</p>
      <div className="rounded-full mb-4" style={{ backgroundColor: T.lavender, padding: 8 }}>
        <VoiceOrb3D amplitudeRef={amplitudeRef} reducedMotion={reducedMotion} listening={listening} />
      </div>
      {!micAvailable && (
        <p className="text-xs mb-2 inline-flex items-center gap-1" style={{ color: T.amber, fontFamily: FONT_STACK }}>
          <Info size={14} /> Microphone access unavailable — showing a gentle idle animation instead.
        </p>
      )}
      <p className="font-mono text-lg mb-4" style={{ color: T.indigo, fontFamily: MONO_STACK }}>{mm}:{ss}</p>
      {(listening || seconds > 0) && (
        <p className="font-mono text-xs mb-4 px-3 py-1.5 rounded-full" style={{ color: T.teal, backgroundColor: T.tealBg, fontFamily: MONO_STACK }}>
          [SPEECH] listening: {String(listening)} · lang: {resolvedLang} · results: {resultCount} · error: {errorReason || "none"}
        </p>
      )}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={listening ? stop : start}
          className="rounded-full p-5 focus:outline-none focus-visible:ring-4"
          style={{ backgroundColor: listening ? T.coral : T.indigo, ringColor: T.teal }}
          aria-label={listening ? "Pause recording" : "Hold to speak"}
        >
          {listening ? <Pause size={28} color={T.white} /> : <Mic size={28} color={T.white} />}
        </button>
        <button
          onClick={useSample}
          className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold focus:outline-none focus-visible:ring-4"
          style={{ backgroundColor: T.lavender, color: T.indigo, fontFamily: FONT_STACK, ringColor: T.teal }}
        >
          <Sparkles size={16} /> Use sample statement
        </button>
        {seconds > 0 && (
          <button onClick={() => { setManualText(""); setLiveTranscript(""); setSeconds(0); }} className="rounded-full p-4" style={{ backgroundColor: T.lavender }} aria-label="Delete recording">
            <Trash2 size={22} color={T.indigo} />
          </button>
        )}
      </div>
      <div className="w-full text-left">
        <label className="block text-sm font-semibold mb-2" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Live transcript (editable)</label>
        <textarea
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          rows={6}
          placeholder="Your words will appear here as you speak…"
          className="w-full rounded-2xl p-4 focus:outline-none focus-visible:ring-4"
          style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK, color: T.indigo, ringColor: T.teal }}
        />
      </div>
      <div className="mt-2 w-full flex flex-col gap-3">
        <PrimaryButton full icon={ArrowRight} onClick={() => onContinue(manualText)} disabled={!manualText.trim()}>Continue</PrimaryButton>
        <button onClick={() => setUsedFallback(true)} className="text-sm underline" style={{ color: T.teal, fontFamily: FONT_STACK }}>Switch to typing instead</button>
      </div>
    </div>
  );
}

/* Screen: text capture ---------------------------------------------- */
function TextCapture({ t, transcript, onContinue }) {
  const [text, setText] = useState(transcript || "");
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Write in your own words</h1>
      <p className="mb-4 text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>{t("shareOnlySafe")}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="Start whenever you're ready…"
        className="w-full rounded-2xl p-4 text-lg focus:outline-none focus-visible:ring-4"
        style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK, color: T.indigo, ringColor: T.teal }}
      />
      <div className="mt-6">
        <PrimaryButton full icon={ArrowRight} onClick={() => onContinue(text)} disabled={!text.trim()}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

/* Screen: guided questions ---------------------------------------------- */
function GuidedQuestions({ t, reducedMotion, answers, setAnswers, onContinue, onOpenUrgent, demoOverride, setDemoOverride }) {
  const [step, setStep] = useState(0);
  const questions = [
    { key: "safe", q: "Are you safe right now?", options: ["Yes", "No", "Not sure"] },
    { key: "needType", q: "What kind of help do you need?", options: ["stressed or scared", "medical", "legal", "feel unsafe", "not sure"] },
    { key: "contact", q: "Would a trained person contact you?", options: ["Yes", "No", "Later"] },
  ];
  const q = questions[step];

  const choose = (val) => {
    const next = { ...answers, [q.key]: val };
    setAnswers(next);
    if (q.key === "safe" && val === "No") {
      onOpenUrgent && onOpenUrgent();
    }
    if (step < questions.length - 1) setStep(step + 1);
    else onContinue(next);
  };

  return (
    <div>
      <StepDots total={questions.length} current={step} />
      <h1 className="text-2xl font-bold mb-6" style={{ color: T.indigo, fontFamily: FONT_STACK }}>{q.q}</h1>
      <div className="flex flex-col gap-3 mb-8">
        {q.options.map((opt) => (
          <button
            key={opt}
            onClick={() => choose(opt)}
            className="rounded-2xl p-4 text-left text-lg font-semibold focus:outline-none focus-visible:ring-4"
            style={{
              backgroundColor: opt === "No" && q.key === "safe" ? T.coralBg : T.lavender,
              color: opt === "No" && q.key === "safe" ? T.coralDark : T.indigo,
              minHeight: 56,
              fontFamily: FONT_STACK,
              ringColor: T.teal,
            }}
          >
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
      </div>
      <Card className="mb-6">
        <BreathingCircle reducedMotion={reducedMotion} />
      </Card>
      <details className="rounded-2xl p-4" style={{ border: `1px dashed ${T.line}`, backgroundColor: "#FBFAF7" }}>
        <summary className="cursor-pointer text-sm font-semibold" style={{ color: T.teal, fontFamily: FONT_STACK }}>Demo: simulate risk level (prototype control)</summary>
        <div className="flex flex-wrap gap-2 mt-3">
          {["", ...TIERS].map((tier) => (
            <button
              key={tier || "auto"}
              onClick={() => setDemoOverride(tier || null)}
              className="rounded-full px-3 py-1.5 text-sm font-medium"
              style={{
                backgroundColor: demoOverride === tier || (!demoOverride && !tier) ? T.indigo : T.lavender,
                color: demoOverride === tier || (!demoOverride && !tier) ? T.white : T.indigo,
                fontFamily: FONT_STACK,
              }}
            >
              {tier || "Auto (from answers)"}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}

/* Screen: recommendations ------------------------------------------------ */
function Recommendations({ t, assessment, onPick }) {
  const cards = [
    { key: "counsellor", icon: Stethoscope, title: "Speak with a counsellor", body: "Trained, confidential, in your language." },
    { key: "legal", icon: Scale, title: "Free legal aid", body: "Understand your rights and options, at no cost." },
    { key: "medical", icon: HandHeart, title: "Medical support", body: "Nearby care if you need it." },
    { key: "sakhi", icon: Building2, title: "Sakhi Centre", body: "A safe space, close to you." },
    { key: "welfare", icon: Users, title: "Government welfare support", body: "Financial and rehabilitation assistance." },
    { key: "callback", icon: PhoneCall, title: "Ask a human officer to contact me", body: "We'll reach out at a time that works for you." },
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Here are support options that may help you.</h1>
      <p className="mb-6" style={{ color: "#5B5482", fontFamily: FONT_STACK, fontSize: 17 }}>{assessment.summary}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <button key={c.key} onClick={() => onPick(c.key)} className="rounded-2xl p-5 text-left flex flex-col gap-2 focus:outline-none focus-visible:ring-4" style={{ backgroundColor: T.white, border: `1px solid ${T.line}`, ringColor: T.teal }}>
            <c.icon size={24} color={T.teal} />
            <span className="font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>{c.title}</span>
            <span className="text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>{c.body}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* Screen: counsellor discovery ------------------------------------------ */
function CounsellorDiscovery({ t, onContinue }) {
  const [filters, setFilters] = useState({ language: "", mode: "", district: "" });
  const [saved, setSaved] = useState([]);
  // API: GET /v1/counsellors/search?language=&mode=&district= -> { counsellors: [...] }
  const filtered = COUNSELLORS.filter(
    (c) =>
      (!filters.language || c.languages.includes(filters.language)) &&
      (!filters.mode || c.modes.includes(filters.mode)) &&
      (!filters.district || c.district === filters.district)
  );
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Find a counsellor</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filters.language} onChange={(e) => setFilters({ ...filters, language: e.target.value })} className="rounded-xl px-3 py-2 text-sm" style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }}>
          <option value="">Any language</option>
          {SUPPORT_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={filters.mode} onChange={(e) => setFilters({ ...filters, mode: e.target.value })} className="rounded-xl px-3 py-2 text-sm" style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }}>
          <option value="">Any mode</option>
          {["Call", "Chat", "Video"].map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value })} className="rounded-xl px-3 py-2 text-sm" style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }}>
          <option value="">Any district</option>
          {DISTRICT_POOL.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-4 mb-6">
        {filtered.length === 0 && <p style={{ color: "#5B5482", fontFamily: FONT_STACK }}>No counsellors match yet — try widening your filters.</p>}
        {filtered.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>{c.name}</h3>
                <p className="text-sm mt-1" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>{c.languages.join(", ")} · {c.modes.join(" / ")}</p>
                <p className="text-sm" style={{ color: T.teal, fontFamily: FONT_STACK }}>{c.availability}</p>
                <p className="text-xs mt-1" style={{ color: "#8F88BB", fontFamily: FONT_STACK }}>{c.specialNeed} · {c.district}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button className="rounded-xl px-3 py-2 text-sm font-semibold" style={{ backgroundColor: T.lavender, color: T.indigo, fontFamily: FONT_STACK }}>View profile</button>
              <button className="rounded-xl px-3 py-2 text-sm font-semibold" style={{ backgroundColor: T.teal, color: T.white, fontFamily: FONT_STACK }}>Request callback</button>
              <button
                onClick={() => setSaved((s) => (s.includes(c.id) ? s.filter((id) => id !== c.id) : [...s, c.id]))}
                className="rounded-xl px-3 py-2 text-sm font-semibold"
                style={{ backgroundColor: saved.includes(c.id) ? T.sage : "#F3F1EA", color: saved.includes(c.id) ? T.white : T.indigo, fontFamily: FONT_STACK }}
              >
                {saved.includes(c.id) ? "Saved" : "Save for later"}
              </button>
            </div>
          </Card>
        ))}
      </div>
      <PrimaryButton full icon={ArrowRight} onClick={onContinue}>Continue</PrimaryButton>
    </div>
  );
}

/* Screen: filtered support-centre listing --------------------------------- */
/* Shared shell for every recommendation category (medical, legal, Sakhi,   */
/* welfare) so each opens its own real, filtered listing — same card format */
/* as CounsellorDiscovery — instead of dumping everyone on one generic      */
/* Location screen. If the citizen hasn't set a district yet, this screen   */
/* asks for it first (and saves it to the shared location state) before it */
/* will show any results.                                                   */
function SupportCentreListing({ t, category, title, icon: Icon, blurb, location, setLocation, onContinue }) {
  const [state, setState] = useState(location?.state || Object.keys(STATE_DISTRICTS)[0]);
  const [pendingDistrict, setPendingDistrict] = useState(location?.district || STATE_DISTRICTS[location?.state || Object.keys(STATE_DISTRICTS)[0]][0]);
  const [districtFilter, setDistrictFilter] = useState(location?.district || "");
  const [saved, setSaved] = useState([]);

  const confirmDistrict = () => {
    setLocation({ ...location, state, district: pendingDistrict, method: location?.method || "Manual" });
    setDistrictFilter(pendingDistrict);
  };

  // Ask for a district first — never silently show an empty or unfiltered list.
  if (!districtFilter) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded-xl p-2" style={{ backgroundColor: T.lavender }}><Icon size={20} color={T.indigo} /></span>
          <h1 className="text-2xl font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>{title}</h1>
        </div>
        <p className="mb-6 text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>{blurb} First, tell us which district to search near.</p>
        <div className="flex flex-col gap-3">
          <select
            value={state}
            onChange={(e) => { setState(e.target.value); setPendingDistrict(STATE_DISTRICTS[e.target.value][0]); }}
            className="rounded-xl px-3 py-3"
            style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }}
          >
            {Object.keys(STATE_DISTRICTS).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={pendingDistrict} onChange={(e) => setPendingDistrict(e.target.value)} className="rounded-xl px-3 py-3" style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }}>
            {STATE_DISTRICTS[state].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <PrimaryButton full icon={ArrowRight} onClick={confirmDistrict}>Show nearby options</PrimaryButton>
        </div>
      </div>
    );
  }

  // API: GET /v1/support/centres?category={category}&district={district} -> { centres: [...] }
  const results = (SUPPORT_CENTRES[districtFilter] || [])
    .filter((c) => c.category === category)
    .slice()
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="rounded-xl p-2" style={{ backgroundColor: T.lavender }}><Icon size={20} color={T.indigo} /></span>
        <h1 className="text-2xl font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>{title}</h1>
      </div>
      <p className="mb-4 text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>{blurb}</p>
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={districtFilter}
          onChange={(e) => { setDistrictFilter(e.target.value); setLocation({ ...location, district: e.target.value }); }}
          className="rounded-xl px-3 py-2 text-sm"
          style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }}
        >
          {ALL_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-4 mb-6">
        {results.length === 0 && <p style={{ color: "#5B5482", fontFamily: FONT_STACK }}>No listings for {districtFilter} yet — try a nearby district.</p>}
        {results.map((c) => (
          <Card key={c.name}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>{c.name}</h3>
                <p className="text-sm mt-1" style={{ color: T.teal, fontFamily: FONT_STACK }}>{c.type} · {c.distanceKm} km away</p>
                <p className="text-sm mt-1" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>{c.address}</p>
                <p className="text-xs mt-1" style={{ color: "#8F88BB", fontFamily: FONT_STACK }}>{c.timings} · {c.phone}</p>
              </div>
              <MapPin size={20} color={T.teal} className="shrink-0" />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <a
                href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold"
                style={{ backgroundColor: T.teal, color: T.white, fontFamily: FONT_STACK }}
              >
                <PhoneCall size={14} /> Call
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.name}, ${c.address}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold"
                style={{ backgroundColor: T.lavender, color: T.indigo, fontFamily: FONT_STACK }}
              >
                <MapPin size={14} /> Get directions
              </a>
              <button
                onClick={() => setSaved((s) => (s.includes(c.name) ? s.filter((n) => n !== c.name) : [...s, c.name]))}
                className="rounded-xl px-3 py-2 text-sm font-semibold"
                style={{ backgroundColor: saved.includes(c.name) ? T.sage : "#F3F1EA", color: saved.includes(c.name) ? T.white : T.indigo, fontFamily: FONT_STACK }}
              >
                {saved.includes(c.name) ? "Saved" : "Save for later"}
              </button>
            </div>
          </Card>
        ))}
      </div>
      <PrimaryButton full icon={ArrowRight} onClick={onContinue}>Continue</PrimaryButton>
    </div>
  );
}

/* Screen: location & privacy --------------------------------------------- */
function LocationPrivacy({ t, location, setLocation, onContinue }) {
  const [mode, setMode] = useState(null);
  const [state, setState] = useState("Maharashtra");
  const [district, setDistrict] = useState(STATE_DISTRICTS["Maharashtra"][0]);

  const useGps = () => {
    setMode("gps");
    // API: GET /v1/support/nearby?lat={lat}&lng={lng} -> { centres: [...] }
    setLocation({ state: "Maharashtra", district: "Mumbai", method: "GPS" });
  };
  const useManual = () => {
    setLocation({ state, district, method: "Manual" });
    onContinue();
  };
  const centres = SUPPORT_CENTRES[location?.district] || SUPPORT_CENTRES[district] || [];

  if (mode === "gps" && location) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Nearby support in {location.district}</h1>
        <div className="flex flex-col gap-3 mb-6">
          {centres.map((c) => (
            <Card key={c.name} className="flex items-center justify-between">
              <div>
                <p className="font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>{c.name}</p>
                <p className="text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>{c.type} · {c.distanceKm} km away</p>
              </div>
              <MapPin size={20} color={T.teal} />
            </Card>
          ))}
        </div>
        <PrimaryButton full icon={ArrowRight} onClick={onContinue}>Continue</PrimaryButton>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Where should we look for support?</h1>
      <p className="mb-6 text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>Sharing your location is always optional.</p>
      <div className="flex flex-col gap-3 mb-6">
        <button onClick={useGps} className="flex items-center gap-3 rounded-2xl p-4 text-left" style={{ backgroundColor: T.lavender, minHeight: 56 }}>
          <MapPin size={22} color={T.indigo} />
          <span className="font-semibold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Use my location</span>
        </button>
        <button onClick={() => setMode("manual")} className="flex items-center gap-3 rounded-2xl p-4 text-left" style={{ backgroundColor: "#E4EEEC", minHeight: 56 }}>
          <Landmark size={22} color={T.indigo} />
          <span className="font-semibold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Choose my district</span>
        </button>
        <button onClick={onContinue} className="flex items-center gap-3 rounded-2xl p-4 text-left" style={{ backgroundColor: "#F3F1EA", minHeight: 56 }}>
          <Circle size={22} color={T.sage} />
          <span className="font-semibold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Not now</span>
        </button>
      </div>
      {mode === "manual" && (
        <div className="flex flex-col gap-3">
          <select value={state} onChange={(e) => { setState(e.target.value); setDistrict(STATE_DISTRICTS[e.target.value][0]); }} className="rounded-xl px-3 py-3" style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }}>
            {Object.keys(STATE_DISTRICTS).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className="rounded-xl px-3 py-3" style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }}>
            {STATE_DISTRICTS[state].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <PrimaryButton full icon={ArrowRight} onClick={useManual}>Continue</PrimaryButton>
        </div>
      )}
    </div>
  );
}

/* Screen: summary before submission --------------------------------------- */
function SummaryScreen({ t, intake, location, onEdit, onSubmit }) {
  const [concern, setConcern] = useState(intake.transcript?.slice(0, 220) || "");
  const [helpRequested, setHelpRequested] = useState(intake.guidedAnswers?.needType || "not sure");
  const [prefLanguage, setPrefLanguage] = useState("Hindi");
  const [contactPref, setContactPref] = useState(intake.guidedAnswers?.contact || "Later");
  const [consent, setConsent] = useState({ shareVoice: true, receiveUpdates: true, shareLocation: !!location });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Review before you send</h1>
      <Card className="flex flex-col gap-4 mb-4">
        <div>
          <label className="text-sm font-semibold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Main concern</label>
          <textarea value={concern} onChange={(e) => setConcern(e.target.value)} rows={3} className="w-full rounded-xl p-3 mt-1" style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }} />
        </div>
        <div>
          <label className="text-sm font-semibold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Help requested</label>
          <select value={helpRequested} onChange={(e) => setHelpRequested(e.target.value)} className="w-full rounded-xl p-3 mt-1" style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }}>
            {["stressed or scared", "medical", "legal", "feel unsafe", "not sure"].map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Preferred language</label>
          <select value={prefLanguage} onChange={(e) => setPrefLanguage(e.target.value)} className="w-full rounded-xl p-3 mt-1" style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }}>
            {SUPPORT_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>District</label>
          <p className="mt-1" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>{location?.district || "Not shared"}</p>
        </div>
        <div>
          <label className="text-sm font-semibold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Contact preference</label>
          <select value={contactPref} onChange={(e) => setContactPref(e.target.value)} className="w-full rounded-xl p-3 mt-1" style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }}>
            {["Yes", "No", "Later"].map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </Card>
      <Card className="mb-6">
        <h3 className="font-bold mb-3" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Consent choices</h3>
        {[
          { key: "shareVoice", label: "Share my voice statement" },
          { key: "receiveUpdates", label: "Receive case updates" },
          { key: "shareLocation", label: "Share precise location" },
        ].map((c) => (
          <label key={c.key} className="flex items-center justify-between py-2">
            <span style={{ color: T.indigo, fontFamily: FONT_STACK }}>{c.label}</span>
            <input type="checkbox" checked={consent[c.key]} onChange={(e) => setConsent({ ...consent, [c.key]: e.target.checked })} className="w-5 h-5" />
          </label>
        ))}
      </Card>
      <PrimaryButton full variant="coral" icon={Send} onClick={() => onSubmit({ concern, helpRequested, prefLanguage, contactPref, consent })}>
        {t("submitForReview")}
      </PrimaryButton>
    </div>
  );
}

/* Screen: case created --------------------------------------------------- */
function CaseCreatedScreen({ t, caseId, onTrack, onDone }) {
  return (
    <div className="text-center flex flex-col items-center gap-5 py-6">
      <span className="rounded-full p-5" style={{ backgroundColor: "#E4F1E6" }}><CheckCircle2 size={40} color={T.greenChip} /></span>
      <h1 className="text-2xl font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Your case has been received.</h1>
      <div className="rounded-2xl px-6 py-4" style={{ backgroundColor: T.lavender }}>
        <p className="text-xs uppercase tracking-wide" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>Case ID</p>
        <p className="text-2xl font-bold" style={{ color: T.indigo, fontFamily: MONO_STACK }}>{caseId}</p>
      </div>
      <Chip tone="moderate">Received — Human review pending</Chip>
      <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
        <PrimaryButton full icon={Save} variant="outline">Save Case ID</PrimaryButton>
        <PrimaryButton full icon={BellRing} variant="outline">Get SMS Updates</PrimaryButton>
        <PrimaryButton full icon={ClipboardList} onClick={onTrack}>Track My Case</PrimaryButton>
      </div>
      <button onClick={onDone} className="text-sm underline mt-2" style={{ color: T.teal, fontFamily: FONT_STACK }}>Return to homepage</button>
    </div>
  );
}

/* Screen: statement captured locally while offline ------------------------ */
/* Nothing leaves the device here. The toggle in the top bar is the same    */
/* "simulate offline" switch used throughout the citizen flow — flipping it */
/* back off triggers the auto-flush effect in RAAHATApp, which submits this */
/* queued statement and moves on to the normal Case Created screen.         */
function QueuedOfflineScreen({ t, isOffline, queuedAt, onDone }) {
  return (
    <div className="text-center flex flex-col items-center gap-5 py-6">
      <span className="rounded-full p-5" style={{ backgroundColor: T.amberBg }}><WifiOff size={40} color={T.amber} /></span>
      <h1 className="text-2xl font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Your statement is saved on this device.</h1>
      <p className="max-w-sm text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>
        You're offline right now, so nothing has left this device yet. RAAHAT will submit it automatically —
        and you'll get a Case ID — the moment your connection comes back. You don't need to do anything else.
      </p>
      {queuedAt && (
        <p className="text-xs" style={{ color: "#8F88BB", fontFamily: MONO_STACK }}>Saved locally at {new Date(queuedAt).toLocaleTimeString()}</p>
      )}
      <Chip tone={isOffline ? "moderate" : "low"} icon={isOffline ? WifiOff : Wifi}>
        {isOffline ? "Queued locally — waiting for connection" : "Connected — submitting now…"}
      </Chip>
      <button onClick={onDone} className="text-sm underline mt-2" style={{ color: T.teal, fontFamily: FONT_STACK }}>Return to homepage</button>
    </div>
  );
}

/* Screen: tracking --------------------------------------------------------- */
function TrackingScreen({ t, cases }) {
  const [caseId, setCaseId] = useState("");
  const [mobile, setMobile] = useState("");
  const [verified, setVerified] = useState(false);
  // API: GET /v1/case/{caseId}/status -> { status, timeline, verification } (citizen-facing; never includes SVI score)
  const found = verified ? cases.find((c) => c.id === caseId) || cases[8] : null;

  if (!verified) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Track my case</h1>
        <div className="flex flex-col gap-3">
          <input value={caseId} onChange={(e) => setCaseId(e.target.value)} placeholder="Case ID (e.g. RAH-2026-001248)" className="rounded-xl p-4" style={{ border: `1px solid ${T.line}`, fontFamily: MONO_STACK }} />
          <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Registered mobile number" className="rounded-xl p-4" style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }} />
          {/* API: POST /v1/otp/send -> { otpId, expiresInSec } */}
          {/* API: POST /v1/otp/verify -> { verified: boolean } */}
          <PrimaryButton full icon={Search} onClick={() => setVerified(true)} disabled={!caseId || !mobile}>Verify & view status</PrimaryButton>
        </div>
      </div>
    );
  }

  const stages = ["Received", "Human Review", "Support Recommended", "Referral / Follow-up", "Resolved"];
  const doneIdx = found ? found.timeline.filter((s) => s.done).length - 1 : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Case {found?.id || caseId}</h1>
      <p className="mb-6 text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>We'll never show risk scores or officer notes here — only where your case stands.</p>
      <div className="flex flex-col gap-0">
        {stages.map((stage, i) => (
          <div key={stage} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, backgroundColor: i <= doneIdx ? T.teal : T.lavender }}>
                {i <= doneIdx ? <Check size={16} color={T.white} /> : <span style={{ color: T.indigo, fontSize: 12 }}>{i + 1}</span>}
              </span>
              {i < stages.length - 1 && <span style={{ width: 2, height: 36, backgroundColor: i < doneIdx ? T.teal : T.line }} />}
            </div>
            <div className="pb-8">
              <p className="font-bold" style={{ color: i <= doneIdx ? T.indigo : "#8F88BB", fontFamily: FONT_STACK }}>{stage}</p>
              {i <= doneIdx && <p className="text-xs" style={{ color: "#8F88BB", fontFamily: FONT_STACK }}>Updated</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Screen: verification (post-support) ------------------------------------- */
function VerificationScreen({ t, verification, setVerification }) {
  const [name, setName] = useState("");
  const [idNum, setIdNum] = useState("");
  const [district, setDistrict] = useState(DISTRICT_POOL[0]);
  const [uploaded, setUploaded] = useState(false);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Complete verification to formalise your complaint</h1>
      <p className="mb-6 text-sm" style={{ color: T.teal, fontFamily: FONT_STACK }}>Support has already started for you — verification only formalises your complaint and never blocks help.</p>
      <Chip tone={verification === "Verified" ? "low" : verification === "Pending documents" ? "moderate" : "neutral"}>{verification}</Chip>
      <div className="flex flex-col gap-3 mt-5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="rounded-xl p-4" style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }} />
        <input value={idNum} onChange={(e) => setIdNum(e.target.value)} placeholder="ID number (Aadhaar / Voter ID)" className="rounded-xl p-4" style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }} />
        <select value={district} onChange={(e) => setDistrict(e.target.value)} className="rounded-xl p-4" style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }}>
          {DISTRICT_POOL.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <button onClick={() => setUploaded(true)} className="flex items-center justify-center gap-2 rounded-xl p-4 font-semibold" style={{ backgroundColor: uploaded ? "#E4F1E6" : T.lavender, color: uploaded ? T.greenChip : T.indigo, fontFamily: FONT_STACK }}>
          {/* API: POST /v1/case/{caseId}/documents -> { documentId, fileName, status } */}
          <Upload size={18} /> {uploaded ? "Caste certificate uploaded" : "Upload caste certificate / ID proof"}
        </button>
        {/* API: POST /v1/case/{caseId}/verification -> { verificationId, status } */}
        <PrimaryButton full icon={ArrowRight} onClick={() => setVerification("Pending documents")} disabled={!name || !idNum}>Submit for verification</PrimaryButton>
      </div>
    </div>
  );
}

/* Consent Center ------------------------------------------------------- */
function ConsentCenterModal({ open, onClose, consent, setConsent }) {
  const items = [
    { key: "shareVoice", label: "Share voice statement", body: "Allow your recorded statement to be reviewed by an officer." },
    { key: "receiveUpdates", label: "Receive case updates", body: "Get SMS or app notifications on your case status." },
    { key: "shareLocation", label: "Share precise location", body: "Use GPS to find support closer to you." },
    { key: "manualDistrict", label: "Use manual district only", body: "Skip GPS and rely on the district you choose yourself." },
  ];
  return (
    <Modal open={open} onClose={onClose} title="Consent Center">
      <p className="text-sm mb-4" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>You can change these choices at any time. Nothing here affects your access to urgent help.</p>
      <div className="flex flex-col gap-3">
        {items.map((it) => (
          <label key={it.key} className="flex items-start justify-between gap-3 rounded-2xl p-4" style={{ backgroundColor: T.lavender }}>
            <span>
              <span className="block font-semibold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>{it.label}</span>
              <span className="block text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>{it.body}</span>
            </span>
            <input type="checkbox" checked={!!consent[it.key]} onChange={(e) => setConsent({ ...consent, [it.key]: e.target.checked })} className="w-5 h-5 mt-1" />
          </label>
        ))}
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------- */
/* Admin portal                                                           */
/* ---------------------------------------------------------------------- */
const ADMIN_ROLES = [
  { key: "officer", label: "Helpline Officer", icon: PhoneCall },
  { key: "counsellor", label: "Counsellor", icon: Stethoscope },
  { key: "district_admin", label: "District Administrator", icon: Building2 },
  { key: "welfare_partner", label: "Welfare Partner", icon: HandHeart },
  { key: "sys_admin", label: "System Administrator", icon: UserCog },
];

function AdminLogin({ onLogin, onBackToLanding }) {
  const [role, setRole] = useState(null);
  const [officerId, setOfficerId] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: T.indigo }}>
      <Card className="w-full max-w-md" style={{ backgroundColor: T.white }}>
        <div className="flex items-center gap-2 mb-6">
          <span className="rounded-xl p-2" style={{ backgroundColor: T.lavender }}><Lock size={20} color={T.indigo} /></span>
          <h1 className="text-xl font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Authorized Personnel Login</h1>
        </div>
        <p className="text-sm mb-4" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>Choose your role to continue.</p>
        <div className="grid grid-cols-1 gap-2 mb-5">
          {ADMIN_ROLES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRole(r.key)}
              className="flex items-center gap-3 rounded-xl p-3 text-left focus:outline-none focus-visible:ring-4"
              style={{ backgroundColor: role === r.key ? T.indigo : T.lavender, color: role === r.key ? T.white : T.indigo, fontFamily: FONT_STACK, ringColor: T.teal }}
            >
              <r.icon size={18} /> <span className="font-semibold">{r.label}</span>
            </button>
          ))}
        </div>
        <input value={officerId} onChange={(e) => setOfficerId(e.target.value)} placeholder="Officer ID" className="w-full rounded-xl p-3 mb-3" style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }} />
        <input type="password" placeholder="Password" className="w-full rounded-xl p-3 mb-5" style={{ border: `1px solid ${T.line}`, fontFamily: FONT_STACK }} />
        {/* API: POST /v1/auth/officer-login -> { token, role, officerId } */}
        <PrimaryButton full disabled={!role} onClick={() => onLogin(role, officerId || "Officer")}>Sign in</PrimaryButton>
        <button onClick={onBackToLanding} className="text-sm underline mt-4 block text-center w-full" style={{ color: T.teal, fontFamily: FONT_STACK }}>Back to homepage</button>
      </Card>
    </div>
  );
}

function AdminShell({ children, role, officerName, onLogout, activeTab, setActiveTab, roleLabel }) {
  const tabs = [
    { key: "dashboard", label: "Mission Control", icon: Activity },
    { key: "followups", label: "Follow-ups", icon: Calendar },
  ];
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: T.bg }}>
      <aside className="hidden md:flex flex-col w-60 shrink-0" style={{ backgroundColor: T.indigo }}>
        <div className="p-5 flex items-center gap-2">
          <span className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}><Landmark size={18} color={T.white} /></span>
          <span className="font-bold" style={{ color: T.white, fontFamily: FONT_STACK }}>RAAHAT Admin</span>
        </div>
        <nav className="flex-1 px-3 flex flex-col gap-1 mt-4">
          {tabs.map((tItem) => (
            <button
              key={tItem.key}
              onClick={() => setActiveTab(tItem.key)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left"
              style={{ backgroundColor: activeTab === tItem.key ? "rgba(255,255,255,0.14)" : "transparent", color: T.white, fontFamily: FONT_STACK }}
            >
              <tItem.icon size={18} /> {tItem.label}
            </button>
          ))}
        </nav>
        <div className="p-4">
          <p className="text-xs" style={{ color: "#B7B0DE", fontFamily: FONT_STACK }}>{roleLabel}</p>
          <p className="text-sm font-semibold mb-3" style={{ color: T.white, fontFamily: FONT_STACK }}>{officerName}</p>
          <button onClick={onLogout} className="flex items-center gap-2 text-sm" style={{ color: "#E9E3F5", fontFamily: FONT_STACK }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone }) {
  const bg = { coral: T.coralBg, amber: T.amberBg, blue: T.blueChipBg, green: T.greenChipBg, lavender: T.lavender }[tone] || T.lavender;
  const fg = { coral: T.coralDark, amber: T.amber, blue: T.blueChip, green: T.greenChip, lavender: T.indigo }[tone] || T.indigo;
  return (
    <Card className="flex items-center gap-4">
      <span className="rounded-2xl p-3" style={{ backgroundColor: bg }}><Icon size={22} color={fg} /></span>
      <div>
        <p className="text-2xl font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>{value}</p>
        <p className="text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>{label}</p>
      </div>
    </Card>
  );
}

function MiniBarChart({ data, color }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
          <div style={{ height: `${(d.value / max) * 90 + 6}px`, width: "100%", backgroundColor: color, borderRadius: 6 }} title={`${d.label}: ${d.value}`} />
          <span className="text-xs" style={{ color: "#8F88BB", fontFamily: FONT_STACK }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// API: GET /v1/admin/cases?tier=&district=&search=&page= -> { cases: [...], total } (this demo receives it already loaded via props)
function AdminDashboard({ cases, role, onOpenCase, demoOverrideCase, setDemoOverrideCase }) {
  const [tab, setTab] = useState("Critical");
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");

  const withDemo = cases.map((c) => (c.id === demoOverrideCase?.id ? { ...c, svi: demoOverrideCase.svi, sviScore: demoOverrideCase.sviScore, safetyOverride: demoOverrideCase.svi === "Critical" } : c));

  const sorted = [...withDemo].sort((a, b) => {
    const order = { Critical: 0, High: 1, Moderate: 2, Low: 3 };
    return order[a.svi] - order[b.svi] || b.sviScore - a.sviScore;
  });
  const filtered = sorted.filter(
    (c) =>
      c.svi === tab &&
      (!search || c.id.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase())) &&
      (!districtFilter || c.district === districtFilter)
  );

  const metrics = [
    { icon: ShieldAlert, label: "Critical cases identified early", value: withDemo.filter((c) => c.svi === "Critical").length, tone: "coral" },
    { icon: AlertTriangle, label: "High-priority awaiting action", value: withDemo.filter((c) => c.svi === "High" && c.status !== "Resolved").length, tone: "amber" },
    { icon: Calendar, label: "Follow-ups due today", value: 4, tone: "blue" },
    { icon: Clock, label: "Overdue responses", value: withDemo.filter((c) => c.svi === "Critical" && c.status === "Human Review").length, tone: "coral" },
    { icon: CheckCircle2, label: "Resolved this month", value: withDemo.filter((c) => c.status === "Resolved").length, tone: "green" },
  ];

  const volumeData = [
    { label: "Mon", value: 5 }, { label: "Tue", value: 8 }, { label: "Wed", value: 6 },
    { label: "Thu", value: 9 }, { label: "Fri", value: 7 }, { label: "Sat", value: 4 }, { label: "Sun", value: 3 },
  ];
  const priorityData = ["Low", "Moderate", "High", "Critical"].map((t2) => ({ label: t2, value: withDemo.filter((c) => c.svi === t2).length }));
  const districtData = DISTRICT_POOL.slice(0, 6).map((d) => ({ label: d.slice(0, 4), value: withDemo.filter((c) => c.district === d).length }));

  return (
    <div className="p-5 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Mission Control</h1>
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold" style={{ color: T.teal, fontFamily: FONT_STACK }}>Demo: simulate risk level</summary>
          <div className="absolute right-8 mt-2 bg-white rounded-xl p-3 shadow-lg z-20 flex flex-col gap-2" style={{ border: `1px solid ${T.line}` }}>
            <select
              onChange={(e) => setDemoOverrideCase({ id: e.target.value, svi: demoOverrideCase?.svi || "Critical", sviScore: 88 })}
              className="rounded-lg p-2 text-sm"
              style={{ border: `1px solid ${T.line}` }}
              defaultValue=""
            >
              <option value="" disabled>Pick a case…</option>
              {cases.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
            </select>
            <div className="flex gap-1 flex-wrap">
              {TIERS.map((tr) => (
                <button
                  key={tr}
                  onClick={() => demoOverrideCase && setDemoOverrideCase({ ...demoOverrideCase, svi: tr, sviScore: { Low: 12, Moderate: 32, High: 58, Critical: 88 }[tr] })}
                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ backgroundColor: demoOverrideCase?.svi === tr ? T.indigo : T.lavender, color: demoOverrideCase?.svi === tr ? T.white : T.indigo }}
                >
                  {tr}
                </button>
              ))}
            </div>
          </div>
        </details>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card><p className="font-bold mb-2 text-sm" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Case volume over time</p><MiniBarChart data={volumeData} color={T.teal} /></Card>
        <Card><p className="font-bold mb-2 text-sm" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Priority distribution</p><MiniBarChart data={priorityData} color={T.coral} /></Card>
        <Card><p className="font-bold mb-2 text-sm" style={{ color: T.indigo, fontFamily: FONT_STACK }}>District-wise distribution</p><MiniBarChart data={districtData} color={T.sage} /></Card>
      </div>

      <Card padded={false} className="mb-8">
        <div className="p-5 flex flex-wrap gap-3 items-center justify-between" style={{ borderBottom: `1px solid ${T.line}` }}>
          <div className="flex gap-2">
            {TIERS.map((tr) => (
              <button key={tr} onClick={() => setTab(tr)} className="rounded-full px-4 py-2 text-sm font-semibold" style={{ backgroundColor: tab === tr ? T.indigo : T.lavender, color: tab === tr ? T.white : T.indigo, fontFamily: FONT_STACK }}>
                {tr}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color="#8F88BB" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Case ID or name" className="rounded-lg pl-8 pr-3 py-2 text-sm" style={{ border: `1px solid ${T.line}` }} />
            </div>
            <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} className="rounded-lg px-3 py-2 text-sm" style={{ border: `1px solid ${T.line}` }}>
              <option value="">All districts</option>
              {DISTRICT_POOL.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: FONT_STACK }}>
            <thead>
              <tr className="text-left" style={{ color: "#8F88BB" }}>
                <th className="px-5 py-3 font-medium">Case ID</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">District</th>
                <th className="px-5 py-3 font-medium">Language</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Verification</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => onOpenCase(c.id)} className="cursor-pointer hover:bg-gray-50" style={{ borderTop: `1px solid ${T.line}` }}>
                  <td className="px-5 py-3 font-mono" style={{ color: T.indigo, fontFamily: MONO_STACK }}>{c.id}</td>
                  <td className="px-5 py-3"><StatusBadge status={c.svi} /> {c.safetyOverride && <ShieldAlert size={14} className="inline ml-1" color={T.coral} />}</td>
                  <td className="px-5 py-3" style={{ color: T.indigo }}>{c.district}</td>
                  <td className="px-5 py-3" style={{ color: T.indigo }}>{c.language}</td>
                  <td className="px-5 py-3" style={{ color: T.indigo }}>{c.status}</td>
                  <td className="px-5 py-3" style={{ color: T.indigo }}>{c.verification}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center" style={{ color: "#8F88BB" }}>No cases in this queue right now.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <p className="font-bold mb-3" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Recent activity</p>
        <div className="flex flex-col gap-3">
          {SEED_CASES[8].auditLog.slice(0, 4).map((a, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <ScrollText size={16} color={T.teal} className="mt-0.5" />
              <span style={{ color: "#5B5482", fontFamily: FONT_STACK }}>
                <b style={{ color: T.indigo }}>{a.actor}</b> ({a.role}) — {a.action}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// API: GET /v1/admin/cases/{caseId} -> full case detail object (this demo receives it already loaded via props)
function CaseDetail({ caseData, role, onBack, onUpdateCase }) {
  const [c, setC] = useState(caseData);
  const [note, setNote] = useState("");
  const [followupOpen, setFollowupOpen] = useState(false);
  const canOverrideStatus = role !== "welfare_partner";

  useEffect(() => setC(caseData), [caseData]);

  const appendAudit = (action) => {
    const entry = { at: new Date().toISOString(), actor: "You", role: ADMIN_ROLES.find((r) => r.key === role)?.label || "Officer", action };
    const updated = { ...c, auditLog: [entry, ...c.auditLog] };
    setC(updated);
    onUpdateCase(updated);
  };

  const changeStatus = (status) => {
    // API: PATCH /v1/admin/cases/{caseId}/status -> { status, updatedAt }
    const updated = { ...c, status };
    setC(updated);
    onUpdateCase(updated);
    appendAudit(`Updated case status to "${status}"`);
  };

  const referrals = [
    { key: "counselling", label: "Counselling", icon: Stethoscope },
    { key: "legal", label: "Free legal aid", icon: Scale },
    { key: "medical", label: "Medical assistance", icon: HandHeart },
    { key: "sakhi", label: "Sakhi Centre", icon: Building2 },
    { key: "welfare", label: "Welfare support", icon: Users },
    { key: "police", label: "Police intervention", icon: ShieldAlert },
    { key: "witness_protection", label: "Witness protection", icon: Shield },
    { key: "emergency", label: "Emergency support", icon: AlertTriangle },
  ];

  return (
    <div className="p-5 sm:p-8">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold mb-4" style={{ color: T.teal, fontFamily: FONT_STACK }}>
        <ArrowLeft size={16} /> Back to Mission Control
      </button>

      <Card className="mb-6" style={{ border: `1px solid ${T.indigo}`, backgroundColor: T.lavender }}>
        <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: T.indigo, fontFamily: FONT_STACK }}>3-Second Case Brief</p>
        <ul className="flex flex-col gap-1.5">
          {caseBrief(c).map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-sm font-semibold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>
              <span aria-hidden="true" className="mt-0.5">{i === 0 ? "•" : i === 1 ? "⚠" : "→"}</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="rounded-2xl p-4 mb-6 flex items-center gap-3" style={{ backgroundColor: T.lavender }}>
        <Info size={20} color={T.indigo} />
        <p className="font-semibold text-sm" style={{ color: T.indigo, fontFamily: FONT_STACK }}>AI suggestions require authorized human review.</p>
      </div>

      {c.safetyOverride && (
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-3" style={{ backgroundColor: T.coralBg, border: `1px solid ${T.coral}` }}>
          <ShieldAlert size={22} color={T.coralDark} />
          <div>
            <p className="font-bold text-sm" style={{ color: T.coralDark, fontFamily: FONT_STACK }}>Safety Override Flag active</p>
            <p className="text-xs" style={{ color: T.coralDark, fontFamily: FONT_STACK }}>This case was set to Critical unconditionally due to a safety trigger — not by accumulated score alone.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <p className="text-xs font-semibold uppercase mb-1" style={{ color: "#8F88BB", fontFamily: FONT_STACK }}>Case snapshot</p>
            <p className="text-lg font-semibold mb-3" style={{ color: T.indigo, fontFamily: FONT_STACK }}>{c.summary}</p>
            <div className="flex flex-wrap gap-2 items-center">
              <StatusBadge status={c.svi} />
              <span className="text-sm font-mono" style={{ color: "#5B5482", fontFamily: MONO_STACK }}>SVI score: {c.sviScore}/100 (admin only)</span>
              <Chip>{c.verification}</Chip>
              <Chip>{c.district}</Chip>
              <Chip>{c.language}</Chip>
            </div>
          </Card>

          <Card>
            <p className="font-bold mb-2" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Citizen transcript</p>
            <p className="text-sm p-3 rounded-xl" style={{ backgroundColor: "#FBFAF7", color: "#4A4472", fontFamily: FONT_STACK, border: `1px solid ${T.line}` }}>{c.transcript}</p>
            <div className="mt-3 flex items-center gap-2 rounded-xl p-3" style={{ backgroundColor: T.lavender }}>
              <Volume2 size={18} color={T.indigo} />
              <span className="text-sm" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Voice player placeholder — original audio would stream here</span>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <p className="font-bold mb-3" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Language indicators (NLP)</p>
              <div className="flex flex-wrap gap-2">
                {c.textIndicators.length ? c.textIndicators.map((ind) => <Chip key={ind} flagged={ind === "suicidal ideation"}>{ind}</Chip>) : <span className="text-sm" style={{ color: "#8F88BB" }}>None detected</span>}
              </div>
            </Card>
            <Card style={{ border: `1px dashed ${T.line}` }}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="font-bold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Speech signals (prosody)</p>
                <Chip tone="moderate">Simulated in this demo</Chip>
              </div>
              <p className="text-xs mb-3" style={{ color: "#8F88BB", fontFamily: FONT_STACK }}>
                These values are illustrative placeholders, not a live analysis. In production, pitch, pause, and
                tremor extraction run in a dedicated backend speech-analytics service and are returned as
                structured signals — this client never performs audio analysis itself.
              </p>
              {/* API seam: GET /v1/case/{caseId}/speech-analysis -> { pitchVariance, pauseRatio, tremorIndex, flaggedSignals: [...] } */}
              {/* Real prosody extraction (pitch, pause, tremor analysis) happens in the backend speech-analytics service, not here. */}
              <div className="flex flex-col gap-2">
                {c.speechSignals.map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <span style={{ color: "#5B5482", fontFamily: FONT_STACK }}>{s.label}</span>
                    <Chip flagged={s.flagged}>{s.value}</Chip>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <p className="font-bold mb-3" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Recommended pathways</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {referrals.map((r) => (
                <button key={r.key} onClick={() => appendAudit(`Referred to ${r.label}`)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold" style={{ backgroundColor: T.lavender, color: T.indigo, fontFamily: FONT_STACK }}>
                  {/* API: POST /v1/case/{caseId}/referral -> { referralId, type, status } */}
                  <r.icon size={16} /> {r.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => appendAudit("Officer assigned")} className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ backgroundColor: T.teal, color: T.white, fontFamily: FONT_STACK }}>Assign officer</button>
              <button onClick={() => appendAudit("Contacted citizen")} className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ backgroundColor: T.teal, color: T.white, fontFamily: FONT_STACK }}>Contact citizen</button>
              <button onClick={() => setFollowupOpen(true)} className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ backgroundColor: T.indigo, color: T.white, fontFamily: FONT_STACK }}>Schedule follow-up</button>
            </div>
          </Card>

          <Card>
            <p className="font-bold mb-3" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Case timeline</p>
            <div className="flex flex-wrap gap-2">
              {c.timeline.map((s) => (
                <Chip key={s.stage} tone={s.done ? "low" : "neutral"}>{s.stage}{s.done ? " ✓" : ""}</Chip>
              ))}
            </div>
          </Card>

          {canOverrideStatus && (
            <Card>
              <p className="font-bold mb-3" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Update case status</p>
              <div className="flex flex-wrap gap-2">
                {["Human Review", "Support Recommended", "Referral / Follow-up", "Resolved"].map((s) => (
                  <button key={s} onClick={() => changeStatus(s)} className="rounded-xl px-3 py-2 text-sm font-semibold" style={{ backgroundColor: c.status === s ? T.indigo : T.lavender, color: c.status === s ? T.white : T.indigo, fontFamily: FONT_STACK }}>
                    {s}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <p className="font-bold mb-2" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Consent & privacy</p>
            <div className="flex flex-col gap-1 text-sm" style={{ color: "#5B5482", fontFamily: FONT_STACK }}>
              <p>Share voice: {c.consent?.shareVoice ? "Yes" : "No"}</p>
              <p>Receive updates: {c.consent?.receiveUpdates ? "Yes" : "No"}</p>
              <p>Share location: {c.consent?.shareLocation ? "Yes" : "No"}</p>
            </div>
          </Card>
          <Card>
            <p className="font-bold mb-2" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Verification status</p>
            <Chip tone={c.verification === "Verified" ? "low" : c.verification === "Pending documents" ? "moderate" : "neutral"}>{c.verification}</Chip>
          </Card>
          <Card>
            <p className="font-bold mb-3" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Audit log</p>
            <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
              {c.auditLog.map((a, i) => (
                <div key={i} className="text-xs" style={{ fontFamily: FONT_STACK }}>
                  <p className="font-mono" style={{ color: "#8F88BB", fontFamily: MONO_STACK }}>{new Date(a.at).toLocaleString()}</p>
                  <p style={{ color: T.indigo }}><b>{a.actor}</b> ({a.role}) — {a.action}</p>
                </div>
              ))}
            </div>
          </Card>
          <div className="rounded-2xl p-4" style={{ border: `1px dashed ${T.line}` }}>
            <label className="text-sm font-semibold block mb-2" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Internal note</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full rounded-lg p-2 text-sm" style={{ border: `1px solid ${T.line}` }} />
            <button onClick={() => { if (note.trim()) { appendAudit(`Added internal note: "${note.slice(0, 60)}"`); setNote(""); } }} className="mt-2 rounded-lg px-3 py-2 text-sm font-semibold" style={{ backgroundColor: T.lavender, color: T.indigo }}>Save note</button>
          </div>
        </div>
      </div>

      <Modal open={followupOpen} onClose={() => setFollowupOpen(false)} title="Schedule follow-up">
        <FollowupForm
          onSave={(fu) => {
            appendAudit(`Scheduled follow-up: ${fu.type} on ${fu.date} (${fu.stakeholder})`);
            setFollowupOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

function FollowupForm({ onSave, initial }) {
  const [stakeholder, setStakeholder] = useState(initial?.stakeholder || "Counsellor");
  const [date, setDate] = useState(initial?.date || "");
  const [type, setType] = useState(initial?.type || "Counselling");
  const [status, setStatus] = useState(initial?.status || "Scheduled");
  const [notes, setNotes] = useState(initial?.notes || "");
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-sm font-semibold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Assigned stakeholder</label>
        <select value={stakeholder} onChange={(e) => setStakeholder(e.target.value)} className="w-full rounded-xl p-3 mt-1" style={{ border: `1px solid ${T.line}` }}>
          {["Counsellor", "District Administrator", "Welfare Partner", "Law Enforcement"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Follow-up date & time</label>
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl p-3 mt-1" style={{ border: `1px solid ${T.line}` }} />
      </div>
      <div>
        <label className="text-sm font-semibold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Referral type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl p-3 mt-1" style={{ border: `1px solid ${T.line}` }}>
          {["Counselling", "Legal aid", "Medical", "Sakhi Centre", "Welfare support", "Police", "Witness protection", "Emergency support"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl p-3 mt-1" style={{ border: `1px solid ${T.line}` }}>
          {["Scheduled", "In progress", "Completed", "Missed"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Internal notes / resolution note</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-xl p-3 mt-1" style={{ border: `1px solid ${T.line}` }} />
      </div>
      {/* API: POST /v1/case/{caseId}/followup -> { followupId, status } */}
      <PrimaryButton full onClick={() => onSave({ stakeholder, date, type, status, notes })} disabled={!date}>Save follow-up</PrimaryButton>
    </div>
  );
}

function overdueBadge(dateStr) {
  if (!dateStr) return null;
  const due = new Date(dateStr).getTime();
  const now = Date.now();
  const diffHrs = (due - now) / 3600000;
  if (diffHrs < 0) return { text: `Overdue by ${Math.abs(Math.round(diffHrs / 24)) || 1} day(s)`, tone: "critical" };
  if (diffHrs < 24) return { text: `Due in ${Math.round(diffHrs)} hour(s)`, tone: "high" };
  return { text: `Due in ${Math.round(diffHrs / 24)} day(s)`, tone: "moderate" };
}

function FollowupWorkspace({ cases }) {
  const items = cases.slice(0, 8).map((c, i) => ({
    id: c.id,
    caseId: c.id,
    stakeholder: ["Counsellor", "District Administrator", "Welfare Partner", "Law Enforcement"][i % 4],
    date: new Date(Date.now() + (i - 3) * 43200000).toISOString(),
    type: ["Counselling", "Legal aid", "Medical", "Police"][i % 4],
    status: ["Scheduled", "In progress", "Completed", "Missed"][i % 4],
    notes: "",
  }));
  return (
    <div className="p-5 sm:p-8">
      <h1 className="text-2xl font-bold mb-6" style={{ color: T.indigo, fontFamily: FONT_STACK }}>Follow-up workspace</h1>
      <div className="flex flex-col gap-4">
        {items.map((fu) => {
          const badge = overdueBadge(fu.date);
          return (
            <Card key={fu.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm" style={{ color: T.indigo, fontFamily: MONO_STACK }}>{fu.caseId}</p>
                <p className="font-semibold" style={{ color: T.indigo, fontFamily: FONT_STACK }}>{fu.type} · {fu.stakeholder}</p>
                <p className="text-xs" style={{ color: "#8F88BB", fontFamily: FONT_STACK }}>{new Date(fu.date).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Chip tone={fu.status === "Completed" ? "low" : fu.status === "Missed" ? "critical" : "neutral"}>{fu.status}</Chip>
                {badge && fu.status !== "Completed" && <Chip tone={badge.tone}>{badge.text}</Chip>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* App shell — top-level routing and shared state                        */
/* ---------------------------------------------------------------------- */
const SCREENS = {
  LANDING: "LANDING",
  CHOOSE: "CHOOSE",
  NOT_READY: "NOT_READY",
  VOICE: "VOICE",
  TEXT: "TEXT",
  GUIDED: "GUIDED",
  RECS: "RECS",
  COUNSELLORS: "COUNSELLORS",
  MEDICAL: "MEDICAL",
  LEGAL: "LEGAL",
  SAKHI: "SAKHI",
  WELFARE: "WELFARE",
  LOCATION: "LOCATION",
  SUMMARY: "SUMMARY",
  CASE_CREATED: "CASE_CREATED",
  QUEUED_OFFLINE: "QUEUED_OFFLINE",
  TRACKING: "TRACKING",
  VERIFICATION: "VERIFICATION",
  ADMIN_LOGIN: "ADMIN_LOGIN",
  ADMIN_DASHBOARD: "ADMIN_DASHBOARD",
  ADMIN_CASE_DETAIL: "ADMIN_CASE_DETAIL",
  ADMIN_FOLLOWUPS: "ADMIN_FOLLOWUPS",
};

function generateCaseId(existing) {
  const n = 1249 + existing.filter((c) => c.id.startsWith("RAH-2026-00")).length;
  return `RAH-2026-00${n}`;
}

/* Tracks real connectivity (navigator.onLine + the browser's online/offline */
/* events) plus a manual demo override, so the offline flow can be shown    */
/* on request without physically disconnecting the device.                  */
function useConnectivity() {
  const [browserOnline, setBrowserOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [forcedOffline, setForcedOffline] = useState(false);
  useEffect(() => {
    const goOnline = () => setBrowserOnline(true);
    const goOffline = () => setBrowserOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);
  const isOffline = forcedOffline || !browserOnline;
  return { isOffline, forcedOffline, setForcedOffline };
}

export default function RAAHATApp() {
  const reducedMotion = usePrefersReducedMotion();
  const { lang, setLang, t } = useLang();

  const [screen, setScreenRaw] = useState(SCREENS.LANDING);
  const [history, setHistory] = useState([]);
  const setScreen = useCallback(
    (next) => {
      setHistory((h) => [...h, screen]);
      setScreenRaw(next);
    },
    [screen]
  );
  const goBack = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) {
        setScreenRaw(SCREENS.LANDING);
        return h;
      }
      const copy = [...h];
      const prev = copy.pop();
      setScreenRaw(prev);
      return copy;
    });
  }, []);
  const goLanding = useCallback(() => {
    setHistory([]);
    setScreenRaw(SCREENS.LANDING);
  }, []);

  // citizen intake state
  const [transcript, setTranscript] = useState("");
  const [guidedAnswers, setGuidedAnswers] = useState({});
  const [demoOverride, setDemoOverride] = useState(null);
  const [location, setLocation] = useState(null);
  const [verification, setVerification] = useState("Unverified");
  const [consent, setConsent] = useState({ shareVoice: true, receiveUpdates: true, shareLocation: false, manualDistrict: true });
  const [consentOpen, setConsentOpen] = useState(false);
  const [urgentOpen, setUrgentOpen] = useState(false);
  const [lastCaseId, setLastCaseId] = useState(null);
  const [pickedRec, setPickedRec] = useState(null);

  // connectivity (real navigator.onLine + a manual "simulate offline" toggle)
  const { isOffline, setForcedOffline } = useConnectivity();
  const [queuedStatement, setQueuedStatement] = useState(null);

  // shared case store (citizen submissions + seed data)
  const [cases, setCases] = useState(SEED_CASES);

  // API: POST /v1/speech/analyse -> { transcript, language, prosody: { pauseFrequency, pitchVariation, speakingRate, tremor, longSilences } }
  // assess() is the client-side stand-in for the whole intake pipeline: in production the transcript
  // goes to the NLP indicator service and, in parallel, to the backend speech-analytics service above
  // for prosody (pitch, pause, tremor) — the two results are merged into the assessment returned here.
  const assessment = useMemo(
    () => assess({ transcript, guidedAnswers, demoOverride }),
    [transcript, guidedAnswers, demoOverride]
  );

  // admin state
  const [adminRole, setAdminRole] = useState(null);
  const [officerName, setOfficerName] = useState("");
  const [adminTab, setAdminTab] = useState("dashboard");
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [demoOverrideCase, setDemoOverrideCase] = useState(null);

  const createCase = (summaryFields) => {
    const id = generateCaseId(cases);
    const created = new Date().toISOString();
    const newCase = {
      id,
      name: "New citizen submission",
      district: location?.district || "Not shared",
      language: summaryFields.prefLanguage,
      supportType: summaryFields.helpRequested,
      svi: assessment.svi,
      sviScore: assessment.sviScore,
      safetyOverride: assessment.safetyOverride,
      status: "Human Review",
      verification,
      createdAt: created,
      assignedOfficer: "Unassigned",
      transcript: summaryFields.concern || transcript,
      textIndicators: assessment.textIndicators,
      speechSignals: assessment.speechSignals,
      summary: assessment.summary,
      consent: summaryFields.consent,
      timeline: [
        { stage: "Received", at: created, done: true },
        { stage: "Human Review", at: created, done: false },
        { stage: "Support Recommended", at: created, done: false },
        { stage: "Referral / Follow-up", at: created, done: false },
        { stage: "Resolved", at: created, done: false },
      ],
      auditLog: [{ at: created, actor: "System", role: "System", action: "Case created from citizen intake" }],
    };
    setCases((prev) => [newCase, ...prev]);
    setLastCaseId(id);
    setScreen(SCREENS.CASE_CREATED);
  };

  const submitCase = (summaryFields) => {
    if (isOffline) {
      // Nothing leaves this device while offline. The statement is held locally and a background
      // sync (service worker, in a real build) flushes it the moment connectivity returns — see
      // the auto-flush effect below.
      // API: POST /v1/case (from local queue) -> { caseId, status } — invoked automatically once online
      setQueuedStatement({ summaryFields, queuedAt: new Date().toISOString() });
      setScreen(SCREENS.QUEUED_OFFLINE);
      return;
    }
    // API: POST /v1/intake/statement -> { caseId, sviScore, svi, safetyOverride, textIndicators, speechSignals, summary, recommendations }
    // This is the core intake boundary: in production, submitting the statement here is the single
    // call that triggers NLP + speech analytics server-side and returns the fully scored case below —
    // createCase() is the client-side simulation of that response, assembled from assess() instead.
    createCase(summaryFields);
  };

  // auto-flush: the moment connectivity returns, submit whatever was queued locally
  useEffect(() => {
    if (!isOffline && queuedStatement) {
      createCase(queuedStatement.summaryFields);
      setQueuedStatement(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOffline]);

  const updateCase = (updated) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const openUrgentFromGuided = () => {}; // handled inline via CitizenShell FAB; guided screen just informs

  const resetCitizenIntake = () => {
    setTranscript("");
    setGuidedAnswers({});
    setDemoOverride(null);
    setLocation(null);
    setVerification("Unverified");
    setPickedRec(null);
    setQueuedStatement(null);
  };

  /* ---------------- Admin views ---------------- */
  if (screen === SCREENS.ADMIN_LOGIN) {
    return (
      <AdminLogin
        onBackToLanding={goLanding}
        onLogin={(role, name) => {
          setAdminRole(role);
          setOfficerName(name);
          setAdminTab("dashboard");
          setScreen(SCREENS.ADMIN_DASHBOARD);
        }}
      />
    );
  }
  if (screen === SCREENS.ADMIN_DASHBOARD || screen === SCREENS.ADMIN_CASE_DETAIL || screen === SCREENS.ADMIN_FOLLOWUPS) {
    const roleLabel = ADMIN_ROLES.find((r) => r.key === adminRole)?.label || "Officer";
    const activeTabResolved = screen === SCREENS.ADMIN_FOLLOWUPS ? "followups" : "dashboard";
    return (
      <AdminShell
        role={adminRole}
        officerName={officerName}
        roleLabel={roleLabel}
        onLogout={() => { setAdminRole(null); goLanding(); }}
        activeTab={activeTabResolved}
        setActiveTab={(tab) => setScreen(tab === "followups" ? SCREENS.ADMIN_FOLLOWUPS : SCREENS.ADMIN_DASHBOARD)}
      >
        {screen === SCREENS.ADMIN_DASHBOARD && (
          <AdminDashboard
            cases={cases}
            role={adminRole}
            demoOverrideCase={demoOverrideCase}
            setDemoOverrideCase={setDemoOverrideCase}
            onOpenCase={(id) => { setSelectedCaseId(id); setScreen(SCREENS.ADMIN_CASE_DETAIL); }}
          />
        )}
        {screen === SCREENS.ADMIN_CASE_DETAIL && (
          <CaseDetail
            caseData={cases.find((c) => c.id === selectedCaseId) || cases[8]}
            role={adminRole}
            onBack={() => setScreen(SCREENS.ADMIN_DASHBOARD)}
            onUpdateCase={updateCase}
          />
        )}
        {screen === SCREENS.ADMIN_FOLLOWUPS && <FollowupWorkspace cases={cases} />}
      </AdminShell>
    );
  }

  /* ---------------- Landing ---------------- */
  if (screen === SCREENS.LANDING) {
    return (
      <div style={{ fontFamily: FONT_STACK }}>
        <Landing
          t={t}
          lang={lang}
          setLang={setLang}
          reducedMotion={reducedMotion}
          onGetHelp={() => { resetCitizenIntake(); setScreen(SCREENS.CHOOSE); }}
          onTrack={() => setScreen(SCREENS.TRACKING)}
          onOfficerLogin={() => setScreen(SCREENS.ADMIN_LOGIN)}
        />
        <UrgentHelpFAB t={t} onOpen={() => setUrgentOpen(true)} />
        <UrgentHelpSheet open={urgentOpen} onClose={() => setUrgentOpen(false)} t={t} district={location?.district} />
      </div>
    );
  }

  /* ---------------- Citizen flow ---------------- */
  const shellProps = {
    t, lang, setLang,
    onBack: goBack,
    onExitToLanding: goLanding,
    district: location?.district,
    onOpenConsent: () => setConsentOpen(true),
    urgentOpen,
    setUrgentOpen,
    isOffline,
    setForcedOffline,
  };

  let body = null;
  if (screen === SCREENS.CHOOSE) {
    body = (
      <ChooseHowToShare
        t={t}
        onSpeak={() => setScreen(SCREENS.VOICE)}
        onType={() => setScreen(SCREENS.TEXT)}
        onGuided={() => setScreen(SCREENS.GUIDED)}
        onNotReady={() => setScreen(SCREENS.NOT_READY)}
      />
    );
  } else if (screen === SCREENS.NOT_READY) {
    body = <NotReadyScreen t={t} onExitToLanding={goLanding} />;
  } else if (screen === SCREENS.VOICE) {
    body = (
      <VoiceCapture
        t={t}
        lang={lang}
        reducedMotion={reducedMotion}
        transcript={transcript}
        setTranscript={setTranscript}
        onContinue={(text) => { setTranscript(text); setScreen(SCREENS.GUIDED); }}
      />
    );
  } else if (screen === SCREENS.TEXT) {
    body = (
      <TextCapture
        t={t}
        transcript={transcript}
        onContinue={(text) => { setTranscript(text); setScreen(SCREENS.GUIDED); }}
      />
    );
  } else if (screen === SCREENS.GUIDED) {
    body = (
      <GuidedQuestions
        t={t}
        reducedMotion={reducedMotion}
        answers={guidedAnswers}
        setAnswers={setGuidedAnswers}
        demoOverride={demoOverride}
        setDemoOverride={setDemoOverride}
        onOpenUrgent={() => setUrgentOpen(true)}
        onContinue={() => setScreen(SCREENS.RECS)}
      />
    );
  } else if (screen === SCREENS.RECS) {
    body = (
      <Recommendations
        t={t}
        assessment={assessment}
        onPick={(key) => {
          setPickedRec(key);
          const target = {
            counsellor: SCREENS.COUNSELLORS,
            medical: SCREENS.MEDICAL,
            legal: SCREENS.LEGAL,
            sakhi: SCREENS.SAKHI,
            welfare: SCREENS.WELFARE,
          }[key] || SCREENS.LOCATION;
          setScreen(target);
        }}
      />
    );
  } else if (screen === SCREENS.COUNSELLORS) {
    body = <CounsellorDiscovery t={t} onContinue={() => setScreen(SCREENS.LOCATION)} />;
  } else if (screen === SCREENS.MEDICAL) {
    body = (
      <SupportCentreListing
        t={t}
        category="medical"
        title="Medical support near you"
        icon={HandHeart}
        blurb="Hospitals and health centres that can help — from emergency care to a quiet place to be examined."
        location={location}
        setLocation={setLocation}
        onContinue={() => setScreen(SCREENS.SUMMARY)}
      />
    );
  } else if (screen === SCREENS.LEGAL) {
    body = (
      <SupportCentreListing
        t={t}
        category="legal"
        title="Free legal aid near you"
        icon={Scale}
        blurb="Government legal aid centres and clinics that can explain your rights and options, at no cost."
        location={location}
        setLocation={setLocation}
        onContinue={() => setScreen(SCREENS.SUMMARY)}
      />
    );
  } else if (screen === SCREENS.SAKHI) {
    body = (
      <SupportCentreListing
        t={t}
        category="sakhi"
        title="Sakhi Centres near you"
        icon={Building2}
        blurb="One Stop Centres offering shelter, medical aid, police assistance, legal aid and counselling, all under one roof."
        location={location}
        setLocation={setLocation}
        onContinue={() => setScreen(SCREENS.SUMMARY)}
      />
    );
  } else if (screen === SCREENS.WELFARE) {
    body = (
      <SupportCentreListing
        t={t}
        category="welfare"
        title="Government welfare support near you"
        icon={Users}
        blurb="Social welfare offices that can help with financial assistance, rehabilitation and long-term support."
        location={location}
        setLocation={setLocation}
        onContinue={() => setScreen(SCREENS.SUMMARY)}
      />
    );
  } else if (screen === SCREENS.LOCATION) {
    body = (
      <LocationPrivacy
        t={t}
        location={location}
        setLocation={setLocation}
        onContinue={() => setScreen(SCREENS.SUMMARY)}
      />
    );
  } else if (screen === SCREENS.SUMMARY) {
    body = (
      <SummaryScreen
        t={t}
        intake={{ transcript, guidedAnswers }}
        location={location}
        onEdit={() => goBack()}
        onSubmit={submitCase}
      />
    );
  } else if (screen === SCREENS.CASE_CREATED) {
    body = (
      <CaseCreatedScreen
        t={t}
        caseId={lastCaseId}
        onTrack={() => setScreen(SCREENS.TRACKING)}
        onDone={goLanding}
      />
    );
  } else if (screen === SCREENS.QUEUED_OFFLINE) {
    body = (
      <QueuedOfflineScreen
        t={t}
        isOffline={isOffline}
        queuedAt={queuedStatement?.queuedAt}
        onDone={goLanding}
      />
    );
  } else if (screen === SCREENS.TRACKING) {
    body = <TrackingScreen t={t} cases={cases} />;
  } else if (screen === SCREENS.VERIFICATION) {
    body = <VerificationScreen t={t} verification={verification} setVerification={setVerification} />;
  }

  return (
    <div style={{ fontFamily: FONT_STACK }}>
      <CitizenShell {...shellProps} title="RAAHAT">
        {body}
        {screen === SCREENS.CASE_CREATED && (
          <div className="text-center mt-2">
            <button onClick={() => setScreen(SCREENS.VERIFICATION)} className="text-sm underline" style={{ color: T.teal, fontFamily: FONT_STACK }}>
              Complete verification to formalise your complaint
            </button>
          </div>
        )}
      </CitizenShell>
      <ConsentCenterModal open={consentOpen} onClose={() => setConsentOpen(false)} consent={consent} setConsent={setConsent} />
    </div>
  );
}