"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield, User, Database, Share2, MapPin, UserCheck, Baby,
  RefreshCw, Mail, ChevronDown, ArrowLeft, Lock
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

export default function PrivacyPolicyPage() {
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
              <Shield className="h-6 w-6 text-[#FFFFFF]" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Privacy Policy</h1>
              <p className="text-[#FFFFFF]/60 text-sm">Last updated: June 14, 2025</p>
            </div>
          </div>
          <p className="text-[#FFFFFF]/70 text-sm mt-3">
            Your privacy matters to us. Here&apos;s how Meelo handles your data.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 py-8 space-y-3">
        <Section
          icon={<Lock className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Introduction"
          defaultOpen={true}
        >
          <p>
            Meelo (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the Meelo app and website at
            meelo.online. This Privacy Policy explains how we collect, use, disclose, and safeguard
            your information when you use our platform.
          </p>
        </Section>

        <Section
          icon={<User className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Information We Collect"
        >
          <p className="font-medium text-[#000000] dark:text-[#FFFFFF]">Information you provide:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Name and display name</li>
            <li>Email address</li>
            <li>Profile photo (from Google account, if used)</li>
            <li>Activity details you create (name, location, date, time, description)</li>
            <li>Chat messages within activity groups</li>
          </ul>
          <p className="font-medium text-[#000000] dark:text-[#FFFFFF] mt-3">Collected automatically:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Device location (GPS) — only when you grant permission</li>
            <li>Device type and browser information</li>
            <li>Usage data (pages visited, features used)</li>
            <li>Firebase Analytics data (anonymous usage statistics)</li>
          </ul>
        </Section>

        <Section
          icon={<Database className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="How We Use Your Information"
        >
          <ul className="list-disc pl-5 space-y-1">
            <li>To create and manage your account</li>
            <li>To display nearby activities based on your location</li>
            <li>To enable real-time chat within activity groups</li>
            <li>To send notifications about activities you&apos;ve joined</li>
            <li>To improve our app and user experience</li>
            <li>To prevent fraud and ensure platform safety</li>
          </ul>
        </Section>

        <Section
          icon={<Shield className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Data Storage & Security"
        >
          <p>
            Your data is stored securely using Google Firebase services (Firestore, Realtime
            Database, and Firebase Authentication). Firebase complies with industry-standard
            security practices and encrypts data in transit and at rest.
          </p>
          <p>
            We do not store passwords — authentication is handled entirely by Firebase Auth.
          </p>
        </Section>

        <Section
          icon={<Share2 className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Data Sharing"
        >
          <p>
            We do not sell, trade, or rent your personal information to third parties. Your
            information may be shared only in the following cases:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>With other users — your display name and profile photo are visible when you join activities</li>
            <li>With service providers — Firebase (Google) for hosting and authentication</li>
            <li>When required by law or to protect our legal rights</li>
          </ul>
        </Section>

        <Section
          icon={<MapPin className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Location Data"
        >
          <p>
            Meelo uses your device location to show nearby activities and calculate distances.
            Location access is optional — you can deny permission and still use the app with
            reduced functionality.
          </p>
          <p>We do not continuously track your location in the background.</p>
        </Section>

        <Section
          icon={<UserCheck className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Your Rights"
        >
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Withdraw consent for location access at any time</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, contact us at{" "}
            <a href="mailto:support@meelo.online" className="text-[#000000] dark:text-[#FFFFFF] underline font-medium">
              support@meelo.online
            </a>
          </p>
        </Section>

        <Section
          icon={<Baby className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Children's Privacy"
        >
          <p>
            Meelo is not intended for children under 13 years of age. We do not knowingly collect
            personal information from children under 13. If you believe a child has provided us
            with personal data, please contact us and we will delete it.
          </p>
        </Section>

        <Section
          icon={<RefreshCw className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Changes to This Policy"
        >
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this
            page with an updated &quot;Last updated&quot; date. Continued use of the app after
            changes constitutes acceptance of the revised policy.
          </p>
        </Section>

        <Section
          icon={<Mail className="h-[18px] w-[18px] text-[#000000] dark:text-[#FFFFFF]" />}
          title="Contact Us"
        >
          <p>
            If you have questions about this Privacy Policy, contact us at:{" "}
            <a href="mailto:support@meelo.online" className="text-[#000000] dark:text-[#FFFFFF] underline font-medium">
              support@meelo.online
            </a>
          </p>
        </Section>

        {/* Footer links */}
        <div className="pt-6 pb-4 flex flex-wrap gap-4 text-sm border-t border-[#E2E2E2] dark:border-[#333333] mt-6">
          <Link href="/terms" className="text-[#000000] dark:text-[#FFFFFF] hover:underline font-medium">
            Terms & Conditions
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
