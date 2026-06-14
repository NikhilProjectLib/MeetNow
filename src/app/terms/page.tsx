"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText, UserCheck, AlertTriangle, ShieldAlert, Pencil, Ban,
  Scale, RefreshCw, Mail, ChevronDown, ArrowLeft, ScrollText, Globe
} from "lucide-react";

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ icon, title, children, defaultOpen = false }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-[#E2E2E2] dark:border-[#333333] rounded-2xl overflow-hidden bg-[#FFFFFF] dark:bg-[#1A1A1A] transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#F6F6F6] dark:hover:bg-[#262626] transition-colors"
      >
        <div className="h-9 w-9 rounded-xl bg-[#F6F6F6] dark:bg-[#262626] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <span className="flex-1 font-semibold text-[#000000] dark:text-[#FFFFFF] text-[0.9375rem]">
          {title}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-[#6B6B6B] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0] leading-relaxed space-y-3 border-t border-[#F6F6F6] dark:border-[#333333]">
          {children}
        </div>
      )}
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F6F6F6] dark:bg-[#000000]">
      {/* Header */}
      <div className="bg-[#000000] dark:bg-[#1A1A1A] text-[#FFFFFF]">
        <div className="max-w-2xl mx-auto px-5 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[#FFFFFF]/70 hover:text-[#FFFFFF] text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Meelo
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-2xl bg-[#FFFFFF]/10 flex items-center justify-center">
              <ScrollText className="h-6 w-6 text-[#FFFFFF]" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Terms &amp; Conditions</h1>
              <p className="text-[#FFFFFF]/60 text-sm">Last updated: June 14, 2025</p>
            </div>
          </div>
          <p className="text-[#FFFFFF]/70 text-sm mt-3">
            By using Meelo, you agree to the following terms.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 py-8 space-y-3">
        <Section
          icon={<FileText className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Acceptance of Terms"
          defaultOpen={true}
        >
          <p>
            By accessing or using the Meelo application and website (meelo.online), you agree to
            be bound by these Terms &amp; Conditions. If you do not agree to these terms, please
            do not use our platform.
          </p>
        </Section>

        <Section
          icon={<Globe className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Description of Service"
        >
          <p>
            Meelo is a real-time social activity platform that allows users to discover, create,
            and join nearby activities such as sports, outdoor adventures, social gatherings, and
            more. Meelo acts as a platform connecting users — we do not organize, host, or
            supervise any activities.
          </p>
        </Section>

        <Section
          icon={<UserCheck className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="User Accounts"
        >
          <ul className="list-disc pl-5 space-y-1">
            <li>You must be at least 13 years old to use Meelo</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You must provide accurate and truthful information during registration</li>
            <li>One person may not maintain more than one account</li>
            <li>You are responsible for all activity that occurs under your account</li>
          </ul>
        </Section>

        <Section
          icon={<Ban className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="User Conduct"
        >
          <p>When using Meelo, you agree not to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Create activities that promote illegal, harmful, or dangerous behavior</li>
            <li>Harass, threaten, or abuse other users</li>
            <li>Post offensive, obscene, or discriminatory content</li>
            <li>Impersonate another person or entity</li>
            <li>Use the platform for commercial advertising or spam</li>
            <li>Attempt to hack, disrupt, or overload our services</li>
            <li>Create fake or misleading activities</li>
            <li>Collect other users&apos; personal information without consent</li>
          </ul>
        </Section>

        <Section
          icon={<AlertTriangle className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Activities & Safety"
        >
          <p>
            Meelo is a platform that connects people. We do not verify, endorse, or guarantee any
            activity posted on the platform. Users participate at their own risk.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Meelo is not responsible for any injuries, damages, or losses during activities</li>
            <li>Exercise personal judgment when joining activities with strangers</li>
            <li>We recommend meeting in public places and informing someone of your plans</li>
            <li>Activity creators are responsible for ensuring events comply with local laws</li>
          </ul>
        </Section>

        <Section
          icon={<Pencil className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Content Ownership"
        >
          <p>
            You retain ownership of content you create on Meelo (activity descriptions, chat
            messages, etc.). By posting content, you grant Meelo a non-exclusive, royalty-free
            license to display and distribute that content within the platform for the purpose of
            providing our services.
          </p>
        </Section>

        <Section
          icon={<ShieldAlert className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Termination"
        >
          <p>
            We reserve the right to suspend or terminate your account at any time if you violate
            these terms or engage in behavior that is harmful to other users or the platform.
            You may also delete your account at any time by contacting us.
          </p>
        </Section>

        <Section
          icon={<Scale className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Disclaimers & Liability"
        >
          <ul className="list-disc pl-5 space-y-1">
            <li>Meelo is provided &quot;as is&quot; without warranties of any kind</li>
            <li>We do not guarantee the platform will be uninterrupted or error-free</li>
            <li>We are not liable for any user-generated content on the platform</li>
            <li>We do not guarantee the accuracy of location data or activity information</li>
          </ul>
          <p className="mt-2">
            To the maximum extent permitted by applicable law, Meelo shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages arising out of your
            use of the platform.
          </p>
        </Section>

        <Section
          icon={<Globe className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Governing Law"
        >
          <p>
            These terms are governed by and construed in accordance with the laws of India.
            Any disputes arising from these terms shall be subject to the exclusive jurisdiction
            of the courts in India.
          </p>
        </Section>

        <Section
          icon={<RefreshCw className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Changes to Terms"
        >
          <p>
            We may update these Terms &amp; Conditions from time to time. Continued use of Meelo
            after any changes constitutes acceptance of the new terms. We will notify users of
            significant changes via the app or email.
          </p>
        </Section>

        <Section
          icon={<Mail className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Contact Us"
        >
          <p>
            For questions about these Terms &amp; Conditions, contact us at:{" "}
            <a href="mailto:support@meelo.online" className="text-[#000000] dark:text-[#FFFFFF] underline font-medium">
              support@meelo.online
            </a>
          </p>
        </Section>

        {/* Footer links */}
        <div className="pt-6 pb-4 flex flex-wrap gap-4 text-sm border-t border-[#E2E2E2] dark:border-[#333333] mt-6">
          <Link href="/privacy" className="text-[#000000] dark:text-[#FFFFFF] hover:underline font-medium">
            Privacy Policy
          </Link>
          <Link href="/contact" className="text-[#000000] dark:text-[#FFFFFF] hover:underline font-medium">
            Contact Us
          </Link>
          <Link href="/" className="text-[#6B6B6B] hover:text-[#000000] dark:hover:text-[#FFFFFF] hover:underline font-medium">
            ← Back to Meelo
          </Link>
        </div>
      </div>
    </div>
  );
}
