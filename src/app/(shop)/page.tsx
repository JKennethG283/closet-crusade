import { ItemCard } from "@/components/item-card";
import { getPublishedItems } from "@/lib/items";

export default async function HomePage() {
  const items = await getPublishedItems();
  // Available pieces first; sold ones stay at the end as an archive.
  const sorted = [...items].sort(
    (a, b) => Number(a.status === "sold") - Number(b.status === "sold"),
  );

  return (
    <>
      <section className="mx-auto max-w-3xl px-4 pb-14 pt-16 text-center sm:px-6 sm:pt-24">
        <h1 className="font-display text-4xl uppercase tracking-[0.12em] sm:text-5xl">
          Closet Crusade
        </h1>
        <p className="mt-4 text-xs uppercase tracking-[0.25em] text-neutral-500">
          Design-first second-hand fashion
        </p>
        <p className="mx-auto mt-8 max-w-2xl leading-relaxed text-neutral-700">
          From accessible designer pieces to unexpected vintage finds, we curate second-hand
          fashion for its construction, materials, and character. Every piece is selected with
          real wardrobes in mind: how it fits, feels, and functions beyond the photograph.
        </p>
        <p className="mt-8 font-display text-2xl italic">Browse for your next grail.</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6" aria-label="Items for sale">
        {sorted.length === 0 ? (
          <p className="py-20 text-center text-neutral-500">New pieces coming soon.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {sorted.map((item, i) => (
              <li key={item.id}>
                <ItemCard item={item} priority={i < 4} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
