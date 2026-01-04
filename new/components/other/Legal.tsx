'use client';

import { useRef, useState, useEffect } from "react";
import { ChevronUp, Menu } from "lucide-react";

export default function Legal() {
  const tosRef = useRef<HTMLDivElement | null>(null);
  const privacyRef = useRef<HTMLDivElement | null>(null);
   const cookiesRef = useRef<HTMLDivElement | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTop, setShowTop] = useState(false);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex bg-background relative mt-10">
      {/* Toggle Button */}
      <button
        onClick={() => setSidebarOpen((prev) => !prev)}
        className="md:hidden fixed top-4 left-4 z-50 bg-accent px-3 py-2 rounded shadow border border-border flex items-center gap-2"
      >
        <Menu className="w-5 h-5" />
        Legal
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 w-64 border-r border-border p-6 md:static top-0 left-0 h-full bg-background z-40`}
      >
        <h2 className="font-semibold text-lg mb-4">Legal</h2>
        <nav className="space-y-3">
          <button
            onClick={() => scrollTo(tosRef)}
            className="block w-full text-left px-3 py-2 rounded hover:bg-accent transition"
          >
            Terms of Service
          </button>
          <button
            onClick={() => scrollTo(privacyRef)}
            className="block w-full text-left px-3 py-2 rounded hover:bg-accent transition"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => scrollTo(cookiesRef)}
            className="block w-full text-left px-3 py-2 rounded hover:bg-accent transition"
          >
            Cookies Policy
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 mt-4 md:mt-0 space-y-32 md:ml-64">
        {/* Terms of Service */}
        <section ref={tosRef} id="tos" className="prose max-w-none">
          <h1 className="text-3xl font-bold mb-4">Terms and Conditions</h1>
          <p className="text-muted-foreground mb-4">Last updated: December 10, 2025</p>

          <p>We are <strong>ContentScripted</strong> (“Company”, “we”, “us”, or “our”).</p>

          <p>We operate the website <a href="https://contentscripted.com">https://contentscripted.com</a> (the “Site”), the mobile application script (the “App”), as well as any other related products and services that refer or link to these legal terms (the “Legal Terms”) (collectively, the “Services”).</p>

          <p>You can contact us by phone at 248-403-1245 or email at ContentScripted@outlook.com.</p>

          <p>These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”), and ContentScripted, concerning your access to and use of the Services. By accessing the Services, you agree that you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, YOU MUST DISCONTINUE USE IMMEDIATELY.</p>

          <p>Supplemental terms and conditions or documents that may be posted on the Services from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms from time to time. We will alert you about any changes by updating the “Last updated” date of these Legal Terms, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Legal Terms to stay informed of updates. You will be subject to, and deemed to have accepted, the changes in any revised Legal Terms by your continued use of the Services after the date such revised Legal Terms are posted.</p>

          <p>The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Services.</p>

          <p>We recommend that you print a copy of these Legal Terms for your records.</p>

          <h2>1. Our Services</h2>
          <p>The Services are not intended for distribution to or use by any person or entity in any jurisdiction where such distribution or use would be contrary to law. Users accessing the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws.</p>
          <p>The Services are not tailored to comply with industry-specific regulations (e.g., HIPAA, FISMA). If your interactions would be subject to such laws, you may not use the Services. You may not use the Services in a way that violates the Gramm-Leach-Bliley Act (GLBA).</p>

          <h2>2. Intellectual Property Rights</h2>
          <p>We own or are licensed to all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, graphics, and trademarks (collectively, the “Content” and “Marks”).</p>
          <p>The Content and Marks are provided “AS IS” for your personal, non-commercial use or internal business purposes.</p>
          <p>You are granted a non-exclusive, non-transferable, revocable license to access the Services and download or print any portion of the Content to which you have properly gained access. Except as explicitly allowed, no part of the Services, Content, or Marks may be copied, reproduced, distributed, or exploited for commercial purposes without our written permission.</p>
          <p>By submitting questions, comments, ideas, feedback, or other information (“Submissions”), you grant us full rights to use, modify, and distribute such Submissions for any lawful purpose without compensation. You warrant that your Submissions are original or that you have the necessary rights to submit them.</p>

          <h2>3. User Representations</h2>
          <ul>
            <li>All registration information you submit is true, accurate, current, and complete.</li>
            <li>You have legal capacity to enter into these Legal Terms.</li>
            <li>You are not a minor in your jurisdiction.</li>
            <li>You will not access the Services through automated or non-human means.</li>
            <li>Your use of the Services will comply with applicable law.</li>
          </ul>

          <h2>4. User Registration</h2>
          <p>You may be required to register. Keep your password confidential and be responsible for all use of your account. We reserve the right to remove or change a username deemed inappropriate.</p>

          <h2>5. Purchases and Payment</h2>
          <p>All purchases are non-refundable. Accepted payment methods include: Visa, Mastercard, American Express, Discover, and PayPal.</p>
          <p>You agree to provide accurate and up-to-date payment information. We reserve the right to correct pricing errors and to refuse or cancel orders at our discretion.</p>

          <h2>6. Software</h2>
          <p>Software provided with the Services is licensed, not sold. If accompanied by an End User License Agreement (EULA), the EULA governs your use. Otherwise, you are granted a non-exclusive, non-transferable, revocable license to use the software solely with the Services.</p>

          <h2>7. Prohibited Activities</h2>
          <ul>
            <li>Scrape or collect data from the Services without permission.</li>
            <li>Circumvent security features.</li>
            <li>Harass, threaten, or harm other users.</li>
            <li>Interfere with the Services or distribute malware.</li>
            <li>Use automated systems to access the Services.</li>
            <li>Violate applicable laws or intellectual property rights.</li>
          </ul>

          <h2>8. User Generated Contributions</h2>
          <p>If you submit content (“Contributions”), you represent that:</p>
          <ul>
            <li>You own or have the rights to the Contributions.</li>
            <li>They do not infringe third-party rights.</li>
            <li>They are not illegal, obscene, harassing, or misleading.</li>
          </ul>

          <h2>9. Contribution Licence</h2>
          <p>You retain ownership of your Contributions but grant ContentScripted a worldwide, royalty-free license to use, store, and display them. You agree to indemnify us for any claims arising from your Contributions.</p>

          <h2>10. Mobile Application Licence</h2>
          <p>You are granted a revocable, non-exclusive, non-transferable license to use the App on devices you own. You may not decompile or reverse engineer the App, use it for unauthorized commercial purposes, or violate App store terms or applicable law.</p>

          <h2>11. Third-Party Websites and Content</h2>
          <p>The Services may contain links to third-party websites or content. We do not endorse or guarantee third-party content and are not responsible for any transactions or interactions with third parties.</p>

          <h2>12. Services Management</h2>
          <p>We may monitor, remove, or restrict access to the Services to protect our rights or enforce these Legal Terms.</p>

          <h2>13. Privacy Policy</h2>
          <p>Your use of the Services is subject to our Privacy Policy, which is incorporated by reference. By using the Services, you consent to collection, storage, and use of your data as described.</p>

          <h2>14. Term and Termination</h2>
          <p>We may terminate or suspend your access to the Services at any time for any reason. Termination does not limit our legal remedies.</p>

          <h2>15. Modifications and Interruptions</h2>
          <p>We may modify, suspend, or discontinue the Services without notice. We are not liable for any interruptions, downtime, or changes.</p>

          <h2>16. Governing Law</h2>
          <p>These Legal Terms are governed by the laws of the United States, specifically the state of Michigan.</p>

          <h2>17. Dispute Resolution</h2>
          <p>Any disputes will be resolved under Michigan law.</p>

          <h2>18. Corrections</h2>
          <p>We may correct errors or inaccuracies on the Services at any time without notice.</p>

          <h2>19. Disclaimer</h2>
          <p>The Services are provided “AS IS” and “AS AVAILABLE.” We disclaim all warranties, express or implied, to the fullest extent permitted by law.</p>

          <h2>20. Limitations of Liability</h2>
          <p>Our liability is limited to the amount paid by you to us during the six months preceding a claim. We are not liable for indirect, consequential, or punitive damages.</p>

          <h2>21. Indemnification</h2>
          <p>You agree to indemnify and hold us harmless from claims arising out of your use of the Services, violation of these Legal Terms, or infringement of third-party rights.</p>

          <h2>22. User Data</h2>
          <p>You are responsible for any data transmitted through the Services. We are not liable for data loss or corruption.</p>

          <h2>23. Electronic Communications, Transactions, and Signatures</h2>
          <p>By using the Services, you consent to electronic communications and agree that electronic records satisfy legal requirements.</p>

          <h2>24. California Users and Residents</h2>
          <p>If unresolved, California users may contact the Division of Consumer Services, California Department of Consumer Affairs, 1625 North Market Blvd., Suite N112, Sacramento, CA 95834, or by phone at (800) 952-5210.</p>

          <h2>25. Miscellaneous</h2>
          <p>These Legal Terms constitute the entire agreement. Waivers, severability, and assignment provisions apply as described.</p>

          <h2>26. Contact Us</h2>
          <p>
            ContentScripted<br />
            Oxford, Michigan, United States<br />
            Phone: 248-403-1245<br />
            Email: ContentScripted@outlook.com
          </p>
        </section>

        <section ref={privacyRef} id="privacy" className="prose max-w-none">
  <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
  <p className="text-muted-foreground mb-4">Last updated: December 10, 2025</p>

  <p>ContentScripted (“Company”, “we”, “us”, or “our”) values your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, or related services (collectively, the “Services”). By using our Services, you consent to the practices described in this Privacy Policy.</p>

  <h2>1. Information We Collect</h2>
  <p>We may collect the following types of information:</p>
  <ul>
    <li><strong>Personal Information:</strong> Name, email address, phone number, billing information, account credentials, and any other information you voluntarily provide.</li>
    <li><strong>Usage Information:</strong> IP address, browser type, operating system, device identifiers, pages visited, features used, and other analytics data.</li>
    <li><strong>Cookies and Tracking Technologies:</strong> We use cookies, web beacons, and similar technologies to improve our Services, analyze usage, and provide personalized content.</li>
  </ul>

  <h2>2. How We Use Your Information</h2>
  <p>We use your information for purposes including:</p>
  <ul>
    <li>Providing, operating, and maintaining the Services</li>
    <li>Processing transactions and sending confirmations</li>
    <li>Personalizing and improving user experience</li>
    <li>Communicating with you, including marketing messages</li>
    <li>Preventing fraud and ensuring security</li>
    <li>Complying with legal obligations</li>
  </ul>

  <h2>3. Sharing Your Information</h2>
  <p>We do not sell your personal information. We may share your information in the following cases:</p>
  <ul>
    <li><strong>Service Providers:</strong> Third-party vendors that help operate the Services or process payments.</li>
    <li><strong>Legal Requirements:</strong> When required by law, regulation, legal process, or governmental request.</li>
    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
    <li><strong>Protection of Rights:</strong> To enforce our agreements or protect rights, property, or safety.</li>
  </ul>

  <h2>4. Your Rights</h2>
  <p>Depending on your location, you have rights regarding your personal information:</p>
  <ul>
    <li><strong>GDPR (EU/EEA Users):</strong> Access, correct, delete, restrict, or object to processing of your personal data; data portability; withdraw consent.</li>
    <li><strong>CCPA (California Users):</strong> Request disclosure of collected data, deletion, opt-out of sale, and non-discrimination for exercising rights.</li>
    <li><strong>Other Jurisdictions:</strong> You may have similar rights under local law, including the right to access, correct, or delete your data.</li>
  </ul>
  <p>To exercise your rights, contact us at <a href="mailto:ContentScripted@outlook.com">ContentScripted@outlook.com</a>.</p>

  <h2>5. Cookies and Tracking</h2>
  <p>We use cookies and similar technologies to enhance your experience. You can manage cookie preferences via your browser settings. Third-party services may also use cookies when interacting with our Services.</p>

  <h2>6. Data Retention</h2>
  <p>We retain personal information only as long as necessary to provide Services, comply with legal obligations, resolve disputes, or enforce agreements. When data is no longer needed, we securely delete or anonymize it.</p>

  <h2>7. Data Security</h2>
  <p>We implement reasonable technical, administrative, and physical safeguards to protect personal information. However, no system is completely secure, and we cannot guarantee absolute protection against unauthorized access.</p>

  <h2>8. International Users</h2>
  <p>Our Services are accessible internationally. By using the Services, you consent to the transfer, storage, and processing of your information in the United States or other countries, which may have different privacy laws than your jurisdiction.</p>

  <h2>9. Children’s Privacy</h2>
  <p>Our Services are not intended for individuals under 18. We do not knowingly collect personal information from children under 18. If we learn we have collected such information, we will delete it promptly.</p>

  <h2>10. Third-Party Links</h2>
  <p>Our Services may contain links to third-party websites. We are not responsible for the privacy practices of third parties and encourage you to review their privacy policies.</p>

  <h2>11. Changes to This Privacy Policy</h2>
  <p>We may update this Privacy Policy from time to time. Updates will be reflected by the “Last updated” date. Continued use of the Services after updates indicates your acceptance of the revised Privacy Policy.</p>

  <h2>12. Contact Us</h2>
  <p>If you have questions, concerns, or wish to exercise your privacy rights, contact us:</p>
  <p>
    ContentScripted<br />
    Oxford, Michigan, United States<br />
    Phone: 248-403-1245<br />
    Email: <a href="mailto:ContentScripted@outlook.com">ContentScripted@outlook.com</a>
  </p>
</section>
<section ref={cookiesRef} id="cookies" className="prose max-w-none">
          <h1 className="text-3xl font-bold mb-4">Cookies Policy</h1>
          <p className="text-muted-foreground mb-4">Last updated: December 10, 2025</p>

          <p>ContentScripted (“Company”, “we”, “us”, or “our”) uses cookies and similar tracking technologies on our website, mobile application, and related services (collectively, the “Services”). This Cookies Policy explains what cookies are, how we use them, and your choices regarding cookies.</p>

          <h2>1. What Are Cookies?</h2>
          <p>Cookies are small text files stored on your device when you visit a website. They allow the site to recognize your device, remember preferences, and improve user experience. Other tracking technologies include web beacons, pixels, and local storage.</p>

          <h2>2. How We Use Cookies</h2>
          <p>We use cookies for the following purposes:</p>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for core functionality of the Services, such as login, security, and site navigation.</li>
            <li><strong>Performance Cookies:</strong> Collect anonymous information about how users interact with the Services to improve performance and usability.</li>
            <li><strong>Functional Cookies:</strong> Remember preferences and settings, e.g., language selection or region.</li>
            <li><strong>Advertising and Targeting Cookies:</strong> Track user activity across websites to deliver personalized ads and measure ad effectiveness. Third parties may set these cookies.</li>
          </ul>

          <h2>3. Third-Party Cookies</h2>
          <p>We may allow third-party services (e.g., Google Analytics, ad networks) to place cookies on our Services. We do not control these cookies. Please review the third party’s privacy policies for more information.</p>

          <h2>4. Your Cookie Choices</h2>
          <p>You can manage cookies through your browser or device settings. Options include:</p>
          <ul>
            <li>Deleting cookies already stored</li>
            <li>Blocking new cookies</li>
            <li>Setting preferences for specific websites</li>
          </ul>
          <p>Note that disabling certain cookies may affect functionality of the Services.</p>

          <h2>5. Consent for Cookies</h2>
          <p>Where required by law (e.g., GDPR), we will request your consent to store non-essential cookies. You may withdraw your consent at any time via your browser settings or the cookie management tool provided on our Services.</p>

          <h2>6. Changes to This Cookies Policy</h2>
          <p>We may update this Cookies Policy periodically. Changes will be reflected by the “Last updated” date. Continued use of the Services indicates your acceptance of any updates.</p>

          <h2>7. Contact Us</h2>
          <p>If you have questions or concerns about our use of cookies, contact us:</p>
          <p>
            ContentScripted<br />
            Oxford, Michigan, United States<br />
            Phone: 248-403-1245<br />
            Email: <a href="mailto:ContentScripted@outlook.com">ContentScripted@outlook.com</a>
          </p>
        </section>
      </main>


      {/* Back to Top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-400 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2"
        >
          Back to Top <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
