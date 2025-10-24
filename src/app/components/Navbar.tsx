"use client";

import React from 'react';
import styles from "@/styles/components/Navbar.module.scss";
import Button from './Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function Navbar() {
  const router = useRouter();
  
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContent}>
        <Link href="/">
          <div className={styles.leftSection}>
            <div className={styles.logo}>
            </div>
            <span className={styles.brandText}>RUNTIME</span>
          </div>
        </Link>

        <div className={styles.rightSection}>
          <Button text="Login" style="transparent" size="m" action={() => router.push("/login")} />
          <Button text="Sign Up" style="red" size="m" action={() => router.push("/signup")} />
        </div>
      </div>
    </nav>
  )
}

export default Navbar;