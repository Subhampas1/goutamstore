
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl md:text-4xl">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-lg max-w-none">
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>

            <p>
              Please read these Terms of Service carefully before using the Goutam Store website.
            </p>

            <section>
              <h2 className="font-headline text-2xl">1. Accounts</h2>
              <p>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl">2. Orders and Payments</h2>
              <p>
                By placing an order through our website, you warrant that you are legally capable of entering into binding contracts. All payments are processed through Razorpay. We are not responsible for any errors made by the payment processor.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl">3. Products and Pricing</h2>
              <p>
                We reserve the right to change our product prices at any time without further notice. We also reserve the right to refuse or cancel any order for reasons including but not limited to: product availability, errors in the description or price of the product, or error in your order.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl">4. Limitation of Liability</h2>
              <p>
                In no event shall Goutam Store, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>
            
            <section>
              <h2 className="font-headline text-2xl">5. Changes</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms of Service on this page.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl">Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at: <a href="mailto:contact@goutam.store" className="text-primary hover:underline">contact@goutam.store</a>
              </p>
            </section>
        </CardContent>
      </Card>
    </div>
  );
}
