import Link from "next/link";
import { ReactNode } from "react";

interface CardProps {
  href?: string;
  className?: string;
  children: ReactNode;
}

export function Card({ href, className = "", children }: CardProps) {
  const baseClass = `group rounded-2xl border border-border bg-white overflow-hidden transition-all hover:shadow-lg hover:border-foreground/10 ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {children}
      </Link>
    );
  }

  return <div className={baseClass}>{children}</div>;
}

export function CardImage({
  src,
  alt,
  aspect = "video",
}: {
  src: string;
  alt: string;
  aspect?: "video" | "square" | "wide";
}) {
  const aspectMap = {
    video: "aspect-video",
    square: "aspect-square",
    wide: "aspect-[2/1]",
  };

  return (
    <div className={`${aspectMap[aspect]} overflow-hidden bg-card`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
