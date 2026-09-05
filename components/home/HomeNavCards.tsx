import Link from 'next/link';
import Image from 'next/image';

const navigationCards = [
  { href: '/find-classes', title: 'Find Classes', imageSrc: '/images/find-classes.png' },
  { href: '/find-events', title: 'Find Events', imageSrc: '/images/find-events.png' },
  { href: '/announcements', title: 'Find Updates', imageSrc: '/images/announcements.png' },
  { href: '/faq', title: 'Q&A', imageSrc: '/images/faq.png' },
];

export default function HomeNavCards() {
  return (
    <>
      {navigationCards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="group relative flex h-40 flex-col justify-end overflow-hidden rounded-xl border border-white/10 bg-[#346596] p-5"
        >
          <div className="absolute -left-4 -top-4 flex h-28 w-28 items-center justify-center rounded-br-full bg-white pr-4 pb-4">
            <div className="relative h-14 w-14">
              <Image src={card.imageSrc} alt={card.title} fill className="object-contain" />
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">{card.title}</h2>
            <span aria-hidden="true" className="text-xl font-bold text-white/80 transition-transform duration-300 group-hover:translate-x-2">-&gt;</span>
          </div>
        </Link>
      ))}
    </>
  );
}
