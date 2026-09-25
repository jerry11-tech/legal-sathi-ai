'use client';

export type Suggestion = {
  label: string;
  icon: string;
  query: string;
};

export const LEGAL_SUGGESTIONS: Suggestion[] = [
  {
    label: 'Tenant Rights',
    icon: '🏠',
    query: 'My landlord entered my rented room without notice and is threatening eviction. What are my rights?',
  },
  {
    label: "Women's Rights",
    icon: '👩',
    query: 'My husband is demanding dowry and harassing me. What legal protections do I have?',
  },
  {
    label: 'Child Protection',
    icon: '👶',
    query: 'What protections exist under the POCSO Act for minor children facing harassment?',
  },
  {
    label: 'Senior Citizens',
    icon: '👴',
    query: 'Can a senior citizen claim maintenance and protection from children under Indian law?',
  },
  {
    label: 'Employment Issues',
    icon: '📄',
    query: 'My employer is withholding my salary without prior notice. What legal steps can I take?',
  },
  {
    label: 'Consumer Complaints',
    icon: '⚖️',
    query: 'I bought a defective product online and the seller refuses a refund. How do I file a consumer complaint?',
  },
  {
    label: 'Cyber Fraud',
    icon: '🚔',
    query: 'Someone stole my bank account details via an OTP scam. How do I report cyber fraud?',
  },
  {
    label: 'Property Disputes',
    icon: '🏡',
    query: 'What legal documents are required to resolve a family property division dispute?',
  },
  {
    label: 'Workplace Harassment',
    icon: '💼',
    query: 'What is the procedure to file a complaint under the POSH Act for workplace harassment?',
  },
  {
    label: 'Copyright Takedown',
    icon: '📹',
    query: 'Someone copied my written work without permission online. How do I issue a copyright takedown?',
  },
];

interface SmartSuggestionsProps {
  onSelect: (query: string) => void;
  className?: string;
}

export default function SmartSuggestions({ onSelect, className = '' }: SmartSuggestionsProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-bodytext">
        Suggested Legal Topics
      </p>
      <div className="flex flex-wrap gap-2">
        {LEGAL_SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(s.query)}
            className="group flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-navy-text shadow-sm transition hover:border-royal/40 hover:bg-soft hover:text-royal active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <span className="text-sm">{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
