
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl md:text-4xl">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-lg max-w-none">
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>

            <p>
              Welcome to Goutam Store. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
            </p>

            <section>
              <h2 className="font-headline text-2xl">Information We Collect</h2>
              <p>
                We may collect personal information from you in a variety of ways, including when you register on the site, place an order, or subscribe to a newsletter.
              </p>
              <ul>
                <li><strong>Personal Data:</strong> Name, email address, mailing address, and phone number.</li>
                <li><strong>Financial Data:</strong> We use a third-party payment processor (Razorpay). We do not store or collect your payment card details. That information is provided directly to our third-party payment processors whose use of your personal information is governed by their Privacy Policy.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-headline text-2xl">How We Use Your Information</h2>
              <p>
                We use the information we collect to:
              </p>
              <ul>
                <li>Process your transactions and manage your orders.</li>
                <li>Personalize your user experience.</li>
                <li>Improve our website and customer service.</li>
                <li>Communicate with you about your order or other inquiries.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="font-headline text-2xl">Security of Your Information</h2>
              <p>
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl">Contact Us</h2>
              <p>
                If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:contact@goutam.store" className="text-primary hover:underline">contact@goutam.store</a>
              </p>
            </section>
        </CardContent>
      </Card>
    </div>
  );
}
