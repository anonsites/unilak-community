import Link from 'next/link';
import Image from 'next/image';

type HomeCardProps = {
  imageSrc: string;
  title: string;
  href: string;
  color: string;
};

export default function HomeCard({ imageSrc, title, href, color }: HomeCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex h-40 flex-col justify-end overflow-hidden rounded-xl border border-white/10 bg-[#346596] p-5 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-white/20 hover:bg-[#25282c]"
    >
      {/* Half-moon image container on top left */}
      <div className="absolute -left-4 -top-4 flex h-28 w-28 items-center justify-center rounded-br-full bg-white pr-4 pb-4 transition-transform duration-300 group-hover:scale-110">
        <div className="relative h-14 w-14">
          <Image 
            src={imageSrc} 
            alt={title} 
            fill 
            className="object-contain"
          />
        </div>
      </div>
      <div className="relative z-10">
        <h2 className="text-lg font-bold tracking-tight text-white">{title}</h2>
      </div>
    </Link>
  );
}
