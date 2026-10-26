import type { Metadata } from "next";
import type { ReactNode } from "react";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Purchase",
  description:
    "Authenticity, condition, payment, shipping, customs and returns at Closet Crusade.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-14 sm:px-6 sm:pt-20">
      <header className="text-center">
        <h1 className="font-display text-4xl uppercase tracking-[0.12em]">Closet Crusade</h1>
        <p className="mt-3 text-xs uppercase tracking-[0.25em] text-neutral-500">
          Design-first second-hand fashion
        </p>
        <p className="mt-8 leading-relaxed text-neutral-700">
          From accessible designer pieces to unexpected vintage finds, we curate second-hand
          fashion for its construction, materials, and character. Every piece is selected with
          real wardrobes in mind: how it fits, feels, and functions beyond the photograph.
        </p>
        <p className="mt-6 font-display text-2xl italic">Browse for your next grail.</p>
      </header>

      <nav aria-label="On this page" className="mt-14 border-y border-black/10 py-4 text-sm">
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <li><a href="#authenticity" className="hover:underline">Authenticity &amp; Condition</a></li>
          <li><a href="#payment" className="hover:underline">Payment &amp; Shipping</a></li>
          <li><a href="#returns" className="hover:underline">Returns</a></li>
          <li><a href="#contact" className="hover:underline">Contact</a></li>
        </ul>
      </nav>

      <Section id="authenticity" title="Authenticity & Condition">
        <Sub title="Authenticity">
          <p>
            Closet Crusade prioritises authentic secondhand fashion. We assess items using
            available labels, construction details, materials, and other relevant information to
            authenticate items.
          </p>
          <p>
            We do not knowingly list counterfeit items. However, unless explicitly stated and
            supported by appropriate verification, our listings should not be interpreted as a
            guarantee of authenticity.
          </p>
        </Sub>
        <Sub title="Condition">
          <p>Every piece is assessed individually and described as accurately as possible.</p>
          <p>
            Second-hand garments may show signs of previous wear. Any notable flaws identified
            during inspection will be disclosed in the listing.
          </p>
          <p>
            We believe transparency is part of good curation. Our aim is to help you understand
            what you&apos;re buying, so you can make an informed decision before purchasing.
          </p>
        </Sub>
      </Section>

      <Section id="payment" title="Payment, Shipping & Terms of Purchase">
        <Sub title="Payment Method">
          <p>We accept the following payment methods:</p>
          <dl className="divide-y divide-black/10 border-y border-black/10">
            {[
              ["Indonesia", "BCA wire transfer"],
              ["Singapore", "PayNow"],
              ["Malaysia", "DuitNow"],
              ["International", "PayPal"],
            ].map(([region, method]) => (
              <div key={region} className="flex justify-between gap-6 py-2.5">
                <dt className="text-neutral-500">{region}</dt>
                <dd>{method}</dd>
              </div>
            ))}
          </dl>
        </Sub>
        <Sub title="Shipping & Delivery">
          <p>
            Closet Crusade offers free trackable shipping to Indonesia, Singapore and Malaysia.
          </p>
          <p>
            For other destinations, please contact us for shipping availability and a quotation
            before purchasing.
          </p>
          <p>
            Orders are dispatched from Indonesia within 3 business days after payment is
            received. Estimated delivery for Indonesia, Singapore, and Malaysia is approximately
            3–5 business days after dispatch.
          </p>
          <p>
            Delivery times may vary depending on destination, courier operations, customs
            processing and other circumstances beyond our control. Closet Crusade is not liable
            for shipment delay, loss, or damage.
          </p>
        </Sub>
        <Sub title="Customs, Duties & Taxes">
          <p>
            International shipments may be subject to import duties, taxes, customs fees, or
            other charges imposed by the destination country. Such charges, where applicable, are
            the buyer&apos;s responsibility.
          </p>
          <p>
            Any known shipping-related charges or arrangements will be communicated before
            payment. However, final import charges are determined by the relevant authorities and
            may vary according to the destination.
          </p>
        </Sub>
      </Section>

      <Section id="returns" title="Returns, Refunds & Exchanges">
        <p>
          As a small independent resale operation, Closet Crusade is currently unable to offer
          returns, refunds, or exchanges.
        </p>
        <p>Please review all listing information and confirm any questions before purchasing.</p>
      </Section>

      <Section id="contact" title="Communication & Further Questions">
        <p>
          We aim to communicate clearly throughout the purchase and shipping process. If you
          have questions about an item, its condition, shipping arrangements, or applicable
          charges, please contact us before purchasing.
        </p>
        <p>Contact us via:</p>
        <ul className="space-y-1">
          <li>
            <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              Instagram DM @{site.instagramHandle}
            </a>
          </li>
          <li>
            <a href={site.carousellUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              Carousell Singapore DM @{site.carousellHandle}
            </a>
          </li>
        </ul>
        <p className="pt-4 font-display text-xl italic text-black">
          Thank you for supporting independent secondhand fashion and giving good design another
          life.
        </p>
      </Section>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 pt-14">
      <h2 className="font-display text-2xl uppercase tracking-[0.08em]">{title}</h2>
      <div className="mt-6 space-y-4 leading-relaxed text-neutral-700">{children}</div>
    </section>
  );
}

function Sub({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3 pb-4">
      <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-black">{title}</h3>
      {children}
    </div>
  );
}
