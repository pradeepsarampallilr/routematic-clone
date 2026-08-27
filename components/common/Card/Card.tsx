import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}

export default function Card({ href, icon, title, description }: CardProps) {
  return (
    <Link href={href} className={styles.card}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.title}>{title}</span>
      <span className={styles.description}>{description}</span>
    </Link>
  );
}
