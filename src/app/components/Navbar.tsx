// src/components/Navbar.tsx
import React from 'react';
import styles from "@/styles/components/Navbar.module.scss";
import Button from './Button';

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContent}>
        <div className={styles.leftSection}>
          <div className={styles.logo}>
          </div>
          <span className={styles.brandText}>RUNTIME</span>
        </div>

        <div className={styles.rightSection}>
          <Button text="Start Monitoring Now" style="red" />
        </div>
      </div>
    </nav>
  )
}

export default Navbar;