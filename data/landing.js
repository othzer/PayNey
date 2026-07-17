import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  Globe,
  Zap,
  Smartphone,
  HandCoins,
  QrCode,
  SlidersHorizontal,
} from "lucide-react";


// Features Data
export const featuresData = [
  {
    icon: <Smartphone className="h-8 w-8 text-primary" />,
    title: "Automatic Capture",
    description:
      "Reads your bank SMS and UPI app notifications and brings the transactions straight to your Review queue — no manual entry.",
    href: "#connect",
    linkLabel: "Learn more",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "Advanced Analytics",
    description:
      "Get detailed insights into your spending patterns with AI-powered analytics",
  },
  {
    icon: <Receipt className="h-8 w-8 text-blue-600" />,
    title: "Smart Receipt Scanner",
    description:
      "Extract data automatically from receipts using advanced AI technology",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "Budget Planning",
    description: "Create and manage budgets with intelligent recommendations",
  },
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "Multi-Account Support",
    description: "Manage multiple accounts and credit cards in one place",
  },
  {
    icon: <Globe className="h-8 w-8 text-blue-600" />,
    title: "Multi-Currency",
    description: "Support for multiple currencies with real-time conversion",
  },
  {
    icon: <Zap className="h-8 w-8 text-blue-600" />,
    title: "Automated Insights",
    description: "Get automated financial insights and recommendations",
  },
  {
    icon: <HandCoins className="h-8 w-8 text-blue-600" />,
    title: "Lending Ledger",
    description:
      "Track money you lend or borrow, share a public read-only link with the other person, and send a WhatsApp nudge when a repayment is due.",
  },
];

// How It Works Data
export const howItWorksData = [
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "1. Create an account",
    description:
      "Sign up and add your first bank or cash account — takes under a minute, no card required.",
  },
  {
    icon: <QrCode className="h-8 w-8 text-blue-600" />,
    title: "2. Pair the Capture app (optional)",
    description:
      "Install the PayNey Capture Android app and scan a pairing code from Settings → Connect. It reads bank SMS and UPI notifications and scans receipt photos, dropping them into your Review queue.",
  },
  {
    icon: <SlidersHorizontal className="h-8 w-8 text-blue-600" />,
    title: "3. Review, categorize, set budgets",
    description:
      "Approve or edit anything captured automatically, or add transactions by hand. Set a budget per category and PayNey tracks your progress against it.",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "4. Read your monthly AI summary",
    description:
      "Every month, get a plain-language breakdown of where your money went and where you can cut back.",
  },
  {
    icon: <HandCoins className="h-8 w-8 text-blue-600" />,
    title: "5. Track loans on the side",
    description:
      "Log money you lend or borrow from friends and family, share a public link so they can see the balance, and nudge them on WhatsApp when it's due.",
  },
];
